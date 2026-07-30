import type { Task } from '@repo/core/types';
import { APIError } from '@repo/core/types/API';
import type { TeacherRepository } from '@repo/core/logic/domains/teacher/ports';

/**
 * TeacherManager
 *
 * Orchestrates teacher-specific logic like tasks and personal organization.
 */
export class TeacherManager {
  constructor(private repo: TeacherRepository) {}

  public tasks = {
    getAll: (teacherId: string) => this.repo.getTasks(teacherId),
    create: (title: string, teacherId: string, description?: string) =>
      this.repo.createTask(title, teacherId, description),
    updateStatus: (id: string, status: boolean) => this.repo.updateTaskStatus(id, status),
    update: (id: string, updates: Partial<Task>) => this.repo.updateTask(id, updates),
    delete: (id: string) => this.repo.deleteTask(id),
    getById: async (id: string) => {
      const task = await this.repo.getTaskById(id);
      if (!task) throw new APIError('Task not found', 'NOT_FOUND');
      return task;
    },
  };
}
