import { GlobalConfig, type IGlobalConfigPort } from '../ports/globalConfig.port';

export class GlobalConfigManager {
  constructor(private port: IGlobalConfigPort) {}

  async getAllActive(): Promise<Record<string, string>> {
    const configs = await this.port.getConfigs();
    return configs.reduce(
      (acc, curr) => {
        if (curr.is_active) {
          acc[curr.key] = curr.value || 'true';
        }
        return acc;
      },
      {} as Record<string, string>,
    );
  }

  subscribe(callback: () => void): () => void {
    return this.port.subscribeToChanges(callback);
  }
}
