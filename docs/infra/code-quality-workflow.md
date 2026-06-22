---
title: "Polymath Platform Code Quality Workflow & Toolchain"
status: "active"
created: 2026-06-20
updated: 2026-06-20
author: "Naveen"
scribe: "Cascade"
tags: [code-quality, toolchain, ci-cd, linting, testing]
---

# Polymath Platform Code Quality Workflow & Toolchain

This document establishes the comprehensive code quality workflow and toolchain standards for the Polymath Platform monorepo.

---

## 1. Philosophy & Principles

### Core Principles
- **Fast Feedback**: Prioritize tooling that provides immediate, actionable feedback
- **Layered Defense**: Multiple quality gates at different stages (local, pre-commit, CI)
- **Minimal Friction**: Tools should enhance, not hinder, developer velocity
- **Stack-Aware**: Use specialized tools where general-purpose tools fall short
- **Architecture-Enforcing**: Tooling should reinforce architectural boundaries

### Tool Selection Strategy
- **Primary vs Niche**: Use fast, general-purpose tools as primary; specialized tools for stack-specific needs
- **Rust-First**: Prefer Rust-based tools for performance (Oxlint, Biome)
- **Integration-First**: Tools must integrate well with monorepo and CI/CD workflows

---

## 2. Toolchain Architecture

### 2.1 Two-Layered Linting Strategy

#### Primary Linter: Oxlint
- **Role**: Fast, general-purpose linting for JavaScript/TypeScript
- **Strengths**: 
  - Rust-based, extremely fast (10-100x faster than ESLint)
  - Low configuration overhead
  - Excellent for catching common errors quickly
- **Scope**: All JS/TS files across workspace
- **Configuration**: `.oxlintrc.json`
- **When to Use**: First line of defense, runs in pre-commit and CI

#### Secondary/Niche Linter: ESLint
- **Role**: Specialized linting for TypeScript, React Native, Expo ecosystems
- **Strengths**:
  - Mature TypeScript support (typescript-eslint)
  - React Native and Expo specific rules
  - Import/export analysis with import-x
  - Turbo monorepo specific rules
  - React hooks and component rules
- **Scope**: 
  - TypeScript files requiring deep type-aware linting
  - React Native components
  - Expo configuration files
  - Monorepo boundary enforcement
- **Configuration**: `packages/eslint-config/base.js`
- **When to Use**: Stack-specific scenarios where Oxlint maturity is insufficient

### 2.2 Formatter: Biome

- **Role**: Unified code formatting (primary)
- **Strengths**:
  - Rust-based, fast formatting
  - Built-in import organization
  - Consistent with Oxlint (same ecosystem)
  - Handles JSON, CSS, and JavaScript/TypeScript
- **Configuration**: `biome.json`
- **Status**: **Primary formatter**
- **Linter**: Disabled (we use Oxlint + ESLint instead)

### 2.3 Legacy Formatter: Prettier

- **Role**: Legacy formatting (format:legacy script)
- **Status**: Available as fallback, not actively used
- **Script**: `pnpm run format:legacy`
- **Note**: Biome is the primary formatter; Prettier retained for legacy compatibility

### 2.3 Type Checking: TypeScript

- **Role**: Static type checking
- **Configuration**: Project references in `tsconfig.json`
- **Custom Config**: `@repo/typescript-config` package
- **Integration**: Runs in CI with increased memory allocation

---

## 3. Pre-Commit Quality Gates

### 3.1 Git Hooks Infrastructure

**Husky**: Git hooks manager  
**lint-staged**: Runs quality checks only on staged files

### 3.2 Pre-Commit Workflow

For staged JS/TS/TSX files (chunked in batches of 10):

1. **Oxlint** (`oxlint --fix`): Fast linting and auto-fix
2. **ESLint** (`eslint --fix`): TypeScript/React Native/Expo specific linting
3. **Biome** (`biome check --write`): Formatting and import organization
4. **Surgical Check** (`node scripts/surgical-check.mjs`): Custom validation

For staged JSON files:
- **Biome** (`biome check --write`): JSON formatting

### 3.3 Commit Message Linting

**Commitlint**: Enforces conventional commits format
- Configuration: `commitlint.config.cjs`
- Types: build, chore, ci, docs, feat, fix, perf, refactor, revert, style, test

---

## 4. Continuous Integration Quality Gates

### 4.1 GitHub Actions Workflows

#### Quality Gate Workflow (`quality-gate.yml`)
Runs on pull requests to main branch:
1. **Module Resolution Check**: Verifies critical CSS imports
2. **Lint**: Full workspace linting
3. **i18n Policy Checks**: Internationalization key validation
4. **Type-Check (Mobile)**: TypeScript compilation for mobile app
5. **Unit Tests**: Test suite execution

#### PR Guard Workflow (`pr-guard.yml`)
Runs on push/PR to main/develop:
1. **Lint**: Full workspace linting
2. **Type-Check**: TypeScript compilation across workspace

### 4.2 React Doctor Integration

**Purpose**: Automated React anti-pattern detection and code health scoring

**Overview**: React Doctor is a high-performance static analysis tool built on top of Oxlint that scans React projects for 47+ established best practices and anti-patterns.

**Key Features**:
- **Built on Oxlint**: Rust-based, processes tens of thousands of lines in milliseconds
- **47+ Rules**: Covers performance, security, accessibility, and React best practices
- **Health Scoring**: Provides health score out of 100 with qualitative labels
- **Context-Aware**: Intelligent suggestions with explanations and fixes
- **Framework Support**: Built-in support for Next.js, Vite, Remix, React Native
- **CI/CD Optimized**: `--diff` flag to scan only changed files
- **GitHub Actions Integration**: Automatic PR comments and score outputs

**Detection Capabilities**:
- Unnecessary useEffect hooks
- Accessibility issues (missing alt attributes, etc.)
- Prop drilling patterns
- Performance problems (heavy library imports)
- Incorrect hook usage
- Security vulnerabilities (hardcoded secrets, API keys)
- State management anti-patterns
- Bundle size issues

**Best Practices** (based on React Doctor documentation):
- Run in CI with `--diff` flag to scan only changed files
- Use in pre-commit or PR workflows for fast feedback
- Configure rules via `doctor.config.ts` for project-specific needs
- Leverage GitHub Actions integration for automatic PR comments

**Current Integration**:
- **Status**: Integrated in quality-gate.yml, pre-push hooks, and package.json
- **Script**: `pnpm run audit:react-doctor`
- **Placement**: quality-gate.yml after lint, before type-check
- **Usage**: `npx react-doctor --diff` for CI, `pnpm run audit:react-doctor` for full audits

**Configuration**: Create `doctor.config.ts` at root for rule customization

**Environment Variables**: None required by default

---

## 5. Testing Infrastructure

### 5.1 Testing Strategy

**Philosophy**: Confidence through automated clarity
- **Sovereign Testing**: Each package testable in isolation
- **Visual Evidence**: E2E tests provide traces/screenshots
- **User-Centric Assertions**: Test outcomes, not implementation details
- **AI-Native Validation**: Systematic LLM prompt evaluation

### 5.2 Test Frameworks

#### Vitest (Primary)
- **Role**: Unit and integration tests for packages and app logic
- **Configuration**: 27 vitest.config files across workspace
- **Strengths**: Vite-native execution, mirrors build environment
- **Coverage**: **TODO**: Configure coverage reporting

#### Jest (Mobile)
- **Role**: React Native component testing
- **Configuration**: `apps/gurudevi-mobile/jest.config.js`
- **Preset**: jest-expo/web
- **Scope**: Mobile app components and React Native specifics

#### Playwright (E2E)
- **Role**: Browser automation for web apps
- **Configuration**: `apps/*/playwright.config.ts`
- **Strengths**: Auto-waiting, multi-tab support, trace viewer
- **Status**: **TODO**: Integrate into CI quality gates

#### Maestro (Mobile E2E)
- **Role**: Native mobile flow validation
- **Configuration**: YAML flows in `apps/gurudevi-mobile/maestro/*.yaml`
- **Strengths**: Simple YAML-driven, handles React Native runtime complexities

#### Promptfoo (AI Evaluation)
- **Role**: LLM response evaluation and safety checks
- **Configuration**: `promptfooconfig.yaml`
- **Purpose**: Treat prompts as code requiring test suite

---

## 6. Dependency Management

### 6.1 Dependency Cruiser

**Purpose**: Enforce architectural rules and detect dependency issues

**Rules Enforced**:
- No circular dependencies
- Packages cannot import from apps
- Apps cannot import from other apps
- Layer-based architecture enforcement (L0-L4)
- Standalone package isolation
- Database leak prevention
- API boundary enforcement

**Configuration**: `.dependency-cruiser.cjs`

**Integration**:
- Scripts: `check:circular`, `check:unused`, `check:architecture`
- **Status**: **TODO**: Add to CI quality gates

### 6.2 Syncpack

**Purpose**: Ensure consistent dependency versions across workspace

**Configuration**: `.syncpackrc`

**Integration**:
- Script: `maintenance:align` (list mismatches)
- Script: `maintenance:fix` (fix mismatches)
- **Status**: Should run in CI to prevent drift

### 6.3 Renovate

**Purpose**: Automated dependency updates

**Configuration**: `renovate.json`

**Rules**:
- Disabled automated updates for Expo and React Native core (SDK 55 compliance)
- Dev tooling auto-merge (TypeScript, ESLint, Biome)
- Safe patch auto-merge (date-fns, lodash, zod, zustand)

---

## 7. Code Quality & Security Tools

### 7.1 Unused Code Detection

**Knip**: Detects unused files, exports, and dependencies
- **Configuration**: `knip.json`
- **Integration**: `check:unused` script
- **Status**: **TODO**: Add to CI quality gates

### 7.2 Bundle Size Monitoring

**Size-Limit**: Monitors bundle sizes to prevent bloat
- **Configuration**: `.size-limit.json`
- **Integration**: `audit:size` script
- **Status**: Runs in audit workflow

### 7.3 Secret Detection

**Gitleaks**: Detects secrets in code
- **Configuration**: `.gitleaks.toml`
- **Purpose**: Prevent credential leaks
- **Status**: Should run in pre-commit and CI

### 7.4 Security Scanning

**Snyk**: Vulnerability scanning
- **Integration**: `audit:security` script
- **Status**: **TODO**: Add to CI quality gates

**Semgrep**: Static analysis for security
- **Integration**: `audit:security` script
- **Status**: **TODO**: Add to CI quality gates

---

## 8. Build Orchestration

### 8.1 Turborepo

**Purpose**: Build system orchestration for monorepo

**Configuration**: `turbo.json`

**Integration**:
- Scripts: `build`, `dev`, `start` use turbo
- Caching: **TODO**: Enable for CI workflows

### 8.2 Package Manager

**pnpm**: Fast, disk-space efficient package manager
- **Version**: 11.8.0
- **Workspace**: `pnpm-workspace.yaml`
- **Node Version**: 24.x

---

## 9. Comprehensive Quality Check Command

### 9.1 check-all Script

The `check-all` script runs comprehensive quality checks:

```bash
pnpm run check-all
```

**Includes**:
1. Lint (`pnpm run lint`)
2. Type-check (`pnpm run check-types`)
3. Circular dependency check (`pnpm run audit:cycles`)
4. Deprecation audit (`pnpm run audit:deprecations`)
5. Unused code check (`pnpm run check:unused`)
6. Security scan (`pnpm run audit:security`)

**Status**: Should be integrated into CI quality gates

---

## 10. Improvement Roadmap

### Completed Items ✅
- [x] Add test coverage configuration (Vitest coverage)
- [x] Add coverage reporting to CI
- [x] Re-enable ESLint in lint-staged (fixed compatibility)
- [x] Add security scanning (Snyk + Semgrep) to CI quality gates
- [x] Clarify ESLint vs Oxlint rule responsibilities
- [x] Document which rules each linter handles
- [x] Add React Doctor to quality-gate.yml
- [x] Update outdated YAML workflow files (pnpm version to 11.8.0)
- [x] Add React Doctor script to package.json
- [x] Update ESLint to 10.4.1
- [x] Remove Prettier dependencies and references
- [x] Create React Doctor integration guide
- [x] Create comprehensive developer workflow guide

### Priority 1: Critical Gaps
- [ ] Create doctor.config.ts for project-specific rules
- [ ] Add E2E tests (Playwright) to quality-gate.yml
- [ ] Add dependency-cruiser checks to CI

### Priority 2: CI Enhancement
- [ ] Enable turbo caching in CI workflows
- [ ] Add GitHub Actions integration for React Doctor PR comments
- [ ] Configure health score thresholds for CI failure

### Priority 3: Documentation
- [ ] Create decision record for two-layered linting strategy
- [ ] Create troubleshooting guide for common quality gate failures
- [ ] Update documentation to reflect turbo-based linting approach

---

## 11. Troubleshooting

### Common Issues

#### ESLint Runtime Crash
- **Issue**: ESLint 10/typescript-eslint compatibility issues
- **Current Status**: Re-enabled in lint-staged (compatibility resolved)
- **Resolution**: Using ESLint 10.4.1 with typescript-eslint-parser

#### React Doctor Integration
- **Issue**: Script not added to package.json
- **Current Status**: Added `audit:react-doctor` script to package.json
- **Resolution**: Script now available via `pnpm run audit:react-doctor`

#### Lint-Staged Performance
- **Issue**: Chunking files in batches of 10 may be unnecessary
- **Current Status**: Implemented for historical reasons
- **Evaluation**: Consider removing chunking with modern tooling

---

## 12. References

- [React Doctor GitHub Repository](https://github.com/millionco/react-doctor)
- [React Doctor Guide - Better Stack](https://betterstack.com/community/guides/scaling-nodejs/react-doctor/)
- [Expo Build on CI Documentation](https://docs.expo.dev/build/building-on-ci/)
- [EAS Workflows Documentation](https://docs.expo.dev/eas/workflows/)
- [Biome Documentation](https://biomejs.dev/)
- [Oxlint Documentation](https://oxlint.com/)
- [Dependency Cruiser Documentation](https://dependency-cruiser.com/)
- [Sanctuary API Documentation SOP](../../apps/sanctuary-api/docs/docs-sop.md)
