import { MenuItem } from 'electron';
export function getWindowMenu(): MenuItem {
  // 编辑菜单
  return new MenuItem({
    id: 'EditMenu',
    label: '窗口(W)(&W)',
    submenu: [
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
