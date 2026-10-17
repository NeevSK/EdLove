// scripts/education-atlas/temporal-query-engine.mjs
// Poly-temporal Query Engine for Sri Lanka Civic & Education Atlas

import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, '../../data/education-atlas/atlas_staging.db');

export class TemporalAtlasEngine {
    constructor(databasePath = dbPath) {
        this.db = new DatabaseSync(databasePath);
    }

    /**
     * 1. AS-OF QUERY: Retrieve the state of leadership/affiliations on a specific target date
     * @param {string} targetDate - ISO8601 string e.g. '1989-06-15'
     */
    queryAsOf(targetDate) {
        const stmt = this.db.prepare(`
            SELECT 
                sub.canonical_name as subject_name,
                r.predicate,
                obj.canonical_name as object_name,
                r.valid_from,
                r.valid_to,
                r.documented_at,
                r.source_citation
            FROM temporal_connections r
            JOIN entities sub ON r.subject_entity_id = sub.entity_id
            JOIN entities obj ON r.object_entity_id = obj.entity_id
            WHERE r.valid_from <= ? 
              AND (r.valid_to IS NULL OR r.valid_to >= ?)
            ORDER BY r.valid_from ASC;
        `);
        return stmt.all(targetDate, targetDate);
    }

    /**
     * 2. TIMELINE SLICE: Unified multi-temporal slice of both Institutional Events AND Cataloged Evidence (Gazettes/News)
     * @param {string} startDate - ISO8601 string e.g. '2023-01-01'
     * @param {string} endDate - ISO8601 string e.g. '2023-12-31'
     */
    queryTimelineSlice(startDate, endDate) {
        // A. Institutional / Relational Events occurring or active in this window
        const eventsStmt = this.db.prepare(`
            SELECT 
                'institutional_event' as stream_type,
                r.valid_from as event_date,
                sub.canonical_name || ' ' || r.predicate || ' ' || obj.canonical_name as summary,
                r.source_citation as reference,
                r.valid_to as end_date
            FROM temporal_connections r
            JOIN entities sub ON r.subject_entity_id = sub.entity_id
            JOIN entities obj ON r.object_entity_id = obj.entity_id
            WHERE (r.valid_from BETWEEN ? AND ?)
               OR (r.valid_to BETWEEN ? AND ?)
            ORDER BY r.valid_from ASC;
        `);
        const events = eventsStmt.all(startDate, endDate, startDate, endDate);

        // B. Evidentiary Resources (Gazettes, Circulars, News) published in this window
        const resourcesStmt = this.db.prepare(`
            SELECT 
                'evidentiary_resource' as stream_type,
                COALESCE(publication_date, gazette_date) as event_date,
                title as summary,
                canonical_url as reference,
                resource_type as category
            FROM resources
            WHERE (publication_date BETWEEN ? AND ?)
               OR (gazette_date BETWEEN ? AND ?)
            ORDER BY event_date ASC
            LIMIT 20;
        `);
        const resources = resourcesStmt.all(startDate, endDate, startDate, endDate);

        return {
            window: { startDate, endDate },
            institutionalEventsCount: events.length,
            sampleResourcesCount: resources.length,
            events,
            sampleResources: resources
        };
    }

    /**
     * 3. TEMPORAL DENSITY: Group all cataloged records by year to see the historical distribution
     */
    getTemporalDistribution() {
        const stmt = this.db.prepare(`
            SELECT 
                SUBSTR(COALESCE(publication_date, gazette_date), 1, 4) as year,
                COUNT(*) as count
            FROM resources
            WHERE COALESCE(publication_date, gazette_date) IS NOT NULL
            GROUP BY year
            ORDER BY year ASC;
        `);
        return stmt.all();
    }

    /**
     * 4. ENTITY DOSSIER: Full chronological profile of a person or institution
     * @param {string} entityId 
     */
    getEntityChronology(entityId) {
        const entity = this.db.prepare(`SELECT * FROM entities WHERE entity_id = ?`).get(entityId);
        if (!entity) return null;

        const connections = this.db.prepare(`
            SELECT 
                r.connection_id,
                r.predicate,
                CASE 
                    WHEN r.subject_entity_id = ? THEN obj.canonical_name
                    ELSE sub.canonical_name
                END as counterpart,
                CASE 
                    WHEN r.subject_entity_id = ? THEN 'outgoing'
                    ELSE 'incoming'
                END as direction,
                r.valid_from,
                r.valid_to,
                r.source_citation
            FROM temporal_connections r
            JOIN entities sub ON r.subject_entity_id = sub.entity_id
            JOIN entities obj ON r.object_entity_id = obj.entity_id
            WHERE r.subject_entity_id = ? OR r.object_entity_id = ?
            ORDER BY r.valid_from ASC;
        `).all(entityId, entityId, entityId, entityId);

        return {
            entity,
            timeline: connections
        };
    }
}

// Quick CLI execution verification
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    const engine = new TemporalAtlasEngine();

    console.log('\n=== TEST 1: AS-OF QUERY (What held true on 1989-06-15?) ===');
    const asOf1989 = engine.queryAsOf('1989-06-15');
    console.table(asOf1989);

    console.log('\n=== TEST 2: AS-OF QUERY (What held true on 2015-06-15?) ===');
    const asOf2015 = engine.queryAsOf('2015-06-15');
    console.table(asOf2015);

    console.log('\n=== TEST 3: TEMPORAL DISTRIBUTION OF RESOURCES (By Year) ===');
    const dist = engine.getTemporalDistribution();
    console.table(dist);

    console.log('\n=== TEST 4: ENTITY DOSSIER (Dr. Nimal Sanderatne) ===');
    const nimal = engine.getEntityChronology('person:nimal_sanderatne');
    console.log(JSON.stringify(nimal, null, 2));
}
