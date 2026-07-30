---
title: "Polymath Platform: Testing Strategy & Infrastructure (April 2026)"
status: "active"
created: 2026-05-06
updated: 2026-05-06
author: "Naween"
tags: [reorganized]
---

# Polymath Platform: Testing Strategy & Infrastructure (April 2026)

## 1. Philosophy: Confidence through Automated Clarity
In the Polymath ecosystem, testing is not a "final stage" but a **continuous dialogue** between the architecture and the developer. We prioritize high-signal, low-noise automation that enables rapid iteration without sacrificing the resilience of our core systems.

### Core Principles
- **Sovereign Testing**: Each package (L0-L4) must be testable in isolation.
- **Visual Evidence**: E2E tests must provide visual traces (videos/screenshots) for deterministic debugging.
- **User-Centric Assertions**: We test user outcomes (e.g., "User can complete onboarding") rather than implementation details (e.g., "Button has 'on-click' handler").
- **AI-Native Validation**: Systematic evaluation of LLM prompts and outputs to ensure safety and quality.

---

## 2. The Elegant Stack

### 🚀 Web E2E: Playwright
- **Role**: Universal browser automation for all `*-web` apps.
- **Rationale**: Built-in auto-waiting, multi-tab support, and the **Playwright Trace Viewer** make it the most resilient choice for modern reactive UIs.
- **Layer**: Service/User (L4).

### 📱 Mobile E2E: Maestro
- **Role**: Native mobile flow validation for `gurudevi-mobile`.
- **Rationale**: YAML-driven simplicity with high reliability. Maestro handles the complexities of the React Native runtime (like interaction with native modules) better than legacy Appium/Selenium.
- **Layer**: Service/User (L4).

### 🧪 Logic & Integration: Vitest
- **Role**: Fast unit and integration tests for `packages/*` and app logic.
- **Rationale**: Vite-native execution ensures that the test environment exactly mirrors the build environment.
- **Layer**: Core/Domain/Infra (L0-L3).

### 🧠 AI Evaluation: Promptfoo
- **Role**: Evaluating LLM responses, measuring hallucinations, and ensuring safety.
- **Rationale**: As an AI-heavy platform, we must treat prompts as code that requires its own test suite.
- **Layer**: Infrastructure (L2).

---

## 3. Implementation Map

### Web (Playwright)
Each web app features a `tests/` directory with `.spec.ts` files. 
- **Command**: `pnpm exec playwright test`
- **Focus**: Critical user paths (Login, Workspace Creation, Profile Editing).

### Mobile (Maestro & Playwright)
- **Maestro**: Flows defined in `apps/gurudevi-mobile/maestro/*.yaml` for native-first validation.
- **Playwright**: Tests defined in `apps/gurudevi-mobile/tests/e2e/*.spec.ts` to validate the **Web/Metro** version of the app.
  - **Command**: `pnpm run test:e2e` (inside `gurudevi-mobile`)
  - **Focus**: Responsive navigation, web-shim correctness, and cross-browser consistency.

### Core (Vitest)
Business logic and repository adapters are verified using Vitest.
- **Command**: `pnpm run test`
- **Focus**: Data normalization, authority resolution, and schema compliance.

---

## 4. Developer Experience (DX)
- **Pre-push Hooks**: Husky runs `pnpm run check-all`, which includes critical unit tests.
- **CI/CD Integration**: Playwright and Maestro runs are triggered on every PR, with artifacts (traces/videos) uploaded to the CI dashboard.
- **Local Debugging**: Use `pnpm run test:ui` in any package for an interactive testing dashboard.

---

## 6. The 2026 Robustness Roadmap (DX+)

### 👁️ Visual Regression: Pixel-Perfect Guardrails
For a premium UI like Polymath, code correctness isn't enough—visual integrity is paramount.
- **Tool**: Playwright `toMatchSnapshot()`.
- **Strategy**: Capture "Golden Images" of components and full-page layouts. Catch unintended CSS shifts before they reach the user.

### 🎭 API Mocking: Mock Service Worker (MSW)
Eliminate flakiness by decoupling frontend tests from live backend availability.
- **Tool**: `msw` 2.0+.
- **Strategy**: One set of mock handlers used across:
  1. **Vitest** (Unit)
  2. **Playwright** (E2E)
  3. **Local Dev** (Developing offline or before the backend is ready).

### ♿ Automated Accessibility (a11y)
Accessibility is a core architectural requirement, not an afterthought.
- **Tool**: `@axe-core/playwright`.
- **Strategy**: Every E2E test automatically runs an `axe` audit on the page state, failing the build on WCAG violations.

### 🏗️ Dagger: Local-First CI
Ensure that "It works on my machine" is a guarantee, not a hope.
- **Expansion**: Update `dagger.ts` to wrap E2E runs in containers. This allows developers to run the entire CI pipeline locally with the exact same environment as the cloud.

### 🤖 AI-Native DX
- **Agentic Testing**: Using AI agents to crawl the app and identify "Happy Paths" and "Edge Cases" based on recent code changes.
- **Auto-Fixing**: Integration where a failed test provides the LLM context to suggest a fix for the underlying code.
