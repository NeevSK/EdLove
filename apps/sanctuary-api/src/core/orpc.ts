import { os } from '@orpc/server';
import type { createZenStackDb } from '@repo/database/client';

export interface ORPCContext {
  db?: ReturnType<typeof createZenStackDb>;
  user: { id: string };
  schoolId?: string;
  capacity?: string | null;
  activeBondId?: string | null;
  activeEntityId?: string | null;
  activeEntityType?: string | null;
  requestId: string;
  requestPath?: string;
  requestMethod?: string;
  traceId?: string;
  principal?: {
    id: string;
    type: string;
    attributes: {
      school_id: string;
      active_entity_id: string;
      active_entity_type: string;
      capacity: string;
      grade_id?: string;
      section_id?: string;
      classroom_ids?: string[];
      child_student_ids?: string[];
    };
  };
  securityContext?: {
    device_trust: string;
    network_zone: string;
  };
  timing?: {
    start: (name: string) => void;
    end: (name: string) => void;
  };
}

// Initialize the oRPC builder with strongly-typed context
export const o = os.$context<ORPCContext>();

export interface ProcedureMeta {
  policy?: {
    action: string;
    subject: string;
  };
  entitlement?: {
    modulesAllOf?: string[];
    scope?: 'individual' | 'active_bond' | 'active_entity';
  };
}
