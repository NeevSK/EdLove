import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase, validators, validateForm } from '@repo/core';

interface AuthScreenProps {
    onContinueAsGuest?: () => void;
    onSuccess?: () => void;
    onBack?: () => void;
    initialMode?: 'login' | 'signup';
}

const ENTRY_PILLARS = ['Self', 'Classroom', 'Community', 'Library'];

export function AuthScreenWeb({
    onContinueAsGuest,
    onSuccess,
    onBack,
    initialMode,
}: AuthScreenProps) {
    const { t } = useTranslation();
    const [mode, setMode] = useState<'signup' | 'login'>(initialMode === 'login' ? 'login' : 'signup');
    const [showEmailForm, setShowEmailForm] = useState(initialMode === 'login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [toast, setToast] = useState<{ msg: string; kind: 'success' | 'error' } | null>(null);

    const modeCopy = mode === 'signup'
        ? {
            eyebrow: 'Create your sanctuary identity',
            title: 'Begin inside Gurudevi',
            subtitle: 'Keep your first step calm, luminous, and connected to your learning sanctuary.',
            primary: 'Create Account',
            google: 'Continue with Google',
            email: 'Continue with Email',
        }
        : {
            eyebrow: 'Return to your sanctuary',
            title: 'Welcome back to Gurudevi',
            subtitle: 'Pick up your journey where you left it across self, classroom, community, and library.',
            primary: 'Log In',
            google: 'Sign in with Google',
            email: 'Sign in with Email',
        };

    const handleGoogleAuth = async () => {
        setLoading(true);
        setErrors({});
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: { redirectTo: window.location.origin },
            });
            if (error) throw error;
        } catch (err: any) {
            setErrors({ _form: err.message || 'Google sign-in failed' });
        } finally {
            setLoading(false);
        }
    };

    const handleEmailAuth = async () => {
        setLoading(true);
        setErrors({});

        const validation = validateForm(
            { email, password },
            { email: validators.email, password: validators.password }
        );

        if (!validation.isValid) {
            setErrors(validation.errors);
            setLoading(false);
            return;
        }

        try {
            if (mode === 'signup') {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: { emailRedirectTo: window.location.origin },
                });
                if (error) throw error;
                setToast({ msg: 'Check your email to confirm your account', kind: 'success' });
            } else {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
                onSuccess?.();
            }
        } catch (err: any) {
            setErrors({ _form: err.message || 'Authentication failed' });
        } finally {
            setLoading(false);
        }
    };

    const handleGuest = async () => {
        setLoading(true);
        try {
            onContinueAsGuest?.();
        } catch (err: any) {
            setErrors({ _form: err.message || 'Guest mode failed' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-screen"            <div className="auth-orb auth-orb-one" /            ><div className="auth-orb auth-orb-two" /            ><div className="auth-shell"                <section className="auth-story sanctuary-card"                    <div className="auth-story-inner"                        <div className="auth-brand-pill">Gurudevi Sanctuary</div                        ><div className="auth-hero"                            <div className="auth-logo-well"                                <div className="auth-logo-core">\u2726</div                            ></div                            <div className="auth-copy"                                <p className="auth-eyebrow">{modeCopy.eyebrow}</p                                <h1>{modeCopy.title}</h1                                <p className="auth-subtitle">{modeCopy.subtitle}</p                            </div                        </div
                        <div className="auth-pillar-row"                            {ENTRY_PILLARS.map((pillar) => (
                                <span key={pillar} className="auth-pillar"                                    {pillar}
                                </span                            ))}>
                        </div>
                        <div className="auth-guidance sanctuary-hero-panel"                            <div                                <p >className="auth-guidance-label">Why this step matters</p                                ><p className="auth-guidance-text"                                    Your account keeps learning, invitations, and profile presence gathered into one living place without changing how you use the app.
                                </p                            </div                            <div className="auth-guidance-grid"                                <div                                    <strong>Gentle entry</strong                                    <span>Start with Google or email.</span                                ></div                                <div                                    <strong>Guest-safe</strong                                    <span>Browse first when logging in later feels better.</span                                </div                            </div                        </div                    </div                </section
                <section className="auth-panel sanctuary-card"                    {onBack && (
                        <button onClick={onBack} className="auth-back-button"                            <span>\u2190</span                            ><span>Back</span                        ></button                    )}

                    <div className="auth-panel-header"                        <div className="auth-panel-kicker">{mode === 'signup' ? 'Identity' : 'Return'}</div                        ><div className="auth-mode-toggle"                            <button
                                onClick={() => {
                                    setMode('signup');
                                    setShowEmailForm(false);
                                    setErrors({});
                                    setToast(null);
                                }}
                                className={`mode-button ${mode === 'signup' ? 'active' : ''}`}
                                                            Sign Up
                            </button                            <button
                                onClick={() => {
                                    setMode('login');
                                    setShowEmailForm(true);
                                    setErrors({});
                                    setToast(null);
                                }}
                                className={`mode-button ${mode === 'login' ? 'active' : ''}`}
                                                            Log In
                            </button                        </div                        <h2>{mode === 'signup' ? 'Choose your path in' : 'Reconnect with'} Gurudevi</h2                        ><p                            {mode === 'signup'
                                ? 'Create a held, cross-device identity when you are ready.'
                                : 'Use the path that already belongs to you.'}
                        </p                    </div
                    <div className="auth-form-stack"                        <button onClick={handleGoogleAuth} disabled={loading} className="auth-primary-button auth-google-button"                            <span className="auth-google-mark">G</span                            ><span>{modeCopy.google}</span                        ></button
                        {!showEmailForm && (
                            <button
                                onClick={() => {
                                    setShowEmailForm(true);
                                    setErrors({});
                                    setToast(null);
                                }}
                                className="auth-secondary-button"
                                                            {modeCopy.email}
                            </button                        )}

                        {showEmailForm && (
                            <div className="auth-email-shell"                                <div className="auth-email-header"                                    <p>Email path</p                                    ><span>{mode === 'signup' ? 'Create calmly' : 'Enter directly'}</span                                ></div
                                <label className="auth-field"                                    <span>Email</span                                    <input
                                        type="email"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="auth-input"
                                        autoComplete="email"
                                    /                                    {errors.email && <small>{errors.email}</small>}
                                </label>
                                <label className="auth-field"                                    <span>Password</span                                    ><input
                                        type="password"
                                        placeholder="Your password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="auth-input"
                                        autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                                    /                                    >{errors.password && <small>{errors.password}</small>}
                                </label>
                                <button onClick={handleEmailAuth} disabled={loading} className="auth-primary-button auth-submit-button"                                    {loading ? 'Please wait...' : modeCopy.primary}
                                </button>
                                <button
                                    className="auth-inline-link"
                                    onClick={() => {
                                        setShowEmailForm(false);
                                        setErrors({});
                                    }}
                                                                    Back to Google
                                </button                            ></div                        )}

                        {mode === 'login' && (
                            <button onClick={handleGuest} disabled={loading} className="auth-guest-button"                                Continue as Guest
                            </button                        )}>
                    </div>
                    {errors._form && <div className="auth-error">{errors._form}</div>}
                    {toast && <div className={`auth-toast ${toast.kind}`}>{toast.msg}</div>}
                </section            </div
            <style>{`
                .auth-screen {
                    position: relative;
                    min-height: 100vh;
                    padding: 32px;
                    background:
                        radial-gradient(circle at 18% 18%, rgba(125, 212, 192, 0.16), transparent 28%),
                        radial-gradient(circle at 84% 24%, rgba(184, 169, 224, 0.18), transparent 24%),
                        linear-gradient(160deg, var(--background) 0%, var(--background-alt) 52%, rgba(252, 249, 242, 0.96) 100%);
                    overflow: hidden;
                }

                .auth-orb {
                    position: absolute;
                    border-radius: 999px;
                    pointer-events: none;
                    filter: blur(12px);
                    opacity: 0.6;
                }

                .auth-orb-one {
                    top: 8%;
                    left: -80px;
                    width: 220px;
                    height: 220px;
                    background: radial-gradient(circle, rgba(125, 212, 192, 0.35), transparent 70%);
                }

                .auth-orb-two {
                    right: -100px;
                    bottom: 4%;
                    width: 260px;
                    height: 260px;
                    background: radial-gradient(circle, rgba(212, 132, 58, 0.24), transparent 68%);
                }

                .auth-shell {
                    position: relative;
                    z-index: 1;
                    max-width: 1180px;
                    margin: 0 auto;
                    min-height: calc(100vh - 64px);
                    display: grid;
                    grid-template-columns: minmax(0, 1.15fr) minmax(360px, 0.85fr);
                    gap: 28px;
                    align-items: stretch;
                }

                .auth-story,
                .auth-panel {
                    padding: 32px;
                }

                .auth-story {
                    background:
                        linear-gradient(180deg, rgba(252, 249, 242, 0.72), rgba(252, 249, 242, 0.42)),
                        radial-gradient(circle at top left, rgba(125, 212, 192, 0.16), transparent 32%);
                }

                .auth-story-inner {
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    gap: 28px;
                }

                .auth-brand-pill,
                .auth-pillar {
                    width: fit-content;
                    padding: 8px 14px;
                    border-radius: 999px;
                    border: 1px solid rgba(212, 132, 58, 0.22);
                    background: rgba(252, 249, 242, 0.58);
                    color: var(--action);
                    font-size: 12px;
                    font-weight: 700;
                    letter-spacing: 0.08em;
                    text-transform: uppercase;
                }

                .auth-hero {
                    display: flex;
                    flex-direction: column;
                    gap: 22px;
                }

                .auth-logo-well {
                    width: 132px;
                    height: 132px;
                    border-radius: 38px;
                    display: grid;
                    place-items: center;
                    background:
                        linear-gradient(180deg, rgba(252, 249, 242, 0.84), rgba(252, 249, 242, 0.52)),
                        radial-gradient(circle at 30% 25%, rgba(125, 212, 192, 0.28), transparent 58%);
                    border: 1px solid rgba(212, 132, 58, 0.16);
                    box-shadow: 0 24px 64px rgba(121, 93, 48, 0.12);
                }

                .auth-logo-core {
                    width: 76px;
                    height: 76px;
                    border-radius: 24px;
                    display: grid;
                    place-items: center;
                    font-size: 32px;
                    color: var(--action);
                    background: linear-gradient(180deg, rgba(255,255,255,0.85), rgba(252, 249, 242, 0.68));
                }

                .auth-eyebrow {
                    margin: 0 0 10px;
                    color: var(--action);
                    font-size: 12px;
                    font-weight: 800;
                    letter-spacing: 0.12em;
                    text-transform: uppercase;
                }

                .auth-copy h1 {
                    margin: 0 0 14px;
                    font-size: clamp(2.5rem, 4vw, 4.6rem);
                    line-height: 0.95;
                    letter-spacing: -0.07em;
                    color: var(--ink);
                }

                .auth-subtitle {
                    max-width: 42rem;
                    margin: 0;
                    color: var(--ink-ghost);
                    font-size: 1rem;
                    line-height: 1.75;
                }

                .auth-pillar-row {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 10px;
                }

                .auth-guidance {
                    display: grid;
                    gap: 18px;
                    padding: 24px;
                }

                .auth-guidance-label {
                    margin: 0 0 6px;
                    color: var(--ink-ghost);
                    font-size: 11px;
                    font-weight: 800;
                    letter-spacing: 0.12em;
                    text-transform: uppercase;
                }

                .auth-guidance-text {
                    margin: 0;
                    color: var(--ink);
                    line-height: 1.8;
                    font-size: 0.97rem;
                }

                .auth-guidance-grid {
                    display: grid;
                    grid-template-columns: repeat(2, minmax(0, 1fr));
                    gap: 12px;
                }

                .auth-guidance-grid div {
                    display: grid;
                    gap: 4px;
                    padding: 14px 16px;
                    border-radius: 18px;
                    background: rgba(252, 249, 242, 0.5);
                    border: 1px solid rgba(121, 93, 48, 0.08);
                }

                .auth-guidance-grid strong {
                    color: var(--ink);
                    font-size: 0.95rem;
                }

                .auth-guidance-grid span {
                    color: var(--ink-ghost);
                    font-size: 0.9rem;
                    line-height: 1.55;
                }

                .auth-panel {
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    gap: 22px;
                    background:
                        linear-gradient(180deg, rgba(252, 249, 242, 0.78), rgba(252, 249, 242, 0.62)),
                        radial-gradient(circle at top right, rgba(184, 169, 224, 0.12), transparent 30%);
                }

                .auth-back-button,
                .auth-inline-link {
                    width: fit-content;
                    border: none;
                    background: none;
                    color: var(--ink-ghost);
                    cursor: pointer;
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 0.95rem;
                    font-family: inherit;
                    padding: 0;
                }

                .auth-panel-header {
                    display: grid;
                    gap: 14px;
                }

                .auth-panel-kicker {
                    color: var(--action);
                    font-size: 11px;
                    font-weight: 800;
                    letter-spacing: 0.12em;
                    text-transform: uppercase;
                }

                .auth-panel-header h2 {
                    margin: 0;
                    font-size: clamp(1.8rem, 2.6vw, 2.6rem);
                    line-height: 1.05;
                    letter-spacing: -0.05em;
                    color: var(--ink);
                }

                .auth-panel-header p {
                    margin: 0;
                    color: var(--ink-ghost);
                    line-height: 1.7;
                }

                .auth-mode-toggle {
                    display: inline-grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 4px;
                    padding: 4px;
                    width: min(100%, 280px);
                    border-radius: 999px;
                    background: rgba(121, 93, 48, 0.07);
                    border: 1px solid rgba(121, 93, 48, 0.09);
                }

                .mode-button {
                    border: none;
                    border-radius: 999px;
                    padding: 12px 16px;
                    background: transparent;
                    color: var(--ink-ghost);
                    cursor: pointer;
                    font-weight: 700;
                    font-family: inherit;
                    transition: 180ms ease;
                }

                .mode-button.active {
                    background: linear-gradient(180deg, var(--action), var(--action-2));
                    color: var(--text-on-action);
                    box-shadow: 0 12px 26px rgba(212, 132, 58, 0.18);
                }

                .auth-form-stack {
                    display: grid;
                    gap: 14px;
                }

                .auth-primary-button,
                .auth-secondary-button,
                .auth-guest-button {
                    min-height: 56px;
                    border-radius: 18px;
                    cursor: pointer;
                    font-family: inherit;
                    font-size: 0.98rem;
                    font-weight: 700;
                    transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease;
                }

                .auth-primary-button:hover:not(:disabled),
                .auth-secondary-button:hover:not(:disabled),
                .auth-guest-button:hover:not(:disabled) {
                    transform: translateY(-1px);
                }

                .auth-google-button,
                .auth-submit-button {
                    border: none;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 12px;
                    background: linear-gradient(180deg, var(--action), var(--action-2));
                    color: var(--text-on-action);
                    box-shadow: 0 18px 34px rgba(212, 132, 58, 0.16);
                }

                .auth-google-mark {
                    width: 28px;
                    height: 28px;
                    display: grid;
                    place-items: center;
                    border-radius: 999px;
                    background: rgba(252, 249, 242, 0.9);
                    color: #4285F4;
                    font-weight: 800;
                }

                .auth-secondary-button,
                .auth-guest-button {
                    border: 1px solid rgba(121, 93, 48, 0.14);
                    background: rgba(252, 249, 242, 0.54);
                    color: var(--ink);
                }

                .auth-email-shell {
                    display: grid;
                    gap: 14px;
                    padding: 18px;
                    border-radius: 24px;
                    background: rgba(252, 249, 242, 0.55);
                    border: 1px solid rgba(121, 93, 48, 0.1);
                }

                .auth-email-header {
                    display: flex;
                    align-items: baseline;
                    justify-content: space-between;
                    gap: 12px;
                    flex-wrap: wrap;
                }

                .auth-email-header p,
                .auth-email-header span {
                    margin: 0;
                }

                .auth-email-header p {
                    color: var(--ink);
                    font-weight: 700;
                }

                .auth-email-header span {
                    color: var(--ink-ghost);
                    font-size: 0.9rem;
                }

                .auth-field {
                    display: grid;
                    gap: 8px;
                    color: var(--ink);
                    font-size: 0.92rem;
                    font-weight: 600;
                }

                .auth-field small {
                    color: var(--error);
                    font-size: 0.8rem;
                }

                .auth-input {
                    width: 100%;
                    min-height: 52px;
                    padding: 0 16px;
                    border-radius: 16px;
                    border: 1px solid rgba(121, 93, 48, 0.16);
                    background: rgba(255, 255, 255, 0.55);
                    color: var(--ink);
                    font-size: 0.96rem;
                    font-family: inherit;
                    box-sizing: border-box;
                    outline: none;
                    transition: border-color 180ms ease, box-shadow 180ms ease;
                }

                .auth-input:focus {
                    border-color: rgba(212, 132, 58, 0.55);
                    box-shadow: 0 0 0 4px rgba(212, 132, 58, 0.12);
                }

                .auth-error,
                .auth-toast {
                    padding: 14px 16px;
                    border-radius: 18px;
                    font-size: 0.92rem;
                    line-height: 1.55;
                }

                .auth-error,
                .auth-toast.error {
                    background: rgba(194, 72, 72, 0.08);
                    border: 1px solid rgba(194, 72, 72, 0.16);
                    color: var(--error);
                }

                .auth-toast.success {
                    background: rgba(77, 145, 98, 0.08);
                    border: 1px solid rgba(77, 145, 98, 0.16);
                    color: var(--moss);
                }

                button:disabled {
                    opacity: 0.56;
                    cursor: not-allowed;
                    transform: none;
                }

                @media (max-width: 960px) {
                    .auth-screen {
                        padding: 18px;
                    }

                    .auth-shell {
                        min-height: auto;
                        grid-template-columns: 1fr;
                    }

                    .auth-story,
                    .auth-panel {
                        padding: 24px;
                    }

                    .auth-guidance-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style        </div    );
}

export default AuthScreenWeb;
