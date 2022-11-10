import { defineStore } from 'pinia';
import { ipcRenderer } from 'electron';
import { MDFile } from '../../types/interfaces';

let isWatched = false;
export const useMarkdownStore = defineStore('md-file-store', {
  state: () => {
    return {
      name: '',
      originContent: '',
      content: '',
      path: '',
    } as MDFile;
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
      // 通知electron保存文件
      ipcRenderer.send('save-md-file', { ...this.$state });
      // 更新originContent
      this.originContent = this.content;
    },
    addListener(): void {
      if (isWatched) return;
      isWatched = true;

      // 打开文件时的通知
      ipcRenderer.on('read-md-file', (_event, { content, path, name }: MDFile) => {
        this.path = path;
        this.originContent = content;
        this.content = content;
        this.name = name;
      });

      // 窗口blur通知
      ipcRenderer.on('window-blur', () => {
        if (!this.isModify || !this.path) return;
        this.save();
      });

      // 另存为通知
      ipcRenderer.on('save-as', (event) => {
        event.sender.send('save-md-file', { ...this.$state, type: 'save-as' });
      });

      // 保存成功通知
      ipcRenderer.on('save-md-success', (_event, options: MDFile & { type: string }) => {
        this.path = options.path;
        this.name = options.name;
      });

      // window.addEventListener('e')

      // query-md-save-status
      ipcRenderer.on(
        'query-md-save-status',

        (event) => {
          // 文件内容未改动，直接退出
          if (!this.isModify) {
            event.sender.send('close-window');
            return;
          }
          // 内容已改动，询问是否保存
          const confirm = window.confirm('文件未保存，是否保存再离开？');
          // 确认保存
          if (confirm) {
            ipcRenderer.once('save-md-success', (e) => {
              e.sender.send('close-window');
            });
            this.save();
            return;
          }
          // 直接离开
          event.sender.send('close-window');
        },
      );
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

        this.content = e.target.result as string;
        this.originContent = this.content;
        this.path = file.path;
        this.name = file.name;

        ipcRenderer.send('drop-file', file.path);
      };
      fr.readAsText(file);
    },
  },
});
