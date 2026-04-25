import { CoreRuntimeEnvironment } from '../types/runtime';

let runtime: CoreRuntimeEnvironment | null = null;

export const coreRuntime = {
  register(env: CoreRuntimeEnvironment) {
    runtime = env;
  },

  get storage() {
    if (!runtime) throw new Error('CoreRuntime: Storage provider not registered. Call coreRuntime.register() during app initialization.');
    return runtime.storage;
  },

  get device() {
    if (!runtime) throw new Error('CoreRuntime: Device provider not registered. Call coreRuntime.register() during app initialization.');
    return runtime.device;
  },

  get haptics() {
    if (!runtime) throw new Error('CoreRuntime: Haptics provider not registered. Call coreRuntime.register() during app initialization.');
    return runtime.haptics;
  },

  get linking() {
    if (!runtime) throw new Error('CoreRuntime: Linking provider not registered. Call coreRuntime.register() during app initialization.');
    return runtime.linking;
  },

  get location() {
    if (!runtime) throw new Error('CoreRuntime: Location provider not registered. Call coreRuntime.register() during app initialization.');
    return runtime.location;
  },

  get network() {
    if (!runtime) throw new Error('CoreRuntime: Network provider not registered. Call coreRuntime.register() during app initialization.');
    return runtime.network;
  },

  isRegistered() {
    return runtime !== null;
  }
};
