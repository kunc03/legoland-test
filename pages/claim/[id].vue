<template>
  <HeaderBar hasBack withLogo />
  <div
    class="flex flex-col mt-20 grow"
  >
    <!-- :style="{
      background:
        step2Data?.background_page.type === 'image'
          ? `url(${step2Data?.background_page.value})`
          : step2Data?.background_page.value,
      'background-size': 'cover',
      'background-repeat': 'no-repeat',
    }" -->
    <p
      class="text-exd-1724 text-center font-extrabold max-w-[356px] mx-auto p-4 my-4"
      :style="{ color: textColor }"
    >
      {{ step2Data.page_sub_title }}
    </p>

    <div
      class="flex flex-col justify-between gap-5 py-8 bg-exd-banana grow px-7"
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
                <Skeleton v-if="isFetching" class="!h-5 mb-1 bg-exd-gray-scorpion" width="10rem" />
                <p v-else class="font-bold text-exd-1424">
                  {{ text }}
                </p>
              </template>
            </div>
            <template v-if="isFetching">
              <Skeleton
                class="!rounded-full"
                :style="{
                  background:
                    step2Data.button_and_text_color
                      ?.background,
                }"
                width="3rem"
                height="3rem"
              />
            </template>
            <img
              v-else-if="prizeDetailData.rarity?.type === 'image' && prizeDetailData.rarity?.show_rarity"
              :src="prizeDetailData.rarity?.image"
              alt="arrow"
              width="50"
              height="0"
              class=""
              loading="lazy"
              preload
            />

            <p
              v-else-if="prizeDetailData.rarity?.type === 'color' && prizeDetailData.rarity?.show_rarity"
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
        :bgColor="
          step2Data?.button_and_text_color?.background
        "
      />
    </div>
  </div>

  <Dialog
    v-model:visible="isRedeemDialogVisible"
    modal
    class="!bg-white !w-exd-300 h-exd-200 !max-w-sm border border-exd-gray-44 rounded-xl"
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
        class="flex flex-col items-center justify-end w-full h-full gap-4 p-5"
      >
        <div class="flex flex-col items-center justify-center w-full gap-8">
          <p class="font-bold text-exd-1424 text-exd-gray-scorpion">
            {{ redeemMessage }}
          </p>

          <SolidButton
            :on-click="handleDialog"
            :has-loading="isLoading"
            label="GO!"
            :bgColor="
              step2Data?.button_and_text_color?.background
            "
            :textColor="
              step2Data?.button_and_text_color?.color
            "
          />
        </div>
      </div>
    </template>
  </Dialog>

  <Dialog
    v-model:visible="insufficientDialogVisible"
    modal
    class="!w-exd-300 h-exd-200 !max-w-sm border border-exd-gray-44 rounded-xl"
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
            class="font-bold text-exd-1424"
            :style="{
              color: settings?.global?.modal?.text_color,
            }"
          >
            {{ errorMessage }}
          </p>
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

definePageMeta({
  middleware: 'auth',
  layout: 'default',
})

const isFetching = ref(true)
const route = useRoute()
const router = useRouter()
const settings = useState('settings')

const { t } = useI18n()

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

const step2Data = computed(() => settings.value?.prize?.step_2?.swipe_exchange?.data || {})
const prizeBg = computed(() => colorBg.value || '#000')
const textColor = computed(() => step2Data.value.text_1_color)
const step2Texts = computed(() => [
  prizeDetailData.value.name,
  // step2Data.value.text_2
])

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
    const { message, status } = await useFetchApi(
      'POST',
      'prizes/redeem',
      {
        // params: {
        //   user_point_id: prizeDetailData.value?.id,
        // },
        body: {
          prize_id: id,
        },
      }
    )

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

const handleSwipe = () => {
  isClicked.value = true
  if (isClicked.value) {
    fetchRedeem()
  }
}

const handleClose = () => {
  isRedeemDialogVisible.value = false
  insufficientDialogVisible.value = false
}

const prizeDetailData = ref({})
const id = route.params.id

const fetchingPrizeData = async () => {
  isFetching.value = true
  try {
    const { data } = await useFetchApi('GET', 'prize-list/' + id)
    prizeDetailData.value = data

    if (data) {
      localStorage.setItem('prize_name', data.name)
    }
  } catch (error) {
    console.log(error)
  } finally {
    isFetching.value = false
  }
}

const handleRankColor = () => {
  const rank = prizeDetailData.value.rarity
  if (rank.type === 'color') {
    colorBg.value = rank.background_color
    prizeTypeText.value = rank.text
  }
}

onMounted(async () => {
  await fetchingPrizeData()
  handleRankColor()
})
</script>
