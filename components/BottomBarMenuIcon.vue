<template>
  <div
    class="flex flex-col items-center justify-center cursor-pointer"
    @click="handleClick"
  >
    <img :src="$imgV(icon)"
      alt="icon"
      preload
      class="text-center w-[25px] h-[25px] sm:w-[33px] sm:h-[33px]"
    />
    <p class="text-exd-gray-scorpion text-[8px] line-clamp-1">{{ label }}</p>
  </div>
</template>

<script setup>
const props = defineProps({
  icon: {
    type: String,
    required: true,
  },
  label: {
    type: String,
    required: true,
  },
  onClick: {
    type: Function,
    default: null,
  },
})

const handleClick = (event) => {
  if (props.onClick) {
    props.onClick(event)
  }
}
</script>
