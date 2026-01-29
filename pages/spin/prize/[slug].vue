<template>
  <SpinPage />

  <Dialog
    v-model:visible="insufficientDialogVisible"
    modal
    class="!max-w-sm border border-exd-gray-44 rounded-xl"
    :dismissableMask="false"
    :closable="false"
    :style="{
      background: settings?.global?.modal?.background_color,
    }"
  >
    <template #container>
      <div
        class="flex flex-col items-center justify-center w-full h-full gap-4 p-5"
      >
        <div class="flex flex-col items-center justify-center w-full gap-8">
          <IconsWarning
            class="w-10 h-10"
            :style="{ color: settings?.global?.icon_color?.background }"
          />
          <p
            class="font-bold text-center text-exd-1424"
            :style="{
              color: settings?.global?.modal?.text_color,
            }"
          >
            {{ errorMessage }}
          </p>

          <SolidButton
            :on-click="() => navigateTo('/prize')"
            :label="$t('returnToPrizeList')"
            :bgColor="settings?.prize?.step_2?.swipe_exchange?.data?.button_and_text_color?.background"
            :textColor="settings?.prize?.step_2?.swipe_exchange?.data?.button_and_text_color?.color"
            class="w-full"
          />
        </div>
      </div>
    </template>
  </Dialog>
</template>

<script setup>
import SpinPage from '../[randomCode].vue'
import Dialog from 'primevue/dialog'
import { useI18n } from 'vue-i18n'

const route = useRoute()
const { t } = useI18n()
const settings = useState('settings')

const insufficientDialogVisible = ref(false)
const errorMessage = ref('')
const prizeId = computed(() => route.query.prize_id)
const externalGachaSlug = computed(() => route.params.slug)

onMounted(async () => {
  if (!prizeId.value) {
    errorMessage.value = t('noPrizesAtOtherGacha')
    insufficientDialogVisible.value = true
    return
  }

  try {
    await useFetchApi('POST', 'external-prize/validate', {
      body: {
        external_gacha_slug: externalGachaSlug.value,
        prize_id: prizeId.value,
      },
    })
  } catch (error) {
    errorMessage.value = error._data?.message || error.message
    insufficientDialogVisible.value = true
  }
})
</script>
