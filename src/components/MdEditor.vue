<script setup lang="ts">
import { Editor } from '@toast-ui/editor';
import codeSyntaxHighlight from '@toast-ui/editor-plugin-code-syntax-highlight';
import colorSyntax from '@toast-ui/editor-plugin-color-syntax';
import Prism from 'prismjs';
import tableMergedCell from '@toast-ui/editor-plugin-table-merged-cell';
import '@toast-ui/editor/dist/toastui-editor.css';
import '@toast-ui/editor-plugin-code-syntax-highlight/dist/toastui-editor-plugin-code-syntax-highlight.css';
import '@toast-ui/editor-plugin-color-syntax/dist/toastui-editor-plugin-color-syntax.css';
import '@/assets/toastui-color-syntax.scss';
import '@toast-ui/editor/dist/theme/toastui-editor-dark.css';
import 'prismjs/themes/prism.min.css';
import '@toast-ui/editor/dist/i18n/zh-cn';
import { debounce } from '@mxssfd/ts-utils';

import { ipcRenderer } from 'electron';
import { onMounted, onUnmounted, ref, watch, defineExpose } from 'vue';
import { MDDirectory } from '../../types/interfaces';
import { useStore } from '@/store';
import { useMarkdownStore } from '@/store/markdown';
import { useKeymap } from '@/utils/useKeymap';
import { isMac } from '@/utils';

const emits = defineEmits(['scroll', 'directory']);

const editorDomRef = ref<HTMLElement>();

const store = useStore();
const mdStore = useMarkdownStore();

function getHeight() {
  return window.innerHeight + 'px';
}

type EditorMode = 'wysiwyg' | 'markdown';

let editor: Editor;
let lastHeadingList: HTMLElement[];
let lastGetHeadingListTime = Date.now();

function getEditorMode(): EditorMode {
  return editor.isWysiwygMode() ? 'wysiwyg' : 'markdown';
}

const getHeadingList = (): HTMLElement[] => {
  const now = Date.now();
  // 节流避免滚动时不停的获取节点
  if (now - lastGetHeadingListTime < 50) return lastHeadingList;
  lastGetHeadingListTime = now;

  const mode = getEditorMode();

  // eslint-disable-next-line no-undef
  let headingList: NodeListOf<HTMLElement>;
  if (mode === 'markdown') {
    headingList = (editorDomRef.value as HTMLDivElement).querySelectorAll<HTMLSpanElement>(
      '.toastui-editor-md-heading',
    );
  } else {
    headingList = (editorDomRef.value as HTMLDivElement).querySelectorAll<HTMLHeadingElement>(
      [...Array(6).keys()]
        .map((i) => '.ProseMirror.toastui-editor-contents > h' + (i + 1))
        .join(','),
    );
  }
  const result = [...headingList];
  lastHeadingList = result;
  return result;
};

const emitMdDirectory = debounce(() => {
  const list = getHeadingList();
  const mode = getEditorMode();

  const getLevel =
    mode === 'wysiwyg'
      ? (dom: HTMLElement) => dom.tagName.replace(/H/i, '')
      : (dom: HTMLElement) => /toastui-editor-md-heading(\d)/.exec(dom.className)?.[1] || '';

  const dir: MDDirectory[] = list.map((item) => ({
    level: Number(getLevel(item)),
    value: item.innerText.replace(/^#+\s?/, ''),
  }));

  emits('directory', dir);
}, 200);

function scrollToElement(index: number) {
  const headingList = getHeadingList();
  if (!headingList || !headingList.length) return;

  const target = headingList[index];
  if (!target) return;

  editor.setScrollTop(target.offsetTop - 10);
}

defineExpose({ scrollToElement });

watch(mdStore, (n) => {
  if (!editor) return;
  if (n.content !== editor.getMarkdown()) {
    editor.setMarkdown(n.content);
    setTimeout(() => {
      editor.setScrollTop(0);
      editor.focus();
    }, 50);
  }
});

const listener = () => {
  editor.setHeight(getHeight());
};
window.addEventListener('resize', listener);
onUnmounted(() => {
  window.removeEventListener('resize', listener);
});

function setTheme() {
  const editorDom: any = editorDomRef.value;
  if (store.theme === 'dark') {
    editorDom.classList.add('toastui-editor-dark');
  } else {
    editorDom.classList.remove('toastui-editor-dark');
  }
}
watch(() => store.theme, setTheme);

onMounted(() => {
  editor = new Editor({
    el: editorDomRef.value as HTMLElement,
    previewStyle: 'vertical',
    height: getHeight(),
    language: 'zh-CN',
    usageStatistics: true,
    useCommandShortcut: false,
    initialValue: mdStore.content,
    plugins: [[codeSyntaxHighlight, { highlighter: Prism }], colorSyntax, tableMergedCell],
  });

  setTheme();

  editor.on('change', () => {
    mdStore.content = editor.getMarkdown();
    emitMdDirectory();
  });

  editor.on('scroll', function () {
    const headingList = getHeadingList();
    if (!headingList) return;

    const scrollTop = editor.getScrollTop();
    const height = parseInt(editor.getHeight());
    const hlLen = headingList.length;
    const index = headingList.findIndex((item, index) => {
      if (index === hlLen - 1) return true;
      const { offsetTop } = item;
      const nextOffsetTop = (headingList[index + 1] as HTMLElement).offsetTop;
      // 如果是在top在屏幕内，或者比较高的内容
      return offsetTop - scrollTop > 0 || nextOffsetTop - scrollTop > height / 2;
    });
    if (index === -1) return;
    // const innerText = find.innerText.replace(/#+\s?/, '');
    emits('scroll', index);
  });

  function exec(name: string, payload?: Record<string, any>) {
    return () => editor.exec(name, payload);
  }

  const keymap = useKeymap(
    [
      { desc: '回退', keys: 'MetaOrControl+z', handler: exec('undo') },
      { desc: '前进', keys: isMac() ? 'Meta+Shift+z' : 'Control+y', handler: exec('redo') },
      // { desc: '保存文件', keys: 'MetaOrControl+s', handler: saveFile },
      // { desc: 'test', keys: 'MetaOrControl+1', handler: exec('heading', { level: 1 }) },
    ],
    editorDomRef.value as HTMLDivElement,
  );
  keymap.add({
    desc: '控制台打印快捷键映射',
    keys: 'MetaOrControl+l',
    handler() {
      keymap.log();
    },
  });

  ipcRenderer.on(
    'editor:command',
    (_, { name, payload }: { name: string; payload?: Record<string, any> }) => {
      if (getEditorMode() === 'markdown' && name !== 'addTable' && /row|column/i.test(name)) {
        alert('该操作只支持所见即所得模式');
        return;
      }
      editor.exec(name, payload);
    },
  );
});

const isShowClick = () => {
  store.setIsShowCatalogue(!store.isShowCatalogue);
};
</script>
<template>
  <div class="md-editor">
    <div ref="editorDomRef" class="editor-wrapper"></div>
    <img src="../assets/mulu.svg" alt="打开目录" class="isShow" @click="isShowClick" />
  </div>
</template>

<style lang="scss">
.md-editor {
  position: relative;
  box-sizing: border-box;
  .toastui-editor-defaultUI {
    border-radius: 0;
  }
  .isShow {
    position: absolute;
    width: 25px;
    bottom: 2px;
    left: 5px;
    color: rgb(138, 138, 138);
    cursor: pointer;
    &:hover {
      filter: contrast(0);
    }
  }
}
</style>
