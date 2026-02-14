# 🚀 RLS DEPLOYMENT GUIDE
**Status**: READY FOR DEPLOYMENT
**Duration**: 2-3 hours
**Complexity**: Medium
**Risk**: High (if done wrong) | Low (if followed exactly)

---

## ⚠️ DEPLOYMENT WARNINGS

**CRITICAL**: Before deploying RLS:
1. ✅ **Backup your database** - Use Supabase backup feature
2. ✅ **Test in staging first** - Use separate Supabase project
3. ✅ **Have rollback plan** - Know how to disable RLS if needed
4. ✅ **Read RLS_SECURITY_AUDIT.md** - Understand the policies first

---

## 📋 PRE-DEPLOYMENT CHECKLIST

### 1. Database Health Check
```bash
# Verify no corrupted data
SELECT COUNT(*) FROM users WHERE school_id IS NULL;
-- Expected: 0 (all users have school_id)

SELECT COUNT(*) FROM classrooms WHERE teacher_id IS NULL;
-- Expected: 0 (all classrooms have teacher)

SELECT COUNT(*) FROM grades WHERE student_id IS NULL;
-- Expected: 0 (all grades have student_id)
```

### 2. API Readiness
- [ ] All API functions have `await requireAuth()` at start
- [ ] All API functions have appropriate `requireTeacherAccess()` or `requireClassroomAccess()`
- [ ] Error messages don't reveal RLS denials (use generic "access denied")

### 3. Test Database Prepared
- [ ] Have at least 2 test schools
- [ ] Have at least 2 teachers per school
- [ ] Have at least 3 students per classroom
- [ ] Have grades, lessons, notes in test data

---

## 🔧 DEPLOYMENT STEPS

### Phase 1: Enable RLS (20 minutes)

**1.1 Open Supabase Console**
- Go to https://supabase.com/dashboard
- Select your Gurudevi project
- Go to SQL Editor

**1.2 Run Enable RLS Script**
```
File: docs/sql/01_enable_rls.sql
Action: Copy entire contents and paste into SQL Editor
Click: "Run" button
Expected: All table RLS commands execute successfully
```

⚠️ **WARNING**: Once RLS is enabled, all queries fail until policies are created

**1.3 Verify RLS is Enabled**
```sql
SELECT tablename, rowlevelenabled
FROM information_schema.table_privileges
WHERE tablename LIKE '%users%' OR tablename LIKE '%grades%'
ORDER BY tablename;
```

Expected output:
```
 tablename | rowlevelenabled
-----------+-----------------
 users     | t
 grades    | t
```

---

### Phase 2: Deploy Core Policies (40 minutes)

**2.1 Deploy Users Policies**
```
File: docs/sql/02_users_policies.sql
Action: Copy and paste in SQL Editor
Expected: 5 policies created on users table
```

Verify:
```sql
SELECT policy_name FROM information_schema.constraint_column_usage
WHERE table_name = 'users';
```

**2.2 Test Users Policies** (In SQL Editor as different users)
```sql
-- Test as authenticated user
SELECT id, email, school_id FROM users
WHERE id = auth.uid();
-- Expected: Returns own user

SELECT id, email FROM users
WHERE school_id = (SELECT school_id FROM users WHERE id = auth.uid());
-- Expected: Returns users in same school
```

---

### Phase 3: Deploy Critical Policies (30 minutes)

**3.1 Deploy Critical Policies**
```
File: docs/sql/03_critical_tables_policies.sql
Action: Copy and paste in SQL Editor
Expected: 20+ policies created
```

**3.2 Test Critical Policies**

Test as teacher:
```sql
-- Grades: Can read grades in own classroom
SELECT * FROM grades
WHERE classroom_id IN (
  SELECT id FROM classrooms WHERE teacher_id = auth.uid()
);
-- Expected: Returns grades

-- Teacher Notes: Can read own notes
SELECT * FROM teacher_notes
WHERE teacher_id = auth.uid();
-- Expected: Returns own notes
```

Test as student:
```sql
-- Grades: Can read own grades
SELECT * FROM grades
WHERE student_id = auth.uid();
-- Expected: Returns own grades

-- Grades: Cannot read other student's grades
SELECT * FROM grades
WHERE student_id != auth.uid();
-- Expected: Returns 0 rows (denied by RLS)
```

---

### Phase 4: Deploy Remaining Policies (30 minutes)

Once you're confident in core policies, deploy:

1. `lessons` table policies
2. `assignments` table policies
3. `community_posts` table policies
4. `library_resources` table policies

---

## 🧪 TESTING FRAMEWORK

### Test Case Template

```typescript
import { createClient } from '@supabase/supabase-js';

async function testRLSPolicy(description, testFn) {
  try {
    await testFn();
    console.log(`✅ PASS: ${description}`);
  } catch (error) {
    console.log(`❌ FAIL: ${description}`);
    console.error(error.message);
  }
}

// Test as Teacher
const teacherClient = createClient(supabaseUrl, supabaseKey, {
  auth: { token: teacherAuthToken }
});

// Test: Teacher can read own classroom grades
await testRLSPolicy(
  'Teacher can read grades in own classroom',
  async () => {
    const { data, error } = await teacherClient
      .from('grades')
      .select('*')
      .eq('classroom_id', teacherClassroomId);

    if (error) throw error;
    if (!data || data.length === 0) throw new Error('No grades returned');
  }
);

// Test: Teacher CANNOT read other teacher's grades
await testRLSPolicy(
  'Teacher CANNOT read grades in other classroom',
  async () => {
    const { data, error } = await teacherClient
      .from('grades')
      .select('*')
      .eq('classroom_id', otherTeacherClassroomId);

    if (!error) throw new Error('Should have been denied by RLS');
    if (data && data.length > 0) throw new Error('Data was returned despite RLS denial');
  }
);
```

### Full Test Suite

Run all these before marking RLS as complete:

```bash
# Teachers can access their data
✅ Teacher reads own classrooms
✅ Teacher reads own grades in classroom
✅ Teacher reads own lessons
✅ Teacher reads own notes
✅ Teacher creates grades in own classroom

# Teachers CANNOT access others' data
❌ Teacher CANNOT read other teacher's classrooms
❌ Teacher CANNOT read other teacher's notes
❌ Teacher CANNOT modify other teacher's grades
❌ Teacher CANNOT read grades outside their school

# Students can access appropriate data
✅ Student reads enrolled classrooms
✅ Student reads own grades
✅ Student reads lessons in enrolled classrooms
✅ Student cannot read other student's grades

# Principals can see school data
✅ Principal reads all school classrooms
✅ Principal reads all school grades
✅ Principal sees all users in school
❌ Principal CANNOT see other school's data
❌ Principal CANNOT see teacher's private notes

# Data isolation
✅ School A teacher cannot see School B data
✅ School A principal cannot see School B data
✅ School A student cannot see School B data
```

---

## 🐛 TROUBLESHOOTING

### Issue: "42501 permission denied" error

**Cause**: RLS is enabled but no policy allows the action
**Solution**: Create the appropriate policy for the operation

```sql
-- Debug: Find tables without policies
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name NOT IN (
  SELECT table_name FROM information_schema.constraint_column_usage
);
```

### Issue: "Policy name already exists"

**Cause**: Trying to create policy that already exists
**Solution**: Drop and recreate
```sql
DROP POLICY IF EXISTS policy_name ON table_name;
CREATE POLICY policy_name ...
```

### Issue: App breaks after RLS deployment

**Solution**: Quickly disable RLS while debugging
```sql
ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;
```

---

## ✅ POST-DEPLOYMENT VERIFICATION

### 1. Monitor Logs
```sql
-- Check for RLS violations in logs
SELECT * FROM pg_stat_statements
WHERE query LIKE '%RLS%' OR query LIKE '%permission%'
ORDER BY calls DESC
LIMIT 20;
```

### 2. Run API Tests
```bash
npm test -- --testPathPattern="api.*auth"
npm test -- --testPathPattern="grades"
npm test -- --testPathPattern="classrooms"
```

### 3. User Acceptance Testing
- [ ] Teacher can grade students
- [ ] Teacher cannot grade other teacher's students
- [ ] Student sees own grades
- [ ] Student cannot see other student grades
- [ ] Principal sees all school grades
- [ ] Teacher notes are private

### 4. Performance Check
```sql
-- Check for slow queries
SELECT query, calls, mean_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 20;
```

---

## 🎯 ROLLBACK PLAN

If something goes wrong:

### Quick Disable (Emergency)
```sql
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE grades DISABLE ROW LEVEL SECURITY;
ALTER TABLE classrooms DISABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_notes DISABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts DISABLE ROW LEVEL SECURITY;
```

### Restore Backup
1. Go to Supabase Dashboard
2. Settings → Backups
3. Choose backup before RLS deployment
4. Restore (this will lose changes after deployment)

### Roll Out Partially
If only some tables have issues:
```sql
-- Keep good RLS, disable problematic ones
ALTER TABLE users DISABLE ROW LEVEL SECURITY; -- Disable problematic table
ALTER TABLE grades DISABLE ROW LEVEL SECURITY; -- Keep other tables enabled
```

---

## 📊 DEPLOYMENT CHECKLIST

### Pre-Deployment
- [ ] Database backup taken
- [ ] Staging tested (separate project)
- [ ] All API auth checks in place
- [ ] Error handling for RLS denials

### Deployment
- [ ] Phase 1: RLS enabled on all tables
- [ ] Phase 2: Core policies (users, classrooms) deployed
- [ ] Phase 2: Core policies tested
- [ ] Phase 3: Critical policies (grades, notes, enrollments) deployed
- [ ] Phase 3: Critical policies tested
- [ ] Phase 4: Remaining policies deployed
- [ ] Phase 4: All policies tested

### Post-Deployment
- [ ] Logs monitored for violations
- [ ] API tests passing
- [ ] User acceptance testing complete
- [ ] Performance metrics normal
- [ ] Documentation updated

### Celebration 🎉
- [ ] All tests passing
- [ ] No RLS errors in logs
- [ ] Users can access their data
- [ ] Unauthorized access denied
- [ ] Data isolation confirmed

---

## 📞 SUPPORT CONTACTS

If something breaks:
1. Check the troubleshooting section above
2. Review RLS_SECURITY_AUDIT.md for policy logic
3. Check Supabase logs for specific error
4. Use rollback plan if needed
5. Contact Supabase support if database is corrupted

---

**Estimated Duration**: 2-3 hours
**Skill Required**: Intermediate SQL
**Risk Level**: Medium (with proper testing)
**Impact**: Critical security improvement

Ready to deploy? 🚀 Follow the steps above carefully and test thoroughly!
