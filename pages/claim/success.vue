<template>
  <HeaderBar withLogo />
  <div
    class="flex flex-col justify-between px-8 mt-20 !h-full grow !bg-no-repeat !bg-cover !bg-center"
    :style="{
      background:
        settings?.prize?.step_2?.swipe_exchange?.data?.background_page_2
          .type === 'image'
          ? `url(${settings?.prize?.step_2?.swipe_exchange?.data?.background_page_2.value})`
          : settings?.prize?.step_2?.swipe_exchange?.data?.background_page_2
              .value,
    }"
  >
    <div
      class="flex flex-col mx-auto my-10 font-bold text-center text-exd-gray-scorpion"
    >
      <p class="text-[20px]">{{ settings?.prize?.step_2?.swipe_exchange?.data?.page_title }}</p>
      <p class="text-exd-1624">
        {{ settings?.prize?.step_2?.swipe_exchange?.data?.page_sub_title_2 }}
      </p>
    </div>
    <div class="relative flex-1 w-full">
      <p
        class="text-[26px] text-center font-bold"
        :style="{
          color: settings?.prize?.step_2?.swipe_exchange?.data?.text_1_color,
          borderColor:
            settings?.prize?.step_2?.swipe_exchange?.data?.text_1_color,
        }"
      >
        {{ settings?.prize?.step_2?.swipe_exchange?.data?.text_3 }}
      </p>
      <div
        class="border-4 flex-1 w-5/6 text-center absolute sm:top-16 top-12 left-1/2 transform -translate-x-1/2 px-6 py-2 !font-extrabold rounded-lg text-[25px] min-h-12"
        :style="{
          color: settings?.prize?.step_2?.swipe_exchange?.data?.text_1_color,
          borderColor:
            settings?.prize?.step_2?.swipe_exchange?.data?.text_1_color,
        }"
      >
        {{ settings?.prize?.step_2?.swipe_exchange?.data?.option_text_4 === "prize_name" ? prizeName : settings?.prize?.step_2?.swipe_exchange?.data?.text_4 }}
      </div>
    </div>
  </div>
  <div class="fixed bottom-0 w-full max-w-md px-8 mx-auto">
    <SolidButton
      :on-click="() => goTo('top')"
      :label="settings?.prize?.step_2?.swipe_exchange?.data?.button_text_2"
      has-bottom
      :bg-color="
        settings?.prize?.step_2?.swipe_exchange?.data?.button_and_text_color
          ?.background
      "
      :text-color="
        settings?.prize?.step_2?.swipe_exchange?.data?.button_and_text_color
          ?.color
      "
    />
  </div>
</template>

<script setup>
definePageMeta({
  middleware: ['auth'],
  layout: 'default',
})

const router = useRouter()
const settings = useState('settings')
const prizeName = ref('')

const goTo = (type) => {
  localStorage.removeItem('CLAIM_SUCCESS')
  localStorage.removeItem('prize_name')
  switch (type) {
    case 'top':
      router.push('/dashboard')
      break
    case 'external':
      window.open('https://nospot.new-ordinary.co.jp/maps/nagoya')
      break

    default:
      break
  }
}

const handleKeydown = (event) => {
  if (event.key === 'Enter') {
    goTo('top')
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
})

onMounted(() => {
  if (import.meta.client) {
    prizeName.value = localStorage.getItem('prize_name')
  }
})
</script>
