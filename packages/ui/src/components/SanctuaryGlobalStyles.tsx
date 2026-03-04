import React from 'react';
import { Platform } from 'react-native';
import { useTheme } from '../hooks/useTheme';

/**
 * SanctuaryGlobalStyles (Web-only)
 * 
 * Injects global CSS for the web platform to resolve "Aesthetic Decay"
 * and align with superior browser standards (e.g., custom scrollbars).
 */
export function SanctuaryGlobalStyles() {
    if (Platform.OS !== 'web') return null;

    const { accent, glass, text, isDark, gradientNodes } = useTheme();

    const css = `
    /* ── FONTS ── */
    @import url('https://fonts.googleapis.com/css2?family=IM+Fell+English:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');

    /* ── TOKENS ── */
    :root {
      /* Sanctuary Core Tokens (Dynamic) */
      --color-background: ${gradientNodes[0]};
      --color-text-primary: ${text.primary};
      --color-text-secondary: ${text.secondary};
      --color-accent: ${accent.action};
      --color-glass-border: ${glass.surface.border};

      /* High-Fidelity Design Palette (Vellum/Ink) */
      --water:       #3a7a9a;
      --water-glow:  rgba(90,154,186,0.25);
      --moss:        #4a7a5a;
      --moss-glow:   rgba(74,122,90,0.25);
      --lotus:       #c05878;
      --lotus-glow:  rgba(192,88,120,0.2);
      --gold:        #a07830;
      --gold-glow:   rgba(160,120,48,0.2);

      --ink:         ${isDark ? text.primary : '#2a2820'};
      --ink-soft:    ${text.secondary};
      --ink-ghost:   #9a9080;

      --surface:     ${glass.surface.bg};
      --border:      ${glass.surface.border};
      --border-light:rgba(255,255,255,0.7);

      --font-display:'IM Fell English', serif;
      --font-body:   'DM Sans', sans-serif;

      --top-bar-h:   56px;
      --sidebar-w:   240px;
      --bp-tablet:   768px;
      --bp-desktop:  1024px;
      
      /* Bridge Variables for existing components */
      --sanctuary-primary: ${gradientNodes[0]};
      --sanctuary-primary-rgb: ${isDark ? '26, 22, 16' : '245, 237, 214'};
      --sanctuary-text-primary: ${text.primary};
      --sanctuary-text-secondary: ${text.secondary};
      --sanctuary-saffron: ${accent.action};
    }

    /* ── RESET ── */
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; outline: none !important; }
    body { 
      font-family: var(--font-body); 
      color: var(--ink); 
      overflow-x: hidden; 
      overscroll-behavior-y: none;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      background-color: var(--color-background);
    }
    button { background: none; border: none; cursor: pointer; font-family: inherit; }

    /* ── WORLD BACKGROUND (VELLUM) ── */
    .world-bg {
      position: fixed;
      inset: 0;
      z-index: 0;
      background: ${isDark
            ? 'radial-gradient(circle at 50% 50%, #1a1b26 0%, #111218 100%)'
            : 'linear-gradient(135deg, #f8f4eb 0%, #edf1f4 100%)'};
    }
    
    /* Vellum Grain / Noise Overlay */
    .world-bg::after {
      content: '';
      position: absolute;
      inset: 0;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
      opacity: ${isDark ? 0.04 : 0.025};
      pointer-events: none;
    }

    /* ── SHELL ── */
    .web-shell {
      position: relative;
      z-index: 1;
      min-height: 100vh;
    }

    /* ── TOP BAR ── */
    .top-bar {
      position: fixed;
      top: 0; left: 0; right: 0;
      z-index: 100;
      height: var(--top-bar-h);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 24px;

      background: ${isDark ? 'rgba(26, 27, 38, 0.75)' : 'rgba(240, 248, 252, 0.78)'};
      backdrop-filter: blur(24px) saturate(1.5);
      -webkit-backdrop-filter: blur(24px) saturate(1.5);
      border-bottom: 1px solid var(--border);
      box-shadow: 0 1px 0 rgba(255,255,255,0.7), 0 4px 20px rgba(80,90,100,0.06);
    }

    .top-bar-left {
      display: flex;
      align-items: center;
      gap: 8px;
      text-decoration: none;
      flex-shrink: 0;
    }
    .brand-lotus {
      font-size: 18px;
      filter: drop-shadow(0 0 4px rgba(192,88,120,0.4));
      animation: lotusBreath 5s ease-in-out infinite;
    }
    @keyframes lotusBreath {
      0%,100% { filter: drop-shadow(0 0 4px rgba(192,88,120,0.35)); }
      50%      { filter: drop-shadow(0 0 10px rgba(192,88,120,0.65)); }
    }
    .brand-name {
      font-family: var(--font-display);
      font-size: 18px;
      font-style: italic;
      color: var(--ink);
      letter-spacing: 0.05em;
    }

    .top-bar-tabs {
      display: flex;
      align-items: center;
      gap: 2px;
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
    }
    .top-tab {
      padding: 6px 16px;
      border-radius: 6px;
      font-size: 12.5px;
      font-weight: 400;
      letter-spacing: 0.02em;
      color: var(--ink-ghost);
      border: 1px solid transparent;
      transition: all 0.25s;
      position: relative;
    }
    .top-tab:hover {
      color: var(--ink-soft);
      background: rgba(255,255,255,0.55);
    }
    .top-tab.active {
      color: var(--water);
      background: rgba(255,255,255,0.82);
      border-color: rgba(180,190,210,0.5);
      box-shadow: 0 1px 4px rgba(42,90,122,0.08),
                  inset 0 1px 0 rgba(255,255,255,0.9);
    }
    .top-tab.active::after {
      content: '';
      position: absolute;
      bottom: -7px; left: 50%;
      transform: translateX(-50%);
      width: 3px; height: 3px;
      border-radius: 50%;
      background: var(--water);
      box-shadow: 0 0 5px var(--water);
    }

    .top-bar-right {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-shrink: 0;
    }
    .bell-btn {
      position: relative;
      width: 34px; height: 34px;
      border-radius: 8px;
      background: rgba(255,255,255,0.55);
      border: 1px solid var(--border);
      display: flex; align-items: center; justify-content: center;
      font-size: 14px;
      color: var(--ink-ghost);
      transition: all 0.25s;
    }
    .bell-btn:hover {
      background: rgba(255,255,255,0.85);
      color: var(--ink-soft);
    }
    .bell-dot {
      position: absolute;
      top: 7px; right: 7px;
      width: 5px; height: 5px;
      border-radius: 50%;
      background: var(--lotus);
      animation: bellPulse 2.5s ease-out infinite;
    }
    @keyframes bellPulse {
      0%   { box-shadow: 0 0 0 0 rgba(192,88,120,0.6); }
      70%  { box-shadow: 0 0 0 5px rgba(192,88,120,0); }
      100% { box-shadow: 0 0 0 0 rgba(192,88,120,0); }
    }
    .profile-chip {
      display: flex; align-items: center; gap: 8px;
      padding: 4px 12px 4px 4px;
      border-radius: 100px;
      background: rgba(255,255,255,0.55);
      border: 1px solid var(--border);
      transition: all 0.25s;
    }
    .profile-chip:hover {
      background: rgba(255,255,255,0.85);
    }
    .profile-gem {
      width: 26px; height: 26px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--water), #5a9aba);
      display: flex; align-items: center; justify-content: center;
      font-size: 11px; font-weight: 500; color: white;
      box-shadow: 0 1px 4px rgba(42,90,122,0.25);
    }
    .profile-nm {
      font-size: 12px;
      color: var(--ink-soft);
      font-weight: 300;
    }

    /* ── BODY LAYOUT ── */
    .web-body {
      display: flex;
      padding-top: var(--top-bar-h);
      min-height: 100vh;
    }

    /* ── SIDEBAR ── */
    .sidebar {
      width: var(--sidebar-w);
      flex-shrink: 0;
      position: sticky;
      top: var(--top-bar-h);
      height: calc(100vh - var(--top-bar-h));
      overflow-y: auto;
      padding: 20px 12px;

      background: ${isDark ? 'rgba(26, 27, 38, 0.55)' : 'rgba(240, 248, 252, 0.55)'};
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border-right: 1px solid var(--border);
      transition: width 0.3s ease, transform 0.3s ease;
    }

    /* Collapsed sidebar */
    .sidebar.collapsed {
      width: 60px;
    }

    .sidebar.collapsed .sidebar-label {
      display: none;
    }

    .sidebar.collapsed .sidebar-item {
      justify-content: center;
      padding: 10px;
    }

    /* Sidebar toggle button */
    .sidebar-toggle {
      position: absolute;
      top: 12px;
      right: 12px;
      width: 24px;
      height: 24px;
      border-radius: 6px;
      border: 1px solid var(--border);
      background: rgba(255, 255, 255, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;
      z-index: 10;
    }

    .sidebar-toggle:hover {
      background: rgba(255, 255, 255, 0.95);
      border-color: var(--ink-soft);
    }

    .sidebar.collapsed .sidebar-toggle {
      right: 50%;
      transform: translateX(50%);
    }

    .sidebar-nav {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .sidebar-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 14px;
      border-radius: 10px;
      font-size: 13px;
      color: var(--ink-ghost);
      border: 1px solid transparent;
      transition: all 0.22s;
      text-align: left;
      width: 100%;
      background: none;
    }
    .sidebar-item:hover {
      color: var(--ink-soft);
      background: rgba(255,255,255,0.6);
    }
    .sidebar-item.active {
      color: var(--water);
      background: rgba(255,255,255,0.85);
      border-color: rgba(90,154,186,0.25);
      box-shadow: 0 1px 4px rgba(42,90,122,0.07),
                  inset 0 1px 0 rgba(255,255,255,0.9);
    }
    .sidebar-icon {
      font-size: 15px;
      width: 20px;
      text-align: center;
      flex-shrink: 0;
    }
    .sidebar-label {
      font-weight: 400;
      letter-spacing: 0.01em;
    }

    /* ── SCREEN CONTENT ── */
    .screen-content {
      flex: 1;
      min-width: 0;
      overflow-y: auto;
      padding: 40px 36px 80px;
    }

    .sanctuary-screen {
      max-width: 900px;
      margin: 0 auto;
    }

    /* ── SCROLLBAR ── */
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb {
      background: rgba(160,150,130,0.25);
      border-radius: 10px;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: rgba(160,150,130,0.45);
    }

    /* ── RESPONSIVE ── */
    @media (max-width: 1023px) {
      .sidebar { 
        position: fixed;
        left: 0;
        z-index: 1000;
        transform: translateX(-100%);
        transition: transform 0.3s ease;
      }
      
      .sidebar.mobile.expanded {
        transform: translateX(0);
      }
      
      .sidebar-toggle {
        display: none;
      }
      
      .screen-content.sidebar-expanded,
      .screen-content.sidebar-collapsed {
        padding: 32px 24px 80px;
      }
      
      .top-bar-tabs { gap: 0; }
      .top-tab { padding: 6px 12px; font-size: 12px; }
      .profile-nm { display: none; }
      .profile-chip { padding: 4px; }
    }

    @media (max-width: 767px) {
      .top-bar { 
        display: flex;
        position: fixed;
        z-index: 1001;
      }
      
      .sidebar.mobile {
        width: 280px;
        top: var(--top-bar-h);
        height: calc(100vh - var(--top-bar-h));
      }
      
      .web-body { 
        padding-top: var(--top-bar-h);
      }
      
      .screen-content { 
        padding: 20px 16px 100px;
      }
      
      /* Mobile menu toggle button in top bar */
      .mobile-menu-toggle {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        border-radius: 8px;
        border: 1px solid var(--border);
        background: rgba(255, 255, 255, 0.8);
        margin-right: 12px;
      }
      
      .mobile-menu-toggle:hover {
        background: rgba(255, 255, 255, 0.95);
      }
    }
    
    /* Main content responsive to sidebar state */
    .screen-content.sidebar-expanded {
      margin-left: 0;
      transition: margin-left 0.3s ease;
    }
    
    .screen-content.sidebar-collapsed {
      margin-left: 0;
      transition: margin-left 0.3s ease;
    }
    
    @media (min-width: 1024px) {
      .screen-content.sidebar-expanded {
        margin-left: var(--sidebar-w);
      }
      
      .screen-content.sidebar-collapsed {
        margin-left: 60px;
      }
    }

    /* community layout */
    .community-grid {
      display: grid;
      grid-template-columns: 200px 1fr 240px;
      gap: 24px;
      align-items: start;
    }

    @media (max-width: 1023px) {
      .community-grid {
        grid-template-columns: 1fr;
      }
      .community-sidebar,
      .community-panel { display: none; }
    }
    `;

    return (
        <style dangerouslySetInnerHTML={{ __html: css }} />
    );
}

