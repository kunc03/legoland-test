<template>
  <div class="max-w-sm overflow-hidden rounded-xl" v-if="body.length > 0">
    <div
      v-if="(headColor || headImage) && keyBody"
      :style="
        headImage
          ? {
              backgroundImage: `url(${headImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }
          : { backgroundColor: headColor }
      "
      :class="`flex justify-between w-full px-2 py-1 min-h-6`"
    >
      <p class="font-bold text-white text-exd-1624">{{ keyBody }}</p>
    </div>
    <template v-if="!isFetching">
      <ImageTextCard
        v-for="item in body"
        :key="item.id"
        :on-click="() => handleGoToDetailRedeem(item.id)"
        :image-card="item.image"
        :is-fetching="isFetching"
        :isDisabled="item.disabled"
        :bgColor="bgColor"
      >
        <template v-slot:text>
          <div
            class="inline-flex justify-between pr-4 w-100"
            :class="item.disabled ? 'opacity-50' : ''"
          >
            <div class="flex flex-col justify-center gap-1">
              <p
                v-if="showTitle"
                class="text-exd-gray-scorpion font-semibold text-[12px] sm:text-[14px] line-clamp-2"
              >
                {{ item.name }}
              </p>
              <p
                v-if="showPeriod"
                class="text-[10px] sm:text-[12px] font-medium"
                :style="{
                  color: settings?.global?.text_colors?.secondary,
                }"
              >
                {{ $t('applicationPeriod') }}：{{ item.started_at }}〜{{
                  item.expired_at
                }}
              </p>
            </div>
          </div>
        </template>
      </ImageTextCard>
    </template>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

const { t } = useI18n()

const props = defineProps({
  isFetching: { type: Boolean, default: true },

  body: {
    type: Array,
    default: () => [],
  },
  keyBody: {
    type: [String, Number],
  },
  totalData: {
    type: [String, Number],
  },
  headColor: {
    type: String,
  },
  headImage: {
    type: String,
  },
  currentPoint: {
    type: [Number, String],
    default: 0,
  },
  showTitle: {
    type: Boolean,
    default: true,
  },
  showPeriod: {
    type: Boolean,
    default: true,
  },
  bgColor: {
    type: String,
  },
})

const totalGift = ref(null)

const router = useRouter()
const settings = useState('settings')
const handleGoToDetailRedeem = (id) => router.push(`/prize/${id}`)

const formatDate = (datetime) => {
  const date = new Date(datetime)
  return date.toISOString().split('T')[0]
}

const handleTotalData = () => {
  totalGift.value = t('canBeReplaced', { limit: props.totalData })
}

handleTotalData()
</script>
