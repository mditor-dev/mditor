<script setup lang="ts">
import { PropType, ref, toRefs, watch } from 'vue';
import { throttle } from '@mxssfd/ts-utils';
import { MDDirectory } from '../../types/interfaces';

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

const menuRef = ref();
const ulRef = ref();
function scrollTo(index: number) {
  if (!props.directory?.length) return;
  const target = (ulRef.value as HTMLUListElement).children[index];

  if (!target) return;

  menuRef.value.scrollTo({ top: (target as HTMLLIElement).offsetTop - 150, behavior: 'smooth' });
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
</script>
<template>
  <div ref="menuRef" class="md-menu">
    <ul ref="ulRef">
      <li
        v-for="(item, index) in directory"
        :key="item.value + item.level"
        :class="{ ['level-' + item.level]: true, active: index === activeTitleIndex }"
        :data-level="'#'.repeat(item.level)"
        :data-value="item.value"
        @click="editorScrollTo(index)"
        v-html="item.value"
      ></li>
    </ul>
  </div>
</template>

<style lang="scss" scoped>
.md-menu {
  padding: 10px;
  height: 100vh;
  box-sizing: border-box;
  overflow: auto;
  ul {
    margin: 0;
    padding: 0;
  }
  ul,
  li {
    list-style: none;
  }
  li {
    padding: 4px 0;
    cursor: pointer;
    word-break: break-all;
    &.active {
      color: #8c06b8;
    }
    &:hover {
      color: #4b96e6;
      &::before {
        display: initial;
      }
    }
  }
  @for $i from 0 through 5 {
    .level-#{$i + 1} {
      padding-left: $i * 4px;
      font-size: (20px - $i);
      $color: lighten(black, 15% * $i);
      color: $color;
      &::before {
        display: none;
        margin-right: 2px;
        content: attr(data-level);
      }
    }
  }
}
</style>
