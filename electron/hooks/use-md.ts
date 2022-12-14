import { BrowserWindow } from 'electron';
import { MDFile } from '../../types/interfaces';
import { updateObj } from '@tool-pack/basic';
import { readMDFile, saveMDFile, watchFile } from '../utils/file';
import { addRecentDocument } from '../utils/app-config';

export function useMd(win: BrowserWindow) {
  const _state: MDFile = {
    name: '',
    path: '',
    originContent: '',
    content: '',
  };

  let watchCanceler: Function | null = null;

  win.webContents.ipc.on('md-store:update', (_, md: MDFile) => {
    console.log('md-store:update');
    if (md.path && md.path !== _state.path) {
      addRecentDocument(md.path);
    }
    updateObj(_state, md);
    win.setDocumentEdited(getters.isModify());
  });

  const _watchFile = (): void => {
    watchCanceler?.();
    watchCanceler = watchFile(_state.path, {
      onChange(content: string) {
        actions.setState({ content, originContent: content });
      },
      onMove(filepath, filename) {
        actions.setState({ path: filepath, name: filename });
      },
      onRemove() {
        actions.setState({ path: '', name: _state.name + '(已删除)' });
        // actions.clear();
        watchCanceler?.();
      },
    });
  };

  const getters = {
    isModify: (): boolean => _state.originContent !== _state.content,
    isEmpty: (): boolean => Object.values(_state).every((v) => !v),
  };

  // 因为弹窗会触发blur保存，所以加个锁锁住save
  let saveLock = false;
  const actions = {
    syncState(): void {
      win.webContents.send('md-store:update', _state);
    },
    setState(state: Partial<MDFile>): void {
      updateObj(_state, state);
      win.setDocumentEdited(getters.isModify());
      actions.syncState();
    },
    clear: (): void => actions.setState({ name: '', content: '', originContent: '', path: '' }),
    save: async (type: 'save' | 'save-as' = 'save'): Promise<null | MDFile> => {
      if (saveLock) return Promise.resolve(null);
      const file = await saveMDFile(win, { ..._state, type });
      if (file) {
        if (!_state.path) _watchFile();
        actions.setState(file);
      }
      return file;
    },
    lockSave: (): void => {
      saveLock = true;
    },
    unlockSave: (): void => {
      saveLock = false;
    },
    reset: (): void => actions.setState({ content: _state.originContent }),
    readMd: (filepath: string, win: BrowserWindow): boolean => {
      const md = readMDFile(win, filepath);
      if (md) {
        actions.setState(md);
        _watchFile();
      }
      return Boolean(md);
    },
    destroy() {
      console.log('destroy');
      watchCanceler?.();
    },
  };

  const hook = {
    state: _state,
    ...getters,
    ...actions,
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
