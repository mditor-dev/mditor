import { Menu, dialog, BrowserWindow, MenuItem, nativeTheme } from 'electron';
import { readMDFile } from '../utils/file';
import { clearRecentDocument } from '../utils/app-config';

export function setMenu(getWin: () => BrowserWindow | null) {
  const isDev = process.env['npm_lifecycle_event'] === 'dev';
  const oldMenu = Menu.getApplicationMenu() as Menu;
  oldMenu.items.forEach((menu) => {
    menu.id = menu.role || menu.label;
  });
  const fileMenu = oldMenu.getMenuItemById('filemenu') as MenuItem;

  const template: Array<MenuItem> = [
    new MenuItem({
      label: '打开文件',
      accelerator: 'CommandOrControl+o',
      async click() {
        const win = getWin();
        if (!win) return;
        const { filePaths, canceled } = await dialog.showOpenDialog(win, {
          filters: [
            { name: 'Markdown', extensions: ['md'] },
            { name: 'Plain Text', extensions: [''] },
          ],
        });
        if (canceled) return;

        const [filePath] = filePaths as [string];
        readMDFile(getWin(), filePath);
      },
    }),
    new MenuItem({
      label: '另存为',
      accelerator: 'CommandOrControl+Shift+s',
      async click() {
        getWin()?.webContents.send('save-as');
      },
    }),
    new MenuItem({
      label: '打开最近文件',
      role: 'recentDocuments',
      submenu: [
        {
          label: 'Clear Recent',
          role: 'clearRecentDocuments',
          click() {
            clearRecentDocument();
          },
        },
      ],
    }),
  ];

  // 主题切换菜单
  oldMenu.insert(
    5,
    new MenuItem({
      label: 'Theme',
      submenu: [
        {
          label: 'light',
          click() {
            nativeTheme.themeSource = 'light';
            getWin()?.webContents.send('changeTheme', 'light');
          },
        },
        {
          label: 'dark',
          click() {
            nativeTheme.themeSource = 'dark';
            getWin()?.webContents.send('changeTheme', 'dark');
          },
        },
      ],
    }),
  );

  const fileMenuSub = fileMenu.submenu as Menu;
  for (let i = template.length - 1; i >= 0; i--) {
    const item = template[i as keyof typeof template] as MenuItem;
    fileMenuSub.insert(0, item);
  }

  const editMenu = oldMenu.getMenuItemById('editmenu') as MenuItem;

  editMenu.submenu?.insert(
    0,
    new MenuItem({
      label: '格式化',
      accelerator: 'CommandOrControl+Shift+f',
      click() {
        getWin()?.webContents.send('format-md');
      },
    }),
  );

  console.log('1', editMenu);

  if (!isDev) {
    const viewMenu = oldMenu.getMenuItemById('viewmenu') as MenuItem;
    ((viewMenu.submenu as Menu).items[2] as MenuItem).visible = false;
  }
  const menu = Menu.buildFromTemplate(oldMenu.items);
  Menu.setApplicationMenu(menu);
}
