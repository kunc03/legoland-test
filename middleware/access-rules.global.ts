export default defineNuxtRouteMiddleware((to) => {
  if (to.matched.length === 0) {
    return navigateTo('/dashboard')
  }

  const settings = useState<any>('settings')
  const screens = settings.value?.flow?.screens

  if (!screens) return

  const accessRules: Record<string, boolean | undefined> = {
    '/': screens.show_user_tap_screen,
    '/dashboard': screens.user_dashboard_screen?.show_user_dashboard_screen,
  }

  if (to.path.startsWith('/redeem')) {
    accessRules[to.path] = screens.user_dashboard_screen?.redeem_prize
  }

  const allowed = accessRules[to.path]

  if (allowed === false) {
    return navigateTo('/not-found')
  }

  if (import.meta.client) {
    const hasSubmittedProfile = localStorage.getItem('PROFILE_SUBMITTED')
    const hasSubmittedRegister = localStorage.getItem('REGISTER_SUBMITTED')
    const hasClaimed = localStorage.getItem('CLAIM_SUCCESS')
    const hasRedeemed = localStorage.getItem('REDEEM_SUCCESS')
    const userId = localStorage.getItem('USER_ID')

    if (to.path === '/profile/complete' && (!hasSubmittedProfile || !userId)) {
      return navigateTo('/profile')
    }
    if (to.path === '/register/complete' && !hasSubmittedRegister) {
      return navigateTo('/register')
    }
    if (to.path === '/claim/success' && !hasClaimed) {
      return navigateTo('/prize')
    }
    if (to.path === '/redeem/complete' && !hasRedeemed) {
      return navigateTo('/prize')
    }
  }
})
