// scripts/education-atlas/register-research-venues.mjs
// Registers all Sri Lankan research institutes, media houses, and official publishers into atlas_staging.db

import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, '../../data/education-atlas/atlas_staging.db');

console.log('🏛️  [RESEARCH & MEDIA REGISTRY] Registering Venues & Publishers...');
console.log(`📌 Database Path: ${dbPath}`);

const db = new DatabaseSync(dbPath);

// 1. Core Research Institutes & Think Tanks
const RESEARCH_ENTITIES = [
    {
        entity_id: 'inst:verite_research',
        entity_type: 'institution',
        canonical_name: 'Verité Research',
        canonical_name_si: 'වෙරිටේ රිසර්ච්',
        canonical_name_ta: 'வெரிட்டே ரிசர்ச்',
        sector: 'civic_research',
        aliases: ['Verite Research', 'Verite', 'PublicFinance.lk'],
        metadata: {
            url: 'https://www.veriteresearch.org',
            lead: 'Dr. Nishan de Mel',
            focus: ['Public Finance', 'Economic Policy', 'Legal Analytics', 'Media Democracy']
        }
    },
    {
        entity_id: 'inst:ips_lk',
        entity_type: 'institution',
        canonical_name: 'Institute of Policy Studies of Sri Lanka',
        canonical_name_si: 'ප්‍රතිපත්ති අධ්‍යයන ආයතනය',
        canonical_name_ta: 'கொள்கை கற்கைகள் நிறுவகம்',
        sector: 'state_research',
        aliases: ['IPS', 'Institute of Policy Studies'],
        metadata: {
            url: 'https://www.ips.lk',
            lead: 'Dr. Dushni Weerakoon',
            focus: ['Macroeconomic Policy', 'State of the Economy', 'Labor & Education', 'Trade']
        }
    },
    {
        entity_id: 'inst:cepa_lk',
        entity_type: 'institution',
        canonical_name: 'Centre for Poverty Analysis',
        canonical_name_si: 'දිළිඳුබව විශ්ලේෂණ කේන්ද්‍රය',
        canonical_name_ta: 'வறுமை ஆய்வு மையம்',
        sector: 'civic_research',
        aliases: ['CEPA', 'Centre for Poverty Analysis Sri Lanka'],
        metadata: {
            url: 'https://www.cepa.lk',
            focus: ['Poverty Dynamics', 'Rural Fieldwork', 'Social Development', 'Education Access']
        }
    },
    {
        entity_id: 'inst:lirneasia_lk',
        entity_type: 'institution',
        canonical_name: 'LIRNEasia',
        canonical_name_si: 'ලර්න්ඒෂියා',
        canonical_name_ta: 'லேர்ன்ஏசியா',
        sector: 'civic_research',
        aliases: ['LIRNEasia', 'LIRNE Asia'],
        metadata: {
            url: 'https://lirneasia.net',
            lead: 'Prof. Rohan Samarajiva',
            focus: ['Telecom Policy', 'Digital Governance', 'AI Readiness', 'Open Data']
        }
    },
    {
        entity_id: 'inst:cpa_lk',
        entity_type: 'institution',
        canonical_name: 'Centre for Policy Alternatives',
        canonical_name_si: 'විකල්ප ප්‍රතිපත්ති කේන්ද්‍රය',
        canonical_name_ta: 'மாற்றுக் கொள்கைகளுக்கான நிலையம்',
        sector: 'civic_research',
        aliases: ['CPA', 'Centre for Policy Alternatives', 'Groundviews', 'Vikalpa', 'Maatram'],
        metadata: {
            url: 'https://www.cpalanka.org',
            lead: 'Dr. Paikiasothy Saravanamuttu',
            focus: ['Constitutional Governance', 'Citizen Journalism', 'Human Rights']
        }
    },
    {
        entity_id: 'inst:lsf_lk',
        entity_type: 'institution',
        canonical_name: 'Lanka Software Foundation',
        canonical_name_si: 'ලංකා මෘදුකාංග පදනම',
        canonical_name_ta: 'இலங்கை மென்பொருள் அறக்கட்டளை',
        sector: 'open_technology',
        aliases: ['LSF', 'Lanka Software Foundation'],
        metadata: {
            url: 'https://opensource.lk',
            lead: 'Dr. Sanjiva Weerawarana',
            focus: ['Digital Public Goods', 'Open Source Governance', 'Disaster Systems']
        }
    },
    {
        entity_id: 'inst:heidelberg_sai',
        entity_type: 'institution',
        canonical_name: 'Heidelberg University South Asia Institute (Colombo)',
        canonical_name_si: 'හයිඩල්බර්ග් සරසවි දකුණු ආසියා ආයතනය',
        canonical_name_ta: 'ஹைடெல்பேர்க் பல்கலைக்கழக தெற்காசிய நிறுவகம்',
        sector: 'academic_research',
        aliases: ['Heidelberg SAI', 'South Asia Institute Colombo'],
        metadata: {
            url: 'https://www.uni-heidelberg.de/sai/',
            focus: ['Historical Documentation', 'Sri Lanka Chair', 'Social Sciences']
        }
    },
    {
        entity_id: 'inst:ssa_lk',
        entity_type: 'institution',
        canonical_name: "Social Scientists' Association",
        canonical_name_si: 'සමාජ විද්‍යාඥයින්ගේ සංගමය',
        canonical_name_ta: 'சமூக விஞ்ஞானிகள் சங்கம்',
        sector: 'academic_research',
        aliases: ['SSA', "Social Scientists' Association"],
        metadata: {
            url: 'https://ssalanka.org',
            lead: 'Dr. Kumari Jayawardena',
            focus: ['Feminist History', 'Agrarian Studies', 'Pravada Journal']
        }
    },
    {
        entity_id: 'inst:ices_lk',
        entity_type: 'institution',
        canonical_name: 'International Centre for Ethnic Studies',
        canonical_name_si: 'ජාත්‍යන්තර ජනවාර්ගික අධ්‍යයන කේන්ද්‍රය',
        canonical_name_ta: 'இன கற்கைகளுக்கான சர்வதேச நிலையம்',
        sector: 'academic_research',
        aliases: ['ICES', 'International Centre for Ethnic Studies'],
        metadata: {
            url: 'https://ices.lk',
            lead: 'Radhika Coomaraswamy',
            focus: ['Ethnic Studies', 'Law & Human Rights', 'Gender Policy']
        }
    },
    {
        entity_id: 'inst:dgi_lk',
        entity_type: 'regulatory_body',
        canonical_name: 'Department of Government Information',
        canonical_name_si: 'රජයේ ප්‍රවෘත්ති දෙපාර්තමේන්තුව',
        canonical_name_ta: 'அரசாங்க தகவல் திணைக்களம்',
        sector: 'state_media',
        aliases: ['DGI', 'Government Information Department', 'news.lk'],
        metadata: {
            url: 'https://news.lk',
            focus: ['Official Cabinet Decisions', 'State Press Releases', 'PMD Notices']
        }
    },
    {
        entity_id: 'inst:helakuru_esana',
        entity_type: 'institution',
        canonical_name: 'Helakuru Esana (Bhasha Lanka)',
        canonical_name_si: 'හෙළකුරු එසැණ (භාෂා ලංකා)',
        canonical_name_ta: 'ஹெளகுரு எசண',
        sector: 'digital_media',
        aliases: ['Helakuru', 'Esana', 'Bhasha'],
        metadata: {
            url: 'https://esana.helakuru.lk',
            lead: 'Dhanika Perera',
            focus: ['Real-Time Breaking Alerts', 'Mobile Push Notifications']
        }
    },
    {
        entity_id: 'inst:wijeya_news',
        entity_type: 'institution',
        canonical_name: 'Wijeya Newspapers',
        canonical_name_si: 'විජය පුවත්පත් සමාගම',
        canonical_name_ta: 'விஜய நியூஸ்பேப்பர்ஸ்',
        sector: 'mainstream_media',
        aliases: ['Wijeya Newspapers', 'Daily Mirror', 'Sunday Times', 'Lankadeepa', 'Daily FT', 'Tamil Mirror'],
        metadata: {
            url: 'https://www.dailymirror.lk',
            outlets: ['Daily Mirror', 'Sunday Times', 'Lankadeepa', 'Daily FT', 'Tamil Mirror']
        }
    },
    {
        entity_id: 'inst:ancl_lakehouse',
        entity_type: 'institution',
        canonical_name: 'Associated Newspapers of Ceylon Limited (Lake House)',
        canonical_name_si: 'සීමාසහිත එක්සත් ප්‍රවෘත්ති පත්‍ර සමාගම (ලේක්හවුස්)',
        canonical_name_ta: 'லேக்ஹவுஸ்',
        sector: 'state_media',
        aliases: ['Lake House', 'ANCL', 'Daily News', 'Dinamina', 'Thinakaran'],
        metadata: {
            url: 'https://www.lakehouse.lk',
            outlets: ['Daily News', 'Dinamina', 'Thinakaran', 'Silumina', 'Sunday Observer']
        }
    },
    {
        entity_id: 'inst:maharaja_news',
        entity_type: 'institution',
        canonical_name: 'Capital Maharaja Group (NewsFirst)',
        canonical_name_si: 'කැපිටල් මහාරාජා සමූහය (නිව්ස්ෆස්ට්)',
        canonical_name_ta: 'நியூஸ்பர்ஸ்ட்',
        sector: 'mainstream_media',
        aliases: ['NewsFirst', 'Sirasa', 'Shakthi', 'Capital Maharaja'],
        metadata: {
            url: 'https://www.newsfirst.lk',
            outlets: ['NewsFirst EN', 'Sirasa News SI', 'Shakthi News TA']
        }
    },
    {
        entity_id: 'inst:derana_macro',
        entity_type: 'institution',
        canonical_name: 'Derana Macro Entertainment (Ada Derana)',
        canonical_name_si: 'දෙරණ (අද දෙරණ)',
        canonical_name_ta: 'அத தெரண',
        sector: 'mainstream_media',
        aliases: ['Ada Derana', 'Derana'],
        metadata: {
            url: 'http://www.adaderana.lk',
            outlets: ['Ada Derana EN', 'Ada Derana SI', 'Ada Derana TA']
        }
    },
    {
        entity_id: 'inst:virakesari_corp',
        entity_type: 'institution',
        canonical_name: 'Express Newspapers (Ceylon) Limited (Virakesari)',
        canonical_name_si: 'වීරකේසරී පුවත්පත',
        canonical_name_ta: 'வீரகேசரி (எக்ஸ்பிரஸ் நியூஸ்பேப்பர்ஸ்)',
        sector: 'mainstream_media',
        aliases: ['Virakesari', 'Express Newspapers'],
        metadata: {
            url: 'https://www.virakesari.lk',
            outlets: ['Virakesari Daily', 'Virakesari Sunday', 'Metro News']
        }
    },
    {
        entity_id: 'inst:echelon_media',
        entity_type: 'institution',
        canonical_name: 'Echelon Media (EconomyNext)',
        canonical_name_si: 'එචිලෝන් මීඩියා',
        canonical_name_ta: 'எக்கனமிநெக்ஸ்ட்',
        sector: 'financial_media',
        aliases: ['EconomyNext', 'Echelon'],
        metadata: {
            url: 'https://economynext.com',
            focus: ['Macroeconomic Analysis', 'Debt Restructuring', 'Policy Critique']
        }
    },
    // ── Wave 2: Additional Research Venues & Civic Institutions ──
    {
        entity_id: 'inst:cabinet_office_lk',
        entity_type: 'regulatory_body',
        canonical_name: 'Cabinet Office of Sri Lanka',
        canonical_name_si: 'අමාත්‍ය මණ්ඩල කාර්යාලය',
        canonical_name_ta: 'அமைச்சரவை அலுவலகம்',
        sector: 'executive_governance',
        aliases: ['Cabinet Office', 'Cabinet of Ministers', 'අමාත්‍ය මණ්ඩලය', 'කැබිනට් මණ්ඩලය'],
        metadata: {
            url: 'https://www.cabinetoffice.gov.lk',
            focus: ['Cabinet Decisions', 'National Policy Determinations', 'Government Memoranda']
        }
    },
    {
        entity_id: 'inst:parliament_lk',
        entity_type: 'regulatory_body',
        canonical_name: 'Parliament of Sri Lanka',
        canonical_name_si: 'ශ්‍රී ලංකා පාර්ලිමේන්තුව',
        canonical_name_ta: 'இலங்கைப் பாராளுமன்றம்',
        sector: 'legislative_governance',
        aliases: ['Parliament of Sri Lanka', 'Hansard', 'පාර්ලිමේන්තුව', 'ஹன்சாட்'],
        metadata: {
            url: 'https://www.parliament.lk',
            focus: ['Hansard Debates', 'Acts of Parliament', 'Parliamentary Select Committees']
        }
    },
    {
        entity_id: 'inst:supreme_court_lk',
        entity_type: 'regulatory_body',
        canonical_name: 'Supreme Court of Sri Lanka',
        canonical_name_si: 'ශ්‍රී ලංකා ශ්‍රේෂ්ඨාධිකරණය',
        canonical_name_ta: 'இலங்கை உயர் நீதிமன்றம்',
        sector: 'judiciary',
        aliases: ['Supreme Court of Sri Lanka', 'Supreme Court', 'ශ්‍රේෂ්ඨාධිකරණ', 'உயர் நீதிமன்றம்'],
        metadata: {
            url: 'https://supremecourt.lk',
            focus: ['Fundamental Rights Judgements', 'Constitutional Determinations', 'Appeals']
        }
    },
    {
        entity_id: 'inst:nsf_sljol',
        entity_type: 'institution',
        canonical_name: 'National Science Foundation & Sri Lanka Journals Online',
        canonical_name_si: 'ජාතික විද්‍යා පදනම සහ ශ්‍රී ලංකා ජර්නල් ඔන්ලයින්',
        canonical_name_ta: 'தேசிய அறிவியல் அறக்கட்டளை',
        sector: 'academic_research',
        aliases: ['NSF', 'SLJOL', 'Sri Lanka Journals Online', 'National Science Foundation'],
        metadata: {
            url: 'https://sljol.info',
            focus: ['Open Access Academic Journals', 'Peer-Reviewed Research', 'Citation Indexing']
        }
    },
    {
        entity_id: 'inst:dcs_lk',
        entity_type: 'regulatory_body',
        canonical_name: 'Department of Census and Statistics',
        canonical_name_si: 'ජනලේඛන හා සංඛ්‍යාලේඛන දෙපාර්තමේන්තුව',
        canonical_name_ta: 'தொகைமதிப்பு புள்ளிவிவரத் திணைக்களம்',
        sector: 'state_research',
        aliases: ['Department of Census and Statistics', 'DCS Sri Lanka', 'ජනලේඛන', 'புள்ளிவிவரத் திணைக்களம்'],
        metadata: {
            url: 'http://www.statistics.gov.lk',
            focus: ['National Census', 'Poverty Head Count', 'Labour Force Survey', 'School Census']
        }
    },
    {
        entity_id: 'inst:advocata_lk',
        entity_type: 'institution',
        canonical_name: 'Advocata Institute',
        canonical_name_si: 'ඇඩ්වොකාටා ආයතනය',
        canonical_name_ta: 'அட்வொகாடா நிறுவனம்',
        sector: 'civic_research',
        aliases: ['Advocata Institute', 'Advocata', 'Bath Curry Index'],
        metadata: {
            url: 'https://www.advocata.org',
            lead: 'Murtaza Jafferjee',
            focus: ['Free Market Reforms', 'Bath Curry Index', 'State-Owned Enterprises', 'Tax Policy']
        }
    },
    {
        entity_id: 'inst:harti_lk',
        entity_type: 'institution',
        canonical_name: 'Hector Kobbekaduwa Agrarian Research and Training Institute',
        canonical_name_si: 'හෙක්ටර් කොබ්බෑකඩුව ගොවි කටයුතු පර්යේෂණ හා පුහුණු කිරීමේ ආයතනය',
        canonical_name_ta: 'ஹெக்டர் கொப்பேகடுவ விவசாய ஆராய்ச்சி நிறுவனம்',
        sector: 'state_research',
        aliases: ['HARTI', 'Agrarian Research Institute'],
        metadata: {
            url: 'https://www.harti.gov.lk',
            focus: ['Agrarian Studies', 'Food Security', 'Rural Livelihoods', 'Market Commodity Indices']
        }
    },
    {
        entity_id: 'inst:nifs_lk',
        entity_type: 'institution',
        canonical_name: 'National Institute of Fundamental Studies',
        canonical_name_si: 'මූලික අධ්‍යයන පිළිබඳ ජාතික ආයතනය',
        canonical_name_ta: 'அடிப்படை கற்கைகளுக்கான தேசிய நிறுவகம்',
        sector: 'state_research',
        aliases: ['NIFS', 'Institute of Fundamental Studies', 'IFS Hantana'],
        metadata: {
            url: 'https://www.nifs.ac.lk',
            focus: ['Fundamental Science', 'Nanotechnology', 'Ecology', 'Natural Products']
        }
    },
    {
        entity_id: 'inst:natlib_lk',
        entity_type: 'regulatory_body',
        canonical_name: 'National Library and Documentation Services Board',
        canonical_name_si: 'ජාතික පුස්තකාල හා ප්‍රලේඛන සේවා මණ්ඩලය',
        canonical_name_ta: 'தேசிய நூலக ஆவணவாக்கல் சேவைகள் சபை',
        sector: 'state_education',
        aliases: ['National Library Sri Lanka', 'NLDSB', 'ජාතික පුස්තකාලය'],
        metadata: {
            url: 'http://www.natlib.lk',
            focus: ['National Bibliography', 'Legal Deposit', 'ISBN Registry', 'Preservation']
        }
    },
    {
        entity_id: 'inst:cpa_groundviews',
        entity_type: 'institution',
        canonical_name: 'Groundviews / Vikalpa / Maatram (CPA)',
        canonical_name_si: 'ග්‍රවුන්ඩ්වීව්ස් / විකල්ප / මාට්‍රම්',
        canonical_name_ta: 'கிரவுண்ட்வியூஸ் / விகல்ப / மாற்றம்',
        sector: 'civic_media',
        aliases: ['Groundviews', 'Vikalpa', 'Maatram'],
        metadata: {
            url: 'https://groundviews.org',
            focus: ['Civic Discourse', 'Human Rights Longform', 'Citizen Journalism Archive']
        }
    },
    {
        entity_id: 'inst:colombo_telegraph',
        entity_type: 'institution',
        canonical_name: 'Colombo Telegraph',
        canonical_name_si: 'කොළඹ ටෙලිග්‍රාෆ්',
        canonical_name_ta: 'கொழும்பு டெலிகிராப்',
        sector: 'civic_media',
        aliases: ['Colombo Telegraph'],
        metadata: {
            url: 'https://www.colombotelegraph.com',
            focus: ['Investigative Whistleblowing', 'Civic Opinions', 'Public Discourse']
        }
    }
];

// 2. Prepare database statements
const insertEntityStmt = db.prepare(`
INSERT INTO entities (entity_id, entity_type, canonical_name, canonical_name_si, canonical_name_ta, sector, aliases_json, metadata_json)
VALUES (?, ?, ?, ?, ?, ?, ?, ?)
ON CONFLICT(entity_id) DO UPDATE SET
    canonical_name = excluded.canonical_name,
    canonical_name_si = excluded.canonical_name_si,
    canonical_name_ta = excluded.canonical_name_ta,
    sector = excluded.sector,
    aliases_json = excluded.aliases_json,
    metadata_json = excluded.metadata_json,
    updated_at = CURRENT_TIMESTAMP;
`);

const insertSourceStmt = db.prepare(`
INSERT INTO sources (
    source_id, name, short_name, source_kind, category, authority_level,
    quality_tier, canonical_url, inventory_status, languages, handling_mode,
    rights_baseline, notes
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
ON CONFLICT(source_id) DO UPDATE SET
    canonical_url = excluded.canonical_url,
    authority_level = excluded.authority_level,
    notes = excluded.notes,
    updated_at = CURRENT_TIMESTAMP;
`);

db.exec('BEGIN TRANSACTION;');

// Insert Entities
for (const ent of RESEARCH_ENTITIES) {
    insertEntityStmt.run(
        ent.entity_id,
        ent.entity_type,
        ent.canonical_name,
        ent.canonical_name_si,
        ent.canonical_name_ta,
        ent.sector,
        JSON.stringify(ent.aliases),
        JSON.stringify(ent.metadata)
    );

    // Register into sources table
    const sourceId = `LK-SOURCE-${ent.entity_id.replace('inst:', '').toUpperCase()}`;
    insertSourceStmt.run(
        sourceId,
        ent.canonical_name,
        ent.aliases[0] || ent.canonical_name,
        ent.sector === 'civic_research' || ent.sector === 'academic_research' ? 'independent_public_source' : 'media_publisher',
        ent.sector,
        ent.sector.includes('state') ? 'official' : 'curated',
        ent.sector.includes('research') ? 'A1' : 'A2',
        ent.metadata.url || 'https://urumaya.intuituilabs.studio',
        'registered',
        JSON.stringify(['si', 'ta', 'en']),
        'link',
        'fair_use_public_record',
        `Registered civic research or media provider: ${ent.canonical_name}`
    );
}

db.exec('COMMIT;');

const totalEntities = db.prepare('SELECT COUNT(*) as count FROM entities').get().count;
const totalSources = db.prepare('SELECT COUNT(*) as count FROM sources').get().count;

console.log(`\n✅ Registered ${RESEARCH_ENTITIES.length} research institutes and media conglomerates!`);
console.log(`📊 Total Entities in Knowledge Graph: ${totalEntities}`);
console.log(`📊 Total Registered Sources:          ${totalSources}`);
