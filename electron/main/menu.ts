import { Menu, dialog, BrowserWindow, MenuItem, app } from 'electron';
import fs from 'fs';
import * as path from 'path';

export function readFile(win: BrowserWindow, filePath: string) {
  try {
    const file = fs.readFileSync(filePath).toString();

    app.addRecentDocument(filePath);

    win.webContents.send('read-file', { file, filename: path.basename(filePath) });
  } catch (e: any) {
    dialog.showErrorBox('读取文件失败', e);
  }
}
export function setMenu(win: BrowserWindow) {
  const isDev = process.env['npm_lifecycle_event'] === 'dev';
  const oldMenu = Menu.getApplicationMenu() as Menu;
  oldMenu.items.forEach((menu) => {
    menu.id = menu.role || menu.label;
  });
  const fileMenu = oldMenu.getMenuItemById('filemenu') as MenuItem;

  const template: Array<MenuItem> = [
    new MenuItem({
      label: '打开...',
      async click() {
        const { filePaths, canceled } = await dialog.showOpenDialog({
          filters: [
            { name: 'Markdown', extensions: ['md'] },
            { name: 'Plain Text', extensions: [''] },
          ],
        });
        if (canceled) return;

        const [filePath] = filePaths as [string];
        readFile(win, filePath);
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
