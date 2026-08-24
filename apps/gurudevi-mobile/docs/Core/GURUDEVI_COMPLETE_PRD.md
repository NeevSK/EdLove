---
title: "GURUDEVI â€” COMPLETE PRODUCT REQUIREMENTS DOCUMENT"
status: "active"
created: 2026-02-11
updated: 2026-02-11
author: "Naveen"
scribe: "opencode"
tags: [apps, gurudevi-mobile]
---

# GURUDEVI — COMPLETE PRODUCT REQUIREMENTS DOCUMENT
## 11 Complete PRD | The Comprehensive Vision & Implementation Guide

**Role in Constellation**: Complete product specification for Gurudevi application  
**Compiled from**: Exploration session - February 8, 2026  
**Status**: Living Document - Additive to existing work  
**Last Updated**: February 8, 2026

---

## IMPORTANT NOTE

This document is **complementary and additive** to all existing documentation in the edlove constellation. Nothing here invalidates or overwrites what has already been built. This PRD:

- Extends the philosophical foundation from 01_PHILOSOPHY
- Complements the technical specifications in 03_TECH
- Expands the Gurudevi vision in 06_Domain_III
- Provides detailed implementation roadmap for 10_ROADMAP

**Integration principle**: Where this document adds new concepts (Thuthimal, Five-Section Architecture), they enhance and deepen existing work. Where concepts overlap, both perspectives are valid and generative.

---

## 1. CORE PHILOSOPHY & ARCHITECTURE

### 1.1 Educational Philosophy

**Education as Ecology**

Gurudevi is built on the belief that education is a living ecology, not a linear process. This builds upon the "Education as Care Work" principle from 01_PHILOSOPHY and operationalizes it at the classroom and school level.

Core ecological principles:
- Teachers, students, principals, and institutions inhabit the same educational reality
- They engage through different roles, responsibilities, and scales of action
- The platform exists to support, listen, and repair broken feedback loops within this ecology
- No single center of authority (polycentric)
- Each level sustains itself (autopoietic)
- Patterns arise from interactions (emergent)
- Guided by boundaries, not instructions (constraint-based)
- Feedback quality over enforcement (cybernetic)

**One Reality, Multiple Lenses**

One shared reality (school, classroom, system), viewed through multiple role-based perspectives:
- Teachers: daily practice
- Students: learning and effort
- Principals: coordination and institutional health
- Section/Grade heads: alignment and progression

**Requisite Variety (Systems Thinking)**

Education contains unavoidable complexity. The system must respond to diverse situations without overwhelming users. Achieved through:
- Few stable entry points
- Role-sensitive behavior
- Progressive revelation
- Complexity in depth, not surface clutter

**Ethical Commitments**
- No surveillance
- No forced comparison
- No extractive gamification
- Individual data protected by default
- Sharing is intentional and consensual
- Higher roles see patterns, not personal inner life

---

### 1.2 Thuthimal (තුතිමල්) — The Gratitude Economy

**NEW CONCEPT**: A unique feature that embeds gratitude and recognition into the platform's economic model.

**Concept**
- Sinhala: "Flower of Gratitude"
- Anyone can gift/donate Pro subscriptions to teachers
- Past students, old boys' associations, alumni can honor their teachers
- Recognizes teaching as sacred work deserving reciprocal care across time
- Not just a payment model — a gratitude economy embedded in the platform

**Visibility**
- Teachers with Thuthimal support see badge/indicator in their profile
- Recognition: "Your Pro subscription is a gift of gratitude (තුතිමල්) from [name/anonymous]"
- Creates honor and acknowledgment for educators

**Implementation Phases**

*Alpha (Manual):*
- Simple boolean flag: `is_thuthimal: true/false`
- Text field: `thuthimal_gifter: string` (name or "anonymous")
- Display badge in Profile/Self section
- External webpage for manual processing

*Beta (Automated):*
- Payment gateway integration (Stripe, PayPal, local gateways)
- In-app gifting interface
- Gift history and tracking
- Automated provisioning

---

### 1.3 Five-Section Architecture (Stable Ecological Zones)

**NEW ARCHITECTURAL PATTERN**: The platform has **five stable sections** that exist for all users. The *meaning* of each section adapts based on role, but the structure remains constant.

This replaces traditional navigation patterns with an ecological, role-adaptive structure.

#### 1️⃣ **Self — The Inner Ecology**

**Purpose:** Support the individual's inner world and personal practice

**What lives here:**
- Reflection and journaling (✅ Already implemented: Fire Journal, Wisdom Seeds)
- Personal notes and tasks (✅ Already implemented: Tomorrow's Prep)
- Private signals (mood, confidence, energy) (✅ Already implemented: Mood Lotus, Energy Forecast)
- Personal growth tracking (✅ Already implemented: Joy Jar, Gratitude Glimmers)
- Daily motivation quotes (⚠️ Needs implementation)
- "Did you know?" educational facts (⚠️ Needs implementation)

**Design principle:**
- Private, non-judgmental, non-comparative
- Nothing visible to others unless explicitly shared
- Always personal, regardless of role

**Current Status**: ✅ Strong foundation exists, needs daily content features

---

#### 2️⃣ **Classroom — The Immediate Operational Ecology**

**Purpose:** Support the user's closest sphere of responsibility

**The meaning of "Classroom" adapts by role:**
- **Teacher** → their class (✅ Implemented)
- **Student** → their learning space (✅ Implemented)
- **Principal** → their school (⚠️ Partially implemented)
- **Section Head** → their section/subject (⚠️ Needs implementation)
- **Grade Head** → their grade (⚠️ Needs implementation)

**Core domains (max 4-5):**
- People (✅ Student profiles, enrollment)
- Practice (✅ Lessons, assignments)
- Resources (✅ Library materials, lesson attachments)
- Signals (✅ Attendance, mood logs)
- Coordination (⚠️ Scheduling, announcements partially done)

**What lives here (role-dependent):**

*Already Implemented (✅):*
- Student profiles (individual creation)
- Student notes (private to teacher)
- Attendance (student attendance marking)
- Lessons and assignments
- Grading
- Classroom artifacts (through library system)

*Needs Implementation (⚠️):*
- Bulk student creation (input total number, create all at once)
- Student note sharing (to class context or library with consent)
- Photo uploads with principal sharing option
- Polls and quick feedback
- Reports and academic communication
- Section Head and Grade Head views

**Design principle:**
- Action-oriented, calm, role-appropriate
- Complexity exists inside, not on surface

**Current Status**: ✅ Teacher and Student views strong, needs Principal/Head views

---

#### 3️⃣ **Community — The Relational Ecology**

**Purpose:** Enable peer connection and collective sense-making

**What lives here:**
- Teacher communities (✅ Groups implemented)
- Peer discussion spaces (✅ Posts implemented)
- Shared challenges and practices
- Horizontal feedback

**Design principle:**
- Reduce isolation, repair lateral feedback loops
- Not noise or competition

**Status:** ✅ Beta (functional, needs critical mass and content)

---

#### 4️⃣ **Library — The Knowledge Ecology**

**Purpose:** Provide access to shared knowledge and collective memory

**What lives here:**
- Teaching and learning resources (✅ Library items implemented)
- Research and references (✅ Collections implemented)
- Global educator contributions
- Free-giving and shared materials
- Teacher-generated notes shared to community (⚠️ Sharing mechanism needs work)

**Design principle:**
- Exploratory and non-linear
- Browsing and discovery encouraged

**Status:** ✅ Beta (infrastructure exists, needs content seeding and discovery UX)

---

#### 5️⃣ **Profile — Identity & Boundaries**

**Purpose:** Manage identity, role, and system boundaries

**What lives here:**
- Role selection and permissions (✅ Implemented)
- Preferences and settings (✅ Implemented via user_preferences)
- About the app
- Pricing / donations (⚠️ Needs UI)
- Thuthimal badge/status (⚠️ Needs implementation)
- Onboarding and transitions (✅ Partially implemented)
- Profile completion progress (⚠️ Needs implementation)

**Design principle:**
- Profile defines from where you see the system, not what you control

**Current Status:** ✅ Core functionality exists, needs Thuthimal and completion tracking

---

### 1.4 Role-Based View System

**Before interacting with sections, users enter through a role-based view.**

**Available Roles:**
- Teacher (✅ Implemented)
- Student (✅ Implemented)
- Principal (✅ Implemented)
- Section Head (⚠️ Needs implementation)
- Grade Head (⚠️ Needs implementation)
- Personal User (non-institutional) (⚠️ Needs consideration)

**Role Principles:**
- Roles define lens, not hierarchy
- Higher roles see patterns, not private inner spaces
- No role automatically gains access to another role's inner ecology
- Movement between roles (if allowed) is explicit and intentional

**Multiple Role Handling:**

The reality: In small schools, one person may be Teacher + Grade Head + Section Head, or Principal + Teacher.

**Design approach:** Unified view with expanding scope
- User sees their classroom (teacher scale)
- User also sees their grade (grade head scale)
- Seamless interface, scope adjusts based on responsibilities
- One reality, not fragmented role-switching

**Current Status:** ✅ Single role per user implemented, ⚠️ multiple roles need architecture

---

## 2. ALPHA REQUIREMENTS (5-Day Build)

### 2.1 Release Strategy

**Version:** Alpha 0.1.0  
**Timeline:** 5 days from February 8, 2026  
**Distribution:** Invite-only, closed testing  
**Target users:** Principals → Teachers (max 3 invites per principal initially)

---

### 2.2 Authentication & Signup

**Current Status:** ✅ IMPLEMENTED

What exists:
- Email/password authentication ✅
- Google OAuth ready ✅
- Session management ✅
- User profiles ✅

**Needs refinement:**
- QR code auto-fill of invitation code (infrastructure exists, needs testing)
- Remove Apple Sign-In (or keep but deprioritize)

---

### 2.3 Onboarding Journey

**Current Status:** ⚠️ PARTIALLY IMPLEMENTED

**Screen 1-2 (MANDATORY — Cannot Skip):**
1. **Name** (required) - ✅ Exists in signup
2. **Role Selection** (required) - ✅ Exists in signup

*App cannot proceed without name + role — no default view exists*

**Screen 3+ (SKIPPABLE but Encouraged):**

**Philosophy/Welcome Screens:** (⚠️ Needs implementation)
- Introduce Gurudevi's vision
- Explain five sections (Self, Classroom, Community, Library, Profile)
- Share ecological thinking
- "This is not surveillance, this is support"
- Beautiful, calm, inspiring

**Profile Completion Screens:** (⚠️ Needs implementation)
- School/Institution (optional)
- Grade (students) / Subjects taught (teachers) / Department (optional)
- Profile photo (optional)
- Bio/introduction (optional)

**Design:**
- One question or concept per screen
- Progress indicator visible
- "Skip" button always present (except screens 1-2)
- Profile completion percentage shown in Profile section (⚠️ Needs implementation)

---

### 2.4 Invitation System

**Current Status:** ✅ STRONG FOUNDATION, ⚠️ Needs Alpha limits

**QR-Based Invitations:** ✅ IMPLEMENTED
- Each user can generate QR codes to invite others
- QR code includes invitation code
- Auto-generated contextual text (⚠️ Needs implementation: e.g., "Join Royal College teachers on Gurudevi")
- Institutional context (school name)

**Invitation Limits (Alpha):** ⚠️ NEEDS IMPLEMENTATION
- Principals can invite max 3 teachers (needs limit enforcement)
- Teachers cannot invite in Alpha (needs disable)

**Traceability:** ✅ IMPLEMENTED
- Full genealogy tracking (who invited whom)
- Creates community accountability and relational mapping

**Auto-Generated QR Text:** ⚠️ NEEDS IMPLEMENTATION
- Like Instagram/Threads bio
- Personalizes per school/institution
- Example: "Join [School Name] teachers on Gurudevi"

---

### 2.5 Price Tiers & Thuthimal Framework

**Current Status:** ❌ NOT IMPLEMENTED

**Tiers:**
- **Free:** Basic access
- **Pro:** Full feature access

**Thuthimal (Alpha Implementation):**

**In-App:** ⚠️ NEEDS IMPLEMENTATION
- Account has `is_thuthimal: boolean` flag (needs database field)
- Account has `thuthimal_gifter: string` (name or "anonymous") (needs database field)
- Profile/Self section shows Thuthimal badge if true (needs UI)
- Display: "Your Pro subscription is a gift of gratitude (තුතිමල්) from [name]" (needs UI)

**Outside App (Manual for Alpha):** ⚠️ NEEDS CREATION
- Simple webpage: "Gift Gurudevi Pro to a Teacher"
- Collect: teacher email/phone, gifter's name, message (optional)
- Admin manually flags teacher's account as `is_thuthimal: true` + `pro: true`

**Beta Implementation:**
- Payment gateway integration
- Automated gifting flow
- Gift history/tracking
- In-app gifting interface

---

### 2.6 Student Profile Management (Teacher View)

**Current Status:** ✅ INDIVIDUAL CREATION, ⚠️ Needs bulk creation

**Bulk Student Creation:** ⚠️ NEEDS IMPLEMENTATION
1. Teacher creates/selects class
2. Input total number of students
3. For each student profile:
   - **Name** (required)
   - **Index number** (required)
   - **Notes** (optional, ongoing)

**Individual Student Creation:** ✅ IMPLEMENTED
- Teacher can add students one by one
- Same fields: Name, Index, Notes

**Notes on Students:** ✅ PARTIALLY IMPLEMENTED
- Private to teacher by default ✅
- **Shareable to:** ⚠️ NEEDS IMPLEMENTATION
  - Class context (visible to other teachers of same class? — TBD)
  - Library (becomes community knowledge, attributed or anonymous)
- Sharing is explicit, consent-based

**Student Profile Linking (When Student Joins Later):** ⚠️ NEEDS IMPLEMENTATION
- Student creates their own account
- System detects match (by name, index, school context)
- Prompts: "Link to existing profile created by [Teacher Name]?"
- If student consents:
  - Teacher-created profile merges with student's actual profile
  - Profile data syncs
  - Notes become shareable with consent (student can view if teacher permits)

---

### 2.7 Student Attendance (Alpha Priority)

**Current Status:** ✅ STRONG IMPLEMENTATION

**Teacher Interface:** ✅ IMPLEMENTED
- Daily attendance marking per class
- List of students
- Mark: Present / Absent / Late / Excused
- Quick, simple interface

**Student View:** ✅ IMPLEMENTED
- Student can see their own attendance record
- Calendar view or list view
- Transparency

**Principal View (Aggregated):** ⚠️ NEEDS IMPLEMENTATION
- Overall attendance % for school
- Per-class aggregates
- Per-grade aggregates
- **NOT individual student names** (privacy-preserving)
- Pattern recognition: which classes/grades have attendance issues?

**Data Structure:** ✅ IMPLEMENTED
- Attendance records: date, student_id, class_id, status
- Aggregation queries for principal dashboard (needs API endpoints)

---

### 2.8 Photo Management & Sharing

**Current Status:** ⚠️ INFRASTRUCTURE EXISTS, Needs UI

**Classroom/Teaching Photos:** ⚠️ NEEDS IMPLEMENTATION
- Teacher uploads photos to Classroom section
- Photos of: teaching moments, classroom activities, student work (with consent)
- Stored in teacher's Classroom

**Sharing to Principal:** ⚠️ NEEDS IMPLEMENTATION
- **Optional:** Teacher can share photos to principal
- Interface: Checkbox "Share with principal" when uploading OR share after upload
- Principal sees shared photos in their view (aggregated or per-teacher)

**Privacy:**
- No automatic sharing
- Teacher controls what principal sees
- Student photos require consent (assumption: teacher has consent if uploading)

**Technical:** File storage exists via Supabase storage, needs upload UI and sharing flags

---

### 2.9 Principal Dashboard (Alpha)

**Current Status:** ⚠️ PARTIALLY IMPLEMENTED, Needs aggregation views

**What Principal Sees:**

**Aggregated Attendance:** ⚠️ NEEDS IMPLEMENTATION
- School-wide attendance %
- Per-class attendance trends
- Per-grade attendance patterns
- No individual student details unless explicitly shared

**Resources/Support Requests:** ⚠️ NEEDS IMPLEMENTATION
- **Simple Implementation (Alpha):**
  - Teacher profile has text field: "Support/Resources Needed"
  - Principal can view this in teacher list
  - No fancy request system — just visibility
- **Beta:** Full request/ticket system

**Classroom Photos (Shared):** ⚠️ NEEDS IMPLEMENTATION
- Photos that teachers opted to share
- Gallery or list view
- Organized by teacher or class

**Design Principle:**
- Principal sees institutional health patterns
- Not surveillance of individual teachers/students
- Feedback loop from classroom to administration

---

### 2.10 Self Section (Alpha)

**Current Status:** ✅ STRONG WELLBEING FEATURES, ⚠️ Needs daily content

**Daily Motivation:** ⚠️ NEEDS IMPLEMENTATION
- One motivational quote per day
- Changes daily
- Educational, inspirational, teacher-focused

**"Did You Know?":** ⚠️ NEEDS IMPLEMENTATION
- One random educational fact per day
- Changes daily
- Interesting, surprising, relevant to teaching/learning

**Personal Space:** ✅ IMPLEMENTED
- Private notes (Fire Journal ✅)
- Reflection prompts (Mood Lotus, Energy Forecast ✅)
- Gratitude, Joy moments, Wisdom seeds ✅

---

### 2.11 Notifications (Alpha)

**Current Status:** ⚠️ NEEDS IMPLEMENTATION

**In-App Notifications Only** (no push, no email for alpha)

**Triggers:**
1. Invitation received (QR scanned, account created via your invite)
2. Student profile linked (when student joins and connects to teacher-created profile)
3. Thuthimal gift received (someone sponsored your Pro account)
4. Profile completion reminder (optional, gentle nudge)
5. Daily motivation/fact available (optional)

**Interface:**
- Bell icon with badge count
- Notification list in app
- Mark as read/unread

---

### 2.12 Five Sections (Alpha Status)

| Section | Status | Notes |
|---------|--------|-------|
| **Self** | ✅ Functional | Wellbeing features strong, needs daily content |
| **Classroom** | ✅ Functional | Teacher/Student views strong, needs Principal aggregations |
| **Community** | ✅ Skeleton | Functional but needs content/users |
| **Library** | ✅ Skeleton | Functional but needs discovery UX |
| **Profile** | ✅ Functional | Needs Thuthimal badge, completion progress |

---

## 3. BETA REQUIREMENTS (Post-Alpha)

### 3.1 Teacher Attendance (Informal)

**Purpose:**
- Track teacher presence (not surveillance)
- Enable relief teacher assignment when someone is absent
- Pattern recognition for institutional health

**Implementation:**
- Teachers self-report: Present / Absent / On Leave
- Honor system
- OR Principal/Admin marks attendance

**Relief Assignment:**
- When teacher marks absent, system suggests relief teachers based on:
  - Subject compatibility
  - Free periods
  - Workload balance

---

### 3.2 Grading

**Current Status:** ✅ IMPLEMENTED (marks, GPA, feedback)

**Features:**
- Assignment grading ✅
- Exam grading ✅
- Grade entry and calculation ✅
- Grade visibility (students, parents, principal) ✅

**Beta Enhancements:**
- Report card generation
- Grade analytics and trends
- Parent access to grades

---

### 3.3 Lessons & Assignments

**Current Status:** ✅ IMPLEMENTED

**Lessons:** ✅
- Lesson planning
- Lesson notes
- Curriculum mapping
- Sharing to Library (⚠️ needs sharing mechanism)

**Assignments:** ✅
- Create assignments
- Distribute to students
- Collect submissions
- Grade and return

**Beta Enhancements:**
- Rich media in lessons (video, interactive)
- Assignment templates
- Rubric-based grading

---

### 3.4 Polls

**Quick Feedback:**
- Teacher creates poll for class
- Students respond
- Results visible to teacher
- Anonymous or attributed (teacher choice)

---

### 3.5 Reports & Letters

**Report Cards:**
- Generate progress reports
- Academic summaries
- Behavioral notes

**Letters:**
- Recommendation letters
- Parent communication
- Official correspondence

---

### 3.6 News & Circulars

**Current Status:** ✅ Announcements implemented

**School Announcements:**
- Principal publishes news/circulars ✅
- Visible to all teachers, students
- Role-based visibility (some for teachers only, some for all)

**Beta Enhancements:**
- Rich formatting
- File attachments
- Read receipts

---

### 3.7 Resource Management

**Materials:** ✅ IMPLEMENTED
- Upload teaching resources
- Categorize by subject, grade
- Share within school or to Library

**Inventory:** (Future)
- Track physical resources (books, equipment)
- Request resources from administration

---

### 3.8 Sharing (Internal & External)

**Internal Sharing:**
- Teacher → Teacher (resources, notes, strategies) ✅ Partially
- Teacher → Library (community knowledge) ⚠️ Needs mechanism
- Teacher → Principal (reports, photos, requests) ⚠️ Needs implementation

**External Sharing:**
- Export data
- Share to external platforms (TBD)

**Boundaries:**
- Student profiles: NOT shareable outside
- Student notes: Consent-based
- Resources: Open sharing encouraged
- Photos: Permission-based

---

### 3.9 Google Meet Integration

**Virtual Classes:**
- Schedule Google Meet from within app
- Link to class/lesson
- Attendance tracking for virtual sessions

---

### 3.10 Community & Library (Full Build-Out)

**Community:** ✅ Foundation exists
- Teacher discussion forums
- Peer support groups
- Challenge sharing
- Horizontal learning

**Library:** ✅ Foundation exists
- Curated teaching resources
- Global educator contributions
- Free-giving ethos
- Searchable, categorized

---

### 3.11 Payment Gateway (Thuthimal)

**Automated Gifting:**
- In-app interface to gift Pro subscriptions
- Payment processing (Stripe, PayPal, local gateways)
- Gift history and tracking
- Recipient notification

---

## 4. FUTURE FEATURES (Post-Beta)

### 4.1 AI Integration

**Potential Use Cases:**
- Grading assistance (auto-grade certain assignment types)
- Lesson planning support (generate lesson outlines)
- Report writing (draft progress reports)
- Administrative automation (schedule optimization)
- Personalized learning recommendations

**Philosophy:**
- AI as support, not replacement
- Teacher maintains agency and judgment
- Transparent about AI use

---

### 4.2 Advanced Analytics

**Institutional Insights:**
- Attendance patterns over time
- Grade trends
- Resource utilization
- Teacher workload distribution

**Individual Insights:**
- Student progress tracking
- Learning patterns
- Intervention triggers

---

### 4.3 Global Educator Network

**Free-Giving Platform:**
- Share resources globally
- Cross-school collaboration
- Language translation
- Cultural exchange

---

## 5. TECHNICAL SPECIFICATIONS

### 5.1 Data Models (Conceptual)

**User:**
```typescript
{
  id: uuid,
  email: string,
  password_hash: string,
  name: string,
  role: enum [teacher, principal, section_head, grade_head, student, personal],
  school: string (optional),
  grade: string (optional, for students),
  subjects: array (optional, for teachers),
  profile_completion: integer (0-100), // NEW
  is_pro: boolean, // NEW
  is_thuthimal: boolean, // NEW
  thuthimal_gifter: string (optional), // NEW
  invited_by: uuid (optional, foreign key to User),
  created_at: timestamp
}
```

**StudentProfile:**
```typescript
{
  id: uuid,
  teacher_id: uuid (foreign key to User),
  class_id: uuid,
  name: string,
  index_number: string,
  linked_student_id: uuid (optional, foreign key to User when student joins),
  notes: text,
  notes_shareable: boolean, // NEW
  notes_share_context: enum [class, library, none], // NEW
  created_at: timestamp
}
```

**Attendance:** ✅ EXISTS
```typescript
{
  id: uuid,
  student_id: uuid,
  class_id: uuid,
  date: date,
  status: enum [present, absent, late, excused],
  marked_by: uuid (teacher_id),
  created_at: timestamp
}
```

**Invitation:** ✅ EXISTS (as classroom_students.invite_code)
```typescript
{
  id: uuid,
  code: string (unique),
  created_by: uuid (inviter),
  used_by: uuid (optional, invitee),
  qr_code: string (base64 or URL),
  context_text: string (auto-generated), // NEW
  school: string (optional),
  max_uses: integer (default 1),
  used_count: integer,
  active: boolean,
  created_at: timestamp
}
```

**Photo:** // NEW
```typescript
{
  id: uuid,
  uploaded_by: uuid (teacher_id),
  class_id: uuid,
  file_url: string,
  caption: text (optional),
  shared_with_principal: boolean, // NEW
  created_at: timestamp
}
```

**Notification:** // NEW
```typescript
{
  id: uuid,
  user_id: uuid,
  type: enum [invitation, profile_linked, thuthimal_received, reminder],
  message: text,
  read: boolean,
  created_at: timestamp
}
```

**DailyContent:** // NEW (for motivation & did-you-know)
```typescript
{
  id: uuid,
  type: enum [motivation, did_you_know],
  content: text,
  author: string (optional),
  date: date (for scheduling),
  active: boolean,
  created_at: timestamp
}
```

---

### 5.2 Tech Stack (Current Implementation)

**Backend:**
- Framework: Supabase (PostgreSQL + Auth + Storage) ✅
- Authentication: Email/password + OAuth (Google) ✅
- Authorization: Row Level Security (RLS) ✅
- File Storage: Supabase Storage ✅

**Frontend:**
- Framework: React Native 0.81 ✅
- Platform: Expo SDK 54 ✅
- UI Library: GluestackUI ✅
- Navigation: React Navigation (Bottom tabs) ✅
- State Management: Zustand ✅
- Data Fetching: TanStack Query ✅

**Infrastructure:**
- Hosting: Supabase Cloud ✅
- Monitoring: (Needs: Sentry for error tracking)

---

### 5.3 QR Code Generation

**Library:** `expo-barcode-scanner` (already in use) ✅

**Format:**
```typescript
{
  invitation_code: "GURU-ABC123-TEACH",
  school: "Royal College",
  inviter_name: "Principal Smith"
}
```

**QR displays as URL:** `https://gurudevi.app/invite/GURU-ABC123-TEACH`

**Auto-generated text:** ⚠️ NEEDS IMPLEMENTATION
- "Join [School Name] teachers on Gurudevi — invited by [Inviter Name]"

---

### 5.4 Profile Linking Algorithm

**When student creates account:** ⚠️ NEEDS IMPLEMENTATION
1. Capture: name, school, grade
2. Query StudentProfile table for matches:
   - Same school
   - Same grade
   - Similar name (fuzzy matching or exact)
3. If match found, prompt student: "Is this you? Profile created by [Teacher Name]"
4. If student confirms:
   - Link: `StudentProfile.linked_student_id = student.id`
   - Sync data (name, index if student entered)
   - Enable consent-based note sharing

---

## 6. DESIGN PRINCIPLES (UI/UX)

### 6.1 Visual Design

**Aesthetic:**
- Calm, spacious, uncluttered (aligns with 02_DESIGN.md)
- Natural colors, soft gradients
- Teacher-focused (professional but warm)
- Avoid aggressive gamification visuals

**Typography:**
- Clear, readable fonts (aligns with existing "Sanctuary" theme)
- Good contrast
- Accessibility-first

**Icons:**
- Simple, intuitive
- Consistent style
- Role-specific where needed

---

### 6.2 Interaction Design

**Navigation:**
- Bottom tab bar (5 sections: Self, Classroom, Community, Library, Profile) ✅ CURRENT
- Persistent across app
- Section-specific sub-navigation as needed

**Progressive Disclosure:**
- Complexity in depth, not surface ✅ CURRENT PATTERN
- Empty states guide next action
- Contextual help, not tutorial hell

**Feedback:**
- Immediate feedback on actions (loading states, confirmations)
- Gentle notifications, not intrusive

**Skippability:**
- User can skip most onboarding flows ⚠️ NEEDS IMPLEMENTATION
- Profile completion encouraged but not forced ⚠️ NEEDS IMPLEMENTATION
- Exploration over instruction

---

### 6.3 Copy & Tone

**Voice:**
- Supportive, not commanding
- Respectful of teacher expertise
- Calm, not hype
- Clear, not jargon-heavy

**Examples:**
- ❌ "Complete your profile now!"
- ✅ "Add a few more details when you're ready"

- ❌ "You haven't logged attendance today"
- ✅ "Attendance for today is open"

---

## 7. OPEN QUESTIONS & DECISIONS NEEDED

### 7.1 Sharing Boundaries

**Question:** When teacher shares note to "Class," who sees it?
- Other teachers of the same class?
- Students in the class?
- Just stored in class context for future reference?

**Decision needed before Beta.**

---

### 7.2 Student Access (Alpha vs Beta)

**Question:** Are students given app access in Alpha or only Beta?

**Current assumption:** Students exist as profiles in Alpha (created by teachers) but don't have app access until Beta.

**Recommendation:** Students CAN access in Alpha (infrastructure exists), but marketing focuses on teachers/principals.

---

### 7.3 Payment for Thuthimal (Beta)

**Question:** What payment gateways?
- Stripe (international) - RECOMMENDED
- Local gateways (Sri Lanka-specific: Dialog eZ Cash, Sampath Vishwa)
- PayPal?

**Question:** Pricing for Pro tier?
- Monthly subscription?
- Annual?
- One-time gift amount?

**Decision needed before Beta.**

---

### 7.4 Multiple Roles Per User

**Question:** How to handle teachers who are also grade heads or principals?

**Options:**
1. Single role per account (current)
2. Multiple roles with role switcher
3. Unified view with expanding permissions (RECOMMENDED)

**Decision needed before Beta.**

---

## 8. SUCCESS METRICS (How to Measure Alpha Success)

### 8.1 Quantitative Metrics

**Adoption:**
- Number of principals who join
- Number of teachers invited
- Number of teachers who complete onboarding
- Active users (daily, weekly)

**Engagement:**
- Student profiles created
- Attendance marked (days per week)
- Photos uploaded
- Notes written
- Profile completion rate

**Retention:**
- Week 1 retention
- Week 2 retention
- Daily active users (DAU)

---

### 8.2 Qualitative Metrics

**Feedback:**
- Teacher testimonials
- Feature requests
- Pain points identified
- Emotional response (do they feel supported?)

**Health of Feedback Loops:**
- Are teachers sharing notes to Library?
- Are principals seeing aggregated data and responding?
- Are students (when they join) linking to profiles?

**Trust:**
- Do teachers feel safe using the app?
- Do they trust privacy commitments?
- Do they understand the philosophy?

---

## 9. ALPHA LAUNCH CHECKLIST

### Pre-Launch (Before Inviting Teachers)

**Authentication & Onboarding:**
- [x] Authentication working (email, password, Google OAuth)
- [ ] Onboarding flow complete (name, role, philosophy screens)
- [x] QR invitation system functional
- [ ] Profile completion progress displayed

**Classroom Features:**
- [x] Student profile creation (individual) working
- [ ] Student profile creation (bulk) working
- [x] Student notes feature working
- [x] Student attendance marking working
- [ ] Principal aggregated attendance view working
- [ ] Photo upload + optional sharing to principal working

**Self Section:**
- [x] Wellbeing features (Mood, Journal, etc.) working
- [ ] Daily motivation & "Did you know?" in Self section

**Thuthimal:**
- [ ] Thuthimal badge display working (manual backend flagging)
- [ ] External webpage for gift collection

**System Features:**
- [ ] In-app notifications working
- [ ] Five sections visible (Self, Classroom functional; Community, Library as skeletons)
- [ ] Invitation limits enforced (principals max 3)
- [ ] Multiple role handling decided and implemented
- [x] Error handling and edge cases addressed
- [x] Mobile responsiveness tested
- [x] Privacy/security review (passwords hashed, data protected)

---

### Launch Day

- [ ] Deploy to production environment
- [ ] Generate QR codes for first principals
- [ ] Send personal invitations to known teachers
- [ ] Monitor for errors/crashes
- [ ] Be available for immediate support

---

### Post-Launch (First Week)

- [ ] Daily check-in with users
- [ ] Collect feedback (bugs, feature requests, confusion points)
- [ ] Monitor engagement metrics
- [ ] Fix critical bugs immediately
- [ ] Document learnings for Beta planning

---

## 10. LONG-TERM VISION

**Gurudevi is not just an app.**

It is:
- Educational infrastructure
- A living ecology support system
- A gratitude economy
- A commitment to non-surveillance, dignity-preserving technology

**Success looks like:**
- Teachers feel genuinely supported, not monitored
- Feedback loops are repaired (teacher ↔ student, teacher ↔ principal, teacher ↔ community)
- Complexity is managed without overwhelming users
- The ecology becomes self-sustaining (teachers contribute to Library, community thrives)
- Thuthimal creates a culture of honoring educators
- The platform scales without losing its soul

**Gurudevi respects requisite variety.**  
**Gurudevi listens.**  
**Gurudevi supports.**

---

## 11. IMPLEMENTATION PRIORITIES

### IMMEDIATE (Alpha - Week 1)
1. ⚠️ Bulk student creation UI
2. ⚠️ Thuthimal database fields + badge UI
3. ⚠️ Daily motivation + "Did you know?" content system
4. ⚠️ Profile completion progress tracker
5. ⚠️ Onboarding philosophy screens (skippable)

### URGENT (Alpha - Week 2)
6. ⚠️ Invitation limits (principal max 3)
7. ⚠️ Photo upload to classroom with principal sharing
8. ⚠️ Principal aggregated attendance dashboard
9. ⚠️ In-app notifications system
10. ⚠️ Auto-generated QR context text

### IMPORTANT (Beta - Month 2)
11. Student profile linking algorithm
12. Teacher note sharing to library
13. Polls feature
14. Report generation
15. Payment gateway for Thuthimal

### FUTURE (Beta+ - Month 3+)
16. Teacher attendance
17. Multiple roles per user
18. Advanced analytics
19. AI integration
20. Global educator network

---

## 12. DOCUMENTATION INTEGRATION

This document integrates with existing constellation:

**Updates needed to other docs:**
- 00_INDEX.md: Add reference to 11_COMPLETE_PRD
- 06_Domain_III.md: Add Thuthimal, Five-Section Architecture
- 10_ROADMAP.md: Integrate Alpha/Beta timelines
- 02_DESIGN.md: Add interaction design principles
- 03_TECH.md: Add new data models

**Philosophy alignment:**
- ✅ Education as Care Work (01_PHILOSOPHY) → operationalized as Thuthimal
- ✅ Ecological thinking → operationalized as Five-Section Architecture
- ✅ Privacy-first → no surveillance, consent-based sharing
- ✅ Beauty and purpose → calm, uncluttered interface

---

*"Education born from Love, built with Love"*

**Compiled by**: Neev + GitHub Copilot  
**Date**: February 8, 2026  
**Status**: Living Document  
**Next Review**: Post-Alpha Launch
