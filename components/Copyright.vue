<template>
  <div class="flex justify-center text-center text-[8px] text-white mt-5">
    <p class="flex flex-col bg-exd-gray-scorpion py-2 w-[83%] rounded-xl" :class="class">
      <span class="">LEGO, the LEGO logo & LEGOLAND are trademarks of the LEGO Group.</span>
      <span class="">©2026 The LEGO Group. LEGOLAND is part of Merlin Entertainments Ltd.</span>
    </p>
  </div>
</template>

<script setup>
const props = defineProps({
  class: {
    type: String,
    default: '',
  },
})
</script>