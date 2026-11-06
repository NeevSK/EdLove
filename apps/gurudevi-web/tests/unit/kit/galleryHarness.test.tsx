import { describe, expect, it } from 'vitest';
import KitGalleryPage from '../../../app/(sanctuary)/kit/page';

describe('Web Kit Gallery Route Dev Guard', () => {
  it('Hostile Test 1: Production Lockdown Guard', () => {
    const originalEnv = process.env.NODE_ENV;
    try {
      // Force production mode to verify the hostile security check
      (process.env as Record<string, string>).NODE_ENV = 'production';
      expect(() => KitGalleryPage()).toThrow();
    } finally {
      (process.env as Record<string, string>).NODE_ENV = originalEnv;
    }
  });

  it('Hostile Test 2: Development Render Success', () => {
    const originalEnv = process.env.NODE_ENV;
    try {
      (process.env as Record<string, string>).NODE_ENV = 'development';
      const result = KitGalleryPage();
      expect(result).toBeDefined();
    } finally {
      (process.env as Record<string, string>).NODE_ENV = originalEnv;
    }
  });
});
