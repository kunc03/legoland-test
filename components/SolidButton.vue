<template>
  <div class="w-full px-8">
    <Button
      :disabled="disabled"
      :loading="hasLoading"
      :class="[
        variantClass,
        variant === 'skip' ? '!p-2' : '!py-4 !px-6',
        bottomClass,
        disabled ? '!cursor-not-allowed' : '!cursor-pointer',
        '!w-full !uppercase !font-bold sm:!text-exd-1424 !text-exd-1218 !rounded-full text-white !relative',
      ]"
      raised
      @click="handleClick"
      :style="{
        backgroundColor: bgColor,
        color: textColor,
      }"
    >
      <span class="!text-center !w-full">{{ label }}</span>
      <div class="!absolute !right-6 !top-1/2 !transform !-translate-y-1/2">
        <LoadingIcon v-if="hasLoading && variant !== 'skip'" />
        <IconsArrow v-if="hasIcon && !hasLoading && variant !== 'skip'" :style="{ color: textColor }" class="w-8 h-8 rotate-180" />
      </div>
      <div v-if="hasIcon && variant === 'skip'" class="flex pr-3">
        <img :src="$imgV(arrowSkip)" alt="arrow" width="16" height="10" />
        <img :src="$imgV(arrowSkip)" alt="arrow" width="16" height="10" />
      </div>
    </Button>
  </div>
</template>

<script setup>
import LoadingIcon from './LoadingIcon.vue'
import arrow from '~/assets/images/arrow.svg'
import arrowTom from '~/assets/images/arrow-gray.png'
import arrowSkip from '~/assets/images/arrow-skip.svg'

const props = defineProps({
  hasIcon: {
    type: Boolean,
    default: true,
  },
  hasBottom: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  hasLoading: {
    type: Boolean,
    default: false,
  },
  label: {
    type: String,
    required: true,
  },
  variant: {
    type: String,
    validator: (value) =>
      ['skip', 'red-coral', 'disabled', 'dark', 'green'].includes(value),
  },
  bgColor: {
    type: String,
    default: '',
  },
  textColor: {
    type: String,
    default: '',
  },
  onClick: {
    type: Function,
    default: null,
  },
})

const variantClass = computed(() => {
  if (props.variant === 'skip') {
    return '!bg-exd-gray-scorpion !text-white text-start !text-[16px] !w-auto !font-normal !opacity-90  !rounded-xl'
  } else if (props.variant === 'red-coral') {
    return '!bg-exd-red-coral'
  } else if (props.variant === 'green') {
    return '!bg-exd-green'
  } else if (props.variant === 'disabled') {
    return '!bg-exd-stone-300'
  } else if (props.variant === 'dark') {
    return '!bg-exd-dark'
  } else {
    return 'bg-exd-red-vermilion'
  }
})

const bottomClass = computed(() => {
  return props.hasBottom
    ? 'inset-x-1/2 z-50 -translate-x-1/2 !absolute !bottom-6'
    : ''
})

const handleClick = (event) => {
  props.onClick && props.onClick(event)
}

const reload = useState('reload')

watchEffect(() => {
  if (reload.value) {
    window.location.reload()
  }
})
</script>
