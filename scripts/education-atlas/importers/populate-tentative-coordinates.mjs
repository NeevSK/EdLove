/**
 * scripts/education-atlas/importers/populate-tentative-coordinates.mjs
 *
 * Establishes the Stage 1 (V1) Tentative Centroid Baseline for 10,923 Sri Lankan Schools.
 * Maps postal codes to official Survey/Postal Department town coordinates.
 * Sets coord_precision = 'tentative_postal_centroid'.
 * Creates the `school_location_pings` ledger for Stage 2 (V2) Citizen-Sensor Ground-Truthing.
 */

import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';

const DB_PATH = path.resolve('data/education-atlas/atlas_staging.db');
const HIERARCHY_PATH = 'C:/projects/packages/lk-edu-geo/scripts/admin-hierarchy.json';

function run() {
  console.log('🌍 [STAGE 1 TENTATIVE BASELINE] Initializing Coordinate Population...');

  if (!fs.existsSync(DB_PATH)) {
    throw new Error(`Database not found at ${DB_PATH}`);
  }
  if (!fs.existsSync(HIERARCHY_PATH)) {
    throw new Error(`Admin hierarchy not found at ${HIERARCHY_PATH}`);
  }

  const db = new DatabaseSync(DB_PATH);
  db.exec('PRAGMA foreign_keys = ON;');
  db.exec('PRAGMA journal_mode = WAL;');

  // 1. Create Stage 2 Citizen-Sensor Ledger if not exists
  db.exec(`
    CREATE TABLE IF NOT EXISTS school_location_pings (
      id TEXT PRIMARY KEY,
      census_no TEXT NOT NULL REFERENCES schools(census_no),
      user_id TEXT,
      user_role TEXT, -- 'principal', 'teacher', 'student', 'parent', 'citizen'
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      altitude REAL,
      accuracy_meters REAL NOT NULL,
      proof_image_url TEXT,
      device_info_json TEXT,
      delta_from_tentative_meters REAL,
      status TEXT DEFAULT 'pending', -- 'pending', 'verified', 'rejected'
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_pings_census ON school_location_pings(census_no);
    CREATE INDEX IF NOT EXISTS idx_pings_status ON school_location_pings(status);
  `);
  console.log('✅ Stage 2 Citizen-Sensor Ledger (school_location_pings) ensured.');

  // 2. Load postal units
  const adminData = JSON.parse(fs.readFileSync(HIERARCHY_PATH, 'utf8'));
  const allCities = (adminData.cities || []).flat();

  const postalMap = new Map();
  for (const c of allCities) {
    if (c && c.postcode && c.latitude && c.longitude) {
      const code = c.postcode.toString().trim();
      if (!postalMap.has(code)) {
        postalMap.set(code, {
          lat: Number(c.latitude),
          lng: Number(c.longitude),
          name: c.name_en || c.sub_name_en || 'Town Centroid',
        });
      }
    }
  }
  console.log(`📍 Loaded ${postalMap.size} distinct postal coordinates.`);

  // 3. Batch Update Schools with Tentative Postal Centroids
  const updateStmt = db.prepare(`
    UPDATE schools 
    SET latitude = ?, 
        longitude = ?, 
        coord_precision = 'tentative_postal_centroid',
        updated_at = CURRENT_TIMESTAMP
    WHERE census_no = ? AND (latitude IS NULL OR coord_precision = 'tentative_postal_centroid')
  `);

  const selectSchoolsStmt = db.prepare('SELECT census_no, postal_code, name FROM schools');
  const schools = selectSchoolsStmt.all();

  let updatedCount = 0;
  let missingPostalCount = 0;

  db.exec('BEGIN TRANSACTION;');
  try {
    for (const school of schools) {
      const code = (school.postal_code || '').toString().trim();
      const coord = postalMap.get(code);

      if (coord) {
        updateStmt.run(coord.lat, coord.lng, school.census_no);
        updatedCount++;
      } else {
        missingPostalCount++;
      }
    }
    db.exec('COMMIT;');
  } catch (err) {
    db.exec('ROLLBACK;');
    throw err;
  }

  console.log(`\n🎉 Spatial Baseline Populated:`);
  console.log(`   - Total Schools Evaluated: ${schools.length}`);
  console.log(`   - Tentative Centroids Set: ${updatedCount} (${((updatedCount / schools.length) * 100).toFixed(1)}%)`);
  console.log(`   - Missing/Unmatched Postal: ${missingPostalCount}`);

  // Verification Query
  const sample = db.prepare(`
    SELECT census_no, name, postal_code, latitude, longitude, coord_precision 
    FROM schools 
    WHERE latitude IS NOT NULL 
    LIMIT 3
  `).all();
  console.log('\n🔎 Sample Populated Schools:');
  console.log(JSON.stringify(sample, null, 2));
}

run();
