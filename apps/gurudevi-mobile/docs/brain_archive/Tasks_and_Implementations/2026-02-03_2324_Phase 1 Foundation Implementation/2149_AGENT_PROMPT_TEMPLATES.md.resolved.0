# AI Agent Prompt Templates

> **Copy, fill in the blanks, get better results faster**

---

## 🎯 Why Templates?

**Problem:** Vague prompts = wasted time
- Agent asks clarifying questions
- Makes wrong assumptions
- Creates code you don't need

**Solution:** Clear templates = fast execution
- Agent knows exactly what to do
- No back-and-forth
- Code matches your patterns

**Time Saved:** 50-70% per task!

---

## 📚 Template Library

### 1. Foundation: Theme System

**Use when:** Starting a new project, need design tokens

```markdown
Create a Theme system for [PROJECT_NAME] with:

**Colors:**
- Background: [COLOR_NAME] = #[HEX]
- Primary: [COLOR_NAME] = #[HEX]
- Secondary: [COLOR_NAME] = #[HEX]
- Text: [COLOR_NAME] = #[HEX]
- Accent: [COLOR_NAME] = #[HEX]
- Error: [COLOR_NAME] = #[HEX]

**Typography:**
- Font sizes: xs, sm, md, lg, xl, 2xl (define pixel values)
- Font families: [FONT_NAME]

**Spacing:**
- Scale: xs, sm, md, lg, xl (define pixel values)

**Border Radius:**
- Options: tight, comfortable, generous (define pixel values)

**Shadows:**
- small, medium, large (define CSS values)

**File location:** src/constants/Theme.ts

**Export as:** `export const Theme = { ... }`

**Reference:** [SIMILAR_PROJECT] for style inspiration
```

**Example (Filled):**
```markdown
Create a Theme system for EdLove with:

**Colors:**
- Background: deepPurple = #1A0B2E
- Primary: loveRed = #E63946
- Secondary: softPink = #F4A6B2
- Text: pureWhite = #FFFFFF
- Accent: warmGold = #FFD700
- Error: alertRed = #DC2626

**Typography:**
- Font sizes: xs(12), sm(14), md(16), lg(20), xl(24), 2xl(32)
- Font families: Inter

**Spacing:**
- Scale: xs(4), sm(8), md(16), lg(24), xl(32)

**Border Radius:**
- tight(4), comfortable(8), generous(12)

**Shadows:**
- small: '0 1px 3px rgba(0,0,0,0.1)'
- medium: '0 4px 6px rgba(0,0,0,0.1)'
- large: '0 10px 15px rgba(0,0,0,0.1)'

**File location:** src/constants/Theme.ts

**Export as:** `export const Theme = { ... }`

**Reference:** Gurudevi Theme.ts for structure
```

---

### 2. Foundation: i18n Setup

**Use when:** Setting up multi-language support

```markdown
Create i18n system for [PROJECT_NAME] supporting [LANGUAGES]:

**Languages:**
- Default: [LANGUAGE_CODE]
- Supported: [LANG1], [LANG2], [LANG3]
- Fallback: [LANGUAGE_CODE]

**Folder structure:**
- src/i18n/config.ts (setup)
- src/i18n/locales/[LANG].json (translations)

**Initial translation keys:**
[LIST_KEY_CATEGORIES]

**Example keys:**
- auth.login
- auth.signup
- auth.email
- [MORE_KEYS]

**Library:** Use [i18next / react-i18next / next-i18next]

**Storage:** Persist language preference in [AsyncStorage / localStorage]

**Skip:** Translation content (I'll add manually)
**Focus:** Infrastructure setup only
```

**Example (Filled):**
```markdown
Create i18n system for EdLove supporting English, Spanish, French:

**Languages:**
- Default: en
- Supported: en, es, fr
- Fallback: en

**Folder structure:**
- src/i18n/config.ts (setup)
- src/i18n/locales/en.json
- src/i18n/locales/es.json  
- src/i18n/locales/fr.json

**Initial translation keys:**
- Auth (login, signup, forgot password)
- Profile (settings, logout)
- Dashboard (greeting, stats)
- Errors (network, validation)

**Example keys:**
- auth.login
- auth.signup
- auth.forgotPassword
- profile.settings
- dashboard.welcome

**Library:** Use next-i18next (Next.js project)

**Storage:** Persist in localStorage

**Skip:** Translation content (I'll add manually)
**Focus:** Infrastructure setup only
```

---

### 3. Foundation: Type Definitions

**Use when:** Defining data models

```markdown
Create TypeScript types for [PROJECT_NAME]:

**User type:**
- Fields: [LIST_USER_FIELDS]
- Role enum: [LIST_ROLES]

**[MODEL_NAME] type:**
- Fields: [LIST_FIELDS]
- Relationships: [FOREIGN_KEYS]

**API Response types:**
- SuccessResponse<T>
- ErrorResponse

**File location:** src/types/[ModelName].ts

**Export format:** 
- Interfaces for objects
- Type aliases for unions
- Enums for fixed values

**Skip:** Implementation, just types
```

**Example (Filled):**
```markdown
Create TypeScript types for EdLove:

**User type:**
- Fields: id (string), email (string), name (string), avatar_url (string | null), role (UserRole), created_at (string)
- Role enum: 'admin' | 'user' | 'moderator'

**Conversation type:**
- Fields: id (string), user_id (string), partner_id (string), started_at (string), last_message_at (string)
- Relationships: user (User), partner (User)

**Message type:**
- Fields: id (string), conversation_id (string), sender_id (string), content (string), sent_at (string), read (boolean)
- Relationships: conversation (Conversation), sender (User)

**API Response types:**
- SuccessResponse<T>: { success: true, data: T }
- ErrorResponse: { success: false, error: string }

**File location:** 
- src/types/User.ts
- src/types/Conversation.ts
- src/types/Message.ts
- src/types/Api.ts

**Export format:**
- Interfaces for objects
- Type aliases for unions  
- Enums for fixed values

**Skip:** Implementation, just types
```

---

### 4. Feature: Build Login Screen

**Use when:** Creating authentication UI

```markdown
Build login screen for [PROJECT_NAME]:

**UI Components needed:**
- Email input field
- Password input field
- [LOGIN_BUTTON]
- [SOCIAL_LOGIN_BUTTONS]
- [FORGOT_PASSWORD_LINK]
- [SIGNUP_LINK]

**Functionality:**
- Validate email format
- Show/hide password toggle
- Error handling for [ERROR_CASES]
- Redirect to [SUCCESS_ROUTE] on success

**Styling:**
- Use Theme from [THEME_FILE_PATH]
- Use UI components from [COMPONENT_LIBRARY_PATH]
- Follow [DESIGN_REFERENCE] style

**Auth library:** [NextAuth / Supabase / Firebase]

**File location:** [FILE_PATH]

**Skip:** 
- Tests (I'll add later)
- [OTHER_THINGS_TO_SKIP]
```

**Example (Filled):**
```markdown
Build login screen for EdLove:

**UI Components needed:**
- Email input field (with icon)
- Password input field (with show/hide toggle)
- "Login" button (primary style)
- "Login with Google" button
- "Login with Facebook" button  
- "Forgot password?" link
- "Don't have an account? Sign up" link

**Functionality:**
- Validate email format (show error if invalid)
- Show/hide password toggle (eye icon)
- Error handling for: invalid credentials, network errors, account not verified
- Redirect to /dashboard on success
- Show loading spinner during authentication

**Styling:**
- Use Theme from src/constants/Theme.ts
- Use Button, Input from packages/ui/src
- Follow Pinterest-style: soft shadows, rounded corners, warm colors
- Mobile responsive (center on desktop, full width on mobile)

**Auth library:** NextAuth with Google & Facebook providers

**File location:** app/login/page.tsx

**Skip:**
- Tests (I'll add later)
- Password strength indicator (future feature)
- Remember me checkbox (future feature)
```

---

### 5. Feature: Build Dashboard

**Use when:** Creating main app screen

```markdown
Build dashboard screen for [PROJECT_NAME]:

**Sections:**
1. [SECTION_NAME]: [DESCRIPTION]
2. [SECTION_NAME]: [DESCRIPTION]
3. [SECTION_NAME]: [DESCRIPTION]

**Data to display:**
- [DATA_FIELD]: fetched from [API_ENDPOINT]
- [DATA_FIELD]: fetched from [API_ENDPOINT]

**User actions:**
- [ACTION]: calls [FUNCTION]
- [ACTION]: navigates to [ROUTE]

**Layout:**
- [GRID / FLEXBOX / STACK] layout
- [RESPONSIVE_BREAKPOINTS]

**Styling:**
- Use Theme from [PATH]
- Use components from [PATH]

**Data fetching:**
- Use [SWR / React Query / useEffect]
- Loading state: [DESCRIPTION]
- Error state: [DESCRIPTION]

**File location:** [PATH]

**Skip:**
- Tests
- [OTHER_FEATURES_TO_SKIP]
```

**Example (Filled):**
```markdown
Build dashboard screen for EdLove:

**Sections:**
1. Welcome header: "Welcome back, [Name]" with current date
2. Active conversations: Grid of conversation cards (max 6)
3. Match suggestions: Horizontal scrollable list
4. Daily question: Card prompting conversation starter

**Data to display:**
- conversations: fetched from /api/conversations
- suggestions: fetched from /api/matches/suggestions
- daily_question: fetched from /api/questions/daily

**User actions:**
- Click conversation card: navigates to /chat/[id]
- Click match suggestion: opens match profile modal
- Click "Start conversation": creates new conversation

**Layout:**
- Grid layout (2 columns on desktop, 1 on mobile)
- Responsive breakpoints: mobile (<640px), desktop (>640px)

**Styling:**
- Use Theme from src/constants/Theme.ts
- Use Card, Button, Avatar from packages/ui
- Soft shadows, generous padding, rounded corners

**Data fetching:**
- Use SWR for all API calls
- Loading state: Skeleton cards (shimmer effect)
- Error state: "Failed to load" message with retry button

**File location:** app/dashboard/page.tsx

**Skip:**
- Tests
- Real-time updates (add WebSocket later)
- Infinite scroll (add pagination later)
```

---

### 6. Bug Fix Template

**Use when:** Fixing specific bugs

```markdown
Fix bug in [FEATURE_NAME]:

**Problem:**
[DESCRIBE_BUG]

**Current behavior:**
[WHAT_HAPPENS_NOW]

**Expected behavior:**
[WHAT_SHOULD_HAPPEN]

**Where it happens:**
- File: [FILE_PATH]
- Function/Component: [NAME]
- Line: [LINE_NUMBER] (if known)

**Reproduction steps:**
1. [STEP_1]
2. [STEP_2]
3. [OBSERVE_BUG]

**Suspected cause:**
[YOUR_HYPOTHESIS]

**Don't change:**
- [THINGS_THAT_WORK]
- [OTHER_FEATURES]

**Test after fix:**
[HOW_TO_VERIFY_FIX]
```

**Example (Filled):**
```markdown
Fix bug in Gurudevi language selector:

**Problem:**
Language doesn't persist after app restart

**Current behavior:**
- User selects Tamil
- App switches to Tamil
- User closes app
- App reopens in Sinhala (default)

**Expected behavior:**
- Language selection persists across app restarts

**Where it happens:**
- File: src/screens/ProfileScreen.tsx
- Function: handleLanguageChange
- Line: ~75

**Reproduction steps:**
1. Open Gurudevi app
2. Go to Profile tab
3. Tap Tamil language selector
4. Close app completely
5. Reopen app
6. Observe: back to Sinhala

**Suspected cause:**
Language change updates i18n but doesn't save to AsyncStorage

**Don't change:**
- i18n configuration (that works)
- UI components (they're fine)

**Test after fix:**
1. Change language
2. Close and reopen app  
3. Verify language persists
```

---

### 7. Refactoring Template

**Use when:** Improving existing code

```markdown
Refactor [FEATURE_NAME] to [GOAL]:

**Current state:**
- File: [PATH]
- Issues: [LIST_PROBLEMS]

**Desired state:**
[DESCRIBE_IMPROVEMENT]

**Changes needed:**
1. [CHANGE_1]
2. [CHANGE_2]
3. [CHANGE_3]

**Keep working:**
- [FUNCTIONALITY_TO_PRESERVE]
- [TESTS_TO_PASS]

**Patterns to follow:**
- [PATTERN_REFERENCE]
- Use [LIBRARY/UTIL]

**Don't break:**
- [DEPENDENCIES]
- [RELATED_FEATURES]
```

**Example (Filled):**
```markdown
Refactor Gurudevi AuthScreen to use Theme constants:

**Current state:**
- File: src/screens/AuthScreen.tsx
- Issues: 
  - Hardcoded colors ($backgroundDark950, $orange500)
  - Hardcoded spacing (px={20}, mt={10})
  - Hardcoded border radius

**Desired state:**
Consistent use of Theme.ts throughout component

**Changes needed:**
1. Replace all Gluestack color tokens with Theme.colors.[name]
2. Replace hardcoded spacing with Theme.spacing.[size]
3. Replace borderRadius with Theme.corners.[name]

**Keep working:**
- All auth functionality (login, signup, role selection)
- Form validation
- Error handling
- Navigation flow

**Patterns to follow:**
- Reference: SelfScreen.tsx (already refactored)
- Use sx={{ backgroundColor: Theme.colors.voidIndigo }}
- Use space={Theme.spacing.md}

**Don't break:**
- i18n translations (keep all t() calls)
- Supabase integration
- Navigation to tabs
```

---

## 🎯 Best Practices

### DO:
✅ Be specific (exact file paths, function names)
✅ Reference existing code ("like in [FILE]")
✅ List what to skip (tests, edge cases)
✅ Provide examples (colors as #HEX, not "blue")
✅ State constraints ("use [LIBRARY]", "don't change [THING]")

### DON'T:
❌ Be vague ("make it nice", "add login")
❌ Assume agent knows your patterns
❌ Ask for tests if you want to skip them
❌ Leave file paths ambiguous
❌ Forget to mention existing components to reuse

---

## 💡 Template Usage Tips

**1. Copy template → Fill blanks → Send to agent**

**2. Save your filled templates:**
Create a `/prompts` folder in your project:
```
/prompts
  /gurudevi
    - create_venting_feature.md
    - refactor_profile_screen.md
  /edlove
    - create_chat_screen.md
    - add_websocket.md
```

**3. Reuse patterns:**
Built login for EdLove? Copy that prompt for Gurudevi login!

**4. Update as you learn:**
Agent did something great? Add it to your template!

---

## 🚀 Advanced: Multi-Step Templates

### For Complex Features (Break into steps):

```markdown
**STEP 1: Create database schema**
[USE TYPE TEMPLATE]

**STEP 2: Create API routes**
[USE API TEMPLATE]

**STEP 3: Build UI components**
[USE FEATURE TEMPLATE]

**STEP 4: Connect UI to API**
[USE INTEGRATION TEMPLATE]
```

**Why?** Agent handles one thing at a time → fewer mistakes

---

## 📋 Quick Reference

| Task | Template # | Time Saved |
|------|-----------|------------|
| New project setup | #1, #2, #3 | 2-3 hours |
| Auth feature | #4 | 1-2 hours |
| Dashboard | #5 | 1-2 hours |
| Bug fix | #6 | 30-60 min |
| Refactoring | #7 | 1 hour |

---

**Remember:** Time spent writing clear prompt = Time saved in agent execution + fixes!

**Good prompt:** 5 min to write → 10 min agent work → Done ✅
**Bad prompt:** 1 min to write → 30 min agent work + back-and-forth + fixes → Frustration ❌
