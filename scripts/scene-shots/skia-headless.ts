// react-native-skia's headless build, plus the `vec` helper it leaves out.
export * from 'react-native-skia/lib/module/headless/index.js';
export const vec = (x = 0, y?: number) => ({ x, y: y ?? x });
