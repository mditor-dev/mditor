import { MenuItem, BrowserWindow } from 'electron';
import { isMac } from '../utils/platform';
export function getEditMenu(getWin: () => BrowserWindow | null): MenuItem {
  // 编辑菜单
  return new MenuItem({
    id: 'EditMenu',
    label: isMac ? '编辑' : '编辑(E)(&E)',
    submenu: [
      {
        label: '撤回',
        role: 'undo',
        accelerator: 'CommandOrControl+z',
      },
      {
        label: '重做',
        role: 'redo',
        accelerator: isMac ? 'Command+Shift+z' : 'Control+y',
      },
      {
        type: 'separator',
      },

      {
        label: '剪切',
        role: 'cut',
        accelerator: 'CommandOrControl+x',
      },
      {
        label: '拷贝',
        role: 'copy',
        accelerator: 'CommandOrControl+c',
      },
      {
        label: '粘贴',
        role: 'paste',
        accelerator: 'CommandOrControl+v',
      },
      {
        type: 'separator',
      },

      {
        label: '格式化',
        accelerator: 'CommandOrControl+Shift+f',
        click() {
          getWin()?.webContents.send('format-md');
        },
      },
    ],
  });
}
