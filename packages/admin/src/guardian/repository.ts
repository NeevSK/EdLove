import { api } from "@repo/core/api";

import type { GuardianIdentity } from "./types";

export type GuardianLinkedStudentRow = {
	id: string;
	first_name: string;
	last_name: string;
	grade: string;
	classroom_id: string;
};

export async function getGuardianStudentsRows(
	guardianId: string,
): Promise<GuardianLinkedStudentRow[]> {
	const students = await api.guardian.getStudents(guardianId);
	return students.map((student) => {
		const nameParts = student.name.split(" ");
		return {
			id: student.studentId,
			first_name: nameParts[0] || "",
			last_name: nameParts.slice(1).join(" "),
			grade: student.grade,
			classroom_id: student.classroom,
		};
	});
}

export async function getStudentGuardiansRows(
	studentId: string,
): Promise<GuardianIdentity[]> {
	return api.guardian.getStudentGuardians(studentId) as Promise<
		GuardianIdentity[]
	>;
}

export async function getStudentAttendanceRows(
	studentId: string,
	_sinceIso: string,
) {
	const guardians = await api.guardian.getStudentGuardians(studentId);
	const guardianId = guardians[0]?.id;
	if (!guardianId) return [];
	const dashboard = await api.guardian.getDashboard(guardianId);
	const student = dashboard.students.find(
		(entry) => entry.studentId === studentId,
	);
	if (!student) return [];
	return [
		...Array.from({ length: student.attendance.present }, () => ({
			status: "present",
		})),
		...Array.from({ length: student.attendance.absent }, () => ({
			status: "absent",
		})),
		...Array.from({ length: student.attendance.late }, () => ({
			status: "late",
		})),
	];
}

export async function getStudentRecentGradesRows(studentId: string, limit = 5) {
	const guardians = await api.guardian.getStudentGuardians(studentId);
	const guardianId = guardians[0]?.id;
	if (!guardianId) return [];
	const dashboard = await api.guardian.getDashboard(guardianId);
	const student = dashboard.students.find(
		(entry) => entry.studentId === studentId,
	);
	return (student?.grades.latest || []).slice(0, limit).map((grade) => ({
		subject: grade.subject,
		grade: grade.grade,
		percentage: grade.percentage,
		created_at: grade.date,
		type: grade.type,
	}));
}

export async function getUpcomingAssignmentsRows(
	_classroomId: string,
	afterIso: string,
	_limit = 3,
) {
	void afterIso;
	return [];
}

export async function getGuardianNotificationsRows(
	guardianId: string,
	limit = 10,
) {
	const dashboard = await api.guardian.getDashboard(guardianId);
	return dashboard.notifications.slice(0, limit).map((notification) => ({
		id: notification.id,
		type: notification.type,
		title: notification.title,
		message: notification.message,
		is_read: notification.isRead,
		created_at: notification.createdAt,
		action_url: notification.actionUrl,
	}));
}

export async function getUpcomingSchoolEventsRows(
	afterIso: string,
	_limit = 5,
) {
	void afterIso;
	return [];
}
