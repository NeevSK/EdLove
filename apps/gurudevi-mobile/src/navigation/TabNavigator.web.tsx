import React from "react";
import { View, Platform } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { ErrorBoundary, AchievementUnlockOverlay, useTheme, UniversalModal, Box, VStack, HStack, Text, hapticLight, Theme } from "@repo/ui";
import { BreathGuide } from "@repo/self";
import { useUserRole, useRewards, useNotifications, useStore } from "@repo/core";
import {
  User,
  School,
  Heart,
  Users,
  Library,
  Bell,
  ChevronLeft,
  Menu,
  Settings,
  X,
} from "lucide-react-native";
import { StackFallback } from "../components/web/WebScreenShimmer";

// ── Preload helper ──────────────────────────────────────────────────────────
// Kicks off the dynamic import for each chunk immediately after the main
// bundle executes (i.e. before the user taps any tab).  Uses
// requestIdleCallback so it doesn't compete with first-paint work.
// The promises are thrown away — React.lazy() caches the result internally
// once the import resolves, so Suspense renders instantly on first navigation.
const schedulePreload = (importFn: () => Promise<unknown>) => {
  if (typeof requestIdleCallback !== 'undefined') {
    requestIdleCallback(() => { importFn().catch(() => {}); }, { timeout: 2000 });
  } else {
    setTimeout(() => { importFn().catch(() => {}); }, 500);
  }
};

// Screens / stacks
// Tab stacks — lazy loaded (major code split boundary)
const ClassroomStackNavigatorWeb = React.lazy(
  () => import("./ClassroomStackNavigator.web"),
);
schedulePreload(() => import("./ClassroomStackNavigator.web"));

const ProfileStackNavigatorWeb = React.lazy(
  () => import("./ProfileStackNavigator.web"),
);
schedulePreload(() => import("./ProfileStackNavigator.web"));

const CommunityStackNavigatorWeb = React.lazy(
  () => import("./CommunityStackNavigator.web"),
);
schedulePreload(() => import("./CommunityStackNavigator.web"));

const SelfStackNavigatorWeb = React.lazy(
  () => import("./SelfStackNavigator.web"),
);
schedulePreload(() => import("./SelfStackNavigator.web"));

const LibraryStackNavigatorWeb = React.lazy(
  () => import("./LibraryStackNavigator.web"),
);
schedulePreload(() => import("./LibraryStackNavigator.web"));

// In-shell panel screens — lazy loaded (rendered as Tab.Screen for URL-native navigation)
const NotificationsScreenWeb = React.lazy(
  () => import("../screens/NotificationsScreen.web"),
);
schedulePreload(() => import("../screens/NotificationsScreen.web"));

const AppSettingsScreenWeb = React.lazy(
  () => import("../screens/AppSettingsScreen.web"),
);
schedulePreload(() => import("../screens/AppSettingsScreen.web"));

// ── Tab navigator ────────────────────────────────────────────────────────────

const Tab = createBottomTabNavigator();

// ─── NAV HELPERS ──────────────────────────────────────────────────────────

const TAB_CONFIG = [
  {
    name: "Self",
    icon: Heart,
    labelKey: "tabs.self",
    mobileLabelKey: "tabs.self",
  },
  {
    name: "Community",
    icon: Users,
    labelKey: "tabs.community",
    mobileLabelKey: "tabs.community",
  },
  {
    name: "Classroom",
    icon: School,
    labelKey: "tabs.classroom",
    mobileLabelKey: "tabs.classroom",
  },
  {
    name: "Library",
    icon: Library,
    labelKey: "tabs.library",
    mobileLabelKey: "tabs.library",
  },
  {
    name: "Profile",
    icon: User,
    labelKey: "tabs.profile",
    mobileLabelKey: "tabs.profile",
  },
];

// ─── MAIN NAVIGATOR (Overlay Architecture) ─────────────────────────────────

/** Reusable notification badge dot for Bell icons */
function NotificationBadge({ count, size = 'md' }: { count: number; size?: 'sm' | 'md' }) {
  if (count <= 0) return null;
  const dim = size === 'sm' ? { minW: '14px', h: '14px', fs: '8px', top: '-3px', right: '-5px' } : { minW: '16px', h: '16px', fs: '9px', top: '-4px', right: '-6px' };
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: dim.minW, height: dim.h, padding: '0 4px', fontSize: dim.fs, fontWeight: '800', background: 'var(--lotus)', color: 'white', borderRadius: '8px', position: 'absolute', top: dim.top, right: dim.right }}>
      {count > 99 ? '99+' : String(count)}
    </div>
  );
}

export default function TabNavigator({
  onTabChange,
}: {
  onTabChange?: (tab: string) => void;
}) {
  const { t } = useTranslation();
  const { role, userId } = useUserRole();
  const { isDark } = useTheme();
  const { newAchievements } = useRewards();
  const { unreadCount } = useNotifications(userId);
  const navigation = useNavigation();

  const [isSidebarExpanded, setIsSidebarExpanded] = React.useState(true);
  // Mobile/tablet: < 1024px (aligns with CSS @media max-width: 1023px)
  const [isMobileView, setIsMobileView] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState("Self");
  const [showCelebration, setShowCelebration] = React.useState(false);
  const [currentAchievement, setCurrentAchievement] = React.useState("");
  const { isBreathingOpen, setBreathingOpen } = useStore();

  // Ref to the sidebar element — used for focus trap
  const sidebarRef = React.useRef<HTMLElement>(null);
  // Last focused element before sidebar opened — returned on close
  const preSidebarFocusRef = React.useRef<HTMLElement | null>(null);

  // Define closeSidebar before the useEffects that reference it
  const closeSidebar = React.useCallback(() => setIsSidebarExpanded(false), []);

  // Responsive design: mobile/tablet < 1024px
  React.useEffect(() => {
    const checkScreenSize = () => {
      const isCompact = window.innerWidth < 1024;
      setIsMobileView(isCompact);
      if (isCompact) setIsSidebarExpanded(false);
    };
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  React.useEffect(() => {
    if (newAchievements.length > 0) {
      setCurrentAchievement(newAchievements[0]);
      setShowCelebration(true);
    }
  }, [newAchievements]);

  // ── FOCUS TRAP: mobile sidebar ──────────────────────────────────────────
  // When the overlay sidebar opens, move keyboard focus inside and prevent
  // Tab from escaping to page content behind the backdrop.
  React.useEffect(() => {
    if (!isMobileView || !isSidebarExpanded) return;

    // Save the element that was focused before we opened the sidebar
    preSidebarFocusRef.current = document.activeElement as HTMLElement;

    // Move focus to the first focusable element inside the sidebar
    const sidebar = sidebarRef.current;
    if (!sidebar) return;
    const focusable = sidebar.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), textarea, select, [tabindex]:not([tabindex="-1"])',
    );
    if (focusable.length > 0) focusable[0].focus();

    // Tab key handler — cycle inside the sidebar only
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeSidebar();
        return;
      }
      if (e.key !== "Tab") return;
      const items = Array.from(
        sidebar.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), textarea, select, [tabindex]:not([tabindex="-1"])',
        ),
      );
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      // Restore focus to the element that was active before the sidebar opened
      preSidebarFocusRef.current?.focus();
    };
  }, [isMobileView, isSidebarExpanded, closeSidebar]);

  // ── DOCUMENT TITLE: update on tab change ───────────────────────────────
  React.useEffect(() => {
    const base = t("webNav.brandName");
    if (activeTab === "NotificationsPanel") {
      document.title = `${t("webNav.notifications")} — ${base}`;
    } else if (activeTab === "SettingsPanel") {
      document.title = `${t("webNav.settings")} — ${base}`;
    } else {
      document.title = activeTab ? `${activeTab} — ${base}` : base;
    }
  }, [activeTab, t]);

  const getClassroomLabel = () => {
    if (role === "principal") return t("tabs.mySchool");
    if (role === "founder") return t("tabs.school");
    if (role === "section_head") return t("tabs.section");
    if (role === "grade_head") return t("tabs.grade");
    return t("tabs.classroom");
  };

  const getLabel = (route: string, labelKey: string) => {
    if (route === "Classroom") return getClassroomLabel();
    return t(labelKey);
  };

  const getMobileLabel = (route: string) => {
    if (route === "Classroom") {
      if (role === "principal") return t("tabs.school");
      if (role === "founder") return t("tabs.platform");
      return t("tabs.class");
    }
    return t(TAB_CONFIG.find((c) => c.name === route)?.mobileLabelKey ?? route);
  };

  return (
    <div className="vellum-app-shell">
      <div className="world-bg" />

      {/* ── TOP BAR ── */}
      <header className="top-bar">
        <div
          className="top-bar-left"
          style={{
            paddingLeft: 24,
            display: "flex",
            alignItems: "center",
            gap: "16px",
          }}
        >
          {isMobileView && (
            <button
              className="mobile-menu-toggle"
              onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
              aria-label={t("webNav.toggleNavigation")}
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: "var(--ink)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Menu size={24} />
            </button>
          )}
          <span className="brand-lotus">🪷</span>
          <span className="brand-name">{t("webNav.brandName")}</span>
        </div>
        <div className="top-bar-right" />
      </header>

      <div className="shell-body-core">
        {/* ── MOBILE SIDEBAR OVERLAY ── */}
        {isMobileView && isSidebarExpanded && (
          <div
            className="sidebar-overlay visible"
            onClick={closeSidebar}
            aria-hidden="true"
          />
        )}

        {/* ── SIDEBAR ── */}
        <aside
          ref={sidebarRef}
          className={`sidebar ${isSidebarExpanded ? "open expanded" : "collapsed"}`}
          aria-hidden={isMobileView && !isSidebarExpanded}
          style={{
            zIndex: isMobileView ? 1000 : 10,
            position: isMobileView ? "fixed" : "relative",
            height: isMobileView ? "100%" : "auto",
            top: isMobileView ? 0 : undefined,
            left: isMobileView ? 0 : undefined,
            width: isMobileView
              ? "280px"
              : isSidebarExpanded
                ? "240px"
                : "60px",
            boxShadow:
              isMobileView && isSidebarExpanded
                ? "4px 0 40px rgba(107,100,128,0.2)"
                : "none",
          }}
        >
          <div className="sidebar-header" style={{ 
            display: "flex", 
            justifyContent: isSidebarExpanded ? 'space-between' : 'center', 
            alignItems: 'center', 
            padding: isSidebarExpanded ? '0 16px' : '0',
            height: '60px'
          }}>
            {(isSidebarExpanded || isMobileView) && (
              <span
                className="sidebar-group-label"
                style={{ marginLeft: "0", fontSize: '11px', fontWeight: '700', letterSpacing: '0.05em', opacity: 0.6 }}
              >
                {t("webNav.menu") || "MENU"}
              </span>
            )}
            <button
              className="sidebar-toggle"
              onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
              aria-label={
                isSidebarExpanded ? "Collapse sidebar" : "Expand sidebar"
              }
              style={{ 
                margin: isSidebarExpanded ? '0' : 'auto',
                padding: '8px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {isSidebarExpanded ? (
                <ChevronLeft size={16} />
              ) : (
                <Menu size={16} />
              )}
            </button>
          </div>

          <nav className="sidebar-nav" aria-label="Main navigation">
            {TAB_CONFIG.map((conf) => {
              const isActive = activeTab === conf.name;
              const Icon = conf.icon;
              return (
                <button
                  key={conf.name}
                  className={`sidebar-item ${isActive ? "active" : ""}`}
                  onClick={() => {
                    (navigation.navigate as any)("Main", { screen: conf.name });
                    if (isMobileView) closeSidebar();
                  }}
                  title={getLabel(conf.name, conf.labelKey)}
                  aria-current={isActive ? "page" : undefined}
                  style={{ justifyContent: isSidebarExpanded ? 'flex-start' : 'center', paddingLeft: isSidebarExpanded ? '16px' : '0' }}
                >
                  <Icon
                    size={20}
                    color={isActive ? "var(--water)" : "var(--ink-ghost)"}
                  />
                  {(isSidebarExpanded || isMobileView) && (
                    <span className="sidebar-label">
                      {getLabel(conf.name, conf.labelKey)}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="sidebar-footer">
            <div className="sidebar-divider" />
            <button
              className={`sidebar-item ${activeTab === "NotificationsPanel" ? "active" : ""}`}
              title={t("common.notifications")}
              onClick={() => {
                (navigation.navigate as any)("Main", {
                  screen: activeTab === "NotificationsPanel" ? "Self" : "NotificationsPanel",
                });
                if (isMobileView) closeSidebar();
              }}
              style={{ justifyContent: isSidebarExpanded ? 'flex-start' : 'center', paddingLeft: isSidebarExpanded ? '16px' : '0' }}
            >
              <div style={{ position: "relative" }}>
                <Bell
                  size={20}
                  color={
                    activeTab === "NotificationsPanel"
                      ? "var(--water)"
                      : "var(--ink-ghost)"
                  }
                />
                <div className="bell-dot" style={unreadCount > 0 ? { display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '16px', height: '16px', padding: '0 4px', fontSize: '9px', fontWeight: '800', background: 'var(--lotus)', color: 'white', borderRadius: '8px', top: '-4px', right: '-6px' } : {}}>
                  {unreadCount > 0 ? (unreadCount > 99 ? '99+' : String(unreadCount)) : ''}
                </div>
              </div>
              {(isSidebarExpanded || isMobileView) && (
                <span className="sidebar-label">Notifications</span>
              )}
            </button>

            <button
              className={`sidebar-profile-btn ${activeTab === "SettingsPanel" ? "active" : ""}`}
              title={t("common.settings")}
              onClick={() => {
                (navigation.navigate as any)("Main", {
                  screen: activeTab === "SettingsPanel" ? "Self" : "SettingsPanel",
                });
                if (isMobileView) closeSidebar();
              }}
              style={{ justifyContent: isSidebarExpanded ? 'flex-start' : 'center', paddingLeft: isSidebarExpanded ? '16px' : '0' }}
            >
              <div style={{ width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Settings size={20} color="var(--ink-ghost)" />
              </div>
              {(isSidebarExpanded || isMobileView) && (
                <div className="profile-info" style={{ marginLeft: '12px' }}>
                  <span className="profile-nm" style={{ fontSize: '13px', fontWeight: '600', color: 'var(--ink)' }}>
                    {role?.split("_").join(" ") || "Guest"}
                  </span>
                  <span className="profile-status" style={{ fontSize: '11px', opacity: 0.6 }}>
                    {t("common.settings")}
                  </span>
                </div>
              )}
            </button>
          </div>
        </aside>

        {/* ── MAIN CONTENT CANVAS ── */}
        <main className="main-content-canvas">
            <Tab.Navigator
              id="MainTabs"
              initialRouteName="Self"
              tabBar={() => null}
              // @ts-ignore
              sceneContainerStyle={{
                backgroundColor: "transparent",
                minHeight: "100%",
                overflow: "visible",
              }}
              screenListeners={{
                state: (e) => {
                  const s = (e.data as any)?.state;
                  if (!s || s.index === undefined) return;
                  const routeName = s.routes[s.index]?.name;
                  if (routeName) {
                    setActiveTab(routeName);
                    // Only report main tabs to parent (not panel screens)
                    const mainTabs = ["Self", "Community", "Classroom", "Library", "Profile"];
                    if (mainTabs.includes(routeName)) {
                      onTabChange?.(routeName.toLowerCase());
                    }
                  }
                },
              }}
              screenOptions={{ headerShown: false }}
            >
              <Tab.Screen name="Self">
                {() => (
                  <ErrorBoundary name="Self">
                    <React.Suspense
                      fallback={<StackFallback />}
                    >
                      <SelfStackNavigatorWeb />
                    </React.Suspense>
                  </ErrorBoundary>
                )}
              </Tab.Screen>
              <Tab.Screen name="Community">
                {() => (
                  <ErrorBoundary name="Community">
                    <React.Suspense
                      fallback={<StackFallback />}
                    >
                      <CommunityStackNavigatorWeb />
                    </React.Suspense>
                  </ErrorBoundary>
                )}
              </Tab.Screen>
              <Tab.Screen name="Classroom">
                {() => (
                  <ErrorBoundary name="Classroom">
                    <React.Suspense
                      fallback={<StackFallback />}
                    >
                      <ClassroomStackNavigatorWeb />
                    </React.Suspense>
                  </ErrorBoundary>
                )}
              </Tab.Screen>
              <Tab.Screen name="Library">
                {() => (
                  <ErrorBoundary name="Library">
                    <React.Suspense
                      fallback={<StackFallback />}
                    >
                      <LibraryStackNavigatorWeb />
                    </React.Suspense>
                  </ErrorBoundary>
                )}
              </Tab.Screen>
              <Tab.Screen name="Profile">
                {() => (
                  <ErrorBoundary name="Profile">
                    <React.Suspense
                      fallback={<StackFallback />}
                    >
                      <ProfileStackNavigatorWeb />
                    </React.Suspense>
                  </ErrorBoundary>
                )}
              </Tab.Screen>
              {/* Panel screens — rendered within shell, URL-native via React Navigation */}
              <Tab.Screen name="NotificationsPanel">
                {() => (
                  <ErrorBoundary name="Notifications">
                    <React.Suspense
                      fallback={<StackFallback />}
                    >
                      <NotificationsScreenWeb />
                    </React.Suspense>
                  </ErrorBoundary>
                )}
              </Tab.Screen>
              <Tab.Screen name="SettingsPanel">
                {() => (
                  <ErrorBoundary name="Settings">
                    <React.Suspense
                      fallback={<StackFallback />}
                    >
                      <AppSettingsScreenWeb />
                    </React.Suspense>
                  </ErrorBoundary>
                )}
              </Tab.Screen>
            </Tab.Navigator>
        </main>
      </div>

      {/* ── MOBILE BOTTOM NAV (< 1024px) ── */}
      {/* Always visible on mobile — even in notifications/settings subviews so
                users always have a path back. Tab buttons return to 'none' subview
                first; Alerts button toggles notifications. */}
      {isMobileView && !isSidebarExpanded && (
        <nav
          className="mobile-bottom-nav"
          aria-label={t("webNav.tabNavigation")}
        >
          {TAB_CONFIG.map((conf) => {
            const isActive = activeTab === conf.name;
            const Icon = conf.icon;
            return (
              <button
                key={conf.name}
                className={`mobile-nav-item ${isActive ? "active" : ""}`}
                onClick={() => {
                  (navigation.navigate as any)("Main", { screen: conf.name });
                }}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon
                  size={22}
                  color={isActive ? "var(--water)" : "var(--ink-ghost)"}
                />
                <span className="mobile-nav-label">
                  {getMobileLabel(conf.name)}
                </span>
              </button>
            );
          })}
          <button
            className={`mobile-nav-item ${activeTab === "NotificationsPanel" ? "active" : ""}`}
            onClick={() =>
              (navigation.navigate as any)("Main", {
                screen: activeTab === "NotificationsPanel" ? "Self" : "NotificationsPanel",
              })
            }
            aria-current={activeTab === "NotificationsPanel" ? "page" : undefined}
          >
            <div style={{ position: "relative" }}>
              <Bell
                size={22}
                color={
                  activeTab === "NotificationsPanel"
                    ? "var(--water)"
                    : "var(--ink-ghost)"
                }
              />
              <div className="bell-dot" style={unreadCount > 0 ? { display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '14px', height: '14px', padding: '0 3px', fontSize: '8px', fontWeight: '800', background: 'var(--lotus)', color: 'white', borderRadius: '7px', top: '-3px', right: '-5px' } : {}}>
                {unreadCount > 0 ? (unreadCount > 99 ? '99+' : String(unreadCount)) : ''}
              </div>
            </div>
            <span className="mobile-nav-label">{t("webNav.alerts")}</span>
          </button>
        </nav>
      )}

      <AchievementUnlockOverlay
        title={currentAchievement}
        visible={showCelebration}
        onHide={() => setShowCelebration(false)}
      />


      <UniversalModal
        isOpen={isBreathingOpen}
        onClose={() => setBreathingOpen(false)}
      >
        <Box sx={{ 
          backgroundColor: 'var(--background)',
          borderRadius: '$xl' as any,
          padding: Theme.spacing.xl, 
          alignItems: 'center',
          maxWidth: 600,
          width: '90%'
        }}>
          <HStack justifyContent="space-between" alignItems="center" sx={{ width: '100%', marginBottom: Theme.spacing.md }}>
            <Text color="var(--ink)" sx={{ fontSize: '$lg' as any, fontWeight: '700' }}>
              {t('self.breathingReset') || 'Breathing Reset'}
            </Text>
            <button 
              onClick={() => setBreathingOpen(false)}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--ink-ghost)' }}
            >
              <X size={24} />
            </button>
          </HStack>
          <BreathGuide onComplete={() => setBreathingOpen(false)} />
        </Box>
      </UniversalModal>
    </div>
  );
}
