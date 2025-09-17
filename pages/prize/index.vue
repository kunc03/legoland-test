<template>
  <HeaderBar hasBack>
    <p
      style="text-shadow: 0 3px 3px rgba(0, 0, 0, 0.16)"
      class="text-exd-gray-scorpion font-bold text-exd-1824.52"
    >
      {{ settings?.prize?.step_1?.page_title }}
    </p>
  </HeaderBar>
  
  <div
    ref="prizeCards"
    class="relative flex flex-col w-full h-full bg-center bg-no-repeat bg-cover scroll-container"
  >
    <div class="flex flex-col sm:mt-[30%] mt-[36%] items-center"></div>

    <div class="relative flex flex-col gap-3 px-10 mb-10">
      <template v-if="isFetching">
        <div v-for="n in 3" :key="`prize-skeleton-${n}`" class="bg-white !rounded-lg">
          <Skeleton width="100%" height="1.9rem" class="!rounded-b-none"></Skeleton>
          <div class="flex h-24 p-3 bg-white border-b rounded-b-lg border-surface-200">
            <Skeleton shape="circle" size="4.5rem"></Skeleton>
            <div class="self-center flex-1 ml-3">
                <Skeleton width="30%" class="mb-2"></Skeleton>
                <Skeleton width="70%" height=".8rem" class="bg-exd-red-500"></Skeleton>
            </div>
          </div>
        </div>
      </template>
      
      <template v-else>
        <PagesPrizeCard
          v-for="prize in prizes.data"
          :key="prize.slug"
          :keyBody="prize.title"
          :body="prize.prizes"
          :totalData="prize.totalVoucher"
          :headColor="prize.color"
          :currentPoint="store.point"
          :is-fetching="isFetching"
          :showTitle="settings?.prize?.step_1?.to_be_redeemed?.show_prize_title"
          :showPeriod="settings?.prize?.step_1?.to_be_redeemed?.show_application_period"
          :bgColor="settings?.prize?.step_1?.to_be_redeemed?.image_background_color"
        />
      </template>
    </div>

    <div ref="prizeHistory" class="relative flex flex-col px-10 sm:mb-[23%] mb-[28%]">
      <div class="px-2 py-1 text-white bg-exd-gray-44">
        <template v-if="isFetching">
          <Skeleton width="8rem" height="1.25rem"></Skeleton>
        </template>
        <template v-else>
          <p class="font-semibold md:text-[15px] sm:text-[14px] text-[13px]">
            {{ $t('exchangeHistory') }}
          </p>
        </template>
      </div>
      
      <template v-if="isFetching">
        <div v-for="n in 5" :key="`history-skeleton-${n}`" class="flex items-center p-3 bg-white border-b border-surface-200">
          <div class="flex-1">
            <Skeleton width="10%" height="1rem" class="mb-2"></Skeleton>
            <Skeleton width="40%" height="0.75rem"></Skeleton>
          </div>
           <Skeleton shape="circle" size="2.5rem" class="mr-3"></Skeleton>
        </div>
      </template>
      
      <template v-else>
        <PagesPrizeHistory
          v-for="(redeem, key) in redeems"
          :key="key"
          :keyBody="key"
          :body="redeem"
          :currentPoint="store.point"
          :is-fetching="isFetching"
        />
      </template>
    </div>
  </div>

  <div class="absolute bottom-[15%] right-0 flex flex-col items-end">
    <div class="menu-item" @click="handleScrollUp">
      <div class="flex items-center gap-2 btn-click">
        <img
          src="~/assets/images/arrow-skip.svg"
          width="13"
          height="13"
          alt=""
          class="-rotate-90"
        />
        <p :class="{ 'reverse-mode': $i18n.locale === 'en' }">
          {{ $t('listOfPrizes') }}
        </p>
      </div>
    </div>
    <div class="menu-item" @click="handleScrollDown">
      <div class="flex items-center gap-2 btn-click">
        <p :class="{ 'reverse-mode': $i18n.locale === 'en' }">
          {{ $t('exchangeHistory') }}
        </p>
        <img
          src="~/assets/images/arrow-skip.svg"
          width="13"
          height="13"
          alt=""
          class="rotate-90"
        />
      </div>
    </div>
  </div>
  
</template>

<script setup>
import { store } from '~/stores/dashboard.js'
import noImage from '~/assets/images/no-image.svg'

definePageMeta({
  middleware: 'auth',
  layout: 'without-pb',
})

const prizes = ref([])
const redeems = ref([])
const prizeCards = ref(null)
const isFetching = ref(false)
const settings = useState('settings')
const bgPrize = ref('')

const prizeHistory = ref(null)

const fetchingPrizesData = async () => {
  try {
    isFetching.value = true
    const { data } = await useFetchApi('GET', 'prize-list')

    prizes.value = data
  } catch (error) {
    console.log(error)
  } finally {
    isFetching.value = false
  }
}

const fetchingRedeemsData = async () => {
  try {
    isFetching.value = true
    const { data } = await useFetchApi('GET', 'prize-redeemed')
    redeems.value = data.data
  } catch (error) {
    console.log(error)
  } finally {
    isFetching.value = false
  }
}

const dataArrays = (data) => {
  if (Array.isArray(data)) {
    return data.reduce((acc, obj) => {
      const key = Object.keys(obj)[0]
      if (!acc[key]) {
        acc[key] = []
      }
      acc[key] = acc[key].concat(obj[key])
      return acc
    }, {})
  } else if (typeof data === 'object') {
    return data
  } else {
    console.error('Data tidak valid:', data)
    return []
  }
}

const handleScrollUp = () => {
  if (prizeCards.value) {
    prizeCards.value.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }
}

const handleScrollDown = () => {
  if (prizeHistory.value) {
    prizeHistory.value.style.paddingTop = '135px'
    prizeHistory.value.style.marginTop = '-135px'

    prizeHistory.value.scrollIntoView({ behavior: 'smooth' })

    setTimeout(() => {
      prizeHistory.value.style.paddingTop = ''
      prizeHistory.value.style.marginTop = ''
    }, 3000)
  }
}

onMounted(async () => {
  await fetchingPrizesData()
  fetchingRedeemsData()
})
</script>

<style scoped>
.scroll-container {
  max-height: 100%;
  overflow-y: auto;
  position: relative;
}

.menu-item {
  margin: 5px 0;
  pointer-events: auto;
  writing-mode: vertical-rl;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  padding: 20px 10px;
  background: rgba(0, 0, 0, 0.638);
  border-bottom-left-radius: 10px;
  border-top-left-radius: 10px;
  transition: color 0.3s, background-color 0.3s;
  color: white;
}

.reverse-mode {
  writing-mode: vertical-lr;
  transform: rotate(180deg);
}
</style>
