import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import {
    useTheme,
    useThemedColors,
    Theme,
    DeleteAccountModal,
    LogoutModal
} from '@repo/ui';
import { useUserRole, useStore, useAccountDeletion } from '@repo/core';
import { useEnvironment } from '@repo/ui';
import {
    Sun,
    Moon,
    Sparkles,
    Globe,
    Shield,
    LogOut,
    Trash2,
    HelpCircle,
    Info,
    ChevronRight,
    Smartphone,
    Eye,
    EyeOff
} from 'lucide-react-native';

function PWAInstallRow({ showToast }: { showToast: (msg: string, type: string) => void }) {
    const [canInstall, setCanInstall] = React.useState(false);
    const [installed, setInstalled] = React.useState(false);

    React.useEffect(() => {
        const onInstallable = () => setCanInstall(true);
        const onInstalled = () => { setInstalled(true); setCanInstall(false); };
        document.addEventListener('pwa-installable', onInstallable);
        document.addEventListener('pwa-installed', onInstalled);
        // Check if already captured
        if ((window as any).__pwaInstallPrompt) setCanInstall(true);
        return () => {
            document.removeEventListener('pwa-installable', onInstallable);
            document.removeEventListener('pwa-installed', onInstalled);
        };
    }, []);

    if (installed) return null;
    if (!canInstall) return null;

    const handleInstall = async () => {
        const prompt = (window as any).__pwaInstallPrompt;
        if (!prompt) return;
        prompt.prompt();
        const { outcome } = await prompt.userChoice;
        if (outcome === 'accepted') {
            showToast('Gurudevi installed on your device!', 'success');
            (window as any).__pwaInstallPrompt = null;
            setCanInstall(false);
        }
    };

    return (
        <button className="settings-row" onClick={handleInstall} style={{ border: '1px solid var(--action-border)', background: 'var(--action-soft)' }}>
            <div className="settings-row-info">
                <span className="settings-row-title" style={{ color: 'var(--action)' }}>Install Gurudevi App</span>
                <span className="settings-row-desc">Add to home screen for full experience</span>
            </div>
            <div className="settings-row-action">
                <span style={{ fontSize: '18px' }}>📲</span>
            </div>
        </button>
    );
}

export default function AppSettingsScreenWeb() {
    const { t, i18n } = useTranslation();
    const navigation = useNavigation<any>();
    const colors = useThemedColors();
    const { role } = useUserRole();
    const {
        themeMode, setThemeMode,
        fidelityLevel, setFidelityLevel,
        language, setLanguage,
        isVeilActive, toggleVeil,
        enableLivingTheme, setEnableLivingTheme
    } = useEnvironment();

    const { isDemoMode, setDemoMode, showToast } = useStore();
    const { logout } = useStore((state) => ({ logout: () => state.setUser(null) }));
    const { deleteAccount, isDeleting } = useAccountDeletion();

    const [isLogoutModalVisible, setLogoutModalVisible] = useState(false);
    const [isDeleteModalVisible, setDeleteModalVisible] = useState(false);

    const handleLanguageChange = async (lang: 'en' | 'si' | 'ta') => {
        await setLanguage(lang);
        await i18n.changeLanguage(lang);
        showToast(t('settings.language_updated', 'Language updated'), 'success');
    };

    return (
        <div className="sanctuary-screen">
            <div className="sanctuary-container">
                <div className="greeting">
                    <div className="greeting-time">{t('settings.sanctuary_config', 'Sanctuary Configuration')}</div>
                    <h1 className="greeting-main">{t('settings.title', 'Settings')}</h1>
                    <p className="greeting-note">{t('settings.description', 'Customize your experience within the Gurudevi Ecosystem')}</p>
                </div>

                <div className="settings-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(350px, 100%), 1fr))', gap: '24px' }}>

                    {/* 1. APPEARANCE SECTION */}
                    <div className="sanctuary-card" style={{ padding: '24px' }}>
                        <h3 className="card-header-label">
                            <Sparkles size={16} /> {t('settings.appearance.title', 'Appearance')}
                        </h3>

                        <div className="settings-list">
                            <button className="settings-row" onClick={() => setThemeMode(themeMode === 'dark' ? 'light' : 'dark')}>
                                <div className="settings-row-info">
                                    <span className="settings-row-title">{t('settings.theme.title', 'Theme')}</span>
                                    <span className="settings-row-desc">{themeMode === 'dark' ? 'Dark' : 'Light'} Mode</span>
                                </div>
                                <div className="settings-row-action">
                                    {themeMode === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
                                </div>
                            </button>

                            <button className="settings-row" onClick={() => setEnableLivingTheme(!enableLivingTheme)}>
                                <div className="settings-row-info">
                                    <span className="settings-row-title">{t('settings.living_theme.title', 'Living Theme')}</span>
                                    <span className="settings-row-desc">{enableLivingTheme ? 'Phase-aware active' : 'Simple static color'}</span>
                                </div>
                                <div className="settings-row-action">
                                    <div className={`web-toggle ${enableLivingTheme ? 'active' : ''}`} />
                                </div>
                            </button>

                            <button className="settings-row" onClick={() => setFidelityLevel(fidelityLevel === 'high' ? 'low' : 'high')}>
                                <div className="settings-row-info">
                                    <span className="settings-row-title">{t('settings.fidelity.title', 'Visual Quality')}</span>
                                    <span className="settings-row-desc">{fidelityLevel === 'high' ? 'Premium Resonance' : 'Performance Optimized'}</span>
                                </div>
                                <div className="settings-row-action">
                                    <Smartphone size={20} />
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* 2. LOCALIZATION SECTION */}
                    <div className="sanctuary-card" style={{ padding: '24px' }}>
                        <h3 className="card-header-label">
                            <Globe size={16} /> {t('settings.language.title', 'Language & Regional')}
                        </h3>

                        <div className="settings-list">
                            <button className="settings-row" onClick={() => handleLanguageChange('en')}>
                                <div className="settings-row-info">
                                    <span className="settings-row-title">English</span>
                                    {language === 'en' && <span className="settings-row-tag">Active</span>}
                                </div>
                                <div className="settings-row-action">
                                    {language === 'en' && <ChevronRight size={18} />}
                                </div>
                            </button>
                            <button className="settings-row" onClick={() => handleLanguageChange('si')}>
                                <div className="settings-row-info">
                                    <span className="settings-row-title">සිංහල</span>
                                    {language === 'si' && <span className="settings-row-tag">සක්‍රීයයි</span>}
                                </div>
                                <div className="settings-row-action">
                                    {language === 'si' && <ChevronRight size={18} />}
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* 3. PRIVACY & SECURITY */}
                    <div className="sanctuary-card" style={{ padding: '24px' }}>
                        <h3 className="card-header-label">
                            <Shield size={16} /> {t('settings.privacy.title', 'Privacy & Security')}
                        </h3>

                        <div className="settings-list">
                            <button className="settings-row" onClick={() => toggleVeil()}>
                                <div className="settings-row-info">
                                    <span className="settings-row-title">{t('settings.veil.title', 'Privacy Veil')}</span>
                                    <span className="settings-row-desc">{isVeilActive ? 'Sensitive info hidden' : 'Quick-hide details'}</span>
                                </div>
                                <div className="settings-row-action">
                                    {isVeilActive ? <EyeOff size={20} color="var(--water)" /> : <Eye size={20} />}
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* 4. ACCOUNT MANAGEMENT */}
                    <div className="sanctuary-card" style={{ padding: '24px', borderColor: 'rgba(255, 100, 100, 0.2)' }}>
                        <h3 className="card-header-label" style={{ color: 'var(--ink)' }}>
                            <Info size={16} /> {t('settings.account.title', 'Account Stewardship')}
                        </h3>

                        <div className="settings-list">
                            <button className="settings-row" onClick={() => setLogoutModalVisible(true)}>
                                <div className="settings-row-info">
                                    <span className="settings-row-title" style={{ color: colors.error }}>{t('profile.logout', 'Sign Out')}</span>
                                    <span className="settings-row-desc">Currently as {role?.split('_').join(' ')}</span>
                                </div>
                                <div className="settings-row-action">
                                    <LogOut size={20} color={colors.error} />
                                </div>
                            </button>

                            <button className="settings-row" style={{ marginTop: '12px', borderTop: '1px dashed var(--border)', paddingTop: '12px' }} onClick={() => setDeleteModalVisible(true)}>
                                <div className="settings-row-info">
                                    <span className="settings-row-title" style={{ color: colors.textTertiary, fontSize: '12px' }}>{t('profile.deleteAccount', 'Delete Account')}</span>
                                </div>
                                <div className="settings-row-action">
                                    <Trash2 size={16} color={colors.textTertiary} />
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* 5. SUPPORT & RESONANCE */}
                    <div className="sanctuary-card" style={{ padding: '24px' }}>
                        <h3 className="card-header-label">
                            <HelpCircle size={16} /> {t('settings.support.title', 'Support & Resonance')}
                        </h3>

                        <div className="settings-list">
                            <PWAInstallRow showToast={showToast} />
                            <button className="settings-row" onClick={() => showToast('Help Center coming soon', 'info')}>
                                <div className="settings-row-info">
                                    <span className="settings-row-title">Help Center</span>
                                    <span className="settings-row-desc">Guides, FAQs, and support</span>
                                </div>
                                <div className="settings-row-action">
                                    <ChevronRight size={18} />
                                </div>
                            </button>

                            <button className="settings-row" onClick={() => showToast('About Ecosystem coming soon', 'info')}>
                                <div className="settings-row-info">
                                    <span className="settings-row-title">About Gurudevi</span>
                                    <span className="settings-row-desc">The vision and the architecture</span>
                                </div>
                                <div className="settings-row-action">
                                    <Info size={18} />
                                </div>
                            </button>
                        </div>
                    </div>

                </div>

                <div className="settings-footer" style={{ marginTop: '40px', textAlign: 'center', opacity: 0.5 }}>
                    <p style={{ fontSize: '12px' }}>Gurudevi Web Experience v4.2.0 • Unified Ecosystem</p>
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
