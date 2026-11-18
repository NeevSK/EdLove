import { hapticLight, hapticSuccess } from '@repo/ui/utils/haptics';
import type React from 'react';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { institutionsAPI } from '../../api';

export type SchoolLevel =
  | 'preSchool'
  | 'primary'
  | 'secondary'
  | 'k12'
  | 'university'
  | 'vocational'
  | 'other';

export type GuardianPolicy = 'open' | 'manual_approval' | 'strict_document';

export interface SchoolSettingsSheetProps {
  schoolId: string;
  initialName: string;
  initialHandle: string;
  initialType?: SchoolLevel;
  initialAvatarUrl?: string;
  initialTimezone?: string;
  initialGuardianPolicy?: GuardianPolicy;
  onClose?: () => void;
  onUpdated?: (updated: {
    name: string;
    handle: string;
    type: SchoolLevel;
    avatarUrl?: string;
    timezone?: string;
    guardianVerificationPolicy?: GuardianPolicy;
  }) => void;
}

const LEVEL_OPTIONS: Array<{ key: SchoolLevel; label: string }> = [
  { key: 'k12', label: 'K-12 Comprehensive' },
  { key: 'primary', label: 'Primary (Grades 1-5)' },
  { key: 'secondary', label: 'Secondary (Grades 6-13)' },
  { key: 'preSchool', label: 'Pre-School / Early Childhood' },
  { key: 'university', label: 'Higher Education / University' },
  { key: 'vocational', label: 'Vocational / Technical' },
  { key: 'other', label: 'Other Educational Foundation' },
];

const POLICY_OPTIONS: Array<{ key: GuardianPolicy; label: string; desc: string }> = [
  {
    key: 'open',
    label: 'Open Verification',
    desc: 'Guardians verify instantly via student identity bond',
  },
  {
    key: 'manual_approval',
    label: 'Manual Approval',
    desc: 'School leadership reviews and approves guardian requests',
  },
  {
    key: 'strict_document',
    label: 'Strict Document Verification',
    desc: 'Requires verified civil registry identity documentation',
  },
];

export const SchoolSettingsSheet: React.FC<SchoolSettingsSheetProps> = ({
  schoolId,
  initialName,
  initialHandle,
  initialType = 'k12',
  initialAvatarUrl = '',
  initialTimezone = 'Asia/Colombo',
  initialGuardianPolicy = 'open',
  onClose,
  onUpdated,
}) => {
  const [name, setName] = useState(initialName);
  const [handle, setHandle] = useState(initialHandle);
  const [type, setType] = useState<SchoolLevel>(initialType);
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl);
  const [timezone, setTimezone] = useState(initialTimezone);
  const [guardianPolicy, setGuardianPolicy] = useState<GuardianPolicy>(initialGuardianPolicy);

  // Handle availability check
  const [checkingHandle, setCheckingHandle] = useState(false);
  const [handleAvailable, setHandleAvailable] = useState<boolean | null>(true);
  const [handleError, setHandleError] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const verifyHandle = useCallback(
    async (candidate: string) => {
      const trimmed = candidate.trim().toLowerCase();
      if (!trimmed) {
        setHandleAvailable(false);
        setHandleError('Handle cannot be empty');
        return;
      }
      if (trimmed === initialHandle.toLowerCase()) {
        setHandleAvailable(true);
        setHandleError(null);
        return;
      }

      try {
        setCheckingHandle(true);
        const res = await institutionsAPI.checkHandleAvailable({ handle: trimmed, schoolId });
        setHandleAvailable(res.available);
        setHandleError(res.available ? null : 'Handle is already taken by another institution');
      } catch {
        setHandleAvailable(true);
      } finally {
        setCheckingHandle(false);
      }
    },
    [initialHandle, schoolId],
  );

  const onHandleChange = (val: string) => {
    setHandle(val);
    void verifyHandle(val);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setErrorMessage('School name is required');
      return;
    }
    if (handleAvailable === false) {
      setErrorMessage('Please select an available handle');
      return;
    }

    try {
      setSaving(true);
      setErrorMessage(null);
      hapticLight();

      await institutionsAPI.update({
        schoolId,
        name: name.trim(),
        handle: handle.trim().toLowerCase(),
        type,
        avatar_url: avatarUrl.trim() || undefined,
        timezone: timezone.trim() || undefined,
        guardian_verification_policy: guardianPolicy,
      });

      hapticSuccess();
      setSaveSuccess(true);
      onUpdated?.({
        name: name.trim(),
        handle: handle.trim().toLowerCase(),
        type,
        avatarUrl: avatarUrl.trim() || undefined,
        timezone: timezone.trim() || undefined,
        guardianVerificationPolicy: guardianPolicy,
      });

      setTimeout(() => {
        setSaveSuccess(false);
        onClose?.();
      }, 1200);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update institutional profile';
      setErrorMessage(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-phase-canvas p-4" contentContainerStyle={{ paddingBottom: 60 }}>
      {/* Header */}
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-1">
          <Text className="text-xl font-black text-phaseText-primary">School Settings & Profile</Text>
          <Text className="text-xs font-bold text-phaseText-secondary">
            Progressive Elaboration • Non-Blocking Upgrades
          </Text>
        </View>
        {onClose && (
          <Pressable
            testID="close-settings-sheet"
            onPress={onClose}
            className="p-2 rounded-full bg-phase-surface border border-phase-border"
          >
            <Text className="text-sm font-bold text-phaseText-primary">✕</Text>
          </Pressable>
        )}
      </View>

      {/* Architectural Guarantee Banner */}
      <View className="bg-phase-interactive/5 border border-phase-interactive/20 rounded-2xl p-4 mb-5">
        <Text className="text-xs font-black text-phase-interactive uppercase tracking-wider mb-1">
          Immutable Identity Guarantee
        </Text>
        <Text className="text-xs text-phaseText-secondary leading-relaxed">
          Updating the school name, handle, or branding takes effect immediately for display. All previously
          generated and printed physical QR codes continue working seamlessly because they anchor on the permanent
          institutional ID.
        </Text>
      </View>

      {/* School Name */}
      <View className="bg-phase-surface border border-phase-border rounded-3xl p-5 mb-5 shadow-sm">
        <Text className="text-xs font-bold text-phaseText-secondary uppercase tracking-wider mb-2">
          Institution Official Name
        </Text>
        <TextInput
          testID="school-name-input"
          value={name}
          onChangeText={setName}
          placeholder="e.g. Royal College Colombo"
          placeholderTextColor="#9ca3af"
          className="bg-phase-canvas border border-phase-border rounded-xl p-3 text-sm font-bold text-phaseText-primary mb-4"
        />

        {/* Handle */}
        <Text className="text-xs font-bold text-phaseText-secondary uppercase tracking-wider mb-2">
          Vanity Handle Slug
        </Text>
        <View className="relative mb-1">
          <TextInput
            testID="school-handle-input"
            value={handle}
            onChangeText={onHandleChange}
            onBlur={() => void verifyHandle(handle)}
            placeholder="e.g. royal-colombo"
            placeholderTextColor="#9ca3af"
            autoCapitalize="none"
            className="bg-phase-canvas border border-phase-border rounded-xl p-3 text-sm font-mono text-phaseText-primary pr-12"
          />
          {checkingHandle && (
            <View className="absolute right-3 top-3">
              <ActivityIndicator size="small" />
            </View>
          )}
        </View>
        {handleError ? (
          <Text className="text-xs text-red-500 font-bold mb-4">{handleError}</Text>
        ) : handleAvailable && handle !== initialHandle ? (
          <Text className="text-xs text-green-600 font-bold mb-4">✓ Handle is available</Text>
        ) : (
          <Text className="text-xs text-phaseText-muted font-bold mb-4">
            Used in vanity URLs: https://gurudevi.app/@{handle || 'handle'}
          </Text>
        )}

        {/* Institutional Level / Sector */}
        <Text className="text-xs font-bold text-phaseText-secondary uppercase tracking-wider mb-2">
          Educational Sector
        </Text>
        <View className="gap-2 mb-4">
          {LEVEL_OPTIONS.map((opt) => (
            <Pressable
              key={opt.key}
              testID={`sector-option-${opt.key}`}
              onPress={() => {
                hapticLight();
                setType(opt.key);
              }}
              className={`p-3 rounded-xl border ${
                type === opt.key
                  ? 'bg-phase-interactive/10 border-phase-interactive'
                  : 'bg-phase-canvas border-phase-border'
              }`}
            >
              <Text
                className={`text-xs font-bold ${
                  type === opt.key ? 'text-phase-interactive' : 'text-phaseText-primary'
                }`}
              >
                {opt.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Crest / Avatar URL */}
        <Text className="text-xs font-bold text-phaseText-secondary uppercase tracking-wider mb-2">
          School Crest / Logo URL
        </Text>
        <TextInput
          testID="school-avatar-input"
          value={avatarUrl}
          onChangeText={setAvatarUrl}
          placeholder="https://... (URL to official crest image)"
          placeholderTextColor="#9ca3af"
          autoCapitalize="none"
          keyboardType="url"
          className="bg-phase-canvas border border-phase-border rounded-xl p-3 text-sm text-phaseText-primary mb-4"
        />

        {/* Timezone */}
        <Text className="text-xs font-bold text-phaseText-secondary uppercase tracking-wider mb-2">
          Operating Timezone
        </Text>
        <TextInput
          testID="school-timezone-input"
          value={timezone}
          onChangeText={setTimezone}
          placeholder="Asia/Colombo"
          placeholderTextColor="#9ca3af"
          autoCapitalize="none"
          className="bg-phase-canvas border border-phase-border rounded-xl p-3 text-sm text-phaseText-primary mb-4"
        />

        {/* Guardian Policy */}
        <Text className="text-xs font-bold text-phaseText-secondary uppercase tracking-wider mb-2">
          Guardian Verification Policy
        </Text>
        <View className="gap-2 mb-6">
          {POLICY_OPTIONS.map((opt) => (
            <Pressable
              key={opt.key}
              testID={`policy-option-${opt.key}`}
              onPress={() => {
                hapticLight();
                setGuardianPolicy(opt.key);
              }}
              className={`p-3 rounded-xl border ${
                guardianPolicy === opt.key
                  ? 'bg-phase-interactive/10 border-phase-interactive'
                  : 'bg-phase-canvas border-phase-border'
              }`}
            >
              <Text
                className={`text-xs font-bold ${
                  guardianPolicy === opt.key ? 'text-phase-interactive' : 'text-phaseText-primary'
                }`}
              >
                {opt.label}
              </Text>
              <Text className="text-[11px] text-phaseText-secondary mt-0.5">{opt.desc}</Text>
            </Pressable>
          ))}
        </View>

        {errorMessage && (
          <Text className="text-xs text-red-500 font-bold mb-4 text-center">{errorMessage}</Text>
        )}

        {saveSuccess && (
          <Text className="text-xs text-green-600 font-bold mb-4 text-center">
            ✓ Institutional profile successfully updated!
          </Text>
        )}

        <Pressable
          testID="save-settings-button"
          onPress={handleSave}
          disabled={saving || checkingHandle}
          className="bg-phase-interactive py-3.5 rounded-2xl items-center justify-center active:scale-98 shadow-sm"
        >
          {saving ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text className="text-white text-sm font-black">Save Institutional Changes</Text>
          )}
        </Pressable>
      </View>
    </ScrollView>
  );
};
