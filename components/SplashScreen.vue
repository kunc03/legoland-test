<script setup>
const loading = ref(true)
const isSupportSerWorker = ref(false)
const settings = useState('settings')

let checkCachesInterval
let firstCount = 1

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
  checkCachesInterval = setInterval(() => {
    firstCount += 1
    if (isSupportSerWorker.value) {
      checkCaches()
    } else {
      clearInterval(checkCachesInterval)
      completeLoading()
    }

    if (firstCount >= 7) {
      clearInterval(checkCachesInterval)
      completeLoading()
    }
  }, 1500)
})

function completeLoading() {
  loading.value = false
  emit('finish')
}

const gacha = settings.value?.gacha
const spin1 = gacha.spin_gacha_1_screen
const spin2 = gacha.spin_gacha_2_screen

const getImageValue = (obj) => {
  return obj && obj.type === 'image' ? obj.value : "";
};

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
    getImageValue(gacha?.loading_screen?.background),
    gacha?.loading_screen?.gif || "",
    spin1?.gacha_1_video || "",
    getImageValue(spin1?.before_gacha_1_screen?.background),
    getImageValue(spin1?.after_gacha_1_screen?.background),
    spin2?.gacha_2_video || "",
    getImageValue(spin2?.after_gacha_2_screen?.popup_icon),
    getImageValue(spin2?.after_gacha_2_screen?.background)
  ]

  caches
    .open(`gacharary-v2 - ${window.location.origin}`)
    .then(function (cache) {
      return cache.keys()
    })
    .then(function (keys) {
      const filteredUrls = urlsToCache.filter(Boolean)
      const isCacheAlready = filteredUrls.every((i) =>
        cachesUrl.some((a) => a.includes(i))
      )

      if (isCacheAlready) {
        clearInterval(checkCachesInterval)
        completeLoading()
      }
    })
}

onUnmounted(() => clearInterval(checkCachesInterval))
</script>

<template>
  <div
    v-if="loading"
    class="w-full max-w-md mx-auto h-screen overflow-hidden bg-cover bg-center flex flex-col fixed z-[2000]"
    :style="{ backgroundImage: `url(${settings?.gacha?.loading_screen?.background?.value || ''})` }"
  >
    <div
      class="flex flex-col items-center justify-center w-full h-full text-exd-red"
    >
      <img
        :src="settings.gacha.loading_screen.gif || ''"
        class="w-[100px] h-[100px]"
      />
      <h3 class="ml-5 text-xl font-bold" :style="{ color: settings.gacha.loading_screen.text_color }">LOADING...</h3>
      <!-- <img
        src="~/assets/images/loading.png"
        class="mt-6 ml-5 w-[126px] h-[24px]"
      /> -->
    </div>
  </div>
</template>
