
$path = "C:\Users\Naween\projects\polymath-platform\apps\gurudevi-mobile\App.tsx"
$content = Get-Content $path -Raw

# 1. Insert wrappers after handleTabChange
$wrappers = @"
	const handleTabChange = React.useCallback(
		(tab: string) => {
			setCurrentTab(tab as any);
		},
		[setCurrentTab],
	);

	const WelcomeWrapper = React.useMemo(() => () => (
		<ErrorBoundary name="Welcome Screen">
			<Suspense fallback={<Center className="flex-1 bg-obsidian"><Spinner color={sanctuarySaffron} /></Center>}>
				<WelcomeScreen
					onLogin={() => navigationRef.isReady() && navigationRef.navigate("Auth" as never)}
					onGuest={() => navigationRef.isReady() && navigationRef.navigate("Onboarding" as never)}
				/>
			</Suspense>
		</ErrorBoundary>
	), []);

	const AuthWrapper = React.useMemo(() => (props: any) => (
		<Suspense fallback={<Center className="flex-1 bg-obsidian"><Spinner color={sanctuarySaffron} /></Center>}>
			<AuthScreen
				onSuccess={() => navigationRef.isReady() && navigationRef.navigate("Onboarding" as never)}
				onBack={() => props.navigation.goBack()}
			/>
		</Suspense>
	), []);

	const OnboardingWrapperComponent = React.useMemo(() => () => (
		<ErrorBoundary name="Onboarding Screen">
			<Suspense fallback={<Center className="flex-1 bg-obsidian"><Spinner color={sanctuarySaffron} /></Center>}>
				<OnboardingWrapper />
			</Suspense>
		</ErrorBoundary>
	), []);

	const MainWrapper = React.useMemo(() => () => (
		<ErrorBoundary name="Main Tabs">
			<TabNavigator onTabChange={handleTabChange} />
		</ErrorBoundary>
	), [handleTabChange]);

	const AdminDashboardWrapper = React.useMemo(() => () => (
		<Suspense fallback={<Center className="flex-1 bg-obsidian"><Spinner /></Center>}>
			<AdminDashboard />
		</Suspense>
	), []);

	const InvitationWrapper = React.useMemo(() => () => (
		<Suspense fallback={<Center className="flex-1 bg-obsidian"><Spinner color={sanctuarySaffron} /></Center>}>
			<InvitationWelcomeScreen />
		</Suspense>
	), []);

	const PublicFormWrapper = React.useMemo(() => () => (
		<Suspense fallback={<Center className="flex-1"><Spinner /></Center>}>
			<PublicFormScreen />
		</Suspense>
	), []);
"@

# Note: We need to escape special characters for regex or just use simple replace if possible
# But handleTabChange has a lot of lines. Let's use a simpler marker.

$oldTabChange = @"
	const handleTabChange = React.useCallback\(
		\(tab: string\) => {
			setCurrentTab\(tab as any\);
		},
		\[setCurrentTab\],
	\);
"@

# Since I can't easily regex multi-line with tabs, I'll just replace the whole Navigator block with a simplified one.

$navigatorRegex = @"
							<RootStack.Navigator[\s\S]+?</RootStack.Navigator>
"@

$newNavigator = @"
							<RootStack.Navigator
								id="RootStack"
								screenOptions={{ headerShown: false }}
								initialRouteName={onboardingCompleted ? "Main" : "Welcome"}
							>
								{!onboardingCompleted ? (
									<>
										<RootStack.Screen name="Welcome" component={WelcomeWrapper} />
										<RootStack.Screen
											name="Auth"
											options={{ presentation: "card" }}
											component={AuthWrapper}
										/>
										<RootStack.Screen
											name="Onboarding"
											component={OnboardingWrapperComponent}
										/>
										<RootStack.Screen
											name="InvitationWelcome"
											options={{ presentation: "modal" }}
											component={InvitationWrapper}
										/>
										<RootStack.Screen
											name="PublicForm"
											options={{ headerShown: false }}
											component={PublicFormWrapper}
										/>
									</>
								) : (
									<>
										<RootStack.Screen name="Main" component={MainWrapper} />
										<RootStack.Screen
											name="AdminDashboard"
											component={AdminDashboardWrapper}
										/>
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
										<RootStack.Screen name="AIAssistant">
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
										<RootStack.Screen name="QRHandler">
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
										<RootStack.Screen name="ThuthimalClaim">
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
									</>
								)}
							</RootStack.Navigator>
"@

# Apply changes
$content = $content -replace [regex]::Escape($oldTabChange.Replace("\t", "`t")), $wrappers.Replace("\t", "`t")
# For the navigator, regex is safer if the block is large
# But wait, I'll just use simple replace for the start of the navigator

$content = $content -replace '<RootStack.Navigator[\s\S]+?</RootStack.Navigator>', $newNavigator

Set-Content $path $content
