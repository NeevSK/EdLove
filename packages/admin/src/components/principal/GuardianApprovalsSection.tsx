import { planBridgeAPI } from '@repo/core/api/planBridge';
import type { GuardianLinkItem } from '@repo/core/api/planBridge.orpc.contract';
import { SanctuaryCard } from '@repo/ui/components/SanctuaryCard';
import { Check, ShieldCheck, UserCheck, X } from '@repo/ui/icons';
import {
  Box,
  Button,
  ButtonText,
  HStack,
  Icon,
  Pressable,
  Text,
  VStack,
} from '@repo/ui/primitives';
import { useToast } from '@repo/ui/providers';
import { hapticLight, hapticSuccess } from '@repo/ui/utils/haptics';
import React, { useCallback, useEffect, useState } from 'react';
import Animated, { FadeInUp } from 'react-native-reanimated';

interface GuardianApprovalsSectionProps {
  schoolId: string;
  principalId: string;
}

export default function GuardianApprovalsSection({
  schoolId,
  principalId,
}: GuardianApprovalsSectionProps) {
  const toast = useToast();
  const [links, setLinks] = useState<GuardianLinkItem[]>([]);
  const [filter, setFilter] = useState<'pending' | 'verified' | 'revoked'>('pending');
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const reloadLinks = useCallback(async () => {
    try {
      const data = await planBridgeAPI.listGuardianLinks({ status: filter });
      setLinks(data);
    } catch (err: any) {
      console.warn('Could not load guardian linkages:', err);
    } finally {
      setIsLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    let active = true;
    async function fetchLinks() {
      try {
        const data = await planBridgeAPI.listGuardianLinks({ status: filter });
        if (!active) return;
        setLinks(data);
      } catch (err: any) {
        console.warn('Could not load guardian linkages:', err);
      } finally {
        if (active) setIsLoading(false);
      }
    }
    void fetchLinks();
    return () => {
      active = false;
    };
  }, [filter]);

  const handleDecision = async (relationshipId: string, decision: 'verified' | 'revoked') => {
    setProcessingId(relationshipId);
    try {
      hapticLight();
      await planBridgeAPI.verifyGuardianLink({ relationshipId, decision });
      hapticSuccess();
      toast.showToast({
        message: decision === 'verified' ? 'Guardian link verified successfully.' : 'Guardian link revoked.',
        type: 'success',
      });
      await reloadLinks();
    } catch (err: any) {
      toast.showToast({ message: err?.message || 'Failed to update guardian verification.', type: 'error' });
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <Animated.View entering={FadeInUp.delay(140)}>
      <SanctuaryCard className="bg-phase-surface border border-phase-border p-6 rounded-3xl gap-5">
        {/* Header */}
        <HStack className="justify-between items-center">
          <HStack className="gap-3 items-center">
            <Box className="p-2.5 rounded-xl bg-phase-interactive/10">
              <Icon as={UserCheck} size="sm" className="text-phase-interactive" />
            </Box>
            <VStack>
              <Text className="text-base font-black text-phaseText-primary">
                Guardian Verification Console
              </Text>
              <Text className="text-xs text-phaseText-secondary">
                Review family linkages and approve verified guardian access.
              </Text>
            </VStack>
          </HStack>
        </HStack>

        {/* Filter Pills */}
        <HStack className="gap-2">
          {(['pending', 'verified', 'revoked'] as const).map((status) => {
            const isSelected = filter === status;
            return (
              <Pressable
                accessibilityRole="button"
                key={status}
                onPress={() => {
                  hapticLight();
                  setFilter(status);
                }}
                className={`py-1.5 px-3 rounded-full border ${
                  isSelected
                    ? 'bg-phase-interactive border-phase-interactive'
                    : 'bg-phase-surface border-phase-border'
                }`}
              >
                <Text
                  className={`text-xs font-bold capitalize ${
                    isSelected ? 'text-white' : 'text-phaseText-secondary'
                  }`}
                >
                  {status}
                </Text>
              </Pressable>
            );
          })}
        </HStack>

        {/* Links List */}
        {isLoading ? (
          <Box className="p-6 items-center justify-center">
            <Text className="text-xs font-semibold text-phaseText-secondary">
              Loading guardian linkages…
            </Text>
          </Box>
        ) : links.length === 0 ? (
          <Box className="p-6 items-center justify-center bg-phase-canvas/30 rounded-2xl border border-dashed border-phase-border">
            <Text className="text-xs text-phaseText-secondary">
              No {filter} guardian linkages found for this school.
            </Text>
          </Box>
        ) : (
          <VStack className="gap-3">
            {links.map((link) => {
              const isWorking = processingId === link.id;
              return (
                <Box
                  key={link.id}
                  className="p-4 rounded-2xl bg-phase-canvas/40 border border-phase-border/70 gap-3"
                >
                  <HStack className="justify-between items-start">
                    <VStack className="gap-0.5">
                      <Text className="text-sm font-bold text-phaseText-primary">
                        {link.guardian_name || 'Guardian'}
                      </Text>
                      <Text className="text-xs text-phaseText-secondary">
                        Student:{' '}
                        <Text className="font-semibold text-phaseText-primary">
                          {link.student_name || 'Student'}
                        </Text>{' '}
                        • Relationship: {link.relationship_type || 'Parent'}
                      </Text>
                    </VStack>

                    <Box
                      className={`px-2 py-0.5 rounded-md ${
                        link.verification_status === 'verified'
                          ? 'bg-emerald-500/10'
                          : link.verification_status === 'revoked'
                            ? 'bg-red-500/10'
                            : 'bg-amber-500/10'
                      }`}
                    >
                      <Text
                        className={`text-[10px] font-bold uppercase tracking-wider ${
                          link.verification_status === 'verified'
                            ? 'text-emerald-700'
                            : link.verification_status === 'revoked'
                              ? 'text-red-700'
                              : 'text-amber-700'
                        }`}
                      >
                        {link.verification_status}
                      </Text>
                    </Box>
                  </HStack>

                  {/* Action buttons */}
                  <HStack className="justify-end gap-2 pt-1 border-t border-phase-border/40">
                    {link.verification_status !== 'revoked' ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onPress={() => handleDecision(link.id, 'revoked')}
                        disabled={isWorking}
                        className="h-8 px-3 rounded-lg border-red-200"
                      >
                        <ButtonText className="text-xs text-red-600 font-bold">Revoke</ButtonText>
                      </Button>
                    ) : null}

                    {link.verification_status !== 'verified' ? (
                      <Button
                        size="sm"
                        onPress={() => handleDecision(link.id, 'verified')}
                        disabled={isWorking}
                        className="h-8 px-3 rounded-lg bg-emerald-600"
                      >
                        <ButtonText className="text-xs text-white font-bold">
                          Verify Link
                        </ButtonText>
                      </Button>
                    ) : null}
                  </HStack>
                </Box>
              );
            })}
          </VStack>
        )}
      </SanctuaryCard>
    </Animated.View>
  );
}
