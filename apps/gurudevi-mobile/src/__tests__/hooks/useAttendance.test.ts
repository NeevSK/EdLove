import { renderHook, act } from '@testing-library/react-native';
import { useAttendance } from '../../hooks/classroom/useAttendance';
import { StudentAttendance } from '../../types/attendance';

const mockStudents: StudentAttendance[] = [
    { id: '1', student_id: 's1', full_name: 'Alice', roll_number: 1, status: 'present' },
    { id: '2', student_id: 's2', full_name: 'Bob', roll_number: 2, status: 'present' },
    { id: '3', student_id: 's3', full_name: 'Charlie', roll_number: 3, status: 'present' },
];

describe.skip('useAttendance', () => {
    it('should initialize with provided students', async () => {
        const { result } = await renderHook(() => useAttendance(mockStudents));
        expect(result.current.students).toEqual(mockStudents);
        expect(result.current.stats).toEqual({ present: 3, absent: 0, late: 0, total: 3 });
    });

    it('should update student status', async () => {
        const { result } = await renderHook(() => useAttendance(mockStudents));

        act(() => {
            result.current.updateStudentStatus('1', 'absent');
        });

        expect(result.current.students[0].status).toBe('absent');
        expect(result.current.stats).toEqual({ present: 2, absent: 1, late: 0, total: 3 });
    });

    it('should filter students by name', async () => {
        const { result } = await renderHook(() => useAttendance(mockStudents));

        act(() => {
            result.current.setSearchQuery('Alice');
        });

        expect(result.current.filteredStudents).toHaveLength(1);
        expect(result.current.filteredStudents[0].full_name).toBe('Alice');
    });

    it('should filter students by roll number', async () => {
        const { result } = await renderHook(() => useAttendance(mockStudents));

        act(() => {
            result.current.setSearchQuery('2');
        });

        expect(result.current.filteredStudents).toHaveLength(1);
        expect(result.current.filteredStudents[0].full_name).toBe('Bob');
    });
});
