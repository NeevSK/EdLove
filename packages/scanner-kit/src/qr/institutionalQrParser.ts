export type ParsedInstitutionalQR =
  | { kind: 'asset'; assetId: string; metadata?: Record<string, string> }
  | { kind: 'aswesuma'; certificateHash: string; householdId?: string }
  | { kind: 'meal'; studentId: string }
  | { kind: 'attendance'; studentId: string; classroomId?: string }
  | { kind: 'unknown'; raw: string };

/**
 * Parses raw scanned QR strings or barcodes into domain-typed institutional payloads.
 */
export function parseInstitutionalQR(raw: string): ParsedInstitutionalQR {
  if (!raw || typeof raw !== 'string') {
    return { kind: 'unknown', raw: '' };
  }

  const trimmed = raw.trim();

  // 1. Direct Prefixed Tokens (Barcodes / Offline tags)
  if (trimmed.startsWith('ASSET:')) {
    const assetId = trimmed.slice(6).trim();
    return { kind: 'asset', assetId };
  }

  if (trimmed.startsWith('ASWESUMA:')) {
    const parts = trimmed.slice(9).split(':');
    return {
      kind: 'aswesuma',
      certificateHash: parts[0]?.trim() || '',
      householdId: parts[1]?.trim() || undefined,
    };
  }

  if (trimmed.startsWith('MEAL:')) {
    const studentId = trimmed.slice(5).trim();
    return { kind: 'meal', studentId };
  }

  if (trimmed.startsWith('ATTENDANCE:')) {
    const parts = trimmed.slice(11).split(':');
    if (parts.length === 1) {
      return { kind: 'attendance', studentId: parts[0]!.trim() };
    }
    return {
      kind: 'attendance',
      classroomId: parts[0]!.trim(),
      studentId: parts[1]!.trim(),
    };
  }

  if (trimmed.startsWith('STUDENT:')) {
    const studentId = trimmed.slice(8).trim();
    return { kind: 'attendance', studentId };
  }

  // 2. URI Schemes
  try {
    if (trimmed.startsWith('gurudevi://') || trimmed.startsWith('https://gurudevi.org/qr/')) {
      const url = new URL(trimmed.replace('gurudevi://', 'https://gurudevi.org/'));
      const segments = url.pathname.split('/').filter(Boolean);
      const action = segments[0];
      const targetId = segments[1];

      if (action === 'asset' && targetId) {
        return { kind: 'asset', assetId: targetId };
      }
      if (action === 'aswesuma' && targetId) {
        return {
          kind: 'aswesuma',
          certificateHash: targetId,
          householdId: url.searchParams.get('householdId') || undefined,
        };
      }
      if (action === 'meal' && targetId) {
        return { kind: 'meal', studentId: targetId };
      }
      if (action === 'attendance' && targetId) {
        return {
          kind: 'attendance',
          studentId: targetId,
          classroomId: url.searchParams.get('classroomId') || undefined,
        };
      }
    }
  } catch {
    // URL parse fallback
  }

  // 3. JSON Payloads
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    try {
      const parsed = JSON.parse(trimmed);
      const type = parsed.type || parsed.kind;
      if (type === 'asset' && (parsed.id || parsed.assetId)) {
        return { kind: 'asset', assetId: String(parsed.id || parsed.assetId) };
      }
      if (type === 'aswesuma' && (parsed.hash || parsed.certificateHash)) {
        return {
          kind: 'aswesuma',
          certificateHash: String(parsed.hash || parsed.certificateHash),
          householdId: parsed.householdId ? String(parsed.householdId) : undefined,
        };
      }
      if (type === 'meal' && parsed.studentId) {
        return { kind: 'meal', studentId: String(parsed.studentId) };
      }
      if (type === 'attendance' && parsed.studentId) {
        return {
          kind: 'attendance',
          studentId: String(parsed.studentId),
          classroomId: parsed.classroomId ? String(parsed.classroomId) : undefined,
        };
      }
      if (type === 'student_id' && (parsed.studentId || parsed.id)) {
        return {
          kind: 'student_id',
          studentId: String(parsed.studentId || parsed.id),
        };
      }
    } catch {
      // JSON parse error ignored
    }
  }

  return { kind: 'unknown', raw: trimmed };
}
