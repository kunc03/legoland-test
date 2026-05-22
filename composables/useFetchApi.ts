const useFetchApi = async (method: any, url: string, opts = {}): Promise<any> => {
  const config = useRuntimeConfig()

  const TOKEN = useCookie('TOKEN')
  const USER = useCookie('USER')
  const VALID_PASSWORD = useCookie('VALID_PASSWORD')
  const LOCALE = useCookie('LOCALE')
  return $fetch(url, {
    ...opts,
    method,
    baseURL: config.public.API_URL as string,
    async onRequest({ request, options }) {
      if (TOKEN.value && USER.value) {
        const headers = new Headers(options.headers)
        headers.set('Authorization', `Bearer ${TOKEN.value}`)
        options.headers = headers
      }

      options.query = { ...options?.params, lang: LOCALE.value }
    },
    onRequestError({ request, options, error }) {
      return Promise.reject(error)
    },
    async onResponse({ request, response, options }): Promise<any> {
      return response
    },
    async onResponseError({ request, response, options }) {
      if (response?.status === 401 && url !== 'gacha/spin') {
        localStorage.clear()
        sessionStorage.clear()
        TOKEN.value = null
        USER.value = null
        VALID_PASSWORD.value = null
        await navigateTo('/')
      }

      if (response?.status === 401 && url === 'gacha/spin') {
        localStorage.clear()
        sessionStorage.clear()
        TOKEN.value = null
        USER.value = null

        // return Promise.reject('refetch')
        return Promise.reject({
          type: 'refetch',
          status: response?.status,
          data: response?._data || null
        })
      }

      return Promise.reject(response)
    },
  })
}

export default useFetchApi
