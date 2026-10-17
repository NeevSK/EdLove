/**
 * scripts/education-atlas/migrations/009-add-higher-ed-facilities-tne-and-scholarships.mjs
 *
 * Migration 009: Higher Education Facilities, Urban Private TNE Funnel & Scholarships Ledger
 *
 * Schema expansion:
 *  1. higher_ed_facilities: physical campus infrastructure (libraries, labs, hospitals, hostels).
 *  2. tne_foreign_partners: foreign partner universities (UK, Australia, US, etc.).
 *  3. tne_degree_funnel: transnational education funnel (1+2, 2+2, 4-year franchises, post-study work visas).
 *  4. higher_ed_scholarships: comprehensive financial aid ledger for Bachelors, Masters, and PhDs.
 *  5. Add physical attributes to higher_ed_institutions (acreage, faculties, hostels, hospital).
 */

import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';

const DB_PATH = path.resolve('data/education-atlas/atlas_staging.db');

export function runMigration() {
  console.log('🏛️  [MIGRATION 009] Creating Higher Ed Facilities, TNE Funnel & Scholarships Mesh...');

  const db = new DatabaseSync(DB_PATH);
  db.exec('PRAGMA journal_mode = WAL;');
  db.exec('PRAGMA foreign_keys = ON;');

  db.exec('BEGIN TRANSACTION;');
  try {
    // 1. ALTER higher_ed_institutions to add physical and academic attributes if not already present
    const tableInfo = db.prepare('PRAGMA table_info(higher_ed_institutions)').all();
    const existingCols = new Set(tableInfo.map((col) => col.name));

    if (!existingCols.has('campus_acreage')) {
      db.exec('ALTER TABLE higher_ed_institutions ADD COLUMN campus_acreage REAL DEFAULT 0;');
    }
    if (!existingCols.has('faculties_count')) {
      db.exec('ALTER TABLE higher_ed_institutions ADD COLUMN faculties_count INTEGER DEFAULT 1;');
    }
    if (!existingCols.has('hostel_available')) {
      db.exec('ALTER TABLE higher_ed_institutions ADD COLUMN hostel_available INTEGER DEFAULT 0;');
    }
    if (!existingCols.has('hospital_attached')) {
      db.exec('ALTER TABLE higher_ed_institutions ADD COLUMN hospital_attached INTEGER DEFAULT 0;');
    }
    if (!existingCols.has('research_centers_count')) {
      db.exec('ALTER TABLE higher_ed_institutions ADD COLUMN research_centers_count INTEGER DEFAULT 0;');
    }

    // 2. HIGHER EDUCATION PHYSICAL FACILITIES
    db.exec(`
      CREATE TABLE IF NOT EXISTS higher_ed_facilities (
        facility_id TEXT PRIMARY KEY,                   -- e.g. 'fac:uom_hpc_center', 'fac:peradeniya_hospital'
        inst_id TEXT NOT NULL REFERENCES higher_ed_institutions(inst_id),
        facility_type TEXT NOT NULL,                    -- 'library_system', 'research_center', 'technology_incubator', 'residential_hostel', 'sports_complex', 'hospital_clinical_wing', 'auditorium'
        name_en TEXT NOT NULL,
        name_si TEXT,
        capacity_units INTEGER,                         -- seats, beds, lab terminals
        features_json TEXT,                             -- JSON array of attributes
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_fac_inst ON higher_ed_facilities(inst_id);
      CREATE INDEX IF NOT EXISTS idx_fac_type ON higher_ed_facilities(facility_type);
    `);

    // 3. TNE FOREIGN PARTNER UNIVERSITIES
    db.exec(`
      CREATE TABLE IF NOT EXISTS tne_foreign_partners (
        partner_id TEXT PRIMARY KEY,                    -- e.g. 'tne:uni_westminster', 'tne:curtin_uni'
        university_name TEXT NOT NULL,
        country TEXT NOT NULL,                          -- 'United Kingdom', 'Australia', 'United States', 'Canada', 'New Zealand'
        global_rank_band TEXT,                          -- 'QS Top 200', 'World Top 1%', 'THE 300-400'
        official_portal TEXT,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 4. TNE DEGREE FUNNEL (TRANSNATIONAL RECRUITMENT & TRANSFER PATHWAYS)
    db.exec(`
      CREATE TABLE IF NOT EXISTS tne_degree_funnel (
        funnel_id TEXT PRIMARY KEY,                     -- e.g. 'funnel:iit_westminster_se', 'funnel:sliit_curtin_eng'
        local_inst_id TEXT NOT NULL REFERENCES higher_ed_institutions(inst_id),
        foreign_partner_id TEXT NOT NULL REFERENCES tne_foreign_partners(partner_id),
        program_name TEXT NOT NULL,
        award_model TEXT NOT NULL,                      -- '4_year_internal_franchise', '1_plus_2_transfer', '2_plus_2_transfer', '2_plus_1_transfer', 'dual_award_degree'
        awarding_body_location TEXT NOT NULL,
        local_cost_lkr REAL NOT NULL,
        foreign_cost_estimate_usd REAL,
        post_study_work_rights TEXT,                    -- 'Australia Subclass 485 (2-4 yrs)', 'UK Graduate Route (2 yrs)'
        recruitment_channel_type TEXT,                  -- 'direct_campus_enrollment', 'study_abroad_agency_pipeline', 'corporate_sponsored'
        visa_success_rate_band TEXT,                    -- 'high_90_plus', 'moderate_75_90', 'scrutinized'
        strategic_advisory TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_funnel_local ON tne_degree_funnel(local_inst_id);
      CREATE INDEX IF NOT EXISTS idx_funnel_partner ON tne_degree_funnel(foreign_partner_id);
      CREATE INDEX IF NOT EXISTS idx_funnel_model ON tne_degree_funnel(award_model);
    `);

    // 5. HIGHER EDUCATION SCHOLARSHIPS & FINANCIAL AID LEDGER
    db.exec(`
      CREATE TABLE IF NOT EXISTS higher_ed_scholarships (
        scholarship_id TEXT PRIMARY KEY,                -- e.g. 'sch:mahapola_higher_ed', 'sch:chevening_uk'
        title_en TEXT NOT NULL,
        title_si TEXT,
        title_ta TEXT,
        funding_tier TEXT NOT NULL,                     -- 'state_statutory_national', 'bilateral_foreign_government', 'corporate_industrial_sponsorship', 'philanthropic_foundation', 'institutional_merit'
        academic_level TEXT NOT NULL,                   -- 'bachelors', 'masters', 'phd', 'bachelors_and_masters', 'all_levels'
        awarding_entity TEXT NOT NULL,
        coverage_scope TEXT NOT NULL,                   -- '100_percent_full_ride_and_stipend', 'full_tuition_waiver', 'tuition_loan_interest_free', 'monthly_living_stipend', 'partial_tuition_grant'
        approx_annual_value_lkr REAL,
        eligible_destinations TEXT,                     -- 'Sri Lanka', 'United Kingdom', 'United States', 'Australia', 'Japan', 'Global'
        eligibility_criteria TEXT NOT NULL,
        annual_quota_slots INTEGER,
        application_window TEXT,
        official_portal_url TEXT,
        selection_model TEXT,                           -- 'merit_zscore', 'competitive_interview_exam', 'means_tested_financial_need', 'industry_coding_test', 'diplomatic_bilateral_nomination'
        strategic_advisory TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_sch_level ON higher_ed_scholarships(academic_level);
      CREATE INDEX IF NOT EXISTS idx_sch_tier ON higher_ed_scholarships(funding_tier);
    `);

    db.exec('COMMIT;');
    console.log('✅ [MIGRATION 009] Schema created successfully!');
  } catch (err) {
    db.exec('ROLLBACK;');
    console.error('❌ [MIGRATION 009] Failed:', err);
    throw err;
  }
}

// Run immediately if executed directly
if (process.argv[1] && process.argv[1].endsWith('009-add-higher-ed-facilities-tne-and-scholarships.mjs')) {
  runMigration();
}
