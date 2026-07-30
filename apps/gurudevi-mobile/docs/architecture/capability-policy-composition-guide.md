---
title: "Gurudevi Capability Policy Composition Guide"
status: "active"
created: 2026-07-26
updated: 2026-07-26
author: "Codex"
tags: [capabilities, cedar, entitlements, growthbook, policy, guide]
---

# Capability Policy Composition Guide

This guide answers where a new criterion belongs when a capability depends on
capacity, citizenship, school type, platform, pricing, or rollout state.

## 1. Start with the question, not the field

| Question | Authority | Example |
| --- | --- | --- |
| What product capability exists? | Capability catalog | `grades.publish` |
| May this active relationship perform it? | Cedar | Principal may publish grades for this school. |
| Does the person have the commercial access? | Entitlement policy | PRO personal plan or school grant. |
| Is the capability available on this client? | Capability/domain registry | Mobile supported, web supported. |
| Is it currently released to this cohort? | GrowthBook | Beta rollout for selected schools. |
| Is the account at the required registration level? | Citizenship gate | First Class required. |
| Should the UI look locked, upgraded, or available? | Presentation resolver | Show “Available through school” or “Upgrade to Pro”. |

Do not place a condition in a registry merely because the registry can see the
condition. Put it where its meaning is authoritative.

## 2. Capacity and role best practice

Capacity is relationship-scoped. A user may have several capacities, but Cedar
evaluates the active bond/perspective for the requested entity.

Correct:

```text
Capability: grades.publish
Cedar: principal or authorized teacher capacity may perform publish
Active bond: school A
```

Incorrect:

```text
Registry entry:
teacher + principal + PRO + FIRST_CLASS + web + beta
```

If teachers and principals can both use a capability, Cedar expresses both
capacities in policy. The catalog declares the capability once. If they receive
different UI affordances, the same capability can expose different presentation
states without creating separate security capabilities.

## 3. Criteria ownership matrix

### Put in the capability/domain registry

- stable capability ID and owner;
- parent domain/surface;
- Cedar action and subject reference;
- supported platforms;
- minimum citizenship requirement when it is a product-entry boundary;
- lifecycle metadata;
- GrowthBook key;
- entitlement requirement reference;
- analytics key.

### Put in Cedar

- capacity/role authority;
- active bond and entity relationship;
- school/classroom/community ownership;
- whether a principal, teacher, parent, or student may perform an action;
- resource-level conditions and delegation.

### Put in entitlement policy

- personal FREE/PRO plan;
- institutional grant;
- add-ons/modules;
- effective scope (`individual`, `active_bond`, `active_entity`, `add_on`);
- expiry, suspension, and revocation.

### Put in GrowthBook

- beta/experiment cohort;
- rollout percentage;
- school-type or capacity targeting used only for product rollout;
- release sequencing and kill-switch behavior.

The same input may be present in more than one system as a derived context
value, but only one system may make the authoritative decision.

## 4. School type and similar criteria

Ask what school type means for the feature:

- If it changes contractual access, entitlement policy owns it.
- If it changes structural authority, Cedar owns it.
- If it only selects a beta cohort or experiment, GrowthBook owns it.
- If it only changes presentation or copy, the UI presentation resolver owns
  it.

For example, “secondary schools receive the beta timetable redesign” belongs
in GrowthBook. “Only an authorized school principal may edit the timetable”
belongs in Cedar. “The institutional contract includes timetable management”
belongs in entitlement policy.

## 5. Entitlement composition

Use one entitlement clause as an AND expression internally:

```ts
{
  scope: 'active_bond',
  tierAtLeast: 'INSTITUTIONAL',
  modulesAllOf: ['school_workspace'],
  modulesAnyOf: ['attendance', 'assessment'],
}
```

Use alternatives when different access paths are valid:

```ts
{
  anyOf: [
    { scope: 'individual', tierAtLeast: 'PRO' },
    { scope: 'active_bond', modulesAllOf: ['school_workspace'] },
  ],
}
```

Each alternative is AND internally; alternatives are OR. This is easier to
audit than arbitrary nested Boolean policy and directly models “personal PRO or
institutional grant.” If future requirements need deeper nesting, add a
validated expression AST with a complexity/depth limit rather than allowing
unbounded ad hoc predicates.

## 6. Evaluation model

```text
capability exists in catalog
  -> platform supported
  -> citizenship sufficient
  -> Cedar permits active capacity/entity action
  -> entitlement expression satisfied
  -> GrowthBook rollout active
  -> operation allowed
```

Cedar denial must remain authoritative for protected actions. Entitlement does
not grant authority. GrowthBook does not grant authority or entitlement.

Offline operation uses the last valid local Cedar and entitlement snapshots;
GrowthBook uses its lifecycle-aware cached rollout policy. No analytics event
may influence the result.

## 7. UI presentation states

Permission evaluation should return structured reasons, not only `true/false`:

```text
available
locked_by_cedar
requires_personal_upgrade
available_through_active_bond
not_in_rollout
unsupported_platform
not_initialized
```

The UI may use these states to show a locked button, a PRO label, a school
access label, or a disabled beta surface. It must not turn a presentation state
into an authorization decision.

## 8. Review checklist

Before adding a criterion, ask:

1. Is this security/relationship authority, commercial access, rollout, product
   eligibility, platform support, or presentation?
2. Which single system is authoritative for that meaning?
3. Is the condition active-bond scoped or account scoped?
4. Does it need historical/expiry behavior?
5. Can the capability be reused by another surface?
6. Is the UI state different from the permission result?
7. Can the rule be tested without enumerating role × tier × platform × cohort?

