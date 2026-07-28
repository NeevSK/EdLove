export interface AuthRequest {
  principal: {
    type: string; // "teacher" | "student" | "principal" etc
    id: string;
    attributes: {
      school_id: string;
      active_entity_id?: string;
      active_entity_type?: string;
      capacity: string;
      classroom_ids?: string[];
      grade_id?: string;
      section_id?: string;
      child_student_ids?: string[];
      [key: string]: unknown;
    };
  };
  action: string; // "read" | "create" | "update" | "delete"
  resource: {
    type: string; // "Classroom" | "Grade" etc
    id: string;
    attributes: Record<string, unknown>;
  };
  context?: {
    now?: string; // ISO timestamp
    [key: string]: unknown;
  };
}

export interface AuthResponse {
  permitted: boolean;
  reason?: string; // which policy permitted/denied
  gaps?: string[]; // any GAP comments relevant to this decision
}
