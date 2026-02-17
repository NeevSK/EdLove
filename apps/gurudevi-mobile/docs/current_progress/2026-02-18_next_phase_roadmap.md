# Gurudevi Next Phase: Sanctuary Refinement & Growth 🌸

## Vision

Transform Gurudevi from a functional MVP into a polished, role-aware, gamified sanctuary where every user—teacher, student, principal—discovers features organically through a treasure hunt experience, with seamless QR integration and context-aware UI.

---

## Phase 1: Critical Guest & Role UX Fixes 🚨

**Priority**: HIGH | **Estimated**: 3-4 days

### 1.1 Guest Error Elimination
- [ ] **Audit all sections** for RLS/fetch errors in guest mode
  - Self: Timetable, Mood, Journal, Energy, Wisdom
  - Classroom: List, Details, Students, Assignments
  - Community: Feed, Groups, Announcements
  - Library: Browse, Collections, Search
- [ ] **Add grace fallbacks** for all database queries
  - Show "Create account to sync" instead of errors
  - Empty states with conversion prompts
  - Skeleton loaders during fetch
- [ ] **Test each role** (teacher, student, principal) in guest mode

### 1.2 Role-Based Feature Visibility
- [ ] Create `useRoleFeatures` hook mapping features to roles
- [ ] **Teacher-only features**:
  - Classroom management
  - Assignment creation
  - Student roster
  - "Online Teachers" → remains
- [ ] **Student features**:
  - Classroom enrollment
  - Assignment submission
  - "Online Teachers" → rename to "Online Students"
  - Study groups & peer connections
- [ ] **Principal features**:
  - School management
  - Section/grade hierarchy
  - Analytics dashboard
  - Staff directory
- [ ] **Universal features**:
  - Self section (all)
  - Library browsing
  - Community feed
  - Profile management

### 1.3 Delete App Button
- [ ] Implement account deletion workflow
  - Confirmation modal with consequences explanation
  - Optional feedback form
  - Data export option before deletion
  - RPC function for cascading user data deletion
  - Anonymous conversion: just clear local storage

---

## Phase 2: UI Polish & Visual Consistency ✨

**Priority**: HIGH | **Estimated**: 4-5 days

### 2.1 Theme Consistency (Light Mode Fixes)
- [ ] **Audit all text inputs** for dark fill-ins in light theme
  - Update `GlassInput`, `TextField` components
  - Ensure proper contrast ratios (WCAG AA)
  - Test across Self, Classroom, Profile screens
- [ ] **Audit all cards/boxes** for background consistency
  - `SanctuaryCard` light theme refinement
  - Modal backgrounds
  - Bottom sheet styling

### 2.2 Self Section Dynamic UI

#### ID Card Improvements
- [ ] **Dynamic role display** based on `user.role`
  - Teacher → "Teacher 🌱"
  - Student → "Student 📚"
  - Principal → "Principal 🏛️"
- [ ] **"Next" button** → rename to "Full View" or "View Profile"
- [ ] **Detach stat card** from ID card
  - Make stat card a separate, independent component
  - Position below ID card with spacing

#### Stat Card Gamification
- [ ] **Initialize at zero** for new users
- [ ] **Track milestone actions**:
  - ✅ Joined app: +10 points
  - ✅ Explored Self section: +5 points
  - ✅ Explored Classroom section: +5 points
  - ✅ Explored Community section: +5 points
  - ✅ Explored Library section: +5 points
  - ✅ Used FAB to create something: +10 points
  - ✅ Created account (guest → auth): +20 points
  - ✅ Completed profile: +15 points
  - ✅ First timetable entry: +10 points
  - ✅ First mood log: +10 points
  - ✅ First journal entry: +15 points
- [ ] Store in `user_rewards` table with `feature_usage_log`
- [ ] Display progress ring or level-up animation

### 2.3 Header & Navigation Polish
- [ ] **Remove hexagon** behind FAB button
- [ ] **Replace profile red dot** with notification bell icon
  - Add subtle pulse animation when notifications exist
  - Badge count for unread notifications
- [ ] **Pagination loading** for all sections
  - Infinite scroll with skeleton loaders
  - "Load more" buttons where appropriate
  - Pull-to-refresh on all main screens

### 2.4 Profile Screen Enhancements
- [ ] Add **"About this App"** row
  - Opens modal with app vision, credits, changelog
  - Link to privacy policy & terms
- [ ] Add **"I Love This App ❤️"** row
  - Opens rating/review modal
  - Link to App Store/Play Store
- [ ] Add **"Support This App 💛"** row
  - Ko-fi/Buy Me a Coffee integration
  - Links to feature request board
  - Community contribution options

---

## Phase 3: Gamified Treasure Hunt System 🎁

**Priority**: MEDIUM | **Estimated**: 3-4 days

### 3.1 Exploration Rewards System
- [ ] **Track user exploration** in `feature_usage_log`
- [ ] **Hidden achievements** scattered across app
  - "Sanctuary Seeker" - Visit all 4 main sections
  - "Early Riser" - Log mood before 8 AM
  - "Rhythm Keeper" - Complete timetable for full week
  - "Wisdom Collector" - Save 5 library items
  - "Community Builder" - Join 3 groups
  - "QR Hunter" - Scan first QR code
- [ ] **Reward types**:
  - Points for leaderboard
  - Unlock custom themes
  - Unlock avatar borders
  - Unlock premium features (time-limited)
  - Easter egg animations

### 3.2 Guided Discovery Flow
- [ ] **Subtle hints** for unexplored features
  - Gentle tooltip on first app launch
  - Pulsing indicators on undiscovered sections
  - "Did you know?" cards in Home/Self
- [ ] **Progress tracker**
  - % of app explored
  - Next milestone preview
  - Achievement gallery

---

## Phase 4: QR Code Integration 🔲

**Priority**: MEDIUM | **Estimated**: 3-4 days

### 4.1 QR Infrastructure
- [ ] Install `expo-camera` and QR scanning library
- [ ] Create `QRScanner` component with camera permissions
- [ ] Create `QRDisplay` component for showing QR codes
- [ ] Create `QRShareSheet` for sharing QR codes

### 4.2 QR Use Cases

#### Classroom QR
- [ ] **Generate classroom join QR**
  - Encodes: `gurudevi://classroom/{id}/join`
  - Students scan to enroll
  - Teachers share via image/link
- [ ] **Assignment QR**
  - Quick submission via QR scan
  - Links to assignment details

#### School QR
- [ ] **School invitation QR**
  - Encodes: `gurudevi://school/{id}/invite?code={code}`
  - Principals share for staff onboarding

#### Profile QR
- [ ] **Personal QR code** in profile
  - Encodes: `gurudevi://user/{id}/connect`
  - Quick friend/colleague connections
  - Share your sanctuary

#### Library QR
- [ ] **Resource sharing QR**
  - Share library items via QR
  - Quick add to collections

### 4.3 QR Scanner Flow
- [ ] FAB option: "Scan QR"
- [ ] Handles all QR types with deep linking
- [ ] Error handling for invalid/expired codes

---

## Phase 5: Enhanced School & Classroom Creation 🏫

**Priority**: MEDIUM | **Estimated**: 2-3 days

### 5.1 School Creation Wizard (Principals)
- [ ] **Multi-step form**:
  - Step 1: Basic Info (name, contact)
  - Step 2: Location (province dropdown, district, city)
  - Step 3: School Type (comprehensive)
    - Government: 1AB, 1C, Type 2, Type 3
    - Semi-Government
    - Private: National, International
    - Pirivena
    - Special categories
  - Step 4: Hierarchy Setup
    - Section structure (Primary, Secondary, Collegiate)
    - Grade ranges
    - Optional: Department structure
- [ ] **Province data**:
  - Western, Central, Southern, Northern, Eastern, North Western, North Central, Uva, Sabaragamuwa
  - District dropdown based on province
  - City autocomplete

### 5.2 Classroom Creation Enhancement (Teachers)
- [ ] **Detailed creation form**:
  - Classroom name
  - Subject (with autocomplete from common subjects)
  - Grade level
  - Section (if applicable)
  - Description
  - Color theme picker
  - Cover image upload
- [ ] **Smart defaults** based on school hierarchy
- [ ] **Bulk import** option via CSV/Excel

---

## Phase 6: Community & Library Redesign 📚

**Priority**: MEDIUM | **Estimated**: 4-5 days

### 6.1 Community Reorganization
- [ ] **Tab-based navigation**:
  - Feed (all posts)
  - Groups (joined groups)
  - Announcements (school)
  - People (discover colleagues)
- [ ] **Improved post types**:
  - Rich text editor
  - Image attachments (Cloudinary)
  - Polls with voting
  - Event posts (date, RSVP)
- [ ] **Better discovery**:
  - Suggested groups
  - Trending discussions
  - School leaderboard

### 6.2 Library Redesign
- [ ] **Category-based browsing**:
  - Lesson Plans
  - Worksheets
  - Videos
  - Articles
  - Templates
- [ ] **Enhanced search**:
  - Filter by subject, grade, resource type
  - Tags system
  - Bookmarking
- [ ] **Collections**:
  - Teacher's Desk (personal)
  - Shared collections
  - Curated playlists (admin)
- [ ] **Upload flow**:
  - Drag-and-drop
  - Cloudinary integration
  - Auto-generate thumbnails

---

## Phase 7: Product Visionary Bonus Features 💡

**Priority**: LOW | **Estimated**: 5-7 days

### 7.1 AI-Powered Insights
- [ ] **Mood pattern analysis**
  - Weekly mood trends graph
  - Personalized wellness tips
  - Suggest mindfulness breaks
- [ ] **Timetable optimization**
  - Detect heavy teaching days
  - Suggest relief period swaps
  - Work-life balance scoring

### 7.2 Collaboration Features
- [ ] **Co-teaching support**
  - Invite co-teachers to classrooms
  - Shared lesson planning
  - Split grading duties
- [ ] **Peer observation**
  - Schedule classroom visits
  - Share feedback forms
  - Professional development log

### 7.3 Student Empowerment (Student Role)
- [ ] **Study buddy matching**
  - Find peers in same subjects
  - Form study groups
  - Peer tutoring marketplace
- [ ] **Assignment tracker**
  - Due date calendar
  - Priority sorting
  - Submission checklist

### 7.4 Principal Dashboard
- [ ] **School analytics**
  - Teacher engagement metrics
  - Student performance overview (aggregate)
  - Resource usage stats
- [ ] **Announcement scheduler**
  - Schedule posts for future
  - Pinned announcements
  - Multi-language support

### 7.5 Offline-First Architecture
- [ ] **Service worker** for web version
- [ ] **Sync queue** for mobile
  - Queue actions when offline
  - Auto-sync when back online
  - Conflict resolution UI

### 7.6 Accessibility & Inclusion
- [ ] **Screen reader** optimization
- [ ] **Dyslexia-friendly** font option
- [ ] **High contrast** mode
- [ ] **Voice navigation** (experimental)
- [ ] **RTL support** for Sinhala/Tamil

---

## Implementation Schedule

### Week 1-2: Critical Fixes
- Phase 1: Guest UX & Role Features

### Week 3-4: Polish & Shine
- Phase 2: UI Consistency & Self Section Polish
- Phase 3: Treasure Hunt System

### Week 5-6: Advanced Features
- Phase 4: QR Integration
- Phase 5: Enhanced Creation Flows

### Week 7-8: Expansion
- Phase 6: Community & Library Redesign

### Week 9+: Innovation
- Phase 7: Visionary Features (iterative)

---

## Success Metrics

- **Guest Conversion**: 30%+ guest → authenticated
- **Daily Active Users**: 50%+ of registered users
- **Feature Discovery**: 80%+ users explore all 4 sections
- **Engagement**: Avg 10+ interactions per session
- **Satisfaction**: 4.5+ star rating on stores
- **Treasure Hunt**: 60%+ complete first 5 achievements

---

## Next Immediate Actions

1. **Fix guest errors** in all sections (Phase 1.1)
2. **Implement role-based features** (Phase 1.2)
3. **Polish Self section UI** (Phase 2.2)
4. **Begin treasure hunt system** (Phase 3.1)

**Let's build a sanctuary worth exploring! 🌸✨**
