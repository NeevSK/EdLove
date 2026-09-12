import { createSupabaseGuardianRepository } from '@repo/core/adapters/supabase/guardianRepository';
import { createSupabaseSchoolInviteRepository } from '@repo/core/adapters/supabase/schoolInviteRepository';
import { createSupabaseTuitionBatchRepository } from '@repo/core/adapters/supabase/tuitionBatchRepository';
import { supabaseClient } from '@repo/core/adapters/supabaseClient';
import { useNotifications, useRewards } from '@repo/core/hooks';
import {
  resolveWorkspaceSwitcherTargets,
  usePermissions,
  usePerspectiveSwitch,
  useStore,
} from '@repo/core/logic';
import { BreathGuide } from '@repo/self/wellbeing';
import AchievementUnlockOverlay from '@repo/ui/components/AchievementUnlockOverlay';
import { CommercialBatchModal } from '@repo/ui/components/CommercialBatchModal';
import ErrorBoundary, { RouteErrorBoundary } from '@repo/ui/components/ErrorBoundary';
import GlobalHeader from '@repo/ui/components/GlobalHeader';
import { ActiveSubTabStrip, DomainSubHeader } from '@repo/ui';
import { useActiveSubTabsStore } from '@repo/core/store/useActiveSubTabsStore';
import { TabFeatureCatalogSheet } from '@/components/navigation/TabFeatureCatalogSheet';
import { LinkWardModal } from '@repo/ui/components/LinkWardModal';
import { PerspectiveSwitcherSheet } from '@repo/ui/components/PerspectiveSwitcherSheet';
import { SchoolInviteCodeModal } from '@repo/ui/components/SchoolInviteCodeModal';
import { Bell, FileText, Heart, Library, School, Settings, User, Users, X } from '@repo/ui/icons';
import { Box, Modal, ModalContent, Pressable, Text } from '@repo/ui/primitives';
import { tokens } from '@repo/ui/tokens';
import { router, Tabs, useGlobalSearchParams, usePathname } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getNavigationTitle } from '@/lib/navigation/appNavigation';
import { getNativeShellConfig } from '@/lib/responsiveShell';
import { PowerSyncProvider } from '@/providers/PowerSyncProvider';

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
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const shell = useMemo(
    () => getNativeShellConfig(width, height, insets.bottom),
    [height, insets.bottom, width],
  );
  const { context, can } = usePermissions();
  const userId = context.userId;
  const { newAchievements } = useRewards();
  const { unreadCount } = useNotifications(userId);
  const user = useStore((state) => state.user);
  const displayName = user?.display_name?.split(' ')[0] || user?.email || 'Gurudevi';
  const [showCelebration, setShowCelebration] = useState(false);
  const [currentAchievement, setCurrentAchievement] = useState('');
  const previousAchievementsRef = useRef<string[]>([]);
  const isBreathingOpen = useStore((state) => state.isBreathingOpen ?? false);
  const setBreathingOpen = useStore((state) => state.setBreathingOpen ?? (() => {}));

  // Multi-Perspective State
  const {
    availablePerspectives,
    activePerspective,
    switchPerspective,
    addPerspective,
    hydratePerspectivesFromDatabase,
  } = usePerspectiveSwitch();
  const [isPerspectiveSwitcherOpen, setPerspectiveSwitcherOpen] = useState(false);
  const [catalogSheetTab, setCatalogSheetTab] = useState<'workspace' | 'self' | 'library' | 'community' | 'profile' | null>(null);
  const [isInviteCodeModalOpen, setInviteCodeModalOpen] = useState(false);
  const [isCommercialModalOpen, setCommercialModalOpen] = useState(false);
  const [isLinkWardModalOpen, setLinkWardModalOpen] = useState(false);

  // Auto-reconcile perspective entities from Postgres / PowerSync SQLite on boot
  useEffect(() => {
    if (!user?.id) return;

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
  }, [hydratePerspectivesFromDatabase, user?.id]);

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
    [switchPerspective],
  );

  const handleRedeemInviteCode = useCallback(
    async (payload: {
      code: string;
      schoolId: string;
      schoolName: string;
      capacity: 'teacher' | 'student' | 'principal' | 'admin';
      roles: Array<'teacher' | 'student' | 'principal' | 'admin'>;
    }) => {
      const newId = `bond_${payload.schoolId}_${Date.now().toString(36)}`;
      const newPerspective = {
        id: newId,
        kind: 'institutional' as const,
        displayName: `${payload.schoolName} (${payload.capacity.toUpperCase()})`,
        schoolId: payload.schoolId,
        schoolName: payload.schoolName,
        capacity: payload.capacity,
        roles: payload.roles,
      };

      addPerspective(newPerspective);
      setInviteCodeModalOpen(false);
      switchPerspective(newId);

      // Async DB persistence
      if (user?.id) {
        try {
          const repo = createSupabaseSchoolInviteRepository(supabaseClient);
          await repo.verifyAndRedeemInviteCode(payload.code, user.id);
        } catch (err) {
          console.warn('[handleRedeemInviteCode] DB sync notice:', err);
        }
      }
    },
    [addPerspective, switchPerspective, user?.id],
  );

  const handleCreateCommercialBatch = useCallback(
    async (batch: any) => {
      addPerspective(batch);
      setCommercialModalOpen(false);
      switchPerspective(batch.id);
      router.push(`/workspace/commercial/${batch.id}` as any);

      // Async DB persistence
      if (user?.id) {
        try {
          const repo = createSupabaseTuitionBatchRepository(supabaseClient);
          await repo.createBatch(user.id, {
            instituteId: batch.instituteId === 'independent' ? undefined : batch.instituteId,
            subjectName: batch.subjectName,
            gradeLevel: batch.grade,
            medium: batch.medium,
            schedule: batch.batchName,
            customAlias: batch.customAlias,
            role: batch.role,
          });
        } catch (err) {
          console.warn('[handleCreateCommercialBatch] DB sync notice:', err);
        }
      }
    },
    [addPerspective, switchPerspective, user?.id],
  );

  const handleLinkWard = useCallback(
    async (wardPerspective: any) => {
      addPerspective(wardPerspective);
      setLinkWardModalOpen(false);
      switchPerspective(wardPerspective.id);

      // Async DB persistence
      if (user?.id) {
        try {
          const repo = createSupabaseGuardianRepository(supabaseClient);
          await repo.linkGuardianToStudent(
            user.id,
            wardPerspective.wardUserId,
            wardPerspective.relationship || 'parent',
            wardPerspective.schoolId,
          );
        } catch (err) {
          console.warn('[handleLinkWard] DB sync notice:', err);
        }
      }
    },
    [addPerspective, switchPerspective, user?.id],
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

  const domainTabs = useActiveSubTabsStore((s) => s.tabsByDomain[currentDomain] || []);
  const showActiveSubTabs = useActiveSubTabsStore((s) => s.preferences.showActiveSubTabs);
  const headerStyle = useActiveSubTabsStore((s) => s.preferences.headerStyle);
  const autoHideChromeOnScroll = useActiveSubTabsStore((s) => s.preferences.autoHideChromeOnScroll);
  const isChromeVisible = useActiveSubTabsStore((s) => s.isChromeVisible);

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
            backgroundColor: tokens.semantic.surface.interactive,
          }}
        >
          <FileText size={18} color={tokens.semantic.text.primary} />
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
          backgroundColor: tokens.semantic.surface.interactive,
        }}
      >
        <Bell size={18} color={tokens.semantic.text.primary} />
        {unreadCount > 0 ? (
          <Box
            style={{
              position: 'absolute',
              top: 7,
              right: 8,
              minWidth: 16,
              height: 16,
              borderRadius: 8,
              backgroundColor: tokens.colors.primary,
              paddingHorizontal: 4,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text
              style={{
                color: tokens.semantic.text.inverse,
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
          backgroundColor: tokens.semantic.surface.interactive,
        }}
      >
        <Settings size={18} color={tokens.semantic.text.primary} />
      </Pressable>
    </Box>
  );

  return (
    <>
      <Tabs
        initialRouteName="self"
        screenOptions={{
          headerShown: !autoHideChromeOnScroll || isChromeVisible,
          tabBarHideOnKeyboard: true,
          tabBarShowLabel: shell.visibleChrome.tabLabels,
          tabBarStyle: {
            minHeight: shell.tabBar.minHeight,
            paddingTop: shell.tabBar.paddingTop,
            paddingBottom: shell.tabBar.paddingBottom,
            backgroundColor: tokens.semantic.surface.canvas,
            borderTopColor: tokens.semantic.border.subtle,
            display: !autoHideChromeOnScroll || isChromeVisible ? 'flex' : 'none',
          },
          tabBarLabelStyle: {
            fontSize: tokens.typography.sizes.xs,
            fontWeight: '600',
          },
          header: () => {
            if (headerStyle === 'minimal_tabs_only') {
              return (
                <Box>
                  {showActiveSubTabs && (
                    <ActiveSubTabStrip
                      domain={currentDomain}
                      onAddTabPress={() => setCatalogSheetTab(currentDomain)}
                    />
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
                    <ActiveSubTabStrip
                      domain={currentDomain}
                      onAddTabPress={() => setCatalogSheetTab(currentDomain)}
                    />
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
                    <ActiveSubTabStrip
                      domain={currentDomain}
                      onAddTabPress={() => setCatalogSheetTab(currentDomain)}
                    />
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
                    <ActiveSubTabStrip
                      domain={currentDomain}
                      onAddTabPress={() => setCatalogSheetTab(currentDomain)}
                    />
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
                  <ActiveSubTabStrip
                    domain={currentDomain}
                    onAddTabPress={() => setCatalogSheetTab(currentDomain)}
                  />
                )}
              </Box>
            );
          },
        }}
      >
        <Tabs.Screen
          name="library"
          listeners={{ tabLongPress: () => setCatalogSheetTab("library") }}
          options={{
            title: 'Library',
            tabBarIcon: ({ color, size }) => <Library color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="workspace"
          listeners={{ tabLongPress: () => setCatalogSheetTab("workspace") }}
          options={{
            title: 'Workspace',
            tabBarIcon: ({ color, size }) => <School color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="self"
          listeners={{ tabLongPress: () => setCatalogSheetTab("self") }}
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
                  backgroundColor: focused ? tokens.semantic.surface.interactive : 'transparent',
                }}
              >
                <Heart
                  color={focused ? tokens.colors.primary : color}
                  size={size + 2}
                  strokeWidth={focused ? 2.4 : 2}
                  fill={focused ? tokens.colors.primary : 'transparent'}
                />
              </Box>
            ),
          }}
        />
        <Tabs.Screen
          name="community"
          listeners={{ tabLongPress: () => setCatalogSheetTab("community") }}
          options={{
            title: 'Community',
            tabBarIcon: ({ color, size }) => <Users color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          listeners={{ tabLongPress: () => setCatalogSheetTab("profile") }}
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
        <ModalContent className="bg-phase-canvas">
          <Box
            style={{
              paddingTop: shell.modal.contentPadding,
              paddingBottom: tokens.spacing.md,
              paddingHorizontal: shell.modal.contentPadding,
              borderBottomWidth: 1,
              borderBottomColor: tokens.semantic.border.subtle,
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
                <Text
                  style={{
                    color: tokens.semantic.text.primary,
                    fontSize: tokens.typography.sizes.lg,
                    fontWeight: '700',
                  }}
                >
                  Breathing Reset
                </Text>
                <Text
                  style={{
                    color: tokens.semantic.text.secondary,
                    fontSize: tokens.typography.sizes.xs,
                  }}
                >
                  1 minute of peace
                </Text>
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
                  backgroundColor: tokens.semantic.surface.interactive,
                }}
              >
                <X size={18} color={tokens.semantic.text.primary} />
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
