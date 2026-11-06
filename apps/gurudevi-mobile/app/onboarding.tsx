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
import { Button, SceneBackdrop, Surface, Text, useScene } from '@repo/ui/components/native';
import { useWorld } from '@repo/ui/theme/native';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PreferredNameEntry } from '@/components/PreferredNameEntry';
import { RoleCardGrid } from '@/components/RoleCardGrid';
import { useBootstrapRouteState } from '@/entry/bootstrapRouteState';
import { v1Client } from '@/lib/v1Client';

export { RouteErrorBoundary as ErrorBoundary };

export default function OnboardingRoute() {
  const router = useRouter();
  const { refreshProfile } = useAuth();
  const routeState = useBootstrapRouteState('/onboarding');
  const world = useWorld();
  const wt = world.tokens;
  const scene = useScene({ presence: 'full' });

  const [step, setStep] = useState<'name' | 'role'>('name');
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
      showToast(`Welcome to Gurudevi, ${firstName}!`, 'success');
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
      <View style={[styles.root, { backgroundColor: wt.ground }]}>
        <SceneBackdrop
          scene={scene}
          wash={{ colour: wt.ground, edge: 0.12, text: 1.0, textFrom: 0.35 }}
        />
        <SafeAreaView style={styles.safeArea}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.container}
          >
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <Surface tone="raised" style={styles.cardSurface}>
                {step === 'name' ? (
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
                        label="Return to welcome"
                        variant="secondary"
                        onPress={() => router.replace('/welcome')}
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
                ) : (
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
                      <Button
                        label={submitting ? 'Entering…' : 'Enter Sanctuary →'}
                        variant="primary"
                        disabled={submitting}
                        onPress={handleComplete}
                      />
                    </View>
                  </View>
                )}
              </Surface>
            </ScrollView>
          </KeyboardAvoidingView>
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
