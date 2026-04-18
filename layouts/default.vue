<template>
  <main
    class="relative flex flex-col w-full h-full max-w-md mx-auto overflow-auto bg-white"
    @click="handleMainClick"
  >
    <slot />
    <VersionDetector ref="versionDetector" />
  </main>
</template>
<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const route = useRoute()
const config = useRuntimeConfig()
const settings = useState('settings')

const requestURL = useRequestURL()
const url = requestURL.origin

// Version detector reference
const versionDetector = ref(null)

// Triple click detection
const clickCount = ref(0)
const clickTimer = ref(null)

const handleMainClick = (event) => {
  console.log('Main click detected', event.target)
  clickCount.value++
  console.log('Click count in layout:', clickCount.value)
  
  if (clickCount.value === 1) {
    clickTimer.value = setTimeout(() => {
      clickCount.value = 0
    }, 500)
  } else if (clickCount.value === 3) {
    clearTimeout(clickTimer.value)
    clickCount.value = 0
    console.log('Triple click detected in layout!')
    if (versionDetector.value) {
      console.log('Calling handleTripleClick')
      versionDetector.value.handleTripleClick()
    } else {
      console.log('Version detector not found')
    }
  }
}

useAppSeo(settings.value, url)

onMounted(() => {
  if (!route.path.includes('quiz')) {
    localStorage.removeItem('answer-quiz')
  }
  if (!route.path.includes('scan')) {
    localStorage.removeItem('answer-password')
  }
})

</script>
