<template>
  <HeaderBar hasBack>
    <p
      style="text-shadow: 0 3px 3px rgba(0, 0, 0, 0.16)"
      class="text-exd-gray-scorpion font-bold text-exd-1824.52"
    >
      {{ $t('camera') }}
    </p>
  </HeaderBar>
  <div class="camera-page">
    <!-- Top Controls Bar -->
    <div class="camera-controls-top">

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
            transform: `scale(${hasNativeZoom ? 1 : zoom}) ${shouldUnmirror ? 'scaleX(-1)' : 'scaleX(1)'}`,
            WebkitTransform: `scale(${hasNativeZoom ? 1 : zoom}) ${shouldUnmirror ? 'scaleX(-1)' : 'scaleX(1)'}`,
            transformOrigin: 'center center',
            transition: isPinching ? 'none' : 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            willChange: 'transform'
          }"
        />
        <template #fallback>
          <div class="camera-loading z-6">
            <LoadingIcon />
            <p class="camera-loading-text">{{ $t('startingCamera') }}</p>
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
        <p class="camera-loading-text">{{ $t('startingCamera') }}</p>
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
    <!-- <div v-if="zoomSupported && !paused && cameraReady" class="zoom-slider-container">
      <input 
        type="range" 
        class="zoom-slider" 
        :min="zoomMin" 
        :max="zoomMax" 
        :step="zoomStep" 
        v-model.number="zoom" 
      />
      <div class="zoom-text">{{ Number(zoom).toFixed(1) }}x</div>
    </div> -->

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

  <Dialog
    v-model:visible="isNotAllowed"
    modal
    class="!w-11/12 !max-w-sm border border-exd-gray-44"
    :style="{
      background: settings?.global?.modal?.background_color,
    }"
  >
    <template #container>
      <img
        :src="close"
        alt="close"
        width="30"
        height="30"
        preload
        class="absolute z-50 cursor-pointer right-1 top-1"
        @click="handleClose"
      />
      <div
        class="flex flex-col items-center justify-center w-full gap-4 px-6 py-6"
      >
        <IconsWarning
          class="w-10 h-10"
          :style="{ color: settings?.global?.icon_color?.background }"
        />
        <div class="w-10/12 text-center">
          <p
            class="font-bold text-exd-1424"
            :style="{
              color: settings?.global?.modal?.text_color,
            }"
          >
            {{ errorMessages }}
          </p>
        </div>
        <SolidButton
          v-if="redirectLink"
          :label="$t('gacha')"
          variant="red-coral"
          :on-click="() => goToSpin(redirectLink)"
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { QrcodeStream } from 'vue-qrcode-reader'
import LoadingIcon from '~/components/LoadingIcon.vue'
import arrow from '~/assets/images/arrow.svg'
import close from '~/assets/images/close.svg'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'

// Device Detection
const isAndroid = typeof navigator !== 'undefined'
  ? /Android/i.test(navigator.userAgent)
  : false

const isIOS = typeof navigator !== 'undefined'
  ? /iPhone|iPad|iPod/.test(navigator.userAgent)
  : false

const isDesktopDevice = typeof navigator !== 'undefined'
  ? navigator.maxTouchPoints === 0
  : false

// Hooks & Composables
const { setScanVerified, clearScanVerified } = useGachaVerification()
const { t } = useI18n()
const route = useRoute()

// Settings & i18n
const settings = useState('settings')
const LOCALE = useCookie('LOCALE')

// Dialog State
const isNotAllowed = ref(false)
const errorMessages = ref('')
const redirectLink = ref('')

// Component State
const refQrcodeStream = ref(null)
const paused = ref(false)
const drawerVisible = ref(false)
const scanResult = ref([])
const isLoading = ref(false)
const error = ref('')

// Torch / Flashlight
const torchActive = ref(false)
const torchSupported = ref(true)

// Camera States
const isFrontCamera = ref(false)
const cameraDevices = ref([])
const selectedDeviceId = ref(null)
const cameraReady = ref(false)
const streamFacingMode = ref(null)
const hasUserSelectedCamera = ref(false)

// Zoom Management
const zoom = ref(1)
const zoomMin = ref(1)
const zoomMax = ref(1)
const zoomStep = ref(0.1)
const zoomSupported = ref(false)
const hasNativeZoom = ref(false)
const initialPinchDistance = ref(null)
const initialZoomAtPinchStart = ref(1)
const isPinching = ref(false)
const targetZoom = ref(1)
let rAFId = null

// Handle restoration from bfcache (Back-Forward Cache)
const handlePageShow = (event) => {
  if (event.persisted) {
    isLoading.value = false
    paused.value = false
  }
}

// Handle iOS Safari background/foreground — camera stream is killed by OS when backgrounded
const handleVisibilityChange = () => {
  if (document.visibilityState === 'visible') {
    // If isLoading was stuck true (e.g. API call interrupted by backgrounding), reset it
    if (isLoading.value) {
      isLoading.value = false
    }
  }
}

// Safety timeout for isLoading to prevent permanent stuck state
let isLoadingTimeout = null

const setLoadingWithTimeout = (value) => {
  isLoading.value = value
  if (isLoadingTimeout) clearTimeout(isLoadingTimeout)
  if (value) {
    isLoadingTimeout = setTimeout(() => {
      if (isLoading.value) {
        isLoading.value = false
      }
    }, 15000) // Auto-reset after 15 seconds
  }
}

onMounted(() => {
  // Ensure state is clean on mount
  isLoading.value = false
  paused.value = false
  window.addEventListener('pageshow', handlePageShow)
  document.addEventListener('visibilitychange', handleVisibilityChange)
})

onUnmounted(() => {
  window.removeEventListener('pageshow', handlePageShow)
  document.removeEventListener('visibilitychange', handleVisibilityChange)
  if (isLoadingTimeout) clearTimeout(isLoadingTimeout)
  if (rAFId) cancelAnimationFrame(rAFId)
})

// Click-to-focus UI
const focusPoint = ref({ x: 0, y: 0, visible: false })
let focusTimeout = null

const onCameraClick = async (e) => {
  focusPoint.value = { x: e.clientX, y: e.clientY, visible: true }
  if (focusTimeout) clearTimeout(focusTimeout)
  focusTimeout = setTimeout(() => {
    focusPoint.value.visible = false
  }, 1000)

  const track = getQrcodeVideoTrack()
  if (!track) return

  try {
    const caps = track.getCapabilities ? track.getCapabilities() : {}
    if (!caps.focusMode) return

    const rect = e.currentTarget.getBoundingClientRect()
    let normX = (e.clientX - rect.left) / rect.width
    let normY = (e.clientY - rect.top) / rect.height

    if (!hasNativeZoom.value && zoom.value > 1) {
      normX = (0.5 - 0.5 / zoom.value) + (normX / zoom.value)
      normY = (0.5 - 0.5 / zoom.value) + (normY / zoom.value)
    }

    if (caps.focusMode.includes('single-shot')) {
      try {
        await track.applyConstraints({
          advanced: [{ focusMode: 'single-shot', pointsOfInterest: [{ x: normX, y: normY }] }]
        })
      } catch (e1) {
        await track.applyConstraints({ advanced: [{ focusMode: 'single-shot' }] })
      }

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
  const trackSettings = track?.getSettings?.()
  const capabilities = track?.getCapabilities?.()

  if (capabilities?.zoom) {
    hasNativeZoom.value = true
    zoomSupported.value = true
    zoomMin.value = capabilities.zoom.min || 1
    zoomMax.value = capabilities.zoom.max || 10
    zoomStep.value = capabilities.zoom.step || 0.1
    zoom.value = trackSettings?.zoom || capabilities.zoom.min || 1
  } else {
    hasNativeZoom.value = false
    zoomSupported.value = true
    zoomMin.value = 1
    zoomMax.value = 5 
    zoomStep.value = 0.1
  }

  let facing = trackSettings?.facingMode ?? null
  if (!facing && track?.label) {
    const label = track.label
    if (/front|user|selfie|facetime/i.test(label)) facing = 'user'
    else if (/back|rear|environment/i.test(label)) facing = 'environment'
  }
  streamFacingMode.value = facing

  const deviceId = trackSettings?.deviceId ?? null
  if (deviceId && cameraDevices.value.some((d) => d.deviceId === deviceId)) {
    selectedDeviceId.value = deviceId
  }
}

let isApplyingZoom = false
let pendingZoom = null

const applyZoom = async (newZoom) => {
  const track = getQrcodeVideoTrack()
  if (!track || !hasNativeZoom.value) return
  
  if (isApplyingZoom) {
    pendingZoom = newZoom
    return
  }
  
  isApplyingZoom = true
  try {
    await track.applyConstraints({
      advanced: [{ zoom: newZoom }]
    })
  } catch (err) {
    console.error('Failed to apply native zoom constraints:', err)
  } finally {
    isApplyingZoom = false
    if (pendingZoom !== null) {
      const nextZoom = pendingZoom
      pendingZoom = null
      applyZoom(nextZoom)
    }
  }
}

watch(zoom, (newVal) => {
  if (zoomSupported.value) {
    applyZoom(newVal)
  }
})

const onTouchStart = (e) => {
  if (e.touches.length === 2 && zoomSupported.value) {
    isPinching.value = true
    const t1 = e.touches[0]
    const t2 = e.touches[1]
    initialPinchDistance.value = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY)
    initialZoomAtPinchStart.value = zoom.value
    targetZoom.value = zoom.value
    startZoomPhysics()
  }
}

const onTouchMove = (e) => {
  if (e.touches.length === 2 && initialPinchDistance.value && zoomSupported.value) {
    const t1 = e.touches[0]
    const t2 = e.touches[1]
    const distance = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY)
    const ratio = distance / initialPinchDistance.value
    
    let newTarget = initialZoomAtPinchStart.value * ratio
    targetZoom.value = Math.max(zoomMin.value, Math.min(newTarget, zoomMax.value))
  }
}

const onTouchEnd = (e) => {
  if (e.touches.length < 2) {
    initialPinchDistance.value = null
    isPinching.value = false
    // Physics loop will stop itself when it reaches target
  }
}

const startZoomPhysics = () => {
  if (rAFId) cancelAnimationFrame(rAFId)
  
  const update = () => {
    // Lerp formula: current += (target - current) * damping
    const diff = targetZoom.value - zoom.value
    
    if (Math.abs(diff) > 0.001) {
      zoom.value += diff * 0.15 // Damping factor (0.1 - 0.2 is sweet spot)
      rAFId = requestAnimationFrame(update)
    } else {
      zoom.value = targetZoom.value
      rAFId = null
    }
  }
  
  rAFId = requestAnimationFrame(update)
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

const showLowLightTip = ref(true)

definePageMeta({
  middleware: 'auth',
  ssr: false,
})

const paintOutline = (detectedCodes, ctx) => {
  for (const detectedCode of detectedCodes) {
    const [firstPoint, ...otherPoints] = detectedCode.cornerPoints
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
  }
}

const selectedConstraints = computed(() => {
  let width = { min: 1280, ideal: 1920 }
  let height = { min: 720, ideal: 1080 }
  let frameRate = { ideal: 30, max: 60 }

  if (isIOS) {
    width = { min: 1280, ideal: 1920 }
    height = { min: 720, ideal: 1080 }
  } else if (isAndroid) {
    width = { min: 1280, ideal: 1280 }
    height = { min: 720, ideal: 720 }
    frameRate = { ideal: 30, max: 30 }
  }

  const base = {
    width,
    height,
    aspectRatio: { ideal: 16 / 9 },
    frameRate,
  }

  const advanced = isAndroid 
    ? [
        { focusMode: 'continuous' },
        { exposureMode: 'continuous' }
      ]
    : isIOS
    ? [
        { focusMode: 'continuous' },
        { exposureMode: 'continuous' },
      ]
    : [
        { focusMode: 'continuous' },
        { exposureMode: 'continuous' },
        { whiteBalanceMode: 'continuous' },
      ]

  if (selectedDeviceId.value) {
    return {
      ...base,
      deviceId: { exact: selectedDeviceId.value },
      advanced,
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
  if (isDesktopDevice) return true
  return isFrontCamera.value
})

const onCameraReady = (capabilities) => {
  cameraReady.value = true
  torchSupported.value = !!(capabilities && capabilities.torch !== undefined)
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
  if (navigator.vibrate) {
    navigator.vibrate(200)
  }
  const url = data[0].rawValue
  if (url) {
    handleRedirect(url)
  }
  scanResult.value = data.map((i) => i.rawValue)
  paused.value = true
}

function onError(err) {
  error.value = `[${err.name}]: `
  cameraReady.value = false
  isLoading.value = false
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
    // On OverconstrainedError, clear deviceId so QrcodeStream retries with facingMode fallback
    selectedDeviceId.value = null
  } else if (err.name === 'StreamApiNotSupportedError') {
    error.value += 'Stream API is not supported in this browser'
  } else if (err.name === 'InsecureContextError') {
    error.value += 'Camera access is only permitted in secure context.'
  } else {
    error.value += err.message
  }
  if (err.name === 'OverconstrainedError') {
    torchSupported.value = false
    torchActive.value = false
  }
}

const isValidLink = (url) => {
  const regex = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/[^\s]*)?$/
  return regex.test(url)
}

const handleClose = () => {
  isNotAllowed.value = false
  redirectLink.value = ''
  errorMessages.value = ''
  paused.value = false
}

const getSlugFromUrl = (url) => {
  try {
    if (/^https?:\/\//i.test(url)) {
      const urlObj = new URL(url)
      const segments = urlObj.pathname.split('/').filter(Boolean)
      return segments[segments.length - 1] || ''
    }
    return String(url).split('/').filter(Boolean).pop() || ''
  } catch (e) {
    return ''
  }
}

const doRedirect = (url) => {
  clearScanVerified()
  sessionStorage.removeItem('IS_ALREADY_SPIN')
  sessionStorage.removeItem('SPIN_TYPE')
  sessionStorage.removeItem('READY_SPIN_AFTER_DATE')
  
  const slug = getSlugFromUrl(url)
  if (slug) {
    localStorage.removeItem(`GACHA_FLOW_COMPLETED_${String(slug).toUpperCase()}`)
    setScanVerified(slug)
  }
  
  window.location.href = url
}

const handleRedirect = async (url) => {
  if (!url || isLoading.value) return
  setLoadingWithTimeout(true)

  try {
    let statusPath = ''
    let redirectUrl = url

    if (/^https?:\/\//i.test(url)) {
      const urlObj = new URL(url)
      const segments = urlObj.pathname.replace(/^\//, '').split('/').filter(Boolean)
      statusPath = segments.filter(s => s !== 'scan').join('/')
    } else {
      // Relative path or plain code
      const path = url.startsWith('/') ? url : `/scan/${url}`
      const segments = path.replace(/^\//, '').split('/').filter(Boolean)
      statusPath = segments.filter(s => s !== 'scan').join('/')
      
      // Ensure we have a full URL for redirect
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
      const absolutePath = path.startsWith('/scan') ? path : `/scan${path.startsWith('/') ? '' : '/'}${path}`
      redirectUrl = `${baseUrl}${absolutePath}`
    }

    if (!statusPath) {
      throw new Error('Invalid QR code')
    }

    const { checkStatus } = useGachaService()
    let response = null
    
    // Only fetch status if on the camera page and have a valid statusPath (location)
    if (route.path.startsWith('/camera') && statusPath) {
      response = await checkStatus(statusPath, { lang: LOCALE.value || 'en' })
    }

    if (response?.data?.can_spin === true) {
      doRedirect(redirectUrl)
    } else {
      isLoading.value = false
      errorMessages.value = response?.message || t('no_available_data')
      redirectLink.value = ''
      isNotAllowed.value = true
    }
  } catch (err) {
    console.error('[Camera] handleRedirect error:', err)
    isLoading.value = false
    errorMessages.value = err?._data?.message || err?.data?.message || t('no_available_data')
    redirectLink.value = ''
    isNotAllowed.value = true
  }
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

.camera-controls-top {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10000;
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

.camera-control-btn.active {
  background: rgba(251, 191, 36, 0.3);
  border-color: #fbbf24;
  box-shadow: 0 0 16px rgba(251, 191, 36, 0.4);
}

.camera-stream-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
  touch-action: none;
  overflow: hidden;
}

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

.zoom-slider-container {
  position: absolute;
  bottom: max(100px, env(safe-area-inset-bottom, 80px));
  left: 50%;
  transform: translateX(-50%);
  z-index: 20;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  width: 200px;
}

.zoom-slider {
  width: 100%;
  accent-color: #fbbf24;
}

.zoom-text {
  color: white;
  font-size: 12px;
  font-weight: bold;
  background: rgba(0,0,0,0.5);
  padding: 2px 8px;
  border-radius: 10px;
}

.camera-loading {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: #000;
}

.camera-loading-text {
  color: white;
  font-size: 14px;
}

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

.viewfinder-scan-line {
  position: absolute;
  top: 0;
  left: 8px;
  right: 8px;
  height: 2px;
  background: linear-gradient(90deg, transparent, #fbbf24, #fbbf24, transparent);
  box-shadow: 0 0 8px rgba(251, 191, 36, 0.6);
  animation: scan-line 2.5s ease-in-out infinite;
}

@keyframes scan-line {
  0%, 100% { transform: translateY(8px); opacity: 0; }
  10% { opacity: 1; }
  50% { transform: translateY(250px); opacity: 1; }
  60% { opacity: 0; }
}

.viewfinder-hint {
  margin-top: 24px;
  color: rgba(255, 255, 255, 0.85);
  font-size: 14px;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.6);
}

.low-light-tip, .error-banner {
  position: absolute;
  bottom: max(66px, env(safe-area-inset-bottom, 50px));
  left: 16px;
  right: 16px;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  backdrop-filter: blur(12px);
  border-radius: 12px;
  font-size: 14px;
}

.low-light-tip {
  background: rgba(251, 191, 36, 0.2);
  border: 1px solid rgba(251, 191, 36, 0.4);
  color: #fef3c7;
}

.error-banner {
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.4);
  color: #fecaca;
}

.tip-dismiss {
  background: none;
  border: none;
  color: inherit;
  font-size: 18px;
  cursor: pointer;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
