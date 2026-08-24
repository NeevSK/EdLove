---
title: "ðŸš€ Community & Library Implementation Plan"
status: "active"
created: 2026-02-19
updated: 2026-02-19
author: "Naveen"
scribe: "opencode"
tags: [apps, gurudevi-mobile, historical]
---

# 🚀 Community & Library Implementation Plan
## Minimal Changes to Enable Ecological Education System

**Goal**: Fix broken feedback loops and enable community/library features that respect ecological systems philosophy with minimal code changes.

---

## 🎯 Priority 1: Core Data Models & API (Week 1)

### A. Extend Community API

**File**: `src/lib/api/community.ts`

Add to existing API:
```typescript
// 1. Enhanced Post Types
export interface CommunityPost {
  id: string
  author_id: string
  author_name: string
  author_role: 'student' | 'teacher' | 'principal'
  content: string
  
  // New fields
  post_type: 'question' | 'resource' | 'feedback' | 'announcement' | 'discussion'
  visibility: 'class' | 'grade' | 'school' | 'teachers_only'
  subject?: string
  tags: string[]
  is_anonymous: boolean
  urgency?: 'low' | 'medium' | 'high'
  
  // For questions
  has_accepted_answer?: boolean
  accepted_answer_id?: string
  
  // For feedback
  feedback_status?: 'pending' | 'under_review' | 'implemented' | 'declined'
  
  // Engagement
  reactions: Record<string, number>
  comment_count: number
  
  // Metadata
  group_id?: string
  classroom_id?: string
  created_at: string
  updated_at: string
}

// 2. Comments System
export interface Comment {
  id: string
  post_id: string
  author_id: string
  author_name: string
  author_role: 'student' | 'teacher' | 'principal'
  content: string
  is_anonymous: boolean
  
  // For answers
  is_official_answer: boolean  // Teacher-marked
  upvotes: number
  
  created_at: string
}

// 3. API Functions to Add
export const communityAPI = {
  // Posts
  async getPosts(filters: PostFilters): Promise<CommunityPost[]>
  async createPost(post: CreatePostInput): Promise<CommunityPost>
  async updatePost(postId: string, updates: Partial<CommunityPost>): Promise<CommunityPost>
  
  // Comments/Answers
  async getComments(postId: string): Promise<Comment[]>
  async addComment(postId: string, content: string, isAnonymous: boolean): Promise<Comment>
  async markOfficialAnswer(commentId: string): Promise<Comment>
  async upvoteComment(commentId: string): Promise<void>
  
  // Moderation
  async updateFeedbackStatus(postId: string, status: string, response?: string): Promise<void>
}
```

### B. Create Library API

**File**: `src/lib/api/library.ts` (NEW)

```typescript
export interface LibraryResource {
  id: string
  title: string
  description: string
  type: 'pdf' | 'video' | 'link' | 'note' | 'lesson_plan' | 'activity'
  url?: string
  file_path?: string
  
  // Categorization
  subject: string
  topics: string[]
  grades: number[]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  language: 'english' | 'sinhala' | 'tamil'
  
  // Permissions
  visibility: 'private' | 'class' | 'grade' | 'school' | 'public'
  creator_id: string
  creator_role: 'student' | 'teacher' | 'principal'
  
  // Quality
  verified: boolean
  verified_by?: string
  curriculum_aligned: boolean
  
  // Engagement
  views: number
  uses_count: number
  endorsements: number
  bookmarks: number
  
  // Metadata
  tags: string[]
  created_at: string
  updated_at: string
}

export interface ResourceCollection {
  id: string
  name: string
  description: string
  creator_id: string
  visibility: 'private' | 'class' | 'grade' | 'school'
  resource_ids: string[]
  sequence_order: number[]
  
  subject: string
  grades: number[]
  estimated_duration: string
  
  forks: number
  used_by: number
  endorsements: number
  
  created_at: string
  updated_at: string
}

export const libraryAPI = {
  // Resources
  async getResources(filters: ResourceFilters): Promise<LibraryResource[]>
  async getResourceById(id: string): Promise<LibraryResource>
  async createResource(resource: CreateResourceInput): Promise<LibraryResource>
  async updateResource(id: string, updates: Partial<LibraryResource>): Promise<LibraryResource>
  async deleteResource(id: string): Promise<void>
  
  // Engagement
  async endorseResource(id: string): Promise<void>
  async bookmarkResource(id: string): Promise<void>
  async verifyResource(id: string, verifiedBy: string): Promise<LibraryResource>
  async trackView(id: string): Promise<void>
  async trackUse(id: string, classroomId?: string): Promise<void>
  
  // Collections
  async getCollections(filters: CollectionFilters): Promise<ResourceCollection[]>
  async createCollection(collection: CreateCollectionInput): Promise<ResourceCollection>
  async addToCollection(collectionId: string, resourceId: string): Promise<void>
  async forkCollection(collectionId: string): Promise<ResourceCollection>
}
```

---

## 🎯 Priority 2: UI Components (Week 2)

### A. Enhanced Community Components

#### 1. Post Type Selector (NEW)
**File**: `src/components/community/PostTypeSelector.tsx`
- Buttons for: Question, Resource, Feedback, Discussion
- Icons and descriptions for each type
- Sets post_type in CreatePostModal

#### 2. Enhanced CreatePostModal
**File**: `src/components/community/CreatePostModal.tsx`
- Add post type selection
- Add subject dropdown (Math, Science, etc.)
- Add visibility selector (Class, Grade, School)
- Add anonymous toggle
- Add urgency selector (for questions)
- Add tags input

#### 3. Question Post Card (NEW)
**File**: `src/components/community/QuestionCard.tsx`
- Show question with urgency indicator
- Show answer count
- Show "Answered" checkmark if has accepted answer
- Click to expand to see answers
- Upvote buttons on answers
- "Mark as Answer" button (teachers only)

#### 4. Feedback Post Card (NEW)
**File**: `src/components/community/FeedbackCard.tsx`
- Show feedback with status badge
- Principal response section
- Status: Pending → Under Review → Implemented/Declined
- Vote/support button

#### 5. Comments/Answers Section (NEW)
**File**: `src/components/community/CommentsSection.tsx`
- List of comments with author info
- Upvote buttons
- "Official Answer" badge
- Add comment input
- Anonymous toggle for comments

### B. Enhanced Library Components

#### 1. Resource Filters (NEW)
**File**: `src/components/library/ResourceFilters.tsx`
- Subject filter chips
- Grade selector
- Type selector (Video, PDF, etc.)
- Difficulty selector
- "Verified Only" toggle
- Sort options (Recent, Most Used, Most Endorsed)

#### 2. Enhanced LibraryResourceCard
**File**: `src/components/library/LibraryResourceCard.tsx`
- Show resource type icon
- Show verified badge (if applicable)
- Show subject and grade tags
- Show engagement metrics (views, uses, endorsements)
- Actions: View, Bookmark, Endorse, Share
- Creator info

#### 3. Resource Detail Modal (NEW)
**File**: `src/components/library/ResourceDetailModal.tsx`
- Full resource description
- Preview (if applicable)
- Creator profile link
- Endorsements list
- Comments/reviews section
- "Add to Collection" button
- "Verify" button (teachers/principals only)

#### 4. Collection Card (NEW)
**File**: `src/components/library/CollectionCard.tsx`
- Collection name and description
- Resource count
- Creator info
- Subject and grade badges
- "Use in Class" button
- "Fork" button
- Endorsements count

#### 5. Create Collection Modal (NEW)
**File**: `src/components/library/CreateCollectionModal.tsx`
- Collection name and description
- Add resources (multi-select)
- Reorder resources (sequence)
- Set visibility
- Set subject and grades

---

## 🎯 Priority 3: Enhanced Screens (Week 3)

### A. CommunityScreen Enhancements
**File**: `src/screens/CommunityScreen.tsx`

Changes:
```typescript
// Add more tabs
type TabType = 'feed' | 'questions' | 'groups' | 'feedback'

// Add filtering by role visibility
const filteredPosts = posts.filter(post => {
  // Teachers see all, students see appropriate visibility
  if (userRole === 'teacher' || userRole === 'principal') return true
  return post.visibility !== 'teachers_only'
})

// Add post type filtering
const [selectedPostType, setSelectedPostType] = useState<string>('all')

// Render different card types based on post_type
{posts.map(post => {
  if (post.post_type === 'question') return <QuestionCard {...post} />
  if (post.post_type === 'feedback') return <FeedbackCard {...post} />
  return <PostCard {...post} />
})}
```

### B. LibraryScreen Enhancements
**File**: `src/screens/LibraryScreen.tsx`

Changes:
```typescript
// Replace MOCK_RESOURCES with real API
import { libraryAPI } from '../lib/api/library'
import { useQuery } from '@tanstack/react-query'

const { data: resources, isLoading } = useQuery({
  queryKey: ['library', filters],
  queryFn: () => libraryAPI.getResources(filters)
})

// Add tabs
type TabType = 'resources' | 'collections' | 'my_desk'

// Add filtering UI
const [filters, setFilters] = useState({
  subject: null,
  grade: null,
  type: null,
  verified_only: false
})

// Render with filters
<ResourceFilters filters={filters} onChange={setFilters} />
```

### C. New Screen: QuestionDetailScreen (NEW)
**File**: `src/screens/community/QuestionDetailScreen.tsx`
- Full question display
- All answers/comments
- Add answer input
- Upvote buttons
- Mark official answer (teachers)
- Related questions section

### D. New Screen: ResourceDetailScreen (NEW)
**File**: `src/screens/library/ResourceDetailScreen.tsx`
- Full resource display
- Preview/iframe if applicable
- Comments/reviews
- Related resources
- "Use in Class" tracking
- Share options

---

## 🎯 Priority 4: Feedback Mechanisms (Week 4)

### A. Student → Teacher Feedback

#### 1. Quick Polls Component (NEW)
**File**: `src/components/classroom/QuickPoll.tsx`
- Teacher creates quick poll: "Did you understand today's lesson?"
- Students respond (1-5 scale)
- Results shown to teacher only
- Anonymous by default

#### 2. Concept Difficulty Ratings (NEW)
**File**: `src/components/classroom/ConceptRatings.tsx`
- After each lesson/topic
- Students rate difficulty (1-5)
- Aggregated heatmap for teacher
- Shows which concepts need review

#### 3. Anonymous Question Queue (NEW)
**File**: `src/components/classroom/QuestionQueue.tsx`
- Students can post questions anonymously
- Teacher sees queue during/after class
- Can answer publicly or one-on-one

### B. Teacher → Principal Feedback

#### 1. Teachers Lounge (NEW)
**File**: `src/screens/community/TeachersLounge.tsx`
- Private community space for teachers
- Discussion threads
- Policy feedback section
- Resource sharing
- Professional development requests

#### 2. Principal's Inbox (NEW)
**File**: `src/screens/community/PrincipalInbox.tsx`
- Anonymous feedback submission for teachers
- Categorized (Policy, Resources, Workload, Culture)
- Principal can respond or take action
- Status tracking

#### 3. Feedback Pulse (NEW)
**File**: `src/components/principal/FeedbackPulse.tsx`
- Weekly pulse check for teachers
- 3 quick questions (how's your week, any blockers, suggestions)
- Anonymous, aggregated results for principal

---

## 🎯 Priority 5: Recognition System (Week 5)

### A. Contribution Tracking
**File**: `src/lib/api/recognition.ts` (NEW)

```typescript
export interface Contribution {
  user_id: string
  type: 'question_answered' | 'resource_shared' | 'resource_endorsed' | 
        'helpful_comment' | 'feedback_given' | 'collection_created'
  count: number
  recent_examples: string[]
}

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  criteria: string
  awarded_to: string[]
}

export const recognitionAPI = {
  async getContributions(userId: string): Promise<Contribution[]>
  async getBadges(userId: string): Promise<Badge[]>
  async checkAndAwardBadges(userId: string): Promise<Badge[]>
}
```

**Badges** (non-competitive):
- Helpful Guide (10+ questions answered)
- Resource Hunter (5+ resources shared)
- Community Builder (50+ posts/comments)
- Peer Tutor (consistently helpful in subject)
- Collaborative Teacher (shares resources regularly)
- Student Advocate (responsive to student questions)

### B. Contributions Widget
**File**: `src/components/profile/ContributionsWidget.tsx`
- Shows user's contributions (not competitive ranking)
- Badges earned with descriptions
- Recent helpful actions
- "Thank you" messages from others

---

## 🎯 Priority 6: Ecosystem Health Dashboard (Week 6)

### A. Principal Dashboard
**File**: `src/screens/principal/EcosystemDashboard.tsx` (NEW)

Metrics shown:
```typescript
// Engagement
- Active users (daily/weekly)
- Posts per week
- Questions asked & answered (with ratio)
- Resources added & used

// Feedback Health
- Student feedback submissions
- Teacher feedback submissions
- Response rate & time
- Feedback status distribution

// Community Health
- Collaboration index (cross-classroom interactions)
- Voice distribution (student vs teacher posts)
- Unanswered questions (48h threshold)
- Resource gaps (subjects with few resources)

// Warning Signals
- 🔴 Students not getting help (unanswered questions)
- 🔴 Teacher burnout indicators
- 🔴 Low participation in certain grades
```

**Visualization**:
- Line charts (trends over time)
- Distribution charts (participation by role)
- Heat maps (activity by day/time)
- Alert cards (warning signals)

---

## 🎯 Priority 7: Database Schema (Foundation)

### Supabase Tables to Add/Modify

```sql
-- 1. Enhance community_posts table
ALTER TABLE community_posts ADD COLUMN post_type VARCHAR(20) DEFAULT 'discussion';
ALTER TABLE community_posts ADD COLUMN visibility VARCHAR(20) DEFAULT 'school';
ALTER TABLE community_posts ADD COLUMN subject VARCHAR(50);
ALTER TABLE community_posts ADD COLUMN tags TEXT[];
ALTER TABLE community_posts ADD COLUMN is_anonymous BOOLEAN DEFAULT false;
ALTER TABLE community_posts ADD COLUMN urgency VARCHAR(10);
ALTER TABLE community_posts ADD COLUMN has_accepted_answer BOOLEAN DEFAULT false;
ALTER TABLE community_posts ADD COLUMN accepted_answer_id UUID;
ALTER TABLE community_posts ADD COLUMN feedback_status VARCHAR(20);
ALTER TABLE community_posts ADD COLUMN classroom_id UUID REFERENCES classrooms(id);

-- 2. Create comments table
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
  author_id UUID REFERENCES users(id),
  author_name VARCHAR(255),
  author_role VARCHAR(20),
  content TEXT,
  is_anonymous BOOLEAN DEFAULT false,
  is_official_answer BOOLEAN DEFAULT false,
  upvotes INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. Create library_resources table
CREATE TABLE library_resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50) NOT NULL,
  url TEXT,
  file_path TEXT,
  
  subject VARCHAR(100),
  topics TEXT[],
  grades INTEGER[],
  difficulty VARCHAR(20),
  language VARCHAR(20),
  
  visibility VARCHAR(20) DEFAULT 'school',
  creator_id UUID REFERENCES users(id),
  creator_role VARCHAR(20),
  
  verified BOOLEAN DEFAULT false,
  verified_by UUID REFERENCES users(id),
  curriculum_aligned BOOLEAN DEFAULT false,
  
  views INTEGER DEFAULT 0,
  uses_count INTEGER DEFAULT 0,
  endorsements INTEGER DEFAULT 0,
  bookmarks INTEGER DEFAULT 0,
  
  tags TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 4. Create resource_collections table
CREATE TABLE resource_collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  creator_id UUID REFERENCES users(id),
  visibility VARCHAR(20) DEFAULT 'private',
  resource_ids UUID[],
  sequence_order INTEGER[],
  
  subject VARCHAR(100),
  grades INTEGER[],
  estimated_duration VARCHAR(50),
  
  forks INTEGER DEFAULT 0,
  used_by INTEGER DEFAULT 0,
  endorsements INTEGER DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 5. Create resource_engagements table (for tracking)
CREATE TABLE resource_engagements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  resource_id UUID REFERENCES library_resources(id),
  user_id UUID REFERENCES users(id),
  engagement_type VARCHAR(20), -- 'view', 'use', 'endorse', 'bookmark'
  classroom_id UUID REFERENCES classrooms(id), -- for 'use' tracking
  created_at TIMESTAMP DEFAULT NOW()
);

-- 6. Create comment_upvotes table
CREATE TABLE comment_upvotes (
  comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (comment_id, user_id)
);

-- 7. Create contributions table
CREATE TABLE contributions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  contribution_type VARCHAR(50),
  reference_id UUID, -- ID of post, comment, resource, etc.
  created_at TIMESTAMP DEFAULT NOW()
);

-- 8. Create badges table
CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  criteria VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 9. Create user_badges table
CREATE TABLE user_badges (
  user_id UUID REFERENCES users(id),
  badge_id UUID REFERENCES badges(id),
  awarded_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (user_id, badge_id)
);
```

---

## 📊 Implementation Checklist

### Week 1: Foundation
- [ ] Create Supabase migration with new tables
- [ ] Create `library.ts` API module
- [ ] Extend `community.ts` API with new functions
- [ ] Update types in `src/types/`
- [ ] Test API functions with mock data

### Week 2: Core UI
- [ ] Create PostTypeSelector component
- [ ] Enhance CreatePostModal
- [ ] Create QuestionCard component
- [ ] Create FeedbackCard component
- [ ] Create CommentsSection component
- [ ] Create ResourceFilters component
- [ ] Enhance LibraryResourceCard component

### Week 3: Screens
- [ ] Enhance CommunityScreen with tabs and filtering
- [ ] Enhance LibraryScreen with real API
- [ ] Create QuestionDetailScreen
- [ ] Create ResourceDetailScreen
- [ ] Create TeachersLounge screen

### Week 4: Feedback Tools
- [ ] Create QuickPoll component
- [ ] Create ConceptRatings component
- [ ] Create QuestionQueue component
- [ ] Create PrincipalInbox screen
- [ ] Create FeedbackPulse component

### Week 5: Recognition
- [ ] Create recognition API
- [ ] Create badge definitions
- [ ] Create ContributionsWidget
- [ ] Add badge checking logic
- [ ] Show contributions on profile

### Week 6: Analytics
- [ ] Create EcosystemDashboard
- [ ] Create metrics aggregation queries
- [ ] Create visualization components
- [ ] Add warning signal detection
- [ ] Create principal reporting

---

## 🧪 Testing Strategy

### Manual Testing
- [ ] Post creation for each type
- [ ] Comment/answer flow
- [ ] Upvoting and official answers
- [ ] Resource upload and categorization
- [ ] Collection creation and forking
- [ ] Feedback submission and status updates
- [ ] Badge awarding logic

### User Testing
- [ ] Test with student persona
- [ ] Test with teacher persona
- [ ] Test with principal persona
- [ ] Collect feedback on usability
- [ ] Iterate on UI/UX

---

## 🚀 Launch Checklist

### Pre-Launch
- [ ] Database migrations applied
- [ ] All API endpoints tested
- [ ] UI components responsive
- [ ] Error handling in place
- [ ] Loading states implemented
- [ ] Empty states designed

### Launch
- [ ] Deploy database changes
- [ ] Deploy app updates
- [ ] Seed initial data (badges, categories)
- [ ] Train pilot users
- [ ] Monitor metrics

### Post-Launch
- [ ] Collect user feedback
- [ ] Monitor ecosystem health metrics
- [ ] Iterate on feedback
- [ ] Add requested features
- [ ] Optimize performance

---

This implementation plan balances philosophical vision with practical development, focusing on minimal changes that enable maximum ecological benefit. Each feature directly addresses broken feedback loops and enables the polycentric, autopoietic educational ecosystem described in the philosophical framework.
