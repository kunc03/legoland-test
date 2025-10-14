<template>
  <div class="flex flex-col grow">
    <HeaderBar>
      <p
        v-if="settings?.prize?.step_2?.[type]?.data?.page_title"
        style="text-shadow: 0 3px 3px rgba(0, 0, 0, 0.16)"
        class="text-exd-gray-scorpion font-bold text-exd-1824.52"
      >
        {{ settings?.prize?.step_2?.[type]?.data?.page_title_2 }}
      </p>
    </HeaderBar>

    <div
      class="flex flex-col justify-between !bg-no-repeat h-full !bg-cover !bg-center gap-6 px-3 grow"
      :style="{
      background:
        settings?.prize?.step_2?.[type]?.data?.background_page_2.type === 'image'
          ? `url(${settings?.prize?.step_2?.[type]?.data?.background_page_2.value})`
          : settings?.prize?.step_2?.[type]?.data?.background_page_2.value,
      }"
    >
      <div class="flex flex-col mt-32 grow">
        <p
          class="mt-8 font-semibold text-center text-exd-gray-scorpion text-exd-1416"
        >
          {{ settings?.prize?.step_2?.[type]?.data?.sub_title_2 }}
        </p>
      </div>
    </div>
    <div class="fixed bottom-0 z-50 w-full max-w-md mx-auto mb-2">
      <SolidButton
        :on-click="handleClick"
        :has-loading="isLoading"
        :bgColor="
          settings?.prize?.step_2?.[type]?.data?.button_and_text_color_2?.background
        "
        :textColor="
          settings?.prize?.step_2?.[type]?.data?.button_and_text_color_2?.color
        "
        :label="settings?.prize?.step_2?.[type]?.data?.button_text_2"
        has-bottom
      />
    </div>
  </div>

</template>

<script setup>
import useRegister from '~/composables/useRegister'
import { useRouter, useRoute } from 'vue-router'

const { isSpin } = useRegister()
const { decryptData } = useEncryption()
const router = useRouter()
const route = useRoute()
const isLoading = ref(false)
const settings = useState('settings')

const type = ref('')

const saveSpin = async () => {
  if (!isSpin) return
  const storedData = useCookie('VALID_PASSWORD')
  const parseData = decryptData(storedData.value)
  const slug = parseData?.slug?.toUpperCase()
  const slugStorageName = `${slug}_GACHA`
  const slugStorage = decryptData(localStorage.getItem(slugStorageName))
  try {
    const response = await useFetchApi('POST', 'gacha/save/temp', {
      body: {
        point_id: slugStorage?.point_id,
        location_id: slugStorage?.location_id,
        temporary_user_id: localStorage.getItem('USER_ID'),
        character_id: slugStorage?.character_id,
        log_id: slugStorage?.log_id,
      },
    })
  } catch (error) {
    console.log("Error: Can't save spin result")
  }
}

const goTo = (type) => {
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

const handleClick = async () => {
  sessionStorage.clear()
  nextTick()
  goTo('top')
}

const handleKeydown = (event) => {
  if (event.key === 'Enter') {
    handleClick()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
})

onMounted(() => {
  saveSpin()
  type.value = sessionStorage.getItem('type')
})
</script>
