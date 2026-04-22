import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase, validators, validateForm, handleAPIError } from '@repo/core';
import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  Button,
  ButtonText,
  Input,
  InputField,
  Pressable,
  Center,
  ButtonSpinner,
} from '../gluestack';
import { useTheme } from '../hooks/useTheme';
import { useSanctuaryToast } from '../providers/ToastProvider';
import { SanctuaryBackground } from '../components/SanctuaryBackground';
import { BreathAnimation } from '../components/BreathAnimation';
import { LivingGlow } from '../components/LivingGlow';

interface AuthScreenProps {
  onContinueAsGuest?: () => void;
  onSuccess?: () => void;
  onBack?: () => void;
  initialMode?: 'login' | 'signup';
}

const ENTRY_PILLARS = ['Self', 'Classroom', 'Community', 'Library'];

export function AuthScreenWeb({
  onContinueAsGuest,
  onSuccess,
  onBack,
  initialMode,
}: AuthScreenProps) {
  const { t } = useTranslation();
  const { scene, accent, text } = useTheme();
  const surfaceToken = scene.surface;
  const { showToast } = useSanctuaryToast();

  const [mode, setMode] = useState<'signup' | 'login'>(
    initialMode === 'login' ? 'login' : 'signup',
  );
  const [showEmailForm, setShowEmailForm] = useState(initialMode === 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const modeCopy =
    mode === 'signup'
      ? {
          eyebrow: 'Create your sanctuary identity',
          title: 'Begin inside Gurudevi',
          subtitle:
            'Keep your first step calm, luminous, and connected to your learning sanctuary.',
          primary: 'Create Account',
          google: 'Continue with Google',
          email: 'Continue with Email',
        }
      : {
          eyebrow: 'Return to your sanctuary',
          title: 'Welcome back to Gurudevi',
          subtitle:
            'Pick up your journey where you left it across self, classroom, community, and library.',
          primary: 'Log In',
          google: 'Sign in with Google',
          email: 'Sign in with Email',
        };

  const handleGoogleAuth = async () => {
    setLoading(true);
    setErrors({});
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin },
      });
      if (error) throw error;
    } catch (err: any) {
      const apiError = handleAPIError(err);
      showToast({
        message:
          typeof apiError === 'string'
            ? apiError
            : (apiError as any).message || 'Google sign-in failed',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async () => {
    setLoading(true);
    setErrors({});

    const validation = validateForm(
      { email, password },
      { email: validators.email, password: (val) => validators.nonEmpty(val, 'Password') },
    );

    if (!validation.isValid) {
      setErrors(validation.errors);
      setLoading(false);
      return;
    }

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        showToast({
          message: t('auth.checkEmail') || 'Check your email to confirm your account',
          type: 'success',
        });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onSuccess?.();
      }
    } catch (err: any) {
      const apiError = handleAPIError(err);
      showToast({
        message:
          typeof apiError === 'string'
            ? apiError
            : (apiError as any).message || 'Authentication failed',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = async () => {
    setLoading(true);
    try {
      onContinueAsGuest?.();
    } catch (err: any) {
      showToast({
        message: err.message || 'Guest mode failed',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="flex-1 min-h-screen relative overflow-hidden bg-phase-world">
      <SanctuaryBackground />

      <Box className="flex-1 z-10 w-full max-w-[1180px] mx-auto p-8 lg:p-12">
        <Box className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-7 items-stretch min-h-[calc(100vh-120px)]">
          {/* Story Section */}
          <Box className="rounded-[40px] border border-phase-border bg-phase-surface/40 overflow-hidden relative">
            <VStack className="h-full p-8 lg:p-12 justify-between gap-8">
              <VStack className="gap-8">
                <Box className="px-4 py-2 rounded-full border border-phase-border bg-phase-surface/60 w-fit">
                  <Text className="text-[12px] font-bold tracking-[0.08em] uppercase text-phase-secondary">
                    Gurudevi Sanctuary
                  </Text>
                </Box>

                <VStack className="gap-6">
                  <LivingGlow active size={132} className="items-center justify-center p-0">
                    <Box className="w-[76px] h-[76px] rounded-[24px] bg-phase-surface items-center justify-center shadow-lg border border-phase-border">
                      <Text className="text-3xl text-phase-primary">✦</Text>
                    </Box>
                  </LivingGlow>

                  <VStack className="gap-4">
                    <Text className="text-[12px] font-extrabold tracking-[0.12em] uppercase text-phase-secondary">
                      {modeCopy.eyebrow}
                    </Text>
                    <Heading className="text-5xl lg:text-7xl font-bold tracking-[-0.07em] text-phase-primary leading-[0.95]">
                      {modeCopy.title}
                    </Heading>
                    <Text className="text-lg text-phase-secondary max-w-md leading-relaxed">
                      {modeCopy.subtitle}
                    </Text>
                  </VStack>
                </VStack>

                <HStack className="gap-2 flex-wrap">
                  {ENTRY_PILLARS.map((pillar) => (
                    <Box
                      key={pillar}
                      className="px-4 py-2 rounded-full border border-phase-border bg-phase-surface/60"
                    >
                      <Text className="text-[12px] font-bold tracking-wider text-phase-secondary">
                        {pillar}
                      </Text>
                    </Box>
                  ))}
                </HStack>
              </VStack>

              <Box className="rounded-3xl border border-phase-border bg-phase-surface/80 p-8">
                <VStack className="gap-6">
                  <VStack className="gap-2">
                    <Text className="text-[11px] font-extrabold tracking-[0.12em] uppercase text-phase-muted">
                      Why this step matters
                    </Text>
                    <Text className="text-phase-primary leading-relaxed text-base">
                      Your account keeps learning, invitations, and profile presence gathered into
                      one living place without changing how you use the app.
                    </Text>
                  </VStack>
                  <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <VStack className="p-4 rounded-2xl bg-phase-surface/50 border border-phase-border gap-1">
                      <Text className="font-bold text-phase-primary">Gentle entry</Text>
                      <Text className="text-sm text-phase-secondary">
                        Start with Google or email.
                      </Text>
                    </VStack>
                    <VStack className="p-4 rounded-2xl bg-phase-surface/50 border border-phase-border gap-1">
                      <Text className="font-bold text-phase-primary">Guest-safe</Text>
                      <Text className="text-sm text-phase-secondary">
                        Browse first when logging in later feels better.
                      </Text>
                    </VStack>
                  </Box>
                </VStack>
              </Box>
            </VStack>
          </Box>

          {/* Panel Section */}
          <Box className="rounded-[40px] border border-phase-border bg-phase-surface/80 shadow-2xl overflow-hidden relative">
            <VStack className="h-full p-8 lg:p-12 justify-center gap-8">
              {onBack && (
                <Button variant="ghost" onPress={onBack} className="self-start pl-0">
                  <HStack className="gap-2 items-center">
                    <Text className="text-phase-secondary text-lg">←</Text>
                    <ButtonText className="text-phase-secondary">Back</ButtonText>
                  </HStack>
                </Button>
              )}

              <VStack className="gap-6">
                <VStack className="gap-2">
                  <Text className="text-[11px] font-extrabold tracking-[0.12em] uppercase text-phase-secondary">
                    {mode === 'signup' ? 'Identity' : 'Return'}
                  </Text>

                  <HStack className="p-1 rounded-full bg-phase-surface/50 border border-phase-border w-fit">
                    <Button
                      variant="ghost"
                      className={`px-6 py-2 rounded-full h-auto ${mode === 'signup' ? 'bg-phase-world' : ''}`}
                      onPress={() => {
                        setMode('signup');
                        setShowEmailForm(false);
                        setErrors({});
                      }}
                    >
                      <ButtonText
                        className={`text-sm font-bold ${mode === 'signup' ? 'text-phase-primary' : 'text-phase-secondary'}`}
                      >
                        Sign Up
                      </ButtonText>
                    </Button>
                    <Button
                      variant="ghost"
                      className={`px-6 py-2 rounded-full h-auto ${mode === 'login' ? 'bg-phase-world' : ''}`}
                      onPress={() => {
                        setMode('login');
                        setShowEmailForm(true);
                        setErrors({});
                      }}
                    >
                      <ButtonText
                        className={`text-sm font-bold ${mode === 'login' ? 'text-phase-primary' : 'text-phase-secondary'}`}
                      >
                        Log In
                      </ButtonText>
                    </Button>
                  </HStack>
                </VStack>

                <VStack className="gap-3">
                  <Heading className="text-3xl lg:text-4xl font-bold tracking-tight text-phase-primary">
                    {mode === 'signup' ? 'Choose your path in' : 'Reconnect with'} Gurudevi
                  </Heading>
                  <Text className="text-phase-secondary leading-relaxed">
                    {mode === 'signup'
                      ? 'Create a held, cross-device identity when you are ready.'
                      : 'Use the path that already belongs to you.'}
                  </Text>
                </VStack>
              </VStack>

              <VStack className="gap-4 w-full">
                <Button
                  size="lg"
                  onPress={handleGoogleAuth}
                  isDisabled={loading}
                  className="h-[60px] rounded-2xl bg-phase-primary shadow-xl hover:translate-y-[-1px] transition-transform"
                >
                  <HStack className="gap-3 items-center">
                    <Box className="w-7 h-7 rounded-full bg-white items-center justify-center">
                      <Text className="text-[#4285F4] font-black">G</Text>
                    </Box>
                    <ButtonText className="text-phase-world font-bold">
                      {modeCopy.google}
                    </ButtonText>
                  </HStack>
                </Button>

                {!showEmailForm && (
                  <Button
                    size="lg"
                    variant="outline"
                    onPress={() => setShowEmailForm(true)}
                    className="h-[60px] rounded-2xl border-phase-border bg-phase-surface/50"
                  >
                    <ButtonText className="text-phase-primary">{modeCopy.email}</ButtonText>
                  </Button>
                )}

                {showEmailForm && (
                  <BreathAnimation delay={100}>
                    <VStack className="p-6 rounded-3xl bg-phase-surface/50 border border-phase-border gap-6">
                      <HStack className="justify-between items-baseline">
                        <Text className="font-bold text-phase-primary">Email path</Text>
                        <Text className="text-sm text-phase-muted">
                          {mode === 'signup' ? 'Create calmly' : 'Enter directly'}
                        </Text>
                      </HStack>

                      <VStack className="gap-4">
                        <VStack className="gap-2">
                          <Text className="text-sm font-semibold text-phase-primary ml-1">
                            Email
                          </Text>
                          <Input className="rounded-2xl border-phase-border bg-phase-surface/80 h-[52px]">
                            <InputField
                              placeholder="you@example.com"
                              value={email}
                              onChangeText={setEmail}
                              className="text-phase-primary"
                              autoComplete="email"
                            />
                          </Input>
                          {errors.email && (
                            <Text className="text-xs text-phase-error ml-1">{errors.email}</Text>
                          )}
                        </VStack>

                        <VStack className="gap-2">
                          <Text className="text-sm font-semibold text-phase-primary ml-1">
                            Password
                          </Text>
                          <Input className="rounded-2xl border-phase-border bg-phase-surface/80 h-[52px]">
                            <InputField
                              placeholder="Your password"
                              value={password}
                              onChangeText={setPassword}
                              secureTextEntry
                              className="text-phase-primary"
                            />
                          </Input>
                          {errors.password && (
                            <Text className="text-xs text-phase-error ml-1">{errors.password}</Text>
                          )}
                        </VStack>

                        <Button
                          size="lg"
                          onPress={handleEmailAuth}
                          isDisabled={loading}
                          className="h-[56px] rounded-2xl bg-phase-primary mt-2"
                        >
                          {loading ? (
                            <ButtonSpinner className="text-phase-world" />
                          ) : (
                            <ButtonText className="text-phase-world font-bold">
                              {modeCopy.primary}
                            </ButtonText>
                          )}
                        </Button>

                        <Button
                          variant="ghost"
                          onPress={() => setShowEmailForm(false)}
                          className="self-center"
                        >
                          <ButtonText className="text-phase-secondary text-sm underline">
                            Back to Google
                          </ButtonText>
                        </Button>
                      </VStack>
                    </VStack>
                  </BreathAnimation>
                )}

                {mode === 'login' && !showEmailForm && (
                  <Button variant="ghost" onPress={handleGuest} className="h-auto py-2">
                    <ButtonText className="text-phase-secondary font-medium">
                      Continue as Guest
                    </ButtonText>
                  </Button>
                )}
              </VStack>

              {errors._form && (
                <Box className="p-4 rounded-xl border border-phase-error/20 bg-phase-error/5">
                  <Text className="text-phase-error text-center text-sm">{errors._form}</Text>
                </Box>
              )}
            </VStack>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default AuthScreenWeb;
