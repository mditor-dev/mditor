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
