declare module '@expo/config-plugins' {
  export type ConfigPlugin<T = any> = (config: any, props?: T) => any;
  export const withPlugins: (config: any, plugins: ConfigPlugin[]) => any;
  export const createRunOncePlugin: (
    plugin: ConfigPlugin,
    name: string,
    version: string,
  ) => ConfigPlugin;
  export const withAndroidManifest: (config: any, action: (config: any) => Promise<any>) => any;
  export const withDangerousMod: (
    config: any,
    args: [string, (config: any) => Promise<any>],
  ) => any;
}
