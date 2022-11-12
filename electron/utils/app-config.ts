import fs from 'fs';
import * as Path from 'path';
import { app, ipcMain, nativeTheme, BrowserWindow } from 'electron';
import { arrayRemoveItem, debounce } from '@mxssfd/ts-utils';
import { AppConfig } from '../../types/interfaces';

// 配置文件保存路径
const configPath = Path.resolve(app.getPath('userData'), 'app.config.json');
console.log(configPath);
// 默认配置
export let appConfig: AppConfig = {
  theme: 'light',
  window: {
    width: 1000,
    height: 600,
  },
  recentDocuments: [],
};

// 如果已经存在了配置文件，那么把配置文件读取出来
if (fs.existsSync(configPath)) {
  appConfig = JSON.parse(fs.readFileSync(configPath).toString());
}

/**
 * 保存配置
 */
export const saveAppConfig = debounce(() => {
  ipcMain.emit('config-change');
  fs.writeFileSync(configPath, JSON.stringify(appConfig));
}, 500);

/**
 * 添加最近打开的文件记录
 */
export function addRecentDocument(filepath: string) {
  app.addRecentDocument(filepath);
  arrayRemoveItem(filepath, appConfig.recentDocuments);
  appConfig.recentDocuments.unshift(filepath);
  saveAppConfig();
  ipcMain.emit('recent-document-change');
}

/**
 * 清除所有最近打开的文件记录
 */
export function clearRecentDocument() {
  app.clearRecentDocuments();
  appConfig.recentDocuments.length = 0;
  saveAppConfig();
  ipcMain.emit('recent-document-change');
}

export enum Theme {
  light = 'light',
  dark = 'dark',
  system = 'system',
}

export function setTheme(win: BrowserWindow, theme: Theme = nativeTheme.themeSource as Theme) {
  nativeTheme.themeSource = theme;
  win.webContents.send('change-theme', theme);
  appConfig.theme = theme;
  saveAppConfig();
}
