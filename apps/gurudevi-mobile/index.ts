import './src/shims/early-bootstrap';
import 'react-native-worklets';
import 'react-native-reanimated';
import 'react-native-get-random-values';
import '@azure/core-asynciterator-polyfill'; // Required for PowerSync watched queries
import './src/shims/node-globals-shim';
import '@repo/ui/global.css';

// Expo Router owns the live app shell in SDK 56+.
import 'expo-router/entry';
