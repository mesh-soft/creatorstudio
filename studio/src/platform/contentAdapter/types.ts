export interface ContentEntry {
  name: string;
  type: 'file' | 'dir';
}

export interface ContentAdapter {
  read(path: string): Promise<string>;
  write(path: string, content: string): Promise<void>;
  delete(path: string): Promise<void>;
  list(dir: string): Promise<ContentEntry[]>;
  exists(path: string): Promise<boolean>;
}
