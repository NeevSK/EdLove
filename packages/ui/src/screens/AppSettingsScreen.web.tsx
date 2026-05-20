import { useNavigation } from '@react-navigation/native';
import { authAPI } from '@repo/core/api';
import { useAccountDeletion } from '@repo/core/hooks';
import { useStore } from '@repo/core/logic';
import {
  DeleteAccountModal,
  LogoutModal,
  NotificationSettingsPanel,
  WebScreenHeader,
} from '@repo/ui/components';
import { useEnvironment } from '@repo/ui/context';
import { useThemedColors } from '@repo/ui/hooks';
import {
  ChevronRight,
  Globe,
  Info,
  LogOut,
  Moon,
  Smartphone,
  Sparkles,
  Sun,
  Trash2,
} from 'lucide-react-native';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

function PWAInstallRow({
  showToast,
}: {
  showToast: (message: string, type: 'success' | 'error' | 'info', duration?: number) => void;
}) {
  const [canInstall, setCanInstall] = React.useState(false);
  const [installed, setInstalled] = React.useState(false);

  React.useEffect(() => {
    const onInstallable = () => setCanInstall(true);
    const onInstalled = () => {
      setInstalled(true);
      setCanInstall(false);
    };

    document.addEventListener('pwa-installable', onInstallable);
    document.addEventListener('pwa-installed', onInstalled);

    if ((window as any).__pwaInstallPrompt) setCanInstall(true);

    return () => {
      document.removeEventListener('pwa-installable', onInstallable);
      document.removeEventListener('pwa-installed', onInstalled);
    };
  }, []);

  if (installed || !canInstall) return null;

  const handleInstall = async () => {
    const prompt = (window as any).__pwaInstallPrompt;
    if (!prompt) return;

    try {
      prompt.prompt();
      const { outcome } = await prompt.userChoice;
      if (outcome === 'accepted') {
        showToast('Gurudevi installed on your device!', 'success');
        (window as any).__pwaInstallPrompt = null;
        setCanInstall(false);
      }
    } catch {
      showToast('Install not available in this browser', 'info');
    }
  };

  return (
    <button
      className="settings-row"
      onClick={handleInstall}
      style={{
        border: '1px solid var(--action-border)',
        background: 'var(--action-soft)',
      }}
    >
      <div className="settings-row-info">
        <span className="settings-row-title" style={{ color: 'var(--action)' }}>
          Install Gurudevi App
        </span>
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
  const _navigation = useNavigation<any>();
  const _colors = useThemedColors();
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
  const { showToast, setUser } = useStore();
  const logout = async () => {
    try {
      await authAPI.signOut();
    } catch (error) {
      console.error('[Settings] Remote logout failed, clearing local state anyway:', error);
    } finally {
      setUser(null);
    }
  };
  const { deleteAccount, isDeleting } = useAccountDeletion();
  const [isLogoutModalVisible, setLogoutModalVisible] = useState(false);
  const [isDeleteModalVisible, setDeleteModalVisible] = useState(false);

  const handleLanguageChange = async (lang: 'en' | 'si' | 'ta') => {
    await setLanguage(lang);
    await i18n.changeLanguage(lang);
    showToast(t('settings.language_updated'), 'success');
  };

  return (
    <div className="sanctuary-screen">
      <div className="sanctuary-container">
        <WebScreenHeader
          title={t('settings.title')}
          note={t('settings.description')}
          timeText={t('settings.sanctuary_config')}
        />
        <PWAInstallRow showToast={showToast} />
        <div style={{ marginTop: 24 }} />
        <div
          className="settings-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(350px, 100%), 1fr))',
            gap: '24px',
          }}
        >
          <div className="sanctuary-card" style={{ padding: '24px' }}>
            <h3 className="card-header-label">
              <Sparkles size={16} /> {t('settings.appearance.title')}
            </h3>
            <div className="settings-list">
              <button
                className="settings-row"
                onClick={() => setThemeMode(themeMode === 'dark' ? 'light' : 'dark')}
              >
                <div className="settings-row-info">
                  <span className="settings-row-title">{t('settings.theme.title')}</span>
                  <span className="settings-row-desc">
                    {themeMode === 'dark' ? 'Dark' : 'Light'} Mode
                  </span>
                </div>
                <div className="settings-row-action">
                  {themeMode === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
                </div>
              </button>
              <button
                className="settings-row"
                onClick={() => setEnableLivingTheme(!enableLivingTheme)}
              >
                <div className="settings-row-info">
                  <span className="settings-row-title">{t('settings.living_theme.title')}</span>
                  <span className="settings-row-desc">
                    {enableLivingTheme ? 'Phase-aware active' : 'Simple static color'}
                  </span>
                </div>
                <div className="settings-row-action">
                  <div className={`web-toggle ${enableLivingTheme ? 'active' : ''}`} />
                </div>
              </button>
              <button
                className="settings-row"
                onClick={() => setFidelityLevel(fidelityLevel === 'high' ? 'low' : 'high')}
              >
                <div className="settings-row-info">
                  <span className="settings-row-title">{t('settings.fidelity.title')}</span>
                  <span className="settings-row-desc">
                    {fidelityLevel === 'high' ? 'Premium Resonance' : 'Performance Optimized'}
                  </span>
                </div>
                <div className="settings-row-action">
                  <Smartphone size={20} />
                </div>
              </button>
            </div>
          </div>
          <div className="sanctuary-card" style={{ padding: '24px' }}>
            <h3 className="card-header-label">
              <Globe size={16} /> {t('settings.language.title')}
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
              <button className="settings-row" onClick={() => handleLanguageChange('ta')}>
                <div className="settings-row-info">
                  <span className="settings-row-title">தமிழ்</span>
                  {language === 'ta' && <span className="settings-row-tag">செயலில்</span>}
                </div>
                <div className="settings-row-action">
                  {language === 'ta' && <ChevronRight size={18} />}
                </div>
              </button>
            </div>
          </div>
          <div className="sanctuary-card" style={{ padding: '24px' }}>
            <NotificationSettingsPanel />
          </div>
          <div
            className="sanctuary-card"
            style={{ padding: '24px', borderColor: 'rgba(255, 100, 100, 0.2)' }}
          >
            <h3 className="card-header-label" style={{ color: 'var(--ink)' }}>
              <Info size={16} /> {t('settings.account.title')}
            </h3>
            <div className="settings-list">
              <button className="settings-row" onClick={() => setLogoutModalVisible(true)}>
                <div className="settings-row-info">
                  <span className="settings-row-title">{t('settings.logout.title')}</span>
                  <span className="settings-row-desc">
                    Sign out of this device and clear local session state
                  </span>
                </div>
                <div className="settings-row-action">
                  <LogOut size={20} />
                </div>
              </button>
              <button className="settings-row" onClick={() => setDeleteModalVisible(true)}>
                <div className="settings-row-info">
                  <span className="settings-row-title">{t('settings.delete.title')}</span>
                  <span className="settings-row-desc">
                    Permanently remove this account and local data
                  </span>
                </div>
                <div className="settings-row-action">
                  <Trash2 size={20} />
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
      {isLogoutModalVisible && (
        <LogoutModal isOpen onClose={() => setLogoutModalVisible(false)} onLogout={logout} />
      )}
      {isDeleteModalVisible && (
        <DeleteAccountModal
          isOpen
          onClose={() => setDeleteModalVisible(false)}
          onDelete={deleteAccount}
          isLoading={isDeleting}
        />
      )}
    </div>
  );
}
