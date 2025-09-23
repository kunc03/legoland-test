<template>
  <HeaderBar hasBack>
    <div v-if="isFetching" class="flex justify-center">
      <Skeleton class="!w-32 !h-6 bg-gray-200" />
    </div>
    <p
      style="text-shadow: 0 3px 3px rgba(0, 0, 0, 0.16)"
      class="text-exd-gray-scorpion font-bold text-exd-1824.52"
    >
      {{ settings?.prize?.step_2?.[type]?.data?.page_title }}
    </p>
  </HeaderBar>

  <div
    class="flex flex-col text-black !bg-no-repeat h-full !bg-cover !bg-center"
    :style="{
      background:
        settings?.prize?.step_2?.[type]?.data?.background_page.type === 'image'
          ? `url(${settings?.prize?.step_2?.[type]?.data?.background_page.value})`
          : settings?.prize?.step_2?.[type]?.data?.background_page.value,
    }"
  >
    <div
      class="relative w-full px-3 mb-20 overflow-y-auto border border-b-0 border-gray-200"
    >
      <div class="w-full flex flex-col items-center justify-center text-[15px]">
        <h1
          class="flex justify-center w-full pt-32 pb-10 font-bold text-exd-gray-scorpion"
        >
          {{ settings?.prize?.step_2?.[type]?.data?.sub_title }}
        </h1>
        
        <div v-if="!type" class="flex justify-center">
          <Skeleton class="!w-44 !h-6 bg-gray-200" />
        </div>
      </div>
      <div class="flex flex-col px-3 grow">
        <div
          v-for="(item, index) in visibleRedeemFields"
          :key="index"
          class="!w-full p-0"
        >
          <div
            v-if="item.show"
            class="gap-4 px-5 py-5 border-b border-b-exd-light-grey"
          >
            <InputText
              v-if="
                item.type !== 'checkbox' &&
                item.type !== 'date' &&
                item.type !== 'select_button' &&
                item.type !== 'radio' &&
                item.type !== 'dropdown' &&
                item.type !== 'textarea'
              "
              :onlyNumeric="
                item.name === 'postal_code' ||
                item.text_type === 'number' ||
                item.text_type === 'tel'
                  ? true
                  : false
              "
              :type="item.text_type"
              :model="form[item.name]"
              :label="item.label"
              :required="item.required"
              :placeholder="item.placeholder"
              @update:model="
                ($event) => {
                  updateModel(item.name, item.type, $event)
                  if (item.name === 'postal_code') {
                    checkPostalCode($event)
                  }
                }
              "
              @validate="validateInput(item.name, $event)"
              :validate-on-submit="validateOnSubmit"
              :error="
                handleError(
                  item.name,
                  item.required,
                  item?.min,
                  item?.max,
                  item.text_type
                )
              "
              hasHelper
              :class="{
                'input-error': handleError(
                  item.name,
                  item.required,
                  item?.min,
                  item?.max,
                  item.text_type
                ),
              }"
              :w230Px="
                item.name === 'phone_number' || item.name === 'postal_code'
                  ? true
                  : false
              "
              :border="true"
              :bgColor="
                settings?.prize?.step_2?.[type]?.data?.button_and_text_color?.background
              "
              :textColor="
                settings?.prize?.step_2?.[type]?.data?.button_and_text_color?.color
              "
              :autocomplete="getAutocomplete(item)"
            />

            <GenderSelection
              v-if="item.type === 'select_button'"
              v-model="form[item.name]"
              :label="item.label"
              :required="item.required"
              :options="optionsMap(item.options)"
              :bg-color="
                settings?.prize?.step_2?.[type]?.data?.button_and_text_color?.background
              "
              :text-color="
                settings?.prize?.step_2?.[type]?.data?.button_and_text_color?.color
              "
            />

            <InputDate
              v-if="item.type === 'date'"
              :label="item.label"
              :placeholder="item.placeholder"
              :required="item.required"
              v-model:model="form[item.name]"
              :error="
                handleError(
                  item.name,
                  item.required,
                  item?.min,
                  item?.max,
                  item.text_type
                )
              "
              @update:model="updateModel(item.name, item.type, $event)"
              :manualInput="false"
              :class="{
                'input-error': handleError(
                  item.name,
                  item.required,
                  item?.min,
                  item?.max,
                  item.text_type
                ),
              }"
              :bgColor="
                settings?.prize?.step_2?.[type]?.data?.button_and_text_color?.background
              "
              :textColor="
                settings?.prize?.step_2?.[type]?.data?.button_and_text_color?.color
              "
              border
            />

            <InputTextArea
              v-show="item?.type === 'textarea'"
              v-model:model="form[item.name]"
              :label="item.label"
              :placeholder="item.placeholder"
              :required="item.required"
              @validate="validateInput(item.name, $event)"
              :error="
                handleError(
                  item.name,
                  item.required,
                  item?.min,
                  item?.max,
                  item.text_type
                )
              "
              :validate-on-submit="validateOnSubmit"
              :class="{
                'input-error': handleError(
                  item.name,
                  item.required,
                  item?.min,
                  item?.max,
                  item.text_type
                ),
              }"
              :bgColor="
                settings?.prize?.step_2?.[type]?.data?.button_and_text_color?.background
              "
              :textColor="
                settings?.prize?.step_2?.[type]?.data?.button_and_text_color?.color
              "
            />

            <RadioButton
              v-if="item?.type === 'radio'"
              :label="item.label || ''"
              v-model="form[item.name]"
              @update:modelValue="updateModel(item.name, item.type, $event)"
              :options="optionsMap(item.options)"
              :error="
                handleError(
                  item.name,
                  item.required,
                  item?.min,
                  item?.max,
                  item?.text_type
                )
              "
              :class="{
                'input-error': handleError(
                  item.name,
                  item.required,
                  item?.min,
                  item?.max,
                  item?.text_type
                ),
              }"
              :bgColor="
                settings?.prize?.step_2?.[type]?.data?.button_and_text_color?.background
              "
              :textColor="
                settings?.prize?.step_2?.[type]?.data?.button_and_text_color?.color
              "
              :required="item.required"
            />

            <Dropdown
              v-if="item?.type === 'dropdown'"
              :model="form[item.name]"
              @update:model="updateModel(item.name, item.type, $event)"
              @validate="validateInput(item.name, $event)"
              :label="item.label"
              :options="optionsMap(item.options)"
              optionValue="value"
              optionLabel="label"
              :placeholder="item.placeholder"
              :hasHelper="true"
              :validate-on-submit="validateOnSubmit"
              :error="
                handleError(
                  item.name,
                  item.required,
                  item?.min,
                  item?.max,
                  item.text_type
                )
              "
              :class="{
                'input-error': handleError(
                  item.name,
                  item.required,
                  item?.min,
                  item?.max,
                  item.text_type
                ),
              }"
              :bgColor="
                settings?.prize?.step_2?.[type]?.data?.button_and_text_color?.background
              "
              :textColor="
                settings?.prize?.step_2?.[type]?.data?.button_and_text_color?.color
              "
            />

            <InputMultipleSelect
              v-if="item?.type === 'checkbox'"
              :label="item.label"
              :placeholder="item.placeholder"
              :required="item.required"
              v-model:model="form[item.name]"
              @validate="validateInput(item.name, $event)"
              :options="optionsMap(item.options)"
              :error="
                handleError(
                  item.name,
                  item.required,
                  item?.min,
                  item?.max,
                  item.text_type
                )
              "
              :validate-on-submit="validateOnSubmit"
              @update:model="updateModel(item.name, item.type, $event)"
              :class="{
                'input-error': handleError(
                  item.name,
                  item.required,
                  item?.min,
                  item?.max,
                  item.text_type
                ),
              }"
              :bgColor="
                settings?.prize?.step_2?.[type]?.data?.button_and_text_color?.background
              "
              :textColor="
                settings?.prize?.step_2?.[type]?.data?.button_and_text_color?.color
              "
            />

            <p
              v-if="item.additional_notes"
              class="mt-2 font-normal text-exd-1320 text-exd-gray-scorpion"
            >
              {{ item.additional_notes }}
            </p>
          </div>

          <template
            v-if="
              item.name === 'postal_code' && item.prefecture_and_municipality
            "
          >
            <div
              class="inline-flex flex-col w-full gap-4 px-5 py-5 border-b border-b-exd-light-grey"
            >
              <InputText
                :model="form.prefecture"
                :required="item.required"
                :label="item.prefecture.label || $t('prefecture')"
                :placeholder="item.prefecture.placeholder || $t('prefecture')"
                disabled
                @update:model="
                  ($event) => {
                    updateModel('prefecture', $event)
                    checkPostalCode($event)
                  }
                "
                @validate="validateInput('prefecture', $event)"
                :validate-on-submit="validateOnSubmit"
                :error="
                  !form.prefecture && validateOnSubmit
                    ? $t('fieldRequired')
                    : ''
                "
                :class="{
                  'input-error': !form.prefecture && validateOnSubmit,
                }"
                :border="true"
                :bgColor="
                  settings?.prize?.step_2?.[type]?.data?.button_and_text_color?.background
                "
                :textColor="
                  settings?.prize?.step_2?.[type]?.data?.button_and_text_color?.color
                "
              />

              <InputText
                :model="form.municipality"
                disabled
                :required="item.required"
                :label="item.municipality.label || $t('municipality')"
                :placeholder="
                  item.municipality.placeholder || $t('municipality')
                "
                @update:model="
                  ($event) => {
                    updateModel('municipality', $event)
                    checkPostalCode($event)
                  }
                "
                @validate="validateInput('municipality', $event)"
                :validate-on-submit="validateOnSubmit"
                :error="
                  !form.municipality && validateOnSubmit
                    ? $t('fieldRequired')
                    : ''
                "
                :class="{
                  'input-error': !form.municipality && validateOnSubmit,
                }"
                :border="true"
                :bgColor="
                  settings?.prize?.step_2?.[type]?.data?.button_and_text_color?.background
                "
                :textColor="
                  settings?.prize?.step_2?.[type]?.data?.button_and_text_color?.color
                "
              />
            </div>
          </template>
        </div>
      </div>
    </div>
    <div class="mt-2" />
    <div class="fixed bottom-0 z-50 w-full max-w-md mx-auto mb-2">
      <SolidButton
        :label="isLoading ? 'Loading...' : settings?.prize?.step_2?.[type]?.data?.button_text"
        :has-loading="isLoading"
        :disabled="disableRedeem || isLoading"
        :bgColor="
          settings?.prize?.step_2?.[type]?.data?.button_and_text_color?.background
        "
        :textColor="
          settings?.prize?.step_2?.[type]?.data?.button_and_text_color?.color
        "
        :on-click="handleSubmit"
        has-bottom
      />
    </div>
  </div>

  <Dialog
    v-model:visible="insufficientDialogVisible"
    modal
    class="!max-w-sm border border-exd-gray-44 rounded-xl"
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
        class="absolute z-50 cursor-pointer right-1 top-1"
        @click="handleClose"
      />
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
            {{ $t('cannotClaim') }}
          </p>

          <SolidButton
            :on-click="() => navigateTo('/prize')"
            :has-loading="isLoading"
            :label="$t('returnToPrizeList')"
            :bgColor="
              redeemData?.button_and_text_color?.background
            "
            :textColor="
              redeemData?.button_and_text_color?.color
            "
            class="w-full"
          />
        </div>
      </div>
    </template>
  </Dialog>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useRouter } from 'vue-router'
import close from '~/assets/images/close.svg'
import { store } from '~/stores/dashboard.js'
import JapanPostalCode from 'japan-postal-code'
import Dropdown from '~/components/Dropdown.vue'
import InputText from '~/components/InputText.vue'
import InputTextArea from '~/components/InputTextArea.vue'
import RadioButton from '~/components/RadioButton.vue'
import InputMultipleSelect from '~/components/InputMultipleSelect.vue'

definePageMeta({
  middleware: 'auth',
  layout: 'default',
})

const type = ref('')
const map = ref(null)
const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const id = route.params.id
const hasModal = ref(true)
const errorScroll = ref([])
const isLoading = ref(true)
const isFetching = ref(false)
const errorMessages = ref([])
const config = useRuntimeConfig()
const disableRedeem = ref(false)
const LOCALE = useCookie('LOCALE')
const validateOnSubmit = ref(false)
const isLoadingPostalCode = ref(false)
const insufficientDialogVisible = ref(false)
const settings = useState('settings')

const handleToggleModal = () => {
  if (disableRedeem.value) return
  hasModal.value = !hasModal.value
}
const handleClose = () => (insufficientDialogVisible.value = false)

const handleGoToClaim = () => router.push(`/claim/${route.params.id}`)
const errorKeyPostCode = ref('')
const errorPostCodeMessage = computed(() => t(errorKeyPostCode.value))
const errorPhoneNumber = ref('')
const errorEmailMessage = ref('')
const errorPasswordMessage = ref('')

const form = ref({})
const redeemData = computed(() => settings.value?.prize?.step_2?.[type.value]?.data || {})

const getAutocomplete = (item) => {
  if (item.name === 'password') {
    return 'new-password'
  }
  return 'off'
}

const emailRegex = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

const redeemFields = ref([])

const visibleRedeemFields = computed(() =>
  redeemFields.value?.redeem_prize_form?.map((item) => {
      const name = Object.keys(item)[0]
      const fieldData = item[name]
      return {
        name,
        ...fieldData,
      }
    })
    .filter((field) => field.show)
)

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: config.public.TIME_ZONE,
  })
}

const optionsMap = (rawOptions) => {
  if (!rawOptions || typeof rawOptions !== 'object') return []

  return Object.entries(rawOptions)
    .filter(([value, label]) => !!value && !!label)
    .map(([value, label]) => ({
      label,
      value,
    }))
}

const updateModel = (field, type, value) => {
  form.value[field] = value

  if (type === 'date') {
    form.value[field] = formatDate(value)
  }

  if (field === 'password') {
    passwordValidate()
  }
}

const textOnlyRegex = /^[A-Za-z\s]+$/

const handleError = (field, required, min, max, type) => {
  const value = form.value[field] || ''

  if (!value && validateOnSubmit.value && required) {
    return t('fieldRequired')
  }

  if (min && value.length > 0 && value.length < min) {
    return t('minLength', { number: min })
  }

  if (max && value.length > max) {
    return t('maxLength', { number: max })
  }

  if (type === 'email') {
    if (value && !emailRegex(value)) {
      return t('emailFormat')
    } else if (errorEmailMessage.value) {
      return errorEmailMessage.value
    }
  }

  if (type === 'password') {
    if (!value) return ''

    if (value?.length < 8) {
      return t('passwordMin')
    }

    if (!alphanumericRegex.test(value)) {
      return t('validPassword')
    }
  }

  if (field === 'password_confirmation') {
    if (value && value !== form.value.password) {
      return t('passwordNotMatch')
    }
  }

  if (field === 'postal_code') {
    if (value?.length > 0 && value?.length < 7) {
      return t('minLengthPostalCode')
    } else if (errorPostCodeMessage.value) {
      return errorPostCodeMessage.value
    }
  }

  if (field === 'phone_number') {
    return errorPhoneNumber.value
  }

  if (type === 'number') {
    if (value && !/^\d+$/.test(value)) {
      return t('validNumber')
    }
  }

  if (type === 'text_only') {
    if (value && !textOnlyRegex.test(value)) {
      return t('textOnlyAllowed')
    }
  }

  return ''
}

const passwordValidate = () => {
  const password = form.value.password
  const alphanumericRegex = /^[a-zA-Z0-9]{8,}$/

  if (password?.length > 0 && password?.length < 8) {
    errorPasswordMessage.value = 'passwordMin'
  } else if (!alphanumericRegex.test(password)) {
    errorPasswordMessage.value = 'validPassword'
  } else {
    errorPasswordMessage.value = ''
  }
}

const validateForm = () => {
  const requiredFields = []
  let isValid = true

  if (!emailRegex(form.value.email)) {
    isValid = false
  } else {
    errorEmailMessage.value = ''
  }

  const firstErrorElement = document.querySelector('.input-error')

  if (!isValid && firstErrorElement) {
    firstErrorElement.style.paddingTop = '80px'
    firstErrorElement.style.marginTop = '-80px'

    firstErrorElement.scrollIntoView({ behavior: 'smooth' })

    setTimeout(() => {
      firstErrorElement.style.paddingTop = ''
      firstErrorElement.style.marginTop = ''
    }, 3000)

    return false
  }

  for (const field of requiredFields) {
    if (!form.value[field]) {
      console.log('Field must be filled:', field.value)
      return false
    }
  }

  return true
}

const fetchingPrizeData = async () => {
  try {
    const { data } = await useFetchApi('GET', 'prizes/' + id)
    sessionStorage.setItem('type', data.type)
    type.value = data.type

    redeemFields.value = redeemData.value || []
    
    checkPoint(data.point)
  } catch (error) {
    console.log(error)
  } finally {
    isFetching.value = false
    isLoading.value = false
  }
}

const checkPoint = (point) => {
  try {
    const currentPoint = parseInt(store.point)
    if (currentPoint < point) {
      disableRedeem.value = true
    }
  } catch (error) {}
}

const validateInput = (field, value) => {
  if (field === 'phoneNumber') {
    if (
      form.value.phoneNumber.length < 10 ||
      form.value.phoneNumber.length > 12
    ) {
      errorPhoneNumber.value = t('validPhoneNumber')
    } else {
      errorPhoneNumber.value = ''
    }
  }
}

const handleApiError = (error) => {
  errorScroll.value = []

  const response = error._data?.message || {}

  if (response) {
    const message = Object.keys(response).map((item) => {
      return Array.isArray(response[item]) && response[item]?.[0]
        ? response[item][0]
        : 'Unknown error'
    })

    errorScroll.value = message
    errorMessages.value.push(response)
    insufficientDialogVisible.value = true
  }
}

const fetchRedeem = async (payload) => {
  errorMessages.value = []
  isLoading.value = true

  try {
    const { status, data } = await useFetchApi('POST', 'prizes/redeem', {
      body: {
        prize_id: id,
        ...payload
      },
    })

    if (!status) {
      throw new Error(t('unexpectedResponse'))
    }

    localStorage.setItem('REDEEM_SUCCESS', 'true')
    
    localStorage.removeItem('redeemForm')

    navigateTo('/redeem/complete')

    localStorage.removeItem('redeemForm')
  } catch (error) {
    handleApiError(error)
  } finally {
    isLoading.value = false
  }
}

const buildPayload = () => {
  const payload = form.value

  for (const key in payload) {
    if (
      Array.isArray(payload[key]) &&
      payload[key].length > 0 &&
      typeof payload[key][0] === 'object' &&
      'value' in payload[key][0]
    ) {
      payload[key] = payload[key].map((item) => item.value)
    }
  }
  
  return payload
}

const handleSubmit = async () => {
  if (disableRedeem.value) return

  errorScroll.value = []

  isLoading.value = true

  validateOnSubmit.value = true

  const payload = buildPayload()

  await fetchRedeem(payload)

  if (errorScroll.value.length > 0) {
    await nextTick()
    const firstErrorElement = document.querySelector('.input-error')
    if (firstErrorElement) {
      firstErrorElement.style.paddingTop = '80px'
      firstErrorElement.style.marginTop = '-80px'

      firstErrorElement.scrollIntoView({ behavior: 'smooth' })

      setTimeout(() => {
        firstErrorElement.style.paddingTop = ''
        firstErrorElement.style.marginTop = ''
      }, 3000)
    }
  }
}

let postCodeBounds

const checkPostalCode = async (code) => {
  if (!code || code.length < 7) {
    form.value.prefecture = ''
    form.value.municipality = ''
    if (code && code.length > 0 && code.length < 7) {
      errorKeyPostCode.value = 'minLengthPostalCode'
    } else {
      errorKeyPostCode.value = ''
    }
    return
  }

  isLoadingPostalCode.value = true

  if (postCodeBounds) {
    clearTimeout(postCodeBounds)
  }

  try {
    const address = await new Promise((resolve, reject) => {
      postCodeBounds = setTimeout(() => {
        reject(new Error('Request timeout: Postal code not found'))
      }, 2000)

      JapanPostalCode.get(code, function (address) {
        clearTimeout(postCodeBounds)

        if (!address || !address.prefecture || !address.city || !address.area) {
          errorKeyPostCode.value = 'postalCodeNotFound'
          reject(new Error('Invalid postal code or incomplete address data'))
        } else {
          resolve(address)
        }
      })
    })

    form.value.prefecture = address.prefecture
    form.value.municipality = `${address.city}, ${address.area}`
    errorKeyPostCode.value = ''
  } catch (error) {
    console.error('Postal code error:', error)
    form.value.prefecture = ''
    form.value.municipality = ''

    if (error.message.includes('timeout')) {
      errorKeyPostCode.value = 'postalCodeNotFound'
    }
  } finally {
    isLoadingPostalCode.value = false
  }
}

onMounted(async () => {
  await store.fetchingDashboardData()
  await fetchingPrizeData()
})

onMounted(() => {
  if (import.meta.client) {
    const savedForm = localStorage.getItem('redeemForm')
    if (savedForm) {
      const parsed = JSON.parse(savedForm)
      form.value = { ...parsed, ...form.value }
    }
  }
})

watch(
  form,
  (newVal) => {
    const current = JSON.parse(localStorage.getItem('redeemForm') || '{}')
    localStorage.setItem(
      'redeemForm',
      JSON.stringify({ ...current, ...newVal })
    )
  },
  { deep: true }
)
</script>

<style scoped>
::v-deep(.p-checkbox-box) {
  @apply !bg-white !size-5 !border !border-exd-gray-44 !rounded-none;
}

::v-deep(.p-checkbox-checked .p-checkbox-icon) {
  @apply !text-black;
}

.opacity-50 {
  opacity: 0.5;
  pointer-events: none;
}

.scrollable-content::-webkit-scrollbar {
  display: block !important;
  width: 7px !important;
}

.scrollable-content::-webkit-scrollbar-track {
  display: block !important;
  margin-block: 10px;
  background: #f1f1f1 !important;
  border-radius: 10px !important;
}

.scrollable-content::-webkit-scrollbar-thumb {
  display: block !important;
  height: 30px !important;
  background: #d7a237 !important;
  border-radius: 10px !important;
}

.scrollable-content::-webkit-scrollbar-thumb:hover {
  display: block !important;
  background: #555 !important;
}

.triangle {
  width: 0;
  height: 0;
  border-left: 7px solid transparent;
  border-right: 7px solid transparent;
  border-top: 15px solid #d44d20;
}

.highlight {
  color: #d44d20;
}

.font-event {
  font-size: 14px;
}

.font-style {
  font-size: 20px;
}
</style>
