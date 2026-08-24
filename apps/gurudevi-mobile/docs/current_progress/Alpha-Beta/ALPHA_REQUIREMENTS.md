---
title: "ðŸš€ Gurudevi Alpha Requirements Checklist"
status: "active"
created: 2026-02-19
updated: 2026-02-19
author: "Naveen"
scribe: "opencode"
tags: [apps, gurudevi-mobile, historical]
---

# 🚀 Gurudevi Alpha Requirements Checklist
## Based on Complete PRD (February 8, 2026)

**Version:** Alpha 0.1.0  
**Timeline:** 5 days  
**Distribution:** Invite-only, closed testing  
**Target:** Principals → Teachers (max 3 invites per principal)

**Full Documentation:** See `/apps/gurudevi-mobile/GURUDEVI_COMPLETE_PRD.md`

---

## ✅ ALREADY IMPLEMENTED

### Authentication & Core Features
- [x] Email/password authentication
- [x] Google OAuth ready
- [x] Session management
- [x] User profiles with role assignment
- [x] QR code scanning for invite codes
- [x] Student profile creation (individual)
- [x] Student attendance marking
- [x] Lessons and assignments
- [x] Grading system
- [x] Wellbeing features (Mood Lotus, Fire Journal, etc.)
- [x] Community groups and posts
- [x] Library resources

---

## ⚠️ NEEDS IMPLEMENTATION FOR ALPHA

### Priority 1: Critical Features (Week 1)

#### 1. Bulk Student Creation
**Status:** ❌ Not implemented  
**Current:** Individual student creation only  
**Needed:**
- Teacher inputs total number of students
- Creates all profiles at once
- Fields: Name (required), Index (required), Notes (optional)
- Quick mass entry interface

**Files to modify:**
- `src/components/classroom/AddStudentModal.tsx`
- `src/lib/api/classroom.ts`

---

#### 2. Thuthimal (Gratitude Economy)
**Status:** ❌ Not implemented  
**Concept:** Gift Pro subscriptions to teachers as gratitude  

**Database changes needed:**
```sql
ALTER TABLE users 
  ADD COLUMN is_pro BOOLEAN DEFAULT false,
  ADD COLUMN is_thuthimal BOOLEAN DEFAULT false,
  ADD COLUMN thuthimal_gifter TEXT;
```

**UI changes needed:**
- Profile screen: Show Thuthimal badge if `is_thuthimal = true`
- Display: "Your Pro subscription is a gift of gratitude (තුතිමල්) from [gifter_name]"
- Badge design: Elegant, warm, non-intrusive

**Files to create/modify:**
- `src/components/profile/ThuthimalBadge.tsx` (new)
- `src/screens/ProfileScreen.tsx`

---

#### 3. Daily Motivation & "Did You Know?"
**Status:** ❌ Not implemented  
**Needed in Self section:**
- One motivation quote per day (rotates daily)
- One "Did you know?" educational fact per day (rotates daily)

**Database:**
```sql
CREATE TABLE daily_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL, -- 'motivation' or 'did_you_know'
  content TEXT NOT NULL,
  author TEXT,
  date DATE NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**UI:**
- Top of Self screen
- Beautiful card design
- Changes at midnight
- Tappable for full text

**Files to create/modify:**
- `src/components/self/DailyContent.tsx` (new)
- `src/lib/api/self.ts`
- `src/screens/SelfScreen.tsx`

---

#### 4. Profile Completion Progress
**Status:** ❌ Not implemented  
**Needed:**
- Track profile completion percentage (0-100%)
- Display in Profile section
- Factors: Name ✓, Role ✓, School (?), Photo (?), Bio (?), Subjects (?)

**Calculation:**
```typescript
const completionItems = [
  { field: 'name', required: true },
  { field: 'role', required: true },
  { field: 'school', required: false },
  { field: 'profile_photo', required: false },
  { field: 'bio', required: false },
  { field: 'subjects', required: false }, // for teachers
];

const completion = (completedItems / totalItems) * 100;
```

**UI:**
- Progress bar in Profile section header
- "Complete your profile" gentle nudge
- Not blocking, just encouraging

**Files to modify:**
- `src/screens/ProfileScreen.tsx`
- Add `profile_completion` field to User type

---

#### 5. Onboarding Philosophy Screens
**Status:** ❌ Not implemented  
**Needed:** SKIPPABLE screens after name + role (mandatory)

**Screens:**
1. Welcome to Gurudevi (vision)
2. Five Sections explanation (Self, Classroom, Community, Library, Profile)
3. Ecological thinking intro
4. "This is support, not surveillance"
5. Privacy commitment

**Design:**
- One concept per screen
- Beautiful, calm, spacious
- "Skip" button always visible
- Progress dots
- Can be dismissed and revisited later

**Files to create:**
- `src/screens/onboarding/` (new directory)
  - `WelcomeScreen.tsx`
  - `FiveSectionsScreen.tsx`
  - `EcologyScreen.tsx`
  - `PrivacyScreen.tsx`
  - `OnboardingNavigator.tsx`

---

### Priority 2: Important Features (Week 2)

#### 6. Invitation Limits (Alpha)
**Status:** ⚠️ Partial (system exists, limits not enforced)  
**Needed:**
- Principals: Max 3 teacher invitations in Alpha
- Teachers: Cannot invite anyone in Alpha (disabled)
- Enforce at invitation creation

**Logic:**
```typescript
// Check invitation limit
const inviteCount = await getInvitationCount(principalId, 'teacher');
if (role === 'principal' && inviteCount >= 3) {
  throw new Error('Alpha limit: Principals can invite max 3 teachers');
}
if (role === 'teacher') {
  throw new Error('Teacher invitations will be available in Beta');
}
```

**Files to modify:**
- `src/lib/api/invitations.ts`
- `src/screens/ProfileScreen.tsx` (generate invite code section)

---

#### 7. Photo Upload to Classroom (with Principal Sharing)
**Status:** ❌ Not implemented  
**Needed:**
- Teacher uploads photos to their classroom
- Checkbox: "Share with principal"
- Principal sees shared photos in their dashboard

**Database:**
```sql
CREATE TABLE classroom_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  classroom_id UUID REFERENCES classrooms(id),
  uploaded_by UUID REFERENCES users(id),
  file_url TEXT NOT NULL,
  caption TEXT,
  shared_with_principal BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**UI:**
- Photo picker in classroom
- Optional caption
- Share toggle
- Gallery view for teachers/principals

**Files to create/modify:**
- `src/components/classroom/PhotoUpload.tsx` (new)
- `src/components/classroom/PhotoGallery.tsx` (new)
- `src/lib/api/classroom.ts`

---

#### 8. Principal Aggregated Attendance Dashboard
**Status:** ❌ Not implemented  
**Needed:**
- School-wide attendance percentage
- Per-class attendance trends
- Per-grade attendance patterns
- NO individual student names (privacy-preserving)

**Queries:**
```sql
-- School-wide attendance
SELECT 
  COUNT(CASE WHEN status = 'present' THEN 1 END)::FLOAT / COUNT(*)::FLOAT * 100 as attendance_rate
FROM attendance
WHERE date >= CURRENT_DATE - INTERVAL '7 days';

-- Per-class attendance
SELECT 
  c.name,
  COUNT(CASE WHEN a.status = 'present' THEN 1 END)::FLOAT / COUNT(*)::FLOAT * 100 as rate
FROM attendance a
JOIN classrooms c ON a.classroom_id = c.id
GROUP BY c.id, c.name;
```

**UI:**
- Dashboard cards with percentages
- Trend charts (optional for Alpha)
- Date range selector (last 7 days, last 30 days)

**Files to create/modify:**
- `src/components/admin/AttendanceDashboard.tsx` (new)
- `src/lib/api/attendance.ts`

---

#### 9. In-App Notifications
**Status:** ❌ Not implemented  
**Needed (Alpha scope):**
- In-app only (no push, no email)
- Bell icon with badge count
- Notification list

**Triggers:**
1. Invitation received
2. Student profile linked
3. Thuthimal gift received
4. Profile completion reminder (optional)

**Database:**
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  type TEXT NOT NULL, -- 'invitation', 'profile_linked', 'thuthimal_received', 'reminder'
  message TEXT NOT NULL,
  data JSONB,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**UI:**
- Bell icon in header with badge (unread count)
- Notification list screen
- Mark as read
- Tap to navigate to relevant screen

**Files to create:**
- `src/components/shared/NotificationBell.tsx` (new)
- `src/screens/NotificationsScreen.tsx` (new)
- `src/lib/api/notifications.ts` (new)

---

#### 10. Auto-Generated QR Context Text
**Status:** ❌ Not implemented  
**Needed:**
- When generating QR code, include contextual text
- Format: "Join [School Name] teachers on Gurudevi — invited by [Inviter Name]"
- Personalizes invitation

**Logic:**
```typescript
const generateInviteText = (school: string, inviterName: string, role: string) => {
  const roleText = role === 'teacher' ? 'teachers' : 'students';
  return `Join ${school} ${roleText} on Gurudevi — invited by ${inviterName}`;
};
```

**Files to modify:**
- `src/lib/api/invitations.ts`
- `src/screens/ProfileScreen.tsx` (QR generation)

---

## 📋 ALPHA LAUNCH CHECKLIST

### Pre-Launch
- [ ] Fix TypeScript compilation errors (13 found)
- [ ] Implement bulk student creation
- [ ] Implement Thuthimal database + UI
- [ ] Implement daily motivation & "did you know?"
- [ ] Implement profile completion progress
- [ ] Implement onboarding philosophy screens
- [ ] Implement invitation limits
- [ ] Implement photo upload + principal sharing
- [ ] Implement principal attendance dashboard
- [ ] Implement in-app notifications
- [ ] Implement auto-generated QR text
- [ ] Mobile testing (iOS + Android)
- [ ] Privacy/security review

### Launch Day
- [ ] Deploy to Expo EAS
- [ ] Generate first QR codes for principals
- [ ] Send personal invitations
- [ ] Monitor for crashes
- [ ] Be available for support

### Post-Launch (Week 1)
- [ ] Daily user check-ins
- [ ] Collect feedback
- [ ] Monitor metrics (signups, attendance marked, profiles created)
- [ ] Fix critical bugs
- [ ] Document learnings for Beta

---

## 🎯 SUCCESS METRICS

### Quantitative
- Number of principals who join
- Number of teachers invited
- Attendance marking frequency
- Student profiles created
- Profile completion rates

### Qualitative
- Do teachers feel supported?
- Do they understand the philosophy?
- Do they trust the privacy model?
- Feature requests and pain points

---

## 🔗 RELATED DOCUMENTATION

- **Complete PRD:** `/apps/edlove-web/Docs/11_COMPLETE_PRD.md`
- **Philosophy:** `/apps/edlove-web/Docs/01_PHILOSOPHY.md`
- **Gurudevi Domain:** `/apps/edlove-web/Docs/06_Domain_III.md`
- **Mobile App Docs:** `DOCS_INDEX.md`, `COMPREHENSIVE_APP_ANALYSIS.md`

---

**Last Updated:** February 8, 2026  
**Next Review:** Post-Alpha Launch
