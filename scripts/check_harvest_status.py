import sqlite3
import sys

sys.stdout.reconfigure(encoding='utf-8')

conn = sqlite3.connect(r'c:\x\docs\research\edu-audit\data\full_pdf_vault\checkpoint\harvest_state.db')
cur = conn.cursor()

print("--- Breakdown of harvest_tasks by Status & Priority Tier ---")
cur.execute("SELECT status, priority_tier, source_repository, count(*) FROM harvest_tasks GROUP BY status, priority_tier, source_repository")
for r in cur.fetchall():
    print(f"Status: {r[0]} | Tier: {r[1]} | Source: {r[2]} -> {r[3]} tasks")

print("\n--- Completed Tasks Sample (Top Venues / Sources) ---")
cur.execute("SELECT source_repository, title, year FROM harvest_tasks WHERE status = 'COMPLETED' LIMIT 15")
for r in cur.fetchall():
    print(f"[{r[0]}] ({r[2]}) {r[1][:80]}")

print("\n--- Pending Tasks Sample (Top Venues / Sources) ---")
cur.execute("SELECT source_repository, priority_tier, title, year FROM harvest_tasks WHERE status = 'PENDING' LIMIT 20")
for r in cur.fetchall():
    print(f"[{r[0]}] Tier: {r[1]} ({r[3]}) {r[2][:80]}")

print("\n--- Failed Tasks Sample ---")
cur.execute("SELECT source_repository, priority_tier, title, error_reason FROM harvest_tasks WHERE status = 'FAILED' LIMIT 10")
for r in cur.fetchall():
    print(f"[{r[0]}] {r[2][:70]} -> Error: {r[3]}")
