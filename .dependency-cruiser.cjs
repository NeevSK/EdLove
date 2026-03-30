/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'no-circular',
      severity: 'error',
      comment: 'Circular dependencies are not allowed.',
      from: {},
      to: { circular: true }
    },
    {
      name: 'packages-not-to-apps',
      severity: 'error',
      comment: 'Packages should never import from apps.',
      from: { path: '^packages/[^/]+/src/' },
      to: { path: '^apps/[^/]+/src/' }
    },
    {
      name: 'no-cross-app-imports',
      severity: 'error',
      comment: 'Apps should not import from other apps.',
      from: { path: '^apps/([^/]+)/' },
      to: { 
        path: '^apps/([^/]+)/',
        pathNot: '^apps/$1/'
      }
    },
    {
      name: 'no-orphans',
      severity: 'warn',
      comment: 'Files without any dependencies to or from them.',
      from: { orphan: true },
      to: {}
    },
    {
      name: 'not-to-test',
      severity: 'error',
      comment: 'Production code should not import test code.',
      from: { pathNot: '^(.*\\.test\\.ts|.*\\.spec\\.ts)$' },
      to: { path: '^(.*\\.test\\.ts|.*\\.spec\\.ts)$' }
    },
    {
      name: 'L0-no-upward',
      severity: 'error',
      comment: 'Layer 0 (Base) should not import from higher layers.',
      from: { path: '^packages/(core|types-shim)/src/' },
      to: { 
        path: '^packages/',
        pathNot: '^packages/(core|types-shim|eslint-config|typescript-config)/'
      }
    },
    {
      name: 'L1-no-upward',
      severity: 'error',
      comment: 'Layer 1 (UI) should not import from higher layers.',
      from: { path: '^packages/ui/src/' },
      to: { 
        path: '^packages/',
        pathNot: '^packages/(core|types-shim|ui|eslint-config|typescript-config)/'
      }
    },
    {
      name: 'L2-no-upward',
      severity: 'error',
      comment: 'Layer 2 (Infrastructure) should not import from higher layers.',
      from: { path: '^packages/(scanner-kit|ai|analytics|form-builder|trube-art|lk-edu-geo|graphics)/src/' },
      to: { 
        path: '^packages/',
        pathNot: '^packages/(core|types-shim|ui|graphics|scanner-kit|ai|analytics|form-builder|trube-art|lk-edu-geo|eslint-config|typescript-config)/'
      }
    },
    {
      name: 'L3-no-upward',
      severity: 'error',
      comment: 'Layer 3 (Domains) should not import from Layer 4.',
      from: { path: '^packages/(classroom|people|self|admin|community|profile|workforce|library)/src/' },
      to: { 
        path: '^packages/(payments|accounting)/'
      }
    },
    {
      name: 'standalone-isolation',
      severity: 'error',
      comment: 'Standalone packages should have ZERO dependencies on Layer 3 or 4.',
      from: { path: '^packages/(trube-art|lk-edu-geo)/' },
      to: { 
        path: '^packages/(classroom|people|self|admin|community|profile|workforce|library|payments|accounting)/'
      }
    },
    {
      name: 'L0-L1-subpath-only',
      severity: 'warn',
      comment: 'For Layer 0 & 1, direct imports from the root index are discouraged. Use subpaths for heavy items (e.g., @repo/ui/icons).',
      from: { 
        pathNot: '^packages/(core|ui|graphics|types-shim)/'
      },
      to: { 
        path: '^packages/(core|ui|graphics|types-shim)/src/index\\.ts$'
      }
    },
    {
      name: 'independent-api-boundary',
      severity: 'error',
      comment: 'Independent/Public packages must be accessed only via their public API (index.ts).',
      from: { 
        pathNot: '^packages/(form-builder|trube-art|lk-edu-geo)/'
      },
      to: { 
        path: '^packages/(form-builder|trube-art|lk-edu-geo)/src/.+',
        pathNot: '^packages/(form-builder|trube-art|lk-edu-geo)/src/(index\\.ts|api/index\\.ts)$'
      }
    }
  ],
  options: {
    doNotFollow: {
      path: ['node_modules', 'dist', '.turbo']
    },
    moduleSystems: ['es6', 'cjs'],
    tsPreCompilationDeps: true,
    tsConfig: {
      fileName: 'tsconfig.json'
    },
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'require', 'node', 'default']
    },
    reporterOptions: {
      dot: {
        collapsePattern: 'node_modules/[^/]+'
      }
    }
  }
};
