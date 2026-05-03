<template>
  <HeaderBar hasBack>
    <p
      style="text-shadow: 0 3px 3px rgba(0, 0, 0, 0.16)"
      class="text-exd-gray-scorpion font-bold text-exd-1824.52"
    >
      {{ historyData?.page_title }}
    </p>
  </HeaderBar>
  <div class="flex flex-col gap-3 px-8 bg-center pt-28"
  >
    <div
      class="inline-flex items-end justify-between w-full"
      :style="{ color: settings?.global?.text_colors?.tertiary }"
    >
      <p class="font-bold text-exd-1424">{{ $t('characterCatalog') }}</p>
      <p class="font-bold leading-tight text-exd-1424">
        <span class="text-exd-2238">{{
          character_count > master_count ? master_count : character_count
        }}</span
        >/{{ master_count }}
      </p>
    </div>
    <template v-if="isFetching">
      <PagesHistoryCard v-for="n in 3" :key="n" :is-fetching="true" />
    </template>
    <template v-else>
      <PagesHistoryCard
        v-for="(history, index) in histories"
        :key="index"
        :data="history"
        :is-fetching="isFetching"
        :showImage="historyData?.show_hide_character_collection?.show_character_image"
        :showTitle="historyData?.show_hide_character_collection?.show_character_title"
        :showDate="historyData?.show_hide_character_collection?.show_character_date"
        :showLocation="historyData?.show_hide_character_collection?.show_location"
        :showPoint="historyData?.show_hide_character_collection?.show_point"
        :showRarity="historyData?.show_hide_character_collection?.show_character_rarity"
        :bgColor="historyData?.image_background_color"
      />
    </template>

    <div
      v-if="!isFetching && lastPage > 1"
      class="flex items-center justify-between p-3 bg-white border-t border-surface-200 rounded-xl"
    >
      <button
        class="flex items-center justify-center w-10 h-10 text-white rounded-md bg-exd-gray-44 disabled:opacity-50 disabled:cursor-not-allowed"
        :disabled="page <= 1"
        aria-label="Previous page"
        @click="handlePrevPage"
      >
        <IconsArrow class="w-7 h-7" />
      </button>

      <p class="font-semibold text-exd-gray-scorpion text-[12px]">
        {{ historyFrom }}-{{ historyTo }} / {{ total }}
      </p>

      <button
        class="flex items-center justify-center w-10 h-10 text-white rounded-md bg-exd-gray-44 disabled:opacity-50 disabled:cursor-not-allowed"
        :disabled="page >= lastPage"
        aria-label="Next page"
        @click="handleNextPage"
      >
        <IconsArrow class="w-7 h-7 rotate-180" />
      </button>
    </div>
    <Copyright v-if="histories.length > 4" />
  </div>
  <div v-if="histories.length <= 4" class="absolute left-0 right-0 bottom-[13%]">
    <Copyright />
  </div>
</template>

<script setup>
import { store } from '~/stores/dashboard.js'

definePageMeta({
  middleware: 'auth',
  layout: 'with-bottom-bar',
})

const histories = ref([])
const character_count = ref(0)
const master_count = ref(0)
const isFetching = ref(false)
const settings = useState('settings')

const historyData = settings.value?.character_collection || {}

const page = ref(1)
const perPage = ref(10)
const lastPage = ref(1)
const total = ref(0)

const historyFrom = computed(() => {
  if (!total.value) return 0
  return (page.value - 1) * perPage.value + 1
})

const historyTo = computed(() => {
  if (!total.value) return 0
  return Math.min(page.value * perPage.value, total.value)
})

const fetchingHistoryData = async (p = page.value) => {
  try {
    isFetching.value = true
    const { getHistoryList } = useHistoryService()
    const data = await getHistoryList({
      page: p, per_page: perPage.value
    })

    histories.value = data.data
    page.value = data?.meta?.current_page ?? p
    lastPage.value = data?.meta?.last_page ?? 1
    total.value = data?.meta?.total ?? 0

    character_count.value = data.character_count
    master_count.value = data.master_count
  } catch (error) {
    console.log(error)
  } finally {
    isFetching.value = false
  }
}

const handlePrevPage = async () => {
  if (page.value <= 1) return
  page.value -= 1
  await fetchingHistoryData(page.value)
}

const handleNextPage = async () => {
  if (page.value >= lastPage.value) return
  page.value += 1
  await fetchingHistoryData(page.value)
}

onMounted(() => {
  fetchingHistoryData(1)
})
</script>
