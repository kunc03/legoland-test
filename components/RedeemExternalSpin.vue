<template>
  <div
    v-if="currentStep === 1"
    class="flex flex-col px-8 pt-32 text-black bg-center"
  >
    <div
      class="flex flex-col max-w-sm gap-2 overflow-hidden bg-white border border-gray-200 rounded-xl shadow mx-auto"
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
            v-if="
              settings?.prize?.step_1?.prize_description
                ?.show_redemption_location_description
            "
            :is-fetching="isFetching"
            :title="$t('redemptionLocationDescription')"
            :body="
              prizeDetailData != null ? prizeDetailData?.location_description : ''
            "
          />

          <!-- <div
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
          </div> -->
        </div>
      </div>
      <SolidButton
        :label="prizeDetailData?.is_failed ? $t('cannotBeExchanged') : $t('exchange')"
        :disabled="disableRedeem || isFetching || prizeDetailData?.is_failed"
        :on-click="handleToggleModal"
        :bgColor="prizeDetailData?.is_failed ? '#C3C3C3' : settings?.prize?.step_1?.button_and_text_color?.background"
        :textColor="settings?.prize?.step_1?.button_and_text_color?.color"
        has-bottom
      />
    </div>

    <!-- <Copyright class="!w-[100%]" /> -->
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
          :on-click="handleGoToClaim"
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
            :on-click="handleGoToRedeem"
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
import close from '~/assets/images/close.svg'

const props = defineProps({
  prizeDetailData: { type: Object, default: () => ({}) },
  isFetching: { type: Boolean, default: false },
  visibleRedeemFields: { type: Array, default: () => [] },
  form: { type: Object, default: () => ({}) },
  isLoading: { type: Boolean, default: false },
  disableRedeem: { type: Boolean, default: false },
  settings: { type: Object, default: () => ({}) },
  type: { type: String, default: '' },
  validateOnSubmit: { type: Boolean, default: false },
  handleError: { type: Function, required: true },
})

const emit = defineEmits([
  'update-model',
  'check-postal-code',
  'validate-input',
  'submit',
])

const { t } = useI18n()
const id = useRoute().params.id
const router = useRouter()
const config = useRuntimeConfig()
const LOCALE = useCookie('LOCALE')

const currentStep = ref(1)
const hasModal = ref(false)
const insufficientDialogVisible = ref(false)
const errorMessage = ref(null)
const showPrizeValidationMessage = ref(false)
const disableRedeem = ref(false)
const popupType = ref('')

const handleToggleModal = () => {
  if (props.disableRedeem || props.prizeDetailData?.is_failed) return
  hasModal.value = !hasModal.value
}

const handleClose = () => {
  insufficientDialogVisible.value = false
  showPrizeValidationMessage.value = false
}

const handleGoToRedeem = () => {
  if (disableRedeem.value) return

  if (
    props.type === 'swipe_exchange' ||
    props.type === 'external_prize'
  ) {
    router.push(`/claim/${id}`)
  } else {
    router.push(`/redeem/${id}`)
  }
}

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

const initializeMap = async (lat, long) => {
  await nextTick()
  const mapElement = document.getElementById('map')
  if (!mapElement) return

  const mapOptions = {
    center: { lat: lat, lng: long },
    zoom: 17,
    disableDefaultUI: true,
    draggable: false,
    scrollwheel: false,
    disableDoubleClickZoom: true,
    zoomControl: false,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false,
  }
  const map = new google.maps.Map(mapElement, mapOptions)

  new google.maps.Marker({
    position: { lat: lat, lng: long },
    map: map,
  })
}

const openGoogleMaps = () => {
  const lat = props.prizeDetailData.lat
  const long = props.prizeDetailData.long
  if (lat && long) {
    const googleMapsUrl = `https://www.google.jp/maps?q=${lat},${long}`
    window.open(googleMapsUrl, '_blank')
  }
}

const optionsMap = (rawOptions) => {
  if (!rawOptions || typeof rawOptions !== 'object') return []
  return Object.entries(rawOptions)
    .filter(([value, label]) => !!value && !!label)
    .map(([value, label]) => ({
      label,
      value,
    }))
}

const getAutocomplete = (item) => {
  if (item.name === 'password') return 'new-password'
  return 'off'
}

const handleGoToClaim = () => {
  if (!id) return navigateTo('/dashboard')
  navigateTo('/claim/'+id)
}

onMounted(async () => {
  if (props.settings?.prize?.step_1?.prize_description?.show_redemption_location) {
    try {
      await loadGoogleMaps()
      if (props.prizeDetailData.lat && props.prizeDetailData.long) {
        initializeMap(props.prizeDetailData.lat, props.prizeDetailData.long)
      }
    } catch (e) {
      console.error('Google Maps Load Error:', e)
    }
  }
})

watch(() => props.prizeDetailData, (newData) => {
  if (newData.lat && newData.long && currentStep.value === 1) {
    initializeMap(newData.lat, newData.long)
  }
}, { deep: true })

watch(currentStep, async (newStep) => {
  if (newStep === 1) {
    await nextTick()
    if (props.prizeDetailData.lat && props.prizeDetailData.long) {
      initializeMap(props.prizeDetailData.lat, props.prizeDetailData.long)
    }
  }
})
</script>