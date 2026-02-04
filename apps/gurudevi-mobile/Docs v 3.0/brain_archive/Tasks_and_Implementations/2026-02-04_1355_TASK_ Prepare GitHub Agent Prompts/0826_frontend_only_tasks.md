# FRONTEND-ONLY TASKS (No Supabase Needed)
**Priority List for Today**

---

## ✅ PRIORITY 1: Reusable Components (4 hours)

These are needed for EVERY feature. Building them now = 5x speed boost later.

### 1.1 LotusButton (1 hour)
**What**: Main button component used everywhere

**Variants**:
- `primary` - Sanctuary saffron background
- `secondary` - Transparent with border
- `ghost` - No background

**States**:
- Normal
- Loading (with spinner)
- Disabled

**Props**:
```typescript
interface LotusButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
}
```

**File**: `src/components/LotusButton.tsx`

---

### 1.2 SanctuaryCard (1 hour)
**What**: Card component for lessons, assignments, announcements

**Features**:
- Lift animation on press
- Optional footer
- Rounded corners (generous)
- Sanctuary theme colors

**Props**:
```typescript
interface SanctuaryCardProps {
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  onPress?: () => void;
  elevated?: boolean; // Add shadow
}
```

**File**: `src/components/SanctuaryCard.tsx`

---

### 1.3 Input Components (1.5 hours)

**LotusTextInput**:
```typescript
interface LotusTextInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  multiline?: boolean;
  error?: string;
  disabled?: boolean;
  secureTextEntry?: boolean;
}
```

**LotusDropdown**:
```typescript
interface LotusDropdownProps {
  label: string;
  value: string;
  options: { label: string; value: string }[];
  onChange: (value: string) => void;
  error?: string;
}
```

**Files**:
- `src/components/LotusTextInput.tsx`
- `src/components/LotusDropdown.tsx`

---

### 1.4 Loading States (0.5 hours)

**BreathingLoader**: Pulsing lotus animation
**EmptyState**: "No items yet" with icon
**ErrorMessage**: Gentle error display

**Files**:
- `src/components/BreathingLoader.tsx`
- `src/components/EmptyState.tsx`
- `src/components/ErrorMessage.tsx`

---

## ✅ PRIORITY 2: Split ProfileScreen (1 hour)

**Current**: One big profile screen  
**Goal**: Two tabs - User Settings | App Settings

### User Settings Tab:
- Personal info (name, email)
- Account settings
- Logout button

### App Settings Tab:
- Language selector (Si/Ta/En)
- Theme (light/dark - future)
- Data saver mode toggle
- Accessibility options (future)

**Implementation**:
```tsx
// Use Tab view or simple toggle
<VStack>
  <HStack> {/* Tab selector */}
    <Tab active={activeTab === 'user'} onPress={() => setActiveTab('user')}>
      User Settings
    </Tab>
    <Tab active={activeTab === 'app'} onPress={() => setActiveTab('app')}>
      App Settings
    </Tab>
  </HStack>
  
  {activeTab === 'user' ? <UserSettingsView /> : <AppSettingsView />}
</VStack>
```

**Files**:
- Update `src/screens/ProfileScreen.tsx`
- Create `src/components/SettingsTab.tsx`

---

## ✅ PRIORITY 3: EdLove Translation (30 min)

**Add Microsoft Translator Widget** to EdLove

**File**: `apps/edlove-web/src/layouts/Layout.astro`

**Add this snippet**:
```html
<!-- Microsoft Translator Widget -->
<div id="MicrosoftTranslatorWidget" class="fixed top-4 right-4 z-50"></div>

<script>
  setTimeout(function () {
    var s = document.createElement("script");
    s.type = "text/javascript";
    s.charset = "UTF-8";
    s.src = ((location && location.href && location.href.indexOf("https") == 0) ? 
      "https://ssl.microsofttranslator.com" : "http://www.microsofttranslator.com") +
      "/ajax/v3/WidgetV3.ashx?siteData=ueOIGRSKkd965FeEGM5JtQ**&ctf=True&ui=true&settings=Manual&from=en";
    var p = document.getElementsByTagName('head')[0] || document.documentElement;
    p.insertBefore(s, p.firstChild);
  }, 0);
</script>
```

**Benefits**:
- Instant Sinhala/Tamil translation ✅
- 100+ languages supported ✅
- No maintenance needed ✅

---

## ✅ PRIORITY 4: Mock Data Utilities (1 hour)

**Why**: Test UI without database

**Create mock data generators**:

**File**: `src/utils/mockData.ts`

```typescript
// Mock mood logs
export const mockMoodLogs = [
  { id: '1', emotion: 'calm', intensity: 7, date: new Date() },
  { id: '2', emotion: 'stressed', intensity: 4, date: new Date() },
];

// Mock classrooms
export const mockClassrooms = [
  { 
    id: '1', 
    name: 'Grade 10 - Mathematics',
    grade: '10',
    subject: 'Mathematics',
    students: 45
  },
];

// Mock students
export const mockStudents = [
  { id: '1', name: 'Nimal Perera', marks: 85 },
  { id: '2', name: 'Suresh Kumar', marks: 92 },
  { id: '3', name: 'Amara Silva', marks: 85 },
];

// Mock converter
export function useMockData<T>(data: T): T {
  // In development, return mock data
  // In production, fetch from Supabase
  const isDevelopment = __DEV__;
  return isDevelopment ? data : data;
}
```

**Usage**:
```typescript
// In your screen
const classrooms = useMockData(mockClassrooms);
// Later, replace with: const classrooms = await fetchClassrooms();
```

---

## ✅ PRIORITY 5: Grading UI Components (2 hours)

**Build WITHOUT database** (use mock data):

### GradeEntryForm:
```tsx
<GradeEntryForm onSubmit={handleSubmit}>
  <StudentName>Nimal Perera</StudentName>
  
  <LotusTextInput
    label="Marks (0-100)"
    type="number"
    value={marks}
    onChangeText={setMarks}
  />
  
  {/* Auto-computed GPA preview */}
  <ComputedGrade>
    Grade: {marksToGPA(marks).grade} ({marksToGPA(marks).gpa} GPA)
  </ComputedGrade>
  
  <LotusTextInput
    label="Feedback (Optional)"
    multiline
    value={feedback}
    onChangeText={setFeedback}
  />
  
  <LotusButton title="Save Grade" onPress={handleSubmit} />
</GradeEntryForm>
```

### GradebookTable:
```tsx
<SanctuaryCard title="Mathematics - Gradebook">
  <Table>
    <Header>
      <Column>Student</Column>
      <Column>Marks</Column>
      <Column>Grade</Column>
      <Column>Rank</Column>
    </Header>
    {mockStudents.map(student => (
      <Row key={student.id}>
        <Cell>{student.name}</Cell>
        <Cell>{student.marks}/100</Cell>
        <Cell>{marksToGPA(student.marks).grade}</Cell>
        <Cell>#{student.rank}</Cell>
      </Row>
    ))}
  </Table>
</SanctuaryCard>
```

**Files**:
- `src/components/GradeEntryForm.tsx`
- `src/components/GradebookTable.tsx`
- `src/components/ReportCard.tsx`

---

## ✅ PRIORITY 6: GitHub Agent Prompt Templates (30 min)

**Create reusable prompts** for delegating to GitHub Agent:

**File**: `.agent/github-agent-prompts.md`

```markdown
# GitHub Agent Prompt Templates

## Creating a Component

```
Create a [ComponentName] component in src/components/[ComponentName].tsx

Requirements:
- Props: [list props with types]
- Variants: [list variants]
- States: [list states]
- Use Theme.colors.[colorName] for all colors
- Use Theme.spacing.[size] for spacing
- Use Theme.corners.[size] for border radius
- Add haptic feedback on press actions
- Export as default

Style:
[Describe styling requirements]

Example usage:
[Show usage code]
```

## Adding Translation Keys

```
Add translation keys to i18n/locales/

Keys to add:
{
  "[section]": {
    "[key]": {
      "si": "[Sinhala text]",
      "ta": "[Tamil text]",
      "en": "[English text]"
    }
  }
}
```

## Creating a Screen

```
Create [ScreenName] screen in src/screens/[ScreenName].tsx

Features:
- [List features]
- Use existing components: LotusButton, SanctuaryCard
- Fetch data using: [data source]
- Handle loading state with BreathingLoader
- Handle empty state with EmptyState
- Use navigation: const navigation = useNavigation()

Layout:
[Describe layout]
```
```

---

## 📋 TODAY'S PLAN (No Supabase)

### Morning (3 hours):
1. **Build LotusButton** (1 hour)
2. **Build SanctuaryCard** (1 hour)
3. **Build Input components** (1 hour)

### Afternoon (2 hours):
4. **Split ProfileScreen** (1 hour)
5. **Add EdLove translation** (30 min)
6. **Create mock data utilities** (30 min)

### Evening (Optional, 2 hours):
7. **Build grading UI components** (2 hours)

**Total**: 5-7 hours of productive work, all frontend!

---

## 🎯 WHICH TO START WITH?

Pick one:

**A)** Build components (LotusButton first - most used)  
**B)** Split ProfileScreen (quick win, visible change)  
**C)** Add EdLove translation (30 min quick win)  
**D)** Create grading UI (interesting feature work)

**My recommendation**: Start with **LotusButton** (builds muscle memory for component pattern)

Want me to create the LotusButton component for you now?
