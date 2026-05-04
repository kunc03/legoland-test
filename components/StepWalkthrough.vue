<template>
  <BasicModal
    v-if="steps.length > 0"
    v-model="isOpen"
    :image="currentStep.image"
    :text="currentStep.text || currentStep.name"
    :category="typeof currentStep.category === 'object' ? currentStep.category?.name : currentStep.category"
    :button-text="$t('next')"
    :on-button-tap="handleNext"
    :on-close="handleClose"
    :bgColor="bgColor"
    :textColor="textColor"
    :isExternalPrize="isExternalPrize"
    :currentIndex="currentIndex"
    :totalSteps="steps.length"
    @prev="handlePrev"
    @goto="handleGoto"
  />
</template>

<script setup>
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  steps: {
    type: Array,
    default: () => [],
    // Each step: { image: String, text: String, category: String }
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
})

const emits = defineEmits(['update:modelValue', 'done'])

const currentIndex = ref(0)

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emits('update:modelValue', val),
})

const currentStep = computed(() => props.steps[currentIndex.value] ?? {})

const handleNext = () => {
  nextTick(() => { // Tambahkan ini
    if (currentIndex.value < props.steps.length - 1) {
      currentIndex.value++
      isOpen.value = true
    } else {
      isOpen.value = false
      emits('done')
    }
  })
}

const handleClose = () => {
  isOpen.value = false
  emits('done')
}

const handlePrev = () => {
  nextTick(() => {
    if (currentIndex.value > 0) {
      currentIndex.value--
      isOpen.value = true
    }
  })
}

const handleGoto = (index) => {
  nextTick(() => {
    if (index >= 0 && index < props.steps.length) {
      currentIndex.value = index
      isOpen.value = true
    }
  })
}

// Reset index whenever walkthrough is opened
watch(
  () => props.modelValue,
  (val) => {
    if (val) currentIndex.value = 0
  }
)
</script>
