# Sovereign Monorepo Hygiene Audit Report

> **Generated:** 5/22/2026, 2:48:55 PM
> **Command:** pnpm exec commitlint --from=HEAD~1 --to=HEAD; pnpm run lint; pnpm run check-types; pnpm run check:hygiene; pnpm run identity:check; pnpm run i18n:check
> **Duration:** 304.7s
> **Status:** ❌ Failed

## Executive Summary

| Category | Findings |
| :--- | :---: |
| General | 89 |
| apps/edlove-web | 15 |
| apps/gurudevi-marketingWeb | 9 |
| apps/gurudevi-mobile | 60 |
| apps/intuitui-web | 6 |
| apps/neevsk-web | 18 |
| packages/admin | 6 |
| packages/analytics | 21 |
| packages/core | 26 |
| packages/library | 6 |
| packages/lk-edu-geo | 3 |
| packages/profile | 3 |
| packages/scanner-kit | 3 |
| packages/self | 4 |
| packages/trube-art | 3 |
| packages/ui | 24 |

## Detailed Findings

### Category: General
- - Fixed linting error in principalWorkspaceRepository.ts by replacing Math.random() with crypto.randomUUID()
- [1m[31m✖[39m   found 3 problems, 0 warnings[22m
- @repo/database:lint:biome: Found 2 errors.
- @repo/database:lint:biome:     15    │ - ····throw·new·Error('DATABASE_URL·is·required·to·initialize·the·ZenStack·client');␍
- @repo/types-shim:lint:biome: Found 1 error.
- @repo/database:lint:biome:        15 │ + ····throw·new·Error('DATABASE_URL·is·required·to·initialize·the·ZenStack·client');
- @repo/types-shim:lint:biome: Found 1 warning.
- @repo/database:lint:biome:   × Some errors were emitted while running checks.
- @repo/types-shim:lint:biome:   × Some errors were emitted while running checks.
- @repo/payments:lint:biome: Found 5 warnings.
- apps-gurudevi-marketing-web:lint:biome:     37    │ - ··const·{·error·}·=·await·supabase.from('audit_logs').insert({␍
- apps-gurudevi-marketing-web:lint:biome:     51    │ - ··if·(error)·throw·error;␍
- apps-gurudevi-marketing-web:lint:biome:        37 │ + ··const·{·error·}·=·await·supabase.from('audit_logs').insert({
- apps-gurudevi-marketing-web:lint:biome:        51 │ + ··if·(error)·throw·error;
- apps-gurudevi-marketing-web:lint:biome:   × Code formatting aborted due to parsing errors. To format code with errors, enable the 'formatter.formatWithErrors' option.
- apps-gurudevi-marketing-web:lint:biome: Found 19 errors.
- apps-gurudevi-marketing-web:lint:biome: Found 23 warnings.
- apps-gurudevi-marketing-web:lint:biome:   × Some errors were emitted while running checks.
- @repo/core:lint:biome:    > 99 │         const errorData = (await res.json()) as any;
- @repo/core:lint:biome:     100 │         throw new Error(errorData.message || `Sanctuary API sync failed with status ${res.status}`);
- @repo/self:lint:biome: lint_results.json internalError/io  INTERNAL  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- @repo/self:lint:biome: Found 226 errors.
- @repo/self:lint:biome: Found 61 warnings.
- @repo/self:lint:biome:   ! This diagnostic was derived from an internal Biome error. Potential bug, please report it if necessary.
- @repo/self:lint:biome:   > 1 │ �node.exe : npm warn Unknown project config·
- @repo/self:lint:biome:   > 1 │ �node.exe : npm warn Unknown project config·
- @repo/self:lint:biome:   > 1 │ �node.exe : npm warn Unknown project config·
- @repo/self:lint:biome:   > 1 │ �node.exe : npm warn Unknown project config·
- @repo/self:lint:biome:     1 │ �node.exe : npm warn Unknown project config·
- @repo/self:lint:biome:     1 │ �node.exe : npm warn Unknown project config·
- @repo/self:lint:biome:     1 │ �node.exe : npm warn Unknown project config·
- @repo/self:lint:biome:     1 │ �node.exe : npm warn Unknown project config·
- @repo/self:lint:biome:     1 │ �node.exe : npm warn Unknown project config·
- @repo/self:lint:biome:     1 │ �node.exe : npm warn Unknown project config·
- @repo/self:lint:biome:     1 │ �node.exe : npm warn Unknown project config·
- @repo/self:lint:biome:     1 │ �node.exe : npm warn Unknown project config·
- @repo/self:lint:biome:     1 │ �node.exe : npm warn Unknown project config·
- @repo/self:lint:biome:     1 │ �node.exe : npm warn Unknown project config·
- @repo/self:lint:biome:     1 │ �node.exe : npm warn Unknown project config·
- @repo/self:lint:biome:     1 │ �node.exe : npm warn Unknown project config·
- @repo/self:lint:biome:     1 │ �node.exe : npm warn Unknown project config·
- @repo/self:lint:biome:     1 │ �node.exe : npm warn Unknown project config·
- @repo/self:lint:biome:   × Some errors were emitted while running checks.
- @repo/library:lint:biome:     190 │       throw new APIError('Failed to fetch resources', error.code, error);
- @repo/library:lint:biome:     205 │     const { data, error } = await supabase.rpc('search_map_universe', {
- @repo/library:lint:biome:     231 │       if (error) throw error;
- @repo/library:lint:biome:     268 │       throw new APIError('Failed to search knowledge universe', error.code, error);
- @repo/library:lint:biome:     680 │           const { data: membershipData, error: membershipError } = await supabase.rpc(
- @repo/core:lint:biome: scratch\extract_errors.cjs format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- @intuitui-labs/lk-edu-geo:lint:biome: Found 4 errors.
- @intuitui-labs/lk-edu-geo:lint:biome: Found 15 warnings.
- @intuitui-labs/lk-edu-geo:lint:biome:   × Some errors were emitted while running checks.
- @repo/library:lint:biome: Found 24 errors.
- @repo/library:lint:biome: Found 126 warnings.
- @repo/library:lint:biome:   × Some errors were emitted while running checks.
- @repo/core:lint:biome:     143     │ - ········console.warn(␍
- @repo/core:lint:biome:      46     │ - ······error:·null,␍
- @repo/core:lint:biome:      63     │ - ······error:·null,␍
- @repo/core:lint:biome:      93     │ - ······error:·null,␍
- @repo/core:lint:biome:     113     │ - ······error:·null,␍
- @repo/core:lint:biome:     132     │ - ······error:·null,␍
- @repo/core:lint:biome:     56    │ - ····if·(!credentials)·throw·new·Error('Hardware·identity·access·denied.');␍
- @repo/core:lint:biome:        56 │ + ····if·(!credentials)·throw·new·Error('Hardware·identity·access·denied.');
- @repo/ui:lint:biome:     4 │ [{"filePath":"C:\\Users\\Naween\\projects\\polymath-platform\\packages\\ui\\eslint.config.mjs","messages":[],"suppressedMessages":[],"errorCount":0,"fatalErrorCount":0,"warningCount":0,"fixableErrorCount":0,"fixableWarningCount":0,"usedDeprecatedRules":[]},{"filePath":"C:\\Users\\Naween\\projects\\polymath-platform\\packages\\ui\\nativewind-env.d.ts","messages":[],"suppressedMessages":[],"errorCount":0,"fatalErrorCount":0,"warningCount":0,"fixableErrorCount":0,"fixableWarningCount":0,"usedDeprecatedRules":[]},{"filePath":"C:\\Users\\Naween\\projects\\polymath-platform\\packages\\ui\\scripts\\audit-theme.ts","messages":[{"ruleId":"@typescript-eslint/no-unused-vars","severity":1,"message":"'colors' is defined but never used.","line":8,"column":10,"nodeType":"Identifier","messageId":"unusedVar","endLine":8,"endColumn":16,"suggestions":[{"messageId":"removeUnusedVar","data":{"varName":"colors"},"fix":{"range":[175,182],"text":""},"desc":"Remove unused variable \"colors\"."}]},{"ruleId":"@typescript-eslint/no-unused-vars","severity":1,"message":"'phaseMatrix' is defined but never used.","line":8,"column":18,"nodeType":"Identifier","messageId":"unusedVar","endLine":8,"endColumn":29,"suggestions":[{"messageId":"removeUnusedVar","data":{"varName":"phaseMatrix"},"fix":{"range":[181,194],"text":""},"desc":"Remove unused variable \"phaseMatrix\"."}]}],"suppressedMessages":[],"errorCount":0,"fatalErrorCount":0,"warningCount":2,"fixableErrorCount":0,"fixableWarningCount":0,"source":"/**\n * Sanctuary Theme Auditor\n *\n * Scans Theme.ts and phaseMatrix for contrast violations using APCA and WCAG 2.1.\n * Run with: npx tsx scripts/audit-theme.ts\n */\n\nimport { colors, phaseMatrix, resolvePhaseTokens } from '../src/theme/Theme';\nimport { checkAccessibility, toHex } from '../src/utils/a11yUtils';\nimport { TemporalPhase } from '../src/context/types';\n\nconst PHASES: TemporalPhase[] = ['predawn', 'dawn', 'morning', 'afternoon', 'dusk', 'night'];\nconst MODES: ('light' | 'dark')[] = ['light', 'dark'];\n\nconsole.log('\\x1b[36m%s\\x1b[0m', '--- GURUDEVI THEME ACCESSIBILITY AUDIT ---');\nconsole.log('Validating Sanctuary tokens against WCAG 2.1 and APCA Standards...\\n');\n\nlet violations = 0;\nlet totalChecks = 0;\n\nfunction report(\n  label: string,\n  fg: string,\n  bg: string,\n  requirement: { wcag?: number; apca?: number },\n) {\n  totalChecks++;\n  const fgHex = toHex(fg);\n  const bgHex = toHex(bg);\n  const { ratio, apca, apcaRating } = checkAccessibility(fgHex, bgHex);\n\n  let failed = false;\n  const details = [];\n\n  if (requirement.wcag && ratio < requirement.wcag) {\n    failed = true;\n    details.push(`WCAG: ${ratio.toFixed(2)}:1 (Min ${requirement.wcag})`);\n  }\n\n  if (requirement.apca && Math.abs(apca) < requirement.apca) {\n    failed = true;\n    details.push(`APCA: ${apca.toFixed(1)} Lc (Min ${requirement.apca} - ${apcaRating})`);\n  }\n\n  if (failed) {\n    violations++;\n    console.log(`\\x1b[31m[FAIL]\\x1b[0m ${label}`);\n    console.log(`       - BG: ${bgHex}, FG: ${fgHex}`);\n    console.log(`       - ${details.join(' | ')}`);\n  }\n}\n\n// 1. Audit Phase Matrix\nPHASES.forEach((phase) => {\n  MODES.forEach((mode) => {\n    const isDark = mode === 'dark';\n    const tokens = resolvePhaseTokens(phase, isDark);\n\n    // Primary Text Contrast\n    report(`${phase}/${mode} Primary Text`, tokens.text.primary, tokens.gradientNodes[0], {\n      wcag: 4.5,\n      apca: 75,\n    });\n\n    // Secondary Text Contrast\n    report(`${phase}/${mode} Secondary Text`, tokens.text.secondary, tokens.gradientNodes[0], {\n      wcag: 3.0,\n      apca: 60,\n    });\n\n    // Accent Action Contrast\n    report(`${phase}/${mode} Accent Action`, tokens.text.inverse, tokens.accent.action, {\n      wcag: 4.5,\n      apca: 60,\n    });\n  });\n});\n\nconsole.log('\\n--- AUDIT SUMMARY ---');\nif (violations === 0) {\n  console.log(`\\x1b[32mSUCCESS: All ${totalChecks} checks passed.\\x1b[0m`);\n  process.exit(0);\n} else {\n  console.log(\n    `\\x1b[31mWARNING: Found ${violations} accessibility violations across ${totalChecks} checks.\\x1b[0m`,\n  );\n  // We don't exit with 1 yet to avoid breaking builds until we fix the colors\n  process.exit(0);\n}\n","usedDeprecatedRules":[]},{"filePath":"C:\\Users\\Naween\\projects\\polymath-platform\\packages\\ui\\src\\__tests__\\useTheme.test.js","messages":[{"ruleId":"@typescript-eslint/no-require-imports","severity":1,"message":"A `require()` style import is forbidden.","line":1,"column":54,"nodeType":"CallExpression","messageId":"noRequireImports","endLine":1,"endColumn":79},{"ruleId":"no-undef","severity":1,"message":"'require' is not defined.","line":1,"column":54,"nodeType":"Identifier","messageId":"undef","endLine":1,"endColumn":61},{"ruleId":"no-undef","severity":1,"message":"'describe' is not defined.","line":3,"column":1,"nodeType":"Identifier","messageId":"undef","endLine":3,"endColumn":9},{"ruleId":"no-undef","severity":1,"message":"'it' is not defined.","line":4,"column":3,"nodeType":"Identifier","messageId":"undef","endLine":4,"endColumn":5},{"ruleId":"no-undef","severity":1,"message":"'expect' is not defined.","line":7,"column":5,"nodeType":"Identifier","messageId":"undef","endLine":7,"endColumn":11},{"ruleId":"no-undef","severity":1,"message":"'expect' is not defined.","line":8,"column":5,"nodeType":"Identifier","messageId":"undef","endLine":8,"endColumn":11},{"ruleId":"no-undef","severity":1,"message":"'expect' is not defined.","line":9,"column":5,"nodeType":"Identifier","messageId":"undef","endLine":9,"endColumn":11},{"ruleId":"no-undef","severity":1,"message":"'expect' is not defined.","line":10,"column":5,"nodeType":"Identifier","messageId":"undef","endLine":10,"endColumn":11},{"ruleId":"no-undef","severity":1,"message":"'expect' is not defined.","line":11,"column":5,"nodeType":"Identifier","messageId":"undef","endLine":11,"endColumn":11},{"ruleId":"no-undef","severity":1,"message":"'it' is not defined.","line":14,"column":3,"nodeType":"Identifier","messageId":"undef","endLine":14,"endColumn":5},{"ruleId":"no-undef","severity":1,"message":"'expect' is not defined.","line":17,"column":5,"nodeType":"Identifier","messageId":"undef","endLine":17,"endColumn":11},{"ruleId":"no-undef","severity":1,"message":"'expect' is not defined.","line":18,"column":5,"nodeType":"Identifier","messageId":"undef","endLine":18,"endColumn":11},{"ruleId":"no-undef","severity":1,"message":"'expect' is not defined.","line":19,"column":5,"nodeType":"Identifier","messageId":"undef","endLine":19,"endColumn":11},{"ruleId":"no-undef","severity":1,"message":"'expect' is not defined.","line":20,"column":5,"nodeType":"Identifier","messageId":"undef","endLine":20,"endColumn":11},{"ruleId":"no-undef","severity":1,"message":"'expect' is not defined.","line":21,"column":5,"nodeType":"Identifier","messageId":"undef","endLine":21,"endColumn":11},{"ruleId":"no-undef","severity":1,"message":"'it' is not defined.","line":24,"column":3,"nodeType":"Identifier","messageId":"undef","endLine":24,"endColumn":5},{"ruleId":"no-undef","severity":1,"message":"'expect' is not defined.","line":28,"column":7,"nodeType":"Identifier","messageId":"undef","endLine":28,"endColumn":13},{"ruleId":"no-undef","severity":1,"message":"'expect' is not defined.","line":29,"column":7,"nodeType":"Identifier","messageId":"undef","endLine":29,"endColumn":13},{"ruleId":"no-undef","severity":1,"message":"'it' is not defined.","line":33,"column":3,"nodeType":"Identifier","messageId":"undef","endLine":33,"endColumn":5},{"ruleId":"no-undef","severity":1,"message":"'expect' is not defined.","line":37,"column":5,"nodeType":"Identifier","messageId":"undef","endLine":37,"endColumn":11},{"ruleId":"no-undef","severity":1,"message":"'expect' is not defined.","line":38,"column":5,"nodeType":"Identifier","messageId":"undef","endLine":38,"endColumn":11},{"ruleId":"no-undef","severity":1,"message":"'expect' is not defined.","line":39,"column":5,"nodeType":"Identifier","messageId":"undef","endLine":39,"endColumn":11},{"ruleId":"no-undef","severity":1,"message":"'expect' is not defined.","line":40,"column":5,"nodeType":"Identifier","messageId":"undef","endLine":40,"endColumn":11}],"suppressedMessages":[],"errorCount":0,"fatalErrorCount":0,"warningCount":23,"fixableErrorCount":0,"fixableWarningCount":0,"source":"const { resolveClassicTokens, resolvePhaseTokens } = require('../theme/Theme');\n\ndescribe('resolvePhaseTokens', () => {\n  it('returns scene tokens for night/dark', () => {\n    const tokens = resolvePhaseTokens('night', true);\n\n    expect(tokens.scene.world.bg).toBe('#0F131C');\n    expect(tokens.scene.chrome.bg).toBe(tokens.glass.surface.bg);\n    expect(tokens.scene.elevated.bg).toBe(tokens.glass.modal.bg);\n    expect(tokens.text.onWorld).toBe('#FCF9F2');\n    expect(tokens.accent.action).toBe('#FDD925');\n  });\n\n  it('returns scene tokens for morning/light', () => {\n    const tokens = resolvePhaseTokens('morning', false);\n\n    expect(tokens.scene.world.bg).toBe('#F5EDD6');\n    expect(tokens.scene.canvas.bg).toBe('#DCFCE7');\n    expect(tokens.text.onCanvas).toBe('#2A2318');\n    expect(tokens.accent.action).toBe('#8BBF7A');\n    expect(tokens.text.onAccent).toBe(tokens.text.inverse);\n  });\n\n  it('all six phases resolve without throwing in both worlds', () => {\n    const phases = ['predawn', 'dawn', 'morning', 'afternoon', 'dusk', 'night'];\n\n    phases.forEach((phase) => {\n      expect(() => resolvePhaseTokens(phase, false)).not.toThrow();\n      expect(() => resolvePhaseTokens(phase, true)).not.toThrow();\n    });\n  });\n\n  it('classic tokens project into the same scene contract', () => {\n    const lightClassic = resolveClassicTokens(false);\n    const darkClassic = resolveClassicTokens(true);\n\n    expect(lightClassic.scene.canvas.bg).toBe('#FAF7ED');\n    expect(lightClassic.text.onCanvas).toBe('#2A2318');\n    expect(darkClassic.scene.world.bg).toBe('#0F131C');\n    expect(darkClassic.text.onWorld).toBe('#FCF9F2');\n  });\n});\n","usedDeprecatedRules":[]},{"filePath":"C:\\Users\\Naween\\projects\\polymath-platform\\packages\\ui\\src\\archive\\LotusPetalFAB.complex.tsx","messages":[{"ruleId":"@typescript-eslint/no-unused-vars","severity":1,"message":"'runOnJS' is defined but never used.","line":27,"column":3,"nodeType":"Identifier","messageId":"unusedVar","endLine":27,"endColumn":10,"suggestions":[{"messageId":"removeUnusedVar","data":{"varName":"runOnJS"},"fix":{"range":[709,720],"text":""},"desc":"Remove unused variable \"runOnJS\"."}]},{"ruleId":"@typescript-eslint/no-unused-vars","severity":1,"message":"'FAB_HIT_SLOP' is assigned a value but never used.","line":61,"column":7,"nodeType":"Identifier","messageId":"unusedVar","endLine":61,"endColumn":19},{"ruleId":"@typescript-eslint/no-unused-vars","severity":1,"message":"'ACTION_BUBBLE_SIZE' is assigned a value but never used.","line":62,"column":7,"nodeType":"Identifier","messageId":"unusedVar","endLine":62,"endColumn":25},{"ruleId":"@typescript-eslint/no-unused-vars","severity":1,"message":"'SCREEN_WIDTH' is assigned a value but never used.","line":65,"column":7,"nodeType":"Identifier","messageId":"unusedVar","endLine":65,"endColumn":19},{"ruleId":"@typescript-eslint/no-require-imports","severity":1,"message":"A `require()` style import is forbidden.","line":93,"column":21,"nodeType":"CallExpression","messageId":"noRequireImports","endLine":93,"endColumn":67},{"ruleId":"react-hooks/rules-of-hooks","severity":1,"message":"React Hook \"useSharedValue\" is called conditionally. React Hooks must be called in the exact same order in every component render.","line":114,"column":22,"nodeType":"Identifier","endLine":114,"endColumn":36},{"ruleId":"react-hooks/rules-of-hooks","severity":1,"message":"React Hook \"useSharedValue\" is called conditionally. React Hooks must be called in the exact same order in every component render.","line":116,"column":26,"nodeType":"Identifier","endLine":116,"endColumn":40},{"ruleId":"react-hooks/rules-of-hooks","severity":1,"message":"React Hook \"useSharedValue\" is called conditionally. React Hooks must be called in the exact same order in every component render.","line":118,"column":22,"nodeType":"Identifier","endLine":118,"endColumn":36},{"ruleId":"react-hooks/rules-of-hooks","severity":1,"message":"React Hook \"useSharedValue\" is called conditionally. React Hooks must be called in the exact same order in every component render.","line":119,"column":22,"nodeType":"Identifier","endLine":119,"endColumn":36},{"ruleId":"react-hooks/rules-of-hooks","severity":1,"message":"React Hook \"useRef\" is called conditionally. React Hooks must be called in the exact same order in every component render.","line":121,"column":17,"nodeType":"Identifier","endLine":121,"endColumn":23},{"ruleId":"react-hooks/rules-of-hooks","severity":1,"message":"React Hook \"useRef\" is called conditionally. React Hooks must be called in the exact same order in every component render.","line":122,"column":17,"nodeType":"Identifier","endLine":122,"endColumn":23},{"ruleId":"react-hooks/rules-of-hooks","severity":1,"message":"React Hook \"useState\" is called conditionally. React Hooks must be called in the exact same order in every component render.","line":124,"column":41,"nodeType":"Identifier","endLine":124,"endColumn":49},{"ruleId":"react-hooks/rules-of-hooks","severity":1,"message":"React Hook \"useSharedValue\" is called conditionally. React Hooks must be called in the exact same order in every component render.","line":125,"column":27,"nodeType":"Identifier","endLine":125,"endColumn":41},{"ruleId":"react-hooks/rules-of-hooks","severity":1,"message":"React Hook \"useRef\" is called conditionally. React Hooks must be called in the exact same order in every component render.","line":127,"column":26,"nodeType":"Identifier","endLine":127,"endColumn":32},{"ruleId":"react-hooks/rules-of-hooks","severity":1,"message":"React Hook \"useState\" is called conditionally. React Hooks must be called in the exact same order in every component render.","line":128,"column":39,"nodeType":"Identifier","endLine":128,"endColumn":47},{"ruleId":"react-hooks/rules-of-hooks","severity":1,"message":"React Hook \"useMemo\" is called conditionally. React Hooks must be called in the exact same order in every component render.","line":131,"column":18,"nodeType":"Identifier","endLine":131,"endColumn":25},{"ruleId":"@typescript-eslint/no-unused-vars","severity":1,"message":"'IconComponent' is assigned a value but never used.","line":132,"column":9,"nodeType":"Identifier","messageId":"unusedVar","endLine":132,"endColumn":22},{"ruleId":"react-hooks/rules-of-hooks","severity":1,"message":"React Hook \"useCallback\" is called conditionally. React Hooks must be called in the exact same order in every component render.","line":135,"column":25,"nodeType":"Identifier","endLine":135,"endColumn":36},{"ruleId":"@typescript-eslint/no-unused-vars","severity":1,"message":"'error' is defined but never used.","line":138,"column":14,"nodeType":"Identifier","messageId":"unusedVar","endLine":138,"endColumn":19},{"ruleId":"react-hooks/rules-of-hooks","severity":1,"message":"React Hook \"useRef\" is called conditionally. React Hooks must be called in the exact same order in every component render.","line":144,"column":24,"nodeType":"Identifier","endLine":144,"endColumn":30},{"ruleId":"react-hooks/refs","severity":1,"message":"Error: Cannot access refs during render\n\nReact refs are values that are not needed for rendering. Refs should only be accessed outside of render, such as in event handlers or effects. Accessing a ref value (the `current` property) during render can cause your component not to update as expected (https://react.dev/reference/react/useRef).\n\nC:\\Users\\Naween\\projects\\polymath-platform\\packages\\ui\\src\\archive\\LotusPetalFAB.complex.tsx:145:25\n  143 |   // Pan responder for drag functionality\n  144 |   const panResponder = useRef(\n> 145 |     PanResponder.create({\n      |                         ^\n> 146 |       onStartShouldSetPanResponder: () => true,\n      | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^\n> 147 |       onMoveShouldSetPanResponder: (_, gestureState) => {\n      ΓÇª\n      | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^\n> 184 |       },\n      | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^\n> 185 |     }),\n      | ^^^^^^ Passing a ref to a function may read its value during render\n  186 |   ).current;\n  187 |\n  188 |   // ============================================================================","line":145,"column":25,"nodeType":null,"endLine":185,"endColumn":6},{"ruleId":"react-hooks/rules-of-hooks","severity":1,"message":"React Hook \"useEffect\" is called conditionally. React Hooks must be called in the exact same order in every component render.","line":192,"column":3,"nodeType":"Identifier","endLine":192,"endColumn":12},{"ruleId":"react-hooks/exhaustive-deps","severity":1,"message":"React Hook useEffect has a missing dependency: 'breathingScale'. Either include it or remove the dependency array.","line":206,"column":6,"nodeType":"ArrayExpression","endLine":206,"endColumn":39,"suggestions":[{"desc":"Update the dependencies array to be: [breathingScale, disabled, isReduceMotionEnabled]","fix":{"range":[6445,6478],"text":"[breathingScale, disabled, isReduceMotionEnabled]"}}]},{"ruleId":"react-hooks/rules-of-hooks","severity":1,"message":"React Hook \"useAnimatedStyle\" is called conditionally. React Hooks must be called in the exact same order in every component render.","line":212,"column":26,"nodeType":"Identifier","endLine":212,"endColumn":42},{"ruleId":"react-hooks/rules-of-hooks","severity":1,"message":"React Hook \"useAnimatedStyle\" is called conditionally. React Hooks must be called in the exact same order in every component render.","line":218,"column":22,"nodeType":"Identifier","endLine":218,"endColumn":38},{"ruleId":"react-hooks/rules-of-hooks","severity":1,"message":"React Hook \"useCallback\" is called conditionally. React Hooks must be called in the exact same order in every component render.","line":224,"column":23,"nodeType":"Identifier","endLine":224,"endColumn":34},{"ruleId":"react-hooks/immutability","severity":1,"message":"Error: This value cannot be modified\n\nThis modifies a variable that React considers immutable.\n\nC:\\Users\\Naween\\projects\\polymath-platform\\packages\\ui\\src\\archive\\LotusPetalFAB.complex.tsx:240:7\n  238 |     if (onPress) {\n  239 |       triggerHaptic();\n> 240 |       pressScale.value = withSequence(\n      |       ^^^^^^^^^^ `pressScale` cannot be modified\n  241 |         withTiming(0.85, { duration: 100 }),\n  242 |         withSpring(1.0, { damping: 12, stiffness: 200 }),\n  243 |       );","line":240,"column":7,"nodeType":null,"endLine":240,"endColumn":17},{"ruleId":"react-hooks/exhaustive-deps","severity":1,"message":"React Hook useCallback has missing dependencies: 'actionMenuScale', 'announce', and 'pressScale'. Either include them or remove the dependency array.","line":246,"column":6,"nodeType":"ArrayExpression","endLine":246,"endColumn":62,"suggestions":[{"desc":"Update the dependencies array to be: [disabled, actions, onPress, triggerHaptic, showActions, actionMenuScale, announce, pressScale]","fix":{"range":[7526,7582],"text":"[disabled, actions, onPress, triggerHaptic, showActions, actionMenuScale, announce, pressScale]"}}]},{"ruleId":"react-hooks/rules-of-hooks","severity":1,"message":"React Hook \"useAnimatedStyle\" is called conditionally. React Hooks must be called in the exact same order in every component render.","line":248,"column":27,"nodeType":"Identifier","endLine":248,"endColumn":43},{"ruleId":"@typescript-eslint/no-explicit-any","severity":1,"message":"Unexpected any. Specify a different type.","line":252,"column":10,"nodeType":"TSAnyKeyword","messageId":"unexpectedAny","endLine":252,"endColumn":13,"suggestions":[{"messageId":"suggestUnknown","fix":{"range":[7790,7793],"text":"unknown"},"desc":"Use `unknown` instead, this will force you to explicitly, and safely assert the type is correct."},{"messageId":"suggestNever","fix":{"range":[7790,7793],"text":"never"},"desc":"Use `never` instead, this is useful when instantiating generic type parameters that you don't need to know the type of."}]},{"ruleId":"react-hooks/rules-of-hooks","severity":1,"message":"React Hook \"useEffect\" is called conditionally. React Hooks must be called in the exact same order in every component render.","line":255,"column":3,"nodeType":"Identifier","endLine":255,"endColumn":12},{"ruleId":"react-hooks/immutability","severity":1,"message":"Error: This value cannot be modified\n\nModifying a value previously passed as an argument to a hook is not allowed. Consider moving the modification before calling the hook.\n\nC:\\Users\\Naween\\projects\\polymath-platform\\packages\\ui\\src\\archive\\LotusPetalFAB.complex.tsx:256:5\n  254 |\n  255 |   useEffect(() => {\n> 256 |     actionMenuScale.value = withSpring(showActions ? 1 : 0, {\n      |     ^^^^^^^^^^^^^^^ `actionMenuScale` cannot be modified\n  257 |       damping: 15,\n  258 |       stiffness: 150,\n  259 |     });","line":256,"column":5,"nodeType":null,"endLine":256,"endColumn":20},{"ruleId":"react-hooks/exhaustive-deps","severity":1,"message":"React Hook useEffect has a missing dependency: 'actionMenuScale'. Either include it or remove the dependency array.","line":260,"column":6,"nodeType":"ArrayExpression","endLine":260,"endColumn":19,"suggestions":[{"desc":"Update the dependencies array to be: [actionMenuScale, showActions]","fix":{"range":[7938,7951],"text":"[actionMenuScale, showActions]"}}]},{"ruleId":"react-hooks/rules-of-hooks","severity":1,"message":"React Hook \"useEffect\" is called conditionally. React Hooks must be called in the exact same order in every component render.","line":262,"column":3,"nodeType":"Identifier","endLine":262,"endColumn":12},{"ruleId":"react-hooks/rules-of-hooks","severity":1,"message":"React Hook \"useAnimatedStyle\" is called conditionally. React Hooks must be called in the exact same order in every component render.","line":270,"column":23,"nodeType":"Identifier","endLine":270,"endColumn":39},{"ruleId":"react-hooks/rules-of-hooks","severity":1,"message":"React Hook \"useAnimatedStyle\" is called conditionally. React Hooks must be called in the exact same order in every component render.","line":282,"column":21,"nodeType":"Identifier","endLine":282,"endColumn":37},{"ruleId":"@typescript-eslint/no-explicit-any","severity":1,"message":"Unexpected any. Specify a different type.","line":285,"column":10,"nodeType":"TSAnyKeyword","messageId":"unexpectedAny","endLine":285,"endColumn":13,"suggestions":[{"messageId":"suggestUnknown","fix":{"range":[8586,8589],"text":"unknown"},"desc":"Use `unknown` instead, this will force you to explicitly, and safely assert the type is correct."},{"messageId":"suggestNever","fix":{"range":[8586,8589],"text":"never"},"desc":"Use `never` instead, this is useful when instantiating generic type parameters that you don't need to know the type of."}]},{"ruleId":"react-hooks/rules-of-hooks","severity":1,"message":"React Hook \"useMemo\" is called conditionally. React Hooks must be called in the exact same order in every component render.","line":288,"column":26,"nodeType":"Identifier","endLine":288,"endColumn":33},{"ruleId":"react-hooks/refs","severity":1,"message":"Error: Cannot access refs during render\n\nReact refs are values that are not needed for rendering. Refs should only be accessed outside of render, such as in event handlers or effects. Accessing a ref value (the `current` property) during render can cause your component not to update as expected (https://react.dev/reference/react/useRef).\n\nC:\\Users\\Naween\\projects\\polymath-platform\\packages\\ui\\src\\archive\\LotusPetalFAB.complex.tsx:303:11\n  301 |   return (\n  302 |     <Animated.View\n> 303 |       {...panResponder.panHandlers}\n      |           ^^^^^^^^^^^^^^^^^^^^^^^^ Cannot access ref value during render\n  304 |       style={containerStyle}\n  305 |       accessible={true}\n  306 |       accessibilityRole=\"image\" // The FAB itself is an image/button","line":303,"column":11,"nodeType":null,"endLine":303,"endColumn":35},{"ruleId":"react-native-a11y/has-valid-accessibility-ignores-invert-colors","severity":1,"message":"Found an element which will be inverted. Add the accessibilityIgnoresInvertColors prop","line":318,"column":9,"nodeType":"JSXElement","endLine":318,"endColumn":86},{"ruleId":"react-native-a11y/has-accessibility-hint","severity":1,"message":"has accessibilityLabel prop but no accessibilityHint","line":332,"column":13,"nodeType":"JSXOpeningElement","endLine":342,"endColumn":14}],"suppressedMessages":[],"errorCount":0,"fatalErrorCount":0,"warningCount":41,"fixableErrorCount":0,"fixableWarningCount":0,"source":"/**\n * LOTUS PETAL FAB - Floating Action Button\n *\n * A petal-shaped floating action button with:\n * - Golden Lotus Art image\n * - Breathing animation (4-second cycle)\n * - Context-aware icons per tab\n * - Press animation with haptic feedback\n * - Floating bubble physics for dragging\n *\n * Philosophy: Organic, living UI that breathes with intention\n */\n\nimport React, { FC, useMemo, useEffect, useCallback, useState, useRef } from 'react';\nimport { View, Pressable, StyleSheet, Text, PanResponder, Dimensions, Image } from 'react-native';\nimport Animated, {\n  useAnimatedStyle,\n  withRepeat,\n  withTiming,\n  withSequence,\n  withSpring,\n  interpolate,\n  SharedValue,\n  Extrapolate,\n  useSharedValue,\n  Easing,\n  runOnJS,\n} from 'react-native-reanimated';\nimport * as Haptics from 'expo-haptics';\nimport { Flower2, Plus, MessageCircle, Upload, Edit } from 'lucide-react-native';\nimport { Theme } from '../theme/Theme';\nimport { useAccessibility } from '../hooks/useAccessibility';\n\n// ============================================================================\n// TYPES\n// ============================================================================\n\ntype TabType = 'self' | 'classroom' | 'community' | 'library' | 'profile';\n\nexport interface ActionItem {\n  label: string;\n  onPress: () => void;\n  icon?: React.ComponentType<{ size: number; color: string; strokeWidth: number }>;\n}\n\ninterface LotusPetalFABProps {\n  currentTab?: TabType;\n  onPress?: () => void;\n  icon?: React.ReactNode;\n  actions?: ActionItem[];\n  scrollY?: SharedValue<number>;\n  disabled?: boolean;\n  bottomInset?: number; // New prop for safe area handling\n}\n\n// ============================================================================\n// CONSTANTS\n// ============================================================================\n\nconst FAB_SIZE = 72; // Slightly larger for the art\nconst FAB_HIT_SLOP = 10;\nconst ACTION_BUBBLE_SIZE = 48;\nconst ACTION_BUBBLE_SPACING = 12;\nconst LONG_PRESS_DURATION = 400; // milliseconds\nconst SCREEN_WIDTH = Dimensions.get('window').width;\n\n// Context-aware configuration\ntype IconComponentType = React.ComponentType<{ size: number; color: string; strokeWidth: number }>;\n\nconst fabConfig: Record<TabType, { IconComponent: IconComponentType; label: string }> = {\n  self: {\n    IconComponent: Flower2,\n    label: 'Log mood',\n  },\n  classroom: {\n    IconComponent: Plus,\n    label: 'Create lesson',\n  },\n  community: {\n    IconComponent: MessageCircle,\n    label: 'Post announcement',\n  },\n  library: {\n    IconComponent: Upload,\n    label: 'Upload resource',\n  },\n  profile: {\n    IconComponent: Edit,\n    label: 'Edit profile',\n  },\n};\n\nconst LOTUS_IMAGE = require('../../assets/images/lotus_bloom.png');\n\n// ============================================================================\n// MAIN COMPONENT\n// ============================================================================\n\nconst LotusPetalFAB: FC<LotusPetalFABProps> = ({\n  currentTab = 'self',\n  onPress,\n  icon,\n  actions,\n  scrollY,\n  disabled = true,\n  bottomInset = Theme.spacing.lg, // Default value if not provided\n}) => {\n  const { isReduceMotionEnabled, announce } = useAccessibility();\n\n  // TEMPORARY: Return null if disabled to completely hide the FAB\n  if (disabled) return null;\n\n  // Shared value for press animation\n  const pressScale = useSharedValue(1);\n  // Shared value for breathing animation\n  const breathingScale = useSharedValue(0.95);\n  // Position for dragging\n  const translateX = useSharedValue(0);\n  const translateY = useSharedValue(0);\n  // Base position accumulator\n  const baseX = useRef(0);\n  const baseY = useRef(0);\n  // State for showing action menu\n  const [showActions, setShowActions] = useState(false);\n  const actionMenuScale = useSharedValue(0);\n  // Track long press\n  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);\n  const [isDragging, setIsDragging] = useState(false);\n\n  // Memoize current configuration to avoid unnecessary recalculations\n  const config = useMemo(() => fabConfig[currentTab], [currentTab]);\n  const IconComponent = config.IconComponent;\n\n  // Safe haptic feedback wrapper\n  const triggerHaptic = useCallback(async () => {\n    try {\n      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);\n    } catch (error) {\n      console.warn('Haptic feedback not available');\n    }\n  }, []);\n\n  // Pan responder for drag functionality\n  const panResponder = useRef(\n    PanResponder.create({\n      onStartShouldSetPanResponder: () => true,\n      onMoveShouldSetPanResponder: (_, gestureState) => {\n        return isDragging || Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5;\n      },\n      onPanResponderGrant: () => {\n        longPressTimer.current = setTimeout(() => {\n          setIsDragging(true);\n          triggerHaptic();\n          // Slight lift effect\n          pressScale.value = withSpring(1.1);\n        }, LONG_PRESS_DURATION);\n      },\n      onPanResponderMove: (_, gestureState) => {\n        if (isDragging) {\n          translateX.value = baseX.current + gestureState.dx;\n          translateY.value = baseY.current + gestureState.dy;\n        }\n      },\n      onPanResponderRelease: (_, gestureState) => {\n        if (longPressTimer.current) {\n          clearTimeout(longPressTimer.current);\n          longPressTimer.current = null;\n        }\n\n        if (isDragging) {\n          baseX.current += gestureState.dx;\n          baseY.current += gestureState.dy;\n          setIsDragging(false);\n          // Spring back slightly on release (bubble effect)\n          pressScale.value = withSpring(1.0);\n\n          // Optional: Snap back if near edge? For now, free floating.\n        } else {\n          const moved = Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5;\n          if (!moved) {\n            handlePress();\n          }\n        }\n      },\n    }),\n  ).current;\n\n  // ============================================================================\n  // ANIMATION INITIALIZATION\n  // ============================================================================\n\n  useEffect(() => {\n    if (!disabled && !isReduceMotionEnabled) {\n      breathingScale.value = 0.95;\n      breathingScale.value = withRepeat(\n        withTiming(1.02, {\n          duration: 3000,\n          easing: Easing.inOut(Easing.ease),\n        }),\n        -1,\n        true,\n      );\n    } else {\n      breathingScale.value = withTiming(1.0, { duration: 200 });\n    }\n  }, [disabled, isReduceMotionEnabled]);\n\n  // ============================================================================\n  // ANIMATION STYLES\n  // ============================================================================\n\n  const breathingStyle = useAnimatedStyle(() => {\n    return {\n      transform: [{ scale: breathingScale.value }],\n    };\n  });\n\n  const pressStyle = useAnimatedStyle(() => {\n    return {\n      transform: [{ scale: pressScale.value }],\n    };\n  });\n\n  const handlePress = useCallback(() => {\n    if (disabled) return;\n\n    if (actions && actions.length > 0) {\n      triggerHaptic();\n      setShowActions(!showActions);\n      actionMenuScale.value = withSpring(showActions ? 0 : 1, {\n        damping: 15,\n        stiffness: 150,\n      });\n      announce(showActions ? 'Actions menu closed' : 'Actions menu opened');\n      return;\n    }\n\n    if (onPress) {\n      triggerHaptic();\n      pressScale.value = withSequence(\n        withTiming(0.85, { duration: 100 }),\n        withSpring(1.0, { damping: 12, stiffness: 200 }),\n      );\n      onPress();\n    }\n  }, [disabled, onPress, actions, showActions, triggerHaptic]);\n\n  const actionMenuStyle = useAnimatedStyle(() => {\n    return {\n      transform: [{ scale: actionMenuScale.value }, { translateY: -10 }], // Pop up slightly\n      opacity: actionMenuScale.value,\n    } as any;\n  });\n\n  useEffect(() => {\n    actionMenuScale.value = withSpring(showActions ? 1 : 0, {\n      damping: 15,\n      stiffness: 150,\n    });\n  }, [showActions]);\n\n  useEffect(() => {\n    return () => {\n      if (longPressTimer.current) {\n        clearTimeout(longPressTimer.current);\n      }\n    };\n  }, []);\n\n  const scrollStyle = useAnimatedStyle(() => {\n    if (!scrollY) return {};\n    return {\n      transform: [\n        {\n          translateY: interpolate(scrollY.value, [0, 100], [0, 100], Extrapolate.CLAMP),\n        },\n      ],\n      opacity: interpolate(scrollY.value, [0, 50, 100], [1, 0.5, 0], Extrapolate.CLAMP),\n    };\n  });\n\n  const dragStyle = useAnimatedStyle(() => {\n    return {\n      transform: [{ translateX: translateX.value }, { translateY: translateY.value }],\n    } as any;\n  });\n\n  const containerStyle = useMemo(\n    () => [\n      styles.container,\n      { bottom: bottomInset }, // Override bottom with prop\n      breathingStyle,\n      pressStyle,\n      scrollStyle,\n      dragStyle,\n      disabled && styles.disabled,\n    ],\n    [bottomInset, breathingStyle, pressStyle, scrollStyle, dragStyle, disabled],\n  );\n\n  return (\n    <Animated.View\n      {...panResponder.panHandlers}\n      style={containerStyle}\n      accessible={true}\n      accessibilityRole=\"image\" // The FAB itself is an image/button\n      accessibilityLabel={config.label}\n      accessibilityHint={actions && actions.length > 0 ? 'Double tap to view actions' : undefined}\n      accessibilityState={{ disabled, expanded: showActions }}\n      accessibilityActions={[{ name: 'activate', label: 'Activate' }]}\n      onAccessibilityAction={handlePress}\n    >\n      <View style={styles.contentContainer}>\n        {/* Glow Behind */}\n        <View style={styles.glow} />\n\n        {/* Lotus Image */}\n        <Image source={LOTUS_IMAGE} style={styles.lotusImage} resizeMode=\"contain\" />\n\n        {/* Optional Icon Overlay */}\n        {icon && (\n          <View style={styles.iconOverlay}>\n            <>{icon}</>\n          </View>\n        )}\n      </View>\n\n      {/* Action Menu */}\n      {actions && actions.length > 0 && (\n        <Animated.View style={[styles.actionMenu, actionMenuStyle]}>\n          {actions.map((action, index) => (\n            <Pressable\n              key={index}\n              style={styles.actionBubble}\n              onPress={() => {\n                triggerHaptic();\n                action.onPress();\n              }}\n              accessible={true}\n              accessibilityRole=\"button\"\n              accessibilityLabel={action.label}\n            >\n              <View style={styles.actionBubbleContent}>\n                {action.icon && (\n                  <action.icon size={18} color={Theme.colors.lotusDeepPink} strokeWidth={2} />\n                )}\n                <Text style={styles.actionLabel}>{action.label}</Text>\n              </View>\n            </Pressable>\n          ))}\n        </Animated.View>\n      )}\n    </Animated.View>\n  );\n};\n\n// ============================================================================\n// STYLES\n// ============================================================================\n\nconst styles = StyleSheet.create({\n  container: {\n    position: 'absolute',\n    // bottom set dynamically\n    right: Theme.spacing.lg,\n    zIndex: Theme.zIndex.fab,\n    alignItems: 'center',\n    justifyContent: 'center',\n  },\n  contentContainer: {\n    width: FAB_SIZE,\n    height: FAB_SIZE,\n    alignItems: 'center',\n    justifyContent: 'center',\n  },\n  lotusImage: {\n    width: '100%',\n    height: '100%',\n    zIndex: 2,\n    backgroundColor: 'transparent',\n  },\n  iconOverlay: {\n    position: 'absolute',\n    zIndex: 3,\n    alignItems: 'center',\n    justifyContent: 'center',\n  },\n  glow: {\n    position: 'absolute',\n    width: FAB_SIZE * 0.8,\n    height: FAB_SIZE * 0.8,\n    borderRadius: FAB_SIZE,\n    backgroundColor: Theme.colors.sanctuarySaffron,\n    opacity: 0.4,\n    shadowColor: Theme.colors.sanctuarySaffron,\n    shadowOffset: { width: 0, height: 0 },\n    shadowOpacity: 0.8,\n    shadowRadius: 20,\n    elevation: 10,\n    zIndex: 1,\n  },\n  disabled: {\n    opacity: 0.5,\n  },\n  actionMenu: {\n    position: 'absolute',\n    bottom: FAB_SIZE + ACTION_BUBBLE_SPACING,\n    right: 0,\n    alignItems: 'flex-end',\n  },\n  actionBubble: {\n    backgroundColor: Theme.colors.ink,\n    borderRadius: 24,\n    marginBottom: ACTION_BUBBLE_SPACING,\n    paddingHorizontal: 16,\n    paddingVertical: 10,\n    ...Theme.shadows.md,\n    minWidth: 100,\n    borderColor: 'rgba(255,255,255,0.1)',\n    borderWidth: 1,\n  },\n  actionBubbleContent: {\n    flexDirection: 'row',\n    alignItems: 'center',\n    justifyContent: 'flex-end',\n    gap: 8,\n  },\n  actionLabel: {\n    color: Theme.colors.sacredWhite,\n    fontSize: 14,\n    fontWeight: '600',\n  },\n});\n\nexport default LotusPetalFAB;\n","usedDeprecatedRules":[]},{"filePath":"C:\\Users\\Naween\\projects\\polymath-platform\\packages\\ui\\src\\button.tsx","messages":[],"suppressedMessages":[],"errorCount":0,"fatalErrorCount":0,"warningCount":0,"fixableErrorCount":0,"fixableWarningCount":0,"usedDeprecatedRules":[]},{"filePath":"C:\\Users\\Naween\\projects\\polymath-platform\\packages\\ui\\src\\card.tsx","messages":[],"suppressedMessages":[],"errorCount":0,"fatalErrorCount":0,"warningCount":0,"fixableErrorCount":0,"fixableWarningCount":0,"usedDeprecatedRules":[]},{"filePath":"C:\\Users\\Naween\\projects\\polymath-platform\\packages\\ui\\src\\code.tsx","messages":[],"suppressedMessages":[],"errorCount":0,"fatalErrorCount":0,"warningCount":0,"fixableErrorCount":0,"fixableWarningCount":0,"usedDeprecatedRules":[]},{"filePath":"C:\\Users\\Naween\\projects\\polymath-platform\\packages\\ui\\src\\components-legacy\\box\\index.tsx","messages":[{"ruleId":"@typescript-eslint/no-explicit-any","severity":1,"message":"Unexpected any. Specify a different type.","line":18,"column":35,"nodeType":"TSAnyKeyword","messageId":"unexpectedAny","endLine":18,"endColumn":38,"suggestions":[{"messageId":"suggestUnknown","fix":{"range":[407,410],"text":"unknown"},"desc":"Use `unknown` instead, this will force you to explicitly, and safely assert the type is correct."},{"messageId":"suggestNever","fix":{"range":[407,410],"text":"never"},"desc":"Use `never` instead, this is useful when instantiating generic type parameters that you don't need to know the type of."}]}],"suppressedMessages":[],"errorCount":0,"fatalErrorCount":0,"warningCount":1,"fixableErrorCount":0,"fixableWarningCount":0,"source":"import React from 'react';\nimport { View, type ViewProps } from 'react-native';\nimport { cssInterop } from 'nativewind';\n\nconst StyledView = View;\n\ncssInterop(StyledView, {\n  className: {\n    target: 'style',\n  },\n});\n\nexport interface IBoxProps extends ViewProps {\n  className?: string;\n}\n\nconst Box = React.forwardRef<View, IBoxProps>(({ className, ...props }, ref) => {\n  const Component = StyledView as any;\n  return <Component {...props} ref={ref} className={className} />;\n});\n\nBox.displayName = 'Box';\n\nexport { Box };\n","usedDeprecatedRules":[]},{"filePath":"C:\\Users\\Naween\\projects\\polymath-platform\\packages\\ui\\src\\components-legacy\\button\\index.tsx","messages":[{"ruleId":"@typescript-eslint/no-explicit-any","severity":1,"message":"Unexpected any. Specify a different type.","line":18,"column":33,"nodeType":"TSAnyKeyword","messageId":"unexpectedAny","endLine":18,"endColumn":36,"suggestions":[{"messageId":"suggestUnknown","fix":{"range":[439,442],"text":"unknown"},"desc":"Use `unknown` instead, this will force you to explicitly, and safely assert the type is correct."},{"messageId":"suggestNever","fix":{"range":[439,442],"text":"never"},"desc":"Use `never` instead, this is useful when instantiating generic type parameters that you don't need to know the type of."}]},{"ruleId":"@typescript-eslint/no-explicit-any","severity":1,"message":"Unexpected any. Specify a different type.","line":19,"column":45,"nodeType":"TSAnyKeyword","messageId":"unexpectedAny","endLine":19,"endColumn":48,"suggestions":[{"messageId":"suggestUnknown","fix":{"range":[488,491],"text":"unknown"},"desc":"Use `unknown` instead, this will force you to explicitly, and safely assert the type is correct."},{"messageId":"suggestNever","fix":{"range":[488,491],"text":"never"},"desc":"Use `never` instead, this is useful when instantiating generic type parameters that you don't need to know the type of."}]},{"ruleId":"@typescript-eslint/no-explicit-any","severity":1,"message":"Unexpected any. Specify a different type.","line":20,"column":41,"nodeType":"TSAnyKeyword","messageId":"unexpectedAny","endLine":20,"endColumn":44,"suggestions":[{"messageId":"suggestUnknown","fix":{"range":[533,536],"text":"unknown"},"desc":"Use `unknown` instead, this will force you to explicitly, and safely assert the type is correct."},{"messageId":"suggestNever","fix":{"range":[533,536],"text":"never"},"desc":"Use `never` instead, this is useful when instantiating generic type parameters that you don't need to know the type of."}]},{"ruleId":"@typescript-eslint/no-explicit-any","severity":1,"message":"Unexpected any. Specify a different type.","line":29,"column":33,"nodeType":"TSAnyKeyword","messageId":"unexpectedAny","endLine":29,"endColumn":36,"suggestions":[{"messageId":"suggestUnknown","fix":{"range":[753,756],"text":"unknown"},"desc":"Use `unknown` instead, this will force you to explicitly, and safely assert the type is correct."},{"messageId":"suggestNever","fix":{"range":[753,756],"text":"never"},"desc":"Use `never` instead, this is useful when instantiating generic type parameters that you don't need to know the type of."}]},{"ruleId":"@typescript-eslint/no-unused-vars","severity":1,"message":"'variant' is assigned a value but never used.","line":30,"column":17,"nodeType":"Identifier","messageId":"unusedVar","endLine":30,"endColumn":24},{"ruleId":"@typescript-eslint/no-unused-vars","severity":1,"message":"'size' is assigned a value but never used.","line":30,"column":36,"nodeType":"Identifier","messageId":"unusedVar","endLine":30,"endColumn":40}],"suppressedMessages":[],"errorCount":0,"fatalErrorCount":0,"warningCount":6,"fixableErrorCount":0,"fixableWarningCount":0,"source":"import React from 'react';\nimport {\n  Pressable as RNPressable,\n  Text as RNText,\n  type PressableProps,\n  type TextProps,\n  View as BaseView,\n  ScrollView as BaseScrollView,\n} from 'react-native';\nimport { cssInterop } from 'nativewind';\n\nconst StyledPressable = RNPressable;\nconst StyledText = RNText;\n\ncssInterop(StyledPressable, { className: 'style' });\ncssInterop(StyledText, { className: 'style' });\n\nexport const View = BaseView as any;\nexport const ScrollView = BaseScrollView as any;\nexport const Pressable = RNPressable as any;\n\nexport interface IButtonProps extends PressableProps {\n  className?: string;\n  variant?: 'solid' | 'outline' | 'link';\n  size?: 'xs' | 'sm' | 'md' | 'lg';\n  isDisabled?: boolean;\n}\n\nconst Button = React.forwardRef<any, IButtonProps>(\n  ({ className, variant = 'solid', size = 'md', isDisabled, ...props }, ref) => {\n    return (\n      <StyledPressable\n        {...props}\n        ref={ref}\n        disabled={isDisabled}\n        className={`flex-row items-center justify-center rounded-comfortable ${className || ''}`}\n      />\n    );\n  },\n);\n\nexport interface IButtonTextProps extends TextProps {\n  className?: string;\n}\n\nconst ButtonText = React.forwardRef<RNText, IButtonTextProps>(({ className, ...props }, ref) => {\n  return (\n    <StyledText {...props} ref={ref} className={`font-medium text-inherit ${className || ''}`} />\n  );\n});\n\nButton.displayName = 'Button';\nButtonText.displayName = 'ButtonText';\n\nexport { Button, ButtonText };\n","usedDeprecatedRules":[]},{"filePath":"C:\\Users\\Naween\\projects\\polymath-platform\\packages\\ui\\src\\components-legacy\\center\\index.tsx","messages":[{"ruleId":"@typescript-eslint/no-explicit-any","severity":1,"message":"Unexpected any. Specify a different type.","line":18,"column":35,"nodeType":"TSAnyKeyword","messageId":"unexpectedAny","endLine":18,"endColumn":38,"suggestions":[{"messageId":"suggestUnknown","fix":{"range":[416,419],"text":"unknown"},"desc":"Use `unknown` instead, this will force you to explicitly, and safely assert the type is correct."},{"messageId":"suggestNever","fix":{"range":[416,419],"text":"never"},"desc":"Use `never` instead, this is useful when instantiating generic type parameters that you don't need to know the type of."}]}],"suppressedMessages":[],"errorCount":0,"fatalErrorCount":0,"warningCount":1,"fixableErrorCount":0,"fixableWarningCount":0,"source":"import React from 'react';\nimport { View, type ViewProps } from 'react-native';\nimport { cssInterop } from 'nativewind';\n\nconst StyledView = View;\n\ncssInterop(StyledView, {\n  className: {\n    target: 'style',\n  },\n});\n\nexport interface ICenterProps extends ViewProps {\n  className?: string;\n}\n\nconst Center = React.forwardRef<View, ICenterProps>(({ className, ...props }, ref) => {\n  const Component = StyledView as any;\n  return (\n    <Component {...props} ref={ref} className={`items-center justify-center ${className || ''}`} />\n  );\n});\n\nCenter.displayName = 'Center';\n\nexport { Center };\n","usedDeprecatedRules":[]},{"filePath":"C:\\Users\\Naween\\projects\\polymath-platform\\packages\\ui\\src\\components-legacy\\divider\\index.tsx","messages":[{"ruleId":"react/display-name","severity":1,"message":"Component definition is missing display name","line":14,"column":24,"nodeType":"CallExpression","messageId":"noDisplayName","endLine":18,"endColumn":2}],"suppressedMessages":[],"errorCount":0,"fatalErrorCount":0,"warningCount":1,"fixableErrorCount":0,"fixableWarningCount":0,"source":"import React from 'react';\nimport {\n  Text as RNText,\n  View,\n  ActivityIndicator,\n  type TextProps,\n  type ViewProps,\n  type ActivityIndicatorProps,\n} from 'react-native';\nimport { cssInterop } from 'nativewind';\n\ncssInterop(ActivityIndicator, { className: 'style' });\n\nexport const Heading = React.forwardRef<RNText, TextProps & { className?: string }>(\n  ({ className, ...props }, ref) => (\n    <RNText {...props} ref={ref} className={`font-bold text-xl ${className || ''}`} />\n  ),\n);\n\nexport const Divider = ({ className, ...props }: ViewProps & { className?: string }) => (\n  <View {...props} className={`h-[1px] w-full bg-border ${className || ''}`} />\n);\n\nexport const Spinner = ({\n  className,\n  ...props\n}: ActivityIndicatorProps & { className?: string }) => (\n  <ActivityIndicator {...props} className={className} />\n);\n","usedDeprecatedRules":[]},{"filePath":"C:\\Users\\Naween\\projects\\polymath-platform\\packages\\ui\\src\\components-legacy\\form-control\\index.tsx","messages":[{"ruleId":"@typescript-eslint/no-explicit-any","severity":1,"message":"Unexpected any. Specify a different type.","line":59,"column":86,"nodeType":"TSAnyKeyword","messageId":"unexpectedAny","endLine":59,"endColumn":89,"suggestions":[{"messageId":"suggestUnknown","fix":{"range":[1817,1820],"text":"unknown"},"desc":"Use `unknown` instead, this will force you to explicitly, and safely assert the type is correct."},{"messageId":"suggestNever","fix":{"range":[1817,1820],"text":"never"},"desc":"Use `never` instead, this is useful when instantiating generic type parameters that you don't need to know the type of."}]}],"suppressedMessages":[],"errorCount":0,"fatalErrorCount":0,"warningCount":1,"fixableErrorCount":0,"fixableWarningCount":0,"source":"import React, { createContext, useContext } from 'react';\nimport { View, Text as RNText, type ViewProps, type TextProps } from 'react-native';\nimport { cssInterop } from 'nativewind';\n\ncssInterop(View, { className: 'style' });\ncssInterop(RNText, { className: 'style' });\n\nexport interface IFormControlProps extends ViewProps {\n  isInvalid?: boolean;\n  isDisabled?: boolean;\n  className?: string;\n  children?: React.ReactNode;\n}\n\ntype FormControlContextType = Pick<IFormControlProps, 'isInvalid' | 'isDisabled'>;\n\nconst FormControlContext = createContext<FormControlContextType>({});\n\nexport const FormControl = ({\n  isInvalid,\n  isDisabled,\n  className,\n  children,\n  ...props\n}: ViewProps & {\n  isInvalid?: boolean;\n  isDisabled?: boolean;\n  className?: string;\n  children?: React.ReactNode;\n}) => {\n  return (\n    <FormControlContext.Provider value={{ isInvalid, isDisabled }}>\n      <View {...props} className={`w-full ${className || ''}`}>\n        {children}\n      </View>\n    </FormControlContext.Provider>\n  );\n};\n\nexport const useFormControl = () => useContext(FormControlContext);\n\nexport const FormControlLabel = ({ className, ...props }: ViewProps & { className?: string }) => (\n  <View {...props} className={`mb-2 ${className || ''}`} />\n);\n\nexport const FormControlLabelText = ({\n  className,\n  ...props\n}: TextProps & { className?: string }) => (\n  <RNText {...props} className={`text-sm font-medium text-textSecondary ${className || ''}`} />\n);\n\nexport const FormControlError = ({ className, ...props }: ViewProps & { className?: string }) => {\n  const { isInvalid } = useFormControl();\n  if (!isInvalid) return null;\n  return <View {...props} className={`mt-1 flex-row items-center gap-1 ${className || ''}`} />;\n};\n\nexport const FormControlErrorIcon = ({ as: Icon, className, color, size, ...props }: any) => {\n  const { isInvalid } = useFormControl();\n  if (!isInvalid || !Icon) return null;\n  return <Icon {...props} size={size || 16} color={color || '#EF4444'} className={className} />;\n};\n\nexport const FormControlErrorText = ({\n  className,\n  ...props\n}: TextProps & { className?: string }) => (\n  <RNText {...props} className={`text-xs text-error ${className || ''}`} />\n);\n\nexport const FormControlHelper = ({ className, ...props }: ViewProps & { className?: string }) => (\n  <View {...props} className={`mt-1 ${className || ''}`} />\n);\n\nexport const FormControlHelperText = ({\n  className,\n  ...props\n}: TextProps & { className?: string }) => (\n  <RNText {...props} className={`mt-1 text-xs text-textSecondary ${className || ''}`} />\n);\n","usedDeprecatedRules":[]},{"filePath":"C:\\Users\\Naween\\projects\\polymath-platform\\packages\\ui\\src\\components-legacy\\hstack\\index.tsx","messages":[{"ruleId":"@typescript-eslint/no-explicit-any","severity":1,"message":"Unexpected any. Specify a different type.","line":24,"column":37,"nodeType":"TSAnyKeyword","messageId":"unexpectedAny","endLine":24,"endColumn":40,"suggestions":[{"messageId":"suggestUnknown","fix":{"range":[627,630],"text":"unknown"},"desc":"Use `unknown` instead, this will force you to explicitly, and safely assert the type is correct."},{"messageId":"suggestNever","fix":{"range":[627,630],"text":"never"},"desc":"Use `never` instead, this is useful when instantiating generic type parameters that you don't need to know the type of."}]}],"suppressedMessages":[],"errorCount":0,"fatalErrorCount":0,"warningCount":1,"fixableErrorCount":0,"fixableWarningCount":0,"source":"import React from 'react';\nimport { View, type ViewProps } from 'react-native';\nimport { cssInterop } from 'nativewind';\n\nconst StyledView = View;\n\ncssInterop(StyledView, {\n  className: {\n    target: 'style',\n  },\n});\n\nexport interface IHStackProps extends ViewProps {\n  className?: string;\n  space?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';\n  reversed?: boolean;\n}\n\nconst HStack = React.forwardRef<View, IHStackProps>(\n  ({ className, space, reversed, ...props }, ref) => {\n    const spaceClass = space ? `gap-${space}` : '';\n    const reversedClass = reversed ? 'flex-row-reverse' : 'flex-row';\n\n    const Component = StyledView as any;\n\n    return (\n      <Component\n        {...props}\n        ref={ref}\n        className={`${reversedClass} items-center ${spaceClass} ${classNa
- ERROR  @repo/database#lint:biome: command (C:\Users\Naween\projects\polymath-platform\packages\database) C:\Users\Naween\AppData\Roaming\npm\pnpm.cmd run lint:biome exited (1)
- ERROR  run failed: command  exited (1)
- warn no-orp
- x 69 dependency violations (0 errors, 69 warnings). 2087 modules, 6531 dependencies cruised.
- warn no-orp
- x 69 dependency violations (0 errors, 69 warnings). 2087 modules, 6531 dependencies cruised.
- warn no-orp
- x 69 dependency violations (0 errors, 69 warnings). 2087 modules, 6531 dependencies cruised.
- - fireJournal.errorSaving
- - invite.error.invalid
- - invite.error.noCode
- - fireJournal.errorSaving
- - invite.error.invalid
- - invite.error.noCode
- - scanner.errors.customBuild
- - scanner.errors.noQrFound
- - scanner.errors.scanFailed
- - scanner.web.emptyError
- - fireJournal.errorSaving
- - invite.error.invalid
- - invite.error.noCode
- - scanner.errors.customBuild
- - scanner.errors.noQrFound
- - scanner.errors.scanFailed
- - scanner.web.emptyError

### Category: apps/edlove-web
- warn no-orphans: apps/edlove-web/src/utils/helpers.ts
- warn no-orphans: apps/edlove-web/src/types/index.ts
- warn no-orphans: apps/edlove-web/src/constants/Theme.ts
- warn no-orphans: apps/edlove-web/.astro/content-modules.mjs
- warn no-orphans: apps/edlove-web/.astro/content-assets.mjs
- warn no-orphans: apps/edlove-web/src/utils/helpers.ts
- warn no-orphans: apps/edlove-web/src/types/index.ts
- warn no-orphans: apps/edlove-web/src/constants/Theme.ts
- warn no-orphans: apps/edlove-web/.astro/content-modules.mjs
- warn no-orphans: apps/edlove-web/.astro/content-assets.mjs
- warn no-orphans: apps/edlove-web/src/utils/helpers.ts
- warn no-orphans: apps/edlove-web/src/types/index.ts
- warn no-orphans: apps/edlove-web/src/constants/Theme.ts
- warn no-orphans: apps/edlove-web/.astro/content-modules.mjs
- warn no-orphans: apps/edlove-web/.astro/content-assets.mjs

### Category: apps/gurudevi-marketingWeb
- warn no-orphans: apps/gurudevi-marketingWeb/src/components/StatsSection.svelte
- warn no-orphans: apps/gurudevi-marketingWeb/.astro/content-modules.mjs
- warn no-orphans: apps/gurudevi-marketingWeb/.astro/content-assets.mjs
- warn no-orphans: apps/gurudevi-marketingWeb/src/components/StatsSection.svelte
- warn no-orphans: apps/gurudevi-marketingWeb/.astro/content-modules.mjs
- warn no-orphans: apps/gurudevi-marketingWeb/.astro/content-assets.mjs
- warn no-orphans: apps/gurudevi-marketingWeb/src/components/StatsSection.svelte
- warn no-orphans: apps/gurudevi-marketingWeb/.astro/content-modules.mjs
- warn no-orphans: apps/gurudevi-marketingWeb/.astro/content-assets.mjs

### Category: apps/gurudevi-mobile
- warn no-orphans: apps/gurudevi-mobile/src/utils/validators.ts
- warn no-orphans: apps/gurudevi-mobile/src/utils/usePWAInstallPrompt.ts
- warn no-orphans: apps/gurudevi-mobile/src/lib/backgroundSync.web.ts
- warn no-orphans: apps/gurudevi-mobile/src/components/web/WebSkeleton.web.tsx
- warn no-orphans: apps/gurudevi-mobile/src/components/web/WebSkeleton.tsx
- warn no-orphans: apps/gurudevi-mobile/src/components/web/WebScreenShimmer.web.tsx
- warn no-orphans: apps/gurudevi-mobile/src/components/web/SanctuaryTabBar.web.tsx
- warn no-orphans: apps/gurudevi-mobile/src/components/web/SanctuaryTabBar.tsx
- warn no-orphans: apps/gurudevi-mobile/src/components/RedirectToApp.tsx
- warn no-orphans: apps/gurudevi-mobile/plugins/withSentryGradleDisabled.js
- warn no-orphans: apps/gurudevi-mobile/plugins/withGradleProperties.js
- warn no-orphans: apps/gurudevi-mobile/plugins/withAndroidCruncherDisabled.js
- warn no-orphans: apps/gurudevi-mobile/jest-setup.ts
- warn no-orphans: apps/gurudevi-mobile/__mocks__/react-native-reanimated.js
- warn no-orphans: apps/gurudevi-mobile/__mocks__/gluestack-themed.js
- warn no-orphans: apps/gurudevi-mobile/__mocks__/expo-image-picker.js
- warn no-orphans: apps/gurudevi-mobile/__mocks__/expo-camera.js
- warn no-orphans: apps/gurudevi-mobile/__mocks__/EnvironmentContext.js
- warn no-orphans: apps/gurudevi-mobile/__mocks__/@shopify/react-native-skia.js
- warn no-orphans: apps/gurudevi-mobile/__mocks__/@sentry/react-native.js
- warn no-orphans: apps/gurudevi-mobile/src/utils/validators.ts
- warn no-orphans: apps/gurudevi-mobile/src/utils/usePWAInstallPrompt.ts
- warn no-orphans: apps/gurudevi-mobile/src/lib/backgroundSync.web.ts
- warn no-orphans: apps/gurudevi-mobile/src/components/web/WebSkeleton.web.tsx
- warn no-orphans: apps/gurudevi-mobile/src/components/web/WebSkeleton.tsx
- warn no-orphans: apps/gurudevi-mobile/src/components/web/WebScreenShimmer.web.tsx
- warn no-orphans: apps/gurudevi-mobile/src/components/web/SanctuaryTabBar.web.tsx
- warn no-orphans: apps/gurudevi-mobile/src/components/web/SanctuaryTabBar.tsx
- warn no-orphans: apps/gurudevi-mobile/src/components/RedirectToApp.tsx
- warn no-orphans: apps/gurudevi-mobile/plugins/withSentryGradleDisabled.js
- warn no-orphans: apps/gurudevi-mobile/plugins/withGradleProperties.js
- warn no-orphans: apps/gurudevi-mobile/plugins/withAndroidCruncherDisabled.js
- warn no-orphans: apps/gurudevi-mobile/jest-setup.ts
- warn no-orphans: apps/gurudevi-mobile/__mocks__/react-native-reanimated.js
- warn no-orphans: apps/gurudevi-mobile/__mocks__/gluestack-themed.js
- warn no-orphans: apps/gurudevi-mobile/__mocks__/expo-image-picker.js
- warn no-orphans: apps/gurudevi-mobile/__mocks__/expo-camera.js
- warn no-orphans: apps/gurudevi-mobile/__mocks__/EnvironmentContext.js
- warn no-orphans: apps/gurudevi-mobile/__mocks__/@shopify/react-native-skia.js
- warn no-orphans: apps/gurudevi-mobile/__mocks__/@sentry/react-native.js
- warn no-orphans: apps/gurudevi-mobile/src/utils/validators.ts
- warn no-orphans: apps/gurudevi-mobile/src/utils/usePWAInstallPrompt.ts
- warn no-orphans: apps/gurudevi-mobile/src/lib/backgroundSync.web.ts
- warn no-orphans: apps/gurudevi-mobile/src/components/web/WebSkeleton.web.tsx
- warn no-orphans: apps/gurudevi-mobile/src/components/web/WebSkeleton.tsx
- warn no-orphans: apps/gurudevi-mobile/src/components/web/WebScreenShimmer.web.tsx
- warn no-orphans: apps/gurudevi-mobile/src/components/web/SanctuaryTabBar.web.tsx
- warn no-orphans: apps/gurudevi-mobile/src/components/web/SanctuaryTabBar.tsx
- warn no-orphans: apps/gurudevi-mobile/src/components/RedirectToApp.tsx
- warn no-orphans: apps/gurudevi-mobile/plugins/withSentryGradleDisabled.js
- warn no-orphans: apps/gurudevi-mobile/plugins/withGradleProperties.js
- warn no-orphans: apps/gurudevi-mobile/plugins/withAndroidCruncherDisabled.js
- warn no-orphans: apps/gurudevi-mobile/jest-setup.ts
- warn no-orphans: apps/gurudevi-mobile/__mocks__/react-native-reanimated.js
- warn no-orphans: apps/gurudevi-mobile/__mocks__/gluestack-themed.js
- warn no-orphans: apps/gurudevi-mobile/__mocks__/expo-image-picker.js
- warn no-orphans: apps/gurudevi-mobile/__mocks__/expo-camera.js
- warn no-orphans: apps/gurudevi-mobile/__mocks__/EnvironmentContext.js
- warn no-orphans: apps/gurudevi-mobile/__mocks__/@shopify/react-native-skia.js
- warn no-orphans: apps/gurudevi-mobile/__mocks__/@sentry/react-native.js

### Category: apps/intuitui-web
- warn no-orphans: apps/intuitui-web/.astro/content-modules.mjs
- warn no-orphans: apps/intuitui-web/.astro/content-assets.mjs
- warn no-orphans: apps/intuitui-web/.astro/content-modules.mjs
- warn no-orphans: apps/intuitui-web/.astro/content-assets.mjs
- warn no-orphans: apps/intuitui-web/.astro/content-modules.mjs
- warn no-orphans: apps/intuitui-web/.astro/content-assets.mjs

### Category: apps/neevsk-web
- warn no-orphans: apps/neevsk-web/src/scripts/theme-switcher.ts
- warn no-orphans: apps/neevsk-web/src/scripts/scroll-to-top.ts
- warn no-orphans: apps/neevsk-web/src/scripts/creative-signatures.ts
- warn no-orphans: apps/neevsk-web/src/scripts/animations.ts
- warn no-orphans: apps/neevsk-web/.astro/content-modules.mjs
- warn no-orphans: apps/neevsk-web/.astro/content-assets.mjs
- warn no-orphans: apps/neevsk-web/src/scripts/theme-switcher.ts
- warn no-orphans: apps/neevsk-web/src/scripts/scroll-to-top.ts
- warn no-orphans: apps/neevsk-web/src/scripts/creative-signatures.ts
- warn no-orphans: apps/neevsk-web/src/scripts/animations.ts
- warn no-orphans: apps/neevsk-web/.astro/content-modules.mjs
- warn no-orphans: apps/neevsk-web/.astro/content-assets.mjs
- warn no-orphans: apps/neevsk-web/src/scripts/theme-switcher.ts
- warn no-orphans: apps/neevsk-web/src/scripts/scroll-to-top.ts
- warn no-orphans: apps/neevsk-web/src/scripts/creative-signatures.ts
- warn no-orphans: apps/neevsk-web/src/scripts/animations.ts
- warn no-orphans: apps/neevsk-web/.astro/content-modules.mjs
- warn no-orphans: apps/neevsk-web/.astro/content-assets.mjs

### Category: packages/admin
- warn no-orphans: packages/admin/src/screens/principal/types.ts
- warn no-orphans: packages/admin/src/screens/index.ts
- warn no-orphans: packages/admin/src/screens/principal/types.ts
- warn no-orphans: packages/admin/src/screens/index.ts
- warn no-orphans: packages/admin/src/screens/principal/types.ts
- warn no-orphans: packages/admin/src/screens/index.ts

### Category: packages/analytics
- warn no-orphans: packages/analytics/src/utils/analyticsHelpers.ts
- warn no-orphans: packages/analytics/src/types/AnalyticsTypes.ts
- warn no-orphans: packages/analytics/src/engine/PostHogAnalytics.web.ts
- warn no-orphans: packages/analytics/src/engine/PostHogAnalytics.ts
- warn no-orphans: packages/analytics/src/engine/PostHogAnalytics.native.ts
- warn no-orphans: packages/analytics/src/engine/PostHogAnalytics.native.js
- warn no-orphans: packages/analytics/src/context/ActivityPulseContext.tsx
- warn no-orphans: packages/analytics/src/utils/analyticsHelpers.ts
- warn no-orphans: packages/analytics/src/types/AnalyticsTypes.ts
- warn no-orphans: packages/analytics/src/engine/PostHogAnalytics.web.ts
- warn no-orphans: packages/analytics/src/engine/PostHogAnalytics.ts
- warn no-orphans: packages/analytics/src/engine/PostHogAnalytics.native.ts
- warn no-orphans: packages/analytics/src/engine/PostHogAnalytics.native.js
- warn no-orphans: packages/analytics/src/context/ActivityPulseContext.tsx
- warn no-orphans: packages/analytics/src/utils/analyticsHelpers.ts
- warn no-orphans: packages/analytics/src/types/AnalyticsTypes.ts
- warn no-orphans: packages/analytics/src/engine/PostHogAnalytics.web.ts
- warn no-orphans: packages/analytics/src/engine/PostHogAnalytics.ts
- warn no-orphans: packages/analytics/src/engine/PostHogAnalytics.native.ts
- warn no-orphans: packages/analytics/src/engine/PostHogAnalytics.native.js
- warn no-orphans: packages/analytics/src/context/ActivityPulseContext.tsx

### Category: packages/core
- M packages/core/scratch/extract_errors.cjs
- M packages/core/src/types/Errors.ts
- warn no-orphans: packages/core/src/utils/temporal.ts
- warn no-orphans: packages/core/src/utils/idempotency.ts
- warn no-orphans: packages/core/src/native/sentry.ts
- warn no-orphans: packages/core/src/logic/forms/dynamic-loader.ts
- warn no-orphans: packages/core/src/logic/forms/analytics.ts
- warn no-orphans: packages/core/src/hooks/useSovereignEffect.ts
- warn no-orphans: packages/core/src/hooks/useMediaDownloader.web.ts
- warn no-orphans: packages/core/src/api/growthSignals.generated.zod.ts
- warn no-orphans: packages/core/src/utils/temporal.ts
- warn no-orphans: packages/core/src/utils/idempotency.ts
- warn no-orphans: packages/core/src/native/sentry.ts
- warn no-orphans: packages/core/src/logic/forms/dynamic-loader.ts
- warn no-orphans: packages/core/src/logic/forms/analytics.ts
- warn no-orphans: packages/core/src/hooks/useSovereignEffect.ts
- warn no-orphans: packages/core/src/hooks/useMediaDownloader.web.ts
- warn no-orphans: packages/core/src/api/growthSignals.generated.zod.ts
- warn no-orphans: packages/core/src/utils/temporal.ts
- warn no-orphans: packages/core/src/utils/idempotency.ts
- warn no-orphans: packages/core/src/native/sentry.ts
- warn no-orphans: packages/core/src/logic/forms/dynamic-loader.ts
- warn no-orphans: packages/core/src/logic/forms/analytics.ts
- warn no-orphans: packages/core/src/hooks/useSovereignEffect.ts
- warn no-orphans: packages/core/src/hooks/useMediaDownloader.web.ts
- warn no-orphans: packages/core/src/api/growthSignals.generated.zod.ts

### Category: packages/library
- warn no-orphans: packages/library/src/components/LibraryThumbnailCard.web.tsx
- warn no-orphans: packages/library/src/api/database.web.ts
- warn no-orphans: packages/library/src/components/LibraryThumbnailCard.web.tsx
- warn no-orphans: packages/library/src/api/database.web.ts
- warn no-orphans: packages/library/src/components/LibraryThumbnailCard.web.tsx
- warn no-orphans: packages/library/src/api/database.web.ts

### Category: packages/lk-edu-geo
- warn no-orphans: packages/lk-edu-geo/src/constants.ts
- warn no-orphans: packages/lk-edu-geo/src/constants.ts
- warn no-orphans: packages/lk-edu-geo/src/constants.ts

### Category: packages/profile
- warn L0-L1-subpath-only: packages/profile/src/hooks/useNotificationPreferences.ts → packages/ui/src/index.ts
- warn L0-L1-subpath-only: packages/profile/src/hooks/useNotificationPreferences.ts → packages/ui/src/index.ts
- warn L0-L1-subpath-only: packages/profile/src/hooks/useNotificationPreferences.ts → packages/ui/src/index.ts

### Category: packages/scanner-kit
- warn no-orphans: packages/scanner-kit/src/ScannerModal.web.tsx
- warn no-orphans: packages/scanner-kit/src/ScannerModal.web.tsx
- warn no-orphans: packages/scanner-kit/src/ScannerModal.web.tsx

### Category: packages/self
- M packages/self/src/components/FeatureErrorBoundary.tsx
- warn L0-L1-subpath-only: packages/self/src/api/wellbeingRepository.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/api/wellbeingRepository.ts → packages/core/src/index.ts
- warn L0-L1-subpath-only: packages/self/src/api/wellbeingRepository.ts → packages/core/src/index.ts

### Category: packages/trube-art
- warn no-orphans: packages/trube-art/src/native/renderers/SoulLibrary.ts
- warn no-orphans: packages/trube-art/src/native/renderers/SoulLibrary.ts
- warn no-orphans: packages/trube-art/src/native/renderers/SoulLibrary.ts

### Category: packages/ui
- warn no-orphans: packages/ui/src/utils/shareAction.web.ts
- warn no-orphans: packages/ui/src/utils/SanctuaryLocation.web.ts
- warn no-orphans: packages/ui/src/utils/haptics.web.ts
- warn no-orphans: packages/ui/src/utils/dialogs.web.ts
- warn no-orphans: packages/ui/src/components/ui/list/index.tsx
- warn no-orphans: packages/ui/src/components/SkeletonLoader.web.tsx
- warn no-orphans: packages/ui/src/components-native/NoiseOverlay.web.tsx
- warn no-orphans: packages/ui/src/code.tsx
- warn no-orphans: packages/ui/src/utils/shareAction.web.ts
- warn no-orphans: packages/ui/src/utils/SanctuaryLocation.web.ts
- warn no-orphans: packages/ui/src/utils/haptics.web.ts
- warn no-orphans: packages/ui/src/utils/dialogs.web.ts
- warn no-orphans: packages/ui/src/components/ui/list/index.tsx
- warn no-orphans: packages/ui/src/components/SkeletonLoader.web.tsx
- warn no-orphans: packages/ui/src/components-native/NoiseOverlay.web.tsx
- warn no-orphans: packages/ui/src/code.tsx
- warn no-orphans: packages/ui/src/utils/shareAction.web.ts
- warn no-orphans: packages/ui/src/utils/SanctuaryLocation.web.ts
- warn no-orphans: packages/ui/src/utils/haptics.web.ts
- warn no-orphans: packages/ui/src/utils/dialogs.web.ts
- warn no-orphans: packages/ui/src/components/ui/list/index.tsx
- warn no-orphans: packages/ui/src/components/SkeletonLoader.web.tsx
- warn no-orphans: packages/ui/src/components-native/NoiseOverlay.web.tsx
- warn no-orphans: packages/ui/src/code.tsx

## Raw Output

```text
[90m⧗[39m   input: [1mFix Expo dependency resolution and update workspace

- Updated expo-modules-core from 55.0.18 to 55.0.17 in package.json overrides
- Added overrides for deprecated packages (rimraf@^6.0.0, glob@^11.0.0)
- Added overrides for expo-audio, expo-linking, expo-sqlite, expo-video to ensure consistent versions
- All 17/17 expo-doctor checks now pass
- Updated various source files and documentation across the workspace
- Fixed linting error in principalWorkspaceRepository.ts by replacing Math.random() with crypto.randomUUID()

[STAGED CHANGES SUMMARY]
[APP] edlove-web
  M apps/edlove-web/src/components/Footer.astro
  M apps/edlove-web/src/components/Navigation.astro
  M apps/edlove-web/src/components/StructuredData.astro
  M apps/edlove-web/src/components/Welcome.astro
  M apps/edlove-web/src/layouts/Layout.astro
  M apps/edlove-web/src/lib/api.ts
  M apps/edlove-web/src/pages/community/index.astro
  M apps/edlove-web/src/pages/cosmos/[slug].astro
  M apps/edlove-web/src/pages/cosmos/index.astro
  M apps/edlove-web/src/pages/gurudevi/index.astro
  M apps/edlove-web/src/pages/index.astro
  M apps/edlove-web/src/pages/library/index.astro
  M apps/edlove-web/src/pages/privacy.astro
  M apps/edlove-web/src/pages/resources/gallery.astro
  M apps/edlove-web/src/pages/resources/index.astro
  M apps/edlove-web/src/pages/si/index.astro
  M apps/edlove-web/src/pages/sri-lanka/index.astro
  M apps/edlove-web/src/pages/ta/index.astro
  M apps/edlove-web/src/pages/terms.astro
  M apps/edlove-web/src/pages/vision.astro
  M apps/edlove-web/src/styles/global.css

[APP] gurudevi-marketingWeb
  M apps/gurudevi-marketingWeb/.astro/content.d.ts
  M apps/gurudevi-marketingWeb/.astro/types.d.ts
  M apps/gurudevi-marketingWeb/src/components/Footer.astro
  M apps/gurudevi-marketingWeb/src/components/Header.astro
  M apps/gurudevi-marketingWeb/src/components/StatsSection.svelte
  M apps/gurudevi-marketingWeb/src/components/StructuredData.astro
  M apps/gurudevi-marketingWeb/src/inngest/functions/mutationHandlers.ts
  M apps/gurudevi-marketingWeb/src/inngest/lib/workerObservability.ts
  M apps/gurudevi-marketingWeb/src/layouts/Layout.astro
  M apps/gurudevi-marketingWeb/src/lib/durableAgents/durableAgentRuns.ts
  M apps/gurudevi-marketingWeb/src/lib/durableAgents/llmProvider.ts
  M apps/gurudevi-marketingWeb/src/lib/inngest.ts
  M apps/gurudevi-marketingWeb/src/lib/supabase.ts
  M apps/gurudevi-marketingWeb/src/pages/about.astro
  M apps/gurudevi-marketingWeb/src/pages/delete-account.astro
  M apps/gurudevi-marketingWeb/src/pages/durable-agents.astro
  M apps/gurudevi-marketingWeb/src/pages/faq.astro
  M apps/gurudevi-marketingWeb/src/pages/index.astro
  M apps/gurudevi-marketingWeb/src/pages/privacy.astro
  M apps/gurudevi-marketingWeb/src/pages/sensing/[schoolId].astro
  M apps/gurudevi-marketingWeb/src/pages/sensing/index.astro
  M apps/gurudevi-marketingWeb/src/pages/support.astro
  M apps/gurudevi-marketingWeb/src/pages/thuthimal.astro
  M apps/gurudevi-marketingWeb/src/styles/global.css

[APP] gurudevi-mobile
  M apps/gurudevi-mobile/App.tsx
  M apps/gurudevi-mobile/archives/classroom/src/workspace/usePrincipalWorkspaceSurfaces.tsx
  M apps/gurudevi-mobile/archives/screens/ClassroomScreen.tsx
  M apps/gurudevi-mobile/archives/screens/CommunityScreen.tsx
  M apps/gurudevi-mobile/archives/screens/ProfileScreen.tsx
  M apps/gurudevi-mobile/archives/screens/QRHandlerScreen.tsx
  M apps/gurudevi-mobile/archives/screens/SchoolCreationScreen.tsx
  A apps/gurudevi-mobile/docs/Core/20260521_AUTH_EVENTS_AND_MFA_ARCHITECTURE.md
  M apps/gurudevi-mobile/docs/Core/FEATURE_ENGINE_ARCHITECTURE.md
  M apps/gurudevi-mobile/docs/architecture/authority.md
  A apps/gurudevi-mobile/docs/architecture/modern-runtime-vision.md
  M apps/gurudevi-mobile/docs/current_progress/Feb/4th_week/plans/2026-02-25-profile-completion-implementation.md
  M apps/gurudevi-mobile/docs/current_progress/Feb/4th_week/plans/2026-02-25-week4-master-implementation-plan.md
  M apps/gurudevi-mobile/index.ts
  M apps/gurudevi-mobile/metro.config.js
  M apps/gurudevi-mobile/package.json
  M apps/gurudevi-mobile/src/components/web/CommandPalette.web.tsx
  A apps/gurudevi-mobile/src/lib/backgroundSync.web.ts
  M apps/gurudevi-mobile/src/lib/inngest.ts
  M apps/gurudevi-mobile/src/navigation/ProfileStackNavigator.web.tsx
  M apps/gurudevi-mobile/src/navigation/TabNavigator.tsx
  M apps/gurudevi-mobile/src/navigation/TabNavigator.web.tsx
  M apps/gurudevi-mobile/src/navigation/useAppEntryGate.ts
  M apps/gurudevi-mobile/src/providers/DeepLinkProvider.tsx
  M apps/gurudevi-mobile/src/providers/PowerSyncProvider.tsx
  M apps/gurudevi-mobile/src/providers/SanctuaryProvider.tsx
  M apps/gurudevi-mobile/src/shims/lucide-react-native-web.js
  M apps/gurudevi-mobile/supabase/config.toml
  A apps/gurudevi-mobile/supabase/migrations/20260521000000_auth_events_read_model.sql

[APP] intuitui-web
  M apps/intuitui-web/.astro/content.d.ts
  M apps/intuitui-web/.astro/types.d.ts
  M apps/intuitui-web/src/layouts/MainLayout.astro
  M apps/intuitui-web/src/pages/about.astro
  M apps/intuitui-web/src/pages/index.astro
  M apps/intuitui-web/src/pages/projects.astro
  M apps/intuitui-web/src/pages/studio.astro
  M apps/intuitui-web/src/styles/global.css

[APP] neevsk-web
  M apps/neevsk-web/.astro/collections/archive.schema.json
  M apps/neevsk-web/.astro/collections/hall-of-flame.schema.json
  M apps/neevsk-web/.astro/collections/projects.schema.json
  M apps/neevsk-web/.astro/content-assets.mjs
  M apps/neevsk-web/.astro/content-modules.mjs
  M apps/neevsk-web/.astro/content.d.ts
  M apps/neevsk-web/.astro/types.d.ts
  M apps/neevsk-web/playwright.config.ts
  M apps/neevsk-web/src/components/common/Button.astro
  M apps/neevsk-web/src/components/sections/CurrentFocus.astro
  M apps/neevsk-web/src/components/sections/HeroHome.astro
  M apps/neevsk-web/src/layouts/BaseLayout.astro
  M apps/neevsk-web/src/layouts/DigitalNeonLayout.astro
  M apps/neevsk-web/src/layouts/LightTechLayout.astro
  M apps/neevsk-web/src/layouts/NatureLayout.astro
  M apps/neevsk-web/src/layouts/TwilightLayout.astro
  M apps/neevsk-web/src/layouts/WarmArchiveLayout.astro
  M apps/neevsk-web/src/pages/archive.astro
  M apps/neevsk-web/src/pages/archive/[slug].astro
  M apps/neevsk-web/src/pages/connect/index.astro
  M apps/neevsk-web/src/pages/contact.astro
  M apps/neevsk-web/src/pages/cv.astro
  M apps/neevsk-web/src/pages/hall-of-flame.astro
  M apps/neevsk-web/src/pages/index.astro
  M apps/neevsk-web/src/pages/intellectual/index.astro
  M apps/neevsk-web/src/pages/journey.astro
  M apps/neevsk-web/src/pages/library/index.astro
  M apps/neevsk-web/src/pages/personal/hall-of-flame.astro
  M apps/neevsk-web/src/pages/personal/index.astro
  M apps/neevsk-web/src/pages/professional/index.astro
  M apps/neevsk-web/src/pages/projects.astro
  M apps/neevsk-web/src/styles/global.css

[APP] sanctuary-api
  A apps/sanctuary-api/.env.example
  M apps/sanctuary-api/package.json
  A apps/sanctuary-api/scratch/api_test.http
  M apps/sanctuary-api/src/__tests__/downstream.test.ts
  M apps/sanctuary-api/src/__tests__/jwt.test.ts
  M apps/sanctuary-api/src/__tests__/setup.ts
  M apps/sanctuary-api/src/index.ts
  M apps/sanctuary-api/src/jwt.ts
  M apps/sanctuary-api/vitest.config.ts

[PKG] admin
  M packages/admin/src/bridge/founderWorkspace.ts
  M packages/admin/src/components/onboarding/PrincipalOnboardingView.tsx
  M packages/admin/src/components/principal/HierarchyBuilder.tsx
  M packages/admin/src/components/principal/InviteManager.tsx
  M packages/admin/src/components/principal/PrincipalGovernanceTimeline.tsx
  M packages/admin/src/components/principal/PrincipalNotes.tsx
  M packages/admin/src/components/principal/ResourceNeedsDashboard.tsx
  M packages/admin/src/founder/useFounderWorkspaceCanvas.tsx
  M packages/admin/src/guardian/api.ts
  M packages/admin/src/guardian/dashboardProjection.ts
  M packages/admin/src/guardian/repository.ts
  M packages/admin/src/guardian/useGuardianWorkspaceCanvas.tsx
  M packages/admin/src/guardian/useGuardianWorkspaceData.ts
  M packages/admin/src/hooks/useAdminWorkspaceSurfaces.tsx
  M packages/admin/src/hooks/useDashboardHooks.ts
  M packages/admin/src/hooks/useSchoolStats.ts
  M packages/admin/src/invites.ts
  M packages/admin/src/observations.ts
  M packages/admin/src/principal/usePrincipalWorkspaceCanvas.tsx
  M packages/admin/src/screens/AcademicCycleManager.tsx
  M packages/admin/src/screens/GuardianDashboard.tsx
  M packages/admin/src/screens/PrincipalDashboard.web.tsx
  M packages/admin/src/screens/principal/CyclesDashboard.tsx
  M packages/admin/src/staff.ts

[PKG] analytics
  M packages/analytics/src/engine/PostHogAnalytics.ts
  M packages/analytics/src/ml/InsightGenerator.ts

[PKG] classroom
  M packages/classroom/src/components/AttendanceSheet.tsx
  M packages/classroom/src/components/AttendanceView.tsx
  M packages/classroom/src/components/ClaimInviteModal.tsx
  M packages/classroom/src/components/ClassroomHolisticInsights.tsx
  M packages/classroom/src/components/ClassroomList.tsx
  M packages/classroom/src/components/ClassroomNotes.tsx
  M packages/classroom/src/components/CreateClassroomModal.tsx
  M packages/classroom/src/components/CreateSchoolModal.tsx
  M packages/classroom/src/components/GlobalCreateModal.tsx
  M packages/classroom/src/components/InventoryView.tsx
  M packages/classroom/src/components/ResourcesView.tsx
  M packages/classroom/src/components/SubmissionModal.tsx
  M packages/classroom/src/components/teacher/TeacherAnalysisWorkspace.tsx
  M packages/classroom/src/components/teacher/TeacherObservationsWorkspace.tsx
  M packages/classroom/src/hooks/useClassroomRoleData.ts
  M packages/classroom/src/hooks/useInventory.ts
  M packages/classroom/src/hooks/useResources.ts
  M packages/classroom/src/hooks/useSchoolStats.ts
  M packages/classroom/src/screens/AttendanceReportScreen.tsx
  M packages/classroom/src/screens/AttendanceScreen.tsx
  M packages/classroom/src/screens/AttendanceScreen.web.tsx
  M packages/classroom/src/screens/ContentLibrary.tsx
  M packages/classroom/src/screens/LessonFeed.tsx
  M packages/classroom/src/screens/NoSchoolView.web.tsx
  M packages/classroom/src/screens/StudentClassroomDashboard.tsx
  M packages/classroom/src/screens/StudentDashboard.tsx
  M packages/classroom/src/screens/StudentDashboard.web.tsx
  M packages/classroom/src/screens/StudentProfileScreen.tsx
  M packages/classroom/src/screens/TeacherClassroomDashboard.tsx
  M packages/classroom/src/screens/TeacherClassroomDashboard.web.tsx
  M packages/classroom/src/screens/TeacherDashboard.web.tsx
  M packages/classroom/src/workspace/useClassroomWorkspaceInsights.ts
  M packages/classroom/src/workspace/useClassroomWorkspaceSurfaces.tsx
  M packages/classroom/src/workspace/useStudentClassroomWorkspaceData.ts
  M packages/classroom/src/workspace/useTeacherClassroomWorkspaceData.ts
  M packages/classroom/src/workspace/useTeacherWorkspaceShell.tsx

[PKG] community
  M packages/community/src/components/CommentSheet.tsx
  M packages/community/src/components/CreateGroupModal.tsx
  M packages/community/src/components/CreatePostModal.tsx
  M packages/community/src/components/ManifestoCard.tsx
  M packages/community/src/screens/AnnouncementsScreen.tsx
  M packages/community/src/screens/BaseChatScreen.tsx
  M packages/community/src/screens/CommunityScreen.tsx
  M packages/community/src/screens/CommunityScreen.web.tsx
  M packages/community/src/screens/DirectMessageScreen.web.tsx
  M packages/community/src/screens/GroupChatScreen.web.tsx
  M packages/community/src/screens/GroupsScreen.tsx

[PKG] core
  M packages/core/package.json
  M packages/core/scratch/analyze_lint.js
  M packages/core/scratch/extract_errors.cjs
  M packages/core/scratch/summarize_eslint.cjs
  M packages/core/src/__tests__/workspace/layoutSync.test.ts
  M packages/core/src/accounts/deviceAccounts.ts
  A packages/core/src/adapters/__tests__/powersync.database.test.ts
  A packages/core/src/adapters/__tests__/supabase.auth.adapter.test.ts
  M packages/core/src/adapters/native/NativeDeviceIdentityAdapter.ts
  M packages/core/src/adapters/powersync/PowerSyncGate.tsx
  M packages/core/src/adapters/powersync/SupabasePowerSyncConnector.ts
  M packages/core/src/adapters/powersync/database.ts
  M packages/core/src/adapters/powersync/forms.adapter.ts
  M packages/core/src/adapters/powersync/powersync-shim.ts
  M packages/core/src/adapters/realtime/supabase.adapter.ts
  M packages/core/src/adapters/storage/cloudinary.adapter.ts
  M packages/core/src/adapters/storage/supabase.adapter.ts
  M packages/core/src/adapters/supabase/auth.adapter.ts
  M packages/core/src/adapters/supabase/educational/assignmentRepository.ts
  M packages/core/src/adapters/supabase/forms.adapter.ts
  M packages/core/src/adapters/supabase/growth.adapter.ts
  M packages/core/src/adapters/supabase/guardianRepository.ts
  M packages/core/src/adapters/supabase/principalWorkspaceRepository.ts
  M packages/core/src/adapters/supabase/workspaceLayoutRepository.ts
  M packages/core/src/adapters/supabaseDeviceSecurity.adapter.ts
  M packages/core/src/adapters/supabaseIdentity.adapter.ts
  M packages/core/src/adapters/supabasePushNotification.adapter.ts
  M packages/core/src/adapters/zenstack/profileRepository.ts
  A packages/core/src/api/__tests__/highways.test.ts
  M packages/core/src/api/__tests__/schemas.test.ts
  M packages/core/src/api/__tests__/simple.test.ts
  M packages/core/src/api/admin.contract.ts
  M packages/core/src/api/attendance.ts
  M packages/core/src/api/auth.ts
  M packages/core/src/api/base.ts
  M packages/core/src/api/classroom.ts
  M packages/core/src/api/classrooms.ts
  M packages/core/src/api/community.contract.ts
  M packages/core/src/api/community.ts
  A packages/core/src/api/dailyContent.contract.ts
  M packages/core/src/api/dailyContent.ts
  A packages/core/src/api/dataGateway.ts
  M packages/core/src/api/deviceTrust.ts
  A packages/core/src/api/gateway.ts
  M packages/core/src/api/grading.contract.ts
  M packages/core/src/api/grading.ts
  M packages/core/src/api/groups.ts
  A packages/core/src/api/handlers/dailyContent.ts
  M packages/core/src/api/handlers/identity.ts
  M packages/core/src/api/handlers/profile.ts
  M packages/core/src/api/handlers/self.ts
  A packages/core/src/api/highways.ts
  M packages/core/src/api/hooks/community.hooks.ts
  M packages/core/src/api/hooks/poll.hooks.ts
  M packages/core/src/api/identity.contract.ts
  M packages/core/src/api/identity.ts
  M packages/core/src/api/index.ts
  A packages/core/src/api/interceptor.ts
  M packages/core/src/api/library.ts
  M packages/core/src/api/onboarding.ts
  M packages/core/src/api/operations.contract.ts
  M packages/core/src/api/orchestration/operations.ts
  M packages/core/src/api/poaProxy.ts
  M packages/core/src/api/profile.contract.ts
  M packages/core/src/api/profile.ts
  M packages/core/src/api/resources.ts
  M packages/core/src/api/school.ts
  A packages/core/src/api/server.ts
  M packages/core/src/api/staffManagement.ts
  M packages/core/src/api/supabase.ts
  M packages/core/src/api/warmMirror.ts
  M packages/core/src/hooks/useAuthorityLifecycle.ts
  M packages/core/src/hooks/useClassroomCreation.ts
  M packages/core/src/hooks/useDeviceSecurity.ts
  M packages/core/src/hooks/useFeatureAccess.ts
  M packages/core/src/hooks/useForm.ts
  M packages/core/src/hooks/useGroupCreation.ts
  M packages/core/src/hooks/useIdentity.ts
  M packages/core/src/hooks/useLocalPermission.ts
  M packages/core/src/hooks/useMediaDownloader.ts
  A packages/core/src/hooks/useMediaDownloader.web.ts
  M packages/core/src/hooks/useTaskActions.ts
  M packages/core/src/hooks/useTeacherClassroom.ts
  M packages/core/src/hooks/useTracking.ts
  M packages/core/src/index.ts
  M packages/core/src/lib/authorization.ts
  M packages/core/src/lib/cloudinary.ts
  M packages/core/src/lib/gradePublication.ts
  M packages/core/src/lib/monitoring/sentry.ts
  M packages/core/src/lib/supabaseAuthStorage.ts
  M packages/core/src/lib/sync/registry.ts
  M packages/core/src/lib/sync/sync/SyncManager.tsx
  M packages/core/src/logic/domains/profile/onboarding.ts
  M packages/core/src/logic/forms/analytics.ts
  M packages/core/src/logic/forms/dynamic-loader.ts
  M packages/core/src/logic/forms/form-manager.ts
  M packages/core/src/logic/forms/index.ts
  M packages/core/src/logic/managers/AuthManager.ts
  M packages/core/src/logic/managers/DeepLinkManager.ts
  M packages/core/src/logic/managers/DeviceSecurityManager.ts
  M packages/core/src/logic/managers/EducationalManager.ts
  M packages/core/src/logic/managers/GlobalConfigManager.ts
  M packages/core/src/logic/managers/GrowthManager.ts
  M packages/core/src/logic/managers/ProfileManager.ts
  M packages/core/src/logic/managers/PushNotificationManager.ts
  A packages/core/src/logic/managers/__tests__/AuthManager.test.ts
  M packages/core/src/logic/managers/auth.factory.ts
  M packages/core/src/logic/permissions/feature-engine.ts
  M packages/core/src/logic/permissions/localEvaluator.native.ts
  M packages/core/src/logic/permissions/localEvaluator.ts
  M packages/core/src/logic/ports/auth.port.ts
  M packages/core/src/logic/ports/deviceSecurity.port.ts
  M packages/core/src/logic/ports/growth.port.ts
  M packages/core/src/logic/schemas/identity.schema.ts
  M packages/core/src/logic/schemas/user.schema.ts
  M packages/core/src/logic/utils/QRResolver.ts
  M packages/core/src/logic/utils/logger.ts
  M packages/core/src/logic/workspace/workspaceSwitcher.ts
  M packages/core/src/native/bootstrap.ts
  M packages/core/src/native/deviceTrust.ts
  M packages/core/src/native/guestDataManager.ts
  M packages/core/src/native/guestDataSync.ts
  M packages/core/src/native/runtimeAdapter.ts
  M packages/core/src/native/sentry.ts
  M packages/core/src/native/supabaseAuthStorage.ts
  M packages/core/src/native/useAuthorityLifecycle.ts
  A packages/core/src/providers/index.ts
  A packages/core/src/shared/index.ts
  M packages/core/src/store/useConflictStore.ts
  M packages/core/src/store/useDeviceSecurityStore.ts
  M packages/core/src/types/Errors.ts
  M packages/core/src/types/User.ts
  M packages/core/src/types/Workspace.ts
  M packages/core/src/types/index.ts
  M packages/core/src/utils/temporal.ts

[PKG] database
  M packages/database/package.json
  M packages/database/src/client.ts

[PKG] eslint-config
  M packages/eslint-config/base.js
  M packages/eslint-config/next.js
  M packages/eslint-config/react-internal.js

[PKG] form-builder
  A packages/form-builder-engine/PUBLISH_CHECKLIST.md
  A packages/form-builder-engine/README.md
  M packages/form-builder-engine/package.json
  M packages/form-builder-engine/src/adapters/interfaces.ts
  M packages/form-builder-engine/src/analytics/AnalyticsEngine.ts
  A packages/form-builder-engine/src/analytics/index.ts
  A packages/form-builder-engine/src/core/index.ts
  A packages/form-builder-engine/src/hydration/index.ts
  M packages/form-builder-engine/src/hydrator/FormHydrator.ts
  M packages/form-builder-engine/src/index.ts
  M packages/form-builder-engine/src/manager/FormManager.ts
  A packages/form-builder-engine/src/ports/index.ts
  M packages/form-builder-engine/src/schema/FormSchema.ts
  A packages/form-builder-engine/src/schema/index.ts
  M packages/form-builder-engine/src/validation/ValidationEngine.ts
  A packages/form-builder-engine/src/validation/index.ts
  M packages/form-builder/README.md
  M packages/form-builder/package.json
  M packages/form-builder/src/DynamicFormDemo.tsx
  M packages/form-builder/src/FormBuilder.tsx
  M packages/form-builder/src/NativeForm.tsx
  M packages/form-builder/src/apps/resilience-sensing-schema.ts
  M packages/form-builder/src/screens/ClimateSensingScreen.tsx
  M packages/form-builder/src/screens/ClimateSensingScreen.web.tsx
  M packages/form-builder/src/screens/PublicFormScreen.web.tsx
  A packages/form-builder/src/services.ts

[PKG] graphics
  M packages/graphics/src/components/maps/GeospatialStudio.tsx

[PKG] library
  M packages/library/src/screens/CollectionDetailScreen.web.tsx
  M packages/library/src/screens/LibraryScreen.web.tsx

[PKG] platform-mcp
  M packages/platform-mcp/src/index.ts

[PKG] policies
  M packages/policies/src/__tests__/evaluator.test.ts
  M packages/policies/src/engine/evaluator.ts
  A packages/policies/src/policies/guest/personal.cedar
  D packages/policies/src/policies/guest/wanderer.cedar
  M packages/policies/src/snapshot/generator.ts

[PKG] profile
  M packages/profile/src/components/EditProfileModal.tsx
  M packages/profile/src/hooks/useSchoolProfile.ts
  M packages/profile/src/hooks/useStudentAcademicHistory.ts
  M packages/profile/src/hooks/useTeacherProfessionalHistory.ts
  M packages/profile/src/navigation/fullProfileParams.ts
  M packages/profile/src/screens/ProfileScreen.tsx

[PKG] schema
  M packages/schema/src/generated/orm/input.ts
  M packages/schema/src/generated/orm/models.ts

[PKG] self
  M packages/self/src/api/dailyContent.ts
  M packages/self/src/components/AcademicHistoryTimeline.tsx
  M packages/self/src/components/BaseSelfView.tsx
  M packages/self/src/components/BaseSelfView.web.tsx
  M packages/self/src/components/BreathGuide.tsx
  M packages/self/src/components/BreathGuide.web.tsx
  M packages/self/src/components/ClassroomLegacyTimeline.tsx
  M packages/self/src/components/FeatureErrorBoundary.tsx
  M packages/self/src/components/GovernanceHistoryTimeline.tsx
  M packages/self/src/components/MyGradesView.tsx
  M packages/self/src/components/MyGradesView.web.tsx
  M packages/self/src/components/SchoolLegacyTimeline.tsx
  M packages/self/src/components/TeachingHistoryTimeline.tsx
  M packages/self/src/components/WindDownRitual.web.tsx
  M packages/self/src/hooks/useOrientationInference.ts
  M packages/self/src/screens/self/FounderSelfView.tsx
  M packages/self/src/screens/self/StudentSelfView.tsx
  M packages/self/src/screens/self/TeacherSelfView.tsx

[PKG] trube-art
  M packages/trube-art/src/screens/TrubeLabScreen.tsx

[PKG] typescript-config
  M packages/typescript-config/base.json

[PKG] ui
  M packages/ui/src/__tests__/Input.test.tsx
  M packages/ui/src/components-native/NoiseOverlay.web.tsx
  M packages/ui/src/components/ConflictResolver.tsx
  M packages/ui/src/components/DeviceAccountManager.tsx
  M packages/ui/src/components/DeviceSecurityCenter.tsx
  M packages/ui/src/components/NotificationDrawer.tsx
  M packages/ui/src/components/SanctuaryProgressBar.tsx
  M packages/ui/src/components/SanctuarySignal.tsx
  M packages/ui/src/components/SkeletonLoader.web.tsx
  M packages/ui/src/components/media/AssetCreationPortal.tsx
  M packages/ui/src/components/ui/actionsheet/index.tsx
  M packages/ui/src/context/utils.ts
  M packages/ui/src/hooks/useDemoBridge.ts
  M packages/ui/src/providers/ToastProvider.tsx
  A packages/ui/src/screens/AppSettingsScreen.shared.tsx
  M packages/ui/src/screens/AppSettingsScreen.tsx
  M packages/ui/src/screens/AppSettingsScreen.web.tsx
  M packages/ui/src/screens/AuthScreen.tsx
  M packages/ui/src/screens/AuthScreen.web.tsx
  M packages/ui/src/screens/NotificationsScreen.web.tsx
  M packages/ui/src/screens/OnboardingScreen.tsx
  M packages/ui/src/screens/OnboardingScreen.web.tsx
  M packages/ui/src/screens/OnboardingWrapper.tsx
  M packages/ui/src/svelte/SvelteForm.svelte
  M packages/ui/src/utils/DeviceUtils.ts
  M packages/ui/src/utils/SanctuaryLocation.ts
  M packages/ui/src/utils/linking.ts
  A packages/ui/src/utils/linking.web.ts

[TOOL] Engineering & Tooling
  M package.json
  M pnpm-lock.yaml
  M scripts/audit-package-architecture.mjs
  M scripts/check-monorepo-boundaries.mjs
  M scripts/check-shiny-tools.mjs
  M scripts/generate-debt-lens.mjs
  M scripts/generate-luminosity-lens.mjs
  M scripts/generate-skeleton-lens.mjs
  M scripts/harden-monorepo.mjs
  M scripts/refactor/identity-migration.mjs
  M scripts/refactor/rewrite-ui-root-imports.mjs
  M scripts/refactor/sovereign-cycle-checker.mjs
  M scripts/refactor/sovereign-healer.mjs
  M scripts/refactor/sovereign-repair-engine.mjs
  M scripts/refactor/sovereign-sentinel-v2.mjs
  M scripts/shiny-sink-audit.mjs
  M scripts/simulate-impact.mjs
  M scripts/sovereign-audit.mjs
  M scripts/sovereign-ui-healer.mjs
  M scripts/surgical-check.mjs

[MISC] Miscellaneous Files
  M .dependency-cruiser.cjs
  A docs/LOCAL_DEVELOPMENT_PLAYBOOK.md
  A docs/OFFLINE_FIRST_SUPABASE_GATEWAY_MOSCOW.md
  M docs/SOVEREIGN_REBAC_DEVELOPER_GUIDE.md
  A docs/architecture/AUTH_ONBOARDING_HIGHWAY_BOUNDARIES.md
  A docs/architecture/DATA_HIGHWAYS_AND_SYNC_BOUNDARIES.md
  A docs/architecture/DATA_HIGHWAYS_MIGRATION_CHECKLIST.md
  A docs/architecture/bootstrap-and-entrypoint-standard.md
  M docs/guides/biome.md
  M scratch/check-all-cycles-deep.mjs
  M scratch/check_balance.js
  D tmp/depcruise-ui-admin.json
  D tmp/depcruise.json
  D tmp/depcruise_utf8.json[22m
[31m✖[39m   body's lines must not be longer than 100 characters [90m[body-max-line-length][39m
[31m✖[39m   subject may not be empty [90m[subject-empty][39m
[31m✖[39m   type may not be empty [90m[type-empty][39m

[1m[31m✖[39m   found 3 problems, 0 warnings[22m
ⓘ   Get help: https://github.com/conventional-changelog/commitlint/#what-is-commitlint



> polymath-platform@1.0.0 lint C:\Users\Naween\projects\polymath-platform
> pnpm turbo run lint


• turbo 2.9.14



   • Packages in scope: @intuitui-labs/form-builder-engine, @intuitui-labs/lk-edu-geo, @repo/accounting, @repo/admin, @repo/ai, @repo/analytics, @repo/classroom, @repo/community, @repo/core, @repo/database, @repo/eslint-config, @repo/form-builder, @repo/graphics, @repo/library, @repo/payments, @repo/people, @repo/platform-mcp, @repo/policies, @repo/profile, @repo/sanctuary-api, @repo/scanner-kit, @repo/schema, @repo/self, @repo/types-shim, @repo/typescript-config, @repo/ui, @repo/workforce, apps-edlove-web, apps-gurudevi-marketing-web, apps-intuitui-web, apps-neevsk-web, gurudevi-mobile

   • Running lint in 32 packages
   • Remote caching disabled


@intuitui-labs/lk-edu-geo:lint:biome: cache miss, executing 89cc58e04ee1f243

@repo/database:lint:biome: cache miss, executing 416548f91048cd24

@repo/payments:lint:biome: cache miss, executing f85d17b8ff9509c8

@repo/workforce:lint:biome: cache miss, executing 078bb6467d713bcf

@repo/ui:lint:biome: cache miss, executing ebbe0ed93da22c56

@repo/types-shim:lint:biome: cache miss, executing 9d0b60a5f4c24eab

@repo/core:lint:biome: cache miss, executing e0841c39d4b6f52b

apps-gurudevi-marketing-web:lint:biome: cache miss, executing c9a45d47022fb6e0

@repo/library:lint:biome: cache miss, executing fa3f7412a6c4a95e

@repo/self:lint:biome: cache miss, executing edff04596beb9547

@repo/ui:lint:biome: 
@repo/ui:lint:biome: > @repo/ui@1.1.0 lint:biome C:\Users\Naween\projects\polymath-platform\packages\ui
@repo/ui:lint:biome: > biome check .
@repo/ui:lint:biome: 

@repo/database:lint:biome: 
@repo/database:lint:biome: > @repo/database@1.0.1 lint:biome C:\Users\Naween\projects\polymath-platform\packages\database
@repo/database:lint:biome: > biome check .
@repo/database:lint:biome: 

@repo/payments:lint:biome: 
@repo/payments:lint:biome: > @repo/payments@0.0.2 lint:biome C:\Users\Naween\projects\polymath-platform\packages\payments
@repo/payments:lint:biome: > biome check .
@repo/payments:lint:biome: 
@repo/core:lint:biome: 
@repo/core:lint:biome: > @repo/core@0.1.0 lint:biome C:\Users\Naween\projects\polymath-platform\packages\core
@repo/core:lint:biome: > biome check .
@repo/core:lint:biome: 
@repo/library:lint:biome: 
@repo/library:lint:biome: > @repo/library@1.0.0 lint:biome C:\Users\Naween\projects\polymath-platform\packages\library
@repo/library:lint:biome: > biome check .
@repo/library:lint:biome: 

@intuitui-labs/lk-edu-geo:lint:biome: 
@intuitui-labs/lk-edu-geo:lint:biome: > @intuitui-labs/lk-edu-geo@1.0.1 lint:biome C:\Users\Naween\projects\polymath-platform\packages\lk-edu-geo
@intuitui-labs/lk-edu-geo:lint:biome: > biome check .
@intuitui-labs/lk-edu-geo:lint:biome: 

@repo/self:lint:biome: 
@repo/self:lint:biome: > @repo/self@1.0.0 lint:biome C:\Users\Naween\projects\polymath-platform\packages\self
@repo/self:lint:biome: > biome check .
@repo/self:lint:biome: 

@repo/workforce:lint:biome: 
@repo/workforce:lint:biome: > @repo/workforce@0.0.2 lint:biome C:\Users\Naween\projects\polymath-platform\packages\workforce
@repo/workforce:lint:biome: > biome check .
@repo/workforce:lint:biome: 

apps-gurudevi-marketing-web:lint:biome: 
apps-gurudevi-marketing-web:lint:biome: > apps-gurudevi-marketing-web@0.0.2 lint:biome C:\Users\Naween\projects\polymath-platform\apps\gurudevi-marketingWeb

apps-gurudevi-marketing-web:lint:biome: > biome check .
apps-gurudevi-marketing-web:lint:biome: 

@repo/types-shim:lint:biome: 
@repo/types-shim:lint:biome: > @repo/types-shim@0.0.2 lint:biome C:\Users\Naween\projects\polymath-platform\packages\types-shim
@repo/types-shim:lint:biome: > biome check .
@repo/types-shim:lint:biome: 

@repo/workforce:lint:biome: Checked 6 files in 406ms. No fixes applied.

@repo/database:lint:biome: package.json format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/database:lint:biome: 
@repo/database:lint:biome: Checked 7 files in 512ms. No fixes applied.
@repo/database:lint:biome: Found 2 errors.
@repo/database:lint:biome:   × Formatter would have printed the following content:

@repo/database:lint:biome:   
@repo/database:lint:biome:      1    │ - {␍
@repo/database:lint:biome:      2    │ - ··"name":·"@repo/database",␍
@repo/database:lint:biome:      3    │ - ··"version":·"1.0.1",␍
@repo/database:lint:biome:      4    │ - ··"private":·true,␍
@repo/database:lint:biome:      5    │ - ··"type":·"module",␍
@repo/database:lint:biome:      6    │ - ··"main":·"./src/index.ts",␍
@repo/database:lint:biome:      7    │ - ··"types":·"./src/index.ts",␍
@repo/database:lint:biome:      8    │ - ··"exports":·{␍
@repo/database:lint:biome:      9    │ - ····".":·"./src/index.ts",␍
@repo/database:lint:biome:     10    │ - ····"./package.json":·"./package.json"␍
@repo/database:lint:biome:     11    │ - ··},␍
@repo/database:lint:biome:     12    │ - ··"scripts":·{␍
@repo/database:lint:biome:     13    │ - ····"lint":·"pnpm·run·lint:biome·&&·pnpm·run·lint:eslint",␍
@repo/database:lint:biome:     14    │ - ····"check-types":·"pnpm·exec·tsc·--noEmit",␍
@repo/database:lint:biome:     15    │ - ····"generate":·"pnpm·exec·zen·generate·--schema·zenstack/schema.zmodel·--output·../core/src/logic/generated",␍
@repo/database:lint:biome:     16    │ - ····"db:push":·"pnpm·exec·zen·db·push·--schema·zenstack/schema.zmodel",␍
@repo/database:lint:biome:     17    │ - ····"db:studio":·"pnpm·exec·zen·studio·--schema·zenstack/schema.zmodel",␍
@repo/database:lint:biome:     18    │ - ····"db:migrate":·"pnpm·exec·zen·migrate·dev·--schema·zenstack/schema.zmodel",␍
@repo/database:lint:biome:     19    │ - ····"lint:biome":·"biome·check·.",␍
@repo/database:lint:biome:     20    │ - ····"lint:eslint":·"eslint·.",␍
@repo/database:lint:biome:     21    │ - ····"format":·"biome·format·--write·.",␍
@repo/database:lint:biome:     22    │ - ····"check-cycles":·"node·../../scripts/refactor/sovereign-cycle-checker.mjs",␍
@repo/database:lint:biome:     23    │ - ····"test":·"vitest·run",␍
@repo/database:lint:biome:     24    │ - ····"test:watch":·"vitest",␍
@repo/database:lint:biome:     25    │ - ····"test:ui":·"vitest·--ui",␍
@repo/database:lint:biome:     26    │ - ····"clean":·"rm·-rf·.turbo·node_modules·dist"␍
@repo/database:lint:biome:     27    │ - ··},␍
@repo/database:lint:biome:     28    │ - ··"dependencies":·{␍
@repo/database:lint:biome:     29    │ - ····"@repo/schema":·"workspace:*",␍
@repo/database:lint:biome:     30    │ - ····"@zenstackhq/orm":·"3.6.4",␍
@repo/database:lint:biome:     31    │ - ····"kysely":·"0.28.16",␍
@repo/database:lint:biome:     32    │ - ····"zod":·"4.3.6",␍
@repo/database:lint:biome:     33    │ - ····"pg":·"^8.13.3",␍
@repo/database:lint:biome:     34    │ - ····"@zenstackhq/schema":·"3.6.4"␍
@repo/database:lint:biome:     35    │ - ··},␍
@repo/database:lint:biome:     36    │ - ··"devDependencies":·{␍
@repo/database:lint:biome:     37    │ - ····"@types/pg":·"^8.20.0",␍
@repo/database:lint:biome:     38    │ - ····"@zenstackhq/cli":·"3.6.4",␍
@repo/database:lint:biome:     39    │ - ····"@zenstackhq/language":·"3.6.4",␍
@repo/database:lint:biome:     40    │ - ····"@zenstackhq/plugin-policy":·"3.6.4",␍
@repo/database:lint:biome:     41    │ - ····"@zenstackhq/sdk":·"3.6.4",␍
@repo/database:lint:biome:     42    │ - ····"@zenstackhq/zod":·"3.6.4",␍
@repo/database:lint:biome:     43    │ - ····"@repo/eslint-config":·"workspace:^",␍
@repo/database:lint:biome:     44    │ - ····"@repo/typescript-config":·"workspace:*",␍
@repo/database:lint:biome:     45    │ - ····"vitest":·"^2.1.9",␍
@repo/database:lint:biome:     46    │ - ····"vite-tsconfig-paths":·"^6.1.1",␍
@repo/database:lint:biome:     47    │ - ····"typescript":·"^5.9.3",␍
@repo/database:lint:biome:     48    │ - ····"eslint":·"^9.38.0"␍
@repo/database:lint:biome:     49    │ - ··}␍
@repo/database:lint:biome:     50    │ - }␍
@repo/database:lint:biome:         1 │ + {
@repo/database:lint:biome:         2 │ + ··"name":·"@repo/database",
@repo/database:lint:biome:         3 │ + ··"version":·"1.0.1",
@repo/database:lint:biome:         4 │ + ··"private":·true,
@repo/database:lint:biome:         5 │ + ··"type":·"module",
@repo/database:lint:biome:         6 │ + ··"main":·"./src/index.ts",
@repo/database:lint:biome:         7 │ + ··"types":·"./src/index.ts",
@repo/database:lint:biome:         8 │ + ··"exports":·{
@repo/database:lint:biome:         9 │ + ····".":·"./src/index.ts",
@repo/database:lint:biome:        10 │ + ····"./package.json":·"./package.json"
@repo/database:lint:biome:        11 │ + ··},
@repo/database:lint:biome:        12 │ + ··"scripts":·{
@repo/database:lint:biome:        13 │ + ····"lint":·"pnpm·run·lint:biome·&&·pnpm·run·lint:eslint",
@repo/database:lint:biome:        14 │ + ····"check-types":·"pnpm·exec·tsc·--noEmit",
@repo/database:lint:biome:        15 │ + ····"generate":·"pnpm·exec·zen·generate·--schema·zenstack/schema.zmodel·--output·../core/src/logic/generated",
@repo/database:lint:biome:        16 │ + ····"db:push":·"pnpm·exec·zen·db·push·--schema·zenstack/schema.zmodel",
@repo/database:lint:biome:        17 │ + ····"db:studio":·"pnpm·exec·zen·studio·--schema·zenstack/schema.zmodel",
@repo/database:lint:biome:        18 │ + ····"db:migrate":·"pnpm·exec·zen·migrate·dev·--schema·zenstack/schema.zmodel",
@repo/database:lint:biome:        19 │ + ····"lint:biome":·"biome·check·.",
@repo/database:lint:biome:        20 │ + ····"lint:eslint":·"eslint·.",
@repo/database:lint:biome:        21 │ + ····"format":·"biome·format·--write·.",
@repo/database:lint:biome:        22 │ + ····"check-cycles":·"node·../../scripts/refactor/sovereign-cycle-checker.mjs",
@repo/database:lint:biome:        23 │ + ····"test":·"vitest·run",
@repo/database:lint:biome:        24 │ + ····"test:watch":·"vitest",
@repo/database:lint:biome:        25 │ + ····"test:ui":·"vitest·--ui",
@repo/database:lint:biome:        26 │ + ····"clean":·"rm·-rf·.turbo·node_modules·dist"
@repo/database:lint:biome:        27 │ + ··},
@repo/database:lint:biome:        28 │ + ··"dependencies":·{
@repo/database:lint:biome:        29 │ + ····"@repo/schema":·"workspace:*",
@repo/database:lint:biome:        30 │ + ····"@zenstackhq/orm":·"3.6.4",
@repo/database:lint:biome:        31 │ + ····"kysely":·"0.28.16",
@repo/database:lint:biome:        32 │ + ····"zod":·"4.3.6",
@repo/database:lint:biome:        33 │ + ····"pg":·"^8.13.3",
@repo/database:lint:biome:        34 │ + ····"@zenstackhq/schema":·"3.6.4"
@repo/database:lint:biome:        35 │ + ··},
@repo/database:lint:biome:        36 │ + ··"devDependencies":·{
@repo/database:lint:biome:        37 │ + ····"@types/pg":·"^8.20.0",
@repo/database:lint:biome:        38 │ + ····"@zenstackhq/cli":·"3.6.4",
@repo/database:lint:biome:        39 │ + ····"@zenstackhq/language":·"3.6.4",
@repo/database:lint:biome:        40 │ + ····"@zenstackhq/plugin-policy":·"3.6.4",
@repo/database:lint:biome:        41 │ + ····"@zenstackhq/sdk":·"3.6.4",
@repo/database:lint:biome:        42 │ + ····"@zenstackhq/zod":·"3.6.4",
@repo/database:lint:biome:        43 │ + ····"@repo/eslint-config":·"workspace:^",
@repo/database:lint:biome:        44 │ + ····"@repo/typescript-config":·"workspace:*",
@repo/database:lint:biome:        45 │ + ····"vitest":·"^2.1.9",
@repo/database:lint:biome:        46 │ + ····"vite-tsconfig-paths":·"^6.1.1",
@repo/database:lint:biome:        47 │ + ····"typescript":·"^5.9.3",
@repo/database:lint:biome:        48 │ + ····"eslint":·"^9.38.0"
@repo/database:lint:biome:        49 │ + ··}
@repo/database:lint:biome:        50 │ + }
@repo/database:lint:biome:     51 51 │   
@repo/database:lint:biome:   
@repo/database:lint:biome: 
@repo/database:lint:biome: src\client.ts format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/database:lint:biome: 
@repo/database:lint:biome:   × Formatter would have printed the following content:
@repo/database:lint:biome:   
@repo/database:lint:biome:      1    │ - import·{·schema·}·from·'@repo/schema';␍
@repo/database:lint:biome:      2    │ - import·{·ZenStackClient·}·from·'@zenstackhq/orm';␍
@repo/database:lint:biome:      3    │ - import·{·PostgresDialect·}·from·'kysely';␍
@repo/database:lint:biome:      4    │ - import·{·Pool·}·from·'pg';␍
@repo/database:lint:biome:      5    │ - ␍
@repo/database:lint:biome:      6    │ - type·AuthUser·=·{␍
@repo/database:lint:biome:      7    │ - ··id:·string;␍
@repo/database:lint:biome:      8    │ - };␍
@repo/database:lint:biome:      9    │ - ␍
@repo/database:lint:biome:     10    │ - let·sharedPool:·Pool·|·null·=·null;␍
@repo/database:lint:biome:     11    │ - ␍
@repo/database:lint:biome:     12    │ - const·getPool·=·()·=>·{␍
@repo/database:lint:biome:     13    │ - ··const·DATABASE_URL·=·process.env.DATABASE_URL;␍
@repo/database:lint:biome:     14    │ - ··if·(!DATABASE_URL)·{␍
@repo/database:lint:biome:     15    │ - ····throw·new·Error('DATABASE_URL·is·required·to·initialize·the·ZenStack·client');␍
@repo/database:lint:biome:     16    │ - ··}␍
@repo/database:lint:biome:     17    │ - ␍
@repo/database:lint:biome:     18    │ - ··if·(!sharedPool)·{␍
@repo/database:lint:biome:     19    │ - ····sharedPool·=·new·Pool({␍
@repo/database:lint:biome:     20    │ - ······connectionString:·DATABASE_URL,␍
@repo/database:lint:biome:     21    │ - ····});␍
@repo/database:lint:biome:     22    │ - ··}␍
@repo/database:lint:biome:     23    │ - ␍
@repo/database:lint:biome:     24    │ - ··return·sharedPool;␍
@repo/database:lint:biome:     25    │ - };␍
@repo/database:lint:biome:     26    │ - ␍
@repo/database:lint:biome:     27    │ - export·const·createZenStackDb·=·(user:·AuthUser)·=>·{␍
@repo/database:lint:biome:     28    │ - ··const·dialect·=·new·PostgresDialect({␍
@repo/database:lint:biome:     29    │ - ····pool:·getPool(),␍
@repo/database:lint:biome:     30    │ - ··});␍
@repo/database:lint:biome:     31    │ - ␍
@repo/database:lint:biome:     32    │ - ··return·new·ZenStackClient(schema,·{␍
@repo/database:lint:biome:     33    │ - ····dialect,␍
@repo/database:lint:biome:     34    │ - ····user:·{␍
@repo/database:lint:biome:     35    │ - ······id:·user.id,␍
@repo/database:lint:biome:     36    │ - ····},␍
@repo/database:lint:biome:     37    │ - ··});␍
@repo/database:lint:biome:     38    │ - };␍
@repo/database:lint:biome:     39    │ - ␍
@repo/database:lint:biome:     40    │ - export·const·canUseZenStackDb·=·()·=>·Boolean(process.env.DATABASE_URL);␍
@repo/database:lint:biome:         1 │ + import·{·schema·}·from·'@repo/schema';
@repo/database:lint:biome:         2 │ + import·{·ZenStackClient·}·from·'@zenstackhq/orm';
@repo/database:lint:biome:         3 │ + import·{·PostgresDialect·}·from·'kysely';
@repo/database:lint:biome:         4 │ + import·{·Pool·}·from·'pg';
@repo/database:lint:biome:         5 │ + 
@repo/database:lint:biome:         6 │ + type·AuthUser·=·{
@repo/database:lint:biome:         7 │ + ··id:·string;
@repo/database:lint:biome:         8 │ + };
@repo/database:lint:biome:         9 │ + 
@repo/database:lint:biome:        10 │ + let·sharedPool:·Pool·|·null·=·null;
@repo/database:lint:biome:        11 │ + 
@repo/types-shim:lint:biome: Checked 5 files in 384ms. No fixes applied.
@repo/database:lint:biome:        12 │ + const·getPool·=·()·=>·{
@repo/types-shim:lint:biome: Found 1 error.
@repo/database:lint:biome:        13 │ + ··const·DATABASE_URL·=·process.env.DATABASE_URL;
@repo/types-shim:lint:biome: index.d.ts:1:1 suppressions/incorrect ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/database:lint:biome:        14 │ + ··if·(!DATABASE_URL)·{
@repo/types-shim:lint:biome: 
@repo/database:lint:biome:        15 │ + ····throw·new·Error('DATABASE_URL·is·required·to·initialize·the·ZenStack·client');
@repo/types-shim:lint:biome: Found 1 warning.
@repo/database:lint:biome:        16 │ + ··}
@repo/database:lint:biome:        17 │ + 
@repo/database:lint:biome:        18 │ + ··if·(!sharedPool)·{
@repo/database:lint:biome:        19 │ + ····sharedPool·=·new·Pool({
@repo/types-shim:lint:biome:   ! Range suppressions must have a matching biome-ignore-end
@repo/database:lint:biome:        20 │ + ······connectionString:·DATABASE_URL,
@repo/types-shim:lint:biome:   
@repo/database:lint:biome:        21 │ + ····});
@repo/types-shim:lint:biome:   > 1 │ // biome-ignore-start lint/suspicious/noExplicitAny: shims intentionally use explicit any
@repo/database:lint:biome:        22 │ + ··}
@repo/types-shim:lint:biome:       │ ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
@repo/database:lint:biome:        23 │ + 
@repo/types-shim:lint:biome:     2 │ // This is an empty type definition file to satisfy legacy peer dependencies.
@repo/database:lint:biome:        24 │ + ··return·sharedPool;
@repo/types-shim:lint:biome:     3 │ // React Native 0.83+ provides its own types.
@repo/database:lint:biome:        25 │ + };
@repo/types-shim:lint:biome:   
@repo/database:lint:biome:        26 │ + 
@repo/types-shim:lint:biome: 
@repo/database:lint:biome:        27 │ + export·const·createZenStackDb·=·(user:·AuthUser)·=>·{
@repo/types-shim:lint:biome: index.d.ts:96:21 suppressions/parse ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/database:lint:biome:        28 │ + ··const·dialect·=·new·PostgresDialect({
@repo/types-shim:lint:biome: 
@repo/database:lint:biome:        29 │ + ····pool:·getPool(),
@repo/types-shim:lint:biome:   × Unexpected token, expected one of ':', '(' or whitespace
@repo/database:lint:biome:        30 │ + ··});
@repo/types-shim:lint:biome:   
@repo/database:lint:biome:        31 │ + 
@repo/types-shim:lint:biome:     94 │ export {};
@repo/database:lint:biome:        32 │ + ··return·new·ZenStackClient(schema,·{
@repo/types-shim:lint:biome:     95 │ 
@repo/database:lint:biome:        33 │ + ····dialect,
@repo/types-shim:lint:biome:   > 96 │ // biome-ignore-end lint/suspicious/noExplicitAny
@repo/database:lint:biome:        34 │ + ····user:·{
@repo/database:lint:biome:        35 │ + ······id:·user.id,
@repo/database:lint:biome:        36 │ + ····},
@repo/database:lint:biome:        37 │ + ··});
@repo/database:lint:biome:        38 │ + };
@repo/database:lint:biome:        39 │ + 
@repo/database:lint:biome:        40 │ + export·const·canUseZenStackDb·=·()·=>·Boolean(process.env.DATABASE_URL);
@repo/database:lint:biome:     41 41 │   
@repo/database:lint:biome:   
@repo/database:lint:biome: 
@repo/database:lint:biome: check ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/database:lint:biome: 
@repo/database:lint:biome:   × Some errors were emitted while running checks.
@repo/database:lint:biome:   
@repo/database:lint:biome: 
@repo/types-shim:lint:biome:        │                     ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
@repo/types-shim:lint:biome:     97 │ 
@repo/types-shim:lint:biome:   
@repo/types-shim:lint:biome:   i A colon is required after the category.
@repo/types-shim:lint:biome:   
@repo/types-shim:lint:biome:   i Example of suppression: // biome-ignore lint: reason
@repo/types-shim:lint:biome:   
@repo/types-shim:lint:biome: 
@repo/types-shim:lint:biome: check ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/types-shim:lint:biome: 
@repo/types-shim:lint:biome:   × Some errors were emitted while running checks.
@repo/types-shim:lint:biome:   
@repo/types-shim:lint:biome: 
apps-gurudevi-marketing-web:lint:biome: src\components\SEO.astro:10:3 lint/correctness/noUnusedVariables ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
apps-gurudevi-marketing-web:lint:biome: 
apps-gurudevi-marketing-web:lint:biome:   ! This variable title is unused.
apps-gurudevi-marketing-web:lint:biome:   
apps-gurudevi-marketing-web:lint:biome:      9 │ const {
apps-gurudevi-marketing-web:lint:biome:   > 10 │   title,
apps-gurudevi-marketing-web:lint:biome:        │   ^^^^^
apps-gurudevi-marketing-web:lint:biome:     11 │   description,
apps-gurudevi-marketing-web:lint:biome:     12 │   image = '/og-image.jpg',
apps-gurudevi-marketing-web:lint:biome:   
apps-gurudevi-marketing-web:lint:biome:   i Unused variables are often the result of typos, incomplete refactors, or other sources of bugs.
apps-gurudevi-marketing-web:lint:biome:   
apps-gurudevi-marketing-web:lint:biome: 
apps-gurudevi-marketing-web:lint:biome: src\components\StatItem.astro:8:9 lint/correctness/noUnusedVariables ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
apps-gurudevi-marketing-web:lint:biome: 
apps-gurudevi-marketing-web:lint:biome:   ! This variable value is unused.
apps-gurudevi-marketing-web:lint:biome:   
apps-gurudevi-marketing-web:lint:biome:      6 │ }
apps-gurudevi-marketing-web:lint:biome:      7 │ 
apps-gurudevi-marketing-web:lint:biome:    > 8 │ const { value, label, icon } = Astro.props;
apps-gurudevi-marketing-web:lint:biome:        │         ^^^^^
apps-gurudevi-marketing-web:lint:biome:      9 │ ---
apps-gurudevi-marketing-web:lint:biome:     10 │ 
apps-gurudevi-marketing-web:lint:biome:   
apps-gurudevi-marketing-web:lint:biome:   i Unused variables are often the result of typos, incomplete refactors, or other sources of bugs.
apps-gurudevi-marketing-web:lint:biome:   
apps-gurudevi-marketing-web:lint:biome: 
apps-gurudevi-marketing-web:lint:biome: src\components\StatItem.astro:8:16 lint/correctness/noUnusedVariables ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
apps-gurudevi-marketing-web:lint:biome: 
apps-gurudevi-marketing-web:lint:biome:   ! This variable label is unused.
apps-gurudevi-marketing-web:lint:biome:   
apps-gurudevi-marketing-web:lint:biome:      6 │ }
apps-gurudevi-marketing-web:lint:biome:      7 │ 
apps-gurudevi-marketing-web:lint:biome:    > 8 │ const { value, label, icon } = Astro.props;
apps-gurudevi-marketing-web:lint:biome:        │                ^^^^^
apps-gurudevi-marketing-web:lint:biome:      9 │ ---
apps-gurudevi-marketing-web:lint:biome:     10 │ 
apps-gurudevi-marketing-web:lint:biome:   
apps-gurudevi-marketing-web:lint:biome:   i Unused variables are often the result of typos, incomplete refactors, or other sources of bugs.
apps-gurudevi-marketing-web:lint:biome:   
apps-gurudevi-marketing-web:lint:biome: 
apps-gurudevi-marketing-web:lint:biome: src\components\StatItem.astro:8:23 lint/correctness/noUnusedVariables ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
apps-gurudevi-marketing-web:lint:biome: 
apps-gurudevi-marketing-web:lint:biome:   ! This variable icon is unused.
apps-gurudevi-marketing-web:lint:biome:   
apps-gurudevi-marketing-web:lint:biome:      6 │ }
apps-gurudevi-marketing-web:lint:biome:      7 │ 
apps-gurudevi-marketing-web:lint:biome:    > 8 │ const { value, label, icon } = Astro.props;
apps-gurudevi-marketing-web:lint:biome:        │                       ^^^^
apps-gurudevi-marketing-web:lint:biome:      9 │ ---
apps-gurudevi-marketing-web:lint:biome:     10 │ 
apps-gurudevi-marketing-web:lint:biome:   

apps-gurudevi-marketing-web:lint:biome:   i Unused variables are often the result of typos, incomplete refactors, or other sources of bugs.
@repo/payments:lint:biome: src\plugins\payhere.ts:10:16 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/payments:lint:biome: 
@repo/payments:lint:biome: Checked 10 files in 724ms. No fixes applied.
@repo/payments:lint:biome: Found 5 warnings.
apps-gurudevi-marketing-web:lint:biome:   
apps-gurudevi-marketing-web:lint:biome: 
apps-gurudevi-marketing-web:lint:biome: src\components\StructuredData.astro:3:24 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
apps-gurudevi-marketing-web:lint:biome: 
apps-gurudevi-marketing-web:lint:biome:   ! Unexpected any. Specify a different type.
apps-gurudevi-marketing-web:lint:biome:   
apps-gurudevi-marketing-web:lint:biome:     1 │ ---
apps-gurudevi-marketing-web:lint:biome:     2 │ interface Props {
apps-gurudevi-marketing-web:lint:biome:   > 3 │   data: Record<string, any> | Array<Record<string, any>>;
apps-gurudevi-marketing-web:lint:biome:       │                        ^^^
apps-gurudevi-marketing-web:lint:biome:     4 │ }
apps-gurudevi-marketing-web:lint:biome:     5 │ 
apps-gurudevi-marketing-web:lint:biome:   
apps-gurudevi-marketing-web:lint:biome:   i any disables many type checking rules. Its use should be avoided.
apps-gurudevi-marketing-web:lint:biome:   
apps-gurudevi-marketing-web:lint:biome: 
apps-gurudevi-marketing-web:lint:biome: src\components\StructuredData.astro:3:52 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
apps-gurudevi-marketing-web:lint:biome: 
apps-gurudevi-marketing-web:lint:biome:   ! Unexpected any. Specify a different type.
apps-gurudevi-marketing-web:lint:biome:   
apps-gurudevi-marketing-web:lint:biome:     1 │ ---
apps-gurudevi-marketing-web:lint:biome:     2 │ interface Props {
apps-gurudevi-marketing-web:lint:biome:   > 3 │   data: Record<string, any> | Array<Record<string, any>>;
apps-gurudevi-marketing-web:lint:biome:       │                                                    ^^^
apps-gurudevi-marketing-web:lint:biome:     4 │ }
apps-gurudevi-marketing-web:lint:biome:     5 │ 
apps-gurudevi-marketing-web:lint:biome:   
apps-gurudevi-marketing-web:lint:biome:   i any disables many type checking rules. Its use should be avoided.
apps-gurudevi-marketing-web:lint:biome:   
apps-gurudevi-marketing-web:lint:biome: 
apps-gurudevi-marketing-web:lint:biome: src\components\StructuredData.astro:7:77 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
apps-gurudevi-marketing-web:lint:biome: 
apps-gurudevi-marketing-web:lint:biome:   ! Unexpected any. Specify a different type.
apps-gurudevi-marketing-web:lint:biome:   
apps-gurudevi-marketing-web:lint:biome:     6 │ const { data } = Astro.props;
apps-gurudevi-marketing-web:lint:biome:   > 7 │ const _normalized = (Array.isArray(data) ? data : [data]) as Record<string, any>[];
apps-gurudevi-marketing-web:lint:biome:       │                                                                             ^^^
apps-gurudevi-marketing-web:lint:biome:     8 │ ---
apps-gurudevi-marketing-web:lint:biome:     9 │ 
apps-gurudevi-marketing-web:lint:biome:   
apps-gurudevi-marketing-web:lint:biome:   i any disables many type checking rules. Its use should be avoided.
apps-gurudevi-marketing-web:lint:biome:   
apps-gurudevi-marketing-web:lint:biome: 
apps-gurudevi-marketing-web:lint:biome: src\inngest\functions\mutationHandlers.ts:116:27 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━
apps-gurudevi-marketing-web:lint:biome: 
apps-gurudevi-marketing-web:lint:biome:   ! Unexpected any. Specify a different type.
apps-gurudevi-marketing-web:lint:biome:   
apps-gurudevi-marketing-web:lint:biome:     114 │     triggers: [syncMutationQueuedEvent],
apps-gurudevi-marketing-web:lint:biome:     115 │   },
apps-gurudevi-marketing-web:lint:biome:   > 116 │   async ({ event, step }: any) => {
apps-gurudevi-marketing-web:lint:biome:         │                           ^^^
apps-gurudevi-marketing-web:lint:biome:     117 │     const { mutationId, action, idempotencyKey, payload, tenantId, correlationId, causationId } =
apps-gurudevi-marketing-web:lint:biome:     118 │       event.data;
apps-gurudevi-marketing-web:lint:biome:   
apps-gurudevi-marketing-web:lint:biome:   i any disables many type checking rules. Its use should be avoided.
apps-gurudevi-marketing-web:lint:biome:   
apps-gurudevi-marketing-web:lint:biome: 
apps-gurudevi-marketing-web:lint:biome: src\layouts\Layout.astro:17:35 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
apps-gurudevi-marketing-web:lint:biome: 
apps-gurudevi-marketing-web:lint:biome:   ! Unexpected any. Specify a different type.
apps-gurudevi-marketing-web:lint:biome:   
apps-gurudevi-marketing-web:lint:biome:     15 │   image?: string;
apps-gurudevi-marketing-web:lint:biome:     16 │   noindex?: boolean;
apps-gurudevi-marketing-web:lint:biome:   > 17 │   structuredData?: Record<string, any> | Array<Record<string, any>>;
apps-gurudevi-marketing-web:lint:biome:        │                                   ^^^
apps-gurudevi-marketing-web:lint:biome:     18 │ }
apps-gurudevi-marketing-web:lint:biome:     19 │ 
apps-gurudevi-marketing-web:lint:biome:   
apps-gurudevi-marketing-web:lint:biome:   i any disables many type checking rules. Its use should be avoided.
apps-gurudevi-marketing-web:lint:biome:   
apps-gurudevi-marketing-web:lint:biome: 
apps-gurudevi-marketing-web:lint:biome: src\layouts\Layout.astro:17:63 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
apps-gurudevi-marketing-web:lint:biome: 
apps-gurudevi-marketing-web:lint:biome:   ! Unexpected any. Specify a different type.
apps-gurudevi-marketing-web:lint:biome:   
apps-gurudevi-marketing-web:lint:biome:     15 │   image?: string;
apps-gurudevi-marketing-web:lint:biome:     16 │   noindex?: boolean;
apps-gurudevi-marketing-web:lint:biome:   > 17 │   structuredData?: Record<string, any> | Array<Record<string, any>>;
apps-gurudevi-marketing-web:lint:biome:        │                                                               ^^^
apps-gurudevi-marketing-web:lint:biome:     18 │ }
apps-gurudevi-marketing-web:lint:biome:     19 │ 
apps-gurudevi-marketing-web:lint:biome:   
apps-gurudevi-marketing-web:lint:biome:   i any disables many type checking rules. Its use should be avoided.
apps-gurudevi-marketing-web:lint:biome:   
apps-gurudevi-marketing-web:lint:biome: 
apps-gurudevi-marketing-web:lint:biome: .astro\types.d.ts format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
apps-gurudevi-marketing-web:lint:biome: 
apps-gurudevi-marketing-web:lint:biome:   × Formatter would have printed the following content:
apps-gurudevi-marketing-web:lint:biome:   
apps-gurudevi-marketing-web:lint:biome:     1   │ - ///·<reference·types="astro/client"·/>␍
apps-gurudevi-marketing-web:lint:biome:     2   │ - ///·<reference·path="content.d.ts"·/>␍
apps-gurudevi-marketing-web:lint:biome:       1 │ + ///·<reference·types="astro/client"·/>
apps-gurudevi-marketing-web:lint:biome:       2 │ + ///·<reference·path="content.d.ts"·/>
apps-gurudevi-marketing-web:lint:biome:     3 3 │   
apps-gurudevi-marketing-web:lint:biome:   
apps-gurudevi-marketing-web:lint:biome: 
apps-gurudevi-marketing-web:lint:biome: src\components\Footer.astro format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
apps-gurudevi-marketing-web:lint:biome: 
apps-gurudevi-marketing-web:lint:biome:   × Formatter would have printed the following content:
apps-gurudevi-marketing-web:lint:biome:   
apps-gurudevi-marketing-web:lint:biome:     2 │ const·_currentYear·=·new·Date().getFullYear();␍
apps-gurudevi-marketing-web:lint:biome:       │                                               
apps-gurudevi-marketing-web:lint:biome: 
apps-gurudevi-marketing-web:lint:biome: src\components\Header.astro format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
apps-gurudevi-marketing-web:lint:biome: 
apps-gurudevi-marketing-web:lint:biome:   × Formatter would have printed the following content:
apps-gurudevi-marketing-web:lint:biome:   
apps-gurudevi-marketing-web:lint:biome:      1  1 │   ---␍
apps-gurudevi-marketing-web:lint:biome:      2    │ - const·_navItems·=·[␍
apps-gurudevi-marketing-web:lint:biome:      3    │ - ··{·name:·'About',·href:·'/about'·},␍
apps-gurudevi-marketing-web:lint:biome:      4    │ - ··{·name:·'Thuthimal',·href:·'/thuthimal'·},␍
apps-gurudevi-marketing-web:lint:biome:      5    │ - ··{·name:·'FAQ',·href:·'/faq'·},␍
apps-gurudevi-marketing-web:lint:biome:      6    │ - ··{·name:·'Support',·href:·'/support'·},␍
apps-gurudevi-marketing-web:lint:biome:      7    │ - ];␍
apps-gurudevi-marketing-web:lint:biome:         2 │ + const·_navItems·=·[
apps-gurudevi-marketing-web:lint:biome:         3 │ + ··{·name:·'About',·href:·'/about'·},
apps-gurudevi-marketing-web:lint:biome:         4 │ + ··{·name:·'Thuthimal',·href:·'/thuthimal'·},
apps-gurudevi-marketing-web:lint:biome:         5 │ + ··{·name:·'FAQ',·href:·'/faq'·},
apps-gurudevi-marketing-web:lint:biome:         6 │ + ··{·name:·'Support',·href:·'/support'·},
apps-gurudevi-marketing-web:lint:biome:         7 │ + ];
apps-gurudevi-marketing-web:lint:biome:      8  8 │   ---␍
apps-gurudevi-marketing-web:lint:biome:      9  9 │   ␍
apps-gurudevi-marketing-web:lint:biome:   
apps-gurudevi-marketing-web:lint:biome: 
apps-gurudevi-marketing-web:lint:biome: src\components\StatsSection.svelte format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
apps-gurudevi-marketing-web:lint:biome: 
apps-gurudevi-marketing-web:lint:biome:   × Formatter would have printed the following content:
apps-gurudevi-marketing-web:lint:biome:   
apps-gurudevi-marketing-web:lint:biome:      1  1 │   <script lang="ts">␍
apps-gurudevi-marketing-web:lint:biome:      2    │ - const·_statDefs·=·[␍
apps-gurudevi-marketing-web:lint:biome:      3    │ - ··{␍
apps-gurudevi-marketing-web:lint:biome:      4    │ - ····key:·'teachers_count'·as·const,␍
apps-gurudevi-marketing-web:lint:biome:      5    │ - ····label:·'Teachers',␍
apps-gurudevi-marketing-web:lint:biome:      6    │ - ····icon:·`<svg·viewBox="0·0·24·24"·width="32"·height="32"·fill="currentColor"><path·d="M12·12c2.21·0·4-1.79·4-4s-1.79-4-4-4-4·1.79-4·4·1.79·4·4·4zm0·2c-2.67·0-8·1.34-8·4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>`,␍
apps-gurudevi-marketing-web:lint:biome:      7    │ - ··},␍
apps-gurudevi-marketing-web:lint:biome:      8    │ - ··{␍
apps-gurudevi-marketing-web:lint:biome:      9    │ - ····key:·'students_count'·as·const,␍
apps-gurudevi-marketing-web:lint:biome:     10    │ - ····label:·'Students',␍
apps-gurudevi-marketing-web:lint:biome:     11    │ - ····icon:·`<svg·viewBox="0·0·24·24"·width="32"·height="32"·fill="currentColor"><path·d="M16·11c1.66·0·2.99-1.34·2.99-3S17.66·8·16·8·13.01·9.34·13.01·11s1.33·3·2.99·3zM9·11c1.66·0·2.99-1.34·2.99-3S10.66·8·9·8·6.01·9.34·6.01·11s1.33·3·2.99·3zm7·3c-2.33·0-7·1.17-7·3.5V19h14v-1.5c0-2.33-4.67-3.5-7-3.5zm-7·0c-2.33·0-7·1.17-7·3.5V19h5v-1.5c0-1.07.36-2.02.93-2.82C9.57·14.25·9.3·14·9·14z"/></svg>`,␍
@repo/payments:lint:biome:   ! Unexpected any. Specify a different type.
@repo/payments:lint:biome:   
@repo/payments:lint:biome:      8 │     amount: number,
@repo/payments:lint:biome:      9 │     currency: string,
@repo/payments:lint:biome:   > 10 │     metadata?: any,
@repo/payments:lint:biome:        │                ^^^
@repo/payments:lint:biome:     11 │   ): Promise<PaymentIntent> {
@repo/payments:lint:biome:     12 │     // In a real implementation, this would call PayHere API to get a checkout URL or token.
@repo/payments:lint:biome:   
@repo/payments:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@repo/payments:lint:biome:   
@repo/payments:lint:biome: 
@repo/payments:lint:biome: src\plugins\stripe.ts:10:16 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/payments:lint:biome: 
@repo/payments:lint:biome:   ! Unexpected any. Specify a different type.
@repo/payments:lint:biome:   
@repo/payments:lint:biome:      8 │     amount: number,
@repo/payments:lint:biome:      9 │     currency: string,
@repo/payments:lint:biome:   > 10 │     metadata?: any,
@repo/payments:lint:biome:        │                ^^^
@repo/payments:lint:biome:     11 │   ): Promise<PaymentIntent> {
@repo/payments:lint:biome:     12 │     // In a real implementation, this would call Stripe API (via Edge Function)
@repo/payments:lint:biome:   
@repo/payments:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@repo/payments:lint:biome:   
@repo/payments:lint:biome: 
@repo/payments:lint:biome: src\types.ts:10:29 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/payments:lint:biome: 
@repo/payments:lint:biome:   ! Unexpected any. Specify a different type.
@repo/payments:lint:biome:   
@repo/payments:lint:biome:      8 │   provider: string;
@repo/payments:lint:biome:      9 │   clientSecret?: string;
@repo/payments:lint:biome:   > 10 │   metadata?: Record<string, any>;
@repo/payments:lint:biome:        │                             ^^^
@repo/payments:lint:biome:     11 │ }
@repo/payments:lint:biome:     12 │ 
@repo/payments:lint:biome:   
@repo/payments:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@repo/payments:lint:biome:   
@repo/payments:lint:biome: 
@repo/payments:lint:biome: src\types.ts:20:29 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/payments:lint:biome: 
@repo/payments:lint:biome:   ! Unexpected any. Specify a different type.
@repo/payments:lint:biome:   
@repo/payments:lint:biome:     18 │   expiry?: string;
@repo/payments:lint:biome:     19 │   isDefault: boolean;
@repo/payments:lint:biome:   > 20 │   metadata?: Record<string, any>;
@repo/payments:lint:biome:        │                             ^^^
@repo/payments:lint:biome:     21 │ }
@repo/payments:lint:biome:     22 │ 
@repo/payments:lint:biome:   
@repo/payments:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@repo/payments:lint:biome:   
@repo/payments:lint:biome: 
@repo/payments:lint:biome: src\types.ts:26:66 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/payments:lint:biome: 
@repo/payments:lint:biome:   ! Unexpected any. Specify a different type.
@repo/payments:lint:biome:   
@repo/payments:lint:biome:     24 │   id: string;
@repo/payments:lint:biome:     25 │   name: string;
@repo/payments:lint:biome:   > 26 │   initializePayment(amount: number, currency: string, metadata?: any): Promise<PaymentIntent>;
@repo/payments:lint:biome:        │                                                                  ^^^
@repo/payments:lint:biome:     27 │   verifyPayment(paymentIntentId: string): Promise<PaymentStatus>;
@repo/payments:lint:biome:     28 │   getFeeEstimate(amount: number): number;
@repo/payments:lint:biome:   
@repo/payments:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@repo/payments:lint:biome:   
@repo/payments:lint:biome: 
apps-gurudevi-marketing-web:lint:biome:     12    │ - ··},␍
apps-gurudevi-marketing-web:lint:biome:     13    │ - ··{␍
apps-gurudevi-marketing-web:lint:biome:     14    │ - ····key:·'schools_count'·as·const,␍
apps-gurudevi-marketing-web:lint:biome:     15    │ - ····label:·'Schools',␍
apps-gurudevi-marketing-web:lint:biome:     16    │ - ····icon:·`<svg·viewBox="0·0·24·24"·width="32"·height="32"·fill="currentColor"><path·d="M5·13.18v4L12·21l7-3.82v-4L12·17l-7-3.82zM12·3L1·9l11·6·9-4.91V17h2V9L12·3z"/></svg>`,␍
apps-gurudevi-marketing-web:lint:biome:     17    │ - ··},␍
apps-gurudevi-marketing-web:lint:biome:     18    │ - ··{␍
apps-gurudevi-marketing-web:lint:biome:     19    │ - ····key:·'lessons_shared_count'·as·const,␍
apps-gurudevi-marketing-web:lint:biome:     20    │ - ····label:·'Lessons·Shared',␍
apps-gurudevi-marketing-web:lint:biome:     21    │ - ····icon:·`<svg·viewBox="0·0·24·24"·width="32"·height="32"·fill="currentColor"><path·d="M18·2H6c-1.1·0-2·.9-2·2v16c0·1.1.9·2·2·2h12c1.1·0·2-.9·2-2V4c0-1.1-.9-2-2-2zM9·4h2v5l-1-.75L9·9V4zm9·16H6V4h1v9l3-2.25L13·13V4h5v16z"/></svg>`,␍
apps-gurudevi-marketing-web:lint:biome:     22    │ - ··},␍
apps-gurudevi-marketing-web:lint:biome:     23    │ - ];␍
apps-gurudevi-marketing-web:lint:biome:     24    │ - ␍
apps-gurudevi-marketing-web:lint:biome:     25    │ - const·_stats·=·{␍
apps-gurudevi-marketing-web:lint:biome:     26    │ - ··teachers_count:·0,␍
apps-gurudevi-marketing-web:lint:biome:     27    │ - ··students_count:·0,␍
apps-gurudevi-marketing-web:lint:biome:     28    │ - ··schools_count:·0,␍
apps-gurudevi-marketing-web:lint:biome:     29    │ - ··lessons_shared_count:·0,␍
apps-gurudevi-marketing-web:lint:biome:     30    │ - };␍
apps-gurudevi-marketing-web:lint:biome:     31    │ - ␍
apps-gurudevi-marketing-web:lint:biome:     32    │ - function·_formatCount(value:·number):·string·{␍
apps-gurudevi-marketing-web:lint:biome:     33    │ - ··return·new·Intl.NumberFormat('en-US').format(value);␍
apps-gurudevi-marketing-web:lint:biome:     34    │ - }␍
apps-gurudevi-marketing-web:lint:biome:         2 │ + const·_statDefs·=·[
apps-gurudevi-marketing-web:lint:biome:         3 │ + ··{
apps-gurudevi-marketing-web:lint:biome:         4 │ + ····key:·'teachers_count'·as·const,
apps-gurudevi-marketing-web:lint:biome:         5 │ + ····label:·'Teachers',
apps-gurudevi-marketing-web:lint:biome:         6 │ + ····icon:·`<svg·viewBox="0·0·24·24"·width="32"·height="32"·fill="currentColor"><path·d="M12·12c2.21·0·4-1.79·4-4s-1.79-4-4-4-4·1.79-4·4·1.79·4·4·4zm0·2c-2.67·0-8·1.34-8·4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>`,
apps-gurudevi-marketing-web:lint:biome:         7 │ + ··},
apps-gurudevi-marketing-web:lint:biome:         8 │ + ··{
apps-gurudevi-marketing-web:lint:biome:         9 │ + ····key:·'students_count'·as·const,
apps-gurudevi-marketing-web:lint:biome:        10 │ + ····label:·'Students',
apps-gurudevi-marketing-web:lint:biome:        11 │ + ····icon:·`<svg·viewBox="0·0·24·24"·width="32"·height="32"·fill="currentColor"><path·d="M16·11c1.66·0·2.99-1.34·2.99-3S17.66·8·16·8·13.01·9.34·13.01·11s1.33·3·2.99·3zM9·11c1.66·0·2.99-1.34·2.99-3S10.66·8·9·8·6.01·9.34·6.01·11s1.33·3·2.99·3zm7·3c-2.33·0-7·1.17-7·3.5V19h14v-1.5c0-2.33-4.67-3.5-7-3.5zm-7·0c-2.33·0-7·1.17-7·3.5V19h5v-1.5c0-1.07.36-2.02.93-2.82C9.57·14.25·9.3·14·9·14z"/></svg>`,
apps-gurudevi-marketing-web:lint:biome:        12 │ + ··},
apps-gurudevi-marketing-web:lint:biome:        13 │ + ··{
apps-gurudevi-marketing-web:lint:biome:        14 │ + ····key:·'schools_count'·as·const,
apps-gurudevi-marketing-web:lint:biome:        15 │ + ····label:·'Schools',
apps-gurudevi-marketing-web:lint:biome:        16 │ + ····icon:·`<svg·viewBox="0·0·24·24"·width="32"·height="32"·fill="currentColor"><path·d="M5·13.18v4L12·21l7-3.82v-4L12·17l-7-3.82zM12·3L1·9l11·6·9-4.91V17h2V9L12·3z"/></svg>`,
apps-gurudevi-marketing-web:lint:biome:        17 │ + ··},
apps-gurudevi-marketing-web:lint:biome:        18 │ + ··{
apps-gurudevi-marketing-web:lint:biome:        19 │ + ····key:·'lessons_shared_count'·as·const,
apps-gurudevi-marketing-web:lint:biome:        20 │ + ····label:·'Lessons·Shared',
apps-gurudevi-marketing-web:lint:biome:        21 │ + ····icon:·`<svg·viewBox="0·0·24·24"·width="32"·height="32"·fill="currentColor"><path·d="M18·2H6c-1.1·0-2·.9-2·2v16c0·1.1.9·2·2·2h12c1.1·0·2-.9·2-2V4c0-1.1-.9-2-2-2zM9·4h2v5l-1-.75L9·9V4zm9·16H6V4h1v9l3-2.25L13·13V4h5v16z"/></svg>`,
apps-gurudevi-marketing-web:lint:biome:        22 │ + ··},
apps-gurudevi-marketing-web:lint:biome:        23 │ + ];
apps-gurudevi-marketing-web:lint:biome:        24 │ + 
apps-gurudevi-marketing-web:lint:biome:        25 │ + const·_stats·=·{
apps-gurudevi-marketing-web:lint:biome:        26 │ + ··teachers_count:·0,
apps-gurudevi-marketing-web:lint:biome:        27 │ + ··students_count:·0,
apps-gurudevi-marketing-web:lint:biome:        28 │ + ··schools_count:·0,
apps-gurudevi-marketing-web:lint:biome:        29 │ + ··lessons_shared_count:·0,
apps-gurudevi-marketing-web:lint:biome:        30 │ + };
apps-gurudevi-marketing-web:lint:biome:        31 │ + 
apps-gurudevi-marketing-web:lint:biome:        32 │ + function·_formatCount(value:·number):·string·{
apps-gurudevi-marketing-web:lint:biome:        33 │ + ··return·new·Intl.NumberFormat('en-US').format(value);
apps-gurudevi-marketing-web:lint:biome:        34 │ + }
apps-gurudevi-marketing-web:lint:biome:     35 35 │   </script>␍
apps-gurudevi-marketing-web:lint:biome:     36 36 │   ␍
apps-gurudevi-marketing-web:lint:biome:   
apps-gurudevi-marketing-web:lint:biome: 
apps-gurudevi-marketing-web:lint:biome: src\components\StructuredData.astro format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
apps-gurudevi-marketing-web:lint:biome: 
apps-gurudevi-marketing-web:lint:biome:   × Formatter would have printed the following content:
apps-gurudevi-marketing-web:lint:biome:   
apps-gurudevi-marketing-web:lint:biome:      1  1 │   ---␍
apps-gurudevi-marketing-web:lint:biome:      2    │ - interface·Props·{␍
apps-gurudevi-marketing-web:lint:biome:      3    │ - ··data:·Record<string,·any>·|·Array<Record<string,·any>>;␍
apps-gurudevi-marketing-web:lint:biome:      4    │ - }␍
apps-gurudevi-marketing-web:lint:biome:      5    │ - ␍
apps-gurudevi-marketing-web:lint:biome:      6    │ - const·{·data·}·=·Astro.props;␍
apps-gurudevi-marketing-web:lint:biome:      7    │ - const·_normalized·=·(Array.isArray(data)·?·data·:·[data])·as·Record<string,·any>[];␍
apps-gurudevi-marketing-web:lint:biome:         2 │ + interface·Props·{
apps-gurudevi-marketing-web:lint:biome:         3 │ + ··data:·Record<string,·any>·|·Array<Record<string,·any>>;
apps-gurudevi-marketing-web:lint:biome:         4 │ + }
apps-gurudevi-marketing-web:lint:biome:         5 │ + 
apps-gurudevi-marketing-web:lint:biome:         6 │ + const·{·data·}·=·Astro.props;
apps-gurudevi-marketing-web:lint:biome:         7 │ + const·_normalized·=·(Array.isArray(data)·?·data·:·[data])·as·Record<string,·any>[];
apps-gurudevi-marketing-web:lint:biome:      8  8 │   ---␍
apps-gurudevi-marketing-web:lint:biome:      9  9 │   ␍
apps-gurudevi-marketing-web:lint:biome:   
apps-gurudevi-marketing-web:lint:biome: 
apps-gurudevi-marketing-web:lint:biome: src\inngest\lib\workerObservability.ts format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
apps-gurudevi-marketing-web:lint:biome: 
apps-gurudevi-marketing-web:lint:biome:   × Formatter would have printed the following content:
apps-gurudevi-marketing-web:lint:biome:   
apps-gurudevi-marketing-web:lint:biome:      1    │ - import·{·initPostHog,·trackEvent·}·from·'@repo/analytics';␍
apps-gurudevi-marketing-web:lint:biome:      2    │ - import·type·{·SupabaseClient·}·from·'@supabase/supabase-js';␍
apps-gurudevi-marketing-web:lint:biome:      3    │ - ␍
apps-gurudevi-marketing-web:lint:biome:      4    │ - type·WorkerAuditInput·=·{␍
apps-gurudevi-marketing-web:lint:biome:      5    │ - ··supabase:·SupabaseClient;␍
apps-gurudevi-marketing-web:lint:biome:      6    │ - ··id?:·string;␍
apps-gurudevi-marketing-web:lint:biome:      7    │ - ··action:·string;␍
apps-gurudevi-marketing-web:lint:biome:      8    │ - ··entityId:·string;␍
apps-gurudevi-marketing-web:lint:biome:      9    │ - ··entityType:·string;␍
apps-gurudevi-marketing-web:lint:biome:     10    │ - ··schoolId?:·string·|·null;␍
apps-gurudevi-marketing-web:lint:biome:     11    │ - ··idempotencyKey?:·string;␍
apps-gurudevi-marketing-web:lint:biome:     12    │ - ··correlationId?:·string;␍
apps-gurudevi-marketing-web:lint:biome:     13    │ - ··causationId?:·string;␍
apps-gurudevi-marketing-web:lint:biome:     14    │ - ··metadata?:·Record<string,·unknown>;␍
apps-gurudevi-marketing-web:lint:biome:     15    │ - };␍
apps-gurudevi-marketing-web:lint:biome:     16    │ - ␍
apps-gurudevi-marketing-web:lint:biome:     17    │ - type·WorkerAnalyticsInput·=·{␍
apps-gurudevi-marketing-web:lint:biome:     18    │ - ··eventName:·string;␍
apps-gurudevi-marketing-web:lint:biome:     19    │ - ··distinctId:·string;␍
apps-gurudevi-marketing-web:lint:biome:     20    │ - ··correlationId?:·string;␍
apps-gurudevi-marketing-web:lint:biome:     21    │ - ··causationId?:·string;␍
apps-gurudevi-marketing-web:lint:biome:     22    │ - ··properties?:·Record<string,·unknown>;␍
apps-gurudevi-marketing-web:lint:biome:     23    │ - };␍
apps-gurudevi-marketing-web:lint:biome:     24    │ - ␍
apps-gurudevi-marketing-web:lint:biome:     25    │ - export·async·function·insertWorkerAuditLog({␍
apps-gurudevi-marketing-web:lint:biome:     26    │ - ··supabase,␍
apps-gurudevi-marketing-web:lint:biome:     27    │ - ··id,␍
apps-gurudevi-marketing-web:lint:biome:     28    │ - ··action,␍
apps-gurudevi-marketing-web:lint:biome:     29    │ - ··entityId,␍
apps-gurudevi-marketing-web:lint:biome:     30    │ - ··entityType,␍
apps-gurudevi-marketing-web:lint:biome:     31    │ - ··schoolId,␍
apps-gurudevi-marketing-web:lint:biome:     32    │ - ··idempotencyKey,␍
apps-gurudevi-marketing-web:lint:biome:     33    │ - ··correlationId,␍
apps-gurudevi-marketing-web:lint:biome:     34    │ - ··causationId,␍
apps-gurudevi-marketing-web:lint:biome:     35    │ - ··metadata,␍
apps-gurudevi-marketing-web:lint:biome:     36    │ - }:·WorkerAuditInput)·{␍
apps-gurudevi-marketing-web:lint:biome:     37    │ - ··const·{·error·}·=·await·supabase.from('audit_logs').insert({␍
apps-gurudevi-marketing-web:lint:biome:     38    │ - ····id,␍
apps-gurudevi-marketing-web:lint:biome:     39    │ - ····action,␍
apps-gurudevi-marketing-web:lint:biome:     40    │ - ····entity_id:·entityId,␍
apps-gurudevi-marketing-web:lint:biome:     41    │ - ····entity_type:·entityType,␍
apps-gurudevi-marketing-web:lint:biome:     42    │ - ····school_id:·schoolId·??·null,␍
apps-gurudevi-marketing-web:lint:biome:     43    │ - ····metadata:·{␍
apps-gurudevi-marketing-web:lint:biome:     44    │ - ······...(metadata·??·{}),␍
apps-gurudevi-marketing-web:lint:biome:     45    │ - ······correlationId:·correlationId·??·null,␍
apps-gurudevi-marketing-web:lint:biome:     46    │ - ······causationId:·causationId·??·null,␍
apps-gurudevi-marketing-web:lint:biome:     47    │ - ····},␍
apps-gurudevi-marketing-web:lint:biome:     48    │ - ····idempotency_key:·idempotencyKey,␍
apps-gurudevi-marketing-web:lint:biome:     49    │ - ··});␍
apps-gurudevi-marketing-web:lint:biome:     50    │ - ␍
apps-gurudevi-marketing-web:lint:biome:     51    │ - ··if·(error)·throw·error;␍
apps-gurudevi-marketing-web:lint:biome:     52    │ - }␍
apps-gurudevi-marketing-web:lint:biome:     53    │ - ␍
apps-gurudevi-marketing-web:lint:biome:     54    │ - export·async·function·trackWorkerAnalytics({␍
apps-gurudevi-marketing-web:lint:biome:     55    │ - ··eventName,␍
apps-gurudevi-marketing-web:lint:biome:     56    │ - ··distinctId,␍
apps-gurudevi-marketing-web:lint:biome:     57    │ - ··correlationId,␍
apps-gurudevi-marketing-web:lint:biome:     58    │ - ··causationId,␍
apps-gurudevi-marketing-web:lint:biome:     59    │ - ··properties,␍
apps-gurudevi-marketing-web:lint:biome:     60    │ - }:·WorkerAnalyticsInput)·{␍
apps-gurudevi-marketing-web:lint:biome:     61    │ - ··await·initPostHog(import.meta.env.POSTHOG_API_KEY!,·{␍
apps-gurudevi-marketing-web:lint:biome:     62    │ - ····host:␍
apps-gurudevi-marketing-web:lint:biome:     63    │ - ······import.meta.env.POSTHOG_HOST·||␍
apps-gurudevi-marketing-web:lint:biome:     64    │ - ······import.meta.env.PUBLIC_POSTHOG_HOST·||␍
apps-gurudevi-marketing-web:lint:biome:     65    │ - ······'https://eu.i.posthog.com',␍
apps-gurudevi-marketing-web:lint:biome:     66    │ - ··});␍
apps-gurudevi-marketing-web:lint:biome:     67    │ - ␍
apps-gurudevi-marketing-web:lint:biome:     68    │ - ··trackEvent(eventName,·{␍
apps-gurudevi-marketing-web:lint:biome:     69    │ - ····distinctId,␍
apps-gurudevi-marketing-web:lint:biome:     70    │ - ····correlation_id:·correlationId,␍
apps-gurudevi-marketing-web:lint:biome:     71    │ - ····causation_id:·causationId,␍
apps-gurudevi-marketing-web:lint:biome:     72    │ - ····...(properties·??·{}),␍
apps-gurudevi-marketing-web:lint:biome:     73    │ - ··});␍
apps-gurudevi-marketing-web:lint:biome:     74    │ - }␍
apps-gurudevi-marketing-web:lint:biome:         1 │ + import·{·initPostHog,·trackEvent·}·from·'@repo/analytics';
apps-gurudevi-marketing-web:lint:biome:         2 │ + import·type·{·SupabaseClient·}·from·'@supabase/supabase-js';
apps-gurudevi-marketing-web:lint:biome:         3 │ + 
apps-gurudevi-marketing-web:lint:biome:         4 │ + type·WorkerAuditInput·=·{
apps-gurudevi-marketing-web:lint:biome:         5 │ + ··supabase:·SupabaseClient;
apps-gurudevi-marketing-web:lint:biome:         6 │ + ··id?:·string;
apps-gurudevi-marketing-web:lint:biome:         7 │ + ··action:·string;

apps-gurudevi-marketing-web:lint:biome:         8 │ + ··entityId:·string;
apps-gurudevi-marketing-web:lint:biome:         9 │ + ··entityType:·string;
apps-gurudevi-marketing-web:lint:biome:        10 │ + ··schoolId?:·string·|·null;
apps-gurudevi-marketing-web:lint:biome:        11 │ + ··idempotencyKey?:·string;
apps-gurudevi-marketing-web:lint:biome:        12 │ + ··correlationId?:·string;
apps-gurudevi-marketing-web:lint:biome:        13 │ + ··causationId?:·string;
apps-gurudevi-marketing-web:lint:biome:        14 │ + ··metadata?:·Record<string,·unknown>;
apps-gurudevi-marketing-web:lint:biome:        15 │ + };
apps-gurudevi-marketing-web:lint:biome:        16 │ + 
apps-gurudevi-marketing-web:lint:biome:        17 │ + type·WorkerAnalyticsInput·=·{
apps-gurudevi-marketing-web:lint:biome:        18 │ + ··eventName:·string;
apps-gurudevi-marketing-web:lint:biome:        19 │ + ··distinctId:·string;
apps-gurudevi-marketing-web:lint:biome:        20 │ + ··correlationId?:·string;
apps-gurudevi-marketing-web:lint:biome:        21 │ + ··causationId?:·string;
apps-gurudevi-marketing-web:lint:biome:        22 │ + ··properties?:·Record<string,·unknown>;
apps-gurudevi-marketing-web:lint:biome:        23 │ + };
apps-gurudevi-marketing-web:lint:biome:        24 │ + 
apps-gurudevi-marketing-web:lint:biome:        25 │ + export·async·function·insertWorkerAuditLog({
apps-gurudevi-marketing-web:lint:biome:        26 │ + ··supabase,
apps-gurudevi-marketing-web:lint:biome:        27 │ + ··id,
apps-gurudevi-marketing-web:lint:biome:        28 │ + ··action,
apps-gurudevi-marketing-web:lint:biome:        29 │ + ··entityId,
apps-gurudevi-marketing-web:lint:biome:        30 │ + ··entityType,
apps-gurudevi-marketing-web:lint:biome:        31 │ + ··schoolId,
apps-gurudevi-marketing-web:lint:biome:        32 │ + ··idempotencyKey,
apps-gurudevi-marketing-web:lint:biome:        33 │ + ··correlationId,
apps-gurudevi-marketing-web:lint:biome:        34 │ + ··causationId,
apps-gurudevi-marketing-web:lint:biome:        35 │ + ··metadata,
apps-gurudevi-marketing-web:lint:biome:        36 │ + }:·WorkerAuditInput)·{
apps-gurudevi-marketing-web:lint:biome:        37 │ + ··const·{·error·}·=·await·supabase.from('audit_logs').insert({
apps-gurudevi-marketing-web:lint:biome:        38 │ + ····id,
apps-gurudevi-marketing-web:lint:biome:        39 │ + ····action,
apps-gurudevi-marketing-web:lint:biome:        40 │ + ····entity_id:·entityId,
apps-gurudevi-marketing-web:lint:biome:        41 │ + ····entity_type:·entityType,
apps-gurudevi-marketing-web:lint:biome:        42 │ + ····school_id:·schoolId·??·null,
apps-gurudevi-marketing-web:lint:biome:        43 │ + ····metadata:·{
apps-gurudevi-marketing-web:lint:biome:        44 │ + ······...(metadata·??·{}),
apps-gurudevi-marketing-web:lint:biome:        45 │ + ······correlationId:·correlationId·??·null,
apps-gurudevi-marketing-web:lint:biome:        46 │ + ······causationId:·causationId·??·null,
apps-gurudevi-marketing-web:lint:biome:        47 │ + ····},
apps-gurudevi-marketing-web:lint:biome:        48 │ + ····idempotency_key:·idempotencyKey,
apps-gurudevi-marketing-web:lint:biome:        49 │ + ··});
apps-gurudevi-marketing-web:lint:biome:        50 │ + 
apps-gurudevi-marketing-web:lint:biome:        51 │ + ··if·(error)·throw·error;

apps-gurudevi-marketing-web:lint:biome:        52 │ + }
apps-gurudevi-marketing-web:lint:biome:        53 │ + 

apps-gurudevi-marketing-web:lint:biome:        54 │ + export·async·function·trackWorkerAnalytics({
apps-gurudevi-marketing-web:lint:biome:        55 │ + ··eventName,
apps-gurudevi-marketing-web:lint:biome:        56 │ + ··distinctId,
apps-gurudevi-marketing-web:lint:biome:        57 │ + ··correlationId,
apps-gurudevi-marketing-web:lint:biome:        58 │ + ··causationId,
apps-gurudevi-marketing-web:lint:biome:        59 │ + ··properties,
apps-gurudevi-marketing-web:lint:biome:        60 │ + }:·WorkerAnalyticsInput)·{

apps-gurudevi-marketing-web:lint:biome:        61 │ + ··await·initPostHog(import.meta.env.POSTHOG_API_KEY!,·{
apps-gurudevi-marketing-web:lint:biome:        62 │ + ····host:
apps-gurudevi-marketing-web:lint:biome:        63 │ + ······import.meta.env.POSTHOG_HOST·||
apps-gurudevi-marketing-web:lint:biome:        64 │ + ······import.meta.env.PUBLIC_POSTHOG_HOST·||
apps-gurudevi-marketing-web:lint:biome:        65 │ + ······'https://eu.i.posthog.com',
apps-gurudevi-marketing-web:lint:biome:        66 │ + ··});
apps-gurudevi-marketing-web:lint:biome:        67 │ + 
apps-gurudevi-marketing-web:lint:biome:        68 │ + ··trackEvent(eventName,·{
apps-gurudevi-marketing-web:lint:biome:        69 │ + ····distinctId,
apps-gurudevi-marketing-web:lint:biome:        70 │ + ····correlation_id:·correlationId,
apps-gurudevi-marketing-web:lint:biome:        71 │ + ····causation_id:·causationId,
apps-gurudevi-marketing-web:lint:biome:        72 │ + ····...(properties·??·{}),
apps-gurudevi-marketing-web:lint:biome:        73 │ + ··});
apps-gurudevi-marketing-web:lint:biome:        74 │ + }
apps-gurudevi-marketing-web:lint:biome:     75 75 │   
apps-gurudevi-marketing-web:lint:biome:   
apps-gurudevi-marketing-web:lint:biome: 
apps-gurudevi-marketing-web:lint:biome: src\layouts\Layout.astro format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
apps-gurudevi-marketing-web:lint:biome: 
apps-gurudevi-marketing-web:lint:biome:   × Formatter would have printed the following content:
apps-gurudevi-marketing-web:lint:biome:   
apps-gurudevi-marketing-web:lint:biome:       1   1 │   ---␍
apps-gurudevi-marketing-web:lint:biome:       2     │ - import·'../styles/global.css';␍
apps-gurudevi-marketing-web:lint:biome:       3     │ - import·{␍
apps-gurudevi-marketing-web:lint:biome:       4     │ - ··defaultOgImage,␍
apps-gurudevi-marketing-web:lint:biome:       5     │ - ··ORGANIZATION,␍

apps-gurudevi-marketing-web:lint:biome:       6     │ - ··SITE_DESCRIPTION,␍

apps-gurudevi-marketing-web:lint:biome:       7     │ - ··SITE_NAME,␍
apps-gurudevi-marketing-web:lint:biome:       8     │ - ··SITE_TITLE,␍
apps-gurudevi-marketing-web:lint:biome:       9     │ - ··SITE_URL,␍
apps-gurudevi-marketing-web:lint:biome:      10     │ - }·from·'../lib/site';␍
apps-gurudevi-marketing-web:lint:biome:      11     │ - ␍
apps-gurudevi-marketing-web:lint:biome:      12     │ - interface·Props·{␍
apps-gurudevi-marketing-web:lint:biome:      13     │ - ··title?:·string;␍
apps-gurudevi-marketing-web:lint:biome:      14     │ - ··description?:·string;␍
apps-gurudevi-marketing-web:lint:biome:      15     │ - ··image?:·string;␍
apps-gurudevi-marketing-web:lint:biome:      16     │ - ··noindex?:·boolean;␍
apps-gurudevi-marketing-web:lint:biome:      17     │ - ··structuredData?:·Record<string,·any>·|·Array<Record<string,·any>>;␍
apps-gurudevi-marketing-web:lint:biome:      18     │ - }␍
apps-gurudevi-marketing-web:lint:biome:      19     │ - ␍
apps-gurudevi-marketing-web:lint:biome:      20     │ - const·{␍
apps-gurudevi-marketing-web:lint:biome:      21     │ - ··title·=·SITE_TITLE,␍
apps-gurudevi-marketing-web:lint:biome:      22     │ - ··description·=·SITE_DESCRIPTION,␍
apps-gurudevi-marketing-web:lint:biome:      23     │ - ··image,␍
apps-gurudevi-marketing-web:lint:biome:      24     │ - ··noindex·=·false,␍
apps-gurudevi-marketing-web:lint:biome:      25     │ - ··structuredData·=·[],␍
apps-gurudevi-marketing-web:lint:biome:      26     │ - }·=·Astro.props;␍
apps-gurudevi-marketing-web:lint:biome:      27     │ - ␍
apps-gurudevi-marketing-web:lint:biome:      28     │ - const·canonical·=·Astro.url.href;␍
apps-gurudevi-marketing-web:lint:biome:      29     │ - const·_ogImage·=·image·??·defaultOgImage(Astro.url.pathname);␍
apps-gurudevi-marketing-web:lint:biome:      30     │ - const·_robotsContent·=·noindex·?·'noindex,·nofollow'·:·'index,·follow';␍
apps-gurudevi-marketing-web:lint:biome:      31     │ - const·_baseStructuredData·=·[␍
apps-gurudevi-marketing-web:lint:biome:      32     │ - ··{␍
apps-gurudevi-marketing-web:lint:biome:      33     │ - ····'@context':·'https://schema.org',␍
apps-gurudevi-marketing-web:lint:biome:      34     │ - ····'@type':·'Organization',␍
apps-gurudevi-marketing-web:lint:biome:      35     │ - ····...ORGANIZATION,␍
apps-gurudevi-marketing-web:lint:biome:      36     │ - ··},␍
apps-gurudevi-marketing-web:lint:biome:      37     │ - ··{␍
apps-gurudevi-marketing-web:lint:biome:      38     │ - ····'@context':·'https://schema.org',␍
apps-gurudevi-marketing-web:lint:biome:      39     │ - ····'@type':·'WebSite',␍
apps-gurudevi-marketing-web:lint:biome:      40     │ - ····name:·SITE_NAME,␍
apps-gurudevi-marketing-web:lint:biome:      41     │ - ····url:·SITE_URL,␍

apps-gurudevi-marketing-web:lint:biome:      42     │ - ····description:·SITE_DESCRIPTION,␍
apps-gurudevi-marketing-web:lint:biome:      43     │ - ··},␍
apps-gurudevi-marketing-web:lint:biome:      44     │ - ··{␍
apps-gurudevi-marketing-web:lint:biome:      45     │ - ····'@context':·'https://schema.org',␍
apps-gurudevi-marketing-web:lint:biome:      46     │ - ····'@type':·'WebPage',␍
apps-gurudevi-marketing-web:lint:biome:      47     │ - ····name:·title,␍
apps-gurudevi-marketing-web:lint:biome:      48     │ - ····description,␍
apps-gurudevi-marketing-web:lint:biome:      49     │ - ····url:·canonical,␍
apps-gurudevi-marketing-web:lint:biome:      50     │ - ··},␍
apps-gurudevi-marketing-web:lint:biome:      51     │ - ]␍
apps-gurudevi-marketing-web:lint:biome:      52     │ - ··.concat(Array.isArray(structuredData)·?·structuredData·:·[structuredData])␍
apps-gurudevi-marketing-web:lint:biome:      53     │ - ··.filter(Boolean);␍
apps-gurudevi-marketing-web:lint:biome:           2 │ + import·'../styles/global.css';
@repo/database:lint:biome:  ELIFECYCLE  Command failed with exit code 1.

apps-gurudevi-marketing-web:lint:biome:           3 │ + import·{
apps-gurudevi-marketing-web:lint:biome:           4 │ + ··defaultOgImage,
apps-gurudevi-marketing-web:lint:biome:           5 │ + ··ORGANIZATION,

apps-gurudevi-marketing-web:lint:biome:           6 │ + ··SITE_DESCRIPTION,
apps-gurudevi-marketing-web:lint:biome:           7 │ + ··SITE_NAME,
apps-gurudevi-marketing-web:lint:biome:           8 │ + ··SITE_TITLE,
apps-gurudevi-marketing-web:lint:biome:           9 │ + ··SITE_URL,
apps-gurudevi-marketing-web:lint:biome:          10 │ + }·from·'../lib/site';
apps-gurudevi-marketing-web:lint:biome:          11 │ + 
apps-gurudevi-marketing-web:lint:biome:          12 │ + interface·Props·{
apps-gurudevi-marketing-web:lint:biome:          13 │ + ··title?:·string;
apps-gurudevi-marketing-web:lint:biome:          14 │ + ··description?:·string;
apps-gurudevi-marketing-web:lint:biome:          15 │ + ··image?:·string;
apps-gurudevi-marketing-web:lint:biome:          16 │ + ··noindex?:·boolean;
apps-gurudevi-marketing-web:lint:biome:          17 │ + ··structuredData?:·Record<string,·any>·|·Array<Record<string,·any>>;
apps-gurudevi-marketing-web:lint:biome:          18 │ + }
apps-gurudevi-marketing-web:lint:biome:          19 │ + 
apps-gurudevi-marketing-web:lint:biome:          20 │ + const·{
apps-gurudevi-marketing-web:lint:biome:          21 │ + ··title·=·SITE_TITLE,
apps-gurudevi-marketing-web:lint:biome:          22 │ + ··description·=·SITE_DESCRIPTION,
apps-gurudevi-marketing-web:lint:biome:          23 │ + ··image,
apps-gurudevi-marketing-web:lint:biome:          24 │ + ··noindex·=·false,
apps-gurudevi-marketing-web:lint:biome:          25 │ + ··structuredData·=·[],
apps-gurudevi-marketing-web:lint:biome:          26 │ + }·=·Astro.props;
apps-gurudevi-marketing-web:lint:biome:          27 │ + 

apps-gurudevi-marketing-web:lint:biome:          28 │ + const·canonical·=·Astro.url.href;
apps-gurudevi-marketing-web:lint:biome:          29 │ + const·_ogImage·=·image·??·defaultOgImage(Astro.url.pathname);

apps-gurudevi-marketing-web:lint:biome:          30 │ + const·_robotsContent·=·noindex·?·'noindex,·nofollow'·:·'index,·follow';
apps-gurudevi-marketing-web:lint:biome:          31 │ + const·_baseStructuredData·=·[
apps-gurudevi-marketing-web:lint:biome:          32 │ + ··{
apps-gurudevi-marketing-web:lint:biome:          33 │ + ····'@context':·'https://schema.org',
apps-gurudevi-marketing-web:lint:biome:          34 │ + ····'@type':·'Organization',
apps-gurudevi-marketing-web:lint:biome:          35 │ + ····...ORGANIZATION,
apps-gurudevi-marketing-web:lint:biome:          36 │ + ··},
apps-gurudevi-marketing-web:lint:biome:          37 │ + ··{
apps-gurudevi-marketing-web:lint:biome:          38 │ + ····'@context':·'https://schema.org',
apps-gurudevi-marketing-web:lint:biome:          39 │ + ····'@type':·'WebSite',
apps-gurudevi-marketing-web:lint:biome:          40 │ + ····name:·SITE_NAME,
apps-gurudevi-marketing-web:lint:biome:          41 │ + ····url:·SITE_URL,
apps-gurudevi-marketing-web:lint:biome:          42 │ + ····description:·SITE_DESCRIPTION,
apps-gurudevi-marketing-web:lint:biome:          43 │ + ··},
apps-gurudevi-marketing-web:lint:biome:          44 │ + ··{
apps-gurudevi-marketing-web:lint:biome:          45 │ + ····'@context':·'https://schema.org',
apps-gurudevi-marketing-web:lint:biome:          46 │ + ····'@type':·'WebPage',
apps-gurudevi-marketing-web:lint:biome:          47 │ + ····name:·title,
apps-gurudevi-marketing-web:lint:biome:          48 │ + ····description,

apps-gurudevi-marketing-web:lint:biome:          49 │ + ····url:·canonical,
apps-gurudevi-marketing-web:lint:biome:          50 │ + ··},
apps-gurudevi-marketing-web:lint:biome:          51 │ + ]
apps-gurudevi-marketing-web:lint:biome:          52 │ + ··.concat(Array.isArray(structuredData)·?·structuredData·:·[structuredData])
apps-gurudevi-marketing-web:lint:biome:          53 │ + ··.filter(Boolean);
apps-gurudevi-marketing-web:lint:biome:      54  54 │   ---␍
apps-gurudevi-marketing-web:lint:biome:      55  55 │   ␍
apps-gurudevi-marketing-web:lint:biome:   
apps-gurudevi-marketing-web:lint:biome: 
apps-gurudevi-marketing-web:lint:biome: src\styles\global.css:3:2 parse ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
apps-gurudevi-marketing-web:lint:biome: 
apps-gurudevi-marketing-web:lint:biome:   × Tailwind-specific syntax is disabled.
apps-gurudevi-marketing-web:lint:biome:   
apps-gurudevi-marketing-web:lint:biome:      1 │ @import "tailwindcss";
apps-gurudevi-marketing-web:lint:biome:      2 │ 
apps-gurudevi-marketing-web:lint:biome:    > 3 │ @theme {
apps-gurudevi-marketing-web:lint:biome:        │  ^^^^^^^
apps-gurudevi-marketing-web:lint:biome:    > 4 │   /* Sanctuary Core Tokens (Web) */
apps-gurudevi-marketing-web:lint:biome:         ...
apps-gurudevi-marketing-web:lint:biome:   > 32 │   --font-display: "IM Fell English", serif;
apps-gurudevi-marketing-web:lint:biome:   > 33 │ }
apps-gurudevi-marketing-web:lint:biome:        │ ^
apps-gurudevi-marketing-web:lint:biome:     34 │ 
apps-gurudevi-marketing-web:lint:biome:     35 │ @layer base {
apps-gurudevi-marketing-web:lint:biome:   
apps-gurudevi-marketing-web:lint:biome:   i Enable `tailwindDirectives` in the css parser options, or remove this if you are not using Tailwind CSS.
apps-gurudevi-marketing-web:lint:biome:   
apps-gurudevi-marketing-web:lint:biome: 
apps-gurudevi-marketing-web:lint:biome: src\styles\global.css:42:6 parse ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
apps-gurudevi-marketing-web:lint:biome: 
apps-gurudevi-marketing-web:lint:biome:   × Tailwind-specific syntax is disabled.
apps-gurudevi-marketing-web:lint:biome:   
apps-gurudevi-marketing-web:lint:biome:     40 │     color: var(--color-charcoal-truth);

apps-gurudevi-marketing-web:lint:biome:     41 │     font-family: var(--font-content);
apps-gurudevi-marketing-web:lint:biome:   > 42 │     @apply transition-colors duration-300;
apps-gurudevi-marketing-web:lint:biome:        │      ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
apps-gurudevi-marketing-web:lint:biome:     43 │   }
apps-gurudevi-marketing-web:lint:biome:     44 │ 
apps-gurudevi-marketing-web:lint:biome:   
apps-gurudevi-marketing-web:lint:biome:   i Enable `tailwindDirectives` in the css parser options, or remove this if you are not using Tailwind CSS.
apps-gurudevi-marketing-web:lint:biome:   
apps-gurudevi-marketing-web:lint:biome: 
apps-gurudevi-marketing-web:lint:biome: src\styles\global.css format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
apps-gurudevi-marketing-web:lint:biome: 
apps-gurudevi-marketing-web:lint:biome:   × Code formatting aborted due to parsing errors. To format code with errors, enable the 'formatter.formatWithErrors' option.
apps-gurudevi-marketing-web:lint:biome:   
apps-gurudevi-marketing-web:lint:biome: 
apps-gurudevi-marketing-web:lint:biome: The number of diagnostics exceeds the limit allowed. Use --max-diagnostics to increase it.
apps-gurudevi-marketing-web:lint:biome: Diagnostics not shown: 22.
apps-gurudevi-marketing-web:lint:biome: Checked 63 files in 572ms. No fixes applied.
apps-gurudevi-marketing-web:lint:biome: Found 19 errors.
apps-gurudevi-marketing-web:lint:biome: Found 23 warnings.

apps-gurudevi-marketing-web:lint:biome: check ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
apps-gurudevi-marketing-web:lint:biome: 

apps-gurudevi-marketing-web:lint:biome:   × Some errors were emitted while running checks.
apps-gurudevi-marketing-web:lint:biome:   
apps-gurudevi-marketing-web:lint:biome: 

@repo/types-shim:lint:biome:  ELIFECYCLE  Command failed with exit code 1.

@repo/people:lint:biome: cache miss, executing 07dcbc4ce90f5ad2

@repo/form-builder:lint:biome: cache miss, executing 6eebe5735e251da8

apps-gurudevi-marketing-web:lint:biome:  ELIFECYCLE  Command failed with exit code 1.

@repo/core:lint:biome: src\__tests__\sanity.test.ts:9:28 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/core:lint:biome: 
@repo/core:lint:biome:   ! Unexpected any. Specify a different type.
@repo/core:lint:biome:   
@repo/core:lint:biome:      8 │   it('should have access to vitest environment', () => {
@repo/core:lint:biome:    > 9 │     expect((import.meta as any).env).toBeDefined();

@repo/core:lint:biome:        │                            ^^^
@repo/core:lint:biome:     10 │   });
@repo/core:lint:biome:     11 │ });
@repo/core:lint:biome:   
@repo/core:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@repo/core:lint:biome:   
@repo/core:lint:biome: 
@repo/core:lint:biome: src\adapters\events\inngest.adapter.ts:9:62 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/core:lint:biome: 
@repo/core:lint:biome:   ! Unexpected any. Specify a different type.
@repo/core:lint:biome:   
@repo/core:lint:biome:      7 │  * Concrete implementation of IEventBusPort for Inngest.
@repo/core:lint:biome:      8 │  */
@repo/core:lint:biome:    > 9 │ export const createInngestEventBusAdapter = (client: Inngest<any>): IEventBusPort => ({
@repo/core:lint:biome:        │                                                              ^^^
@repo/core:lint:biome:     10 │   async publish(event: DomainEvent) {
@repo/core:lint:biome:     11 │     await client.send({
@repo/core:lint:biome:   
@repo/core:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@repo/core:lint:biome:   
@repo/core:lint:biome: 
@repo/core:lint:biome: src\adapters\events\inngest.adapter.ts:12:27 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/core:lint:biome: 
@repo/core:lint:biome:   ! Unexpected any. Specify a different type.
@repo/core:lint:biome:   
@repo/core:lint:biome:     10 │   async publish(event: DomainEvent) {
@repo/core:lint:biome:     11 │     await client.send({
@repo/core:lint:biome:   > 12 │       name: event.name as any,
@repo/core:lint:biome:        │                           ^^^
@repo/core:lint:biome:     13 │       data: {
@repo/core:lint:biome:     14 │         ...event.data,
@repo/core:lint:biome:   
@repo/core:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@repo/core:lint:biome:   
@repo/core:lint:biome: 
@repo/core:lint:biome: src\adapters\native\FallbackMMKVStorageAdapter.ts:26:29 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━
@repo/core:lint:biome: 
@repo/core:lint:biome:   ! Unexpected any. Specify a different type.
@repo/core:lint:biome:   
@repo/core:lint:biome:     24 │   private readonly fallback: IStorage;
@repo/core:lint:biome:     25 │ 
@repo/core:lint:biome:   > 26 │   constructor(private mmkv: any) {
@repo/core:lint:biome:        │                             ^^^
@repo/core:lint:biome:     27 │     this.fallback = new AsyncStorageAdapter();
@repo/core:lint:biome:     28 │   }
@repo/core:lint:biome:   
@repo/core:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@repo/core:lint:biome:   
@repo/core:lint:biome: 
@repo/core:lint:biome: src\adapters\native\MMKVStorageAdapter.ts:7:29 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━
@repo/core:lint:biome: 
@repo/core:lint:biome:   ! Unexpected any. Specify a different type.
@repo/core:lint:biome:   
@repo/core:lint:biome:     5 │  */
@repo/core:lint:biome:     6 │ export class MMKVStorageAdapter implements IStorage {
@repo/core:lint:biome:   > 7 │   constructor(private mmkv: any) {}
@repo/core:lint:biome:       │                             ^^^
@repo/core:lint:biome:     8 │ 
@repo/core:lint:biome:     9 │   set(key: string, value: string | boolean | number) {
@repo/core:lint:biome:   
@repo/core:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@repo/core:lint:biome:   
@repo/core:lint:biome: 
@repo/core:lint:biome: src\adapters\native\NativeCryptoAdapter.ts:18:60 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━
@repo/core:lint:biome: 
@repo/core:lint:biome:   ! Unexpected any. Specify a different type.
@repo/core:lint:biome:   
@repo/core:lint:biome:     16 │   }
@repo/core:lint:biome:     17 │ 
@repo/core:lint:biome:   > 18 │   async setItemAsync(key: string, value: string, options?: any): Promise<void> {
@repo/core:lint:biome:        │                                                            ^^^
@repo/core:lint:biome:     19 │     await SecureStore.setItemAsync(key, value, options);
@repo/core:lint:biome:     20 │   }
@repo/core:lint:biome:   
@repo/core:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@repo/core:lint:biome:   
@repo/core:lint:biome: 
@repo/core:lint:biome: src\adapters\powersync\SupabasePowerSyncConnector.ts:80:40 lint/suspicious/noExplicitAny ━━━━━━━━━━━
@repo/core:lint:biome: 
@repo/core:lint:biome:   ! Unexpected any. Specify a different type.
@repo/core:lint:biome:   
@repo/core:lint:biome:     78 │       );
@repo/core:lint:biome:     79 │ 

@repo/core:lint:biome:   > 80 │       const res = await (client.api as any).powersync.upload.$post(

@repo/core:lint:biome:        │                                        ^^^
@repo/core:lint:biome:     81 │         {
@repo/core:lint:biome:     82 │           json: {
@repo/core:lint:biome:   
@repo/core:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@repo/core:lint:biome:   
@repo/core:lint:biome: 
@repo/core:lint:biome: src\adapters\powersync\SupabasePowerSyncConnector.ts:99:49 lint/suspicious/noExplicitAny ━━━━━━━━━━━
@repo/core:lint:biome: 
@repo/core:lint:biome:   ! Unexpected any. Specify a different type.
@repo/core:lint:biome:   
@repo/core:lint:biome:      98 │       if (!res.ok) {
@repo/core:lint:biome:    > 99 │         const errorData = (await res.json()) as any;
@repo/core:lint:biome:         │                                                 ^^^
@repo/core:lint:biome:     100 │         throw new Error(errorData.message || `Sanctuary API sync failed with status ${res.status}`);
@repo/core:lint:biome:     101 │       }
@repo/core:lint:biome:   
@repo/core:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@repo/core:lint:biome:   
@repo/core:lint:biome: 
@repo/core:lint:biome: src\utils\idempotency.ts:16:58 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/core:lint:biome: 
@repo/core:lint:biome:   ! Unexpected any. Specify a different type.
@repo/core:lint:biome:   
@repo/core:lint:biome:     14 │  * Useful for "fire-and-forget" syncs that might trigger multiple times.
@repo/core:lint:biome:     15 │  */
@repo/core:lint:biome:   > 16 │ export const getConsistentIdempotencyKey = async (_data: any) => {
@repo/core:lint:biome:        │                                                          ^^^
@repo/core:lint:biome:     17 │   // In a real 2026 app, we might use a hash of the data.
@repo/core:lint:biome:     18 │   // For now, simple UUID is fine if stored in local state.
@repo/core:lint:biome:   
@repo/core:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@repo/core:lint:biome:   
@repo/core:lint:biome: 
@repo/core:lint:biome: package.json format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/core:lint:biome: 
@repo/core:lint:biome:   × Formatter would have printed the following content:
@repo/core:lint:biome:   
@repo/core:lint:biome:       1     │ - {␍
@repo/core:lint:biome:       2     │ - ··"name":·"@repo/core",␍
@repo/core:lint:biome:       3     │ - ··"version":·"0.1.0",␍
@repo/core:lint:biome:       4     │ - ··"type":·"module",␍
@repo/core:lint:biome:       5     │ - ··"main":·"src/index.ts",␍
@repo/core:lint:biome:       6     │ - ··"types":·"src/index.ts",␍
@repo/core:lint:biome:       7     │ - ··"sideEffects":·false,␍
@repo/core:lint:biome:       8     │ - ··"engines":·{␍
@repo/core:lint:biome:       9     │ - ····"node":·">=20.0.0"␍
@repo/core:lint:biome:      10     │ - ··},␍
@repo/core:lint:biome:      11     │ - ··"exports":·{␍
@repo/core:lint:biome:      12     │ - ····".":·{␍
@repo/core:lint:biome:      13     │ - ······"types":·"./src/index.ts",␍
@repo/core:lint:biome:      14     │ - ······"import":·"./src/index.ts"␍
@repo/core:lint:biome:      15     │ - ····},␍
@repo/core:lint:biome:      16     │ - ····"./shared":·{␍
@repo/core:lint:biome:      17     │ - ······"types":·"./src/shared/index.ts",␍
@repo/core:lint:biome:      18     │ - ······"import":·"./src/shared/index.ts"␍
@repo/core:lint:biome:      19     │ - ····},␍
@repo/core:lint:biome:      20     │ - ····"./shared/*":·{␍
@repo/core:lint:biome:      21     │ - ······"types":·"./src/shared/*.ts",␍
@repo/core:lint:biome:      22     │ - ······"import":·"./src/shared/*.ts"␍
@repo/core:lint:biome:      23     │ - ····},␍
@repo/core:lint:biome:      24     │ - ····"./api":·{␍
@repo/core:lint:biome:      25     │ - ······"types":·"./src/api/index.ts",␍
@repo/core:lint:biome:      26     │ - ······"import":·"./src/api/index.ts"␍
@repo/core:lint:biome:      27     │ - ····},␍
@repo/core:lint:biome:      28     │ - ····"./api/server":·{␍
@repo/core:lint:biome:      29     │ - ······"types":·"./src/api/server.ts",␍
@repo/core:lint:biome:      30     │ - ······"import":·"./src/api/server.ts"␍
@repo/core:lint:biome:      31     │ - ····},␍
@repo/core:lint:biome:      32     │ - ····"./api/interceptor":·{␍
@repo/core:lint:biome:      33     │ - ······"types":·"./src/api/interceptor.ts",␍
@repo/core:lint:biome:      34     │ - ······"import":·"./src/api/interceptor.ts"␍
@repo/core:lint:biome:      35     │ - ····},␍
@repo/core:lint:biome:      36     │ - ····"./api/*":·{␍
@repo/core:lint:biome:      37     │ - ······"types":·"./src/api/*.ts",␍
@repo/core:lint:biome:      38     │ - ······"import":·"./src/api/*.ts"␍
@repo/core:lint:biome:      39     │ - ····},␍
@repo/core:lint:biome:      40     │ - ····"./api/hooks":·{␍
@repo/core:lint:biome:      41     │ - ······"types":·"./src/api/hooks/index.ts",␍
@repo/core:lint:biome:      42     │ - ······"import":·"./src/api/hooks/index.ts"␍
@repo/core:lint:biome:      43     │ - ····},␍
@repo/core:lint:biome:      44     │ - ····"./api/runtimes/*":·{␍
@repo/core:lint:biome:      45     │ - ······"types":·"./src/api/runtimes/*.ts",␍
@repo/core:lint:biome:      46     │ - ······"import":·"./src/api/runtimes/*.ts"␍
@repo/core:lint:biome:      47     │ - ····},␍
@repo/core:lint:biome:      48     │ - ····"./logic":·{␍
@repo/core:lint:biome:      49     │ - ······"types":·"./src/logic/index.ts",␍
@repo/core:lint:biome:      50     │ - ······"import":·"./src/logic/index.ts"␍
@repo/core:lint:biome:      51     │ - ····},␍
@repo/core:lint:biome:      52     │ - ····"./logic/schemas/*":·{␍
@repo/core:lint:biome:      53     │ - ······"types":·"./src/logic/schemas/*.ts",␍
@repo/core:lint:biome:      54     │ - ······"import":·"./src/logic/schemas/*.ts"␍
@repo/core:lint:biome:      55     │ - ····},␍
@repo/core:lint:biome:      56     │ - ····"./zen":·{␍
@repo/core:lint:biome:      57     │ - ······"types":·"./src/logic/generated/index.ts",␍
@repo/core:lint:biome:      58     │ - ······"import":·"./src/logic/generated/index.ts"␍
@intuitui-labs/lk-edu-geo:lint:biome: src\data\lk-edu-data.json check ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@intuitui-labs/lk-edu-geo:lint:biome: 
@intuitui-labs/lk-edu-geo:lint:biome:   i The size of the file is 11.9 MiB, which exceeds the configured maximum of 1.0 MiB for this project.
@intuitui-labs/lk-edu-geo:lint:biome:     Use the `files.maxSize` configuration to change the maximum size of files processed, or `files.includes` to ignore the file.
@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome: 
@intuitui-labs/lk-edu-geo:lint:biome: scripts\extract-geo.ts:20:49 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@intuitui-labs/lk-edu-geo:lint:biome: 
@intuitui-labs/lk-edu-geo:lint:biome:   ! Unexpected any. Specify a different type.
@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome:     19 │     // Enriched Hierarchy
@intuitui-labs/lk-edu-geo:lint:biome:   > 20 │     const enrichedDistricts = districts.map((d: any) => {
@intuitui-labs/lk-edu-geo:lint:biome:        │                                                 ^^^
@intuitui-labs/lk-edu-geo:lint:biome:     21 │       // Get cities by district from postal backend
@intuitui-labs/lk-edu-geo:lint:biome:     22 │       const postalCities = SLPostal.citiesByDistrict(d.name_en) || [];
@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome: 

@repo/core:lint:biome:      59     │ - ····},␍
@intuitui-labs/lk-edu-geo:lint:biome: scripts\extract-geo.ts:26:21 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@intuitui-labs/lk-edu-geo:lint:biome: 
@intuitui-labs/lk-edu-geo:lint:biome:   ! Unexpected any. Specify a different type.
@intuitui-labs/lk-edu-geo:lint:biome:   
@repo/self:lint:biome: lint_results.json internalError/io  INTERNAL  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/self:lint:biome: 
@repo/self:lint:biome:   × stream did not contain valid UTF-8
@repo/self:lint:biome:   
@repo/self:lint:biome: The number of diagnostics exceeds the limit allowed. Use --max-diagnostics to increase it.
@repo/self:lint:biome: Diagnostics not shown: 268.
@repo/self:lint:biome: Checked 129 files in 2s. No fixes applied.
@repo/self:lint:biome: Found 226 errors.
@repo/self:lint:biome: Found 61 warnings.

@intuitui-labs/lk-edu-geo:lint:biome:     24 │       // Match cities from SLGeo with PostalCodes
@repo/self:lint:biome:   ! This diagnostic was derived from an internal Biome error. Potential bug, please report it if necessary.
@repo/self:lint:biome:   
@repo/self:lint:biome: 
@repo/self:lint:biome: lint_results_utf8.json:1:2 parse ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/self:lint:biome: 
@repo/self:lint:biome:   × String values must be double quoted.
@repo/self:lint:biome:   
@repo/self:lint:biome:   > 1 │ �node.exe : npm warn Unknown project config·
@repo/self:lint:biome:       │  ^^^^
@repo/self:lint:biome:     2 │ "public-hoist-pattern". This will stop working in the·
@repo/self:lint:biome:     3 │ next major version of npm.
@repo/self:lint:biome:   
@repo/self:lint:biome: 
@repo/self:lint:biome: lint_results_utf8.json:1:6 parse ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/self:lint:biome: 
@repo/self:lint:biome:   × unexpected character `.`
@repo/self:lint:biome:   
@repo/self:lint:biome:   > 1 │ �node.exe : npm warn Unknown project config·
@repo/self:lint:biome:       │      ^
@repo/self:lint:biome:     2 │ "public-hoist-pattern". This will stop working in the·
@repo/self:lint:biome:     3 │ next major version of npm.
@repo/self:lint:biome:   
@repo/self:lint:biome: 
@repo/self:lint:biome: lint_results_utf8.json:1:7 parse ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/self:lint:biome: 
@repo/self:lint:biome:   × String values must be double quoted.
@repo/self:lint:biome:   
@repo/self:lint:biome:   > 1 │ �node.exe : npm warn Unknown project config·
@repo/self:lint:biome:       │       ^^^
@repo/self:lint:biome:     2 │ "public-hoist-pattern". This will stop working in the·
@repo/self:lint:biome:     3 │ next major version of npm.
@repo/self:lint:biome:   
@repo/self:lint:biome: 
@repo/self:lint:biome: lint_results_utf8.json:1:11 parse ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/self:lint:biome: 
@repo/self:lint:biome:   × End of file expected
@repo/self:lint:biome:   
@repo/self:lint:biome:   > 1 │ �node.exe : npm warn Unknown project config·
@repo/self:lint:biome:       │           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
@repo/self:lint:biome:     2 │ "public-hoist-pattern". This will stop working in the·
@repo/self:lint:biome:     3 │ next major version of npm.
@repo/self:lint:biome:   
@repo/self:lint:biome:   i Use an array for a sequence of values: `[1, 2]`
@repo/self:lint:biome:   
@repo/self:lint:biome: 
@repo/self:lint:biome: lint_results_utf8.json:2:1 parse ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/self:lint:biome: 
@repo/self:lint:biome:   × End of file expected
@repo/self:lint:biome:   
@repo/self:lint:biome:     1 │ �node.exe : npm warn Unknown project config·
@repo/self:lint:biome:   > 2 │ "public-hoist-pattern". This will stop working in the·
@repo/self:lint:biome:       │ ^^^^^^^^^^^^^^^^^^^^^^
@repo/self:lint:biome:     3 │ next major version of npm.
@repo/self:lint:biome:     4 │ At line:1 char:1
@repo/self:lint:biome:   
@repo/self:lint:biome:   i Use an array for a sequence of values: `[1, 2]`
@repo/self:lint:biome:   
@repo/self:lint:biome: 
@repo/self:lint:biome: lint_results_utf8.json:2:23 parse ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/self:lint:biome: 
@repo/self:lint:biome:   × unexpected character `.`
@repo/self:lint:biome:   
@repo/self:lint:biome:     1 │ �node.exe : npm warn Unknown project config·
@repo/self:lint:biome:   > 2 │ "public-hoist-pattern". This will stop working in the·
@repo/self:lint:biome:       │                       ^
@repo/self:lint:biome:     3 │ next major version of npm.
@repo/self:lint:biome:     4 │ At line:1 char:1
@repo/self:lint:biome:   
@repo/self:lint:biome: 
@repo/self:lint:biome: lint_results_utf8.json:2:25 parse ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/self:lint:biome: 
@repo/self:lint:biome:   × String values must be double quoted.
@repo/self:lint:biome:   
@repo/self:lint:biome:     1 │ �node.exe : npm warn Unknown project config·
@repo/self:lint:biome:   > 2 │ "public-hoist-pattern". This will stop working in the·
@repo/self:lint:biome:       │                         ^^^^
@repo/self:lint:biome:     3 │ next major version of npm.
@repo/self:lint:biome:     4 │ At line:1 char:1
@repo/self:lint:biome:   
@repo/self:lint:biome: 
@repo/self:lint:biome: lint_results_utf8.json:2:30 parse ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/self:lint:biome: 
@repo/self:lint:biome:   × String values must be double quoted.
@repo/self:lint:biome:   
@repo/self:lint:biome:     1 │ �node.exe : npm warn Unknown project config·
@repo/self:lint:biome:   > 2 │ "public-hoist-pattern". This will stop working in the·
@repo/self:lint:biome:       │                              ^^^^
@repo/self:lint:biome:     3 │ next major version of npm.
@repo/self:lint:biome:     4 │ At line:1 char:1
@repo/self:lint:biome:   
@repo/self:lint:biome: 
@repo/self:lint:biome: lint_results_utf8.json:2:35 parse ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/self:lint:biome: 
@repo/self:lint:biome:   × String values must be double quoted.
@repo/self:lint:biome:   
@repo/self:lint:biome:     1 │ �node.exe : npm warn Unknown project config·
@repo/self:lint:biome:   > 2 │ "public-hoist-pattern". This will stop working in the·
@repo/self:lint:biome:       │                                   ^^^^
@repo/self:lint:biome:     3 │ next major version of npm.
@repo/self:lint:biome:     4 │ At line:1 char:1
@repo/self:lint:biome:   
@repo/self:lint:biome: 
@repo/self:lint:biome: lint_results_utf8.json:2:40 parse ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/self:lint:biome: 
@repo/self:lint:biome:   × String values must be double quoted.
@repo/self:lint:biome:   
@repo/self:lint:biome:     1 │ �node.exe : npm warn Unknown project config·
@repo/self:lint:biome:   > 2 │ "public-hoist-pattern". This will stop working in the·
@repo/self:lint:biome:       │                                        ^^^^^^^
@repo/self:lint:biome:     3 │ next major version of npm.
@repo/self:lint:biome:     4 │ At line:1 char:1
@repo/self:lint:biome:   
@repo/self:lint:biome: 
@repo/self:lint:biome: lint_results_utf8.json:2:48 parse ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/self:lint:biome: 
@repo/self:lint:biome:   × String values must be double quoted.
@repo/self:lint:biome:   
@repo/self:lint:biome:     1 │ �node.exe : npm warn Unknown project config·
@repo/self:lint:biome:   > 2 │ "public-hoist-pattern". This will stop working in the·
@repo/self:lint:biome:       │                                                ^^
@repo/self:lint:biome:     3 │ next major version of npm.
@repo/self:lint:biome:     4 │ At line:1 char:1
@repo/self:lint:biome:   
@repo/self:lint:biome: 
@repo/self:lint:biome: lint_results_utf8.json:2:51 parse ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/self:lint:biome: 
@repo/self:lint:biome:   × String values must be double quoted.
@repo/self:lint:biome:   
@repo/self:lint:biome:     1 │ �node.exe : npm warn Unknown project config·
@repo/self:lint:biome:   > 2 │ "public-hoist-pattern". This will stop working in the·
@repo/self:lint:biome:       │                                                   ^^^
@repo/self:lint:biome:     3 │ next major version of npm.
@repo/self:lint:biome:     4 │ At line:1 char:1
@repo/self:lint:biome:   
@repo/self:lint:biome: 
@repo/self:lint:biome: lint_results_utf8.json:3:1 parse ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/self:lint:biome: 
@repo/self:lint:biome:   × String values must be double quoted.
@repo/self:lint:biome:   
@repo/self:lint:biome:     1 │ �node.exe : npm warn Unknown project config·
@repo/self:lint:biome:     2 │ "public-hoist-pattern". This will stop working in the·
@repo/self:lint:biome:   > 3 │ next major version of npm.
@repo/self:lint:biome:       │ ^^^^
@repo/self:lint:biome:     4 │ At line:1 char:1
@repo/self:lint:biome:     5 │ + & "C:\Program Files\nodejs/node.exe" "C:\Program·
@repo/self:lint:biome:   
@repo/self:lint:biome: 
@repo/self:lint:biome: lint_results_utf8.json:3:6 parse ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/self:lint:biome: 
@repo/self:lint:biome:   × String values must be double quoted.
@repo/self:lint:biome:   
@repo/self:lint:biome:     1 │ �node.exe : npm warn Unknown project config·
@repo/self:lint:biome:     2 │ "public-hoist-pattern". This will stop working in the·
@repo/self:lint:biome:   > 3 │ next major version of npm.
@repo/self:lint:biome:       │      ^^^^^
@repo/self:lint:biome:     4 │ At line:1 char:1
@repo/self:lint:biome:     5 │ + & "C:\Program Files\nodejs/node.exe" "C:\Program·
@repo/self:lint:biome:   
@repo/self:lint:biome: 
@repo/self:lint:biome: lint_results_utf8.json:3:12 parse ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/self:lint:biome: 
@repo/self:lint:biome:   × String values must be double quoted.
@repo/self:lint:biome:   
@repo/self:lint:biome:     1 │ �node.exe : npm warn Unknown project config·
@repo/self:lint:biome:     2 │ "public-hoist-pattern". This will stop working in the·
@repo/self:lint:biome:   > 3 │ next major version of npm.
@repo/self:lint:biome:       │            ^^^^^^^
@repo/self:lint:biome:     4 │ At line:1 char:1
@repo/self:lint:biome:     5 │ + & "C:\Program Files\nodejs/node.exe" "C:\Program·
@repo/self:lint:biome:   
@repo/self:lint:biome: 
@repo/self:lint:biome: lint_results_utf8.json:3:20 parse ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/self:lint:biome: 
@repo/self:lint:biome:   × String values must be double quoted.
@repo/self:lint:biome:   
@repo/self:lint:biome:     1 │ �node.exe : npm warn Unknown project config·
@repo/self:lint:biome:     2 │ "public-hoist-pattern". This will stop working in the·
@repo/self:lint:biome:   > 3 │ next major version of npm.
@repo/self:lint:biome:       │                    ^^
@repo/self:lint:biome:     4 │ At line:1 char:1
@repo/self:lint:biome:     5 │ + & "C:\Program Files\nodejs/node.exe" "C:\Program·
@repo/self:lint:biome:   
@repo/self:lint:biome: 
@repo/self:lint:biome: lint_results_utf8.json:3:23 parse ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/self:lint:biome: 
@repo/self:lint:biome:   × String values must be double quoted.
@repo/self:lint:biome:   
@repo/self:lint:biome:     1 │ �node.exe : npm warn Unknown project config·
@repo/self:lint:biome:     2 │ "public-hoist-pattern". This will stop working in the·
@repo/self:lint:biome:   > 3 │ next major version of npm.
@repo/self:lint:biome:       │                       ^^^
@repo/self:lint:biome:     4 │ At line:1 char:1
@repo/self:lint:biome:     5 │ + & "C:\Program Files\nodejs/node.exe" "C:\Program·
@repo/self:lint:biome:   
@repo/self:lint:biome: 
@repo/self:lint:biome: lint_results_utf8.json:3:26 parse ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/self:lint:biome: 
@repo/self:lint:biome:   × unexpected character `.`
@repo/self:lint:biome:   
@repo/self:lint:biome:     1 │ �node.exe : npm warn Unknown project config·
@repo/self:lint:biome:     2 │ "public-hoist-pattern". This will stop working in the·
@repo/self:lint:biome:   > 3 │ next major version of npm.
@repo/self:lint:biome:       │                          ^
@repo/self:lint:biome:     4 │ At line:1 char:1
@repo/self:lint:biome:     5 │ + & "C:\Program Files\nodejs/node.exe" "C:\Program·
@repo/self:lint:biome:   
@repo/self:lint:biome: 
@repo/self:lint:biome: lint_results_utf8.json:4:1 parse ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/self:lint:biome: 
@repo/self:lint:biome:   × String values must be double quoted.
@repo/self:lint:biome:   
@repo/self:lint:biome:     2 │ "public-hoist-pattern". This will stop working in the·
@repo/self:lint:biome:     3 │ next major version of npm.
@repo/self:lint:biome:   > 4 │ At line:1 char:1
@repo/self:lint:biome:       │ ^^
@repo/self:lint:biome:     5 │ + & "C:\Program Files\nodejs/node.exe" "C:\Program·
@repo/self:lint:biome:     6 │ Files\nodejs/node_mo ...
@repo/self:lint:biome:   
@repo/self:lint:biome: 
@repo/self:lint:biome: check ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/self:lint:biome: 
@repo/self:lint:biome:   × Some errors were emitted while running checks.
@repo/self:lint:biome:   
@repo/self:lint:biome: 
@intuitui-labs/lk-edu-geo:lint:biome:     25 │       const matchedCities = cities
@intuitui-labs/lk-edu-geo:lint:biome:   > 26 │         .filter((c: any) => c.district_id === d.id)
@intuitui-labs/lk-edu-geo:lint:biome:        │                     ^^^
@intuitui-labs/lk-edu-geo:lint:biome:     27 │         .map((c: any) => {
@repo/core:lint:biome:      60     │ - ····"./native":·{␍
@repo/core:lint:biome:      61     │ - ······"types":·"./src/native/index.ts",␍
@repo/core:lint:biome:      62     │ - ······"import":·"./src/native/index.ts"␍
@repo/core:lint:biome:      63     │ - ····},␍
@repo/core:lint:biome:      64     │ - ····"./hooks":·{␍
@repo/core:lint:biome:      65     │ - ······"types":·"./src/hooks/index.ts",␍

@repo/core:lint:biome:      66     │ - ······"import":·"./src/hooks/index.ts"␍
@repo/core:lint:biome:      67     │ - ····},␍
@repo/core:lint:biome:      68     │ - ····"./hooks/*":·{␍
@repo/core:lint:biome:      69     │ - ······"types":·"./src/hooks/*.ts",␍
@repo/core:lint:biome:      70     │ - ······"import":·"./src/hooks/*.ts"␍
@intuitui-labs/lk-edu-geo:lint:biome:     28 │           const postalMatch = postalCities.find(
@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome: 
@intuitui-labs/lk-edu-geo:lint:biome: scripts\extract-geo.ts:27:18 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@intuitui-labs/lk-edu-geo:lint:biome: 
@intuitui-labs/lk-edu-geo:lint:biome:   ! Unexpected any. Specify a different type.
@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome:     25 │       const matchedCities = cities
@intuitui-labs/lk-edu-geo:lint:biome:     26 │         .filter((c: any) => c.district_id === d.id)
@intuitui-labs/lk-edu-geo:lint:biome:   > 27 │         .map((c: any) => {
@intuitui-labs/lk-edu-geo:lint:biome:        │                  ^^^
@intuitui-labs/lk-edu-geo:lint:biome:     28 │           const postalMatch = postalCities.find(
@intuitui-labs/lk-edu-geo:lint:biome:     29 │             (pc: any) => pc.city.toLowerCase() === c.name_en.toLowerCase(),
@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome: 
@intuitui-labs/lk-edu-geo:lint:biome: scripts\extract-geo.ts:29:18 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@intuitui-labs/lk-edu-geo:lint:biome: 
@intuitui-labs/lk-edu-geo:lint:biome:   ! Unexpected any. Specify a different type.
@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome:     27 │         .map((c: any) => {
@intuitui-labs/lk-edu-geo:lint:biome:     28 │           const postalMatch = postalCities.find(
@repo/library:lint:biome: src\api\database.web.ts:134:41 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/library:lint:biome: 
@repo/library:lint:biome:   ! Unexpected any. Specify a different type.
@repo/library:lint:biome:   
@repo/library:lint:biome:     133 │   // Shim for compatibility with sync logic that uses SQLite methods
@repo/library:lint:biome:   > 134 │   async runAsync(query: string, params: any[]) {
@repo/library:lint:biome:         │                                         ^^^
@repo/library:lint:biome:     135 │     if (!this.db) await this.init();
@repo/library:lint:biome:     136 │     if (!this.db) return;
@repo/library:lint:biome:   
@repo/library:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@repo/library:lint:biome:   
@repo/library:lint:biome: 
@repo/library:lint:biome: src\api\database.web.ts:161:49 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/library:lint:biome: 
@repo/library:lint:biome:   ! Unexpected any. Specify a different type.
@repo/library:lint:biome:   
@repo/library:lint:biome:     159 │   },
@repo/library:lint:biome:     160 │ 
@repo/library:lint:biome:   > 161 │   async getFirstAsync<T>(query: string, params: any[]): Promise<T | null> {
@repo/library:lint:biome:         │                                                 ^^^
@repo/library:lint:biome:     162 │     if (!this.db) await this.init();
@repo/library:lint:biome:     163 │     if (!this.db) return null;
@repo/library:lint:biome:   
@repo/library:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@repo/library:lint:biome:   
@repo/library:lint:biome: 
@repo/core:lint:biome:      71     │ - ····},␍
@repo/library:lint:biome: src\api\library.ts:192:40 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/library:lint:biome: 
@repo/core:lint:biome:      72     │ - ····"./providers":·{␍
@intuitui-labs/lk-edu-geo:lint:biome:   > 29 │             (pc: any) => pc.city.toLowerCase() === c.name_en.toLowerCase(),
@intuitui-labs/lk-edu-geo:lint:biome:        │                  ^^^
@repo/library:lint:biome:   ! Unexpected any. Specify a different type.
@repo/core:lint:biome:      73     │ - ······"types":·"./src/providers/index.ts",␍
@intuitui-labs/lk-edu-geo:lint:biome:     30 │           );
@repo/library:lint:biome:   
@repo/library:lint:biome:     190 │       throw new APIError('Failed to fetch resources', error.code, error);
@repo/core:lint:biome:      74     │ - ······"import":·"./src/providers/index.ts"␍
@repo/core:lint:biome:      75     │ - ····},␍
@repo/core:lint:biome:      76     │ - ····"./store":·{␍
@repo/core:lint:biome:      77     │ - ······"types":·"./src/store/index.ts",␍
@repo/core:lint:biome:      78     │ - ······"import":·"./src/store/index.ts"␍
@repo/ui:lint:biome: report_final.json:1:2 parse ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/ui:lint:biome: 
@repo/ui:lint:biome:   × unexpected character `>`
@repo/ui:lint:biome:   
@repo/core:lint:biome:      79     │ - ····},␍
@repo/ui:lint:biome:   > 1 │ �> @repo/ui@1.0.0 lint:eslint C:\Users\Naween\projects\polymath-platform\packages\ui
@repo/ui:lint:biome:       │  ^
@repo/ui:lint:biome:     2 │ > eslint . "--format" "json"
@repo/ui:lint:biome:     3 │ 
@repo/ui:lint:biome:   
@repo/ui:lint:biome: 
@repo/ui:lint:biome: report_final.json:1:4 parse ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/ui:lint:biome: 
@repo/ui:lint:biome:   × unexpected character `@`
@repo/ui:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome:     31 │           return {
@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome: 
@repo/ui:lint:biome:   > 1 │ �> @repo/ui@1.0.0 lint:eslint C:\Users\Naween\projects\polymath-platform\packages\ui
@repo/ui:lint:biome:       │    ^
@repo/core:lint:biome:      80     │ - ····"./store/*":·{␍

@repo/ui:lint:biome:     2 │ > eslint . "--format" "json"
@repo/ui:lint:biome:     3 │ 
@repo/ui:lint:biome:   
@repo/ui:lint:biome: 
@repo/library:lint:biome:     191 │     }
@repo/library:lint:biome:   > 192 │     return (data || []).map((resource: any) => ({
@repo/core:lint:biome:      81     │ - ······"types":·"./src/store/*.ts",␍
@intuitui-labs/lk-edu-geo:lint:biome: scripts\extract-gn.ts:25:15 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@intuitui-labs/lk-edu-geo:lint:biome: 
@intuitui-labs/lk-edu-geo:lint:biome:   ! Unexpected any. Specify a different type.
@intuitui-labs/lk-edu-geo:lint:biome:   
@repo/ui:lint:biome: report_final.json:1:5 parse ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/ui:lint:biome: 
@repo/ui:lint:biome:   × String values must be double quoted.
@repo/ui:lint:biome:   
@repo/library:lint:biome:         │                                        ^^^
@repo/library:lint:biome:     193 │       ...resource,
@repo/ui:lint:biome:   > 1 │ �> @repo/ui@1.0.0 lint:eslint C:\Users\Naween\projects\polymath-platform\packages\ui
@repo/ui:lint:biome:       │     ^^^^
@repo/ui:lint:biome:     2 │ > eslint . "--format" "json"
@repo/ui:lint:biome:     3 │ 
@repo/ui:lint:biome:   
@repo/ui:lint:biome: 
@repo/core:lint:biome:      82     │ - ······"import":·"./src/store/*.ts"␍
@repo/core:lint:biome:      83     │ - ····},␍
@repo/core:lint:biome:      84     │ - ····"./native/*":·{␍
@repo/core:lint:biome:      85     │ - ······"types":·"./src/native/*.ts",␍
@repo/library:lint:biome:     194 │       creator_name: resource.creator?.full_name || resource.creator_name || 'System',
@repo/library:lint:biome:   

@repo/ui:lint:biome: report_final.json:1:9 parse ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/ui:lint:biome: 
@repo/ui:lint:biome:   × unexpected character `/`
@repo/ui:lint:biome:   
@repo/core:lint:biome:      86     │ - ······"import":·"./src/native/*.ts"␍
@repo/core:lint:biome:      87     │ - ····},␍
@intuitui-labs/lk-edu-geo:lint:biome:     23 │   const workbook = XLSX.readFile(FILE_PATH);
@intuitui-labs/lk-edu-geo:lint:biome:     24 │   const sheet = workbook.Sheets.lka_admin4;

@repo/ui:lint:biome:   > 1 │ �> @repo/ui@1.0.0 lint:eslint C:\Users\Naween\projects\polymath-platform\packages\ui

@repo/ui:lint:biome:       │         ^

@repo/ui:lint:biome:     2 │ > eslint . "--format" "json"

@repo/ui:lint:biome:     3 │ 
@repo/ui:lint:biome:   
@repo/ui:lint:biome: 

@repo/core:lint:biome:      88     │ - ····"./sync/*":·{␍

@intuitui-labs/lk-edu-geo:lint:biome:   > 25 │   const data: any[] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

@repo/ui:lint:biome: report_final.json:1:10 parse ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@repo/ui:lint:biome: 

@repo/ui:lint:biome:   × String values must be double quoted.
@repo/ui:lint:biome:   

@repo/core:lint:biome:      89     │ - ······"types":·"./src/lib/sync/*.ts",␍

@repo/core:lint:biome:      90     │ - ······"import":·"./src/lib/sync/*.ts"␍

@repo/core:lint:biome:      91     │ - ····},␍

@repo/core:lint:biome:      92     │ - ····"./lib/*":·{␍

@repo/core:lint:biome:      93     │ - ······"types":·"./src/lib/*.ts",␍

@intuitui-labs/lk-edu-geo:lint:biome:        │               ^^^

@repo/library:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@repo/library:lint:biome:   
@repo/library:lint:biome: 

@intuitui-labs/lk-edu-geo:lint:biome:     26 │ 

@intuitui-labs/lk-edu-geo:lint:biome:     27 │   const headers = data[0];
@intuitui-labs/lk-edu-geo:lint:biome:   

@intuitui-labs/lk-edu-geo:lint:biome:   i any disables many type checking rules. Its use should be avoided.

@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome: 

@intuitui-labs/lk-edu-geo:lint:biome: scripts\generate-sql-seeds.ts:23:14 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@intuitui-labs/lk-edu-geo:lint:biome: 

@repo/self:lint:biome:  ELIFECYCLE  Command failed with exit code 1.

@repo/core:lint:biome:      94     │ - ······"import":·"./src/lib/*.ts"␍
@intuitui-labs/lk-edu-geo:lint:biome:   ! Unexpected any. Specify a different type.
@intuitui-labs/lk-edu-geo:lint:biome:   

@repo/core:lint:biome:      95     │ - ····},␍
@repo/core:lint:biome:      96     │ - ····"./adapters/*":·{␍

@repo/core:lint:biome:      97     │ - ······"types":·"./src/adapters/*.ts",␍
@repo/core:lint:biome:      98     │ - ······"import":·"./src/adapters/*.ts"␍
@repo/core:lint:biome:      99     │ - ····},␍
@repo/core:lint:biome:     100     │ - ····"./types":·{␍
@repo/core:lint:biome:     101     │ - ······"types":·"./src/types/index.ts",␍
@repo/core:lint:biome:     102     │ - ······"import":·"./src/types/index.ts"␍
@repo/core:lint:biome:     103     │ - ····},␍
@repo/core:lint:biome:     104     │ - ····"./types/*":·{␍

@repo/ui:lint:biome:   > 1 │ �> @repo/ui@1.0.0 lint:eslint C:\Users\Naween\projects\polymath-platform\packages\ui
@repo/ui:lint:biome:       │          ^^
@repo/ui:lint:biome:     2 │ > eslint . "--format" "json"
@repo/ui:lint:biome:     3 │ 
@repo/ui:lint:biome:   
@repo/ui:lint:biome: 
@repo/ui:lint:biome: report_final.json:1:12 parse ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/ui:lint:biome: 
@repo/ui:lint:biome:   × unexpected character `@`
@repo/ui:lint:biome:   
@repo/ui:lint:biome:   > 1 │ �> @repo/ui@1.0.0 lint:eslint C:\Users\Naween\projects\polymath-platform\packages\ui
@repo/ui:lint:biome:       │            ^
@repo/ui:lint:biome:     2 │ > eslint . "--format" "json"
@repo/ui:lint:biome:     3 │ 
@repo/ui:lint:biome:   
@repo/ui:lint:biome: 

@repo/library:lint:biome: src\api\library.ts:204:71 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/library:lint:biome: 
@repo/library:lint:biome:   ! Unexpected any. Specify a different type.
@repo/library:lint:biome:   
@repo/library:lint:biome:     202 │    * @authority read Library
@repo/library:lint:biome:     203 │    */
@repo/library:lint:biome:   > 204 │   async searchMapUniverse(query: string, limit: number = 10): Promise<any[]> {
@repo/library:lint:biome:         │                                                                       ^^^
@repo/library:lint:biome:     205 │     const { data, error } = await supabase.rpc('search_map_universe', {
@repo/library:lint:biome:     206 │       query_text: query,
@repo/library:lint:biome:   
@repo/library:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@repo/library:lint:biome:   
@repo/library:lint:biome: 
@repo/library:lint:biome: src\api\library.ts:233:50 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/library:lint:biome: 
@repo/library:lint:biome:   ! Unexpected any. Specify a different type.
@repo/library:lint:biome:   
@repo/library:lint:biome:     231 │       if (error) throw error;
@repo/library:lint:biome:     232 │       // Sort results by the order returned from SQLite
@repo/library:lint:biome:   > 233 │       const idMap = new Map((data || []).map((r: any) => [r.id, r]));
@repo/library:lint:biome:         │                                                  ^^^
@repo/library:lint:biome:     234 │       return ids
@repo/library:lint:biome:     235 │         .map((id) => idMap.get(id))

@repo/library:lint:biome:   
@repo/library:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@repo/library:lint:biome:   
@repo/library:lint:biome: 
@repo/library:lint:biome: src\api\library.ts:270:40 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/library:lint:biome: 
@repo/library:lint:biome:   ! Unexpected any. Specify a different type.
@repo/library:lint:biome:   
@repo/library:lint:biome:     268 │       throw new APIError('Failed to search knowledge universe', error.code, error);
@repo/library:lint:biome:     269 │     }
@repo/library:lint:biome:   > 270 │     return (data || []).map((resource: any) => ({
@repo/library:lint:biome:         │                                        ^^^
@repo/library:lint:biome:     271 │       ...resource,
@repo/library:lint:biome:     272 │       creator_name: resource.creator_name || 'System',
@repo/library:lint:biome:   
@repo/library:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@repo/library:lint:biome:   
@repo/library:lint:biome: 
@repo/library:lint:biome: src\api\library.ts:304:48 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/library:lint:biome: 
@repo/library:lint:biome:   ! Unexpected any. Specify a different type.
@repo/library:lint:biome:   
@repo/library:lint:biome:     302 │         .in('engagement_type', ['endorse', 'bookmark']);
@repo/library:lint:biome:     303 │       if (engagementData) {
@repo/library:lint:biome:   > 304 │         has_endorsed = engagementData.some((e: any) => e.engagement_type === 'endorse');
@repo/library:lint:biome:         │                                                ^^^
@repo/library:lint:biome:     305 │         has_bookmarked = engagementData.some((e: any) => e.engagement_type === 'bookmark');
@repo/library:lint:biome:     306 │       }
@repo/library:lint:biome:   
@repo/library:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@repo/library:lint:biome:   
@repo/library:lint:biome: 
@repo/library:lint:biome: src\api\library.ts:305:50 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/library:lint:biome: 
@repo/library:lint:biome:   ! Unexpected any. Specify a different type.
@repo/library:lint:biome:   
@repo/library:lint:biome:     303 │       if (engagementData) {
@repo/library:lint:biome:     304 │         has_endorsed = engagementData.some((e: any) => e.engagement_type === 'endorse');
@repo/library:lint:biome:   > 305 │         has_bookmarked = engagementData.some((e: any) => e.engagement_type === 'bookmark');
@repo/library:lint:biome:         │                                                  ^^^
@repo/library:lint:biome:     306 │       }
@repo/library:lint:biome:     307 │     }
@repo/library:lint:biome:   
@repo/library:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@repo/core:lint:biome:     105     │ - ······"types":·"./src/types/*.ts",␍
@repo/library:lint:biome:   
@repo/core:lint:biome:     106     │ - ······"import":·"./src/types/*.ts"␍
@repo/library:lint:biome: 
@repo/core:lint:biome:     107     │ - ····},␍
@repo/library:lint:biome: src\api\library.ts:612:19 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/core:lint:biome:     108     │ - ····"./auth":·{␍
@repo/library:lint:biome: 
@repo/core:lint:biome:     109     │ - ······"types":·"./src/api/auth.ts",␍
@repo/library:lint:biome:   ! Unexpected any. Specify a different type.
@repo/core:lint:biome:     110     │ - ······"import":·"./src/api/auth.ts"␍
@repo/library:lint:biome:   
@repo/core:lint:biome:     111     │ - ····},␍
@repo/library:lint:biome:     610 │     }
@repo/core:lint:biome:     112     │ - ····"./identity":·{␍
@repo/library:lint:biome:     611 │     return (data || [])
@repo/core:lint:biome:     113     │ - ······"types":·"./src/api/identity.ts",␍
@repo/library:lint:biome:   > 612 │       .map((item: any) => {
@repo/core:lint:biome:     114     │ - ······"import":·"./src/api/identity.ts"␍
@repo/library:lint:biome:         │                   ^^^
@repo/core:lint:biome:     115     │ - ····},␍
@repo/library:lint:biome:     613 │         const resource = Array.isArray(item.resource) ? item.resource[0] : item.resource;
@repo/core:lint:biome:     116     │ - ····"./storage":·{␍
@repo/library:lint:biome:     614 │         if (!resource) return null;
@repo/core:lint:biome:     117     │ - ······"types":·"./src/native/storage.ts",␍
@repo/library:lint:biome:   
@repo/core:lint:biome:     118     │ - ······"import":·"./src/native/storage.ts"␍
@repo/library:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@repo/core:lint:biome:     119     │ - ····},␍
@repo/library:lint:biome:   
@repo/core:lint:biome:     120     │ - ····"./supabase":·{␍
@repo/library:lint:biome: 
@repo/core:lint:biome:     121     │ - ······"types":·"./src/api/supabase.ts",␍
@repo/library:lint:biome: src\api\library.ts:621:19 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/core:lint:biome:     122     │ - ······"import":·"./src/api/supabase.ts"␍
@repo/library:lint:biome: 
@repo/core:lint:biome:     123     │ - ····},␍
@repo/library:lint:biome:   ! Unexpected any. Specify a different type.
@repo/core:lint:biome:     124     │ - ····"./monitoring":·{␍
@repo/library:lint:biome:   
@repo/core:lint:biome:     125     │ - ······"types":·"./src/lib/monitoring/index.ts",␍
@repo/library:lint:biome:     619 │         } as LibraryResource;
@repo/core:lint:biome:     126     │ - ······"import":·"./src/lib/monitoring/index.ts"␍
@repo/library:lint:biome:     620 │       })
@repo/core:lint:biome:     127     │ - ····},␍
@repo/library:lint:biome:   > 621 │       .filter((r: any): r is LibraryResource => r !== null);
@repo/core:lint:biome:     128     │ - ····"./sync":·{␍
@repo/library:lint:biome:         │                   ^^^
@repo/core:lint:biome:     129     │ - ······"types":·"./src/lib/sync/index.ts",␍
@repo/library:lint:biome:     622 │   },
@repo/core:lint:biome:     130     │ - ······"import":·"./src/lib/sync/index.ts"␍
@repo/library:lint:biome:     623 │   // ========================================================================
@repo/core:lint:biome:     131     │ - ····},␍
@repo/library:lint:biome:   
@repo/core:lint:biome:     132     │ - ····"./powersync":·{␍
@repo/library:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@repo/core:lint:biome:     133     │ - ······"types":·"./src/adapters/powersync/index.ts",␍
@repo/library:lint:biome:   
@repo/core:lint:biome:     134     │ - ······"import":·"./src/adapters/powersync/index.ts"␍
@repo/library:lint:biome: 
@repo/core:lint:biome:     135     │ - ····},␍
@repo/library:lint:biome: src\api\library.ts:677:44 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/core:lint:biome:     136     │ - ····"./utils":·{␍
@repo/library:lint:biome: 
@repo/core:lint:biome:     137     │ - ······"types":·"./src/logic/utils/index.ts",␍
@repo/library:lint:biome:   ! Unexpected any. Specify a different type.
@repo/core:lint:biome:     138     │ - ······"import":·"./src/logic/utils/index.ts"␍
@repo/library:lint:biome:   
@repo/core:lint:biome:     139     │ - ····},␍
@repo/library:lint:biome:     675 │     // Map explicit collections with their resources
@repo/core:lint:biome:     140     │ - ····"./constants":·{␍
@repo/library:lint:biome:     676 │     const explicitCollections = await Promise.all(
@repo/core:lint:biome:     141     │ - ······"types":·"./src/constants/index.ts",␍
@repo/library:lint:biome:   > 677 │       (explicitData || []).map(async (col: any) => {
@repo/core:lint:biome:     142     │ - ······"import":·"./src/constants/index.ts"␍
@repo/library:lint:biome:         │                                            ^^^
@repo/core:lint:biome:     143     │ - ····},␍
@repo/library:lint:biome:     678 │         let nodeIds = (col.collection_nodes || []).map((cn: any) => cn.node_id);
@repo/core:lint:biome:     144     │ - ····"./constants/*":·{␍
@repo/library:lint:biome:     679 │         if (asOf) {
@repo/core:lint:biome:     145     │ - ······"types":·"./src/constants/*.ts",␍
@repo/library:lint:biome:   
@repo/core:lint:biome:     146     │ - ······"import":·"./src/constants/*.ts"␍
@repo/library:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@repo/core:lint:biome:     147     │ - ····},␍
@repo/library:lint:biome:   
@repo/core:lint:biome:     148     │ - ····"./grading":·{␍
@repo/library:lint:biome: 
@repo/core:lint:biome:     149     │ - ······"types":·"./src/logic/grading/index.ts",␍
@repo/library:lint:biome: src\api\library.ts:678:61 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/core:lint:biome:     150     │ - ······"import":·"./src/logic/grading/index.ts"␍
@repo/library:lint:biome: 
@repo/core:lint:biome:   413 more lines truncated
@repo/library:lint:biome:   ! Unexpected any. Specify a different type.
@repo/core:lint:biome:   
@repo/library:lint:biome:   
@repo/core:lint:biome: 
@repo/library:lint:biome:     676 │     const explicitCollections = await Promise.all(
@repo/core:lint:biome: scratch\analyze_lint.js format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/library:lint:biome:     677 │       (explicitData || []).map(async (col: any) => {
@repo/core:lint:biome: 
@repo/library:lint:biome:   > 678 │         let nodeIds = (col.collection_nodes || []).map((cn: any) => cn.node_id);
@repo/core:lint:biome:   × Formatter would have printed the following content:
@repo/library:lint:biome:         │                                                             ^^^
@repo/core:lint:biome:   
@repo/library:lint:biome:     679 │         if (asOf) {
@repo/core:lint:biome:      1    │ - /*·eslint-disable·*/␍
@repo/library:lint:biome:     680 │           const { data: membershipData, error: membershipError } = await supabase.rpc(
@repo/core:lint:biome:      2    │ - import·fs·from·'node:fs';␍
@repo/library:lint:biome:   
@repo/core:lint:biome:      3    │ - ␍
@repo/library:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@repo/core:lint:biome:      4    │ - const·reportPath·=·'eslint_report_honest_final.json';␍
@repo/library:lint:biome:   
@repo/core:lint:biome:      5    │ - const·report·=·JSON.parse(fs.readFileSync(reportPath,·'utf8'));␍
@repo/library:lint:biome: 
@repo/core:lint:biome:      6    │ - ␍
@repo/library:lint:biome: src\api\library.ts:694:56 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/core:lint:biome:      7    │ - const·hydrationIssues·=·report.filter((file)·=>␍
@repo/library:lint:biome: 
@repo/core:lint:biome:      8    │ - ··file.messages.some(␍
@repo/library:lint:biome:   ! Unexpected any. Specify a different type.
@repo/core:lint:biome:      9    │ - ····(msg)·=>·msg.message.includes('hydration')·||·msg.message.includes('non-deterministic'),␍
@repo/library:lint:biome:   
@repo/core:lint:biome:     10    │ - ··),␍
@repo/library:lint:biome:     692 │             );
@repo/core:lint:biome:     11    │ - );␍
@repo/library:lint:biome:     693 │           }
@repo/core:lint:biome:     12    │ - ␍
@repo/core:lint:biome:     13    │ - const·anyUsage·=·report.filter((file)·=>␍
@repo/core:lint:biome:     14    │ - ··file.messages.some((msg)·=>·msg.ruleId·===·'@typescript-eslint/no-explicit-any'),␍
@repo/core:lint:biome:     15    │ - );␍
@repo/core:lint:biome:     16    │ - ␍
@repo/core:lint:biome:     17    │ - console.log(`Total·files·with·hydration·issues:·${hydrationIssues.length}`);␍
@repo/core:lint:biome:     18    │ - console.log(`Total·files·with·'any'·usage:·${anyUsage.length}`);␍
@repo/core:lint:biome:     19    │ - ␍
@repo/core:lint:biome:     20    │ - const·targetFiles·=·[␍
@repo/core:lint:biome:     21    │ - ··'presence.ts',␍
@repo/core:lint:biome:     22    │ - ··'resilience.ts',␍
@repo/core:lint:biome:     23    │ - ··'comment.hooks.ts',␍
@repo/core:lint:biome:     24    │ - ··'notification.hooks.ts',␍
@repo/core:lint:biome:     25    │ - ··'assignmentRepository.ts',␍
@repo/core:lint:biome:     26    │ - ];␍
@repo/core:lint:biome:     27    │ - ␍
@repo/core:lint:biome:     28    │ - targetFiles.forEach((target)·=>·{␍
@repo/core:lint:biome:     29    │ - ··const·fileReport·=·report.find((f)·=>·f.filePath.endsWith(target));␍
@repo/core:lint:biome:     30    │ - ··if·(fileReport)·{␍
@repo/core:lint:biome:     31    │ - ····console.log(`\n---·Status·for·${target}·---`);␍
@repo/core:lint:biome:     32    │ - ····fileReport.messages.forEach((msg)·=>·{␍
@repo/core:lint:biome:     33    │ - ······console.log(`··Line·${msg.line}:·[${msg.ruleId}]·${msg.message}`);␍
@repo/core:lint:biome:     34    │ - ····});␍
@repo/core:lint:biome:     35    │ - ····if·(fileReport.messages.length·===·0)·console.log('··Clean!');␍
@repo/core:lint:biome:     36    │ - ··}·else·{␍
@repo/core:lint:biome:     37    │ - ····console.log(`\n---·${target}·not·found·in·report·(might·be·clean·or·excluded)·---`);␍
@repo/core:lint:biome:     38    │ - ··}␍
@repo/core:lint:biome:     39    │ - });␍
@repo/core:lint:biome:         1 │ + /*·eslint-disable·*/
@repo/core:lint:biome:         2 │ + import·fs·from·'node:fs';
@repo/core:lint:biome:         3 │ + 
@repo/core:lint:biome:         4 │ + const·reportPath·=·'eslint_report_honest_final.json';
@repo/core:lint:biome:         5 │ + const·report·=·JSON.parse(fs.readFileSync(reportPath,·'utf8'));
@repo/core:lint:biome:         6 │ + 
@repo/core:lint:biome:         7 │ + const·hydrationIssues·=·report.filter((file)·=>
@repo/library:lint:biome:   > 694 │           nodeIds = (membershipData || []).map((entry: any) => entry.node_id);
@repo/core:lint:biome:         8 │ + ··file.messages.some(
@repo/library:lint:biome:         │                                                        ^^^
@repo/core:lint:biome:         9 │ + ····(msg)·=>·msg.message.includes('hydration')·||·msg.message.includes('non-deterministic'),
@repo/library:lint:biome:     695 │         }
@repo/core:lint:biome:        10 │ + ··),
@repo/library:lint:biome:     696 │         if (nodeIds.length === 0 && col.resource_ids?.length > 0) {
@repo/core:lint:biome:        11 │ + );
@repo/library:lint:biome:   
@repo/core:lint:biome:        12 │ + 
@repo/library:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@repo/core:lint:biome:        13 │ + const·anyUsage·=·report.filter((file)·=>
@repo/library:lint:biome:   
@repo/core:lint:biome:        14 │ + ··file.messages.some((msg)·=>·msg.ruleId·===·'@typescript-eslint/no-explicit-any'),
@repo/library:lint:biome: 
@repo/library:lint:biome: src\components\CollectionPickerModal.tsx:49:32 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━
@repo/library:lint:biome: 
@repo/library:lint:biome:   ! Unexpected any. Specify a different type.
@repo/library:lint:biome:   
@repo/library:lint:biome:     47 │         <FlatList
@repo/library:lint:biome:     48 │           data={collections}
@repo/library:lint:biome:   > 49 │           keyExtractor={(item: any) => item.id}
@repo/library:lint:biome:        │                                ^^^
@repo/library:lint:biome:     50 │           renderItem={({ item }: { item: any }) => (
@repo/library:lint:biome:     51 │             <Pressable
@repo/library:lint:biome:   
@repo/library:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@repo/library:lint:biome:   
@repo/library:lint:biome: 
@repo/library:lint:biome: src\components\CollectionPickerModal.tsx:50:42 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━
@repo/core:lint:biome:        15 │ + );
@repo/library:lint:biome: 
@repo/core:lint:biome:        16 │ + 
@repo/library:lint:biome:   ! Unexpected any. Specify a different type.
@repo/core:lint:biome:        17 │ + console.log(`Total·files·with·hydration·issues:·${hydrationIssues.length}`);
@repo/library:lint:biome:   
@repo/core:lint:biome:        18 │ + console.log(`Total·files·with·'any'·usage:·${anyUsage.length}`);
@repo/library:lint:biome:     48 │           data={collections}
@repo/core:lint:biome:        19 │ + 
@repo/library:lint:biome:     49 │           keyExtractor={(item: any) => item.id}
@repo/core:lint:biome:        20 │ + const·targetFiles·=·[
@repo/library:lint:biome:   > 50 │           renderItem={({ item }: { item: any }) => (
@repo/core:lint:biome:        21 │ + ··'presence.ts',
@repo/library:lint:biome:        │                                          ^^^
@repo/core:lint:biome:        22 │ + ··'resilience.ts',
@repo/library:lint:biome:     51 │             <Pressable
@repo/core:lint:biome:        23 │ + ··'comment.hooks.ts',
@repo/library:lint:biome:     52 │               className="flex-row items-center p-5 border-b border-phase-border active:opacity-70"
@repo/core:lint:biome:        24 │ + ··'notification.hooks.ts',
@repo/library:lint:biome:   
@repo/core:lint:biome:        25 │ + ··'assignmentRepository.ts',
@repo/library:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@repo/core:lint:biome:        26 │ + ];
@repo/library:lint:biome:   
@repo/core:lint:biome:        27 │ + 
@repo/library:lint:biome: 
@repo/core:lint:biome:        28 │ + targetFiles.forEach((target)·=>·{
@repo/library:lint:biome: src\components\LibraryThumbnailCard.tsx:166:22 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━
@repo/core:lint:biome:        29 │ + ··const·fileReport·=·report.find((f)·=>·f.filePath.endsWith(target));
@repo/library:lint:biome: 
@repo/core:lint:biome:        30 │ + ··if·(fileReport)·{
@repo/library:lint:biome:   ! Unexpected any. Specify a different type.
@repo/core:lint:biome:        31 │ + ····console.log(`\n---·Status·for·${target}·---`);
@repo/library:lint:biome:   
@repo/core:lint:biome:        32 │ + ····fileReport.messages.forEach((msg)·=>·{
@repo/library:lint:biome:     164 │     const thumbnailUrl = resource
@repo/core:lint:biome:        33 │ + ······console.log(`··Line·${msg.line}:·[${msg.ruleId}]·${msg.message}`);
@repo/library:lint:biome:     165 │       ? resource.media?.url ||
@repo/core:lint:biome:        34 │ + ····});
@repo/library:lint:biome:   > 166 │         (resource as any).thumbnail_url ||
@repo/core:lint:biome:        35 │ + ····if·(fileReport.messages.length·===·0)·console.log('··Clean!');
@repo/library:lint:biome:         │                      ^^^
@repo/core:lint:biome:        36 │ + ··}·else·{
@repo/library:lint:biome:     167 │         (resource.type === 'video' || resource.type === 'movie_trailer'
@repo/core:lint:biome:        37 │ + ····console.log(`\n---·${target}·not·found·in·report·(might·be·clean·or·excluded)·---`);
@repo/library:lint:biome:     168 │           ? getYoutubeThumbnail(resource.url)
@repo/core:lint:biome:        38 │ + ··}
@repo/library:lint:biome:   
@repo/core:lint:biome:        39 │ + });
@repo/core:lint:biome:     40 40 │   
@repo/core:lint:biome:   
@repo/core:lint:biome: 
@repo/core:lint:biome: scratch\extract_errors.cjs format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/core:lint:biome: 
@repo/core:lint:biome:   × Formatter would have printed the following content:
@repo/core:lint:biome:   
@repo/core:lint:biome:      1    │ - const·fs·=·require('node:fs');␍
@repo/core:lint:biome:      2    │ - const·results·=·JSON.parse(␍
@repo/core:lint:biome:      3    │ - ··fs.readFileSync('eslint_output_fresh.json',·'utf8').replace(/^\uFEFF/,·''),␍
@repo/core:lint:biome:      4    │ - );␍
@repo/core:lint:biome:      5    │ - ␍
@repo/core:lint:biome:      6    │ - const·fileResult·=·results.find(␍
@repo/core:lint:biome:      7    │ - ··(r)·=>·r.filePath.endsWith('src\\api\\index.ts')·||·r.filePath.endsWith('src/api/index.ts'),␍
@repo/core:lint:biome:      8    │ - );␍
@repo/core:lint:biome:      9    │ - if·(fileResult)·{␍
@repo/core:lint:biome:     10    │ - ··console.log(␍
@repo/core:lint:biome:     11    │ - ····JSON.stringify(␍
@repo/core:lint:biome:     12    │ - ······fileResult.messages.filter((m)·=>·m.ruleId·===·'import-x/export'),␍
@repo/core:lint:biome:     13    │ - ······null,␍
@repo/core:lint:biome:     14    │ - ······2,␍
@repo/core:lint:biome:     15    │ - ····),␍
@repo/core:lint:biome:     16    │ - ··);␍
@repo/core:lint:biome:     17    │ - }·else·{␍
@repo/core:lint:biome:     18    │ - ··console.log('File·not·found');␍
@repo/core:lint:biome:     19    │ - }␍
@repo/library:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@repo/library:lint:biome:   
@repo/library:lint:biome: 
@repo/library:lint:biome: src\components\LibraryThumbnailCard.tsx:185:15 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━
@repo/library:lint:biome: 
@repo/library:lint:biome:   ! Unexpected any. Specify a different type.
@repo/library:lint:biome:   
@repo/library:lint:biome:     184 │     const handleBookmarkToggle = React.useCallback(
@repo/library:lint:biome:   > 185 │       (event: any) => {
@repo/library:lint:biome:         │               ^^^
@repo/library:lint:biome:     186 │         if (coreRuntime.device.getMetadata().platform === 'web') event.stopPropagation();
@repo/ui:lint:biome: report_final.json:1:13 parse ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/library:lint:biome:     187 │         if (resource && onBookmarkToggle) void onBookmarkToggle(resource);
@repo/ui:lint:biome: 
@repo/library:lint:biome:   
@repo/library:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@repo/library:lint:biome:   
@repo/library:lint:biome: 
@repo/library:lint:biome: src\api\database.web.ts:107:13 lint/suspicious/useIterableCallbackReturn ━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/library:lint:biome: 
@repo/library:lint:biome:   × This callback passed to forEach() iterable method should not return a value.
@repo/library:lint:biome:   
@repo/core:lint:biome:         1 │ + const·fs·=·require('node:fs');
@repo/library:lint:biome:     105 │       const store = transaction.objectStore(STORE_NAME);
@repo/core:lint:biome:         2 │ + const·results·=·JSON.parse(
@repo/library:lint:biome:     106 │ 
@repo/core:lint:biome:         3 │ + ··fs.readFileSync('eslint_output_fresh.json',·'utf8').replace(/^\uFEFF/,·''),
@repo/library:lint:biome:   > 107 │       nodes.forEach((node) => store.put(node));
@repo/core:lint:biome:         4 │ + );
@repo/core:lint:biome:         5 │ + 
@repo/core:lint:biome:         6 │ + const·fileResult·=·results.find(
@repo/core:lint:biome:         7 │ + ··(r)·=>·r.filePath.endsWith('src\\api\\index.ts')·||·r.filePath.endsWith('src/api/index.ts'),
@repo/core:lint:biome:         8 │ + );
@repo/core:lint:biome:         9 │ + if·(fileResult)·{
@repo/core:lint:biome:        10 │ + ··console.log(
@repo/core:lint:biome:        11 │ + ····JSON.stringify(
@repo/core:lint:biome:        12 │ + ······fileResult.messages.filter((m)·=>·m.ruleId·===·'import-x/export'),
@repo/core:lint:biome:        13 │ + ······null,
@repo/core:lint:biome:        14 │ + ······2,
@repo/core:lint:biome:        15 │ + ····),
@repo/core:lint:biome:        16 │ + ··);
@repo/core:lint:biome:        17 │ + }·else·{
@repo/core:lint:biome:        18 │ + ··console.log('File·not·found');
@repo/core:lint:biome:        19 │ + }
@repo/core:lint:biome:     20 20 │   
@repo/core:lint:biome:   
@repo/core:lint:biome: 
@repo/library:lint:biome:         │             ^^^^^^^
@repo/library:lint:biome:     108 │ 
@intuitui-labs/lk-edu-geo:lint:biome: The number of diagnostics exceeds the limit allowed. Use --max-diagnostics to increase it.
@intuitui-labs/lk-edu-geo:lint:biome: Diagnostics not shown: 1.
@intuitui-labs/lk-edu-geo:lint:biome: Checked 19 files in 2s. No fixes applied.
@intuitui-labs/lk-edu-geo:lint:biome: Found 4 errors.
@intuitui-labs/lk-edu-geo:lint:biome: Found 15 warnings.
@intuitui-labs/lk-edu-geo:lint:biome: Found 2 infos.
@intuitui-labs/lk-edu-geo:lint:biome:     21 │   geoSql += `-- Provinces\nINSERT INTO geo_provinces (id, name, name_si, name_ta) VALUES\n`;
@intuitui-labs/lk-edu-geo:lint:biome:     22 │   geoSql += `${provinces
@intuitui-labs/lk-edu-geo:lint:biome:   > 23 │     .map((p: any) => `('${p.id}', '${escape(p.name)}', '${p.name_si || ''}', '${p.name_ta || ''}')`)
@intuitui-labs/lk-edu-geo:lint:biome:        │              ^^^
@intuitui-labs/lk-edu-geo:lint:biome:     24 │     .join(',\n')}\nON CONFLICT (id) DO NOTHING;\n\n`;
@intuitui-labs/lk-edu-geo:lint:biome:     25 │ 
@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome: 
@intuitui-labs/lk-edu-geo:lint:biome: scripts\generate-sql-seeds.ts:30:11 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@intuitui-labs/lk-edu-geo:lint:biome: 
@intuitui-labs/lk-edu-geo:lint:biome:   ! Unexpected any. Specify a different type.
@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome:     28 │   geoSql += `${districts
@intuitui-labs/lk-edu-geo:lint:biome:     29 │     .map(
@intuitui-labs/lk-edu-geo:lint:biome:   > 30 │       (d: any) =>
@intuitui-labs/lk-edu-geo:lint:biome:        │           ^^^
@intuitui-labs/lk-edu-geo:lint:biome:     31 │         `('${d.id}', '${d.province_id}', '${escape(d.name)}', '${d.name_si || ''}', '${d.name_ta || ''}')`,
@intuitui-labs/lk-edu-geo:lint:biome:     32 │     )
@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome: 
@intuitui-labs/lk-edu-geo:lint:biome: scripts\generate-sql-seeds.ts:39:12 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@intuitui-labs/lk-edu-geo:lint:biome: 
@intuitui-labs/lk-edu-geo:lint:biome:   ! Unexpected any. Specify a different type.
@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome:     37 │   geoSql += `${dsDivisions
@intuitui-labs/lk-edu-geo:lint:biome:     38 │     .map(
@intuitui-labs/lk-edu-geo:lint:biome:   > 39 │       (ds: any) =>
@intuitui-labs/lk-edu-geo:lint:biome:        │            ^^^
@intuitui-labs/lk-edu-geo:lint:biome:     40 │         `('${ds.id}', '${ds.district_id}', '${escape(ds.name)}', '${ds.name_si || ''}', '${ds.name_ta || ''}')`,
@intuitui-labs/lk-edu-geo:lint:biome:     41 │     )
@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome: 
@intuitui-labs/lk-edu-geo:lint:biome: scripts\generate-sql-seeds.ts:54:17 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@intuitui-labs/lk-edu-geo:lint:biome: 
@intuitui-labs/lk-edu-geo:lint:biome:   ! Unexpected any. Specify a different type.
@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome:     52 │     gnSql += `INSERT INTO geo_gn_divisions (id, ds_division_id, district_id, name, name_si, name_ta, gn_code, location) VALUES\n`;
@intuitui-labs/lk-edu-geo:lint:biome:     53 │     gnSql += `${batch
@intuitui-labs/lk-edu-geo:lint:biome:   > 54 │       .map((gn: any) => {
@intuitui-labs/lk-edu-geo:lint:biome:        │                 ^^^
@intuitui-labs/lk-edu-geo:lint:biome:     55 │         const lat = gn.location?.lat || 0;
@intuitui-labs/lk-edu-geo:lint:biome:     56 │         const lng = gn.location?.lng || 0;
@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome: 
@intuitui-labs/lk-edu-geo:lint:biome: scripts\generate-sql-seeds.ts:73:15 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@intuitui-labs/lk-edu-geo:lint:biome: 
@intuitui-labs/lk-edu-geo:lint:biome:   ! Unexpected any. Specify a different type.
@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome:     71 │   let postalSql = `-- Postal Towns\nINSERT INTO geo_postal_towns (id, district_id, city, postal_code, location) VALUES\n`;
@intuitui-labs/lk-edu-geo:lint:biome:     72 │   postalSql += `${postalUnits
@intuitui-labs/lk-edu-geo:lint:biome:   > 73 │     .map((pt: any) => {
@intuitui-labs/lk-edu-geo:lint:biome:        │               ^^^
@intuitui-labs/lk-edu-geo:lint:biome:     74 │       const lat = pt.location?.lat || 0;
@intuitui-labs/lk-edu-geo:lint:biome:     75 │       const lng = pt.location?.lng || 0;
@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome: 
@intuitui-labs/lk-edu-geo:lint:biome: scripts\generate-sql-seeds.ts:89:16 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@intuitui-labs/lk-edu-geo:lint:biome: 
@intuitui-labs/lk-edu-geo:lint:biome:   ! Unexpected any. Specify a different type.
@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome:     87 │     schSql += `INSERT INTO edu_schools (id, census_no, name, gender, category, type_code, status, religion, website, socio_economic_tier, province_id, district_id, gn_division_id, zone_id, division_id, location) VALUES\n`;
@intuitui-labs/lk-edu-geo:lint:biome:     88 │     schSql += `${batch
@intuitui-labs/lk-edu-geo:lint:biome:   > 89 │       .map((s: any) => {
@intuitui-labs/lk-edu-geo:lint:biome:        │                ^^^
@intuitui-labs/lk-edu-geo:lint:biome:     90 │         const lat = s.location?.lat || 0;
@intuitui-labs/lk-edu-geo:lint:biome:     91 │         const lng = s.location?.lng || 0;
@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome: 
@intuitui-labs/lk-edu-geo:lint:biome: scripts\generate-sql-seeds.ts:112:16 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@intuitui-labs/lk-edu-geo:lint:biome: 
@intuitui-labs/lk-edu-geo:lint:biome:   ! Unexpected any. Specify a different type.
@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome:     110 │     statsSql += `INSERT INTO edu_school_registry_stats (school_id, academic_year, total_students, students_boys, students_girls, total_teachers, medium, grade_span, difficulty_level) VALUES\n`;
@intuitui-labs/lk-edu-geo:lint:biome:     111 │     statsSql += `${batch
@intuitui-labs/lk-edu-geo:lint:biome:   > 112 │       .map((s: any) => {
@intuitui-labs/lk-edu-geo:lint:biome:         │                ^^^
@intuitui-labs/lk-edu-geo:lint:biome:     113 │         return `('${s.id}', 2024, ${s.total_students || 0}, ${s.students_boys || 0}, ${s.students_girls || 0}, ${s.total_teachers || 0}, '${escape(s.medium || '')}', '${escape(s.grade_span || '')}', '${escape(s.difficulty_level || '')}')`;
@intuitui-labs/lk-edu-geo:lint:biome:     114 │       })
@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome: 
@intuitui-labs/lk-edu-geo:lint:biome: scripts\generate-sql-seeds.ts:125:46 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@intuitui-labs/lk-edu-geo:lint:biome: 
@intuitui-labs/lk-edu-geo:lint:biome:   ! Unexpected any. Specify a different type.
@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome:     124 │     // 6. CONTACTS
@intuitui-labs/lk-edu-geo:lint:biome:   > 125 │     const contactsBatches = batch.filter((s: any) => s.contact?.tel || s.contact?.email);
@intuitui-labs/lk-edu-geo:lint:biome:         │                                              ^^^
@intuitui-labs/lk-edu-geo:lint:biome:     126 │     if (contactsBatches.length > 0) {
@intuitui-labs/lk-edu-geo:lint:biome:     127 │       let conSql = `-- Schools Contacts Batch ${Math.floor(i / SCH_BATCH_SIZE) + 1}\n`;
@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome: 
@intuitui-labs/lk-edu-geo:lint:biome: scripts\generate-sql-seeds.ts:130:18 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@intuitui-labs/lk-edu-geo:lint:biome: 
@intuitui-labs/lk-edu-geo:lint:biome:   ! Unexpected any. Specify a different type.
@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome:     128 │       conSql += `INSERT INTO edu_school_contacts (school_id, contact_type, phone, email, is_primary) VALUES\n`;
@intuitui-labs/lk-edu-geo:lint:biome:     129 │       conSql += `${contactsBatches
@intuitui-labs/lk-edu-geo:lint:biome:   > 130 │         .map((s: any) => {
@intuitui-labs/lk-edu-geo:lint:biome:         │                  ^^^
@intuitui-labs/lk-edu-geo:lint:biome:     131 │           return `('${s.id}', 'OFFICIAL', ${s.contact.tel ? `'${s.contact.tel}'` : 'NULL'}, ${s.contact.email ? `'${s.contact.email}'` : 'NULL'}, true)`;
@intuitui-labs/lk-edu-geo:lint:biome:     132 │         })
@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome: 
@intuitui-labs/lk-edu-geo:lint:biome: src\types.ts:141:31 lint/suspicious/noExplicitAny ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@intuitui-labs/lk-edu-geo:lint:biome: 
@intuitui-labs/lk-edu-geo:lint:biome:   ! Unexpected any. Specify a different type.
@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome:     139 │   total_teachers?: number;
@intuitui-labs/lk-edu-geo:lint:biome:     140 │   difficulty_level?: string;
@intuitui-labs/lk-edu-geo:lint:biome:   > 141 │   properties?: Record<string, any>;
@intuitui-labs/lk-edu-geo:lint:biome:         │                               ^^^
@intuitui-labs/lk-edu-geo:lint:biome:     142 │ }
@intuitui-labs/lk-edu-geo:lint:biome:     143 │ 
@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome:   i any disables many type checking rules. Its use should be avoided.
@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome: 
@intuitui-labs/lk-edu-geo:lint:biome: scripts\generate-sql-seeds.ts:147:10 lint/suspicious/noShadowRestrictedNames ━━━━━━━━━━━━━━━━━━━━━━━
@intuitui-labs/lk-edu-geo:lint:biome: 
@intuitui-labs/lk-edu-geo:lint:biome:   × Do not shadow the global "escape" property.
@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome:     145 │ }
@intuitui-labs/lk-edu-geo:lint:biome:     146 │ 
@intuitui-labs/lk-edu-geo:lint:biome:   > 147 │ function escape(str: string): string {
@intuitui-labs/lk-edu-geo:lint:biome:         │          ^^^^^^
@intuitui-labs/lk-edu-geo:lint:biome:     148 │   if (!str) return '';
@intuitui-labs/lk-edu-geo:lint:biome:     149 │   return str.replace(/'/g, "''");
@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome:   i Consider renaming this variable. It's easy to confuse the origin of variables when they're named after a known global.
@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome: 
@intuitui-labs/lk-edu-geo:lint:biome: scripts\import-xlsx.ts:84:9 lint/suspicious/noImplicitAnyLet ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@intuitui-labs/lk-edu-geo:lint:biome: 
@intuitui-labs/lk-edu-geo:lint:biome:   × This variable implicitly has the any type.
@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome:     82 │     const regex =
@intuitui-labs/lk-edu-geo:lint:biome:     83 │       /\('(\d+)',\s*'([^']+)',\s*'([^']+)',\s*'([^']*)',\s*'([^']*)',\s*'([^']+)',\s*'([^']+)',\s*'([^']+)',\s*'([^']+)',\s*'([^']+)',\s*'([^']+)',\s*'([^']+)',\s*'([^']+)',\s*'([^']+)',\s*'([^']+)',\s*(\d+|\w+)\)/g;
@intuitui-labs/lk-edu-geo:lint:biome:   > 84 │     let match;
@intuitui-labs/lk-edu-geo:lint:biome:        │         ^^^^^
@intuitui-labs/lk-edu-geo:lint:biome:     85 │ 
@intuitui-labs/lk-edu-geo:lint:biome:     86 │     while ((match = regex.exec(content)) !== null) {
@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome:   i Variable declarations without type annotation and initialization implicitly have the any type. Declare a type or initialize the variable with some value.
@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome: 
@intuitui-labs/lk-edu-geo:lint:biome: scripts\import-xlsx.ts:86:13 lint/suspicious/noAssignInExpressions ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@intuitui-labs/lk-edu-geo:lint:biome: 
@intuitui-labs/lk-edu-geo:lint:biome:   × The assignment should not be in an expression.
@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome:     84 │     let match;
@intuitui-labs/lk-edu-geo:lint:biome:     85 │ 
@intuitui-labs/lk-edu-geo:lint:biome:   > 86 │     while ((match = regex.exec(content)) !== null) {
@intuitui-labs/lk-edu-geo:lint:biome:        │             ^^^^^^^^^^^^^^^^^^^^^^^^^^^
@intuitui-labs/lk-edu-geo:lint:biome:     87 │       const [
@intuitui-labs/lk-edu-geo:lint:biome:     88 │         _full,
@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome:   i The use of assignments in expressions is confusing.
@intuitui-labs/lk-edu-geo:lint:biome:     Expressions are often considered as side-effect free.
@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome: 
@intuitui-labs/lk-edu-geo:lint:biome: scripts\verify-phase8.ts:49:9 lint/suspicious/useIterableCallbackReturn ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@intuitui-labs/lk-edu-geo:lint:biome: 
@intuitui-labs/lk-edu-geo:lint:biome:   × This callback passed to forEach() iterable method should not return a value.
@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome:     47 │   `   searchSchools('Hindu', { districtId: 'Colombo' }): Found ${results.length} results.`,
@intuitui-labs/lk-edu-geo:lint:biome:     48 │ );
@intuitui-labs/lk-edu-geo:lint:biome:   > 49 │ results.forEach((r) => console.log(`   - ${r.name} (Census: ${r.census_no})`));
@intuitui-labs/lk-edu-geo:lint:biome:        │         ^^^^^^^
@intuitui-labs/lk-edu-geo:lint:biome:     50 │ 
@intuitui-labs/lk-edu-geo:lint:biome:     51 │ // 3. Breadcrumbs / Context
@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome:   i Either remove this return or remove the returned value.
@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome:     47 │   `   searchSchools('Hindu', { districtId: 'Colombo' }): Found ${results.length} results.`,
@intuitui-labs/lk-edu-geo:lint:biome:     48 │ );
@intuitui-labs/lk-edu-geo:lint:biome:   > 49 │ results.forEach((r) => console.log(`   - ${r.name} (Census: ${r.census_no})`));
@intuitui-labs/lk-edu-geo:lint:biome:        │                        ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
@intuitui-labs/lk-edu-geo:lint:biome:     50 │ 
@intuitui-labs/lk-edu-geo:lint:biome:     51 │ // 3. Breadcrumbs / Context
@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome: 
@intuitui-labs/lk-edu-geo:lint:biome: check ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@intuitui-labs/lk-edu-geo:lint:biome: 
@intuitui-labs/lk-edu-geo:lint:biome:   × Some errors were emitted while running checks.
@intuitui-labs/lk-edu-geo:lint:biome:   
@intuitui-labs/lk-edu-geo:lint:biome: 
@repo/ui:lint:biome:   × End of file expected
@repo/ui:lint:biome:   
@repo/core:lint:biome: scratch\summarize_eslint.cjs format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/core:lint:biome: 
@repo/library:lint:biome:     109 │       transaction.oncomplete = () => resolve();
@repo/library:lint:biome:   
@repo/core:lint:biome:   × Formatter would have printed the following content:
@repo/core:lint:biome:   
@repo/core:lint:biome:      1    │ - const·fs·=·require('node:fs');␍
@repo/core:lint:biome:      2    │ - const·results·=·JSON.parse(␍
@repo/core:lint:biome:      3    │ - ··fs.readFileSync('eslint_output_fresh.json',·'utf8').replace(/^\uFEFF/,·''),␍
@repo/core:lint:biome:      4    │ - );␍
@repo/core:lint:biome:      5    │ - ␍
@repo/core:lint:biome:      6    │ - const·summary·=·{};␍
@repo/core:lint:biome:      7    │ - results.forEach((result)·=>·{␍
@repo/core:lint:biome:      8    │ - ··result.messages.forEach((msg)·=>·{␍

@repo/ui:lint:biome:   > 1 │ �> @repo/ui@1.0.0 lint:eslint C:\Users\Naween\projects\polymath-platform\packages\ui
@repo/ui:lint:biome:       │             ^^^^^
@repo/ui:lint:biome:     2 │ > eslint . "--format" "json"
@repo/ui:lint:biome:     3 │ 
@repo/ui:lint:biome:   
@repo/ui:lint:biome:   i Use an array for a sequence of values: `[1, 2]`
@repo/ui:lint:biome:   
@repo/ui:lint:biome: 
@repo/ui:lint:biome: report_final.json:1:16 parse ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/ui:lint:biome: 
@repo/ui:lint:biome:   × Invalid fraction part
@repo/ui:lint:biome:   
@repo/ui:lint:biome:   > 1 │ �> @repo/ui@1.0.0 lint:eslint C:\Users\Naween\projects\polymath-platform\packages\ui
@repo/ui:lint:biome:       │                ^
@repo/ui:lint:biome:     2 │ > eslint . "--format" "json"
@repo/ui:lint:biome:     3 │ 
@repo/ui:lint:biome:   
@repo/ui:lint:biome: 
@repo/library:lint:biome:   i Either remove this return or remove the returned value.
@repo/library:lint:biome:   
@repo/library:lint:biome:     105 │       const store = transaction.objectStore(STORE_NAME);
@repo/library:lint:biome:     106 │ 
@repo/library:lint:biome:   > 107 │       nodes.forEach((node) => store.put(node));
@repo/library:lint:biome:         │                               ^^^^^^^^^^^^^^^
@repo/library:lint:biome:     108 │ 
@repo/library:lint:biome:     109 │       transaction.oncomplete = () => resolve();
@repo/library:lint:biome:   
@repo/library:lint:biome: 
@repo/library:lint:biome: src\api\database.web.ts:192:14 lint/suspicious/useIterableCallbackReturn ━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/library:lint:biome: 
@repo/core:lint:biome:      9    │ - ····const·ruleId·=·msg.ruleId·||·'no-rule-id';␍
@repo/library:lint:biome:   × This callback passed to forEach() iterable method should not return a value.
@repo/library:lint:biome:   
@repo/core:lint:biome:     10    │ - ····if·(!summary[ruleId])·{␍
@repo/core:lint:biome:     11    │ - ······summary[ruleId]·=·{·count:·0,·files:·new·Set()·};␍
@repo/core:lint:biome:     12    │ - ····}␍
@repo/core:lint:biome:     13    │ - ····summary[ruleId].count++;␍
@repo/core:lint:biome:     14    │ - ····if·(summary[ruleId].files.size·<·5)·{␍
@repo/core:lint:biome:     15    │ - ······summary[ruleId].files.add(result.filePath);␍
@repo/core:lint:biome:     16    │ - ····}␍
@repo/core:lint:biome:     17    │ - ··});␍
@repo/core:lint:biome:     18    │ - });␍
@repo/core:lint:biome:     19    │ - ␍
@repo/core:lint:biome:     20    │ - Object.keys(summary).forEach((ruleId)·=>·{␍
@repo/core:lint:biome:     21    │ - ··summary[ruleId].files·=·Array.from(summary[ruleId].files);␍
@repo/core:lint:biome:     22    │ - });␍
@repo/core:lint:biome:     23    │ - ␍
@repo/core:lint:biome:     24    │ - console.log(JSON.stringify(summary,·null,·2));␍
@repo/core:lint:biome:         1 │ + const·fs·=·require('node:fs');
@repo/core:lint:biome:         2 │ + const·results·=·JSON.parse(
@repo/core:lint:biome:         3 │ + ··fs.readFileSync('eslint_output_fresh.json',·'utf8').replace(/^\uFEFF/,·''),
@repo/core:lint:biome:         4 │ + );
@repo/core:lint:biome:         5 │ + 
@repo/core:lint:biome:         6 │ + const·summary·=·{};
@repo/core:lint:biome:         7 │ + results.forEach((result)·=>·{
@repo/core:lint:biome:         8 │ + ··result.messages.forEach((msg)·=>·{
@repo/core:lint:biome:         9 │ + ····const·ruleId·=·msg.ruleId·||·'no-rule-id';
@repo/core:lint:biome:        10 │ + ····if·(!summary[ruleId])·{
@repo/core:lint:biome:        11 │ + ······summary[ruleId]·=·{·count:·0,·files:·new·Set()·};
@repo/core:lint:biome:        12 │ + ····}
@repo/core:lint:biome:        13 │ + ····summary[ruleId].count++;
@repo/core:lint:biome:        14 │ + ····if·(summary[ruleId].files.size·<·5)·{
@repo/core:lint:biome:        15 │ + ······summary[ruleId].files.add(result.filePath);
@repo/core:lint:biome:        16 │ + ····}
@repo/core:lint:biome:        17 │ + ··});
@repo/core:lint:biome:        18 │ + });
@repo/core:lint:biome:        19 │ + 
@repo/core:lint:biome:        20 │ + Object.keys(summary).forEach((ruleId)·=>·{
@repo/core:lint:biome:        21 │ + ··summary[ruleId].files·=·Array.from(summary[ruleId].files);
@repo/core:lint:biome:        22 │ + });
@repo/core:lint:biome:        23 │ + 
@repo/core:lint:biome:        24 │ + console.log(JSON.stringify(summary,·null,·2));
@repo/core:lint:biome:     25 25 │   
@repo/core:lint:biome:   
@repo/core:lint:biome: 
@repo/core:lint:biome: src\__tests__\workspace\layoutSync.test.ts format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/core:lint:biome: 
@repo/core:lint:biome:   × Formatter would have printed the following content:
@repo/core:lint:biome:   
@repo/core:lint:biome:      1    │ - import·{␍
@repo/core:lint:biome:      2    │ - ··buildWorkspaceLayoutStorageKey,␍
@repo/core:lint:biome:      3    │ - ··choosePreferredWorkspaceLayout,␍
@repo/core:lint:biome:      4    │ - ··resolveWorkspaceLayoutTarget,␍
@repo/core:lint:biome:      5    │ - ··toWorkspaceLayoutRecord,␍
@repo/core:lint:biome:      6    │ - ··toWorkspaceLayoutUpsert,␍
@repo/core:lint:biome:      7    │ - }·from·'../../logic/workspace/layoutSync';␍
@repo/core:lint:biome:      8    │ - ␍
@repo/core:lint:biome:      9    │ - describe('workspace·layout·sync·helpers',·()·=>·{␍
@repo/core:lint:biome:     10    │ - ··test('resolves·device-specific·layout·targets',·()·=>·{␍
@repo/core:lint:biome:     11    │ - ····expect(resolveWorkspaceLayoutTarget('web',·'expanded')).toBe('web');␍
@repo/core:lint:biome:     12    │ - ····expect(resolveWorkspaceLayoutTarget('web',·'compact')).toBe('mobile');␍
@repo/core:lint:biome:     13    │ - ····expect(resolveWorkspaceLayoutTarget('native',·'expanded')).toBe('mobile');␍
@repo/core:lint:biome:     14    │ - ··});␍
@repo/core:lint:biome:     15    │ - ␍
@repo/core:lint:biome:     16    │ - ··test('builds·deterministic·local·storage·keys',·()·=>·{␍
@repo/core:lint:biome:     17    │ - ····expect(␍
@repo/core:lint:biome:     18    │ - ······buildWorkspaceLayoutStorageKey({␍
@repo/core:lint:biome:     19    │ - ········userId:·'user-1',␍
@repo/core:lint:biome:     20    │ - ········workspaceId:·'classroom',␍
@repo/core:lint:biome:     21    │ - ········layoutTarget:·'web',␍
@repo/core:lint:biome:     22    │ - ······}),␍
@repo/core:lint:biome:     23    │ - ····).toBe('workspace-layout:classroom:web:user-1');␍
@repo/core:lint:biome:     24    │ - ··});␍
@repo/core:lint:biome:     25    │ - ␍
@repo/core:lint:biome:     26    │ - ··test('maps·remote·records·into·shared·layout·shape·and·back',·()·=>·{␍
@repo/core:lint:biome:     27    │ - ····const·record·=·toWorkspaceLayoutRecord({␍
@repo/core:lint:biome:     28    │ - ······id:·'11111111-1111-1111-1111-111111111111',␍
@repo/core:lint:biome:     29    │ - ······user_id:·'22222222-2222-2222-2222-222222222222',␍
@repo/core:lint:biome:     30    │ - ······workspace_id:·'classroom',␍
@repo/core:lint:biome:     31    │ - ······layout_target:·'web',␍
@repo/core:lint:biome:     32    │ - ······order:·['principal'],␍
@repo/core:lint:biome:     33    │ - ······hidden:·[],␍
@repo/core:lint:biome:     34    │ - ······pinned:·['principal'],␍
@repo/core:lint:biome:     35    │ - ······zone_by_surface:·{·principal:·'institution'·},␍
@repo/core:lint:biome:     36    │ - ······layout_version:·1,␍
@repo/core:lint:biome:     37    │ - ······created_at:·'2026-03-28T10:00:00.000Z',␍
@repo/core:lint:biome:     38    │ - ······updated_at:·'2026-03-28T10:05:00.000Z',␍
@repo/core:lint:biome:     39    │ - ····});␍
@repo/core:lint:biome:     40    │ - ␍
@repo/core:lint:biome:     41    │ - ····const·upsert·=·toWorkspaceLayoutUpsert(record,·{␍
@repo/core:lint:biome:     42    │ - ······userId:·record.userId,␍
@repo/core:lint:biome:     43    │ - ······workspaceId:·record.workspaceId,␍
@repo/core:lint:biome:     44    │ - ······layoutTarget:·'web',␍
@repo/core:lint:biome:     45    │ - ····});␍
@repo/core:lint:biome:     46    │ - ␍
@repo/core:lint:biome:     47    │ - ····expect(record.workspaceId).toBe('classroom');␍
@repo/core:lint:biome:     48    │ - ····expect(upsert.layoutTarget).toBe('web');␍
@repo/core:lint:biome:     49    │ - ····expect(upsert.zoneBySurface.principal).toBe('institution');␍
@repo/core:lint:biome:     50    │ - ··});␍
@repo/core:lint:biome:     51    │ - ␍
@repo/core:lint:biome:     52    │ - ··test('prefers·the·newer·layout·snapshot',·()·=>·{␍
@repo/core:lint:biome:     53    │ - ····const·local·=·{␍
@repo/core:lint:biome:     54    │ - ······workspaceId:·'classroom',␍
@repo/core:lint:biome:     55    │ - ······userId:·'user-1',␍
@repo/core:lint:biome:     56    │ - ······order:·['teacher'],␍
@repo/core:lint:biome:     57    │ - ······hidden:·[],␍
@repo/core:lint:biome:     58    │ - ······pinned:·[],␍
@repo/core:lint:biome:     59    │ - ······zoneBySurface:·{·teacher:·'work'·as·const·},␍
@repo/core:lint:biome:     60    │ - ······updatedAt:·'2026-03-28T09:00:00.000Z',␍
@repo/core:lint:biome:     61    │ - ····};␍
@repo/core:lint:biome:     62    │ - ····const·remote·=·{␍
@repo/core:lint:biome:     63    │ - ······workspaceId:·'classroom',␍
@repo/core:lint:biome:     64    │ - ······userId:·'user-1',␍
@repo/core:lint:biome:     65    │ - ······order:·['principal'],␍
@repo/core:lint:biome:     66    │ - ······hidden:·[],␍
@repo/core:lint:biome:     67    │ - ······pinned:·[],␍
@repo/core:lint:biome:     68    │ - ······zoneBySurface:·{·principal:·'institution'·as·const·},␍
@repo/core:lint:biome:     69    │ - ······updatedAt:·'2026-03-28T10:00:00.000Z',␍
@repo/core:lint:biome:     70    │ - ····};␍
@repo/core:lint:biome:     71    │ - ␍
@repo/core:lint:biome:     72    │ - ····expect(choosePreferredWorkspaceLayout({·local,·remote·})).toEqual(remote);␍
@repo/core:lint:biome:     73    │ - ··});␍
@repo/core:lint:biome:     74    │ - });␍
@repo/core:lint:biome:         1 │ + import·{
@repo/core:lint:biome:         2 │ + ··buildWorkspaceLayoutStorageKey,
@repo/core:lint:biome:         3 │ + ··choosePreferredWorkspaceLayout,
@repo/core:lint:biome:         4 │ + ··resolveWorkspaceLayoutTarget,
@repo/core:lint:biome:         5 │ + ··toWorkspaceLayoutRecord,
@repo/core:lint:biome:         6 │ + ··toWorkspaceLayoutUpsert,
@repo/core:lint:biome:         7 │ + }·from·'../../logic/workspace/layoutSync';
@repo/core:lint:biome:         8 │ + 
@repo/core:lint:biome:         9 │ + describe('workspace·layout·sync·helpers',·()·=>·{
@repo/core:lint:biome:        10 │ + ··test('resolves·device-specific·layout·targets',·()·=>·{
@repo/core:lint:biome:        11 │ + ····expect(resolveWorkspaceLayoutTarget('web',·'expanded')).toBe('web');
@repo/core:lint:biome:        12 │ + ····expect(resolveWorkspaceLayoutTarget('web',·'compact')).toBe('mobile');
@repo/core:lint:biome:        13 │ + ····expect(resolveWorkspaceLayoutTarget('native',·'expanded')).toBe('mobile');
@repo/core:lint:biome:        14 │ + ··});
@repo/core:lint:biome:        15 │ + 
@repo/core:lint:biome:        16 │ + ··test('builds·deterministic·local·storage·keys',·()·=>·{
@repo/core:lint:biome:        17 │ + ····expect(
@repo/core:lint:biome:        18 │ + ······buildWorkspaceLayoutStorageKey({
@repo/core:lint:biome:        19 │ + ········userId:·'user-1',
@repo/core:lint:biome:        20 │ + ········workspaceId:·'classroom',
@repo/core:lint:biome:        21 │ + ········layoutTarget:·'web',
@repo/core:lint:biome:        22 │ + ······}),
@repo/core:lint:biome:        23 │ + ····).toBe('workspace-layout:classroom:web:user-1');
@repo/core:lint:biome:        24 │ + ··});
@repo/core:lint:biome:        25 │ + 
@repo/core:lint:biome:        26 │ + ··test('maps·remote·records·into·shared·layout·shape·and·back',·()·=>·{
@repo/core:lint:biome:        27 │ + ····const·record·=·toWorkspaceLayoutRecord({
@repo/core:lint:biome:        28 │ + ······id:·'11111111-1111-1111-1111-111111111111',
@repo/core:lint:biome:        29 │ + ······user_id:·'22222222-2222-2222-2222-222222222222',
@repo/core:lint:biome:        30 │ + ······workspace_id:·'classroom',
@repo/core:lint:biome:        31 │ + ······layout_target:·'web',
@repo/core:lint:biome:        32 │ + ······order:·['principal'],
@repo/core:lint:biome:        33 │ + ······hidden:·[],
@repo/core:lint:biome:        34 │ + ······pinned:·['principal'],
@repo/core:lint:biome:        35 │ + ······zone_by_surface:·{·principal:·'institution'·},
@repo/core:lint:biome:        36 │ + ······layout_version:·1,
@repo/core:lint:biome:        37 │ + ······created_at:·'2026-03-28T10:00:00.000Z',
@repo/core:lint:biome:        38 │ + ······updated_at:·'2026-03-28T10:05:00.000Z',
@repo/core:lint:biome:        39 │ + ····});
@repo/core:lint:biome:        40 │ + 
@repo/core:lint:biome:        41 │ + ····const·upsert·=·toWorkspaceLayoutUpsert(record,·{
@repo/core:lint:biome:        42 │ + ······userId:·record.userId,
@repo/core:lint:biome:        43 │ + ······workspaceId:·record.workspaceId,
@repo/core:lint:biome:        44 │ + ······layoutTarget:·'web',
@repo/core:lint:biome:        45 │ + ····});
@repo/core:lint:biome:        46 │ + 
@repo/core:lint:biome:        47 │ + ····expect(record.workspaceId).toBe('classroom');
@repo/core:lint:biome:        48 │ + ····expect(upsert.layoutTarget).toBe('web');
@repo/core:lint:biome:        49 │ + ····expect(upsert.zoneBySurface.principal).toBe('institution');
@repo/core:lint:biome:        50 │ + ··});
@repo/core:lint:biome:        51 │ + 
@repo/core:lint:biome:        52 │ + ··test('prefers·the·newer·layout·snapshot',·()·=>·{
@repo/core:lint:biome:        53 │ + ····const·local·=·{
@repo/core:lint:biome:        54 │ + ······workspaceId:·'classroom',
@repo/core:lint:biome:        55 │ + ······userId:·'user-1',
@repo/core:lint:biome:        56 │ + ······order:·['teacher'],
@repo/core:lint:biome:        57 │ + ······hidden:·[],
@repo/core:lint:biome:        58 │ + ······pinned:·[],
@repo/core:lint:biome:        59 │ + ······zoneBySurface:·{·teacher:·'work'·as·const·},
@repo/core:lint:biome:        60 │ + ······updatedAt:·'2026-03-28T09:00:00.000Z',
@repo/core:lint:biome:        61 │ + ····};
@repo/core:lint:biome:        62 │ + ····const·remote·=·{
@repo/core:lint:biome:        63 │ + ······workspaceId:·'classroom',
@repo/core:lint:biome:        64 │ + ······userId:·'user-1',
@repo/core:lint:biome:        65 │ + ······order:·['principal'],
@repo/core:lint:biome:        66 │ + ······hidden:·[],
@repo/core:lint:biome:        67 │ + ······pinned:·[],
@repo/core:lint:biome:        68 │ + ······zoneBySurface:·{·principal:·'institution'·as·const·},
@repo/core:lint:biome:        69 │ + ······updatedAt:·'2026-03-28T10:00:00.000Z',
@repo/core:lint:biome:        70 │ + ····};
@repo/core:lint:biome:        71 │ + 
@repo/core:lint:biome:        72 │ + ····expect(choosePreferredWorkspaceLayout({·local,·remote·})).toEqual(remote);
@repo/core:lint:biome:        73 │ + ··});
@repo/core:lint:biome:        74 │ + });
@repo/core:lint:biome:     75 75 │   
@repo/core:lint:biome:   
@repo/core:lint:biome: 
@repo/core:lint:biome: src\accounts\deviceAccounts.ts format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/core:lint:biome: 
@repo/core:lint:biome:   × Formatter would have printed the following content:
@repo/core:lint:biome:   
@repo/library:lint:biome: The number of diagnostics exceeds the limit allowed. Use --max-diagnostics to increase it.
@repo/library:lint:biome: Diagnostics not shown: 130.
@repo/library:lint:biome: Checked 51 files in 2s. No fixes applied.
@repo/library:lint:biome: Found 24 errors.
@repo/library:lint:biome: Found 126 warnings.
@repo/library:lint:biome:     190 │       const store = transaction.objectStore(STORE_NAME);
@repo/library:lint:biome:     191 │ 
@repo/library:lint:biome:   > 192 │       layers.forEach((layer) =>
@repo/library:lint:biome:         │              ^^^^^^^
@repo/library:lint:biome:     193 │         store.put({
@repo/library:lint:biome:     194 │           id: layer.id,
@repo/library:lint:biome:   
@repo/library:lint:biome:   i Either remove this return or remove the returned value.
@repo/library:lint:biome:   
@repo/library:lint:biome:     192 │       layers.forEach((layer) =>
@repo/library:lint:biome:   > 193 │         store.put({
@repo/library:lint:biome:         │         ^^^^^^^^^^^
@repo/library:lint:biome:   > 194 │           id: layer.id,
@repo/library:lint:biome:          ...
@repo/library:lint:biome:   > 207 │           updated_at: layer.updated_at,
@repo/library:lint:biome:   > 208 │         }),
@repo/library:lint:biome:         │         ^^
@repo/library:lint:biome:     209 │       );
@repo/library:lint:biome:     210 │ 
@repo/library:lint:biome:   
@repo/library:lint:biome: 
@repo/library:lint:biome: src\components\LibraryThumbnailCard.tsx:30:3 lint/suspicious/noShadowRestrictedNames ━━━━━━━━━━━━━━━
@repo/library:lint:biome: 
@repo/library:lint:biome:   × Do not shadow the global "Map" property.
@repo/library:lint:biome:   
@repo/library:lint:biome:     28 │   FileText,
@repo/library:lint:biome:     29 │   Link,
@repo/library:lint:biome:   > 30 │   Map,
@repo/library:lint:biome:        │   ^^^
@repo/library:lint:biome:     31 │   StickyNote,
@repo/library:lint:biome:     32 │   ThumbsUp,
@repo/library:lint:biome:   
@repo/library:lint:biome:   i Consider renaming this variable. It's easy to confuse the origin of variables when they're named after a known global.
@repo/library:lint:biome:   
@repo/library:lint:biome: 
@repo/library:lint:biome: check ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/library:lint:biome: 
@repo/library:lint:biome:   × Some errors were emitted while running checks.
@repo/library:lint:biome:   
@repo/library:lint:biome: 
@repo/core:lint:biome:       1     │ - import·type·{·Session·}·from·'@supabase/supabase-js';␍
@repo/core:lint:biome:       2     │ - import·{·deviceTrustAPI·}·from·'../api/deviceTrust';␍
@repo/ui:lint:biome: report_final.json:1:19 parse ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/ui:lint:biome: 
@repo/ui:lint:biome:   × String values must be double quoted.
@repo/ui:lint:biome:   
@repo/ui:lint:biome:   > 1 │ �> @repo/ui@1.0.0 lint:eslint C:\Users\Naween\projects\polymath-platform\packages\ui
@repo/ui:lint:biome:       │                   ^^^^
@repo/ui:lint:biome:     2 │ > eslint . "--format" "json"
@repo/ui:lint:biome:     3 │ 
@repo/ui:lint:biome:   
@repo/ui:lint:biome: 
@repo/ui:lint:biome: report_final.json:1:23 parse ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/ui:lint:biome: 
@repo/ui:lint:biome:   × End of file expected
@repo/ui:lint:biome:   
@repo/ui:lint:biome:   > 1 │ �> @repo/ui@1.0.0 lint:eslint C:\Users\Naween\projects\polymath-platform\packages\ui
@repo/ui:lint:biome:       │                       ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
@repo/ui:lint:biome:   > 2 │ > eslint . "--format" "json"
@repo/ui:lint:biome:       │ ^^^^^^^^^^
@repo/ui:lint:biome:     3 │ 
@repo/core:lint:biome:       3     │ - import·{·assertHighway·}·from·'../api/highways';␍
@repo/core:lint:biome:       4     │ - import·{·identityAPI·}·from·'../api/identity';␍
@repo/core:lint:biome:       5     │ - import·{·__INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__·}·from·'../api/supabase';␍
@repo/core:lint:biome:       6     │ - import·{·accountPin·}·from·'../lib/accountPin';␍
@repo/core:lint:biome:       7     │ - import·{·getActiveAccountId,·setActiveAccountId·}·from·'../lib/accountScope';␍
@repo/core:lint:biome:       8     │ - import·{·storage·}·from·'../lib/storage';␍
@repo/core:lint:biome:       9     │ - import·{␍
@repo/core:lint:biome:      10     │ - ··clearLegacySupabaseSession,␍
@repo/core:lint:biome:      11     │ - ··getStoredSessionForAccount,␍
@repo/core:lint:biome:      12     │ - ··removeStoredSessionForAccount,␍
@repo/core:lint:biome:      13     │ - ··setStoredSessionForAccount,␍
@repo/core:lint:biome:      14     │ - }·from·'../lib/supabaseAuthStorage';␍
@repo/core:lint:biome:      15     │ - import·{·rehydrateScopedStores,·resetScopedStores·}·from·'../store/resetScopedStores';␍
@repo/core:lint:biome:      16     │ - ␍
@repo/core:lint:biome:      17     │ - const·ACCOUNTS_REGISTRY_KEY·=·'gurudevi-device-accounts';␍
@repo/core:lint:biome:      18     │ - const·ACTIVE_ACCOUNT_KEY·=·'gurudevi-active-account-id';␍
@repo/core:lint:biome:      19     │ - ␍
@repo/core:lint:biome:      20     │ - export·interface·DeviceAccountRecord·{␍
@repo/core:lint:biome:      21     │ - ··accountId:·string;␍
@repo/core:lint:biome:      22     │ - ··authUserId:·string;␍
@repo/core:lint:biome:      23     │ - ··email:·string·|·null;␍
@repo/core:lint:biome:      24     │ - ··displayName:·string·|·null;␍
@repo/core:lint:biome:      25     │ - ··avatarUrl:·string·|·null;␍
@repo/core:lint:biome:      26     │ - ··capacity:·string·|·null;␍
@repo/core:lint:biome:      27     │ - ··schoolId:·string·|·null;␍
@repo/core:lint:biome:      28     │ - ··isAnonymous:·boolean;␍
@repo/core:lint:biome:      29     │ - ··createdAt:·string;␍
@repo/core:lint:biome:      30     │ - ··lastUsedAt:·string;␍
@repo/core:lint:biome:      31     │ - }␍
@repo/core:lint:biome:      32     │ - ␍
@repo/core:lint:biome:      33     │ - export·interface·DeviceAccountProfile·{␍
@repo/core:lint:biome:      34     │ - ··id:·string;␍
@repo/core:lint:biome:      35     │ - ··email:·string·|·null;␍
@repo/core:lint:biome:      36     │ - ··display_name:·string·|·null;␍
@repo/core:lint:biome:      37     │ - ··avatar_url:·string·|·null;␍
@repo/core:lint:biome:      38     │ - ··capacity:·string·|·null;␍
@repo/core:lint:biome:      39     │ - ··school_id:·string·|·null;␍
@repo/core:lint:biome:      40     │ - ··is_anonymous?:·boolean;␍
@repo/core:lint:biome:      41     │ - }␍
@repo/core:lint:biome:      42     │ - ␍
@repo/core:lint:biome:      43     │ - async·function·readRegistry()·{␍
@repo/core:lint:biome:      44     │ - ··const·raw·=·storage.getString(ACCOUNTS_REGISTRY_KEY);␍
@repo/core:lint:biome:      45     │ - ··if·(!raw)·return·[]·as·DeviceAccountRecord[];␍
@repo/core:lint:biome:      46     │ - ␍
@repo/core:lint:biome:      47     │ - ··try·{␍
@repo/core:lint:biome:      48     │ - ····const·parsed·=·JSON.parse(raw);␍
@repo/core:lint:biome:      49     │ - ····return·Array.isArray(parsed)·?·(parsed·as·DeviceAccountRecord[])·:·[];␍
@repo/core:lint:biome:      50     │ - ··}·catch·{␍
@repo/core:lint:biome:      51     │ - ····return·[];␍
@repo/core:lint:biome:      52     │ - ··}␍
@repo/core:lint:biome:      53     │ - }␍
@repo/core:lint:biome:      54     │ - ␍
@repo/core:lint:biome:      55     │ - async·function·writeRegistry(accounts:·DeviceAccountRecord[])·{␍
@repo/core:lint:biome:      56     │ - ··storage.set(ACCOUNTS_REGISTRY_KEY,·JSON.stringify(accounts));␍
@repo/core:lint:biome:      57     │ - }␍
@repo/core:lint:biome:      58     │ - ␍
@repo/core:lint:biome:      59     │ - async·function·setActiveAccount(accountId:·string·|·null)·{␍
@repo/core:lint:biome:      60     │ - ··setActiveAccountId(accountId);␍
@repo/core:lint:biome:      61     │ - ␍
@repo/core:lint:biome:      62     │ - ··if·(accountId)·{␍
@repo/core:lint:biome:      63     │ - ····storage.set(ACTIVE_ACCOUNT_KEY,·accountId);␍
@repo/core:lint:biome:      64     │ - ····return;␍
@repo/core:lint:biome:      65     │ - ··}␍
@repo/core:lint:biome:      66     │ - ␍
@repo/core:lint:biome:      67     │ - ··storage.delete(ACTIVE_ACCOUNT_KEY);␍
@repo/core:lint:biome:      68     │ - }␍
@repo/core:lint:biome:      69     │ - ␍
@repo/core:lint:biome:      70     │ - function·toSessionTokens(session:·Session)·{␍
@repo/core:lint:biome:      71     │ - ··return·{␍
@repo/core:lint:biome:      72     │ - ····access_token:·session.access_token,␍
@repo/core:lint:biome:      73     │ - ····refresh_token:·session.refresh_token,␍
@repo/core:lint:biome:      74     │ - ··};␍
@repo/core:lint:biome:      75     │ - }␍
@repo/core:lint:biome:      76     │ - ␍
@repo/core:lint:biome:      77     │ - export·const·deviceAccounts·=·{␍
@repo/core:lint:biome:      78     │ - ··async·initialize()·{␍
@repo/core:lint:biome:      79     │ - ····const·storedActive·=·storage.getString(ACTIVE_ACCOUNT_KEY);␍
@repo/core:lint:biome:      80     │ - ····setActiveAccountId(storedActive·||·null);␍
@repo/core:lint:biome:      81     │ - ····return·storedActive;␍
@repo/core:lint:biome:      82     │ - ··},␍
@repo/core:lint:biome:      83     │ - ␍
@repo/core:lint:biome:      84     │ - ··async·list()·{␍
@repo/core:lint:biome:      85     │ - ····const·accounts·=·await·readRegistry();␍
@repo/core:lint:biome:      86     │ - ····return·accounts.sort((a,·b)·=>·b.lastUsedAt.localeCompare(a.lastUsedAt));␍
@repo/core:lint:biome:      87     │ - ··},␍
@repo/core:lint:biome:      88     │ - ␍
@repo/core:lint:biome:      89     │ - ··async·getActiveAccountId()·{␍
@repo/core:lint:biome:      90     │ - ····return·getActiveAccountId();␍
@repo/core:lint:biome:      91     │ - ··},␍
@repo/core:lint:biome:      92     │ - ␍
@repo/core:lint:biome:      93     │ - ··async·captureCurrentAccount(session:·Session·|·null,·profile?:·DeviceAccountProfile·|·null)·{␍
@repo/core:lint:biome:      94     │ - ····if·(!session?.user)·return·null;␍
@repo/core:lint:biome:      95     │ - ␍
@repo/core:lint:biome:      96     │ - ····const·authUserId·=·session.user.id;␍
@repo/core:lint:biome:      97     │ - ····const·isAnonymous·=␍
@repo/core:lint:biome:      98     │ - ······session.user.is_anonymous·===·true·||·!session.user.email·||·profile?.is_anonymous·===·true;␍
@repo/core:lint:biome:      99     │ - ····if·(isAnonymous)·{␍
@repo/core:lint:biome:     100     │ - ······return·null;␍
@repo/core:lint:biome:     101     │ - ····}␍
@repo/core:lint:biome:     102     │ - ␍
@repo/core:lint:biome:     103     │ - ····assertHighway('identity_bootstrap',·'direct-api');␍
@repo/core:lint:biome:     104     │ - ····const·identity·=·profile?.id·?·null·:·await·identityAPI.identifyActiveCitizen();␍
@repo/core:lint:biome:     105     │ - ····const·accountId·=·profile?.id·??·identity?.id;␍
@repo/core:lint:biome:     106     │ - ␍
@repo/core:lint:biome:     107     │ - ····if·(!accountId)·return·null;␍
@repo/core:lint:biome:     108     │ - ␍
@repo/core:lint:biome:     109     │ - ····await·setStoredSessionForAccount(accountId,·toSessionTokens(session));␍
@repo/core:lint:biome:     110     │ - ····await·clearLegacySupabaseSession();␍
@repo/core:lint:biome:     111     │ - ␍
@repo/core:lint:biome:     112     │ - ····const·now·=·new·Date().toISOString();␍
@repo/core:lint:biome:     113     │ - ····const·accounts·=·await·readRegistry();␍
@repo/core:lint:biome:     114     │ - ····const·existing·=·accounts.find((entry)·=>·entry.accountId·===·accountId);␍
@repo/core:lint:biome:     115     │ - ␍
@repo/core:lint:biome:     116     │ - ····const·nextRecord:·DeviceAccountRecord·=·{␍
@repo/core:lint:biome:     117     │ - ······accountId,␍
@repo/core:lint:biome:     118     │ - ······authUserId,␍
@repo/core:lint:biome:     119     │ - ······email:·profile?.email·??·session.user.email·??·existing?.email·??·null,␍
@repo/core:lint:biome:     120     │ - ······displayName:␍
@repo/core:lint:biome:     121     │ - ········profile?.display_name·??␍
@repo/core:lint:biome:     122     │ - ········(session.user.user_metadata?.display_name·as·string·|·undefined)·??␍
@repo/core:lint:biome:     123     │ - ········existing?.displayName·??␍
@repo/core:lint:biome:     124     │ - ········null,␍
@repo/core:lint:biome:     125     │ - ······avatarUrl:·profile?.avatar_url·??·existing?.avatarUrl·??·null,␍
@repo/core:lint:biome:     126     │ - ······capacity:·profile?.capacity·??·existing?.capacity·??·null,␍
@repo/core:lint:biome:     127     │ - ······schoolId:·profile?.school_id·??·existing?.schoolId·??·null,␍
@repo/core:lint:biome:     128     │ - ······isAnonymous:·false,␍
@repo/core:lint:biome:     129     │ - ······createdAt:·existing?.createdAt·??·now,␍
@repo/core:lint:biome:     130     │ - ······lastUsedAt:·now,␍
@repo/core:lint:biome:     131     │ - ····};␍
@repo/core:lint:biome:     132     │ - ␍
@repo/core:lint:biome:     133     │ - ····const·nextAccounts·=·accounts␍
@repo/core:lint:biome:     134     │ - ······.filter((entry)·=>·entry.accountId·!==·accountId)␍
@repo/core:lint:biome:     135     │ - ······.concat(nextRecord);␍
@repo/core:lint:biome:     136     │ - ␍
@repo/core:lint:biome:     137     │ - ····await·writeRegistry(nextAccounts);␍
@repo/core:lint:biome:     138     │ - ····await·setActiveAccount(accountId);␍
@repo/core:lint:biome:     139     │ - ␍
@repo/core:lint:biome:     140     │ - ····try·{␍
@repo/core:lint:biome:     141     │ - ······const·trust·=·await·deviceTrustAPI.syncCurrentAccountDevice(accountId);␍
@repo/core:lint:biome:     142     │ - ······if·(trust·&&·!trust.isTrusted)·{␍
@repo/core:lint:biome:     143     │ - ········console.warn(␍
@repo/core:lint:biome:     144     │ - ··········'Device·trust·API·marked·this·install·as·untrusted.·Phase·1·is·advisory-only,·so·access·is·not·hard-blocked·yet.',␍
@repo/core:lint:biome:     145     │ - ········);␍
@repo/core:lint:biome:     146     │ - ······}␍
@repo/core:lint:biome:     147     │ - ␍
@repo/core:lint:biome:     148     │ - ······await·deviceTrustAPI.logAuditEvent(␍
@repo/core:lint:biome:     149     │ - ········'ACCOUNT_CAPTURED_ON_DEVICE',␍
@repo/core:lint:biome:     150     │ - ········{␍
@repo/core:lint:biome:   495 more lines truncated
@repo/core:lint:biome:   
@repo/core:lint:biome: 
@repo/core:lint:biome: src\adapters\__tests__\powersync.database.test.ts format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/core:lint:biome: 
@repo/core:lint:biome:   × Formatter would have printed the following content:
@repo/core:lint:biome:   
@repo/core:lint:biome:      1    │ - import·{·afterEach,·describe,·expect,·it,·vi·}·from·'vitest';␍
@repo/core:lint:biome:      2    │ - ␍
@repo/core:lint:biome:      3    │ - import·{·getPowerSyncDB·}·from·'../powersync/database';␍
@repo/core:lint:biome:      4    │ - ␍
@repo/core:lint:biome:      5    │ - describe('PowerSync·database·bootstrap·guard',·()·=>·{␍
@repo/core:lint:biome:      6    │ - ··afterEach(()·=>·{␍
@repo/core:lint:biome:      7    │ - ····vi.unstubAllGlobals();␍
@repo/core:lint:biome:      8    │ - ··});␍
@repo/core:lint:biome:      9    │ - ␍
@repo/core:lint:biome:     10    │ - ··it('fails·loudly·in·the·browser·before·the·runtime·is·registered',·()·=>·{␍
@repo/core:lint:biome:     11    │ - ····vi.stubGlobal('window',·{});␍
@repo/core:lint:biome:     12    │ - ␍
@repo/core:lint:biome:     13    │ - ····expect(()·=>·getPowerSyncDB()).toThrow(␍
@repo/core:lint:biome:     14    │ - ······/PowerSync·bootstrap·guard:·browser·code·touched·PowerSync·before·the·app·was·ready/i,␍
@repo/core:lint:biome:     15    │ - ····);␍
@repo/core:lint:biome:     16    │ - ··});␍
@repo/core:lint:biome:     17    │ - });␍
@repo/core:lint:biome:         1 │ + import·{·afterEach,·describe,·expect,·it,·vi·}·from·'vitest';
@repo/core:lint:biome:         2 │ + 
@repo/core:lint:biome:         3 │ + import·{·getPowerSyncDB·}·from·'../powersync/database';
@repo/core:lint:biome:         4 │ + 
@repo/core:lint:biome:         5 │ + describe('PowerSync·database·bootstrap·guard',·()·=>·{
@repo/core:lint:biome:         6 │ + ··afterEach(()·=>·{
@repo/core:lint:biome:         7 │ + ····vi.unstubAllGlobals();
@repo/core:lint:biome:         8 │ + ··});
@repo/core:lint:biome:         9 │ + 
@repo/core:lint:biome:        10 │ + ··it('fails·loudly·in·the·browser·before·the·runtime·is·registered',·()·=>·{
@repo/core:lint:biome:        11 │ + ····vi.stubGlobal('window',·{});
@repo/core:lint:biome:        12 │ + 
@repo/core:lint:biome:        13 │ + ····expect(()·=>·getPowerSyncDB()).toThrow(
@repo/core:lint:biome:        14 │ + ······/PowerSync·bootstrap·guard:·browser·code·touched·PowerSync·before·the·app·was·ready/i,
@repo/core:lint:biome:        15 │ + ····);
@repo/core:lint:biome:        16 │ + ··});
@repo/core:lint:biome:        17 │ + });
@repo/core:lint:biome:     18 18 │   
@repo/core:lint:biome:   
@repo/core:lint:biome: 
@repo/core:lint:biome: src\adapters\__tests__\supabase.auth.adapter.test.ts format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/core:lint:biome: 
@repo/core:lint:biome:   × Formatter would have printed the following content:
@repo/core:lint:biome:   
@repo/core:lint:biome:       1     │ - import·{·beforeEach,·describe,·expect,·it,·vi·}·from·'vitest';␍
@repo/core:lint:biome:       2     │ - ␍
@repo/core:lint:biome:       3     │ - const·mockAuth·=·vi.hoisted(()·=>·({␍

@repo/core:lint:biome:       4     │ - ··getSession:·vi.fn(),␍
@repo/core:lint:biome:       5     │ - ··getUser:·vi.fn(),␍
@repo/core:lint:biome:       6     │ - ··signInWithPassword:·vi.fn(),␍
@repo/core:lint:biome:       7     │ - ··signInWithOAuth:·vi.fn(),␍
@repo/core:lint:biome:       8     │ - ··linkIdentity:·vi.fn(),␍
@repo/core:lint:biome:       9     │ - ··setSession:·vi.fn(),␍
@repo/core:lint:biome:      10     │ - ··signUp:·vi.fn(),␍
@repo/core:lint:biome:      11     │ - ··signInAnonymously:·vi.fn(),␍
@intuitui-labs/lk-edu-geo:lint:biome:  ELIFECYCLE  Command failed with exit code 1.
@repo/core:lint:biome:      12     │ - ··updateUser:·vi.fn(),␍
@repo/core:lint:biome:      13     │ - ··signOut:·vi.fn(),␍
@repo/core:lint:biome:      14     │ - ··passkey:·{␍
@repo/core:lint:biome:      15     │ - ····signIn:·vi.fn(),␍
@repo/library:lint:biome:  ELIFECYCLE  Command failed with exit code 1.
@repo/core:lint:biome:      16     │ - ····register:·vi.fn(),␍
@repo/core:lint:biome:      17     │ - ··},␍
@repo/core:lint:biome:      18     │ - ··mfa:·{␍
@repo/core:lint:biome:      19     │ - ····listFactors:·vi.fn(),␍

@repo/core:lint:biome:      20     │ - ····enroll:·vi.fn(),␍

@repo/core:lint:biome:      21     │ - ····challenge:·vi.fn(),␍
@repo/core:lint:biome:      22     │ - ····verify:·vi.fn(),␍

@repo/core:lint:biome:      23     │ - ····challengeAndVerify:·vi.fn(),␍
@repo/core:lint:biome:      24     │ - ··},␍
@repo/core:lint:biome:      25     │ - }));␍

@repo/core:lint:biome:      26     │ - ␍
@repo/core:lint:biome:      27     │ - vi.mock('../../api/supabase',·()·=>·({␍
@repo/core:lint:biome:      28     │ - ··__INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__:·{␍

@repo/core:lint:biome:      29     │ - ····auth:·mockAuth,␍

@repo/core:lint:biome:      30     │ - ····rpc:·vi.fn(),␍

@repo/core:lint:biome:      31     │ - ··},␍
@repo/core:lint:biome:      32     │ - }));␍
@repo/core:lint:biome:      33     │ - ␍

@repo/core:lint:biome:      34     │ - import·{·SupabaseAuthAdapter·}·from·'../supabase/auth.adapter';␍
@repo/core:lint:biome:      35     │ - ␍

@repo/core:lint:biome:      36     │ - describe('SupabaseAuthAdapter',·()·=>·{␍
@repo/core:lint:biome:      37     │ - ··const·adapter·=·new·SupabaseAuthAdapter();␍
@repo/core:lint:biome:      38     │ - ␍
@repo/core:lint:biome:      39     │ - ··beforeEach(()·=>·{␍
@repo/core:lint:biome:      40     │ - ····vi.clearAllMocks();␍
@repo/core:lint:biome:      41     │ - ··});␍
@repo/core:lint:biome:      42     │ - ␍
@repo/core:lint:biome:      43     │ - ··it('signs·in·with·passkey·through·the·Supabase·passkey·API',·async·()·=>·{␍
@repo/core:lint:biome:      44     │ - ····mockAuth.passkey.signIn.mockResolvedValue({␍
@repo/core:lint:biome:      45     │ - ······data:·{·url:·'https://example.com/passkey-signin'·},␍
@repo/core:lint:biome:      46     │ - ······error:·null,␍
@repo/core:lint:biome:      47     │ - ····});␍
@repo/core:lint:biome:      48     │ - ␍

@repo/core:lint:biome:      49     │ - ····const·result·=·await·adapter.signInWithPasskey({·redirectTo:·'https://app.example.com'·});␍
@repo/core:lint:biome:      50     │ - ␍
@repo/core:lint:biome:      51     │ - ····expect(mockAuth.passkey.signIn).toHaveBeenCalledWith({␍
@repo/core:lint:biome:      52     │ - ······options:·{␍
@repo/core:lint:biome:      53     │ - ········redirectTo:·'https://app.example.com',␍
@repo/core:lint:biome:      54     │ - ········skipBrowserRedirect:·undefined,␍
@repo/core:lint:biome:      55     │ - ······},␍
@repo/core:lint:biome:      56     │ - ····});␍
@repo/core:lint:biome:      57     │ - ····expect(result).toEqual({·url:·'https://example.com/passkey-signin'·});␍
@repo/core:lint:biome:      58     │ - ··});␍
@repo/core:lint:biome:      59     │ - ␍
@repo/core:lint:biome:      60     │ - ··it('registers·a·passkey·through·the·Supabase·passkey·API',·async·()·=>·{␍
@repo/core:lint:biome:      61     │ - ····mockAuth.passkey.register.mockResolvedValue({␍
@repo/core:lint:biome:      62     │ - ······data:·{·url:·'https://example.com/passkey-register'·},␍
@repo/core:lint:biome:      63     │ - ······error:·null,␍
@repo/core:lint:biome:      64     │ - ····});␍
@repo/core:lint:biome:      65     │ - ␍
@repo/core:lint:biome:      66     │ - ····const·result·=·await·adapter.registerPasskey({·skipBrowserRedirect:·true·});␍
@repo/core:lint:biome:      67     │ - ␍
@repo/core:lint:biome:      68     │ - ····expect(mockAuth.passkey.register).toHaveBeenCalledWith({␍
@repo/core:lint:biome:      69     │ - ······options:·{␍
@repo/core:lint:biome:      70     │ - ········redirectTo:·undefined,␍

@repo/core:lint:biome:      71     │ - ········skipBrowserRedirect:·true,␍
@repo/core:lint:biome:      72     │ - ······},␍
@repo/core:lint:biome:      73     │ - ····});␍
@repo/core:lint:biome:      74     │ - ····expect(result).toEqual({·url:·'https://example.com/passkey-register'·});␍

@repo/core:lint:biome:      75     │ - ··});␍
@repo/core:lint:biome:      76     │ - ␍
@repo/core:lint:biome:      77     │ - ··it('lists·TOTP·factors·from·Supabase·MFA',·async·()·=>·{␍
@repo/core:lint:biome:      78     │ - ····mockAuth.mfa.listFactors.mockResolvedValue({␍
@repo/core:lint:biome:      79     │ - ······data:·{␍
@repo/core:lint:biome:      80     │ - ········totp:·[␍
@repo/core:lint:biome:      81     │ - ··········{␍
@repo/core:lint:biome:      82     │ - ············id:·'totp-1',␍
@repo/core:lint:biome:      83     │ - ············friendly_name:·'Phone',␍
@repo/core:lint:biome:      84     │ - ············factor_type:·'totp',␍
@repo/core:lint:biome:      85     │ - ············status:·'verified',␍
@repo/core:lint:biome:      86     │ - ············created_at:·'2026-05-21T00:00:00Z',␍
@repo/core:lint:biome:      87     │ - ············updated_at:·'2026-05-21T00:00:00Z',␍
@repo/core:lint:biome:      88     │ - ··········},␍
@repo/core:lint:biome:      89     │ - ········],␍
@repo/core:lint:biome:      90     │ - ········phone:·[],␍
@repo/core:lint:biome:      91     │ - ········webauthn:·[],␍
@repo/core:lint:biome:      92     │ - ······},␍
@repo/core:lint:biome:      93     │ - ······error:·null,␍
@repo/core:lint:biome:      94     │ - ····});␍
@repo/core:lint:biome:      95     │ - ␍
@repo/core:lint:biome:      96     │ - ····const·result·=·await·adapter.listMfaFactors();␍
@repo/core:lint:biome:      97     │ - ␍
@repo/core:lint:biome:      98     │ - ····expect(mockAuth.mfa.listFactors).toHaveBeenCalledTimes(1);␍
@repo/core:lint:biome:      99     │ - ····expect(result.all).toHaveLength(1);␍
@repo/core:lint:biome:     100     │ - ····expect(result.verified).toHaveLength(1);␍
@repo/core:lint:biome:     101     │ - ··});␍
@repo/core:lint:biome:     102     │ - ␍
@repo/core:lint:biome:     103     │ - ··it('enrolls·TOTP·through·Supabase·MFA',·async·()·=>·{␍
@repo/core:lint:biome:     104     │ - ····mockAuth.mfa.enroll.mockResolvedValue({␍
@repo/core:lint:biome:     105     │ - ······data:·{␍
@repo/core:lint:biome:     106     │ - ········id:·'factor-1',␍
@repo/core:lint:biome:     107     │ - ········totp:·{␍
@repo/core:lint:biome:     108     │ - ··········qrCode:·'otpauth://totp/test',␍
@repo/core:lint:biome:     109     │ - ··········secret:·'ABC123',␍
@repo/core:lint:biome:     110     │ - ··········uri:·'otpauth://totp/test?secret=ABC123',␍
@repo/core:lint:biome:     111     │ - ········},␍
@repo/core:lint:biome:     112     │ - ······},␍
@repo/core:lint:biome:     113     │ - ······error:·null,␍
@repo/core:lint:biome:     114     │ - ····});␍
@repo/core:lint:biome:     115     │ - ␍
@repo/core:lint:biome:     116     │ - ····const·result·=·await·adapter.enrollTotp({·friendlyName:·'Parent·phone'·});␍
@repo/core:lint:biome:     117     │ - ␍
@repo/core:lint:biome:     118     │ - ····expect(mockAuth.mfa.enroll).toHaveBeenCalledWith({␍
@repo/core:lint:biome:     119     │ - ······factorType:·'totp',␍
@repo/core:lint:biome:     120     │ - ······friendlyName:·'Parent·phone',␍
@repo/core:lint:biome:     121     │ - ····});␍

@repo/core:lint:biome:     122     │ - ····expect(result.factorId).toBe('factor-1');␍
@repo/core:lint:biome:     123     │ - ····expect(result.qrCode).toContain('otpauth://totp/test');␍
@repo/core:lint:biome:     124     │ - ··});␍
@repo/core:lint:biome:     125     │ - ␍
@repo/core:lint:biome:     126     │ - ··it('verifies·a·TOTP·code·through·Supabase·MFA',·async·()·=>·{␍
@repo/core:lint:biome:     127     │ - ····mockAuth.mfa.challengeAndVerify.mockResolvedValue({␍
@repo/core:lint:biome:     128     │ - ······data:·{␍
@repo/core:lint:biome:     129     │ - ········user:·{·id:·'user-1'·},␍
@repo/core:lint:biome:     130     │ - ········session:·{·access_token:·'a',·refresh_token:·'r'·},␍
@repo/core:lint:biome:     131     │ - ······},␍
@repo/core:lint:biome:     132     │ - ······error:·null,␍

@repo/core:lint:biome:     133     │ - ····});␍

@repo/core:lint:biome:     134     │ - ␍

@repo/core:lint:biome:     135     │ - ····const·result·=·await·adapter.challengeAndVerifyTotp({·factorId:·'factor-1',·code:·'123456'·});␍
@repo/core:lint:biome:     136     │ - ␍
@repo/core:lint:biome:     137     │ - ····expect(mockAuth.mfa.challengeAndVerify).toHaveBeenCalledWith({␍
@repo/core:lint:biome:     138     │ - ······factorId:·'factor-1',␍
@repo/core:lint:biome:     139     │ - ······code:·'123456',␍
@repo/core:lint:biome:     140     │ - ····});␍

@repo/core:lint:biome:     141     │ - ····expect(result.user?.id).toBe('user-1');␍
@repo/core:lint:biome:     142     │ - ··});␍
@repo/core:lint:biome:     143     │ - });␍
@repo/core:lint:biome:           1 │ + import·{·beforeEach,·describe,·expect,·it,·vi·}·from·'vitest';
@repo/core:lint:biome:           2 │ + 

@repo/core:lint:biome:           3 │ + const·mockAuth·=·vi.hoisted(()·=>·({
@repo/core:lint:biome:           4 │ + ··getSession:·vi.fn(),
@repo/core:lint:biome:           5 │ + ··getUser:·vi.fn(),
@repo/core:lint:biome:           6 │ + ··signInWithPassword:·vi.fn(),
@repo/core:lint:biome:           7 │ + ··signInWithOAuth:·vi.fn(),
@repo/core:lint:biome:   137 more lines truncated
@repo/core:lint:biome:   
@repo/core:lint:biome: 
@repo/core:lint:biome: src\adapters\native\NativeDeviceIdentityAdapter.ts format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/core:lint:biome: 

@repo/core:lint:biome:   × Formatter would have printed the following content:

@repo/core:lint:biome:   

@repo/core:lint:biome:      1    │ - import·{·Platform·}·from·'react-native';␍
@repo/core:lint:biome:      2    │ - import·*·as·Keychain·from·'react-native-keychain';␍
@repo/core:lint:biome:      3    │ - import·type·{·IDeviceIdentity·}·from·'../../logic/interfaces/deviceIdentity.port';␍
@repo/core:lint:biome:      4    │ - ␍
@repo/core:lint:biome:      5    │ - /**␍
@repo/core:lint:biome:      6    │ - ·*·NativeDeviceIdentityAdapter␍
@repo/core:lint:biome:      7    │ - ·*␍
@repo/core:lint:biome:      8    │ - ·*·The·production-grade·implementation·of·hardware-bound·identity.␍
@repo/core:lint:biome:      9    │ - ·*·Leverages·the·iOS·Secure·Enclave·and·Android·Keystore·via·react-native-keychain.␍
@repo/core:lint:biome:     10    │ - ·*/␍
@repo/core:lint:biome:     11    │ - export·class·NativeDeviceIdentityAdapter·implements·IDeviceIdentity·{␍

@repo/core:lint:biome:     12    │ - ··async·isSupported():·Promise<boolean>·{␍

@repo/core:lint:biome:     13    │ - ····try·{␍

@repo/core:lint:biome:     14    │ - ······const·biometryType·=·await·Keychain.getSupportedBiometryType();␍

@repo/core:lint:biome:     15    │ - ······return·biometryType·!==·null;␍

@repo/core:lint:biome:     16    │ - ····}·catch·{␍

@repo/core:lint:biome:     17    │ - ······return·false;␍

@repo/core:lint:biome:     18    │ - ····}␍
@repo/core:lint:biome:     19    │ - ··}␍
@repo/core:lint:biome:     20    │ - ␍
@repo/core:lint:biome:     21    │ - ··async·generateHardwareKey(alias:·string):·Promise<string>·{␍
@repo/core:lint:biome:     22    │ - ····const·storageOptions:·Keychain.Options·=·{␍
@repo/core:lint:biome:     23    │ - ······service:·alias,␍

@repo/core:lint:biome:     24    │ - ······accessible:·Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,␍

@repo/core:lint:biome:     25    │ - ······securityLevel:·Keychain.SECURITY_LEVEL.SECURE_HARDWARE,␍

@repo/core:lint:biome:     26    │ - ····};␍
@repo/core:lint:biome:     27    │ - ␍

@repo/core:lint:biome:     28    │ - ····//·Use·hasGenericPassword·for·a·non-intrusive·check␍

@repo/core:lint:biome:     29    │ - ····const·hasKey·=·await·Keychain.hasGenericPassword({·service:·alias·});␍

@repo/core:lint:biome:     30    │ - ····if·(hasKey)·{␍
@repo/core:lint:biome:     31    │ - ······const·credentials·=·await·Keychain.getGenericPassword(storageOptions);␍
@repo/core:lint:biome:     32    │ - ······if·(credentials)·return·credentials.password;␍
@repo/core:lint:biome:     33    │ - ····}␍
@repo/core:lint:biome:     34    │ - ␍
@repo/core:lint:biome:     35    │ - ····//·Generate·a·persistent·hardware-bound·ID␍

@repo/core:lint:biome:     36    │ - ····//·In·a·full·implementation,·this·would·be·a·Public·Key·from·an·RSA/ECC·pair.␍

@repo/core:lint:biome:     37    │ - ····const·hardwareId·=·`${Platform.OS}_${Math.random().toString(36).substring(2,·15)}`;␍
@repo/core:lint:biome:     38    │ - ␍

@repo/core:lint:biome:     39    │ - ····await·Keychain.setGenericPassword('hardware_identity',·hardwareId,·storageOptions);␍
@repo/core:lint:biome:     40    │ - ····return·hardwareId;␍
@repo/core:lint:biome:     41    │ - ··}␍
@repo/core:lint:biome:     42    │ - ␍
@repo/core:lint:biome:     43    │ - ··async·signWithHardwareKey(alias:·string,·challenge:·string):·Promise<string>·{␍

@repo/core:lint:biome:     44    │ - ····//·This·requires·a·native·module·that·supports·ECC/RSA·signing·(like·react-native-keychain's·key-pair·support)␍
@repo/core:lint:biome:     45    │ - ····//·For·now,·we·perform·a·hardware-bound·'Fetch'·of·the·ID·to·prove·access.␍
@repo/core:lint:biome:     46    │ - ····const·storageOptions:·Keychain.Options·=·{␍
@repo/core:lint:biome:     47    │ - ······service:·alias,␍
@repo/core:lint:biome:     48    │ - ······authenticationPrompt:·{␍
@repo/core:lint:biome:     49    │ - ········title:·'Authorize·Sanctuary',␍
@repo/core:lint:biome:     50    │ - ········subtitle:·'Verify·your·device·identity',␍
@repo/core:lint:biome:     51    │ - ······},␍
@repo/core:lint:biome:     52    │ - ······accessControl:·Keychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET,·//·Requires·biometric·touch␍
@repo/core:lint:biome:     53    │ - ····};␍
@repo/core:lint:biome:     54    │ - ␍
@repo/core:lint:biome:     55    │ - ····const·credentials·=·await·Keychain.getGenericPassword(storageOptions);␍
@repo/core:lint:biome:     56    │ - ····if·(!credentials)·throw·new·Error('Hardware·identity·access·denied.');␍
@repo/core:lint:biome:     57    │ - ␍
@repo/core:lint:biome:     58    │ - ····//·In·a·full·implementation,·we·sign·the·challenge·with·the·private·key·here.␍
@repo/core:lint:biome:     59    │ - ····return·`signed_${challenge}_with_${credentials.password}`;␍
@repo/core:lint:biome:     60    │ - ··}␍
@repo/core:lint:biome:     61    │ - ␍
@repo/core:lint:biome:     62    │ - ··async·getAttestation(_alias:·string,·_challenge?:·string):·Promise<string>·{␍
@repo/core:lint:biome:     63    │ - ····//·Implementation·for·Apple·App·Attest·/·Google·Play·Integrity␍
@repo/core:lint:biome:     64    │ - ····//·This·typically·requires·a·dedicated·native·bridge·or·calling·the·platform·APIs·directly.␍
@repo/core:lint:biome:     65    │ - ····return·'production_attestation_token_placeholder';␍

@repo/core:lint:biome:     66    │ - ··}␍

@repo/core:lint:biome:     67    │ - }␍
@repo/core:lint:biome:         1 │ + import·{·Platform·}·from·'react-native';
@repo/core:lint:biome:         2 │ + import·*·as·Keychain·from·'react-native-keychain';
@repo/core:lint:biome:         3 │ + import·type·{·IDeviceIdentity·}·from·'../../logic/interfaces/deviceIdentity.port';
@repo/core:lint:biome:         4 │ + 
@repo/core:lint:biome:         5 │ + /**
@repo/core:lint:biome:         6 │ + ·*·NativeDeviceIdentityAdapter
@repo/core:lint:biome:         7 │ + ·*
@repo/core:lint:biome:         8 │ + ·*·The·production-grade·implementation·of·hardware-bound·identity.
@repo/core:lint:biome:         9 │ + ·*·Leverages·the·iOS·Secure·Enclave·and·Android·Keystore·via·react-native-keychain.
@repo/core:lint:biome:        10 │ + ·*/
@repo/core:lint:biome:        11 │ + export·class·NativeDeviceIdentityAdapter·implements·IDeviceIdentity·{
@repo/core:lint:biome:        12 │ + ··async·isSupported():·Promise<boolean>·{
@repo/core:lint:biome:        13 │ + ····try·{
@repo/core:lint:biome:        14 │ + ······const·biometryType·=·await·Keychain.getSupportedBiometryType();
@repo/core:lint:biome:        15 │ + ······return·biometryType·!==·null;
@repo/core:lint:biome:        16 │ + ····}·catch·{
@repo/core:lint:biome:        17 │ + ······return·false;
@repo/core:lint:biome:        18 │ + ····}
@repo/core:lint:biome:        19 │ + ··}
@repo/core:lint:biome:        20 │ + 
@repo/core:lint:biome:        21 │ + ··async·generateHardwareKey(alias:·string):·Promise<string>·{
@repo/core:lint:biome:        22 │ + ····const·storageOptions:·Keychain.Options·=·{
@repo/core:lint:biome:        23 │ + ······service:·alias,
@repo/core:lint:biome:        24 │ + ······accessible:·Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
@repo/core:lint:biome:        25 │ + ······securityLevel:·Keychain.SECURITY_LEVEL.SECURE_HARDWARE,
@repo/core:lint:biome:        26 │ + ····};
@repo/core:lint:biome:        27 │ + 
@repo/core:lint:biome:        28 │ + ····//·Use·hasGenericPassword·for·a·non-intrusive·check
@repo/core:lint:biome:        29 │ + ····const·hasKey·=·await·Keychain.hasGenericPassword({·service:·alias·});
@repo/core:lint:biome:        30 │ + ····if·(hasKey)·{
@repo/core:lint:biome:        31 │ + ······const·credentials·=·await·Keychain.getGenericPassword(storageOptions);
@repo/core:lint:biome:        32 │ + ······if·(credentials)·return·credentials.password;
@repo/core:lint:biome:        33 │ + ····}
@repo/core:lint:biome:        34 │ + 
@repo/core:lint:biome:        35 │ + ····//·Generate·a·persistent·hardware-bound·ID
@repo/core:lint:biome:        36 │ + ····//·In·a·full·implementation,·this·would·be·a·Public·Key·from·an·RSA/ECC·pair.
@repo/core:lint:biome:        37 │ + ····const·hardwareId·=·`${Platform.OS}_${Math.random().toString(36).substring(2,·15)}`;
@repo/core:lint:biome:        38 │ + 
@repo/core:lint:biome:        39 │ + ····await·Keychain.setGenericPassword('hardware_identity',·hardwareId,·storageOptions);
@repo/core:lint:biome:        40 │ + ····return·hardwareId;
@repo/core:lint:biome:        41 │ + ··}
@repo/core:lint:biome:        42 │ + 

@repo/core:lint:biome:        43 │ + ··async·signWithHardwareKey(alias:·string,·challenge:·string):·Promise<string>·{
@repo/core:lint:biome:        44 │ + ····//·This·requires·a·native·module·that·supports·ECC/RSA·signing·(like·react-native-keychain's·key-pair·support)
@repo/core:lint:biome:        45 │ + ····//·For·now,·we·perform·a·hardware-bound·'Fetch'·of·the·ID·to·prove·access.
@repo/core:lint:biome:        46 │ + ····const·storageOptions:·Keychain.Options·=·{
@repo/core:lint:biome:        47 │ + ······service:·alias,

@repo/core:lint:biome:        48 │ + ······authenticationPrompt:·{
@repo/core:lint:biome:        49 │ + ········title:·'Authorize·Sanctuary',
@repo/core:lint:biome:        50 │ + ········subtitle:·'Verify·your·device·identity',
@repo/core:lint:biome:        51 │ + ······},
@repo/core:lint:biome:        52 │ + ······accessControl:·Keychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET,·//·Requires·biometric·touch
@repo/core:lint:biome:        53 │ + ····};
@repo/core:lint:biome:        54 │ + 
@repo/people:lint:biome: 
@repo/people:lint:biome: > @repo/people@0.0.2 lint:biome C:\Users\Naween\projects\polymath-platform\packages\people
@repo/people:lint:biome: > biome check .
@repo/people:lint:biome: 

@repo/core:lint:biome:        55 │ + ····const·credentials·=·await·Keychain.getGenericPassword(storageOptions);

@repo/core:lint:biome:        56 │ + ····if·(!credentials)·throw·new·Error('Hardware·identity·access·denied.');
@repo/core:lint:biome:        57 │ + 

@repo/core:lint:biome:        58 │ + ····//·In·a·full·implementation,·we·sign·the·challenge·with·the·private·key·here.

@repo/core:lint:biome:        59 │ + ····return·`signed_${challenge}_with_${credentials.password}`;
@repo/core:lint:biome:        60 │ + ··}
@repo/core:lint:biome:        61 │ + 

@repo/core:lint:biome:        62 │ + ··async·getAttestation(_alias:·string,·_challenge?:·string):·Promise<string>·{

@repo/form-builder:lint:biome: 
@repo/form-builder:lint:biome: > @repo/form-builder@1.0.1 lint:biome C:\Users\Naween\projects\polymath-platform\packages\form-builder
@repo/form-builder:lint:biome: > biome check .
@repo/form-builder:lint:biome: 
@repo/core:lint:biome:        63 │ + ····//·Implementation·for·Apple·App·Attest·/·Google·Play·Integrity
@repo/core:lint:biome:        64 │ + ····//·This·typically·requires·a·dedicated·native·bridge·or·calling·the·platform·APIs·directly.
@repo/core:lint:biome:        65 │ + ····return·'production_attestation_token_placeholder';
@repo/core:lint:biome:        66 │ + ··}
@repo/core:lint:biome:        67 │ + }
@repo/core:lint:biome:     68 68 │   
@repo/core:lint:biome:   
@repo/core:lint:biome: 
@repo/core:lint:biome: src\adapters\powersync\PowerSyncGate.tsx format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@repo/core:lint:biome: 

@repo/core:lint:biome:   × Formatter would have printed the following content:
@repo/core:lint:biome:   

@repo/core:lint:biome:      1    │ - /**␍

@repo/core:lint:biome:      2    │ - ·*·PowerSyncProvider·—·Feature-Gated·Context·Provider·(May·2026)␍

@repo/core:lint:biome:      3    │ - ·*␍
@repo/core:lint:biome:      4    │ - ·*·Wraps·the·app·with·the·PowerSync·context·when·`isPowerSyncEnabled`·is·true.␍

@repo/core:lint:biome:      5    │ - ·*·When·the·flag·is·off,·renders·children·directly·—·zero·overhead.␍

@repo/core:lint:biome:      6    │ - ·*␍

@repo/core:lint:biome:      7    │ - ·*·Placement:·Mount·this·INSIDE·the·existing·AuthProvider/FeatureProvider,␍

@repo/core:lint:biome:      8    │ - ·*·after·the·user·is·authenticated·(we·need·a·session·for·fetchCredentials).␍
@repo/core:lint:biome:      9    │ - ·*␍
@repo/core:lint:biome:     10    │ - ·*·@example␍
@repo/core:lint:biome:     11    │ - ·*·//·In·App.tsx,·inside·your·provider·tree:␍
@repo/core:lint:biome:     12    │ - ·*·<PowerSyncGate>␍
@repo/core:lint:biome:     13    │ - ·*···<NavigationContainer>...</NavigationContainer>␍
@repo/core:lint:biome:     14    │ - ·*·</PowerSyncGate>␍
@repo/core:lint:biome:     15    │ - ·*/␍

@repo/core:lint:biome:     16    │ - import·{·type·PropsWithChildren,·useEffect,·useRef·}·from·'react';␍

@repo/core:lint:biome:     17    │ - import·{·sovereignBus·}·from·'../../lib/sync/eventBus';␍
@repo/core:lint:biome:     18    │ - import·{·useStore·}·from·'../../store/useStore';␍
@repo/core:lint:biome:     19    │ - import·{·disconnectPowerSync,·getPowerSyncDB·}·from·'./database';␍

@repo/core:lint:biome:     20    │ - import·{·PowerSyncContext·}·from·'./powersync-react-shim';␍

@repo/core:lint:biome:     21    │ - import·{·SupabasePowerSyncConnector·}·from·'./SupabasePowerSyncConnector';␍
@repo/core:lint:biome:     22    │ - ␍
@repo/core:lint:biome:     23    │ - interface·PowerSyncGateProps·extends·PropsWithChildren·{␍

@repo/core:lint:biome:     24    │ - ··/**·Override·—·if·false,·renders·children·without·PowerSync·context.·*/␍
@repo/core:lint:biome:     25    │ - ··enabled?:·boolean;␍
@repo/core:lint:biome:     26    │ - }␍

@repo/core:lint:biome:     27    │ - ␍

@repo/core:lint:biome:     28    │ - export·function·PowerSyncGate({·children,·enabled·=·true·}:·PowerSyncGateProps)·{␍

@repo/core:lint:biome:     29    │ - ··const·isPowerSyncEnabled·=·useStore((s)·=>·s.flags.isPowerSyncEnabled);␍

@repo/accounting:lint:biome: cache miss, executing 1715be6ed9662ac9

@repo/core:lint:biome:     30    │ - ··const·isActive·=·enabled·&&·isPowerSyncEnabled;␍
@repo/core:lint:biome:     31    │ - ␍
apps-intuitui-web:lint:biome: cache miss, executing e2983824c13fc9be
@repo/profile:lint:biome: cache miss, executing 4bbefc84b2703dfe
@repo/scanner-kit:lint:biome: cache miss, executing 3b857d4f686283e8
@repo/platform-mcp:lint:biome: cache miss, executing 339bf071c9db1708
apps-neevsk-web:lint:biome: cache miss, executing 07a1c805a6a8d658
@repo/classroom:lint:biome: cache miss, executing a9fa73597669850d
@repo/analytics:lint:biome: cache miss, executing be4d92f5af0c1f36
@repo/community:lint:biome: cache miss, executing 1e8a4fefee7c7763

@repo/graphics:lint:biome: cache miss, executing a26acaa44963d568

@repo/ai:lint:biome: cache miss, executing a35f340d9fcc4bcf
apps-edlove-web:lint:biome: cache miss, executing 362f6f8f18518824
gurudevi-mobile:lint:biome: cache miss, executing d2c637f7710a5290

@repo/admin:lint:biome: cache miss, executing 9a5a36f4fb2e944c

@repo/core:lint:biome:     32    │ - ··const·connectorRef·=·useRef<SupabasePowerSyncCon

@repo/ui:lint:biome:     4 │ [{"filePath":"C:\\Users\\Naween\\projects\\polymath-platform\\packages\\ui\\eslint.config.mjs","messages":[],"suppressedMessages":[],"errorCount":0,"fatalErrorCount":0,"warningCount":0,"fixableErrorCount":0,"fixableWarningCount":0,"usedDeprecatedRules":[]},{"filePath":"C:\\Users\\Naween\\projects\\polymath-platform\\packages\\ui\\nativewind-env.d.ts","messages":[],"suppressedMessages":[],"errorCount":0,"fatalErrorCount":0,"warningCount":0,"fixableErrorCount":0,"fixableWarningCount":0,"usedDeprecatedRules":[]},{"filePath":"C:\\Users\\Naween\\projects\\polymath-platform\\packages\\ui\\scripts\\audit-theme.ts","messages":[{"ruleId":"@typescript-eslint/no-unused-vars","severity":1,"message":"'colors' is defined but never used.","line":8,"column":10,"nodeType":"Identifier","messageId":"unusedVar","endLine":8,"endColumn":16,"suggestions":[{"messageId":"removeUnusedVar","data":{"varName":"colors"},"fix":{"range":[175,182],"text":""},"desc":"Remove unused variable \"colors\"."}]},{"ruleId":"@typescript-eslint/no-unused-vars","severity":1,"message":"'phaseMatrix' is defined but never used.","line":8,"column":18,"nodeType":"Identifier","messageId":"unusedVar","endLine":8,"endColumn":29,"suggestions":[{"messageId":"removeUnusedVar","data":{"varName":"phaseMatrix"},"fix":{"range":[181,194],"text":""},"desc":"Remove unused variable \"phaseMatrix\"."}]}],"suppressedMessages":[],"errorCount":0,"fatalErrorCount":0,"warningCount":2,"fixableErrorCount":0,"fixableWarningCount":0,"source":"/**\n * Sanctuary Theme Auditor\n *\n * Scans Theme.ts and phaseMatrix for contrast violations using APCA and WCAG 2.1.\n * Run with: npx tsx scripts/audit-theme.ts\n */\n\nimport { colors, phaseMatrix, resolvePhaseTokens } from '../src/theme/Theme';\nimport { checkAccessibility, toHex } from '../src/utils/a11yUtils';\nimport { TemporalPhase } from '../src/context/types';\n\nconst PHASES: TemporalPhase[] = ['predawn', 'dawn', 'morning', 'afternoon', 'dusk', 'night'];\nconst MODES: ('light' | 'dark')[] = ['light', 'dark'];\n\nconsole.log('\\x1b[36m%s\\x1b[0m', '--- GURUDEVI THEME ACCESSIBILITY AUDIT ---');\nconsole.log('Validating Sanctuary tokens against WCAG 2.1 and APCA Standards...\\n');\n\nlet violations = 0;\nlet totalChecks = 0;\n\nfunction report(\n  label: string,\n  fg: string,\n  bg: string,\n  requirement: { wcag?: number; apca?: number },\n) {\n  totalChecks++;\n  const fgHex = toHex(fg);\n  const bgHex = toHex(bg);\n  const { ratio, apca, apcaRating } = checkAccessibility(fgHex, bgHex);\n\n  let failed = false;\n  const details = [];\n\n  if (requirement.wcag && ratio < requirement.wcag) {\n    failed = true;\n    details.push(`WCAG: ${ratio.toFixed(2)}:1 (Min ${requirement.wcag})`);\n  }\n\n  if (requirement.apca && Math.abs(apca) < requirement.apca) {\n    failed = true;\n    details.push(`APCA: ${apca.toFixed(1)} Lc (Min ${requirement.apca} - ${apcaRating})`);\n  }\n\n  if (failed) {\n    violations++;\n    console.log(`\\x1b[31m[FAIL]\\x1b[0m ${label}`);\n    console.log(`       - BG: ${bgHex}, FG: ${fgHex}`);\n    console.log(`       - ${details.join(' | ')}`);\n  }\n}\n\n// 1. Audit Phase Matrix\nPHASES.forEach((phase) => {\n  MODES.forEach((mode) => {\n    const isDark = mode === 'dark';\n    const tokens = resolvePhaseTokens(phase, isDark);\n\n    // Primary Text Contrast\n    report(`${phase}/${mode} Primary Text`, tokens.text.primary, tokens.gradientNodes[0], {\n      wcag: 4.5,\n      apca: 75,\n    });\n\n    // Secondary Text Contrast\n    report(`${phase}/${mode} Secondary Text`, tokens.text.secondary, tokens.gradientNodes[0], {\n      wcag: 3.0,\n      apca: 60,\n    });\n\n    // Accent Action Contrast\n    report(`${phase}/${mode} Accent Action`, tokens.text.inverse, tokens.accent.action, {\n      wcag: 4.5,\n      apca: 60,\n    });\n  });\n});\n\nconsole.log('\\n--- AUDIT SUMMARY ---');\nif (violations === 0) {\n  console.log(`\\x1b[32mSUCCESS: All ${totalChecks} checks passed.\\x1b[0m`);\n  process.exit(0);\n} else {\n  console.log(\n    `\\x1b[31mWARNING: Found ${violations} accessibility violations across ${totalChecks} checks.\\x1b[0m`,\n  );\n  // We don't exit with 1 yet to avoid breaking builds until we fix the colors\n  process.exit(0);\n}\n","usedDeprecatedRules":[]},{"filePath":"C:\\Users\\Naween\\projects\\polymath-platform\\packages\\ui\\src\\__tests__\\useTheme.test.js","messages":[{"ruleId":"@typescript-eslint/no-require-imports","severity":1,"message":"A `require()` style import is forbidden.","line":1,"column":54,"nodeType":"CallExpression","messageId":"noRequireImports","endLine":1,"endColumn":79},{"ruleId":"no-undef","severity":1,"message":"'require' is not defined.","line":1,"column":54,"nodeType":"Identifier","messageId":"undef","endLine":1,"endColumn":61},{"ruleId":"no-undef","severity":1,"message":"'describe' is not defined.","line":3,"column":1,"nodeType":"Identifier","messageId":"undef","endLine":3,"endColumn":9},{"ruleId":"no-undef","severity":1,"message":"'it' is not defined.","line":4,"column":3,"nodeType":"Identifier","messageId":"undef","endLine":4,"endColumn":5},{"ruleId":"no-undef","severity":1,"message":"'expect' is not defined.","line":7,"column":5,"nodeType":"Identifier","messageId":"undef","endLine":7,"endColumn":11},{"ruleId":"no-undef","severity":1,"message":"'expect' is not defined.","line":8,"column":5,"nodeType":"Identifier","messageId":"undef","endLine":8,"endColumn":11},{"ruleId":"no-undef","severity":1,"message":"'expect' is not defined.","line":9,"column":5,"nodeType":"Identifier","messageId":"undef","endLine":9,"endColumn":11},{"ruleId":"no-undef","severity":1,"message":"'expect' is not defined.","line":10,"column":5,"nodeType":"Identifier","messageId":"undef","endLine":10,"endColumn":11},{"ruleId":"no-undef","severity":1,"message":"'expect' is not defined.","line":11,"column":5,"nodeType":"Identifier","messageId":"undef","endLine":11,"endColumn":11},{"ruleId":"no-undef","severity":1,"message":"'it' is not defined.","line":14,"column":3,"nodeType":"Identifier","messageId":"undef","endLine":14,"endColumn":5},{"ruleId":"no-undef","severity":1,"message":"'expect' is not defined.","line":17,"column":5,"nodeType":"Identifier","messageId":"undef","endLine":17,"endColumn":11},{"ruleId":"no-undef","severity":1,"message":"'expect' is not defined.","line":18,"column":5,"nodeType":"Identifier","messageId":"undef","endLine":18,"endColumn":11},{"ruleId":"no-undef","severity":1,"message":"'expect' is not defined.","line":19,"column":5,"nodeType":"Identifier","messageId":"undef","endLine":19,"endColumn":11},{"ruleId":"no-undef","severity":1,"message":"'expect' is not defined.","line":20,"column":5,"nodeType":"Identifier","messageId":"undef","endLine":20,"endColumn":11},{"ruleId":"no-undef","severity":1,"message":"'expect' is not defined.","line":21,"column":5,"nodeType":"Identifier","messageId":"undef","endLine":21,"endColumn":11},{"ruleId":"no-undef","severity":1,"message":"'it' is not defined.","line":24,"column":3,"nodeType":"Identifier","messageId":"undef","endLine":24,"endColumn":5},{"ruleId":"no-undef","severity":1,"message":"'expect' is not defined.","line":28,"column":7,"nodeType":"Identifier","messageId":"undef","endLine":28,"endColumn":13},{"ruleId":"no-undef","severity":1,"message":"'expect' is not defined.","line":29,"column":7,"nodeType":"Identifier","messageId":"undef","endLine":29,"endColumn":13},{"ruleId":"no-undef","severity":1,"message":"'it' is not defined.","line":33,"column":3,"nodeType":"Identifier","messageId":"undef","endLine":33,"endColumn":5},{"ruleId":"no-undef","severity":1,"message":"'expect' is not defined.","line":37,"column":5,"nodeType":"Identifier","messageId":"undef","endLine":37,"endColumn":11},{"ruleId":"no-undef","severity":1,"message":"'expect' is not defined.","line":38,"column":5,"nodeType":"Identifier","messageId":"undef","endLine":38,"endColumn":11},{"ruleId":"no-undef","severity":1,"message":"'expect' is not defined.","line":39,"column":5,"nodeType":"Identifier","messageId":"undef","endLine":39,"endColumn":11},{"ruleId":"no-undef","severity":1,"message":"'expect' is not defined.","line":40,"column":5,"nodeType":"Identifier","messageId":"undef","endLine":40,"endColumn":11}],"suppressedMessages":[],"errorCount":0,"fatalErrorCount":0,"warningCount":23,"fixableErrorCount":0,"fixableWarningCount":0,"source":"const { resolveClassicTokens, resolvePhaseTokens } = require('../theme/Theme');\n\ndescribe('resolvePhaseTokens', () => {\n  it('returns scene tokens for night/dark', () => {\n    const tokens = resolvePhaseTokens('night', true);\n\n    expect(tokens.scene.world.bg).toBe('#0F131C');\n    expect(tokens.scene.chrome.bg).toBe(tokens.glass.surface.bg);\n    expect(tokens.scene.elevated.bg).toBe(tokens.glass.modal.bg);\n    expect(tokens.text.onWorld).toBe('#FCF9F2');\n    expect(tokens.accent.action).toBe('#FDD925');\n  });\n\n  it('returns scene tokens for morning/light', () => {\n    const tokens = resolvePhaseTokens('morning', false);\n\n    expect(tokens.scene.world.bg).toBe('#F5EDD6');\n    expect(tokens.scene.canvas.bg).toBe('#DCFCE7');\n    expect(tokens.text.onCanvas).toBe('#2A2318');\n    expect(tokens.accent.action).toBe('#8BBF7A');\n    expect(tokens.text.onAccent).toBe(tokens.text.inverse);\n  });\n\n  it('all six phases resolve without throwing in both worlds', () => {\n    const phases = ['predawn', 'dawn', 'morning', 'afternoon', 'dusk', 'night'];\n\n    phases.forEach((phase) => {\n      expect(() => resolvePhaseTokens(phase, false)).not.toThrow();\n      expect(() => resolvePhaseTokens(phase, true)).not.toThrow();\n    });\n  });\n\n  it('classic tokens project into the same scene contract', () => {\n    const lightClassic = resolveClassicTokens(false);\n    const darkClassic = resolveClassicTokens(true);\n\n    expect(lightClassic.scene.canvas.bg).toBe('#FAF7ED');\n    expect(lightClassic.text.onCanvas).toBe('#2A2318');\n    expect(darkClassic.scene.world.bg).toBe('#0F131C');\n    expect(darkClassic.text.onWorld).toBe('#FCF9F2');\n  });\n});\n","usedDeprecatedRules":[]},{"filePath":"C:\\Users\\Naween\\projects\\polymath-platform\\packages\\ui\\src\\archive\\LotusPetalFAB.complex.tsx","messages":[{"ruleId":"@typescript-eslint/no-unused-vars","severity":1,"message":"'runOnJS' is defined but never used.","line":27,"column":3,"nodeType":"Identifier","messageId":"unusedVar","endLine":27,"endColumn":10,"suggestions":[{"messageId":"removeUnusedVar","data":{"varName":"runOnJS"},"fix":{"range":[709,720],"text":""},"desc":"Remove unused variable \"runOnJS\"."}]},{"ruleId":"@typescript-eslint/no-unused-vars","severity":1,"message":"'FAB_HIT_SLOP' is assigned a value but never used.","line":61,"column":7,"nodeType":"Identifier","messageId":"unusedVar","endLine":61,"endColumn":19},{"ruleId":"@typescript-eslint/no-unused-vars","severity":1,"message":"'ACTION_BUBBLE_SIZE' is assigned a value but never used.","line":62,"column":7,"nodeType":"Identifier","messageId":"unusedVar","endLine":62,"endColumn":25},{"ruleId":"@typescript-eslint/no-unused-vars","severity":1,"message":"'SCREEN_WIDTH' is assigned a value but never used.","line":65,"column":7,"nodeType":"Identifier","messageId":"unusedVar","endLine":65,"endColumn":19},{"ruleId":"@typescript-eslint/no-require-imports","severity":1,"message":"A `require()` style import is forbidden.","line":93,"column":21,"nodeType":"CallExpression","messageId":"noRequireImports","endLine":93,"endColumn":67},{"ruleId":"react-hooks/rules-of-hooks","severity":1,"message":"React Hook \"useSharedValue\" is called conditionally. React Hooks must be called in the exact same order in every component render.","line":114,"column":22,"nodeType":"Identifier","endLine":114,"endColumn":36},{"ruleId":"react-hooks/rules-of-hooks","severity":1,"message":"React Hook \"useSharedValue\" is called conditionally. React Hooks must be called in the exact same order in every component render.","line":116,"column":26,"nodeType":"Identifier","endLine":116,"endColumn":40},{"ruleId":"react-hooks/rules-of-hooks","severity":1,"message":"React Hook \"useSharedValue\" is called conditionally. React Hooks must be called in the exact same order in every component render.","line":118,"column":22,"nodeType":"Identifier","endLine":118,"endColumn":36},{"ruleId":"react-hooks/rules-of-hooks","severity":1,"message":"React Hook \"useSharedValue\" is called conditionally. React Hooks must be called in the exact same order in every component render.","line":119,"column":22,"nodeType":"Identifier","endLine":119,"endColumn":36},{"ruleId":"react-hooks/rules-of-hooks","severity":1,"message":"React Hook \"useRef\" is called conditionally. React Hooks must be called in the exact same order in every component render.","line":121,"column":17,"nodeType":"Identifier","endLine":121,"endColumn":23},{"ruleId":"react-hooks/rules-of-hooks","severity":1,"message":"React Hook \"useRef\" is called conditionally. React Hooks must be called in the exact same order in every component render.","line":122,"column":17,"nodeType":"Identifier","endLine":122,"endColumn":23},{"ruleId":"react-hooks/rules-of-hooks","severity":1,"message":"React Hook \"useState\" is called conditionally. React Hooks must be called in the exact same order in every component render.","line":124,"column":41,"nodeType":"Identifier","endLine":124,"endColumn":49},{"ruleId":"react-hooks/rules-of-hooks","severity":1,"message":"React Hook \"useSharedValue\" is called conditionally. React Hooks must be called in the exact same order in every component render.","line":125,"column":27,"nodeType":"Identifier","endLine":125,"endColumn":41},{"ruleId":"react-hooks/rules-of-hooks","severity":1,"message":"React Hook \"useRef\" is called conditionally. React Hooks must be called in the exact same order in every component render.","line":127,"column":26,"nodeType":"Identifier","endLine":127,"endColumn":32},{"ruleId":"react-hooks/rules-of-hooks","severity":1,"message":"React Hook \"useState\" is called conditionally. React Hooks must be called in the exact same order in every component render.","line":128,"column":39,"nodeType":"Identifier","endLine":128,"endColumn":47},{"ruleId":"react-hooks/rules-of-hooks","severity":1,"message":"React Hook \"useMemo\" is called conditionally. React Hooks must be called in the exact same order in every component render.","line":131,"column":18,"nodeType":"Identifier","endLine":131,"endColumn":25},{"ruleId":"@typescript-eslint/no-unused-vars","severity":1,"message":"'IconComponent' is assigned a value but never used.","line":132,"column":9,"nodeType":"Identifier","messageId":"unusedVar","endLine":132,"endColumn":22},{"ruleId":"react-hooks/rules-of-hooks","severity":1,"message":"React Hook \"useCallback\" is called conditionally. React Hooks must be called in the exact same order in every component render.","line":135,"column":25,"nodeType":"Identifier","endLine":135,"endColumn":36},{"ruleId":"@typescript-eslint/no-unused-vars","severity":1,"message":"'error' is defined but never used.","line":138,"column":14,"nodeType":"Identifier","messageId":"unusedVar","endLine":138,"endColumn":19},{"ruleId":"react-hooks/rules-of-hooks","severity":1,"message":"React Hook \"useRef\" is called conditionally. React Hooks must be called in the exact same order in every component render.","line":144,"column":24,"nodeType":"Identifier","endLine":144,"endColumn":30},{"ruleId":"react-hooks/refs","severity":1,"message":"Error: Cannot access refs during render\n\nReact refs are values that are not needed for rendering. Refs should only be accessed outside of render, such as in event handlers or effects. Accessing a ref value (the `current` property) during render can cause your component not to update as expected (https://react.dev/reference/react/useRef).\n\nC:\\Users\\Naween\\projects\\polymath-platform\\packages\\ui\\src\\archive\\LotusPetalFAB.complex.tsx:145:25\n  143 |   // Pan responder for drag functionality\n  144 |   const panResponder = useRef(\n> 145 |     PanResponder.create({\n      |                         ^\n> 146 |       onStartShouldSetPanResponder: () => true,\n      | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^\n> 147 |       onMoveShouldSetPanResponder: (_, gestureState) => {\n      ΓÇª\n      | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^\n> 184 |       },\n      | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^\n> 185 |     }),\n      | ^^^^^^ Passing a ref to a function may read its value during render\n  186 |   ).current;\n  187 |\n  188 |   // ============================================================================","line":145,"column":25,"nodeType":null,"endLine":185,"endColumn":6},{"ruleId":"react-hooks/rules-of-hooks","severity":1,"message":"React Hook \"useEffect\" is called conditionally. React Hooks must be called in the exact same order in every component render.","line":192,"column":3,"nodeType":"Identifier","endLine":192,"endColumn":12},{"ruleId":"react-hooks/exhaustive-deps","severity":1,"message":"React Hook useEffect has a missing dependency: 'breathingScale'. Either include it or remove the dependency array.","line":206,"column":6,"nodeType":"ArrayExpression","endLine":206,"endColumn":39,"suggestions":[{"desc":"Update the dependencies array to be: [breathingScale, disabled, isReduceMotionEnabled]","fix":{"range":[6445,6478],"text":"[breathingScale, disabled, isReduceMotionEnabled]"}}]},{"ruleId":"react-hooks/rules-of-hooks","severity":1,"message":"React Hook \"useAnimatedStyle\" is called conditionally. React Hooks must be called in the exact same order in every component render.","line":212,"column":26,"nodeType":"Identifier","endLine":212,"endColumn":42},{"ruleId":"react-hooks/rules-of-hooks","severity":1,"message":"React Hook \"useAnimatedStyle\" is called conditionally. React Hooks must be called in the exact same order in every component render.","line":218,"column":22,"nodeType":"Identifier","endLine":218,"endColumn":38},{"ruleId":"react-hooks/rules-of-hooks","severity":1,"message":"React Hook \"useCallback\" is called conditionally. React Hooks must be called in the exact same order in every component render.","line":224,"column":23,"nodeType":"Identifier","endLine":224,"endColumn":34},{"ruleId":"react-hooks/immutability","severity":1,"message":"Error: This value cannot be modified\n\nThis modifies a variable that React considers immutable.\n\nC:\\Users\\Naween\\projects\\polymath-platform\\packages\\ui\\src\\archive\\LotusPetalFAB.complex.tsx:240:7\n  238 |     if (onPress) {\n  239 |       triggerHaptic();\n> 240 |       pressScale.value = withSequence(\n      |       ^^^^^^^^^^ `pressScale` cannot be modified\n  241 |         withTiming(0.85, { duration: 100 }),\n  242 |         withSpring(1.0, { damping: 12, stiffness: 200 }),\n  243 |       );","line":240,"column":7,"nodeType":null,"endLine":240,"endColumn":17},{"ruleId":"react-hooks/exhaustive-deps","severity":1,"message":"React Hook useCallback has missing dependencies: 'actionMenuScale', 'announce', and 'pressScale'. Either include them or remove the dependency array.","line":246,"column":6,"nodeType":"ArrayExpression","endLine":246,"endColumn":62,"suggestions":[{"desc":"Update the dependencies array to be: [disabled, actions, onPress, triggerHaptic, showActions, actionMenuScale, announce, pressScale]","fix":{"range":[7526,7582],"text":"[disabled, actions, onPress, triggerHaptic, showActions, actionMenuScale, announce, pressScale]"}}]},{"ruleId":"react-hooks/rules-of-hooks","severity":1,"message":"React Hook \"useAnimatedStyle\" is called conditionally. React Hooks must be called in the exact same order in every component render.","line":248,"column":27,"nodeType":"Identifier","endLine":248,"endColumn":43},{"ruleId":"@typescript-eslint/no-explicit-any","severity":1,"message":"Unexpected any. Specify a different type.","line":252,"column":10,"nodeType":"TSAnyKeyword","messageId":"unexpectedAny","endLine":252,"endColumn":13,"suggestions":[{"messageId":"suggestUnknown","fix":{"range":[7790,7793],"text":"unknown"},"desc":"Use `unknown` instead, this will force you to explicitly, and safely assert the type is correct."},{"messageId":"suggestNever","fix":{"range":[7790,7793],"text":"never"},"desc":"Use `never` instead, this is useful when instantiating generic type parameters that you don't need to know the type of."}]},{"ruleId":"react-hooks/rules-of-hooks","severity":1,"message":"React Hook \"useEffect\" is called conditionally. React Hooks must be called in the exact same order in every component render.","line":255,"column":3,"nodeType":"Identifier","endLine":255,"endColumn":12},{"ruleId":"react-hooks/immutability","severity":1,"message":"Error: This value cannot be modified\n\nModifying a value previously passed as an argument to a hook is not allowed. Consider moving the modification before calling the hook.\n\nC:\\Users\\Naween\\projects\\polymath-platform\\packages\\ui\\src\\archive\\LotusPetalFAB.complex.tsx:256:5\n  254 |\n  255 |   useEffect(() => {\n> 256 |     actionMenuScale.value = withSpring(showActions ? 1 : 0, {\n      |     ^^^^^^^^^^^^^^^ `actionMenuScale` cannot be modified\n  257 |       damping: 15,\n  258 |       stiffness: 150,\n  259 |     });","line":256,"column":5,"nodeType":null,"endLine":256,"endColumn":20},{"ruleId":"react-hooks/exhaustive-deps","severity":1,"message":"React Hook useEffect has a missing dependency: 'actionMenuScale'. Either include it or remove the dependency array.","line":260,"column":6,"nodeType":"ArrayExpression","endLine":260,"endColumn":19,"suggestions":[{"desc":"Update the dependencies array to be: [actionMenuScale, showActions]","fix":{"range":[7938,7951],"text":"[actionMenuScale, showActions]"}}]},{"ruleId":"react-hooks/rules-of-hooks","severity":1,"message":"React Hook \"useEffect\" is called conditionally. React Hooks must be called in the exact same order in every component render.","line":262,"column":3,"nodeType":"Identifier","endLine":262,"endColumn":12},{"ruleId":"react-hooks/rules-of-hooks","severity":1,"message":"React Hook \"useAnimatedStyle\" is called conditionally. React Hooks must be called in the exact same order in every component render.","line":270,"column":23,"nodeType":"Identifier","endLine":270,"endColumn":39},{"ruleId":"react-hooks/rules-of-hooks","severity":1,"message":"React Hook \"useAnimatedStyle\" is called conditionally. React Hooks must be called in the exact same order in every component render.","line":282,"column":21,"nodeType":"Identifier","endLine":282,"endColumn":37},{"ruleId":"@typescript-eslint/no-explicit-any","severity":1,"message":"Unexpected any. Specify a different type.","line":285,"column":10,"nodeType":"TSAnyKeyword","messageId":"unexpectedAny","endLine":285,"endColumn":13,"suggestions":[{"messageId":"suggestUnknown","fix":{"range":[8586,8589],"text":"unknown"},"desc":"Use `unknown` instead, this will force you to explicitly, and safely assert the type is correct."},{"messageId":"suggestNever","fix":{"range":[8586,8589],"text":"never"},"desc":"Use `never` instead, this is useful when instantiating generic type parameters that you don't need to know the type of."}]},{"ruleId":"react-hooks/rules-of-hooks","severity":1,"message":"React Hook \"useMemo\" is called conditionally. React Hooks must be called in the exact same order in every component render.","line":288,"column":26,"nodeType":"Identifier","endLine":288,"endColumn":33},{"ruleId":"react-hooks/refs","severity":1,"message":"Error: Cannot access refs during render\n\nReact refs are values that are not needed for rendering. Refs should only be accessed outside of render, such as in event handlers or effects. Accessing a ref value (the `current` property) during render can cause your component not to update as expected (https://react.dev/reference/react/useRef).\n\nC:\\Users\\Naween\\projects\\polymath-platform\\packages\\ui\\src\\archive\\LotusPetalFAB.complex.tsx:303:11\n  301 |   return (\n  302 |     <Animated.View\n> 303 |       {...panResponder.panHandlers}\n      |           ^^^^^^^^^^^^^^^^^^^^^^^^ Cannot access ref value during render\n  304 |       style={containerStyle}\n  305 |       accessible={true}\n  306 |       accessibilityRole=\"image\" // The FAB itself is an image/button","line":303,"column":11,"nodeType":null,"endLine":303,"endColumn":35},{"ruleId":"react-native-a11y/has-valid-accessibility-ignores-invert-colors","severity":1,"message":"Found an element which will be inverted. Add the accessibilityIgnoresInvertColors prop","line":318,"column":9,"nodeType":"JSXElement","endLine":318,"endColumn":86},{"ruleId":"react-native-a11y/has-accessibility-hint","severity":1,"message":"has accessibilityLabel prop but no accessibilityHint","line":332,"column":13,"nodeType":"JSXOpeningElement","endLine":342,"endColumn":14}],"suppressedMessages":[],"errorCount":0,"fatalErrorCount":0,"warningCount":41,"fixableErrorCount":0,"fixableWarningCount":0,"source":"/**\n * LOTUS PETAL FAB - Floating Action Button\n *\n * A petal-shaped floating action button with:\n * - Golden Lotus Art image\n * - Breathing animation (4-second cycle)\n * - Context-aware icons per tab\n * - Press animation with haptic feedback\n * - Floating bubble physics for dragging\n *\n * Philosophy: Organic, living UI that breathes with intention\n */\n\nimport React, { FC, useMemo, useEffect, useCallback, useState, useRef } from 'react';\nimport { View, Pressable, StyleSheet, Text, PanResponder, Dimensions, Image } from 'react-native';\nimport Animated, {\n  useAnimatedStyle,\n  withRepeat,\n  withTiming,\n  withSequence,\n  withSpring,\n  interpolate,\n  SharedValue,\n  Extrapolate,\n  useSharedValue,\n  Easing,\n  runOnJS,\n} from 'react-native-reanimated';\nimport * as Haptics from 'expo-haptics';\nimport { Flower2, Plus, MessageCircle, Upload, Edit } from 'lucide-react-native';\nimport { Theme } from '../theme/Theme';\nimport { useAccessibility } from '../hooks/useAccessibility';\n\n// ============================================================================\n// TYPES\n// ============================================================================\n\ntype TabType = 'self' | 'classroom' | 'community' | 'library' | 'profile';\n\nexport interface ActionItem {\n  label: string;\n  onPress: () => void;\n  icon?: React.ComponentType<{ size: number; color: string; strokeWidth: number }>;\n}\n\ninterface LotusPetalFABProps {\n  currentTab?: TabType;\n  onPress?: () => void;\n  icon?: React.ReactNode;\n  actions?: ActionItem[];\n  scrollY?: SharedValue<number>;\n  disabled?: boolean;\n  bottomInset?: number; // New prop for safe area handling\n}\n\n// ============================================================================\n// CONSTANTS\n// ============================================================================\n\nconst FAB_SIZE = 72; // Slightly larger for the art\nconst FAB_HIT_SLOP = 10;\nconst ACTION_BUBBLE_SIZE = 48;\nconst ACTION_BUBBLE_SPACING = 12;\nconst LONG_PRESS_DURATION = 400; // milliseconds\nconst SCREEN_WIDTH = Dimensions.get('window').width;\n\n// Context-aware configuration\ntype IconComponentType = React.ComponentType<{ size: number; color: string; strokeWidth: number }>;\n\nconst fabConfig: Record<TabType, { IconComponent: IconComponentType; label: string }> = {\n  self: {\n    IconComponent: Flower2,\n    label: 'Log mood',\n  },\n  classroom: {\n    IconComponent: Plus,\n    label: 'Create lesson',\n  },\n  community: {\n    IconComponent: MessageCircle,\n    label: 'Post announcement',\n  },\n  library: {\n    IconComponent: Upload,\n    label: 'Upload resource',\n  },\n  profile: {\n    IconComponent: Edit,\n    label: 'Edit profile',\n  },\n};\n\nconst LOTUS_IMAGE = require('../../assets/images/lotus_bloom.png');\n\n// ============================================================================\n// MAIN COMPONENT\n// ============================================================================\n\nconst LotusPetalFAB: FC<LotusPetalFABProps> = ({\n  currentTab = 'self',\n  onPress,\n  icon,\n  actions,\n  scrollY,\n  disabled = true,\n  bottomInset = Theme.spacing.lg, // Default value if not provided\n}) => {\n  const { isReduceMotionEnabled, announce } = useAccessibility();\n\n  // TEMPORARY: Return null if disabled to completely hide the FAB\n  if (disabled) return null;\n\n  // Shared value for press animation\n  const pressScale = useSharedValue(1);\n  // Shared value for breathing animation\n  const breathingScale = useSharedValue(0.95);\n  // Position for dragging\n  const translateX = useSharedValue(0);\n  const translateY = useSharedValue(0);\n  // Base position accumulator\n  const baseX = useRef(0);\n  const baseY = useRef(0);\n  // State for showing action menu\n  const [showActions, setShowActions] = useState(false);\n  const actionMenuScale = useSharedValue(0);\n  // Track long press\n  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);\n  const [isDragging, setIsDragging] = useState(false);\n\n  // Memoize current configuration to avoid unnecessary recalculations\n  const config = useMemo(() => fabConfig[currentTab], [currentTab]);\n  const IconComponent = config.IconComponent;\n\n  // Safe haptic feedback wrapper\n  const triggerHaptic = useCallback(async () => {\n    try {\n      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);\n    } catch (error) {\n      console.warn('Haptic feedback not available');\n    }\n  }, []);\n\n  // Pan responder for drag functionality\n  const panResponder = useRef(\n    PanResponder.create({\n      onStartShouldSetPanResponder: () => true,\n      onMoveShouldSetPanResponder: (_, gestureState) => {\n        return isDragging || Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5;\n      },\n      onPanResponderGrant: () => {\n        longPressTimer.current = setTimeout(() => {\n          setIsDragging(true);\n          triggerHaptic();\n          // Slight lift effect\n          pressScale.value = withSpring(1.1);\n        }, LONG_PRESS_DURATION);\n      },\n      onPanResponderMove: (_, gestureState) => {\n        if (isDragging) {\n          translateX.value = baseX.current + gestureState.dx;\n          translateY.value = baseY.current + gestureState.dy;\n        }\n      },\n      onPanResponderRelease: (_, gestureState) => {\n        if (longPressTimer.current) {\n          clearTimeout(longPressTimer.current);\n          longPressTimer.current = null;\n        }\n\n        if (isDragging) {\n          baseX.current += gestureState.dx;\n          baseY.current += gestureState.dy;\n          setIsDragging(false);\n          // Spring back slightly on release (bubble effect)\n          pressScale.value = withSpring(1.0);\n\n          // Optional: Snap back if near edge? For now, free floating.\n        } else {\n          const moved = Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5;\n          if (!moved) {\n            handlePress();\n          }\n        }\n      },\n    }),\n  ).current;\n\n  // ============================================================================\n  // ANIMATION INITIALIZATION\n  // ============================================================================\n\n  useEffect(() => {\n    if (!disabled && !isReduceMotionEnabled) {\n      breathingScale.value = 0.95;\n      breathingScale.value = withRepeat(\n        withTiming(1.02, {\n          duration: 3000,\n          easing: Easing.inOut(Easing.ease),\n        }),\n        -1,\n        true,\n      );\n    } else {\n      breathingScale.value = withTiming(1.0, { duration: 200 });\n    }\n  }, [disabled, isReduceMotionEnabled]);\n\n  // ============================================================================\n  // ANIMATION STYLES\n  // ============================================================================\n\n  const breathingStyle = useAnimatedStyle(() => {\n    return {\n      transform: [{ scale: breathingScale.value }],\n    };\n  });\n\n  const pressStyle = useAnimatedStyle(() => {\n    return {\n      transform: [{ scale: pressScale.value }],\n    };\n  });\n\n  const handlePress = useCallback(() => {\n    if (disabled) return;\n\n    if (actions && actions.length > 0) {\n      triggerHaptic();\n      setShowActions(!showActions);\n      actionMenuScale.value = withSpring(showActions ? 0 : 1, {\n        damping: 15,\n        stiffness: 150,\n      });\n      announce(showActions ? 'Actions menu closed' : 'Actions menu opened');\n      return;\n    }\n\n    if (onPress) {\n      triggerHaptic();\n      pressScale.value = withSequence(\n        withTiming(0.85, { duration: 100 }),\n        withSpring(1.0, { damping: 12, stiffness: 200 }),\n      );\n      onPress();\n    }\n  }, [disabled, onPress, actions, showActions, triggerHaptic]);\n\n  const actionMenuStyle = useAnimatedStyle(() => {\n    return {\n      transform: [{ scale: actionMenuScale.value }, { translateY: -10 }], // Pop up slightly\n      opacity: actionMenuScale.value,\n    } as any;\n  });\n\n  useEffect(() => {\n    actionMenuScale.value = withSpring(showActions ? 1 : 0, {\n      damping: 15,\n      stiffness: 150,\n    });\n  }, [showActions]);\n\n  useEffect(() => {\n    return () => {\n      if (longPressTimer.current) {\n        clearTimeout(longPressTimer.current);\n      }\n    };\n  }, []);\n\n  const scrollStyle = useAnimatedStyle(() => {\n    if (!scrollY) return {};\n    return {\n      transform: [\n        {\n          translateY: interpolate(scrollY.value, [0, 100], [0, 100], Extrapolate.CLAMP),\n        },\n      ],\n      opacity: interpolate(scrollY.value, [0, 50, 100], [1, 0.5, 0], Extrapolate.CLAMP),\n    };\n  });\n\n  const dragStyle = useAnimatedStyle(() => {\n    return {\n      transform: [{ translateX: translateX.value }, { translateY: translateY.value }],\n    } as any;\n  });\n\n  const containerStyle = useMemo(\n    () => [\n      styles.container,\n      { bottom: bottomInset }, // Override bottom with prop\n      breathingStyle,\n      pressStyle,\n      scrollStyle,\n      dragStyle,\n      disabled && styles.disabled,\n    ],\n    [bottomInset, breathingStyle, pressStyle, scrollStyle, dragStyle, disabled],\n  );\n\n  return (\n    <Animated.View\n      {...panResponder.panHandlers}\n      style={containerStyle}\n      accessible={true}\n      accessibilityRole=\"image\" // The FAB itself is an image/button\n      accessibilityLabel={config.label}\n      accessibilityHint={actions && actions.length > 0 ? 'Double tap to view actions' : undefined}\n      accessibilityState={{ disabled, expanded: showActions }}\n      accessibilityActions={[{ name: 'activate', label: 'Activate' }]}\n      onAccessibilityAction={handlePress}\n    >\n      <View style={styles.contentContainer}>\n        {/* Glow Behind */}\n        <View style={styles.glow} />\n\n        {/* Lotus Image */}\n        <Image source={LOTUS_IMAGE} style={styles.lotusImage} resizeMode=\"contain\" />\n\n        {/* Optional Icon Overlay */}\n        {icon && (\n          <View style={styles.iconOverlay}>\n            <>{icon}</>\n          </View>\n        )}\n      </View>\n\n      {/* Action Menu */}\n      {actions && actions.length > 0 && (\n        <Animated.View style={[styles.actionMenu, actionMenuStyle]}>\n          {actions.map((action, index) => (\n            <Pressable\n              key={index}\n              style={styles.actionBubble}\n              onPress={() => {\n                triggerHaptic();\n                action.onPress();\n              }}\n              accessible={true}\n              accessibilityRole=\"button\"\n              accessibilityLabel={action.label}\n            >\n              <View style={styles.actionBubbleContent}>\n                {action.icon && (\n                  <action.icon size={18} color={Theme.colors.lotusDeepPink} strokeWidth={2} />\n                )}\n                <Text style={styles.actionLabel}>{action.label}</Text>\n              </View>\n            </Pressable>\n          ))}\n        </Animated.View>\n      )}\n    </Animated.View>\n  );\n};\n\n// ============================================================================\n// STYLES\n// ============================================================================\n\nconst styles = StyleSheet.create({\n  container: {\n    position: 'absolute',\n    // bottom set dynamically\n    right: Theme.spacing.lg,\n    zIndex: Theme.zIndex.fab,\n    alignItems: 'center',\n    justifyContent: 'center',\n  },\n  contentContainer: {\n    width: FAB_SIZE,\n    height: FAB_SIZE,\n    alignItems: 'center',\n    justifyContent: 'center',\n  },\n  lotusImage: {\n    width: '100%',\n    height: '100%',\n    zIndex: 2,\n    backgroundColor: 'transparent',\n  },\n  iconOverlay: {\n    position: 'absolute',\n    zIndex: 3,\n    alignItems: 'center',\n    justifyContent: 'center',\n  },\n  glow: {\n    position: 'absolute',\n    width: FAB_SIZE * 0.8,\n    height: FAB_SIZE * 0.8,\n    borderRadius: FAB_SIZE,\n    backgroundColor: Theme.colors.sanctuarySaffron,\n    opacity: 0.4,\n    shadowColor: Theme.colors.sanctuarySaffron,\n    shadowOffset: { width: 0, height: 0 },\n    shadowOpacity: 0.8,\n    shadowRadius: 20,\n    elevation: 10,\n    zIndex: 1,\n  },\n  disabled: {\n    opacity: 0.5,\n  },\n  actionMenu: {\n    position: 'absolute',\n    bottom: FAB_SIZE + ACTION_BUBBLE_SPACING,\n    right: 0,\n    alignItems: 'flex-end',\n  },\n  actionBubble: {\n    backgroundColor: Theme.colors.ink,\n    borderRadius: 24,\n    marginBottom: ACTION_BUBBLE_SPACING,\n    paddingHorizontal: 16,\n    paddingVertical: 10,\n    ...Theme.shadows.md,\n    minWidth: 100,\n    borderColor: 'rgba(255,255,255,0.1)',\n    borderWidth: 1,\n  },\n  actionBubbleContent: {\n    flexDirection: 'row',\n    alignItems: 'center',\n    justifyContent: 'flex-end',\n    gap: 8,\n  },\n  actionLabel: {\n    color: Theme.colors.sacredWhite,\n    fontSize: 14,\n    fontWeight: '600',\n  },\n});\n\nexport default LotusPetalFAB;\n","usedDeprecatedRules":[]},{"filePath":"C:\\Users\\Naween\\projects\\polymath-platform\\packages\\ui\\src\\button.tsx","messages":[],"suppressedMessages":[],"errorCount":0,"fatalErrorCount":0,"warningCount":0,"fixableErrorCount":0,"fixableWarningCount":0,"usedDeprecatedRules":[]},{"filePath":"C:\\Users\\Naween\\projects\\polymath-platform\\packages\\ui\\src\\card.tsx","messages":[],"suppressedMessages":[],"errorCount":0,"fatalErrorCount":0,"warningCount":0,"fixableErrorCount":0,"fixableWarningCount":0,"usedDeprecatedRules":[]},{"filePath":"C:\\Users\\Naween\\projects\\polymath-platform\\packages\\ui\\src\\code.tsx","messages":[],"suppressedMessages":[],"errorCount":0,"fatalErrorCount":0,"warningCount":0,"fixableErrorCount":0,"fixableWarningCount":0,"usedDeprecatedRules":[]},{"filePath":"C:\\Users\\Naween\\projects\\polymath-platform\\packages\\ui\\src\\components-legacy\\box\\index.tsx","messages":[{"ruleId":"@typescript-eslint/no-explicit-any","severity":1,"message":"Unexpected any. Specify a different type.","line":18,"column":35,"nodeType":"TSAnyKeyword","messageId":"unexpectedAny","endLine":18,"endColumn":38,"suggestions":[{"messageId":"suggestUnknown","fix":{"range":[407,410],"text":"unknown"},"desc":"Use `unknown` instead, this will force you to explicitly, and safely assert the type is correct."},{"messageId":"suggestNever","fix":{"range":[407,410],"text":"never"},"desc":"Use `never` instead, this is useful when instantiating generic type parameters that you don't need to know the type of."}]}],"suppressedMessages":[],"errorCount":0,"fatalErrorCount":0,"warningCount":1,"fixableErrorCount":0,"fixableWarningCount":0,"source":"import React from 'react';\nimport { View, type ViewProps } from 'react-native';\nimport { cssInterop } from 'nativewind';\n\nconst StyledView = View;\n\ncssInterop(StyledView, {\n  className: {\n    target: 'style',\n  },\n});\n\nexport interface IBoxProps extends ViewProps {\n  className?: string;\n}\n\nconst Box = React.forwardRef<View, IBoxProps>(({ className, ...props }, ref) => {\n  const Component = StyledView as any;\n  return <Component {...props} ref={ref} className={className} />;\n});\n\nBox.displayName = 'Box';\n\nexport { Box };\n","usedDeprecatedRules":[]},{"filePath":"C:\\Users\\Naween\\projects\\polymath-platform\\packages\\ui\\src\\components-legacy\\button\\index.tsx","messages":[{"ruleId":"@typescript-eslint/no-explicit-any","severity":1,"message":"Unexpected any. Specify a different type.","line":18,"column":33,"nodeType":"TSAnyKeyword","messageId":"unexpectedAny","endLine":18,"endColumn":36,"suggestions":[{"messageId":"suggestUnknown","fix":{"range":[439,442],"text":"unknown"},"desc":"Use `unknown` instead, this will force you to explicitly, and safely assert the type is correct."},{"messageId":"suggestNever","fix":{"range":[439,442],"text":"never"},"desc":"Use `never` instead, this is useful when instantiating generic type parameters that you don't need to know the type of."}]},{"ruleId":"@typescript-eslint/no-explicit-any","severity":1,"message":"Unexpected any. Specify a different type.","line":19,"column":45,"nodeType":"TSAnyKeyword","messageId":"unexpectedAny","endLine":19,"endColumn":48,"suggestions":[{"messageId":"suggestUnknown","fix":{"range":[488,491],"text":"unknown"},"desc":"Use `unknown` instead, this will force you to explicitly, and safely assert the type is correct."},{"messageId":"suggestNever","fix":{"range":[488,491],"text":"never"},"desc":"Use `never` instead, this is useful when instantiating generic type parameters that you don't need to know the type of."}]},{"ruleId":"@typescript-eslint/no-explicit-any","severity":1,"message":"Unexpected any. Specify a different type.","line":20,"column":41,"nodeType":"TSAnyKeyword","messageId":"unexpectedAny","endLine":20,"endColumn":44,"suggestions":[{"messageId":"suggestUnknown","fix":{"range":[533,536],"text":"unknown"},"desc":"Use `unknown` instead, this will force you to explicitly, and safely assert the type is correct."},{"messageId":"suggestNever","fix":{"range":[533,536],"text":"never"},"desc":"Use `never` instead, this is useful when instantiating generic type parameters that you don't need to know the type of."}]},{"ruleId":"@typescript-eslint/no-explicit-any","severity":1,"message":"Unexpected any. Specify a different type.","line":29,"column":33,"nodeType":"TSAnyKeyword","messageId":"unexpectedAny","endLine":29,"endColumn":36,"suggestions":[{"messageId":"suggestUnknown","fix":{"range":[753,756],"text":"unknown"},"desc":"Use `unknown` instead, this will force you to explicitly, and safely assert the type is correct."},{"messageId":"suggestNever","fix":{"range":[753,756],"text":"never"},"desc":"Use `never` instead, this is useful when instantiating generic type parameters that you don't need to know the type of."}]},{"ruleId":"@typescript-eslint/no-unused-vars","severity":1,"message":"'variant' is assigned a value but never used.","line":30,"column":17,"nodeType":"Identifier","messageId":"unusedVar","endLine":30,"endColumn":24},{"ruleId":"@typescript-eslint/no-unused-vars","severity":1,"message":"'size' is assigned a value but never used.","line":30,"column":36,"nodeType":"Identifier","messageId":"unusedVar","endLine":30,"endColumn":40}],"suppressedMessages":[],"errorCount":0,"fatalErrorCount":0,"warningCount":6,"fixableErrorCount":0,"fixableWarningCount":0,"source":"import React from 'react';\nimport {\n  Pressable as RNPressable,\n  Text as RNText,\n  type PressableProps,\n  type TextProps,\n  View as BaseView,\n  ScrollView as BaseScrollView,\n} from 'react-native';\nimport { cssInterop } from 'nativewind';\n\nconst StyledPressable = RNPressable;\nconst StyledText = RNText;\n\ncssInterop(StyledPressable, { className: 'style' });\ncssInterop(StyledText, { className: 'style' });\n\nexport const View = BaseView as any;\nexport const ScrollView = BaseScrollView as any;\nexport const Pressable = RNPressable as any;\n\nexport interface IButtonProps extends PressableProps {\n  className?: string;\n  variant?: 'solid' | 'outline' | 'link';\n  size?: 'xs' | 'sm' | 'md' | 'lg';\n  isDisabled?: boolean;\n}\n\nconst Button = React.forwardRef<any, IButtonProps>(\n  ({ className, variant = 'solid', size = 'md', isDisabled, ...props }, ref) => {\n    return (\n      <StyledPressable\n        {...props}\n        ref={ref}\n        disabled={isDisabled}\n        className={`flex-row items-center justify-center rounded-comfortable ${className || ''}`}\n      />\n    );\n  },\n);\n\nexport interface IButtonTextProps extends TextProps {\n  className?: string;\n}\n\nconst ButtonText = React.forwardRef<RNText, IButtonTextProps>(({ className, ...props }, ref) => {\n  return (\n    <StyledText {...props} ref={ref} className={`font-medium text-inherit ${className || ''}`} />\n  );\n});\n\nButton.displayName = 'Button';\nButtonText.displayName = 'ButtonText';\n\nexport { Button, ButtonText };\n","usedDeprecatedRules":[]},{"filePath":"C:\\Users\\Naween\\projects\\polymath-platform\\packages\\ui\\src\\components-legacy\\center\\index.tsx","messages":[{"ruleId":"@typescript-eslint/no-explicit-any","severity":1,"message":"Unexpected any. Specify a different type.","line":18,"column":35,"nodeType":"TSAnyKeyword","messageId":"unexpectedAny","endLine":18,"endColumn":38,"suggestions":[{"messageId":"suggestUnknown","fix":{"range":[416,419],"text":"unknown"},"desc":"Use `unknown` instead, this will force you to explicitly, and safely assert the type is correct."},{"messageId":"suggestNever","fix":{"range":[416,419],"text":"never"},"desc":"Use `never` instead, this is useful when instantiating generic type parameters that you don't need to know the type of."}]}],"suppressedMessages":[],"errorCount":0,"fatalErrorCount":0,"warningCount":1,"fixableErrorCount":0,"fixableWarningCount":0,"source":"import React from 'react';\nimport { View, type ViewProps } from 'react-native';\nimport { cssInterop } from 'nativewind';\n\nconst StyledView = View;\n\ncssInterop(StyledView, {\n  className: {\n    target: 'style',\n  },\n});\n\nexport interface ICenterProps extends ViewProps {\n  className?: string;\n}\n\nconst Center = React.forwardRef<View, ICenterProps>(({ className, ...props }, ref) => {\n  const Component = StyledView as any;\n  return (\n    <Component {...props} ref={ref} className={`items-center justify-center ${className || ''}`} />\n  );\n});\n\nCenter.displayName = 'Center';\n\nexport { Center };\n","usedDeprecatedRules":[]},{"filePath":"C:\\Users\\Naween\\projects\\polymath-platform\\packages\\ui\\src\\components-legacy\\divider\\index.tsx","messages":[{"ruleId":"react/display-name","severity":1,"message":"Component definition is missing display name","line":14,"column":24,"nodeType":"CallExpression","messageId":"noDisplayName","endLine":18,"endColumn":2}],"suppressedMessages":[],"errorCount":0,"fatalErrorCount":0,"warningCount":1,"fixableErrorCount":0,"fixableWarningCount":0,"source":"import React from 'react';\nimport {\n  Text as RNText,\n  View,\n  ActivityIndicator,\n  type TextProps,\n  type ViewProps,\n  type ActivityIndicatorProps,\n} from 'react-native';\nimport { cssInterop } from 'nativewind';\n\ncssInterop(ActivityIndicator, { className: 'style' });\n\nexport const Heading = React.forwardRef<RNText, TextProps & { className?: string }>(\n  ({ className, ...props }, ref) => (\n    <RNText {...props} ref={ref} className={`font-bold text-xl ${className || ''}`} />\n  ),\n);\n\nexport const Divider = ({ className, ...props }: ViewProps & { className?: string }) => (\n  <View {...props} className={`h-[1px] w-full bg-border ${className || ''}`} />\n);\n\nexport const Spinner = ({\n  className,\n  ...props\n}: ActivityIndicatorProps & { className?: string }) => (\n  <ActivityIndicator {...props} className={className} />\n);\n","usedDeprecatedRules":[]},{"filePath":"C:\\Users\\Naween\\projects\\polymath-platform\\packages\\ui\\src\\components-legacy\\form-control\\index.tsx","messages":[{"ruleId":"@typescript-eslint/no-explicit-any","severity":1,"message":"Unexpected any. Specify a different type.","line":59,"column":86,"nodeType":"TSAnyKeyword","messageId":"unexpectedAny","endLine":59,"endColumn":89,"suggestions":[{"messageId":"suggestUnknown","fix":{"range":[1817,1820],"text":"unknown"},"desc":"Use `unknown` instead, this will force you to explicitly, and safely assert the type is correct."},{"messageId":"suggestNever","fix":{"range":[1817,1820],"text":"never"},"desc":"Use `never` instead, this is useful when instantiating generic type parameters that you don't need to know the type of."}]}],"suppressedMessages":[],"errorCount":0,"fatalErrorCount":0,"warningCount":1,"fixableErrorCount":0,"fixableWarningCount":0,"source":"import React, { createContext, useContext } from 'react';\nimport { View, Text as RNText, type ViewProps, type TextProps } from 'react-native';\nimport { cssInterop } from 'nativewind';\n\ncssInterop(View, { className: 'style' });\ncssInterop(RNText, { className: 'style' });\n\nexport interface IFormControlProps extends ViewProps {\n  isInvalid?: boolean;\n  isDisabled?: boolean;\n  className?: string;\n  children?: React.ReactNode;\n}\n\ntype FormControlContextType = Pick<IFormControlProps, 'isInvalid' | 'isDisabled'>;\n\nconst FormControlContext = createContext<FormControlContextType>({});\n\nexport const FormControl = ({\n  isInvalid,\n  isDisabled,\n  className,\n  children,\n  ...props\n}: ViewProps & {\n  isInvalid?: boolean;\n  isDisabled?: boolean;\n  className?: string;\n  children?: React.ReactNode;\n}) => {\n  return (\n    <FormControlContext.Provider value={{ isInvalid, isDisabled }}>\n      <View {...props} className={`w-full ${className || ''}`}>\n        {children}\n      </View>\n    </FormControlContext.Provider>\n  );\n};\n\nexport const useFormControl = () => useContext(FormControlContext);\n\nexport const FormControlLabel = ({ className, ...props }: ViewProps & { className?: string }) => (\n  <View {...props} className={`mb-2 ${className || ''}`} />\n);\n\nexport const FormControlLabelText = ({\n  className,\n  ...props\n}: TextProps & { className?: string }) => (\n  <RNText {...props} className={`text-sm font-medium text-textSecondary ${className || ''}`} />\n);\n\nexport const FormControlError = ({ className, ...props }: ViewProps & { className?: string }) => {\n  const { isInvalid } = useFormControl();\n  if (!isInvalid) return null;\n  return <View {...props} className={`mt-1 flex-row items-center gap-1 ${className || ''}`} />;\n};\n\nexport const FormControlErrorIcon = ({ as: Icon, className, color, size, ...props }: any) => {\n  const { isInvalid } = useFormControl();\n  if (!isInvalid || !Icon) return null;\n  return <Icon {...props} size={size || 16} color={color || '#EF4444'} className={className} />;\n};\n\nexport const FormControlErrorText = ({\n  className,\n  ...props\n}: TextProps & { className?: string }) => (\n  <RNText {...props} className={`text-xs text-error ${className || ''}`} />\n);\n\nexport const FormControlHelper = ({ className, ...props }: ViewProps & { className?: string }) => (\n  <View {...props} className={`mt-1 ${className || ''}`} />\n);\n\nexport const FormControlHelperText = ({\n  className,\n  ...props\n}: TextProps & { className?: string }) => (\n  <RNText {...props} className={`mt-1 text-xs text-textSecondary ${className || ''}`} />\n);\n","usedDeprecatedRules":[]},{"filePath":"C:\\Users\\Naween\\projects\\polymath-platform\\packages\\ui\\src\\components-legacy\\hstack\\index.tsx","messages":[{"ruleId":"@typescript-eslint/no-explicit-any","severity":1,"message":"Unexpected any. Specify a different type.","line":24,"column":37,"nodeType":"TSAnyKeyword","messageId":"unexpectedAny","endLine":24,"endColumn":40,"suggestions":[{"messageId":"suggestUnknown","fix":{"range":[627,630],"text":"unknown"},"desc":"Use `unknown` instead, this will force you to explicitly, and safely assert the type is correct."},{"messageId":"suggestNever","fix":{"range":[627,630],"text":"never"},"desc":"Use `never` instead, this is useful when instantiating generic type parameters that you don't need to know the type of."}]}],"suppressedMessages":[],"errorCount":0,"fatalErrorCount":0,"warningCount":1,"fixableErrorCount":0,"fixableWarningCount":0,"source":"import React from 'react';\nimport { View, type ViewProps } from 'react-native';\nimport { cssInterop } from 'nativewind';\n\nconst StyledView = View;\n\ncssInterop(StyledView, {\n  className: {\n    target: 'style',\n  },\n});\n\nexport interface IHStackProps extends ViewProps {\n  className?: string;\n  space?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';\n  reversed?: boolean;\n}\n\nconst HStack = React.forwardRef<View, IHStackProps>(\n  ({ className, space, reversed, ...props }, ref) => {\n    const spaceClass = space ? `gap-${space}` : '';\n    const reversedClass = reversed ? 'flex-row-reverse' : 'flex-row';\n\n    const Component = StyledView as any;\n\n    return (\n      <Component\n        {...props}\n        ref={ref}\n        className={`${reversedClass} items-center ${spaceClass} ${classNa

 ERROR  @repo/database#lint:biome: command (C:\Users\Naween\projects\polymath-platform\packages\database) C:\Users\Naween\AppData\Roaming\npm\pnpm.cmd run lint:biome exited (1)


 Tasks:    2 successful, 26 total
Cached:    0 cached, 26 total
  Time:    5.885s 
Failed:    @repo/database#lint:biome


 ERROR  run failed: command  exited (1)

 ELIFECYCLE  Command failed with exit code 1.


> polymath-platform@1.0.0 check-types C:\Users\Naween\projects\polymath-platform
> node scripts/sovereign-audit.mjs --cmd "pnpm turbo run check-types" --log "reports/check-types.txt"


>>> Starting Sovereign Audit: 2026-05-22T09:14:03.132Z

>>> Command: pnpm turbo run check-types
--------------------------------------------------------------------------------

• turbo 2.9.14


   • Packages in scope: @intuitui-labs/form-builder-engine, @intuitui-labs/lk-edu-geo, @repo/accounting, @repo/admin, @repo/ai, @repo/analytics, @repo/classroom, @repo/community, @repo/core, @repo/database, @repo/eslint-config, @repo/form-builder, @repo/graphics, @repo/library, @repo/payments, @repo/people, @repo/platform-mcp, @repo/policies, @repo/profile, @repo/sanctuary-api, @repo/scanner-kit, @repo/schema, @repo/self, @repo/types-shim, @repo/typescript-config, @repo/ui, @repo/workforce, apps-edlove-web, apps-gurudevi-marketing-web, apps-intuitui-web, apps-neevsk-web, gurudevi-mobile

   • Running check-types in 32 packages
   • Remote caching disabled


apps-edlove-web:check-types: cache miss, executing fe1f3ec34b838742

apps-neevsk-web:check-types: cache miss, executing d0326f983c3f4903

apps-intuitui-web:check-types: cache miss, executing 7d2fbed64abd87f8

@repo/types-shim:check-types: cache hit, replaying logs 7bd795a12fe05cd3
@repo/schema:check-types: cache hit, replaying logs ae15028e90be5544

@intuitui-labs/form-builder-engine:check-types: cache hit, replaying logs b52cffe56a9e51fb
@repo/platform-mcp:check-types: cache hit, replaying logs 382d112d0ac5e383

@repo/platform-mcp:check-types: 

@repo/platform-mcp:check-types: > @repo/platform-mcp@0.1.0 check-types C:\Users\Naween\projects\polymath-platform\packages\platform-mcp
@repo/platform-mcp:check-types: > pnpm exec tsc --noEmit
@repo/platform-mcp:check-types: 
@repo/schema:check-types: 
@repo/schema:check-types: > @repo/schema@1.0.1 check-types C:\Users\Naween\projects\polymath-platform\packages\schema
@repo/schema:check-types: > pnpm exec tsc --noEmit
@repo/schema:check-types: 
@repo/types-shim:check-types: 
@repo/types-shim:check-types: > @repo/types-shim@0.0.2 check-types C:\Users\Naween\projects\polymath-platform\packages\types-shim
@repo/types-shim:check-types: > pnpm exec tsc --noEmit
@repo/types-shim:check-types: 

@intuitui-labs/form-builder-engine:check-types: 
@intuitui-labs/form-builder-engine:check-types: > @intuitui-labs/form-builder-engine@1.0.0 check-types C:\Users\Naween\projects\polymath-platform\packages\form-builder-engine
@intuitui-labs/form-builder-engine:check-types: > tsc --noEmit
@intuitui-labs/form-builder-engine:check-types: 

@repo/database:check-types: cache hit, replaying logs b572f94fb66b3c65

@repo/database:check-types: 
@repo/database:check-types: > @repo/database@1.0.1 check-types C:\Users\Naween\projects\polymath-platform\packages\database
@repo/database:check-types: > pnpm exec tsc --noEmit
@repo/database:check-types: 

@repo/core:check-types: cache miss, executing a41b7d9055cc6303

apps-neevsk-web:check-types: 
apps-neevsk-web:check-types: > apps-neevsk-web@0.0.2 check-types C:\Users\Naween\projects\polymath-platform\apps\neevsk-web
apps-neevsk-web:check-types: > pnpm exec tsc --noEmit
apps-neevsk-web:check-types: 

apps-intuitui-web:check-types: 
apps-intuitui-web:check-types: > apps-intuitui-web@0.0.2 check-types C:\Users\Naween\projects\polymath-platform\apps\intuitui-web
apps-intuitui-web:check-types: > pnpm exec tsc --noEmit
apps-intuitui-web:check-types: 

apps-edlove-web:check-types: 
apps-edlove-web:check-types: > apps-edlove-web@0.0.2 check-types C:\Users\Naween\projects\polymath-platform\apps\edlove-web
apps-edlove-web:check-types: > pnpm exec tsc --noEmit
apps-edlove-web:check-types: 

@repo/core:check-types: 
@repo/core:check-types: > @repo/core@0.1.0 check-types C:\Users\Naween\projects\polymath-platform\packages\core
@repo/core:check-types: > pnpm exec tsc --noEmit
@repo/core:check-types: 

@repo/ui:check-types: cache miss, executing 1707f8fe2ad629d9

@intuitui-labs/lk-edu-geo:check-types: cache miss, executing 8dae20ead1d70d7c

@repo/accounting:check-types: cache miss, executing 3555351cf8fdc263

@repo/accounting:check-types: 

@repo/accounting:check-types: > @repo/accounting@0.0.2 check-types C:\Users\Naween\projects\polymath-platform\packages\accounting
@repo/accounting:check-types: > pnpm exec tsc --noEmit
@repo/accounting:check-types: 

@repo/ui:check-types: 
@repo/ui:check-types: > @repo/ui@1.1.0 check-types C:\Users\Naween\projects\polymath-platform\packages\ui
@repo/ui:check-types: > pnpm exec tsc --noEmit
@repo/ui:check-types: 

@intuitui-labs/lk-edu-geo:check-types: 
@intuitui-labs/lk-edu-geo:check-types: > @intuitui-labs/lk-edu-geo@1.0.1 check-types C:\Users\Naween\projects\polymath-platform\packages\lk-edu-geo
@intuitui-labs/lk-edu-geo:check-types: > pnpm exec tsc --noEmit
@intuitui-labs/lk-edu-geo:check-types: 

@repo/payments:check-types: cache miss, executing 86c6ab4db94f37f5

@repo/payments:check-types: 
@repo/payments:check-types: > @repo/payments@0.0.2 check-types C:\Users\Naween\projects\polymath-platform\packages\payments
@repo/payments:check-types: > pnpm exec tsc --noEmit
@repo/payments:check-types: 

@repo/ai:check-types: cache miss, executing 7d224375060a040f

@repo/graphics:check-types: cache miss, executing 0a1998e4366e3dc5
@repo/people:check-types: cache miss, executing 293851306f0e46a7

@repo/scanner-kit:check-types: cache miss, executing 875b5c831a2f26a3

@repo/workforce:check-types: cache miss, executing c6e1dbef2ae2f661

@repo/form-builder:check-types: cache miss, executing 474802bfdd623ee7

@repo/scanner-kit:check-types: 
@repo/scanner-kit:check-types: > @repo/scanner-kit@0.0.1 check-types C:\Users\Naween\projects\polymath-platform\packages\scanner-kit
@repo/scanner-kit:check-types: > pnpm exec tsc --noEmit
@repo/scanner-kit:check-types: 

@repo/people:check-types: 

@repo/people:check-types: > @repo/people@0.0.2 check-types C:\Users\Naween\projects\polymath-platform\packages\people
@repo/people:check-types: > pnpm exec tsc --noEmit
@repo/people:check-types: 
@repo/form-builder:check-types: 
@repo/form-builder:check-types: > @repo/form-builder@1.0.1 check-types C:\Users\Naween\projects\polymath-platform\packages\form-builder
@repo/form-builder:check-types: > pnpm exec tsc --noEmit
@repo/form-builder:check-types: 

@repo/graphics:check-types: 
@repo/graphics:check-types: > @repo/graphics@0.0.2 check-types C:\Users\Naween\projects\polymath-platform\packages\graphics
@repo/graphics:check-types: > pnpm exec tsc --noEmit
@repo/graphics:check-types: 

@repo/workforce:check-types: 
@repo/workforce:check-types: > @repo/workforce@0.0.2 check-types C:\Users\Naween\projects\polymath-platform\packages\workforce
@repo/workforce:check-types: > pnpm exec tsc --noEmit
@repo/workforce:check-types: 

@repo/ai:check-types: 
@repo/ai:check-types: > @repo/ai@1.0.0 check-types C:\Users\Naween\projects\polymath-platform\packages\ai
@repo/ai:check-types: > pnpm exec tsc --noEmit
@repo/ai:check-types: 

@repo/profile:check-types: cache miss, executing 6ddfe3760b0ff704

@repo/profile:check-types: 
@repo/profile:check-types: > @repo/profile@1.0.0 check-types C:\Users\Naween\projects\polymath-platform\packages\profile
@repo/profile:check-types: > pnpm exec tsc --noEmit
@repo/profile:check-types: 

@repo/analytics:check-types: cache miss, executing 26ad671b9e954fdd

@repo/library:check-types: cache miss, executing a28d6a5ae5caf6c8

@repo/analytics:check-types: 
@repo/analytics:check-types: > @repo/analytics@1.0.0 check-types C:\Users\Naween\projects\polymath-platform\packages\analytics
@repo/analytics:check-types: > pnpm exec tsc --noEmit
@repo/analytics:check-types: 

@repo/library:check-types: 
@repo/library:check-types: > @repo/library@1.0.0 check-types C:\Users\Naween\projects\polymath-platform\packages\library
@repo/library:check-types: > pnpm exec tsc --noEmit
@repo/library:check-types: 

@repo/self:check-types: cache miss, executing 89e4e9900f3a250b

apps-gurudevi-marketing-web:check-types: cache miss, executing 9264b48128397d70

@repo/self:check-types: 
@repo/self:check-types: > @repo/self@1.0.0 check-types C:\Users\Naween\projects\polymath-platform\packages\self
@repo/self:check-types: > pnpm exec tsc --noEmit
@repo/self:check-types: 

apps-gurudevi-marketing-web:check-types: 
apps-gurudevi-marketing-web:check-types: > apps-gurudevi-marketing-web@0.0.2 check-types C:\Users\Naween\projects\polymath-platform\apps\gurudevi-marketingWeb
apps-gurudevi-marketing-web:check-types: > pnpm exec tsc --noEmit
apps-gurudevi-marketing-web:check-types: 

@repo/community:check-types: cache miss, executing 754ebb86ddbaef25

@repo/community:check-types: 
@repo/community:check-types: > @repo/community@1.0.0 check-types C:\Users\Naween\projects\polymath-platform\packages\community
@repo/community:check-types: > pnpm exec tsc --noEmit
@repo/community:check-types: 

@repo/admin:check-types: cache miss, executing 530f185bd45f3f2e

@repo/admin:check-types: 
@repo/admin:check-types: > @repo/admin@0.0.2 check-types C:\Users\Naween\projects\polymath-platform\packages\admin
@repo/admin:check-types: > pnpm exec tsc --noEmit
@repo/admin:check-types: 

@repo/classroom:check-types: cache miss, executing 805b323cb3df6e4a

@repo/classroom:check-types: 
@repo/classroom:check-types: > @repo/classroom@0.0.2 check-types C:\Users\Naween\projects\polymath-platform\packages\classroom
@repo/classroom:check-types: > pnpm exec tsc --noEmit
@repo/classroom:check-types: 

gurudevi-mobile:check-types: cache miss, executing 47dd44beaf0207e6

gurudevi-mobile:check-types: 
gurudevi-mobile:check-types: > gurudevi-mobile@1.1.0 check-types C:\Users\Naween\projects\polymath-platform\apps\gurudevi-mobile
gurudevi-mobile:check-types: > pnpm exec tsc --noEmit
gurudevi-mobile:check-types: 


 Tasks:    28 successful, 28 total
Cached:    5 cached, 28 total
  Time:    4m3.82s 



--------------------------------------------------------------------------------

AUDIT SUMMARY
Duration: 245.9s
Findings: 0
Log File: reports/check-types.txt
--------------------------------------------------------------------------------


> polymath-platform@1.0.0 check:hygiene C:\Users\Naween\projects\polymath-platform
> node ./scripts/check-hygiene.mjs



>>> Starting Unified Hygiene Audit <<<


--- Checking Circular Dependencies ---


> polymath-platform@1.0.0 check:circular C:\Users\Naween\projects\polymath-platform
> node scripts/sovereign-audit.mjs --cmd "pnpm exec depcruise packages apps --config .dependency-cruiser.cjs --output-type err" --filter "no-circular" --log "reports/circular_deps.txt"


>>> Starting Sovereign Audit: 2026-05-22T09:18:10.652Z

>>> Command: pnpm exec depcruise packages apps --config .dependency-cruiser.cjs --output-type err
>>> Filter: no-circular
--------------------------------------------------------------------------------


  warn no-orphans: packages/ui/src/utils/shareAction.web.ts
  warn no-orphans: packages/ui/src/utils/SanctuaryLocation.web.ts
  warn no-orphans: packages/ui/src/utils/haptics.web.ts
  warn no-orphans: packages/ui/src/utils/dialogs.web.ts
  warn no-orphans: packages/ui/src/components/ui/list/index.tsx
  warn no-orphans: packages/ui/src/components/SkeletonLoader.web.tsx
  warn no-orphans: packages/ui/src/components-native/NoiseOverlay.web.tsx
  warn no-orphans: packages/ui/src/code.tsx
  warn no-orp
hans: packages/ui/src/button.tsx
  warn no-orphans: packages/trube-art/src/native/renderers/SoulLibrary.ts
  warn no-orphans: packages/scanner-kit/src/ScannerModal.web.tsx
  warn no-orphans: packages/lk-edu-geo/src/constants.ts
  warn no-orphans: packages/library/src/components/LibraryThumbnailCard.web.tsx
  warn no-orphans: packages/library/src/api/database.web.ts
  warn no-orphans: packages/core/src/utils/temporal.ts
  warn no-orphans: packages/core/src/utils/idempotency.ts
  warn no-orphans: packages/core/src/native/sentry.ts
  warn no-orphans: packages/core/src/logic/forms/dynamic-loader.ts
  warn no-orphans: packages/core/src/logic/forms/analytics.ts
  warn no-orphans: packages/core/src/hooks/useSovereignEffect.ts
  warn no-orphans: packages/core/src/hooks/useMediaDownloader.web.ts
  warn no-orphans: packages/core/src/api/growthSignals.generated.zod.ts
  warn no-orphans: packages/analytics/src/utils/analyticsHelpers.ts
  warn no-orphans: packages/analytics/src/types/AnalyticsTypes.ts
  warn no-orphans: packages/analytics/src/engine/PostHogAnalytics.web.ts
  warn no-orphans: packages/analytics/src/engine/PostHogAnalytics.ts
  warn no-orphans: packages/analytics/src/engine/PostHogAnalytics.native.ts
  warn no-orphans: packages/analytics/src/engine/PostHogAnalytics.native.js
  warn no-orphans: packages/analytics/src/context/ActivityPulseContext.tsx
  warn no-orphans: packages/admin/src/screens/principal/types.ts
  warn no-orphans: packages/admin/src/screens/index.ts
  warn no-orphans: apps/neevsk-web/src/scripts/theme-switcher.ts
  warn no-orphans: apps/neevsk-web/src/scripts/scroll-to-top.ts
  warn no-orphans: apps/neevsk-web/src/scripts/creative-signatures.ts
  warn no-orphans: apps/neevsk-web/src/scripts/animations.ts
  warn no-orphans: apps/neevsk-web/.astro/content-modules.mjs
  warn no-orphans: apps/neevsk-web/.astro/content-assets.mjs
  warn no-orphans: apps/intuitui-web/.astro/content-modules.mjs
  warn no-orphans: apps/intuitui-web/.astro/content-assets.mjs
  warn no-orphans: apps/gurudevi-mobile/src/utils/validators.ts
  warn no-orphans: apps/gurudevi-mobile/src/utils/usePWAInstallPrompt.ts
  warn no-orphans: apps/gurudevi-mobile/src/lib/backgroundSync.web.ts
  warn no-orphans: apps/gurudevi-mobile/src/components/web/WebSkeleton.web.tsx
  warn no-orphans: apps/gurudevi-mobile/src/components/web/WebSkeleton.tsx
  warn no-orphans: apps/gurudevi-mobile/src/components/web/WebScreenShimmer.web.tsx
  warn no-orphans: apps/gurudevi-mobile/src/components/web/SanctuaryTabBar.web.tsx
  warn no-orphans: apps/gurudevi-mobile/src/components/web/SanctuaryTabBar.tsx
  warn no-orphans: apps/gurudevi-mobile/src/components/RedirectToApp.tsx
  warn no-orphans: apps/gurudevi-mobile/plugins/withSentryGradleDisabled.js
  warn no-orphans: apps/gurudevi-mobile/plugins/withGradleProperties.js
  warn no-orphans: apps/gurudevi-mobile/plugins/withAndroidCruncherDisabled.js
  warn no-orphans: apps/gurudevi-mobile/jest-setup.ts
  warn no-orphans: apps/gurudevi-mobile/__mocks__/react-native-reanimated.js
  warn no-orphans: apps/gurudevi-mobile/__mocks__/gluestack-themed.js
  warn no-orphans: apps/gurudevi-mobile/__mocks__/expo-image-picker.js
  warn no-orphans: apps/gurudevi-mobile/__mocks__/expo-camera.js
  warn no-orphans: apps/gurudevi-mobile/__mocks__/EnvironmentContext.js
  warn no-orphans: apps/gurudevi-mobile/__mocks__/@shopify/react-native-skia.js
  warn no-orphans: apps/gurudevi-mobile/__mocks__/@sentry/react-native.js
  warn no-orphans: apps/gurudevi-marketingWeb/src/components/StatsSection.svelte
  warn no-orphans: apps/gurudevi-marketingWeb/.astro/content-modules.mjs
  warn no-orphans: apps/gurudevi-marketingWeb/.astro/content-assets.mjs
  warn no-orphans: apps/edlove-web/src/utils/helpers.ts
  warn no-orphans: apps/edlove-web/src/types/index.ts
  warn no-orphans: apps/edlove-web/src/constants/Theme.ts
  warn no-orphans: apps/edlove-web/.astro/content-modules.mjs
  warn no-orphans: apps/edlove-web/.astro/content-assets.mjs
  warn L0-L1-subpath-only: packages/self/src/api/wellbeingRepository.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/profile/src/hooks/useNotificationPreferences.ts → packages/ui/src/index.ts

x 69 dependency violations (0 errors, 69 warnings). 2087 modules, 6531 dependencies cruised.



--------------------------------------------------------------------------------

AUDIT SUMMARY
Duration: 15.3s
Findings: 0
Log File: reports/circular_deps.txt
--------------------------------------------------------------------------------

--- Checking Unused Code ---


> polymath-platform@1.0.0 check:unused C:\Users\Naween\projects\polymath-platform
> node scripts/sovereign-audit.mjs --cmd "pnpm exec depcruise packages apps --config .dependency-cruiser.cjs --output-type err" --filter "no-orphans" --log "reports/unused_code.txt"


>>> Starting Sovereign Audit: 2026-05-22T09:18:26.861Z

>>> Command: pnpm exec depcruise packages apps --config .dependency-cruiser.cjs --output-type err
>>> Filter: no-orphans
--------------------------------------------------------------------------------


  warn no-orphans: packages/ui/src/utils/shareAction.web.ts
  warn no-orphans: packages/ui/src/utils/SanctuaryLocation.web.ts
  warn no-orphans: packages/ui/src/utils/haptics.web.ts
  warn no-orphans: packages/ui/src/utils/dialogs.web.ts
  warn no-orphans: packages/ui/src/components/ui/list/index.tsx
  warn no-orphans: packages/ui/src/components/SkeletonLoader.web.tsx
  warn no-orphans: packages/ui/src/components-native/NoiseOverlay.web.tsx
  warn no-orphans: packages/ui/src/code.tsx
  warn no-orp
hans: packages/ui/src/button.tsx
  warn no-orphans: packages/trube-art/src/native/renderers/SoulLibrary.ts
  warn no-orphans: packages/scanner-kit/src/ScannerModal.web.tsx
  warn no-orphans: packages/lk-edu-geo/src/constants.ts
  warn no-orphans: packages/library/src/components/LibraryThumbnailCard.web.tsx
  warn no-orphans: packages/library/src/api/database.web.ts
  warn no-orphans: packages/core/src/utils/temporal.ts
  warn no-orphans: packages/core/src/utils/idempotency.ts
  warn no-orphans: packages/core/src/native/sentry.ts
  warn no-orphans: packages/core/src/logic/forms/dynamic-loader.ts
  warn no-orphans: packages/core/src/logic/forms/analytics.ts
  warn no-orphans: packages/core/src/hooks/useSovereignEffect.ts
  warn no-orphans: packages/core/src/hooks/useMediaDownloader.web.ts
  warn no-orphans: packages/core/src/api/growthSignals.generated.zod.ts
  warn no-orphans: packages/analytics/src/utils/analyticsHelpers.ts
  warn no-orphans: packages/analytics/src/types/AnalyticsTypes.ts
  warn no-orphans: packages/analytics/src/engine/PostHogAnalytics.web.ts
  warn no-orphans: packages/analytics/src/engine/PostHogAnalytics.ts
  warn no-orphans: packages/analytics/src/engine/PostHogAnalytics.native.ts
  warn no-orphans: packages/analytics/src/engine/PostHogAnalytics.native.js
  warn no-orphans: packages/analytics/src/context/ActivityPulseContext.tsx
  warn no-orphans: packages/admin/src/screens/principal/types.ts
  warn no-orphans: packages/admin/src/screens/index.ts
  warn no-orphans: apps/neevsk-web/src/scripts/theme-switcher.ts
  warn no-orphans: apps/neevsk-web/src/scripts/scroll-to-top.ts
  warn no-orphans: apps/neevsk-web/src/scripts/creative-signatures.ts
  warn no-orphans: apps/neevsk-web/src/scripts/animations.ts
  warn no-orphans: apps/neevsk-web/.astro/content-modules.mjs
  warn no-orphans: apps/neevsk-web/.astro/content-assets.mjs
  warn no-orphans: apps/intuitui-web/.astro/content-modules.mjs
  warn no-orphans: apps/intuitui-web/.astro/content-assets.mjs
  warn no-orphans: apps/gurudevi-mobile/src/utils/validators.ts
  warn no-orphans: apps/gurudevi-mobile/src/utils/usePWAInstallPrompt.ts
  warn no-orphans: apps/gurudevi-mobile/src/lib/backgroundSync.web.ts
  warn no-orphans: apps/gurudevi-mobile/src/components/web/WebSkeleton.web.tsx
  warn no-orphans: apps/gurudevi-mobile/src/components/web/WebSkeleton.tsx
  warn no-orphans: apps/gurudevi-mobile/src/components/web/WebScreenShimmer.web.tsx
  warn no-orphans: apps/gurudevi-mobile/src/components/web/SanctuaryTabBar.web.tsx
  warn no-orphans: apps/gurudevi-mobile/src/components/web/SanctuaryTabBar.tsx
  warn no-orphans: apps/gurudevi-mobile/src/components/RedirectToApp.tsx
  warn no-orphans: apps/gurudevi-mobile/plugins/withSentryGradleDisabled.js
  warn no-orphans: apps/gurudevi-mobile/plugins/withGradleProperties.js
  warn no-orphans: apps/gurudevi-mobile/plugins/withAndroidCruncherDisabled.js
  warn no-orphans: apps/gurudevi-mobile/jest-setup.ts
  warn no-orphans: apps/gurudevi-mobile/__mocks__/react-native-reanimated.js
  warn no-orphans: apps/gurudevi-mobile/__mocks__/gluestack-themed.js
  warn no-orphans: apps/gurudevi-mobile/__mocks__/expo-image-picker.js
  warn no-orphans: apps/gurudevi-mobile/__mocks__/expo-camera.js
  warn no-orphans: apps/gurudevi-mobile/__mocks__/EnvironmentContext.js
  warn no-orphans: apps/gurudevi-mobile/__mocks__/@shopify/react-native-skia.js
  warn no-orphans: apps/gurudevi-mobile/__mocks__/@sentry/react-native.js
  warn no-orphans: apps/gurudevi-marketingWeb/src/components/StatsSection.svelte
  warn no-orphans: apps/gurudevi-marketingWeb/.astro/content-modules.mjs
  warn no-orphans: apps/gurudevi-marketingWeb/.astro/content-assets.mjs
  warn no-orphans: apps/edlove-web/src/utils/helpers.ts
  warn no-orphans: apps/edlove-web/src/types/index.ts
  warn no-orphans: apps/edlove-web/src/constants/Theme.ts
  warn no-orphans: apps/edlove-web/.astro/content-modules.mjs
  warn no-orphans: apps/edlove-web/.astro/content-assets.mjs
  warn L0-L1-subpath-only: packages/self/src/api/wellbeingRepository.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/profile/src/hooks/useNotificationPreferences.ts → packages/ui/src/index.ts

x 69 dependency violations (0 errors, 69 warnings). 2087 modules, 6531 dependencies cruised.



--------------------------------------------------------------------------------

AUDIT SUMMARY
Duration: 11.0s
Findings: 66
Log File: reports/unused_code.txt
--------------------------------------------------------------------------------

--- Checking Architecture Boundaries ---


> polymath-platform@1.0.0 check:architecture C:\Users\Naween\projects\polymath-platform
> node scripts/sovereign-audit.mjs --cmd "pnpm exec depcruise packages apps --config .dependency-cruiser.cjs --output-type err" --log "reports/architecture.txt"


>>> Starting Sovereign Audit: 2026-05-22T09:18:38.808Z

>>> Command: pnpm exec depcruise packages apps --config .dependency-cruiser.cjs --output-type err
--------------------------------------------------------------------------------


  warn no-orphans: packages/ui/src/utils/shareAction.web.ts
  warn no-orphans: packages/ui/src/utils/SanctuaryLocation.web.ts
  warn no-orphans: packages/ui/src/utils/haptics.web.ts
  warn no-orphans: packages/ui/src/utils/dialogs.web.ts
  warn no-orphans: packages/ui/src/components/ui/list/index.tsx
  warn no-orphans: packages/ui/src/components/SkeletonLoader.web.tsx
  warn no-orphans: packages/ui/src/components-native/NoiseOverlay.web.tsx
  warn no-orphans: packages/ui/src/code.tsx
  warn no-orp
hans: packages/ui/src/button.tsx
  warn no-orphans: packages/trube-art/src/native/renderers/SoulLibrary.ts
  warn no-orphans: packages/scanner-kit/src/ScannerModal.web.tsx
  warn no-orphans: packages/lk-edu-geo/src/constants.ts
  warn no-orphans: packages/library/src/components/LibraryThumbnailCard.web.tsx
  warn no-orphans: packages/library/src/api/database.web.ts
  warn no-orphans: packages/core/src/utils/temporal.ts
  warn no-orphans: packages/core/src/utils/idempotency.ts
  warn no-orphans: packages/core/src/native/sentry.ts
  warn no-orphans: packages/core/src/logic/forms/dynamic-loader.ts
  warn no-orphans: packages/core/src/logic/forms/analytics.ts
  warn no-orphans: packages/core/src/hooks/useSovereignEffect.ts
  warn no-orphans: packages/core/src/hooks/useMediaDownloader.web.ts
  warn no-orphans: packages/core/src/api/growthSignals.generated.zod.ts
  warn no-orphans: packages/analytics/src/utils/analyticsHelpers.ts
  warn no-orphans: packages/analytics/src/types/AnalyticsTypes.ts
  warn no-orphans: packages/analytics/src/engine/PostHogAnalytics.web.ts
  warn no-orphans: packages/analytics/src/engine/PostHogAnalytics.ts
  warn no-orphans: packages/analytics/src/engine/PostHogAnalytics.native.ts
  warn no-orphans: packages/analytics/src/engine/PostHogAnalytics.native.js
  warn no-orphans: packages/analytics/src/context/ActivityPulseContext.tsx
  warn no-orphans: packages/admin/src/screens/principal/types.ts
  warn no-orphans: packages/admin/src/screens/index.ts
  warn no-orphans: apps/neevsk-web/src/scripts/theme-switcher.ts
  warn no-orphans: apps/neevsk-web/src/scripts/scroll-to-top.ts
  warn no-orphans: apps/neevsk-web/src/scripts/creative-signatures.ts
  warn no-orphans: apps/neevsk-web/src/scripts/animations.ts
  warn no-orphans: apps/neevsk-web/.astro/content-modules.mjs
  warn no-orphans: apps/neevsk-web/.astro/content-assets.mjs
  warn no-orphans: apps/intuitui-web/.astro/content-modules.mjs
  warn no-orphans: apps/intuitui-web/.astro/content-assets.mjs
  warn no-orphans: apps/gurudevi-mobile/src/utils/validators.ts
  warn no-orphans: apps/gurudevi-mobile/src/utils/usePWAInstallPrompt.ts
  warn no-orphans: apps/gurudevi-mobile/src/lib/backgroundSync.web.ts
  warn no-orphans: apps/gurudevi-mobile/src/components/web/WebSkeleton.web.tsx
  warn no-orphans: apps/gurudevi-mobile/src/components/web/WebSkeleton.tsx
  warn no-orphans: apps/gurudevi-mobile/src/components/web/WebScreenShimmer.web.tsx
  warn no-orphans: apps/gurudevi-mobile/src/components/web/SanctuaryTabBar.web.tsx
  warn no-orphans: apps/gurudevi-mobile/src/components/web/SanctuaryTabBar.tsx
  warn no-orphans: apps/gurudevi-mobile/src/components/RedirectToApp.tsx
  warn no-orphans: apps/gurudevi-mobile/plugins/withSentryGradleDisabled.js
  warn no-orphans: apps/gurudevi-mobile/plugins/withGradleProperties.js
  warn no-orphans: apps/gurudevi-mobile/plugins/withAndroidCruncherDisabled.js
  warn no-orphans: apps/gurudevi-mobile/jest-setup.ts
  warn no-orphans: apps/gurudevi-mobile/__mocks__/react-native-reanimated.js
  warn no-orphans: apps/gurudevi-mobile/__mocks__/gluestack-themed.js
  warn no-orphans: apps/gurudevi-mobile/__mocks__/expo-image-picker.js
  warn no-orphans: apps/gurudevi-mobile/__mocks__/expo-camera.js
  warn no-orphans: apps/gurudevi-mobile/__mocks__/EnvironmentContext.js
  warn no-orphans: apps/gurudevi-mobile/__mocks__/@shopify/react-native-skia.js
  warn no-orphans: apps/gurudevi-mobile/__mocks__/@sentry/react-native.js
  warn no-orphans: apps/gurudevi-marketingWeb/src/components/StatsSection.svelte
  warn no-orphans: apps/gurudevi-marketingWeb/.astro/content-modules.mjs
  warn no-orphans: apps/gurudevi-marketingWeb/.astro/content-assets.mjs
  warn no-orphans: apps/edlove-web/src/utils/helpers.ts
  warn no-orphans: apps/edlove-web/src/types/index.ts
  warn no-orphans: apps/edlove-web/src/constants/Theme.ts
  warn no-orphans: apps/edlove-web/.astro/content-modules.mjs
  warn no-orphans: apps/edlove-web/.astro/content-assets.mjs
  warn L0-L1-subpath-only: packages/self/src/api/wellbeingRepository.ts → packages/core/src/index.ts
  warn L0-L1-subpath-only: packages/profile/src/hooks/useNotificationPreferences.ts → packages/ui/src/index.ts

x 69 dependency violations (0 errors, 69 warnings). 2087 modules, 6531 dependencies cruised.



--------------------------------------------------------------------------------

AUDIT SUMMARY
Duration: 11.4s
Findings: 70
Log File: reports/architecture.txt
--------------------------------------------------------------------------------


✅ All hygiene checks passed!


> polymath-platform@1.0.0 identity:check C:\Users\Naween\projects\polymath-platform
> node scripts/sovereign-audit.mjs --cmd "node scripts/check-identity-alignment.mjs" --log "reports/identity_check.txt"


>>> Starting Sovereign Audit: 2026-05-22T09:18:50.896Z

>>> Command: node scripts/check-identity-alignment.mjs
--------------------------------------------------------------------------------

🚀 Starting Identity Alignment Audit...


Scan complete in 1.71s. Found 0 potential alignment issues.



[32m✨ No identity alignment issues found. Architecture is sovereign.[0m


--------------------------------------------------------------------------------
AUDIT SUMMARY

Duration: 2.3s
Findings: 0
Log File: reports/identity_check.txt
--------------------------------------------------------------------------------


> polymath-platform@1.0.0 i18n:check C:\Users\Naween\projects\polymath-platform
> pnpm run i18n:audit && pnpm run i18n:no-inline-fallbacks



> polymath-platform@1.0.0 i18n:audit C:\Users\Naween\projects\polymath-platform
> node scripts/i18n/audit-keys.mjs



[en] Missing 69 translation key(s):

  - chat.empty
  - chat.historicalView
  - chat.noConversationsDesc
  - chat.noConversationsTitle
  - chat.placeholder
  - chat.tapToContinue
  - common.plant
  - community.endorse
  - community.endorsers
  - community.groups.joinAuthRequired
  - community.groups.joinedSuccess
  - community.groups.member
  - community.groups.qrHint

  - community.groups.qrTitle
  - community.hearthSubtitle
  - community.hearthTitle
  - community.manifestoCarousel
  - community.manifestoTopic
  - community.profile.defaultBio
  - community.profile.explorer
  - community.profile.memberOfGurudevi
  - community.profile.privacyProtected
  - community.profile.privateNote
  - community.profile.privateSanctuary
  - community.profile.publicPresenceOf
  - community.profile.publicResonance
  - community.profile.pulseActive
  - community.profile.recent
  - community.profile.reflection
  - community.profile.resonanceSphere
  - community.profile.verified
  - community.spotlight
  - community.viewSpotlight
  - fireJournal.errorSaving
  - grades.empty
  - invitationWelcome.desc
  - invite.error.invalid
  - invite.error.noCode
  - invite.success.joining
  - key
  - progressTree.interactionsLabel
  - progressTree.philosophy
  - self.adminDescription
  - self.founderDesc
  - self.founderDescription
  - self.gratitudePlaceholder
  - self.guardianDescription
  - self.moodHowAreYou
  - self.moodNeutral
  - self.moodPositive
  - self.moodRadiant
  - self.noWisdomYet
  - self.plantSeed
  - self.principalDesc
  - self.principalDescription
  - self.recording
  - self.recordingHint
  - self.studentDesc
  - self.studentDescription
  - self.tapToStart
  - self.teacherDesc

  - self.teacherDescription
  - self.voiceJournal
  - self.voiceJournalSubtitle
  - self.wisdomPlaceholder
  - self.wisdomSeeds
  - sleepTracker.notTime
  - sleepTracker.philosophy
  - sleepTracker.tomorrowHint

[si] Missing 116 translation key(s):
  - chat.empty
  - chat.historicalView
  - chat.noConversationsDesc
  - chat.noConversationsTitle
  - chat.placeholder
  - chat.tapToContinue
  - common.plant
  - community.endorse
  - community.endorsers
  - community.groups.joinAuthRequired
  - community.groups.joinedSuccess
  - community.groups.member
  - community.groups.qrHint
  - community.groups.qrTitle
  - community.hearthSubtitle
  - community.hearthTitle
  - community.manifestoCarousel
  - community.manifestoTopic
  - community.profile.aspiration
  - community.profile.contributions
  - community.profile.defaultBio
  - community.profile.endorsements
  - community.profile.explorer
  - community.profile.memberOfGurudevi
  - community.profile.posts
  - community.profile.privacyNote
  - community.profile.privacyProtected
  - community.profile.privateNote
  - community.profile.privateSanctuary
  - community.profile.publicPresenceOf
  - community.profile.publicResonance
  - community.profile.pulse
  - community.profile.pulseActive
  - community.profile.recent
  - community.profile.reflection
  - community.profile.reportAccount
  - community.profile.resonanceSphere
  - community.profile.resonanceStats
  - community.profile.sanctuaryHonors
  - community.profile.sendMessage
  - community.profile.verified
  - community.spotlight
  - community.viewSpotlight
  - fireJournal.errorSaving
  - grades.empty
  - invitationWelcome.desc
  - invite.error.invalid
  - invite.error.noCode
  - invite.success.joining
  - key
  - ocr.captureDescription
  - ocr.chooseFromGallery
  - ocr.permission.description
  - ocr.permission.title
  - ocr.scanning
  - ocr.takePhoto
  - ocr.tipsTitle
  - ocr.title
  - ocr.tryAgain
  - progressTree.interactionsLabel
  - progressTree.philosophy
  - scanner.controls.flip
  - scanner.controls.gallery
  - scanner.dismiss
  - scanner.errors.customBuild
  - scanner.errors.noQrFound
  - scanner.errors.scanFailed
  - scanner.instructions
  - scanner.permission.grant
  - scanner.permission.message
  - scanner.status.mlKit
  - scanner.title
  - scanner.web.cameraMessage
  - scanner.web.closeScanner
  - scanner.web.desktopHint
  - scanner.web.emptyError
  - scanner.web.pasteCode

  - scanner.web.submitCode
  - scanner.web.title
  - self.adminDescription
  - self.breathingReset
  - self.founderDesc
  - self.founderDescription
  - self.gratitudePlaceholder
  - self.guardianDescription
  - self.moodHowAreYou
  - self.moodNeutral
  - self.moodPositive
  - self.moodRadiant
  - self.noWisdomYet
  - self.plantSeed
  - self.principalDesc
  - self.principalDescription
  - self.recording
  - self.recordingHint
  - self.studentDesc
  - self.studentDescription
  - self.tapToStart
  - self.teacherDesc
  - self.teacherDescription
  - self.voiceJournal
  - self.voiceJournalSubtitle
  - self.wisdomPlaceholder
  - self.wisdomSeeds
  - sleepTracker.notTime
  - sleepTracker.philosophy
  - sleepTracker.tomorrowHint
  - tabs.class
  - tabs.platform
  - webNav.alerts
  - webNav.brandName
  - webNav.menu
  - webNav.notifications
  - webNav.settings
  - webNav.tabNavigation
  - webNav.toggleNavigation

[ta] Missing 108 translation key(s):
  - chat.empty
  - chat.historicalView
  - chat.noConversationsDesc
  - chat.noConversationsTitle
  - chat.placeholder
  - chat.tapToContinue
  - common.plant
  - community.endorse
  - community.endorsers
  - community.groups.joinAuthRequired
  - community.groups.joinedSuccess
  - community.groups.member
  - community.groups.qrHint
  - community.groups.qrTitle
  - community.hearthSubtitle
  - community.hearthTitle
  - community.manifestoCarousel
  - community.manifestoTopic
  - community.profile.aspiration
  - community.profile.contributions
  - community.profile.defaultBio
  - community.profile.endorsements
  - community.profile.explorer
  - community.profile.memberOfGurudevi
  - community.profile.posts
  - community.profile.privacyNote
  - community.profile.privacyProtected
  - community.profile.privateNote
  - community.profile.privateSanctuary
  - community.profile.publicPresenceOf
  - community.profile.publicResonance
  - community.profile.pulse
  - community.profile.pulseActive
  - community.profile.recent
  - community.profile.reflection
  - community.profile.reportAccount
  - community.profile.resonanceSphere
  - community.profile.resonanceStats
  - community.profile.sanctuaryHonors
  - community.profile.sendMessage
  - community.profile.verified
  - community.spotlight
  - community.viewSpotlight
  - fireJournal.errorSaving
  - grades.empty
  - invitationWelcome.desc
  - invite.error.invalid
  - invite.error.noCode
  - invite.success.joining
  - key
  - ocr.captureDescription
  - ocr.chooseFromGallery
  - ocr.permission.description
  - ocr.permission.title
  - ocr.scanning
  - ocr.takePhoto
  - ocr.tipsTitle
  - ocr.title
  - ocr.tryAgain
  - progressTree.interactionsLabel
  - progressTree.philosophy
  - scanner.controls.flip
  - scanner.controls.gallery
  - scanner.dismiss
  - scanner.errors.customBuild
  - scanner.errors.noQrFound
  - scanner.errors.scanFailed
  - scanner.instructions
  - scanner.permission.grant
  - scanner.permission.message
  - scanner.status.mlKit
  - scanner.title
  - scanner.web.cameraMessage
  - scanner.web.closeScanner
  - scanner.web.desktopHint
  - scanner.web.emptyError
  - scanner.web.pasteCode
  - scanner.web.submitCode
  - scanner.web.title
  - self.adminDescription
  - self.founderDesc
  - self.founderDescription
  - self.gratitudePlaceholder
  - self.guardianDescription
  - self.moodHowAreYou
  - self.moodNeutral
  - self.moodPositive
  - self.moodRadiant
  - self.noWisdomYet
  - self.plantSeed
  - self.principalDesc
  - self.principalDescription
  - self.recording
  - self.recordingHint
  - self.studentDesc
  - self.studentDescription
  - self.tapToStart
  - self.teacherDesc
  - self.teacherDescription
  - self.voiceJournal
  - self.voiceJournalSubtitle
  - self.wisdomPlaceholder
  - self.wisdomSeeds
  - sleepTracker.notTime
  - sleepTracker.philosophy
  - sleepTracker.tomorrowHint
  - tabs.class
  - tabs.platform

 ELIFECYCLE  Command failed with exit code 1.

 ELIFECYCLE  Command failed with exit code 1.

```
