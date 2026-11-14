-- Sri Lanka Education Atlas & Multi-Source Staging Schema
-- Engine: SQLite WAL mode

PRAGMA journal_mode = WAL;
PRAGMA synchronous = FULL;
PRAGMA foreign_keys = ON;

-- 1. Authoritative Sources Registry (100 Sources + Expanded)
CREATE TABLE IF NOT EXISTS sources (
  source_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  short_name TEXT,
  source_kind TEXT NOT NULL, -- official_national, higher_ed, provincial, community, exam_board, etc.
  category TEXT,            -- state_university, ministry, school, past_paper_hub
  authority_level TEXT,     -- canonical, official, curated, community
  quality_tier TEXT,        -- A1, B1, etc.
  canonical_url TEXT NOT NULL,
  inventory_status TEXT,    -- verified, pending_route_verification, etc.
  languages TEXT,           -- JSON array: ["si", "ta", "en"]
  handling_mode TEXT,       -- link, embed_candidate, download_candidate, etc.
  rights_baseline TEXT,
  last_checked TEXT,
  notes TEXT,
  raw_meta JSON,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Staged & Cataloged Resources (Circulars, Past Papers, Books, Syllabi, Jobs)
CREATE TABLE IF NOT EXISTS resources (
  resource_id TEXT PRIMARY KEY,
  source_id TEXT REFERENCES sources(source_id),
  title TEXT NOT NULL,
  summary TEXT,
  resource_type TEXT NOT NULL, -- circular, past_paper, marking_scheme, syllabus, textbook, job_notice, landing_page
  content_format TEXT,        -- pdf, html, epub, zip
  canonical_url TEXT NOT NULL,
  download_url TEXT,
  publication_date TEXT,      -- YYYY-MM-DD
  gazette_date TEXT,
  circular_number TEXT,
  exam_level TEXT,            -- Grade 5, GCE O/L, GCE A/L, Term Test
  year INTEGER,
  grade INTEGER,
  subject TEXT,
  medium TEXT,                -- sinhala, tamil, english, trilingual
  roles TEXT,                 -- JSON array: ["teacher", "principal", "student"]
  education_stages TEXT,      -- JSON array: ["primary", "junior_secondary", "senior_secondary"]
  domains TEXT,               -- JSON array
  handling_mode TEXT DEFAULT 'link',
  rights_status TEXT,
  attribution_text TEXT,
  quality_score INTEGER,
  local_vault_path TEXT,
  checksum_sha256 TEXT,
  ingested_via TEXT NOT NULL, -- manus_export, gazette_harvester, telegram_monitor, cdx_api, crawler
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. Discovered Document Queue / Stream (Raw incoming stream before deduplication)
CREATE TABLE IF NOT EXISTS discovered_stream (
  stream_id INTEGER PRIMARY KEY AUTOINCREMENT,
  channel TEXT NOT NULL,      -- gazette, telegram, cdx, search_dork, sitemap
  source_id TEXT,
  url TEXT NOT NULL UNIQUE,
  title TEXT,
  detected_type TEXT,
  raw_payload JSON,
  status TEXT DEFAULT 'pending', -- pending, processed, rejected
  error_message TEXT,
  discovered_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. Full-Text Search Virtual Table (FTS5)
CREATE VIRTUAL TABLE IF NOT EXISTS resources_fts USING fts5(
  resource_id UNINDEXED,
  title,
  summary,
  circular_number,
  subject,
  exam_level,
  year,
  medium,
  content='resources',
  content_rowid='rowid'
);

-- Triggers for FTS synchronization
CREATE TRIGGER IF NOT EXISTS resources_ai AFTER INSERT ON resources BEGIN
  INSERT INTO resources_fts(rowid, resource_id, title, summary, circular_number, subject, exam_level, year, medium)
  VALUES (new.rowid, new.resource_id, new.title, new.summary, new.circular_number, new.subject, new.exam_level, new.year, new.medium);
END;

CREATE TRIGGER IF NOT EXISTS resources_ad AFTER DELETE ON resources BEGIN
  INSERT INTO resources_fts(resources_fts, rowid, resource_id, title, summary, circular_number, subject, exam_level, year, medium)
  VALUES ('delete', old.rowid, old.resource_id, old.title, old.summary, old.circular_number, old.subject, old.exam_level, old.year, old.medium);
END;

CREATE TRIGGER IF NOT EXISTS resources_au AFTER UPDATE ON resources BEGIN
  INSERT INTO resources_fts(resources_fts, rowid, resource_id, title, summary, circular_number, subject, exam_level, year, medium)
  VALUES ('delete', old.rowid, old.resource_id, old.title, old.summary, old.circular_number, old.subject, old.exam_level, old.year, old.medium);
  INSERT INTO resources_fts(rowid, resource_id, title, summary, circular_number, subject, exam_level, year, medium)
  VALUES (new.rowid, new.resource_id, new.title, new.summary, new.circular_number, new.subject, new.exam_level, new.year, new.medium);
END;
