---
title: "Gurudevi Complete Product Requirements Document (Feb 2026 snapshot)"
status: "superseded"
created: 2026-02-11
updated: 2026-02-11
author: "Naveen"
scribe: "opencode"
tags: [apps, gurudevi-mobile, historical]
---

> **NOTE (2026-08-24):** point-in-time snapshot. Stack/version facts reflect its writing date (early 2026) and are NOT current â€” see apps/gurudevi-mobile/README.md for the live stack.

# Gurudevi — Complete Product Requirements Document
## 11 Complete PRD | The Comprehensive Vision & Implementation Guide

**Role in Constellation**: Complete product specification for Gurudevi application  
**Compiled from**: Exploration session - February 8, 2026  
**Status**: Living Document - Additive to existing work  
**Last Updated**: February 8, 2026

---

> **NOTE (2026-08-24):** point-in-time snapshot. Stack/version facts reflect its writing date (early 2026) and are NOT current â€” see apps/gurudevi-mobile/README.md for the live stack.

## IMPORTANT NOTE

This document is **complementary and additive** to all existing documentation in the edlove constellation. Nothing here invalidates or overwrites what has already been built. This PRD:

- Extends the philosophical foundation from 01_PHILOSOPHY
- Complements the technical specifications in 03_TECH
- Expands the Gurudevi vision in 06_Domain_III
- Provides detailed implementation roadmap for 10_ROADMAP

**Integration principle**: Where this document adds new concepts (Thuthimal, Five-Section Architecture), they enhance and deepen existing work. Where concepts overlap, both perspectives are valid and generative.

---

> **NOTE (2026-08-24):** point-in-time snapshot. Stack/version facts reflect its writing date (early 2026) and are NOT current â€” see apps/gurudevi-mobile/README.md for the live stack.

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

> **NOTE (2026-08-24):** point-in-time snapshot. Stack/version facts reflect its writing date (early 2026) and are NOT current â€” see apps/gurudevi-mobile/README.md for the live stack.

### 1.2 Thuthimal (Ã Â¶Â­Ã Â·â€Ã Â¶Â­Ã Â·â€™Ã Â¶Â¸Ã Â¶Â½Ã Â·Å ) Ã¢â‚¬â€ The Gratitude Economy

**NEW CONCEPT**: A unique feature that embeds gratitude and recognition into the platform's economic model.

**Concept**
- Sinhala: "Flower of Gratitude"
- Anyone can gift/donate Pro subscriptions to teachers
- Past students, old boys' associations, alumni can honor their teachers
- Recognizes teaching as sacred work deserving reciprocal care across time
- Not just a payment model Ã¢â‚¬â€ a gratitude economy embedded in the platform

**Visibility**
- Teachers with Thuthimal support see badge/indicator in their profile
- Recognition: "Your Pro subscription is a gift of gratitude (Ã Â¶Â­Ã Â·â€Ã Â¶Â­Ã Â·â€™Ã Â¶Â¸Ã Â¶Â½Ã Â·Å ) from [name/anonymous]"
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

> **NOTE (2026-08-24):** point-in-time snapshot. Stack/version facts reflect its writing date (early 2026) and are NOT current â€” see apps/gurudevi-mobile/README.md for the live stack.

### 1.3 Five-Section Architecture (Stable Ecological Zones)

**NEW ARCHITECTURAL PATTERN**: The platform has **five stable sections** that exist for all users. The *meaning* of each section adapts based on role, but the structure remains constant.

This replaces traditional navigation patterns with an ecological, role-adaptive structure.

#### 1Ã¯Â¸ÂÃ¢Æ’Â£ **Self Ã¢â‚¬â€ The Inner Ecology**

**Purpose:** Support the individual's inner world and personal practice

**What lives here:**
- Reflection and journaling (Ã¢Å“â€¦ Already implemented: Fire Journal, Wisdom Seeds)
- Personal notes and tasks (Ã¢Å“â€¦ Already implemented: Tomorrow's Prep)
- Private signals (mood, confidence, energy) (Ã¢Å“â€¦ Already implemented: Mood Lotus, Energy Forecast)
- Personal growth tracking (Ã¢Å“â€¦ Already implemented: Joy Jar, Gratitude Glimmers)
- Daily motivation quotes (Ã¢Å¡Â Ã¯Â¸Â Needs implementation)
- "Did you know?" educational facts (Ã¢Å¡Â Ã¯Â¸Â Needs implementation)

**Design principle:**
- Private, non-judgmental, non-comparative
- Nothing visible to others unless explicitly shared
- Always personal, regardless of role

**Current Status**: Ã¢Å“â€¦ Strong foundation exists, needs daily content features

---

> **NOTE (2026-08-24):** point-in-time snapshot. Stack/version facts reflect its writing date (early 2026) and are NOT current â€” see apps/gurudevi-mobile/README.md for the live stack.

#### 2Ã¯Â¸ÂÃ¢Æ’Â£ **Classroom Ã¢â‚¬â€ The Immediate Operational Ecology**

**Purpose:** Support the user's closest sphere of responsibility

**The meaning of "Classroom" adapts by role:**
- **Teacher** Ã¢â€ â€™ their class (Ã¢Å“â€¦ Implemented)
- **Student** Ã¢â€ â€™ their learning space (Ã¢Å“â€¦ Implemented)
- **Principal** Ã¢â€ â€™ their school (Ã¢Å¡Â Ã¯Â¸Â Partially implemented)
- **Section Head** Ã¢â€ â€™ their section/subject (Ã¢Å¡Â Ã¯Â¸Â Needs implementation)
- **Grade Head** Ã¢â€ â€™ their grade (Ã¢Å¡Â Ã¯Â¸Â Needs implementation)

**Core domains (max 4-5):**
- People (Ã¢Å“â€¦ Student profiles, enrollment)
- Practice (Ã¢Å“â€¦ Lessons, assignments)
- Resources (Ã¢Å“â€¦ Library materials, lesson attachments)
- Signals (Ã¢Å“â€¦ Attendance, mood logs)
- Coordination (Ã¢Å¡Â Ã¯Â¸Â Scheduling, announcements partially done)

**What lives here (role-dependent):**

*Already Implemented (Ã¢Å“â€¦):*
- Student profiles (individual creation)
- Student notes (private to teacher)
- Attendance (student attendance marking)
- Lessons and assignments
- Grading
- Classroom artifacts (through library system)

*Needs Implementation (Ã¢Å¡Â Ã¯Â¸Â):*
- Bulk student creation (input total number, create all at once)
- Student note sharing (to class context or library with consent)
- Photo uploads with principal sharing option
- Polls and quick feedback
- Reports and academic communication
- Section Head and Grade Head views

**Design principle:**
- Action-oriented, calm, role-appropriate
- Complexity exists inside, not on surface

**Current Status**: Ã¢Å“â€¦ Teacher and Student views strong, needs Principal/Head views

---

> **NOTE (2026-08-24):** point-in-time snapshot. Stack/version facts reflect its writing date (early 2026) and are NOT current â€” see apps/gurudevi-mobile/README.md for the live stack.

#### 3Ã¯Â¸ÂÃ¢Æ’Â£ **Community Ã¢â‚¬â€ The Relational Ecology**

**Purpose:** Enable peer connection and collective sense-making

**What lives here:**
- Teacher communities (Ã¢Å“â€¦ Groups implemented)
- Peer discussion spaces (Ã¢Å“â€¦ Posts implemented)
- Shared challenges and practices
- Horizontal feedback

**Design principle:**
- Reduce isolation, repair lateral feedback loops
- Not noise or competition

**Status:** Ã¢Å“â€¦ Beta (functional, needs critical mass and content)

---

> **NOTE (2026-08-24):** point-in-time snapshot. Stack/version facts reflect its writing date (early 2026) and are NOT current â€” see apps/gurudevi-mobile/README.md for the live stack.

#### 4Ã¯Â¸ÂÃ¢Æ’Â£ **Library Ã¢â‚¬â€ The Knowledge Ecology**

**Purpose:** Provide access to shared knowledge and collective memory

**What lives here:**
- Teaching and learning resources (Ã¢Å“â€¦ Library items implemented)
- Research and references (Ã¢Å“â€¦ Collections implemented)
- Global educator contributions
- Free-giving and shared materials
- Teacher-generated notes shared to community (Ã¢Å¡Â Ã¯Â¸Â Sharing mechanism needs work)

**Design principle:**
- Exploratory and non-linear
- Browsing and discovery encouraged

**Status:** Ã¢Å“â€¦ Beta (infrastructure exists, needs content seeding and discovery UX)

---

> **NOTE (2026-08-24):** point-in-time snapshot. Stack/version facts reflect its writing date (early 2026) and are NOT current â€” see apps/gurudevi-mobile/README.md for the live stack.

#### 5Ã¯Â¸ÂÃ¢Æ’Â£ **Profile Ã¢â‚¬â€ Identity & Boundaries**

**Purpose:** Manage identity, role, and system boundaries

**What lives here:**
- Role selection and permissions (Ã¢Å“â€¦ Implemented)
- Preferences and settings (Ã¢Å“â€¦ Implemented via user_preferences)
- About the app
- Pricing / donations (Ã¢Å¡Â Ã¯Â¸Â Needs UI)
- Thuthimal badge/status (Ã¢Å¡Â Ã¯Â¸Â Needs implementation)
- Onboarding and transitions (Ã¢Å“â€¦ Partially implemented)
- Profile completion progress (Ã¢Å¡Â Ã¯Â¸Â Needs implementation)

**Design principle:**
- Profile defines from where you see the system, not what you control

**Current Status:** Ã¢Å“â€¦ Core functionality exists, needs Thuthimal and completion tracking

---

> **NOTE (2026-08-24):** point-in-time snapshot. Stack/version facts reflect its writing date (early 2026) and are NOT current â€” see apps/gurudevi-mobile/README.md for the live stack.

### 1.4 Role-Based View System

**Before interacting with sections, users enter through a role-based view.**

**Available Roles:**
- Teacher (Ã¢Å“â€¦ Implemented)
- Student (Ã¢Å“â€¦ Implemented)
- Principal (Ã¢Å“â€¦ Implemented)
- Section Head (Ã¢Å¡Â Ã¯Â¸Â Needs implementation)
- Grade Head (Ã¢Å¡Â Ã¯Â¸Â Needs implementation)
- Personal User (non-institutional) (Ã¢Å¡Â Ã¯Â¸Â Needs consideration)

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

**Current Status:** Ã¢Å“â€¦ Single role per user implemented, Ã¢Å¡Â Ã¯Â¸Â multiple roles need architecture

---

> **NOTE (2026-08-24):** point-in-time snapshot. Stack/version facts reflect its writing date (early 2026) and are NOT current â€” see apps/gurudevi-mobile/README.md for the live stack.

## 2. ALPHA REQUIREMENTS (5-Day Build)

### 2.1 Release Strategy

**Version:** Alpha 0.1.0  
**Timeline:** 5 days from February 8, 2026  
**Distribution:** Invite-only, closed testing  
**Target users:** Principals Ã¢â€ â€™ Teachers (max 3 invites per principal initially)

---

> **NOTE (2026-08-24):** point-in-time snapshot. Stack/version facts reflect its writing date (early 2026) and are NOT current â€” see apps/gurudevi-mobile/README.md for the live stack.

### 2.2 Authentication & Signup

**Current Status:** Ã¢Å“â€¦ IMPLEMENTED

What exists:
- Email/password authentication Ã¢Å“â€¦
- Google OAuth ready Ã¢Å“â€¦
- Session management Ã¢Å“â€¦
- User profiles Ã¢Å“â€¦

**Needs refinement:**
- QR code auto-fill of invitation code (infrastructure exists, needs testing)
- Remove Apple Sign-In (or keep but deprioritize)

---

> **NOTE (2026-08-24):** point-in-time snapshot. Stack/version facts reflect its writing date (early 2026) and are NOT current â€” see apps/gurudevi-mobile/README.md for the live stack.

### 2.3 Onboarding Journey

**Current Status:** Ã¢Å¡Â Ã¯Â¸Â PARTIALLY IMPLEMENTED

**Screen 1-2 (MANDATORY Ã¢â‚¬â€ Cannot Skip):**
1. **Name** (required) - Ã¢Å“â€¦ Exists in signup
2. **Role Selection** (required) - Ã¢Å“â€¦ Exists in signup

*App cannot proceed without name + role Ã¢â‚¬â€ no default view exists*

**Screen 3+ (SKIPPABLE but Encouraged):**

**Philosophy/Welcome Screens:** (Ã¢Å¡Â Ã¯Â¸Â Needs implementation)
- Introduce Gurudevi's vision
- Explain five sections (Self, Classroom, Community, Library, Profile)
- Share ecological thinking
- "This is not surveillance, this is support"
- Beautiful, calm, inspiring

**Profile Completion Screens:** (Ã¢Å¡Â Ã¯Â¸Â Needs implementation)
- School/Institution (optional)
- Grade (students) / Subjects taught (teachers) / Department (optional)
- Profile photo (optional)
- Bio/introduction (optional)

**Design:**
- One question or concept per screen
- Progress indicator visible
- "Skip" button always present (except screens 1-2)
- Profile completion percentage shown in Profile section (Ã¢Å¡Â Ã¯Â¸Â Needs implementation)

---

> **NOTE (2026-08-24):** point-in-time snapshot. Stack/version facts reflect its writing date (early 2026) and are NOT current â€” see apps/gurudevi-mobile/README.md for the live stack.

### 2.4 Invitation System

**Current Status:** Ã¢Å“â€¦ STRONG FOUNDATION, Ã¢Å¡Â Ã¯Â¸Â Needs Alpha limits

**QR-Based Invitations:** Ã¢Å“â€¦ IMPLEMENTED
- Each user can generate QR codes to invite others
- QR code includes invitation code
- Auto-generated contextual text (Ã¢Å¡Â Ã¯Â¸Â Needs implementation: e.g., "Join Royal College teachers on Gurudevi")
- Institutional context (school name)

**Invitation Limits (Alpha):** Ã¢Å¡Â Ã¯Â¸Â NEEDS IMPLEMENTATION
- Principals can invite max 3 teachers (needs limit enforcement)
- Teachers cannot invite in Alpha (needs disable)

**Traceability:** Ã¢Å“â€¦ IMPLEMENTED
- Full genealogy tracking (who invited whom)
- Creates community accountability and relational mapping

**Auto-Generated QR Text:** Ã¢Å¡Â Ã¯Â¸Â NEEDS IMPLEMENTATION
- Like Instagram/Threads bio
- Personalizes per school/institution
- Example: "Join [School Name] teachers on Gurudevi"

---

> **NOTE (2026-08-24):** point-in-time snapshot. Stack/version facts reflect its writing date (early 2026) and are NOT current â€” see apps/gurudevi-mobile/README.md for the live stack.

### 2.5 Price Tiers & Thuthimal Framework

**Current Status:** Ã¢ÂÅ’ NOT IMPLEMENTED

**Tiers:**
- **Free:** Basic access
- **Pro:** Full feature access

**Thuthimal (Alpha Implementation):**

**In-App:** Ã¢Å¡Â Ã¯Â¸Â NEEDS IMPLEMENTATION
- Account has `is_thuthimal: boolean` flag (needs database field)
- Account has `thuthimal_gifter: string` (name or "anonymous") (needs database field)
- Profile/Self section shows Thuthimal badge if true (needs UI)
- Display: "Your Pro subscription is a gift of gratitude (Ã Â¶Â­Ã Â·â€Ã Â¶Â­Ã Â·â€™Ã Â¶Â¸Ã Â¶Â½Ã Â·Å ) from [name]" (needs UI)

**Outside App (Manual for Alpha):** Ã¢Å¡Â Ã¯Â¸Â NEEDS CREATION
- Simple webpage: "Gift Gurudevi Pro to a Teacher"
- Collect: teacher email/phone, gifter's name, message (optional)
- Admin manually flags teacher's account as `is_thuthimal: true` + `pro: true`

**Beta Implementation:**
- Payment gateway integration
- Automated gifting flow
- Gift history/tracking
- In-app gifting interface

---

> **NOTE (2026-08-24):** point-in-time snapshot. Stack/version facts reflect its writing date (early 2026) and are NOT current â€” see apps/gurudevi-mobile/README.md for the live stack.

### 2.6 Student Profile Management (Teacher View)

**Current Status:** Ã¢Å“â€¦ INDIVIDUAL CREATION, Ã¢Å¡Â Ã¯Â¸Â Needs bulk creation

**Bulk Student Creation:** Ã¢Å¡Â Ã¯Â¸Â NEEDS IMPLEMENTATION
1. Teacher creates/selects class
2. Input total number of students
3. For each student profile:
   - **Name** (required)
   - **Index number** (required)
   - **Notes** (optional, ongoing)

**Individual Student Creation:** Ã¢Å“â€¦ IMPLEMENTED
- Teacher can add students one by one
- Same fields: Name, Index, Notes

**Notes on Students:** Ã¢Å“â€¦ PARTIALLY IMPLEMENTED
- Private to teacher by default Ã¢Å“â€¦
- **Shareable to:** Ã¢Å¡Â Ã¯Â¸Â NEEDS IMPLEMENTATION
  - Class context (visible to other teachers of same class? Ã¢â‚¬â€ TBD)
  - Library (becomes community knowledge, attributed or anonymous)
- Sharing is explicit, consent-based

**Student Profile Linking (When Student Joins Later):** Ã¢Å¡Â Ã¯Â¸Â NEEDS IMPLEMENTATION
- Student creates their own account
- System detects match (by name, index, school context)
- Prompts: "Link to existing profile created by [Teacher Name]?"
- If student consents:
  - Teacher-created profile merges with student's actual profile
  - Profile data syncs
  - Notes become shareable with consent (student can view if teacher permits)

---

> **NOTE (2026-08-24):** point-in-time snapshot. Stack/version facts reflect its writing date (early 2026) and are NOT current â€” see apps/gurudevi-mobile/README.md for the live stack.

### 2.7 Student Attendance (Alpha Priority)

**Current Status:** Ã¢Å“â€¦ STRONG IMPLEMENTATION

**Teacher Interface:** Ã¢Å“â€¦ IMPLEMENTED
- Daily attendance marking per class
- List of students
- Mark: Present / Absent / Late / Excused
- Quick, simple interface

**Student View:** Ã¢Å“â€¦ IMPLEMENTED
- Student can see their own attendance record
- Calendar view or list view
- Transparency

**Principal View (Aggregated):** Ã¢Å¡Â Ã¯Â¸Â NEEDS IMPLEMENTATION
- Overall attendance % for school
- Per-class aggregates
- Per-grade aggregates
- **NOT individual student names** (privacy-preserving)
- Pattern recognition: which classes/grades have attendance issues?

**Data Structure:** Ã¢Å“â€¦ IMPLEMENTED
- Attendance records: date, student_id, class_id, status
- Aggregation queries for principal dashboard (needs API endpoints)

---

> **NOTE (2026-08-24):** point-in-time snapshot. Stack/version facts reflect its writing date (early 2026) and are NOT current â€” see apps/gurudevi-mobile/README.md for the live stack.

### 2.8 Photo Management & Sharing

**Current Status:** Ã¢Å¡Â Ã¯Â¸Â INFRASTRUCTURE EXISTS, Needs UI

**Classroom/Teaching Photos:** Ã¢Å¡Â Ã¯Â¸Â NEEDS IMPLEMENTATION
- Teacher uploads photos to Classroom section
- Photos of: teaching moments, classroom activities, student work (with consent)
- Stored in teacher's Classroom

**Sharing to Principal:** Ã¢Å¡Â Ã¯Â¸Â NEEDS IMPLEMENTATION
- **Optional:** Teacher can share photos to principal
- Interface: Checkbox "Share with principal" when uploading OR share after upload
- Principal sees shared photos in their view (aggregated or per-teacher)

**Privacy:**
- No automatic sharing
- Teacher controls what principal sees
- Student photos require consent (assumption: teacher has consent if uploading)

**Technical:** File storage exists via Supabase storage, needs upload UI and sharing flags

---

> **NOTE (2026-08-24):** point-in-time snapshot. Stack/version facts reflect its writing date (early 2026) and are NOT current â€” see apps/gurudevi-mobile/README.md for the live stack.

### 2.9 Principal Dashboard (Alpha)

**Current Status:** Ã¢Å¡Â Ã¯Â¸Â PARTIALLY IMPLEMENTED, Needs aggregation views

**What Principal Sees:**

**Aggregated Attendance:** Ã¢Å¡Â Ã¯Â¸Â NEEDS IMPLEMENTATION
- School-wide attendance %
- Per-class attendance trends
- Per-grade attendance patterns
- No individual student details unless explicitly shared

**Resources/Support Requests:** Ã¢Å¡Â Ã¯Â¸Â NEEDS IMPLEMENTATION
- **Simple Implementation (Alpha):**
  - Teacher profile has text field: "Support/Resources Needed"
  - Principal can view this in teacher list
  - No fancy request system Ã¢â‚¬â€ just visibility
- **Beta:** Full request/ticket system

**Classroom Photos (Shared):** Ã¢Å¡Â Ã¯Â¸Â NEEDS IMPLEMENTATION
- Photos that teachers opted to share
- Gallery or list view
- Organized by teacher or class

**Design Principle:**
- Principal sees institutional health patterns
- Not surveillance of individual teachers/students
- Feedback loop from classroom to administration

---

> **NOTE (2026-08-24):** point-in-time snapshot. Stack/version facts reflect its writing date (early 2026) and are NOT current â€” see apps/gurudevi-mobile/README.md for the live stack.

### 2.10 Self Section (Alpha)

**Current Status:** Ã¢Å“â€¦ STRONG WELLBEING FEATURES, Ã¢Å¡Â Ã¯Â¸Â Needs daily content

**Daily Motivation:** Ã¢Å¡Â Ã¯Â¸Â NEEDS IMPLEMENTATION
- One motivational quote per day
- Changes daily
- Educational, inspirational, teacher-focused

**"Did You Know?":** Ã¢Å¡Â Ã¯Â¸Â NEEDS IMPLEMENTATION
- One random educational fact per day
- Changes daily
- Interesting, surprising, relevant to teaching/learning

**Personal Space:** Ã¢Å“â€¦ IMPLEMENTED
- Private notes (Fire Journal Ã¢Å“â€¦)
- Reflection prompts (Mood Lotus, Energy Forecast Ã¢Å“â€¦)
- Gratitude, Joy moments, Wisdom seeds Ã¢Å“â€¦

---

> **NOTE (2026-08-24):** point-in-time snapshot. Stack/version facts reflect its writing date (early 2026) and are NOT current â€” see apps/gurudevi-mobile/README.md for the live stack.

### 2.11 Notifications (Alpha)

**Current Status:** Ã¢Å¡Â Ã¯Â¸Â NEEDS IMPLEMENTATION

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

> **NOTE (2026-08-24):** point-in-time snapshot. Stack/version facts reflect its writing date (early 2026) and are NOT current â€” see apps/gurudevi-mobile/README.md for the live stack.

### 2.12 Five Sections (Alpha Status)

| Section | Status | Notes |
|---------|--------|-------|
| **Self** | Ã¢Å“â€¦ Functional | Wellbeing features strong, needs daily content |
| **Classroom** | Ã¢Å“â€¦ Functional | Teacher/Student views strong, needs Principal aggregations |
| **Community** | Ã¢Å“â€¦ Skeleton | Functional but needs content/users |
| **Library** | Ã¢Å“â€¦ Skeleton | Functional but needs discovery UX |
| **Profile** | Ã¢Å“â€¦ Functional | Needs Thuthimal badge, completion progress |

---

> **NOTE (2026-08-24):** point-in-time snapshot. Stack/version facts reflect its writing date (early 2026) and are NOT current â€” see apps/gurudevi-mobile/README.md for the live stack.

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

> **NOTE (2026-08-24):** point-in-time snapshot. Stack/version facts reflect its writing date (early 2026) and are NOT current â€” see apps/gurudevi-mobile/README.md for the live stack.

### 3.2 Grading

**Current Status:** Ã¢Å“â€¦ IMPLEMENTED (marks, GPA, feedback)

**Features:**
- Assignment grading Ã¢Å“â€¦
- Exam grading Ã¢Å“â€¦
- Grade entry and calculation Ã¢Å“â€¦
- Grade visibility (students, parents, principal) Ã¢Å“â€¦

**Beta Enhancements:**
- Report card generation
- Grade analytics and trends
- Parent access to grades

---

> **NOTE (2026-08-24):** point-in-time snapshot. Stack/version facts reflect its writing date (early 2026) and are NOT current â€” see apps/gurudevi-mobile/README.md for the live stack.

### 3.3 Lessons & Assignments

**Current Status:** Ã¢Å“â€¦ IMPLEMENTED

**Lessons:** Ã¢Å“â€¦
- Lesson planning
- Lesson notes
- Curriculum mapping
- Sharing to Library (Ã¢Å¡Â Ã¯Â¸Â needs sharing mechanism)

**Assignments:** Ã¢Å“â€¦
- Create assignments
- Distribute to students
- Collect submissions
- Grade and return

**Beta Enhancements:**
- Rich media in lessons (video, interactive)
- Assignment templates
- Rubric-based grading

---

> **NOTE (2026-08-24):** point-in-time snapshot. Stack/version facts reflect its writing date (early 2026) and are NOT current â€” see apps/gurudevi-mobile/README.md for the live stack.

### 3.4 Polls

**Quick Feedback:**
- Teacher creates poll for class
- Students respond
- Results visible to teacher
- Anonymous or attributed (teacher choice)

---

> **NOTE (2026-08-24):** point-in-time snapshot. Stack/version facts reflect its writing date (early 2026) and are NOT current â€” see apps/gurudevi-mobile/README.md for the live stack.

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

> **NOTE (2026-08-24):** point-in-time snapshot. Stack/version facts reflect its writing date (early 2026) and are NOT current â€” see apps/gurudevi-mobile/README.md for the live stack.

### 3.6 News & Circulars

**Current Status:** Ã¢Å“â€¦ Announcements implemented

**School Announcements:**
- Principal publishes news/circulars Ã¢Å“â€¦
- Visible to all teachers, students
- Role-based visibility (some for teachers only, some for all)

**Beta Enhancements:**
- Rich formatting
- File attachments
- Read receipts

---

> **NOTE (2026-08-24):** point-in-time snapshot. Stack/version facts reflect its writing date (early 2026) and are NOT current â€” see apps/gurudevi-mobile/README.md for the live stack.

### 3.7 Resource Management

**Materials:** Ã¢Å“â€¦ IMPLEMENTED
- Upload teaching resources
- Categorize by subject, grade
- Share within school or to Library

**Inventory:** (Future)
- Track physical resources (books, equipment)
- Request resources from administration

---

> **NOTE (2026-08-24):** point-in-time snapshot. Stack/version facts reflect its writing date (early 2026) and are NOT current â€” see apps/gurudevi-mobile/README.md for the live stack.

### 3.8 Sharing (Internal & External)

**Internal Sharing:**
- Teacher Ã¢â€ â€™ Teacher (resources, notes, strategies) Ã¢Å“â€¦ Partially
- Teacher Ã¢â€ â€™ Library (community knowledge) Ã¢Å¡Â Ã¯Â¸Â Needs mechanism
- Teacher Ã¢â€ â€™ Principal (reports, photos, requests) Ã¢Å¡Â Ã¯Â¸Â Needs implementation

**External Sharing:**
- Export data
- Share to external platforms (TBD)

**Boundaries:**
- Student profiles: NOT shareable outside
- Student notes: Consent-based
- Resources: Open sharing encouraged
- Photos: Permission-based

---

> **NOTE (2026-08-24):** point-in-time snapshot. Stack/version facts reflect its writing date (early 2026) and are NOT current â€” see apps/gurudevi-mobile/README.md for the live stack.

### 3.9 Google Meet Integration

**Virtual Classes:**
- Schedule Google Meet from within app
- Link to class/lesson
- Attendance tracking for virtual sessions

---

> **NOTE (2026-08-24):** point-in-time snapshot. Stack/version facts reflect its writing date (early 2026) and are NOT current â€” see apps/gurudevi-mobile/README.md for the live stack.

### 3.10 Community & Library (Full Build-Out)

**Community:** Ã¢Å“â€¦ Foundation exists
- Teacher discussion forums
- Peer support groups
- Challenge sharing
- Horizontal learning

**Library:** Ã¢Å“â€¦ Foundation exists
- Curated teaching resources
- Global educator contributions
- Free-giving ethos
- Searchable, categorized

---

> **NOTE (2026-08-24):** point-in-time snapshot. Stack/version facts reflect its writing date (early 2026) and are NOT current â€” see apps/gurudevi-mobile/README.md for the live stack.

### 3.11 Payment Gateway (Thuthimal)

**Automated Gifting:**
- In-app interface to gift Pro subscriptions
- Payment processing (Stripe, PayPal, local gateways)
- Gift history and tracking
- Recipient notification

---

> **NOTE (2026-08-24):** point-in-time snapshot. Stack/version facts reflect its writing date (early 2026) and are NOT current â€” see apps/gurudevi-mobile/README.md for the live stack.

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

> **NOTE (2026-08-24):** point-in-time snapshot. Stack/version facts reflect its writing date (early 2026) and are NOT current â€” see apps/gurudevi-mobile/README.md for the live stack.

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

> **NOTE (2026-08-24):** point-in-time snapshot. Stack/version facts reflect its writing date (early 2026) and are NOT current â€” see apps/gurudevi-mobile/README.md for the live stack.

### 4.3 Global Educator Network

**Free-Giving Platform:**
- Share resources globally
- Cross-school collaboration
- Language translation
- Cultural exchange

---

> **NOTE (2026-08-24):** point-in-time snapshot. Stack/version facts reflect its writing date (early 2026) and are NOT current â€” see apps/gurudevi-mobile/README.md for the live stack.

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

**Attendance:** Ã¢Å“â€¦ EXISTS
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

**Invitation:** Ã¢Å“â€¦ EXISTS (as classroom_students.invite_code)
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

> **NOTE (2026-08-24):** point-in-time snapshot. Stack/version facts reflect its writing date (early 2026) and are NOT current â€” see apps/gurudevi-mobile/README.md for the live stack.

### 5.2 Tech Stack (Current Implementation)

**Backend:**
- Framework: Supabase (PostgreSQL + Auth + Storage) Ã¢Å“â€¦
- Authentication: Email/password + OAuth (Google) Ã¢Å“â€¦
- Authorization: Row Level Security (RLS) Ã¢Å“â€¦
- File Storage: Supabase Storage Ã¢Å“â€¦

**Frontend:**
- Framework: React Native 0.81 Ã¢Å“â€¦
- Platform: Expo SDK 54 Ã¢Å“â€¦
- UI Library: GluestackUI Ã¢Å“â€¦
- Navigation: React Navigation (Bottom tabs) Ã¢Å“â€¦
- State Management: Zustand Ã¢Å“â€¦
- Data Fetching: TanStack Query Ã¢Å“â€¦

**Infrastructure:**
- Hosting: Supabase Cloud Ã¢Å“â€¦
- Monitoring: (Needs: Sentry for error tracking)

---

> **NOTE (2026-08-24):** point-in-time snapshot. Stack/version facts reflect its writing date (early 2026) and are NOT current â€” see apps/gurudevi-mobile/README.md for the live stack.

### 5.3 QR Code Generation

**Library:** `expo-barcode-scanner` (already in use) Ã¢Å“â€¦

**Format:**
```typescript
{
  invitation_code: "GURU-ABC123-TEACH",
  school: "Royal College",
  inviter_name: "Principal Smith"
}
```

**QR displays as URL:** `https://gurudevi.app/invite/GURU-ABC123-TEACH`

**Auto-generated text:** Ã¢Å¡Â Ã¯Â¸Â NEEDS IMPLEMENTATION
- "Join [School Name] teachers on Gurudevi Ã¢â‚¬â€ invited by [Inviter Name]"

---

> **NOTE (2026-08-24):** point-in-time snapshot. Stack/version facts reflect its writing date (early 2026) and are NOT current â€” see apps/gurudevi-mobile/README.md for the live stack.

### 5.4 Profile Linking Algorithm

**When student creates account:** Ã¢Å¡Â Ã¯Â¸Â NEEDS IMPLEMENTATION
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

> **NOTE (2026-08-24):** point-in-time snapshot. Stack/version facts reflect its writing date (early 2026) and are NOT current â€” see apps/gurudevi-mobile/README.md for the live stack.

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

> **NOTE (2026-08-24):** point-in-time snapshot. Stack/version facts reflect its writing date (early 2026) and are NOT current â€” see apps/gurudevi-mobile/README.md for the live stack.

### 6.2 Interaction Design

**Navigation:**
- Bottom tab bar (5 sections: Self, Classroom, Community, Library, Profile) Ã¢Å“â€¦ CURRENT
- Persistent across app
- Section-specific sub-navigation as needed

**Progressive Disclosure:**
- Complexity in depth, not surface Ã¢Å“â€¦ CURRENT PATTERN
- Empty states guide next action
- Contextual help, not tutorial hell

**Feedback:**
- Immediate feedback on actions (loading states, confirmations)
- Gentle notifications, not intrusive

**Skippability:**
- User can skip most onboarding flows Ã¢Å¡Â Ã¯Â¸Â NEEDS IMPLEMENTATION
- Profile completion encouraged but not forced Ã¢Å¡Â Ã¯Â¸Â NEEDS IMPLEMENTATION
- Exploration over instruction

---

> **NOTE (2026-08-24):** point-in-time snapshot. Stack/version facts reflect its writing date (early 2026) and are NOT current â€” see apps/gurudevi-mobile/README.md for the live stack.

### 6.3 Copy & Tone

**Voice:**
- Supportive, not commanding
- Respectful of teacher expertise
- Calm, not hype
- Clear, not jargon-heavy

**Examples:**
- Ã¢ÂÅ’ "Complete your profile now!"
- Ã¢Å“â€¦ "Add a few more details when you're ready"

- Ã¢ÂÅ’ "You haven't logged attendance today"
- Ã¢Å“â€¦ "Attendance for today is open"

---

> **NOTE (2026-08-24):** point-in-time snapshot. Stack/version facts reflect its writing date (early 2026) and are NOT current â€” see apps/gurudevi-mobile/README.md for the live stack.

## 7. OPEN QUESTIONS & DECISIONS NEEDED

### 7.1 Sharing Boundaries

**Question:** When teacher shares note to "Class," who sees it?
- Other teachers of the same class?
- Students in the class?
- Just stored in class context for future reference?

**Decision needed before Beta.**

---

> **NOTE (2026-08-24):** point-in-time snapshot. Stack/version facts reflect its writing date (early 2026) and are NOT current â€” see apps/gurudevi-mobile/README.md for the live stack.

### 7.2 Student Access (Alpha vs Beta)

**Question:** Are students given app access in Alpha or only Beta?

**Current assumption:** Students exist as profiles in Alpha (created by teachers) but don't have app access until Beta.

**Recommendation:** Students CAN access in Alpha (infrastructure exists), but marketing focuses on teachers/principals.

---

> **NOTE (2026-08-24):** point-in-time snapshot. Stack/version facts reflect its writing date (early 2026) and are NOT current â€” see apps/gurudevi-mobile/README.md for the live stack.

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

> **NOTE (2026-08-24):** point-in-time snapshot. Stack/version facts reflect its writing date (early 2026) and are NOT current â€” see apps/gurudevi-mobile/README.md for the live stack.

### 7.4 Multiple Roles Per User

**Question:** How to handle teachers who are also grade heads or principals?

**Options:**
1. Single role per account (current)
2. Multiple roles with role switcher
3. Unified view with expanding permissions (RECOMMENDED)

**Decision needed before Beta.**

---

> **NOTE (2026-08-24):** point-in-time snapshot. Stack/version facts reflect its writing date (early 2026) and are NOT current â€” see apps/gurudevi-mobile/README.md for the live stack.

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

> **NOTE (2026-08-24):** point-in-time snapshot. Stack/version facts reflect its writing date (early 2026) and are NOT current â€” see apps/gurudevi-mobile/README.md for the live stack.

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

> **NOTE (2026-08-24):** point-in-time snapshot. Stack/version facts reflect its writing date (early 2026) and are NOT current â€” see apps/gurudevi-mobile/README.md for the live stack.

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

> **NOTE (2026-08-24):** point-in-time snapshot. Stack/version facts reflect its writing date (early 2026) and are NOT current â€” see apps/gurudevi-mobile/README.md for the live stack.

### Launch Day

- [ ] Deploy to production environment
- [ ] Generate QR codes for first principals
- [ ] Send personal invitations to known teachers
- [ ] Monitor for errors/crashes
- [ ] Be available for immediate support

---

> **NOTE (2026-08-24):** point-in-time snapshot. Stack/version facts reflect its writing date (early 2026) and are NOT current â€” see apps/gurudevi-mobile/README.md for the live stack.

### Post-Launch (First Week)

- [ ] Daily check-in with users
- [ ] Collect feedback (bugs, feature requests, confusion points)
- [ ] Monitor engagement metrics
- [ ] Fix critical bugs immediately
- [ ] Document learnings for Beta planning

---

> **NOTE (2026-08-24):** point-in-time snapshot. Stack/version facts reflect its writing date (early 2026) and are NOT current â€” see apps/gurudevi-mobile/README.md for the live stack.

## 10. LONG-TERM VISION

**Gurudevi is not just an app.**

It is:
- Educational infrastructure
- A living ecology support system
- A gratitude economy
- A commitment to non-surveillance, dignity-preserving technology

**Success looks like:**
- Teachers feel genuinely supported, not monitored
- Feedback loops are repaired (teacher Ã¢â€ â€ student, teacher Ã¢â€ â€ principal, teacher Ã¢â€ â€ community)
- Complexity is managed without overwhelming users
- The ecology becomes self-sustaining (teachers contribute to Library, community thrives)
- Thuthimal creates a culture of honoring educators
- The platform scales without losing its soul

**Gurudevi respects requisite variety.**  
**Gurudevi listens.**  
**Gurudevi supports.**

---

> **NOTE (2026-08-24):** point-in-time snapshot. Stack/version facts reflect its writing date (early 2026) and are NOT current â€” see apps/gurudevi-mobile/README.md for the live stack.

## 11. IMPLEMENTATION PRIORITIES

### IMMEDIATE (Alpha - Week 1)
1. Ã¢Å¡Â Ã¯Â¸Â Bulk student creation UI
2. Ã¢Å¡Â Ã¯Â¸Â Thuthimal database fields + badge UI
3. Ã¢Å¡Â Ã¯Â¸Â Daily motivation + "Did you know?" content system
4. Ã¢Å¡Â Ã¯Â¸Â Profile completion progress tracker
5. Ã¢Å¡Â Ã¯Â¸Â Onboarding philosophy screens (skippable)

### URGENT (Alpha - Week 2)
6. Ã¢Å¡Â Ã¯Â¸Â Invitation limits (principal max 3)
7. Ã¢Å¡Â Ã¯Â¸Â Photo upload to classroom with principal sharing
8. Ã¢Å¡Â Ã¯Â¸Â Principal aggregated attendance dashboard
9. Ã¢Å¡Â Ã¯Â¸Â In-app notifications system
10. Ã¢Å¡Â Ã¯Â¸Â Auto-generated QR context text

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

> **NOTE (2026-08-24):** point-in-time snapshot. Stack/version facts reflect its writing date (early 2026) and are NOT current â€” see apps/gurudevi-mobile/README.md for the live stack.

## 12. DOCUMENTATION INTEGRATION

This document integrates with existing constellation:

**Updates needed to other docs:**
- 00_INDEX.md: Add reference to 11_COMPLETE_PRD
- 06_Domain_III.md: Add Thuthimal, Five-Section Architecture
- 10_ROADMAP.md: Integrate Alpha/Beta timelines
- 02_DESIGN.md: Add interaction design principles
- 03_TECH.md: Add new data models

**Philosophy alignment:**
- Ã¢Å“â€¦ Education as Care Work (01_PHILOSOPHY) Ã¢â€ â€™ operationalized as Thuthimal
- Ã¢Å“â€¦ Ecological thinking Ã¢â€ â€™ operationalized as Five-Section Architecture
- Ã¢Å“â€¦ Privacy-first Ã¢â€ â€™ no surveillance, consent-based sharing
- Ã¢Å“â€¦ Beauty and purpose Ã¢â€ â€™ calm, uncluttered interface

---

*"Education born from Love, built with Love"*

**Compiled by**: Neev + GitHub Copilot  
**Date**: February 8, 2026  
**Status**: Living Document  
**Next Review**: Post-Alpha Launch
