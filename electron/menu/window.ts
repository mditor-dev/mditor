import { MenuItem, BrowserWindow } from 'electron';
import { isMac } from '../utils/platform';
export function getWindowMenu(): MenuItem {
  // 编辑菜单
  return new MenuItem({
    id: 'WindowMenu',
    label: isMac ? '窗口' : '窗口(W)(&W)',
    submenu: [
      {
        label: '关闭所有窗口',
        click() {
          BrowserWindow.getAllWindows().forEach((win) => win.close());
        },
      },
      {
        label: '最小化',
        role: 'minimize',
        accelerator: 'CommandOrControl+m',
      },
      {
        label: '缩放',
        role: 'zoom',
      },
    ],
  });
}
