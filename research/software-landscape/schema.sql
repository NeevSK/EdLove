PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS schema_metadata (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS candidates (
  candidate_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  candidate_type TEXT NOT NULL DEFAULT 'unknown',
  stack_claim TEXT NOT NULL DEFAULT '',
  license_claim TEXT NOT NULL DEFAULT '',
  discovery_lane TEXT NOT NULL DEFAULT '',
  fit_question TEXT NOT NULL DEFAULT '',
  discovery_stage TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS repositories (
  repository_id TEXT PRIMARY KEY,
  candidate_id TEXT NOT NULL REFERENCES candidates(candidate_id),
  repository_url TEXT NOT NULL UNIQUE,
  relationship TEXT NOT NULL,
  source_role TEXT NOT NULL,
  notes TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS sources (
  source_id TEXT PRIMARY KEY,
  source_type TEXT NOT NULL,
  title TEXT NOT NULL,
  source_url TEXT NOT NULL,
  publisher TEXT NOT NULL DEFAULT '',
  published_on TEXT,
  accessed_on TEXT NOT NULL,
  locator TEXT NOT NULL DEFAULT '',
  source_status TEXT NOT NULL,
  notes TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS components (
  component_id TEXT PRIMARY KEY,
  candidate_id TEXT NOT NULL REFERENCES candidates(candidate_id),
  repository_id TEXT REFERENCES repositories(repository_id),
  component_name TEXT NOT NULL,
  component_type TEXT NOT NULL,
  language_runtime TEXT NOT NULL DEFAULT '',
  integration_mode TEXT NOT NULL DEFAULT '',
  version_scope TEXT NOT NULL DEFAULT '',
  evidence_status TEXT NOT NULL,
  notes TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS candidate_relationships (
  relationship_id TEXT PRIMARY KEY,
  source_candidate_id TEXT NOT NULL REFERENCES candidates(candidate_id),
  target_candidate_id TEXT NOT NULL REFERENCES candidates(candidate_id),
  relationship TEXT NOT NULL,
  source_id TEXT NOT NULL REFERENCES sources(source_id),
  observed_on TEXT NOT NULL,
  verification_status TEXT NOT NULL CHECK (verification_status IN (
    'report_lead_not_independently_verified', 'source_verified_scope_limited',
    'official_docs_verified', 'independently_verified', 'conflicting_sources',
    'not_found', 'superseded'
  )),
  notes TEXT NOT NULL DEFAULT '',
  CHECK (source_candidate_id <> target_candidate_id)
);

CREATE TABLE IF NOT EXISTS candidate_discovery_sources (
  mention_id TEXT PRIMARY KEY,
  candidate_id TEXT NOT NULL REFERENCES candidates(candidate_id),
  source_id TEXT NOT NULL REFERENCES sources(source_id),
  observed_on TEXT NOT NULL,
  locator TEXT NOT NULL,
  signal_type TEXT NOT NULL,
  disposition TEXT NOT NULL CHECK (disposition IN (
    'queued_for_review', 'already_in_register', 'deferred', 'excluded'
  )),
  notes TEXT NOT NULL DEFAULT '',
  UNIQUE (candidate_id, source_id, locator)
);

CREATE TABLE IF NOT EXISTS discovery_observations (
  observation_id TEXT PRIMARY KEY,
  repository_id TEXT NOT NULL REFERENCES repositories(repository_id),
  source_id TEXT NOT NULL REFERENCES sources(source_id),
  observed_on TEXT NOT NULL,
  observed_at TEXT NOT NULL,
  chart_name TEXT NOT NULL,
  rank INTEGER CHECK (rank > 0 OR rank IS NULL),
  stars INTEGER CHECK (stars >= 0 OR stars IS NULL),
  stars_gained INTEGER,
  days_on_chart INTEGER CHECK (days_on_chart >= 0 OR days_on_chart IS NULL),
  notes TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS claims (
  claim_id TEXT PRIMARY KEY,
  candidate_id TEXT NOT NULL REFERENCES candidates(candidate_id),
  field TEXT NOT NULL,
  raw_claim TEXT NOT NULL,
  normalized_value TEXT NOT NULL DEFAULT '',
  source_url TEXT NOT NULL,
  source_id TEXT NOT NULL REFERENCES sources(source_id),
  source_kind TEXT NOT NULL,
  observed_on TEXT NOT NULL,
  verification_status TEXT NOT NULL CHECK (verification_status IN (
    'report_lead_not_independently_verified', 'source_verified_scope_limited',
    'official_docs_verified', 'independently_verified', 'conflicting_sources',
    'not_found', 'superseded'
  )),
  confidence TEXT NOT NULL CHECK (confidence IN ('low', 'medium', 'high')),
  notes TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS license_scopes (
  license_scope_id TEXT PRIMARY KEY,
  candidate_id TEXT NOT NULL REFERENCES candidates(candidate_id),
  repository_id TEXT REFERENCES repositories(repository_id),
  component_id TEXT REFERENCES components(component_id),
  artifact_scope TEXT NOT NULL CHECK (artifact_scope IN (
    'repository_code', 'package', 'bundled_asset', 'documentation',
    'content', 'dataset', 'model_weights', 'dependencies', 'unknown'
  )),
  artifact_name TEXT NOT NULL DEFAULT '',
  version_expression TEXT NOT NULL DEFAULT '',
  license_expression TEXT NOT NULL,
  source_id TEXT NOT NULL REFERENCES sources(source_id),
  observed_on TEXT NOT NULL,
  verification_status TEXT NOT NULL CHECK (verification_status IN (
    'report_lead_not_independently_verified', 'source_verified_scope_limited',
    'official_docs_verified', 'independently_verified', 'conflicting_sources',
    'not_found', 'superseded'
  )),
  notes TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS interoperability_claims (
  interoperability_id TEXT PRIMARY KEY,
  candidate_id TEXT NOT NULL REFERENCES candidates(candidate_id),
  component_id TEXT REFERENCES components(component_id),
  standard_or_protocol TEXT NOT NULL,
  capability TEXT NOT NULL,
  direction TEXT NOT NULL,
  version_scope TEXT NOT NULL DEFAULT '',
  source_id TEXT NOT NULL REFERENCES sources(source_id),
  observed_on TEXT NOT NULL,
  verification_status TEXT NOT NULL CHECK (verification_status IN (
    'report_lead_not_independently_verified', 'source_verified_scope_limited',
    'official_docs_verified', 'independently_verified', 'conflicting_sources',
    'not_found', 'superseded'
  )),
  notes TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS deployment_claims (
  deployment_id TEXT PRIMARY KEY,
  candidate_id TEXT NOT NULL REFERENCES candidates(candidate_id),
  deployment_model TEXT NOT NULL,
  offline_capability TEXT NOT NULL,
  sync_model TEXT NOT NULL DEFAULT '',
  server_or_hardware_requirements TEXT NOT NULL DEFAULT '',
  source_id TEXT NOT NULL REFERENCES sources(source_id),
  observed_on TEXT NOT NULL,
  verification_status TEXT NOT NULL CHECK (verification_status IN (
    'report_lead_not_independently_verified', 'source_verified_scope_limited',
    'official_docs_verified', 'independently_verified', 'conflicting_sources',
    'not_found', 'superseded'
  )),
  notes TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS maturity_assessments (
  maturity_id TEXT PRIMARY KEY,
  candidate_id TEXT NOT NULL REFERENCES candidates(candidate_id),
  dimension TEXT NOT NULL,
  assessment TEXT NOT NULL,
  rationale TEXT NOT NULL,
  source_id TEXT NOT NULL REFERENCES sources(source_id),
  observed_on TEXT NOT NULL,
  confidence TEXT NOT NULL CHECK (confidence IN ('low', 'medium', 'high'))
);

CREATE TABLE IF NOT EXISTS fit_assessments (
  fit_id TEXT PRIMARY KEY,
  candidate_id TEXT NOT NULL REFERENCES candidates(candidate_id),
  target_capability TEXT NOT NULL,
  integration_mode TEXT NOT NULL,
  assessment TEXT NOT NULL,
  rationale TEXT NOT NULL,
  source_id TEXT NOT NULL REFERENCES sources(source_id),
  assessed_on TEXT NOT NULL,
  confidence TEXT NOT NULL CHECK (confidence IN ('low', 'medium', 'high'))
);

CREATE TABLE IF NOT EXISTS context_comparisons (
  comparison_id TEXT PRIMARY KEY,
  candidate_id TEXT REFERENCES candidates(candidate_id),
  context_name TEXT NOT NULL,
  comparison_axis TEXT NOT NULL,
  candidate_fact TEXT NOT NULL,
  context_fact TEXT NOT NULL,
  relationship TEXT NOT NULL,
  implication TEXT NOT NULL,
  candidate_source_id TEXT NOT NULL REFERENCES sources(source_id),
  context_source_id TEXT NOT NULL REFERENCES sources(source_id),
  assessed_on TEXT NOT NULL,
  confidence TEXT NOT NULL CHECK (confidence IN ('low', 'medium', 'high'))
);

CREATE TABLE IF NOT EXISTS search_runs (
  run_id TEXT PRIMARY KEY,
  source TEXT NOT NULL,
  search_family TEXT NOT NULL,
  started_at TEXT NOT NULL,
  method TEXT NOT NULL,
  sort_mode TEXT NOT NULL,
  filters TEXT NOT NULL,
  limitations TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS search_queries (
  query_id TEXT PRIMARY KEY,
  run_id TEXT NOT NULL REFERENCES search_runs(run_id),
  capability TEXT NOT NULL,
  query_text TEXT NOT NULL,
  query_url TEXT NOT NULL,
  sort_mode TEXT NOT NULL,
  filters TEXT NOT NULL,
  observed_result_count INTEGER,
  count_kind TEXT NOT NULL,
  notes TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS search_results (
  result_id TEXT PRIMARY KEY,
  query_id TEXT NOT NULL REFERENCES search_queries(query_id),
  source_id TEXT NOT NULL REFERENCES sources(source_id),
  observed_on TEXT NOT NULL,
  result_rank INTEGER NOT NULL CHECK (result_rank > 0),
  full_name TEXT NOT NULL,
  repository_url TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  primary_language TEXT NOT NULL DEFAULT '',
  stars INTEGER CHECK (stars >= 0 OR stars IS NULL),
  forks INTEGER CHECK (forks >= 0 OR forks IS NULL),
  open_issues INTEGER CHECK (open_issues >= 0 OR open_issues IS NULL),
  license_spdx TEXT,
  archived INTEGER CHECK (archived IN (0, 1) OR archived IS NULL),
  created_at TEXT,
  pushed_at TEXT,
  notes TEXT NOT NULL DEFAULT '',
  UNIQUE (query_id, result_rank)
);

CREATE TABLE IF NOT EXISTS repository_observations (
  observation_id TEXT PRIMARY KEY,
  repository_id TEXT NOT NULL REFERENCES repositories(repository_id),
  source_id TEXT NOT NULL REFERENCES sources(source_id),
  observed_on TEXT NOT NULL,
  stars INTEGER,
  forks INTEGER,
  open_issues INTEGER,
  archived INTEGER CHECK (archived IN (0, 1) OR archived IS NULL),
  pushed_at TEXT,
  latest_release_at TEXT,
  notes TEXT NOT NULL DEFAULT ''
);

CREATE VIRTUAL TABLE IF NOT EXISTS candidate_search USING fts5(
  candidate_id UNINDEXED,
  name,
  category,
  stack_claim,
  license_claim,
  discovery_lane,
  fit_question,
  tokenize = 'unicode61 remove_diacritics 2'
);

CREATE VIRTUAL TABLE IF NOT EXISTS repository_search USING fts5(
  result_id UNINDEXED,
  full_name,
  description,
  primary_language,
  license_spdx,
  query_id,
  tokenize = 'unicode61 remove_diacritics 2'
);

CREATE INDEX IF NOT EXISTS idx_candidates_category ON candidates(category);
CREATE INDEX IF NOT EXISTS idx_candidates_lane ON candidates(discovery_lane);
CREATE INDEX IF NOT EXISTS idx_claims_field_status ON claims(field, verification_status);
CREATE INDEX IF NOT EXISTS idx_claims_source ON claims(source_id);
CREATE INDEX IF NOT EXISTS idx_context_comparisons_context ON context_comparisons(context_name, comparison_axis);
CREATE INDEX IF NOT EXISTS idx_license_scope_artifact ON license_scopes(artifact_scope, verification_status);
CREATE INDEX IF NOT EXISTS idx_queries_run ON search_queries(run_id);
CREATE INDEX IF NOT EXISTS idx_search_results_query_rank ON search_results(query_id, result_rank);
CREATE INDEX IF NOT EXISTS idx_search_results_repo ON search_results(full_name, observed_on);
CREATE INDEX IF NOT EXISTS idx_observations_repo_date ON repository_observations(repository_id, observed_on);

CREATE VIEW IF NOT EXISTS candidate_register AS
SELECT
  c.candidate_id,
  c.name,
  c.category,
  c.candidate_type,
  c.stack_claim,
  c.license_claim,
  c.discovery_lane,
  c.fit_question,
  c.discovery_stage,
  r.repository_url,
  r.source_role
FROM candidates AS c
LEFT JOIN repositories AS r USING (candidate_id);
