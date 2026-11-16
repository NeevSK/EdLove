import { describe, expect, it } from 'vitest';
import {
  deserializeLink,
  serializeLink,
  serializeShortLink,
} from '../linkCodec';

describe('linkCodec (RFC 3986 Bidirectional Link Codec & Sovereign Short Links)', () => {
  describe('Inbound Deserialization & Normalization', () => {
    it('normalizes uppercase schemes, hosts, and strips trailing slashes', () => {
      const envelope = deserializeLink('HTTPS://SANCTUARY.GURUDEVI.APP/workspace/');
      expect(envelope).not.toBeNull();
      expect(envelope?.path).toBe('/workspace');
      expect(envelope?.canonicalUrl).toBe('https://sanctuary.gurudevi.app/workspace');
    });

    it('compartmentalizes ad-tech tracking parameters cleanly into telemetry envelope', () => {
      const raw =
        'https://explore.gurudevi.app/workspace?feature=calendar&utm_source=whatsapp&fbclid=IwAR123&utm_campaign=term_q1';
      const envelope = deserializeLink(raw);

      expect(envelope).not.toBeNull();
      expect(envelope?.path).toBe('/workspace');
      // Route params contains ONLY app parameters
      expect(envelope?.routeParams).toEqual({ feature: 'calendar' });
      // Telemetry contains separated attribution data
      expect(envelope?.telemetry.source).toBe('whatsapp');
      expect(envelope?.telemetry.campaign).toBe('term_q1');
      expect(envelope?.telemetry.clickId).toBe('IwAR123');
    });

    it('rejects path traversal attempts beyond root', () => {
      expect(deserializeLink('https://sanctuary.gurudevi.app/self/../../admin')).toBeNull();
      expect(deserializeLink('gurudevi://self/../..')).toBeNull();
    });

    it('deserializes and expands sovereign short links for classroom invites', () => {
      const universalShort = deserializeLink('https://gurudevi.app/c/BIO-2026');
      expect(universalShort).not.toBeNull();
      expect(universalShort?.intentKind).toBe('classroomInvite');
      expect(universalShort?.path).toBe('/workspace');
      expect(universalShort?.routeParams).toEqual({ classroomCode: 'BIO-2026' });

      const nativeShort = deserializeLink('gurudevi://c/MATH-ADV');
      expect(nativeShort).not.toBeNull();
      expect(nativeShort?.intentKind).toBe('classroomInvite');
      expect(nativeShort?.routeParams).toEqual({ classroomCode: 'MATH-ADV' });
    });

    it('deserializes and expands sovereign short links for library resources', () => {
      const resourceShort = deserializeLink('https://gurudevi.app/r/PHYS-101');
      expect(resourceShort).not.toBeNull();
      expect(resourceShort?.intentKind).toBe('resource');
      expect(resourceShort?.path).toBe('/library');
      expect(resourceShort?.routeParams).toEqual({ resourceId: 'PHYS-101' });
    });

    it('rejects unapproved third-party hosts fail-closed', () => {
      expect(deserializeLink('https://evil.attacker.com/workspace')).toBeNull();
      expect(deserializeLink('https://bit.ly/3xyz')).toBeNull();
    });
  });

  describe('Outbound Deterministic Serialization', () => {
    it('serializes canonical universal and native routes with deterministically sorted params', () => {
      const universal = serializeLink(
        {
          path: '/workspace',
          routeParams: { z_param: 'last', a_param: 'first', m_param: 'middle' },
        },
        'universal',
        'sanctuary',
      );
      // Alphabetical sorting guaranteed: a_param -> m_param -> z_param
      expect(universal).toBe(
        'https://sanctuary.gurudevi.app/workspace?a_param=first&m_param=middle&z_param=last',
      );

      const native = serializeLink(
        { path: '/pulse' },
        'native',
      );
      expect(native).toBe('gurudevi://pulse');
    });

    it('serializes sovereign first-party short links cleanly', () => {
      expect(serializeShortLink('classroom', 'BIO-2026')).toBe('https://gurudevi.app/c/BIO-2026');
      expect(serializeShortLink('classroom', 'BIO-2026', 'native')).toBe('gurudevi://c/BIO-2026');
      expect(serializeShortLink('resource', 'RES-99')).toBe('https://gurudevi.app/r/RES-99');
    });
  });
});
