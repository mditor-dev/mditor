import { MenuItem, BrowserWindow, dialog, MenuItemConstructorOptions, shell } from 'electron';
import { openFile } from '../../utils/file';
import { getRecentDocumentsMenu } from './recent-documents';
import { isMac } from '../../utils/platform';
import { getFocusedWinMdHook } from '../../hooks/use-md';
import { createWindow } from '../../main/create-window';
export function getFileMenu(): MenuItem {
  const separator: MenuItemConstructorOptions = { type: 'separator' };

  const modifyMd = async (msg: string, operate: 'reset' | 'clear') => {
    const [hook, win] = await getFocusedWinMdHook();
    console.log(hook.isModify(), hook.state.content, hook.state.originContent);
    if (!hook.isModify()) {
      hook[operate]();
      return;
    }

    try {
      hook.lockSave();
      const { response } = await dialog.showMessageBox(win, {
        type: 'question',
        message: msg,
        buttons: ['保存', '丢弃'],
      });
      hook.unlockSave();
      if (response === 0) {
        const saveSuccess = await hook.save();
        // 取消
        if (!saveSuccess) return;
      }
      hook[operate]();
    } catch (e) {
      hook.unlockSave();
    }
  };

  return new MenuItem({
    id: 'FileMenu',
    label: isMac ? '文件' : '文件(F)(&F)',
    submenu: [
      {
        label: '打开文件',
        accelerator: 'CommandOrControl+o',
        click() {
          openFile(async (win: BrowserWindow): Promise<string> => {
            const { filePaths, canceled } = await dialog.showOpenDialog(win, {
              filters: [
                { name: 'Markdown', extensions: ['md'] },
                { name: 'Plain Text', extensions: [''] },
              ],
            });

            if (canceled) return Promise.reject('cancel');

            return filePaths[0] as string;
          });
        },
      },
      getRecentDocumentsMenu(),
      {
        label: '保存',
        accelerator: 'CommandOrControl+s',
        click() {
          getFocusedWinMdHook().then(([{ save }]) => save());
        },
      },
      {
        label: '另存为',
        accelerator: 'CommandOrControl+Shift+s',
        click() {
          getFocusedWinMdHook().then(([{ save }]) => save('save-as'));
        },
      },
      {
        label: '打开文件位置',
        click() {
          getFocusedWinMdHook().then(([{ state }]) => {
            if (state.path) shell.showItemInFolder(state.path);
          });
        },
      },
      separator,
      {
        label: '清空全部',
        accelerator: 'CommandOrControl+n',
        async click() {
          modifyMd('清空全部操作会丢弃未保存的文本', 'clear');
        },
      },
      {
        label: '内容还原',
        accelerator: 'CommandOrControl+r',
        async click() {
          modifyMd('内容还原操作会把编辑器还原到未编辑状态，将丢弃未保存的文本', 'reset');
        },
      },
      {
        label: '新建窗口',
        accelerator: 'CommandOrControl+Shift+n',
        click() {
          createWindow();
        },
      },
      separator,
      { label: '退出', role: 'quit', accelerator: 'CommandOrControl+q' },
    ],
  });
}
