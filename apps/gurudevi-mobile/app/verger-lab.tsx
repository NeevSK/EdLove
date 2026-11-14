import { VergerLabScreen } from '@/runtime/lab/VergerLabScreen';

export default function VergerLabRoute() {
  if (!__DEV__) return null;
  return <VergerLabScreen />;
}
