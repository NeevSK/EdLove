import { supabaseIdentityAdapter } from '@repo/core/adapters/supabaseIdentity.adapter';
import { createSupabaseGuardianRepository } from '@repo/core/adapters/supabase/guardianRepository';
import {
  claimAndSelectSchoolInvite,
  createSupabaseSchoolInviteRepository,
} from '@repo/core/adapters/supabase/schoolInviteRepository';
import { createSupabaseTuitionBatchRepository } from '@repo/core/adapters/supabase/tuitionBatchRepository';
import { supabaseClient } from '@repo/core/adapters/supabaseClient';
import { useScopedNotifications } from '@repo/core/hooks';
import { showToast } from '@repo/core/lib/feedback';
import {
  isLocalOnlyIdentity,
  resolveWorkspaceSwitcherTargets,
  useAuth,
  usePermissions,
  usePerspectiveSwitch,
} from '@repo/core/logic';
import { useActiveSubTabsStore } from '@repo/core/store/useActiveSubTabsStore';
import { useAuthStore } from '@repo/core/store/useAuthStore';
import { useUIStore } from '@repo/core/store/useUIStore';
import { BreathGuide } from '@repo/self/wellbeing';
import { ActiveSubTabStrip, DomainSubHeader } from '@repo/ui';
import ErrorBoundary, { RouteErrorBoundary } from '@repo/ui/components/ErrorBoundary';
import { AppHeader, Text as WText, useFloorPresence } from '@repo/ui/components/native';
import { PerspectiveSwitcherSheet } from '@repo/ui/components/PerspectiveSwitcherSheet';
import { SchoolInviteCodeModal } from '@repo/ui/components/SchoolInviteCodeModal';
import { Bell, Heart, Library, School, Settings, User, Users, X } from '@repo/ui/icons/native';
import { Box, Modal, ModalContent, Pressable } from '@repo/ui/primitives';
import { useWorld } from '@repo/ui/theme/native';
import { tokens } from '@repo/ui/tokens';
import { router, useGlobalSearchParams, usePathname } from 'expo-router';
import { Tabs } from 'expo-router/js-tabs';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSnapshotRefresh } from '@/boot/useSnapshotRefresh';
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
  const { refreshProfile } = useAuth();
  useSnapshotRefresh();
  const isLocalGuest = isLocalOnlyIdentity(user);
  const { unreadCount } = useScopedNotifications(isLocalGuest ? null : userId);

  const displayName = user?.display_name?.split(' ')[0] || user?.email || 'Gurudevi';
  const isBreathingOpen = useUIStore((state) => state.isBreathingOpen);
  const setBreathingOpen = useUIStore((state) => state.setBreathingOpen);

  // Multi-Perspective State
  const {
    availablePerspectives,
    activePerspective,
    switchPerspective,
    hydratePerspectivesFromDatabase,
  } = usePerspectiveSwitch();
  const [isPerspectiveSwitcherOpen, setPerspectiveSwitcherOpen] = useState(false);
  const [catalogSheetTab, setCatalogSheetTab] = useState<
    'workspace' | 'self' | 'library' | 'community' | 'profile' | null
  >(null);
  const [isInviteCodeModalOpen, setInviteCodeModalOpen] = useState(false);

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
        hasMountedGuardianWorkspace: false,
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
          identity: supabaseIdentityAdapter,
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

  const currentDomain = useMemo<'workspace' | 'self' | 'library' | 'community' | 'profile'>(() => {
    if (pathname.startsWith('/workspace')) return 'workspace';
    if (pathname.startsWith('/library')) return 'library';
    if (pathname.startsWith('/community')) return 'community';
    if (pathname.startsWith('/profile')) return 'profile';
    return 'self';
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
  // A room's home shows the whole floor; inside a room it shows only behind the header.
  useFloorPresence(isDomainRoot ? 'full' : 'band');

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

  // The shell's own header actions, as data: the kit draws them with the world's
  // press, light and spoken counts. The bell goes to the notifications page.
  const globalHeaderActions = [
    {
      key: 'settings',
      label: 'Open settings',
      icon: Settings,
      onPress: () => router.push('/settings'),
    },
  ];

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
          <AppHeader
            title={isWorkspace ? perspectiveLabel : title}
            eyebrow={shell.header.subtitleVisible && !isWorkspace ? displayName : undefined}
            actions={globalHeaderActions}
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
        <AppHeader
          title={isWorkspace ? perspectiveLabel : title}
          eyebrow={shell.header.subtitleVisible && !isWorkspace ? displayName : undefined}
          perspective={
            isWorkspace
              ? { label: perspectiveLabel, onPress: () => setPerspectiveSwitcherOpen(true) }
              : undefined
          }
          actions={[
            {
              key: 'notifications',
              label: 'Open notifications',
              icon: Bell,
              onPress: () => router.push('/notifications'),
              badge: unreadCount || undefined,
            },
            ...globalHeaderActions,
          ]}
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
    <View style={{ flex: 1 }}>
      {shellChoice.variant === 'native' ? (
        nativeTabs
      ) : (
        <Tabs
          screenOptions={{
            headerShown: !autoHideChromeOnScroll || isChromeVisible,
            tabBarHideOnKeyboard: true,
            // The selected tab is the lit thing, at text strength (as in NativeShellTabs).
            tabBarActiveTintColor: wt.lampDeep,
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
            // Screens are see-through: the one floor under the app shows behind them.
            sceneStyle: { backgroundColor: 'transparent' },
          }}
        >
          <Tabs.Screen
            name="library"
            listeners={{ tabPress: () => markTabPress('library') }}
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
            listeners={{ tabPress: () => markTabPress('community') }}
            options={{
              title: 'Community',
              tabBarIcon: ({ color, size }) => <Users color={color} size={size} />,
            }}
          />
          <Tabs.Screen
            name="profile"
            listeners={{ tabPress: () => markTabPress('profile') }}
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

      <TabFeatureCatalogSheet
        isOpen={catalogSheetTab === 'self' || catalogSheetTab === 'workspace'}
        onClose={() => setCatalogSheetTab(null)}
        activeTabKey={catalogSheetTab === 'self' ? 'self' : 'workspace'}
      />

      <PerspectiveSwitcherSheet
        isOpen={isPerspectiveSwitcherOpen}
        onClose={() => setPerspectiveSwitcherOpen(false)}
        targets={workspaceTargets}
        onSelectTarget={handleSelectWorkspaceTarget}
        onLinkSchoolBond={() => {
          setPerspectiveSwitcherOpen(false);
          setInviteCodeModalOpen(true);
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
    </View>
  );
}
