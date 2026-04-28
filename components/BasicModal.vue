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
      <img :src="$imgV(close)"
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
          <img :src="$imgV(image)" alt="modal image" class="w-full object-cover px-8 pt-8" />
          <div
            v-if="category"
            class="absolute top-0 mx-10 mt-10 px-1 bg-[#FF0076] text-sm text-white"
          >
            {{ category }}
          </div>
        </div>

        <!-- Text -->
        <div
          v-if="text"
          class="px-8 font-bold text-center text-exd-1424 min-h-[72px]"
          :style="{
            color: settings?.global?.modal?.text_color,
          }"
        >
          <p style="text-shadow: 0 3px 3px rgba(0, 0, 0, 0.16)">
            {{ text }}
          </p>
        </div>

        <!-- Button -->
        <SolidButton
          v-if="buttonText"
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
})

const emits = defineEmits(['update:modelValue'])

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
</script>
