/**
 * scripts/education-atlas/importers/import-school-contacts.mjs
 *
 * Ingests 10,923 school contact records across 22 SQL batch files in C:\projects\packages\lk-edu-geo\data\seeds.
 * Applies privacy classification:
 *  - Landlines (011, 081, 052, etc.) -> channel='phone_landline', privacy_scope='public'
 *  - Mobiles (070, 071, 072, 074, 075, 076, 077, 078) -> channel='phone_mobile', privacy_scope='role_desk'
 *  - Emails -> channel='email', privacy_scope='public'
 */

import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';

const DB_PATH = path.resolve('data/education-atlas/atlas_staging.db');
const SEEDS_DIR = 'C:/projects/packages/lk-edu-geo/data/seeds';

function isMobile(phone) {
  const clean = phone.replace(/[^0-9]/g, '');
  return clean.startsWith('07') || clean.startsWith('947') || clean.startsWith('+947');
}

function normalizePhone(phone) {
  let clean = phone.replace(/[^0-9+]/g, '').trim();
  if (clean.startsWith('94') && !clean.startsWith('+')) clean = '+' + clean;
  return clean;
}

function run() {
  console.log('📞 [CONTACT SANITIZER] Ingesting School Contacts from 22 SQL Batches...');

  if (!fs.existsSync(DB_PATH)) {
    throw new Error(`Database not found at ${DB_PATH}`);
  }
  if (!fs.existsSync(SEEDS_DIR)) {
    throw new Error(`Seeds directory not found at ${SEEDS_DIR}`);
  }

  const db = new DatabaseSync(DB_PATH);
  db.exec('PRAGMA foreign_keys = OFF;'); // Speed up batch insert
  db.exec('PRAGMA journal_mode = WAL;');

  // Ensure contact_points schema matching migration 004
  db.exec(`
    CREATE TABLE IF NOT EXISTS contact_points (
      contact_id TEXT PRIMARY KEY,
      owner_scope TEXT NOT NULL,
      owner_id TEXT NOT NULL,
      contact_type TEXT NOT NULL,
      contact_value TEXT NOT NULL,
      purpose TEXT DEFAULT 'general',
      privacy_tier TEXT NOT NULL,
      is_primary BOOLEAN DEFAULT 0,
      verified_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_cp_owner ON contact_points(owner_scope, owner_id);
  `);

  const files = fs.readdirSync(SEEDS_DIR).filter(f => f.startsWith('06_edu_school_contacts')).sort();
  console.log(`📂 Found ${files.length} contact SQL batch files.`);

  const insertContactStmt = db.prepare(`
    INSERT OR REPLACE INTO contact_points 
    (contact_id, owner_scope, owner_id, contact_type, contact_value, purpose, privacy_tier, is_primary)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  let totalParsed = 0;
  let landlinesInserted = 0;
  let mobilesInserted = 0;
  let emailsInserted = 0;

  db.exec('BEGIN TRANSACTION;');
  try {
    for (const file of files) {
      const content = fs.readFileSync(path.join(SEEDS_DIR, file), 'utf8');
      // Regex matching: ('SCH_0611016', 'OFFICIAL', '0718286822', 'laxapanatv@gmail.com', true)
      const regex = /\('(SCH_[0-9A-Za-z]+)',\s*'([^']*)',\s*'([^']*)',\s*'([^']*)',\s*(true|false)\)/g;
      const matches = content.matchAll(regex);

      for (const m of matches) {
        totalParsed++;
        const schoolId = m[1]; // e.g. SCH_0611016
        const censusNo = schoolId.replace('SCH_', '');
        const phone = (m[3] || '').trim();
        const email = (m[4] || '').trim().toLowerCase();

        // 1. Process Phone
        if (phone && phone !== '-' && phone.length >= 7) {
          const normPhone = normalizePhone(phone);
          const mobile = isMobile(normPhone);

          const phoneId = `cp_phone_${censusNo}_${mobile ? 'mob' : 'land'}`;
          insertContactStmt.run(
            phoneId,
            'entity',
            censusNo,
            mobile ? 'phone_mobile' : 'phone_landline',
            normPhone,
            mobile ? 'principal_desk' : 'general',
            mobile ? 'administrative_restricted' : 'public',
            1
          );

          if (mobile) mobilesInserted++;
          else landlinesInserted++;
        }

        // 2. Process Email
        if (email && email !== '-' && email.includes('@')) {
          const emailId = `cp_email_${censusNo}`;
          insertContactStmt.run(
            emailId,
            'entity',
            censusNo,
            'email',
            email,
            'general',
            'public',
            1
          );
          emailsInserted++;
        }
      }
    }
    db.exec('COMMIT;');
  } catch (err) {
    db.exec('ROLLBACK;');
    throw err;
  }

  console.log(`\n🎉 School Contacts Successfully Ingested:`);
  console.log(`   - Total Schools Processed: ${totalParsed}`);
  console.log(`   - Landlines Ingested (Public School Office): ${landlinesInserted}`);
  console.log(`   - Mobile Phones Ingested (Role Desk Scoped): ${mobilesInserted}`);
  console.log(`   - Official Emails Ingested: ${emailsInserted}`);
  console.log(`   - Total Contact Points in DB: ${landlinesInserted + mobilesInserted + emailsInserted}`);

  // Query sample
  const sample = db.prepare(`
    SELECT owner_id, contact_type, contact_value, purpose, privacy_tier 
    FROM contact_points 
    LIMIT 6
  `).all();
  console.log('\n🔎 Sample Ingested Contacts:');
  console.log(JSON.stringify(sample, null, 2));
}

run();
