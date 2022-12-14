<script setup lang="ts">
import { computed, PropType, ref, toRefs, watch } from 'vue';
import { throttle } from '@tool-pack/basic';
import MarkdownIt from 'markdown-it';
import { MDDirectory } from '../../types/interfaces';

const md = new MarkdownIt({ html: true });

const props = defineProps({
  activeTitleIndex: {
    type: Number,
    default: 0,
  },
  directory: {
    type: Array as PropType<MDDirectory[]>,
    default: () => [],
  },
});

const emits = defineEmits(['scrollTo']);

const propsRefs = toRefs(props);

const ulRef = ref();
function scrollTo(index: number) {
  if (!props.directory?.length) return;
  const target = (ulRef.value as HTMLUListElement).children[index];

  if (!target) return;

  ulRef.value.scrollTo({ top: (target as HTMLLIElement).offsetTop - 150, behavior: 'smooth' });
}

function editorScrollTo(index: number) {
  scrollTo(index);
  emits('scrollTo', index);
}

watch(
  propsRefs.activeTitleIndex,
  throttle((index: number) => {
    if (index === -1) return;
    scrollTo(index);
  }, 500),
);

const directoryList = computed(() => {
  return (props.directory as MDDirectory[]).map((item) => {
    return {
      level: item.level,
      value: md.render(item.value),
    };
  });
});
</script>
<template>
  <div class="md-directory">
    <div class="title">大纲</div>
    <ul ref="ulRef">
      <li
        v-for="(item, index) in directoryList"
        :key="index"
        :class="{ ['level-' + item.level]: true, active: index === activeTitleIndex }"
        @click="editorScrollTo(index)"
        v-html="item.value"
      ></li>
    </ul>
  </div>
</template>

<style lang="scss" scoped>
.md-directory {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  .title {
    position: relative;
    padding: 10px 0 10px;
    font-size: 14px;
    text-align: center;
  }
  ul {
    flex: 1;
    margin: 0;
    padding: 0;
    overflow: auto;
  }
  ul,
  li {
    list-style: none;
  }
  li {
    padding: 6px 10px;
    cursor: pointer;
    word-break: break-all;
    font-size: 14px;
    font-family: sans-serif;
    &.active {
      //color: #4b96e6;
      font-weight: bold;
    }
    :deep(p) {
      display: inline;
      > * {
        pointer-events: none;
      }
      code {
        color: #c1798b;
        background-color: #f9f2f4;
        padding: 2px;
        border-radius: 2px;
      }
      &:hover {
        text-decoration: underline;
      }
    }
    &:hover {
      &::before {
        display: initial;
      }
    }
  }
  @for $i from 0 through 5 {
    .level-#{$i + 1} {
      padding-left: $i * 12px + 18px;
      //font-size: (20px - $i);
      //$color: lighten(black, 15% * $i);
      //color: $color;
      &::before {
        display: none;
        margin-right: 2px;
        color: #c1798b;
        $tag: '';
        @for $j from 0 through $i {
          $tag: $tag + '#';
        }
        content: $tag;
      }
    }
  }
}
</style>
