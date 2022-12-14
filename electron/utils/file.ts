import fs from 'fs';
import * as Path from 'path';
import { BrowserWindow, dialog } from 'electron';
import { MDFile } from '../../types/interfaces';
import { addRecentDocument } from './app-config';
import { createWindow } from '../main/create-window';
import { mdManager } from '../hooks/use-md';
import chokidar from 'chokidar';

export function watchFile(
  filepath: string,
  options: {
    onChange: (content: string) => void;
    onMove: (filepath: string, filename: string) => void;
    onRemove: Function;
  },
) {
  const watcher = chokidar.watch(filepath, { persistent: true });
  watcher.on('raw', function (eventName, path) {
    if (
      eventName === 'moved' &&
      path !== filepath &&
      !fs.existsSync(filepath) &&
      fs.existsSync(path)
    ) {
      console.log('moved', path);
      watcher.unwatch(filepath);
      filepath = path;
      watcher.add(filepath);
      options.onMove(filepath, Path.basename(filepath));
    }
  });
  watcher.on('change', (path, stats) => {
    console.log('change:', path, stats);
    const content = readFile(filepath);
    if (content !== undefined) options.onChange(content);
  });
  watcher.on('unlink', (...args: any[]) => {
    console.log('unlink', args);
    if (!fs.existsSync(filepath)) {
      options.onRemove();
    }
  });
  return () => {
    console.log('close watch');
    watcher.close();
  };
}

export function readFile(filepath: string): string | void {
  try {
    return fs.readFileSync(filepath).toString();
  } catch (e: any) {
    dialog.showErrorBox('读取文件失败', e);
  }
}

/**
 * 读取md文件
 * @param win
 * @param filePath
 */
export function readMDFile(win: BrowserWindow, filePath: string): MDFile | void {
  // 读取文件内容
  const content = readFile(filePath);
  if (content === undefined) return;

  // 添加至最近打开的文件
  addRecentDocument(filePath);
  win.setRepresentedFilename(filePath);

  return { content, name: Path.basename(filePath), originContent: content, path: filePath };
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
        defaultPath:
          path ||
          options.name.replace(/(\.md)?\(已删除\)/, '') ||
          /^[^\n]+/.exec(content)?.[0]?.replace(/^#+/, '').trim(),
        // message: '111',
        filters: [
          { name: 'Markdown', extensions: ['md', 'mdc', 'mdown', 'mdtext', 'mdtxt', 'mmd'] },
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
  getFilepath: (win: BrowserWindow) => Promise<string>,
): Promise<void> {
  async function _getFilepath(win: BrowserWindow): Promise<string> {
    const filepath = await getFilepath(win);
    const exists = getWinByFilepath(filepath);
    if (exists) {
      exists.focus();
      return Promise.reject('exists');
    }
    return filepath;
  }
  async function useCurWindow(
    win: BrowserWindow,
    readMd: (filepath: string, win: BrowserWindow) => boolean,
  ) {
    try {
      const filepath = await _getFilepath(win);
      readMd(filepath, win);
    } catch (e: any) {
      // error
      console.log(e?.message);
    }
  }
  const win = BrowserWindow.getFocusedWindow();

  if (!win) {
    const win = createWindow();
    await useCurWindow(win, mdManager.get(win)!.readMd);
    return;
  }

  const hook = mdManager.get(win);
  if (!hook) return;

  const { state: md, isModify, readMd } = hook;

  // 有未保存的或者有已经打开的内容直接新建窗口 或者有已经打开的空文件
  if (isModify() || md.content || md.path) {
    const filepath = await _getFilepath(win);
    createWindow(filepath);
    return;
  }

  // 否则使用当前窗口
  useCurWindow(win, readMd);
}

export function getWinByFilepath(filepath: string) {
  const wins = BrowserWindow.getAllWindows();

  return wins.find((win) => mdManager.get(win)?.state.path === filepath);
}
