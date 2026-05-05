<template>
  <div class="flex justify-center text-center text-[8px] text-white">
    <p class="flex flex-col bg-black py-2 w-full" :class="className">
      <span class="">LEGO, the LEGO logo & LEGOLAND are trademarks of the LEGO Group.</span>
      <span class="">©2026 The LEGO Group. LEGOLAND is part of Merlin Entertainments Ltd.</span>
    </p>
  </div>
</template>

<script setup>
const props = defineProps({
  className: {
    type: String,
    default: '',
  },
})
</script>