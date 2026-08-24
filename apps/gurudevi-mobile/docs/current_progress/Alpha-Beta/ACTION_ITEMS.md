---
title: "ðŸŽ¯ Gurudevi Mobile - Action Items & Issue Tracker"
status: "active"
created: 2026-02-19
updated: 2026-02-19
author: "Naveen"
scribe: "opencode"
tags: [apps, gurudevi-mobile, historical]
---

# 🎯 Gurudevi Mobile - Action Items & Issue Tracker

**Prioritized list of issues with concrete fix strategies**

---

## 📊 Issue Overview

| Priority | Count | Status |
|----------|-------|--------|
| 🔴 Critical | 6 | 0/6 Complete |
| 🟡 High | 7 | 0/7 Complete |
| 🟠 Medium | 4 | 0/4 Complete |
| 🟢 Low | 4 | 0/4 Complete |
| **TOTAL** | **21** | **0/21 Complete** |

---

## 🔴 CRITICAL PRIORITY (Fix This Week)

### Issue #1: TypeScript Compilation Errors
**Status:** 🔴 Open  
**Priority:** Critical  
**Impact:** App won't build in production  
**Effort:** 2-4 hours

**13 Errors Found:**
1. `GradebookTable.tsx`: Cannot find module `../types/Grade`
2. `GradebookTable.tsx`: Cannot find module `../utils/grading`
3. `GradebookTable.tsx`: Cannot find module `../constants/Theme`
4. `GradeEntryForm.tsx`: Cannot find module `../utils/grading`
5. `GradeEntryForm.tsx`: Cannot find module `../constants/Theme`
6. `ReportCard.tsx`: Cannot find module `../types/Grade`
7. `ReportCard.tsx`: Cannot find module `../utils/grading`
8. `ReportCard.tsx`: Cannot find module `../constants/Theme`
9. `LibraryResourceCard.tsx`: Property `skyBlue` does not exist on `Theme.colors`
10. `LibraryResourceCard.tsx`: Property `h4` does not exist on `Theme.typography`
11. `LotusPetalFAB.tsx`: Type mismatch in ReactNode children
12. `storage.ts`: `MMKV` only refers to a type, used as value

**Fix Strategy:**

**Step 1: Create missing files**
```bash
# Create missing type file
touch apps/gurudevi-mobile/src/types/Grade.ts
```

```typescript
// src/types/Grade.ts
export interface Grade {
  id: string
  student_id: string
  classroom_id: string
  marks: number
  gpa: number
  assignment_id?: string
  feedback?: string
  created_at: string
  updated_at: string
}

export type GradingMode = 'both' | 'marks_only' | 'gpa_only'

export interface GradingSettings {
  id: string
  classroom_id: string
  mode: GradingMode
  created_at: string
  updated_at: string
}
```

**Step 2: Create grading utility**
```bash
touch apps/gurudevi-mobile/src/utils/grading.ts
```

```typescript
// src/utils/grading.ts
export function marksToGPA(marks: number, totalMarks: number = 100): number {
  const percentage = (marks / totalMarks) * 100
  
  if (percentage >= 90) return 4.0
  if (percentage >= 80) return 3.5
  if (percentage >= 70) return 3.0
  if (percentage >= 60) return 2.5
  if (percentage >= 50) return 2.0
  if (percentage >= 40) return 1.5
  return 1.0
}

export function gpaToGrade(gpa: number): string {
  if (gpa >= 4.0) return 'A+'
  if (gpa >= 3.5) return 'A'
  if (gpa >= 3.0) return 'B+'
  if (gpa >= 2.5) return 'B'
  if (gpa >= 2.0) return 'C'
  if (gpa >= 1.5) return 'D'
  return 'F'
}
```

**Step 3: Fix import paths**
```typescript
// In GradebookTable.tsx, GradeEntryForm.tsx, ReportCard.tsx
// Change:
import { Grade } from '../types/Grade'
import { marksToGPA } from '../utils/grading'
import { Theme } from '../constants/Theme'

// To (use @ alias if configured, or correct relative path):
import { Grade } from '../../types/Grade'
import { marksToGPA } from '../../utils/grading'
import { Theme } from '../../constants/Theme'
```

**Step 4: Add missing Theme properties**
```typescript
// In src/constants/Theme.ts, add:
export const Theme = {
  colors: {
    // ... existing colors ...
    skyBlue: '#87CEEB',  // Add this
  },
  typography: {
    // ... existing typography ...
    h4: {                // Add this
      fontSize: 20,
      fontWeight: '600' as const,
      lineHeight: 28,
    }
  }
}
```

**Step 5: Fix MMKV import**
```typescript
// In src/lib/storage.ts
// Change:
import { MMKV } from 'react-native-mmkv'
const storage = new MMKV()

// To:
import { MMKVLoader } from 'react-native-mmkv-storage'
const storage = new MMKVLoader().initialize()
```

**Step 6: Fix LotusPetalFAB type**
```typescript
// In src/components/shared/LotusPetalFAB.tsx, line 323
// Change children type to React.ReactNode
interface ActionItemProps {
  label: string
  onPress: () => void
  icon: React.ElementType
  children?: React.ReactNode  // Add this
}
```

**Verification:**
```bash
cd apps/gurudevi-mobile
npx tsc --noEmit
# Should show 0 errors
```

---

### Issue #2: Missing Accessibility Features
**Status:** 🔴 Open  
**Priority:** Critical  
**Impact:** WCAG violation, legal risk, unusable for screen reader users  
**Effort:** 8-16 hours

**Problem:** Zero accessibility attributes across all 39 components

**Files Affected:**
- All buttons (11 shared + 28 feature-specific = 39 components)
- All inputs (15+ fields)
- All navigation elements (5 tab items)
- All interactive cards (20+ cards)

**Fix Strategy:**

**Phase 1: Update shared components (2 hours)**
```typescript
// src/components/shared/SanctuaryButton.tsx
export function SanctuaryButton({
  children,
  onPress,
  isDisabled,
  ...props
}: SanctuaryButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      // Add these:
      accessibilityRole="button"
      accessibilityLabel={children}
      accessibilityState={{ disabled: isDisabled }}
      accessibilityHint="Double tap to activate"
      {...props}
    >
      {/* ... */}
    </Pressable>
  )
}

// src/components/shared/SanctuaryInput.tsx
export function SanctuaryInput({
  label,
  placeholder,
  value,
  isInvalid,
  errorMessage,
  ...props
}: SanctuaryInputProps) {
  return (
    <Input
      value={value}
      placeholder={placeholder}
      // Add these:
      accessibilityLabel={label || placeholder}
      accessibilityHint={`Enter ${label || placeholder}`}
      accessibilityState={{ invalid: isInvalid }}
      aria-label={label}
      aria-invalid={isInvalid}
      aria-errormessage={isInvalid ? errorMessage : undefined}
      {...props}
    />
  )
}
```

**Phase 2: Update navigation (1 hour)**
```typescript
// src/navigation/TabNavigator.tsx
<Tab.Screen
  name="Self"
  component={SelfScreen}
  options={{
    tabBarLabel: t('tabs.self'),
    // Add these:
    tabBarAccessibilityLabel: t('tabs.self.accessibility'),
    tabBarButton: (props) => (
      <TouchableOpacity
        {...props}
        accessibilityRole="tab"
        accessibilityLabel={t('tabs.self')}
        accessibilityHint="Navigate to self-care section"
      />
    ),
    tabBarIcon: ({ color }) => <Home size={24} color={color} />,
  }}
/>
```

**Phase 3: Update list items (3 hours)**
```typescript
// Example: ClassroomCard.tsx
export const ClassroomCard = React.memo(({ classroom }: Props) => {
  return (
    <Pressable
      onPress={onPress}
      // Add these:
      accessibilityRole="button"
      accessibilityLabel={`Classroom: ${classroom.name}, ${classroom.subject}`}
      accessibilityHint="Double tap to open classroom details"
    >
      {/* ... */}
    </Pressable>
  )
})
```

**Phase 4: Test with screen reader (2 hours)**
```bash
# iOS: Enable VoiceOver
Settings > Accessibility > VoiceOver

# Android: Enable TalkBack
Settings > Accessibility > TalkBack

# Test checklist:
[ ] Can navigate with swipe gestures
[ ] All buttons have labels
[ ] Form inputs are properly labeled
[ ] Error messages are announced
[ ] Tab navigation is accessible
```

**Verification:**
- All interactive elements have `accessibilityRole`
- All interactive elements have `accessibilityLabel`
- All form inputs have proper ARIA attributes
- App is navigable with screen reader

---

### Issue #3: No Authorization Checks in APIs
**Status:** 🔴 Open  
**Priority:** Critical  
**Impact:** Security vulnerability - unauthorized data access  
**Effort:** 6-8 hours

**Problem:** APIs don't verify user owns resources before queries

**Example Vulnerability:**
```typescript
// ❌ Current (INSECURE)
const lessons = await classroom.lessons.getAll('any_teacher_id_here')
// Anyone can access anyone else's data!
```

**Fix Strategy:**

**Step 1: Create authorization utility (1 hour)**
```bash
touch apps/gurudevi-mobile/src/utils/authorization.ts
```

```typescript
// src/utils/authorization.ts
import { auth } from '@/lib/api'
import { APIError } from '@/lib/api/types'

export async function requireAuth() {
  const session = await auth.getSession()
  if (!session) {
    throw new APIError('Not authenticated', 'UNAUTHENTICATED')
  }
  return session.user
}

export async function requireTeacherAccess(teacherId: string) {
  const user = await requireAuth()
  if (user.id !== teacherId) {
    throw new APIError('Unauthorized access to teacher data', 'FORBIDDEN')
  }
  return user
}

export async function requireClassroomAccess(classroomId: string) {
  const user = await requireAuth()
  
  // Check if user is teacher of this classroom
  const { data, error } = await supabase
    .from('classrooms')
    .select('teacher_id')
    .eq('id', classroomId)
    .single()
  
  if (error || !data) {
    throw new APIError('Classroom not found', 'NOT_FOUND')
  }
  
  if (data.teacher_id !== user.id) {
    throw new APIError('Unauthorized access to classroom', 'FORBIDDEN')
  }
  
  return user
}

export async function requireStudentAccess(studentId: string) {
  const user = await requireAuth()
  
  // Students can only access their own data
  if (user.role === 'student' && user.id !== studentId) {
    throw new APIError('Unauthorized access to student data', 'FORBIDDEN')
  }
  
  // Teachers/principals can access their students
  // (Additional logic needed here based on school/classroom relationships)
  
  return user
}
```

**Step 2: Add checks to API modules (4 hours)**
```typescript
// src/lib/api/classroom.ts
import { requireTeacherAccess, requireClassroomAccess } from '@/utils/authorization'

export const lessons = {
  async getAll(teacherId: string) {
    // Add authorization check
    await requireTeacherAccess(teacherId)
    
    try {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('teacher_id', teacherId)
        .order('date', { ascending: false })
      
      if (error) throw new APIError('Failed to fetch lessons', error.code, error)
      return data || []
    } catch (error) {
      throw error
    }
  },
  
  async update(id: string, updates: Partial<Lesson>) {
    // First get the lesson to check ownership
    const { data: lesson } = await supabase
      .from('lessons')
      .select('teacher_id')
      .eq('id', id)
      .single()
    
    if (!lesson) {
      throw new APIError('Lesson not found', 'NOT_FOUND')
    }
    
    // Check authorization
    await requireTeacherAccess(lesson.teacher_id)
    
    // Proceed with update
    const { data, error } = await supabase
      .from('lessons')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw new APIError('Failed to update lesson', error.code, error)
    return data
  }
}
```

**Step 3: Update all API modules (3 hours)**
Apply authorization checks to:
- [ ] `teacher.ts` - All task/note operations
- [ ] `classroom.ts` - All lesson/student operations
- [ ] `attendance.ts` - All attendance operations
- [ ] `grading.ts` - All grade operations
- [ ] `resources.ts` - All resource operations
- [ ] `groups.ts` - All group operations
- [ ] `classrooms.ts` - All classroom operations
- [ ] `community.ts` - Create/update/delete operations
- [ ] `self.ts` - All mood/journal operations

**Verification:**
```bash
# Test unauthorized access attempt
# Should throw APIError with code 'FORBIDDEN'
```

---

### Issue #4: ScrollView Performance Issues
**Status:** 🔴 Open  
**Priority:** Critical  
**Impact:** Memory leaks, janky scrolling with 50+ items  
**Effort:** 2-3 hours

**Problem:** Using ScrollView instead of FlatList for large lists

**Files Affected:**
1. `src/components/classroom/ClassroomList.tsx`
2. `src/components/grading/GradebookTable.tsx`

**Fix Strategy:**

**Fix #1: ClassroomList.tsx (1 hour)**
```typescript
// Before:
<ScrollView>
  {classrooms.map(classroom => (
    <ClassroomCard key={classroom.id} classroom={classroom} />
  ))}
</ScrollView>

// After:
import { FlatList } from '@gluestack-ui/themed'

<FlatList
  data={classrooms}
  keyExtractor={(item) => item.id}
  renderItem={({ item }) => <ClassroomCard classroom={item} />}
  ListEmptyComponent={<EmptyState title="No classrooms" />}
  contentContainerStyle={{ padding: 16 }}
  // Performance optimizations
  initialNumToRender={10}
  maxToRenderPerBatch={10}
  windowSize={5}
  removeClippedSubviews={true}
/>
```

**Fix #2: GradebookTable.tsx (1.5 hours)**
```typescript
// Before:
<ScrollView horizontal>
  <ScrollView>
    {grades.map(grade => (
      <GradeRow key={grade.id} grade={grade} />
    ))}
  </ScrollView>
</ScrollView>

// After: Use FlatList with horizontal scroll
<FlatList
  data={grades}
  keyExtractor={(item) => item.id}
  renderItem={({ item }) => <GradeRow grade={item} />}
  horizontal={false}
  ListHeaderComponent={<GradebookHeader />}
  // Performance optimizations
  initialNumToRender={15}
  maxToRenderPerBatch={10}
  windowSize={5}
  getItemLayout={(data, index) => ({
    length: 60, // Row height
    offset: 60 * index,
    index,
  })}
/>
```

**Memoize list items:**
```typescript
// ClassroomCard.tsx
export const ClassroomCard = React.memo(({ classroom, onPress }: Props) => {
  // Component code
}, (prevProps, nextProps) => {
  // Custom comparison for better performance
  return prevProps.classroom.id === nextProps.classroom.id &&
         prevProps.classroom.updated_at === nextProps.classroom.updated_at
})
```

**Verification:**
```bash
# Test with 100+ items
# Should scroll smoothly with no jank
# Check memory usage in React Native Debugger
```

---

### Issue #5: No Input Validation
**Status:** 🔴 Open  
**Priority:** Critical  
**Impact:** Invalid data in database, poor UX, security risk  
**Effort:** 4-6 hours

**Problem:** No validation on inputs before submission

**Missing Validations:**
- Email format
- Password strength
- Empty strings
- Length limits
- Date formats
- Numeric ranges

**Fix Strategy:**

**Step 1: Create validation utility (2 hours)**
```bash
touch apps/gurudevi-mobile/src/utils/validators.ts
```

```typescript
// src/utils/validators.ts
export interface ValidationResult {
  isValid: boolean
  error?: string
}

export const validators = {
  email: (email: string): ValidationResult => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email) return { isValid: false, error: 'Email is required' }
    if (!regex.test(email)) return { isValid: false, error: 'Invalid email format' }
    return { isValid: true }
  },

  password: (password: string): ValidationResult => {
    if (!password) return { isValid: false, error: 'Password is required' }
    if (password.length < 8) return { isValid: false, error: 'Password must be at least 8 characters' }
    if (!/[A-Z]/.test(password)) return { isValid: false, error: 'Password must contain uppercase letter' }
    if (!/[a-z]/.test(password)) return { isValid: false, error: 'Password must contain lowercase letter' }
    if (!/[0-9]/.test(password)) return { isValid: false, error: 'Password must contain number' }
    return { isValid: true }
  },

  nonEmpty: (value: string, fieldName: string = 'Field'): ValidationResult => {
    if (!value || value.trim().length === 0) {
      return { isValid: false, error: `${fieldName} is required` }
    }
    return { isValid: true }
  },

  maxLength: (value: string, max: number, fieldName: string = 'Field'): ValidationResult => {
    if (value.length > max) {
      return { isValid: false, error: `${fieldName} must be less than ${max} characters` }
    }
    return { isValid: true }
  },

  minLength: (value: string, min: number, fieldName: string = 'Field'): ValidationResult => {
    if (value.length < min) {
      return { isValid: false, error: `${fieldName} must be at least ${min} characters` }
    }
    return { isValid: true }
  },

  numberRange: (value: number, min: number, max: number, fieldName: string = 'Value'): ValidationResult => {
    if (value < min || value > max) {
      return { isValid: false, error: `${fieldName} must be between ${min} and ${max}` }
    }
    return { isValid: true }
  },

  date: (dateString: string): ValidationResult => {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) {
      return { isValid: false, error: 'Invalid date format' }
    }
    return { isValid: true }
  },

  mood: (score: number): ValidationResult => {
    return validators.numberRange(score, 1, 5, 'Mood score')
  },

  grade: (grade: number): ValidationResult => {
    return validators.numberRange(grade, 1, 13, 'Grade number')
  }
}

// Form validation helper
export function validateForm<T extends Record<string, any>>(
  values: T,
  rules: Partial<Record<keyof T, (value: any) => ValidationResult>>
): { isValid: boolean; errors: Partial<Record<keyof T, string>> } {
  const errors: Partial<Record<keyof T, string>> = {}
  let isValid = true

  for (const [field, validator] of Object.entries(rules)) {
    if (validator) {
      const result = validator(values[field])
      if (!result.isValid) {
        errors[field as keyof T] = result.error
        isValid = false
      }
    }
  }

  return { isValid, errors }
}
```

**Step 2: Apply to AuthScreen (1 hour)**
```typescript
// src/screens/AuthScreen.tsx
import { validators, validateForm } from '@/utils/validators'

function AuthScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSignIn = async () => {
    // Validate inputs
    const { isValid, errors: validationErrors } = validateForm(
      { email, password },
      {
        email: validators.email,
        password: (p) => validators.nonEmpty(p, 'Password')
      }
    )

    if (!isValid) {
      setErrors(validationErrors)
      return
    }

    // Clear errors
    setErrors({})

    // Proceed with sign in
    try {
      await auth.signIn(email, password)
    } catch (error) {
      // Handle error
    }
  }

  return (
    <>
      <SanctuaryInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        isInvalid={!!errors.email}
        errorMessage={errors.email}
      />
      <SanctuaryInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        isInvalid={!!errors.password}
        errorMessage={errors.password}
        secureTextEntry
      />
    </>
  )
}
```

**Step 3: Apply to other forms (2 hours)**
- [ ] Lesson creation form
- [ ] Classroom creation form
- [ ] Grade entry form
- [ ] Resource upload form
- [ ] Profile edit form
- [ ] Mood logging
- [ ] Journal entry

**Verification:**
- Try submitting forms with invalid data
- Should show appropriate error messages
- Should not call API with invalid data

---

### Issue #6: Missing Error Boundaries
**Status:** 🔴 Open  
**Priority:** Critical  
**Impact:** Crashes cascade to app level  
**Effort:** 2-3 hours

**Problem:** Only one ErrorBoundary component exists but not used

**Fix Strategy:**

**Step 1: Update ErrorBoundary (1 hour)**
```typescript
// src/components/shared/ErrorBoundary.tsx
import React, { Component, ReactNode } from 'react'
import { Box, Text, Button } from '@gluestack-ui/themed'
import { Theme } from '@/constants/Theme'

interface Props {
  children: ReactNode
  name: string  // Add name for tracking
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`Error in ${this.props.name}:`, error, errorInfo)
    
    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo)
    
    // TODO: Send to error tracking service (Sentry)
    // Sentry.captureException(error, { contexts: { react: errorInfo } })
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <Box sx={{ flex: 1, justifyContent: 'center', alignItems: 'center', p: '$4' }}>
          <Text sx={{ fontSize: '$2xl', fontWeight: '$bold', color: Theme.colors.emberRed, mb: '$2' }}>
            Something went wrong
          </Text>
          <Text sx={{ fontSize: '$md', color: Theme.colors.graphiteGray, mb: '$4', textAlign: 'center' }}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </Text>
          <Button onPress={this.handleReset}>
            Try Again
          </Button>
        </Box>
      )
    }

    return this.props.children
  }
}
```

**Step 2: Wrap feature sections (1 hour)**
```typescript
// App.tsx
<ErrorBoundary name="App Root">
  <NavigationContainer>
    {!session ? (
      <ErrorBoundary name="Auth">
        <AuthScreen />
      </ErrorBoundary>
    ) : (
      <ErrorBoundary name="Main App">
        <TabNavigator onTabChange={setCurrentTab} />
        <LotusPetalFAB {...fabProps} />
      </ErrorBoundary>
    )}
  </NavigationContainer>
</ErrorBoundary>

// TabNavigator.tsx
<Tab.Screen name="Self">
  {() => (
    <ErrorBoundary name="Self Screen">
      <SelfScreen />
    </ErrorBoundary>
  )}
</Tab.Screen>

<Tab.Screen name="Classroom">
  {() => (
    <ErrorBoundary name="Classroom Screen">
      <ClassroomScreen />
    </ErrorBoundary>
  )}
</Tab.Screen>
```

**Step 3: Add to complex components (1 hour)**
```typescript
// Wrap components that fetch data or have complex logic
<ErrorBoundary name="Classroom List" fallback={<EmptyState title="Failed to load classrooms" />}>
  <ClassroomList teacherId={teacherId} />
</ErrorBoundary>

<ErrorBoundary name="Mood Lotus">
  <MoodLotus userId={userId} />
</ErrorBoundary>
```

**Verification:**
- Throw test error: `throw new Error('Test error')`
- Should show error UI instead of white screen
- Should allow retry

---

## 🟡 HIGH PRIORITY (Fix This Week)

### Issue #7: No Memoization Strategy
**Status:** 🟡 Open  
**Priority:** High  
**Impact:** Unnecessary re-renders, performance degradation  
**Effort:** 4-6 hours

**Problem:** Only 2 components use React.memo, zero useCallback usage

**Fix Strategy:**

**Step 1: Memoize all list items (2 hours)**
```typescript
// Pattern: Wrap all list item components
export const ClassroomCard = React.memo(({ classroom, onPress }: Props) => {
  // Component code
})

export const StudentCard = React.memo(({ student, onPress }: Props) => {
  // Component code
})

export const GradeRow = React.memo(({ grade, onEdit }: Props) => {
  // Component code
})
```

**Step 2: Add useCallback to handlers (2 hours)**
```typescript
// Before:
<Button onPress={() => handleSubmit(id)} />

// After:
const handlePress = useCallback(() => {
  handleSubmit(id)
}, [id, handleSubmit])

<Button onPress={handlePress} />
```

**Step 3: Add useMemo for expensive computations (1 hour)**
```typescript
// Before:
const filteredStudents = students.filter(s => 
  s.name.toLowerCase().includes(searchQuery.toLowerCase())
)

// After:
const filteredStudents = useMemo(
  () => students.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  ),
  [students, searchQuery]
)
```

**Files to Update:**
- All list components (ClassroomList, StudentList, etc.)
- All modal components
- All forms with event handlers

---

### Issue #8: Direct Supabase Calls in Components
**Status:** 🟡 Open  
**Priority:** High  
**Impact:** Hard to test, duplicated logic  
**Effort:** 6-8 hours

**Fix Strategy:**

**Create custom hooks pattern:**
```typescript
// src/hooks/useClassrooms.ts
export function useClassrooms(teacherId: string) {
  return useQuery({
    queryKey: ['classrooms', teacherId],
    queryFn: () => classrooms.getByTeacher(teacherId),
    enabled: !!teacherId
  })
}

// Usage in component:
const { data: classrooms, isLoading, error } = useClassrooms(teacherId)
```

**Create hooks for:**
- [ ] useClassrooms
- [ ] useStudents
- [ ] useAttendance
- [ ] useLessons
- [ ] useGrades
- [ ] useMood
- [ ] useAnnouncements

---

### Issue #9: 55 Console.log Statements
**Status:** 🟡 Open  
**Priority:** High  
**Impact:** Log pollution, performance overhead  
**Effort:** 2 hours

**Fix Strategy:**

**Step 1: Create logger utility**
```typescript
// src/utils/logger.ts
const isDev = __DEV__

export const logger = {
  debug: (...args: any[]) => {
    if (isDev) console.log('[DEBUG]', ...args)
  },
  info: (...args: any[]) => {
    if (isDev) console.info('[INFO]', ...args)
  },
  warn: (...args: any[]) => {
    console.warn('[WARN]', ...args)
  },
  error: (...args: any[]) => {
    console.error('[ERROR]', ...args)
    // TODO: Send to error tracking
  }
}
```

**Step 2: Replace all console statements**
```bash
# Find and replace
# console.log → logger.debug
# console.error → logger.error
# console.warn → logger.warn
```

---

### Issue #10-13: Additional High Priority
See COMPREHENSIVE_APP_ANALYSIS.md for details on:
- #10: No rate limiting
- #11: TODO comments (12 found)
- #12: Missing loading states in modals
- #13: Hard-coded strings in logic

---

## 🟠 MEDIUM PRIORITY (This Month)

### Issue #14-17: Medium Priority
- #14: Type safety gaps (any usage)
- #15: No soft delete pattern
- #16: Invite code security
- #17: Error details leakage

See COMPREHENSIVE_APP_ANALYSIS.md for fix strategies.

---

## 🟢 LOW PRIORITY (Future Sprints)

### Issue #18-21: Low Priority
- #18: Missing inline comments
- #19: No haptic feedback consistency
- #20: Incomplete i18n
- #21: No password strength meter

See COMPREHENSIVE_APP_ANALYSIS.md for details.

---

## 📈 Progress Tracking

**Week 1 Goal:** Fix issues #1-#4 (Critical blockers)
**Week 2 Goal:** Fix issues #5-#6 (Critical + start high priority)
**Week 3 Goal:** Fix issues #7-#9 (High priority)
**Week 4 Goal:** Fix issues #10-#13 (Remaining high priority)

**Daily Checklist:**
- [ ] Review issues assigned to today
- [ ] Implement fixes
- [ ] Write tests for fixes
- [ ] Update this document with progress
- [ ] Mark completed issues with ✅

---

**Last Updated:** February 5, 2026  
**For detailed analysis, see:** `COMPREHENSIVE_APP_ANALYSIS.md`
