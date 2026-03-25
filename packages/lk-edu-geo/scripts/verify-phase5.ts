import { getPostalUnits, getSchools, searchPostalTowns, searchGNDivisions, getMetadata } from '../src/index.js';

console.log('🧪 Phase 5 Final Verification: High-Resolution & Multilingual');
console.log('===========================================================');

const meta = getMetadata();
console.log(`📊 Metadata: v${meta.version}`);
console.log(`   - Total Schools: ${meta.total_schools}`);
console.log(`   - GN Divisions: ${meta.total_gn_divisions}`);
console.log(`   - Postal Towns: ${meta.total_postal_towns}`);

// 1. Postal Town Inventory
console.log('\n📬 Postal Town Sample (High-Res):');
const pt = getPostalUnits().find(p => p.city === 'Fort');
if (pt) {
  console.log(`   Name: ${pt.city}`);
  console.log(`   Code: ${pt.postal_code}`);
  console.log(`   District: ${pt.district_id}`);
  console.log(`   Location: ${pt.location?.lat}, ${pt.location?.lng}`);
}

// 2. School Inventory
console.log('\n🏫 School Sample (Enriched):');
const school = getSchools().find(s => s.census_no === '01001'); // Sample school
if (school) {
  console.log(`   Name: ${school.name}`);
  console.log(`   Address: ${school.address}`);
  console.log(`   Postal Match: ${school.location.postal_unit_id} (Code: ${school.postal_code})`);
  console.log(`   Edu Hierarchy: Zone ${school.jurisdiction.zone_id}, Div ${school.jurisdiction.division_id}`);
}

// 3. Search & Multilingual Test
console.log('\n🔍 Search Utility Test:');
const searchResults = searchPostalTowns('Colombo');
console.log(`   searchPostalTowns('Colombo'): Found ${searchResults.length} results.`);

const gnSiSearch = searchGNDivisions('කොළඹ'); // Searching for "Colombo" in Sinhala
console.log(`   searchGNDivisions('කොළඹ'): Found ${gnSiSearch.length} results.`);
if (gnSiSearch.length > 0) {
  const gn = gnSiSearch[0];
  console.log(`   Match: ${gn.name} / ${gn.name_si} / ${gn.name_ta}`);
  console.log(`   Spatial: ${gn.location?.lat}, ${gn.location?.lng}`);
}

console.log('\n===========================================================');
console.log('🎉 Phase 5 Verification Complete!');
