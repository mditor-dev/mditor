import { defineStore } from 'pinia';

export const useStore = defineStore('store', {
  state: () => {
    return {
      isShowCatalogue: true,
    };
  },
  getters: {
    getIsShowCatalogue: (state) => {
      return state.isShowCatalogue;
    },
  },
  actions: {
    setIsShowCatalogue(isShowCatalogue: boolean) {
      this.isShowCatalogue = isShowCatalogue;
    },
  },
});
