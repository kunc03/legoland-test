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
        class="absolute z-50 cursor-pointer right-1 top-1"
        @click="$emit('update:modelValue', false)"
      />
      <div
        class="relative flex flex-col items-center justify-center w-full gap-4 px-4 py-6"
      >
        <div
          class="font-bold text-center text-exd-1424"
          :style="{
            color: settings?.global?.modal?.text_color,
          }"
        >
          <p style="text-shadow: 0 3px 3px rgba(0, 0, 0, 0.16)">
            {{ settings?.register_login?.registration_login_pop_up_title }}
          </p>
        </div>

        <div v-if="login_options.includes('other_sign_in_options')" class="w-full p-0 mb-2">
          <div
            v-for="(item, index) in visibleLoginFields"
            :key="index"
            class="!w-full"
          >
            <InputText
              v-if="item.type !== 'date'"
              :onlyNumeric="
                item.text_type === 'number' || item.text_type === 'tel'
                  ? true
                  : false
              "
              :type="item.text_type"
              :model="form[item.name]"
              :placeholder="item.placeholder"
              @update:model="updateModel(item.name, item.type, $event)"
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
            />

            <InputDate
              v-if="item.type === 'date'"
              :placeholder="item.placeholder"
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
            />
          </div>
        </div>

        <a
          v-if="login_options.includes('other_sign_in_options')"
          class="font-medium underline cursor-pointer text-exd-1220"
          :style="{
            color: settings?.global?.modal?.text_color,
          }"
          style="text-shadow: 0 3px 3px rgba(0, 0, 0, 0.16)"
          @click="navigateTo('/forgot-password')"
        >
          {{
            settings?.register_login?.registration_login_pop_up
              ?.forgot_password_text || ''
          }}
        </a>

        <SolidButton
          v-for="(btnSet, index) in filteredLoginBtn"
          :key="index"
          :label="btnSet.setting_button_text"
          :bgColor="
            btnSet.bgColor || btnSet?.setting_button_text_color?.background
          "
          :textColor="
            btnSet.textColor || btnSet?.setting_button_text_color?.color
          "
          :onClick="() => handleAction(btnSet.setting_button_list)"
          :disabled="btnSet.setting_button_list === 'login_button' && !isValidInput || isLoading"
          :has-loading="isLoading"
        />
      </div>
    </template>
  </Dialog>

  <Dialog
    v-model:visible="isErrorMessage"
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
        class="absolute z-50 cursor-pointer right-1 top-1"
        @click="isErrorMessage = false"
      />
      <div class="flex flex-col items-center justify-center w-full gap-4 py-6">
        <IconsWarning
          class="w-10 h-10"
          :style="{ color: settings?.global?.icon_color?.background }"
        />

        <div v-if="errorStatus === 'not_verified'" class="w-10/12 text-center">
          <p
            class="font-bold text-exd-1424"
            :style="{
              color: settings?.global?.modal?.text_color,
            }"
          >
            {{ t('notVerified') }}
          </p>
        </div>

        <div
          v-else-if="errorStatus === 'not_registered'"
          class="w-10/12 text-center"
        >
          <p
            class="font-bold text-exd-1424"
            :style="{
              color: settings?.global?.modal?.text_color,
            }"
          >
            {{ t('notRegistered') }}
          </p>
        </div>

        <div v-else class="w-10/12 text-center">
          <p
            v-for="(item, index) in errorMessages"
            class="font-bold text-exd-1424"
            :style="{
              color: settings?.global?.modal?.text_color,
            }"
            :key="index"
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
import InputText from '~/components/InputText.vue'
import InputDate from '~/components/InputDate.vue'
import useRegister from '~/composables/useRegister'

const register = useRegister()
const { isSpin } = storeToRefs(register)
const settings = useState('settings')
const loginType =
  settings.value?.register_login?.registration_login_pop_up?.login_options

const { t } = useI18n()

const props = defineProps({
  modelValue: Boolean,
  email: {
    type: String,
    default: null,
  },
})

const emits = defineEmits(['update:modelValue', 'callback'])

const isLoading = ref(false)
const config = useRuntimeConfig()

const isErrorMessage = ref(false)
const errorStatus = ref(null)
const errorMessages = ref([])
const route = useRoute()
const { encryptData, decryptData } = useEncryption()
const validateOnSubmit = ref(false)

const form = ref({})
const loginFields = ref([])
const isFormReady = ref(false)

const visibleLoginFields = ref([])

const isValidInput = computed(() => {
  return Object.values(form.value).every(
    (val) => val && val.toString().trim() !== ''
  )
})

const handleError = (field, required, min, max, type) => {
  const value = form.value[field] || ''
  let errorMessage = ''

  if (!value && validateOnSubmit.value && required) {
    errorMessage = t('fieldRequired')
  } else if (min && value.length > 0 && value.length < min) {
    errorMessage = t('minLength', { number: min })
  } else if (max && value.length > max) {
    errorMessage = t('maxLength', { number: max })
  } else if (type === 'number' && value && !/^\d+$/.test(value)) {
    errorMessage = t('validNumber')
  } else if (type === 'text_only' && value && !textOnlyRegex.test(value)) {
    errorMessage = t('textOnlyAllowed')
  }

  return errorMessage
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: config.public.TIME_ZONE,
  })
}

const updateModel = (field, type, value) => {
  form.value[field] = value

  if (type === 'date') {
    form.value[field] = formatDate(value)
  }
}

const validateInput = (field, value) => {
  // console.log(`Validated ${field}:`, value)
}

const handleToRegister = () => {
  navigateTo('/register')
}

const validateEmailFormat = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}

const updateSpinStatus = async () => {
  const storedData = useCookie('VALID_PASSWORD')
  const payload = decryptData(storedData.value || '{}')
  const { data } = await useFetchApi('POST', 'gacha/spin', { body: payload })

  const newStatus = data.is_already_spin

  return new Promise((resolve) => {
    const currentStatus = sessionStorage.getItem('IS_ALREADY_SPIN')
    if (currentStatus !== newStatus.toString()) {
      sessionStorage.setItem('IS_ALREADY_SPIN', newStatus.toString())
      isAlreadySpin.value = newStatus
    }
    setTimeout(() => {
      resolve()
    }, 0)
  })
}

const handleSubmit = async () => {
  const location = route.params.randomCode

  if (isLoading.value) return
  isLoading.value = true

  if (form.value.email && !validateEmailFormat(form.value.email)) {
    errorMessages.value = [t('emailValidation')]
    isErrorMessage.value = true
    isLoading.value = false
    return
  }

  try {
    const response = await useFetchApi('POST', 'login', {
      body: { ...form.value },
    })

    const TOKEN = useCookie('TOKEN', { maxAge: 60 * 60 * 24 * 7 })
    const USER = useCookie('USER', { maxAge: 60 * 60 * 24 * 7 })
    TOKEN.value = response.data.token
    USER.value = response.data.user

    await nextTick()

    await saveSpin()

    await navigateTo('/dashboard', { replace: true })
  } catch (error) {
    errorStatus.value = error._data?.data?.type

    errorMessages.value = [
      settings.value?.register_login?.registration_login_pop_up?.warning_text ||
        t('loginFailed'),
    ]

    isErrorMessage.value = true
  } finally {
    isLoading.value = false
  }
}

const handleLoginLine = async () => {
    const response = await useFetchApi('GET', `login/line/redirect?env=${config.public.NODE_ENV}`)

    if (response?.data?.authorization_url) { 
      const loginUrl = response?.data?.authorization_url
      window.location.href = loginUrl
    }
    

}

const processLoginLine = async () => {
  try {
    const response = await useFetchApi('POST', 'login/line/token', {
      body: { 
        code: route.query.code,
        state: route.query.state,
        env: config.public.NODE_ENV
       },
    })

    const TOKEN = useCookie('TOKEN', { maxAge: 60 * 60 * 24 * 7 })
    const USER = useCookie('USER', { maxAge: 60 * 60 * 24 * 7 })
    TOKEN.value = response.data.code
    USER.value = response.data.user

    await nextTick()

    await saveSpin()

    await navigateTo('/dashboard', { replace: true })
  } catch (error) {
    errorStatus.value = error._data?.data?.type
    console.log('error', error)

    errorMessages.value = [ error?._data?.message ||
      settings.value?.register_login?.registration_login_pop_up?.warning_text ||
        "Can't login",
    ]

    isErrorMessage.value = true
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
    const { data } = await useFetchApi('POST', 'gacha/save', {
      body: {
        point_id: slugStorage?.point_id,
        location_id: slugStorage?.location_id,
        character_id: slugStorage?.character_id,
        log_id: slugStorage?.log_id,
        gift_image: slugStorage?.gift_image,
        gift_name: slugStorage?.voucher_name,
        gift_type: slugStorage?.gift_type,
      },
    })

    storedData.value = null
    localStorage.removeItem(slugStorageName)

    sessionStorage.setItem('IS_ALREADY_SPIN', data.is_already_spin)
    sessionStorage.setItem(
      'READY_SPIN_AFTER_DATE',
      data?.ready_spin_after_date || ''
    )
    sessionStorage.setItem('IS_QUOTA_AVAILABLE', data?.is_quota_available)
    sessionStorage.setItem('LOCATION_SLUG', data?.location_slug)
  } catch (error) {
    throw error
  }
}

const toVisibleLoginFields = (fields = []) =>
  fields
    .map((item) => {
      const name = Object.keys(item)[0]
      const fieldData = item[name]
      return { name, ...fieldData }
    })
    .filter((field) => field.show)

const safeDecrypt = (cipher) => {
  if (!cipher) return ''
  try {
    return decryptData(cipher)
  } catch {
    return ''
  }
}

const initForm = () => {
  const savedForm = JSON.parse(localStorage.getItem('loginForm') || '{}')
  const emailSession = sessionStorage.getItem('EMAIL') || ''
  const passwordCipher = sessionStorage.getItem('PASSWORD') || ''

  const newForm = {}
  visibleLoginFields.value.forEach((f) => {
    if (f.name === 'email') {
      newForm.email = savedForm.email || emailSession || ''
    } else if (f.name === 'password') {
      const fromLocal = savedForm.password
        ? safeDecrypt(savedForm.password)
        : ''
      const fromSession = safeDecrypt(passwordCipher)
      newForm.password = fromLocal || fromSession || ''
    } else {
      newForm[f.name] = savedForm[f.name] ?? ''
    }
  })

  form.value = newForm
  isFormReady.value = true
}

const filteredLoginBtn = ref([])
const popup = settings.value?.register_login?.registration_login_pop_up

const { login_options = [], setting_buttons = [] } = popup
const isSocialMedia = login_options.includes('social_media')

const handleLoginBtn = () => {
  if (!popup) return

  if (login_options.length > 1) {
    filteredLoginBtn.value = setting_buttons
    return
  }

  filteredLoginBtn.value = setting_buttons.filter((btn) => {
    const isLine = btn.setting_button_list?.includes('line')
    return isSocialMedia ? isLine : !isLine
  })
}

const handleAction = (action) => {
  switch (action) {
    case 'login_button':
      handleSubmit()
      break
    case 'register_button':
      handleToRegister()
      break
    case 'login_line_button':
      handleLoginLine()
      break
  }
}

const handleKeydown = (event) => {
  if (event.key !== 'Enter') return

  event.preventDefault()
  event.stopPropagation()

  if (
    props.modelValue === true &&
    isValidInput.value &&
    !isLoading.value &&
    !isErrorMessage.value
  ) {
    handleSubmit()
  }
}

onMounted(() => {
  handleLoginBtn()
  window.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
})

watchEffect(() => {
  if (route.query?.code) {
    processLoginLine()
  }
})

watch(
  () => settings.value?.register_login?.registration_login_pop_up?.login_fields,
  (fields) => {
    loginFields.value = fields || []
    visibleLoginFields.value = toVisibleLoginFields(loginFields.value)

    if (
      import.meta.client &&
      visibleLoginFields.value.length &&
      !isFormReady.value
    ) {
      initForm()
    }
  },
  { immediate: true, deep: true }
)

watch(
  form,
  (newVal) => {
    if (!import.meta.client || !isFormReady.value) return

    const allEmpty = Object.values(newVal).every((v) => !v)
    if (allEmpty) return

    const current = JSON.parse(localStorage.getItem('loginForm') || '{}')
    const toSave = { ...current, ...newVal }

    if (toSave.password) {
      try {
        toSave.password = encryptData(toSave.password)
      } catch (e) {
        console.error('Password encryption failed', e)
      }
    }

    localStorage.setItem('loginForm', JSON.stringify(toSave))
  },
  { deep: true }
)

watch(
  () => props.email,
  (newEmail) => {
    if (newEmail) {
      form.value.email = newEmail
    }
  },
  { immediate: true }
)
</script>