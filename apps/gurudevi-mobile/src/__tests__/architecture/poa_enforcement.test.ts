import { classroomsAPI } from '../../../../../packages/core/src/api';
import { supabase } from '../../../../../packages/core/src/lib/supabase';
import { useStore } from '../../../../../packages/core/src/store/useStore';
import { selfAPI } from '../../../../../packages/self/src/api/self';

const TEACHER_ID = '11111111-1111-4111-8111-111111111111';
const SCHOOL_ID = '22222222-2222-4222-8222-222222222222';

describe('POA enforcement', () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('throws Forbidden before classroomsAPI.create reaches Supabase without authority', async () => {
        jest.spyOn(useStore, 'getState').mockReturnValue({
            user: null,
            schoolType: null} as any);

        const fromSpy = jest.spyOn(supabase, 'from');

        await expect(
            classroomsAPI.create({
                name: 'Forbidden Class',
                school_id: SCHOOL_ID,
                teacher_id: TEACHER_ID} as any)
        ).rejects.toThrow('Forbidden');

        expect(fromSpy).not.toHaveBeenCalled();
    });

    it('denies selfAPI.getMoodHistory for guests according to the contract and composer', async () => {
        jest.spyOn(useStore, 'getState').mockReturnValue({
            user: null,
            schoolType: null} as any);

        const fromSpy = jest.spyOn(supabase, 'from');

        await expect(selfAPI.getMoodHistory(TEACHER_ID)).rejects.toThrow('Forbidden');

        expect(fromSpy).not.toHaveBeenCalled();
    });

    it('allows selfAPI.getMoodHistory for an authenticated teacher and reaches Supabase', async () => {
        jest.spyOn(useStore, 'getState').mockReturnValue({
            user: {
                id: TEACHER_ID,
                email: 'teacher@example.com',
                roles: ['teacher'],
                authority: 'teacher',
                school_id: SCHOOL_ID,
                is_anonymous: false},
            schoolType: 'school_workspace'} as any);

        const query = {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            order: jest.fn().mockReturnThis(),
            limit: jest.fn().mockResolvedValue({ data: [], error: null })};

        const fromSpy = jest.spyOn(supabase, 'from').mockReturnValue(query as any);

        await expect(selfAPI.getMoodHistory(TEACHER_ID)).resolves.toEqual([]);

        expect(fromSpy).toHaveBeenCalledWith('mood_logs');
        expect(query.limit).toHaveBeenCalledWith(30);
    });
});
