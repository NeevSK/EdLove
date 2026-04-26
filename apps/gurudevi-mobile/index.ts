import './src/shims/node-globals-shim';
import 'react-native-reanimated';
import 'react-native-worklets';
import 'react-native-get-random-values';
import '../../packages/ui/src/global.css';
import { registerRootComponent } from 'expo';

import App from './App';
import { bootstrapPlatform } from '../../packages/core/src/native/bootstrap';

// Initialize platform adapters
bootstrapPlatform().then(() => {
  registerRootComponent(App);
});
