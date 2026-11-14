/**
 * scripts/education-atlas/migrations/006-add-finance-and-edtech-mesh.mjs
 *
 * Migration 006: School Finance & Budget Ledger, EdTech Solutions Catalog, and SQA Indicator Matrix.
 * 
 * Expands the Education Atlas beyond schools into:
 *  1. School Finance & Funding Dualism (Treasury Vote 126 vs. Provincial vs. SDS Shadow Treasury).
 *  2. EdTech Solutions & Global/Local Ecosystem (Ingesting audited solutions from E:\edtech).
 *  3. SQA Historical Indicator Matrix (52 indicators across 8 SQA dimensions with performance rubrics).
 */

import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';

const DB_PATH = path.resolve('data/education-atlas/atlas_staging.db');

function run() {
  console.log('📦 [MIGRATION 006] Creating School Finance, EdTech Catalog & SQA Indicator Matrix...');

  const db = new DatabaseSync(DB_PATH);
  db.exec('PRAGMA journal_mode = WAL;');
  db.exec('PRAGMA foreign_keys = ON;');

  db.exec('BEGIN TRANSACTION;');
  try {
    // 1. SCHOOL FINANCE & BUDGET LEDGER
    db.exec(`
      CREATE TABLE IF NOT EXISTS school_finance_budgets (
        budget_id TEXT PRIMARY KEY,          -- 'fin:0117001_2024'
        school_census_no TEXT NOT NULL REFERENCES schools(census_no),
        fiscal_year INTEGER NOT NULL,
        
        -- State Treasury Allocation
        treasury_recurrent_lkr REAL,        -- Teacher/staff salaries, free textbooks, uniform vouchers
        treasury_capital_lkr REAL,          -- State building grants, lab equipment allocations
        per_pupil_state_spend_lkr REAL,
        
        -- School Development Society (SDS / පාසල් සංවර්ධන සමිතිය) Shadow Treasury
        sds_facility_fees_lkr REAL,         -- Facility fees collected from parents
        sds_donations_and_events_lkr REAL,  -- Admission development donations, carnivals, big match tickets
        sds_alumni_endowments_lkr REAL,     -- Past Pupils Association (OBA/PPA) trust contributions
        sds_total_revenue_lkr REAL,
        
        -- Financial Inversion Metric
        sds_to_treasury_ratio REAL,         -- >1.0 means school raises more self-funds than state non-salary spend!
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_fin_school_year ON school_finance_budgets(school_census_no, fiscal_year);
    `);
    console.log('✅ Created school_finance_budgets table.');

    // 2. EDTECH SOLUTIONS & ECOSYSTEM CATALOG
    db.exec(`
      CREATE TABLE IF NOT EXISTS edtech_solutions_catalog (
        solution_id TEXT PRIMARY KEY,       -- 'edtech:phet', 'edtech:dp_education', 'edtech:e_thaksalawa'
        name TEXT NOT NULL,
        origin_country TEXT NOT NULL,       -- 'USA', 'Sri Lanka', 'Kenya', 'India'
        scope TEXT NOT NULL,                -- 'global', 'sri_lanka_national', 'regional'
        founding_year INTEGER,
        
        target_audience TEXT,               -- 'k12_students', 'teachers', 'university'
        pedagogical_model TEXT,             -- 'inquiry_simulation', 'drill_practice', 'lecture_broadcast', 'sanctuary'
        connectivity_requirement TEXT,      -- 'offline_first', 'low_bandwidth', 'high_bandwidth_video'
        hardware_class TEXT,                -- 'any_phone', 'desktop_only', 'smart_tv'
        pricing_model TEXT,                 -- 'free_open_source', 'freemium', 'b2g_donor_funded', 'commercial'
        
        founder_epistemology TEXT,          -- 'practicing_educator', 'tech_outsider', 'academic_researcher'
        design_fit_assessment TEXT,         -- Evaluates institutional fit in low-resource settings
        trajectory_status TEXT,             -- 'active_faithful', 'pivoted_commercial', 'graveyard_failed'
        source_reference_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_edtech_scope ON edtech_solutions_catalog(scope);
      CREATE INDEX IF NOT EXISTS idx_edtech_pedagogy ON edtech_solutions_catalog(pedagogical_model);
    `);
    console.log('✅ Created edtech_solutions_catalog table.');

    // 3. SQA (SCHOOL QUALITY ASSESSMENT) 52-INDICATOR MATRIX
    db.exec(`
      CREATE TABLE IF NOT EXISTS sqa_indicator_matrix (
        indicator_id TEXT PRIMARY KEY,      -- 'sqa:dim1_ind1', 'sqa:dim7_ind3'
        dimension_no INTEGER NOT NULL REFERENCES education_quality_frameworks(dimension_no),
        indicator_no INTEGER NOT NULL,
        title_en TEXT NOT NULL,
        title_si TEXT NOT NULL,
        performance_levels_json TEXT NOT NULL, -- Rubrics for Level 1 (Unsatisfactory) to Level 4 (Commendable)
        historical_gaming_notes TEXT        -- How schools historically 'faked file architecture' vs real practice
      );

      CREATE INDEX IF NOT EXISTS idx_sqa_dim ON sqa_indicator_matrix(dimension_no);
    `);
    console.log('✅ Created sqa_indicator_matrix table.');

    db.exec('COMMIT;');
  } catch (err) {
    db.exec('ROLLBACK;');
    throw err;
  }

  console.log('🎉 Migration 006 Complete!');
}

run();
