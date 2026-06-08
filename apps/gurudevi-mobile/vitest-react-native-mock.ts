// Headless React Native mock for Vitest architecture tests
export const Platform = {
  OS: 'ios',
  select: (objs: any) => objs.ios || objs.default,
  isTesting: true,
};

export const StyleSheet = {
  create: (styles: any) => styles,
};

export const View = 'View';
export const Text = 'Text';
export const Pressable = 'Pressable';

export default {
  Platform,
  StyleSheet,
  View,
  Text,
  Pressable,
};
