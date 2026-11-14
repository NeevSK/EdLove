## flag-create

---
name: flag-create
description: Create a new feature flag in GrowthBook via the REST API. Use when the user asks to "create a feature flag", "add a flag for X", "wrap this in a feature flag", "I need a flag to gate this", or "feature toggle for X". For adding rules to an existing flag, use flag-rules. For removing a flag, use flag-cleanup.
allowed-tools: Bash(${CLAUDE_PLUGIN_ROOT}/scripts/gb-call *)
---

# flag-create

Create a new feature flag in GrowthBook. We always set `{enabled: false}` for every environment explicitly in the payload, so the flag ships disabled regardless of the org's default-state-for-new-environments setting — the user must enable it after creation. Feature keys are permanent; pick the name carefully.

All API calls go through the bundled helper: `${CLAUDE_PLUGIN_ROOT}/scripts/gb-call`. It needs `GB_API_KEY` — set in your shell, or written to `~/.config/growthbook/.env` by `/growthbook:gb-setup`. If it's missing or invalid, gb-call's error message points back at `/growthbook:gb-setup`.

## Workflow

1. **Confirm intent.** Restate what the flag will gate in one sentence. Stop if the user wants to run an A/B test (route to the appropriate experiment skill based on what's already in scope) or a rule on an existing flag (route to `flag-rules`).

2. **Check the key isn't taken.**
   ```bash
   gb-call GET /api/v2/feature-keys
   ```
   Verify the proposed key isn't already in the returned list. If it is, propose a variant; the API will reject the collision and the key cannot be renamed afterward.

3. **Pick a value type.** One of `string`, `number`, `boolean`, `json`. Default to `boolean` for an on/off gate. Use `string` or `json` only when the flag carries config (variant copy, threshold values, structured payload).

4. **Resolve the project (optional).** If the user mentions a project name, list projects and pick the ID:
   ```bash
   gb-call GET /api/v1/projects
   ```
   Flags scoped to a project are easier to govern than the default org-wide bucket. If unclear, ask the user.

5. **Resolve environments.** GrowthBook expects the create payload to include an `environments` map listing every environment. Get them:
   ```bash
   gb-call GET /api/v1/environments
   ```
   Build the map with each environment disabled.

6. **Confirm naming.** The v2 endpoint regex accepts `[a-zA-Z0-9_.:|-]` (the user-facing docs and error messages recommend the narrower `[a-zA-Z0-9_-]`). Default to **kebab-case** (`new-checkout-flow`, `dark-mode`, `pricing-experiment-2026-q2`) — it matches what the docs recommend, keeps keys consistent across teams, and avoids any future tightening of the regex. Show the proposed key to the user before creating.

7. **Build the payload and create the flag.** Construct a JSON object:
   ```json
   {
     "id": "<kebab-case-key>",
     "valueType": "boolean",
     "defaultValue": "false",
     "description": "<short description>",
     "environments": {
       "production": { "enabled": false },
       "staging":    { "enabled": false }
     },
     "project": "<project-id, omit if org-wide>"
   }
   ```
   Then POST it:
   ```bash
   echo '<payload-json>' | gb-call POST /api/v2/features -
   ```

8. **State what happens next.** Tell the user explicitly: the flag is **disabled in all environments** and has **no rules** yet. Offer two follow-ups:
   - To turn it on in an environment or attach a targeting rule, use `flag-targeting`.
   - To use this flag as the variation switch in an A/B test, use `experiment-design` with the flag's ID.

## Guardrails

- **Feature keys are permanent.** GrowthBook does not let you rename a flag's `id` after creation. Confirm the proposed name with the user before calling the API.
- **`owner` defaults to the token's user.** Omit `owner` from the create payload — the API attributes the flag to the user the `GB_API_KEY` belongs to. Only set `owner` explicitly (an email or `u_...` userId) if the user wants to assign the flag to someone else.
- **ID character set: prefer kebab-case.** The v2 endpoint regex still accepts `[a-zA-Z0-9_.:|-]`, but the user-facing docs and error messages recommend `[a-zA-Z0-9_-]`. Don't propose IDs with `.`, `:`, or `|` — they may be tightened in a future version. Existing legacy keys with those characters can be left alone.
- **Always set `{enabled: false}` explicitly per environment.** Don't rely on the org's default-state-for-new-environments setting — it's configurable and may default to enabled. Tell the user the flag is disabled everywhere; silent zero evaluation (or worse, accidentally-enabled evaluation) is a top GrowthBook footgun.
- **`defaultValue` is always serialized as a string.** `"false"` for boolean off, `"0"` for numeric, JSON-encoded text for `json`. The API rejects non-string values.
- **v2 environments map is just `{enabled: bool}` per env.** Rules are no longer nested under each environment — they're a top-level array on the flag, added later via `flag-targeting` (or directly through the v2 revision endpoints). Do not include `rules: []` inside each env.
- **Stop before creating if the user wants an experiment.** Hand off to `experiment-design`. Creating a flag without the corresponding experiment is a common confusion that produces orphaned flags.
- **Ask, do not guess.** If `valueType`, `defaultValue`, or project are ambiguous, ask. The flag is permanent.

## Endpoints used

- `GET /api/v2/feature-keys` — list all feature flag keys (no pagination cap)
- `GET /api/v1/projects` — list projects, used to resolve a project name to an ID
- `GET /api/v1/environments` — list environments, used to construct the `environments` map
- `POST /api/v2/features` — create the flag

## After creation

The response contains the flag's full configuration. Show the user the flag ID, a reminder that it's disabled everywhere, and a link to the flag in the GrowthBook UI. Derive `<host>` from `GB_API_URL` by replacing `api.` → `app.` (cloud default: `https://app.growthbook.io`). Link: `<host>/features/<flag-id>`.

## Handoffs

- `flag-toggle` — to enable the flag in an environment
- `flag-rules` — to add rules (routes to the appropriate rule type skill)
- `flag-default-value` — to change the fallback value served when no rules match
- `flag-metadata` — to set project, tags, description, or owner after creation
- `flag-experiment` — to wire this flag to an A/B experiment
- `experiment-design` — if the user actually wants a full A/B test (create experiment first, flag second)


---

## flag-rules

---
name: flag-rules
description: Entry point for working with rules on a GrowthBook feature flag. Use when the user asks "what rules does flag X have", "show me the rules on this flag", "add a rule", "delete a rule", "reorder the rules", or describes a flag operation without specifying the rule type. Routes to specialized skills for creating and editing specific rule types. Also handles listing, reordering, and deleting rules directly. For specific rule types, use flag-targeting for force/rollout rules, flag-experiment for experiment-ref rules, flag-schedule for timed activation, flag-ramp for progressive rollouts, flag-monitoring for monitored rollouts, flag-prerequisites for feature-level prerequisite gates.
allowed-tools: Bash(${CLAUDE_PLUGIN_ROOT}/scripts/gb-call *)
---

# flag-rules

Entry point for rule operations on a GrowthBook feature flag. Use this skill to inspect rules, delete a rule, or reorder rules. For creating or editing rules, this skill identifies the right rule type and routes to the specialized skill.

All API calls go through the bundled helper: `${CLAUDE_PLUGIN_ROOT}/scripts/gb-call`. It needs `GB_API_KEY` set in env or written to `~/.config/growthbook/.env` by `/growthbook:gb-setup`.

## Rule types reference

| Type | What it does | Skill |
| --- | --- | --- |
| `force` / `rollout` | Serve a specific value, optionally to a random % of users. `rollout` is the same type as `force` but with `coverage < 1` and a required `hashAttribute` — the server auto-flips between the two based on effective coverage. | flag-targeting |
| `experiment-ref` | Run an A/B test via a linked experiment | flag-experiment |

Rules evaluate **top-to-bottom, first match wins**. Order matters.

## Workflow

### Path A — List rules on a flag

```bash
gb-call GET /api/v2/features/<flag-id>
```

Present the `rules` array in evaluation order with a numbered list:

```
Rules on `<flag-id>` (top-to-bottom evaluation):
  1. [force]          all environments              value="true"    "Beta testers" (saved group)
  2. [rollout]        production                    coverage=10%    hash=id
  3. [experiment-ref] production, staging           → exp_abc123    "Checkout experiment"
  4. [force]          staging                       value="false"   "Kill switch"
```

For each rule show: number, type, scope (allEnvironments or specific envs), enabled state, a one-line summary of the rule's effect, and the rule ID (UUID) for reference.

### Path B — Route to the right skill for creating/editing a rule

Ask the user what they're trying to accomplish and route:

| User intent | Route to |
| --- | --- |
| "Serve X to users matching condition Y" | flag-targeting |
| "Roll out to N% of users" | flag-targeting |
| "Run an A/B test" (experiment already exists) | flag-experiment |
| "Run an A/B test" (starting from scratch) | experiment-launch — it creates the experiment AND reuses or creates the flag end-to-end |
| "Turn this on at 9am, off at 5pm" | flag-schedule |
| "Gradually increase traffic from 5% to 100%" | flag-ramp |
| "Gradually release with guardrail metric monitoring" | flag-monitoring |
| "Only if feature Y is enabled" (whole flag) | flag-prerequisites |
| "Only if feature Y is enabled" (one rule) | flag-targeting |

If the user describes something ambiguous, ask one clarifying question before routing.

### Path C — Delete a rule

Show the numbered list (Path A) so the user can pick by number. Confirm:

> "Delete rule `<N>` (`<type>`, `<scope>`, `<summary>`)? This goes into a draft and only takes effect after publishing."

```bash
gb-call DELETE /api/v2/features/<flag-id>/revisions/new/rules/<rule-id>
```

Capture the returned `version`. Hand off to flag-publish.

**safe-rollout removal:** The server cleans up the `SafeRollout` entity when the rule is still in draft and the rollout hasn't started. If the rollout has already started, the SafeRollout entity is preserved (no data loss) but the rule is removed from the flag.

**experiment-ref removal:** The linked experiment is not affected. Removing the rule on the flag doesn't stop or modify the experiment.

### Path D — Reorder rules

Show the current order (Path A). Ask the user for the new order (by number or by describing the desired sequence).

```bash
echo '{"ruleIds":["<id-1>","<id-2>","<id-3>"]}' \
  | gb-call POST /api/v2/features/<flag-id>/revisions/new/rules/reorder -
```

Supply the **complete ordered array** of all rule IDs — this replaces the full order, not a swap. Capture the returned `version`. Hand off to flag-publish.

Remind the user that evaluation is top-to-bottom, first match wins — rules higher in the list take priority.

## Guardrails

- **Rules evaluate in order; position matters.** A broad rule (e.g., 50% rollout with no condition) placed first will match before a more specific rule below it. Surface this when the user adds or reorders.
- **Rule ID is a string UUID (`fr_...`), not a position number.** Always resolve to the UUID from the `rules` array before calling edit/delete/reorder endpoints.
- **Reorder requires the complete array.** Missing a rule ID in the reorder payload will cause an error or lose rules. Fetch the current `rules` array, reorder in memory, then send all IDs.
- **Draft version threading.** If a version number is already in context from a previous write skill in this session, use it explicitly instead of `new`. Fall back to `new` when starting fresh.
- **`version=new` is the canonical draft pattern.** Don't manually POST `/revisions` first — the `new` magic creates or reuses a draft atomically.
- **experiment-ref rules can only be deleted here.** For editing an experiment-ref rule's targeting conditions or scope, use flag-targeting. For changing the linked experiment, warn the user and use flag-experiment.

## Endpoints used

- `GET /api/v2/features/:id` — list current rules and flag state
- `DELETE /api/v2/features/:id/revisions/new/rules/:ruleId` — delete a rule
- `POST /api/v2/features/:id/revisions/new/rules/reorder` (body: `{ "ruleIds": ["<id>", ...] }`)

## Handoffs

- `flag-targeting` — force/rollout rules with conditions, saved groups, rule-level prerequisites
- `flag-experiment` — experiment-ref and inline experiment rules
- `flag-schedule` — timed activation windows on rules
- `flag-ramp` — multi-step progressive rollout schedules
- `flag-monitoring` — monitored rollouts and safe-rollout rules
- `flag-prerequisites` — feature-level prerequisite gates (not rule-level)
- `flag-publish` — to publish the draft after a delete or reorder


---

## flag-ramp

---
name: flag-ramp
description: Create or manage a multi-step ramp schedule for a GrowthBook feature flag rule — progressively increasing traffic exposure over time with defined intervals between steps. Use when the user says "gradually roll this out", "increase traffic from 5% to 100% over a week", "set up a ramp schedule", "advance to the next ramp step", "pause the rollout", "roll back the ramp", or "set a cutoff date on this rollout". For rollouts that also need guardrail metric monitoring and automatic signals, use flag-monitoring — it builds on this skill with monitoring configuration. For simple on/off time windows, use flag-schedule.
allowed-tools: Bash(${CLAUDE_PLUGIN_ROOT}/scripts/gb-call *), Bash(open https://*), Bash(xdg-open https://*)

---

# flag-ramp

Create and manage multi-step ramp schedules for a GrowthBook feature flag rule. A ramp schedule progressively increases (or decreases) a rule's traffic coverage over time, with defined hold intervals between steps. Steps can be manual (operator advances them) or time-gated (auto-advance after an interval).

All API calls go through the bundled helper: `${CLAUDE_PLUGIN_ROOT}/scripts/gb-call`. It needs `GB_API_KEY` set in env or written to `~/.config/growthbook/.env` by `/growthbook:gb-setup`.

## How ramp schedules work

A ramp schedule is attached to a specific rule on a feature flag. When published, the ramp begins running immediately — there is no automatic delay unless you explicitly set a `startDate` (uncommon; most teams prefer to trigger the ramp manually after publish via the GrowthBook UI).

At each step, the schedule applies **actions** — patches to the rule, typically changing `coverage`. After a step:
- If the step has an `interval` (seconds), it auto-advances after that duration.
- If `interval` is `null`, it holds until a team member manually advances it in the UI.

When all steps complete, `endActions` are applied (typically setting coverage to 1.0). If the ramp is rolled back at any point, `startActions` are applied (restoring the pre-ramp state).

Ramp schedules are staged on a draft revision as `rampActions` and executed atomically at publish time.

## Workflow

### Path A — Create a ramp schedule on an existing rule

**1. Identify the rule:**
```bash
gb-call GET /api/v2/features/<flag-id>
```
Show the rules list. Get the ID of the `force` or `rollout` rule the user wants to ramp. Note current `coverage`.

**2. Design the ramp steps with the user:**

Confirm:
- Starting coverage (e.g., `0.05` = 5%)
- Step progression (e.g., 5% → 25% → 50% → 100%)
- Hold time at each step: a number in seconds (e.g., `86400` = 1 day) to auto-advance, or `null` to hold until manually advanced

**Hold-for-approval steps**: add `holdConditions: { "requiresApproval": true }` to any step that needs human sign-off before the ramp advances. Approval is always the *final* gate — if the step also has an `interval`, the timer must elapse first, then the step waits for an explicit approval call. A pure manual gate (no time component) is `{ "interval": null, "holdConditions": { "requiresApproval": true } }`. Mixed examples:
- Soak for a day, then require approval: `{ "interval": 86400, "holdConditions": { "requiresApproval": true } }`
- Require approval only, no time hold: `{ "interval": null, "holdConditions": { "requiresApproval": true } }`

See Path D for how to submit approvals via API once the interval has cleared.

`startActions` should match the rule's **current coverage** (captured in step 1) — this is the state the ramp restores to on rollback.

**3. Build the ramp schedule payload:**

```json
{
  "startActions": [
    { "targetType": "feature-rule", "targetId": "<rule-id>", "patch": { "coverage": 0 } }
  ],
  "steps": [
    {
      "interval": 86400,
      "actions": [{ "targetType": "feature-rule", "targetId": "<rule-id>", "patch": { "coverage": 0.1 } }]
    },
    {
      "interval": 86400,
      "holdConditions": { "requiresApproval": true },
      "actions": [{ "targetType": "feature-rule", "targetId": "<rule-id>", "patch": { "coverage": 0.5 } }]
    }
  ],
  "endActions": [
    { "targetType": "feature-rule", "targetId": "<rule-id>", "patch": { "coverage": 1.0 } }
  ]
}
```

`startActions` = the state applied when the ramp begins and restored on rollback. Set this to the rule's **current coverage** before the ramp starts — typically 0 for a new rule.
`endActions` = final state after all steps complete (typically 100% coverage).

To add guardrail metric monitoring to the ramp, add a `monitoringConfig` block and `"monitored": true` on each step — see `flag-monitoring`.

Omit `startDate` and `cutoffDate` unless the user explicitly requests them — see Guardrails.

**4. Attach the ramp schedule to the rule via draft:**
```bash
echo '<payload>' \
  | gb-call PUT /api/v2/features/<flag-id>/revisions/new/rules/<rule-id>/ramp-schedule -
```

Capture the returned `version`. The ramp schedule is staged as a `rampAction` on the draft — it becomes live when the draft is published.

**5. Hand off to flag-publish.**

### Path B — Create a new rule with a ramp schedule in one step

When creating the rule and ramp together, fetch available `hashAttribute` candidates first (required for rollout rules):

```bash
gb-call GET '/api/v1/attributes?projectId=<flag-project-id>'
```

Validate the rule's `value` against the flag's `valueType` (captured from the flag fetch). Then post:

```bash
echo '{
  "rule": {
    "type": "rollout",
    "value": "<on-value>",
    "coverage": 0.05,
    "hashAttribute": "<hash-attr-id>",
    "enabled": true,
    "allEnvironments": false,
    "environments": ["<env-id>"]
  },
  "rampSchedule": {
    "steps": [
      {
        "interval": 86400,
        "actions": [{ "targetType": "feature-rule", "targetId": "new", "patch": { "coverage": 0.05 } }]
      },
      {
        "interval": 86400,
        "actions": [{ "targetType": "feature-rule", "targetId": "new", "patch": { "coverage": 0.25 } }]
      },
      {
        "interval": 86400,
        "actions": [{ "targetType": "feature-rule", "targetId": "new", "patch": { "coverage": 1.0 } }]
      }
    ],
    "startActions": [{ "targetType": "feature-rule", "targetId": "new", "patch": { "coverage": 0.0 } }],
    "endActions": [{ "targetType": "feature-rule", "targetId": "new", "patch": { "coverage": 1.0 } }]
  }
}' | gb-call POST /api/v2/features/<flag-id>/revisions/new/rules -
```

Use `"targetId": "new"` as a placeholder in the ramp actions — the server replaces it with the actual rule ID on creation.

### Path C — Remove a ramp schedule from a rule

```bash
gb-call DELETE /api/v2/features/<flag-id>/revisions/new/rules/<rule-id>/ramp-schedule
```

This stages a `detach` ramp action on the draft. The live schedule is removed when the draft publishes. The rule's coverage is left at whatever the schedule last set it to.

### Path D — Manage a live ramp (post-publish)

Before taking any action, suggest the user open the feature page for a full picture of ramp progress — the UI surfaces schedule status, step timeline, and metric health that the API only returns as raw values:

```bash
# macOS:
open <host>/features/<flag-id>
# Linux:
xdg-open <host>/features/<flag-id>
```

After that, for API-based management: get the ramp schedule ID from the flag's rules (`rampScheduleId` field on the rule), or look it up:

```bash
gb-call GET '/api/v1/ramp-schedules?featureId=<flag-id>'
# or more precisely:
gb-call GET '/api/v1/ramp-schedules?ruleId=<rule-id>'
```

**Check status:**
```bash
gb-call GET /api/v1/ramp-schedules/<rs-id>/status
```
Returns: current step index, `decision` (`"advance"` / `"hold"` / `"rollback"` / `"waiting"`), health signals, and whether the step is awaiting approval.

**Start the ramp** (if it hasn't started automatically):
```bash
gb-call POST /api/v1/ramp-schedules/<rs-id>/actions/start
```

**Approve a hold-for-approval step** (after the interval has elapsed):
```bash
gb-call POST /api/v1/ramp-schedules/<rs-id>/actions/approve-step
```
Returns 400 if the interval hasn't cleared yet or other holds are still active — poll `/status` first and only approve when the step is awaiting approval.

**Advance to next step** (override all holds — use for CI pipelines or hard overrides):
```bash
echo '{}' | gb-call POST /api/v1/ramp-schedules/<rs-id>/actions/advance -
# Force past an unsatisfied approval gate (requires canBypassApprovalChecks permission):
echo '{"force":true}' | gb-call POST /api/v1/ramp-schedules/<rs-id>/actions/advance -
```

**Pause / Resume:**
```bash
gb-call POST /api/v1/ramp-schedules/<rs-id>/actions/pause
gb-call POST /api/v1/ramp-schedules/<rs-id>/actions/resume
```

**Roll back** (restores `startActions` state, marks as `rolled-back`):
```bash
echo '{"reason":"<description>"}' | gb-call POST /api/v1/ramp-schedules/<rs-id>/actions/rollback -
```

**Complete immediately** (skip remaining steps, apply `endActions`):
```bash
gb-call POST /api/v1/ramp-schedules/<rs-id>/actions/complete
```

**Restart after rollback:**
```bash
gb-call POST /api/v1/ramp-schedules/<rs-id>/actions/restart
# then start again:
gb-call POST /api/v1/ramp-schedules/<rs-id>/actions/start
```

**Emergency kill-switch** (faster than rollback): disable the flag environment via flag-toggle — kills all rules instantly without needing the ramp schedule ID.

## Guardrails

- **Draft version threading.** If a version number is already in context from a previous write skill in this session, use it explicitly instead of `new`. Fall back to `new` when starting fresh.
- **Ramp schedules apply only to `force` and `rollout` rules.** They don't work on `experiment-ref` or `safe-rollout` rules.
- **`startActions` must match the rule's pre-ramp coverage.** Capture it in step 1 and use it as the rollback state. Don't default to 0 unless the rule was at 0 before the ramp.
- **Steps with `null` interval hold until manually advanced in the UI.** Useful for human-gated checkpoints. Steps with an interval auto-advance.
- **`startDate` is optional** — the ramp starts immediately on publish if omitted. Only ask for it if the user specifically wants a delayed start; most teams prefer to trigger manually after verifying the publish succeeded.
- **`cutoffDate` is a niche safety net.** Only mention it if the user asks — it's a deadline that auto-rolls the ramp back if reached. Don't include it by default.
- **Coverage patches on steps must be within 0–1.** The server validates this at publish time.
- **Check the target environment is enabled.** If the flag is disabled in the target env, the ramp will do nothing — warn and route to flag-toggle first.
- **For monitored ramps (guardrail metrics, auto-rollback signals), use flag-monitoring.**
- **Ramp actions are staged on the draft.** Nothing changes until published. If the draft is discarded, the ramp is never created.
- **One ramp schedule per rule.** Adding a new one replaces any existing schedule.

## Endpoints used

**Draft (pre-publish):**
- `GET /api/v2/features/:id` — fetch flag and current rules
- `PUT /api/v2/features/:id/revisions/new/rules/:ruleId/ramp-schedule` — stage ramp schedule on a draft
- `DELETE /api/v2/features/:id/revisions/new/rules/:ruleId/ramp-schedule` — stage ramp detach
- `POST /api/v2/features/:id/revisions/new/rules` — create rule with inline `rampSchedule`

**Live ramp management:**
- `GET /api/v1/ramp-schedules` — list (`featureId`, `ruleId`, `status` filters)
- `GET /api/v1/ramp-schedules/:id/status` — real-time health and decision
- `POST /api/v1/ramp-schedules/:id/actions/start`
- `POST /api/v1/ramp-schedules/:id/actions/pause`
- `POST /api/v1/ramp-schedules/:id/actions/resume`
- `POST /api/v1/ramp-schedules/:id/actions/advance` (body: optional `{ force: true }`)
- `POST /api/v1/ramp-schedules/:id/actions/approve-step`
- `POST /api/v1/ramp-schedules/:id/actions/rollback` (body: `{ reason: string }`)
- `POST /api/v1/ramp-schedules/:id/actions/restart`
- `POST /api/v1/ramp-schedules/:id/actions/complete`

## Handoffs

- `flag-monitoring` — to add guardrail metrics and automated monitoring signals to the ramp
- `flag-targeting` — to set up the rule's targeting conditions before attaching a ramp
- `flag-toggle` — for an emergency kill-switch if the ramp needs to be stopped immediately
- `flag-publish` — to publish the draft and activate the ramp


---

## flag-toggle

---
name: flag-toggle
description: Enable or disable a GrowthBook feature flag in a specific environment. Use when the user says "turn on flag X in production", "disable this flag in staging", "kill switch flag X", "turn this off everywhere", "enable the flag", "flip it off in prod", or "I need to disable this flag now". This is the environment-level kill switch — it controls whether the flag is evaluated at all in an environment, independent of its rules. Changes are review-gated and go through the standard draft → publish flow. For adding or editing targeting rules within an environment, use flag-targeting. For toggling a rule on or off without affecting the environment, use flag-rules.
allowed-tools: Bash(${CLAUDE_PLUGIN_ROOT}/scripts/gb-call *)
---

# flag-toggle

Enable or disable a GrowthBook feature flag in a specific environment. Toggling an environment is the kill switch — when a flag is disabled in an environment, its rules don't evaluate and the SDK returns the default value for all users in that environment, regardless of what the rules say.

Like all flag changes, environment toggles go through the draft → review → publish flow. There is no bypass path — review is the happy path, not an obstacle.

All API calls go through the bundled helper: `${CLAUDE_PLUGIN_ROOT}/scripts/gb-call`. It needs `GB_API_KEY` set in env or written to `~/.config/growthbook/.env` by `/growthbook:gb-setup`.

## Required inputs

- **Flag ID** — kebab-case key. Use flag-search to resolve if the user gives a description.
- **Environment** — the environment to toggle. If the user says "production" or "prod", confirm against the actual environment IDs.
- **Direction** — enable (`true`) or disable (`false`). Infer from the user's words; confirm before mutating.

## Workflow

### 1. Fetch the flag and current toggle state

```bash
gb-call GET /api/v2/features/<flag-id>
```

Capture:
- `environmentSettings` — the map of environment IDs to their current `enabled` state. Use this to confirm the environment name and show the user the current state before toggling.
- `rules` — to warn about active rules if the user is disabling (they'll all stop evaluating).

If the flag is already in the requested state, halt: "Flag `<flag-id>` is already `<enabled/disabled>` in `<env>`. No change needed."

### 2. Resolve the environment

Show the available environments from `environmentSettings`. If the user said "prod" or an alias, confirm which environment ID they mean before proceeding.

```bash
gb-call GET /api/v1/environments
```

Use this if the flag's environmentSettings doesn't list all environments (e.g., the flag has never been toggled in that env).

### 3. Confirm the action

State the change explicitly before mutating:

> "`<flag-id>` is currently `<enabled/disabled>` in `<env>`. I'll `<enable/disable>` it. When disabled, all rules stop evaluating and the SDK returns the default value (`<defaultValue>`) for all users in `<env>`. Proceed?"

For disabling: if the flag has active rules with non-default values, surface the behavior change:
> "Note: `<N>` rule(s) are currently serving values different from the default. Disabling will revert all matched users to `<defaultValue>`."

### 4. Apply the toggle via a draft

```bash
echo '{"environment":"<env-id>","enabled":<true|false>}' \
  | gb-call POST /api/v2/features/<flag-id>/revisions/new/toggle -
```

The `new` magic version creates a fresh draft or layers onto an existing one. Capture the returned `version` number.

### 5. Publish via flag-publish

Environment toggles are the canonical kill-switch use case — offer to publish immediately:

> "Toggle applied to draft revision `<version>`. Publish now?"

Hand off to flag-publish for the publish step. flag-publish handles the approval-required (400) and merge-conflict (409) failure modes.

Note: even for emergency kill switches, the approval flow is the happy path. If approval is required and the situation is urgent, option B or C in flag-publish's approval branch (org-wide bypass or per-token bypass) are the fastest paths, but they require admin action.

## Guardrails

- **Draft version threading.** If a version number is already in context from a previous write skill in this session, use it explicitly (e.g. `.../revisions/42/toggle`) instead of `new`. This keeps all changes in the same draft. Fall back to `new` when starting fresh — it auto-creates or reuses the most recently updated open draft.
- **Environment toggle ≠ rule-level `enabled`.** This controls whether the flag evaluates at all in the environment. Rule-level `enabled` controls whether a specific rule participates in evaluation. They're independent — a flag can be enabled in an environment but have all its rules disabled.
- **Disabling stops all rule evaluation.** Users will get `defaultValue`. If `defaultValue` is `"false"` and rules were serving `"true"` to some users, those users lose the feature. Confirm the user understands this.
- **There is no instant kill switch that bypasses review.** Review is the happy path. If urgency requires skipping approval, point the user to the GrowthBook UI — human operators can sometimes publish faster there — or to the org-wide bypass setting.
- **`new` version layers onto an existing draft.** If a teammate has an open draft on this flag, the toggle lands in their draft. Show the user if an existing draft was reused — they should coordinate with the owner before publishing.
- **allEnvironments toggle is not supported here.** This skill toggles one environment at a time. For toggling all environments simultaneously, run this skill once per environment or use the GrowthBook UI.

## Endpoints used

- `GET /api/v2/features/:id` — fetch flag state and current environment toggle status
- `GET /api/v1/environments` — list all environments to confirm env IDs
- `POST /api/v2/features/:id/revisions/new/toggle` (body: `{ "environment": "<env-id>", "enabled": true|false }`)

## Handoffs

- `flag-search` — if the user gives a description instead of a flag ID
- `flag-targeting` — to add or edit rules within the enabled environment
- `flag-rules` — to enable or disable individual rules without toggling the whole environment
- `flag-publish` — to publish the draft, handle approval-required (400) and merge conflicts (409)


---

## flag-schedule

---
name: flag-schedule
description: Add a timed activation window to a GrowthBook feature flag rule — automatically enable it at a start time and/or disable it at an end time. Use when the user says "turn this on at 9am", "schedule the flag to go live Friday at noon", "disable the rule after the sale ends", "set an end date on this rule", "run this rule during the promotion window", or "time-gate this rule". Applies to force and rollout rules. For multi-step progressive rollouts with intervals between steps, use flag-ramp. For the broader campaign of rules around this schedule, use flag-targeting first.
allowed-tools: Bash(${CLAUDE_PLUGIN_ROOT}/scripts/gb-call *)
---

# flag-schedule

Add a timed activation window to a GrowthBook feature flag rule. A scheduled rule activates automatically at a start time and/or deactivates automatically at an end time, without requiring a manual publish each time.

Scheduling applies to `force` and `rollout` rule types. It does not apply to `experiment-ref` or `safe-rollout` rules.

All API calls go through the bundled helper: `${CLAUDE_PLUGIN_ROOT}/scripts/gb-call`. It needs `GB_API_KEY` set in env or written to `~/.config/growthbook/.env` by `/growthbook:gb-setup`.

## How scheduling works

GrowthBook supports two scheduling mechanisms on rules:

**Simple schedule** (`schedule` field on rule creation) — the preferred approach. Specify `startDate` and/or `endDate` as ISO 8601 timestamps. The server sets up the underlying `scheduleRules` automatically.

**Legacy `scheduleRules`** — a 2-element array `[start, end]` where each element is `{ timestamp: "<ISO 8601 or null>", enabled: <bool> }`. Still accepted by the API; the simple `schedule` field is cleaner for new rules.

## How the OFF state works

A scheduled rule is a **rule-level** mechanism, not a flag-level toggle. When the rule is inactive (outside its window), it is skipped in evaluation — the flag falls through to whatever comes next in rule order, ultimately landing on `defaultValue`.

This means:
- The rule should serve the **ON value** (`"true"` for a boolean flag) during the active window.
- `defaultValue` is the **OFF state** when no rules match. Verify it is set correctly before publishing.
- The scheduled rule should be **last in the rules array** (for new rules) so nothing below it can accidentally serve the ON value when the schedule is inactive. For existing rules, check what's below — anything serving a matching value below this rule would fire when the schedule is off.

## Workflow

### Path A — Create a new rule with a schedule

1. **Fetch the flag:**
   ```bash
   gb-call GET /api/v2/features/<flag-id>
   ```
   Capture `valueType`, `defaultValue`, `environmentSettings`, and current rules.

   **Check the target environment is enabled.** If `environmentSettings.<env>.enabled` is `false`, the scheduled rule will silently do nothing — warn the user:
   > "The flag is currently disabled in `<env>`. The scheduled rule won't fire until the flag is enabled. Enable it via flag-toggle (it can land in the same draft as this change)."

   **Check `defaultValue` is the OFF state.** For a boolean flag, it should be `"false"`. If it isn't, warn the user:
   > "When the scheduled rule is inactive, the flag will return `<defaultValue>`. Is that the intended off-state? If not, update it first via flag-default-value."

   **Check rule order.** The new rule will append to the bottom. If existing rules above it serve the ON value unconditionally to all users, they'll fire before the schedule can — warn the user and suggest reviewing rule order via flag-rules after adding.

2. **Collect the schedule times:**

   Ask for:
   - Start time (or `null` for "immediately")
   - End time (or `null` for "never expires")
   - The user's timezone, unless they explicitly specify one in the time string

   The API accepts ISO 8601 with timezone offset — use the user's local timezone directly, no UTC conversion needed. Use the correct offset for the date in question (account for daylight saving time):
   ```
   "tomorrow at midnight" in US Eastern (summer, EDT) → "2026-05-30T00:00:00-04:00"
   "right after Christmas" in US Eastern (winter, EST) → "2026-12-26T00:00:00-05:00"
   ```

   For natural-language times, use `currentDate` from context to anchor relative dates ("tomorrow", "next Friday"). For ambiguous phrases like "right after Christmas" or "end of the sale", confirm the exact datetime with the user before proceeding. Always confirm the full resolved datetime back to the user before building the payload.

3. **Build the payload and post:**

   Pre-validate `value` against the flag's `valueType` (captured in step 1): boolean flags must use `"true"`/`"false"`, number flags must parse as a number, json flags must be valid JSON.

   ```bash
   echo '{
     "rule": {
       "type": "force",
       "value": "<on-value>",
       "description": "<optional>",
       "enabled": true,
       "allEnvironments": false,
       "environments": ["<env-id>"]
     },
     "schedule": {
       "startDate": "2026-05-30T00:00:00-05:00",
       "endDate": "2026-12-26T00:00:00-05:00"
     }
   }' | gb-call POST /api/v2/features/<flag-id>/revisions/new/rules -
   ```

   Omit `startDate` or `endDate` if no bound on that side.

4. Capture the returned `version`. Hand off to flag-publish.

### Path B — Add a schedule to an existing rule

1. **Fetch the flag and identify the rule:**
   ```bash
   gb-call GET /api/v2/features/<flag-id>
   ```
   Show the rules list. Get the rule `id` (UUID) the user wants to schedule. Note the rule's current position in the array — if it's not last, check whether rules below it would serve an unintended value when this schedule is inactive.

2. **Collect the schedule times** (same as Path A step 2).

3. **Build the scheduleRules patch:**
   ```json
   {
     "scheduleRules": [
       { "timestamp": "2026-05-30T00:00:00-05:00", "enabled": true },
       { "timestamp": "2026-12-26T00:00:00-05:00", "enabled": false }
     ],
     "scheduleType": "schedule"
   }
   ```
   - Element 0: the start event (`enabled: true` — rule turns on at this time)
   - Element 1: the end event (`enabled: false` — rule turns off at this time)
   - Use `null` for a timestamp to omit that bound (open-ended start or end)
   - `scheduleType` must be `"schedule"`

4. **Apply the patch:**
   ```bash
   echo '<patch>' | gb-call PUT /api/v2/features/<flag-id>/revisions/new/rules/<rule-id> -
   ```

5. Capture the returned `version`. Hand off to flag-publish.

### Path C — Remove a schedule from a rule

```bash
echo '{
  "scheduleRules": [
    { "timestamp": null, "enabled": true },
    { "timestamp": null, "enabled": false }
  ],
  "scheduleType": "none"
}' | gb-call PUT /api/v2/features/<flag-id>/revisions/new/rules/<rule-id> -
```

Setting all timestamps to `null` and `scheduleType: "none"` clears the schedule. The rule becomes always-active (subject to its `enabled` field and conditions).

## Guardrails

- **Draft version threading.** If a version number is already in context from a previous write skill in this session, use it explicitly (e.g. `.../revisions/42/rules`) instead of `new`. This keeps all changes in the same draft. Fall back to `new` when starting fresh.
- **The OFF state is `defaultValue`, not a toggle.** Scheduling works at the rule level — outside the active window the rule is skipped and the flag falls through to `defaultValue`. Always verify `defaultValue` is the intended off state before publishing.
- **Place new scheduled rules last.** Rules evaluate top-to-bottom; a scheduled rule that's inactive is simply skipped. If another rule below it serves the ON value unconditionally, that rule fires during the inactive period. For new rules, last position is safest.
- **The API accepts ISO 8601 with timezone offset.** Send times in the user's local timezone using the offset form: `"2026-12-26T00:00:00-05:00"`. No UTC conversion needed. Confirm the resolved datetime with the user before building the payload — never silently assume a timezone.
- **Resolve natural-language times explicitly.** Use `currentDate` from context for relative dates ("tomorrow", "next Friday"). For ambiguous phrases ("right after Christmas", "end of the sale"), confirm the exact date and time with the user before proceeding.
- **`scheduleRules` is a 2-element array.** Element 0 = start event (`enabled: true`), element 1 = end event (`enabled: false`). The server enforces this shape — it is not a list of arbitrary events.
- **Use `schedule` field for new rules, `scheduleRules` for patching existing ones.**
- **Scheduled rules must have `enabled: true`.** The schedule controls when the rule is active within the evaluation cycle, but `enabled: false` on the rule overrides the schedule entirely.
- **Publishing activates the schedule.** If publish is delayed by approvals and the start time passes before the revision goes live, the rule will activate immediately on publish rather than at the scheduled time.
- **For multi-step progressive rollouts, use flag-ramp.** This skill handles on/off windows only.

## Endpoints used

- `GET /api/v2/features/:id` — fetch flag and current rules
- `POST /api/v2/features/:id/revisions/new/rules` — create rule with `schedule` field (body includes `rule` + `schedule`)
- `PUT /api/v2/features/:id/revisions/new/rules/:ruleId` — patch existing rule's `scheduleRules` and `scheduleType`

## Handoffs

- `flag-targeting` — to build the rule's targeting conditions alongside the schedule
- `flag-ramp` — for multi-step progressive rollouts with intervals between coverage increases
- `flag-rules` — to reorder rules after adding a scheduled rule
- `flag-publish` — to publish the draft


---

## flag-prerequisites

---
name: flag-prerequisites
description: Add, remove, or inspect feature-level prerequisites on a GrowthBook feature flag. Use when the user says "gate flag X on flag Y being enabled", "add a prerequisite", "flag X should only evaluate if flag Y is on", "remove the prerequisite on flag X", "what does this flag depend on", or "this flag should require the new-checkout flag to be true first". Feature-level prerequisites gate the entire flag — when the prerequisite flag is off, this flag returns its default value for every user. The prerequisite must be a boolean flag. For prerequisites scoped to a single rule (not the whole flag), use flag-targeting. For tracing the full dependency graph, use flag-graph.
allowed-tools: Bash(${CLAUDE_PLUGIN_ROOT}/scripts/gb-call *)
---

# flag-prerequisites

Add, remove, or inspect feature-level prerequisites on a GrowthBook feature flag. A feature-level prerequisite is a boolean gate: if the specified prerequisite flag is off for a user, the current flag skips all its rules and returns its `defaultValue` for that user.

**Feature-level prerequisites are boolean-flag-only.** The prerequisite flag must have `valueType: "boolean"`. The gate condition is always "prerequisite flag is on" (`{"value": true}`) — no custom conditions. If the user wants a more nuanced dependency (e.g. gate on a string flag's value, or gate a single rule rather than the whole flag), route to flag-targeting.

This is distinct from rule-level prerequisites (which gate a single rule and support richer conditions) — feature-level prerequisites apply to every rule on the flag simultaneously.

All API calls go through the bundled helper: `${CLAUDE_PLUGIN_ROOT}/scripts/gb-call`. It needs `GB_API_KEY` set in env or written to `~/.config/growthbook/.env` by `/growthbook:gb-setup`.

## Workflow

### Path A — Add a prerequisite

1. **Fetch the flag's current prerequisites:**
   ```bash
   gb-call GET /api/v2/features/<flag-id>
   ```
   Capture the existing `prerequisites` array. The PUT below replaces the full array, so you need the current contents to avoid overwriting existing prerequisites.

2. **Confirm the prerequisite flag exists and is boolean:**
   ```bash
   gb-call GET /api/v2/features/<prerequisite-flag-id>
   ```
   Check `valueType`. If it is not `"boolean"`, halt:
   > "Feature-level prerequisites only support boolean flags. `<prerequisite-flag-id>` is a `<valueType>` flag. To gate on a non-boolean flag's value, add a rule-level prerequisite instead via flag-targeting."

3. **Build the new prerequisites array.** Append to any existing entries. The condition is always `{"value": true}` — the gate means "prerequisite flag is on":
   ```json
   [
     { "id": "<existing-prereq-id>", "condition": "{\"value\": true}" },
     { "id": "<new-prereq-id>", "condition": "{\"value\": true}" }
   ]
   ```

4. **Apply via draft:**
   ```bash
   echo '{"prerequisites":[...]}' \
     | gb-call PUT /api/v2/features/<flag-id>/revisions/new/prerequisites -
   ```

5. Hand off to flag-publish.

### Path B — Remove a prerequisite

1. Fetch current prerequisites (step A-1 above).
2. Show the list and ask which to remove.
3. Build the updated array without the removed entry.
4. Apply via draft (step A-4 above) with the filtered array. An empty array `[]` removes all prerequisites.
5. Hand off to flag-publish.

### Path C — Inspect current prerequisites

```bash
gb-call GET /api/v2/features/<flag-id>
```

Surface the `prerequisites` array. For each entry, fetch the prerequisite flag to show its current evaluated state and value type. Use flag-graph to trace the full dependency chain if needed.

## Guardrails

- **Draft version threading.** If a version number is already in context from a previous write skill in this session, use it explicitly (e.g. `.../revisions/42/prerequisites`) instead of `new`. This keeps all changes in the same draft. Fall back to `new` when starting fresh — it auto-creates or reuses the most recently updated open draft.
- **`PUT /prerequisites` replaces the full array.** It's not additive. Always fetch the current array first and include all existing entries when adding or modifying — otherwise you'll silently delete prerequisites the user didn't intend to touch.
- **Prerequisite flags must be boolean.** Halt and route to flag-targeting if the user specifies a non-boolean flag as a prerequisite.
- **The condition is always `{"value": true}`.** Do not accept or generate custom conditions for feature-level prerequisites. The backend is permissive but we intentionally constrain this — the gate means "this flag is on". If the user wants a richer condition (e.g. string flag equals a value, flag is live but not necessarily true), route to flag-targeting rule-level prerequisites.
- **Feature-level vs rule-level prerequisites.** This skill gates the entire flag. If the user wants a prerequisite scoped to a single rule, route to flag-targeting.
- **Circular dependencies must be avoided.** If flag A requires flag B and flag B requires flag A, neither will ever evaluate. Check the existing dependency chain via flag-graph before adding a prerequisite.
- **Prerequisite flags must be in the same GrowthBook project (or org-wide).** Cross-project prerequisites may not resolve correctly depending on SDK configuration.
- **Deleting a prerequisite flag breaks any flag that depends on it.** The dependent flag's prerequisite condition will silently always fail. Surface this when the user is reviewing dependencies via flag-graph before cleanup.

## Endpoints used

- `GET /api/v2/features/:id` — fetch flag state including current `prerequisites` array
- `PUT /api/v2/features/:id/revisions/new/prerequisites` (body: `{ "prerequisites": [...] }`)

## Handoffs

- `flag-search` — to find the prerequisite flag's ID if the user gives a name
- `flag-graph` — to trace the full dependency chain and detect circular dependencies
- `flag-targeting` — to add rule-level prerequisites (scoped to a single rule rather than the whole flag)
- `flag-publish` — to publish the draft, handle approval-required (400) and merge conflicts (409)


---

## flag-targeting

---
name: flag-targeting
description: Add, edit, or remove force-value or percentage-rollout rules on a GrowthBook feature flag, including conditions, saved groups, and rule-level prerequisites. Use when the user says "add a rule to flag Y", "release this flag to 10% of users", "turn this on for beta testers", "target US users", "add a condition to rule X", "edit the targeting condition on flag Z", "disable this rule", "remove the rule", "only for logged-in users", or "target users matching attribute Y". For environment kill switches (enable/disable the whole flag in an env), use flag-toggle. For experiment rules, use flag-experiment. For ramp schedules, use flag-ramp. For monitored rollouts with guardrail metrics, use flag-monitoring. For feature-level prerequisites, use flag-prerequisites.
allowed-tools: Bash(${CLAUDE_PLUGIN_ROOT}/scripts/gb-call *)
---

# flag-targeting

Add, edit, or remove targeting rules on an existing GrowthBook feature flag. Handles `force` (serve a specific value to matched users) and `rollout` (serve a value to a random percentage of users) rule types, with full support for conditions, saved groups, and rule-level prerequisites.

Every change goes through a draft revision and requires publishing. For publishing, use flag-publish — it handles approval-required and merge-conflict failure modes.

All API calls go through the bundled helper: `${CLAUDE_PLUGIN_ROOT}/scripts/gb-call`. It needs `GB_API_KEY` set in env or written to `~/.config/growthbook/.env` by `/growthbook:gb-setup`.

## Required inputs

Collect before starting:

- **Flag ID** — kebab-case key. Use flag-search to resolve from a description.
- **Action** — `add`, `edit`, or `remove`. Infer from the user's request; confirm before mutating.

## Per-action inputs

### `add`
- **Rule type** — `force` (specific users) or `rollout` (percentage). Infer from wording: "X% of users" → rollout; "for users matching Y" → force.
- **Value** — what the rule serves when matched. Must match the flag's `valueType`, serialized as a string.
- **Scope** — `allEnvironments: true` or `environments: [<env-ids>]`. Ask if not specified.
- **Conditions** (optional) — saved group, attribute condition, or prerequisite on another flag (see conditions decision tree below).
- **For rollout rules** — `coverage` (0–1) and `hashAttribute` (required when coverage < 1).
- **Description** (optional but recommended).

### `edit`
- **Rule ID** — resolved interactively by showing a numbered list (step 3b). User picks by number.
- **Patch fields** — only the fields the user wants to change.

### `remove`
- **Rule ID** — resolved the same way as edit.

## Workflow

```
- [ ] 1. Fetch flag and current state
- [ ] 2. Confirm the action (add / edit / remove)
- [ ] 3a. Add path
- [ ] 3b. Edit path
- [ ] 3c. Remove path
- [ ] 4. Hand off to flag-publish
```

### 1. Fetch flag and current state

```bash
gb-call GET /api/v2/features/<flag-id>
```

Capture: `valueType`, `environmentSettings` keys (available env IDs), `rules` array (full list with IDs, types, scope, enabled state). If 404, halt: "no flag with id `<flag-id>`." Suggest flag-search.

### 2. Confirm the action

If the user's request is ambiguous, ask before mutating.

### 3a. Add path

**New rules append to the bottom** of the rules array. Rules evaluate top-to-bottom; first match wins. If the flag already has rules, surface this:

> "The flag has `<N>` existing rule(s); this new rule will be evaluated last. If it needs priority over an existing rule, reorder via flag-rules after adding."

**Pre-validate `value` against `valueType`** — the API doesn't catch mismatches at write time:
- `boolean` → must be `"true"` or `"false"`
- `number` → must parse as a number
- `json` → must be valid JSON
- `string` → any non-empty string

**Resolve scope.** Confirm the environment IDs against `environmentSettings`. Set either `allEnvironments: true` or `environments: [...]` — never both.

**Fetch available attributes** — do this before asking the user to describe any condition. If the flag has a project, pass it as `projectId` to get only relevant attributes (org-wide + project-scoped); omit it for org-wide flags:

```bash
# Flag has a project:
gb-call GET '/api/v1/attributes?projectId=<flag-project-id>'

# Flag is org-wide (no project):
gb-call GET /api/v1/attributes
```

Surface the returned list to the user grouped by type, with notable metadata called out:

```
Available targeting attributes for this flag:
  id            (string, hashAttribute)
  country       (string, format: isoCountryCode)
  app_version   (string, format: version)
  plan          (enum: free|pro|enterprise)
  is_employee   (boolean)
```

If no attributes exist (or none are in scope), warn: "No targeting attributes are registered for this project. Add them under Settings → Attributes before targeting."

**Resolve `hashAttribute` for rollout rules** (required when `coverage < 1`):
From the filtered attribute list, prefer `hashAttribute: true` entries. Default to `id` for "by user"; pick the company-scoped attribute for "by company."

A rule has three separate targeting properties that can be combined freely. Determine which ones apply, then build all relevant fields before posting.

**`condition` — attribute-based targeting** (MongoDB-style JSON string)

Targets users based on attributes passed into the SDK. Pick attributes from the filtered list fetched above. If the user's description doesn't map clearly to an available attribute, show the list and ask them to pick. Refuse any attribute name not in the filtered list — unregistered attributes silently never match at SDK evaluation time.

Serialize the condition object as a JSON string in the payload.

| Category | Operators | Meaning |
| --- | --- | --- |
| Equality | `$eq`, `$ne` (or bare key/value for eq) | `=`, `≠` |
| Comparison | `$lt`, `$lte`, `$gt`, `$gte` | `<`, `≤`, `>`, `≥` |
| Semantic version | `$veq`, `$vne`, `$vlt`, `$vlte`, `$vgt`, `$vgte` | Version-aware comparison — `"1.0.10" > "1.0.9"`. Use on `format: version` attributes. |
| Set membership | `$in`, `$nin` | is any of, is none of (case-sensitive) |
| Set membership (case-insensitive) | `$ini`, `$nini` | is any of / none of — ignores case |
| String contains | `$includes`, `$notIncludes` | string or array contains / does not contain value |
| Regex | `$regex`, `$notRegex` | matches / does not match pattern (case-sensitive) |
| Regex (case-insensitive) | `$regexi`, `$notRegexi` | same, ignores case |
| Existence | `$exists`, `$notExists` | is not NULL / is NULL |
| Emptiness | `$empty`, `$notEmpty` | string or array is empty / not empty |
| Boolean | `$true`, `$false` | attribute is truthy / falsy |
| Type | `$type` | JS type equals value (e.g. `"string"`, `"number"`) |
| Array | `$elemMatch`, `$all`, `$alli`, `$size` | element matches condition; all values present (`$alli` = case-insensitive); length comparison |
| Saved group (raw) | `$inGroup`, `$notInGroup` | in / not in a saved group by ID — prefer the `savedGroups` rule field instead |
| Logical | `$or`, `$and`, `$nor`, `$not` | top-level keys are ANDed; use these for OR / negation |

Key rules:
- Multiple top-level keys are **AND**ed: `{"country": "US", "plan": "pro"}` requires both.
- String comparisons are **case-sensitive** by default — use `$ini`/`$regexi` variants when needed.
- Conditions are evaluated **client-side by the SDK** — attribute values never reach GrowthBook servers.
- Only use operators from this table. Unlisted MongoDB operators (e.g. `$where`, `$expr`) silently never match.

Examples:
```json
{"country": "US"}
{"country": {"$ini": ["us", "ca", "gb"]}}
{"plan": {"$ne": "free"}}
{"appVersion": {"$vgte": "3.0.0"}}
{"age": {"$gte": 18, "$lt": 65}}
{"email": {"$regexi": "@acme\\.com$"}}
{"$or": [{"country": "US"}, {"beta": true}]}
{"tags": {"$includes": "power-user"}}
{"company": {"$exists": true}, "plan": {"$in": ["pro", "enterprise"]}}
```

---

**`savedGroups` — saved group targeting** (separate rule field)

Targets users who belong to a pre-defined saved group. Fetch available groups:

```bash
gb-call GET /api/v1/saved-groups
```

Build the field as an array of group references:

```json
"savedGroups": [
  { "ids": ["<sg-id>"], "match": "all" }
]
```

- `ids` — array of saved group IDs to reference
- `match: "all"` — user must be in **all** listed groups; `"any"` — user must be in **at least one**

Use saved groups for named populations managed outside the flag ("beta testers", "internal users", "enterprise accounts"). Prefer this over hand-writing `$inGroup` in the `condition` string.

---

**`prerequisites` — rule-level prerequisite targeting** (separate rule field)

Gates this rule on the evaluated value of another feature flag. If the prerequisite condition fails for a user, this rule is skipped (the next rule in order is evaluated instead — distinct from feature-level prerequisites which skip the entire flag).

```json
"prerequisites": [
  { "id": "<flag-id>", "condition": "{\"value\": true}" }
]
```

The `condition` string evaluates against `{ "value": <the prerequisite flag's evaluated result> }`. `value` is the only valid top-level key.

The two conditions that cover 99% of cases:

| Goal | Condition |
| --- | --- |
| Boolean flag is on | `{"value": true}` |
| Boolean flag is off | `{"value": false}` |
| Non-boolean flag is live (returning any value) | `{"value": {"$exists": true}}` |
| Non-boolean flag is not live | `{"value": {"$exists": false}}` |

For anything more specific (e.g. string flag equals a particular variant), the full operator table from the `condition` section above applies — but ask the user to confirm before writing complex prerequisite conditions.

---

**Combining all three:**

All three properties are ANDed together. A rule with all three set fires only when the user is in the saved group AND the attribute condition matches AND all prerequisite flags pass:

```json
{
  "condition": "{\"country\": \"US\"}",
  "savedGroups": [{ "ids": ["sg_beta"], "match": "all" }],
  "prerequisites": [{ "id": "new-checkout", "condition": "{\"value\": true}" }]
}
```

**Ambiguous cases** ("VIP customers", "enterprise users") — ask: is this a named group in GrowthBook (saved group), an attribute on the user record (condition), or both?

| User says | Field to use |
| --- | --- |
| "Turn it on for our beta testers" | `savedGroups` |
| "Users in the US" | `condition` on `country` attribute |
| "iOS users on version 5.2 or higher" | `condition`: `{"platform": "ios", "appVersion": {"$vgte": "5.2"}}` |
| "Only when the new-checkout flag is on" | `prerequisites` |
| "Enterprise users" | **Ask** — saved group or `{"plan": "enterprise"}` condition? |

**Build and POST the payload:**

```json
{
  "rule": {
    "type": "force",
    "value": "<string>",
    "description": "<optional>",
    "enabled": true,
    "allEnvironments": false,
    "environments": ["production"],
    "condition": "<optional JSON string>",
    "savedGroups": [{ "ids": ["<sg-id>"], "match": "all" }],
    "prerequisites": [{ "id": "<flag-id>", "condition": "{\"value\": true}" }]
  }
}
```

For rollout: swap `type: "rollout"`, add `coverage` and `hashAttribute`. Omit empty arrays/strings.

```bash
echo '<payload>' | gb-call POST /api/v2/features/<flag-id>/revisions/new/rules -
```

Capture `revision.version`.

### 3b. Edit path

Show the rules as a numbered list:

```
Rules on `<flag-id>`:
  1. [force]    all envs     value="true"    "Beta testers" (saved group)
  2. [rollout]  production   10%             hash=id
  3. [force]    staging      value="false"   "Kill switch"
```

User picks by number. Surface current values; ask which fields to change.

**Empty-patch guard:** if the proposed changes match current values verbatim, halt — "no changes to apply." A no-op draft burns rate-limit budget and can invalidate previously-granted approvals via `resetReviewOnChange`.

**Rule-type behavior on edit:**
- **Explicit `type` changes are server-rejected.** To convert a force rule to an experiment-ref rule: remove and re-add (3c then 3a or flag-experiment).
- **`force` ↔ `rollout` auto-flips** based on effective coverage. Patching `coverage: 0.25` onto a force rule silently converts it to rollout (also requires `hashAttribute`). Report the type transition in the summary.

**experiment-ref edit rules:**
- **Server-rejected patches:** `value`, `coverage`, `controlValue`. Halt early with explanation.
- **Warn-and-confirm patches:** `experimentId`, `variations`. API allows them but causes silent flag/experiment drift. Require explicit confirmation: "Changing `experimentId`/`variations` directly can cause the flag rule and experiment to drift. The experiment is the source of truth. Are you sure?"
- **Safe to edit:** `enabled`, `condition`, `savedGroups`, `prerequisites`, scope, `description`.

**Scope subtlety:** when changing scope, always send both `allEnvironments` and `environments` together. Sending only `environments` without `allEnvironments` causes the server to infer `allEnvironments: false`, silently narrowing scope.

```bash
echo '<patch>' | gb-call PUT /api/v2/features/<flag-id>/revisions/new/rules/<rule-id> -
```

Capture `revision.version`.

### 3c. Remove path

Show the numbered list. Confirm:

> "Remove rule `<N>` (`<type>`, `<scope>`, `<summary>`) from `<flag-id>`? This goes into a draft and only takes effect after publishing."

```bash
gb-call DELETE /api/v2/features/<flag-id>/revisions/new/rules/<rule-id>
```

For experiment-ref removal: "The linked experiment is not affected by removing this rule."

Capture `revision.version`.

### 4. Hand off to flag-publish

After any mutation, ask: "Publish this change now, or leave it as a draft?"

Hand off to flag-publish. It handles:
- Approval-required (400) — offer review flow, org-wide bypass, per-token bypass
- Merge conflict (409) — show conflict fields, collect overwrite/discard decisions, rebase

## Guardrails

- **Draft version threading.** If a version number is already in context from a previous write skill in this session, use it explicitly (e.g. `.../revisions/42/rules`) instead of `new`. This keeps all changes in the same draft across chained skills. Fall back to `new` when starting fresh — it auto-creates or reuses the most recently updated open draft via `resolveOrCreateRevision`.
- **Rule ID is a UUID (`fr_...`), not a position number.** Always resolve from the `rules` array — never guess.
- **`force` vs `rollout` is mostly cosmetic server-side.** A force rule with `coverage < 1` is effectively a rollout. Default to `force` unless the user says "percentage" or specifies coverage; the server auto-flips.
- **`coverage < 1` requires `hashAttribute`.** Validate before POSTing.
- **Scope: exactly one of `allEnvironments: true` or `environments: [...]`.** Never both.
- **Always fetch attributes before asking for a condition.** Use `?projectId=<id>` when the flag is project-scoped so the server returns only relevant attributes. Surface the list upfront. Never accept an attribute name the user provides without confirming it's in the returned list — unregistered attributes silently never match at SDK evaluation time.
- **Conditions are JSON strings.** Validate they're parseable. Prefer Saved Groups over hand-written conditions — they're reusable and managed.
- **`valueType` mismatch is a footgun.** The v2 rule-add handler doesn't validate at write time. Always pre-validate client-side.
- **Refuse empty patches.** A no-op revision update burns rate limit and can reset review approvals.
- **New rules append to the bottom.** First match wins. Surface evaluation order concerns before posting.
- **Self-approval blocked.** Don't attempt `submit-review` after `request-review`.
- **Environment toggles are handled by flag-toggle**, not this skill. This skill does not touch env-level enable/disable.

## Endpoints used

- `GET /api/v2/features/:id` — fetch flag state, current rules, env list, valueType
- `GET /api/v1/attributes` — fetch attributes; pass `?projectId=<id>` when the flag is project-scoped; surface upfront before building any condition; pick `hashAttribute` for rollouts
- `GET /api/v1/saved-groups` — resolve saved groups for targeting
- `POST /api/v2/features/:id/revisions/new/rules` — add rule
- `PUT /api/v2/features/:id/revisions/new/rules/:ruleId` — edit rule
- `DELETE /api/v2/features/:id/revisions/new/rules/:ruleId` — remove rule

## Handoffs

- `flag-toggle` — for environment-level enable/disable (kill switch)
- `flag-rules` — for reordering rules or routing to other rule types
- `flag-experiment` — for adding experiment-ref or inline experiment rules
- `flag-ramp` — to progressively increase coverage on a rollout rule over time
- `flag-monitoring` — to add guardrail metric monitoring to a rollout
- `flag-prerequisites` — for feature-level prerequisite gates
- `flag-search` — to resolve a flag ID from a description
- `flag-publish` — to publish the draft (handles approval and merge conflicts)


---

## flag-default-value

---
name: flag-default-value
description: Set the default value of a GrowthBook feature flag — the value served when no rules match. Use when the user says "change the default value of flag X", "what does this flag return when no rules apply", "set the fallback to false", "update the default to the new config", or "change what users get by default". Goes through a draft revision and requires publishing. For adding or editing targeting rules, use flag-targeting or flag-rules. For updating administrative metadata, use flag-metadata. For creating a new flag, use flag-create.
allowed-tools: Bash(${CLAUDE_PLUGIN_ROOT}/scripts/gb-call *)
---

# flag-default-value

Set the default value of a GrowthBook feature flag. The default value is what the SDK returns when no rules match a user — it's the flag's baseline state, not a targeting rule. Changes go through a draft revision and require publishing before they take effect.

All API calls go through the bundled helper: `${CLAUDE_PLUGIN_ROOT}/scripts/gb-call`. It needs `GB_API_KEY` set in env or written to `~/.config/growthbook/.env` by `/growthbook:gb-setup`.

## Required inputs

- **Flag ID** — kebab-case key. Use flag-search to resolve if the user gives a description.
- **New default value** — must match the flag's `valueType`. Always serialized as a string.

## Workflow

### 1. Fetch the flag

```bash
gb-call GET /api/v2/features/<flag-id>
```

Capture `valueType` and current `defaultValue`. Show the user the current default so they can confirm the change.

### 2. Validate the new value

Pre-validate before sending — the API does not catch type mismatches at write time:

| `valueType` | Valid `defaultValue` |
| --- | --- |
| `boolean` | `"true"` or `"false"` (string, not JSON bool) |
| `number` | Any string that parses as a number: `"0"`, `"3.14"` |
| `json` | Any valid JSON string: `"{\"key\":\"value\"}"` |
| `string` | Any non-empty string |

If the user's value doesn't match, halt and ask them to fix it. Do not silently coerce.

### 3. Apply the change via a draft

```bash
echo '{"defaultValue":"<string>"}' \
  | gb-call PUT /api/v2/features/<flag-id>/revisions/new/default-value -
```

The `new` magic version creates a fresh draft or layers onto an existing one atomically. Capture the returned `version` number.

### 4. Offer to publish

Ask: "Publish this default-value change now, or leave it as a draft?"

Changing the default value affects every user who matches no rules — this is potentially high-impact. Before publishing, surface the behavior change clearly:

> Changing the default from `<old>` to `<new>` will affect all users not matched by any rule. In `<env>` that's currently `<rule-count>` rule(s) — users falling through all of them will now get `<new>` instead of `<old>`.

Hand off to flag-publish for the publish step.

## Guardrails

- **Draft version threading.** If a version number is already in context from a previous write skill in this session, use it explicitly (e.g. `.../revisions/42/default-value`) instead of `new`. This keeps all changes in the same draft. Fall back to `new` when starting fresh — it auto-creates or reuses the most recently updated open draft.
- **`defaultValue` is always a string, regardless of `valueType`.** The API rejects non-string values. `"false"` for boolean off, `"0"` for numeric zero, `"{}"` for an empty JSON object.
- **Default value ≠ a force rule.** The default value applies only when all rules fail to match. If the user wants to serve a specific value to targeted users, they want flag-targeting, not this skill.
- **This is potentially high-traffic impact.** The default value applies to every unmatched user in every enabled environment. Changing it from the "off" state (e.g., `"false"` → `"true"`) can expose a feature to production traffic if there are no rules. Surface this before publishing.
- **Changing default value for a boolean flag is equivalent to a global toggle** when there are no targeting rules. Confirm the user understands this.
- **Type mismatches surface at SDK evaluation time, not at write time.** The v2 default-value endpoint accepts any string. A number flag with `defaultValue: "not-a-number"` won't error until clients evaluate it.

## Endpoints used

- `GET /api/v2/features/:id` — fetch flag to get current `defaultValue` and `valueType`
- `PUT /api/v2/features/:id/revisions/new/default-value` (body: `{ "defaultValue": "<string>" }`)

## Handoffs

- `flag-search` — if the user gives a description instead of a flag ID
- `flag-targeting` — to add or edit rules that serve specific values to targeted users
- `flag-cleanup` — if the flag is no longer needed and should be archived
- `flag-publish` — to publish the draft, handle approval-required (400) and merge conflicts (409)


---

## flag-experiment

---
name: flag-experiment
description: Add an experiment-ref rule to a GrowthBook feature flag to run an A/B test through that flag. Use when the user says "run an experiment through this flag", "add an A/B test to flag X", "link experiment Y to this flag", "set up variations on this flag for an experiment", "add an experiment-ref rule", or "wire up this experiment to the flag". For launching a full new experiment end-to-end, use experiment-launch. For editing the targeting conditions or scope of an existing experiment rule, use flag-targeting. For stopping an experiment and cleaning up its rule, use experiment-stop then flag-rules.
allowed-tools: Bash(${CLAUDE_PLUGIN_ROOT}/scripts/gb-call *)
---

# flag-experiment

Add an `experiment-ref` rule to a GrowthBook feature flag. This links a flag rule to a separately-managed GrowthBook experiment object — the experiment is the source of truth for variations, metrics, and analysis.

All API calls go through the bundled helper: `${CLAUDE_PLUGIN_ROOT}/scripts/gb-call`. It needs `GB_API_KEY` set in env or written to `~/.config/growthbook/.env` by `/growthbook:gb-setup`.

## Workflow

### Path A — Add an experiment-ref rule

Use this when the user has an existing GrowthBook experiment or wants to launch one through a flag.

**1. Fetch the flag and confirm the experiment exists:**

```bash
gb-call GET /api/v2/features/<flag-id>
```

Capture `valueType` — you'll need it to map variation values correctly.

```bash
gb-call GET /api/v1/experiments/<experiment-id>
```

Capture the experiment's `variations` array. Each variation has an `id` (e.g., `var_abc123`) and a `name`. You'll need these to wire up the rule.

If the user doesn't have an experiment yet, route to `experiment-launch` — it handles experiment creation AND flag wiring end-to-end. Importantly, if a flag already exists, `experiment-launch` will detect it (via a 409 on create, then the reuse path) and wire the experiment to the existing flag rather than creating a new one. Tell the user: "experiment-launch will pick up your existing flag — just give it the same flag key."

**2. Map variation values:**

For each experiment variation, confirm what flag value should be served. The flag's `valueType` determines the format:
- `boolean`: typically `"true"` for treatment, `"false"` for control
- `string` / `number` / `json`: ask the user for each variation's value

**3. Build the payload:**

```json
{
  "rule": {
    "type": "experiment-ref",
    "experimentId": "<exp-id>",
    "variations": [
      { "variationId": "<var_control_id>", "value": "false" },
      { "variationId": "<var_treatment_id>", "value": "true" }
    ],
    "description": "<optional>",
    "enabled": true,
    "allEnvironments": false,
    "environments": ["<env-id>"]
  }
}
```

Variation order in the `variations` array must match the experiment's variation order. If the user omits all `variationId` fields, the server auto-fills them from the experiment — but explicitly providing them is safer and avoids silent mismatches.

**4. Post the rule:**

```bash
echo '<payload>' | gb-call POST /api/v2/features/<flag-id>/revisions/new/rules -
```

Capture the returned `version`. Hand off to flag-publish.

### Path B — Edit an existing experiment-ref rule's targeting

The server allows patching `enabled`, `condition`, `savedGroups`, `prerequisites`, scope (`allEnvironments`/`environments`), and `description` on an experiment-ref rule. Use flag-targeting for this — it has the full conditions decision tree and the warn-and-confirm guardrails for the sensitive fields.

**Do not edit `experimentId` or `variations` on an experiment-ref rule directly.** The experiment is the source of truth. Changing these fields on the flag rule alone causes silent drift between the flag and the experiment. If the user needs to change the experiment, route to experiment-launch or the GrowthBook UI.

## Guardrails

- **Draft version threading.** If a version number is already in context from a previous write skill in this session, use it explicitly instead of `new`. Fall back to `new` when starting fresh.
- **`variations` order must match the experiment's variation order.** If the order is wrong, variation assignments will be mismatched — the control users will see the treatment value and vice versa. Always confirm variation order by reading the experiment before building the payload.
- **Auto-fill of `variationId` is available but risky.** If all `variationId` fields are omitted, the server fills them from the experiment. Use this only when the experiment has exactly the same number of variations as the values the user specified — otherwise the server may silently mismatch.
- **Editing `experimentId` or `variations` on an existing experiment-ref rule requires warn-and-confirm.** These fields are API-allowed but cause flag/experiment drift. Always surface the risk and require explicit confirmation before patching.
- **Server-rejected patches on experiment-ref rules:** `value`, `coverage`, `controlValue`. These are attributes of the experiment, not the flag rule. Halt early if the user tries to set them.
- **Experiment must be in the same datasource.** If the experiment uses a datasource that doesn't match the org's default, metric lookups may fail. Verify datasource consistency if the user is specifying metrics on an inline rule.
- **One experiment-ref rule per experiment per flag** is the standard convention. Multiple rules pointing at the same experiment create overlapping bucketing and corrupt analysis.

## Endpoints used

- `GET /api/v2/features/:id` — fetch flag state, valueType, and current rules
- `GET /api/v1/experiments/:id` — fetch experiment and its variations
- `POST /api/v2/features/:id/revisions/new/rules` — add the experiment-ref rule

## Handoffs

- `flag-search` — to find a flag ID when you only have a name or description
- `experiment-launch` — to create a new experiment and wire it to a flag end-to-end
- `flag-targeting` — to edit the targeting conditions, scope, or saved groups on an existing experiment-ref rule
- `flag-rules` — to reorder or delete experiment rules
- `experiment-stop` — to stop the experiment; after stopping, use flag-rules to clean up the experiment-ref rule
- `flag-publish` — to publish the draft


---

## flag-graph

---
name: flag-graph
description: Trace the dependency relationships around a GrowthBook feature flag — what it depends on (prerequisites), what depends on it (reverse lookup), which experiments link to it, and any holdout associations. Use when the user asks "what depends on flag X", "what flags does flag X require", "will deleting this flag break anything", "show me the dependency graph", "what experiments are linked to this flag", "find everything that uses flag X", or "is it safe to clean up this flag". Read-only — for making changes to prerequisites, use flag-prerequisites. For cleanup, use flag-cleanup.
allowed-tools: Bash(${CLAUDE_PLUGIN_ROOT}/scripts/gb-call *)
---

# flag-graph

Trace the dependency relationships around a GrowthBook feature flag. Use this skill before making structural changes to a flag (renaming, archiving, deleting) to understand the blast radius, or when building a mental model of how flags depend on each other.

Read-only — this skill never writes.

All API calls go through the bundled helper: `${CLAUDE_PLUGIN_ROOT}/scripts/gb-call`. It needs `GB_API_KEY` set in env or written to `~/.config/growthbook/.env` by `/growthbook:gb-setup`.

## Workflow

### 1. Fetch the flag

```bash
gb-call GET /api/v2/features/<flag-id>
```

Capture: `prerequisites` (feature-level), `rules` (check for rule-level prerequisites, `experiment-ref` entries, `safe-rollout` entries), `holdout`.

### 2. What does this flag depend on? (forward dependencies)

From the flag's `prerequisites` array, for each prerequisite:

```bash
gb-call GET /api/v2/features/<prereq-flag-id>
```

Show: prerequisite flag ID, its current state (enabled envs, default value), and the condition the current flag is checking against it. Recurse one level if the prerequisite also has prerequisites — surface the full chain, noting where it ends.

Also check rule-level prerequisites in the `rules` array — each rule can have its own `prerequisites` field. Surface these as rule-scoped dependencies.

### 3. What depends on this flag? (reverse lookup)

GrowthBook has no reverse-prerequisite API endpoint. A full reverse lookup requires scanning all flags:

```bash
gb-call GET /api/v2/feature-keys
```

Then paginate through all flags looking for any that list the target flag in their `prerequisites`:

```bash
gb-call GET '/api/v2/features?limit=100'
gb-call GET '/api/v2/features?limit=100&offset=100'   # continue until exhausted
```

For each flag returned, check `prerequisites[*].id` and `rules[*].prerequisites[*].id` against the target flag ID.

Warn the user: this is an O(n) scan across all flags. On large orgs with hundreds of flags, it may take several paginated calls.

### 4. Which experiments link to this flag?

Check for experiment-ref rules in the flag's `rules` array (field `experimentId` on rules with `type: "experiment-ref"`). For each:

```bash
gb-call GET /api/v1/experiments/<experiment-id>
```

Surface: experiment name, status (running/stopped/draft), and whether the flag's `id` is the experiment's `trackingKey`.

Also check if any experiments list this flag in `linkedFeatures`:

```bash
gb-call GET '/api/v1/experiments?trackingKey=<flag-id>'
```

This catches experiments wired by convention (experiment-launch sets `trackingKey === flag-id`). Complement with the experiment-ref rule scan above for experiments wired manually.

### 5. Holdout associations

If the flag has a `holdout` field set, note the holdout ID and warn: "This flag participates in holdout `<holdout-id>`. Deleting or significantly changing this flag could affect holdout analysis."

### 6. Present the dependency report

```
Dependency graph for `<flag-id>`:

DEPENDS ON (forward):
  → flag-Y (prerequisite, condition: value === true)
      → flag-Z (flag-Y's prerequisite, condition: value === "v2")

DEPENDED ON BY (reverse, scanned <N> flags):
  ← flag-A (feature-level prerequisite)
  ← flag-B (rule-level prerequisite on rule "Beta testers")
  [limitation: reverse lookup scanned all flags; may miss any created after this scan]

EXPERIMENTS:
  exp_abc123 "Checkout experiment" — status: running, trackingKey matches

HOLDOUTS:
  holdout_xyz — flag participates; remove cautiously

SAFE TO DELETE?: <yes / no / caution — explain why>
```

## Guardrails

- **Reverse lookup is a full scan — rate-limit aware.** The 60 rpm rate limit applies. If the org has >600 flags, the scan takes 10+ API calls. Surface the count before starting and offer to proceed.
- **Reverse lookup is point-in-time.** Flags created after this scan won't appear. Note the scan timestamp in the report.
- **No API for reverse prerequisite lookup.** There is no `GET /features?dependsOn=<id>` endpoint. The scan is the only reliable approach.
- **Experiment `trackingKey` scan catches the common case.** experiment-launch sets `trackingKey === flag-id` by convention. Manual wiring (different `trackingKey`, linked via `linkedFeatures`) may not be caught by the trackingKey query — the rule scan in step 4 is the defensive check.
- **Read-only.** This skill never writes. For changing prerequisites, use flag-prerequisites. For deletion, use flag-cleanup.
- **Circular dependency detection.** If during the forward-dependency traversal you encounter a flag that points back to the starting flag, surface it as a circular dependency warning — it means the flag can never fully evaluate.

## Endpoints used

- `GET /api/v2/features/:id` — fetch flag and its dependencies
- `GET /api/v2/feature-keys` — full flag ID list for reverse lookup
- `GET /api/v2/features` (paginated, limit/offset) — full flag scan for reverse lookup
- `GET /api/v1/experiments/:id` — fetch linked experiment details
- `GET /api/v1/experiments?trackingKey=<flag-id>` — find experiments linked by convention

## Handoffs

- `flag-prerequisites` — to add, remove, or modify feature-level prerequisites
- `flag-cleanup` — to archive or delete the flag after confirming the blast radius
- `experiment-stop` — if a linked experiment is running and needs to be stopped before flag removal
- `flag-search` — to find all flags matching criteria (broader than single-flag dependency tracing)


---

## flag-metadata

---
name: flag-metadata
description: Update the administrative metadata of an existing GrowthBook feature flag — description, owner, project, tags, custom fields, or JSON schema. Use when the user says "change the owner of flag X", "add tags to this flag", "move this flag to project Y", "update the description", "set a JSON schema on this flag", "rename the owner", or "tag this flag as payments". Goes through a draft revision and requires publishing to take effect. For changing the flag's default value, use flag-default-value. For creating a new flag, use flag-create. For archiving or deleting a flag, use flag-cleanup.
allowed-tools: Bash(${CLAUDE_PLUGIN_ROOT}/scripts/gb-call *)
---

# flag-metadata

Update the administrative metadata of an existing GrowthBook feature flag. Metadata changes (description, owner, project, tags, custom fields, JSON schema) go through a draft revision like all other flag changes — they need to be published before they take effect.

All API calls go through the bundled helper: `${CLAUDE_PLUGIN_ROOT}/scripts/gb-call`. It needs `GB_API_KEY` set in env or written to `~/.config/growthbook/.env` by `/growthbook:gb-setup`.

## Required inputs

Collect before starting:

- **Flag ID** — kebab-case key. If the user gives a description, use flag-search to resolve it first.
- **What to change** — one or more of: description, owner, project, tags, neverStale, customFields, jsonSchema.

## Workflow

### 1. Fetch current metadata

```bash
gb-call GET /api/v2/features/<flag-id>
```

Show the user the current values for any fields they're about to change. Confirm the proposed new values before mutating.

### 2. Resolve the project ID (if changing project)

Project names aren't accepted by the API — resolve the name to an ID first:

```bash
gb-call GET /api/v1/projects
```

Match the user's project name to the returned list and use the `id` field.

### 3. Apply the metadata change via a draft

```bash
echo '<payload>' | gb-call PUT /api/v2/features/<flag-id>/revisions/new/metadata -
```

The `new` magic version creates a fresh draft or layers onto an existing one atomically.

Supported fields and their types:

```json
{
  "description": "<string>",
  "owner": "<email or u_... userId>",
  "project": "<project-id or empty string to clear>",
  "tags": ["<tag>", "<tag>"],
  "neverStale": true,
  "customFields": { "<key>": "<value>" },
  "jsonSchema": { "<json-schema-object>" }
}
```

Send only the fields the user wants to change. Do not echo back unchanged fields.

Capture the returned `version` number for the publish step.

### 4. Offer to publish

Ask: "Publish this metadata change now, or leave it as a draft?"

Metadata changes are low-risk — default to offering publish immediately. Hand off to flag-publish for the publish step, including any approval-required or merge-conflict handling.

## Guardrails

- **Draft version threading.** If a version number is already in context from a previous write skill in this session, use it explicitly (e.g. `.../revisions/42/metadata`) instead of `new`. This keeps all changes in the same draft. Fall back to `new` when starting fresh — it auto-creates or reuses the most recently updated open draft.
- **`owner` accepts email or `u_...` userId.** Ask the user for the email or userId of the person to assign. If they want to assign it to themselves, ask for their email or userId — there's no env default to read it from. If the user gives a name rather than an email, ask for clarification — the API doesn't accept display names.
- **`project` is an ID, not a name.** Always resolve project names via `GET /api/v1/projects` before setting. An empty string `""` clears the project association (moves the flag back to org-wide scope).
- **`tags` replaces the full array.** It's not additive — if the flag has existing tags and the user only wants to add one, fetch the current tags first, append, and send the full updated array.
- **`neverStale: true` opts the flag out of stale detection permanently.** Use for kill switches, ops toggles, and license gates. Warn the user: once set, it won't appear in stale-flag reports even if untouched for months.
- **`jsonSchema` is enterprise-only.** If the org doesn't have the feature, the API returns an error — surface it clearly.
- **Metadata changes still go through approval workflows.** A seemingly innocuous description change can trigger the org's review gate. Use flag-publish and expect the same approval-required / merge-conflict failure modes as any other revision.
- **`customFields` keys must match the org's configured custom field definitions.** If the key isn't recognized by the org, the API may silently drop it or error. Verify custom field key names are correct.

## Endpoints used

- `GET /api/v2/features/:id` — fetch current metadata for confirmation
- `GET /api/v1/projects` — resolve project name to ID
- `PUT /api/v2/features/:id/revisions/new/metadata` — apply metadata change to draft

## Handoffs

- `flag-search` — if the user gives a description instead of a flag ID
- `flag-default-value` — to change what the flag serves when no rules match
- `flag-cleanup` — to archive or delete the flag entirely
- `flag-publish` — to publish the draft, handle approval-required (400) and merge conflicts (409)


---

## flag-monitoring

---
name: flag-monitoring
description: Set up a monitored progressive rollout ("safe rollout") for a GrowthBook feature flag — combining a ramp schedule with guardrail metric monitoring, automated signals, and optional auto-rollback. Use when the user says "roll this out safely", "monitor the rollout with guardrail metrics", "set up a safe rollout", "I want to ramp this with automatic rollback if metrics regress", "configure monitoring on the ramp", "check the monitoring status of this rollout", "approve the next monitored step", or "roll back because guardrails are failing". For unmonitored ramps (just progressive coverage, no metrics), use flag-ramp directly. For simple on/off time windows, use flag-schedule.
allowed-tools: Bash(${CLAUDE_PLUGIN_ROOT}/scripts/gb-call *), Bash(open https://*), Bash(xdg-open https://*)
---

# flag-monitoring

Set up and manage a monitored progressive rollout (also called a "safe rollout") for a GrowthBook feature flag. A safe rollout is a standard `rollout` rule with a multi-step ramp schedule and `monitoringConfig` attached — the monitoring watches guardrail metrics at each step and can signal or automatically trigger a rollback if regressions are detected.

All API calls go through the bundled helper: `${CLAUDE_PLUGIN_ROOT}/scripts/gb-call`. It needs `GB_API_KEY` set in env or written to `~/.config/growthbook/.env` by `/growthbook:gb-setup`.

## Required inputs for monitoring configuration

Before configuring, collect:
- **Datasource ID** — the datasource that tracks exposure and metric events
- **Exposure query ID** — which assignment query identifies users in the rollout
- **Guardrail metric IDs** — at least one metric that must not regress (e.g., error rate, crash rate)
- **Signal metric IDs** (optional) — leading-indicator metrics to watch, not hard gates
- **SRM action** — what to do on a Sample Ratio Mismatch: `"hold"` (recommended — pause for inspection) or `"rollback"` (aggressive) or `"warn"`
- **Auto-rollback** (`autoUpdate` in the monitored ramp payload, `autoRollback` in safe-rollout) — `true` means the system rolls back without human approval on guardrail failure; `false` holds for human review. Default to `true` unless the user has concerns about query cost or wants to control the cadence of monitoring snapshots manually

```bash
# Resolve datasource and exposure query IDs:
gb-call GET /api/v1/data-sources

# Resolve metric IDs — query both: fact metrics and legacy metrics are separate endpoints,
# and most orgs keep guardrail/signal metrics as fact metrics:
gb-call GET '/api/v1/fact-metrics?datasourceId=<ds-id>&limit=100'
gb-call GET '/api/v1/metrics?datasourceId=<ds-id>&limit=100'
```

## Workflow

### Path A — Create a monitored ramp (ramp structure + monitoring together)

Build the full ramp schedule payload with `monitoringConfig` included in a single PUT. This covers both new ramps and updating an existing draft's ramp before it's published.

**1. Collect the ramp steps** — see flag-ramp for step/interval design guidance.

**2. Collect monitoring config** (see Required inputs above):
```bash
gb-call GET /api/v1/data-sources
gb-call GET '/api/v1/fact-metrics?datasourceId=<ds-id>&limit=100'
gb-call GET '/api/v1/metrics?datasourceId=<ds-id>&limit=100'
```

**3. PUT the full payload (steps + monitoring together):**

```bash
echo '{
  "startActions": [
    { "targetType": "feature-rule", "targetId": "<rule-id>", "patch": { "coverage": 0 } }
  ],
  "steps": [
    {
      "interval": 86400,
      "monitored": true,
      "actions": [{ "targetType": "feature-rule", "targetId": "<rule-id>", "patch": { "coverage": 0.1 } }]
    },
    {
      "interval": 86400,
      "monitored": true,
      "holdConditions": { "requiresApproval": true },
      "actions": [{ "targetType": "feature-rule", "targetId": "<rule-id>", "patch": { "coverage": 0.5 } }]
    }
  ],
  "endActions": [
    { "targetType": "feature-rule", "targetId": "<rule-id>", "patch": { "coverage": 1.0 } }
  ],
  "monitoringConfig": {
    "datasourceId": "<ds-id>",
    "exposureQueryId": "<query-id>",
    "guardrailMetricIds": ["<metric-id>"],
    "signalMetricIds": ["<metric-id>"],
    "autoUpdate": true,
    "srmAction": "hold",
    "noTrafficAction": "warn",
    "noTrafficGracePeriodHours": 24,
    "multipleExposureAction": "warn"
  }
}' | gb-call PUT /api/v2/features/<flag-id>/revisions/new/rules/<rule-id>/ramp-schedule -
```

`startActions` sets coverage to 0 (the rollback anchor). `monitored: true` on a step tells the ramp to wait for monitoring results before auto-advancing — it only has effect when `monitoringConfig` is present. The `holdConditions.requiresApproval` on step 2 adds a human gate after the interval elapses and monitoring clears.

`autoUpdate: true` rolls back automatically on guardrail failure. Mention `autoUpdate: false` only if the user wants to control monitoring cadence manually or is concerned about query costs.

Omit `startDate` unless the user explicitly requests a delayed start.

**4. Hand off to flag-publish.**

### Path B — Check monitoring status or respond to signals

Before taking any action, open the feature page — it shows ramp step progress, guardrail and signal metric health, experiment-level health checks (SRM, multiple exposures, no traffic), and full metric performance drilldowns with effect sizes and confidence intervals. The API `/status` endpoint gives you the `decision`, but the UI gives you the context to make it:

```bash
# macOS:
open <host>/features/<flag-id>
# Linux:
xdg-open <host>/features/<flag-id>
```

**Check status via API** (for scripted pipelines or when the user wants a quick decision signal):
```bash
gb-call GET /api/v1/ramp-schedules/<rs-id>/status
```
Returns `decision` (`"advance"` / `"hold"` / `"rollback"` / `"waiting"`), guardrail health, and whether the current step is awaiting approval. Get `<rs-id>` from the flag's rule (`rampScheduleId`) or:
```bash
gb-call GET '/api/v1/ramp-schedules?featureId=<flag-id>'
```

**Approve a monitored hold-for-approval step** (after interval elapsed and monitoring shows healthy):
```bash
gb-call POST /api/v1/ramp-schedules/<rs-id>/actions/approve-step
```
Returns 400 if monitoring hasn't produced fresh healthy results yet or the interval is still counting — poll `/status` first.

**Advance past a monitoring hold** (decision is `"hold"` and you've reviewed the signals and accept the risk):
```bash
echo '{}' | gb-call POST /api/v1/ramp-schedules/<rs-id>/actions/advance -
```

**Roll back on guardrail failure** (when `decision: "rollback"` or guardrails are failing):
```bash
echo '{"reason":"<description of what failed>"}' | gb-call POST /api/v1/ramp-schedules/<rs-id>/actions/rollback -
```

**Emergency stop** (fastest — disable the flag environment via flag-toggle, no ramp schedule ID needed).

**Open the UI** for a visual health dashboard:
```bash
# macOS:
open <host>/features/<flag-id>
# Linux:
xdg-open <host>/features/<flag-id>
```

For the full live ramp management action reference (pause, resume, complete, restart), see flag-ramp Path D.

## Guardrails

- **Draft version threading.** If a version number is already in context from a previous write skill in this session, use it explicitly instead of `new`. Fall back to `new` when starting fresh.
- **Check the target environment is enabled.** If the flag is disabled in the target env, the ramp will do nothing — warn and route to flag-toggle first.
- **`autoUpdate`** controls auto-rollback in the monitored ramp schedule's `monitoringConfig`. Defaults to `true` (rolls back automatically on guardrail failure).
- **`startDate` is optional** — omit it unless the user explicitly wants a delayed start. Most teams start ramps via user action after verifying the publish succeeded.
- **`cutoffDate` is niche** — don't mention it unless the user asks.
- **At least one guardrail metric is required.** Monitoring without a guardrail is just observation — if the user can't provide a guardrail metric, recommend using an unmonitored ramp (flag-ramp) instead.
- **Metrics must be on the same datasource.** The `datasourceId` in `monitoringConfig` must match the datasource where the guardrail metrics are defined. If they're on different datasources, the API will reject the configuration.
- **`autoUpdate: true` means the system rolls back without human approval.** Mention `autoUpdate: false` only if the user wants to control monitoring cadence manually or is concerned about query costs.
- **For monitored steps with `holdConditions.requiresApproval`:** each step pause requires explicit human sign-off before the ramp advances.
- **SRM action defaults matter.** `"rollback"` on SRM is aggressive. `"hold"` is safer — the ramp pauses for human inspection. Recommend `"hold"` for SRM unless the user explicitly wants aggressive protection.

## Cross-links

This skill orchestrates:
- **flag-ramp** — for the structural ramp schedule (steps, intervals, start/cutoff dates). Consult flag-ramp for building custom step sequences.
- **flag-schedule** — for time-gating the start of the ramp (setting `startDate` on the ramp schedule).
- **flag-targeting** — for setting targeting conditions on the rule that's being ramped.
- **flag-toggle** — for emergency kill-switch if monitoring signals a critical issue.

## Endpoints used

**Draft (pre-publish):**
- `GET /api/v2/features/:id` — fetch flag and current rules
- `GET /api/v1/data-sources` — resolve datasource IDs
- `GET /api/v1/fact-metrics?datasourceId=…`, `GET /api/v1/metrics?datasourceId=…` — resolve guardrail and signal metric IDs (fact metrics and legacy metrics are separate endpoints)
- `PUT /api/v2/features/:id/revisions/new/rules/:ruleId/ramp-schedule` — create/update ramp schedule with monitoringConfig

**Live ramp management:**
- `GET /api/v1/ramp-schedules` — list (`featureId`, `ruleId` filters)
- `GET /api/v1/ramp-schedules/:id/status` — real-time health, decision, per-metric effects
- `POST /api/v1/ramp-schedules/:id/actions/approve-step`
- `POST /api/v1/ramp-schedules/:id/actions/advance` (body: optional `{ force: true }`)
- `POST /api/v1/ramp-schedules/:id/actions/rollback` (body: `{ reason: string }`)
- See flag-ramp Path D for the full action reference (pause, resume, complete, restart)

## Handoffs

- `flag-ramp` — for managing ramp step structure without monitoring
- `flag-toggle` — for emergency kill-switch during a live monitored rollout
- `flag-targeting` — to configure rule conditions before setting up monitoring
- `flag-publish` — to publish the draft and activate the monitored rollout


---

## flag-review

---
name: flag-review
description: Request or submit an approval review on a GrowthBook feature flag draft revision. Use when the user says "request review for this draft", "approve this change", "reject this draft", "request changes on revision X", "I want to review flag Y's pending draft", "submit my approval", "mark this as needing changes", "who needs to approve this", or "check the review status". For creating and editing drafts, use the relevant flag-* write skill. For publishing an approved draft or resolving merge conflicts, use flag-publish. For listing all pending drafts across flags, use flag-revisions.
allowed-tools: Bash(${CLAUDE_PLUGIN_ROOT}/scripts/gb-call *), Bash(open https://*), Bash(xdg-open https://*)
---

# flag-review

Request and submit approval reviews on GrowthBook feature flag draft revisions. Only needed when the org has approval workflows configured — if approvals aren't required, flag-publish handles the full flow without a review step.

Two roles use this skill: the **drafter** (requests a review, can't self-approve) and the **reviewer** (submits the review decision).

All API calls go through the bundled helper: `${CLAUDE_PLUGIN_ROOT}/scripts/gb-call`. It needs `GB_API_KEY` set in env or written to `~/.config/growthbook/.env` by `/growthbook:gb-setup`.

## Approval flow

```
draft → [request-review] → pending-review → [approve]           → approved → [publish]
                                           → [request-changes]  → changes-requested → [edit + re-request] → pending-review
                                           → [comment]          → pending-review (status unchanged)
```

## Workflow

### Path A — Request review (drafter asking for approval)

1. Resolve the revision. If the user gave a version number, use it. Otherwise try `/latest` (happy path when one draft exists), then fall back to listing if needed:
   ```bash
   gb-call GET /api/v2/features/<id>/revisions/latest
   # or if version is known:
   gb-call GET /api/v2/features/<id>/revisions/<version>
   ```
   Accept `draft` or `changes-requested` status. For any other status, surface it and explain what it means using the status table from flag-revisions.

2. Request review:
   ```bash
   echo '{"comment":"<optional context for reviewers>"}' \
     | gb-call POST /api/v2/features/<id>/revisions/<version>/request-review -
   ```

   Revision moves to `pending-review`. Tell the user a reviewer needs to approve before it can be published via flag-publish. Remind them that self-approval is not allowed — a different team member must review.

### Path B — Submit a review (reviewer acting on a pending-review revision)

1. Identify the revision. A version number alone is not enough — you always need the flag ID too (version numbers are per-flag counters, not globally unique). Collect whichever of these the user has, then query accordingly:

   **Flag ID + version known** → fetch directly:
   ```bash
   gb-call GET /api/v2/features/<id>/revisions/<version>
   ```

   **Flag ID known, version unknown** → list pending-review on that flag:
   ```bash
   gb-call GET '/api/v2/features/<id>/revisions?status=pending-review'
   ```

   **Author email or userId known** → filter cross-feature by author:
   ```bash
   gb-call GET '/api/v2/flag-revisions?status=pending-review&author=<email-or-userid>'
   ```

   **Author name known but not email** → fetch all pending-review revisions and filter client-side on `createdBy` matching the name:
   ```bash
   gb-call GET '/api/v2/flag-revisions?status=pending-review'
   ```
   Each revision has a `createdBy` field (display name or "API"). Filter for entries where `createdBy` contains the name the user gave, then confirm with the user before proceeding.

   **Nothing known** → same broad query, show all results and ask the user to identify theirs.

2. For anything non-trivial, offer to open the GrowthBook UI first — the side-by-side diff and approval controls are clearer than text:
   ```bash
   # macOS:
   open <host>/features/<flag-id>?v=<version>
   # Linux:
   xdg-open <host>/features/<flag-id>?v=<version>
   ```
   Derive `<host>` from `GB_API_URL` by replacing `api.` → `app.`. If the reviewer prefers to work in the UI, stop here.

   For API-based review, fetch both the revision and the live feature to show a proper before/after diff:
   ```bash
   gb-call GET /api/v2/features/<id>/revisions/<version>   # draft state
   gb-call GET /api/v2/features/<id>                       # current live state
   ```
   Surface: which rules changed (added/edited/removed), defaultValue change, metadata changes, env toggle changes, prerequisites changes — comparing draft fields against the live feature.

3. Ask the reviewer which action they want:
   - **approve** — changes look good, ready to publish
   - **request-changes** — issues found, author needs to update
   - **comment** — feedback only, no status change

4. Submit the review:
   ```bash
   echo '{"action":"approve","comment":"<optional>"}' \
     | gb-call POST /api/v2/features/<id>/revisions/<version>/submit-review -
   ```

   Status transitions:
   - `approve` → `approved` — tell user to publish via flag-publish
   - `request-changes` → `changes-requested` — tell reviewer what happens next (author edits, re-requests)
   - `comment` → `pending-review` unchanged — comment is recorded

### Path C — Check review status

If version isn't known, try `/latest` first:
```bash
gb-call GET /api/v2/features/<id>/revisions/latest
# or with a known version:
gb-call GET /api/v2/features/<id>/revisions/<version>
```

Report status and what needs to happen next:

| Status | Next step |
| --- | --- |
| `draft` | Author requests review when ready |
| `pending-review` | Reviewer submits a decision |
| `approved` | Author publishes via flag-publish |
| `changes-requested` | Author edits draft, then re-requests review |

## Guardrails

- **Self-approval is blocked server-side.** The API rejects a review submitted by the draft's own author. If the user mentions they created the draft, halt before calling submit-review: "You created this draft — a different team member must approve it." Otherwise let the server enforce it and surface the error if it fires.
- **Can only request-review on `draft` or `changes-requested` status.** Surface the actual status if the user tries on anything else.
- **Can only submit-review on `pending-review` status.** Surface the actual status if it doesn't match.
- **`changes-requested` is not discarded.** The draft still exists; the author edits it and re-requests review via Path A. Don't suggest discarding unless the author explicitly wants to abandon the changes.
- **Reset-review-on-changes.** If the org has this setting enabled, any edit to an `approved` draft reverts it to `draft`. Warn the user if they're about to edit an already-approved revision: "Editing this revision will reset its approval status — you'll need to request review again."
- **Approval ≠ publication.** An `approved` draft is not yet live. The author still needs to run flag-publish.
- **This skill does not publish.** After approval, hand off to flag-publish.

## Endpoints used

- `GET /api/v2/features/:id/revisions/:version` — inspect revision before acting
- `GET /api/v2/features/:id/revisions` (status filter) — find pending-review revisions for a flag
- `GET /api/v2/flag-revisions` (status, mine filters) — find pending-review revisions across all flags
- `POST /api/v2/features/:id/revisions/:version/request-review` (body: optional comment)
- `POST /api/v2/features/:id/revisions/:version/submit-review` (body: action + optional comment)

## Handoffs

- `flag-revisions` — to list and inspect all open drafts
- `flag-publish` — after approval, to publish the draft live


---

## flag-revisions

---
name: flag-revisions
description: List, inspect, and manage draft revisions for a GrowthBook feature flag. Use when the user asks "what drafts are open for flag X", "show me pending approvals", "who owns this draft", "discard this draft", "start a new draft", "what revision is my flag on", "list all my pending changes", "what's waiting for review", or any question about the state of in-progress changes to a flag. Every flag write operation — rules, metadata, default value, toggles — works through a draft revision; use this skill to see what's in flight before making changes. For requesting or submitting an approval review, use flag-review. For publishing a draft live or resolving merge conflicts, use flag-publish. For making flag changes, use the relevant flag-* write skill.
allowed-tools: Bash(${CLAUDE_PLUGIN_ROOT}/scripts/gb-call *)
---

# flag-revisions

Inspect and manage draft revisions on GrowthBook feature flags. Every flag change goes through a draft revision before going live — this is the "what's in flight?" skill. Use it to see open drafts, understand their status, and manage their lifecycle (create, discard). Making actual flag changes (rules, metadata, toggles, default value) is handled by the relevant flag-* write skills, which create and manage drafts automatically.

All API calls go through the bundled helper: `${CLAUDE_PLUGIN_ROOT}/scripts/gb-call`. It needs `GB_API_KEY` set in env or written to `~/.config/growthbook/.env` by `/growthbook:gb-setup`.

## Revision status reference

| Status | Meaning | What happens next |
| --- | --- | --- |
| `draft` | Being edited, not yet submitted | Edit more, then request-review or publish |
| `pending-review` | Review requested, awaiting approval | Reviewer submits decision via flag-review |
| `approved` | Approved, ready to publish | Publish via flag-publish |
| `changes-requested` | Reviewer flagged issues | Author edits draft, re-requests review |
| `published` | Live, immutable | Can be reverted via flag-publish |
| `discarded` | Abandoned | No further action |
| `pending-parent` | Auto-managed by a ramp schedule | Do not discard manually |

## Workflow

Pick the path that matches the user's request.

### Path A — List active drafts for a specific feature

Ask whether the user wants their own drafts or all drafts on this flag, then query accordingly:

```bash
# User's own active drafts:
gb-call GET '/api/v2/features/<id>/revisions?status=all-drafts&mine=true'

# All active drafts on this flag:
gb-call GET '/api/v2/features/<id>/revisions?status=all-drafts'
```

`all-drafts` expands to all four active-draft statuses (draft, pending-review, approved, changes-requested). Omitting `status` on v2 has the same effect. To target a subset: `?status=draft,pending-review`.

For each revision surface: version number, status, who created it, date, comment. Call out anything that needs attention — `pending-review` needs a reviewer, `changes-requested` needs the author to act.

### Path B — List my drafts across all features

```bash
gb-call GET '/api/v2/flag-revisions?mine=true&status=all-drafts'
```

Omit `mine=true` to see all active drafts across the org. Omitting `status` on v2 defaults to `all-drafts`.

Group output by feature for readability. Surface how many need action.

### Path C — Inspect a specific revision

```bash
gb-call GET /api/v2/features/<id>/revisions/<version>
```

Surface what changed vs the live version: `defaultValue`, `rules` array, metadata fields, `environmentsEnabled` per env, `prerequisites`. Also show `baseVersion` (what live version this draft branched from) and `status`.

To get the most recently updated active draft without knowing the version number, ask first whether the user wants their own draft or the latest by anyone — this avoids silently landing in a teammate's draft:

```bash
# User's own most recent draft:
gb-call GET '/api/v2/features/<id>/revisions/latest?mine=true'

# Most recently updated draft by anyone:
gb-call GET /api/v2/features/<id>/revisions/latest
```

Returns a single revision. If multiple drafts are open, it silently picks the most recently updated one — use Path A to surface all of them instead.

### Path D — Draft creation: implicit vs. explicit

There are two ways to create a draft. Both are valid; which to use depends on the situation.

**Implicit (the default in all write skills):** pass `new` as the version in any write endpoint. The server auto-creates a fresh draft or layers the change onto the most recently updated open draft.

```bash
# Example — the "new" magic used in write skills:
echo '<payload>' | gb-call PUT /api/v2/features/<id>/revisions/new/default-value -
```

Use this when: making a single change, or when there's only one open draft and layering onto it is the right behavior.

**Explicit (pre-create, then target):** create a blank draft first, capture the version number, then point all subsequent write calls at that specific version instead of `new`. This is a three-phase flow — do not skip ahead.

**Phase 1 — Setup (before any flag changes):**
```bash
echo '{"comment":"<optional intent note>"}' | gb-call POST /api/v2/features/<id>/revisions -
# Returns { revision: { version: <N>, status: "draft", ... } }
```
Note the version number `<N>`. All changes in Phase 2 must target this version.

**Phase 2 — All flag changes (complete everything before moving on):**

Use the relevant write skills (flag-targeting, flag-toggle, flag-metadata, flag-default-value, flag-prerequisites, etc.), substituting `<N>` for `new` in every endpoint path:
```bash
echo '<payload>' | gb-call PUT /api/v2/features/<id>/revisions/<N>/default-value -
echo '<payload>' | gb-call POST /api/v2/features/<id>/revisions/<N>/rules -
echo '<payload>' | gb-call PUT /api/v2/features/<id>/revisions/<N>/metadata -
```
Do not proceed to Phase 3 until **all** intended changes have been applied.

**Phase 3 — Publish (only after all changes are done):**

Hand off to flag-publish with version `<N>`.

Use this pattern when: the user wants a clean slate independent of existing open drafts, when making several coordinated changes that must land in the same revision, or when multiple drafts are open and you need to control which one receives the edits.

Note: `baseVersion` can be passed in the Phase 1 body to branch from a specific published revision rather than the current live one.

### Path E — Discard a draft

```bash
gb-call POST /api/v2/features/<id>/revisions/<version>/discard
```

Confirm before discarding: "Discard revision `<version>` on `<flag-id>`? This is irreversible — all pending changes in this draft will be lost."

Works on any non-terminal status — `draft`, `pending-review`, `approved`, `changes-requested` can all be discarded directly. Only `published` and `discarded` are blocked by the server.

## Guardrails

- **`status` accepts comma-separated values.** `?status=draft,approved` returns revisions matching either status. Use `?status=all-drafts` as a shorthand for all four active-draft statuses. On v2 endpoints, omitting `status` defaults to `all-drafts`.
- **`pending-parent` revisions are auto-managed.** They're created and published automatically as part of a ramp schedule. Never discard them manually; contact GrowthBook support if one appears stuck.
- **A flag can have multiple open drafts.** Always show all of them — don't assume there's only one.
- **`version=new` is the canonical write pattern.** Other write skills use it to create-or-reuse a draft atomically. Only call `POST /revisions` explicitly when the user wants a blank draft before editing.
- **Discard is irreversible.** The draft and all its pending changes are gone. If the user says "discard" casually as part of "I'll redo this," confirm they understand the changes won't be preserved.
- **`changes-requested` ≠ discarded.** The draft still exists and can be edited. The author fixes the issues and calls request-review again via flag-review.
- **This skill is read/manage only.** For changing a flag's rules, metadata, default value, or environment toggles, use the relevant write skill.

## Endpoints used

- `GET /api/v2/features/:id/revisions` — list revisions for a feature (status, author, limit, offset filters)
- `GET /api/v2/flag-revisions` — list revisions across all features (mine, status, featureId, author filters)
- `GET /api/v2/features/:id/revisions/:version` — inspect a specific revision
- `GET /api/v2/features/:id/revisions/latest` — get most recent draft (mine=true filter available)
- `POST /api/v2/features/:id/revisions` — create a new empty draft
- `POST /api/v2/features/:id/revisions/:version/discard` — discard a draft

## Handoffs

- `flag-review` — to request or submit an approval review on a draft
- `flag-publish` — to publish a draft, resolve merge conflicts, or revert to a prior revision
- `flag-rules`, `flag-targeting`, `flag-toggle`, `flag-metadata`, `flag-default-value`, `flag-prerequisites` — write skills that create and modify drafts


---

## flag-search

---
name: flag-search
description: Search, list, and audit GrowthBook feature flags. Use when the user asks "what flags do we have", "find flags tagged payments", "list flags in project X", "which flags are stale", "find flags owned by bryce@company.com", "show me all disabled flags in production", "audit our flags", "find flags with no rules", or "what can we clean up". Read-only — for actually removing flags, use flag-cleanup. For inspecting what depends on a specific flag, use flag-graph. For adding or changing rules, use flag-targeting or flag-rules.
allowed-tools: Bash(${CLAUDE_PLUGIN_ROOT}/scripts/gb-call *)
---

# flag-search

Search, list, and audit GrowthBook feature flags. Three jobs share this skill: broad inventory listing, filtered search by criteria, and stale-flag auditing for cleanup candidates.

Read-only — this skill never writes.

All API calls go through the bundled helper: `${CLAUDE_PLUGIN_ROOT}/scripts/gb-call`. It needs `GB_API_KEY` set in env or written to `~/.config/growthbook/.env` by `/growthbook:gb-setup`.

## Workflow

Pick the path that matches the user's request.

### Path A — Full inventory ("what flags do we have?")

Start with the lightweight key list:

```bash
gb-call GET /api/v2/feature-keys
```

Returns every flag ID as a string array — no pagination, cheapest call. Surface the count and group by prefix if patterns emerge (`checkout-*`, `payments-*`, `infra-*`).

If the user wants details on the full set or a subset, paginate:

```bash
gb-call GET '/api/v2/features?limit=100'
gb-call GET '/api/v2/features?limit=100&offset=100'   # next page
```

100 per page is the cap. Loop with `offset` until the returned count is below 100.

Group output by project if the org uses projects. Flag keys that look like orphaned test/debug entries (`test-`, `temp-`, `debug-`, `delete-me`).

### Path B — Search by criteria

Use the `/api/v2/features` list endpoint with query params to narrow results. Available filters:

```bash
# By project:
gb-call GET '/api/v2/features?projectId=<project-id>'

# By tag (exact match, single tag):
gb-call GET '/api/v2/features?tag=<tag>'
```

For filters not supported by the API (owner, environment state, value type), fetch the full set and filter client-side from the response fields.

Common searches:

| Request | Approach |
| --- | --- |
| "Flags owned by X" | Fetch all, filter on `owner.email` |
| "Boolean flags" | Fetch all, filter on `valueType === "boolean"` |
| "Flags enabled in production" | Fetch all, filter on `environmentSettings.production.enabled === true` |
| "Flags with no rules" | Fetch all, filter on `rules.length === 0` |
| "Flags tagged payments" | `GET /api/v2/features?tag=payments` |
| "Flags in project Y" | Resolve project name → ID, then `GET /api/v2/features?projectId=<id>` |

When filtering client-side on a large org, paginate through the full set first, then filter.

### Path C — Stale flag audit ("what can we clean up?")

GrowthBook defines a flag as stale when **both** conditions hold: (a) no updates for two weeks, and (b) either no active environments or all rules route 100% of traffic to a single variation.

**Step C-1: Get the flag IDs to audit.**

Either from the user's explicit list, from a codebase grep, or by pulling all IDs:

```bash
gb-call GET /api/v2/feature-keys
```

**Step C-2: Run the staleness check.**

The endpoint requires an explicit ID list (no "find all stale" shortcut):

```bash
gb-call GET '/api/v2/stale-features?ids=flag-a,flag-b,flag-c'
```

**Step C-3: Interpret the results.**

Each flag gets a `staleReason`:

| `staleReason` | Meaning | Action |
| --- | --- | --- |
| `rules-one-sided` | All rules route 100% of traffic to a single value — looks like a shipped feature | Safe to clean up — inline the winning value |
| `no-rules` | Flag has no rules at all | Safe to remove if `defaultValue` is already inlined |
| `toggled-off` | Disabled in all environments | Safe to remove if no longer needed |
| `abandoned-draft` | Has a draft open with no recent activity | Check the draft; discard or continue |
| `never-stale` | Explicitly excluded from stale detection | Skip — permanent intentional flag (kill switch, ops toggle) |
| `recently-updated` | Updated within the last two weeks | Not stale yet — revisit later |
| `active-draft` | Has an active draft revision in progress | Someone is working on it — leave alone |
| `has-dependents` | Other flags list this flag as a prerequisite | Cannot remove safely without updating dependents — use flag-graph first |
| `active-experiment` | Linked to a running experiment | Stop the experiment first via experiment-stop |
| `has-rules` | Has active rules that aren't one-sided | Still in use |

**Step C-4: Present the report.**

Group by recommendation:
1. **Cleanup candidates** (`launched`, `unused`, `abandoned`) — with suggested replacement values
2. **Excluded** (`never-stale`) — list separately, don't include in cleanup recommendations
3. **Still active** — skip

Surface the `defaultValue` and winning rule values for candidates — the user needs these to inline before removing.

Do not delete anything. Hand off to flag-cleanup for actual removal.

## Guardrails

- **`/stale-features` requires explicit IDs.** No "find all stale" endpoint exists. Fetch IDs from `/feature-keys` first if the user doesn't provide them.
- **`/feature-keys` is unpaginated; `/features` is paginated (100/page).** Use `/feature-keys` for full ID inventory; `/features` for detail queries.
- **`neverStale: true` flags are excluded from cleanup recommendations.** They appear as `staleReason: "never-stale"` — surface them separately but never suggest removing them.
- **Don't infer staleness yourself.** Use `/stale-features` for the canonical determination; it encodes GrowthBook's own rules and surfaces replacement values you can't compute locally.
- **Client-side filters on large orgs can be slow.** Rate limit is 60 rpm. If paginating through hundreds of flags, surface progress updates.
- **v2 rules are flat.** Under v2, the `rules` array is top-level on the flag object with `allEnvironments`/`environments` scope per rule — not nested under each environment as in v1.
- **Read-only.** Never POST, PUT, PATCH, or DELETE from this skill. Route to flag-cleanup for removals.

## Endpoints used

- `GET /api/v2/feature-keys` — full ID list, no pagination cap
- `GET /api/v2/features` — paginated list with full configuration (`limit`, `offset`, `projectId`, `tag` filters)
- `GET /api/v2/features/:id` — full configuration for one flag
- `GET /api/v2/stale-features?ids=a,b,c` — staleness audit (requires explicit `ids`)
- `GET /api/v1/projects` — resolve project name to ID for project-scoped searches

## Handoffs

- `flag-graph` — to trace dependencies for a specific flag (what does it depend on, what depends on it)
- `flag-cleanup` — to archive or delete cleanup candidates found in Path C
- `flag-targeting`, `flag-rules` — to make changes after identifying which flag needs updating
- `flag-revisions` — to check for open drafts on flags found in the search


---

## flag-cleanup

---
name: flag-cleanup
description: Archive or delete a stale GrowthBook feature flag, walking the user through inlining the flag's effective value at call sites in the codebase before removal. Use when the user says "delete this flag", "remove this stale flag", "clean up flag X", "archive this flag", "we don't need this flag anymore", or "get rid of this flag and its experiment-ref rule". For finding stale flags first, use flag-search. For editing rules instead of removing the flag, use flag-targeting. For stopping an experiment that uses the flag, use experiment-stop.
allowed-tools: Bash(${CLAUDE_PLUGIN_ROOT}/scripts/gb-call *)
---

# flag-cleanup

Archive or delete a stale feature flag. Two paths: **archive** (reversible, soft-disable) or **delete** (permanent; always goes through archive first as a safety gate). The skill coordinates code-cleanup with the agent's general Read/Edit tools, surfacing call sites from GrowthBook's Code References API (when configured) or falling back to Grep against the user's current directory.

All API calls go through the bundled helper: `${CLAUDE_PLUGIN_ROOT}/scripts/gb-call`. It needs `GB_API_KEY` — set in your shell, or written to `~/.config/growthbook/.env` by `/growthbook:gb-setup`. If unset or invalid, gb-call's error message points back at `/growthbook:gb-setup`.

## Required inputs

Collect from the user before starting. Prompt for what's missing.

- **Flag ID** — kebab-case key. If the user gives a description, route to `flag-search` first to resolve.
- **Action** — `archive` (reversible) or `delete` (permanent; includes archive). Inferred from wording: "archive" / "disable" → archive; "delete" / "remove" / "clean up" / "get rid of" → delete. Confirm before mutating.

## Workflow

Track progress with this checklist. Do not skip or reorder; each step gates the next.

```
- [ ] 1. Fetch flag, verify safety preconditions (incl. bulk experiment check)
- [ ] 2. Compute defaultValue + detect behavior-change divergences
- [ ] 3. Find call sites (Code References API → Grep fallback w/ cwd check)
- [ ] 4. Walk the user through inlining, batched by file
- [ ] 5. Archive the flag (revision-and-publish; branch to 5a on 403, 5b on 409)
- [ ] 6. Verify-or-rollback gate (delete path only)
- [ ] 7. Delete the flag (delete path only)
- [ ] 8. Report, including reverse-prerequisite limitation warning
```

### 1. Fetch flag and verify safety preconditions

```bash
gb-call GET /api/v2/features/<flag-id>
```

Capture from the response: `archived` (boolean), `defaultValue`, `valueType`, `environmentSettings` (which envs are enabled), `rules` (the full array, including any `experiment-ref` rules), `holdout` (informational), `project`.

If 404, halt: "no flag with id `<flag-id>`." Suggest `flag-search` to list flags.

**Run the safety checks. Halt if any of these fire:**

- **`archived === true` and the user asked to archive** → already archived. Either re-confirm intent ("you said archive; this flag is already archived — did you mean delete?") or exit clean.

- **`archived === true` and the user asked to delete** → this is a continuation of a prior cleanup session (or the user archived in the UI). Ask:
  > This flag is already archived — looks like you're picking up where a previous cleanup left off. Did you already inline the flag's value at call sites in your codebase?
  > - **Yes** → I'll skip the behavior-change check and code-cleanup walkthrough; we'll go straight to the verify-or-rollback gate before delete.
  > - **No** → I'll still walk through steps 2–4 first, since the code references may still exist.

  If yes, jump to step 6 (the archive step 5 is a no-op since `archived: true → true` makes no change server-side; the handler short-circuits when `feature.archived` equals the requested value).

- **`neverStale: true` is set on the feature**. Confirm via the staleness endpoint:
  ```bash
  gb-call GET '/api/v2/stale-features?ids=<flag-id>'
  ```
  If the response includes `staleReason: "never-stale"`, halt:
  > This flag is marked `neverStale` — someone explicitly said it should never be cleaned up automatically (kill switch, ops toggle, license gate, etc.). To proceed, remove the `neverStale` flag in the GrowthBook UI at `<host>/features/<flag-id>` first and re-run me.

- **Active experiment-ref rule pointing at a `running` experiment**. One bulk call covers the common case:
  ```bash
  gb-call GET '/api/v1/experiments?trackingKey=<flag-id>&status=running'
  ```
  This works because `experiment-launch` sets `trackingKey === flag-id` by convention. If the response array is non-empty, halt:
  > This flag is wired into experiment `<exp-id>` (`<exp-name>`) which is still running. Stop that experiment first (`experiment-stop`), then re-run me.

  **Defensive cross-check.** If the bulk call returns empty but the flag has `experiment-ref` rules in its `rules` array, the experiment may have been manually wired with `experimentId ≠ trackingKey`. Iterate the experiment-ref rules and fetch each one as a fallback:
  ```bash
  gb-call GET /api/v1/experiments/<experiment-id-from-rule>
  ```
  If any returns `status: "running"`, halt with the same message.

  **Temporary rollout check.** While fetching linked experiments, also note any with `status: "stopped"` AND `enableTemporaryRollout: true` — these are not a blocker (the experiment is stopped), but step 2 must use the winner value as the inline replacement. Surface a reminder:
  > "Temporary rollout is active on experiment `<exp-id>` — all users currently see the winner value. Step 2 will use the winner value as the inline replacement, not `defaultValue`."

- **Draft experiment referencing the flag.** Lower-priority than running, but worth a warn-and-confirm. Reuse the bulk query with a different status filter:
  ```bash
  gb-call GET '/api/v1/experiments?trackingKey=<flag-id>&status=draft'
  ```
  If non-empty, warn:
  > Note: this flag is the `trackingKey` for draft experiment `<exp-id>`. Deleting the flag won't break anything immediately, but it will prevent that experiment from launching successfully. Proceed?

- **Unresolved draft revision on the flag.** A draft would be discarded by the archive:
  ```bash
  gb-call GET /api/v2/features/<flag-id>/revisions/latest
  ```
  If 404, no draft exists — continue. If a draft is returned, halt:
  > There's an active draft revision (`<version>`) on this flag. Cleaning up the flag would discard those pending changes. Either publish or discard the draft in the GrowthBook UI at `<host>/features/<flag-id>` first.

- **`/stale-features` doesn't flag this as stale and the user is asking to delete.** Warn but don't halt:
  > Heads-up: GrowthBook doesn't flag this as stale. It's still enabled in `<env>` with active rules. Proceed?

### 2. Compute the inline-replacement value and detect behavior changes

After archival, **every rule stops evaluating** — the flag returns `defaultValue` for all callers. The inline replacement value is usually `defaultValue`, but not always — see the temporary rollout case below.

**Check for an active temporary rollout first.** For each `experiment-ref` rule in the flag, fetch the linked experiment:

```bash
gb-call GET /api/v1/experiments/<experiment-id>
```

If `experiment.status === "stopped"` AND `experiment.enableTemporaryRollout === true`:
- The experiment's `releasedVariationId` tells you which variation is serving 100% of traffic.
- Find that variation's value in the experiment-ref rule's `variations` array.
- **That value — not `defaultValue` — is what all users currently see.**
- Use it as the inline replacement value. Warn the user clearly:

  > "Temporary rollout is active on this flag. All users currently see the winner value `<winner_value>`. After cleanup, all users will shift to `defaultValue: <default_value>`. If these differ, inlining `<winner_value>` is the correct replacement — not `<default_value>`."

For `valueType: "json"`, surface the raw JSON-encoded string and let the user adapt the inline shape.

**The real question this step exists to answer is: does cleanup change behavior in production?**

Walk the `rules` array and flag anything that previously diverged from `defaultValue`:

- A `force` rule serving a different value to a targeted segment.
- An active `rollout` rule (coverage > 0) — even one with no condition.
- An `experiment-ref` rule: fetch the linked experiment. If stopped with temporary rollout, the winner value is the divergence (handled above). If still assigning traffic normally (stopped experiment, no temporary rollout), users are split across variations — archiving shifts everyone to `defaultValue`, which is a change for treatment-group users.

Surface a table:

```
Behavior-change check for <flag-id>:
  defaultValue (post-cleanup):  "true"

  Pre-cleanup divergences (these stop applying after archive):
    production:  rule 1 (force, "beta testers" saved-group) served "false" → those users will now get "true"
    production:  rule 2 (rollout, 25% via id)              served "false" → 25% of traffic will shift to "true"
    staging:     no divergence — all traffic gets "true" today

Is this the intent?
```

If the table is empty (no divergences), the cleanup is purely cosmetic and the user can proceed without further confirmation. If any rule diverged, **halt and confirm** — this is real behavior change.

### 3. Find call sites

Try Code References first:

```bash
gb-call GET /api/v1/code-refs/<flag-id>
```

The response is `{codeRefs: [{ repo, branch, platform, refs: [{filePath, startingLineNumber, lines, flagKey}] }, ...]}`. One document per (repo, branch) — a feature may have multiple entries if Code References has been pushed from multiple branches.

- **Non-empty response** → present line-level references to the user, grouped by file, with branch info if multiple branches are represented. Cite that the data is from Code References (so the user knows it may be stale relative to local edits).
- **Empty response** → either Code References isn't configured, or the flag genuinely isn't referenced. Before falling back to Grep, **confirm the working directory**:
  > Code References returned no results. I'll search the current directory (`<pwd>`) for `<flag-id>`. Is that where the code that uses this flag lives, or should I look somewhere else?
  
  After confirmation, use the Grep tool to search for the flag ID (kebab-case key, exact match) in the project. Limit to relevant file types (source code, not vendored directories).

If both Code References and Grep return empty, surface:
> Couldn't find any code references to `<flag-id>`. If you're confident the flag isn't used anywhere, proceed to step 5. Otherwise, double-check the working directory or look at Code References at `<host>/features/<flag-id>` for stale data.

### 4. Walk the user through inlining

**Batch by file, not by line.** A single file may have multiple references to the same flag; asking the user to approve N separate Edits in the same file is friction. For each file with references:

- Use the Read tool to load the full file (once).
- Surface a per-file summary: file path + count of references + the lines that reference the flag.
- Propose a single Edit that replaces *all* references in the file with `defaultValue` (or the user-confirmed inline value).
- The Edit goes through Claude Code's normal permission flow — the user reviews and approves the whole-file change once.
- The user can also say "skip this file" (handle later) or "edit some but not all" (fall back to per-reference Edits within just that file).

Track which files have been handled and which were skipped. When the user signals "done with inlining" (or there are no call sites), proceed.

If the user wants to defer code-cleanup entirely ("just archive the flag now, I'll clean up code later"), allow it — the archive is reversible and the user can re-run this skill later to finish the code-cleanup before deletion.

### 5. Archive the flag

```bash
echo '{"archived": true}' \
  | gb-call POST /api/v2/features/<flag-id> -
```

**What happens server-side.** This isn't a metadata patch. Setting `archived` triggers `createAndPublishRevision` server-side — a new revision is created and published atomically. The same failure modes that affect any v2 publish apply:

- **2xx** → archived. Proceed to step 6 (delete path) or step 8 (archive-only path).
- **403 with "approval required" body** → step 5a.
- **409** → step 5b (merge conflict; another actor changed the flag between our GET and our archive POST).
- Other 4xx → halt with the body.

A revision-history entry will appear for the archive event — surface this in step 8.

### 5a. Approval required for archive

Same three-option branch as `flag-targeting`, **but with one critical asymmetry between archive and delete:**

> Your org requires approval before this flag can be archived. To proceed:
>
> **A. Standard review flow** (recommended) — I'll request review on the change; a teammate approves it in the GrowthBook UI at `<host>/features/<flag-id>`; you re-run me to resume.
>
> **B. Org-wide bypass** — admin enables "REST API always bypasses approval requirements" in Settings → General → Approvals. This single setting authorizes *both* archive and the final delete step.
>
> **C. Per-token bypass** — use a PAT with `bypassApprovalChecks` permission. **This authorizes archive but NOT delete.** The per-token permission is intentionally a review-workflow bypass only, not a destructive-action override. If your end goal is archive-only, this works. If you want to delete, you'll still need the org-wide setting from option B (or an admin to do the delete in the UI). Surface this asymmetry to the user *before* they pick C — don't let them discover it at step 7.

For path A, request review on the draft and halt:

```bash
echo '{"comment":"Auto-requested by flag-cleanup"}' \
  | gb-call POST /api/v2/features/<flag-id>/revisions/<version>/request-review -
```

Do **not** attempt `submit-review` — the API rejects self-approval.

### 5b. Merge conflict on archive

A 409 on the archive POST means the draft's base revision is stale — a teammate (or another agent invocation) published changes to the same flag between our step 1 (GET) and our step 5 (POST). **Do not auto-rebase.** Halt with:

> Your archive of `<flag-id>` couldn't be applied — the flag has changed since I last looked at it. To resolve:
>
> - Open `<host>/features/<flag-id>` in the GrowthBook UI.
> - Reconcile the change (either rebase our pending archive on top, or discard and re-run me to start fresh against the new live state).
>
> Re-run me after the conflict is resolved.

Surface the conflict body verbatim. The `POST /api/v2/features/<id>/revisions/<version>/rebase` endpoint exists for opt-in resolution; v1 stays conservative for the same reasons `flag-targeting` does — merge resolution needs human judgment per conflicting field.

### 6. Verify-or-rollback gate (delete path only)

After archive succeeds, halt and confirm with the user. **Frame the irreversibility of delete in the prompt itself**, not just in a guardrail the user may not have read:

> The flag is archived. **At this point the action is fully reversible** — unarchive in the UI (or reply "rollback") and everything goes back. Once we delete, the flag and all its revisions are gone permanently; there's no undo.
>
> Before I delete:
>
> - Check that nothing in your codebase broke. Run your tests; deploy to staging; verify the app behaves correctly with `defaultValue` instead of the old rules; whatever your normal post-flag-removal check is.
> - When you're confident, reply "proceed" and I'll delete.
> - Reply "rollback" and I'll unarchive.

This is the load-bearing gate of the skill. Permanent deletion is a one-way door and the user should sit with the archived-but-not-deleted state for at least one verification cycle. Don't collapse the two steps even if the user pushes for it.

**If the user picks "rollback":** undo the archive by setting `archived: false` via the same endpoint:

```bash
echo '{"archived": false}' \
  | gb-call POST /api/v2/features/<flag-id> -
```

This goes through the same revision-and-publish flow as the archive — same approval-required and merge-conflict failure modes apply. Verify it completes cleanly, surface the outcome, and exit.

### 7. Delete the flag (delete path only)

```bash
gb-call DELETE /api/v2/features/<flag-id>
```

- **2xx with `{deletedId}`** → proceed to report.
- **403** → almost certainly the `restApiBypassesReviews` setting is off. The flag is archived, just not deletable via the API. Surface:
  > Your org requires the "REST API always bypasses approval requirements" setting to be enabled before flags can be deleted via the API. The flag is archived; you can either:
  >
  > - Ask an admin to enable the setting (Settings → General → Approvals), then re-run me to finish the delete.
  > - Delete manually in the GrowthBook UI at `<host>/features/<flag-id>` (the archived flag is still listed there).
  >
  > Per-token `bypassApprovalChecks` does **not** authorize this — it's intentionally a review-workflow bypass only, not a destructive-action override.
- Other 4xx → halt with the body.

**Server-side cleanup.** Deletion removes the feature record, all its revisions, all revision logs, and unlinks any experiments that had this flag in their `linkedFeatures`. The experiments themselves are not deleted — they continue to exist with stale tracking keys. Surface this in step 8 so the user knows the experiments are still there.

### 8. Report

Print a summary:

- Flag ID and final state (`archived` or `deleted`).
- For archive: revision-history entry was created (user's audit log will show it).
- For delete: linked experiments were unlinked (but not deleted); their tracking keys now point at a non-existent flag.
- Number of call sites found, files edited, and any that were skipped.
- Inline replacement value used (`defaultValue` for the flag), surfaced for transparency.
- UI link: `<host>/features/<flag-id>` — only useful for archived flags (deleted flags 404). Derive `<host>` from `GB_API_URL` by swapping `api.` → `app.`.
- **Limitation warning:** "Heads-up: I can't detect whether other flags use this one as a prerequisite. If you're not sure, check the GrowthBook UI's 'Used by' panel before deleting — or after archive but before delete, since archive is reversible."
- **Holdout warning** (if `feature.holdout` was present): "This flag was associated with holdout `<holdout-id>`. The holdout's `linkedExperiments` may still reference experiments that pointed at this flag; their tracking keys are now stale. Audit the holdout in the GrowthBook UI if your experiment-analysis depends on it being clean."
- Suggested follow-up: re-run Code References (CLI/Action) so the dashboard reflects the post-cleanup codebase state.

## Guardrails

- **Archive-before-delete is the canonical flow on live flags.** The back-end rejects DELETE on non-archived features unless `restApiBypassesReviews` is set org-wide. Even if the setting is on, prefer archive→verify→delete for the safety pause.
- **Archive triggers a revision-and-publish.** Setting `archived: true` via `POST /v2/features/<id>` creates and publishes a revision server-side. The same failure modes that affect any v2 publish apply — approval-required (5a) and merge-conflict (5b).
- **`bypassApprovalChecks` is asymmetric across archive and delete.**
  - Archive: per-token `bypassApprovalChecks` works (`updateFeatureV2.ts` checks both org-wide and per-token).
  - Delete: per-token `bypassApprovalChecks` does NOT work (`deleteFeature.ts` explicit comment: "review-workflow bypass, not destructive-action override").
  - Only org-wide `restApiBypassesReviews` authorizes both. Don't conflate them when surfacing approval options to the user.
- **`neverStale: true` flags are deliberately permanent.** Halt if the user asks to clean one up; they need to explicitly remove that flag in the UI first.
- **Active running experiments block cleanup.** A flag with an `experiment-ref` rule pointing at a `running` experiment cannot be cleaned up — stopping the experiment is a separate decision routed to `experiment-stop`.
- **Unresolved drafts block cleanup.** Surface the draft and ask the user to discard or publish first.
- **Permanent deletion is a one-way door.** The skill stops between archive and delete to let the user verify nothing broke. Don't collapse the two steps even if the user pushes for it. Frame the irreversibility in the user-facing prompt, not just in this guardrail.
- **Code-cleanup is per-file approval, batched.** Group call sites by file and propose one Edit per file. Don't batch across files; don't bypass the agent's normal Edit-tool permission flow.
- **Code References can be stale.** The data reflects the last CLI/GitHub Action run, not the live working tree. If the user reports edits that aren't in Code References yet, trust the working tree (or re-run the CLI).
- **`/code-refs` empty doesn't mean "not used in code."** It could mean Code References isn't set up, or the user's working directory isn't the right codebase. Always confirm the working directory before assuming the flag is unreferenced.
- **One bulk experiment lookup beats N per-rule lookups.** Use `listExperiments?trackingKey=<flag-id>&status=running` for the primary check; fall back to per-rule fetches only when the bulk call returns empty but `experiment-ref` rules exist (manual-wiring edge case).
- **After archival, every rule stops evaluating — `defaultValue` is what callers get.** Step 2's job isn't to compute per-user behavior; it's to detect whether cleanup changes production behavior by listing rules that diverged from `defaultValue`.
- **Reverse prerequisite-detection is out of scope.** The API doesn't expose a reverse-lookup for "what depends on this flag." Surface the limitation in the report; don't silently miss the case.
- **Holdout linkages aren't explicitly cleaned up on delete.** The feature delete handler doesn't update holdout records. If a flag with a holdout association is deleted, the holdout's `linkedExperiments` may have stale references. Warn the user in the report when `feature.holdout` was present.
- **Deletion unlinks experiments but doesn't delete them.** Experiments that referenced this flag continue to exist with stale `trackingKey` values. Mention this in the report for the delete path.
- **Don't push updated Code References after delete.** The CLI/Action does this naturally on the next codebase scan. Pre-clearing refs could mask a still-broken state where the code hasn't actually been updated.

## Endpoints used

- `GET /api/v2/features/<id>` — fetch flag state (rules, defaultValue, archived, environmentSettings, holdout, project)
- `GET /api/v2/stale-features?ids=<id>` — confirm staleness + check `neverStale` reason
- `GET /api/v1/experiments?trackingKey=<flag-id>&status=running` (and `&status=draft`) — bulk lookup for experiments wired to this flag
- `GET /api/v1/experiments/<id>` — defensive cross-check fallback for the manual-wiring edge case
- `GET /api/v2/features/<id>/revisions/latest` — detect unresolved drafts (404 means none)
- `GET /api/v1/code-refs/<id>` — line-level call sites if Code References is configured; returns `{codeRefs: []}` (not 404) when empty
- `POST /api/v2/features/<id>` — archive (body: `{archived: true}`) or unarchive (`{archived: false}`); triggers revision-and-publish
- `DELETE /api/v2/features/<id>` — permanent delete; requires `restApiBypassesReviews` for live flags (rejected without it)
- `POST /api/v2/features/<id>/revisions/<version>/request-review` — used only in the 5a approval branch

## Handoffs

- `flag-search` — for finding and auditing stale flags before cleanup (Path C in flag-search is the natural caller).
- `flag-graph` — to check what depends on a flag before archiving or deleting it.
- `flag-targeting` — if the user really wants to change the flag's behavior rather than remove it.
- `flag-revisions` — to check for open drafts that must be resolved before archiving.
- `flag-publish` — handles the approval-required (5a) and merge-conflict (5b) branches on archive.
- `experiment-stop` — must precede cleanup of a flag wired to a running experiment.
- Manual UI step (no skill): unarchiving an archived-but-not-yet-deleted flag — done at `<host>/features/<flag-id>`. The skill's rollback step handles the in-session case; outside the session, the user falls back to the UI.
