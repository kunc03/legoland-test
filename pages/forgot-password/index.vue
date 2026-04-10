<template>
  <div class="flex flex-col h-full overflow-hidden grow">
    <HeaderBar :hasBack="!isSuccessSendLinkResetPassword">
      <p
        style="text-shadow: 0 3px 3px rgba(0, 0, 0, 0.16)"
        class="text-exd-gray-scorpion font-bold text-exd-1824.52"
      >
        {{ settings?.forgot_password?.[steps]?.page_title }}
      </p>
    </HeaderBar>

    <div
      class="flex flex-col justify-between w-full gap-6 px-8 pt-32 pb-20 overflow-auto grow !bg-no-repeat !bg-cover !bg-center"
      :style="{
        background:
          settings?.forgot_password?.[steps]?.background.type === 'image'
            ? `url(${settings?.forgot_password?.[steps]?.background.value})`
            : settings?.forgot_password?.[steps]?.background.value,
      }"
    >
      <template v-if="isSuccessSendLinkResetPassword">
        <div class="flex flex-col items-center gap-6 grow">
          <h1 class="font-bold text-exd-1424 text-exd-gray-scorpion">
            {{ settings?.forgot_password?.step_2?.page_description }}
          </h1>
          <p class="font-medium text-exd-1424 text-exd-gray-scorpion">
            {{ settings?.forgot_password?.step_2?.field_title }}
          </p>
        </div>
      </template>
      <template v-else>
        <div class="flex flex-col gap-6 grow">
          <p class="font-medium text-exd-1424 text-exd-gray-scorpion">
            {{ settings?.forgot_password?.[steps]?.page_description }}
          </p>
          <InputText
            type="email"
            :model="form.email"
            :label="settings?.forgot_password?.[steps]?.field_title"
            :error="emailError"
            @update:model="updateModel('email', $event)"
            @validate="validateInput('email', $event)"
          />
          <ul>
            <li
              class="font-medium text-exd-1220 text-exd-gray-scorpion"
              v-html="note"
            />
          </ul>
          <div>
            <p>{{ message }}</p>
          </div>
        </div>
      </template>
    </div>
    <div class="fixed bottom-0 w-full max-w-md px-8 mx-auto mb-3">
      <SolidButton
        :label="settings?.forgot_password?.[steps]?.button_text"
        :has-loading="isLoading"
        :on-click="handleSubmit"
        :bgColor="
          settings?.forgot_password?.[steps]?.button_and_text_color?.background
        "
        :textColor="
          settings?.forgot_password?.[steps]?.button_and_text_color?.color
        "
        has-bottom
        :disabled="emailError !== '' || isLoading"
      />
    </div>
  </div>
</template>

<script setup>
import InputText from '~/components/InputText.vue'
import { useI18n } from 'vue-i18n'

const route = useRoute()

const note = ref('')
const { t } = useI18n()
const steps = ref('step_1')
const LOCALE = useCookie('LOCALE')
const settings = useState('settings')

const form = ref({
  email: '',
})

const message = ref(null)
const emailError = ref('')
const isLoading = ref(false)
const isSuccessSendLinkResetPassword = ref(false)
const updateModel = (field, value) => {
  form.value[field] = value
}

const validateEmail = (value) => {
  if (!value) {
    return t('fieldRequired')
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return t('emailFormat')
  }
  return ''
}
const validateInput = (field, value) => {
  if (field === 'email') {
    emailError.value = validateEmail(value)
  }
}

const handleSubmit = async () => {
  const validate = validateEmail(form.value.email)
  if (emailError.value || validate) {
    if (validate) emailError.value = validate
    return
  }

  if (isSuccessSendLinkResetPassword.value) {
    steps.value === 'step_2'
    navigateTo('/')
  } else {
    let payload = {
      email: form.value.email,
    }

    try {
      isLoading.value = true
      const authService = useAuthService()
      const { status } = await authService.forgotPassword(payload.email)

      if (status) {
        navigateTo({
          path: '/forgot-password',
          query: { email_sent: 'success' },
        })
      }
    } catch (error) {
      emailError.value = error._data.message
    } finally {
      isLoading.value = false
    }
  }
}

const getNotes = async () => {
  try {
    note.value =
      settings.value?.forgot_password?.step_1?.notes?.[LOCALE.value] || ''
  } catch (error) {
    console.error("Error: Can't get notes", error)
    note.value = ''
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
})

watchEffect(() => {
  if (route.query.email_sent) {
    steps.value = 'step_2'
    isSuccessSendLinkResetPassword.value = true
  }
})

const handleKeydown = (event) => {
  if (event.key === 'Enter') {
    handleSubmit()
  }
}


onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
})

onMounted(() => {
  getNotes()
})
</script>
