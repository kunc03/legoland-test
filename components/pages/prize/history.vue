<template>
  <div v-if="!isFetching" class="bg-white">
    <ImageTextCard
      :key="id"
      :history="true"
      :image-card="image"
      :show-image="false"
      isDisabled
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
})

const color = ref('')
const router = useRouter()
const settings = useState('settings')

const name = ref('')
const image = ref('')
const id = ref('')
const startedAt = ref('')
const expiredAt = ref('')
const redemptionDate = ref('')

const handleGoToDetailRedeem = (id) => router.push(`/prize/history/${id}`)

onMounted(() => {
  const data =
    props.body.type == 'external_prize' ? props.body.external_prize : props.body
  name.value = data.name
  image.value = data.image
  id.value = data.id
  startedAt.value = props.body.started_at
  expiredAt.value = props.body.expired_at
  redemptionDate.value = props.body.redeemed_at
})
</script>
