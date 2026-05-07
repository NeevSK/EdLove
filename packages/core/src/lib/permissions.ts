import type { AuthorityTier } from '../types/Authority';

/**
 * Get authority display name
 */
export function getAuthorityLabel(
  authority: AuthorityTier,
  language: 'en' | 'si' | 'ta' = 'en',
): string {
  const labels: Record<AuthorityTier, Record<'en' | 'si' | 'ta', string>> = {
    student: {
      si: '\u0DC1\u0DD2\u0DC2\u0DCA\u200D\u0DBA',
      ta: '\u0BAE\u0BBE\u0BA3\u0BB5\u0BB0\u0BCD',
      en: 'Student',
    },
    teacher: {
      si: '\u0D9C\u0DD4\u0DBB\u0DD4',
      ta: '\u0B86\u0B9A\u0BBF\u0BB0\u0BBF\u0BAF\u0BB0\u0BCD',
      en: 'Teacher',
    },
    principal: {
      si: '\u0DC0\u0DD2\u0DAF\u0DD4\u0DC4\u0DBD\u0DCA\u0DB4\u0DAD\u0DD2',
      ta: '\u0B85\u0BA4\u0BBF\u0BAA\u0BB0\u0BCD',
      en: 'Principal',
    },
    founder: {
      si: '\u0DB1\u0DD2\u0DBB\u0DCA\u0DB8\u0DCF\u0DAD\u0DD8',
      ta: '\u0BA8\u0BBF\u0BB1\u0BC1\u0BB5\u0BA9\u0BB0\u0BCD',
      en: 'Founder',
    },
    admin: {
      si: '\u0DB4\u0DBB\u0DD2\u0DB4\u0DCF\u0DBD\u0D9A',
      ta: '\u0BA8\u0BBF\u0BB0\u0BCD\u0BB5\u0BBE\u0B95\u0BBF',
      en: 'Admin',
    },
    developer: {
      si: '\u0DC3\u0D82\u0DC0\u0DBB\u0DCA\u0DB0\u0D9A',
      ta: '\u0B89\u0BB0\u0BC1\u0BB5\u0BBE\u0B95\u0BCD\u0B95\u0BC1\u0DB6\u0BB5\u0BB0\u0BCD',
      en: 'Developer',
    },
    gradeHead: {
      si: '\u0DC1\u0DCA\u200D\u0DBB\u0DDA\u0DAB\u0DD2 \u0DB4\u0DCA\u200D\u0DBB\u0DB0\u0DCF\u0DB1\u0DD3',
      ta: '\u0BB5\u0B95\u0BC1\u0BAA\u0BCD\u0BAA\u0BC1\u0BA4\u0BCD \u0BA4\u0BB2\u0BC8\u0BB5\u0BB0\u0BCD',
      en: 'Grade Head',
    },
    sectionHead: {
      si: '\u0D85\u0D82\u0DC1 \u0DB4\u0DCA\u200D\u0DBB\u0DB0\u0DCF\u0DB1\u0DD3',
      ta: '\u0BAA\u0BBF\u0BB0\u0BBF\u0BB5\u0BC1\u0BA4\u0BCD \u0BA4\u0BB2\u0BC8\u0BB5\u0BB0\u0BCD',
      en: 'Section Head',
    },
    assistantPrincipal: {
      si: '\u0DC3\u0DC4\u0D9A\u0DCF\u0DBB \u0DC0\u0DD2\u0DAF\u0DD4\u0DC4\u0DBD\u0DCA\u0DB4\u0DAD\u0DD2',
      ta: '\u0B89\u0BA4\u0BB5\u0BBF \u0B85\u0BA4\u0BBF\u0BAA\u0BB0\u0BCD',
      en: 'Assistant Principal',
    },
    parent: {
      si: '\u0DAF\u0DD9\u0DB8\u0DCF\u0DB4\u0DD2\u0DBA\u0DB1\u0DCA',
      ta: '\u0BAA\u0BC6\u0BB1\u0BCD\u0BB1\u0BCB\u0BB0\u0BCD',
      en: 'Parent',
    },
    guardian: {
      si: '\u0DB7\u0DCF\u0DBB\u0D9A\u0DBB\u0DD4',
      ta: '\u0BAA\u0BBE\u0BA4\u0BC1\u0B95\u0BBE\u0BB5\u0BB2\u0BB0\u0BCD',
      en: 'Guardian',
    },
    librarian: {
      si: '\u0DB4\u0DD4\u0DC3\u0DCA\u0DAD\u0D9A\u0DCF\u0DBD\u0DBA\u0DCF\u0DB0\u0DD2\u0DB4\u0DAD\u0DD2',
      ta: '\u0BA8\u0BC2\u0BB2\u0B95\u0BB0\u0BCD',
      en: 'Librarian',
    },
    nurse: {
      si: '\u0DC4\u0DD9\u0DAF',
      ta: '\u0B9A\u0BC6\u0BB5\u0BBF\u0BB2\u0BAF\u0BB0\u0BCD',
      en: 'Nurse',
    },
    staff: {
      si: 'කාර්ය මණ්ඩලය',
      ta: 'பணியாளர்கள்',
      en: 'Staff',
    },
    member: {
      si: 'සාමාජික',
      ta: 'உறுப்பினர்',
      en: 'Member',
    },
    guest: {
      si: '\u0D85\u0DB8\u0DD4\u0DAD\u0DCA\u0DAD\u0DCF',
      ta: '\u0BB5\u0BBF\u0BB0\u0BC1\u0BA8\u0BCD\u0BA4\u0BBF\u0BA9\u0BB0\u0BCD',
      en: 'Guest',
    },
  };

  return labels[authority]?.[language] || authority;
}

// Legacy compatibility helpers.
// These should not be used for authorization decisions; prefer ReBAC bonds + active perspective.
export function getSchoolRoleForUser(user: any): AuthorityTier | null {
  const activeBond = user?.active_bond;
  if (activeBond?.entity_type === 'SCHOOL' && typeof activeBond?.capacity === 'string') {
    return activeBond.capacity as AuthorityTier;
  }
  const bonds: any[] = Array.isArray(user?.bonds) ? user.bonds : [];
  const schoolBond = bonds.find(
    (b) => b?.entity_type === 'SCHOOL' && (b?.status ?? 'active') === 'active',
  );
  if (schoolBond?.capacity) return schoolBond.capacity as AuthorityTier;
  return null;
}

export function getWorkRolesForUser(_user: any): AuthorityTier[] {
  // Work roles are not yet modeled canonically in ReBAC; return empty for compatibility.
  return [];
}
