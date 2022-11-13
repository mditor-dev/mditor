import { MenuItem, app } from 'electron';
import { isMac, isWin } from '../utils/platform';
export function getViewMenu(): MenuItem {
  // 显示菜单
  return new MenuItem({
    id: 'ViewMenu',
    label: isMac ? '显示' : '显示(V)(&V)',
    submenu: [
      ...(app.isPackaged
        ? ([] as any)
        : [
            {
              label: 'reload',
              role: 'reload',
              accelerator: 'CommandOrControl+r',
            },
            {
              label: 'force reload',
              role: 'forceReload',
              accelerator: 'CommandOrControl+Shift+r',
            },
            {
              label: 'Toggle Developer Tools',
              role: 'toggleDevTools',
              accelerator: 'CommandOrControl+Shift+Alt+i',
            },
            { type: 'separator' },
          ]),
      {
        label: '实际大小',
        role: 'resetZoom',
        accelerator: 'CommandOrControl+Shift+0',
      },
      {
        label: '放大',
        role: 'zoomIn',
        accelerator: 'CommandOrControl+Shift+=',
      },
      {
        label: '缩小',
        role: 'zoomOut',
        accelerator: 'CommandOrControl+Shift+-',
      },
      {
        type: 'separator',
      },
      {
        label: '全屏切换',
        role: 'togglefullscreen',
        accelerator: isWin ? 'F11' : 'Control+f',
      },
    ],
  });
}
