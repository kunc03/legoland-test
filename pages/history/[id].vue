<template>
  <HeaderBar hasBack>
    <p
      style="text-shadow: 0 3px 3px rgba(0, 0, 0, 0.16)"
      class="text-exd-gray-scorpion font-bold text-exd-1824.52"
    >
      {{ historyData?.page_title }}
    </p>
  </HeaderBar>
  <div class="flex flex-col gap-3 px-8 pt-32 text-black">
    <div class="max-w-sm bg-white rounded-lg shadow">
      <div class="w-full overflow-hidden rounded-t-lg">
        <Skeleton v-if="isFetching" class="!w-full !h-full"></Skeleton>
        <CharacterCard
          v-else
          :image="
            historyDetailData.character_image != null
              ? historyDetailData.character_image
              : duck
          "
          :bgColor="
            settings?.character_collection?.step_2_image_background_color
          "
        />
      </div>
      <div class="flex flex-col gap-2 p-5">
        <div class="inline-flex items-center justify-between w-full gap-5 mb-2">
          <Skeleton
            v-if="isFetching"
            class="!h-3 !bg-exd-gray-scorpion !rounded-full"
            width="15rem"
          />
          <p
            v-else
            class="max-w-full font-bold text-exd-1424 line-clamp-2 text-exd-gray-scorpion"
            :class="{
              'max-w-[220px] line-clamp-3':
                !historyDetailData.show_character_rarity,
            }"
          >
            {{ historyDetailData.character_name }}
          </p>
          <Skeleton
            v-if="isFetching"
            class="!h-3 !bg-exd-gold !rounded-full"
            width="2rem "
          />

          <img
            v-if="
              !isFetching &&
              settings?.flow?.screens?.spin_gacha_2_screen
                ?.show_character_rarity
            "
            :src="rarityImg"
            alt="rarity icon"
            class="w-10"
          />
        </div>
        <div v-if="isFetching" class="flex items-center gap-5 text-exd-1218">
          <Skeleton
            class="border-[1px] border-exd-green text-exd-green rounded-[5px] px-2"
          />
          <Skeleton class="text-exd-gray-scorpion bg-exd-gray-scorpion" />
        </div>
        <div
          v-else-if="!isFetching && historyDetailData.character_category"
          class="flex items-center gap-5 text-exd-1218"
        >
          <p
            class="border-[1px] border-exd-green text-exd-green rounded-[5px] px-2"
          >
            {{ $t('category') }}
          </p>
          <p class="text-exd-gray-scorpion">
            {{ historyDetailData.character_category }}
          </p>
        </div>

        <Skeleton
          v-if="isFetching"
          class="!h-3 !bg-exd-gray-scorpion !rounded-full"
          width="5rem"
        />
        <p
          v-else
          class="font-medium text-exd-1218 text-exd-gray-scorpion text-word-wrap vhtml-desc"
          v-html="historyDetailData.character_description"
        />

        <div
          class="flex flex-col gap-2 py-4 text-exd-gray-scorpion text-exd-1218"
        >
          <div class="w-full">
            <p v-if="star1" class="flex flex-row justify-between max-w-full">
              {{ star1Name }}<StarRating :value="star1" :show-value="false" />
            </p>
            <p v-if="star2" class="flex flex-row justify-between max-w-full">
              {{ star2Name }}<StarRating :value="star2" :show-value="false" />
            </p>
            <p v-if="star3" class="flex justify-between max-w-full">
              {{ star3Name }}
              <StarRating :value="star3" :show-value="false" />
            </p>
          </div>
        </div>

        <HeadingSection
          :is-fetching="isFetching"
          :title="historyDetailData?.store_name ?? ''"
          :body="historyDetailData?.store_description ?? ''"
        />

        <div
          v-if="socialMediaLinks.length"
          class="inline-flex md:gap-3 gap-[6px] w-full justify-center items-center mb-6 bg-exd-zinc-100 p-5 rounded-lg"
        >
          <img
            v-for="(link, index) in socialMediaLinks"
            :key="index"
            :src="link.src"
            :alt="link.alt"
            :aria-label="link.alt"
            class="cursor-pointer md:size-7 size-7"
            @click="openLink(link.url)"
            preload
          />
        </div>

        <div v-if="historyData?.show_redemption" class="w-full">
          <Skeleton v-if="isFetching" class="!w-full !h-72" />
          <div
            class="relative"
            v-show="!isFetching"
            id="parentMap"
            style="width: 100%; height: 300px"
          >
            <div id="map" tabindex="-1" style="width: 100%; height: 100%" />
            <div class="absolute inset-0 z-10"></div>
            <div
              class="absolute inset-x-0 bottom-0 z-20 flex items-center h-8 bg-white"
            >
              <span
                class="flex items-center text-sm border-b cursor-pointer text-exd-green border-b-exd-green"
                @click="openGoogleMaps"
                >{{ $t('openGoogleMaps') }}
                <img
                  src="~/assets/images/export-green.svg"
                  alt="export"
                  width="15"
                  height="15"
                  class="inline ml-1"
                />
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="inline-flex items-center justify-center w-full gap-3 mb-6">
        <div class="speech-bubble text-[10pt]">
          {{ $t('share') }}
          <div class="triangle-border"></div>
          <div class="triangle-inner"></div>
        </div>
        <img
          :src="download"
          alt="download"
          class="cursor-pointer size-5"
          @click="share('image')"
          preload
        />
        <img
          :src="line"
          alt="line"
          class="cursor-pointer size-5"
          @click="share('line')"
          preload
        />
        <img
          :src="x"
          alt="x"
          class="cursor-pointer size-5"
          @click="share('x')"
          preload
        />
        <img
          :src="facebook"
          alt="facebook"
          class="cursor-pointer size-5"
          @click="share('facebook')"
          preload
        />
      </div>
    </div>
  </div>

  <transition name="slide-right">
    <div
      v-if="showSuccessPopup"
      class="flex items-center gap-2 popup-success bg-exd-dark-grey"
    >
      <div
        class="flex items-center justify-center rounded-full w-7 h-7 bg-exd-green text-exd-1320"
      >
        <img :src="check" alt="success" class="w-6 h-6" />
      </div>
      {{ $t('downloadImage') }}
    </div>
  </transition>
</template>

<script setup>
import duck from '~/assets/images/duck.svg'
import download from '~/assets/images/download.svg'
import facebook from '~/assets/images/facebook.svg'
import check from '~/assets/images/check.svg'
import line from '~/assets/images/line.svg'
import x from '~/assets/images/x.svg'
import instagram from '~/assets/images/instagram.png'
import tiktok from '~/assets/images/tiktok.png'
import { useRoute } from 'nuxt/app'
import web1 from '~/assets/icons/web1.png'
import web2 from '~/assets/icons/web2.png'
import web3 from '~/assets/icons/web3.png'

definePageMeta({
  layout: 'with-bottom-bar',
  middleware: 'auth',
})

const route = useRoute()
const config = useRuntimeConfig()
const id = route.params.id
const requestURL = useRequestURL()
const url = requestURL.origin
const quote = computed(() => settings.value?.global?.ogp?.sns)
const historyDetailData = ref({})
const props = defineProps(['id'])
const isFetching = ref(true)
const LOCALE = useCookie('LOCALE')

const showSuccessPopup = ref(false)
const star1Name = ref('')
const star2Name = ref('')
const star3Name = ref('')
const star1 = ref(0)
const star2 = ref(0)
const star3 = ref(0)
const colorBg = ref('')
const rarityImg = ref('')

const settings = useState('settings')

const historyData = settings.value?.character_collection || {}

const socialMediaLinks = ref([])

const openLink = (url) => {
  window.open(url, '_blank')
}

const loadGoogleMaps = () => {
  return new Promise((resolve, reject) => {
    if (window.google) {
      resolve()
      return
    }

    const existingScript = document.getElementById('google-maps')
    if (existingScript) {
      existingScript.remove()
    }

    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${config.public.GOOGLE_API}&libraries=places&language=${LOCALE.value}&region=ja`
    script.async = true
    script.id = 'google-maps'
    script.onload = resolve
    script.onerror = reject
    document.head.appendChild(script)
  })
}

const calculateStar = (characterStar) => {
  const starMapping = {
    1: 0,
    2: 0.5,
    3: 1,
    4: 1.5,
    5: 2,
    6: 2.5,
    7: 3,
    8: 3.5,
    9: 4,
    10: 4.5,
    11: 5,
  }

  return starMapping[characterStar] ?? 0
}

const fetchingHistoryData = async () => {
  try {
    isFetching.value = true
    const { data } = await useFetchApi('GET', 'history/' + id)
    historyDetailData.value = data

    star1.value = calculateStar(data.character_star1)
    star2.value = calculateStar(data.character_star2)
    star3.value = calculateStar(data.character_star3)

    star1Name.value = data.character_star_name1
    star2Name.value = data.character_star_name2
    star3Name.value = data.character_star_name3

    socialMediaLinks.value = [
      { url: data.character_web1_url, src: web1, alt: 'Web 1' },
      { url: data.character_web2_url, src: web2, alt: 'Web 2' },
      { url: data.character_web3_url, src: web3, alt: 'Web 3' },
      { url: data.character_line_url, src: line, alt: 'Line' },
      { url: data.character_x_url, src: x, alt: 'X (Twitter)' },
      { url: data.character_fb_url, src: facebook, alt: 'Facebook' },
      { url: data.character_ig_url, src: instagram, alt: 'Instagram' },
      { url: data.character_tt_url, src: tiktok, alt: 'TikTok' },
    ].filter((link) => link.url)

    // Memuat peta jika ada koordinat
    if (data.lat && data.long) {
      initializeMap(data.lat, data.long)
    }

    handleRarity(data.character_rarity_image_in_gacha_history)
  } catch (error) {
    console.log(error)
  } finally {
    isFetching.value = false
  }
}

const initializeMap = async (lat, long) => {
  const mapOptions = {
    center: { lat: lat, lng: long },
    zoom: 17,
    disableDefaultUI: true, // Disables all default controls like zoom and map type
    draggable: false, // Disables dragging of the map
    scrollwheel: false, // Disables zooming with the mouse scroll
    disableDoubleClickZoom: true, // Disables zooming by double-clicking
    zoomControl: false, // Disables zoom control buttons
    mapTypeControl: false, // Disables map type control (e.g., satellite vs. roadmap)
    streetViewControl: false, // Disables street view control
    fullscreenControl: false, // Disables fullscreen control,
  }

  const mapElement = document.getElementById('map')
  const map = new google.maps.Map(mapElement, mapOptions)

  new google.maps.Marker({
    position: { lat: lat, lng: long },
    map: map,
  })
}

function stripHtml(html = '') {
  return html?.replace(/<\/?[^>]+(>|$)/g, '').trim()
}

const updateMetaHead = () => {
  const title = settings.value?.global?.ogp?.title || process.env.META_TITLE
  const description =
    stripHtml(settings.value?.global?.ogp?.description) ||
    process.env.META_DESCRIPTION
  const image = settings.value?.global?.ogp?.image || process.env.META_IMAGE

  useSeoMeta({
    title,
    description,
    ogTitle: title,
    ogDescription: description,
    ogImage: image,
    ogUrl: url || process.env.META_URL,
    ogType: 'website',
    twitterCard: 'summary_large_image',
    twitterTitle: title,
    twitterDescription: description,
    twitterImage: image,
  })
}

const share = (type) => {
  switch (type) {
    case 'image':
      downloadImage()
      break
    case 'facebook':
      shareToFacebook()
      break
    case 'x':
      shareToX()
      break
    case 'line':
      shareToLine()
      break

    default:
      break
  }
}

const generateUrlToShare = () => {
  const formatQuote = stripHtml(quote.value)

  try {
    const characterId = historyDetailData.value?.character_id || 'unknown'
    const locationId = historyDetailData.value?.location_id || 'unknown'
    const baseUrl = url || window.location.origin

    const shareUrl = `${baseUrl}/share/${characterId}/${locationId}?t=${Date.now()}`

    return {
      url: shareUrl,
      quote: formatQuote,
    }
  } catch (error) {
    console.error('[generateUrlToShare] Failed:', error)
    return {
      url: '',
      quote: formatQuote,
    }
  }
}

const shareToFacebook = () => {
  try {
    const { url } = generateUrlToShare()
    if (!url) return console.warn('No URL to share')

    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      url
    )}`
    window.open(shareUrl, '_blank')
  } catch (error) {
    console.error('Error sharing to Facebook:', error)
  }
}

const shareToX = () => {
  try {
    const { quote, url } = generateUrlToShare()
    const message = `${quote}\n${url}`

    if (!message.trim()) return console.warn('No message to share')

    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      message
    )}`
    window.open(shareUrl, '_blank')
  } catch (error) {
    console.error('Error sharing to X:', error)
  }
}

const shareToLine = () => {
  try {
    const objectToShare = generateUrlToShare()
    const message = objectToShare?.quote ?? ''
    const url = objectToShare?.url ?? ''

    if (!message && !url) {
      console.warn('No message or URL to share')
      return
    }

    const combinedText = `${message}\n${url}`

    const shareUrl = `https://line.me/R/msg/text?${encodeURIComponent(
      combinedText
    )}`
    window.open(shareUrl, '_blank')
  } catch (error) {
    console.error('Error sharing to LINE:', error)
  }
}

const openGoogleMaps = () => {
  const lat = historyDetailData.value.lat
  const long = historyDetailData.value.long
  if (lat && long) {
    const googleMapsUrl = `https://www.google.jp/maps?q=${lat},${long}`
    window.open(googleMapsUrl, '_blank')
  }
}

const downloadImage = async () => {
  try {
    const fileName = historyDetailData.value.character_name + '.png'
    const blob = await useFetchApi('GET', '/history/image/' + id)
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(link.href)

    showSuccessPopup.value = true

    setTimeout(() => {
      showSuccessPopup.value = false
    }, 2000)
  } catch (error) {
    console.error('Error downloading the image:', error)
  }
}

const handleRarity = (rarityChar) => {
  rarityImg.value = rarityChar
}

onBeforeMount(async () => {
  await loadGoogleMaps()
  fetchingHistoryData()
  updateMetaHead()
})

watch(LOCALE, async (val) => {
  const map = document.getElementById('map')

  if (map.parentNode) {
    map.parentNode.removeChild(map)
    const div = document.createElement('div')
    const parentMap = document.getElementById('parentMap')
    div.id = 'map'
    div.style = 'width: 100%; height: 100%'

    parentMap.appendChild(div)
  }

  delete window.google

  await loadGoogleMaps()
  let lat = historyDetailData.value.lat
  let long = historyDetailData.value.long

  if (lat != undefined && long != undefined) {
    initializeMap(lat, long)
  }
})
</script>

<style scoped>
.popup-success {
  position: absolute;
  top: 15px;
  right: 10px;
  padding: 5px 20px;
  border-radius: 5px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  animation: slide-in 0.5s forwards, slide-out 0.5s 1.5s forwards;
  z-index: 1000;
}

.speech-bubble {
  position: relative;
  background-color: #ffffff;
  border: 1px solid #555555;
  border-radius: 6px;
  padding: 2px 10px;
  display: inline-block;
  color: #000;
  max-width: 300px;
}

.triangle-border {
  position: absolute;
  top: 50%;
  right: -9px;
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 4px 0 4px 9px;
  border-color: transparent transparent transparent #606060;
  transform: translateY(-50%);
}

.triangle-inner {
  position: absolute;
  top: 50%;
  right: -8px;
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 4px 0 4px 14px;
  border-color: transparent transparent transparent white;
  transform: translateY(-50%);
}

@keyframes slide-in {
  0% {
    opacity: 0;
    transform: translateX(100%);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slide-out {
  0% {
    opacity: 1;
    transform: translateX(0);
  }
  100% {
    opacity: 0;
    transform: translateX(100%);
  }
}
</style>
