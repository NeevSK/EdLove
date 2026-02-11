# 🪷 ALPHA RELEASE TRACKER
**Goal**: Ship a high-quality, secure, and architecturally sound Alpha version of the Gurudevi School Platform.


---

## 🔴 CRITICAL - ARCHITECTURE & SECURITY
*Objective: Eliminate blocking technical debt and security risks.*

- [x] **RLS Security Audit**: Ensure `school_id` isolation logic is active for all tables (`classrooms`, `lessons`, `grades`, etc.).
- [x] **API Authorization Checks**: Implement `requireAuth` and `requireTeacherAccess` in `src/lib/api/` to prevent ID-guessing attacks.
- [x] **Type System Repair**: Create missing `Grade` types and `grading` utilities to fix production build failures.
- [x] **MMKV Initialization Fix**: Correct the MMKV import/usage in `src/lib/storage.ts`.
- [x] **Theme Compliance**: AUDIT all screens – 0% hardcoded colors allowed.

## 🔨 CORE FOUNDATION (PHASE 3)
*Objective: Complete the reusable component library from BUILD_ORDER.md.*

- [ ] **LotusButton**: Finalize primary/secondary/ghost variants.
- [ ] **BreathingLoader**: Standardize loading states across all screens.
- [ ] **Standardized Inputs**: Ensure `SanctuaryInput` is used for all forms with proper accessibility labels.

## 🚀 CURRENT MISSIONS (SPRINT 02/05)
*Objective: Features for the Alpha launch.*

- [ ] **Self (Mood Check-in)**: Complete the vertical flow from UI → Supabase.
- [ ] **Classroom (Enrollment)**: Finalize QR/Invite code handling and student roster view.
- [ ] **Library (Desk)**: Implement the "Personal Desk" for teachers.

---

## 📊 METRICS TO ALPHA
- **Build Status**: 🔴 FAILING (TSC Errors)
- **Security Check**: 🟠 PARTIAL (RLS in progress)
- **Sanctuary Aesthetics**: 🟠 60%
- **Feature Completeness**: 🟠 25%

---

## 📜 HISTORICAL SOURCES
*Merged from the following documents:*
- `ACTION_ITEMS.md` (Root)
- `BUILD_ORDER.md` (Docs v 3.0)
- `CURRENT_SPRINT.md` (Docs v 3.0)
- `00_DELEGATION_PACKET.md` (Docs v 3.0)
