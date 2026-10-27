import { useState } from 'react';
import { Pressable } from '@repo/ui/primitives';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import gardenArtwork from '../../assets/design-preview/garden-path.jpg';
import fireflySceneArtwork from '../../assets/mascot/firefly-guide-welcome-light-scene.webp';

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
    background: '#F7F1E3',
    ink: '#23372D',
    quietInk: '#637168',
    accent: '#C9654A',
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
type PreviewMode = 'welcome' | 'auth' | 'onboarding';

const onboardingTour = [
  {
    title: 'A learning space that grows with you',
    text: 'Education is a living ecology. Here, wisdom is nurtured, not just information transferred.',
  },
  {
    title: 'A few clear places to begin',
    text: 'Reflect in Self, teach in Classroom, share in Community, and discover in Library.',
  },
  {
    title: 'See learning as a whole',
    text: 'Gurudevi helps teachers notice relationships, wellbeing, and the texture of classroom life.',
  },
  {
    title: 'Your privacy comes first',
    text: 'Your reflections and student records are private. You stay in control of what you share.',
  },
  {
    title: 'Find your own way around',
    text: 'Your tabs and quick actions make it easy to return to the places you use most.',
  },
] as const;

const capacities = [
  {
    id: 'student',
    title: 'I’m here to learn',
    detail: 'Build confidence and follow my curiosity.',
  },
  {
    id: 'teacher',
    title: 'I’m here to teach',
    detail: 'Support learning and care for a classroom.',
  },
  { id: 'principal', title: 'I help lead a school', detail: 'Support a whole learning community.' },
] as const;

function getLocalGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function WelcomeConceptPreview() {
  const [selectedId, setSelectedId] = useState<ConceptId>('garden');
  const [mode, setMode] = useState<PreviewMode>('welcome');
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [learnerName, setLearnerName] = useState('');
  const [capacity, setCapacity] = useState<(typeof capacities)[number]['id']>('student');
  const [email, setEmail] = useState('');
  const [previewNotice, setPreviewNotice] = useState('');
  const selected = concepts.find((concept) => concept.id === selectedId) ?? concepts[0];
  const insets = useSafeAreaInsets();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const wideLayout = windowWidth >= 560;
  const stepIndex = onboardingStep - 2;
  const tour = onboardingTour[stepIndex] ?? onboardingTour[0];
  const isComplete = onboardingStep === onboardingTour.length + 2;

  const nextOnboardingStep = () => {
    if (onboardingStep === 0 && learnerName.trim().length < 2) return;
    setOnboardingStep((step) => Math.min(step + 1, onboardingTour.length + 2));
  };

  const startOnboarding = () => {
    setMode('onboarding');
    setOnboardingStep(0);
    setPreviewNotice('');
  };

  const goBackToWelcome = () => {
    setMode('welcome');
    setPreviewNotice('');
  };

  const modeTitle =
    mode === 'auth' ? 'Welcome back' : isComplete ? 'You’re ready to begin' : 'Let’s find your way';
  const showWelcome = mode === 'welcome';
  const textColor = selected.ink;
  const mutedColor = selected.quietInk;

  const capacityOptions = capacities.map((option) => {
    const active = capacity === option.id;
    return (
      <Pressable
        key={option.id}
        accessibilityRole="radio"
        accessibilityState={{ selected: active }}
        onPress={() => setCapacity(option.id)}
        style={styles.choiceRow}
      >
        <View
          style={[
            styles.choiceMark,
            { borderColor: active ? selected.accent : `${textColor}60` },
          ]}
        >
          {active ? (
            <View
              style={[styles.choiceDot, { backgroundColor: selected.accent }]}
            />
          ) : null}
        </View>
        <View style={styles.choiceText}>
          <Text style={[styles.choiceTitle, { color: textColor }]}>
            {option.title}
          </Text>
          <Text style={[styles.choiceDetail, { color: mutedColor }]}>
            {option.detail}
          </Text>
        </View>
      </Pressable>
    );
  });

  const conceptChips = concepts.map((concept, index) => {
    const active = concept.id === selected.id;
    return (
      <Pressable
        key={concept.id}
        accessibilityRole="tab"
        accessibilityState={{ selected: active }}
        onPress={() => setSelectedId(concept.id)}
        style={[
          styles.conceptChip,
          { borderBottomColor: active ? selected.accent : 'transparent' },
        ]}
      >
        <Text
          style={[
            styles.conceptChipText,
            { color: active ? textColor : mutedColor },
          ]}
        >
          0{index + 1} {concept.name}
        </Text>
      </Pressable>
    );
  });

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
        <StatusBar barStyle="dark-content" />
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
            {showWelcome ? null : (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={
                  mode === 'auth' || onboardingStep === 0
                    ? 'Back to welcome'
                    : 'Previous onboarding step'
                }
                onPress={
                  mode === 'auth' || onboardingStep === 0
                    ? goBackToWelcome
                    : () => setOnboardingStep((step) => Math.max(0, step - 1))
                }
                style={styles.backLink}
              >
                <Text style={[styles.backLinkText, { color: textColor }]}>
                  {mode === 'auth' || onboardingStep === 0 ? '← Welcome' : '← Back'}
                </Text>
              </Pressable>
            )}
            <View style={styles.brandMark}>
              <Text style={styles.brandMarkText}>g</Text>
            </View>
            <Text style={[styles.brandName, { color: textColor }]}>gurudevi</Text>
            <View style={styles.previewBadge}>
              <Text style={styles.previewBadgeText}>DESIGN PREVIEW</Text>
            </View>
          </View>

          {showWelcome ? (
            <>
              <View
                style={styles.conceptPicker}
                accessibilityRole="tablist"
                accessibilityLabel="Welcome screen concepts"
              >
                {conceptChips}
              </View>

              <View style={styles.heroCopy}>
                <Text style={[styles.eyebrow, { color: mutedColor }]}>{getLocalGreeting()}</Text>
                <Text style={[styles.title, { color: textColor }]}>{selected.title}</Text>
                <Text style={[styles.description, { color: mutedColor }]}>
                  {selected.description}
                </Text>
              </View>

              <Image
                source={selected.hero === 'framed' ? fireflySceneArtwork : gardenArtwork}
                contentFit={selected.hero === 'framed' ? 'contain' : 'cover'}
                accessibilityLabel={
                  selected.hero === 'framed'
                    ? 'Tutii the firefly welcoming the learner among lotus flowers'
                    : 'A lotus garden at dawn beside a quiet path'
                }
                style={[
                  styles.artwork,
                  selected.hero === 'framed' && styles.framedArtwork,
                  selected.hero === 'wide' && styles.wideArtwork,
                ]}
              />

              <View style={styles.actions}>
                <ActionButton
                  title="Get started"
                  accent={selected.accent}
                  onPress={startOnboarding}
                />
                <Pressable
                  accessibilityRole="link"
                  onPress={() => {
                    setMode('auth');
                    setPreviewNotice('');
                  }}
                  hitSlop={8}
                  style={styles.signInAction}
                >
                  <Text style={[styles.signInText, { color: textColor }]}>
                    I already have an account
                  </Text>
                </Pressable>
                <Text style={[styles.footerNote, { color: mutedColor }]}>
                  A calmer way to learn, together
                </Text>
              </View>
            </>
          ) : mode === 'auth' ? (
            <View style={styles.flowContent}>
              <Text style={[styles.eyebrow, { color: mutedColor }]}>YOUR LEARNING SPACE</Text>
              <Text style={[styles.title, { color: textColor }]}>{modeTitle}</Text>
              <Text style={[styles.description, { color: mutedColor }]}>
                One email is all you need to find your way back.
              </Text>
              <TextInput testID="welcome-email-input"
                accessibilityLabel="Email address"
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                onChangeText={setEmail}
                placeholder="Email address"
                placeholderTextColor={mutedColor}
                style={[
                  styles.textInput,
                  { color: textColor, borderBottomColor: `${textColor}55` },
                ]}
                value={email}
              />
              <ActionButton
                title="Continue with email"
                accent={selected.accent}
                onPress={() =>
                  setPreviewNotice(
                    email.includes('@')
                      ? 'In the live app, the secure sign-in step continues here.'
                      : 'Enter a valid email address to continue.',
                  )
                }
              />
              <Pressable
                accessibilityRole="button"
                onPress={() =>
                  setPreviewNotice(
                    'Google sign-in continues through the app’s secure account flow.',
                  )
                }
                style={styles.textAction}
              >
                <Text style={[styles.textActionLabel, { color: textColor }]}>
                  Continue with Google
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={startOnboarding}
                style={styles.textAction}
              >
                <Text style={[styles.signInText, { color: mutedColor }]}>
                  New to Gurudevi? Begin with Tutii
                </Text>
              </Pressable>
              {previewNotice ? (
                <Text
                  accessibilityLiveRegion="polite"
                  style={[styles.notice, { color: mutedColor }]}
                >
                  {previewNotice}
                </Text>
              ) : null}
            </View>
          ) : (
            <View style={styles.flowContent}>
              <Text style={[styles.eyebrow, { color: mutedColor }]}>
                {isComplete
                  ? 'A NEW BEGINNING'
                  : `A FEW SMALL STEPS · ${Math.min(onboardingStep + 1, 7)} OF 7`}
              </Text>
              {onboardingStep === 0 ? (
                <>
                  <Text style={[styles.title, { color: textColor }]}>Hi, I’m Tutii.</Text>
                  <Text style={[styles.description, { color: mutedColor }]}>
                    I’ll help you find your way around. What should I call you?
                  </Text>
                  <TextInput testID="welcome-name-input"
                    accessibilityLabel="What should Tutii call you?"
                    autoComplete="name"
                    onChangeText={setLearnerName}
                    onSubmitEditing={nextOnboardingStep}
                    placeholder="Your name"
                    placeholderTextColor={mutedColor}
                    returnKeyType="next"
                    style={[
                      styles.textInput,
                      { color: textColor, borderBottomColor: `${textColor}55` },
                    ]}
                    value={learnerName}
                  />
                </>
              ) : onboardingStep === 1 ? (
                <>
                  <Text style={[styles.title, { color: textColor }]}>
                    Lovely to meet you{learnerName.trim() ? `, ${learnerName.trim()}` : ''}.
                  </Text>
                  <Text style={[styles.description, { color: mutedColor }]}>
                    Which best describes you here?
                  </Text>
                  <View style={styles.choiceList}>
                    {capacityOptions}
                  </View>
                </>
              ) : isComplete ? (
                <>
                  <Text style={[styles.title, { color: textColor }]}>
                    You’re ready, {learnerName.trim() || 'friend'}.
                  </Text>
                  <Text style={[styles.description, { color: mutedColor }]}>
                    I’ll be here whenever you need a hand. Your path can change as you do.
                  </Text>
                </>
              ) : (
                <>
                  <Text style={[styles.tutiiLine, { color: selected.accent }]}>
                    Tutii · {onboardingStep - 1} of {onboardingTour.length}
                  </Text>
                  <Text style={[styles.title, { color: textColor }]}>{tour.title}</Text>
                  <Text style={[styles.description, { color: mutedColor }]}>{tour.text}</Text>
                  <Text style={[styles.conversation, { color: mutedColor }]}>
                    “You can take this one step at a time. We’ll figure it out together.”
                  </Text>
                </>
              )}
              <View style={styles.actions}>
                <ActionButton
                  title={
                    isComplete
                      ? 'Back to welcome'
                      : onboardingStep === 0
                        ? 'Continue'
                        : onboardingStep === 1
                          ? 'Take a quick look'
                          : 'Next'
                  }
                  accent={selected.accent}
                  onPress={isComplete ? goBackToWelcome : nextOnboardingStep}
                  disabled={onboardingStep === 0 && learnerName.trim().length < 2}
                />
                {onboardingStep >= 2 && !isComplete ? (
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => setOnboardingStep(onboardingTour.length + 2)}
                    style={styles.textAction}
                  >
                    <Text style={[styles.signInText, { color: mutedColor }]}>Skip the tour</Text>
                  </Pressable>
                ) : null}
              </View>
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
}

function ActionButton({
  title,
  accent,
  onPress,
  disabled = false,
}: {
  title: string;
  accent: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.primaryAction,
        { backgroundColor: accent, opacity: disabled ? 0.45 : pressed ? 0.86 : 1 },
      ]}
    >
      <Text style={styles.primaryActionText}>{title}</Text>
      <Text style={styles.actionArrow}>→</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  stage: { flex: 1 },
  wideStage: { alignItems: 'center', backgroundColor: '#E8E2D5' },
  screen: { flex: 1, width: '100%', maxWidth: 430, overflow: 'hidden' },
  content: { flexGrow: 1, paddingHorizontal: 24, gap: 18 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  backLink: { minHeight: 40, justifyContent: 'center', marginRight: 2 },
  backLinkText: { fontSize: 12 },
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
  previewBadge: { marginLeft: 'auto', paddingVertical: 6 },
  previewBadgeText: { color: '#827D6C', fontSize: 9, letterSpacing: 1.1 },
  conceptPicker: { flexDirection: 'row', gap: 20, paddingRight: 8 },
  conceptChip: { minHeight: 40, justifyContent: 'center', borderBottomWidth: 2 },
  conceptChipText: { fontSize: 12 },
  heroCopy: { gap: 10, paddingTop: 2 },
  flowContent: { flex: 1, gap: 20, paddingTop: 28 },
  eyebrow: { fontSize: 10, letterSpacing: 1.8, lineHeight: 15 },
  title: { fontFamily: 'serif', fontSize: 36, lineHeight: 43, letterSpacing: -1.4 },
  description: { fontSize: 15, lineHeight: 22, maxWidth: 310 },
  textInput: {
    minHeight: 54,
    paddingHorizontal: 2,
    borderBottomWidth: StyleSheet.hairlineWidth,
    fontSize: 18,
  },
  textAction: { minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  textActionLabel: { fontSize: 15, textDecorationLine: 'underline' },
  notice: { fontSize: 13, lineHeight: 20, textAlign: 'center' },
  choiceList: { gap: 2, marginTop: 4 },
  choiceRow: {
    minHeight: 68,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderBottomColor: '#23372D1A',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  choiceMark: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  choiceDot: { width: 10, height: 10, borderRadius: 5 },
  choiceText: { flex: 1, gap: 3 },
  choiceTitle: { fontSize: 15, fontFamily: 'Poppins-Medium' },
  choiceDetail: { fontSize: 12, lineHeight: 17 },
  tutiiLine: { fontSize: 13, letterSpacing: 0.3 },
  conversation: { fontFamily: 'serif', fontSize: 17, lineHeight: 26, fontStyle: 'italic' },
  artwork: {
    height: 232,
    width: '100%',
    overflow: 'hidden',
    position: 'relative',
    borderRadius: 4,
  },
  framedArtwork: { height: 220, borderRadius: 0, backgroundColor: '#F7F1E3' },
  framedImage: { borderRadius: 0 },
  wideArtwork: { height: 205, borderRadius: 4 },
  actions: { alignItems: 'center', gap: 15, paddingTop: 2 },
  primaryAction: {
    width: '100%',
    minHeight: 58,
    borderRadius: 16,
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
