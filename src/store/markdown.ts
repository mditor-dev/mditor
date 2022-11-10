import { defineStore } from 'pinia';
import { ipcRenderer } from 'electron';
import { MDFile } from '../../types/interfaces';
import { computed, reactive, toRefs, watch } from 'vue';

let isWatched = false;
export const useMarkdownStore = defineStore('md-file-store', () => {
  const state = reactive({ name: '', originContent: '', content: '', path: '' });

  // watch(
  //   state,
  //   debounce((n: MDFile) => {
  //     ipcRenderer.send('md-store-update', { ...n });
  //   }, 100),
  // );

  const isModify = computed(() => {
    const { content, path, originContent } = state;
    if (!path) return Boolean(content);
    return originContent !== content;
  });

  watch(isModify, (n) => ipcRenderer.send('set-can-close', !n), { immediate: true });

  const actions = reactive({
    save(): void {
      // 通知electron保存文件
      ipcRenderer.send('save-md-file', { ...state });
    },
    onDrop(event: DragEvent): void {
      const dt = event.dataTransfer;
      if (!dt) return;
      event.preventDefault();
      event.stopPropagation();

      // 可以拖放多个文件
      const file = dt.files[0];
      if (!file) return;

      const fr = new FileReader();
      fr.onload = (e) => {
        if (!e.target) return;

        state.content = e.target.result as string;
        state.originContent = state.content;
        state.path = file.path;
        state.name = file.name;

        ipcRenderer.send('drop-file', file.path);
      };
      fr.readAsText(file);
    },
  });

  function addListener(): void {
    if (isWatched) return;
    isWatched = true;

    // 打开文件时的通知
    ipcRenderer.on('read-md-file', (_event, { content, path, name }: MDFile) => {
      state.path = path;
      state.originContent = content;
      state.content = content;
      state.name = name;
    });

    // 窗口blur通知
    ipcRenderer.on('window-blur', () => {
      if (!isModify.value || !state.path) return;
      actions.save();
    });

    // 另存为通知
    ipcRenderer.on('save-as', (event) => {
      event.sender.send('save-md-file', { ...state, type: 'save-as' });
    });

    // 保存成功通知
    ipcRenderer.on('save-md-success', (_event, options: MDFile & { type: string }) => {
      state.path = options.path;
      state.name = options.name;
      // 更新originContent
      state.originContent = options.content;
    });

    // 窗口关闭提示
    ipcRenderer.on(
      'win-close-tips',

      (event) => {
        function reply(delay = 0) {
          ipcRenderer.send('set-can-close', true);
          setTimeout(() => event.sender.send('close-window'), delay);
        }

        // 文件内容未改动，直接退出
        if (!isModify.value) {
          reply();
          return;
        }

        // 内容已改动，询问是否保存
        const confirm = window.confirm('文件未保存，是否保存再离开？');

        // 确认保存
        if (confirm) {
          ipcRenderer.once('save-md-success', () => {
            reply(1000);
          });
          actions.save();
          return;
        }

        // 直接离开
        reply();
      },
    );
  }

  addListener();

  return { ...toRefs(state), ...actions, isModify };
});
