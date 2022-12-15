import { MenuItem, BrowserWindow } from 'electron';
import { isMac } from '../utils/platform';
export function getEditMenu(): MenuItem {
  // 编辑菜单
  return new MenuItem({
    id: 'EditMenu',
    role: 'editMenu',
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
        label: '删除行',
        accelerator: 'CommandOrControl+d',
      },
      {
        type: 'separator',
      },
      {
        label: '格式化',
        accelerator: 'CommandOrControl+Shift+f',
        click() {
          BrowserWindow.getFocusedWindow()?.webContents.send('md-store:format');
        },
      },
    ],
  });
}
