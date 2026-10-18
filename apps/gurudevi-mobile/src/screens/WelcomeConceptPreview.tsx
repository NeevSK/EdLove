import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ImageBackground,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import gardenArtwork from '../../assets/design-preview/garden-path.jpg';
import fireflyArtwork from '../../assets/mascot/firefly-guide-welcome-light-cutout-v2.webp';

const concepts = [
  {
    id: 'garden',
    name: 'Garden Path',
    eyebrow: 'A SANCTUARY FOR LEARNING',
    title: 'A gentler\nway to learn',
    description: 'A little space to grow, at your own pace.',
    background: '#F7F1E3',
    ink: '#23372D',
    quietInk: '#637168',
    accent: '#C9654A',
    hero: 'open',
  },
  {
    id: 'sanctuary',
    name: 'Quiet Sanctuary',
    eyebrow: 'WELCOME TO GURUDEVI',
    title: 'Learning\ngrows here',
    description: 'Find your rhythm. Follow what matters.',
    background: '#18382F',
    ink: '#FFF9EE',
    quietInk: '#D0D8CE',
    accent: '#D47B5A',
    hero: 'framed',
  },
  {
    id: 'canvas',
    name: 'Open Canvas',
    eyebrow: 'A PLACE TO BEGIN',
    title: 'A place to grow,\ntogether',
    description: 'Learning, reflection, and community in one calm place.',
    background: '#FBF7ED',
    ink: '#283A31',
    quietInk: '#667269',
    accent: '#C9654A',
    hero: 'wide',
  },
] as const;

type ConceptId = (typeof concepts)[number]['id'];

export default function WelcomeConceptPreview() {
  const [selectedId, setSelectedId] = useState<ConceptId>('garden');
  const selected = concepts.find((concept) => concept.id === selectedId) ?? concepts[0];
  const insets = useSafeAreaInsets();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const router = useRouter();
  const wideLayout = windowWidth >= 560;

  return (
    <View style={[styles.stage, wideLayout && styles.wideStage]}>
      <View
        style={[
          styles.screen,
          { backgroundColor: selected.background },
          wideLayout && {
            minHeight: Math.max(windowHeight - 48, 620),
            marginVertical: 24,
            borderRadius: 32,
            shadowColor: '#27352B',
            shadowOpacity: 0.16,
            shadowRadius: 28,
            shadowOffset: { width: 0, height: 14 },
            elevation: 10,
          },
        ]}
      >
        <StatusBar barStyle={selected.id === 'sanctuary' ? 'light-content' : 'dark-content'} />
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={[
            styles.content,
            {
              paddingTop: Math.max(insets.top, 18) + 10,
              paddingBottom: Math.max(insets.bottom, 20) + 16,
            },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.brandRow}>
            <View style={styles.brandMark}>
              <Text style={styles.brandMarkText}>g</Text>
            </View>
            <Text style={[styles.brandName, { color: selected.ink }]}>gurudevi</Text>
            <View style={styles.previewBadge}>
              <Text style={styles.previewBadgeText}>DESIGN PREVIEW</Text>
            </View>
          </View>

          <ScrollView
            horizontal
            contentContainerStyle={styles.conceptPicker}
            showsHorizontalScrollIndicator={false}
            accessibilityLabel="Welcome screen concepts"
          >
            {concepts.map((concept, index) => {
              const active = concept.id === selected.id;
              return (
                <Pressable
                  key={concept.id}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  onPress={() => setSelectedId(concept.id)}
                  style={[
                    styles.conceptChip,
                    {
                      backgroundColor: active ? selected.ink : 'transparent',
                      borderColor: active ? selected.ink : `${selected.ink}38`,
                    },
                  ]}
                >
                  <Text
                    style={{ color: active ? selected.background : selected.ink, fontSize: 12 }}
                  >
                    0{index + 1} {concept.name}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <View style={styles.heroCopy}>
            <Text style={[styles.eyebrow, { color: selected.quietInk }]}>{selected.eyebrow}</Text>
            <Text style={[styles.title, { color: selected.ink }]}>{selected.title}</Text>
            <Text style={[styles.description, { color: selected.quietInk }]}>
              {selected.description}
            </Text>
          </View>

          <ImageBackground
            source={gardenArtwork}
            resizeMode="cover"
            accessibilityLabel="A lotus garden at dawn beside a quiet path"
            style={[
              styles.artwork,
              selected.hero === 'framed' && styles.framedArtwork,
              selected.hero === 'wide' && styles.wideArtwork,
            ]}
            imageStyle={selected.hero === 'framed' ? styles.framedImage : undefined}
          >
            {selected.hero === 'framed' ? (
              <>
                <Image
                  accessibilityLabel="Gurudevi firefly guiding the learner"
                  contentFit="contain"
                  source={fireflyArtwork}
                  style={styles.mascotGuide}
                />
                <View style={styles.artworkCaption}>
                  <Text style={styles.artworkCaptionText}>GROW AT YOUR OWN PACE</Text>
                </View>
              </>
            ) : null}
          </ImageBackground>

          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push('/onboarding?entry=guest')}
              style={({ pressed }) => [
                styles.primaryAction,
                { backgroundColor: selected.accent, opacity: pressed ? 0.88 : 1 },
              ]}
            >
              <Text style={styles.primaryActionText}>Get started</Text>
              <Text style={styles.actionArrow}>→</Text>
            </Pressable>
            <Pressable
              accessibilityRole="link"
              onPress={() => router.push('/auth')}
              hitSlop={8}
              style={styles.signInAction}
            >
              <Text style={[styles.signInText, { color: selected.ink }]}>
                I already have an account
              </Text>
            </Pressable>
            <Text style={[styles.footerNote, { color: selected.quietInk }]}>
              A calmer way to learn, together
            </Text>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stage: { flex: 1 },
  wideStage: { alignItems: 'center', backgroundColor: '#E8E2D5' },
  screen: { flex: 1, width: '100%', maxWidth: 430, overflow: 'hidden' },
  content: { flexGrow: 1, paddingHorizontal: 24, gap: 18 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandMark: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E8A66A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandMarkText: { color: '#26392F', fontFamily: 'Poppins-Medium', fontSize: 21, lineHeight: 25 },
  brandName: { fontFamily: 'Poppins-Medium', fontSize: 17, letterSpacing: 0.2 },
  previewBadge: {
    marginLeft: 'auto',
    borderColor: '#8B8A744A',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  previewBadgeText: { color: '#827D6C', fontSize: 9, letterSpacing: 1.1 },
  conceptPicker: { gap: 8, paddingRight: 8 },
  conceptChip: { borderWidth: 1, borderRadius: 20, paddingHorizontal: 13, paddingVertical: 9 },
  heroCopy: { gap: 10, paddingTop: 2 },
  eyebrow: { fontSize: 10, letterSpacing: 1.8, lineHeight: 15 },
  title: { fontFamily: 'serif', fontSize: 36, lineHeight: 43, letterSpacing: -1.4 },
  description: { fontSize: 15, lineHeight: 22, maxWidth: 310 },
  artwork: {
    height: 232,
    width: '100%',
    overflow: 'hidden',
    position: 'relative',
    borderRadius: 28,
  },
  framedArtwork: { height: 218, borderRadius: 28 },
  framedImage: { borderRadius: 28 },
  wideArtwork: { height: 205, borderRadius: 20 },
  artworkCaption: {
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: 14,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: '#18382FDF',
  },
  mascotGuide: { position: 'absolute', right: 10, bottom: 54, zIndex: 2, width: 80, height: 80 },
  artworkCaptionText: { color: '#FFF9EE', fontSize: 9, letterSpacing: 1.7 },
  actions: { alignItems: 'center', gap: 15, paddingTop: 2 },
  primaryAction: {
    width: '100%',
    minHeight: 58,
    borderRadius: 29,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  primaryActionText: { color: '#FFF9EE', fontFamily: 'Poppins-Medium', fontSize: 16 },
  actionArrow: { color: '#FFF9EE', fontSize: 20, lineHeight: 22 },
  signInAction: { minHeight: 36, justifyContent: 'center', paddingHorizontal: 12 },
  signInText: { fontSize: 13, textDecorationLine: 'underline', textDecorationColor: '#807C6D' },
  footerNote: { fontSize: 11, letterSpacing: 0.4 },
});
