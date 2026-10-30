import { Group, Inline, Row, Stack } from '@repo/ui/components/web';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('web kit: Stack and Inline', () => {
  it('say their spacing relation, defaulting to siblings in a group', () => {
    render(
      <>
        <Stack data-testid="s" />
        <Inline data-testid="i" gap="group" density="compact" wrap={false} justify="between" />
      </>,
    );
    const s = screen.getByTestId('s');
    expect(s.className).toBe('gd-stack');
    expect(s.dataset).toMatchObject({ gap: 'between', density: 'comfortable', align: 'stretch' });
    const i = screen.getByTestId('i');
    expect(i.dataset).toMatchObject({
      gap: 'group',
      density: 'compact',
      wrap: 'no',
      justify: 'between',
    });
  });
});

describe('web kit: Group', () => {
  it('is a group named by its label and described by its footer, one wrapper per row', () => {
    render(
      <Group label="Look and light" footer="Changes apply to every screen.">
        <Row label="World" detail="Sanctuary" />
        <Row label="Text size" detail="Comfortable" />
      </Group>,
    );
    const group = screen.getByRole('group', { name: 'Look and light' });
    expect(group.getAttribute('aria-describedby')).toBe(
      screen.getByText('Changes apply to every screen.').id,
    );
    expect(group.querySelectorAll('.gd-group-row')).toHaveLength(2);
  });

  it('without a label it is still a group, unnamed', () => {
    render(
      <Group>
        <Row label="Backup" />
      </Group>,
    );
    expect(screen.getByRole('group').hasAttribute('aria-labelledby')).toBe(false);
  });
});
