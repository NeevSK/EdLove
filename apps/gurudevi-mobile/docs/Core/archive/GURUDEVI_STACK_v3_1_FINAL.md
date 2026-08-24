---
title: "GURUDEVI BATTLE-TESTED STACK v3.1 FINAL"
status: "active"
created: 2026-02-28
updated: 2026-02-28
author: "Naveen"
scribe: "opencode"
tags: [apps, gurudevi-mobile]
---

# GURUDEVI BATTLE-TESTED STACK v3.1 FINAL
## *Complete Production Blueprint - Aligned with Architecture v4.0*

---

> *"Four builds failed before one succeeded.*  
> *Every feature validated, every timeline tested.*  
> *This is the definitive guide—architecture and implementation unified."*

---

**Document Purpose**: The complete technical stack and implementation guide for Gurudevi, fully aligned with Architecture v4.0.

**Version**: 3.1 FINAL (Aligned with Architecture v4.0)  
**Last Updated**: February 1, 2026  
**Status**: Production-ready  
**Timeline Philosophy**: 10 months realistic, 12 months with buffer  
**Cost Philosophy**: Conservative max-case estimates  

**What Changed in v3.1**:
- ✅ **Aligned with Architecture v4.0** (5-tab navigation, Community/Library features)
- ✅ Community v0.1: Announcements with posting + read receipts
- ✅ Library v0.1: Teacher upload/view (not just curated)
- ✅ Rewards System detailed (points, levels, badges, leaderboards)
- ✅ FAB implementation (context-aware floating action button)
- ✅ Maps integration (school locations, field trips)
- ✅ Cross-references to Architecture v4.0 for structure details
- ✅ Cross-references to Security Foundation v2.0 for security

---

# TABLE OF CONTENTS

**PART 1**: Core Stack (Battle-Tested)  
**PART 2**: 5-Tab Navigation Structure  
**PART 3**: Feature Complexity Matrix  
**PART 4**: Implementation Details (v0.1 → v1.0)  
**PART 5**: Sri Lanka Optimization  
**PART 6**: Timeline & Cost Analysis  
**PART 7**: Quick Start & Critical Gotchas  

---

# EXECUTIVE SUMMARY

## The Vision

**Gurudevi** = Education ecology support system for Sri Lankan schools

**Core Identity**:
- 🏫 School learning platform (NOT meditation app)
- 🪷 Sanctuary aesthetics (calm, nurturing, focused UI)
- 🌱 Education ecology ideology
- 🇱🇰 Sri Lanka-first (Si/Ta/En, PayHere, mobile data-conscious)

## The Stack (Battle-Tested)

```json
{
  "framework": {
    "expo": "~54.0.32",
    "react": "19.1.0",
    "react-native": "0.81.5",
    "typescript": "~5.9.2"
  },
  "ui": {
    "@gluestack-ui/themed": "^1.1.73",
    "lucide-react-native": "~0.563.0"
  },
  "animations": {
    "react-native-reanimated": "~4.1.1",
    "react-native-gesture-handler": "^2.20.0"
  },
  "state": {
    "zustand": "^5.0.10",
    "@tanstack/react-query": "^5.90.20",
    "react-native-mmkv": "^4.1.1"
  },
  "backend": {
    "@supabase/supabase-js": "^2.90.1"
  },
  "i18n": {
    "react-i18next": "^13.5.0",
    "i18next": "^23.7.0"
  },
  "testing": {
    "jest-cucumber": "^4.5.0",
    "@testing-library/react": "^16.1.0",
    "react-native-web": "^0.19.13"
  }
}
```

## The 5-Tab Architecture

**From Architecture v4.0** - This structure NEVER changes:

```
Bottom Navigation (WhatsApp-style):

🧘 Self    |    🏫 Classroom    |    🌸 Community    |    📚 Library    |    👤 Profile
```

**Same structure for ALL roles** (student, teacher, principal) - different content within each tab.

**See Architecture v4.0 Part 2** for detailed tab specifications.

## Roadmap (Flexible Timelines)

**v0.1 (Months 1-3)**:
- Core: Auth, roles, 5-tab navigation, classrooms, content, announcements
- Community: Basic (principals post, all view, read receipts)
- Library: Basic upload/view (teachers upload, students view)
- Timeline: 10-12 weeks (optimistic) | 12-14 weeks (realistic)
- Cost: $0/month

**v0.5 (Months 4-6)**:
- Revenue: Pricing tiers, PayHere integration
- Features: Forms, Rewards, FAB, Maps, OCR
- Timeline: +10-12 weeks (realistic)
- Cost: $25-50/month

**v1.0 (Months 7-12)**:
- Power: AI assistant, offline mode (SQLite)
- Timeline: +12-14 weeks (realistic)
- Cost: $50-200/month (max with AI)

**Total**: 10 months (realistic) | 12 months (with buffer)

---

# PART 1: CORE STACK (BATTLE-TESTED)

## 1.1 The Winning Configuration

**Critical**: This exact combination is battle-tested through 4 failed builds.

### **Framework Versions** (EXACT):

```json
{
  "expo": "~54.0.32",
  "react": "19.1.0",
  "react-native": "0.81.5",
  "typescript": "~5.9.2"
}
```

### **Why These Versions**:
- React 19: Latest stable (Dec 2024), includes React Compiler
- Expo SDK 54: Latest stable (Feb 2026)
- RN 0.81.5: Required for React 19 compatibility
- New Architecture: ENABLED (mandatory for React 19)

### **Battle Scars** (Learn from failures):

| Build # | Failure | Root Cause | Solution |
|---------|---------|-----------|----------|
| 1 | Install crash | Cloud rejected React 19 | Added `legacy-peer-deps=true` to .npmrc |
| 2 | Gradle crash | New Arch vs Reanimated 3 | Disabled New Arch temporarily |
| 3 | Gradle crash | Reanimated 3 incompatible | Upgraded to Reanimated 4 |
| 4 | ✅ SUCCESS | All versions aligned | Exact config above |

---

## 1.2 Complete Dependencies

### **UI & Styling**:

```json
{
  "@gluestack-ui/themed": "^1.1.73",
  "@gluestack-ui/config": "^1.1.20",
  "@gluestack-style/react": "^1.0.57",
  "lucide-react-native": "~0.563.0",
  "react-native-svg": "15.12.1",
  "react-native-safe-area-context": "~5.6.0"
}
```

**Why Gluestack** (not Tamagui or NativeBase):
- ✅ 3x faster than NativeBase
- ✅ React 19 compatible
- ✅ Perfect for Sinhala/Tamil fonts (custom font support)
- ✅ Sanctuary aesthetics easy to build

**Architectural Decision: UI Abstraction Layer (`@/ui`)**
- 🚨 **Mandatory**: All UI components MUST be imported from `@/ui` (e.g., `import { Box } from '@/ui'`).
- **Reasoning**: Solves TypeScript stack overflow by using direct sub-module imports and enables aggressive tree-shaking for low-end devices.
- **Enforcement**: Direct imports from `@gluestack-ui/themed` are restricted to the abstraction layer itself.
- ❌ Tamagui: React 19 incompatible (as of Feb 2026)

### **Animations**:

```json
{
  "react-native-reanimated": "~4.1.1",
  "react-native-worklets": "^0.5.2",
  "react-native-gesture-handler": "^2.20.0"
}
```

**CRITICAL**: NO MOTI (broken with Reanimated 4)

### **State Management**:

```json
{
  "zustand": "^5.0.10",
  "@tanstack/react-query": "^5.90.20",
  "react-native-mmkv": "^4.1.1"
}
```

**Pattern**:
- Zustand: Global state (user, settings)
- TanStack Query: Server state (fetching, caching)
- MMKV: Persistence (30x faster than AsyncStorage)

### **Backend (Cloud-First)**:

```json
{
  "@supabase/supabase-js": "^2.90.1",
  "react-native-url-polyfill": "^3.0.0"
}
```

**Strategy**: Supabase cloud-first (v0.1-v0.5), add SQLite offline in v1.0

### **Internationalization**:

```json
{
  "react-i18next": "^13.5.0",
  "i18next": "^23.7.0"
}
```

**Critical for Sri Lanka**: Sinhala/Tamil/English from day 1

### **Device APIs** (Expo):

```json
{
  "expo-av": "^14.0.7",
  "expo-image": "^1.14.0",
  "expo-image-picker": "^15.0.7",
  "expo-document-picker": "^12.0.2",
  "expo-barcode-scanner": "^13.0.1",
  "expo-print": "^13.0.1",
  "expo-sharing": "^12.0.1",
  "expo-ocr": "latest"
}
```

**expo-ocr**: Sinhala/Tamil text recognition (v0.5 feature)

### **Maps** (v0.5):

```json
{
  "react-native-maps": "^1.15.0"
}
```

### **Navigation**:

```json
{
  "@react-navigation/native": "^7.0.0",
  "@react-navigation/bottom-tabs": "^7.0.0",
  "@react-navigation/stack": "^7.0.0"
}
```

---

## 1.3 Critical Configuration Files

### **.npmrc** (REQUIRED):

```
legacy-peer-deps=true
```

**Why**: React 19 peer dependency conflicts without this

### **app.json**:

```json
{
  "expo": {
    "name": "Gurudevi",
    "slug": "gurudevi",
    "version": "0.1.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "newArchEnabled": true,
    "jsEngine": "hermes",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#FFF8F0"
    },
    "ios": {
      "bundleIdentifier": "lk.gurudevi.app"
    },
    "android": {
      "package": "lk.gurudevi.app",
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#FFF8F0"
      }
    }
  }
}
```

### **babel.config.js**:

```javascript
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin'  // MUST be last!
    ]
  };
};
```

### **eas.json**:

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "env": {
        "NPM_CONFIG_LEGACY_PEER_DEPS": "true"
      }
    },
    "preview": {
      "distribution": "internal",
      "env": {
        "NPM_CONFIG_LEGACY_PEER_DEPS": "true"
      }
    },
    "production": {
      "env": {
        "NPM_CONFIG_LEGACY_PEER_DEPS": "true"
      }
    }
  }
}
```

---

# PART 2: 5-TAB NAVIGATION STRUCTURE

**Note**: For detailed role-based content within each tab, see **Architecture v4.0 Part 2**.

## 2.1 Bottom Tab Navigator (Universal)

```typescript
// navigation/BottomTabNavigator.tsx
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';

const Tab = createBottomTabNavigator();

const TABS = [
  { 
    id: 'self',
    icon: 'lotus',
    labelKey: 'tabs.self',
    color: '#E67E22'
  },
  { 
    id: 'classroom',
    icon: 'school',
    labelKey: 'tabs.classroom',
    color: '#8FBC8F'
  },
  { 
    id: 'community',
    icon: 'users',
    labelKey: 'tabs.community',
    color: '#87CEEB'
  },
  { 
    id: 'library',
    icon: 'book-open',
    labelKey: 'tabs.library',
    color: '#FF6347'
  },
  { 
    id: 'profile',
    icon: 'user',
    labelKey: 'tabs.profile',
    color: '#0f0f1e'
  }
] as const;

export const BottomTabNavigator = () => {
  const { t } = useTranslation();
  
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FFF8F0',
          borderTopColor: '#E0E0E0',
        }
      }}
    >
      {TABS.map(tab => (
        <Tab.Screen
          key={tab.id}
          name={tab.id}
          component={getScreenComponent(tab.id)}
          options={{
            tabBarLabel: t(tab.labelKey),
            tabBarIcon: ({ color, size }) => (
              <Icon name={tab.icon} color={color} size={size} />
            )
          }}
        />
      ))}
    </Tab.Navigator>
  );
};

const getScreenComponent = (tabId: string) => {
  switch (tabId) {
    case 'self': return SelfScreen;
    case 'classroom': return ClassroomScreen;
    case 'community': return CommunityScreen;
    case 'library': return LibraryScreen;
    case 'profile': return ProfileScreen;
  }
};
```

## 2.2 Role-Based Content (Pattern)

```typescript
// screens/ClassroomScreen.tsx
const ClassroomScreen = () => {
  const role = useUserStore(state => state.role);
  
  // Same screen, different views based on role
  switch (role) {
    case 'student':
      return <StudentClassroomView />;
    case 'teacher':
      return <TeacherClassroomView />;
    case 'principal':
      return <PrincipalClassroomView />;
  }
};
```

**See Architecture v4.0 Section 2.2-2.6** for detailed content specifications per role.

---

# PART 3: FEATURE COMPLEXITY MATRIX

**Updated to align with Architecture v4.0**

| Feature | Difficulty | Timeline (Realistic) | Max Cost/Month | Version |
|---------|-----------|---------------------|----------------|---------|
| **Core Stack** | ✅ Done | 0 weeks | $0 | v0.1 |
| **User Roles & RLS** | ⚠️ Medium | 2-3 weeks | $0 | v0.1 |
| **5-Tab Navigation** | ✅ Easy | 1 week | $0 | v0.1 |
| **Self Section (Full)** | ⚠️ Medium | 2-3 weeks | $0 | v0.1 |
| **Classroom (Basic)** | ⚠️ Medium | 3-4 weeks | $0-25 | v0.1 |
| **Community (Basic)** | ✅ Easy | 1-2 weeks | $0 | v0.1 |
| **Library (Upload/View)** | ⚠️ Medium | 2-3 weeks | $0-25 | v0.1 |
| **Announcements + Read Receipts** | ✅ Easy | 1 week | $0 | v0.1 |
| **Progress Tracking** | ✅ Easy | 1 week | $0 | v0.1 |
| **i18n (Si/Ta/En)** | ⚠️ Medium | 1-2 weeks | $0 | v0.1 |
| **Data Saver Mode** | ✅ Easy | 2-3 days | $0 | v0.1 |
| **QR Gift Codes** | ✅ Easy | 1 week | $0 | v0.1 |
| **Forms & Polls** | ⚠️ Medium | 2-3 weeks | $0 | v0.5 |
| **Rewards System** | ⚠️ Medium | 4-5 weeks | $0 | v0.5 |
| **PayHere Integration** | ⚠️ Medium | 1-2 weeks | $0 | v0.5 |
| **Pricing Tiers** | 🚨 Hard | 4-5 weeks | $0 | v0.5 |
| **OCR (Si/Ta)** | ⚠️ Medium | 1 week | $0 | v0.5 |
| **PDF Generation** | ⚠️ Medium | 2 weeks | $0 | v0.5 |
| **FAB** | ✅ Easy | 1 week | $0 | v0.5 |
| **Maps** | ⚠️ Medium | 1 week | $0 | v0.5 |
| **AI Assistant** | 🚨 Hard | 2-3 weeks | $50-200 | v1.0 |
| **Offline Mode (SQLite)** | 🚨 Hard | 3-4 weeks | $0 | v1.0 |
| **Advanced Analytics** | ⚠️ Medium | 2-3 weeks | $0 | v1.0 |

**Difficulty Key**:
- ✅ Easy: 1-2 weeks, straightforward
- ⚠️ Medium: 2-5 weeks, some complexity
- 🚨 Hard: 4+ weeks, significant complexity

---

# PART 4: IMPLEMENTATION DETAILS

## 4.1 v0.1 - MVP (Weeks 1-14)

**Goal**: Validate school adoption with working 5-tab platform

### **Week-by-Week Breakdown**:

**Weeks 1-2: Foundation**
- Project setup (Expo + dependencies)
- Supabase project creation
- Authentication (email/password)
- User roles setup (student/teacher/principal)
- Basic navigation shell

**Weeks 3-4: Schools & Classrooms**
- Schools table + multi-tenant RLS
- Classrooms creation
- Student enrollment (join codes)
- Role-based navigation
- **See Architecture v4.0 Part 4** for schema

**Weeks 5-6: Self Section**
- Daily mood check-in (lotus petals)
- Reflection journal (text + voice)
- Breathing exercises
- Weekly prompts

**Weeks 7-8: Classroom Section**
- Teacher: Upload content (PDF/video)
- Student: View assigned lessons
- Basic progress tracking
- Content viewing (expo-av for video)

**Weeks 9-10: Community & Library**
- Community: Announcements (principal post, all view, read receipts)
- Library: Teacher upload, student view
- Realtime updates (Supabase realtime)
- 20 pre-curated seed resources

**Weeks 11-12: Profile & i18n**
- Profile editing
- Language selection (Si/Ta/En)
- Data saver mode toggle
- Settings screen

**Weeks 13-14: Polish & Testing**
- Sanctuary theme application
- Lotus petal assistant (basic)
- Natural animations (Reanimated 4)
- Bug fixes
- Deploy to TestFlight/Play Store (beta)

### **Success Metrics**:
- 10 teachers using daily for 2 weeks
- 100+ students enrolled
- 50+ pieces of content uploaded
- <1% crash rate

---

## 4.2 v0.5 - Revenue (Weeks 15-26)

**Goal**: Generate revenue for sustainability

### **Weeks 15-17: Forms & Polls**

**Implementation**:
```typescript
// Using React Hook Form + Zod
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const pollSchema = z.object({
  question: z.string().min(10).max(200),
  options: z.array(z.string()).min(2).max(6),
  deadline: z.date().optional(),
  anonymous: z.boolean().default(false)
});

type PollForm = z.infer<typeof pollSchema>;

const CreatePollScreen = () => {
  const { control, handleSubmit } = useForm<PollForm>({
    resolver: zodResolver(pollSchema)
  });
  
  const onSubmit = async (data: PollForm) => {
    await supabase.from('polls').insert({
      school_id: schoolId,
      created_by: userId,
      ...data
    });
  };
  
  return (
    <Form>
      <Controller
        control={control}
        name="question"
        render={({ field }) => (
          <Input label="Question" {...field} />
        )}
      />
      {/* ... other fields */}
    </Form>
  );
};
```

### **Weeks 18-22: Rewards System**

**See Architecture v4.0 Section 7.5** for complete implementation:
- Points economy (10-25 points per action)
- 10 levels (Seed → Sacred)
- Badges (streaks, milestones, achievements)
- Leaderboards (school-wide)
- Unlockable features

**Key Tables**:
```sql
CREATE TABLE user_points (
  user_id UUID REFERENCES users(id),
  total_points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0
);

CREATE TABLE user_badges (
  user_id UUID REFERENCES users(id),
  badge_id TEXT,
  awarded_at TIMESTAMPTZ DEFAULT now()
);
```

### **Weeks 23-24: PayHere Integration**

```typescript
// Sri Lankan payment gateway
import { PayHere } from 'react-native-payhere';

const initiatePayment = async (tier: 'pro' | 'premium') => {
  const amount = tier === 'pro' ? 1500 : 3000;  // LKR
  
  const payment = {
    merchant_id: process.env.PAYHERE_MERCHANT_ID,
    merchant_secret: process.env.PAYHERE_MERCHANT_SECRET,
    notify_url: 'https://your-domain.com/api/payhere/notify',
    order_id: `ORDER_${Date.now()}`,
    items: `Gurudevi ${tier}`,
    amount: amount.toFixed(2),
    currency: 'LKR',
    first_name: user.name,
    last_name: '',
    email: user.email,
    phone: user.phone,
    address: '',
    city: '',
    country: 'Sri Lanka'
  };
  
  try {
    const result = await PayHere.startPayment(payment);
    if (result.status === 'success') {
      await activateSubscription(user.id, tier);
    }
  } catch (error) {
    console.error('Payment failed:', error);
  }
};
```

### **Weeks 25-26: Pricing Tiers + FAB + Maps**

**Pricing Tiers** (🚨 Hard - 4-5 weeks in reality):
- Free tier checks (RLS policies)
- Pro/Premium unlocks
- RevenueCat integration (optional)
- Subscription management UI

**FAB**: See Architecture v4.0 Section 7.6
**Maps**: See Architecture v4.0 Section 7.7

### **Success Metrics**:
- 10% conversion to paid
- LKR 50,000+ monthly revenue
- 50+ paid subscriptions

---

## 4.3 v1.0 - Power (Weeks 27-40)

**Goal**: Compete with international platforms

### **Weeks 27-30: SQLite + Offline Mode**

```typescript
// Add Drizzle ORM + SQLite
import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite/next';

const expo = openDatabaseSync('gurudevi.db');
const db = drizzle(expo);

// Sync logic
const syncOfflineData = async () => {
  const pendingItems = await db.select().from(reflections).where(eq(reflections.synced, false));
  
  for (const item of pendingItems) {
    try {
      await supabase.from('reflections').upsert(item);
      await db.update(reflections).set({ synced: true }).where(eq(reflections.id, item.id));
    } catch (error) {
      console.error('Sync failed:', error);
    }
  }
};
```

### **Weeks 31-33: AI Assistant**

```typescript
// Claude API integration (Pro/Premium only)
const generateLessonPlan = async (topic: string, grade: string, language: 'si' | 'ta' | 'en') => {
  const tier = useUserStore.getState().tier;
  
  if (tier !== 'pro' && tier !== 'premium') {
    return { error: 'Upgrade to Pro or Premium' };
  }
  
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: `Generate a lesson plan for ${topic} for grade ${grade} in ${language === 'si' ? 'Sinhala' : language === 'ta' ? 'Tamil' : 'English'}. Include: learning objectives, activities, assessment.`
      }]
    })
  });
  
  const data = await response.json();
  return data.content[0].text;
};
```

**Cost**: ~$50-200/month (depends on usage)

### **Weeks 34-40: Polish + Analytics + Testing**

- Principal dashboard (school-wide analytics)
- Advanced progress charts
- Video conferencing (Agora.io - optional)
- Performance optimization
- Full testing suite
- Production deployment

### **Success Metrics**:
- 1000+ active students
- LKR 200,000+ monthly revenue
- <1% churn rate
- 5+ schools fully onboarded

---

# PART 5: SRI LANKA OPTIMIZATION

## 5.1 Multilingual (Si/Ta/En)

### **Translation Setup**:

```typescript
// i18n/config.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n.use(initReactI18next).init({
  resources: {
    si: { translation: require('./locales/si.json') },
    ta: { translation: require('./locales/ta.json') },
    en: { translation: require('./locales/en.json') }
  },
  lng: 'si',  // Default Sinhala
  fallbackLng: 'en'
});
```

### **Translation Files**:

```json
// i18n/locales/si.json
{
  "tabs": {
    "self": "ස්වයං",
    "classroom": "පන්තිය",
    "community": "ප්‍රජාව",
    "library": "පුස්තකාලය",
    "profile": "පැතිකඩ"
  },
  "common": {
    "save": "සුරකින්න",
    "cancel": "අවලංගු කරන්න",
    "upload": "උඩුගත කරන්න"
  }
}
```

### **Font Loading** (Critical for Sinhala/Tamil):

```typescript
import { useFonts } from 'expo-font';

const [fontsLoaded] = useFonts({
  'NotoSansSinhala-Regular': require('./assets/fonts/NotoSansSinhala-Regular.ttf'),
  'NotoSansSinhala-Bold': require('./assets/fonts/NotoSansSinhala-Bold.ttf'),
  'NotoSansTamil-Regular': require('./assets/fonts/NotoSansTamil-Regular.ttf'),
  'NotoSansTamil-Bold': require('./assets/fonts/NotoSansTamil-Bold.ttf'),
});
```

**CRITICAL**: All TextInput components MUST have:
```typescript
<TextInput
  autoCorrect={false}
  autoCapitalize="none"
  style={{ fontFamily: 'NotoSansSinhala-Regular' }}
/>
```

---

## 5.2 Data Saver Mode

**Purpose**: Reduce mobile data usage for teachers with limited data plans

```typescript
const DataSaverToggle = () => {
  const [dataSaver, setDataSaver] = useUserStore(state => [
    state.dataSaverMode,
    state.updateSettings
  ]);
  
  return (
    <Switch
      value={dataSaver}
      onValueChange={(value) => {
        setDataSaver({ dataSaverMode: value });
      }}
    />
  );
};

// Apply data saver in image loading
const OptimizedImage = ({ uri }) => {
  const dataSaver = useUserStore(state => state.dataSaverMode);
  
  return (
    <Image
      source={{ uri }}
      contentFit={dataSaver ? 'contain' : 'cover'}
      cachePolicy="memory-disk"
      // Lower quality for data saver
      transition={dataSaver ? 0 : 200}
    />
  );
};

// Reduce video quality
const VideoPlayer = ({ uri }) => {
  const dataSaver = useUserStore(state => state.dataSaverMode);
  
  const videoSource = dataSaver 
    ? uri.replace('.mp4', '_360p.mp4')  // Lower res
    : uri;
  
  return <Video source={{ uri: videoSource }} />;
};
```

---

## 5.3 PayHere Integration

**Sri Lankan Payment Gateway**

### **Setup**:

1. Create account at payhere.lk
2. Get Merchant ID + Merchant Secret
3. Configure webhooks

### **Implementation**:

```typescript
// lib/payhere.ts
export const createPayment = async (
  userId: string,
  tier: 'pro' | 'premium',
  duration: 'monthly' | 'yearly'
) => {
  const amounts = {
    pro: { monthly: 1500, yearly: 15000 },
    premium: { monthly: 3000, yearly: 30000 }
  };
  
  const amount = amounts[tier][duration];
  
  // Generate order ID
  const orderId = `GD_${userId}_${Date.now()}`;
  
  // Create payment record
  await supabase.from('payment_attempts').insert({
    user_id: userId,
    order_id: orderId,
    tier,
    duration,
    amount,
    status: 'pending'
  });
  
  return {
    merchant_id: process.env.PAYHERE_MERCHANT_ID,
    merchant_secret: process.env.PAYHERE_MERCHANT_SECRET,
    notify_url: 'https://gurudevi.lk/api/payhere/notify',
    order_id: orderId,
    items: `Gurudevi ${tier} - ${duration}`,
    amount: amount.toFixed(2),
    currency: 'LKR'
  };
};

// Webhook handler (Supabase Edge Function)
export const handlePayHereNotification = async (notification) => {
  const { order_id, status_code, payment_id } = notification;
  
  if (status_code === '2') {
    // Payment successful
    await supabase.from('payment_attempts')
      .update({ 
        status: 'completed',
        payment_id 
      })
      .eq('order_id', order_id);
    
    // Activate subscription
    const { data: payment } = await supabase
      .from('payment_attempts')
      .select('user_id, tier, duration')
      .eq('order_id', order_id)
      .single();
    
    await activateSubscription(payment.user_id, payment.tier, payment.duration);
  }
};
```

---

# PART 6: TIMELINE & COST ANALYSIS

## 6.1 Realistic Timeline (10-12 Months)

### **v0.1 - MVP** (Weeks 1-14):
- Optimistic: 10 weeks
- **Realistic: 12-14 weeks** ← Use this
- Max-case: 16 weeks

**Factors**:
- Learning curve (Expo, Supabase, Gluestack)
- RLS policy complexity
- Multi-role testing
- Sinhala/Tamil font issues
- Polish time

### **v0.5 - Revenue** (Weeks 15-26):
- Optimistic: 8 weeks
- **Realistic: 10-12 weeks** ← Use this
- Max-case: 14 weeks

**Factors**:
- PayHere integration testing
- Rewards system complexity
- Pricing tier RLS policies
- FAB + Maps integration
- User feedback iteration

### **v1.0 - Power** (Weeks 27-40):
- Optimistic: 10 weeks
- **Realistic: 12-14 weeks** ← Use this
- Max-case: 16 weeks

**Factors**:
- SQLite migration complexity
- AI cost optimization
- Sync conflict resolution
- Performance optimization
- Production deployment

**Total Realistic**: 34-40 weeks = **8-10 months**  
**Total with Buffer**: **10-12 months**

---

## 6.2 Cost Analysis (Max-Case)

### **Development Costs** (Your Time):

- v0.1: ~300-400 hours (solo + AI assistance)
- v0.5: ~200-300 hours
- v1.0: ~300-400 hours
- **Total**: ~800-1,100 hours

**If valued at $50/hour**: $40,000-55,000 opportunity cost

### **Infrastructure Costs**:

**v0.1** (Free tier):
- Supabase: $0 (500MB DB, 1GB storage, 50K MAU)
- Expo: $0
- **Total: $0/month**

**v0.5** (Growing):
- Supabase: $0-25 (may need Pro for storage)
- PayHere: 3.5% + LKR 5 per transaction
- **Total: $0-50/month**

**v1.0** (At Scale):
- Supabase: $25-50 (Pro plan for 100GB storage)
- AI (Claude): $50-200/month (depends on usage)
  - 100 users, 10 queries/month: ~$50
  - 500 users, 20 queries/month: ~$150
  - 1000 users, 30 queries/month: ~$200
- **Total: $75-250/month**

### **Revenue Projections** (Conservative):

**Assumptions**:
- 100 teachers enrolled (v0.5)
- 20% conversion to paid (conservative)
- 80% Pro (LKR 1,500), 20% Premium (LKR 3,000)

**Monthly Revenue**:
- 16 Pro × LKR 1,500 = LKR 24,000
- 4 Premium × LKR 3,000 = LKR 12,000
- **Total: LKR 36,000 (~$120 USD)**
- After PayHere fees (3.5%): ~$116

**Break-even** (cover $250/month max costs):
- Need ~70 Pro subscribers OR
- Need ~30 Premium subscribers OR
- Need ~50 mixed (realistic: 40 Pro + 10 Premium)

**At 10% conversion**: Need 500 total users  
**At 20% conversion**: Need 250 total users

**Realistic Timeline to Break-even**: 12-18 months

---

# PART 7: QUICK START & CRITICAL GOTCHAS

## 7.1 Day 1: Project Setup

```bash
# Create Expo project
npx create-expo-app@latest gurudevi --template blank-typescript
cd gurudevi

# Install exact versions
npm install expo@~54.0.32 --save-exact
npm install react@19.1.0 react-native@0.81.5 --save-exact

# Create .npmrc
echo "legacy-peer-deps=true" > .npmrc

# Install core dependencies
npm install @gluestack-ui/themed@^1.1.73
npm install react-native-reanimated@~4.1.1
npm install react-native-gesture-handler@^2.20.0
npm install zustand@^5.0.10
npm install @tanstack/react-query@^5.90.20
npm install react-native-mmkv@^4.1.1
npm install @supabase/supabase-js@^2.90.1
npm install react-native-url-polyfill@^3.0.0
npm install react-i18next@^13.5.0 i18next@^23.7.0
npm install @react-navigation/native@^7.0.0
npm install @react-navigation/bottom-tabs@^7.0.0
npm install lucide-react-native@~0.563.0
npm install react-native-svg@15.12.1

# Expo modules
npx expo install expo-av expo-image expo-image-picker
```

---

## 7.2 Critical Gotchas (Learn from Battle Scars)

### **GOTCHA 1: Sinhala/Tamil Text Rendering**

**Problem**: Text shows as boxes (□□□)

**Solution**:
```typescript
// ❌ WRONG
<TextInput />

// ✅ CORRECT
<TextInput
  autoCorrect={false}
  autoCapitalize="none"
  style={{ fontFamily: 'NotoSansSinhala-Regular' }}
/>
```

### **GOTCHA 2: React 19 Compatibility**

**Problem**: Zustand store selectors break React Compiler

**Solution**:
```typescript
// ❌ WRONG (breaks React Compiler)
const userId = useUserStore.use.userId();

// ✅ CORRECT
const userId = useUserStore(state => state.userId);
```

### **GOTCHA 3: Reanimated Plugin Order**

**Problem**: Animations don't work

**Solution**:
```javascript
// babel.config.js
plugins: [
  // ... other plugins FIRST
  'react-native-reanimated/plugin'  // MUST BE LAST!
]
```

### **GOTCHA 4: PayHere Testing**

**Problem**: Sandbox mode unclear

**Solution**:
- Use PayHere Sandbox merchant ID for testing
- Test with real card numbers (provided by PayHere docs)
- Webhook must be publicly accessible (use ngrok for local testing)

### **GOTCHA 5: Multi-Tenant RLS**

**Problem**: Cross-school data leakage

**Solution**:
```sql
-- ALWAYS test with 2+ schools
-- Create School A, School B
-- Try to access School B data while logged in as School A user
-- Should return empty
```

---

# CONCLUSION

## What You Have Now

✅ **Battle-tested stack** (React 19 + Expo 54, 4 builds validated)  
✅ **5-tab navigation** (aligned with Architecture v4.0)  
✅ **Feature complexity matrix** (timelines for every feature)  
✅ **Complete implementation details** (code examples, patterns)  
✅ **Sri Lanka optimization** (Si/Ta/En, PayHere, data saver)  
✅ **Realistic timeline** (10-12 months total)  
✅ **Max-case costs** ($0-250/month)  
✅ **Revenue reality** (break-even at 250-500 users)

## The Path Forward

**Weeks 1-14**: Ship v0.1 MVP (5-tab platform working)  
**Weeks 15-26**: Add revenue (v0.5 with PayHere + Rewards)  
**Weeks 27-40**: Power features (v1.0 with AI + Offline)

## Cross-References

**For Architecture Details**:
- Navigation structure → **Architecture v4.0 Part 2**
- Multi-tenant schema → **Architecture v4.0 Part 4**
- UUID strategy → **Architecture v4.0 Part 5**
- RLS policies → **Architecture v4.0 Part 6**
- Rewards implementation → **Architecture v4.0 Section 7.5**
- FAB implementation → **Architecture v4.0 Section 7.6**
- Maps implementation → **Architecture v4.0 Section 7.7**

**For Security Details**:
- All security policies → **Security Foundation v2.0**
- Multi-tenant isolation → **Security Foundation v2.0 Part 2.1**
- Child safety → **Security Foundation v2.0 Part 3**
- Incident response → **Security Foundation v2.0 Part 5**

---

**Now build the sanctuary for Sri Lankan education.** 🪷

**The stack is proven. The timeline is realistic. Let's ship.**

---

*ජයවේව* (Jayawewa - May you be victorious!)

**END OF GURUDEVI BATTLE-TESTED STACK v3.1 FINAL**
