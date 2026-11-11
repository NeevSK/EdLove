import { JourneyPilotSchema } from '@repo/core/types/domainEntry';
import type { FeatureJTBDGraph } from '@repo/core/types/domainEntry';
import { type FlowId, getFlow } from './index';

/** Inspect declared coverage only; this does not execute a journey or verify a binding. */
export function inspectJourneyPilot(flowId: FlowId) {
  return inspectJourneyContract(flowId, getFlow(flowId));
}

export function inspectJourneyContract(flowId: string, flow: FeatureJTBDGraph) {
  const result = JourneyPilotSchema.safeParse(flow.journeyPilot);
  if (!result.success)
    return {
      valid: false,
      errors: ['Missing or invalid journey contract'],
      gaps: [],
      minimal: null,
      expanded: null,
    };
  const journey = result.data;
  const errors: string[] = [];
  const steps = new Set(journey.steps.map((step) => step.id));
  const transitions = new Set(journey.transitions.map((edge) => edge.id));
  if (steps.size !== journey.steps.length) errors.push('Duplicate step ID');
  if (transitions.size !== journey.transitions.length) errors.push('Duplicate transition ID');
  if (new Set(journey.scenarios.map((scenario) => scenario.id)).size !== journey.scenarios.length)
    errors.push('Duplicate scenario ID');
  if (!steps.has(journey.entryStep)) errors.push('Unknown entry step');
  for (const edge of journey.transitions) {
    if (!steps.has(edge.from) || !steps.has(edge.to))
      errors.push(`Unknown step in transition ${edge.id}`);
  }
  for (const scenario of journey.scenarios) {
    for (const id of scenario.transitions)
      if (!transitions.has(id)) errors.push(`Unknown transition ${id} in scenario ${scenario.id}`);
    for (let index = 1; index < scenario.transitions.length; index++) {
      const previous = journey.transitions.find(
        (edge) => edge.id === scenario.transitions[index - 1],
      );
      const next = journey.transitions.find((edge) => edge.id === scenario.transitions[index]);
      if (previous && next && previous.to !== next.from)
        errors.push(`Disconnected scenario ${scenario.id}`);
    }
  }
  const reached = new Set([journey.entryStep]);
  for (let pass = 0; pass < journey.steps.length; pass++) {
    for (const edge of journey.transitions) if (reached.has(edge.from)) reached.add(edge.to);
  }
  for (const step of journey.steps)
    if (!reached.has(step.id)) errors.push(`Unreachable step ${step.id}`);
  if (!journey.steps.some((step) => step.terminal && reached.has(step.id)))
    errors.push('No reachable terminal step');
  const gaps = [
    ...journey.transitions
      .filter(
        (edge) => !journey.scenarios.some((scenario) => scenario.transitions.includes(edge.id)),
      )
      .map((edge) => `Transition ${edge.id} has no scenario`),
    ...journey.scenarios
      .filter((scenario) => scenario.evidence.length === 0)
      .map((scenario) => `Scenario ${scenario.id} has no evidence`),
    ...journey.bindings
      .filter((binding) => binding.status !== 'verified')
      .map((binding) => `${binding.kind} binding is ${binding.status}`),
    ...(!journey.developmentContext ? ['Development context has not been documented'] : []),
    ...(journey.developmentContext?.openQuestions ?? []).map((question) => `Open question: ${question}`),
  ];
  return {
    valid: errors.length === 0,
    errors,
    gaps,
    minimal: {
      flowId,
      featureId: flow.featureId,
      intent: journey.intent,
      steps: journey.steps,
      transitions: journey.transitions,
    },
    expanded: { scenarios: journey.scenarios, bindings: journey.bindings, developmentContext: journey.developmentContext },
  };
}
