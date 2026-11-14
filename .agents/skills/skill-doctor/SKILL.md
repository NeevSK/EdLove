---
name: skill-doctor
description: "Sovereign diagnostic linter and health auditor for agent skills. Use when creating, modifying, auditing, verifying, or debugging skills in .agents/skills/ or .claude/skills/ to ensure valid frontmatter, trigger clarity, and link integrity."
---

# Skill Doctor Guide

Diagnostic auditor and integrity linter for AI agent skills across the Polymath Platform.

---

## 1. Purpose & Standards

Agent skills are the core cognitive affordances used by autonomous and interactive agents. The Skill Doctor audits skills against platform invariants:

1. **Manifest Presence:** Must contain `SKILL.md` or `skill.md`.
2. **Valid YAML Frontmatter:** Must contain fenced `---` frontmatter with:
   * `name`: Unique, kebab-case identifier.
   * `description`: Actionable description specifying explicit trigger phrases and domain boundary.
3. **Trigger Density:** Descriptions must be $>20$ characters and specify both *what* the skill does and *when* an agent should trigger it.
4. **Symlink Health:** Vendor skills linked via `pnpm approve` must point to valid node_modules targets.

---

## 2. Running the Skill Doctor

```bash
# Run full workspace audit
node scripts/skill-doctor.mjs

# Run in strict mode (fails CI on any error)
node scripts/skill-doctor.mjs --strict

# Or via npm script
pnpm run skill:doctor
```

---

## 3. Healing & Remediating Errors

### A. Missing `name` in Frontmatter
```markdown
---
name: my-skill
description: "Authoritative usage guide for..."
---
```

### B. Broken Symlinks
Run `pnpm approve --all` to re-synchronize and link upstream vendor skills.
