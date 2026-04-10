export const useShareService = () => {
  const submitShare = (payload: any) => {
    return useFetchApi('POST', 'share', { body: payload })
  }

  return {
    submitShare,
  }
}
