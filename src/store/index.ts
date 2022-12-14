import { defineStore } from 'pinia';
import { reactive, toRefs } from 'vue';
import { ipcRenderer } from 'electron';

export const useStore = defineStore('store', () => {
  const state = reactive({ directoryVisible: true, theme: 'light' });

  const actions = {
    toggleDirectoryVisible() {
      state.directoryVisible = !state.directoryVisible;
    },
  };

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

    let visible = true;
    ipcRenderer.on('editor:toggle-bar', () => {
      state.directoryVisible = visible = !visible;
    });
  }
  addListener();
  return { ...toRefs(state), ...actions };
});
