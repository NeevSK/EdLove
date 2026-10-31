import { Platform } from 'react-native';
import { EnrichedMarkdownText, type MarkdownStyle } from 'react-native-enriched-markdown';
import type { NativeMarkdownAdapterProps } from '../../../theme/contracts';
import { radiusStyle, typeStyle } from '../../../theme/native/style';
import { useWorldContext } from '../../../theme/native/WorldContext';
import type { ProseTone, ResolvedWorld, TypeStyle, WorldLanguage } from '../../../theme/types';

const MONO = Platform.select({ ios: 'Menlo', default: 'monospace' });

/** The world's prose as enriched-markdown styles (shared with legacy chat bubbles). */
export function proseMarkdownStyle(
  prose: ProseTone,
  world: ResolvedWorld,
  language: WorldLanguage,
): MarkdownStyle {
  const set = (t: TypeStyle) => {
    const s = typeStyle(t, language, world);
    return {
      color: t.color,
      fontFamily: s.fontFamily,
      fontSize: s.fontSize,
      lineHeight: s.lineHeight,
      fontWeight: t.weight,
    };
  };
  const radius = radiusStyle(prose.codeBlock.radius).borderRadius;
  const small = Math.round(prose.body.size * 0.88);
  return {
    paragraph: { ...set(prose.body), marginBottom: prose.gap },
    h1: { ...set(prose.h1), marginTop: prose.gap, marginBottom: prose.gap / 2 },
    h2: { ...set(prose.h2), marginTop: prose.gap, marginBottom: prose.gap / 2 },
    h3: { ...set(prose.h3), marginTop: prose.gap / 2, marginBottom: prose.gap / 2 },
    code: {
      color: prose.code.ink,
      backgroundColor: prose.code.fill,
      fontFamily: MONO,
      fontSize: small,
    },
    codeBlock: {
      color: prose.codeBlock.ink,
      backgroundColor: prose.codeBlock.fill,
      borderColor: prose.codeBlock.edge.color,
      borderWidth: prose.codeBlock.edge.width,
      borderRadius: typeof radius === 'number' ? radius : 8,
      padding: prose.gap,
      fontFamily: MONO,
      fontSize: small,
      lineHeight: Math.round(small * 1.5),
    },
    blockquote: {
      color: prose.quote.ink,
      borderColor: prose.quote.edge.color,
      borderWidth: prose.quote.edge.width,
      backgroundColor: prose.quote.fill,
      padding: prose.gap * 0.8,
    },
    list: { ...set(prose.body), bulletColor: prose.bullet },
    link: { color: prose.link.ink, underline: prose.link.underline },
    thematicBreak: { color: prose.rule.color },
    table: {
      color: prose.body.color,
      fontSize: small,
      headerBackgroundColor: prose.table.headerFill,
      headerTextColor: prose.body.color,
      borderColor: prose.table.edge.color,
      borderWidth: prose.table.edge.width,
      borderRadius: 8,
      cellPaddingHorizontal: 8,
      cellPaddingVertical: 6,
    },
    math: { color: prose.body.color, fontSize: prose.body.size, padding: 6 },
    inlineMath: { color: prose.body.color },
  };
}

/** Default Markdown adapter on native: react-native-enriched-markdown (installed with the kit). */
export function EnrichedMarkdownAdapter({
  source,
  prose,
  onLinkPress,
}: NativeMarkdownAdapterProps) {
  const { world, language } = useWorldContext();
  return (
    <EnrichedMarkdownText
      markdown={source}
      selectable
      flavor="github"
      markdownStyle={proseMarkdownStyle(prose, world, language)}
      onLinkPress={onLinkPress ? (e) => onLinkPress(e.url) : undefined}
    />
  );
}
