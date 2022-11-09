import { defineStore } from 'pinia';
import { ipcRenderer } from 'electron';

let isWatched = false;
export const useMarkdownStore = defineStore('md-file-store', {
  state: () => {
    return {
      name: '',
      originContent: '',
      content: '',
      path: '',
    };
  },
  getters: {
    isModify(): boolean {
      const { content, path, originContent } = this;
      if (!path) return Boolean(content);
      return originContent !== content;
    },
  },
  actions: {
    save(): void {
      const { content, path } = this.$state;
      // 通知electron保存文件
      ipcRenderer.send('save-md-file', { file: content, filePath: path });
      // 更新originContent
      this.originContent = content;
    },
    watchReadMdFile(): void {
      if (isWatched) return;
      ipcRenderer.on(
        'read-md-file',
        (_event, { content, path, name }: { content: string; path: string; name: string }) => {
          this.path = path;
          this.originContent = content;
          this.content = content;
          this.name = name;
        },
      );
      isWatched = true;
    },
  },
});
