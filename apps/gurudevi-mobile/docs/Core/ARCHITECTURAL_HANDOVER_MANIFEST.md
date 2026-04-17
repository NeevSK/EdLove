# Architectural Handover Manifest: Gurudevi Platform

## 📅 Session Date: 2026-04-16
**Status**: Core Logic Hardened. Soft-Deletion standardized. Identity normalisation complete.

## 🏗️ 1. Infrastructure Baseline
*   **Supabase Project**: `qzoawolfkuwiuyaoiybz`
*   **Central View**: `unified_user_profiles` (Computed citizenship status + facet aggregation).
*   **Soft-Deletion**: Triggers installed for `schools` and `users` to cascade deletions. `deleted_by` and `deletion_reason` columns added to core tables.
*   **Identity Architecture**:
    *   **Level 1 (Traveler)**: Onboarded Guest (Anon).
    *   **Level 2 (Citizen)**: Authenticated + Profile (Personal Workspace).
    *   **Level 3 (Professional)**: Authenticated + Profile + School (Institutional Workspace).

## 📂 2. Recent Migrations
*   `20260416120000_robust_soft_deletion_infrastructure.sql`: Established cascade triggers and audit columns.
*   `20260416130000_faceted_identity_and_tenure_hardening.sql`: Implemented `is_onboarded()` gate, role synchronization triggers, and tenure tracking columns.

## 🎯 3. Upcoming Objectives
### Pillar A: Feature Flag & Capability Framework
*   Implement a robust system to toggle features based on:
    *   **Pricing Tiers** (Free vs. Pro vs. Founding Partner).
    *   **Citizenship Level** (Guest vs. Citizen vs. Professional).
    *   **Developmental Stage** (`bhumi_stage` from `user_growth_state`).

### Pillar B: Census Data Intelligence (Difficulty Analysis)
*   Address implementation around the "Difficulty Level" found in census data columns.
*   Strengthen the logic for how institutional data maps to pedagogical capacity.

## 🔗 4. Critical References
*   `apps/gurudevi-mobile/docs/Core/CITIZENSHIP_ARCHITECTURE.md`
*   `packages/database/reports/architectural_audit.md`
