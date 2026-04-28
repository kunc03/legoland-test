<template>
  <div
    :class="[
      props.variant === 'without-background' ? 'bg-transparent' : '',
      'h-full flex justify-center items-center p-2',
    ]"
    :style="variantStyle"
  >
    <img :src="$imgV(image || notImage)"
      alt="character"
      class="relative object-contain w-full h-full"
      preload
      @error="handleImageError"
      :class="isDisabled ? 'opacity-50' : ''"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import notImage from '~/assets/images/notimage.png'

const props = defineProps({
  image: String,
  variant: {
    type: String,
    default: 'with-background',
    validator: (value) =>
      ['with-background', 'without-background'].includes(value),
  },
  bgColor: {
    type: String,
    default: '#FFF6E8',
  },
  isDisabled: Boolean,
})

const variantStyle = computed(() => {
  return props.variant === 'with-background'
    ? { backgroundColor: props.bgColor }
    : {}
})
</script>