<template>
  <main
    class="relative flex flex-col w-full h-full max-w-md mx-auto overflow-hidden bg-center bg-no-repeat bg-cover"
    :style="{ background }"
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

    <section class="min-h-dvh max-h-[calc(100dvh-30px)] overflow-y-auto pb-36">
      <slot />
    </section>
    <BottomBar :bottom-offset="isEnabled ? bottomOffset : '0'" />
    <div v-if="isEnabled" ref="copyrightContainer" class="fixed bottom-0 left-0 right-0 z-50 max-w-md pt-2 mx-auto">
      <Copyright />
    </div>
  </main>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

const layoutCustomProps = useAttrs()

// Dynamic height monitoring for copyright container
const copyrightContainer = ref(null)
const copyrightHeight = ref(0)
const isEnabled = computed(() => settings.value?.copyright?.is_enabled !== false)

const hasBack = ref(layoutCustomProps.hasBack ?? false)
const title = ref(layoutCustomProps.title)

const { t } = useI18n()
const route = useRoute()
const config = useRuntimeConfig()

const settings = useState('settings')

const requestURL = useRequestURL()
const url = requestURL.origin

useAppSeo(settings.value, url)

const background = ref('')

const resolveBackground = (bg) => {
  if (!bg) return ''
  return bg?.type === 'image' ? `url(${bg.value})` : bg.value
}

const handleBackground = () => {
  const path = route.path
  if (path.includes('history')) {
    background.value = resolveBackground(settings.value?.character_collection?.background_image)
  } else if (path.includes('dashboard')) {
    background.value = resolveBackground(settings.value?.user_dashboard?.my_account_settings?.background)
  } else if (path.includes('prize')) {
    background.value = resolveBackground(settings.value?.prize?.step_1?.background_page)
  } else if (path.includes('redeem')) {
    background.value = resolveBackground(settings.value?.prize?.step_1?.background_page)
  } else {
    background.value = ''
  }
}

const observeCopyrightHeight = () => {
  if (!copyrightContainer.value) return
  
  const resizeObserver = new ResizeObserver((entries) => {
    for (const entry of entries) {
      copyrightHeight.value = entry.contentRect.height
    }
  })
  
  resizeObserver.observe(copyrightContainer.value)
  
  onUnmounted(() => {
    resizeObserver.disconnect()
  })
}

// Calculate bottom offset based on copyright height
const bottomOffset = computed(() => {
  if (copyrightHeight.value === 0) return 2.4 // default fallback
  const heightInRem = copyrightHeight.value
  // Convert px to rem (assuming 1rem = 16px)
  const heightInRemWithMargin = heightInRem * 0.96 / 16
  return `${heightInRemWithMargin}rem`
})

onMounted(() => {
  observeCopyrightHeight()
})

watch([() => route.path, () => settings.value], () => {
  handleBackground()
}, { immediate: true })

onMounted(() => {
  if (!route.path.includes('quiz')) {
    localStorage.removeItem('answer-quiz')
  }
  if (!route.path.includes('scan')) {
    localStorage.removeItem('answer-password')
  }
})
</script>
