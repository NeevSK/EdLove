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
    name: 'Sacred Native Architecture (AGENTS.md Rule 2)',
    governance: 'SACRED_INVIOLABLE',
    guidance: 'Inviolable native pins for React Native 0.88 New Architecture (Fabric/JSI/Nitro). Upgrades forbidden without human sign-off.',
    packages: {
      'react-native-gesture-handler': '3.3.0',
      'react-native-reanimated': '4.7.1',
      'react-native-worklets': '0.13.0',
      'react-native-mmkv': '4.3.2',
      'react-native-nitro-modules': '0.37.1',
      'react-native-skia': '3.6.1',
      '@shopify/react-native-skia': '3.6.1',
      'typescript': '7.0.2',
    },
  },

  EXPO_SDK_58_MATRIX: {
    id: 'EXPO_SDK_58_MATRIX',
    name: 'Expo SDK 58 Deterministic Mobile Matrix',
    governance: 'FRAMEWORK_MATRIX',
    guidance: 'Bundled to Expo SDK 58 native runtime. Must NOT be upgraded via ad-hoc npm updates. Gated on Expo SDK 59 and expo-doctor.',
    packages: {
      'expo': '~58.0.13',
      'react-native': '0.88.0',
      'expo-router': '~58.0.22',
      'react-native-screens': '4.30.0',
      'react-native-safe-area-context': '5.10.1',
      'react-native-webview': '14.0.1',
      'react-native-pager-view': '9.0.9',
      '@shopify/flash-list': '2.3.2',
      'expo-image': '~58.0.15',
      'expo-sqlite': '~58.0.13',
      'expo-location': '~58.0.17',
      'expo-notifications': '~58.1.5',
      'expo-haptics': '~58.0.7',
      'expo-file-system': '~58.0.9',
      'expo-audio': '~58.0.9',
      'expo-font': '~58.0.8',
      'expo-constants': '~58.0.12',
      'expo-crypto': '~58.0.7',
      'expo-status-bar': '~58.0.3',
      'expo-symbols': '~58.0.4',
      'expo-glass-effect': '~58.0.4',
      'expo-media-library': '~58.0.10',
      'expo-dev-client': '~58.0.13',
      'expo-camera': '~58.0.10',
      'expo-clipboard': '~58.0.3',
      'expo-device': '~58.0.5',
      'expo-linear-gradient': '~58.0.3',
      'expo-secure-store': '~58.0.2',
      'expo-web-browser': '~58.0.6',
      'expo-asset': '~58.0.16',
      'expo-modules-core': '~58.0.21',
      'expo-image-picker': '~58.0.10',
      'expo-sharing': '~58.0.19',
      'expo-video': '~58.0.11',
      'expo-updates': '~58.0.17',
      'expo-build-properties': '~58.0.10',
      'expo-observe': '~58.0.15',
      'expo-image-manipulator': '~58.0.14',
      'expo-application': '~58.1.2',
      'expo-auth-session': '~58.0.13',
      'expo-blur': '~58.0.4',
      'expo-splash-screen': '~58.0.10',
      'expo-widgets': '~58.0.20',
      '@expo/ui': '~58.0.20',
      'react-native-maps': '1.29.11',
      'react-native-keyboard-controller': '1.22.7',
      'react-native-web': '~0.21.4',
      '@react-native-community/slider': '5.2.1',
      'eslint-config-expo': '~58.0.4',
      'jest-expo': '~58.0.11',
    },
  },

  REACT_19_ENGINE: {
    id: 'REACT_19_ENGINE',
    name: 'React 19 Platform Engine',
    governance: 'MONOREPO_UNIVERSAL',
    guidance: 'Universal React 19 engine across mobile, web, and all workspace packages. Zero internal variance allowed.',
    packages: {
      'react': '19.3.0',
      'react-dom': '19.3.0',
      'react-test-renderer': '19.3.0',
      '@types/react': '^19.3.0',
      '@types/react-dom': '19.3.0',
    },
  },

  ZENSTACK_V3: {
    id: 'ZENSTACK_V3',
    name: 'ZenStack V3 Database Cohort',
    governance: 'MONOREPO_UNIVERSAL',
    guidance: 'Database & access control generation. Aligned to 3.9.7 with Postgres UUID/EXISTS optimizations & nested include fixes.',
    packages: {
      '@zenstackhq/cli': '3.9.7',
      '@zenstackhq/orm': '3.9.7',
      '@zenstackhq/language': '3.9.7',
      '@zenstackhq/sdk': '3.9.7',
      '@zenstackhq/zod': '3.9.7',
      '@zenstackhq/schema': '3.9.7',
      '@zenstackhq/server': '3.9.7',
      '@zenstackhq/plugin-policy': '3.9.7',
    },
  },

  VALIDATION_SCHEMAS: {
    id: 'VALIDATION_SCHEMAS',
    name: 'Validation & Contract Schemas',
    governance: 'MONOREPO_UNIVERSAL',
    guidance: 'Unified schema engine across @repo/core, mobile, and web to prevent dual-instance instanceof errors.',
    packages: {
      'zod': '4.6.5',
      'zod-validation-error': '5.0.0',
    },
  },

  STYLING_TAILWIND_NATIVEWIND: {
    id: 'STYLING_TAILWIND_NATIVEWIND',
    name: 'Tailwind & NativeWind Styling Engine',
    governance: 'MONOREPO_UNIVERSAL',
    guidance: 'Tailwind v4 with NativeWind v5 preview for unified multi-surface styling tokens.',
    packages: {
      'tailwindcss': '4.3.0',
      '@tailwindcss/postcss': '4.3.0',
      'nativewind': '5.0.0-rc.0',
    },
  },

  TANSTACK_QUERY: {
    id: 'TANSTACK_QUERY',
    name: 'TanStack State & Data Fetching',
    governance: 'MONOREPO_UNIVERSAL',
    guidance: 'Universal query client and cache singleton across mobile and web.',
    packages: {
      '@tanstack/react-query': '^5.104.3',
      '@tanstack/query-core': '^5.104.3',
      'zustand': '^5.0.15',
    },
  },

  I18N_LOCALIZATION: {
    id: 'I18N_LOCALIZATION',
    name: 'i18n Localization Engine',
    governance: 'MONOREPO_UNIVERSAL',
    guidance: 'Universal i18next runtime across core, mobile, and workspace packages.',
    packages: {
      'i18next': '^26.4.6',
      'react-i18next': '^17.0.18',
    },
  },

  CORE_TOOLING: {
    id: 'CORE_TOOLING',
    name: 'Tooling, Test & Quality Gates',
    governance: 'MONOREPO_UNIVERSAL',
    guidance: 'Monorepo-wide test, lint, and build toolchain.',
    packages: {
      'vitest': '5.0.5',
      'eslint': '^10.12.0',
      'typescript-eslint': '8.69.0',
      '@biomejs/biome': '^2.5.15',
      '@types/node': '^26.6.5',
      '@testing-library/react-native': '14.0.1',
      '@testing-library/react': '^16.3.3',
      '@playwright/test': '^1.64.1',
      'postcss': '^8.5.30',
      '@unrs/resolver-binding-win32-x64-msvc': '^1.12.2',
      'eslint-plugin-oxlint': '^1.88.0',
      'eslint-plugin-react-hooks': '^7.1.1',
      'globals': '^17.13.0',
      'lightningcss-linux-x64-gnu': '1.30.1',
      'supabase': '^2.121.0',
      '@types/jest': '^29.5.14',
    },
  },

  AI_SDK: {
    id: 'AI_SDK',
    name: 'AI Agent & LLM Ecosystem',
    governance: 'MONOREPO_UNIVERSAL',
    guidance: 'Unified TanStack AI and agent interfaces across packages.',
    packages: {
      '@tanstack/ai': '^0.69.0',
    },
  },

  UI_ICONS: {
    id: 'UI_ICONS',
    name: 'Lucide Icons Engine',
    governance: 'MONOREPO_UNIVERSAL',
    guidance: 'Cross-platform Lucide iconography for mobile and web surfaces.',
    packages: {
      'lucide-react': '^1.57.0',
      'lucide-react-native': '^1.57.0',
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
    guidance: 'Deterministic RPC contract and client runtime. Aligned to 2.0.0-beta.44.',
    packages: {
      '@orpc/client': '2.0.0-beta.44',
      '@orpc/contract': '2.0.0-beta.44',
      '@orpc/server': '2.0.0-beta.44',
      '@orpc/tanstack-query': '2.0.0-beta.44',
      '@orpc/openapi': '2.0.0-beta.44',
      '@orpc/shared': '2.0.0-beta.44',
    },
  },

  POWERSYNC_DATA_ENGINE: {
    id: 'POWERSYNC_DATA_ENGINE',
    name: 'PowerSync Offline Data Engine',
    governance: 'MONOREPO_UNIVERSAL',
    guidance: 'Deterministic offline-first SQLite sync engine across native mobile and web.',
    packages: {
      '@powersync/common': '2.3.1',
      '@powersync/drizzle-driver': '0.8.0',
      '@powersync/react': '2.0.2',
      '@powersync/react-native': '2.3.1',
      '@powersync/web': '2.4.2',
      'drizzle-orm': '0.45.4',
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
