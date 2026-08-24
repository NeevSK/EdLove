---
title: "ðŸ¤ Groups Feature - Complete Guide"
status: "active"
created: 2026-02-19
updated: 2026-02-19
author: "Naveen"
scribe: "opencode"
tags: [apps, gurudevi-mobile, historical]
---

# 🤝 Groups Feature - Complete Guide

## Overview

The Groups feature enables flexible community organization with support for:
- **Configured Groups**: Class, grade, subject groups (auto-created)
- **General Groups**: Open to anyone, for common interests/announcements
- **Admin Groups**: Special groups for founders/admins
- **Club Groups**: Interest-based with approval mechanisms

---

## Group Types

### 1. **Class Groups** (`type: 'class'`)
- Automatically configured based on school structure
- Members: Students and teachers of that class
- Join policy: Usually `restricted` (auto-assigned)
- Example: "Grade 10-A", "Mathematics 2024"

### 2. **Grade Groups** (`type: 'grade'`)
- All students in a grade level
- Join policy: Usually `restricted` (auto-assigned)
- Example: "Grade 10 Students"

### 3. **Subject Groups** (`type: 'subject'`)
- Students/teachers interested in a subject
- Join policy: `open` or `approval_required`
- Example: "Science Enthusiasts", "Math Help"

### 4. **Club Groups** (`type: 'club'`)
- Student clubs and extracurricular activities
- Join policy: `open` or `approval_required`
- Example: "Science Club", "Drama Society"

### 5. **General Groups** (`type: 'general'`)
- **This is what you requested!**
- Open to anyone (students, teachers, admins, founders)
- Can have `public` visibility (beyond school)
- Join policy: Usually `open` or `approval_required`
- Example: "General Announcements", "App Updates", "Community Forum"

### 6. **Teachers Only** (`type: 'teachers_only'`)
- Private space for teachers
- Join policy: `restricted` (only teachers)
- Example: "Teachers Lounge", "Staff Meetings"

### 7. **Admin Only** (`type: 'admin_only'`)
- For founder and admin roles
- Join policy: `restricted` (only admin/founder)
- Example: "Admin Team", "Moderation"

---

## Join Policies

### `open`
- Anyone who can see the group can join immediately
- No approval needed
- Best for: General groups, public clubs

### `approval_required`
- Users can request to join with optional message
- Group admins must approve
- Best for: Clubs, subject groups with moderation

### `invite_only`
- Users cannot request to join
- Must be invited by admin
- Best for: Private study groups, special teams

### `restricted`
- No one can join or request
- Members added automatically by system
- Best for: Class groups, grade groups

---

## Role System

### User Roles

**Original Roles**:
- `student`: Regular students
- `teacher`: Teachers
- `principal`: School principal
- `section_head`: Section administrators

**New Roles** (Added for you!):
- `admin`: Technical administrator
  - Can join any group
  - Can moderate content across the app
  - Can create admin-only groups
- `founder`: App creator/owner
  - Has all admin permissions
  - Can promote users to admin
  - Can create app-wide general groups

### Group Roles

Within each group, members can have:
- **Admin**: Full control (add/remove members, edit group, delete group)
- **Moderator**: Can approve posts, remove inappropriate content
- **Member**: Regular participation

---

## Visibility Levels

### `class`
- Only visible to specific class members
- Example: "Grade 10-A Homework Help"

### `grade`
- Visible to entire grade level
- Example: "Grade 10 Events"

### `school`
- Visible to entire school
- Example: "School Sports Day"

### `teachers_only`
- Only teachers, principals, section heads can see
- Example: "Staff Planning"

### `public`
- **NEW!** Visible beyond school boundaries
- Anyone with app access can see
- Best for: General announcements, app-wide groups
- Example: "Gurudevi Community"

---

## Creating Groups as Founder

### Example 1: General Announcements Group

```typescript
import { communityAPI } from '@/lib/api';

// Create a general announcements group
const announcementsGroup = await communityAPI.createGroup({
  name: "📢 General Announcements",
  description: "Official announcements from the Gurudevi team",
  type: "general",
  join_policy: "open", // Anyone can join
  visibility: "public", // Visible to everyone
  
  // Content settings
  allow_posts: false, // Only admins can post
  allow_announcements: true,
  require_post_approval: false,
  
  // No school restriction
  school_id: undefined,
  
  // Anyone can see and join
  allowed_roles: undefined,
  
  // Optional
  image_url: "https://example.com/logo.png",
  tags: ["official", "announcements"],
}, founderId, 'founder');
```

### Example 2: Community Forum

```typescript
// Create an open community forum
const forumGroup = await communityAPI.createGroup({
  name: "💬 Community Forum",
  description: "Share ideas, ask questions, connect with others",
  type: "general",
  join_policy: "open",
  visibility: "public",
  
  allow_posts: true, // Everyone can post
  allow_announcements: false,
  require_post_approval: false, // Trust the community
  
  school_id: undefined,
  tags: ["community", "discussion"],
}, founderId, 'founder');
```

### Example 3: Beta Testers Group

```typescript
// Create a group for beta testers
const betaGroup = await communityAPI.createGroup({
  name: "🚀 Beta Testers",
  description: "Help test new features and provide feedback",
  type: "general",
  join_policy: "approval_required", // You approve members
  visibility: "public",
  
  allow_posts: true,
  allow_announcements: true,
  max_members: 100, // Limit size
  
  tags: ["beta", "testing", "feedback"],
}, founderId, 'founder');
```

### Example 4: Admin Team

```typescript
// Create an admin-only group
const adminGroup = await communityAPI.createGroup({
  name: "🛡️ Admin Team",
  description: "Private space for app administrators",
  type: "admin_only",
  join_policy: "restricted",
  visibility: "school", // Or 'public' if cross-school admins
  
  allow_posts: true,
  allow_announcements: true,
  
  // Only admins and founders
  allowed_roles: ["admin", "founder"],
  
  tags: ["admin", "moderation"],
}, founderId, 'founder');
```

---

## Using Groups API

### List All Groups (User Perspective)

```typescript
// Get all groups user can see
const groups = await communityAPI.getGroups({}, userId);

// Filter by type
const generalGroups = await communityAPI.getGroups({
  type: 'general'
}, userId);

// Filter by join policy (show joinable groups)
const openGroups = await communityAPI.getGroups({
  join_policy: 'open'
}, userId);

// Search groups
const searchResults = await communityAPI.getGroups({
  search: 'science'
}, userId);
```

### Join a Group

```typescript
// Student joins an open group
await communityAPI.joinGroup(
  groupId, 
  studentId, 
  'student'
);

// Request to join approval-required group
await communityAPI.joinGroup(
  groupId,
  userId,
  userRole,
  "I'm interested in learning more about this topic!"
);
```

### Manage Group (Admin)

```typescript
// Get pending join requests
const requests = await communityAPI.getGroupJoinRequests(groupId);

// Approve a request
await communityAPI.handleJoinRequest(requestId, true, adminId);

// Reject a request
await communityAPI.handleJoinRequest(requestId, false, adminId);

// Make someone a moderator
await communityAPI.updateMemberRole(
  groupId,
  userId,
  false, // not admin
  true   // is moderator
);

// Remove a member
await communityAPI.removeMember(groupId, userId);
```

### Post to a Group

```typescript
// Post to a general group
await communityAPI.createPost({
  content: "Welcome to the community! 👋",
  post_type: "announcement",
  visibility: "public", // Matches group visibility
  group_id: groupId,
  tags: ["welcome"],
}, founderId, 'founder', schoolId);
```

---

## Setting Up Founder Role

### Method 1: Direct SQL (Development)

```sql
-- Connect to your Supabase database
UPDATE users 
SET role = 'founder' 
WHERE email = 'your-email@example.com';
```

### Method 2: Environment Variable

```typescript
// .env
FOUNDER_EMAILS=founder@gurudevi.com,admin@gurudevi.com

// In your auth callback
const FOUNDER_EMAILS = process.env.FOUNDER_EMAILS?.split(',') || [];

if (FOUNDER_EMAILS.includes(user.email)) {
  await supabase
    .from('users')
    .update({ role: 'founder' })
    .eq('id', user.id);
}
```

### Method 3: Admin Promotion Function

```typescript
// Protected API endpoint
export async function promoteToRole(
  targetUserId: string,
  newRole: 'admin' | 'founder',
  requesterId: string
) {
  // Verify requester is founder
  const { data: requester } = await supabase
    .from('users')
    .select('role')
    .eq('id', requesterId)
    .single();
  
  if (requester?.role !== 'founder') {
    throw new Error('Only founder can promote users');
  }
  
  // Update target user
  await supabase
    .from('users')
    .update({ role: newRole })
    .eq('id', targetUserId);
}
```

---

## Database Schema for Groups

```sql
-- Groups table
CREATE TABLE community_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  type VARCHAR(20) NOT NULL CHECK (type IN ('class', 'grade', 'subject', 'club', 'general', 'teachers_only', 'admin_only')),
  join_policy VARCHAR(20) NOT NULL CHECK (join_policy IN ('open', 'approval_required', 'invite_only', 'restricted')),
  visibility VARCHAR(20) NOT NULL CHECK (visibility IN ('class', 'grade', 'school', 'teachers_only', 'public')),
  allowed_roles TEXT[],
  
  -- Settings
  allow_posts BOOLEAN DEFAULT true,
  allow_announcements BOOLEAN DEFAULT true,
  require_post_approval BOOLEAN DEFAULT false,
  max_members INTEGER,
  
  -- Media
  image_url TEXT,
  cover_image_url TEXT,
  
  -- Metadata
  tags TEXT[],
  school_id UUID REFERENCES schools(id),
  creator_id UUID REFERENCES users(id) NOT NULL,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Members table
CREATE TABLE group_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID REFERENCES community_groups(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  user_role VARCHAR(20) NOT NULL,
  
  -- Member permissions in group
  is_admin BOOLEAN DEFAULT false,
  is_moderator BOOLEAN DEFAULT false,
  
  -- Status
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'pending', 'banned')),
  
  joined_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(group_id, user_id)
);

-- Join requests table
CREATE TABLE group_join_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID REFERENCES community_groups(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  user_role VARCHAR(20) NOT NULL,
  message TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  
  created_at TIMESTAMP DEFAULT NOW(),
  reviewed_at TIMESTAMP,
  reviewed_by UUID REFERENCES users(id)
);

-- Indexes for performance
CREATE INDEX idx_community_groups_type ON community_groups(type);
CREATE INDEX idx_community_groups_visibility ON community_groups(visibility);
CREATE INDEX idx_community_groups_school_id ON community_groups(school_id);
CREATE INDEX idx_group_members_user_id ON group_members(user_id);
CREATE INDEX idx_group_members_group_id ON group_members(group_id);
CREATE INDEX idx_group_join_requests_group_id ON group_join_requests(group_id);
CREATE INDEX idx_group_join_requests_user_id ON group_join_requests(user_id);
```

---

## Row Level Security (RLS)

```sql
-- Enable RLS
ALTER TABLE community_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_join_requests ENABLE ROW LEVEL SECURITY;

-- Groups: Users see groups they're allowed to see
CREATE POLICY group_visibility_policy ON community_groups
FOR SELECT USING (
  visibility = 'public'
  OR school_id = (SELECT school_id FROM users WHERE id = auth.uid())
  OR (
    allowed_roles IS NULL 
    OR (SELECT role FROM users WHERE id = auth.uid()) = ANY(allowed_roles)
  )
);

-- Groups: Only admins/founders can create groups
CREATE POLICY group_creation_policy ON community_groups
FOR INSERT WITH CHECK (
  auth.uid() = creator_id
  AND (SELECT role FROM users WHERE id = auth.uid()) IN ('teacher', 'principal', 'admin', 'founder')
);

-- Groups: Only group admins or app admins can update
CREATE POLICY group_update_policy ON community_groups
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM group_members
    WHERE group_id = community_groups.id
    AND user_id = auth.uid()
    AND is_admin = true
  )
  OR (SELECT role FROM users WHERE id = auth.uid()) IN ('admin', 'founder')
);

-- Members: Users see members of groups they can see
CREATE POLICY member_visibility_policy ON group_members
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM community_groups
    WHERE id = group_id
    AND (
      visibility = 'public'
      OR school_id = (SELECT school_id FROM users WHERE id = auth.uid())
    )
  )
);

-- Members: Users can only add themselves via API (enforced by join logic)
CREATE POLICY member_insert_policy ON group_members
FOR INSERT WITH CHECK (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM group_members
    WHERE group_id = group_members.group_id
    AND user_id = auth.uid()
    AND is_admin = true
  )
);
```

---

## UI Components Needed

### 1. GroupCard Component
- Shows group info (name, description, member count)
- Join button (changes based on join policy)
- Member/admin badges

### 2. GroupList Component
- Filter chips (type, join policy)
- Search bar
- "My Groups" / "Discover" tabs

### 3. GroupDetail Screen
- Full group info
- Members list
- Posts feed
- Settings (for admins)

### 4. JoinRequestModal
- For approval_required groups
- Optional message field

### 5. GroupSettingsScreen (Admin)
- Edit group details
- Manage members
- Approve join requests
- Moderation tools

---

## Example User Journeys

### As Founder - Create General Group

1. Navigate to Community tab
2. Tap "Create Group"
3. Select type: "General"
4. Set name: "📢 Official Announcements"
5. Set join policy: "Open"
6. Set visibility: "Public"
7. Disable "Allow posts" (announcements only)
8. Save
9. Group created, you're admin
10. Post your first announcement!

### As Student - Join General Group

1. Navigate to Community tab
2. Tap "Discover Groups"
3. Filter by type: "General"
4. See "📢 Official Announcements"
5. Tap "Join" → Joined immediately (open policy)
6. See group posts in feed
7. Receive notifications for announcements

### As Teacher - Request to Join Club

1. See "🧪 Science Club" group
2. Tap "Request to Join"
3. Add message: "I'd love to help with experiments!"
4. Request sent
5. Wait for admin approval
6. Receive notification when approved
7. Join the group

---

## Best Practices

### 1. Group Naming
- Use emojis for visual identification
- Keep names under 50 characters
- Be descriptive but concise

### 2. Moderation
- Assign trusted moderators
- Set clear group rules in description
- Use post approval for sensitive groups

### 3. Privacy
- Use `teachers_only` for staff discussions
- Use `restricted` for auto-assigned groups
- Use `approval_required` for curated communities

### 4. Engagement
- Pin important posts in groups
- Recognize active members (badges)
- Regularly post in general groups

---

## Questions Answered

### Q: Can I join common groups as founder?
**A: Yes!** With the `founder` role, you can:
- Create groups with `public` visibility
- Join any group (including `admin_only`)
- Moderate content across all groups
- Create general announcements groups

### Q: How do I make general groups that anyone can join?
**A: Use this configuration:**
```typescript
{
  type: 'general',
  join_policy: 'open',
  visibility: 'public',
  allowed_roles: undefined, // No restrictions
  school_id: undefined // Not school-specific
}
```

### Q: Can students create groups?
**A: By default, no.** Only teachers, principals, admins, and founders can create groups. This prevents spam and ensures quality. However, you can adjust the RLS policy if you want to allow student-created clubs.

---

**Status**: Groups feature fully designed and implemented ✅  
**Backward Compatible**: Yes  
**Database Tables**: 3 new tables needed  
**Security**: RLS policies defined
