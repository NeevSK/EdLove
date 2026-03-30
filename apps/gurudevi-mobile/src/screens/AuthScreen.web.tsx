/**
 * AuthScreen.web.tsx — Web-specific auth screen
 *
 * Metro resolves this file instead of AuthScreen.tsx on the web platform.
 *
 * Features:
 *  - Pill toggle: [ Sign Up | Log In ] at the top
 *  - Google OAuth button (per mode)
 *  - Email / password form (expandable)
 *  - Back button when `onBack` prop is provided
 *  - "Continue as Guest" when applicable
 *  - Plain HTML + scoped CSS (no react-native-web quirks)
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase, UserRole, handleAPIError, GuestDataSync, identityAPI } from '@repo/core';
import { validators, validateForm } from '../utils/validators';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as WebBrowser from 'expo-web-browser';
import { GuestDataSyncModal } from '@repo/ui';

WebBrowser.maybeCompleteAuthSession();

interface AuthScreenProps {
    onContinueAsGuest?: () => void;
    onSuccess?: () => void;
    onBack?: () => void;
    initialMode?: 'login' | 'signup';
}

export default function AuthScreenWeb({
    onContinueAsGuest,
    onSuccess,
    onBack,
    initialMode,
}: AuthScreenProps) {
    const { t } = useTranslation();

    // ── Mode: 'signup' | 'login' ─────────────────────────────────────────
    const [mode, setMode] = useState<'signup' | 'login'>(initialMode === 'login' ? 'login' : 'signup');
    const [showEmailForm, setShowEmailForm] = useState(initialMode === 'login');

    // Form state
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [toast, setToast] = useState<{ msg: string; kind: 'success' | 'error' } | null>(null);

    const [currentUser, setCurrentUser] = useState<any>(null);
    const [showSyncModal, setShowSyncModal] = useState(false);
    const [newUserId, setNewUserId] = useState('');

    // ── Load current user ─────────────────────────────────────────────────
    useEffect(() => {
        identityAPI.getMyInternalId().then(async (internalId) => {
            if (!internalId) { setCurrentUser(null); return; }
            const { data } = await supabase
                .from('users')
                .select('id, email, is_anonymous, full_name')
                .eq('id', internalId)
                .maybeSingle();
            setCurrentUser(data ?? null);
        });
    }, []);

    // ── Detect OAuth error params in URL ──────────────────────────────────
    useEffect(() => {
        const getUrlParam = (name: string) => {
            const fromQuery = new URLSearchParams(window.location.search).get(name);
            if (fromQuery) return fromQuery;
            return new URLSearchParams(window.location.hash.replace(/^#/, '')).get(name);
        };
        const errorCode = getUrlParam('error_code');
        const errorDesc = getUrlParam('error_description');
        if (!errorCode) return;

        if (errorCode === 'identity_already_exists') {
            setMode('login');
            setShowEmailForm(true);
            showToast(
                t('auth.identityAlreadyExists') || 'This account already exists. Please sign in instead.',
                'error',
            );
        } else {
            showToast(decodeURIComponent(errorDesc ?? errorCode).replace(/\+/g, ' '), 'error');
        }
        try {
            window.history.replaceState(null, '', window.location.origin + window.location.pathname);
        } catch (_) { /* ignore */ }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── Auto-dismiss toast ────────────────────────────────────────────────
    useEffect(() => {
        if (!toast) return;
        const id = setTimeout(() => setToast(null), 4000);
        return () => clearTimeout(id);
    }, [toast]);

    function showToast(msg: string, kind: 'success' | 'error') {
        setToast({ msg, kind });
    }

    const isRealUser = currentUser?.email && !currentUser?.is_anonymous;

    // ── Google OAuth ──────────────────────────────────────────────────────
    async function handleGoogleSignIn() {
        setLoading(true);
        const redirectUrl = window.location.origin;

        const { data: { session } } = await supabase.auth.getSession();
        const isAnon = session?.user?.is_anonymous || !session?.user?.email;

        if (isAnon && session?.user) {
            const { error } = await supabase.auth.linkIdentity({
                provider: 'google',
                options: { redirectTo: redirectUrl },
            });
            if (error) {
                if (error.message.includes('already linked')) {
                    showToast(t('auth.alreadyLinkedDesc'), 'error');
                } else {
                    handleAPIError(error);
                }
                setLoading(false);
            }
            // Note: linkIdentity will trigger a redirect.
            return;
        }

        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: redirectUrl,
                queryParams: { prompt: 'select_account' },
            },
        });
        if (error) { handleAPIError(error); setLoading(false); }
    }

    // ── Email / password ──────────────────────────────────────────────────
    async function handleEmailAuth(e?: React.FormEvent) {
        e?.preventDefault();

        const { isValid, errors: valErrors } = validateForm({ email, password }, {
            email: validators.email,
            password: (val: string) => validators.nonEmpty(val, 'Password'),
        });
        if (!isValid) { setErrors(valErrors); return; }

        setLoading(true);
        try {
            if (mode === 'signup') {
                const { data: { session: cur } } = await supabase.auth.getSession();
                const isAnon = cur?.user?.is_anonymous || !cur?.user?.email;

                // Even if anonymous, we should call signUp to convert the user in Supabase Auth.
                // Supabase handles the conversion automatically if a session exists.
                const { data, error } = await supabase.auth.signUp({
                    email, password,
                });

                if (error) {
                    if (error.message.includes('already registered')) {
                        showToast(t('auth.alreadyRegisteredDesc'), 'success');
                        setMode('login');
                        setLoading(false);
                        return;
                    }
                    throw error;
                }

                if (data.user) {
                    // Refresh identity cache and locally stored state
                    identityAPI.clearCache();
                    const internalId = await identityAPI.getMyInternalId();
                    
                    if (internalId) {
                        // The database trigger will handle setting is_anonymous = false,
                        // but we can proactively refresh our local currentUser state.
                        const { data: profile } = await supabase
                            .from('users')
                            .select('id, email, is_anonymous, full_name')
                            .eq('id', internalId)
                            .maybeSingle();
                        setCurrentUser(profile);
                    }

                    showToast(t('auth.signupSuccess') || 'Account created!', 'success');

                    const hasGuestData = await GuestDataSync.hasGuestData();
                    if (hasGuestData && internalId) {
                        setNewUserId(internalId);
                        setShowSyncModal(true);
                    } else {
                        // Small delay to let DB triggers finish
                        setTimeout(() => onSuccess?.(), 500);
                    }
                } else {
                    showToast(t('auth.checkEmail') || 'Check your email for a confirmation link!', 'success');
                }
            } else {
                const { data, error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;

                if (data.user) {
                    identityAPI.clearCache();
                    const internalId = await identityAPI.getMyInternalId();
                    const pendingInvite = await AsyncStorage.getItem('pending_invite');
                    if (pendingInvite && internalId) {
                        try {
                            const invite = JSON.parse(pendingInvite);
                            if (invite.school_id) {
                                await supabase.from('users').update({ school_id: invite.school_id, role: invite.role || 'teacher' }).eq('id', internalId);
                                await AsyncStorage.removeItem('pending_invite');
                            }
                        } catch (_) { /* ignore */ }
                    }
                }

                onSuccess?.();
            }
        } catch (err: any) {
            handleAPIError(err);
        } finally {
            setLoading(false);
        }
    }

    // ── When mode changes via pill, reset email form visibility ──────────
    function switchMode(next: 'signup' | 'login') {
        setMode(next);
        setShowEmailForm(false);
        setErrors({});
    }

    // ─────────────────────────────────────────────────────────────────────
    return (
        <div className="as-root">
            {/* Toast */}
            {toast && (
                <div className={`as-toast as-toast--${toast.kind}`}>
                    {toast.msg}
                    <button className="as-toast-close" onClick={() => setToast(null)}>✕</button>
                </div>
            )}

            <div className="as-card">
                {/* Back button */}
                {onBack && (
                    <button className="as-back-btn" onClick={onBack} aria-label="Go back">
                        ← Back
                    </button>
                )}

                {/* Logo + title */}
                <div className="as-header">
                    <div className="as-logo">🪷</div>
                    <h1 className="as-title">Gurudevi</h1>
                    <p className="as-subtitle">
                        {t('auth.tagline') || 'Education born from love, built with love.'}
                    </p>
                </div>

                {/* Pill toggle */}
                <div className="as-pill-row" role="tablist" aria-label="Sign Up or Log In">
                    <button
                        role="tab"
                        aria-selected={mode === 'signup'}
                        className={`as-pill ${mode === 'signup' ? 'active' : ''}`}
                        onClick={() => switchMode('signup')}
                    >
                        {t('auth.signup') || 'Sign Up'}
                    </button>
                    <button
                        role="tab"
                        aria-selected={mode === 'login'}
                        className={`as-pill ${mode === 'login' ? 'active' : ''}`}
                        onClick={() => switchMode('login')}
                    >
                        {t('auth.login') || 'Log In'}
                    </button>
                </div>
                    <div className="as-methods">
                        {/* Google */}
                        <button
                            className="as-btn-google"
                            onClick={handleGoogleSignIn}
                            disabled={loading}
                        >
                            <span className="as-google-icon">G</span>
                            {mode === 'signup'
                                ? t('auth.signUpWithGoogle')
                                : t('auth.signInWithGoogle')}
                        </button>

                        {/* Email */}
                        <button
                            className="as-btn-email"
                            onClick={() => setShowEmailForm(true)}
                            disabled={loading}
                        >
                            ✉ {mode === 'signup'
                                ? (t('auth.signUpWithEmail') || 'Sign up with email')
                                : (t('auth.signInWithEmail') || 'Sign in with email')}
                        </button>
                    </div>

                {/* Email form */}
                {showEmailForm && (
                    <form className="as-form" onSubmit={handleEmailAuth} noValidate>
                        <h2 className="as-form-title">
                            {mode === 'signup'
                                ? (t('auth.createAccount') || 'Create Account')
                                : (t('auth.signInEmail') || 'Sign In with Email')}
                        </h2>

                        <div className="as-field">
                            <input
                                className={`as-input${errors.email ? ' error' : ''}`}
                                type="email"
                                placeholder={t('auth.email') || 'Email address'}
                                value={email}
                                onChange={e => { setEmail(e.target.value); setErrors(prev => ({ ...prev, email: '' })); }}
                                autoComplete="email"
                                autoFocus
                            />
                            {errors.email && <span className="as-error">{errors.email}</span>}
                        </div>

                        <div className="as-field">
                            <input
                                className={`as-input${errors.password ? ' error' : ''}`}
                                type="password"
                                placeholder={t('auth.password') || 'Password'}
                                value={password}
                                onChange={e => { setPassword(e.target.value); setErrors(prev => ({ ...prev, password: '' })); }}
                                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                            />
                            {errors.password && <span className="as-error">{errors.password}</span>}
                        </div>

                        <button className="as-btn-primary" type="submit" disabled={loading}>
                            {loading
                                ? (t('auth.processing') || 'Processing…')
                                : mode === 'signup'
                                    ? (t('auth.signup') || 'Sign Up')
                                    : (t('auth.login') || 'Log In')}
                        </button>

                        <button
                            type="button"
                            className="as-btn-link"
                            onClick={() => { setShowEmailForm(false); setErrors({}); }}
                        >
                            ← {t('auth.backToGoogle') || 'Back to Google sign in'}
                        </button>
                    </form>
                )}

                {/* Continue as guest */}
                {(!currentUser || currentUser?.is_anonymous) && onContinueAsGuest && (
                    <div className="as-guest-row">
                        <div className="as-divider" />
                        <button
                            className="as-btn-ghost"
                            onClick={onContinueAsGuest}
                            disabled={loading}
                        >
                            {t('auth.continueAsGuest') || 'Continue as Guest'}
                        </button>
                    </div>
                )}
            </div>

            {/* Guest data sync modal */}
            <GuestDataSyncModal
                isOpen={showSyncModal}
                userId={newUserId}
                onSyncComplete={() => { setShowSyncModal(false); onSuccess?.(); }}
                onClose={() => setShowSyncModal(false)}
            />

            {/* ── Scoped CSS ── */}
            <style>{`
                .as-root {
                    position: fixed;
                    inset: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: var(--background, #F5EDD6);
                    font-family: var(--font-body, 'DM Sans', sans-serif);
                    padding: 16px;
                    overflow-y: auto;
                }

                .as-card {
                    background: var(--glass-surface, rgba(255,255,255,0.75));
                    backdrop-filter: blur(16px);
                    -webkit-backdrop-filter: blur(16px);
                    border: 1px solid var(--border, rgba(42,35,24,0.1));
                    border-radius: 24px;
                    padding: 40px 36px;
                    width: 100%;
                    max-width: 420px;
                    box-shadow: 0 24px 64px rgba(42,35,24,0.12);
                    display: flex;
                    flex-direction: column;
                    gap: 24px;
                }

                /* Back button */
                .as-back-btn {
                    background: none;
                    border: none;
                    cursor: pointer;
                    color: var(--ink-ghost, #7A6E5F);
                    font-size: 14px;
                    font-family: inherit;
                    padding: 0;
                    align-self: flex-start;
                    transition: color 0.2s;
                }
                .as-back-btn:hover { color: var(--ink, #2A2318); }

                /* Header */
                .as-header { text-align: center; display: flex; flex-direction: column; gap: 8px; align-items: center; }
                .as-logo { font-size: 44px; line-height: 1; }
                .as-title {
                    font-size: 26px;
                    font-weight: 800;
                    color: var(--action, #D4843A);
                    margin: 0;
                    letter-spacing: -0.5px;
                }
                .as-subtitle {
                    font-size: 14px;
                    color: var(--ink-ghost, #7A6E5F);
                    margin: 0;
                    line-height: 1.5;
                    max-width: 300px;
                }

                /* Pill toggle */
                .as-pill-row {
                    display: flex;
                    background: var(--background, #F5EDD6);
                    border: 1px solid var(--border, rgba(42,35,24,0.12));
                    border-radius: 50px;
                    padding: 4px;
                    gap: 4px;
                    align-self: center;
                }
                .as-pill {
                    flex: 1;
                    padding: 10px 28px;
                    border-radius: 50px;
                    border: none;
                    font-size: 14px;
                    font-weight: 600;
                    font-family: inherit;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    color: var(--ink-ghost, #7A6E5F);
                    background: transparent;
                    white-space: nowrap;
                }
                .as-pill.active {
                    background: var(--action, #D4843A);
                    color: #F5EDD6;
                    box-shadow: 0 2px 8px rgba(212,132,58,0.25);
                }
                .as-pill:hover:not(.active) {
                    background: rgba(212,132,58,0.06);
                    color: var(--ink, #2A2318);
                }

                /* Auth methods */
                .as-methods { display: flex; flex-direction: column; gap: 12px; }

                /* Google button */
                .as-btn-google {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 12px;
                    padding: 16px 24px;
                    border-radius: 14px;
                    background: var(--action, #D4843A);
                    color: #F5EDD6;
                    font-size: 15px;
                    font-weight: 700;
                    font-family: inherit;
                    border: none;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    width: 100%;
                }
                .as-btn-google:hover:not(:disabled) {
                    filter: brightness(1.06);
                    transform: translateY(-1px);
                    box-shadow: 0 6px 18px rgba(212,132,58,0.3);
                }
                .as-btn-google:disabled { opacity: 0.55; cursor: not-allowed; }

                .as-google-icon {
                    width: 26px;
                    height: 26px;
                    border-radius: 50%;
                    background: #fff;
                    color: #4285F4;
                    font-size: 15px;
                    font-weight: 900;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }

                /* Email button */
                .as-btn-email {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    padding: 14px 24px;
                    border-radius: 14px;
                    background: transparent;
                    border: 1.5px solid var(--border, rgba(42,35,24,0.18));
                    color: var(--ink, #2A2318);
                    font-size: 14px;
                    font-weight: 600;
                    font-family: inherit;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    width: 100%;
                }
                .as-btn-email:hover:not(:disabled) {
                    background: var(--glass-surface, rgba(255,255,255,0.7));
                    border-color: var(--ink-ghost, #7A6E5F);
                }
                .as-btn-email:disabled { opacity: 0.5; cursor: not-allowed; }

                /* Primary button (submit) */
                .as-btn-primary {
                    padding: 15px 24px;
                    border-radius: 14px;
                    background: var(--action, #D4843A);
                    color: #F5EDD6;
                    font-size: 15px;
                    font-weight: 700;
                    font-family: inherit;
                    border: none;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    width: 100%;
                }
                .as-btn-primary:hover:not(:disabled) {
                    filter: brightness(1.06);
                    transform: translateY(-1px);
                    box-shadow: 0 6px 18px rgba(212,132,58,0.3);
                }
                .as-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

                /* Link button */
                .as-btn-link {
                    background: none;
                    border: none;
                    cursor: pointer;
                    color: var(--ink-ghost, #7A6E5F);
                    font-size: 13px;
                    font-family: inherit;
                    padding: 4px 0;
                    text-align: center;
                    transition: color 0.2s;
                    width: 100%;
                }
                .as-btn-link:hover { color: var(--ink, #2A2318); text-decoration: underline; }

                /* Ghost button (continue as guest) */
                .as-btn-ghost {
                    padding: 13px 24px;
                    border-radius: 14px;
                    background: transparent;
                    border: 1.5px solid var(--action, #D4843A);
                    color: var(--action, #D4843A);
                    font-size: 14px;
                    font-weight: 700;
                    font-family: inherit;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    width: 100%;
                }
                .as-btn-ghost:hover:not(:disabled) {
                    background: rgba(212,132,58,0.06);
                }
                .as-btn-ghost:disabled { opacity: 0.5; cursor: not-allowed; }

                /* Email form */
                .as-form { display: flex; flex-direction: column; gap: 14px; }
                .as-form-title {
                    font-size: 17px;
                    font-weight: 700;
                    color: var(--ink, #2A2318);
                    margin: 0 0 4px;
                }
                .as-field { display: flex; flex-direction: column; gap: 4px; }
                .as-input {
                    padding: 13px 16px;
                    border-radius: 12px;
                    border: 1.5px solid var(--border, rgba(42,35,24,0.15));
                    background: rgba(255,255,255,0.7);
                    font-size: 15px;
                    color: var(--ink, #2A2318);
                    font-family: inherit;
                    outline: none;
                    transition: border-color 0.2s, box-shadow 0.2s;
                    width: 100%;
                    box-sizing: border-box;
                }
                .as-input:focus {
                    border-color: var(--action, #D4843A);
                    box-shadow: 0 0 0 3px rgba(212,132,58,0.12);
                }
                .as-input.error { border-color: #ef4444; }
                .as-input::placeholder { color: var(--ink-ghost, #7A6E5F); }
                .as-error { font-size: 12px; color: #ef4444; }

                /* Divider */
                .as-guest-row { display: flex; flex-direction: column; gap: 14px; }
                .as-divider {
                    height: 1px;
                    background: var(--border, rgba(42,35,24,0.1));
                }

                /* Already signed in */
                .as-already-signed { display: flex; flex-direction: column; gap: 10px; align-items: center; }
                .as-muted { font-size: 13px; color: var(--ink-ghost, #7A6E5F); margin: 0; }

                /* Toast */
                .as-toast {
                    position: fixed;
                    bottom: 24px;
                    left: 50%;
                    transform: translateX(-50%);
                    padding: 12px 20px;
                    border-radius: 12px;
                    font-size: 14px;
                    font-family: inherit;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    z-index: 9999;
                    box-shadow: 0 8px 24px rgba(0,0,0,0.15);
                    max-width: 90vw;
                    animation: toastIn 0.25s ease;
                }
                .as-toast--success { background: #166534; color: #fff; }
                .as-toast--error { background: #991B1B; color: #fff; }
                .as-toast-close {
                    background: none;
                    border: none;
                    cursor: pointer;
                    color: inherit;
                    font-size: 14px;
                    padding: 0;
                    opacity: 0.8;
                    flex-shrink: 0;
                }
                .as-toast-close:hover { opacity: 1; }

                @keyframes toastIn { from { opacity: 0; transform: translateX(-50%) translateY(12px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }

                @media (max-width: 480px) {
                    .as-card { padding: 28px 20px; border-radius: 20px; }
                    .as-pill { padding: 9px 18px; }
                }
            `}</style>
        </div>
    );
}
