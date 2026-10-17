import { fileURLToPath } from 'node:url';
import { getAtlasDb, closeAtlasDb } from '../db.mjs';

const LDF_METADATA_URL = 'https://raw.githubusercontent.com/LDFLK/gztarchiver-storage/main/metadata/global_metadata.json';

const EDU_KEYWORDS = [
  'education', 'school', 'teacher', 'examination', 'university',
  'curriculum', 'syllabus', 'scholarship', 'academic', 'college',
  'vidyalaya', 'pirivena', 'ugc', 'nie', 'tvec', 'sliate', 'admission',
  'efficiency bar', 'slts', 'sleas', 'slps', 'training college'
];

function isEducationRelevant(text) {
  if (!text) return false;
  const lower = text.toLowerCase();
  return EDU_KEYWORDS.some(kw => lower.includes(kw));
}

export async function runLdfIngestion({ limit = 1500 } = {}) {
  console.log('--- Running Lanka Data Foundation (LDF) Ingestion Adapter ---');
  console.log(`Fetching LDF Gazette Archive Metadata from ${LDF_METADATA_URL}...`);

  const res = await fetch(LDF_METADATA_URL, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) EducationAtlasIndexer/1.0' }
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch LDF metadata: HTTP ${res.status}`);
  }

  const rawData = await res.json();
  const allRecords = Object.values(rawData);
  console.log(`[LDF] Total records in LDF Archive: ${allRecords.length}`);

  const db = getAtlasDb();

  // Register Lanka Data Foundation as an authoritative source in the registry
  db.prepare(`
    INSERT INTO sources (
      source_id, name, short_name, source_kind, category, authority_level,
      quality_tier, canonical_url, inventory_status, languages, handling_mode,
      rights_baseline, notes
    ) VALUES (
      'LK-SOURCE-LDF-ARCHIVE',
      'Lanka Data Foundation Gazette & Civic Archive',
      'LDF LK',
      'independent_public_source',
      'open_data_initiative',
      'curated',
      'A1',
      'https://github.com/LDFLK/gztarchiver-storage',
      'verified',
      '["si","ta","en"]',
      'download_candidate',
      'open_government_data',
      'Automated Civic Archive of Sri Lankan Government Gazettes and Public Records from 2015 to Present by Lanka Data Foundation.'
    )
    ON CONFLICT(source_id) DO UPDATE SET
      notes=excluded.notes,
      updated_at=CURRENT_TIMESTAMP;
  `).run();

  const insertRes = db.prepare(`
    INSERT INTO resources (
      resource_id, source_id, title, summary, resource_type, content_format,
      canonical_url, download_url, gazette_date, publication_date, medium,
      roles, education_stages, domains, ingested_via
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
    )
    ON CONFLICT(resource_id) DO UPDATE SET
      title=excluded.title,
      summary=excluded.summary,
      updated_at=CURRENT_TIMESTAMP;
  `);

  let ingestedCount = 0;

  for (const doc of allRecords) {
    const fullText = `${doc.description || ''} ${doc.categorisation || ''}`;
    if (!isEducationRelevant(fullText)) continue;

    const resourceId = `LK-LDF-${(doc.document_id || '').replace(/[\/\s]/g, '-')}`;
    const title = doc.description ? doc.description.slice(0, 200) : `Gazette ${doc.document_id}`;
    const summary = doc.categorisation ? doc.categorisation.slice(0, 600) : '';
    const date = doc.document_date || null;
    const downloadUrl = doc.source || `https://documents.gov.lk/view/extra-gazettes/${doc.document_id}.pdf`;

    // Deduce language
    let medium = 'english';
    if (doc.file_path?.includes('sinhala')) medium = 'sinhala';
    else if (doc.file_path?.includes('tamil')) medium = 'tamil';

    insertRes.run(
      resourceId,
      'LK-SOURCE-LDF-ARCHIVE',
      title,
      summary,
      'circular',
      'pdf',
      downloadUrl,
      downloadUrl,
      date,
      date,
      medium,
      JSON.stringify(['teacher', 'principal', 'student', 'policy_maker']),
      JSON.stringify(['primary', 'junior_secondary', 'senior_secondary', 'tertiary']),
      JSON.stringify(['policy_and_governance', 'curriculum_and_teaching']),
      'ldf_adapter'
    );

    ingestedCount++;
    if (ingestedCount >= limit) break;
  }

  console.log(`✓ LDF Ingestion Complete. Ingested ${ingestedCount} education and governance records.`);

  const ldfCount = db.prepare("SELECT count(*) as cnt FROM resources WHERE ingested_via = 'ldf_adapter';").get();
  console.log(`Total LDF Records in Database: ${ldfCount.cnt}`);

  closeAtlasDb();
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  runLdfIngestion().catch(console.error);
}
