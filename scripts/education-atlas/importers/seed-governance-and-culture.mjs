/**
 * scripts/education-atlas/importers/seed-governance-and-culture.mjs
 *
 * Seeds authentic historical & contemporary Educational Leadership (people & role_occupancies)
 * and foundational Student Co-Curricular Culture (school_sub_entities) across iconic Sri Lankan schools.
 */

import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';

const DB_PATH = path.resolve('data/education-atlas/atlas_staging.db');

function run() {
  console.log('🏛️ [GOVERNANCE & CULTURE SEEDER] Seeding Leadership Tenures and Student Societies...');

  const db = new DatabaseSync(DB_PATH);
  db.exec('PRAGMA foreign_keys = OFF;'); // Allow seeding
  db.exec('PRAGMA journal_mode = WAL;');

  // 1. PEOPLE (Educational Leaders, Philosophers, Reformer Principals)
  const people = [
    {
      person_id: 'person:cww_kannangara',
      canonical_name: 'Dr. C.W.W. Kannangara',
      canonical_name_si: 'ආචාර්ය සී.ඩබ්.ඩබ්. කන්නන්ගර',
      canonical_name_ta: 'கலாநிதி சி.டபிள்யூ.டபிள்யூ. கன்னங்கரா',
      honors_prefix: 'Hon.',
      biographical_notes: 'Father of Free Education in Sri Lanka. Minister of Education in State Council (1931-1947). Introduced Central Schools (Madhya Maha Vidyala) and Free Education Bill.',
    },
    {
      person_id: 'person:rev_joseph_marsh',
      canonical_name: 'Rev. Joseph Marsh',
      canonical_name_si: 'ජෝසප් මාෂ් පියතුමා',
      canonical_name_ta: 'வணக்கத்திற்குரிய ஜோசப் மார்ஷ்',
      honors_prefix: 'Rev.',
      biographical_notes: 'First Headmaster of Colombo Academy (later Royal College) founded in 1835.',
    },
    {
      person_id: 'person:dr_barcroft_boake',
      canonical_name: 'Dr. Barcroft Boake',
      canonical_name_si: 'බාක්‍රොෆ්ට් බෝක් පියතුමා',
      canonical_name_ta: 'கலாநிதி பார்கிராப்ட் போக்',
      honors_prefix: 'Dr.',
      biographical_notes: 'Principal of Colombo Academy for 28 years (1842-1870), establishing foundational academic rigor.',
    },
    {
      person_id: 'person:el_bradby',
      canonical_name: 'Edward Lawrence Bradby',
      canonical_name_si: 'ඊ.එල්. බ්‍රැඩ්බි',
      canonical_name_ta: 'ஈ.எல். பிராட்பி',
      honors_prefix: 'Mr.',
      biographical_notes: 'Principal of Royal College (1939-1945). Donated the Bradby Shield in 1945 for the annual Royal-Trinity Rugby Encounter.',
    },
    {
      person_id: 'person:cw_leadbeater',
      canonical_name: 'Charles Webster Leadbeater',
      canonical_name_si: 'චාල්ස් වෙබ්ස්ටර් ලෙඩ්බීටර්',
      canonical_name_ta: 'சார்லஸ் வெப்ஸ்டர் லெட்பீட்டர்',
      honors_prefix: 'Mr.',
      biographical_notes: 'First Principal of Ananda College Colombo (1886) under Buddhist Theosophical Society.',
    },
    {
      person_id: 'person:ae_buultjens',
      canonical_name: 'Alfred Ernest Buultjens',
      canonical_name_si: 'ඒ.ඊ. බුල්ජන්ස්',
      canonical_name_ta: 'ஏ.ஈ. புல்ட்ஜென்ஸ்',
      honors_prefix: 'Mr.',
      biographical_notes: 'General Manager of Buddhist Schools and second Principal of Ananda College (1890-1898).',
    },
    {
      person_id: 'person:p_de_s_kularatne',
      canonical_name: 'P. de S. Kularatne',
      canonical_name_si: 'පී. ද එස්. කුලරත්න',
      canonical_name_ta: 'பி. டி எஸ். குலரத்ன',
      honors_prefix: 'Mr.',
      biographical_notes: 'Legendary educational reformer. Principal of Ananda College (1918-1943), founded Nalanda College Colombo and Moratuwa Vidyalaya.',
    },
    {
      person_id: 'person:lh_mettananda',
      canonical_name: 'L.H. Mettananda',
      canonical_name_si: 'එල්.එච්. මෙත්තානන්ද',
      canonical_name_ta: 'எல்.எச். மெத்தானந்தா',
      honors_prefix: 'Mr.',
      biographical_notes: 'Principal of Dharmaraja College Kandy and later Ananda College Colombo (1945-1954).',
    },
    {
      person_id: 'person:g_malalasekera',
      canonical_name: 'Prof. Gunapala Malalasekera',
      canonical_name_si: 'මහාචාර්ය ගුණපාල මලලසේකර',
      canonical_name_ta: 'பேராசிரியர் குணபால மலலசேகர',
      honors_prefix: 'Prof.',
      biographical_notes: 'First Principal of Nalanda College Colombo (1925), world-renowned Pali scholar, editor of Pali-English Dictionary and Buddhist Encyclopedia.',
    },
    {
      person_id: 'person:fl_woodward',
      canonical_name: 'Frank Lee Woodward',
      canonical_name_si: 'එෆ්.එල්. වුඩ්වර්ඩ්',
      canonical_name_ta: 'பிராங்க் லீ உட்வர்ட்',
      honors_prefix: 'Mr.',
      biographical_notes: 'Principal of Mahinda College Galle (1903-1919). Transformed it into one of the island’s foremost Buddhist national institutions.',
    },
    {
      person_id: 'person:jh_darrell',
      canonical_name: 'Rev. J.H. Darrell',
      canonical_name_si: 'ජේ.එච්. ඩැරල් පියතුමා',
      canonical_name_ta: 'வணக்கத்திற்குரிய ஜே.எச். டாரெல்',
      honors_prefix: 'Rev.',
      biographical_notes: 'Principal of Richmond College Galle (1896-1906), Cambridge scholar who introduced modern science education to the South.',
    },
    {
      person_id: 'person:clara_motwani',
      canonical_name: 'Clara Motwani',
      canonical_name_si: 'ක්ලාරා මොට්වානි මැතිණිය',
      canonical_name_ta: 'கிளாரா மோத்வானி',
      honors_prefix: 'Mrs.',
      biographical_notes: 'American Buddhist educator. Founder Principal of Musaeus College and Principal of Visakha Vidyalaya (1933-1946).',
    },
    {
      person_id: 'person:thilak_waththuhewa',
      canonical_name: 'Thilak Waththuhewa',
      canonical_name_si: 'තිලක් වත්තුහේවා',
      canonical_name_ta: 'திலக் வத்துஹேவா',
      honors_prefix: 'Mr.',
      biographical_notes: 'Principal of Royal College Colombo (2020-Present), SLEAS Special Grade Officer.',
    },
    {
      person_id: 'person:lal_dissanayake',
      canonical_name: 'Lal Dissanayake',
      canonical_name_si: 'ලාල් දිසානායක',
      canonical_name_ta: 'லால் திசாநாயக்க',
      honors_prefix: 'Mr.',
      biographical_notes: 'Principal of Ananda College Colombo (2022-Present), SLEAS Special Grade Officer.',
    },
  ];

  const insertPersonStmt = db.prepare(`
    INSERT OR REPLACE INTO people 
    (person_id, canonical_name, canonical_name_si, canonical_name_ta, honors_prefix, biographical_notes)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  // 2. ROLE OCCUPANCIES (Tenure Spans & Appointment History)
  const tenures = [
    // Royal College (0117001)
    {
      occupancy_id: 'occ:0117001_principal_marsh',
      person_id: 'person:rev_joseph_marsh',
      role_code: 'principal',
      entity_id: 'school:0117001',
      valid_from: '1835-01-01',
      valid_to: '1838-12-31',
      tenure_status: 'retired',
      appointment_type: 'gazetted_promotion',
      official_memo: 'First Headmaster of Colombo Academy.',
    },
    {
      occupancy_id: 'occ:0117001_principal_boake',
      person_id: 'person:dr_barcroft_boake',
      role_code: 'principal',
      entity_id: 'school:0117001',
      valid_from: '1842-01-01',
      valid_to: '1870-12-31',
      tenure_status: 'retired',
      appointment_type: 'gazetted_promotion',
      official_memo: 'Longest tenure in school history (28 years).',
    },
    {
      occupancy_id: 'occ:0117001_principal_bradby',
      person_id: 'person:el_bradby',
      role_code: 'principal',
      entity_id: 'school:0117001',
      valid_from: '1939-01-01',
      valid_to: '1945-12-31',
      tenure_status: 'retired',
      appointment_type: 'gazetted_promotion',
      official_memo: 'Donated Bradby Shield in 1945.',
    },
    {
      occupancy_id: 'occ:0117001_principal_waththuhewa',
      person_id: 'person:thilak_waththuhewa',
      role_code: 'principal',
      entity_id: 'school:0117001',
      valid_from: '2020-01-01',
      valid_to: null,
      tenure_status: 'confirmed',
      appointment_type: 'gazetted_promotion',
      official_memo: 'Current Principal of Royal College.',
    },

    // Ananda College (0117002)
    {
      occupancy_id: 'occ:0117002_principal_leadbeater',
      person_id: 'person:cw_leadbeater',
      role_code: 'principal',
      entity_id: 'school:0117002',
      valid_from: '1886-01-01',
      valid_to: '1890-12-31',
      tenure_status: 'retired',
      appointment_type: 'gazetted_promotion',
      official_memo: 'Founding Principal of Ananda College.',
    },
    {
      occupancy_id: 'occ:0117002_principal_kularatne',
      person_id: 'person:p_de_s_kularatne',
      role_code: 'principal',
      entity_id: 'school:0117002',
      valid_from: '1918-01-01',
      valid_to: '1943-12-31',
      tenure_status: 'retired',
      appointment_type: 'gazetted_promotion',
      official_memo: 'Transformed Ananda into national educational powerhouse.',
    },
    {
      occupancy_id: 'occ:0117002_principal_mettananda',
      person_id: 'person:lh_mettananda',
      role_code: 'principal',
      entity_id: 'school:0117002',
      valid_from: '1945-01-01',
      valid_to: '1954-12-31',
      tenure_status: 'retired',
      appointment_type: 'gazetted_promotion',
      official_memo: 'Post-Independence golden era leader.',
    },
    {
      occupancy_id: 'occ:0117002_principal_dissanayake',
      person_id: 'person:lal_dissanayake',
      role_code: 'principal',
      entity_id: 'school:0117002',
      valid_from: '2022-01-01',
      valid_to: null,
      tenure_status: 'confirmed',
      appointment_type: 'gazetted_promotion',
      official_memo: 'Current Principal of Ananda College.',
    },

    // Nalanda College (0117003)
    {
      occupancy_id: 'occ:0117003_principal_malalasekera',
      person_id: 'person:g_malalasekera',
      role_code: 'principal',
      entity_id: 'school:0117003',
      valid_from: '1925-01-01',
      valid_to: '1927-12-31',
      tenure_status: 'retired',
      appointment_type: 'gazetted_promotion',
      official_memo: 'First Principal of Nalanda College.',
    },

    // Mahinda College Galle (0701001)
    {
      occupancy_id: 'occ:0701001_principal_woodward',
      person_id: 'person:fl_woodward',
      role_code: 'principal',
      entity_id: 'school:0701001',
      valid_from: '1903-01-01',
      valid_to: '1919-12-31',
      tenure_status: 'retired',
      appointment_type: 'gazetted_promotion',
      official_memo: 'Pioneered Southern province renaissance.',
    },

    // Richmond College Galle (0701002)
    {
      occupancy_id: 'occ:0701002_principal_darrell',
      person_id: 'person:jh_darrell',
      role_code: 'principal',
      entity_id: 'school:0701002',
      valid_from: '1896-01-01',
      valid_to: '1906-12-31',
      tenure_status: 'retired',
      appointment_type: 'gazetted_promotion',
      official_memo: 'Pioneered science lab education in southern Sri Lanka.',
    },

    // Visakha Vidyalaya (0116016)
    {
      occupancy_id: 'occ:0116016_principal_motwani',
      person_id: 'person:clara_motwani',
      role_code: 'principal',
      entity_id: 'school:0116016',
      valid_from: '1933-01-01',
      valid_to: '1946-12-31',
      tenure_status: 'retired',
      appointment_type: 'gazetted_promotion',
      official_memo: 'Transformed Visakha into premier Buddhist girls institution.',
    },
  ];

  const insertTenureStmt = db.prepare(`
    INSERT OR REPLACE INTO role_occupancies 
    (occupancy_id, person_id, role_code, entity_id, valid_from, valid_to, tenure_status, appointment_type, official_memo)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // 3. STUDENT SUB-ENTITIES: SOCIETIES, CLUBS, SPORTS, CORPS
  const subEntities = [
    // Royal College (0117001)
    {
      sub_entity_id: 'sub:0117001_science_soc',
      school_census_no: '0117001',
      name_en: 'Royal College Science Society',
      name_si: 'රාජකීය විද්‍යාලයීය විද්‍යා සංගමය',
      domain: 'academic_society',
      founded_year: 1940,
      traditions_summary: 'Oldest school science society in Sri Lanka. Organizes annual Science Day and Sankalpana exhibition.',
    },
    {
      sub_entity_id: 'sub:0117001_buddhist_bro',
      school_census_no: '0117001',
      name_en: 'Royal College Buddhist Brotherhood',
      name_si: 'රාජකීය විද්‍යාලයීය බෞද්ධ සහෝදර සංගමය',
      domain: 'cultural_association',
      founded_year: 1955,
      traditions_summary: 'Founded by senior masters; organizes annual Pirith and Vesak lantern festival.',
    },
    {
      sub_entity_id: 'sub:0117001_scouts',
      school_census_no: '0117001',
      name_en: '14th Colombo Scout Troop',
      name_si: '14 වන කොළඹ බාලදක්ෂ කණ්ඩායම',
      domain: 'uniformed_corps',
      founded_year: 1910,
      traditions_summary: 'Pioneering scout troop established shortly after Baden-Powell founded the movement.',
    },
    {
      sub_entity_id: 'sub:0117001_cricket_1st_xi',
      school_census_no: '0117001',
      name_en: 'Royal College 1st XI Cricket Team',
      name_si: 'රාජකීය විද්‍යාලයීය පළමු පෙළ ක්‍රිකට් කණ්ඩායම',
      domain: 'sport',
      founded_year: 1879,
      traditions_summary: 'Contests the Battle of the Blues annually against S. Thomas’ College (unbroken since 1879).',
    },
    {
      sub_entity_id: 'sub:0117001_rugby_1st_xv',
      school_census_no: '0117001',
      name_en: 'Royal College 1st XV Rugby Team',
      name_si: 'රාජකීය විද්‍යාලයීය පළමු පෙළ රග්බි කණ්ඩායම',
      domain: 'sport',
      founded_year: 1916,
      traditions_summary: 'Contests the Bradby Shield annually against Trinity College Kandy.',
    },
    {
      sub_entity_id: 'sub:0117001_brass_band',
      school_census_no: '0117001',
      name_en: 'Royal College Western Brass Band',
      name_si: 'රාජකීය විද්‍යාලයීය බටහිර තූර්යවාදක කණ්ඩායම',
      domain: 'performing_arts',
      founded_year: 1978,
      traditions_summary: 'Premier school marching and concert brass band.',
    },

    // Ananda College (0117002)
    {
      sub_entity_id: 'sub:0117002_buddhist_assoc',
      school_census_no: '0117002',
      name_en: 'Ananda College Buddhist Association',
      name_si: 'ආනන්ද විද්‍යාලයීය බෞද්ධ සංගමය',
      domain: 'cultural_association',
      founded_year: 1890,
      traditions_summary: 'Central spiritual pillar of Buddhist national education in Colombo.',
    },
    {
      sub_entity_id: 'sub:0117002_science_union',
      school_census_no: '0117002',
      name_en: 'Ananda College Science Union',
      name_si: 'ආනන්ද විද්‍යාලයීය විද්‍යා සංගමය',
      domain: 'academic_society',
      founded_year: 1942,
      traditions_summary: 'Publishes legendary "Vidyartha" scientific journal.',
    },
    {
      sub_entity_id: 'sub:0117002_cricket_1st_xi',
      school_census_no: '0117002',
      name_en: 'Ananda College 1st XI Cricket Team',
      name_si: 'ආනන්ද විද්‍යාලයීය පළමු පෙළ ක්‍රිකට් කණ්ඩායම',
      domain: 'sport',
      founded_year: 1924,
      traditions_summary: 'Contests the Battle of the Maroons annually against Nalanda College.',
    },
    {
      sub_entity_id: 'sub:0117002_cadet_platoon',
      school_census_no: '0117002',
      name_en: 'Ananda College Senior Cadet Platoon',
      name_si: 'ආනන්ද විද්‍යාලයීය ජ්‍යෙෂ්ඨ ශිෂ්‍යභට ඛණ්ඩය',
      domain: 'uniformed_corps',
      founded_year: 1902,
      traditions_summary: 'Won multiple Hermann Loos challenge cups.',
    },
    {
      sub_entity_id: 'sub:0117002_dancing_troupe',
      school_census_no: '0117002',
      name_en: 'Ananda Oriental Dancing & Drumming Troupe',
      name_si: 'ආනන්ද විද්‍යාලයීය පෙරදිග නර්තන හා වාදන කණ්ඩායම',
      domain: 'performing_arts',
      founded_year: 1950,
      traditions_summary: 'Custodian of traditional Upcountry (Udarata) drumming and ves dance.',
    },

    // Nalanda College (0117003)
    {
      sub_entity_id: 'sub:0117003_astronomy',
      school_census_no: '0117003',
      name_en: 'Nalanda College Astronomical Society',
      name_si: 'නාලන්දා විද්‍යාලයීය තාරකා විද්‍යා සංගමය',
      domain: 'academic_society',
      founded_year: 1994,
      traditions_summary: 'Pioneered national school astronomy competitions and celestial observation nights.',
    },
    {
      sub_entity_id: 'sub:0117003_cricket_1st_xi',
      school_census_no: '0117003',
      name_en: 'Nalanda College 1st XI Cricket Team',
      name_si: 'නාලන්දා විද්‍යාලයීය පළමු පෙළ ක්‍රිකට් කණ්ඩායම',
      domain: 'sport',
      founded_year: 1924,
      traditions_summary: 'Contests the Battle of the Maroons; nurtured Sri Lanka’s first Test captain Bandula Warnapura.',
    },

    // Mahinda College Galle (0701001)
    {
      sub_entity_id: 'sub:0701001_cricket_1st_xi',
      school_census_no: '0701001',
      name_en: 'Mahinda College 1st XI Cricket Team',
      name_si: 'මහින්ද විද්‍යාලයීය පළමු පෙළ ක්‍රිකට් කණ්ඩායම',
      domain: 'sport',
      founded_year: 1905,
      traditions_summary: 'Contests the "Lovers’ Quarrel" annually against Richmond College Galle.',
    },

    // Richmond College Galle (0701002)
    {
      sub_entity_id: 'sub:0701002_cricket_1st_xi',
      school_census_no: '0701002',
      name_en: 'Richmond College 1st XI Cricket Team',
      name_si: 'රිච්මන්ඩ් විද්‍යාලයීය පළමු පෙළ ක්‍රිකට් කණ්ඩායම',
      domain: 'sport',
      founded_year: 1905,
      traditions_summary: 'Contests the "Lovers’ Quarrel" annually against Mahinda College Galle.',
    },

    // Dharmaraja College Kandy (0401001)
    {
      sub_entity_id: 'sub:0401001_scouts',
      school_census_no: '0401001',
      name_en: '1st Kandy Dharmaraja Scout Troop',
      name_si: '1 වන මහනුවර ධර්මරාජ බාලදක්ෂ කණ්ඩායම',
      domain: 'uniformed_corps',
      founded_year: 1913,
      traditions_summary: 'Oldest scout troop in Kandy; winner of numerous national awards.',
    },
    {
      sub_entity_id: 'sub:0401001_cricket_1st_xi',
      school_census_no: '0401001',
      name_en: 'Dharmaraja College 1st XI Cricket Team',
      name_si: 'ධර්මරාජ විද්‍යාලයීය පළමු පෙළ ක්‍රිකට් කණ්ඩායම',
      domain: 'sport',
      founded_year: 1893,
      traditions_summary: 'Contests the "Battle of the Maroons (Kandy)" annually against Kingswood College.',
    },

    // Maliyadeva College Kurunegala (1801013)
    {
      sub_entity_id: 'sub:1801013_cricket_1st_xi',
      school_census_no: '1801013',
      name_en: 'Maliyadeva College 1st XI Cricket Team',
      name_si: 'මලියදේව විද්‍යාලයීය පළමු පෙළ ක්‍රිකට් කණ්ඩායම',
      domain: 'sport',
      founded_year: 1900,
      traditions_summary: 'Contests the "Battle of the Rocks" annually against St. Anne’s College Kurunegala.',
    },

    // Visakha Vidyalaya Colombo (0116016)
    {
      sub_entity_id: 'sub:0116016_buddhist_society',
      school_census_no: '0116016',
      name_en: 'Visakha Buddhist Society',
      name_si: 'විශාඛා බෞද්ධ සංගමය',
      domain: 'cultural_association',
      founded_year: 1927,
      traditions_summary: 'Heart of Buddhist spiritual education for girls in Sri Lanka.',
    },
    {
      sub_entity_id: 'sub:0116016_dancing_circle',
      school_census_no: '0116016',
      name_en: 'Visakha Oriental Dancing Circle',
      name_si: 'විශාඛා පෙරදිග නර්තන කවය',
      domain: 'performing_arts',
      founded_year: 1955,
      traditions_summary: 'Consistent national winners in All-Island Traditional Dance Competitions.',
    },
  ];

  const insertSubEntityStmt = db.prepare(`
    INSERT OR REPLACE INTO school_sub_entities 
    (sub_entity_id, school_census_no, name_en, name_si, domain, founded_year, traditions_summary)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  db.exec('BEGIN TRANSACTION;');
  try {
    for (const p of people) {
      insertPersonStmt.run(
        p.person_id,
        p.canonical_name,
        p.canonical_name_si || null,
        p.canonical_name_ta || null,
        p.honors_prefix || null,
        p.biographical_notes || null
      );
    }

    for (const t of tenures) {
      insertTenureStmt.run(
        t.occupancy_id,
        t.person_id,
        t.role_code,
        t.entity_id,
        t.valid_from,
        t.valid_to || null,
        t.tenure_status,
        t.appointment_type || null,
        t.official_memo || null
      );
    }

    for (const s of subEntities) {
      insertSubEntityStmt.run(
        s.sub_entity_id,
        s.school_census_no,
        s.name_en,
        s.name_si || null,
        s.domain,
        s.founded_year || null,
        s.traditions_summary || null
      );
    }

    db.exec('COMMIT;');
  } catch (err) {
    db.exec('ROLLBACK;');
    throw err;
  }

  console.log(`\n🎉 Governance & Culture Seeded:`);
  console.log(`   - People (Principals & Founders): ${people.length}`);
  console.log(`   - Role Occupancies (Tenures): ${tenures.length}`);
  console.log(`   - School Sub-Entities (Societies & Teams): ${subEntities.length}`);
}

run();
