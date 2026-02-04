# 🎯 READY-TO-USE AGENT MODE PROMPTS
**Copy-paste these into GitHub Copilot Agent**

---

## 🔵 PROMPT 1: LotusButton Component

```
Build a reusable button component at src/components/LotusButton.tsx

Requirements:
- Component name: LotusButton
- Use React Native Pressable
- TypeScript with strict types
- Export as default function

Props interface:
interface LotusButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: any;
  iconPosition?: 'left' | 'right';
}

Variants styling:
- primary: 
  - backgroundColor: Theme.colors.sanctuarySaffron
  - color: Theme.colors.white
- secondary:
  - backgroundColor: 'transparent'
  - borderWidth: 2
  - borderColor: Theme.colors.sanctuarySaffron
  - color: Theme.colors.sanctuarySaffron
- ghost:
  - backgroundColor: 'transparent'
  - color: Theme.colors.dimGray

Size styling:
- sm: paddingVertical 8, paddingHorizontal 16, fontSize 14
- md: paddingVertical 12, paddingHorizontal 24, fontSize 16
- lg: paddingVertical 16, paddingHorizontal 32, fontSize 18

All variants:
- borderRadius: Theme.corners.comfortable
- flexDirection: 'row'
- alignItems: 'center'
- justifyContent: 'center'

Behavior:
- On press: call hapticLight() from '../utils/haptics'
- If loading: show ActivityIndicator, disable button
- If disabled: opacity 0.5, prevent press
- Icon placement based on iconPosition

Imports needed:
- React, { FC } from 'react'
- Pressable, Text, ActivityIndicator, StyleSheet from 'react-native'
- Theme from '../constants/Theme'
- hapticLight from '../utils/haptics'

Use StyleSheet.create for styles.
```

---

## 🟢 PROMPT 2: SanctuaryCard Component

```
Build a reusable card component at src/components/SanctuaryCard.tsx

Requirements:
- Component name: SanctuaryCard
- Use React Native View/Pressable
- TypeScript with strict types
- Export as default

Props interface:
interface SanctuaryCardProps {
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  onPress?: () => void;
  elevated?: boolean;
}

Styling:
- backgroundColor: Theme.colors.midnightBlue
- borderRadius: Theme.corners.generous (24px)
- padding: Theme.spacing.lg
- If elevated: add shadow (shadowColor '#000', shadowOffset {0,2}, shadowOpacity 0.1, shadowRadius 8)

Features:
- If onPress provided: make it Pressable with lift animation
- Lift animation: scale 1.0 → 1.02 on press
- If title: render as Text with Theme.typography.h3
- Children render in VStack with spacing
- If footer: render at bottom with top border

Imports:
- React, { FC, ReactNode } from 'react'
- View, Pressable, Text, StyleSheet from 'react-native'
- Animated from 'react-native-reanimated' (for lift animation)
- Theme from '../constants/Theme'
- VStack from '@gluestack-ui/themed'
```

---

## 🟡 PROMPT 3: Input Components

```
Build reusable input components:
1. src/components/LotusTextInput.tsx
2. src/components/LotusDropdown.tsx

LotusTextInput Props:
interface LotusTextInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  multiline?: boolean;
  error?: string;
  disabled?: boolean;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'numeric' | 'email-address';
}

LotusTextInput Styling:
- backgroundColor: Theme.colors.deepIndigo
- borderWidth: 2
- borderColor: error ? Theme.colors.emberRed : Theme.colors.dimGray
- borderRadius: Theme.corners.comfortable
- padding: Theme.spacing.md
- color: Theme.colors.sacredWhite
- fontSize: 16
- If multiline: minHeight 100

LotusTextInput Features:
- Label above input (Text component)
- If error: show error message below in red
- If disabled: opacity 0.6

LotusDropdown Props:
interface LotusDropdownProps {
  label: string;
  value: string;
  options: Array<{ label: string; value: string }>;
  onChange: (value: string) => void;
  error?: string;
}

LotusDropdown Styling:
- Use @gluestack-ui/themed Select component
- Match LotusTextInput styling
- borderRadius: Theme.corners.comfortable

Imports for both:
- React, { FC } from 'react'
- TextInput, View, Text, StyleSheet from 'react-native'
- Select from '@gluestack-ui/themed'
- Theme from '../constants/Theme'
```

---

## 🟣 PROMPT 4: ProfileScreen Split

```
Refactor src/screens/ProfileScreen.tsx to have two tabs:

1. User Settings tab
2. App Settings tab

Use tab switcher at top (HStack with two buttons)

User Settings Tab content:
- Profile info card (name, role, school)
- Logout button

App Settings Tab content:
- Language selector (Si/Ta/En) - MOVE from current location
- Theme toggle (light/dark) - add placeholder for future
- Data saver mode toggle - add placeholder
- Accessibility options - add placeholder

Tab switcher styling:
- HStack with two Pressable buttons
- Active tab: backgroundColor Theme.colors.sanctuarySaffron
- Inactive tab: backgroundColor transparent
- borderRadius: Theme.corners.comfortable
- padding: Theme.spacing.md

State:
- useState for activeTab: 'user' | 'app'
- Default to 'user'

Keep existing:
- All imports
- All state management
- All functions (fetchProfile, handleLogout, changeLanguage)

Just reorganize UI into tabs.
```

---

## 🔴 PROMPT 5: Grading System (LARGE)

```
Build complete grading system with these files:

1. src/components/GradeEntryForm.tsx
2. src/components/GradebookTable.tsx
3. src/components/ReportCard.tsx
4. src/utils/grading.ts
5. src/types/Grade.ts

Refer to the grading system design document for full specifications.

Grade.ts types:
interface StudentGrade {
  id: string;
  student_id: string;
  classroom_id: string;
  marks: number; // 0-100
  grade?: 'A' | 'B' | 'C' | 'D' | 'E' | 'S' | 'F';
  gpa?: number;
  rank?: number;
  feedback?: string;
  graded_at: Date;
}

interface ClassroomGradingSettings {
  classroom_id: string;
  grading_mode: 'marks' | 'gpa' | 'both';
  show_ranks: boolean;
}

grading.ts utilities:
- marksToGPA(marks: number): { grade: string; gpa: number }
- calculateRanks(grades: StudentGrade[]): StudentGrade[]
- Conversion table: 75-100=A(4.0), 65-74=B(3.0), 55-64=C(2.0), etc.

GradeEntryForm features:
- Student name display
- Marks input (0-100, numeric keyboard)
- Auto-computed GPA preview
- Feedback textarea (optional)
- Save button
- Use LotusTextInput and LotusButton components

GradebookTable features:
- Table header: Student | Marks | Grade | Rank
- Row for each student
- Display based on gradingMode setting
- Use SanctuaryCard wrapper

ReportCard features:
- Student info header
- List of assignments with grades
- Overall GPA calculation
- Use SanctuaryCard for each assignment

All components:
- Use Theme colors
- Use i18n for labels (t('grades.marks'), etc.)
- Export as default
```

---

## 📊 USAGE GUIDE

### Estimated Premium Requests:
- Prompt 1 (LotusButton): **1-2 requests**
- Prompt 2 (SanctuaryCard): **1-2 requests**
- Prompt 3 (Inputs): **2-3 requests**
- Prompt 4 (ProfileScreen): **2 requests**
- Prompt 5 (Grading): **6-8 requests**

### Recommended Order:
1. **Start with Prompt 1** (LotusButton) - foundation component
2. **Then Prompt 2** (SanctuaryCard) - used everywhere
3. **Then Prompt 3** (Inputs) - needed for forms
4. **Then Prompt 4** (ProfileScreen split) - quick win
5. **Finally Prompt 5** (Grading) - complex feature

### How to Use:
1. Open VS Code
2. Open GitHub Copilot Chat
3. Switch to "Agent Mode" (look for agent icon)
4. Copy-paste entire prompt
5. Review proposed changes
6. Accept or iterate

### If Agent Asks Questions:
- Theme path: `../constants/Theme`
- Haptics path: `../utils/haptics`
- i18n usage: `import { useTranslation } from 'react-i18next'`
- Components using Gluestack UI v2

---

**Ready to start?** Pick which prompt to try first!
