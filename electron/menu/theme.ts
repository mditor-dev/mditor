import { MenuItem, nativeTheme, BrowserWindow } from 'electron';
import { isMac } from '../utils/platform';
export function getThemeMenu(getWin: () => BrowserWindow | null): MenuItem {
  // 主题切换菜单
  return new MenuItem({
    id: 'ThemeMenu',
    label: isMac ? '主题' : '主题(T)(&T)',
    submenu: [
      {
        label: 'light',
        click() {
          nativeTheme.themeSource = 'light';
          getWin()?.webContents.send('changeTheme', 'light');
        },
      },
      {
        label: 'dark',
        click() {
          nativeTheme.themeSource = 'dark';
          getWin()?.webContents.send('changeTheme', 'dark');
        },
      },
    ],
  });
}
