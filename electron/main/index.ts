import './init';
import { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage } from 'electron';

import { join } from 'path';
import { setMenu } from '../menu';
import { readMDFile } from '../utils/file';
import { isWin } from '../utils/platform';
import { createWindow } from './create-window';

// Remove electron security warnings
// This warning only shows in development mode
// Read more on https://www.electronjs.org/docs/latest/tutorial/security
// process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'

let filePath: string | undefined;
// window关联app启动
if (app.isPackaged && isWin && process.argv[1]) {
  filePath = process.argv[1];
}

app.whenReady().then(() => {
  const win = createWindow(filePath);
  filePath = undefined;

  setMenu(() => win);
  // 使用nativeImage的话，就算图片是空的也会有个占位
  const icon = nativeImage.createFromPath(join(process.env['PUBLIC'] as string, 'icon_tray.png'));
  const tray = new Tray(icon);
  const contextMenu = Menu.buildFromTemplate([
    {
      label: '退出',
      role: 'quit',
    },
  ]);
  tray.setToolTip('mditor');
  //显示程序页面
  tray.on('click', () => {
    if (win) {
      win.show();
    } else {
      createWindow();
    }
  });
  tray.setContextMenu(contextMenu);
});

app.on('before-quit', () => {
  let cancelQuit = false;
  // 因为拦截了关闭事件，所以要二次关闭，
  // 如果是退出的话，before-quit会在window的close事件之前触发
  ipcMain.once('close-window', () => {
    // 不会触发窗口的close事件
    if (!cancelQuit) app.exit();
  });
  // 保存文件期间，可能会选择取消保存，这时候要取消退出
  // 重现步骤:
  // 1.打开编辑器
  // 2.编辑
  // 3.退出编辑器在弹窗选择保存文件
  // 4.在保存文件期间选择取消
  // 5.关闭窗口
  // 如果不取消的话，在第5步会关闭app而不是关闭窗口
  ipcMain.once('close-window-cancel', () => {
    cancelQuit = true;
  });
});

// 这里还是有必要的，否则mac直接就关闭了，就算是空的listener都能让窗口维持在任务栏
app.on('window-all-closed', () => {
  // win = null;
  // if (process.platform !== 'darwin') app.quit();
});

// mac专用：点击最近打开的文件或者通过文件关联打开app，读取文件
app.on('open-file', function (_event, filepath: string) {
  const win = BrowserWindow.getFocusedWindow();
  // 最近文件打开
  if (win && !win.isDestroyed()) {
    readMDFile(win, filepath);
    return;
  }

  // 文件关联，但窗口关闭时打开
  if (app.isReady()) {
    // 当文件关闭窗口在dock栏的时候，此时没有了窗口
    // 需要重新开启一个窗口
    createWindow(filepath);
  }

  // app未启动，通过文件关联启动，whenReady().then
  filePath = filepath;
});

// windows通过任务栏图标菜单上的最近的文件打开 或者 通过文件关联打开
// 只在打包安装后有效
app.on('second-instance', (_e, args) => {
  const filePath = args[2];
  if (filePath) {
    createWindow(filePath);
  }
});

app.on('activate', () => {
  const allWindows = BrowserWindow.getAllWindows();
  if (allWindows.length) {
    allWindows[0]?.focus();
  } else {
    createWindow();
  }
});
