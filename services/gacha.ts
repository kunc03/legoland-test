import moment from 'moment'

/**
 * Centralized service for handling Gacha-related processes including 
 * API calls, data transformation, and persistent storage.
 */
export const useGachaService = () => {
  const { encryptData, decryptData } = useEncryption()
  const { isScanVerified, clearScanVerified } = useGachaVerification()
  const TOKEN = useCookie('TOKEN')
  const USER = useCookie('USER')
  const settings = useState<any>('settings')

  /**
   * Transforms the raw backend response into a unified storage object used across pages.
   */
  const mapGachaResponse = (data: any): any => {
    return {
      location_id: data.userPoint?.location?.id || data.location?.id || null,
      point_id: data.userPoint?.point?.id || data.point?.id || null,
      point_image: data.userPoint?.point?.image || data.point?.image || null,
      point_name: data.userPoint?.point?.name || data.point?.name || null,
      popup_image: data.userPoint?.point?.point_category_image || data.point?.point_category_image || null,
      popup_description: data.popup_description || data.point?.point_category_description || null,
      redirect_link: data.redirect_link || data.point?.point_category_link || null,
      point_category_is_fail: !!(data.userPoint?.point?.point_category_is_fail || data.point?.point_category_is_fail),

      character_id: data.userCollection?.gacha_character?.id || data.character?.id || null,
      character_image: data.userCollection?.gacha_character?.image || data.character?.image || null,
      character_name: data.userCollection?.gacha_character?.name || data.character?.name || null,
      character_category: data.userCollection?.gacha_character?.category || data.character?.category || null,
      character_description: data.userCollection?.gacha_character?.description || data.character?.description || null,
      character_rarity: data.userCollection?.gacha_character?.rarity_image_during_gacha || data.character?.rarity_image_during_gacha || null,
      character_star1: data.userCollection?.gacha_character?.star1 || data.character?.star1 || null,
      character_star2: data.userCollection?.gacha_character?.star2 || data.character?.star2 || null,
      character_star3: data.userCollection?.gacha_character?.star3 || data.character?.star3 || null,
      character_star_name1: data.userCollection?.gacha_character?.star_name1 || data.character?.star_name1 || null,
      character_star_name2: data.userCollection?.gacha_character?.star_name2 || data.character?.star_name2 || null,
      character_star_name3: data.userCollection?.gacha_character?.star_name3 || data.character?.star_name3 || null,
      store_name: data.userCollection?.gacha_character?.store_name || data.character?.store_name || null,
      store_description: data.userCollection?.gacha_character?.store_description || data.character?.store_description || null,
      
      log_id: data.log_id || null,
      is_redirect: data.is_redirect,
      button_name: data.button_name,
      spin_date: new Date().toLocaleString(),
      
      hide_character: !settings.value?.flow?.screens?.spin_gacha_2_screen?.show_character_screen,
      hide_character_info: !settings.value?.flow?.screens?.spin_gacha_2_screen?.show_character_details,
      hide_store_details: !settings.value?.flow?.screens?.spin_gacha_2_screen?.display_character_introduction?.store_details,
      hide_character_details: !settings.value?.flow?.screens?.spin_gacha_2_screen?.display_character_introduction?.character_details,
    }
  }

  /**
   * Performs the gacha spin API call and handles storage.
   */
  const performSpin = async (slug: string, payload: any = {}) => {
    const slugUpper = slug.toUpperCase()
    const slugStorageName = `${slugUpper}_GACHA`
    const existingResult = getStoredResult(slug)
    const spinTypeValue = Number(useState<number | string>('spin_type').value || 0)
    const hasValidScanTicket = isScanVerified(slug)

    if (
      existingResult &&
      !isEligibleForSpin(slug, spinTypeValue) &&
      !hasValidScanTicket
    ) {
      return existingResult
    }
    
    // 1. Determine method and endpoint
    const method = TOKEN.value && USER.value ? 'POST' : 'GET'
    const endpoint = 'gacha/spin'
    
    // 2. Prepare request options
    // Ensure payload.slug always uses the current slug parameter (not stale cookie data)
    const normalizedPayload = {
      ...payload,
      slug: slug.toLowerCase(),
    }
    const fetchOptions: any = {}
    if (method === 'POST') {
      fetchOptions.body = {
        ...normalizedPayload,
        scan_verified: hasValidScanTicket
      }
    } else {
      fetchOptions.params = {
        slug: normalizedPayload.slug,
        password: normalizedPayload.password,
        scan_verified: hasValidScanTicket
      }
    }

    // 3. Execute request
    const { data } = await useFetchApi(method, endpoint, fetchOptions)

    // 4. Cleanup verification
    clearScanVerified(slug)

    // 5. Update session state
    const spinType = useState<number | string>('spin_type')
    sessionStorage.setItem('IS_ALREADY_SPIN', String(data.is_already_spin || 'false'))
    sessionStorage.setItem('SPIN_TYPE', String(spinType.value || ''))
    sessionStorage.setItem('READY_SPIN_AFTER_DATE', String(data?.ready_spin_after_date || ''))

    // 6. Map and store result
    const mappedResult = mapGachaResponse(data)
    
    // Add interval info if present
    const spinInterval = useState<number>('spin_interval')
    if (spinInterval?.value) {
      const now = new Date()
      mappedResult.spin_date_interval = new Date(now.getTime() + Number(spinInterval.value) * 60 * 1000).toLocaleString()
    }

    localStorage.setItem(slugStorageName, encryptData(mappedResult))
    
    return mappedResult
  }

  /**
   * Retrieves and decrypts the gacha result for a specific slug.
   */
  const getStoredResult = (slug: string): any => {
    const slugUpper = slug.toUpperCase()
    const slugStorageName = `${slugUpper}_GACHA`
    const slugData = localStorage.getItem(slugStorageName)
    
    if (!slugData) return null
    
    try {
      return decryptData(slugData)
    } catch (e) {
      console.error('[GachaService] Failed to decrypt stored data:', e)
      return null
    }
  }

  /**
   * Checks if the user is eligible for another spin based on the stored data and spin type.
   */
  const isEligibleForSpin = (slug: string, spinType: number) => {
    const result = getStoredResult(slug)
    if (!result) return true

    const now = Date.now()

    if (spinType === 1) {
      const expiredDate = moment(new Date(result.spin_date)).add(1, 'days').startOf('day').valueOf()
      return now >= expiredDate
    }

    if (spinType === 3) {
      return false // Single spin allowed
    }

    if ((spinType === 4 || spinType === 5) && result.spin_date_interval) {
      return now >= new Date(result.spin_date_interval).getTime()
    }

    return true
  }

  /**
   * Saves temporary gacha data (pre-registration).
   */
  const saveTempData = (payload: any) => {
    return useFetchApi('POST', 'gacha/save/temp', { body: payload })
  }

  /**
   * Saves gacha data for a registered user.
   */
  const saveRegisteredData = (payload: any) => {
    return useFetchApi('POST', 'gacha/save/registered', { body: payload })
  }

  /**
   * Saves general gacha data.
   */
  const saveGacha = (payload: any) => {
    return useFetchApi('POST', 'gacha/save', { body: payload })
  }

  /**
   * Checks gacha availability/status.
   */
  const checkGacha = (params: any) => {
    return useFetchApi('GET', 'gacha/check', { params })
  }

  /**
   * Checks spin eligibility status by slug.
   */
  const checkSpinStatus = (slug: string) => {
    return useFetchApi('GET', `gacha/check-status/${slug}`)
  }

  /**
   * Validates quiz response.
   */
  const validateQuiz = (payload: any) => {
    return useFetchApi('POST', 'gacha/quiz/validate', { body: payload })
  }

  /**
   * Retrieves quiz data.
   */
  const getQuiz = (params: any) => {
    return useFetchApi('GET', 'gacha/quiz', { params })
  }

  /**
   * Performs radius/geofencing check.
   */
  const radiusCheck = (payload: any) => {
    return useFetchApi('POST', 'radius-check', { body: payload })
  }

  /**
   * Checks if the user can spin for a given code/location path.
   * Endpoint: GET gacha/check-status/{path}
   */
  const checkStatus = (path: string, params: any = {}) => {
    return useFetchApi('GET', `gacha/check-status/${path}`, { params })
  }

  /**
   * Reports gacha spin multiple times logic.
   */
  const reportGacha = (payload: any) => {
    return useFetchApi('POST', 'gacha/report', { body: payload })
  }

  const getSpinGacha = (params: any) => {
    return useFetchApi('GET', 'gacha/spin', { params })
  }

  const postSpinGacha = (payload: any) => {
    return useFetchApi('POST', 'gacha/spin', { body: payload })
  }

  return {
    performSpin,
    getStoredResult,
    isEligibleForSpin,
    mapGachaResponse,
    saveTempData,
    saveRegisteredData,
    checkGacha,
    checkStatus,
    checkSpinStatus,
    validateQuiz,
    getQuiz,
    radiusCheck,
    getSpinGacha,
    postSpinGacha,
    reportGacha,
    saveGacha
  }
}
