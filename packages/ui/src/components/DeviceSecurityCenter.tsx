import { useDeviceSecurity, useStore } from '@repo/core/logic';
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Laptop,
  Shield,
  Smartphone,
  Tablet,
} from 'lucide-react-native';
import { useMemo, useReducer } from 'react';
import { Platform } from 'react-native';
import { Box, Button, ButtonText, Heading, HStack, Spinner, Text, VStack } from '../gluestack';
import { useSanctuaryToast } from '../providers/ToastProvider';
import { hapticError, hapticLight, hapticSuccess } from '../utils/haptics';
import DeviceAccountManager from './DeviceAccountManager';
import SanctuaryModal from './SanctuaryModal';

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

function relativeTime(dateStr: string | null | undefined): string {
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
}

function formatAbsoluteDate(dateStr: string | null | undefined) {
  if (!dateStr) return 'Unavailable';
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return 'Unavailable';
  return date.toLocaleString();
}

function summarizeDevice(device: {
  platform: string | null;
  modelName: string | null;
  osVersion: string | null;
}) {
  const parts = [device.modelName, device.platform, device.osVersion].filter(Boolean);
  return parts.length > 0 ? parts.join(' • ') : 'Device details unavailable';
}

function getDeviceIcon(platform: string | null) {
  const normalized = platform?.toLowerCase() ?? '';
  if (normalized.includes('ios') || normalized.includes('android') || normalized.includes('mobile')) {
    return Smartphone;
  }
  if (normalized.includes('ipad') || normalized.includes('tablet')) {
    return Tablet;
  }
  return Laptop;
}

function formatActionLabel(action: string) {
  switch (action) {
    case 'ACCOUNT_CAPTURED_ON_DEVICE':
      return 'Account added to this device';
    case 'ACCOUNT_SWITCHED_ON_DEVICE':
      return 'Switched into account on this device';
    case 'ACCOUNT_REMOVED_FROM_DEVICE':
      return 'Account removed from this device';
    case 'ACCOUNT_SIGNED_OUT_FROM_DEVICE':
      return 'Signed out from this device';
    case 'DEVICE_UNLINKED_FROM_ACCOUNT':
      return 'Device removed from current account';
    case 'SECURITY_SESSION_REVOKED':
      return 'Security session revoked';
    case 'OTHER_SECURITY_SESSIONS_REVOKED':
      return 'Other security sessions revoked';
    case 'CURRENT_INSTALL_SECURITY_SESSIONS_REVOKED':
      return 'Current install sessions revoked';
    default:
      return action
        .toLowerCase()
        .split('_')
        .map((part) => part[0]?.toUpperCase() + part.slice(1))
        .join(' ');
  }
}

function formatTrustLabel(status: string) {
  switch (status) {
    case 'new':
      return 'New';
    case 'trusted':
      return 'Trusted';
    case 'stale':
      return 'Stale';
    case 'restricted':
      return 'Restricted';
    default:
      return 'Standard';
  }
}

function trustTone(status: string): 'default' | 'success' | 'warning' {
  if (status === 'trusted') return 'success';
  if (status === 'new' || status === 'stale' || status === 'restricted') return 'warning';
  return 'default';
}

function StatPill({
  label,
  value,
  tone = 'default',
}: {
  label: string;
  value: string;
  tone?: 'default' | 'success' | 'warning';
}) {
  const toneClass =
    tone === 'success'
      ? 'bg-emerald-500/10 border-emerald-500/20'
      : tone === 'warning'
        ? 'bg-amber-500/10 border-amber-500/20'
        : 'bg-phase-world border-phase-border';

  return (
    <VStack className={`rounded-[18px] border px-3 py-3 ${toneClass} min-w-[110px]`} space="xs">
      <Text className="text-[11px] uppercase tracking-wide text-phase-secondary">{label}</Text>
      <Text className="text-sm font-semibold text-phase-primary">{value}</Text>
    </VStack>
  );
}

function SectionTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <VStack className="gap-1">
      <Heading className="text-base font-bold text-phase-primary">{title}</Heading>
      <Text className="text-sm leading-relaxed text-phase-secondary">{subtitle}</Text>
    </VStack>
  );
}

export default function DeviceSecurityCenter({
  compact = false,
}: {
  compact?: boolean;
}) {
  const isOnline = useStore((state) => state.isOnline);
  const {
    currentDevice,
    devices,
    events,
    sessions,
    loading,
    error,
    refresh,
    pendingSecuritySyncCount,
    unlinkDevice,
    revokeSession,
    revokeOtherSessions,
  } = useDeviceSecurity(20);
  const { showToast } = useSanctuaryToast();
  const [state, dispatch] = useReducer(reducer, initialState);
  const { busyDeviceId, busySessionId, pendingConfirm } = state;

  const trustedDevices = useMemo(
    () => devices.filter((device) => device.trustStatus === 'trusted'),
    [devices],
  );
  const currentInstallId = currentDevice?.installId ?? null;
  const currentPlatform = currentDevice?.platform?.toLowerCase() ?? Platform.OS;
  const currentSession = useMemo(
    () =>
      sessions.find((session) => currentInstallId && session.installId === currentInstallId) ?? null,
    [sessions, currentInstallId],
  );
  const activeSessions = useMemo(
    () => sessions.filter((session) => session.status === 'active'),
    [sessions],
  );

  const currentDeviceLabel = useMemo(() => {
    if (!currentDevice) return 'Current device unavailable';
    if (currentPlatform.includes('web')) return 'Current browser';
    if (currentPlatform.includes('ios') || currentPlatform.includes('android')) {
      return 'Current mobile device';
    }
    return 'Current device';
  }, [currentDevice, currentPlatform]);

  const closeConfirm = () => {
    dispatch({ type: 'setPendingConfirm', value: null });
  };

  const openConfirm = (value: PendingConfirmAction) => {
    hapticLight();
    dispatch({ type: 'setPendingConfirm', value });
  };

  const performUnlinkDevice = async (deviceId: string, isCurrent: boolean) => {
    dispatch({ type: 'setBusyDeviceId', value: deviceId });
    try {
      const result = await unlinkDevice(deviceId, true);
      hapticSuccess();
      showToast?.({
        message: result.queued
          ? 'Device removal was applied locally and will sync when the connection returns.'
          : isCurrent
            ? 'Current device link removed for this account. Local remembered accounts remain below until signed out.'
            : 'Device removed from the current account',
        type: 'success',
      });
      await refresh();
    } catch (nextError) {
      const message = nextError instanceof Error ? nextError.message : 'Could not remove device';
      hapticError();
      showToast?.({ message, type: 'error' });
    } finally {
      dispatch({ type: 'setBusyDeviceId', value: null });
    }
  };

  const performRevokeSession = async (sessionId: string, isCurrent: boolean) => {
    dispatch({ type: 'setBusySessionId', value: sessionId });
    try {
      const result = await revokeSession(sessionId, isCurrent ? 'manual_current_revoke' : 'manual_revoke');
      hapticSuccess();
      showToast?.({
        message: result.queued
          ? 'Session revoke was saved locally and will sync when the connection returns.'
          : isCurrent
            ? 'Current security session revoked. You may need to sign in again.'
            : 'Security session revoked',
        type: 'success',
      });
      await refresh();
    } catch (nextError) {
      const message = nextError instanceof Error ? nextError.message : 'Could not revoke session';
      hapticError();
      showToast?.({ message, type: 'error' });
    } finally {
      dispatch({ type: 'setBusySessionId', value: null });
    }
  };

  const performRevokeOtherSessions = async (keepSessionId: string | null) => {
    dispatch({ type: 'setBusySessionId', value: keepSessionId ?? '__others__' });
    try {
      const result = await revokeOtherSessions(keepSessionId, 'manual_other_revoke');
      const revoked = result.data;
      hapticSuccess();
      showToast?.({
        message: result.queued
          ? 'Other-session revoke was saved locally and will sync when the connection returns.'
          : revoked > 0
            ? `Revoked ${revoked} other session${revoked === 1 ? '' : 's'}`
            : 'No other active sessions to revoke',
        type: 'success',
      });
      await refresh();
    } catch (nextError) {
      const message =
        nextError instanceof Error ? nextError.message : 'Could not revoke other sessions';
      hapticError();
      showToast?.({ message, type: 'error' });
    } finally {
      dispatch({ type: 'setBusySessionId', value: null });
    }
  };

  const handleUnlinkDevice = async (deviceId: string, isCurrent: boolean) => {
    if (!isOnline) {
      openConfirm({ type: 'unlinkDevice', deviceId, isCurrent });
      return;
    }

    const prompt = isCurrent
      ? 'Remove the current device from this account? This does not erase other remembered accounts stored locally on this device.'
      : 'Remove this device from the current account and revoke its active sessions?';

    if (Platform.OS === 'web') {
      const confirmed = window.confirm(prompt);
      if (!confirmed) return;
      await performUnlinkDevice(deviceId, isCurrent);
      return;
    }

    openConfirm({ type: 'unlinkDevice', deviceId, isCurrent });
  };

  const handleRevokeSession = async (sessionId: string, isCurrent: boolean) => {
    if (!isOnline) {
      openConfirm({ type: 'revokeSession', sessionId, isCurrent });
      return;
    }

    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Revoke this security session for the current account?');
      if (!confirmed) return;
      await performRevokeSession(sessionId, isCurrent);
      return;
    }

    openConfirm({ type: 'revokeSession', sessionId, isCurrent });
  };

  const handleRevokeOtherSessions = async () => {
    const keepSessionId = currentSession?.sessionId ?? null;
    if (!isOnline) {
      openConfirm({ type: 'revokeOtherSessions', keepSessionId });
      return;
    }

    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Revoke all other active sessions for the current account?');
      if (!confirmed) return;
      await performRevokeOtherSessions(keepSessionId);
      return;
    }

    openConfirm({ type: 'revokeOtherSessions', keepSessionId });
  };

  const confirmPendingAction = async () => {
    if (!pendingConfirm) return;

    try {
      if (pendingConfirm.type === 'unlinkDevice') {
        await performUnlinkDevice(pendingConfirm.deviceId, pendingConfirm.isCurrent);
      } else if (pendingConfirm.type === 'revokeSession') {
        await performRevokeSession(pendingConfirm.sessionId, pendingConfirm.isCurrent);
      } else if (pendingConfirm.type === 'revokeOtherSessions') {
        await performRevokeOtherSessions(pendingConfirm.keepSessionId);
      }
    } finally {
      closeConfirm();
    }
  };

  const confirmTitle =
    pendingConfirm?.type === 'unlinkDevice'
      ? 'Remove device while offline?'
      : pendingConfirm?.type === 'revokeOtherSessions'
        ? 'Revoke other sessions while offline?'
        : pendingConfirm?.type === 'revokeSession'
          ? 'Revoke session while offline?'
          : 'Confirm security action';

  const confirmBody =
    pendingConfirm?.type === 'unlinkDevice'
      ? pendingConfirm.isCurrent
        ? 'This will remove the current device link for this account immediately on the device. Because there is no internet connection, the server-side revoke and audit trail will finish later.'
        : 'This will remove the linked device for this account immediately from local security state. Because there is no internet connection, the server-side revoke and audit trail will finish later.'
      : pendingConfirm?.type === 'revokeOtherSessions'
        ? 'This will queue revocation for your other active sessions. Because there is no internet connection, those remote sessions may remain usable until connectivity returns and the sync completes.'
        : pendingConfirm?.type === 'revokeSession'
          ? pendingConfirm.isCurrent
            ? 'This will revoke the current security session locally first. Because there is no internet connection, server reconciliation and audit will complete later.'
            : 'This will queue revocation for the selected security session. Because there is no internet connection, that remote session may remain usable until connectivity returns and the sync completes.'
          : '';

  const confirmFooter = (
    <HStack className="w-full gap-3">
      <Box className="flex-1">
        <Button className="rounded-2xl" variant="outline" onPress={closeConfirm}>
          <ButtonText>Cancel</ButtonText>
        </Button>
      </Box>
      <Box className="flex-[1.4]">
        <Button
          className="rounded-2xl"
          action="negative"
          onPress={() => {
            void confirmPendingAction();
          }}
          isDisabled={!!busyDeviceId || !!busySessionId}
        >
          <ButtonText>
            {busyDeviceId || busySessionId ? 'Working…' : 'Continue offline'}
          </ButtonText>
        </Button>
      </Box>
    </HStack>
  );

  return (
    <Box
      className={`rounded-[28px] border border-phase-border bg-phase-surface ${compact ? 'p-4' : 'p-5'}`}
    >
      <VStack className="gap-5">
        <HStack className="items-start justify-between gap-3">
          <VStack className="flex-1 gap-1">
            <Heading className="text-lg font-bold text-phase-primary">Device security center</Heading>
            <Text className="text-sm leading-relaxed text-phase-secondary">
              See this device, your linked devices for the current account, security sessions,
              recent activity, and the accounts remembered locally on this install.
            </Text>
          </VStack>
          <Box className="h-11 w-11 items-center justify-center rounded-[14px] border border-phase-border bg-phase-world">
            <Shield size={18} className="text-phase-primary" />
          </Box>
        </HStack>

        {pendingSecuritySyncCount > 0 ? (
          <Box className="rounded-[20px] border border-amber-500/20 bg-amber-500/10 p-4">
            <Text className="text-sm font-semibold text-phase-primary">Security sync pending</Text>
            <Text className="mt-1 text-sm leading-relaxed text-phase-secondary">
              Local security changes are already applied on this device. {pendingSecuritySyncCount}{' '}
              server sync {pendingSecuritySyncCount === 1 ? 'intent is' : 'intents are'} waiting
              for connectivity.
            </Text>
          </Box>
        ) : null}

        {loading ? (
          <HStack className="items-center gap-3 rounded-[20px] border border-phase-border bg-phase-world p-4">
            <Spinner />
            <Text className="text-sm text-phase-secondary">Loading device security details…</Text>
          </HStack>
        ) : error ? (
          <Box className="rounded-[20px] border border-amber-500/20 bg-amber-500/10 p-4">
            <Text className="text-sm font-semibold text-phase-primary">Security details unavailable</Text>
            <Text className="mt-1 text-sm leading-relaxed text-phase-secondary">{error}</Text>
          </Box>
        ) : (
          <>
            <VStack className="gap-3 rounded-[24px] border border-phase-primary bg-phase-world p-4">
              <SectionTitle
                title={currentDeviceLabel}
                subtitle="This is the install currently in use. It anchors local PIN checks, account switching, and trust visibility."
              />

              {currentDevice ? (
                <>
                  <HStack className="items-start gap-3">
                    <Box className="h-12 w-12 items-center justify-center rounded-[16px] border border-phase-border bg-phase-surface">
                      {(() => {
                        const Icon = getDeviceIcon(currentDevice.platform);
                        return <Icon size={22} className="text-phase-primary" />;
                      })()}
                    </Box>
                    <VStack className="flex-1 gap-1">
                      <HStack className="items-center gap-2">
                        <Text className="text-base font-semibold text-phase-primary">
                          {currentDevice.modelName || currentDevice.platform || 'Unnamed device'}
                        </Text>
                        <Box
                          className={`rounded-full px-2 py-1 ${
                            trustTone(currentDevice.trustStatus) === 'success'
                              ? 'bg-emerald-500/15'
                              : trustTone(currentDevice.trustStatus) === 'warning'
                                ? 'bg-amber-500/15'
                                : 'bg-phase-surface'
                          }`}
                        >
                          <Text className="text-[10px] font-bold uppercase text-phase-primary">
                            {formatTrustLabel(currentDevice.trustStatus)}
                          </Text>
                        </Box>
                      </HStack>
                      <Text className="text-sm text-phase-secondary">
                        {summarizeDevice(currentDevice)}
                      </Text>
                      <Text className="text-xs text-phase-secondary">
                        Install ID: {currentDevice.installId}
                      </Text>
                    </VStack>
                  </HStack>

                  <HStack className="flex-wrap gap-2">
                    <StatPill
                      label="Last seen"
                      value={relativeTime(currentDevice.lastSeenAt)}
                      tone={trustTone(currentDevice.trustStatus)}
                    />
                    <StatPill label="Last accessed" value={relativeTime(currentDevice.lastAccessedAt)} />
                    <StatPill label="Linked devices" value={String(devices.length)} />
                    <StatPill label="Active sessions" value={String(activeSessions.length)} />
                  </HStack>
                </>
              ) : (
                <Text className="text-sm text-phase-secondary">
                  The app has not resolved this device against the security registry yet.
                </Text>
              )}
            </VStack>

            <VStack className="gap-3">
              <SectionTitle
                title="Trusted devices"
                subtitle="These devices or browser installs are linked to the current account only. This is separate from the remembered accounts stored on this device below."
              />

              {devices.length === 0 ? (
                <Box className="rounded-[20px] border border-dashed border-phase-border bg-phase-world p-4">
                  <Text className="text-sm text-phase-secondary">
                    No linked devices are visible yet for this account.
                  </Text>
                </Box>
              ) : (
                <VStack className="gap-3">
                  {devices.map((device) => {
                    const isCurrent = !!currentInstallId && device.installId === currentInstallId;
                    const Icon = getDeviceIcon(device.platform);
                    return (
                      <Box
                        key={`${device.deviceId}-${device.installId}`}
                        className={`rounded-[22px] border p-4 ${
                          isCurrent ? 'border-phase-primary bg-phase-world' : 'border-phase-border bg-phase-surface'
                        }`}
                      >
                        <HStack className="items-start gap-3">
                          <Box className="h-11 w-11 items-center justify-center rounded-[14px] border border-phase-border bg-phase-world">
                            <Icon size={20} className="text-phase-primary" />
                          </Box>
                          <VStack className="flex-1 gap-1">
                            <HStack className="items-center gap-2">
                              <Text className="text-base font-semibold text-phase-primary">
                                {device.modelName || device.platform || 'Unnamed device'}
                              </Text>
                              {isCurrent ? (
                                <Box className="rounded-full bg-phase-primary px-2 py-1">
                                  <Text className="text-[10px] font-bold uppercase text-white">
                                    Current
                                  </Text>
                                </Box>
                              ) : null}
                              <Box
                                className={`rounded-full px-2 py-1 ${
                                  trustTone(device.trustStatus) === 'success'
                                    ? 'bg-emerald-500/15'
                                    : trustTone(device.trustStatus) === 'warning'
                                      ? 'bg-amber-500/15'
                                      : 'bg-phase-surface'
                                }`}
                              >
                                <Text className="text-[10px] font-bold uppercase text-phase-primary">
                                  {formatTrustLabel(device.trustStatus)}
                                </Text>
                              </Box>
                            </HStack>
                            <Text className="text-sm text-phase-secondary">
                              {summarizeDevice(device)}
                            </Text>
                            <Text className="text-xs text-phase-secondary">
                              Last active {relativeTime(device.lastAccessedAt || device.lastSeenAt)} • Seen{' '}
                              {formatAbsoluteDate(device.lastSeenAt)}
                            </Text>
                          </VStack>
                        </HStack>

                        <HStack className="mt-4 gap-2">
                          <Button
                            className="rounded-2xl"
                            variant="outline"
                            action="negative"
                            onPress={() => {
                              void handleUnlinkDevice(device.deviceId, isCurrent);
                            }}
                            isDisabled={busyDeviceId === device.deviceId}
                          >
                            <ButtonText>{isCurrent ? 'Unlink current device' : 'Remove device'}</ButtonText>
                          </Button>
                        </HStack>
                      </Box>
                    );
                  })}
                </VStack>
              )}

              <HStack className="flex-wrap gap-2">
                <StatPill label="Trusted" value={String(trustedDevices.length)} tone="success" />
                <StatPill
                  label="Review"
                  value={String(devices.filter((device) => device.trustStatus !== 'trusted').length)}
                  tone={devices.some((device) => device.trustStatus !== 'trusted') ? 'warning' : 'default'}
                />
              </HStack>
            </VStack>

            <VStack className="gap-3">
              <SectionTitle
                title="Security sessions"
                subtitle="These are active or revoked security sessions for the current account. They are not the same as remembered accounts on this device."
              />

              {sessions.length === 0 ? (
                <Box className="rounded-[20px] border border-dashed border-phase-border bg-phase-world p-4">
                  <Text className="text-sm text-phase-secondary">
                    No security sessions are visible yet for this account.
                  </Text>
                </Box>
              ) : (
                <VStack className="gap-3">
                  <HStack className="flex-wrap gap-2">
                    <StatPill label="Active" value={String(activeSessions.length)} tone="success" />
                    <StatPill
                      label="Revoked"
                      value={String(sessions.filter((session) => session.status === 'revoked').length)}
                      tone="warning"
                    />
                    <Button
                      className="rounded-2xl"
                      variant="outline"
                      action="negative"
                      onPress={() => {
                        void handleRevokeOtherSessions();
                      }}
                      isDisabled={activeSessions.length <= 1 || !!busySessionId}
                    >
                      <ButtonText>Revoke other sessions</ButtonText>
                    </Button>
                  </HStack>

                  {sessions.map((session) => {
                    const isCurrent = !!currentSession && currentSession.sessionId === session.sessionId;
                    const Icon = getDeviceIcon(session.platform);
                    return (
                      <Box
                        key={session.sessionId}
                        className={`rounded-[22px] border p-4 ${
                          isCurrent ? 'border-phase-primary bg-phase-world' : 'border-phase-border bg-phase-surface'
                        }`}
                      >
                        <HStack className="items-start gap-3">
                          <Box className="h-11 w-11 items-center justify-center rounded-[14px] border border-phase-border bg-phase-world">
                            <Icon size={20} className="text-phase-primary" />
                          </Box>
                          <VStack className="flex-1 gap-1">
                            <HStack className="items-center gap-2">
                              <Text className="text-base font-semibold text-phase-primary">
                                {session.modelName || session.platform || 'Unnamed session'}
                              </Text>
                              {isCurrent ? (
                                <Box className="rounded-full bg-phase-primary px-2 py-1">
                                  <Text className="text-[10px] font-bold uppercase text-white">
                                    Current
                                  </Text>
                                </Box>
                              ) : null}
                              <Box
                                className={`rounded-full px-2 py-1 ${
                                  session.status === 'active' ? 'bg-emerald-500/15' : 'bg-amber-500/15'
                                }`}
                              >
                                <Text className="text-[10px] font-bold uppercase text-phase-primary">
                                  {session.status}
                                </Text>
                              </Box>
                              <Box
                                className={`rounded-full px-2 py-1 ${
                                  trustTone(session.trustStatus) === 'success'
                                    ? 'bg-emerald-500/15'
                                    : trustTone(session.trustStatus) === 'warning'
                                      ? 'bg-amber-500/15'
                                      : 'bg-phase-surface'
                                }`}
                              >
                                <Text className="text-[10px] font-bold uppercase text-phase-primary">
                                  {formatTrustLabel(session.trustStatus)}
                                </Text>
                              </Box>
                            </HStack>
                            <Text className="text-sm text-phase-secondary">
                              {summarizeDevice(session)}
                            </Text>
                            <Text className="text-xs text-phase-secondary">
                              Started {relativeTime(session.startedAt)} • Last seen {relativeTime(session.lastSeenAt)}
                            </Text>
                            {session.revokedAt ? (
                              <Text className="text-xs text-phase-secondary">
                                Revoked {formatAbsoluteDate(session.revokedAt)}
                                {session.revokeReason ? ` • ${session.revokeReason}` : ''}
                              </Text>
                            ) : null}
                          </VStack>
                        </HStack>

                        {session.status === 'active' ? (
                          <HStack className="mt-4 gap-2">
                            <Button
                              className="rounded-2xl"
                              variant="outline"
                              action="negative"
                              onPress={() => {
                                void handleRevokeSession(session.sessionId, isCurrent);
                              }}
                              isDisabled={busySessionId === session.sessionId}
                            >
                              <ButtonText>{isCurrent ? 'Revoke current session' : 'Revoke session'}</ButtonText>
                            </Button>
                          </HStack>
                        ) : null}
                      </Box>
                    );
                  })}
                </VStack>
              )}
            </VStack>

            <VStack className="gap-3">
              <SectionTitle
                title="Recent security activity"
                subtitle="This activity belongs to the current account-device security history. It shows account linking, switching, sign-out, unlinking, and removal events we are auditing."
              />

              {events.length === 0 ? (
                <Box className="rounded-[20px] border border-dashed border-phase-border bg-phase-world p-4">
                  <Text className="text-sm text-phase-secondary">
                    No recent security activity has been recorded yet.
                  </Text>
                </Box>
              ) : (
                <VStack className="gap-3">
                  {events.map((event) => {
                    const trusted = event.device?.trustStatus === 'trusted';
                    const EventIcon = trusted ? CheckCircle2 : AlertTriangle;
                    const detail =
                      typeof event.metadata?.['email'] === 'string'
                        ? String(event.metadata['email'])
                        : typeof event.metadata?.['scope'] === 'string'
                          ? String(event.metadata['scope'])
                          : event.device?.modelName || event.device?.platform || 'Security event';

                    return (
                      <HStack
                        key={event.id}
                        className="items-start gap-3 rounded-[20px] border border-phase-border bg-phase-world p-4"
                      >
                        <Box
                          className={`mt-0.5 h-10 w-10 items-center justify-center rounded-[14px] ${
                            trusted ? 'bg-emerald-500/10' : 'bg-amber-500/10'
                          }`}
                        >
                          <EventIcon size={18} className="text-phase-primary" />
                        </Box>
                        <VStack className="flex-1 gap-1">
                          <Text className="text-sm font-semibold text-phase-primary">
                            {formatActionLabel(event.action)}
                          </Text>
                          <Text className="text-sm text-phase-secondary">{detail}</Text>
                          <HStack className="items-center gap-2">
                            <Clock3 size={14} className="text-phase-secondary" />
                            <Text className="text-xs text-phase-secondary">
                              {relativeTime(event.createdAt)} • {formatAbsoluteDate(event.createdAt)}
                            </Text>
                          </HStack>
                        </VStack>
                      </HStack>
                    );
                  })}
                </VStack>
              )}
            </VStack>

            <DeviceAccountManager compact={compact} />
          </>
        )}
      </VStack>

      <SanctuaryModal
        isOpen={!!pendingConfirm}
        onClose={closeConfirm}
        title={confirmTitle}
        subtitle="Local safety can happen now even when server sync must wait."
        icon={<AlertTriangle size={20} className="text-amber-500" />}
        footer={confirmFooter}
      >
        <VStack className="gap-4 py-2">
          <Text className="text-base text-phase-text-secondary">{confirmBody}</Text>
          <Box className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4">
            <Text className="text-sm text-phase-text-secondary">
              The local security action will be recorded now. Server-side revoke, unlink, and audit
              work will finish later when the internet connection comes back.
            </Text>
          </Box>
        </VStack>
      </SanctuaryModal>
    </Box>
  );
}
