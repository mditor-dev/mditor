import { dialog } from 'electron';
import fs from 'fs';

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
