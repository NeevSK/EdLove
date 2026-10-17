// scripts/education-atlas/importers/seed-co-curricular-and-resource-distribution.mjs
// Sovereign Seeder for Youth Movements, Sunday Religious Schools & Resource Distribution Profiles

import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.resolve(__dirname, '../../../data/education-atlas/atlas_staging.db');

console.log(`[Seeder 011] Opening database at: ${DB_PATH}`);
const db = new DatabaseSync(DB_PATH);
db.exec('PRAGMA foreign_keys = ON;');
db.exec('PRAGMA journal_mode = WAL;');

// -----------------------------------------------------------------------------
// 1. SEED CO-CURRICULAR & CIVIC YOUTH MOVEMENTS
// -----------------------------------------------------------------------------
console.log('[Seeder 011] Seeding co_curricular_movements...');

const movements = [
  {
    movement_id: 'mov:scouts_sl',
    name_en: 'Sri Lanka Scout Association (SLSA)',
    name_si: 'ශ්‍රී ලංකා බාලදක්ෂ සංගමය',
    name_ta: 'இலங்கை சாரணர் சங்கம்',
    movement_type: 'scouting_guiding',
    founding_year: 1912,
    governing_body: 'Sri Lanka Scout Association (Incorporated by Act No. 13 of 1957)',
    highest_honor_award: 'President\'s Scout Award (ජනාධිපති බාලදක්ෂ සම්මානය)',
    uniform_and_insignia: 'Khaki shirt, dark blue/khaki shorts or trousers, district neckerchief with woggle',
    core_pillars_json: JSON.stringify([
      'Outdoor Survival & Pioneering Skills',
      'Community Service & Disaster Relief',
      'Character Discipline & Moral Code (Scout Promise & Law)',
      'Leadership Cadre Progression (Cubs -> Junior -> Senior -> Rovers)'
    ]),
    annual_student_cadre_est: 78000,
    official_portal: 'https://scout.lk/',
    civic_role_notes: 'Founded in Matale in 1912 by F. G. Stevens; established deep roots across Buddhist, Christian, Hindu, and Muslim schools; pivotal youth mobilization wing during national emergencies.'
  },
  {
    movement_id: 'mov:girl_guides_sl',
    name_en: 'Sri Lanka Girl Guides Association (SLGGA)',
    name_si: 'ශ්‍රී ලංකා බාලදක්ෂිකා සංගමය',
    name_ta: 'இலங்கை பெண் வழிகாட்டிகள் சங்கம்',
    movement_type: 'scouting_guiding',
    founding_year: 1917,
    governing_body: 'Sri Lanka Girl Guides Association (Royal Charter / Act of Parliament)',
    highest_honor_award: 'President\'s Guide Award (ජනාධිපති බාලදක්ෂිකා සම්මානය)',
    uniform_and_insignia: 'Navy blue skirt/pinafore, white blouse, green/district scarf with trefoil badge',
    core_pillars_json: JSON.stringify([
      'Female Leadership & Life Skills',
      'Environmental Conservation & Tree Planting',
      'Adolescent Health & Self-Defense',
      'Progression: Little Friends (7-11 yrs) -> Guides (12-17 yrs) -> Senior Rangers (18-25 yrs)'
    ]),
    annual_student_cadre_est: 62000,
    official_portal: 'https://slgg.org/',
    civic_role_notes: 'Founded at Girls\' High School Kandy in 1917; premier girls\' leadership movement fostering independence, public service, and STEM interest among young women.'
  },
  {
    movement_id: 'mov:parisara_niyamu',
    name_en: 'National Environmental Pioneer Brigade (Parisara Niyamu Balakaya)',
    name_si: 'ජාතික පරිසර නියමු බලකාය (මධ්‍යම පරිසර අධිකාරිය)',
    name_ta: 'தேசிய சுற்றாடல் முன்னோடிப் படை',
    movement_type: 'environmental_pioneer',
    founding_year: 1984,
    governing_body: 'Central Environmental Authority (CEA) in partnership with Ministry of Education',
    highest_honor_award: 'Presidential Environmental Pioneer Award (ජනාධිපති පරිසර නියමු සම්මානය)',
    uniform_and_insignia: 'Green neckerchief with CEA emblem, khaki/white school uniform, progressive badge embroidery',
    core_pillars_json: JSON.stringify([
      'Badge Ladder: Pioneer (පරිසර නියමු) -> Green Badge (කොළ) -> Silver (රිදී) -> Gold (රන්) -> Presidential Award',
      'School Herbal & Medicinal Gardens (ඖෂධ උයන්)',
      'Waste Separation & Polythene-Free School Zones',
      'Biodiversity Audits of Local Water Catchments & Village Tanks'
    ]),
    annual_student_cadre_est: 185000,
    official_portal: 'https://www.cea.lk/',
    civic_role_notes: 'Largest school environmental movement in South Asia; active across 5,200+ primary and secondary schools; institutionalized ecological stewardship directly inside curriculum.'
  },
  {
    movement_id: 'mov:st_john_ambulance',
    name_en: 'St. John Ambulance Association & Brigade Sri Lanka',
    name_si: 'ශාන්ත ජෝන් ගිලන්රථ සංගමය හා බලකාය',
    name_ta: 'சென் ஜோன் அவசர முதலுதவிப் படை',
    movement_type: 'first_aid_humanitarian',
    founding_year: 1906,
    governing_body: 'Commandery of the Order of St. John in Sri Lanka (Act of Parliament No. 42 of 1982)',
    highest_honor_award: 'Grand Prior\'s Cadet Badge (ශ්‍රේෂ්ඨ ප්‍රමුඛයාගේ ලාංඡනය)',
    uniform_and_insignia: 'White shirt, black trousers/skirt with Maltese Cross emblem and cadet epaulettes',
    core_pillars_json: JSON.stringify([
      'Cardiopulmonary Resuscitation (CPR) & Emergency Triage',
      'School Sports Meet Medical First Responder Coverage',
      'Disaster Preparedness & Evacuation Drills',
      'First Aid Cadet Competition & Camporees'
    ]),
    annual_student_cadre_est: 36000,
    official_portal: 'https://stjohn.lk/',
    civic_role_notes: 'Vital emergency medical pillar in secondary schools; cadets provide all frontline first aid during school athletic meets, rugby tournaments, and big matches.'
  },
  {
    movement_id: 'mov:red_cross_youth',
    name_en: 'Sri Lanka Red Cross Society Youth Circles (SLRCS Junior Red Cross)',
    name_si: 'ශ්‍රී ලංකා රතු කුරුස සමාජය - තරුණ හා ළමා කව',
    name_ta: 'இலங்கை செஞ்சிலுவைச் சங்கம் - இளைஞர் வட்டம்',
    movement_type: 'first_aid_humanitarian',
    founding_year: 1936,
    governing_body: 'Sri Lanka Red Cross Society (Charter Member of IFRC)',
    highest_honor_award: 'National Red Cross Youth Leadership Gold Pin',
    uniform_and_insignia: 'Red Cross emblem armband, white school uniform with red lanyard',
    core_pillars_json: JSON.stringify([
      'Seven Fundamental Principles of Red Cross & Red Crescent',
      'Voluntary Blood Donation Awareness',
      'School Water & Hygiene (WASH) Monitoring',
      'Flood and Landslide Community Warning Drills'
    ]),
    annual_student_cadre_est: 52000,
    official_portal: 'https://www.redcross.lk/',
    civic_role_notes: 'Widespread network across flood-prone Southern, Western, and agrarian Eastern/Northern schools; trains children in disaster vulnerability reduction.'
  },
  {
    movement_id: 'mov:police_traffic_cadets',
    name_en: 'School Traffic Wardens & Junior Police Cadet Corps',
    name_si: 'පාසල් මාර්ග ආරක්ෂක හා ශිෂ්‍යභට පොලිස් බලකාය',
    name_ta: 'பாடசாலை போக்குவரத்து வழிகாட்டிகள் படை',
    movement_type: 'civic_traffic_cadet',
    founding_year: 1978,
    governing_body: 'Sri Lanka Police Headquarters (Traffic Branch) in partnership with Ministry of Education',
    highest_honor_award: 'National Best Traffic Warden Platoon Trophy',
    uniform_and_insignia: 'High-visibility fluorescent sash, white gloves, whistle, peaked traffic police cap',
    core_pillars_json: JSON.stringify([
      'Pedestrian Zebra Crossing Management for Morning/Afternoon School Runs',
      'Road Safety & Highway Code Enforcement',
      'Civic Discipline & Crowd Flow Coordination at School Functions',
      'Accident Prevention Workshops'
    ]),
    annual_student_cadre_est: 28000,
    official_portal: 'https://www.police.lk/',
    civic_role_notes: 'Essential daily civic infrastructure protecting millions of children crossing busy urban roads; students hold legal delegated authority to halt vehicular traffic.'
  }
];

const insertMovement = db.prepare(`
  INSERT INTO co_curricular_movements
  (movement_id, name_en, name_si, name_ta, movement_type, founding_year, governing_body, highest_honor_award, uniform_and_insignia, core_pillars_json, annual_student_cadre_est, official_portal, civic_role_notes)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  ON CONFLICT(movement_id) DO UPDATE SET
    name_en = excluded.name_en,
    movement_type = excluded.movement_type,
    highest_honor_award = excluded.highest_honor_award,
    core_pillars_json = excluded.core_pillars_json,
    annual_student_cadre_est = excluded.annual_student_cadre_est,
    official_portal = excluded.official_portal,
    civic_role_notes = excluded.civic_role_notes;
`);

for (const m of movements) {
  insertMovement.run(
    m.movement_id,
    m.name_en,
    m.name_si,
    m.name_ta,
    m.movement_type,
    m.founding_year,
    m.governing_body,
    m.highest_honor_award,
    m.uniform_and_insignia,
    m.core_pillars_json,
    m.annual_student_cadre_est,
    m.official_portal,
    m.civic_role_notes
  );
}

// -----------------------------------------------------------------------------
// 2. SEED SUNDAY RELIGIOUS SCHOOLS (DAHAM PASAL NETWORKS)
// -----------------------------------------------------------------------------
console.log('[Seeder 011] Seeding dhamma_school_networks...');

const dhammaNetworks = [
  {
    network_id: 'rel:daham_pasal_buddhist',
    faith_tradition: 'buddhism',
    name_en: 'Buddhist Daham Pasal Network (Sunday Dhamma Schools)',
    name_si: 'බෞද්ධ දහම් පාසල් පද්ධතිය (සමස්ත ලංකා ශාසනාරක්ෂක මණ්ඩලය)',
    name_ta: 'பௌத்த தஹம் பாசல் வலையமைப்பு',
    governing_state_department: 'Department of Buddhist Affairs (බෞද්ධ කටයුතු දෙපාර්තමේන්තුව) & Ministry of Buddhasasana',
    operating_venues: 'Village Buddhist Temples (විහාරස්ථාන) & Community Pirivenas across all 25 districts',
    estimated_school_units: 10250,
    estimated_student_enrollment: 2150000,
    national_examination_framework: 'Daham Pasal Final Certificate Examination (අවසාන සහතික පත්‍ර විභාගය) & Dharmacharya Examination (ධර්මාචාර්ය විභාගය)',
    volunteer_teaching_force_est: 138000,
    sociological_role_notes: 'The moral and spiritual counterweight to the secular state school system; runs every Sunday from 8:00 AM to 11:30 AM; students wear traditional white national attire (සුදු ජාතික ඇඳුම / ළමා සාරිය); taught without state salaries by monks and volunteer village elders.'
  },
  {
    network_id: 'rel:araneri_hindu',
    faith_tradition: 'hinduism',
    name_en: 'Saiva Samaya Araneri Padasalai Network (Hindu Moral Schools)',
    name_si: 'හින්දු අරනෙරි පාසල් පද්ධතිය',
    name_ta: 'சைவ சமய அறநெறிப் பாடசாலைகள் வலையமைப்பு',
    governing_state_department: 'Department of Hindu Religious and Cultural Affairs (இந்து சமய கலாசார திணைக்களம்)',
    operating_venues: 'Hindu Kovils (சிவாலயங்கள் / பிள்ளையார் கோவில்கள்) & Cultural Halls in Jaffna, Batticaloa, Trincomalee, Colombo, and Hill Country Estates',
    estimated_school_units: 1680,
    estimated_student_enrollment: 225000,
    national_examination_framework: 'National Araneri Certificate Examination (அறநெறிச் சான்றிதழ் பரீட்சை)',
    volunteer_teaching_force_est: 15400,
    sociological_role_notes: 'Instills Saiva Siddhanta theology, Thevaram and Thiruvasagam devotional chanting, Classical Carnatic aesthetics, and Tamil literary ethics; essential cultural anchor in war-reconstruction zones and tea plantation settlements.'
  },
  {
    network_id: 'rel:sunday_school_christian',
    faith_tradition: 'christianity_catholic',
    name_en: 'Christian & Catholic Parish Catechism Schools (Sunday Schools)',
    name_si: 'කතෝලික හා ක්‍රිස්තියානි දහම් පාසල් පද්ධතිය',
    name_ta: 'கிறிஸ்தவ மறைக்கல்வி ஞாயிறு பாடசாலைகள்',
    governing_state_department: 'Catholic National Commission for Catechetics & National Christian Council of Sri Lanka',
    operating_venues: 'Parish Churches & Mission Halls in Western coastal belt (Negombo to Moratuwa), Mannar, Jaffna, Kandy, and Batticaloa',
    estimated_school_units: 1320,
    estimated_student_enrollment: 195000,
    national_examination_framework: 'Diocesan Catechetical Certificate & First Holy Communion / Confirmation Curriculum',
    volunteer_teaching_force_est: 14200,
    sociological_role_notes: 'Sunday morning catechetical education following Holy Mass; emphasizes Christian morality, Gospel social justice, choral polyphony, and parish youth brotherhood.'
  },
  {
    network_id: 'rel:ahadiyyah_islamic',
    faith_tradition: 'islam',
    name_en: 'Association of Ahadiyyah Schools Sri Lanka (Islamic Weekend Moral Schools)',
    name_si: 'අහදියියා ඉස්ලාමීය දහම් පාසල් පද්ධතිය',
    name_ta: 'அகில இலங்கை அஹதிய்யா பாடசாலைகள் பேரவை',
    governing_state_department: 'Department of Muslim Religious and Cultural Affairs (MRCA)',
    operating_venues: 'Jumma Mosques & Arabic Madrasa Halls in Eastern Province, Colombo, Kandy, Beruwala, and Puttalam',
    estimated_school_units: 840,
    estimated_student_enrollment: 145000,
    national_examination_framework: 'National Ahadiyyah Certificate Examination & Tajweed Recitation Evaluation',
    volunteer_teaching_force_est: 9800,
    sociological_role_notes: 'Weekend moral education teaching Islamic ethics, Arabic alphabet, Tajweed Quranic phonetics, Hadith studies, and civic harmony; voluntary neighborhood teacher cadres.'
  }
];

const insertDhamma = db.prepare(`
  INSERT INTO dhamma_school_networks
  (network_id, faith_tradition, name_en, name_si, name_ta, governing_state_department, operating_venues, estimated_school_units, estimated_student_enrollment, national_examination_framework, volunteer_teaching_force_est, sociological_role_notes)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  ON CONFLICT(network_id) DO UPDATE SET
    name_en = excluded.name_en,
    governing_state_department = excluded.governing_state_department,
    operating_venues = excluded.operating_venues,
    estimated_school_units = excluded.estimated_school_units,
    estimated_student_enrollment = excluded.estimated_student_enrollment,
    sociological_role_notes = excluded.sociological_role_notes;
`);

for (const d of dhammaNetworks) {
  insertDhamma.run(
    d.network_id,
    d.faith_tradition,
    d.name_en,
    d.name_si,
    d.name_ta,
    d.governing_state_department,
    d.operating_venues,
    d.estimated_school_units,
    d.estimated_student_enrollment,
    d.national_examination_framework,
    d.volunteer_teaching_force_est,
    d.sociological_role_notes
  );
}

// -----------------------------------------------------------------------------
// 3. SEED SCHOOL RESOURCE DISTRIBUTION PROFILES (THE EMPIRICAL DISPARITY)
// -----------------------------------------------------------------------------
console.log('[Seeder 011] Seeding school_resource_distribution_profiles...');

const profiles = [
  // 1AB National Elite - Royal College Colombo (0117001)
  {
    profile_id: 'res_dist:0117001',
    school_census_no: '0117001',
    sports_infrastructure_tier: 'olympic_turf_complex',
    sports_offered_json: JSON.stringify(['cricket_leather_ball_turf', 'rugby', 'swimming_water_polo', 'athletics', 'tennis', 'rowing', 'badminton', 'basketball', 'table_tennis', 'chess']),
    swimming_pool_available: 1,
    cricket_turf_available: 1,
    aesthetic_streams_available_json: JSON.stringify(['eastern_ragadhari_music', 'western_orchestral_music', 'kandyan_traditional_dance', 'art', 'english_sinhala_drama']),
    aesthetic_teacher_status: 'surplus',
    al_science_capable: 1,
    functional_computer_terminals: 260,
    drinking_water_source: 'pipe_borne_safe',
    electricity_status: 'national_grid_continuous',
    midday_meal_beneficiary: 0,
    co_curricular_units_json: JSON.stringify(['14th Colombo Scout Troop', 'Senior Cadet Platoon (Herman Loos)', 'Parisara Niyamu Gold Brigade', 'St. John Ambulance Division', 'School Police Traffic Marshals']),
    notes: 'The apex institutional resource profile: private swimming complex, 3 turf pitches, 8 air-conditioned computer labs; surplus specialist teachers in all disciplines.'
  },
  // 1AB National Elite Girls - Visakha Vidyalaya Colombo (0116016)
  {
    profile_id: 'res_dist:0116016',
    school_census_no: '0116016',
    sports_infrastructure_tier: 'olympic_turf_complex',
    sports_offered_json: JSON.stringify(['swimming', 'netball', 'badminton', 'tennis', 'table_tennis', 'chess', 'athletics']),
    swimming_pool_available: 1,
    cricket_turf_available: 0,
    aesthetic_streams_available_json: JSON.stringify(['eastern_music', 'western_choral_music', 'kandyan_dance', 'art', 'drama_theatre']),
    aesthetic_teacher_status: 'surplus',
    al_science_capable: 1,
    functional_computer_terminals: 175,
    drinking_water_source: 'pipe_borne_safe',
    electricity_status: 'national_grid_continuous',
    midday_meal_beneficiary: 0,
    co_curricular_units_json: JSON.stringify(['Visakha Girl Guide Company', 'Girls Cadet Platoon (De Soysa Cup)', 'Parisara Niyamu Gold Brigade', 'St. John Ambulance Division', 'Buddhist Sisterhood']),
    notes: 'Premier Buddhist girls national school: heated 25m pool, state-of-the-art Jeremias Dias auditorium, surplus music and dance instructors.'
  },
  // 1AB National Northern - Jaffna Central College (1001002)
  {
    profile_id: 'res_dist:1001002',
    school_census_no: '1001002',
    sports_infrastructure_tier: 'grass_ground_matting',
    sports_offered_json: JSON.stringify(['cricket_leather_ball_turf', 'football', 'athletics', 'basketball', 'chess']),
    swimming_pool_available: 0,
    cricket_turf_available: 1,
    aesthetic_streams_available_json: JSON.stringify(['carnatic_vocal_instrumental', 'bharatanatyam_classical_dance', 'art', 'tamil_theatre']),
    aesthetic_teacher_status: 'balanced',
    al_science_capable: 1,
    functional_computer_terminals: 110,
    drinking_water_source: 'ro_filtration_plant',
    electricity_status: 'national_grid_continuous',
    midday_meal_beneficiary: 0,
    co_curricular_units_json: JSON.stringify(['Jaffna 1st Scout Troop', 'Senior Cadet Platoon', 'St. John First Aid Unit', 'Araneri Cultural Society']),
    notes: 'Flagship northern national school: cricket turf, strong Carnatic aesthetic faculty, reverse osmosis groundwater filtration.'
  },
  // 1AB National Wayamba - Maliyadeva College Kurunegala (1801013)
  {
    profile_id: 'res_dist:1801013',
    school_census_no: '1801013',
    sports_infrastructure_tier: 'olympic_turf_complex',
    sports_offered_json: JSON.stringify(['cricket_leather_ball_turf', 'rugby', 'swimming', 'athletics', 'basketball', 'badminton', 'chess']),
    swimming_pool_available: 1,
    cricket_turf_available: 1,
    aesthetic_streams_available_json: JSON.stringify(['eastern_ragadhari_music', 'kandyan_traditional_dance', 'art', 'sinhala_drama']),
    aesthetic_teacher_status: 'surplus',
    al_science_capable: 1,
    functional_computer_terminals: 145,
    drinking_water_source: 'pipe_borne_safe',
    electricity_status: 'national_grid_continuous',
    midday_meal_beneficiary: 0,
    co_curricular_units_json: JSON.stringify(['Kurunegala Scout Troop', 'Senior Cadet Platoon (Herman Loos)', 'Parisara Niyamu Brigade', 'St. John Ambulance']),
    notes: 'Provincial capital power-house: 5,000+ students, swimming pool, massive alumni funding for sports and robotics.'
  },
  // 1AB National Colombo - Thurstan College (0117004)
  {
    profile_id: 'res_dist:0117004',
    school_census_no: '0117004',
    sports_infrastructure_tier: 'olympic_turf_complex',
    sports_offered_json: JSON.stringify(['cricket_leather_ball_turf', 'rugby', 'swimming', 'athletics', 'tennis', 'badminton']),
    swimming_pool_available: 1,
    cricket_turf_available: 1,
    aesthetic_streams_available_json: JSON.stringify(['eastern_music', 'western_music', 'kandyan_dance', 'art', 'drama']),
    aesthetic_teacher_status: 'balanced',
    al_science_capable: 1,
    functional_computer_terminals: 95,
    drinking_water_source: 'pipe_borne_safe',
    electricity_status: 'national_grid_continuous',
    midday_meal_beneficiary: 0,
    co_curricular_units_json: JSON.stringify(['Thurstan Scout Troop', 'Senior Cadet Platoon', 'St. John Division', 'Police Traffic Wardens']),
    notes: 'Colombo 07 national school with swimming pool, dedicated rugby ground, and strong G.C.E. A/L science streams.'
  },
  // 1AB Provincial Uva - Passara M.M.V. (2202001)
  {
    profile_id: 'res_dist:2202001',
    school_census_no: '2202001',
    sports_infrastructure_tier: 'grass_ground_matting',
    sports_offered_json: JSON.stringify(['volleyball', 'athletics', 'netball', 'cricket_matting_only']),
    swimming_pool_available: 0,
    cricket_turf_available: 0,
    aesthetic_streams_available_json: JSON.stringify(['eastern_music', 'kandyan_dance', 'art']),
    aesthetic_teacher_status: 'deficit_music_dance_missing',
    al_science_capable: 1,
    functional_computer_terminals: 38,
    drinking_water_source: 'tube_well_tested',
    electricity_status: 'national_grid_continuous',
    midday_meal_beneficiary: 0,
    co_curricular_units_json: JSON.stringify(['Passara Scout Troop', 'Parisara Niyamu Green Brigade']),
    notes: 'Mountain valley 1AB central school: offers A/L Science but struggles with physics lab equipment; missing Western music and drama teachers.'
  },
  // Type 2 Provincial Agrarian - Saliyapura Vidyalaya (1702001)
  {
    profile_id: 'res_dist:1702001',
    school_census_no: '1702001',
    sports_infrastructure_tier: 'gravel_volleyball_only',
    sports_offered_json: JSON.stringify(['volleyball', 'netball', 'athletics_grass_barefoot']),
    swimming_pool_available: 0,
    cricket_turf_available: 0,
    aesthetic_streams_available_json: JSON.stringify(['art']),
    aesthetic_teacher_status: 'severe_shortage_art_only',
    al_science_capable: 0, // NO A/L SCIENCE (Stops at Grade 11)
    functional_computer_terminals: 8,
    drinking_water_source: 'ro_filtration_plant',
    electricity_status: 'national_grid_continuous',
    midday_meal_beneficiary: 1, // 100% Primary Meal Beneficiary
    co_curricular_units_json: JSON.stringify(['Parisara Niyamu Green Brigade', 'Daham Pasal Temple Troop']),
    notes: 'Dry-zone agrarian school: NO A/L Science; zero music or dance teachers (all students forced into Art by default); RO water plant installed due to high CKDu groundwater risk; primary section 100% reliant on state midday meals.'
  },
  // Type 3 Provincial Coastal - Karumalaiyoothu Muslim Vidyalayam (1701045)
  {
    profile_id: 'res_dist:1701045',
    school_census_no: '1701045',
    sports_infrastructure_tier: 'zero_playground',
    sports_offered_json: JSON.stringify(['volleyball_beach_sand']),
    swimming_pool_available: 0,
    cricket_turf_available: 0,
    aesthetic_streams_available_json: JSON.stringify(['art']),
    aesthetic_teacher_status: 'severe_shortage_art_only',
    al_science_capable: 0, // NO A/L SCIENCE
    functional_computer_terminals: 3,
    drinking_water_source: 'tube_well_tested',
    electricity_status: 'national_grid_continuous',
    midday_meal_beneficiary: 1, // 100% Meal Beneficiary
    co_curricular_units_json: JSON.stringify(['Ahadiyyah Weekend Circle']),
    notes: 'Small coastal fishing village school: stops at Grade 8; no dedicated playground; single teacher covers all aesthetic periods; 100% students receive hot midday meal.'
  },
  // Type 3 Plantation Estate Primary - Laxapana No 1 T V (0611016)
  {
    profile_id: 'res_dist:0611016',
    school_census_no: '0611016',
    sports_infrastructure_tier: 'zero_playground',
    sports_offered_json: JSON.stringify(['roadside_games_only']),
    swimming_pool_available: 0,
    cricket_turf_available: 0,
    aesthetic_streams_available_json: JSON.stringify(['art']),
    aesthetic_teacher_status: 'severe_shortage_art_only',
    al_science_capable: 0, // NO A/L SCIENCE (Primary Only Grade 1-5)
    functional_computer_terminals: 0,
    drinking_water_source: 'unprotected_source_deficit',
    electricity_status: 'national_grid_continuous',
    midday_meal_beneficiary: 1, // 100% Critical Nutrition
    co_curricular_units_json: JSON.stringify(['Estate Kovil Araneri Class']),
    notes: 'Steep tea estate primary school: zero playground (children play on roadside); zero computers; unfiltered stream water; state midday meal is the critical nutritional lifeline preventing stunting.'
  }
];

const insertProfile = db.prepare(`
  INSERT INTO school_resource_distribution_profiles
  (profile_id, school_census_no, sports_infrastructure_tier, sports_offered_json, swimming_pool_available, cricket_turf_available, aesthetic_streams_available_json, aesthetic_teacher_status, al_science_capable, functional_computer_terminals, drinking_water_source, electricity_status, midday_meal_beneficiary, co_curricular_units_json, notes)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  ON CONFLICT(profile_id) DO UPDATE SET
    sports_infrastructure_tier = excluded.sports_infrastructure_tier,
    sports_offered_json = excluded.sports_offered_json,
    swimming_pool_available = excluded.swimming_pool_available,
    cricket_turf_available = excluded.cricket_turf_available,
    aesthetic_streams_available_json = excluded.aesthetic_streams_available_json,
    aesthetic_teacher_status = excluded.aesthetic_teacher_status,
    al_science_capable = excluded.al_science_capable,
    functional_computer_terminals = excluded.functional_computer_terminals,
    drinking_water_source = excluded.drinking_water_source,
    electricity_status = excluded.electricity_status,
    midday_meal_beneficiary = excluded.midday_meal_beneficiary,
    co_curricular_units_json = excluded.co_curricular_units_json,
    notes = excluded.notes;
`);

for (const p of profiles) {
  insertProfile.run(
    p.profile_id,
    p.school_census_no,
    p.sports_infrastructure_tier,
    p.sports_offered_json,
    p.swimming_pool_available,
    p.cricket_turf_available,
    p.aesthetic_streams_available_json,
    p.aesthetic_teacher_status,
    p.al_science_capable,
    p.functional_computer_terminals,
    p.drinking_water_source,
    p.electricity_status,
    p.midday_meal_beneficiary,
    p.co_curricular_units_json,
    p.notes
  );
}

console.log('[Seeder 011] All Co-Curricular Movements, Dhamma Schools, and School Resource Distribution Profiles seeded.');
