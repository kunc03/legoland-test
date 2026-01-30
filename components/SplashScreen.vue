<script setup>
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
      navigator.serviceWorker.register('/sw.js').then(
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
  if (!isSupportSerWorker.value) {
    completeLoading()
    return
  }

  checkCaches()
  maxWaitTimeout = setTimeout(() => {
    completeLoading()
  }, 2000)
})

function completeLoading() {
  loading.value = false
  emit('finish')
}

const getImageValue = (obj) => {
  if (!obj) return ''
  if (typeof obj === 'string') return obj
  return obj.type === 'image' ? obj.value : ''
}

const checkCaches = () => {
  const urlsToCache = [
    '/images/sparkling.png',
    '/images/gacha-aichi.png',
    '/images/close.svg',
    '/images/export.svg',
    '/images/text-char.png',
    '/icons/icon-gift.svg',
    settings.value?.global?.logo,
    settings.value?.global?.gacha_machine_image,
    getImageValue(gacha.value?.loading_screen?.background),
    gacha.value?.loading_screen?.gif || "",
  ]

  caches
    .open(`gacharary-v2 - ${window.location.origin}`)
    .then((cache) => cache.keys())
    .then((keys) => {
      const cachesUrl = keys.map((i) => i.url)

      const filteredUrls = urlsToCache.filter(Boolean)

      const isCacheAlready = filteredUrls.every((i) =>
        cachesUrl.some((a) => a.includes(i))
      )

      if (isCacheAlready) {
        if (maxWaitTimeout) clearTimeout(maxWaitTimeout)
        completeLoading()
      }
  })
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
  </div>
</template>
