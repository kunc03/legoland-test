<template>
  <template v-if="!isFetching">
    <div
      :class="[
        roundedClass,
        'bg-white w-full p-3 flex flex-col gap-2 border-b border-b-exd-light-grey relative',
        isDisabled ? 'cursor-default' : 'cursor-pointer',
        isRedeemed && !isFailed ? '!cursor-default !bg-gray-100' : 'cursor-pointer',
        (isFailed && isRedeemed) ? 'cursor-pointer' : 'cursor-default',
        isLastItem ? 'rounded-b-xl' : ''
      ]"
      @click="handleClick"
    >
      <div class="flex items-center gap-3">
        <div v-if="showImage" class="w-[40%] flex items-center">
          <CharacterCard :image="imageCard" :isDisabled="isDisabled" :bgColor="bgColor" />
        </div>
        <slot name="text"></slot>
        <div
          v-if="!history"
          class="!absolute !right-3 !top-1/2 !transform !-translate-y-1/2"
        >
          <img
            :src="arrow"
            alt="arrow"
            width="10"
            height="10"
            preload
            class="invert"
          :class="isDisabled ? 'opacity-50' : ''"
          />
        </div>
        <div v-if="history" class="w-full mt-1 max-w-16 max-h-16" :class="(isRedeemed && !isFailed) || isDisabled ? 'opacity-40' : ''">
          <CharacterCard :image="imageCard" variant="without-background" />
        </div>
      </div>
      <slot name="action"></slot>
    </div>
  </template>
  <template v-else>
    <div
      :class="[
        roundedClass,
        'bg-white p-3 inline-flex gap-2 border-b border-b-exd-light-grey w-100 relative',
      ]"
    >
      <div class="w-20 h-16">
        <Skeleton width="10rem" class="!h-full !w-full"></Skeleton>
      </div>
      <div class="inline-flex justify-between w-100">
        <div class="flex flex-col justify-center w-11/12 gap-2">
          <Skeleton class="!w-full !h-2"></Skeleton>
          <Skeleton class="!w-full !h-2"></Skeleton>
          <Skeleton width="5rem" class="!h-2"></Skeleton>
        </div>
      </div>
      <div class="!absolute !right-3 !top-1/2 !transform !-translate-y-1/2">
        <img
          :src="arrow"
          alt="arrow"
          width="12"
          height="12"
          preload
          class="invert"
        />
      </div>
    </div>
  </template>
</template>

<script setup>
import arrow from '~/assets/images/arrow.svg'
const props = defineProps({
  isFetching: {
    type: Boolean,
    default: false,
  },
  hasBorderBottom: {
    type: Boolean,
    default: true,
  },
  hasRounded: {
    type: Boolean,
    default: false,
  },
  withBackgroundIconImage: {
    type: Boolean,
    default: true,
  },
  imageCard: { type: String, default: '' },
  onClick: {
    type: Function,
    default: null,
  },
  history: {
    type: Boolean,
    default: false,
  },
  isDisabled: {
    type: Boolean,
    default: false,
  },
  showImage: {
    type: Boolean,
    default: true,
  },
  bgColor: {
    type: String
  },
  isRedeemed: {
    type: Boolean,
    default: false
  },
  isFailed: {
    type: Boolean,
    default: false
  },
  isLastItem: {
    type: Boolean,
    default: false
  }
})

const handleClick = (event) => {
  if (props.isDisabled || (!props.isFailed && props.isRedeemed)) {
    return
  }
  
  if (props.onClick) {
    props.onClick(event)
  }
}

const roundedClass = computed(() => {
  return props.hasRounded ? 'rounded-xl' : 'rounded-none'
})
</script>