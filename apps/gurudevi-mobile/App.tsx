import "react-native-url-polyfill/auto";
import "./src/i18n/config"; // Initialize i18n
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Lazy load Admin screens to break circularity and improve startup
const AdminAuditLog = React.lazy(
	() => import("@repo/admin/screens/AdminAuditLog"),
);
const AdminAuthorityRepair = React.lazy(
	() => import("@repo/admin/screens/AdminAuthorityRepair"),
);
const AdminDashboard = React.lazy(
	() => import("@repo/admin/screens/AdminDashboard"),
);
const AdminIncidentQueue = React.lazy(
	() => import("@repo/admin/screens/AdminIncidentQueue"),
);
const AdminJobControl = React.lazy(
	() => import("@repo/admin/screens/AdminJobControl"),
);
const AdminReleaseControl = React.lazy(
	() => import("@repo/admin/screens/AdminReleaseControl"),
);
const AdminTenantDetail = React.lazy(
	() => import("@repo/admin/screens/AdminTenantDetail"),
);

import {
	identifyUser,
	initPostHog,
	posthogAnalytics as initTracker,
	trackEvent,
} from "@repo/analytics";
import { authAPI, identityAPI } from "@repo/core/api";
import type { SchoolType } from "@repo/core/constants";
import { coreRuntime, useStore } from "@repo/core/logic";
import {
	clearSentryUser,
	initSentry,
	injectPostHog,
	setSentryUser,
} from "@repo/core/monitoring";
import { nativeRuntimeEnvironment, supabase } from "@repo/core/native";
import { SyncManager } from "@repo/core/sync";
import { APIError, type AuthorityTier } from "@repo/core/types";
import { useQRDeepLink } from "@repo/scanner-kit";
import ErrorBoundary from "@repo/ui/components/ErrorBoundary";
import NetworkStatusBanner from "@repo/ui/components/NetworkStatusBanner";
import { SanctuaryGlobalStyles } from "@repo/ui/components/SanctuaryGlobalStyles";
import SanctuaryToast from "@repo/ui/components/SanctuaryToast";
import { EnvironmentProvider, ExternalLinkProvider } from "@repo/ui/context";
import { FABProvider } from "@repo/ui/context/FABContext";
import { GluestackUIProvider } from "@repo/ui/gluestack";
import { Box, Center, Spinner } from "@repo/ui/primitives";
import { ToastProvider } from "@repo/ui/providers";
import { sanctuarySaffron } from "@repo/ui/theme";

import type { Session } from "@supabase/supabase-js";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as Font from "expo-font";
import * as Linking from "expo-linking";
import React, { Suspense, useEffect, useState } from "react";
import { Platform } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import CommandPalette from "./src/components/web/CommandPalette";
import { PWAInstallBanner } from "./src/components/web/PWAInstallBanner";
import { fontAssets } from "./src/constants/Fonts";
import { navigationRef } from "./src/navigation/navigationRef";
// Import screens and navigation
import TabNavigator from "./src/navigation/TabNavigator";

// Import screens and navigation from the local authoritative index
// Lazy load app-level screens from direct paths (No Barrel Exports)
const AIAssistantScreen = React.lazy(() =>
	import("@repo/ai").then((m) => ({ default: m.AIAssistantScreen })),
);
const AppSettingsScreen = React.lazy(
	() => import("@repo/ui/screens/AppSettingsScreen"),
);
const AuthScreen = React.lazy(() => import("./src/screens/AuthScreen"));
const InvitationWelcomeScreen = React.lazy(() =>
	import("@repo/community").then((m) => ({
		default: m.InvitationWelcomeScreen,
	})),
);
const NotificationsScreen = React.lazy(
	() => import("@repo/ui/screens/NotificationsScreen"),
);
const OnboardingScreen = React.lazy(
	() => import("@repo/ui/screens/OnboardingScreen"),
);
const QRHandlerScreen = React.lazy(() =>
	import("@repo/scanner-kit").then((m) => ({ default: m.QRHandlerScreen })),
);
const ThuthimalClaimScreen = React.lazy(() =>
	import("@repo/profile").then((m) => ({ default: m.ThuthimalClaimScreen })),
);
const WelcomeScreen = React.lazy(
	() => import("@repo/ui/screens/WelcomeScreen"),
);

import { LanguageUtils } from "./src/utils/LanguageUtils";
import { updateWebPageTitle } from "./src/utils/useWebPageTitle";

// Lazy load PublicFormScreen as it's web-only and large
const PublicFormScreen = React.lazy(() =>
	import("@repo/form-builder").then((module) => ({
		default: module.PublicFormScreenWeb,
	})),
);

import {
	dispatchQueuedMutationToInngest,
	installMobileWorkflowEventBridge,
} from "./src/lib/inngestEvents";

// Create a client
const queryClient = new QueryClient();

installMobileWorkflowEventBridge();

// Root Stack for Modals
const RootStack = createNativeStackNavigator();

/**
 * UserProfile - Interface for raw database user rows from Supabase.
 */
interface UserProfile {
	id: string;
	role: string | null;
	school_id: string | null;
	onboarding_completed: boolean;
	full_name: string | null;
	email: string | null;
	avatar_url: string | null;
	is_anonymous: boolean;
	profile_completed: boolean;
}

// Module-level so AppContent can call it without prop-drilling.
const fetchAndSetUserProfile = async (
	internalUserId: string,
	onComplete?: () => void,
) => {
	try {
		const { data, error } = await supabase
			.from("users")
			.select(
				"id, role, school_id, onboarding_completed, full_name, email, avatar_url, is_anonymous, profile_completed",
			)
			.eq("id", internalUserId)
			.maybeSingle();

		const userProfile = data as UserProfile | null;

		if (error) {
			console.warn("⚠️ Profile: Table fetch returned error:", error.message);
			if (onComplete) onComplete();
			return;
		}

		if (userProfile) {
			const store = useStore.getState();
			const normalizedRole = (
				userProfile.role === "guest" ? null : userProfile.role
			) as AuthorityTier | null;

			if (normalizedRole || !store.onboardingCompleted) {
				store.setUser({ ...userProfile, role: normalizedRole } as any);
				store.setUserRole(normalizedRole);
			}

			const isEffectivelyOnboarded =
				!!userProfile.onboarding_completed && !!normalizedRole;

			if (isEffectivelyOnboarded) {
				if (!store.onboardingCompleted) {
					store.setOnboardingCompleted(true);
				}
			}

			if (!isEffectivelyOnboarded && navigationRef.isReady()) {
				const rootState = navigationRef.current?.getRootState();
				const currentRoute = rootState?.routes?.[rootState?.index ?? -1]?.name;
				if (currentRoute === "Welcome") {
					navigationRef.navigate("Onboarding" as never);
				}
			}

			if (userProfile.school_id) {
				const { data: schoolData } = await supabase
					.from("schools")
					.select("type")
					.eq("id", userProfile.school_id)
					.single();

				if (schoolData) {
					store.setSchoolType(schoolData.type as SchoolType | null);
				}
			} else {
				store.setSchoolType(null);
			}
		}
	} catch (error) {
		console.warn("❌ Profile: Fetching encountered an error:", error);
	} finally {
		if (onComplete) onComplete();
	}
};

function App() {
	const [session, setSession] = useState<Session | null>(null);
	const [loading, setLoading] = useState(true);
	const [isProfileLoading, setIsProfileLoading] = useState(false);
	const [fontsLoaded, setFontsLoaded] = useState(false);
	const [currentTab, setCurrentTab] = useState<
		"self" | "classroom" | "community" | "library" | "profile"
	>("self");
	const onboardingCompleted = useStore((state) => state.onboardingCompleted);
	const currentUser = useStore((state) => state.user);
	const [showWelcome, setShowWelcome] = useState(true);
	const toast = useStore((state) => state.toast);
	const hideToast = useStore((state) => state.hideToast);

	useEffect(() => {
		// Inject the native tracker into the Core bridge to maintain "Core Purity"
		injectPostHog(initTracker);

		// Inject Platform-Specific Runtime Adapters (Sovereign Core Purity)
		coreRuntime.register(nativeRuntimeEnvironment);

		initSentry();
		initPostHog(process.env.EXPO_PUBLIC_POSTHOG_API_KEY!, {
			host: process.env.EXPO_PUBLIC_POSTHOG_HOST || "https://eu.i.posthog.com",
		}).then(() => {
			trackEvent("app_initialized", { platform: Platform.OS });
		});
	}, []);

	useEffect(() => {
		LanguageUtils.init();
	}, []);

	useEffect(() => {
		if (!currentUser?.id) {
			clearSentryUser();
			return;
		}

		setSentryUser({
			id: currentUser.id,
			email: currentUser.email ?? undefined,
			username: currentUser.full_name ?? undefined,
		});

		identifyUser(currentUser.id, {
			email: currentUser.email ?? undefined,
			full_name: currentUser.full_name ?? undefined,
			role: currentUser.authority ?? undefined,
			school_id: currentUser.school_id ?? undefined,
		});
	}, [
		currentUser?.id,
		currentUser?.email,
		currentUser?.full_name,
		currentUser?.authority,
		currentUser?.school_id,
	]);

	useEffect(() => {
		async function loadFonts() {
			try {
				await Font.loadAsync(fontAssets);
				setFontsLoaded(true);
			} catch (_error) {
				setFontsLoaded(true);
			}
		}
		loadFonts();
	}, []);

	useEffect(() => {
		const checkSession = async () => {
			try {
				const session = await authAPI.getAuthSession();
				setSession(session);
				useStore.getState().setAuthSession(session);
				if (session) {
					setShowWelcome(false);
					if (session.user) {
						setIsProfileLoading(true);
						identityAPI
							.getMyInternalId()
							.then((internalId) => {
								if (internalId) {
									fetchAndSetUserProfile(internalId, () =>
										setIsProfileLoading(false),
									);
								} else {
									setIsProfileLoading(false);
								}
							})
							.catch(() => {
								setIsProfileLoading(false);
							});
					}
				}
			} catch (error) {
				if (error instanceof APIError) {
					if (
						error.message?.includes("Refresh Token") ||
						(error as any).status === 400
					) {
						await supabase.auth.signOut({ scope: "local" });
						setSession(null);
						useStore.getState().setAuthSession(null);
					}
				}
			} finally {
				setLoading(false);
				useStore.getState().setAuthSessionResolved(true);
			}
		};

		checkSession();

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange(async (event, session) => {
			setSession(session);
			useStore.getState().setAuthSession(session);
			useStore.getState().setAuthSessionResolved(true);

			if (session?.user) {
				setIsProfileLoading(true);
				identityAPI
					.getMyInternalId()
					.then((internalId) => {
						if (internalId) {
							fetchAndSetUserProfile(internalId, () =>
								setIsProfileLoading(false),
							);
						} else {
							setIsProfileLoading(false);
						}
					})
					.catch(() => {
						setIsProfileLoading(false);
					});
			} else if (event === "SIGNED_OUT") {
				setIsProfileLoading(false);
				identityAPI.clearCache();
				const store = useStore.getState();
				store.setUser(null);
				store.setUserRole(null);
				store.setSchoolType(null);
				store.setOnboardingCompleted(false);
			}
		});

		return () => subscription.unsubscribe();
	}, []);

	useEffect(() => {
		if (Platform.OS === "web") return;

		const handleDeepLink = async (url: string) => {
			if (url.includes("auth/callback")) {
				const getParam = (name: string) => {
					const match = url.match(new RegExp(`[#?&]${name}=([^&]*)`));
					return match ? match[1] : null;
				};

				const access_token = getParam("access_token");
				const refresh_token = getParam("refresh_token");

				if (access_token && refresh_token) {
					const { error } = await supabase.auth.setSession({
						access_token,
						refresh_token,
					});
					if (
						error &&
						(error.message?.includes("Refresh Token") ||
							(error as any).status === 400)
					) {
						await supabase.auth.signOut({ scope: "local" });
					}
				}
			}
		};

		const subscription = Linking.addEventListener("url", (event) =>
			handleDeepLink(event.url),
		);
		Linking.getInitialURL().then((url) => {
			if (url) handleDeepLink(url);
		});
		return () => subscription.remove();
	}, []);

	useQRDeepLink((payload: unknown) => {
		if (navigationRef.isReady() && session) {
			navigationRef.navigate("QRHandler", { payload });
		}
	});

	if (loading || !fontsLoaded) {
		return (
			<SafeAreaProvider>
				<GluestackUIProvider>
					<Center className="flex-1 bg-obsidian">
						<Spinner size="large" color={sanctuarySaffron} />
					</Center>
				</GluestackUIProvider>
			</SafeAreaProvider>
		);
	}

	const isNewUser = !onboardingCompleted;
	const needsWelcome = showWelcome && isNewUser;

	return (
		<ErrorBoundary name="Absolute Root">
			<QueryClientProvider client={queryClient}>
				<EnvironmentProvider>
					<GluestackUIProvider>
						<SanctuaryGlobalStyles />
						<FABProvider>
							<Box className="flex-1">
								<AppContent
									currentTab={currentTab}
									setCurrentTab={setCurrentTab}
									session={session}
									needsWelcome={needsWelcome}
									onboardingCompleted={onboardingCompleted}
									isProfileLoading={isProfileLoading}
									showWelcome={showWelcome}
									setShowWelcome={setShowWelcome}
									toast={toast}
									hideToast={hideToast}
								/>
							</Box>
						</FABProvider>
					</GluestackUIProvider>
				</EnvironmentProvider>
			</QueryClientProvider>
		</ErrorBoundary>
	);
}

function OnboardingWrapper({ session }: { session: Session | null }) {
	const storeUser = useStore((state) => state.user);
	return (
		<OnboardingScreen
			isAnonymous={
				storeUser?.is_anonymous === true ||
				session?.user?.is_anonymous === true ||
				!session?.user?.email
			}
			onComplete={(name: string, role: AuthorityTier | null) => {
				const store = useStore.getState();
				if (name) store.setTeacherName(name);
				if (role) store.setUserRole(role);
				store.setOnboardingCompleted(true);
				identityAPI.getMyInternalId().then((internalId) => {
					if (internalId) fetchAndSetUserProfile(internalId);
				});
			}}
		/>
	);
}

function AppContent({
	currentTab,
	setCurrentTab,
	session,
	needsWelcome,
	onboardingCompleted,
	isProfileLoading,
	showWelcome,
	setShowWelcome,
	toast,
	hideToast,
}: {
	currentTab: string;
	setCurrentTab: (tab: any) => void;
	session: Session | null;
	needsWelcome: boolean;
	onboardingCompleted: boolean;
	isProfileLoading: boolean;
	showWelcome: boolean;
	setShowWelcome: (show: boolean) => void;
	toast: {
		message: string;
		type: "success" | "error" | "info";
		duration?: number;
	} | null;
	hideToast: () => void;
}) {
	const handleTabChange = React.useCallback(
		(tab: string) => {
			setCurrentTab(tab as any);
		},
		[setCurrentTab],
	);

	useEffect(() => {
		if (Platform.OS === "web" && navigationRef.isReady()) {
			const state = navigationRef.current?.getRootState();
			const currentRoute = state?.routes?.[state?.index ?? -1]?.name;
			const allowedRoutes = [
				"Welcome",
				"Onboarding",
				"Auth",
				"QRHandler",
				"InvitationWelcome",
				"PublicForm",
			];
			const hasValidSession = !!session;

			if (
				!hasValidSession &&
				!onboardingCompleted &&
				!allowedRoutes.includes(currentRoute || "")
			) {
				navigationRef.current?.reset({
					index: 0,
					routes: [{ name: "Welcome" }],
				});
			}
		}
	}, [onboardingCompleted, session]);

	useEffect(() => {
		if (isProfileLoading) return;
		if (!session || onboardingCompleted || !navigationRef.isReady()) return;
		const rootState = navigationRef.current?.getRootState();
		const currentRoute = rootState?.routes?.[rootState?.index ?? -1]?.name;
		if (currentRoute === "Welcome") {
			navigationRef.navigate("Onboarding" as never);
		}
	}, [session, onboardingCompleted, isProfileLoading]);

	return (
		<SafeAreaProvider>
			<ToastProvider>
				<ExternalLinkProvider>
					<ErrorBoundary name="App Root">
						<NavigationContainer
							ref={navigationRef}
							onReady={() => {
								if (navigationRef.isReady()) {
									updateWebPageTitle(navigationRef.current?.getRootState());
								}
							}}
							onStateChange={(state) => {
								updateWebPageTitle(state);
							}}
							linking={{
								prefixes: [
									"gurudevi://",
									"https://platform.gurudevi.edlove.org",
									"http://localhost:4000",
								],
								config: {
									screens: {
										Welcome: "",
										Onboarding: "onboarding",
										Auth: "auth",
										AIAssistant: "ai",
										QRHandler: "qr",
										ThuthimalClaim: "thuthimal",
										InvitationWelcome: "invite",
										AdminDashboard: "admin",
										AdminIncidentQueue: "admin/incidents",
										AdminTenantDetail: "admin/tenants",
										AdminAuthorityRepair: "admin/authority",
										AdminJobControl: "admin/actions",
										AdminAuditLog: "admin/audit",
										AdminReleaseControl: "admin/release",
										Main: {
											path: "app",
											screens: {
												Self: "self",
												Profile: "profile",
												Classroom: "classroom",
												Community: "community",
												Library: "library",
												NotificationsPanel: "notifications",
												SettingsPanel: "settings",
											},
										},
										PublicForm: "f/:slug",
									},
								},
							}}
						>
							<RootStack.Navigator
								id="RootStack"
								screenOptions={{ headerShown: false }}
								initialRouteName={onboardingCompleted ? "Main" : "Welcome"}
							>
								{!onboardingCompleted ? (
									<>
										<RootStack.Screen name="Welcome">
											{() => (
												<ErrorBoundary name="Welcome Screen">
													<Suspense
														fallback={
															<Center className="flex-1 bg-obsidian">
																<Spinner color={sanctuarySaffron} />
															</Center>
														}
													>
														<WelcomeScreen
															onLogin={() =>
																navigationRef.isReady() &&
																navigationRef.navigate("Auth" as never)
															}
															onGuest={() =>
																navigationRef.isReady() &&
																navigationRef.navigate("Onboarding" as never)
															}
														/>
													</Suspense>
												</ErrorBoundary>
											)}
										</RootStack.Screen>
										<RootStack.Screen
											name="Auth"
											options={{ presentation: "card" }}
										>
											{(props: any) => (
												<Suspense
													fallback={
														<Center className="flex-1 bg-obsidian">
															<Spinner color={sanctuarySaffron} />
														</Center>
													}
												>
													<AuthScreen
														onSuccess={() => {
															identityAPI.getMyInternalId().then((id) => {
																if (id) fetchAndSetUserProfile(id);
															});
															if (navigationRef.isReady())
																navigationRef.navigate("Onboarding" as never);
														}}
														onBack={() => props.navigation.goBack()}
													/>
												</Suspense>
											)}
										</RootStack.Screen>
										<RootStack.Screen name="Onboarding">
											{() => (
												<ErrorBoundary name="Onboarding Screen">
													<Suspense
														fallback={
															<Center className="flex-1 bg-obsidian">
																<Spinner color={sanctuarySaffron} />
															</Center>
														}
													>
														<OnboardingWrapper session={session} />
													</Suspense>
												</ErrorBoundary>
											)}
										</RootStack.Screen>
										<RootStack.Screen
											name="InvitationWelcome"
											options={{ presentation: "modal" }}
										>
											{() => (
												<Suspense
													fallback={
														<Center className="flex-1 bg-obsidian">
															<Spinner color={sanctuarySaffron} />
														</Center>
													}
												>
													<InvitationWelcomeScreen />
												</Suspense>
											)}
										</RootStack.Screen>
										<RootStack.Screen
											name="PublicForm"
											options={{ headerShown: false }}
										>
											{() => (
												<Suspense
													fallback={
														<Center className="flex-1">
															<Spinner />
														</Center>
													}
												>
													<PublicFormScreen />
												</Suspense>
											)}
										</RootStack.Screen>
									</>
								) : (
									<>
										<RootStack.Screen name="Main">
											{() => (
												<ErrorBoundary name="Main Tabs">
													<TabNavigator onTabChange={handleTabChange} />
												</ErrorBoundary>
											)}
										</RootStack.Screen>
										<RootStack.Screen name="AdminDashboard">
											{() => (
												<Suspense
													fallback={
														<Center className="flex-1 bg-obsidian">
															<Spinner />
														</Center>
													}
												>
													<AdminDashboard />
												</Suspense>
											)}
										</RootStack.Screen>
										<RootStack.Screen name="AdminIncidentQueue">
											{() => (
												<Suspense
													fallback={
														<Center className="flex-1 bg-obsidian">
															<Spinner />
														</Center>
													}
												>
													<AdminIncidentQueue />
												</Suspense>
											)}
										</RootStack.Screen>
										<RootStack.Screen name="AdminTenantDetail">
											{() => (
												<Suspense
													fallback={
														<Center className="flex-1 bg-obsidian">
															<Spinner />
														</Center>
													}
												>
													<AdminTenantDetail />
												</Suspense>
											)}
										</RootStack.Screen>
										<RootStack.Screen name="AdminAuthorityRepair">
											{() => (
												<Suspense
													fallback={
														<Center className="flex-1 bg-obsidian">
															<Spinner />
														</Center>
													}
												>
													<AdminAuthorityRepair />
												</Suspense>
											)}
										</RootStack.Screen>
										<RootStack.Screen name="AdminJobControl">
											{() => (
												<Suspense
													fallback={
														<Center className="flex-1 bg-obsidian">
															<Spinner />
														</Center>
													}
												>
													<AdminJobControl />
												</Suspense>
											)}
										</RootStack.Screen>
										<RootStack.Screen name="AdminAuditLog">
											{() => (
												<Suspense
													fallback={
														<Center className="flex-1 bg-obsidian">
															<Spinner />
														</Center>
													}
												>
													<AdminAuditLog />
												</Suspense>
											)}
										</RootStack.Screen>
										<RootStack.Screen name="AdminReleaseControl">
											{() => (
												<Suspense
													fallback={
														<Center className="flex-1 bg-obsidian">
															<Spinner />
														</Center>
													}
												>
													<AdminReleaseControl />
												</Suspense>
											)}
										</RootStack.Screen>
										<RootStack.Screen
											name="AIAssistant"
											options={{ presentation: "modal" }}
										>
											{() => (
												<Suspense
													fallback={
														<Center className="flex-1 bg-obsidian">
															<Spinner />
														</Center>
													}
												>
													<AIAssistantScreen />
												</Suspense>
											)}
										</RootStack.Screen>
										<RootStack.Screen
											name="Auth"
											options={{ presentation: "modal" }}
										>
											{(props: any) => (
												<Suspense
													fallback={
														<Center className="flex-1 bg-obsidian">
															<Spinner />
														</Center>
													}
												>
													<AuthScreen
														onSuccess={() => {
															identityAPI.getMyInternalId().then((id) => {
																if (id) fetchAndSetUserProfile(id);
															});
															props.navigation.goBack();
														}}
														onBack={() => props.navigation.goBack()}
													/>
												</Suspense>
											)}
										</RootStack.Screen>
										<RootStack.Screen
											name="QRHandler"
											options={{ presentation: "modal" }}
										>
											{() => (
												<Suspense
													fallback={
														<Center className="flex-1 bg-obsidian">
															<Spinner />
														</Center>
													}
												>
													<QRHandlerScreen />
												</Suspense>
											)}
										</RootStack.Screen>
										<RootStack.Screen
											name="AppSettings"
											options={{ presentation: "modal" }}
										>
											{() => (
												<Suspense
													fallback={
														<Center className="flex-1 bg-obsidian">
															<Spinner />
														</Center>
													}
												>
													<AppSettingsScreen />
												</Suspense>
											)}
										</RootStack.Screen>
										<RootStack.Screen
											name="Notifications"
											options={{ presentation: "modal" }}
										>
											{() => (
												<Suspense
													fallback={
														<Center className="flex-1 bg-obsidian">
															<Spinner />
														</Center>
													}
												>
													<NotificationsScreen />
												</Suspense>
											)}
										</RootStack.Screen>
										<RootStack.Screen
											name="ThuthimalClaim"
											options={{ presentation: "modal" }}
										>
											{() => (
												<Suspense
													fallback={
														<Center className="flex-1 bg-obsidian">
															<Spinner />
														</Center>
													}
												>
													<ThuthimalClaimScreen />
												</Suspense>
											)}
										</RootStack.Screen>
										<RootStack.Screen
											name="InvitationWelcome"
											options={{ presentation: "modal" }}
										>
											{() => (
												<Suspense
													fallback={
														<Center className="flex-1 bg-obsidian">
															<Spinner />
														</Center>
													}
												>
													<InvitationWelcomeScreen />
												</Suspense>
											)}
										</RootStack.Screen>
										<RootStack.Screen
											name="PublicForm"
											options={{ headerShown: false }}
										>
											{() => (
												<Suspense
													fallback={
														<Center className="flex-1">
															<Spinner />
														</Center>
													}
												>
													<PublicFormScreen />
												</Suspense>
											)}
										</RootStack.Screen>
									</>
								)}
							</RootStack.Navigator>
						</NavigationContainer>
						<SyncManager
							dispatchQueuedMutation={dispatchQueuedMutationToInngest}
						/>
						<NetworkStatusBanner />
						{Platform.OS === "web" && <CommandPalette />}
						{Platform.OS === "web" && <PWAInstallBanner />}
						{toast && (
							<SanctuaryToast
								visible={!!toast}
								message={toast.message}
								type={toast.type}
								duration={toast.duration}
								onHide={hideToast}
							/>
						)}
					</ErrorBoundary>
				</ExternalLinkProvider>
			</ToastProvider>
		</SafeAreaProvider>
	);
}

export default App;
