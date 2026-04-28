<template>
  <div class="flex flex-col gap-5">
    <div class="min-h-44 bg-exd-banana w-full">
      <img :src="$imgV(image)" :alt="image" preload />
    </div>
    <p class="text-exd-1422 text-exd-gray-scorpion">
      <slot name="content" />
    </p>
  </div>
</template>

<script setup>
const props = defineProps({
  image: {
    type: String,
  },
})
</script>
