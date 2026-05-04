<template>
  <div v-if="!isFetching" class="bg-white rounded-xl">
    <ImageTextCard
      :key="id"
      :history="true"
      :image-card="image"
      :show-image="false"
      :is-redeemed="isRedeemed"
      :is-failed="isFailed"
      :is-last-item="isLastItem"
      :on-click="() => handleGoToDetailRedeem(body.id)"
    >
      <template v-slot:text>
        <div
          class="inline-flex justify-between pr-4 text-exd-gray-scorpion w-100"
        >
          <div class="flex flex-col items-start justify-center gap-1">
            <img
              v-if="
                body.rarity?.type === 'image' &&
                settings?.prize?.step_1?.has_been_redeemed?.show_prize_rarity
              "
              :src="body.rarity?.image"
              alt="arrow"
              width="30"
              height="30"
              preload
              class=""
            />

            <i18n-t
              v-else-if="
                body.rarity?.type === 'color' &&
                settings?.prize?.step_1?.has_been_redeemed?.show_prize_rarity
              "
              keypath="prize"
              tag="div"
              scope="global"
              class="font-bold text-exd-1013.62 text-white py-[2px] px-2 flex items-center justify-center rounded-lg"
              :style="{
                backgroundColor: body.rarity.background_color,
                color: body.rarity.text_color,
              }"
            >
              <template v-slot:rank>
                {{ body.rarity.text.toUpperCase() }}
              </template>
            </i18n-t>

            <p
              v-if="
                settings?.prize?.step_1?.has_been_redeemed?.show_prize_title
              "
              class="font-semibold md:text-[15px] sm:text-[14px] text-[13px]"
              :class="isRedeemed && !isFailed ? 'opacity-40' : ''"
            >
              {{ name }}
            </p>

            <p
              v-if="
                settings?.prize?.step_1?.has_been_redeemed
                  ?.show_application_period
              "
              class="text-[10px] sm:text-[12px] font-medium"
              :style="{
                color: settings?.global?.text_colors?.secondary,
              }"
            >
              {{ $t('applicationPeriod') }}：{{ startedAt }}〜{{ expiredAt }}
            </p>
            <p
              v-if="redemptionDate"
              class="text-[10px] sm:text-[12px] font-medium"
              :style="{
                color: settings?.global?.text_colors?.secondary,
              }"
            >
              {{ $t('redemptionDate') }}：{{ redemptionDate }}
            </p>
          </div>
        </div>
      </template>
      <!-- <template v-slot:action>
        <button 
          v-if="!isRedeemed" 
          class="w-20 hover:opacity-80 text-[10px] py-1 font-semibold rounded-md"
          :style="{
            backgroundColor: settings?.prize?.step_1?.pop_up_button_and_text_color?.background, 
            color: settings?.prize?.step_1?.pop_up_button_and_text_color?.color,
          }"
          @click="handleGoToDetailRedeem(body.id)"
        >{{ $t('redeem') }}</button>
      </template> -->
    </ImageTextCard>
  </div>
</template>

<script setup>
import { useRouter } from 'nuxt/app'

const props = defineProps({
  isFetching: { type: Boolean, default: false },
  body: {
    type: Object,
    default: () => {},
  },
  keyBody: {
    type: [String, Number],
  },
  rankColor: {
    type: [String, Number],
  },
  currentPoint: {
    type: [Number, String],
    default: 0,
  },
  isLastItem: {
    type: Boolean,
    default: false,
  },
})

const router = useRouter()
const settings = useState('settings')

const innerData = computed(() => {
  return props.body?.type === 'external_prize' ? props.body.external_prize : props.body
})

const name = computed(() => innerData.value?.name || '')
const image = computed(() => innerData.value?.image || '')
const id = computed(() => innerData.value?.id || '')
const startedAt = computed(() => props.body?.started_at || '')
const expiredAt = computed(() => props.body?.expired_at || '')
const redemptionDate = computed(() => {
  const isShowRedeem = settings.value?.prize?.step_1?.has_been_redeemed?.show_redemption_date
  return isShowRedeem ? props.body?.redeemed_at : null
})

const isRedeemed = computed(() => {
  return props.body?.is_redeemed || innerData.value?.is_redeemed
})

const isFailed = computed(() => {
  return props.body?.is_failed || innerData.value?.is_failed
})

const handleGoToDetailRedeem = (id) => {
  router.push(`/redeem/${id}`)
}
</script>