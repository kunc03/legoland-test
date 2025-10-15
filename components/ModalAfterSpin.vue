<template>
  <Dialog
    :visible="visible"
    @update:visible="$emit('update:visible')"
    modal
    class="!w-11/12 !max-w-sm border border-exd-gray-44"
    :style="{
      background: settings?.global?.modal?.background_color,
    }"
  >
    <template v-if="afterGacha?.option === '2'" #container>
      <div>
        <img
          src="/images/close.svg"
          alt="close"
          width="30"
          height="30"
          class="absolute z-50 cursor-pointer right-1 top-1"
          @click="handleCloseDialog"
        />

        <div
          class="w-full flex flex-col justify-center items-center py-6 gap-4 !pb-8 relative"
        >
          <!-- Popup Image -->
          <div
            v-if="afterGacha?.data?.select_image !== 'none'"
            class="w-auto h-24"
          >
            <img
              :src="handleImageAfterGacha(afterGacha?.data)"
              class="object-contain w-full h-full"
            />
          </div>

          <!-- Modal Text -->
          <div
            :class="{
              'font-bold px-4 text-exd-1530 text-center text-exd-gray-scorpion': true,
              'py-10': afterGacha?.data?.button_and_social_media === 'button'
            }"
            style="text-shadow: 0 3px 3px rgba(0, 0, 0, 0.16)"
          >
            <p class="max-h-[200px] px-8 leading-normal whitespace-pre-line">
              {{ afterGacha?.data?.modal_text }}
            </p>
          </div>

          <!-- Social Media Icons -->
          <div
            v-if="afterGacha?.data?.button_and_social_media !== 'button'"
            class="inline-flex flex-wrap items-center justify-center w-full px-8 gap-x-3 gap-y-1"
          >
            <div class="speech-bubble text-[10pt]">
              {{ $t('share') }}
              <div class="triangle-border"></div>
              <div class="triangle-inner"></div>
            </div>
            <img
              :src="line"
              alt="line"
              class="cursor-pointer size-6"
              @click="share('line')"
              preload
            />
            <img
              :src="x"
              alt="x"
              class="cursor-pointer size-6"
              @click="share('x')"
              preload
            />
            <img
              :src="facebook"
              alt="facebook"
              class="cursor-pointer size-6"
              @click="share('facebook')"
              preload
            />
          </div>

          <!-- Button -->
            <SolidButton
              v-if="afterGacha?.data?.button_and_social_media !== 'social_media'"
              :label="settings?.gacha?.after_gacha_screen?.data?.button_text"
              :bgColor="
                settings?.gacha?.after_gacha_screen?.data?.button_and_text_color
                  ?.background
              "
              :textColor="
                settings?.gacha?.after_gacha_screen?.data?.button_and_text_color
                  ?.color
              "
              @click="handleToRedirect"
            />
        </div>
      </div>
    </template>

    <template v-else #container>
      <img
        src="/images/close.svg"
        alt="close"
        width="30"
        height="30"
        preload
        class="absolute z-50 cursor-pointer right-1 top-1"
        @click="handleCloseDialog"
      />
      <div
        class="w-full flex flex-col justify-center items-center gap-4 py-6 !pb-8 relative"
      >
        <div
          class="px-4 mt-8 mb-4 font-bold text-center text-exd-1624 text-exd-gray-scorpion"
        >
          <p
            style="text-shadow: 0 3px 3px rgba(0, 0, 0, 0.16)"
            class="whitespace-pre-line"
          >
            {{ settings?.gacha?.after_gacha_screen?.data?.popup_title }}
          </p>
        </div>
        <SolidButton
          :label="settings?.gacha?.after_gacha_screen?.data?.button_1_text"
          :bgColor="
            settings?.gacha?.after_gacha_screen?.data?.button_1_text_color
              ?.background
          "
          :textColor="
            settings?.gacha?.after_gacha_screen?.data?.button_1_text_color
              ?.color
          "
          :on-click="handleToRegister"
        />
        <SolidButton
          :label="settings?.gacha?.after_gacha_screen?.data?.button_2_text"
          :bgColor="
            settings?.gacha?.after_gacha_screen?.data?.button_2_text_color
              ?.background
          "
          :textColor="
            settings?.gacha?.after_gacha_screen?.data?.button_2_text_color
              ?.color
          "
          :on-click="handleToLogin"
        />
      </div>
    </template>
  </Dialog>

  <ModalLogin v-model="modalLogin" />
</template>

<script setup>
import download from '~/assets/images/download.svg'
import facebook from '~/assets/images/facebook.svg'
import line from '~/assets/images/line.svg'
import x from '~/assets/images/x.svg'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  isRedirect: { type: Boolean, default: false },
  popupButton: { type: String, default: '' },
  popupLink: { type: String, default: '' },
  popupDescription: { type: String, default: '' },
  popupImage: { type: String, default: '' },
  pointCategoryIsFail: { type: Boolean, default: false },
})

const emit = defineEmits(['update:visible', 'closeModalLogin'])

const route = useRoute()
const modalLogin = ref(false)

const { decryptData } = useEncryption()
const { setSourceFrom } = useRegister()

const settings = useState('settings')
const afterGacha = settings.value?.gacha?.after_gacha_screen

const socialMediaLinks = ref([])

const handleShowDialog = () => emit('update:visible', true)
const handleCloseDialog = () => emit('update:visible', false)

const detailCharacter = ref({})

const description = settings.value?.global?.ogp?.description
const requestURL = useRequestURL()
const url = requestURL.origin

function stripHtml(html) {
  if (import.meta.client) {
    const div = document.createElement('div')
    div.innerHTML = html
    return div.textContent || div.innerText || ''
  }
  return html
}

const cleanDescription = stripHtml(description)

const quote = cleanDescription + ' ' + url

const handleToRedirect = async () => {
  if (props.pointCategoryIsFail) {
    const storedData = useCookie('VALID_PASSWORD')
    let parsedData = decryptData(storedData.value)

    const slug = parsedData.slug

    await navigateTo(`/spin/${slug}`)
  } else {
    const url = settings.value?.gacha?.after_gacha_screen?.data?.url_link

    if (url) {
      window.open(url, '_blank')
    }
  }
}

const handleToRegister = async () => {
  setSourceFrom('spin')
  await navigateTo('/register')
}

const handleToLogin = () => {
  setSourceFrom('spin')
  handleCloseDialog()
  modalLogin.value = true
  emit('closeModalLogin')
}

const openLink = (url) => {
  window.open(url.value, '_blank')
}

const share = (type) => {
  switch (type) {
    case 'facebook':
      shareToFacebook()
      break
    case 'x':
      shareToX()
      break
    case 'line':
      shareToLine()
      break

    default:
      break
  }
}

const generateUrlToShare = () => {
  const storedData = useCookie('VALID_PASSWORD')
  const parsedData = decryptData(storedData.value)
  const slug = parsedData.slug
  
  let objectToShare = {
    url: url,
    quote: quote,
  }

  try {
    objectToShare.url =
      url +
      `/spin/${slug}`
    objectToShare.quote =
      quote +
      `/spin/${slug}`
  } catch (error) {
    console.log(error)
  }

  return objectToShare
}

const shareToFacebook = () => {
  let objectToShare = generateUrlToShare()
  try {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        objectToShare.url
      )}`
    )
  } catch (error) {
    console.log(error)
  }
}

const shareToX = () => {
  let objectToShare = generateUrlToShare()

  try {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        objectToShare.quote
      )}`
    )
  } catch (error) {
    console.log(error)
  }
}

const shareToLine = () => {
  let objectToShare = generateUrlToShare()
  try {
    window.open(
      `https://line.me/R/msg/text/?${encodeURIComponent(objectToShare.quote)}`
    )
  } catch (error) {
    console.log(error)
  }
}

const handleImageAfterGacha = (data) => {
  if (!data) return

  const type = data.select_image

  if (type === 'character') {
    return detailCharacter.value.character_image
  } else if (type === 'point') {
    return detailCharacter.value.point_image
  } else if (type === 'point_category') {
    return props.popupImage
  } else {
    return data?.without_registration_image
  }
}

const handleKeydown = (event) => {
  if (event.key === 'Enter') {
    if (props.visible && afterGacha?.option === '2') { 
      handleToRedirect()
    }
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
})

onMounted(() => {
  const storedData = useCookie('VALID_PASSWORD')
  const parsedData = decryptData(storedData.value)
  const slug = parsedData.slug.toUpperCase()
  const slugData = decryptData(localStorage.getItem(`${slug}_GACHA`))
  const gachaSocialMedia = afterGacha?.data?.data_share_social_media

  detailCharacter.value = slugData

  if (!gachaSocialMedia) {
    socialMediaLinks.value = []
    return
  }

  socialMediaLinks.value = Object.entries(gachaSocialMedia)
    .filter(([_, value]) => value)
    .map(([key, value]) => ({
      key,
      value,
    }))
})
</script>

<style scooped>
.speech-bubble {
  position: relative;
  background-color: #ffffff;
  border: 1px solid #555555;
  border-radius: 6px;
  padding: 7px 12px;
  display: inline-block;
  color: #000;
  max-width: 300px;
}

.triangle-border {
  position: absolute;
  top: 50%;
  right: -9px;
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 4px 0 4px 9px;
  border-color: transparent transparent transparent #606060;
  transform: translateY(-50%);
}

.triangle-inner {
  position: absolute;
  top: 50%;
  right: -8px;
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 4px 0 4px 14px;
  border-color: transparent transparent transparent white;
  transform: translateY(-50%);
}
</style>
