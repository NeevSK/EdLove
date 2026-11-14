import { VergerDiagnosticsScreen } from '@/runtime/lab/VergerDiagnosticsScreen';

export default function VergerDiagnosticsRoute() {
  if (!__DEV__) return null;
  return <VergerDiagnosticsScreen />;
}
