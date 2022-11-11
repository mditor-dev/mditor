import { isMac } from '@/utils/index';

interface KeyMap {
  keys: string;
  handler: (e?: KeyboardEvent) => any;
  desc?: string;
}

type HandledKeyMap = KeyMap & { rawKeys: string; keyList: string[] };

type KeymapStrategy = 'memoryAll' | 'memoryCompose';
type Handler = (dom: HTMLElement, maps: HandledKeyMap[]) => () => void;

/**
 * 把'meta+x' 'ctrl+x'这种按键组合转成小写和分割成数组
 */
function handleKeys(keys: string): [string, string[]] {
  keys = keys.toLowerCase();
  const moc = isMac() ? 'meta' : 'control';

  function isMOC(key: string): boolean {
    const mc = 'MetaOrControl'.toLowerCase();
    const cc = 'CommandOrControl'.toLowerCase();
    return key === mc || key === cc;
  }
  function replace(key: string): string {
    if (isMOC(key)) return moc;
    return key === 'command' ? 'meta' : key;
  }
  // const keyList = keys.replace(/\+(\+)?/g, ' $1').split(' ');
  const keyList = keys.split(/(?<!\+)\+/).map((key) => replace(key));
  return [keys, keyList];
}

const keymapStrategy: Record<KeymapStrategy, Handler> = {
  // 记忆全部按下的按键
  memoryAll(dom, maps) {
    const keySet = new Set<string>();

    const keydownHandler = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      keySet.add(key);

      const find = maps.find((item) => {
        if (item.keyList.length !== keySet.size) return;
        if (!item.keyList.every((k) => keySet.has(k))) return;
        return true;
      });

      console.log('keymap', keySet);

      return find?.handler(e);
    };

    const keyupHandler = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      console.log('keymap', 'keyup', key);
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
  },
  // 只记组合键,如果是复合普通键的话是无效的，可以使用memoryAll
  memoryCompose: (function () {
    enum ComposeKey {
      meta = 'meta',
      shift = 'shift',
      control = 'control',
      alt = 'alt',
    }

    const composeKeySet = new Set([
      ComposeKey.alt,
      ComposeKey.shift,
      ComposeKey.control,
      ComposeKey.meta,
    ]);

    function isComposeKey(key: any): key is ComposeKey {
      return composeKeySet.has(key);
    }

    function classifyKey(keyList: string[]): { key: string; composeKeys: ComposeKey[] } {
      return keyList.reduce(
        (res, key) => {
          key = key.toLowerCase();
          if (isComposeKey(key)) {
            res.composeKeys.push(key);
          } else {
            res.key = key;
          }
          return res;
        },
        { key: '', composeKeys: [] as ComposeKey[] },
      );
    }

    return function keymap(dom, maps) {
      // 记录按下的组合键，普通键不记录，因为meta键和非组合键同时按的时候，非组合键释放不会触发事件
      // 这样实际是比原来的记录所有按下的键适用性更窄，只是刚好可以解决这个问题，如果系统升级后解决了这个问题可以还原回去
      const pressComposeKeySet = new Set<ComposeKey>();

      const keydownHandler = (e: KeyboardEvent) => {
        const key = e.key.toLowerCase();

        if (isComposeKey(key)) {
          pressComposeKeySet.add(key);
          return;
        }

        const find = maps.find((item) => {
          const ck = classifyKey(item.keyList);
          if (ck.key !== key) return;

          if (
            ck.composeKeys.length !== pressComposeKeySet.size ||
            ck.composeKeys.some((key) => !pressComposeKeySet.has(key))
          )
            return;

          return true;
        });

        console.log('keymap', pressComposeKeySet, key);

        find?.handler(e);
      };

      const keyupHandler = (e: KeyboardEvent) => {
        const key = e.key.toLowerCase();
        console.log('keymap', 'keyup', key);
        // 在mac中按下meta组合键后释放其他按键会漏掉事件
        if (isComposeKey(key)) pressComposeKeySet.delete(key);
      };

      const blurHandler = () => pressComposeKeySet.clear();

      dom.addEventListener('keydown', keydownHandler);
      dom.addEventListener('keyup', keyupHandler);
      window.addEventListener('blur', blurHandler);
      return function () {
        dom.removeEventListener('keydown', keydownHandler);
        dom.removeEventListener('keyup', keyupHandler);
        window.removeEventListener('blur', blurHandler);
      };
    };
  })(),
};

export function useKeymap(
  maps: KeyMap[],
  dom: HTMLElement,
  strategy: KeymapStrategy = 'memoryCompose',
) {
  // 处理keys
  function handleMaps(maps: KeyMap[]) {
    return maps.map<HandledKeyMap>((item) => {
      const [keys, keyList] = handleKeys(item.keys);
      return { ...item, rawKeys: item.keys, keys, keyList };
    });
  }

  const handledMaps = handleMaps(maps);
  const cancel = keymapStrategy[strategy](dom, handledMaps);

  const operator = {
    cancel,
    /**
     * 传入快捷键，手动触发
     */
    trigger(keys: string) {
      const [handledKeys, keyList] = handleKeys(keys);

      const find = handledMaps.find((map) => {
        if (map.keys === handledKeys) return true;
        if (map.keyList.length !== keyList.length) return false;
        return map.keyList.every((key) => keyList.includes(key));
      });

      if (!find) return;

      find.handler();
    },
    log(): void {
      const info = handledMaps.map((item) => ({
        desc: item.desc,
        keys: item.rawKeys,
        realKeys: JSON.stringify(item.keyList),
      }));
      console.table(info);
    },
    has(keys: string): boolean {
      return handledMaps.some((item) => item.rawKeys === keys);
    },
    add(map: KeyMap): boolean {
      const exist = operator.has(map.keys);
      !exist && handledMaps.push(...handleMaps([map]));
      return !exist;
    },
    remove(keys: string): void {
      const index = handledMaps.findIndex((item) => item.rawKeys === keys);
      if (index === -1) return;
      handledMaps.splice(index, 1);
    },
    clear(): void {
      operator.cancel();
      handledMaps.length = 0;
    },
  };
  return operator;
}
