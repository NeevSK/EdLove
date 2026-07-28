# Sovereign Form Builder: Current State Audit (May 2026)

## 1. Folder Structure Map

### **Package: `@repo/form-builder` (The Feature Layer)**
- `src/FormBuilder.tsx` — The main editor interface (Field list, property editor).
- `src/NativeForm.tsx` — The shared renderer that works on both Web and Mobile.
- `src/DynamicFormDemo.tsx` — A demonstration of JSON-to-UI hydration.
- `src/components/` — Specialized field components (Likert, Select, Slider).
- `src/screens/` — Full-page implementations (FormBuilderScreen, PublicFormScreen).
- `docs/VISION.md` — The architectural vision and roadmap.

### **Package: `@repo/core` (The Domain/Logic Layer)**
- `src/logic/forms/`
    - `form-manager.ts` — The state machine (handles values, errors, and validation).
    - `dynamic-loader.ts` — Home of the `FormHydrator` (converts JSON to Logic).
    - `analytics.ts` — Logic for response aggregation and CSV/XLSX exports.

### **Package: `@repo/ui` (The Primitive Layer)**
- `src/components/ui/form-control/` — Base layout components (labels, helper text, error states).
- `src/svelte/SvelteForm.svelte` — A lightweight Svelte implementation for marketing/web.

---

## 2. Main Files & Their "Job"

| File | Role | Responsibility |
| :--- | :--- | :--- |
| **`form-manager.ts`** | The Heart | Manages the live state of a form (dirty fields, validation errors). |
| **`FormBuilder.tsx`** | The Workshop | The UI where a teacher/admin adds, removes, and configures fields. |
| **`NativeForm.tsx`** | The Stage | The "Universal Renderer" that turns logic into visual inputs. |
| **`FormHydrator`** | The Translator | Takes a JSON blob from the DB and wakes it up into a `FormManager`. |
| **`analytics.ts`** | The Scientist | Computes averages, counts, and ranges from raw response data. |

---

## 3. Dependencies Found
- **Icons**: `lucide-react-native` (used for field types: grip, trash, save).
- **UI Primitives**: `@repo/ui` (Box, VStack, Button, Input).
- **Infrastructure**: `@repo/core` (API access, Storage gateways).
- **Distribution**: `@repo/scanner-kit` (used for generating the QR codes).

---

## 4. Honest Assessment: Functional or Scaffolding?

**Verdict: It is a "Functional Skeleton."**

### What is Functional (The "Plumbing"):
The system is impressively wired. You can design a form, save it to the database, generate a QR code for distribution, collect real-time responses, and export those responses to Excel. The data lifecycle is 80% complete.

### What is Scaffolding (The "UX Gaps"):
The interaction layer is where the work remains:
1.  **Drag-and-Drop**: Totally absent. Fields are in a static list.
2.  **Logic Tab**: A pure placeholder with a "Coming Soon" message.
3.  **Field Variety**: Limited to basic inputs. No file uploads, signatures, or multi-page support.
4.  **Theming**: No ability for creators to customize the look and feel per form.

---

## 5. Metadata
- **Audit Date**: 2026-05-16
- **Status**: Stable Plumbing / Early UI
- **Critical Path**: Drag-and-Drop Reordering
