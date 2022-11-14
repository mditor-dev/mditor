import fs from 'fs';
import * as Path from 'path';
import { app, ipcMain, nativeTheme } from 'electron';
import { arrayRemoveItem, debounce } from '@mxssfd/core';
import { AppConfig } from '../../types/interfaces';

export enum Theme {
  light = 'light',
  dark = 'dark',
  system = 'system',
}

// 配置文件保存路径
const configPath = Path.resolve(app.getPath('userData'), 'app.config.json');
// 默认配置
export let appConfig: AppConfig = {
  version: '0.0.0',
  window: {
    theme: Theme.dark as const,
    width: 1000,
    height: 600,
    autoHideMenuBar: false,
  },
  recentDocuments: [],
};

// 如果已经存在了配置文件，那么把配置文件读取出来
if (fs.existsSync(configPath)) {
  try {
    const read = JSON.parse(fs.readFileSync(configPath).toString()) as AppConfig;
    if (read.version === appConfig.version) {
      appConfig = read;
    }
  } catch (e) {
    console.error(e);
  }
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
 * 添加最近打开的文件记录
 */
export function removeRecentDocument(filepath: string) {
  arrayRemoveItem(filepath, appConfig.recentDocuments);
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

export function setTheme(theme: Theme = nativeTheme.themeSource as Theme) {
  nativeTheme.themeSource = theme;
  appConfig.window.theme = theme;
  saveAppConfig();
}
