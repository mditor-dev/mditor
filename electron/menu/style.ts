import { MenuItem, BrowserWindow, MenuItemConstructorOptions } from 'electron';
import { isMac } from '../utils/platform';
export function getStyleMenu(): MenuItem {
  const separator: MenuItemConstructorOptions = { type: 'separator' };
  const exec = (name: string, payload?: Record<string, any>) => () =>
    BrowserWindow.getFocusedWindow()?.webContents.send('editor:command', { name, payload });
  // 段落菜单
  return new MenuItem({
    id: 'StyleMenu',
    label: isMac ? '格式' : '格式(S)(&S)',
    submenu: [
      {
        label: '加粗',
        accelerator: 'CommandOrControl+Alt+b',
        click: exec('bold'),
      },
      {
        label: '斜体',
        accelerator: 'CommandOrControl+Alt+i',
        click: exec('italic'),
      },
      {
        label: '删除线',
        accelerator: 'CommandOrControl+Alt+d',
        click: exec('strike'),
      },
      {
        label: '注释',
        accelerator: 'CommandOrControl+/',
        click: exec('comment'),
      },
      {
        label: '行内代码块',
        accelerator: 'CommandOrControl+Alt+`',
        click: exec('code'),
      },
      separator,
      {
        label: '链接',
        accelerator: 'CommandOrControl+Alt+l',
        click: exec('addLink', { linkUrl: 'https://', linkText: '链接' }),
      },
      {
        label: '图形',
        accelerator: 'CommandOrControl+Alt+p',
        click: exec('addImage', { imageUrl: 'https://', altText: '图片说明' }),
      },
    ],
  });
}
