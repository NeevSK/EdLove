import { os } from '@orpc/server';
import { z } from 'zod';
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

import { implement as baseImplement } from '@orpc/server';
import { oc } from '@orpc/contract';

/**
 * toORPCContract
 * Translates a SovereignContract or a mock contract stub (empty objects) into a valid oRPC contract
 * by mapping standard OpenAPI routes to oRPC ContractProcedure instances via oc.route.
 */
function transformSchema(schema: z.ZodTypeAny): z.ZodTypeAny {
  if (schema instanceof z.ZodObject) {
    const shape = schema.shape;
    const newShape: any = {};
    for (const [key, val] of Object.entries(shape)) {
      newShape[key] = (val as z.ZodTypeAny).optional();
      if (key.includes('_')) {
        const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
        newShape[camelKey] = (val as z.ZodTypeAny).optional();
      }
      const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      if (snakeKey !== key) {
        newShape[snakeKey] = (val as z.ZodTypeAny).optional();
      }
      if (key === 'userId' || key === 'user_id') {
        newShape[key] = (val as z.ZodTypeAny).optional();
      }
    }
    
    const baseObject = z.object(newShape).passthrough();
    return z.preprocess((input: any) => {
      if (input && typeof input === 'object') {
        const result = { ...input };
        for (const key of Object.keys(input)) {
          if (key.includes('_')) {
            const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
            if (result[camelKey] === undefined) {
              result[camelKey] = input[key];
            }
          } else {
            const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
            if (snakeKey !== key && result[snakeKey] === undefined) {
              result[snakeKey] = input[key];
            }
          }
        }
        
        const hasIdInSchema = 'id' in shape;
        if (hasIdInSchema && result.id === undefined) {
          const idKeys = Object.keys(result).filter(k => k.endsWith('Id') && k !== 'id');
          if (idKeys.length === 1) {
            result.id = result[idKeys[0]];
          }
        }
        return result;
      }
      return input;
    }, baseObject).superRefine((val, ctx) => {
      const res = baseObject.safeParse(val);
      if (!res.success) {
        console.error('SERVER-SIDE ZOD ERROR:', JSON.stringify(res.error.format()));
      }
    });
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

export function toORPCContract(contract: any, prefix = ''): any {
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
        let builder = oc.route({
          method: route.method.toUpperCase() as any,
          path: route.path,
        });

        if (route.metadata) {
          builder = builder.meta(route.metadata);
        }

        const schemas = [
          route.request?.params,
          route.request?.query,
          route.request?.body,
        ].filter(Boolean);

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
        if (key.startsWith('create') || key.startsWith('submit') || key.startsWith('add') || key.startsWith('send') || key.startsWith('join') || key.startsWith('record') || key.startsWith('engage')) {
          action = 'create';
        } else if (key.startsWith('update') || key.startsWith('patch') || key.startsWith('put') || key.startsWith('edit') || key.startsWith('grade') || key.startsWith('approve')) {
          action = 'update';
        } else if (key.startsWith('delete') || key.startsWith('remove') || key.startsWith('revoke')) {
          action = 'delete';
        }

        let subject = 'Classroom';
        const lowerPrefix = inferred.toLowerCase();
        if (lowerPrefix.includes('library')) subject = 'Library';
        else if (lowerPrefix.includes('profile') || lowerPrefix.includes('self')) subject = 'User';
        else if (lowerPrefix.includes('community')) subject = 'Post';

        if (key.includes('Material')) subject = 'Material';
        else if (key.includes('Submission') || key === 'submitAssignment') subject = 'AssignmentSubmission';
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
    }
  });
}

export function implement(contract: any, config?: any): {
  $context<U>(): any;
} {
  return baseImplement(toORPCContract(contract) as any, config) as any;
}

