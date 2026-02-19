# API Module Structure

This directory contains the modular API layer for Gurudevi, organized for scalability and maintainability.

## Architecture

The API layer is now split into separate modules, each responsible for a specific domain:

```
src/lib/api/
├── index.ts              # Main export (use this for imports)
├── errors.ts             # Error handling (APIError class)
├── types.ts              # Shared TypeScript types
├── tasks.ts              # Tasks API
├── lessons.ts            # Lessons API
├── students.ts           # Students API
├── notes.ts              # Teacher notes API
├── auth.ts               # Authentication API
├── attendance.ts         # Attendance tracking API
├── resources.ts          # Classroom resources API
├── groups.ts             # Student groups API
└── classroomStudents.ts  # Classroom student management API
```

## Usage

### Standard Import (Recommended)

```typescript
import { api } from '@/lib/api';

// Use any API module
const tasks = await api.tasks.getAll(teacherId);
const attendance = await api.attendance.getByDate(classroomId, date);
```

### Direct Module Import (For Specific Needs)

```typescript
import { tasksAPI } from '@/lib/api/tasks';
import { attendanceAPI } from '@/lib/api/attendance';

const tasks = await tasksAPI.getAll(teacherId);
```

### Type Imports

```typescript
import type { Task, Lesson, AttendanceRecord } from '@/lib/api';
```

## Benefits of This Structure

### 1. Scalability
- Each API module is a separate file (50-100 lines)
- Easy to find and edit specific functionality
- No more scrolling through an 865-line file

### 2. Maintainability
- Clear separation of concerns
- Each module has a single responsibility
- Easier code reviews

### 3. Performance
- Better tree-shaking (unused modules can be excluded)
- Faster IDE performance (smaller files)
- Easier to lazy-load specific APIs if needed

### 4. Team Collaboration
- Reduces merge conflicts (developers work on different files)
- Easier to assign ownership of specific APIs
- Clear boundaries between features

### 5. Backward Compatibility
- Old imports from `@/lib/api` still work
- No breaking changes for existing code
- Gradual migration possible

## File Size Comparison

**Before:**
- `api.ts`: 865 lines (monolithic)

**After:**
- `errors.ts`: 16 lines
- `types.ts`: 97 lines
- `tasks.ts`: 98 lines
- `lessons.ts`: 94 lines
- `students.ts`: 99 lines
- `notes.ts`: 75 lines
- `auth.ts`: 84 lines
- `attendance.ts`: 83 lines
- `resources.ts`: 90 lines
- `groups.ts`: 82 lines
- `classroomStudents.ts`: 70 lines
- `index.ts`: 51 lines
- **Total**: ~939 lines (organized across 12 focused files)

## Adding New APIs

When adding a new API module:

1. Create a new file in `src/lib/api/` (e.g., `reports.ts`)
2. Follow the existing pattern:
   ```typescript
   import { supabase } from '../supabase';
   import { APIError } from './errors';
   import type { YourType } from './types';

   export const yourAPI = {
       async method() {
           // Implementation
       }
   };
   ```
3. Add your types to `types.ts`
4. Export from `index.ts`:
   ```typescript
   import { yourAPI } from './your-module';
   
   export const api = {
       // ... existing APIs
       yourModule: yourAPI,
   };
   ```

## Migration Guide

For components currently importing from the old structure, no changes are needed. The legacy `api.ts` file re-exports everything from the modular structure.

However, if you want to use direct imports:

**Before:**
```typescript
import { api } from '@/lib/api';
```

**After (optional):**
```typescript
import { api } from '@/lib/api';  // Still works!
// OR
import { tasksAPI } from '@/lib/api/tasks';  // Direct import
```

## Best Practices

1. **Use the main export** (`from '@/lib/api'`) for most cases
2. **Use direct imports** only when you need to reduce bundle size
3. **Add types to `types.ts`** instead of inline in API files
4. **Use APIError** for all error handling
5. **Keep modules focused** - if a file grows beyond 150 lines, consider splitting it

## Testing

Each API module can now be tested independently:

```typescript
import { tasksAPI } from '@/lib/api/tasks';
import { APIError } from '@/lib/api/errors';

describe('tasksAPI', () => {
    it('should fetch all tasks', async () => {
        // Test implementation
    });
});
```
