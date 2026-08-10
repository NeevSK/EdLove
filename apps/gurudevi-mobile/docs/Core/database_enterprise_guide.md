# 🏛️ Gurudevi Enterprise Database Bible
*The Official Guide to the Faceted Identity Architecture (v2.0)*

## 1. The Core Philosophy: "Faceted Identity"
We do not use a "God Table." A user is a multifaceted entity whose attributes depend on their current role.

- **Identity Layer (`public.users`):** Authentication and *global identifiers*. Purged of institutional, preference, and growth data.
- **Institutional Protocols:** `teacher_profiles`, `student_profiles`, `principal_profiles`. (NIC, School Role).
- **Behavioral Protocols:** `user_growth_state`. (Onboarding, Bhumi stages).
- **Preference Protocols:** `user_preferences`. (Theme, Language, Data Saver).
- **Gratitude Protocols:** `thuthimal_gifts`. (Tier gifting ledger).
- **Social Protocols:** `user_social_state`. (Invitations, Social capital).

---

## 2. The "Veteran's Code" (Strict Rules)

### Rule #1: No Institutional Data in `users`
- **Bad:** `ALTER TABLE users ADD COLUMN grade_id UUID;`
- **Good:** `ALTER TABLE student_profiles ADD COLUMN current_grade_id UUID;`

### Rule #2: Type Integrity
- **Marks/Grades:** Use `NUMERIC(5,2)`. Never use `FLOAT` or `INTEGER` for academic scores.
- **Dates:** Always use `TIMESTAMPTZ`. Precision matters.

### Rule #3: Circular Dependency Ban
If Table A references Table B, Table B **must not** reference Table A. 
- **Solution:** Use a Profile or a Junction table to break the loop.

### Rule #4: The Feature Matrix (legacy guidance — do not use for new code)

This historical guide describes the old `tiers`/`tier_features` matrix. Those
tables still exist for compatibility, but they are not the current runtime
authority. New code must use `pricing_manifest` for the public tier/module
catalog, `user_entitlement_grants` for scoped commercial eligibility, and the
authorization pipeline for action/data access. Never hardcode "Pro" checks like
`if (user.is_pro)`.

The old query is retained only as historical context:

```sql
-- Reality: We check the Tier Feature Matrix
SELECT count(*) > 0 
FROM tier_features tf
JOIN users u ON u.tier_id = tf.tier_id
WHERE u.id = ? 
  AND tf.feature_key = 'ai_insights' 
  AND tf.is_enabled = true
  AND (tf.role_filter IS NULL OR tf.role_filter = u.authority);
```

### Rule #5: Thuthimal is a Transaction, Not a Field
Never add gift data directly to `users`. Use the `thuthimal_gifts` ledger. A user's "Pro" status is simply an active `tier_id` linked to a 'Gurudevi Pro' slug.

---

## 3. Maintenance Protocols

### 📈 Scaling with Partitions
When `MoodLog` or `AuditLogs` exceed 1 million rows, they MUST be partitioned by month. 
*Contact the Admin to run the Partitioning Script.*

### 🛡️ RLS Security
Security policies must avoid "Recursive Loops." 
- **Enterprise Pattern:** Use custom claims in the Supabase JWT (`auth.jwt() -> 'role'`) instead of querying the `users` table inside the policy.

### 🧪 Migration Health
Every migration must be **Idempotent**. Use `IF NOT EXISTS` and `DO $$ BEGIN ... END $$` blocks. 
*We do not break the database during upgrades.*

---

## 4. The Decoupling Matrix (Identity != Data)
The `public.users` table is strictly for **Auth & Identity Core**. All other duties are delegated to specialized protocols.

### **Decommissioned Columns (Banned in `users`)**:
| Category | Legacy Field (NULL in users) | New Facet Table |
| :--- | :--- | :--- |
| **Preferences** | `language`, `theme`, `data_saver_mode`, `orientation_seeds` | `user_preferences` |
| **Growth** | `onboarding_completed`, `profile_completed` | `user_growth_state` |
| **Social** | `invitations_remaining`, `invitations_sent` | `user_social_state` |
| **Institutional** | `school_role`, `work_roles`, `gender`, `date_of_birth` | Role Profiles |
| **Gratitude** | `is_thuthimal`, `thuthimal_gifter` | `thuthimal_gifts` |

**UI DISCOVERY BRIDGE**:
Use the `public.unified_user_profiles` view for all read-heavy UI operations. This view bridges the facets into a flat object for the client while maintaining normalized storage.

---
*Signed, Your Veteran DB Admin*
