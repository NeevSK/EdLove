import ComponentShowcaseScreen from '@repo/ui/screens/ComponentShowcaseScreen';

export default function UiShowcaseRoute() {
  if (!__DEV__) return null;
  return <ComponentShowcaseScreen />;
}
