/**
 * dependency-cohorts.mjs
 *
 * Single Source of Truth (SSoT) for Polymath Platform Dependency Cohorts.
 * Replaces shallow, naive semver diffs with Architectural Cohort Intelligence.
 *
 * Core Concept:
 * Dependencies do not exist in isolation. In a modern high-scale React Native + Next.js monorepo,
 * packages exist in tight architectural cohorts that move together or are pinned to specific runtimes.
 */

export const DEPENDENCY_COHORTS = {
  SACRED_NATIVE: {
    id: 'SACRED_NATIVE',
    name: 'Sacred Native Architecture (AGENTS.md Section 2)',
    governance: 'SACRED_INVIOLABLE',
    guidance: 'Inviolable native pins for React Native 0.88 New Architecture (Fabric/JSI/Nitro). Upgrades forbidden without human sign-off.',
    packages: {
      'react-native-gesture-handler': '3.5.0',
      'react-native-reanimated': '4.8.0',
      'react-native-worklets': '0.14.0',
      'react-native-mmkv': '4.3.2',
      'react-native-nitro-modules': '0.37.2',
      'react-native-skia': '^3.11.0',
      '@shopify/react-native-skia': '^3.11.0',
      'typescript': '7.1.0-beta',
    },
  },

  EXPO_SDK_58_MATRIX: {
    id: 'EXPO_SDK_58_MATRIX',
    name: 'Expo SDK 58 Deterministic Mobile Matrix',
    governance: 'FRAMEWORK_MATRIX',
    guidance: 'Bundled to Expo SDK 58 native runtime. Must NOT be upgraded via ad-hoc npm updates. Gated on Expo SDK 59 and expo-doctor.',
    packages: {
      'expo': '~58.0.26',
      'react-native': '0.88.1',
      'expo-router': '~58.0.32',
      '@expo/agent-cli': '~1.0.32',
      '@expo/fingerprint': '~0.21.10',
      '@expo/log-box': '~58.0.15',
      '@expo/metro-runtime': '~58.0.17',
      'react-native-screens': '4.30.1',
      'react-native-safe-area-context': '5.11.1',
      'react-native-webview': '14.0.1',
      '@shopify/flash-list': '2.3.3',
      'react-native-svg': '15.16.1',
      'expo-image': '~58.0.18',
      'expo-sqlite': '~58.0.18',
      'expo-location': '~58.0.22',
      'expo-notifications': '~58.1.9',
      'expo-background-task': '~58.0.13',
      'expo-haptics': '~58.0.8',
      'expo-file-system': '~58.0.14',
      'expo-audio': '~58.0.12',
      'expo-font': '~58.0.12',
      'expo-constants': '~58.0.16',
      'expo-crypto': '~58.0.8',
      'expo-status-bar': '~58.0.5',
      'expo-symbols': '~58.0.5',
      'expo-glass-effect': '~58.0.5',
      'expo-media-library': '~58.0.14',
      'expo-dev-client': '~58.0.21',
      'expo-camera': '~58.0.14',
      'expo-contacts': '~58.0.11',
      'expo-clipboard': '~58.0.4',
      'expo-gl': '~58.0.4',
      'expo-device': '~58.0.5',
      'expo-linking': '~58.0.17',
      'expo-live-photo': '~58.0.8',
      'expo-print': '~58.0.9',
      'expo-screen-orientation': '~58.0.4',
      'expo-screen-capture': '~58.0.6',
      'expo-server': '~58.1.0',
      'expo-system-ui': '~58.0.7',
      'expo-task-manager': '~58.0.14',
      'expo-linear-gradient': '~58.0.4',
      'expo-secure-store': '~58.0.3',
      'expo-web-browser': '~58.1.0',
      'expo-asset': '~58.0.21',
      'expo-modules-core': '~58.1.0',
      'expo-image-picker': '~58.0.10',
      'expo-sharing': '~58.0.23',
      'expo-video': '~58.0.14',
      'expo-updates': '~58.0.22',
      'expo-build-properties': '~58.0.12',
      'expo-observe': '~58.0.19',
      'expo-image-manipulator': '~58.0.16',
      'expo-application': '~58.1.2',
      'expo-auth-session': '~58.0.19',
      'expo-blur': '~58.0.6',
      'expo-splash-screen': '~58.0.14',
      'expo-widgets': '~58.0.29',
      '@expo/ui': '~58.0.29',
      'babel-preset-expo': '~58.0.26',
      'react-native-maps': '1.29.11',
      'react-native-keyboard-controller': '1.23.1',
      'react-native-web': '~0.21.4',
      'eslint-config-expo': '~58.0.4',
      'jest-expo': '~58.0.15',
      'expo-doctor': '~1.21.8',
    },
  },

  REACT_19_ENGINE: {
    id: 'REACT_19_ENGINE',
    name: 'React 19 Platform Engine',
    governance: 'MONOREPO_UNIVERSAL',
    guidance: 'Universal React 19 engine across mobile, web, and all workspace packages. Zero internal variance allowed.',
    packages: {
      'react': '19.3.1',
      'react-dom': '19.3.1',
      'react-test-renderer': '19.3.1',
      'scheduler': '0.28.0',
      '@types/react': '^19.3.0',
      '@types/react-dom': '19.3.0',
    },
  },

  ZENSTACK_V3: {
    id: 'ZENSTACK_V3',
    name: 'ZenStack V3 Database Cohort',
    governance: 'MONOREPO_UNIVERSAL',
    guidance: 'Database & access control generation. Aligned to 3.9.8 with Postgres UUID/EXISTS optimizations & nested include fixes.',
    packages: {
      '@zenstackhq/cli': '3.10.3',
      '@zenstackhq/orm': '3.10.3',
      '@zenstackhq/language': '3.10.3',
      '@zenstackhq/sdk': '3.10.3',
      '@zenstackhq/zod': '3.10.3',
      '@zenstackhq/schema': '3.10.3',
      '@zenstackhq/plugin-policy': '3.10.3',
    },
  },

  VALIDATION_SCHEMAS: {
    id: 'VALIDATION_SCHEMAS',
    name: 'Validation & Contract Schemas',
    governance: 'MONOREPO_UNIVERSAL',
    guidance: 'Unified schema engine across @repo/core, mobile, and web to prevent dual-instance instanceof errors.',
    packages: {
      'zod': '4.6.7',
      'zod-validation-error': '5.0.0',
    },
  },

  STYLING_TAILWIND_NATIVEWIND: {
    id: 'STYLING_TAILWIND_NATIVEWIND',
    name: 'Tailwind & NativeWind Styling Engine',
    governance: 'MONOREPO_UNIVERSAL',
    guidance: 'Tailwind v4 with NativeWind v5 release candidate for unified multi-surface styling tokens.',
    packages: {
      'tailwindcss': '4.3.5',
      '@tailwindcss/postcss': '4.3.5',
      'nativewind': '5.0.0-rc.1',
      'react-native-css': '3.1.0-rc.1',
    },
  },

  TANSTACK_QUERY: {
    id: 'TANSTACK_QUERY',
    name: 'TanStack State & Data Fetching',
    governance: 'MONOREPO_UNIVERSAL',
    guidance: 'Universal query client and cache singleton across mobile and web.',
    packages: {
      '@tanstack/react-query': '^5.108.2',
      '@tanstack/query-core': '^5.108.2',
      'zustand': '^5.1.0',
    },
  },

  I18N_LOCALIZATION: {
    id: 'I18N_LOCALIZATION',
    name: 'i18n Localization Engine',
    governance: 'MONOREPO_UNIVERSAL',
    guidance: 'Universal i18next runtime across core, mobile, and workspace packages.',
    packages: {
      'i18next': '^27.2.2',
      'react-i18next': '^18.0.3',
    },
  },

  BEDROCK_BABEL_7: {
    id: 'BEDROCK_BABEL_7',
    name: 'Bedrock Babel 7 Toolchain (Metro / Expo / Worklets)',
    governance: 'FRAMEWORK_MATRIX',
    guidance: 'Held on Babel 7 until Metro, @react-native/babel-preset, babel-preset-expo, and react-native-worklets support @babel/core ^8.',
    packages: {
      '@babel/runtime': '^7.29.13',
      '@babel/traverse': '7.29.13',
    },
  },

  CORE_TOOLING: {
    id: 'CORE_TOOLING',
    name: 'Tooling, Test & Quality Gates',
    governance: 'MONOREPO_UNIVERSAL',
    guidance: 'Monorepo-wide test, lint, and build toolchain.',
    packages: {
      'vitest': '5.1.1',
      'eslint': '^10.15.0',
      'typescript-eslint': '8.73.0',
      '@biomejs/biome': '^2.6.8',
      '@types/node': '^26.6.6',
      '@testing-library/react-native': '14.1.0',
      '@testing-library/react': '^16.3.3',
      '@playwright/test': '^1.65.1',
      'postcss': '^8.5.33',
      '@unrs/resolver-binding-win32-x64-msvc': '^1.13.0',
      'eslint-plugin-oxlint': '^1.94.0',
      'eslint-plugin-react-hooks': '^7.1.1',
      'globals': '^17.14.0',
      'lightningcss-linux-x64-gnu': '1.33.0',
      'supabase': '^3.2.0',
      '@types/jest': '^30.0.0',
      'jest': '^30.5.2',
    },
  },

  AI_SDK: {
    id: 'AI_SDK',
    name: 'AI Agent & LLM Ecosystem',
    governance: 'MONOREPO_UNIVERSAL',
    guidance: 'Unified TanStack AI and agent interfaces across packages.',
    packages: {
      '@tanstack/ai': '^1.8.0',
    },
  },

  UI_ICONS: {
    id: 'UI_ICONS',
    name: 'Lucide Icons Engine',
    governance: 'MONOREPO_UNIVERSAL',
    guidance: 'Cross-platform Lucide iconography for mobile and web surfaces.',
    packages: {
      'lucide-react': '^1.77.0',
      'lucide-react-native': '^1.77.0',
    },
  },

  LOGGING_OBSERVABILITY: {
    id: 'LOGGING_OBSERVABILITY',
    name: 'Structured Logging & Diagnostics',
    governance: 'MONOREPO_UNIVERSAL',
    guidance: 'Pino structured logging ecosystem across server and native runtimes.',
    packages: {
      'pino': '^10.4.0',
      'pino-pretty': '^13.2.0',
    },
  },

  ORPC_FOUNDATION: {
    id: 'ORPC_FOUNDATION',
    name: 'oRPC Sovereign API Engine',
    governance: 'MONOREPO_UNIVERSAL',
    guidance:
      'Deterministic RPC contract and client runtime, and the Hono host it runs on. Aligned to the newest 2.0.0 beta; hono to the highest version any workspace uses.',
    packages: {
      '@orpc/client': '2.0.0-beta.52',
      '@orpc/contract': '2.0.0-beta.52',
      '@orpc/server': '2.0.0-beta.52',
      '@orpc/tanstack-query': '2.0.0-beta.52',
      '@orpc/openapi': '2.0.0-beta.52',
      '@orpc/shared': '2.0.0-beta.52',
      '@orpc/mcp': '2.0.0-beta.52',
      hono: '5.0.0-rc.1',
    },
  },

  POWERSYNC_DATA_ENGINE: {
    id: 'POWERSYNC_DATA_ENGINE',
    name: 'PowerSync Offline Data Engine',
    governance: 'MONOREPO_UNIVERSAL',
    guidance: 'Deterministic offline-first SQLite sync engine across native mobile and web.',
    packages: {
      '@powersync/common': '2.5.0',
      '@powersync/drizzle-driver': '0.8.0',
      '@powersync/react': '2.2.1',
      '@powersync/react-native': '2.4.1',
      '@powersync/web': '2.7.0',
      'drizzle-orm': '0.45.4',
    },
  },

  NEXTJS_WEB_FRAMEWORK: {
    id: 'NEXTJS_WEB_FRAMEWORK',
    name: 'Next.js Unified Web Platform',
    governance: 'MONOREPO_UNIVERSAL',
    guidance: 'App Router web architecture aligned with Turbopack, Tailwind v4 and React 19.',
    packages: {
      'next': '16.4.5',
    },
  },
};

/** Flattened lookup map: pkgName -> { cohort, canonicalVersion } */
export function getCohortLookup() {
  const map = new Map();
  for (const cohort of Object.values(DEPENDENCY_COHORTS)) {
    for (const [pkg, canonical] of Object.entries(cohort.packages)) {
      map.set(pkg, {
        cohortId: cohort.id,
        cohortName: cohort.name,
        governance: cohort.governance,
        guidance: cohort.guidance,
        canonical,
      });
    }
  }
  return map;
}

/**
 * Single Source of Truth for Standalone External Dependency Waivers.
 * Replaces unverified handwritten YAML prose with programmatic, reviewable waivers.
 */
export const DEPENDENCY_WAIVERS = {
  'tesseract.js': {
    pinnedVersion: '5.1.1',
    reason: 'v5 pinned for local web worker and OCR model asset stability.',
    milestone: 'Q1-2027',
  },
  '@sentry/node': {
    pinnedVersion: '8.55.2',
    reason: 'v8 held for Node/Hono server compatibility.',
    milestone: 'Hono v5 milestone',
  },
};

/** Get structured waiver information for a package */
export function getWaiver(pkgName) {
  return DEPENDENCY_WAIVERS[pkgName] || null;
}

