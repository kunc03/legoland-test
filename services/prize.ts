export const usePrizeService = () => {
  const redeemPrize = (payload: any) => {
    return useFetchApi('POST', 'prizes/redeem', { body: payload })
  }

  const getPrizeList = (params: any = {}) => {
    return useFetchApi('GET', 'prize-list', { params })
  }

  const getPrizeRedeemedList = (params: any = {}) => {
    return useFetchApi('GET', 'prize-redeemed', { params })
  }

  const getExternalUserPrizes = (params: any = {}) => {
    return useFetchApi('GET', 'external-prize/user-prizes', { params })
  }

  const getPrizeDetail = (id: string | number) => {
    return useFetchApi('GET', 'prizes/' + id)
  }

  const getExternalPrizeDetail = (id: string | number) => {
    return useFetchApi('GET', 'external-prize/' + id)
  }

  const validateExternalPrize = (payload: any) => {
    return useFetchApi('POST', 'external-prize/validate', { body: payload })
  }

  const redeemExternalPrize = (payload: any) => {
    return useFetchApi('POST', 'external-prize/redeem', { body: payload })
  }

  const spinExternalPrize = (slug: string, prizeId: string | number) => {
    return useFetchApi('POST', 'external-prize/spin', {
      body: { external_gacha_slug: slug, prize_id: prizeId },
    })
  }

  const spinExternalPrizeOnly = (slug: string, prizeId: string | number) => {
    return useFetchApi('POST', 'external-prize/spin-only', {
      body: { external_gacha_slug: slug, prize_id: prizeId },
    })
  }

  return {
    redeemPrize,
    getPrizeList,
    getPrizeRedeemedList,
    getExternalUserPrizes,
    getPrizeDetail,
    getExternalPrizeDetail,
    validateExternalPrize,
    redeemExternalPrize,
    spinExternalPrize,
    spinExternalPrizeOnly,
  }
}
