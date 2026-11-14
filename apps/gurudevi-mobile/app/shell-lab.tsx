import { ShellLabScreen } from '@/runtime/lab/ShellLabScreen';

export default function ShellLabRoute() {
  if (!__DEV__) return null;
  return <ShellLabScreen />;
}
