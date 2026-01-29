import CryptoJS from 'crypto-js'

export const useEncryption = () => {
  const config = useRuntimeConfig()

  const secretKey = computed(() => config.public.SECRET_KEY)

  const encryptData = (data: any) => {
    let serialization
    if (typeof data === 'object') {
      serialization = JSON.stringify(data)
    } else {
      serialization = data
    }

    const encryptedData = CryptoJS.AES.encrypt(
      serialization,
      secretKey.value
    ).toString()
    return encryptedData
  }

  const decryptData = (encryptedData: string, secret?: string) => {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedData, secret || secretKey.value)
      const decryptedData = bytes.toString(CryptoJS.enc.Utf8)

      if (isJSON(decryptedData)) {
        return JSON.parse(decryptedData)
      }

      return decryptedData
    } catch {
      return null
    }
  }

  const encryptForURL = (data: any) => {
    return encodeURIComponent(encryptData(data))
  }

  const decryptFromURL = (encoded: string, secret: string) => {
    return decryptData(decodeURIComponent(encoded), secret)
  }

  function isJSON(str: any) {
    try {
      JSON.parse(str)
      return true
    } catch {
      return false
    }
  }

  return {
    encryptData,
    decryptData,
    encryptForURL,
    decryptFromURL,
  }
}
