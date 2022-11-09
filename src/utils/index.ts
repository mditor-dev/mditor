export function isMac(): boolean {
  return /mac/i.test(navigator.userAgent);
}
export function isWin(): boolean {
  return /windows/i.test(navigator.userAgent);
}
