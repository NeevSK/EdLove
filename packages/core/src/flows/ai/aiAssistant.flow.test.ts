import { describe, it, expect } from 'vitest';
import { aiAssistantFlow } from './aiAssistant.flow';
import { validateFlowDAG } from '../../types/FlowDAG';

describe('aiAssistantFlow (User Journey Orchestration / FlowDAG)', () => {
  it('has a valid unique feature identifier and target personas', () => {
    expect(aiAssistantFlow.featureId).toBe('ai.assistant_companion');
    expect(aiAssistantFlow.jobTitle).toContain('Ambient AI Assistant');
    expect(aiAssistantFlow.targetPersonas).toContain('teacher');
    expect(aiAssistantFlow.targetPersonas).toContain('student');
  });

  it('declares ingress triggers for LotusPetalFAB and Community Direct Messages', () => {
    const triggerSurfaces = aiAssistantFlow.triggers.map((t) =>
      'surfaceId' in t ? t.surfaceId : 'tab' in t ? `${t.tab}.${t.floor}` : '',
    );
    expect(triggerSurfaces).toContain('LotusPetalFAB');
    expect(triggerSurfaces).toContain('community.direct_messages');
  });

  it('contains all canonical nodes with fallback routes', () => {
    const stepIds = aiAssistantFlow.nodes.map((n) => n.stepId);
    expect(stepIds).toEqual([
      'entry_resolution',
      'chat_stream',
      'agent_mission_dispatch',
      'proposal_review_gate',
      'terminal_commit',
    ]);
  });

  it('passes standard FlowDAG validation with zero structural errors', () => {
    const result = validateFlowDAG(aiAssistantFlow);
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('enforces privacy boundary and human review fallback specifications', () => {
    const chatNode = aiAssistantFlow.nodes.find((n) => n.stepId === 'chat_stream');
    const incognitoFallback = chatNode?.fallbacks.find(
      (f) => f.condition === 'feature_disabled',
    );
    expect(incognitoFallback).toBeDefined();
    expect(incognitoFallback?.guidancePrompt).toContain('Incognito mode is active');

    const reviewNode = aiAssistantFlow.nodes.find((n) => n.stepId === 'proposal_review_gate');
    expect(reviewNode?.purpose).toBe('preview_confirm');
    const discardFallback = reviewNode?.fallbacks.find((f) => f.condition === 'prerequisite_missing');
    expect(discardFallback?.recoveryAction).toBe('retry');
  });
});
