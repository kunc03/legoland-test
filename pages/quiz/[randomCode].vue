<template>
  <div class="flex flex-col overflow-hidden grow">
    <HeaderBar>
      <p
        style="text-shadow: 0 3px 3px rgba(0, 0, 0, 0.16)"
        class="header text-black font-bold text-exd-1824.52"
      >
        {{ settings?.pre_gacha?.quiz?.page_title }}
      </p>
    </HeaderBar>

    <div class="flex flex-col items-center h-screen mt-24 grow">
      <div
        class="flex flex-col items-center justify-between w-full p-5 bg-yellow-300 min-h-[55%]"
        :style="{
          background:
            settings?.pre_gacha?.quiz?.background_page.type === 'image'
              ? `url(${settings?.pre_gacha?.quiz?.background_page.value})`
              : settings?.pre_gacha?.quiz?.background_page.value,
          'background-size': 'cover',
          'background-repeat': 'no-repeat',
        }"
      >
        <div class="flex flex-col items-center justify-center gap-1">
          <p
            class="bg-[#341f15] text-white text-[2.5vw] xs:text-[12px] sm:text-[16px] px-3 py-1 rounded-full font-semibold"
          >
            {{ settings?.pre_gacha?.quiz?.page_sub_title }}
          </p>
          <p
            ref="questionRef"
            class="text-[3.4vw] text-[24px] xs:text-[18px] sm:text-[22px] text-[#341f15] text-center px-3 py-2 rounded-full font-bold"
            v-html="question"
          />
        </div>

        <div class="flex flex-col items-center justify-center w-[68%] gap-1">
          <p
            class="text-[3.5vw] xs:text-[15px] sm:text-[16px] text-[#341f15] text-center px-3 rounded-full font-bold"
          >
            {{ settings?.pre_gacha?.quiz?.answer_box_text }}
          </p>
          <Textarea
            v-model="answer"
            rows="1"
            cols="30"
            style="resize: none"
            class="w-full border bg-white text-exd-gray-scorpion border-[#341f15] rounded-md py-1 px-2 text-[3vw] xs:text-[14px] sm:text-[15px]"
          />
        </div>

        <div
          class="flex items-center justify-center w-full gap-0 px-3 py-2 text-white mt-4"
          :style="{ background: settings?.pre_gacha?.quiz?.label_color }"
        >
          <a
            :href="settings?.pre_gacha?.quiz?.url_link"
            target="_blank"
            rel="noopener noreferrer"
            class="text-[2.5vw] xs:text-[12px] sm:text-[16px] flex text-center items-center rounded-full font-bold underline cursor-pointer"
          >
            {{ settings?.pre_gacha?.quiz?.url_link_text }}
            <IconsExport
              :style="{ color: '#ffffff' }"
              class="w-6 h-6 ml-[2px] cursor-pointer"
            />
          </a>
        </div>
      </div>
      <div class="bg-[#e8e7b5] w-full pb-24 flex-auto">
        <div
          class="max-h-[28vh] sm:max-h-[31vh] md:max-h-[31vh] lg:max-h-[31vh] p-5 overflow-y-auto scrollable-content text-exd-gray-scorpion"
        >
          <h3
            class="text-[2.5vw] text-[16px] xs:text-[12px] sm:text-[14px] font-bold text-[#341f15] mb-1"
          >
            {{ settings?.pre_gacha?.quiz?.add_notes_title }}
          </h3>
          <p
            class="flex flex-col gap-1 text-justify text-[3vw] text-[14px] xs:text-[12px] sm:text-[13px]"
            v-html="terms"
          />
        </div>
      </div>

      <div class="fixed bottom-0 z-50 w-full max-w-md px-8 mx-auto mb-1">
        <SolidButton
          :label="settings?.pre_gacha?.quiz?.button_text"
          :bgColor="
            settings?.pre_gacha?.quiz?.button_and_text_color?.background
          "
          :textColor="settings?.pre_gacha?.quiz?.button_and_text_color?.color"
          :disabled="isLoading"
          :has-loading="isLoading"
          :on-click="handleQuiz"
          has-bottom
        />
      </div>
    </div>
  </div>

  <Modal :is-open="showModal" :on-close="() => toggleModal()">
    <template #body>
      <div class="flex flex-col items-center justify-center p-5 text-center text-exd-gray-scorpion">
        <IconsWarning
          class="w-8 h-8 xs:w-9 sm:h-9 md:w-10 md:h-10"
          :style="{ color: settings?.global?.icon_color?.background }"
        />
        <p
          class="font-bold text-[2.5vw] xs:text-[12px] sm:text-[14px] md:text-exd-1424"
        >
          {{ errorMessages }}
        </p>
      </div>
    </template>
  </Modal>
</template>

<script setup>
import { useI18n } from 'vue-i18n'


definePageMeta({
  middleware: async (to, from) => {
    const isExternal =
      to.path?.includes('/spin/prize') ||
      (to.query && Object.prototype.hasOwnProperty.call(to.query, 'prize_id'))
    if (isExternal) return

    const location = to.params.randomCode
    const { data } = await useFetchApi('GET', '/location/password/' + location)

    if (data && data.before_spin_type === 1) {
      return navigateTo(`/spin/${location}`)
    }
    if (data && data.before_spin_type === 2) {
      return navigateTo(`/scan/${location}`)
    }
  },
})

const { encryptData } = useEncryption()
const settings = useState('settings')
const LOCALE = useCookie('LOCALE')
const { t } = useI18n()

const isLoading = ref(false)

const terms = ref('')
const answer = ref('')
const question = ref('')
const errorMessages = ref('')
const questionRef = ref(null)

const adjustFontSize = async () => {
  await nextTick()
  const element = questionRef.value
  if (!element) return

  element.style.fontSize = ''

  const getMetrics = () => {
    const style = window.getComputedStyle(element)
    const fontSize = parseFloat(style.fontSize)
    let lineHeight = parseFloat(style.lineHeight)
    if (isNaN(lineHeight)) {
      lineHeight = fontSize * 1.2
    }
    const paddingTop = parseFloat(style.paddingTop)
    const paddingBottom = parseFloat(style.paddingBottom)
    const contentHeight = element.scrollHeight - paddingTop - paddingBottom

    return { fontSize, lineHeight, contentHeight }
  }

  let { fontSize, lineHeight, contentHeight } = getMetrics()

  var maxLines = 6

  if (window.innerHeight > 450) {
    maxLines = 7
  }

  while (contentHeight > lineHeight * maxLines && fontSize > 12) {
    fontSize -= 0.5
    element.style.fontSize = `${fontSize}px`

    const metrics = getMetrics()
    lineHeight = metrics.lineHeight
    contentHeight = metrics.contentHeight
  }
}

watch(question, () => {
  adjustFontSize()
})

onMounted(() => {
  window.addEventListener('resize', adjustFontSize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', adjustFontSize)
})

const route = useRoute()

const showModal = ref(false)
const toggleModal = () => {
  showModal.value = !showModal.value
}

const checkAnswerQuiz = async (body) => {
  isLoading.value = true

  try {
    const { status } = await useFetchApi('POST', 'gacha/quiz/validate', {
      body,
    })

    const validPassword = useCookie('VALID_PASSWORD')
    validPassword.value = encryptData(body)
    
    localStorage.removeItem('answer-quiz')

    isLoading.value = false

    return status
  } catch (error) {
    isLoading.value = false
      errorMessages.value = settings.value?.pre_gacha?.quiz?.warning_message
  }
}

const handleQuiz = async () => {
  if (!answer.value) {
    errorMessages.value = t('answerRequired')
    showModal.value = true
    return
  }

  const status = await checkAnswerQuiz({
    slug: route.params.randomCode,
    answer: answer.value,
  })

  if (status) {
    navigateTo(`/spin/${route.params.randomCode}`)
  } else {
    showModal.value = true
  }
}

const getTerms = async () => {
  try {
    terms.value = settings.value?.pre_gacha?.quiz?.text1?.[LOCALE.value] || ''
  } catch (error) {
    console.error("Error: Can't get terms", error)
    terms.value = ''
  }
}

const getQuestions = async () => {
  try {
    const res = await useFetchApi('GET', `gacha/quiz`, {
      params: {
        slug: route.params.randomCode,
      },
    })
    question.value = res?.data?.questions?.[LOCALE.value] || ''
  } catch (error) {
    console.error("Error: Can't get questions", error)
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
})

watch(answer, (newVal) => {
  localStorage.setItem('answer-quiz', newVal)
}, { deep: true })

const handleKeydown = (event) => {
  if (event.key === 'Enter') {
    if (!isLoading.value && !showModal.value) {
      handleQuiz()
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
  const savedAnswer = localStorage.getItem('answer-quiz')
  
  getQuestions()
  getTerms()

  if (savedAnswer) {
    answer.value = savedAnswer
  }
})
</script>

<style scoped>
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
