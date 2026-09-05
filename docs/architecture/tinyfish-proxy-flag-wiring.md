---
title: "TinyFish Proxy — Flag Wiring Design (OFF Default, Double-Gated)"
status: "draft"
created: 2026-09-04
updated: 2026-09-04
author: "Naveen"
scribe: "opencode"
tags: [flags, growthbook, ai, proxy, rollout]
---

# TinyFish Proxy — Flag Wiring Design

> **Guardrails:** Both flags OFF by default. Server-side evaluation only. No mobile runtime changes.

## Flag Definitions (GrowthBook)

```yaml
# gurudevi.ai.ai-assistant (EXISTING)
key: gurudevi.ai.ai-assistant
name: "AI Assistant (Beta)"
project: gurudevi
environment: production
defaultValue: false
type: boolean
description: "Master gate for all AI Assistant features"
tags: [ai, beta, mobile, web]
owner: "ai-team"
reviewAt: "2026-09-30"

---
# gurudevi.ai.web-evidence (NEW)
key: gurudevi.ai.web-evidence
name: "Web Evidence Proxy (TinyFish Pilot)"
project: gurudevi
environment: production
defaultValue: false
type: boolean
description: "Enables sovereign TinyFish web-evidence tool behind AI Assistant. OFF by default. Requires ai-assistant flag also ON."
tags: [ai, pilot, tinyfish, sovereign, server-side]
owner: "ai-team"
reviewAt: "2026-09-30"
prerequisites:
  - gurudevi.ai.ai-assistant  # feature-level prerequisite
```

## Server-Side Evaluation (Sanctuary API)

```typescript
// sanctuary-api/src/lib/flags.ts
import { growthbookClient } from '@repo/core/adapters/growthbook';

export async function getWebEvidenceFlags(context: { schoolId: string; userId: string }) {
  const { schoolId, userId } = context;

  // Evaluate both flags with school + user attributes
  const [aiAssistant, webEvidence] = await Promise.all([
    growthbookClient.getFeatureValue('gurudevi.ai.ai-assistant', {
      attributes: { schoolId, userId, citizenship: 'teacher' },
    }),
    growthbookClient.getFeatureValue('gurudevi.ai.web-evidence', {
      attributes: { schoolId, userId, citizenship: 'teacher' },
    }),
  ]);

  return {
    aiAssistantEnabled: aiAssistant === true,
    webEvidenceEnabled: webEvidence === true && aiAssistant === true, // AND gate
  };
}

// Usage in chat handler
const flags = await getWebEvidenceFlags({ schoolId, userId: session.user.id });
if (!flags.aiAssistantEnabled || !flags.webEvidenceEnabled) {
  return streamStandardChat(req, ctx); // graceful degrade
}
```

## Client-Side (Mobile) — No Changes Required

The mobile app **does not evaluate** `web-evidence` flag. It only sends `privacyMode` in chat context.

```typescript
// packages/ai/src/hooks/useAIAgent.ts:237-252 (EXISTING - no change)
body: {
  context: {
    // ... existing fields
    privacyMode, // 'saved' | 'temporary' | 'incognito'
  },
},
```

Server reads `privacyMode` from request body and respects it (cache bypass, no query log).

## Rollout Plan

| Phase | `ai-assistant` | `web-evidence` | Audience |
|-------|----------------|----------------|----------|
| 0 (now) | OFF | OFF | — |
| 1 (staging) | ON | ON | Internal team only (forced via override) |
| 2 (pilot) | ON | ON | Single pilot school (forced override) |
| 3 (beta) | ON | ON | Beta cohort (percentage rollout) |
| 4 (GA) | ON | ON | All schools (after 2026-09-30 review) |

**Force overrides** for phases 1-2 via GrowthBook "Force" rules on `school_id` attribute.

## Reversibility

| Action | Effect |
|--------|--------|
| `web-evidence` → OFF | Zero web evidence, instant |
| `ai-assistant` → OFF | Zero AI features, instant |
| Delete Doppler key | Zero vendor calls, instant |
| Drop cache reads | Cache unused, instant |

## Audit Trail

```typescript
// Emitted on every chat request (server-side)
await analytics.capture('ai_chat_flag_state', {
  schoolId,
  aiAssistantEnabled: flags.aiAssistantEnabled,
  webEvidenceEnabled: flags.webEvidenceEnabled,
  privacyMode,
  hasWebEvidence: flags.webEvidenceEnabled && budgetHasHeadroom,
});
```

## GrowthBook UI Setup Checklist

- [ ] Create `gurudevi.ai.web-evidence` flag (boolean, default `false`)
- [ ] Add prerequisite: `gurudevi.ai.ai-assistant`
- [ ] Add tags: `ai`, `pilot`, `tinyfish`, `sovereign`, `server-side`
- [ ] Set `reviewAt: 2026-09-30`
- [ ] Create staging override rule: `school_id` IN (`staging-school-uuid`) → force `true`
- [ ] Document in `docs/architecture/2026-08-04-growthbook-cloud-rollout.md` (append)