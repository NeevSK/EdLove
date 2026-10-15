// apps/edlove-web/app/api/atlas/route.ts
// Local High-Performance Geo-Temporal Query Endpoint for Sri Lanka Education Atlas

import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import {
  GLOBAL_COMPARATIVE_SYSTEMS,
  SRI_LANKA_DISTRICTS,
  SRI_LANKA_PROVINCES,
} from '@repo/core/spatial';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export interface GovernanceRow {
  id: string;
  role_id: string;
  role_title: string;
  role_category: string;
  person_name: string;
  start_date: string;
  end_date: string | null;
  status: string;
}

export interface SubEntityRow {
  id: string;
  name: string;
  name_si: string | null;
  domain: string;
  founded_year: number | null;
  traditions_summary: string | null;
}

export interface ContactPointRow {
  contact_id: string;
  contact_type: string;
  contact_value: string;
  purpose: string;
  privacy_tier: string;
}

export interface CensusSnapshotRow {
  census_year: number;
  total_students: number;
  male_students: number;
  female_students: number;
  total_teachers: number;
  student_teacher_ratio: number | null;
  difficulty_level: string | null;
}

export interface LocationPingRow {
  id: string;
  user_role: string;
  latitude: number;
  longitude: number;
  accuracy_meters: number;
  delta_from_tentative_meters: number | null;
  status: string;
  created_at: string;
}

let _db: DatabaseSync | null = null;

function getDb(): DatabaseSync {
  if (!_db) {
    const defaultPath = 'c:/x/data/education-atlas/atlas_staging.db';
    const candidates: string[] = [
      path.resolve(process.cwd(), '../../data/education-atlas/atlas_staging.db'),
      path.resolve(process.cwd(), 'data/education-atlas/atlas_staging.db'),
      defaultPath,
    ];
    const dbPath = candidates.find((p) => fs.existsSync(p)) ?? defaultPath;
    _db = new DatabaseSync(dbPath);
    _db.exec('PRAGMA busy_timeout = 5000;');
  }
  return _db;
}

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('mode') || 'stats';
    const db = getDb();

    // 1. STATS OVERVIEW
    if (mode === 'stats') {
      const schoolStats = db
        .prepare(`
        SELECT category, count(*) as count 
        FROM schools 
        GROUP BY category 
        ORDER BY count DESC
      `)
        .all();

      const typeStats = db
        .prepare(`
        SELECT type, count(*) as count 
        FROM schools 
        GROUP BY type 
        ORDER BY count DESC
      `)
        .all();

      const totals = db
        .prepare(`
        SELECT 
          (SELECT count(*) FROM schools) as total_schools,
          (SELECT count(*) FROM resources) as total_resources,
          (SELECT count(*) FROM temporal_connections) as total_connections,
          (SELECT count(*) FROM entities) as total_entities,
          (SELECT count(*) FROM sources) as total_sources
      `)
        .get();

      return NextResponse.json({
        success: true,
        totals,
        school_categories: schoolStats,
        school_types: typeStats,
      });
    }

    // 2. SCHOOLS DIRECTORY / SEARCH
    if (mode === 'schools') {
      const search = searchParams.get('search');
      const district = searchParams.get('district');
      const category = searchParams.get('category');
      const type = searchParams.get('type');
      const limit = Math.min(100, parseInt(searchParams.get('limit') || '50', 10));

      if (search && search.trim()) {
        const cleanQuery = search.trim().replace(/['"]/g, '');
        const rows = db
          .prepare(`
          SELECT 
            s.census_no, s.name, s.name_si, s.name_ta, s.type, s.category,
            s.gender, s.medium, s.grade_span, s.total_students, s.difficulty_level,
            d.name as district_name, p.name as province_name
          FROM schools_fts f
          JOIN schools s ON s.rowid = f.rowid
          LEFT JOIN geo_districts d ON d.id = s.district_id
          LEFT JOIN geo_provinces p ON p.id = s.province_id
          WHERE schools_fts MATCH ?
          LIMIT ?
        `)
          .all(`${cleanQuery}*`, limit);

        return NextResponse.json({ success: true, count: rows.length, schools: rows });
      }

      // Filtered query
      let query = `
        SELECT 
          s.census_no, s.name, s.type, s.category, s.medium, s.grade_span,
          s.total_students, s.difficulty_level, d.name as district_name, p.name as province_name
        FROM schools s
        LEFT JOIN geo_districts d ON d.id = s.district_id
        LEFT JOIN geo_provinces p ON p.id = s.province_id
        WHERE 1=1
      `;
      const params: (string | number)[] = [];

      if (district) {
        query += ` AND s.district_id = ?`;
        params.push(district);
      }
      if (category) {
        query += ` AND s.category = ?`;
        params.push(category);
      }
      if (type) {
        query += ` AND s.type = ?`;
        params.push(type);
      }

      query += ` ORDER BY s.total_students DESC LIMIT ?`;
      params.push(limit);

      const rows = db.prepare(query).all(...params);
      return NextResponse.json({ success: true, count: rows.length, schools: rows });
    }

    // 3. SINGLE SCHOOL PROFILE & HISTORICAL DOSSIER
    if (mode === 'school') {
      const censusNo = searchParams.get('census_no');
      if (!censusNo) {
        return NextResponse.json({ success: false, error: 'census_no required' }, { status: 400 });
      }

      const school = db
        .prepare(`
        SELECT 
          s.*, d.name as district_name, p.name as province_name,
          z.name as zone_name, div.name as division_name
        FROM schools s
        LEFT JOIN geo_districts d ON d.id = s.district_id
        LEFT JOIN geo_provinces p ON p.id = s.province_id
        LEFT JOIN geo_zones z ON z.id = s.zone_id
        LEFT JOIN geo_divisions div ON div.id = s.division_id
        WHERE s.census_no = ?
      `)
        .get(censusNo);

      if (!school) {
        return NextResponse.json({ success: false, error: 'School not found' }, { status: 404 });
      }

      // Fetch linked historical records
      const connections = db
        .prepare(`
        SELECT 
          t.connection_id, t.predicate, t.valid_from, t.confidence,
          t.source_citation, t.notes, r.title, r.canonical_url, r.ingested_via
        FROM temporal_connections t
        LEFT JOIN resources r ON r.resource_id = t.document_ref_id
        WHERE t.subject_entity_id = ?
        ORDER BY t.valid_from DESC
      `)
        .all(`school:${censusNo}`);

      // Fetch governance & leadership tenures
      let governance: GovernanceRow[] = [];
      try {
        governance = db
          .prepare(`
          SELECT ro.occupancy_id as id, ro.role_code as role_id, rd.title_en as role_title, rd.authority_level as role_category,
                 p.canonical_name as person_name, ro.valid_from as start_date, ro.valid_to as end_date, ro.tenure_status as status
          FROM role_occupancies ro
          JOIN role_definitions rd ON rd.role_code = ro.role_code
          JOIN people p ON p.person_id = ro.person_id
          WHERE ro.entity_id = ?
          ORDER BY ro.valid_from DESC
        `)
          .all(`school:${censusNo}`) as unknown as GovernanceRow[];
      } catch {
        governance = [];
      }

      // Fetch co-curricular culture & societies
      let subEntities: SubEntityRow[] = [];
      try {
        subEntities = db
          .prepare(`
          SELECT sub_entity_id as id, name_en as name, name_si, domain, founded_year, traditions_summary
          FROM school_sub_entities
          WHERE school_census_no = ?
          ORDER BY domain, name_en
        `)
          .all(censusNo) as unknown as SubEntityRow[];
      } catch {
        subEntities = [];
      }

      // Fetch official & role desk contacts
      let contacts: ContactPointRow[] = [];
      try {
        contacts = db
          .prepare(`
          SELECT contact_id, contact_type, contact_value, purpose, privacy_tier
          FROM contact_points
          WHERE owner_scope = 'entity' AND owner_id = ?
          ORDER BY contact_type, purpose
        `)
          .all(censusNo) as unknown as ContactPointRow[];
      } catch {
        contacts = [];
      }

      // Fetch annual census snapshots (Temporal history & column drift)
      let censusSnapshots: CensusSnapshotRow[] = [];
      try {
        censusSnapshots = db
          .prepare(`
          SELECT census_year, total_students, male_students, female_students,
                 total_teachers, student_teacher_ratio, difficulty_level
          FROM school_annual_census_snapshots
          WHERE census_no = ?
          ORDER BY census_year ASC
        `)
          .all(censusNo) as unknown as CensusSnapshotRow[];
      } catch {
        censusSnapshots = [];
      }

      // Fetch citizen-sensor ground-truthing location pings
      let locationPings: LocationPingRow[] = [];
      try {
        locationPings = db
          .prepare(`
          SELECT id, user_role, latitude, longitude, accuracy_meters, delta_from_tentative_meters, status, created_at
          FROM school_location_pings
          WHERE census_no = ?
          ORDER BY created_at DESC
        `)
          .all(censusNo) as unknown as LocationPingRow[];
      } catch {
        locationPings = [];
      }

      // Fetch school finance & budget profile (Treasury vs. SDS Shadow Treasury)
      let finance = null;
      try {
        finance = db
          .prepare(`
          SELECT * FROM school_finance_budgets
          WHERE school_census_no = ?
          ORDER BY fiscal_year DESC
          LIMIT 1
        `)
          .get(censusNo);
      } catch {
        finance = null;
      }

      // Fetch school resource distribution profile
      let resourceDistribution = null;
      try {
        resourceDistribution = db
          .prepare(`
          SELECT * FROM school_resource_distribution_profiles
          WHERE school_census_no = ?
          LIMIT 1
        `)
          .get(censusNo);
      } catch {
        resourceDistribution = null;
      }

      return NextResponse.json({
        success: true,
        school,
        timeline: connections,
        governance,
        sub_entities: subEntities,
        contacts,
        census_history: censusSnapshots,
        location_pings: locationPings,
        finance,
        resource_distribution: resourceDistribution,
      });
    }

    // 4. TIMELINE SLICE
    if (mode === 'timeline') {
      const year = searchParams.get('year') || '2024';
      const limit = Math.min(100, parseInt(searchParams.get('limit') || '50', 10));

      const events = db
        .prepare(`
        SELECT 
          t.connection_id, t.subject_entity_id, t.predicate, t.valid_from,
          t.confidence, t.source_citation, t.notes
        FROM temporal_connections t
        WHERE t.valid_from LIKE ?
        ORDER BY t.valid_from DESC
        LIMIT ?
      `)
        .all(`${year}%`, limit);

      return NextResponse.json({ success: true, year, count: events.length, events });
    }

    // 5. QUALITY ASSURANCE FRAMEWORKS & SCHEMA DRIFT
    if (mode === 'quality') {
      const dimensions = db
        .prepare('SELECT * FROM education_quality_frameworks ORDER BY dimension_no ASC')
        .all();
      const drift = db
        .prepare('SELECT * FROM school_schema_drift_ledger ORDER BY census_year ASC')
        .all();
      return NextResponse.json({ success: true, dimensions, schema_drift: drift });
    }

    // 6. SCHOOL & GOVERNMENT PUBLIC FINANCE (Treasury, Provinces & SDS Inversion)
    if (mode === 'finance') {
      const censusNo = searchParams.get('census_no');
      const tier = searchParams.get('tier'); // central_treasury_line_ministry, provincial_council_devolved

      if (censusNo) {
        const budget = db
          .prepare(`
          SELECT b.*, s.name as school_name, s.type as school_type, s.category as school_category
          FROM school_finance_budgets b
          JOIN schools s ON s.census_no = b.school_census_no
          WHERE b.school_census_no = ?
          ORDER BY b.fiscal_year DESC
        `)
          .all(censusNo);
        return NextResponse.json({ success: true, count: budget.length, budget });
      }

      const schoolBudgets = db
        .prepare(`
        SELECT b.*, s.name as school_name, s.type as school_type, s.category as school_category
        FROM school_finance_budgets b
        JOIN schools s ON s.census_no = b.school_census_no
        ORDER BY b.sds_total_revenue_lkr DESC
      `)
        .all();

      let govQuery = 'SELECT * FROM government_education_budgets WHERE 1=1';
      const govParams: (string | number)[] = [];
      if (tier && tier !== 'all') {
        govQuery += ' AND budget_tier = ?';
        govParams.push(tier);
      }
      govQuery += ' ORDER BY fiscal_year DESC, total_allocation_lkr DESC';
      const govBudgets = db.prepare(govQuery).all(...govParams);

      return NextResponse.json({
        success: true,
        count: schoolBudgets.length,
        budgets: schoolBudgets,
        government_budgets: govBudgets,
      });
    }

    // 7. EDTECH SOLUTIONS & ECOSYSTEM CATALOG
    if (mode === 'edtech') {
      const scope = searchParams.get('scope');
      const pedagogy = searchParams.get('pedagogy');
      const search = searchParams.get('search');

      let query = 'SELECT * FROM edtech_solutions_catalog WHERE 1=1';
      const params: (string | number)[] = [];

      if (scope) {
        query += ' AND scope = ?';
        params.push(scope);
      }
      if (pedagogy) {
        query += ' AND pedagogical_model = ?';
        params.push(pedagogy);
      }
      if (search) {
        query += ' AND (name LIKE ? OR origin_country LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
      }

      query +=
        ' ORDER BY CASE WHEN scope = "sri_lanka_national" THEN 0 ELSE 1 END, founding_year ASC';
      const solutions = db.prepare(query).all(...params);
      return NextResponse.json({ success: true, count: solutions.length, solutions });
    }

    // 8. SQA 52-INDICATOR MATRIX & GAMING RUBRICS
    if (mode === 'sqa') {
      const dimensionNo = searchParams.get('dimension');
      let query = `
        SELECT m.*, d.title_en as dimension_title_en, d.title_si as dimension_title_si
        FROM sqa_indicator_matrix m
        JOIN education_quality_frameworks d ON d.dimension_no = m.dimension_no
        WHERE 1=1
      `;
      const params: (string | number)[] = [];

      if (dimensionNo) {
        query += ' AND m.dimension_no = ?';
        params.push(parseInt(dimensionNo, 10));
      }

      query += ' ORDER BY m.dimension_no ASC, m.indicator_no ASC';
      const indicators = db.prepare(query).all(...params);
      const dimensions = db
        .prepare('SELECT * FROM education_quality_frameworks ORDER BY dimension_no ASC')
        .all();
      return NextResponse.json({ success: true, count: indicators.length, indicators, dimensions });
    }

    // 9. RESEARCH MONOGRAPHS & INSTITUTIONAL HUBS
    if (mode === 'research') {
      const monographs = db
        .prepare(`
        SELECT resource_id, title, summary, resource_type, content_format, canonical_url, publication_date, ingested_via
        FROM resources
        WHERE resource_type = 'research_monograph' OR ingested_via = 'intuituilabs_edresearch'
        ORDER BY publication_date DESC
      `)
        .all();

      const researchSources = db
        .prepare(`
        SELECT source_id, name, short_name, source_kind, canonical_url
        FROM sources
        WHERE source_kind IN ('research_archive', 'higher_ed', 'official_national')
        ORDER BY name ASC
      `)
        .all();

      return NextResponse.json({
        success: true,
        count: monographs.length,
        monographs,
        research_sources: researchSources,
      });
    }

    // 10. UGC UNIVERSITY ADMISSIONS & Z-SCORE CUTOFFS
    if (mode === 'ugc') {
      const streamId = searchParams.get('stream');
      const programCode = searchParams.get('program');
      const districtId = searchParams.get('district');

      const streams = db.prepare('SELECT * FROM ugc_academic_streams ORDER BY stream_id ASC').all();
      const programs = db
        .prepare('SELECT * FROM ugc_degree_programs ORDER BY program_code ASC')
        .all();

      let query = `
        SELECT c.*, p.name_en as program_name_en, p.stream_id, s.name_en as stream_name_en
        FROM ugc_district_zscore_cutoffs c
        JOIN ugc_degree_programs p ON p.program_code = c.program_code
        JOIN ugc_academic_streams s ON s.stream_id = p.stream_id
        WHERE 1=1
      `;
      const params: (string | number)[] = [];

      if (programCode) {
        query += ' AND c.program_code = ?';
        params.push(programCode);
      }
      if (streamId) {
        query += ' AND p.stream_id = ?';
        params.push(streamId);
      }
      if (districtId) {
        query += ' AND c.district_id = ?';
        params.push(districtId);
      }

      query += ' ORDER BY c.program_code ASC, c.min_z_score DESC';
      const cutoffs = db.prepare(query).all(...params);

      return NextResponse.json({
        success: true,
        count: cutoffs.length,
        streams,
        programs,
        cutoffs,
      });
    }

    // 11. TERTIARY & VOCATIONAL INSTITUTIONS & PROGRAMS
    if (mode === 'tertiary') {
      const type = searchParams.get('type');
      const districtId = searchParams.get('district');
      const search = searchParams.get('search');
      const cluster = searchParams.get('cluster');
      const instId = searchParams.get('inst_id');

      let instQuery = `
        SELECT 
          i.*, 
          d.name as district_name, 
          p.name as province_name
        FROM higher_ed_institutions i
        LEFT JOIN geo_districts d ON d.id = i.district_id
        LEFT JOIN geo_provinces p ON p.id = i.province_id
        WHERE 1=1
      `;
      const instParams: (string | number)[] = [];

      if (type) {
        instQuery += ' AND i.inst_type = ?';
        instParams.push(type);
      }
      if (districtId) {
        instQuery += ' AND i.district_id = ?';
        instParams.push(districtId);
      }
      if (search && search.trim()) {
        instQuery += ' AND (i.name_en LIKE ? OR i.address_town LIKE ? OR i.notes LIKE ?)';
        const term = `%${search.trim()}%`;
        instParams.push(term, term, term);
      }

      instQuery += ' ORDER BY i.established_year ASC, i.name_en ASC';
      const institutions = db.prepare(instQuery).all(...instParams);

      // Query Programs
      let progQuery = `
        SELECT 
          p.*,
          i.name_en as institution_name_en,
          i.inst_type,
          i.address_town,
          d.name as district_name
        FROM tertiary_program_catalog p
        JOIN higher_ed_institutions i ON i.inst_id = p.inst_id
        LEFT JOIN geo_districts d ON d.id = i.district_id
        WHERE 1=1
      `;
      const progParams: (string | number)[] = [];

      if (cluster) {
        progQuery += ' AND p.domain_cluster = ?';
        progParams.push(cluster);
      }
      if (instId) {
        progQuery += ' AND p.inst_id = ?';
        progParams.push(instId);
      }

      progQuery += ' ORDER BY p.qualification_type ASC, p.approx_tuition_fee_lkr ASC';
      const programs = db.prepare(progQuery).all(...progParams);

      const nvqLevels = db
        .prepare('SELECT * FROM nvq_qualification_framework ORDER BY nvq_level ASC')
        .all();
      const instTypeCounts = db
        .prepare(
          'SELECT inst_type, count(*) as count FROM higher_ed_institutions GROUP BY inst_type',
        )
        .all();

      const facilities = db
        .prepare(`
        SELECT f.*, i.name_en as institution_name_en
        FROM higher_ed_facilities f
        JOIN higher_ed_institutions i ON i.inst_id = f.inst_id
        ORDER BY f.facility_type ASC
      `)
        .all();

      const leadership = db
        .prepare(`
        SELECT 
          ro.occupancy_id, ro.valid_from, ro.tenure_status,
          p.canonical_name, p.canonical_name_si, p.honors_prefix, p.qualifications_json, p.biographical_notes,
          r.title_en as role_title_en,
          e.entity_id, e.canonical_name as entity_name
        FROM role_occupancies ro
        JOIN people p ON p.person_id = ro.person_id
        JOIN role_definitions r ON r.role_code = ro.role_code
        JOIN entities e ON e.entity_id = ro.entity_id
        WHERE e.entity_type = 'higher_ed_institution'
        ORDER BY ro.valid_from DESC
      `)
        .all();

      return NextResponse.json({
        success: true,
        count: institutions.length,
        institutions,
        programs,
        nvq_levels: nvqLevels,
        type_counts: instTypeCounts,
        facilities,
        leadership,
      });
    }

    // 12. POST-SECONDARY TRANSITION PATHWAYS (SOVEREIGN DECISION ENGINE)
    if (mode === 'pathways') {
      const cohort = searchParams.get('cohort');
      const stream = searchParams.get('stream');
      const tier = searchParams.get('tier');

      let pathQuery = `
        SELECT * FROM pathway_transition_ledger
        WHERE 1=1
      `;
      const pathParams: (string | number)[] = [];

      if (cohort) {
        pathQuery += ' AND starting_cohort_status = ?';
        pathParams.push(cohort);
      }
      if (stream && stream !== 'all') {
        pathQuery += ' AND (academic_stream = ? OR academic_stream = "any")';
        pathParams.push(stream);
      }
      if (tier) {
        pathQuery += ' AND recommended_pathway_tier = ?';
        pathParams.push(tier);
      }

      pathQuery += ' ORDER BY time_to_employment_months ASC';
      const pathways = db.prepare(pathQuery).all(...pathParams);

      const nvqFramework = db
        .prepare('SELECT * FROM nvq_qualification_framework ORDER BY nvq_level ASC')
        .all();

      return NextResponse.json({
        success: true,
        count: pathways.length,
        pathways,
        nvq_framework: nvqFramework,
      });
    }

    // 13. URBAN PRIVATE CAMPUSES & TNE DEGREE FUNNEL
    if (mode === 'tne') {
      const awardModel = searchParams.get('model');
      const partnerCountry = searchParams.get('country');
      const search = searchParams.get('search');

      let funnelQuery = `
        SELECT 
          f.*,
          li.name_en as local_institution_name,
          li.address_town as local_town,
          fp.university_name as foreign_partner_name,
          fp.country as foreign_partner_country,
          fp.global_rank_band,
          fp.official_portal as partner_portal
        FROM tne_degree_funnel f
        JOIN higher_ed_institutions li ON li.inst_id = f.local_inst_id
        JOIN tne_foreign_partners fp ON fp.partner_id = f.foreign_partner_id
        WHERE 1=1
      `;
      const funnelParams: (string | number)[] = [];

      if (awardModel && awardModel !== 'all') {
        funnelQuery += ' AND f.award_model = ?';
        funnelParams.push(awardModel);
      }
      if (partnerCountry && partnerCountry !== 'all') {
        funnelQuery += ' AND fp.country = ?';
        funnelParams.push(partnerCountry);
      }
      if (search && search.trim()) {
        funnelQuery +=
          ' AND (f.program_name LIKE ? OR li.name_en LIKE ? OR fp.university_name LIKE ?)';
        const term = `%${search.trim()}%`;
        funnelParams.push(term, term, term);
      }

      funnelQuery += ' ORDER BY f.local_cost_lkr ASC';
      const funnels = db.prepare(funnelQuery).all(...funnelParams);

      const foreignPartners = db
        .prepare('SELECT * FROM tne_foreign_partners ORDER BY country ASC, university_name ASC')
        .all();
      const privateCampuses = db
        .prepare(`
        SELECT i.*, d.name as district_name 
        FROM higher_ed_institutions i
        LEFT JOIN geo_districts d ON d.id = i.district_id
        WHERE i.inst_type = 'semi_state_private_degree'
        ORDER BY i.annual_student_enrollment DESC
      `)
        .all();

      return NextResponse.json({
        success: true,
        count: funnels.length,
        funnels,
        partners: foreignPartners,
        private_campuses: privateCampuses,
      });
    }

    // 14. HIGHER EDUCATION & POSTGRADUATE SCHOLARSHIPS LEDGER
    if (mode === 'scholarships') {
      const level = searchParams.get('level');
      const tier = searchParams.get('tier');
      const destination = searchParams.get('destination');
      const search = searchParams.get('search');

      let schQuery = `
        SELECT * FROM higher_ed_scholarships
        WHERE 1=1
      `;
      const schParams: (string | number)[] = [];

      if (level && level !== 'all') {
        schQuery +=
          ' AND (academic_level = ? OR academic_level = "all_levels" OR academic_level = "bachelors_and_masters")';
        schParams.push(level);
      }
      if (tier && tier !== 'all') {
        schQuery += ' AND funding_tier = ?';
        schParams.push(tier);
      }
      if (destination && destination !== 'all') {
        schQuery += ' AND eligible_destinations LIKE ?';
        schParams.push(`%${destination}%`);
      }
      if (search && search.trim()) {
        schQuery +=
          ' AND (title_en LIKE ? OR awarding_entity LIKE ? OR eligibility_criteria LIKE ?)';
        const term = `%${search.trim()}%`;
        schParams.push(term, term, term);
      }

      schQuery += ' ORDER BY approx_annual_value_lkr DESC';
      const scholarships = db.prepare(schQuery).all(...schParams);

      const tierCounts = db
        .prepare(
          'SELECT funding_tier, count(*) as count FROM higher_ed_scholarships GROUP BY funding_tier',
        )
        .all();
      const levelCounts = db
        .prepare(
          'SELECT academic_level, count(*) as count FROM higher_ed_scholarships GROUP BY academic_level',
        )
        .all();

      return NextResponse.json({
        success: true,
        count: scholarships.length,
        scholarships,
        tier_counts: tierCounts,
        level_counts: levelCounts,
      });
    }

    // 15. EDUCATION CHARITIES, NGOS & FOUNDATIONS
    if (mode === 'charities') {
      const type = searchParams.get('type');
      const focus = searchParams.get('focus');
      const search = searchParams.get('search');

      let charQuery = 'SELECT * FROM education_charities_and_foundations WHERE 1=1';
      const charParams: (string | number)[] = [];

      if (type && type !== 'all') {
        charQuery += ' AND entity_type = ?';
        charParams.push(type);
      }
      if (focus && focus !== 'all') {
        charQuery += ' AND thematic_focus = ?';
        charParams.push(focus);
      }
      if (search && search.trim()) {
        charQuery +=
          ' AND (name_en LIKE ? OR flagship_initiatives_json LIKE ? OR strategic_advisory LIKE ?)';
        const term = `%${search.trim()}%`;
        charParams.push(term, term, term);
      }

      charQuery += ' ORDER BY annual_investment_est_lkr DESC';
      const charities = db.prepare(charQuery).all(...charParams);
      const typeCounts = db
        .prepare(
          'SELECT entity_type, count(*) as count FROM education_charities_and_foundations GROUP BY entity_type',
        )
        .all();
      const focusCounts = db
        .prepare(
          'SELECT thematic_focus, count(*) as count FROM education_charities_and_foundations GROUP BY thematic_focus',
        )
        .all();

      return NextResponse.json({
        success: true,
        count: charities.length,
        charities,
        type_counts: typeCounts,
        focus_counts: focusCounts,
      });
    }

    // 16. NATIONAL COMPETITIONS, SPORTS, AESTHETICS & STEM OLYMPIADS
    if (mode === 'competitions') {
      const category = searchParams.get('category');
      const search = searchParams.get('search');

      let compQuery = 'SELECT * FROM national_competitions_and_events WHERE 1=1';
      const compParams: (string | number)[] = [];

      if (category && category !== 'all') {
        compQuery += ' AND category = ?';
        compParams.push(category);
      }
      if (search && search.trim()) {
        compQuery +=
          ' AND (canonical_name_en LIKE ? OR governing_body LIKE ? OR traditions_and_cultural_significance LIKE ?)';
        const term = `%${search.trim()}%`;
        compParams.push(term, term, term);
      }

      compQuery += ' ORDER BY inception_year ASC';
      const competitions = db.prepare(compQuery).all(...compParams);
      const categoryCounts = db
        .prepare(
          'SELECT category, count(*) as count FROM national_competitions_and_events GROUP BY category',
        )
        .all();

      return NextResponse.json({
        success: true,
        count: competitions.length,
        competitions,
        category_counts: categoryCounts,
      });
    }

    // 17. CO-CURRICULAR MOVEMENTS & SUNDAY RELIGIOUS EDUCATION (DAHAM PASAL NETWORKS)
    if (mode === 'movements') {
      const type = searchParams.get('type');
      const faith = searchParams.get('faith');
      const search = searchParams.get('search');

      let movQuery = 'SELECT * FROM co_curricular_movements WHERE 1=1';
      const movParams: (string | number)[] = [];
      if (type && type !== 'all') {
        movQuery += ' AND movement_type = ?';
        movParams.push(type);
      }
      if (search && search.trim()) {
        movQuery +=
          ' AND (name_en LIKE ? OR name_si LIKE ? OR governing_body LIKE ? OR highest_honor_award LIKE ?)';
        const term = `%${search.trim()}%`;
        movParams.push(term, term, term, term);
      }
      movQuery += ' ORDER BY annual_student_cadre_est DESC';
      const movements = db.prepare(movQuery).all(...movParams);

      let dhammaQuery = 'SELECT * FROM dhamma_school_networks WHERE 1=1';
      const dhammaParams: (string | number)[] = [];
      if (faith && faith !== 'all') {
        dhammaQuery += ' AND faith_tradition = ?';
        dhammaParams.push(faith);
      }
      if (search && search.trim()) {
        dhammaQuery +=
          ' AND (name_en LIKE ? OR name_si LIKE ? OR operating_venues LIKE ? OR governing_state_department LIKE ?)';
        const term = `%${search.trim()}%`;
        dhammaParams.push(term, term, term, term);
      }
      dhammaQuery += ' ORDER BY estimated_student_enrollment DESC';
      const dhammaNetworks = db.prepare(dhammaQuery).all(...dhammaParams);

      interface MovementsAggRow {
        total_movements: number;
        total_cadre: number | null;
      }
      const movAgg = db
        .prepare(`
        SELECT count(*) as total_movements, sum(annual_student_cadre_est) as total_cadre
        FROM co_curricular_movements
      `)
        .get() as unknown as MovementsAggRow;

      interface DhammaAggRow {
        total_networks: number;
        total_units: number | null;
        total_students: number | null;
        total_teachers: number | null;
      }
      const dhammaAgg = db
        .prepare(`
        SELECT count(*) as total_networks, sum(estimated_school_units) as total_units,
               sum(estimated_student_enrollment) as total_students, sum(volunteer_teaching_force_est) as total_teachers
        FROM dhamma_school_networks
      `)
        .get() as unknown as DhammaAggRow;

      const movementTypes = db
        .prepare(
          'SELECT movement_type, count(*) as count FROM co_curricular_movements GROUP BY movement_type',
        )
        .all();
      const faithTraditions = db
        .prepare(
          'SELECT faith_tradition, count(*) as count FROM dhamma_school_networks GROUP BY faith_tradition',
        )
        .all();

      return NextResponse.json({
        success: true,
        movements,
        dhamma_networks: dhammaNetworks,
        summary: {
          total_movements: movAgg?.total_movements ?? 0,
          total_cadre: movAgg?.total_cadre ?? 0,
          total_dhamma_networks: dhammaAgg?.total_networks ?? 0,
          total_dhamma_units: dhammaAgg?.total_units ?? 0,
          total_dhamma_students: dhammaAgg?.total_students ?? 0,
          total_dhamma_teachers: dhammaAgg?.total_teachers ?? 0,
        },
        movement_types: movementTypes,
        faith_traditions: faithTraditions,
      });
    }

    // 18. SCHOOL RESOURCE DISTRIBUTION & SPATIAL DISPARITIES
    if (mode === 'distribution') {
      const tier = searchParams.get('tier');
      const district = searchParams.get('district');
      const water = searchParams.get('water');
      const science = searchParams.get('science');
      const pool = searchParams.get('pool');
      const search = searchParams.get('search');

      let distQuery = `
        SELECT p.*, s.name_en as school_name, s.name_si as school_name_si, s.name_ta as school_name_ta,
               s.district, s.zone, s.division, s.school_type, s.student_count, s.teacher_count
        FROM school_resource_distribution_profiles p
        JOIN schools s ON p.school_census_no = s.census_no
        WHERE 1=1
      `;
      const distParams: (string | number)[] = [];

      if (tier && tier !== 'all') {
        distQuery += ' AND p.sports_infrastructure_tier = ?';
        distParams.push(tier);
      }
      if (district && district !== 'all') {
        distQuery += ' AND s.district = ?';
        distParams.push(district);
      }
      if (water && water !== 'all') {
        distQuery += ' AND p.drinking_water_source = ?';
        distParams.push(water);
      }
      if (science !== null && science !== undefined && science !== 'all') {
        distQuery += ' AND p.al_science_capable = ?';
        distParams.push(science === '1' ? 1 : 0);
      }
      if (pool !== null && pool !== undefined && pool !== 'all') {
        distQuery += ' AND p.swimming_pool_available = ?';
        distParams.push(pool === '1' ? 1 : 0);
      }
      if (search && search.trim()) {
        distQuery += ' AND (s.name_en LIKE ? OR s.census_no LIKE ? OR p.notes LIKE ?)';
        const term = `%${search.trim()}%`;
        distParams.push(term, term, term);
      }

      distQuery +=
        ' ORDER BY p.swimming_pool_available DESC, p.cricket_turf_available DESC, p.functional_computer_terminals DESC';
      const profiles = db.prepare(distQuery).all(...distParams);

      interface DisparityStatsRow {
        total_profiles: number;
        pools_count: number | null;
        turf_count: number | null;
        al_science_count: number | null;
        midday_meal_count: number | null;
        total_computers: number | null;
      }
      const stats = db
        .prepare(`
        SELECT count(*) as total_profiles,
               sum(swimming_pool_available) as pools_count,
               sum(cricket_turf_available) as turf_count,
               sum(al_science_capable) as al_science_count,
               sum(midday_meal_beneficiary) as midday_meal_count,
               sum(functional_computer_terminals) as total_computers
        FROM school_resource_distribution_profiles
      `)
        .get() as unknown as DisparityStatsRow;

      const sportsTierCounts = db
        .prepare(`
        SELECT sports_infrastructure_tier, count(*) as count 
        FROM school_resource_distribution_profiles 
        GROUP BY sports_infrastructure_tier
      `)
        .all();

      const aestheticStatusCounts = db
        .prepare(`
        SELECT aesthetic_teacher_status, count(*) as count 
        FROM school_resource_distribution_profiles 
        GROUP BY aesthetic_teacher_status
      `)
        .all();

      const waterSourceCounts = db
        .prepare(`
        SELECT drinking_water_source, count(*) as count 
        FROM school_resource_distribution_profiles 
        GROUP BY drinking_water_source
      `)
        .all();

      return NextResponse.json({
        success: true,
        count: profiles.length,
        profiles,
        stats: {
          total_profiles: stats?.total_profiles ?? 0,
          pools_count: stats?.pools_count ?? 0,
          turf_count: stats?.turf_count ?? 0,
          al_science_count: stats?.al_science_count ?? 0,
          midday_meal_count: stats?.midday_meal_count ?? 0,
          total_computers: stats?.total_computers ?? 0,
        },
        sports_tier_counts: sportsTierCounts,
        aesthetic_status_counts: aestheticStatusCounts,
        water_source_counts: waterSourceCounts,
      });
    }

    if (mode === 'spatial') {
      const db = getDb();
      const districtCode = searchParams.get('district');
      const limit = Math.min(300, Number(searchParams.get('limit')) || 150);

      interface SpatialSchoolQueryRow {
        census_no: string;
        name: string;
        name_si: string | null;
        name_ta: string | null;
        category: string;
        type: string;
        latitude: number;
        longitude: number;
        coord_precision: string | null;
        total_students: number | null;
        district_name: string | null;
        district_code: string | null;
      }

      let schools: SpatialSchoolQueryRow[] = [];
      if (districtCode) {
        schools = db
          .prepare(`
          SELECT s.census_no, s.name, s.name_si, s.name_ta, s.category, s.type, 
                 s.latitude, s.longitude, s.coord_precision, s.total_students,
                 d.name as district_name, d.code as district_code
          FROM schools s
          LEFT JOIN geo_districts d ON s.district_id = d.id
          WHERE (d.code = ? OR d.id = ? OR d.name LIKE ?)
            AND s.latitude IS NOT NULL AND s.longitude IS NOT NULL
          ORDER BY s.total_students DESC
          LIMIT ?
        `)
          .all(
            districtCode,
            districtCode,
            `%${districtCode}%`,
            limit,
          ) as unknown as SpatialSchoolQueryRow[];
      }

      return NextResponse.json({
        success: true,
        districts: SRI_LANKA_DISTRICTS,
        provinces: SRI_LANKA_PROVINCES,
        global: GLOBAL_COMPARATIVE_SYSTEMS,
        schools_count: schools.length,
        schools,
      });
    }

    return NextResponse.json({ success: false, error: `Unknown mode: ${mode}` }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

function haversineMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3;
  const p1 = (lat1 * Math.PI) / 180;
  const p2 = (lat2 * Math.PI) / 180;
  const dp = ((lat2 - lat1) * Math.PI) / 180;
  const dl = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dp / 2) * Math.sin(dp / 2) +
    Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) * Math.sin(dl / 2);
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      mode,
      census_no,
      user_id,
      user_role,
      latitude,
      longitude,
      altitude,
      accuracy_meters,
      proof_image_url,
      device_info,
    } = body;

    if (mode === 'verify-location') {
      if (!census_no || latitude == null || longitude == null) {
        return NextResponse.json(
          { success: false, error: 'census_no, latitude, and longitude are required' },
          { status: 400 },
        );
      }

      const db = getDb();
      interface SchoolCoordsRow {
        census_no: string;
        latitude: number | null;
        longitude: number | null;
        coord_precision: string | null;
      }
      const school = db
        .prepare(
          'SELECT census_no, latitude, longitude, coord_precision FROM schools WHERE census_no = ?',
        )
        .get(census_no) as unknown as SchoolCoordsRow | undefined;
      if (!school) {
        return NextResponse.json({ success: false, error: 'School not found' }, { status: 404 });
      }

      let deltaMeters: number | null = null;
      if (school.latitude != null && school.longitude != null) {
        deltaMeters = haversineMeters(
          Number(school.latitude),
          Number(school.longitude),
          Number(latitude),
          Number(longitude),
        );
      }

      const pingId = `ping_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const accuracy = Number(accuracy_meters) || 10;
      const role = user_role || 'citizen';

      // Insert ping into citizen-sensor ledger
      db.prepare(`
        INSERT INTO school_location_pings 
        (id, census_no, user_id, user_role, latitude, longitude, altitude, accuracy_meters, proof_image_url, device_info_json, delta_from_tentative_meters, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        pingId,
        census_no,
        user_id || null,
        role,
        latitude,
        longitude,
        altitude || null,
        accuracy,
        proof_image_url || null,
        device_info ? JSON.stringify(device_info) : null,
        deltaMeters,
        role === 'principal' ? 'verified' : 'pending',
      );

      // Transition if verified by principal or high-accuracy teacher
      let transitioned = false;
      if (role === 'principal' || (role === 'teacher' && accuracy <= 15)) {
        db.prepare(`
          UPDATE schools
          SET latitude = ?, longitude = ?, coord_precision = 'ground_truthed', updated_at = CURRENT_TIMESTAMP
          WHERE census_no = ?
        `).run(latitude, longitude, census_no);
        transitioned = true;
      }

      return NextResponse.json({
        success: true,
        ping_id: pingId,
        delta_from_tentative_meters: deltaMeters,
        status: transitioned ? 'ground_truthed' : 'pending_consensus',
        message: transitioned
          ? `School location verified and ground-truthed! Offset from tentative centroid: ${deltaMeters}m.`
          : `Location ping recorded (${deltaMeters}m offset). Awaiting role consensus.`,
      });
    }

    return NextResponse.json({ success: false, error: `Unknown mode: ${mode}` }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
