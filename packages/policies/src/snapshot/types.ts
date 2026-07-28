export interface UserContext {
  id: string;
  school_id?: string;
  capacity: string;
  active_bond_id: string;
  active_entity_id: string;
  active_entity_type: string;
  policy_version: string;
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
  activeBondId: string;
  activeEntityId: string;
  activeEntityType: string;
  schoolId: string | null;
  policyVersion: string;
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
  signature: string; // Ed25519 signature of the above using the server private key
}
