<template>
  <HeaderBar>
    <p
      style="text-shadow: 0 3px 3px rgba(0, 0, 0, 0.16)"
      class="text-exd-gray-scorpion font-bold text-exd-1824.52"
    >
      {{ settings?.user_dashboard?.page_title }}
    </p>
  </HeaderBar>
  <div class="flex flex-col px-8 mt-[35%] sm:mt-[30%]">
    <div v-if="!hidePoint" class="flex flex-col items-center">
      <div class="flex flex-col mt-[5%] items-center">
        <p class="font-bold text-[var(--primary)] text-exd-1530">
          {{ $t('currentPoints') }}
        </p>
        <div
          v-if="!store.point"
          class="!w-32 !h-12 bg-white mb-[50%] rounded-md"
        />
        <p
          v-else
          class="relative font-bold text-[var(--primary)] text-exd-56112 -top-9"
        >
          {{ store.point }}<span class="ml-1 text-exd-1530">pt</span>
        </p>
      </div>
    </div>

    <div
      v-if="legoland"
      class="relative items-center justify-center gap-5 mb-5 w-full"
      :class="isGrid ? 'grid grid-cols-2' : 'flex flex-col'"
    >
      <div
        v-if="
          settings?.flow?.screens?.user_dashboard_screen?.show_prize_collection
        "
        class="flex items-center justify-center w-full p-6 bg-white cursor-pointer rounded-xl h-exd-130"
        :class="[
          dashboardBg, layoutClass
        ]"
        :style="{
          boxShadow: '0px 3px 3px 0px rgba(0, 0, 0, 0.1608)',
          background:
            settings.user_dashboard.prize_collections.background.type ===
            'color'
              ? settings?.user_dashboard?.prize_collections?.background.value
              : `url(${settings?.user_dashboard?.prize_collections?.background.value})`,
        }"
        @click="handleGoToPrize"
      >
        <div class="flex items-center justify-center h-[60px]">
          <img
            :src="settings?.user_dashboard?.prize_collections?.icon"
            alt="icon-gift"
            width="60"
            height="60"
            preload
            class="text-center cursor-pointer object-contain"
          />
        </div>
        <p class="font-bold text-center text-exd-gray-scorpion text-exd-1424">
          {{ settings?.user_dashboard?.prize_collections?.page_title }}
        </p>
      </div>

      <div
        v-if="
          settings?.flow?.screens?.user_dashboard_screen?.show_gacha_collections
        "
        class="flex items-center justify-center w-full p-6 bg-white cursor-pointer rounded-xl h-exd-130"
        :class="[dashboardBg, layoutClass]"
        :style="{
          boxShadow: '0px 3px 3px 0px rgba(0, 0, 0, 0.1608)',
          background:
            settings.user_dashboard.gacha_collections.background.type ===
            'color'
              ? settings?.user_dashboard?.gacha_collections?.background.value
              : `url(${settings?.user_dashboard?.gacha_collections?.background.value})`,
        }"
        @click="handleGoToPrize"
      >
        <div class="flex items-center justify-center h-[60px]">
          <img
            :src="settings?.user_dashboard?.gacha_collections?.icon"
            alt="icon-gift"
            width="60"
            height="60"
            preload
            class="text-center cursor-pointer object-contain"
          />
        </div>
        <p class="font-bold text-center text-exd-gray-scorpion text-exd-1424">
          {{ settings?.user_dashboard?.gacha_collections?.page_title }}
        </p>
      </div>

      <div
        v-if="legoland"
        class="flex items-center justify-center w-full p-6 bg-white cursor-pointer rounded-xl h-exd-130"
        :class="[
          dashboardBg, layoutClass
        ]"
        :style="{
          boxShadow: '0px 3px 3px 0px rgba(0, 0, 0, 0.1608)',
          background:
            settings.user_dashboard.gacha_collections.background.type ===
            'color'
              ? settings?.user_dashboard?.gacha_collections?.background.value
              : `url(${settings?.user_dashboard?.gacha_collections?.background.value})`,
        }"
        @click="handleGoToHistory"
      >
        <div class="flex items-center justify-center h-[60px]">
          <img
            :src="peopleImg"
            alt="icon-gift"
            width="60"
            height="60"
            preload
            class="text-center cursor-pointer object-contain"
          />
        </div>
        <p class="font-bold text-center text-exd-gray-scorpion text-exd-1424">
          {{ $t('character') }}
        </p>
      </div>

      <div
        v-if="legoland"
        class="flex items-center justify-center w-full p-6 bg-white cursor-pointer rounded-xl h-exd-130"
        :class="[
          dashboardBg, layoutClass
        ]"
        :style="{
          boxShadow: '0px 3px 3px 0px rgba(0, 0, 0, 0.1608)',
          background:
            settings.user_dashboard.gacha_collections.background.type ===
            'color'
              ? settings?.user_dashboard?.gacha_collections?.background.value
              : `url(${settings?.user_dashboard?.gacha_collections?.background.value})`,
        }"
        @click="handleGoToCamera"
      >
        <div class="flex items-center justify-center h-[60px]">
          <img
            :src="cameraImg"
            alt="icon-gift"
            width="60"
            height="60"
            preload
            class="text-center cursor-pointer object-contain"
          />
        </div>
        <p class="font-bold text-center text-exd-gray-scorpion text-exd-1424">
          {{ $t('camera') }}
        </p>
      </div>
    </div>

    <div
      v-if="!legoland"
      class="relative items-center justify-center gap-5 mb-5 w-full"
      :class="isGrid ? 'grid grid-cols-2' : 'flex flex-col'"
    >
      <div
        v-if="
          settings?.flow?.screens?.user_dashboard_screen?.show_prize_collection
        "
        class="flex items-center justify-center w-full p-6 bg-white cursor-pointer rounded-xl h-exd-130"
        :class="[
          dashboardBg, layoutClass
        ]"
        :style="{
          boxShadow: '0px 3px 3px 0px rgba(0, 0, 0, 0.1608)',
          background:
            settings.user_dashboard.prize_collections.background.type ===
            'color'
              ? settings?.user_dashboard?.prize_collections?.background.value
              : `url(${settings?.user_dashboard?.prize_collections?.background.value})`,
        }"
        @click="handleGoToPrize"
      >
        <div class="flex items-center justify-center h-[60px]">
          <img
            :src="settings?.user_dashboard?.prize_collections?.icon"
            alt="icon-gift"
            width="60"
            height="60"
            preload
            class="text-center cursor-pointer object-contain"
          />
        </div>
        <p class="font-bold text-center text-exd-gray-scorpion text-exd-1424">
          {{ settings?.user_dashboard?.prize_collections?.page_title }}
        </p>
      </div>

      <div
        v-if="
          settings?.flow?.screens?.user_dashboard_screen?.show_gacha_collections
        "
        class="flex items-center justify-center w-full p-6 bg-white cursor-pointer rounded-xl h-exd-130"
        :class="[dashboardBg, layoutClass]"
        :style="{
          boxShadow: '0px 3px 3px 0px rgba(0, 0, 0, 0.1608)',
          background:
            settings.user_dashboard.gacha_collections.background.type ===
            'color'
              ? settings?.user_dashboard?.gacha_collections?.background.value
              : `url(${settings?.user_dashboard?.gacha_collections?.background.value})`,
        }"
        @click="handleGoToHistory"
      >
        <div class="flex items-center justify-center h-[60px]">
          <img
            :src="settings?.user_dashboard?.gacha_collections?.icon"
            alt="icon-gift"
            width="60"
            height="60"
            preload
            class="text-center cursor-pointer object-contain"
          />
        </div>
        <p class="font-bold text-center text-exd-gray-scorpion text-exd-1424">
          {{ settings?.user_dashboard?.gacha_collections?.page_title }}
        </p>
      </div>
    </div>

    <div class="relative w-full border-b-exd-light-grey">
      <div
        v-for="(item, index) in visibleSubMenus"
        :key="item.key"
        class="inline-flex items-center justify-between w-full px-5 bg-white border-b-2 cursor-pointer h-exd-50 border-b-exd-light-grey"
        :class="{
          'rounded-tl-xl rounded-tr-xl': index === 0,
          'rounded-bl-xl rounded-br-xl': index === visibleSubMenus.length - 1,
        }"
        @click="item.action"
      >
        <p
          class="inline-flex items-center gap-1 font-bold text-exd-gray-scorpion grow text-exd-1424"
        >
          {{ item.text }}
          <span v-if="item.url">
            <IconsExport class="w-5 h-5 text-exd-gray-scorpion" />
          </span>
        </p>
        <img :src="arrow" alt="arrow" width="12" height="12" class="invert" />
      </div>
    </div>

    <div
      v-if="settings?.flow?.screens?.show_banner"
      class="relative inline-flex flex-col w-full mx-auto mt-5"
    >
      <Swiper
        :spaceBetween="30"
        :centeredSlides="true"
        :autoplay="{
          delay: 5000,
          disableOnInteraction: false,
        }"
        :pagination="{
          clickable: true,
        }"
        :navigation="false"
        :modules="[Autoplay, Pagination, Navigation]"
        class=""
      >
        <SwiperSlide
          v-for="(item, index) in bannerList"
          :key="index"
          class="!items-start"
        >
          <a :href="item.banner_url" target="_blank" class="w-full">
            <img :src="item.banner_image" />
          </a>
        </SwiperSlide>
      </Swiper>
    </div>
  </div>

  <Dialog
    v-model:visible="isNotAllowed"
    modal
    class="!w-11/12 !max-w-sm border border-exd-gray-44"
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
          v-if="redirectLink"
          :label="$t('gacha')"
          variant="red-coral"
          :on-click="() => goToSpin(redirectLink)"
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup>
import peopleImg from '~/assets/images/people.png'
import cameraImg from '~/assets/images/camera.png'
import arrow from '~/assets/images/arrow.svg'
import { useRouter } from 'vue-router'
import { store } from '~/stores/dashboard.js'
import close from '~/assets/images/close.svg'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Autoplay, Pagination, Navigation } from 'swiper/modules'

import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/navigation'
import { useI18n } from 'vue-i18n'

const router = useRouter()

const config = useRuntimeConfig()

definePageMeta({
  middleware: ['auth'],
  layout: 'with-bottom-bar',
})

const handleGoToHistory = () => router.push('/history')
const handleGoToPrize = () => router.push('/prize')
const profile = () => router.push('/profile')
const handleGoToCamera = () => {
  navigateTo('/camera')
}

const settings = useState('settings')

const TOKEN = useCookie('TOKEN')
const USER = useCookie('USER')
const VALID_PASSWORD = useCookie('VALID_PASSWORD')

const isNotAllowed = ref(false)
const errorMessages = ref('')
const redirectLink = ref('')
const hidePoint = ref(false)
const { t } = useI18n()

const legoland = ref(true)

const menuItemCount = computed(() => {
  let count = 0
  if (
    settings.value?.flow?.screens?.user_dashboard_screen?.show_prize_collection
  )
    count++
  if (
    settings.value?.flow?.screens?.user_dashboard_screen?.show_gacha_collections
  )
    count++
  if (legoland.value) count += 2
  return count
})

const isGrid = computed(() => {
  return menuItemCount.value > 2 || legoland.value
})

const dashboardBg = computed(() => {
  const color = settings.value?.user_dashboard?.prize_collections?.background?.value;
  return color ? `bg-${color}` : 'bg-default';
});

const layoutClass = computed(() => isGrid.value ? 'flex-col gap-1' : 'flex-row gap-4');


const visibleSubMenus = computed(() => {
  const menu = settings.value?.user_dashboard?.my_account_settings || {}
  const flow = settings.value?.flow?.screens?.sub_menus || {}

  const items = [
     {
      key: 'sub_menu_1',
      show: flow?.show_sub_menu_2_user_manual,
      text: menu?.sub_menu_1?.text,
      url: menu?.sub_menu_1?.url,
      action: () => handleSubMenuClick(menu?.sub_menu_1?.url),
    },
    {
      key: 'sub_menu_3',
      show: flow?.show_sub_menu_3_change_member_information,
      text: menu?.sub_menu_3?.text,
      action: () => navigateTo('/profile'),
    },
    {
      key: 'sub_menu_2',
      show: flow?.show_sub_menu_1_help_inquiries,
      text: menu?.sub_menu_2?.text,
      url: menu?.sub_menu_2?.url,
      action: () => handleSubMenuClick(menu?.sub_menu_2?.url),
    },
    {
      key: 'sub_menu_4',
      show: flow?.show_sub_menu_4_logout,
      text: menu?.sub_menu_4?.text,
      action: logout,
    },
  ]

  return items.filter((item) => item.show && item.text)
})

const handleSubMenuClick = (url) => {
  window.open(url, '_blank')
}

const handleClose = () => {
  isNotAllowed.value = false
  sessionStorage.removeItem('IS_ALREADY_SPIN')
  sessionStorage.removeItem('SPIN_TYPE')
  sessionStorage.removeItem('READY_SPIN_AFTER_DATE')
  sessionStorage.removeItem('IS_QUOTA_AVAILABLE')
  sessionStorage.removeItem('LOCATION_SLUG')
}

const clearLocalStorageExcept = (whitelist) => {
  const keep = {}
  whitelist.forEach((key) => {
    const val = localStorage.getItem(key)
    if (val !== null) keep[key] = val
  })

  localStorage.clear()

  Object.entries(keep).forEach(([k, v]) => localStorage.setItem(k, v))
}

const logout = async () => {
  try {
    const { data, status } = await useFetchApi('POST', 'logout')
    const WHITELIST_LOCAL = ['loginForm']

    clearLocalStorageExcept(WHITELIST_LOCAL)
    sessionStorage.clear()

    TOKEN.value = null
    USER.value = null
    VALID_PASSWORD.value = null

    await navigateTo('/')
  } catch (error) {
    const WHITELIST_LOCAL = ['loginForm']

    clearLocalStorageExcept(WHITELIST_LOCAL)
    sessionStorage.clear()

    TOKEN.value = null
    USER.value = null
    VALID_PASSWORD.value = null

    await navigateTo('/')
    console.log(error)
  }
}

const getLocalStorageItem = (key) => {
  try {
    return localStorage.getItem(key)
  } catch (error) {
    console.error(`Error accessing localStorage for key "${key}":`, error)
    return null
  }
}

const checkSpinEligibility = async () => {
  await new Promise((resolve) => setTimeout(resolve, 0))

  const isAlreadySpin = sessionStorage.getItem('IS_ALREADY_SPIN')
  const spinType = sessionStorage.getItem('SPIN_TYPE')
  const readySpinAfterDate = sessionStorage.getItem('READY_SPIN_AFTER_DATE')
  const now = formatDate(new Date())
  const isQuotaAvailable = sessionStorage.getItem('IS_QUOTA_AVAILABLE')
  const locationSlug = sessionStorage.getItem('LOCATION_SLUG')

  if (isAlreadySpin == 'true' && spinType === '1') {
    errorMessages.value = t('eligibilityMessageType1')
    isNotAllowed.value = true
  }

  if (isAlreadySpin == 'true' && spinType === '3') {
    errorMessages.value = t('eligibilityMessageType3')
    isNotAllowed.value = true
  }

  if (
    isAlreadySpin == 'true' &&
    (spinType === '4' || spinType === '5') &&
    readySpinAfterDate &&
    new Date(readySpinAfterDate).getTime() > new Date(now).getTime()
  ) {
    await countdown(readySpinAfterDate)
  }

  if (isQuotaAvailable === 'false' && locationSlug) {
    errorMessages.value = t('eligibilityMessageMaxQuota')
    isNotAllowed.value = true
    redirectLink.value = `/scan/${locationSlug}`
  }
}

function countdown(targetDate) {
  const remainingTime = () => {
    const now = formatDate(new Date())
    const difference = new Date(targetDate).getTime() - new Date(now).getTime()

    if (difference <= 0) {
      clearInterval(intervals)
      handleClose()
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
  isNotAllowed.value = true

  let intervals = setInterval(() => remainingTime(), 1000)
}

const formatDate = (date) => {
  return new Date(date)
    .toLocaleString('en-CA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZone: config.public.TIME_ZONE,
    })
    .replace(',', '')
}

const goToSpin = async (url) => {
  handleClose()
  return await navigateTo(url)
}

const bannerList = ref(
  settings.value?.user_dashboard?.my_account_settings?.banners
)

const handleKeydown = (event) => {
  if (event.key !== 'Enter') return

  event.preventDefault()
  event.stopPropagation()

  if (isNotAllowed.value) {
    goToSpin(redirectLink.value)
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
})

onMounted(() => {
  checkSpinEligibility()
  hidePoint.value = !settings.value?.flow?.screens?.show_current_point
})
</script>

<style>
.swiper {
  width: 100%;
  height: 100px;
}

.swiper-slide {
  text-align: center;
  font-size: 18px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.swiper-slide img {
  display: block;
  width: 100%;
  object-fit: cover;
}

.swiper-pagination-bullet.swiper-pagination-bullet-active {
  background: white;
}

.swiper-pagination {
  top: 78px !important;
}
</style>
