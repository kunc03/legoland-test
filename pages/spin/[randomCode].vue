<template>
  <SplashScreen v-if="settings?.flow?.screens?.show_loading_screen" @finish="isSplashComplete = true" />

  <div v-show="!settings?.flow?.screens?.show_loading_screen || settings?.flow?.screens?.show_before_gacha_screen || isSplashComplete" class="flex flex-col grow">
    <HeaderBar withLogo />

    <div
      class="relative flex flex-col !bg-no-repeat !bg-cover !bg-center grow"
      :style="{ background: settings?.gacha?.spin_gacha_1_screen?.before_gacha_1_screen?.background?.type === 'image' ? `url(${settings?.gacha?.spin_gacha_1_screen?.before_gacha_1_screen?.background?.value})` : settings?.gacha?.spin_gacha_1_screen?.before_gacha_1_screen?.background?.value }"
    >
      <div
        class="grow w-full flex flex-col items-center justify-center relative mb-4 mt-[15%]"
      >
        <img
          :src="settings?.global?.gacha_machine_image"
          alt="gacha2"
          class="absolute left-1/2 top-[57%] sm:top-[53%] transform -translate-x-1/2 -translate-y-[47%] w-full h-auto max-h-[85%] sm:max-h-[90%] object-contain"
          preload
        />

      </div>
      
      <div v-if="settings?.gacha?.spin_gacha_1_screen?.before_gacha_1_screen?.popup?.popup_needed === '1'" class="flex flex-col items-center justify-center w-full gap-4 px-6 py-6 mb-8">
        <p class="text-white underline cursor-pointer sm:text-exd-1424 text-exd-1218" @click="handleAboutSpin">{{ settings?.gacha?.spin_gacha_1_screen?.before_gacha_1_screen?.popup?.popup_text }}</p>
      </div>

      <SolidButton
        :label="settings?.gacha?.spin_gacha_1_screen?.before_gacha_1_screen?.button_text"
        :bgColor="settings?.gacha?.spin_gacha_1_screen?.before_gacha_1_screen?.button_and_text_color?.background"
        :textColor="settings?.gacha?.spin_gacha_1_screen?.before_gacha_1_screen?.button_and_text_color?.color"
        :disabled="isLoading"
        :has-loading="isLoading"
        :on-click="() => nextToSpin()"
        has-bottom
      />
    </div>
  </div>

  <AutoplayVideo
    v-if="playVideo"
    :src="settings.gacha.spin_gacha_1_screen.gacha_1_video"
    @ended="goToSpinPoint"
  />

  <Modal
    :is-open="isNotAllowed"
    :on-close="() => handleCloseDialog()"
    :is-hidden-close="checkRadiusFailed || locationBlocked || isHiddenClose"
  >
    <template v-slot:body>
      <div class="flex flex-col items-center justify-center w-full gap-4 py-6">
        <IconsWarning class="w-10 h-10" :style="{ color: settings?.global?.icon_color?.background }" />
        <div v-if="errorLink || locationBlocked" class="w-10/12 text-center">
          <p 
            class="font-bold text-exd-1424"
            :style="{
              color: settings?.global?.modal?.text_color
            }"
          >
            {{ errorMessages }}
          </p>
        </div>
        <div v-else class="w-10/12 text-center">
          <p
            class="font-bold text-exd-1424 text-exd-gray-scorpion vhtml-desc"
            :style="{
              color: settings?.global?.modal?.text_color
            }"
            v-html="checkRadiusMessage"
          ></p>
        </div>
      </div>
    </template>
  </Modal>

  <Dialog
    :visible="stepAllowLocation"
    modal
    @update:visible="() => closeStepAllowLocation()"
    class="!rounded-2xl !text-exd-gray-scorpion !bg-white !w-exd-300 !max-w-sm border border-exd-gray-44"
    pt:root:class="!border-none"
    pt:root:style="width: 21rem !important"
    :style="{
      fontFamily: '-apple-system, Noto Sans JP, sans-serif',
      fontSize: '1rem',
      background: settings?.global?.modal?.background_color,
      color: settings?.global?.modal?.text_color,
    }"
  >
    <template #container>
      <div
        class="w-full flex flex-col justify-center items-center gap-1.5 py-6 px-6 overflow-hidden relative"
      >
        <h3
          class="text-center max-w-[14rem] text-lg font-medium mt-2 flex-none"
        >
          {{ $t('titleChangeLocationSettings') }}
        </h3>
        <div class="flex flex-col flex-1 overflow-y-auto">
          <StepDown number="1">
            <template v-slot:header>
              {{ $t('settingWithPick') }}
            </template>
            <template v-slot:body>
              <img src="/images/apple_settings.webp" class="w-14 h-14" />
              <span class="text-exd-0910">{{ $t('setting') }}</span>
            </template>
          </StepDown>

          <StepDown number="2" type="col">
            <template v-slot:header>
              <span class="text-exd-red-vermilion">
                {{ $t('privacyAndSecurity') }}
              </span>
              {{ $t('littleBelow') }}
            </template>
            <template v-slot:body>
              <div class="">
                <img src="/images/privacy_and_security.png" class="w-full" />
              </div>
            </template>
          </StepDown>
          <StepDown number="3" type="col">
            <template v-slot:header>
              <span class="text-exd-red-vermilion">
                {{ $t('locationServices') }}
              </span>
              {{ $t('top') }}
            </template>
            <template v-slot:body>
              <div class="">
                <img src="/images/location_services.png" class="w-full" />
              </div>
            </template>
          </StepDown>
          <StepDown
            v-if="getBrowserInfo === 'Apple Safari'"
            number="4"
            type="col"
          >
            <template v-slot:header>
              <span class="text-exd-red-vermilion"
                >{{ $t('safariWebsite') }}
              </span>
            </template>
            <template v-slot:body>
              <div class="">
                <img src="/images/safari.png" class="w-full" />
              </div>
            </template>
          </StepDown>
          <StepDown
            v-else-if="getBrowserInfo === 'Chrome'"
            number="4"
            type="col"
          >
            <template v-slot:header>
              <span class="text-exd-red-vermilion">Chrome </span>
            </template>
            <template v-slot:body>
              <div class="">
                <img src="/images/chrome.png" class="w-full" />
              </div>
            </template>
          </StepDown>
          <StepDown v-else-if="getBrowserInfo === 'Bing'" number="4" type="col">
            <template v-slot:header>
              <span class="text-exd-red-vermilion">Bing </span>
            </template>
            <template v-slot:body>
              <div class="">
                <img src="/images/bing.png" class="w-full" />
              </div>
            </template>
          </StepDown>
          <StepDown
            v-else-if="getBrowserInfo === 'Opera'"
            number="4"
            type="col"
          >
            <template v-slot:header>
              <span class="text-exd-red-vermilion">
                {{ $t('browserEg') }}
              </span>
            </template>
            <template v-slot:body>
              <div class="">
                <img src="/images/safari.png" class="w-full" />
              </div>
            </template>
          </StepDown>
          <StepDown
            v-else-if="getBrowserInfo === 'Firefox'"
            number="4"
            type="col"
          >
            <template v-slot:header>
              <span class="text-exd-red-vermilion">Firefox</span>
            </template>
            <template v-slot:body>
              <div class="">
                <img src="/images/firefox.png" class="w-full" />
              </div>
            </template>
          </StepDown>
          <StepDown v-else-if="getBrowserInfo === 'Edge'" number="4" type="col">
            <template v-slot:header>
              <span class="text-exd-red-vermilion">Edge</span>
            </template>
            <template v-slot:body>
              <div class="">
                <img src="/images/edge.png" class="w-full" />
              </div>
            </template>
          </StepDown>
          <StepDown
            v-else-if="getBrowserInfo === 'Unknown'"
            number="4"
            type="col"
          >
            <template v-slot:header>
              <span class="text-exd-red-vermilion">
                {{ $t('browserEg') }}
              </span>
            </template>
            <template v-slot:body>
              <div class="">
                <img src="/images/safari.png" class="w-full" />
              </div>
            </template>
          </StepDown>
          <StepDown number="5" type="col">
            <template v-slot:header>
              <i18n-t keypath="changeToWhileUsingApp" tag="div" scope="global">
                <template v-slot:whileUsingApp>
                  <span class="text-exd-red-vermilion">
                    {{ $t('whileUsingApp') }}</span
                  >
                </template>
              </i18n-t>
            </template>
            <template v-slot:body>
              <div class="">
                <img src="/images/while_using_this_app.png" class="w-full" />
              </div>
            </template>
          </StepDown>
          <StepDown number="6" type="col" :isArrow="false">
            <template v-slot:header>
              <i18n-t
                keypath="tapBrowserRefreshToComplete"
                tag="div"
                scope="global"
              >
                <template v-slot:tapBrowserRefresh>
                  <span class="text-exd-red-vermilion">
                    {{ $t('tapBrowserRefresh') }}</span
                  >
                </template>
              </i18n-t>
            </template>
            <template v-slot:body>
              <div class="">
                <img
                  src="/images/tap_the_browser_refresh_button.png"
                  class="w-full"
                />
              </div>
            </template>
          </StepDown>
        </div>
      </div>
    </template>
  </Dialog>

  <Modal
    :is-open="showAboutSpin"
    :on-close="() => closeShowAboutSpin()"
  >
    <template v-slot:body>
      <div
        class="relative max-h-[55vh] overflow-y-auto flex flex-col items-center justify-start w-full gap-5 px-4 py-6"
      >
        <div class="w-full text-left">
          <p
            v-html="
              settings?.gacha?.spin_gacha_1_screen?.before_gacha_1_screen?.popup?.popup_content
            "
            class="text-exd-gray-scorpion"
          ></p>
        </div>
      </div>
    </template>
  </Modal>

  <Dialog
    v-model:visible="modalSpinWarning"
    modal
    class="!w-11/12 !max-w-sm border border-exd-gray-44"
    :style="{
      background: settings?.global?.modal?.background_color
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
        @click="handleCloseModalSpinWarning"
      />
      <div
        class="flex flex-col items-center justify-center w-full gap-4 px-6 py-6"
      >
        <IconsWarning class="w-10 h-10" :style="{ color: settings?.global?.icon_color?.background }" />
        <div class="w-10/12 text-center">
          <p 
            class="font-bold text-exd-1424"
            :style="{
              color: settings?.global?.modal?.text_color
            }"
          >
            {{ errorMessages }}
          </p>
        </div>
        <SolidButton
          v-if="redirectLink"
          :label="$t('gacha')"
          variant="red-coral"
          :on-click="() => continueToSpin(redirectLink)"
        />
      </div>
    </template>
  </Dialog>

  <div class="overlay" v-if="isRequestingLocation" />
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import moment from 'moment'
import close from '~/assets/images/close.svg'

const settings = useState('settings')

const router = useRouter()
const route = useRoute()
const errorMessages = ref('')
const isNotAllowed = ref(false)
const showAboutSpin = ref(false)
const playVideo = ref(false)
const handleOpenDialog = () => (isNotAllowed.value = true)
const handleCloseDialog = () => (isNotAllowed.value = false)
const handleAboutSpin = () => (showAboutSpin.value = true)

const { encryptData, decryptData } = useEncryption()
const { t, locale } = useI18n()
const config = useRuntimeConfig()

const isLoading = ref(false)
const errorLink = ref(false)
const isHiddenClose = ref(false)
const stepAllowLocation = ref(false)
const selectedContent = ref(1)
const wrongPassword = ref(false)
const radiusCheckResult = ref(null)
const checkRadiusFailed = ref(false)
const checkRadiusMessage = ref(null)
const longitude = ref('')
const latitude = ref('')
const showModal = ref(false)
const isRequestingLocation = ref(false)
const description = ref(null)
const refsNotes = ref(null)
const locationBlocked = ref(false)
const isSplashComplete = ref(false)
const modalSpinWarning = ref(false)
const redirectLink = ref('')

const handleCloseModalSpinWarning = () => {
  modalSpinWarning.value = false
}

definePageMeta({
  layout: 'gacha-machine',
  middleware: async (to, from) => {
    const { decryptData } = useEncryption()

    const location = to.params.randomCode
    const validPassword = useCookie('VALID_PASSWORD')

    const { data } = await useFetchApi('GET', '/location/password/' + location)

    if (data) {
      const beforeSpinType = useState('before_spin_type', () => 1)
      beforeSpinType.value = data.before_spin_type

      const notRequiredRadius = useState('not_required_radius', () => 0)
      notRequiredRadius.value = data.not_required_radius

      const spinType = useState('spin_type', () => 0)
      spinType.value = data.spin_type

      if (data.spin_type === 4 || data.spin_type === 5) {
        const spinInterval = useState('spin_interval', () => 0)
        spinInterval.value = data.spin_interval
      }
    }

    const validSlug = decryptData(validPassword.value || '{}')

    if (data && data.before_spin_type === 2 && validSlug?.slug !== location) {
      return navigateTo(`/scan/${location}`)
    }

    if (data && data.before_spin_type === 3 && validSlug?.slug !== location) {
      return navigateTo(`/quiz/${location}`)
    }
  },
})

const nextToSpin = async () => {
  const beforeSpinType = useState('before_spin_type')
  const notRequiredRadius = useState('not_required_radius')

  await checkSpinEligibility()

  if (beforeSpinType.value) {
    const validPassword = useCookie('VALID_PASSWORD')
    validPassword.value = encryptData({ slug: route.params.randomCode })
  }

  if (!notRequiredRadius.value) {
    await checkingLocation()
  }

  if (stepAllowLocation.value || isNotAllowed.value || modalSpinWarning.value) {
    return
  }
      playVideo.value = true

  // if (settings.value?.flow?.screens?.show_before_gacha_screen) { 
  //   if (settings.value?.flow?.screens?.spin_gacha_1_screen?.show_point_screen && settings.value?.flow?.screens?.spin_gacha_1_screen?.show_spin_gacha_1_video) {
  //     playVideo.value = true
  //   } else {
  //     await navigateTo(`/spin/point/${route.params.randomCode}`)
  //   }
  // }
}

const goToSpinPoint = async () => {
  const notRequiredPin = useState('not_required_pin')
  const notRequiredRadius = useState('not_required_radius')

  if (notRequiredPin.value) {
    const validPassword = useCookie('VALID_PASSWORD')
    validPassword.value = encryptData({ slug: route.params.randomCode })
  }

  if (!notRequiredRadius.value) {
    await checkingLocation()
  }

  if (stepAllowLocation.value || isNotAllowed.value) {
    return
  }
  await navigateTo(`/spin/point/${route.params.randomCode}`)
}

const closeStepAllowLocation = () => {
  stepAllowLocation.value = false
  selectedContent.value = 1
}

const closeShowAboutSpin = () => {
  showAboutSpin.value = false
}

const getPassword = async (id) => {
  try {
    isLoading.value = true

    const { data } = await useFetchApi('GET', '/location/password/' + id)

    if (!data.not_required_radius) {
      await checkingLocation()
    }

    checkSpinEligibility()

    isLoading.value = false
  } catch (error) {
    errorLink.value = true
    isHiddenClose.value = true
    errorMessages.value = error._data.message

    isNotAllowed.value = true
  }
}

const checkingLocation = async () => {
  const handleSuccess = (position) => {
    latitude.value = position.coords.latitude
    longitude.value = position.coords.longitude
    radiusCheck()
    isRequestingLocation.value = false
  }

  const showErrorBlockedLocation = () => {
    const isMobileDevice = navigator.userAgent.toLowerCase().includes('mobi')

    if (
      isMobileDevice &&
      (navigator.userAgent.includes('iPhone') ||
        navigator.userAgent.includes('iPad'))
    ) {
      stepAllowLocation.value = true
      isRequestingLocation.value = false
      document.body.style.pointerEvents = 'none'
    } else {
      isRequestingLocation.value = false
      isNotAllowed.value = true
      checkRadiusFailed.value = true
      checkRadiusMessage.value = t('locationAccessBlocked')
      document.body.style.pointerEvents = 'none'
    }
  }

  const handleError = (error) => {
    console.log('Geolocation error:', error)
    showErrorBlockedLocation()
  }

  const handleDenied = () => {
    showErrorBlockedLocation()
  }

  const checkGeolocationSupport = () => {
    return 'geolocation' in navigator
  }

  const requestLocation = () => {
    isRequestingLocation.value = true
    navigator.geolocation.getCurrentPosition(handleSuccess, handleError)
  }

  if ('permissions' in navigator) {
    try {
      const permissionStatus = await navigator.permissions.query({
        name: 'geolocation',
      })

      switch (permissionStatus.state) {
        case 'granted':
          isRequestingLocation.value = false
          navigator.geolocation.getCurrentPosition(handleSuccess, handleError)
          break
        case 'prompt':
          if (checkGeolocationSupport()) requestLocation()
          break
        case 'denied':
          handleDenied()
          break
      }

      // Listen for changes to the permission status
      permissionStatus.onchange = () => {
        if (permissionStatus.state === 'granted') {
          isRequestingLocation.value = false
        } else if (permissionStatus.state === 'denied') {
          handleDenied()
        }
      }
    } catch (error) {
      console.error('Permission query error:', error)
    }
  } else if (checkGeolocationSupport()) {
    requestLocation()
  } else {
    isNotAllowed.value = true
  }
}

const radiusCheck = async () => {
  const location = route.params.randomCode
  isLoading.value = true
  try {
    const { data } = await useFetchApi('POST', 'radius-check', {
      body: {
        lat: latitude.value,
        long: longitude.value,
        slug: location,
      },
    })
    radiusCheckResult.value = data
  } catch (error) {
    checkRadiusMessage.value = error?._data.message
    checkRadiusFailed.value = true
    isNotAllowed.value = true
    document.body.style.pointerEvents = 'none'
  } finally {
    isLoading.value = false
  }
}

const getBrowserInfo = computed(() => {
  const userAgent = navigator.userAgent

  if (userAgent.indexOf('Firefox') > -1 || userAgent.indexOf('FxiOS') > -1) {
    return 'Firefox'
  } else if (
    userAgent.indexOf('Opera') > -1 ||
    userAgent.indexOf('OPR') > -1 ||
    userAgent.indexOf('OPT') > -1
  ) {
    return 'Opera'
  } else if (
    userAgent.indexOf('Chrome') > -1 ||
    userAgent.indexOf('CriOS') > -1
  ) {
    return 'Chrome'
  } else if (userAgent.indexOf('BingSapphire') > -1) {
    return 'Bing'
  } else if (userAgent.indexOf('EdgiOS') > -1) {
    return 'Edge'
  } else if (userAgent.indexOf('Safari') > -1) {
    return 'Apple Safari'
  } else {
    return 'Unknown'
  }
})

const checkSpinEligibility = async () => {
  await new Promise((resolve) => setTimeout(resolve, 0))

  const slug = route.params.randomCode.toLocaleUpperCase()
  const slugStorageName = `${slug}_GACHA`
  const slugData = localStorage.getItem(slugStorageName)
  const parse = slugData && decryptData(slugData)

  const spinType = useState('spin_type').value
  const readySpinAfterDate = parse?.spin_date_interval
  const now = new Date().getTime()

  if (slugData && spinType === 1) {
    const expired_date = moment(new Date(parse.spin_date))
      .add(1, 'days')
      .startOf('day')
      .valueOf()

    if (now < expired_date) {
      errorMessages.value = t('eligibilityMessageType1')
      modalSpinWarning.value = true
    }
  }

  if (slugData && spinType === 3) {
    errorMessages.value = t('eligibilityMessageType3')
    modalSpinWarning.value = true
  }

  if (
    slugData &&
    (spinType === 4 || spinType === 5) &&
    readySpinAfterDate &&
    new Date(readySpinAfterDate).getTime() > now
  ) {
    await countdown(readySpinAfterDate)
  }
}

function countdown(targetDate) {
  const remainingTime = () => {
    const now = new Date().getTime()
    const difference = new Date(targetDate).getTime() - now

    if (difference <= 0) {
      clearInterval(intervals)
      handleCloseModalSpinWarning()
      return
    }

    const minutes = Math.floor(difference / (1000 * 60))
    const seconds = Math.floor((difference % (1000 * 60)) / 1000)

    errorMessages.value = t('eligibilityMessageType4', {
      minutes,
      seconds,
    })
  }

  remainingTime()
  modalSpinWarning.value = true

  let intervals = setInterval(() => remainingTime(), 1000)
}

const continueToSpin = async (url) => {
  if (settings.value?.flow?.screens?.spin_gacha_1_screen?.show_spin_gacha_1_video) {
    playVideo.value = true
    return
  }
}

const futureDateFromMinutes = (minutes) => {
  const now = new Date()
  const date = new Date(now.getTime() + minutes * 60 * 1000)
  return date.toLocaleString()
}

watch(isNotAllowed, (newValue) => {
  if (newValue) {
    document.body.classList.add('modal-open')
  } else {
    document.body.classList.remove('modal-open')
  }
})

onMounted(() => {
  const location = route.params.randomCode
  getPassword(location)
})
</script>

<style>
:global(body.modal-open) {
  pointer-events: none;
}

:global(body.modal-open .p-dialog) {
  pointer-events: auto;
}
</style>
