export interface UserContext {
  id: string;
  school_id: string;
  capacity: string;
  classroom_ids?: string[];
  grade_id?: string;
  section_id?: string;
  child_student_ids?: string[];
  [key: string]: unknown;
}

export interface PermissionSnapshot {
  generatedAt: string; // server ISO timestamp
  expiresAt: string; // generatedAt + 24h
  userId: string;
  schoolId: string;
  permissions: {
    [resourceType: string]: {
      [action: string]: boolean;
    };
  };
  temporalHints: {
    [resourceId: string]: {
      deadline?: string; // ISO timestamp
      availableFrom?: string;
    };
  };
  signature: string; // HMAC of the above using server secret
}
