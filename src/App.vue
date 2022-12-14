<script setup lang="ts">
import MdEditor from '@/components/MdEditor.vue';
import MdDirectory from '@/components/MdDirectory.vue';
import { ref } from 'vue';
import { MDDirectory } from '../types/interfaces';
import { useStore } from '@/store';
import { isMac } from '@/utils';
import { ipcRenderer } from 'electron';

const store = useStore();
const editorRef = ref();
const activeTitleIndex = ref(0);
const directory = ref<MDDirectory[]>([]);
// const theme = ref('');

// // 暂定
// ipcRenderer.on('changeTheme', (event, value) => {
//   console.log(event, value);
//   theme.value = value;
// });

if (isMac()) {
  document.documentElement.classList.add('mac');
}
function onDrop(event: DragEvent): void {
  const dt = event.dataTransfer;
  if (!dt) return;
  event.preventDefault();
  event.stopPropagation();

  if (!dt.files.length) return;

  const ext = ['md', 'mdc', 'mdown', 'mdtext', 'mdtxt', 'mmd'];
  const files = Array.prototype.filter
    .call(dt.files, (file: File) => {
      const end = file.name.split('.').at(-1) as string;
      return end === file.name || ext.includes(end);
    })
    .map((file) => file.path);

  ipcRenderer.send('drop-file', files);
}
</script>

<template>
  <div class="app-main" @drop.stop.prevent="onDrop" @dragover.stop.prevent>
    <Transition name="dir">
      <section v-show="store.directoryVisible" class="directory">
        <md-directory
          :active-title-index="activeTitleIndex"
          :directory="directory"
          @scroll-to="editorRef.scrollToElement($event)"
        ></md-directory>
      </section>
    </Transition>
    <section class="editor">
      <md-editor
        ref="editorRef"
        @scroll="activeTitleIndex = $event"
        @directory="directory = $event"
      ></md-editor>
      <img
        :title="store.directoryVisible ? '隐藏目录' : '显示目录'"
        src="./assets/mulu.svg"
        alt="打开目录"
        class="btn-directory-visible"
        @click="store.toggleDirectoryVisible"
      />
    </section>
  </div>
</template>

<style lang="scss">
.app-main {
  display: flex;
  align-items: flex-start;
  > section {
    &.directory {
      width: 200px;
      > * {
        width: 200px;
      }
    }
    &.editor {
      position: relative;
      flex: 1;
      overflow: hidden;
    }
  }
  .btn-directory-visible {
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

.dir-enter-active,
.dir-leave-active {
  transition: all 0.3s ease-in-out;
  > * {
    transition: all 0.2s ease-in-out;
  }
}

.dir-enter-from,
.dir-leave-to {
  width: 0 !important;
  opacity: 0;
  > * {
    transform: translateX(-20px);
    opacity: 0;
  }
}
</style>
