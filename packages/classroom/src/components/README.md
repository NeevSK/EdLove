---
title: "Classroom Components - MISSION 02: Teacher Workbench"
status: "active"
created: 2026-02-19
updated: 2026-02-19
author: "Naveen"
scribe: "opencode"
tags: [packages, classroom]
---

# Classroom Components - MISSION 02: Teacher Workbench

This directory (`src/components/classroom`) contains the core components for the Teacher Workbench feature, implementing fast and efficient classroom management tools.

## Components

### 1. AttendanceSheet (`src/components/classroom/AttendanceSheet.tsx`)

Fast, swipe-based attendance marking interface for teachers.

**Features:**
- Swipe Right: Mark as Present (Green Check)
- Swipe Left: Mark as Absent (Red X)
- Long Press: Mark as Late (Yellow Clock)
- Default state: All students marked as Present
- Search functionality for quick student lookup
- Real-time attendance statistics
- Optimistic updates for instant feedback

**Usage:**
```tsx
import AttendanceSheet from '@/components/classroom/AttendanceSheet';

function AttendanceScreen() {
  const handleAttendanceChange = (attendance) => {
    // Save attendance records
    console.log('Updated attendance:', attendance);
  };

  return (
    <AttendanceSheet
      classroomId="classroom-123"
      date="2024-01-15"
      onAttendanceChange={handleAttendanceChange}
    />
  );
}
```

**API Integration:**
```tsx
import { api } from '@/lib/api';

// Fetch students for a classroom
const students = await api.classroomStudents.getAll(classroomId);

// Record attendance
await api.attendance.record(classroomId, studentId, 'present', date);

// Batch record attendance
await api.attendance.batchRecord([
  { classroom_id: 'c1', student_id: 's1', status: 'present', date: '2024-01-15' },
  { classroom_id: 'c1', student_id: 's2', status: 'absent', date: '2024-01-15' },
]);
```

### 2. GroupManager (`src/components/classroom/GroupManager.tsx`)

Component for creating and managing temporary student groups for activities.

**Features:**
- Create named groups with descriptions
- Multi-select checklist for assigning students
- Edit and delete group functionality
- Visual group indicators with color coding
- Group persistence (local state with API-ready structure)

**Usage:**
```tsx
import GroupManager from '@/components/classroom/GroupManager';

function GroupManagementScreen() {
  return (
    <GroupManager classroomId="classroom-123" />
  );
}
```

**API Integration:**
```tsx
import { api } from '@/lib/api';

// Get all groups for a classroom
const groups = await api.groups.getAll(classroomId);

// Create a new group
const newGroup = await api.groups.create({
  classroom_id: classroomId,
  teacher_id: teacherId,
  name: 'Lab Group A',
  description: 'First lab rotation',
  student_ids: ['s1', 's2', 's3'],
  color: '#E67E22',
});

// Update a group
await api.groups.update(groupId, {
  name: 'Lab Group A - Updated',
  student_ids: ['s1', 's2', 's3', 's4'],
});

// Delete a group
await api.groups.delete(groupId);
```

## Screens

### ContentLibrary (`src/screens/classroom/ContentLibrary.tsx`)

Resource management screen for teachers to organize teaching materials.

**Features:**
- Grid view of resource cards (PDFs, Links, Notes)
- Floating Action Button (FAB) for adding resources
- Pin to Top functionality for important resources
- Resource type categorization with icons
- Resource CRUD operations

**Usage:**
```tsx
import ContentLibrary from '@/screens/classroom/ContentLibrary';

function ClassroomTabs() {
  return (
    <Tab.Screen 
      name="Content" 
      component={ContentLibrary}
    />
  );
}
```

**API Integration:**
```tsx
import { api } from '@/lib/api';

// Get all resources for a classroom
const resources = await api.resources.getAll(classroomId);

// Create a new resource
const resource = await api.resources.create({
  classroom_id: classroomId,
  teacher_id: teacherId,
  title: 'Mathematics Chapter 5',
  description: 'Algebra basics',
  type: 'pdf',
  url: 'https://example.com/math-ch5.pdf',
  is_pinned: false,
});

// Toggle pin status
await api.resources.togglePin(resourceId, true);

// Delete a resource
await api.resources.delete(resourceId);
```

## Design System

All components follow the Gurudevi design system using `Theme.ts`:

- **Colors**: Professional slate and indigo palette
- **Spacing**: Consistent 8px grid system
- **Typography**: Readable font sizes (minimum 14sp)
- **Corners**: Organic, rounded corners
- **Shadows**: Soft sanctuary shadows
- **Motion**: Breath-like timing for animations

## Required Dependencies

These components use:
- `@gluestack-ui/themed` - UI components
- `react-native-gesture-handler` - Swipe gestures
- `react-native-reanimated` - Animations
- `lucide-react-native` - Icons
- `@supabase/supabase-js` - Backend API

## Database Schema

### Tables Required

```sql
-- Attendance tracking
CREATE TABLE attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    classroom_id UUID NOT NULL,
    student_id UUID NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late')),
    date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(classroom_id, student_id, date)
);

-- Classroom resources
CREATE TABLE classroom_resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    classroom_id UUID NOT NULL,
    teacher_id UUID NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL CHECK (type IN ('pdf', 'link', 'note')),
    url TEXT,
    content TEXT,
    is_pinned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Student groups
CREATE TABLE student_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    classroom_id UUID NOT NULL,
    teacher_id UUID NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    student_ids UUID[] NOT NULL,
    color TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Classroom students
CREATE TABLE classroom_students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    classroom_id UUID NOT NULL,
    student_id UUID NOT NULL,
    full_name TEXT NOT NULL,
    roll_number INTEGER,
    enrolled_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(classroom_id, student_id)
);
```

## Testing

To test these components:

1. **AttendanceSheet**: 
   - Test swipe gestures on different devices
   - Verify optimistic updates work correctly
   - Test search functionality
   - Validate statistics calculations

2. **ContentLibrary**:
   - Test resource creation for all types (PDF, Link, Note)
   - Verify pin functionality
   - Test resource deletion
   - Validate modal interactions

3. **GroupManager**:
   - Test group creation and editing
   - Verify multi-select functionality
   - Test group deletion
   - Validate student assignment

## Performance Considerations

- **Optimistic Updates**: All components use optimistic updates to provide instant feedback
- **No Loading Spinners**: Attendance marking happens instantly without loading states
- **Efficient Rendering**: Components use FlatList for efficient list rendering
- **Gesture Handling**: Swipe gestures are handled natively for smooth performance

## Accessibility

- All components support screen readers
- Minimum touch target size of 44x44 points
- High contrast color ratios for text
- Clear visual feedback for all interactions

## Future Enhancements

- [ ] Offline support with sync
- [ ] Bulk operations for attendance
- [ ] Resource preview functionality
- [ ] Group templates and quick creation
- [ ] Analytics and attendance reports
- [ ] Integration with calendar for scheduling
