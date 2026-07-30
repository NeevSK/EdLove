import { GPACalculator } from '@/engine/GPACalculator';
export class PerformanceAnalyzer {
    gpaCalculator;
    db;
    constructor(db) {
        this.gpaCalculator = new GPACalculator();
        this.db = db;
    }
    /**
     * Analyze student performance across all metrics
     */
    async analyzeStudentPerformance(studentId, classId, _timeRange) {
        // Fetch student data
        const { data: grades, error: gradesError } = await this.db
            .from('grades')
            .select('*')
            .eq('student_id', studentId)
            .eq('class_id', classId)
            .order('graded_at', { ascending: false });
        if (gradesError)
            throw gradesError;
        const { data: attendance, error: attendanceError } = await this.db
            .from('attendance')
            .select('*')
            .eq('student_id', studentId)
            .eq('class_id', classId);
        if (attendanceError)
            throw attendanceError;
        const { data: assignments, error: assignmentsError } = await this.db
            .from('assignments')
            .select('*')
            .eq('class_id', classId);
        if (assignmentsError)
            throw assignmentsError;
        // Calculate metrics
        const currentGPA = this.gpaCalculator.calculateGPA(grades || []);
        const averageMarks = grades?.reduce((sum, g) => sum + g.marks, 0) / (grades?.length || 1) || 0;
        // Calculate trend
        const trendDirection = this.calculateTrendDirection(grades || []);
        // Get class rank
        const classRank = await this.calculateClassRank(studentId, classId, currentGPA);
        // Subject performance
        const subjectPerformance = await this.calculateSubjectPerformance(studentId, classId);
        // Attendance impact
        const attendanceData = attendance || [];
        const _attendanceRate = attendanceData.filter((a) => a.status === 'present').length / attendanceData.length;
        const attendanceImpact = this.calculateAttendanceCorrelation(grades || [], attendanceData);
        // Submission rate
        const submissionRate = this.calculateSubmissionRate(studentId, assignments || [], grades || []);
        return {
            studentId,
            currentGPA,
            trendDirection,
            averageMarks,
            rankInClass: classRank.rank,
            totalStudents: classRank.totalStudents,
            subjectPerformance,
            attendanceImpact,
            submissionRate,
        };
    }
    /**
     * Analyze class-wide performance
     */
    async analyzeClassPerformance(classId) {
        // Fetch all students in class
        const { data: students, error: studentsError } = await this.db
            .from('enrollments')
            .select('student_id')
            .eq('class_id', classId);
        if (studentsError)
            throw studentsError;
        const studentIds = students?.map((s) => s.student_id) || [];
        // Fetch all grades for the class
        const { data: allGrades, error: gradesError } = await this.db
            .from('grades')
            .select('*')
            .in('student_id', studentIds)
            .eq('class_id', classId);
        if (gradesError)
            throw gradesError;
        // Calculate class metrics
        const studentGPAs = await this.calculateAllStudentGPAs(studentIds, classId);
        const averageGPA = studentGPAs.reduce((sum, gpa) => sum + gpa, 0) / studentGPAs.length;
        const averageMarks = allGrades?.reduce((sum, g) => sum + g.marks, 0) / (allGrades?.length || 1) || 0;
        // Grade distribution
        const gradeDistribution = this.gpaCalculator.getGradeDistribution(allGrades || []);
        // Identify top performers and at-risk students
        const studentPerformances = await Promise.all(studentIds.map(async (studentId) => {
            const performance = await this.analyzeStudentPerformance(studentId, classId);
            return { studentId, gpa: performance.currentGPA };
        }));
        const sortedPerformances = studentPerformances.sort((a, b) => b.gpa - a.gpa);
        const topPerformers = sortedPerformances.slice(0, 5).map((p) => p.studentId);
        const atRiskStudents = sortedPerformances
            .filter((p) => p.gpa < 2.0)
            .map((p) => p.studentId);
        // Correlations
        const attendanceCorrelation = await this.calculateClassAttendanceCorrelation(classId);
        const submissionCorrelation = await this.calculateClassSubmissionCorrelation(classId);
        // Generate insights
        const insights = this.generateClassInsights({
            averageGPA,
            averageMarks,
            gradeDistribution,
            topPerformers: topPerformers.length,
            atRiskStudents: atRiskStudents.length,
            totalStudents: studentIds.length,
        });
        return {
            classId,
            totalStudents: studentIds.length,
            averageGPA,
            averageMarks,
            gradeDistribution,
            topPerformers,
            atRiskStudents,
            attendanceCorrelation,
            submissionCorrelation,
            insights,
        };
    }
    calculateTrendDirection(grades) {
        if (grades.length < 3)
            return 'stable';
        const recent = grades.slice(0, Math.ceil(grades.length / 2));
        const older = grades.slice(Math.ceil(grades.length / 2));
        const recentAvg = recent.reduce((sum, g) => sum + g.marks, 0) / recent.length;
        const olderAvg = older.reduce((sum, g) => sum + g.marks, 0) / older.length;
        const difference = recentAvg - olderAvg;
        if (difference > 5)
            return 'improving';
        if (difference < -5)
            return 'declining';
        return 'stable';
    }
    async calculateClassRank(_studentId, _classId, _studentGPA) {
        // This would need to be implemented based on your data structure
        // For now, return placeholder values
        return { rank: 1, totalStudents: 30 };
    }
    async calculateSubjectPerformance(_studentId, _classId) {
        // This would need subject-specific data
        return { Math: 85, Science: 78, English: 92 };
    }
    calculateAttendanceCorrelation(grades, attendance) {
        // Simple correlation calculation
        if (grades.length === 0 || attendance.length === 0)
            return 0;
        const attendanceRate = attendance.filter((a) => a.status === 'present').length / attendance.length;
        const averageGrade = grades.reduce((sum, g) => sum + g.marks, 0) / grades.length;
        // Simple heuristic: higher attendance generally correlates with better grades
        return Math.min(1.0, attendanceRate * (averageGrade / 100));
    }
    calculateSubmissionRate(studentId, assignments, grades) {
        if (assignments.length === 0)
            return 1.0;
        const submittedAssignments = grades?.filter((g) => g.student_id === studentId).length || 0;
        return submittedAssignments / assignments.length;
    }
    async calculateAllStudentGPAs(studentIds, classId) {
        const gpas = await Promise.all(studentIds.map(async (studentId) => {
            const performance = await this.analyzeStudentPerformance(studentId, classId);
            return performance.currentGPA;
        }));
        return gpas;
    }
    async calculateClassAttendanceCorrelation(_classId) {
        // Implementation would calculate correlation between attendance and grades across class
        return 0.75;
    }
    async calculateClassSubmissionCorrelation(_classId) {
        // Implementation would calculate correlation between submission rates and grades
        return 0.82;
    }
    generateClassInsights(metrics) {
        const insights = [];
        if (metrics.averageGPA < 2.5) {
            insights.push('Class average GPA is below recommended threshold. Consider additional support.');
        }
        if (metrics.atRiskStudents > metrics.totalStudents * 0.2) {
            insights.push('High number of at-risk students. Early intervention recommended.');
        }
        if (metrics.attendanceCorrelation > 0.8) {
            insights.push('Strong correlation between attendance and performance. Attendance initiatives may improve results.');
        }
        return insights;
    }
}
