import { BrowserWindow, Menu } from 'electron';
import { getFileMenu } from './file';
import { getEditMenu } from './edit';
import { getViewMenu } from './view';
import { getThemeMenu } from './theme';
import { getWindowMenu } from './window';
import { getHelpMenu } from './help';

export function setMenu(getWin: () => BrowserWindow | null): void {
  const menu = Menu.buildFromTemplate([
    getFileMenu(getWin),
    getEditMenu(getWin),
    getViewMenu(),
    getThemeMenu(getWin),
    getWindowMenu(),
    getHelpMenu(),
  ]);
  Menu.setApplicationMenu(menu);
}
