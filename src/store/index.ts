import { defineStore } from 'pinia';
import { reactive, toRefs } from 'vue';
import { ipcRenderer } from 'electron';

export const useStore = defineStore('store', () => {
  const state = reactive({ isShowCatalogue: true, theme: localStorage.getItem('theme') });

  const actions = reactive({
    setIsShowCatalogue(isShowCatalogue: boolean): void {
      state.isShowCatalogue = isShowCatalogue;
    },
    setTheme(theme: any): void {
      localStorage.setItem('theme', theme);
      state.theme = theme;
    },
  });

  function addListener(): void {
    ipcRenderer.send('changeSystemTheme', localStorage.getItem('theme'));

    ipcRenderer.on('changeTheme', (event, value) => {
      // state.theme = value;
      console.log(63311);
      actions.setTheme(value);
    });
  }
  addListener();
  return { ...toRefs(state), ...actions };
});
