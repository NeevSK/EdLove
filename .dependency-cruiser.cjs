/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'no-circular',
      severity: 'error',
      comment: 'Circular dependencies are not allowed.',
      from: {},
      to: { circular: true },
    },
    {
      name: 'packages-not-to-apps',
      severity: 'error',
      comment: 'Packages should never import from apps.',
      from: { path: '^packages/[^/]+/src/' },
      to: { path: '^apps/[^/]+/src/' },
    },
    {
      name: 'no-cross-app-imports',
      severity: 'error',
      comment: 'Apps should not import from other apps.',
      from: { path: '^apps/([^/]+)/' },
      to: {
        path: '^apps/([^/]+)/',
        pathNot: '^apps/$1/',
      },
    },


    {
      name: 'no-orphans',
      severity: 'warn',
      comment: 'Files without any dependencies to or from them. Ignored for config and type files.',
      from: {
        orphan: true,
        pathNot: [
          '\\.config\\.(js|cjs|mjs|ts)$',
          '\\.d\\.ts$',
          '\\.test\\.ts$',
          '\\.spec\\.ts$',
          '__tests__/',
          'shims/',
          'jest-native-setup\\.js$',
          'bundle_root\\.js$',
          'public/sw\\.js$',
        ],
      },
      to: {},
    },
    {
      name: 'not-to-test',
      severity: 'error',
      comment: 'Production code should not import test code.',
      from: { pathNot: '^(.*\\.test\\.ts|.*\\.spec\\.ts)$' },
      to: { path: '^(.*\\.test\\.ts|.*\\.spec\\.ts)$' },
    },
    {
      name: 'L0-no-upward',
      severity: 'error',
      comment: 'Layer 0 (Base) should not import from higher layers.',
      from: { path: '^packages/(core|types-shim)/src/' },
      to: {
        path: '^packages/',
        pathNot:
          '^packages/(core|database|schema|types-shim|eslint-config|typescript-config|form-builder-engine)/',
      },
    },
    {
      name: 'L1-no-upward',
      severity: 'error',
      comment: 'Layer 1 (UI) should not import from higher layers.',
      from: { path: '^packages/ui/src/' },
      to: {
        path: '^packages/',
        pathNot: '^packages/(core|types-shim|ui|eslint-config|typescript-config)/',
      },
    },
    {
      name: 'L2-no-upward',
      severity: 'error',
      comment: 'Layer 2 (Infrastructure) should not import from higher layers.',
      from: {
        path: '^packages/(scanner-kit|ai|analytics|form-builder|lk-edu-geo|graphics)/src/',
      },
      to: {
        path: '^packages/',
        pathNot:
          '^packages/(core|types-shim|ui|graphics|scanner-kit|ai|analytics|form-builder|lk-edu-geo|eslint-config|typescript-config|form-builder-engine)/',
      },
    },
    {
      name: 'L3-no-upward',
      severity: 'error',
      comment: 'Layer 3 (Domains) should not import from Layer 4.',
      from: {
        path: '^packages/(classroom|people|self|admin|community|profile|workforce|library)/src/',
      },
      to: {
        path: '^packages/(payments|accounting)/',
      },
    },
    {
      name: 'standalone-isolation',
      severity: 'error',
      comment: 'Standalone packages should have ZERO dependencies on Layer 3 or 4.',
      from: { path: '^packages/lk-edu-geo/' },
      to: {
        path: '^packages/(classroom|people|self|admin|community|profile|workforce|library|payments|accounting)/',
      },
    },
    {
      name: 'no-cross-domain-feature-imports',
      severity: 'error',
      comment:
        'Domain packages must not import from other domain packages. Cross-domain workflows must go through the event bus (ADR-004).',
      from: { path: '^packages/(classroom|people|self|admin|community|profile|workforce|library)/src/' },
      to: {
        path: '^packages/(classroom|people|self|admin|community|profile|workforce|library)/',
        pathNot: '^packages/$1/',
      },
    },
    {
      name: 'domain-not-to-payments',
      severity: 'error',
      comment: 'Domain packages must never directly import payments or accounting. Use IEntitlementPort through core.',
      from: { path: '^packages/(classroom|people|self|admin|community|profile|workforce|library)/src/' },
      to: {
        path: '^packages/(payments|accounting)/',
      },
    },
    {
      name: 'no-store-imports-outside-core',
      severity: 'error',
      comment: 'Zustand stores are internal to @repo/core. Apps and other packages must import through @repo/core/logic or @repo/core/store.',
      from: {
        path: '^(apps/|packages/(?!core|types-shim)/)',
        pathNot: ['\\.test\\.ts$', '\\.d\\.ts$'],
      },
      to: {
        path: '^packages/core/src/store/',
        pathNot: [
          '^packages/core/src/store/index\\.ts$',
          '^packages/core/src/store/types/',
        ],
      },
    },
    {
      name: 'L0-L1-subpath-only',
      severity: 'warn',
      comment:
        'For Layer 0 & 1, direct imports from the root index are discouraged. Use subpaths for heavy items (e.g., @repo/ui/icons).',
      from: {
        pathNot: '^packages/(core|ui|graphics|types-shim)/',
      },
      to: {
        path: '^packages/(core|ui|graphics|types-shim)/src/index\\.ts$',
      },
    },
    {
      name: 'independent-api-boundary',
      severity: 'error',
      comment: 'Independent/Public packages must be accessed only via their public API (index.ts).',
      from: {
        pathNot: '^packages/(form-builder|lk-edu-geo)/',
      },
      to: {
        path: '^packages/(form-builder|lk-edu-geo)/src/.+',
        pathNot: '^packages/(form-builder|lk-edu-geo)/src/(index\\.ts|api/index\\.ts)$',
      },
    },
    {
      name: 'no-db-leaks-to-apps',
      severity: 'error',
      comment:
        'Apps and Domain packages must not import directly from the Database. Use @repo/core/types instead.',
      from: {
        path: '^(apps/|packages/(?!core|database|types-shim))',
        pathNot: ['\\.test\\.ts$', '^apps/sanctuary-api/'],
      },
      to: {
        path: '^packages/database/',
      },
    },
    {
      name: 'mobile-screens-not-to-app',
      severity: 'error',
      comment: 'Mobile screens, components, hooks, and lib must never import from the app/ routing layer.',
      from: {
        path: '^apps/gurudevi-mobile/src/',
      },
      to: {
        path: '^apps/gurudevi-mobile/app/',
      },
    },
    {
      name: 'mobile-components-not-to-screens',
      severity: 'error',
      comment: 'Mobile components, hooks, utils, and libraries must never import from screens.',
      from: {
        path: '^apps/gurudevi-mobile/src/(components|ui|hooks|lib|utils|providers|services)/',
      },
      to: {
        path: '^apps/gurudevi-mobile/src/screens/',
      },
    },
    {
      name: 'mobile-hooks-not-to-ui',
      severity: 'error',
      comment: 'Mobile business logic hooks, services, and libraries must never import UI components or screens.',
      from: {
        path: '^apps/gurudevi-mobile/src/(hooks|lib|services|utils)/',
      },
      to: {
        path: '^apps/gurudevi-mobile/src/(components|ui|screens)/',
      },
    },
    {
      name: 'mobile-utils-isolation',
      severity: 'error',
      comment: 'Mobile pure utilities must remain leaf nodes and not import from screens, hooks, or providers.',
      from: {
        path: '^apps/gurudevi-mobile/src/utils/',
      },
      to: {
        path: '^apps/gurudevi-mobile/src/(screens|components|ui|hooks|providers|services)/',
      },
    },
  ],
  options: {
    exclude: {
      path: ['\\.vercel', 'node_modules', 'dist', '\\.turbo'],
    },
    doNotFollow: {
      path: ['node_modules', 'dist', '.turbo', '\\.vercel'],
    },
    moduleSystems: ['es6', 'cjs'],
    tsPreCompilationDeps: true,
    tsConfig: {
      fileName: 'tsconfig.json',
    },
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'require', 'node', 'default'],
    },
    reporterOptions: {
      dot: {
        collapsePattern: 'node_modules/[^/]+',
      },
    },
  },
};
