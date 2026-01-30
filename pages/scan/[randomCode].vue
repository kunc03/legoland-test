<template>
  <div
    class="flex flex-col overflow-hidden grow"
    @touchmove="onTouchmove"
    style="touch-action: none"
  >
    <HeaderBar>
      <p
        style="text-shadow: 0 3px 3px rgba(0, 0, 0, 0.16)"
        class="header text-black font-bold text-exd-1824.52"
      >
        {{ settings?.pre_gacha?.password?.page_title }}
      </p>
    </HeaderBar>
    <div
      class="flex flex-col items-center justify-center mt-20 scan-content grow small:mt-14"
      :style="{
        background:
          settings?.pre_gacha?.password?.background_page.type === 'image'
            ? `url(${settings?.pre_gacha?.password?.background_page.value})`
            : settings?.pre_gacha?.password?.background_page.value,
        'background-size': 'cover',
        'background-repeat': 'no-repeat',
      }"
    >
      <div
        class="flex flex-col items-center justify-center gap-4 scan-otp pt-exd-81 pb-exd-60"
      >
        <p class="text-exd-gray-scorpion">
          {{ settings?.pre_gacha?.password?.page_sub_title }}
        </p>
        <OtpInput
          v-model="value"
          :length="4"
          :clear-field="isNotAllowed || wrongPassword || stepAllowLocation"
        />
      </div>
      <div class="flex flex-col w-full gap-5 grow small:gap-2">
        <div
          class="flex justify-center p-5 mx-3 font-bold password-inform bg-exd-banana text-exd-orange-700 text-exd-1424"
        >
          <span
            class="underline cursor-pointer"
            :style="{
              color: settings?.pre_gacha?.password?.label_color,
            }"
            @click="() => toggleModal()"
            >{{ settings?.pre_gacha?.password?.text }}</span
          >
        </div>
        <div class="relative flex flex-col w-full bg-gray-100 grow">
          <div class="grow p-5 small:p-[15px]">
            <ul
              ref="refsNotes"
              class="overflow-y-auto list-disc list-inside uiHeight"
              style="touch-action: pan-y"
            >
              <p
                class="mb-1 font-bold scan-title text-exd-1424 text-exd-gray-scorpion"
              >
                {{ settings?.pre_gacha?.password?.add_notes_title }}
              </p>
              <li
                class="flex flex-col gap-1 font-medium text-justify text-[12px] sm:text-[13px] text-exd-gray-scorpion"
              >
                <span v-html="terms"></span>
              </li>
            </ul>
          </div>
          <div class="fixed bottom-0 z-50 w-full max-w-md px-8 mx-auto mb-1">
            <SolidButton
              :label="settings?.pre_gacha?.password?.button_text"
              :has-loading="isLoading"
              :on-click="goToScan"
              :disabled="isLoading"
              :has-bottom="true"
              :bgColor="
                settings?.pre_gacha?.password?.button_and_text_color?.background
              "
              :textColor="
                settings?.pre_gacha?.password?.button_and_text_color?.color
              "
              class="flex-none h-[56px]"
            />
          </div>
        </div>
      </div>
    </div>
  </div>

  <Modal
    :is-open="showModal"
    :on-close="() => toggleModal()"
    :is-hidden-close="true"
  >
    <template v-slot:body>
      <div
        class="relative max-h-[55vh] overflow-y-auto flex flex-col items-center justify-start w-full gap-5 px-4 py-6"
      >
        <div class="w-full text-left">
          <p
            v-html="
              settings?.pre_gacha?.password?.get_password_guide?.popup_content
            "
            class="text-exd-gray-scorpion"
          ></p>
        </div>

        <div class="w-full mt-auto">
          <SolidButton
            :label="
              settings?.pre_gacha?.password?.get_password_guide
                ?.popup_button_text
            "
            :on-click="handleNextButton"
            :bgColor="
              settings?.pre_gacha?.password?.get_password_guide
                ?.popup_button_and_text_color?.background
            "
            :textColor="
              settings?.pre_gacha?.password?.get_password_guide
                ?.popup_button_and_text_color?.color
            "
            class="w-full !p-0"
          />
        </div>
      </div>
    </template>
  </Modal>

  <Modal
    :is-open="isNotAllowed"
    :on-close="() => handleCloseDialog()"
    :is-hidden-close="checkRadiusFailed || locationBlocked || isHiddenClose"
  >
    <template v-slot:body>
      <div class="flex flex-col items-center justify-center w-full gap-4 py-6">
        <IconsWarning
          class="w-10 h-10"
          :style="{ color: settings?.global?.icon_color?.background }"
        />
        <div v-if="errorLink || locationBlocked" class="w-10/12 text-center">
          <p
            class="font-bold text-exd-1424"
            :style="{
              color: settings?.global?.modal?.text_color,
            }"
          >
            {{ errorMessages }}
          </p>
        </div>
        <div v-else class="w-10/12 text-center">
          <p
            class="font-bold text-exd-1424 text-exd-gray-scorpion vhtml-desc"
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
    class="!rounded-2xl !w-exd-300 !max-w-sm border border-exd-gray-44"
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

  <div class="overlay" v-if="isRequestingLocation" />
</template>

<script setup>
import close from '~/assets/images/close.svg'
import HeaderBar from '~/components/HeaderBar.vue'
import ModalContent from '~/components/pages/scan/ModalContent.vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import exportIcon from '~/assets/images/export-red.svg'
import popup1 from '~/assets/images/popup-1.png'
import popup2 from '~/assets/images/popup-2.png'
import popup3 from '~/assets/images/popup-3.png'

const value = ref('')
const route = useRoute()
const router = useRouter()
const isNotAllowed = ref(false)
const showModal = ref(false)
const isRequestingLocation = ref(false)
const isLoading = ref(false)
const description = ref(null)
const errorLink = ref(false)
const errorMessages = ref('')
const refsNotes = ref(null)
const isHiddenClose = ref(false)
const locationBlocked = ref(false)
const stepAllowLocation = ref(false)

const settings = useState('settings')

const config = useRuntimeConfig()

const handleCloseDialog = () => {
  isNotAllowed.value = false
  if (locationBlocked.value) {
    checkingLocation()
  }
}

const { t, locale } = useI18n()

const wrongPassword = ref(false)

const selectedContent = ref(1)
const radiusCheckResult = ref(null)
const checkRadiusFailed = ref(false)
const checkRadiusMessage = ref(null)
const longitude = ref('')
const latitude = ref('')
const isJa = computed(() => locale.value === 'ja')

const { encryptData } = useEncryption()

definePageMeta({
  middleware: async (to, from) => {
    const location = to.params.randomCode
    const { data } = await useFetchApi('GET', '/location/password/' + location)

    if (data && data.before_spin_type === 1) {
      return navigateTo(`/spin/${location}`)
    }
    if (data && data.before_spin_type === 3) {
      return navigateTo(`/quiz/${location}`)
    }
  },
})

const terms = ref('')
const LOCALE = useCookie('LOCALE')

const getTerms = async () => {
  try {
    terms.value =
      settings.value?.pre_gacha?.password?.text2?.[LOCALE.value] || ''
  } catch (error) {
    console.error("Error: Can't get terms", error)
    terms.value = ''
  }
}

const checkPassword = async (params) => {
  isLoading.value = true 

  try {
    const { data, status } = await useFetchApi('GET', 'gacha/check', {
      params,
    })

    const validPassword = useCookie('VALID_PASSWORD')
    validPassword.value = encryptData(params)

    localStorage.removeItem('answer-password')

    isLoading.value = false
    return status
  } catch (error) {
    console.log("Error: Can't check password")

    errorLink.value = true
    if (!value.value) {
      errorMessages.value = t('passwordRequired')
    } else {
      errorMessages.value = settings.value?.pre_gacha?.password?.warning_message
    }

    wrongPassword.value = true

    setTimeout(() => {
      wrongPassword.value = false
    }, 3000)

    isLoading.value = false
  }
}

const closeStepAllowLocation = () => {
  stepAllowLocation.value = false
  selectedContent.value = 1
}

const handleNextButton = () => {
  let currSelectedContent = selectedContent.value
  // if (currSelectedContent > 2) {
  toggleModal()
  //   return
  // }

  // selectedContent.value = currSelectedContent += 1
}
const toggleModal = () => {
  selectedContent.value = 1
  showModal.value = !showModal.value
}

const goToScan = async () => {
  const location = route.params.randomCode
  const passwordValue = value.value

  const isTrue = await checkPassword({
    slug: location,
    password: passwordValue,
  })

  if (isTrue) router.push(`/spin/${location}`)
  else isNotAllowed.value = true
}

const getPassword = async (id) => {
  try {
    isLoading.value = true

    const { data } = await useFetchApi('GET', '/location/password/' + id)

    if (data) {
      description.value = data.description
      if (!data.not_required_radius) {
        await checkingLocation()
      }
    }

    isLoading.value = false
  } catch (error) {
    errorLink.value = true
    isHiddenClose.value = true
    errorMessages.value = error._data.message

    isNotAllowed.value = true
  }
}

const onTouchmove = (event) => {
  if (!refsNotes.value.contains(event.target)) {
    event.preventDefault()
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
    } else {
      isRequestingLocation.value = false
      isNotAllowed.value = true
      checkRadiusFailed.value = true
      checkRadiusMessage.value = t('locationAccessBlocked')
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

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
  document.body.classList.remove('modal-open')
})

watch(value, (newVal) => {
  localStorage.setItem('answer-password', newVal)
}, { deep: true })

const handleKeydown = (event) => {
  if (event.key === 'Enter') {
    if (!isNotAllowed.value && !isLoading.value && !stepAllowLocation.value && !showModal.value) {
      goToScan()
    } else if (showModal.value) {
      handleNextButton()
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
  const location = route.params.randomCode
  const savedAnswer = localStorage.getItem('answer-password')

  await getPassword(location)
  getTerms()

  if (savedAnswer) {
    value.value = savedAnswer
  }
})

watch(isNotAllowed, (newValue) => {
  if (newValue) {
    document.body.classList.add('modal-open')
  } else {
    document.body.classList.remove('modal-open')
  }
})
</script>

<style scoped>
::v-deep(.p-inputtext) {
  @apply border border-exd-gray-44 bg-white w-exd-40 h-exd-50 text-exd-gray-scorpion;
}

::v-deep(.p-dialog-header) {
  @apply hidden;
}

.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
}

:global(body.modal-open #__nuxt) {
  pointer-events: none;
}

/* @media screen and (max-width: 460px) { */

@media screen and (max-height: 500px) and (max-width: 320px) {
  .scan-otp {
    padding-top: 40px !important;
    padding-bottom: 20px !important;
  }

  .uiHeight {
    max-height: 98px !important;
  }
}

@media screen and (max-height: 600px) {
  .header {
    font-size: 15px;
  }

  .scan-content {
    font-size: 12px;
  }

  .scan-otp {
    padding-top: 50px;
    padding-bottom: 30px;
  }

  .password-inform {
    padding: 10px;
    font-size: 8.5px;
  }

  .scan-title {
    font-size: 13px;
  }

  .uiHeight {
    max-height: 170px;
  }

  .uiHeight li {
    font-size: 10px;
  }
}

@media screen and (min-height: 600px) and (max-width: 360px) {
  .uiHeight {
    max-height: 110px !important;
  }
}

@media screen and (min-height: 600px) {
  .uiHeight {
    max-height: 150px;
  }
}

@media screen and (min-height: 700px) {
  .uiHeight {
    max-height: 190px;
  }
}

@media screen and (min-height: 740px) {
  .uiHeight {
    max-height: 190px;
  }
}

@media screen and (min-height: 800px) {
  .uiHeight {
    max-height: 270px;
  }
}

@media screen and (min-height: 860px) {
  .uiHeight {
    max-height: 330px;
  }
}

@media screen and (min-height: 900px) {
  .uiHeight {
    max-height: 370px;
  }
}

@media screen and (min-height: 960px) {
  .uiHeight {
    max-height: 390px;
  }
}

@media screen and (min-height: 1000px) {
  .uiHeight {
    max-height: 430px;
  }
}

@media screen and (min-height: 1050px) {
  .uiHeight {
    max-height: 450px;
  }
}

@media screen and (min-height: 1100px) {
  .uiHeight {
    max-height: 480px;
  }
}

@media screen and (min-height: 1150px) {
  .uiHeight {
    max-height: 570px;
  }
}

@media screen and (min-height: 1200px) {
  .uiHeight {
    max-height: 670px;
  }
}
/* } */
</style>
