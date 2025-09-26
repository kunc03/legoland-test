<template>
  <div tabindex="0">
    <video
      autoplay
      playsinline
      :muted="shouldMute"
      class="absolute z-[1200] inset-0 w-full h-full object-cover"
      @ended="$emit('ended')"
      @play="startButtonDelay"
    >
      <source :src="props.src" type="video/mp4" />
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
const props = defineProps(['src'])
const emit = defineEmits(['ended'])

const showButton = ref(false)
let buttonDelayTimeout = null

const isAndroid = /Android/i.test(navigator.userAgent)
const isInstagram = /Instagram/i.test(navigator.userAgent)

const shouldMute = isAndroid && isInstagram

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
</script>