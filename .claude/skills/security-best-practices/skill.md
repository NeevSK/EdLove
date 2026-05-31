# Security & Trust Boundaries Playbook (security-best-practices)

Authoritative security standards for data access, secret management, identity validation, and trust boundary protection.

---

## 1. Context & Operational Scope
Use this skill when modifying user identity checks, editing database schemas, writing Supabase policies, or handling authentication logic across the web/mobile app boundaries.

---

## 2. Row-Level Security (RLS) Standards
> [!CAUTION]
> Never leave a database table without RLS enabled. Every table MUST have explicit security policies mapping specific authenticated actions.

*   **Audit Protocol**: Before proposing any schema change, confirm RLS is active:
    ```sql
    ALTER TABLE public.target_table ENABLE ROW LEVEL SECURITY;
    ```
*   **Tenant Separation**: Always validate user identification using the system context:
    ```sql
    CREATE POLICY "Users can only read own data"
      ON public.target_table FOR SELECT
      USING (auth.uid() = user_id);
    ```

---

## 3. Secret Management
*   **Local Envs**: Absolutely never commit API keys, service roles, or database passwords to public/private Git repositories. Keep them restricted inside local `.env` files.
*   **Variable Isolation**: Validate that the gateway's `cleanEnv` sanitization cleans the process environment before spawning downstream workers, keeping secrets bounded.
*   **Git Leak Protection**: Ensure all keys and tokens conform to pattern boundaries defined in `.gitleaks.toml`.

---

## 4. Input Sanitization & Authentication Gates
*   **API Integrity**: Enforce strict compile-time Zod validations on all external-facing parameters before passing them to internal utilities.
*   **Auth Tokens**: Verify JWT claims and token signatures inside edge service environments before releasing sensitive application data.
