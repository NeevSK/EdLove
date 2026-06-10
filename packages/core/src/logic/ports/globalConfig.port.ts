export interface GlobalConfig {
  key: string;
  value: string;
  is_active: boolean;
}

export interface IGlobalConfigPort {
  getConfigs(): Promise<GlobalConfig[]>;
  subscribeToChanges(callback: () => void): () => void;
}
