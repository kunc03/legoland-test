import { defineStore } from 'pinia'

export const useExternalRedeemStore = defineStore('externalRedeem', {
  state: () => ({
    isExternalRedeem: true,
  }),
  actions: {
    setExternalRedeem(value) {
      this.isExternalRedeem = value
    },
  },
})
