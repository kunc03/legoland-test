<template>
  <Dialog
    :visible="modelValue"
    @update:visible="$emit('update:modelValue', $event)"
    modal
    class="!w-11/12 !max-w-sm border border-exd-gray-44"
    :style="{
      background: settings?.global?.modal?.background_color,
    }"
  >
    <template #container>
      <img
        :src="close"
        alt="close"
        width="30"
        height="30"
        preload
        class="absolute z-50 cursor-pointer right-5 top-4"
        @click="handleClose"
      />

      <div
        class="relative flex flex-col items-center justify-center w-full gap-4 pb-6 overflow-hidden rounded-xl"
      >
        <!-- Image -->
        <div v-if="image" class="relative w-full">
          <img :src="image" alt="modal image" class="object-contain w-full px-8 pt-8" :class="{ 'max-h-64': isExternalPrize,  }" />
          <div
            v-if="category && !isExternalPrize"
            class="absolute top-0 mx-10 mt-10 px-1 bg-[#FF0076] text-sm text-white"
          >
            {{ category }}
          </div>
        </div>

        <!-- Text -->
        <div
          v-if="text"
          class="px-8 font-bold text-center text-[3.3vw] sm:text-[14px]"
          :class="{ 'min-h-[72px]': !isExternalPrize }"
          :style="{
            color: settings?.global?.modal?.text_color,
          }"
        >
          <p style="text-shadow: 0 3px 3px rgba(0, 0, 0, 0.16)">
            {{ text }}
          </p>
        </div>

        <!-- Button -->
        <div v-if="isExternalPrize" class="flex items-center gap-4">
          <button
            class="flex items-center justify-center w-12 h-12 rounded-full disabled:opacity-30 disabled:cursor-not-allowed"
            :style="{ backgroundColor: bgColor }"
            :disabled="currentIndex === 0"
            @click="handlePrev"
          >
            <IconsArrow class="w-6 h-6" :style="{ color: textColor }" />
          </button>
          <!-- Pagination Dots -->
          <div class="flex gap-2">
            <button
              v-for="i in totalSteps"
              :key="i"
              class="w-2 h-2 transition-colors rounded-full cursor-pointer"
              :class="currentIndex === i - 1 ? 'bg-[#FF0076]' : 'bg-gray-300'"
              @click="handleGoto(i - 1)"
            />
          </div>
          <button
            class="flex items-center justify-center w-12 h-12 rounded-full"
            :style="{ backgroundColor: bgColor }"
            @click="handleButtonTap"
          >
            <IconsArrow class="w-6 h-6 rotate-180" :style="{ color: textColor }" />
          </button>
        </div>
        <SolidButton
          v-else-if="buttonText"
          :label="buttonText"
          :bgColor="bgColor"
          :textColor="textColor"
          :onClick="handleButtonTap"
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup>
import { nextTick } from 'vue'
import close from '~/assets/images/close.svg'

const settings = useState('settings')

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  image: {
    type: String,
    default: null,
  },
  text: {
    type: String,
    default: null,
  },
  category: {
    type: String,
    default: null,
  },
  buttonText: {
    type: String,
    default: null,
  },
  onClose: {
    type: Function,
    default: null,
  },
  onButtonTap: {
    type: Function,
    default: null,
  },
  bgColor: {
    type: String,
    default: '#fff',
  },
  textColor: {
    type: String,
    default: '#fff',
  },
  isExternalPrize: {
    type: Boolean,
    default: false,
  },
  onPrev: {
    type: Function,
    default: null,
  },
  currentIndex: {
    type: Number,
    default: 0,
  },
  totalSteps: {
    type: Number,
    default: 0,
  },
})

const emits = defineEmits(['update:modelValue', 'prev', 'goto'])

const handleClose = () => {
  if (props.onClose) {
    props.onClose()
  } else {
    emits('update:modelValue', false)
  }
}

const handleButtonTap = () => {
  nextTick(() => {
    if (props.onButtonTap) {
      props.onButtonTap()
    } else {
      emits('update:modelValue', false)
    }
  })
}

const handlePrev = () => {
  nextTick(() => {
    if (props.onPrev) {
      props.onPrev()
    } else {
      emits('prev')
    }
  })
}

const handleGoto = (index) => {
  emits('goto', index)
}
</script>
