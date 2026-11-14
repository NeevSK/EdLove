// scripts/education-atlas/link-school-events.mjs
// Links schools to the poly-temporal knowledge graph via public gazettes, circulars, and news

import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, '../../data/education-atlas/atlas_staging.db');

const args = process.argv.slice(2);
const IS_COMMIT = args.includes('--commit');
const IS_DRY_RUN = !IS_COMMIT || args.includes('--dry-run');

console.log('🏫 [SCHOOL ENTITY LINKER] Starting Cross-Referencing...');
console.log(`📌 Database Path: ${dbPath}`);
console.log(`⚙️  Mode:          ${IS_DRY_RUN ? 'DRY-RUN (In-memory simulation)' : 'COMMIT (Writing to SQLite)'}\n`);

const db = new DatabaseSync(dbPath);

// 1. Fetch schools with meaningful distinctive names (length >= 8 to prevent false positives)
const schools = db.prepare(`
    SELECT census_no, name, category, type, district_id 
    FROM schools 
    WHERE length(name) >= 8
`).all();

console.log(`📦 Loaded ${schools.length} distinctive schools for matching.`);

// 2. Fetch all resources
const resources = db.prepare(`
    SELECT 
        resource_id, 
        source_id, 
        title, 
        summary, 
        COALESCE(publication_date, gazette_date) as event_date,
        canonical_url,
        ingested_via
    FROM resources
    WHERE event_date IS NOT NULL
`).all();

console.log(`📦 Loaded ${resources.length} date-stamped resources to scan.\n`);

// 3. Match schools against resources
// Pre-filter prominent schools and exact names
const matches = [];
const matchedSchools = new Map();

for (const res of resources) {
    const text = `${res.title} ${res.summary || ''}`.toLowerCase();
    
    // Quick scan for common school markers
    if (!text.includes('college') && !text.includes('vidyalaya') && !text.includes('school') && !text.includes('මහා විද්‍යාල') && !text.includes('පාසල')) {
        continue;
    }

    for (const school of schools) {
        const cleanName = school.name.toLowerCase().trim();
        
        // Exact name or distinctive prefix match
        if (cleanName.length > 10 && text.includes(cleanName)) {
            matches.push({ school, resource: res });
            matchedSchools.set(school.census_no, (matchedSchools.get(school.census_no) || 0) + 1);
        }
    }
}

console.log('========================================================================');
console.log('                 SCHOOL TEMPORAL LINKING REPORT                         ');
console.log('========================================================================');
console.log(`🎯 TOTAL RESOURCES SCANNED:             ${resources.length}`);
console.log(`⚡ TOTAL SCHOOL-EVENT CONNECTIONS FOUND: ${matches.length}`);
console.log(`🏫 DISTINCT SCHOOLS LINKED:             ${matchedSchools.size}`);

console.log('\n📊 TOP MATCHED SCHOOLS IN PUBLIC RECORDS:');
const sortedSchools = Array.from(matchedSchools.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15);

for (const [censusNo, count] of sortedSchools) {
    const s = schools.find(sch => sch.census_no === censusNo);
    console.log(` • [${censusNo}] ${s.name.padEnd(35)}: ${count} public records (${s.type}, ${s.category})`);
}

if (!IS_DRY_RUN && matches.length > 0) {
    console.log('\n💾 Writing school entities and temporal connections to database...');
    
    const insertEntityStmt = db.prepare(`
        INSERT INTO entities (entity_id, entity_type, canonical_name, sector, metadata_json)
        VALUES (?, 'school', ?, 'state_education', ?)
        ON CONFLICT(entity_id) DO UPDATE SET
            canonical_name = excluded.canonical_name,
            updated_at = CURRENT_TIMESTAMP;
    `);

    const insertConnStmt = db.prepare(`
        INSERT INTO temporal_connections (
            connection_id, subject_entity_id, predicate, object_entity_id,
            valid_from, valid_to, documented_at, document_ref_id, confidence,
            source_citation, notes
        ) VALUES (
            ?, ?, 'referenced_in_public_record', ?,
            ?, NULL, ?, ?, 0.95,
            ?, ?
        )
        ON CONFLICT(connection_id) DO UPDATE SET
            confidence = excluded.confidence,
            source_citation = excluded.source_citation;
    `);

    db.exec('BEGIN TRANSACTION;');
    
    for (const m of matches) {
        const entityId = `school:${m.school.census_no}`;
        
        // Ensure entity exists
        insertEntityStmt.run(
            entityId,
            m.school.name,
            JSON.stringify({ category: m.school.category, type: m.school.type, district_id: m.school.district_id })
        );

        // Insert connection
        const connId = `conn:sch_${m.school.census_no}_${m.resource.resource_id}`.slice(0, 80);
        insertConnStmt.run(
            connId,
            entityId,
            'inst:moe_lk',
            m.resource.event_date,
            m.resource.event_date,
            m.resource.resource_id,
            m.resource.title.slice(0, 200),
            `Verified school event from ${m.resource.ingested_via}`
        );
    }

    db.exec('COMMIT;');
    console.log(`✅ Successfully committed ${matches.length} school temporal connections!`);
} else if (IS_DRY_RUN) {
    console.log('\nℹ️  Run with --commit to write these school connections to SQLite.');
}
