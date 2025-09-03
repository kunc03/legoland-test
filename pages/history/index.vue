<template>
  <HeaderBar hasBack>
    <p
      style="text-shadow: 0 3px 3px rgba(0, 0, 0, 0.16)"
      class="text-exd-gray-scorpion font-bold text-exd-1824.52"
    >
      {{ historyData?.page_title }}
    </p>
  </HeaderBar>
  <div class="flex flex-col gap-3 px-8 text-black bg-center pt-28"
  >
    <div
      class="inline-flex items-end justify-between w-full text-exd-gray-scorpion"
    >
      <p class="font-bold text-exd-1424">{{ $t('characterCatalog') }}</p>
      <p class="font-bold leading-tight text-exd-1424">
        <span class="text-exd-2238">{{
          String(character_count).padStart(3, '0')
        }}</span
        >/{{ String(master_count).padStart(3, '0') }}
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
      />
    </template>
  </div>
</template>

<script setup>
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

const fetchingHistoryData = async () => {
  try {
    isFetching.value = true
    const data = await useFetchApi('GET', 'history')

    histories.value = data.data

    character_count.value = data.character_count
    master_count.value = data.master_count
  } catch (error) {
    console.log(error)
  } finally {
    isFetching.value = false
  }
}

onMounted(() => {
  fetchingHistoryData()
})
</script>
