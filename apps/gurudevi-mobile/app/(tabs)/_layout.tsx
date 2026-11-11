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
import { ActiveSubTabStrip } from '@repo/ui';
import ErrorBoundary, { RouteErrorBoundary } from '@repo/ui/components/ErrorBoundary';
import {
  Sheet,
  Text as WText,
  useFloorPresence,
  WorldHeader,
  WorldPicker,
  YouSheet,
} from '@repo/ui/components/native';
import { useFidelityOptional, useThemeContextOptional } from '@repo/ui/context';
import { type KitIconProps, shellLayoutOf, worldName } from '@repo/ui/theme';
import { PerspectiveSwitcherSheet } from '@repo/ui/components/PerspectiveSwitcherSheet';
import { SchoolInviteCodeModal } from '@repo/ui/components/SchoolInviteCodeModal';
import {
  Bell,
  ChevronLeft,
  Compass,
  Heart,
  LifeBuoy,
  Library,
  School,
  Sparkles,
  User,
  Users,
  Wind,
  X,
} from '@repo/ui/icons/native';
import { Box, Modal, ModalContent, Pressable } from '@repo/ui/primitives';
import { useWorld } from '@repo/ui/theme/native';
import { tokens } from '@repo/ui/tokens';
import { router, useGlobalSearchParams, usePathname } from 'expo-router';
import { Tabs } from 'expo-router/js-tabs';
import { type ComponentType, useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSnapshotRefresh } from '@/boot/useSnapshotRefresh';
import { NativeShellTabs } from '@/components/navigation/NativeShellTabs';
import { AssistantSheet } from '@/components/shell/AssistantSheet';
import { RoomFab } from '@/components/shell/RoomFab';
import { type CommonActions, ROOM_NAMES } from '@/components/shell/roomActions';
import { ShellTabBar } from '@/components/shell/ShellTabBar';
import { TabFeatureCatalogSheet } from '@/components/navigation/TabFeatureCatalogSheet';
import { getNavigationTitle } from '@/lib/navigation/appNavigation';
import { useShellVariant } from '@/lib/navigation/shellVariant';
import { useShellProbe } from '@/lib/navigation/useShellProbe';
import { getNativeShellConfig } from '@/lib/responsiveShell';
import { PowerSyncProvider } from '@/providers/PowerSyncProvider';

const EMPTY_DOMAIN_TABS: readonly string[] = [];

/** The rooms' signs, drawn by the world's rooms bar. */
const TAB_ICONS = {
  library: Library,
  workspace: School,
  self: Heart,
  community: Users,
  profile: User,
} as unknown as Readonly<Record<string, ComponentType<KitIconProps>>>;

function greetingFor(hour: number): string {
  if (hour < 5) return 'Good night';
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

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
  const setChromeVisible = useActiveSubTabsStore((s) => s.setChromeVisible);
  // A new screen always arrives with its chrome; only reading tucks it away.
  useEffect(() => {
    setChromeVisible(true);
  }, [pathname, setChromeVisible]);
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

  // The shell's shape, chosen by the person in "You"; the rooms move to a rail on wide screens.
  const headerLayout = useActiveSubTabsStore((s) => s.preferences.headerLayout) ?? 'greeting';
  const tabBarChoice = useActiveSubTabsStore((s) => s.preferences.tabBarLayout) ?? 'auto';
  const assistantChoice = useActiveSubTabsStore((s) => s.preferences.assistantButton) ?? 'tutii';
  const updatePreferences = useActiveSubTabsStore((s) => s.updatePreferences);
  const layout = useMemo(() => shellLayoutOf(width, tabBarChoice), [width, tabBarChoice]);
  const chromeShown = !autoHideChromeOnScroll || isChromeVisible;

  const [youOpen, setYouOpen] = useState(false);
  const [worldOpen, setWorldOpen] = useState(false);
  const [assistant, setAssistant] = useState<{ open: boolean; guide: boolean }>({
    open: false,
    guide: false,
  });
  const { worldId, setWorld } = useThemeContextOptional();
  const { fidelityLevel, setFidelityLevel } = useFidelityOptional();

  const goBack = useCallback(() => {
    if (currentDomain === 'self') router.push('/self' as any);
    else if (currentDomain === 'workspace') router.push('/workspace' as any);
    else router.back();
  }, [currentDomain]);

  const subTabs =
    showActiveSubTabs && (!isDomainRoot || domainTabs.length > 0) ? (
      <ActiveSubTabStrip domain={currentDomain} onReturnToOverview={returnToDomainOverview} />
    ) : null;

  const renderHeader = () => {
    // The oldest choice, kept: no header at all, only the task strip under the status bar.
    if (headerStyle === 'minimal_tabs_only') {
      return <View style={{ paddingTop: insets.top }}>{subTabs}</View>;
    }
    return (
      <WorldHeader
        // Reading down shrinks the header to one quiet line; reading up brings it back.
        layout={chromeShown ? headerLayout : 'compact'}
        posture={isDomainRoot ? 'home' : 'inside'}
        room={ROOM_NAMES[currentDomain]}
        title={title}
        greeting={`${greetingFor(new Date().getHours())}, ${displayName}`}
        person={{ name: user?.display_name || displayName, src: user?.avatar_url ?? undefined }}
        onYou={() => setYouOpen(true)}
        onBack={goBack}
        icons={{ back: ChevronLeft as ComponentType<KitIconProps> }}
        notifications={{
          count: unreadCount,
          label: 'Notifications',
          icon: Bell as ComponentType<KitIconProps>,
          onPress: () => router.push('/notifications'),
        }}
        assistant={{
          label: assistantChoice === 'tutii' ? 'Tutii, help and guide' : 'Assistant',
          icon: (assistantChoice === 'tutii' ? LifeBuoy : Sparkles) as ComponentType<KitIconProps>,
          onPress: () => setAssistant({ open: true, guide: false }),
        }}
        perspective={
          isWorkspace
            ? {
                label: perspectiveLabel,
                switchLabel: 'Switch perspective',
                onPress: () => setPerspectiveSwitcherOpen(true),
              }
            : undefined
        }
        below={chromeShown ? subTabs : null}
      />
    );
  };

  const fabCommon = useMemo<CommonActions>(
    () => ({
      breathe: {
        label: 'Breathing reset',
        icon: Wind as ComponentType<KitIconProps>,
        onPress: () => setBreathingOpen(true),
      },
      ask: {
        label: assistantChoice === 'tutii' ? 'Ask Tutii' : 'Ask the assistant',
        icon: Sparkles as ComponentType<KitIconProps>,
        onPress: () => setAssistant({ open: true, guide: false }),
      },
      more:
        currentDomain === 'self' || currentDomain === 'workspace'
          ? {
              label: `Everything in ${ROOM_NAMES[currentDomain]}`,
              icon: Compass as ComponentType<KitIconProps>,
              onPress: () => setCatalogSheetTab(currentDomain),
            }
          : undefined,
    }),
    [assistantChoice, currentDomain, setBreathingOpen],
  );

  // Space the floating action keeps above the rooms bar.
  const fabBottom =
    layout.tabs === 'rail'
      ? insets.bottom + 20
      : layout.tabs === 'floating'
        ? Math.max(insets.bottom, 8) + 6 + 64 + 16
        : Math.max(insets.bottom, 6) + 62 + 16;

  const nativeTabs = (
    <NativeShellTabs
      header={renderHeader()}
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
          tabBar={(props) => (
            <ShellTabBar
              {...props}
              layout={layout.tabs}
              icons={TAB_ICONS}
              labels={ROOM_NAMES}
              holds={{ self: true, workspace: true }}
              signals={{ community: unreadCount > 0 }}
              hidden={!chromeShown}
            />
          )}
          screenOptions={{
            headerShown: true,
            tabBarHideOnKeyboard: true,
            tabBarPosition: layout.tabs === 'rail' ? 'left' : 'bottom',
            header: renderHeader,
            // Screens are see-through: the one floor under the app shows behind them.
            sceneStyle: { backgroundColor: 'transparent' },
          }}
        >
          <Tabs.Screen
            name="library"
            listeners={{ tabPress: () => markTabPress('library') }}
            options={{ title: 'Library' }}
          />
          <Tabs.Screen
            name="workspace"
            listeners={{
              tabPress: () => markTabPress('workspace'),
              tabLongPress: () => setCatalogSheetTab('workspace'),
            }}
            options={{ title: 'Workspace' }}
          />
          <Tabs.Screen
            name="self"
            listeners={{
              tabPress: () => markTabPress('self'),
              tabLongPress: () => setCatalogSheetTab('self'),
            }}
            options={{ title: 'Self' }}
          />
          <Tabs.Screen
            name="community"
            listeners={{ tabPress: () => markTabPress('community') }}
            options={{ title: 'Community' }}
          />
          <Tabs.Screen
            name="profile"
            listeners={{ tabPress: () => markTabPress('profile') }}
            options={{ title: 'Profile' }}
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

      <RoomFab
        room={currentDomain}
        pathname={pathname}
        atHome={isDomainRoot}
        bottom={fabBottom}
        right={Math.max(insets.right, 0) + 20}
        common={fabCommon}
        hidden={!chromeShown}
      />

      <YouSheet
        open={youOpen}
        onClose={() => setYouOpen(false)}
        person={{
          name: user?.display_name || displayName,
          src: user?.avatar_url ?? undefined,
          detail: isLocalGuest ? 'On this phone only' : (user?.email ?? undefined),
        }}
        perspective={{ label: perspectiveLabel, onPress: () => setPerspectiveSwitcherOpen(true) }}
        world={{ name: worldName(worldId), onPress: () => setWorldOpen(true) }}
        visualDetail={{ value: fidelityLevel, onChange: (v) => void setFidelityLevel(v) }}
        reading={{ onPress: () => router.push('/reading') }}
        companions={{ onPress: () => router.push('/companions') }}
        showcase={{ onPress: () => router.push('/world-showcase') }}
        shell={{
          headerLayout,
          onHeaderLayout: (v) => updatePreferences({ headerLayout: v }),
          tabBarLayout: tabBarChoice,
          onTabBarLayout: (v) => updatePreferences({ tabBarLayout: v }),
          tabBarNote:
            layout.tabs === 'rail' ? 'On this wide screen the rooms sit in a rail' : undefined,
          assistant: assistantChoice,
          onAssistant: (v) => updatePreferences({ assistantButton: v }),
        }}
        onProfile={() => router.push('/profile')}
        onGuide={() => setAssistant({ open: true, guide: true })}
        onHelp={() => setAssistant({ open: true, guide: false })}
        onSettings={() => router.push('/settings')}
      />

      <Sheet open={worldOpen} onClose={() => setWorldOpen(false)} title="Your world">
        <ScrollView style={{ flexShrink: 1 }}>
          <WorldPicker
            label="Your world"
            value={worldId}
            onChange={(id) => {
              setWorldOpen(false);
              void setWorld(id);
            }}
          />
        </ScrollView>
      </Sheet>

      <AssistantSheet
        open={assistant.open}
        startOnGuide={assistant.guide}
        onClose={() => setAssistant({ open: false, guide: false })}
        room={currentDomain}
        mode={assistantChoice}
        onAsk={() => router.push('/a-i-assistant' as any)}
      />

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
