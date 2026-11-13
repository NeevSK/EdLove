#!/usr/bin/env python3
"""Codemod: page transitions take the world's motion.

In `transition` and `transition-duration` declarations only (keyframe
animations keep their own rhythm), each part's duration becomes the world's:
  <= 200ms -> var(--w-dur-micro)
  <= 400ms -> var(--w-dur)
  <= 600ms -> var(--w-dur-meaningful)
  longer   -> kept
and its curve (ease, ease-out, ease-in-out, cubic-bezier) becomes var(--w-ease).
A second time in a part is a delay and is kept. Writes in place with --write.
"""
import re, sys

DUR = re.compile(r"(?<![\w.-])(\d*\.?\d+)(ms|s)\b")
EASE = re.compile(r"cubic-bezier\([^)]*\)|\bease(?:-in-out|-out|-in)?\b")

def split_parts(v):
    parts, depth, cur = [], 0, ''
    for ch in v:
        if ch == '(':
            depth += 1
        elif ch == ')':
            depth -= 1
        if ch == ',' and depth == 0:
            parts.append(cur); cur = ''
        else:
            cur += ch
    parts.append(cur)
    return parts

def world_dur(m):
    ms = float(m.group(1)) * (1000 if m.group(2) == 's' else 1)
    if ms <= 1: return None  # 0.01ms reduced-motion tricks
    if ms <= 200: return 'var(--w-dur-micro)'
    if ms <= 400: return 'var(--w-dur)'
    if ms <= 600: return 'var(--w-dur-meaningful)'
    return None

def part(p):
    done = [False]
    def d(m):
        if done[0]: return m.group(0)
        done[0] = True
        return world_dur(m) or m.group(0)
    p = DUR.sub(d, p)
    return EASE.sub('var(--w-ease)', p)

def convert(css):
    n = [0]
    def decl(m):
        prop, val = m.group(1), m.group(2)
        if prop == 'transition-duration':
            new = ','.join(DUR.sub(lambda x: world_dur(x) or x.group(0), p) for p in split_parts(val))
        else:
            new = ','.join(part(p) for p in split_parts(val))
        if new != val: n[0] += 1
        return f"{prop}:{new};"
    css = re.sub(r"(?<![\w-])(transition|transition-duration)\s*:([^;{}]*);", decl, css)
    return css, n[0]

if __name__ == '__main__':
    write = '--write' in sys.argv
    total = 0
    for p in [a for a in sys.argv[1:] if not a.startswith('--')]:
        src = open(p).read()
        new, n = convert(src)
        total += n
        if n: print(f"{p}: {n}")
        if write and new != src: open(p, 'w').write(new)
    print('declarations changed:', total)
