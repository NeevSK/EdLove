# Agent Tasks Queue
*Living checkbox list of infrastructure and feature gaps. Updated after every session.*

## 🔴 Foundation Today (High Priority)
- [ ] 2.8 @repo/logger package (Scaffold pino wrap)
- [ ] 2.9 @repo/idempotency package (Middleware + client hook)
- [ ] 2.10 @repo/types - Zod as SSOT (Migrate Student, Teacher, Attendance, etc.)
- [ ] 11.2 i18n logic foundation (Sinhala/Tamil font loading at app root)
- [ ] 3.1 Design tokens (@repo/ui/tokens.ts - ensure Sri Lanka device focus)
- [ ] 2.12 GitHub Actions enhancement (Type-check all packages, run Biome)

## 🔴 Database Foundations (Hat 04 leftovers)
- [ ] 1.1 Dual timestamps on mood_logs and attendance (occurred_at)
- [ ] 1.2 academic_cycle_id FK on attendance and grades
- [ ] 1.3 Enable RLS on audit.student_record_access_logs
- [ ] 1.4 Idempotency keys on all high-volume tables
- [ ] 1.5 Soft delete audit — add deleted_at to every missing table
- [ ] 1.11 pg_cron lifecycle jobs (purges/rotations)

## 🟡 Before Beta
- [ ] 10.3 MCP server scaffold (@modelcontextprotocol/sdk)
- [ ] 10.1 Outbound webhook system (signing, retries)
- [ ] 6.1 Canonical event schema (module.entity.action)
- [ ] 4.1 Full CASL ability definitions

## ⚫ Signal Only (The Hooks)
- [ ] 1.12 Ghost curriculum signal columns (gc_signals JSONB)
- [ ] 1.13 Gamification signal hooks table
