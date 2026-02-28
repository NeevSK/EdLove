# GURUDEVI AI AGENT CONTEXT (CORE TRUTH)
*Definitive Directives for Building in the Educational Ecology*

---

## 🛑 MANDATORY PROTOCOLS
1. **Behavior First (BDD)**: Always read the `.feature` files (if present) before implementation. Define Given/When/Then.
2. **Resonance Planning**: Evaluate features across **Vertical** (Zustand -> UI), **Horizontal** (User Journey), and **Diagonal** (Dependency impact) dimensions.
3. **No Code Without Plan**: Never modify implementation code until a plan is explicitly approved via the "Required Pre-Compilation Output Format."

---

## 1. ECOSYSTEM STRUCTURE
Gurudevi is a **Monorepo**. Respect the boundaries:
- **State & Logic**: `@repo/core` (`packages/core/src`). Zustand stores and API logic live here.
- **UI & Tokens**: `@repo/ui` (`packages/ui/src`). Design tokens, base components, and theme providers.
- **Features**: `apps/gurudevi-mobile/src/screens`. Mobile-specific screens and navigation.

### Essential Search Paths
- State Stores: `packages/core/src/stores/`
- API Logic: `packages/core/src/api/`
- Navigation: `apps/gurudevi-mobile/src/navigation/`
- Local UI: `apps/gurudevi-mobile/src/components/`

---

## 2. CODING RULES (The Sacred Laws)

### 2.1 Language & Text
- **Zero Hardcoded Strings**: All user-facing text must use `i18next` (`t('namespace.key')`).
- **Trilingual First**: Ensure keys exist for Sinhala (`si`), Tamil (`ta`), and English (`en`).
- **Typography**: Respect Sinhala vertical rhythms (1.6x - 1.8x line height).

### 2.2 Data & Security
- **Multi-Tenancy**: Every database table MUST have a `school_id`.
- **Primary Keys**: Always use **UUIDs**. Generate on client for offline resilience.
- **RLS**: Never bypass Row-Level Security. Queries must be joined on the active `school_id`.

### 2.3 Visual Performance
- **The 2GB Constraint**: Low-end devices are our priority. Minimize overdraw and fill-rate pressure.
- **GPU Awareness**: Use `react-native-reanimated` with the native driver. Disable heavy blurs/animations on `low-tier` devices.

---

## 3. HOW TO LOOK (Visual Tokens)
Reference `AGENT_PROMPT_LENS.md` and `TRUTH_DESIGN_SYSTEM.md` for tokens.
- **Background**: `#F5EDD6` (Vellum)
- **Text**: `#2A2318` (Ink)
- **Primary**: `#D4843A` (Saffron)
- **Shadows**: `rgba(107, 100, 128, x)` (Shadow Violet)
- **Glass**: Blur values ≤12 or ≥36 ONLY.

---

## 4. ONBOARDING SEQUENCE FOR AGENTS
1. **Research**: Read `TRUTH_ARCHITECTURE.md` and `AGENT_PROMPT_LENS.md`.
2. **Locate**: Identify state in `packages/core` and UI in `packages/ui`.
3. **Propose**: Use the format in `AGENT_PROMPT_LENS.md` section 2.
4. **Build**: Thin screens, thick hooks/stores.
