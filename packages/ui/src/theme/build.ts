/**
 * Builds a world's recipes from its tokens and its style choices.
 *
 * This is the one place where "what a world decided" becomes concrete numbers
 * and colours for every generic component. Both renderers (native and DOM)
 * read the result, so mobile and web cannot drift apart.
 */

import { contrastRatio, mix } from './color';
import type {
  BoundaryKind,
  ButtonRecipe,
  ChipRecipe,
  FieldRecipe,
  Radius,
  RowRecipe,
  SectionDensity,
  SectionRecipe,
  SurfaceRecipe,
  SurfaceToneRecipe,
  TextRole,
  TypeStyle,
  WorldMode,
  WorldRecipes,
  WorldStyle,
  WorldTokens,
} from './types';

function type(
  family: TypeStyle['family'],
  size: number,
  lineHeight: number,
  color: string,
  extra: Partial<Omit<TypeStyle, 'family' | 'size' | 'lineHeight' | 'color'>> = {},
): TypeStyle {
  return {
    family,
    size,
    lineHeight,
    color,
    weight: extra.weight ?? '400',
    letterSpacing: extra.letterSpacing ?? 0,
    italic: extra.italic ?? false,
    uppercase: extra.uppercase ?? false,
  };
}

function shrink(radius: Radius, by: number): Radius {
  if (typeof radius === 'number') return Math.max(4, radius - by);
  return radius.map((r) => Math.max(4, r - by)) as unknown as Radius;
}

/** A visible state colour: `lamp` when it reads against the ground, else `lampDeep`. */
function visibleLamp(t: WorldTokens): string {
  return contrastRatio(t.lamp, t.ground) >= 3 ? t.lamp : t.lampDeep;
}

function buildLabel(t: WorldTokens, s: WorldStyle): TypeStyle {
  switch (s.label) {
    case 'smallcaps':
      return type('sans', 11, 15, t.inkSoft, {
        weight: '500',
        letterSpacing: 0.9,
        uppercase: true,
      });
    case 'boldcaps':
      return type('sans', 11, 15, t.lampDeep, {
        weight: '700',
        letterSpacing: 1.3,
        uppercase: true,
      });
    case 'italic':
      return type('serif', 15, 20, t.inkSoft, { italic: true });
  }
}

function buildText(t: WorldTokens, s: WorldStyle): Record<TextRole, TypeStyle> {
  return {
    display: type('serif', 28, 33, t.ink, {
      letterSpacing: s.display?.letterSpacing ?? -0.3,
      weight: s.display?.weight ?? '400',
      italic: s.display?.italic ?? false,
      uppercase: s.display?.uppercase ?? false,
    }),
    title: type('serif', 20, 26, t.ink),
    body: type('sans', 15, 22, t.ink),
    label: buildLabel(t, s),
    caption: type('serif', 14, 19, t.inkSoft, { italic: true }),
    value: type('serif', 15, 20, t.inkSoft, { italic: true }),
  };
}

function buildButton(t: WorldTokens, s: WorldStyle, mode: WorldMode): ButtonRecipe {
  const quietLine = mix(t.ground, t.ink, 0.45);
  const asText = s.quietForm === 'text';
  return {
    radius: s.corner.control,
    gap: 8,
    sizes: {
      sm: { height: 36, paddingX: 14, fontSize: 14 },
      md: { height: 46, paddingX: 20, fontSize: 15 },
      lg: { height: 54, paddingX: 24, fontSize: 16 },
    },
    label: {
      family: 'sans',
      size: 15,
      lineHeight: 20,
      weight: '600',
      letterSpacing: 0,
      italic: false,
      uppercase: false,
    },
    pressedOpacity: 0.82,
    disabledOpacity: 0.4,
    variants: {
      primary: {
        form: 'filled',
        fill:
          s.primary.fill === 'gradient'
            ? { from: mix(t.lamp, '#FFFFFF', 0.3), to: t.lamp }
            : t.lamp,
        ink: t.onLamp,
        edge: null,
        innerEdge: s.primary.doubleEdge ? { width: 1.25, color: t.ornament, inset: 2 } : null,
        glow: s.primary.glow
          ? { color: t.glow, radius: 14, opacity: mode === 'dark' ? 0.45 : 0.35 }
          : null,
        underline: null,
      },
      secondary: {
        form: 'outlined',
        fill: null,
        ink: t.ink,
        edge: { width: s.lineWeight, color: quietLine },
        innerEdge: null,
        glow: null,
        underline: null,
      },
      quiet: asText
        ? {
            form: 'text',
            fill: null,
            ink: t.ink,
            edge: null,
            innerEdge: null,
            glow: null,
            underline: { width: s.lineWeight, color: quietLine },
          }
        : {
            form: 'filled',
            fill: t.sunken,
            ink: t.ink,
            edge: null,
            innerEdge: null,
            glow: null,
            underline: null,
          },
      danger: asText
        ? {
            form: 'text',
            fill: null,
            ink: t.danger,
            edge: null,
            innerEdge: null,
            glow: null,
            underline: { width: s.lineWeight, color: mix(t.ground, t.danger, 0.55) },
          }
        : {
            form: 'filled',
            fill: t.danger,
            ink: t.onDanger,
            edge: null,
            innerEdge: null,
            glow: null,
            underline: null,
          },
    },
  };
}

function buildSurface(t: WorldTokens, s: WorldStyle, mode: WorldMode): SurfaceRecipe {
  const rule = { width: s.lineWeight, color: t.line };
  return {
    plain: {
      fill: null,
      radius: 0,
      padding: 14,
      paddingX: 0,
      edge: null,
      innerEdge: null,
      shadow: null,
      ruleTop: rule,
      ruleBottom: rule,
    },
    raised: {
      fill: t.raised,
      radius: s.corner.surface,
      padding: 16,
      paddingX: 16,
      edge:
        s.raised.edge === 'hairline'
          ? { width: s.lineWeight, color: t.line }
          : s.raised.edge === 'frame'
            ? { width: 1, color: t.ink }
            : null,
      innerEdge: s.raised.edge === 'frame' ? { width: 1, color: t.ornament, inset: 4 } : null,
      shadow: s.raised.shadow
        ? {
            color: mode === 'dark' ? '#000000' : mix(t.ink, '#000000', 0.3),
            opacity: mode === 'dark' ? 0.35 : 0.16,
            radius: 18,
            offsetY: 8,
          }
        : null,
      ruleTop: null,
      ruleBottom: null,
    },
    inset: {
      fill: t.sunken,
      radius: shrink(s.corner.surface, 4),
      padding: 16,
      paddingX: 16,
      edge: null,
      innerEdge: null,
      shadow: null,
      ruleTop: null,
      ruleBottom: null,
    },
  };
}

function buildField(t: WorldTokens, s: WorldStyle, text: Record<TextRole, TypeStyle>): FieldRecipe {
  const underline = s.field === 'underline';
  return {
    form: s.field,
    label: text.label,
    value: underline ? type('serif', 19, 26, t.ink) : type('sans', 16, 22, t.ink),
    placeholder: { color: t.inkFaint, italic: underline },
    hint: type('sans', 12.5, 17, t.inkSoft),
    error: type('sans', 12.5, 17, t.danger),
    minHeight: underline ? 44 : 52,
    paddingX: underline ? 0 : 14,
    radius: underline ? 0 : s.corner.field,
    fill: underline ? null : t.raised,
    states: {
      rest: { edge: { width: s.lineWeight, color: mix(t.ground, t.ink, 0.4) }, glow: null },
      focus: {
        edge: { width: 2, color: t.focus },
        glow: s.primary.glow ? { color: t.glow, radius: 10, opacity: 0.35 } : null,
      },
      error: { edge: { width: 2, color: t.danger }, glow: null },
      disabled: { edge: { width: s.lineWeight, color: t.line }, glow: null },
    },
  };
}

function buildChip(t: WorldTokens, s: WorldStyle): ChipRecipe {
  const underline = s.chip === 'underline';
  return {
    form: s.chip,
    radius: underline ? 0 : s.corner.chip,
    paddingX: underline ? 0 : 14,
    paddingY: underline ? 4 : 7,
    gap: underline ? 18 : 8,
    label: underline
      ? {
          family: 'serif',
          size: 17,
          lineHeight: 22,
          weight: '400',
          letterSpacing: 0,
          italic: false,
          uppercase: false,
        }
      : {
          family: 'sans',
          size: 13.5,
          lineHeight: 18,
          weight: '500',
          letterSpacing: 0,
          italic: false,
          uppercase: false,
        },
    rest: underline
      ? {
          fill: null,
          ink: t.ink,
          edge: null,
          underline: { width: s.lineWeight, color: mix(t.ground, t.ink, 0.3) },
          glow: null,
        }
      : {
          fill: null,
          ink: t.ink,
          edge: { width: 1, color: mix(t.ground, t.ink, 0.45) },
          underline: null,
          glow: null,
        },
    selected: underline
      ? {
          fill: null,
          ink: t.ink,
          edge: null,
          underline: { width: 2, color: visibleLamp(t) },
          glow: null,
        }
      : {
          fill: t.lamp,
          ink: t.onLamp,
          edge: { width: 1, color: t.lamp },
          underline: null,
          glow: s.primary.glow ? { color: t.glow, radius: 12, opacity: 0.35 } : null,
        },
  };
}

function buildRow(t: WorldTokens, text: Record<TextRole, TypeStyle>): RowRecipe {
  return {
    minHeight: 48,
    paddingY: 10,
    gap: 12,
    label: type('sans', 16, 22, t.ink),
    detail: text.value,
    note: type('sans', 12.5, 17, t.inkSoft),
    chevron: t.inkFaint,
    signal: { color: t.lamp, size: 7, glow: { color: t.glow, radius: 8, opacity: 0.6 } },
  };
}

function sectionTitle(
  kind: BoundaryKind,
  t: WorldTokens,
  s: WorldStyle,
  text: Record<TextRole, TypeStyle>,
): TypeStyle {
  switch (kind) {
    case 'margin':
      return s.label === 'italic' ? type('serif', 15, 19, t.inkSoft, { italic: true }) : text.label;
    case 'thread':
    case 'leaves':
      return type('serif', 20, 26, t.ink);
    case 'light':
    case 'boxes':
      return text.label;
  }
}

function buildSection(
  t: WorldTokens,
  s: WorldStyle,
  mode: WorldMode,
  text: Record<TextRole, TypeStyle>,
  surface: SurfaceRecipe,
): Record<SectionDensity, SectionRecipe> {
  const make = (density: SectionDensity): SectionRecipe => {
    const kind = s.boundary[density];
    return {
      kind,
      title: sectionTitle(kind, t, s, text),
      voice: type('serif', 22, 28, t.ink),
      gap: 4,
      paddingX: 20,
      paddingY: density === 'dense' ? 16 : 22,
      marginWidth: 84,
      marginMinWidth: 340,
      rowDivider:
        kind === 'margin' || kind === 'boxes'
          ? { width: Math.max(0.5, s.lineWeight * 0.7), color: t.line }
          : null,
      rule: { width: s.lineWeight, color: t.line },
      thread: { color: mix(t.ground, t.ink, 0.4), width: 1, knot: 11, knotLit: t.lamp },
      leaf: {
        fill: t.raised,
        radius: [5, 5, 5, 5],
        shadow: {
          color: mode === 'dark' ? '#000000' : mix(t.ink, '#000000', 0.3),
          opacity: mode === 'dark' ? 0.4 : 0.2,
          radius: 10,
          offsetY: 6,
        },
        hole: t.ground,
      },
      wash: {
        color: t.glow,
        opacity: mode === 'dark' ? 0.1 : 0.12,
        litOpacity: mode === 'dark' ? 0.22 : 0.3,
      },
      box: surface.raised as SurfaceToneRecipe,
    };
  };
  return { dense: make('dense'), calm: make('calm') };
}

export function buildRecipes(t: WorldTokens, s: WorldStyle, mode: WorldMode): WorldRecipes {
  const text = buildText(t, s);
  const surface = buildSurface(t, s, mode);
  return {
    text,
    button: buildButton(t, s, mode),
    surface,
    field: buildField(t, s, text),
    chip: buildChip(t, s),
    row: buildRow(t, text),
    section: buildSection(t, s, mode, text, surface),
    ornament: { kind: s.ornament, color: t.ornament, accent: t.onLamp },
    motion: { settleMs: 220, breatheMs: 4200 },
  };
}
