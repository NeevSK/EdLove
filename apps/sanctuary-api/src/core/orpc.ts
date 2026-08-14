import { os } from '@orpc/server';
import type { createZenStackDb } from '@repo/database/client';
import { z } from 'zod';

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

import { oc } from '@orpc/contract';
import { implement as baseImplement } from '@orpc/server';

/**
 * toORPCContract
 * Translates a SovereignContract or a mock contract stub (empty objects) into a valid oRPC contract
 * by mapping standard OpenAPI routes to oRPC ContractProcedure instances via oc.route.
 */
function transformSchema(schema: z.ZodTypeAny): z.ZodTypeAny {
  if (schema instanceof z.ZodObject) {
    const shape = schema.shape;
    // Normalize aliases before parsing the original schema. The previous
    // implementation cloned every field as optional and only logged parse
    // failures, allowing malformed requests to reach handlers. Required
    // fields must remain required at the transport boundary.
    return z.preprocess((input: any) => {
      if (input && typeof input === 'object') {
        const result = { ...input };
        for (const key of Object.keys(shape)) {
          const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
          const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
          if (result[key] === undefined && result[snakeKey] !== undefined) {
            result[key] = result[snakeKey];
          }
          if (result[key] === undefined && result[camelKey] !== undefined) {
            result[key] = result[camelKey];
          }
        }

        const hasIdInSchema = 'id' in shape;
        if (hasIdInSchema && result.id === undefined) {
          const idKeys = Object.keys(result).filter((k) => k.endsWith('Id') && k !== 'id');
          if (idKeys.length === 1) {
            result.id = result[idKeys[0]];
          }
        }
        return result;
      }
      return input;
    }, schema.passthrough());
  }
  return schema;
}

function inferContractPrefix(contract: any): string {
  if (contract && typeof contract === 'object') {
    for (const val of Object.values(contract)) {
      if (val && typeof val === 'object' && 'path' in val && typeof val.path === 'string') {
        const segments = val.path.split('/').filter(Boolean);
        if (segments.length > 0) {
          return '/' + segments[0];
        }
      }
    }
  }
  return '';
}

function assertExplicitPolicyMetadata(contract: any): void {
  if (!contract || typeof contract !== 'object') return;
  for (const [key, value] of Object.entries(contract)) {
    if (!value || typeof value !== 'object') continue;
    if ('method' in value && 'path' in value) {
      const route = value as { path?: unknown; metadata?: { policy?: unknown } };
      if (!route.metadata?.policy) {
        throw new Error(
          `Protected oRPC contract route "${String(route.path)}" (key "${key}") is missing explicit policy metadata`,
        );
      }
      continue;
    }
    assertExplicitPolicyMetadata(value);
  }
}

export function toORPCContract(contract: any, prefix = ''): any {
  if (!prefix) assertExplicitPolicyMetadata(contract);
  const inferred = prefix || inferContractPrefix(contract);
  return new Proxy(contract, {
    get(target, key) {
      if (typeof key !== 'string') {
        return Reflect.get(target, key);
      }

      if (key === 'then' || key === 'constructor') {
        return undefined;
      }

      const val = target[key];
      if (val && typeof val === 'object' && '~orpc' in val) {
        return val;
      }

      // If it's a route definition:
      if (val && typeof val === 'object' && 'method' in val && 'path' in val) {
        const route = val as any;
        if (!route.metadata?.policy) {
          throw new Error(
            `Protected oRPC contract route "${String(route.path)}" is missing explicit policy metadata`,
          );
        }
        let builder = oc.route({
          method: route.method.toUpperCase() as any,
          path: route.path,
        });

        builder = builder.meta(route.metadata);

        const schemas = [route.request?.params, route.request?.query, route.request?.body].filter(
          Boolean,
        );

        if (schemas.length > 0) {
          let combined = schemas[0];
          for (let i = 1; i < schemas.length; i++) {
            if (combined instanceof z.ZodObject && schemas[i] instanceof z.ZodObject) {
              combined = combined.merge(schemas[i]);
            } else {
              combined = z.intersection(combined, schemas[i]);
            }
          }
          combined = transformSchema(combined);
          return builder.input(combined) as any;
        }

        return builder;
      }

      // Fallback for missing keys in mock contract definitions
      if (!val) {
        let action = 'read';
        if (
          key.startsWith('create') ||
          key.startsWith('submit') ||
          key.startsWith('add') ||
          key.startsWith('send') ||
          key.startsWith('join') ||
          key.startsWith('record') ||
          key.startsWith('engage')
        ) {
          action = 'create';
        } else if (
          key.startsWith('update') ||
          key.startsWith('patch') ||
          key.startsWith('put') ||
          key.startsWith('edit') ||
          key.startsWith('grade') ||
          key.startsWith('approve')
        ) {
          action = 'update';
        } else if (
          key.startsWith('delete') ||
          key.startsWith('remove') ||
          key.startsWith('revoke')
        ) {
          action = 'delete';
        }

        let subject = 'Classroom';
        const lowerPrefix = inferred.toLowerCase();
        if (lowerPrefix.includes('library')) subject = 'Library';
        else if (lowerPrefix.includes('profile') || lowerPrefix.includes('self')) subject = 'User';
        else if (lowerPrefix.includes('community')) subject = 'Post';

        if (key.includes('Material')) subject = 'Material';
        else if (key.includes('Submission') || key === 'submitAssignment')
          subject = 'AssignmentSubmission';
        else if (key.includes('Assignment')) subject = 'Assignment';
        else if (key.includes('Group')) subject = 'Group';
        else if (key.includes('Post')) subject = 'Post';
        else if (key.includes('School')) subject = 'School';

        const policy = { action, subject };

        const routePath = (inferred ? `${inferred}/${key}` : `/${key}`) as `/${string}`;
        let builder = oc.route({
          method: 'POST',
          path: routePath,
        });
        builder = builder.meta({ policy });
        return builder;
      }

      // Recursively wrap sub-routers:
      if (typeof val === 'object') {
        const nextPrefix = inferred ? `${inferred}/${key}` : `/${key}`;
        return toORPCContract(val, nextPrefix);
      }

      return oc;
    },
    ownKeys(target) {
      return Reflect.ownKeys(target);
    },
    getOwnPropertyDescriptor(target, prop) {
      return Reflect.getOwnPropertyDescriptor(target, prop);
    },
  });
}

export function implement(
  contract: any,
  config?: any,
): {
  $context<U>(): any;
} {
  return baseImplement(toORPCContract(contract) as any, config) as any;
}
