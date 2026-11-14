import { Image } from 'expo-image';
import { type ReactNode, useEffect, useState } from 'react';
import { Pressable, Text as RNText, View } from 'react-native';
import type { MediaContract } from '../../../theme/contracts';
import { useWorldMotion } from '../../../theme/native/motion';
import { radiusStyle, typeStyle } from '../../../theme/native/style';
import { useWorldContext } from '../../../theme/native/WorldContext';
import { gapFor } from '../../../tokens/space';
import { fileKindOf } from '../../shared/files';
import { MEDIA_ENGLISH } from '../../shared/media';
import { useMediaAdapters } from './adapters';
import { FileCard } from './FileCard';

export type MediaProps = MediaContract;

/**
 * An image, video or voice clip in place, its space reserved by `aspect`.
 * Images speak their `alt`; video and voice offer a transcript; anything that
 * cannot be shown becomes a file card with words saying so.
 */
export function Media({
  file,
  alt,
  decorative = false,
  caption,
  aspect,
  captions,
  poster,
  transcript,
  labels,
}: MediaProps) {
  const { world, language } = useWorldContext();
  const l = { ...MEDIA_ENGLISH, ...labels };
  const { audio: Audio, video: Video } = useMediaAdapters();
  const { animates } = useWorldMotion();
  const [failed, setFailed] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const kind = fileKindOf(file);
  const radius = radiusStyle(world.recipes.surface.raised.radius);
  const name = alt ?? caption ?? file.name;

  useEffect(() => {
    // An image with no words is an authoring gap: said to the author, never silently passed.
    if (kind === 'image' && !decorative && !alt && process.env.NODE_ENV !== 'production') {
      console.warn(`[kit] Media: ${file.name} has no alt text. ${l.missingAlt}`);
    }
  }, [kind, decorative, alt, file.name, l.missingAlt]);

  const frame = (child: ReactNode) => (
    <View style={[{ width: '100%', aspectRatio: aspect, overflow: 'hidden' }, radius]}>
      {child}
    </View>
  );

  let body: ReactNode;
  if (failed) {
    body = (
      <View style={{ gap: gapFor('inside') }}>
        <RNText
          accessibilityRole="alert"
          style={typeStyle(world.recipes.text.caption, language, world)}
        >
          {l.unavailable}
        </RNText>
        <FileCard file={file} />
      </View>
    );
  } else if (kind === 'image') {
    body = frame(
      <Image
        source={{ uri: file.uri }}
        contentFit="cover"
        transition={animates ? 160 : 0}
        accessible={!decorative}
        accessibilityLabel={decorative ? undefined : name}
        accessibilityElementsHidden={decorative}
        importantForAccessibility={decorative ? 'no-hide-descendants' : 'yes'}
        onError={() => setFailed(true)}
        style={{ width: '100%', height: '100%' }}
      />,
    );
  } else if (kind === 'video' && Video) {
    body = frame(
      <Video
        file={file}
        poster={poster}
        captions={captions}
        accessibilityLabel={name}
        onError={() => setFailed(true)}
      />,
    );
  } else if (kind === 'audio' && Audio) {
    body = (
      <Audio
        file={file}
        accessibilityLabel={name}
        onError={() => setFailed(true)}
        labels={{ play: l.play, pause: l.pause }}
      />
    );
  } else {
    body = <FileCard file={file} />;
  }

  return (
    <View style={{ gap: gapFor('inside') }}>
      {body}
      {caption ? (
        <RNText style={typeStyle(world.recipes.text.caption, language, world)}>{caption}</RNText>
      ) : null}
      {transcript && kind !== 'image' ? (
        <View style={{ gap: gapFor('inside') }}>
          <Pressable
            role="button"
            aria-expanded={showTranscript}
            accessibilityLabel={l.showTranscript}
            onPress={() => setShowTranscript((s) => !s)}
            style={{ minHeight: 44, justifyContent: 'center' }}
          >
            <RNText
              style={[
                typeStyle(world.recipes.text.label, language, world),
                { color: world.tokens.lampDeep },
              ]}
            >
              {l.transcript}
            </RNText>
          </Pressable>
          {showTranscript ? (
            <RNText selectable style={typeStyle(world.recipes.text.body, language, world)}>
              {transcript}
            </RNText>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}
