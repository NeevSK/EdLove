import { showToast } from '@repo/core/lib/feedback';
import { useAuth } from '@repo/core/logic';
import { activateLocalGuestSession } from '@repo/core/native/localGuestActivation';
import {
  completeLocalGuestOnboarding,
  createLocalGuestInitialBond,
} from '@repo/core/native/localGuestOnboarding';
import { getOrCreateLocalGuestSession } from '@repo/core/native/localGuestSession';
import {
  CANONICAL_CIVIC_ROLES,
  CANONICAL_NAME_PROMPTS,
  type CivicRoleId,
  extractCandidateName,
  extractFirstName,
  validatePreferredName,
} from '@repo/core/types';
import ErrorBoundary, { RouteErrorBoundary } from '@repo/ui/components/ErrorBoundary';
import {
  Button,
  celebrate,
  RadioGroup,
  Surface,
  Text,
  useFloorPresence,
  WorldPicker,
} from '@repo/ui/components/native';
import { useLanguageOptional, useThemeContextOptional } from '@repo/ui/context';
import { worldName } from '@repo/ui/theme';
import { useWorld, WorldEnter } from '@repo/ui/theme/native';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ComfortPresets } from '@/components/comfort/ComfortPresets';
import { PreferredNameEntry } from '@/components/PreferredNameEntry';
import { RoleCardGrid } from '@/components/RoleCardGrid';
import { useBootstrapRouteState } from '@/entry/bootstrapRouteState';
import { v1Client } from '@/lib/v1Client';

export { RouteErrorBoundary as ErrorBoundary };

type Step = 'language' | 'comfort' | 'name' | 'role' | 'world';

/** Each language named in itself, so a person who reads only that one still finds it. */
const LANGUAGES = [
  { value: 'si', label: 'සිංහල', hint: 'Sinhala' },
  { value: 'ta', label: 'தமிழ்', hint: 'Tamil' },
  { value: 'en', label: 'English', hint: 'English' },
] as const;

export default function OnboardingRoute() {
  const router = useRouter();
  const { refreshProfile } = useAuth();
  const routeState = useBootstrapRouteState('/onboarding');
  const world = useWorld();
  const wt = world.tokens;
  useFloorPresence('full');

  const [step, setStep] = useState<Step>('language');
  const { language, setLanguage } = useLanguageOptional();
  const { worldId, setWorld } = useThemeContextOptional();
  const [displayName, setDisplayName] = useState('');
  const [detectedName, setDetectedName] = useState('');
  const [isEditingCustomName, setIsEditingCustomName] = useState(false);
  const [selectedRole, setSelectedRole] = useState<CivicRoleId>('teacher');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (routeState.session?.user) {
      const candidate = extractCandidateName(routeState.session.user);
      if (candidate) {
        setDetectedName(candidate);
        setDisplayName(candidate);
      }
    }
  }, [routeState.session]);

  const firstName = extractFirstName(displayName);

  const handleNext = () => {
    const validation = validatePreferredName(displayName);
    if (!validation.valid) {
      showToast(validation.error || 'Please enter your preferred name', 'info');
      return;
    }
    setStep('role');
  };

  const handleComplete = async () => {
    const validation = validatePreferredName(displayName);
    if (!validation.valid) {
      setStep('name');
      showToast(validation.error || 'Please enter your preferred name', 'info');
      return;
    }

    setSubmitting(true);
    try {
      if (routeState.session?.user) {
        await v1Client.identity.createInitialBond({
          capacity: selectedRole,
          displayName: displayName.trim(),
        });
        await refreshProfile();
      } else {
        const guest = await getOrCreateLocalGuestSession();
        await createLocalGuestInitialBond(guest.id, selectedRole, {
          displayName: displayName.trim(),
        });
        await completeLocalGuestOnboarding(guest.id);
        await activateLocalGuestSession(guest);
      }
      celebrate(`Welcome, ${firstName}`);
      router.replace('/self');
    } catch (error) {
      // No bond means no entry, so the person stays here and can try again.
      console.warn('[onboarding] first bond failed:', error);
      showToast('We could not finish setting up your space. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ErrorBoundary name="OnboardingRoute">
      <View style={styles.root}>
        <SafeAreaView style={styles.safeArea}>
          {/* The focused field scrolls clear of the keyboard and its typing bar. */}
          <View style={styles.container}>
            <KeyboardAwareScrollView
              bottomOffset={64}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
            >
              {/* Each step settles in the way the world moves (a fade only when motion is low). */}
              <WorldEnter key={step}>
                <Surface tone="raised" style={styles.cardSurface}>
                  {step === 'language' ? (
                    <View style={styles.stepContainer}>
                      <View style={styles.header}>
                        <Text kind="title" align="center" tone="ink">
                          ආයුබෝවන් · வணக்கம் · Welcome
                        </Text>
                        <Text kind="body" tone="soft" align="center" style={styles.subline}>
                          Choose the language you read best. You can change it any time.
                        </Text>
                      </View>
                      <RadioGroup
                        label="Language"
                        value={language}
                        onChange={(lang) => void setLanguage(lang)}
                        options={LANGUAGES}
                      />
                      <View style={styles.actionRow}>
                        <Button
                          label="Return to welcome"
                          variant="secondary"
                          onPress={() => router.replace('/welcome')}
                        />
                        <Button
                          label="Next →"
                          variant="primary"
                          onPress={() => setStep('comfort')}
                        />
                      </View>
                    </View>
                  ) : step === 'comfort' ? (
                    // Asked once, early, with big previews: an older teacher never hunts for it.
                    <View style={styles.stepContainer}>
                      <View style={styles.header}>
                        <Text kind="title" align="center" tone="ink">
                          How do you like to see things?
                        </Text>
                        <Text kind="body" tone="soft" align="center" style={styles.subline}>
                          Tap the one that is easiest for you. It changes at once, and you can tune
                          it later in Reading and comfort.
                        </Text>
                      </View>
                      <ComfortPresets />
                      <View style={styles.actionRow}>
                        <Button
                          label="← Back"
                          variant="secondary"
                          onPress={() => setStep('language')}
                        />
                        <Button label="Next →" variant="primary" onPress={() => setStep('name')} />
                      </View>
                    </View>
                  ) : step === 'name' ? (
                    <View style={styles.stepContainer}>
                      <View style={styles.header}>
                        <Text kind="title" align="center" tone="ink">
                          {detectedName && !isEditingCustomName
                            ? CANONICAL_NAME_PROMPTS.titleWithDetected(detectedName)
                            : CANONICAL_NAME_PROMPTS.title}
                        </Text>
                        <Text kind="body" tone="soft" align="center" style={styles.subline}>
                          {detectedName && !isEditingCustomName
                            ? 'Confirm how you want to be greeted throughout your space.'
                            : CANONICAL_NAME_PROMPTS.helperText}
                        </Text>
                      </View>

                      <View style={styles.fieldWrapper}>
                        <PreferredNameEntry
                          detectedName={detectedName}
                          displayName={displayName}
                          isEditingCustomName={isEditingCustomName}
                          onDisplayNameChange={setDisplayName}
                          onSelectDetectedName={(name) => {
                            setDisplayName(name);
                            setStep('role');
                          }}
                          onStartCustomName={() => {
                            setIsEditingCustomName(true);
                            setDisplayName(detectedName);
                          }}
                          onBackToDetectedName={() => {
                            setDisplayName(detectedName);
                            setIsEditingCustomName(false);
                          }}
                        />
                      </View>

                      <View style={styles.actionRow}>
                        <Button
                          label="← Back"
                          variant="secondary"
                          onPress={() => setStep('comfort')}
                        />
                        {!detectedName || isEditingCustomName ? (
                          <Button
                            label="Next →"
                            variant="primary"
                            disabled={!displayName.trim()}
                            onPress={handleNext}
                          />
                        ) : null}
                      </View>
                    </View>
                  ) : step === 'role' ? (
                    <View style={styles.stepContainer}>
                      <View style={styles.header}>
                        <Text kind="title" align="center" tone="ink">
                          Choose your role, {firstName}
                        </Text>
                        <Text kind="body" tone="soft" align="center" style={styles.subline}>
                          We will shape your personal space around what you do.
                        </Text>
                      </View>

                      <RoleCardGrid
                        selectedRoleId={selectedRole}
                        onSelectRole={setSelectedRole}
                        roles={CANONICAL_CIVIC_ROLES}
                      />

                      <Text kind="body" tone="soft" align="center" style={styles.subline}>
                        School leaders join by invitation.
                      </Text>

                      <View style={styles.actionRow}>
                        <Button
                          label="← Back"
                          variant="secondary"
                          disabled={submitting}
                          onPress={() => setStep('name')}
                        />
                        <Button label="Next →" variant="primary" onPress={() => setStep('world')} />
                      </View>
                    </View>
                  ) : (
                    <View style={styles.stepContainer}>
                      <View style={styles.header}>
                        <Text kind="title" align="center" tone="ink">
                          Choose your world
                        </Text>
                        <Text kind="body" tone="soft" align="center" style={styles.subline}>
                          It dresses everything you see, at every hour. Classic is plain and calm;
                          the others are alive. You can change it any time from your photo.
                        </Text>
                      </View>

                      {/* Choosing changes the floor behind this card at once: you see the world you pick. */}
                      <WorldPicker
                        label="Your world"
                        value={worldId}
                        onChange={(id) => void setWorld(id)}
                      />

                      <View style={styles.actionRow}>
                        <Button
                          label="← Back"
                          variant="secondary"
                          disabled={submitting}
                          onPress={() => setStep('role')}
                        />
                        <Button
                          label={submitting ? 'Entering…' : `Enter ${worldName(worldId)} →`}
                          variant="primary"
                          disabled={submitting}
                          onPress={handleComplete}
                        />
                      </View>
                    </View>
                  )}
                </Surface>
              </WorldEnter>
            </KeyboardAwareScrollView>
          </View>
        </SafeAreaView>
      </View>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  cardSurface: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    padding: 24,
  },
  stepContainer: {
    width: '100%',
  },
  header: {
    marginBottom: 20,
    alignItems: 'center',
    gap: 8,
  },
  subline: {
    maxWidth: 360,
  },
  fieldWrapper: {
    marginVertical: 12,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    gap: 12,
  },
});
