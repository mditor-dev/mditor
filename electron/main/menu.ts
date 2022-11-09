import { Menu, dialog, BrowserWindow, MenuItem } from 'electron';
import { readMDFile } from '../utils/file';
import { isMac } from '../utils/platform';

export function setMenu(win: BrowserWindow) {
  const isDev = process.env['npm_lifecycle_event'] === 'dev';
  const oldMenu = Menu.getApplicationMenu() as Menu;
  oldMenu.items.forEach((menu) => {
    menu.id = menu.role || menu.label;
  });
  const fileMenu = oldMenu.getMenuItemById('filemenu') as MenuItem;

  const template: Array<MenuItem> = [
    new MenuItem({
      label: '打开文件',
      accelerator: isMac() ? 'Meta+o' : 'Control+o',
      async click() {
        const { filePaths, canceled } = await dialog.showOpenDialog({
          filters: [
            { name: 'Markdown', extensions: ['md'] },
            { name: 'Plain Text', extensions: [''] },
          ],
        });
        if (canceled) return;

        const [filePath] = filePaths as [string];
        readMDFile(win, filePath);
      },
    }),
    new MenuItem({
      label: '打开最近文件',
      role: 'recentDocuments',
      submenu: [
        {
          label: 'Clear Recent',
          role: 'clearRecentDocuments',
        },
      ],
    }),
  ];

  const fileMenuSub = fileMenu.submenu as Menu;
  for (let i = template.length - 1; i >= 0; i--) {
    const item = template[i as keyof typeof template] as MenuItem;
    fileMenuSub.insert(0, item);
  }
  if (!isDev) {
    const viewMenu = oldMenu.getMenuItemById('viewmenu') as MenuItem;
    ((viewMenu.submenu as Menu).items[2] as MenuItem).visible = false;
  }
  const menu = Menu.buildFromTemplate(oldMenu.items);
  Menu.setApplicationMenu(menu);
}
