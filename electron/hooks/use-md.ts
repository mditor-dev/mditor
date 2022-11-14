import { BrowserWindow, ipcMain } from 'electron';
import { MDFile } from '../../types/interfaces';
import { updateObj } from '@mxssfd/core';

export function useMd(win: BrowserWindow) {
  const _state: MDFile = {
    name: '',
    path: '',
    originContent: '',
    content: '',
  };

  ipcMain.on('test', (_, v) => {
    console.log('test', v);
  });

  function setState(state: Partial<MDFile>) {
    updateObj(_state, state);
    win.setDocumentEdited(isModify());
    win.webContents.send('md-store:update', _state);
    win.webContents.send('test', '111');
  }

  win.webContents.ipc.on('md-store:update', (_, md: MDFile) => {
    console.log('md-store:update');
    updateObj(_state, md);
    win.setDocumentEdited(isModify());
  });

  const isModify = () => _state.originContent !== _state.content;

  return { state: _state, setState, isModify };
}
