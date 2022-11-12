import { release } from 'os';

/**
 * mac
 */
export const isMac = process.platform === 'darwin';

/**
 * win7-
 */
export const isWin7 = release().startsWith('6.1');

/**
 * Windows 10+
 */
export const isWin10 = process.platform === 'win32';

/**
 * win
 */
export const isWin = isWin10 || isWin7;
