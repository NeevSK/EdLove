/**
 * LeaveApprovalSection
 *
 * Compact leave approval widget for the principal:
 *  - Lists pending leave requests
 *  - Approve / Reject buttons per request
 */

import React, { useEffect, useState } from 'react';
import { TouchableOpacity } from 'react-native';
import { Box, HStack, VStack, Text, SkeletonCard, useThemedColors } from '@repo/ui';
import { Theme } from '@repo/ui';
import { staffManagementAPI, StaffLeave } from '@repo/core';

interface LeaveApprovalSectionProps {
  schoolId: string;
  principalId: string;
}

const LEAVE_TYPE_COLORS: Record<string, string> = {
  sick: Theme.colors.roseQuartz ?? '#f44336',
  casual: Theme.colors.gurudeviBlue ?? '#2196f3',
  annual: Theme.colors.sage ?? '#4caf50',
  maternity: Theme.colors.sanctuarySaffron ?? '#ff9800',
  paternity: Theme.colors.sanctuarySaffron ?? '#ff9800',
  other: Theme.colors.textMuted ?? '#9e9e9e',
};

function leaveTypeColor(type: string): string {
  return LEAVE_TYPE_COLORS[type.toLowerCase()] ?? (Theme.colors.textMuted ?? '#9e9e9e');
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch {
    return dateStr;
  }
}

function shortId(id: string): string {
  return id.substring(0, 8);
}

export default function LeaveApprovalSection({
  schoolId,
  principalId,
}: LeaveApprovalSectionProps) {
  const colors = useThemedColors();
  const [loading, setLoading] = useState(true);
  const [leaves, setLeaves] = useState<StaffLeave[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);

  async function fetchLeaves() {
    const data = await staffManagementAPI.getPendingLeaves(schoolId);
    setLeaves(data);
    setLoading(false);
  }

  useEffect(() => {
    setLoading(true);
    fetchLeaves();
  }, [schoolId]);

  async function handleDecision(leaveId: string, approve: boolean) {
    setProcessingId(leaveId);
    await staffManagementAPI.approveLeave(leaveId, principalId, approve);
    setProcessingId(null);
    await fetchLeaves();
  }

  return (
    <Box
      sx={{
        backgroundColor: colors.surface,
        borderRadius: Theme.corners.comfortable,
        borderWidth: 1,
        borderColor: colors.border,
        padding: Theme.spacing.md,
      }}
    >
      {/* Header */}
      <HStack sx={{ alignItems: 'center', gap: Theme.spacing.sm, marginBottom: Theme.spacing.sm }}>
        <Text sx={{ fontSize: 15, fontWeight: '700', color: colors.text }}>
          Leave Requests
        </Text>
        {leaves.length > 0 && (
          <Box
            sx={{
              backgroundColor: Theme.colors.amberGlow ?? '#ffc107',
              borderRadius: 10,
              paddingHorizontal: 8,
              paddingVertical: 2,
            }}
          >
            <Text sx={{ fontSize: 12, fontWeight: '700', color: '#fff' }}>
              {leaves.length}
            </Text>
          </Box>
        )}
      </HStack>

      {/* Loading */}
      {loading && <SkeletonCard height={70} />}

      {/* Empty state */}
      {!loading && leaves.length === 0 && (
        <Text sx={{ fontSize: 13, color: colors.textMuted, textAlign: 'center', paddingVertical: Theme.spacing.md }}>
          No pending leave requests
        </Text>
      )}

      {/* Leave rows */}
      {!loading && leaves.map((leave) => {
        const isProcessing = processingId === leave.id;
        return (
          <VStack
            key={leave.id}
            sx={{
              paddingVertical: Theme.spacing.sm,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
              gap: 6,
            }}
          >
            <HStack sx={{ alignItems: 'center', gap: Theme.spacing.sm }}>
              {/* Leave type badge */}
              <Box
                sx={{
                  backgroundColor: leaveTypeColor(leave.leave_type),
                  borderRadius: 8,
                  paddingHorizontal: 7,
                  paddingVertical: 2,
                }}
              >
                <Text sx={{ fontSize: 10, fontWeight: '700', color: '#fff', textTransform: 'capitalize' }}>
                  {leave.leave_type}
                </Text>
              </Box>
              {/* Staff identifier */}
              <Text sx={{ flex: 1, fontSize: 13, color: colors.text, fontWeight: '600' }}>
                {shortId(leave.user_id)}…
              </Text>
              {/* Date range */}
              <Text sx={{ fontSize: 11, color: colors.textMuted }}>
                {formatDate(leave.start_date)} – {formatDate(leave.end_date)}
              </Text>
            </HStack>

            {/* Reason */}
            {leave.reason ? (
              <Text sx={{ fontSize: 12, color: colors.textMuted }} numberOfLines={1}>
                {leave.reason}
              </Text>
            ) : null}

            {/* Action buttons */}
            <HStack sx={{ gap: Theme.spacing.sm }}>
              <TouchableOpacity
                onPress={() => handleDecision(leave.id, true)}
                activeOpacity={0.8}
                disabled={isProcessing}
                style={{ flex: 1 }}
              >
                <Box
                  sx={{
                    backgroundColor: Theme.colors.sage ?? '#4caf50',
                    borderRadius: Theme.corners.medium ?? 8,
                    padding: Theme.spacing.xs,
                    alignItems: 'center',
                    opacity: isProcessing ? 0.5 : 1,
                  }}
                >
                  <Text sx={{ fontSize: 13, fontWeight: '700', color: '#fff' }}>Approve</Text>
                </Box>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleDecision(leave.id, false)}
                activeOpacity={0.8}
                disabled={isProcessing}
                style={{ flex: 1 }}
              >
                <Box
                  sx={{
                    backgroundColor: colors.border,
                    borderRadius: Theme.corners.medium ?? 8,
                    padding: Theme.spacing.xs,
                    alignItems: 'center',
                    opacity: isProcessing ? 0.5 : 1,
                    borderWidth: 1,
                    borderColor: Theme.colors.roseQuartz ?? '#f44336',
                  }}
                >
                  <Text sx={{ fontSize: 13, fontWeight: '700', color: Theme.colors.roseQuartz ?? '#f44336' }}>
                    Reject
                  </Text>
                </Box>
              </TouchableOpacity>
            </HStack>
          </VStack>
        );
      })}
    </Box>
  );
}
