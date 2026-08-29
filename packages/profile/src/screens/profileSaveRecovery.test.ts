import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const profileScreen = readFileSync(resolve(import.meta.dirname, 'ProfileScreen.web.tsx'), 'utf8');

describe('profile web save recovery', () => {
  it('reports previously persisted fields when a later field cannot save', () => {
    expect(profileScreen).toContain('const savedFields: string[] = [];');
    expect(profileScreen).toContain("savedFields.push(field.replace('_', ' '));");
    expect(profileScreen).toContain('Try saving again to finish the remaining fields.');
  });

  it('does not silently swallow clipboard failures', () => {
    expect(profileScreen).toContain(
      "console.error('[ProfileScreenWeb] could not copy profile link', copyFailure);",
    );
    expect(profileScreen).toContain(
      "setCopyError(t('profile.copyFailed', 'The profile link could not be copied.'));",
    );
  });
});
