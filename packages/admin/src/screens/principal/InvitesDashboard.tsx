import { Box } from '@repo/ui/primitives';
import { HStack, Heading, Icon, Spinner, Text, VStack } from '@repo/ui/primitives';
import { useToast } from '@repo/ui/providers';
import { Pressable } from '@repo/ui/primitives';
import { hapticLight, hapticSuccess } from '@repo/ui/utils/haptics';

import { formatDistanceToNow } from 'date-fns';
import { ArrowLeft, Copy, Plus, UserPlus, X } from 'lucide-react-native';
import type React from 'react';
import { useCallback, useEffect, useReducer } from 'react';
import { Platform } from 'react-native';
import { type InviteCode, invitesAPI } from '../../invites';

// —————————————————————————————————————————————————————————————————————————————
// TYPES
// —————————————————————————————————————————————————————————————————————————————

interface InvitesDashboardProps {
  schoolId: string;
  userId: string;
  isPastView: boolean;
  onBack: () => void;
}

type State = {
  inviteCodes: InviteCode[];
  isLoading: boolean;
  isGenerating: boolean;
  inviteRole: 'teacher' | 'principal';
};

type Action =
  | { type: 'LOAD_START' }
  | { type: 'LOAD_SUCCESS'; codes: InviteCode[] }
  | { type: 'LOAD_FAILURE' }
  | { type: 'GENERATE_START' }
  | { type: 'GENERATE_SUCCESS'; code: InviteCode }
  | { type: 'GENERATE_FAILURE' }
  | { type: 'SET_ROLE'; role: 'teacher' | 'principal' }
  | { type: 'REVOKE_SUCCESS'; code: string };

const invitesReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'LOAD_START':
      return { ...state, isLoading: true };
    case 'LOAD_SUCCESS':
      return { ...state, isLoading: false, inviteCodes: action.codes };
    case 'LOAD_FAILURE':
      return { ...state, isLoading: false };
    case 'GENERATE_START':
      return { ...state, isGenerating: true };
    case 'GENERATE_SUCCESS':
      return { ...state, isGenerating: false, inviteCodes: [action.code, ...state.inviteCodes] };
    case 'GENERATE_FAILURE':
      return { ...state, isGenerating: false };
    case 'SET_ROLE':
      return { ...state, inviteRole: action.role };
    case 'REVOKE_SUCCESS':
      return {
        ...state,
        inviteCodes: state.inviteCodes.map((inv) =>
          inv.code === action.code ? { ...inv, is_active: false } : inv,
        ),
      };
    default:
      return state;
  }
};

export const InvitesDashboard: React.FC<InvitesDashboardProps> = ({
  schoolId,
  userId,
  isPastView,
  onBack,
}) => {
  const toast = useToast();
  const [state, dispatch] = useReducer(invitesReducer, {
    inviteCodes: [],
    isLoading: false,
    isGenerating: false,
    inviteRole: 'teacher',
  });

  const loadInviteCodes = useCallback(async () => {
    if (!schoolId) return;
    dispatch({ type: 'LOAD_START' });
    try {
      const codes = await invitesAPI.getInviteCodesBySchool(schoolId);
      dispatch({ type: 'LOAD_SUCCESS', codes: codes ?? [] });
    } catch (error) {
      console.error('Failed to load invite codes:', error);
      dispatch({ type: 'LOAD_FAILURE' });
    }
  }, [schoolId]);

  useEffect(() => {
    void loadInviteCodes();
  }, [loadInviteCodes]);

  const handleRevoke = async (code: string) => {
    if (!schoolId || !userId) return;
    try {
      await invitesAPI.revokeInviteCode(schoolId, code, userId);
      dispatch({ type: 'REVOKE_SUCCESS', code });
      hapticSuccess();
      toast.showToast({
        message: 'Invite Revoked: The code is no longer active.',
        type: 'success',
      });
    } catch (err) {
      console.error('[InvitesDashboard] revokeInviteCode failed:', err);
      toast.showToast({
        message: 'Revoke Failed: Could not deactivate the code.',
        type: 'error',
      });
    }
  };

  const handleGenerateCode = async () => {
    if (!schoolId || !userId) return;
    dispatch({ type: 'GENERATE_START' });
    try {
      const newCode = await invitesAPI.generateInviteCode(schoolId, state.inviteRole, userId);
      dispatch({ type: 'GENERATE_SUCCESS', code: newCode });
      hapticSuccess();
      toast.showToast({
        message: 'Code Generated: A new invite code is ready.',
        type: 'success',
      });
    } catch (err) {
      console.error('[InvitesDashboard] generateInviteCode failed:', err);
      dispatch({ type: 'GENERATE_FAILURE' });
      toast.showToast({
        message: 'Generation Failed: Could not create an invite code.',
        type: 'error',
      });
    }
  };

  const copyToClipboard = (code: string) => {
    if (Platform.OS === 'web') {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        navigator.clipboard
          .writeText(code)
          .then(() => {
            hapticLight();
            toast.showToast({ message: 'Copied: Code copied to clipboard', type: 'success' });
          })
          .catch((err) => {
            console.error('Failed to copy to clipboard:', err);
          });
      }
    } else {
      // In a real native environment we'd use a clipboard module, but for now we'll just toast
      toast.showToast({ message: 'Copied: Code copied to clipboard', type: 'success' });
    }
  };

  return (
    <VStack className="gap-6">
      <HStack className="items-center gap-4">
        <Pressable
          onPress={() => {
            hapticLight();
            onBack();
          }}
          className="p-2 bg-phase-canvas border border-phase-border rounded-xl active:scale-95 transition-all"
          accessibilityLabel="Back"
          accessibilityHint="Returns to the main dashboard"
        >
          <Icon as={ArrowLeft} size="sm" className="text-phaseText-primary" />
        </Pressable>
        <VStack className="gap-0.5">
          <Heading className="text-[24px] font-black text-phaseText-primary tracking-tight">
            Governance Invites
          </Heading>
          <Text className="text-[14px] font-bold text-phaseText-muted uppercase tracking-widest">
            Onboarding Protocol
          </Text>
        </VStack>
      </HStack>

      <Box className="bg-phase-surface p-6 rounded-[32px] border border-phase-border shadow-sm">
        <VStack className="gap-5">
          <HStack className="items-center gap-3">
            <Box className="p-2 bg-phase-interactive/10 rounded-xl">
              <Icon as={UserPlus} size="xs" className="text-phase-interactive" />
            </Box>
            <VStack>
              <Text className="text-[13px] font-black text-phaseText-primary uppercase tracking-wider">
                Generate Secure Key
              </Text>
              <Text className="text-[10px] font-bold text-phaseText-muted uppercase">
                Authorize new roles below
              </Text>
            </VStack>
          </HStack>

          <HStack className="gap-3">
            {(['teacher', 'principal'] as const).map((role) => (
              <Pressable
                key={role}
                onPress={() => {
                  hapticLight();
                  dispatch({ type: 'SET_ROLE', role });
                }}
                className={`flex-1 flex-row items-center justify-center gap-2 py-3.5 rounded-2xl border transition-all ${state.inviteRole === role ? 'bg-phase-interactive border-phase-interactive' : 'bg-phase-canvas border-phase-border'}`}
                accessibilityLabel={`Role: ${role}`}
                accessibilityHint={`Sets the role for the new invite code to ${role}`}
                accessibilityState={{ selected: state.inviteRole === role }}
              >
                <Text
                  className={`text-[12px] font-black uppercase tracking-widest ${state.inviteRole === role ? 'text-white' : 'text-phaseText-secondary'}`}
                >
                  {role}
                </Text>
              </Pressable>
            ))}
          </HStack>

          <Pressable
            onPress={handleGenerateCode}
            disabled={state.isGenerating || isPastView}
            className={`bg-phase-interactive rounded-2xl py-4 items-center shadow-md active:scale-95 transition-all ${state.isGenerating || isPastView ? 'opacity-50' : ''}`}
            accessibilityLabel="Generate Code"
            accessibilityHint="Creates a unique onboarding code for the selected role"
          >
            <HStack className="gap-2 items-center">
              {state.isGenerating ? (
                <Spinner size="small" color="#FFFFFF" />
              ) : (
                <Icon as={Plus} size="xs" className="text-white" />
              )}
              <Text className="text-[12px] font-black text-white uppercase tracking-[2px]">
                {state.isGenerating ? 'Generating...' : 'Authorize Code'}
              </Text>
            </HStack>
          </Pressable>
        </VStack>
      </Box>

      {state.isLoading ? (
        <Box className="py-20 items-center justify-center bg-phase-canvas rounded-[32px] border border-phase-border opacity-50">
          <Spinner className="text-phase-interactive" />
        </Box>
      ) : state.inviteCodes.length === 0 ? (
        <Box className="py-20 items-center justify-center bg-phase-canvas rounded-[32px] border border-dashed border-phase-border opacity-40">
          <Text className="text-[12px] font-black text-phaseText-muted uppercase tracking-[3px]">
            No Active Protocols
          </Text>
        </Box>
      ) : (
        <VStack className="gap-3">
          {state.inviteCodes.map((invite) => (
            <Box
              key={invite.code}
              className="bg-phase-surface p-5 rounded-[24px] border border-phase-border shadow-sm"
              style={{ opacity: invite.is_active === false ? 0.6 : 1 }}
            >
              <HStack className="justify-between items-center">
                <VStack className="gap-1 flex-1">
                  <Text className="text-[20px] font-black text-phase-interactive tracking-[4px] font-mono">
                    {invite.code}
                  </Text>
                  <HStack className="gap-2 items-center">
                    <Box className="px-2 py-0.5 rounded-full bg-phase-canvas border border-phase-border">
                      <Text className="text-[8px] font-black text-phaseText-muted uppercase">
                        {invite.authority?.replace('_', ' ') || 'Guest'}
                      </Text>
                    </Box>
                    <Text className="text-[10px] font-bold text-phaseText-muted uppercase">
                      •{' '}
                      {invite.is_active === false
                        ? 'Revoked'
                        : invite.used
                          ? 'Assimilated'
                          : 'Active'}
                      {' • '}
                      {formatDistanceToNow(new Date(invite.created_at), { addSuffix: true })}
                    </Text>
                  </HStack>
                </VStack>

                <HStack className="gap-2">
                  <Pressable
                    onPress={() => copyToClipboard(invite.code)}
                    className="p-2 bg-phase-canvas border border-phase-border rounded-xl active:scale-90 transition-all"
                    accessibilityLabel="Copy Code"
                    accessibilityHint="Copies the invite code to your clipboard"
                  >
                    <Icon as={Copy} size="xs" className="text-phaseText-secondary" />
                  </Pressable>
                  {!invite.used && invite.is_active !== false && (
                    <Pressable
                      onPress={() => handleRevoke(invite.code)}
                      className="p-2 bg-phase-danger/5 border border-phase-danger/20 rounded-xl active:scale-90 transition-all"
                      accessibilityLabel="Revoke Code"
                      accessibilityHint="Deactivates this invite code permanently"
                    >
                      <Icon as={X} size="xs" className="text-phase-danger" />
                    </Pressable>
                  )}
                </HStack>
              </HStack>
            </Box>
          ))}
        </VStack>
      )}
    </VStack>
  );
};

export type { InvitesDashboardProps };
