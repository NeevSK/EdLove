/**
 * scripts/education-atlas/migrations/008-add-tertiary-and-vocational-mesh.mjs
 *
 * Migration 008: Tertiary, Higher Education & Vocational Mesh
 *
 * Expands the sovereign Education Atlas into the post-secondary terrain:
 *  1. higher_ed_institutions: 17 UGC universities, 19 SLIATE ATIs, German Tech,
 *     KDU, UNIVOTEC, Ocean Uni, SLIIT, NSBM, Professional Chartered Guilds.
 *  2. nvq_qualification_framework: TVEC NVQ Levels 1 through 7 ladder.
 *  3. tertiary_program_catalog: Canonical post-secondary programs across 9 domain clusters.
 *  4. pathway_transition_ledger: Sovereign navigation engine for the 128,000+ A/L overflow cohort.
 */

import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';

const DB_PATH = path.resolve('data/education-atlas/atlas_staging.db');

export function runMigration() {
  console.log('🏛️  [MIGRATION 008] Creating Tertiary & Vocational Mesh Schema...');

  const db = new DatabaseSync(DB_PATH);
  db.exec('PRAGMA journal_mode = WAL;');
  db.exec('PRAGMA foreign_keys = ON;');

  db.exec('BEGIN TRANSACTION;');
  try {
    // 1. HIGHER EDUCATION & VOCATIONAL INSTITUTIONS
    db.exec(`
      CREATE TABLE IF NOT EXISTS higher_ed_institutions (
        inst_id TEXT PRIMARY KEY,                       -- e.g. 'uni:colombo', 'ati:ampara_hardy', 'inst:cgtti_german_tech'
        name_en TEXT NOT NULL,
        name_si TEXT,
        name_ta TEXT,
        inst_type TEXT NOT NULL,                        -- 'state_ugc_university', 'state_non_ugc_institute', 'state_technical_sliate', 'state_vocational_dtet', 'state_vocational_naita', 'semi_state_private_degree', 'professional_chartered_guild'
        district_id TEXT REFERENCES geo_districts(id),
        province_id TEXT REFERENCES geo_provinces(id),
        address_town TEXT,
        latitude REAL,
        longitude REAL,
        coord_precision TEXT,                           -- 'exact_campus', 'town_centroid', 'tentative'
        established_year INTEGER,
        governing_body TEXT,                            -- 'UGC', 'SLIATE', 'Ministry of Skills Development', 'Chartered Act'
        statutory_decree TEXT,                          -- e.g. 'Universities Act No. 16 of 1978'
        website_url TEXT,
        annual_student_enrollment INTEGER,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_higher_ed_type ON higher_ed_institutions(inst_type);
      CREATE INDEX IF NOT EXISTS idx_higher_ed_dist ON higher_ed_institutions(district_id);
    `);

    // 2. NVQ QUALIFICATION FRAMEWORK (LEVELS 1-7)
    db.exec(`
      CREATE TABLE IF NOT EXISTS nvq_qualification_framework (
        nvq_level INTEGER PRIMARY KEY,                  -- 1 to 7
        level_name_en TEXT NOT NULL,
        level_name_si TEXT,
        level_name_ta TEXT,
        entry_requirement TEXT,
        equivalent_academic_tier TEXT,                  -- 'Semi-Skilled Operator', 'Craftsman / O/L equivalent', 'Diploma / A/L equivalent', 'Higher National Diploma', 'Bachelor of Technology Degree'
        apex_awarding_bodies_json TEXT,                 -- JSON array of awarding agencies
        typical_career_tier TEXT
      );
    `);

    // 3. TERTIARY PROGRAM CATALOG
    db.exec(`
      CREATE TABLE IF NOT EXISTS tertiary_program_catalog (
        program_id TEXT PRIMARY KEY,                    -- e.g. 'prog:sliate_hndit', 'prog:cgtti_automotive'
        inst_id TEXT NOT NULL REFERENCES higher_ed_institutions(inst_id),
        title_en TEXT NOT NULL,
        title_si TEXT,
        title_ta TEXT,
        domain_cluster TEXT NOT NULL,                   -- 'information_technology', 'engineering_technology', 'automotive_mechanical', 'construction_built_env', 'health_nursing', 'business_finance', 'hospitality_tourism', 'agriculture_food', 'legal_humanities'
        qualification_type TEXT NOT NULL,               -- 'degree', 'hnd', 'diploma', 'nvq_cert', 'professional_chartered'
        nvq_level_equivalent INTEGER,
        duration_months INTEGER,
        study_mode TEXT,                                -- 'full_time', 'part_time', 'evening_weekend', 'dual_apprenticeship'
        state_funded_or_tuition TEXT,                   -- 'free_state_stipend', 'state_subsidized', 'self_financed_tuition'
        approx_tuition_fee_lkr REAL DEFAULT 0,          -- 0 for state free education
        entry_criteria TEXT,
        industry_accreditation TEXT
      );

      CREATE INDEX IF NOT EXISTS idx_tertiary_inst ON tertiary_program_catalog(inst_id);
      CREATE INDEX IF NOT EXISTS idx_tertiary_cluster ON tertiary_program_catalog(domain_cluster);
      CREATE INDEX IF NOT EXISTS idx_tertiary_qual ON tertiary_program_catalog(qualification_type);
    `);

    // 4. PATHWAY TRANSITION LEDGER (SOVEREIGN DECISION ENGINE)
    db.exec(`
      CREATE TABLE IF NOT EXISTS pathway_transition_ledger (
        pathway_id TEXT PRIMARY KEY,                    -- e.g. 'path:al_physical_sliate_hnde'
        starting_cohort_status TEXT NOT NULL,           -- 'al_qualified_ugc_unadmitted', 'al_attempted_unqualified', 'ol_exit_direct'
        academic_stream TEXT NOT NULL,                  -- 'bio_science', 'physical_science', 'commerce', 'arts', 'technology', 'any'
        recommended_pathway_tier TEXT NOT NULL,         -- 'sliate_hnd', 'nvq_level_4_to_7_ladder', 'professional_chartered', 'non_ugc_state_degree', 'transnational_tne'
        title_en TEXT NOT NULL,
        description_en TEXT NOT NULL,
        example_programs_json TEXT,                     -- JSON array of relevant program IDs / names
        cost_profile TEXT NOT NULL,                     -- 'zero_cost_state_stipend', 'low_cost_government', 'moderate_professional', 'high_private'
        time_to_employment_months INTEGER,
        strategic_advisory TEXT
      );

      CREATE INDEX IF NOT EXISTS idx_pathway_cohort ON pathway_transition_ledger(starting_cohort_status, academic_stream);
    `);

    db.exec('COMMIT;');
    console.log('✅ [MIGRATION 008] Schema created successfully!');
  } catch (err) {
    db.exec('ROLLBACK;');
    console.error('❌ [MIGRATION 008] Failed:', err);
    throw err;
  }
}

// Run immediately if executed directly
if (process.argv[1] && process.argv[1].endsWith('008-add-tertiary-and-vocational-mesh.mjs')) {
  runMigration();
}
