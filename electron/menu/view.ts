import { MenuItem, app, BrowserWindow } from 'electron';
import { isMac, isWin } from '../utils/platform';
import { appConfig, saveAppConfig } from '../utils/app-config';
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
              accelerator: 'f5',
            },
            {
              label: 'force reload',
              role: 'forceReload',
              accelerator: 'Shift+f5',
            },
            {
              label: 'Toggle Developer Tools',
              role: 'toggleDevTools',
              accelerator: 'CommandOrControl+Shift+Alt+f12',
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
        label: '切换简洁模式',
        accelerator: 'CommandOrControl+Shift+9',
        click() {
          BrowserWindow.getFocusedWindow()?.webContents.send('editor:toggle-bar');
        },
      },
      {
        label: '显示/隐藏预览栏目',
        accelerator: 'CommandOrControl+Shift+8',
        click() {
          BrowserWindow.getFocusedWindow()?.webContents.send('editor:toggle-preview');
        },
      },
      {
        type: 'separator',
      },
      {
        label: '自动隐藏菜单栏(按ALT显示菜单栏)',
        role: 'autoHideMenuBar',
        type: 'checkbox',
        visible: !isMac,
        checked: appConfig.window.autoHideMenuBar,
        click(e) {
          const hide = e.checked;
          const wins = BrowserWindow.getAllWindows();
          if (!wins.length) return;
          wins.forEach((win) => {
            win.setAutoHideMenuBar(hide);
          });
          appConfig.window.autoHideMenuBar = hide;
          saveAppConfig();
        },
      },
      {
        label: '保持窗口在最前端',
        click() {
          const win = BrowserWindow.getFocusedWindow();
          win?.setAlwaysOnTop(!win.isAlwaysOnTop());
        },
      },
      {
        label: '全屏切换',
        role: 'togglefullscreen',
        accelerator: isWin ? 'F11' : 'Control+f',
      },
    ],
  });
}
