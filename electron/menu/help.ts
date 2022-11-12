import { MenuItem, shell } from 'electron';
import pkg from '../../package.json';
import { isMac } from '../utils/platform';
export function getHelpMenu(): MenuItem {
  // 编辑菜单
  return new MenuItem({
    id: 'HelpMenu',
    label: isMac ? '帮助' : '帮助(H)(&H)',
    submenu: [
      {
        label: '查看issue',
        click() {
          shell.openExternal(pkg.bugs.url);
        },
      },
    ],
  });
}
