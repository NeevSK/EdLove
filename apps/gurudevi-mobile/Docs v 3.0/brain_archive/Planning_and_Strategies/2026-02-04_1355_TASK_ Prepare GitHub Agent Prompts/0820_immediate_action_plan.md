# 🚨 IMMEDIATE ACTION PLAN
**Date**: February 4, 2026

---

## 📋 YOUR CONCERNS - ALL ADDRESSED

### 1. ✅ SUPABASE STATUS CHECK

**Current situation**: Hardcoded friend's Supabase credentials in [`supabase.ts`](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/src/lib/supabase.ts#L5-L6)

```typescript
const supabaseUrl = 'https://zofannumpvstuukwlbvw.supabase.co';
const supabaseAnonKey = 'eyJhbGc...'; // Friend's key
```

**ACTION REQUIRED**:
1. Create YOUR OWN Supabase project (15 min)
2. Set up database schema (30 min)
3. Configure RLS policies (45 min)
4. Replace credentials (5 min)

---

### 2. ✅ DATABASE SCHEMA & RLS SETUP

According to [ARCHITECTURE.md](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/Docs%20v%203.0/GURUDEVI_ARCHITECTURE_v4_0_UPDATED.md), you need these tables:

#### **Core Tables (Priority 1 - Build Today)**:
```sql
-- Essential for v0.1
1. schools
2. users (with RLS for school isolation)
3. mood_logs (for Self section)
4. self_reflections (for Self section)
5. classrooms (for Classroom section)
6. lessons (for Classroom section)
7. announcements (for Community section)
```

#### **Extended Tables (Priority 2 - Build This Week)**:
```sql
8. classroom_students (many-to-many)
9. assignments
10. submissions
11. grades
12. library_resources
13. subscriptions (pricing tiers)
```

**RLS (Row Level Security) is CRITICAL**:
- Students see only THEIR enrolled classrooms
- Teachers see only THEIR created classrooms
- Principals see ALL classrooms in THEIR school
- No school sees another school's data

---

### 3. ✅ AUTH FLOW - GITHUB AGENT CHANGES

**You said**: "I did auth screen changes in GitHub agent yesterday"

**ACTION**: Pull those changes first!

```bash
# Check if there are remote changes
git fetch origin
git log HEAD..origin/main --oneline

# If changes exist, pull them
git pull origin main

# Or merge specific branch if you worked on a feature branch
```

**Then test auth flow**:
1. Does sign up work?
2. Does sign in work?
3. Does session persist?
4. Does logout work?

---

### 4. ✅ WORKLOAD DELEGATION STRATEGY

**Use GitHub Cloud Agent for:**

✅ **Quick autocomplete/boilerplate**:
- Form input fields
- Style objects
- Import statements
- Type definitions
- Repetitive UI components

✅ **Single-file edits you know exactly what to do**:
- "Add a button here"
- "Fix this style"
- "Add this field to the form"

❌ **DO NOT use GitHub Agent for**:
- Multi-file refactoring
- Architecture decisions
- Database schema design
- Complex state management
- Anything requiring understanding of NORTH_STAR.md principles

**Use Antigravity (me) for:**

✅ **Architecture & Planning**:
- Database schemas
- Component structure
- Feature planning
- State management patterns

✅ **Multi-file work**:
- Creating new features (multiple files)
- Refactoring across components
- Setting up new systems

✅ **Learning & Guidance**:
- How to implement something
- Best practices
- Debugging complex issues

**CLEAR INSTRUCTIONS for GitHub Agent** (I'll help you write these!):

Example prompt for GitHub Agent:
```
Create a LotusButton component in src/components/LotusButton.tsx

Requirements:
- 3 variants: primary, secondary, ghost
- Props: title, onPress, variant, loading, disabled, icon
- Use Theme.colors for styling
- Use hapticLight() on press
- Export as default

Style:
- primary: background sanctuarySaffron, text white
- secondary: background transparent, border sanctuarySaffron, text sanctuarySaffron
- ghost: no background, text dimGray
- borderRadius: Theme.corners.comfortable
- padding: Theme.spacing.md
```

**I can help you write prompts like this for each task!**

---

### 5. ✅ SELF SECTION - WELLBEING FEATURES

You said: "in self section it need wellbeing so think what else should be there"

**According to [ARCHITECTURE.md lines 115-136](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/Docs%20v%203.0/GURUDEVI_ARCHITECTURE_v4_0_UPDATED.md#L115-L136):**

#### **For Teachers (PRIMARY USER)**:
1. **Fire Journal** (voice notes to release burnout)
2. **Breathing Exercises** (lotus-guided, calm restoration)
3. **Weekly Reflection** (text/voice, what went well/what was hard)
4. **Burnout Prevention Dashboard** (mood trends, energy levels)

#### **For Students**:
1. **Daily Mood Check-in** (emoji selector, quick log)
2. **Personal Goals** (academic + wellbeing)
3. **Reflection Journal** (text, private)
4. **Mindful Moments** (quick exercises)

#### **For Principals**:
1. **Leadership Reflection** (strategic thinking space)
2. **School Vision Journal** (long-term planning)
3. **Daily Priorities** (focus setter)

**v0.1 MVP (Build This Week)**:
- [ ] Daily mood check-in (all roles)
- [ ] Reflection journal (text-based)
- [ ] Mood history view

**v0.5 (Later)**:
- [ ] Voice recording for reflections
- [ ] Breathing exercises
- [ ] Trend analytics

---

### 6. ✅ CLASSROOM SECTION - FULL MANAGEMENT

You're absolutely right! It's **NOT just lessons**. According to your architecture, Classroom needs:

#### **Capital Management**:

**📚 Lesson Content (Knowledge Capital)**:
- Create lesson
- Upload materials (PDF, video)
- Organize by unit/week
  
**👥 Human Capital (Students)**:
- Class roster (view students)
- Student enrollment (add/remove)
- Student attendance tracking
- Individual student progress

**🏫 Physical Capital (Resources)**:
- Classroom resources inventory (optional v0.5)
- Equipment booking (optional v0.5)

#### **Classroom CRUD Operations**:
```typescript
// Create Classroom
POST /classrooms
{
  name: "Grade 10 - Mathematics",
  grade_level: "10",
  subject: "Mathematics",
  teacher_id: currentUser.id,
  school_id: currentUser.school_id
}

// Read (List Classrooms)
GET /classrooms?teacher_id=xyz

// Update Classroom
PATCH /classrooms/:id
{
  name: "Grade 10 - Advanced Math"
}

// Delete Classroom
DELETE /classrooms/:id
```

#### **Attendance System**:
- Daily/weekly attendance logs
- Per lesson attendance (optional)
- Attendance reports

#### **Grading System**:
```typescript
// Types of grades
- Assignment grades (individual submissions)
- Module/Subject grades (aggregated)
- Marks (numerical: 0-100)
- GPA calculation (4.0 scale? or Sri Lankan system?)
```

**QUESTION FOR YOU**: What grading system does Sri Lankan schools use?
- Percentage (0-100)?
- Letter grades (A, B, C, D, F)?
- GPA (4.0 scale)?
- Custom system?

---

### 7. ✅ LIBRARY vs CLASSROOM - LESSONS LOCATION

**This is a BRILLIANT design question!** Let's think through it:

#### **Option A: Lessons in Classroom Only**
```
Classroom Section:
├── My Classrooms
│   ├── Grade 10 Math
│   │   ├── Lessons (created here)
│   │   ├── Assignments
│   │   └── Students
│   └── Grade 11 Math

Library Section:
├── My Personal Library (teacher's desk)
├── School-wide Resources (public library)
└── Curated Content (EdTech resources)
```

**Pros**:
- Clear separation: Teaching (Classroom) vs Resources (Library)
- Lessons tied to specific class context
- Students see only their enrolled class lessons

**Cons**:
- Can't reuse lesson across multiple classes easily
- Can't share lessons with other teachers

---

#### **Option B: Lessons in Library, SHARE to Classroom**
```
Library Section:
├── My Resources (personal desk)
│   ├── Lessons I Created
│   ├── PDFs
│   └── Videos
├── School Resources (public library)
└── Curated Content

Classroom Section:
├── My Classrooms
│   ├── Grade 10 Math
│   │   ├── Shared Lessons (from library)
│   │   ├── Assignments
│   │   └── Students
```

**Pros**:
- Create once, share to multiple classes
- Easy to share with other teachers
- Personal library = your desk
- Classroom library = shared space

**Cons**:
- More complex (two-step: create in library → add to classroom)
- Students might be confused where to find things

---

#### **🎯 MY RECOMMENDATION: HYBRID (Best of Both)**

```
Library Section: (Your Personal + School Repository)
├── My Resources
│   ├── Lessons (templates/drafts)
│   ├── Teaching Materials
│   └── Reference Documents
├── School-wide Resources
│   └── Official Curriculum
└── Shared by Others

Classroom Section: (Active Teaching Space)
├── Grade 10 Math
│   ├── Weekly Plans
│   ├── Active Lessons (copies from library + new)
│   ├── Assignments
│   ├── Attendance
│   └── Students
```

**How it works**:
1. **Create lesson in Classroom** (fast, context-aware)
2. **"Save to My Library"** button → Reusable template
3. **"Share to Another Classroom"** → Copy to different class
4. **"Publish to School Library"** → Other teachers can use

**This gives you**:
- ✅ Quick lesson creation where you need it (Classroom)
- ✅ Personal library for reuse (Library)
- ✅ School-wide sharing (Library)
- ✅ Students see lessons in Classroom context only

**Does this feel right to you?**

---

### 8. ✅ BDD vs CURRENT APPROACH

**You asked**: "Whether to do behavior driven development or what we are doing now is fine?"

**Current Approach** (What you're doing):
- Architecture-first (BUILD_ORDER.md)
- Foundation → Components → Features
- Document-driven development

**Behavior-Driven Development (BDD)**:
```gherkin
Feature: Teacher creates a lesson
  Scenario: Teacher creates a new lesson
    Given I am logged in as a teacher
    And I am viewing "Grade 10 Math" classroom
    When I tap the lotus petal FAB
    And I fill in lesson title "Algebra Basics"
    And I tap "Save"
    Then I should see "Lesson created"
    And the lesson should appear in the classroom
```

**MY RECOMMENDATION**: **Hybrid Approach**

**Why NOT pure BDD right now**:
- ❌ Adds overhead (writing Gherkin + tests + implementation)
- ❌ Slows initial development
- ❌ You're still exploring features (requirements changing)
- ❌ Foundation still being built

**What TO DO**:
✅ **Keep current architecture-first approach** for foundation  
✅ **Add simple test scenarios** for critical paths:

```typescript
// Simple test (not full BDD)
describe('Mood Check-in', () => {
  it('saves mood to database', async () => {
    const mood = { emotion: 'calm', intensity: 7 };
    const result = await saveMood(mood);
    expect(result.success).toBe(true);
  });
});
```

✅ **Use BDD thinking** (user stories) for planning:
```markdown
## User Story: Teacher Creates Lesson

As a teacher,
I want to create a lesson in my classroom,
So that my students can access the material.

Acceptance Criteria:
- [ ] Can add title, description
- [ ] Can upload PDF/video
- [ ] Can set due date
- [ ] Students see it immediately
- [ ] Can edit/delete later
```

**AFTER v0.1**:
Consider adding proper BDD for critical flows:
- Auth (signup/signin)
- Create classroom
- Submit assignment
- Grade student

**For now: Document-driven (what you're doing) is PERFECT for foundation phase.**

---

## 🎯 TODAY'S PRIORITY ACTIONS

### STEP 1: Set Up YOUR Supabase (1 hour)

**1.1 Create Supabase Project** (10 min):
```
1. Go to https://supabase.com
2. Sign in with your account
3. New Project → "Gurudevi"
4. Region: Singapore (closest to Sri Lanka)
5. Database password: <strong password>
6. Wait for provisioning (~2 min)
```

**1.2 Copy Credentials** (5 min):
```
Settings → API
- Copy Project URL
- Copy anon public key
```

**1.3 Create .env file** (5 min):
```bash
# In apps/gurudevi-mobile/.env
EXPO_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT-ID.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...YOUR-KEY
```

**1.4 Update supabase.ts** (5 min):
```typescript
// src/lib/supabase.ts
import { EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY } from '@env';

const supabaseUrl = EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = EXPO_PUBLIC_SUPABASE_ANON_KEY;
```

---

### STEP 2: Create Database Schema (45 min)

I'll create a complete SQL script for you.

**Tables to create NOW** (for v0.1):
1. schools
2. users (with auth.users sync)
3. mood_logs
4. self_reflections
5. classrooms
6. lessons
7. classroom_students
8. assignments
9. grades
10. announcements

**Want me to create the complete SQL script with RLS policies?**

---

### STEP 3: Pull GitHub Agent Changes (5 min)

```bash
cd c:\Users\Naween\projects\polymath-platform

# Check for remote changes
git fetch origin

# See what changed
git log HEAD..origin/main --oneline

# Pull if there are auth changes
git pull origin main

# Or if on a different branch
git checkout main
git pull
```

---

### STEP 4: Test Auth Flow (15 min)

```bash
# Start the app
cd apps/gurudevi-mobile
npm start

# Test in emulator:
1. Can you sign up?
2. Can you sign in?
3. Does it remember you after closing app?
4. Can you log out?
```

---

## ❓ DECISIONS NEEDED FROM YOU

1. **Grading System**: What system do Sri Lankan schools use?
   - Percentage (0-100)?
   - Letter grades?
   - GPA?

2. **Library vs Classroom**: Do you like the HYBRID approach I suggested?
   - Create lessons in Classroom
   - Save to Library for reuse
   - Share across classes

3. **Supabase Setup**: Should I create the complete database schema SQL for you now?

4. **BDD**: Happy with hybrid approach (document-driven + user stories)?

---

## 🚀 NEXT STEPS AFTER DECISIONS

Once you answer the questions above, I'll:

1. ✅ Create complete Supabase schema SQL script
2. ✅ Write clear GitHub Agent prompts for component creation
3. ✅ Plan Library/Classroom interaction pattern
4. ✅ Design grading system based on Sri Lankan standards

**Which should we tackle first?**

A) Set up Supabase + database schema (foundational blocker)  
B) Pull GitHub changes + test auth  
C) Design Library/Classroom interaction  
D) All of the above in sequence

What feels most urgent to you?
