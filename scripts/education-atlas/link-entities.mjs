// scripts/education-atlas/link-entities.mjs
// Expanded Automated Entity Linker & Multi-Source Triangulator for Sri Lanka Education Atlas

import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, '../../data/education-atlas/atlas_staging.db');

const args = process.argv.slice(2);
const IS_COMMIT = args.includes('--commit');
const IS_DRY_RUN = !IS_COMMIT || args.includes('--dry-run');

console.log('🔗 [EXPANDED ENTITY LINKER & TRIANGULATOR] Starting Scan...');
console.log(`📌 Database Path: ${dbPath}`);
console.log(`⚙️  Mode:          ${IS_DRY_RUN ? 'DRY-RUN (Simulated in-memory, no writes)' : 'COMMIT (Writing to SQLite)'}`);

const db = new DatabaseSync(dbPath);

// 1. Expanded Trilingual Entity Matchers (National Bodies, Universities, Exams, Teacher Colleges)
const ENTITY_MATCHERS = [
    // ── Tier 1: Central Regulatory & Governing Bodies ──
    {
        entity_id: 'inst:moe_lk',
        canonical_name: 'Ministry of Education Sri Lanka',
        sector: 'state_education',
        regex: /(Ministry of Education|Education Ministry|Isurupaya|අධ්‍යාපන අමාත්‍යාංශ|අධ්‍යාපන ඇමති|கல்வி அமைச்சு|கல்வி அமைச்சர்)/i,
        predicate: 'mandated_or_administered_by'
    },
    {
        entity_id: 'inst:doenets_lk',
        canonical_name: 'Department of Examinations Sri Lanka',
        sector: 'state_education',
        regex: /(Department of Examinations|DoENets|Pelawatta Exam|විභාග දෙපාර්තමේන්තු|විභාග කොමසාරිස්|பரீட்சைத் திணைக்கள|பரீட்சை ஆணையாளர்)/i,
        predicate: 'examined_or_administered_by'
    },
    {
        entity_id: 'inst:nie_lk',
        canonical_name: 'National Institute of Education',
        sector: 'state_education',
        regex: /(National Institute of Education|Maharagama NIE|Channel NIE|ජාතික අධ්‍යාපන ආයතන|தேசிய கல்வி நிறுவகம்)/i,
        predicate: 'curriculum_or_guided_by'
    },
    {
        entity_id: 'inst:ugc_lk',
        canonical_name: 'University Grants Commission',
        sector: 'higher_ed',
        regex: /(University Grants Commission|\bUGC\b|විශ්වවිද්‍යාල ප්‍රතිපාදන|பல்கலைக்கழக மானியங்கள்)/i,
        predicate: 'regulated_by'
    },
    {
        entity_id: 'inst:psc_lk',
        canonical_name: 'Public Service Commission',
        sector: 'civil_service',
        regex: /(Public Service Commission|\bPSC\b|රාජ්‍ය සේවා කොමිෂන්|அரச சேவை ஆணைக்குழு)/i,
        predicate: 'service_minute_governed_by'
    },
    {
        entity_id: 'inst:nec_lk',
        canonical_name: 'National Education Commission',
        sector: 'state_education',
        regex: /(National Education Commission|\bNEC\b|ජාතික අධ්‍යාපන කොමිෂන්|தேசிய கல்வி ஆணைக்குழு)/i,
        predicate: 'policy_advised_by'
    },
    {
        entity_id: 'inst:tvec_lk',
        canonical_name: 'Tertiary and Vocational Education Commission',
        sector: 'vocational_training',
        regex: /(Tertiary and Vocational Education Commission|\bTVEC\b|NVQ|තෘතියික හා වෘත්තීය අධ්‍යාපන|மூன்றாம் நிலை மற்றும் தொழிற்கல்வி)/i,
        predicate: 'vocational_standardized_by'
    },
    {
        entity_id: 'inst:cbsl_lk',
        canonical_name: 'Central Bank of Sri Lanka',
        sector: 'monetary_policy',
        regex: /(Central Bank of Sri Lanka|Central Bank|\bCBSL\b|මහ බැංකු|මහබැංකු|மத்திய வங்கி)/i,
        predicate: 'economic_oversight_by'
    },

    // ── Tier 2: National Examination Cohorts ──
    {
        entity_id: 'exam:gce_al',
        canonical_name: 'G.C.E. Advanced Level (A/L)',
        sector: 'national_examinations',
        regex: /(Advanced Level|\bA\/L\b|\bAL exam\b|උසස් පෙළ|උ\.පෙළ|උසස්පෙළ|உயர்தர|உயர்தரப் பரீட்சை)/i,
        predicate: 'targets_examination_cohort'
    },
    {
        entity_id: 'exam:gce_ol',
        canonical_name: 'G.C.E. Ordinary Level (O/L)',
        sector: 'national_examinations',
        regex: /(Ordinary Level|\bO\/L\b|\bOL exam\b|සාමාන්‍ය පෙළ|සා\.පෙළ|සාමාන්‍යපෙළ|சாதாரண தர|சாதாரணப் பரீட்சை)/i,
        predicate: 'targets_examination_cohort'
    },
    {
        entity_id: 'exam:grade5_scholarship',
        canonical_name: 'Grade 5 Scholarship Examination',
        sector: 'national_examinations',
        regex: /(Grade 5 Scholarship|Grade 05 Scholarship|Scholarship Exam|ශිෂ්‍යත්ව|5 ශිෂ්‍යත්ව|ශිෂ්‍යත්ව විභාග|புலமைப்பரிசில்|தரம் 5 புலமைப்பரிசில்)/i,
        predicate: 'targets_examination_cohort'
    },

    // ── Tier 3: Major State Universities ──
    {
        entity_id: 'uni:colombo',
        canonical_name: 'University of Colombo',
        sector: 'higher_ed',
        regex: /(University of Colombo|Colombo University|කොළඹ විශ්වවිද්‍යාල|கொழும்புப் பல்கலைக்கழக)/i,
        predicate: 'academic_entity_affiliated'
    },
    {
        entity_id: 'uni:peradeniya',
        canonical_name: 'University of Peradeniya',
        sector: 'higher_ed',
        regex: /(University of Peradeniya|Peradeniya University|පේරාදෙණිය විශ්වවිද්‍යාල|பேராதனைப் பல்கலைக்கழக)/i,
        predicate: 'academic_entity_affiliated'
    },
    {
        entity_id: 'uni:moratuwa',
        canonical_name: 'University of Moratuwa',
        sector: 'higher_ed',
        regex: /(University of Moratuwa|Moratuwa University|මොරටුව විශ්වවිද්‍යාල|மொறட்டுவைப் பல்கலைக்கழக)/i,
        predicate: 'academic_entity_affiliated'
    },
    {
        entity_id: 'uni:japura',
        canonical_name: 'University of Sri Jayewardenepura',
        sector: 'higher_ed',
        regex: /(Sri Jayewardenepura|University of Jayewardenepura|ජයවර්ධනපුර විශ්වවිද්‍යාල|ஜயவர்தனபுர)/i,
        predicate: 'academic_entity_affiliated'
    },
    {
        entity_id: 'uni:kelaniya',
        canonical_name: 'University of Kelaniya',
        sector: 'higher_ed',
        regex: /(University of Kelaniya|Kelaniya University|කැලණිය විශ්වවිද්‍යාල|களனிப் பல்கலைக்கழக)/i,
        predicate: 'academic_entity_affiliated'
    },
    {
        entity_id: 'uni:jaffna',
        canonical_name: 'University of Jaffna',
        sector: 'higher_ed',
        regex: /(University of Jaffna|Jaffna University|යාපනය විශ්වවිද්‍යාල|யாழ்ப்பாணப் பல்கலைக்கழக)/i,
        predicate: 'academic_entity_affiliated'
    },
    {
        entity_id: 'uni:ruhuna',
        canonical_name: 'University of Ruhuna',
        sector: 'higher_ed',
        regex: /(University of Ruhuna|Ruhuna University|රුහුණ විශ්වවිද්‍යාල|ருஹுணுப் பல்கலைக்கழக)/i,
        predicate: 'academic_entity_affiliated'
    },
    {
        entity_id: 'uni:ousl',
        canonical_name: 'Open University of Sri Lanka',
        sector: 'higher_ed',
        regex: /(Open University of Sri Lanka|\bOUSL\b|විවෘත විශ්වවිද්‍යාල|இலங்கை திறந்த பல்கலைக்கழக)/i,
        predicate: 'academic_entity_affiliated'
    },

    // ── Tier 4: Teacher Training & College Systems ──
    {
        entity_id: 'inst:ncoe',
        canonical_name: 'National Colleges of Education (Vidya Peeta)',
        sector: 'teacher_education',
        regex: /(National Colleges of Education|\bNCOE\b|විද්‍යාපීඨ|විද්‍යා පීඨ|ජාතික අධ්‍යාපන විද්‍යාපීඨ|தேசிய கல்வியியற் கல்லூரி)/i,
        predicate: 'teacher_training_governed_by'
    },
    {
        entity_id: 'inst:slts',
        canonical_name: 'Sri Lanka Teacher Service',
        sector: 'teacher_education',
        regex: /(Sri Lanka Teacher Service|Teacher Service Minute|ගුරු සේව|ගුරු සේවා|ஆசிரியர் சேவை)/i,
        predicate: 'teacher_service_governed_by'
    },

    // ── Tier 5: Executive, Legislative & Judicial Governance ──
    {
        entity_id: 'inst:cabinet_office_lk',
        canonical_name: 'Cabinet Office of Sri Lanka',
        sector: 'executive_governance',
        regex: /(Cabinet of Ministers|Cabinet Decision|Cabinet Memorandum|අමාත්‍ය මණ්ඩල|කැබිනට් තීරණ|කැබිනට් මණ්ඩල|அமைச்சரவை)/i,
        predicate: 'policy_determined_by'
    },
    {
        entity_id: 'inst:parliament_lk',
        canonical_name: 'Parliament of Sri Lanka',
        sector: 'legislative_governance',
        regex: /(Parliament of Sri Lanka|\bHansard\b|පාර්ලිමේන්තු|හන්සාඩ්|பாராளுமன்ற|ஹன்சாட்)/i,
        predicate: 'legislated_or_debated_by'
    },
    {
        entity_id: 'inst:supreme_court_lk',
        canonical_name: 'Supreme Court of Sri Lanka',
        sector: 'judiciary',
        regex: /(Supreme Court|Fundamental Rights|\bSC FR\b|ශ්‍රේෂ්ඨාධිකරණ|මූලික අයිතිවාසිකම්|உயர் நீதிமன்றம்)/i,
        predicate: 'judicially_determined_by'
    },

    // ── Tier 6: Research Institutes & Think Tanks ──
    {
        entity_id: 'inst:verite_research',
        canonical_name: 'Verité Research',
        sector: 'civic_research',
        regex: /(Verité Research|Verite Research|\bVerite\b|PublicFinance\.lk|වෙරිටේ)/i,
        predicate: 'researched_or_analyzed_by'
    },
    {
        entity_id: 'inst:ips_lk',
        canonical_name: 'Institute of Policy Studies of Sri Lanka',
        sector: 'state_research',
        regex: /(Institute of Policy Studies|\bIPS\b|ප්‍රතිපත්ති අධ්‍යයන ආයතන)/i,
        predicate: 'researched_or_analyzed_by'
    },
    {
        entity_id: 'inst:cepa_lk',
        canonical_name: 'Centre for Poverty Analysis',
        sector: 'civic_research',
        regex: /(Centre for Poverty Analysis|\bCEPA\b|දිළිඳුබව විශ්ලේෂණ)/i,
        predicate: 'researched_or_analyzed_by'
    },
    {
        entity_id: 'inst:lirneasia_lk',
        canonical_name: 'LIRNEasia',
        sector: 'civic_research',
        regex: /(LIRNEasia|LIRNE Asia|ලර්න්ඒෂියා)/i,
        predicate: 'researched_or_analyzed_by'
    },
    {
        entity_id: 'inst:cpa_lk',
        canonical_name: 'Centre for Policy Alternatives',
        sector: 'civic_research',
        regex: /(Centre for Policy Alternatives|\bCPA\b|විකල්ප ප්‍රතිපත්ති කේන්ද්‍ර)/i,
        predicate: 'researched_or_analyzed_by'
    },
    {
        entity_id: 'inst:advocata_lk',
        canonical_name: 'Advocata Institute',
        sector: 'civic_research',
        regex: /(Advocata Institute|\bAdvocata\b|Bath Curry Index|ඇඩ්වොකාටා)/i,
        predicate: 'researched_or_analyzed_by'
    },
    {
        entity_id: 'inst:dcs_lk',
        canonical_name: 'Department of Census and Statistics',
        sector: 'state_research',
        regex: /(Department of Census and Statistics|\bDCS\b|School Census|ජනලේඛන හා සංඛ්‍යාලේඛන)/i,
        predicate: 'statistical_baseline_by'
    },
    {
        entity_id: 'inst:lsf_lk',
        canonical_name: 'Lanka Software Foundation',
        sector: 'open_technology',
        regex: /(Lanka Software Foundation|\bLSF\b|ලංකා මෘදුකාංග පදනම)/i,
        predicate: 'technology_partner'
    },

    // ── Tier 7: Media Conglomerates & Key Publishers ──
    {
        entity_id: 'inst:dgi_lk',
        canonical_name: 'Department of Government Information',
        sector: 'state_media',
        regex: /(Department of Government Information|news\.lk|රජයේ ප්‍රවෘත්ති දෙපාර්තමේන්තුව|அரசாங்க தகவல்)/i,
        predicate: 'public_announcement_by'
    },
    {
        entity_id: 'inst:helakuru_esana',
        canonical_name: 'Helakuru Esana (Bhasha Lanka)',
        sector: 'digital_media',
        regex: /(Helakuru|Esana|හෙළකුරු|එසැණ)/i,
        predicate: 'breaking_alert_dispatched_by'
    },
    {
        entity_id: 'inst:wijeya_news',
        canonical_name: 'Wijeya Newspapers',
        sector: 'mainstream_media',
        regex: /(Daily Mirror|Sunday Times|Lankadeepa|Daily FT|Tamil Mirror|විජය පුවත්පත්)/i,
        predicate: 'reported_by'
    },
    {
        entity_id: 'inst:ancl_lakehouse',
        canonical_name: 'Associated Newspapers of Ceylon Limited (Lake House)',
        sector: 'state_media',
        regex: /(Lake House|Daily News|Dinamina|Thinakaran|Sunday Observer|Silumina|ලේක්හවුස්|දිනමිණ)/i,
        predicate: 'reported_by'
    },
    {
        entity_id: 'inst:maharaja_news',
        canonical_name: 'Capital Maharaja Group (NewsFirst)',
        sector: 'mainstream_media',
        regex: /(NewsFirst|Sirasa|Shakthi|Capital Maharaja|නිව්ස්ෆස්ට්|සිරස)/i,
        predicate: 'reported_by'
    },
    {
        entity_id: 'inst:derana_macro',
        canonical_name: 'Derana Macro Entertainment (Ada Derana)',
        sector: 'mainstream_media',
        regex: /(Ada Derana|Derana|අද දෙරණ|දෙරණ)/i,
        predicate: 'reported_by'
    },
    {
        entity_id: 'inst:virakesari_corp',
        canonical_name: 'Express Newspapers (Virakesari)',
        sector: 'mainstream_media',
        regex: /(Virakesari|Thinakkural|வீரகேசரி|தினக்குரல்)/i,
        predicate: 'reported_by'
    },
    {
        entity_id: 'inst:echelon_media',
        canonical_name: 'Echelon Media (EconomyNext)',
        sector: 'financial_media',
        regex: /(EconomyNext|Echelon|එචිලෝන්)/i,
        predicate: 'reported_by'
    }
];

// Ensure entities exist in database
if (!IS_DRY_RUN) {
    const upsertEntityStmt = db.prepare(`
        INSERT INTO entities (entity_id, entity_type, canonical_name, sector)
        VALUES (?, 'regulatory_body', ?, ?)
        ON CONFLICT(entity_id) DO NOTHING;
    `);
    for (const em of ENTITY_MATCHERS) {
        upsertEntityStmt.run(em.entity_id, em.canonical_name, em.sector);
    }
}

// 2. Fetch all resources
const resources = db.prepare(`
    SELECT 
        resource_id, 
        source_id, 
        title, 
        summary, 
        resource_type, 
        canonical_url, 
        circular_number,
        COALESCE(publication_date, gazette_date) as event_date,
        ingested_via
    FROM resources
`).all();

console.log(`📦 Loaded ${resources.length} resources from database.\n`);

// 3. TCDI Source Weights
const SOURCE_WEIGHTS = {
    cabinet_adapter: 0.90,
    gazette_harvester: 0.85,
    ldf_adapter: 0.85,
    nuuuwan_adapter: 0.40,
    telegram_monitor: 0.20,
    manus_export: 0.60,
    default: 0.30
};

function computeConfidence(res) {
    const baseWeight = SOURCE_WEIGHTS[res.ingested_via] || SOURCE_WEIGHTS.default;
    let multiplier = 1.0;
    
    if (res.circular_number) multiplier += 0.20;
    if (res.canonical_url && res.canonical_url.includes('.gov.lk')) multiplier += 0.15;
    if (res.event_date) multiplier += 0.10;
    
    return Math.min(1.0, parseFloat((baseWeight * multiplier).toFixed(3)));
}

// 4. Run Matching & Triangulation
const generatedEdges = [];
const entityStats = {};
const sourceStats = {};
const dateClusters = {};

for (const em of ENTITY_MATCHERS) {
    entityStats[em.entity_id] = 0;
}

for (const res of resources) {
    const textToScan = `${res.title || ''} ${res.summary || ''} ${res.circular_number || ''}`;
    
    for (const em of ENTITY_MATCHERS) {
        if (em.regex.test(textToScan)) {
            const confidence = computeConfidence(res);
            const edge = {
                connection_id: `edge:${em.entity_id}:${res.resource_id}`,
                subject_entity_id: em.entity_id,
                predicate: em.predicate,
                object_resource_id: res.resource_id,
                title: res.title,
                event_date: res.event_date || 'UNDATED',
                source_channel: res.ingested_via,
                canonical_url: res.canonical_url,
                circular_number: res.circular_number,
                confidence: confidence
            };
            
            generatedEdges.push(edge);
            entityStats[em.entity_id] = (entityStats[em.entity_id] || 0) + 1;
            sourceStats[res.ingested_via] = (sourceStats[res.ingested_via] || 0) + 1;
            
            if (res.event_date) {
                const clusterKey = `${res.event_date}::${em.entity_id}`;
                if (!dateClusters[clusterKey]) {
                    dateClusters[clusterKey] = [];
                }
                dateClusters[clusterKey].push(edge);
            }
        }
    }
}

// 5. Multi-Source Triangulation
const triangulatedClusters = [];

for (const [key, edgesInCluster] of Object.entries(dateClusters)) {
    const distinctChannels = new Set(edgesInCluster.map(e => e.source_channel));
    if (distinctChannels.size > 1) {
        const [clusterDate, entityId] = key.split('::');
        
        let weightedSum = 0;
        for (const ch of distinctChannels) {
            const count = edgesInCluster.filter(e => e.source_channel === ch).length;
            const w = SOURCE_WEIGHTS[ch] || 0.3;
            weightedSum += w * Math.log2(1 + count);
        }
        const triangulatedScore = Math.min(1.0, parseFloat((weightedSum * 1.1).toFixed(3)));
        
        triangulatedClusters.push({
            date: clusterDate,
            entityId,
            channels: Array.from(distinctChannels),
            totalRecords: edgesInCluster.length,
            triangulatedConfidence: triangulatedScore,
            sampleTitles: edgesInCluster.map(e => `[${e.source_channel}] ${e.title}`).slice(0, 3)
        });
    }
}

triangulatedClusters.sort((a, b) => b.triangulatedConfidence - a.triangulatedConfidence);

// 6. Print Report
console.log('========================================================================');
console.log('         EXPANDED TCDI ENTITY LINKER & TRIANGULATOR REPORT              ');
console.log('========================================================================\n');

console.log(`🎯 TOTAL RESOURCES SCANNED:             ${resources.length}`);
console.log(`⚡ TOTAL TEMPORAL EDGES GENERATED:       ${generatedEdges.length}`);
console.log(`💎 TRIANGULATED MULTI-CHANNEL CLUSTERS:  ${triangulatedClusters.length}\n`);

console.log('📊 EDGES GENERATED PER ENTITY (Ranked by volume):');
const sortedEntities = [...ENTITY_MATCHERS].sort((a, b) => (entityStats[b.entity_id] || 0) - (entityStats[a.entity_id] || 0));

for (const em of sortedEntities) {
    const count = entityStats[em.entity_id] || 0;
    if (count > 0) {
        const bar = '█'.repeat(Math.min(30, Math.round(count / 15)));
        console.log(` - ${em.entity_id.padEnd(25)} : ${String(count).padStart(5)} edges  ${bar} (${em.canonical_name})`);
    }
}

console.log('\n📡 EDGES GENERATED PER INGESTION CHANNEL:');
for (const [ch, count] of Object.entries(sourceStats)) {
    const weight = SOURCE_WEIGHTS[ch] || 0.3;
    console.log(` - ${ch.padEnd(20)} : ${String(count).padStart(5)} edges (Base Weight: ${weight})`);
}

console.log('\n========================================================================');
console.log('   SAMPLE TOP MULTI-SOURCE TRIANGULATION CLUSTERS (Same Date Coincidence)');
console.log('========================================================================');

for (const tc of triangulatedClusters.slice(0, 8)) {
    console.log(`\n📅 DATE: ${tc.date} | ENTITY: ${tc.entityId}`);
    console.log(`   Channels:   ${tc.channels.join(' + ')} (${tc.totalRecords} records)`);
    console.log(`   Confidence: ${tc.triangulatedConfidence >= 0.75 ? '🟢 VERIFIED' : '🟡 EMERGING'} (Score: ${tc.triangulatedConfidence})`);
    console.log(`   Sample Evidence:`);
    tc.sampleTitles.forEach(t => console.log(`    • ${t}`));
}

// 7. Commit if flag is present
if (!IS_DRY_RUN) {
    console.log('\n💾 Writing edges to database...');
    const insertStmt = db.prepare(`
        INSERT INTO temporal_connections (
            connection_id, 
            subject_entity_id, 
            predicate, 
            object_entity_id, 
            valid_from, 
            documented_at, 
            confidence, 
            source_citation,
            notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(connection_id) DO UPDATE SET
            confidence = excluded.confidence,
            documented_at = excluded.documented_at;
    `);
    
    db.exec('BEGIN TRANSACTION;');
    for (const edge of generatedEdges) {
        insertStmt.run(
            edge.connection_id,
            edge.subject_entity_id,
            edge.predicate,
            edge.subject_entity_id,
            edge.event_date !== 'UNDATED' ? edge.event_date : null,
            edge.event_date !== 'UNDATED' ? edge.event_date : null,
            edge.confidence,
            edge.source_channel,
            edge.title
        );
    }
    db.exec('COMMIT;');
    console.log(`✅ Successfully committed ${generatedEdges.length} temporal connections to SQLite!`);
} else {
    console.log('\n💡 DRY RUN COMPLETE: 0 writes made to disk. Pass --commit to write these edges.');
}
