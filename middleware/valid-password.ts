export default defineNuxtRouteMiddleware(async (to, from) => {
  if (to.path.includes('/spin/prize')) {
    return
  }

  const gachaTypeFromQuery = to.query?.gachaType || from.query?.gachaType
  const prizeIdFromQuery = to.query?.prize_id || from.query?.prize_id
  const gachaTypeFromState = useState('GACHA_TYPE', () => null).value

  if (
    gachaTypeFromQuery === 'external' ||
    gachaTypeFromState === 'external_prize' ||
    prizeIdFromQuery ||
    from.path?.includes('/spin/prize/')
  ) {
    return
  }

  const validPassword = useCookie('VALID_PASSWORD')
  const { decryptData } = useEncryption()

  const randomCode = to.params?.randomCode || from.params?.randomCode
  if (!randomCode) return
  const { data }: any = await useFetchApi(
    'GET',
    '/location/password/' + randomCode
  )

  const validSlug = decryptData(validPassword.value || '{}')

  if (data) {
    const spinType = useState('spin_type', () => 0)
    spinType.value = data.spin_type

    if (data.spin_type === 4 || data.spin_type === 5) {
      const spinInterval = useState('spin_interval', () => 0)
      spinInterval.value = data.spin_interval
    }
  }

  // 1. spin
  // 2. pin
  // 3. quiz
  
  // before_spin_type

  if (data && data.before_spin_type === 2 && validSlug?.slug !== randomCode) {
    return navigateTo({
      path: `/scan/${randomCode}`,
    })
  }

  if (data && data.before_spin_type === 1 && validSlug?.slug !== randomCode) {
    return navigateTo({
      path: `/spin/${randomCode}`,
    })
  }

  if (data && data.before_spin_type === 3 && validSlug?.slug !== randomCode) {
    return navigateTo({
      path: `/quiz/${randomCode}`,
    })
  }
})
