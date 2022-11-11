<script setup lang="ts">
import MdEditor from '@/components/MdEditor.vue';
import MdDirectory from '@/components/MdDirectory.vue';
import { ref, watch } from 'vue';
import { MDDirectory } from '../types/interfaces';
import { useStore } from '@/store';
import { useMarkdownStore } from '@/store/markdown';

const mdStore = useMarkdownStore();
const store = useStore();
const isShowClass = ref<string>('');
const editorRef = ref();
const activeTitleIndex = ref(0);
const directory = ref<MDDirectory[]>([]);
// const theme = ref('');

// // 暂定
// ipcRenderer.on('changeTheme', (event, value) => {
//   console.log(event, value);
//   theme.value = value;
// });

watch(
  mdStore,
  (n) => {
    if (n.name) {
      document.title = n.name + (n.isModify ? '- 已编辑' : '');
    } else {
      document.title = '未命名' + (n.isModify ? '- 已编辑' : '');
    }
  },
  { immediate: true },
);

watch(
  () => store.isShowCatalogue,
  (newVal: boolean) => {
    if (newVal) {
      isShowClass.value = '';
    } else {
      isShowClass.value = 'none';
    }
  },
);
const onDrop = mdStore.onDrop.bind(mdStore);
</script>

<template>
  <div
    class="app-main"
    :class="store.theme"
    draggable="true"
    @drop.stop.prevent="onDrop"
    @dragover.stop.prevent
  >
    <section class="directory" :class="isShowClass">
      <md-directory
        :active-title-index="activeTitleIndex"
        :directory="directory"
        @scroll-to="editorRef.scrollToElement($event)"
      ></md-directory>
    </section>
    <section class="editor">
      <md-editor
        ref="editorRef"
        @scroll="activeTitleIndex = $event"
        @directory="directory = $event"
      ></md-editor>
    </section>
  </div>
</template>

<style lang="scss">
:root {
  -webkit-font-smoothing: antialiased;
}
:root,
body {
  margin: 0;
  padding: 0;
}
.app-main {
  display: flex;
  align-items: flex-start;
  > section {
    &.directory {
      flex: 0 0 260px;
    }
    &.editor {
      flex: 1;
      overflow: hidden;
    }
  }
}
.none {
  display: none;
}
</style>
