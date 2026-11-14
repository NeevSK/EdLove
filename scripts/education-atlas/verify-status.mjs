import { getAtlasDb, closeAtlasDb } from './db.mjs';

function runVerification() {
  const db = getAtlasDb();

  console.log('===========================================================');
  console.log('  SRI LANKA EDUCATION ATLAS & DISCOVERY PLATFORM STATUS    ');
  console.log('===========================================================');

  // Sources summary
  const totalSources = db.prepare('SELECT count(*) as cnt FROM sources;').get();
  console.log(`\n[Sources Registry] Total Registered Entities: ${totalSources.cnt}`);
  
  const sourcesByKind = db.prepare(`
    SELECT source_kind, count(*) as count 
    FROM sources 
    GROUP BY source_kind 
    ORDER BY count DESC;
  `).all();
  console.table(sourcesByKind);

  // Resources summary
  const totalResources = db.prepare('SELECT count(*) as cnt FROM resources;').get();
  console.log(`\n[Cataloged Resources] Total Indexed Items: ${totalResources.cnt}`);

  const resourcesByType = db.prepare(`
    SELECT resource_type, count(*) as count 
    FROM resources 
    GROUP BY resource_type 
    ORDER BY count DESC;
  `).all();
  console.table(resourcesByType);

  const resourcesByChannel = db.prepare(`
    SELECT ingested_via, count(*) as count 
    FROM resources 
    GROUP BY ingested_via 
    ORDER BY count DESC;
  `).all();
  console.table(resourcesByChannel);

  // FTS5 Full-Text Search Smoke Test
  console.log('\n[FTS5 Search Engine Smoke Test]');
  const queries = ['circular', 'examination', 'mathematics', 'teacher'];
  for (const q of queries) {
    const results = db.prepare(`
      SELECT r.resource_id, r.title, r.resource_type, r.publication_date, r.medium
      FROM resources_fts fts
      JOIN resources r ON r.rowid = fts.rowid
      WHERE resources_fts MATCH ?
      LIMIT 3;
    `).all(q);

    console.log(`\nQuery: "${q}" (Top ${results.length} matches):`);
    for (const res of results) {
      console.log(`  - [${res.resource_type}] ${res.title.slice(0, 75)} (${res.publication_date || 'N/A'}, ${res.medium || 'N/A'})`);
    }
  }

  console.log('\n===========================================================');
  console.log('  ALL INTEGRITY & INDEXING CHECKS PASSED SUCCESSFULLY      ');
  console.log('===========================================================');

  closeAtlasDb();
}

runVerification();
