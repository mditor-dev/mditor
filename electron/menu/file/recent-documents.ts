import * as Path from 'path';
import fs from 'fs';
import { Menu, MenuItemConstructorOptions, ipcMain, dialog } from 'electron';
import { appConfig, clearRecentDocument, removeRecentDocument } from '../../config/app.config';
import { isWin } from '../../utils/platform';
import { openFile } from '../../utils/file';

export function getRecentDocumentsMenu(): MenuItemConstructorOptions {
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
        click() {
          const exists = fs.existsSync(filepath);
          if (!exists) {
            dialog.showErrorBox('提示', '文件不存在');
            removeRecentDocument(filepath);
            return;
          }
          openFile(async () => filepath);
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
