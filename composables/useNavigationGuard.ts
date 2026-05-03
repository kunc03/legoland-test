export const useNavigationGuard = (target: string = '/camera') => {
  const router = useRouter()
  const route = useRoute()

  const handleBackButton = () => {
    // Cek jika sudah di target, biarkan user keluar (hindari loop)
    if (route.path === target) {
      window.history.back()
      return
    }
    router.replace(target)
  }

  const handlePageshow = (event: PageTransitionEvent) => {
    if (event.persisted) {
      setupGuard()
    }
  }

  const setupGuard = () => {
    const currentState = window.history.state || {}
    // Jangan timpa state existing, hanya tambahkan flag guard
    if (currentState.guard !== true) {
      window.history.pushState(
        { ...currentState, guard: true },
        '',
        window.location.href
      )
    }
  }

  onMounted(() => {
    if (process.client) {
      setupGuard()
      window.addEventListener('popstate', handleBackButton)
      window.addEventListener('pageshow', handlePageshow)
    }
  })

  onUnmounted(() => {
    window.removeEventListener('popstate', handleBackButton)
    window.removeEventListener('pageshow', handlePageshow)
  })
}
