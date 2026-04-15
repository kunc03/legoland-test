<template>
  <div class="camera-page">
    <!-- Top Controls Bar -->
    <div class="camera-controls-top">
      <HeaderBar hasBack>
        <p
          style="text-shadow: 0 3px 3px rgba(0, 0, 0, 0.16)"
          class="text-exd-gray-scorpion font-bold text-exd-1824.52"
        >
          {{ $t('camera') }}
        </p>
      </HeaderBar>

      <div class="camera-controls-right">
        <!-- Camera Switch Button -->
        <button
          class="camera-control-btn"
          @click="switchCamera"
          :title="$t('switchCamera')"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path
              d="M11 19H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h5l2-2h6l2 2h1a2 2 0 0 1 2 2v4"
            />
            <circle cx="12" cy="12" r="3" />
            <path d="M17 22v-6" />
            <path d="M14 19l3-3 3 3" />
          </svg>
        </button>

        <!-- Flashlight Toggle Button -->
        <button
          v-if="torchSupported"
          class="camera-control-btn"
          :class="{ active: torchActive }"
          @click="toggleTorch"
          :title="$t('flashlight')"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            :stroke="torchActive ? '#fbbf24' : 'white'"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Camera Stream -->
    <div class="camera-stream-wrapper">
      <QrcodeStream
        ref="refQrcodeStream"
        :constraints="selectedConstraints"
        :track="trackFunctionSelected.value"
        :formats="selectedBarcodeFormats"
        :paused="paused"
        :torch="torchActive"
        @detect="onDetect"
        @error="onError"
        @camera-on="onCameraReady"
        @camera-off="onCameraOff"
        :style="{
          transform: shouldUnmirror ? 'scaleX(-1)' : 'none',
          WebkitTransform: shouldUnmirror ? 'scaleX(-1)' : 'none',
          transformOrigin: 'center center',
        }"
      />

      <div v-if="!cameraReady && !paused && !error" class="camera-loading">
        <LoadingIcon />
        <p class="camera-loading-text">Memuat kamera...</p>
      </div>

      <div v-if="isLoading" class="camera-loading">
        <LoadingIcon />
        <p class="camera-loading-text">Loading...</p>
      </div>

      <!-- Viewfinder Overlay -->
      <div class="viewfinder-overlay" v-if="!paused">
        <div class="viewfinder-frame">
          <div class="viewfinder-corner top-left"></div>
          <div class="viewfinder-corner top-right"></div>
          <div class="viewfinder-corner bottom-left"></div>
          <div class="viewfinder-corner bottom-right"></div>
          <div class="viewfinder-scan-line"></div>
        </div>
        <p class="viewfinder-hint">{{ $t('scanQRCode') }}</p>
      </div>
    </div>

    <!-- Low-light Tip Banner -->
    <Transition name="fade">
      <div
        v-if="showLowLightTip && torchSupported && !torchActive"
        class="low-light-tip"
      >
        <span>💡 {{ $t('lowLightTip') }}</span>
        <button class="tip-dismiss" @click="showLowLightTip = false">✕</button>
      </div>
    </Transition>

    <!-- Error Banner -->
    <Transition name="fade">
      <div v-if="error" class="error-banner">
        <span>⚠️ {{ error }}</span>
        <button class="tip-dismiss" @click="error = ''">✕</button>
      </div>
    </Transition>

    <!-- Scan Result Drawer -->
    <Drawer
      v-model:visible="drawerVisible"
      :header="$t('scanResults')"
      position="bottom"
      :modal="false"
      style="height: auto; max-height: 30vh"
      pt:root:class="camera-drawer bg-white text-exd-dark-grey"
    >
      <div class="flex flex-col gap-3 overflow-hidden">
        <div
          v-for="(result, index) in scanResult"
          :key="index"
          @click="handleRedirect(result)"
          class="rounded-lg border bg-white p-3 inline-flex gap-2 border-b border-b-exd-light-grey w-100 relative cursor-pointer overflow-hidden pr-6"
        >
          <p class="text-exd-gray-scorpion font-semibold truncate">
            {{ result }}
          </p>
          <div class="!absolute !right-3 !top-1/2 !transform !-translate-y-1/2">
            <img
              v-if="isValidLink(result)"
              :src="arrow"
              alt="arrow"
              width="10"
              height="10"
              preload=""
              class="invert"
            />
          </div>
        </div>
      </div>
    </Drawer>
  </div>
</template>

<script setup>
import { QrcodeStream } from 'vue-qrcode-reader'
import LoadingIcon from '~/components/LoadingIcon.vue'
import arrow from '~/assets/images/arrow.svg'

const { setScanVerified, clearScanVerified } = useGachaVerification()
const config = useRuntimeConfig()

const refQrcodeStream = ref(null)
const paused = ref(false)
const drawerVisible = ref(false)
const scanResult = ref([])

// Torch / Flashlight
const torchActive = ref(false)
const torchSupported = ref(true) // assume supported, hide if error

// Camera facing
const isFrontCamera = ref(false)
const cameraDevices = ref([])
const selectedDeviceId = ref(null)
const cameraReady = ref(false)
const streamFacingMode = ref(null)
const hasUserSelectedCamera = ref(false)

const settings = useState('settings')
const isLoading = ref(false)

const getQrcodeVideoTrack = () => {
  if (typeof window === 'undefined') return null
  const rootEl = refQrcodeStream.value?.$el ?? refQrcodeStream.value
  const videoEl = rootEl?.querySelector?.('video')
  return videoEl?.srcObject?.getVideoTracks?.()?.[0] ?? null
}

const syncStreamSettings = async () => {
  if (typeof window === 'undefined') return

  await nextTick()
  const track = getQrcodeVideoTrack()
  const settings = track?.getSettings?.()

  streamFacingMode.value = settings?.facingMode ?? null

  const deviceId = settings?.deviceId ?? null
  if (deviceId && cameraDevices.value.some((d) => d.deviceId === deviceId)) {
    selectedDeviceId.value = deviceId
  }
}

const pickPreferredCameraDeviceId = (devices) => {
  const withLabel = devices.filter((d) => (d.label ?? '').trim().length > 0)
  const back =
    withLabel.find((d) => /back|rear|environment/i.test(d.label)) ?? null
  if (back?.deviceId) return back.deviceId

  const front =
    withLabel.find((d) => /front|user|selfie|facetime/i.test(d.label)) ?? null
  if (front?.deviceId && devices.length === 1) return front.deviceId

  return devices[devices.length - 1]?.deviceId ?? null
}

const refreshCameraDevices = async () => {
  if (typeof window === 'undefined') return
  if (!navigator?.mediaDevices?.enumerateDevices) return

  const devices = await navigator.mediaDevices.enumerateDevices()
  cameraDevices.value = devices.filter((d) => d.kind === 'videoinput')

  const hasSelectedInList =
    selectedDeviceId.value &&
    cameraDevices.value.some((d) => d.deviceId === selectedDeviceId.value)

  if (!hasUserSelectedCamera.value) {
    const preferred = pickPreferredCameraDeviceId(cameraDevices.value)
    if (preferred) {
      selectedDeviceId.value = preferred
      return
    }
  }

  if (!hasSelectedInList) {
    selectedDeviceId.value = cameraDevices.value[0]?.deviceId ?? null
  }
}

// Low-light tip
const showLowLightTip = ref(true)

// Error display
const error = ref('')



definePageMeta({
  middleware: 'auth',
})

const paintOutline = (detectedCodes, ctx) => {
  for (const detectedCode of detectedCodes) {
    const [firstPoint, ...otherPoints] = detectedCode.cornerPoints

    ctx.strokeStyle = '#D7A237'
    ctx.lineWidth = 3

    ctx.beginPath()
    ctx.moveTo(firstPoint.x, firstPoint.y)
    for (const { x, y } of otherPoints) {
      ctx.lineTo(x, y)
    }
    ctx.lineTo(firstPoint.x, firstPoint.y)
    ctx.closePath()
    ctx.stroke()
  }
}

// Higher resolution for better accuracy
const selectedConstraints = computed(() => {
  const base = {
    width: { ideal: 1920 },
    height: { ideal: 1080 },
    aspectRatio: { ideal: 16 / 9 },
    frameRate: { ideal: 30, max: 60 },
    resizeMode: 'none',
  }

  // Best effort for hardware features
  const advanced = [
    { focusMode: 'continuous' },
    { exposureMode: 'continuous' },
    { whiteBalanceMode: 'continuous' },
    { sharpness: 100 },
  ]

  if (selectedDeviceId.value) {
    return {
      ...base,
      deviceId: { exact: selectedDeviceId.value },
    }
  }

  return {
    ...base,
    facingMode: isFrontCamera.value ? 'user' : 'environment',
    advanced,
  }
})

const trackFunctionSelected = ref({ text: 'outline', value: paintOutline })
const selectedBarcodeFormats = ref(['qr_code'])
const shouldUnmirror = computed(() => {
  if (streamFacingMode.value === 'user') return true
  if (streamFacingMode.value === 'environment') return false
  const label =
    cameraDevices.value.find((d) => d.deviceId === selectedDeviceId.value)
      ?.label ?? ''
  if (/front|user|selfie|facetime/i.test(label)) return true
  if (/back|rear|environment/i.test(label)) return false
  return isFrontCamera.value
})

// Camera ready handler — check torch support
const onCameraReady = (capabilities) => {
  // capabilities is the MediaTrackCapabilities object
  cameraReady.value = true
  if (capabilities && capabilities.torch !== undefined) {
    torchSupported.value = true
  } else {
    torchSupported.value = false
  }
  refreshCameraDevices().finally(() => {
    setTimeout(syncStreamSettings, 0)
  })
}

const onCameraOff = () => {
  if (!paused.value) {
    cameraReady.value = false
  }
}

const toggleTorch = () => {
  torchActive.value = !torchActive.value
  if (torchActive.value) {
    showLowLightTip.value = false
  }
}

const switchCamera = () => {
  hasUserSelectedCamera.value = true
  torchActive.value = false
  drawerVisible.value = false
  paused.value = false
  cameraReady.value = false

  if (cameraDevices.value.length > 1) {
    const idx = cameraDevices.value.findIndex(
      (d) => d.deviceId === selectedDeviceId.value
    )
    const nextIdx = idx >= 0 ? (idx + 1) % cameraDevices.value.length : 0
    selectedDeviceId.value = cameraDevices.value[nextIdx]?.deviceId ?? null
  } else {
    selectedDeviceId.value = null
    isFrontCamera.value = !isFrontCamera.value
  }

  setTimeout(syncStreamSettings, 0)
}

const onDetect = (data) => {
  if (!data || data.length === 0) return

  // Haptic feedback on successful scan
  if (navigator.vibrate) {
    navigator.vibrate(200)
  }

  scanResult.value = data.map((i) => i.rawValue)
  paused.value = true
  drawerVisible.value = true
}

function onError(err) {
  error.value = `[${err.name}]: `
  cameraReady.value = false

  if (err.name === 'NotAllowedError') {
    error.value += 'you need to grant camera access permission'
  } else if (err.name === 'NotFoundError') {
    error.value += 'no camera on this device'
  } else if (err.name === 'NotSupportedError') {
    error.value += 'secure context required (HTTPS, localhost)'
  } else if (err.name === 'NotReadableError') {
    error.value += 'is the camera already in use?'
  } else if (err.name === 'OverconstrainedError') {
    error.value += 'installed cameras are not suitable'
  } else if (err.name === 'StreamApiNotSupportedError') {
    error.value += 'Stream API is not supported in this browser'
  } else if (err.name === 'InsecureContextError') {
    error.value +=
      'Camera access is only permitted in secure context. Use HTTPS or localhost rather than HTTP.'
  } else {
    error.value += err.message
  }

  // If torch causes error, mark unsupported
  if (err.name === 'OverconstrainedError') {
    torchSupported.value = false
    torchActive.value = false
  }
}

const isValidLink = (url) => {
  const regex = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/[^\s]*)?$/
  return regex.test(url)
}

const { encryptData } = useEncryption()

const handleRedirect = (url) => {
  isLoading.value = true
  clearScanVerified()
  sessionStorage.removeItem('IS_ALREADY_SPIN')
  sessionStorage.removeItem('SPIN_TYPE')
  sessionStorage.removeItem('READY_SPIN_AFTER_DATE')
  const slug = url.split('/').pop() 
  setScanVerified(slug) 

  setTimeout(() => {
    isLoading.value = false
    window.location.href = url
    isLoading.value = false
  }, 1000)
}

watch(drawerVisible, (value) => {
  if (!value) {
    paused.value = false
  }
})
</script>

<style scoped>
.camera-page {
  width: 100%;
  height: 100dvh;
  position: relative;
  z-index: 0;
  background: #000;
  overflow: hidden;
}

/* Top Controls */
.camera-controls-top {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 16px;
  padding-top: max(16px, env(safe-area-inset-top));
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.6), transparent);
}

.camera-controls-right {
  display: flex;
  gap: 12px;
  align-items: center;
}

.camera-btn {
  background: rgba(255, 255, 255, 0.15) !important;
  backdrop-filter: blur(8px);
  border: none;
  border-radius: 12px;
  padding: 4px;
  cursor: pointer;
}

.camera-control-btn {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.camera-control-btn:active {
  transform: scale(0.9);
}

.camera-control-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.camera-control-btn.active {
  background: rgba(251, 191, 36, 0.3);
  border-color: #fbbf24;
  box-shadow: 0 0 16px rgba(251, 191, 36, 0.4);
}

/* Camera Stream */
.camera-stream-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
}

:global(.camera-drawer.p-drawer) {
  width: 100%;
  max-width: 28rem;
  left: 0;
  right: 0;
  margin-left: auto;
  margin-right: auto;
}

.camera-loading {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
  justify-content: center;
  z-index: 6;
  background: rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(2px);
}

.camera-loading-text {
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  font-weight: 600;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.6);
}

:deep(.qrcode-stream) {
  width: 100%;
  height: 100%;
}

:deep(.qrcode-stream video),
:deep(.qrcode-stream canvas) {
  width: 100%;
  height: 100%;
  object-fit: cover;
  image-rendering: -webkit-optimize-contrast;
  image-rendering: crisp-edges;
  backface-visibility: hidden;
  transform: translateZ(0);
}

/* Viewfinder Overlay */
.viewfinder-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 5;
}

.viewfinder-frame {
  width: 260px;
  height: 260px;
  position: relative;
}

.viewfinder-corner {
  position: absolute;
  width: 32px;
  height: 32px;
  border-color: #fbbf24;
  border-style: solid;
}

.viewfinder-corner.top-left {
  top: 0;
  left: 0;
  border-width: 4px 0 0 4px;
  border-radius: 8px 0 0 0;
}

.viewfinder-corner.top-right {
  top: 0;
  right: 0;
  border-width: 4px 4px 0 0;
  border-radius: 0 8px 0 0;
}

.viewfinder-corner.bottom-left {
  bottom: 0;
  left: 0;
  border-width: 0 0 4px 4px;
  border-radius: 0 0 0 8px;
}

.viewfinder-corner.bottom-right {
  bottom: 0;
  right: 0;
  border-width: 0 4px 4px 0;
  border-radius: 0 0 8px 0;
}

/* Scan line animation */
.viewfinder-scan-line {
  position: absolute;
  top: 0;
  left: 8px;
  right: 8px;
  height: 2px;
  background: linear-gradient(
    90deg,
    transparent,
    #fbbf24,
    #fbbf24,
    transparent
  );
  box-shadow: 0 0 8px rgba(251, 191, 36, 0.6);
  animation: scan-line 2.5s ease-in-out infinite;
  will-change: transform;
}

@keyframes scan-line {
  0%,
  100% {
    transform: translateY(8px);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  50% {
    transform: translateY(250px);
    opacity: 1;
  }
  60% {
    opacity: 0;
  }
}

.viewfinder-hint {
  margin-top: 24px;
  color: rgba(255, 255, 255, 0.85);
  font-size: 14px;
  text-align: center;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.6);
  padding: 0 16px;
}

/* Low-light Tip */
.low-light-tip {
  position: absolute;
  bottom: max(32px, env(safe-area-inset-bottom, 16px));
  left: 16px;
  right: 16px;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 12px 16px;
  background: rgba(251, 191, 36, 0.2);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(251, 191, 36, 0.4);
  border-radius: 12px;
  color: #fef3c7;
  font-size: 14px;
}

/* Error Banner */
.error-banner {
  position: absolute;
  bottom: max(32px, env(safe-area-inset-bottom, 16px));
  left: 16px;
  right: 16px;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 12px 16px;
  background: rgba(239, 68, 68, 0.2);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(239, 68, 68, 0.4);
  border-radius: 12px;
  color: #fecaca;
  font-size: 14px;
}

.tip-dismiss {
  background: none;
  border: none;
  color: inherit;
  font-size: 18px;
  cursor: pointer;
  padding: 0 4px;
  opacity: 0.7;
  flex-shrink: 0;
}

.tip-dismiss:hover {
  opacity: 1;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>  