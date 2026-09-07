export const ExecutionEnvironment = {
  Bare: 'bare',
  Standalone: 'standalone',
  StoreClient: 'storeClient',
} as const;

const constants = {
  expoConfig: { extra: { publicRuntime: {} } },
  executionEnvironment: ExecutionEnvironment.Bare,
};

export default constants;
