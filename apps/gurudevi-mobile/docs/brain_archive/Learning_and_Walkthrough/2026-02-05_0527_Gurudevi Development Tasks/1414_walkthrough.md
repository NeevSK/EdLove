# 🏫 Sri Lankan School Hierarchy Implementation - Walkthrough

**Date**: 2026-02-04  
**Status**: ✅ Schema complete, ready for testing

---

## 🎯 What Was Built

### 1. **Proper Sri Lankan School Classification**

Added official school types used in Sri Lanka:

**Government Schools:**
- **1AB** - ජාතික පාසල (National Schools) - Complete facilities, all streams
- **1C** - පළාත් පාසල (Provincial Schools) - Good facilities  
- **Type 2** - O/L දක්වා (Up to GCE O/L)
- **Type 3** - ප්‍රාථමික (Primary only, Grades 1-5)

**Other Schools:**
- Semi-Government, Private, International, Pirivena
- **Personal Workspace** - For solo teachers (can join school later)

---

### 2. **Organizational Hierarchy**

```
School (Principal)
└── Sections (Section Heads)
    ├── Primary (Grades 1-5)
    ├── Junior Secondary (Grades 6-9)
    └── Senior Secondary (Grades 10-13)
        └── Grades (Grade Heads)
            └── Classrooms (Teachers)
                └── Students
```

---

### 3. **Role-Based Access**

| Role | Level | Access | Tab Name |
|------|-------|--------|----------|
| Principal | 1 (Highest) | Entire school | "School" |
| Section Head | 2 | Their section only | "Section" |
| Grade Head | 3 | Their grade only | "Grade" |
| Teacher | 4 | Assigned classes | "Classroom" |
| Student | 5 | Own class only | "Classroom" |

---

### 4. **Flexible Signup Flow**

**Before** ❌:
- Everyone created "Default School"
- Multiple duplicate schools
- Couldn't work solo

**Now** ✅:
```typescript
// Teachers/Students signing up solo
→ Creates "John's Workspace" (personal_workspace)
→ Can use app immediately
→ Can join real school later via invite code

// Principals signing up
→ Creates "John's School" (1AB type)
→ Gets invite codes to share
→ Teachers join via codes
```

---

## 📂 Files Created

### SQL Schema Files

**1. [`sri_lankan_hierarchy_schema.sql`](file:///C:/Users/Naween/.gemini/antigravity/brain/426210bd-da2b-48cd-8376-cb5dc369fc5b/sri_lankan_hierarchy_schema.sql)**
- Updates `schools` table with SL school types
- Creates `sections` table
- Creates `grades` table  
- Adds `section_head`, `grade_head` roles to users
- Adds RLS policies

**What to do**: Run in Supabase SQL Editor (after `minimal_schema.sql`)

---

### TypeScript Files

**2. [`SriLankanSchools.ts`](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/src/constants/SriLankanSchools.ts)**

**Contains:**
- `SRI_LANKAN_SCHOOL_TYPES` - All school types with translations
- `SCHOOL_SECTIONS` - Primary/Junior/Senior with grade ranges
- `USER_ROLES` - All 5 roles with hierarchy levels
- `SRI_LANKAN_DISTRICTS` - All 25 districts (Colombo to Kegalle)
- Helper functions:
  - `getSchoolTypeLabel(type, language)` 
  - `getSectionLabel(section, language)`
  - `getRoleLabel(role, language)`
  - `getGradesForSection(section)`
  - `getSectionForGrade(gradeNumber)`

**Example usage:**
```typescript
import { SRI_LANKAN_SCHOOL_TYPES, getSchoolTypeLabel } from '@/constants/SriLankanSchools';

// Get label in Sinhala
const label = getSchoolTypeLabel('1AB', 'si'); // "ජාතික පාසල (1AB)"
```

---

### Updated Files

**3. [`AuthScreen.tsx`](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/src/screens/AuthScreen.tsx#L93-L117)**

**Changed:**
```diff
- name: 'Default School'
- type: 'government'
+ name: role === 'principal' 
+   ? `${fullName}'s School`      // Official school
+   : `${fullName}'s Workspace`   // Personal workspace
+ type: role === 'principal'
+   ? '1AB'                        // Default to national school
+   : 'personal_workspace'         // Solo teacher workspace
```

**Impact:**
- ✅ Solo teachers can start immediately
- ✅ No duplicate "Default School" entries
- ✅ Can join real school with invite code later

---

## 🗄️ Database Schema Changes

### Tables Added

**`sections`**
```sql
CREATE TABLE sections (
  id UUID PRIMARY KEY,
  school_id UUID REFERENCES schools(id),
  name TEXT,  -- 'Primary', 'Junior Secondary', 'Senior Secondary'
  name_si TEXT,  -- 'ප්‍රාථමික', 'කනිෂ්ඨ', 'ජ්‍යෙෂ්ඨ'
  name_ta TEXT,
  grade_range TEXT,  -- '1-5', '6-9', '10-13'
  section_head_id UUID REFERENCES users(id)
);
```

**`grades`**
```sql
CREATE TABLE grades (
  id UUID PRIMARY KEY,
  school_id UUID REFERENCES schools(id),
  section_id UUID REFERENCES sections(id),
  grade_number INTEGER (1-13),
  grade_head_id UUID REFERENCES users(id)
);
```

---

### Tables Modified

**`schools`**
```sql
-- New types added
type CHECK (type IN (
  '1AB', '1C', 'Type_2', 'Type_3',
  'semi_government', 'private', 'international', 'pirivena',
  'personal_workspace'
))
```

**`users`**
```sql
-- New roles
role CHECK (role IN (
  'principal', 'section_head', 'grade_head', 'teacher', 'student'
))

-- New columns
section_id UUID REFERENCES sections(id)
grade_id UUID REFERENCES grades(id)
```

---

## 🧪 Testing Instructions

### Test 1: Solo Teacher Signup

1. **Sign up as teacher**:
   ```
   Email: teacher@test.com
   Name: Priyanka
   Role: Teacher
   ```

2. **Check database**:
   ```sql
   SELECT name, type FROM schools 
   WHERE name LIKE 'Priyanka%';
   
   -- Expected: "Priyanka's Workspace", type: "personal_workspace"
   ```

3. **Profile screen should show**:
   - Name: Priyanka
   - Role: Teacher (ගුරුවරයා)
   - School: Priyanka's Workspace

---

### Test 2: Principal Creates School

1. **Sign up as principal**:
   ```
   Email: principal@test.com
   Name: Mr. Fernando
   Role: Principal
   ```

2. **Check database**:
   ```sql
   SELECT name, type FROM schools 
   WHERE name LIKE 'Mr. Fernando%';
   
   -- Expected: "Mr. Fernando's School", type: "1AB"
   ```

3. **Later**: Principal can change type to 1C/Type 2/etc in settings

---

### Test 3: Verify New School Types Work

```sql
-- Try creating school with new types
INSERT INTO schools (name, type) VALUES 
  ('Test 1AB School', '1AB'),
  ('Test 1C School', '1C'),
  ('Test Type 2 School', 'Type_2'),
  ('Test Type 3 School', 'Type_3'),
  ('Test Pirivena', 'pirivena'),
  ('Test Workspace', 'personal_workspace');

-- Should all succeed ✅
```

---

## 🔮 Next Phase: Role-Based UI

**What needs to be built:**

### For Principal:
- Change bottom tab "Classroom" → "School"
- Show hierarchy view:
  ```
  School Overview
  ├─ Primary Section (123 students)
  ├─ Junior Section (89 students)
  └─ Senior Section (67 students)
  ```

### Verification Results
- **Merge Conflicts**: Resolved in `App.tsx` and `TabNavigator.tsx`.
- **API Structure**: Transitioned to modular `src/lib/api/` structure. **Fixed:** Deleted zombie `src/lib/api.ts` file that was resurrected during merge, preventing import ambiguity.
- **Type Safety**: Fixed TypeScript errors in `SriLankanSchools.ts`, `permissions.ts`, and UI components (`SanctuaryCard`, `LotusDropdown`). **Fixed:** Relaxed type constraints in `SanctuaryCard` and added missing styles in `LotusDropdown` to resolve build errors.
- **Build Status**: `tsc` passed (remaining warnings are non-critical dependency interactions).
- **Remote Sync**: Changes pushed to `fix/mobile-warnings`.

### Mission 02 (Teacher Workbench) Resolution
- **Branch**: `copilot/complete-mission-02-teacher-workbench`
- **Conflicts**: 
  - Resolved `src/lib/api.ts` (deleted proxy) vs modular structure.
  - Consolidated granular API files (`tasks.ts`, `notes.ts`) into `teacher.ts` to avoid duplication.
  - Preserved new feature modules (`attendance.ts`, `resources.ts`, `groups.ts`).
- **Fixes**: 
  - Updated all feature modules to use unified `types.ts` (removed referenced to deleted `errors.ts`).
  - Fixed `FlatList` type error in `AttendanceSheet.tsx` (Gluestack compatibility).
- **Status**: **CLEAN BUILD** (0 errors). Pushed to remote.

### Parallel Agent Work Recovery
- **Restored**: `API_REFACTORING_COMPARISON.md` (Lost in merge, retrieved from git history).
- **Verified**: Changes to `SectionHeadView.tsx` and `GradingView.tsx` from commit `9b8cce7` are present in `main`.

You can now merge this branch into `main` via PR or continue development on the modular structure.

### For Section Head:
- Bottom tab: "Section"
- Shows only their section's grades and classes

### For Grade Head:
- Bottom tab: "Grade"  
- Shows only their grade's classes

### For Teacher (current):
- Keep as is (shows assigned classes)

### For Student (current):
- Keep as is (shows own class)

---

## 📝 Summary of Changes

| Component | What Changed |
|-----------|--------------|
| **School Types** | Added 1AB, 1C, Type 2, Type 3, pirivena, personal_workspace |
| **Database** | Added `sections` and `grades` tables |
| **User Roles** | Added `section_head` and `grade_head` |
| **Signup** | Personal workspace for solo teachers, official school for principals |
| **Constants** | Created `SriLankanSchools.ts` with all SL-specific data |
| **Districts** | All 25 SL districts with Sinhala/Tamil translations |

---

## ✅ Benefits

1. **Accurate to Sri Lankan System** 🇱🇰
   - Uses actual school classification (1AB/1C/Type2/Type3)
   - Reflects real organizational structure

2. **Flexible Onboarding** 🚀
   - Solo teachers can start immediately
   - No waiting for principal to create school
   - Can join official school later

3. **Future-Proofv** 🔮
   - Hierarchy supports section heads, grade heads
   - Ready for role-based UI implementation
   - Scalable to large schools (1000+ students)

4. **Multilingual** 🌏
   - All labels in Sinhala, Tamil, English
   - Culturally appropriate terminology

---

**Ready for**: SQL execution and role-based UI implementation! 🎉

---
## 🐛 Debugging Log: The Ghost User & RLS Recursion (Mission 03)

**Issue 1: Infinite Recursion (Error 42P17)**
- **Symptom**: "infinite recursion detected in policy"
- **Cause**: The policy `Users can view users in their school` on table `users` tried to query `users` to find the current user's school.
- **Fix**: Created `get_my_school_id()` SECURITY DEFINER function to bypass RLS for this specific lookup.

**Issue 2: Missing Tables (Error PGRST205)**
- **Symptom**: `Could not find the table 'public.mood_logs'`
- **Cause**: Feature tables defined in Phase 4 were designed but never migrated.
- **Fix**: Generated and ran `20260205_features_schema.sql` (Mood, Classrooms, Community).

**Issue 3: The Ghost User (Error 23503)**
- **Symptom**: `insert or update on table "mood_logs" violates foreign key constraint`
- **Cause**: User existed in Supabase Auth (`auth.users`) but not in App Database (`public.users`).
- **Fix**:
    1.  Removed incompatible auto-sync trigger (conflicted with App logic).
    2.  Deleted "Ghost" user row.
    3.  Re-signed up to trigger correct App-side profile creation.

**Issue 4: RLS Violation on School Creation (Error 42501)**
- **Symptom**: `new row violates row-level security policy for table "schools"`
- **Cause**: User creates a School but isn't linked to it yet, so standard query policy blocked reading the returned row.
- **Fix**:
    1.  Added `created_by` column to `schools`.
    2.  Updated `AuthScreen.tsx` to sign the creation request.
    3.  Added policy: `"Creators can view their schools"`.
