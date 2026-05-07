import { useNavigation } from "@react-navigation/native";
import { useUserRole } from "@repo/core";
import { authAPI } from "@repo/core/api";
import { useAccountDeletion } from "@repo/core/hooks";
import { useStore } from "@repo/core/logic";
import { DeleteAccountModal, LogoutModal } from "@repo/ui";
import { WebScreenHeader } from "@repo/ui/components";
import { useEnvironment } from "@repo/ui/context";
import { useThemedColors } from "@repo/ui/hooks";
import {
	ChevronRight,
	Globe,
	HelpCircle,
	Info,
	LogOut,
	Moon,
	Smartphone,
	Sparkles,
	Sun,
	Trash2,
} from "lucide-react-native";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";

function PWAInstallRow({
	showToast,
}: {
	showToast: (msg: string, type: string) => void;
}) {
	const [canInstall, setCanInstall] = React.useState(false);
	const [installed, setInstalled] = React.useState(false);
	React.useEffect(() => {
		const onInstallable = () => setCanInstall(true);
		const onInstalled = () => {
			setInstalled(true);
			setCanInstall(false);
		};
		document.addEventListener("pwa-installable", onInstallable);
		document.addEventListener("pwa-installed", onInstalled);
		// Check if already captured
		if ((window as any).__pwaInstallPrompt) setCanInstall(true);
		return () => {
			document.removeEventListener("pwa-installable", onInstallable);
			document.removeEventListener("pwa-installed", onInstalled);
		};
	}, []);
	if (installed) return null;
	if (!canInstall) return null;
	const handleInstall = async () => {
		const prompt = (window as any).__pwaInstallPrompt;
		if (!prompt) return;
		try {
			prompt.prompt();
			const { outcome } = await prompt.userChoice;
			if (outcome === "accepted") {
				showToast("Gurudevi installed on your device!", "success");
				(window as any).__pwaInstallPrompt = null;
				setCanInstall(false);
			}
		} catch {
			showToast("Install not available in this browser", "info");
		}
	};
	return (
		<button
			className="settings-row"
			onClick={handleInstall}
			style={{
				border: "1px solid var(--action-border)",
				background: "var(--action-soft)",
			}}
		>
			<div className="settings-row-info">
				<span className="settings-row-title" style={{ color: "var(--action)" }}>
					Install Gurudevi App
				</span>
				<span className="settings-row-desc">
					Add to home screen for full experience
				</span>
			</div>
			<div className="settings-row-action">
				<span style={{ fontSize: "18px" }}>📲</span>
			</div>
		</button>
	);
}
export default function AppSettingsScreenWeb() {
	const { t, i18n } = useTranslation();
	const _navigation = useNavigation<any>();
	const colors = useThemedColors();
	const { role } = useUserRole();
	const {
		themeMode,
		setThemeMode,
		fidelityLevel,
		setFidelityLevel,
		language,
		setLanguage,
		enableLivingTheme,
		setEnableLivingTheme,
	} = useEnvironment();
	const { isDemoMode, setDemoMode, showToast, setUser } = useStore();
	const logout = async () => {
		try {
			await authAPI.signOut();
		} catch (error) {
			console.error(
				"[Settings] Remote logout failed, clearing local state anyway:",
				error,
			);
		} finally {
			setUser(null);
		}
	};
	const { deleteAccount, isDeleting } = useAccountDeletion();
	const [isLogoutModalVisible, setLogoutModalVisible] = useState(false);
	const [isDeleteModalVisible, setDeleteModalVisible] = useState(false);
	const handleLanguageChange = async (lang: "en" | "si" | "ta") => {
		await setLanguage(lang);
		await i18n.changeLanguage(lang);
		showToast(t("settings.language_updated"), "success");
	};
	return (
		<div className="sanctuary-screen">
			<div className="sanctuary-container">
				<WebScreenHeader
					title={t("settings.title")}
					note={t("settings.description")}
					timeText={t("settings.sanctuary_config")}
				/>
				<div style={{ marginTop: 24 }} />

				<div
					className="settings-grid"
					style={{
						display: "grid",
						gridTemplateColumns:
							"repeat(auto-fit, minmax(min(350px, 100%), 1fr))",
						gap: "24px",
					}}
				>
					{/* 1. APPEARANCE SECTION */}
					<div className="sanctuary-card" style={{ padding: "24px" }}>
						<h3 className="card-header-label">
							<Sparkles size={16} /> {t("settings.appearance.title")}
						</h3>

						<div className="settings-list">
							<button
								className="settings-row"
								onClick={() =>
									setThemeMode(themeMode === "dark" ? "light" : "dark")
								}
							>
								<div className="settings-row-info">
									<span className="settings-row-title">
										{t("settings.theme.title")}
									</span>
									<span className="settings-row-desc">
										{themeMode === "dark" ? "Dark" : "Light"} Mode
									</span>
								</div>
								<div className="settings-row-action">
									{themeMode === "dark" ? (
										<Moon size={20} />
									) : (
										<Sun size={20} />
									)}
								</div>
							</button>

							<button
								className="settings-row"
								onClick={() => setEnableLivingTheme(!enableLivingTheme)}
							>
								<div className="settings-row-info">
									<span className="settings-row-title">
										{t("settings.living_theme.title")}
									</span>
									<span className="settings-row-desc">
										{enableLivingTheme
											? "Phase-aware active"
											: "Simple static color"}
									</span>
								</div>
								<div className="settings-row-action">
									<div
										className={`web-toggle ${enableLivingTheme ? "active" : ""}`}
									/>
								</div>
							</button>

							<button
								className="settings-row"
								onClick={() =>
									setFidelityLevel(fidelityLevel === "high" ? "low" : "high")
								}
							>
								<div className="settings-row-info">
									<span className="settings-row-title">
										{t("settings.fidelity.title")}
									</span>
									<span className="settings-row-desc">
										{fidelityLevel === "high"
											? "Premium Resonance"
											: "Performance Optimized"}
									</span>
								</div>
								<div className="settings-row-action">
									<Smartphone size={20} />
								</div>
							</button>

							{/* Notifications permission row (web only) */}
							{typeof Notification !== "undefined" &&
								Notification.permission !== undefined && (
									<button
										className="settings-row"
										onClick={async () => {
											if (Notification.permission === "default") {
												const perm = await Notification.requestPermission();
												if (perm === "granted") {
													showToast(
														t("settings.notifications_enabled"),
														"success",
													);
												}
											}
										}}
									>
										<div className="settings-row-info">
											<span className="settings-row-title">
												Push Notifications
											</span>
											<span className="settings-row-desc">
												{Notification.permission === "granted"
													? "Enabled — you will receive updates"
													: Notification.permission === "denied"
														? "Blocked in browser settings"
														: "Tap to enable browser notifications"}
											</span>
										</div>
										<div className="settings-row-action">
											<div
												className={`web-toggle ${Notification.permission === "granted" ? "active" : ""}`}
											/>
										</div>
									</button>
								)}
						</div>
					</div>

					{/* 2. LOCALIZATION SECTION */}
					<div className="sanctuary-card" style={{ padding: "24px" }}>
						<h3 className="card-header-label">
							<Globe size={16} /> {t("settings.language.title")}
						</h3>

						<div className="settings-list">
							<button
								className="settings-row"
								onClick={() => handleLanguageChange("en")}
							>
								<div className="settings-row-info">
									<span className="settings-row-title">English</span>
									{language === "en" && (
										<span className="settings-row-tag">Active</span>
									)}
								</div>
								<div className="settings-row-action">
									{language === "en" && <ChevronRight size={18} />}
								</div>
							</button>
							<button
								className="settings-row"
								onClick={() => handleLanguageChange("si")}
							>
								<div className="settings-row-info">
									<span className="settings-row-title">සිංහල</span>
									{language === "si" && (
										<span className="settings-row-tag">සක්‍රීයයි</span>
									)}
								</div>
								<div className="settings-row-action">
									{language === "si" && <ChevronRight size={18} />}
								</div>
							</button>
							<button
								className="settings-row"
								onClick={() => handleLanguageChange("ta")}
							>
								<div className="settings-row-info">
									<span className="settings-row-title">தமிழ்</span>
									{language === "ta" && (
										<span className="settings-row-tag">செயலில்</span>
									)}
								</div>
								<div className="settings-row-action">
									{language === "ta" && <ChevronRight size={18} />}
								</div>
							</button>
						</div>
					</div>

					{/* 4. ACCOUNT MANAGEMENT */}
					<div
						className="sanctuary-card"
						style={{ padding: "24px", borderColor: "rgba(255, 100, 100, 0.2)" }}
					>
						<h3 className="card-header-label" style={{ color: "var(--ink)" }}>
							<Info size={16} /> {t("settings.account.title")}
						</h3>

						<div className="settings-list">
							<button
								className="settings-row"
								onClick={() => setLogoutModalVisible(true)}
							>
								<div className="settings-row-info">
									<span
										className="settings-row-title"
										style={{ color: colors.error }}
									>
										{t("profile.logout")}
									</span>
									<span className="settings-row-desc">
										Currently as {role?.split("_").join(" ")}
									</span>
								</div>
								<div className="settings-row-action">
									<LogOut size={20} color={colors.error} />
								</div>
							</button>

							<button
								className="settings-row"
								style={{
									marginTop: "12px",
									borderTop: "1px dashed var(--border)",
									paddingTop: "12px",
								}}
								onClick={() => setDeleteModalVisible(true)}
							>
								<div className="settings-row-info">
									<span
										className="settings-row-title"
										style={{ color: colors.textTertiary, fontSize: "12px" }}
									>
										{t("profile.deleteAccount")}
									</span>
								</div>
								<div className="settings-row-action">
									<Trash2 size={16} color={colors.textTertiary} />
								</div>
							</button>
						</div>
					</div>

					{/* 5. SUPPORT & RESONANCE */}
					<div className="sanctuary-card" style={{ padding: "24px" }}>
						<h3 className="card-header-label">
							<HelpCircle size={16} /> {t("settings.support.title")}
						</h3>

						<div className="settings-list">
							<PWAInstallRow showToast={showToast} />
							<button
								className="settings-row"
								onClick={() => showToast("Help Center coming soon", "info")}
							>
								<div className="settings-row-info">
									<span className="settings-row-title">Help Center</span>
									<span className="settings-row-desc">
										Guides, FAQs, and support
									</span>
								</div>
								<div className="settings-row-action">
									<ChevronRight size={18} />
								</div>
							</button>

							<button
								className="settings-row"
								onClick={() => showToast("About Ecosystem coming soon", "info")}
							>
								<div className="settings-row-info">
									<span className="settings-row-title">About Gurudevi</span>
									<span className="settings-row-desc">
										The vision and the architecture
									</span>
								</div>
								<div className="settings-row-action">
									<Info size={18} />
								</div>
							</button>
						</div>
					</div>
				</div>

				<div
					className="settings-footer"
					style={{ marginTop: "40px", textAlign: "center", opacity: 0.5 }}
				>
					<p style={{ fontSize: "12px" }}>
						Gurudevi Web Experience v4.2.0 • Unified Ecosystem
					</p>
				</div>
			</div>

			<LogoutModal
				isOpen={isLogoutModalVisible}
				onClose={() => setLogoutModalVisible(false)}
				onLogout={async () => {
					await logout();
					setLogoutModalVisible(false);
				}}
			/>

			<DeleteAccountModal
				isOpen={isDeleteModalVisible}
				onClose={() => setDeleteModalVisible(false)}
				onDelete={async () => {
					await deleteAccount();
					setDeleteModalVisible(false);
				}}
				isLoading={isDeleting}
			/>

			<style>{`
                .card-header-label {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin: 0 0 24px;
                    font-size: 14px;
                    font-weight: 800;
                    color: var(--ink-ghost);
                    text-transform: uppercase;
                    letter-spacing: 0.8px;
                }
                .settings-list {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }
                .settings-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 16px;
                    border-radius: 16px;
                    cursor: pointer;
                    width: 100%;
                    text-align: left;
                    font-family: var(--font-body);
                    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
                    background: var(--glass-surface);
                    border: 1px solid transparent;
                }
                .settings-row:hover {
                    background: var(--glass-interact);
                    border-color: var(--border);
                    transform: translateX(4px);
                }
                .settings-row-info {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                }
                .settings-row-title {
                    font-size: 16px;
                    font-weight: 700;
                    color: var(--ink);
                }
                .settings-row-desc {
                    font-size: 12px;
                    color: var(--ink-ghost);
                }
                .settings-row-tag {
                    font-size: 10px;
                    font-weight: 800;
                    color: var(--action);
                    text-transform: uppercase;
                    margin-top: 4px;
                    background: var(--action-soft);
                    padding: 2px 8px;
                    border-radius: 8px;
                    width: fit-content;
                }
                .web-toggle {
                    width: 44px;
                    height: 24px;
                    background: var(--border);
                    border-radius: 12px;
                    position: relative;
                    transition: background 0.3s ease;
                }
                .web-toggle:after {
                    content: '';
                    position: absolute;
                    width: 18px;
                    height: 18px;
                    background: white;
                    border-radius: 50%;
                    top: 3px;
                    left: 3px;
                    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                .web-toggle.active {
                    background: var(--action);
                }
                .web-toggle.active:after {
                    transform: translateX(20px);
                }
            `}</style>
		</div>
	);
}
