import { BrowserWindow, app, shell, ipcMain } from 'electron';
import { join } from 'path';
import { addRecentDocument, appConfig, saveAppConfig, setTheme, Theme } from '../utils/app-config';
import { readMDFile, saveMDFile } from '../utils/file';
import { isMac } from '../utils/platform';

// Here, you can also use other preload
const preload = join(__dirname, '../preload/index.js');
const url = process.env['VITE_DEV_SERVER_URL'] as string;
const indexHtml = join(process.env['DIST'], 'index.html');

export function createWindow(filePath?: string) {
  const win = new BrowserWindow({
    ...appConfig.window,
    title: 'Main window',
    icon: join(process.env['PUBLIC'] as string, 'icon.png'),
    minWidth: 560,
    minHeight: 380,
    webPreferences: {
      preload,
      // Warning: Enable nodeIntegration and disable contextIsolation is not secure in production
      // Consider using contextBridge.exposeInMainWorld
      // Read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
      nodeIntegration: true,
      contextIsolation: false,
      spellcheck: false,
    },
  });

  if (app.isPackaged) {
    win.loadFile(indexHtml);
    // win.webContents.openDevTools();
  } else {
    win.loadURL(url);
    // Open devTool if the app is not packaged
    win.webContents.openDevTools();
  }

  win.on('blur', function () {
    win?.webContents.send('window-blur');
  });

  // Test actively push message to the Electron-Renderer
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', new Date().toLocaleString());
    setTheme(win as BrowserWindow, appConfig.window.theme as Theme);
    // 通过文件关联打开的app
    filePath && readMDFile(win as BrowserWindow, filePath);
  });

  // Make all links open with the browser, not with the application
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:')) shell.openExternal(url);
    return { action: 'deny' };
  });

  let canClose = false;
  win.on('close', (event) => {
    if (!canClose) {
      win?.webContents.send('win-close-tips');
      event.preventDefault(); //阻止窗口的关闭事件
      return;
    }

    canClose = false;

    if (isMac) {
      // win = null;
      return;
    }

    if (win?.isVisible()) {
      win?.hide();
      event.preventDefault();
      // 使用ipcMain触发，不会被win.webContents.ipc.on('close-window')监听到
      // 只为触发app.on('before-quit')内的close-window
      ipcMain.emit('close-window');
    } else {
      app.exit(0);
    }
  });

  win.on('resized', function () {
    if (!win) return;
    const [width, height] = win.getContentSize() as [number, number];
    appConfig.window.width = width;
    appConfig.window.height = height;
    saveAppConfig();
  });

  // win.webContents.on('ipc-message', (e, ...args) => {
  //   console.log(e, args);
  // });

  win.webContents.ipc.on('md-store:isModify', (_, isModify: boolean) => {
    canClose = !isModify;
    win?.setDocumentEdited(isModify);
  });

  win.webContents.ipc.on('set-window-size', (_event, { width, height }) => {
    win?.setSize(width, height);
  });

  win.webContents.ipc.on('save-md-file', (_event, args) => {
    win && saveMDFile(win, args);
  });

  win.webContents.ipc.on('drop-file', (_event, filePath: string) => {
    // 记录最近打开的文件
    addRecentDocument(filePath);
    win?.setRepresentedFilename(filePath);
  });

  // 渲染线程请求关闭窗口
  win.webContents.ipc.on('close-window', () => {
    // 当不可关闭时，去询问渲染进程是否可关闭，
    // 渲染进程判断可以关闭时才会触发，并把可以关闭的条件设置为true，
    // 且不会再次询问渲染进程
    canClose = true;
    if (win && !win.isDestroyed()) {
      // 会触发win的close事件
      win.close();
    }
  });

  return win;
}
