import { BrowserWindow, MenuItem } from 'electron';
import { isMac } from '../utils/platform';
import { appConfig, Theme, setTheme } from '../utils/app-config';

export function getThemeMenu(getWin: () => BrowserWindow | null): MenuItem {
  // 主题切换菜单
  return new MenuItem({
    id: 'ThemeMenu',
    label: isMac ? '主题' : '主题(T)(&T)',
    submenu: [
      {
        label: Theme.light,
        type: 'radio',
        checked: appConfig.theme === Theme.light,
        click() {
          const win = getWin();
          win && setTheme(win, Theme.light);
        },
      },
      {
        label: Theme.dark,
        type: 'radio',
        checked: appConfig.theme === Theme.dark,
        click() {
          const win = getWin();
          win && setTheme(win, Theme.dark);
        },
      },
      {
        label: '跟随系统',
        type: 'radio',
        checked: appConfig.theme === Theme.system,
        click() {
          const win = getWin();
          win && setTheme(win, Theme.system);
        },
      },
    ],
  });
}
