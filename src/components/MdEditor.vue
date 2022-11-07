<script setup lang="ts">
import { Editor } from '@toast-ui/editor';
import codeSyntaxHighlight from '@toast-ui/editor-plugin-code-syntax-highlight';
import colorSyntax from '@toast-ui/editor-plugin-color-syntax';
import Prism from 'prismjs';
import tableMergedCell from '@toast-ui/editor-plugin-table-merged-cell';
import '@toast-ui/editor/dist/toastui-editor.css';
import '@toast-ui/editor-plugin-code-syntax-highlight/dist/toastui-editor-plugin-code-syntax-highlight.css';
import '@toast-ui/editor-plugin-color-syntax/dist/toastui-editor-plugin-color-syntax.css';
import 'prismjs/themes/prism.min.css';
import '@toast-ui/editor/dist/i18n/zh-cn';

import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { ipcRenderer } from 'electron';

const props = defineProps({ value: { type: String, default: '' } });
const emits = defineEmits(['update:value']);

const editorDomRef = ref();
const mdData = computed({
  get: () => props.value,
  set: (v: string) => emits('update:value', v),
});

function getHeight() {
  return window.innerHeight - 2 + 'px';
}

function saveFile() {
  ipcRenderer.send('save-file', { file: mdData.value, filename: '' });
}

onMounted(() => {
  const editor = new Editor({
    el: editorDomRef.value,
    previewStyle: 'vertical',
    height: getHeight(),
    language: 'zh-CN',
    usageStatistics: true,
    useCommandShortcut: false,
    initialValue: mdData.value,
    plugins: [[codeSyntaxHighlight, { highlighter: Prism }], colorSyntax, tableMergedCell],
  });

  editor.changeMode('wysiwyg');
  editor.on('change', () => {
    mdData.value = editor.getMarkdown();
  });

  watch(mdData, (n) => {
    if (n !== editor.getMarkdown()) editor.setMarkdown(n);
  });

  function exec(name: string) {
    return () => editor.exec(name);
  }

  function keymap(dom: HTMLElement, map: { map: string[]; handler: Function }[]) {
    const keySet = new Set<string>();
    map.forEach((item) => (item.map = item.map.map((it) => it.toLowerCase())));

    const keydownHandler = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      keySet.add(key);
      map.forEach((item) => {
        if (item.map.every((k) => keySet.has(k))) {
          item.handler();
        }
      });
      console.log(keySet);
    };

    const keyupHandler = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      console.log('keyup', key);
      keySet.delete(key);
      // 在mac中按下meta组合键后释放其他按键会漏掉事件
      if (key === 'meta') keySet.clear();
    };

    const blurHandler = () => keySet.clear();

    dom.addEventListener('keydown', keydownHandler);
    dom.addEventListener('keyup', keyupHandler);
    window.addEventListener('blur', blurHandler);
    return function () {
      dom.removeEventListener('keydown', keydownHandler);
      dom.removeEventListener('keyup', keyupHandler);
      window.removeEventListener('blur', blurHandler);
    };
  }

  keymap(editorDomRef.value, [
    // 回退
    { map: ['Meta', 'z'], handler: exec('undo') },
    { map: ['Control', 'z'], handler: exec('undo') },
    // 前进
    { map: ['Meta', 'Shift', 'z'], handler: exec('redo') },
    { map: ['Control', 'Shift', 'z'], handler: exec('redo') },
    // 保存文件
    { map: ['Meta', 's'], handler: saveFile },
    { map: ['Control', 's'], handler: saveFile },
  ]);

  const listener = () => {
    editor.setHeight(getHeight());
  };
  window.addEventListener('resize', listener);
  onUnmounted(() => {
    window.removeEventListener('resize', listener);
  });
});
</script>
<template>
  <div class="md-editor">
    <div ref="editorDomRef" class="editor-wrapper"></div>
  </div>
</template>

<style>
.md-editor {
  box-sizing: border-box;
}

.editor-wrapper {
  /*overflow: hidden;*/
}

.tui-colorpicker-slider-left {
  float: left;
  width: 120px;
  height: 120px;
}

/*!
 * TOAST UI Color Picker
 * @version 2.2.6
 * @author NHN FE Development Team <dl_javascript@nhn.com>
 * @license MIT
 */
.tui-colorpicker-clearfix {
  zoom: 1;
}

.tui-colorpicker-clearfix:after {
  content: '';
  display: block;
  clear: both;
}

.tui-colorpicker-container {
  width: 152px;
}

.tui-colorpicker-palette-container {
  width: 152px;
}

.tui-colorpicker-palette-container ul {
  width: 152px;
  margin: 0;
  padding: 0;
}

.tui-colorpicker-palette-container li {
  float: left;
  margin: 0;
  padding: 0 3px 3px 0;
  list-style: none;
}

.tui-colorpicker-palette-button {
  display: block;
  overflow: hidden;
  outline: none;
  margin: 0;
  padding: 0;
  width: 16px;
  height: 16px;
  border: 1px solid #ccc;
  cursor: pointer;
}

.tui-colorpicker-palette-button.tui-colorpicker-selected {
  border: 2px solid #000;
}

.tui-colorpicker-palette-hex {
  font-family: monospace;
  display: inline-block;
  *display: inline;
  zoom: 1;
  width: 60px;
  vertical-align: middle;
}

.tui-colorpicker-palette-preview {
  display: inline-block;
  *display: inline;
  zoom: 1;
  width: 12px;
  height: 12px;
  border: 1px solid #ccc;
  border: 1px solid #ccc;
  vertical-align: middle;
  overflow: hidden;
}

.tui-colorpicker-palette-toggle-slider {
  display: inline-block;
  *display: inline;
  zoom: 1;
  vertical-align: middle;
  float: right;
}

.tui-colorpicker-slider-container {
  margin: 5px 0 0 0;
  height: 122px;
  zoom: 1;
}

.tui-colorpicker-slider-container:after {
  content: '';
  display: block;
  clear: both;
}

.tui-colorpicker-slider-left {
  float: left;
  width: 120px;
  height: 120px;
}

.tui-colorpicker-slider-right {
  float: right;
  width: 32px;
  height: 120px;
}

.tui-colorpicker-svg {
  display: block;
}

.tui-colorpicker-slider-handle {
  position: absolute;
  overflow: visible;
  top: 0;
  left: 0;
  width: 1px;
  height: 1px;
  z-index: 2;
  opacity: 0.9;
}

.tui-colorpicker-svg-slider {
  width: 120px;
  height: 120px;
  border: 1px solid #ccc;
  overflow: hidden;
}

.tui-colorpicker-vml-slider {
  position: relative;
  width: 120px;
  height: 120px;
  border: 1px solid #ccc;
  overflow: hidden;
}

.tui-colorpicker-vml-slider-bg {
  position: absolute;
  margin: -1px 0 0 -1px;
  top: 0;
  left: 0;
  width: 122px;
  height: 122px;
}

.tui-colorpicker-svg-huebar {
  float: right;
  width: 18px;
  height: 120px;
  border: 1px solid #ccc;
  overflow: visible;
}

.tui-colorpicker-vml-huebar {
  width: 32px;
  position: relative;
}

.tui-colorpicker-vml-huebar-bg {
  position: absolute;
  top: 0;
  right: 0;
  width: 18px;
  height: 121px;
}
</style>
