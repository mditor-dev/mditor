import { defineStore } from 'pinia';
import { ipcRenderer } from 'electron';
import { MDFile } from '../../types/interfaces';
import { computed, reactive, toRefs, watch } from 'vue';
import prettier from 'prettier';
import parserMD from 'prettier/esm/parser-markdown.mjs';
import parserTs from 'prettier/esm/parser-typescript.mjs';
import parserBabel from 'prettier/esm/parser-babel.mjs';
import parserHTML from 'prettier/esm/parser-html.mjs';
import parserAngular from 'prettier/esm/parser-angular.mjs';
import parserFlow from 'prettier/esm/parser-flow.mjs';
import parserGraphql from 'prettier/esm/parser-graphql.mjs';
import parserPostcss from 'prettier/esm/parser-postcss.mjs';
import parserYaml from 'prettier/esm/parser-yaml.mjs';
import { updateObj } from '@tool-pack/basic';

let isWatched = false;
export const useMarkdownStore = defineStore('md-file-store', () => {
  const state = reactive({ name: '', originContent: '', content: '', path: '' });

  const isModify = computed(() => {
    const { content, path, originContent } = state;
    if (!path) return Boolean(content);
    return originContent !== content;
  });

  watch(
    state,
    (n) => {
      if (n.name) {
        document.title = n.name + (isModify.value ? ' - 已编辑*' : '');
      } else {
        document.title = '未命名' + (isModify.value ? ' - 已编辑*' : '');
      }
    },
    { immediate: true },
  );

  let isFromIpcMain = false;
  watch(state, (n) => {
    if (!isFromIpcMain) {
      ipcRenderer.send('md-store:update', { ...n });
    }
    isFromIpcMain = false;
  });

  const actions = {
    onDrop(event: DragEvent): void {
      const dt = event.dataTransfer;
      if (!dt) return;
      event.preventDefault();
      event.stopPropagation();

      // 可以拖放多个文件
      const file = dt.files[0];
      if (!file) return;

      const fr = new FileReader();
      fr.onload = (e) => {
        if (!e.target) return;

        state.content = e.target.result as string;
        state.originContent = state.content;
        state.path = file.path;
        state.name = file.name;

        ipcRenderer.send('drop-file', file.path);
      };
      fr.readAsText(file);
    },
  };

  function addListener(): void {
    if (isWatched) return;
    isWatched = true;

    ipcRenderer.on('md-store:update', (_, md: MDFile) => {
      isFromIpcMain = true;
      updateObj(state, md);
    });

    // 格式化markdown
    ipcRenderer.on('md-store:format', () => {
      state.content = prettier.format(state.content, {
        parser: 'markdown',
        plugins: [
          parserMD,
          parserTs,
          parserHTML,
          parserBabel,
          parserAngular,
          parserFlow,
          parserGraphql,
          parserPostcss,
          parserYaml,
        ],

        // 以下来自.prettierrc.js

        // 一行最多 100 字符
        printWidth: 100,
        // 使用 2 个空格缩进
        tabWidth: 2,
        // 不使用缩进符使用空格
        useTabs: false,
        // 行尾需要有分号
        semi: true,
        // 使用单引号
        singleQuote: true,
        // 对象的 key 仅在必要时用引号
        quoteProps: 'as-needed',
        // jsx 不使用单引号，而使用双引号
        jsxSingleQuote: false,
        // 尾随逗号
        trailingComma: 'all',
        // 大括号内的首尾需要空格
        bracketSpacing: true,
        // jsx 标签的反尖括号需要换行
        jsxBracketSameLine: false,
        // 箭头函数，只有一个参数的时候，也需要括号
        arrowParens: 'always',
        // 使用默认的折行标准
        proseWrap: 'preserve',
        // 根据显示样式决定 html 要不要折行
        htmlWhitespaceSensitivity: 'css',
        // 换行符使用 auto
        endOfLine: 'auto',
      });
    });
  }

  addListener();

  return { ...toRefs(state), ...actions };
});
