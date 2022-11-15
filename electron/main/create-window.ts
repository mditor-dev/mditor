import { BrowserWindow, app, shell, dialog, ipcMain } from 'electron';
import { join } from 'path';
import { appConfig, saveAppConfig } from '../utils/app-config';
import { readMDFile } from '../utils/file';
import { useMd } from '../hooks/use-md';

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

  const {
    setState: setMd,
    state: md,
    isModify: isMdModify,
    save: saveMd,
    lockSave,
    unlockSave,
  } = useMd(win);

  if (app.isPackaged) {
    win.loadFile(indexHtml);
  } else {
    win.loadURL(url);
    // Open devTool if the app is not packaged
    win.webContents.openDevTools();
  }

  win.on('blur', function () {
    if (!isMdModify() || !md.path || win.isDestroyed()) return;
    saveMd();
  });

  // Test actively push message to the Electron-Renderer
  win.webContents.on('did-finish-load', () => {
    win.webContents.send('main-process-message', new Date().toLocaleString());
    // 通过文件关联打开的app
    if (filePath) {
      const file = readMDFile(win as BrowserWindow, filePath);
      if (file) setMd(file);
    }
  });

  // Make all links open with the browser, not with the application
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:')) shell.openExternal(url);
    return { action: 'deny' };
  });

  win.on('close', (event) => {
    console.log('close', isMdModify());
    if (!isMdModify()) return;

    event.preventDefault(); //阻止窗口的关闭事件

    (async function () {
      function emitClose(delay = 0) {
        setTimeout(() => win.close(), delay);
      }
      function emitCancel() {
        // 使用ipcMain触发，不会被win.webContents.ipc.on('window:cancel-close')监听到
        // 只为触发app.on('before-quit')内的事件
        ipcMain.emit('window:cancel-close');
      }
      lockSave();
      // 内容已改动，询问是否保存
      const { response } = await dialog.showMessageBox(win, {
        type: 'question',
        message: '文件未保存，是否保存再离开？',
        buttons: ['取消', '放弃', '保存'],
      });
      unlockSave();
      switch (response) {
        case 0:
          emitCancel();
          break;
        // 放弃
        case 1:
          md.content = md.originContent;
          emitClose();
          break;
        // 确认保存
        case 2:
          saveMd().then((file) => {
            if (file) emitClose(1000);
            else emitCancel();
          });

          break;
      }
    })();
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

  return win;
}