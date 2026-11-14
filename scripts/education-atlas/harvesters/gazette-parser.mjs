import { fileURLToPath } from 'node:url';
import { getAtlasDb, closeAtlasDb } from '../db.mjs';

const GAZETTE_BASE = 'http://documents.gov.lk';

async function fetchGazetteDates() {
  console.log(`[Gazette] Fetching available gazette dates from ${GAZETTE_BASE}/web/gazettes...`);
  const res = await fetch(`${GAZETTE_BASE}/web/gazettes`, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) PolymathEducationIndexer/1.0' }
  });
  if (!res.ok) throw new Error(`HTTP error ${res.status} fetching gazette list`);

  const html = await res.text();
  
  // Match YYYY-MM-DD dates in the HTML payload
  const dateMatches = [...html.matchAll(/(202[0-9]-[0-9]{2}-[0-9]{2})/g)].map(m => m[1]);
  const dates = [...new Set(dateMatches)].sort().reverse();
  
  if (!dates.length) {
    throw new Error('Could not locate any gazette dates in page');
  }

  console.log(`[Gazette] Discovered ${dates.length} gazette editions. Latest: ${dates[0]}`);
  return dates;
}

async function fetchGazetteDetails(dateStr) {
  const url = `${GAZETTE_BASE}/web/Gazette?date=${dateStr}`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) PolymathEducationIndexer/1.0' }
  });
  if (!res.ok) {
    console.warn(`[Gazette] Failed to fetch details for ${dateStr}: HTTP ${res.status}`);
    return [];
  }

  const html = await res.text();

  // Find all gazette-content pdf and epub files
  const fileRegex = /(gazette-content\/[^"'\\]+\.(?:pdf|epub))/gi;
  const rawFiles = [...html.matchAll(fileRegex)].map(m => m[1]);
  const uniqueFiles = [...new Set(rawFiles)];

  const entries = [];
  for (const f of uniqueFiles) {
    // Deduce language from file name if present: (S) -> Sinhala, (T) -> Tamil, (E) -> English
    let lang = 'si';
    if (/\(T\)|Tamil/i.test(f)) lang = 'ta';
    else if (/\(E\)|English/i.test(f)) lang = 'en';
    else if (/\(S\)|Sinhala/i.test(f)) lang = 'si';

    // Deduce section: II A or Legal or General
    let section = 'General';
    if (/II\s*A|IIA|Advertising/i.test(f)) section = 'Section II(A) - Vacancies & Exams';
    else if (/Legal/i.test(f)) section = 'Legal Section';
    else if (/Part\s*I/i.test(f)) section = 'Part I - General';

    entries.push({
      uploadedFile: f,
      section,
      language: lang
    });
  }

  return entries;
}

export async function runGazetteHarvest({ maxDates = 5 } = {}) {
  console.log(`--- Running Government Gazette Ingestion Engine (Limit: ${maxDates} dates) ---`);
  const db = getAtlasDb();

  // Ensure Department of Government Printing source exists
  db.prepare(`
    INSERT INTO sources (
      source_id, name, short_name, source_kind, category, authority_level,
      quality_tier, canonical_url, inventory_status, languages, handling_mode,
      rights_baseline, notes
    ) VALUES (
      'LK-SOURCE-DOCUMENTS-GOV',
      'Department of Government Printing Sri Lanka',
      'Gov Printing',
      'official_national',
      'gazette_publisher',
      'canonical',
      'A1',
      'http://documents.gov.lk',
      'verified',
      '["si","ta","en"]',
      'download_candidate',
      'public_gazette',
      'Official statutory publisher of all Sri Lanka Government Gazettes, Vacancies, and Circulars.'
    )
    ON CONFLICT(source_id) DO NOTHING;
  `).run();

  const dates = await fetchGazetteDates();
  const datesToProcess = dates.slice(0, maxDates);

  const insertRes = db.prepare(`
    INSERT INTO resources (
      resource_id, source_id, title, summary, resource_type, content_format,
      canonical_url, download_url, gazette_date, publication_date, medium,
      roles, education_stages, domains, ingested_via
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
    )
    ON CONFLICT(resource_id) DO UPDATE SET
      download_url=excluded.download_url,
      updated_at=CURRENT_TIMESTAMP;
  `);

  let totalHarvested = 0;

  for (const date of datesToProcess) {
    console.log(`[Gazette] Harvesting edition: ${date}...`);
    const entries = await fetchGazetteDetails(date);
    console.log(`  Found ${entries.length} gazette files for ${date}`);

    for (const item of entries) {
      const fileName = item.uploadedFile;
      const lang = (item.language || 'UNKNOWN').toLowerCase();
      const section = item.section || 'General';

      // Determine resource type: Section IIA is specifically Vacancies & Exams (Job Notices)
      const isVacancies = section.includes('IIA') || section.includes('II A') || section.includes('ADVERTISING');
      const resourceType = isVacancies ? 'job_notice' : 'circular';

      const downloadUrl = `${GAZETTE_BASE}/api/content-file-proxy?file=${encodeURIComponent(fileName)}`;
      const resourceId = `LK-GAZETTE-${date}-${encodeURIComponent(fileName).slice(-30)}`;

      const title = `Sri Lanka Gazette ${date} — ${section} (${item.language})`;
      const summary = isVacancies
        ? `Official public service vacancies, teacher recruitment notices, and promotional examinations published in Sri Lanka Gazette on ${date}.`
        : `Official government proclamations, orders, and administrative circulars published in Sri Lanka Gazette on ${date}.`;

      insertRes.run(
        resourceId,
        'LK-SOURCE-DOCUMENTS-GOV',
        title,
        summary,
        resourceType,
        'pdf',
        `${GAZETTE_BASE}/web/Gazette?date=${date}`,
        downloadUrl,
        date,
        date,
        lang,
        JSON.stringify(['teacher', 'principal', 'public_servant']),
        JSON.stringify(['primary', 'junior_secondary', 'senior_secondary', 'tertiary']),
        JSON.stringify(['policy_and_governance', 'school_leadership']),
        'gazette_harvester'
      );
      totalHarvested++;
    }
  }

  console.log(`✓ Gazette Harvest Complete. Newly ingested / refreshed records: ${totalHarvested}`);

  const gazetteCount = db.prepare("SELECT count(*) as cnt FROM resources WHERE ingested_via = 'gazette_harvester';").get();
  console.log(`Total Gazette Records in Database: ${gazetteCount.cnt}`);

  closeAtlasDb();
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  runGazetteHarvest({ maxDates: 10 }).catch(console.error);
}
