import type { Task } from '../../../types';

export interface TeacherRepository {
  getTasks(teacherId: string): Promise<Task[]>;
  createTask(title: string, teacherId: string, description?: string): Promise<Task>;
  updateTaskStatus(id: string, status: boolean): Promise<void>;
  updateTask(id: string, updates: Partial<Task>): Promise<Task>;
  deleteTask(id: string): Promise<void>;
  getTaskById(id: string): Promise<Task | null>;
}
