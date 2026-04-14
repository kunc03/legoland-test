<template>
  <header
    class="h-[74px] sm:h-[102px] flex justify-between items-center top-0 left-0 right-0 z-40 fixed w-full max-w-md mx-auto "
    :style="{ 'box-shadow': '0px 3px 3px 0px rgba(0, 0, 0, 0.1608)', 'background': settings.global?.global_header_footer_color }"
    @touchmove="(e) => e.preventDefault()"
  >
    <div class="pl-5" v-if="hasBack">
      <IconsArrow :style="{ color: settings.global?.icon_color?.background }" @click="handleGoBack" class="cursor-pointer" />
    </div>

    <div
      :class="['grow text-center', !hasBack ? 'pl-[60px]' : '']"
      v-if="!withLogo"
    >
      <slot />
    </div>
    <div
      :class="[
        'grow text-center w-full justify-center items-center flex',
        !hasBack ? 'pl-[60px]' : '',
      ]"
      v-else
    >
      <img
        :src="settings.global.logo"
        alt="intl"
        preload
        class="absolute w-auto h-full transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2"
      />
    </div>
    <div class="pr-5 shrink-0">
      <div class="relative flex" :class="hasMultipleLanguages ? '' : 'opacity-0'">
        <button type="button" :class="hasMultipleLanguages ? '' : 'cursor-default'" aria-haspopup="true" @click="() => { if (hasMultipleLanguages) { langPanelToggle() } }">
          <IconsLang :style="{ color: settings.global?.icon_color?.background }" />
        </button>
        <LanguangePanel v-model:visible="langPanel" />
      </div>
    </div>
  </header>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const settings = useState('settings')
const hasMultipleLanguages = Object.keys(settings.value.languages).length > 1

defineProps({
  hasBack: {
    type: Boolean,
    default: false,
  },
  withLogo: {
    type: Boolean,
    default: false,
  },
})

const langPanel = ref(false)

const langPanelToggle = (event) => {
  langPanel.value = !langPanel.value
}

const handleGoBack = () => {
  if (window.history.length > 2) {
    router.back()
  } else {
    router.push('/')
  }
}
</script>
