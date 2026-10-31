import { Text as RNText, View } from 'react-native';
import type { MarkdownContract } from '../../../theme/contracts';
import { typeStyle } from '../../../theme/native/style';
import { useWorldContext } from '../../../theme/native/WorldContext';
import { useMediaAdapters } from './adapters';

export type MarkdownProps = MarkdownContract;

/**
 * Markdown set in the world's prose. The nearest `MediaAdapters` draws it;
 * with none, its paragraphs show as plain text, so nothing is ever lost.
 */
export function Markdown({ source, tone = 'ground', onLinkPress }: MarkdownProps) {
  const { world, language } = useWorldContext();
  const prose = world.recipes.prose[tone];
  const { markdown: Adapter } = useMediaAdapters();
  if (Adapter) return <Adapter source={source} prose={prose} onLinkPress={onLinkPress} />;
  const paragraphs = source.split(/\n{2,}/).filter((p) => p.trim() !== '');
  return (
    <View style={{ gap: prose.gap }}>
      {paragraphs.map((p, i) => (
        <RNText key={i} selectable style={typeStyle(prose.body, language, world)}>
          {p}
        </RNText>
      ))}
    </View>
  );
}
