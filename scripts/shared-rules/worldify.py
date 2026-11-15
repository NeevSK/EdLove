#!/usr/bin/env python3
"""Codemod: turn raw colours in a page CSS module into world colours.

Rules (one owner = the world):
  - var(--known, <fallback>) -> var(--known)      fallback is dead once the name is defined
  - backdrop/overlay/scrim backgrounds            -> var(--gd-scrim)
  - box-shadow / text-shadow / drop-shadow dark   -> kept (darkness reads as shadow in every world)
  - neutral colours: by lightness and by whether the file was drawn light or dark
      light file: very light -> raised, light-mid -> line, dark -> ink, mid -> ink-soft
      dark file:  very light -> ink,    very dark -> ground/sunken, mid -> ink-soft
  - saturated: red -> danger, green(ish, not teal) -> success, everything else -> lamp
    (text on light grounds uses lamp-deep so it stays readable)
  - alpha is kept with color-mix(in srgb, <world> N%, transparent)
Prints a summary; writes in place with --write.
"""
import colorsys, re, sys

KNOWN = set("""--paper --paper-light --paper-sunken --line --ink --ink-soft --ink-faint --lotus --border
--color-background --color-cream-silence --color-sacred-white --color-charcoal-truth --color-mud-brown
--color-primary --color-sanctuary-saffron --color-action --color-focus --color-paper --color-paper-light
--color-text --color-text-primary --color-foreground --color-text-secondary --color-text-muted --color-ink-muted
--color-surface --color-surface-subtle --color-surface-sunken --color-background-soft --color-paper-hover
--color-border --color-border-subtle --color-gold-deep --color-action-subtle --color-danger --color-error
--color-warning --color-success --color-leaf --color-terra-base --color-ink""".split())

COL = re.compile(r"#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})\b|rgba?\(\s*[\d.]+[\s,]+[\d.]+[\s,]+[\d.]+(?:\s*[,/]\s*[\d.]+%?)?\s*\)")

def parse(c):
    if c.startswith('#'):
        h = c[1:]
        if len(h) in (3, 4): h = ''.join(x * 2 for x in h)
        r, g, b = (int(h[i:i + 2], 16) for i in (0, 2, 4))
        a = int(h[6:8], 16) / 255 if len(h) == 8 else 1.0
        return r, g, b, a
    n = re.findall(r"[\d.]+%?", c)
    r, g, b = (float(x) for x in n[:3])
    a = 1.0
    if len(n) > 3:
        a = float(n[3][:-1]) / 100 if n[3].endswith('%') else float(n[3])
    return r, g, b, a

def lum(r, g, b):
    f = lambda v: (v / 255) / 12.92 if v / 255 <= 0.03928 else ((v / 255 + 0.055) / 1.055) ** 2.4
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)

def token(r, g, b, dark_file, prop):
    if prop.startswith('outline'): return '--w-focus'
    h, l, s = colorsys.rgb_to_hls(r / 255, g / 255, b / 255)
    L = lum(r, g, b)
    neutral = s < 0.22 or l > 0.8 or l < 0.25
    if neutral:
        if dark_file:
            if L > 0.6: return '--w-ink'
            if L < 0.02: return '--w-ground'
            if L < 0.06: return '--w-sunken'
            return '--w-ink-soft'
        if L > 0.8: return '--w-raised'
        if L > 0.5: return '--w-line'
        if L < 0.05: return '--w-ink'
        return '--w-ink-soft'
    deg = h * 360
    if deg < 15 or deg > 340: return '--w-danger'
    if 85 <= deg < 160 and l > 0.35 and s > 0.5: return '--w-success'
    textish = prop in ('color', 'fill', 'stroke', '-webkit-text-fill-color')
    return '--w-lamp-deep' if textish else '--w-lamp'

def render(tok, a):
    if a >= 0.999: return f'var({tok})'
    return f'color-mix(in srgb, var({tok}) {round(a * 100, 1):g}%, transparent)'

def is_dark_file(css):
    # How the file was drawn: most opaque panel backgrounds dark or light.
    # Backgrounds naming the old paper/surface variables were drawn light.
    dark = light = 0
    for m in re.finditer(r"([^{}]+)\{([^{}]*)\}", css):
        if re.search(r"(backdrop|overlay|scrim)", m.group(1), re.I):
            continue
        for d in re.finditer(r"background(?:-color)?\s*:\s*([^;]+);", m.group(2)):
            v = d.group(1)
            if re.search(r"var\(--(paper|color-surface|color-paper|color-cream|color-sacred|w-raised|w-ground)", v):
                light += 1; continue
            cm = COL.search(v)
            if cm:
                r, g, b, a = parse(cm.group(0))
                if a > 0.6:
                    if lum(r, g, b) < 0.15: dark += 1
                    else: light += 1
    return dark > light

def convert(css, dark=None):
    css = re.sub(r"var\((--[\w-]+)\s*,\s*([^()]*(?:\([^()]*\))?[^()]*)\)",
                 lambda m: f"var({m.group(1)})" if (m.group(1) in KNOWN or m.group(1).startswith("--w-")) else m.group(0), css)
    if dark is None: dark = is_dark_file(css)
    out, n = [], 0
    # walk declarations
    def decl(m):
        nonlocal n
        sel_prop, val = m.group(1), m.group(2)
        prop = sel_prop.strip().split()[-1].lower()
        if 'shadow' in prop or 'drop-shadow' in val:
            # Darkness takes the world's shadow tint; a coloured glow takes its world colour.
            def shade(cm):
                nonlocal n
                r, g, b, a = parse(cm.group(0))
                n += 1
                _, l, s_ = colorsys.rgb_to_hls(r / 255, g / 255, b / 255)
                tok = '--w-shadow-tint' if (s_ < 0.22 or l < 0.25) else token(r, g, b, False, 'background')
                return render(tok, a)
            return f"{m.group(1)}:{COL.sub(shade, val)};"
        def rep(cm):
            nonlocal n
            r, g, b, a = parse(cm.group(0))
            n += 1
            return render(token(r, g, b, dark, prop), a)
        return f"{m.group(1)}:{COL.sub(rep, val)};"
    css = re.sub(r"([\w-]+)\s*:([^;{}]*);", decl, css)
    # Text on a lit or danger fill takes the world's paired ink.
    def pair(m):
        body = m.group(2)
        bg = re.search(r"background(?:-color)?\s*:[^;]*var\(--w-(lamp|lamp-deep|danger)\)", body)
        if bg:
            on = '--w-on-danger' if bg.group(1) == 'danger' else '--w-on-lamp'
            if not re.search(r"(^|[;{\s])color\s*:", body) and ':hover' not in m.group(1) and ':active' not in m.group(1):
                body = body.rstrip() + f"\n  color: var({on});\n"

            body = re.sub(r"(\n\s*color\s*:\s*)var\(--w-(raised|ground|ink)\)", lambda c: c.group(1) + f'var({on})', body)
        return m.group(1) + '{' + body + '}'
    css = re.sub(r"([^{}]+)\{([^{}]*)\}", pair, css)
    # A pressed or hovered fill that went darker stays a lit fill, a shade deeper, so its text keeps working.
    def press(m):
        if not re.search(r":(hover|active|focus)", m.group(1)):
            return m.group(0)
        body = re.sub(r"(background(?:-color)?\s*:\s*)var\(--w-(ink|ink-soft)\)", r"\1color-mix(in srgb, var(--w-lamp) 85%, var(--w-ink))", m.group(2))
        return m.group(1) + '{' + body + '}'
    css = re.sub(r"([^{}]+)\{([^{}]*)\}", press, css)
    return css, n, dark

def scrims(css):
    def blk(m):
        sel, body = m.group(1), m.group(2)
        if re.search(r"(backdrop|overlay|scrim)", sel, re.I) and not re.search(r"(Content|Inner|Card|Panel|Header|Title)", sel):
            body = re.sub(r"(background(?:-color)?\s*:\s*)(rgba?\([^)]*\)|#[0-9a-fA-F]{3,8})", r"\1var(--gd-scrim)", body)
        return sel + '{' + body + '}'
    return re.sub(r"([^{}]+)\{([^{}]*)\}", blk, css)

if __name__ == '__main__':
    write = '--write' in sys.argv
    DARK = {a[7:] for a in sys.argv if a.startswith('--dark=')}
    for p in [a for a in sys.argv[1:] if not a.startswith('--')]:
        src = open(p).read()
        new = scrims(src)
        new, n, dark = convert(new, p in DARK)
        left = len(COL.findall(new))
        print(f"{p}: {n} colours -> world ({'dark' if dark else 'light'} drawn), {left} left")
        if write and new != src:
            open(p, 'w').write(new)
