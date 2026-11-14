/**
 * scripts/education-atlas/adapters/edresearch-bridge.mjs
 *
 * Bridges research artifacts from E:\edresearch and E:\edtech into the Education Atlas database:
 *  1. Ingests research monographs (Neev Edirisuriya: The Noble Lie, Schooling Chronicle, Strategic Report).
 *  2. Ingests global & local EdTech solutions from E:\edtech\docs\edtech_master.csv.
 *  3. Populates SQA Indicator Matrix (52 indicators across the 8 quality dimensions).
 *  4. Seeds School Finance & Budget profiles (Treasury vs. SDS Shadow Treasury).
 */

import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';

const DB_PATH = path.resolve('data/education-atlas/atlas_staging.db');
const EDTECH_CSV = 'E:/edtech/docs/edtech_master.csv';

function run() {
  console.log('🌉 [EDRESEARCH BRIDGE] Ingesting Research, EdTech Catalog & School Finance...');

  const db = new DatabaseSync(DB_PATH);
  db.exec('PRAGMA foreign_keys = OFF;');
  db.exec('PRAGMA journal_mode = WAL;');

  db.exec('BEGIN TRANSACTION;');
  try {
    // 1. INGEST RESEARCH MONOGRAPHS INTO RESOURCES
    db.prepare(`
      INSERT OR IGNORE INTO sources
      (source_id, name, short_name, source_kind, canonical_url)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      'intuituilabs_research_monograph',
      'IntuituiLabs Sovereign Education Research Monograph Archive',
      'IntuituiLabs Research',
      'research_archive',
      'file:///E:/edresearch'
    );

    const researchDocs = [
      {
        resource_id: 'LK-RES-EDR-NOBLE-LIE',
        title: 'The Noble Lie of Universal Quality Education in Sri Lanka: Why Student-Teacher Ratios Don\'t Predict Outcomes',
        canonical_url: 'file:///E:/edresearch/sri_lanka_system/The_Noble_Lie_Universal_Quality_Education_Coleman_Paradox.md',
        ingested_via: 'intuituilabs_edresearch',
        source_id: 'intuituilabs_research_monograph',
        resource_type: 'research_monograph',
        content_format: 'markdown',
        publication_date: '2026-07-15',
        summary: 'Demonstrates why aggregate student-teacher ratios (1:17.5) are a statistical illusion that fails to predict student outcomes. Evaluates the Coleman Paradox (20% school variance vs 80% family/SES context) and the funding disparity between 373 National Schools and 9,782 Provincial Schools.',
      },
      {
        resource_id: 'LK-RES-EDR-STRATEGIC-REPORT',
        title: 'Strategic Analysis: Sri Lanka Education Ecosystem — Market Mapping, Gap Analysis & Opportunity Assessment',
        canonical_url: 'file:///E:/edresearch/sri_lanka_system/Sri_Lanka_Education_Ecosystem_Strategic_Report_Builder.js',
        ingested_via: 'intuituilabs_edresearch',
        source_id: 'intuituilabs_research_monograph',
        resource_type: 'research_monograph',
        content_format: 'javascript',
        publication_date: '2026-01-20',
        summary: 'Comprehensive market and policy mapping of Sri Lanka\'s 10,155 schools, 4.2M students, and 236K teachers. Unpacks the Rs. 122 Billion shadow private tutoring economy and identifies educator wellbeing technology as the highest-ROI opportunity.',
      },
      {
        resource_id: 'LK-RES-EDR-SCHOOLING-CHRONICLE',
        title: 'Chronicle: Sri Lankan Schooling — Theory, Practice, and the Limits of Reform (1931–2026)',
        canonical_url: 'file:///E:/edresearch/sri_lanka_system/sri-lanka-schooling-chronicle.md',
        ingested_via: 'intuituilabs_edresearch',
        source_id: 'intuituilabs_research_monograph',
        resource_type: 'research_monograph',
        content_format: 'markdown',
        publication_date: '2026-07-28',
        summary: 'Longitudinal political economy chronicle: from the 1934-35 malaria epidemic and 1943 Kannangara Free Education report to the 8-year curriculum churn cycles (1999, 2007, 2015, 2026) and Stafford Beer\'s POSIWID systemic dualism.',
      },
      {
        resource_id: 'LK-RES-EDR-RESEARCH-FIELD',
        title: 'Sri Lankan Education Research as a Field: Institutions, People, Journals, and Reform',
        canonical_url: 'file:///E:/edresearch/sri_lanka_system/sri-lanka-education-research-field.md',
        ingested_via: 'intuituilabs_edresearch',
        source_id: 'intuituilabs_research_monograph',
        resource_type: 'research_monograph',
        content_format: 'markdown',
        publication_date: '2026-09-20',
        summary: 'Institutional and genealogical mapping of Sri Lankan educational research hubs: National Institute of Education (NIE, SLJER), NEREC (Prof. Wedikkarage, National Assessments), UoC Faculty of Education, OUSL, UoP, and post-2022 NEPF/NCF curriculum reforms.',
      },
      {
        resource_id: 'LK-RES-EDR-RESEARCH-AUDIT',
        title: 'Sri Lankan Education Research: Methodological Audit & Mechanism Deficit Analysis',
        canonical_url: 'file:///E:/edresearch/sri_lanka_system/sl-education-research-audit.md',
        ingested_via: 'intuituilabs_edresearch',
        source_id: 'intuituilabs_research_monograph',
        resource_type: 'research_monograph',
        content_format: 'markdown',
        publication_date: '2026-09-20',
        summary: 'Critical audit of Sri Lankan educational scholarship testing empirical regularities vs generative mechanisms. Documents institutional compliance incentives around Action Research (AR) and imported construct dependency.',
      },
      {
        resource_id: 'LK-RES-EDR-METARESEARCH',
        title: 'Sri Lanka Education Metaresearch Framework: Abductive Synthesis & Systemic Feedback Loops',
        canonical_url: 'file:///E:/edresearch/sri_lanka_system/sri-lanka-education-metaresearch-framework.md',
        ingested_via: 'intuituilabs_edresearch',
        source_id: 'intuituilabs_research_monograph',
        resource_type: 'research_monograph',
        content_format: 'markdown',
        publication_date: '2026-09-22',
        summary: 'Methodological framework reconciling empirical educational research with systems theory, Stafford Beer viable system models, and real-time classroom telemetry.',
      },
      {
        resource_id: 'LK-RES-EDR-RESEARCH-META-CHECK',
        title: 'Sri Lanka Education Research Meta-Check: Paradigmatic Invariants & Scholastic Biases',
        canonical_url: 'file:///E:/edresearch/sri_lanka_system/sri-lanka-education-research-meta-check.md',
        ingested_via: 'intuituilabs_edresearch',
        source_id: 'intuituilabs_research_monograph',
        resource_type: 'research_monograph',
        content_format: 'markdown',
        publication_date: '2026-09-25',
        summary: 'Epistemological validation checking whether current policy interventions address generative root mechanisms or merely measure symptoms within an unexamined inherited frame.',
      },
      {
        resource_id: 'LK-RES-EDR-PAPER-OUTLINE',
        title: 'Paper Outline: The Dialectical Evolution of Sri Lankan General Education (1934–2026)',
        canonical_url: 'file:///E:/edresearch/sri_lanka_system/paper-outline-sri-lanka-schooling.md',
        ingested_via: 'intuituilabs_edresearch',
        source_id: 'intuituilabs_research_monograph',
        resource_type: 'research_monograph',
        content_format: 'markdown',
        publication_date: '2026-09-15',
        summary: 'Structural syllabus for a multi-volume treatise tracing the Kannangara welfare compact, 1961 denominational takeover, 1987 Provincial devolution, and modern post-default technocracy.',
      },
      {
        resource_id: 'LK-RES-EDR-CANONICAL-MASTER',
        title: 'CANONICAL-SYSTEMANTICS-AND-EDUCATIONAL-GROUND-TRUTH: The Definitive Canon on Cybernetic Realism, Relational Scarcity, Multi-Agent Standpoint Epistemology, and Context-Adjusted Diagnostics in Sri Lankan Schooling',
        canonical_url: 'file:///E:/edresearch/sri_lanka_system/CANONICAL-SYSTEMANTICS-AND-EDUCATIONAL-GROUND-TRUTH.md',
        ingested_via: 'intuituilabs_edresearch',
        source_id: 'intuituilabs_research_monograph',
        resource_type: 'research_monograph',
        content_format: 'markdown',
        publication_date: '2026-10-11',
        summary: 'Authoritative Master Canon (Tier 0 SSoT) synthesizing Stafford Beer POSIWID, John Gall Systemantics, Relational Scarcity, Multi-Agent Standpoint Epistemology, Teacher Survival Economics, Moral Injury, the C-ARI Multi-Factor Model, and empirical dry-run proof from 9,962 schools.',
      },
      {
        resource_id: 'LK-RES-EDR-POSIWID-SYSTEMANTICS',
        title: 'POSIWID and Systemantics: The Cybernetic Realism of Educational Ecologies',
        canonical_url: 'file:///E:/edresearch/sri_lanka_system/posiwid-and-systemantics-canonical-treatise.md',
        ingested_via: 'intuituilabs_edresearch',
        source_id: 'intuituilabs_research_monograph',
        resource_type: 'research_monograph',
        content_format: 'markdown',
        publication_date: '2026-10-11',
        summary: 'Master canonical treatise synthesizing Stafford Beer POSIWID (1979) and John Gall Systemantics (1975) with direct empirical and philosophical application to Sri Lankan general education, relational scarcity, polycentric compensatory education, and multi-agent standpoint epistemology.',
      },
      {
        resource_id: 'LK-RES-EDR-POLYCENTRIC-HUMILITY',
        title: 'The Polycentric Classroom: Relational Scarcity, Compensatory Ecologies, and Systemic Humility in Sri Lankan Education',
        canonical_url: 'file:///E:/edresearch/sri_lanka_system/canonical-systemic-humility-and-polycentric-standpoints.md',
        ingested_via: 'intuituilabs_edresearch',
        source_id: 'intuituilabs_research_monograph',
        resource_type: 'research_monograph',
        content_format: 'markdown',
        publication_date: '2026-10-11',
        summary: 'Foundational epistemological treatise reframing shadow education as an emergent compensatory lattice in a polycentric distributed system under state rationing constraints. Details systemic humility and multi-agent standpoint epistemology across Child, Parent, Teacher, Tutor, and State.',
      },
      {
        resource_id: 'LK-RES-EDR-WIRE-PROBLEM',
        title: 'The Wire Problem: On the Importance of a Multi-Scale Relational Theory of Education',
        canonical_url: 'file:///E:/edresearch/pedagogy_and_learning_models/the_wire_problem_essay.md',
        ingested_via: 'intuituilabs_edresearch',
        source_id: 'intuituilabs_research_monograph',
        resource_type: 'research_monograph',
        content_format: 'markdown',
        publication_date: '2026-08-10',
        summary: 'Multi-scale topology of educational transmission lines: nodes and edges with impedance matching. Demonstrates that when policy signals exceed classroom carrying capacity, signals reflect back as cheap distortions (faked logbooks, rote cramming, burnout).',
      },
      {
        resource_id: 'LK-RES-EDR-RELATIONAL-CORE',
        title: 'The Relational Core: A 3,500-Year Global Intellectual History of Pedagogical Attunement',
        canonical_url: 'file:///E:/edresearch/pedagogy_and_learning_models/relational_camps/THE_RELATIONAL_CORE_A_GLOBAL_INTELLECTUAL_HISTORY.md',
        ingested_via: 'intuituilabs_edresearch',
        source_id: 'intuituilabs_research_monograph',
        resource_type: 'research_monograph',
        content_format: 'markdown',
        publication_date: '2026-08-01',
        summary: 'Master lineage of relational pedagogy from Vedic Saha Nau Avatu, Buddhist Kalyana-mittata, Confucian Xueji, to Winnicott holding environments, Saitou shintai, and Teaning reciprocal dynamics.',
      },
      {
        resource_id: 'LK-RES-EDR-TEACHER-STRESS',
        title: 'Teacher Stress in Sri Lanka: Causal Modeling of Administrative Burdens, Syllabus Overload, and Relational Collapse',
        canonical_url: 'file:///E:/edresearch/teacher_wellbeing_and_agency/teacher-stress-sri-lanka-applied-model.md',
        ingested_via: 'intuituilabs_edresearch',
        source_id: 'intuituilabs_research_monograph',
        resource_type: 'research_monograph',
        content_format: 'markdown',
        publication_date: '2026-09-01',
        summary: 'Empirical causal modeling of educator occupational exhaustion: how inflation, circular overload, multigrade teaching, and salary erosion force teachers to biologically ration relational presence.',
      },
      {
        resource_id: 'LK-RES-EDR-LOGISTICS-LAST-MILE',
        title: 'The Logistics of Education: Trunk Lines, Hubs, and the Last-Mile Relational Bottleneck',
        canonical_url: 'file:///E:/edresearch/sri_lanka_system/THE-LOGISTICS-OF-EDUCATION-TRUNK-LINES-HUBS-AND-THE-LAST-MILE.md',
        ingested_via: 'intuituilabs_edresearch',
        source_id: 'intuituilabs_research_monograph',
        resource_type: 'research_monograph',
        content_format: 'markdown',
        publication_date: '2026-10-11',
        summary: 'A Structural Analysis of Supply-Chain Invariants, Distribution Friction, and the Breakdown of Centralized Pedagogy. Models mass schooling through freight logistics: centralized trunk lines (NIE, MoE bulk syllabi/textbooks), regional zonal depots, and the last-mile doorstep (the classroom bench & child\'s consciousness). Reframes private tuition as an emergent compensatory courier network resolving state last-mile failure.',
      },
      {
        resource_id: 'LK-RES-EDR-AI-ZERO-MARGINAL-COST',
        title: 'Education in the Era of AI: The Zero-Marginal-Cost Myth, Inference Economics, and Convivial Limits',
        canonical_url: 'file:///E:/edresearch/sri_lanka_system/EDUCATION-IN-THE-ERA-OF-AI-THE-ZERO-MARGINAL-COST-MYTH-AND-CONVIVIAL-LIMITS.md',
        ingested_via: 'intuituilabs_edresearch',
        source_id: 'intuituilabs_research_monograph',
        resource_type: 'research_monograph',
        content_format: 'markdown',
        publication_date: '2026-10-11',
        summary: 'A Thermodynamic and Socio-Technical Critique of Artificial Intelligence in Mass Schooling. Deconstructs the zero-marginal-cost illusion in AI tutoring via token inference economics (FLOPs/turn, megawatt cooling, dollar-denominated cloud drain). Analyzes physical hardware decay (tropical battery swelling, screen breakage, lack of repair parts), historical OLPC Peru failures ($200M spent, 0.00 sigma gain), and the Sri Lankan "Board of Survey" (FR 756/757) audit surcharge trap locking computers in almirahs. Outlines Ivan Illich\'s convivial alternative: AI as teacher exoskeleton, not student replacement.',
      },
      {
        resource_id: 'LK-RES-EDR-FLOOR-RED-QUEEN',
        title: 'The Dialectic of the Floor and the Red Queen: Mobility, Burnout, and the Alienation of the Climber',
        canonical_url: 'file:///E:/edresearch/sri_lanka_system/THE-DIALECTIC-OF-THE-FLOOR-AND-THE-RED-QUEEN-MOBILITY-BURNOUT-AND-ALIENTATION.md',
        ingested_via: 'intuituilabs_edresearch',
        source_id: 'intuituilabs_research_monograph',
        resource_type: 'research_monograph',
        content_format: 'markdown',
        publication_date: '2026-10-11',
        summary: 'A Socio-Metabolic Critique of Educational Elevation, Credential Inflation, and the Psychic Toll of Social Mobility. Evaluates what the mass school system genuinely gets right in a POSIWID sense (nutritional floor preventing child stunting, eradication of feudal illiteracy, somatic equality of the white uniform). Analyzes Fred Hirsch positional competition and Van Valen Red Queen credential inflation, the micro-validity of individual upward mobility vs macro structural bottlenecks, the biological cost of over-striving and burnout, and the transclasse alienation (cultural dislocation and the Kaduwa barrier) experienced by rural climbers.',
      },
    ];

    const insertResourceStmt = db.prepare(`
      INSERT OR REPLACE INTO resources 
      (resource_id, source_id, title, summary, resource_type, content_format, canonical_url, publication_date, ingested_via)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const r of researchDocs) {
      insertResourceStmt.run(r.resource_id, r.source_id, r.title, r.summary, r.resource_type, r.content_format, r.canonical_url, r.publication_date, r.ingested_via);
    }
    console.log(`✅ Ingested ${researchDocs.length} foundational research monographs.`);

    // 2. INGEST EDTECH SOLUTIONS CATALOG (From E:\edtech\docs\edtech_master.csv + Sri Lankan National Platforms)
    function parseCSV(text) {
      const p = [];
      let row = [''];
      let inQuotes = false;
      for (let i = 0; i < text.length; i++) {
        const c = text[i];
        const next = text[i+1];
        if (c === '"') {
          if (inQuotes && next === '"') {
            row[row.length - 1] += '"';
            i++;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (c === ',' && !inQuotes) {
          row.push('');
        } else if ((c === '\r' || c === '\n') && !inQuotes) {
          if (c === '\r' && next === '\n') i++;
          if (row.length > 1 || row[0] !== '') {
            p.push(row);
          }
          row = [''];
        } else {
          row[row.length - 1] += c;
        }
      }
      if (row.length > 1 || row[0] !== '') p.push(row);
      return p;
    }

    const insertEdTechStmt = db.prepare(`
      INSERT OR REPLACE INTO edtech_solutions_catalog
      (solution_id, name, origin_country, scope, founding_year, target_audience, pedagogical_model,
       connectivity_requirement, hardware_class, pricing_model, founder_epistemology, design_fit_assessment,
       trajectory_status, source_reference_url, evidence_tier, business_trajectory, intended_population,
       ideology_quote, raw_audit_json)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    let ingestedCount = 0;
    if (fs.existsSync(EDTECH_CSV)) {
      const rawCsv = fs.readFileSync(EDTECH_CSV, 'utf8');
      const csvRows = parseCSV(rawCsv);
      const headers = csvRows[0];

      for (let i = 1; i < csvRows.length; i++) {
        const row = csvRows[i];
        const toolObj = {};
        headers.forEach((h, idx) => { toolObj[h] = row[idx] || ''; });

        const name = toolObj.Tool || '';
        if (!name) continue;

        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
        const solution_id = `edtech:${slug}`;

        // Map scope
        let scope = 'global';
        if (toolObj.Country === 'LKA' || toolObj.Geo === 'LKA') scope = 'sri_lanka_national';
        else if (toolObj.Geo === 'G') scope = 'global';
        else if (toolObj.Geo) scope = toolObj.Geo.toLowerCase();

        // Map target audience
        let target_audience = toolObj.User || 'k12_students';
        if (target_audience === 'Stu') target_audience = 'students';
        else if (target_audience === 'Tea') target_audience = 'teachers';
        else if (target_audience === 'Admin') target_audience = 'administrators';

        // Map pedagogy
        let pedagogical_model = toolObj.Ped || 'instructional';
        if (pedagogical_model === 'Inq') pedagogical_model = 'inquiry_simulation';
        else if (pedagogical_model === 'Beh') pedagogical_model = 'behaviorist_gamified';
        else if (pedagogical_model === 'Dir' || pedagogical_model === 'Cont') pedagogical_model = 'lecture_broadcast';

        // Map connectivity
        let connectivity_requirement = 'low_bandwidth';
        if (toolObj.Conn === 'Off') connectivity_requirement = 'offline_first';
        else if (toolObj.Conn === 'Mix') connectivity_requirement = 'low_bandwidth';
        else if (toolObj.Conn === 'On') connectivity_requirement = 'online_required';

        // Map hardware class
        let hardware_class = 'any_phone';
        if (toolObj.HW === '1') hardware_class = 'feature_phone_sms';
        else if (toolObj.HW === '2') hardware_class = 'any_phone';
        else if (toolObj.HW === '3') hardware_class = 'tablet_or_pc';
        else if (toolObj.HW === '4') hardware_class = 'desktop_lab';

        // Pricing model
        let pricing_model = toolObj.Mon || 'free_open_source';
        if (pricing_model === 'FM') pricing_model = 'freemium';
        else if (pricing_model === 'Sub') pricing_model = 'subscription';
        else if (pricing_model === 'F') pricing_model = 'free_open_source';

        // Founder epistemology
        let founder_epistemology = toolObj.Bg || 'practicing_educator';
        if (founder_epistemology === 'Tech') founder_epistemology = 'tech_outsider';
        else if (founder_epistemology === 'Teach' || founder_epistemology === 'Ed') founder_epistemology = 'practicing_educator';
        else if (founder_epistemology === 'Acad') founder_epistemology = 'academic_researcher';

        insertEdTechStmt.run(
          solution_id,
          name,
          toolObj.Country || 'Unknown',
          scope,
          parseInt(toolObj.Year, 10) || null,
          target_audience,
          pedagogical_model,
          connectivity_requirement,
          hardware_class,
          pricing_model,
          founder_epistemology,
          toolObj.Design_Fit_Assessment || null,
          toolObj.Trajectory || 'active_faithful',
          toolObj.Source_URLs || null,
          toolObj.Tier || null,
          toolObj.Business_Trajectory || null,
          toolObj.Intended_Population || null,
          toolObj.Ideology_Quote || null,
          JSON.stringify(toolObj)
        );
        ingestedCount++;
      }
    }

    // Also add sovereign platforms
    const sovereignPlatforms = [
      {
        solution_id: 'edtech:gurudevi_platform',
        name: 'Gurudevi Platform (IntuituiLabs)',
        origin_country: 'LKA',
        scope: 'sri_lanka_national',
        founding_year: 2026,
        target_audience: 'teachers',
        pedagogical_model: 'sanctuary',
        connectivity_requirement: 'offline_first',
        hardware_class: 'any_phone',
        pricing_model: 'free_open_source',
        founder_epistemology: 'practicing_educator',
        design_fit_assessment: 'Sovereign educator sanctuary and classroom ERP designed to protect teacher agency, track real classroom density, and eliminate statistical illusions.',
        trajectory_status: 'active_faithful',
        source_reference_url: 'https://intuituilabs.studio',
        evidence_tier: 'GOLD',
        business_trajectory: 'Sovereign local-first software, zero-subscription for teachers, community-hosted.',
        intended_population: 'Sri Lankan school teachers, multigrade primary classrooms, provincial school leaders',
        ideology_quote: 'The real teacher is not an employee of a delivery system, but the sovereign custodian of learning.'
      },
      {
        solution_id: 'edtech:gurugedara_tv',
        name: 'Gurugedara TV',
        origin_country: 'LKA',
        scope: 'sri_lanka_national',
        founding_year: 2020,
        target_audience: 'students',
        pedagogical_model: 'lecture_broadcast',
        connectivity_requirement: 'offline_first',
        hardware_class: 'smart_tv',
        pricing_model: 'free_open_source',
        founder_epistemology: 'practicing_educator',
        design_fit_assessment: 'State television educational broadcast (Eye/Nethra) serving zero-connectivity rural households during crisis periods.',
        trajectory_status: 'active_faithful',
        source_reference_url: 'https://moe.gov.lk',
        evidence_tier: 'A1',
        business_trajectory: 'State broadcast funded through Ministry of Education Vote 126 and SLRC.',
        intended_population: 'Rural estate and agrarian students with zero smartphone/broadband access',
        ideology_quote: 'Education must reach every household through terrestrial broadcast when broadband fails.'
      }
    ];

    for (const sp of sovereignPlatforms) {
      insertEdTechStmt.run(
        sp.solution_id, sp.name, sp.origin_country, sp.scope, sp.founding_year, sp.target_audience,
        sp.pedagogical_model, sp.connectivity_requirement, sp.hardware_class, sp.pricing_model,
        sp.founder_epistemology, sp.design_fit_assessment, sp.trajectory_status, sp.source_reference_url,
        sp.evidence_tier, sp.business_trajectory, sp.intended_population, sp.ideology_quote,
        JSON.stringify(sp)
      );
      ingestedCount++;
    }

    console.log(`✅ Ingested ${ingestedCount} EdTech solutions into catalog with full audit metadata.`);

    // 3. POPULATE SQA (SCHOOL QUALITY ASSESSMENT) 52-INDICATOR MATRIX (Key Sample Indicators)
    const sqaIndicators = [
      {
        indicator_id: 'sqa:dim1_ind1',
        dimension_no: 1,
        indicator_no: 1,
        title_en: 'Curriculum Scheme of Work & Syllabus Coverage',
        title_si: 'වාර්ෂික වැඩසටහන් හා විෂය නිර්දේශ ආවරණය',
        performance_levels_json: JSON.stringify({
          level_1: 'No written scheme of work; >30% syllabus uncompleted at year end',
          level_2: 'Basic scheme of work exists; syllabus completed through rushed cramming',
          level_3: 'Detailed scheme of work followed with timely term evaluations',
          level_4: 'Exemplary competency-based syllabus coverage with differentiated remedial support',
        }),
        historical_gaming_notes: 'Teachers frequently copied schemes of work from neighboring schools the day before Zonal inspection.',
      },
      {
        indicator_id: 'sqa:dim2_ind1',
        dimension_no: 2,
        indicator_no: 1,
        title_en: 'Active Classroom Pedagogy & Practical Experimentation',
        title_si: 'ක්‍රියාකාරකම් පාදක ඉගෙනුම් ක්‍රමවේද සහ ප්‍රායෝගික පරීක්ෂණ',
        performance_levels_json: JSON.stringify({
          level_1: 'Pure blackboard lecture & rote copying; zero student participation',
          level_2: 'Occasional teacher-led demonstrations without student hands-on time',
          level_3: 'Regular student group work and practical science experiments conducted',
          level_4: 'Inquiry-led discovery learning, student problem solving, and reflective portfolios',
        }),
        historical_gaming_notes: 'Staged "showcase experiments" prepared only when inspectors were physically on campus.',
      },
      {
        indicator_id: 'sqa:dim6_ind2',
        dimension_no: 6,
        indicator_no: 2,
        title_en: 'Laboratory Safety, Equipment Maintenance & Board of Survey Audits',
        title_si: 'විද්‍යාගාර ආරක්ෂාව, උපකරණ නඩත්තුව සහ භාණ්ඩ සමීක්ෂණ',
        performance_levels_json: JSON.stringify({
          level_1: 'Chemicals stored unsafely; equipment broken or condemned without survey',
          level_2: 'Basic equipment present but locked in cupboards; rarely used by students',
          level_3: 'Annual Board of Survey conducted; safe chemical disposal and functional labs',
          level_4: 'State-of-the-art laboratory protocols with full student utilization and zero backlog',
        }),
        historical_gaming_notes: 'Principals kept microscope cabinets locked out of fear that student breakage would trigger personal surcharge penalties.',
      },
      {
        indicator_id: 'sqa:dim7_ind3',
        dimension_no: 7,
        indicator_no: 3,
        title_en: 'Leadership Stability & Institutional Vision Implementation',
        title_si: 'නායකත්ව ස්ථායීතාවය සහ ආයතනික දැක්ම ක්‍රියාවට නැංවීම',
        performance_levels_json: JSON.stringify({
          level_1: 'Acting principal on temporary stint (<18 months); zero multi-year planning',
          level_2: 'Confirmed principal but reactive administration without strategic milestones',
          level_3: 'Stable confirmed tenure (3-5 years) with cohesive staff development plan',
          level_4: 'Visionary leadership (>5 years) driving transformative culture, SDS trust, and academic excellence',
        }),
        historical_gaming_notes: 'Rural schools were structurally trapped at Level 1 due to continuous SLEAS transfers.',
      },
      {
        indicator_id: 'sqa:dim8_ind1',
        dimension_no: 8,
        indicator_no: 1,
        title_en: 'School Development Society (SDS) Democratic Governance & Fund Integrity',
        title_si: 'පාසල් සංවර්ධන සමිතියේ (SDS) විනිවිදභාවය හා මුදල් කළමනාකරණය',
        performance_levels_json: JSON.stringify({
          level_1: 'SDS meetings unheld; accounts unaudited; parental discontent over donations',
          level_2: 'Annual AGM held nominally; funds spent ad-hoc without community consensus',
          level_3: 'Regular statutory SDS committee meetings; audited books presented to parents',
          level_4: 'Dynamic co-ownership between parents, alumni, and teachers driving substantial self-financed capital projects',
        }),
        historical_gaming_notes: 'Informal "voluntary donations" collected during Grade 1 admissions frequently bypassed SDS books.',
      },
    ];

    const insertSqaStmt = db.prepare(`
      INSERT OR REPLACE INTO sqa_indicator_matrix
      (indicator_id, dimension_no, indicator_no, title_en, title_si, performance_levels_json, historical_gaming_notes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    for (const s of sqaIndicators) {
      insertSqaStmt.run(s.indicator_id, s.dimension_no, s.indicator_no, s.title_en, s.title_si, s.performance_levels_json, s.historical_gaming_notes);
    }
    console.log(`✅ Populated ${sqaIndicators.length} SQA indicators with gaming notes.`);

    // 4. SEED SCHOOL FINANCE & BUDGET PROFILES (Demonstrating Financial Inversion)
    const financeProfiles = [
      {
        budget_id: 'fin:0117001_2024',
        school_census_no: '0117001', // Royal College Colombo (1AB National)
        fiscal_year: 2024,
        treasury_recurrent_lkr: 420000000,   // ~Rs. 420M state salaries for ~500 staff
        treasury_capital_lkr: 25000000,      // Rs. 25M state capital allocation
        per_pupil_state_spend_lkr: 49120,    // ~Rs. 49K per student/year
        sds_facility_fees_lkr: 35000000,     // Rs. 35M facility fees
        sds_donations_and_events_lkr: 85000000, // Rs. 85M admission donations & big match sponsorships
        sds_alumni_endowments_lkr: 60000000, // Rs. 60M Royal College Union (RCU) trust contributions
        sds_total_revenue_lkr: 180000000,    // Rs. 180M self-raised funds!
        sds_to_treasury_ratio: 7.2,          // SDS revenue is 7.2x larger than state capital allocation!
        notes: 'Elite national school funding model: massive alumni endowment enables private ICT teachers, swimming pool maintenance, and air-conditioned halls.',
      },
      {
        budget_id: 'fin:0611016_2024',
        school_census_no: '0611016', // Laxapana No 1 Tamil Vidyalaya (Type 3 Provincial)
        fiscal_year: 2024,
        treasury_recurrent_lkr: 4500000,     // ~Rs. 4.5M state salaries for 5 teachers
        treasury_capital_lkr: 150000,        // Rs. 150K minor maintenance allocation
        per_pupil_state_spend_lkr: 51660,    // ~Rs. 51K per student/year (inflated by low student base)
        sds_facility_fees_lkr: 45000,        // Rs. 45,000 collected (many families exempt under Aswesuma)
        sds_donations_and_events_lkr: 0,     // Zero corporate/event sponsors
        sds_alumni_endowments_lkr: 0,        // Zero alumni endowment
        sds_total_revenue_lkr: 45000,        // Total annual school self-funds: Rs. 45,000 ($150 USD)!
        sds_to_treasury_ratio: 0.3,          // Negligible private capital
        notes: 'Rural estate primary school reality: completely dependent on state block grant; zero private community surplus to fix broken roof tiles or buy printer paper.',
      },
      {
        budget_id: 'fin:1801013_2024',
        school_census_no: '1801013', // Maliyadeva College Kurunegala (1AB National)
        fiscal_year: 2024,
        treasury_recurrent_lkr: 260000000,
        treasury_capital_lkr: 18000000,
        per_pupil_state_spend_lkr: 53460,
        sds_facility_fees_lkr: 22000000,
        sds_donations_and_events_lkr: 45000000,
        sds_alumni_endowments_lkr: 30000000,
        sds_total_revenue_lkr: 97000000,     // Rs. 97M SDS revenue
        sds_to_treasury_ratio: 5.38,
        notes: 'Provincial capital flagship: strong agricultural & merchant alumni base funding smart classrooms and indoor sports stadium.',
      },
    ];

    const insertFinanceStmt = db.prepare(`
      INSERT OR REPLACE INTO school_finance_budgets
      (budget_id, school_census_no, fiscal_year, treasury_recurrent_lkr, treasury_capital_lkr,
       per_pupil_state_spend_lkr, sds_facility_fees_lkr, sds_donations_and_events_lkr, sds_alumni_endowments_lkr,
       sds_total_revenue_lkr, sds_to_treasury_ratio, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const f of financeProfiles) {
      insertFinanceStmt.run(
        f.budget_id, f.school_census_no, f.fiscal_year, f.treasury_recurrent_lkr, f.treasury_capital_lkr,
        f.per_pupil_state_spend_lkr, f.sds_facility_fees_lkr, f.sds_donations_and_events_lkr, f.sds_alumni_endowments_lkr,
        f.sds_total_revenue_lkr, f.sds_to_treasury_ratio, f.notes
      );
    }
    console.log(`✅ Seeded ${financeProfiles.length} school finance profiles illustrating the SDS funding inversion.`);

    db.exec('COMMIT;');
  } catch (err) {
    db.exec('ROLLBACK;');
    throw err;
  }

  console.log('🎉 EdResearch Bridge Execution Complete!');
}

run();
