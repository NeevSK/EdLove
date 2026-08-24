---
title: "Gurudevi â€” Space Specifications"
status: "active"
created: 2026-02-27
updated: 2026-02-27
author: "Naveen"
scribe: "opencode"
tags: [apps, gurudevi-mobile]
---

# Gurudevi — Space Specifications
### Five Clearings in One Living Forest
*Each space is a different relationship with knowing*

---

## 0. The Forest Metaphor

Gurudevi is one forest. Five clearings.

Each clearing has its own light quality, its own temperature, its own pace. But they share the same soil — the same design language, the same color soul, the same foundational values.

A student enters the forest. Depending on what they need — they find a clearing.

**Self** — the quiet glade. Private. Personal. Where you meet yourself.
**Classroom** — the structured grove. Focused. Academic. Where knowledge is transmitted.
**Community** — the gathering clearing. Warm. Relational. Where people meet.
**Library** — the ancient part of the forest. Deep. Timeless. Where knowledge is held.
**Profile** — the threshold. Where you configure your relationship with the forest.

The Principal sees the whole forest from above. The Teacher sees the grove and the gathering. The Student lives mostly in the glade, the grove, and the ancient part.

Same forest. Different paths. Different views. Same light.

---

## 1. Self Space — The Quiet Glade

### Purpose
The most intimate space in Gurudevi. Where the student (and teacher) meets themselves. Daily rhythms, emotional wellbeing, personal reflection, private notes.

Bronfenbrenner's microsystem — the innermost ring. What happens here affects everything that radiates outward.

### Who Uses It
Everyone. All roles. But the experience is entirely personal — Principal's Self space contains no student data. Teacher's Self space contains their own wellbeing, not their students'. The Self is sovereign.

### Emotional Intention
Safe. Held. Witnessed without judgment. The app should feel like a private journal that breathes with you.

*"You showed up today. That matters."*

### Color Signature
```
Background:  Vellum warm #F5EDD6
Phase:       Morning tokens lead (even if afternoon)
             Self space always feels like morning — fresh, possible
Accent:      Dalu luminous #8BBF7A — growth, aliveness
Secondary:   Saffron muted #C4956A — warmth without intensity
Shadow:      Shadow Violet at 6% — softest shadows
Grain:       3% warm — most organic texture
Glass:       Morning phase tokens, blur 10 (transparent — world breathes through)
```

### Key Screens

**Pulse Dashboard** — the daily home
The first screen every morning. Should feel like waking gently, not being alerted.

Layout: Single column. Generous spacing. Nothing fights for attention.
- DailyResonanceCard at top — large, breathing, today's thought or question
- Mood check-in — gentle, not clinical. "How are you holding yourself?"
- Sleep quality — simple, visual
- Energy level — warm slider
- Today's intentions — 1-3 only. No long todo lists here
- Recent notes preview — just titles, soft

Interaction pace: Unhurried. No time pressure communicated.

**Mood Journal**
Private. No AI analysis shown to user (may analyze privately for wellbeing patterns).
Entry types: mood selection, free write (venting space), voice note indicator
History: calendar view with subtle color coding — not clinical charts
Patterns shown: only gentle, encouraging observations — never alarming

**Sleep Tracker**
Visual: arc representing the night — warm dark background
Input: simple time selection, quality slider
History: week view, soft line graph in saffron/dalu
Insight: "You slept most deeply on the nights after..." — observational, gentle

**Notes and Venting Space**
Most private area in entire app.
No word count pressure. No formatting toolbar. Just space.
Venting space specifically:
  - Slightly darker warm background — the intimate hour feeling
  - No sharing option visible (deeply in settings only if at all)
  - After writing, option to "release" or "keep" — release fades the note softly
  - The act of writing and releasing is the point, not the storage

**Reminders**
Gentle. Not aggressive.
Notification design: warm, short, personal — "Your reflection is waiting"
Never: "You haven't logged your mood today!"
Always: invitation, never demand

### Navigation Within Self
Primarily tab-based horizontal navigation within the space.
Minimal depth — most content accessible within 2 taps from Self home.
The space should not feel like a product with many features.
It should feel like one intimate room.

### The Self Space Principle
Anything that makes the user feel observed, measured, or evaluated does not belong here. Self is the space that holds, not the space that judges.

---

## 2. Classroom Space — The Structured Grove

### Purpose
Academic learning. The formal transmission of knowledge between teacher and student. Lesson delivery, assignments, grading, academic progress tracking.

Sri Lankan classroom energy — morning assembly, structured time, respect for the teacher-student relationship, focused attention.

### Who Uses It
**Students** — receive lessons, complete assignments, track academic progress
**Teachers** — create and deliver lessons, grade assignments, track class progress
**Principals** — oversight view, curriculum alignment, teacher performance (aggregate)

The same space, three different views. Role determines what is visible and editable.

### Emotional Intention
Focused but not cold. Structured but not rigid. The warmth of a good teacher in a well-lit room.

*"Knowledge is ready for you. Come with your full attention."*

### Color Signature
```
Background:  Cool vellum #EEF0F5 — clarity, focus
Phase:       Midday tokens lead
Accent:      Aurora blue #7DD4C0 — clear, focused, atmospheric
Secondary:   Saffron #D4843A — warmth in structure, teacher presence
Shadow:      Shadow Violet at 10% — slightly stronger definition than Self
Grain:       2% cool — present but disciplined
Glass:       Midday phase tokens, blur 12 (transparent — clear light)
```

### Subject Color System
Each subject has its own accent color within the Gurudevi palette:
```
Mathematics:    Aurora blue #7DD4C0 — precise, structured
Languages:      Saffron #D4843A — expressive, communicative
Science:        Dalu green #8BBF7A — natural, discovering
Arts & Music:   Lotus pink #E8A0B0 — creative, sensory
History/Civics: Aurora violet #B8A9E0 — temporal, deep
Physical Ed:    Warm amber #E8A060 — energetic, embodied
Religion/Ethics: Vellum deep #C4956A — traditional, reflective
```

Subject color appears as:
- Left border accent on lesson cards
- Icon tint for subject navigation
- Progress bar fill for subject-specific progress
- Never as background color — always as accent

### Key Screens

**Class Dashboard (Student view)**
Today's schedule: horizontal timeline or card list
Upcoming assignments: sorted by due date, gentle urgency (warm, never red unless overdue)
Recent grades: if available — celebratory for good, matter-of-fact for needs improvement
Teacher announcements: distinguished by teacher's name, not just generic "announcement"

**Class Dashboard (Teacher view)**
Today's classes: with student count, period time
Quick grade entry access
Pending submissions: count with gentle notification
Class health indicator: aggregate mood/engagement (anonymous, aggregate only)
Lesson plan for today: quick access

**Lesson View (Student)**
Full-screen reading mode when in lesson content
Progress indicator: how far through the material
Navigation: previous/next within lesson, not back button
Content types: text, embedded video, image gallery, interactive elements
Notes sidebar: student can annotate without leaving lesson
Completion: clear indication of what constitutes "done"

**Lesson Builder (Teacher)**
Block-based editor — each content block is a card
Block types: text, question, image, video embed, activity instruction
Reorder by drag
Preview mode: see exactly what students will see
Publish/draft states: clear visual distinction

**Assignment Flow**
Student receives → Student submits → Teacher grades → Student sees grade
Each step has clear visual state
Late submissions: warm amber indicator — not punishing red
Submitted: dalu green — completed with dignity
Graded: aurora blue — reviewed and returned

**Grade View**
Student: personal grade history, no comparison to others
Teacher: class spread as gentle visualization — identify students needing support
Never: ranking lists, public grade displays

### The Classroom Principle
The classroom in Gurudevi honors the teacher-student relationship as sacred. Grades are feedback, not judgments. Progress is personal, not competitive. The subject colors celebrate the diversity of knowledge. No subject is more important than another in color weight.

---

## 3. Community Space — The Gathering Clearing

### Purpose
The relational ecology. Where students, teachers, and community members connect. Where the feedback loops between school and family and society can be healed. Where emergence happens.

Bronfenbrenner's mesosystem and exosystem — the relationships between microsystems.

### Who Uses It
**Students** — peer connection, group projects, community voice
**Teachers** — professional community, shared resources, family connection
**Principals** — school-wide communication, community health, upward feedback

### Emotional Intention
Warm. Human. The feeling of people gathered around something they care about together.

*"You are not alone in this. The community holds you."*

### The Broken Feedback Loop Vision
One of Gurudevi's most unique functions — healing the upward feedback loop from student to teacher to school to system. Students can express what is and isn't working. Teachers can surface systemic issues. The community can speak and be heard.

This is not a complaint box. It is a voice amplifier.
The design must make people feel their voice lands somewhere real.

### Color Signature
```
Background:  Warm vellum #FDF0DC — amber, gathering
Phase:       Evening tokens lead
Accent:      Saffron #D4843A — full warmth, human presence
Secondary:   Lotus pink #E8A0B0 — connection, care
Tertiary:    Dalu green #8BBF7A — growth in relationship
Shadow:      Shadow Violet at 9%
Grain:       4% warm — most textured, most alive
Glass:       Evening phase tokens, blur 8 (most transparent — warmth shows through)
```

### Key Screens

**Community Feed**
Not a social media timeline — a community notice board
Content types: announcements, discussions, events, shared resources, celebrations
Ordered by relevance and recency, not pure chronology
No engagement metrics visible (no like counts, no view counts)
Interaction: respond, appreciate (lotus reaction — not "like"), share within community

**Group Spaces**
Class groups: automatic — teacher + students
Subject groups: cross-class interest groups
Project groups: teacher-created or student-initiated
Community groups: parent-teacher, extra-curricular

Group card shows: name, members (avatar cluster), last activity time
Inside group: focused feed, shared files, project tracking

**The Manifesto Board**
Gurudevi-specific — where community values are articulated and held
Each class or group can have a manifesto — their shared agreements
Visual: vellum-like surface, careful typography, almost manuscript quality
The manifesto is not a rules list — it is a living agreement
Students contribute, teacher facilitates, Principal can see across school

**Voice Channel (Feedback Loop)**
Anonymous option available — student safety essential
Topics: learning experience, school environment, wellbeing, suggestions
Responses visible to appropriate level only
Principal sees aggregate themes, not individual voices (unless consent given)
Teacher sees class-level themes
The voice channel should feel like whispering into a tree that listens — not filing a complaint form

**Events and Calendar**
School events, community gatherings, important dates
Warm card design, clear date prominence
RSVP that feels human: "I'll be there" not "Confirm attendance"

**Recognition Wall**
Celebrating achievement, effort, growth
Teacher can recognize students — but so can students recognize each other
Recognition in Gurudevi: specific and personal — not generic "Good job!"
"Amara helped three classmates understand photosynthesis today"
Design: warm, celebratory — lotus pink accents, perhaps lotus animation for exceptional recognition

### The Community Principle
Community in Gurudevi is not social media. There are no followers, no influence metrics, no virality. It is a village square — a place where people who share a context gather, contribute, and support each other. The design actively discourages performance and encourages presence.

---

## 4. Library Space — The Ancient Part of the Forest

### Purpose
The world's most holistic, diverse digital library for education. Not a database. A living archive.

Every kind of knowing has a home here: academic texts, films, life maps, lesson plans, podcasts, documentaries, visual art, practical guides, philosophical frameworks.

Bronfenbrenner's macrosystem — the cultural and societal layer that holds all other systems.

### Who Uses It
**Students** — discover, explore, read, watch, learn beyond the curriculum
**Teachers** — source materials, build lesson plans, develop professionally
**Principals** — curriculum resources, school policy references, professional development

### Emotional Intention
Vast. Timeless. The feeling that knowledge has been held here across centuries and will continue to be held long after you.

*"Everything you need to know — and everything you didn't know you needed — lives here."*

### Color Signature
```
Background:  Vellum #F5EDD6 — the manuscript ground
Phase:       Night tokens ALWAYS — Library is timeless, not temporal
Accent:      Aurora violet #B8A9E0 — depth, mystery, knowledge across time
Secondary:   Dalu deep #5A8A4A — ancient forest, deep knowing
Tertiary:    Saffron #D4843A — illuminated moments, featured content
Shadow:      Shadow Violet at 15% — deepest shadows in the app
Grain:       2% fine — like vellum texture, aged quality
Glass:       Night phase tokens regardless of actual time
Typography:  Most generous in the app — reading comfort is primary
```

### Resource Types and Visual Language
```
Books:           Open book motif, warm spine color by subject
Videos:          Subtle play indicator, thumbnail with warm overlay
Articles:        Document motif, publication source visible
Lesson Plans:    Structured grid motif — organized, teacher-made
Life Maps:       Cartographic aesthetic — compass, topographic feel
                 This is Gurudevi's most unique resource type
                 Maps for navigating life decisions, transitions, challenges
Documentaries:   Film strip motif, duration prominent
Podcasts:        Audio wave motif, episode count
Practices:       Activity icon, estimated time, materials needed
Collections:     Curated groupings — like a bookshelf, not a tag
```

### Key Screens

**Library Home**
Organized by mood and need, not just category:
- "For deep thinking" — philosophy, long reads, documentaries
- "Quick knowledge" — articles, short videos, summaries
- "For teaching" — lesson plans, pedagogical resources
- "For life" — life maps, practical guides, transition support
- "Sri Lankan voices" — local authors, local knowledge, local stories (important)
- "Featured collection" — curated by Gurudevi or trusted educators

Search: prominent, warm, patient
  Placeholder: "What do you want to understand today?"
  Results: rich — show resource type, duration, collection membership

**Resource View**
For long-form reading:
  Background: vellum.warm — maximum reading comfort
  Font size: user-adjustable, generous default
  Line height: 1.8 — breath between lines
  Progress: subtle indicator — how far through
  Highlight and note: student can annotate
  Night mode: night phase tokens — dark vellum background

For video:
  Standard video player
  Below: summary, key moments, discussion questions
  Related resources — not algorithmic, curated

**Collections**
Visual: bookshelf metaphor
Each collection has a cover — warm, illustrated
Collections can be: Gurudevi-curated, Teacher-made, School-specific
Students can save to personal collection (My Shelf)

**Life Maps**
Gurudevi's most distinctive resource type — deserves its own treatment
A life map is a visual guide for navigating a life challenge or transition:
  - Starting secondary school
  - Choosing a career path
  - Dealing with family change
  - Understanding mental health
  - Navigating cultural identity

Visual language: cartographic — like an illustrated map
Warm vellum ground, illustrated paths and landmarks
Text in body and caption variants
Interactive: user can mark their position on the map
Progress through a life map is personal and private

**The Sri Lankan Section**
Important. Gurudevi is Sri Lankan by soul.
Local curriculum alignment (national syllabus)
Sri Lankan authors and thinkers
Local history and cultural knowledge
Sinhala and Tamil language resources
This section should feel like home — warm, familiar, proud

### The Library Principle
The library in Gurudevi does not recommend based on engagement history. It curates based on educational value, diversity of perspective, and relevance to the learner's stage. The algorithm, if any, serves the learner's growth — not their time-on-app.

---

## 5. Profile Space — The Threshold

### Purpose
Personal settings, identity, achievements, app configuration. The space between the user and the forest — where they configure their relationship with Gurudevi.

### Emotional Intention
Calm. Clean. Personal. A space for quiet administration of self.

*"This is where you are known by the app. Where you tell it who you are."*

### Color Signature
```
Background:  Neutral vellum #FAF8F5 — quietest surface
Phase:       Dawn tokens — threshold, in-between
Accent:      Saffron muted #C4956A — soft identity
Shadow:      Shadow Violet at 5% — barely present
Grain:       1% — almost imperceptible
Glass:       Dawn phase tokens
```

### Key Screens

**Identity Card**
The user's presence in the app
Name, role, school, avatar
Avatar: warm illustrated style — not photographic by default
Option to use photo
Avatar background: phase.accent color — personalizable

**Achievements and Growth**
Not gamification in the shallow sense — meaningful recognition
Categories: learning milestones, community contribution, teaching excellence, personal growth
Visual: lotus bloom for significant achievements
History: timeline of meaningful moments in the app
Visible to: self only unless explicitly shared

**Rewards System**
If implemented: kept warm and meaningful
Not points and badges for engagement
Recognition for: helping others, consistent reflection, completing meaningful work
The economy of reward should reflect Gurudevi's values — growth, care, knowledge

**App Settings**
Notification preferences: generous opt-out, specific controls
Temporal phase settings: can manual override or trust automatic
Language: Sinhala, Tamil, English options
Accessibility: font size, motion reduction, contrast
Data: transparency about what is stored, easy export, clear deletion

**About Gurudevi**
The soul of the app — accessible from Profile
Brief: what Gurudevi is, who made it, why it exists
The lotus story. The divine teacher. The ecology metaphor.
This page should feel like the opening page of a beautiful book.

### The Profile Principle
Profile is not a dashboard of the user's productivity metrics. It is not a performance review. It is a space for personal configuration and quiet recognition of growth. The user's data belongs to them.

---

## 6. Cross-Space Interactions

### Navigation Between Spaces
The tab bar allows movement between all five spaces at any time.
Transitions between spaces are crossfades — the forest shifts, doesn't slide.
Each space's color signature fades in as you arrive — the temperature of the clearing changes.

### Shared Elements Across Spaces
**SanctuaryHeader** — present in all spaces, adapts color signature
**NoiseOverlay** — global, always present, phase-aware grain
**SanctuaryToast** — appears above all spaces equally
**The temporal phase** — shifts all five spaces simultaneously at time boundaries

### Role-Based View Switching
When a teacher needs to see the student view (to understand experience):
  A gentle visual indicator — "Viewing as student"
  Warm saffron banner below header — always visible
  Return to teacher view: one tap
  No student data is accessible in preview mode — only UI layout

### Deep Linking Between Spaces
Library content can be linked from Classroom lessons
Community discussions can reference Library resources  
Self achievements can be shared to Community (user-initiated, never automatic)
Classroom progress can feed Self space wellbeing awareness (aggregate, not raw grades)

---

## 7. Responsive Behavior

### Tablet Layout
All five spaces should work gracefully on tablet
Two-column layouts where content benefits from wider canvas
Library especially — two-column reading layout, sidebar navigation
Classroom — lesson builder has more canvas space

### Landscape Mode
Primarily phone-portrait experience
Landscape: video content in Library plays full-screen
Lesson content in Classroom reflows to two-column

### Different Screen Sizes
All spacing and typography scales with system settings
Minimum tested: iPhone SE screen size
Generous targets maintained at all sizes

---

## 8. The Role Perspectives — One Reality, Different Views

### Student Perspective
Sees: their own Self, their Classroom content, Community feed relevant to their groups, Library for personal exploration, their own Profile

Does not see: other students' Self data, teacher-only features, administrative views, aggregate analytics

### Teacher Perspective
Sees: their own Self, their Classes in Classroom, Community for their school and professional network, Library with teacher-specific resources, their own Profile

Additional access: class-level aggregate data, student submission and grade management, community moderation for their groups

### Principal Perspective
Sees: their own Self, school-wide Classroom overview, full Community for their school, Library administrative access, Profile with school settings

Additional access: school-level aggregate analytics, teacher-level summaries (aggregate), community oversight, curriculum alignment view

### The Design Implication
Every screen must be designed with awareness of who might be seeing it.
Student Self data: never visible in any Principal or Teacher view without explicit consent
Grade data: student sees their own, teacher sees their class, principal sees aggregate
Community voices: principal sees themes, not individuals (unless consent given)

The design of privacy is as important as the design of color.

---

*Document version 1.0 — February 2026*
*Gurudevi Space Specifications*
*Five clearings in one living forest — born from the topology of a single conversation*
