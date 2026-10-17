// scripts/education-atlas/migrations/002-add-temporal-mesh.mjs
// Poly-temporal Knowledge Graph Schema & Seed Extension for Sri Lanka Education Atlas

import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, '../../../data/education-atlas/atlas_staging.db');

console.log(`[TEMPORAL MESH] Opening database at: ${dbPath}`);
const db = new DatabaseSync(dbPath);

// Enable WAL mode
db.exec(`PRAGMA journal_mode = WAL;`);
db.exec(`PRAGMA synchronous = NORMAL;`);

// 1. Entities Table: People, Institutions, Regulatory Bodies, Exam Cohorts, Curriculums
db.exec(`
CREATE TABLE IF NOT EXISTS entities (
    entity_id TEXT PRIMARY KEY,
    entity_type TEXT NOT NULL,           -- 'person', 'institution', 'regulatory_body', 'school', 'policy_instrument', 'curriculum'
    canonical_name TEXT NOT NULL,
    canonical_name_si TEXT,
    canonical_name_ta TEXT,
    sector TEXT,                         -- 'state_education', 'higher_ed', 'civic_research', 'monetary_policy'
    aliases_json TEXT,                   -- '["MOE", "Ministry of Education", "Adyapana Amathyanshaya"]'
    metadata_json TEXT,                  -- Flexible attributes (website, headquarters, legal_mandate)
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
`);

// 2. Temporal Connections Table: Poly-Temporal Edges Linking Entities and Resources
db.exec(`
CREATE TABLE IF NOT EXISTS temporal_connections (
    connection_id TEXT PRIMARY KEY,
    subject_entity_id TEXT NOT NULL REFERENCES entities(entity_id),
    predicate TEXT NOT NULL,             -- 'chaired', 'minister_of', 'published', 'mandated', 'affiliated_with', 'succeeded_by'
    object_entity_id TEXT NOT NULL REFERENCES entities(entity_id),
    
    -- TIME DIMENSION 1: OCCURRED / VALID TIME (Real-world timeline interval)
    valid_from TEXT,                     -- '2003-01-01' (ISO8601 start date)
    valid_to TEXT,                       -- '2023-07-23' (ISO8601 end date, NULL if ongoing)
    
    -- TIME DIMENSION 2: DOCUMENTED / ASSERTION TIME
    documented_at TEXT,                  -- '2003-02-15' (Date stated in the source document)
    document_ref_id TEXT,                -- Foreign Key referencing resources(resource_id)
    
    -- TIME DIMENSION 3: OBSERVED TIME (System ingestion timestamp)
    observed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    confidence REAL DEFAULT 1.0,         -- 0.0 to 1.0 certainty
    source_citation TEXT,                -- Human readable citation e.g. "Gazette No. 1284/12", "Sunday Times Archive"
    notes TEXT                           -- Contextual notes on the relationship
);

CREATE INDEX IF NOT EXISTS idx_temp_conn_subject ON temporal_connections(subject_entity_id);
CREATE INDEX IF NOT EXISTS idx_temp_conn_object ON temporal_connections(object_entity_id);
CREATE INDEX IF NOT EXISTS idx_temp_conn_timeline ON temporal_connections(valid_from, valid_to);
CREATE INDEX IF NOT EXISTS idx_temp_conn_doc ON temporal_connections(documented_at);
`);

console.log(`[TEMPORAL MESH] Created entities and temporal_connections tables successfully.`);

// 3. Seed Initial High-Leverage Institutional & Civic Entities
const initialEntities = [
    {
        entity_id: 'inst:moe_lk',
        entity_type: 'institution',
        canonical_name: 'Ministry of Education Sri Lanka',
        canonical_name_si: 'අධ්‍යාපන අමාත්‍යාංශය',
        canonical_name_ta: 'கல்வி அமைச்சு',
        sector: 'state_education',
        aliases: ['MOE', 'Ministry of Education', 'Isurupaya'],
        metadata: { headquarters: 'Isurupaya, Battaramulla', url: 'https://moe.gov.lk' }
    },
    {
        entity_id: 'inst:doenets_lk',
        entity_type: 'regulatory_body',
        canonical_name: 'Department of Examinations Sri Lanka',
        canonical_name_si: 'විභාග දෙපාර්තමේන්තුව',
        canonical_name_ta: 'பரீட்சைத் திணைக்களம்',
        sector: 'state_education',
        aliases: ['DOENETS', 'Department of Examinations', 'Pelawatta Exam Dept'],
        metadata: { headquarters: 'Pelawatta, Battaramulla', url: 'https://doenets.lk' }
    },
    {
        entity_id: 'inst:nie_lk',
        entity_type: 'regulatory_body',
        canonical_name: 'National Institute of Education',
        canonical_name_si: 'ජාතික අධ්‍යාපන ආයතනය',
        canonical_name_ta: 'தேசிய கல்வி நிறுவகம்',
        sector: 'state_education',
        aliases: ['NIE', 'National Institute of Education Maharagama'],
        metadata: { headquarters: 'Maharagama', url: 'https://nie.lk' }
    },
    {
        entity_id: 'inst:ugc_lk',
        entity_type: 'regulatory_body',
        canonical_name: 'University Grants Commission Sri Lanka',
        canonical_name_si: 'විශ්වවිද්‍යාල ප්‍රතිපාදන කොමිෂන් සභාව',
        canonical_name_ta: 'பல்கலைக்கழக மானியங்கள் ஆணைக்குழு',
        sector: 'higher_ed',
        aliases: ['UGC', 'University Grants Commission'],
        metadata: { headquarters: 'Ward Place, Colombo 07', url: 'https://ugc.ac.lk' }
    },
    {
        entity_id: 'inst:ldf_lk',
        entity_type: 'institution',
        canonical_name: 'Lanka Data Foundation',
        canonical_name_si: 'ලංකා දත්ත පදනම',
        canonical_name_ta: 'இலங்கை தரவு அறக்கட்டளை',
        sector: 'civic_research',
        aliases: ['LDF', 'LDFLK'],
        metadata: { url: 'https://github.com/LDFLK', focus: 'Open civic data, Gazette archiving' }
    },
    {
        entity_id: 'inst:frontier_research',
        entity_type: 'institution',
        canonical_name: 'Frontier Research',
        canonical_name_si: 'ෆ්‍රොන්ටියර් රිසර්ච්',
        canonical_name_ta: 'ப்ரொண்டியர் ரிசர்ச்',
        sector: 'civic_research',
        aliases: ['Frontier', 'Frontier Research Pvt Ltd'],
        metadata: { founded_year: 2003, focus: 'Macroeconomic forecasting, Time-saving curation' }
    },
    {
        entity_id: 'person:amal_sanderatne',
        entity_type: 'person',
        canonical_name: 'Amal Sanderatne',
        canonical_name_si: 'අමල් සඳරත්න',
        canonical_name_ta: 'அமல் சந்தரத்ன',
        sector: 'civic_research',
        aliases: ['Amal', 'A. Sanderatne'],
        metadata: { credentials: ['LSE BSc Economics', 'CFA Charterholder'], lifespan: '1976-2023' }
    },
    {
        entity_id: 'person:ayoma_sanderatne',
        entity_type: 'person',
        canonical_name: 'Ayoma Sanderatne',
        canonical_name_si: 'අයෝමා සඳරත්න',
        canonical_name_ta: 'அயோமா சந்தரத்ன',
        sector: 'civic_research',
        aliases: ['Ayoma'],
        metadata: { credentials: ['BA Univ of Colombo', 'PGDip Econ Dev'], focus: 'Social Research, Learn for Life Lanka' }
    },
    {
        entity_id: 'person:nimal_sanderatne',
        entity_type: 'person',
        canonical_name: 'Dr. Nimal Sanderatne',
        canonical_name_si: 'ආචාර්ය නිමල් සඳරත්න',
        canonical_name_ta: 'கலாநிதி நிமல் சந்தரத்ன',
        sector: 'monetary_policy',
        aliases: ['Dr. Nimal Sanderatne', 'N. Sanderatne'],
        metadata: { credentials: ['PhD Univ of Wisconsin', 'MSc Wisconsin'], roles: ['Director CBSL', 'Chairman BOC', 'Chairman NDB'] }
    },
    {
        entity_id: 'inst:cbsl_lk',
        entity_type: 'regulatory_body',
        canonical_name: 'Central Bank of Sri Lanka',
        canonical_name_si: 'ශ්‍රී ලංකා මහ බැංකුව',
        canonical_name_ta: 'இலங்கை மத்திய வங்கி',
        sector: 'monetary_policy',
        aliases: ['CBSL', 'Central Bank'],
        metadata: { url: 'https://cbsl.gov.lk' }
    },
    {
        entity_id: 'inst:boc_lk',
        entity_type: 'institution',
        canonical_name: 'Bank of Ceylon',
        canonical_name_si: 'ලංකා බැංකුව',
        canonical_name_ta: 'இலங்கை வங்கி',
        sector: 'monetary_policy',
        aliases: ['BOC', 'Bank of Ceylon'],
        metadata: { url: 'https://boc.lk' }
    }
];

const insertEntityStmt = db.prepare(`
INSERT INTO entities (entity_id, entity_type, canonical_name, canonical_name_si, canonical_name_ta, sector, aliases_json, metadata_json)
VALUES (?, ?, ?, ?, ?, ?, ?, ?)
ON CONFLICT(entity_id) DO UPDATE SET
    canonical_name = excluded.canonical_name,
    canonical_name_si = excluded.canonical_name_si,
    canonical_name_ta = excluded.canonical_name_ta,
    sector = excluded.sector,
    aliases_json = excluded.aliases_json,
    metadata_json = excluded.metadata_json,
    updated_at = CURRENT_TIMESTAMP;
`);

for (const ent of initialEntities) {
    insertEntityStmt.run(
        ent.entity_id,
        ent.entity_type,
        ent.canonical_name,
        ent.canonical_name_si,
        ent.canonical_name_ta,
        ent.sector,
        JSON.stringify(ent.aliases),
        JSON.stringify(ent.metadata)
    );
}
console.log(`[TEMPORAL MESH] Seeded ${initialEntities.length} core entities.`);

// 4. Seed Initial Temporal Connections (Sample Grounded Chronology)
const sampleConnections = [
    {
        connection_id: 'conn:nimal_cbsl_research',
        subject: 'person:nimal_sanderatne',
        predicate: 'director_of_economic_research',
        object: 'inst:cbsl_lk',
        valid_from: '1980-01-01',
        valid_to: '1987-12-31',
        documented_at: '1988-01-01',
        citation: 'Central Bank of Sri Lanka Annual Reports & History'
    },
    {
        connection_id: 'conn:nimal_boc_chair',
        subject: 'person:nimal_sanderatne',
        predicate: 'chaired',
        object: 'inst:boc_lk',
        valid_from: '1987-01-01',
        valid_to: '1992-12-31',
        documented_at: '1993-01-01',
        citation: 'Bank of Ceylon Golden Jubilee and Governance Records'
    },
    {
        connection_id: 'conn:amal_frontier_founder',
        subject: 'person:amal_sanderatne',
        predicate: 'founded_and_led',
        object: 'inst:frontier_research',
        valid_from: '2003-01-01',
        valid_to: '2023-07-23',
        documented_at: '2003-03-01',
        citation: 'Frontier Research Corporate Incorporation & Registry'
    },
    {
        connection_id: 'conn:ayoma_frontier_cofounder',
        subject: 'person:ayoma_sanderatne',
        predicate: 'co_founded_and_directed',
        object: 'inst:frontier_research',
        valid_from: '2003-01-01',
        valid_to: null, // ongoing
        documented_at: '2003-03-01',
        citation: 'Frontier Research Board of Directors'
    },
    {
        connection_id: 'conn:moe_nie_curriculum_mandate',
        subject: 'inst:nie_lk',
        predicate: 'mandated_curriculum_authority_for',
        object: 'inst:moe_lk',
        valid_from: '1985-01-01',
        valid_to: null, // ongoing
        documented_at: '1985-12-15',
        citation: 'National Institute of Education Act No. 28 of 1985'
    },
    {
        connection_id: 'conn:moe_doenets_exam_authority',
        subject: 'inst:doenets_lk',
        predicate: 'conducts_national_examinations_for',
        object: 'inst:moe_lk',
        valid_from: '1951-01-01',
        valid_to: null, // ongoing
        documented_at: '1951-10-01',
        citation: 'Public Examinations Act of Sri Lanka'
    }
];

const insertConnStmt = db.prepare(`
INSERT INTO temporal_connections (connection_id, subject_entity_id, predicate, object_entity_id, valid_from, valid_to, documented_at, source_citation)
VALUES (?, ?, ?, ?, ?, ?, ?, ?)
ON CONFLICT(connection_id) DO UPDATE SET
    predicate = excluded.predicate,
    valid_from = excluded.valid_from,
    valid_to = excluded.valid_to,
    documented_at = excluded.documented_at,
    source_citation = excluded.source_citation;
`);

for (const conn of sampleConnections) {
    insertConnStmt.run(
        conn.connection_id,
        conn.subject,
        conn.predicate,
        conn.object,
        conn.valid_from,
        conn.valid_to,
        conn.documented_at,
        conn.citation
    );
}
console.log(`[TEMPORAL MESH] Seeded ${sampleConnections.length} temporal relationship edges.`);

// Print database status summary
const entCount = db.prepare(`SELECT COUNT(*) as count FROM entities`).get().count;
const connCount = db.prepare(`SELECT COUNT(*) as count FROM temporal_connections`).get().count;
console.log(`[STATUS] Total Entities: ${entCount} | Total Temporal Connections: ${connCount}`);
