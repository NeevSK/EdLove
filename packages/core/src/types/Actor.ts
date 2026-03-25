import type { CapabilityKey } from './Policy';
import type { ScopeRef } from './Tenancy';

export type ActorType =
  | 'user'
  | 'guardian'
  | 'supplier'
  | 'ministry_officer'
  | 'service_provider'
  | 'alumni'
  | 'community_partner'
  | 'organization';

export interface ContactChannel {
  type: 'email' | 'phone' | 'whatsapp' | 'address' | 'portal';
  value: string;
  label?: string;
  primary?: boolean;
}

export interface ActorRelationship {
  id?: string;
  actorId: string;
  relatedActorId: string;
  relationshipType:
    | 'guardian_of'
    | 'supplier_to'
    | 'reports_to'
    | 'member_of'
    | 'partner_of'
    | 'regulated_by';
  schoolId?: string | null;
  scopes?: ScopeRef[];
  status?: 'active' | 'inactive' | 'pending';
}

export interface Actor {
  id: string;
  actorType: ActorType;
  displayName: string;
  personOrOrg: 'person' | 'organization';
  schoolRelationships: ActorRelationship[];
  scopedCapabilities?: CapabilityKey[];
  contactChannels?: ContactChannel[];
  metadata?: Record<string, unknown>;
}
