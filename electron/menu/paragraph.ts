import { MenuItem, BrowserWindow, MenuItemConstructorOptions } from 'electron';
import { isMac } from '../utils/platform';
export function getParagraphMenu(): MenuItem {
  const separator: MenuItemConstructorOptions = { type: 'separator' };
  const exec = (name: string, payload?: Record<string, any>) => () =>
    BrowserWindow.getFocusedWindow()?.webContents.send('editor:command', { name, payload });
  // 段落菜单
  return new MenuItem({
    id: 'ParagraphMenu',
    label: isMac ? '段落' : '段落(P)(&P)',
    submenu: [
      ...['一', '二', '三', '四', '五', '六'].map((num, index) => {
        const level = index + 1;
        return {
          label: num + '级标题',
          accelerator: 'CommandOrControl+' + level,
          click: exec('heading', { level: level }),
        };
      }),
      separator,
      {
        label: '段落',
        accelerator: 'CommandOrControl+0',
        click: exec('heading', { level: 0 }),
      },
      separator,
      {
        label: '表格',

        submenu: [
          {
            label: '插入表格',
            accelerator: 'CommandOrControl+Alt+t',
            click: exec('addTable', { rowCount: 2, columnCount: 2 }),
          },
          separator,
          {
            label: '上方插入行',
            accelerator: 'CommandOrControl+Alt+Up',
            click: exec('addRowToUp'),
          },
          {
            label: '下方插入行',
            accelerator: 'CommandOrControl+Alt+Down',
            click: exec('addRowToDown'),
          },
          separator,
          {
            label: '左侧插入列',
            accelerator: 'CommandOrControl+Alt+Left',
            click: exec('addColumnToLeft'),
          },
          {
            label: '右侧侧插入列',
            accelerator: 'CommandOrControl+Alt+Right',
            click: exec('addColumnToRight'),
          },
          separator,
          {
            label: '左对齐',
            click: exec('alignColumn', { align: 'left' }),
          },
          {
            label: '居中对齐',
            click: exec('alignColumn'),
          },
          {
            label: '右对齐',

            click: exec('alignColumn', { align: 'right' }),
          },
          separator,
          {
            label: '删除行',
            click: exec('removeRow'),
          },
          {
            label: '删除列',
            click: exec('removeColumn'),
          },
          separator,
          {
            label: '删除表格',
            click: exec('removeTable'),
          },
        ],
      },
      separator,
      {
        label: '代码块',
        accelerator: 'CommandOrControl+Alt+C',
        click: exec('codeBlock'),
      },
      {
        label: '引用',
        accelerator: 'CommandOrControl+Alt+q',
        click: exec('blockQuote'),
      },
      separator,
      {
        label: '有序列表',
        accelerator: 'CommandOrControl+Alt+o',
        click: exec('orderedList'),
      },
      {
        label: '无序列表',
        accelerator: 'CommandOrControl+Alt+u',
        click: exec('bulletList'),
      },
      {
        label: '任务列表',
        accelerator: 'CommandOrControl+Alt+x',
        click: exec('taskList'),
      },
      separator,
      {
        label: '水平分割线',
        accelerator: 'CommandOrControl+Alt+-',
        click: exec('hr'),
      },
      {
        label: 'Custom Block',
        accelerator: 'CommandOrControl+Alt+m',
        click: exec('customBlock', { info: 'myCustom' }),
      },
    ],
  });
}
