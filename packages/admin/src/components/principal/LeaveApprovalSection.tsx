/**
 * LeaveApprovalSection
 *
 * Compact leave approval widget for the principal:
 *  - Lists pending leave requests
 *  - Approve / Reject buttons per request
 */

import { type StaffLeaveDTO, staffManagementAPI } from '@repo/core/api';

import { Check, Clock, FileText, X } from '@repo/ui/icons';
import { Box, Heading, HStack, Icon, Pressable, Spinner, Text, VStack } from '@repo/ui/primitives';
import { hapticLight } from '@repo/ui/utils/haptics';

import { useEffect, useState } from 'react';

interface LeaveApprovalSectionProps {
  schoolId: string;
  principalId: string;
}

export default function LeaveApprovalSection({ schoolId, principalId }: LeaveApprovalSectionProps) {
  const [loading, setLoading] = useState(true);
  const [leaves, setLeaves] = useState<StaffLeaveDTO[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const getLeaveTypeColorClass = (type: string): string => {
    const t = type.toLowerCase();
    if (t.includes('sick')) return 'bg-phase-danger';
    if (t.includes('annual')) return 'bg-phase-success';
    if (t.includes('casual')) return 'bg-phase-interactive';
    return 'bg-phase-warning';
  };

  async function fetchLeaves() {
    try {
      const data = await staffManagementAPI.getPendingLeaves(schoolId);
      setLeaves(data);
    } catch (err) {
      console.error('LeaveApprovalSection: fetch error', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setLoading(true);
    fetchLeaves();
  }, [fetchLeaves]);

  async function handleDecision(leaveId: string, approve: boolean) {
    hapticLight();
    setProcessingId(leaveId);
    try {
      await staffManagementAPI.approveLeave(leaveId, principalId, approve);
      await fetchLeaves();
    } catch (err) {
      console.error('LeaveApprovalSection: decision error', err);
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <Box className="bg-phase-surface rounded-[32px] border border-phase-border p-6 shadow-sm">
      <HStack className="justify-between items-center mb-8">
        <HStack className="items-center gap-3">
          <Heading className="text-[18px] font-black text-phaseText-primary tracking-tight">
            Leave Requests
          </Heading>
          {leaves.length > 0 && (
            <Box className="bg-phase-interactive/10 rounded-full px-3 py-1 border border-phase-interactive/20">
              <Text className="text-[10px] font-black text-phase-interactive uppercase tracking-widest">
                {leaves.length} Pending
              </Text>
            </Box>
          )}
        </HStack>
        {loading && <Spinner size="small" className="text-phase-interactive" />}
      </HStack>

      {loading && !leaves.length && (
        <VStack className="gap-4">
          <Box className="h-32 bg-phase-canvas border border-phase-border rounded-[24px] opacity-40" />
        </VStack>
      )}

      {!loading && leaves.length === 0 && (
        <VStack className="items-center py-10 gap-4 bg-phase-canvas rounded-[24px] border border-dashed border-phase-border">
          <Box className="w-14 h-14 rounded-full bg-phase-success/10 items-center justify-center border border-phase-success/20">
            <Icon as={Check} size="sm" className="text-phase-success" />
          </Box>
          <Text className="text-[13px] font-bold text-phaseText-muted text-center opacity-70">
            Institutional presence is optimized.{'\n'}No pending requests.
          </Text>
        </VStack>
      )}

      {!loading &&
        leaves.map((leave) => {
          const isProcessing = processingId === leave.id;
          return (
            <VStack
              key={leave.id}
              className="pb-6 mb-6 border-b border-phase-border last:border-b-0 last:mb-0 last:pb-0 gap-5"
            >
              <VStack className="gap-3">
                <HStack className="justify-between items-center">
                  <HStack className="items-center gap-2">
                    <Box
                      className={`rounded-lg px-2 py-1 ${getLeaveTypeColorClass(leave.leave_type)}`}
                    >
                      <Text className="text-[9px] font-black text-white uppercase tracking-widest">
                        {leave.leave_type}
                      </Text>
                    </Box>
                    <Text className="text-[14px] font-black text-phaseText-primary tracking-tight">
                      Staff ID: {leave.user_id.substring(0, 8)}
                    </Text>
                  </HStack>
                  <HStack className="gap-1.5 items-center">
                    <Icon as={Clock} size="xs" className="text-phaseText-muted/40" />
                    <Text className="text-[11px] font-black text-phaseText-muted uppercase tracking-tighter">
                      {new Date(leave.start_date).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </Text>
                  </HStack>
                </HStack>

                {leave.reason && (
                  <Box className="bg-phase-canvas p-4 rounded-[20px] border border-phase-border border-l-4 border-l-phase-interactive/30">
                    <HStack className="gap-3 items-start">
                      <Icon as={FileText} size="xs" className="text-phaseText-muted/30 mt-0.5" />
                      <Text className="text-[13px] leading-[20px] text-phaseText-secondary font-bold italic flex-1">
                        "{leave.reason}"
                      </Text>
                    </HStack>
                  </Box>
                )}
              </VStack>

              <HStack className="gap-4">
                <Pressable
                  onPress={() => handleDecision(leave.id, true)}
                  disabled={isProcessing}
                  className={`flex-1 flex-row items-center justify-center gap-2 bg-phase-interactive h-14 rounded-[18px] shadow-sm active:scale-95 transition-all ${isProcessing ? 'opacity-50' : ''}`}
                >
                  {isProcessing && processingId === leave.id ? (
                    <Spinner color="#FFFFFF" size="small" />
                  ) : (
                    <>
                      <Icon as={Check} size="xs" className="text-white" />
                      <Text className="text-[11px] font-black text-white uppercase tracking-widest">
                        Authorize
                      </Text>
                    </>
                  )}
                </Pressable>

                <Pressable
                  onPress={() => handleDecision(leave.id, false)}
                  disabled={isProcessing}
                  className={`flex-1 flex-row items-center justify-center gap-2 border border-phase-danger rounded-[18px] h-14 active:scale-95 transition-all ${isProcessing ? 'opacity-50' : ''}`}
                >
                  <Icon as={X} size="xs" className="text-phase-danger" />
                  <Text className="text-[11px] font-black text-phase-danger uppercase tracking-widest">
                    Reject
                  </Text>
                </Pressable>
              </HStack>
            </VStack>
          );
        })}
    </Box>
  );
}
