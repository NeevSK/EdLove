import React from 'react';
import { Platform } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { hexToRgba } from '../utils/colorUtils';

/**
 * SanctuaryGlobalStyles (Web-only)
 *
 * Injects global CSS for the web platform.  Consumes the full adaptive
 * token set from useTheme() — including WCAG-computed textOnAccent /
 * textOnReward — so that text colors automatically adapt whenever the
 * temporal phase changes the active accent (Saffron → Sage → Blue → Gold).
 */
const STATIC_CSS = `
    /* ── RESET ── */
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; outline: none !important; }
    body { 
      font-family: var(--font-body); 
      color: var(--ink); 
      /* overflow: clip (not hidden) — doesn't create a scroll container,
         so browser scroll restoration and URL-hash navigation work correctly.
         All actual scrolling is handled by .sanctuary-screen (overflow-y: auto). */
      overflow: clip; 
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
      background: var(--world-bg);
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

      background: var(--topbar-bg);
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

      background: var(--sidebar-bg);
      /* Reduced blur (16px) vs topbar (28px) — avoids stacking two heavy
         backdrop-filter compositing layers on mid-range Android devices. */
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
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
      background: var(--card-bg);
      backdrop-filter: blur(20px) saturate(1.6);
      -webkit-backdrop-filter: blur(20px) saturate(1.6);
      border: 1px solid rgba(255, 255, 255, 0.4);
      box-shadow: 
        inset 0 1px 0 rgba(255, 255, 255, 0.5),
        0 4px 24px rgba(0, 0, 0, 0.04),
        0 8px 32px rgba(90, 154, 186, 0.05);
      transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      will-change: transform;
    }

    .sanctuary-card:hover {
      transform: translateY(-6px);
      background: var(--card-bg-hover);
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

    /* ── BUTTONS ── */
    .premium-button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 12px 24px;
      border-radius: 14px;
      border: none;
      cursor: pointer;
      font-family: var(--font-body);
      font-size: 14px;
      font-weight: 700;
      letter-spacing: 0.01em;
      background: var(--action);
      color: var(--text-on-action);
      box-shadow: 0 4px 16px var(--action-glow);
      transition: all 0.25s cubic-bezier(0.4,0,0.2,1);
      white-space: nowrap;
    }
    .premium-button:hover {
      transform: translateY(-2px) scale(1.03);
      box-shadow: 0 8px 24px var(--action-glow);
      filter: brightness(1.07);
    }
    .premium-button:active { transform: scale(0.97); }
    .premium-button:disabled { opacity: 0.45; cursor: not-allowed; }

    .secondary-button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 12px 20px;
      border-radius: 14px;
      cursor: pointer;
      font-family: var(--font-body);
      font-size: 14px;
      font-weight: 600;
      background: var(--btn-secondary-bg);
      color: var(--ink);
      border: 1px solid var(--btn-secondary-border);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      transition: all 0.25s cubic-bezier(0.4,0,0.2,1);
      white-space: nowrap;
    }
    .secondary-button:hover {
      background: var(--btn-secondary-hover);
      transform: translateY(-1px);
      box-shadow: var(--shadow-sm);
    }

    /* ── INTERACTIVE CARD ── */
    .sanctuary-card.interactive {
      cursor: pointer;
    }
    .sanctuary-card.interactive:hover {
      transform: translateY(-6px) scale(1.012);
    }

    /* ── SIDEBAR LABEL ── */
    .sidebar-label {
      font-size: 14px;
      font-weight: 500;
      letter-spacing: 0.01em;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* ── PROFILE GEM ── */
    .profile-gem {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: var(--profile-gem-bg);
      border: 1.5px solid var(--profile-gem-border);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: transform 0.2s;
    }
    .sidebar-profile-btn:hover .profile-gem { transform: scale(1.1); }

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
      font-size: clamp(28px, 3.5vw, 48px);
      font-style: italic;
      color: var(--ink);
      line-height: 1.1;
      margin-bottom: 12px;
      text-shadow: 0 1px 0 rgba(255,255,255,0.8);
    }
    .greeting-time {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: var(--action);
      margin-bottom: 8px;
      opacity: 0.85;
    }
    .greeting-note {
      font-size: 18px;
      color: var(--ink-soft);
      font-weight: 300;
      letter-spacing: 0.01em;
    }

    /* ── FILTER TABS (top-tab) ── */
    .top-tab {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      border-radius: 100px;
      font-size: 13px;
      font-weight: 600;
      letter-spacing: 0.01em;
      color: var(--ink-soft);
      background: var(--tab-bg);
      border: 1.5px solid transparent;
      transition: all 0.18s ease;
      white-space: nowrap;
      font-family: var(--font-body);
    }
    .top-tab:hover {
      background: var(--tab-bg-hover);
      color: var(--ink);
    }
    .top-tab.active {
      background: var(--tab-active-bg);
      border-color: var(--water);
      color: var(--water);
    }

    /* ──────────────────────────────────────────────────────────────────
       ADAPTIVE COLOUR UTILITY CLASSES
       These classes automatically adapt when the temporal phase changes
       the active accent colour (Saffron → Sage → Blue → Gold etc.).
       Text colours are WCAG-computed so contrast is always ≥ 4.5 : 1.
    ────────────────────────────────────────────────────────────────── */

    /* Solid accent background — text colour auto-adapts */
    .action-bg {
      background: var(--action);
      color: var(--text-on-action);
    }
    .action-bg-soft {
      background: var(--action-soft);
      color: var(--action);
    }

    /* Solid reward background — text colour auto-adapts */
    .reward-bg {
      background: var(--reward);
      color: var(--text-on-reward);
    }
    .reward-bg-soft {
      background: var(--reward-soft);
      color: var(--reward);
    }

    /* Danger background */
    .danger-bg {
      background: var(--danger);
      color: var(--text-on-danger);
    }
    .danger-bg-soft {
      background: var(--danger-soft);
      color: var(--danger);
    }

    /* Phase-aware glass chip (small tag / badge) */
    .glass-chip {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 3px 10px;
      border-radius: 100px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      background: var(--action-soft);
      color: var(--action);
      border: 1px solid var(--action-border);
    }
    .glass-chip.reward {
      background: var(--reward-soft);
      color: var(--reward);
      border-color: rgba(var(--reward-rgb), 0.35);
    }
    .glass-chip.danger {
      background: var(--danger-soft);
      color: var(--danger);
      border-color: rgba(255,99,71,0.35);
    }
    .glass-chip.neutral {
      background: var(--tab-bg);
      color: var(--ink-soft);
      border-color: var(--border);
    }

    /* Stat chip — metric pill used in dashboards */
    .stat-chip {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
      padding: 12px 16px;
      border-radius: 14px;
      background: var(--action-soft);
      border: 1px solid var(--action-border);
    }
    .stat-chip .stat-value {
      font-size: 22px;
      font-weight: 800;
      color: var(--action);
      line-height: 1;
    }
    .stat-chip .stat-label {
      font-size: 10px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--ink-ghost);
    }

    /* Phase-aware focus ring (replaces the hardcoded saffron outline) */
    *:focus-visible {
      outline: 2.5px solid var(--action) !important;
      outline-offset: 3px;
    }

    /* Phase-aware action button — adapts to current phase accent */
    .action-button {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 11px 22px;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 700;
      letter-spacing: 0.01em;
      background: var(--action);
      color: var(--text-on-action);
      border: none;
      cursor: pointer;
      transition: transform 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease;
      font-family: var(--font-body);
    }
    .action-button:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 20px var(--action-glow);
    }
    .action-button:active { transform: scale(0.97); }
    .action-button:disabled { opacity: 0.45; cursor: not-allowed; }

    /* Outline variant of action button */
    .action-button.outline {
      background: var(--action-soft);
      color: var(--action);
      border: 1.5px solid var(--action-border);
    }
    .action-button.outline:hover {
      background: var(--action-medium);
    }

    /* Ghost button — subtle, no fill, used for secondary actions (e.g. "Mark all read") */
    .sanctuary-button-ghost {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      border-radius: 10px;
      font-size: 13px;
      font-weight: 600;
      color: var(--ink-ghost);
      background: transparent;
      border: 1px solid var(--border);
      cursor: pointer;
      transition: all 0.18s ease;
      font-family: var(--font-body);
    }
    .sanctuary-button-ghost:hover {
      background: var(--background-alt);
      color: var(--ink);
      border-color: var(--action-border);
    }
    .sanctuary-button-ghost:active { transform: scale(0.97); }

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

    /* ── RESPONSIVE — TABLET (768–1023px) ── */
    @media (max-width: 1023px) {
      .sidebar {
        transform: translateX(-100%);
        position: fixed;
        height: 100%;
        z-index: 1000;
        width: 280px !important;
        transition: transform 0.35s cubic-bezier(0.4,0,0.2,1);
      }
      .sidebar.open {
        transform: translateX(0);
      }
      .sanctuary-screen {
        padding: 32px 20px 100px 20px;
      }
      .greeting-main { font-size: 36px; }
      .greeting-note  { font-size: 15px; }
      .sub-view-container {
        grid-template-columns: 1fr;
        gap: 24px;
      }
      .community-grid {
        grid-template-columns: 1fr;
        gap: 20px;
      }
      .community-sidebar,
      .community-panel {
        display: none;
      }
      .community-sub-nav { display: flex !important; }
    }

    /* ── RESPONSIVE — MOBILE (< 768px) ── */
    @media (max-width: 767px) {
      .sanctuary-screen {
        padding: 20px 14px 88px 14px;
      }
      .greeting-main { font-size: 28px; }
      .greeting-note  { font-size: 13px; }
      .brand-name     { display: none; }
      .top-bar        { padding: 0 16px; }
      .card-body-inner { padding: 16px; }
      .sub-view-container { gap: 16px; }
      .premium-button, .secondary-button { padding: 10px 16px; font-size: 13px; }
    }

    /* ── SIDEBAR OVERLAY (mobile backdrop) ── */
    .sidebar-overlay {
      display: none;
      position: fixed;
      inset: 0;
      z-index: 999;
      background: rgba(0,0,0,0.45);
      backdrop-filter: blur(2px);
      -webkit-backdrop-filter: blur(2px);
      animation: fadeIn 0.2s ease;
    }
    .sidebar-overlay.visible { display: block; }

    /* ── MOBILE BOTTOM NAV ── */
    .mobile-bottom-nav {
      display: none;
    }
    @media (max-width: 1023px) {
      .mobile-bottom-nav {
        display: flex;
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        height: 72px;
        z-index: 1100;
        align-items: center;
        justify-content: space-around;
        padding: 0 8px env(safe-area-inset-bottom, 0px) 8px;
        background: var(--mobile-panel-bg);
        backdrop-filter: blur(28px) saturate(1.8);
        -webkit-backdrop-filter: blur(28px) saturate(1.8);
        border-top: 1px solid rgba(255,255,255,0.2);
        box-shadow: 0 -4px 24px rgba(107,100,128,0.12);
      }
      .mobile-nav-item {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 4px;
        padding: 8px 4px;
        border: none;
        background: transparent;
        cursor: pointer;
        border-radius: 12px;
        transition: all 0.2s ease;
      }
      .mobile-nav-item.active {
        color: var(--water);
      }
      .mobile-nav-item:not(.active) {
        color: var(--ink-ghost);
      }
      .mobile-nav-label {
        font-size: 10px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        line-height: 1;
      }
      .mobile-nav-item.active .mobile-nav-label { color: var(--water); }
      .mobile-nav-item:not(.active) .mobile-nav-label { color: var(--ink-ghost); }
    }

    /* ── PWA SAFE AREA ── */
    @supports (padding: env(safe-area-inset-bottom)) {
      .sanctuary-screen { padding-bottom: calc(88px + env(safe-area-inset-bottom)); }
      @media (max-width: 767px) {
        .sanctuary-screen { padding-bottom: calc(88px + env(safe-area-inset-bottom)); }
      }
    }
`;

export function SanctuaryGlobalStyles() {
  if (Platform.OS !== 'web') return null;

  const {
    accent, glass, text, isDark, gradientNodes,
    textOnAccent, textOnReward,
    accentRgb, rewardRgb, surfaceRgb,
    phase,
  } = useTheme();

  const dynamicCss = `
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
      --water-soft:  rgba(90,154,186,0.09);
      --moss:        #4a7a5a;
      --moss-glow:   rgba(74,122,90,0.25);
      --moss-soft:   rgba(74,122,90,0.09);
      --lotus:       #c05878;
      --lotus-glow:  rgba(192,88,120,0.2);
      --lotus-soft:  rgba(192,88,120,0.08);
      --gold:        #a07830;
      --gold-glow:   rgba(160,120,48,0.2);
      --ember:       #c04040;
      --ember-soft:  rgba(192,64,64,0.08);
      --amber-glow:  #c8803a;

      /* Gurudevi Blue (alias for water) */
      --gurudevi-blue: #3a7a9a;

      /* Action (Saffron / phase-aware) */
      --action:             ${accent.action};
      --action-rgb:         ${accentRgb};
      --action-soft:        ${hexToRgba(accent.action, 0.09)};
      --action-medium:      ${hexToRgba(accent.action, 0.18)};
      --action-glow:        ${hexToRgba(accent.action, 0.28)};
      --action-border:      ${hexToRgba(accent.action, 0.40)};
      /* Text that is WCAG-safe on top of --action backgrounds */
      --text-on-action:     ${textOnAccent};
      --sanctuary-saffron:  ${accent.action};
      --sanctuary-saffron-soft: ${hexToRgba(accent.action, 0.09)};

      /* Reward (achievement / celebration — phase-aware) */
      --reward:             ${accent.reward};
      --reward-rgb:         ${rewardRgb};
      --reward-soft:        ${hexToRgba(accent.reward, 0.09)};
      --reward-medium:      ${hexToRgba(accent.reward, 0.18)};
      --reward-glow:        ${hexToRgba(accent.reward, 0.28)};
      /* Text that is WCAG-safe on top of --reward backgrounds */
      --text-on-reward:     ${textOnReward};

      /* Danger */
      --danger:             #FF6347;
      --danger-soft:        rgba(255,99,71,0.09);
      --text-on-danger:     #FCF9F2;

      /* Phase surface gradient nodes (used for ambient tints) */
      --surface-primary:   ${gradientNodes[0]};
      --surface-secondary: ${gradientNodes[1]};
      --surface-tertiary:  ${gradientNodes[2]};
      --surface-rgb:        ${surfaceRgb};

      /* Full text token set exposed as CSS variables */
      --text-primary:   ${text.primary};
      --text-secondary: ${text.secondary};
      --text-inverse:   ${text.inverse};
      --text-muted:     ${text.muted};

      /* Phase identifier — useful for CSS [data-phase="morning"] overrides */
      --phase: "${phase}";

      /* Backgrounds */
      --background:     ${isDark ? '#111218' : '#F5EDD6'};
      --background-alt: ${isDark ? 'rgba(40,42,58,0.65)' : 'rgba(255,255,255,0.55)'};
      --surface:        ${glass.surface.bg};
      --glass-surface:  ${glass.surface.bg};
      --glass-interact: ${isDark ? 'rgba(50,52,68,0.70)' : 'rgba(255,255,255,0.75)'};

      /* World/shell background layers */
      --world-bg:           ${isDark ? 'radial-gradient(circle at 50% 50%, #1a1b26 0%, #111218 100%)' : 'linear-gradient(135deg, #f8f4eb 0%, #edf1f4 100%)'};
      --topbar-bg:          ${isDark ? 'rgba(26,27,38,0.45)' : 'rgba(255,255,255,0.45)'};
      --sidebar-bg:         ${isDark ? 'rgba(26,27,38,0.45)' : 'rgba(255,255,255,0.30)'};
      --card-bg:            ${isDark ? 'rgba(40,42,58,0.45)' : 'rgba(255,255,255,0.50)'};
      --card-bg-hover:      ${isDark ? 'rgba(50,52,68,0.55)' : 'rgba(255,255,255,0.65)'};
      --btn-secondary-bg:   ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.65)'};
      --btn-secondary-border: ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)'};
      --btn-secondary-hover: ${isDark ? 'rgba(255,255,255,0.13)' : 'rgba(255,255,255,0.90)'};
      --profile-gem-bg:     ${isDark ? 'rgba(255,255,255,0.10)' : 'rgba(58,122,154,0.12)'};
      --profile-gem-border: ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(58,122,154,0.20)'};
      --tab-bg:             ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'};
      --tab-bg-hover:       ${isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.07)'};
      --tab-active-bg:      ${isDark ? 'rgba(58,122,154,0.22)' : 'rgba(58,122,154,0.10)'};
      --mobile-panel-bg:    ${isDark ? 'rgba(26,27,38,0.88)' : 'rgba(255,255,255,0.88)'};

      /* Ink */
      --ink:         ${isDark ? text.primary : '#2a2820'};
      --ink-soft:    ${text.secondary};
      --ink-ghost:   #7a7068;

      /* Borders & Shadows */
      --border:       ${glass.surface.border};
      --border-light: rgba(255,255,255,0.7);
      --shadow-sm:    0 2px 8px rgba(107,100,128,0.07);
      --shadow-md:    0 8px 24px rgba(107,100,128,0.10);
      --shadow-lg:    0 16px 48px rgba(107,100,128,0.14);

      /* Typography */
      --font-display:'IM Fell English', serif;
      --font-body:   'DM Sans', sans-serif;

      /* Layout */
      --top-bar-h:   64px;
      --sidebar-w:   240px;
      --bp-mobile:   768px;
      --bp-tablet:   768px;
      --bp-desktop:  1024px;
      
      /* Legacy bridge tokens */
      --sanctuary-primary: ${gradientNodes[0]};
      --sanctuary-primary-rgb: ${isDark ? '26, 22, 16' : '245, 237, 214'};
      --sanctuary-text-primary: ${text.primary};
      --sanctuary-text-secondary: ${text.secondary};
    }
  `;

  // -- Static CSS: injected once on mount, never re-renders
  const staticInjectedRef = React.useRef(false);
  React.useInsertionEffect(() => {
    if (staticInjectedRef.current) return;
    staticInjectedRef.current = true;
    let el = document.getElementById('sanctuary-static-css') as HTMLStyleElement | null;
    if (!el) {
      el = document.createElement('style');
      el.id = 'sanctuary-static-css';
      el.textContent = STATIC_CSS;
      document.head.appendChild(el);
    }
  }, []);

  // -- Dynamic CSS: only the :root variables block, re-runs on theme change
  React.useInsertionEffect(() => {
    let el = document.getElementById('sanctuary-dynamic-css') as HTMLStyleElement | null;
    if (!el) {
      el = document.createElement('style');
      el.id = 'sanctuary-dynamic-css';
      document.head.appendChild(el);
    }
    el.textContent = dynamicCss;
  }, [dynamicCss]);

  return null;
}
