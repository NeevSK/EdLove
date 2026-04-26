import './src/shims/node-globals-shim';
import 'react-native-reanimated';
import 'react-native-worklets';
import 'react-native-get-random-values';
import '../../packages/ui/src/global.css';
import { registerRootComponent } from 'expo';
import { bootstrapPlatform } from '@repo/core/src/native/bootstrap';
import App from './App';

// Initialize platform adapters
bootstrapPlatform().then(() => {
  registerRootComponent(App);
});
