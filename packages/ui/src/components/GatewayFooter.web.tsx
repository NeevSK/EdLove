import { EXTERNAL_URLS } from '@repo/ui/utils';
import type React from 'react';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

export const GatewayFooter: React.FC = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  const handleMouseEnter = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    e.currentTarget.style.color = 'var(--action, #D4843A)';
  }, []);

  const handleMouseLeave = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    e.currentTarget.style.color = 'var(--ink-ghost, #7A6E5F)';
  }, []);

  return (
    <footer
      style={{
        width: '100%',
        padding: '24px 40px',
        borderTop: '1px solid var(--border, rgba(42,35,24,0.08))',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
        background: 'rgba(255, 255, 255, 0.25)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        zIndex: 50,
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: '24px',
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}
      >
        <a
          href={EXTERNAL_URLS.privacy}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--ink-ghost, #7A6E5F)',
            textDecoration: 'none',
            transition: 'color 0.2s',
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          Privacy Policy
        </a>
        <a
          href={EXTERNAL_URLS.terms}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--ink-ghost, #7A6E5F)',
            textDecoration: 'none',
            transition: 'color 0.2s',
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          Terms of Use
        </a>
        <a
          href={EXTERNAL_URLS.guidelines}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--ink-ghost, #7A6E5F)',
            textDecoration: 'none',
            transition: 'color 0.2s',
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          Community Guidelines
        </a>
      </div>
      <div
        style={{
          fontSize: '12px',
          color: 'var(--ink-ghost, #7A6E5F)',
          textAlign: 'center',
          lineHeight: '1.6',
        }}
      >
        <span>
          {t('welcome.footer') || 'Part of the EdLove Constellation · Made with 💖 in Sri Lanka'}
        </span>
        <br />
        <span style={{ opacity: 0.8, fontSize: '11px', marginTop: '4px', display: 'inline-block' }}>
          &copy; {currentYear} Gurudevi Sanctuary. All rights reserved.
        </span>
      </div>
    </footer>
  );
};
