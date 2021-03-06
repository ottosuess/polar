import os from 'os';

export type PolarPlatform = 'mac' | 'windows' | 'linux' | 'unknown';

export const normalizePlatform = () => {
  switch (os.platform()) {
    case 'darwin':
      return 'mac';
    case 'win32':
      return 'windows';
    case 'linux':
      return 'linux';
    default:
      return 'unknown';
  }
};

export const platform: PolarPlatform = normalizePlatform();

const is = (p: PolarPlatform) => p === platform;

export const isMac = is('mac');

export const isWindows = is('windows');

export const isLinux = is('linux');
