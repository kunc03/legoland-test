<script setup>
import circleBlur from '~/assets/images/circle-blur.png'
import Copyright from '~/components/Copyright.vue'

const config = useRuntimeConfig()
const version = config.public.VERSION || '1.0.0'
const route = useRoute()
const loading = ref(true)
const isSupportSerWorker = ref(false)
const settings = useState('settings')
const gachaType = computed(() => {
  return route.path.startsWith('/spin/prize/') ? 'external' : 'internal'
})
const gachaSettings = computed(() =>
  gachaType.value === 'external' ? settings.value?.external_gacha : settings.value?.gacha
)
const gacha = computed(() => gachaSettings.value)

let maxWaitTimeout

const emit = defineEmits(['finish'])

// Init service worker
if (import.meta.client && 'serviceWorker' in navigator) {
  isSupportSerWorker.value = true
  navigator.serviceWorker.getRegistration().then((registration) => {
    if (registration) {
      registration.update()
      console.log('ServiceWorker updated')
    } else {
      navigator.serviceWorker.register(`/sw.js?v=${version}`).then(
        (registration) => {
          console.log(
            'ServiceWorker registration successful with scope: ',
            registration.scope
          )
        },
        (err) => {
          console.log('ServiceWorker registration failed: ', err)
        }
      )
    }
  })
} else {
  isSupportSerWorker.value = false
}

onMounted(() => {
  preCacheDuringLoading()
})

function completeLoading() {
  if (!loading.value) return
  loading.value = false
  emit('finish')
}

const getImageValue = (obj) => {
  if (!obj) return ''
  if (typeof obj === 'string') return obj
  return obj.type === 'image' ? obj.value : ''
}

const isCacheableUrl = (url) => {
  if (!url || typeof url !== 'string') return false
  const trimmed = url.trim()
  if (!trimmed) return false
  if (trimmed.startsWith('data:')) return false
  return true
}

const unique = (arr) => Array.from(new Set(arr))

const isMp4Url = (url) => {
  if (!url || typeof url !== 'string') return false
  return /\.mp4(\?|#|$)/i.test(url)
}

const getGachaAssets = (gachaConfig) => {
  if (!gachaConfig) return []

  const spin1 = gachaConfig.spin_gacha_1_screen
  const spin2 = gachaConfig.spin_gacha_2_screen

  return [
    getImageValue(gachaConfig.loading_screen?.background),
    gachaConfig.loading_screen?.gif,
    spin1?.gacha_1_video,
    getImageValue(spin1?.before_gacha_1_screen?.background),
    getImageValue(spin1?.after_gacha_1_screen?.background),
    spin1?.after_gacha_1_screen?.image?.image,
    spin2?.gacha_2_video,
    getImageValue(spin2?.after_gacha_2_screen?.background),
    getImageValue(spin2?.after_gacha_2_screen?.popup_icon),
    spin2?.after_gacha_2_screen?.get_character_title_image,
  ]
}

const buildUrlsToCache = () => {
  const base = [
    '/images/sparkling.png',
    '/images/gacha-aichi.png',
    '/images/close.svg',
    '/images/export.svg',
    '/images/text-char.png',
    '/icons/icon-gift.svg',
    circleBlur,
    settings.value?.global?.logo,
    settings.value?.global?.gacha_machine_image,
  ]

  const gachaConfigs = unique([settings.value?.gacha, settings.value?.external_gacha, gacha.value])
  const fromGacha = gachaConfigs.flatMap((g) => getGachaAssets(g))

  return unique([...base, ...fromGacha].filter(isCacheableUrl))
}

const preCacheDuringLoading = async () => {
  if (!import.meta.client) return
  if (!('caches' in window)) {
    completeLoading()
    return
  }

  const startedAt = Date.now()
  const minWaitMs = 2000
  const cacheName = `gacharary-${version}-${window.location.origin}`
  const urlsToCache = buildUrlsToCache()
  const imageUrlsToCache = urlsToCache.filter((url) => !isMp4Url(url))
  const videoUrlsToCache = urlsToCache.filter((url) => isMp4Url(url))

  const maxWaitMs = 5000
  maxWaitTimeout = setTimeout(() => {
    completeLoading()
  }, maxWaitMs)

  try {
    const cache = await caches.open(cacheName)

    if (navigator.serviceWorker?.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'CACHE_IMAGES',
        payload: imageUrlsToCache,
      })
      navigator.serviceWorker.controller.postMessage({
        type: 'CACHE_VIDEOS',
        payload: videoUrlsToCache,
      })
    }

    const tasks = [
      ...imageUrlsToCache.map(async (url) => {
        try {
          const cached = await cache.match(url)
          if (cached) return
          const response = await fetch(url, { mode: 'no-cors' })
          await cache.put(url, response.clone())
        } catch {
        }
      }),
      ...videoUrlsToCache.map(async (url) => {
        try {
          const cached = await cache.match(url)
          if (cached) return
          let response
          try {
            response = await fetch(url, { mode: 'cors' })
          } catch {
            response = await fetch(url, { mode: 'no-cors' })
          }
          await cache.put(url, response.clone())
        } catch {
        }
      }),
    ]

    await Promise.race([
      Promise.allSettled(tasks),
      new Promise((resolve) => setTimeout(resolve, maxWaitMs - 250)),
    ])
  } catch {
  } finally {
    if (maxWaitTimeout) clearTimeout(maxWaitTimeout)
    const elapsed = Date.now() - startedAt
    const remaining = minWaitMs - elapsed
    if (remaining > 0) {
      await new Promise((resolve) => setTimeout(resolve, remaining))
    }
    completeLoading()
  }
}

onUnmounted(() => {
  if (maxWaitTimeout) clearTimeout(maxWaitTimeout)
})
</script>

<template>
  <div
    v-if="loading"
    class="w-full max-w-md mx-auto h-screen overflow-hidden bg-cover bg-center flex flex-col fixed z-[2000]"
    :style="{
      background:
        gacha.loading_screen.background.type === 'image'
          ? `url(${gacha.loading_screen.background.value})`
          : gacha.loading_screen.background.value,
    }"
  > 
  <div
      class="flex flex-col items-center justify-center w-full h-full text-exd-red"
    >
      <img
        :src="gacha.loading_screen.gif || ''"
        class="w-[100px] h-[100px]"
      />
      <h3 class="ml-5 text-xl font-bold" :style="{ color: gacha.loading_screen.text_color }">LOADING...</h3>
      <!-- <img
        src="~/assets/images/loading.png"
        class="mt-6 ml-5 w-[126px] h-[24px]"
      /> -->
    </div>
    <Copyright class="absolute bottom-0 w-full" />
  </div>
</template>
