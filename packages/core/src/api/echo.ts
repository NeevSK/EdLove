import { type AppType, createSovereignClient, SOVEREIGN_API_URL } from '@repo/core/api/base';
import { echoContract, type StudentEcho } from '@repo/core/api/echo.contract';
import { identityAPI } from '@repo/core/api/identity';
import { APIError } from '@repo/core/types/API';

const client = createSovereignClient<AppType>(SOVEREIGN_API_URL);

export const echoAPI = {
  /**
   * Send an echo (feedback) from a student to their class teacher.
   */
  async sendEcho(echo: {
    classroom_id: string;
    school_id?: string;
    content: string;
    is_anonymous: boolean;
  }): Promise<StudentEcho> {
    const identity = await identityAPI.identifyActiveCitizen();
    if (!identity) throw new APIError('Not authenticated', 'AUTH_REQUIRED');

    const response = await (client.api as any).echoes.$post({
      json: {
        classroomId: echo.classroom_id,
        content: echo.content,
        isAnonymous: echo.is_anonymous,
      },
    });
    if (!response.ok) throw new APIError('Failed to send echo', response.status.toString());
    return (await response.json()) as StudentEcho;
  },

  /**
   * Fetch echoes for a student (their own feedback history).
   */
  async getMyEchoes(): Promise<StudentEcho[]> {
    const identity = await identityAPI.identifyActiveCitizen();
    if (!identity) throw new APIError('Not authenticated', 'AUTH_REQUIRED');

    const response = await (client.api as any).echoes.mine.$get();
    if (!response.ok) throw new APIError('Failed to fetch your echoes', response.status.toString());
    return (await response.json()) as StudentEcho[];
  },

  /**
   * Fetch echoes for a classroom (Unified for student and teacher context).
   */
  async getEchoesByClassroom(classroomId: string): Promise<any[]> {
    const identity = await identityAPI.identifyActiveCitizen();
    if (!identity) throw new APIError('Not authenticated', 'AUTH_REQUIRED');

    const response = await (client.api as any).echoes.classrooms[':classroomId'].$get({
      param: { classroomId },
    });
    if (!response.ok)
      throw new APIError('Failed to fetch classroom echoes', response.status.toString());
    return (await response.json()) as StudentEcho[];
  },

  /**
   * Fetch echoes for a teacher (feedback from their students).
   */
  async getTeacherEchoes(classroomId: string): Promise<StudentEcho[]> {
    const response = await (client.api as any).echoes.classrooms[':classroomId'].teacher.$get({
      param: { classroomId },
    });
    if (!response.ok)
      throw new APIError('Failed to fetch student echoes', response.status.toString());
    return (await response.json()) as StudentEcho[];
  },

  /**
   * Respond to an echo (Teacher action).
   */
  async respondToEcho(echoId: string, response: string): Promise<StudentEcho> {
    const identity = await identityAPI.identifyActiveCitizen();
    if (!identity) throw new APIError('Not authenticated', 'AUTH_REQUIRED');

    const result = await (client.api as any).echoes[':echoId'].response.$patch({
      param: { echoId },
      json: { response },
    });
    if (!result.ok) throw new APIError('Failed to respond to echo', result.status.toString());
    return (await result.json()) as StudentEcho;
  },

  /**
   * Mark an echo as read without responding.
   */
  async markAsRead(echoId: string): Promise<void> {
    const result = await (client.api as any).echoes[':echoId'].read.$patch({ param: { echoId } });
    if (!result.ok) throw new APIError('Failed to mark echo as read', result.status.toString());
  },
};

void echoContract;
