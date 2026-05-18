import { requireTeacherAccess } from '../lib/authorization';
import { type Task, type TeacherNote } from '../types';
import { teacher, teacherInsights } from '../logic/managers/factory';

// ============================================================================
// TASKS API
// ============================================================================

export const tasksAPI = {
  /**
   * Get all tasks for a teacher
   */
  async getAll(teacherId: string): Promise<Task[]> {
    await requireTeacherAccess(teacherId);
    return teacher.tasks.getAll(teacherId);
  },

  /**
   * Create a new task
   */
  async create(title: string, teacherId: string, description?: string): Promise<Task> {
    await requireTeacherAccess(teacherId);
    return teacher.tasks.create(title, teacherId, description);
  },

  /**
   * Update task completion status
   */
  async updateStatus(id: string, status: boolean): Promise<void> {
    return teacher.tasks.updateStatus(id, status);
  },

  /**
   * Update task details
   */
  async update(id: string, updates: Partial<Task>): Promise<Task> {
    // Note: Manager handles fetch for ownership check if needed, 
    // but here we follow the existing pattern of fetching and then requiring access.
    const task = await teacher.tasks.getById(id);
    await requireTeacherAccess(task.teacher_id);
    return teacher.tasks.update(id, updates);
  },

  /**
   * Delete a task
   */
  async delete(id: string): Promise<void> {
    return teacher.tasks.delete(id);
  },
};

// ============================================================================
// NOTES API (Teacher venting, reflections)
// ============================================================================

export const notesAPI = {
  /**
   * Get all private notes for a teacher.
   */
  async getAll(teacherId: string, type?: TeacherNote['type']): Promise<TeacherNote[]> {
    await requireTeacherAccess(teacherId);
    const data = await teacherInsights.listPrivateNotes(teacherId, type);
    return data.map(({ audit, visibility, ...note }) => note as TeacherNote);
  },

  /**
   * Create a private note.
   */
  async create(
    teacherId: string,
    content: string,
    type: TeacherNote['type'] = 'note',
  ): Promise<TeacherNote> {
    await requireTeacherAccess(teacherId);
    const data = await teacherInsights.createPrivateNote({
      teacherId,
      content,
      type,
    });
    const { audit, visibility, ...note } = data;
    return note as TeacherNote;
  },

  /**
   * Delete a private note.
   */
  async delete(id: string): Promise<void> {
    await teacherInsights.deletePrivateNote(id);
  },
};
