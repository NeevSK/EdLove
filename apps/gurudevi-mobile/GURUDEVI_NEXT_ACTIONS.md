# 🎯 Next Actions: Implementing Alpha Requirements
## Prioritized Task List for Mobile App Team

**Based on:** 11_COMPLETE_PRD.md + ALPHA_REQUIREMENTS.md  
**Timeline:** 2 weeks to Alpha launch  
**Target:** February 22, 2026

---

## 📋 WEEK 1: Critical Features (5 days)

### Task 1: Bulk Student Creation ⚡ HIGH PRIORITY
**Effort:** 6 hours  
**Assignee:** [TBD]

**What to build:**
- UI for entering total number of students
- Form that loops through student count
- Fields: Name (required), Index (required), Notes (optional)
- Quick save (batch insert)

**Files:**
- Modify: `src/components/classroom/AddStudentModal.tsx`
- Modify: `src/lib/api/classroom.ts`
- Add: `bulkCreateStudents(classroomId, students[])`

**Acceptance criteria:**
- [ ] Teacher can input total number (e.g., 35)
- [ ] Form creates 35 student profiles
- [ ] All profiles saved to database
- [ ] Displayed in student list

---

### Task 2: Thuthimal Database + Badge ⚡ HIGH PRIORITY
**Effort:** 8 hours  
**Assignee:** [TBD]

**Part A: Database (2 hours)**
```sql
-- Run this migration
ALTER TABLE users 
  ADD COLUMN is_pro BOOLEAN DEFAULT false,
  ADD COLUMN is_thuthimal BOOLEAN DEFAULT false,
  ADD COLUMN thuthimal_gifter TEXT;
```

**Part B: Badge UI (6 hours)**
- Create: `src/components/profile/ThuthimalBadge.tsx`
- Design: Elegant badge with lotus or flower icon
- Text: "Your Pro subscription is a gift of gratitude (තුතිමල්) from [name]"
- Position: Top of Profile screen or Self screen

**Files:**
- Create: `src/components/profile/ThuthimalBadge.tsx`
- Modify: `src/screens/ProfileScreen.tsx`
- Modify: `src/screens/SelfScreen.tsx` (show badge there too)

**Acceptance criteria:**
- [ ] Database fields exist
- [ ] Badge component designed
- [ ] Badge shows when `is_thuthimal = true`
- [ ] Displays gifter name or "anonymous"
- [ ] Sinhala text rendered correctly

---

### Task 3: Daily Content System ⚡ HIGH PRIORITY
**Effort:** 10 hours  
**Assignee:** [TBD]

**Part A: Database (2 hours)**
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

-- Insert sample content
INSERT INTO daily_content (type, content, date) VALUES
  ('motivation', 'Teaching is not about filling a bucket, but lighting a fire.', '2026-02-09'),
  ('did_you_know', 'The Socratic Method, still used today, was developed over 2,400 years ago.', '2026-02-09');
```

**Part B: API (2 hours)**
- Create: `src/lib/api/dailyContent.ts`
- Function: `getDailyContent(type, date)` - returns content for today

**Part C: UI (6 hours)**
- Create: `src/components/self/DailyContentCard.tsx`
- Design: Beautiful card at top of Self screen
- Shows one motivation quote
- Shows one "did you know?" fact
- Rotates daily (midnight)
- Tappable for full text

**Files:**
- Create: `src/lib/api/dailyContent.ts`
- Create: `src/components/self/DailyContentCard.tsx`
- Modify: `src/screens/SelfScreen.tsx`

**Acceptance criteria:**
- [ ] Database table created
- [ ] Sample content inserted (10+ quotes, 10+ facts)
- [ ] API fetches daily content
- [ ] UI displays at top of Self screen
- [ ] Content changes at midnight
- [ ] Beautiful, calm design

---

### Task 4: Profile Completion Progress ⚡ MEDIUM PRIORITY
**Effort:** 6 hours  
**Assignee:** [TBD]

**What to build:**
- Calculate completion percentage
- Display progress bar in Profile section
- Gentle nudge: "Complete your profile"

**Calculation logic:**
```typescript
const calculateCompletion = (user: User) => {
  const items = [
    { field: 'name', weight: 20 }, // required
    { field: 'role', weight: 20 }, // required
    { field: 'school', weight: 15 },
    { field: 'profile_photo', weight: 15 },
    { field: 'bio', weight: 15 },
    { field: 'subjects', weight: 15 }, // for teachers
  ];
  
  let score = 0;
  items.forEach(item => {
    if (user[item.field]) score += item.weight;
  });
  
  return score;
};
```

**Files:**
- Create: `src/components/profile/ProfileCompletion.tsx`
- Modify: `src/screens/ProfileScreen.tsx`
- Modify: `src/types/User.ts` (add `profile_completion` field)

**Acceptance criteria:**
- [ ] Progress bar shows completion %
- [ ] Updates as user fills profile
- [ ] "Skip" option available
- [ ] Not blocking, just encouraging

---

### Task 5: Onboarding Philosophy Screens ⚡ MEDIUM PRIORITY
**Effort:** 12 hours  
**Assignee:** [TBD]

**What to build:**
- 4-5 screens after name + role (mandatory)
- Skippable with "Skip" button
- Beautiful, calm, spacious design
- Can be revisited later

**Screens:**
1. Welcome to Gurudevi (vision)
2. Five Sections (Self, Classroom, Community, Library, Profile)
3. Ecological thinking (education as living system)
4. Privacy commitment (support, not surveillance)

**Files:**
- Create: `src/screens/onboarding/WelcomeScreen.tsx`
- Create: `src/screens/onboarding/FiveSectionsScreen.tsx`
- Create: `src/screens/onboarding/EcologyScreen.tsx`
- Create: `src/screens/onboarding/PrivacyScreen.tsx`
- Create: `src/navigation/OnboardingNavigator.tsx`
- Modify: `src/navigation/index.tsx` (add onboarding flow)

**Design:**
- One concept per screen
- Progress dots
- "Skip" button always visible
- "Next" / "Get Started" buttons
- Illustrations or icons (optional)

**Acceptance criteria:**
- [ ] Screens created and designed
- [ ] Navigation flow works
- [ ] Skippable but accessible later
- [ ] Saved: user has completed onboarding (flag)
- [ ] Beautiful, aligned with 02_DESIGN.md

---

## 📋 WEEK 2: Important Features (5 days)

### Task 6: Invitation Limits Enforcement
**Effort:** 4 hours  
**Assignee:** [TBD]

**What to build:**
- Enforce: Principals max 3 teacher invites in Alpha
- Disable: Teacher invitations in Alpha
- Show message when limit reached

**Logic:**
```typescript
const canCreateInvite = async (userId: string, role: string) => {
  const user = await getUser(userId);
  
  if (user.role === 'teacher') {
    return { allowed: false, message: 'Teacher invitations will be available in Beta' };
  }
  
  if (user.role === 'principal') {
    const count = await getInvitationCount(userId, 'teacher');
    if (count >= 3) {
      return { allowed: false, message: 'Alpha limit: Max 3 teacher invitations' };
    }
  }
  
  return { allowed: true };
};
```

**Files:**
- Modify: `src/lib/api/invitations.ts`
- Modify: `src/screens/ProfileScreen.tsx` (invite code generation)

**Acceptance criteria:**
- [ ] Principals limited to 3 teacher invites
- [ ] Teachers cannot create invites
- [ ] Clear error messages
- [ ] Counter shows "2 invites remaining"

---

### Task 7: Photo Upload with Principal Sharing
**Effort:** 10 hours  
**Assignee:** [TBD]

**Part A: Database (2 hours)**
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

**Part B: Upload UI (4 hours)**
- Photo picker integration
- Caption field (optional)
- Checkbox: "Share with principal"
- Upload to Supabase storage

**Part C: Gallery UI (4 hours)**
- Teacher sees their photos
- Principal sees shared photos
- Grid or list view
- Delete option (teachers only)

**Files:**
- Create: `src/components/classroom/PhotoUpload.tsx`
- Create: `src/components/classroom/PhotoGallery.tsx`
- Modify: `src/lib/api/classroom.ts`
- Modify: `src/screens/ClassroomDetailsScreen.tsx`

**Acceptance criteria:**
- [ ] Teachers can upload photos to classroom
- [ ] Optional caption
- [ ] Checkbox to share with principal
- [ ] Principals see shared photos
- [ ] Gallery view functional

---

### Task 8: Principal Attendance Dashboard
**Effort:** 10 hours  
**Assignee:** [TBD]

**What to build:**
- School-wide attendance percentage
- Per-class attendance trends
- Per-grade attendance patterns
- No individual student names (privacy)

**Queries:**
```sql
-- School-wide attendance (last 7 days)
SELECT 
  COUNT(CASE WHEN status = 'present' THEN 1 END)::FLOAT / 
  COUNT(*)::FLOAT * 100 as attendance_rate
FROM attendance
WHERE date >= CURRENT_DATE - INTERVAL '7 days'
  AND classroom_id IN (SELECT id FROM classrooms WHERE school_id = $1);

-- Per-class attendance
SELECT 
  c.name as class_name,
  COUNT(CASE WHEN a.status = 'present' THEN 1 END)::FLOAT / 
  COUNT(*)::FLOAT * 100 as rate
FROM attendance a
JOIN classrooms c ON a.classroom_id = c.id
WHERE c.school_id = $1
GROUP BY c.id, c.name
ORDER BY rate ASC;
```

**Files:**
- Create: `src/components/admin/AttendanceDashboard.tsx`
- Modify: `src/lib/api/attendance.ts`
- Modify: `src/screens/ClassroomScreen.tsx` (principal view)

**Acceptance criteria:**
- [ ] Dashboard shows school attendance %
- [ ] Shows per-class breakdown
- [ ] Date range selector (7/30 days)
- [ ] No individual student names visible
- [ ] Trend indicators (up/down)

---

### Task 9: In-App Notifications
**Effort:** 12 hours  
**Assignee:** [TBD]

**Part A: Database (2 hours)**
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Part B: API (4 hours)**
- Create: `src/lib/api/notifications.ts`
- Functions: `createNotification`, `getNotifications`, `markAsRead`
- Triggers for: invitation received, profile linked, Thuthimal received

**Part C: UI (6 hours)**
- Bell icon in header with badge (unread count)
- Notification list screen
- Mark as read
- Tap to navigate to relevant screen

**Files:**
- Create: `src/lib/api/notifications.ts`
- Create: `src/components/shared/NotificationBell.tsx`
- Create: `src/screens/NotificationsScreen.tsx`
- Modify: `src/navigation/index.tsx` (add notifications route)

**Acceptance criteria:**
- [ ] Bell icon shows unread count
- [ ] Notification list displays
- [ ] Mark as read functionality
- [ ] Tap opens relevant screen
- [ ] Real-time updates (polling or subscription)

---

### Task 10: Auto-Generated QR Context Text
**Effort:** 3 hours  
**Assignee:** [TBD]

**What to build:**
- When generating QR code, include contextual text
- Format: "Join [School Name] teachers on Gurudevi — invited by [Inviter Name]"

**Logic:**
```typescript
const generateInviteText = (school: string, inviterName: string, role: string) => {
  const roleText = role === 'teacher' ? 'teachers' : 'students';
  return `Join ${school} ${roleText} on Gurudevi — invited by ${inviterName}`;
};
```

**Files:**
- Modify: `src/lib/api/invitations.ts`
- Modify: `src/screens/ProfileScreen.tsx` (QR generation)

**Acceptance criteria:**
- [ ] QR code includes context text
- [ ] Text personalizes per school
- [ ] Displays on QR share screen
- [ ] Copyable text

---

## 🚨 Critical Path Items (Must-Have for Alpha)

1. **Bulk Student Creation** - Teachers need efficient onboarding
2. **Thuthimal** - Core differentiator, unique value prop
3. **Daily Content** - Engagement and teacher support
4. **Onboarding Screens** - First impression, philosophy communication
5. **Invitation Limits** - Alpha scoping requirement

---

## 📊 Testing Checklist

Before Alpha launch:
- [ ] All 10 features tested on iOS
- [ ] All 10 features tested on Android
- [ ] No TypeScript errors
- [ ] No console warnings
- [ ] Accessibility attributes added
- [ ] Privacy review complete
- [ ] Performance acceptable (FlatList, not ScrollView)
- [ ] Error boundaries in place

---

## 📈 Success Metrics to Track

From Alpha launch:
- Number of principals who join
- Number of teachers invited
- Student profiles created (bulk vs. individual)
- Attendance marking frequency
- Daily content views
- Profile completion rates
- Thuthimal gifts (manual tracking in Alpha)

---

## 🔗 Resources

- **Full PRD:** `/apps/edlove-web/Docs/11_COMPLETE_PRD.md`
- **Alpha Requirements:** `/apps/gurudevi-mobile/ALPHA_REQUIREMENTS.md`
- **App Analysis:** `/apps/gurudevi-mobile/COMPREHENSIVE_APP_ANALYSIS.md`
- **Quick Reference:** `/apps/gurudevi-mobile/QUICK_REFERENCE.md`
- **Design System:** `/apps/edlove-web/Docs/02_DESIGN.md`

---

**Last Updated:** February 8, 2026  
**Target Launch:** February 22, 2026 (2 weeks)  
**Team:** [Assign developers to tasks]
