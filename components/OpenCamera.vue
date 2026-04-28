<script setup>
import warning from '~/assets/images/warning.svg'
import close from '~/assets/images/close.svg'

const refInputFile = ref(null)
const modalWarning = ref(false)
const warningMessage = ref('')

const handleClick = (e) => {
  e.stopPropagation()

  const userAgent = navigator.userAgent.toLowerCase()

  if (userAgent.includes('windows') || userAgent.includes('linux')) {
    modalWarning.value = true
    warningMessage.value = "Can't open camera on this device!"
    e.preventDefault()
  }
}

const click = () => {
  refInputFile.value.click()
}

defineExpose({
  click,
})
</script>

<template>
  <label>
    <input
      ref="refInputFile"
      type="file"
      capture="environment"
      accept="image/*"
      class="sr-only"
      @click="handleClick"
  /></label>

  <Dialog
    v-model:visible="modalWarning"
    modal
    class="!bg-white !w-8/12 !max-w-sm border border-exd-gray-44"
  >
    <template #container>
      <img :src="$imgV(close)"
        alt="close"
        width="30"
        height="30"
        preload
        class="absolute right-1 top-1 cursor-pointer z-50"
        @click="modalWarning = false"
      />
      <div
        class="w-full flex flex-col justify-center items-center gap-4 py-8 px-4"
      >
        <img :src="$imgV(warning)" alt="warning" width="40" height="40" preload />
        <div class="text-center w-10/12">
          <p class="font-bold text-exd-1424 text-exd-gray-scorpion">
            {{ warningMessage }}
          </p>
        </div>
      </div>
    </template>
  </Dialog>
</template>
