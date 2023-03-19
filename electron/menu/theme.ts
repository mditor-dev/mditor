import { MenuItem } from 'electron';
import { isMac } from '../utils/platform';
import { appConfig, Theme, setTheme } from '../config/app.config';

export function getThemeMenu(): MenuItem {
  // 主题切换菜单
  return new MenuItem({
    id: 'ThemeMenu',
    label: isMac ? '主题' : '主题(T)(&T)',
    submenu: [
      {
        label: Theme.light,
        type: 'radio',
        checked: appConfig.window.theme === Theme.light,
        click() {
          setTheme(Theme.light);
        },
      },
      {
        label: Theme.dark,
        type: 'radio',
        checked: appConfig.window.theme === Theme.dark,
        click() {
          setTheme(Theme.dark);
        },
      },
      {
        label: '跟随系统',
        type: 'radio',
        checked: appConfig.window.theme === Theme.system,
        click() {
          setTheme(Theme.system);
        },
      },
    ],
  });
}
