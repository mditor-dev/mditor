import { isMac } from '@/utils/index';

interface KeyMap {
  keys: string[];
  platform?: 'win' | 'mac';
  handler: Function;
}

export function keymap(dom: HTMLElement, maps: KeyMap[]) {
  const keySet = new Set<string>();
  maps.forEach((item) => (item.keys = item.keys.map((it) => it.toLowerCase())));

  const keydownHandler = (e: KeyboardEvent) => {
    const key = e.key.toLowerCase();
    keySet.add(key);
    const platform = isMac() ? 'mac' : 'win';
    maps.forEach((item) => {
      if (item.platform && item.platform !== platform) return;
      if (item.keys.length !== keySet.size) return;
      if (!item.keys.every((k) => keySet.has(k))) return;
      item.handler();
    });
    console.log(keySet);
  };

  const keyupHandler = (e: KeyboardEvent) => {
    const key = e.key.toLowerCase();
    console.log('keyup', key);
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
}
