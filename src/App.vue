<script setup lang="ts">
import MdEditor from '@/components/MdEditor.vue';
import { ref } from 'vue';
import { ipcRenderer } from 'electron';

document.title = '未命名';

const mdData = ref('');

ipcRenderer.on('read-file', (event, { file, filename }: { file: string; filename: string }) => {
  mdData.value = file;
  document.title = filename;
});

window.ondragstart = (event) => {
  event.preventDefault();
  (window as any).electron.startDrag('drag-and-drop-1.md');
};
</script>

<template>
  <div>
    <MdEditor v-model:value="mdData"></MdEditor>
  </div>
</template>

<style>
:root,
body {
  margin: 0;
  padding: 0;
}
</style>
