import { sign } from 'node:crypto';
import { AUTHORIZATION_ACTIONS, AUTHORIZATION_RESOURCES } from '../authorizationRegistry';
import { check } from '../engine/evaluator';
import type { PermissionSnapshot, UserContext } from './types';

/**
 * Runs Cedar check() for every meaningful permission combination and generates
 * an offline-compatible capability snapshot signed with Ed25519.
 */
export function generateSnapshot(user: UserContext, secret?: string): PermissionSnapshot {
  const generatedAt = new Date().toISOString();
  // Expires in 24 hours
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  const resourceTypes = AUTHORIZATION_RESOURCES;

  const allowedAttributes: Record<string, string[]> = {
    School: [],
    Classroom: ['school_id', 'teacher_id', 'grade_id', 'section_id'],
    AttendanceRecord: ['school_id', 'classroom_id', 'student_id', 'grade_id', 'section_id'],
    Grade: ['school_id', 'classroom_id', 'student_id', 'graded_by'],
    Assignment: ['school_id', 'classroom_id', 'teacher_id'],
    Lesson: ['school_id', 'classroom_id', 'teacher_id'],
    Material: ['school_id', 'classroom_id', 'teacher_id'],
    StaffLeave: ['school_id', 'user_id'],
    MoodLog: ['school_id', 'user_id'],
    FireJournal: ['school_id', 'user_id'],
    InventoryItem: ['school_id', 'classroom_id', 'teacher_id'],
    Group: ['school_id', 'creator_id'],
    Post: ['school_id', 'author_id'],
    Ledger: ['school_id'],
    Guardian: ['school_id', 'user_id'],
    SentinelAuditLog: ['school_id', 'actor_id'],
    JoyMoments: ['school_id', 'user_id'],
    GratitudeEntries: ['school_id', 'user_id'],
    EnergyForecasts: ['school_id', 'user_id'],
    AIAssistant: ['school_id'],
  };

  const allPossibleAttributes: Record<string, any> = {
    school_id: user.school_id,
    teacher_id: user.id,
    user_id: user.id,
    student_id: user.id,
    creator_id: user.id,
    author_id: user.id,
    actor_id: user.id,
    grade_id: user.grade_id || '',
    section_id: user.section_id || '',
    classroom_id: user.classroom_ids?.[0] || 'dummy-classroom-id',
    graded_by: user.id,
  };

  const actions = AUTHORIZATION_ACTIONS;
  const permissions: Record<string, Record<string, boolean>> = {};

  for (const resourceType of resourceTypes) {
    permissions[resourceType] = {};

    const resourceAttributes: Record<string, any> = {};
    const allowed = allowedAttributes[resourceType] || [];
    for (const key of allowed) {
      if (allPossibleAttributes[key] !== undefined) {
        resourceAttributes[key] = allPossibleAttributes[key];
      }
    }

    const resourceId = `dummy-${resourceType.toLowerCase()}-id`;
    for (const action of actions) {
      const res = check({
        principal: {
          type: user.capacity,
          id: user.id,
          attributes: {
            school_id: user.school_id ?? '',
            active_entity_id: user.active_entity_id,
            active_entity_type: user.active_entity_type,
            capacity: user.capacity,
            classroom_ids: user.classroom_ids || [],
            grade_id: user.grade_id,
            section_id: user.section_id,
            child_student_ids: user.child_student_ids || [],
          },
        },
        action,
        resource: {
          type: resourceType,
          id: resourceId,
          attributes: resourceAttributes,
        },
      });
      permissions[resourceType][action] = res.permitted;
    }
  }

  const temporalHints = {};

  const payload = {
    generatedAt,
    expiresAt,
    userId: user.id,
    activeBondId: user.active_bond_id,
    activeEntityId: user.active_entity_id,
    activeEntityType: user.active_entity_type,
    schoolId: user.school_id ?? null,
    policyVersion: user.policy_version,
    permissions,
    temporalHints,
  };

  const privateKey = secret || process.env.SNAPSHOT_SIGNING_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error('Snapshot signing private key is not configured');
  }
  const signature = `ed25519:${sign(null, Buffer.from(JSON.stringify(payload)), privateKey).toString('base64')}`;

  return {
    ...payload,
    signature,
  };
}
