<template>
  <div
    class="grow !bg-no-repeat !bg-cover !bg-center justify-between items-center flex flex-col overflow-hidden"
    :style="{
      background:
        settings?.gacha?.user_tap_splash_screen?.background.type === 'image'
          ? `url(${settings?.gacha?.user_tap_splash_screen?.background.value})`
          : settings?.gacha?.user_tap_splash_screen?.background.value
    }"
  >
    <div
      class="flex-1 items-center flex flex-col pt-[2rem] pb-20 px-8 overflow-y-auto overflow-x-hidden"
    >
      <div class="relative w-full text-right -right-4">
        <button type="button" aria-haspopup="true" class="bg-white rounded-full" @click="langPanelToggle">
          <IconsLang :style="{ color: settings.global?.icon_color?.background }" />
        </button>
        <LanguangePanel v-model:visible="langPanel" />
      </div>
      <img :src="$imgV(settings.global.logo)"
        alt="logo"
        width="95"
        height="58"
        preload
        class="mb-8"
      />
      <div class="flex flex-col items-center justify-start w-full mx-8">
        <h1
          class="text-center font-bold text-exd-1824.52 p-3 text-white"
          style="text-shadow: 0 3px 3px rgba(0, 0, 0, 0.16)"
        >
          {{ $t('password') }}
        </h1>
        <div
          class="bg-white h-exd-150 rounded-xl text-center grid place-items-center text-exd-6081.72 text-exd-red w-full font-bold"
        >
          <Skeleton
            class="bg-gray-100"
            width="10rem"
            height="4rem"
            borderRadius="16px"
            v-if="isLoading && responseData.password !== ''"
          ></Skeleton>
          <p style="text-shadow: 0 3px 3px rgba(0, 0, 0, 0.16)" v-else>
            {{ responseData.password }}
          </p>
        </div>
        <div class="p-3 text-xs font-medium text-white text-start">
          <p style="text-shadow: 0 3px 3px rgba(0, 0, 0, 0.16)">
            ※ {{ $t('passwordIsOnlyForToday') }}
          </p>
        </div>
      </div>
      <div
        class="w-full px-4 py-1 mt-8 text-sm font-bold text-center bg-white text-exd-red"
        v-if="responseData.description && responseData.image"
      >
        {{ $t('qrCodeSpot') }}
      </div>
      <div
        class="inline-flex justify-between w-full gap-3 mt-3 bg"
        v-if="responseData.description"
      >
        <p
          class="text-xs text-justify text-white basis-1/2 vhtml-desc"
          style="overflow-wrap: break-word; inline-size: 180px"
          v-html="responseData.description"
        ></p>
        <div class="overflow-hidden basis-1/2 flex-0">
          <img :src="$imgV(displayImage)"
            alt="response-image"
            preload
            class="size-auto"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import emptyImage from '~/assets/images/no-image.svg'

const settings = useState('settings')
const langPanel = ref(false)

const langPanelToggle = (event) => {
  langPanel.value = !langPanel.value
}
const route = useRoute()
const responseData = ref({
  password: '',
  image: '',
  description: '',
})
const isLoading = ref(false)

const getPassword = async (id) => {
  try {
    isLoading.value = true

    const locationService = useLocationService()
    const { status, data } = await locationService.getLocationPassword(id)
    if (data) {
      responseData.value = {
        password:
          data.password ?? Math.floor(1000 + Math.random() * 9000).toString(),
        description: data.description,
        image: data.image,
      }
    }

    isLoading.value = false
  } catch (error) {
      navigateTo('/')
  }
}

const displayImage = computed(() => {
  return responseData.value.image || emptyImage
})

onMounted(async () => {
  const location = route.params.randomCode

  await getPassword(location)
})

</script>
