import { defineStore } from 'pinia'

export const useLegolandStore = defineStore('legoland', {
  state: () => ({
    isLegoland: true,
  }),
  actions: {
    setLegoland(value) {
      this.isLegoland = value
    },
  },
})
