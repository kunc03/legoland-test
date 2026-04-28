<template>
  <HeaderBar hasBack withLogo />
  <div
    class="flex flex-col mt-20 grow"
    :style="{
      background:
        step2Data?.background_page.type === 'image'
          ? `url(${step2Data?.background_page.value})`
          : step2Data?.background_page.value,
      'background-size': 'cover',
      'background-repeat': 'no-repeat',
    }"
  >
    <p
      class="text-exd-1724 text-center font-extrabold max-w-[356px] mx-auto p-4 my-4"
      :style="{ color: textColor }"
    >
      {{ step2Data.page_sub_title }}
    </p>

    <div
      class="flex flex-col justify-between gap-5 py-8 grow px-7"
      :style="{ background: step2Data?.image_background_color }"
    >
      <div class="flex flex-col gap-5">
        <div class="relative w-full h-auto mx-auto bg-white rounded-lg">
          <LazyCharacterCard
            :image="prizeDetailData.image"
            variant="without-background"
          />
        </div>
        <div class="flex flex-col gap-4">
          <div class="inline-flex justify-between w-full gap-5">
            <div class="flex flex-col text-exd-gray-scorpion">
              <template v-for="(text, index) in step2Texts" :key="index">
                <Skeleton
                  v-if="isFetching"
                  class="!h-5 mb-1 bg-exd-gray-scorpion"
                  width="10rem"
                />
                <p v-else class="font-bold text-exd-1424">
                  {{ text }}
                </p>
              </template>
            </div>
            <template v-if="isFetching">
              <Skeleton
                class="!rounded-full"
                :style="{
                  background: step2Data.button_and_text_color?.background,
                }"
                width="3rem"
                height="3rem"
              />
            </template>
            <img v-else-if="
                prizeDetailData.rarity?.type === 'image' &&
                prizeDetailData.rarity?.show_rarity
              "
              :src="$imgV(prizeDetailData.rarity?.image)"
              alt="arrow"
              width="50"
              height="0"
              class=""
              loading="lazy"
              preload
            />

            <p
              v-else-if="
                prizeDetailData.rarity?.type === 'color' &&
                prizeDetailData.rarity?.show_rarity
              "
              class="font-bold text-exd-1824.52 text-white p-1 flex items-center justify-center rounded-full right-0 top-5 bg-no-repeat bg-cover bg-center w-12 h-12"
              :style="{ background: prizeBg }"
            >
              {{ prizeTypeText }}
            </p>
          </div>

          <HeadingSection
            :is-fetching="isFetching"
            :title="$t('conditionsOfUse')"
            :body="prizeDetailData.terms_of_use"
          />
        </div>
      </div>

      <SlideUnlock
        ref="vueslideunlock"
        :auto-width="true"
        :circle="true"
        :width="400"
        :height="56"
        :text="step2Data?.button_text"
        :success-text="$t('claimed')"
        name="slideunlock"
        @completed="handleSwipe()"
        :bgColor="step2Data?.button_and_text_color?.background"
      />
    </div>
  </div>

  <Dialog
    v-model:visible="isRedeemDialogVisible"
    modal
    class="!w-exd-300 h-exd-200 !max-w-sm border border-exd-gray-44 rounded-xl"
    :style="{
      background: settings?.global?.modal?.background_color,
    }"
  >
    <template #container>
      <img :src="$imgV(close)"
        alt="close"
        width="30"
        height="30"
        preload
        class="absolute z-50 cursor-pointer right-1 top-1"
        @click="handleClose"
      />
      <div
        class="flex flex-col items-center justify-end w-full h-full gap-4 p-5"
      >
        <div class="flex flex-col items-center justify-center w-full gap-8">
          <p class="font-bold text-exd-1424 text-exd-gray-scorpion">
            {{ redeemMessage }}
          </p>

          <SolidButton
            :on-click="handleDialog"
            :has-loading="isLoading"
            :label="$t('next')"
            :bgColor="step2Data?.button_and_text_color?.background"
            :textColor="step2Data?.button_and_text_color?.color"
          />
        </div>
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
      <img :src="$imgV(close)"
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
            :bgColor="step2Data?.button_and_text_color?.background"
            :textColor="step2Data?.button_and_text_color?.color"
            class="w-full"
          />
        </div>
      </div>
    </template>
  </Dialog>
</template>

<script setup>
import { useRouter } from 'vue-router'
import SlideUnlock from '~/components/SlideUnlock.vue'
import Skeleton from 'primevue/skeleton'
import Dialog from 'primevue/dialog'
import close from '~/assets/images/close.svg'
import { useI18n } from 'vue-i18n'
import { useExternalRedeemStore } from '~/stores/external-redeem'

definePageMeta({
  middleware: 'auth',
  layout: 'default',
})

const isFetching = ref(true)
const route = useRoute()
const router = useRouter()
const settings = useState('settings')

const { t } = useI18n()
const externalRedeemStore = useExternalRedeemStore()

const isClicked = ref(false)
const isRedeemDialogVisible = ref(false)
const insufficientDialogVisible = ref(false)
const errorMessage = ref(null)
const redeemMessage = ref('')
const isLoading = ref(false)
const disableSwipe = ref(false)
const vueslideunlock = ref(null)
const prizeTypeText = ref(null)
const colorBg = ref('')
const showPrizeValidationMessage = ref(false)

const redeemDetailData = ref({})

const step2Data = computed(
  () => settings.value?.prize?.step_2?.swipe_exchange?.data || {}
)
const prizeBg = computed(() => colorBg.value || '#000')
const textColor = computed(() => step2Data.value.text_1_color)
const step2Texts = computed(() => [
  step2Data.value?.option_text_1 === 'prize_name'
    ? prizeDetailData.value.name
    : step2Data.value?.text_1,
  step2Data.value?.text_2,
])

const externalGachaSlug = ref(null)

const handleDialog = () => {
  const isSuccess = localStorage.getItem('CLAIM_SUCCESS')
  if (isSuccess) {
    navigateTo('/claim/success')
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
      vueslideunlock.value.reset()
    }
  } catch (error) {
    console.error(error)
    errorMessage.value = error._data.message
    insufficientDialogVisible.value = true
    vueslideunlock.value.reset()
  }
}

const handleSwipe = async () => {
  isClicked.value = true
  if (isClicked.value) {
    if (externalRedeemStore.isExternalRedeem) {
      try {
        const body = {
          external_gacha_slug: redeemDetailData.value?.external_gacha_slug,
          prize_id: redeemDetailData.value?.prize_id,
          external_prize_id: redeemDetailData.value?.external_prize_id,
        }

        const { redeemExternalPrize } = usePrizeService()
        const { status, message } = await redeemExternalPrize(body)

        if (status) {
          redeemMessage.value = t('giftExchangeComplete')
          isRedeemDialogVisible.value = true
          localStorage.setItem('CLAIM_SUCCESS', true)
        } else {
          errorMessage.value = message
          insufficientDialogVisible.value = true
          vueslideunlock.value.reset()
        }
      } catch (error) {
        console.error(error)
        showPrizeValidationMessage.value = true
        const errors = error._data?.data || {}
        const messageList = []

        Object.keys(errors).forEach((key) => {
          if (Array.isArray(errors[key])) {
            messageList.push(...errors[key])
          } else {
            messageList.push(errors[key])
          }
        })

        errorMessage.value =
          messageList.join('\n') || error._data?.message || t('errorOccurred')
        insufficientDialogVisible.value = true
        vueslideunlock.value.reset()
      }
      return
    }

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
        vueslideunlock.value.reset()
        return
      }
      // Reset scroll position before navigation to prevent iOS Safari viewport issues
      window.scrollTo(0, 0)
      document.body.scrollTop = 0
      document.documentElement.scrollTop = 0
      
      // Wait for scroll settle before navigation
      await new Promise(resolve => requestAnimationFrame(resolve))
      
      router.push({
        path: `/spin/prize/${externalGachaSlug.value}`,
        query: {
          prize_id: id,
        },
      })
    } else {
      fetchRedeem()
    }
  }
}

const handleClose = () => {
  isRedeemDialogVisible.value = false
  insufficientDialogVisible.value = false
  showPrizeValidationMessage.value = false
}

const prizeDetailData = ref({})
const id = route.params.id

const fetchingPrizeData = async () => {
  isFetching.value = true
  try {
    const { getExternalPrizeDetail, getPrizeDetail } = usePrizeService()
    const response = externalRedeemStore.isExternalRedeem 
      ? await getExternalPrizeDetail(id)
      : await getPrizeDetail(id)
    const data = response.data

    redeemDetailData.value = data

    const dataRedeem = externalRedeemStore.isExternalRedeem ? data.external_prize : data

    prizeDetailData.value = dataRedeem
    
    externalGachaSlug.value = data?.external_gacha_slug ?? null

    const prizeName = externalRedeemStore.isExternalRedeem ? data.external_prize.name : data.name

    if (data) {
      localStorage.setItem('prize_name', prizeName)
    }
  } catch (error) {
    console.log(error)
  } finally {
    isFetching.value = false
  }
}

const handleRankColor = () => {
  const rank = prizeDetailData.value.rarity
  if (rank?.type === 'color') {
    colorBg.value = rank.background_color
    prizeTypeText.value = rank.text
  }
}

const handleKeydown = (event) => {
  if (event.key === 'Enter') {
    if (isRedeemDialogVisible.value && !isLoading.value) {
      handleDialog()
    } else if (insufficientDialogVisible.value && !isLoading.value) {
      navigateTo('/prize')
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
  await fetchingPrizeData()
  handleRankColor()
})
</script>
