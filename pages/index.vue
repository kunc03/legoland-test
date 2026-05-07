<template>
  <div
    @touchmove.prevent
    class="flex flex-col grow !bg-no-repeat !bg-cover !bg-center justify-between relative overflow-hidden cursor-pointer pb-5"
    :style="{
      background:
        settings?.gacha?.user_tap_splash_screen?.background.type === 'image'
          ? `url(${settings?.gacha?.user_tap_splash_screen?.background.value})`
          : settings?.gacha?.user_tap_splash_screen?.background.value,
    }"
    @click="handleShowModal"
  >
    <div class="flex flex-col items-center justify-end h-full">
      <div
        class="w-full h-[150px] flex flex-col justify-end pb-[8%] items-center gap-3"
      >
        <p
          class="font-semibold text-center text-white underline cursor-pointer sm:text-exd-1320 text-exd-1218"
          @click.stop="openBookmarkLink"
        >
          {{ settings?.gacha?.user_tap_splash_screen?.url?.url_text }}
        </p>
      </div>
    </div>

    <!-- container scrollable -->

    <!-- Tap screen -->
  </div>

  <ModalLogin
    v-model="hasModal"
    :email="emailVerified"
    @logged-in="handleLoggedIn"
  />

  <StepWalkthrough
    v-model="hasWalkthrough"
    :steps="walkthroughSteps"
    :bgColor="
      settings?.register_login?.successful_member_registration_page
        ?.button_text_and_color?.background
    "
    :textColor="
      settings?.register_login?.successful_member_registration_page
        ?.button_text_and_color?.color
    "
    @done="onWalkthroughDone"
  />

  <WarningPopUp
    :is-open="isComplete"
    :on-close="handleClose"
    :has-button="true"
    :on-click-button="handleDialog"
    :label-button="
      settings?.register_login?.successful_member_registration_page?.button_text
    "
    :modal-title="
      settings?.register_login?.successful_member_registration_page?.pop_up_text
    "
    :bgColor="
      settings?.register_login?.successful_member_registration_page
        ?.button_text_and_color?.background
    "
    :textColor="
      settings?.register_login?.successful_member_registration_page
        ?.button_text_and_color?.color
    "
  />

  <WarningPopUp
    :is-open="isFailed"
    :on-close="handleClose"
    :has-button="true"
    :on-click-button="handleDialog"
    label-button="GO!"
    :modal-title="$t('verificationFailed')"
  />
</template>

<script setup>
import { nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import WarningPopUp from '~/components/WarningPopUp.vue'
import step1 from '~/assets/images/step-1.png'
import step2 from '~/assets/images/step-2.png'
import city from '~/assets/images/city.png'
import step3 from '~/assets/images/step-3.png'
import step4 from '~/assets/images/step-4.png'
import step5 from '~/assets/images/step-5.png'
import step6 from '~/assets/images/step-6.png'

const route = useRoute()
const router = useRouter()
const { setSourceFrom } = useRegister()
const hasModal = ref(false)
const hasWalkthrough = ref(false)
const isComplete = ref(false)
const isFailed = ref(false)
const emailVerified = ref('')

const { t } = useI18n()
const authService = useAuthService()

const walkthroughSteps = computed(() => [
  { image: city, text: t('step1') },
  { image: city, text: t('step2') },
  { image: step3, text: t('step3') },
  { image: step4, text: t('step4') },
  { image: step5, text: t('step5') },
  { image: step6, text: t('step6') },
])

const handleLoggedIn = ({ isFirstLogin } = {}) => {
  hasModal.value = false
  if (isFirstLogin) {
    hasWalkthrough.value = true
  } else {
    navigateTo('/dashboard', { replace: true })
  }
}

const onWalkthroughDone = () => {
  navigateTo('/dashboard', { replace: true })
}

const TOKEN = useCookie('TOKEN')
const USER = useCookie('USER')
const VALID_PASSWORD = useCookie('VALID_PASSWORD')
const settings = useState('settings')

const handleShowModal = () => {
  hasModal.value = true
  setSourceFrom('top')
}
const handleDialog = async () => {
  isComplete.value = false
  isFailed.value = false
  router.push('/')
  await nextTick()
  handleShowModal()
}

const handleClose = () => {
  isComplete.value = false
  isFailed.value = false
}

const form = ref({
  emailAddress: '',
  password: '',
})

const checkVerified = async (verified) => {
  try {
    const { status, data } = await authService.decryptLoginToken(verified)
    if (status && data && data.email) {
      emailVerified.value = data.email
      handleShowModal()
    }
  } catch (error) {
    console.log(error)
  }
}

const openBookmarkLink = () => {
  window.open(
    settings.value?.gacha?.user_tap_splash_screen?.url?.url_link,
    '_blank'
  )
}

const handleEmailVerify = async (token) => {
  await authService.verifyEmail(token)
  navigateTo('/#registration-complete')
}

const handleKeydown = (event) => {
  if (event.key === 'Enter') {
    if (isComplete.value || isFailed.value) {
      handleDialog()
    } else {
      if (!hasModal.value) {
        handleShowModal()
      }
    }
  }
}

onMounted(async () => {
  window.addEventListener('keydown', handleKeydown)

  const { verified, token } = route.query
  const hash = window.location.hash

  const clearSession = () => {
    localStorage.clear()
    sessionStorage.clear()
    TOKEN.value = null
    USER.value = null
    VALID_PASSWORD.value = null
  }

  try {
    if (verified) {
      await checkVerified(verified)
      clearSession()
    } else if (hash === '#verification-failed') {
      isFailed.value = true
      clearSession()
    } else if (token) {
      await handleEmailVerify(token)
    } else if (TOKEN.value) {
      return navigateTo('/dashboard')
    }
  } catch (err) {
    console.error(err)
    navigateTo('/')
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
})

watchEffect(() => {
  if (route.hash === '#registration-complete') {
    isComplete.value = true
  }
})
</script>

<style>
.no-scrollbar {
  overflow-x: hidden; /* Mencegah scroll horizontal */
  scrollbar-width: none; /* Sembunyikan scrollbar pada Firefox */
}

/* Sembunyikan scrollbar pada Chrome, Edge, dan Safari */
.no-scrollbar::-webkit-scrollbar {
  display: none;
}

.background-gradient {
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0) 0%,
    rgba(63, 11, 6, 0.8) 0%,
    rgba(63, 11, 6, 1) 50%
  );
  pointer-events: none;
}

.tap-screen {
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0) 0%,
    rgba(63, 11, 6, 0.8) 00%,
    rgba(63, 11, 6, 1) 100%
  );
  pointer-events: none;
}
</style>