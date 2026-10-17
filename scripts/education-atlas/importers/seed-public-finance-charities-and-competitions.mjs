// scripts/education-atlas/importers/seed-public-finance-charities-and-competitions.mjs
// Sovereign Seeder for Public Finance, Provincial Budgets, Charities, Foundations, Competitions, Aesthetics & EdTech

import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.resolve(__dirname, '../../../data/education-atlas/atlas_staging.db');

console.log(`[Seeder 010] Opening database at: ${DB_PATH}`);
const db = new DatabaseSync(DB_PATH);
db.exec('PRAGMA foreign_keys = ON;');
db.exec('PRAGMA journal_mode = WAL;');

// -----------------------------------------------------------------------------
// 1. SEED GOVERNMENT PUBLIC FINANCE (NATIONAL & PROVINCIAL)
// -----------------------------------------------------------------------------
console.log('[Seeder 010] Seeding government_education_budgets...');

const govBudgets = [
  // National Line Ministries (Central Treasury)
  {
    budget_record_id: 'gov_fin:central_moe_2024',
    fiscal_year: 2024,
    budget_tier: 'central_treasury_line_ministry',
    entity_scope: 'ministry_of_education',
    entity_name_en: 'Ministry of Education (General Education & National Schools)',
    recurrent_budget_lkr: 205000000000, // 205 Billion LKR
    capital_budget_lkr: 32000000000,    // 32 Billion LKR
    total_allocation_lkr: 237000000000, // 237 Billion LKR
    gdp_share_percent: 1.15,
    welfare_transfers_json: JSON.stringify({
      free_textbooks_lkr: 16000000000,
      free_uniform_materials_lkr: 8500000000,
      midday_meal_program_lkr: 16500000000,
      sisuriyesara_bus_subsidy_lkr: 3200000000,
      grade_5_bursary_stipends_lkr: 2100000000
    }),
    primary_spending_heads_json: JSON.stringify([
      'National School Teacher & Principal Payroll',
      'Curriculum Reform & NIE Operations',
      'Free Welfare Goods Procurement',
      'Smart Classroom Infrastructure & Lab Kits'
    ]),
    source_citation: 'Ministry of Finance Appropriation Bill 2024 & Central Bank Annual Report 2024',
    notes: 'National central budget covering 396 National Schools, National Institute of Education (NIE), and national educational welfare transfers.'
  },
  {
    budget_record_id: 'gov_fin:central_mohe_2024',
    fiscal_year: 2024,
    budget_tier: 'central_treasury_line_ministry',
    entity_scope: 'ministry_of_higher_education',
    entity_name_en: 'Ministry of Higher Education & University Grants Commission (UGC)',
    recurrent_budget_lkr: 88500000000,
    capital_budget_lkr: 24200000000,
    total_allocation_lkr: 112700000000,
    gdp_share_percent: 0.55,
    welfare_transfers_json: JSON.stringify({
      mahapola_bursary_grants_lkr: 6800000000,
      university_hostel_subsidies_lkr: 3400000000,
      ifsls_loan_scheme_interest_lkr: 2100000000
    }),
    primary_spending_heads_json: JSON.stringify([
      'Academic & Non-Academic University Payroll for 17 State Universities',
      'Capital Construction for Engineering & Medical Faculties',
      'Research Grants (NRC/NSF)',
      'LEARN Inter-Campus Fiber Infrastructure'
    ]),
    source_citation: 'UGC Annual Financial Report & Ministry of Finance Budget Estimates 2024',
    notes: 'Subventions for 17 UGC state universities and 19 SLIATE Advanced Technological Institutes.'
  },
  {
    budget_record_id: 'gov_fin:central_tvet_2024',
    fiscal_year: 2024,
    budget_tier: 'central_treasury_line_ministry',
    entity_scope: 'ministry_of_skills_development',
    entity_name_en: 'Ministry of Skills Development & Vocational Training (TVET Sector)',
    recurrent_budget_lkr: 14800000000,
    capital_budget_lkr: 6500000000,
    total_allocation_lkr: 21300000000,
    gdp_share_percent: 0.10,
    welfare_transfers_json: JSON.stringify({
      tvet_apprentice_stipends_lkr: 1850000000,
      free_nvq_assessment_vouchers_lkr: 420000000
    }),
    primary_spending_heads_json: JSON.stringify([
      'German Tech & NAITA Instructor Payroll',
      'Vocational Training Authority (VTA) Rural Centers',
      'Heavy Machinery & Automotive Workshop Overhauls'
    ]),
    source_citation: 'TVEC National Skills Report & Appropriation Act 2024',
    notes: 'Funding for NVQ Level 1-7 vocational pipeline, NAITA apprenticeships, and German Tech workshops.'
  },

  // Provincial Council Devolved Budgets (The 9 Provinces - 2024)
  {
    budget_record_id: 'gov_fin:prov_western_2024',
    fiscal_year: 2024,
    budget_tier: 'provincial_council_devolved',
    entity_scope: 'western_province',
    entity_name_en: 'Western Provincial Council Ministry of Education',
    recurrent_budget_lkr: 68500000000,
    capital_budget_lkr: 4200000000,
    total_allocation_lkr: 72700000000,
    gdp_share_percent: 0.35,
    welfare_transfers_json: JSON.stringify({ provincial_bursaries_lkr: 450000000, provincial_athletic_meets_lkr: 180000000 }),
    primary_spending_heads_json: JSON.stringify(['Provincial Teacher Salaries (Colombo, Gampaha, Kalutara)', 'School Building Maintenance', 'Zonal Office Operations']),
    source_citation: 'Western Provincial Council Financial Statements 2024',
    notes: 'Largest provincial education budget; 1,360 provincial schools; 88% dedicated to teacher payroll.'
  },
  {
    budget_record_id: 'gov_fin:prov_central_2024',
    fiscal_year: 2024,
    budget_tier: 'provincial_council_devolved',
    entity_scope: 'central_province',
    entity_name_en: 'Central Provincial Council Ministry of Education',
    recurrent_budget_lkr: 42100000000,
    capital_budget_lkr: 3100000000,
    total_allocation_lkr: 45200000000,
    gdp_share_percent: 0.22,
    welfare_transfers_json: JSON.stringify({ estate_school_welfare_lkr: 620000000, mid_day_meal_top_up_lkr: 280000000 }),
    primary_spending_heads_json: JSON.stringify(['Kandy, Matale, Nuwara Eliya Teacher Salaries', 'Estate School Infrastructure Upgrades', 'Hardship Post Allowances']),
    source_citation: 'Central Provincial Council Budget Ledger 2024',
    notes: 'High concentration of Type 3 Tamil plantation estate schools requiring targeted capital interventions.'
  },
  {
    budget_record_id: 'gov_fin:prov_southern_2024',
    fiscal_year: 2024,
    budget_tier: 'provincial_council_devolved',
    entity_scope: 'southern_province',
    entity_name_en: 'Southern Provincial Council Ministry of Education',
    recurrent_budget_lkr: 38400000000,
    capital_budget_lkr: 2800000000,
    total_allocation_lkr: 41200000000,
    gdp_share_percent: 0.20,
    welfare_transfers_json: JSON.stringify({ rural_school_transport_lkr: 210000000, scholarship_grants_lkr: 180000000 }),
    primary_spending_heads_json: JSON.stringify(['Galle, Matara, Hambantota Teacher Salaries', 'Tsunami-Resilient Coastal School Upkeep', 'Science Lab Refurbishments']),
    source_citation: 'Southern Provincial Council Estimates 2024',
    notes: 'Covers 1,110 schools across Galle, Matara, and Hambantota; high performance in G.C.E. O/L exams.'
  },
  {
    budget_record_id: 'gov_fin:prov_north_western_2024',
    fiscal_year: 2024,
    budget_tier: 'provincial_council_devolved',
    entity_scope: 'north_western_province',
    entity_name_en: 'North Western (Wayamba) Provincial Council Ministry of Education',
    recurrent_budget_lkr: 39200000000,
    capital_budget_lkr: 2600000000,
    total_allocation_lkr: 41800000000,
    gdp_share_percent: 0.20,
    welfare_transfers_json: JSON.stringify({ rural_bursaries_lkr: 240000000 }),
    primary_spending_heads_json: JSON.stringify(['Kurunegala and Puttalam Teacher Payroll', 'Water Purification in CKDu Affected Agrarian Schools', 'Zonal Sports Facilities']),
    source_citation: 'North Western Provincial Council 2024 Budget',
    notes: 'Kurunegala has the highest school count of any single administrative district in Sri Lanka (875+ schools).'
  },
  {
    budget_record_id: 'gov_fin:prov_northern_2024',
    fiscal_year: 2024,
    budget_tier: 'provincial_council_devolved',
    entity_scope: 'northern_province',
    entity_name_en: 'Northern Provincial Council Ministry of Education',
    recurrent_budget_lkr: 29800000000,
    capital_budget_lkr: 2900000000,
    total_allocation_lkr: 32700000000,
    gdp_share_percent: 0.16,
    welfare_transfers_json: JSON.stringify({ war_affected_student_relief_lkr: 410000000, island_ferry_school_passes_lkr: 85000000 }),
    primary_spending_heads_json: JSON.stringify(['Jaffna, Kilinochchi, Mullaitivu, Vavuniya, Mannar Teacher Salaries', 'Post-Conflict Laboratory Reconstruction', 'Teacher Housing Quarters in Remote Zones']),
    source_citation: 'Northern Provincial Council Budget 2024',
    notes: 'Crucial for island schools (Delft, Nainativu) and rural Vanni re-settlement zones.'
  },
  {
    budget_record_id: 'gov_fin:prov_eastern_2024',
    fiscal_year: 2024,
    budget_tier: 'provincial_council_devolved',
    entity_scope: 'eastern_province',
    entity_name_en: 'Eastern Provincial Council Ministry of Education',
    recurrent_budget_lkr: 34600000000,
    capital_budget_lkr: 3000000000,
    total_allocation_lkr: 37600000000,
    gdp_share_percent: 0.18,
    welfare_transfers_json: JSON.stringify({ trilingual_learning_grants_lkr: 290000000 }),
    primary_spending_heads_json: JSON.stringify(['Batticaloa, Ampara, Trincomalee Trilingual Teacher Payroll', 'Coastal & Lagoon School Upgrades', 'Border Village Classroom Upkeep']),
    source_citation: 'Eastern Provincial Council Budget 2024',
    notes: 'Complex trilingual school distribution (Sinhala, Tamil, Muslim schools).'
  },
  {
    budget_record_id: 'gov_fin:prov_sabaragamuwa_2024',
    fiscal_year: 2024,
    budget_tier: 'provincial_council_devolved',
    entity_scope: 'sabaragamuwa_province',
    entity_name_en: 'Sabaragamuwa Provincial Council Ministry of Education',
    recurrent_budget_lkr: 31500000000,
    capital_budget_lkr: 2200000000,
    total_allocation_lkr: 33700000000,
    gdp_share_percent: 0.16,
    welfare_transfers_json: JSON.stringify({ mountain_zone_school_bursaries_lkr: 190000000 }),
    primary_spending_heads_json: JSON.stringify(['Ratnapura and Kegalle Teacher Salaries', 'Landslide Hazard School Relocation Works', 'Estate Primary School Nutrition']),
    source_citation: 'Sabaragamuwa Provincial Council 2024 Budget',
    notes: 'Covers Ratnapura and Kegalle districts; steep terrain requires special school transport and safety works.'
  },
  {
    budget_record_id: 'gov_fin:prov_north_central_2024',
    fiscal_year: 2024,
    budget_tier: 'provincial_council_devolved',
    entity_scope: 'north_central_province',
    entity_name_en: 'North Central Provincial Council Ministry of Education',
    recurrent_budget_lkr: 26400000000,
    capital_budget_lkr: 2000000000,
    total_allocation_lkr: 28400000000,
    gdp_share_percent: 0.14,
    welfare_transfers_json: JSON.stringify({ agrarian_drought_relief_lkr: 220000000 }),
    primary_spending_heads_json: JSON.stringify(['Anuradhapura and Polonnaruwa Teacher Payroll', 'Tank Cascade Tank-Village School Sanitation', 'Wild Elephant Deterrent Fencing for Schools']),
    source_citation: 'North Central Provincial Council Estimates 2024',
    notes: 'Agrarian dry-zone schools; high prevalence of single-teacher or 2-teacher primary schools in remote feeder pockets.'
  },
  {
    budget_record_id: 'gov_fin:prov_uva_2024',
    fiscal_year: 2024,
    budget_tier: 'provincial_council_devolved',
    entity_scope: 'uva_province',
    entity_name_en: 'Uva Provincial Council Ministry of Education',
    recurrent_budget_lkr: 25100000000,
    capital_budget_lkr: 2100000000,
    total_allocation_lkr: 27200000000,
    gdp_share_percent: 0.13,
    welfare_transfers_json: JSON.stringify({ remote_village_bursaries_lkr: 270000000 }),
    primary_spending_heads_json: JSON.stringify(['Badulla and Monaragala Teacher Payroll', 'Remote Hardship Post Allowances', 'Rainwater Harvesting Systems']),
    source_citation: 'Uva Provincial Council Budget 2024',
    notes: 'Monaragala ranks among the highest in school dropout rates and multi-dimensional child poverty; heavy reliance on central equalization grants.'
  }
];

const insertGovFin = db.prepare(`
  INSERT INTO government_education_budgets
  (budget_record_id, fiscal_year, budget_tier, entity_scope, entity_name_en, recurrent_budget_lkr, capital_budget_lkr, total_allocation_lkr, gdp_share_percent, welfare_transfers_json, primary_spending_heads_json, source_citation, notes)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  ON CONFLICT(budget_record_id) DO UPDATE SET
    recurrent_budget_lkr = excluded.recurrent_budget_lkr,
    capital_budget_lkr = excluded.capital_budget_lkr,
    total_allocation_lkr = excluded.total_allocation_lkr,
    welfare_transfers_json = excluded.welfare_transfers_json,
    primary_spending_heads_json = excluded.primary_spending_heads_json;
`);

for (const b of govBudgets) {
  insertGovFin.run(
    b.budget_record_id,
    b.fiscal_year,
    b.budget_tier,
    b.entity_scope,
    b.entity_name_en,
    b.recurrent_budget_lkr,
    b.capital_budget_lkr,
    b.total_allocation_lkr,
    b.gdp_share_percent,
    b.welfare_transfers_json,
    b.primary_spending_heads_json,
    b.source_citation,
    b.notes
  );
}

// -----------------------------------------------------------------------------
// 2. SEED EXPANDED SCHOOL MICRO-FINANCE (SDS VS TREASURY INVERSION)
// -----------------------------------------------------------------------------
console.log('[Seeder 010] Seeding representative school_finance_budgets...');

const schoolFinances = [
  // 1AB National - Royal College Colombo
  {
    budget_id: 'fin:0117001_2024',
    school_census_no: '0117001',
    fiscal_year: 2024,
    treasury_recurrent_lkr: 290000000,
    treasury_capital_lkr: 25000000,
    per_pupil_state_spend_lkr: 52500,
    sds_facility_fees_lkr: 35000000,
    sds_donations_and_events_lkr: 85000000,
    sds_alumni_endowments_lkr: 60000000,
    sds_total_revenue_lkr: 180000000,
    sds_to_treasury_ratio: 7.2,
    notes: 'Elite national school funding model: massive alumni endowment (Royal College Union) enables private ICT teachers, Olympic swimming pool maintenance, and air-conditioned smart lecture theaters.'
  },
  // 1AB National - Visakha Vidyalaya Colombo
  {
    budget_id: 'fin:0116016_2024',
    school_census_no: '0116016',
    fiscal_year: 2024,
    treasury_recurrent_lkr: 215000000,
    treasury_capital_lkr: 18000000,
    per_pupil_state_spend_lkr: 53750,
    sds_facility_fees_lkr: 28000000,
    sds_donations_and_events_lkr: 52000000,
    sds_alumni_endowments_lkr: 40000000,
    sds_total_revenue_lkr: 120000000,
    sds_to_treasury_ratio: 6.67,
    notes: 'Premier Buddhist girls school: Old Girls Association and SDS fund modern science labs, auditorium acoustics, and robotics clubs.'
  },
  // 1AB National - Jaffna Central College
  {
    budget_id: 'fin:1001002_2024',
    school_census_no: '1001002',
    fiscal_year: 2024,
    treasury_recurrent_lkr: 175000000,
    treasury_capital_lkr: 14000000,
    per_pupil_state_spend_lkr: 53000,
    sds_facility_fees_lkr: 15000000,
    sds_donations_and_events_lkr: 28000000,
    sds_alumni_endowments_lkr: 35000000,
    sds_total_revenue_lkr: 78000000,
    sds_to_treasury_ratio: 5.57,
    notes: 'Premier northern national school: substantial overseas diaspora alumni endowment (UK, Canada, Australia) funding IT center and cricket turf.'
  },
  // 1AB National - Maliyadeva College Kurunegala
  {
    budget_id: 'fin:1801013_2024',
    school_census_no: '1801013',
    fiscal_year: 2024,
    treasury_recurrent_lkr: 260000000,
    treasury_capital_lkr: 18000000,
    per_pupil_state_spend_lkr: 53460,
    sds_facility_fees_lkr: 22000000,
    sds_donations_and_events_lkr: 45000000,
    sds_alumni_endowments_lkr: 30000000,
    sds_total_revenue_lkr: 97000000,
    sds_to_treasury_ratio: 5.38,
    notes: 'Provincial capital flagship: strong agricultural & merchant alumni base funding smart classrooms and indoor sports stadium.'
  },
  // 1AB National - Thurstan College Colombo
  {
    budget_id: 'fin:0117004_2024',
    school_census_no: '0117004',
    fiscal_year: 2024,
    treasury_recurrent_lkr: 185000000,
    treasury_capital_lkr: 15000000,
    per_pupil_state_spend_lkr: 52800,
    sds_facility_fees_lkr: 18000000,
    sds_donations_and_events_lkr: 38000000,
    sds_alumni_endowments_lkr: 25000000,
    sds_total_revenue_lkr: 81000000,
    sds_to_treasury_ratio: 5.4,
    notes: 'Colombo national boys school: active OBA financing swimming complex, IT laboratories, and rugby squad.'
  },
  // 1AB Provincial - Passara M.M.V. (Uva/Badulla)
  {
    budget_id: 'fin:2202001_2024',
    school_census_no: '2202001',
    fiscal_year: 2024,
    treasury_recurrent_lkr: 95000000,
    treasury_capital_lkr: 4800000,
    per_pupil_state_spend_lkr: 52770,
    sds_facility_fees_lkr: 4200000,
    sds_donations_and_events_lkr: 6500000,
    sds_alumni_endowments_lkr: 3300000,
    sds_total_revenue_lkr: 14000000,
    sds_to_treasury_ratio: 2.92,
    notes: 'Provincial 1AB central school in Uva: moderate alumni mobilization, substantial reliance on provincial capital grants for physical repairs.'
  },
  // Type 2 Provincial - Saliyapura Vidyalaya (North Central)
  {
    budget_id: 'fin:1702001_2024',
    school_census_no: '1702001',
    fiscal_year: 2024,
    treasury_recurrent_lkr: 22000000,
    treasury_capital_lkr: 900000,
    per_pupil_state_spend_lkr: 52100,
    sds_facility_fees_lkr: 280000,
    sds_donations_and_events_lkr: 220000,
    sds_alumni_endowments_lkr: 80000,
    sds_total_revenue_lkr: 580000,
    sds_to_treasury_ratio: 0.64,
    notes: 'Agrarian colony town Type 2 school: parents are paddy farmers; limited discretionary cash for SDS fees, heavily dependent on state midday meals and free uniform cloth.'
  },
  // Type 3 Provincial - Karumalaiyoothu Muslim Vidyalayam (Trincomalee/Eastern)
  {
    budget_id: 'fin:1701045_2024',
    school_census_no: '1701045',
    fiscal_year: 2024,
    treasury_recurrent_lkr: 12500000,
    treasury_capital_lkr: 450000,
    per_pupil_state_spend_lkr: 51200,
    sds_facility_fees_lkr: 120000,
    sds_donations_and_events_lkr: 95000,
    sds_alumni_endowments_lkr: 0,
    sds_total_revenue_lkr: 215000,
    sds_to_treasury_ratio: 0.48,
    notes: 'Rural coastal Type 3 school: minimal SDS revenue; struggle to fund water filter maintenance or photocopy question papers for term exams.'
  },
  // Type 3 Plantation Estate Primary - Laxapana No 1 T V (Nuwara Eliya)
  {
    budget_id: 'fin:0611016_2024',
    school_census_no: '0611016',
    fiscal_year: 2024,
    treasury_recurrent_lkr: 4500000,
    treasury_capital_lkr: 150000,
    per_pupil_state_spend_lkr: 51660,
    sds_facility_fees_lkr: 45000,
    sds_donations_and_events_lkr: 0,
    sds_alumni_endowments_lkr: 0,
    sds_total_revenue_lkr: 45000,
    sds_to_treasury_ratio: 0.30,
    notes: 'Rural estate primary school reality: completely dependent on state block grant; zero private community surplus to fix broken roof tiles or buy printer paper.'
  }
];

const insertSchoolFin = db.prepare(`
  INSERT INTO school_finance_budgets
  (budget_id, school_census_no, fiscal_year, treasury_recurrent_lkr, treasury_capital_lkr, per_pupil_state_spend_lkr, sds_facility_fees_lkr, sds_donations_and_events_lkr, sds_alumni_endowments_lkr, sds_total_revenue_lkr, sds_to_treasury_ratio, notes)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  ON CONFLICT(budget_id) DO UPDATE SET
    treasury_recurrent_lkr = excluded.treasury_recurrent_lkr,
    treasury_capital_lkr = excluded.treasury_capital_lkr,
    sds_facility_fees_lkr = excluded.sds_facility_fees_lkr,
    sds_donations_and_events_lkr = excluded.sds_donations_and_events_lkr,
    sds_alumni_endowments_lkr = excluded.sds_alumni_endowments_lkr,
    sds_total_revenue_lkr = excluded.sds_total_revenue_lkr,
    sds_to_treasury_ratio = excluded.sds_to_treasury_ratio,
    notes = excluded.notes;
`);

for (const sf of schoolFinances) {
  insertSchoolFin.run(
    sf.budget_id,
    sf.school_census_no,
    sf.fiscal_year,
    sf.treasury_recurrent_lkr,
    sf.treasury_capital_lkr,
    sf.per_pupil_state_spend_lkr,
    sf.sds_facility_fees_lkr,
    sf.sds_donations_and_events_lkr,
    sf.sds_alumni_endowments_lkr,
    sf.sds_total_revenue_lkr,
    sf.sds_to_treasury_ratio,
    sf.notes
  );
}

// -----------------------------------------------------------------------------
// 3. SEED EDUCATION CHARITIES, NGOS, FOUNDATIONS & DEVELOPMENT PARTNERS
// -----------------------------------------------------------------------------
console.log('[Seeder 010] Seeding education_charities_and_foundations...');

const charities = [
  {
    entity_id: 'ngo:unicef_sri_lanka',
    name_en: 'UNICEF Sri Lanka (United Nations Children\'s Fund)',
    name_si: 'යුනිසෙෆ් ශ්‍රී ලංකා (එක්සත් ජාතීන්ගේ ළමා අරමුදල)',
    name_ta: 'யுனிசெப் இலங்கை',
    entity_type: 'international_multilateral',
    thematic_focus: 'wash_and_infrastructure',
    operational_districts_json: JSON.stringify(['all_island']),
    annual_investment_est_lkr: 1850000000,
    flagship_initiatives_json: JSON.stringify([
      'Clean Water, Sanitation and Hygiene (WASH) in 300+ rural schools',
      'Early Childhood Development (ECD) policy frameworks with Ministry of Women & Child Affairs',
      'Post-crisis emergency learning kits and nutritional meal monitoring'
    ]),
    headquarters_location: 'Bauddhaloka Mawatha, Colombo 07',
    official_portal: 'https://www.unicef.org/srilanka',
    strategic_advisory: 'Key international partner coordinating school disaster resilience, child protection, and primary education quality standards.'
  },
  {
    entity_id: 'ngo:room_to_read',
    name_en: 'Room to Read Sri Lanka',
    name_si: 'රූම් ටු රීඩ් ශ්‍රී ලංකා',
    name_ta: 'ரூம் டு ரீட் இலங்கை',
    entity_type: 'international_ngo',
    thematic_focus: 'primary_literacy',
    operational_districts_json: JSON.stringify(['badulla', 'monaragala', 'nuwara_eliya', 'anuradhapura', 'polonnaruwa']),
    annual_investment_est_lkr: 720000000,
    flagship_initiatives_json: JSON.stringify([
      'Literacy Program: establishing child-friendly libraries in 1,600+ rural schools',
      'Publishing 200+ original trilingual children storybooks authored by local writers',
      'Girls\' Education Program (GEP): life skills, mentoring, and financial support for secondary school girls'
    ]),
    headquarters_location: 'Colombo 05',
    official_portal: 'https://www.roomtoread.org/countries/sri-lanka/',
    strategic_advisory: 'Transformative early grade reading interventions; verified improvement in Grade 2-3 reading fluency across Sinhala and Tamil medium schools.'
  },
  {
    entity_id: 'ngo:save_the_children_sl',
    name_en: 'Save the Children Sri Lanka',
    name_si: 'සේව් ද චිල්ඩ්රන් ශ්‍රී ලංකා',
    name_ta: 'சேவ் த சில்ட்ரன் இலங்கை',
    entity_type: 'international_ngo',
    thematic_focus: 'early_childhood_dev',
    operational_districts_json: JSON.stringify(['jaffna', 'kilinochchi', 'mullaitivu', 'batticaloa', 'ratnapura']),
    annual_investment_est_lkr: 650000000,
    flagship_initiatives_json: JSON.stringify([
      'Building disaster-resilient classrooms and school safety plans',
      'Inclusive education programs integrating children with disabilities into mainstream schools',
      'Preschool teacher pedagogical training and child-friendly teaching aids'
    ]),
    headquarters_location: 'Nawala, Rajagiriya',
    official_portal: 'https://srilanka.savethechildren.net/',
    strategic_advisory: 'Pioneered inclusive education and non-violent positive discipline in Sri Lankan government teacher training colleges.'
  },
  {
    entity_id: 'fnd:foundation_of_goodness',
    name_en: 'Foundation of Goodness (Kushil Gunasekera / Muralitharan)',
    name_si: 'යහපත්කමේ පදනම (කුෂිල් ගුණසේකර)',
    name_ta: 'பவுண்டேஷன் ஒப் குட்னெஸ்',
    entity_type: 'local_charity_foundation',
    thematic_focus: 'sports_and_youth_empowerment',
    operational_districts_json: JSON.stringify(['galle', 'kilinochchi', 'mullaitivu', 'jaffna', 'monaragala', 'badulla', 'batticaloa', 'ampara']),
    annual_investment_est_lkr: 520000000,
    flagship_initiatives_json: JSON.stringify([
      '16 Village Heartbeat Empowerment (VHE) Centers islandwide',
      'Seenigama Sports Academy: produced national cricketers and Olympic swimmers from rural coastal youth',
      'Free IT and English training for 30,000+ rural youth annually',
      'Essential school pack distribution to 15,000+ underprivileged students every academic year'
    ]),
    headquarters_location: 'Seenigama, Hikkaduwa & Colombo 04',
    official_portal: 'https://unconditionalcompassion.org/',
    strategic_advisory: 'Gold-standard grassroots rural empowerment model combining sports excellence with computer literacy and character development.'
  },
  {
    entity_id: 'fnd:sarvodaya_shanthi_sena',
    name_en: 'Sarvodaya Shanthi Sena & Early Childhood Development Movement',
    name_si: 'සර්වෝදය ශාන්ති සේනා හා මුල් ළමාවිය සංවර්ධන අංශය',
    name_ta: 'சர்வோதயா சாந்தி சேனா',
    entity_type: 'local_charity_foundation',
    thematic_focus: 'early_childhood_dev',
    operational_districts_json: JSON.stringify(['all_island']),
    annual_investment_est_lkr: 380000000,
    flagship_initiatives_json: JSON.stringify([
      '4,000+ Community Preschools managed under village Sarvodaya Shramadana societies',
      'Village library networks and peace education workshops for youth',
      'Youth vocational apprenticeships in rural agricultural technology'
    ]),
    headquarters_location: 'Damsak Mandira, Moratuwa',
    official_portal: 'https://www.sarvodaya.org/',
    strategic_advisory: 'Oldest indigenous community movement in Sri Lanka; provides preschool education in remote hamlets before the state school system begins.'
  },
  {
    entity_id: 'fnd:berendina_development',
    name_en: 'Berendina Development Services (Bright Student Program)',
    name_si: 'බෙරන්ඩිනා සංවර්ධන සේවා (දක්ෂ දරු ශිෂ්‍යත්ව)',
    name_ta: 'பெரன்டினா அபிவிருத்தி சேவைகள்',
    entity_type: 'local_charity_foundation',
    thematic_focus: 'plantation_community_aid',
    operational_districts_json: JSON.stringify(['nuwara_eliya', 'badulla', 'kandy', 'kegalle', 'batticaloa']),
    annual_investment_est_lkr: 310000000,
    flagship_initiatives_json: JSON.stringify([
      'Bright Student Scholarship: monthly cash bursaries for 3,500+ A/L and University students from estate and rural families',
      'Career guidance, English language, and IT immersion camps for tea estate youth',
      'School science lab equipment donations in Nuwara Eliya and Badulla'
    ]),
    headquarters_location: 'Dehiwala',
    official_portal: 'https://www.berendina.org/',
    strategic_advisory: 'Critical ladder out of generational plantation labor; produces hundreds of doctors, engineers, and graduates from estate worker families annually.'
  },
  {
    entity_id: 'fnd:dialog_foundation',
    name_en: 'Dialog Foundation (Nenasa Education Platform)',
    name_si: 'ඩයලොග් පදනම (නෙනස අධ්‍යාපන ව්‍යාපෘතිය)',
    name_ta: 'டயலொக் அறக்கட்டளை',
    entity_type: 'corporate_csr_foundation',
    thematic_focus: 'smart_classrooms_ict',
    operational_districts_json: JSON.stringify(['all_island']),
    annual_investment_est_lkr: 450000000,
    flagship_initiatives_json: JSON.stringify([
      'Nenasa TV: 8 digital educational satellite TV channels broadcasting National NIE curriculum free to 2,000+ schools',
      'Nenasa Smart Schools: transforming 100+ rural provincial schools into digital learning ecosystems',
      'Nenasa App & Teacher training in interactive digital pedagogy'
    ]),
    headquarters_location: 'Union Place, Colombo 02',
    official_portal: 'https://www.dialog.lk/nenasa',
    strategic_advisory: 'Largest corporate tech intervention in Sri Lankan public education; verified zero-rated data access to NIE and MoE digital curriculum.'
  },
  {
    entity_id: 'fnd:commercial_bank_csr',
    name_en: 'Commercial Bank CSR Trust (National IT Education Project)',
    name_si: 'කොමර්ෂල් බැංකු සමාජ සත්කාරක භාරය (තොරතුරු තාක්ෂණ විද්‍යාගාර)',
    name_ta: 'கொமர்ஷல் வங்கி சமூகப் பொறுப்புணர்வு',
    entity_type: 'corporate_csr_foundation',
    thematic_focus: 'smart_classrooms_ict',
    operational_districts_json: JSON.stringify(['all_island']),
    annual_investment_est_lkr: 280000000,
    flagship_initiatives_json: JSON.stringify([
      'Donated and fully equipped 250+ School Computer Labs across all 25 districts',
      'STEM education and coding clubs in underprivileged secondary schools',
      'Sipnena online educational portal hosting past exam papers and syllabus explanations'
    ]),
    headquarters_location: 'Commercial House, Colombo 01',
    official_portal: 'https://www.combank.lk/sustainability/csr',
    strategic_advisory: 'Pioneered private-sector hardware donations for government schools; verified functional computer hardware in schools lacking state capital allocations.'
  },
  {
    entity_id: 'fnd:john_keells_foundation',
    name_en: 'John Keells Foundation (Education & English Initiatives)',
    name_si: 'ජෝන් කීල්ස් පදනම',
    name_ta: 'ஜோன் கீல்ஸ் அறக்கட்டளை',
    entity_type: 'corporate_csr_foundation',
    thematic_focus: 'sports_and_youth_empowerment',
    operational_districts_json: JSON.stringify(['colombo', 'galle', 'jaffna', 'kandy', 'kurunegala']),
    annual_investment_est_lkr: 240000000,
    flagship_initiatives_json: JSON.stringify([
      'English for Youth: practical spoken English training for disadvantaged school leavers',
      'Final Year University Soft Skills workshops across state universities (Colombo, Peradeniya, Moratuwa, Jaffna, Ruhuna)',
      'Subhasetha higher education scholarship grants for exceptional rural scholars'
    ]),
    headquarters_location: 'Glenn Street, Colombo 02',
    official_portal: 'https://www.johnkeellsfoundation.com/',
    strategic_advisory: 'Strong bridges between state university graduates and private-sector corporate employment through soft-skills curricula.'
  },
  {
    entity_id: 'fnd:hemas_piyawara',
    name_en: 'Hemas Foundation (Piyawara Early Childhood Community Project)',
    name_si: 'හේමාස් පදනම (පියවර මුල් ළමාවිය ව්‍යාපෘතිය)',
    name_ta: 'ஹேமாஸ் அறக்கட்டளை',
    entity_type: 'corporate_csr_foundation',
    thematic_focus: 'early_childhood_dev',
    operational_districts_json: JSON.stringify(['all_island']),
    annual_investment_est_lkr: 195000000,
    flagship_initiatives_json: JSON.stringify([
      'Built and fully equipped 60+ model "Piyawara" Preschools in remote rural, plantation, and border villages',
      'National Preschool Teacher Curriculum development in partnership with the Children\'s Secretariat',
      'Child protection and positive parenting awareness seminars'
    ]),
    headquarters_location: 'Hemas House, Colombo 02',
    official_portal: 'https://www.hemas.com/sustainability/piyawara',
    strategic_advisory: 'Over 20 years of continuous investment in national early childhood care and education standards.'
  },
  {
    entity_id: 'fnd:dhammika_perera_foundation',
    name_en: 'Dhammika & Priscilla Perera Foundation (DP Education)',
    name_si: 'ධම්මික හා ප්‍රිසිලා පෙරේරා පදනම (DP එඩියුකේෂන්)',
    name_ta: 'டி.பி. எஜுகேஷன் அறக்கட்டளை',
    entity_type: 'local_charity_foundation',
    thematic_focus: 'smart_classrooms_ict',
    operational_districts_json: JSON.stringify(['all_island']),
    annual_investment_est_lkr: 1200000000,
    flagship_initiatives_json: JSON.stringify([
      'DP Education: 100% free digital trilingual video lectures covering Grade 1 through A/L syllabus (1.5M+ active users)',
      'DP Coding School: establishing coding centers in 100+ Buddhist temples and community centers teaching Scratch, Python, AI',
      'Zero-rated internet access partnerships with SLT-Mobitel and Dialog'
    ]),
    headquarters_location: 'Colombo 07',
    official_portal: 'https://dpeducation.lk/',
    strategic_advisory: 'Massive private philanthropic scaling of free online education; completely transformed A/L and O/L self-study across rural Sri Lanka.'
  },
  {
    entity_id: 'donor:world_bank_gemd_ahead',
    name_en: 'World Bank Education Portfolio (GEMD & AHEAD Projects)',
    name_si: 'ලෝක බැංකු අධ්‍යාපන ව්‍යාපෘති (GEMD සහ AHEAD)',
    name_ta: 'உலக வங்கி கல்வித் திட்டம்',
    entity_type: 'development_bank_program',
    thematic_focus: 'higher_ed_acceleration',
    operational_districts_json: JSON.stringify(['all_island']),
    annual_investment_est_lkr: 4500000000,
    flagship_initiatives_json: JSON.stringify([
      'GEMD (General Education Modernization Project): $100M concessionary credit for primary English, mathematics, and provincial school quality',
      'AHEAD (Accelerating Higher Education Expansion and Development): $100M project modernizing 17 state universities with research incubators and STEM lab kits',
      'Development of University Business Linkage (UBL) cells for commercializing university intellectual property'
    ]),
    headquarters_location: 'World Bank Colombo Office, Colombo 03',
    official_portal: 'https://www.worldbank.org/en/country/srilanka',
    strategic_advisory: 'The primary multilateral financier of capital equipment, laboratory modernization, and postgraduate faculty development in Sri Lankan tertiary education.'
  },
  {
    entity_id: 'donor:adb_hrd_project',
    name_en: 'Asian Development Bank (Science & Technology Human Resource Development)',
    name_si: 'ආසියානු සංවර්ධන බැංකුව (විද්‍යා හා තාක්ෂණ මානව සම්පත් සංවර්ධන ව්‍යාපෘතිය)',
    name_ta: 'ஆசிய அபிவிருத்தி வங்கி',
    entity_type: 'development_bank_program',
    thematic_focus: 'higher_ed_acceleration',
    operational_districts_json: JSON.stringify(['gampaha', 'anuradhapura', 'ratnapura', 'colombo']),
    annual_investment_est_lkr: 3800000000,
    flagship_initiatives_json: JSON.stringify([
      'Constructed state-of-the-art Faculty of Technology buildings at Kelaniya, Rajarata, and Sabaragamuwa universities ($165M)',
      'Constructed the new Faculty of Engineering complex at University of Sri Jayewardenepura',
      'Skills Sector Development Program (SSDP): upgrading TVEC NVQ Level 4-6 vocational curricula'
    ]),
    headquarters_location: 'ADB Sri Lanka Resident Mission, Colombo 07',
    official_portal: 'https://www.adb.org/countries/sri-lanka/main',
    strategic_advisory: 'Primary international driver of the national Technology Stream (Engineering Technology, Biosystems Technology) in higher education.'
  }
];

const insertCharity = db.prepare(`
  INSERT INTO education_charities_and_foundations
  (entity_id, name_en, name_si, name_ta, entity_type, thematic_focus, operational_districts_json, annual_investment_est_lkr, flagship_initiatives_json, headquarters_location, official_portal, strategic_advisory)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  ON CONFLICT(entity_id) DO UPDATE SET
    name_en = excluded.name_en,
    thematic_focus = excluded.thematic_focus,
    operational_districts_json = excluded.operational_districts_json,
    annual_investment_est_lkr = excluded.annual_investment_est_lkr,
    flagship_initiatives_json = excluded.flagship_initiatives_json,
    official_portal = excluded.official_portal,
    strategic_advisory = excluded.strategic_advisory;
`);

for (const c of charities) {
  insertCharity.run(
    c.entity_id,
    c.name_en,
    c.name_si,
    c.name_ta,
    c.entity_type,
    c.thematic_focus,
    c.operational_districts_json,
    c.annual_investment_est_lkr,
    c.flagship_initiatives_json,
    c.headquarters_location,
    c.official_portal,
    c.strategic_advisory
  );
}

// -----------------------------------------------------------------------------
// 4. SEED NATIONAL COMPETITIONS, SPORTS, AESTHETICS & STEM OLYMPIADS
// -----------------------------------------------------------------------------
console.log('[Seeder 010] Seeding national_competitions_and_events...');

const competitions = [
  // Sports & Athletics
  {
    competition_id: 'comp:all_island_school_games',
    canonical_name_en: 'All-Island School Games (National School Athletic Championship)',
    canonical_name_si: 'සමස්ත ලංකා පාසල් ක්‍රීඩා උළෙල',
    canonical_name_ta: 'அகில இலங்கை பாடசாலை விளையாட்டுப் போட்டிகள்',
    category: 'sports_athletics',
    governing_body: 'Ministry of Education - Special Education & Sports Branch',
    inception_year: 1984,
    annual_participants_est: 65000,
    qualifying_hierarchy: 'school_to_zonal_to_provincial_to_national',
    flagship_trophy_or_award: 'President\'s Overall Championship Trophy & Best Athlete Gold Shield',
    key_venues: 'Sugathadasa Stadium Colombo, Torrington Grounds, Bogambara Stadium Kandy',
    international_pathway: 'Asian Youth Athletics Championships, World Athletics U20 Championships, Commonwealth Youth Games',
    traditions_and_cultural_significance: 'The supreme pinnacle of school athletics in Sri Lanka; launchpad for national Olympic sprinters (Susanthika Jayasinghe, Sugath Thilakaratne, Aruna Darshana) who emerged from rural schools like Walala A. Ratnayake Central and St. Joseph\'s Balika Gampaha.'
  },
  {
    competition_id: 'comp:milo_schools_rugby',
    canonical_name_en: 'All-Island Schools Rugby League & President\'s Trophy Knockout',
    canonical_name_si: 'සමස්ත ලංකා පාසල් රග්බි ලීග් ශූරතාවය',
    canonical_name_ta: 'பாடசாலைகள் ரக்பி லீக் போட்டி',
    category: 'sports_athletics',
    governing_body: 'Sri Lanka Schools Rugby Football Association (SLSRFA)',
    inception_year: 1974,
    annual_participants_est: 4500,
    qualifying_hierarchy: 'division_league_and_knockout',
    flagship_trophy_or_award: 'Dialog Schools League Trophy & Milo President\'s Trophy',
    key_venues: 'Royal Complex, Havelock Park, Sugathadasa Stadium, Bogambara Stadium Kandy, Pallekele Stadium',
    international_pathway: 'Sri Lanka Junior Tuskers (Asian U19 Rugby Championship)',
    traditions_and_cultural_significance: 'The most intensely followed and passionately attended school sports tournament in Sri Lanka; fierce traditional rivalries between Royal, Trinity, Isipathana, St. Peter\'s, Wesley, and Kingswood drawing 15,000+ stadium spectators per game.'
  },
  {
    competition_id: 'comp:schools_cricket_tournament',
    canonical_name_en: 'All-Island Under-19 Inter-School Cricket Championship (Divisions 1, 2, 3)',
    canonical_name_si: 'සමස්ත ලංකා වයස 19න් පහළ පාසල් ක්‍රිකට් තරගාවලිය',
    canonical_name_ta: 'அகில இலங்கை 19 வயதுக்குட்பட்ட கிரிக்கெட் போட்டி',
    category: 'sports_athletics',
    governing_body: 'Sri Lanka Schools Cricket Association (SLSCA) in partnership with Sri Lanka Cricket (SLC)',
    inception_year: 1948,
    annual_participants_est: 8500,
    qualifying_hierarchy: 'two_day_league_and_tier_knockout',
    flagship_trophy_or_award: 'Singer-SLSCA Under-19 Championship Trophy & Observer Schoolboy Cricketer of the Year',
    key_venues: 'SSC Colombo, NCC, Asgiriya Stadium Kandy, Galle International Cricket Stadium, St. Peter\'s Grounds',
    international_pathway: 'Sri Lanka Under-19 World Cup Squad',
    traditions_and_cultural_significance: 'The foundational cradle of Sri Lankan international cricket; produced Arjuna Ranatunga, Sanath Jayasuriya, Muttiah Muralitharan, Kumar Sangakkara, and Mahela Jayawardene from school teams.'
  },
  {
    competition_id: 'comp:battle_of_the_blues',
    canonical_name_en: 'The Battle of the Blues (Royal College vs. S. Thomas\' College)',
    canonical_name_si: 'නිල් මහ සටන (රාජකීය - ශාන්ත තෝමස්)',
    canonical_name_ta: 'நீலப் போர் (ரோயல் - சென் தோமஸ்)',
    category: 'sports_derby_encounter',
    governing_body: 'Royal-Thomian Match Committee (Joint Alumni & Principals)',
    inception_year: 1879,
    annual_participants_est: 40000,
    qualifying_hierarchy: 'invitational_derby',
    flagship_trophy_or_award: 'D. S. Senanayake Memorial Shield',
    key_venues: 'Sinhalese Sports Club (SSC) Grounds, Colombo 07',
    international_pathway: 'Historic school encounter (older than the Ashes cricket test series by 3 years)',
    traditions_and_cultural_significance: 'The oldest uninterrupted annual cricket match in Asia; survived two World Wars and multiple insurgencies without a single cancellation since 1879; a high-society national cultural spectacle with brass bands, tent tents, and century-old battle songs.'
  },
  {
    competition_id: 'comp:ncc_herman_loos_camp',
    canonical_name_en: 'National Cadet Corps (NCC) Annual Assessment Camp & Herman Loos Trophy',
    canonical_name_si: 'ජාතික ශිෂ්‍යභට බලකා වාර්ෂික කඳවුර සහ හර්මන් ලූස් කුසලානය',
    canonical_name_ta: 'தேசிய கெடட் படையணி வருடாந்த முகாம்',
    category: 'cadet_and_uniformed_corps',
    governing_body: 'National Cadet Corps (NCC Sri Lanka) & Ministry of Defence',
    inception_year: 1917,
    annual_participants_est: 12000,
    qualifying_hierarchy: 'battalion_assessment_to_all_island_camp',
    flagship_trophy_or_award: 'Herman Loos Challenge Cup (Boys Platoons) & De Soysa Challenge Cup (Girls Platoons)',
    key_venues: 'NCC Training Centre, Rantembe, Randenigala',
    international_pathway: 'Youth Exchange Program (YEP) with India, Pakistan, Bangladesh, Maldives, Nepal',
    traditions_and_cultural_significance: 'Premier military precision and leadership discipline competition for school cadet platoons; 10 days of gruelling parade drill, weapon training, map reading, obstacle courses, and tent-pitching in the Mahaweli river valley.'
  },
  {
    competition_id: 'comp:schools_chess_championship',
    canonical_name_en: 'Sri Lanka Schools Individual & Team Chess Championship',
    canonical_name_si: 'ශ්‍රී ලංකා පාසල් චෙස් ශූරතාවය',
    canonical_name_ta: 'இலங்கை பாடசாலைகள் சதுரங்கப் போட்டி',
    category: 'sports_athletics',
    governing_body: 'Sri Lanka Schools Chess Association (SLSCA) & Chess Federation of Sri Lanka (CFSL)',
    inception_year: 1978,
    annual_participants_est: 18000,
    qualifying_hierarchy: 'district_selection_to_national_finals',
    flagship_trophy_or_award: 'All-Island Schools Overall Chess Championship Trophy',
    key_venues: 'St. Joseph\'s College Auditorium Colombo, Royal MAS Arena, Bandaragama Central',
    international_pathway: 'World Youth Chess Championship, Asian Schools Chess Championship',
    traditions_and_cultural_significance: 'Massive intellectual competition; one of the largest participation sports in Sri Lankan schools with high participation from Dharmasoka Ambalangoda, Maliyadeva Kurunegala, and Ananda College.'
  },

  // Aesthetics: Drama, Music, Dance & Visual Art
  {
    competition_id: 'comp:all_island_drama_festival',
    canonical_name_en: 'All-Island School Drama & Theatre Festival (Sinhala, Tamil, English)',
    canonical_name_si: 'සමස්ත ලංකා පාසල් නාට්‍ය හා රංග කලා උළෙල',
    canonical_name_ta: 'அகில இலங்கை பாடசாலை நாடக விழா',
    category: 'aesthetic_drama_theatre',
    governing_body: 'Ministry of Education Aesthetic Education Branch & Tower Hall Theatre Foundation',
    inception_year: 1968,
    annual_participants_est: 15000,
    qualifying_hierarchy: 'school_to_zonal_to_provincial_to_national',
    flagship_trophy_or_award: 'Best Production Gold Trophy & Ediriweera Sarachchandra Memorial Shield',
    key_venues: 'Tower Hall Maradana, Elphinstone Theatre, Lionel Wendt Theatre',
    international_pathway: 'National Youth Drama Festival & State Children\'s Drama Festival',
    traditions_and_cultural_significance: 'The premier national crucible for theatrical art; produced generation of legendary playwrights, actors, and directors (Sugathapala de Silva, Somalatha Subasinghe, Dharmasiri Bandaranayake); bridges deep linguistic and social divides through serious student dramaturgy.'
  },
  {
    competition_id: 'comp:shakespeare_drama',
    canonical_name_en: 'All-Island Inter-School Shakespeare Drama Competition',
    canonical_name_si: 'සමස්ත ලංකා අන්තර් පාසල් ශේක්ස්පියර් නාට්‍ය තරගාවලිය',
    canonical_name_ta: 'அகில இலங்கை பாடசாலைகளுக்கிடையிலான ஷேக்ஸ்பியர் நாடகப் போட்டி',
    category: 'aesthetic_drama_theatre',
    governing_body: 'Rotary Club of Colombo North & Colombo YMCA',
    inception_year: 1973,
    annual_participants_est: 2500,
    qualifying_hierarchy: 'all_island_preliminary_to_finals',
    flagship_trophy_or_award: 'Shakespeare Challenge Shield (Boys Schools & Girls Schools)',
    key_venues: 'Lionel Wendt Theatre, Colombo 07',
    international_pathway: 'Shakespeare\'s Globe Theatre London Youth Affiliations',
    traditions_and_cultural_significance: 'Celebrated English theatrical milestone running for over 50 years; schools perform 30-minute excerpts of Shakespearean tragedies and comedies before packed crowds at the Lionel Wendt; fiercely contested by Royal, S. Thomas\', Ananda, St. Peter\'s, Ladies\', Bishop\'s, Visakha, and Devi Balika.'
  },
  {
    competition_id: 'comp:all_island_music_competition',
    canonical_name_en: 'All-Island Inter-School Music Competitions (Eastern, Western, Folk & Choral)',
    canonical_name_si: 'සමස්ත ලංකා පාසල් සංගීත තරගාවලිය (පෙරදිග හා අපරදිග)',
    canonical_name_ta: 'அகில இலங்கை பாடசாலை இசைப் போட்டிகள்',
    category: 'aesthetic_music_choral',
    governing_body: 'Ministry of Education Aesthetic Education Branch',
    inception_year: 1970,
    annual_participants_est: 22000,
    qualifying_hierarchy: 'school_to_zonal_to_provincial_to_national',
    flagship_trophy_or_award: 'All-Island Gold Medallion for Best School Orchestra & Choir',
    key_venues: 'Nelum Pokuna Mahinda Rajapaksa Theatre, BMICH, Sri Lanka Foundation Institute',
    international_pathway: 'World Choir Games & SAARC Youth Cultural Meets',
    traditions_and_cultural_significance: 'High artistic standards spanning North Indian Classical (Ragadhari) vocal and sitar/esraj ensembles, traditional Sinhala and Tamil folk songs (Prashasthi, Vannam), and Western choral polyphony.'
  },
  {
    competition_id: 'comp:all_island_dance_competition',
    canonical_name_en: 'All-Island School Dance & Traditional Drumming Festival',
    canonical_name_si: 'සමස්ත ලංකා පාසල් නැටුම් හා බෙර වාදන තරගාවලිය',
    canonical_name_ta: 'அகில இலங்கை பாடசாலை நடனப் போட்டிகள்',
    category: 'aesthetic_dance_ballet',
    governing_body: 'Ministry of Education Aesthetic Education Branch',
    inception_year: 1972,
    annual_participants_est: 28000,
    qualifying_hierarchy: 'school_to_zonal_to_provincial_to_national',
    flagship_trophy_or_award: 'Chitrasena Memorial Trophy & State Gold Medallion for Traditional Dance',
    key_venues: 'National Youth Services Council (NYSC) Maharagama, John de Silva Memorial Theatre',
    international_pathway: 'International Council of Organizations of Folklore Festivals and Folk Arts (CIOFF)',
    traditions_and_cultural_significance: 'Preserves the rigorous tripartite indigenous dance traditions of Sri Lanka: Kandyan (Udarata - Ves, Vannam), Low Country (Pahatarata - Kolam, Devol Madu), Sabaragamuwa, and Classical Bharatanatyam with full ceremonial acoustic drumming (Geta Beraya, Yak Beraya, Davula, Thammattama).'
  },
  {
    competition_id: 'comp:all_island_art_competition',
    canonical_name_en: 'All-Island School Art & Sculpture Competition (State Child Art Exhibition)',
    canonical_name_si: 'සමස්ත ලංකා පාසල් චිත්‍ර හා මූර්ති තරගාවලිය',
    canonical_name_ta: 'அகில இலங்கை பாடசாலை சித்திரப் போட்டி',
    category: 'aesthetic_art_visual',
    governing_body: 'Ministry of Education Aesthetic Education Branch & Department of Cultural Affairs',
    inception_year: 1965,
    annual_participants_est: 45000,
    qualifying_hierarchy: 'school_to_zonal_to_provincial_to_national',
    flagship_trophy_or_award: 'State Child Artist of the Year Gold Medallion',
    key_venues: 'National Art Gallery Colombo, J.D.A. Perera Gallery, Lionel Wendt Art Centre',
    international_pathway: 'Shankar\'s International Children\'s Competition (India), Kanagawa World Biennial Child Art Exhibition (Japan)',
    traditions_and_cultural_significance: 'Immense creative output across watercolors, oil paintings, tempera, and clay sculptures reflecting Sri Lankan pastoral life, folklore, and environmental conservation.'
  },
  {
    competition_id: 'comp:national_debating_championship',
    canonical_name_en: 'Sri Lanka Schools Debating Championship (SLSDC) & Law College Oratory',
    canonical_name_si: 'ශ්‍රී ලංකා පාසල් විවාද ශූරතාවය',
    canonical_name_ta: 'இலங்கை பாடசாலை விவாதப் போட்டி',
    category: 'literary_oratory_debating',
    governing_body: 'Debaters\' Council of Sri Lanka & Sri Lanka Law College Debating Society',
    inception_year: 1995,
    annual_participants_est: 3200,
    qualifying_hierarchy: 'all_island_preliminary_rounds_to_octo_finals',
    flagship_trophy_or_award: 'SLSDC National Trophy & Sri Lanka Law College Challenge Shield',
    key_venues: 'Sri Lanka Law College, University of Colombo Faculty of Law, Royal College Union Skills Centre',
    international_pathway: 'World Schools Debating Championships (WSDC)',
    traditions_and_cultural_significance: 'Premier intellectual crucible for critical thinking, public policy analysis, and trilingual forensic oratory; rigorous parliamentary debate format shaping future jurists, diplomats, and statesmen.'
  },

  // Academic Olympiads & STEM Challenges
  {
    competition_id: 'comp:slomc_math_olympiad',
    canonical_name_en: 'Sri Lanka Olympiad Mathematics Competition (SLMC / SLOMC)',
    canonical_name_si: 'ශ්‍රී ලංකා ඔලිම්පියාඩ් ගණිත තරගාවලිය',
    canonical_name_ta: 'இலங்கை கணித ஒலிம்பியாட் போட்டி',
    category: 'academic_olympiad_stem',
    governing_body: 'Sri Lanka Olympiad Mathematics Foundation (SLOMF) & Department of Mathematics, University of Colombo',
    inception_year: 2004,
    annual_participants_est: 8500,
    qualifying_hierarchy: 'open_preliminary_exam_to_national_invitational_to_imo_camp',
    flagship_trophy_or_award: 'National Mathematics Olympiad Gold Medallion & IMO National Team Colors',
    key_venues: 'University of Colombo Faculty of Science, Regional University Centers',
    international_pathway: 'International Mathematical Olympiad (IMO) & Asian Pacific Mathematics Olympiad (APMO)',
    traditions_and_cultural_significance: 'The ultimate proving ground for extraordinary mathematical problem-solving; tests pure Euclidean geometry, number theory, combinatorics, and functional equations; Sri Lankan students have won multiple Silver and Bronze medals at the IMO.'
  },
  {
    competition_id: 'comp:slpho_physics_olympiad',
    canonical_name_en: 'Sri Lanka Physics Olympiad Competition (SLPhO)',
    canonical_name_si: 'ශ්‍රී ලංකා භෞතික විද්‍යා ඔලිම්පියාඩ් තරගාවලිය',
    canonical_name_ta: 'இலங்கை பௌதிகவியல் ஒலிம்பியாட் போட்டி',
    category: 'academic_olympiad_stem',
    governing_body: 'Institute of Physics Sri Lanka (IPSL) & Department of Physics, University of Colombo',
    inception_year: 2005,
    annual_participants_est: 4200,
    qualifying_hierarchy: 'national_theory_exam_to_laboratory_experimental_camp',
    flagship_trophy_or_award: 'IPSL Gold Medal & National Physics Colors',
    key_venues: 'Department of Physics, University of Colombo',
    international_pathway: 'International Physics Olympiad (IPhO) & Asian Physics Olympiad (APhO)',
    traditions_and_cultural_significance: 'Rigorous theoretical and experimental physics competition selecting Sri Lanka\'s delegation to the IPhO; deep questions in classical mechanics, electromagnetism, and quantum thermodynamics.'
  },
  {
    competition_id: 'comp:slbo_biology_olympiad',
    canonical_name_en: 'Sri Lanka Biology Olympiad (SLBO)',
    canonical_name_si: 'ශ්‍රී ලංකා ජීව විද්‍යා ඔලිම්පියාඩ් තරගාවලිය',
    canonical_name_ta: 'இலங்கை உயிரியல் ஒலிம்பியாட் போட்டி',
    category: 'academic_olympiad_stem',
    governing_body: 'Institute of Biology Sri Lanka (IOBSL) & Department of Plant/Animal Sciences, University of Colombo / Sri Jayewardenepura',
    inception_year: 2009,
    annual_participants_est: 5500,
    qualifying_hierarchy: 'islandwide_written_exam_to_practical_laboratory_selection',
    flagship_trophy_or_award: 'Institute of Biology Gold Medal & IBO Team Representation',
    key_venues: 'Faculty of Applied Sciences, University of Sri Jayewardenepura',
    international_pathway: 'International Biology Olympiad (IBO)',
    traditions_and_cultural_significance: 'High-prestige competition attracting the finest G.C.E. A/L Biology students islandwide; questions emphasize cell biology, genetics, ecology, and biosystematics.'
  },
  {
    competition_id: 'comp:cosl_chemistry_olympiad',
    canonical_name_en: 'Chemistry Olympiad Sri Lanka (COSL)',
    canonical_name_si: 'ශ්‍රී ලංකා රසායන විද්‍යා ඔලිම්පියාඩ් තරගාවලිය',
    canonical_name_ta: 'இலங்கை இரசாயனவியல் ஒலிம்பியாட் போட்டி',
    category: 'academic_olympiad_stem',
    governing_body: 'Institute of Chemistry Ceylon (IChemC), Adamantane House, Rajagiriya',
    inception_year: 2016,
    annual_participants_est: 3800,
    qualifying_hierarchy: 'preliminary_exam_to_practical_titration_synthesis_camp',
    flagship_trophy_or_award: 'IChemC Gold Medal & IChO National Team Representation',
    key_venues: 'College of Chemical Sciences, Rajagiriya',
    international_pathway: 'International Chemistry Olympiad (IChO)',
    traditions_and_cultural_significance: 'Intensive chemical problem-solving and bench laboratory synthesis; Sri Lankan school prodigies compete at the IChO against 80+ nations.'
  },
  {
    competition_id: 'comp:uom_robotics_challenge',
    canonical_name_en: 'Sri Lanka Robotics Challenge (SLRC) & TechTriathlon',
    canonical_name_si: 'ශ්‍රී ලංකා රොබෝ තාක්ෂණ තරගාවලිය',
    canonical_name_ta: 'இலங்கை ரோபோடிக்ஸ் போட்டி',
    category: 'academic_olympiad_stem',
    governing_body: 'Department of Electronic and Telecommunication Engineering, University of Moratuwa',
    inception_year: 2012,
    annual_participants_est: 1800,
    qualifying_hierarchy: 'open_school_and_university_arenas',
    flagship_trophy_or_award: 'SLRC Champions Trophy & Tech Innovation Grant',
    key_venues: 'University of Moratuwa Gymnasium & Auditorium',
    international_pathway: 'Techfest International Robotics Challenge (IIT Bombay, India)',
    traditions_and_cultural_significance: 'The premier autonomous robotics arena in South Asia; school students build line-following, maze-solving, and obstacle-avoiding autonomous micro-controller robots from scratch.'
  },
  {
    competition_id: 'comp:nsf_science_day_srpc',
    canonical_name_en: 'National Science Foundation (NSF) School Science Day & SRPC',
    canonical_name_si: 'ජාතික විද්‍යා පදනම පාසල් විද්‍යා දින තරගාවලිය',
    canonical_name_ta: 'தேசிய அறிவியல் அறக்கட்டளை பாடசாலை அறிவியல் தினப் போட்டி',
    category: 'academic_olympiad_stem',
    governing_body: 'National Science Foundation (NSF Sri Lanka), Vidya Mawatha, Colombo 07',
    inception_year: 1998,
    annual_participants_est: 14000,
    qualifying_hierarchy: 'school_science_research_project_to_all_island_evaluation',
    flagship_trophy_or_award: 'Prof. M.T.M. Jiffry Memorial Challenge Trophy & NSF Gold Medal',
    key_venues: 'BMICH Colombo & NSF Auditorium',
    international_pathway: 'Regeneron International Science and Engineering Fair (ISEF, USA)',
    traditions_and_cultural_significance: 'Premier applied research competition; school students conduct genuine laboratory and agricultural field research; winning projects have patented eco-friendly packaging and natural insecticides.'
  }
];

const insertCompetition = db.prepare(`
  INSERT INTO national_competitions_and_events
  (competition_id, canonical_name_en, canonical_name_si, canonical_name_ta, category, governing_body, inception_year, annual_participants_est, qualifying_hierarchy, flagship_trophy_or_award, key_venues, international_pathway, traditions_and_cultural_significance)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  ON CONFLICT(competition_id) DO UPDATE SET
    canonical_name_en = excluded.canonical_name_en,
    category = excluded.category,
    governing_body = excluded.governing_body,
    inception_year = excluded.inception_year,
    annual_participants_est = excluded.annual_participants_est,
    flagship_trophy_or_award = excluded.flagship_trophy_or_award,
    international_pathway = excluded.international_pathway,
    traditions_and_cultural_significance = excluded.traditions_and_cultural_significance;
`);

for (const comp of competitions) {
  insertCompetition.run(
    comp.competition_id,
    comp.canonical_name_en,
    comp.canonical_name_si,
    comp.canonical_name_ta,
    comp.category,
    comp.governing_body,
    comp.inception_year,
    comp.annual_participants_est,
    comp.qualifying_hierarchy,
    comp.flagship_trophy_or_award,
    comp.key_venues,
    comp.international_pathway,
    comp.traditions_and_cultural_significance
  );
}

// -----------------------------------------------------------------------------
// 5. ENRICH EDTECH ECOSYSTEM CATALOG
// -----------------------------------------------------------------------------
console.log('[Seeder 010] Enriching edtech_solutions_catalog with Sri Lankan & Global Platforms...');

const localEdtech = [
  {
    solution_id: 'edtech:e_thaksalawa',
    name: 'e-Thaksalawa (National e-Learning Portal)',
    origin_country: 'Sri Lanka',
    scope: 'sri_lanka_national',
    founding_year: 2011,
    target_audience: 'k12_students_teachers',
    pedagogical_model: 'curriculum_repository',
    connectivity_requirement: 'low_bandwidth_web',
    hardware_class: 'any_phone_pc',
    pricing_model: 'free_state_service',
    founder_epistemology: 'ministry_official',
    design_fit_assessment: 'Official national e-learning portal maintained by Ministry of Education ICT Branch; hosts textbooks, past papers, syllabus outlines, and interactive lessons in Sinhala, Tamil, and English.',
    trajectory_status: 'active_faithful',
    source_reference_url: 'http://www.e-thaksalawa.moe.gov.lk/'
  },
  {
    solution_id: 'edtech:guru_lk',
    name: 'Guru.lk (Headstart Private Limited)',
    origin_country: 'Sri Lanka',
    scope: 'sri_lanka_national',
    founding_year: 2012,
    target_audience: 'k12_and_professional',
    pedagogical_model: 'video_lecture_library',
    connectivity_requirement: 'broadband_video',
    hardware_class: 'any_phone_pc',
    pricing_model: 'freemium_commercial',
    founder_epistemology: 'edtech_entrepreneur',
    design_fit_assessment: 'Pioneering private online education platform in Sri Lanka; delivers A/L tuition, G.C.E. past papers, and corporate skills with mobile telco micro-billing.',
    trajectory_status: 'active_faithful',
    source_reference_url: 'https://www.guru.lk/'
  },
  {
    solution_id: 'edtech:exam_lanka',
    name: 'ExamLanka / PastPapers.wiki',
    origin_country: 'Sri Lanka',
    scope: 'sri_lanka_national',
    founding_year: 2018,
    target_audience: 'k12_exam_candidates',
    pedagogical_model: 'past_paper_drill',
    connectivity_requirement: 'low_bandwidth_web',
    hardware_class: 'any_phone',
    pricing_model: 'free_ad_supported',
    founder_epistemology: 'grassroots_community',
    design_fit_assessment: 'High-traffic grassroots open archives of G.C.E. O/L, A/L, and Grade 5 Scholarship past papers, provincial mock papers, and marking schemes.',
    trajectory_status: 'active_faithful',
    source_reference_url: 'https://pastpapers.wiki/'
  },
  {
    solution_id: 'edtech:igniterspace',
    name: 'IgniterSpace (Maker & Creative STEM Education)',
    origin_country: 'Sri Lanka',
    scope: 'sri_lanka_national',
    founding_year: 2016,
    target_audience: 'k12_kids_maker',
    pedagogical_model: 'constructionist_hands_on',
    connectivity_requirement: 'offline_maker_kits',
    hardware_class: 'physical_maker_hardware',
    pricing_model: 'subscription_direct_to_parent',
    founder_epistemology: 'tech_outsider',
    design_fit_assessment: 'First children\'s engineering and maker space in Sri Lanka; provides robotics, electronics, and creative programming kits fostering invention mindset over rote learning.',
    trajectory_status: 'active_faithful',
    source_reference_url: 'https://igniterspace.com/'
  },
  {
    solution_id: 'edtech:learn_lanka',
    name: 'LEARN (Lanka Education and Research Network)',
    origin_country: 'Sri Lanka',
    scope: 'sri_lanka_national',
    founding_year: 1990,
    target_audience: 'higher_ed_universities',
    pedagogical_model: 'research_network_spine',
    connectivity_requirement: 'high_speed_fiber_gigabit',
    hardware_class: 'university_datacenter',
    pricing_model: 'state_subsidized_nren',
    founder_epistemology: 'academic_researcher',
    design_fit_assessment: 'National Research and Education Network (NREN) interconnecting all 17 state universities, research institutes, and UGC with high-speed dark fiber, eduroam Wi-Fi, and global academic grid.',
    trajectory_status: 'active_faithful',
    source_reference_url: 'https://www.ac.lk/'
  },
  {
    solution_id: 'edtech:slt_esiphala',
    name: 'SLT eSiphala (National Telecom Digital Learning)',
    origin_country: 'Sri Lanka',
    scope: 'sri_lanka_national',
    founding_year: 2020,
    target_audience: 'k12_and_tertiary',
    pedagogical_model: 'virtual_classroom_lms',
    connectivity_requirement: 'broadband_video',
    hardware_class: 'any_phone_pc',
    pricing_model: 'freemium_telco_bundle',
    founder_epistemology: 'telecom_operator',
    design_fit_assessment: 'SLT-Mobitel learning management system providing teacher-led live streaming, video recordings, and mock tests with zero-rated broadband packages.',
    trajectory_status: 'active_faithful',
    source_reference_url: 'https://esiphala.lk/'
  }
];

const insertEdTech = db.prepare(`
  INSERT INTO edtech_solutions_catalog
  (solution_id, name, origin_country, scope, founding_year, target_audience, pedagogical_model, connectivity_requirement, hardware_class, pricing_model, founder_epistemology, design_fit_assessment, trajectory_status, source_reference_url)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  ON CONFLICT(solution_id) DO UPDATE SET
    name = excluded.name,
    target_audience = excluded.target_audience,
    pedagogical_model = excluded.pedagogical_model,
    connectivity_requirement = excluded.connectivity_requirement,
    hardware_class = excluded.hardware_class,
    pricing_model = excluded.pricing_model,
    design_fit_assessment = excluded.design_fit_assessment,
    trajectory_status = excluded.trajectory_status,
    source_reference_url = excluded.source_reference_url;
`);

for (const ed of localEdtech) {
  insertEdTech.run(
    ed.solution_id,
    ed.name,
    ed.origin_country,
    ed.scope,
    ed.founding_year,
    ed.target_audience,
    ed.pedagogical_model,
    ed.connectivity_requirement,
    ed.hardware_class,
    ed.pricing_model,
    ed.founder_epistemology,
    ed.design_fit_assessment,
    ed.trajectory_status,
    ed.source_reference_url
  );
}

console.log('[Seeder 010] All Public Finance, Charities, Competitions, and EdTech records successfully seeded.');
