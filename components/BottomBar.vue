<template>
  <div
    class="fixed bottom-0 left-0 right-0 z-50 w-full h-16 max-w-md mx-auto"
    :style="{ 'background': settings.global?.global_header_footer_color }"
  >
    <div class="inline-flex w-full gap-3">
      <div
        v-if="settings?.flow?.screens?.show_point_in_footer"
        class="absolute -top-[40px] flex flex-col justify-center items-center"
      >
        <IconsBackgroundPointRounded
          :style="{
            color:
              settings.user_dashboard?.footers?.point_background_color
                ?.background,
          }"
        />
        <p
          class="absolute top-2 text-white text-[11px] font-bold -ml-3 text-center whitespace-pre-line mt-9"
          :style="{
            color:
              settings.user_dashboard?.footers?.point_background_color?.color,
          }"
        >
          {{ settings.user_dashboard?.footers?.point_title ?? $t('currentPoints') }}
        </p>
        <div class="absolute -ml-3 bottom-2">
          <div
            v-if="store.footer_point === null"
            class="!w-20 !h-7 bg-white mb-[6px] rounded-md"
          />
          <p
            v-else
            class="font-bold text-white text-[25px]"
            :style="{
              color:
                settings.user_dashboard?.footers?.point_background_color?.color,
            }"
          >
            {{ store.footer_point > 4 ? 4 : store.footer_point }}/4<span class="text-exd-1020">{{ settings.user_dashboard?.footers?.point_suffix != undefined ? settings.user_dashboard?.footers?.point_suffix : 'pt' }}</span>
          </p>
        </div>
      </div>

      <div
        class="inline-flex flex-row justify-around w-full pt-4 sm:pt-2"
        :class="{
          'ml-[100px]': settings?.flow?.screens?.show_point_in_footer,
        }"
      >
        <BottomBarMenuIcon
          v-for="(item, index) in dynamicItems"
          :key="index"
          :icon="item.icon"
          :label="item.label"
          :on-click="item.onClick"
        />
      </div>
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
import iconPin from '~/assets/images/icon-pin.svg'
import iconStar from '~/assets/images/icon-star.svg'
import collection from '~/assets/images/collection.png'
import iconPerson from '~/assets/images/icon-person.png'
import { store } from '~/stores/dashboard.js'
import { useRouter } from 'vue-router'
import close from '~/assets/images/close.svg'

const router = useRouter()
const settings = useState('settings')

const dynamicItems = ref([])
const isNotAllowed = ref(false)
const errorMessages = ref('')
const redirectLink = ref('')

const handleItems = () => {
  const footers = settings.value?.user_dashboard?.footers;
  if (!footers) return;

  const items = footers.menus || [];

  dynamicItems.value = items.map((item, index) => {
    const label = item.footer_title_name?.value || '';
    const key = (item.footer_title_name?.key || '').toLowerCase();

    // Mapping routing berdasarkan key agar lebih stabil
    const getRouteHandler = () => {
      if (index === 0) return () => router.push('/prize');
      if (index === 1) return handleGoToRedeem;

      // Logika berdasarkan key
      if (['history', 'character'].includes(key)) {
        return () => router.push('/history');
      }
      if (['page', 'my page', 'dashboard'].includes(key)) {
        return () => router.push('/dashboard');
      }
      
      return () => {};
    };

    return {
      icon: item.icon_image || iconStar,
      label,
      onClick: getRouteHandler(),
    };
  });
};

const handleClose = () => {
  isNotAllowed.value = false
  sessionStorage.removeItem('IS_ALREADY_SPIN')
  sessionStorage.removeItem('SPIN_TYPE')
  sessionStorage.removeItem('READY_SPIN_AFTER_DATE')
  sessionStorage.removeItem('IS_QUOTA_AVAILABLE')
  sessionStorage.removeItem('LOCATION_SLUG')
  sessionStorage.removeItem('PRIZE_NOT_FOUND')
}

const LOCALE = useCookie('LOCALE')

const handleGoToRedeem = async () => {
  try {
    const { getNextRedeemId } = usePrizeService()
    const response = await getNextRedeemId({ lang: LOCALE.value || 'en' })

    if (response?.status && response?.data?.user_point_id) {
      navigateTo(`/redeem/${response.data.user_point_id}`)
    } else if (response?.message) {
      errorMessages.value = response.message
      isNotAllowed.value = true
    }
  } catch (error) {
    const errMessage = error?._data?.message || error?.response?.data?.message || error?.message
    if (errMessage) {
      errorMessages.value = errMessage
      isNotAllowed.value = true
    }
  }
}

onMounted(() => {
  store.fetchingDashboardData()
  handleItems()
})
</script>
