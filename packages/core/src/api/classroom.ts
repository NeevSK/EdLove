import { 
  createSovereignClient, 
  SOVEREIGN_API_URL, 
  type AppType 
} from './base';
import { APIError } from '../types/API';

/**
 * LESSONS & STUDENTS API (Sovereign RPC Proxy)
 * 
 * Siphons lesson and student management to Sanctuary API.
 */

const client = createSovereignClient<AppType>(SOVEREIGN_API_URL);

export const lessonsAPI = {
  async create(lesson: any) {
    const res = await client.api.educational.lessons.$post({
      json: lesson,
    });

    if (!res.ok) {
      throw new APIError('Failed to create lesson', res.status.toString());
    }

    return await res.json();
  },
};

// ... (Students API remains on local manager for now until educational.contract is fully expanded)
export const studentsAPI = {
  async getAll(_classroomId: string) {
    // This is a placeholder until the contract covers student enrollment
    return [];
  },
};
