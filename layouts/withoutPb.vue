<template>
  <main
    class="relative flex flex-col w-full h-full max-w-md mx-auto overflow-hidden"
  >
    <HeaderBar :hasBack="hasBack">
      <p
        style="text-shadow: 0 3px 3px rgba(0, 0, 0, 0.16)"
        class="text-exd-gray-scorpion font-bold text-exd-1824.52"
      >
        {{ title }}
      </p>
    </HeaderBar>

    <slot name="header"></slot>

    <section class="min-h-dvh max-h-[calc(100dvh-30%)] overflow-y-auto"
    :style="{
      background: bgPrize
    }"
    >
      <slot />
    </section>
    <BottomBar />
  </main>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

const layoutCustomProps = useAttrs()

const hasBack = ref(layoutCustomProps.hasBack ?? false)
const title = ref(layoutCustomProps.title)

const { t } = useI18n()
const route = useRoute()
const config = useRuntimeConfig()
const settings = useState('settings')
const bgPrize = ref('')

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

onMounted(async () => {
  bgPrize.value = settings.value?.prize?.step_1?.background_page?.type === 'image' ? `url(${settings.value?.prize?.step_1?.background_page?.value})` : settings.value?.prize?.step_1?.background_page?.value
})
</script>
