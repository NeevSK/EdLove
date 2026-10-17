// scripts/education-atlas/migrations/010-add-public-finance-charities-and-competitions.mjs
// Migration 010: Add Government Public Finance, Provincial Budgets, Charities/Foundations, and Competitions/Aesthetics

import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.resolve(__dirname, '../../../data/education-atlas/atlas_staging.db');

console.log(`[Migration 010] Opening database at: ${DB_PATH}`);
const db = new DatabaseSync(DB_PATH);
db.exec('PRAGMA foreign_keys = ON;');
db.exec('PRAGMA journal_mode = WAL;');

// 1. Create government_education_budgets
console.log('[Migration 010] Creating government_education_budgets table...');
db.exec(`
CREATE TABLE IF NOT EXISTS government_education_budgets (
  budget_record_id TEXT PRIMARY KEY,
  fiscal_year INTEGER NOT NULL,
  budget_tier TEXT NOT NULL, -- central_treasury_line_ministry, provincial_council_devolved
  entity_scope TEXT NOT NULL, -- ministry_of_education, ministry_of_higher_education, ministry_of_skills_development, western_province, central_province, etc.
  entity_name_en TEXT NOT NULL,
  recurrent_budget_lkr REAL NOT NULL,
  capital_budget_lkr REAL NOT NULL,
  total_allocation_lkr REAL NOT NULL,
  gdp_share_percent REAL,
  welfare_transfers_json TEXT, -- Free textbooks, uniforms, school midday meals, bus subsidies
  primary_spending_heads_json TEXT, -- Teacher payroll, provincial administration, building maintenance
  source_citation TEXT NOT NULL, -- Central Bank Annual Report, Ministry of Finance Appropriation Bill
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_gov_fin_year ON government_education_budgets(fiscal_year);
CREATE INDEX IF NOT EXISTS idx_gov_fin_tier ON government_education_budgets(budget_tier);
`);

// 2. Create education_charities_and_foundations
console.log('[Migration 010] Creating education_charities_and_foundations table...');
db.exec(`
CREATE TABLE IF NOT EXISTS education_charities_and_foundations (
  entity_id TEXT PRIMARY KEY,
  name_en TEXT NOT NULL,
  name_si TEXT,
  name_ta TEXT,
  entity_type TEXT NOT NULL, -- international_multilateral, international_ngo, local_charity_foundation, corporate_csr_foundation, development_bank_program
  thematic_focus TEXT NOT NULL, -- primary_literacy, girls_education, early_childhood_dev, smart_classrooms_ict, wash_and_infrastructure, plantation_community_aid, sports_and_youth_empowerment, crisis_relief_and_nutrition, higher_ed_acceleration
  operational_districts_json TEXT NOT NULL, -- ["all_island"] or list of district IDs
  annual_investment_est_lkr REAL,
  flagship_initiatives_json TEXT NOT NULL,
  headquarters_location TEXT,
  official_portal TEXT,
  strategic_advisory TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_charities_type ON education_charities_and_foundations(entity_type);
CREATE INDEX IF NOT EXISTS idx_charities_focus ON education_charities_and_foundations(thematic_focus);
`);

// 3. Create national_competitions_and_events
console.log('[Migration 010] Creating national_competitions_and_events table...');
db.exec(`
CREATE TABLE IF NOT EXISTS national_competitions_and_events (
  competition_id TEXT PRIMARY KEY,
  canonical_name_en TEXT NOT NULL,
  canonical_name_si TEXT,
  canonical_name_ta TEXT,
  category TEXT NOT NULL, -- sports_athletics, sports_derby_encounter, aesthetic_drama_theatre, aesthetic_music_choral, aesthetic_dance_ballet, aesthetic_art_visual, literary_oratory_debating, cadet_and_uniformed_corps, academic_olympiad_stem
  governing_body TEXT NOT NULL,
  inception_year INTEGER,
  annual_participants_est INTEGER,
  qualifying_hierarchy TEXT NOT NULL, -- school_to_zonal_to_provincial_to_national, invitational_derby, open_preliminary_exam, all_island_auditions
  flagship_trophy_or_award TEXT,
  key_venues TEXT,
  international_pathway TEXT, -- IMO, IPhO, IBO, Asian Youth Games, WSDC Debating
  traditions_and_cultural_significance TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_competitions_cat ON national_competitions_and_events(category);
CREATE INDEX IF NOT EXISTS idx_competitions_year ON national_competitions_and_events(inception_year);
`);

console.log('[Migration 010] Migration completed successfully.');
