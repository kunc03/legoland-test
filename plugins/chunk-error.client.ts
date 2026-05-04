export default defineNuxtPlugin((nuxtApp) => {
  const router = useRouter()

  router.onError((error, to) => {
    // Check if the error is a chunk load error or dynamic import failure
    if (
      error.message.includes('Loading chunk') ||
      error.message.includes('Failed to fetch dynamically imported module') ||
      error.message.includes('Dynamic import failed') ||
      error.message.includes('Importing a module script failed')
    ) {
      console.warn('Chunk load error detected. Reloading page to fetch latest version...', error)
      
      // Prevent infinite loops if the chunk just completely doesn't exist even after reload
      const reloadKey = `chunk_reload_${to.fullPath}`
      
      if (!sessionStorage.getItem(reloadKey)) {
        sessionStorage.setItem(reloadKey, 'true')
        window.location.reload()
      } else {
        console.error('Already reloaded once for chunk error on this path, giving up to avoid infinite loop.')
        setTimeout(() => sessionStorage.removeItem(reloadKey), 5000)
      }
    }
  })
  
  // Clear the reload flag on successful navigation
  router.afterEach((to) => {
    const reloadKey = `chunk_reload_${to.fullPath}`
    if (sessionStorage.getItem(reloadKey)) {
      sessionStorage.removeItem(reloadKey)
    }
  })
})
