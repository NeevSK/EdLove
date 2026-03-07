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

      --top-bar-h:   64px;
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
      overflow: hidden; 
      overscroll-behavior-y: none;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      background-color: var(--color-background);
    }
    button { background: none; border: none; cursor: pointer; font-family: inherit; }

    /* ── APP SHELL (Flexbox Architecture) ── */
    .vellum-app-shell {
      display: flex;
      flex-direction: column;
      height: 100vh;
      width: 100vw;
      position: relative;
      z-index: 10;
    }

    .shell-body-core {
      display: flex;
      flex-direction: row;
      flex: 1;
      overflow: hidden;
      position: relative;
    }

    /* ── WORLD BACKGROUND (VELLUM) ── */
    .world-bg {
      position: fixed;
      inset: 0;
      z-index: -1;
      background: ${isDark
      ? 'radial-gradient(circle at 50% 50%, #1a1b26 0%, #111218 100%)'
      : 'linear-gradient(135deg, #f8f4eb 0%, #edf1f4 100%)'};
    }
    
    /* Vellum Grain / Noise Overlay for World */
    .world-bg::after {
      content: '';
      position: absolute;
      inset: 0;
      background: radial-gradient(circle at 70% 30%, var(--water-soft), transparent 60%),
                  radial-gradient(circle at 20% 80%, var(--lotus-soft), transparent 50%);
      opacity: 0.3;
      filter: blur(60px);
      z-index: 1;
    }

    /* ── TOP BAR ── */
    .top-bar {
      height: var(--top-bar-h);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 24px;
      flex-shrink: 0;
      z-index: 1100;

      background: ${isDark ? 'rgba(26, 27, 38, 0.45)' : 'rgba(255, 255, 255, 0.45)'};
      backdrop-filter: blur(28px) saturate(1.8);
      -webkit-backdrop-filter: blur(28px) saturate(1.8);
      border-bottom: 1px solid rgba(255, 255, 255, 0.2);
      box-shadow: 0 4px 30px rgba(0, 0, 0, 0.03);
    }

    .top-bar-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .brand-lotus { font-size: 24px; filter: drop-shadow(0 0 10px rgba(90, 154, 186, 0.4)); }
    .brand-name { 
      font-weight: 800; 
      font-size: 18px; 
      letter-spacing: -0.5px;
      background: linear-gradient(135deg, var(--ink), var(--water));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      font-family: var(--font-display);
      font-style: italic;
    }

    /* ── SIDEBAR ── */
    .sidebar {
      width: var(--sidebar-w);
      display: flex;
      flex-direction: column;
      padding: 0;
      flex-shrink: 0;
      z-index: 1000;
      transition: width 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      overflow: hidden;

      background: ${isDark ? 'rgba(26, 27, 38, 0.45)' : 'rgba(255, 255, 255, 0.3)'};
      backdrop-filter: blur(28px) saturate(1.8);
      -webkit-backdrop-filter: blur(28px) saturate(1.8);
      border-right: 1px solid rgba(255, 255, 255, 0.2);
    }
    .sidebar.collapsed { width: 60px; }
    .sidebar.collapsed .sidebar-item { justify-content: center; padding: 12px 0; gap: 0; }
    .sidebar.collapsed .sidebar-header { justify-content: center; padding: 0; }
    .sidebar.collapsed .sidebar-profile-btn { justify-content: center; padding: 12px 0; border-radius: 50%; width: 44px; margin: 0 auto; }
    .sidebar.collapsed .sidebar-group-label { display: none; }

    .sidebar-header {
      height: var(--top-bar-h);
      display: flex;
      align-items: center;
      padding: 0 16px;
      border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    }

    .sidebar-toggle {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 10px;
      background: rgba(255, 255, 255, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: var(--ink-soft);
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .sidebar-toggle:hover {
      background: rgba(255, 255, 255, 0.5);
      transform: scale(1.05);
    }

    .sidebar-group-label {
      font-size: 10px;
      font-weight: 800;
      color: var(--ink-ghost);
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .sidebar-nav {
      flex: 1;
      padding: 24px 16px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .sidebar-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 12px;
      border-radius: 12px;
      font-size: 14px;
      color: var(--ink-ghost);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      width: 100%;
    }
    .sidebar-item:hover {
      color: var(--ink-soft);
      background: rgba(255, 255, 255, 0.4);
      transform: translateX(4px);
    }
    .sidebar-item.active {
      color: var(--water);
      background: rgba(255, 255, 255, 0.8);
      border: 1px solid rgba(90, 154, 186, 0.2);
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
    }

    .sidebar-footer {
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .sidebar-divider {
      height: 1px;
      background: rgba(0, 0, 0, 0.05);
      margin-bottom: 8px;
    }

    .sidebar-profile-btn {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      border-radius: 16px;
      background: rgba(255, 255, 255, 0.4);
      border: 1px solid rgba(255, 255, 255, 0.2);
      cursor: pointer;
      width: 100%;
      text-align: left;
      transition: all 0.2s ease;
    }
    .sidebar-profile-btn:hover {
      transform: translateY(-2px);
      background: rgba(255, 255, 255, 0.6);
      box-shadow: var(--shadow-sm);
    }

    .profile-info {
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .profile-nm { font-weight: 700; color: var(--ink); font-size: 14px; white-space: nowrap; }
    .profile-status { font-size: 10px; color: var(--water); font-weight: 800; text-transform: uppercase; }

    .bell-dot {
      position: absolute;
      top: -2px;
      right: -2px;
      width: 8px;
      height: 8px;
      background: var(--lotus);
      border-radius: 50%;
      border: 1.5px solid white;
    }

    /* ── CARDS (THE HEART OF THE DEPTH) ── */
    .sanctuary-card {
      position: relative;
      border-radius: 20px;
      overflow: hidden;
      background: ${isDark
      ? 'rgba(40, 42, 58, 0.45)'
      : 'rgba(255, 255, 255, 0.5)'};
      backdrop-filter: blur(20px) saturate(1.6);
      -webkit-backdrop-filter: blur(20px) saturate(1.6);
      border: 1px solid rgba(255, 255, 255, 0.4);
      box-shadow: 
        inset 0 1px 0 rgba(255, 255, 255, 0.5),
        0 4px 24px rgba(0, 0, 0, 0.04),
        0 8px 32px rgba(90, 154, 186, 0.05);
      transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }

    .sanctuary-card:hover {
      transform: translateY(-8px) scale(1.015);
      background: ${isDark ? 'rgba(50, 52, 68, 0.55)' : 'rgba(255, 255, 255, 0.65)'};
      box-shadow: 
        inset 0 1px 0 rgba(255, 255, 255, 0.6),
        0 24px 48px rgba(0, 0, 0, 0.08),
        0 12px 24px rgba(90, 154, 186, 0.1);
    }

    /* Texture Overlay on Cards */
    .sanctuary-card::after {
      content: '';
      position: absolute; inset: 0;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
      opacity: 0.03;
      pointer-events: none;
      z-index: 1;
      mix-blend-mode: overlay;
    }

    /* Inner Light Gloss for Card Variants */
    .card-water::before { content: ''; position: absolute; inset: 0; background: radial-gradient(ellipse at 80% 10%, rgba(90, 154, 186, 0.12) 0%, transparent 60%); pointer-events: none; z-index: 0; }
    .card-lotus::before { content: ''; position: absolute; inset: 0; background: radial-gradient(ellipse at 80% 10%, rgba(192, 88, 120, 0.1) 0%, transparent 60%); pointer-events: none; z-index: 0; }
    .card-moss::before  { content: ''; position: absolute; inset: 0; background: radial-gradient(ellipse at 80% 10%, rgba(74, 122, 90, 0.1) 0%, transparent 60%); pointer-events: none; z-index: 0; }

    .card-body-inner {
      position: relative;
      z-index: 2;
      padding: 24px;
    }

    .main-content-canvas {
      flex: 1;
      height: 100%;
      overflow: hidden; /* Lock parent scroll, let children scroll themselves */
      display: flex;
      flex-direction: column;
      position: relative;
      z-index: 50;
    }

    .sanctuary-screen {
      flex: 1;
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      padding: 40px 48px 60px 48px;
      overflow-y: auto !important; /* Screen naturally handles its own scrolling */
      overflow-x: hidden !important;
      -webkit-overflow-scrolling: touch;
      box-sizing: border-box;
      position: relative;
      animation: fadeIn 0.6s ease-out;
    }

    .sanctuary-container {
      max-width: 1400px;
      margin: 0 auto;
      width: 100%;
    }

    /* ── GREETING & TYPOGRAPHY ── */
    .greeting {
      margin-bottom: 48px;
    }
    .greeting-main {
      font-family: var(--font-display);
      font-size: 48px;
      font-style: italic;
      color: var(--ink);
      line-height: 1.1;
      margin-bottom: 12px;
      text-shadow: 0 1px 0 rgba(255,255,255,0.8);
    }
    .greeting-note {
      font-size: 18px;
      color: var(--ink-soft);
      font-weight: 300;
      letter-spacing: 0.01em;
    }

    /* ── LAYOUT UTILS ── */
    .sub-view-container {
      display: grid;
      grid-template-columns: minmax(0, 1fr) 340px;
      gap: 32px;
      animation: fadeIn 0.6s ease-out;
    }

    @media (max-width: 1200px) {
      .sub-view-container {
        grid-template-columns: 1fr;
      }
      .sanctuary-screen {
        padding: 40px 24px;
      }
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .content-scroll-area {
      flex: 1;
      overflow-y: visible;
      min-height: min-content;
    }

    /* ── SCROLLBAR ── */
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb {
      background: rgba(160, 150, 130, 0.2);
      border-radius: 10px;
    }
    ::-webkit-scrollbar-thumb:hover { background: rgba(160, 150, 130, 0.4); }

    /* ── COMMUNITY LAYOUT ── */
    .community-grid {
      display: grid;
      grid-template-columns: 200px 1fr 340px;
      gap: 32px;
      align-items: start;
    }

    .community-sidebar {
      position: sticky;
      top: 0;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .community-feed {
      display: flex;
      flex-direction: column;
      gap: 24px;
      min-width: 0;
    }

    .community-panel {
      position: sticky;
      top: 0;
      display: flex;
      flex-direction: column;
      gap: 32px;
    }

    @media (max-width: 1200px) {
      .community-grid {
        grid-template-columns: 1fr;
        gap: 24px;
      }
      .community-sidebar,
      .community-panel {
        display: none;
      }
      .community-sub-nav {
        display: flex !important;
      }
    }

    /* ── SUB-NAV (Horizontal Tabs) ── */
    .community-sub-nav {
      display: none;
      gap: 8px;
      margin-bottom: 24px;
      padding: 4px;
      background: rgba(255, 255, 255, 0.4);
      backdrop-filter: blur(20px);
      border-radius: 16px;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }
    .sub-nav-item {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 10px;
      border-radius: 12px;
      font-size: 13px;
      font-weight: 500;
      color: var(--ink-ghost);
      transition: all 0.2s ease;
    }
    .sub-nav-item.active {
      background: white;
      color: var(--water);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    }

    /* ── RESPONSIVE ── */
    @media (max-width: 1023px) {
      .sidebar { transform: translateX(-100%); width: 0; padding: 0; }
      .greeting-main { font-size: 36px; }
    }
    `;

  return (
    <style dangerouslySetInnerHTML={{ __html: css }} />
  );
}

