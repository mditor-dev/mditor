import { defineStore } from 'pinia';
import { reactive, toRefs } from 'vue';

export const useStore = defineStore('store', () => {
  const state = reactive({ isShowCatalogue: true, theme: 'light' });

  const actions = reactive({
    setIsShowCatalogue(isShowCatalogue: boolean): void {
      state.isShowCatalogue = isShowCatalogue;
    },
  });

  function addListener(): void {
    const media = window.matchMedia('(prefers-color-scheme:dark)');

    state.theme = media.matches ? 'dark' : 'light';

    //监听样式切换
    media.addEventListener('change', (e) => {
      if (e.matches) {
        console.log('黑暗模式');
        state.theme = 'dark';
      } else {
        console.log('亮色模式');
        state.theme = 'light';
      }
    });
  }
  addListener();
  return { ...toRefs(state), ...actions };
});
