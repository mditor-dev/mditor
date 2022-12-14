import { BrowserWindow } from 'electron';
import { MDFile } from '../../types/interfaces';
import { updateObj } from '@tool-pack/basic';
import { saveMDFile } from '../utils/file';
import { addRecentDocument } from '../utils/app-config';

export function useMd(win: BrowserWindow) {
  const _state: MDFile = {
    name: '',
    path: '',
    originContent: '',
    content: '',
  };

  function setState(state: Partial<MDFile>) {
    updateObj(_state, state);
    win.setDocumentEdited(isModify());
    win.webContents.send('md-store:update', _state);
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
  const lockSave = () => (saveLock = true);
  const unlockSave = () => (saveLock = false);

  const reset = () => setState({ content: _state.originContent });

  const hook = { state: _state, setState, isModify, clear, save, reset, lockSave, unlockSave };

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
