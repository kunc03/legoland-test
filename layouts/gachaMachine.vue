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

useSeoMeta({
  title: settings.value?.global?.ogp?.title,
  description: stripHtml(settings.value?.global?.ogp?.description),
  ogTitle: settings.value?.global?.ogp?.title,
  ogDescription: stripHtml(settings.value?.global?.ogp?.description),
  ogImage: settings.value?.global?.ogp?.image,
  ogUrl: url,
  ogType: 'website',
  twitterCard: 'summary_large_image',
  twitterTitle: settings.value?.global?.ogp?.title,
  twitterDescription: stripHtml(settings.value?.global?.ogp?.description),
  twitterImage: settings.value?.global?.ogp?.image,
})

function stripHtml(html = '') {
  return html.replace(/<\/?[^>]+(>|$)/g, '').trim()
}

onMounted(() => {
  if (!route.path.includes('quiz')) {
    localStorage.removeItem('answer-quiz')
  }
  if (!route.path.includes('scan')) {
    localStorage.removeItem('answer-password')
  }
})
</script>
