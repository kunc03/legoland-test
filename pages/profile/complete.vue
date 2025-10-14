<template>
  <div class="flex flex-col grow">
    <HeaderBar hasBack>
      <p
        style="text-shadow: 0 3px 3px rgba(0, 0, 0, 0.16)"
        class="text-exd-gray-scorpion font-bold text-exd-1824.52"
      >
        {{ settings?.register_login?.change_membership_information_page_2?.page_title }}
      </p>
    </HeaderBar>

    <div
      class="flex flex-col justify-between w-full gap-6 pt-32 pb-3 font-bold grow"
      :style="{
        background:
          settings?.register_login?.change_membership_information_page_2
            ?.background_page?.type === 'image'
            ? `url(${settings?.register_login?.change_membership_information_page_2?.background_page?.value})`
            : settings?.register_login?.change_membership_information_page_2
                ?.background_page?.value,
        'background-size': 'cover',
        'background-repeat': 'no-repeat',
      }"
    >
      <div class="flex flex-col grow">
        <p
          class="mt-8 font-normal text-center text-exd-gray-scorpion text-exd-1416"
        >
          {{ settings?.register_login?.change_membership_information_page_2?.page_description }}
        </p>
      </div>
    </div>
  </div>

  <div class="fixed bottom-0 z-50 w-full max-w-md mx-auto mb-2">
    <SolidButton
      :label="settings.register_login?.change_membership_information_page_2?.button_text"
      :bgColor="settings.register_login?.change_membership_information_page_2?.button_text_and_color?.background"
      :textColor="settings.register_login?.change_membership_information_page_2?.button_text_and_color?.color"
      :on-click="() => goTo('top')"
      :has-loading="isLoading"
      has-bottom
    />
  </div>
</template>

<script setup>
import useRegister from '~/composables/useRegister'
import { useRouter } from 'vue-router'

const { isSpin } = useRegister()
const { decryptData } = useEncryption()
const router = useRouter()
const isLoading = ref(false)

const settings = useState('settings')

const saveSpin = async () => {
  if (!isSpin) return
  const storedData = useCookie('VALID_PASSWORD')
  const parseData = decryptData(storedData.value)
  const slug = parseData?.slug?.toUpperCase()
  const slugStorageName = `${slug}_GACHA`
  const slugStorage = decryptData(localStorage.getItem(slugStorageName))
  try {
    await useFetchApi('POST', 'gacha/save/temp', {
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
  saveSpin()
})
</script>
