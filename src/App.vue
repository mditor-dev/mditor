<script setup lang="ts">
import MdEditor from '@/components/MdEditor.vue';
import MdMenu from '@/components/MdMenu.vue';
import { ref } from 'vue';
import { ipcRenderer } from 'electron';

document.title = '未命名';

const mdData = ref('');

ipcRenderer.on('read-file', (_event, { file, filename }: { file: string; filename: string }) => {
  mdData.value = file;
  document.title = filename;
});

window.ondragstart = (event) => {
  event.preventDefault();
  (window as any).electron.startDrag('drag-and-drop-1.md');
};
</script>

<template>
  <div class="app-main">
    <section class="menu">
      <md-menu :md="mdData"></md-menu>
    </section>
    <section class="editor">
      <md-editor v-model:value="mdData"></md-editor>
    </section>
  </div>
</template>

<style lang="scss">
:root,
body {
  margin: 0;
  padding: 0;
}
.app-main {
  display: flex;
  align-items: flex-start;
  > section {
    &.menu {
      flex: 0 0 200px;
    }
    &.editor {
      flex: 1;
      overflow: hidden;
    }
  }
}
</style>
