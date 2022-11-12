import * as Path from 'path';

import { Menu, BrowserWindow, MenuItemConstructorOptions, ipcMain } from 'electron';
import { appConfig, clearRecentDocument } from '../../utils/app-config';
import { isWin } from '../../utils/platform';
import { readMDFile } from '../../utils/file';

export function getRecentDocumentsMenu(
  getWin: () => BrowserWindow | null,
): MenuItemConstructorOptions {
  function getSubmenu(): Menu {
    const submenu: MenuItemConstructorOptions[] = [
      {
        label: '清除最近文件',
        role: 'clearRecentDocuments',
        click() {
          clearRecentDocument();
        },
      },
    ];
    if (isWin) {
      const list = appConfig.recentDocuments.map<MenuItemConstructorOptions>((filepath) => ({
        label: Path.basename(filepath),
        type: 'radio',
        click() {
          const win = getWin();
          win && readMDFile(win, filepath);
        },
      }));
      submenu.unshift(...list, {
        type: 'separator',
      });
    }

    if (isWin) {
      ipcMain.on('recent-document-change', () => {
        console.log('tips');
      });
    }
    return Menu.buildFromTemplate(submenu);
  }

  return {
    label: '打开最近文件',
    role: 'recentDocuments',
    submenu: getSubmenu(),
  };
}
