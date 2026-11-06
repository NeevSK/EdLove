import { createHash, randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { AuthRequest, AuthResponse } from '@repo/policies/engine/types';

const packageUrl = import.meta.resolve('@repo/policies/package.json');
const require = createRequire(packageUrl);
const { statefulIsAuthorized, preparseSchema, preparsePolicySet, schemaToJson, validate } =
  require('@cedar-policy/cedar-wasm/nodejs') as typeof import('@cedar-policy/cedar-wasm/nodejs');

const srcDir = fileURLToPath(new URL('./src/', packageUrl));

// 1. Initialize and Cache Schema and Policies at Startup (Singleton pattern)
let schemaJson: any = null;
let concatenatedPolicies = '';
let policyVersion = '';
const gapsMap: Record<string, string[]> = {};
const cachePrefix = `role-engine:${randomUUID()}`;
let activeSlot = 0;
let compiledGeneration = '';

function prepareGeneration(schema: Parameters<typeof preparseSchema>[1], policies: string) {
  // Two slots bound WASM cache growth and keep the active pair intact if a reload fails.
  const nextSlot = 1 - activeSlot;
  const key = `${cachePrefix}:${nextSlot}`;
  if (
    preparseSchema(key, schema).type !== 'success' ||
    preparsePolicySet(key, { staticPolicies: policies }).type !== 'success'
  ) {
    throw new Error('Failed to compile Cedar policy generation');
  }
  activeSlot = nextSlot;
  compiledGeneration = key;
}

// Fingerprint of exactly what the engine evaluates. Offline snapshots carry it, and
// clients reject a snapshot whose version differs from the current one.
const fingerprint = (schema: unknown, policies: string) =>
  `sha256:${createHash('sha256').update(JSON.stringify(schema)).update('\n').update(policies).digest('hex')}`;

try {
  const schemaPath = join(srcDir, 'schema', 'schema.cedarschema');
  const rawSchemaText = readFileSync(schemaPath, 'utf8');
  const schemaParse = schemaToJson(rawSchemaText);
  if (schemaParse.type === 'success') {
    schemaJson = schemaParse.json;
  } else {
    throw new Error('Failed to parse Cedar schema: ' + JSON.stringify(schemaParse.errors));
  }

  const policyFiles = [
    'platform/admin.cedar',
    'platform/ai.cedar',
    'platform/editorial.cedar',
    'school/principal.cedar',
    'school/assistantPrincipal.cedar',
    'school/teacher.cedar',
    'school/gradeHead.cedar',
    'school/sectionHead.cedar',
    'school/student.cedar',
    'school/parent.cedar',
    'school/staff.cedar',
    'guest/personal.cedar',
    'platform/dataBoundaries.cedar',
  ];

  const policyTexts: string[] = [];

  for (const file of policyFiles) {
    const filePath = join(srcDir, 'policies', file);
    const content = readFileSync(filePath, 'utf8');
    policyTexts.push(content);

    // Dynamically extract GAP comments from the policy file
    const actorName = file.split('/').pop()?.replace('.cedar', '');
    if (actorName) {
      const gaps: string[] = [];
      const lines = content.split('\n');
      for (const line of lines) {
        if (line.includes('GAP:')) {
          const gapComment = line.substring(line.indexOf('GAP:')).trim();
          gaps.push(gapComment);
        }
      }
      if (gaps.length > 0) {
        gapsMap[actorName] = gaps;
      }
    }
  }

  const initialPolicies = policyTexts.join('\n\n');
  const validation = validate({
    schema: schemaJson,
    policies: { staticPolicies: initialPolicies },
  });
  if (validation.type !== 'success' || validation.validationErrors.length > 0) {
    throw new Error('Failed to validate Cedar policies against the schema');
  }
  prepareGeneration(schemaJson, initialPolicies);
  concatenatedPolicies = initialPolicies;
  policyVersion = fingerprint(schemaJson, initialPolicies);
} catch (error) {
  throw new Error('CEDAR_POLICY_INITIALIZATION_FAILED', { cause: error });
}

/**
 * Reinitialize Cedar schema and policies from disk.
 * Test helper to pick up schema/policy changes without process restart.
 */
export function reinitializeCedar(): void {
  try {
    const schemaPath = join(srcDir, 'schema', 'schema.cedarschema');
    const rawSchemaText = readFileSync(schemaPath, 'utf8');
    const schemaParse = schemaToJson(rawSchemaText);
    if (schemaParse.type !== 'success') {
      throw new Error('Failed to parse Cedar schema: ' + JSON.stringify(schemaParse.errors));
    }
    const nextSchema = schemaParse.json;

    const policyFiles = [
      'platform/admin.cedar',
      'platform/ai.cedar',
      'platform/editorial.cedar',
      'school/principal.cedar',
      'school/assistantPrincipal.cedar',
      'school/teacher.cedar',
      'school/gradeHead.cedar',
      'school/sectionHead.cedar',
      'school/student.cedar',
      'school/parent.cedar',
      'school/staff.cedar',
      'guest/personal.cedar',
      'platform/dataBoundaries.cedar',
    ];

    const policyTexts: string[] = [];
    const nextGapsMap: Record<string, string[]> = {};

    for (const file of policyFiles) {
      const filePath = join(srcDir, 'policies', file);
      const content = readFileSync(filePath, 'utf8');
      policyTexts.push(content);

      const actorName = file.split('/').pop()?.replace('.cedar', '');
      if (actorName) {
        const gaps: string[] = [];
        const lines = content.split('\n');
        for (const line of lines) {
          if (line.includes('GAP:')) {
            const gapComment = line.substring(line.indexOf('GAP:')).trim();
            gaps.push(gapComment);
          }
        }
        if (gaps.length > 0) {
          nextGapsMap[actorName] = gaps;
        }
      }
    }

    const nextPolicies = policyTexts.join('\n\n');
    const validation = validate({ schema: nextSchema, policies: { staticPolicies: nextPolicies } });
    if (validation.type !== 'success' || validation.validationErrors.length > 0) {
      throw new Error('Failed to validate Cedar policies against the schema');
    }
    prepareGeneration(nextSchema, nextPolicies);
    schemaJson = nextSchema;
    concatenatedPolicies = nextPolicies;
    policyVersion = fingerprint(nextSchema, nextPolicies);
    Object.assign(gapsMap, nextGapsMap);
  } catch (error) {
    console.error('CRITICAL: Failed to reinitialize Cedar policy engine:', error);
  }
}

/** The version of the loaded policy set, as `sha256:<hex>`. */
export function cedarPolicyVersion(): string {
  if (!policyVersion) throw new Error('Cedar engine was not properly initialized');
  return policyVersion;
}

/**
 * Clean check() function. Runs a request against the cached Cedar engine.
 * Log denied decisions at WARN level for audit trail.
 */
export function check(request: AuthRequest): AuthResponse {
  try {
    if (!schemaJson || !concatenatedPolicies) {
      throw new Error('Cedar engine was not properly initialized');
    }

    // Build principal entity with concrete attributes from AuthRequest
    const principalEntity = {
      uid: { type: 'User', id: request.principal.id },
      attrs: {
        id: request.principal.id,
        school_id: request.principal.attributes.school_id,
        ...(request.principal.attributes.active_entity_id !== undefined && {
          active_entity_id: request.principal.attributes.active_entity_id,
        }),
        ...(request.principal.attributes.active_entity_type !== undefined && {
          active_entity_type: request.principal.attributes.active_entity_type,
        }),
        capacity: request.principal.attributes.capacity,
        ...(request.principal.attributes.grade_id && {
          grade_id: request.principal.attributes.grade_id,
        }),
        ...(request.principal.attributes.section_id && {
          section_id: request.principal.attributes.section_id,
        }),
        classroom_ids: request.principal.attributes.classroom_ids || [],
        child_student_ids: request.principal.attributes.child_student_ids || [],
      },
      parents: [],
    };

    // Build resource entity
    const resourceAttrs: Record<string, any> = {
      ...request.resource.attributes,
      id: request.resource.id,
    };
    if (request.resource.type === 'User') {
      if (resourceAttrs.school_id === undefined) resourceAttrs.school_id = '';
      if (resourceAttrs.capacity === undefined) resourceAttrs.capacity = 'student';
    }

    const resourceEntity = {
      uid: { type: request.resource.type, id: request.resource.id },
      attrs: resourceAttrs,
      parents: [],
    };

    // Map custom domain actions to standard Cedar CRUD actions
    let mappedAction = request.action;
    switch (mappedAction) {
      case 'resolve':
        mappedAction = 'read';
        break;
      case 'grade':
        mappedAction = request.resource.type === 'GradeMark' ? 'grade' : 'create';
        break;
      case 'submit':
        mappedAction = 'create';
        break;
      case 'publish':
        mappedAction = request.resource.type === 'GradeMark' ? 'publish' : 'update';
        break;
      case 'override':
      case 'verify':
      case 'manage':
        mappedAction = 'update';
        break;
    }

    // Call Cedar WebAssembly function
    const authResult = statefulIsAuthorized({
      principal: { type: 'User', id: request.principal.id },
      action: { type: 'Action', id: mappedAction },
      resource: { type: request.resource.type, id: request.resource.id },
      context: (request.context as Record<string, any>) || {},
      preparsedSchemaName: compiledGeneration,
      preparsedPolicySetId: compiledGeneration,
      entities:
        principalEntity.uid.type === resourceEntity.uid.type &&
        principalEntity.uid.id === resourceEntity.uid.id
          ? [principalEntity]
          : [principalEntity, resourceEntity],
    });

    if (authResult.type === 'failure') {
      console.warn({ event: 'authorization.failed', category: 'evaluation' });
      return {
        permitted: false,
        reason: 'CedarEvaluationFailure',
        gaps: [],
      };
    }

    if (authResult.response.diagnostics.errors.length > 0) {
      console.warn({
        event: 'authorization.policy_evaluation_errors',
        count: authResult.response.diagnostics.errors.length,
        policyIds: authResult.response.diagnostics.errors.map(
          (error: { policyId: string }) => error.policyId,
        ),
      });
    }
    if (authResult.response.diagnostics.errors.length > 0)
      return { permitted: false, reason: 'CedarEvaluationFailure', gaps: [] };
    const decision = authResult.response.decision;
    const permitted = decision.toLowerCase() === 'allow';
    const reasonList = Array.from(authResult.response.diagnostics.reason);
    const reason = reasonList.join(', ') || 'DefaultDeny';

    // Retrieve dynamically parsed gaps for the actor role
    const principalRole = request.principal.type;
    const gaps = gapsMap[principalRole] || [];

    // Audit Trail: Log denied decisions at WARN level
    if (!permitted) {
      console.warn({ event: 'authorization.denied' });
    }

    return {
      permitted,
      reason,
      gaps,
    };
  } catch {
    console.error({ event: 'authorization.failed', category: 'exception' });
    return {
      permitted: false,
      reason: 'EvaluatorError',
      gaps: [],
    };
  }
}
