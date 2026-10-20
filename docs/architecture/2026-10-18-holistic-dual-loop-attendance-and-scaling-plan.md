# Holistic Dual-Loop Attendance & Scaled Sovereign Educational Architecture

> **Author**: Polymath Platform Solution Architecture & Senior Engineering  
> **Status**: APPROVED ARCHITECTURAL SPECIFICATION & OPERATIONAL ROADMAP  
> **Invariants Enforced**: Convivial Limit, Zero Dual-Model Slop, Offline-First Partition Tolerance, Data CIA Triad, Human-in-the-Loop Attunement.

---

## Executive Summary: The Dual-Loop Philosophy

Modern institutional attendance systems fail when they force an artificial binary:
1. **The Purely Manual Model**: Overwhelms teachers with 45 checkboxes every 40-minute period, stealing 20% of instructional time and leading to fake, backfilled paper registers.
2. **The Purely Automated "Bypass" Model (Biometric/Card Gate)**: Fails in reality due to proxy punching ("buddy tapping"), hallway drift (tapping at gate at 7:35 AM but skipping Period 2 Math), forgotten badges, and edge device power/network outages.

EdLove / Gurudevi introduces the **Dual-Loop Architectural Continuum**:
- **Loop 1: Automated High-Throughput Edge Loop (Telemetry / Kiosk / Tap)**:
  Passive, lightning-fast ingress (50–100 taps/minute) via QR badges, NFC smartcards, or edge kiosk camera scans. Proposes the initial room state (`preliminary_arrival`).
- **Loop 2: Human-in-the-Loop Attunement Loop (Teacher Classroom Reality)**:
  The teacher verifies the room with zero friction. The system highlights anomalies (*"Kasun tapped at the gate 20 min ago, but is absent from your homeroom"*). The teacher has single-tap override authority (*"Mark All Present Except..."*, voice memo, or rapid roll number input).

```
                      ┌────────────────────────────────────────────────────────┐
                      │             LOOP 1: AUTOMATED TELEMETRY                │
                      │  • Gate/Classroom Kiosk (NFC / QR Badge / Barcode)     │
                      │  • Student Tap: < 300ms contactless scan               │
                      │  • Writes: AttendanceSession (arrival, unconfirmed)    │
                      └───────────────────────────┬────────────────────────────┘
                                                  │
                                                  ▼
                                    ┌───────────────────────────┐
                                    │    RECONCILIATION SEAM    │
                                    │  • Anomaly Detection      │
                                    │  • Discrepancy Highlighting│
                                    └─────────────┬─────────────┘
                                                  │
                                                  ▼
                      ┌────────────────────────────────────────────────────────┐
                      │          LOOP 2: HUMAN TEACHER ATTUNEMENT              │
                      │  • Web Floor / Mobile Screen displays reconciled room  │
                      │  • 1-Tap "Confirm All" or Absentees Roll-Call: "4, 18" │
                      │  • WhatsApp Voice Note Ingress (Exoskeleton Parser)    │
                      │  • Teacher overrides: "Card Forgotten" or "Skipped"   │
                      │  • Formal Institutional Record Sealed (DailyAttendance)│
                      └────────────────────────────────────────────────────────┘
```

---

## 1. Physical Ingress & Edge Kiosk Engine

### 1.1 Kiosk Mode vs. Mobile Teacher Mode
- **Kiosk Scanner Route (`/workspace/kiosk` or `/workspace/scanner`)**:
  - Full-screen high-contrast surface designed for a tablet mounted at the classroom doorway or entrance gate.
  - Supports continuous background camera scanning ([`@repo/scanner-kit`](file:///c:/x/packages/classroom/src/components/AttendanceBadgeScanning.test.ts)) or Web-NFC / USB HID barcode readers.
  - Sub-300ms audio-visual feedback: Green pulse + audio chime on valid student token; distinct amber chime for "already marked" or "enrolled in another class".
- **Hardware Agnosticism**:
  - **QR / Barcode ID Cards**: Low-cost laminated badges printed directly from school records. Token formats: `ATTENDANCE:<gradeClassId>:<studentId>` or signed institutional JWT.
  - **NFC / Mifare RFID Smartcards**: Student ID cards tapped against Android NFC coil or external USB reader.
  - **Ephemeral QR on Student Smartphone**: For secondary students with phones, dynamic time-cycling QR codes inside the mobile app to eliminate screenshot sharing.

### 1.2 Anti-Proxy Punching & Edge Tamper Protection
- **Velocity Throttling**: A single card cannot be tapped twice within 30 minutes for the same session.
- **Batch Burst Detection**: If 5 scans occur within 2 seconds on a single kiosk without camera motion, the kiosk flags a potential "card stack punch" and requests human teacher verification.
- **Signed Device Receipts**: Edge kiosks authenticate with a `KioskDeviceToken` tied to a specific physical location (`gate_north`, `room_5b`).

---

## 2. Multi-Channel Rapid Ingress (The 5-Second Roll Call)

### 2.1 Rapid Roll Number Entry ("All Present Except...")
In South Asian and developing nation classrooms (Sri Lanka, India, sub-Saharan Africa), teachers call roll numbers:
- Default state: **All Enrolled Students = Present**.
- Teacher enters only absentee numbers: e.g. `[4, 18, 33]`.
- System marks 4, 18, 33 as `absent`, marks the remaining 42 students as `present`, and records attendance in **under 5 seconds**.

### 2.2 Conversational WhatsApp & Voice Exoskeleton
Implemented via [`VoiceExoskeletonParser`](file:///c:/x/packages/core/src/logic/omnichannel/voiceExoskeletonParser.ts):
1. **Teacher Action**: Teacher sends a 4-second WhatsApp voice note or text:
   > *"5B Period 1: 4 and 18 absent, rest present."*
2. **AI Extraction Pipeline**: Gemini 2.0 Flash multimodal parser extracts:
   ```json
   {
     "gradeClass": "5B",
     "period": 1,
     "absenteeIdentifiers": ["4", "18"],
     "lateIdentifiers": []
   }
   ```
3. **Automated Seam Resolution**:
   - Matches teacher's WhatsApp phone number to their active `TeacherBond` in `school_memberships`.
   - Resolves GradeClass 5B and student roll numbers 4 and 18.
   - Posts atomic batch update to Sanctuary API via oRPC.
   - Replies via WhatsApp with a clean receipt card:
     > *"✅ Grade 5B Period 1 Recorded: 41 Present, 2 Absent (Nimal #4, Kasun #18). Status: Sealed."*

---

## 3. Dual Granularity: Daily Attendance vs. Period-Wise Subject Tracking

The relational schema natively separates daily legal presence from granular lesson attendance:

| Entity | Purpose | Typical Primary Use | Typical Secondary Use |
| :--- | :--- | :--- | :--- |
| **`DailyAttendance`** | Authoritative legal daily roll call | Marked once in morning (Homeroom / Class Teacher) | Master presence record for government census and report cards |
| **`AttendanceSession`** | Subject / Period-by-Period lesson tracking | Optional (used for special field trips, exams) | Mandatory for Period 1 Math, Period 2 Science, Period 3 English, etc. |

### Period Discrepancy Sentinel (Hallway Drift Detector)
When Period 2 attendance is taken, the system compares it against Morning `DailyAttendance`:
- **Scenario A (Skipping class)**: Student was present at 7:50 AM morning roll call, but teacher marks them absent in Period 3 Chemistry.
  $\rightarrow$ System triggers a **"Internal Absentee Alert"** to the Grade Head / Section Head.
- **Scenario B (Late arrival)**: Student was absent in morning roll call, but taps into Period 3 Chemistry.
  $\rightarrow$ System updates `DailyAttendance` status from `absent` to `late` (with recorded arrival timestamp), ensuring attendance percentages accurately reflect class participation.

---

## 4. Multi-Year Shadow Student Lifecycle & Progression

### 4.1 Progression Across Academic Cycles (Grade 1 $\rightarrow$ Grade 12)
```
[Grade 1 (2026)] ──────► [Grade 2 (2027)] ──────► [Grade 3 (2028)] ──────► [Graduation (2037)]
Student ID:            Student ID:            Student ID:            Student ID:
  shadow-uuid-981        shadow-uuid-981        shadow-uuid-981        shadow-uuid-981
GradeClass: 1A         GradeClass: 2A         GradeClass: 3A         GradeClass: 12B
Invite: EDL-7712       Invite: EDL-7712       Invite: EDL-7712       Invite: EDL-7712
Status: Shadow         Status: Shadow         Status: Claimed!       Status: Alumni
Records: 180 Daily     Records: 182 Daily     Records: 185 Daily     Records: 12-Year
         Attendance             Attendance             Attendance             Unified Record
```

1. **The Shadow User Anchor**:
   The student is provisioned with a real, permanent `User` entity (`is_anonymous: true, identity_state: 'shadow', capacity: 'student'`).
2. **Annual Class Promotion**:
   When transitioning between school years, the school administration runs annual progression. This generates a new [`StudentGradeClassEnrollment`](file:///c:/x/packages/schema/schema.zmodel#L1794) referencing the new `AcademicCycle` and new `GradeClass` (e.g. 2A), **preserving the exact same `student_id`**.
3. **Permanent Value Even If Never Claimed**:
   If a rural student never owns a smartphone, their entire educational dossier, daily attendance rate, term marks, and awards remain intact and mathematically coherent.
4. **Instant Claim & Carry-Forward**:
   When the student or their parent eventually claims the profile via [`claimShadowStudent`](file:///c:/x/apps/sanctuary-api/src/core/handlers/educational.ts#L442), all past years of `DailyAttendance`, `AttendanceSession`, `GradeMark`, `AssignmentSubmission`, and `StudentGradeClassEnrollment` instantly attach to the user's permanent profile in one atomic transaction.

---

## 5. Security & Governance: The Data CIA Triad

```
                         ┌────────────────────────────────────┐
                         │          THE CIA TRIAD             │
                         │      FOR STUDENT ATTENDANCE        │
                         └─────────────────┬──────────────────┘
                                           │
         ┌─────────────────────────────────┼─────────────────────────────────┐
         ▼                                 ▼                                 ▼
┌───────────────────┐             ┌───────────────────┐             ┌───────────────────┐
│  CONFIDENTIALITY  │             │     INTEGRITY     │             │   AVAILABILITY    │
├───────────────────┤             ├───────────────────┤             ├───────────────────┤
│• ZenStack RLS     │             │• Immutable Audits │             │• Offline SQLite   │
│• Cedar Auth Scope │             │• Unique Keys      │             │• PowerSync Engine │
│• Zero PII Leakage │             │• Atomicity (ACID) │             │• Local Web Drafts │
│• Masked Badges    │             │• Claim Preservation│            │• Zero-Signal Mode │
└───────────────────┘             └───────────────────┘             └───────────────────┘
```

### 5.1 Confidentiality (Student Privacy & Regulatory Compliance)
- **ZenStack Row-Level Security (`@@allow`)**:
  - Students / Parents can **only** query rows where `auth().id == student_id`. They can never inspect classmates' attendance or behavioral marks.
  - Teachers can **only** inspect GradeClasses in their authorized school (`auth().bonds?[entity_id == this.school_id]`).
- **Physical Badge Privacy**: QR badges encode only an opaque cryptographic token (`ATTENDANCE:cls_5b:stu_uuid`); they do not print sensitive medical, national identity, or residential data on the card surface.
- **FERPA / GDPR-K Alignment**: Shadow identities do not require email, phone numbers, or passwords.

### 5.2 Integrity (Auditability & Tamper Resistance)
- **Unique Constraint Firewall**: `@@unique([student_id, grade_class_id, attendance_date])` guarantees that no race condition or network retry can duplicate a student's daily presence record.
- **Origin Provenance**: Every session marks whether it originated from a `kiosk_scanner`, `teacher_mobile_app`, `web_dashboard`, or `whatsapp_bot`.
- **Immutable Historical Timestamps**: Claiming an invite code updates only the foreign key pointer; it never mutates the historical `attendance_date`, `created_at`, or `session_at` timestamps.

### 5.3 Availability (Offline-First Rural Resilience)
- **Zero-Signal Classrooms**: Mobile devices cache the active classroom roster in local SQLite via PowerSync. A teacher in an off-grid mountain valley marks attendance with instant 60fps UI feedback.
- **Asynchronous Outbox Sync**: When connectivity is restored, the local change log synchronizes upstream to Sanctuary API.
- **Web Local Draft Engine**: Even on web browsers, pending marks are buffered into `localStorage` (`saveAccountAttendanceDraft`). If the browser tab crashes or Wi-Fi drops, no keystroke or roll call mark is lost.

---

## 6. Real-World User Empathy & Actionable Insights

### 6.1 For the Classroom Teacher
- **The Problem**: Teachers are exhausted by administrative clerical duties. Manually filling physical attendance registers, calculating monthly percentages, and computing term-end averages consumes up to 30 hours per term.
- **The Solution**: 5-second roll call. Automatic term percentage calculation. Instant export of official government register formats (SIS/NDAE).

### 6.2 For the Student & Parent
- **The Problem**: Absenteeism is often caught too late—after a student has missed 20 days and failed exams.
- **The Solution**:
  - **Early Warning Threshold Alert**: If a student misses 3 consecutive days or falls below 85% attendance in any 30-day window, an automated nudge alerts the parent and class teacher.
  - **Streak Motivation**: Monthly badges for 100% attendance, rewarding consistency and building positive academic identity.

### 6.3 For the Principal & Ministry of Education
- **Attendance vs. Performance Correlation**: Visual scatter plots showing the correlation between student attendance percentages and term test marks.
- **Seasonal Absenteeism Heatmaps**: Identifies seasonal drops (e.g. monsoon rains, agricultural harvest periods, post-festival days) to inform evidence-based school calendar adjustments.

---

## 7. Scaled Implementation Roadmap

```
PHASE 1: Roster & Fast Roll Call ────► PHASE 2: Dual-Loop Kiosk Engine ────► PHASE 3: Omnichannel Voice/WhatsApp
• Web "All Present Except..."           • Web/Mobile Kiosk Scan Screen         • WhatsApp Voice Note Parser
• Mobile Quick Roll-Number Input        • Badge QR Generator for Roster        • Period Discrepancy Sentinel
• PowerSync Offline Table Bindings      • Proxy Punching Velocity Defense      • Government SIS Export Engine
```

### Phase 1: High-Velocity Rapid-Entry UI (Web & Mobile)
1. **Web (`WorkspaceFloor.tsx`)**:
   - Add **"Mark All Present"** master toggle.
   - Add **"Absent Roll Numbers"** chip input (type `4, 18, 33` $\rightarrow$ marks them absent instantly).
2. **Mobile (`AttendanceScreen.tsx`)**:
   - Add quick numeric roll-call drawer for one-handed absentee marking.
3. **PowerSync Schema**:
   - Add `grade_classes`, `student_grade_class_enrollments`, `daily_attendance`, and `attendance_sessions` to local SQLite tables for offline replication.

### Phase 2: Dual-Loop Automated Kiosk & Badge Engine
1. **Kiosk Surface (`apps/gurudevi-web/app/(sanctuary)/workspace/kiosk/page.tsx`)**:
   - Dedicated high-throughput scanning interface with camera scanner and USB/NFC input listener.
2. **Badge Printing Engine**:
   - Vector PDF badge generator rendering student name, photo, roll number, and cryptographic QR code.
3. **Reconciliation Drawer in Teacher UI**:
   - Visual badge indicators showing: `Auto-Scanned at Gate (7:42 AM)` vs `Unverified in Room`.

### Phase 3: Omnichannel Voice & Discrepancy Intelligence
1. **WhatsApp Inbound Webhook**:
   - Wire `VoiceExoskeletonParser` to accept incoming voice notes and text messages from verified teacher phone numbers.
2. **Period Discrepancy Sentinel**:
   - Background worker flagging students marked present in morning roll call but absent during subject periods.
3. **Official Reporting**:
   - One-click export to standard Ministry of Education attendance census spreadsheets.
