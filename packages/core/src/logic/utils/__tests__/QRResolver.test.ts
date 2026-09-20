import { describe, expect, it } from 'vitest';
import { resolveQR } from '../QRResolver';

describe('QRResolver (G0 Contract & G1 Boundary Tests)', () => {
  describe('Canonical URL & Deep Link Formats', () => {
    it('parses valid canonical custom scheme gurudevi://qr for join_class', () => {
      const result = resolveQR(
        'gurudevi://qr?v=1&action=join_class&classroom_id=cls-101&handle=grade-5',
      );
      expect(result).toEqual({
        ok: true,
        payload: {
          v: 1,
          action: 'join_class',
          classroom_id: 'cls-101',
          handle: 'grade-5',
        },
      });
    });

    it('parses valid canonical HTTPS web URL https://gurudevi.app/qr for join_school', () => {
      const result = resolveQR(
        'https://gurudevi.app/qr?v=1&action=join_school&school_id=sch-99&group_id=grp-4',
      );
      expect(result).toEqual({
        ok: true,
        payload: {
          v: 1,
          action: 'join_school',
          school_id: 'sch-99',
          group_id: 'grp-4',
          handle: undefined,
        },
      });
    });

    it('parses thuthimal_gift claim action', () => {
      const result = resolveQR(
        'gurudevi://qr?v=1&action=thuthimal_gift&gift_token=token-xyz&gifter_name=Priya',
      );
      expect(result).toEqual({
        ok: true,
        payload: {
          v: 1,
          action: 'thuthimal_gift',
          gift_token: 'token-xyz',
          gifter_name: 'Priya',
        },
      });
    });

    it('parses claim_invite action', () => {
      const result = resolveQR(
        'gurudevi://qr?v=1&action=claim_invite&invite_code=INV-123&school_id=sch-1&capacity=teacher',
      );
      expect(result).toEqual({
        ok: true,
        payload: {
          v: 1,
          action: 'claim_invite',
          invite_code: 'INV-123',
          school_id: 'sch-1',
          capacity: 'teacher',
        },
      });
    });
  });

  describe('Adversarial & Tampered QR Edge Cases', () => {
    it('rejects version mismatch (e.g. v=2 when engine expects v=1)', () => {
      const result = resolveQR('gurudevi://qr?v=2&action=join_class&classroom_id=cls-1');
      expect(result).toEqual({
        ok: false,
        error: 'version_mismatch',
        raw: 'gurudevi://qr?v=2&action=join_class&classroom_id=cls-1',
      });
    });

    it('rejects missing or NaN version', () => {
      const result = resolveQR('gurudevi://qr?v=notanumber&action=join_class&classroom_id=cls-1');
      expect(result).toEqual({
        ok: false,
        error: 'version_mismatch',
        raw: 'gurudevi://qr?v=notanumber&action=join_class&classroom_id=cls-1',
      });
    });

    it('rejects unknown action payloads', () => {
      const result = resolveQR('gurudevi://qr?v=1&action=steal_credentials&token=bad');
      expect(result).toEqual({
        ok: false,
        error: 'unknown_action',
        raw: 'gurudevi://qr?v=1&action=steal_credentials&token=bad',
      });
    });

    it('rejects missing mandatory action parameters (e.g. missing school_id)', () => {
      const result = resolveQR('gurudevi://qr?v=1&action=join_school&group_id=grp-1');
      expect(result).toEqual({
        ok: false,
        error: 'invalid',
        raw: 'gurudevi://qr?v=1&action=join_school&group_id=grp-1',
      });
    });

    it('rejects empty, null, undefined, or non-string inputs safely without throwing', () => {
      expect(resolveQR('')).toEqual({ ok: false, error: 'invalid', raw: '' });
      expect(resolveQR(null as unknown as string)).toEqual({
        ok: false,
        error: 'invalid',
        raw: '',
      });
      expect(resolveQR(undefined as unknown as string)).toEqual({
        ok: false,
        error: 'invalid',
        raw: '',
      });
      expect(resolveQR('random string not a QR format')).toEqual({
        ok: false,
        error: 'invalid',
        raw: 'random string not a QR format',
      });
    });

    it('rejects lookalike schemes and HTTPS paths rather than prefix-matching them', () => {
      expect(resolveQR('gurudevi://qrevil?v=1&action=join_class&classroom_id=cls-1')).toEqual({
        ok: false,
        error: 'invalid',
        raw: 'gurudevi://qrevil?v=1&action=join_class&classroom_id=cls-1',
      });
      expect(
        resolveQR('https://gurudevi.app/qr-extra?v=1&action=join_class&classroom_id=cls-1'),
      ).toEqual({
        ok: false,
        error: 'invalid',
        raw: 'https://gurudevi.app/qr-extra?v=1&action=join_class&classroom_id=cls-1',
      });
    });
  });

  describe('Legacy QR Formats Support', () => {
    it('parses legacy join-class:<uuid>', () => {
      const result = resolveQR('join-class:550e8400-e29b-41d4-a716-446655440000');
      expect(result).toEqual({
        ok: true,
        payload: {
          v: 1,
          action: 'join_class',
          classroom_id: '550e8400-e29b-41d4-a716-446655440000',
        },
      });
    });

    it('parses legacy join-group:<uuid>', () => {
      const result = resolveQR('join-group:550e8400-e29b-41d4-a716-446655440000');
      expect(result).toEqual({
        ok: true,
        payload: {
          v: 1,
          action: 'join_group',
          group_id: '550e8400-e29b-41d4-a716-446655440000',
        },
      });
    });

    it('parses legacy bare UUID identity card QR', () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000';
      const result = resolveQR(uuid);
      expect(result).toEqual({
        ok: true,
        payload: {
          v: 1,
          action: 'user_invite',
          inviter_id: uuid,
          inviter_capacity: 'unknown',
        },
      });
    });
  });
});
