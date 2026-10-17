import { fileURLToPath } from 'node:url';
import { getAtlasDb, closeAtlasDb } from '../db.mjs';

const NEWS_SUMMARY_URL = 'https://raw.githubusercontent.com/nuuuwan/news_lk3_data/main/summary.tsv';

const EDU_CIVIC_REGEX = /education|school|teacher|exam|university|ugc|nie|doenets|scholarship|curriculum|syllabus|principals|al\s*exam|ol\s*exam|campus|degree|undergraduate|ncoe|vidya peeta|tvec|nvq|vocational|cabinet|gazette|circular|parliament|supreme court|court of appeal|central bank|cbsl|treasury|imf|budget|strike|salary|allowance|poverty|aswesuma|samurdhi|verite|ips|cepa|lirneasia|advocata|census|public service|psc|health|hospital|doctor|nurse|අධ්‍යාපන|විභාග|ගුරු|පාසල්|ශිෂ්‍යත්ව|විශ්වවිද්‍යාල|කැබිනට්|ගැසට්|චක්‍රලේඛ|පාර්ලිමේන්තු|ශ්‍රේෂ්ඨාධිකරණ|මහ බැංකු|වැටුප්|වර්ජන|අස්වැසුම|සමෘද්ධි|රාජ්‍ය සේවා|සෞඛ්‍ය|රෝහල්|கல்වි|பரீட்சை|ஆசிரியர்|பாடசாலை|பல்கலைக்கழக|அமைச்சு|வர்த்தமானி|சுற்றறிக்கை|பாராளுமன்ற|மத்திய வங்கி|சம்பள|வேலைநிறுத்தம்|அஸ்வெசும|சமுர்த்தி|அரச சேவை|சுகாதார/i;

export async function runNuuuwanIngestion({ limit = 15000 } = {}) {
  console.log('📰 --- Running Nuwan Senaratna (nuuuwan) News & Civic Ingestion Adapter ---');
  console.log(`Streaming Sri Lankan news summary dataset from ${NEWS_SUMMARY_URL}...`);

  const res = await fetch(NEWS_SUMMARY_URL, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) EducationAtlasIndexer/1.0' }
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch nuuuwan news summary: HTTP ${res.status}`);
  }

  const tsvText = await res.text();
  const lines = tsvText.trim().split('\n');
  console.log(`[nuuuwan] Total news articles in dataset: ${lines.length - 1}`);

  const db = getAtlasDb();

  // Register Nuwan Senaratna open news archive in sources registry
  db.prepare(`
    INSERT INTO sources (
      source_id, name, short_name, source_kind, category, authority_level,
      quality_tier, canonical_url, inventory_status, languages, handling_mode,
      rights_baseline, notes
    ) VALUES (
      'LK-SOURCE-NUUUWAN-NEWS',
      'Sri Lanka News Archive (Nuwan Senaratna / nuuuwan)',
      'nuuuwan news',
      'independent_public_source',
      'open_news_archive',
      'curated',
      'A1',
      'https://github.com/nuuuwan/lk_news',
      'verified',
      '["si","ta","en"]',
      'link',
      'public_news_fair_use',
      'Automated trilingual Sri Lankan newspaper archive (Daily Mirror, Ada Derana, Virakesari, Dinamina, Daily FT) curated by Nuwan Senaratna.'
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
  // Skip header line
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!EDU_CIVIC_REGEX.test(line)) continue;

    const parts = line.split('\t');
    if (parts.length < 8) continue;

    const [newspaperId, timeStr, originalTitle, nBodyLines, hash, timeUt, originalLang, url] = parts;
    const resourceId = `LK-NEWS-${newspaperId}-${hash}`;
    const date = timeStr ? timeStr.slice(0, 10) : null;
    
    // Map lang
    let lang = 'english';
    if (originalLang === 'si') lang = 'sinhala';
    else if (originalLang === 'ta') lang = 'tamil';

    const summary = `Sri Lankan educational and civic report from ${newspaperId} published on ${timeStr}.`;

    insertRes.run(
      resourceId,
      'LK-SOURCE-NUUUWAN-NEWS',
      originalTitle.slice(0, 200),
      summary,
      'news_report',
      'html_article',
      url,
      url,
      date,
      lang,
      JSON.stringify(['public', 'teacher', 'student', 'policy_maker']),
      JSON.stringify(['primary', 'junior_secondary', 'senior_secondary', 'tertiary']),
      JSON.stringify(['policy_and_governance', 'curriculum_and_teaching']),
      'nuuuwan_adapter'
    );

    count++;
    if (count >= limit) break;
  }

  console.log(`✅ Nuwan Senaratna Ingestion Complete. Ingested ${count} civic & education news articles.`);

  const nuuuwanCount = db.prepare("SELECT count(*) as cnt FROM resources WHERE ingested_via = 'nuuuwan_adapter';").get();
  console.log(`📊 Total Nuwan Senaratna Records in Database: ${nuuuwanCount.cnt}`);

  closeAtlasDb();
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  runNuuuwanIngestion().catch(console.error);
}
