<template>
  <div
    class="relative flex flex-col items-center !bg-no-repeat justify-center !bg-center !bg-cover grow"
    :style="{
      background:
        gacha?.spin_gacha_2_screen?.after_gacha_2_screen?.background?.type === 'image'
          ? `url(${gacha?.spin_gacha_2_screen?.after_gacha_2_screen?.background?.value})`
          : gacha?.spin_gacha_2_screen?.after_gacha_2_screen?.background?.value,
    }"
    @touchmove="(e) => e.preventDefault()"
  >
    <Button
      v-if="!hideCharacterInfo"
      @click="handleBtnIntroduce"
      class="bg-rainbow !absolute text-white font-bold flex justify-center bottom-[12%] items-center rounded-full px-4 py-3 h-[14.222vw] w-[41.522vw] max-w-[191px] max-h-[65px] text-[3vw] sm:text-[16px] !z-[100]"
    >
      {{ $t('characterIntroduction') }}
      <img
        :src="opIntro ? minusIcon : plusIcon"
        alt="plus icon"
        width="15%"
        height="15%"
      />
    </Button>

    <SparkleStart className="top-3 z-30" />

    <div
      :class="{ notif: true, hide: isHiding }"
      class="flex items-center justify-center"
    >
      <img
        v-if="gacha?.spin_gacha_2_screen?.after_gacha_2_screen?.popup_icon"
        :src="gacha?.spin_gacha_2_screen?.after_gacha_2_screen?.popup_icon"
        alt="icon gift"
        class="w-8 h-8"
      />
      <p
        class="font-bold text-[12px] text-white"
        style="-webkit-text-fill-color: #ffffff"
      >
        {{
          gacha?.spin_gacha_2_screen?.after_gacha_2_screen?.popup_text
        }}
      </p>
    </div>

    <img
      :src="settings?.global?.gacha_machine_image"
      alt="gacha2"
      class="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 h-auto max-h-[96svh] object-contain"
      :class="externalRedeemStore.isExternalRedeem ? 'w-[80%] max-w-none' : 'w-[120%] max-w-none'"
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
      <CircleSpinCharacter
        class="relative top-1/2 -translate-y-[50%]"
        :imageSrc="characterImageUrl"
        :raritySrc="raritySrc"
        :hideCharacterInfo="hideCharacterInfo"
        :charTitleImage="
          gacha?.spin_gacha_2_screen?.after_gacha_2_screen?.get_character_title_image
        "
        width="100%"
        height="100%"
      />

      <div
        v-if="
          settings?.flow?.screens?.spin_gacha_2_screen?.show_character_title && charName
        "
        class="absolute flex justify-center h-auto px-4 py-3 bg-white rounded-lg text-exd-gray-scorpion"
        :class="
          hideCharacterInfo
            ? 'sm:bottom-[15%] bottom-[14.5%]'
            : 'sm:bottom-[23%] bottom-[22%]'
        "
      >
        <p class="text-[15px] max-w-[300px] text-center">{{ charName }}</p>
      </div>
    </div>

    <div class="absolute bottom-0 w-full">
      <SolidButton
        :on-click="handleButton"
        :label="gacha?.spin_gacha_2_screen?.after_gacha_2_screen?.button_text"
        :bgColor="
          gacha?.spin_gacha_2_screen?.after_gacha_2_screen?.button_and_text_color
            ?.background
        "
        :textColor="
          gacha?.spin_gacha_2_screen?.after_gacha_2_screen?.button_and_text_color?.color
        "
        :disabled="disabledButton"
        has-bottom
      />
    </div>
  </div>

  <!-- :is-redirect="isRedirect" -->
  <ModalAfterSpin
    v-if="gacha?.after_gacha_screen?.option !== '3'"
    v-model:visible="hasModal"
    :is-redirect="false"
    :popup-button="popupButton"
    :popup-link="popupLink"
    :popup-description="popupDescription"
    :popup-image="popupImage"
    :point-category-is-fail="pointCategoryIsFail"
    @closeModalLogin="handleCloseModalLogin"
  />

  <ModalLogin v-model="modalLogin" />

  <Dialog
    v-model:visible="isNotAllowed"
    modal
    class="!bg-white !w-11/12 !max-w-sm border border-exd-gray-44"
    :style="{
      background: settings?.global?.modal?.background_color,
    }"
  >
    <template #container>
      <img
        src="/images/close.svg"
        alt="close"
        width="30"
        height="30"
        preload
        class="absolute z-50 cursor-pointer right-1 top-1"
        @click="handleClose"
      />
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
        <SolidButton label="ガチャTOP" :on-click="() => goTo('/dashboard')" />
      </div>
    </template>
  </Dialog>

  <Transition name="fade-slide" mode="out-in">
    <div
      v-if="opIntro"
      class="with-scroll fixed z-40 transform -translate-x-1/2 -translate-y-[78%] rounded-lg shadow w-[88.889vw] sm:w-[350px] bg-white/90 sm:bottom-[17%] bottom-[10%] left-1/2"
    >
      <div
        class="flex flex-col gap-2 p-5 max-h-[250px] overflow-y-auto scrollbar-thin scrollbar-thumb-exd-gray-scorpion scrollbar-track-transparent"
      >
        <div
          class="inline-flex justify-between w-full gap-5"
          v-if="!hideCharacterDetails"
        >
          <p class="w-full font-bold text-exd-1424 text-exd-gray-scorpion">
            {{ charName }}
          </p>
        </div>
        <div
          v-if="!externalRedeemStore.isExternalRedeem && charCategory && !hideCharacterDetails"
          class="flex items-center gap-5 text-exd-1218"
        >
          <p
            class="border-[1px] min-w-[68px] border-exd-green text-exd-green rounded-[5px] px-2"
          >
            {{ $t('category') }}
          </p>
          <p class="text-exd-gray-scorpion">
            {{ charCategory }}
          </p>
        </div>

        <p
          class="font-medium text-exd-1424 text-exd-gray-scorpion text-word-wrap vhtml-desc"
          v-html="charDesc"
          v-if="!hideCharacterDetails"
        ></p>

        <div
          class="flex flex-col gap-2 py-4 text-exd-gray-scorpion text-exd-1424"
          v-if="!hideCharacterDetails"
        >
          <div class="max-w-full">
            <p v-if="star1" class="flex flex-row justify-between w-full">
              {{ star1Name }}
              <StarRating :value="star1" :show-value="false" />
            </p>
            <p v-if="star2" class="flex flex-row justify-between w-full">
              {{ star2Name }}<StarRating :value="star2" :show-value="false" />
            </p>
            <p v-if="star3" class="flex justify-between w-full">
              {{ star3Name }}
              <StarRating :value="star3" :show-value="false" />
            </p>
          </div>
        </div>

        <div v-if="!hideStoreDetails">
          <p class="w-full font-bold text-exd-1424 text-exd-gray-scorpion">
            {{ storeName }}
          </p>
          <p
            class="font-medium text-exd-1424 text-exd-gray-scorpion text-word-wrap vhtml-desc"
            v-html="storeDescription"
          ></p>
        </div>
      </div>
      <div
        class="absolute bottom-[-7px] left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-white/85"
      ></div></div
  ></Transition>
</template>

<script setup>
import useRegister from '~/composables/useRegister'
import iconGift from '/icons/icon-gift.svg'
import { useI18n } from 'vue-i18n'
import charImg from '~/public/images/character.png'
import plusIcon from '~/assets/icons/plus.png'
import minusIcon from '~/assets/icons/minus.png'
import StarRating from '~/components/StarRating.vue'

definePageMeta({
  middleware: 'valid-password',
  layout: 'gacha-machine',
})

const route = useRoute()
const GACHA_TYPE = useState('GACHA_TYPE', () => null)
const gachaType = computed(() => {
  if (route.query?.gachaType === 'external' || GACHA_TYPE.value === 'external_prize') {
    return 'external'
  }
  return route.path.startsWith('/spin/prize/') ? 'external' : 'internal'
})
const settings = useState('settings')
const gachaSettings = computed(() =>
  gachaType.value === 'external' ? settings.value?.external_gacha : settings.value?.gacha
)
const gacha = computed(() => gachaSettings.value)

const { setSourceFrom } = useRegister()

const opIntro = ref(false)

const hasModal = ref(false)
const errorMessages = ref('')
const modalLogin = ref(false)
const isNotAllowed = ref(false)
const isVisible = ref(false)
const isHiding = ref(false)

const USER = useCookie('USER')
const TOKEN = useCookie('TOKEN')

const characterImageUrl = ref(null)
const charName = ref(null)
const charDesc = ref(null)
const raritySrc = ref(null)
const charCategory = ref(null)
const star1 = ref(null)
const star1Name = ref(null)
const star2 = ref(null)
const star2Name = ref(null)
const star3 = ref(null)
const star3Name = ref(null)
const storeName = ref(null)
const storeDescription = ref(null)
const hideCharacterInfo = ref(true)
const hideCharacterDetails = ref(true)
const hideStoreDetails = ref(true)
const disabledButton = ref(false)

const isRedirect = ref(false)
const popupButton = ref('')
const popupLink = ref('')
const popupDescription = ref('')
const popupImage = ref('')
const pointCategoryIsFail = ref(false)
const hasClicked = ref(false)

const externalRedeemStore = useExternalRedeemStore()
const router = useRouter()

const handleClose = () => (isNotAllowed.value = false)
const handleShowDialog = () => (hasModal.value = true)
const handleCloseDialog = () => (hasModal.value = false)
const { decryptData } = useEncryption()
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

if (import.meta.client) {
  markSpinFlowCompleted()
}

const handleButton = async () => {
  const afterGacha = gacha.value?.after_gacha_screen

  if (!hasClicked.value) {
    handleBtnIntroduce()
    return
  }

  if (afterGacha?.option === '3') {
    modalLogin.value = true
  }

  if (!TOKEN.value && !USER.value) {
    handleShowDialog()
  } else {
    await navigateTo('/dashboard')
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

const fetchImage = async () => {
  try {
    const storedData = useCookie('VALID_PASSWORD')

    let slugRaw = null
    if (storedData.value) {
      try {
        const parsedData = decryptData(storedData.value)
        slugRaw = parsedData?.slug
      } catch (e) {
        slugRaw = null
      }
    }

    if (!slugRaw) {
      slugRaw = route.params?.randomCode
    }
    if (Array.isArray(slugRaw)) {
      slugRaw = slugRaw[0]
    }
    if (!slugRaw) return

    const slug = String(slugRaw).toUpperCase()

    const slugData = decryptData(localStorage.getItem(`${slug}_GACHA`))
    characterImageUrl.value = slugData?.character_image
    charName.value = slugData?.character_name
    raritySrc.value = slugData?.character_rarity
    isRedirect.value = true
    popupLink.value = slugData?.redirect_link
    popupDescription.value = slugData?.popup_description
    popupImage.value = slugData?.popup_image
    pointCategoryIsFail.value = slugData?.point_category_is_fail

    charDesc.value = slugData?.character_description
    charCategory.value = slugData?.character_category
    star1.value = calculateStar(slugData?.character_star1)
    star1Name.value = slugData?.character_star_name1
    star2.value = calculateStar(slugData?.character_star2)
    star2Name.value = slugData?.character_star_name2
    star3.value = calculateStar(slugData?.character_star3)
    star3Name.value = slugData?.character_star_name3
    storeName.value = slugData?.store_name
    storeDescription.value = slugData?.store_description

    hideCharacterInfo.value = slugData?.hide_character_info
    hideStoreDetails.value = slugData?.hide_store_details
    hideCharacterDetails.value = slugData?.hide_character_details

    if (slugData?.point_category_is_fail) {
      popupButton.value = t('playAgain')
    } else {
      popupButton.value = t('formHere')
    }
  } catch (e) {
    console.error('Unexpected error:', e)
  }
}

const goTo = async (url) => {
  await navigateTo(url)
}

const handleBtnIntroduce = () => {
  hasClicked.value = true
  opIntro.value = !opIntro.value
}

watchEffect(() => {
  if (
    !gacha.value?.spin_gacha_2_screen?.after_gacha_2_screen?.popup_icon &&
    !gacha.value?.spin_gacha_2_screen?.after_gacha_2_screen?.popup_text
  ) {
    isHiding.value = true
  }
})

const handleKeydown = (event) => {
  if (event.key === 'Enter') {
    handleButton()
  }
}

useNavigationGuard('/camera')

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
})

onMounted(() => {
  fetchImage()

  if (!settings.value?.flow?.screens?.show_user_tap_screen) {
    disabledButton.value = true
  }
})
</script>

<style scoped>
::v-deep(.p-dialog-header) {
  display: none;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-100%);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideOut {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(-100%);
  }
}

.notif {
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 5px 30px;
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
  top: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.638);

  animation: slideIn 0.3s ease-out forwards;
}

.notif.hide {
  animation: slideOut 0.3s ease-in forwards;
}

@keyframes sparkle {
  0%,
  100% {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
}

.animate-sparkling {
  opacity: 0.4;
  transform-box: fill-box;
  transform-origin: center center;
  animation: sparkle 1s infinite cubic-bezier(0.4, 0, 0.2, 1);
}

.bg-rainbow {
  background: transparent
    linear-gradient(
      113deg,
      #f8e500 0%,
      #56f800 18%,
      #00e2eb 40%,
      #3984ea 67%,
      #db35db 84%,
      #aa00b1 100%
    )
    0% 0% no-repeat padding-box;
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
  opacity: 1;
  transform: translate(-50%, -78%) scale(1);
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translate(-50%, -60%) scale(0.95);
}

.with-scroll {
  scrollbar-width: thin;
  scrollbar-color: #9a9a9a transparent; /* thumb dan track */
}
</style>
