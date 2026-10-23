import { SafeZustandStorage } from '@repo/core/lib/storageWrapper';
import { handleAPIError } from '@repo/core/logic';

export interface TeacherSentEcho {
  id: string;
  category: string;
  content: string;
  priority: string;
  is_read: boolean;
  principal_response?: string;
  responded_at?: string;
  created_at: string;
}

async function getEchoes(teacherId: string): Promise<TeacherSentEcho[]> {
  try {
    const raw = await SafeZustandStorage.getItem(`teacher_echoes:${teacherId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

async function setEchoes(teacherId: string, echoes: TeacherSentEcho[]): Promise<void> {
  await SafeZustandStorage.setItem(`teacher_echoes:${teacherId}`, JSON.stringify(echoes));
}

export const teacherFeedbackAPI = {
  async submitTeacherFeedback(input: {
    schoolId: string;
    teacherId: string;
    category: string;
    content: string;
    priority: 'low' | 'medium' | 'high';
  }): Promise<boolean> {
    try {
      const all = await getEchoes(input.teacherId);
      const newEcho: TeacherSentEcho = {
        id: `echo_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        category: input.category,
        content: input.content,
        priority: input.priority,
        is_read: false,
        created_at: new Date().toISOString(),
      };
      all.unshift(newEcho);
      await setEchoes(input.teacherId, all);
      return true;
    } catch (error) {
      handleAPIError(error);
      return false;
    }
  },

  async listSentEchoes(teacherId: string, limit = 10): Promise<TeacherSentEcho[]> {
    if (!teacherId) return [];
    try {
      const all = await getEchoes(teacherId);
      return all.slice(0, limit);
    } catch (error) {
      handleAPIError(error);
      return [];
    }
  },
};
