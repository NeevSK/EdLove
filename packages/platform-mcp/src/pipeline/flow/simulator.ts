import type { FlowDefinition, UserScenario, VisualFrame, MotionRecipe, ScenarioStep, EventTransition } from './types.js';

export interface StepExecutionRecord {
  stepIndex: number;
  event: string;
  actor?: 'author' | 'reviewer' | 'system' | 'collaborator';
  payload?: Record<string, unknown>;
  fromState: string;
  toState: string;
  motion?: MotionRecipe;
  sqliteMutation?: {
    table: string;
    operation?: string;
    status: string;
    idempotencyKey?: string;
  };
  secondaryMutations?: Array<{ table: string; operation: string; status?: string }>;
  visualFrame?: VisualFrame;
  assertionPassed: boolean;
  assertionMessage: string;
}

export interface ScenarioSimulationResult {
  scenarioId: string;
  title: string;
  persona: string;
  success: boolean;
  steps: StepExecutionRecord[];
  finalTerminal?: string;
  verifiedAcceptanceCriteria: string[];
  error?: string;
}

export class GranularJourneySimulator {
  constructor(private flow: FlowDefinition) {}

  public runScenario(scenarioId: string): ScenarioSimulationResult {
    const scenario = this.flow.scenarios?.[scenarioId];
    if (!scenario) {
      throw new Error(`Scenario "${scenarioId}" not found in flow "${this.flow.metadata.id}". Available: ${Object.keys(this.flow.scenarios || {}).join(', ')}`);
    }

    const records: StepExecutionRecord[] = [];
    let currentStateName = Object.keys(this.flow.states)[0] || 'composer_idle';
    let sqliteOutboxStatus = 'none';

    // If scenario specifies initial state context
    if (scenario.initialIngress === 'cold_boot' && this.flow.states['empty_thread']) {
      currentStateName = 'empty_thread';
    } else if (this.flow.states['composer_idle']) {
      currentStateName = 'composer_idle';
    }

    let finalTerminal: string | undefined = undefined;

    for (let i = 0; i < scenario.steps.length; i++) {
      const step: ScenarioStep = scenario.steps[i]!;
      const stateNode = this.flow.states[currentStateName];

      if (!stateNode) {
        return {
          scenarioId: scenario.id,
          title: scenario.title,
          persona: scenario.persona,
          success: false,
          steps: records,
          error: `Current state "${currentStateName}" is invalid.`,
          verifiedAcceptanceCriteria: [],
        };
      }

      const transition: EventTransition | undefined = stateNode.onEvents[step.event];
      if (!transition) {
        return {
          scenarioId: scenario.id,
          title: scenario.title,
          persona: scenario.persona,
          success: false,
          steps: records,
          error: `State "${currentStateName}" has no handler for event "${step.event}". Valid events: ${Object.keys(stateNode.onEvents).join(', ')}`,
          verifiedAcceptanceCriteria: [],
        };
      }

      const target = transition.targetState;
      let nextVisualFrame: VisualFrame | undefined;
      let mutationInfo = undefined;

      if (transition.dataMutation) {
        sqliteOutboxStatus = transition.dataMutation.initialStatus || 'inserted';
        mutationInfo = {
          table: transition.dataMutation.table || 'chat_messages',
          operation: transition.dataMutation.type,
          status: sqliteOutboxStatus,
          idempotencyKey: transition.dataMutation.idempotencyKey ? 'uuidv8-550e8400-e29b-41d4' : undefined,
        };
      }

      if (this.flow.terminals[target]) {
        finalTerminal = target;
        nextVisualFrame = this.flow.terminals[target]?.visualFrame;
      } else if (this.flow.states[target]) {
        nextVisualFrame = this.flow.states[target]?.visualFrame;
      }

      const stateMatches = target === step.expectedState;

      records.push({
        stepIndex: i + 1,
        event: step.event,
        actor: transition.actor,
        payload: step.payload,
        fromState: currentStateName,
        toState: target,
        motion: transition.motion,
        sqliteMutation: mutationInfo,
        secondaryMutations: transition.dataMutation?.secondaryTables,
        visualFrame: nextVisualFrame,
        assertionPassed: stateMatches,
        assertionMessage: step.assertion,
      });

      if (!stateMatches) {
        return {
          scenarioId: scenario.id,
          title: scenario.title,
          persona: scenario.persona,
          success: false,
          steps: records,
          finalTerminal,
          error: `Step ${i + 1} assertion failed: expected state "${step.expectedState}" but transitioned to "${target}".`,
          verifiedAcceptanceCriteria: [],
        };
      }

      currentStateName = target;
    }

    const terminalMatches = finalTerminal === scenario.expectedTerminal;
    const verifiedAC = (this.flow.acceptanceCriteria || [])
      .filter((ac) => ac.verifiedByScenario === scenario.id)
      .map((ac) => `${ac.id}: ${ac.title}`);

    return {
      scenarioId: scenario.id,
      title: scenario.title,
      persona: scenario.persona,
      success: terminalMatches,
      steps: records,
      finalTerminal,
      verifiedAcceptanceCriteria: verifiedAC,
      error: terminalMatches ? undefined : `Expected terminal "${scenario.expectedTerminal}" but reached "${finalTerminal || 'none'}".`,
    };
  }

  public renderAsciiScreen(frame?: VisualFrame, stateName?: string): string {
    if (!frame) return '    [No visual frame defined for state]';

    const lines: string[] = [];
    const width = 48;
    const hr = '  ┌' + '─'.repeat(width) + '┐';
    const bottomHr = '  └' + '─'.repeat(width) + '┘';

    lines.push(hr);
    const title = `📱 ${frame.screenTitle}`.padEnd(width);
    lines.push(`  │ ${title.slice(0, width - 2)} │`);
    lines.push('  ├' + '─'.repeat(width) + '┤');

    if (stateName) {
      const stateBadge = `[STATE: ${stateName.toUpperCase()}]`.padEnd(width);
      lines.push(`  │ ${stateBadge.slice(0, width - 2)} │`);
    }

    if (frame.banner) {
      const bannerIcon = frame.banner.kind === 'error' ? '🛑' : frame.banner.kind === 'warning' ? '⚠️' : 'ℹ️';
      const bannerText = `${bannerIcon} ${frame.banner.text}`;
      const wrapped = this.wrapText(bannerText, width - 4);
      for (const line of wrapped) {
        lines.push(`  │ ▌ ${line.padEnd(width - 4)} │`);
      }
      lines.push('  ├' + '─'.repeat(width) + '┤');
    }

    for (const elem of frame.elements) {
      let icon = '•';
      if (elem.type === 'button') icon = elem.state === 'disabled' ? '[ 🔒' : '[ 🔘';
      else if (elem.type === 'input') icon = '✎';
      else if (elem.type === 'badge') icon = '🏷️';
      else if (elem.type === 'list') icon = '📋';
      else if (elem.type === 'skeleton') icon = '░░';

      const suffix = elem.type === 'button' ? ' ]' : '';
      const elemStr = `${icon} ${elem.label}${suffix}`;
      const wrapped = this.wrapText(elemStr, width - 4);
      for (const line of wrapped) {
        lines.push(`  │   ${line.padEnd(width - 4)} │`);
      }
    }

    if (frame.keyboardVisible) {
      lines.push('  ├' + '─'.repeat(width) + '┤');
      lines.push('  │ [⌨️  VIRTUAL KEYBOARD ACTIVE (adjustResize) ] │');
    }

    lines.push(bottomHr);
    return lines.join('\n');
  }

  private wrapText(text: string, maxLen: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let cur = '';

    for (const w of words) {
      if ((cur + ' ' + w).trim().length <= maxLen) {
        cur = (cur + ' ' + w).trim();
      } else {
        if (cur) lines.push(cur);
        cur = w;
      }
    }
    if (cur) lines.push(cur);
    return lines.length > 0 ? lines : [''];
  }
}
