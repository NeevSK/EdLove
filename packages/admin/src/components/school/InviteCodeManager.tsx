import { QRBuilder } from '@repo/core/logic/utils/QRBuilder';
import QRCodeGenerator from '@repo/ui/qr/QRCodeGenerator';
import { hapticLight, hapticSuccess } from '@repo/ui/utils/haptics';
import * as Clipboard from 'expo-clipboard';
import type React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Share, Text, TextInput, View } from 'react-native';
import { institutionsAPI } from '../../api';

export type InviteRole = 'TEACH' | 'STUDY' | 'STAFF' | 'GUARD';

export interface InviteCodeManagerProps {
  schoolId: string;
  groupId: string;
  schoolName: string;
  schoolHandle?: string;
  onClose?: () => void;
}

interface InviteItem {
  id: string;
  code: string;
  role: string;
  maxUses: number | null;
  usedCount: number;
  expiresAt: string | null;
  isRevoked: boolean;
  createdAt: string;
}

const ROLE_OPTIONS: Array<{ key: InviteRole; label: string; desc: string }> = [
  { key: 'TEACH', label: 'Faculty / Teacher', desc: 'Grants classroom teaching & grading permissions' },
  { key: 'STUDY', label: 'Student', desc: 'Enrolls into school roster & assigned grade circles' },
  { key: 'GUARD', label: 'Guardian / Parent', desc: 'Binds to student records & administrative notices' },
  { key: 'STAFF', label: 'Administrative Staff', desc: 'Enables co-curricular, facilities, and school ops' },
];

const EXPIRY_OPTIONS: Array<{ label: string; days: number | undefined }> = [
  { label: '7 Days', days: 7 },
  { label: '30 Days', days: 30 },
  { label: '90 Days', days: 90 },
  { label: 'No Expiry', days: undefined },
];

export const InviteCodeManager: React.FC<InviteCodeManagerProps> = ({
  schoolId,
  groupId,
  schoolName,
  schoolHandle,
  onClose,
}) => {
  const [selectedRole, setSelectedRole] = useState<InviteRole>('TEACH');
  const [selectedExpiry, setSelectedExpiry] = useState<number | undefined>(30);
  const [maxUsesInput, setMaxUsesInput] = useState<string>('');
  const [generating, setGenerating] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<{
    code: string;
    inviteUrl: string;
    qrPayload: string;
  } | null>(null);

  const [invites, setInvites] = useState<InviteItem[]>([]);
  const [fetchingList, setFetchingList] = useState(true);
  const [revokingCode, setRevokingCode] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showUniversalFlyer, setShowUniversalFlyer] = useState(false);

  // Universal School Join QR Payload
  const universalQRPayload = QRBuilder.school(schoolId, groupId, schoolHandle);

  const reloadInvites = useCallback(async () => {
    try {
      setFetchingList(true);
      const res = await institutionsAPI.listInviteCodes({ schoolId, includeExpired: false });
      setInvites(res.invites);
    } catch {
      // Graceful fallback for offline or mock
    } finally {
      setFetchingList(false);
    }
  }, [schoolId]);

  useEffect(() => {
    let mounted = true;
    void (async () => {
      try {
        const res = await institutionsAPI.listInviteCodes({ schoolId, includeExpired: false });
        if (mounted) {
          setInvites(res.invites);
          setFetchingList(false);
        }
      } catch {
        if (mounted) setFetchingList(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [schoolId]);

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      hapticLight();
      const maxUses = maxUsesInput.trim() ? parseInt(maxUsesInput.trim(), 10) : undefined;
      const res = await institutionsAPI.createInviteCode({
        schoolId,
        role: selectedRole,
        validityDays: selectedExpiry,
        maxUses: Number.isNaN(maxUses) ? undefined : maxUses,
      });

      hapticSuccess();
      setGeneratedResult({
        code: res.code,
        inviteUrl: res.inviteUrl,
        qrPayload: res.qrPayload,
      });
      void reloadInvites();
    } catch {
      // Error handled gracefully
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = async (text: string, key: string) => {
    hapticLight();
    await Clipboard.setStringAsync(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleShare = async (title: string, message: string) => {
    hapticLight();
    await Share.share({ title, message });
  };

  const handleRevoke = async (code: string) => {
    try {
      setRevokingCode(code);
      hapticLight();
      await institutionsAPI.revokeInviteCode({ schoolId, code });
      hapticSuccess();
      setInvites((prev) => prev.filter((i) => i.code !== code));
      if (generatedResult?.code === code) {
        setGeneratedResult(null);
      }
    } catch {
      // Error handled
    } finally {
      setRevokingCode(null);
    }
  };

  return (
    <ScrollView className="flex-1 bg-phase-canvas p-4" contentContainerStyle={{ paddingBottom: 60 }}>
      {/* Header */}
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-1">
          <Text className="text-xl font-black text-phaseText-primary">{schoolName}</Text>
          <Text className="text-xs font-bold text-phaseText-secondary">
            Governance & Invitation Command Center {schoolHandle ? `@${schoolHandle}` : ''}
          </Text>
        </View>
        {onClose && (
          <Pressable
            testID="close-invite-manager"
            onPress={onClose}
            className="p-2 rounded-full bg-phase-surface border border-phase-border"
          >
            <Text className="text-sm font-bold text-phaseText-primary">✕</Text>
          </Pressable>
        )}
      </View>

      {/* Universal School Flyer CTA Card */}
      <View className="bg-phase-surface border border-phase-border rounded-3xl p-5 mb-6 shadow-sm">
        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-1 mr-3">
            <Text className="text-base font-black text-phaseText-primary">Universal School QR Flyer</Text>
            <Text className="text-xs text-phaseText-secondary mt-0.5">
              Open QR for all members. Automatically connects to school and public circles.
            </Text>
          </View>
          <Pressable
            testID="toggle-universal-flyer"
            onPress={() => setShowUniversalFlyer((prev) => !prev)}
            className="px-3 py-1.5 rounded-xl bg-phase-interactive"
          >
            <Text className="text-xs font-bold text-white">
              {showUniversalFlyer ? 'Hide Flyer' : 'View Flyer'}
            </Text>
          </Pressable>
        </View>

        {showUniversalFlyer && (
          <View className="items-center mt-4 pt-4 border-t border-phase-border" testID="universal-flyer-panel">
            <View className="bg-white p-4 rounded-2xl shadow-sm mb-3">
              <QRCodeGenerator
                value={universalQRPayload}
                size={180}
                backgroundColor="#ffffff"
                color="#000000"
              />
            </View>
            <Text className="text-xs font-mono text-phaseText-secondary text-center px-4 mb-4">
              {universalQRPayload}
            </Text>
            <View className="flex-row gap-3">
              <Pressable
                testID="copy-universal-link"
                onPress={() => handleCopy(universalQRPayload, 'universal')}
                className="px-4 py-2 rounded-xl bg-phase-surface border border-phase-border active:scale-95"
              >
                <Text className="text-xs font-bold text-phaseText-primary">
                  {copiedKey === 'universal' ? '✓ Link Copied' : 'Copy Flyer Link'}
                </Text>
              </Pressable>
              <Pressable
                testID="share-universal-flyer"
                onPress={() =>
                  handleShare(
                    `Join ${schoolName}`,
                    `Scan or open this official link to join ${schoolName} on Gurudevi:\n${universalQRPayload}`,
                  )
                }
                className="px-4 py-2 rounded-xl bg-phase-interactive active:scale-95"
              >
                <Text className="text-xs font-bold text-white">Share Flyer</Text>
              </Pressable>
            </View>
          </View>
        )}
      </View>

      {/* Role-Specific Code Generator */}
      <View className="bg-phase-surface border border-phase-border rounded-3xl p-5 mb-6 shadow-sm">
        <Text className="text-lg font-black text-phaseText-primary mb-1">Generate Role Invite Code</Text>
        <Text className="text-xs text-phaseText-secondary mb-4">
          Create bounded, auditable keys for teachers, students, or guardians.
        </Text>

        {/* Role Selector */}
        <Text className="text-xs font-bold text-phaseText-secondary uppercase tracking-wider mb-2">
          Target Role
        </Text>
        <View className="gap-2 mb-4">
          {ROLE_OPTIONS.map((opt) => (
            <Pressable
              key={opt.key}
              testID={`role-option-${opt.key}`}
              onPress={() => {
                hapticLight();
                setSelectedRole(opt.key);
              }}
              className={`p-3 rounded-2xl border transition-all ${
                selectedRole === opt.key
                  ? 'bg-phase-interactive/10 border-phase-interactive'
                  : 'bg-phase-canvas border-phase-border'
              }`}
            >
              <View className="flex-row items-center justify-between">
                <Text
                  className={`text-sm font-black ${
                    selectedRole === opt.key ? 'text-phase-interactive' : 'text-phaseText-primary'
                  }`}
                >
                  {opt.label}
                </Text>
                <Text className="text-[10px] font-mono uppercase text-phaseText-muted">
                  SUFFIX: -{opt.key}
                </Text>
              </View>
              <Text className="text-xs text-phaseText-secondary mt-0.5">{opt.desc}</Text>
            </Pressable>
          ))}
        </View>

        {/* Expiry Selector */}
        <Text className="text-xs font-bold text-phaseText-secondary uppercase tracking-wider mb-2">
          Validity Duration
        </Text>
        <View className="flex-row gap-2 mb-4">
          {EXPIRY_OPTIONS.map((opt) => (
            <Pressable
              key={opt.label}
              onPress={() => {
                hapticLight();
                setSelectedExpiry(opt.days);
              }}
              className={`flex-1 py-2 px-1 rounded-xl items-center border ${
                selectedExpiry === opt.days
                  ? 'bg-phase-interactive border-phase-interactive'
                  : 'bg-phase-canvas border-phase-border'
              }`}
            >
              <Text
                className={`text-xs font-bold ${
                  selectedExpiry === opt.days ? 'text-white' : 'text-phaseText-primary'
                }`}
              >
                {opt.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Max Uses */}
        <Text className="text-xs font-bold text-phaseText-secondary uppercase tracking-wider mb-2">
          Max Uses (Optional)
        </Text>
        <TextInput
          testID="max-uses-input"
          value={maxUsesInput}
          onChangeText={setMaxUsesInput}
          placeholder="e.g. 25 (leave blank for unlimited)"
          placeholderTextColor="#9ca3af"
          keyboardType="numeric"
          className="bg-phase-canvas border border-phase-border rounded-xl p-3 text-sm text-phaseText-primary mb-5"
        />

        <Pressable
          testID="generate-code-button"
          onPress={handleGenerate}
          disabled={generating}
          className="bg-phase-interactive py-3 rounded-2xl items-center justify-center active:scale-98 shadow-sm"
        >
          {generating ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text className="text-white text-sm font-black">Generate Official Invite Code</Text>
          )}
        </Pressable>

        {/* Generated Code Reveal Panel */}
        {generatedResult && (
          <View
            testID="generated-code-result"
            className="mt-5 p-4 rounded-2xl bg-phase-interactive/5 border border-phase-interactive/30 items-center"
          >
            <Text className="text-xs font-bold text-phase-interactive uppercase tracking-wider mb-1">
              Active Key Created
            </Text>
            <Text className="text-2xl font-mono font-black text-phaseText-primary tracking-widest my-1">
              {generatedResult.code}
            </Text>
            <View className="bg-white p-3 rounded-xl shadow-sm my-3">
              <QRCodeGenerator
                value={generatedResult.qrPayload}
                size={140}
                backgroundColor="#ffffff"
                color="#000000"
              />
            </View>
            <View className="flex-row gap-2 mt-1">
              <Pressable
                testID="copy-generated-code"
                onPress={() => handleCopy(generatedResult.code, 'code')}
                className="px-3 py-1.5 rounded-lg bg-phase-surface border border-phase-border"
              >
                <Text className="text-xs font-bold text-phaseText-primary">
                  {copiedKey === 'code' ? '✓ Copied' : 'Copy Code'}
                </Text>
              </Pressable>
              <Pressable
                testID="copy-generated-link"
                onPress={() => handleCopy(generatedResult.inviteUrl, 'link')}
                className="px-3 py-1.5 rounded-lg bg-phase-surface border border-phase-border"
              >
                <Text className="text-xs font-bold text-phaseText-primary">
                  {copiedKey === 'link' ? '✓ Link Copied' : 'Copy Direct Link'}
                </Text>
              </Pressable>
              <Pressable
                testID="share-generated-invite"
                onPress={() =>
                  handleShare(
                    `Invite to ${schoolName}`,
                    `You have been invited to join ${schoolName} on Gurudevi as ${selectedRole}.\n\nCode: ${generatedResult.code}\nLink: ${generatedResult.inviteUrl}`,
                  )
                }
                className="px-3 py-1.5 rounded-lg bg-phase-interactive"
              >
                <Text className="text-xs font-bold text-white">Share</Text>
              </Pressable>
            </View>
          </View>
        )}
      </View>

      {/* Active Invite Codes List */}
      <View className="bg-phase-surface border border-phase-border rounded-3xl p-5 shadow-sm">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-lg font-black text-phaseText-primary">Active Keys & Roster Links</Text>
          <Pressable onPress={reloadInvites} className="px-2 py-1">
            <Text className="text-xs font-bold text-phase-interactive">Refresh</Text>
          </Pressable>
        </View>

        {fetchingList ? (
          <ActivityIndicator className="my-6" />
        ) : invites.length === 0 ? (
          <View className="py-6 items-center">
            <Text className="text-sm text-phaseText-muted font-bold text-center">
              No active invite codes generated yet.
            </Text>
          </View>
        ) : (
          <View className="gap-3">
            {invites.map((invite) => (
              <View
                key={invite.id}
                testID={`invite-row-${invite.code}`}
                className="p-3.5 rounded-2xl bg-phase-canvas border border-phase-border flex-row items-center justify-between"
              >
                <View className="flex-1 mr-2">
                  <View className="flex-row items-center gap-2 mb-1">
                    <Text className="font-mono font-black text-sm text-phaseText-primary">
                      {invite.code}
                    </Text>
                    <View className="px-2 py-0.5 rounded-md bg-phase-interactive/10">
                      <Text className="text-[10px] font-bold text-phase-interactive uppercase">
                        {invite.role}
                      </Text>
                    </View>
                  </View>
                  <Text className="text-xs text-phaseText-secondary">
                    {invite.usedCount} {invite.maxUses ? `/ ${invite.maxUses}` : ''} used
                    {invite.expiresAt ? ` • Expires ${new Date(invite.expiresAt).toLocaleDateString()}` : ' • Never expires'}
                  </Text>
                </View>

                <View className="flex-row items-center gap-2">
                  <Pressable
                    testID={`copy-key-${invite.code}`}
                    onPress={() => handleCopy(invite.code, invite.code)}
                    className="p-2 rounded-xl bg-phase-surface border border-phase-border"
                  >
                    <Text className="text-xs font-bold text-phaseText-primary">
                      {copiedKey === invite.code ? '✓' : 'Copy'}
                    </Text>
                  </Pressable>
                  <Pressable
                    testID={`revoke-key-${invite.code}`}
                    onPress={() => handleRevoke(invite.code)}
                    disabled={revokingCode === invite.code}
                    className="p-2 rounded-xl bg-red-500/10 border border-red-500/20"
                  >
                    <Text className="text-xs font-bold text-red-600">
                      {revokingCode === invite.code ? '...' : 'Revoke'}
                    </Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
};
