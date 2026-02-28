import { useState, useMemo } from 'react';
import { StudentAttendance, AttendanceStatus } from '@repo/core';

/**
 * useAttendance Hook
 * 
 * Shared logic for managing student attendance.
 * Located in @repo/classroom for domain-specific locality.
 */
export function useAttendance(initialStudents: StudentAttendance[] = []) {
    const [students, setStudents] = useState<StudentAttendance[]>(initialStudents);
    const [searchQuery, setSearchQuery] = useState('');

    const updateStudentStatus = (id: string, status: AttendanceStatus) => {
        setStudents(prev => prev.map(s => s.id === id ? { ...s, status } : s));
    };

    const filteredStudents = useMemo(() => {
        return students.filter(s =>
            s.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.roll_number?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [students, searchQuery]);

    const stats = useMemo(() => {
        return students.reduce((acc, curr) => {
            acc[curr.status]++;
            return acc;
        }, { present: 0, absent: 0, late: 0 });
    }, [students]);

    return {
        students,
        setStudents,
        searchQuery,
        setSearchQuery,
        updateStudentStatus,
        filteredStudents,
        stats
    };
}
