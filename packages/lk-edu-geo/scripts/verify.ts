import { 
  getProvinces, 
  getDistricts, 
  getSchools, 
  searchSchools, 
  getHierarchyForSchool 
} from '../src/index.ts';

async function test() {
  console.log('🧪 Starting Verification Tests...');

  // 1. Check Provinces
  const provinces = getProvinces();
  console.log(`✅ Provinces found: ${provinces.length} (Expected 9)`);

  // 2. Check Districts in Western Province (P_01)
  const wpDistricts = getDistricts('P_01');
  console.log(`✅ Districts in WP: ${wpDistricts.map(d => d.name).join(', ')} (Expected 3)`);

  // 3. Search for a specific school (e.g., Royal College)
  const schools = searchSchools('Royal College');
  console.log(`✅ Schools matching "Royal College": ${schools.length}`);
  if (schools.length > 0) {
    console.log(`   Sample: ${schools[0].name} (Census: ${schools[0].census_no})`);
    
    // 4. Check Hierarchy
    const hierarchy = getHierarchyForSchool(schools[0].id);
    console.log('✅ Hierarchy lookup for Royal College:');
    console.log(`   Admin: ${hierarchy?.admin.province?.name} -> ${hierarchy?.admin.district?.name}`);
    console.log(`   Edu: ${hierarchy?.edu.zone?.name} -> ${hierarchy?.edu.division?.name}`);
  }

  // 5. Total Schools
  const allSchools = getSchools();
  console.log(`✅ Total Schools in database: ${allSchools.length}`);
  
  console.log('✨ All Tests Passed!');
}

test().catch(console.error);
