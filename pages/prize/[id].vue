<template>
  <HeaderBar hasBack>
    <p
      style="text-shadow: 0 3px 3px rgba(0, 0, 0, 0.16)"
      class="text-exd-gray-scorpion font-bold text-exd-1824.52"
    >
      {{ settings?.prize?.step_1?.page_title }}
    </p>
  </HeaderBar>

  <div class="flex flex-col px-8 pt-32 text-black bg-center">
    <div
      class="flex flex-col max-w-sm gap-2 overflow-hidden bg-white border border-gray-200 rounded-lg shadow"
    >
      <div class="w-full overflow-hidden bg-[#FFF6E8]">
        <Skeleton v-if="isFetching" class="!w-full !h-full"></Skeleton>
        <CharacterCard
          v-else
          :image="prizeDetailData.image"
          :bgColor="
            settings?.prize?.step_1?.prize_description?.image_background_color
          "
        />
      </div>
      <div class="flex flex-col justify-between w-full p-5">
        <div class="flex flex-col gap-4">
          <div
            class="relative inline-flex items-center justify-between w-full gap-5"
          >
            <Skeleton v-if="isFetching" class="!h-3" width="15rem"></Skeleton>
            <p
              v-else
              class="max-w-full font-bold text-exd-1424 text-exd-gray-scorpion"
              :class="{
                'max-w-[220px] line-clamp-3':
                  prizeDetailData.rarity?.type === 'color' ||
                  prizeDetailData.rarity?.type === 'image',
              }"
            >
              {{ prizeDetailData.name }}
            </p>
            <Skeleton
              v-if="isFetching"
              class="!h-3 !rounded-full !bg-exd-orange-700"
              width="2rem"
            ></Skeleton>
            <img
              v-else-if="prizeDetailData.rarity?.type === 'image'"
              :src="prizeDetailData.rarity?.image"
              alt="arrow"
              width="50"
              height="50"
              preload
              class=""
            />
            <p
              v-else-if="prizeDetailData.rarity?.type === 'color'"
              class="font-bold text-exd-1824.52 text-white p-1 flex items-center justify-center rounded-full right-0 top-5 min-w-12 min-h-12"
              :style="{
                backgroundColor: prizeDetailData.rarity.background_color,
                color: prizeDetailData.rarity.text_color,
              }"
            >
              {{ prizeDetailData.rarity.text.toUpperCase() }}
            </p>
          </div>

          <HeadingSection
            v-if="
              settings?.prize?.step_1?.prize_description?.show_how_to_get_prizes
            "
            :is-fetching="isFetching"
            :title="$t('howToGetPrizes')"
            :body="prizeDetailData != null ? prizeDetailData?.how_to_win : ''"
          />

          <HeadingSection
            v-if="settings?.prize?.step_1?.prize_description?.show_terms_of_use"
            :is-fetching="isFetching"
            :title="$t('conditionsOfUse')"
            :body="prizeDetailData != null ? prizeDetailData?.terms_of_use : ''"
          />

          <HeadingSection
            v-if="settings?.prize?.step_1?.prize_description?.show_redemption_location_description"
            :is-fetching="isFetching"
            :title="$t('redemptionLocationDescription')"
            :body="prizeDetailData != null ? prizeDetailData?.location_description : ''"
          />

          <div
            v-if="
              settings?.prize?.step_1?.prize_description
                ?.show_redemption_location
            "
            class="w-full mb-5"
          >
            <Skeleton v-if="isFetching" class="!w-full !h-72" />
            <div
              v-show="!isFetching"
              id="parentMap"
              class="relative"
              style="width: 100%; height: 300px"
            >
              <div id="map" style="width: 100%; height: 100%" />
              <div class="absolute inset-0 z-10"></div>
              <div
                class="absolute inset-x-0 bottom-0 z-20 flex items-center h-8 bg-white"
              >
                <span
                  class="flex items-center text-sm border-b cursor-pointer text-exd-gray-scorpion border-b-exd-gray-scorpion"
                  @click="openGoogleMaps"
                  >{{ $t('openGoogleMaps') }}
                  <IconsExport class="w-5 h-5 ml-[2px] cursor-pointer" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <SolidButton
        :label="
          disableRedeem
            ? $t('cannotBeExchanged')
            : settings?.prize?.step_1?.button_text
        "
        :disabled="disableRedeem || isFetching"
        :on-click="handleSwipe"
        :bgColor="settings?.prize?.step_1?.button_and_text_color?.background"
        :textColor="settings?.prize?.step_1?.button_and_text_color?.color"
        has-bottom
      />
    </div>
  </div>

  <Dialog
    v-model:visible="hasModal"
    modal
    class="w-11/12 md:!w-5/12 !max-w-sm border border-exd-gray-44"
    :style="{
      background: settings?.global?.modal?.background_color,
    }"
  >
    <template #container>
      <img
        :src="close"
        alt="close"
        width="30"
        height="30"
        preload
        class="absolute z-50 cursor-pointer right-1 top-1"
        @click="handleToggleModal"
      />
      <div
        class="flex flex-col items-center justify-center w-full gap-1 px-5 py-8 my-2"
        :style="{
          color: settings?.global?.modal?.text_color,
        }"
      >
        <p
          class="font-bold text-center text-exd-1424 small:w-[105%] w-[93%] max-w-w-[93%]"
          style="text-shadow: 0 3px 3px rgba(0, 0, 0, 0.16)"
        >
          {{ settings?.prize?.step_1?.pop_up_title }}
        </p>
        <p class="text-center text-exd-1424">
          {{ settings?.prize?.step_1?.pop_up_text }}
        </p>
      </div>
      <div class="py-3">
        <SolidButton
          :label="settings?.prize?.step_1?.pop_up_button_text"
          :on-click="handleGoToRedeem"
          :bgColor="
            settings?.prize?.step_1?.pop_up_button_and_text_color?.background
          "
          :textColor="
            settings?.prize?.step_1?.pop_up_button_and_text_color?.color
          "
          has-bottom
        />
      </div>
    </template>
  </Dialog>

  <Dialog
    v-model:visible="insufficientDialogVisible"
    modal
    class="!max-w-sm border border-exd-gray-44 rounded-xl"
    :style="{
      background: settings?.global?.modal?.background_color,
    }"
  >
    <template #container>
      <img
        :src="close"
        alt="close"
        width="30"
        height="30"
        preload
        class="absolute z-50 cursor-pointer right-1 top-1"
        @click="handleClose"
      />
      <div
        class="flex flex-col items-center justify-center w-full h-full gap-4 p-5"
      >
        <div class="flex flex-col items-center justify-center w-full gap-8">
          <IconsWarning
            class="w-10 h-10"
            :style="{ color: settings?.global?.icon_color?.background }"
          />
          <p
            class="font-bold text-center text-exd-1424"
            :style="{
              color: settings?.global?.modal?.text_color,
            }"
          >
            {{ showPrizeValidationMessage ? errorMessage : $t('cannotClaim') }}
          </p>

          <SolidButton
            :on-click="() => navigateTo('/prize')"
            :has-loading="isLoading"
            :label="$t('returnToPrizeList')"
            :bgColor="settings?.prize?.step_1?.button_and_text_color?.background"
            :textColor="settings?.prize?.step_1?.button_and_text_color?.color"
            class="w-full"
          />
        </div>
      </div>
    </template>
  </Dialog>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useRouter } from 'vue-router'
import close from '~/assets/images/close.svg'
import { store } from '~/stores/dashboard.js'
import { useExternalRedeemStore } from '~/stores/external-redeem'

definePageMeta({
  middleware: 'auth',
  layout: 'with-bottom-bar',
})

const map = ref(null)
const route = useRoute()
const popupType = ref('a')
const router = useRouter()
const id = route.params.id
const hasModal = ref(false)
const isFetching = ref(false)
const prizeTypeText = ref(null)
const prizeDetailData = ref({})
const disableRedeem = ref(false)
const isClicked = ref(false)
const isRedeemDialogVisible = ref(false)
const insufficientDialogVisible = ref(false)
const errorMessage = ref(null)
const redeemMessage = ref('')
const isLoading = ref(false)
const disableSwipe = ref(false)
const showPrizeValidationMessage = ref(false)
const externalGachaSlug = ref(null)
const config = useRuntimeConfig()
const { t } = useI18n()
const LOCALE = useCookie('LOCALE')
const settings = useState('settings')
const { encryptForURL } = useEncryption()

const redeemType = ref('form')
const externalRedeemStore = useExternalRedeemStore()

const handleToggleModal = () => {
  if (disableRedeem.value) return
  hasModal.value = !hasModal.value
}

const handleClose = () => {
  insufficientDialogVisible.value = false
  showPrizeValidationMessage.value = false
}

const handleGoToRedeem = async () => {
  if (disableRedeem.value) return

  if (externalRedeemStore.isExternalRedeem) {
    if (
      prizeDetailData.value.type === 'external_prize' &&
      externalGachaSlug.value
    ) {
      // Reset scroll position before navigation to prevent iOS Safari viewport issues
      window.scrollTo(0, 0)
      document.body.scrollTop = 0
      document.documentElement.scrollTop = 0
      
      // Wait for scroll settle before navigation
      await new Promise(resolve => requestAnimationFrame(resolve))
      
      const handshake = encryptForURL({
        prize_id: id,
        slug: externalGachaSlug.value,
        ts: Date.now(),
      })

      router.push({
        path: `/spin/prize/${externalGachaSlug.value}`,
        query: {
          prize_id: id,
          h: handshake,
        },
      })
      return;
    }
  }

  if (
    popupType.value === 'swipe_exchange' ||
    popupType.value === 'external_prize'
  ) {
    router.push(`/claim/${id}`)
  } else {
    router.push(`/redeem/${id}`)
  }
}

const fetchRedeem = async () => {
  try {
    errorMessage.value = null
    disableSwipe.value = true
    const { redeemPrize } = usePrizeService()
    const { message, status } = await redeemPrize({
      prize_id: id,
    })

    if (status) {
      redeemMessage.value = t('giftExchangeComplete')
      isRedeemDialogVisible.value = true
      localStorage.setItem('CLAIM_SUCCESS', true)
    } else {
      errorMessage.value = message
      insufficientDialogVisible.value = true
    }
  } catch (error) {
    console.error(error)
    errorMessage.value = error._data.message
    insufficientDialogVisible.value = true
  }
}

const handleSwipe = async () => {
  isClicked.value = true
  
  if (isClicked.value) {
    if (
      prizeDetailData.value.type === 'external_prize' &&
      externalGachaSlug.value
    ) {
      try {
        const { validateExternalPrize } = usePrizeService()
        await validateExternalPrize({
          external_gacha_slug: externalGachaSlug.value,
          prize_id: id,
        })
      } catch (error) {
        showPrizeValidationMessage.value = true
        errorMessage.value = error._data.message
        insufficientDialogVisible.value = true
        return
      }
      // Reset scroll position before navigation to prevent iOS Safari viewport issues
      window.scrollTo(0, 0)
      document.body.scrollTop = 0
      document.documentElement.scrollTop = 0

      // Wait for scroll settle before navigation
      await new Promise(resolve => requestAnimationFrame(resolve))

      const handshake = encryptForURL({
        prize_id: id,
        slug: externalGachaSlug.value,
        ts: Date.now(),
      })

      router.push({
        path: `/spin/prize/${externalGachaSlug.value}`,
        query: {
          prize_id: id,
          h: handshake,
        },
      })
    } else {
      fetchRedeem()
    }
  }
}

const colorBg = ref('')

const imgTag =
  '<img src="/images/export.svg" alt="export" width="23" height="23" class="inline ml-1" />'

const formattedMessage = t('exchange_prize', {
  img: imgTag,
  link1: 'https://maps.app.goo.gl/JBjhtuEiDRWySEjKA',
  link2: 'https://maps.app.goo.gl/hSwAQSMUTHNW8qbW7',
})

const loadGoogleMaps = () => {
  return new Promise((resolve, reject) => {
    if (window.google) {
      resolve()
      return
    }
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${config.public.GOOGLE_API}&libraries=places&language=${LOCALE.value}&region=ja`
    script.async = true
    script.onload = resolve
    script.onerror = reject
    document.head.appendChild(script)
  })
}

const fetchingPrizeData = async () => {
  try {
    disableRedeem.value = true
    isFetching.value = true
    const { getPrizeDetail } = usePrizeService()
    const { data } = await getPrizeDetail(id)
  
    prizeDetailData.value = data
    externalGachaSlug.value = data?.external_gacha_slug ?? externalGachaData?.slug ?? null
    
    checkPoint(data.point)
    if (data.lat !== null && data.long !== null) {
      initializeMap(data.lat, data.long)
    }
    popupType.value = data.type
    disableRedeem.value = prizeDetailData.value.redeemable === false
  } catch (error) {
    console.error('[ERROR] fetchingPrizeData failed:', error)
  } finally {
    isFetching.value = false
  }
}

const checkType = (type) => {
  if (type === 1) {
    disableRedeem.value = false
  } else {
    disableRedeem.value = true
  }
}

const checkPoint = (point) => {
  try {
    const currentPoint = parseInt(store.point)
    if (currentPoint < point) {
      disableRedeem.value = true
    }
  } catch (error) {}
}

const openMapA = () => {
  const googleMapsUrl = `https://maps.app.goo.gl/YfqmSJ6Azkbethyf6`
  window.open(googleMapsUrl, '_blank')
}

const openMapB = () => {
  const googleMapsUrl = `https://maps.app.goo.gl/ZWaTkoyFa1orUyZC7`
  window.open(googleMapsUrl, '_blank')
}

const openMapC = () => {
  const googleMapsUrl = `https://maps.app.goo.gl/YFCpSQixPXDAw68v6?g_st=com.google.maps.preview.copy`
  window.open(googleMapsUrl, '_blank')
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
    fullscreenControl: false, // Disables fullscreen control
  }
  const mapElement = document.getElementById('map')
  const map = new google.maps.Map(mapElement, mapOptions)

  new google.maps.Marker({
    position: { lat: lat, lng: long },
    map: map,
  })
}

const openGoogleMaps = () => {
  const lat = prizeDetailData.value.lat
  const long = prizeDetailData.value.long
  if (lat && long) {
    const googleMapsUrl = `https://www.google.jp/maps?q=${lat},${long}`
    window.open(googleMapsUrl, '_blank')
  }
}

const handleKeydown = (event) => {
  if (event.key === 'Enter') {
    if (!disableRedeem.value && !isFetching.value && !hasModal.value) {
      handleToggleModal()
    } else if (hasModal.value) {
      handleGoToRedeem()
    }
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
})

onMounted(async () => {
  await loadGoogleMaps()
  await fetchingPrizeData()

  if (!settings.value?.flow?.screens?.user_dashboard_screen?.redeem_prize) {
    disableRedeem.value = true
  }

  if (externalRedeemStore.isExternalRedeem) {
    if (
      prizeDetailData.value.type === 'external_prize' &&
      externalGachaSlug.value
    ) {
      try {
        const { validateExternalPrize } = usePrizeService()
        await validateExternalPrize({
          external_gacha_slug: externalGachaSlug.value,
          prize_id: id,
        })
      } catch (error) {
        disableRedeem.value = true
        showPrizeValidationMessage.value = true
        errorMessage.value = error._data.message
        insufficientDialogVisible.value = true
      }
    }
  }
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
  let lat = prizeDetailData.value.lat
  let long = prizeDetailData.value.long

  if (lat != undefined && long != undefined) {
    initializeMap(lat, long)
  }
})
</script>

<style scoped></style>
