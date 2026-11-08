import { describe, expect, it } from 'vitest';
import { cardPath, parseCard } from './cards.adapter';

const card = (body: string) => `---\ntitle: "X"\nstatus: "admitted"\n---\n\n# X\n\n${body}`;

describe('cards adapter', () => {
  it('places platform cards under platform/ and domain cards under their domain', () => {
    expect(cardPath('identity')).toBe('docs/architecture/domains/platform/identity.md');
    expect(cardPath('learning.assignments')).toBe(
      'docs/architecture/domains/learning/assignments.md',
    );
  });

  it('reads backticked capabilities under Commands and Queries only', () => {
    const parsed = parseCard(
      'learning.assignments',
      'p.md',
      card(
        '## Facts it owns\n\n- `learning.assignments.notACapability`\n\n## Commands\n\n- `learning.assignments.submit`\n- `learning.assignments.withdraw`, with a note\n\n## Queries\n\n- `learning.assignments.list`\n\n## Events it publishes\n\n- `learning.assignment.submitted`\n',
      ),
    );
    expect(parsed).toEqual({
      module: 'learning.assignments',
      path: 'p.md',
      status: 'admitted',
      commands: ['learning.assignments.submit', 'learning.assignments.withdraw'],
      queries: ['learning.assignments.list'],
    });
  });

  it('accepts headings in any case and with trailing spaces', () => {
    const parsed = parseCard(
      'identity',
      'p.md',
      card('## commands  \n- `identity.a`\n## QUERIES\n- `identity.b`\n'),
    );
    expect([parsed.commands, parsed.queries]).toEqual([['identity.a'], ['identity.b']]);
  });

  it('reads a card without those sections as listing nothing, and an unquoted status', () => {
    const parsed = parseCard('identity', 'p.md', '---\nstatus: draft\n---\n# Identity\n');
    expect(parsed).toMatchObject({ status: 'draft', commands: [], queries: [] });
  });

  it('marks a card with no recognised status as unknown', () => {
    expect(parseCard('identity', 'p.md', '# No frontmatter\n').status).toBe('unknown');
  });
});
