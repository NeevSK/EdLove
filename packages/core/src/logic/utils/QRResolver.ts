/**
 * QRResolver â€” Central parser and router for all QR scan results
 *
 * Handles all payload formats:
 *   - Canonical: gurudevi://qr?v=1&action=join_school&school_id=...&group_id=...
 *   - Legacy:    join-class:<uuid>         â†’ JoinClassPayload
 *   - Legacy:    join-group:<uuid>         â†’ JoinGroupPayload
 *   - Legacy:    <bare-uuid>               â†’ UserInvitePayload (identity card QR)
 *
 * Always run every scanner callback through resolveQR() â€” never parse raw strings
 * ad-hoc in screens.
 */

import { GURUDEVI_QR_URL } from '@repo/core/config/publicUrls';
import { QR_VERSION, type QRAction, type QRPayload } from '@repo/core/types/QRPayload';

export type QRResolveResult =
  | { ok: true; payload: QRPayload }
  | {
      ok: false;
      error: 'invalid' | 'version_mismatch' | 'unknown_action';
      raw: string;
    };

/** UUID v4 pattern for legacy bare-UUID identity card QRs */
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Parse any scanned QR string into a typed QRPayload.
 * Returns { ok: false } on parse failure â€” never throws.
 */
export function resolveQR(raw: string): QRResolveResult {
  if (!raw || typeof raw !== 'string') {
    return { ok: false, error: 'invalid', raw: String(raw ?? '') };
  }

  const trimmed = raw.trim();

  // â”€â”€ Legacy: join-class:<uuid> â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (trimmed.startsWith('join-class:')) {
    const classroom_id = trimmed.slice('join-class:'.length).trim();
    if (!classroom_id) return { ok: false, error: 'invalid', raw };
    return { ok: true, payload: { v: 1, action: 'join_class', classroom_id } };
  }

  // â”€â”€ Legacy: join-group:<uuid> â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (trimmed.startsWith('join-group:')) {
    const group_id = trimmed.slice('join-group:'.length).trim();
    if (!group_id) return { ok: false, error: 'invalid', raw };
    return { ok: true, payload: { v: 1, action: 'join_group', group_id } };
  }

  // â”€â”€ Legacy bare UUID (old user identity card QRs) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (UUID_REGEX.test(trimmed)) {
    return {
      ok: true,
      payload: {
        v: 1,
        action: 'user_invite',
        inviter_id: trimmed,
        inviter_capacity: 'unknown',
      },
    };
  }

  // â”€â”€ Canonical: gurudevi://qr or https://platform.gurudevi.edlove.org/qr â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (trimmed.startsWith('gurudevi://qr') || trimmed.startsWith(GURUDEVI_QR_URL)) {
    try {
      const queryStart = trimmed.indexOf('?');
      if (queryStart === -1) return { ok: false, error: 'invalid', raw };
      const queryString = trimmed.substring(queryStart + 1);
      const params = parseQueryString(queryString);

      const v = parseInt(params.v ?? '', 10);
      if (Number.isNaN(v) || v !== QR_VERSION) {
        return { ok: false, error: 'version_mismatch', raw };
      }

      const action = params.action as QRAction | undefined;
      if (!action) return { ok: false, error: 'invalid', raw };

      return buildPayloadFromParams(action, params, raw);
    } catch {
      return { ok: false, error: 'invalid', raw };
    }
  }

  return { ok: false, error: 'invalid', raw };
}

// â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function parseQueryString(query: string): Record<string, string> {
  const result: Record<string, string> = {};
  for (const part of query.split('&')) {
    const eq = part.indexOf('=');
    if (eq === -1) continue;
    try {
      const key = decodeURIComponent(part.substring(0, eq));
      const value = decodeURIComponent(part.substring(eq + 1));
      result[key] = value;
    } catch {
      // skip malformed segment
    }
  }
  return result;
}

function buildPayloadFromParams(
  action: QRAction,
  params: Record<string, string>,
  raw: string,
): QRResolveResult {
  switch (action) {
    case 'join_school': {
      const { school_id, group_id, handle } = params;
      if (!school_id || !group_id) return { ok: false, error: 'invalid', raw };
      return {
        ok: true,
        payload: { v: 1, action, school_id, group_id, handle },
      };
    }

    case 'join_class': {
      const { classroom_id, handle } = params;
      if (!classroom_id) return { ok: false, error: 'invalid', raw };
      return { ok: true, payload: { v: 1, action, classroom_id, handle } };
    }

    case 'join_group': {
      const { group_id, handle } = params;
      if (!group_id) return { ok: false, error: 'invalid', raw };
      return { ok: true, payload: { v: 1, action, group_id, handle } };
    }

    case 'claim_invite': {
      const { invite_code, school_id, capacity } = params;
      if (!invite_code || !school_id || !capacity) return { ok: false, error: 'invalid', raw };
      return {
        ok: true,
        payload: {
          v: 1,
          action,
          invite_code,
          school_id,
          capacity,
        },
      };
    }

    case 'user_invite': {
      const { inviter_id, inviter_capacity, username } = params;
      if (!inviter_id) return { ok: false, error: 'invalid', raw };
      return {
        ok: true,
        payload: {
          v: 1,
          action,
          inviter_id,
          inviter_capacity: inviter_capacity || 'unknown',
          username,
        },
      };
    }

    case 'thuthimal_gift': {
      const { gift_token, gifter_name } = params;
      if (!gift_token || !gifter_name) return { ok: false, error: 'invalid', raw };
      return { ok: true, payload: { v: 1, action, gift_token, gifter_name } };
    }

    default:
      return { ok: false, error: 'unknown_action', raw };
  }
}
