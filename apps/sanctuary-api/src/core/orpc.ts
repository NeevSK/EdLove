import { implement as baseImplement, os } from '@orpc/server';
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

      // oRPC's implementer probes these control members before its outer
      // proxy supplies the implementation API. They are not contract routes.
      if (
        key === 'then' ||
        key === 'constructor' ||
        key === '$context' ||
        key === '$config' ||
        key === 'router' ||
        key === 'lazy'
      ) {
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

        const request = route.request as
          | {
              params?: z.ZodTypeAny;
              query?: z.ZodTypeAny;
              body?: z.ZodTypeAny;
            }
          | undefined;
        if (request) {
          const envelope: Record<string, z.ZodTypeAny> = {};
          for (const key of ['params', 'query', 'body'] as const) {
            const schema = request[key];
            if (!schema) continue;
            const transformed = transformSchema(schema);
            // A declared transport channel is always explicit. Making an
            // all-optional query/body schema optional lets flattened input
            // bypass the canonical envelope and reach handlers as undefined.
            envelope[key] = transformed;
          }
          if (Object.keys(envelope).length > 0) {
            return builder.input(z.object(envelope)) as any;
          }
        }

        return builder;
      }

      // Contracts are a security boundary. A missing member must fail during
      // composition rather than becoming a guessed, schema-less route.
      if (!val) {
        throw new Error(
          `oRPC contract member "${key}" is missing under "${inferred || '/'}". ` +
            'Declare an explicit contract with input, output, and policy metadata.',
        );
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
