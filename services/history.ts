export const useHistoryService = () => {
  const getHistoryList = (params: any = {}) => {
    return useFetchApi('GET', 'history', { params })
  }

  const getHistoryDetail = (id: string | number) => {
    return useFetchApi('GET', 'history/' + id)
  }

  const getHistoryImage = (id: string | number) => {
    return useFetchApi('GET', '/history/image/' + id)
  }

  return {
    getHistoryList,
    getHistoryDetail,
    getHistoryImage,
  }
}
