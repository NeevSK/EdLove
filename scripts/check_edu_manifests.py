import csv
import sys
import os

sys.stdout.reconfigure(encoding='utf-8')

census_file = r'c:\x\docs\research\edu-audit\data\census\sljol_enriched_panel.csv'
if os.path.exists(census_file):
    with open(census_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        rows = list(reader)
    print(f"SLJOL Enriched Panel: {len(rows)} entries")
    edu_venues = [r for r in rows if any(k in str(r).lower() for k in ['educat', 'pedagog', 'teach', 'learn', 'curriculum', 'school', 'ousl', 'vistas', 'jula', 'nie'])]
    print(f"Education-related venues in SLJOL panel: {len(edu_venues)}")
    for v in edu_venues[:10]:
        print(f"  - {v.get('journal_title') or v.get('title') or v.get('venue')}: {v.get('url') or v.get('journal_url')}")

unified_manifest = r'c:\x\docs\research\edu-audit\data\master_unified_pdf_manifest.csv'
if os.path.exists(unified_manifest):
    with open(unified_manifest, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        total = 0
        edu_count = 0
        for r in reader:
            total += 1
            text = f"{r.get('title', '')} {r.get('venue', '')}".lower()
            if any(k in text for k in ['education', 'school', 'teacher', 'learning', 'pedagogy', 'curriculum', 'classroom', 'student', 'ousl']):
                edu_count += 1
        print(f"\nMaster Unified PDF Manifest: {total} total rows, {edu_count} education-directed rows ({edu_count/total*100:.1f}%)")
