// scripts/education-atlas/importers/import-spatial-mesh.mjs
// Ingests the 10,923 schools, 98 zones, 312 divisions, 25 districts, and 9 provinces from @intuitui-labs/lk-edu-geo

import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, '../../../data/education-atlas/atlas_staging.db');
const geoJsonPath = 'C:/projects/packages/lk-edu-geo/src/data/lk-edu-data.json';

console.log('🗺️  [SPATIAL IMPORTER] Starting Ingestion...');
console.log(`📌 Database Path: ${dbPath}`);
console.log(`📦 Geo Source:   ${geoJsonPath}\n`);

if (!fs.existsSync(geoJsonPath)) {
    throw new Error(`Geo dataset not found at: ${geoJsonPath}`);
}

const db = new DatabaseSync(dbPath);
const rawData = JSON.parse(fs.readFileSync(geoJsonPath, 'utf8'));

const PROVINCE_CODES = {
    P_1: 'WP', P_2: 'CP', P_3: 'SP', P_4: 'NP', P_5: 'EP',
    P_6: 'NWP', P_7: 'NCP', P_8: 'UP', P_9: 'SGP'
};

const DISTRICT_CODES = {
    D_11: 'CO', D_12: 'GA', D_13: 'KL',
    D_21: 'KY', D_22: 'MT', D_23: 'NE',
    D_31: 'GL', D_32: 'MA', D_33: 'HA',
    D_41: 'JA', D_42: 'KI', D_43: 'MN', D_44: 'VA', D_45: 'MU',
    D_51: 'BT', D_52: 'AM', D_53: 'TR',
    D_61: 'KU', D_62: 'PU',
    D_71: 'AN', D_72: 'PO',
    D_81: 'BD', D_82: 'MO',
    D_91: 'RG', D_92: 'KE'
};

db.exec(`BEGIN TRANSACTION;`);

// 1. Insert Provinces
const insertProvinceStmt = db.prepare(`
    INSERT INTO geo_provinces (id, code, name, name_si, name_ta)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
        name = excluded.name,
        name_si = excluded.name_si,
        name_ta = excluded.name_ta;
`);

for (const p of rawData.provinces || []) {
    insertProvinceStmt.run(
        p.id,
        PROVINCE_CODES[p.id] || p.id,
        p.name,
        p.name_si || null,
        p.name_ta || null
    );
}
console.log(`✓ Ingested ${(rawData.provinces || []).length} Provinces.`);

// 2. Insert Districts
const insertDistrictStmt = db.prepare(`
    INSERT INTO geo_districts (id, province_id, code, name, name_si, name_ta)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
        province_id = excluded.province_id,
        name = excluded.name,
        name_si = excluded.name_si,
        name_ta = excluded.name_ta;
`);

for (const d of rawData.districts || []) {
    insertDistrictStmt.run(
        d.id,
        d.province_id,
        DISTRICT_CODES[d.id] || d.id,
        d.name,
        d.name_si || null,
        d.name_ta || null
    );
}
console.log(`✓ Ingested ${(rawData.districts || []).length} Districts.`);

// 3. Insert Zones
const insertZoneStmt = db.prepare(`
    INSERT INTO geo_zones (id, district_id, name)
    VALUES (?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
        name = excluded.name;
`);

for (const z of rawData.zones || []) {
    insertZoneStmt.run(z.id, z.district_id || null, z.name);
}
console.log(`✓ Ingested ${(rawData.zones || []).length} Educational Zones.`);

// 4. Insert Divisions
const insertDivisionStmt = db.prepare(`
    INSERT INTO geo_divisions (id, zone_id, name)
    VALUES (?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
        zone_id = excluded.zone_id,
        name = excluded.name;
`);

for (const div of rawData.divisions || []) {
    insertDivisionStmt.run(div.id, div.zone_id, div.name);
}
console.log(`✓ Ingested ${(rawData.divisions || []).length} Educational Divisions.`);

// 5. Insert Schools (10,923 Schools)
const insertSchoolStmt = db.prepare(`
    INSERT INTO schools (
        census_no, id, name, name_si, name_ta, type, category, gender, medium,
        grade_span, total_students, difficulty_level, province_id, district_id,
        zone_id, division_id, address, postal_code, contact_json, metadata_json
    ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
    )
    ON CONFLICT(census_no) DO UPDATE SET
        name = excluded.name,
        type = excluded.type,
        category = excluded.category,
        total_students = excluded.total_students,
        difficulty_level = excluded.difficulty_level,
        contact_json = excluded.contact_json,
        updated_at = CURRENT_TIMESTAMP;
`);

const provinceIds = new Set((rawData.provinces || []).map(p => p.id));
const districtIds = new Set((rawData.districts || []).map(d => d.id));
const zoneIds = new Set((rawData.zones || []).map(z => z.id));
const divisionIds = new Set((rawData.divisions || []).map(d => d.id));

let schoolCount = 0;
for (const s of rawData.schools || []) {
    if (!s.census_no) continue;

    const loc = s.location || {};
    const jur = s.jurisdiction || {};

    const validProvinceId = provinceIds.has(loc.province_id) ? loc.province_id : null;
    const validDistrictId = districtIds.has(loc.district_id) ? loc.district_id : null;
    const validZoneId = zoneIds.has(jur.zone_id) ? jur.zone_id : null;
    const validDivisionId = divisionIds.has(jur.division_id) ? jur.division_id : null;

    insertSchoolStmt.run(
        s.census_no,
        s.id || `SCH_${s.census_no}`,
        s.name,
        s.name_si || null,
        s.name_ta || null,
        s.type || 'Provincial',
        s.category || 'Type 2',
        s.gender || 'Mixed',
        s.medium || 'Sinhala',
        s.grade_span || null,
        s.total_students || 0,
        s.difficulty_level || null,
        validProvinceId,
        validDistrictId,
        validZoneId,
        validDivisionId,
        s.address || null,
        s.postal_code || null,
        s.contact ? JSON.stringify(s.contact) : null,
        JSON.stringify({ postal_unit_id: loc.postal_unit_id })
    );

    schoolCount++;
}

db.exec(`COMMIT;`);

console.log(`\n🎉 [SPATIAL IMPORTER] Ingestion Complete!`);
console.log(`🏫 Total Schools Ingested:    ${schoolCount}`);

const stats = db.prepare(`
    SELECT category, count(*) as count 
    FROM schools 
    GROUP BY category 
    ORDER BY count DESC;
`).all();

console.log('\n📊 Breakdown by School Category:');
console.table(stats);

const typeStats = db.prepare(`
    SELECT type, count(*) as count 
    FROM schools 
    GROUP BY type 
    ORDER BY count DESC;
`).all();

console.log('📊 Breakdown by School Type:');
console.table(typeStats);
