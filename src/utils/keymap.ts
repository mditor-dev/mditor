import { isMac } from '@/utils/index';

interface KeyMap {
  keys: string[];
  platform?: 'win' | 'mac';
  handler: Function;
}

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

function handleMaps(maps: KeyMap[]): (KeyMap & { key: string; composeKeys: ComposeKey[] })[] {
  return maps.map((item) => {
    let key = '';
    const composeKeys: ComposeKey[] = [];

    item.keys.forEach((k) => {
      k = k.toLowerCase();
      if (isComposeKey(k)) {
        composeKeys.push(k);
      } else {
        if (key) throw new Error('普通键只能有一个');
        key = k;
      }
    });

    return { ...item, key, composeKeys };
  });
}

export function keymap(dom: HTMLElement, maps: Array<KeyMap>) {
  // 记录按下的组合键，普通键不记录，因为meta键和非组合键同时按的时候，非组合键释放不会触发事件
  // 这样实际是比原来的记录所有按下的键适用性更窄，只是刚好可以解决这个问题，如果系统升级后解决了这个问题可以还原回去
  const pressComposeKeySet = new Set<ComposeKey>();

  const handledMaps = handleMaps(maps);

  const keydownHandler = (e: KeyboardEvent) => {
    const key = e.key.toLowerCase();

    if (isComposeKey(key)) {
      pressComposeKeySet.add(key);
      return;
    }

    const platform = isMac() ? 'mac' : 'win';

    handledMaps.forEach((item) => {
      if (item.platform && item.platform !== platform) return;

      if (item.key !== key) return;

      if (
        item.composeKeys.length !== pressComposeKeySet.size ||
        item.composeKeys.some((key) => !pressComposeKeySet.has(key))
      )
        return;

      item.handler();
    });
    console.log(pressComposeKeySet, key);
  };

  const keyupHandler = (e: KeyboardEvent) => {
    const key = e.key.toLowerCase();
    console.log('keyup', key);
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
}
