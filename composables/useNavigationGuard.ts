export const useNavigationGuard = (target: string = '/camera') => {
  const router = useRouter()
  const route = useRoute()

  // Guard dari Vue Router untuk menangkap navigasi SPA jika user
  // memencet tombol back sebelum berinteraksi dengan halaman (di mana browser
  // biasanya akan men-skip dummy state dan langsung pindah rute).
  onBeforeRouteLeave((to, from, next) => {
    if (to.path !== target) {
      next(target)
    } else {
      next()
    }
  })

  const handleBackButton = (event: PopStateEvent) => {
    if (route.path === target) {
      window.history.back()
      return
    }
    
    // Gunakan setTimeout agar Vue Router selesai memproses event popstate.
    // Kita gunakan router.replace (menggunakan instance router yang sudah di-bind)
    // alih-alih navigateTo() karena navigateTo bisa error "Nuxt instance unavailable"
    // saat dipanggil di dalam setTimeout/async callbacks.
    setTimeout(() => {
      router.replace(target)
    }, 50)
  }

  const handlePageshow = (event: PageTransitionEvent) => {
    if (event.persisted) {
      setupGuard()
    }
  }

  const setupGuard = () => {
    const currentState = window.history.state || {}
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
      // Tambahkan delay sedikit untuk setup state, memastikan Vue Router 
      // sudah selesai mengatur history state-nya sendiri saat initial load.
      setTimeout(() => {
        setupGuard()
      }, 100)
      window.addEventListener('popstate', handleBackButton)
      window.addEventListener('pageshow', handlePageshow)
    }
  })

  onUnmounted(() => {
    if (process.client) {
      window.removeEventListener('popstate', handleBackButton)
      window.removeEventListener('pageshow', handlePageshow)
    }
  })
}
