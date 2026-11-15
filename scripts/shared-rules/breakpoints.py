#!/usr/bin/env python3
"""Codemod: every width media query snaps to the three shared sizes.

Sizes come from tokens.layout.breakpoints (packages/ui/src/tokens/index.ts):
phone < 768px (48rem) <= tablet < 1024px (64rem) <= desktop; wide from 1280px (80rem).
A value moves to the nearest boundary. max-width uses the boundary minus .01rem so
phone and tablet rules never both apply at exactly 768px.
"""
import re, sys
B = [(768, '48rem', '47.99rem'), (1024, '64rem', '63.99rem'), (1280, '80rem', '79.99rem')]
def px(v, unit):
    v = float(v)
    return v * 16 if unit in ('rem', 'em') else v
def snap(m):
    kind, v, unit = m.group(1), m.group(2), m.group(3)
    p = px(v, unit)
    b = min(B, key=lambda x: abs(x[0] - p))
    return f"({kind}-width: {b[2] if kind == 'max' else b[1]})"
changed = 0
for p in sys.argv[1:]:
    s = open(p).read()
    def media(mm):
        return re.sub(r"\((max|min)-width\s*:\s*([\d.]+)(px|rem|em)\)", snap, mm.group(0))
    n = re.sub(r"@media[^{]+", media, s)
    if n != s:
        open(p, 'w').write(n); changed += 1
print(changed, 'files changed')
