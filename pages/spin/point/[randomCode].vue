<template>
  <div
    v-if="
      settings?.flow?.screens?.spin_gacha_1_screen?.show_point_screen &&
      showPointUi
    "
    class="relative flex flex-col items-center justify-center !bg-no-repeat !bg-cover !bg-center grow"
    :style="{
      background:
        gacha?.spin_gacha_1_screen?.after_gacha_1_screen?.background?.type === 'image'
          ? `url(${gacha?.spin_gacha_1_screen?.after_gacha_1_screen?.background?.value})`
          : gacha?.spin_gacha_1_screen?.after_gacha_1_screen?.background?.value,
    }"
    @touchmove="(e) => e.preventDefault()"
  >
    <SparkleStart className="top-3 z-30" />

    <img
      :src="settings?.global?.gacha_machine_image"
      alt="gacha2"
      class="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[120%] max-w-none h-auto max-h-[96svh] object-contain"
      loading="eager"
      decoding="async"
      fetchpriority="high"
    />
    <img
      src="/images/sparkling.png"
      alt="sparkling"
      class="absolute z-10 object-cover w-full h-full transform -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2 animate-sparkling"
      loading="eager"
      decoding="async"
      fetchpriority="high"
    />
    <div class="absolute inset-0 z-20 flex justify-center">
      <CircleSpinPoint
        class="relative top-1/2 -translate-y-[60%]"
        :imageSrc="pointImageUrl"
        :categorySrc="categoryImageUrl"
        width="100%"
        height="800"
        :showPointOnly="showPointOnly"
      />
      <div
        v-if="settings?.flow?.screens?.spin_gacha_1_screen?.show_point_title && pointName"
        class="absolute text-exd-gray-scorpion bg-white flex justify-center bottom-[20%] px-4 py-3 h-auto rounded-lg max-w-[50vw]"
      >
        <p class="text-[3.3vw] sm:text-[17px] break-words text-center">
          {{ pointName }}
        </p>
      </div>
    </div>
    <!-- <div class="absolute-10 top-1/2 translate-y-[80%]"></div> -->
    <div class="w-full absolute bottom-0 z-[1100]">
      <SolidButton
        :label="gacha?.spin_gacha_1_screen?.after_gacha_1_screen?.button_text"
        :on-click="() => handleButton()"
        has-bottom
        :disabled="disabledButton"
        :bgColor="
          gacha?.spin_gacha_1_screen?.after_gacha_1_screen?.button_and_text_color
            ?.background
        "
        :textColor="
          gacha?.spin_gacha_1_screen?.after_gacha_1_screen?.button_and_text_color?.color
        "
      />
    </div>

    <ModalAfterSpin
      v-model:visible="hasModal"
      :is-redirect="isRedirect"
      :popup-button="popupButton"
      :popup-link="popupLink"
      :popup-description="popupDescription"
      :popup-image="popupImage"
      :point-category-is-fail="pointCategoryIsFail"
      @closeModalLogin="handleCloseModalLogin"
    />
    <ModalLogin v-model="modalLogin" />

    <Dialog
      v-model:visible="modalSpinWarning"
      modal
      :closable="false"
      :dismissableMask="false"
      :closeOnEscape="false"
      class="!w-11/12 !max-w-sm border border-exd-gray-44"
      :style="{
        background: settings?.global?.modal?.background_color,
      }"
    >
      <template #container>
        <div
          class="flex flex-col items-center justify-center w-full gap-4 px-6 py-6"
        >
          <IconsWarning
            class="w-10 h-10"
            :style="{ color: settings?.global?.icon_color?.background }"
          />
          <div class="w-10/12 text-center">
            <p
              class="font-bold text-exd-1424"
              :style="{
                color: settings?.global?.modal?.text_color,
              }"
            >
              {{ errorMessages }}
            </p>
          </div>
          <SolidButton
            :label="t('back_to_top')"
            :bgColor="gachaSettings?.after_gacha_screen?.data?.button_and_text_color?.background"
            :textColor="gachaSettings?.after_gacha_screen?.data?.button_and_text_color?.color"
            :on-click="() => navigateTo('/')"
          />
        </div>
      </template>
    </Dialog>
  </div>

  <!-- <AutoplayVideo
    v-if="!externalRedeemStore.isExternalGacha && (playVideo || shouldShowCharacterScreen)"
    :trigger-play="playVideo || shouldShowCharacterScreen"
    :light-loading="true"
    :src="gacha?.spin_gacha_2_screen?.gacha_2_video"
    :muted="isInstagram"
    @ended="handleGoToCharacter"
  /> -->
</template>

<script setup>
import moment from 'moment'
import { useI18n } from 'vue-i18n'
import { useExternalRedeemStore } from '~/stores/external-redeem'

const router = useRouter()
const route = useRoute()

const externalRedeemStore = useExternalRedeemStore()

const apiPoint = ref(null)
const USER = useCookie('USER')
const TOKEN = useCookie('TOKEN')
const playVideo = ref(false)
const { encryptData, decryptData } = useEncryption()
const { isScanVerified, clearScanVerified } = useGachaVerification()
const { performSpin, getStoredResult, isEligibleForSpin } = useGachaService()

const pointImageUrl = ref(null)
const categoryImageUrl = ref(null)
const pointName = ref(null)
const giftType = ref(null)
const spinInterval = useState('spin_interval')

const hideCharacter = ref(false)
const hideStoreDetail = ref(false)
const disabledButton = ref(false)
const hasModal = ref(false)
const handleShowDialog = () => (hasModal.value = true)
const handleCloseDialog = () => (hasModal.value = false)

const isRedirect = ref(false)
const popupButton = ref('')
const popupLink = ref('')
const popupDescription = ref('')
const popupImage = ref('')
const pointCategoryIsFail = ref(false)
const modalLogin = ref(false)
const showPointOnly = ref(false)
const showPointUi = ref(false)

const settings = useState('settings')
const gachaType = computed(() => {
  return route.path.startsWith('/spin/prize/') ? 'external' : 'internal'
})
const gachaSettings = computed(() =>
  gachaType.value === 'external' ? settings.value?.external_gacha : settings.value?.gacha
)
const gacha = computed(() => gachaSettings.value)
const shouldShowCharacterScreen = computed(
  () => settings.value?.flow?.screens?.spin_gacha_2_screen?.show_character_screen
)
const isInstagram = ref(false)
const modalSpinWarning = ref(false)
const errorMessages = ref('')

const { t } = useI18n()

const handleCloseModalLogin = () => (modalLogin.value = false)

const getCurrentSlugUpper = () => {
  const storedData = useCookie('VALID_PASSWORD')
  if (storedData.value) {
    try {
      const payload = decryptData(storedData.value) || {}
      if (payload?.slug) return String(payload.slug).toUpperCase()
    } catch (error) {
      // Fallback to route param
    }
  }

  return String(route.params.randomCode || '').toUpperCase()
}

const markSpinFlowCompleted = () => {
  const slugUpper = getCurrentSlugUpper()
  if (!slugUpper) return
  localStorage.setItem(`GACHA_FLOW_COMPLETED_${slugUpper}`, 'true')
}

definePageMeta({
  middleware: 'valid-password',
  layout: 'gacha-machine',
})

const fetchImageFromApi = async () => {
  try {
    const storedData = useCookie('VALID_PASSWORD')
    if (!storedData.value) return

    const payload = decryptData(storedData.value) || {}
    const slug = payload?.slug?.toUpperCase()
    if (!slug) return

    const spinType = useState('spin_type').value
    let storage = getStoredResult(slug)

    // Jika belum ada data dari gacha sebelumnya, ATAU dia memang layak spin lagi DAN tiket scan dari /camera masih ada,
    // maka kita jalankan gacha baru. Jika tiketnya sudah dipakai oleh halaman sebelumnya, kita cukup pakai `storage` lama.
    if (!storage || (isEligibleForSpin(slug, spinType) && isScanVerified(slug))) {
      storage = await performSpin(slug, payload)
    }

    if (storage) {
      pointImageUrl.value = storage.point_image
      categoryImageUrl.value = storage.popup_image
      pointName.value = storage.point_name
      hideCharacter.value = storage.hide_character
      hideStoreDetail.value = storage.hide_store_details
      isRedirect.value = storage.is_redirect
      popupLink.value = storage.redirect_link
      popupDescription.value = storage.popup_description
      popupImage.value = storage.popup_image
      pointCategoryIsFail.value = storage.point_category_is_fail

      popupButton.value = storage.point_category_is_fail ? t('playAgain') : t('formHere')
    }
  } catch (e) {
    if (e?.status === 400) {
      errorMessages.value = e.data?.message || e._data?.message || t('no_available_data')
      modalSpinWarning.value = true
      return
    }

    if (e === 'refetch') {
      TOKEN.value = null
      USER.value = null
      fetchImageFromApi()
    }
  }
}

const reportMultipleSpin = async ({ gift_id, character_id, location_id }) => {
  try {
    const gachaService = useGachaService()
    const response = await gachaService.reportGacha({ gift_id, character_id, location_id })
  } catch (error) {
    console.log('Error report multiple spin', error)
  }
}

const handleButton = async () => {
  const showVideo =
    settings.value?.flow?.screens?.spin_gacha_2_screen?.show_character_screen

  if (showVideo) {
    playVideo.value = true
    return
  }

  if (!TOKEN.value && !USER.value) {
    handleShowDialog()
    return
  }

  await handleGoToCharacter()
}

const handleGoToCharacter = async () => {
  if (!hideCharacter.value) {
    if (
      !settings.value?.flow?.screens?.spin_gacha_1_screen?.show_point_screen
    ) {
      await fetchImageFromApi()
    }

    await navigateTo(`/spin/character/${route.params.randomCode}`)
  } else {
    markSpinFlowCompleted()
    navigateTo('/dashboard')
  }
}

const futureDateFromMinutes = (minutes) => {
  const now = new Date()
  const date = new Date(now.getTime() + minutes * 60 * 1000)
  return date.toLocaleString()
}
const handleKeydown = (event) => {
  if (hasModal.value) return
  const prevPlayVideo = playVideo.value
  if (event.key === 'Enter') {
    handleButton()
    if (playVideo.value && prevPlayVideo) {
      handleGoToCharacter()
    }
  }
}

onMounted(async () => {
  await handleGoToCharacter()
})

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
})

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
})

onMounted(async () => {
  const screens = settings.value?.flow?.screens || {}

  const showVideo = screens.spin_gacha_2_screen?.show_spin_gacha_2_video
  const showPointScreen = screens.spin_gacha_1_screen?.show_point_screen
  const showCharScreen = screens.spin_gacha_2_screen?.show_character_screen
  const showTapScreen = screens.show_user_tap_screen

  if (!showPointScreen && !showCharScreen) {
    if (showTapScreen) {
      navigateTo('/')
      return
    } else {
      navigateTo('/not-found')
      return
    }
  }

  if (!hideCharacter.value && showVideo && !showPointScreen) {
    playVideo.value = true
    return
  }

  fetchImageFromApi()

  disabledButton.value = !(showTapScreen || showCharScreen)

  await handleButton()
})

onMounted(() => {
  if (import.meta.client) {
    isInstagram.value = /Instagram/i.test(navigator.userAgent || '')
  }
})
</script>

<style scoped>
@keyframes sparkle {
  0%,
  100% {
    opacity: 0;
  }

  50% {
    opacity: 1;
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-sparkling {
  opacity: 0.4;
  transform-box: fill-box;
  transform-origin: center center;
  animation: sparkle 1s infinite cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
