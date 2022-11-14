import {
  MenuItem,
  BrowserWindow,
  dialog,
  MenuItemConstructorOptions,
  shell,
  ipcMain,
} from 'electron';
import { readMDFile } from '../../utils/file';
import { getRecentDocumentsMenu } from './recent-documents';
import { isMac } from '../../utils/platform';
import { MDFile } from '../../../types/interfaces';
export function getFileMenu(getWin: () => BrowserWindow | null): MenuItem {
  const separator: MenuItemConstructorOptions = { type: 'separator' };
  return new MenuItem({
    id: 'FileMenu',
    label: isMac ? '文件' : '文件(F)(&F)',
    submenu: [
      {
        label: '打开文件',
        accelerator: 'CommandOrControl+o',
        async click() {
          const win = getWin();
          if (!win) return;
          const { filePaths, canceled } = await dialog.showOpenDialog(win, {
            filters: [
              { name: 'Markdown', extensions: ['md'] },
              { name: 'Plain Text', extensions: [''] },
            ],
          });
          if (canceled) return;

          const [filePath] = filePaths as [string];
          readMDFile(getWin(), filePath);
        },
      },
      getRecentDocumentsMenu(getWin),
      {
        label: '保存',
        accelerator: 'CommandOrControl+s',
        click() {
          getWin()?.webContents.send('md-store:save');
        },
      },
      {
        label: '另存为',
        accelerator: 'CommandOrControl+Shift+s',
        click() {
          getWin()?.webContents.send('md-store:save-as');
        },
      },
      {
        label: '打开文件位置',
        click() {
          const win = getWin();
          if (!win) return;
          ipcMain.once('md-store:get-return', function (_, file: MDFile) {
            console.log(file);
            if (file.path) shell.showItemInFolder(file.path);
          });
          win.webContents.send('md-store:get');
        },
      },
      separator,
      {
        label: '新建',
        accelerator: 'CommandOrControl+n',
        click() {
          getWin()?.webContents.send('md-store:new');
        },
      },
      {
        label: '内容还原',
        accelerator: 'CommandOrControl+r',
        click() {
          getWin()?.webContents.send('md-store:restore');
        },
      },
      separator,
      { label: '退出', role: 'quit', accelerator: 'CommandOrControl+q' },
    ],
  });
}
