/**
 * Self-Healing Web Shim for react-native-nitro-modules
 */
import bridge from '@/shims/universal-bridge';

const NitroModules = bridge('react-native-nitro-modules', {
  NitroModules: bridge('NitroModules', {}),
  Symbol: {
    iterator: Symbol.iterator,
    asyncIterator:
      typeof Symbol.asyncIterator !== 'undefined' ? Symbol.asyncIterator : 'asyncIterator',
  },
});

export const { NitroModules: NitroRegistry, Symbol: NitroSymbol } = NitroModules;
export default NitroModules;
