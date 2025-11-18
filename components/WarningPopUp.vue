<template>
  <Modal :is-open="isOpen" :on-close="() => handleClose()">
    <template v-slot:body>
      <div
        class="flex flex-col items-center justify-end w-full gap-8 mt-2 h-exd-200"
      >
        <p
          class="p-5 font-bold text-center text-exd-1424"
          :style="{
            color: settings?.global?.modal?.text_color
          }"
        >
          {{ modalTitle }}
        </p>

        <div class="w-full pb-5">
          <SolidButton
            v-if="hasButton"
            :label="labelButton"
            :bgColor="bgColor ? bgColor : settings.value?.buttons[0]?.background"
            :textColor="textColor ? textColor : settings.value?.buttons[0]?.color"
            :on-click="() => handleClick()"
          />
        </div>
      </div>
    </template>
  </Modal>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  labelButton: {
    type: String,
    default: '',
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
  modalTitle: {
    type: String,
    default: '',
  },
  hasButton: {
    type: Boolean,
    default: false,
  },
  onClickButton: {
    type: Function,
    default: null,
  },
  onClose: {
    type: Function,
    default: null,
  },
  bgColor: {
    type: String,
    default: '#000000',
  },
  textColor: {
    type: String,
    default:'#ffffff',
  },
})

const emit = defineEmits(['update:isOpen'])
const settings = useState('settings')

const handleClose = (event) => {
  props.onClose(event)
}

const handleClick = (event) => {
  if (props.onClickButton) {
    props.onClickButton(event)
  }
}

const handleKeydown = (event) => {
  if (event.key !== 'Enter') return

  event.preventDefault()
  event.stopPropagation()

  if (props.isOpen) {
    handleClick()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>
