// scripts/education-atlas/migrations/011-add-co-curricular-and-resource-distribution.mjs
// Migration 011: Add Co-Curricular Movements, Sunday Religious School Networks, and School Resource Distribution Profiles

import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.resolve(__dirname, '../../../data/education-atlas/atlas_staging.db');

console.log(`[Migration 011] Opening database at: ${DB_PATH}`);
const db = new DatabaseSync(DB_PATH);
db.exec('PRAGMA foreign_keys = ON;');
db.exec('PRAGMA journal_mode = WAL;');

// 1. Create co_curricular_movements
console.log('[Migration 011] Creating co_curricular_movements table...');
db.exec(`
CREATE TABLE IF NOT EXISTS co_curricular_movements (
  movement_id TEXT PRIMARY KEY,
  name_en TEXT NOT NULL,
  name_si TEXT,
  name_ta TEXT,
  movement_type TEXT NOT NULL, -- scouting_guiding, environmental_pioneer, first_aid_humanitarian, civic_traffic_cadet
  founding_year INTEGER,
  governing_body TEXT NOT NULL,
  highest_honor_award TEXT, -- President's Scout Award, President's Environmental Award, etc.
  uniform_and_insignia TEXT,
  core_pillars_json TEXT,
  annual_student_cadre_est INTEGER,
  official_portal TEXT,
  civic_role_notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_movements_type ON co_curricular_movements(movement_type);
`);

// 2. Create dhamma_school_networks
console.log('[Migration 011] Creating dhamma_school_networks table...');
db.exec(`
CREATE TABLE IF NOT EXISTS dhamma_school_networks (
  network_id TEXT PRIMARY KEY,
  faith_tradition TEXT NOT NULL, -- buddhism, hinduism, christianity_catholic, islam
  name_en TEXT NOT NULL,
  name_si TEXT,
  name_ta TEXT,
  governing_state_department TEXT NOT NULL,
  operating_venues TEXT NOT NULL, -- Village temples, kovils, churches, mosques
  estimated_school_units INTEGER NOT NULL,
  estimated_student_enrollment INTEGER NOT NULL,
  national_examination_framework TEXT, -- Dharmacharya Exam, Araneri Certificate, etc.
  volunteer_teaching_force_est INTEGER,
  sociological_role_notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_dhamma_faith ON dhamma_school_networks(faith_tradition);
`);

// 3. Create school_resource_distribution_profiles
console.log('[Migration 011] Creating school_resource_distribution_profiles table...');
db.exec(`
CREATE TABLE IF NOT EXISTS school_resource_distribution_profiles (
  profile_id TEXT PRIMARY KEY,
  school_census_no TEXT NOT NULL REFERENCES schools(census_no),
  sports_infrastructure_tier TEXT NOT NULL, -- olympic_turf_complex, grass_ground_matting, gravel_volleyball_only, zero_playground
  sports_offered_json TEXT NOT NULL, -- list of sports
  swimming_pool_available INTEGER DEFAULT 0,
  cricket_turf_available INTEGER DEFAULT 0,
  aesthetic_streams_available_json TEXT NOT NULL, -- list of available aesthetic streams
  aesthetic_teacher_status TEXT NOT NULL, -- surplus, balanced, deficit_music_dance_missing, severe_shortage_art_only
  al_science_capable INTEGER NOT NULL, -- 1 if 1AB, 0 if 1C or Type 2/3
  functional_computer_terminals INTEGER NOT NULL,
  drinking_water_source TEXT NOT NULL, -- pipe_borne_safe, ro_filtration_plant, tube_well_tested, unprotected_source_deficit
  electricity_status TEXT NOT NULL, -- national_grid_continuous, solar_microgrid, no_electricity
  midday_meal_beneficiary INTEGER DEFAULT 0,
  co_curricular_units_json TEXT, -- Scouts, Guides, Parisara Niyamu, St. John, Cadets
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_res_dist_census ON school_resource_distribution_profiles(school_census_no);
CREATE INDEX IF NOT EXISTS idx_res_dist_sports ON school_resource_distribution_profiles(sports_infrastructure_tier);
CREATE INDEX IF NOT EXISTS idx_res_dist_science ON school_resource_distribution_profiles(al_science_capable);
CREATE INDEX IF NOT EXISTS idx_res_dist_water ON school_resource_distribution_profiles(drinking_water_source);
`);

console.log('[Migration 011] Migration completed successfully.');
