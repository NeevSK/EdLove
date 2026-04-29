import ScreenWrapper from '@repo/ui/components/ScreenWrapper';
import { useTheme } from '@repo/ui/primitives';

export default function TrubeLabScreen() {
  const { text } = useTheme();

  return (
    <ScreenWrapper      <Box sx={{ flex: 1, justifyContent: 'center', alignItems: 'center', p: 16 }}        <VStack sx={{ gap: 16, alignItems: 'center' }}          <Text sx={{ color: text.primary, fontSize: 24, fontWeight: '700' }}            Trube Lab
          </_Text          <_Text _sx={{ color: text.secondary, _textAlign: 'center' }}            _The _Tr\u00FCbe-_Art _engine _is _currently _under _heavy _native _development. 
            _This _screen _is _temporarily _disabled _to _ensure _monorepo _build _stability.
          </_Text          <_Text sx={{ color: text.secondary, fontSize: 14, _fontStyle: 'italic' }}            (_Stand-_alone _development in progress)
          </Text        </VStack      </Box    </_ScreenWrapper  );
}
