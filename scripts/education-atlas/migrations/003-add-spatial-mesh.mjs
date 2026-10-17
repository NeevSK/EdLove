// scripts/education-atlas/migrations/003-add-spatial-mesh.mjs
// Spatial Hierarchy & Schools Directory Schema for Sri Lanka Education Atlas

import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, '../../../data/education-atlas/atlas_staging.db');

console.log(`🗺️  [SPATIAL MESH] Opening database at: ${dbPath}`);
const db = new DatabaseSync(dbPath);

// Enable WAL mode
db.exec(`PRAGMA journal_mode = WAL;`);
db.exec(`PRAGMA synchronous = NORMAL;`);

db.exec(`BEGIN TRANSACTION;`);

// 1. Provinces Table (9 Provinces)
db.exec(`
CREATE TABLE IF NOT EXISTS geo_provinces (
    id TEXT PRIMARY KEY,               -- 'P_1', 'P_2'
    code TEXT NOT NULL,                -- 'WP', 'CP', 'SP'
    name TEXT NOT NULL,                -- 'Western'
    name_si TEXT,                      -- 'බස්නාහිර පළාත'
    name_ta TEXT,                      -- 'மேல் மாகாணம்'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
`);

// 2. Districts Table (25 Districts)
db.exec(`
CREATE TABLE IF NOT EXISTS geo_districts (
    id TEXT PRIMARY KEY,               -- 'D_11', 'D_21'
    province_id TEXT NOT NULL REFERENCES geo_provinces(id),
    code TEXT NOT NULL,                -- 'CO', 'KY'
    name TEXT NOT NULL,                -- 'Colombo'
    name_si TEXT,                      -- 'කොළඹ දිස්ත්‍රික්කය'
    name_ta TEXT,                      -- 'கொழும்பு மாவட்டம்'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
`);

// 3. Educational Zones (98 Zones)
db.exec(`
CREATE TABLE IF NOT EXISTS geo_zones (
    id TEXT PRIMARY KEY,               -- 'Z_2001'
    district_id TEXT REFERENCES geo_districts(id),
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
`);

// 4. Educational Divisions (312 Divisions)
db.exec(`
CREATE TABLE IF NOT EXISTS geo_divisions (
    id TEXT PRIMARY KEY,               -- 'DIV_2001001'
    zone_id TEXT REFERENCES geo_zones(id),
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
`);

// 5. Schools Directory (10,923 Schools across Sri Lanka)
db.exec(`
CREATE TABLE IF NOT EXISTS schools (
    census_no TEXT PRIMARY KEY,        -- '0611016'
    id TEXT NOT NULL,                  -- 'SCH_0611016'
    name TEXT NOT NULL,
    name_si TEXT,
    name_ta TEXT,
    type TEXT NOT NULL,                -- 'National', 'Provincial', 'Private'
    category TEXT NOT NULL,            -- '1AB', '1C', 'Type 2', 'Type 3'
    gender TEXT,                       -- 'Mixed', 'Boys', 'Girls'
    medium TEXT,                       -- 'Sinhala', 'Tamil', 'English', 'Bilingual'
    grade_span TEXT,                   -- 'Grade 1-5', 'Grade 1-13'
    total_students INTEGER DEFAULT 0,
    difficulty_level TEXT,             -- 'Congenial', 'Not Congenial', 'Difficult', 'Very Difficult'
    province_id TEXT REFERENCES geo_provinces(id),
    district_id TEXT REFERENCES geo_districts(id),
    zone_id TEXT REFERENCES geo_zones(id),
    division_id TEXT REFERENCES geo_divisions(id),
    address TEXT,
    postal_code TEXT,
    latitude REAL,                     -- WGS84 GPS coordinate
    longitude REAL,                    -- WGS84 GPS coordinate
    coord_precision TEXT,              -- 'exact_osm', 'zone_centroid', 'approximate'
    contact_json TEXT,                 -- '{"tel": "0112...", "email": "info@..."}'
    metadata_json TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_schools_district ON schools(district_id);
CREATE INDEX IF NOT EXISTS idx_schools_category ON schools(category);
CREATE INDEX IF NOT EXISTS idx_schools_type ON schools(type);
CREATE INDEX IF NOT EXISTS idx_schools_name ON schools(name);
CREATE INDEX IF NOT EXISTS idx_schools_zone ON schools(zone_id);
`);

// 6. Schools Full-Text Search Virtual Table (FTS5)
db.exec(`
CREATE VIRTUAL TABLE IF NOT EXISTS schools_fts USING fts5(
    census_no,
    name,
    address,
    content='schools',
    content_rowid='rowid'
);

CREATE TRIGGER IF NOT EXISTS schools_ai AFTER INSERT ON schools BEGIN
    INSERT INTO schools_fts(rowid, census_no, name, address)
    VALUES (new.rowid, new.census_no, new.name, new.address);
END;

CREATE TRIGGER IF NOT EXISTS schools_ad AFTER DELETE ON schools BEGIN
    INSERT INTO schools_fts(schools_fts, rowid, census_no, name, address)
    VALUES ('delete', old.rowid, old.census_no, old.name, old.address);
END;

CREATE TRIGGER IF NOT EXISTS schools_au AFTER UPDATE ON schools BEGIN
    INSERT INTO schools_fts(schools_fts, rowid, census_no, name, address)
    VALUES ('delete', old.rowid, old.census_no, old.name, old.address);
    INSERT INTO schools_fts(rowid, census_no, name, address)
    VALUES (new.rowid, new.census_no, new.name, new.address);
END;
`);

db.exec(`COMMIT;`);

console.log('✅ [SPATIAL MESH] Migration 003 completed successfully.');
