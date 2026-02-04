# Gurudevi API Layer - Usage Guide

> **Centralized Supabase API with TypeScript types and error handling**

---

## 📦 What Was Created

**File:** `src/lib/api.ts`

**Purpose:** Centralize all Supabase database calls in one place with:
- ✅ TypeScript types for all entities
- ✅ Consistent error handling
- ✅ Reusable methods
- ✅ Clean API interface

---

## 🚀 Usage

### Import the API

```typescript
import { api } from '@/lib/api';
```

---

## 📋 Tasks API

### Get all tasks for a teacher
```typescript
const tasks = await api.tasks.getAll(teacherId);
// Returns: Task[]
```

### Create a task
```typescript
const newTask = await api.tasks.create(
    'Prepare lesson plan',
    teacherId,
    'Optional description'
);
// Returns: Task
```

### Update task status
```typescript
await api.tasks.updateStatus(taskId, true); // Mark complete
await api.tasks.updateStatus(taskId, false); // Mark incomplete
```

###Update task details
```typescript
const updated = await api.tasks.update(taskId, {
    title: 'New title',
    description: 'New description',
});
```

### Delete a task
```typescript
await api.tasks.delete(taskId);
```

---

## 📚 Lessons API

### Get all lessons
```typescript
const lessons = await api.lessons.getAll(teacherId);
```

### Get lessons for a date
```typescript
const todayLessons = await api.lessons.getByDate(teacherId, '2026-02-03');
```

### Create a lesson
```typescript
const lesson = await api.lessons.create({
    title: 'Math - Chapter 5',
    description: 'Fractions',
    teacher_id: teacherId,
    class_id: classId,
    date: '2026-02-04',
    notes: 'Remember to bring visual aids',
});
```

### Update a lesson
```typescript
await api.lessons.update(lessonId, {
    notes: 'Updated notes',
});
```

### Delete a lesson
```typescript
await api.lessons.delete(lessonId);
```

---

## 👨‍🎓 Students API

### Get all students
```typescript
const allStudents = await api.students.getAll();

// Or filter by class
const classStudents = await api.students.getAll(classId);
```

### Get a single student
```typescript
const student = await api.students.getById(studentId);
```

### Create a student
```typescript
const student = await api.students.create({
    full_name: 'Kasun Perera',
    grade: 'Grade 5',
    class_id: classId,
    notes: 'Requires extra attention in Math',
});
```

### Update student
```typescript
await api.students.update(studentId, {
    notes: 'Improved in recent tests!',
});
```

### Delete student
```typescript
await api.students.delete(studentId);
```

---

## 📝 Notes API (Teacher venting/reflections)

### Get all notes
```typescript
const allNotes = await api.notes.getAll(teacherId);

// Or filter by type
const ventingNotes = await api.notes.getAll(teacherId, 'venting');
const reflections = await api.notes.getAll(teacherId, 'reflection');
```

### Create a note
```typescript
// Simple note
await api.notes.create(teacherId, 'Today was challenging but rewarding');

// Venting
await api.notes.create(
    teacherId,
    'Frustrated with lack of resources',
    'venting'
);

// Reflection
await api.notes.create(
    teacherId,
    'New teaching method worked well today',
    'reflection'
);
```

### Delete a note
```typescript
await api.notes.delete(noteId);
```

---

## 🔐 Auth API

### Get current session
```typescript
const session = await api.auth.getSession();
```

### Get current user
```typescript
const user = await api.auth.getUser();
```

### Sign in
```typescript
const { session, user } = await api.auth.signIn(email, password);
```

### Sign up
```typescript
const { session, user } = await api.auth.signUp(
    email,
    password,
    'Saman Silva' // Optional full name
);
```

### Sign out
```typescript
await api.auth.signOut();
```

---

## ⚠️ Error Handling

All API methods throw `APIError` on failure:

```typescript
import { api, APIError } from '@/lib/api';

try {
    const tasks = await api.tasks.getAll(teacherId);
} catch (error) {
    if (error instanceof APIError) {
        console.error('API Error:', error.message);
        console.error('Code:', error.code);
        console.error('Details:', error.details);
        
        // Show user-friendly message
        Alert.alert('Error', 'Failed to load tasks. Please try again.');
    }
}
```

---

## 🔄 Using with React Query (Recommended)

### Example: Fetch tasks

```typescript
// hooks/useTasks.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useTasks(teacherId: string) {
    return useQuery({
        queryKey: ['tasks', teacherId],
        queryFn: () => api.tasks.getAll(teacherId),
    });
}

// In component:
const { data: tasks, isLoading, error } = useTasks(teacherId);
```

### Example: Refactored useTaskActions

**Before (direct Supabase):**
```typescript
import { supabase } from '../lib/supabase';

const { error } = await supabase.from('tasks').insert([{ title }]);
if (error) throw error;
```

**After (using API layer):**
```typescript
import { api } from '../lib/api';

return api.tasks.create(title, teacherId);
```

**See:** `src/hooks/useTaskActions.ts` for full example!

---

## 📊 TypeScript Types

All types are exported from `src/lib/api.ts`:

```typescript
import type { Task, Lesson, Student, TeacherNote } from '@/lib/api';

const task: Task = {
    id: '123',
    title: 'Prepare lesson',
    description: 'Math chapter 5',
    is_completed: false,
    teacher_id: 'abc',
    created_at: '2026-02-03T10:00:00Z',
    updated_at: '2026-02-03T10:00:00Z',
};
```

---

## ✅ Benefits

**Before API layer:**
- ❌ Supabase calls scattered everywhere
- ❌ Inconsistent error handling
- ❌ Repeated code
- ❌ Hard to test
- ❌ No TypeScript autocomplete

**After API layer:**
- ✅ All API calls in one place
- ✅ Consistent error handling
- ✅ DRY code (Don't Repeat Yourself)
- ✅ Easy to test & mock
- ✅ Full TypeScript support

---

## 🎯 Next Steps

1. **Use in features:**
   ```typescript
   // Instead of:
   const { data } = await supabase.from('tasks')...
   
   // Do:
   const tasks = await api.tasks.getAll(teacherId);
   ```

2. **Add more APIs as needed:**
   - Classes
   - Attendance
   - Assessments
   - etc.

3. **Hook patterns:**
   - Create `useLessons()`, `useStudents()` following `useTasks()` pattern

---

## 📝 Example: Complete Usage

```typescript
import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { Task } from '@/lib/api';

function TasksScreen({ teacherId }: { teacherId: string }) {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadTasks();
    }, [teacherId]);

    async function loadTasks() {
        try {
            setLoading(true);
            const data = await api.tasks.getAll(teacherId);
            setTasks(data);
        } catch (error) {
            console.error('Failed to load tasks:', error);
        } finally {
            setLoading(false);
        }
    }

    async function handleCreateTask(title: string) {
        try {
            await api.tasks.create(title, teacherId);
            await loadTasks(); // Refresh
        } catch (error) {
            console.error('Failed to create task:', error);
        }
    }

    async function handleToggleTask(id: string, currentStatus: boolean) {
        try {
            await api.tasks.updateStatus(id, !currentStatus);
            await loadTasks(); // Refresh
        } catch (error) {
            console.error('Failed to toggle task:', error);
        }
    }

    if (loading) return <Text>Loading...</Text>;

    return (
        <View>
            {tasks.map(task => (
                <TaskItem
                    key={task.id}
                    task={task}
                    onToggle={() => handleToggleTask(task.id, task.is_completed)}
                />
            ))}
        </View>
    );
}
```

---

**Your API layer is ready!** Use it consistently across all features. 🚀
