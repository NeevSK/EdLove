import { selectLatestTemporalRecordsAsOf, toTemporalCutoff } from '../temporalEvents';

describe('temporal event helpers', () => {
    test('selectLatestTemporalRecordsAsOf returns latest visible event per entity', () => {
        const records = selectLatestTemporalRecordsAsOf(
            [
                {
                    entity_type: 'school_invite',
                    entity_id: 'INV-1',
                    occurred_at: '2026-03-28T10:00:00.000Z',
                    recorded_at: '2026-03-28T10:00:00.000Z',
                    effective_to: null,
                },
                {
                    entity_type: 'school_invite',
                    entity_id: 'INV-1',
                    occurred_at: '2026-03-27T10:00:00.000Z',
                    recorded_at: '2026-03-27T10:00:00.000Z',
                    effective_to: null,
                },
                {
                    entity_type: 'principal_observation',
                    entity_id: 'OBS-1',
                    occurred_at: '2026-03-28T09:00:00.000Z',
                    recorded_at: '2026-03-28T09:00:00.000Z',
                    effective_to: null,
                },
                {
                    entity_type: 'principal_observation',
                    entity_id: 'OBS-2',
                    occurred_at: '2026-03-26T09:00:00.000Z',
                    recorded_at: '2026-03-26T09:00:00.000Z',
                    effective_to: '2026-03-27T09:00:00.000Z',
                },
            ],
            '2026-03-28',
            {
                getEntityKey: (record) => `${record.entity_type}:${record.entity_id}`,
                getEffectiveTo: (record) => record.effective_to,
            },
        );

        expect(records).toHaveLength(2);
        expect(records.find((record) => record.entity_id === 'INV-1')?.occurred_at).toBe('2026-03-28T10:00:00.000Z');
        expect(records.find((record) => record.entity_id === 'OBS-1')?.occurred_at).toBe('2026-03-28T09:00:00.000Z');
        expect(records.find((record) => record.entity_id === 'OBS-2')).toBeUndefined();
    });

    test('toTemporalCutoff expands date-only view dates', () => {
        expect(toTemporalCutoff('2026-03-28')).toBe('2026-03-28T23:59:59.999Z');
        expect(toTemporalCutoff('2026-03-28T05:00:00.000Z')).toBe('2026-03-28T05:00:00.000Z');
    });
});
