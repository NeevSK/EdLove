import type { FlowNodeStep } from '@repo/core/types/domainEntry';
import { describe, expect, it } from 'vitest';
import {
  DEFAULT_PRESENTATION,
  nextStepOf,
  presentationOf,
  resolveFlowCompletion,
  resolveFlowStep,
} from './navigator';

const phone = { platform: 'mobile', sizeClass: 'compact' } as const;
const desktop = { platform: 'web', sizeClass: 'regular' } as const;

const step = (
  purpose: FlowNodeStep['purpose'],
  presentation?: FlowNodeStep['presentation'],
): FlowNodeStep => ({
  stepId: 's',
  title: 'S',
  purpose,
  mobileRoute: '/',
  webRoute: '/',
  primaryAction: 'Go',
  fallbacks: [],
  presentation,
});

describe('flow navigator / G1, real flow registry and route catalogue', () => {
  describe('presentation', () => {
    it.each([
      ['on_ramp', 'push', 'push'],
      ['input_form', 'push', 'push'],
      ['preview_confirm', 'sheet', 'modal'],
      ['sub_detail', 'push', 'panel'],
      ['terminal_success', 'replace', 'replace'],
    ] as const)(
      'a %s step is %s on a phone and %s on a tablet or desktop',
      (purpose, compact, regular) => {
        expect(presentationOf(step(purpose), 'compact')).toBe(compact);
        expect(presentationOf(step(purpose), 'regular')).toBe(regular);
      },
    );

    it('lets a step override its purpose, per size class', () => {
      const confirm = step('preview_confirm', { regular: 'panel' });
      expect(presentationOf(confirm, 'regular')).toBe('panel');
      expect(presentationOf(confirm, 'compact')).toBe(DEFAULT_PRESENTATION.preview_confirm.compact);
    });
  });

  describe('resolving a step', () => {
    it('finds the route on each platform', () => {
      expect(resolveFlowStep('flow:entry:mobile', 'auth_gate', phone)).toMatchObject({
        kind: 'go',
        href: '/auth',
        route: '/auth',
        op: 'push',
        presentation: 'push',
      });
      expect(resolveFlowStep('flow:entry:mobile', 'auth_gate', desktop)).toMatchObject({
        kind: 'go',
        href: '/sign-in',
      });
    });

    it('replaces when the flow ends, so back does not return into it', () => {
      expect(resolveFlowStep('flow:entry:mobile', 'workspace_floor', phone)).toMatchObject({
        kind: 'go',
        op: 'replace',
        presentation: 'replace',
      });
    });

    it('says why a step cannot be reached instead of navigating nowhere', () => {
      expect(resolveFlowStep('flow:teacher:roll_call', 'batch_mark', phone)).toMatchObject({
        kind: 'unavailable',
        reason: 'route_missing',
        detail: '/(tabs)/workspace/attendance/register',
      });
      expect(resolveFlowStep('flow:entry:mobile', 'nope', phone)).toMatchObject({
        kind: 'unavailable',
        reason: 'unknown_step',
      });
    });

    it('asks for the params a dynamic route needs', () => {
      expect(
        resolveFlowStep('flow:teacher:student_radar_attunement', 'select_student_roster', desktop),
      ).toMatchObject({ kind: 'unavailable', reason: 'params_missing', detail: 'id' });
    });

    it('takes the fallback for a condition, replacing the step, with what to tell the person', () => {
      const resolved = resolveFlowStep('flow:teacher:roll_call', 'select_roster', {
        ...phone,
        condition: 'prerequisite_missing',
      });
      // The fallback route itself doesn't exist yet, so it is reported, not followed.
      expect(resolved).toMatchObject({ kind: 'unavailable', reason: 'route_missing' });
      expect(
        resolveFlowStep('flow:entry:mobile', 'auth_gate', { ...phone, condition: 'server_503' }),
      ).toMatchObject({ kind: 'unavailable', reason: 'no_fallback', detail: 'server_503' });
    });
  });

  it('walks the flow in order', () => {
    expect(nextStepOf('flow:entry:mobile', 'welcome')).toBe('auth_gate');
    expect(nextStepOf('flow:entry:mobile', 'workspace_floor')).toBeNull();
  });

  it('lands a finished flow where it says, replacing', () => {
    expect(resolveFlowCompletion('flow:entry:mobile', 'mobile')).toEqual({
      href: expect.any(String),
      op: 'replace',
    });
  });
});
