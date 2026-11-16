import type { FlowDefinition, FlowValidationReceipt } from './types.js';

export function validateFlow(flow: FlowDefinition): FlowValidationReceipt {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 1. Metadata Verification
  if (!flow.metadata?.id) {
    errors.push('Flow metadata missing required "id".');
  }
  if (!flow.metadata?.version || !/^\d+\.\d+\.\d+$/.test(flow.metadata.version)) {
    errors.push(`Flow metadata has invalid SemVer version: "${flow.metadata?.version}".`);
  }
  if (!flow.metadata?.riskTier) {
    errors.push('Flow metadata missing required "riskTier".');
  }

  // 2. Ingress & Guards Verification
  if (!flow.ingress?.supportedVectors || flow.ingress.supportedVectors.length === 0) {
    errors.push('Flow ingress must declare at least one supported IngressVector.');
  }

  for (const guard of flow.ingress?.guards || []) {
    if (!guard.name || !guard.onFailureBounceRoute) {
      errors.push(`AdmissionGuard "${guard.name || 'unnamed'}" missing failure bounce route.`);
    }
  }

  // 3. Topology & State Reachability Verification
  const stateKeys = new Set(Object.keys(flow.states || {}));
  const terminalKeys = new Set(Object.keys(flow.terminals || {}));
  const allTargetKeys = new Set<string>();

  // Overlap check
  for (const s of stateKeys) {
    if (terminalKeys.has(s)) {
      errors.push(`Collision: "${s}" is defined as both a StateNode and a TerminalNode.`);
    }
  }

  for (const [stateName, node] of Object.entries(flow.states || {})) {
    if (!node.screen || !node.component) {
      errors.push(`StateNode "${stateName}" missing required "screen" or "component".`);
    }

    const events = Object.entries(node.onEvents || {});
    if (events.length === 0) {
      warnings.push(`StateNode "${stateName}" defines no onEvents transitions.`);
    }

    for (const [eventName, transition] of events) {
      const target = transition.targetState;
      allTargetKeys.add(target);

      if (!stateKeys.has(target) && !terminalKeys.has(target)) {
        errors.push(`StateNode "${stateName}" event "${eventName}" references unknown target state "${target}".`);
      }

      // Layer 2: Motion Validation
      if (transition.motion) {
        if (transition.motion.type === 'SPRING') {
          if (!transition.motion.damping || !transition.motion.stiffness) {
            warnings.push(`Transition to "${target}" specifies SPRING motion without damping or stiffness.`);
          }
        }
      }

      // Layer 3: Data Seam Validation
      if (transition.dataMutation) {
        if (!transition.dataMutation.type) {
          errors.push(`Transition to "${target}" defines dataMutation with missing type.`);
        }
      }
    }
  }

  // Terminal reachability check
  for (const term of terminalKeys) {
    if (!allTargetKeys.has(term)) {
      warnings.push(`TerminalNode "${term}" is defined but never targeted by any state transition.`);
    }
  }

  // 4. Invariants Envelope Validation
  if (!flow.invariants?.rlsPolicy) {
    errors.push('InvariantEnvelope missing required "rlsPolicy".');
  }
  if (!flow.invariants?.softDeleteField) {
    errors.push('InvariantEnvelope missing required "softDeleteField".');
  }
  if (!flow.invariants?.tenantIsolationField) {
    errors.push('InvariantEnvelope missing required "tenantIsolationField".');
  }

  return {
    journeyId: flow.metadata?.id || 'unknown',
    version: flow.metadata?.version || '0.0.0',
    valid: errors.length === 0,
    totalStates: stateKeys.size,
    totalTerminals: terminalKeys.size,
    errors,
    warnings,
  };
}
