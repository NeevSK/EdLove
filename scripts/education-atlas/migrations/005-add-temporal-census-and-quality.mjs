/**
 * scripts/education-atlas/migrations/005-add-temporal-census-and-quality.mjs
 *
 * Migration 005: Temporal Annual Census Snapshots, Schema Drift Ledger, and Quality Frameworks.
 * 
 * Enables:
 *  1. Multi-Year School Census tracking (2013-2026) to observe enrollment curves and teacher ratios.
 *  2. Schema Drift Tracking: Captures the historical presence and subsequent dropping of the
 *     "Congeniality / Difficulty Category" (පහසු / අපහසු / ඉතා අපහසු පාසල් වර්ගීකරණය).
 *  3. Leadership Turnover Inference: Derives tenure duration from year-over-year contact & leadership shifts.
 *  4. National Education Quality Assurance (QA) 8-Dimension Framework.
 */

import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';

const DB_PATH = path.resolve('data/education-atlas/atlas_staging.db');

function run() {
  console.log('📦 [MIGRATION 005] Adding Temporal Census Snapshots & Quality Frameworks...');

  const db = new DatabaseSync(DB_PATH);
  db.exec('PRAGMA journal_mode = WAL;');
  db.exec('PRAGMA foreign_keys = ON;');

  db.exec('BEGIN TRANSACTION;');
  try {
    // 1. TEMPORAL ANNUAL CENSUS SNAPSHOTS
    db.exec(`
      CREATE TABLE IF NOT EXISTS school_annual_census_snapshots (
        snapshot_id TEXT PRIMARY KEY,        -- 'snap:0117001_2018'
        census_no TEXT NOT NULL REFERENCES schools(census_no),
        census_year INTEGER NOT NULL,
        
        school_name TEXT NOT NULL,
        category TEXT,                       -- '1AB', '1C', 'Type 2', 'Type 3'
        type TEXT,                           -- 'National', 'Provincial'
        grade_span TEXT,
        medium TEXT,
        gender TEXT,
        
        -- The Congeniality / Difficulty Marker (Present pre-2020, dropped post-2020)
        difficulty_level TEXT,               -- 'Congenial', 'Difficult', 'Very Difficult', 'Extremely Difficult', NULL
        
        total_students INTEGER DEFAULT 0,
        male_students INTEGER DEFAULT 0,
        female_students INTEGER DEFAULT 0,
        total_teachers INTEGER DEFAULT 0,
        student_teacher_ratio REAL,
        
        principal_name TEXT,
        contact_phone TEXT,
        contact_email TEXT,
        
        raw_attributes_json TEXT,            -- Preserves full row dictionary for schema drift audit
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_snap_school_year ON school_annual_census_snapshots(census_no, census_year);
      CREATE INDEX IF NOT EXISTS idx_snap_year ON school_annual_census_snapshots(census_year);
      CREATE INDEX IF NOT EXISTS idx_snap_diff ON school_annual_census_snapshots(difficulty_level);
    `);
    console.log('✅ Created school_annual_census_snapshots table and indexes.');

    // 2. SCHEMA DRIFT LEDGER (Audits column drop / rename history across years)
    db.exec(`
      CREATE TABLE IF NOT EXISTS school_schema_drift_ledger (
        drift_id TEXT PRIMARY KEY,
        census_year INTEGER NOT NULL,
        column_key TEXT NOT NULL,            -- e.g. 'congeniality_level', 'difficulty_category'
        column_label_en TEXT NOT NULL,
        column_label_si TEXT,
        status TEXT NOT NULL,                -- 'active_mandatory', 'deprecated_dropped', 'newly_introduced', 'reclassified'
        policy_rationale TEXT,               -- Historical explanation (e.g. "Replaced by Aswesuma/Poverty Headcount")
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_drift_year ON school_schema_drift_ledger(census_year);
    `);
    console.log('✅ Created school_schema_drift_ledger table.');

    // Pre-seed known historical column drift events
    const driftEvents = [
      {
        drift_id: 'drift:congeniality_2013_2018',
        census_year: 2016,
        column_key: 'difficulty_level',
        column_label_en: 'Congeniality / School Hardship Level',
        column_label_si: 'පාසල් අපහසුතා / පහසුතා මට්ටම',
        status: 'active_mandatory',
        policy_rationale: 'Mandatory statutory metric governing teacher transfers, hardship allowances, and rural school grants under SLTS service minute.',
      },
      {
        drift_id: 'drift:congeniality_2020_dropped',
        census_year: 2020,
        column_key: 'difficulty_level',
        column_label_en: 'Congeniality / School Hardship Level',
        column_label_si: 'පාසල් අපහසුතා / පහසුතා මට්ටම',
        status: 'deprecated_dropped',
        policy_rationale: 'Dropped from standard public census dissemination tables during EMIS modernization; shifted to internal Zonal transfer boards.',
      },
      {
        drift_id: 'drift:sanitation_infra_2022',
        census_year: 2022,
        column_key: 'wash_and_electricity',
        column_label_en: 'WASH (Water, Sanitation, Hygiene) and Power Connectivity',
        column_label_si: 'ජල, සනීපාරක්ෂක හා විදුලි පහසුකම්',
        status: 'newly_introduced',
        policy_rationale: 'Introduced following UNICEF/WHO post-COVID and economic crisis school infrastructure assessments.',
      },
    ];

    const insertDriftStmt = db.prepare(`
      INSERT OR REPLACE INTO school_schema_drift_ledger
      (drift_id, census_year, column_key, column_label_en, column_label_si, status, policy_rationale)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    for (const d of driftEvents) {
      insertDriftStmt.run(d.drift_id, d.census_year, d.column_key, d.column_label_en, d.column_label_si, d.status, d.policy_rationale);
    }
    console.log(`✅ Pre-seeded ${driftEvents.length} schema drift landmark entries.`);

    // 3. EDUCATION QUALITY ASSURANCE (QA) 8-DIMENSION FRAMEWORK
    db.exec(`
      CREATE TABLE IF NOT EXISTS education_quality_frameworks (
        dimension_id TEXT PRIMARY KEY,
        dimension_no INTEGER NOT NULL,
        title_en TEXT NOT NULL,
        title_si TEXT NOT NULL,
        title_ta TEXT NOT NULL,
        focus_areas_json TEXT NOT NULL,
        eval_criteria_summary TEXT NOT NULL
      );
    `);
    console.log('✅ Created education_quality_frameworks table.');

    // Pre-seed MoE National Quality Assurance (QA) 8 Core Dimensions
    const qaDimensions = [
      {
        dimension_id: 'qa:dim_1_curriculum',
        dimension_no: 1,
        title_en: 'Curriculum Implementation & Management',
        title_si: 'විෂයමාලා ක්‍රියාත්මක කිරීම සහ කළමනාකරණය',
        title_ta: 'பாடத்திட்ட அமுலாக்கமும் முகாமைத்துவமும்',
        focus_areas_json: JSON.stringify(['Timetable allocation', 'Subject coverage', 'Remedial teaching', 'Practical lab hours']),
        eval_criteria_summary: 'Evaluates statutory syllabus completion, continuous assessments (SBA), and adherence to MoE term schedules.',
      },
      {
        dimension_id: 'qa:dim_2_teaching_learning',
        dimension_no: 2,
        title_en: 'Teaching-Learning Process',
        title_si: 'ඉගෙනුම් - ඉගැන්වීම් ක්‍රියාවලිය',
        title_ta: 'கற்றல் - கற்பித்தல் செயல்முறை',
        focus_areas_json: JSON.stringify(['Student-centered pedagogy', 'EdTech integration', 'Teacher lesson planning', 'Differentiated instruction']),
        eval_criteria_summary: 'Observation of active classroom engagement, teacher competency, and adaptation for diverse learning abilities.',
      },
      {
        dimension_id: 'qa:dim_3_student_achievement',
        dimension_no: 3,
        title_en: 'Student Achievements & Competencies',
        title_si: 'ශිෂ්‍ය සාධනය සහ නිපුණතා',
        title_ta: 'மாணவர் அடைவுகளும் தேர்ச்சிகளும்',
        focus_areas_json: JSON.stringify(['Grade 5 Scholarship pass rates', 'G.C.E. O/L pass rates', 'G.C.E. A/L university admissions', 'Foundational literacy/numeracy']),
        eval_criteria_summary: 'Assessment of terminal examination benchmarks and cognitive literacy/numeracy indices.',
      },
      {
        dimension_id: 'qa:dim_4_cocurricular',
        dimension_no: 4,
        title_en: 'Co-Curricular & Aesthetic Activities',
        title_si: 'සම-විෂය සහ සෞන්දර්ය ක්‍රියාකාරකම්',
        title_ta: 'இணைப்பாடவிதான மற்றும் அழகியல் செயற்பாடுகள்',
        focus_areas_json: JSON.stringify(['Sports meet participation', 'Societies and clubs', 'Aesthetic contests (music/dance/drama)', 'Cadet/Scouting']),
        eval_criteria_summary: 'Measurement of holistic character development through athletics, arts, and civic clubs.',
      },
      {
        dimension_id: 'qa:dim_5_student_welfare',
        dimension_no: 5,
        title_en: 'Student Welfare, Health & Guidance',
        title_si: 'ශිෂ්‍ය සුබසාධනය, සෞඛ්‍යය සහ මඟපෙන්වීම',
        title_ta: 'மாணவர் நல்வாழ்வு, சுகாதாரம் மற்றும் வழிகாட்டல்',
        focus_areas_json: JSON.stringify(['Midday meal nutrition', 'First aid & medical inspection', 'Counseling services', 'Aswesuma scholarship tracking']),
        eval_criteria_summary: 'Ensuring psychological safety, nutritional food security, and pastoral care for vulnerable students.',
      },
      {
        dimension_id: 'qa:dim_6_physical_resources',
        dimension_no: 6,
        title_en: 'Physical Resource Management & Infrastructure',
        title_si: 'භෞතික සම්පත් කළමනාකරණය සහ යටිතල පහසුකම්',
        title_ta: 'பௌதிக வள முகாமைத்துவமும் உட்கட்டமைப்பும்',
        focus_areas_json: JSON.stringify(['Laboratory safety', 'Library book ratio', 'ICT computer lab ratio', 'Sanitation and clean drinking water']),
        eval_criteria_summary: 'Audit of Board of Survey assets, building maintenance, and classroom density.',
      },
      {
        dimension_id: 'qa:dim_7_leadership_management',
        dimension_no: 7,
        title_en: 'School Leadership, Governance & Administration',
        title_si: 'පාසල් නායකත්වය, පාලනය සහ පරිපාලනය',
        title_ta: 'பாடசாலைத் தலைமைத்துவம், ஆளுகை மற்றும் நிர்வாகம்',
        focus_areas_json: JSON.stringify(['Principal tenure stability', 'Financial management (SDS funds)', 'Staff development', 'Statutory compliance']),
        eval_criteria_summary: 'Integrity of institutional leadership, accounting transparency, and official circular compliance.',
      },
      {
        dimension_id: 'qa:dim_8_community_partnerships',
        dimension_no: 8,
        title_en: 'School-Community & Parental Partnerships',
        title_si: 'පාසල සහ ප්‍රජා සබඳතා',
        title_ta: 'பாடசாலை - சமூகம் மற்றும் பெற்றோர் கூட்டாண்மை',
        focus_areas_json: JSON.stringify(['School Development Society (SDS)', 'Past Pupils Association (PPA)', 'Community Shramadana', 'Local industry partnerships']),
        eval_criteria_summary: 'Evaluation of parental co-ownership, alumni reinvestment, and social capital integration.',
      },
    ];

    const insertQaStmt = db.prepare(`
      INSERT OR REPLACE INTO education_quality_frameworks
      (dimension_id, dimension_no, title_en, title_si, title_ta, focus_areas_json, eval_criteria_summary)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    for (const q of qaDimensions) {
      insertQaStmt.run(q.dimension_id, q.dimension_no, q.title_en, q.title_si, q.title_ta, q.focus_areas_json, q.eval_criteria_summary);
    }
    console.log(`✅ Pre-seeded ${qaDimensions.length} National QA Quality Dimensions.`);

    db.exec('COMMIT;');
  } catch (err) {
    db.exec('ROLLBACK;');
    throw err;
  }

  console.log('🎉 Migration 005 Complete!');
}

run();
