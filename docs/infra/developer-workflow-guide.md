---
title: "Developer Workflow Guide"
status: "active"
created: 2026-06-20
updated: 2026-06-20
author: "Naveen"
scribe: "Cascade"
tags: [workflow, development, git, quality-gates]
---

# Developer Workflow Guide

This document establishes the official development workflow and quality gate sequence for the Polymath Platform monorepo.

---

## 1. Philosophy

**Fast Feedback, Layered Defense**: The workflow prioritizes fast, incremental quality checks at every stage of development, from local editing to CI/CD deployment.

### Core Principles
- **Fail Fast**: Catch issues as early as possible (pre-commit > pre-push > CI)
- **Incremental Validation**: Each stage builds on the previous one
- **Minimal Friction**: Tools should enhance, not hinder, development velocity
- **Comprehensive Coverage**: Multiple layers of validation ensure code quality

---

## 2. Quality Gate Sequence

### Proper Order of Operations

**Rationale**: Tools are ordered by speed and dependency requirements. Fast tools run first to provide immediate feedback, while slower tools run later to avoid wasting time on code that will fail basic checks.

```
1. Lint (Oxlint + ESLint)      → Fast, catches basic syntax/style issues
2. React Doctor                → Fast, catches React-specific anti-patterns
3. Type-Check (tsc)            → Slower, requires valid syntax
4. Tests                       → Slowest, requires valid code
5. Security Scan               → Independent, can run in parallel
6. Coverage Report            → Depends on tests
```

### Why This Sequence?

- **Linting First**: Fastest feedback loop, catches 80% of issues quickly
- **React Doctor Second**: Also fast, React-specific patterns, can run parallel with lint
- **Type-Check Third**: Requires valid syntax, slower than linting
- **Tests Fourth**: Require valid code, slowest validation step
- **Security Scan**: Independent of code validity, can run anytime
- **Coverage**: Depends on test execution, must run after tests

---

## 3. Local Development Workflow

### 3.1 Pre-commit Hooks (Automatic)

**Trigger**: Every `git commit`

**Purpose**: Fast, incremental validation of staged files

**Sequence**:
```bash
# For each chunk of 10 staged files:
1. Oxlint --fix              # Primary linter (fast, general-purpose)
2. ESLint --fix              # Secondary linter (TypeScript, React Native, Expo)
3. Biome check --write       # Formatter + import organization
4. Surgical Check           # Custom validation
```

**Configuration**: `.lintstagedrc.cjs`

**Behavior**:
- Runs only on staged files (`*.{js,ts,tsx}`, `*.json`)
- Chunks files in batches of 10 for performance
- Auto-fixes issues where possible
- Fails commit if any check fails

### 3.2 Manual Local Checks (Optional but Recommended)

**Quick Iteration Cycle**:
```bash
# Fast feedback during development
pnpm lint:oxlint:fix        # Oxlint only (fastest)
pnpm format:fix              # Biome formatting
pnpm check-types             # TypeScript validation
pnpm test                    # Unit tests
```

**Comprehensive Check**:
```bash
# Full validation before pushing
pnpm run check-all
```

**Check-all Includes**:
- Lint (Oxlint + ESLint)
- Type-Check
- Circular dependency check
- Deprecation audit
- Unused code check
- Security scan

---

## 4. Pre-push Hooks (Automatic)

**Trigger**: Every `git push`

**Purpose**: Comprehensive validation before remote push

**Configuration**: `.husky/pre-push`

### 4.1 Push Modes

#### Minimum Mode (`PUSH_MODE=min`)
```bash
commitlint + lint + react-doctor + check-types
```

#### Comprehensive Mode (Default)
```bash
commitlint + lint + react-doctor + check-types + check:hygiene + identity:check + i18n:check
```

#### Surgical Mode (Default Scope)
```bash
commitlint + lint + react-doctor + surgical-push-check
```

### 4.2 Environment Variables

```bash
# Scope: "all" or "changed" (default)
export PUSH_SCOPE=all

# Mode: "min" or default (comprehensive)
export PUSH_MODE=min
```

### 4.3 Pre-push Sequence

```bash
1. Commitlint              # Validate commit message format
2. Lint (Oxlint + ESLint) # Full workspace linting
3. React Doctor           # React anti-pattern detection
4. Check-Types            # TypeScript compilation
5. Optional Checks        # Hygiene, identity, i18n (if comprehensive mode)
6. Surgical Check         # If surgical scope
```

---

## 5. CI/CD Workflows

### 5.1 Quality Gate Workflow (`quality-gate.yml`)

**Trigger**: Pull requests to `main` branch

**Purpose**: Final validation before merge

**Sequence**:
```yaml
1. Verify Module Resolution  # Critical CSS imports
2. Lint (Oxlint + ESLint)   # Full workspace linting
3. React Doctor             # React anti-pattern detection
4. Type-Check               # TypeScript compilation (all packages)
5. i18n Policy Checks       # Internationalization validation
6. Unit Tests               # Test suite execution
7. Test Coverage            # Coverage reporting
8. Security Scan            # Snyk + Semgrep
```

**Failure Behavior**: Blocks PR merge if any check fails

### 5.2 PR Guard Workflow (`pr-guard.yml`)

**Trigger**: Push/PR to `main`/`develop` branches

**Purpose**: Early feedback on basic code quality

**Sequence**:
```yaml
1. Lint (Oxlint + ESLint)   # Full workspace linting
2. Check-Types              # TypeScript compilation
```

**Failure Behavior**: Blocks push/PR if checks fail

---

## 6. Tool Responsibilities

### 6.1 Two-Layered Linting Strategy

#### Primary Linter: Oxlint
- **Role**: Fast, general-purpose linting for JavaScript/TypeScript
- **Scope**: All JS/TS files across workspace
- **Speed**: Extremely fast (10-100x faster than ESLint)
- **Configuration**: `.oxlintrc.json`

#### Secondary Linter: ESLint
- **Role**: Specialized linting for TypeScript, React Native, Expo
- **Scope**: TypeScript files requiring deep type-aware linting, React Native components
- **Configuration**: `packages/eslint-config/base.js`

### 6.2 Formatter: Biome

- **Role**: Unified code formatting
- **Status**: Primary formatter (Prettier removed)
- **Configuration**: `biome.json`

### 6.3 Type Checking: TypeScript

- **Role**: Static type checking
- **Configuration**: Project references in `tsconfig.json`

### 6.4 React Doctor

- **Role**: React anti-pattern detection and health scoring
- **Scope**: React components and patterns
- **Integration**: Pre-push and CI workflows

---

## 7. Recommended Daily Workflow

### 7.1 Feature Development

```bash
# 1. Create feature branch
git checkout -b feature/my-feature

# 2. Code your changes
# ... write code ...

# 3. Quick local checks (iterative)
pnpm lint:oxlint:fix
pnpm format:fix
pnpm check-types

# 4. Run tests
pnpm test

# 5. Stage and commit (pre-commit hooks run automatically)
git add .
git commit -m "feat: add my feature"

# 6. Push (pre-push hooks run automatically)
git push origin feature/my-feature

# 7. Create PR (CI quality gate runs automatically)
# → quality-gate.yml validates before merge
```

### 7.2 Bug Fix

```bash
# 1. Create bugfix branch
git checkout -b fix/bug-description

# 2. Code your fix
# ... write fix ...

# 3. Quick validation
pnpm lint:oxlint:fix
pnpm format:fix
pnpm check-types
pnpm test

# 4. Commit and push
git add .
git commit -m "fix: resolve bug description"
git push origin fix/bug-description

# 5. Create PR
# → CI validates automatically
```

### 7.3 Hotfix (Urgent)

```bash
# 1. Use minimum push mode for speed
export PUSH_MODE=min

# 2. Quick fix
# ... write fix ...

# 3. Minimal validation
pnpm lint:oxlint:fix
pnpm check-types

# 4. Commit and push
git add .
git commit -m "fix: urgent hotfix"
git push origin fix/urgent-hotfix

# 5. Create PR with priority label
```

---

## 8. Troubleshooting

### 8.1 Pre-commit Failures

**Issue**: Pre-commit hooks fail

**Solution**:
```bash
# Check what failed
git status

# Fix issues manually
pnpm lint:oxlint:fix
pnpm format:fix

# Or bypass (not recommended)
git commit --no-verify
```

### 8.2 Pre-push Failures

**Issue**: Pre-push hooks fail

**Solution**:
```bash
# Check the report
cat reports/push_audit.md

# Fix issues locally
pnpm run check-all

# Retry push
git push
```

### 8.3 CI Failures

**Issue**: Quality gate workflow fails

**Solution**:
```bash
# Check CI logs for specific failure

# Replicate locally
pnpm run check-all

# Fix and push
git add .
git commit -m "fix: resolve CI failures"
git push
```

### 8.4 ESLint Runtime Crash

**Issue**: ESLint 10/typescript-eslint compatibility

**Current Status**: Previously disabled, now re-enabled

**Solution**: If crashes occur, check typescript-eslint version compatibility

---

## 9. Best Practices

### 9.1 Commit Messages

Follow conventional commits format:
```
feat: add new feature
fix: resolve bug
docs: update documentation
refactor: improve code structure
```

### 9.2 Branch Naming

```
feature/description
fix/description
hotfix/description
docs/description
```

### 9.3 PR Titles

Use conventional commits format for PR titles:
```
feat: add new feature
fix: resolve bug
```

### 9.4 Code Review Checklist

- [ ] Linting passes (Oxlint + ESLint)
- [ ] React Doctor passes
- [ ] Type-checking passes
- [ ] Tests pass
- [ ] Coverage is acceptable
- [ ] Security scan passes
- [ ] Documentation updated (if needed)

---

## 10. Performance Tips

### 10.1 Speed Up Pre-commit

- **Chunking**: Files are already chunked in batches of 10
- **Selective Staging**: Only stage files you're working on
- **Skip Hooks**: Use `--no-verify` only in emergencies

### 10.2 Speed Up Pre-push

- **Minimum Mode**: Use `PUSH_MODE=min` for urgent fixes
- **Surgical Scope**: Default scope only checks changed packages

### 10.3 Speed Up CI

- **Turbo Caching**: Enable turbo caching in workflows (TODO)
- **Parallel Jobs**: Some checks can run in parallel
- **Incremental Builds**: Only rebuild changed packages

---

## 11. Monitoring and Metrics

### 11.1 Health Scores

- **React Doctor**: Health score out of 100
- **Test Coverage**: Percentage coverage by package
- **Security**: Vulnerability count and severity

### 11.2 Reports

- **Push Audit**: `reports/push_audit.md`
- **Coverage Reports**: HTML reports in `coverage/`
- **Security Reports**: Snyk and Semgrep outputs

---

## 12. References

- [Code Quality Workflow Documentation](./code-quality-workflow.md)
- [React Doctor Integration Guide](./react-doctor-guide.md)
- [Sanctuary API Documentation SOP](../../apps/sanctuary-api/docs/docs-sop.md)
- [Testing Strategy Documentation](../../apps/gurudevi-mobile/docs/TESTING_STRATEGY.md)
