import { describe, expect, it } from 'vitest';
import { validateHierarchy } from './hierarchy';
import { inspectHierarchyJourney } from './hierarchyQuery';

const fixture = {
  schemaVersion: 2,
  features: [
    {
      id: 'feature:example',
      title: 'Feature',
      description: 'Example',
      lifecycle: { maturity: 'proposed', owner: 'test' },
      intents: [
        {
          id: 'intent:example',
          title: 'Intent',
          actor: 'Person',
          outcome: 'Complete work',
          journeys: [
            {
              id: 'journey:example',
              title: 'Journey',
              situation: 'Starting',
              outcome: 'Finished',
              context: 'setup',
              preconditions: [],
              entry: 'step:start',
              development: {
                mode: 'brownfield',
                existingBehavior: [],
                invariants: [],
                openQuestions: [],
                integrationPoints: [],
              },
              steps: [
                { id: 'step:start', title: 'Start', interaction: 'Begin', terminal: false },
                { id: 'step:end', title: 'End', interaction: 'Finish', terminal: true },
              ],
              transitions: [
                {
                  id: 'transition:finish',
                  from: 'step:start',
                  to: 'step:end',
                  action: 'Finish',
                  feedback: 'Done',
                },
              ],
              requirements: [],
              bindings: [],
              scenarios: [
                {
                  id: 'scenario:finish',
                  title: 'Finish',
                  transitions: ['transition:finish'],
                  expected: 'Done',
                },
              ],
              evidence: [],
            },
          ],
        },
      ],
    },
  ],
};

describe('hierarchical PJC validation', () => {
  it('rejects the old and mixed top-level formats', () => {
    expect(validateHierarchy({ schemaVersion: 1, records: [] }).errors.length).toBeGreaterThan(0);
    expect(validateHierarchy({ ...fixture, records: [] }).errors.length).toBeGreaterThan(0);
  });
  it('checks journey references rather than trusting declarations', () => {
    expect(validateHierarchy(fixture).errors).toEqual([]);
    const broken = structuredClone(fixture);
    broken.features[0]!.intents[0]!.journeys[0]!.transitions[0]!.to = 'step:missing';
    expect(validateHierarchy(broken).errors).toContain('transition:finish: unknown step');
  });
  it('validates shared journeys and shared authorities without duplicating records', () => {
    const original = fixture.features[0]!.intents[0]!.journeys[0]!;
    const shared = {
      schemaVersion: 2,
      features: [
        {
          ...fixture.features[0]!,
          intents: [
            {
              ...fixture.features[0]!.intents[0]!,
              journeys: [
                {
                  ...original,
                  requirements: [
                    { id: 'requirement:example', statement: 'Protect access', origin: 'user' },
                  ],
                  bindings: [
                    {
                      id: 'binding:example',
                      category: 'api',
                      status: 'unknown',
                      note: 'Unverified',
                    },
                  ],
                },
                {
                  ...original,
                  id: 'journey:second',
                  steps: [],
                  transitions: [],
                  scenarios: [],
                  requirements: [],
                  bindings: [],
                  evidence: [],
                  entry: 'step:missing',
                  sharedRequirements: ['requirement:example'],
                  sharedBindings: ['binding:example'],
                },
              ],
            },
          ],
        },
      ],
    };
    const errors = validateHierarchy(shared).errors;
    expect(errors).not.toContain('journey:second: unknown shared requirement requirement:example');
    expect(errors).not.toContain('journey:second: unknown shared binding binding:example');
    expect(errors).toContain('journey:second: unknown entry');
  });
  it('rejects references to absent shared records and legacy nested keys', () => {
    const original = fixture.features[0]!.intents[0]!.journeys[0]!;
    const input = {
      schemaVersion: 2,
      features: [
        {
          ...fixture.features[0]!,
          intents: [
            {
              ...fixture.features[0]!.intents[0]!,
              sharedJourneys: ['journey:missing'],
              journeys: [
                {
                  ...original,
                  sharedRequirements: ['requirement:missing'],
                  sharedBindings: ['binding:missing'],
                },
              ],
            },
          ],
        },
      ],
    };
    expect(validateHierarchy(input).errors).toEqual(
      expect.arrayContaining([
        'intent:example: unknown shared journey journey:missing',
        'journey:example: unknown shared requirement requirement:missing',
        'journey:example: unknown shared binding binding:missing',
      ]),
    );
    const legacy = { ...fixture, features: [{ ...fixture.features[0]!, records: [] }] };
    expect(validateHierarchy(legacy).errors.length).toBeGreaterThan(0);
  });
  it('provides a complete journey with its owners', () => {
    const result = validateHierarchy(fixture);
    expect(result.catalog).toBeDefined();
    const view = inspectHierarchyJourney(result.catalog!, 'journey:example');
    expect(view?.feature.id).toBe('feature:example');
    expect(view?.intent.id).toBe('intent:example');
    expect(view?.journey.scenarios[0]?.transitions).toEqual(['transition:finish']);
    expect(inspectHierarchyJourney(result.catalog!, 'journey:missing')).toBeNull();
  });
  it('rejects self-referential alternate evidence', () => {
    const input = structuredClone(fixture);
    const journey = input.features[0]!.intents[0]!.journeys[0]!;
    const withEvidence = {
      ...journey,
      evidence: [
        {
          id: 'evidence:example',
          scenario: 'scenario:finish',
          revision: 'revision',
          environment: 'fixture',
          tier: 'G1',
          result: 'not_applicable',
          substitutions: [],
          limitations: 'Fixture only.',
          reference: 'fixture',
          rationale: 'No runtime.',
          acceptedBy: 'owner',
          alternateEvidence: ['evidence:example'],
        },
      ],
    };
    const replacement = {
      ...input,
      features: [
        {
          ...input.features[0],
          intents: [{ ...input.features[0]!.intents[0], journeys: [withEvidence] }],
        },
      ],
    };
    expect(validateHierarchy(replacement).errors).toContain(
      'evidence:example: alternate evidence cannot reference itself',
    );
  });
});
