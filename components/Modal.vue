<template>
  <Dialog
    :visible="isOpen"
    modal
    :class="`!w-${width} !max-w-sm border border-exd-gray-44 rounded-xl`"
    :style="{
      background: settings?.global?.modal?.background_color
    }"
    @update:visible="$emit('isOpen', $event)"
  >
    <template #container>
      <img :src="$imgV(close)"
        :hidden="isHiddenClose"
        alt="close"
        width="30"
        height="30"
        preload
        class="absolute z-50 cursor-pointer right-1 top-1"
        @click="() => handleClose()"
      />
      <div 
        class="w-full h-full" 
      >
        <slot name="body" />
      </div>
    </template>
  </Dialog>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'
import close from '~/assets/images/close.svg'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  onClose: {
    type: Function,
    default: null,
  },
  isHiddenClose: {
    type: Boolean,
    default: false,
  },
  width: {
    type: String,
    default: 'exd-300',
  },
})

const settings = useState('settings')
const emit = defineEmits(['update:isOpen'])

const handleClose = () => {
  props.onClose && props.onClose()
}
</script>
