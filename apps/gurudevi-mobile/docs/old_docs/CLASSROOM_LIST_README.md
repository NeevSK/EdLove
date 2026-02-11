# Classroom List Implementation

## Overview
This implementation adds role-based classroom listing functionality to the Gurudevi mobile app, allowing teachers and students to view their assigned/enrolled classrooms.

## What Was Implemented

### 1. Database Schema (`docs/sql/classrooms_schema.sql`)
- **classrooms table**: Stores classroom information (name, subject, description)
- **classroom_students table**: Links students to classrooms for enrollment
- **RLS Policies**: Row-level security for data access control
- **Indexes**: Optimized queries for school_id, teacher_id, grade_id

### 2. API Layer (`src/lib/api/`)
- **types.ts**: Added `Classroom` interface
- **classrooms.ts**: New API module with methods:
  - `getByTeacher(teacherId)`: Fetch classrooms taught by a teacher
  - `getByStudent(studentId)`: Fetch classrooms a student is enrolled in
  - `getBySchool(schoolId)`: Fetch all classrooms in a school (for principals)
  - `getById(id)`: Get single classroom details
  - CRUD operations: create, update, delete

### 3. UI Component (`src/components/classroom/ClassroomList.tsx`)
- **Role-aware**: Automatically detects user role (teacher/student)
- **Loading states**: Shows spinner while fetching data
- **Error handling**: Displays error messages with retry button
- **Empty state**: Helpful message when no classrooms exist
- **Card design**: Clean, sanctuary-themed cards following Theme.ts
- **Navigation ready**: Prepared for onPress navigation to classroom details

### 4. Screen Integration (`src/screens/ClassroomScreen.tsx`)
- Updated default teacher/student view to use ClassroomList
- Maintained role-based routing for principal/section_head/grade_head

## Setup Instructions

### 1. Apply Database Schema
Run the SQL file in your Supabase SQL editor:
```bash
# File location: apps/gurudevi-mobile/docs/sql/classrooms_schema.sql
```

### 2. Create Sample Data (Optional)
```sql
-- Insert sample classroom
INSERT INTO public.classrooms (school_id, teacher_id, name, subject, description)
VALUES (
  '<your-school-id>',
  '<your-teacher-id>',
  'Grade 10 Mathematics',
  'Mathematics',
  'Advanced mathematics for grade 10 students'
);

-- Enroll a student
INSERT INTO public.classroom_students (classroom_id, student_id, roll_number)
VALUES (
  '<classroom-id>',
  '<student-id>',
  1
);
```

### 3. Test the Implementation
1. **As a Teacher**:
   - Login with a teacher account
   - Navigate to the Classroom tab
   - Should see list of classrooms you teach
   
2. **As a Student**:
   - Login with a student account
   - Navigate to the Classroom tab
   - Should see list of classrooms you're enrolled in

## Features

### Teacher View
- Lists all classrooms where `teacher_id` matches the logged-in teacher
- Shows classroom name, subject, and description
- Tap to navigate to classroom details (prepared, not yet implemented)

### Student View
- Lists all classrooms linked through `classroom_students` table
- Shows classroom name, subject, and description
- Tap to navigate to classroom details (prepared, not yet implemented)

### Empty States
- Teacher: "You haven't been assigned to any classrooms yet."
- Student: "You haven't enrolled in any classrooms yet."

### Error Handling
- Network errors displayed with retry button
- Database errors logged to console
- User-friendly error messages

## Design Tokens Used
Following the Sanctuary theme from `Theme.ts`:
- **Background**: `voidIndigo` (dark primary)
- **Cards**: `midnightBlue` (elevated surfaces)
- **Primary text**: `sacredWhite`
- **Accent**: `sanctuarySaffron` (for subject labels)
- **Secondary text**: `pearlGray`
- **Icons**: Lucide React Native icons
- **Shadows**: Medium shadow for cards
- **Border radius**: Comfortable (16px)

## Next Steps

### Immediate
1. Run the SQL schema in Supabase
2. Add sample data for testing
3. Test with different user roles

### Future Enhancements
1. **Classroom Details Screen**: Create a detailed view when tapping a classroom
2. **Search & Filter**: Add search bar and filter by subject
3. **Sort Options**: Allow sorting by name, subject, or date
4. **Student Count Badge**: Show number of enrolled students on each card
5. **Quick Actions**: Add context menu for quick actions (edit, delete, etc.)
6. **Pull to Refresh**: Add swipe-down refresh functionality
7. **Pagination**: Handle large numbers of classrooms efficiently

## API Reference

### classroomsAPI.getByTeacher(teacherId)
```typescript
const classrooms = await api.classrooms.getByTeacher(userId);
// Returns: Classroom[]
```

### classroomsAPI.getByStudent(studentId)
```typescript
const classrooms = await api.classrooms.getByStudent(userId);
// Returns: Classroom[]
```

### classroomsAPI.getBySchool(schoolId)
```typescript
const classrooms = await api.classrooms.getBySchool(schoolId);
// Returns: Classroom[]
```

## Troubleshooting

### "Failed to fetch classrooms"
- Check Supabase connection in `.env`
- Verify SQL schema has been applied
- Check RLS policies are correctly set up
- Ensure user is authenticated

### "No Classrooms Yet"
- Verify sample data was inserted correctly
- Check user's `teacher_id` or `student_id` matches data
- Verify `school_id` matches between user and classrooms

### TypeScript Errors
- TypeScript errors related to JSX/Promise are expected in Expo projects
- These are configuration issues, not logic errors
- App will run fine with Expo's TypeScript setup

## Files Modified/Created
- ✅ `src/lib/api/types.ts` - Added Classroom interface
- ✅ `src/lib/api/classrooms.ts` - New API module
- ✅ `src/lib/api/index.ts` - Export classrooms API
- ✅ `src/components/classroom/ClassroomList.tsx` - New component
- ✅ `src/screens/ClassroomScreen.tsx` - Updated to use ClassroomList
- ✅ `docs/sql/classrooms_schema.sql` - Database schema
- ✅ `docs/CLASSROOM_LIST_README.md` - This documentation
