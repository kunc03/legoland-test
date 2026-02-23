<template>
  <div class="flex flex-col w-full">
    <label
      :for="`label-${label}`"
      class="flex items-center gap-2 text-exd-gray-scorpion text-exd-1424"
      v-if="label !== ''"
      >{{ label }}
      <span
        v-if="required"
        class="text-exd-0910 px-1 py-[2px] rounded-sm"
        :style="{ backgroundColor: bgColor, color: 'var(--primary)' }"
        >{{ $t('required') }}</span
      ></label
    >
    <Textarea
      :rows="2"
      :autoResize="false"
      :value="modelValue"
      @input="updateValue($event.target.value)"
      @blur="validate"
      :invalid="error !== '' ? true : false"
      :aria-describedby="`${model}-help`"
      :class="[
        'grow w-full bg-gray-100 text-exd-gray-scorpion px-4 py-2 resize-none focus:!outline-none focus:!ring-0 border-1 !rounded-lg selection:!bg-gray-300 selection:!border-none',
        (error !== '') || (validateOnSubmit && !isLengthValid && !modelValue)
          ? '!border-2 border-exd-red-vermilion'
          : '!border-none',
      ]"
    />
    <small v-if="hasHelper" :id="`${model}-help`">{{ helperText }}</small>
    <small
      v-if="error !== '' || (validateOnSubmit && !isLengthValid && !modelValue)"
      :id="`${model}-error`"
      :class="['p-error']"
      >{{ error }}</small
    >
  </div>
</template>

<script setup>
import Textarea from 'primevue/textarea'

const props = defineProps({
  prefix: {
    type: String,
    default: '',
  },
  suffix: {
    type: String,
    default: '',
  },
  type: {
    type: String,
    default: 'text',
  },
  error: {
    type: String,
    default: '',
  },
  hasHelper: {
    type: Boolean,
    default: false,
  },
  helperText: {
    type: String,
    default: '',
  },
  label: {
    type: String,
    default: '',
  },
  model: {
    type: String,
    default: '',
  },
  required: {
    type: Boolean,
    default: false,
  },
  bgColor: {
    type: String,
    default: 'gray',
  },
  textColor: {
    type: String,
    default: 'white',
  },
  validateOnSubmit: Boolean,
})

const emit = defineEmits(['update:model', 'validate'])

const isLengthValid = ref(true)

const modelValue = computed({
  get: () => props.model,
  set: (value) => emit('update:model', value),
})

const updateValue = (value) => {
  modelValue.value = value
  validate()
  emit('validate', value)
}

const validate = () => {
  isLengthValid.value = (modelValue.value?.length || 0) > 0
  emit('validate', modelValue.value)
}

watch(
  () => props.validateOnSubmit,
  (newValue) => {
    if (newValue) {
      validate()
    }
  }
)
</script>
