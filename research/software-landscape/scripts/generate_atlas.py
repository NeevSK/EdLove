#!/usr/bin/env python3
"""Render a compact, static HTML view from the generated research catalog."""
from __future__ import annotations

import html
import sqlite3
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DB = ROOT / "build" / "catalog.sqlite"
OUT = ROOT / "atlas.html"

def bar_chart(title: str, values: Counter[str]) -> str:
    data = values.most_common()
    scale = max((n for _, n in data), default=1)
    bars = []
    for label, value in data:
        width = round(340 * value / scale)
        bars.append(f'<div class="barrow"><span>{html.escape(label)}</span><i><b style="width:{width}px"></b></i><strong>{value}</strong></div>')
    return f'<section><h2>{html.escape(title)}</h2>{"".join(bars)}</section>'

def main() -> None:
    if not DB.exists():
        raise SystemExit("Build the catalog first: py research/software-landscape/scripts/build_catalog.py")
    db = sqlite3.connect(DB)
    db.row_factory = sqlite3.Row
    candidates = db.execute("""SELECT c.*, group_concat(r.repository_url, '|') AS repository_urls
        FROM candidates AS c LEFT JOIN repositories AS r USING (candidate_id)
        GROUP BY c.candidate_id ORDER BY c.category,c.name""").fetchall()
    claims = db.execute("SELECT verification_status, COUNT(*) AS n FROM claims GROUP BY verification_status").fetchall()
    license_scopes = Counter(row["artifact_scope"] for row in db.execute("SELECT artifact_scope FROM license_scopes"))
    query_count = db.execute("SELECT COUNT(*) FROM search_queries").fetchone()[0]
    observations = db.execute("SELECT COUNT(*) FROM repository_observations").fetchone()[0]
    discovery_mentions = db.execute("SELECT COUNT(*) FROM candidate_discovery_sources").fetchone()[0]
    discovery_signals = Counter(row["signal_type"] for row in db.execute("SELECT signal_type FROM candidate_discovery_sources"))
    recurring_candidates = Counter({row["name"]: row["n"] for row in db.execute("""SELECT c.name, COUNT(*) AS n
        FROM candidate_discovery_sources AS d JOIN candidates AS c USING (candidate_id)
        GROUP BY c.candidate_id HAVING COUNT(*) > 1 ORDER BY n DESC, c.name""")})
    ranked_signals = db.execute("""SELECT r.candidate_id, c.name, r.repository_url, d.chart_name, d.observed_on,
        d.rank, d.stars, d.stars_gained, d.days_on_chart, d.source_id
        FROM discovery_observations AS d JOIN repositories AS r USING (repository_id)
        JOIN candidates AS c USING (candidate_id) ORDER BY d.observed_on DESC, d.rank ASC""").fetchall()
    searched_repositories = db.execute("""SELECT q.capability, q.query_id, sr.full_name, sr.repository_url,
        sr.result_rank, sr.stars, sr.primary_language, sr.license_spdx, sr.pushed_at, sr.archived
        FROM search_results AS sr JOIN search_queries AS q USING (query_id)
        ORDER BY q.query_id, sr.result_rank""").fetchall()
    comparisons = db.execute("""SELECT cc.*, COALESCE(c.name, 'Catalog / corpus scope') AS candidate_name
        FROM context_comparisons AS cc LEFT JOIN candidates AS c USING (candidate_id)
        ORDER BY cc.context_name, cc.comparison_axis""").fetchall()
    categories = Counter(row["category"] for row in candidates)
    lanes = Counter(row["discovery_lane"].split(';')[0].strip() for row in candidates)
    claim_summary = ", ".join(f'{row["n"]} {row["verification_status"]}' for row in claims) or "No claims recorded"
    body = []
    for row in candidates:
        repo_urls = (row["repository_urls"] or "").split("|")
        repo = "<br>".join(f'<a href="{html.escape(url, quote=True)}">{html.escape(url.split("/")[-1])}</a>' for url in repo_urls if url)
        body.append("<tr>" + "".join(f"<td>{repo if key == 'repository_urls' else html.escape(str(row[key] or '—'))}</td>" for key in ["name", "category", "discovery_lane", "discovery_stage", "stack_claim", "license_claim", "fit_question", "repository_urls"]) + "</tr>")
    comparison_rows = []
    for row in comparisons:
        comparison_rows.append("<tr>" + "".join(f"<td>{html.escape(str(row[key] or '—'))}</td>" for key in ["candidate_name", "context_name", "comparison_axis", "relationship", "candidate_fact", "context_fact", "implication", "confidence"]) + "</tr>")
    signal_rows = []
    for row in ranked_signals:
        signal_rows.append("<tr>" + "".join(f"<td>{html.escape(str(row[key] if row[key] is not None else '—'))}</td>" for key in ["name", "chart_name", "observed_on", "rank", "stars", "stars_gained", "days_on_chart", "source_id"]) + "</tr>")
    search_result_rows = []
    for row in searched_repositories:
        repo_link = f'<a href="{html.escape(row["repository_url"], quote=True)}">{html.escape(row["full_name"])}</a>'
        values = [row["capability"], row["query_id"], row["result_rank"], row["stars"], row["primary_language"], row["license_spdx"], row["pushed_at"], row["archived"]]
        search_result_rows.append("<tr>" + f"<td>{html.escape(str(values[0]))}</td><td>{html.escape(str(values[1]))}</td><td>{values[2]}</td><td>{values[3] if values[3] is not None else '—'}</td><td>{html.escape(str(values[4] or '—'))}</td><td>{html.escape(str(values[5] or '—'))}</td><td>{html.escape(str(values[6] or '—'))}</td><td>{values[7] if values[7] is not None else '—'}</td><td>{repo_link}</td></tr>")
    document = f'''<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Software Landscape Atlas</title>
<style>body{{font:16px/1.5 system-ui,sans-serif;max-width:1200px;margin:2rem auto;padding:0 1rem;color:#18212b}}h1{{font-size:2rem}}.summary{{padding:1rem;background:#edf4f2;border-radius:10px}}.charts{{display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:1rem}}section{{padding:1rem;border:1px solid #d8e0e6;border-radius:10px}}.barrow{{display:grid;grid-template-columns:minmax(100px,1fr) 2fr 2rem;align-items:center;gap:.5rem;margin:.35rem 0;font-size:.9rem}}.barrow span{{overflow-wrap:anywhere}}.barrow i{{height:12px;background:#eef1f3}}.barrow b{{display:block;height:100%;background:#287b70}}table{{width:100%;border-collapse:collapse;font-size:.9rem}}th,td{{padding:.55rem;text-align:left;vertical-align:top;border-bottom:1px solid #d8e0e6}}th{{position:sticky;top:0;background:white}}td{{max-width:260px}}input{{font:inherit;padding:.6rem;width:min(100%,30rem);margin:1rem 0}}.tablewrap{{overflow:auto;max-height:70vh}}</style>
<h1>Software Landscape Atlas</h1><p class="summary">Generated from curated CSV records. This is a discovery queue, not a recommendation or license clearance. Claims: {html.escape(claim_summary)}. Search queries: {query_count}; captured GitHub result rows: {len(searched_repositories)}. Dated repository observations: {observations}. Candidate discovery mentions: {discovery_mentions}.</p>
<div class="charts">{bar_chart("Candidates by category", categories)}{bar_chart("Candidates by lane", lanes)}{bar_chart("License records by artifact scope", license_scopes)}{bar_chart("Discovery mentions by signal", discovery_signals)}{bar_chart("Candidates surfaced by multiple sources", recurring_candidates)}</div>
<h2>Candidate register</h2><input id="filter" type="search" placeholder="Filter candidates, stack, license or fit question"><div class="tablewrap"><table><thead><tr><th>Candidate</th><th>Job</th><th>Lane</th><th>Stage</th><th>Stack lead</th><th>License lead</th><th>Fit question</th><th>Repositories</th></tr></thead><tbody>{''.join(body)}</tbody></table></div>
<h2>GitHub repository search snapshots</h2><p>Top result rows from dated GitHub REST repository searches, sorted by stars for retrieval. Result rank and stars are discovery signals only; they do not establish relevance, quality or license compatibility. Query totals and limits are in the search records.</p><div class="tablewrap"><table><thead><tr><th>Capability</th><th>Query ID</th><th>Rank</th><th>Stars</th><th>Language</th><th>GitHub license field</th><th>Last push</th><th>Archived</th><th>Repository</th></tr></thead><tbody>{''.join(search_result_rows)}</tbody></table></div>
<h2>Dated discovery chart observations</h2><p>Rank and star change help prioritize source review; they do not establish quality, maintenance or product fit.</p><div class="tablewrap"><table><thead><tr><th>Candidate</th><th>Chart</th><th>Date</th><th>Rank</th><th>Stars</th><th>Daily change</th><th>Days charted</th><th>Source ID</th></tr></thead><tbody>{''.join(signal_rows)}</tbody></table></div>
<h2>Local context comparisons</h2><div class="tablewrap"><table><thead><tr><th>Candidate</th><th>Context</th><th>Axis</th><th>Relation</th><th>Upstream evidence</th><th>Local context</th><th>Implication</th><th>Confidence</th></tr></thead><tbody>{''.join(comparison_rows)}</tbody></table></div>
<script>document.querySelector('#filter').addEventListener('input',e=>{{const q=e.target.value.toLowerCase();document.querySelectorAll('tbody tr').forEach(r=>r.hidden=!r.innerText.toLowerCase().includes(q))}})</script></html>'''
    OUT.write_text(document, encoding="utf-8")
    print(f"Atlas generated: {len(candidates)} candidates -> {OUT}")

if __name__ == "__main__":
    main()
