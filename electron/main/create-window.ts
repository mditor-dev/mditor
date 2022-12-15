import { BrowserWindow, app, shell, dialog, ipcMain } from 'electron';
import { join, basename } from 'path';
import { appConfig, saveAppConfig } from '../utils/app-config';
import { useMd } from '../hooks/use-md';
import { idGen } from '@tool-pack/basic';
import { isMac } from '../utils/platform';
import { getWinByFilepath } from '../utils/file';

// Here, you can also use other preload
const preload = join(__dirname, '../preload/index.js');
const url = process.env['VITE_DEV_SERVER_URL'] as string;
const indexHtml = join(process.env['DIST'], 'index.html');

const gen = idGen();
export function createWindow(filePath?: string) {
  const focusedWin = BrowserWindow.getFocusedWindow();
  const win = new BrowserWindow({
    ...appConfig.window,
    title: 'Main window',
    icon: join(process.env['PUBLIC'] as string, 'icon.png'),
    x: focusedWin ? focusedWin.getBounds().x + 30 : undefined,
    y: focusedWin ? focusedWin.getBounds().y + 30 : undefined,
    minWidth: 560,
    minHeight: 380,
    tabbingIdentifier: gen.next() + '',
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

  const mdStore = useMd(win);

  if (app.isPackaged) {
    win.loadFile(indexHtml);
  } else {
    win.loadURL(url);
    // Open devTool if the app is not packaged
    win.webContents.openDevTools();
  }

  win.on('blur', function () {
    if (!mdStore.isModify() || !mdStore.state.path || win.isDestroyed()) return;
    mdStore.save();
  });

  // Test actively push message to the Electron-Renderer
  win.webContents.on('did-finish-load', () => {
    win.webContents.send('main-process-message', new Date().toLocaleString());
    // 通过文件关联打开的app
    if (filePath) mdStore.readMd(filePath, win);
    // 否则同步一下
    else mdStore.syncState();
  });

  win.webContents.ipc.on('drop-file', (_e, filepathList: string[]) => {
    // 过滤掉已经打开的文档
    filepathList = filepathList.filter((filepath) => {
      if (getWinByFilepath(filepath)) {
        return !dialog.showMessageBoxSync(win, {
          message: `是否再次打开【${basename(filepath)}】`,
          buttons: ['是', '否'],
        });
      }
      return true;
    });

    if (!filepathList.length) return;
    if (filepathList.length > 50) {
      dialog.showMessageBox(win, { type: 'warning', message: '不能一次性打开超过50个文件' });
      return;
    }

    if (mdStore.isEmpty()) mdStore.readMd(filepathList.shift() as string, win);
    const wins = filepathList.map(createWindow);
    isMac && wins.forEach(win.addTabbedWindow.bind(win));
  });

  // Make all links open with the browser, not with the application
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:')) shell.openExternal(url);
    return { action: 'deny' };
  });

  win.on('close', (event) => {
    console.log('close', mdStore.isModify());
    if (!mdStore.isModify() && !mdStore.isRemoved()) {
      mdStore.destroy();
      return;
    }

    event.preventDefault(); //阻止窗口的关闭事件

    (async function () {
      function emitClose(delay = 0) {
        setTimeout(() => {
          mdStore.destroy();
          win.close();
        }, delay);
      }
      function emitCancel() {
        // 使用ipcMain触发，不会被win.webContents.ipc.on('window:cancel-close')监听到
        // 只为触发app.on('before-quit')内的事件
        ipcMain.emit('window:cancel-close');
      }
      mdStore.lockSave();
      // 内容已改动，询问是否保存
      const { response } = await dialog.showMessageBox(win, {
        type: 'question',
        message: '文件未保存，是否保存再离开？',
        buttons: ['取消', '放弃', '保存'],
      });
      mdStore.unlockSave();
      switch (response) {
        case 0:
          emitCancel();
          break;
        // 放弃
        case 1:
          if (mdStore.isRemoved()) mdStore.clear();
          else mdStore.reset();
          emitClose();
          break;
        // 确认保存
        case 2:
          mdStore.save().then((file) => {
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
