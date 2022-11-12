import { MenuItem, BrowserWindow, dialog } from 'electron';
import { readMDFile } from '../../utils/file';
import { getRecentDocumentsMenu } from './recent-documents';
export function getFileMenu(getWin: () => BrowserWindow | null): MenuItem {
  return new MenuItem({
    id: 'FileMenu',
    label: '文件(F)(&F)',
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
      {
        label: '另存为',
        accelerator: 'CommandOrControl+Shift+s',
        async click() {
          getWin()?.webContents.send('save-as');
        },
      },
      getRecentDocumentsMenu(getWin),
      { label: '退出', role: 'quit', accelerator: 'CommandOrControl+q' },
    ],
  });
}
