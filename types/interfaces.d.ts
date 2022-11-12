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
  theme: 'light' | 'dark' | 'system';
  window: {
    width: number;
    height: number;
    location?: [x: number, y: number];
  };
  recentDocuments: string[];
}
