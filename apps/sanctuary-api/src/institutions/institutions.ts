import { ORPCError } from '@orpc/server';
import type {
  CreateInviteCodeInput,
  CreateInviteCodeResult,
  HandleAvailableInput,
  HandleAvailableResult,
  InviteCodeItem,
  ListInviteCodesInput,
  ListInviteCodesResult,
  ProvisionSchoolInput,
  ProvisionSchoolResult,
  RevokeInviteCodeInput,
  RevokeInviteCodeResult,
  UpdateInstitutionInput,
  UpdateInstitutionResult,
} from '@repo/core/api/v1/contract';
import { randomUUID } from 'node:crypto';
import type { PoolClient } from 'pg';

export async function checkHandleAvailable(
  db: PoolClient,
  input: HandleAvailableInput,
): Promise<HandleAvailableResult> {
  const handle = input.handle.trim().toLowerCase();
  const res = await db.query(
    'SELECT 1 FROM public.schools WHERE handle = $1 AND deleted_at IS NULL LIMIT 1',
    [handle],
  );
  return { available: res.rowCount === 0 };
}

export async function provisionInstitution(
  db: PoolClient,
  accountId: string,
  input: ProvisionSchoolInput,
): Promise<ProvisionSchoolResult> {
  const handle = input.handle.trim().toLowerCase();
  const name = input.name.trim();

  // 1. Idempotency check via public.operation_receipts
  try {
    const existingReceipt = await db.query<{ result: ProvisionSchoolResult }>(
      `SELECT result FROM public.operation_receipts
       WHERE account_id = $1::uuid AND capability = 'ops.institutions.provision'
         AND idempotency_key = $2::uuid AND status = 'committed' LIMIT 1`,
      [accountId, input.idempotencyKey],
    );
    if (existingReceipt.rows[0]?.result) {
      return existingReceipt.rows[0].result;
    }
  } catch {
    // If operation_receipts check fails or table absent, proceed
  }

  // 2. Lock and verify handle availability
  const existingSchool = await db.query<{ id: string }>(
    `SELECT id FROM public.schools WHERE handle = $1 AND deleted_at IS NULL FOR UPDATE`,
    [handle],
  );
  if (existingSchool.rowCount && existingSchool.rowCount > 0) {
    throw new ORPCError('CONFLICT', {
      message: `Handle "${handle}" is already claimed. Choose another.`,
    });
  }

  const schoolId = randomUUID();
  const bondId = randomUUID();
  let groupId: string | null = randomUUID();
  let groupFailed = false;

  // 3. Insert School into public.schools
  await db.query(
    `INSERT INTO public.schools (id, name, handle, type, created_by, tenant_kind, timezone, created_at)
     VALUES ($1, $2, $3, $4, $5, 'customer', 'Asia/Colombo', clock_timestamp())`,
    [schoolId, name, handle, input.type, accountId],
  );

  // 4. Insert founder Principal Bond into public.bonds
  await db.query(
    `INSERT INTO public.bonds (id, user_id, entity_id, entity_type, capacity, citizenship, status, valid_from)
     VALUES ($1, $2::uuid, $3, 'SCHOOL', 'principal', 'FIRST_CLASS', 'active', clock_timestamp())`,
    [bondId, accountId, schoolId],
  );

  // 5. Attempt creation of default Community HQ group in public.community_groups using a SAVEPOINT
  await db.query('SAVEPOINT group_creation');
  try {
    await db.query(
      `INSERT INTO public.community_groups (id, name, school_id, created_by, group_type, join_policy, is_public, created_at)
       VALUES ($1, $2, $3, $4, 'general', 'open', true, clock_timestamp())`,
      [groupId, `${name} Community`, schoolId, accountId],
    );
    await db.query(
      `INSERT INTO public.community_group_members (id, user_id, group_id, role, status, joined_at)
       VALUES ($1, $2::uuid, $3, 'owner', 'active', clock_timestamp())`,
      [randomUUID(), accountId, groupId],
    );
    await db.query('RELEASE SAVEPOINT group_creation');
  } catch {
    await db.query('ROLLBACK TO SAVEPOINT group_creation');
    groupId = null;
    groupFailed = true;
  }

  // 6. Record in public.api_command_audit
  const operationId = randomUUID();
  try {
    await db.query(
      `INSERT INTO public.api_command_audit
         (operation_id, account_id, bond_id, entity_type, entity_id, capacity, capability, resource_type, resource_id, channel)
       VALUES ($1, $2, $3, 'SCHOOL', $4, 'principal', 'ops.institutions.provision', 'School', $4, 'app')`,
      [operationId, accountId, bondId, schoolId],
    );
  } catch {
    // Non-fatal if audit write fails in mock environments
  }

  const result: ProvisionSchoolResult = {
    schoolId,
    groupId: groupId ?? undefined,
    groupFailed: groupFailed || undefined,
  };

  // 7. Save receipt in public.operation_receipts for idempotent retries
  try {
    await db.query(
      `INSERT INTO public.operation_receipts
         (operation_id, account_id, capability, idempotency_key, payload_hash, scope, status, result)
       VALUES ($1, $2, 'ops.institutions.provision', $3, $4, $5, 'committed', $6)
       ON CONFLICT (account_id, capability, idempotency_key) DO UPDATE
       SET status = 'committed', result = $6`,
      [
        operationId,
        accountId,
        input.idempotencyKey,
        input.idempotencyKey,
        schoolId,
        JSON.stringify(result),
      ],
    );
  } catch {
    // Non-fatal
  }

  return result;
}

/** Verifies that the caller has administrative/principal bond authority over the target school */
async function assertSchoolAuthority(
  db: PoolClient,
  accountId: string,
  schoolId: string,
): Promise<void> {
  const authorityCheck = await db.query(
    `SELECT 1 FROM public.bonds
     WHERE user_id = $1::uuid AND entity_id = $2
       AND capacity IN ('principal', 'founder', 'admin')
       AND status = 'active' LIMIT 1`,
    [accountId, schoolId],
  );
  if (authorityCheck.rowCount === 0) {
    throw new ORPCError('FORBIDDEN', {
      message: 'You do not have principal authority over this institution.',
    });
  }
}

export async function updateInstitution(
  db: PoolClient,
  accountId: string,
  input: UpdateInstitutionInput,
): Promise<UpdateInstitutionResult> {
  await assertSchoolAuthority(db, accountId, input.schoolId);

  // If handle is being updated, verify it is not already taken by another school
  if (input.handle) {
    const handle = input.handle.trim().toLowerCase();
    const existing = await db.query(
      `SELECT 1 FROM public.schools WHERE handle = $1 AND id <> $2 AND deleted_at IS NULL LIMIT 1`,
      [handle, input.schoolId],
    );
    if (existing.rowCount && existing.rowCount > 0) {
      throw new ORPCError('CONFLICT', {
        message: `Handle "${handle}" is already claimed by another institution.`,
      });
    }
  }

  const updates: string[] = [];
  const params: unknown[] = [input.schoolId];
  let paramIdx = 2;

  if (input.name !== undefined) {
    updates.push(`name = $${paramIdx++}`);
    params.push(input.name.trim());
  }
  if (input.handle !== undefined) {
    updates.push(`handle = $${paramIdx++}`);
    params.push(input.handle.trim().toLowerCase());
  }
  if (input.type !== undefined) {
    updates.push(`type = $${paramIdx++}`);
    params.push(input.type);
  }
  if (input.avatarUrl !== undefined) {
    updates.push(`avatar_url = $${paramIdx++}`);
    params.push(input.avatarUrl);
  }
  if (input.customBranding !== undefined) {
    updates.push(`custom_branding = $${paramIdx++}`);
    params.push(input.customBranding ? JSON.stringify(input.customBranding) : null);
  }
  if (input.timezone !== undefined) {
    updates.push(`timezone = $${paramIdx++}`);
    params.push(input.timezone);
  }
  if (input.guardianVerificationPolicy !== undefined) {
    updates.push(`guardian_verification_policy = $${paramIdx++}`);
    params.push(input.guardianVerificationPolicy);
  }

  if (updates.length > 0) {
    updates.push(`updated_at = clock_timestamp()`);
    await db.query(
      `UPDATE public.schools SET ${updates.join(', ')} WHERE id = $1`,
      params,
    );
  }

  return {
    success: true,
    schoolId: input.schoolId,
  };
}

export async function createInviteCode(
  db: PoolClient,
  accountId: string,
  input: CreateInviteCodeInput,
): Promise<CreateInviteCodeResult> {
  await assertSchoolAuthority(db, accountId, input.schoolId);

  const suffixMap: Record<CreateInviteCodeInput['role'], string> = {
    teacher: 'TEACH',
    student: 'STUDY',
    staff: 'STAFF',
    guardian: 'GUARD',
  };
  const suffix = suffixMap[input.role] || 'MEMBER';
  const randomPart = randomUUID().replace(/[^a-zA-Z0-9]/g, '').slice(0, 6).toUpperCase();
  const code = `GURU-${randomPart}-${suffix}`;

  const id = randomUUID();
  const createdAt = new Date().toISOString();

  await db.query(
    `INSERT INTO public.invite_codes
       (id, school_id, code, role, max_uses, uses_count, invitation_text, created_by, is_active, created_at)
     VALUES ($1, $2, $3, $4, $5, 0, $6, $7, true, clock_timestamp())`,
    [
      id,
      input.schoolId,
      code,
      input.role,
      input.maxUses ?? null,
      input.invitationText ?? null,
      accountId,
    ],
  );

  const inviteCode: InviteCodeItem = {
    id,
    schoolId: input.schoolId,
    code,
    role: input.role,
    maxUses: input.maxUses ?? null,
    usesCount: 0,
    invitationText: input.invitationText ?? null,
    isActive: true,
    createdAt,
  };

  return { inviteCode };
}

export async function listInviteCodes(
  db: PoolClient,
  accountId: string,
  input: ListInviteCodesInput,
): Promise<ListInviteCodesResult> {
  await assertSchoolAuthority(db, accountId, input.schoolId);

  const res = await db.query<{
    id: string;
    school_id: string;
    code: string;
    role: string;
    max_uses: number | null;
    uses_count: number | null;
    invitation_text: string | null;
    is_active: boolean;
    created_at: Date | string;
  }>(
    `SELECT id, school_id, code, role, max_uses, uses_count, invitation_text, is_active, created_at
     FROM public.invite_codes
     WHERE school_id = $1
     ORDER BY created_at DESC`,
    [input.schoolId],
  );

  const inviteCodes: InviteCodeItem[] = res.rows.map((row) => ({
    id: row.id,
    schoolId: row.school_id,
    code: row.code,
    role: row.role,
    maxUses: row.max_uses,
    usesCount: row.uses_count ?? 0,
    invitationText: row.invitation_text,
    isActive: row.is_active,
    createdAt: typeof row.created_at === 'string' ? row.created_at : row.created_at.toISOString(),
  }));

  return { inviteCodes };
}

export async function revokeInviteCode(
  db: PoolClient,
  accountId: string,
  input: RevokeInviteCodeInput,
): Promise<RevokeInviteCodeResult> {
  await assertSchoolAuthority(db, accountId, input.schoolId);

  await db.query(
    `UPDATE public.invite_codes SET is_active = false WHERE id = $1 AND school_id = $2`,
    [input.codeId, input.schoolId],
  );

  return { success: true };
}
