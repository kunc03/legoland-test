import { defineStore } from 'pinia'
import { usePrizeService } from '~/services/prize'

export const useExternalRedeemStore = defineStore('externalRedeem', {
  state: () => ({
    isExternalRedeem: true,
    prizeLists: [],
  }),
  actions: {
    setExternalRedeem(value) {
      this.isExternalRedeem = value
    },
    async getExternalPrizeList(params = {}) {
      const prizeService = usePrizeService()
      const response = await prizeService.getExternalPrizeList(params)
      this.prizeLists = response.data
      return this.prizeLists
    },
  },
})
