import crypto from 'node:crypto';
import { check } from '@/engine/evaluator';
import type { PermissionSnapshot, UserContext } from '@/snapshot/types';

/**
 * Runs Cedar check() for every meaningful permission combination and generates
 * an offline-compatible, tamper-proof capability snapshot signed with HMAC.
 */
export function generateSnapshot(user: UserContext, secret?: string): PermissionSnapshot {
  const generatedAt = new Date().toISOString();
  // Expires in 24 hours
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  const resourceTypes = [
    'School',
    'Classroom',
    'AttendanceRecord',
    'Grade',
    'Assignment',
    'Lesson',
    'Material',
    'StaffLeave',
    'MoodLog',
    'FireJournal',
    'InventoryItem',
    'Group',
    'Post',
    'Ledger',
    'Guardian',
    'SentinelAuditLog',
    'JoyMoments',
    'GratitudeEntries',
    'EnergyForecasts',
  ];

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

  const actions = ['read', 'create', 'update', 'delete'];
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

    for (const action of actions) {
      const res = check({
        principal: {
          type: user.capacity,
          id: user.id,
          attributes: {
            school_id: user.school_id,
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
          id: `dummy-${resourceType.toLowerCase()}-id`,
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
    schoolId: user.school_id,
    permissions,
    temporalHints,
  };

  const key = secret || process.env.SNAPSHOT_SECRET || 'default-fallback-secret-for-development';
  const signature = crypto.createHmac('sha256', key).update(JSON.stringify(payload)).digest('hex');

  return {
    ...payload,
    signature,
  };
}
