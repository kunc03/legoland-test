<template>
  <div
    v-if="settings?.flow?.screens?.spin_gacha_1_screen?.show_point_screen"
    class="relative flex flex-col items-center justify-center !bg-no-repeat !bg-cover !bg-center grow"
    :style="{
      background:
        settings?.gacha?.spin_gacha_1_screen?.after_gacha_1_screen?.background
          ?.type === 'image'
          ? `url(${settings?.gacha?.spin_gacha_1_screen?.after_gacha_1_screen?.background?.value})`
          : settings?.gacha?.spin_gacha_1_screen?.after_gacha_1_screen
              ?.background?.value,
    }"
    @touchmove="(e) => e.preventDefault()"
  >
    <SparkleStart className="top-3 z-30" />

    <img
      :src="settings?.global?.gacha_machine_image"
      alt="gacha2"
      class="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[120%] max-w-none h-auto max-h-[96svh] object-contain"
      preload
    />
    <img
      src="/images/sparkling.png"
      alt="sparkling"
      class="absolute z-10 object-cover w-full h-full transform -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2 animate-sparkling"
      preload
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
        v-if="settings?.flow?.screens?.spin_gacha_1_screen?.show_point_title"
        class="absolute text-exd-gray-scorpion bg-white flex justify-center bottom-[17%] px-4 py-3 h-auto rounded-lg w-[30vw] sm:w-[150px]"
      >
        <p class="text-[3.3vw] sm:text-[17px] max-w-[278px] text-center">
          {{ pointName }}
        </p>
      </div>
    </div>
    <!-- <div class="absolute-10 top-1/2 translate-y-[80%]"></div> -->
    <div class="w-full absolute bottom-0 z-[1100]">
      <SolidButton
        :label="
          settings.gacha.spin_gacha_1_screen?.after_gacha_1_screen.button_text
        "
        :on-click="() => handleButton()"
        has-bottom
        :disabled="disabledButton"
        :bgColor="
          settings.gacha.spin_gacha_1_screen?.after_gacha_1_screen
            .button_and_text_color?.background
        "
        :textColor="
          settings.gacha.spin_gacha_1_screen?.after_gacha_1_screen
            .button_and_text_color?.color
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
  </div>

  <AutoplayVideo
    v-if="playVideo"
    :src="settings.gacha.spin_gacha_2_screen.gacha_2_video"
    :muted="isInstagram"
    @ended="handleGoToCharacter"
  />
</template>

<script setup>
import moment from 'moment'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const route = useRoute()

const apiPoint = ref(null)
const USER = useCookie('USER')
const TOKEN = useCookie('TOKEN')
const playVideo = ref(false)
const { encryptData, decryptData } = useEncryption()

const pointImageUrl = ref(null)
const categoryImageUrl = ref(null)
const pointName = ref(null)
const giftType = ref(null)
const spinInterval = useState('spin_interval')

const hideCharacter = ref(false)
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

const settings = useState('settings')
const isInstagram = ref(false)

const { t } = useI18n()

const handleCloseModalLogin = () => (modalLogin.value = false)

definePageMeta({
  middleware: 'valid-password',
  layout: 'gacha-machine',
})

const fetchImageFromApi = async () => {
  try {
    const storedData = useCookie('VALID_PASSWORD')

    if (!storedData.value) {
      console.error('[ERROR] No verified data found in localStorage')
      return
    }

    let parsedData
    try {
      parsedData = decryptData(storedData.value)
    } catch (e) {
      console.error('[ERROR] Failed decryptData:', e)
      return
    }

    const slug = parsedData?.slug?.toUpperCase()
    const slugStorageName = `${slug}_GACHA`

    if (TOKEN.value && USER.value) {
      const payload = decryptData(storedData.value) || {}

      const { data, status } = await useFetchApi('POST', 'gacha/spin', {
        body: { ...payload },
      })

      const spinType = useState('spin_type')

      sessionStorage.setItem('IS_ALREADY_SPIN', data.is_already_spin)
      sessionStorage.setItem('SPIN_TYPE', spinType.value)
      sessionStorage.setItem(
        'READY_SPIN_AFTER_DATE',
        data?.ready_spin_after_date || ''
      )

      const storage = {
        location_id: data.userPoint?.location.id,
        point_id: data.userPoint?.point?.id,
        point_image: data.userPoint?.point?.image,
        point_name: data.userPoint?.point?.name,
        character_id: data.userCollection?.gacha_character.id,
        character_image: data.userCollection?.gacha_character.image,
        character_name: data.userCollection?.gacha_character.name,
        character_category: data.userCollection?.gacha_character.category,
        character_description: data.userCollection?.gacha_character.description,
        character_rarity:
          data.userCollection?.gacha_character.rarity_image_during_gacha,
        character_star1: data.userCollection?.gacha_character.star1,
        character_star2: data.userCollection?.gacha_character.star2,
        character_star3: data.userCollection?.gacha_character.star3,
        character_star_name1: data.userCollection?.gacha_character.star_name1,
        character_star_name2: data.userCollection?.gacha_character.star_name2,
        character_star_name3: data.userCollection?.gacha_character.star_name3,
        // gift_id: data.userPoint.gift.point_id,
        // gift_image: data.userPoint.gift.image,
        // gift_type: data.userPoint.gift.type,
        // voucher_name: data.userPoint.gift.name,
        // gift_type_image: data.userPoint.gift.typeImage,
        is_redirect: data.is_redirect,
        button_name: data.button_name,
        popup_image: data.userPoint?.point?.point_category_image,
        popup_description: data.popup_description,
        redirect_link: data.redirect_link,
        hide_character:
          !settings.value?.flow?.screens?.spin_gacha_2_screen
            ?.show_character_screen,
        hide_character_info:
          !settings.value?.flow?.screens?.spin_gacha_2_screen
            ?.show_character_details,
      }

      localStorage.setItem(slugStorageName, encryptData(storage))

      pointImageUrl.value = storage.point_image
      categoryImageUrl.value = storage.popup_image
      pointName.value = storage.point_name
      hideCharacter.value = storage.hide_character
      isRedirect.value = storage.is_redirect
      popupLink.value = storage.redirect_link
      popupDescription.value = storage.popup_description
      popupImage.value = storage.popup_image
      pointCategoryIsFail.value = storage.point_category_is_fail

      if (storage.point_category_is_fail) {
        popupButton.value = t('playAgain')
      } else {
        popupButton.value = t('formHere')
      }
    } else {
      const spinType = useState('spin_type')
      sessionStorage.setItem('SPIN_TYPE', spinType.value)
      const slugData = localStorage.getItem(slugStorageName)

      if (spinType.value === 1 && slugData) {
        const now = new Date().getTime()
        const parse = decryptData(slugData)
        const expired_date = moment(new Date(parse.spin_date))
          .add(1, 'days')
          .startOf('day')
          .valueOf()

        if (now < expired_date) {
          pointImageUrl.value = parse.point_image
          categoryImageUrl.value = parse.popup_image
          pointName.value = parse.point_name

          localStorage.setItem(slugStorageName, encryptData({ ...parse }))

          return
        }
      } else if (spinType.value === 3 && slugData) {
        const parse = decryptData(slugData)

        pointImageUrl.value = parse.point_image
        categoryImageUrl.value = parse.popup_image
        pointName.value = parse.point_name
        hideCharacter.value = parse.hide_character
        isRedirect.value = parse.is_redirect
        popupLink.value = parse.redirect_link
        popupDescription.value = parse.popup_description
        popupImage.value = parse.popup_image
        pointCategoryIsFail.value = parse.point_category_is_fail

        if (parse.point_category_is_fail) {
          popupButton.value = t('playAgain')
        } else {
          popupButton.value = t('formHere')
        }

        localStorage.setItem(
          slugStorageName,
          encryptData({ ...parse })
          // encryptData({ ...parse, is_already_spin: true })
        )
        // reportMultipleSpin({ ...parse })

        return
      } else if ((spinType.value === 4 || spinType.value === 5) && slugData) {
        const now = new Date().getTime()

        const parse = decryptData(slugData)
        if (
          parse?.spin_date_interval &&
          new Date(parse.spin_date_interval).getTime() > now
        ) {
          pointImageUrl.value = parse.point_image
          categoryImageUrl.value = parse.popup_image
          pointName.value = parse.point_name
          hideCharacter.value = parse.hide_character
          isRedirect.value = parse.is_redirect
          popupLink.value = parse.redirect_link
          popupDescription.value = parse.popup_description
          popupImage.value = parse.popup_image
          pointCategoryIsFail.value = parse.point_category_is_fail

          if (parse.point_category_is_fail) {
            popupButton.value = t('playAgain')
          } else {
            popupButton.value = t('formHere')
          }

          localStorage.setItem(slugStorageName, encryptData({ ...parse }))
          return
        }
      }

      const { data, error } = await useFetchApi('GET', 'gacha/spin', {
        params: {
          slug: parsedData.slug,
          password: parsedData.password,
        },
      })

      const storage = {
        location_id: data.location?.id ?? null,

        point_id: data.point?.id ?? null,
        point_image: data.point?.image ?? null,
        point_name: data.point?.name ?? null,
        popup_image: data.point?.point_category_image ?? null,
        popup_description: data.point?.point_category_description ?? null,
        redirect_link: data.point?.point_category_link ?? null,
        point_category_is_fail: !!data.point?.point_category_is_fail,

        character_id: data.character?.id ?? null,
        character_image: data.character?.image ?? null,
        character_name: data.character?.name ?? null,
        character_description: data.character?.description ?? null,
        character_category: data.character?.category ?? null,
        character_rarity: data.character?.rarity_image_during_gacha ?? null,
        character_star1: data.character?.star1 ?? null,
        character_star2: data.character?.star2 ?? null,
        character_star3: data.character?.star3 ?? null,
        character_star_name1: data.character?.star_name1 ?? null,
        character_star_name2: data.character?.star_name2 ?? null,
        character_star_name3: data.character?.star_name3 ?? null,
        log_id: data.log_id ?? null,

        // gift_id: data.gift.point_id,
        // gift_image: data.gift.image,
        // voucher_name: data.gift.name,
        // gift_type: data.gift.type,
        // gift_type_image: data.gift.typeImage,

        spin_interval: spinInterval?.value ?? null,
        spin_date_interval: spinInterval?.value
          ? futureDateFromMinutes(spinInterval.value)
          : null,
        is_redirect: true,
        button_name: data.button_name,
        popup_image: data.point?.point_category_image,
        popup_description: data.point?.point_category_description,
        redirect_link: data.point?.point_category_link,
        point_category_is_fail: !!data.point?.point_category_is_fail,
        spin_date: new Date().toLocaleString(),
        hide_character:
          !settings.value?.flow?.screens?.spin_gacha_2_screen
            ?.show_character_screen,
        hide_character_info:
          !settings.value?.flow?.screens?.spin_gacha_2_screen
            ?.show_character_details,
      }

      localStorage.setItem(slugStorageName, encryptData(storage))

      pointImageUrl.value = storage?.point_image
      categoryImageUrl.value = storage?.popup_image
      pointName.value = storage?.point_name
      hideCharacter.value = storage?.hide_character
      isRedirect.value = storage?.is_redirect
      popupLink.value = storage?.redirect_link
      popupDescription.value = storage?.popup_description
      popupImage.value = storage?.popup_image
      pointCategoryIsFail.value = storage?.point_category_is_fail

      if (storage.point_category_is_fail) {
        popupButton.value = t('playAgain')
      } else {
        popupButton.value = t('formHere')
      }
    }

    if (error) {
      console.error('Error fetching image:', error)
      return
    }
  } catch (e) {
    if (e === 'refetch') {
      TOKEN.value = null
      USER.value = null
      fetchImageFromApi()
    }
  }
}

const reportMultipleSpin = async ({ gift_id, character_id, location_id }) => {
  try {
    const response = await useFetchApi('POST', 'gacha/report', {
      body: { gift_id, character_id, location_id },
    })
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
    navigateTo('/dashboard')
  }
}

const futureDateFromMinutes = (minutes) => {
  const now = new Date()
  const date = new Date(now.getTime() + minutes * 60 * 1000)
  return date.toLocaleString()
}
const handleKeydown = (event) => {
  const prevPlayVideo = playVideo.value;
  if (event.key === 'Enter') {
    handleButton()
    if (playVideo.value && prevPlayVideo) {
      handleGoToCharacter()
    }
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
})

onMounted(() => {
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
