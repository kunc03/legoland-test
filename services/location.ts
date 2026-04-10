export const useLocationService = () => {
  const getLocationPassword = (id: string | number) => {
    return useFetchApi('GET', '/location/password/' + id)
  }

  return {
    getLocationPassword,
  }
}
