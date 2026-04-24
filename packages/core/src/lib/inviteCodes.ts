import { supabase } from '../native/supabase';

/**
 * Invite Code Validation and Management
 */

export interface InviteCodeData {
  id: string;
  school_id: string;
  code: string;
  role: 'teacher' | 'student' | 'principal';
  school_name?: string;
  school_type?: string;
  is_active: boolean;
  uses_count: number;
  max_uses: number | null;
}

/**
 * Validate invite code format
 * Format: GURU-ABC123-TEACH or GURU-ABC123-STUDY
 */
export function validateInviteCodeFormat(code: string): boolean {
  const pattern = /^GURU-[A-Z0-9]{6}-(TEACH|STUDY|ADMIN)$/;
  return pattern.test(code.toUpperCase());
}

/**
 * Check if invite code exists and is valid in database
 */
export async function validateInviteCode(code: string): Promise<{
  valid: boolean;
  data?: InviteCodeData;
  error?: string;
}> {
  try {
    // Validate format first
    if (!validateInviteCodeFormat(code)) {
      return {
        valid: false,
        error: 'Invalid code format. Expected: GURU-ABC123-TEACH',
      };
    }

    // Query database
    const { data, error } = await supabase
      .from('invite_codes')
      .select(`
        id,
        school_id,
        code,
        role,
        is_active,
        uses_count,
        max_uses,
        schools (
          name,
          type
        )
      `)
      .eq('code', code.toUpperCase())
      .eq('is_active', true)
      .single();

    if (error || !data) {
      return {
        valid: false,
        error: 'Invalid or expired invite code',
      };
    }

    // Check if code has reached max uses
    if (data.max_uses && data.uses_count >= data.max_uses) {
      return {
        valid: false,
        error: 'This invite code has reached its usage limit',
      };
    }

    return {
      valid: true,
      data: {
        ...data,
        school_name: (data.schools as any)?.name,
        school_type: (data.schools as any)?.type,
      },
    };
  } catch (error) {
    console.error('Error validating invite code:', error);
    return {
      valid: false,
      error: 'Failed to validate code. Please try again.',
    };
  }
}

/**
 * Increment invite code usage count
 */
export async function incrementInviteCodeUsage(code: string): Promise<void> {
  try {
    // Fetch current count
    const { data: currentData } = await supabase
      .from('invite_codes')
      .select('uses_count')
      .eq('code', code.toUpperCase())
      .single();

    if (currentData) {
      // Increment and update
      const { error } = await supabase
        .from('invite_codes')
        .update({ uses_count: currentData.uses_count + 1 })
        .eq('code', code.toUpperCase());

      if (error) {
        console.error('Error incrementing invite code usage:', error);
      }
    }
  } catch (error) {
    console.error('Error incrementing invite code usage:', error);
  }
}

/**
 * Generate invite codes for a school (called after principal creates school)
 */
export async function generateInviteCodesForSchool(
  schoolId: string,
  createdBy: string,
): Promise<{
  teacherCode?: string;
  studentCode?: string;
  error?: string;
}> {
  try {
    // Generate teacher code
    const teacherCode = generateInviteCode('teacher');
    const studentCode = generateInviteCode('student');

    const { error } = await supabase.from('invite_codes').insert([
      {
        school_id: schoolId,
        code: teacherCode,
        role: 'teacher',
        created_by: createdBy,
      },
      {
        school_id: schoolId,
        code: studentCode,
        role: 'student',
        created_by: createdBy,
      },
    ]);

    if (error) {
      console.error('Error creating invite codes:', error);
      return { error: 'Failed to generate invite codes' };
    }

    return { teacherCode, studentCode };
  } catch (error) {
    console.error('Error generating invite codes:', error);
    return { error: 'Failed to generate invite codes' };
  }
}

/**
 * Generate a random invite code (client-side)
 * Format: GURU-ABC123-TEACH
 */
function generateInviteCode(role: 'teacher' | 'student'): string {
  const suffix = role === 'teacher' ? 'TEACH' : 'STUDY';
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase().padEnd(6, '0');
  return `GURU-${randomPart}-${suffix}`;
}

/**
 * Extract role from invite code
 */
export function getRoleFromCode(code: string): 'teacher' | 'student' | null {
  if (code.endsWith('-TEACH')) return 'teacher';
  if (code.endsWith('-STUDY')) return 'student';
  return null;
}
