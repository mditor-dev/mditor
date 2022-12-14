<script setup lang="ts">
import MdEditor from '@/components/MdEditor.vue';
import MdDirectory from '@/components/MdDirectory.vue';
import { ref } from 'vue';
import { MDDirectory } from '../types/interfaces';
import { useStore } from '@/store';
import { useMarkdownStore } from '@/store/markdown';
import { isMac } from '@/utils';

const mdStore = useMarkdownStore();
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
</script>

<template>
  <div class="app-main" @drop.stop.prevent="mdStore.onDrop" @dragover.stop.prevent>
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
