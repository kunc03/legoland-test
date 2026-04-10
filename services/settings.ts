export const useSettingsService = () => {
  const getSettings = () => {
    return useFetchApi('GET', 'settings')
  }

  return {
    getSettings,
  }
}
