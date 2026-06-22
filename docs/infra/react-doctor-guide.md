---
title: "React Doctor Integration Guide"
status: "active"
created: 2026-06-20
updated: 2026-06-20
author: "Naveen"
scribe: "Cascade"
tags: [react, code-quality, linting, tooling]
---

# React Doctor Integration Guide

This document establishes the integration and usage guidelines for React Doctor in the Polymath Platform monorepo.

---

## 1. Overview

**React Doctor** is a high-performance static analysis tool built on top of Oxlint that scans React projects for 47+ established best practices and anti-patterns. It provides automated code review capabilities specifically trained to spot common React ecosystem mistakes.

### Key Features
- **Built on Oxlint**: Rust-based, processes tens of thousands of lines in milliseconds
- **47+ Rules**: Covers performance, security, accessibility, and React best practices
- **Health Scoring**: Provides health score out of 100 with qualitative labels
- **Context-Aware**: Intelligent suggestions with explanations and fixes
- **Framework Support**: Built-in support for Next.js, Vite, Remix, React Native
- **CI/CD Optimized**: `--diff` flag to scan only changed files
- **GitHub Actions Integration**: Automatic PR comments and score outputs

---

## 2. Detection Capabilities

React Doctor detects the following categories of issues:

### Performance Issues
- Unnecessary useEffect hooks (overusing for state derivations)
- Heavy library imports (recharts, etc.) - suggests code splitting
- Loading state patterns - suggests useTransition hook

### Security Issues
- Hardcoded secrets (API keys, tokens)
- Common key format patterns in variable names

### Accessibility Issues
- Missing alt attributes on images
- Common accessibility violations

### React Best Practices
- Incorrect hook usage and order
- Prop drilling patterns
- Multiple setState calls in single useEffect
- State management anti-patterns

### Code Quality
- Bundle size issues
- Import organization problems
- Component structure issues

---

## 3. Installation & Setup

### Installation
React Doctor is installed as a dev dependency and can be run via npx:

```bash
npx react-doctor
```

### Configuration
Create a `doctor.config.ts` file at the root for project-specific rule customization:

```typescript
import { defineConfig } from 'react-doctor';

export default defineConfig({
  // Enable/disable specific rules
  rules: {
    // Custom configuration
  },
  // Framework detection
  framework: 'react-native', // or 'next', 'vite', etc.
});
```

---

## 4. Usage

### Local Development
```bash
# Full project audit
pnpm run audit:react-doctor

# Or directly
npx react-doctor
```

### CI/CD Integration
```bash
# Scan only changed files (for PRs)
npx react-doctor --diff
```

### Programmatic API
```typescript
import { diagnose } from 'react-doctor';

const result = await diagnose({
  cwd: process.cwd(),
  rules: ['all'],
});
```

---

## 5. Integration Points

### Pre-commit Hooks
React Doctor is **NOT** run in pre-commit hooks to maintain fast feedback. It runs in pre-push and CI workflows.

### Pre-push Hooks
```bash
# Automatic in pre-push
pnpm run audit:react-doctor
```

### CI Workflows
- **quality-gate.yml**: Runs after linting, before type-checking
- **pr-guard.yml**: Not currently included (could be added)

---

## 6. Proper Sequence in Quality Pipeline

**Recommended Sequence:**
1. **Lint (Oxlint + ESLint)**: Fast, catches basic syntax and style issues
2. **React Doctor**: Fast, catches React-specific anti-patterns
3. **Type-Check (tsc)**: Slower, requires valid syntax
4. **Tests**: Slowest, requires valid code

**Rationale:**
- Linting runs first because it's the fastest and catches basic issues
- React Doctor can run in parallel with linting (both fast)
- TypeScript compilation requires valid syntax, so it runs after linting
- Tests require valid code, so they run last

---

## 7. Output Format

React Doctor provides:
- **Health Score**: X/100 with qualitative label (Great, Good, Warning, Critical)
- **ASCII Art**: Friendly face that changes based on score
- **Summary**: Breakdown of issues by type and severity
- **Detailed Explanations**: Each issue with problem description and fix suggestion

---

## 8. Troubleshooting

### Common Issues

#### React Doctor Too Noisy in CI
- **Solution**: Use `--diff` flag to scan only changed files
- **Environment**: No special environment variables needed (unlike expo-doctor)

#### False Positives
- **Solution**: Configure rules in `doctor.config.ts` to disable specific rules
- **Report**: Report false positives to React Doctor GitHub repository

#### Performance Issues
- **Solution**: Use `--diff` flag for large codebases
- **Caching**: React Doctor is already optimized for speed (Rust-based)

---

## 9. Best Practices

### When to Run
- **Pre-push**: Always run before pushing to remote
- **CI**: Always run in quality gate workflows
- **Local**: Run periodically during development for proactive feedback

### Interpreting Results
- **Score 90-100**: Excellent, minimal issues
- **Score 70-89**: Good, minor improvements needed
- **Score 50-69**: Warning, significant issues present
- **Score <50**: Critical, requires immediate attention

### Fixing Issues
- Prioritize security and performance issues first
- Use the provided suggestions as guidance
- Consider architectural implications before applying fixes

---

## 10. Comparison with Other Tools

### vs ESLint
- **React Doctor**: React-specific, 47+ curated rules, health scoring
- **ESLint**: General-purpose, highly configurable, TypeScript support

### vs Oxlint
- **React Doctor**: Built on Oxlint, React-specific rules, health scoring
- **Oxlint**: General-purpose, extremely fast, basic linting

### vs Expo Doctor
- **React Doctor**: React anti-patterns, framework-agnostic
- **Expo Doctor**: Expo project configuration, dependency validation

---

## 11. Future Enhancements

- [ ] Create `doctor.config.ts` for project-specific rules
- [ ] Add React Doctor to pr-guard.yml workflow
- [ ] Integrate with AI coding agents (Cursor, Claude Code)
- [ ] Set up GitHub Actions integration for automatic PR comments
- [ ] Configure health score thresholds for CI failure

---

## 12. References

- [React Doctor GitHub Repository](https://github.com/millionco/react-doctor)
- [React Doctor Guide - Better Stack](https://betterstack.com/community/guides/scaling-nodejs/react-doctor/)
- [Oxlint Documentation](https://oxlint.com/)
- [Code Quality Workflow Documentation](./code-quality-workflow.md)
