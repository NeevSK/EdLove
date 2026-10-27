import { orpcClient } from '@repo/core/api/orpcClient';
import type { StudentEcho } from '@repo/core/api/echo.contract';
import { createResonantProxy } from '@repo/core/api/resonantProxy';
import { APIError } from '@repo/core/types/API';

const rawEchoAPI = {
  /**
   * Send an echo (feedback) from a student to their class teacher.
   */
  async sendEcho(echo: {
    classroom_id: string;
    school_id?: string;
    content: string;
    is_anonymous: boolean;
  }): Promise<StudentEcho> {
    try {
      const data = await orpcClient.echo.sendEcho({
        body: {
          classroomId: echo.classroom_id,
          content: echo.content,
          isAnonymous: echo.is_anonymous,
        },
      });
      return data as StudentEcho;
    } catch (error: any) {
      throw new APIError(error?.message || 'Failed to send echo', error?.code || 'ECHO_SEND_FAILED');
    }
  },

  /**
   * Fetch echoes for a student (their own feedback history).
   */
  async getMyEchoes(): Promise<StudentEcho[]> {
    try {
      const data = await orpcClient.echo.getMyEchoes({});
      return data as StudentEcho[];
    } catch (error: any) {
      throw new APIError(error?.message || 'Failed to fetch your echoes', error?.code || 'ECHO_FETCH_FAILED');
    }
  },

  /**
   * Fetch echoes for a classroom (Unified for student and teacher context).
   */
  async getEchoesByClassroom(classroomId: string): Promise<StudentEcho[]> {
    try {
      const data = await orpcClient.echo.getEchoesByClassroom({
        params: { classroomId },
      });
      return data as StudentEcho[];
    } catch (error: any) {
      throw new APIError(error?.message || 'Failed to fetch classroom echoes', error?.code || 'CLASSROOM_ECHOES_FAILED');
    }
  },

  /**
   * Fetch echoes for a teacher (feedback from their students).
   */
  async getTeacherEchoes(classroomId: string): Promise<StudentEcho[]> {
    try {
      const data = await orpcClient.echo.getTeacherEchoes({
        params: { classroomId },
      });
      return data as StudentEcho[];
    } catch (error: any) {
      throw new APIError(error?.message || 'Failed to fetch student echoes', error?.code || 'TEACHER_ECHOES_FAILED');
    }
  },

  /**
   * Respond to an echo (Teacher action).
   */
  async respondToEcho(echoId: string, response: string): Promise<StudentEcho> {
    try {
      const data = await orpcClient.echo.respondToEcho({
        params: { echoId },
        body: { response },
      });
      return data as StudentEcho;
    } catch (error: any) {
      throw new APIError(error?.message || 'Failed to respond to echo', error?.code || 'ECHO_RESPOND_FAILED');
    }
  },

  /**
   * Mark an echo as read without responding.
   */
  async markAsRead(echoId: string): Promise<void> {
    try {
      await orpcClient.echo.markAsRead({
        params: { echoId },
      });
    } catch (error: any) {
      throw new APIError(error?.message || 'Failed to mark echo as read', error?.code || 'ECHO_MARK_READ_FAILED');
    }
  },
};

export const echoAPI = createResonantProxy('echo', rawEchoAPI);

import { isEmptyArray, registerSandboxDomain } from '@repo/core/api/sandboxDataset';
import { MOCK_ECHOES } from '@repo/core/api/mockData';

registerSandboxDomain({
  domain: 'echo',
  ghostMethods: ['getTeacherEchoes', 'getEchoesByClassroom', 'getMyEchoes'],
  isEmpty: (_, d) => isEmptyArray(d),
  getSamples: () => MOCK_ECHOES,
});

registerSandboxDomain({
  domain: 'echoes',
  ghostMethods: ['getTeacherEchoes', 'getEchoesByClassroom', 'getMyEchoes'],
  isEmpty: (_, d) => isEmptyArray(d),
  getSamples: () => MOCK_ECHOES,
});
