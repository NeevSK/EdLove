import { tokens } from '../tokens';

describe('Gurudevi visual foundation', () => {
  it('keeps shared colors semantic and within the sanctuary palette laws', () => {
    const values = Object.values(tokens.colors);

    expect(values).not.toContain('#FFFFFF');
    expect(values).not.toContain('#000000');
    expect(values.some((value) => value.includes('rgba(0, 0, 0'))).toBe(false);
    expect(tokens.semantic.surface.page).toBe(tokens.colors.background);
    expect(tokens.semantic.text.primary).toBe(tokens.colors.ink);
  });

  it('provides a stable responsive frame rhythm', () => {
    expect(tokens.layout.pageFrame.gutter.phone).toBeLessThan(
      tokens.layout.pageFrame.gutter.desktop,
    );
    expect(tokens.layout.pageFrame.maxWidth.desktop).toBeGreaterThan(
      tokens.layout.pageFrame.maxWidth.tablet,
    );
    expect(tokens.interaction.minTouchTarget).toBeGreaterThanOrEqual(44);
  });
});
