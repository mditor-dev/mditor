import { app, BrowserWindow, Menu } from 'electron';
import { getFileMenu } from './file';
import { getEditMenu } from './edit';
import { getViewMenu } from './view';
import { getThemeMenu } from './theme';
import { getWindowMenu } from './window';
import { getHelpMenu } from './help';
import { isMac } from '../utils/platform';
import { getParagraphMenu } from './paragraph';

export function setMenu(getWin: () => BrowserWindow | null): void {
  const menu = Menu.buildFromTemplate([
    getFileMenu(getWin),
    getEditMenu(getWin),
    getParagraphMenu(getWin),
    getViewMenu(),
    getThemeMenu(getWin),
    getWindowMenu(),
    getHelpMenu(),
  ]);
  if (isMac) {
    const oldMenu = app.applicationMenu;
    if (oldMenu && oldMenu.items[0]) {
      const appMenu = oldMenu.items[0];
      menu.insert(0, appMenu);
      // console.log(appMenu.submenu);
    }
  }
  Menu.setApplicationMenu(menu);
}
