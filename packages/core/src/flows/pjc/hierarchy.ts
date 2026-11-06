import { z } from 'zod';

const ref = z.string().min(1);
const links = z.array(ref).optional();
const provenanceRecord = z.strictObject({
  id: ref,
  title: z.string().min(1),
  statement: z.string().min(1),
  origin: z.enum(['user', 'source', 'proposal', 'verified']),
  links,
});
const platformRecord = provenanceRecord.extend({
  platform: z.enum(['web', 'mobile', 'shared', 'tooling', 'other']),
});
const journeyRequirement = z.strictObject({
  id: ref,
  title: z.string().optional(),
  statement: z.string().min(1),
  classification: z.enum(['product', 'functional', 'quality', 'constraint']).optional(),
  origin: z.enum(['user', 'source', 'proposal', 'verified']),
  links,
});
const journeyBinding = z.strictObject({
  id: ref,
  title: z.string().optional(),
  category: z.enum([
    'web',
    'mobile',
    'api',
    'data',
    'authentication',
    'authorization',
    'tenancy',
    'privacy',
    'state',
    'failure',
    'offline',
    'feature_flag',
    'entitlement',
    'architecture',
    'test',
    'documentation',
    'tool',
    'roadmap',
  ]),
  reference: z.string().optional(),
  route: z.string().startsWith('/').optional(),
  status: z.enum(['unknown', 'planned', 'implemented', 'verified']),
  verifiedRevision: z.string().trim().min(1).optional(),
  note: z.string().min(1),
  links,
});
const journeyStep = z.strictObject({
  id: ref,
  title: z.string().min(1),
  interaction: z.string().min(1),
  terminal: z.boolean(),
  links,
});
const journeyTransition = z.strictObject({
  id: ref,
  title: z.string().optional(),
  from: ref,
  to: ref,
  action: z.string().min(1),
  feedback: z.string().min(1),
  links,
});
const journeyScenario = z.strictObject({
  id: ref,
  title: z.string().min(1),
  start: ref.optional(),
  preconditions: z.array(z.string().trim().min(1)).optional(),
  completion: z.enum(['outcome', 'checkpoint']).optional(),
  checkpointReason: z.string().trim().min(1).optional(),
  transitions: z.array(ref).min(1),
  expected: z.string().min(1),
  links,
});
const journeyEvidence = z.strictObject({
  id: ref,
  title: z.string().optional(),
  scenario: ref,
  revision: z.string().min(1),
  environment: z.string().min(1),
  tier: z.enum(['G0', 'G1', 'G2', 'G3', 'G4', 'G5', 'R1']),
  result: z.enum(['passed', 'failed', 'blocked', 'not_started', 'not_applicable']),
  substitutions: z.array(z.string()),
  limitations: z.string().min(1),
  reference: z.string().min(1),
  rationale: z.string().trim().min(1).optional(),
  acceptedBy: z.string().trim().min(1).optional(),
  alternateEvidence: z.array(ref).optional(),
  links,
});

/** The next catalog rejects older and mixed-format inputs. */
export const PjcHierarchySchema = z.strictObject({
  schemaVersion: z.literal(2),
  features: z.array(
    z.strictObject({
      id: ref,
      title: z.string().min(1),
      description: z.string().min(1),
      links,
      sharedIntents: z.array(ref).optional(),
      lifecycle: z.strictObject({
        maturity: z.enum(['proposed', 'development', 'available', 'retiring']),
        owner: z.string().min(1),
        priority: z.string().optional(),
        targetDate: z.iso.date().optional(),
      }),
      intents: z.array(
        z.strictObject({
          id: ref,
          title: z.string().min(1),
          actor: z.string().min(1),
          outcome: z.string().min(1),
          links,
          sharedJourneys: z.array(ref).optional(),
          journeys: z.array(
            z.strictObject({
              id: ref,
              title: z.string().min(1),
              situation: z.string().min(1),
              outcome: z.string().min(1),
              links,
              planning: z
                .strictObject({
                  maturity: z.enum(['proposed', 'development', 'available', 'retiring']),
                  implementation: z.enum(['unknown', 'planned', 'partial', 'implemented']),
                  verification: z.enum(['unknown', 'not_started', 'partial', 'verified']),
                  priority: z.string().optional(),
                  targetDate: z.iso.date().optional(),
                })
                .optional(),
              context: z.enum(['setup', 'daily', 'recovery', 'other']),
              preconditions: z.array(z.string()),
              entry: ref,
              development: z.strictObject({
                mode: z.enum(['greenfield', 'brownfield', 'mixed']),
                existingBehavior: z.array(z.string()),
                invariants: z.array(z.string()),
                openQuestions: z.array(z.string()),
                integrationPoints: z.array(z.string()),
              }),
              steps: z.array(journeyStep),
              transitions: z.array(journeyTransition),
              requirements: z.array(journeyRequirement),
              bindings: z.array(journeyBinding),
              impacts: z.array(provenanceRecord).optional(),
              observations: z.array(provenanceRecord).optional(),
              platformDifferences: z.array(platformRecord).optional(),
              scenarios: z.array(journeyScenario),
              evidence: z.array(journeyEvidence),
              sharedRequirements: z.array(ref).optional(),
              sharedBindings: z.array(ref).optional(),
            }),
          ),
        }),
      ),
    }),
  ),
});

export type PjcHierarchy = z.infer<typeof PjcHierarchySchema>;

export function validateHierarchy(input: unknown) {
  const parsed = PjcHierarchySchema.safeParse(input);
  if (!parsed.success)
    return {
      errors: parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`),
      catalog: undefined,
    };
  const errors: string[] = [];
  const ids = new Set<string>();
  function register(id: string, prefix: string) {
    if (!new RegExp(`^${prefix}:[a-z0-9]+(?:[._-][a-z0-9]+)*$`).test(id))
      errors.push(`Invalid ${prefix} ID: ${id}`);
    if (ids.has(id)) errors.push(`Duplicate ID: ${id}`);
    ids.add(id);
  }
  for (const feature of parsed.data.features) {
    register(feature.id, 'feature');
    for (const intent of feature.intents) {
      register(intent.id, 'intent');
      for (const journey of intent.journeys) {
        register(journey.id, 'journey');
        const steps = new Map(journey.steps.map((step) => [step.id, step]));
        const transitions = new Map(journey.transitions.map((edge) => [edge.id, edge]));
        for (const step of journey.steps) register(step.id, 'step');
        for (const edge of journey.transitions) {
          register(edge.id, 'transition');
          if (!steps.has(edge.from) || !steps.has(edge.to)) errors.push(`${edge.id}: unknown step`);
        }
        for (const requirement of journey.requirements) register(requirement.id, 'requirement');
        for (const binding of journey.bindings) register(binding.id, 'binding');
        for (const impact of journey.impacts ?? []) register(impact.id, 'impact');
        for (const observation of journey.observations ?? [])
          register(observation.id, 'observation');
        for (const platform of journey.platformDifferences ?? []) register(platform.id, 'platform');
        for (const scenario of journey.scenarios) {
          register(scenario.id, 'scenario');
          const path = scenario.transitions.map((id) => transitions.get(id));
          if (path.some((edge) => !edge)) errors.push(`${scenario.id}: unknown transition`);
          const start = scenario.start ?? journey.entry;
          if (!steps.has(start)) errors.push(`${scenario.id}: unknown start step`);
          if (start !== journey.entry && !scenario.preconditions?.length)
            errors.push(`${scenario.id}: partial path requires preconditions`);
          if (path[0] && path[0].from !== start)
            errors.push(`${scenario.id}: path does not start at declared step`);
          const last = path.at(-1);
          if (scenario.completion === 'checkpoint' && !scenario.checkpointReason)
            errors.push(`${scenario.id}: checkpoint requires a reason`);
          if (
            last &&
            steps.has(last.to) &&
            !steps.get(last.to)?.terminal &&
            scenario.completion !== 'checkpoint'
          )
            errors.push(`${scenario.id}: nonterminal path requires a checkpoint`);
          for (let i = 1; i < path.length; i++)
            if (path[i - 1] && path[i] && path[i - 1]?.to !== path[i]?.from)
              errors.push(`${scenario.id}: disconnected path`);
        }
        for (const evidence of journey.evidence) {
          register(evidence.id, 'evidence');
          if (!journey.scenarios.some((scenario) => scenario.id === evidence.scenario))
            errors.push(`${evidence.id}: unknown scenario`);
          if (
            evidence.result === 'not_applicable' &&
            (!evidence.rationale || !evidence.acceptedBy || !evidence.alternateEvidence?.length)
          )
            errors.push(
              `${evidence.id}: not-applicable evidence requires rationale, acceptance and alternate evidence`,
            );
          for (const alternate of evidence.alternateEvidence ?? [])
            if (alternate === evidence.id)
              errors.push(`${evidence.id}: alternate evidence cannot reference itself`);
            else if (!journey.evidence.some((item) => item.id === alternate))
              errors.push(`${evidence.id}: unknown alternate evidence ${alternate}`);
        }
        if (!steps.has(journey.entry)) errors.push(`${journey.id}: unknown entry`);
        const reached = new Set([journey.entry]);
        for (let i = 0; i < steps.size; i++)
          for (const edge of journey.transitions) if (reached.has(edge.from)) reached.add(edge.to);
        for (const step of journey.steps)
          if (!reached.has(step.id)) errors.push(`${step.id}: unreachable`);
        if (!journey.steps.some((step) => step.terminal && reached.has(step.id)))
          errors.push(`${journey.id}: no reachable terminal`);
      }
    }
  }
  const journeys = parsed.data.features.flatMap((feature) =>
    feature.intents.flatMap((intent) => intent.journeys),
  );
  const intentIds = new Set(
    parsed.data.features.flatMap((feature) => feature.intents.map((intent) => intent.id)),
  );
  const journeyIds = new Set(journeys.map((journey) => journey.id));
  const requirementIds = new Set(
    journeys.flatMap((journey) => journey.requirements.map((requirement) => requirement.id)),
  );
  const bindingIds = new Set(
    journeys.flatMap((journey) => journey.bindings.map((binding) => binding.id)),
  );
  const linked = parsed.data.features.flatMap((feature) => [
    feature,
    ...feature.intents.flatMap((intent) => [
      intent,
      ...intent.journeys.flatMap((journey) => [
        journey,
        ...journey.steps,
        ...journey.transitions,
        ...journey.requirements,
        ...journey.bindings,
        ...(journey.impacts ?? []),
        ...(journey.observations ?? []),
        ...(journey.platformDifferences ?? []),
        ...journey.scenarios,
        ...journey.evidence,
      ]),
    ]),
  ]);
  for (const record of linked)
    for (const target of record.links ?? [])
      if (!ids.has(target)) errors.push(`${record.id}: missing reference ${target}`);
  for (const feature of parsed.data.features) {
    for (const shared of feature.sharedIntents ?? [])
      if (!intentIds.has(shared)) errors.push(`${feature.id}: unknown shared intent ${shared}`);
    for (const intent of feature.intents) {
      for (const shared of intent.sharedJourneys ?? [])
        if (!journeyIds.has(shared)) errors.push(`${intent.id}: unknown shared journey ${shared}`);
      for (const journey of intent.journeys) {
        for (const shared of journey.sharedRequirements ?? [])
          if (!requirementIds.has(shared))
            errors.push(`${journey.id}: unknown shared requirement ${shared}`);
        for (const shared of journey.sharedBindings ?? [])
          if (!bindingIds.has(shared))
            errors.push(`${journey.id}: unknown shared binding ${shared}`);
      }
    }
  }
  return { errors: errors.sort(), catalog: parsed.data };
}
