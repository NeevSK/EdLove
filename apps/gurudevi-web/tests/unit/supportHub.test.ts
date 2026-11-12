import { describe, expect, it } from 'vitest';
import {
  CONTRIBUTION_TRACKS,
  FUNCTIONALITY_GUIDES,
  SUPPORT_CONTACT_CHANNELS,
  SUPPORT_FAQS,
  SURFACE_COMPARISON,
} from '../../app/(sanctuary)/(support)/supportData';
import { metadata } from '../../app/(sanctuary)/(support)/support/page';
import { CONTACT_EMAILS } from '@repo/core/site';
import {
  EXPLORE_GURUDEVI_HOST,
  PUBLIC_GURUDEVI_HOST,
  resolveHostRouting,
  SANCTUARY_GURUDEVI_HOST,
} from '../../lib/host-routing';
import {
  EXPLORE_SUPPORT_CONFIG,
  getSupportConfig,
  PUBLIC_SUPPORT_CONFIG,
  SANCTUARY_SUPPORT_CONFIG,
} from '../../lib/support/supportConfig';

describe('Support Hub & Functionality Guide Suite', () => {
  describe('Multi-Subdomain Sovereign Support Policy', () => {
    it('serves own support page directly on sanctuary.gurudevi.app without redirecting to public', () => {
      const decision = resolveHostRouting(SANCTUARY_GURUDEVI_HOST, '/support', 'GET');
      expect(decision).toEqual({ kind: 'allow' });
    });

    it('serves own support page directly on explore.gurudevi.app without redirecting', () => {
      const decision = resolveHostRouting(EXPLORE_GURUDEVI_HOST, '/support', 'GET');
      expect(decision).toEqual({ kind: 'allow' });
    });

    it('serves own support page directly on public gurudevi.app', () => {
      const decision = resolveHostRouting(PUBLIC_GURUDEVI_HOST, '/support', 'GET');
      expect(decision).toEqual({ kind: 'allow' });
    });

    it('serves own support page directly on school vanity subdomains', () => {
      const decision = resolveHostRouting('ananda.gurudevi.app', '/support', 'GET');
      expect(decision).toEqual({ kind: 'allow' });
    });

    it('rejects unsafe POST methods across subdomains', () => {
      expect(resolveHostRouting(SANCTUARY_GURUDEVI_HOST, '/support', 'POST')).toEqual({
        kind: 'not-found',
      });
      expect(resolveHostRouting(PUBLIC_GURUDEVI_HOST, '/support', 'POST')).toEqual({
        kind: 'not-found',
      });
    });
  });

  describe('Surface-Specific Support Configurations & Flows', () => {
    it('returns dedicated Explore config with sandbox notice and guest workflows', () => {
      const config = getSupportConfig('explore');
      expect(config.surface).toBe('explore');
      expect(config.badge).toContain('Sandbox');
      expect(config.bannerNotice.type).toBe('sandboxed');
      expect(config.featuredFlows.length).toBeGreaterThanOrEqual(3);
      expect(config.defaultContactCategory).toBe('explore');
      expect(config.guideSurfaceFilter).toBe('explore');
    });

    it('returns dedicated Sanctuary config with workspace notice and teacher workflows', () => {
      const config = getSupportConfig('sanctuary');
      expect(config.surface).toBe('sanctuary');
      expect(config.badge).toContain('Workspace');
      expect(config.bannerNotice.type).toBe('authenticated');
      expect(config.featuredFlows.length).toBeGreaterThanOrEqual(3);
      expect(config.defaultContactCategory).toBe('sanctuary');
      expect(config.guideSurfaceFilter).toBe('sanctuary');
    });

    it('returns dedicated School config when school subdomain is provided', () => {
      const config = getSupportConfig('school', 'royal-college');
      expect(config.surface).toBe('school');
      expect(config.badge).toContain('Royal-college');
      expect(config.defaultContactCategory).toBe('institutional');
      expect(config.featuredFlows.some((f) => f.title.includes('Royal-college'))).toBe(true);
    });

    it('defaults to Public config with full ecology overview', () => {
      const config = getSupportConfig('public');
      expect(config.surface).toBe('public');
      expect(config.featuredFlows.length).toBe(4);
      expect(config.defaultContactCategory).toBe('support');
    });
  });

  describe('Functionality Guides Grounding', () => {
    it('covers both Explore Web and Sanctuary Web surfaces', () => {
      const exploreGuides = FUNCTIONALITY_GUIDES.filter(
        (g) => g.surface === 'explore' || g.surface === 'both',
      );
      const sanctuaryGuides = FUNCTIONALITY_GUIDES.filter(
        (g) => g.surface === 'sanctuary' || g.surface === 'both',
      );

      expect(exploreGuides.length).toBeGreaterThanOrEqual(2);
      expect(sanctuaryGuides.length).toBeGreaterThanOrEqual(3);

      const exploreGuestHouse = FUNCTIONALITY_GUIDES.find((g) => g.id === 'explore-guest-house');
      expect(exploreGuestHouse).toBeDefined();
      expect(exploreGuestHouse?.primaryAction.href).toMatch(/explore\.(gurudevi\.app|localhost)/);

      const classroomWorkspace = FUNCTIONALITY_GUIDES.find(
        (g) => g.id === 'sanctuary-classroom-workspace',
      );
      expect(classroomWorkspace).toBeDefined();
      expect(classroomWorkspace?.keyFeatures.length).toBeGreaterThanOrEqual(3);
    });

    it('documents offline resilience across key guides', () => {
      const offlineGuides = FUNCTIONALITY_GUIDES.filter((g) => Boolean(g.offlineNote));
      expect(offlineGuides.length).toBeGreaterThanOrEqual(4);
    });
  });

  describe('Explore vs Sanctuary Comparison Matrix', () => {
    it('articulates fundamental privacy and credential boundaries', () => {
      const credentialsRow = SURFACE_COMPARISON.find((r) => r.feature.includes('Credentials'));
      expect(credentialsRow).toBeDefined();
      expect(credentialsRow?.explore.toLowerCase()).toContain('none required');
      expect(credentialsRow?.sanctuary.toLowerCase()).toContain('authenticated');

      const storageRow = SURFACE_COMPARISON.find((r) => r.feature.includes('Persistence'));
      expect(storageRow).toBeDefined();
      expect(storageRow?.explore.toLowerCase()).toContain('browser local');
      expect(storageRow?.sanctuary.toLowerCase()).toContain('cloud sync');
    });
  });

  describe('Contribution Pathways', () => {
    it('provides multi-disciplinary contribution tracks', () => {
      const tags = CONTRIBUTION_TRACKS.map((t) => t.tag);
      expect(tags).toContain('Technical');
      expect(tags).toContain('Curriculum');
      expect(tags).toContain('Languages');
      expect(tags).toContain('Educators');
      expect(tags).toContain('Foundation');

      const techTrack = CONTRIBUTION_TRACKS.find((t) => t.id === 'code-and-engineering');
      expect(techTrack?.steps.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Contact Channels & SLA Alignment', () => {
    it('configures canonical support, institutional, and gratitude channels on the official gurudevi.lk domain', () => {
      expect(CONTACT_EMAILS.support).toBe('support@gurudevi.lk');
      expect(CONTACT_EMAILS.institutional).toBe('institutional@gurudevi.lk');
      expect(CONTACT_EMAILS.gratitude).toBe('gratitude@gurudevi.lk');

      const emails = SUPPORT_CONTACT_CHANNELS.map((c) => c.email);
      expect(emails).toContain('support@gurudevi.lk');
      expect(emails).toContain('institutional@gurudevi.lk');
      expect(emails).toContain('gratitude@gurudevi.lk');

      for (const channel of SUPPORT_CONTACT_CHANNELS) {
        expect(channel.name).toBeTruthy();
        expect(channel.purpose).toBeTruthy();
        expect(channel.leadTime).toBeTruthy();
      }
    });
  });

  describe('Troubleshooting & FAQ Integrity', () => {
    it('addresses both explore and sanctuary practical inquiries', () => {
      const exploreFaqs = SUPPORT_FAQS.filter((f) => f.category === 'explore');
      const sanctuaryFaqs = SUPPORT_FAQS.filter((f) => f.category === 'sanctuary');
      const privacyFaqs = SUPPORT_FAQS.filter((f) => f.category === 'privacy');
      const technicalFaqs = SUPPORT_FAQS.filter((f) => f.category === 'technical');

      expect(exploreFaqs.length).toBeGreaterThanOrEqual(1);
      expect(sanctuaryFaqs.length).toBeGreaterThanOrEqual(2);
      expect(privacyFaqs.length).toBeGreaterThanOrEqual(1);
      expect(technicalFaqs.length).toBeGreaterThanOrEqual(1);

      // Verify privacy guarantee question
      const privacyFaq = SUPPORT_FAQS.find((f) => f.question.includes('/self'));
      expect(privacyFaq?.answer.toLowerCase()).toContain('never');
      expect(privacyFaq?.answer.toLowerCase()).toContain('private');
    });
  });

  describe('Support Page Metadata', () => {
    it('publishes descriptive search and agentic discovery metadata', () => {
      expect(metadata.title).toContain('Support');
      expect(metadata.description).toContain('Explore');
      expect(metadata.description).toContain('Sanctuary');
    });
  });
});
