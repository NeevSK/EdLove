import { useAuthStore, useDeviceSecurity } from '@repo/core/logic';
import DeviceAccountManager from '@repo/ui/components/DeviceAccountManager';
import SanctuaryModal from '@repo/ui/components/SanctuaryModal';
import { Box, Button, ButtonText, Heading, HStack, Text, VStack } from '@repo/ui/gluestack';
import {
  Activity,
  Clock3,
  History,
  Key,
  Laptop,
  Lock,
  Smartphone,
  Tablet,
  Trash2,
} from '@repo/ui/icons';
import { useSanctuaryToast } from '@repo/ui/providers/ToastProvider';
import { hapticError, hapticLight, hapticSuccess } from '@repo/ui/utils/haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useMemo, useOptimistic, useReducer, useTransition } from 'react';
import { Platform, StyleSheet } from 'react-native';
import { BrandPulse } from './BrandPulse';

// ── Types & Reducer ──────────────────────────────────────────────────────────

type PendingConfirmAction =
  | { type: 'unlinkDevice'; deviceId: string; isCurrent: boolean }
  | { type: 'revokeSession'; sessionId: string; isCurrent: boolean }
  | { type: 'revokeOtherSessions'; keepSessionId: string | null }
  | null;

type State = {
  busyDeviceId: string | null;
  busySessionId: string | null;
  pendingConfirm: PendingConfirmAction;
};

type Action =
  | { type: 'setBusyDeviceId'; value: string | null }
  | { type: 'setBusySessionId'; value: string | null }
  | { type: 'setPendingConfirm'; value: PendingConfirmAction };

const initialState: State = {
  busyDeviceId: null,
  busySessionId: null,
  pendingConfirm: null,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'setBusyDeviceId':
      return { ...state, busyDeviceId: action.value };
    case 'setBusySessionId':
      return { ...state, busySessionId: action.value };
    case 'setPendingConfirm':
      return { ...state, pendingConfirm: action.value };
    default:
      return state;
  }
}

// ── Utils ───────────────────────────────────────────────────────────────────

const relativeTime = (dateStr: string | null | undefined): string => {
  if (!dateStr) return 'Unavailable';
  const ts = new Date(dateStr).getTime();
  if (Number.isNaN(ts)) return 'Unavailable';
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
};

const getDeviceIcon = (platform: string | null) => {
  const normalized = platform?.toLowerCase() ?? '';
  if (normalized.includes('ios') || normalized.includes('android') || normalized.includes('mobile'))
    return Smartphone;
  if (normalized.includes('ipad') || normalized.includes('tablet')) return Tablet;
  return Laptop;
};

// ── Row Orchestrator Components ─────────────────────────────────────────────

const _StatPill = React.memo(
  ({
    label,
    value,
    tone = 'default',
  }: {
    label: string;
    value: string;
    tone?: 'default' | 'success' | 'warning';
  }) => {
    const toneColors = {
      success: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600',
      warning: 'bg-amber-500/10 border-amber-500/20 text-amber-600',
      default: 'bg-phase-world border-phase-border text-phase-primary',
    };

    return (
      <VStack
        className={`rounded-[18px] border px-3 py-2 ${toneColors[tone]} min-w-[100px]`}
        space="xs"
      >
        <Text className="text-[10px] uppercase tracking-wider opacity-60 font-bold">{label}</Text>
        <Text className="text-sm font-bold">{value}</Text>
      </VStack>
    );
  },
);

const TrustPulse = React.memo(({ score }: { score: number | null }) => {
  if (score === null) return null;

  const getPulseColor = () => {
    if (score >= 90) return 'bg-emerald-500';
    if (score >= 70) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <HStack className="items-center gap-2 px-3 py-1.5 rounded-full bg-phase-world/50 border border-phase-border">
      <Box className={`w-2 h-2 rounded-full ${getPulseColor()} animate-pulse`} />
      <Text className="text-xs font-bold tracking-tight">Trust Integrity: {score}%</Text>
    </HStack>
  );
});

const SectionHeader = React.memo(
  ({ title, subtitle, icon: Icon }: { title: string; subtitle: string; icon?: any }) => (
    <VStack className="gap-1 mb-2">
      <HStack className="items-center gap-2">
        {Icon && <Icon size={16} className="text-phase-primary" />}
        <Heading className="text-base font-bold text-phase-primary">{title}</Heading>
      </HStack>
      <Text className="text-sm leading-relaxed text-phase-secondary">{subtitle}</Text>
    </VStack>
  ),
);

// ── Main Component ──────────────────────────────────────────────────────────

export default function DeviceSecurityCenter({ compact = false }: { compact?: boolean }) {
  const isOnline = useAuthStore((state) => state.isOnline);
  const {
    currentDevice,
    devices,
    events,
    authEvents,
    sessions,
    loading,
    error,
    refresh,
    syncPending,
    healthScore,
    unlinkDevice,
    revokeSession,
  } = useDeviceSecurity();

  const { showToast } = useSanctuaryToast();
  const [state, dispatch] = useReducer(reducer, initialState);
  const [_isPending, startTransition] = useTransition();

  // ✅ 2026 Optimistic Updates: The device vanishes instantly from the trust list
  const [optimisticDevices, addOptimisticDevice] = useOptimistic(
    devices,
    (state, deviceIdToRemove) => state.filter((d) => d.deviceId !== deviceIdToRemove),
  );

  const [optimisticSessions, addOptimisticSession] = useOptimistic(
    sessions,
    (state, sessionIdToRevoke) =>
      state.map((s) =>
        s.sessionId === sessionIdToRevoke ? { ...s, status: 'revoked' as const } : s,
      ),
  );

  const { busyDeviceId, busySessionId, pendingConfirm } = state;

  // ── Handlers ──────────────────────────────────────────────────────────────

  const performUnlinkDevice = useCallback(
    async (deviceId: string, isCurrent: boolean) => {
      dispatch({ type: 'setBusyDeviceId', value: deviceId });
      // Optimistically remove
      startTransition(() => {
        addOptimisticDevice(deviceId);
      });

      try {
        await unlinkDevice(deviceId);
        hapticSuccess();
        showToast?.({
          message:
            syncPending || isCurrent ? 'Removal queued for sync.' : 'Device removed successfully.',
          type: 'success',
        });
        await refresh();
      } catch (_err) {
        hapticError();
        showToast?.({ message: 'Failed to remove device.', type: 'error' });
      } finally {
        dispatch({ type: 'setBusyDeviceId', value: null });
      }
    },
    [dispatch, addOptimisticDevice, unlinkDevice, syncPending, showToast, refresh],
  );

  const performRevokeSession = useCallback(
    async (sessionId: string, isCurrent: boolean) => {
      dispatch({ type: 'setBusySessionId', value: sessionId });
      startTransition(() => {
        addOptimisticSession(sessionId);
      });

      try {
        await revokeSession(sessionId);
        hapticSuccess();
        showToast?.({
          message: isCurrent ? 'Current session revoked.' : 'Session revoked.',
          type: 'success',
        });
        await refresh();
      } catch (_err) {
        hapticError();
        showToast?.({ message: 'Failed to revoke session.', type: 'error' });
      } finally {
        dispatch({ type: 'setBusySessionId', value: null });
      }
    },
    [dispatch, addOptimisticSession, revokeSession, showToast, refresh],
  );

  const handleAction = useCallback(
    (action: PendingConfirmAction) => {
      if (!action) return;
      hapticLight();
      if (!isOnline || Platform.OS === 'web') {
        dispatch({ type: 'setPendingConfirm', value: action });
        return;
      }
      // Perform directly with optimistic feedback
      if (action.type === 'unlinkDevice') performUnlinkDevice(action.deviceId, action.isCurrent);
      if (action.type === 'revokeSession') performRevokeSession(action.sessionId, action.isCurrent);
    },
    [isOnline, performUnlinkDevice, performRevokeSession],
  );

  // ── Row Orchestrator Pattern ──────────────────────────────────────────────

  const rows = useMemo(() => {
    if (loading) return [{ type: 'LOADING' }];
    if (error) return [{ type: 'ERROR', message: error }];

    const items: any[] = [];

    // 1. Sync Banner
    if (syncPending) {
      items.push({ type: 'SYNC_BANNER', count: 1 });
    }

    // 2. Health Score Card
    items.push({ type: 'HEALTH_CARD', score: healthScore });

    // 3. Current Device
    if (currentDevice) {
      items.push({
        type: 'SECTION_HEADER',
        title: 'Your Current Device',
        subtitle: 'The anchor for this session.',
      });
      items.push({ type: 'CURRENT_DEVICE_CARD', device: currentDevice });
    }

    // 4. Trusted Devices
    items.push({
      type: 'SECTION_HEADER',
      title: 'Linked Devices',
      subtitle: 'Managed trust across your identity.',
      icon: Laptop,
    });
    if (optimisticDevices.length === 0) {
      items.push({ type: 'EMPTY', message: 'No other linked devices found.' });
    } else {
      optimisticDevices.forEach((d) => {
        items.push({ type: 'DEVICE_CARD', device: d });
      });
    }

    // 5. Active Sessions
    items.push({
      type: 'SECTION_HEADER',
      title: 'Security Sessions',
      subtitle: 'Active access keys.',
      icon: Lock,
    });
    optimisticSessions
      .filter((s) => s.status === 'active')
      .forEach((s) => {
        items.push({ type: 'SESSION_CARD', session: s });
      });

    // 6. Recent Activity
    if (authEvents.length > 0) {
      items.push({
        type: 'SECTION_HEADER',
        title: 'Auth Events',
        subtitle: 'How this account authenticated over time.',
        icon: Key,
      });
      authEvents.slice(0, 5).forEach((e) => {
        items.push({ type: 'AUTH_EVENT_ROW', event: e });
      });
    }

    if (events.length > 0) {
      items.push({
        type: 'SECTION_HEADER',
        title: 'Recent Audit',
        subtitle: 'Historical security changes.',
        icon: History,
      });
      events.slice(0, 3).forEach((e) => {
        items.push({ type: 'ACTIVITY_ROW', event: e });
      });
    }

    // 7. Account Manager
    items.push({ type: 'ACCOUNT_MANAGER' });

    return items;
  }, [
    loading,
    error,
    syncPending,
    healthScore,
    currentDevice,
    optimisticDevices,
    optimisticSessions,
    events,
    authEvents,
  ]);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <Box
      className={`rounded-[32px] border border-phase-border bg-phase-surface overflow-hidden ${compact ? 'p-1' : 'p-2'}`}
    >
      <LinearGradient
        colors={['rgba(59, 130, 246, 0.05)', 'transparent']}
        style={StyleSheet.absoluteFill}
      />

      <VStack className={`gap-6 ${compact ? 'p-3' : 'p-5'}`}>
        <HStack className="items-center justify-between">
          <VStack className="gap-0.5">
            <Heading className="text-xl font-bold tracking-tight text-phase-primary">
              Security Center
            </Heading>
            <Text className="text-xs font-medium text-phase-secondary opacity-70">
              SOVEREIGN IDENTITY FABRIC v2.6
            </Text>
          </VStack>
          <TrustPulse score={healthScore} />
        </HStack>

        {rows.map((row, idx) => {
          switch (row.type) {
            case 'LOADING':
              return (
                <HStack key="loading" className="items-center gap-3 py-4">
                  <BrandPulse size={20} tintColor="#D4843A" />
                  <Text className="text-sm text-phase-secondary">Synchronizing trust graph...</Text>
                </HStack>
              );
            case 'HEALTH_CARD':
              return (
                <Box
                  key="health"
                  className="rounded-[24px] bg-phase-world border border-phase-border p-4"
                >
                  <HStack className="justify-between items-center">
                    <VStack>
                      <Text className="text-xs font-bold uppercase opacity-50">
                        Sovereign Health
                      </Text>
                      <Heading className="text-2xl font-bold">{row.score}%</Heading>
                    </VStack>
                    <Box className="h-12 w-12 rounded-full items-center justify-center border-4 border-emerald-500/20">
                      <Activity size={20} className="text-emerald-500" />
                    </Box>
                  </HStack>
                  <Box className="h-1 w-full bg-phase-border rounded-full mt-3 overflow-hidden">
                    <Box className="h-full bg-emerald-500" style={{ width: `${row.score}%` }} />
                  </Box>
                </Box>
              );
            case 'SECTION_HEADER':
              return <SectionHeader key={`header-${idx}`} {...row} />;
            case 'DEVICE_CARD': {
              const isCurrent = currentDevice?.deviceId === row.device.deviceId;
              const Icon = getDeviceIcon(row.device.platform);
              return (
                <Box
                  key={row.device.deviceId}
                  className="rounded-2xl border border-phase-border bg-phase-world p-4 shadow-sm"
                >
                  <HStack className="gap-3 items-center">
                    <Box className="h-10 w-10 rounded-lg bg-phase-surface items-center justify-center">
                      <Icon size={18} className="text-phase-primary" />
                    </Box>
                    <VStack className="flex-1">
                      <Text className="font-bold text-phase-primary">
                        {row.device.modelName || 'Unknown Device'}
                      </Text>
                      <Text className="text-xs text-phase-secondary opacity-70">
                        {row.device.platform} • {relativeTime(row.device.lastSeenAt)}
                      </Text>
                    </VStack>
                    {!isCurrent && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onPress={() =>
                          handleAction({
                            type: 'unlinkDevice',
                            deviceId: row.device.deviceId,
                            isCurrent: false,
                          })
                        }
                      >
                        <Trash2 size={16} className="text-rose-500" />
                      </Button>
                    )}
                  </HStack>
                </Box>
              );
            }
            case 'SESSION_CARD':
              return (
                <HStack
                  key={row.session.sessionId}
                  className="items-center justify-between p-3 rounded-xl bg-phase-surface border border-phase-border"
                >
                  <VStack>
                    <Text className="text-sm font-bold">{row.session.platform}</Text>
                    <Text className="text-[10px] text-phase-secondary uppercase">
                      {relativeTime(row.session.startedAt)}
                    </Text>
                  </VStack>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-lg h-7"
                    onPress={() =>
                      handleAction({
                        type: 'revokeSession',
                        sessionId: row.session.sessionId,
                        isCurrent: false,
                      })
                    }
                  >
                    <ButtonText className="text-[10px]">Revoke</ButtonText>
                  </Button>
                </HStack>
              );
            case 'ACTIVITY_ROW':
              return (
                <HStack
                  key={row.event.id}
                  className="gap-3 items-center py-2 border-b border-phase-border/50"
                >
                  <Clock3 size={14} className="text-phase-secondary" />
                  <Text className="text-xs flex-1 text-phase-secondary">
                    {row.event.action.replace(/_/g, ' ')}
                  </Text>
                  <Text className="text-[10px] opacity-40">
                    {relativeTime(row.event.createdAt)}
                  </Text>
                </HStack>
              );
            case 'AUTH_EVENT_ROW':
              return (
                <HStack
                  key={row.event.id}
                  className="gap-3 items-center py-2 border-b border-phase-border/50"
                >
                  <Key size={14} className="text-phase-secondary" />
                  <Text className="text-xs flex-1 text-phase-secondary">
                    {row.event.action.replace(/_/g, ' ')}
                  </Text>
                  <Text className="text-[10px] opacity-40">
                    {relativeTime(row.event.createdAt)}
                  </Text>
                </HStack>
              );
            case 'ACCOUNT_MANAGER':
              return <DeviceAccountManager key="acc-mgr" compact={compact} />;
            default:
              return null;
          }
        })}
      </VStack>

      <SanctuaryModal
        isOpen={!!pendingConfirm}
        onClose={() => dispatch({ type: 'setPendingConfirm', value: null })}
        title="Confirm Security Intent"
        subtitle="This action will be synchronized across your trust fabric."
      >
        <VStack className="gap-4">
          <Text className="text-sm text-phase-secondary">
            Are you sure you want to proceed with this security modification? This will be
            irreversible once reconciled.
          </Text>
          <HStack className="gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onPress={() => dispatch({ type: 'setPendingConfirm', value: null })}
            >
              <ButtonText>Cancel</ButtonText>
            </Button>
            <Button
              action="negative"
              className="flex-1"
              onPress={() => {
                if (pendingConfirm?.type === 'unlinkDevice')
                  performUnlinkDevice(pendingConfirm.deviceId, pendingConfirm.isCurrent);
                if (pendingConfirm?.type === 'revokeSession')
                  performRevokeSession(pendingConfirm.sessionId, pendingConfirm.isCurrent);
                dispatch({ type: 'setPendingConfirm', value: null });
              }}
            >
              <ButtonText>Confirm</ButtonText>
            </Button>
          </HStack>
        </VStack>
      </SanctuaryModal>
    </Box>
  );
}
