import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const page = (name: string) => readFileSync(resolve(import.meta.dirname, `../pages/${name}.astro`), 'utf8');
const migration = readFileSync(
  resolve(import.meta.dirname, '../../../gurudevi-mobile/supabase/migrations/20260901100000_account_deletion_request_policy.sql'),
  'utf8',
);

describe('public account deletion policy', () => {
  it('exposes a public request route and links it to the retention policy', () => {
    const deletionPage = page('delete-account');
    const privacyPage = page('privacy');

    expect(deletionPage).toContain('Request deletion here');
    expect(deletionPage).toContain('href="/privacy#retention-and-deletion"');
    expect(privacyPage).toContain('id="retention-and-deletion"');
    expect(privacyPage).toContain('href="/delete-account"');
  });

  it('does not claim that a request or soft deactivation is final deletion', () => {
    const deletionPage = page('delete-account');
    const privacyPage = page('privacy');

    expect(deletionPage).toContain('is not presented as completed deletion');
    expect(privacyPage).toContain('Soft deactivation stops ordinary account access; it is not a substitute for deletion.');
  });

  it('keeps the legacy hard-delete RPC out of browser roles', () => {
    expect(migration).toMatch(/REVOKE EXECUTE ON FUNCTION public\.delete_user_account\(\) FROM PUBLIC, anon, authenticated;/);
    expect(migration).toContain('CREATE OR REPLACE FUNCTION public.request_account_deletion()');
    expect(migration).not.toMatch(/GRANT EXECUTE ON FUNCTION public\.delete_user_account\(\).*\b(anon|authenticated)\b/i);
  });
});
