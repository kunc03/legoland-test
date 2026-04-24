<template>
  <div
    tabindex="0"
    class="relative w-full h-full"
    :class="props.lightLoading ? 'bg-center bg-no-repeat bg-cover' : 'bg-black'"
    :style="props.lightLoading ? { background: lightLoadingBackground } : undefined"
    @click="handleTapToPlay"
  >
    <video
      ref="videoRef"
      preload="auto"
      playsinline
      webkit-playsinline
      x5-playsinline
      :muted="videoMuted"
      class="absolute z-[1200] inset-0 w-full h-full object-cover"
      @ended="handleVideoEnded"
      @play="onVideoPlay"
      @loadeddata="onVideoLoaded"
      @error="onVideoError"
    >
    </video>

    <!-- Loading overlay - shown while video is loading -->
    <div
      v-if="showLoading"
      class="absolute z-[1201] inset-0 flex flex-col items-center justify-center"
      :class="props.lightLoading ? 'bg-center bg-no-repeat bg-cover' : 'bg-black'"
      :style="props.lightLoading ? { background: lightLoadingBackground } : undefined"
    >
      <div class="flex flex-col items-center gap-4">
        <div
          class="w-12 h-12 border-4 rounded-full animate-spin"
          :class="props.lightLoading ? 'border-gray-300 border-t-gray-700' : 'border-white/30 border-t-white'"
        ></div>
        <p class="text-sm" :class="props.lightLoading ? 'text-gray-600' : 'text-white/70'">
          {{ loadingStatus }}
        </p>
      </div>
    </div>

    <SolidButton
      v-if="showButton && !showLoading"
      :label="$t('skip')"
      class="absolute bottom-5 -right-2 !max-w-48 z-[1202]"
      variant="skip"
      @click.stop="handleButtonClick"
    />
  </div>
</template>

<script setup>
const props = defineProps({
  src: { type: String, default: '' },
  triggerPlay: { type: Boolean, default: false },
  lightLoading: { type: Boolean, default: false },
  muted: { type: Boolean, default: false },
})

const emit = defineEmits(['ended'])
const settings = useState('settings')

const videoRef = ref(null)
const showButton = ref(false)
const showLoading = ref(true)
const hasPlayed = ref(false)
const isVideoLoaded = ref(false)
const videoMuted = ref(true) // Start muted for Safari autoplay compatibility
const loadingStatus = ref('Loading...')
const blobUrl = ref(null)
let buttonDelayTimeout = null

const resolveBackground = (bg) => {
  if (!bg) return ''
  return bg?.type === 'image' ? `url(${bg.value})` : bg.value
}

const lightLoadingBackground = computed(() => {
  return resolveBackground(settings.value?.user_dashboard?.my_account_settings?.background) || '#fff'
})

// Check if we're in an in-app browser  
const checkInAppBrowser = () => {
  if (typeof window === 'undefined') return true
  const ua = navigator.userAgent || ''
  return /Instagram|FBAN|FBAV|Line|Twitter/i.test(ua)
}

// Check if we're on old Safari (pre-iOS 10) where unmuting after play may cause pause
const isOldSafari = () => {
  if (typeof window === 'undefined') return false
  const ua = navigator.userAgent || ''
  // Match Safari on iOS with version < 10 (e.g. CPU iPhone OS 9_3 like, CPU iPhone OS 8_1)
  const iosVersionMatch = ua.match(/CPU (?:iPhone )?OS (\d+)_/)
  if (iosVersionMatch) {
    const majorVersion = parseInt(iosVersionMatch[1], 10)
    return majorVersion < 10
  }
  return false
}

// Get video source URL
const getVideoUrl = () => {
  return props.src
}

// Try to get video from cache first
const getCachedVideo = async () => {
  if (!('caches' in window)) return null
  
  try {
    const cacheName = `gacharary-v2 - ${window.location.origin}`
    const cache = await caches.open(cacheName)
    const cachedResponse = await cache.match(getVideoUrl())
    
    if (cachedResponse) {
      const blob = await cachedResponse.blob()
      return URL.createObjectURL(blob)
    }
  } catch (error) {
    console.warn('Cache lookup failed:', error)
  }
  
  return null
}

// Fetch video as blob for in-app browsers
const fetchVideoAsBlob = async () => {
  loadingStatus.value = 'Loading video...'
  
  try {
    const response = await fetch(getVideoUrl())
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const blob = await response.blob()
    blobUrl.value = URL.createObjectURL(blob)
    
    if (videoRef.value) {
      videoRef.value.src = blobUrl.value
      videoRef.value.load()
    }
    
    loadingStatus.value = 'Starting...'
    isVideoLoaded.value = true
  } catch (error) {
    console.error('Failed to fetch video:', error)
    loadingStatus.value = 'Failed to load video'
    
    // Fallback: try direct source
    if (videoRef.value) {
      videoRef.value.src = getVideoUrl()
      videoRef.value.load()
    }
  }
}

// Called when video data has loaded
const onVideoLoaded = () => {
  isVideoLoaded.value = true
  if (props.triggerPlay) {
     loadingStatus.value = 'Starting...'
  } else {
     loadingStatus.value = 'Ready'
     showLoading.value = false
  }
}

// Called on video error
const onVideoError = (e) => {
  loadingStatus.value = 'Loading video...'
  console.error('Video error:', e)
}

// Called when video starts playing
const onVideoPlay = () => {
  hasPlayed.value = true
  showLoading.value = false
  // Unmute after play starts if the parent wants sound and browser supports it
  // (Safari allows autoplay only when muted, so we start muted then unmute)
  // But on old Safari (pre-iOS 10), unmuting may cause the video to pause,
  // so we keep it muted there as a safe fallback
  if (!props.muted && !isOldSafari()) {
    videoMuted.value = false
  }
  startButtonDelay()
}

// Handle tap on the video area to play
const handleTapToPlay = async () => {
  if (!videoRef.value) return
  
  const video = videoRef.value
  
  // If video not loaded yet, try to load
  if (!isVideoLoaded.value && !blobUrl.value) {
    if (checkInAppBrowser()) {
       await fetchVideoAsBlob()
    } else {
        video.load()
    }
    // We don't return here, we try to play after initiating load
  }
  
  // Play the video
  try {
    await video.play()
    hasPlayed.value = true
    showLoading.value = false
  } catch (err) {
    console.warn('Play failed:', err)
    loadingStatus.value = 'Retrying...'
  }
}

const startButtonDelay = () => {
  showButton.value = false
  if (buttonDelayTimeout) clearTimeout(buttonDelayTimeout)
  buttonDelayTimeout = setTimeout(() => {
    showButton.value = true
  }, 200)
}

const handleVideoEnded = () => {
  emit('ended')
}

const resetButton = () => {
  showButton.value = false
  if (buttonDelayTimeout) clearTimeout(buttonDelayTimeout)
  emit('ended')
}

const handleButtonClick = () => {
  resetButton()
}

const handleKeydown = (event) => {
  if (event.key === 'Enter') {
    handleButtonClick()
  }
}

const attemptPlay = async () => {
    if (!videoRef.value) return

    showLoading.value = true
    loadingStatus.value = 'Starting...'

    // Ensure video is muted before attempting play (required for Safari autoplay)
    videoMuted.value = true
    videoRef.value.muted = true

    try {
        await videoRef.value.play()
        hasPlayed.value = true
        showLoading.value = false
    } catch (e) {
        console.warn('Auto play failed:', e)
        loadingStatus.value = 'Tap to play'
    }
}

// Watch for triggerPlay prop to start playing
watch(() => props.triggerPlay, async (val) => {
    if (val) {
        await attemptPlay()
    }
})

onMounted(async () => {
  window.addEventListener('keydown', handleKeydown)
  
  await nextTick()
  
  const isInApp = checkInAppBrowser()
  
  if (isInApp) {
    loadingStatus.value = 'Loading video...'
    showLoading.value = true
    
    if (videoRef.value) {
      // First: Check if video is already cached (fastest)
      const cachedBlobUrl = await getCachedVideo()
      
      if (cachedBlobUrl) {
        // Use cached video - instant playback
        blobUrl.value = cachedBlobUrl
        videoRef.value.src = cachedBlobUrl
        videoRef.value.load()
        
        // If already triggered, play immediately
        if (props.triggerPlay) {
            await attemptPlay()
        }
        return 
      }
      
      // Second try: direct source (supports streaming - faster start)
      // BUT for preloading in In-App Browser, we might want to be careful.
      // However original logic used direct source first then blob.
      
      // We will follow the pattern: Set src -> Load. Play is separate.
      videoRef.value.src = getVideoUrl()
      videoRef.value.load()

      // If triggered already, try to play
      if (props.triggerPlay) {
         await attemptPlay()
      } else {
          try {
             const response = await fetch(getVideoUrl())
              if (response.ok) {
                 const blob = await response.blob()
                 blobUrl.value = URL.createObjectURL(blob)
                 // Only switch src if we haven't started playing successfully with direct source
                 if (!hasPlayed.value) {
                     videoRef.value.src = blobUrl.value
                     videoRef.value.load()
                 }
              }
          } catch (e) {
              console.warn("Background blob fetch failed", e)
          }
      }
    }
  } else {
    // For regular browsers, set source directly
    if (videoRef.value) {
      videoRef.value.src = getVideoUrl()
      videoRef.value.load()
      
      if (props.triggerPlay) {
         await attemptPlay()
      } else {
         showLoading.value = false // Ready to play
      }
    }
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
  if (buttonDelayTimeout) {
    clearTimeout(buttonDelayTimeout)
  }
  // Clean up blob URL
  if (blobUrl.value) {
    URL.revokeObjectURL(blobUrl.value)
  }
})
</script>



