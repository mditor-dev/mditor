import { BrowserWindow } from 'electron';
import { MDFile } from '../../types/interfaces';
import { updateObj } from '@tool-pack/basic';
import { readMDFile, saveMDFile, watchFile } from '../utils/file';
import { addRecentDocument } from '../config/app.config';
import { logger } from '../config/logger';

export function useMdStore(win: BrowserWindow) {
  const mdStoreLoggerScope = `md-store[${win.id}]`;

  const scopeLog = (mdScope: string, msg: string) => {
    mdScope = mdScope ? '.' + mdScope : mdScope;
    logger.info(`[${mdStoreLoggerScope}${mdScope}] ${msg}`);
  };

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
    scopeLog('fileWatch', `watch(${_state.path})`);
    watchCanceler = watchFile(_state.path, {
      onChange(content: string) {
        scopeLog('fileWatch', `change(${_state.path})`);
        actions.setState({ content, originContent: content });
      },
      onMove(filepath, filename) {
        scopeLog('fileWatch', `from(${_state.path}) move to(${filepath})`);
        actions.setState({ path: filepath, name: filename });
      },
      onRemove() {
        scopeLog('fileWatch', `remove(${_state.path})`);
        actions.setState({ path: '', name: _state.name + '(已删除)' });
        // actions.clear();
        watchCanceler?.();
      },
    });
  };

  const getters = {
    isModify: (): boolean => _state.originContent !== _state.content,
    isEmpty: (): boolean => Object.values(_state).every((v) => !v),
    isRemoved: (): boolean => !_state.path && _state.name.endsWith('(已删除)'),
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

      const originPath = _state.path;
      scopeLog('save', `ready '${type}' (${originPath})`);
      actions.lockSave();
      try {
        const file = await saveMDFile(win, { ..._state, type });
        if (file) {
          actions.setState(file);
          scopeLog('save', `${type} success (${file.path})`);
          if (!originPath || type === 'save-as') _watchFile();
        } else {
          scopeLog('save', `cancel '${type}'`);
        }
        return file;
      } finally {
        actions.unlockSave();
      }
    },
    lockSave: (): void => {
      scopeLog('save.locker', 'lock');
      saveLock = true;
    },
    unlockSave: (): void => {
      scopeLog('save.locker', 'unlock');
      saveLock = false;
    },
    reset: (): void => actions.setState({ content: _state.originContent }),
    readMd: (filepath: string, win: BrowserWindow): boolean => {
      scopeLog('readMd', `read(${filepath})`);

      const md = readMDFile(win, filepath);
      if (md) {
        actions.setState(md);
        _watchFile();
      }
      return Boolean(md);
    },
    destroy() {
      scopeLog('', 'destroy');
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
export const mdManager = new WeakMap<BrowserWindow, ReturnType<typeof useMdStore>>();

export function getFocusedWinMdStore(): Promise<[ReturnType<typeof useMdStore>, BrowserWindow]> {
  return new Promise<[ReturnType<typeof useMdStore>, BrowserWindow]>((res, rej) => {
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
