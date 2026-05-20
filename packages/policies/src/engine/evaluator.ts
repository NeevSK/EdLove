import { readFileSync } from 'fs';
import { createRequire } from 'module';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import type { AuthRequest, AuthResponse } from './types';

const require = createRequire(import.meta.url);
const { isAuthorized } = require('@cedar-policy/cedar-wasm/nodejs') as any;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const srcDir = join(__dirname, '..');

// 1. Initialize and Cache Schema and Policies at Startup (Singleton pattern)
let schemaText = '';
let concatenatedPolicies = '';
const gapsMap: Record<string, string[]> = {};

try {
  const schemaPath = join(srcDir, 'schema', 'schema.cedarschema');
  schemaText = readFileSync(schemaPath, 'utf8');

  const policyFiles = [
    'platform/admin.cedar',
    'school/principal.cedar',
    'school/assistantPrincipal.cedar',
    'school/teacher.cedar',
    'school/gradeHead.cedar',
    'school/sectionHead.cedar',
    'school/student.cedar',
    'school/parent.cedar',
    'school/staff.cedar',
    'guest/wanderer.cedar',
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

  concatenatedPolicies = policyTexts.join('\n\n');
} catch (error) {
  console.error('CRITICAL: Failed to initialize Cedar policy engine on startup:', error);
}

/**
 * Clean check() function. Runs a request against the cached Cedar engine.
 * Log denied decisions at WARN level for audit trail.
 */
export function check(request: AuthRequest): AuthResponse {
  try {
    if (!schemaText || !concatenatedPolicies) {
      throw new Error('Cedar engine was not properly initialized');
    }

    // Build principal entity with concrete attributes from AuthRequest
    const principalEntity = {
      uid: { type: 'User', id: request.principal.id },
      attrs: {
        id: request.principal.id,
        school_id: request.principal.attributes.school_id,
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
    const resourceEntity = {
      uid: { type: request.resource.type, id: request.resource.id },
      attrs: {
        id: request.resource.id,
        ...request.resource.attributes,
      },
      parents: [],
    };

    // Call Cedar WebAssembly function
    const authResult = isAuthorized({
      principal: { type: 'User', id: request.principal.id },
      action: { type: 'Action', id: request.action },
      resource: { type: request.resource.type, id: request.resource.id },
      context: (request.context as Record<string, any>) || {},
      schema: { human: schemaText },
      slice: {
        policies: concatenatedPolicies,
        entities: [principalEntity, resourceEntity],
        templateInstantiations: null,
      },
    });

    if (authResult.type === 'failure') {
      console.warn(
        '[AUDIT] Cedar authorization compilation/evaluation failure:',
        authResult.errors,
      );
      return {
        permitted: false,
        reason: 'CedarEvaluationFailure',
        gaps: [],
      };
    }

    const permitted = authResult.response.decision === 'Allow';
    const reasonList = Array.from(authResult.response.diagnostics.reason);
    const reason = reasonList.join(', ') || 'DefaultDeny';

    // Retrieve dynamically parsed gaps for the actor role
    const principalRole = request.principal.type;
    const gaps = gapsMap[principalRole] || [];

    // Audit Trail: Log denied decisions at WARN level
    if (!permitted) {
      console.warn(
        `[AUDIT] Permission DENIED: Principal "${request.principal.id}" (${request.principal.type}) ` +
          `attempted to "${request.action}" resource "${request.resource.type}::${request.resource.id}". ` +
          `Reason: ${reason}`,
      );
    }

    return {
      permitted,
      reason,
      gaps,
    };
  } catch (error) {
    console.error('Graceful error handling in check():', error);
    return {
      permitted: false,
      reason: `EvaluatorError: ${error instanceof Error ? error.message : String(error)}`,
      gaps: [],
    };
  }
}
