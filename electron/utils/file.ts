import fs from 'fs';
import * as Path from 'path';
import { dialog, BrowserWindow } from 'electron';
import { MDFile } from '../../types/interfaces';
import { addRecentDocument } from './app-config';
import { createWindow } from '../main/create-window';
import { mdManager } from '../hooks/use-md';

/**
 * 读取md文件
 * @param win
 * @param filePath
 */
export function readMDFile(win: BrowserWindow, filePath: string): MDFile | void {
  try {
    // 读取文件内容
    const content = fs.readFileSync(filePath).toString();

    // 添加至最近打开的文件
    addRecentDocument(filePath);
    win.setRepresentedFilename(filePath);

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
): Promise<MDFile | null> {
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
        return null;
      }

      path = res.filePath;
    }

    try {
      // 保存文件
      fs.writeFileSync(path, content);

      // 添加至最近打开的文件
      addRecentDocument(path);

      win.setRepresentedFilename(path);

      return { content, originContent: content, path, name: Path.basename(path) };
    } catch (e: any) {
      dialog.showErrorBox('保存md文件出错', e);
      return Promise.reject('保存md文件出错');
    }
  } catch (e: any) {
    dialog.showErrorBox('保存md文件出错2', e);
    return Promise.reject('保存md文件出错2');
  }
}

export async function openFile(
  getFilePath: (win: BrowserWindow) => Promise<string>,
): Promise<void> {
  async function useCurWindow(win: BrowserWindow, setMd: Function) {
    try {
      const filepath = await getFilePath(win);
      const mdFile = await readMDFile(win, filepath);
      mdFile && setMd(mdFile);
    } catch (e: any) {
      // error
      console.log(e?.message);
    }
  }
  const win = BrowserWindow.getFocusedWindow();

  if (!win) {
    const win = createWindow();
    await useCurWindow(win, mdManager.get(win)!.setState);
    return;
  }

  const hook = mdManager.get(win);
  if (!hook) return;

  const { state: md, isModify, setState: setMd } = hook;

  // 有未保存的或者有已经打开的内容直接新建窗口 或者有已经打开的空文件
  if (isModify() || md.content || md.path) {
    const filepath = await getFilePath(win);
    createWindow(filepath);
    return;
  }

  // 否则使用当前窗口
  useCurWindow(win, setMd);
}
