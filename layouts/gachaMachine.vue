<template>
  <main
    class="relative flex flex-col w-full h-full max-w-md mx-auto overflow-hidden bg-white"
  >
    <slot />
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
