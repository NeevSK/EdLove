#!/usr/bin/env python3
"""Builds the fonts the worlds are written in, from google/fonts at a pinned commit.

Each face is cut down to Latin, Sinhala and Tamil (variation tables and every
layout feature kept, so conjuncts and axes still work), and axes a world never
moves are pinned to make the file smaller. A variable face's default instance
is moved to weight 400, so text that loses its axes still reads as regular,
not thin or black. Each cut face is renamed so its file name, family name and
PostScript name are one string: Android finds an embedded font by file name
and iOS by PostScript name, and one name works on both. Faces with a Reserved
Font Name are copied untouched (the OFL does not let a modified font keep that
name), and their files take their own PostScript names instead.

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


def out_stem(family: str, source: str) -> str:
    stem = source.split('[')[0].replace('.ttf', '')
    if family.endswith(' Width'):
        stem += '-Width'
    return stem + ('-VF' if '[' in source else '')


def postscript_name(path: pathlib.Path) -> str:
    from fontTools.ttLib import TTFont
    return TTFont(path)['name'].getDebugName(6)


def regular_default(path: pathlib.Path, pins: dict) -> list[str]:
    """Instancer arguments that pin `pins` and move the wght default to 400."""
    from fontTools.ttLib import TTFont
    font = TTFont(path)
    args = [f'{axis}={value}' for axis, value in pins.items()]
    for axis in font['fvar'].axes if 'fvar' in font else []:
        if axis.axisTag == 'wght' and 'wght' not in pins and axis.defaultValue != 400:
            default = min(max(400, axis.minValue), axis.maxValue)
            args.append(f'wght={axis.minValue:g}:{default:g}:{axis.maxValue:g}')
    return args


def rename(path: pathlib.Path, stem: str) -> None:
    """One name for file, family and PostScript, so every platform finds the face."""
    from fontTools.ttLib import TTFont
    font = TTFont(path)
    table = font['name']
    for record in list(table.names):
        if record.nameID in (16, 17, 21, 22):
            table.removeNames(nameID=record.nameID)
    for name_id, value in ((1, stem), (2, 'Regular'), (3, stem), (4, stem), (6, stem), (25, stem)):
        table.setName(value, name_id, 3, 1, 0x409)
        table.setName(value, name_id, 1, 0, 0)
    font.save(path)


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
            src = src_dir / name
            modify = fam.get('subset', True)
            stem = out_stem(fam['family'], name) if modify else postscript_name(src)
            target = dest / f'{stem}.ttf'
            if modify:
                subprocess.run(
                    ['pyftsubset', str(src), f"--unicodes={MANIFEST['unicodes']}",
                     '--layout-features=*', '--name-IDs=*', '--notdef-outline',
                     f'--output-file={target}'],
                    check=True)
            else:
                shutil.copy(src, target)
            if modify:
                args = regular_default(target, fam.get('pin', {}))
                if args:
                    subprocess.run(['fonttools', 'varLib.instancer', str(target), *args,
                                    '-o', str(target), '-q'], check=True)
                rename(target, stem)
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
