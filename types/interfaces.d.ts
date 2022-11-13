export interface MDDirectory {
  level: number;
  value: string;
}

export interface MDFile {
  name: string;
  originContent: string;
  content: string;
  path: string;
}

export interface AppConfig {
  // 配置版本，与app版本无关，当配置版本不一样则不能再使用之前的配置文件了
  version: string;
  window: {
    theme: 'light' | 'dark' | 'system';
    width: number;
    height: number;
    autoHideMenuBar: boolean;
  };

  recentDocuments: string[];
}
