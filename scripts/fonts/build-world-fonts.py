#!/usr/bin/env python3
"""Builds the fonts the worlds are written in, from google/fonts at a pinned commit.

Each face is cut down to Latin, Sinhala and Tamil (variation tables and every
layout feature kept, so conjuncts and axes still work), and axes a world never
moves are pinned to make the file smaller. Faces with a Reserved Font Name are
copied untouched, because the OFL does not let a modified font keep that name.

    git clone --depth 1 --filter=blob:none --sparse https://github.com/google/fonts /tmp/gf
    git -C /tmp/gf checkout <commit from world-fonts.json>
    git -C /tmp/gf sparse-checkout set <the dirs in world-fonts.json>
    pip install fonttools
    python3 scripts/fonts/build-world-fonts.py /tmp/gf [--tier app|core|bundled|world|all] [--out DIR]

Core and bundled faces go to apps/gurudevi-mobile/src/assets/fonts/world/ and
ship in the app; every current world is bundled, so any world works offline.
The 'world' tier (built into .world-fonts/) is kept for future worlds whose
faces would download when picked.
"""

import argparse
import json
import pathlib
import shutil
import subprocess
import sys

ROOT = pathlib.Path(__file__).resolve().parents[2]
MANIFEST = json.loads((ROOT / 'scripts/fonts/world-fonts.json').read_text())
CORE_OUT = ROOT / 'apps/gurudevi-mobile/src/assets/fonts/world'
WORLD_OUT = ROOT / '.world-fonts'


def out_name(family: str, source: str) -> str:
    stem = source.split('[')[0].replace('.ttf', '')
    if family.endswith(' Width'):
        stem += '-Width'
    return stem + ('-VF' if '[' in source else '') + '.ttf'


def build(gf: pathlib.Path, tiers: set[str], out: pathlib.Path | None) -> int:
    total = 0
    for fam in MANIFEST['families']:
        if fam['tier'] not in tiers:
            continue
        dest = out or (WORLD_OUT if fam['tier'] == 'world' else CORE_OUT)
        dest.mkdir(parents=True, exist_ok=True)
        src_dir = gf / fam['dir']
        shutil.copy(src_dir / 'OFL.txt', dest / f"OFL-{fam['family'].replace(' ', '')}.txt")
        for name in fam['files']:
            src, target = src_dir / name, dest / out_name(fam['family'], name)
            if fam.get('subset', True):
                subprocess.run(
                    ['pyftsubset', str(src), f"--unicodes={MANIFEST['unicodes']}",
                     '--layout-features=*', '--name-IDs=*', '--notdef-outline',
                     f'--output-file={target}'],
                    check=True)
            else:
                shutil.copy(src, target)
            pins = [f'{axis}={value}' for axis, value in fam.get('pin', {}).items()]
            if pins:
                subprocess.run(['fonttools', 'varLib.instancer', str(target), *pins,
                                '-o', str(target), '-q'], check=True)
            size = target.stat().st_size
            total += size
            print(f'{target.relative_to(ROOT)}  {size // 1024} KB')
    print(f'total {total // 1024} KB')
    return 0


if __name__ == '__main__':
    p = argparse.ArgumentParser()
    p.add_argument('google_fonts', type=pathlib.Path)
    p.add_argument('--tier', choices=['core', 'bundled', 'world', 'app', 'all'], default='app')
    p.add_argument('--out', type=pathlib.Path)
    a = p.parse_args()
    sys.exit(build(a.google_fonts, {'all': {'core', 'bundled', 'world'}, 'app': {'core', 'bundled'}}.get(a.tier, {a.tier}), a.out))
