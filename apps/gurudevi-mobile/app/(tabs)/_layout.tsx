import { createSupabaseGuardianRepository } from '@repo/core/adapters/supabase/guardianRepository';
import {
  claimAndSelectSchoolInvite,
  createSupabaseSchoolInviteRepository,
} from '@repo/core/adapters/supabase/schoolInviteRepository';
import { createSupabaseTuitionBatchRepository } from '@repo/core/adapters/supabase/tuitionBatchRepository';
import { supabaseClient } from '@repo/core/adapters/supabaseClient';
import { workspaceProvisioningClient } from '@repo/core/api/workspaceProvisioning';
import { useRewards, useScopedNotifications } from '@repo/core/hooks';
import { showToast } from '@repo/core/lib/feedback';
import { isOfflineLikeError } from '@repo/core/lib/sync/deviceSecurityIntents';
import {
  identity,
  isLocalOnlyIdentity,
  queueCommercialWorkspace,
  queueGuardianWorkspace,
  reconcileProvisionalWorkspaces,
  resolveWorkspaceSwitcherTargets,
  useAuth,
  usePermissions,
  usePerspectiveSwitch,
  useProvisionalWorkspaceQueue,
} from '@repo/core/logic';
import { useOfflineStatus } from '@repo/core/offline/useOfflineStatus';
import { useActiveSubTabsStore } from '@repo/core/store/useActiveSubTabsStore';
import { useAuthStore } from '@repo/core/store/useAuthStore';
import { useUIStore } from '@repo/core/store/useUIStore';
import { BreathGuide } from '@repo/self/wellbeing';
import { ActiveSubTabStrip, DomainSubHeader } from '@repo/ui';
import AchievementUnlockOverlay from '@repo/ui/components/AchievementUnlockOverlay';
import { CommercialBatchModal } from '@repo/ui/components/CommercialBatchModal';
import ErrorBoundary, { RouteErrorBoundary } from '@repo/ui/components/ErrorBoundary';
import GlobalHeader from '@repo/ui/components/GlobalHeader';
import { LinkWardModal } from '@repo/ui/components/LinkWardModal';
import { PerspectiveSwitcherSheet } from '@repo/ui/components/PerspectiveSwitcherSheet';
import { SchoolInviteCodeModal } from '@repo/ui/components/SchoolInviteCodeModal';
import {
  Bell,
  FileText,
  Heart,
  Library,
  School,
  Settings,
  User,
  Users,
  X,
} from '@repo/ui/icons/native';
import { Box, Modal, ModalContent, Pressable, Text } from '@repo/ui/primitives';
import { tokens } from '@repo/ui/tokens';
import { useWorld, Text as WText } from '@repo/ui/world/native';
import { router, Tabs, useGlobalSearchParams, usePathname } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeShellTabs } from '@/components/navigation/NativeShellTabs';
import { TabFeatureCatalogSheet } from '@/components/navigation/TabFeatureCatalogSheet';
import { getNavigationTitle } from '@/lib/navigation/appNavigation';
import { useShellVariant } from '@/lib/navigation/shellVariant';
import { useShellProbe } from '@/lib/navigation/useShellProbe';
import { getNativeShellConfig } from '@/lib/responsiveShell';
import { PowerSyncProvider } from '@/providers/PowerSyncProvider';

const EMPTY_DOMAIN_TABS: readonly string[] = [];

export const unstable_settings = {
  // SDK 58 reads `anchor`; `initialRouteName` still works but is deprecated.
  anchor: 'self',
};

export { RouteErrorBoundary as ErrorBoundary };

export default function TabsLayout() {
  return (
    <ErrorBoundary name="TabsLayout">
      <PowerSyncProvider>
        <TabsLayoutContent />
      </PowerSyncProvider>
    </ErrorBoundary>
  );
}

function TabsLayoutContent() {
  const pathname = usePathname();
  // The shell is dressed by the chosen world, like every screen inside it.
  const wt = useWorld().tokens;
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const shell = useMemo(
    () => getNativeShellConfig(width, height, insets.bottom),
    [height, insets.bottom, width],
  );
  const { context, can } = usePermissions();
  const userId = context.userId;
  const user = useAuthStore((state) => state.user);
  const { status: networkStatus, isOnline } = useOfflineStatus();
  const { refreshProfile } = useAuth();
  const isLocalGuest = isLocalOnlyIdentity(user);
  const { newAchievements } = useRewards();
  const { unreadCount } = useScopedNotifications(isLocalGuest ? null : userId);

  const displayName = user?.display_name?.split(' ')[0] || user?.email || 'Gurudevi';
  const [showCelebration, setShowCelebration] = useState(false);
  const [currentAchievement, setCurrentAchievement] = useState('');
  const previousAchievementsRef = useRef<string[]>([]);
  const isBreathingOpen = useUIStore((state) => state.isBreathingOpen);
  const setBreathingOpen = useUIStore((state) => state.setBreathingOpen);

  // Multi-Perspective State
  const {
    availablePerspectives,
    activePerspective,
    switchPerspective,
    addPerspective,
    hydratePerspectivesFromDatabase,
  } = usePerspectiveSwitch();
  const [isPerspectiveSwitcherOpen, setPerspectiveSwitcherOpen] = useState(false);
  const [catalogSheetTab, setCatalogSheetTab] = useState<
    'workspace' | 'self' | 'library' | 'community' | 'profile' | null
  >(null);
  const [isInviteCodeModalOpen, setInviteCodeModalOpen] = useState(false);
  const [isCommercialModalOpen, setCommercialModalOpen] = useState(false);
  const [isLinkWardModalOpen, setLinkWardModalOpen] = useState(false);
  const provisionalReconciliationRef = useRef(false);

  // Auto-reconcile perspective entities from Postgres / PowerSync SQLite on boot
  useEffect(() => {
    if (!user?.id || isLocalGuest) return;

    void hydratePerspectivesFromDatabase(user.id, {
      getCommercialBatches: async () => {
        try {
          const repo = createSupabaseTuitionBatchRepository(supabaseClient);
          return await repo.getMyBatches(user.id);
        } catch (e) {
          console.warn('[TabsLayout] getCommercialBatches error:', e);
          return [];
        }
      },
      getGuardianBonds: async () => {
        try {
          const repo = createSupabaseGuardianRepository(supabaseClient);
          const relationships = await repo.getGuardianRelationships(user.id);
          return relationships.map((rel: any) => ({
            id: rel.id || `ward-${rel.student_id}`,
            kind: 'guardian' as const,
            displayName:
              rel.wardName || `Student ${String(rel.student_id).slice(-4).toUpperCase()}`,
            wardUserId: rel.student_id,
            wardName: rel.wardName || `Student ${String(rel.student_id).slice(-4).toUpperCase()}`,
            schoolId: rel.school_id,
          }));
        } catch (e) {
          console.warn('[TabsLayout] getGuardianBonds error:', e);
          return [];
        }
      },
    });
  }, [hydratePerspectivesFromDatabase, isLocalGuest, user?.id]);

  useEffect(() => {
    if (!isOnline || !user?.id || isLocalGuest || provisionalReconciliationRef.current) return;
    provisionalReconciliationRef.current = true;
    const principalId = user.id;
    const commercialRepository = createSupabaseTuitionBatchRepository(supabaseClient);
    const guardianRepository = createSupabaseGuardianRepository(supabaseClient);

    void reconcileProvisionalWorkspaces({
      principalId,
      createCommercialBatch: async (request, idempotencyKey) => {
        const receipt = await workspaceProvisioningClient.commercialBatch({
          ...request,
          idempotencyKey,
        });
        const persisted = await commercialRepository.getBatchById(receipt.result.batchId);
        if (!persisted) throw new Error('Committed commercial workspace is not yet readable.');
        return persisted;
      },
      createGuardianLink: async (request, idempotencyKey) => {
        const receipt = await workspaceProvisioningClient.guardianLink({
          ...request,
          idempotencyKey,
        });
        const relationship = await guardianRepository
          .getGuardianRelationships(principalId)
          .then((relationships) =>
            relationships.find((candidate) => candidate.id === receipt.result.relationshipId),
          );
        if (!relationship) throw new Error('Committed guardian request is not yet readable.');
        return {
          id: relationship.id,
          kind: 'guardian',
          displayName: request.wardName,
          wardUserId: relationship.student_id,
          wardName: request.wardName,
          schoolId: request.schoolId,
        };
      },
      isStillCurrent: () => useAuthStore.getState().user?.id === principalId,
    })
      .then(async (perspectives) => {
        if (useAuthStore.getState().user?.id !== principalId) return;
        for (const perspective of perspectives) await addPerspective(perspective);
        if (perspectives.length > 0) {
          showToast('Your pending workspace is now ready.', 'success');
        }
      })
      .catch((error) => {
        console.warn('[TabsLayout] provisional workspace reconciliation failed:', error);
      })
      .finally(() => {
        provisionalReconciliationRef.current = false;
      });
  }, [addPerspective, isLocalGuest, isOnline, showToast, user?.id]);

  const workspaceTargets = useMemo(
    () =>
      resolveWorkspaceSwitcherTargets({
        currentWorkspace: 'teacher',
        canManageFounderDashboard: can('manage', 'FounderDashboard'),
        canManageAdminDashboard: can('manage', 'AdminDashboard'),
        canManagePrincipalDashboard: can('manage', 'PrincipalDashboard'),
        canManageGuardianDashboard: can('manage', 'GuardianDashboard'),
        canManageTeacherDashboard: can('manage', 'TeacherDashboard'),
        canManageStudentDashboard: can('manage', 'StudentDashboard'),
        hasPrimaryInstitution: Boolean(user?.school_id),
        hasMountedGuardianWorkspace: true,
        availablePerspectives,
        activePerspectiveId: activePerspective.id,
      }),
    [can, user?.school_id, availablePerspectives, activePerspective.id],
  );

  const isWorkspace = pathname.startsWith('/workspace');
  const perspectiveLabel = activePerspective.displayName || 'Personal Sanctuary';
  const perspectiveKind = activePerspective.kind;

  const title = getNavigationTitle(pathname);

  // A/B: the custom tab bar or the system one (NativeTabs), measured on this phone either way.
  const shellChoice = useShellVariant();
  const markTabPress = useShellProbe(shellChoice, pathname);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.title = `Gurudevi · ${title}`;
  }, [title]);

  useEffect(() => {
    if (newAchievements === previousAchievementsRef.current) return;
    previousAchievementsRef.current = newAchievements;

    if (newAchievements.length === 0 || showCelebration) return;
    const first = newAchievements[0];
    if (!first) return;

    const timer = setTimeout(() => {
      setCurrentAchievement(first);
      setShowCelebration(true);
    }, 0);

    return () => clearTimeout(timer);
  }, [newAchievements, showCelebration]);

  const handleSelectWorkspaceTarget = useCallback(
    (target: any) => {
      if (isLocalGuest) {
        showToast('Create an account to access shared workspaces.', 'info');
        return;
      }
      setPerspectiveSwitcherOpen(false);
      if (target.perspectiveId) {
        switchPerspective(target.perspectiveId);
      }
      if (target.destination?.kind === 'route') {
        router.push(target.destination.name as any);
      } else if (target.destination?.kind === 'tab') {
        router.push(`/(tabs)/${target.destination.name}` as any);
      }
    },
    [isLocalGuest, showToast, switchPerspective],
  );

  const handleRedeemInviteCode = useCallback(
    async (payload: {
      code: string;
      schoolId: string;
      schoolName: string;
      capacity: 'teacher' | 'student' | 'principal' | 'admin';
      roles: Array<'teacher' | 'student' | 'principal' | 'admin'>;
    }) => {
      if (isLocalGuest) {
        showToast('Create an account before joining a school.', 'info');
        return;
      }
      if (!user?.id) {
        showToast('Your account must finish loading before joining a school.', 'info');
        return;
      }
      try {
        const repo = createSupabaseSchoolInviteRepository(supabaseClient);
        await claimAndSelectSchoolInvite({
          repository: repo,
          identity,
          refreshIdentity: refreshProfile,
          code: payload.code,
          userId: user.id,
        });
        setInviteCodeModalOpen(false);
      } catch (err) {
        console.warn('[handleRedeemInviteCode] School invite claim failed:', err);
        showToast(
          'We could not confirm that school membership. Your current scope is unchanged.',
          'error',
        );
      }
    },
    [isLocalGuest, refreshProfile, showToast, user?.id],
  );

  const handleCreateCommercialBatch = useCallback(
    async (batch: any) => {
      if (isLocalGuest) {
        showToast('Create an account before creating a shared batch.', 'info');
        return;
      }
      if (!user?.id) return;
      const request = {
        instituteId: batch.instituteId === 'independent' ? undefined : batch.instituteId,
        subjectName: batch.subjectName,
        gradeLevel: batch.grade,
        medium: batch.medium,
        schedule: batch.batchName,
        customAlias: batch.customAlias,
        role: batch.role,
      };
      const command = await queueCommercialWorkspace(user.id, request).catch((error) => {
        console.warn('[handleCreateCommercialBatch] Local command save failed:', error);
        showToast('We could not save this workspace draft on this device.', 'error');
        return null;
      });
      if (!command) return;
      if (!isOnline) {
        setCommercialModalOpen(false);
        showToast(
          networkStatus === 'offline'
            ? 'Workspace draft saved locally. It will be created when you reconnect.'
            : 'Workspace draft saved locally. It will be created when your connection is confirmed.',
          'info',
        );
        return;
      }
      let dispatchStarted = false;
      let serverCommitted = false;
      try {
        const claimed = await useProvisionalWorkspaceQueue.getState().claim(command.id, user.id);
        if (!claimed) {
          setCommercialModalOpen(false);
          showToast('This workspace request is already being processed.', 'info');
          return;
        }
        dispatchStarted = true;
        if (useAuthStore.getState().user?.id !== user.id) {
          await useProvisionalWorkspaceQueue.getState().recoverInterrupted(user.id, command.id);
          return;
        }
        const receipt = await workspaceProvisioningClient.commercialBatch({
          ...request,
          idempotencyKey: command.idempotencyKey,
        });
        serverCommitted = true;
        const repo = createSupabaseTuitionBatchRepository(supabaseClient);
        const persistedBatch = await repo.getBatchById(receipt.result.batchId);
        if (!persistedBatch) throw new Error('Committed workspace is not yet readable.');
        if (useAuthStore.getState().user?.id !== user.id) {
          await useProvisionalWorkspaceQueue.getState().recoverInterrupted(user.id, command.id);
          return;
        }
        await useProvisionalWorkspaceQueue.getState().resolve(command.id, user.id, persistedBatch);
        await addPerspective(persistedBatch);
        setCommercialModalOpen(false);
        router.push(`/workspace/commercial/${persistedBatch.id}` as any);
      } catch (err) {
        console.warn('[handleCreateCommercialBatch] DB persistence failed:', err);
        if (dispatchStarted) {
          try {
            await useProvisionalWorkspaceQueue.getState().recoverInterrupted(user.id, command.id);
          } catch (recoveryError) {
            console.warn(
              '[handleCreateCommercialBatch] Local receipt recovery save failed:',
              recoveryError,
            );
          }
        }
        if (serverCommitted) {
          setCommercialModalOpen(false);
          showToast(
            'The workspace was created; its local confirmation will recover later.',
            'info',
          );
          return;
        }
        if (isOfflineLikeError(err)) {
          setCommercialModalOpen(false);
          showToast(
            'Workspace draft saved locally. It will be created when you reconnect.',
            'info',
          );
          return;
        }
        showToast(
          'We could not save or confirm that workspace. Your current scope is unchanged.',
          'error',
        );
      }
    },
    [addPerspective, isLocalGuest, isOnline, networkStatus, showToast, switchPerspective, user?.id],
  );

  const handleLinkWard = useCallback(
    async (wardPerspective: any) => {
      if (isLocalGuest) {
        showToast('Create an account before linking a ward.', 'info');
        return;
      }
      if (!user?.id) return;
      const request = {
        wardUserId: wardPerspective.wardUserId,
        relationship: wardPerspective.relationship || 'parent',
        schoolId: wardPerspective.schoolId,
        wardName: wardPerspective.wardName || 'Ward',
      };
      const command = await queueGuardianWorkspace(user.id, request).catch((error) => {
        console.warn('[handleLinkWard] Local request save failed:', error);
        showToast('We could not save this ward-link request on this device.', 'error');
        return null;
      });
      if (!command) return;
      if (!isOnline) {
        setLinkWardModalOpen(false);
        showToast(
          networkStatus === 'offline'
            ? 'Ward link saved locally. It will be requested when you reconnect.'
            : 'Ward link saved locally. It will be requested when your connection is confirmed.',
          'info',
        );
        return;
      }
      let dispatchStarted = false;
      let serverCommitted = false;
      try {
        const claimed = await useProvisionalWorkspaceQueue.getState().claim(command.id, user.id);
        if (!claimed) {
          setLinkWardModalOpen(false);
          showToast('This ward-link request is already being processed.', 'info');
          return;
        }
        dispatchStarted = true;
        if (useAuthStore.getState().user?.id !== user.id) {
          await useProvisionalWorkspaceQueue.getState().recoverInterrupted(user.id, command.id);
          return;
        }
        const receipt = await workspaceProvisioningClient.guardianLink({
          ...request,
          idempotencyKey: command.idempotencyKey,
        });
        serverCommitted = true;
        const repo = createSupabaseGuardianRepository(supabaseClient);
        const relationship = (await repo.getGuardianRelationships(user.id)).find(
          (candidate) => candidate.id === receipt.result.relationshipId,
        );
        if (!relationship) throw new Error('Committed guardian request is not yet readable.');
        if (useAuthStore.getState().user?.id !== user.id) {
          await useProvisionalWorkspaceQueue.getState().recoverInterrupted(user.id, command.id);
          return;
        }
        const persistedWardPerspective = {
          ...wardPerspective,
          id: relationship.id,
          wardUserId: relationship.student_id,
        };
        await useProvisionalWorkspaceQueue
          .getState()
          .resolve(command.id, user.id, persistedWardPerspective);
        // A pending guardian request is a view, never an active authorization scope.
        await addPerspective(persistedWardPerspective);
        setLinkWardModalOpen(false);
      } catch (err) {
        console.warn('[handleLinkWard] relationship persistence failed:', err);
        if (dispatchStarted) {
          try {
            await useProvisionalWorkspaceQueue.getState().recoverInterrupted(user.id, command.id);
          } catch (recoveryError) {
            console.warn('[handleLinkWard] Local receipt recovery save failed:', recoveryError);
          }
        }
        if (serverCommitted) {
          setLinkWardModalOpen(false);
          showToast(
            'The ward link was requested; its local confirmation will recover later.',
            'info',
          );
          return;
        }
        if (isOfflineLikeError(err)) {
          setLinkWardModalOpen(false);
          showToast(
            networkStatus === 'offline'
              ? 'Ward link saved locally. It will be requested when you reconnect.'
              : 'Ward link saved locally. It will be requested when your connection is confirmed.',
            'info',
          );
          return;
        }
        showToast(
          'We could not save or confirm that ward link. Your current scope is unchanged.',
          'error',
        );
      }
    },
    [addPerspective, isLocalGuest, isOnline, networkStatus, showToast, switchPerspective, user?.id],
  );

  const currentDomain = useMemo<'workspace' | 'self' | 'library' | 'community' | 'profile'>(() => {
    if (pathname.startsWith('/workspace')) return 'workspace';
    if (pathname.startsWith('/self')) return 'self';
    if (pathname.startsWith('/library')) return 'library';
    if (pathname.startsWith('/community')) return 'community';
    return 'profile';
  }, [pathname]);

  const globalParams = useGlobalSearchParams<{ feature?: string }>();

  const isDomainRoot = useMemo(() => {
    if (currentDomain === 'self') {
      return !globalParams.feature;
    }
    if (currentDomain === 'workspace') {
      return pathname === '/workspace' || pathname === '/workspace/';
    }
    return pathname === `/${currentDomain}` || pathname === `/${currentDomain}/`;
  }, [currentDomain, globalParams.feature, pathname]);

  const domainTabs = useActiveSubTabsStore(
    (s) => s.tabsByDomain[currentDomain] ?? EMPTY_DOMAIN_TABS,
  );
  const showActiveSubTabs = useActiveSubTabsStore((s) => s.preferences.showActiveSubTabs);
  const headerStyle = useActiveSubTabsStore((s) => s.preferences.headerStyle);
  const autoHideChromeOnScroll = useActiveSubTabsStore((s) => s.preferences.autoHideChromeOnScroll);
  const isChromeVisible = useActiveSubTabsStore((s) => s.isChromeVisible);
  const returnToDomainOverview = useCallback(() => {
    const overviewRoute: Record<
      typeof currentDomain,
      '/workspace' | '/self' | '/library' | '/community' | '/profile'
    > = {
      workspace: '/workspace',
      self: '/self',
      library: '/library',
      community: '/community',
      profile: '/profile',
    };
    router.replace(overviewRoute[currentDomain]);
  }, [currentDomain]);

  const globalHeaderRightAction = (
    <Box
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: tokens.spacing.sm,
        paddingHorizontal: shell.header.horizontalPadding - tokens.spacing.md,
      }}
    >
      {pathname.startsWith('/workspace') ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open editorial workspace"
          accessibilityHint="Write or review editorial submissions"
          onPress={() => router.push('/workspace/editorial')}
          style={{
            width: tokens.interaction.minTouchTarget,
            height: tokens.interaction.minTouchTarget,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: tokens.radii.full,
            backgroundColor: wt.sunken,
          }}
        >
          <FileText size={18} color={wt.ink} />
        </Pressable>
      ) : null}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Open notifications"
        accessibilityHint="Navigates to the notifications page to view updates"
        onPress={() => router.push('/notifications')}
        style={{
          position: 'relative',
          width: tokens.interaction.minTouchTarget,
          height: tokens.interaction.minTouchTarget,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: tokens.radii.full,
          backgroundColor: wt.sunken,
        }}
      >
        <Bell size={18} color={wt.ink} />
        {unreadCount > 0 ? (
          <Box
            style={{
              position: 'absolute',
              top: 7,
              right: 8,
              minWidth: 16,
              height: 16,
              borderRadius: 8,
              backgroundColor: wt.lamp,
              paddingHorizontal: 4,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text
              style={{
                color: wt.onLamp,
                fontSize: tokens.typography.sizes.xs,
                fontWeight: '800',
              }}
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Text>
          </Box>
        ) : null}
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Open settings"
        accessibilityHint="Navigates to the settings page to configure user preferences"
        onPress={() => router.push('/settings')}
        style={{
          width: tokens.interaction.minTouchTarget,
          height: tokens.interaction.minTouchTarget,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: tokens.radii.full,
          backgroundColor: wt.sunken,
        }}
      >
        <Settings size={18} color={wt.ink} />
      </Pressable>
    </Box>
  );

  const renderHeader = () => {
    if (headerStyle === 'minimal_tabs_only') {
      return (
        <Box>
          {showActiveSubTabs && (
            <ActiveSubTabStrip domain={currentDomain} onReturnToOverview={returnToDomainOverview} />
          )}
        </Box>
      );
    }

    if (headerStyle === 'compact_domain') {
      return (
        <Box>
          <DomainSubHeader
            title={currentDomain.charAt(0).toUpperCase() + currentDomain.slice(1)}
            subtitle={isWorkspace ? undefined : displayName}
            domain={currentDomain}
            perspectivePill={
              isWorkspace
                ? {
                    label: perspectiveLabel,
                    onPress: () => setPerspectiveSwitcherOpen(true),
                  }
                : undefined
            }
            unreadCount={unreadCount}
            onBackPress={
              !isDomainRoot
                ? () => {
                    if (currentDomain === 'self') router.push('/self' as any);
                    else if (currentDomain === 'workspace') router.push('/workspace' as any);
                    else router.back();
                  }
                : undefined
            }
            onNotificationsPress={() => router.push('/notifications')}
            onSettingsPress={() => router.push('/settings')}
            onCatalogPress={() => setCatalogSheetTab(currentDomain)}
          />
          {showActiveSubTabs && (
            <ActiveSubTabStrip domain={currentDomain} onReturnToOverview={returnToDomainOverview} />
          )}
        </Box>
      );
    }

    if (headerStyle === 'classic_global') {
      return (
        <Box>
          <GlobalHeader
            title={isWorkspace ? undefined : title}
            subtitle={shell.header.subtitleVisible && !isWorkspace ? displayName : undefined}
            perspectivePill={
              isWorkspace
                ? {
                    label: perspectiveLabel,
                    kind: perspectiveKind,
                    onPress: () => setPerspectiveSwitcherOpen(true),
                  }
                : undefined
            }
            rightAction={globalHeaderRightAction}
          />
          {showActiveSubTabs && (
            <ActiveSubTabStrip domain={currentDomain} onReturnToOverview={returnToDomainOverview} />
          )}
        </Box>
      );
    }

    // 'adaptive' (SMART DEFAULT)
    if (!isDomainRoot) {
      return (
        <Box>
          <DomainSubHeader
            title={title}
            subtitle={currentDomain.charAt(0).toUpperCase() + currentDomain.slice(1)}
            domain={currentDomain}
            perspectivePill={
              isWorkspace
                ? {
                    label: perspectiveLabel,
                    onPress: () => setPerspectiveSwitcherOpen(true),
                  }
                : undefined
            }
            unreadCount={unreadCount}
            onBackPress={() => {
              if (currentDomain === 'self') {
                router.push('/self' as any);
              } else if (currentDomain === 'workspace') {
                router.push('/workspace' as any);
              } else {
                router.back();
              }
            }}
            onNotificationsPress={() => router.push('/notifications')}
            onSettingsPress={() => router.push('/settings')}
            onCatalogPress={() => setCatalogSheetTab(currentDomain)}
          />
          {showActiveSubTabs && (
            <ActiveSubTabStrip domain={currentDomain} onReturnToOverview={returnToDomainOverview} />
          )}
        </Box>
      );
    }

    // Default Overview Screen under GlobalHeader (no redundant subheader!)
    return (
      <Box>
        <GlobalHeader
          title={isWorkspace ? undefined : title}
          subtitle={shell.header.subtitleVisible && !isWorkspace ? displayName : undefined}
          perspectivePill={
            isWorkspace
              ? {
                  label: perspectiveLabel,
                  kind: perspectiveKind,
                  onPress: () => setPerspectiveSwitcherOpen(true),
                }
              : undefined
          }
          rightAction={globalHeaderRightAction}
        />
        {showActiveSubTabs && domainTabs.length > 0 && (
          <ActiveSubTabStrip domain={currentDomain} onReturnToOverview={returnToDomainOverview} />
        )}
      </Box>
    );
  };

  const nativeTabs = (
    <NativeShellTabs
      header={!autoHideChromeOnScroll || isChromeVisible ? renderHeader() : null}
      onTabPress={markTabPress}
      showLabels={shell.visibleChrome.tabLabels}
    />
  );

  return (
    <>
      {shellChoice.variant === 'native' ? (
        nativeTabs
      ) : (
        <Tabs
          screenOptions={{
            headerShown: !autoHideChromeOnScroll || isChromeVisible,
            tabBarHideOnKeyboard: true,
            tabBarActiveTintColor: wt.ink,
            tabBarInactiveTintColor: wt.inkSoft,
            tabBarShowLabel: shell.visibleChrome.tabLabels,
            tabBarStyle: {
              minHeight: shell.tabBar.minHeight,
              paddingTop: shell.tabBar.paddingTop,
              paddingBottom: shell.tabBar.paddingBottom,
              backgroundColor: wt.ground,
              borderTopColor: wt.line,
              borderTopWidth: 0.75,
              elevation: 0,
              shadowOpacity: 0,
              display: !autoHideChromeOnScroll || isChromeVisible ? 'flex' : 'none',
            },
            tabBarLabelStyle: {
              fontSize: tokens.typography.sizes.xs,
              fontWeight: '600',
            },
            header: renderHeader,
          }}
        >
          <Tabs.Screen
            name="library"
            listeners={{
              tabPress: () => markTabPress('library'),
              tabLongPress: () => setCatalogSheetTab('library'),
            }}
            options={{
              title: 'Library',
              tabBarIcon: ({ color, size }) => <Library color={color} size={size} />,
            }}
          />
          <Tabs.Screen
            name="workspace"
            listeners={{
              tabPress: () => markTabPress('workspace'),
              tabLongPress: () => setCatalogSheetTab('workspace'),
            }}
            options={{
              title: 'Workspace',
              tabBarIcon: ({ color, size }) => <School color={color} size={size} />,
            }}
          />
          <Tabs.Screen
            name="self"
            listeners={{
              tabPress: () => markTabPress('self'),
              tabLongPress: () => setCatalogSheetTab('self'),
            }}
            options={{
              title: 'Self',
              tabBarIcon: ({ color, size, focused }) => (
                <Box
                  style={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: size + 16,
                    height: size + 16,
                    borderRadius: tokens.radii.full,
                    backgroundColor: focused ? wt.sunken : 'transparent',
                  }}
                >
                  <Heart
                    color={focused ? wt.lampDeep : color}
                    size={size + 2}
                    strokeWidth={focused ? 2.4 : 2}
                    fill={focused ? wt.lamp : 'transparent'}
                  />
                </Box>
              ),
            }}
          />
          <Tabs.Screen
            name="community"
            listeners={{
              tabPress: () => markTabPress('community'),
              tabLongPress: () => setCatalogSheetTab('community'),
            }}
            options={{
              title: 'Community',
              tabBarIcon: ({ color, size }) => <Users color={color} size={size} />,
            }}
          />
          <Tabs.Screen
            name="profile"
            listeners={{
              tabPress: () => markTabPress('profile'),
              tabLongPress: () => setCatalogSheetTab('profile'),
            }}
            options={{
              title: 'Profile',
              tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
            }}
          />
          <Tabs.Screen
            name="notifications"
            options={{
              href: null,
            }}
          />
          <Tabs.Screen
            name="settings"
            options={{
              href: null,
            }}
          />
        </Tabs>
      )}

      <AchievementUnlockOverlay
        title={currentAchievement}
        visible={showCelebration}
        onHide={() => setShowCelebration(false)}
      />

      <TabFeatureCatalogSheet
        isOpen={Boolean(catalogSheetTab)}
        onClose={() => setCatalogSheetTab(null)}
        activeTabKey={catalogSheetTab || 'workspace'}
      />

      <PerspectiveSwitcherSheet
        isOpen={isPerspectiveSwitcherOpen}
        onClose={() => setPerspectiveSwitcherOpen(false)}
        targets={workspaceTargets}
        onSelectTarget={handleSelectWorkspaceTarget}
        onAddCommercialBatch={() => {
          setPerspectiveSwitcherOpen(false);
          setCommercialModalOpen(true);
        }}
        onLinkSchoolBond={() => {
          setPerspectiveSwitcherOpen(false);
          setInviteCodeModalOpen(true);
        }}
        onLinkWard={() => {
          setPerspectiveSwitcherOpen(false);
          setLinkWardModalOpen(true);
        }}
        onManagePerspectives={() => {
          setPerspectiveSwitcherOpen(false);
          router.push('/settings');
        }}
      />

      <SchoolInviteCodeModal
        isOpen={isInviteCodeModalOpen}
        onClose={() => setInviteCodeModalOpen(false)}
        onRedeemCode={handleRedeemInviteCode}
      />

      <CommercialBatchModal
        isOpen={isCommercialModalOpen}
        onClose={() => setCommercialModalOpen(false)}
        onCreateBatch={handleCreateCommercialBatch}
      />

      <LinkWardModal
        isOpen={isLinkWardModalOpen}
        onClose={() => setLinkWardModalOpen(false)}
        onLinkWard={handleLinkWard}
      />

      <Modal isOpen={isBreathingOpen} onClose={() => setBreathingOpen(false)}>
        <ModalContent style={{ backgroundColor: wt.ground }}>
          <Box
            style={{
              paddingTop: shell.modal.contentPadding,
              paddingBottom: tokens.spacing.md,
              paddingHorizontal: shell.modal.contentPadding,
              borderBottomWidth: 1,
              borderBottomColor: wt.line,
            }}
          >
            <Box
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Box>
                <WText kind="title">Breathing Reset</WText>
                <WText kind="caption">1 minute of peace</WText>
              </Box>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close breathing reset"
                accessibilityHint="Closes the breathing reset dialog"
                onPress={() => setBreathingOpen(false)}
                style={{
                  width: tokens.interaction.minTouchTarget,
                  height: tokens.interaction.minTouchTarget,
                  borderRadius: tokens.radii.full,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: wt.sunken,
                }}
              >
                <X size={18} color={wt.ink} />
              </Pressable>
            </Box>
          </Box>
          <Box
            style={{
              padding: shell.modal.contentPadding,
              minHeight: shell.modal.minHeight,
              justifyContent: 'center',
            }}
          >
            <BreathGuide onComplete={() => setBreathingOpen(false)} />
          </Box>
        </ModalContent>
      </Modal>
    </>
  );
}
