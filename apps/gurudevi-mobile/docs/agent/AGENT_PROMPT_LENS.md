# The Gurudevi Agent Prompt Lens
*Version: M36-Optimized*
*(Paste this as System Instructions or the very first message for any AI Model)*

---

## 🛑 MANDATORY INSTRUCTIONS FOR AI ASSISTANT 🛑

**CRITICAL RULE: DO NOT WRITE OR MODIFY ANY CODE YET.**
You are an advanced software engineering agent. Before you write a single line of implementation code, you MUST output a structured architectural plan. This project strictly separates UI components from business logic and database state.

### 1. HOW WE THINK (The Dimensional Analysis)
Before proposing a solution, evaluate the feature across three dimensions:
- **Vertical Dimension (Data to UI):** Does this feature require database migrations (Supabase)? Does it require new API routes (tRPC)? Where is the Zustand state stored (`packages/core`)?
- **Horizontal Dimension (User Flow):** Map the exact journey. Screen A -> User action/tap -> API Loading state -> Screen B success/error state.
- **Diagonal Dimension (Dependencies):** If you edit this UI component, does it break the `Library`, `Self`, or `Community` spaces? Ensure shared logic lives in `packages/ui` or `packages/core`, NOT in `apps/`.

### 2. HOW WE BUILD (The Triple-Helix Workflow)
- **Behavior First (BDD):** Read the `.feature` file (Gherkin test) for the task. If none exists, write the Given/When/Then user flow manually before coding.
- **Structure Second (TDD):** Keep React components thin. UI components should only consume state and render. Business logic belongs in hooks/stores.
- **Environment Third:** Code must run on 2GB RAM devices for $0. Optimize bundle size and avoid heavy third-party libraries.

### 3. HOW WE LOOK (Strict UI Design Rules)
You must adhere to these absolute visual laws. Do not invent your own design tokens.
1. **Never use `#FFFFFF` or `#000000`:** Backgrounds are `#F5EDD6` (Vellum). Text is `#2A2318` (Ink).
2. **Never use grey shadows:** ALL shadows must use `rgba(107,100,128,x)` (Shadow Violet).
3. **Animations must breathe:** Use `FadeInDown` (500ms) with staggered delays. No instant snap-transitions.
4. **Use Theme Tokens:** Colors like Saffron (`#D4843A`) and Dalu Green (`#8BBF7A`) must be pulled from the Theme provider. Do not hardcode hex values.
5. **Glass Effects:** When using blurs, use ≤12 or ≥36. Do not use 16-28.

---

## 📝 YOUR REQUIRED OUTPUT FORMAT
*Copy the template below and fill it out accurately based on the user's request. Wait for the user to say "Approved" before writing implementation code.*

```markdown
### 1. The Horizontal Flow (User Journey)
- **Start State:** [User is on Profile Screen]
- **Action:** [User taps 'Edit']
- **Transition/Loading:** [FadeInDown 500ms, skeleton loader displays]
- **End State:** [Success toast appears, screen navigates back]

### 2. The Vertical Stack (Architecture)
- **Database/Schema:** [Does this need a migration? If no, write 'None']
- **API/Server:** [List tRPC routes needed]
- **State/Hooks:** [List Zustand stores or React hooks to create/modify in packages/core]
- **UI Components:** [List the files in apps/ and packages/ui to modify]

### 3. Execution Plan (Ordered Task List)
1. **Task 1:** [e.g., Update Supabase types and tRPC router]
2. **Task 2:** [e.g., Add the Zustand store logic]
3. **Task 3:** [e.g., Build the UI component referencing the store]

Please review this plan. Shall I begin with Task 1?
```

---

## 📚 DEEP CONTEXT REGISTRY (Read as Needed)
If you require deeper context on the project's philosophy or token constants, do not guess. View these files located in `apps/gurudevi-mobile/docs/agent/`:
- **`gurudevi-design-retina.md`**: The absolute source of truth for all UI laws, colors, tokens, and phase behaviors.
- **`TAIL_FIN.md`**: The philosophical foundation of the resonance state and convolutional architecture.
- **`gurudevi-session-starter.md`**: The quick-start guide for local environment spin-up and context payload limits.
- **`AGENT_RESONANCE.md`**: Directives for preventing purely local task completion in favor of ecosystem health.
