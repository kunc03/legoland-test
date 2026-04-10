<template>
  <div class="flex flex-col grow">
    <HeaderBar>
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
      <template v-if="!isSuccessSendResetPassword">
        <div>
          <h1
            class="font-bold text-center text-exd-gray-scorpion text-exd-1424"
          >
            {{ settings?.forgot_password?.[steps]?.page_description }}
          </h1>
          <div class="flex flex-col gap-7 mt-14">
            <InputText
              :model="form.email"
              :label="settings?.forgot_password?.[steps]?.field?.field_1"
              @validate="validateInput('email', $event)"
              disabled
            />
            <InputText
              type="password"
              :model="form.password"
              :label="settings?.forgot_password?.[steps]?.field?.field_2"
              @validate="validateInput('password', $event)"
              @update:model="updateModel('password', $event)"
            />
            <InputText
              v-if="settings?.forgot_password?.[steps]?.field?.field_3"
              type="password"
              :model="form.confirmPassword"
              :label="settings?.forgot_password?.[steps]?.field?.field_3"
              @validate="validateInput('confPassword', $event)"
              @update:model="updateModel('confirmPassword', $event)"
            />
          </div>
        </div>
      </template>
      <template v-else>
        <h1 class="font-bold text-center text-exd-gray-scorpion text-exd-1424">
          {{ settings?.forgot_password?.[steps]?.page_description }}
        </h1>
      </template>
    </div>
    
    <div class="fixed bottom-0 w-full max-w-md px-8 mx-auto mb-3">
      <SolidButton
        :label="settings?.forgot_password?.[steps]?.button_text"
        :has-loading="isLoading"
        :disabled="isLoading"
        :bgColor="settings?.forgot_password?.[steps]?.button_and_text_color?.background"
        :textColor="settings?.forgot_password?.[steps]?.button_and_text_color?.background.color"
        :on-click="handleSubmit"
        has-bottom
      />
    </div>
  </div>
  
  <Dialog
    v-model:visible="isErrorMessage"
    modal
    class="!w-11/12 !max-w-sm border border-exd-gray-44"
    :style="{
      background: settings?.global?.modal?.background_color
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
        @click="handleCloseDialog"
      />
      <div class="flex flex-col items-center justify-center w-full gap-4 py-6">
        <IconsWarning class="w-10 h-10" :style="{ color: settings?.global?.icon_color?.background }" />
        <div class="w-10/12 text-center">
          <p 
            :style="{
              color: settings?.global?.modal?.text_color
            }"
          >
            {{ errorMessage }}
          </p>
        </div>
      </div>
    </template>
  </Dialog>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import arrow from '~/assets/images/arrow.svg'
import close from '~/assets/images/close.svg'
import InputText from '~/components/InputText.vue'
import HeaderBar from '~/components/HeaderBar.vue'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const steps = ref('step_3')
const isLoading = ref(false)
const errorMessage = ref(null)
const isErrorMessage = ref(false)
const token = route.params.random
const settings = useState('settings')

const isSuccessSendResetPassword = ref(false)
const handleCloseDialog = () => (isErrorMessage.value = false)

const form = ref({
  email: null,
  password: null,
  confirmPassword: null,
})

const updateModel = (field, value) => {
  form.value[field] = value
}

const handleSubmit = async () => {
  isLoading.value = true

  if (isSuccessSendResetPassword.value) {
    navigateTo('/')
  } else {
    let payload = {
      token: token,
      email: form.value.email,
      password: form.value.password,
      password_confirmation: form.value.confirmPassword,
    }

    try {
      const authService = useAuthService()
      const { status, message } = await authService.resetPassword(payload)

      if (status) {
        isLoading.value = false
        navigateTo('/reset/complete')
      }

      // console.log(response)
    } catch (error) {
      isLoading.value = false
      const message = error._data.message
      const password = form.value.password
      const confirmPassword = form.value.confirmPassword
      if (password === null) {
        errorMessage.value = t('passwordRequired')
      } else {
        if (password.length < 8) {
          errorMessage.value = t('minLength', { number: 8 })
        } else if (confirmPassword !== password) {
          errorMessage.value = t('passwordNotMatch')
        } else {
          errorMessage.value = message
        }
      }
      isErrorMessage.value = true
    }
  }
}

const fetchingEmailData = async () => {
  try {
    const authService = useAuthService()
    const { data } = await authService.decryptToken(token)
    form.value.email = data.email
  } catch (error) {
    console.log("Error: Can't save spin result")
  }
}

const validateInput = (field, value) => {
  // console.log(`Validated ${field}:`, value)
}

const handleKeydown = (event) => {
  if (event.key === 'Enter') {
    if (!isLoading.value && !isErrorMessage.value) {
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
  fetchingEmailData()
})

watchEffect(() => {
  if (route.path.includes('complete')) {
    steps.value = 'step_4'
    isSuccessSendResetPassword.value = true
  }
})
</script>
