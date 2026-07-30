import type { CoreRuntimeEnvironment } from '@repo/core/types/runtime';

let runtime: CoreRuntimeEnvironment | null = null;

export const coreRuntime = {
  register(env: CoreRuntimeEnvironment) {
    runtime = env;
  },

  get storage() {
    if (!runtime)
      throw new Error(
        'CoreRuntime: Storage provider not registered. Call coreRuntime.register() during app initialization.',
      );
    return runtime.storage;
  },

  get device() {
    if (!runtime)
      throw new Error(
        'CoreRuntime: Device provider not registered. Call coreRuntime.register() during app initialization.',
      );
    return runtime.device;
  },

  get haptics() {
    if (!runtime)
      throw new Error(
        'CoreRuntime: Haptics provider not registered. Call coreRuntime.register() during app initialization.',
      );
    return runtime.haptics;
  },

  get linking() {
    if (!runtime)
      throw new Error(
        'CoreRuntime: Linking provider not registered. Call coreRuntime.register() during app initialization.',
      );
    return runtime.linking;
  },

  get location() {
    if (!runtime)
      throw new Error(
        'CoreRuntime: Location provider not registered. Call coreRuntime.register() during app initialization.',
      );
    return runtime.location;
  },

  get network() {
    if (!runtime)
      throw new Error(
        'CoreRuntime: Network provider not registered. Call coreRuntime.register() during app initialization.',
      );
    return runtime.network;
  },

  get share() {
    if (!runtime)
      throw new Error(
        'CoreRuntime: Share provider not registered. Call coreRuntime.register() during app initialization.',
      );
    return runtime.share;
  },

  get ui() {
    if (!runtime)
      throw new Error(
        'CoreRuntime: UI provider not registered. Call coreRuntime.register() during app initialization.',
      );
    return runtime.ui;
  },

  get clipboard() {
    if (!runtime)
      throw new Error(
        'CoreRuntime: Clipboard provider not registered. Call coreRuntime.register() during app initialization.',
      );
    return runtime.clipboard;
  },

  get secureStorage() {
    if (!runtime)
      throw new Error(
        'CoreRuntime: SecureStorage provider not registered. Call coreRuntime.register() during app initialization.',
      );
    return runtime.secureStorage;
  },

  get backgroundTask() {
    if (!runtime)
      throw new Error(
        'CoreRuntime: BackgroundTask provider not registered. Call coreRuntime.register() during app initialization.',
      );
    return runtime.backgroundTask;
  },

  get asset() {
    if (!runtime)
      throw new Error(
        'CoreRuntime: Asset provider not registered. Call coreRuntime.register() during app initialization.',
      );
    return runtime.asset;
  },

  get notification() {
    if (!runtime)
      throw new Error(
        'CoreRuntime: Notification provider not registered. Call coreRuntime.register() during app initialization.',
      );
    return runtime.notification;
  },

  isRegistered() {
    return runtime !== null;
  },
};
