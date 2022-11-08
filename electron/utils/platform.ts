import { release } from 'os';

/**
 * mac
 */
export function isMac(): boolean {
  return process.platform === 'darwin';
}

/**
 * win7
 */
export function isWin7(): boolean {
  return release().startsWith('6.1');
}

/**
 * Windows 10+
 */
export function isWin10(): boolean {
  return process.platform === 'win32';
}
