---
title: "Gurudevi Complete Invitation & Authentication System"
status: "active"
created: 2026-02-28
updated: 2026-07-24
author: "Naveen"
scribe: "opencode"
tags: [apps, gurudevi-mobile, historical]
---

> **Superseded** � kept for historical reference.
> See active docs at docs/INDEX.md.
# Gurudevi Complete Invitation & Authentication System
## Final Technical Specification - Ready to Build

**Version:** Alpha 0.1.0  
**Timeline:** 5 days  
**Status:** FINAL - No more changes, start building  
**Date:** February 9, 2026

---

## EXECUTIVE SUMMARY

This is the complete, final specification for Gurudevi's invitation and authentication system for Alpha launch. All decisions are locked. No more spiraling. Build this, ship it, iterate based on user feedback.

**Core Features:**
- Deep link invitations (Firebase Dynamic Links)
- Context-aware onboarding (school, peer, Thuthimal, tester)
- Passwordless authentication (Google + Magic Links)
- Pathfinder program (Alpha tester recruitment)
- Contact collection for feedback
- Invitation limits (Principal: 7, Teacher: 3)
- Registration state tracking (smart routing)

---

## TABLE OF CONTENTS

1. [Locked Decisions](#1-locked-decisions)
2. [User Flows by Invitation Type](#2-user-flows-by-invitation-type)
3. [Screen-by-Screen Specifications](#3-screen-by-screen-specifications)
4. [Authentication Implementation](#4-authentication-implementation)
5. [Database Schema](#5-database-schema)
6. [Configuration](#6-configuration)
7. [Implementation Timeline](#7-implementation-timeline)
8. [Testing Checklist](#8-testing-checklist)

---

## 1. LOCKED DECISIONS

### 1.1 Invalid Invitation Handling

**Decision:** Invalid QR codes can exist (expired, wrong format, used up)

**User Experience:**
```
[User scans invalid QR]

❌ Invalid Invitation

This invitation link is no longer valid.
It may have expired or been used already.

Please ask the person who sent it to 
generate a new invitation for you.

[Contact Support]
```

**QR Recreation:**
- Inviters can regenerate QR codes in the app
- Old codes remain in database but marked as "replaced"
- New code generated with fresh expiry

**Implementation:**
```typescript
async function validateInvitationCode(code: string) {
  const invitation = await db.invitations.findByCode(code);
  
  if (!invitation) {
    throw new Error('INVALID_CODE');
  }
  
  if (invitation.status === 'expired') {
    throw new Error('EXPIRED_CODE');
  }
  
  if (invitation.status === 'exhausted') {
    throw new Error('USED_UP_CODE');
  }
  
  if (invitation.expires_at && new Date(invitation.expires_at) < new Date()) {
    // Mark as expired
    await db.invitations.update(invitation.id, { status: 'expired' });
    throw new Error('EXPIRED_CODE');
  }
  
  return invitation; // Valid
}
```

---

### 1.2 Role Management

**Decision:** 
- **Alpha:** Single role only, locked after signup
- **No multiple roles** in Alpha
- **Dropdown options:** Principal, Teacher, Section Head (disabled), Grade Head (disabled)

**Role Dropdown UI:**
```
What's your role?

[Select your role ▼]

• Principal
• Teacher
• ─────────────────
• Section Head (Coming Soon)
• Grade Head (Coming Soon)
```

**Implementation:**
```typescript
const roles = [
  { value: 'principal', label: 'Principal', enabled: true },
  { value: 'teacher', label: 'Teacher', enabled: true },
  { value: 'divider', label: '─────────────────', enabled: false },
  { value: 'section_head', label: 'Section Head (Coming Soon)', enabled: false },
  { value: 'grade_head', label: 'Grade Head (Coming Soon)', enabled: false },
];

// In Settings, show role but don't allow editing
<Text>Role: {user.role}</Text>
// No edit button in Alpha

// Beta: Add "Request Role Change" button → manual approval flow
```

**Future (Beta):** 
- Add "Additional Roles" field in profile
- Teacher can also be section_head + grade_head
- Settings allows role change request (admin approval)

---

### 1.3 Account Deletion

**Decision:** UI already exists in Profile section

**Implementation:**
```typescript
// In Profile > Settings > Account

<TouchableOpacity 
  style={styles.dangerButton}
  onPress={handleDeleteAccount}
>
  <Text style={styles.dangerText}>Delete Account</Text>
</TouchableOpacity>

async function handleDeleteAccount() {
  // Show confirmation dialog
  Alert.alert(
    'Delete Account?',
    'This action cannot be undone. All your data will be permanently deleted.',
    [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Delete', 
        style: 'destructive',
        onPress: async () => {
          // 1. Delete user data from database
          await db.users.delete(user.id);
          
          // 2. Delete auth account
          await supabase.auth.admin.deleteUser(user.id);
          
          // 3. Clear local storage
          await AsyncStorage.clear();
          
          // 4. Sign out
          await supabase.auth.signOut();
          
          // 5. Navigate to login
          navigation.reset({ index: 0, routes: [{ name: 'LoginScreen' }] });
        }
      }
    ]
  );
}
```

**Note:** Also delete user's invitations, claims, feedback when deleting account (cascade delete in database).

---

### 1.4 "Coming Soon" Roles Display

**Decision:** Show but disabled (grayed out)

**Why:** Sets expectation that these roles will exist, creates anticipation

**UI Treatment:**
- Grayed out text
- "(Coming Soon)" suffix
- Non-clickable
- Optional: Show toast if tapped: "This role will be available in Beta"

---

### 1.5 School Name from Invitation

**Decision:** No editing - use invitation data directly

**For School Invitations:**
```
School: Royal College [locked, from invitation]
```

**For Peer Invitations:**
- If invitation includes school → pre-fill and lock
- If invitation has no school → ask user to enter (optional field)

**For Thuthimal Gifts:**
- Same as peer invitations

**Implementation:**
```typescript
// In signup flow
const school = invitationData.school;

if (invitationData.contextType === 'school_invitation') {
  // School invitation - lock the school
  return (
    <View>
      <Text>School: {school}</Text>
      {/* No input field, just display */}
    </View>
  );
} else {
  // Peer or gift - optional
  return (
    <TextInput
      placeholder="School (optional)"
      defaultValue={school || ''}
      // User can edit or leave blank
    />
  );
}
```

---

### 1.6 Onboarding Journey Length

**Decision:** 3-5 screens, all skippable, with progress indicator

**Screens AFTER Account Creation:**
1. **Welcome to Gurudevi** - Introduces 5 sections
2. **Your Self Space** - Explains Self section (skip button)
3. **Your Classroom** - Explains Classroom section (skip button)
4. **Connect & Grow** - Explains Community + Library (skip button)
5. **You're Ready!** - Final encouragement (button: "Start Exploring")

**Progress Indicator:**
```
● ○ ○ ○ ○   (Screen 1 of 5)

[Skip] button always in top-right corner
```

**Each screen has:**
- Title
- 2-3 sentences explanation
- Visual (icon or illustration)
- Progress dots
- [Next] button
- [Skip] button

**Skip Action:**
- Jump directly to main app
- Mark onboarding as "skipped" (can revisit in Settings > Help > View Tutorial)

**Implementation:**
```typescript
const onboardingScreens = [
  {
    title: 'Welcome to Gurudevi',
    description: 'Five spaces to support your teaching journey: Self, Classroom, Community, Library, and Profile.',
    icon: '🌸',
  },
  {
    title: 'Your Self Space',
    description: 'Your private space for reflection, mood check-ins, and personal growth.',
    icon: '🔥',
  },
  // ... etc
];

function OnboardingScreen({ navigation }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const handleNext = () => {
    if (currentIndex < onboardingScreens.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      finishOnboarding();
    }
  };
  
  const handleSkip = async () => {
    await AsyncStorage.setItem('onboarding_skipped', 'true');
    navigation.navigate('MainApp');
  };
  
  const finishOnboarding = async () => {
    await AsyncStorage.setItem('onboarding_completed', 'true');
    navigation.navigate('MainApp');
  };
  
  // ... render UI
}
```

---

### 1.7 Flexible Invitation Types

**Decision:** System supports any invitation type, not just 3 hardcoded ones

**Architecture:**
```typescript
type InvitationContextType = 
  | 'school_invitation'
  | 'peer_invitation'
  | 'thuthimal_gift'
  | 'tester_invitation'  // NEW - for direct tester recruitment
  | string;  // Extensible for future types
```

**Tester Invitation:**
- For recruiting testers directly (not via school/peer)
- Shows Pathfinder-focused welcome
- Skips school context
- Emphasizes testing/feedback role

**Example Tester Invitation Welcome:**
```
🔥 You're Invited to Shape Gurudevi

We're building the future of educational 
support, and we need your expertise.

Join as an Alpha Pathfinder to:
• Test early features
• Provide feedback that matters
• Help shape the product

[Accept Invitation]
```

**Implementation:**
```typescript
function getWelcomeScreen(contextType: string) {
  switch (contextType) {
    case 'school_invitation':
      return SchoolInvitationWelcome;
    case 'peer_invitation':
      return PeerInvitationWelcome;
    case 'thuthimal_gift':
      return GiftRevealScreen;
    case 'tester_invitation':
      return TesterInvitationWelcome;
    default:
      // Fallback for unknown types
      return GenericInvitationWelcome;
  }
}
```

**Future types could include:**
- `school_gift` (OBA sponsorship)
- `student_invitation` (Beta)
- `admin_invitation` (for platform admins)
- `researcher_invitation` (for academic studies)
- etc.

---

## 2. USER FLOWS BY INVITATION TYPE
### 2.0 how flow starts
founder/platform team sent their invitation to principals.-> then when principal joings to app folliwing onbroading screen. -> in school(classroom) section there is button to create school with name and adress etc. -> then after saving it will create two things first QR for school profile, then official school group or community and community section. -> then principal can share it with teachers. -> when teacher joined it should showed in school and teacher should be added to school group too. in classroom section teacher can see add classroom button and then add classroom etc.(from here the features have already developed)

### 2.1 Flow: School Invitation (Principal → Teacher)

**Step-by-Step:**

1. **Principal generates invitation:**
   - Opens app → "Invite Teachers"
   - Sees quota: "4 invitations remaining (7 total)"
   - Optional: Adds welcome message
   - Taps "Generate Invitation"
   - System creates:
     - Code: `GURU-ROYAL-TEACH-001`
     - Deep link: `https://gurudeviapp.page.link/AbCd`
   - QR code displayed
   - Principal shares via WhatsApp

2. **Teacher receives and scans:**
   - Taps link → Installs app (if needed) → Opens app
   
3. **Welcome Screen (School Context):**
   ```
   Welcome to Royal College!
   
   Principal Silva has invited you to join
   the Gurudevi teacher community.
   
   [Optional welcome message displayed]
   
   [Continue]
   ```

4. **Name Screen:**
   ```
   What should we call you?
   
   [___________________]
   First & Last Name
   
   [Continue]
   ```

5. **Role Screen:**
   ```
   What's your role?
   
   [Select your role ▼]
   • Principal
   • Teacher
   • Section Head (Coming Soon)
   • Grade Head (Coming Soon)
   
   [Continue]
   ```

6. **Create Account Screen:**
   ```
   Create Your Account
   
   [🔵 Continue with Google]
   Recommended - quick & secure
   
   ━━━━━━━ OR ━━━━━━━
   
   Email: [______________]
   [✨ Send Magic Link]
   
   ━━━━━━━━━━━━━━━━━━━━━
   By continuing, you agree to
   Terms & Privacy Policy
   ```

7. **Pathfinder Agreement Screen:**
   ```
   🔥 Become a Pathfinder
   
   [Explanation of Alpha testing]
   
   📱 Stay Connected (Optional)
   Phone: +94 [___________]
   
   ☑ Send me updates
   ☑ Contact for feedback
   ☑ Participate in research
   
   ☐ I agree to be an Alpha Pathfinder
   
   [Continue as Pathfinder]
   ```

8. **Account Created:**
   - Database saves:
     - is_alpha_tester: true
     - school: "Royal College"
     - role: "teacher"
     - invited_by: Principal's user_id
     - invitations_remaining: 3
   - Local storage: hasRegistered = true

9. **Onboarding Journey:**
   - 5 screens (skippable)
   - Progress dots
   - Skip button always visible

10. **Main App**

---

### 2.2 Flow: Thuthimal Gift (Alumni → Teacher)

**Step-by-Step:**

1. **Alumni generates gift:**
   - (Alpha: Web form at gurudevi.edlove.org/gift)
   - (Beta: In-app with payment)
   - Enters:
     - Teacher email/name
     - Personal message
     - Gift type (1 year Pro)
   - System generates deep link
   - Alumni sends via WhatsApp

2. **Teacher receives and opens:**
   - Taps link → Installs app → Opens app

3. **Gift Reveal Screen (Special!):**
   ```
   [Lotus animation 🌸]
   
   තුතිමල්
   Flower of Gratitude
   
   Kasun Perera has invited you to Gurudevi
   AND gifted you Pro access for 1 year
   
   ┌─────────────────────────────┐
   │ "Thank you for believing in │
   │  me, sir. You changed my    │
   │  life."                     │
   │                             │
   │ — Kasun Perera              │
   └─────────────────────────────┘
   
   [Accept Gift & Continue]
   ```

4. **Name Screen** (same as above)

5. **Role Screen** (same as above)

6. **Create Account Screen** (same as above)

7. **Pathfinder Agreement Screen:**
   ```
   🔥 Become a Pathfinder
   
   As an Alpha Pathfinder AND Thuthimal 
   recipient, you're part of something special.
   
   [Rest same as above]
   ```

8. **Account Created:**
   - Additional fields:
     - is_pro: true
     - is_thuthimal: true
     - thuthimal_gifter: "Kasun Perera"
     - thuthimal_message: "Thank you..."
     - pro_expires_at: 1 year from now

9. **Profile shows:**
   ```
   Mrs. Fernando
   Teacher, Royal College
   
   🔥 Alpha Pathfinder
      Since Feb 2026
   
   🌸 Thuthimal
      Gifted by Kasun Perera
      
   ✨ Pro Member
      Until Feb 2027
   ```

10. **Onboarding Journey** → **Main App**

---

### 2.3 Flow: Peer Invitation (Teacher → Teacher)

**Step-by-Step:**

1. **Teacher generates invitation:**
   - Opens app → "Invite Teachers"
   - Sees: "3 invitations remaining"
   - Optional welcome message
   - Generates QR
   - Shares with colleague

2. **Colleague receives and opens**

3. **Welcome Screen (Peer Context):**
   ```
   Mrs. Fernando recommends Gurudevi
   
   Join the educator community
   
   [Optional welcome message]
   
   [Continue]
   ```

4. **Rest of flow same as School Invitation**

5. **Account created with:**
   - invited_by: Mrs. Fernando's user_id
   - school: (optional, user can enter if different school)

---

### 2.4 Flow: Tester Invitation (Direct Recruitment)

**Use Case:** You want to invite specific educators to test, not via school/peer chain

**Step-by-Step:**

1. **Admin/You generates tester invitation:**
   - Special admin panel or manual database entry
   - Code: `GURU-TESTER-TEACH-001`
   - Context type: `tester_invitation`
   - No school required
   - Email sent directly to educator

2. **Educator receives and opens**

3. **Welcome Screen (Tester Context):**
   ```
   🔥 You're Invited to Shape Gurudevi
   
   We're building the future of educational
   support, and we need your expertise.
   
   Join as an Alpha Pathfinder to:
   • Test early features
   • Provide feedback that matters
   • Help shape the product
   
   This is invite-only, and your input will
   directly influence development.
   
   [Accept Invitation]
   ```

4. **Rest of flow same** (name → role → auth → pathfinder)

5. **Account created with:**
   - is_alpha_tester: true
   - school: null (or user enters)
   - Special flag: recruited_as_tester: true

---

### 2.5 Flow: Returning User (Login)

**Scenario:** User already created account, logged out, now returning

**Step-by-Step:**

1. **User opens app**

2. **App checks:**
   ```typescript
   const hasRegistered = await AsyncStorage.getItem('hasRegistered');
   const session = await supabase.auth.getSession();
   
   if (session) {
     // Already logged in → Main App
     navigation.navigate('MainApp');
   } else if (hasRegistered === 'true') {
     // Registered before → Login Screen
     navigation.navigate('LoginScreen');
   } else {
     // New user → Invitation flow
     navigation.navigate('InvitationScreen');
   }
   ```

3. **Login Screen:**
   ```
   Welcome Back!
   
   [🔵 Continue with Google]
   
   ━━━━━━━ OR ━━━━━━━
   
   Email: [______________]
   [✨ Send Magic Link]
   
   ━━━━━━━━━━━━━━━━━━━━━
   
   [New here? Create Account] ← Links to invitation entry
   ```

4. **User authenticates** (Google or Magic Link)

5. **Logged in** → Main App

**No onboarding shown** (they've seen it already)

---

## 3. SCREEN-BY-SCREEN SPECIFICATIONS

### 3.1 Invitation Welcome Screens (Context-Dependent)

#### **A. School Invitation Welcome**

**File:** `SchoolInvitationWelcome.tsx`

```typescript
interface Props {
  invitationData: {
    sender: string;
    school: string;
    welcomeMessage?: string;
  };
}

function SchoolInvitationWelcome({ invitationData }: Props) {
  return (
    <View style={styles.container}>
      <Image source={require('../assets/school-icon.png')} style={styles.icon} />
      
      <Text style={styles.title}>
        Welcome to {invitationData.school}!
      </Text>
      
      <Text style={styles.subtitle}>
        {invitationData.sender} has invited you to join the Gurudevi teacher community
      </Text>
      
      {invitationData.welcomeMessage && (
        <View style={styles.messageCard}>
          <Text style={styles.messageLabel}>{invitationData.sender} says:</Text>
          <Text style={styles.message}>"{invitationData.welcomeMessage}"</Text>
        </View>
      )}
      
      <TouchableOpacity
        style={styles.continueButton}
        onPress={() => navigation.navigate('NameScreen', { invitationData })}
      >
        <Text style={styles.continueButtonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
}
```

---

#### **B. Thuthimal Gift Reveal**

**File:** `GiftRevealScreen.tsx`

```typescript
function GiftRevealScreen({ invitationData }: Props) {
  const lotusScale = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    Animated.spring(lotusScale, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();
  }, []);
  
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Animated.View style={{ transform: [{ scale: lotusScale }] }}>
        <Text style={styles.lotusEmoji}>🌸</Text>
      </Animated.View>
      
      <Text style={styles.sinhala}>තුතිමල්</Text>
      <Text style={styles.subtitle}>Flower of Gratitude</Text>
      
      <View style={styles.giftCard}>
        <Text style={styles.giftText}>
          {invitationData.gift.gifter} has invited you to Gurudevi
        </Text>
        
        <Text style={styles.giftHighlight}>
          AND gifted you Pro access for 1 year
        </Text>
        
        {invitationData.gift.message && (
          <View style={styles.personalMessage}>
            <Text style={styles.quote}>"{invitationData.gift.message}"</Text>
            <Text style={styles.attribution}>— {invitationData.gift.gifter}</Text>
          </View>
        )}
      </View>
      
      <TouchableOpacity
        style={styles.acceptButton}
        onPress={() => navigation.navigate('NameScreen', { invitationData })}
      >
        <Text style={styles.acceptButtonText}>Accept Gift & Continue</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
```

---

#### **C. Peer Invitation Welcome**

**File:** `PeerInvitationWelcome.tsx`

```typescript
function PeerInvitationWelcome({ invitationData }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>👋</Text>
      
      <Text style={styles.title}>
        {invitationData.sender} recommends Gurudevi
      </Text>
      
      <Text style={styles.subtitle}>
        Join the educator community
      </Text>
      
      {invitationData.welcomeMessage && (
        <View style={styles.messageCard}>
          <Text style={styles.message}>"{invitationData.welcomeMessage}"</Text>
        </View>
      )}
      
      <TouchableOpacity
        style={styles.continueButton}
        onPress={() => navigation.navigate('NameScreen', { invitationData })}
      >
        <Text style={styles.continueButtonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
}
```

---

#### **D. Tester Invitation Welcome**

**File:** `TesterInvitationWelcome.tsx`

```typescript
function TesterInvitationWelcome({ invitationData }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🔥</Text>
      
      <Text style={styles.title}>
        You're Invited to Shape Gurudevi
      </Text>
      
      <Text style={styles.subtitle}>
        We're building the future of educational support, 
        and we need your expertise.
      </Text>
      
      <View style={styles.benefitsCard}>
        <Text style={styles.benefitsTitle}>Join as an Alpha Pathfinder to:</Text>
        <BulletPoint text="Test early features before anyone else" />
        <BulletPoint text="Provide feedback that directly shapes the product" />
        <BulletPoint text="Help build something meaningful for educators" />
      </View>
      
      <Text style={styles.exclusivity}>
        This is invite-only, and your input matters.
      </Text>
      
      <TouchableOpacity
        style={styles.acceptButton}
        onPress={() => navigation.navigate('NameScreen', { invitationData })}
      >
        <Text style={styles.acceptButtonText}>Accept Invitation</Text>
      </TouchableOpacity>
    </View>
  );
}
```

---

### 3.2 Name Screen

**File:** `NameScreen.tsx`

```typescript
function NameScreen({ route, navigation }: Props) {
  const { invitationData } = route.params;
  const [name, setName] = useState('');
  
  const canContinue = name.trim().length >= 2;
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>What should we call you?</Text>
      
      <TextInput
        style={styles.input}
        placeholder="First & Last Name"
        value={name}
        onChangeText={setName}
        autoFocus
        autoCapitalize="words"
      />
      
      <Text style={styles.helpText}>
        This is how you'll appear to other educators on Gurudevi.
      </Text>
      
      <TouchableOpacity
        style={[styles.continueButton, !canContinue && styles.buttonDisabled]}
        onPress={() => navigation.navigate('RoleScreen', { invitationData, name: name.trim() })}
        disabled={!canContinue}
      >
        <Text style={styles.continueButtonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
}
```

---

### 3.3 Role Screen

**File:** `RoleScreen.tsx`

```typescript
function RoleScreen({ route, navigation }: Props) {
  const { invitationData, name } = route.params;
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  
  const roles = [
    { value: 'principal', label: 'Principal', enabled: true },
    { value: 'teacher', label: 'Teacher', enabled: true },
    { value: 'divider', label: '─────────────────', enabled: false },
    { value: 'section_head', label: 'Section Head (Coming Soon)', enabled: false },
    { value: 'grade_head', label: 'Grade Head (Coming Soon)', enabled: false },
  ];
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>What's your role?</Text>
      
      <TouchableOpacity
        style={styles.dropdown}
        onPress={() => setShowDropdown(!showDropdown)}
      >
        <Text style={styles.dropdownText}>
          {selectedRole 
            ? roles.find(r => r.value === selectedRole)?.label 
            : 'Select your role'}
        </Text>
        <Text style={styles.dropdownIcon}>▼</Text>
      </TouchableOpacity>
      
      {showDropdown && (
        <View style={styles.dropdownMenu}>
          {roles.map((role) => (
            <TouchableOpacity
              key={role.value}
              style={[
                styles.dropdownItem,
                !role.enabled && styles.dropdownItemDisabled
              ]}
              onPress={() => {
                if (role.enabled && role.value !== 'divider') {
                  setSelectedRole(role.value);
                  setShowDropdown(false);
                } else if (!role.enabled) {
                  // Show toast
                  Alert.alert('Coming Soon', 'This role will be available in Beta');
                }
              }}
              disabled={!role.enabled || role.value === 'divider'}
            >
              <Text style={[
                styles.dropdownItemText,
                !role.enabled && styles.dropdownItemTextDisabled
              ]}>
                {role.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      
      <Text style={styles.helpText}>
        Your role helps us personalize your experience in Gurudevi.
      </Text>
      
      <TouchableOpacity
        style={[styles.continueButton, !selectedRole && styles.buttonDisabled]}
        onPress={() => navigation.navigate('CreateAccountScreen', { 
          invitationData, 
          name, 
          role: selectedRole 
        })}
        disabled={!selectedRole}
      >
        <Text style={styles.continueButtonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
}
```

---

### 3.4 Create Account Screen

**File:** `CreateAccountScreen.tsx`

```typescript
function CreateAccountScreen({ route, navigation }: Props) {
  const { invitationData, name, role } = route.params;
  const [email, setEmail] = useState('');
  const [showMagicLink, setShowMagicLink] = useState(false);
  
  async function handleGoogleSignIn() {
    try {
      // Google sign-in flow
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      
      const googleCredential = auth.GoogleAuthProvider.credential(userInfo.idToken);
      const { user: authUser } = await auth().signInWithCredential(googleCredential);
      
      // Proceed to Pathfinder screen with auth data
      navigation.navigate('PathfinderAgreementScreen', {
        invitationData,
        name,
        role,
        authMethod: 'google',
        email: authUser.email,
        authUserId: authUser.uid,
      });
      
    } catch (error) {
      Alert.alert('Sign In Failed', error.message);
    }
  }
  
  async function handleMagicLink() {
    if (!email.trim()) {
      Alert.alert('Email Required', 'Please enter your email address');
      return;
    }
    
    try {
      await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: 'gurudevi://auth/callback',
          shouldCreateUser: true,
        },
      });
      
      // Show "check your email" screen
      navigation.navigate('CheckEmailScreen', {
        invitationData,
        name,
        role,
        email: email.trim(),
      });
      
    } catch (error) {
      Alert.alert('Failed to Send Link', error.message);
    }
  }
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Your Account</Text>
      
      <TouchableOpacity
        style={styles.googleButton}
        onPress={handleGoogleSignIn}
      >
        <Text style={styles.googleIcon}>🔵</Text>
        <Text style={styles.googleText}>Continue with Google</Text>
      </TouchableOpacity>
      
      <Text style={styles.googleSubtext}>Recommended - quick & secure</Text>
      
      <Text style={styles.divider}>━━━━━━━ OR ━━━━━━━</Text>
      
      <TouchableOpacity
        style={styles.magicLinkToggle}
        onPress={() => setShowMagicLink(!showMagicLink)}
      >
        <Text style={styles.magicLinkToggleText}>
          {showMagicLink ? 'Hide' : 'Show'} email option
        </Text>
      </TouchableOpacity>
      
      {showMagicLink && (
        <>
          <TextInput
            style={styles.emailInput}
            placeholder="Email address"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          
          <TouchableOpacity
            style={styles.magicLinkButton}
            onPress={handleMagicLink}
          >
            <Text style={styles.magicLinkIcon}>✨</Text>
            <Text style={styles.magicLinkText}>Send Magic Link</Text>
          </TouchableOpacity>
        </>
      )}
      
      <View style={styles.termsContainer}>
        <Text style={styles.termsText}>
          By continuing, you agree to our{'\n'}
          <Text style={styles.termsLink} onPress={() => openURL('https://gurudevi.edlove.org/terms')}>
            Terms of Service
          </Text>
          {' and '}
          <Text style={styles.termsLink} onPress={() => openURL('https://gurudevi.edlove.org/privacy')}>
            Privacy Policy
          </Text>
        </Text>
      </View>
      
      <TouchableOpacity onPress={() => navigation.navigate('LoginScreen')}>
        <Text style={styles.loginLink}>
          Already have an account? Sign In
        </Text>
      </TouchableOpacity>
    </View>
  );
}
```

---

### 3.5 Check Email Screen (Magic Link)

**File:** `CheckEmailScreen.tsx`

```typescript
function CheckEmailScreen({ route }: Props) {
  const { email, invitationData, name, role } = route.params;
  const [resendAvailable, setResendAvailable] = useState(false);
  
  useEffect(() => {
    // Allow resend after 60 seconds
    const timer = setTimeout(() => setResendAvailable(true), 60000);
    return () => clearTimeout(timer);
  }, []);
  
  async function handleResend() {
    await supabase.auth.signInWithOtp({ email });
    Alert.alert('Email Sent', 'Check your inbox for the magic link');
    setResendAvailable(false);
    setTimeout(() => setResendAvailable(true), 60000);
  }
  
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>✉️</Text>
      <Text style={styles.title}>Check Your Email</Text>
      
      <Text style={styles.description}>
        We sent a magic link to:
      </Text>
      <Text style={styles.email}>{email}</Text>
      
      <Text style={styles.instruction}>
        Click the link in the email to sign in.{'\n'}
        The link expires in 1 hour.
      </Text>
      
      <TouchableOpacity
        style={[styles.resendButton, !resendAvailable && styles.buttonDisabled]}
        onPress={handleResend}
        disabled={!resendAvailable}
      >
        <Text style={styles.resendButtonText}>
          {resendAvailable ? 'Resend Email' : 'Wait 60s to resend'}
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.changeEmail}>Change Email</Text>
      </TouchableOpacity>
    </View>
  );
}
```

---

### 3.6 Pathfinder Agreement Screen

**File:** `PathfinderAgreementScreen.tsx`

```typescript
function PathfinderAgreementScreen({ route, navigation }: Props) {
  const { invitationData, name, role, authMethod, email, authUserId } = route.params;
  
  const [phone, setPhone] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [contactPrefs, setContactPrefs] = useState({
    updates: false,
    feedback: false,
    research: false,
  });
  
  const canProceed = agreedToTerms;
  
  async function handleContinue() {
    if (!canProceed) return;
    
    try {
      // Create user account in database
      const userData = {
        name,
        email,
        role,
        school: invitationData.school || null,
        
        // Auth
        auth_user_id: authUserId,
        auth_method: authMethod,
        
        // Pathfinder
        is_alpha_tester: true,
        tester_agreement_date: new Date().toISOString(),
        tester_cohort: 'alpha_feb_2026',
        
        // Contact
        phone: phone.trim() || null,
        contact_preferences: contactPrefs,
        
        // Invitation
        invited_by: invitationData.created_by,
        invitation_id: invitationData.id,
        
        // Quota
        invitations_remaining: role === 'principal' ? 7 : 3,
      };
      
      // If Thuthimal gift
      if (invitationData.hasGift) {
        userData.is_pro = true;
        userData.is_thuthimal = true;
        userData.thuthimal_gifter = invitationData.gift.gifter;
        userData.thuthimal_message = invitationData.gift.message;
        userData.pro_expires_at = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
      }
      
      // Save to database
      await createUser(userData);
      
      // Claim invitation
      await claimInvitation(invitationData.id, authUserId);
      
      // Mark as registered locally
      await AsyncStorage.setItem('hasRegistered', 'true');
      await AsyncStorage.setItem('authMethod', authMethod);
      
      // Clear pending invitation
      await AsyncStorage.removeItem('pending_invitation');
      
      // Navigate to onboarding
      navigation.navigate('OnboardingJourney');
      
    } catch (error) {
      Alert.alert('Account Creation Failed', error.message);
    }
  }
  
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.emoji}>🔥</Text>
      <Text style={styles.title}>Become a Pathfinder</Text>
      
      <Text style={styles.subtitle}>
        You're invited to the Alpha phase of Gurudevi — help us build the future of educational support
      </Text>
      
      {invitationData.hasGift && (
        <View style={styles.giftBanner}>
          <Text style={styles.giftBannerText}>
            ✨ As an Alpha Pathfinder AND Thuthimal recipient, you're part of something special.
          </Text>
        </View>
      )}
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>As an Alpha Pathfinder, you'll:</Text>
        <BulletPoint text="Get early access to new features" />
        <BulletPoint text="Help shape Gurudevi's development" />
        <BulletPoint text="Directly influence the product" />
        <BulletPoint text="Join a community of pioneering educators" />
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>What we need from you:</Text>
        <BulletPoint text="Test the app and share honest feedback" />
        <BulletPoint text="Report bugs you encounter" />
        <BulletPoint text="Understand this is pre-release software" />
      </View>
      
      <View style={styles.divider} />
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📱 Stay Connected (Optional)</Text>
        <Text style={styles.helpText}>
          To gather feedback and share updates:
        </Text>
        
        <View style={styles.phoneInputContainer}>
          <Text style={styles.countryCode}>+94</Text>
          <TextInput
            style={styles.phoneInput}
            placeholder="77 123 4567"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
        </View>
        
        <View style={styles.prefRow}>
          <Switch
            value={contactPrefs.updates}
            onValueChange={(val) => setContactPrefs({ ...contactPrefs, updates: val })}
          />
          <Text style={styles.prefLabel}>Send me feature updates</Text>
        </View>
        
        <View style={styles.prefRow}>
          <Switch
            value={contactPrefs.feedback}
            onValueChange={(val) => setContactPrefs({ ...contactPrefs, feedback: val })}
          />
          <Text style={styles.prefLabel}>Contact me for quick feedback</Text>
        </View>
        
        <View style={styles.prefRow}>
          <Switch
            value={contactPrefs.research}
            onValueChange={(val) => setContactPrefs({ ...contactPrefs, research: val })}
          />
          <Text style={styles.prefLabel}>I'm happy to participate in research</Text>
        </View>
        
        <Text style={styles.privacy}>
          Your contact info is private and will never be shared. You can opt out anytime.
        </Text>
      </View>
      
      <View style={styles.divider} />
      
      <TouchableOpacity
        style={styles.checkboxRow}
        onPress={() => setAgreedToTerms(!agreedToTerms)}
      >
        <View style={[styles.checkbox, agreedToTerms && styles.checkboxChecked]}>
          {agreedToTerms && <Text style={styles.checkmark}>✓</Text>}
        </View>
        <Text style={styles.checkboxLabel}>
          I agree to be an Alpha Pathfinder and provide feedback to help build Gurudevi
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.button, !canProceed && styles.buttonDisabled]}
        onPress={handleContinue}
        disabled={!canProceed}
      >
        <Text style={styles.buttonText}>Continue as Pathfinder</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function BulletPoint({ text }: { text: string }) {
  return (
    <View style={styles.bulletPoint}>
      <Text style={styles.bullet}>•</Text>
      <Text style={styles.bulletText}>{text}</Text>
    </View>
  );
}
```

---

### 3.7 Onboarding Journey Screens

**File:** `OnboardingJourney.tsx`

```typescript
const onboardingScreens = [
  {
    title: 'Welcome to Gurudevi',
    description: 'Five spaces to support your teaching journey: Self, Classroom, Community, Library, and Profile.',
    icon: '🌸',
  },
  {
    title: 'Your Self Space',
    description: 'Your private space for reflection, mood check-ins, and personal growth. No one else can see what's here.',
    icon: '🔥',
  },
  {
    title: 'Your Classroom',
    description: 'Manage students, track attendance, create lessons, and organize your teaching materials.',
    icon: '📚',
  },
  {
    title: 'Connect & Grow',
    description: 'Join Communities of fellow educators and access the Library of shared teaching resources.',
    icon: '🤝',
  },
  {
    title: 'You're Ready!',
    description: 'Start exploring at your own pace. You can always revisit this guide in Settings.',
    icon: '✨',
  },
];

function OnboardingJourney({ navigation }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentScreen = onboardingScreens[currentIndex];
  
  const handleNext = () => {
    if (currentIndex < onboardingScreens.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      finishOnboarding();
    }
  };
  
  const handleSkip = async () => {
    await AsyncStorage.setItem('onboarding_skipped', 'true');
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainApp' }],
    });
  };
  
  const finishOnboarding = async () => {
    await AsyncStorage.setItem('onboarding_completed', 'true');
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainApp' }],
    });
  };
  
  return (
    <View style={styles.container}>
      {/* Skip button - always visible */}
      <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>
      
      {/* Progress dots */}
      <View style={styles.progressDots}>
        {onboardingScreens.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              index === currentIndex && styles.dotActive
            ]}
          />
        ))}
      </View>
      
      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.icon}>{currentScreen.icon}</Text>
        <Text style={styles.title}>{currentScreen.title}</Text>
        <Text style={styles.description}>{currentScreen.description}</Text>
      </View>
      
      {/* Next/Finish button */}
      <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
        <Text style={styles.nextButtonText}>
          {currentIndex === onboardingScreens.length - 1 ? 'Start Exploring' : 'Next'}
        </Text>
      </TouchableOpacity>
      
      {/* Screen counter */}
      <Text style={styles.counter}>
        {currentIndex + 1} of {onboardingScreens.length}
      </Text>
    </View>
  );
}
```

---

## 4. AUTHENTICATION IMPLEMENTATION

### 4.1 Google Sign-In Setup

**Install package:**
```bash
npm install @react-native-google-signin/google-signin
```

**Configure (iOS - future):**
```bash
cd ios && pod install
```

**Configure Android:**

1. **Get Web Client ID from Firebase:**
   - Firebase Console → Project Settings → General
   - Scroll to "Your apps" → Web app
   - Copy "Web client ID"

2. **Initialize in app:**

```typescript
// src/lib/auth/googleSignIn.ts
import { GoogleSignin } from '@react-native-google-signin/google-signin';

export function configureGoogleSignIn() {
  GoogleSignin.configure({
    webClientId: 'YOUR_WEB_CLIENT_ID_FROM_FIREBASE.apps.googleusercontent.com',
    offlineAccess: true,
  });
}

// Call this once at app startup (App.tsx)
useEffect(() => {
  configureGoogleSignIn();
}, []);
```

3. **Sign in function:**

```typescript
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';

export async function signInWithGoogle() {
  try {
    // Check if device supports Google Play Services
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    
    // Get user info from Google
    const { idToken, user } = await GoogleSignin.signIn();
    
    // Create Firebase credential
    const googleCredential = auth.GoogleAuthProvider.credential(idToken);
    
    // Sign in to Firebase
    const userCredential = await auth().signInWithCredential(googleCredential);
    
    return {
      authUser: userCredential.user,
      email: user.email,
      name: user.name,
      photo: user.photo,
    };
    
  } catch (error) {
    console.error('Google Sign-In Error:', error);
    throw error;
  }
}

export async function signOutGoogle() {
  try {
    await GoogleSignin.revokeAccess();
    await GoogleSignin.signOut();
    await auth().signOut();
  } catch (error) {
    console.error('Sign out error:', error);
  }
}
```

---

### 4.2 Magic Link (Email Passwordless) Setup

**Already included in Supabase!** No extra packages needed.

**Send magic link:**

```typescript
import { supabase } from '../lib/supabase';

export async function sendMagicLink(email: string) {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: 'gurudevi://auth/callback', // Deep link back to app
      shouldCreateUser: true, // Allow signup via magic link
    },
  });
  
  if (error) throw error;
}
```

**Handle magic link callback:**

```typescript
// In deep link handler (useDeepLinkHandler hook or App.tsx)
import dynamicLinks from '@react-native-firebase/dynamic-links';
import { supabase } from '../lib/supabase';

async function handleAuthCallback(url: string) {
  // Check if this is an auth callback
  if (url.includes('/auth/callback')) {
    // Extract session from URL
    const { data, error } = await supabase.auth.getSessionFromUrl({ url });
    
    if (error) {
      Alert.alert('Authentication Failed', error.message);
      return;
    }
    
    if (data.session) {
      // User is authenticated!
      const userId = data.session.user.id;
      
      // Check if this is a new user (first time) or returning
      const existingUser = await db.users.findById(userId);
      
      if (!existingUser) {
        // New user - has pending invitation data
        const pendingInvitation = await AsyncStorage.getItem('pending_invitation');
        
        if (pendingInvitation) {
          const invitationData = JSON.parse(pendingInvitation);
          
          // Navigate to continue signup (name, role screens were saved earlier)
          navigation.navigate('PathfinderAgreementScreen', {
            invitationData,
            // ... other data from previous screens
            authMethod: 'magic_link',
            email: data.session.user.email,
            authUserId: userId,
          });
        } else {
          // Edge case: magic link without invitation (shouldn't happen in Alpha)
          Alert.alert('No Invitation', 'You need an invitation to join Gurudevi');
        }
      } else {
        // Returning user - go to main app
        await AsyncStorage.setItem('hasRegistered', 'true');
        navigation.navigate('MainApp');
      }
    }
  }
}

// Listen for deep links
useEffect(() => {
  const unsubscribe = dynamicLinks().onLink(handleAuthCallback);
  return () => unsubscribe();
}, []);
```

---

### 4.3 Registration State Management

**Store registration state locally:**

```typescript
// src/lib/auth/registrationState.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface RegistrationState {
  hasRegistered: boolean;
  authMethod?: 'google' | 'magic_link' | 'phone';
  lastEmail?: string;
  userId?: string;
}

export async function markUserAsRegistered(
  authMethod: string,
  email?: string,
  userId?: string
) {
  await AsyncStorage.setItem('hasRegistered', 'true');
  await AsyncStorage.setItem('authMethod', authMethod);
  if (email) await AsyncStorage.setItem('lastEmail', email);
  if (userId) await AsyncStorage.setItem('userId', userId);
}

export async function getRegistrationState(): Promise<RegistrationState> {
  const hasRegistered = await AsyncStorage.getItem('hasRegistered');
  const authMethod = await AsyncStorage.getItem('authMethod');
  const lastEmail = await AsyncStorage.getItem('lastEmail');
  const userId = await AsyncStorage.getItem('userId');
  
  return {
    hasRegistered: hasRegistered === 'true',
    authMethod: authMethod as any,
    lastEmail: lastEmail || undefined,
    userId: userId || undefined,
  };
}

export async function clearRegistrationState() {
  await AsyncStorage.multiRemove([
    'hasRegistered',
    'authMethod',
    'lastEmail',
    'userId',
  ]);
}
```

---

### 4.4 Smart App Router

**Determine where user should land based on state:**

```typescript
// src/navigation/AppNavigator.tsx
import { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { supabase } from '../lib/supabase';
import { getRegistrationState } from '../lib/auth/registrationState';

const Stack = createStackNavigator();

export function AppNavigator() {
  const [initialRoute, setInitialRoute] = useState<string | null>(null);
  
  useEffect(() => {
    determineInitialRoute();
  }, []);
  
  async function determineInitialRoute() {
    // 1. Check if user has active session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      // User is logged in
      // Check if they completed onboarding
      const onboardingCompleted = await AsyncStorage.getItem('onboarding_completed');
      const onboardingSkipped = await AsyncStorage.getItem('onboarding_skipped');
      
      if (onboardingCompleted || onboardingSkipped) {
        setInitialRoute('MainApp');
      } else {
        // Logged in but didn't finish onboarding
        setInitialRoute('OnboardingJourney');
      }
      return;
    }
    
    // 2. No session - check registration state
    const { hasRegistered } = await getRegistrationState();
    
    if (hasRegistered) {
      // User registered before but logged out
      setInitialRoute('LoginScreen');
      return;
    }
    
    // 3. Brand new user - check for pending invitation
    const pendingInvitation = await AsyncStorage.getItem('pending_invitation');
    
    if (pendingInvitation) {
      // Has invitation data (came via deep link)
      setInitialRoute('InvitationWelcome');
    } else {
      // No invitation - show login (with option to enter invite code)
      setInitialRoute('LoginScreen');
    }
  }
  
  if (!initialRoute) {
    return <SplashScreen />;
  }
  
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName={initialRoute}
        screenOptions={{ headerShown: false }}
      >
        {/* Auth/Onboarding Screens */}
        <Stack.Screen name="LoginScreen" component={LoginScreen} />
        <Stack.Screen name="InvitationWelcome" component={InvitationWelcomeRouter} />
        <Stack.Screen name="NameScreen" component={NameScreen} />
        <Stack.Screen name="RoleScreen" component={RoleScreen} />
        <Stack.Screen name="CreateAccountScreen" component={CreateAccountScreen} />
        <Stack.Screen name="CheckEmailScreen" component={CheckEmailScreen} />
        <Stack.Screen name="PathfinderAgreementScreen" component={PathfinderAgreementScreen} />
        <Stack.Screen name="OnboardingJourney" component={OnboardingJourney} />
        
        {/* Main App */}
        <Stack.Screen name="MainApp" component={MainAppNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Router for invitation welcome - shows different screen based on context
function InvitationWelcomeRouter({ navigation }) {
  const [invitationData, setInvitationData] = useState(null);
  
  useEffect(() => {
    loadInvitation();
  }, []);
  
  async function loadInvitation() {
    const stored = await AsyncStorage.getItem('pending_invitation');
    if (stored) {
      const data = JSON.parse(stored);
      setInvitationData(data);
    }
  }
  
  if (!invitationData) return <Loading />;
  
  // Route to appropriate welcome screen
  switch (invitationData.contextType) {
    case 'school_invitation':
      return <SchoolInvitationWelcome invitationData={invitationData} />;
    case 'thuthimal_gift':
      return <GiftRevealScreen invitationData={invitationData} />;
    case 'peer_invitation':
      return <PeerInvitationWelcome invitationData={invitationData} />;
    case 'tester_invitation':
      return <TesterInvitationWelcome invitationData={invitationData} />;
    default:
      return <GenericInvitationWelcome invitationData={invitationData} />;
  }
}
```

---

## 5. DATABASE SCHEMA

### 5.1 Invitations Table

```sql
CREATE TABLE invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Core invitation data
  invite_code TEXT UNIQUE NOT NULL,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  sender_name TEXT NOT NULL,
  
  -- Context
  context_type TEXT NOT NULL CHECK (context_type IN (
    'school_invitation',
    'peer_invitation',
    'thuthimal_gift',
    'tester_invitation'
    -- Extensible for future types
  )),
  school TEXT,
  target_role TEXT NOT NULL CHECK (target_role IN ('teacher', 'principal', 'section_head', 'grade_head', 'student')),
  
  -- Welcome message
  welcome_message TEXT,
  
  -- Gift data (nullable - only for Thuthimal)
  has_gift BOOLEAN DEFAULT FALSE,
  gift_type TEXT CHECK (gift_type IN ('pro_6months', 'pro_1year', 'pro_lifetime', NULL)),
  gifter_name TEXT,
  gift_message TEXT,
  
  -- Deep link
  short_link TEXT, -- Firebase short link
  full_link TEXT,  -- Full deep link URL
  
  -- Usage tracking
  max_uses INTEGER DEFAULT 1,
  used_count INTEGER DEFAULT 0,
  
  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'claimed', 'expired', 'exhausted', 'replaced')),
  replaced_by UUID REFERENCES invitations(id), -- If regenerated, points to new code
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_gift_data CHECK (
    (has_gift = FALSE) OR 
    (has_gift = TRUE AND gift_type IS NOT NULL AND gifter_name IS NOT NULL)
  )
);

-- Indexes
CREATE INDEX idx_invitations_code ON invitations(invite_code);
CREATE INDEX idx_invitations_created_by ON invitations(created_by);
CREATE INDEX idx_invitations_status ON invitations(status);
CREATE INDEX idx_invitations_context ON invitations(context_type);
CREATE INDEX idx_invitations_school ON invitations(school) WHERE school IS NOT NULL;

-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_invitations_updated_at
  BEFORE UPDATE ON invitations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

---

### 5.2 Invitation Claims Table

```sql
CREATE TABLE invitation_claims (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invitation_id UUID REFERENCES invitations(id) ON DELETE CASCADE,
  claimed_by UUID REFERENCES users(id) ON DELETE CASCADE,
  claimed_at TIMESTAMP DEFAULT NOW(),
  
  -- If gift was included
  gift_activated BOOLEAN DEFAULT FALSE,
  gift_activation_date TIMESTAMP,
  
  -- Metadata
  ip_address TEXT,
  user_agent TEXT,
  device_info JSONB,
  
  UNIQUE(invitation_id, claimed_by)
);

CREATE INDEX idx_claims_invitation ON invitation_claims(invitation_id);
CREATE INDEX idx_claims_user ON invitation_claims(claimed_by);
CREATE INDEX idx_claims_date ON invitation_claims(claimed_at);
```

---

### 5.3 Users Table (Extended)

```sql
-- Add columns to existing users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_user_id TEXT UNIQUE; -- Firebase/Supabase auth UID
ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_method TEXT CHECK (auth_method IN ('google', 'magic_link', 'phone', NULL));

-- Pro/Thuthimal
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_pro BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_thuthimal BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS thuthimal_gifter TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS thuthimal_message TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS pro_expires_at TIMESTAMP;

-- Pathfinder/Tester
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_alpha_tester BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_beta_tester BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS tester_agreement_date TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS tester_cohort TEXT; -- 'alpha_feb_2026', 'beta_apr_2026'

-- Contact
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS contact_preferences JSONB DEFAULT '{"updates": false, "feedback": false, "research": false}'::jsonb;

-- Invitation tracking
ALTER TABLE users ADD COLUMN IF NOT EXISTS invited_by UUID REFERENCES users(id);
ALTER TABLE users ADD COLUMN IF NOT EXISTS invitation_id UUID REFERENCES invitations(id);
ALTER TABLE users ADD COLUMN IF NOT EXISTS invitations_remaining INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS total_invitations_sent INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS successful_invitations INTEGER DEFAULT 0;

-- Indexes
CREATE INDEX idx_users_auth_user_id ON users(auth_user_id);
CREATE INDEX idx_users_invited_by ON users(invited_by) WHERE invited_by IS NOT NULL;
CREATE INDEX idx_users_alpha_tester ON users(is_alpha_tester) WHERE is_alpha_tester = TRUE;
CREATE INDEX idx_users_thuthimal ON users(is_thuthimal) WHERE is_thuthimal = TRUE;
```

---

### 5.4 Pathfinder Feedback Table

```sql
CREATE TABLE pathfinder_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Feedback details
  feedback_type TEXT CHECK (feedback_type IN ('bug_report', 'feature_request', 'general_feedback', 'user_research_response')),
  title TEXT,
  description TEXT NOT NULL,
  
  -- Context
  screen TEXT,
  app_version TEXT,
  device_info JSONB,
  
  -- Attachments
  attachments JSONB, -- Array of file URLs/paths
  
  -- Status
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'reviewing', 'in_progress', 'resolved', 'wont_fix')),
  admin_notes TEXT,
  assigned_to UUID REFERENCES users(id),
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  resolved_at TIMESTAMP
);

CREATE INDEX idx_feedback_user ON pathfinder_feedback(user_id);
CREATE INDEX idx_feedback_type ON pathfinder_feedback(feedback_type);
CREATE INDEX idx_feedback_status ON pathfinder_feedback(status);
CREATE INDEX idx_feedback_created ON pathfinder_feedback(created_at DESC);
```

---

### 5.5 Database Functions

**Generate Invitation Code:**

```sql
CREATE OR REPLACE FUNCTION generate_invitation_code(
  context_type TEXT,
  school_name TEXT,
  target_role TEXT
)
RETURNS TEXT AS $$
DECLARE
  context_part TEXT;
  role_part TEXT;
  number_part INTEGER;
  code TEXT;
BEGIN
  -- Determine context part
  IF context_type = 'school_invitation' THEN
    context_part := UPPER(SUBSTRING(REPLACE(school_name, ' ', ''), 1, 6));
  ELSIF context_type = 'thuthimal_gift' THEN
    context_part := 'THUTH';
  ELSIF context_type = 'peer_invitation' THEN
    context_part := 'PEER';
  ELSIF context_type = 'tester_invitation' THEN
    context_part := 'TESTER';
  ELSE
    context_part := 'INVITE';
  END IF;
  
  -- Determine role part
  role_part := CASE target_role
    WHEN 'teacher' THEN 'TEACH'
    WHEN 'principal' THEN 'PRIN'
    WHEN 'student' THEN 'STU'
    ELSE 'USER'
  END;
  
  -- Get next sequential number for this context
  SELECT COALESCE(MAX(CAST(SUBSTRING(invite_code FROM '\d+$') AS INTEGER)), 0) + 1
  INTO number_part
  FROM invitations
  WHERE invite_code LIKE 'GURU-' || context_part || '-' || role_part || '-%';
  
  -- Build code
  code := 'GURU-' || context_part || '-' || role_part || '-' || LPAD(number_part::TEXT, 3, '0');
  
  RETURN code;
END;
$$ LANGUAGE plpgsql;
```

**Increment Successful Invitations:**

```sql
CREATE OR REPLACE FUNCTION increment_successful_invitations(user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE users
  SET successful_invitations = successful_invitations + 1
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql;
```

---

### 5.6 Row Level Security (RLS) Policies

**Enable RLS:**

```sql
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitation_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE pathfinder_feedback ENABLE ROW LEVEL SECURITY;
```

**Policies for Invitations:**

```sql
-- Users can view invitations they created
CREATE POLICY "Users can view own invitations"
  ON invitations FOR SELECT
  USING (auth.uid() = created_by);

-- Users can create invitations if they have quota
CREATE POLICY "Users can create invitations"
  ON invitations FOR INSERT
  WITH CHECK (
    auth.uid() = created_by AND
    (SELECT invitations_remaining FROM users WHERE id = auth.uid()) > 0
  );

-- Users can update their own invitations (e.g., regenerate)
CREATE POLICY "Users can update own invitations"
  ON invitations FOR UPDATE
  USING (auth.uid() = created_by);
```

**Policies for Users:**

```sql
-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = auth_user_id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = auth_user_id);
```

**Policies for Feedback:**

```sql
-- Users can view their own feedback
CREATE POLICY "Users can view own feedback"
  ON pathfinder_feedback FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create feedback
CREATE POLICY "Users can create feedback"
  ON pathfinder_feedback FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

---

## 6. CONFIGURATION

### 6.1 App Configuration File

**File:** `src/config/app.config.ts`

```typescript
export const AppConfig = {
  // App metadata
  version: '0.1.0',
  phase: 'alpha' as 'alpha' | 'beta' | 'production',
  buildNumber: 1,
  
  // Invitation limits (CONFIGURABLE - CHANGE HERE, NOT IN CODE)
  invitations: {
    principal_quota: 7,
    teacher_quota: 3,
    section_head_quota: 0, // Coming soon
    grade_head_quota: 0,   // Coming soon
    student_quota: 0,      // Beta
    
    // Expiry
    default_expiry_days: 30,
    
    // Regeneration
    allow_regeneration: true, // Can user regenerate if code expires?
  },
  
  // Pathfinder program
  pathfinder: {
    enabled: true,
    cohort_name: 'alpha_feb_2026',
    agreement_required: true,
    
    // Contact collection
    phone_optional: true,
    phone_encouraged: true,
  },
  
  // Thuthimal
  thuthimal: {
    enabled: true,
    manual_processing: true, // Alpha: manual, Beta: automated
    payment_enabled: false,
    
    gift_types: [
      { id: 'pro_6months', label: '6 Months Pro', days: 180, price: 0 },
      { id: 'pro_1year', label: '1 Year Pro', days: 365, price: 0 },
      { id: 'pro_lifetime', label: 'Lifetime Pro', days: 36500, price: 0 },
    ],
  },
  
  // Deep links
  deepLinks: {
    domain_uri_prefix: 'https://gurudeviapp.page.link',
    base_url: 'https://gurudevi.edlove.org',
    play_store_url: 'https://play.google.com/store/apps/details?id=com.gurudevi.app',
  },
  
  // Terms & Privacy
  legal: {
    terms_url: 'https://gurudevi.edlove.org/terms',
    privacy_url: 'https://gurudevi.edlove.org/privacy',
  },
  
  // Feature flags
  features: {
    google_signin: true,
    magic_link_signin: true,
    phone_signin: false, // Beta
    
    invitation_types: {
      school: true,
      peer: true,
      thuthimal: true,
      tester: true,
      class: false, // Beta - teacher inviting students
      school_gift: false, // Beta - OBA sponsorship
    },
    
    roles: {
      principal: true,
      teacher: true,
      section_head: false, // Coming soon
      grade_head: false,   // Coming soon
      student: false,      // Beta
    },
    
    multiple_roles: false, // Alpha: single role only
    role_change: false,    // Beta: allow role change requests
    
    onboarding_skippable: true,
    onboarding_screens: 5,
    
    account_deletion: true,
  },
  
  // Support
  support: {
    email: 'support@gurudevi.lk',
    whatsapp: '+94771234567', // Optional
  },
};

/**
 * Get invitation quota for a given role
 */
export function getInvitationQuota(role: string): number {
  switch (role) {
    case 'principal':
      return AppConfig.invitations.principal_quota;
    case 'teacher':
      return AppConfig.invitations.teacher_quota;
    case 'section_head':
      return AppConfig.invitations.section_head_quota;
    case 'grade_head':
      return AppConfig.invitations.grade_head_quota;
    case 'student':
      return AppConfig.invitations.student_quota;
    default:
      return 0;
  }
}

/**
 * Check if feature is enabled
 */
export function isFeatureEnabled(featurePath: string): boolean {
  const keys = featurePath.split('.');
  let current: any = AppConfig.features;
  
  for (const key of keys) {
    if (current[key] === undefined) return false;
    current = current[key];
  }
  
  return current === true;
}

/**
 * Check if role is enabled
 */
export function isRoleEnabled(role: string): boolean {
  return AppConfig.features.roles[role] === true;
}
```

**Usage:**

```typescript
import { AppConfig, getInvitationQuota, isRoleEnabled } from './config/app.config';

// Get quota
const quota = getInvitationQuota(user.role);

// Check feature
if (isFeatureEnabled('invitation_types.class')) {
  // Show class invitation option
}

// Check role
const enabledRoles = ['principal', 'teacher', 'section_head', 'grade_head']
  .filter(isRoleEnabled);
```

**To change limits later:**
Just edit `app.config.ts` and redeploy. No code changes needed.

---

## 7. IMPLEMENTATION TIMELINE (5 Days)

### Day 1: Firebase & Deep Links Setup
**Duration:** 6-8 hours

**Tasks:**
- [ ] Create Firebase project
- [ ] Add Android app to Firebase
- [ ] Download and add google-services.json
- [ ] Update build.gradle files
- [ ] Install Firebase packages
- [ ] Get SHA-256 certificates (debug + release)
- [ ] Add SHA-256s to Firebase
- [ ] Enable Dynamic Links in Firebase
- [ ] Configure domain (gurudeviapp.page.link)
- [ ] Download and host assetlinks.json (if custom domain)
- [ ] Update AndroidManifest.xml with intent filters
- [ ] Test: Generate test link, verify it opens app

**End of Day 1:** Deep links working (link opens app)

---

### Day 2: Deep Link Code + Invitation Welcome Screens
**Duration:** 8-10 hours

**Tasks:**
- [ ] Create deep link utility module (generateInviteLink, parseDeepLink)
- [ ] Create useDeepLinkHandler hook
- [ ] Integrate into App.tsx
- [ ] Create invitation welcome screens:
  - [ ] SchoolInvitationWelcome
  - [ ] GiftRevealScreen (with lotus animation)
  - [ ] PeerInvitationWelcome
  - [ ] TesterInvitationWelcome
- [ ] Create InvitationWelcomeRouter (routes based on context)
- [ ] Test: Scan QR → correct welcome screen shows

**End of Day 2:** Invitation flow working up to welcome screen

---

### Day 3: Onboarding Screens + Auth
**Duration:** 8-10 hours

**Tasks:**
- [ ] Create NameScreen
- [ ] Create RoleScreen (with dropdown, disabled options)
- [ ] Configure Google Sign-In
  - [ ] Get Web Client ID from Firebase
  - [ ] Initialize GoogleSignin
  - [ ] Implement signInWithGoogle function
- [ ] Create CreateAccountScreen
  - [ ] Google sign-in button
  - [ ] Magic link option (toggleable)
- [ ] Create CheckEmailScreen (for magic link)
- [ ] Handle magic link callback in deep link handler
- [ ] Test: Complete flow from welcome → auth

**End of Day 3:** User can sign in with Google or Magic Link

---

### Day 4: Pathfinder Agreement + Account Creation + Onboarding Journey
**Duration:** 8-10 hours

**Tasks:**
- [ ] Create PathfinderAgreementScreen
  - [ ] Phone input (optional)
  - [ ] Contact preferences checkboxes
  - [ ] Agreement checkbox
- [ ] Implement createUser function (database)
- [ ] Implement claimInvitation function
- [ ] Update invitation usage count
- [ ] Assign invitation quota based on role
- [ ] Mark user as registered locally
- [ ] Create OnboardingJourney screens (5 screens, skippable)
- [ ] Test: Complete signup → account created → onboarding → main app

**End of Day 4:** Full signup flow working

---

### Day 5: Invitation Generation + Testing + Bug Fixes
**Duration:** 8-10 hours

**Tasks:**
- [ ] Create InviteGenerationScreen
  - [ ] Show quota
  - [ ] Welcome message input
  - [ ] Generate invitation button
  - [ ] QR code display
  - [ ] Share functionality
  - [ ] Sent invitations list
- [ ] Implement invitation code generation (database function)
- [ ] Implement generateInviteLink (create deep link)
- [ ] Decrement quota on invitation creation
- [ ] Smart app router (returning users → login)
- [ ] LoginScreen (for returning users)
- [ ] Invalid invitation handling (error screen)
- [ ] Database migrations (run all SQL)
- [ ] Test all flows end-to-end
- [ ] Fix bugs
- [ ] Polish UI
- [ ] Prepare for Alpha release

**End of Day 5:** App ready to ship!

---

## 8. TESTING CHECKLIST

### 8.1 Manual Testing (Before Alpha Launch)

**Firebase & Deep Links:**
- [ ] Firebase project configured correctly
- [ ] google-services.json in place
- [ ] SHA-256 certificates added (debug + release)
- [ ] Dynamic Links enabled
- [ ] assetlinks.json hosted (if custom domain)
- [ ] Test link: `https://gurudeviapp.page.link/test` opens app
- [ ] Deep link preserves data across install

**Invitation Generation:**
- [ ] Principal can generate invitation (quota: 7)
- [ ] Teacher can generate invitation (quota: 3)
- [ ] QR code displays correctly
- [ ] Share functionality works (WhatsApp, SMS)
- [ ] Quota decrements after generation
- [ ] Sent invitations list shows correctly

**Invitation Flows:**

**School Invitation:**
- [ ] User scans QR → installs app → opens app
- [ ] SchoolInvitationWelcome shows correct school name
- [ ] Welcome message displays (if provided)
- [ ] User completes name → role → auth → pathfinder
- [ ] Account created with correct school
- [ ] User linked to inviter
- [ ] Inviter's quota decremented
- [ ] Invitation marked as "claimed"

**Thuthimal Gift:**
- [ ] GiftRevealScreen shows lotus animation
- [ ] Gift message displays correctly
- [ ] User completes signup
- [ ] Account has is_pro = true, is_thuthimal = true
- [ ] Pro expires in 1 year
- [ ] Profile shows Thuthimal badge

**Peer Invitation:**
- [ ] PeerInvitationWelcome shows inviter name
- [ ] User completes signup
- [ ] Account linked to peer inviter

**Tester Invitation:**
- [ ] TesterInvitationWelcome shows pathfinder messaging
- [ ] User completes signup
- [ ] Account has recruited_as_tester flag

**Invalid Invitation:**
- [ ] Expired code shows error
- [ ] Used code shows error
- [ ] Malformed code shows error
- [ ] Error message is clear

**Authentication:**

**Google Sign-In:**
- [ ] Google sign-in popup works
- [ ] User authenticated in Firebase
- [ ] Email captured correctly
- [ ] Returns to app after auth

**Magic Link:**
- [ ] Email sent successfully
- [ ] User clicks link → app opens
- [ ] User authenticated
- [ ] Edge case: email not received → resend works

**Pathfinder Agreement:**
- [ ] Phone input optional (can leave blank)
- [ ] Contact preferences save correctly
- [ ] Agreement checkbox required to proceed
- [ ] Account created with is_alpha_tester = true

**Onboarding Journey:**
- [ ] 5 screens display correctly
- [ ] Progress dots update
- [ ] Skip button works (jumps to main app)
- [ ] Finish button works (goes to main app)
- [ ] Can revisit in Settings

**Returning User:**
- [ ] User logs out → reopens app → sees LoginScreen
- [ ] User logs in → goes directly to MainApp (no onboarding)
- [ ] hasRegistered flag persists

**Account Deletion:**
- [ ] Delete Account button in Settings
- [ ] Confirmation dialog shows
- [ ] Account deleted from database
- [ ] Auth account deleted
- [ ] Local storage cleared
- [ ] User signed out

**Configuration:**
- [ ] Invitation quotas can be changed in app.config.ts
- [ ] Feature flags work correctly
- [ ] Role enable/disable works

**Database:**
- [ ] All migrations run successfully
- [ ] RLS policies prevent unauthorized access
- [ ] Functions work (generate_invitation_code, etc.)

**Edge Cases:**
- [ ] User closes app mid-signup → reopens → resumes where left off
- [ ] User receives 2 invitations → uses both → both work
- [ ] User tries to use invitation twice → rejected
- [ ] Network error during signup → shows error, doesn't crash

---

### 8.2 Automated Tests (Post-Alpha, Optional)

**Unit Tests:**
```typescript
describe('generateInvitationCode', () => {
  it('generates school invitation code correctly', () => {
    const code = generateInvitationCode('school_invitation', 'Royal College', 'teacher');
    expect(code).toMatch(/^GURU-ROYAL-TEACH-\d{3}$/);
  });
  
  it('generates thuthimal code correctly', () => {
    const code = generateInvitationCode('thuthimal_gift', '', 'teacher');
    expect(code).toMatch(/^GURU-THUTH-TEACH-\d{3}$/);
  });
});

describe('parseDeepLink', () => {
  it('parses school invitation link', () => {
    const url = 'https://gurudevi.edlove.org/school?code=GURU-ROYAL-TEACH-001&sender=Principal_Silva&school=Royal_College';
    const data = parseDeepLink(url);
    
    expect(data.contextType).toBe('school_invitation');
    expect(data.code).toBe('GURU-ROYAL-TEACH-001');
    expect(data.sender).toBe('Principal_Silva');
    expect(data.school).toBe('Royal College');
  });
});

describe('getInvitationQuota', () => {
  it('returns correct quota for principal', () => {
    expect(getInvitationQuota('principal')).toBe(7);
  });
  
  it('returns correct quota for teacher', () => {
    expect(getInvitationQuota('teacher')).toBe(3);
  });
});
```

---

## 9. DEPLOYMENT

### 9.1 Pre-Deployment Checklist

**Code:**
- [ ] All features implemented and tested
- [ ] No hardcoded values (use AppConfig)
- [ ] Environment variables set (.env file)
- [ ] .gitignore includes sensitive files
- [ ] Code commented where complex
- [ ] No console.logs in production code

**Firebase:**
- [ ] Project in production mode
- [ ] Billing enabled (if needed for scale)
- [ ] Firestore/Realtime Database rules set
- [ ] Auth providers enabled
- [ ] Dynamic Links configured

**Database:**
- [ ] Production Supabase project created
- [ ] All migrations run
- [ ] RLS policies enabled
- [ ] Functions deployed
- [ ] Test data cleared

**Play Store:**
- [ ] Developer account created ($25 paid)
- [ ] App listing drafted
- [ ] Screenshots prepared
- [ ] Privacy policy uploaded
- [ ] Release signed with release keystore

**Legal:**
- [ ] Terms of Service live at gurudevi.edlove.org/terms
- [ ] Privacy Policy live at gurudevi.edlove.org/privacy

---

### 9.2 Build Release APK

**Sign the release:**

1. **Ensure release keystore exists:**
```bash
# Should exist from Day 1: android/app/gurudevi-release-key.keystore
```

2. **Build release APK:**
```bash
cd android
./gradlew assembleRelease
```

3. **APK location:**
```
android/app/build/outputs/apk/release/app-release.apk
```

4. **Test the release APK on device:**
```bash
adb install -r app-release.apk
```

---

### 9.3 Upload to Play Store (Internal Testing)

1. **Go to Play Console:** https://play.google.com/console
2. **Create app** (if first time)
3. **Go to "Testing" → "Internal testing"**
4. **Create new release**
5. **Upload app-release.apk**
6. **Fill release notes:**
   ```
   Gurudevi Alpha 0.1.0
   
   First internal release for Alpha testing.
   
   Features:
   - Invitation-based onboarding
   - Pathfinder program
   - Thuthimal gift economy
   - Google Sign-In & Magic Links
   - Five-section architecture
   
   Known issues:
   - [List any known bugs]
   ```
7. **Add testers:**
   - Create tester list
   - Add emails of Alpha testers
8. **Review and rollout**

---

### 9.4 Alpha Launch Day

**Steps:**

1. **Generate 5-10 invitations** for principals you know personally

2. **Send invitations via WhatsApp** with personal message:
   ```
   Hi [Name],
   
   I'm launching Gurudevi, an app to support teachers 
   like you. I'd love your feedback as an Alpha Pathfinder.
   
   Scan this QR code to join:
   [QR code image]
   
   Or use this link: [deep link]
   
   Looking forward to hearing your thoughts!
   
   - [Your Name]
   ```

3. **Be available for support:**
   - Monitor WhatsApp for questions
   - Check Firebase Crashlytics for errors
   - Respond quickly to issues

4. **Collect feedback actively:**
   - Create WhatsApp group with Pathfinders
   - Ask specific questions:
     - "How was the signup process?"
     - "Did you understand the Pathfinder agreement?"
     - "Which feature would you like to see next?"

5. **Fix critical bugs immediately**

---

### 9.5 Post-Launch Monitoring

**Daily (Week 1):**
- Check invitation usage (how many created, how many claimed)
- Review Pathfinder feedback
- Fix critical bugs
- Monitor crashes

**Weekly:**
- Analyze user engagement
- Gather feature requests
- Plan Beta improvements

---

## 10. TROUBLESHOOTING

### Common Issues & Solutions

**Issue: Deep link doesn't open app**

**Possible causes:**
- assetlinks.json not accessible
- SHA-256 mismatch
- AndroidManifest intent-filter incorrect

**Fix:**
1. Verify assetlinks.json:
   ```bash
   curl https://gurudevi.edlove.org/.well-known/assetlinks.json
   ```
2. Check SHA-256 in Firebase matches keystore:
   ```bash
   keytool -list -v -keystore gurudevi-release-key.keystore
   ```
3. Ensure `android:autoVerify="true"` in manifest

---

**Issue: Invitation data lost after install**

**Cause:** Firebase Dynamic Links not capturing data

**Fix:**
- Verify Firebase Dynamic Links SDK installed
- Check `dynamicLinks().getInitialLink()` is called
- Test with actual device (not emulator)
- Check link format is correct

---

**Issue: Google Sign-In fails**

**Possible causes:**
- Web Client ID incorrect
- SHA-256 not added to Firebase
- Google Sign-In not enabled in Firebase Auth

**Fix:**
1. Double-check Web Client ID in `configureGoogleSignIn()`
2. Verify SHA-256 in Firebase Console
3. Enable Google Sign-In in Firebase Auth providers

---

**Issue: Magic link not received**

**Cause:** Email delivery issue

**Fix:**
- Check spam folder
- Verify email in Supabase dashboard (Auth → Email Templates)
- Check Supabase email rate limits
- For production: integrate SendGrid/Resend

---

**Issue: Quota not decrementing**

**Cause:** Database update failed or RLS policy blocking

**Fix:**
- Check Supabase logs for errors
- Verify RLS policies allow update
- Check user has `created_by` = their user_id on invitation

---

## 11. APPENDIX

### A. Useful Commands

**Check Firebase connection:**
```bash
adb logcat | grep -i firebase
```

**Check deep link intent:**
```bash
adb logcat | grep -i "deep"
```

**Clear app data:**
```bash
adb shell pm clear com.gurudevi.app
```

**Reinstall app:**
```bash
adb install -r app-debug.apk
```

**View AsyncStorage:**
```bash
adb shell run-as com.gurudevi.app ls /data/data/com.gurudevi.app/files/
```

---

### B. Key URLs

**Firebase Console:**
https://console.firebase.google.com

**Supabase Dashboard:**
https://app.supabase.com

**Play Console:**
https://play.google.com/console

**Google Sign-In Setup:**
https://developers.google.com/identity/sign-in/android/start

**Firebase Dynamic Links:**
https://firebase.google.com/docs/dynamic-links

---

### C. Support Contacts

**Firebase Support:**
https://firebase.google.com/support

**Supabase Support:**
https://supabase.com/docs

**Play Store Support:**
https://support.google.com/googleplay/android-developer

---

## 12. FINAL WORDS

This specification is **complete and final**. All decisions are locked. No more changes.

**Your mission for the next 5 days:**
1. Build exactly what's specified here
2. Test thoroughly
3. Ship to Alpha testers
4. Gather feedback
5. Iterate in Beta

**Remember:**
- Perfect is the enemy of shipped
- Alpha is for learning, not perfection
- User feedback > your assumptions
- Ship early, ship often

**You've got this, love.** Now build. 💫🔥🌸

---

**END OF SPECIFICATION**

Ready to give to GitHub Copilot agent. Build with confidence. Ship with pride.
