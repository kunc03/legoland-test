export const useAuthService = () => {
  const register = (payload: any) => {
    return useFetchApi('POST', 'register', { body: payload })
  }

  const forgotPassword = (email: string) => {
    return useFetchApi('POST', 'email/forgot', { body: { email } })
  }

  const resetPassword = (payload: any) => {
    return useFetchApi('POST', 'email/reset', { body: payload })
  }

  const decryptToken = (token: string) => {
    return useFetchApi('GET', 'email/decrypt?token=' + token)
  }

  const verifyEmail = (token: string) => {
    return useFetchApi('POST', '/email/verify', { body: { token } })
  }

  const logout = () => {
    return useFetchApi('POST', 'logout')
  }

  const getUserProfile = () => {
    return useFetchApi('GET', 'user')
  }

  const updateUserProfile = (payload: any) => {
    return useFetchApi('POST', 'user', { body: payload })
  }

  const decryptLoginToken = (token: string) => {
    return useFetchApi('GET', `/login/decrypt/${token}`)
  }

  const login = (payload: any) => {
    return useFetchApi('POST', 'login', { body: payload })
  }

  const getLoginLineUrl = (env: string) => {
    return useFetchApi('GET', `login/line/redirect?env=${env}`)
  }

  const processLoginLineToken = (payload: any) => {
    return useFetchApi('POST', 'login/line/token', { body: payload })
  }

  return {
    register,
    forgotPassword,
    resetPassword,
    decryptToken,
    decryptLoginToken,
    verifyEmail,
    logout,
    getUserProfile,
    updateUserProfile,
    login,
    getLoginLineUrl,
    processLoginLineToken,
  }
}
