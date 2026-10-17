/**
 * scripts/education-atlas/importers/seed-higher-ed-facilities-tne-and-scholarships.mjs
 *
 * Sovereign Seeder: Higher Education Facilities, Urban Private TNE Funnel & Scholarships
 *
 * Populates:
 *  1. Urban Private Degree-Awarding Campuses (Horizon, IIT, APIIT, ICBT, ACBT, BMS, Saegis, RIC, ESOFT, NIBM).
 *  2. Physical Campus Infrastructure (Acreage, faculties, hostels, research labs, teaching hospitals).
 *  3. Foreign Partner Universities (Westminster, Curtin, Plymouth, Staffordshire, Deakin, ECU, London, Coventry).
 *  4. TNE Degree Funnels (1+2, 2+2 transfer pipelines, internal franchises, post-study work rights).
 *  5. Comprehensive Higher Education Scholarships Ledger (Bachelors, Masters, PhDs).
 *  6. University Leadership & Governance (Vice Chancellors, Rectors, Deans).
 */

import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';

const DB_PATH = path.resolve('data/education-atlas/atlas_staging.db');

export function seedTneAndScholarships() {
  console.log('🏛️  [SEEDED] Populating Higher Ed Facilities, TNE Funnel & Scholarships...');

  const db = new DatabaseSync(DB_PATH);
  db.exec('PRAGMA journal_mode = WAL;');
  db.exec('PRAGMA foreign_keys = ON;');

  db.exec('BEGIN TRANSACTION;');
  try {
    // -------------------------------------------------------------
    // 1. SEED / UPDATE URBAN PRIVATE DEGREE INSTITUTIONS
    // -------------------------------------------------------------
    const insertInst = db.prepare(`
      INSERT OR REPLACE INTO higher_ed_institutions (
        inst_id, name_en, name_si, name_ta, inst_type, district_id, province_id,
        address_town, latitude, longitude, coord_precision, established_year,
        governing_body, statutory_decree, website_url, annual_student_enrollment,
        campus_acreage, faculties_count, hostel_available, hospital_attached, research_centers_count, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // Update physical stats for existing state flagships
    const updateExisting = [
      { id: 'uni:colombo', acreage: 50.0, faculties: 9, hostel: 1, hospital: 1, research: 8 },
      { id: 'uni:peradeniya', acreage: 1700.0, faculties: 9, hostel: 1, hospital: 1, research: 12 },
      { id: 'uni:moratuwa', acreage: 100.0, faculties: 5, hostel: 1, hospital: 0, research: 10 },
      { id: 'uni:japura', acreage: 55.0, faculties: 8, hostel: 1, hospital: 1, research: 7 },
      { id: 'uni:kelaniya', acreage: 53.0, faculties: 7, hostel: 1, hospital: 1, research: 6 },
      { id: 'uni:ruhuna', acreage: 95.0, faculties: 10, hostel: 1, hospital: 1, research: 6 },
      { id: 'uni:jaffna', acreage: 42.0, faculties: 10, hostel: 1, hospital: 1, research: 5 },
      { id: 'inst:kdu', acreage: 85.0, faculties: 9, hostel: 1, hospital: 1, research: 5 },
      { id: 'inst:sliit', acreage: 25.0, faculties: 6, hostel: 1, hospital: 0, research: 6 },
      { id: 'inst:nsbm', acreage: 26.0, faculties: 5, hostel: 1, hospital: 0, research: 4 },
    ];

    const updateStmt = db.prepare(`
      UPDATE higher_ed_institutions
      SET campus_acreage = ?, faculties_count = ?, hostel_available = ?, hospital_attached = ?, research_centers_count = ?
      WHERE inst_id = ?
    `);
    for (const u of updateExisting) {
      updateStmt.run(u.acreage, u.faculties, u.hostel, u.hospital, u.research, u.id);
    }

    // New Urban Private & TNE Campuses
    const privateCampuses = [
      {
        inst_id: 'inst:horizon_campus',
        name_en: 'Horizon Campus (Malabe Knowledge City)',
        name_si: 'හොරයිසන් කැම්පස් (මාලඹේ)',
        name_ta: 'ஹொரைசன் வளாகம்',
        inst_type: 'semi_state_private_degree',
        district_id: 'D_11',
        province_id: 'P_1',
        address_town: 'Knowledge City Malabe, Millennium Drive',
        latitude: 6.9080,
        longitude: 79.9670,
        coord_precision: 'exact_campus',
        established_year: 2009,
        governing_body: 'Ministry of Higher Education Specified Institute',
        statutory_decree: 'Universities Act No. 16 of 1978 Sec 25A Recognition',
        website_url: 'https://horizoncampus.edu.lk',
        annual_student_enrollment: 4500,
        campus_acreage: 13.5,
        faculties_count: 5,
        hostel_available: 1,
        hospital_attached: 0,
        research_centers_count: 2,
        notes: 'Purpose-built campus in Malabe IT corridor offering degrees in Education, Law, IT, and Science.'
      },
      {
        inst_id: 'inst:iit_colombo',
        name_en: 'Informatics Institute of Technology (IIT Colombo)',
        name_si: 'තොරතුරු තාක්ෂණ ආයතනය (IIT)',
        name_ta: 'தகவல் தொழில்நுட்ப நிறுவனம் (IIT)',
        inst_type: 'semi_state_private_degree',
        district_id: 'D_11',
        province_id: 'P_1',
        address_town: 'Ramakrishna Road, Wellawatte, Colombo 06',
        latitude: 6.8740,
        longitude: 79.8600,
        coord_precision: 'exact_campus',
        established_year: 1990,
        governing_body: 'Private Higher Education / University of Westminster Partner',
        statutory_decree: 'Private Academic Incorporation',
        website_url: 'https://www.iit.ac.lk',
        annual_student_enrollment: 5200,
        campus_acreage: 3.2,
        faculties_count: 3,
        hostel_available: 0,
        hospital_attached: 0,
        research_centers_count: 3,
        notes: 'Pioneer British computing education institute founded by Dr. Gamini Wickramasinghe; renowned for 100% industrial placement with Virtusa, WSO2, and London Stock Exchange Group.'
      },
      {
        inst_id: 'inst:apiit_colombo',
        name_en: 'Asia Pacific Institute of Information Technology (APIIT)',
        name_si: 'ඒපීඅයිඅයිටී ශ්‍රී ලංකා (කොළඹ)',
        name_ta: 'ஏபிஐஐடி இலங்கை',
        inst_type: 'semi_state_private_degree',
        district_id: 'D_11',
        province_id: 'P_1',
        address_town: 'Union Place, Colombo 02',
        latitude: 6.9210,
        longitude: 79.8590,
        coord_precision: 'exact_campus',
        established_year: 1999,
        governing_body: 'Staffordshire University UK Partner Institute',
        statutory_decree: 'Private Academic Incorporation',
        website_url: 'https://apiit.lk',
        annual_student_enrollment: 3800,
        campus_acreage: 2.1,
        faculties_count: 3,
        hostel_available: 0,
        hospital_attached: 0,
        research_centers_count: 2,
        notes: 'City center campus in Colombo 02; premier private law school and computing faculty awarding Staffordshire University UK degrees.'
      },
      {
        inst_id: 'inst:icbt_campus',
        name_en: 'International College of Business and Technology (ICBT Campus)',
        name_si: 'අයිසීබීටී කැම්පස් (බම්බලපිටිය)',
        name_ta: 'ஐசிபிடி வளாகம்',
        inst_type: 'semi_state_private_degree',
        district_id: 'D_11',
        province_id: 'P_1',
        address_town: 'Duplication Road, Bambalapitiya, Colombo 04',
        latitude: 6.8910,
        longitude: 79.8560,
        coord_precision: 'exact_campus',
        established_year: 1999,
        governing_body: 'Cardiff Metropolitan / Birmingham City Partner',
        statutory_decree: 'Private Academic Incorporation',
        website_url: 'https://icbt.lk',
        annual_student_enrollment: 6500,
        campus_acreage: 2.5,
        faculties_count: 4,
        hostel_available: 0,
        hospital_attached: 0,
        research_centers_count: 2,
        notes: 'Widespread private campus with branches in Kandy, Galle, Matara, Nittambuwa, Kurunegala, and Jaffna.'
      },
      {
        inst_id: 'inst:acbt_campus',
        name_en: 'Australian College of Business and Technology (ACBT)',
        name_si: 'ඒසීබීටී කැම්පස් (කොළඹ 03)',
        name_ta: 'ஏசிபிடி வளாகம்',
        inst_type: 'semi_state_private_degree',
        district_id: 'D_11',
        province_id: 'P_1',
        address_town: 'Galle Road, Colombo 03',
        latitude: 6.9020,
        longitude: 79.8530,
        coord_precision: 'exact_campus',
        established_year: 1998,
        governing_body: 'Navitas Group / Deakin University Australia Partner',
        statutory_decree: 'Australian Education Transfer Institute',
        website_url: 'https://acbt.net',
        annual_student_enrollment: 2400,
        campus_acreage: 1.5,
        faculties_count: 2,
        hostel_available: 0,
        hospital_attached: 0,
        research_centers_count: 1,
        notes: 'Oldest Australian pathway college in Sri Lanka, offering direct 1+2 and 2+2 articulation to Deakin University in Melbourne.'
      },
      {
        inst_id: 'inst:bms_campus',
        name_en: 'Business Management School (BMS Campus)',
        name_si: 'බීඑම්එස් කැම්පස් (වැල්ලවත්ත)',
        name_ta: 'பிஎம்எஸ் வளாகம்',
        inst_type: 'semi_state_private_degree',
        district_id: 'D_11',
        province_id: 'P_1',
        address_town: 'Galle Road, Wellawatte, Colombo 06',
        latitude: 6.8770,
        longitude: 79.8590,
        coord_precision: 'exact_campus',
        established_year: 1999,
        governing_body: 'Northumbria University UK Partner',
        statutory_decree: 'Private Academic Incorporation',
        website_url: 'https://bms.ac.lk',
        annual_student_enrollment: 2800,
        campus_acreage: 1.8,
        faculties_count: 3,
        hostel_available: 0,
        hospital_attached: 0,
        research_centers_count: 2,
        notes: 'Premier biomedical science and biotechnology private institute in Colombo with state-of-the-art wet labs.'
      },
      {
        inst_id: 'inst:ric_colombo',
        name_en: 'Royal Institute of Colombo (RIC)',
        name_si: 'රෝයල් ඉන්ස්ටිටියුට් (හැව්ලොක් ටවුන්)',
        name_ta: 'ரோயல் நிறுவனம் (கொழும்பு)',
        inst_type: 'semi_state_private_degree',
        district_id: 'D_11',
        province_id: 'P_1',
        address_town: 'Havelock Road, Colombo 05',
        latitude: 6.8830,
        longitude: 79.8660,
        coord_precision: 'exact_campus',
        established_year: 1991,
        governing_body: 'University of London Recognized Teaching Centre',
        statutory_decree: 'Private Academic Incorporation',
        website_url: 'https://ric.lk',
        annual_student_enrollment: 1800,
        campus_acreage: 2.0,
        faculties_count: 2,
        hostel_available: 0,
        hospital_attached: 0,
        research_centers_count: 1,
        notes: 'Recognized teaching center for the University of London international programs with academic direction by the London School of Economics (LSE).'
      },
      {
        inst_id: 'inst:saegis_campus',
        name_en: 'Saegis Campus (Nugegoda)',
        name_si: 'සේගිස් කැම්පස් (නුගේගොඩ)',
        name_ta: 'சேகிஸ் வளாகம்',
        inst_type: 'semi_state_private_degree',
        district_id: 'D_11',
        province_id: 'P_1',
        address_town: 'High Level Road, Kohuwala, Nugegoda',
        latitude: 6.8640,
        longitude: 79.8920,
        coord_precision: 'exact_campus',
        established_year: 2013,
        governing_body: 'Ministry of Higher Education Specified Institute',
        statutory_decree: 'Universities Act No. 16 of 1978 Sec 25A Recognition',
        website_url: 'https://saegis.ac.lk',
        annual_student_enrollment: 2200,
        campus_acreage: 4.5,
        faculties_count: 3,
        hostel_available: 0,
        hospital_attached: 0,
        research_centers_count: 1,
        notes: 'MoHE approved non-state institute offering degrees in Business, IT, and Tourism.'
      },
      {
        inst_id: 'inst:esoft_metro',
        name_en: 'ESOFT Metro Campus (Colombo 04)',
        name_si: 'ඊසොෆ්ට් මෙට්‍රෝ කැම්පස්',
        name_ta: 'ஈசொப்ட் மெட்ரோ வளாகம்',
        inst_type: 'semi_state_private_degree',
        district_id: 'D_11',
        province_id: 'P_1',
        address_town: 'Galle Road, Bambalapitiya, Colombo 04',
        latitude: 6.8880,
        longitude: 79.8550,
        coord_precision: 'exact_campus',
        established_year: 2000,
        governing_body: 'Kingston University UK Partner / Pearson BTEC Apex Centre',
        statutory_decree: 'Private Academic Incorporation',
        website_url: 'https://esoft.lk',
        annual_student_enrollment: 8500,
        campus_acreage: 2.2,
        faculties_count: 3,
        hostel_available: 0,
        hospital_attached: 0,
        research_centers_count: 1,
        notes: 'Largest Pearson BTEC approved provider in Sri Lanka with 40+ branch centers island-wide.'
      },
      {
        inst_id: 'inst:nibm_colombo',
        name_en: 'National Institute of Business Management (NIBM Colombo)',
        name_si: 'ජාතික ව්‍යාපාර කළමනාකාරීත්ව ආයතනය (NIBM)',
        name_ta: 'தேசிய வணிக முகாமைத்துவ நிறுவனம்',
        inst_type: 'state_non_ugc_institute',
        district_id: 'D_11',
        province_id: 'P_1',
        address_town: 'Vidya Mawatha, Colombo 07',
        latitude: 6.9040,
        longitude: 79.8710,
        coord_precision: 'exact_campus',
        established_year: 1968,
        governing_body: 'Ministry of Education / State-Owned Statutory Body',
        statutory_decree: 'National Institute of Business Management Act No. 23 of 1976',
        website_url: 'https://nibm.lk',
        annual_student_enrollment: 9200,
        campus_acreage: 6.0,
        faculties_count: 4,
        hostel_available: 0,
        hospital_attached: 0,
        research_centers_count: 2,
        notes: 'State statutory institute operating since 1968; mother body of NSBM Green University; partners with Coventry University UK.'
      }
    ];

    for (const p of privateCampuses) {
      insertInst.run(
        p.inst_id,
        p.name_en,
        p.name_si,
        p.name_ta,
        p.inst_type,
        p.district_id,
        p.province_id,
        p.address_town,
        p.latitude,
        p.longitude,
        p.coord_precision,
        p.established_year,
        p.governing_body,
        p.statutory_decree,
        p.website_url,
        p.annual_student_enrollment,
        p.campus_acreage,
        p.faculties_count,
        p.hostel_available,
        p.hospital_attached,
        p.research_centers_count,
        p.notes
      );
    }
    console.log(`✅ Seeded ${privateCampuses.length} Urban Private & TNE Campuses.`);

    // -------------------------------------------------------------
    // 2. HIGHER EDUCATION PHYSICAL FACILITIES
    // -------------------------------------------------------------
    const insertFac = db.prepare(`
      INSERT OR REPLACE INTO higher_ed_facilities (
        facility_id, inst_id, facility_type, name_en, name_si,
        capacity_units, features_json, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const facilities = [
      {
        facility_id: 'fac:cmb_main_lib',
        inst_id: 'uni:colombo',
        facility_type: 'library_system',
        name_en: 'University of Colombo Main Library System',
        name_si: 'කොළඹ විශ්වවිද්‍යාලයීය ප්‍රධාන පුස්තකාලය',
        capacity_units: 1400,
        features_json: JSON.stringify(['150,000 volumes', 'IEEE/JSTOR Digital Archives', 'Air-conditioned reading halls', 'Ceylon Room Special Collections']),
        notes: 'Historic research collection containing rare colonial government reports and legal manuscripts.'
      },
      {
        facility_id: 'fac:uom_hpc_center',
        inst_id: 'uni:moratuwa',
        facility_type: 'research_center',
        name_en: 'UoM High-Performance Computing & AI Research Center',
        name_si: 'මොරටුව සුපිරි පරිගණක සහ කෘත්‍රිම බුද්ධි පර්යේෂණ මධ්‍යස්ථානය',
        capacity_units: 300,
        features_json: JSON.stringify(['GPU Cluster', 'Fiber gigabit interconnect', '24/7 dedicated cooling', 'Enterprise AI testbed']),
        notes: 'National apex computing laboratory conducting deep learning and natural language processing research.'
      },
      {
        facility_id: 'fac:pdn_teaching_hospital',
        inst_id: 'uni:peradeniya',
        facility_type: 'hospital_clinical_wing',
        name_en: 'Peradeniya Teaching Hospital & Dental Hospital Complex',
        name_si: 'පේරාදෙණිය ශික්ෂණ රෝහල සහ දන්ත රෝහල් සංකීර්ණය',
        capacity_units: 1200,
        features_json: JSON.stringify(['1,200 inpatient beds', 'Only Oral Maxillofacial Surgery Institute in Sri Lanka', '10 Operating Theatres']),
        notes: 'Primary clinical training grounds for medical and dental undergraduates.'
      },
      {
        facility_id: 'fac:sliit_computing_block',
        inst_id: 'inst:sliit',
        facility_type: 'technology_incubator',
        name_en: 'SLIIT Malabe Computing & Engineering Complex',
        name_si: 'ස්ලිට් පරිගණක හා ඉංජිනේරු විද්‍යාගාර සංකීර්ණය',
        capacity_units: 3500,
        features_json: JSON.stringify(['65 Computer Labs', 'Robotics Testing Track', 'Cisco Networking Academies', 'Software Testing Center']),
        notes: 'Largest purpose-built non-state IT complex in South Asia.'
      },
      {
        facility_id: 'fac:nsbm_recreation_complex',
        inst_id: 'inst:nsbm',
        facility_type: 'sports_complex',
        name_en: 'NSBM Green Lake Amphitheatre & Sports Complex',
        name_si: 'NSBM හරිත විශ්වවිද්‍යාල ක්‍රීඩා සංකීර්ණය',
        capacity_units: 2500,
        features_json: JSON.stringify(['Olympic-standard swimming pool', 'Gymnasium', 'Open-air theatre', 'Hostels for 1,200 students']),
        notes: '35-acre self-contained green eco-campus setting.'
      },
      {
        facility_id: 'fac:kdu_university_hospital',
        inst_id: 'inst:kdu',
        facility_type: 'hospital_clinical_wing',
        name_en: 'University Hospital KDU (UHKDU Werahera)',
        name_si: 'කොතලාවල ආරක්ෂක විශ්වවිද්‍යාල ශික්ෂණ රෝහල',
        capacity_units: 814,
        features_json: JSON.stringify(['814 beds', '20 modular operating theatres', 'State-of-the-art MRI/CT suites', 'Bone marrow transplant unit']),
        notes: 'Quaternary-care university hospital constructed under a USD 200M concessional facility.'
      },
      {
        facility_id: 'fac:cgtti_precision_workshop',
        inst_id: 'inst:cgtti_moratuwa',
        facility_type: 'technology_incubator',
        name_en: 'German Tech Central Automobile & Precision Engineering Workshop',
        name_si: 'ජර්මන් ටෙක් ප්‍රධාන කාර්මික වැඩපොළ',
        capacity_units: 600,
        features_json: JSON.stringify(['Bosch electronic fuel testing', 'CNC 5-axis milling', 'Heavy diesel test bays', 'Metallurgy testing lab']),
        notes: 'Donated and maintained under continuous German bilateral technical cooperation agreements.'
      }
    ];

    for (const f of facilities) {
      insertFac.run(
        f.facility_id,
        f.inst_id,
        f.facility_type,
        f.name_en,
        f.name_si,
        f.capacity_units,
        f.features_json,
        f.notes
      );
    }
    console.log(`✅ Seeded ${facilities.length} physical higher education facilities.`);

    // -------------------------------------------------------------
    // 3. TNE FOREIGN PARTNER UNIVERSITIES
    // -------------------------------------------------------------
    const insertPartner = db.prepare(`
      INSERT OR REPLACE INTO tne_foreign_partners (
        partner_id, university_name, country, global_rank_band, official_portal, notes
      ) VALUES (?, ?, ?, ?, ?, ?)
    `);

    const partners = [
      {
        partner_id: 'tne:uni_westminster',
        university_name: 'University of Westminster',
        country: 'United Kingdom',
        global_rank_band: 'QS Top 700 / UK Top 50 Computer Science',
        official_portal: 'https://www.westminster.ac.uk',
        notes: 'Pioneer transnational education partner in Sri Lanka with IIT since 1990; direct external quality audit by QAA UK.'
      },
      {
        partner_id: 'tne:curtin_uni',
        university_name: 'Curtin University',
        country: 'Australia',
        global_rank_band: 'QS World Top 175 / Top 1% Global',
        official_portal: 'https://www.curtin.edu.au',
        notes: 'Western Australia apex research university; partners with SLIIT for engineering and computing degree transfers.'
      },
      {
        partner_id: 'tne:plymouth_uni',
        university_name: 'University of Plymouth',
        country: 'United Kingdom',
        global_rank_band: 'THE World Top 400',
        official_portal: 'https://www.plymouth.ac.uk',
        notes: 'Premier UK coastal university partner with NSBM Green University for business, computing, and psychology degrees.'
      },
      {
        partner_id: 'tne:staffordshire_uni',
        university_name: 'Staffordshire University',
        country: 'United Kingdom',
        global_rank_band: 'UK Top 10 for Game Design & Teaching Quality',
        official_portal: 'https://www.staffs.ac.uk',
        notes: 'Exclusive degree awarding partner for APIIT Colombo across Law, Computing, and Business Management.'
      },
      {
        partner_id: 'tne:deakin_uni',
        university_name: 'Deakin University',
        country: 'Australia',
        global_rank_band: 'QS World Top 200',
        official_portal: 'https://www.deakin.edu.au',
        notes: 'Victoria premier university with high international student satisfaction; 1+2 and 2+2 transfer pipeline with ACBT.'
      },
      {
        partner_id: 'tne:edith_cowan_uni',
        university_name: 'Edith Cowan University (ECU)',
        country: 'Australia',
        global_rank_band: 'THE Top 100 Young Universities',
        official_portal: 'https://www.ecu.edu.au',
        notes: 'Established ECU Sri Lanka campus in Colombo with direct Australian degree conferment in Cyber Security and Engineering.'
      },
      {
        partner_id: 'tne:uni_london',
        university_name: 'University of London',
        country: 'United Kingdom',
        global_rank_band: 'World Historic Top Tier (LSE, UCL, King\'s)',
        official_portal: 'https://www.london.ac.uk',
        notes: 'Federation university founded in 1836; conducts international exams through Royal Institute of Colombo (RIC).'
      },
      {
        partner_id: 'tne:coventry_uni',
        university_name: 'Coventry University',
        country: 'United Kingdom',
        global_rank_band: 'THE Top 500 / QS 5 Stars',
        official_portal: 'https://www.coventry.ac.uk',
        notes: 'Awarding partner for NIBM Colombo across Business, Logistics, and Graphic Design.'
      },
      {
        partner_id: 'tne:northumbria_uni',
        university_name: 'Northumbria University',
        country: 'United Kingdom',
        global_rank_band: 'Times Higher Education UK University of the Year 2022',
        official_portal: 'https://www.northumbria.ac.uk',
        notes: 'Newcastle upon Tyne based university partner with BMS Colombo for Biomedical Science.'
      }
    ];

    for (const pr of partners) {
      insertPartner.run(
        pr.partner_id,
        pr.university_name,
        pr.country,
        pr.global_rank_band,
        pr.official_portal,
        pr.notes
      );
    }
    console.log(`✅ Seeded ${partners.length} TNE foreign partner universities.`);

    // -------------------------------------------------------------
    // 4. TNE DEGREE FUNNEL (TRANSNATIONAL RECRUITMENT & TRANSFER PATHWAYS)
    // -------------------------------------------------------------
    const insertFunnel = db.prepare(`
      INSERT OR REPLACE INTO tne_degree_funnel (
        funnel_id, local_inst_id, foreign_partner_id, program_name, award_model,
        awarding_body_location, local_cost_lkr, foreign_cost_estimate_usd,
        post_study_work_rights, recruitment_channel_type, visa_success_rate_band, strategic_advisory
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const funnels = [
      {
        funnel_id: 'funnel:iit_westminster_se',
        local_inst_id: 'inst:iit_colombo',
        foreign_partner_id: 'tne:uni_westminster',
        program_name: 'BEng (Hons) Software Engineering (4 Years in Colombo)',
        award_model: '4_year_internal_franchise',
        awarding_body_location: 'London, United Kingdom',
        local_cost_lkr: 2850000,
        foreign_cost_estimate_usd: 0,
        post_study_work_rights: 'Eligible for direct UK Global Talent / Skilled Worker visa post-graduation',
        recruitment_channel_type: 'direct_campus_enrollment',
        visa_success_rate_band: 'high_90_plus',
        strategic_advisory: 'Includes mandatory 3rd year full-time paid internship at leading Colombo tech companies (Virtusa, WSO2, LSEG). 100% employment rate before graduation.'
      },
      {
        funnel_id: 'funnel:sliit_curtin_eng_2plus2',
        local_inst_id: 'inst:sliit',
        foreign_partner_id: 'tne:curtin_uni',
        program_name: 'Bachelor of Engineering (Hons) Mechatronics (2+2 Transfer to Perth)',
        award_model: '2_plus_2_transfer',
        awarding_body_location: 'Perth, Western Australia',
        local_cost_lkr: 1600000,
        foreign_cost_estimate_usd: 52000,
        post_study_work_rights: 'Australia Subclass 485 Post-Study Work Visa (3 to 4 years in Western Australia regional)',
        recruitment_channel_type: 'study_abroad_agency_pipeline',
        visa_success_rate_band: 'high_90_plus',
        strategic_advisory: 'Saves approx. AUD 80,000 in tuition and living costs by completing the first two foundational years in Malabe before transferring to Curtin Perth campus.'
      },
      {
        funnel_id: 'funnel:nsbm_plymouth_bm',
        local_inst_id: 'inst:nsbm',
        foreign_partner_id: 'tne:plymouth_uni',
        program_name: 'BSc (Hons) Business Management (Internal Franchise)',
        award_model: '4_year_internal_franchise',
        awarding_body_location: 'Devon, United Kingdom',
        local_cost_lkr: 2100000,
        foreign_cost_estimate_usd: 0,
        post_study_work_rights: 'UK Graduate Route (if transferred for final year)',
        recruitment_channel_type: 'direct_campus_enrollment',
        visa_success_rate_band: 'high_90_plus',
        strategic_advisory: 'Eligible for MoHE Interest-Free Student Loan Scheme (IFSLS). Degree certificate issued directly by University of Plymouth with no mention of off-shore campus.'
      },
      {
        funnel_id: 'funnel:apiit_staffordshire_law',
        local_inst_id: 'inst:apiit_colombo',
        foreign_partner_id: 'tne:staffordshire_uni',
        program_name: 'LL.B (Hons) Law (3 Years Internal Degree)',
        award_model: '4_year_internal_franchise',
        awarding_body_location: 'Stoke-on-Trent, United Kingdom',
        local_cost_lkr: 2450000,
        foreign_cost_estimate_usd: 0,
        post_study_work_rights: 'UK SQE Solicitor / Bar Course eligibility',
        recruitment_channel_type: 'direct_campus_enrollment',
        visa_success_rate_band: 'high_90_plus',
        strategic_advisory: 'Directly qualifying law degree for the Sri Lanka Law College Special Entrance Examination for Foreign Law Graduates.'
      },
      {
        funnel_id: 'funnel:acbt_deakin_commerce_1plus2',
        local_inst_id: 'inst:acbt_campus',
        foreign_partner_id: 'tne:deakin_uni',
        program_name: 'Bachelor of Commerce / Business Analytics (1+2 Transfer to Melbourne)',
        award_model: '1_plus_2_transfer',
        awarding_body_location: 'Melbourne, Victoria, Australia',
        local_cost_lkr: 980000,
        foreign_cost_estimate_usd: 48000,
        post_study_work_rights: 'Australia Subclass 485 Graduate Visa (2 to 3 years)',
        recruitment_channel_type: 'study_abroad_agency_pipeline',
        visa_success_rate_band: 'moderate_75_90',
        strategic_advisory: 'Requires Genuine Student (GS) assessment and proof of AUD 30,000+ living funds for Australian high commission visa lodgement.'
      },
      {
        funnel_id: 'funnel:bms_northumbria_biomed',
        local_inst_id: 'inst:bms_campus',
        foreign_partner_id: 'tne:northumbria_uni',
        program_name: 'BSc (Hons) Biomedical Science (IBMS Accredited)',
        award_model: '4_year_internal_franchise',
        awarding_body_location: 'Newcastle upon Tyne, United Kingdom',
        local_cost_lkr: 2350000,
        foreign_cost_estimate_usd: 0,
        post_study_work_rights: 'HCPC Registration pathway in UK NHS hospitals',
        recruitment_channel_type: 'direct_campus_enrollment',
        visa_success_rate_band: 'high_90_plus',
        strategic_advisory: 'Accredited by the Institute of Biomedical Science (IBMS) UK. Enables graduates to register with the Health and Care Professions Council (HCPC) to work in UK NHS laboratories.'
      },
      {
        funnel_id: 'funnel:ric_london_lse_econ',
        local_inst_id: 'inst:ric_colombo',
        foreign_partner_id: 'tne:uni_london',
        program_name: 'BSc (Hons) Economics & Management (LSE Academic Direction)',
        award_model: '4_year_internal_franchise',
        awarding_body_location: 'London, United Kingdom',
        local_cost_lkr: 2900000,
        foreign_cost_estimate_usd: 0,
        post_study_work_rights: 'Global Ivy League postgraduate admission track record',
        recruitment_channel_type: 'direct_campus_enrollment',
        visa_success_rate_band: 'high_90_plus',
        strategic_advisory: 'Curriculum, assessments, and examination grading set exclusively by London School of Economics (LSE) faculty.'
      },
      {
        funnel_id: 'funnel:nibm_coventry_logistics',
        local_inst_id: 'inst:nibm_colombo',
        foreign_partner_id: 'tne:coventry_uni',
        program_name: 'BSc (Hons) International Logistics & Supply Chain Management',
        award_model: '4_year_internal_franchise',
        awarding_body_location: 'Coventry, United Kingdom',
        local_cost_lkr: 1450000,
        foreign_cost_estimate_usd: 0,
        post_study_work_rights: 'CILT Chartered Membership',
        recruitment_channel_type: 'direct_campus_enrollment',
        visa_success_rate_band: 'high_90_plus',
        strategic_advisory: 'State statutory institute backing ensures low fee structure (under Rs. 1.5M for British degree). Fully accredited by Chartered Institute of Logistics and Transport (CILT).'
      }
    ];

    for (const fn of funnels) {
      insertFunnel.run(
        fn.funnel_id,
        fn.local_inst_id,
        fn.foreign_partner_id,
        fn.program_name,
        fn.award_model,
        fn.awarding_body_location,
        fn.local_cost_lkr,
        fn.foreign_cost_estimate_usd,
        fn.post_study_work_rights,
        fn.recruitment_channel_type,
        fn.visa_success_rate_band,
        fn.strategic_advisory
      );
    }
    console.log(`✅ Seeded ${funnels.length} TNE degree funnel pathways.`);

    // -------------------------------------------------------------
    // 5. HIGHER EDUCATION SCHOLARSHIPS & FINANCIAL AID LEDGER
    // -------------------------------------------------------------
    const insertSch = db.prepare(`
      INSERT OR REPLACE INTO higher_ed_scholarships (
        scholarship_id, title_en, title_si, title_ta, funding_tier, academic_level,
        awarding_entity, coverage_scope, approx_annual_value_lkr, eligible_destinations,
        eligibility_criteria, annual_quota_slots, application_window, official_portal_url,
        selection_model, strategic_advisory
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const scholarships = [
      {
        scholarship_id: 'sch:mahapola_higher_ed',
        title_en: 'Mahapola Higher Education Scholarship (Merit & Ordinary Bursaries)',
        title_si: 'මහපොළ උසස් අධ්‍යාපන ශිෂ්‍යත්වය',
        title_ta: 'மகாபொல உயர்கல்வி புலமைப்பரிசில்',
        funding_tier: 'state_statutory_national',
        academic_level: 'bachelors',
        awarding_entity: 'Mahapola Higher Education Scholarship Trust Fund',
        coverage_scope: 'monthly_living_stipend',
        approx_annual_value_lkr: 60000,
        eligible_destinations: 'Sri Lanka (17 State Universities)',
        eligibility_criteria: 'Admitted to a State UGC University. Merit awards based on district Z-score; ordinary bursary based on family annual income threshold (under Rs. 500,000/yr).',
        annual_quota_slots: 16500,
        application_window: 'Automatic assessment following UGC university admission registration',
        official_portal_url: 'https://www.mahapola.gov.lk',
        selection_model: 'merit_zscore',
        strategic_advisory: 'Disburses Rs. 5,000 to Rs. 5,500 monthly across 10 installments per academic year. The financial lifeblood for rural students residing in university boarding hostels.'
      },
      {
        scholarship_id: 'sch:presidents_fund_uni',
        title_en: 'President\'s Fund Undergraduate Scholarship Scheme',
        title_si: 'ජනාධිපති අරමුදල විශ්වවිද්‍යාල ශිෂ්‍යත්ව',
        title_ta: 'ஜனாதிபதி நிதியப் புலமைப்பரிசில்',
        funding_tier: 'state_statutory_national',
        academic_level: 'bachelors',
        awarding_entity: 'President\'s Fund Sri Lanka',
        coverage_scope: 'monthly_living_stipend',
        approx_annual_value_lkr: 72000,
        eligible_destinations: 'Sri Lanka (State Universities)',
        eligibility_criteria: 'Undergraduates from low-income families whose monthly household income is below statutory limit; verified by Divisional Secretariat Grama Niladhari.',
        annual_quota_slots: 6000,
        application_window: 'January – March annually via University Student Welfare Divisions',
        official_portal_url: 'https://www.presidentsfund.gov.lk',
        selection_model: 'means_tested_financial_need',
        strategic_advisory: 'Provides Rs. 6,000 monthly allowance for the full duration of the undergraduate degree program, supplementary to non-Mahapola recipients.'
      },
      {
        scholarship_id: 'sch:mohe_ifsls_loan',
        title_en: 'Ministry of Education Interest-Free Student Loan Scheme (IFSLS)',
        title_si: 'පොලී රහිත ශිෂ්‍ය ණය යෝජනා ක්‍රමය (IFSLS)',
        title_ta: 'வட்டியற்ற மாணவர் கடன் திட்டம்',
        funding_tier: 'state_statutory_national',
        academic_level: 'bachelors',
        awarding_entity: 'Ministry of Education (Higher Education Division)',
        coverage_scope: 'tuition_loan_interest_free',
        approx_annual_value_lkr: 300000,
        eligible_destinations: 'Sri Lanka (Non-State Degree Awarding Institutes: SLIIT, NSBM, Horizon, CINEC, SLTC, KIU, ICBT)',
        eligibility_criteria: 'Passed G.C.E. A/L within the past 3 consecutive examination years with minimum 3 simple passes (S) but unadmitted to state universities. Age under 26.',
        annual_quota_slots: 5000,
        application_window: 'May – July annually following G.C.E. A/L official results',
        official_portal_url: 'https://studentloans.mohe.gov.lk',
        selection_model: 'merit_zscore',
        strategic_advisory: 'Government covers 100% of interest charges during study period + 1-year grace period. Student repays only the principal amount over 7 to 8 years post-graduation through BOC/People\'s Bank.'
      },
      {
        scholarship_id: 'sch:chevening_uk',
        title_en: 'Chevening Scholarships (UK Foreign, Commonwealth & Development Office)',
        title_si: 'චෙව්නින් ශිෂ්‍යත්වය (එක්සත් රාජධානිය)',
        title_ta: 'செவனிங் புலமைப்பரிசில் (ஐக்கிய இராச்சியம்)',
        funding_tier: 'bilateral_foreign_government',
        academic_level: 'masters',
        awarding_entity: 'British High Commission Colombo / UK FCDO',
        coverage_scope: '100_percent_full_ride_and_stipend',
        approx_annual_value_lkr: 14000000,
        eligible_destinations: 'United Kingdom (Any UK University)',
        eligibility_criteria: 'Sri Lankan citizen, recognized undergraduate degree (upper second class), minimum 2 years of work experience (2,800 hours), proven leadership potential, return home for 2 years post-study.',
        annual_quota_slots: 20,
        application_window: 'August – November annually',
        official_portal_url: 'https://www.chevening.org/scholarship/sri-lanka/',
        selection_model: 'competitive_interview_exam',
        strategic_advisory: 'Covers 100% UK university tuition, monthly living stipend (approx. GBP 1,400/mo), return economy airfare, visa fees, and travel grants. Highly prestigious leadership award.'
      },
      {
        scholarship_id: 'sch:commonwealth_postgrad',
        title_en: 'Commonwealth Master\'s and PhD Scholarships',
        title_si: 'පොදුරාජ්‍ය මණ්ඩලීය පශ්චාද් උපාධි ශිෂ්‍යත්වය',
        title_ta: 'பொதுநலவாய புலமைப்பரிசில்',
        funding_tier: 'bilateral_foreign_government',
        academic_level: 'bachelors_and_masters',
        awarding_entity: 'Commonwealth Scholarship Commission (CSC UK) / MoHE Sri Lanka Nominating Agency',
        coverage_scope: '100_percent_full_ride_and_stipend',
        approx_annual_value_lkr: 16000000,
        eligible_destinations: 'United Kingdom / Canada / New Zealand',
        eligibility_criteria: 'First Class or Upper Second undergraduate degree from a recognized university. Nominated by Ministry of Education Sri Lanka or direct university application.',
        annual_quota_slots: 25,
        application_window: 'September – November annually',
        official_portal_url: 'https://cscuk.fcdo.gov.uk',
        selection_model: 'diplomatic_bilateral_nomination',
        strategic_advisory: 'Fully covers full tuition, return airfares, spouse/family allowances for PhD candidates, and warm clothing grant.'
      },
      {
        scholarship_id: 'sch:fulbright_usa',
        title_en: 'Fulbright Foreign Student Program (United States)',
        title_si: 'ෆුල්බ්‍රයිට් ශිෂ්‍යත්ව වැඩසටහන (ඇමරිකා එක්සත් ජනපදය)',
        title_ta: 'புல்பிரைட் புலமைப்பரிசில் (அமெரிக்கா)',
        funding_tier: 'bilateral_foreign_government',
        academic_level: 'masters',
        awarding_entity: 'United States-Sri Lanka Fulbright Commission (US-SLFC)',
        coverage_scope: '100_percent_full_ride_and_stipend',
        approx_annual_value_lkr: 22000000,
        eligible_destinations: 'United States (US Universities)',
        eligibility_criteria: 'Sri Lankan citizen, Bachelor\'s degree with high academic standing, minimum 2 years relevant professional work experience, GRE/TOEFL requirements.',
        annual_quota_slots: 10,
        application_window: 'February – May annually',
        official_portal_url: 'https://www.fulbrightsrilanka.org',
        selection_model: 'competitive_interview_exam',
        strategic_advisory: 'Full financial support for 2-year Master\'s degree in the USA. Requires J-1 exchange visa with mandatory 2-year home-country physical presence requirement.'
      },
      {
        scholarship_id: 'sch:australia_awards',
        title_en: 'Australia Awards Scholarships',
        title_si: 'ඕස්ට්‍රේලියානු රජයේ ශිෂ්‍යත්ව',
        title_ta: 'அவுஸ்திரேலியா விருதுகள்',
        funding_tier: 'bilateral_foreign_government',
        academic_level: 'masters',
        awarding_entity: 'Department of Foreign Affairs and Trade (DFAT Australia)',
        coverage_scope: '100_percent_full_ride_and_stipend',
        approx_annual_value_lkr: 18000000,
        eligible_destinations: 'Australia (Australian Universities)',
        eligibility_criteria: 'Sri Lankan citizen working in public sector, civil society, or private sector in development priority areas (Climate, Maritime, Governance, Economic Recovery).',
        annual_quota_slots: 35,
        application_window: 'February – April annually',
        official_portal_url: 'https://www.australiaawardssrilanka.org',
        selection_model: 'competitive_interview_exam',
        strategic_advisory: '100% tuition, return economy airfares, establishment allowance (AUD 5,000), overseas student health cover (OSHC), and fortnightly contribution to living expenses (CLE).'
      },
      {
        scholarship_id: 'sch:japanese_mext',
        title_en: 'Japanese Government (MEXT) Scholarships (Undergraduate & Research)',
        title_si: 'ජපන් රජයේ MEXT ශිෂ්‍යත්වය',
        title_ta: 'ஜப்பான் அரசாங்க MEXT புலமைப்பரிசில்',
        funding_tier: 'bilateral_foreign_government',
        academic_level: 'all_levels',
        awarding_entity: 'Embassy of Japan in Sri Lanka / Ministry of Education, Culture, Sports, Science and Technology (MEXT)',
        coverage_scope: '100_percent_full_ride_and_stipend',
        approx_annual_value_lkr: 8500000,
        eligible_destinations: 'Japan (National Universities in Japan)',
        eligibility_criteria: 'Undergraduate: G.C.E. A/L with distinction in Math/Science, age 17-25. Postgraduate: Bachelor\'s degree, age under 35. Written exams in English and Japanese/Math.',
        annual_quota_slots: 40,
        application_window: 'May – June annually via Embassy of Japan Colombo',
        official_portal_url: 'https://www.lk.emb-japan.go.jp',
        selection_model: 'competitive_interview_exam',
        strategic_advisory: 'Includes 1-year intensive Japanese language training at Tokyo University of Foreign Studies or Osaka University before 4-year degree entry. Monthly stipend JPY 117,000 - 145,000.'
      },
      {
        scholarship_id: 'sch:chinese_csc',
        title_en: 'Chinese Government Scholarship (CSC - Bilateral Quota)',
        title_si: 'චීන රජයේ ශිෂ්‍යත්ව වැඩසටහන (CSC)',
        title_ta: 'சீன அரசாங்க புலமைப்பரிசில்',
        funding_tier: 'bilateral_foreign_government',
        academic_level: 'all_levels',
        awarding_entity: 'China Scholarship Council / Ministry of Education Sri Lanka',
        coverage_scope: '100_percent_full_ride_and_stipend',
        approx_annual_value_lkr: 5500000,
        eligible_destinations: 'China (Tsinghua, Peking, Zhejiang, Fudan, BIT)',
        eligibility_criteria: 'Sri Lankan citizen, nominated by Ministry of Education Sri Lanka. Good health, under 25 for Bachelors, under 35 for Masters, under 40 for PhD.',
        annual_quota_slots: 50,
        application_window: 'December – February annually',
        official_portal_url: 'https://www.campuschina.org',
        selection_model: 'diplomatic_bilateral_nomination',
        strategic_advisory: 'Full tuition waiver, free university accommodation, comprehensive medical insurance, and monthly stipend (RMB 2,500 for UG, RMB 3,000 for Masters, RMB 3,500 for PhD).'
      },
      {
        scholarship_id: 'sch:indian_iccr',
        title_en: 'Indian Council for Cultural Relations (ICCR) Scholarships',
        title_si: 'ඉන්දියානු රජයේ ICCR ශිෂ්‍යත්ව',
        title_ta: 'இந்திய அரசாங்க ICCR புலமைப்பரிசில்',
        funding_tier: 'bilateral_foreign_government',
        academic_level: 'all_levels',
        awarding_entity: 'High Commission of India Colombo / ICCR New Delhi',
        coverage_scope: '100_percent_full_ride_and_stipend',
        approx_annual_value_lkr: 4200000,
        eligible_destinations: 'India (IITs, NITs, Delhi University, Anna University)',
        eligibility_criteria: 'Sri Lankan citizen, minimum 60% marks in G.C.E. A/L or Bachelor\'s degree. Covers Engineering, Agriculture, Sciences, Humanities (excluding Medicine/Dentistry).',
        annual_quota_slots: 120,
        application_window: 'January – April annually via A2A Portal',
        official_portal_url: 'https://a2ascholarships.iccr.gov.in',
        selection_model: 'merit_zscore',
        strategic_advisory: 'Largest bilateral quota for Sri Lankan students (over 100 scholarships annually). Includes tuition, hostel accommodation, annual book allowance, and living stipend.'
      },
      {
        scholarship_id: 'sch:cuban_medical',
        title_en: 'Cuban Government Bilateral Medical Scholarship (MBBS)',
        title_si: 'කියුබානු රජයේ වෛද්‍ය ශිෂ්‍යත්වය',
        title_ta: 'கியூபா அரசாங்க மருத்துவ புலமைப்பரிசில்',
        funding_tier: 'bilateral_foreign_government',
        academic_level: 'bachelors',
        awarding_entity: 'Government of Cuba / Ministry of Health & MoHE Sri Lanka',
        coverage_scope: '100_percent_full_ride_and_stipend',
        approx_annual_value_lkr: 6000000,
        eligible_destinations: 'Cuba (ELAM - Escuela Latinoamericana de Medicina, Havana)',
        eligibility_criteria: 'Outstanding results in G.C.E. A/L Biological Science stream. Nominated by Ministry of Education on merit order. Commitment to learn Spanish.',
        annual_quota_slots: 3,
        application_window: 'Annually gazetted by Ministry of Education',
        official_portal_url: 'https://www.mohe.gov.lk',
        selection_model: 'merit_zscore',
        strategic_advisory: '6-year full medical degree program in Havana with Spanish language preparatory year. Recognized by Sri Lanka Medical Council (SLMC) subject to ERP/ACT 16 exam.'
      },
      {
        scholarship_id: 'sch:iit_virtusa_industrial',
        title_en: 'IIT / Virtusa / WSO2 Corporate Industrial Sponsorship Scheme',
        title_si: 'IIT සහ වර්චුසා ආයතනික ශිෂ්‍යත්ව ක්‍රමය',
        title_ta: 'IIT / வேர்டுசா தொழிற்துறை புலமைப்பரிசில்',
        funding_tier: 'corporate_industrial_sponsorship',
        academic_level: 'bachelors',
        awarding_entity: 'Informatics Institute of Technology (IIT) in partnership with Virtusa & WSO2',
        coverage_scope: 'full_tuition_waiver',
        approx_annual_value_lkr: 950000,
        eligible_destinations: 'Sri Lanka (IIT Colombo - Westminster Degree)',
        eligibility_criteria: 'Top performers in IIT coding aptitude test and technical interviews following G.C.E. A/L Maths or Technology streams. Commits to 4-year dual work-study model.',
        annual_quota_slots: 50,
        application_window: 'October – January annually',
        official_portal_url: 'https://www.iit.ac.lk',
        selection_model: 'industry_coding_test',
        strategic_advisory: 'Sponsors 100% of University of Westminster tuition fees while students work 3-4 days weekly at Virtusa/WSO2 earning a monthly salary throughout the 4 years.'
      },
      {
        scholarship_id: 'sch:nrc_nsf_research_grants',
        title_en: 'NSF / National Research Council (NRC) Postgraduate Research Assistantships',
        title_si: 'ජාතික පර්යේෂණ සභාවේ පශ්චාද් උපාධි පර්යේෂණ දීමනා',
        title_ta: 'தேசிய ஆராய்ச்சி ஆணைக்குழு புலமைப்பரிசில்',
        funding_tier: 'state_statutory_national',
        academic_level: 'phd',
        awarding_entity: 'National Research Council (NRC) / National Science Foundation (NSF)',
        coverage_scope: 'monthly_living_stipend',
        approx_annual_value_lkr: 1080000,
        eligible_destinations: 'Sri Lanka (State Universities & Research Institutes: NIFS, ITI, SLINTEC)',
        eligibility_criteria: 'Full-time MPhil/PhD candidate enrolled at a Sri Lankan university attached to an approved investigator grant.',
        annual_quota_slots: 80,
        application_window: 'Bi-annual grant call',
        official_portal_url: 'https://www.nrc.gov.lk',
        selection_model: 'competitive_interview_exam',
        strategic_advisory: 'Provides full-time monthly research fellowship of LKR 60,000 to 90,000 for graduate students working on national priority research projects.'
      }
    ];

    for (const sc of scholarships) {
      insertSch.run(
        sc.scholarship_id,
        sc.title_en,
        sc.title_si,
        sc.title_ta,
        sc.funding_tier,
        sc.academic_level,
        sc.awarding_entity,
        sc.coverage_scope,
        sc.approx_annual_value_lkr,
        sc.eligible_destinations,
        sc.eligibility_criteria,
        sc.annual_quota_slots,
        sc.application_window,
        sc.official_portal_url,
        sc.selection_model,
        sc.strategic_advisory
      );
    }
    console.log(`✅ Seeded ${scholarships.length} Higher Education & Postgraduate scholarships.`);

    // -------------------------------------------------------------
    // 6. HIGHER EDUCATION GOVERNANCE (PEOPLE & ROLES)
    // -------------------------------------------------------------
    const insertPerson = db.prepare(`
      INSERT OR REPLACE INTO people (
        person_id, canonical_name, canonical_name_si, honors_prefix, qualifications_json, biographical_notes
      ) VALUES (?, ?, ?, ?, ?, ?)
    `);

    const insertOccupancy = db.prepare(`
      INSERT OR REPLACE INTO role_occupancies (
        occupancy_id, person_id, role_code, entity_id, valid_from, valid_to, tenure_status, appointment_type, official_memo
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // Ensure university entities exist in entities table
    const insertEntity = db.prepare(`
      INSERT OR REPLACE INTO entities (
        entity_id, entity_type, canonical_name, canonical_name_si, sector, metadata_json
      ) VALUES (?, ?, ?, ?, ?, ?)
    `);

    const leadership = [
      {
        person_id: 'person:prof_hd_karunaratne',
        name: 'H. D. Karunaratne',
        name_si: 'එච්. ඩී. කරුණාරත්න',
        prefix: 'Senior Prof.',
        qual: JSON.stringify(['BA (Hons)', 'MA (Econ)', 'PhD (Nagoya)']),
        bio: 'Senior Professor of Business Economics; Vice Chancellor of the University of Colombo.',
        inst_id: 'uni:colombo',
        inst_name: 'University of Colombo',
        role_code: 'vice_chancellor',
        valid_from: '2022-04-12',
        tenure: 'confirmed'
      },
      {
        person_id: 'person:prof_md_lamawansa',
        name: 'M. D. Lamawansa',
        name_si: 'එම්. ඩී. ළමාවංශ',
        prefix: 'Prof.',
        qual: JSON.stringify(['MBBS (Peradeniya)', 'MS', 'FRCS (Edin)']),
        bio: 'Professor of Surgery; Pioneer kidney transplant surgeon; Vice Chancellor of the University of Peradeniya.',
        inst_id: 'uni:peradeniya',
        inst_name: 'University of Peradeniya',
        role_code: 'vice_chancellor',
        valid_from: '2021-08-01',
        tenure: 'confirmed'
      },
      {
        person_id: 'person:prof_niranjan_gunawardena',
        name: 'N. D. Gunawardena',
        name_si: 'එන්. ඩී. ගුණවර්ධන',
        prefix: 'Prof.',
        qual: JSON.stringify(['BSc Eng (Hons) (Moratuwa)', 'MEng', 'PhD (Muroran)']),
        bio: 'Senior Professor in Civil Engineering; Vice Chancellor of the University of Moratuwa.',
        inst_id: 'uni:moratuwa',
        inst_name: 'University of Moratuwa',
        role_code: 'vice_chancellor',
        valid_from: '2020-11-28',
        tenure: 'confirmed'
      },
      {
        person_id: 'person:prof_lalith_gamage',
        name: 'Lalith B. Gamage',
        name_si: 'ලලිත් බී. ගමගේ',
        prefix: 'Prof.',
        qual: JSON.stringify(['BSc Eng (Moratuwa)', 'MSc (Leicester)', 'PhD (UBC)', 'FIE(SL)']),
        bio: 'Founding CEO and Vice Chancellor of SLIIT; former Chairman of Moratuwa University and Vocational Training Authority.',
        inst_id: 'inst:sliit',
        inst_name: 'Sri Lanka Institute of Information Technology (SLIIT)',
        role_code: 'vice_chancellor',
        valid_from: '1999-07-01',
        tenure: 'confirmed'
      },
      {
        person_id: 'person:prof_ea_weerasinghe',
        name: 'E. A. Weerasinghe',
        name_si: 'ඊ. ඒ. වීරසිංහ',
        prefix: 'Prof.',
        qual: JSON.stringify(['BA (Hons)', 'PhD', 'FCMA']),
        bio: 'Founder and Vice Chancellor of NSBM Green University; former Director General of NIBM.',
        inst_id: 'inst:nsbm',
        inst_name: 'NSBM Green University',
        role_code: 'vice_chancellor',
        valid_from: '2016-10-26',
        tenure: 'confirmed'
      }
    ];

    for (const l of leadership) {
      insertPerson.run(l.person_id, l.name, l.name_si, l.prefix, l.qual, l.bio);

      insertEntity.run(
        `entity:${l.inst_id}`,
        'higher_ed_institution',
        l.inst_name,
        l.name_si,
        'higher_education',
        JSON.stringify({ inst_id: l.inst_id })
      );

      insertOccupancy.run(
        `occ:${l.inst_id}_vc_active`,
        l.person_id,
        l.role_code,
        `entity:${l.inst_id}`,
        l.valid_from,
        null,
        l.tenure,
        'gazetted_promotion',
        `Appointed as Vice Chancellor of ${l.inst_name}`
      );
    }
    console.log(`✅ Seeded ${leadership.length} Higher Education institutional leaders & tenures.`);

    db.exec('COMMIT;');
    console.log('🎉 [SEEDED] Finished seeding facilities, TNE funnel, scholarships, and governance!');
  } catch (err) {
    db.exec('ROLLBACK;');
    console.error('❌ [SEEDED] Failed:', err);
    throw err;
  }
}

// Run immediately if executed directly
if (process.argv[1] && process.argv[1].endsWith('seed-higher-ed-facilities-tne-and-scholarships.mjs')) {
  seedTneAndScholarships();
}
