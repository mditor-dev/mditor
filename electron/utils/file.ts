import fs from 'fs';
import * as Path from 'path';
import { dialog, BrowserWindow } from 'electron';
import { MDFile } from '../../types/interfaces';
import { addRecentDocument } from './app-config';

/**
 * 读取md文件
 * @param win
 * @param filePath
 */
export function readMDFile(win: BrowserWindow | null, filePath: string): MDFile | void {
  try {
    // 读取文件内容
    const content = fs.readFileSync(filePath).toString();

    // 添加至最近打开的文件
    addRecentDocument(filePath);
    win?.setRepresentedFilename(filePath);

    return { content, name: Path.basename(filePath), originContent: content, path: filePath };
  } catch (e: any) {
    dialog.showErrorBox('读取文件失败', e);
  }
}

/**
 * 保存md文件
 */
export async function saveMDFile(
  win: BrowserWindow,
  options: MDFile & { type?: 'save' | 'save-as' },
): Promise<boolean> {
  const { content, type = 'save' } = options;
  let { path } = options;
  try {
    if (!path || type === 'save-as') {
      // 显示文件保存窗口
      const res = await dialog.showSaveDialog(win, {
        title: type === 'save-as' ? '另存为' : '',
        defaultPath: path,
        // message: '111',
        filters: [
          { name: 'Markdown', extensions: ['md'] },
          { name: 'Plain Text', extensions: [''] },
        ],
      });

      if (res.canceled || !res.filePath) {
        win?.webContents.send('save-md-cancel');
        return false;
      }

      path = res.filePath;
    }

    try {
      // 保存文件
      fs.writeFileSync(path, content);

      // 添加至最近打开的文件
      addRecentDocument(path);

      win?.setRepresentedFilename(path);

      // 通知渲染线程保存成功
      win?.webContents.send('save-md-success', { ...options, path, name: Path.basename(path) });

      return true;
    } catch (e: any) {
      dialog.showErrorBox('保存md文件出错', e);
      return Promise.reject('保存md文件出错');
    }
  } catch (e: any) {
    dialog.showErrorBox('保存md文件出错2', e);
    return Promise.reject('保存md文件出错2');
  }
}
