import { rmSync } from 'fs';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import electron from 'vite-electron-plugin';
import { customStart, loadViteEnv } from 'vite-electron-plugin/plugin';
import renderer from 'vite-plugin-electron-renderer';
import pkg from './package.json';
import { resolve } from 'path';

rmSync('dist-electron', { recursive: true, force: true });

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    electron({
      include: ['electron'],
      transformOptions: {
        sourcemap: !!process.env['VSCODE_DEBUG'],
      },
      plugins: [
        ...(process.env['VSCODE_DEBUG']
          ? [
              // Will start Electron via VSCode Debug
              customStart(
                debounce(() =>
                  console.log(/* For `.vscode/.debug.script.mjs` */ '[startup] Electron App'),
                ),
              ),
            ]
          : []),
        // Allow use `import.meta.env.VITE_SOME_KEY` in Electron-Main
        loadViteEnv(),
      ],
    }),
    // Use Node.js API in the Renderer-process
    renderer({
      nodeIntegration: true,
    }),
  ],
  server: process.env['VSCODE_DEBUG']
    ? (() => {
        const url = new URL(pkg.debug.env.VITE_DEV_SERVER_URL);
        return {
          host: url.hostname,
          port: +url.port,
        };
      })()
    : undefined,
  clearScreen: false,
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  css: {
    // dev时生成sourcemap
    devSourcemap: true,
    preprocessorOptions: {
      scss: {
        // 这样就能全局使用 src/common/styles/variable.scss 定义的 变量
        // 注意⚠️：只导入变量或函数，公共类不要这样导入，建议用@improt的方式导入，否则每一个scoped组件都会生成一个公共类
        // additionalData: `@import "src/common/styles/variable.scss";`,
        // build时不能生成sourcemap
        // sourceMap: {},
      },
    },
  },
  build: {
    assetsDir: '', // #287
  },
});

function debounce<Fn extends (...args: any[]) => void>(fn: Fn, delay = 299) {
  let t: NodeJS.Timeout;
  return ((...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  }) as Fn;
}
