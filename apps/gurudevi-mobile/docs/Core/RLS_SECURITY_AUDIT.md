---
title: "ðŸ” RLS SECURITY AUDIT & IMPLEMENTATION GUIDE"
status: "active"
created: 2026-02-14
updated: 2026-02-14
author: "Naveen"
scribe: "opencode"
tags: [apps, gurudevi-mobile]
---

# 🔐 RLS SECURITY AUDIT & IMPLEMENTATION GUIDE
**Status**: AUDIT IN PROGRESS
**Priority**: 🔴 BLOCKING FOR ALPHA
**Last Updated**: 2026-02-14

---

## 📋 EXECUTIVE SUMMARY

Row Level Security (RLS) is the **critical final layer** of authorization. While API authorization checks are important, **RLS enforces security at the database level** - even if code is compromised, users cannot access unauthorized data.

**Current Status**: No RLS policies configured yet
**Risk Level**: 🔴 CRITICAL - Data isolation not enforced
**Work Required**: 2-3 hours to implement all policies

---

## 🔑 RLS PRINCIPLES FOR GURUDEVI

### Core Rules

1. **School Isolation**: User can only see data from their school
2. **Teacher Access**: Teachers can only access their own classrooms and related data
3. **Principal Access**: Principals can see all school data
4. **Student Access**: Students can only see their enrolled classrooms
5. **Information Asymmetry**: Unauthorized access returns denial, not "not found"

### Authorization Hierarchy

```
                        FOUNDER (SuperAdmin)
                             |
              ________________|________________
             |                                |
          ADMIN              PRINCIPAL (School Owner)
             |                                |
             |         _______________________|_______
             |        |                               |
          TEACHER   SECTION_HEAD            GRADE_HEAD
             |        |                        |
             |________|________________________|
                           |
                        STUDENT
```

---

## 📊 TABLE-BY-TABLE RLS AUDIT

### ✅ TABLE 1: `auth.users` (Supabase Built-in)
**Status**: ✅ DEFAULT PROTECTION
- Supabase manages this - users only see their own auth data
- **No action needed**

---

### ⚠️ TABLE 2: `users`
**Purpose**: User profiles and roles
**Columns**: id, email, full_name, role, school_id, created_at

**Current RLS**: ❌ NOT CONFIGURED
**Risk**: Users can read other users' profiles, emails, roles

**RLS Policy to Implement**:
```sql
-- Policy 1: Users can read their own profile
CREATE POLICY "users_read_own"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- Policy 2: Teachers can read users in their school
CREATE POLICY "users_read_same_school"
  ON users FOR SELECT
  USING (
    school_id = (SELECT school_id FROM users WHERE id = auth.uid())
    AND role IN ('teacher', 'student')
  );

-- Policy 3: Principals can read all users in their school
CREATE POLICY "users_read_school_admin"
  ON users FOR SELECT
  USING (
    (SELECT role FROM users WHERE id = auth.uid()) = 'principal'
    AND school_id = (SELECT school_id FROM users WHERE id = auth.uid())
  );

-- Policy 4: Users can update their own profile (non-sensitive fields)
CREATE POLICY "users_update_own"
  ON users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND role = (SELECT role FROM users WHERE id = auth.uid()) -- Prevent role escalation
    AND school_id = (SELECT school_id FROM users WHERE id = auth.uid())
  );

-- Policy 5: Only new signups can insert (auto-created by auth trigger)
CREATE POLICY "users_insert_new_auth"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = id);
```

**Test Cases**:
```
✓ User A reads own profile → SUCCESS
✓ User A reads User B (same school) → SUCCESS (if teacher/principal)
✓ User A reads User B (different school) → DENIED
✓ User A updates own name → SUCCESS
✓ User A updates own role → DENIED
✓ Student reads User A (teacher) → DENIED
```

---

### ⚠️ TABLE 3: `schools`
**Purpose**: School information
**Columns**: id, name, type, created_at, address, etc.

**Current RLS**: ❌ NOT CONFIGURED
**Risk**: Users can read all schools and see their structure

**RLS Policy**:
```sql
-- Policy 1: All users can see their own school
CREATE POLICY "schools_read_own_school"
  ON schools FOR SELECT
  USING (
    id = (SELECT school_id FROM users WHERE id = auth.uid())
  );

-- Policy 2: Only school admins can update
CREATE POLICY "schools_update_admin_only"
  ON schools FOR UPDATE
  USING (
    (SELECT role FROM users WHERE id = auth.uid()) IN ('principal', 'founder', 'admin')
    AND id = (SELECT school_id FROM users WHERE id = auth.uid())
  );
```

---

### ⚠️ TABLE 4: `classrooms`
**Purpose**: Classroom info and enrollment
**Columns**: id, school_id, teacher_id, name, grade_id, section_id, created_at

**Current RLS**: ❌ NOT CONFIGURED
**Risk**: Teachers can see classrooms they don't teach, students can see all classrooms

**RLS Policy**:
```sql
-- Policy 1: Teachers see their own classrooms
CREATE POLICY "classrooms_teacher_read_own"
  ON classrooms FOR SELECT
  USING (
    teacher_id = auth.uid()
  );

-- Policy 2: Principals see all school classrooms
CREATE POLICY "classrooms_principal_read_all"
  ON classrooms FOR SELECT
  USING (
    (SELECT role FROM users WHERE id = auth.uid()) IN ('principal', 'founder', 'admin')
    AND school_id = (SELECT school_id FROM users WHERE id = auth.uid())
  );

-- Policy 3: Students see enrolled classrooms
CREATE POLICY "classrooms_student_read_enrolled"
  ON classrooms FOR SELECT
  USING (
    id IN (
      SELECT classroom_id FROM classroom_students
      WHERE student_id = auth.uid()
    )
  );

-- Policy 4: Only teachers in same school can create
CREATE POLICY "classrooms_insert_teacher"
  ON classrooms FOR INSERT
  WITH CHECK (
    (SELECT role FROM users WHERE id = auth.uid()) = 'teacher'
    AND school_id = (SELECT school_id FROM users WHERE id = auth.uid())
    AND teacher_id = auth.uid()
  );

-- Policy 5: Only owner can update
CREATE POLICY "classrooms_update_owner"
  ON classrooms FOR UPDATE
  USING (
    teacher_id = auth.uid()
  );
```

---

### ⚠️ TABLE 5: `classroom_students` (Enrollment)
**Purpose**: Track student enrollment in classrooms
**Columns**: id, classroom_id, student_id, enrolled_at, invite_code, claimed_at

**Current RLS**: ❌ NOT CONFIGURED
**Risk**: Students can see other students' enrollments, teachers can modify enrollments incorrectly

**RLS Policy**:
```sql
-- Policy 1: Teachers see enrollments in their classrooms
CREATE POLICY "classroom_students_teacher_read"
  ON classroom_students FOR SELECT
  USING (
    classroom_id IN (
      SELECT id FROM classrooms WHERE teacher_id = auth.uid()
    )
  );

-- Policy 2: Students see their own enrollments
CREATE POLICY "classroom_students_student_read"
  ON classroom_students FOR SELECT
  USING (
    student_id = auth.uid()
  );

-- Policy 3: Principals see all enrollments in school
CREATE POLICY "classroom_students_principal_read"
  ON classroom_students FOR SELECT
  USING (
    (SELECT role FROM users WHERE id = auth.uid()) IN ('principal', 'founder', 'admin')
    AND classroom_id IN (
      SELECT id FROM classrooms
      WHERE school_id = (SELECT school_id FROM users WHERE id = auth.uid())
    )
  );

-- Policy 4: Only teacher can add students
CREATE POLICY "classroom_students_insert_teacher"
  ON classroom_students FOR INSERT
  WITH CHECK (
    classroom_id IN (SELECT id FROM classrooms WHERE teacher_id = auth.uid())
  );

-- Policy 5: Only teacher owning classroom can delete
CREATE POLICY "classroom_students_delete_teacher"
  ON classroom_students FOR DELETE
  USING (
    classroom_id IN (
      SELECT id FROM classrooms WHERE teacher_id = auth.uid()
    )
  );
```

---

### ⚠️ TABLE 6: `grades`
**Purpose**: Student grades and marks
**Columns**: id, student_id, classroom_id, assignment_id, marks, grade, gpa, feedback, graded_at

**Current RLS**: ❌ NOT CONFIGURED
**Risk**: 🔴 CRITICAL - Students can see/modify other students' grades, teachers can modify any grade

**RLS Policy**:
```sql
-- Policy 1: Students see their own grades
CREATE POLICY "grades_student_read"
  ON grades FOR SELECT
  USING (
    student_id = auth.uid()
  );

-- Policy 2: Teachers see grades for their classrooms
CREATE POLICY "grades_teacher_read"
  ON grades FOR SELECT
  USING (
    classroom_id IN (
      SELECT id FROM classrooms WHERE teacher_id = auth.uid()
    )
  );

-- Policy 3: Principals see all grades in school
CREATE POLICY "grades_principal_read"
  ON grades FOR SELECT
  USING (
    (SELECT role FROM users WHERE id = auth.uid()) IN ('principal', 'founder', 'admin')
    AND classroom_id IN (
      SELECT id FROM classrooms
      WHERE school_id = (SELECT school_id FROM users WHERE id = auth.uid())
    )
  );

-- Policy 4: Only teacher can insert grades
CREATE POLICY "grades_insert_teacher"
  ON grades FOR INSERT
  WITH CHECK (
    classroom_id IN (
      SELECT id FROM classrooms WHERE teacher_id = auth.uid()
    )
  );

-- Policy 5: Only teacher can update grades in their classroom
CREATE POLICY "grades_update_teacher"
  ON grades FOR UPDATE
  USING (
    classroom_id IN (
      SELECT id FROM classrooms WHERE teacher_id = auth.uid()
    )
  );

-- Policy 6: Only teacher can delete
CREATE POLICY "grades_delete_teacher"
  ON grades FOR DELETE
  USING (
    classroom_id IN (
      SELECT id FROM classrooms WHERE teacher_id = auth.uid()
    )
  );
```

---

### ⚠️ TABLE 7: `lessons`
**Purpose**: Lesson content and schedule
**Columns**: id, classroom_id, teacher_id, title, content, order_index, published_at, created_at

**Current RLS**: ❌ NOT CONFIGURED

**RLS Policy**:
```sql
-- Policy 1: Teachers see their own lessons
CREATE POLICY "lessons_teacher_read"
  ON lessons FOR SELECT
  USING (
    teacher_id = auth.uid()
    OR classroom_id IN (SELECT id FROM classrooms WHERE teacher_id = auth.uid())
  );

-- Policy 2: Students see lessons in enrolled classrooms
CREATE POLICY "lessons_student_read"
  ON lessons FOR SELECT
  USING (
    published_at IS NOT NULL
    AND classroom_id IN (
      SELECT classroom_id FROM classroom_students
      WHERE student_id = auth.uid()
    )
  );

-- Policy 3: Principals see all school lessons
CREATE POLICY "lessons_principal_read"
  ON lessons FOR SELECT
  USING (
    (SELECT role FROM users WHERE id = auth.uid()) IN ('principal', 'founder', 'admin')
    AND classroom_id IN (
      SELECT id FROM classrooms
      WHERE school_id = (SELECT school_id FROM users WHERE id = auth.uid())
    )
  );

-- Policy 4: Only teacher can insert
CREATE POLICY "lessons_insert_teacher"
  ON lessons FOR INSERT
  WITH CHECK (
    teacher_id = auth.uid()
    AND classroom_id IN (
      SELECT id FROM classrooms WHERE teacher_id = auth.uid()
    )
  );

-- Policy 5: Only teacher can update own lessons
CREATE POLICY "lessons_update_teacher"
  ON lessons FOR UPDATE
  USING (teacher_id = auth.uid());
```

---

### ⚠️ TABLE 8: `teacher_notes`
**Purpose**: Teacher venting/reflection (SENSITIVE)
**Columns**: id, teacher_id, content, type (venting/reflection/note), created_at, updated_at

**Current RLS**: ❌ NOT CONFIGURED
**Risk**: 🔴 CRITICAL - Teachers' private notes could be exposed

**RLS Policy**:
```sql
-- Policy 1: Only the teacher can see their own notes
CREATE POLICY "teacher_notes_read_own"
  ON teacher_notes FOR SELECT
  USING (
    teacher_id = auth.uid()
  );

-- Policy 2: NO PRINCIPAL/ADMIN ACCESS - these are private
-- (Unlike grades, notes are purely personal venting)

-- Policy 3: Only teacher can insert
CREATE POLICY "teacher_notes_insert_own"
  ON teacher_notes FOR INSERT
  WITH CHECK (teacher_id = auth.uid());

-- Policy 4: Only teacher can update
CREATE POLICY "teacher_notes_update_own"
  ON teacher_notes FOR UPDATE
  USING (teacher_id = auth.uid());

-- Policy 5: Only teacher can delete
CREATE POLICY "teacher_notes_delete_own"
  ON teacher_notes FOR DELETE
  USING (teacher_id = auth.uid());
```

---

### ⚠️ TABLE 9: `assignments`
**Purpose**: Assignment metadata
**Columns**: id, classroom_id, lesson_id, title, description, due_date, max_points, created_at

**RLS Policy**:
```sql
-- Policy 1: Teachers see assignments in their classrooms
CREATE POLICY "assignments_teacher_read"
  ON assignments FOR SELECT
  USING (
    classroom_id IN (
      SELECT id FROM classrooms WHERE teacher_id = auth.uid()
    )
  );

-- Policy 2: Students see assignments in enrolled classes
CREATE POLICY "assignments_student_read"
  ON assignments FOR SELECT
  USING (
    classroom_id IN (
      SELECT classroom_id FROM classroom_students
      WHERE student_id = auth.uid()
    )
  );

-- Policy 3: Only teacher can create
CREATE POLICY "assignments_insert_teacher"
  ON assignments FOR INSERT
  WITH CHECK (
    classroom_id IN (
      SELECT id FROM classrooms WHERE teacher_id = auth.uid()
    )
  );

-- Policy 4: Only teacher can update
CREATE POLICY "assignments_update_teacher"
  ON assignments FOR UPDATE
  USING (
    classroom_id IN (
      SELECT id FROM classrooms WHERE teacher_id = auth.uid()
    )
  );
```

---

### ⚠️ TABLE 10: `community_posts`
**Purpose**: Community discussion posts
**Columns**: id, school_id, author_id, content, visibility (class/grade/school/teachers_only/public), created_at

**RLS Policy**:
```sql
-- Policy 1: Users see posts visible to their role/scope
CREATE POLICY "community_posts_read"
  ON community_posts FOR SELECT
  USING (
    school_id = (SELECT school_id FROM users WHERE id = auth.uid())
    AND (
      visibility = 'public'
      OR (visibility = 'school' AND school_id = (SELECT school_id FROM users WHERE id = auth.uid()))
      OR (visibility = 'teachers_only' AND (SELECT role FROM users WHERE id = auth.uid()) IN ('teacher', 'principal', 'founder', 'admin'))
      OR author_id = auth.uid()
    )
  );

-- Policy 2: Only users in school can post
CREATE POLICY "community_posts_insert"
  ON community_posts FOR INSERT
  WITH CHECK (
    school_id = (SELECT school_id FROM users WHERE id = auth.uid())
  );

-- Policy 3: Only author can update
CREATE POLICY "community_posts_update"
  ON community_posts FOR UPDATE
  USING (author_id = auth.uid());

-- Policy 4: Only author can delete
CREATE POLICY "community_posts_delete"
  ON community_posts FOR DELETE
  USING (author_id = auth.uid());
```

---

### ⚠️ TABLE 11: `library_resources`
**Purpose**: Shared teaching resources
**Columns**: id, school_id, creator_id, title, type, visibility, created_at

**RLS Policy**:
```sql
-- Policy 1: Users see resources visible in their school
CREATE POLICY "library_resources_read"
  ON library_resources FOR SELECT
  USING (
    school_id = (SELECT school_id FROM users WHERE id = auth.uid())
    AND (
      visibility = 'public'
      OR visibility = 'school'
      OR creator_id = auth.uid()
    )
  );

-- Policy 2: Users can share resources to their school
CREATE POLICY "library_resources_insert"
  ON library_resources FOR INSERT
  WITH CHECK (
    school_id = (SELECT school_id FROM users WHERE id = auth.uid())
    AND creator_id = auth.uid()
  );

-- Policy 3: Only creator can update
CREATE POLICY "library_resources_update"
  ON library_resources FOR UPDATE
  USING (creator_id = auth.uid());
```

---

## 🔧 IMPLEMENTATION STEPS

### Step 1: Enable RLS on All Tables
```sql
-- Run in Supabase SQL Editor
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE classrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE classroom_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE library_resources ENABLE ROW LEVEL SECURITY;
```

### Step 2: Deploy Policies (In Order)
1. Start with `users` table (foundational)
2. Deploy `schools` policies
3. Deploy `classrooms` + `classroom_students` (enrollment)
4. Deploy `grades` (most sensitive)
5. Deploy `lessons`, `assignments`
6. Deploy `teacher_notes` (private)
7. Deploy `community_posts`, `library_resources`

### Step 3: Test After Each Table
Use the test cases provided above

### Step 4: Monitor Logs
Check Supabase logs for RLS violations:
```sql
SELECT * FROM pg_stat_statements
WHERE query LIKE '%RLS%'
ORDER BY calls DESC;
```

---

## ✅ TESTING FRAMEWORK

### Test Template
```typescript
// Test: User A cannot read User B's data (different school)
async function testSchoolIsolation() {
  const { data, error } = await supabase
    .from('grades')
    .select('*')
    .eq('student_id', userBId)
    .eq('classroom_id', otherSchoolClassroomId);

  // Should fail with RLS error, not return data
  expect(error).toBeDefined();
  expect(error.message).toContain('denied');
  expect(data).toBeNull();
}
```

### Critical Test Cases
- [ ] **Teacher can grade students in their classroom**
- [ ] **Teacher CANNOT grade students in other teacher's classroom**
- [ ] **Student CANNOT read other student's grades**
- [ ] **Student CANNOT modify any grade**
- [ ] **Principal can see all grades in school**
- [ ] **Principal CANNOT see grades from other school**
- [ ] **Teacher notes are invisible to principals**
- [ ] **Teachers cannot read other teachers' notes**

---

## 📈 SECURITY METRICS

After implementing RLS:

| Metric | Before | After | Target |
|--------|--------|-------|--------|
| Data Leakage Risk | 🔴 HIGH | 🟢 LOW | 🟢 LOW |
| Unauthorized Access | 🔴 UNBLOCKED | 🟢 DENIED | 🟢 DENIED |
| Cross-School Access | 🔴 POSSIBLE | 🟢 BLOCKED | 🟢 BLOCKED |
| Grade Tampering | 🔴 POSSIBLE | 🟢 IMPOSSIBLE | 🟢 IMPOSSIBLE |
| Private Data Exposure | 🔴 YES | 🟢 NO | 🟢 NO |

---

## 🚨 COMMON MISTAKES TO AVOID

1. ❌ **Forgetting to enable RLS on the table itself**
   - Tables won't use policies unless RLS is ON

2. ❌ **Missing the `WITH CHECK` clause on INSERT/UPDATE**
   - Allows insertion but silently fails checks

3. ❌ **Using OR in RLS without testing**
   - Complex OR logic can accidentally grant access

4. ❌ **Assuming API checks replace RLS**
   - RLS is the final enforcement layer

5. ❌ **Not testing as different roles**
   - Test as teacher, student, principal, admin

6. ❌ **Forgetting to deny explicitly**
   - No policy doesn't mean no access, it means access allowed!

---

## ✨ NEXT STEPS

1. **Review this document** with the team
2. **Create test database** with sample users from different schools
3. **Deploy policies table-by-table** (use SQL in Supabase console)
4. **Test after each table** using provided test cases
5. **Monitor logs** for violations
6. **Document any variations** from this guide

---

**Status**: Ready for implementation
**Effort**: 2-3 hours
**Risk if skipped**: 🔴 CRITICAL - Data breach possible
**Deployment**: Must complete before Alpha launch

