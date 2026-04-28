<template>
  <div class="flex flex-col grow">
    <HeaderBar hasBack>
      <p
        style="text-shadow: 0 3px 3px rgba(0, 0, 0, 0.16)"
        class="text-exd-gray-scorpion text-exd-1824.52"
      >
        {{ settings?.register_login?.membership_registration_page?.page_title }}
      </p>
    </HeaderBar>

    <div
      class="flex flex-col justify-between w-full gap-6 pt-32 pb-3 grow"
      :style="{
        background:
          settings?.register_login?.membership_registration_page
            ?.background_page?.type === 'image'
            ? `url(${settings?.register_login?.membership_registration_page?.background_page?.value})`
            : settings?.register_login?.membership_registration_page
                ?.background_page?.value,
        'background-size': 'cover',
        'background-repeat': 'no-repeat',
      }"
    >
     <div class="flex flex-col px-3 grow">
        <div
          v-for="(item, index) in visibleRegisterFields"
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
                handleError(item.name, item.required, item?.min, item?.max, item.text_type)
              "
              hasHelper
              :class="{
                'input-error': handleError(item.name, item.required, item?.min, item?.max, item.text_type),
              }"
              :w230Px="
                item.name === 'phone_number' || item.name === 'postal_code'
                  ? true
                  : false
              "
              :border="true"
              :bgColor="
                settings?.register_login?.membership_registration_page
                  ?.button_text_and_color?.background
              "
              :textColor="
                settings?.register_login?.membership_registration_page
                  ?.button_text_and_color?.color
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
                settings?.register_login?.membership_registration_page
                  ?.button_text_and_color?.background
              "
              :text-color="
                settings?.register_login?.membership_registration_page
                  ?.button_text_and_color?.color
              "
            />

            <InputDate
              v-if="item.type === 'date'"
              :label="item.label"
              :placeholder="item.placeholder"
              :required="item.required"
              v-model:model="form[item.name]"
              :error="handleError(item.name, item.required, item?.min, item?.max, item.text_type)"
              @update:model="updateModel(item.name, item.type, $event)"
              :manualInput="false"
              :class="{
                'input-error': handleError(item.name, item.required, item?.min, item?.max, item.text_type),
              }"
              :bgColor="
                settings?.register_login?.membership_registration_page
                  ?.button_text_and_color?.background
              "
              :textColor="
                settings?.register_login?.membership_registration_page
                  ?.button_text_and_color?.color
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
                handleError(item.name, item.required, item?.min, item?.max, item.text_type)
              "
              :validate-on-submit="validateOnSubmit"
              :class="{
                'input-error': handleError(item.name, item.required, item?.min, item?.max, item.text_type),
              }"
              :bgColor="
                settings?.register_login?.membership_registration_page
                  ?.button_text_and_color?.background
              "
              :textColor="
                settings?.register_login?.membership_registration_page
                  ?.button_text_and_color?.color
              "
            />

            <RadioButton
              v-if="item?.type === 'radio'"
              :label="item.label || ''"
              v-model="form[item.name]"
              @update:modelValue="updateModel(item.name, item.type, $event)"
              :options="optionsMap(item.options)"
              :error="handleError(item.name, item.required, item?.min, item?.max, item.text_type)"
              :class="{
                'input-error': handleError(item.name, item.required, item?.min, item?.max, item.text_type),
              }"
              :bgColor="
                settings?.register_login?.membership_registration_page
                  ?.button_text_and_color?.background
              "
              :textColor="
                settings?.register_login?.membership_registration_page
                  ?.button_text_and_color?.color
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
              :error="handleError(item.name, item.required, item?.min, item?.max, item.text_type)"
              :class="{
                'input-error': handleError(item.name, item.required, item?.min, item?.max, item.text_type),
              }"
              :bgColor="
                settings?.register_login?.membership_registration_page
                  ?.button_text_and_color?.background
              "
              :textColor="
                settings?.register_login?.membership_registration_page
                  ?.button_text_and_color?.color
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
              :error="handleError(item.name, item.required, item?.min, item?.max, item.text_type)"
              :validate-on-submit="validateOnSubmit"
              @update:model="updateModel(item.name, item.type, $event)"
              :class="{
                'input-error': handleError(item.name, item.required, item?.min, item?.max, item.text_type),
              }"
              :bgColor="
                settings?.register_login?.membership_registration_page
                  ?.button_text_and_color?.background
              "
              :textColor="
                settings?.register_login?.membership_registration_page
                  ?.button_text_and_color?.color
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
                  settings?.register_login?.membership_registration_page
                    ?.button_text_and_color?.background
                "
                :textColor="
                  settings?.register_login?.membership_registration_page
                    ?.button_text_and_color?.color
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
                  settings?.register_login?.membership_registration_page
                    ?.button_text_and_color?.background
                "
                :textColor="
                  settings?.register_login?.membership_registration_page
                    ?.button_text_and_color?.color
                "
              />
            </div>
          </template>
        </div>

        <div class="inline-flex items-center justify-center w-full gap-2 mt-7">
          <Checkbox v-model="form.checked" :binary="true" />
          <p class="font-bold text-exd-gray-scorpion text-exd-1424">
            {{ $t('acceptTerm') }}
          </p>
        </div>
        <div
          class="w-full mt-5 border border-exd-gray-44 rounded-xl bg-white h-[98px] max-w-xs mx-auto text-exd-gray-scorpion pr-2"
          style="box-shadow: 0px 3px 3px 0px rgba(0, 0, 0, 0.1608)"
        >
          <div
            class="max-h-[85px] mt-[5.5px] scrollable-content overflow-y-auto pl-6 pr-4"
          >
            <p class="font-bold text-center text-exd-1424">
              {{ $t('termOfService') }}
            </p>

            <div
              class="text-exd-1220 font-medium leading-relaxed h-[84px] flex flex-col gap-1"
            >
              <p class="flex flex-col gap-1 text-justify" v-html="terms" />
            </div>
          </div>
        </div>
      </div>
      <div class="mt-16" />
      <div class="fixed bottom-0 z-50 w-full max-w-md mx-auto mb-2">
        <SolidButton
          :label="
            settings?.register_login?.membership_registration_page?.button_text
          "
          :has-loading="isLoading"
          :bgColor="
            settings?.register_login?.membership_registration_page
              ?.button_text_and_color.background
          "
          :textColor="
            settings?.register_login?.membership_registration_page
              ?.button_text_and_color.color
          "
          :disabled="!form.checked || isLoading"
          :on-click="handleSubmit"
          has-bottom
        />
        <!-- class="!-inset-x-1/4 !-translate-x-3" -->
      </div>
    </div>
  </div>

  <Dialog
    v-model:visible="isErrorMessage"
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
        class="absolute z-50 cursor-pointer right-1 top-1"
        @click="handleCloseDialog"
      />
      <div class="flex flex-col items-center justify-center w-full gap-4 py-6">
        <IconsWarning
          class="w-10 h-10"
          :style="{ color: settings?.global?.icon_color?.background }"
        />
        <div class="w-10/12 text-center">
          <p
            v-for="(item, index) in errorScroll"
            :key="index"
            class="font-bold text-exd-1424"
            :style="{
              color: settings?.global?.modal?.text_color,
            }"
          >
            {{ item }}
          </p>
        </div>
      </div>
    </template>
  </Dialog>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import close from '~/assets/images/close.svg'
import JapanPostalCode from 'japan-postal-code'
import Dropdown from '~/components/Dropdown.vue'
import InputText from '~/components/InputText.vue'
import InputTextArea from '~/components/InputTextArea.vue'
import RadioButton from '~/components/RadioButton.vue'
import InputMultipleSelect from '~/components/InputMultipleSelect.vue'

const config = useRuntimeConfig()

const form = ref({
  checked: false,
})
const { t } = useI18n()
const userId = ref(null)
const errorScroll = ref([])
const isLoading = ref(false)
const errorMessages = ref([])
const errorAgeMessage = ref('')
const emailErrorKey = ref('')
const errorEmailMessage = computed(
  () => emailErrorKey.value && t(emailErrorKey.value)
)
const isErrorMessage = ref(false)
const validateOnSubmit = ref(false)
const errorNicknameMessage = ref('')
const errorPasswordMessage = ref('')
const errorConfPasswordMessage = ref('')
const register = useRegister()
const { isSpin } = storeToRefs(register)
const { decryptData, encryptData } = useEncryption()

const authService = useAuthService()
const gachaService = useGachaService()

const errorPhoneNumber = ref('')
const errorKeyPostCode = ref('')
const errorPostCodeMessage = computed(
  () => errorKeyPostCode.value && t(errorKeyPostCode.value)
)

const settings = useState('settings')
const LOCALE = useCookie('LOCALE')

const terms = ref('')
const alphanumericRegex = /^[a-zA-Z0-9]{8,}$/

const registerFields = settings.value?.register_login?.register_fields || []

const visibleRegisterFields = computed(() =>
  registerFields
    .map((item) => {
      const name = Object.keys(item)[0]
      const fieldData = item[name]
      return {
        name,
        ...fieldData,
      }
    })
    .filter((field) => field.show)
)

const getTerms = async () => {
  try {
    terms.value = settings.value?.global?.terms?.[LOCALE.value] || ''
  } catch (error) {
    console.error("Error: Can't get terms", error)
    terms.value = ''
  }
}

const handleCloseDialog = () => (isErrorMessage.value = false)

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

  if (field === 'nickname') {
      return errorNicknameMessage.value
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

const validateInput = (field, value) => {}

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

const fetchRegister = async (payload) => {
  errorMessages.value = []
  emailErrorKey.value = ''

  isLoading.value = true

  try {
    const { data, status } = await authService.register(payload)

    if (!data || !data.user?.id) {
      throw new Error(t('unexpectedResponse'))
    }

    if (validateForm() && status) {
      localStorage.setItem('USER_ID', data.user.id)
      await saveSpin()

      sessionStorage.setItem('EMAIL', payload.email)
      sessionStorage.setItem('PASSWORD', encryptData(payload.password))

      localStorage.setItem('REGISTER_SUBMITTED', 'true')
      localStorage.setItem('NEED_CONFIRMATION', data.need_confirmation)

      localStorage.setItem('NEED_CONFIRMATION', data?.need_confirmation)

      localStorage.removeItem('registerForm')

      const registerComplete = settings.value?.register_login?.membership_registration_page_2
      if (isCompletePageEmpty(registerComplete)) {
        await saveSpinTemp()
        const needConfirm = localStorage.getItem('NEED_CONFIRMATION')
        if (needConfirm === 'false') {
          navigateTo('/#registration-complete')
        } else {
          navigateTo('/')
        }
        localStorage.removeItem('REGISTER_SUBMITTED')
      } else {
        navigateTo('/register/complete')
      }
      isLoading.value = false
    }
  } catch (error) {
    handleApiError(error)
    isLoading.value = false
  }
}

const emailRegex = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

const handleApiError = (error) => {
  errorScroll.value = []

  const response = error?._data?.errors || {}

  if (Object.keys(response).length) {
    const message = Object.keys(response).map((item) => {
      return Array.isArray(response[item]) && response[item]?.[0]
        ? response[item][0]
        : 'Unknown error'
    })
    errorScroll.value = message
    errorMessages.value.push(response)
  }

  errorNicknameMessage.value = Array.isArray(response?.nickname)
    ? response.nickname[0]
    : ''

  errorAgeMessage.value = Array.isArray(response?.age) ? response.age[0] : ''

  errorPhoneNumber.value = Array.isArray(response?.phone_number)
    ? t('phoneNumberInUse')
    : ''

  if (response.email) {
    if (
      response.email?.[0] === 'emailはすでに使用されています。' ||
      response.email?.[0] === 'The email has already been taken.'
    ) {
      emailErrorKey.value = 'emailIsAlreadyRegistered'
    }
  }
}

const isCompletePageEmpty = (config) => {
  if (!config) return true
  const fieldsToCheck = [
    'page_title',
    'page_sub_title',
    'page_description',
    'button_text',
    'background_page',
    'button_text_and_color',
  ]
  return fieldsToCheck.every((field) => {
    const val = config[field]
    if (val === null || val === undefined || val === '') return true
    if (typeof val === 'object') {
      const keys = Object.keys(val)
      if (keys.length === 0) return true
      return keys.every((k) => !val[k])
    }
    return false
  })
}

const saveSpinTemp = async () => {
  if (!isSpin.value) return
  const storedData = useCookie('VALID_PASSWORD')
  const parseData = decryptData(storedData.value)
  const slug = parseData?.slug?.toUpperCase()
  const slugStorageName = `${slug}_GACHA`
  const slugStorage = decryptData(localStorage.getItem(slugStorageName))
  try {
    await gachaService.saveTempData({
      point_id: slugStorage?.point_id,
      location_id: slugStorage?.location_id,
      temporary_user_id: localStorage.getItem('USER_ID'),
      character_id: slugStorage?.character_id,
      log_id: slugStorage?.log_id,
    })
  } catch (error) {
    console.log("Error: Can't save spin result")
  }
}

const handleSubmit = async () => {
  if (!validateForm()) return

  errorScroll.value = []

  validateOnSubmit.value = true

  const { checked, ...payload } = form.value

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

  await fetchRegister(payload)

  if (errorScroll.value.length > 0) {
    await nextTick()
    const firstErrorElement = document.querySelector('.input-error')
    if (firstErrorElement) {
      firstErrorElement.style.paddingTop = '115px'
      firstErrorElement.style.marginTop = '-115px'

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
    form.value.city = ''
    if (code && code.length > 0 && code.length < 7) {
      errorKeyPostCode.value = 'minLengthPostalCode'
    } else {
      errorKeyPostCode.value = ''
    }
    return
  }

  isLoading.value = true

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
    form.value.city = address.city
    form.value.area = address.area
    form.value.municipality = `${address.city}, ${address.area}`
    errorKeyPostCode.value = ''
  } catch (error) {
    console.error('Postal code error:', error)

    form.value.prefecture = ''
    form.value.city = ''

    if (error.message.includes('timeout')) {
      errorKeyPostCode.value = 'postalCodeNotFound'
    }
  } finally {
    isLoading.value = false
  }
}

const saveSpin = async () => {
  if (!isSpin.value) return
  const storedData = useCookie('VALID_PASSWORD')

  const parseData = decryptData(storedData.value)
  const slug = parseData?.slug?.toUpperCase()
  const slugStorageName = `${slug}_GACHA`
  const slugStorage = decryptData(localStorage.getItem(slugStorageName))
  try {
    const { data } = await gachaService.saveRegisteredData({
      point_id: slugStorage?.point_id,
      location_id: slugStorage?.location_id,
      user_id: localStorage.getItem('USER_ID'),
      character_id: slugStorage?.character_id,
      log_id: slugStorage?.log_id,
    })

    storedData.value = null
    localStorage.removeItem(slugStorageName)

    sessionStorage.setItem('IS_QUOTA_AVAILABLE', data?.is_quota_available)
    sessionStorage.setItem('LOCATION_SLUG', data?.location_slug)
  } catch (error) {
    console.log("Error: Can't save spin result")
  }
}

const getAutocomplete = (item) => {
  if (item.name === 'password') {
    return 'new-password'
  }
  return 'off'
}

const handleKeydown = (event) => {
  if (event.key === 'Enter') {
    if (!isLoading.value && form.value.checked && !isErrorMessage.value) {
      handleSubmit()
    }
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
})

onMounted(() => {
  if (import.meta.client) {
    const savedForm = localStorage.getItem('registerForm')
    if (savedForm) {
      const parsed = JSON.parse(savedForm)
      form.value = { ...parsed, ...form.value }
    }
    getTerms()
  }
})

watch(
  form,
  (newVal) => {
    const current = JSON.parse(localStorage.getItem('registerForm') || '{}')
    localStorage.setItem(
      'registerForm',
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
  background: #9a9a9a !important;
  border-radius: 10px !important;
}

.scrollable-content::-webkit-scrollbar-thumb:hover {
  display: block !important;
  background: #555 !important;
}
</style>