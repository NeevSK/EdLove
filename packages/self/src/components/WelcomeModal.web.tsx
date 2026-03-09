/**
 * WelcomeModal.web.tsx
 *
 * Web override of WelcomeModal.tsx. The native version uses SanctuaryModal +
 * hapticSuccess from @repo/ui. On web we use a CSS portal-style overlay dialog.
 * Metro resolves this over WelcomeModal.tsx on the web platform.
 */
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface WelcomeModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function WelcomeModal({ isOpen, onClose }: WelcomeModalProps) {
    const { t } = useTranslation();

    // Close on Escape (focus trap would require cycling focusable elements)
    useEffect(() => {
        if (!isOpen) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div
            style={{
                position: 'fixed', inset: 0, zIndex: 9999,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(30,20,10,0.55)', backdropFilter: 'blur(6px)',
                animation: 'fadeIn 0.25s ease',
            }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-label={t('welcome.title')}
                style={{
                    background: 'var(--glass-surface, #fff)',
                    borderRadius: '24px',
                    padding: '48px 40px',
                    maxWidth: '460px',
                    width: '90%',
                    boxShadow: '0 32px 80px rgba(0,0,0,0.18)',
                    border: '1px solid var(--border, rgba(255,255,255,0.2))',
                    textAlign: 'center',
                    animation: 'slideUp 0.3s cubic-bezier(0.34,1.56,0.64,1)',
                }}
            >
                {/* Lotus Icon */}
                <div style={{ fontSize: '56px', marginBottom: '24px', lineHeight: 1 }}>🌸</div>

                <h2 style={{
                    fontSize: '26px', fontWeight: '800',
                    color: 'var(--ink, #1a1a2e)', marginBottom: '16px',
                    fontFamily: 'var(--font-heading, serif)',
                }}>
                    {t('welcome.title')}
                </h2>

                <p style={{
                    fontSize: '16px', lineHeight: '1.7',
                    color: 'var(--ink-soft, #4a4a6a)', marginBottom: '12px',
                }}>
                    {t('welcome.message')}
                </p>

                <p style={{
                    fontSize: '14px', lineHeight: '1.6',
                    color: 'var(--ink-ghost, #8a8aaa)', marginBottom: '36px',
                }}>
                    {t('welcome.description')}
                </p>

                <button
                    onClick={onClose}
                    autoFocus
                    style={{
                        padding: '14px 40px',
                        borderRadius: '14px',
                        background: 'var(--sanctuary-saffron, #f97316)',
                        color: '#fff',
                        border: 'none',
                        fontSize: '15px',
                        fontWeight: '700',
                        fontFamily: 'var(--font-body, sans-serif)',
                        cursor: 'pointer',
                        width: '100%',
                        transition: 'transform 0.15s, opacity 0.15s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = '0.9')}
                    onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                >
                    {t('welcome.start')}
                </button>
            </div>

            <style>{`
                @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
                @keyframes slideUp { from { opacity: 0; transform: translateY(32px) scale(0.96) } to { opacity: 1; transform: translateY(0) scale(1) } }
            `}</style>
        </div>
    );
}
