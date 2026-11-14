// scripts/education-atlas/adapters/cabinet-adapter.mjs
// Ingestion Adapter for Sri Lanka Cabinet Decisions (Cabinet Office / nuuuwan dataset)

import { fileURLToPath } from 'node:url';
import { getAtlasDb, closeAtlasDb } from '../db.mjs';

const CABINET_TSV_URL = 'https://raw.githubusercontent.com/nuuuwan/lk_cabinet_decisions/data/data/lk_cabinet_decisions/docs_last10000.tsv';

const EDU_CIVIC_REGEX = /education|school|teacher|exam|university|ugc|nie|scholarship|curriculum|syllabus|principal|al\s*exam|ol\s*exam|degree|student|academic|vidya peeta|ncoe|tvec|nvq|vocational|child|nutrition|school meal|textbook|edupub|අධ්‍යාපන|විභාග|ගුරු|පාසල්|ශිෂ්‍යත්ව|විශ්වවිද්‍යාල|පෙළපොත්|විද්‍යාපීඨ|ළමා|පෝෂණ|கல்வி|பரீட்சை|ஆசிரியர்|பாடசாலை|பல்கலைக்கழக|பாடநூல்/i;

export async function runCabinetIngestion({ limit = 5000 } = {}) {
  console.log('🏛️  --- Running Sri Lanka Cabinet Decisions Ingestion Adapter ---');
  console.log(`Streaming official Cabinet Decisions from ${CABINET_TSV_URL}...`);

  const res = await fetch(CABINET_TSV_URL, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) EducationAtlasIndexer/1.0' }
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch cabinet decisions dataset: HTTP ${res.status}`);
  }

  const tsvText = await res.text();
  const lines = tsvText.trim().split('\n');
  console.log(`[Cabinet Office] Total decision records in stream: ${lines.length - 1}`);

  const db = getAtlasDb();

  // Register Cabinet Office in sources registry
  db.prepare(`
    INSERT INTO sources (
      source_id, name, short_name, source_kind, category, authority_level,
      quality_tier, canonical_url, inventory_status, languages, handling_mode,
      rights_baseline, notes
    ) VALUES (
      'LK-SOURCE-CABINET-OFFICE',
      'Sri Lanka Cabinet Decisions Archive (Cabinet Office)',
      'Cabinet Office',
      'state_portal',
      'cabinet_decisions',
      'official',
      'A1',
      'https://www.cabinetoffice.gov.lk',
      'verified',
      '["si","ta","en"]',
      'link',
      'crown_copyright_public_domain',
      'Official decisions and policy determinations of the Cabinet of Ministers of Sri Lanka, indexed via nuuuwan open archive.'
    )
    ON CONFLICT(source_id) DO UPDATE SET
      notes=excluded.notes,
      updated_at=CURRENT_TIMESTAMP;
  `).run();

  const insertRes = db.prepare(`
    INSERT INTO resources (
      resource_id, source_id, title, summary, resource_type, content_format,
      canonical_url, download_url, publication_date, medium,
      roles, education_stages, domains, ingested_via
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
    )
    ON CONFLICT(resource_id) DO UPDATE SET
      title=excluded.title,
      summary=excluded.summary,
      publication_date=excluded.publication_date,
      updated_at=CURRENT_TIMESTAMP;
  `);

  let count = 0;
  // Format: doc_type, doc_id, num, date_str, description, url_metadata, lang, decision_details_title, decision_details_body
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!EDU_CIVIC_REGEX.test(line)) continue;

    const parts = line.split('\t');
    if (parts.length < 7) continue;

    const [docType, docId, num, dateStr, description, urlMetadata, lang, detailsTitle, detailsBody] = parts;
    const resourceId = `LK-CABINET-${docId}`;
    const date = dateStr ? dateStr.trim() : null;

    let language = 'english';
    if (lang === 'si') language = 'sinhala';
    else if (lang === 'ta') language = 'tamil';

    // Compose rich summary
    let summaryText = description || '';
    if (detailsBody && detailsBody.trim()) {
      summaryText = `${summaryText} — ${detailsBody.trim()}`.slice(0, 1000);
    }

    insertRes.run(
      resourceId,
      'LK-SOURCE-CABINET-OFFICE',
      (description || 'Cabinet Decision').slice(0, 300),
      summaryText,
      'cabinet_decision',
      'html_article',
      urlMetadata || 'https://www.cabinetoffice.gov.lk',
      urlMetadata || 'https://www.cabinetoffice.gov.lk',
      date,
      language,
      JSON.stringify(['policy_maker', 'public', 'teacher', 'student']),
      JSON.stringify(['primary', 'junior_secondary', 'senior_secondary', 'tertiary']),
      JSON.stringify(['policy_and_governance', 'curriculum_and_teaching', 'finance_and_procurement']),
      'cabinet_adapter'
    );

    count++;
    if (count >= limit) break;
  }

  console.log(`✅ Cabinet Ingestion Complete. Ingested ${count} educational & institutional Cabinet Decisions.`);

  const cabCount = db.prepare("SELECT count(*) as cnt FROM resources WHERE ingested_via = 'cabinet_adapter';").get();
  console.log(`📊 Total Cabinet Records in Database: ${cabCount.cnt}`);

  closeAtlasDb();
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  runCabinetIngestion().catch(console.error);
}
