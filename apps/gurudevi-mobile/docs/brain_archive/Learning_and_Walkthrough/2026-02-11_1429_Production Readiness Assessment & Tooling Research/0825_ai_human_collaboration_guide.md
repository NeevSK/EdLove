# AI & Human Developer Collaboration: The BDD Manifesto

This guide outlines our shared journey in building the `gurudevi-mobile` platform, focusing on why we chose **Behavior-Driven Development (BDD)**, the technical obstacles we overcame, and the best practices for our continued partnership.

---

## 1. Why We Choose BDD

BDD serves as the "Common Language" between the Human visionary and the AI implementer.

- **Shared Context**: Gherkin features (`.feature` files) provide a source of truth that both humans and AI can parse without ambiguity.
- **Living Documentation**: The tests *are* the documentation. If a test passes, we know the behavior exists and works as intended.
- **Decoupled Logic**: BDD focuses on *what* the system does, not *how* it's implemented. This allows us to refactor under the hood (e.g., changing UI libraries) while keeping the behavioral verification stable.
- **AI-Human Handshake**: The human defines the "What" (Gherkin), and the AI produces the "How" (Step Definitions & UI Code).

---

## 2. The Great "Web vs. Native" Gotcha

In a hybrid environment like Expo (React Native + Web), testing is the most significant hurdle.

### The Invariant Trap
React Native components (like `View` and `Text`) behave differently in a Jest environment than standard HTML elements. 
- **The Error**: `Invariant Violation: Text strings must be rendered within a <Text> component.`
- **The Cause**: Passing a string directly to a mock component that renders as a `div` or doesn't correctly wrap children in a native `Text` component.
- **The Fix**: We adopted a **Web-First BDD strategy**. By using `@testing-library/react` and mocking UI components as standard HTML tags during tests, we bypass native-only invariant checks while still verifying the core business and UI logic.

---

## 3. Where We Are Now

We have established a **Stable Testing Foundation**:

1.  **Web-First Mocking**: Standardized HTML-based mocks for `@gluestack-ui/themed` and common Expo modules.
2.  **Isolated Verification**: BDD tests now focus on component logic and state transitions in an environment that Jest can reliably reconcile.
3.  **100% Pass Rate**: Core flows like `Auth Refinement` (duplicate email detection) and `Invitation Acceptance` are fully verified.

---

## 4. Best Practices: What to Do & What Not to Do

### ✅ What to Do
- **Wrap State Updates**: Always use `act()` or `waitFor()` when an action (like a button press) triggers a state change or an async call (Supabase).
- **Prefix Mock Variables**: In Jest, any variable defined outside `jest.mock` that is used inside it *must* be prefixed with `mock` (e.g., `mockStoreState`). This avoids scope errors.
- **Use Gherkin for Changes**: Before starting a new feature, write the Gherkin scenario first. It clarifies requirements for the AI instantly.
- **Specify Encoding**: When saving files or reports on Windows, use `utf8` encoding to ensure the AI reads special characters (emojis, checkmarks) correctly.

### ❌ What Not to Do
- **Don't ignore Invariant Errors**: If a test fails with a "Text string" error, it's usually a mock that isn't wrapping its children properly. Don't just `@ts-ignore` it—fix the mock.
- **Don't Test "Through the Glass" if Unnecessary**: Avoid testing platform-specific native behaviors (like actual camera hardware) in BDD. Mock the interface and test the application's *response* to the data.
- **Don't mix Testing Libraries**: Stick to the established pattern (currently Web-First with HTML mocks) to avoid environment collisions.

---

## 5. The Power of Reports (.txt vs. Console)

For an AI developer, the terminal is a "blind spot" unless explicitly captured.

- **The Problem**: If an AI runs a test and it fails, it only sees the exit code unless the output is redirected.
- **The Solution**: Always pipe test results to a `.txt` file (e.g., `npm test > report.txt 2>&1`).
- **Why .txt matters**: 
    1. **Context Persistence**: The AI can read the file multiple times to analyze complex stack traces.
    2. **Debugging Depth**: It captures `console.log` statements and DOM dumps that are often lost in standard tool outputs.
    3. **Universal Parity**: A `.txt` file with UTF-8 encoding ensures that what the Human sees in the terminal is exactly what the AI sees in the file.

---

## 6. Current Status & Future Focus

We have successfully navigated the **Canal of Initiation** (Auth & Onboarding). Our next focus is **Ecological Layer Refinement**—deepening the branding, portals, and governance logic.

**Remember**: Every feature starts with a behavior. Define the behavior, and the implementation will follow.

---
*Created by Antigravity & Sovereign Developer*
