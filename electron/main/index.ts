import './init';
import { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage } from 'electron';

import { join } from 'path';
import { setMenu } from '../menu';
import { logger } from '../config/logger';
import { isWin } from '../utils/platform';
import { createWindow } from './create-window';
import { appConfig, setTheme, Theme } from '../config/app.config';
import { getWinByFilepath } from '../utils/file';
import { getFocusedWinMdStore } from '../store/md-store';

// Remove electron security warnings
// This warning only shows in development mode
// Read more on https://www.electronjs.org/docs/latest/tutorial/security
// process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'

let filePath: string | undefined;
// windows关联app启动
if (app.isPackaged && isWin && process.argv[1]) {
  filePath = process.argv[1];
}

app.whenReady().then(() => {
  logger.info('[APP] ready --------------------');

  createWindow(filePath);
  filePath = undefined;

  setMenu();
  setTheme(appConfig.window.theme as Theme);

  // 使用nativeImage的话，就算图片是空的也会有个占位
  const icon = nativeImage.createFromPath(join(process.env['PUBLIC'] as string, 'tray.png'));
  const tray = new Tray(icon);
  const contextMenu = Menu.buildFromTemplate([{ label: '退出', role: 'quit' }]);
  tray.setToolTip(app.getName());
  //显示程序页面
  tray.on('click', () => {
    const wins = BrowserWindow.getAllWindows();
    if (wins.length) {
      const find = wins.find((win) => win.isMinimized());
      if (find) find.show();
      else wins[0]?.focus();
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
  // 使用window-all-closed代替自定义事件
  // 当同时有多个窗口时按下退出快捷键，任何一个拦截都不能关闭app
  app.once('window-all-closed', () => {
    if (!cancelQuit) {
      logger.info('[APP] exit ======================');
      app.exit();
    }
  });
  // 保存文件期间，可能会选择取消保存，这时候要取消退出
  // 重现步骤:
  // 1.打开编辑器
  // 2.编辑
  // 3.退出编辑器在弹窗选择保存文件
  // 4.在保存文件期间选择取消
  // 5.关闭窗口
  // 如果不取消的话，在第5步会关闭app而不是关闭窗口
  ipcMain.once('window:cancel-close', () => {
    cancelQuit = true;
  });
});

// 这里还是有必要的，否则mac直接就关闭了，就算是空的listener都能让窗口维持在任务栏
app.on('window-all-closed', () => {
  // win = null;
  // if (process.platform !== 'darwin') app.quit();
});
function openWindow(filepath: string) {
  const win = getWinByFilepath(filepath);
  if (win) {
    win.focus();
    return;
  }
  getFocusedWinMdStore()
    .then(([hook, win]) => {
      if (hook.isEmpty()) {
        hook.readMd(filepath, win);
      } else createWindow(filepath);
    })
    .catch(() => createWindow(filepath));
}

// mac专用：点击最近打开的文件或者通过文件关联打开app，读取文件
// 只在打包安装后有效
app.on('open-file', function (_event, filepath: string) {
  // 文件关联，但窗口关闭app还未关闭时打开
  if (app.isReady()) {
    // 当文件关闭窗口在dock栏的时候，此时没有了窗口
    // 需要重新开启一个窗口
    openWindow(filepath);
  } else {
    // app未启动，通过文件关联启动，whenReady().then
    filePath = filepath;
  }
});

// mac新建标签页
app.on('new-window-for-tab', function () {
  BrowserWindow.getFocusedWindow()?.addTabbedWindow(createWindow());
});

// windows通过任务栏图标菜单上的最近的文件打开 或者 通过文件关联打开
// 只在打包安装后有效
app.on('second-instance', (_e, args) => {
  const filepath = args[2];
  if (filepath) {
    openWindow(filepath);
  }
});

app.on('activate', () => {
  const allWindows = BrowserWindow.getAllWindows();
  if (allWindows.length) {
    const find = allWindows.find((win) => win.isMinimized());
    if (find) find.show();
    else allWindows[0]?.focus();
  } else {
    createWindow();
  }
});
