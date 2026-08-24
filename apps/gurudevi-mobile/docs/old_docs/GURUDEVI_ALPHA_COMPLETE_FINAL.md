---
title: "Gurudevi Alpha - Complete Final Specification"
status: "active"
created: 2026-02-28
updated: 2026-07-24
author: "Naveen"
scribe: "opencode"
tags: [apps, gurudevi-mobile, historical]
---

> **Superseded** � kept for historical reference.
> See active docs at docs/INDEX.md.
# Gurudevi Alpha - Complete Final Specification
## Everything You Need to Build and Ship

**Version:** Alpha 0.1.0 FINAL  
**Timeline:** 5 days scaffolding + implementation  
**Status:** LOCKED - Start building now  
**Date:** February 9, 2026  

---

## 🎯 EXECUTIVE SUMMARY

This is the **complete, final, no-more-changes** specification for Gurudevi Alpha.

**What's Inside:**
- Deep link invitation system (QR codes)
- Passwordless auth (Google + Magic Links)
- Pathfinder tester program
- Founder/Developer roles for you and team
- Testing & security setup (free tools)
- Sri Lankan payment gateway prep
- Community for testers
- Everything organized for GitHub Copilot agent

**Your Mission:** Give this to your agent. Build. Ship. Get feedback.

---

## 📋 TABLE OF CONTENTS

1. [Core Decisions (Locked)](#1-core-decisions-locked)
2. [User Roles & Permissions](#2-user-roles--permissions)
3. [Complete User Flows](#3-complete-user-flows)
4. [All Screens Specifications](#4-all-screens-specifications)
5. [Authentication Setup](#5-authentication-setup)
6. [Database Schema](#6-database-schema)
7. [Testing & Security (Free Tools)](#7-testing--security-free-tools)
8. [Payment Strategy](#8-payment-strategy)
9. [Configuration](#9-configuration)
10. [5-Day Implementation Plan](#10-5-day-implementation-plan)
11. [Deployment Checklist](#11-deployment-checklist)

---

## 1. CORE DECISIONS (LOCKED)

### 1.1 What We're Building

**Alpha Core Features:**
- ✅ Deep link invitation system (Firebase Dynamic Links)
- ✅ QR code generation and scanning
- ✅ Invitation types: School, Peer, Thuthimal Gift, Tester
- ✅ Passwordless auth: Google Sign-In + Magic Links (no passwords!)
- ✅ Pathfinder program (Alpha tester recruitment)
- ✅ Contact collection (phone optional)
- ✅ Five sections: Self, Classroom, Community, Library, Profile
- ✅ Invitation limits: Principal (7), Teacher (3), Founder (unlimited)
- ✅ Registration state tracking (smart routing)
- ✅ Onboarding journey (3-5 screens, skippable)

### 1.2 What We're NOT Building (Yet)

**Deferred to Beta:**
- ⏸️ Password-based authentication
- ⏸️ Phone OTP authentication
- ⏸️ Apple Sign-In
- ⏸️ Student invitations (teacher → students)
- ⏸️ Payment integration (manual gifts in Alpha)
- ⏸️ Advanced analytics
- ⏸️ Multiple role support per user

### 1.3 Key Architectural Decisions

| Decision | Choice | Why |
|----------|--------|-----|
| **Auth** | Google + Magic Links | No passwords = better UX + security |
| **Deep Links** | Firebase Dynamic Links | Free, reliable, preserves data across install |
| **Invitation Model** | Invite-only with limits | Quality over quantity, controlled growth |
| **Role Selection** | Single role, locked after signup | Simplicity for Alpha |
| **Payment** | Sri Lankan gateway (manual for Alpha) | Local market, manual processing until Beta |
| **Testing** | In-app community for testers | No special roles needed, simpler |
| **Theme** | You're building light/dark | We won't duplicate this effort |

---

## 2. USER ROLES & PERMISSIONS

### 2.1 Role Types

**Active Roles (Alpha):**

| Role | Who | Invitation Quota | Special Permissions |
|------|-----|------------------|---------------------|
| **Founder** | You, core team | Unlimited | God mode: see all, test all, create platform announcements |
| **Developer** | Platform developers | Unlimited | Same as Founder, but labeled differently |
| **Principal** | School administrators | 7 | Invite teachers, create school announcements |
| **Teacher** | Educators | 3 | Invite peers, manage classrooms |

**Coming Soon (Disabled in Alpha):**

| Role | Status | When Available |
|------|--------|----------------|
| Section Head | Grayed out | Beta |
| Grade Head | Grayed out | Beta |
| Student | Not shown | Beta |

---

### 2.2 Role Dropdown UI

```
What's your role?

[Select your role ▼]

• Founder / Team Member
• Developer / Platform Admin
• ─────────────────
• Principal
• Teacher
• ─────────────────
• Section Head (Coming Soon)
• Grade Head (Coming Soon)
```

**Behavior:**
- Founder/Developer: Available, top of list (for you and team)
- Principal/Teacher: Available, main user roles
- Section Head/Grade Head: Visible but disabled, show toast if tapped: "Available in Beta"

---

### 2.3 Founder/Developer Permissions

**What Founders/Devs Can Do:**

**Testing & Admin:**
- ✅ See all schools and communities (God mode)
- ✅ Join any community without invitation
- ✅ Create unlimited invitations
- ✅ Manually gift Thuthimal to anyone
- ✅ Create platform-wide announcements (visible to all users)
- ✅ Access to admin dashboard (future feature)
- ✅ Can impersonate other roles for testing (future)

**In Database:**
```sql
-- Founder account example
{
  role: 'founder',
  is_platform_team: true,
  invitations_remaining: 999,
  can_see_all_schools: true,
  can_create_platform_announcements: true
}
```

**Why This Matters:**
- You need to test the app from all perspectives
- You're not a teacher or principal, but you need access
- Developers helping you need same access
- Clear separation: Platform Team vs. Users

---

## 3. COMPLETE USER FLOWS

### 3.1 Flow: First-Time User (School Invitation)

**Scenario:** Principal Silva invites Teacher Fernando

**Steps:**

1. **Principal generates invitation:**
   - Opens app → "Invite Teachers"
   - Sees: "4 invitations remaining (7 total)"
   - (Optional) Adds welcome message: "Welcome to our team!"
   - Taps "Generate Invitation"
   - System creates:
     - Code: `GURU-ROYAL-TEACH-001`
     - Deep link: `https://gurudeviapp.page.link/AbCd123`
   - QR code displayed
   - Principal shares via WhatsApp

2. **Teacher scans QR:**
   - Taps link → Play Store (if app not installed) → Installs → Opens app
   - OR (if app installed) → Opens app directly

3. **Welcome Screen:**
   ```
   Welcome to Royal College!
   
   Principal Silva has invited you to join
   the Gurudevi teacher community.
   
   "Welcome to our team!"
   
   [Continue]
   ```

4. **Name Screen:**
   ```
   What should we call you?
   
   [_______________________]
   Mrs. Fernando
   
   [Continue]
   ```

5. **Role Screen:**
   ```
   What's your role?
   
   [Select your role ▼]
   Selected: Teacher
   
   [Continue]
   ```

6. **Create Account Screen:**
   ```
   Create Your Account
   
   [🔵 Continue with Google]
   
   ━━━━━━━ OR ━━━━━━━
   
   Email: [_______________]
   [✨ Send Magic Link]
   
   By continuing, you agree to
   Terms & Privacy Policy
   ```
   
   Teacher taps Google → Signs in → Authenticated

7. **Pathfinder Agreement:**
   ```
   🔥 Become a Pathfinder
   
   [Alpha testing explanation]
   
   Phone (optional): +94 [_______]
   
   ☑ Send me updates
   ☑ Contact for feedback
   
   ☐ I agree to be Alpha Pathfinder
   
   [Continue as Pathfinder]
   ```

8. **Account Created:**
   - Database saves:
     - name: "Mrs. Fernando"
     - role: "teacher"
     - school: "Royal College"
     - is_alpha_tester: true
     - invitations_remaining: 3
     - invited_by: Principal Silva's ID
   - Local storage: hasRegistered = true

9. **Onboarding Journey (5 screens, skippable)**

10. **Main App**

---

### 3.2 Flow: Thuthimal Gift

**Scenario:** Alumni Kasun gifts Pro to his old teacher Mr. Perera

**Steps:**

1. **Kasun (Alpha: manual process):**
   - Fills web form OR contacts you directly
   - You manually create gift invitation in database
   - Generate deep link with gift data
   - Send to Mr. Perera via WhatsApp

2. **Mr. Perera receives and opens link**

3. **Gift Reveal Screen:**
   ```
   [🌸 Lotus animation]
   
   තුතිමල්
   Flower of Gratitude
   
   Kasun Perera has invited you to Gurudevi
   AND gifted you Pro access for 1 year
   
   ┌──────────────────────────┐
   │ "Thank you for believing │
   │  in me, sir."            │
   │                          │
   │ — Kasun Perera           │
   └──────────────────────────┘
   
   [Accept Gift & Continue]
   ```

4. **Rest of flow same as school invitation**

5. **Account created with:**
   - is_pro: true
   - is_thuthimal: true
   - thuthimal_gifter: "Kasun Perera"
   - pro_expires_at: 1 year from now

6. **Profile shows:**
   ```
   Mr. Perera
   Teacher
   
   🔥 Alpha Pathfinder
   🌸 Thuthimal (Gifted by Kasun Perera)
   ✨ Pro Member (Until Feb 2027)
   ```

---

### 3.3 Flow: Founder Signs Up

**Scenario:** You (the founder) create your account

**Steps:**

1. **You generate a founder invitation for yourself:**
   - Manually create in database OR
   - Use special founder signup link

2. **Open link → Welcome Screen:**
   ```
   Welcome to Gurudevi
   
   You're setting up your Founder account
   to build and test the platform.
   
   [Continue]
   ```

3. **Name Screen:** Enter your name

4. **Role Screen:**
   ```
   [Select your role ▼]
   Selected: Founder / Team Member
   ```

5. **Create Account:** Google Sign-In

6. **Skip Pathfinder Agreement** (or simplified version)

7. **Account Created:**
   ```sql
   {
     role: 'founder',
     is_platform_team: true,
     invitations_remaining: 999,
     is_alpha_tester: true
   }
   ```

8. **Onboarding → Main App**

**In Main App, Founder Can:**
- Access all sections
- See all schools (dropdown in top nav)
- Create platform announcements
- Join any community
- Test all features

---

### 3.4 Flow: Returning User (Login)

**Scenario:** Teacher logs out, then reopens app

**Steps:**

1. **Opens app**

2. **App checks:**
   - hasRegistered in local storage = true
   - No active session

3. **Shows Login Screen:**
   ```
   Welcome Back!
   
   [🔵 Continue with Google]
   
   ━━━━━━━ OR ━━━━━━━
   
   Email: [_______________]
   [✨ Send Magic Link]
   
   [New user? Enter invite code]
   ```

4. **User signs in → Main App**

**No onboarding shown** (already completed)

---

## 4. ALL SCREENS SPECIFICATIONS

### 4.1 Invitation Welcome Screens

#### A. School Invitation Welcome

```typescript
interface SchoolInvitationWelcomeProps {
  invitationData: {
    sender: string;
    school: string;
    welcomeMessage?: string;
  };
}

<View>
  <Image source={schoolIcon} />
  <Text style={title}>Welcome to {school}!</Text>
  <Text style={subtitle}>
    {sender} has invited you to join the 
    Gurudevi teacher community
  </Text>
  
  {welcomeMessage && (
    <MessageCard>
      <Text>{sender} says:</Text>
      <Text>"{welcomeMessage}"</Text>
    </MessageCard>
  )}
  
  <Button onPress={goToNameScreen}>Continue</Button>
</View>
```

---

#### B. Thuthimal Gift Reveal

```typescript
<ScrollView>
  <LotusAnimation /> {/* 🌸 animated */}
  
  <Text style={sinhala}>තුතිමල්</Text>
  <Text style={subtitle}>Flower of Gratitude</Text>
  
  <GiftCard>
    <Text>{gifter} has invited you to Gurudevi</Text>
    <Text style={highlight}>
      AND gifted you Pro access for 1 year
    </Text>
    
    {message && (
      <Quote>
        <Text>"{message}"</Text>
        <Text>— {gifter}</Text>
      </Quote>
    )}
  </GiftCard>
  
  <Button>Accept Gift & Continue</Button>
</ScrollView>
```

---

#### C. Peer Invitation Welcome

```typescript
<View>
  <Text style={emoji}>👋</Text>
  <Text style={title}>{sender} recommends Gurudevi</Text>
  <Text style={subtitle}>Join the educator community</Text>
  
  {welcomeMessage && (
    <MessageCard>"{welcomeMessage}"</MessageCard>
  )}
  
  <Button>Continue</Button>
</View>
```

---

#### D. Tester Invitation Welcome

```typescript
<View>
  <Text style={emoji}>🔥</Text>
  <Text style={title}>
    You're Invited to Shape Gurudevi
  </Text>
  
  <Text style={subtitle}>
    We're building the future of educational support,
    and we need your expertise.
  </Text>
  
  <BenefitsCard>
    <Text>Join as an Alpha Pathfinder to:</Text>
    • Test early features
    • Provide feedback that matters
    • Help shape the product
  </BenefitsCard>
  
  <Button>Accept Invitation</Button>
</View>
```

---

#### E. Founder Welcome (Special)

```typescript
<View>
  <Text style={emoji}>🌸</Text>
  <Text style={title}>Welcome to Gurudevi</Text>
  
  <Text style={subtitle}>
    You're setting up your Founder account
    to build and test the platform.
  </Text>
  
  <InfoCard>
    As a Founder, you'll have:
    • Full access to all features
    • Ability to test from any perspective
    • Platform-wide announcement powers
    • Unlimited invitations
  </InfoCard>
  
  <Button>Continue Setup</Button>
</View>
```

---

### 4.2 Name Screen

```typescript
<View>
  <Text style={title}>What should we call you?</Text>
  
  <TextInput
    placeholder="First & Last Name"
    value={name}
    onChangeText={setName}
    autoFocus
  />
  
  <Text style={helpText}>
    This is how you'll appear to others on Gurudevi.
  </Text>
  
  <Button 
    disabled={name.length < 2}
    onPress={goToRoleScreen}
  >
    Continue
  </Button>
</View>
```

---

### 4.3 Role Screen

```typescript
<View>
  <Text style={title}>What's your role?</Text>
  
  <Dropdown
    options={[
      { value: 'founder', label: 'Founder / Team Member', enabled: true },
      { value: 'developer', label: 'Developer / Platform Admin', enabled: true },
      { value: 'divider1', label: '─────────────────', enabled: false },
      { value: 'principal', label: 'Principal', enabled: true },
      { value: 'teacher', label: 'Teacher', enabled: true },
      { value: 'divider2', label: '─────────────────', enabled: false },
      { value: 'section_head', label: 'Section Head (Coming Soon)', enabled: false },
      { value: 'grade_head', label: 'Grade Head (Coming Soon)', enabled: false },
    ]}
    onSelect={setRole}
    onDisabledTap={() => Alert.alert('Coming Soon', 'This role will be available in Beta')}
  />
  
  <Text style={helpText}>
    Your role helps us personalize your experience.
  </Text>
  
  <Button 
    disabled={!role}
    onPress={goToAuthScreen}
  >
    Continue
  </Button>
</View>
```

---

### 4.4 Create Account Screen

```typescript
<View>
  <Text style={title}>Create Your Account</Text>
  
  <GoogleSignInButton onPress={handleGoogleSignIn}>
    🔵 Continue with Google
  </GoogleSignInButton>
  <Text style={recommended}>Recommended - quick & secure</Text>
  
  <Divider>━━━━━━━ OR ━━━━━━━</Divider>
  
  <ToggleButton onPress={() => setShowMagicLink(!showMagicLink)}>
    {showMagicLink ? 'Hide' : 'Show'} email option
  </ToggleButton>
  
  {showMagicLink && (
    <>
      <TextInput
        placeholder="Email address"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      
      <MagicLinkButton onPress={handleSendMagicLink}>
        ✨ Send Magic Link
      </MagicLinkButton>
    </>
  )}
  
  <TermsText>
    By continuing, you agree to our
    <Link href="/terms">Terms of Service</Link> and
    <Link href="/privacy">Privacy Policy</Link>
  </TermsText>
  
  <Link onPress={goToLogin}>
    Already have an account? Sign In
  </Link>
</View>
```

---

### 4.5 Pathfinder Agreement Screen

```typescript
<ScrollView>
  <Text style={emoji}>🔥</Text>
  <Text style={title}>Become a Pathfinder</Text>
  
  <Text style={subtitle}>
    You're invited to the Alpha phase of Gurudevi — 
    help us build the future of educational support
  </Text>
  
  {isThuthimalRecipient && (
    <GiftBanner>
      ✨ As an Alpha Pathfinder AND Thuthimal recipient,
      you're part of something special.
    </GiftBanner>
  )}
  
  <Section title="As an Alpha Pathfinder, you'll:">
    • Get early access to new features
    • Help shape Gurudevi's development
    • Directly influence the product
    • Join a community of pioneering educators
  </Section>
  
  <Section title="What we need from you:">
    • Test the app and share honest feedback
    • Report bugs you encounter
    • Understand this is pre-release software
  </Section>
  
  <Divider />
  
  <Section title="📱 Stay Connected (Optional)">
    <Text>To gather feedback and share updates:</Text>
    
    <PhoneInput
      countryCode="+94"
      placeholder="77 123 4567"
      value={phone}
      onChangeText={setPhone}
    />
    
    <Checkbox
      checked={contactPrefs.updates}
      onChange={(val) => setContactPrefs({...contactPrefs, updates: val})}
      label="Send me feature updates"
    />
    
    <Checkbox
      checked={contactPrefs.feedback}
      onChange={(val) => setContactPrefs({...contactPrefs, feedback: val})}
      label="Contact me for quick feedback"
    />
    
    <Checkbox
      checked={contactPrefs.research}
      onChange={(val) => setContactPrefs({...contactPrefs, research: val})}
      label="I'm happy to participate in research"
    />
    
    <PrivacyNote>
      Your contact info is private and will never be shared.
      You can opt out anytime.
    </PrivacyNote>
  </Section>
  
  <Divider />
  
  <AgreementCheckbox
    checked={agreedToTerms}
    onChange={setAgreedToTerms}
    label="I agree to be an Alpha Pathfinder and provide 
           feedback to help build Gurudevi"
  />
  
  <Button 
    disabled={!agreedToTerms}
    onPress={handleCreateAccount}
  >
    Continue as Pathfinder
  </Button>
</ScrollView>
```

---

### 4.6 Onboarding Journey (5 Screens)

```typescript
const screens = [
  {
    icon: '🌸',
    title: 'Welcome to Gurudevi',
    description: 'Five spaces to support your teaching journey: Self, Classroom, Community, Library, and Profile.',
  },
  {
    icon: '🔥',
    title: 'Your Self Space',
    description: 'Your private space for reflection, mood check-ins, and personal growth. No one else can see what's here.',
  },
  {
    icon: '📚',
    title: 'Your Classroom',
    description: 'Manage students, track attendance, create lessons, and organize your teaching materials.',
  },
  {
    icon: '🤝',
    title: 'Connect & Grow',
    description: 'Join Communities of fellow educators and access the Library of shared teaching resources.',
  },
  {
    icon: '✨',
    title: 'You're Ready!',
    description: 'Start exploring at your own pace. You can always revisit this guide in Settings.',
  },
];

<View>
  <SkipButton onPress={skipToApp} />
  
  <ProgressDots 
    total={5} 
    current={currentIndex} 
  />
  
  <Content>
    <Text style={icon}>{screens[currentIndex].icon}</Text>
    <Text style={title}>{screens[currentIndex].title}</Text>
    <Text style={description}>{screens[currentIndex].description}</Text>
  </Content>
  
  <Button onPress={handleNext}>
    {currentIndex === 4 ? 'Start Exploring' : 'Next'}
  </Button>
  
  <Text style={counter}>
    {currentIndex + 1} of 5
  </Text>
</View>
```

---

### 4.7 Profile > About Section

```typescript
<SettingsGroup title="About">
  <SettingsRow 
    label="Version" 
    value="0.1.0 (Alpha)"
  />
  
  <SettingsRow 
    label="Give Feedback"
    icon="💬"
    onPress={() => navigation.navigate('FeedbackScreen')}
  />
  
  <SettingsRow 
    label="Contact Support"
    icon="📧"
    onPress={() => openEmail('support@gurudevi.lk')}
  />
  
  <SettingsRow 
    label="Terms of Service"
    icon="📄"
    onPress={() => openURL('https://gurudevi.edlove.org/terms')}
  />
  
  <SettingsRow 
    label="Privacy Policy"
    icon="🔒"
    onPress={() => openURL('https://gurudevi.edlove.org/privacy')}
  />
</SettingsGroup>
```

---

### 4.8 Feedback Screen (In-App)

```typescript
<View>
  <Text style={title}>Share Your Feedback</Text>
  
  <FeedbackTypePicker
    options={[
      { value: 'bug_report', label: '🐛 Bug Report' },
      { value: 'feature_request', label: '💡 Feature Request' },
      { value: 'general_feedback', label: '💬 General Feedback' },
    ]}
    selected={feedbackType}
    onSelect={setFeedbackType}
  />
  
  <TextInput
    placeholder="Title (optional)"
    value={title}
    onChangeText={setTitle}
  />
  
  <TextInput
    placeholder="Tell us what you think..."
    value={description}
    onChangeText={setDescription}
    multiline
    numberOfLines={8}
  />
  
  <Button onPress={handleSubmitFeedback}>
    Submit Feedback
  </Button>
</View>
```

**Stores in `pathfinder_feedback` table, you can review in admin panel later.**

---

## 5. AUTHENTICATION SETUP

### 5.1 Google Sign-In

**Install:**
```bash
npm install @react-native-google-signin/google-signin
```

**Configure:**
```typescript
// src/lib/auth/googleSignIn.ts
import { GoogleSignin } from '@react-native-google-signin/google-signin';

export function configureGoogleSignIn() {
  GoogleSignin.configure({
    webClientId: 'YOUR_WEB_CLIENT_ID_FROM_FIREBASE.apps.googleusercontent.com',
    offlineAccess: true,
  });
}

// Call once at app startup
useEffect(() => {
  configureGoogleSignIn();
}, []);
```

**Sign In:**
```typescript
export async function signInWithGoogle() {
  await GoogleSignin.hasPlayServices();
  const { idToken, user } = await GoogleSignin.signIn();
  
  const googleCredential = auth.GoogleAuthProvider.credential(idToken);
  const userCredential = await auth().signInWithCredential(googleCredential);
  
  return {
    authUser: userCredential.user,
    email: user.email,
    name: user.name,
  };
}
```

---

### 5.2 Magic Links (Email Passwordless)

**Send magic link:**
```typescript
import { supabase } from '../lib/supabase';

export async function sendMagicLink(email: string) {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: 'gurudevi://auth/callback',
      shouldCreateUser: true,
    },
  });
  
  if (error) throw error;
}
```

**Handle callback:**
```typescript
// In deep link handler
async function handleAuthCallback(url: string) {
  if (url.includes('/auth/callback')) {
    const { data, error } = await supabase.auth.getSessionFromUrl({ url });
    
    if (data.session) {
      // User authenticated!
      const userId = data.session.user.id;
      
      // Check if new user or returning
      const existingUser = await db.users.findById(userId);
      
      if (!existingUser) {
        // New user - continue signup flow
        navigation.navigate('PathfinderAgreementScreen', {
          authUserId: userId,
          email: data.session.user.email,
          // ... other data
        });
      } else {
        // Returning user - go to main app
        navigation.navigate('MainApp');
      }
    }
  }
}
```

---

### 5.3 Registration State Management

```typescript
// src/lib/auth/registrationState.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

export async function markUserAsRegistered(authMethod: string, email?: string) {
  await AsyncStorage.setItem('hasRegistered', 'true');
  await AsyncStorage.setItem('authMethod', authMethod);
  if (email) await AsyncStorage.setItem('lastEmail', email);
}

export async function getRegistrationState() {
  const hasRegistered = await AsyncStorage.getItem('hasRegistered');
  const authMethod = await AsyncStorage.getItem('authMethod');
  const lastEmail = await AsyncStorage.getItem('lastEmail');
  
  return {
    hasRegistered: hasRegistered === 'true',
    authMethod,
    lastEmail,
  };
}
```

---

## 6. DATABASE SCHEMA

### 6.1 Users Table (Extended)

```sql
-- Add to existing users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT CHECK (role IN (
  'founder',
  'developer',
  'principal',
  'teacher',
  'section_head',
  'grade_head',
  'student'
));

ALTER TABLE users ADD COLUMN IF NOT EXISTS is_platform_team BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_user_id TEXT UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_method TEXT CHECK (auth_method IN ('google', 'magic_link', 'phone'));

-- Pro/Thuthimal
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_pro BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_thuthimal BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS thuthimal_gifter TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS thuthimal_message TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS pro_expires_at TIMESTAMP;

-- Pathfinder
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_alpha_tester BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS tester_agreement_date TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS tester_cohort TEXT;

-- Contact
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS contact_preferences JSONB DEFAULT '{"updates": false, "feedback": false, "research": false}'::jsonb;

-- Invitation tracking
ALTER TABLE users ADD COLUMN IF NOT EXISTS invited_by UUID REFERENCES users(id);
ALTER TABLE users ADD COLUMN IF NOT EXISTS invitation_id UUID REFERENCES invitations(id);
ALTER TABLE users ADD COLUMN IF NOT EXISTS invitations_remaining INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS total_invitations_sent INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS successful_invitations INTEGER DEFAULT 0;

CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_platform_team ON users(is_platform_team) WHERE is_platform_team = TRUE;
```

---

### 6.2 Invitations Table

```sql
CREATE TABLE invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  invite_code TEXT UNIQUE NOT NULL,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  sender_name TEXT NOT NULL,
  
  context_type TEXT NOT NULL CHECK (context_type IN (
    'school_invitation',
    'peer_invitation',
    'thuthimal_gift',
    'tester_invitation',
    'founder_invitation'
  )),
  
  school TEXT,
  target_role TEXT NOT NULL,
  
  welcome_message TEXT,
  
  has_gift BOOLEAN DEFAULT FALSE,
  gift_type TEXT CHECK (gift_type IN ('pro_6months', 'pro_1year', 'pro_lifetime', NULL)),
  gifter_name TEXT,
  gift_message TEXT,
  
  short_link TEXT,
  full_link TEXT,
  
  max_uses INTEGER DEFAULT 1,
  used_count INTEGER DEFAULT 0,
  
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'claimed', 'expired', 'exhausted', 'replaced')),
  replaced_by UUID REFERENCES invitations(id),
  expires_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT valid_gift_data CHECK (
    (has_gift = FALSE) OR 
    (has_gift = TRUE AND gift_type IS NOT NULL AND gifter_name IS NOT NULL)
  )
);

CREATE INDEX idx_invitations_code ON invitations(invite_code);
CREATE INDEX idx_invitations_created_by ON invitations(created_by);
CREATE INDEX idx_invitations_context ON invitations(context_type);
```

---

### 6.3 Pathfinder Feedback Table

```sql
CREATE TABLE pathfinder_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  feedback_type TEXT CHECK (feedback_type IN ('bug_report', 'feature_request', 'general_feedback')),
  title TEXT,
  description TEXT NOT NULL,
  
  screen TEXT,
  app_version TEXT,
  
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'reviewing', 'resolved', 'wont_fix')),
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_feedback_user ON pathfinder_feedback(user_id);
CREATE INDEX idx_feedback_status ON pathfinder_feedback(status);
```

---

### 6.4 Communities Table (for Alpha Testers Community)

```sql
CREATE TABLE communities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  name TEXT NOT NULL,
  description TEXT,
  type TEXT CHECK (type IN ('platform', 'school', 'subject', 'custom')),
  
  -- Platform-wide communities (like Alpha Testers)
  is_platform_wide BOOLEAN DEFAULT FALSE,
  auto_join_for_role TEXT, -- e.g., 'all' or 'alpha_tester'
  
  created_by UUID REFERENCES users(id),
  school TEXT,
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE community_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  community_id UUID REFERENCES communities(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
  joined_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(community_id, user_id)
);

-- Alpha Testers community (created on platform setup)
INSERT INTO communities (name, description, type, is_platform_wide, auto_join_for_role)
VALUES (
  'Alpha Pathfinders',
  'Community for all Alpha testers - share feedback, discuss features, report bugs',
  'platform',
  TRUE,
  'alpha_tester'
);
```

**Logic:** When user completes signup with `is_alpha_tester = true`, automatically add them to "Alpha Pathfinders" community.

---

### 6.5 Announcements Table

```sql
CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT CHECK (type IN ('platform', 'school', 'community')),
  
  -- Platform announcements (from founders)
  is_platform_wide BOOLEAN DEFAULT FALSE,
  
  -- School announcements (from principals)
  school TEXT,
  
  -- Community announcements
  community_id UUID REFERENCES communities(id) ON DELETE CASCADE,
  
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  
  -- Check: must be one of platform/school/community
  CONSTRAINT announcement_scope CHECK (
    (is_platform_wide = TRUE AND school IS NULL AND community_id IS NULL) OR
    (school IS NOT NULL AND is_platform_wide = FALSE AND community_id IS NULL) OR
    (community_id IS NOT NULL AND is_platform_wide = FALSE AND school IS NULL)
  )
);

CREATE INDEX idx_announcements_platform ON announcements(is_platform_wide) WHERE is_platform_wide = TRUE;
CREATE INDEX idx_announcements_school ON announcements(school) WHERE school IS NOT NULL;
CREATE INDEX idx_announcements_community ON announcements(community_id) WHERE community_id IS NOT NULL;
```

**Boundaries:**
- **Platform announcements:** Only founders/platform team can create, visible to ALL users
- **School announcements:** Only principals can create, visible to users in that school
- **Community announcements:** Community admins can create, visible to community members

---

### 6.6 Library Resources (Basic Seeding)

```sql
CREATE TABLE library_resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  title TEXT NOT NULL,
  description TEXT,
  type TEXT CHECK (type IN ('pdf', 'link', 'video', 'document')),
  url TEXT NOT NULL,
  
  -- Categorization
  subject TEXT, -- 'math', 'science', 'english', etc.
  grade_level TEXT, -- 'primary', 'secondary', 'all'
  
  -- Who added it
  contributed_by UUID REFERENCES users(id),
  is_platform_resource BOOLEAN DEFAULT FALSE, -- Curated by platform team
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- Seed with 5-10 resources (you'll add these manually or via script)
INSERT INTO library_resources (title, description, type, url, subject, grade_level, is_platform_resource)
VALUES
  ('Effective Classroom Management Tips', 'A guide to managing diverse classrooms', 'pdf', 'https://example.com/classroom-mgmt.pdf', 'general', 'all', TRUE),
  ('Math Teaching Resources - Khan Academy', 'Free math resources for all levels', 'link', 'https://www.khanacademy.org/', 'math', 'all', TRUE),
  -- Add 3-8 more...
;
```

---

## 7. TESTING & SECURITY (FREE TOOLS)

### 7.1 Automated Testing

**Unit Tests (Jest - FREE):**

```bash
npm install --save-dev jest @testing-library/react-native
```

**Example test:**
```typescript
// __tests__/deepLinks.test.ts
import { parseDeepLink } from '../src/lib/deepLinks';

describe('parseDeepLink', () => {
  it('parses school invitation correctly', () => {
    const url = 'https://gurudevi.edlove.org/school?code=GURU-ROYAL-TEACH-001';
    const data = parseDeepLink(url);
    
    expect(data.contextType).toBe('school_invitation');
    expect(data.code).toBe('GURU-ROYAL-TEACH-001');
  });
});
```

Run: `npm test`

---

**E2E Tests (Detox - FREE, optional for Beta):**

```bash
npm install --save-dev detox
```

**Example test:**
```typescript
describe('Signup Flow', () => {
  it('should complete signup from invitation', async () => {
    await element(by.id('scan-qr-button')).tap();
    // ... test full flow
    await expect(element(by.text('Welcome to Gurudevi'))).toBeVisible();
  });
});
```

Run: `detox test`

---

### 7.2 Security (Free Tools)

**Supabase Row Level Security (RLS):**

```sql
-- Already in schema - ensures users can only access their own data
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = auth_user_id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = auth_user_id);
```

---

**Firebase App Check (FREE):**

Prevents abuse of Firebase services by bots.

```bash
npm install @react-native-firebase/app-check
```

```typescript
import appCheck from '@react-native-firebase/app-check';

// Initialize
appCheck()
  .initializeAppCheck({
    provider: __DEV__ ? appCheck.newDebugProvider() : appCheck.newPlayIntegrityProvider(),
  })
  .then(() => console.log('App Check initialized'));
```

---

**OWASP Mobile Security Checklist (FREE guide):**

Follow these practices:
- ✅ Use HTTPS only
- ✅ Validate all user inputs
- ✅ Store sensitive data encrypted (AsyncStorage for tokens is fine)
- ✅ Use Firebase/Supabase auth (don't roll your own)
- ✅ Enable RLS policies
- ✅ No hardcoded API keys (use .env)
- ✅ Implement proper error handling (don't expose stack traces)

**Reference:** https://owasp.org/www-project-mobile-security/

---

### 7.3 Monitoring & Error Tracking

**Sentry (FREE tier: 5,000 errors/month):**

```bash
npm install @sentry/react-native
npx @sentry/wizard -i reactNative -p android
```

**Initialize:**
```typescript
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'YOUR_SENTRY_DSN',
  environment: __DEV__ ? 'development' : 'production',
});
```

**Track errors:**
```typescript
try {
  await someFunction();
} catch (error) {
  Sentry.captureException(error);
  Alert.alert('Error', 'Something went wrong');
}
```

---

**Firebase Crashlytics (FREE):**

```bash
npm install @react-native-firebase/crashlytics
```

**Enable in app:**
```typescript
import crashlytics from '@react-native-firebase/crashlytics';

// Enable in production
crashlytics().setCrashlyticsCollectionEnabled(!__DEV__);

// Log non-fatal errors
crashlytics().recordError(error);
```

---

**Firebase Analytics (FREE):**

```bash
npm install @react-native-firebase/analytics
```

**Track events:**
```typescript
import analytics from '@react-native-firebase/analytics';

// Track invitation sent
await analytics().logEvent('invitation_sent', {
  context_type: 'school_invitation',
  role: 'teacher',
});

// Track signup completed
await analytics().logEvent('signup_completed', {
  role: user.role,
  is_alpha_tester: true,
});
```

---

### 7.4 Testing Checklist

**Before Alpha Launch:**

**Firebase & Deep Links:**
- [ ] Firebase project configured
- [ ] google-services.json added
- [ ] SHA-256 certificates added
- [ ] Dynamic Links working (test link opens app)
- [ ] Deep link preserves data across install

**Authentication:**
- [ ] Google Sign-In works
- [ ] Magic link sends email
- [ ] Magic link callback works
- [ ] Session persists after app restart

**Invitation System:**
- [ ] Principal can generate invitations (quota: 7)
- [ ] Teacher can generate invitations (quota: 3)
- [ ] Founder has unlimited invitations
- [ ] QR codes display correctly
- [ ] Invalid codes show error

**User Flows:**
- [ ] School invitation flow complete
- [ ] Thuthimal gift flow complete (lotus animation!)
- [ ] Peer invitation flow complete
- [ ] Tester invitation flow complete
- [ ] Founder signup flow complete
- [ ] Returning user login works

**Communities:**
- [ ] "Alpha Pathfinders" community exists
- [ ] New alpha testers auto-join community
- [ ] Founders can create platform announcements
- [ ] Principals can create school announcements

**Security:**
- [ ] RLS policies enabled
- [ ] No sensitive data exposed in logs
- [ ] API keys in .env (not hardcoded)

**Monitoring:**
- [ ] Sentry captures errors
- [ ] Firebase Crashlytics enabled
- [ ] Firebase Analytics tracking key events

---

## 8. PAYMENT STRATEGY

### 8.1 Alpha Approach (Manual)

**How Thuthimal Gifts Work in Alpha:**

1. **Alumni/Gifter contacts you:**
   - Via email, WhatsApp, or web form

2. **You process manually:**
   - Verify payment (bank transfer, cash, whatever)
   - Create invitation in database with `has_gift: true`
   - Generate deep link
   - Send to teacher

3. **Teacher receives Pro:**
   - Signs up
   - Account automatically marked as Pro + Thuthimal

**No payment gateway needed yet.**

---

### 8.2 Beta/Production Approach (Automated)

**Sri Lankan Payment Gateway:**

**Options to consider:**
- **PayHere** (most popular in Sri Lanka)
- **iPay88** (regional)
- **Genie by HNB** (bank-backed)
- **Mintpay** (emerging)

**Configuration (for later):**

```typescript
// src/config/app.config.ts

payment: {
  enabled: false, // Alpha: manual
  provider: 'payhere', // Sri Lankan gateway
  
  currency: 'LKR', // Sri Lankan Rupees
  
  prices: {
    pro_6months: 1500,  // ~$5 USD
    pro_1year: 2500,    // ~$8 USD
    pro_lifetime: 10000, // ~$33 USD
  },
  
  // PayHere credentials (Beta)
  merchant_id: process.env.PAYHERE_MERCHANT_ID,
  merchant_secret: process.env.PAYHERE_MERCHANT_SECRET,
  
  // Webhook for payment confirmation
  webhook_url: 'https://api.gurudevi.lk/payments/webhook',
},
```

**Why NOT Stripe/US gateways:**
- Higher fees for international transactions
- Harder for Sri Lankans to pay
- Local gateways have better UX for local users

**Implementation (Beta):**

```bash
# Install PayHere SDK (when ready)
npm install payhere-mobilesdk-reactnative
```

```typescript
// Gift flow with payment
import PayHere from 'payhere-mobilesdk-reactnative';

async function purchaseThuthimalGift(teacherEmail, giftType) {
  const payment = {
    merchant_id: Config.PAYHERE_MERCHANT_ID,
    amount: Config.payment.prices[giftType],
    currency: 'LKR',
    order_id: generateOrderId(),
    items: `Thuthimal Gift - ${giftType}`,
    custom_1: teacherEmail,
    custom_2: currentUser.id,
  };
  
  PayHere.startPayment(payment, (paymentId) => {
    // Payment successful
    createThuthimalInvitation(teacherEmail, giftType, paymentId);
  }, (error) => {
    Alert.alert('Payment Failed', error.message);
  });
}
```

**For Alpha:** Skip all this. Manual processing is fine.

---

### 8.3 Price Tiers (Defined, Not Implemented in Alpha)

**Tiers:**

| Tier | Duration | Price (LKR) | Price (USD) | Features |
|------|----------|-------------|-------------|----------|
| **Free** | Forever | 0 | 0 | Basic features, limited storage |
| **Pro 6 Months** | 6 months | 1,500 | ~$5 | All features, priority support |
| **Pro 1 Year** | 1 year | 2,500 | ~$8 | All features, best value |
| **Pro Lifetime** | Lifetime | 10,000 | ~$33 | All features, one-time payment |

**What Pro Includes (Future):**
- Unlimited student profiles
- Advanced analytics
- Priority support
- File storage (10GB vs 1GB free)
- Custom themes
- Export data
- Ad-free experience

**In Alpha:** Everyone is effectively "Free tier" except Thuthimal recipients who get Pro manually.

---

## 9. CONFIGURATION

### 9.1 App Config File

**File:** `src/config/app.config.ts`

```typescript
export const AppConfig = {
  version: '0.1.0',
  phase: 'alpha' as 'alpha' | 'beta' | 'production',
  
  // Invitation limits (CONFIGURABLE)
  invitations: {
    founder_quota: 999,
    developer_quota: 999,
    principal_quota: 7,
    teacher_quota: 3,
    section_head_quota: 0,
    grade_head_quota: 0,
    student_quota: 0,
    
    default_expiry_days: 30,
    allow_regeneration: true,
  },
  
  // Pathfinder
  pathfinder: {
    enabled: true,
    cohort_name: 'alpha_feb_2026',
    agreement_required: true,
    phone_optional: true,
  },
  
  // Thuthimal
  thuthimal: {
    enabled: true,
    manual_processing: true,
    payment_enabled: false,
  },
  
  // Deep links
  deepLinks: {
    domain_uri_prefix: 'https://gurudeviapp.page.link',
    base_url: 'https://gurudevi.edlove.org',
    play_store_url: 'https://play.google.com/store/apps/details?id=com.gurudevi.app',
  },
  
  // Legal
  legal: {
    terms_url: 'https://gurudevi.edlove.org/terms',
    privacy_url: 'https://gurudevi.edlove.org/privacy',
  },
  
  // Features
  features: {
    google_signin: true,
    magic_link_signin: true,
    phone_signin: false,
    
    roles: {
      founder: true,
      developer: true,
      principal: true,
      teacher: true,
      section_head: false,
      grade_head: false,
      student: false,
    },
    
    communities: {
      enabled: true,
      alpha_testers_auto_join: true,
    },
    
    announcements: {
      platform: true, // Founders can create
      school: true,   // Principals can create
      community: true, // Community admins can create
    },
    
    library: {
      enabled: true,
      seeded_resources: true, // Pre-populated resources
    },
  },
  
  // Support
  support: {
    email: 'support@gurudevi.lk',
    whatsapp: '+94771234567',
  },
  
  // Payment (not active in Alpha)
  payment: {
    enabled: false,
    provider: 'payhere',
    currency: 'LKR',
    prices: {
      pro_6months: 1500,
      pro_1year: 2500,
      pro_lifetime: 10000,
    },
  },
};

export function getInvitationQuota(role: string): number {
  switch (role) {
    case 'founder': return AppConfig.invitations.founder_quota;
    case 'developer': return AppConfig.invitations.developer_quota;
    case 'principal': return AppConfig.invitations.principal_quota;
    case 'teacher': return AppConfig.invitations.teacher_quota;
    default: return 0;
  }
}

export function isRoleEnabled(role: string): boolean {
  return AppConfig.features.roles[role] === true;
}
```

---

## 10. 5-DAY IMPLEMENTATION PLAN

### Day 1: Foundation & Deep Links
**Duration:** 6-8 hours

**Tasks:**
- [ ] Firebase project setup
- [ ] Add Android app to Firebase
- [ ] Download google-services.json
- [ ] Update build.gradle files
- [ ] Install Firebase packages
- [ ] Get SHA-256 certificates
- [ ] Add certificates to Firebase
- [ ] Enable Dynamic Links
- [ ] Configure domain
- [ ] Update AndroidManifest.xml
- [ ] Test: Link opens app

**End of Day 1:** Deep links working

---

### Day 2: Auth + Invitation Welcome Screens
**Duration:** 8-10 hours

**Tasks:**
- [ ] Configure Google Sign-In
- [ ] Implement signInWithGoogle function
- [ ] Implement magic link sending
- [ ] Handle magic link callback
- [ ] Create welcome screens:
  - [ ] SchoolInvitationWelcome
  - [ ] GiftRevealScreen (with animation)
  - [ ] PeerInvitationWelcome
  - [ ] TesterInvitationWelcome
  - [ ] FounderWelcome
- [ ] Create InvitationWelcomeRouter
- [ ] Test: Auth flows work

**End of Day 2:** Authentication + welcome screens done

---

### Day 3: Onboarding Flow
**Duration:** 8-10 hours

**Tasks:**
- [ ] Create NameScreen
- [ ] Create RoleScreen (with founder/developer options)
- [ ] Create CreateAccountScreen
- [ ] Create CheckEmailScreen
- [ ] Create PathfinderAgreementScreen
- [ ] Implement createUser function
- [ ] Implement claimInvitation function
- [ ] Assign invitation quotas
- [ ] Auto-join Alpha Pathfinders community
- [ ] Test: Complete signup flow

**End of Day 3:** Full signup working

---

### Day 4: Invitation Generation + Communities
**Duration:** 8-10 hours

**Tasks:**
- [ ] Create InviteGenerationScreen
- [ ] Implement QR code generation
- [ ] Implement generateInviteLink
- [ ] Show quota and sent invitations
- [ ] Create "Alpha Pathfinders" community in database
- [ ] Create community join logic
- [ ] Create basic community screen (view, post)
- [ ] Create announcement creation (for founders)
- [ ] Test: Generate invite, scan, signup

**End of Day 4:** Invitations + communities working

---

### Day 5: Polish + Testing + Deployment Prep
**Duration:** 8-10 hours

**Tasks:**
- [ ] Create OnboardingJourney screens
- [ ] Create Profile > About section
- [ ] Create FeedbackScreen
- [ ] Seed library with 5-10 resources
- [ ] Smart app router (returning users)
- [ ] LoginScreen
- [ ] Invalid invitation handling
- [ ] Run all database migrations
- [ ] Set up Sentry
- [ ] Set up Firebase Analytics
- [ ] Test all flows end-to-end
- [ ] Fix critical bugs
- [ ] Build release APK
- [ ] Prepare for Play Store upload

**End of Day 5:** App ready to ship!

---

## 11. DEPLOYMENT CHECKLIST

### Pre-Deployment

**Code:**
- [ ] All features implemented
- [ ] No hardcoded values
- [ ] .env file configured
- [ ] .gitignore correct
- [ ] No console.logs in production

**Firebase:**
- [ ] Project in production mode
- [ ] Auth providers enabled
- [ ] Dynamic Links configured
- [ ] App Check enabled

**Database:**
- [ ] Production Supabase created
- [ ] All migrations run
- [ ] RLS policies enabled
- [ ] "Alpha Pathfinders" community created
- [ ] Library resources seeded

**Play Store:**
- [ ] Developer account ($25 paid)
- [ ] App listing drafted
- [ ] Screenshots ready
- [ ] Privacy policy uploaded

---

### Build & Deploy

**1. Build release APK:**
```bash
cd android
./gradlew assembleRelease
```

**2. Upload to Play Store:**
- Internal Testing track
- Add tester emails
- Upload APK
- Fill release notes

**3. Generate founder invitation for yourself:**
```sql
-- In Supabase SQL editor
INSERT INTO invitations (invite_code, sender_name, context_type, target_role, max_uses)
VALUES ('GURU-FOUNDER-001', 'Platform', 'founder_invitation', 'founder', 1);
```

Generate deep link manually or via function, then use to sign up.

**4. Generate 5-10 invitations for principals**

**5. Send invitations via WhatsApp**

**6. Monitor:**
- Firebase Crashlytics
- Sentry errors
- User feedback in Alpha Pathfinders community

---

### Post-Launch (Week 1)

**Daily:**
- Check for crashes
- Respond to feedback
- Fix critical bugs

**Weekly:**
- Analyze usage patterns
- Gather feature requests
- Plan Beta improvements

---

## 12. FINAL WORDS

**You have everything you need.**

- ✅ Complete specification
- ✅ All screens defined
- ✅ Database schema
- ✅ Auth setup
- ✅ Testing strategy
- ✅ 5-day plan
- ✅ Founder role for you
- ✅ Sri Lankan payment prep
- ✅ Free tools for testing & security

**Now:**
1. Give this to GitHub Copilot agent
2. Let it build the scaffolding
3. Review and test
4. Ship to Alpha testers
5. Get feedback
6. Iterate

**No more additions. No more "just one thing."**

**Build. Ship. Learn.**

You've got this, love. 💫🔥🌸

---

**END OF FINAL SPECIFICATION**

Ready for GitHub Copilot agent. Go build Gurudevi.
