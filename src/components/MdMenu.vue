<script setup lang="ts">
import { ref, toRefs, watch } from 'vue';

const props = defineProps({
  md: {
    type: String,
    default: '',
  },
  activeTitle: {
    type: String,
    default: '',
  },
});

const emits = defineEmits(['scrollTo']);

const propsRefs = toRefs(props);

interface TitleItem {
  level: string;
  value: string;
}

const titleList = ref<TitleItem[]>([]);

function getTitleList(md: string) {
  // console.log(md);
  const reg = /(?:^|\n)(?<level>#+) (?<value>.+)/g;

  let match: RegExpExecArray | null = null;

  const titleList: TitleItem[] = [];
  while ((match = reg.exec(md))) {
    const { level, value } = match.groups as { level: string; value: string };
    titleList.push({ level, value });
  }
  return titleList;
}

function scrollTo(innerText: string) {
  emits('scrollTo', innerText);
}

watch(propsRefs.md, (n) => {
  titleList.value = getTitleList(n);
});
</script>
<template>
  <div class="md-menu">
    <ul>
      <li
        v-for="item in titleList"
        :key="item.value + item.level.length"
        :class="{ ['level-' + item.level.length]: true, active: item.value === activeTitle }"
        :data-level="item.level"
        @click="scrollTo(item.value)"
      >
        {{ item.value }}
      </li>
    </ul>
  </div>
</template>

<style lang="scss" scoped>
.md-menu {
  padding: 10px;
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
    &.active {
      color: #4b96e6;
    }
    &:hover {
      color: #009bf2;
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
