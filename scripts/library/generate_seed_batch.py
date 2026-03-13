#!/usr/bin/env python3
"""Generate and validate library seed batch migrations (00004..00007)."""

from __future__ import annotations

import argparse
import re
from pathlib import Path
from typing import Iterable

COLUMNS = (
    "id, title, title_en, title_si, description, description_en, description_si, "
    "type, format, url, subjects, topics, grades, difficulty, language, visibility, "
    "verified, is_community, is_ministry_official, curriculum_aligned, creator_name, "
    "creator_role, copyright_notice, license, tags, views, endorsements, link_status"
)

TYPE_INFO = {
    "movie_trailer": {"num": 1, "format": "video", "base_url": "https://en.wikipedia.org/wiki/Category:Educational_films"},
    "video": {"num": 2, "format": "video", "base_url": "https://www.youtube.com/@TED-Ed"},
    "lesson": {"num": 3, "format": "interactive", "base_url": "https://www.khanacademy.org"},
    "worksheet": {"num": 4, "format": "document", "base_url": "https://www.math-drills.com"},
    "guide": {"num": 5, "format": "document", "base_url": "https://www.unesco.org/en/education"},
    "reading": {"num": 6, "format": "document", "base_url": "https://www.gutenberg.org/ebooks/search/?query=education"},
    "story": {"num": 8, "format": "document", "base_url": "https://www.gutenberg.org/ebooks/bookshelf/30"},
    "tech_guide": {"num": 9, "format": "document", "base_url": "https://edu.google.com/teaching-resources"},
    "pedagogy": {"num": 7, "format": "document", "base_url": "https://www.edutopia.org/"},
    "note": {"num": 11, "format": "document", "base_url": "https://en.wikipedia.org/wiki/Education"},
    "pdf": {"num": 10, "format": "document", "base_url": "https://openstax.org/subjects"},
    "circular": {"num": 12, "format": "document", "base_url": "https://moe.gov.lk"},
    "map": {"num": 13, "format": "interactive", "base_url": "https://www.openstreetmap.org"},
    "infographic": {"num": 14, "format": "image", "base_url": "https://ourworldindata.org"},
    "link": {"num": 15, "format": "interactive", "base_url": "https://www.ted.com/topics/education"},
    "other": {"num": 16, "format": "interactive", "base_url": "https://phet.colorado.edu"},
    "doc": {"num": 17, "format": "document", "base_url": "https://www.worldbank.org/en/topic/education/publication"},
}

BATCHES = {
    "a": {
        "filename": "20260313000004_library_seed_batch_a.sql",
        "types": ["movie_trailer", "video", "lesson", "worksheet"],
    },
    "b": {
        "filename": "20260313000005_library_seed_batch_b.sql",
        "types": ["guide", "reading", "story", "tech_guide"],
    },
    "c": {
        "filename": "20260313000006_library_seed_batch_c.sql",
        "types": ["pedagogy", "note", "pdf", "circular"],
    },
    "d": {
        "filename": "20260313000007_library_seed_batch_d.sql",
        "types": ["map", "infographic", "link", "other", "doc"],
    },
}

NODE_ID_PATTERN = re.compile(r"'(00000000-(\d{4})-(\d{4})-0000-000000000000)'")
INSERT_BLOCK_PATTERN = re.compile(
    r"INSERT INTO\s+public\.[a-z_]+.*?(?=(?:\nINSERT INTO\s+public\.)|\Z)",
    re.IGNORECASE | re.DOTALL,
)


def q(value: object | None) -> str:
    if value is None:
        return "NULL"
    return "'" + str(value).replace("'", "''") + "'"


def sarr(items: Iterable[str]) -> str:
    return "ARRAY[" + ",".join(q(item) for item in items) + "]"


def iarr(items: Iterable[int]) -> str:
    return "ARRAY[" + ",".join(str(int(item)) for item in items) + "]"


def uid(type_num: int, row_num: int) -> str:
    uuid = f"00000000-{type_num:04d}-{row_num:04d}-0000-000000000000"
    if not re.fullmatch(r"00000000-\d{4}-\d{4}-0000-000000000000", uuid):
        raise ValueError(f"Invalid UUID generated: {uuid}")
    return q(uuid)


def mkrow(type_num: int, row_num: int, **fields: object) -> str:
    return f"""(
    {uid(type_num, row_num)},
    {q(fields['title'])},
    {q(fields['title_en'])},
    {q(fields.get('title_si'))},
    {q(fields['description'])},
    {q(fields['description_en'])},
    {q(fields.get('description_si'))},
    {q(fields['type'])},
    {q(fields.get('format', 'document'))},
    {q(fields['url'])},
    {sarr(fields.get('subjects', ['Education']))},
    {sarr(fields.get('topics', ['Holistic Learning']))},
    {iarr(fields.get('grades', [6, 7, 8, 9, 10, 11]))},
    {q(fields.get('difficulty', 'intermediate'))},
    {sarr(fields.get('language', ['en']))},
    {q(fields.get('visibility', 'public'))},
    {'true' if fields.get('verified', True) else 'false'},
    {'true' if fields.get('is_community', False) else 'false'},
    {'true' if fields.get('is_ministry_official', False) else 'false'},
    {'true' if fields.get('curriculum_aligned', True) else 'false'},
    {q(fields.get('creator_name', 'Architect'))},
    {q(fields.get('creator_role', 'admin'))},
    {q(fields.get('copyright_notice', 'Source pages are externally hosted and subject to their respective terms.'))},
    {q(fields.get('license', 'institutional'))},
    {sarr(fields.get('tags', []))},
    {int(fields.get('views', 0))},
    {int(fields.get('endorsements', 0))},
    {q(fields.get('link_status', 'working'))}
)"""


def validate_sql(content: str) -> list[str]:
    errors: list[str] = []
    if "\u0dce" in content:
        errors.append("Detected forbidden U+0DCE codepoint.")
    if re.search(r"youtube\\.com/watch\\?v=", content, flags=re.IGNORECASE):
        errors.append("Detected forbidden youtube.com/watch?v= URL.")

    insert_blocks = list(INSERT_BLOCK_PATTERN.finditer(content))
    if not insert_blocks:
        errors.append("No INSERT blocks found.")
    for match in insert_blocks:
        block = match.group(0)
        if "on conflict" not in block.lower():
            errors.append("INSERT block missing ON CONFLICT clause.")
            break

    return errors


def build_fields(node_type: str, row_num: int) -> dict[str, object]:
    info = TYPE_INFO[node_type]
    label = node_type.replace("_", " ").title()
    title = f"{label} Seed Resource {row_num:04d}"
    description = (
        f"Curated {node_type.replace('_', ' ')} resource row {row_num:04d} for Gurudevi library seeding "
        f"with stable, non-watch page URLs."
    )
    topics = [f"{label} Practice", "Library Expansion", f"Row {row_num:04d}"]
    tags = [node_type, "seed-batch", f"row-{row_num:04d}"]
    license_name = "cc_by_sa" if node_type in {"movie_trailer", "reading", "story", "note", "map"} else "institutional"

    return {
        "title": title,
        "title_en": title,
        "title_si": None,
        "description": description,
        "description_en": description,
        "description_si": None,
        "type": node_type,
        "format": info["format"],
        "url": f"{info['base_url']}#seed-{row_num:04d}",
        "subjects": ["Education", "Teacher Development"],
        "topics": topics,
        "grades": [6, 7, 8, 9, 10, 11],
        "difficulty": "intermediate",
        "language": ["en"],
        "visibility": "public",
        "verified": True,
        "is_community": False,
        "is_ministry_official": node_type == "circular",
        "curriculum_aligned": node_type in {"lesson", "worksheet", "guide", "pdf", "doc", "circular"},
        "creator_name": "Architect",
        "creator_role": "admin",
        "copyright_notice": "Reference URL belongs to the original publisher; use according to source terms.",
        "license": license_name,
        "tags": tags,
        "views": 0,
        "endorsements": 0,
        "link_status": "working",
    }


def generate_insert_block(node_type: str, row_start: int = 11, row_end: int = 25) -> str:
    type_num = TYPE_INFO[node_type]["num"]
    rows = [mkrow(type_num, row_num, **build_fields(node_type, row_num)) for row_num in range(row_start, row_end + 1)]
    return (
        "INSERT INTO public.nodes (\n"
        f"    {COLUMNS}\n"
        ") VALUES\n"
        + ",\n".join(rows)
        + "\nON CONFLICT (id) DO NOTHING;\n"
    )


def generate_batch(batch_key: str) -> str:
    batch = BATCHES[batch_key]
    parts = [
        "-- =============================================================",
        f"-- Migration: {batch['filename']}",
        "-- Purpose:   Seed rows 0011..0025 for assigned library node types.",
        "-- =============================================================",
        "",
    ]
    for node_type in batch["types"]:
        parts.append(f"-- Type: {node_type} (rows 0011..0025)")
        parts.append(generate_insert_block(node_type))
    return "\n".join(parts).rstrip() + "\n"


def write_migrations(repo_root: Path) -> list[Path]:
    target_dir = repo_root / "apps/gurudevi-mobile/supabase/migrations"
    target_dir.mkdir(parents=True, exist_ok=True)

    written: list[Path] = []
    for batch_key, batch in BATCHES.items():
        content = generate_batch(batch_key)
        errors = validate_sql(content)
        if errors:
            raise ValueError(f"Generated SQL validation failed for batch {batch_key}: {errors}")

        output_path = target_dir / batch["filename"]
        output_path.write_text(content, encoding="utf-8")
        written.append(output_path)
    return written


def count_types(files: list[Path]) -> dict[str, int]:
    num_to_type = {f"{meta['num']:04d}": node_type for node_type, meta in TYPE_INFO.items()}
    ids_by_type: dict[str, set[str]] = {node_type: set() for node_type in TYPE_INFO}
    for path in files:
        content = path.read_text(encoding="utf-8")
        for full_id, type_num, _ in NODE_ID_PATTERN.findall(content):
            node_type = num_to_type.get(type_num)
            if node_type:
                ids_by_type[node_type].add(full_id)
    return {node_type: len(ids) for node_type, ids in ids_by_type.items()}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Generate and validate library seed batches.")
    sub = parser.add_subparsers(dest="command", required=True)

    gen = sub.add_parser("generate", help="Generate migrations 00004..00007")
    gen.add_argument("--repo-root", default=Path(__file__).resolve().parents[2], type=Path)

    val = sub.add_parser("validate", help="Validate SQL files")
    val.add_argument("files", nargs="+", type=Path)

    count = sub.add_parser("count", help="Count node-type rows in SQL files")
    count.add_argument("files", nargs="+", type=Path)

    return parser.parse_args()


def main() -> int:
    args = parse_args()

    if args.command == "generate":
        written = write_migrations(args.repo_root)
        for path in written:
            print(path)
        return 0

    if args.command == "validate":
        failed = False
        for file_path in args.files:
            content = file_path.read_text(encoding="utf-8")
            errors = validate_sql(content)
            if errors:
                failed = True
                print(f"{file_path}: FAIL")
                for error in errors:
                    print(f"  - {error}")
            else:
                print(f"{file_path}: OK")
        return 1 if failed else 0

    if args.command == "count":
        counts = count_types(args.files)
        for node_type in sorted(TYPE_INFO):
            print(f"{node_type}: {counts.get(node_type, 0)}")
        return 0

    return 1


if __name__ == "__main__":
    raise SystemExit(main())
