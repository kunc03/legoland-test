<template>
  <Head>
    <Title> {{ shareDetailData?.character_name }}</Title>
    <Meta
      name="description"
      :content="stripHtml(shareDetailData?.character_description)"
    />

    <Meta name="og:url" :content="`${url}/${charId}/${spotId}`" />
    <Meta name="og:type" content="website" />
    <Meta name="og:title" :content="shareDetailData?.character_name" />
    <Meta
      name="og:description"
      :content="stripHtml(shareDetailData?.character_description)"
    />
    <Meta name="og:image" :content="shareDetailData?.character_image" />
    <Meta
      name="og:image:secure_url"
      :content="shareDetailData?.character_image"
    />
    <Meta name="og:image:width" content="200" />
    <Meta name="og:image:height" content="200" />
    <Meta name="twitter:card" content="summary_large_image" />
    <Meta name="twitter:title" :content="shareDetailData?.character_name" />
    <Meta
      name="twitter:description"
      :content="stripHtml(shareDetailData?.character_description)"
    />
    <Meta name="twitter:image" :content="shareDetailData?.character_image" />
    <Meta
      name="twitter:image:secure_url"
      :content="shareDetailData?.character_image"
    />
    <Meta name="twitter:image:width" content="900" />
    <Meta name="twitter:image:height" content="900" />
  </Head>

  <div
    v-if="isValidPath"
    class="w-full max-w-md mx-auto min-h-dvh max-h-full overflow-hidden bg-white flex flex-col relative bg-[url('/images/green_base.png')] bg-cover bg-center"
  >
    <HeaderBar>
      <p
        style="text-shadow: 0 3px 3px rgba(0, 0, 0, 0.16)"
        class="text-exd-gray-scorpion font-bold text-exd-1824.52"
      >
        {{ shareDetailData?.character_name }}
      </p>
    </HeaderBar>

    <section
      class="min-h-dvh max-h-[calc(100dvh-30px)] overflow-y-auto pb-6"
      v-if="shareDetailData == null"
    >
      <div
        class="flex flex-col bg-center text-black mt-[105px] px-8 gap-3 mb-20"
      >
        <div class="max-w-sm bg-white rounded-lg shadow">
          <div class="w-full overflow-hidden rounded-t-lg h-72 no-char-avail">
            <div class="flex flex-col gap-2 p-5 text-center">
              {{ t('no_available_data') }}
            </div>
            <SolidButton
              :label="$t('back_to_top')"
              :on-click="backToTop"
              has-bottom
              variant="red-coral"
            />
          </div>
        </div>
      </div>
    </section>
    <section class="h-[calc(100dvh-35px)] overflow-y-auto py-6" v-else>
      <div
        class="flex flex-col bg-center text-black mt-[105px] px-8 gap-3 mb-10"
      >
        <div class="max-w-sm bg-white rounded-lg shadow">
          <div class="w-full overflow-hidden rounded-t-lg">
            <Skeleton v-if="isFetching" class="!w-full !h-full" />
            <CharacterCard
              v-else-if="shareDetailData.is_valid_char"
              :image="shareDetailData.character_image"
            />
          </div>
          <div class="flex flex-col gap-2 p-5">
            <div class="inline-flex items-center justify-between w-full gap-5">
              <Skeleton v-if="isFetching" class="!h-3" width="15rem"></Skeleton>

              <p
                v-else-if="shareDetailData.is_valid_char"
                class="w-full font-bold text-exd-1424 text-exd-gray-scorpion"
              >
                {{ shareDetailData.character_name }}
              </p>

              <Skeleton
                v-if="isFetching"
                class="!h-3 !bg-exd-gold !rounded-full"
                width="2rem "
              />
              <p
                v-else
                class="font-bold text-exd-1824.52 text-white p-1 min-h-10 min-w-12 h-10 w-12 flex items-center justify-center rounded-full pr-2 bg-no-repeat bg-contain bg-center"
                :style="
                  rarityImg ? { backgroundImage: `url(${rarityImg})` } : {}
                "
              ></p>
            </div>

            <div
              v-if="isFetching"
              class="flex items-center gap-5 text-exd-1218"
            >
              <Skeleton
                class="border-[1px] border-exd-green text-exd-green rounded-[5px] px-2"
              />
              <Skeleton class="text-exd-gray-scorpion bg-exd-gray-scorpion" />
            </div>
            <div v-else class="flex items-center gap-5 text-exd-1218">
              <p
                class="border-[1px] border-exd-green text-exd-green rounded-[5px] px-2"
              >
                {{ $t('category') }}
              </p>
              <p class="text-exd-gray-scorpion">
                {{ shareDetailData.character_category }}
              </p>
            </div>

            <Skeleton v-if="isFetching" class="!h-3" width="15rem"></Skeleton>
            <p
              v-else-if="shareDetailData.is_valid_char"
              class="font-medium text-exd-1218 text-exd-gray-scorpion text-word-wrap vhtml-desc"
              v-html="shareDetailData.character_description"
            />

            <div
              class="flex flex-col gap-2 py-4 text-exd-gray-scorpion text-exd-1218"
            >
              <div class="max-w-full">
                <p class="flex flex-row justify-between w-full">
                  {{ star1Name
                  }}<StarRating :value="star1" :show-value="false" />
                </p>
                <p class="flex flex-row justify-between w-full">
                  {{ star2Name
                  }}<StarRating :value="star2" :show-value="false" />
                </p>
                <p class="flex justify-between w-full">
                  {{ star3Name }}
                  <StarRating :value="star3" :show-value="false" />
                </p>
              </div>
            </div>

            <!-- Check if has location data -->
            <div v-if="shareDetailData.is_valid_spot">
              <Skeleton v-if="isFetching" class="!w-full !h-72" />
              <HeadingSection
                v-else
                class="!mb-3"
                :is-fetching="isFetching"
                :title="shareDetailData.character_store_name"
                :body="shareDetailData.character_store_description"
              />

              <div
                v-if="socialMediaLinks.length"
                class="inline-flex md:gap-3 gap-[6px] w-full justify-center items-center mb-3 bg-exd-zinc-100 p-5 rounded-lg"
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

              <div class="w-full">
                <Skeleton v-if="isFetching" class="!w-full !h-72" />
                <div
                  class="relative"
                  v-else
                  id="parentMap"
                  style="width: 100%; height: 300px"
                >
                  <div
                    id="map"
                    tabindex="-1"
                    style="width: 100%; height: 100%"
                  />
                  <div class="absolute inset-0 z-10"></div>
                  <div
                    class="absolute inset-x-0 bottom-0 z-20 flex items-center h-8 bg-white"
                  >
                    <span
                      class="text-exd-green text-sm flex items-center cursor-pointer relative after:content-[''] after:absolute after:inset-x-0 after:bottom-0 after:border-b after:border-b-exd-green"
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
          </div>
        </div>
      </div>
      <div class="fixed bottom-0 z-50 w-full max-w-md px-8 mx-auto mb-3">
        <Button
          class="!bg-exd-red-coral !py-4 !w-full !uppercase !font-bold !text-exd-1424 !rounded-full !text-white !flex !flex-row !justify-between !px-5"
          raised
          @click="
            () =>
              navigateTo(url, {
                external: true,
                open: {
                  target: '_blank',
                },
              })
          "
        >
          <span class="text-center grow">{{ $t('shareClickHere') }}</span>
        </Button>
      </div>
    </section>
  </div>
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
import web1 from '~/assets/icons/web1.png'
import web2 from '~/assets/icons/web2.png'
import web3 from '~/assets/icons/web3.png'
import { useI18n } from 'vue-i18n'

definePageMeta({
  layout: 'dynamic-seo-meta',
})

const { t } = useI18n()
const config = useRuntimeConfig()
const route = useRoute()
const charId = route.params.charId
const spotId = route.params.spotId
const title = config.public.META_TITLE
const description = config.public.META_DESCRIPTION
const image = config.public.META_IMAGE
const url = config.public.META_URL
const quote = config.public.META_QUOTE
const props = defineProps(['id'])
const isFetching = ref(true)
const shareDetailData = ref(null)
const rarityImg = ref('')
const star1Name = ref('')
const star2Name = ref('')
const star3Name = ref('')
const star1 = ref(0)
const star2 = ref(0)
const star3 = ref(0)
const socialMediaLinks = ref([])

const LOCALE = useCookie('LOCALE')
const backToTop = () => {
  return navigateTo('/')
}

function stripHtml(html = '') {
  return html?.replace(/<\/?[^>]+(>|$)/g, '').trim()
}

const isValidPath = computed(() => {
  return route.path.startsWith('/share') && charId && spotId
})

const showSuccessPopup = ref(false)

const fetchingShareData = async () => {
  try {
    isFetching.value = true
    let payload = {
      character_id: charId,
      location_id: spotId,
    }

    const { data, error } = await useAsyncData(() =>
      useFetchApi('POST', 'share', { body: payload })
    )

    if (data.value) {
      shareDetailData.value = data.value.data
      // handleRarity(data.value.data.character_rarity_image_in_gacha_history)
      handleRarity(data.value.data.character_rarity)

      star1.value = calculateStar(data.value.data.character_star1)
      star2.value = calculateStar(data.value.data.character_star2)
      star3.value = calculateStar(data.value.data.character_star3)

      star1Name.value = data.value.data.character_star_name1
      star2Name.value = data.value.data.character_star_name2
      star3Name.value = data.value.data.character_star_name3

      socialMediaLinks.value = [
        { url: data.value.data.character_web1_url, src: web1, alt: 'Web 1' },
        { url: data.value.data.character_web2_url, src: web2, alt: 'Web 2' },
        { url: data.value.data.character_web3_url, src: web3, alt: 'Web 3' },
        { url: data.value.data.character_line_url, src: line, alt: 'Line' },
        { url: data.value.data.character_x_url, src: x, alt: 'X (Twitter)' },
        {
          url: data.value.data.character_fb_url,
          src: facebook,
          alt: 'Facebook',
        },
        {
          url: data.value.data.character_ig_url,
          src: instagram,
          alt: 'Instagram',
        },
        { url: data.value.data.character_tt_url, src: tiktok, alt: 'TikTok' },
      ].filter((link) => link.url)
    }

    if (error.value) {
      console.log(error.value)
    }
  } catch (error) {
    console.log(error)
  } finally {
    isFetching.value = false
  }
}

fetchingShareData()

const handleKeydown = (event) => {
  if (event.key === 'Enter') {
    if (shareDetailData.value == null && isValidPath.value) {
      backToTop()
    }
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
})

onBeforeMount(async () => {
  await loadGoogleMaps()
  let lat = shareDetailData.value?.lat
  let long = shareDetailData.value?.long

  if (lat != undefined && long != undefined) {
    initializeMap(lat, long)
  }
})

const initializeMap = async (lat, long) => {
  try {
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

    await nextTick()

    const mapElement = document.getElementById('map')
    const map = new google.maps.Map(mapElement, mapOptions)

    new google.maps.Marker({
      position: { lat: lat, lng: long },
      map: map,
    })
  } catch (error) {
    console.log(error)
  }
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

const openGoogleMaps = () => {
  const lat = shareDetailData.value.lat
  const long = shareDetailData.value.long
  if (lat && long) {
    const googleMapsUrl = `https://www.google.jp/maps?q=${lat},${long}`
    window.open(googleMapsUrl, '_blank')
  }
}

const handleRarity = (rarityChar) => {
  const rarity = rarityChar
  if (rarity === 'R') {
    rarityImg.value = '/images/r-bg.png'
  } else if (rarity === 'SR') {
    rarityImg.value = '/images/sr-bg.png'
  } else if (rarity === 'SSR') {
    rarityImg.value = '/images/ssr-bg.png'
  }
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

const openLink = (url) => {
  window.open(url, '_blank')
}
</script>

<style scoped>
.no-char-avail {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
</style>
