export default defineNuxtRouteMiddleware(async (to, from) => {
  const allowPaths = ['spin']
  const LOCALE = useCookie('LOCALE')
  
  LOCALE.value ??= 'ja'
  
  try {
    const settings = useState<any>('settings', () => null)
    if (!settings.value) {
      const settingsService = useSettingsService()
      const { data } = await settingsService.getSettings()
      if (!data) return navigateTo('/not-found')
      settings.value = data
    }
    if (import.meta.client) {
      const root = document.documentElement
      const textColors = settings.value?.global?.text_colors || {}
      const regisBgColor = settings.value?.register_login?.membership_registration_page?.button_text_and_color?.background || ''
      const regisTextColor = settings.value?.register_login?.membership_registration_page?.button_text_and_color?.color || ''
      const claimBgColor = settings.value?.prize?.step_2?.swipe_exchange?.data?.button_and_text_color?.background || ''
      const claimTextColor = settings.value?.prize?.step_2?.swipe_exchange?.data?.button_and_text_color?.color || ''
      
      Object.keys(textColors).forEach(key => {
        root.style.setProperty(`--${key}`, textColors[key])
      })
      if (regisBgColor) {
        root.style.setProperty('--register-bg-color', regisBgColor)
      }
      if (regisTextColor) {
        root.style.setProperty('--register-text-color', regisTextColor)
      }
      if (claimBgColor) {
        root.style.setProperty('--claim-bg-color', claimBgColor)
      }
      if (claimTextColor) {
        root.style.setProperty('--claim-text-color', claimTextColor)
      }
    }

    if (!allowPaths.some(path => to.path.includes(path))) return
    if (!import.meta.client) return

    const gacha = settings.value?.gacha
    if (!gacha) return

    const cachePromises: Promise<any>[] = []
    const addToCache = (url?: string) => {
      if (url) cachePromises.push(fetchAndCacheImage(url))
    }

    // Landing screen
    if (gacha.loading_screen?.background?.type === 'image') {
      addToCache(gacha.loading_screen.background.value)
    }
    if (gacha.loading_screen?.gif) {
      addToCache(gacha.loading_screen?.gif)
    }

    // Spin point
    const spin1 = gacha.spin_gacha_1_screen
    if (spin1) {
      if (spin1.before_gacha_1_screen?.background?.type === 'image') {
        addToCache(spin1.before_gacha_1_screen.background.value)
      }
      if (spin1.after_gacha_1_screen?.background?.type === 'image') {
        addToCache(spin1.after_gacha_1_screen.background.value)
      }
    }

    // Spin character
    const spin2 = gacha.spin_gacha_2_screen
    if (spin2) {
      if (spin2.after_gacha_2_screen?.background?.type === 'image') {
        addToCache(spin2.after_gacha_2_screen.background.value)
      }
    }

    if (cachePromises.length > 0) {
      Promise.allSettled(cachePromises)
    }
  } catch (err) {
    console.error(`Gacha middleware error on route ${to.path}:`, err)
  }
})
