/**
 * Builds a world's recipes from its tokens and its style choices.
 *
 * This is the one place where "what a world decided" becomes concrete numbers
 * and colours for every generic component. Both renderers (native and DOM)
 * read the result, so mobile and web cannot drift apart.
 */

import { alpha, contrastRatio, mix } from './color';
import type {
  BoundaryKind,
  ButtonRecipe,
  CardRecipe,
  ChipRecipe,
  FieldRecipe,
  GroupRecipe,
  MaterialRecipe,
  OverlayRecipe,
  Radius,
  RowRecipe,
  SectionDensity,
  SectionRecipe,
  StatusRecipe,
  SurfaceRecipe,
  SurfaceToneRecipe,
  TextRole,
  ToggleRecipe,
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

function buildMaterial(t: WorldTokens, s: WorldStyle, mode: WorldMode): MaterialRecipe {
  const m = s.material ?? {};
  const light = m.light ?? (s.primary.glow ? 'within' : 'over');
  const vivid = m.response === 'vivid';
  const lit = light === 'none' ? 0 : 1;
  // A warm centre leans toward the world's own light; a cool edge toward its line.
  const temperature = m.temperature ?? 0.4;
  const warm = Math.max(0, temperature) * 0.08;
  const cool = Math.max(0, -temperature) * 0.08;
  const shadow =
    m.shadow === 'neutral'
      ? mode === 'dark'
        ? '#000000'
        : mix(t.ink, '#000000', 0.3)
      : mode === 'dark'
        ? mix('#000000', t.glow, 0.12)
        : mix(mix(t.ink, t.ornament, 0.3), '#000000', 0.25);
  const glow = (base: number) => (vivid ? base * 1.6 : base) * lit;
  return {
    light,
    grain: m.grain ?? 0,
    wash: {
      centre: mix(mix(t.raised, t.glow, warm), t.line, cool),
      edge: temperature === 0 ? t.raised : mix(t.raised, warm > 0 ? t.line : t.glow, 0.06),
    },
    shadow,
    detail: m.detail ?? (s.ornament === 'hairline' ? 'sparse' : 'focused'),
    states: {
      rest: { edge: mix(t.ground, t.ink, 0.4), glow: t.glow, glowOpacity: 0, lift: 0 },
      focus: { edge: t.focus, glow: t.glow, glowOpacity: glow(0.22), lift: 0.04 * lit },
      press: {
        edge: visibleLamp(t),
        glow: t.glow,
        glowOpacity: glow(0.16),
        lift: (vivid ? 0.14 : 0.08) * lit,
      },
      invalid: { edge: t.danger, glow: t.danger, glowOpacity: glow(0.14), lift: 0 },
      success: { edge: t.success, glow: t.success, glowOpacity: glow(0.2), lift: 0.04 * lit },
    },
    responseMs: vivid ? 260 : 200,
  };
}

function buildSurface(
  t: WorldTokens,
  s: WorldStyle,
  mode: WorldMode,
  material: MaterialRecipe,
): SurfaceRecipe {
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
            color: material.shadow,
            opacity: mode === 'dark' ? 0.35 : 0.16,
            radius: 18,
            offsetY: 8,
          }
        : null,
      ruleTop: null,
      ruleBottom: null,
      wash: material.wash.centre === material.wash.edge ? null : material.wash,
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

function buildOverlay(
  t: WorldTokens,
  s: WorldStyle,
  mode: WorldMode,
  surface: SurfaceRecipe,
): OverlayRecipe {
  const r = s.corner.surface;
  const top: Radius = typeof r === 'number' ? [r, r, 0, 0] : [r[0], r[1], 0, 0];
  return {
    // Light worlds dim with their own ink; dark worlds deepen with their ground.
    scrim: mode === 'dark' ? alpha(t.ground, 0.72) : alpha(t.ink, 0.42),
    panel: { ...surface.raised, padding: 20, paddingX: 20 },
    sheetRadius: top,
    grabber: t.line,
    tip: { fill: t.ink, ink: t.ground, radius: shrink(s.corner.control, 2) },
    toast: {
      info: { edge: t.line },
      success: { edge: t.success },
      danger: { edge: t.danger },
    },
  };
}

/** A radius, each corner capped at `max`. */
function capRadius(r: Radius, max: number): Radius {
  return typeof r === 'number'
    ? Math.min(r, max)
    : [Math.min(r[0], max), Math.min(r[1], max), Math.min(r[2], max), Math.min(r[3], max)];
}

function buildToggle(t: WorldTokens, s: WorldStyle): ToggleRecipe {
  const edge = { width: Math.max(1.5, s.lineWeight), color: mix(t.ground, t.ink, 0.45) };
  return {
    size: 22,
    radius: capRadius(s.corner.chip, 6),
    edge,
    on: { fill: t.lamp, mark: t.onLamp },
    track: { off: t.line, on: t.lamp, height: 4 },
    thumb: { fill: t.raised, edge: { width: 2, color: t.lamp }, size: 24 },
  };
}

function buildStatus(t: WorldTokens, s: WorldStyle): StatusRecipe {
  const hair = (color: string) => ({ width: Math.max(1, s.lineWeight), color });
  return {
    badge: {
      neutral: { fill: t.sunken, ink: t.inkSoft, edge: null },
      lamp: { fill: t.lamp, ink: t.onLamp, edge: null },
      // Success and danger keep the page's paper and carry their colour in the
      // edge and words, so they stay legible in every world.
      success: { fill: t.raised, ink: t.ink, edge: hair(t.success) },
      danger: { fill: t.danger, ink: t.onDanger, edge: null },
    },
    badgeRadius: s.corner.chip,
    progress: { track: t.sunken, fill: t.lamp, height: 6 },
    avatar: { fill: t.raised, ink: t.ink, edge: hair(t.ornament) },
  };
}

function buildGroup(
  t: WorldTokens,
  s: WorldStyle,
  text: Record<TextRole, TypeStyle>,
  surface: SurfaceRecipe,
): GroupRecipe {
  const raised = surface.raised;
  return {
    // Rows bring their own padding; the group only holds them.
    surface: { ...raised, padding: 0, paddingX: 0 },
    divider: { width: s.lineWeight, color: t.line },
    indent: raised.paddingX,
    label: text.label,
    footer: text.caption,
  };
}

function buildCard(
  t: WorldTokens,
  s: WorldStyle,
  text: Record<TextRole, TypeStyle>,
  surface: SurfaceRecipe,
): CardRecipe {
  const raised = surface.raised;
  return {
    surface: { ...raised, padding: 0, paddingX: 0 },
    radius: {
      tile: raised.radius,
      wide: raised.radius,
      square: raised.radius,
      pill: 999,
    },
    title: type(text.title.family, 16, 21, t.ink, { weight: '600' }),
    meta: text.caption,
    gap: 8,
    padding: 12,
    selectedEdge: { width: 2, color: visibleLamp(t) },
    veil: alpha(t.ink, 0.62),
    veilInk: t.ground,
    dot: { off: mix(t.ground, t.ink, 0.25), on: visibleLamp(t), size: 6 },
  };
}

export function buildRecipes(t: WorldTokens, s: WorldStyle, mode: WorldMode): WorldRecipes {
  const text = buildText(t, s);
  const material = buildMaterial(t, s, mode);
  const surface = buildSurface(t, s, mode, material);
  return {
    text,
    button: buildButton(t, s, mode),
    surface,
    field: buildField(t, s, text),
    chip: buildChip(t, s),
    row: buildRow(t, text),
    section: buildSection(t, s, mode, text, surface),
    overlay: buildOverlay(t, s, mode, surface),
    toggle: buildToggle(t, s),
    status: buildStatus(t, s),
    group: buildGroup(t, s, text, surface),
    card: buildCard(t, s, text, surface),
    material,
    ornament: { kind: s.ornament, color: t.ornament, accent: t.onLamp },
    motion: { settleMs: 220, breatheMs: 4200 },
  };
}
