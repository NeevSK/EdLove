import { useState, useMemo, useEffect } from 'react';
import { StudentAttendance, AttendanceStatus } from '../types/attendance';

export const useAttendance = (initialStudents: StudentAttendance[] = []) => {
    const [students, setStudents] = useState<StudentAttendance[]>(initialStudents);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (initialStudents.length > 0) {
            setStudents(initialStudents);
        }
    }, [initialStudents]);

    const updateStudentStatus = (studentId: string, status: AttendanceStatus) => {
        setStudents((prev) =>
            prev.map((student) =>
                student.id === studentId ? { ...student, status } : student
            )
        );
    };

    const filteredStudents = useMemo(() => {
        if (!searchQuery.trim()) return students;

        const query = searchQuery.toLowerCase();
        return students.filter(
            (student) =>
                student.full_name.toLowerCase().includes(query) ||
                student.roll_number?.toString().includes(query)
        );
    }, [students, searchQuery]);

    const stats = useMemo(() => {
        const present = students.filter((s) => s.status === 'present').length;
        const absent = students.filter((s) => s.status === 'absent').length;
        const late = students.filter((s) => s.status === 'late').length;
        return { present, absent, late, total: students.length };
    }, [students]);

    return {
        students,
        setStudents,
        searchQuery,
        setSearchQuery,
        updateStudentStatus,
        filteredStudents,
        stats,
    };
};
