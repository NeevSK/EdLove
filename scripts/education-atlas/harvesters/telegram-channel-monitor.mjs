import { fileURLToPath } from 'node:url';
import { getAtlasDb, closeAtlasDb } from '../db.mjs';

const CHANNELS = [
  { username: 'pastpaperswiki', name: 'Past Papers WiKi Telegram Hub' },
  { username: 'alapiedu', name: 'A/L Api Examination Resources Hub' },
  { username: 'apepanthiyalk', name: 'Ape Panthiya Exam & Notes Hub' },
  { username: 'applicationslk', name: 'Applications.lk Official Gazette & Circulars' },
  { username: 'governmentjobslk', name: 'Government Jobs LK Vacancy Channel' },
  { username: 'gazettelk', name: 'Gazette.lk Official Gazette Alerts' },
  { username: 'sinhalagazette', name: 'Sinhala Gazette & Public Notices' },
  { username: 'cmwithmn_26MR', name: 'Combined Mathematics Academic Community' }
];

function cleanHtmlText(html) {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .trim();
}

function detectExamLevel(text) {
  if (/A\/L|Advanced Level|උසස් පෙළ|உயர்தரம்/i.test(text)) return 'GCE A/L';
  if (/O\/L|Ordinary Level|සාමාන්‍ය පෙළ|சாதாரண தரம்/i.test(text)) return 'GCE O/L';
  if (/Grade 5|Scholarship|ශිෂ්‍යත්ව|புலமைப்பரிசில்/i.test(text)) return 'Grade 5 Scholarship';
  if (/Term Test|වාර විභාග|பரீட்சை/i.test(text)) return 'Term Test';
  return 'General';
}

function detectResourceType(text) {
  if (/Marking Scheme|ලකුණු දීමේ පටිපාටිය|புள்ளித் திட்டம்/i.test(text)) return 'marking_scheme';
  if (/Model Paper|ආදර්ශ ප්‍රශ්න පත්‍ර|மாதிரித்தாள்/i.test(text)) return 'model_paper';
  if (/Past Paper|ප්‍රශ්න පත්‍ර|கடந்தகால வினாத்தாள்/i.test(text)) return 'past_paper';
  if (/Syllabus|නිර්දේශය|பாடத்திட்டம்/i.test(text)) return 'syllabus';
  if (/Teacher Guide|ගුරු මාර්ගෝපදේශය|ஆசிரியர் வழிகாட்டி/i.test(text)) return 'curriculum_doc';
  return 'exam_resource';
}

function detectMedium(text) {
  const hasSinhala = /[\u0D80-\u0DFF]/.test(text) || /සිංහල මාධ්‍ය/i.test(text);
  const hasTamil = /[\u0B80-\u0BFF]/.test(text) || /தமிழ் மொழி/i.test(text);
  const hasEnglish = /English Medium/i.test(text);

  if (hasSinhala && hasTamil) return 'trilingual';
  if (hasSinhala) return 'sinhala';
  if (hasTamil) return 'tamil';
  if (hasEnglish) return 'english';
  return 'unknown';
}

function extractUrls(text) {
  const matches = text.match(/https?:\/\/[^\s<>"')]+/g);
  return matches ? [...new Set(matches)] : [];
}

export async function harvestTelegramChannel(channelInfo) {
  const { username, name } = channelInfo;
  console.log(`[Telegram] Harvesting channel: @${username}...`);

  const url = `https://t.me/s/${username}`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) PolymathEducationIndexer/1.0' }
  });

  if (!res.ok) {
    console.warn(`[Telegram] Channel @${username} returned status ${res.status}`);
    return 0;
  }

  const html = await res.text();
  const db = getAtlasDb();

  // Ensure source entry exists
  db.prepare(`
    INSERT INTO sources (
      source_id, name, short_name, source_kind, category, authority_level,
      quality_tier, canonical_url, inventory_status, languages, handling_mode,
      rights_baseline, notes
    ) VALUES (
      ?, ?, ?, 'community_channel', 'telegram_hub', 'community',
      'B1', ?, 'verified', '["si","ta","en"]', 'link',
      'public_social_post', 'High-volume community past paper and circular distribution channel.'
    )
    ON CONFLICT(source_id) DO NOTHING;
  `).run(`LK-SOURCE-TG-${username.toUpperCase()}`, name, `@${username}`, url);

  // Extract individual message blocks with regex
  const msgBlockRegex = /<div class="tgme_widget_message\s[^"]*"[^>]*data-post="([^"]+)"[^>]*>([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/g;
  let match;
  let count = 0;

  const insertRes = db.prepare(`
    INSERT INTO resources (
      resource_id, source_id, title, summary, resource_type, content_format,
      canonical_url, download_url, publication_date, exam_level, medium,
      roles, education_stages, domains, ingested_via
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
    )
    ON CONFLICT(resource_id) DO UPDATE SET
      title=excluded.title,
      summary=excluded.summary,
      updated_at=CURRENT_TIMESTAMP;
  `);

  while ((match = msgBlockRegex.exec(html)) !== null) {
    const postSlug = match[1]; // e.g. "pastpaperswiki/495"
    const content = match[2];

    // Extract text
    const textMatch = content.match(/<div class="tgme_widget_message_text[^"]*"[^>]*>([\s\S]*?)<\/div>/);
    if (!textMatch) continue;

    const rawText = textMatch[1];
    const cleanText = cleanHtmlText(rawText);
    if (!cleanText || cleanText.length < 15) continue;

    // Extract timestamp
    const timeMatch = content.match(/<time datetime="([^"]+)"/);
    const postDate = timeMatch ? timeMatch[1].slice(0, 10) : new Date().toISOString().slice(0, 10);

    const examLevel = detectExamLevel(cleanText);
    const resType = detectResourceType(cleanText);
    const medium = detectMedium(cleanText);
    const urls = extractUrls(cleanText);
    const downloadUrl = urls.find(u => !u.includes('t.me')) || `https://t.me/${postSlug}`;

    // Extract first line as title
    const firstLine = cleanText.split('\n')[0].replace(/[📚👉]/g, '').trim().slice(0, 150);
    const resourceId = `LK-TG-${postSlug.replace('/', '-')}`;

    insertRes.run(
      resourceId,
      `LK-SOURCE-TG-${username.toUpperCase()}`,
      firstLine,
      cleanText.slice(0, 500),
      resType,
      'pdf_web_link',
      `https://t.me/${postSlug}`,
      downloadUrl,
      postDate,
      examLevel,
      medium,
      JSON.stringify(['student', 'teacher']),
      JSON.stringify(['secondary', 'senior_secondary']),
      JSON.stringify(['curriculum_and_teaching', 'assessment']),
      'telegram_monitor'
    );
    count++;
  }

  console.log(`[Telegram] Channel @${username}: Ingested ${count} verified records.`);
  return count;
}

export async function runTelegramHarvest() {
  console.log(`--- Running Telegram Educational Community Monitor ---`);
  let total = 0;
  for (const ch of CHANNELS) {
    total += await harvestTelegramChannel(ch);
  }
  console.log(`✓ Telegram Harvest Complete. Total records ingested: ${total}`);

  const db = getAtlasDb();
  const tgCount = db.prepare("SELECT count(*) as cnt FROM resources WHERE ingested_via = 'telegram_monitor';").get();
  console.log(`Total Telegram Records in Database: ${tgCount.cnt}`);

  closeAtlasDb();
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  runTelegramHarvest().catch(console.error);
}
