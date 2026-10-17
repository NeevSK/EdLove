/**
 * scripts/education-atlas/migrations/007-add-ugc-admissions-mesh.mjs
 *
 * Migration 007: UGC University Admissions & District Z-Score Cutoff Mesh
 *
 * Implements the secondary-to-tertiary transition seam:
 *  1. ugc_academic_streams: 6 G.C.E. A/L streams (Bio, Physical, Commerce, Arts, ET, BST).
 *  2. ugc_degree_programs: Canonical university courses (Medicine, Engineering, CS, Law, etc.).
 *  3. ugc_district_zscore_cutoffs: Minimum Z-scores by academic year, district quota, and merit.
 */

import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';

const DB_PATH = path.resolve('data/education-atlas/atlas_staging.db');

function run() {
  console.log('🏛️  [MIGRATION 007] Creating UGC University Admissions & District Z-Score Mesh...');

  const db = new DatabaseSync(DB_PATH);
  db.exec('PRAGMA journal_mode = WAL;');
  db.exec('PRAGMA foreign_keys = ON;');

  db.exec('BEGIN TRANSACTION;');
  try {
    // 1. UGC ACADEMIC STREAMS
    db.exec(`
      CREATE TABLE IF NOT EXISTS ugc_academic_streams (
        stream_id TEXT PRIMARY KEY,          -- 'biological_science', 'physical_science'
        name_en TEXT NOT NULL,
        name_si TEXT NOT NULL,
        name_ta TEXT NOT NULL,
        description TEXT
      );
    `);

    // 2. UGC DEGREE PROGRAMS
    db.exec(`
      CREATE TABLE IF NOT EXISTS ugc_degree_programs (
        program_code TEXT PRIMARY KEY,       -- '001M' (Medicine), '003E' (Engineering)
        stream_id TEXT NOT NULL REFERENCES ugc_academic_streams(stream_id),
        name_en TEXT NOT NULL,
        name_si TEXT,
        name_ta TEXT,
        duration_years INTEGER NOT NULL,
        offering_universities_json TEXT NOT NULL, -- List of university entity IDs
        career_pathways TEXT
      );
    `);

    // 3. UGC DISTRICT Z-SCORE CUTOFFS
    db.exec(`
      CREATE TABLE IF NOT EXISTS ugc_district_zscore_cutoffs (
        cutoff_id TEXT PRIMARY KEY,          -- 'ugc:2023_24:001M:colombo'
        academic_year TEXT NOT NULL,         -- '2023/2024'
        program_code TEXT NOT NULL REFERENCES ugc_degree_programs(program_code),
        district_id TEXT NOT NULL REFERENCES geo_districts(id),
        district_name TEXT NOT NULL,
        min_z_score REAL NOT NULL,
        merit_all_island_z_score REAL NOT NULL,
        is_disadvantaged_district INTEGER NOT NULL DEFAULT 0, -- 1 for Monaragala, Nuwara Eliya, etc.
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_ugc_year_prog ON ugc_district_zscore_cutoffs(academic_year, program_code);
      CREATE INDEX IF NOT EXISTS idx_ugc_district ON ugc_district_zscore_cutoffs(district_id);
    `);

    // SEED STREAMS
    const streams = [
      { stream_id: 'biological_science', name_en: 'Biological Science', name_si: 'ජීව විද්‍යා අංශය', name_ta: 'உயிரியல் விஞ்ஞானம்', description: 'Biology, Chemistry, Physics or Agricultural Science' },
      { stream_id: 'physical_science', name_en: 'Physical Science', name_si: 'භෞතික විද්‍යා අංශය', name_ta: 'பௌதிக விஞ்ஞானம்', description: 'Combined Mathematics, Physics, Chemistry or ICT' },
      { stream_id: 'commerce', name_en: 'Commerce', name_si: 'වාණිජ අංශය', name_ta: 'வணிகப் பிரிவு', description: 'Accounting, Business Studies, Economics or ICT' },
      { stream_id: 'arts', name_en: 'Arts & Humanities', name_si: 'කලා අංශය', name_ta: 'கலைப் பிரிவு', description: 'Social sciences, languages, aesthetics and humanities' },
      { stream_id: 'technology_engineering', name_en: 'Engineering Technology (ET)', name_si: 'ඉංජිනේරු තාක්ෂණවේදය', name_ta: 'பொறியியல் தொழில்நுட்பம்', description: 'Engineering Technology, Science for Technology, and one elective' },
      { stream_id: 'technology_biosystems', name_en: 'Biosystems Technology (BST)', name_si: 'ජෛව පද්ධති තාක්ෂණවේදය', name_ta: 'உயிர்த்தொகுதி தொழில்நுட்பம்', description: 'Biosystems Technology, Science for Technology, and one elective' },
    ];

    const insertStream = db.prepare(`
      INSERT OR REPLACE INTO ugc_academic_streams (stream_id, name_en, name_si, name_ta, description)
      VALUES (?, ?, ?, ?, ?)
    `);
    for (const s of streams) {
      insertStream.run(s.stream_id, s.name_en, s.name_si, s.name_ta, s.description);
    }
    console.log(`✅ Seeded ${streams.length} UGC academic streams.`);

    // SEED FLAGSHIP DEGREE PROGRAMS
    const programs = [
      {
        program_code: '001M',
        stream_id: 'biological_science',
        name_en: 'Medicine (MBBS)',
        name_si: 'වෛද්‍යවේදය (MBBS)',
        name_ta: 'மருத்துவம் (MBBS)',
        duration_years: 5,
        offering_universities_json: JSON.stringify(['uni:colombo', 'uni:peradeniya', 'uni:japura', 'uni:kelaniya', 'uni:ruhuna', 'uni:jaffna']),
        career_pathways: 'Medical Doctor, Consultant Surgeon, Clinical Researcher, Public Health Specialist'
      },
      {
        program_code: '002D',
        stream_id: 'biological_science',
        name_en: 'Dental Surgery (BDS)',
        name_si: 'දන්ත ශල්‍ය වෛද්‍යවේදය',
        name_ta: 'பல் அறுவை சிகிச்சை',
        duration_years: 5,
        offering_universities_json: JSON.stringify(['uni:peradeniya']),
        career_pathways: 'Dental Surgeon, Orthodontist, Maxillofacial Specialist'
      },
      {
        program_code: '003E',
        stream_id: 'physical_science',
        name_en: 'Engineering (BSc Hons)',
        name_si: 'ඉංජිනේරු විද්‍යාව',
        name_ta: 'பொறியியல்',
        duration_years: 4,
        offering_universities_json: JSON.stringify(['uni:moratuwa', 'uni:peradeniya', 'uni:ruhuna', 'uni:jaffna', 'uni:japura']),
        career_pathways: 'Civil Engineer, Mechanical Engineer, Electrical Engineer, Software Architect'
      },
      {
        program_code: '006C',
        stream_id: 'physical_science',
        name_en: 'Computer Science / Software Engineering',
        name_si: 'පරිගණක විද්‍යාව',
        name_ta: 'கணினி விஞ்ஞானம்',
        duration_years: 4,
        offering_universities_json: JSON.stringify(['uni:colombo', 'uni:moratuwa', 'uni:japura', 'uni:kelaniya']),
        career_pathways: 'Software Engineer, Data Scientist, Systems Architect, AI Researcher'
      },
      {
        program_code: '007M',
        stream_id: 'commerce',
        name_en: 'Management & Business Administration',
        name_si: 'කළමනාකරණ හා ව්‍යාපාර පරිපාලන',
        name_ta: 'முகாமைத்துவம்',
        duration_years: 4,
        offering_universities_json: JSON.stringify(['uni:japura', 'uni:colombo', 'uni:kelaniya', 'uni:peradeniya']),
        career_pathways: 'Financial Analyst, Marketing Director, Corporate Strategist, Investment Banker'
      },
      {
        program_code: '004L',
        stream_id: 'arts',
        name_en: 'Law (LL.B)',
        name_si: 'නීතිවේදය (LL.B)',
        name_ta: 'சட்டம் (LL.B)',
        duration_years: 4,
        offering_universities_json: JSON.stringify(['uni:colombo', 'uni:peradeniya', 'uni:jaffna']),
        career_pathways: 'Attorney-at-Law, Magistrate, Corporate Counsel, Legal Scholar'
      },
    ];

    const insertProg = db.prepare(`
      INSERT OR REPLACE INTO ugc_degree_programs (program_code, stream_id, name_en, name_si, name_ta, duration_years, offering_universities_json, career_pathways)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const p of programs) {
      insertProg.run(p.program_code, p.stream_id, p.name_en, p.name_si, p.name_ta, p.duration_years, p.offering_universities_json, p.career_pathways);
    }
    console.log(`✅ Seeded ${programs.length} UGC degree programs.`);

    // SEED DISTRICT CUT-OFFS (2023/2024 Academic Year sample demonstrating district quotas)
    // Disadvantaged districts recognized under UGC 16-district affirmative action quota
    const disadvantagedDistricts = ['D_23', 'D_42', 'D_43', 'D_44', 'D_45', 'D_51', 'D_52', 'D_53', 'D_62', 'D_71', 'D_72', 'D_81', 'D_82'];

    const districtCuts = [
      { distId: 'D_11', distName: 'Colombo', med: 1.6250, eng: 1.5420, cs: 1.4810, law: 1.5200 },
      { distId: 'D_12', distName: 'Gampaha', med: 1.6110, eng: 1.5280, cs: 1.4720, law: 1.5050 },
      { distId: 'D_13', distName: 'Kalutara', med: 1.5890, eng: 1.5120, cs: 1.4580, law: 1.4920 },
      { distId: 'D_21', distName: 'Kandy', med: 1.5780, eng: 1.5050, cs: 1.4520, law: 1.4850 },
      { distId: 'D_22', distName: 'Matale', med: 1.5210, eng: 1.4420, cs: 1.3910, law: 1.4310 },
      { distId: 'D_23', distName: 'Nuwara Eliya', med: 1.3850, eng: 1.3120, cs: 1.2850, law: 1.3410 },
      { distId: 'D_31', distName: 'Galle', med: 1.5920, eng: 1.5210, cs: 1.4650, law: 1.4980 },
      { distId: 'D_32', distName: 'Matara', med: 1.5810, eng: 1.5110, cs: 1.4580, law: 1.4880 },
      { distId: 'D_33', distName: 'Hambantota', med: 1.5140, eng: 1.4380, cs: 1.3850, law: 1.4250 },
      { distId: 'D_41', distName: 'Jaffna', med: 1.5840, eng: 1.5180, cs: 1.4620, law: 1.4920 },
      { distId: 'D_45', distName: 'Kilinochchi', med: 1.3920, eng: 1.3250, cs: 1.2910, law: 1.3480 },
      { distId: 'D_42', distName: 'Mannar', med: 1.3780, eng: 1.3050, cs: 1.2780, law: 1.3350 },
      { distId: 'D_43', distName: 'Vavuniya', med: 1.4120, eng: 1.3380, cs: 1.3050, law: 1.3620 },
      { distId: 'D_44', distName: 'Mullaitivu', med: 1.3650, eng: 1.2980, cs: 1.2650, law: 1.3250 },
      { distId: 'D_51', distName: 'Batticaloa', med: 1.4820, eng: 1.4150, cs: 1.3720, law: 1.4110 },
      { distId: 'D_52', distName: 'Ampara', med: 1.4750, eng: 1.4080, cs: 1.3650, law: 1.4050 },
      { distId: 'D_53', distName: 'Trincomalee', med: 1.4620, eng: 1.3950, cs: 1.3520, law: 1.3950 },
      { distId: 'D_61', distName: 'Kurunegala', med: 1.5650, eng: 1.4950, cs: 1.4420, law: 1.4780 },
      { distId: 'D_62', distName: 'Puttalam', med: 1.4850, eng: 1.4180, cs: 1.3750, law: 1.4120 },
      { distId: 'D_71', distName: 'Anuradhapura', med: 1.4920, eng: 1.4250, cs: 1.3820, law: 1.4180 },
      { distId: 'D_72', distName: 'Polonnaruwa', med: 1.4210, eng: 1.3480, cs: 1.3120, law: 1.3680 },
      { distId: 'D_81', Badulla: 1.4550, distName: 'Badulla', med: 1.4550, eng: 1.3880, cs: 1.3450, law: 1.3920 },
      { distId: 'D_82', distName: 'Monaragala', med: 1.3720, eng: 1.3020, cs: 1.2710, law: 1.3310 },
      { distId: 'D_91', distName: 'Ratnapura', med: 1.5280, eng: 1.4550, cs: 1.4020, law: 1.4380 },
      { distId: 'D_92', distName: 'Kegalle', med: 1.5420, eng: 1.4720, cs: 1.4180, law: 1.4520 },
    ];

    const insertCut = db.prepare(`
      INSERT OR REPLACE INTO ugc_district_zscore_cutoffs
      (cutoff_id, academic_year, program_code, district_id, district_name, min_z_score, merit_all_island_z_score, is_disadvantaged_district)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    let cutCount = 0;
    const year = '2023/2024';

    for (const d of districtCuts) {
      const isDisadv = disadvantagedDistricts.includes(d.distId) ? 1 : 0;

      // Medicine (001M)
      insertCut.run(`ugc:${year}:001M:${d.distId}`, year, '001M', d.distId, d.distName, d.med, 1.6250, isDisadv);
      // Engineering (003E)
      insertCut.run(`ugc:${year}:003E:${d.distId}`, year, '003E', d.distId, d.distName, d.eng, 1.5420, isDisadv);
      // Computer Science (006C)
      insertCut.run(`ugc:${year}:006C:${d.distId}`, year, '006C', d.distId, d.distName, d.cs, 1.4810, isDisadv);
      // Law (004L)
      insertCut.run(`ugc:${year}:004L:${d.distId}`, year, '004L', d.distId, d.distName, d.law, 1.5200, isDisadv);

      cutCount += 4;
    }

    console.log(`✅ Seeded ${cutCount} district-level Z-score cutoffs for ${districtCuts.length} districts.`);

    db.exec('COMMIT;');
  } catch (err) {
    db.exec('ROLLBACK;');
    throw err;
  }

  console.log('🎉 Migration 007 Completed Successfully!');
}

run();
