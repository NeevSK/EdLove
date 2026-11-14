import type { PjcHierarchy } from './hierarchy';

/** Return the complete journey, its parent, and intents that share it. */
export function inspectHierarchyJourney(catalog: PjcHierarchy, id: string) {
  const intents = catalog.features.flatMap((feature) =>
    feature.intents.map((intent) => ({ feature, intent })),
  );
  const owner = intents.find(({ intent }) => intent.journeys.some((journey) => journey.id === id));
  const journey = owner?.intent.journeys.find((item) => item.id === id);
  if (!owner || !journey) return null;
  const allJourneys = intents.flatMap(({ intent }) => intent.journeys);
  const allRequirements = allJourneys.flatMap((item) => item.requirements);
  const allBindings = allJourneys.flatMap((item) => item.bindings);
  const localRecords = [
    journey,
    ...journey.steps,
    ...journey.transitions,
    ...journey.scenarios,
    ...journey.requirements,
    ...journey.bindings,
    ...(journey.impacts ?? []),
    ...(journey.observations ?? []),
    ...(journey.platformDifferences ?? []),
    ...journey.evidence,
  ];
  const localIds = new Set(localRecords.map((record) => record.id));
  const directLinks = new Set(localRecords.flatMap((record) => record.links ?? []));
  const sharedRequirements = allJourneys.flatMap((item) =>
    item.requirements.filter(
      (requirement) =>
        !journey.requirements.some((owned) => owned.id === requirement.id) &&
        (journey.sharedRequirements?.includes(requirement.id) ||
          directLinks.has(requirement.id) ||
          requirement.links?.some((ref) => localIds.has(ref))),
    ),
  );
  const requirementBindings = [...journey.requirements, ...sharedRequirements].flatMap(
    (requirement) => requirement.links ?? [],
  );
  const requirementIds = new Set(
    [...journey.requirements, ...sharedRequirements].map((requirement) => requirement.id),
  );
  const bindingRefs = new Set([
    ...(journey.sharedBindings ?? []),
    ...requirementBindings,
    ...directLinks,
  ]);
  return {
    feature: { id: owner.feature.id, title: owner.feature.title },
    intent: {
      id: owner.intent.id,
      title: owner.intent.title,
      actor: owner.intent.actor,
      outcome: owner.intent.outcome,
    },
    sharedWith: intents
      .filter(({ intent }) => intent.sharedJourneys?.includes(id))
      .map(({ intent }) => ({ id: intent.id, title: intent.title })),
    journey,
    scenarioPaths: journey.scenarios.map((scenario) => {
      const pathTransitions = journey.transitions.filter((transition) =>
        scenario.transitions.includes(transition.id),
      );
      const pathIds = new Set([scenario.id, ...pathTransitions.map((transition) => transition.id)]);
      const pathLinks = new Set([
        ...(scenario.links ?? []),
        ...pathTransitions.flatMap((transition) => transition.links ?? []),
      ]);
      const requirements = allRequirements.filter(
        (requirement) =>
          pathLinks.has(requirement.id) || requirement.links?.some((id) => pathIds.has(id)),
      );
      const scenarioRequirementIds = new Set(requirements.map((requirement) => requirement.id));
      const linkedBindings = new Set([
        ...pathLinks,
        ...requirements.flatMap((requirement) => requirement.links ?? []),
      ]);
      return {
        id: scenario.id,
        title: scenario.title,
        expected: scenario.expected,
        start: scenario.start ?? journey.entry,
        preconditions: scenario.preconditions ?? [],
        completion: scenario.completion ?? 'outcome',
        checkpointReason: scenario.checkpointReason,
        requirements,
        bindings: allBindings.filter(
          (binding) =>
            linkedBindings.has(binding.id) ||
            binding.links?.some((id) => pathIds.has(id) || scenarioRequirementIds.has(id)),
        ),
        evidence: journey.evidence.filter((item) => item.scenario === scenario.id),
        steps: scenario.transitions.map((transitionId) => {
          const transition = journey.transitions.find((item) => item.id === transitionId);
          return {
            transition: transition ?? null,
            from: journey.steps.find((step) => step.id === transition?.from) ?? null,
            to: journey.steps.find((step) => step.id === transition?.to) ?? null,
          };
        }),
        disclaimer: 'Declared scenario path; not evidence of execution.',
      };
    }),
    sharedRequirements,
    sharedBindings: allJourneys.flatMap((item) =>
      item.bindings.filter(
        (binding) =>
          !journey.bindings.some((owned) => owned.id === binding.id) &&
          (bindingRefs.has(binding.id) ||
            binding.links?.some((ref) => localIds.has(ref) || requirementIds.has(ref))),
      ),
    ),
  };
}
