import './src/shims/early-bootstrap';
import 'react-native-worklets';
import 'react-native-reanimated';
import 'react-native-get-random-values';
import './src/shims/crypto-random-uuid';
import './src/telemetry/developmentAnalytics';
import './src/shims/node-globals-shim';
import './src/lib/backgroundSyncTask';

// Expo Router owns the live app shell in SDK 56+.
import 'expo-router/entry';
import { recordDevelopmentTrace } from '@/boot/startupTelemetry';

recordDevelopmentTrace({
  category: 'entry-module-ready',
  task: 'expo-router-entry-evaluated',
  state: 'complete',
});
