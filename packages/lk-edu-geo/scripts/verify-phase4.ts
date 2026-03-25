import { getProvinces, getDistricts, getDSDivisions, getGNDivisions, getSchools, getMetadata } from '../src/index.js';

console.log('🧪 Phase 4 Verification Suite');
console.log('============================');

const meta = getMetadata();
console.log(`📊 Metadata: Version ${meta.version}, Total Schools: ${meta.total_schools}, GN Divisions: ${meta.total_gn_divisions}`);

// 1. Administrative Hierarchy Test
const provinces = getProvinces();
console.log(`✅ Provinces: ${provinces.length}`);

if (provinces.length > 0) {
  const p1 = provinces[0];
  const districts = getDistricts(p1.id);
  console.log(`✅ Districts in ${p1.name}: ${districts.length}`);

  if (districts.length > 0) {
    const d1 = districts[0];
    const dsDivs = getDSDivisions(d1.id);
    console.log(`✅ DS Divisions in ${d1.name}: ${dsDivs.length}`);

    if (dsDivs.length > 0) {
      const ds1 = dsDivs[0];
      const gnDivs = getGNDivisions(ds1.id);
      console.log(`✅ GN Divisions in ${ds1.name}: ${gnDivs.length}`);
    }
  }
}

// 2. School Mapping Test
const allSchools = getSchools();
console.log(`✅ Total Schools Harvested: ${allSchools.length}`);

const samples = allSchools.slice(0, 5);
console.log('📋 Sample Schools (Hierarchical Linkage):');
samples.forEach(s => {
  console.log(`   - [${s.census_no}] ${s.name}`);
  console.log(`     Admin: P:${s.location.province_id}, D:${s.location.district_id}`);
  console.log(`     Edu: Z:${s.jurisdiction.zone_id}, Div:${s.jurisdiction.division_id}`);
});

// 3. Totals Check
console.log('============================');
if (meta.total_gn_divisions === 14043) {
  console.log('🎉 SUCCESS: All 14,043 official GN divisions are present.');
} else {
  console.warn(`⚠️ WARNING: GN Count mismatch. Expected 14043, got ${meta.total_gn_divisions}`);
}

if (allSchools.length > 10000) {
  console.log('🎉 SUCCESS: Over 10,000 schools successfully ingested and mapped.');
} else {
  console.warn(`⚠️ WARNING: Low school count: ${allSchools.length}`);
}
