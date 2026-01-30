<template>
  <div tabindex="0">
    <video
      autoplay
      preload="auto"
      playsinline
      :muted="shouldMute"
      class="absolute z-[1200] inset-0 w-full h-full object-cover"
      @ended="$emit('ended')"
      @play="startButtonDelay"
    >
      <source :src="videoSource" type="video/mp4" />
    </video>

    <SolidButton
      v-if="showButton"
      :label="$t('skip')"
      class="absolute bottom-5 -right-2 !max-w-48 z-[1200]"
      variant="skip"
      @click="handleButtonClick"
    />
  </div>
</template>

<script setup>
import externalGachaVideo from '~/assets/videos/external-gacha.mp4'

const props = defineProps({
  src: { type: String, default: '' },
  isExternalGacha: { type: Boolean, default: false },
  muted: { type: Boolean, default: undefined },
})

const videoSource = computed(() => {
  return props.isExternalGacha ? externalGachaVideo : props.src
})
const emit = defineEmits(['ended'])

const showButton = ref(false)
let buttonDelayTimeout = null

const isAndroid = ref(false)
const isInstagram = ref(false)
const shouldMute = computed(() => props.muted ?? (isAndroid.value && isInstagram.value))

const startButtonDelay = () => {
  showButton.value = false
  if (buttonDelayTimeout) clearTimeout(buttonDelayTimeout)
  buttonDelayTimeout = setTimeout(() => {
    showButton.value = true
  }, 200)
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

onMounted(() => {
  const ua = navigator.userAgent || ''
  isAndroid.value = /Android/i.test(ua)
  isInstagram.value = /Instagram/i.test(ua)
  window.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>
