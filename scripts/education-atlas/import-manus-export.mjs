import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getAtlasDb, closeAtlasDb } from './db.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Default scratch path from archive extraction
const SCRATCH_PATH = 'C:/Users/Naween/.gemini/antigravity/brain/0f5143ea-1041-4053-8695-94a07223cddc/scratch/atlas/sri-lanka-education-atlas';

async function importManusBase() {
  console.log('--- Importing Manus Education Atlas Foundation ---');
  
  if (!existsSync(SCRATCH_PATH)) {
    console.error(`Export directory not found at ${SCRATCH_PATH}`);
    process.exit(1);
  }

  const db = getAtlasDb();

  // 1. Ingest Sources from Bibliography and sources.seed.json
  const bibPath = resolve(SCRATCH_PATH, 'data/research/source-bibliography-100.json');
  const sourcesSeedPath = resolve(SCRATCH_PATH, 'data/sources.seed.json');

  const bibData = JSON.parse(readFileSync(bibPath, 'utf8'));
  const sourcesSeed = existsSync(sourcesSeedPath) ? JSON.parse(readFileSync(sourcesSeedPath, 'utf8')) : [];

  console.log(`Loaded ${bibData.records?.length || 0} bibliography records and ${sourcesSeed.length} source seeds.`);

  const insertSource = db.prepare(`
    INSERT INTO sources (
      source_id, name, short_name, source_kind, category, authority_level,
      quality_tier, canonical_url, inventory_status, languages, handling_mode,
      rights_baseline, last_checked, notes, raw_meta
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
    )
    ON CONFLICT(source_id) DO UPDATE SET
      name=excluded.name,
      canonical_url=excluded.canonical_url,
      inventory_status=excluded.inventory_status,
      updated_at=CURRENT_TIMESTAMP;
  `);

  let sourcesImported = 0;

  // Insert 100 bibliography sources
  for (const b of (bibData.records || [])) {
    insertSource.run(
      b.candidate_id || b.bibliography_id,
      b.name,
      null,
      'candidate_source',
      b.category || 'general',
      b.authority_tier || 'standard',
      b.quality_tier || 'B1',
      b.canonical_url || b.proposed_discovery_route_url || b.source_evidence_url || 'https://unknown.lk',
      b.inventory_status || 'pending',
      JSON.stringify(['si', 'ta', 'en']),
      'link',
      'public_page_link',
      b.last_checked || null,
      b.notes || '',
      JSON.stringify(b)
    );
    sourcesImported++;
  }

  // Insert confirmed sources seed
  for (const s of sourcesSeed) {
    insertSource.run(
      s.source_id,
      s.name,
      s.short_name || null,
      s.source_kind || 'official_national',
      'official_portal',
      s.authority_level || 'official',
      'A1',
      s.canonical_url,
      s.status || 'active',
      JSON.stringify(s.languages_seen || ['en']),
      s.default_handling_mode || 'link',
      s.rights_baseline || 'public_page_link',
      s.last_checked || null,
      s.access_notes || '',
      JSON.stringify(s)
    );
    sourcesImported++;
  }

  console.log(`✓ Sources indexed into SQLite WAL: ${sourcesImported}`);

  // 2. Ingest 2,323 Resource Records
  const resSeedPath = resolve(SCRATCH_PATH, 'data/resources.seed.json');
  if (existsSync(resSeedPath)) {
    const resources = JSON.parse(readFileSync(resSeedPath, 'utf8'));
    console.log(`Ingesting ${resources.length} verified resource records...`);

    const insertRes = db.prepare(`
      INSERT INTO resources (
        resource_id, source_id, title, summary, resource_type, content_format,
        canonical_url, download_url, publication_date, handling_mode,
        rights_status, attribution_text, quality_score, roles,
        education_stages, domains, ingested_via
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      )
      ON CONFLICT(resource_id) DO UPDATE SET
        title=excluded.title,
        summary=excluded.summary,
        canonical_url=excluded.canonical_url,
        updated_at=CURRENT_TIMESTAMP;
    `);

    let resCount = 0;
    for (const r of resources) {
      insertRes.run(
        r.resource_id,
        r.source_id || 'UNKNOWN',
        r.title,
        r.summary || '',
        r.resource_type || 'document',
        Array.isArray(r.content_format) ? r.content_format.join(',') : (r.content_format || 'html'),
        r.canonical_url,
        r.canonical_url,
        r.publication_date || null,
        r.handling_mode || 'link',
        r.rights_status || 'public_page_link',
        r.attribution_text || '',
        r.quality?.metadata_completeness || 70,
        JSON.stringify(r.roles || []),
        JSON.stringify(r.education_stages || []),
        JSON.stringify(r.domains || []),
        'manus_export'
      );
      resCount++;
    }
    console.log(`✓ Resources indexed into SQLite WAL: ${resCount}`);
  }

  // 3. Verify counts & FTS search
  const totalSources = db.prepare('SELECT count(*) as cnt FROM sources;').get();
  const totalResources = db.prepare('SELECT count(*) as cnt FROM resources;').get();
  const totalFts = db.prepare('SELECT count(*) as cnt FROM resources_fts;').get();

  console.log('----------------------------------------------------');
  console.log(`Database verification:`);
  console.log(`- Total Unique Sources: ${totalSources.cnt}`);
  console.log(`- Total Cataloged Resources: ${totalResources.cnt}`);
  console.log(`- FTS5 Indexed Records: ${totalFts.cnt}`);
  console.log('----------------------------------------------------');

  closeAtlasDb();
}

importManusBase().catch(err => {
  console.error('Fatal error during import:', err);
  process.exit(1);
});
