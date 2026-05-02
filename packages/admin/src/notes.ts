import { type PrincipalNote, principalNotesAPI } from "@repo/core/api";

export type { PrincipalNote };

export const notesAPI = {
	async listBySchool(schoolId: string): Promise<PrincipalNote[]> {
		return principalNotesAPI.getAll(schoolId);
	},

	async create(input: {
		school_id: string;
		content: string;
		note_type: PrincipalNote["note_type"];
		context_teacher_id?: string | null;
		context_classroom_id?: string | null;
	}): Promise<PrincipalNote> {
		return principalNotesAPI.create(input);
	},

	async update(
		id: string,
		updates: Partial<Pick<PrincipalNote, "content" | "is_pinned" | "is_done">>,
	): Promise<PrincipalNote> {
		return principalNotesAPI.update(id, updates);
	},

	async remove(id: string): Promise<void> {
		return principalNotesAPI.delete(id);
	},
};
