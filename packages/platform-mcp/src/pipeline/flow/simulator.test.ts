import { describe, it, expect } from 'vitest';
import { GranularJourneySimulator } from './simulator.js';
import { chatMessagingFlow } from './chatJourney.flow.js';

describe('Product Owner Granular Journey Simulator', () => {
  it('executes all 4 chat scenarios to completion with 0 errors', () => {
    const simulator = new GranularJourneySimulator(chatMessagingFlow);

    const scenarios = ['happy_path', 'offline_recovery', 'server_error_retry', 'empty_state_prompt'];

    for (const scId of scenarios) {
      const result = simulator.runScenario(scId);
      expect(result.success).toBe(true);
      expect(result.steps.length).toBeGreaterThan(0);
      expect(result.finalTerminal).toBe('terminal_delivered');
      expect(result.error).toBeUndefined();
    }
  });

  it('correctly validates the offline recovery scenario and verifies AC-1', () => {
    const simulator = new GranularJourneySimulator(chatMessagingFlow);
    const result = simulator.runScenario('offline_recovery');

    expect(result.success).toBe(true);
    expect(result.verifiedAcceptanceCriteria).toContain('AC-1: Zero Message Loss on Offline Drop');

    // Step 2 is optimistic outbox insert
    const step2 = result.steps[1];
    expect(step2?.sqliteMutation?.table).toBe('chat_messages');
    expect(step2?.sqliteMutation?.status).toBe('queued');

    // Step 3 is offline queued
    const step3 = result.steps[2];
    expect(step3?.toState).toBe('offline_queued');
    expect(step3?.visualFrame?.banner?.kind).toBe('warning');
    expect(step3?.visualFrame?.banner?.text).toContain('You are offline');
  });

  it('renders ASCII phone screens with state badges and banners', () => {
    const simulator = new GranularJourneySimulator(chatMessagingFlow);
    const offlineState = chatMessagingFlow.states['offline_queued'];

    const ascii = simulator.renderAsciiScreen(offlineState?.visualFrame, 'offline_queued');
    expect(ascii).toContain('Class 10 Biology Sanctuary');
    expect(ascii).toContain('[STATE: OFFLINE_QUEUED]');
    expect(ascii).toContain('You are offline');
    expect(ascii).toContain('Waiting for connection');
  });
});
