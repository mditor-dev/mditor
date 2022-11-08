import fs from 'fs';
import * as path from 'path';
import { dialog, BrowserWindow, app } from 'electron';

/**
 * 读取md文件
 * @param win
 * @param filePath
 */
export function readMDFile(win: BrowserWindow, filePath: string): void {
  try {
    // 读取文件内容
    const file = fs.readFileSync(filePath).toString();

    // 添加至最近打开的文件
    app.addRecentDocument(filePath);

    // 通知前台读取
    win.webContents.send('read-md-file', { file, filename: path.basename(filePath) });
  } catch (e: any) {
    dialog.showErrorBox('读取文件失败', e);
  }
}

/**
 * 保存md文件
 * @param file
 * @param filePath
 */
export async function saveMDFile(file: string, filePath?: string): Promise<void> {
  try {
    if (!filePath) {
      // 显示文件保存窗口
      const res = await dialog.showSaveDialog({
        defaultPath: '',
        // message: '111',
        filters: [
          { name: 'Markdown', extensions: ['md'] },
          { name: 'Plain Text', extensions: [''] },
        ],
      });
      if (res.canceled || !res.filePath) return;
      filePath = res.filePath;
    }

    try {
      // 保存文件
      fs.writeFileSync(filePath, file);

      // 添加至最近打开的文件
      app.addRecentDocument(filePath);
    } catch (e: any) {
      dialog.showErrorBox('保存md文件出错', e);
    }
  } catch (e: any) {
    dialog.showErrorBox('保存md文件出错2', e);
  }
}
