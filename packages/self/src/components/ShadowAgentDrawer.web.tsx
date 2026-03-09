/**
 * ShadowAgentDrawer.web.tsx
 *
 * Web override. The native version uses RN Modal + react-native-reanimated.
 * On web we deliver the same glowing orb trigger + reflection drawer using
 * a CSS slide-up panel with the same thought seeds.
 * Metro resolves this over ShadowAgentDrawer.tsx on the web platform.
 */
import React, { useState, useMemo } from 'react';
import { X } from 'lucide-react-native';

const THOUGHT_SEEDS = [
    'What is weighing on you that you haven\'t spoken aloud?',
    'Where do you feel peace right now — even a flicker of it?',
    'What are you holding for others that isn\'t yours to carry?',
    'What would you let go of, if you knew it was safe to?',
    'Where did joy surprise you today?',
    'What does your body need right now?',
    'What truth are you dancing around?',
    'Who have you been, today?',
    'What forgiveness is waiting — for yourself or another?',
    'What is asking to be seen?',
];

export default function ShadowAgentDrawer() {
    const [isOpen, setIsOpen] = useState(false);
    const seed = useMemo(() => THOUGHT_SEEDS[Math.floor(Math.random() * THOUGHT_SEEDS.length)], [isOpen]);

    return (
        <>
            {/* Floating orb trigger */}
            <button
                onClick={() => setIsOpen(true)}
                title="Open reflection space"
                style={{
                    position: 'fixed',
                    bottom: '80px',
                    right: '24px',
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    border: 'none',
                    background: 'radial-gradient(circle, rgba(139,92,246,0.8) 0%, rgba(139,92,246,0.2) 100%)',
                    boxShadow: '0 0 20px rgba(139,92,246,0.4)',
                    cursor: 'pointer',
                    fontSize: '20px',
                    animation: 'orb-pulse 3s ease-in-out infinite',
                    zIndex: 100,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                🌑
            </button>

            {/* Drawer overlay */}
            {isOpen && (
                <div
                    style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 200, display: 'flex', alignItems: 'flex-end' }}
                    onClick={() => setIsOpen(false)}
                >
                    <div
                        onClick={e => e.stopPropagation()}
                        style={{
                            width: '100%',
                            maxWidth: '600px',
                            margin: '0 auto',
                            background: 'linear-gradient(180deg, #1a0a2e 0%, #0f0520 100%)',
                            borderRadius: '20px 20px 0 0',
                            padding: '32px 28px 40px',
                            animation: 'slide-up 0.3s ease',
                        }}
                    >
                        {/* Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
                            <div>
                                <div style={{ fontSize: '11px', fontWeight: '800', letterSpacing: '2px', color: 'rgba(139,92,246,0.8)', textTransform: 'uppercase' }}>The Quiet Space</div>
                                <div style={{ fontSize: '20px', fontWeight: '800', color: '#F5F3FF', marginTop: '4px' }}>Shadow Agent</div>
                            </div>
                            <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                                <X size={20} color="rgba(255,255,255,0.5)" />
                            </button>
                        </div>

                        {/* Thought seed */}
                        <div style={{ padding: '24px', background: 'rgba(139,92,246,0.12)', borderRadius: '14px', border: '1px solid rgba(139,92,246,0.25)', marginBottom: '20px' }}>
                            <div style={{ fontSize: '11px', fontWeight: '700', color: 'rgba(139,92,246,0.8)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
                                A seed for reflection
                            </div>
                            <p style={{ fontSize: '15px', lineHeight: '1.7', color: '#E9D5FF', fontStyle: 'italic', margin: 0 }}>
                                "{seed}"
                            </p>
                        </div>

                        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', textAlign: 'center', margin: 0, lineHeight: '1.6' }}>
                            This is not a conversation. It is a mirror.{'\n'}
                            Whatever arises here is yours alone.
                        </p>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes orb-pulse { 0%,100%{box-shadow:0 0 20px rgba(139,92,246,0.4)} 50%{box-shadow:0 0 32px rgba(139,92,246,0.7)} }
                @keyframes slide-up { from{transform:translateY(100%)} to{transform:translateY(0)} }
            `}</style>
        </>
    );
}
