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
    <div 
      class="camera-stream-wrapper"
      @touchstart="onTouchStart"
      @touchmove="onTouchMove"
      @touchend="onTouchEnd"
      @touchcancel="onTouchEnd"
      @click="onCameraClick"
    >
      <ClientOnly>
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
        <template #fallback>
          <div class="camera-loading z-6">
            <LoadingIcon />
            <p class="camera-loading-text">Memuat kamera...</p>
          </div>
        </template>
      </ClientOnly>

      <!-- Focus Ring UI -->
      <div 
        v-if="focusPoint.visible" 
        class="focus-ring"
        :style="{ left: focusPoint.x + 'px', top: focusPoint.y + 'px' }"
      ></div>

      <div v-if="!cameraReady && !paused && !error" class="camera-loading z-6">
        <LoadingIcon />
        <p class="camera-loading-text">Memuat kamera...</p>
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

    <!-- Zoom Slider UI -->
    <div v-if="zoomSupported && !paused && cameraReady" class="zoom-slider-container">
      <input 
        type="range" 
        class="zoom-slider" 
        :min="zoomMin" 
        :max="zoomMax" 
        :step="zoomStep" 
        v-model.number="zoom" 
      />
      <div class="zoom-text">{{ Number(zoom).toFixed(1) }}x</div>
    </div>

    <!-- Low-light Tip Banner -->
    <Transition name="fade">
      <div
        v-if="showLowLightTip && torchSupported && !torchActive && !isLoading"
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
      :dismissable="!isLoading"
      :closable="!isLoading"
      style="height: auto; max-height: 30vh"
      pt:root:class="camera-drawer bg-white text-exd-dark-grey"
      :pt="{
        closeButton: {
          class: isLoading ? 'pointer-events-none opacity-90' : '',
          disabled: isLoading
        },
        header: {
          style: isLoading ? 'pointer-events: none;' : ''
        },
        root: {
          style: isLoading ? 'pointer-events: none;' : ''
        }
      }"
    >
      <div 
        class="flex flex-col gap-3 overflow-hidden relative"
        :class="{ 'pointer-events-none select-none': isLoading }"
      >
        
        <div 
          v-if="isLoading" 
          class="absolute inset-0 z-[999] bg-white/60 cursor-wait"
          @click.stop.prevent
          @mousedown.stop.prevent
          @touchstart.stop.prevent
        ></div>

        <div
          v-for="(result, index) in scanResult"
          :key="index"
          @click="!isLoading && handleRedirect(result)"
          class="rounded-lg border bg-white py-6 px-4 flex items-center justify-between border-b border-b-exd-light-grey w-full relative overflow-hidden"
          :class="[
            isLoading ? 'opacity-50 cursor-wait' : 'cursor-pointer active:bg-gray-100'
          ]"
        >
          <p class="text-exd-gray-scorpion font-semibold truncate flex-1 min-w-0 pr-6">
            {{ result }}
          </p>
          <div class="!absolute !right-3 !top-1/2 !transform !-translate-y-1/2">
            <img
              v-if="isValidLink(result)"
              :src="arrow"
              alt="arrow"
              width="10"
              height="10"
              class="invert"
            />
          </div>
        </div>
      </div>
    </Drawer>

    <div 
        v-if="isLoading" 
        class="fixed inset-0 bg-black/50 flex flex-col items-center justify-center gap-3 z-[9999]"
      >
        <LoadingIcon />
        <p class="text-white font-semibold">Loading...</p>
      </div>
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

// Zoom Management
const zoom = ref(1)
const zoomMin = ref(1)
const zoomMax = ref(1)
const zoomStep = ref(0.1)
const zoomSupported = ref(false)
const initialPinchDistance = ref(null)
const initialZoomAtPinchStart = ref(1)

// Click-to-focus
const focusPoint = ref({ x: 0, y: 0, visible: false })
let focusTimeout = null

const onCameraClick = async (e) => {
  // Show UI focus ring
  focusPoint.value = { x: e.clientX, y: e.clientY, visible: true }
  if (focusTimeout) clearTimeout(focusTimeout)
  focusTimeout = setTimeout(() => {
    focusPoint.value.visible = false
  }, 1000)

  // Apply native autofocus hunt
  const track = getQrcodeVideoTrack()
  if (!track) return

  try {
    const caps = track.getCapabilities ? track.getCapabilities() : {}
    if (!caps.focusMode) return

    // Calculate normalized point based on client click vs element dimensions rect
    const rect = e.currentTarget.getBoundingClientRect()
    const normX = (e.clientX - rect.left) / rect.width
    const normY = (e.clientY - rect.top) / rect.height

    if (caps.focusMode.includes('single-shot')) {
      try {
        await track.applyConstraints({
          advanced: [{ focusMode: 'single-shot', pointsOfInterest: [{ x: normX, y: normY }] }]
        })
      } catch (e1) {
        // Fallback without pointsOfInterest
        await track.applyConstraints({ advanced: [{ focusMode: 'single-shot' }] })
      }

      // Restore to continuous focus after hunting completes
      setTimeout(async () => {
        if (caps.focusMode.includes('continuous')) {
          await track.applyConstraints({ advanced: [{ focusMode: 'continuous' }] })
        }
      }, 2000)
    }
  } catch (err) {
    console.warn('Click-to-focus error:', err)
  }
}

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
  const capabilities = track?.getCapabilities?.()

  // Zoom Handling
  if (capabilities?.zoom) {
    zoomSupported.value = true
    zoomMin.value = capabilities.zoom.min || 1
    zoomMax.value = capabilities.zoom.max || 10
    zoomStep.value = capabilities.zoom.step || 0.1
    zoom.value = settings?.zoom || capabilities.zoom.min || 1
  } else {
    zoomSupported.value = false
  }

  // Prefer facingMode from settings; fallback to label heuristics
  let facing = settings?.facingMode ?? null
  if (!facing && track?.label) {
    const label = track.label
    if (/front|user|selfie|facetime/i.test(label)) facing = 'user'
    else if (/back|rear|environment/i.test(label)) facing = 'environment'
  }
  streamFacingMode.value = facing

  const deviceId = settings?.deviceId ?? null
  if (deviceId && cameraDevices.value.some((d) => d.deviceId === deviceId)) {
    selectedDeviceId.value = deviceId
  }
}

const applyZoom = async (newZoom) => {
  const track = getQrcodeVideoTrack()
  if (!track || !zoomSupported.value) return
  try {
    await track.applyConstraints({
      advanced: [{ zoom: newZoom }]
    })
  } catch (err) {
    console.error('Failed to apply zoom constraints:', err)
  }
}

watch(zoom, (newVal) => {
  if (zoomSupported.value) {
    applyZoom(newVal)
  }
})

const onTouchStart = (e) => {
  if (e.touches.length === 2 && zoomSupported.value) {
    const t1 = e.touches[0]
    const t2 = e.touches[1]
    initialPinchDistance.value = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY)
    initialZoomAtPinchStart.value = zoom.value
  }
}

const onTouchMove = (e) => {
  if (e.touches.length === 2 && initialPinchDistance.value && zoomSupported.value) {
    const t1 = e.touches[0]
    const t2 = e.touches[1]
    const distance = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY)
    const ratio = distance / initialPinchDistance.value
    
    let newZoom = initialZoomAtPinchStart.value * ratio
    newZoom = Math.max(zoomMin.value, Math.min(newZoom, zoomMax.value))
    zoom.value = Number(newZoom.toFixed(1))
  }
}

const onTouchEnd = (e) => {
  if (e.touches.length < 2) {
    initialPinchDistance.value = null
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
  ssr: false,
})

const paintOutline = (detectedCodes, ctx) => {
  for (const detectedCode of detectedCodes) {
    const [firstPoint, ...otherPoints] = detectedCode.cornerPoints
    const rawValue = detectedCode.rawValue

    ctx.strokeStyle = '#fbbf24'
    ctx.lineWidth = 3

    ctx.beginPath()
    ctx.moveTo(firstPoint.x, firstPoint.y)
    for (const { x, y } of otherPoints) {
      ctx.lineTo(x, y)
    }
    ctx.lineTo(firstPoint.x, firstPoint.y)
    ctx.closePath()
    ctx.stroke()

    // Draw text url exactly below the detected barcode
    if (rawValue) {
      const minX = Math.min(firstPoint.x, ...otherPoints.map(p => p.x))
      const maxX = Math.max(firstPoint.x, ...otherPoints.map(p => p.x))
      const minY = Math.min(firstPoint.y, ...otherPoints.map(p => p.y))
      const maxY = Math.max(firstPoint.y, ...otherPoints.map(p => p.y))
      
      const centerX = minX + (maxX - minX) / 2
      const centerY = minY + (maxY - minY) / 2

      ctx.save()
      // Translate to the center of the text so we can flip it horizontally
      ctx.translate(centerX, centerY)
      // Un-mirror text if the stream is currently mirrored
      if (shouldUnmirror.value) {
        ctx.scale(-1, 1)
      }

      ctx.font = '600 16px "Inter", "Segoe UI", sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      
      const barcodeWidth = maxX - minX
      const paddingX = 10
      const paddingY = 15
      
      // Limit the width and ensure it doesn't span beyond the barcode box
      const maxWidth = Math.max(barcodeWidth - (paddingX * 2) - 8, 30)
      
      let displayText = rawValue
      if (ctx.measureText(displayText).width > maxWidth) {
        let ellipsis = '...'
        // Find maximum characters that fit along with ellipsis
        while (displayText.length > 0 && ctx.measureText(displayText + ellipsis).width > maxWidth) {
          displayText = displayText.slice(0, -1)
        }
        if (displayText.length > 0) displayText += ellipsis
      }

      const textWidth = ctx.measureText(displayText).width
      
      const rectHeight = 16 + paddingY * 2
      const rectRadius = rectHeight / 2
      
      // Draw modern background capsule in pure white
      ctx.fillStyle = '#ffffff'
      if (ctx.roundRect) {
        ctx.beginPath()
        ctx.roundRect(-textWidth / 2 - paddingX, -8 - paddingY, textWidth + paddingX * 2, rectHeight, rectRadius)
        
        ctx.shadowColor = 'rgba(0,0,0,0.15)'
        ctx.shadowBlur = 10
        ctx.shadowOffsetY = 4
        ctx.fill()
      } else {
        ctx.fillRect(-textWidth / 2 - paddingX, -8 - paddingY, textWidth + paddingX * 2, rectHeight)
      }
      
      // Draw crisp text (dark for white background)
      ctx.fillStyle = '#374151' // gray-700
      ctx.shadowColor = 'transparent'
      ctx.shadowBlur = 0
      ctx.shadowOffsetY = 0
      ctx.fillText(displayText, 0, 0)

      ctx.restore()
    }
  }
}

// Higher resolution for better accuracy
const selectedConstraints = computed(() => {
  const base = {
    width: { min: 1280, ideal: 3840 },
    height: { min: 720, ideal: 2160 },
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

// Detect if running on a desktop/laptop (no multi-touch = likely no back camera)
const isDesktopDevice = typeof navigator !== 'undefined'
  ? navigator.maxTouchPoints === 0
  : false

const shouldUnmirror = computed(() => {
  // Explicit facing mode from stream (most reliable)
  if (streamFacingMode.value === 'user') return true
  if (streamFacingMode.value === 'environment') return false

  // Label-based detection
  const label =
    cameraDevices.value.find((d) => d.deviceId === selectedDeviceId.value)
      ?.label ?? ''
  if (/front|user|selfie|facetime/i.test(label)) return true
  if (/back|rear|environment/i.test(label)) return false

  // On desktop/laptop: webcam is always front-facing → unmirror
  if (isDesktopDevice) return true

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

  scanResult.value = data.map((i) => {
    const url = i.rawValue
    handleRedirect(url)
  })
  paused.value = true
  // drawerVisible.value = true
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

  window.location.href = url
  // setTimeout(() => {
  //   window.location.href = url
  // }, 1000)
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
  touch-action: none;
}

/* Focus Ring */
.focus-ring {
  position: absolute;
  width: 60px;
  height: 60px;
  border: 2px solid #fbbf24;
  border-radius: 50%;
  transform: translate(-50%, -50%) scale(1.5);
  pointer-events: none;
  z-index: 20;
  box-shadow: 0 0 8px rgba(0,0,0,0.3);
  animation: focus-pulse 1s ease-out forwards;
}

@keyframes focus-pulse {
  0% { transform: translate(-50%, -50%) scale(1.5); opacity: 0; border-width: 1px; }
  20% { transform: translate(-50%, -50%) scale(1); opacity: 0.8; border-width: 2px; }
  80% { transform: translate(-50%, -50%) scale(1); opacity: 0.8; border-width: 2px; }
  100% { transform: translate(-50%, -50%) scale(1.1); opacity: 0; border-width: 1px; }
}

/* Zoom Slider UI */
.zoom-slider-container {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  background: rgba(0, 0, 0, 0.4);
  padding: 16px 8px;
  border-radius: 20px;
  backdrop-filter: blur(4px);
}

.zoom-slider {
  writing-mode: bt-lr; /* IE */
  -webkit-appearance: slider-vertical; /* WebKit */
  appearance: slider-vertical;
  width: 8px;
  height: 150px;
  outline: none;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
}

.zoom-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #fbbf24;
  cursor: pointer;
  box-shadow: 0 0 8px rgba(251, 191, 36, 0.6);
}

.zoom-slider::-moz-range-thumb {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #fbbf24;
  cursor: pointer;
  box-shadow: 0 0 8px rgba(251, 191, 36, 0.6);
  border: none;
}

.zoom-text {
  color: white;
  font-size: 14px;
  font-weight: 600;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.6);
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