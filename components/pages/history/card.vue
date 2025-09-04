<template>
  <ImageTextCard
    :on-click="() => handleGoToDetailHistory()"
    :image-card="characterImage"
    :has-rounded="true"
    :is-fetching="isFetching"
    :show-image="settings?.character_collection?.show_hide_character_collection?.show_character_image"
    :bg-color="settings?.character_collection?.show_hide_character_collection?.image_background_color"
  >
    <template v-slot:text v-if="!isFetching">
      <div class="flex flex-col justify-center w-full gap-1 pr-4 overflow-hidden ">
        <div class="flex items-center gap-3">
          <img v-if="showRarity" :src="raritySrc" alt="rarity icon" class="h-4 " />
          <p v-if="showTitle && showRarity" class="pr-2 font-medium text-exd-gray-scorpion sm:text-exd-1320 text-[2.708vw] line-clamp-2">
            {{ data.title }}
          </p>
        </div>
        <div class="flex items-center gap-3">
          <img v-if="showLocation" :src="pinIcon" alt="pin icon" class="w-6 h-6" />
          <div v-if="!showLocation" class="w-6 h-6"/>
          <div class="flex flex-col gap-1">
            <p v-if="!showRarity" class="pr-2 font-medium text-exd-gray-scorpion sm:text-exd-1320 text-[2.708vw] line-clamp-2">
              {{ data.title }}
            </p>
            <p v-if="showLocation" class="pr-2 text-exd-gray-scorpion text-[2.292vw] sm:text-[11px] line-clamp-2">
              {{ data.location }}
            </p>
            <p class="flex gap-5 truncate text-exd-gray-scorpion text-[2.292vw] sm:text-[11px] line-clamp-2">
              <span v-if="showDate">{{ data.date }}</span> <span v-if="showPoint">{{ data.point }}pt</span>
            </p>
          </div>
        </div>
      </div>
    </template>
  </ImageTextCard>
</template>

<script setup>
import { useRouter } from 'vue-router'
import noImage from '~/assets/images/no-image.svg'
import pinIcon from '~/assets/images/icon-pin.svg'
import moment from 'moment'

const props = defineProps({
  data: {
    type: Object,
    default: {},
  },
  id: {
    type: String,
    default: '',
  },
  isFetching: {
    type: Boolean,
    default: true,
  },
  showImage: {
    type: Boolean
  },
  showTitle: {
    type: Boolean
  },
  showDate: {
    type: Boolean
  },
  showLocation: {
    type: Boolean
  },
  showPoint: {
    type: Boolean
  },
  showRarity: {
    type: Boolean
  },
})

const characterImage = props.data.image || noImage

const router = useRouter()
const raritySrc = ref('')
const settings = useState('settings')

const handleGoToDetailHistory = () => router.push(`/history/${props.data.id}`)

const handleRarity = () => {
  raritySrc.value = props.data.rarity_image
}

const formatDate = (datetime) => {
  return moment(datetime).format('YYYY/MM/DD HH:mm:ss')
}

handleRarity()

onMounted(() => {
  useState('showImage', () => props.showImage)
})
</script>
