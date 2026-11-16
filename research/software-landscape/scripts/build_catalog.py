#!/usr/bin/env python3
"""Validate curated CSV records and build a disposable SQLite search catalog."""
from __future__ import annotations

import argparse
import csv
from datetime import date, datetime
import sqlite3
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CATALOG = ROOT / "catalog"
DB = ROOT / "build" / "catalog.sqlite"
TABLES = {
    "candidates": ["candidate_id", "name", "category", "candidate_type", "stack_claim", "license_claim", "discovery_lane", "fit_question", "discovery_stage", "created_at", "updated_at"],
    "repositories": ["repository_id", "candidate_id", "repository_url", "relationship", "source_role", "notes"],
    "sources": ["source_id", "source_type", "title", "source_url", "publisher", "published_on", "accessed_on", "locator", "source_status", "notes"],
    "components": ["component_id", "candidate_id", "repository_id", "component_name", "component_type", "language_runtime", "integration_mode", "version_scope", "evidence_status", "notes"],
    "candidate_relationships": ["relationship_id", "source_candidate_id", "target_candidate_id", "relationship", "source_id", "observed_on", "verification_status", "notes"],
    "candidate_discovery_sources": ["mention_id", "candidate_id", "source_id", "observed_on", "locator", "signal_type", "disposition", "notes"],
    "discovery_observations": ["observation_id", "repository_id", "source_id", "observed_on", "observed_at", "chart_name", "rank", "stars", "stars_gained", "days_on_chart", "notes"],
    "claims": ["claim_id", "candidate_id", "field", "raw_claim", "normalized_value", "source_url", "source_id", "source_kind", "observed_on", "verification_status", "confidence", "notes"],
    "license_scopes": ["license_scope_id", "candidate_id", "repository_id", "component_id", "artifact_scope", "artifact_name", "version_expression", "license_expression", "source_id", "observed_on", "verification_status", "notes"],
    "interoperability_claims": ["interoperability_id", "candidate_id", "component_id", "standard_or_protocol", "capability", "direction", "version_scope", "source_id", "observed_on", "verification_status", "notes"],
    "deployment_claims": ["deployment_id", "candidate_id", "deployment_model", "offline_capability", "sync_model", "server_or_hardware_requirements", "source_id", "observed_on", "verification_status", "notes"],
    "maturity_assessments": ["maturity_id", "candidate_id", "dimension", "assessment", "rationale", "source_id", "observed_on", "confidence"],
    "fit_assessments": ["fit_id", "candidate_id", "target_capability", "integration_mode", "assessment", "rationale", "source_id", "assessed_on", "confidence"],
    "context_comparisons": ["comparison_id", "candidate_id", "context_name", "comparison_axis", "candidate_fact", "context_fact", "relationship", "implication", "candidate_source_id", "context_source_id", "assessed_on", "confidence"],
    "search_runs": ["run_id", "source", "search_family", "started_at", "method", "sort_mode", "filters", "limitations"],
    "search_queries": ["query_id", "run_id", "capability", "query_text", "query_url", "sort_mode", "filters", "observed_result_count", "count_kind", "notes"],
    "search_results": ["result_id", "query_id", "source_id", "observed_on", "result_rank", "full_name", "repository_url", "description", "primary_language", "stars", "forks", "open_issues", "license_spdx", "archived", "created_at", "pushed_at", "notes"],
    "repository_observations": ["observation_id", "repository_id", "source_id", "observed_on", "stars", "forks", "open_issues", "archived", "pushed_at", "latest_release_at", "notes"],
}

def read_rows(name: str) -> list[dict[str, str]]:
    path = CATALOG / f"{name}.csv"
    with path.open(encoding="utf-8-sig", newline="") as stream:
        reader = csv.DictReader(stream)
        if reader.fieldnames != TABLES[name]:
            raise ValueError(f"{path}: expected headers {TABLES[name]}, got {reader.fieldnames}")
        return list(reader)

def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--search", help="full-text search the built candidate index")
    args = parser.parse_args()
    rows = {name: read_rows(name) for name in TABLES}
    for name, items in rows.items():
        key = TABLES[name][0]
        ids = [item[key] for item in items]
        if any(not value for value in ids) or len(ids) != len(set(ids)):
            raise ValueError(f"{name}: blank or duplicate {key}")
    candidate_ids = {row["candidate_id"] for row in rows["candidates"]}
    repo_ids = {row["repository_id"] for row in rows["repositories"]}
    repo_candidate = {row["repository_id"]: row["candidate_id"] for row in rows["repositories"]}
    component_ids = {row["component_id"] for row in rows["components"]}
    component_candidate = {row["component_id"]: row["candidate_id"] for row in rows["components"]}
    run_ids = {row["run_id"] for row in rows["search_runs"]}
    query_ids = {row["query_id"] for row in rows["search_queries"]}
    for row in rows["repositories"] + rows["claims"] + rows["components"] + rows["license_scopes"] + rows["interoperability_claims"] + rows["deployment_claims"] + rows["maturity_assessments"] + rows["fit_assessments"]:
        if row["candidate_id"] not in candidate_ids:
            raise ValueError(f"unknown candidate {row['candidate_id']}")
    for row in rows["repository_observations"]:
        if row["repository_id"] not in repo_ids:
            raise ValueError(f"unknown repository {row['repository_id']}")
    for row in rows["discovery_observations"]:
        if row["repository_id"] not in repo_ids:
            raise ValueError(f"unknown repository {row['repository_id']} in discovery_observations")
    for row in rows["search_queries"]:
        if row["run_id"] not in run_ids:
            raise ValueError(f"unknown search run {row['run_id']}")
    for row in rows["search_results"]:
        if row["query_id"] not in query_ids:
            raise ValueError(f"unknown query {row['query_id']} in search_results")
    for row in rows["candidate_discovery_sources"]:
        if row["candidate_id"] not in candidate_ids:
            raise ValueError(f"unknown candidate {row['candidate_id']} in candidate_discovery_sources")
    for row in rows["candidate_relationships"]:
        for field in ("source_candidate_id", "target_candidate_id"):
            if row[field] not in candidate_ids:
                raise ValueError(f"unknown candidate {row[field]} in candidate_relationships")
    for name in ("components", "license_scopes", "interoperability_claims"):
        for row in rows[name]:
            repository_id = row.get("repository_id")
            if repository_id and (repository_id not in repo_ids or repo_candidate[repository_id] != row["candidate_id"]):
                raise ValueError(f"repository {repository_id} is missing or belongs to another candidate in {name}")
            component_id = row.get("component_id")
            if component_id and (component_id not in component_ids or component_candidate[component_id] != row["candidate_id"]):
                raise ValueError(f"component {component_id} is missing or belongs to another candidate in {name}")
    source_ids = {row["source_id"] for row in rows["sources"]}
    for name in ("claims", "license_scopes", "interoperability_claims", "deployment_claims", "maturity_assessments", "fit_assessments", "repository_observations", "candidate_relationships", "candidate_discovery_sources", "discovery_observations", "search_results"):
        for row in rows[name]:
            if row["source_id"] not in source_ids:
                raise ValueError(f"unknown source {row['source_id']} in {name}")
    for row in rows["context_comparisons"]:
        if row["candidate_id"] and row["candidate_id"] not in candidate_ids:
            raise ValueError(f"unknown candidate {row['candidate_id']} in context_comparisons")
        for field in ("candidate_source_id", "context_source_id"):
            if row[field] not in source_ids:
                raise ValueError(f"unknown source {row[field]} in context_comparisons")
    for name, fields in {
        "candidates": ("created_at", "updated_at"), "sources": ("published_on", "accessed_on"),
        "claims": ("observed_on",), "license_scopes": ("observed_on",),
        "interoperability_claims": ("observed_on",), "deployment_claims": ("observed_on",),
        "maturity_assessments": ("observed_on",), "fit_assessments": ("assessed_on",),
        "candidate_relationships": ("observed_on",),
        "candidate_discovery_sources": ("observed_on",),
        "discovery_observations": ("observed_on", "observed_at"),
        "context_comparisons": ("assessed_on",),
        "search_runs": ("started_at",), "search_queries": (),
        "search_results": ("observed_on", "created_at", "pushed_at"),
        "repository_observations": ("observed_on", "pushed_at", "latest_release_at"),
    }.items():
        for row in rows[name]:
            for field in fields:
                value = row[field]
                if not value:
                    continue
                try:
                    date.fromisoformat(value[:10]) if len(value) == 10 else datetime.fromisoformat(value.replace("Z", "+00:00"))
                except ValueError as exc:
                    raise ValueError(f"{name}.{field} must be ISO date/time, got {value!r}") from exc

    DB.parent.mkdir(parents=True, exist_ok=True)
    if DB.exists():
        DB.unlink()
    db = sqlite3.connect(DB)
    try:
        db.executescript((ROOT / "schema.sql").read_text(encoding="utf-8"))
        db.execute("PRAGMA journal_mode=WAL")
        for name, items in rows.items():
            if items:
                cols = TABLES[name]
                sql = f"INSERT INTO {name} ({','.join(cols)}) VALUES ({','.join('?' for _ in cols)})"
                nullable = {"observed_result_count", "stars", "forks", "open_issues", "archived", "pushed_at", "latest_release_at", "published_on", "repository_id", "component_id", "candidate_id", "rank", "stars_gained", "days_on_chart", "license_spdx", "created_at"}
                values = []
                for item in items:
                    row = []
                    for col in cols:
                        value = item[col]
                        if col in nullable and value == "":
                            value = None
                        elif col in {"observed_result_count", "stars", "forks", "open_issues", "archived", "rank", "stars_gained", "days_on_chart", "result_rank"} and value is not None:
                            value = int(value)
                        row.append(value)
                    values.append(row)
                db.executemany(sql, values)
        db.executemany("INSERT INTO candidate_search VALUES (?,?,?,?,?,?,?)", [
            [r["candidate_id"], r["name"], r["category"], r["stack_claim"], r["license_claim"], r["discovery_lane"], r["fit_question"]]
            for r in rows["candidates"]
        ])
        if rows["search_results"]:
            db.executemany("INSERT INTO repository_search VALUES (?,?,?,?,?,?)", [
                [r["result_id"], r["full_name"], r["description"], r["primary_language"], r["license_spdx"] or "", r["query_id"]]
                for r in rows["search_results"]
            ])
        db.execute("INSERT OR REPLACE INTO schema_metadata VALUES ('catalog_version','2')")
        db.commit()
        if args.search:
            results = db.execute("SELECT name, category, discovery_lane FROM candidate_search WHERE candidate_search MATCH ? ORDER BY rank LIMIT 30", (args.search,)).fetchall()
            for result in results:
                print("\t".join(result))
            repo_results = db.execute("SELECT full_name, primary_language, license_spdx FROM repository_search WHERE repository_search MATCH ? ORDER BY rank LIMIT 30", (args.search,)).fetchall()
            for result in repo_results:
                print("\t".join(result))
        print(f"Catalog built: {len(rows['candidates'])} candidates, {len(rows['repositories'])} repositories, {len(rows['claims'])} claims, {len(rows['search_queries'])} queries -> {DB}")
    finally:
        db.close()
    return 0

if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except (OSError, sqlite3.Error, ValueError) as exc:
        print(f"catalog build failed: {exc}", file=sys.stderr)
        raise SystemExit(1)
