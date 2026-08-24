---
title: "ðŸš€ Gurudevi Mobile - Quick Reference Guide"
status: "active"
created: 2026-02-19
updated: 2026-07-24
author: "Naveen"
scribe: "opencode"
tags: [apps, gurudevi-mobile, historical]
---

> **Superseded** � kept for historical reference.
> See active docs at docs/INDEX.md.
# 🚀 Gurudevi Mobile - Quick Reference Guide

**Quick access guide for developers**

---

## 🏃 Quick Start

```bash
# Install dependencies
pnpm install

# Start development server
cd apps/gurudevi-mobile
pnpm start

# Run on device
pnpm android  # or pnpm ios
```

---

## 📁 Key Files & Locations

### Configuration
- **App Entry:** `App.tsx`
- **Expo Config:** `app.json`
- **TypeScript:** `tsconfig.json`
- **Theme:** `gluestack-ui.config.ts`
- **Environment:** `.env` (create from `.env.example`)

### Source Code Structure
```
src/
├── screens/          # 5 main screens + nested views
├── components/       # 39 components (11 shared, rest feature-specific)
├── lib/api/         # 14 API modules (80+ functions)
├── navigation/      # Tab navigator
├── store/          # Zustand global state
├── constants/      # Theme, fonts, schools
└── i18n/           # Translations
```

---

## 🎨 Design System (Sanctuary Theme)

### Colors
```typescript
// Primary
Theme.colors.sanctuarySaffron  // #E67E22 - Brand orange
Theme.colors.sageGreen         // #8FBC8F - Success
Theme.colors.emberRed          // #FF6347 - Error

// Backgrounds
Theme.colors.voidIndigo        // #1A1A2E - Dark
Theme.colors.creamSilence      // #FFF8E7 - Light
```

### Components
```typescript
import { SanctuaryButton, SanctuaryCard, SanctuaryInput } from '@/components/shared'

<SanctuaryButton
  onPress={handleSubmit}
  variant="solid"
  action="primary"
  leftIcon={CheckIcon}
>
  Submit
</SanctuaryButton>
```

---

## 🔌 API Quick Reference

### Authentication
```typescript
import { auth } from '@/lib/api'

await auth.signIn(email, password)
await auth.signUp(email, password, fullName)
await auth.signOut()
const session = await auth.getSession()
```

### Classroom Management
```typescript
import { classroom, attendance } from '@/lib/api'

// Lessons
const lessons = await classroom.lessons.getAll(teacherId)
await classroom.lessons.create({ title, date, teacherId })

// Attendance
await attendance.record(classroomId, studentId, 'present', date)
await attendance.batchRecord(records)
```

### Grading
```typescript
import { grading } from '@/lib/api'

await grading.submitGrade(studentId, classroomId, marks, assignmentId)
const reportCard = await grading.getReportCard(studentId)
```

### Wellbeing (Self)
```typescript
import { self } from '@/lib/api'

await self.logMood(userId, 4, 'Feeling great!')
const history = await self.getMoodHistory(userId)
await self.burnJournal(userId, content) // Privacy-first journaling
```

---

## 🏗️ Common Patterns

### Creating a New Screen
```typescript
// 1. Create file in src/screens/
// 2. Follow this template:

import React from 'react'
import { Box, ScrollView, Heading } from '@gluestack-ui/themed'
import { GlobalHeader } from '@/components/shared'

export default function MyScreen() {
  return (
    <Box sx={{ flex: 1, backgroundColor: '$background' }}>
      <GlobalHeader teacherName="Teacher" userRole="teacher" />
      <ScrollView>
        {/* Content */}
      </ScrollView>
    </Box>
  )
}
```

### Creating a New Component
```typescript
// 1. Create file in src/components/shared/ or feature folder
// 2. Follow this template:

import React from 'react'
import { Box } from '@gluestack-ui/themed'

interface MyComponentProps {
  title: string
  onPress: () => void
}

export function MyComponent({ title, onPress }: MyComponentProps) {
  return (
    <Box>
      {/* Component code */}
    </Box>
  )
}

// 3. Add accessibility
<Button
  accessibilityRole="button"
  accessibilityLabel={title}
  onPress={onPress}
/>
```

### Adding a New API Module
```typescript
// 1. Create file in src/lib/api/
// 2. Follow this template:

import { supabase } from '../supabase'
import { APIError } from './types'

export const myFeature = {
  async getAll(userId: string) {
    try {
      const { data, error } = await supabase
        .from('my_table')
        .select('*')
        .eq('user_id', userId)
      
      if (error) throw new APIError('Failed to fetch', error.code, error)
      return data || []
    } catch (error) {
      throw error
    }
  },
  
  async create(item: MyItem) {
    // Implementation
  }
}

// 3. Export from src/lib/api/index.ts
export { myFeature } from './myFeature'
```

---

## 🐛 Debugging Tips

### View Logs
```bash
# React Native logs
npx react-native log-android
npx react-native log-ios

# Expo logs (included in pnpm start)
```

### Common Issues

**TypeScript errors:**
```bash
# Check errors
npx tsc --noEmit

# Known issues: See COMPREHENSIVE_APP_ANALYSIS.md Section "TypeScript Compilation Errors"
```

**Supabase connection:**
```bash
# Verify .env file exists with:
EXPO_PUBLIC_SUPABASE_URL=your-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-key
```

**Navigation not working:**
```bash
# Clear cache
expo start -c
```

---

## 🧪 Testing (To Be Added)

```bash
# Run tests (after setup)
npm test

# Watch mode
npm test -- --watch

# Coverage
npm test -- --coverage
```

---

## 📚 Documentation

- **Full Analysis:** `COMPREHENSIVE_APP_ANALYSIS.md` (41KB comprehensive guide)
- **API Details:** See "API Inventory" section in analysis
- **Component Library:** See "UI/Design System Inventory" section
- **Security:** See "Security Assessment" section
- **Issues:** See "Issues, Conflicts & Problems" section

---

## 🔧 Development Checklist

### Before Starting Work
- [ ] Pull latest changes
- [ ] Check for TypeScript errors: `npx tsc --noEmit`
- [ ] Review related documentation

### When Adding Features
- [ ] Create TypeScript interfaces for new data types
- [ ] Add accessibility attributes (`accessibilityLabel`, `accessibilityRole`)
- [ ] Use FlatList for lists (not ScrollView)
- [ ] Add error handling with try/catch
- [ ] Use React.memo for list items
- [ ] Use useCallback for event handlers
- [ ] Test on both iOS and Android

### Before Committing
- [ ] No TypeScript errors
- [ ] No console.log statements (use logger utility)
- [ ] Added accessibility attributes
- [ ] Tested on device/simulator
- [ ] Updated documentation if needed

---

## 🚨 Known Issues (Priority)

**Critical (Fix Immediately):**
1. 13 TypeScript compilation errors
2. Missing accessibility attributes
3. No authorization checks in APIs
4. ScrollView performance issues in ClassroomList/GradebookTable

**High Priority (This Week):**
1. No input validation
2. No memoization in components
3. Direct Supabase calls in components

See `COMPREHENSIVE_APP_ANALYSIS.md` for full list and fix strategies.

---

## 🎯 Current Sprint Focus

**Week 1-2: Critical Fixes**
- Fix TypeScript errors
- Add accessibility features
- Implement authorization checks
- Convert ScrollView to FlatList

See "Implementation Strategy & Roadmap" in analysis document for full plan.

---

## 💡 Tips & Best Practices

1. **Use the custom hooks pattern**
   ```typescript
   // Instead of direct Supabase calls
   const { data, loading, error } = useClassrooms(teacherId)
   ```

2. **Always add loading states**
   ```typescript
   {loading ? <LotusLoader /> : <Content />}
   ```

3. **Use Theme constants**
   ```typescript
   // Good
   color: Theme.colors.sanctuarySaffron
   
   // Bad
   color: '#E67E22'
   ```

4. **Follow naming conventions**
   - Components: PascalCase (`MyComponent`)
   - Functions: camelCase (`handleSubmit`)
   - Constants: UPPER_SNAKE_CASE (`API_URL`)
   - Files: Match component name (`MyComponent.tsx`)

5. **Performance matters**
   - Use FlatList for lists
   - Memoize expensive computations
   - Use React.memo for pure components
   - Use useCallback for handlers

---

## 🔗 Useful Links

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [GluestackUI Documentation](https://gluestack.io/)
- [Supabase Documentation](https://supabase.com/docs)
- [React Navigation](https://reactnavigation.org/)

---

**Last Updated:** February 5, 2026  
**For detailed information, see:** `COMPREHENSIVE_APP_ANALYSIS.md`
