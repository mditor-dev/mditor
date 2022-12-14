import { BrowserWindow } from 'electron';
import { MDFile } from '../../types/interfaces';
import { updateObj } from '@tool-pack/basic';
import { readMDFile, saveMDFile } from '../utils/file';
import { addRecentDocument } from '../utils/app-config';

export function useMd(win: BrowserWindow) {
  const _state: MDFile = {
    name: '',
    path: '',
    originContent: '',
    content: '',
  };

  function syncState() {
    win.webContents.send('md-store:update', _state);
  }

  function setState(state: Partial<MDFile>) {
    updateObj(_state, state);
    win.setDocumentEdited(isModify());
    syncState();
  }

  win.webContents.ipc.on('md-store:update', (_, md: MDFile) => {
    console.log('md-store:update');
    if (md.path && md.path !== _state.path) {
      addRecentDocument(md.path);
    }
    updateObj(_state, md);
    win.setDocumentEdited(isModify());
  });

  const isModify = () => _state.originContent !== _state.content;

  const clear = () => setState({ name: '', content: '', originContent: '', path: '' });

  // 因为弹窗会触发blur保存，所以加个锁锁住save
  let saveLock = false;
  const save = async (type: 'save' | 'save-as' = 'save'): Promise<null | MDFile> => {
    if (saveLock) return Promise.resolve(null);
    const file = await saveMDFile(win, { ..._state, type });
    file && setState(file);
    return file;
  };
  const lockSave = (): void => {
    saveLock = true;
  };
  const unlockSave = (): void => {
    saveLock = false;
  };

  const reset = () => setState({ content: _state.originContent });

  const readMd = (filepath: string, win: BrowserWindow): boolean => {
    const md = readMDFile(win, filepath);
    md && setState(md);
    return Boolean(md);
  };

  const isEmpty = (): boolean => Object.values(_state).every((v) => !v);

  const hook = {
    state: _state,
    setState,
    isModify,
    clear,
    save,
    reset,
    lockSave,
    unlockSave,
    readMd,
    isEmpty,
    syncState,
  };

  mdManager.set(win, hook);

  return hook;
}
export const mdManager = new WeakMap<BrowserWindow, ReturnType<typeof useMd>>();

export function getFocusedWinMdHook(): Promise<[ReturnType<typeof useMd>, BrowserWindow]> {
  return new Promise<[ReturnType<typeof useMd>, BrowserWindow]>((res, rej) => {
    const win = BrowserWindow.getFocusedWindow();
    if (!win) {
      rej();
      return;
    }
    const hook = mdManager.get(win);
    if (!hook) {
      rej();
      return;
    }
    res([hook, win]);
  });
}
