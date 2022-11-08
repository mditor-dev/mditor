import fs from 'fs';
import * as path from 'path';
import { dialog, BrowserWindow, app } from 'electron';

export function readFile(win: BrowserWindow, filePath: string) {
  try {
    const file = fs.readFileSync(filePath).toString();

    app.addRecentDocument(filePath);

    win.webContents.send('read-file', { file, filename: path.basename(filePath) });
  } catch (e: any) {
    dialog.showErrorBox('读取文件失败', e);
  }
}

export async function saveFile(file: string, filename: string) {
  try {
    const { filePath, canceled } = await dialog.showSaveDialog({
      defaultPath: filename,
      // message: '111',
      filters: [
        { name: 'Markdown', extensions: ['md'] },
        { name: 'Plain Text', extensions: [''] },
      ],
    });

    if (canceled || !filePath) return;

    try {
      fs.writeFileSync(filePath, file);
    } catch (e: any) {
      dialog.showErrorBox('保存文件出错', e);
    }
  } catch (e: any) {
    dialog.showErrorBox('保存文件出错2', e);
  }
}
