// scripts/education-atlas/migrations/004-add-governance-and-culture.mjs
// Schema extension for School Governance (People, Roles, Occupancies), Contacts, Sports, and Culture

import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, '../../../data/education-atlas/atlas_staging.db');

console.log(`🏛️  [GOVERNANCE & CULTURE MESH] Opening database at: ${dbPath}`);
const db = new DatabaseSync(dbPath);

db.exec(`PRAGMA journal_mode = WAL;`);
db.exec(`PRAGMA synchronous = NORMAL;`);

db.exec(`BEGIN TRANSACTION;`);

// 1. PEOPLE DIRECTORY
db.exec(`
CREATE TABLE IF NOT EXISTS people (
    person_id TEXT PRIMARY KEY,          -- 'person:ba_abeyrathna'
    canonical_name TEXT NOT NULL,        -- 'B. A. Abeyrathna'
    canonical_name_si TEXT,              -- 'බී. ඒ. අබේරත්න'
    canonical_name_ta TEXT,
    honors_prefix TEXT,                  -- 'Deshabandu', 'Prof.', 'Dr.'
    qualifications_json TEXT,            -- '["BSc", "MEd", "SLPS Class I"]'
    biographical_notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
`);

// 2. ROLE DEFINITIONS (The Abstract Office / Post)
db.exec(`
CREATE TABLE IF NOT EXISTS role_definitions (
    role_code TEXT PRIMARY KEY,          -- 'principal', 'deputy_principal', 'vice_chancellor'
    title_en TEXT NOT NULL,
    title_si TEXT,
    title_ta TEXT,
    service_minute TEXT,                 -- 'SLPS', 'SLEAS', 'SLTS', 'UGC_ACT'
    class_grade TEXT,                    -- 'Class I', 'Special Grade', 'Executive'
    authority_level TEXT                 -- 'institutional_head', 'sectional_lead', 'co_curricular'
);
`);

// 3. ROLE OCCUPANCIES (The Temporal Tenure / Ontogeny)
db.exec(`
CREATE TABLE IF NOT EXISTS role_occupancies (
    occupancy_id TEXT PRIMARY KEY,       -- 'occ:sch_0117001_principal_2015'
    person_id TEXT NOT NULL REFERENCES people(person_id),
    role_code TEXT NOT NULL REFERENCES role_definitions(role_code),
    entity_id TEXT NOT NULL REFERENCES entities(entity_id),
    
    valid_from TEXT NOT NULL,            -- '2015-01-01' (Assumption of duties)
    valid_to TEXT,                       -- '2020-12-31' (NULL if active incumbent)
    tenure_status TEXT NOT NULL,         -- 'confirmed', 'acting', 'interdicted', 'retired'
    appointment_type TEXT,               -- 'gazetted_promotion', 'lateral_transfer', 'deputation'
    
    gazette_ref_id TEXT REFERENCES resources(resource_id),
    official_memo TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ro_person ON role_occupancies(person_id);
CREATE INDEX IF NOT EXISTS idx_ro_entity ON role_occupancies(entity_id);
CREATE INDEX IF NOT EXISTS idx_ro_timeline ON role_occupancies(valid_from, valid_to);
`);

// 4. CONTACT POINTS (Entity vs. Role vs. Person Scoping & Privacy Tiers)
db.exec(`
CREATE TABLE IF NOT EXISTS contact_points (
    contact_id TEXT PRIMARY KEY,
    owner_scope TEXT NOT NULL,           -- 'entity', 'role_occupancy', 'person'
    owner_id TEXT NOT NULL,              -- References school census_no, occupancy_id, or person_id
    
    contact_type TEXT NOT NULL,          -- 'phone_landline', 'phone_mobile', 'email', 'fax', 'web'
    contact_value TEXT NOT NULL,         -- '0112695551', 'principal@royal.lk'
    purpose TEXT DEFAULT 'general',      -- 'admissions', 'emergency', 'official_desk'
    privacy_tier TEXT NOT NULL,          -- 'public', 'administrative_restricted', 'redacted_pii'
    is_primary BOOLEAN DEFAULT FALSE,
    verified_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_cp_owner ON contact_points(owner_scope, owner_id);
`);

// 5. STUDENT SUB-ENTITIES: SPORTS, CLUBS, SOCIETIES, AESTHETICS
db.exec(`
CREATE TABLE IF NOT EXISTS school_sub_entities (
    sub_entity_id TEXT PRIMARY KEY,      -- 'sub:0117001_cricket_1st_xi', 'sub:0117001_astronomy'
    school_census_no TEXT NOT NULL REFERENCES schools(census_no),
    name_en TEXT NOT NULL,
    name_si TEXT,
    name_ta TEXT,
    domain TEXT NOT NULL,                -- 'sport', 'academic_society', 'performing_arts', 'uniformed_corps', 'prefects'
    founded_year INTEGER,
    crest_url TEXT,
    traditions_summary TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sse_school ON school_sub_entities(school_census_no);
`);

// 6. TRADITION EVENTS & BIG MATCHES
db.exec(`
CREATE TABLE IF NOT EXISTS tradition_events (
    event_id TEXT PRIMARY KEY,           -- 'event:battle_of_the_blues'
    canonical_name TEXT NOT NULL,        -- 'Battle of the Blues (Royal-Thomian)'
    domain TEXT NOT NULL,                -- 'cricket_derby', 'rugby_derby', 'all_island_dancing'
    primary_schools_json TEXT NOT NULL,  -- '["0117001", "0116002"]'
    inception_year INTEGER,
    trophy_name TEXT,                    -- 'Senanayake Shield'
    series_tally_json TEXT               -- '{"school_a_wins": 36, "school_b_wins": 35, "draws": 76}'
);
`);

// SEED STANDARD ROLE DEFINITIONS
const standardRoles = [
    {
        role_code: 'principal',
        title_en: 'Principal / Institutional Head',
        title_si: 'විදුහල්පති',
        title_ta: 'அதிபர்',
        service_minute: 'SLPS',
        class_grade: 'Class I / Special Grade',
        authority_level: 'institutional_head'
    },
    {
        role_code: 'deputy_principal_academic',
        title_en: 'Deputy Principal (Academic Affairs)',
        title_si: 'නියෝජ්‍ය විදුහල්පති (අධ්‍යයන)',
        title_ta: 'பிரதி அதிபர் (கல்வி)',
        service_minute: 'SLPS',
        class_grade: 'Class II',
        authority_level: 'sectional_lead'
    },
    {
        role_code: 'deputy_principal_admin',
        title_en: 'Deputy Principal (Administration)',
        title_si: 'නියෝජ්‍ය විදුහල්පති (පාලන)',
        title_ta: 'பிரதி அதிபர் (நிர்வாகம்)',
        service_minute: 'SLPS',
        class_grade: 'Class II',
        authority_level: 'sectional_lead'
    },
    {
        role_code: 'sectional_head',
        title_en: 'Sectional Head / Stream Supervisor',
        title_si: 'අංශ ප්‍රධානී',
        title_ta: 'பிரிவுத் தலைவர்',
        service_minute: 'SLTS',
        class_grade: 'Class 1 / Class 2-I',
        authority_level: 'sectional_lead'
    },
    {
        role_code: 'prefect_head_boy',
        title_en: 'Head Prefect (Head Boy)',
        title_si: 'ප්‍රධාන ශිෂ්‍ය නායක',
        title_ta: 'பிரதம மாணவர் தலைவர்',
        service_minute: 'STUDENT_GUILD',
        class_grade: 'Student Leader',
        authority_level: 'co_curricular'
    },
    {
        role_code: 'prefect_head_girl',
        title_en: 'Head Prefect (Head Girl)',
        title_si: 'ප්‍රධාන ශිෂ්‍ය නායිකා',
        title_ta: 'பிரதம மாணவித் தலைவி',
        service_minute: 'STUDENT_GUILD',
        class_grade: 'Student Leader',
        authority_level: 'co_curricular'
    },
    {
        role_code: 'master_in_charge_sports',
        title_en: 'Prefect of Games / Master-in-Charge of Sports',
        title_si: 'ක්‍රීඩා භාර ආචාර්ය',
        title_ta: 'விளையாட்டுப் பொறுப்பாசிரியர்',
        service_minute: 'SLTS',
        class_grade: 'Senior Teacher',
        authority_level: 'co_curricular'
    },
    {
        role_code: 'vice_chancellor',
        title_en: 'Vice Chancellor (Chief Executive Officer)',
        title_si: 'උපකුලපති',
        title_ta: 'துணைவேந்தர்',
        service_minute: 'UGC_ACT',
        class_grade: 'Senior Professor / Executive',
        authority_level: 'institutional_head'
    },
    {
        role_code: 'dean_faculty',
        title_en: 'Dean of Faculty',
        title_si: 'පීඨාධිපති',
        title_ta: 'பீடாதிபதி',
        service_minute: 'UGC_ACT',
        class_grade: 'Professor / Senior Lecturer Grade I',
        authority_level: 'sectional_lead'
    }
];

const insertRoleStmt = db.prepare(`
    INSERT INTO role_definitions (role_code, title_en, title_si, title_ta, service_minute, class_grade, authority_level)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(role_code) DO NOTHING;
`);

for (const r of standardRoles) {
    insertRoleStmt.run(r.role_code, r.title_en, r.title_si, r.title_ta, r.service_minute, r.class_grade, r.authority_level);
}

// SEED ICONIC TRADITION EVENTS (Big Matches & Festivals)
const traditionEvents = [
    {
        event_id: 'event:battle_of_the_blues',
        canonical_name: 'Battle of the Blues (Royal - St. Thomas\')',
        domain: 'cricket_derby',
        primary_schools_json: JSON.stringify(['0117001', '0116002']),
        inception_year: 1879,
        trophy_name: 'D. S. Senanayake Memorial Shield',
        series_tally_json: JSON.stringify({ series_matches: 145, traditions: 'Oldest uninterrupted cricket match in Asia' })
    },
    {
        event_id: 'event:battle_of_the_maroons',
        canonical_name: 'Battle of the Maroons (Ananda - Nalanda)',
        domain: 'cricket_derby',
        primary_schools_json: JSON.stringify(['0117002', '0117003']),
        inception_year: 1924,
        trophy_name: 'Dr. N. M. Perera Memorial Challenge Trophy',
        series_tally_json: JSON.stringify({ series_matches: 94, traditions: 'Premier Buddhist school cricketing encounter' })
    },
    {
        event_id: 'event:bradby_shield',
        canonical_name: 'The Bradby Shield Encounter (Royal - Trinity)',
        domain: 'rugby_derby',
        primary_schools_json: JSON.stringify(['0117001', '0401001']),
        inception_year: 1945,
        trophy_name: 'The Bradby Shield (Donated by E.L. Bradby)',
        series_tally_json: JSON.stringify({ series_matches: 78, traditions: 'Two-leg home and away rugby championship' })
    },
    {
        event_id: 'event:battle_of_the_north',
        canonical_name: 'Battle of the North (Jaffna Central - St. John\'s)',
        domain: 'cricket_derby',
        primary_schools_json: JSON.stringify(['0901001', '0901002']),
        inception_year: 1904,
        trophy_name: 'Rev. J. P. S. Handy Trophy',
        series_tally_json: JSON.stringify({ series_matches: 117, traditions: 'Premier Northern cricket encounter in Jaffna' })
    },
    {
        event_id: 'event:all_island_school_dancing',
        canonical_name: 'All-Island School Dancing & Aesthetic Competition',
        domain: 'performing_arts',
        primary_schools_json: JSON.stringify(['national_all_island']),
        inception_year: 1956,
        trophy_name: 'President\'s Gold Medal for Traditional Dance',
        series_tally_json: JSON.stringify({ disciplines: ['Kandyan Ves', 'Pahatharata', 'Sabaragamuwa', 'Bharatanatyam'] })
    }
];

const insertEventStmt = db.prepare(`
    INSERT INTO tradition_events (event_id, canonical_name, domain, primary_schools_json, inception_year, trophy_name, series_tally_json)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(event_id) DO NOTHING;
`);

for (const ev of traditionEvents) {
    insertEventStmt.run(ev.event_id, ev.canonical_name, ev.domain, ev.primary_schools_json, ev.inception_year, ev.trophy_name, ev.series_tally_json);
}

db.exec(`COMMIT;`);

console.log('✅ [GOVERNANCE & CULTURE MESH] Migration 004 completed successfully.');
console.log(`✓ Seeded ${standardRoles.length} standard educational role definitions.`);
console.log(`✓ Seeded ${traditionEvents.length} national tradition & derby events.`);
