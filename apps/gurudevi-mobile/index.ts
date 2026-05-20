import '@azure/core-asynciterator-polyfill'; // Required for PowerSync watched queries
import './src/shims/node-globals-shim';
import 'react-native-reanimated';
import 'react-native-worklets';
import 'react-native-get-random-values';
import '@repo/ui/global.css';
import { bootstrapPlatform } from '@repo/core/native';
import { registerRootComponent } from 'expo';
import App from './App';
import { registerBackgroundSync } from './src/lib/backgroundSync';

// Initialize platform adapters
bootstrapPlatform().then(() => {
  registerBackgroundSync();
  registerRootComponent(App);
});
