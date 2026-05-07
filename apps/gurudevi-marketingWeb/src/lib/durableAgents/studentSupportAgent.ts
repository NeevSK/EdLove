import type { SupabaseClient } from "@supabase/supabase-js";
import {
	type DurableAgentSynthesisMode,
	synthesizeDurableAgentDraft,
} from "./llmProvider";

export type StudentSupportEvidenceScope = "attendance" | "grades" | "wellbeing";

export type StudentSupportRunMode = "demo" | "live";
export type StudentSupportDemoScenario =
	| "quiet-struggle"
	| "resilient-improver"
	| "wellbeing-watch";

export type StudentSupportContext = {
	runId: string;
	mode: StudentSupportRunMode;
	demoScenario?: StudentSupportDemoScenario;
	schoolId: string;
	classroomId: string;
	teacherId?: string | null;
	studentId: string;
	studentName?: string;
	requestedBy?: string | null;
	focusPrompt?: string;
	evidenceScopes: StudentSupportEvidenceScope[];
};

export type StudentSupportStudentContext = {
	studentId: string;
	studentName: string;
	classroomId: string;
	classroomName: string;
	schoolId: string | null;
	teacherId: string | null;
};

export type StudentAttendanceEvidence = {
	windowDays: number;
	totalRecords: number;
	presentCount: number;
	absentCount: number;
	lateCount: number;
	attendanceRate: number | null;
};

export type StudentGradesEvidence = {
	windowDays: number;
	totalGrades: number;
	averageMarks: number | null;
	latestMarks: number[];
};

export type StudentWellbeingEvidence = {
	windowDays: number;
	moodCheckins: number;
	averageMoodScore: number | null;
};

export type StudentSupportEvidence = {
	student: StudentSupportStudentContext;
	attendance?: StudentAttendanceEvidence;
	grades?: StudentGradesEvidence;
	wellbeing?: StudentWellbeingEvidence;
};

export const studentSupportDemoScenarios: Record<
	StudentSupportDemoScenario,
	{
		title: string;
		focusPrompt: string;
		evidenceScopes: StudentSupportEvidenceScope[];
		attendance?: StudentAttendanceEvidence;
		grades?: StudentGradesEvidence;
		wellbeing?: StudentWellbeingEvidence;
	}
> = {
	"quiet-struggle": {
		title: "Quiet Struggle",
		focusPrompt:
			"Draft a careful teacher-facing snapshot for a student who may need extra support without sounding alarmist.",
		evidenceScopes: ["attendance", "grades", "wellbeing"],
		attendance: {
			windowDays: 21,
			totalRecords: 21,
			presentCount: 15,
			absentCount: 4,
			lateCount: 2,
			attendanceRate: 71.4,
		},
		grades: {
			windowDays: 45,
			totalGrades: 6,
			averageMarks: 58.5,
			latestMarks: [61, 59, 57],
		},
		wellbeing: {
			windowDays: 14,
			moodCheckins: 6,
			averageMoodScore: 2.7,
		},
	},
	"resilient-improver": {
		title: "Resilient Improver",
		focusPrompt:
			"Draft a teacher-facing snapshot that recognizes steady student improvement and suggests one supportive next move.",
		evidenceScopes: ["attendance", "grades"],
		attendance: {
			windowDays: 21,
			totalRecords: 21,
			presentCount: 20,
			absentCount: 1,
			lateCount: 0,
			attendanceRate: 95.2,
		},
		grades: {
			windowDays: 45,
			totalGrades: 7,
			averageMarks: 74.8,
			latestMarks: [69, 75, 81],
		},
	},
	"wellbeing-watch": {
		title: "Wellbeing Watch",
		focusPrompt:
			"Draft a teacher-facing note that stays evidence-bound and invites a gentle check-in for this student.",
		evidenceScopes: ["attendance", "wellbeing"],
		attendance: {
			windowDays: 21,
			totalRecords: 21,
			presentCount: 17,
			absentCount: 2,
			lateCount: 2,
			attendanceRate: 81.0,
		},
		wellbeing: {
			windowDays: 14,
			moodCheckins: 5,
			averageMoodScore: 2.4,
		},
	},
};

export function getStudentSupportDemoScenario(
	scenario?: StudentSupportDemoScenario,
) {
	return studentSupportDemoScenarios[scenario ?? "quiet-struggle"];
}

function asPercent(value: number | null) {
	if (value === null || Number.isNaN(value)) return "unknown";
	return `${Math.round(value)}%`;
}

export async function loadStudentSupportContext(
	supabase: SupabaseClient,
	classroomId: string,
	studentId: string,
): Promise<StudentSupportStudentContext> {
	const [
		{ data: classroom, error: classroomError },
		{ data: student, error: studentError },
	] = await Promise.all([
		supabase
			.from("classrooms")
			.select("id, name, school_id, teacher_id")
			.eq("id", classroomId)
			.maybeSingle(),
		supabase
			.from("users")
			.select("id, full_name")
			.eq("id", studentId)
			.maybeSingle(),
	]);

	if (classroomError) throw classroomError;
	if (studentError) throw studentError;
	if (!classroom) {
		throw new Error(`Classroom ${classroomId} was not found.`);
	}

	return {
		studentId,
		studentName: student?.full_name ?? "Student",
		classroomId,
		classroomName: classroom.name,
		schoolId: classroom.school_id ?? null,
		teacherId: classroom.teacher_id ?? null,
	};
}

export async function loadStudentAttendanceEvidence(
	supabase: SupabaseClient,
	classroomId: string,
	studentId: string,
	windowDays = 21,
): Promise<StudentAttendanceEvidence> {
	const since = new Date(
		Date.now() - windowDays * 24 * 60 * 60 * 1000,
	).toISOString();

	const { data, error } = await supabase
		.from("attendance")
		.select("status, created_at")
		.eq("classroom_id", classroomId)
		.eq("student_id", studentId)
		.gte("created_at", since);

	if (error) throw error;

	let presentCount = 0;
	let absentCount = 0;
	let lateCount = 0;

	for (const row of data ?? []) {
		const status = String(row.status ?? "").toLowerCase();
		if (status === "present") presentCount++;
		else if (status === "absent") absentCount++;
		else if (status === "late") lateCount++;
	}

	const totalRecords = (data ?? []).length;
	const attendanceRate =
		totalRecords > 0 ? (presentCount / totalRecords) * 100 : null;

	return {
		windowDays,
		totalRecords,
		presentCount,
		absentCount,
		lateCount,
		attendanceRate,
	};
}

export async function loadStudentGradesEvidence(
	supabase: SupabaseClient,
	classroomId: string,
	studentId: string,
	windowDays = 45,
): Promise<StudentGradesEvidence> {
	const since = new Date(
		Date.now() - windowDays * 24 * 60 * 60 * 1000,
	).toISOString();

	const { data, error } = await supabase
		.from("grades")
		.select("marks, created_at")
		.eq("classroom_id", classroomId)
		.eq("student_id", studentId)
		.gte("created_at", since)
		.order("created_at", { ascending: false });

	if (error) throw error;

	const marks = (data ?? [])
		.map((row) => Number(row.marks))
		.filter((value) => Number.isFinite(value));

	return {
		windowDays,
		totalGrades: (data ?? []).length,
		averageMarks:
			marks.length > 0
				? marks.reduce((sum, value) => sum + value, 0) / marks.length
				: null,
		latestMarks: marks.slice(0, 3),
	};
}

export async function loadStudentWellbeingEvidence(
	supabase: SupabaseClient,
	studentId: string,
	windowDays = 14,
): Promise<StudentWellbeingEvidence> {
	const since = new Date(
		Date.now() - windowDays * 24 * 60 * 60 * 1000,
	).toISOString();

	const { data, error } = await supabase
		.from("mood_logs")
		.select("mood_score, occurred_at")
		.eq("user_id", studentId)
		.gte("occurred_at", since);

	if (error) throw error;

	const scores = (data ?? [])
		.map((row) => Number(row.mood_score))
		.filter((value) => Number.isFinite(value));

	return {
		windowDays,
		moodCheckins: (data ?? []).length,
		averageMoodScore:
			scores.length > 0
				? scores.reduce((sum, value) => sum + value, 0) / scores.length
				: null,
	};
}

export function buildDemoStudentSupportEvidence(
	context: StudentSupportContext,
): StudentSupportEvidence {
	const scenario = getStudentSupportDemoScenario(context.demoScenario);

	return {
		student: {
			studentId: context.studentId,
			studentName: context.studentName ?? "Nethmi Perera",
			classroomId: context.classroomId,
			classroomName: "Grade 7 Lotus",
			schoolId: context.schoolId,
			teacherId: context.teacherId ?? "33333333-3333-3333-3333-333333333333",
		},
		attendance: context.evidenceScopes.includes("attendance")
			? scenario.attendance
			: undefined,
		grades: context.evidenceScopes.includes("grades")
			? scenario.grades
			: undefined,
		wellbeing: context.evidenceScopes.includes("wellbeing")
			? scenario.wellbeing
			: undefined,
	};
}

export function buildDeterministicStudentSupportDraft(
	evidence: StudentSupportEvidence,
	focusPrompt?: string,
) {
	const lines: string[] = [
		`Student support snapshot for ${evidence.student.studentName} in ${evidence.student.classroomName}.`,
	];

	if (focusPrompt) {
		lines.push(`Focus: ${focusPrompt}`);
	}

	if (evidence.attendance) {
		lines.push(
			`Attendance across the last ${evidence.attendance.windowDays} days is ${asPercent(
				evidence.attendance.attendanceRate,
			)}, with ${evidence.attendance.absentCount} absences and ${evidence.attendance.lateCount} late marks.`,
		);
	}

	if (evidence.grades) {
		lines.push(
			`Recent grade evidence includes ${evidence.grades.totalGrades} scores with an average marks level of ${
				evidence.grades.averageMarks === null
					? "unknown"
					: evidence.grades.averageMarks.toFixed(1)
			}. The latest marks trend is ${
				evidence.grades.latestMarks.length > 0
					? evidence.grades.latestMarks.join(", ")
					: "not available"
			}.`,
		);
	}

	if (evidence.wellbeing) {
		lines.push(
			`Wellbeing signals show ${evidence.wellbeing.moodCheckins} mood check-ins with an average score of ${
				evidence.wellbeing.averageMoodScore === null
					? "unknown"
					: evidence.wellbeing.averageMoodScore.toFixed(1)
			}/5.`,
		);
	}

	lines.push(
		"Suggested next move: do one quiet teacher check-in, confirm whether the current pattern is temporary or persistent, and decide if a gentle classroom support adjustment would help.",
	);
	lines.push("This is a draft for human review, not an automated judgment.");

	return lines.join("\n\n");
}

export async function synthesizeStudentSupportDraft(
	evidence: StudentSupportEvidence,
	focusPrompt?: string,
): Promise<{
	summaryDraft: string;
	synthesisMode: DurableAgentSynthesisMode;
}> {
	return synthesizeDurableAgentDraft({
		systemPrompt:
			"You are drafting a teacher-facing student support snapshot for internal review. Be warm, specific, non-diagnostic, and evidence-bound. Never overclaim. Keep it under 200 words and end with one careful next move.",
		userPayload: {
			focusPrompt: focusPrompt ?? null,
			evidence,
			output_shape: {
				style: "two short paragraphs",
				end_with: "one suggested next move",
				note: "state clearly that this is a draft for human review",
			},
		},
		deterministicFallback: buildDeterministicStudentSupportDraft(
			evidence,
			focusPrompt,
		),
	});
}
