---
name: Bug report
about: Report a reproducible bug
labels: bug
---

## Describe the bug
A clear description. Include app (mobile/web), platform (Android/iOS/Web), and version (`app.json:version`).

## Reproduce
Steps, expected vs actual, logs/screenshots. Include `pnpm check-types` / `audit:secrets` output if relevant.

## Environment
- Commit / branch:
- `EXPO_PUBLIC_SUPABASE_URL` source: Doppler / `.env.local` / `supabase start`
- PowerSync enabled? (`isPowerSyncEnabled` / `gurudevi.core.power-sync`)

## Security Note
If this bug involves a security vulnerability (e.g., unauthorized data access, exposed secrets), please **do not** open a public issue. Instead, email security@edlove.org or open a private security advisory on GitHub.
