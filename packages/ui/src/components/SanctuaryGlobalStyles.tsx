import React from 'react';
import { Platform } from 'react-native';
import { useTheme } from '@repo/ui/hooks/useTheme';
import { hexToRgba } from '@repo/ui/utils/colorUtils';

/**
 * SanctuaryGlobalStyles (Web-only)
 *
 * Injects global CSS for the web platform.  Consumes the full adaptive
 * token set from useTheme() \u2014 including WCAG-computed textOnAccent /
 * textOnReward \u2014 so that text colors automatically adapt whenever the
 * temporal phase changes the active accent (Saffron \u2192 Sage \u2192 Blue \u2192 Gold).
 */
const STATIC_CSS = `
    /* \u2500\u2500 RESET \u2500\u2500 */
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; outline: none !important; }
    body {
      font-family: var(--font-body); 
      color: var(--ink); 
      /* overflow: clip (not hidden) \u2014 doesn't create a scroll container,
         so browser scroll restoration and URL-hash navigation work correctly.
         All actual scrolling is handled by .sanctuary-screen (overflow-y: auto). */
      overflow: clip; 
      overscroll-behavior-y: none;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      background:
        radial-gradient(circle at 18% 18%, var(--action-soft), transparent 32%),
        radial-gradient(circle at 82% 12%, var(--reward-soft), transparent 28%),
        var(--world-bg);
    }
    button { background: none; border: none; cursor: pointer; font-family: inherit; transition: var(--transition-snap); }

    /* \u2500\u2500 APP SHELL (Flexbox Architecture) \u2500\u2500 */
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

    /* \u2500\u2500 WORLD BACKGROUND (VELLUM) \u2500\u2500 */
    .world-bg {
      position: fixed;
      inset: 0;
      z-index: -1;
      background: var(--world-bg);
    }
    
    /* World Ambient Glow (No Grain) */
    .world-bg::after {
      content: '';
      position: absolute;
      inset: 0;
      background: radial-gradient(circle at 70% 30%, var(--water-soft), transparent 60%),
                  radial-gradient(circle at 20% 80%, var(--lotus-soft), transparent 50%);
      opacity: 0.2;
      filter: blur(80px);
      z-index: 1;
    }

    /* \u2500\u2500 TOP BAR \u2500\u2500 */
    .top-bar {
      height: var(--top-bar-h);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 24px;
      flex-shrink: 0;
      z-index: 1100;

      background: var(--topbar-bg);
      backdrop-filter: blur(40px) saturate(1.35);
      -webkit-backdrop-filter: blur(40px) saturate(1.35);
      border-bottom: 1px solid var(--scene-chrome-border);
      box-shadow: 0 10px 32px rgba(107,100,128,0.08);
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

    /* \u2500\u2500 SIDEBAR \u2500\u2500 */
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
      /* Reduced blur (16px) vs topbar (28px) \u2014 avoids stacking two heavy
         backdrop-filter compositing layers on mid-range Android devices. */
      backdrop-filter: blur(36px) saturate(1.2);
      -webkit-backdrop-filter: blur(36px) saturate(1.2);
      border-right: 1px solid var(--scene-chrome-border);
    }
    .sidebar.collapsed { width: 64px; }
    .sidebar.collapsed .sidebar-item { justify-content: center; padding: 12px 0; gap: 0; width: 100%; }
    .sidebar.collapsed .sidebar-header { justify-content: center; padding: 0; }
    .sidebar.collapsed .sidebar-profile-btn { justify-content: center; padding: 0; border-radius: 50%; width: 48px; height: 48px; margin: 12px auto; }
    .sidebar.collapsed .sidebar-group-label { display: none; }
    .sidebar.collapsed .sidebar-label { display: none; }

    .sidebar-header {
      height: var(--top-bar-h);
      display: flex;
      align-items: center;
      padding: 0 16px;
      border-bottom: 1px solid var(--scene-chrome-border);
    }

    .sidebar-toggle {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 10px;
      background: var(--scene-interactive);
      border: 1px solid var(--scene-interactive-border);
      color: var(--ink-soft);
      cursor: pointer;
      transition: var(--transition-smooth);
    }
    .sidebar-toggle:hover {
      background: var(--scene-elevated);
      transform: scale(1.1);
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
      transition: var(--transition-smooth);
      width: 100%;
      position: relative;
    }
    .sidebar-item:hover {
      color: var(--ink-soft);
      background: var(--scene-interactive);
      transform: translateX(8px);
    }
    .sidebar-item.active {
      color: var(--water);
      background: linear-gradient(135deg, var(--scene-elevated), var(--scene-interactive));
      box-shadow: 0 10px 24px rgba(107,100,128,0.10);
    }
    .sidebar-item::before {
      content: '';
      position: absolute;
      left: 0;
      top: 30%;
      height: 40%;
      width: 3px;
      background: var(--water);
      border-radius: 0 4px 4px 0;
      opacity: 0;
      transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      transform: scaleY(0.4);
    }
    .sidebar-item.active::before {
      opacity: 1;
      transform: scaleY(1);
    }
    .sidebar.collapsed .sidebar-item::before {
      left: 2px;
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
      background: var(--scene-interactive);
      border: 1px solid var(--scene-interactive-border);
      cursor: pointer;
      width: 100%;
      text-align: left;
      transition: all 0.2s ease;
    }
    .sidebar-profile-btn:hover {
      transform: translateY(-2px);
      background: var(--scene-elevated);
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

    /* \u2500\u2500 CARDS (THE HEART OF THE DEPTH) \u2500\u2500 */
    .sanctuary-card {
      position: relative;
      border-radius: 20px;
      overflow: hidden;
      background:
        linear-gradient(165deg, rgba(var(--surface-rgb), 0.94) 0%, rgba(var(--surface-rgb), 0.84) 100%);
      backdrop-filter: blur(36px) saturate(1.18);
      -webkit-backdrop-filter: blur(36px) saturate(1.18);
      border: 1px solid var(--scene-surface-border);
      box-shadow: 
        inset 0 1px 0 rgba(252,249,242,0.34),
        inset 0 -18px 32px rgba(107,100,128,0.03),
        0 12px 32px rgba(107,100,128,0.08),
        0 22px 48px rgba(var(--action-rgb), 0.05);
      transition: var(--transition-smooth);
      will-change: transform;
    }

    .sanctuary-card:hover {
      transform: translateY(-6px);
      background:
        linear-gradient(165deg, var(--card-bg-hover) 0%, var(--scene-surface) 100%);
      box-shadow: 
        inset 0 1px 0 rgba(252,249,242,0.42),
        0 24px 48px rgba(107,100,128,0.14),
        0 14px 28px rgba(var(--action-rgb), 0.08);
    }

    /* Removed Texture Overlay for Sleekness */
    .sanctuary-card::after {
      display: none;
    }
    /* Glass System - Premium Frosted Effects */
    .sanctuary-glass-hub {
      backdrop-filter: blur(24px) saturate(1.8);
      -webkit-backdrop-filter: blur(24px) saturate(1.8);
      background: rgba(var(--surface-rgb), 0.78);
      border-bottom: 1px solid var(--scene-surface-border);
      z-index: 100;
    }

    .sanctuary-card.active {
      border-color: var(--action);
      background: var(--action-soft);
      box-shadow: 0 4px 16px var(--action-glow);
    }

    .sanctuary-sidebar-glass {
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      background: rgba(var(--surface-rgb), 0.52);
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

    /* \u2500\u2500 BUTTONS \u2500\u2500 */
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
      background: linear-gradient(135deg, var(--action) 0%, color-mix(in srgb, var(--action) 76%, var(--reward) 24%) 100%);
      color: var(--text-on-action);
      box-shadow: 0 10px 28px var(--action-glow);
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
      background: linear-gradient(180deg, var(--btn-secondary-bg) 0%, var(--scene-surface) 100%);
      color: var(--ink);
      border: 1px solid var(--btn-secondary-border);
      backdrop-filter: blur(36px);
      -webkit-backdrop-filter: blur(36px);
      transition: all 0.25s cubic-bezier(0.4,0,0.2,1);
      white-space: nowrap;
    }
    .secondary-button:hover {
      background: var(--btn-secondary-hover);
      transform: translateY(-1px);
      box-shadow: var(--shadow-sm);
    }

    /* \u2500\u2500 INTERACTIVE CARD \u2500\u2500 */
    .sanctuary-card.interactive {
      cursor: pointer;
    }
    .sanctuary-card.interactive:hover {
      transform: translateY(-6px) scale(1.012);
    }

    /* \u2500\u2500 SIDEBAR LABEL \u2500\u2500 */
    .sidebar-label {
      font-size: 14px;
      font-weight: 500;
      letter-spacing: 0.01em;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* \u2500\u2500 PROFILE GEM \u2500\u2500 */
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

    /* \u2500\u2500 GREETING & TYPOGRAPHY \u2500\u2500 */
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

    /* \u2500\u2500 FILTER TABS (top-tab) \u2500\u2500 */
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
      background: linear-gradient(135deg, var(--tab-active-bg), var(--action-soft));
      border-color: var(--action-border);
      color: var(--action);
      box-shadow: 0 8px 20px rgba(var(--action-rgb), 0.10);
    }

    .sanctuary-search-shell {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      border-radius: 16px;
      border: 1px solid var(--scene-interactive-border);
      background:
        linear-gradient(180deg, var(--scene-elevated) 0%, var(--scene-interactive) 100%);
      backdrop-filter: blur(36px) saturate(1.14);
      -webkit-backdrop-filter: blur(36px) saturate(1.14);
      box-shadow: inset 0 1px 0 rgba(252,249,242,0.28), 0 10px 24px rgba(107,100,128,0.05);
    }
    .sanctuary-search-shell input {
      flex: 1;
      border: none;
      background: transparent;
      color: var(--ink);
      font-family: var(--font-body);
      font-size: 14px;
      outline: none;
    }
    .sanctuary-icon-well {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 44px;
      height: 44px;
      border-radius: 16px;
      background: linear-gradient(180deg, var(--action-soft), rgba(var(--reward-rgb), 0.08));
      border: 1px solid rgba(var(--action-rgb), 0.16);
      color: var(--action);
      box-shadow: inset 0 1px 0 rgba(252,249,242,0.2);
    }
    .sanctuary-icon-well.soft {
      width: 52px;
      height: 52px;
      border-radius: 20px;
    }
    .sanctuary-hero-panel {
      position: relative;
      overflow: hidden;
      border-radius: 28px;
      background:
        linear-gradient(180deg, rgba(var(--surface-rgb), 0.30) 0%, rgba(42,35,24,0.08) 100%);
      border: 1px solid var(--scene-surface-border);
      box-shadow: 0 20px 44px rgba(107,100,128,0.12);
    }
    .sanctuary-hero-panel::after {
      content: '';
      position: absolute;
      inset: 0;
      background:
        linear-gradient(180deg, transparent 0%, rgba(42,35,24,0.18) 48%, rgba(42,35,24,0.78) 100%);
      pointer-events: none;
    }
    .sanctuary-map-stage {
      border-radius: 24px;
      border: 1px solid var(--scene-surface-border);
      background:
        radial-gradient(circle at 20% 18%, var(--action-soft), transparent 28%),
        radial-gradient(circle at 78% 14%, var(--reward-soft), transparent 24%),
        linear-gradient(180deg, var(--scene-elevated) 0%, var(--scene-surface) 100%);
      overflow: hidden;
    }
    .status-pill {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 3px 8px;
      border-radius: 999px;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      background: var(--action-soft);
      color: var(--action);
      border: 1px solid rgba(var(--action-rgb), 0.18);
    }

    /* \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
       ADAPTIVE COLOUR UTILITY CLASSES
       These classes automatically adapt when the temporal phase changes
       the active accent colour (Saffron \u2192 Sage \u2192 Blue \u2192 Gold etc.).
       Text colours are WCAG-computed so contrast is always \u2265 4.5 : 1.
    \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */

    /* Solid accent background \u2014 text colour auto-adapts */
    .action-bg {
      background: var(--action);
      color: var(--text-on-action);
    }
    .action-bg-soft {
      background: var(--action-soft);
      color: var(--action);
    }

    /* Solid reward background \u2014 text colour auto-adapts */
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

    /* Stat chip \u2014 metric pill used in dashboards */
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

    /* Phase-aware action button \u2014 adapts to current phase accent */
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

    /* Ghost button \u2014 subtle, no fill, used for secondary actions (e.g. "Mark all read") */
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

    /* \u2500\u2500 LAYOUT UTILS \u2500\u2500 */
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

    /* \u2500\u2500 SCROLLBAR \u2500\u2500 */
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb {
      background: rgba(160, 150, 130, 0.2);
      border-radius: 10px;
    }
    ::-webkit-scrollbar-thumb:hover { background: rgba(160, 150, 130, 0.4); }

    /* \u2500\u2500 COMMUNITY LAYOUT \u2500\u2500 */
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

    /* \u2500\u2500 SUB-NAV (Horizontal Tabs) \u2500\u2500 */
    .community-sub-nav {
      display: none;
      gap: 8px;
      margin-bottom: 24px;
      padding: 6px;
      background: linear-gradient(180deg, var(--scene-elevated) 0%, var(--scene-interactive) 100%);
      backdrop-filter: blur(36px) saturate(1.12);
      -webkit-backdrop-filter: blur(36px) saturate(1.12);
      border-radius: 18px;
      border: 1px solid var(--scene-interactive-border);
    }
    .sub-nav-item {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      padding: 12px;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 600;
      color: var(--ink-ghost);
      transition: all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    .sub-nav-item.active {
      background: linear-gradient(180deg, var(--scene-elevated) 0%, var(--scene-surface) 100%);
      color: var(--action);
      box-shadow: 0 8px 24px rgba(var(--action-rgb), 0.12);
      transform: scale(1.02);
    }
    .sub-nav-item:hover:not(.active) {
      background: var(--scene-interactive);
      color: var(--ink-soft);
    }

    /* \u2500\u2500 SUB-NAV-TABS (3rd Level) \u2500\u2500 */
    .sub-nav-tabs-container {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 24px;
      padding-bottom: 8px;
      border-bottom: 1px solid rgba(0,0,0,0.05);
    }
    .sub-nav-tab {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 20px;
      border-radius: 100px;
      font-size: 13px;
      font-weight: 600;
      color: var(--ink-ghost);
      background: rgba(0, 0, 0, 0.03);
      border: 1px solid transparent;
      transition: all 0.2s ease;
    }
    .sub-nav-tab.active {
      background: var(--water-soft);
      color: var(--water);
      border-color: var(--water-glow);
    }
    .sub-nav-tab:hover:not(.active) {
      background: rgba(0, 0, 0, 0.06);
      color: var(--ink-soft);
    }

    /* \u2500\u2500 RESPONSIVE \u2014 TABLET (768\u20131023px) \u2500\u2500 */
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

    /* \u2500\u2500 RESPONSIVE \u2014 MOBILE (< 768px) \u2500\u2500 */
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

    /* \u2500\u2500 SIDEBAR OVERLAY (mobile backdrop) \u2500\u2500 */
    .sidebar-overlay {
      display: none;
      position: fixed;
      inset: 0;
      z-index: 999;
      background: rgba(42,35,24,0.22);
      backdrop-filter: blur(2px);
      -webkit-backdrop-filter: blur(2px);
      animation: fadeIn 0.2s ease;
    }
    .sidebar-overlay.visible { display: block; }

    /* \u2500\u2500 MOBILE BOTTOM NAV \u2500\u2500 */
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

    /* \u2500\u2500 PWA SAFE AREA \u2500\u2500 */
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
    accent,
    text,
    isDark,
    gradientNodes,
    scene,
    textOnAccent,
    textOnReward,
    accentRgb,
    rewardRgb,
    surfaceRgb,
    phase,
  } = useTheme();

  const dynamicCss = `
    :root {
      /* Sanctuary Core Tokens (Dynamic) */
      --color-background: ${scene.canvas.bg};
      --color-text-primary: ${text.onCanvas};
      --color-text-secondary: ${text.secondary};
      --color-accent: ${accent.action};
      --color-glass-border: ${scene.surface.border};

      /* Scene hierarchy */
      --scene-world: ${scene.world.bg};
      --scene-world-border: ${scene.world.border};
      --scene-chrome: ${scene.chrome.bg};
      --scene-chrome-border: ${scene.chrome.border};
      --scene-canvas: ${scene.canvas.bg};
      --scene-canvas-border: ${scene.canvas.border};
      --scene-surface: ${scene.surface.bg};
      --scene-surface-border: ${scene.surface.border};
      --scene-elevated: ${scene.elevated.bg};
      --scene-elevated-border: ${scene.elevated.border};
      --scene-interactive: ${scene.interactive.bg};
      --scene-interactive-border: ${scene.interactive.border};

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
      --action-border:      ${hexToRgba(accent.action, 0.4)};
      /* Text that is WCAG-safe on top of --action backgrounds */
      --text-on-action:     ${textOnAccent};
      --sanctuary-saffron:  ${accent.action};
      --sanctuary-saffron-soft: ${hexToRgba(accent.action, 0.09)};

      /* Reward (achievement / celebration \u2014 phase-aware) */
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
      --text-on-world:  ${text.onWorld};
      --text-on-chrome: ${text.onChrome};
      --text-on-canvas: ${text.onCanvas};
      --text-on-surface:${text.onSurface};
      --text-on-elevated:${text.onElevated};
      --text-on-interactive:${text.onInteractive};
      --text-on-danger: ${text.onDanger};

      /* Phase identifier \u2014 useful for CSS [data-phase="morning"] overrides */
      --phase: "${phase}";

      /* Backgrounds */
      --background:     ${scene.canvas.bg};
      --background-alt: ${scene.surface.bg};
      --surface:        ${scene.surface.bg};
      --glass-surface:  ${scene.surface.bg};
      --glass-interact: ${scene.interactive.bg};

      /* World/shell background layers */
      --world-bg:           linear-gradient(135deg, ${gradientNodes[0]} 0%, ${gradientNodes[1]} 55%, ${gradientNodes[2]} 100%);
      --topbar-bg:          ${scene.chrome.bg};
      --sidebar-bg:         ${scene.chrome.bg};
      --card-bg:            ${scene.surface.bg};
      --card-bg-hover:      ${scene.elevated.bg};
      --btn-secondary-bg:   ${scene.interactive.bg};
      --btn-secondary-border: ${scene.interactive.border};
      --btn-secondary-hover: ${scene.elevated.bg};
      --profile-gem-bg:     ${isDark ? 'rgba(255,255,255,0.10)' : 'rgba(58,122,154,0.12)'};
      --profile-gem-border: ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(58,122,154,0.20)'};
      --tab-bg:             ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'};
      --tab-bg-hover:       ${isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.07)'};
      --tab-active-bg:      ${isDark ? 'rgba(58,122,154,0.22)' : 'rgba(58,122,154,0.10)'};
      --mobile-panel-bg:    ${scene.chrome.bg};

      /* Ink */
      --ink:         ${text.onCanvas};
      --ink-soft:    ${text.secondary};
      --ink-ghost:   #7a7068;
      --error:       #FF6347;

      /* Borders & Shadows */
      --border:       ${scene.surface.border};
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

      /* Motion */
      --transition-smooth: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      --transition-snap:   all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
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
