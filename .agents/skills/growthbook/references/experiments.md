## experiment-design

---
name: experiment-design
description: Help the user design a well-formed GrowthBook experiment before it's launched. Use when the user asks to "design an A/B test", "set up an experiment", "test X vs Y", "configure an experiment", or "what should we measure". Produces a complete spec — hypothesis, variations, primary metric, guardrails, sample size — ready to hand off. Does not create the experiment in GrowthBook. For launching, use experiment-launch. For ideas grounded in past results, use experiment-brainstorm first.
allowed-tools: Bash(${CLAUDE_PLUGIN_ROOT}/scripts/gb-call *)
---

# experiment-design

Help the user produce an experiment spec that's actually launchable. Walk them through hypothesis, variations, metrics, and sample-size sanity. This skill does **not** write to GrowthBook — it ends with a ready-to-launch spec that `experiment-launch` consumes.

All API calls go through the bundled helper: `${CLAUDE_PLUGIN_ROOT}/scripts/gb-call`. It needs `GB_API_KEY` — set in your shell, or written to `~/.config/growthbook/.env` by `/growthbook:gb-setup`. If unset or invalid, gb-call's error message points back at `/growthbook:gb-setup`.

## Workflow

1. **Frame the hypothesis.** Falsifiable, if/then/because format:

   > If we change X, then Y will improve, because Z.

   Push for specificity if the hypothesis is vague. "We think users will like it" doesn't say which metric — engagement could mean five different things. "If we move the CTA above the fold, then click-through will increase, because users decide whether to engage before they scroll" gives the prediction something concrete to land against.

2. **Define variations.** Default to two: control (current state) and treatment (the change). Three or more variations are valid but cost statistical power; ask the user whether they really need a third. Number variations from 0 (control) to N.

3. **Pick goal metrics (ideally one, two max).** List available templates and available metrics:

   ```bash
   gb-call GET /api/v1/api/v1/experiment-templates
   gb-call GET /api/v1/metrics
   gb-call GET /api/v1/fact-metrics
   ```

   Help the user choose a template if one exists and applies, otherwise help the user choose metrics based on what the hypothesis predicts will move. Note the metric type (proportion, mean, ratio, quantile) — affects sample-size math. Push back at three or more goal metrics and demote the rest to secondary or guardrail: the GrowthBook decision framework treats goal metrics as plural by design, but each additional goal dilutes power and complicates the ship/kill decision.

4. **Pick guardrails (1–3).** Metrics that _shouldn't_ regress. Common examples: signup rate, page error rate, latency. Push back if the user skips guardrails; often it's good for experiments to have at least 1 or 2 guardrails. Guardrails are excluded from multiple-comparison correction by design, so don't over-stack them.

5. **Estimate sample size.** Need three inputs from the user:

   - Baseline rate (or mean) of the primary metric
   - Minimum detectable effect (MDE) the user cares about, in relative terms ("a 2% lift in conversion").
   - Daily traffic on the affected surface.

   Use a back-of-envelope estimate to gut-check, then point the user at GrowthBook's in-app Power Calculator for the real number. A common rule-of-thumb GrowthBook documents is **≥ 200 conversions per variation** for proportion metrics; the formula `n ≈ 16 × p × (1 - p) / (p × MDE)^2` per variation lands in roughly the same place for 80% power. Don't quote three significant figures from either — they're estimates. Round up and surface the inputs.

   Compute the expected experiment duration: `2 × n / daily_traffic`. Flag the duration on both ends:

   - **> 4 weeks** — likely underpowered for practical use; consider a larger MDE, a more sensitive metric, or higher-traffic surface.
   - **< 1 week** — risks day-of-week and weekend effects skewing the result. Recommend at least one full weekly cycle.

6. **Resolve project + datasource.** If the user mentions a specific project, get its ID:

   ```bash
   gb-call GET /api/v1/projects
   ```

   List datasources for context (the launch step will pick one, but worth showing the user what's available):

   ```bash
   gb-call GET /api/v1/data-sources
   ```

7. **Produce the spec.** Output a structured block the user can review and feed into `experiment-launch`:

   ```
   ## Experiment spec — <short name>

   **Hypothesis:** If <change>, then <outcome>, because <mechanism>.

   **Variations:**
   - 0: Control — <description>
   - 1: Treatment — <description>

   **Primary metric:** <name> (<type>) — baseline <value>
   **Guardrails:** <metric a>, <metric b>
   **MDE:** <X%>
   **Estimated sample size:** <N> per variation
   **Estimated duration:** <D> days at <T> visitors/day on the affected surface
   **Project:** <project id>
   **Tracking key suggestion:** <kebab-case-name>
   ```

   Ask the user to confirm before handing off to `experiment-launch`.

## Guardrails

- **Ideally one goal metric, two max.** GrowthBook's decision framework treats goal metrics as plural by design and the power calculator supports up to five, but each additional goal dilutes power and complicates the ship/kill decision. Push back at three or more; demote the rest to secondary.
- **At least one guardrail.** Push back if the user skips guardrails. Multiple-comparison correction does **not** apply to guardrails (intentionally — a guardrail signal is meant to block shipping), so don't over-stack them either; 1–3 is the sweet spot.
- **Falsifiable hypothesis, if/then/because format.** Push the user to make the prediction concrete enough to interpret results against. "Users will engage more" doesn't say which metric.
- **Sample-size math is approximate.** Use it as a gut check; route the user to the in-app Power Calculator for the real number. Round up and surface the inputs you used so the user can check.
- **Watch out for activation-metric bias.** Activation metrics downstream of variation differences silently bias results without tripping SRM. If the user picks one, name the risk explicitly.
- **Suggest an A/A test for first-time experimenters.** If the org has no stopped experiments (check via `flag-discovery` or `experiment-brainstorm`), GrowthBook recommends an A/A test first to validate the implementation before running a real one.
- **Day-of-week effects matter.** Push back on experiment durations under one full week. Weekend traffic and behavior differ from weekday traffic.
- **Don't launch from this skill.** Final spec → user confirms → hand off to `experiment-launch`. Resist scope creep.
- **Tracking-key naming is permanent.** Suggest kebab-case derived from the experiment name. The launch step will use this as `trackingKey`; it lands in event data and can't be cleanly changed later.

## Endpoints used

- `GET /api/v1/metrics` and `/api/v1/fact-metrics` — list candidate primary + guardrail metrics
- `GET /api/v1/metrics/<id>` — fetch baseline value for sample-size estimation
- `GET /api/v1/projects` — resolve project name to ID
- `GET /api/v1/data-sources` — list available datasources (used by launch)

## Handoffs

- `experiment-launch` — consumes the spec and creates the draft experiment in GrowthBook.
- Manual metric creation — if the primary metric doesn't exist yet, the user needs to create it in the GrowthBook UI at `<host>/metrics` (or `<host>/fact-tables` for fact metrics) before launching. No skill for that yet; derive `<host>` from `GB_API_URL` by swapping `api.` → `app.`.
- `experiment-brainstorm` — if the user came in without a specific hypothesis, route back here to ground a new idea in past results.


---

## experiment-brainstorm

---
name: experiment-brainstorm
description: Propose new experiment ideas grounded in the team's past stopped experiments via the GrowthBook REST API. Use when the user asks "what should we test next", "give me experiment ideas", "brainstorm A/B tests", "what's worth testing", or "ideas for experiments". Proposes only — does not create experiments. For designing a specific test, use experiment-design. For reading results of one, use experiment-analyze.
allowed-tools: Bash(${CLAUDE_PLUGIN_ROOT}/scripts/gb-call *)
---

# experiment-brainstorm

Propose new experiment ideas grounded in the team's past stopped experiments. Read history first; propose based on what actually moved metrics, where guardrails failed, and which tags or projects under-explored.

All API calls go through the bundled helper: `${CLAUDE_PLUGIN_ROOT}/scripts/gb-call`. It needs `GB_API_KEY` — set in your shell, or written to `~/.config/growthbook/.env` by `/growthbook:gb-setup`. If unset or invalid, gb-call's error message points back at `/growthbook:gb-setup`.

## Workflow

1. **Pull the experiment list, most recent first.**

   ```bash
   gb-call GET '/api/v1/experiments?limit=50&status=stopped'
   ```

   Returns up to 50 experiments per page (the API cap).

2. **Fetch results for each stopped experiment.** Loop over the stopped IDs:

   ```bash
   gb-call GET /api/v1/experiments/<id>/results
   ```

   Pace the calls — the API is rate-limited at 60 requests per minute. Cap the pull at ~20 experiments unless the user explicitly wants more; that's plenty for pattern-finding and stays well inside the budget.

3. **Read the patterns.** From the result payloads, identify three things before proposing anything:

   - **What's working** — themes shared by experiments where the test variation beat the control (which projects, which surfaces, which kind of change).
   - **What's stalling** — themes shared by losers and inconclusive tests.
   - **What's under-explored** — projects, tags, or surfaces with few experiments compared to the rest.

4. **Compute light aggregate context.** Mentally tally — no need to surface a full dashboard:

   - Approximate win rate (won / total settled).
   - Top 3 winners by absolute lift on the primary metric.
   - Top 3 losers by absolute lift.
   - Any experiments flagged for SRM (sample ratio mismatch).
   - Project / tag distribution.

5. **Propose 5–7 ideas.** Each proposal contains:

   - **Hypothesis** in one sentence: "If we change X, then Y will improve, because Z."
   - **Why this is grounded** — one sentence linking it to a specific past experiment (winner to extend, loser to retry differently, gap to fill). Cite the experiment name or ID.
   - **Primary metric** — pick one. State the type (proportion, mean, ratio, quantile) and why.
   - **Expected effect size** — order of magnitude only ("comparable to the +3.2% lift on the checkout flow test"), not a precise number.
   - **Risk to watch** — one guardrail metric or potential regression.

6. **Present with structure.** Lead with the patterns you saw (1–2 lines each), then the proposals. End by asking the user which to refine — do not start designing or creating experiments inside this skill. Hand off to `experiment-design` for the one(s) the user picks.

## Guardrails

- **Stopped experiments only.** Filter drafts and running experiments out of your synthesis. If the user asks about the live pipeline, that's a different question — point them at `flag-discovery` or `experiment-design` instead.
- **Ground every proposal.** Cite the specific past experiment(s) you're building on. No proposals based on generic best practices.
- **Don't repeat losers without saying why.** If a proposal mirrors a recent loser, say so explicitly and explain what's different this time.
- **Win rate definition:** `won / (won + lost + inconclusive)`. Don't invent another formula.
- **Watch for SRM and guardrail issues in the history.** If many experiments show SRM failures, mention it and propose at least one idea aimed at improving experiment hygiene rather than another product test.
- **Propose, do not create.** Never POST to `/api/v1/experiments`. The user's next step is `experiment-design` for the proposal they want to pursue.
- **Avoid metric-fishing proposals.** Each idea has one (occasionally two) goal metric. Don't propose tests with five metrics hoping one moves — that's the "too many goal metrics" footgun. GrowthBook's decision framework supports up to two goal metrics, but more dilutes power and confuses the ship/kill call.
- **Rate limit awareness.** 50 experiments + 20 result fetches = ~21 calls; well under the 60 rpm cap. If the user wants more depth, ask before fanning out to >40 calls.

## Endpoints used

- `GET /api/v1/experiments?limit=50&status=stopped` — list experiments (returns metadata including status). Cap is 50 per page.
- `GET /api/v1/experiments/{id}/results` — full results for one experiment. One call per stopped experiment in scope.

## Output template

```
## Patterns from your last N stopped experiments

- Working: <theme>
- Stalling: <theme>
- Under-explored: <theme>

## Proposed experiments

### 1. <short title>
- Hypothesis: …
- Grounded in: <past experiment + verdict>
- Primary metric: <name> (<type>)
- Expected effect: <order of magnitude>
- Risk: <guardrail>

…

Pick one or two and I'll hand off to `experiment-design` to scope it.
```


---

## experiment-launch

---
name: experiment-launch
description: Launch a GrowthBook A/B test end-to-end via the REST API — create the experiment, prep the feature flag, wire the experiment-ref rule, and start the experiment. Use when the user says "launch this experiment", "create the experiment", "wire up the A/B test", "kick off the test", "set up X as an experiment in GrowthBook", "start the experiment for flag Y", or "I already have a flag and want to run an experiment on it". Works for both experiment-first (creates the flag) and flag-first (detects the existing flag via the reuse path and wires the experiment to it). For designing the spec first, use experiment-design. For stopping a running experiment, use experiment-stop. For interpreting results, use experiment-analyze.
allowed-tools: Bash(${CLAUDE_PLUGIN_ROOT}/scripts/gb-call *)
---

# experiment-launch

Launch a GrowthBook A/B test end-to-end: create the experiment in draft, prep or reuse the feature flag, add the experiment-ref rule on a fresh draft revision, then call `/start` to publish the rule and flip the experiment to running. Handles the approval-required and pre-launch-checklist failure paths.

All API calls go through the bundled helper: `${CLAUDE_PLUGIN_ROOT}/scripts/gb-call`. It needs `GB_API_KEY` — set in your shell, or written to `~/.config/growthbook/.env` by `/growthbook:gb-setup`. If it's missing or invalid, gb-call's error message points back at `/growthbook:gb-setup`.

## Required inputs

Collect from the user (or earlier skill output) before starting. Prompt for what's missing.

- **Feature flag name** — kebab-case key, regex `[a-zA-Z0-9_-]`
- **Experiment name** — human-readable
- **Variations** — array of `{name, value}`, length ≥ 2. The first entry is the **control**. Values are serialized as strings on the rule (booleans → `"false"`/`"true"`, numbers → `"42"`, JSON → JSON-encoded string).
- **Project ID** (optional) — pins the experiment and flag to a specific project

## Optional inputs

- **Hypothesis** — falsifiable; if/then/because format
- **Template description** — English description matched against `templateMetadata.name`/`description` returned by `/v1/experiment-templates`. If omitted and templates exist, ask the user to pick one or skip.

If no template is used, also collect (or resolve interactively in step 2):

- **Datasource** — id or English name
- **Hash attribute** — the unit of randomization (`id`, `device_id`, etc.). Must equal the `identifierType` of the assignment query selected on the datasource.
- **Assignment query** — id or English name; lives inside the chosen datasource's `assignmentQueries`
- **Goal metric ID** — exactly one (the primary KPI you'd ship or kill on)
- **Secondary metric IDs** — supporting metrics
- **Guardrail metric IDs** — defensive metrics that should not regress

## Workflow

Track progress with this checklist. Do not skip or reorder.

```
- [ ] 1. Pick a template (or skip)
- [ ] 2. Resolve hash attribute → datasource → assignment query → metrics (no-template path only)
- [ ] 3. Create the experiment in draft
- [ ] 4. Create or reuse the feature flag
- [ ] 5. Add the experiment-ref rule on a fresh draft revision
- [ ] 6. Prompt user to QA the experiment and feature flag config
- [ ] 7. POST /start; branch to 7a (approval) or 7b (checklist) on 400
- [ ] 8. Report links and state
```

### 1. Pick a template (or skip)

```bash
gb-call GET /api/v1/experiment-templates
```

- **Zero templates** → continue without one; go to step 2.
- **One or more** → list as `name — description` plus a final "Skip" option. If a template description was provided, pre-select the best match by `templateMetadata.name`/`description` and confirm. Never invent a template.

If chosen, capture: `id` (becomes `templateId`), `datasource`, `exposureQueryId`, `hashAttribute`, `goalMetrics`, `statsEngine`, `targeting`. Templates inject all of these; skip step 2 entirely.

If the template's `type` is `"multi-armed-bandit"`, halt and confirm with the user. Bandits behave very differently from standard A/B tests (dynamic traffic allocation, per-arm probabilities instead of winner/loser, different analysis), and this skill's launch and analysis assumptions are written for `type: "standard"`. Recommend they configure bandits in the UI for now.

### 2. Resolve hash attribute → datasource → assignment query → metrics

No-template path only. Order matters — pick hash attribute first so you don't trap yourself on a datasource that can't randomize on it.

**2a. Pick the hash attribute.** Filter to attributes flagged as hashAttribute:

```bash
gb-call GET /api/v1/attributes
```

Surface attributes where `hashAttribute === true` and `archived !== true`. Ask the user to pick. If the filtered list is empty, halt — tell the user to mark at least one attribute as a hash attribute under **Settings → Attributes** in GrowthBook.

**2b. Pick the datasource.**

```bash
gb-call GET /api/v1/data-sources
```

Resolve English name or ID against `dataSources[].name` / `id`. Capture `DATASOURCE_ID` and keep the full object — 2c reads its `assignmentQueries`.

**2c. Pick the assignment query.** Filter `dataSources[].assignmentQueries` to entries where `identifierType === HASH_ATTRIBUTE`:

- **Exactly one match** → auto-select it; print one line stating the choice.
- **Zero matches** → halt and offer three fixes: pick a different datasource (rerun 2b), change the hash attribute (rerun 2a), or add an assignment query for `<HASH_ATTRIBUTE>` in GrowthBook.
- **Two or more** → list each as `name (identifierType=<value>) — <description>` and let the user pick.

If `assignmentQueries` is empty entirely, halt and tell the user to configure one in GrowthBook before re-running.

**2d. Pick metrics, filtered by datasource.** The API rejects metrics from a different datasource than the experiment's:

```bash
gb-call GET '/api/v1/fact-metrics?datasourceId=<DATASOURCE_ID>&limit=100'
gb-call GET '/api/v1/metrics?datasourceId=<DATASOURCE_ID>&limit=100'
```

Help the user pick:

- **Goal metric(s)** (`GOAL_METRIC_IDS`). Ideally one, two max — push back at three or more and demote the rest to secondary or guardrail.
- **Secondary metrics** (`SECONDARY_METRIC_IDS`) — supporting context.
- **Guardrail metrics** (`GUARDRAIL_METRIC_IDS`) — defensive. Push back if they name none; every experiment needs at least one. Guardrails are excluded from multiple-comparison correction by design.

### 3. Create the experiment in draft

Set `trackingKey` to the feature flag name so the SDK ties exposures to the flag. Each variation needs a stable string `key` (`"0"`, `"1"`, ...) and `name`. Variation values live on the flag rule (step 5), not on the experiment payload.

**Template path** — do NOT also send `datasourceId` / `assignmentQueryId`; the template provides them and the API rejects the combination.

```json
{
  "templateId": "<from step 1>",
  "trackingKey": "<flag-name>",
  "name": "<experiment name>",
  "hypothesis": "<hypothesis>",
  "variations": [
    { "key": "0", "name": "Control" },
    { "key": "1", "name": "Treatment" }
  ],
  "project": "<project id, omit if org-wide>"
}
```

**No-template path** — send everything from step 2 explicitly:

```json
{
  "datasourceId": "<DATASOURCE_ID>",
  "assignmentQueryId": "<ASSIGNMENT_QUERY_ID>",
  "hashAttribute": "<HASH_ATTRIBUTE>",
  "trackingKey": "<flag-name>",
  "name": "<experiment name>",
  "hypothesis": "<hypothesis>",
  "variations": [
    {"key": "0", "name": "Control"},
    {"key": "1", "name": "Treatment"}
  ],
  "metrics": ["<GOAL_METRIC_ID>"],
  "secondaryMetrics": [<SECONDARY_METRIC_IDS as JSON array>],
  "guardrailMetrics": [<GUARDRAIL_METRIC_IDS as JSON array>],
  "project": "<project id, omit if org-wide>"
}
```

Notes:

- `metrics` is the goal-metric array; with the one-goal rule it should always be length 1.
- Omit `secondaryMetrics` / `guardrailMetrics` entirely if the user picked none. Don't send empty arrays.

Then POST:

```bash
echo '<payload-json>' | gb-call POST /api/v1/experiments -
```

Capture from the response:

- `experiment.id` — used in steps 5 and 6.
- `experiment.variations[].variationId` — the **string ID** for each variation (e.g. `var_abc123`). You need these in step 5; they are required on the `experiment-ref` rule.

### 4. Create or reuse the feature flag

**Try create first** unless the user said the flag already exists. The flag must default to the **control** value (variation 0's value), serialized as a string. Default all environments to off as well.

```json
{
  "id": "<flag-name>",
  "valueType": "<boolean|string|number|json>",
  "defaultValue": "<control value as string>",
  "description": "Drives experiment: <experiment name> (<exp_id>)",
  "project": "<project id, omit if org-wide>"
}
```

```bash
echo '<payload-json>' | gb-call POST /api/v2/features -
```

- **Success** → go to step 5.
- **409 Conflict** (flag exists) → fall through to the reuse compatibility checks below.

**Reuse path — fetch and validate:**

```bash
gb-call GET /api/v2/features/<flag-name>
```

Run these compatibility checks against the response. Each row says what to do on failure:

| Check                                                                                              | Action on failure                                                                                                                                        |
| -------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `archived === false`                                                                               | **Halt.** Tell the user to un-archive the flag in the UI before re-running.                                                                              |
| `valueType` matches the experiment's `<boolean\|string\|number\|json>`                             | **Halt.** Surface both values; do not silently change types.                                                                                             |
| `project` matches the experiment's project (when set)                                              | **Halt.** Reusing a flag from another project misroutes the experiment.                                                                                  |
| `defaultValue` equals the control value (string-compared)                                          | **Warn**, do not halt. The experiment rule supplies the variation values; the existing default applies only when the rule doesn't match. Ask "continue?" |
| No existing rule with `type === "experiment-ref"` AND `experimentId === <exp_id>` already attached | If one exists → this experiment is already wired up. Skip step 5 and jump to step 6.                                                                     |
| No conflicting `experiment-ref` rule for another _running_ experiment in the same environments     | **Warn**, do not halt. Ask "this flag is currently driving experiment `<other_id>`; add another rule alongside it?"                                      |

When all checks pass, capture the flag's identity and proceed to step 5. Do **not** mutate the existing flag here — all mutations go through the draft revision in step 5.

### 5. Add the experiment-ref rule on a fresh draft revision

Use the literal version `new` to create a draft and add the rule in one call. The path segment `new` is a magic value that creates a draft branched off the live revision atomically. If the feature has multiple environments, prompt the user for which environments to go live in, and ensure this rule turns on the feature flag for those environments in addition to adding the rule to those environments.

```json
{
  "rule": {
    "type": "experiment-ref",
    "experimentId": "<exp_id from step 3>",
    "enabled": true,
    "allEnvironments": true,
    "variations": [
      {
        "value": "<variation 0 value as string>",
        "variationId": "<var_id from step 3, position 0>"
      },
      {
        "value": "<variation 1 value as string>",
        "variationId": "<var_id from step 3, position 1>"
      }
    ],
    "description": "Experiment: <experiment name>"
  }
}
```

```bash
echo '<payload-json>' | gb-call POST /api/v2/features/<flag-name>/revisions/new/rules -
```

`variations[]` must have one entry per experiment variation, in the same order as step 3. Each entry needs **both** `value` (serialized as a string) and `variationId` (the string ID captured in step 3) — `variationId` is required by the v2 features validator and omitting it returns a `400`. Capture the returned `version` for the draft revision.

Do **not** publish the revision here. Step 7's `/start` call auto-publishes the draft when it flips the experiment to running.

### 6. Pause for QA before /start

The draft revision and experiment are reversible up to this point; step 7's `/start` publishes the rule and flips the experiment to running.

If the user seems to want you to also embed the feature flag in the codebase, now is a good time to do that.

Stop and surface the UI links so the user can QA the flag default, the rule's variation values, and the experiment's targeting and metrics in the GrowthBook UI:

- Experiment: `<host>/experiment/<exp_id>`
- Feature: `<host>/features/<flag-name>` (draft revision `<version>`)

Derive `<host>` from `GB_API_URL` by swapping `api.` → `app.`, as in step 8. Wait for the user's explicit go-ahead before proceeding to step 7.

### 7. Start the experiment

```bash
gb-call POST /api/v1/experiments/<exp_id>/start '{}'
```

The `/start` endpoint does two things server-side:

1. Publishes the draft feature revision from step 5 (`publishPendingFeatureDraftsForExperiment`).
2. Enforces the org's pre-launch checklist.

Either can fail with a `400`. Branch:

- Body starts with **"This revision requires approval before publishing"** → step 7a.
- Body lists incomplete checklist items → step 7b.
- `2xx` → step 8.

#### 7a. Approval required

The experiment and flag exist; only the rule revision is stuck in draft. Halt and offer the user three concrete paths:

> Your org requires approval before this feature flag rule can go live, and `/start` will not flip the experiment to running until the rule is published. Revision `<version>` on `<flag-name>` is in draft state. Pick one:
>
> **A. Standard review flow** (recommended) — I'll request a review now. A teammate (not you, since you created the draft) approves it in the GrowthBook UI at `<host>/features/<flag-name>`, then you re-run me and I'll resume from `/start`.
>
> **B. Org-wide bypass** — an admin enables "REST API always bypasses approval requirements" in **Settings → General → Approvals**. After that, re-run me.
>
> **C. Per-token bypass** — use a Personal Access Token whose role grants `bypassApprovalChecks` on this project (Admin or custom role). Update `GB_API_KEY`, then re-run me.

If the user picks **A**, request review on the draft and stop:

```bash
echo '{"comment":"Auto-requested by experiment-launch for <exp_id>"}' \
  | gb-call POST /api/v2/features/<flag-name>/revisions/<version>/request-review -
```

Do **not** attempt `submit-review` yourself — the API rejects self-approval on a draft you created. Stop and tell the user to re-run after approval.

If the user picks **B** or **C**, stop with a one-line note. The existing draft will pick up the new permission and publish on retry.

Do **not** silently retry `/start`, ignore the error, or discard and recreate the draft to work around the policy.

#### 7b. Checklist incomplete

The REST API does not expose a separate `start-checklist` endpoint — the failure body from `/start` is the canonical source. Parse it and surface the incomplete items verbatim:

> The pre-launch checklist isn't complete. The `/start` call returned:
>
> `<full error body>`
>
> Fix the listed items in the GrowthBook UI at `<host>/experiment/<exp_id>`, then re-run me — I'll jump straight back to `/start`.

Only retry `/start` with `{"skipChecklist": true}` in the body if the user **explicitly** asks to bypass. Never default to bypassing; the checklist is intentional friction.

### 8. Report

Print a summary:

- Experiment name and `id`
- Feature flag ID and published revision version
- Template used (name + id) if any
- Unit of randomization (`hashAttribute`)
- Variations and their values
- Pre-launch checklist status (should be `allRequiredComplete=true`)
- Experiment status (should be `running` after a clean `/start`)
- Direct UI links (derive the host from `GB_API_URL` by swapping `api.` → `app.`):
  - Experiment: `<host>/experiment/<exp_id>`
  - Feature: `<host>/features/<flag-name>`

## Guardrails

- **Ideally one goal metric, two max.** GrowthBook's decision framework treats goal metrics as plural by design and the power calculator supports up to five, but each additional goal dilutes power and complicates the ship/kill decision. Push back at three or more; demote the rest to secondary.
- **At least one guardrail.** Push back if the user skips guardrails.
- **`hashAttribute` and `assignmentQuery.identifierType` must match.** Mismatch is a real and recoverable error; surface the fix paths in step 2c.
- **Metrics must live on the experiment's datasource.** Filter `/v1/metrics` and `/v1/fact-metrics` by `datasourceId` in step 2d.
- **Do NOT mix `templateId` with `datasourceId`/`assignmentQueryId`.** The template path supplies those; the no-template path supplies them explicitly. Mixing yields a `400`.
- **Flag default = control value.** Variation values for flag-linked experiments are strings on the rule — `"false"`/`"true"` for booleans, `"42"` for numbers, JSON-encoded text for `json`.
- **Reuse with care.** Always run the step 4 compatibility checks before reusing an existing flag. Silently attaching to a flag with the wrong `valueType`, wrong `project`, or a conflicting rule will break the experiment or step on a teammate's in-flight test.
- **No manual revision publish.** The step 5 draft is published by `/start` in step 7. Do not call publish endpoints separately - **Approval failures: do not self-approve.** The API blocks approval on drafts you created. Walk the user through 6a instead.
- **Checklist failures: do not bypass by default.** Only set `skipChecklist: true` after the user explicitly opts in.

## Endpoints used

- `GET /api/v1/experiment-templates` — list templates
- `GET /api/v1/attributes` — filter to `hashAttribute=true`
- `GET /api/v1/data-sources` — pick datasource and assignment query
- `GET /api/v1/fact-metrics?datasourceId=…`, `GET /api/v1/metrics?datasourceId=…` — pick goal / secondary / guardrail
- `POST /api/v1/experiments` — create the draft experiment
- `POST /api/v2/features` — create the linked feature flag (when not reusing)
- `GET /api/v2/features/<id>` — fetch the flag for the reuse compatibility checks
- `POST /api/v2/features/<id>/revisions/new/rules` — atomic draft + add experiment-ref rule
- `POST /api/v2/features/<id>/revisions/<version>/request-review` — used only in the 6a "request review" path
- `POST /api/v1/experiments/<id>/start` — publish the draft revision and start the experiment. Body accepts `{"skipChecklist": true}` to bypass the pre-launch checklist when the user explicitly opts in. Failure responses carry the canonical reason in the body — there's no separate `start-checklist` GET to query.

## Handoffs

- `experiment-design` — if no spec exists, route back here first.
- `flag-search` — to find an existing flag ID when you only have a name or description.
- `experiment-analyze` — after the experiment is running and traffic accumulates.
- `experiment-stop` — when results are settled.
- Manual metric creation — if a metric you need doesn't exist yet, the user must create it in the GrowthBook UI at `<host>/metrics` (or `<host>/fact-tables` for fact metrics) before re-running this skill. No skill for that yet.


---

## experiment-analyze

---
name: experiment-analyze
description: Fetch results for a GrowthBook experiment, refresh the snapshot only when the cached data is over 24 hours old, then interpret. Use when the user asks "what are the results of X", "analyze this experiment", "is X winning", "did the test work", "show me the results", or "dig into the dimensions". Reads only — does not stop or modify the experiment. For stopping after you've seen results, use experiment-stop.
allowed-tools: Bash(${CLAUDE_PLUGIN_ROOT}/scripts/gb-call *) Bash(sleep *)
---

# experiment-analyze

Fetch results, refresh the snapshot only when the cached data is over 24 hours old or the user wants a different phase/dimension cut, then interpret. This skill is the heaviest in the catalog because of the conditional polling loop and the statistical interpretation — slow down and do each step deliberately.

All API calls go through the bundled helper: `${CLAUDE_PLUGIN_ROOT}/scripts/gb-call`. It needs `GB_API_KEY` — set in your shell, or written to `~/.config/growthbook/.env` by `/growthbook:gb-setup`. If unset or invalid, gb-call's error message points back at `/growthbook:gb-setup`. The skill also uses `sleep` between poll calls.

## Workflow

1. **Fetch results + experiment metadata in one call.** `/results` returns `{ experiment, result }` — the same payload that powers the GrowthBook UI's results view, so there's no need for a separate metadata call.

   ```bash
   gb-call GET /api/v1/experiments/<experiment-id>/results
   # or, when the user asks for a specific phase / dimension cut:
   gb-call GET '/api/v1/experiments/<experiment-id>/results?phase=1&dimension=exp:country'
   ```

   The `phase` and `dimension` query params filter to the latest snapshot taken with those settings; omit both for the default "how is it doing" view.

   From `experiment`, capture:

   - `status` — `running` or `stopped` both make sense for analysis. If `draft`, there are no results to interpret; tell the user.
   - `type` — if `"multi-armed-bandit"`, halt and tell the user this skill targets standard A/B tests. Bandits report differently (per-arm probabilities, dynamic traffic allocation) and shouldn't be read with the standard winner/loser framing.
   - `settings.statsEngine` — `"bayesian"` (default) or `"frequentist"`. Drives the metric-interpretation step below.
   - `regressionAdjustmentEnabled` (CUPED) and `sequentialTestingEnabled` — affect what to report.

   From `result`, capture:

   - `id` — the snapshot ID; used in step 3 if a refresh is needed.
   - `dateUpdated` — ISO timestamp of when this snapshot was created. Drives the staleness check in step 2.
   - The per-variation metric data itself (lift estimates, intervals, sample sizes) — what step 4 interprets.

   If the response errors with `"No results found for that experiment"`, the experiment has been started but no snapshot exists yet (the auto-refresh hasn't run, or you've filtered to a phase/dimension that's never been snapshotted). Skip step 2 and jump straight to step 3.

2. **Decide whether to refresh.** Branch on `result.dateUpdated`:

   - **Under 24 hours old, and the existing snapshot matches the user's requested phase/dimension** → skip step 3, jump to step 4.
   - **Over 24 hours old, or the user explicitly asked for a fresh snapshot** → step 3.

   The server auto-refreshes snapshots every 6 hours by default (`EXPERIMENT_REFRESH_FREQUENCY`), so anything under 24 hours has typically been refreshed at least once recently. The 24-hour bar is deliberately conservative — don't burn snapshot-compute budget on data that hasn't moved.

3. **Trigger a fresh snapshot, poll, then re-fetch results.**

   **3a. POST a snapshot.** Optional body fields shape what gets computed; pass the same `phase` / `dimension` the user asked for in step 1:

   - `phase` (integer, 0-indexed): pick a specific phase if the experiment has multiple — e.g., re-analyze the pre-ramp phase after the experiment has ramped up. Defaults to the latest phase.
   - `dimension` (string): break the results down. Built-in: `"pre:date"`, `"pre:activation"`. For a configured Unit Dimension, use its ID (e.g. `"dim_abc123"`). For an Experiment Dimension, prefix with `"exp:"` (e.g. `"exp:country"`).

   ```bash
   echo '{}' | gb-call POST /api/v1/experiments/<experiment-id>/snapshot -
   # or with phase + dimension:
   echo '{"phase": 1, "dimension": "exp:country"}' \
     | gb-call POST /api/v1/experiments/<experiment-id>/snapshot -
   ```

   The response is `{ snapshot: { id, experiment, status } }`. Capture `snapshot.id`.

   **3b. Poll for completion.** Snapshot creation is asynchronous:

   ```bash
   for i in $(seq 1 60); do
     gb-call GET /api/v1/snapshots/<snapshot-id>
     # Parse snapshot.status. Stop when it is "success" or "error".
     sleep 5
   done
   ```

   Cap the loop at 60 iterations (5 minutes). If it hasn't finished by then, stop polling and tell the user the snapshot is still in progress — they can retry the skill in a few minutes. Don't loop forever.

   **3c. Re-fetch results** with the same phase/dimension args used in 3a, then re-capture the fields listed in step 1:

   ```bash
   gb-call GET '/api/v1/experiments/<experiment-id>/results'
   # or, if 3a passed phase/dimension:
   gb-call GET '/api/v1/experiments/<experiment-id>/results?phase=1&dimension=exp:country'
   ```

4. **Run the data-quality checks first, then interpret.** GrowthBook surfaces six health checks; any failing one changes how the result should be read. Surface failures prominently — don't bury them.

   **Data-quality checks (in order):**

   - **SRM (Sample Ratio Mismatch).** Observed traffic split vs. configured split. Failure invalidates downstream results — say so prominently and stop interpreting until the user understands the bias risk. Common causes: bot traffic, ad-blockers blocking client-side tracking, mid-experiment targeting changes, activation-metric bias.
   - **Multiple Exposures.** Users assigned to more than one variation. A small rate (<1%) is usually fine; a high rate suggests sticky bucketing isn't configured or the hash attribute isn't stable.
   - **Minimum Data Thresholds.** Per-metric minimums (configured per metric). If a metric is below its threshold, results for that metric are not trustworthy yet.
   - **Variation ID Mismatch.** Variation IDs reported by exposures don't match the experiment's configured variations. Indicates a tracking/configuration bug.
   - **Suspicious Uplift.** Per-metric lift exceeds configured suspicious thresholds. Doesn't mean the result is wrong, but real lifts that large are rare — usually a tracking or metric-definition issue.
   - **Guardrails.** Listed under data-quality in the docs because a failing guardrail is a hard stop on shipping. For each: any regression? Even a non-significant regression on a guardrail is worth flagging. Note: multiple-comparison correction is **not** applied to guardrails by design.

   **Power check.** Is the experiment at or near the expected sample size? If well under (e.g., <50% of planned), warn that conclusions are speculative — especially on the frequentist engine, where peeking inflates false-positive rates more aggressively. Bayesian results are more robust to peeking but still benefit from the planned sample size.

   **Primary metric — branch on stats engine:**

   - **Bayesian (`settings.statsEngine === "bayesian"`, the default):** Report **Chance to Win** (the probability the treatment beats the control given the data and prior) and the relative-uplift distribution (point estimate + Credible Interval). GrowthBook treats >95% Chance to Win as a strong positive signal; <5% as a strong negative; the rest is inconclusive. Don't fabricate a p-value.
   - **Frequentist (`settings.statsEngine === "frequentist"`):** Report the lift point estimate, 95% confidence interval, and whether the CI crosses zero. If `regressionAdjustmentEnabled` is true (CUPED), point-estimates may differ from raw means; CIs are typically narrower. If `sequentialTestingEnabled` is true, CIs are intentionally wider to make peeking safe — call this out so the user doesn't compare them to non-sequential CIs.

   **Secondary metrics.** Surface but caveat — these are exploratory; multiple-comparison risk applies on the frequentist engine (GrowthBook only applies the correction there; on Bayesian, the implicit correction comes from the prior). Don't promote a secondary to "we won on X" if the primary didn't move.

   **Dimensions (if user asks).** If the snapshot was taken with a `dimension`, the results endpoint returns the per-dimension cuts. Surface notable splits but don't fish — dimensional analysis multiplies the comparison count.

5. **Present the result.** Use this shape (skip rows that don't apply):

   ```
   ## Experiment: <name> (<id>)
   - Status: <running|stopped>
   - Type: <standard|multi-armed-bandit>
   - Stats engine: <bayesian|frequentist>
   - Adjustments: <CUPED on/off, sequential testing on/off>
   - Phase: <phase name or index>
   - Dimension: <none | dimension id used>
   - Sample size: <total users> across N variations
   - Snapshot timestamp: <when this snapshot ran>

   ### Data-quality checks
   - SRM: <pass / fail with detail>
   - Multiple Exposures: <pass / rate>
   - Minimum Data Thresholds: <met / not met, per metric>
   - Variation ID Mismatch: <pass / fail>
   - Suspicious Uplift: <none / per-metric flags>

   ### Primary metric: <name>
   - Variation 0 (Control): <baseline value>
   - Variation 1 (Treatment): <value>
   - **Bayesian:** Chance to Win <X%>, relative lift <±Y%>, 95% CrI [a, b]
   - **Frequentist:** lift <±Y%>, 95% CI [a, b]<note if CIs are sequential>
   - Verdict: <won / lost / inconclusive>

   ### Guardrails
   - <metric>: <safe / regressed by Y%>

   ### Secondary metrics
   - <metric>: <lift / no movement> <multiple-comparison caveat if frequentist>

   ### Recommendation
   <one paragraph: ship, kill, extend, or investigate>
   ```

6. **Link to the experiment, then suggest the next step.** Always surface the direct UI link so the user can review the live results, dimensional cuts, and historical snapshots beyond what `/results` returns:

   ```
   View in GrowthBook: <host>/experiment/<exp_id>
   ```

   Derive `<host>` from `GB_API_URL` by swapping `api.` → `app.` (matches `experiment-launch`'s convention; on the default cloud host this produces `https://app.growthbook.io`).

   Then suggest a next action based on `experiment.status` from step 1:

   - `running` and conclusive → suggest `experiment-stop` with the chosen variation.
   - `running` and inconclusive → suggest waiting or extending.
   - `stopped` → point at flag cleanup via `flag-targeting` to update or remove the `experiment-ref` rule on the linked flag.

## Guardrails

- **All six data-quality checks come before interpretation.** SRM, Multiple Exposures, Minimum Data Thresholds, Variation ID Mismatch, Suspicious Uplift, and Guardrails. A failure in any of them changes how (or whether) to interpret the result. Don't bury them under the primary-metric heading.
- **Branch interpretation on `settings.statsEngine`.** Bayesian (default) reports Chance to Win + Credible Intervals; frequentist reports lift + Confidence Intervals. Don't manufacture a p-value the API didn't return, and don't claim "95% CI" on a Bayesian result (it's a Credible Interval, not a Confidence Interval).
- **Multiple-comparison correction is frequentist-only and excludes guardrails.** When reporting secondaries, note the correction status. On Bayesian, the prior provides implicit shrinkage; no correction is applied.
- **CUPED and sequential testing change how to read CIs.** If `regressionAdjustmentEnabled` is true, point estimates may differ from raw means and CIs are typically narrower. If `sequentialTestingEnabled` is true, CIs are intentionally wider — say so, so the user doesn't compare them apples-to-oranges with non-sequential results.
- **Don't peek-and-decide.** Under-powered experiments mean interim numbers are noisy. Frequentist peeking inflates false-positive rates; Bayesian is more robust but still benefits from hitting the planned sample size.
- **Bandits are out of scope.** `type === "multi-armed-bandit"` reports per-arm probabilities and dynamically reallocates traffic. Halt and tell the user to read bandit results in the UI.
- **Activation-metric bias hides as "passing SRM."** If the experiment uses an activation metric that is downstream of variation differences (e.g., "completed signup" when variations affect signup completion), the overall split can look fine while the activated cohort is biased. The dashboard surfaces this; flag it when you spot the pattern in metadata.
- **Don't promote a secondary to a primary.** If the primary didn't move, the experiment didn't move — secondaries are exploratory.
- **Polling has a ceiling.** 60 iterations × 5s = 5 minutes. If the snapshot isn't done by then, stop and report. Don't run for hours.
- **Snapshot timestamp matters.** Always surface `result.dateUpdated` when reporting results — it's both how step 2 decides whether to refresh and how the user judges whether a slow-traffic experiment has moved. Stale snapshots are common; don't hide them.
- **24h is a deliberate ceiling, not the auto-refresh cadence.** The server auto-refreshes every 6h by default, so a snapshot under 24h has almost always been refreshed at least once. The skill's 24h bar gives the user a useful conservative window without paying snapshot compute on data that hasn't moved. Don't drop it to "any data older than a minute" — that's how you pin a busy org against the 60 rpm limit.
- **Rate limit awareness.** Happy path is a single `/results` call. Worst case (no snapshot or stale + 60-iteration poll + re-fetch) is ~63 calls spread over 5 minutes (~13/min), well under 60 rpm. If multiple users invoke this concurrently in the same org the limit can still bite — surface clearly if `gb-call` returns a 429.
- **Read-only.** This skill never stops or modifies the experiment. Hand off to `experiment-stop` when the user wants to act.

## Endpoints used

- `GET /api/v1/experiments/<id>/results` — primary entry point; returns `{ experiment, result }` so step 1 grabs metadata, status, and the snapshot timestamp (`result.dateUpdated`) in a single call. Accepts `phase` / `dimension` query params.
- `POST /api/v1/experiments/<id>/snapshot` — trigger a fresh snapshot when results are over 24h old or the user wants a phase/dimension cut the cached snapshot doesn't cover. Body accepts `phase` (integer) and `dimension` (string).
- `GET /api/v1/snapshots/<snapshot-id>` — poll for snapshot completion (5s interval, 60 iteration cap). Returns `{ snapshot: { id, experiment, status } }`.

## Handoffs

- `experiment-stop` — when the user is ready to act on a conclusive result.
- `flag-targeting` — after stopping with a winner, the linked flag (if any) needs its `experiment-ref` rule updated or removed.
- `experiment-brainstorm` — to ground ideas for the next test in results from past experiments.
- `experiment-statistics` (when shipped) — for deeper questions about CUPED, sequential testing, multiple comparisons, dimensional analysis.


---

## experiment-stop

---
name: experiment-stop
description: Stop a running GrowthBook experiment via the REST API, optionally declaring a winning variation and rolling it out to 100% of eligible traffic. Use when the user says "stop this experiment", "end the A/B test", "declare a winner for X", "ship the winning variation", "roll back the test", or "we're done with this experiment". For interpreting results before deciding, use experiment-analyze first.
allowed-tools: Bash(${CLAUDE_PLUGIN_ROOT}/scripts/gb-call *)
---

# experiment-stop

Stop a running experiment, optionally declaring a winning variation and ramping it to all eligible traffic via a temporary rollout. The endpoint is `POST /api/v1/experiments/<id>/stop` (a dedicated endpoint, not the generic update). All variation references are **variation ID strings** like `var_abc123`, not 0-based integer indexes.

All API calls go through the bundled helper: `${CLAUDE_PLUGIN_ROOT}/scripts/gb-call`. It needs `GB_API_KEY` — set in your shell, or written to `~/.config/growthbook/.env` by `/growthbook:gb-setup`. If unset or invalid, gb-call's error message points back at `/growthbook:gb-setup`.

## Workflow

1. **Fetch the current experiment.**

   ```bash
   gb-call GET /api/v1/experiments/<experiment-id>
   ```

   Check the `status` field. Only `running` experiments should be stopped via this skill. If `status === "draft"`, the experiment hasn't started — the user wants to delete it, not stop it (different operation). If `status === "stopped"`, it's already done.

   Also capture the `type` field. If `type === "multi-armed-bandit"`, halt and tell the user this skill targets standard A/B tests; bandits have their own lifecycle (stop is similar but interpretation and rollout differ — recommend they review in the UI before scripting).

2. **Show the user the variations table.** Surface the variations as the API records them — capture each one's `variationId` (the string ID, e.g. `var_treatment_a`) and `name`. The user picks **by the variation ID string**, not by index:

   ```
   The experiment has these variations:
     var_control      0: Control       — <description>  (lift: baseline, users: N)
     var_treatment_a  1: Treatment A   — <description>  (lift: +2.3%, users: N)
     var_treatment_b  2: Treatment B   — <description>  (lift: -0.8%, users: N)

   Which variation should ship? Reply with the variation ID (e.g. var_treatment_a),
   or say "no winner" to stop without declaring.
   ```

   If the user has not already run `experiment-analyze`, suggest doing that first so the decision is informed.

3. **Decide on temporary rollout.** If the user has a winner and wants to ship now, offer the temporary-rollout path:

   > "Want me to also enable a temporary rollout? That keeps this experiment in the SDK payload and forces 100% of eligible traffic to `<winnerVariationId>`. It's the cleanest 'ship the winner' option — the linked feature flag's rule stays in place but routes everyone to the winner. You can toggle it off later with `modify-temporary-rollout` or clean up the rule via `flag-targeting`."

   If yes, set `enableTemporaryRollout: true` and `releasedVariationId: <winner ID>` in the payload. If no, the experiment stops but you leave the flag alone — surface that the user will need to clean up the `experiment-ref` rule manually.

4. **Confirm intent.** Restate the action in plain English:

   > "Stopping experiment '<name>', declaring variation `var_treatment_a` (Treatment A) as the winner, and enabling temporary rollout to ship it to 100% of eligible traffic."

   Get explicit confirmation before posting. Stopping itself is reversible (you can restart), but declaring a winner and enabling a rollout produces downstream signals — don't do it on a hunch.

5. **Build the payload.** The body is **flat**; there is no nested `resultSummary`.

   Stop without a declared winner:

   ```json
   { "results": "inconclusive" }
   ```

   Stop with a declared winner, no rollout:

   ```json
   {
     "results": "won",
     "winnerVariationId": "<winner variation ID>",
     "analysis": "<one-paragraph markdown summary of the decision>"
   }
   ```

   Stop with a declared winner and ship via temporary rollout:

   ```json
   {
     "results": "won",
     "winnerVariationId": "<winner variation ID>",
     "releasedVariationId": "<winner variation ID>",
     "enableTemporaryRollout": true,
     "analysis": "<one-paragraph markdown summary of the decision>"
   }
   ```

   Field reference:

   - `results` — required. One of `"won"`, `"lost"`, `"inconclusive"`, `"dnf"` (did not finish).
   - `winnerVariationId` — string variation ID (e.g. `var_abc123`). Required when `results === "won"` and the experiment has multiple test variations.
   - `releasedVariationId` — string variation ID. Required when `enableTemporaryRollout: true`. Usually equals `winnerVariationId`.
   - `enableTemporaryRollout` — boolean. Keeps the stopped experiment in the SDK payload and forces traffic to the `releasedVariationId`.
   - `analysis` — markdown summary shown on the experiment results page.
   - `reason` — optional reason text stored on the latest phase metadata.
   - `dateEnded` — optional ISO datetime; defaults to now.

6. **Post the update.**

   ```bash
   echo '<payload-json>' | gb-call POST /api/v1/experiments/<experiment-id>/stop -
   ```

7. **State what happens next, and link to the experiment.** Tell the user:
   - The experiment is now stopped; no more traffic accumulates against the experiment.
   - If a winner was declared, the variation ID that "won."
   - **Direct UI link** so they can verify the stopped state, the recorded `analysis`, and the rollout status:
     ```
     <host>/experiment/<experiment-id>
     ```
     Derive `<host>` from `GB_API_URL` by swapping `api.` → `app.` (matches `experiment-launch`'s convention; on the default cloud host this produces `https://app.growthbook.io`).
   **What happens to the flag?** Surface the disposition clearly based on what was sent:

   **With temporary rollout (`enableTemporaryRollout: true`):** the winner is live — traffic is already routed to it via the existing experiment-ref rule. No further action required until the team decides to clean up the flag (which can happen days or weeks later). When ready:
   - **Convert to permanent rule:** remove the experiment-ref rule via `flag-rules`, add a permanent force rule for the winner via `flag-targeting`.
   - **Clean up entirely:** if the feature will be inlined in code, use `flag-cleanup` to walk through code cleanup and archive/delete the flag.
   - **Roll back:** turn off the temporary rollout first (`echo '{"enableTemporaryRollout": false}' | gb-call POST /api/v1/experiments/<experiment-id>/modify-temporary-rollout -`), then remove the experiment-ref rule via `flag-rules`.

   **Without temporary rollout:** the experiment-ref rule is still on the flag, routing traffic to a stopped experiment (users will get the control value). The flag needs attention:
   - **Option A — Ship the winner:** set `defaultValue` to the winner's value via `flag-default-value`, then remove the experiment-ref rule via `flag-rules`. Or use `flag-targeting` to add a permanent force rule serving the winner, then remove the experiment-ref rule.
   - **Option B — Roll back:** the flag's default value already serves the control — just remove the experiment-ref rule via `flag-rules` and the flag returns to its pre-experiment state.
   - **Option C — Full cleanup:** use `flag-cleanup` to inline the value in code and archive/delete the flag.

## Guardrails

- **`winnerVariationId` is a variation ID _string_ (e.g. `var_abc123`), not an integer index, not a name, not the variation's `key`.** Get this wrong and the request 400s or the wrong variation is recorded as the winner.
- **The endpoint is `POST /api/v1/experiments/<id>/stop`, not `POST /api/v1/experiments/<id>`.** The body shape is flat — there is no `resultSummary` wrapper. The generic update endpoint exists but takes different fields; use the dedicated stop endpoint here.
- **Never declare a winner the user didn't pick.** Even if the results look obvious, force the user to choose the variation ID. Surface results, but don't pre-fill. _Skill convention, not GrowthBook policy: the API accepts any variation ID as `winnerVariationId`; the safety is enforced here, not server-side._
- **Don't stop drafts.** A `draft` experiment isn't running — what the user wants there is `DELETE /api/v1/experiments/<id>` (separate skill, not covered here). Surface the confusion if they ask to stop a draft.
- **Don't stop already-stopped experiments.** The API may accept the call but it's effectively a no-op; tell the user it's already done. To change the results metadata on an already-stopped experiment, post again with the new `results` / `winnerVariationId` / `analysis`.
- **Bandits are out of scope.** `type === "multi-armed-bandit"` experiments need different handling — halt and tell the user.
- **`releasedVariationId` is required when `enableTemporaryRollout: true`.** The API rejects the combination otherwise. They're usually the same as `winnerVariationId` but don't have to be — e.g., a "lost" result that rolls everyone back to control would set `releasedVariationId: <control variation ID>` with `results: "lost"`.
- **Always remind about the linked flag.** Stopping the experiment does not remove the `experiment-ref` rule from the linked flag. Without a temporary rollout, the flag keeps routing to a stale experiment until the user cleans the rule up.
- **`analysis` should explain the decision in plain English (markdown).** Future readers (including future-self) will want context. Don't leave it blank when declaring a winner.
- **Run `experiment-analyze` first if the user hasn't.** Stopping based on a glance at the dashboard is a common mistake — interim numbers can flip, and the data-quality checks in `experiment-analyze` can flag results that look conclusive but aren't.

## Endpoints used

- `GET /api/v1/experiments/<id>` — fetch state, variations, and `type`
- `POST /api/v1/experiments/<id>/stop` — stop and optionally declare a winner + temporary rollout
- `POST /api/v1/experiments/<id>/modify-temporary-rollout` — toggle the temporary rollout off (or on) after stopping, without re-running this skill

## Handoffs

- `experiment-analyze` — run first if the user wants to interpret results before deciding.
- `flag-rules` — remove the experiment-ref rule after stopping (always needed eventually).
- `flag-targeting` — add a permanent force rule serving the winner value (replaces the experiment-ref rule).
- `flag-default-value` — set the flag's default to the winner value when shipping without a targeting rule.
- `flag-cleanup` — if the feature is fully shipped and the flag should be removed from code and archived.
- `experiment-design` and `experiment-launch` — for the next test if this one informed a follow-up.
