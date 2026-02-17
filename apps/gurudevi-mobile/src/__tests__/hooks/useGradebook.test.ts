import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useGradebook } from '../../hooks/grading/useGradebook';
import { api } from '../../lib/api';

// Mock API
jest.mock('../../lib/api', () => ({
    api: {
        grading: {
            getClassroomGrades: jest.fn(),
            getGradingSettings: jest.fn(),
            updateGradingSettings: jest.fn(),
        },
        classroomStudents: {
            getAll: jest.fn(),
        },
    },
}));

describe('useGradebook', () => {
    const classroomId = 'class-123';
    const mockGrades = [
        { id: 'g1', student_id: 's1', marks: 85, rank: 2 },
        { id: 'g2', student_id: 's2', marks: 92, rank: 1 },
    ];
    const mockSettings = { classroom_id: classroomId, grading_mode: 'both', show_ranks: true };
    const mockStudents = [
        { id: 's1', student_id: 's1', full_name: 'Alice' },
        { id: 's2', student_id: 's2', full_name: 'Bob' },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        (api.grading.getClassroomGrades as jest.Mock).mockResolvedValue(mockGrades);
        (api.grading.getGradingSettings as jest.Mock).mockResolvedValue(mockSettings);
        (api.classroomStudents.getAll as jest.Mock).mockResolvedValue(mockStudents);
    });

    it('should load initial data correctly', async () => {
        const { result } = renderHook(() => useGradebook(classroomId));

        await waitFor(() => expect(result.current.isLoading).toBe(false));

        expect(result.current.grades).toEqual(mockGrades);
        expect(result.current.gradingSettings).toEqual(mockSettings);
        expect(result.current.studentNames).toEqual({ s1: 'Alice', s2: 'Bob' });
        expect(result.current.error).toBeNull();
    });

    it('should calculate stats correctly', async () => {
        const { result } = renderHook(() => useGradebook(classroomId));
        await waitFor(() => expect(result.current.isLoading).toBe(false));

        expect(result.current.stats).toEqual({
            totalStudents: 2,
            averageMarks: 89, // (85 + 92) / 2 = 88.5 -> 89
        });
    });

    it('should update settings', async () => {
        const newSettings = { grading_mode: 'gpa', show_ranks: false };
        const updatedSettings = { ...mockSettings, ...newSettings };
        (api.grading.updateGradingSettings as jest.Mock).mockResolvedValue(updatedSettings);

        const { result } = renderHook(() => useGradebook(classroomId));
        await waitFor(() => expect(result.current.isLoading).toBe(false));

        await act(async () => {
            await result.current.updateSettings(newSettings);
        });

        expect(api.grading.updateGradingSettings).toHaveBeenCalledWith(classroomId, newSettings);
        expect(result.current.gradingSettings).toEqual(updatedSettings);
    });

    it('should sort grades by rank (default)', async () => {
        const { result } = renderHook(() => useGradebook(classroomId));
        await waitFor(() => expect(result.current.isLoading).toBe(false));

        const sorted = result.current.sortedGrades;
        expect(sorted[0].rank).toBe(1); // Bob
        expect(sorted[1].rank).toBe(2); // Alice
    });

    it('should sort grades by marks', async () => {
        const { result } = renderHook(() => useGradebook(classroomId));
        await waitFor(() => expect(result.current.isLoading).toBe(false));

        act(() => {
            result.current.setSortBy('marks');
        });

        const sorted = result.current.sortedGrades;
        // 92 > 85
        expect(sorted[0].marks).toBe(92);
        expect(sorted[1].marks).toBe(85);
    });

    it('should sort grades by name', async () => {
        const { result } = renderHook(() => useGradebook(classroomId));
        await waitFor(() => expect(result.current.isLoading).toBe(false));

        act(() => {
            result.current.setSortBy('name');
        });

        const sorted = result.current.sortedGrades;
        // Alice comes before Bob
        expect(sorted[0].student_id).toBe('s1');
        expect(sorted[1].student_id).toBe('s2');
    });

    it('should handle API errors', async () => {
        const errorMessage = 'Network error';
        (api.grading.getClassroomGrades as jest.Mock).mockRejectedValue(new Error(errorMessage));

        const { result } = renderHook(() => useGradebook(classroomId));
        await waitFor(() => expect(result.current.isLoading).toBe(false));

        expect(result.current.error).toBe(errorMessage);
    });
});
