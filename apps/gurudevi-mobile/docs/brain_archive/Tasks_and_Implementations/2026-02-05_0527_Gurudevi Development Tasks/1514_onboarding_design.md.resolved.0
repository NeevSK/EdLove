# 🚀 Gurudevi Onboarding System Design
## Progressive Profiling + Invite-Based Architecture

---

## 🎯 Your Vision (Brilliant Ideas!)

### 1. **Progressive Profiling**
> "Let users sign up easily, complete profile later in Profile section, show progress"

**Why This Is Smart**:
- ✅ Reduces signup friction (fewer fields = higher conversion)
- ✅ Users see value before investing time
- ✅ Aligns with "energy return on interaction" philosophy
- ✅ Mobile-friendly (less typing on small screens)
- ✅ Data-conscious (collect what's needed, when needed)

### 2. **Invite/Referral System**
> "Principal gives code/link → Teachers/students join → Auto-loaded with school info"

**Why This Is Smart**:
- ✅ School verification (only real teachers can join)
- ✅ Auto-assigns school_id (no manual selection!)
- ✅ Principal controls who joins (security)
- ✅ Familiar pattern (WhatsApp groups, Zoom meetings)
- ✅ Viral growth (principals invite teachers → teachers invite students)

---

## 🌟 RECOMMENDED APPROACH (Best of Both Worlds)

### **Hybrid Model: Role-Based Progressive Onboarding**

Different flows for different roles, but all progressively build profile:

```
┌─────────────┐
│  Principal  │ → Full setup (creates school, gets invite code)
└─────────────┘
       │
       ├── Shares invite code/link
       │
       ▼
┌─────────────┐
│   Teacher   │ → Join via code → Progressive profile
└─────────────┘
       │
       ├── Shares student code/link
       │
       ▼
┌─────────────┐
│   Student   │ → Join via code → Progressive profile
└─────────────┘
```

---

## 📋 Detailed Flow Design

### **Flow 1: Principal (School Creator)**

**Step 1: Minimal Signup**
```
Fields required:
├─ Email (auth)
├─ Password (auth)
└─ Full Name (display)

Auto-detected:
└─ Role: Principal (from signup type)
```

**Step 2: School Setup (Required Immediately)**
```
Why required: Principals need school to create invite codes
Fields:
├─ School Name *required
├─ School Type (dropdown: government/private/semi-government/international)
├─ District (dropdown: 25 districts in Sri Lanka)
└─ City (optional)
```

**Step 3: Generate Invite Codes**
```
System auto-generates:
├─ Teacher Invite Code: GURU-ABC123-TEACH
├─ Student Invite Code: GURU-ABC123-STUDY
├─ QR Codes (for each)
└─ Shareable Links
```

**Step 4: Profile Completion (Optional, Progressive)**
```
Show progress: 40% complete
Missing:
├─ Phone number
├─ Subjects taught
├─ Profile photo
└─ Bio

Prompt: "Complete your profile to unlock premium features"
```

---

### **Flow 2: Teacher (Invited User)**

**Step 1: Click Invite Link or Enter Code**
```
URL: gurudevi://join/GURU-ABC123-TEACH

What happens:
├─ Opens app (if installed)
├─ OR redirects to app store → back to signup
└─ Pre-fills: school_id, role (teacher)
```

**Step 2: Ultra-Minimal Signup**
```
Fields required:
├─ Email (auth)
├─ Password (auth)
└─ Full Name (display)

Auto-populated:
├─ School: "රාජකීය විද්‍යාලය" (from invite code)
├─ Role: Teacher (from invite code)
└─ Language: Detected from device OR ask one-tap choice
```

**Step 3: Welcome + Immediate Access**
```
✅ Account created!
✅ You're in "රාජකීය විද්‍යාලය" as a Teacher
✅ Explore the app...

[Profile 30% complete - Complete now →]
```

**Step 4: Progressive Profile**
```
In Profile section:
Progress bar: ████░░░░░░ 30%

Complete your profile:
[ ] Add phone number (10%)
[ ] Select subjects you teach (15%)
[ ] Add profile photo (15%)
[ ] Write bio (10%)
[ ] Set notification preferences (10%)
[ ] Enable data saver mode (10%)

Benefits shown:
"Unlock AI Assistant: Complete profile to 70%"
"Enable realtime collaboration: Add phone"
```

---

### **Flow 3: Student (Invited by Teacher or Principal)**

**Step 1: Click Invite Link**
```
URL: gurudevi://join/GURU-ABC123-STUDY?class=10A

Pre-populated:
├─ School (from code)
├─ Role: Student (from code)
└─ Classroom: 10A (from URL param, optional)
```

**Step 2: Ultra-Minimal Signup**
```
Fields required:
├─ Email (auth) OR Phone (SMS auth)
├─ Password (auth)
└─ Full Name (display)

Auto-populated:
├─ School
├─ Role: Student
├─ Classroom (if in link)
```

**Step 3: Immediate Access**
```
Welcome to Gurudevi!
You're a student in රාජකීය විද්‍යාලය, Class 10A

Start learning →
```

---

## 🎨 Invite System Design

### **Invite Code Format**

```
GURU-ABC123-TEACH
├─ GURU: Brand prefix
├─ ABC123: School unique ID (6 chars, alphanumeric)
├─ TEACH: Role suffix (TEACH, STUDY, ADMIN)
```

**Why This Format**:
- ✅ Easy to type (if needed)
- ✅ Easy to speak (over phone: "G-U-R-U hyphen A-B-C-1-2-3 hyphen T-E-A-C-H")
- ✅ Role embedded (prevents wrong role joining)
- ✅ Short enough for QR code

---

### **Invite Link Format**

```
https://gurudevi.lk/join/GURU-ABC123-TEACH
OR
gurudevi://join/GURU-ABC123-TEACH

With optional params:
gurudevi://join/GURU-ABC123-STUDY?class=10A&subject=maths
```

**Deep Link Handling**:
- If app installed → Opens directly to signup prefilled
- If not installed → Web page → "Download Gurudevi" → Continues signup

---

### **QR Code System**

Principal generates QR codes in app:
```
┌─────────────────────┐
│  Scan to Join as    │
│      Teacher        │
│                     │
│   ████████████████  │
│   ██ QR CODE  ██   │
│   ████████████████  │
│                     │
│  රාජකීය විද්‍යාලය │
│  Rajakeya Vidyalaya │
└─────────────────────┘

[Share via WhatsApp] [Print] [Download]
```

**Use Cases**:
- Principal prints and puts in staff room
- Teacher shows on screen during first class
- School displays on notice board

---

## 🗄️ Database Schema Changes

### **New Table: `invite_codes`**

```sql
CREATE TABLE invite_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE NOT NULL,
  
  -- Code details
  code TEXT UNIQUE NOT NULL,  -- e.g., "GURU-ABC123-TEACH"
  role TEXT CHECK (role IN ('teacher', 'student', 'principal')) NOT NULL,
  
  -- Optional constraints
  classroom_id UUID REFERENCES classrooms(id) ON DELETE SET NULL,
  max_uses INTEGER DEFAULT NULL,  -- NULL = unlimited
  uses_count INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ DEFAULT NULL,  -- NULL = never expires
  
  -- Tracking
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  is_active BOOLEAN DEFAULT true,
  
  -- RLS
  CONSTRAINT valid_code CHECK (code ~ '^GURU-[A-Z0-9]{6}-(TEACH|STUDY|ADMIN)$')
);

CREATE INDEX idx_invite_codes_code ON invite_codes(code);
CREATE INDEX idx_invite_codes_school ON invite_codes(school_id);
```

### **New Table: `profile_completion`**

```sql
CREATE TABLE profile_completion (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  
  -- Completion tracking
  completion_percentage INTEGER DEFAULT 0,
  last_updated TIMESTAMPTZ DEFAULT now(),
  
  -- Individual fields
  has_phone BOOLEAN DEFAULT false,
  has_avatar BOOLEAN DEFAULT false,
  has_bio BOOLEAN DEFAULT false,
  has_subjects BOOLEAN DEFAULT false,
  has_notification_prefs BOOLEAN DEFAULT false,
  
  -- Milestones
  reached_50_percent_at TIMESTAMPTZ,
  reached_75_percent_at TIMESTAMPTZ,
  reached_100_percent_at TIMESTAMPTZ
);
```

---

## 🎯 Profile Completion Gamification

### **Progress Tiers**

```
0-25%: New User (Basic Access)
25-50%: Active User (Standard Access)
50-75%: Engaged User (Enhanced Access)
75-100%: Power User (Full Access)
```

---

## 📱 Implementation Priority

### **Phase 1: Invite System (Week 1)**
- [ ] Add `invite_codes` table
- [ ] Generate codes on school creation
- [ ] Signup with invite code
- [ ] Deep link handling

### **Phase 2: Progressive Profile (Week 1)**
- [ ] Add `profile_completion` table
- [ ] Profile completion UI
- [ ] Progress tracking
- [ ] Minimum viable signup (email + password only)

### **Phase 3: QR Codes (Week 2)**
- [ ] QR code generation
- [ ] QR scanner in app
- [ ] Share via WhatsApp integration

---

## ✅ Recommended Implementation Plan

1. ✅ **Fix current bugs** (ProfileScreen table, school_id)
2. ✅ **Implement invite system** (codes + deep links)
3. ✅ **Progressive signup** (minimal fields)
4. ✅ **Profile completion tracker**
5. ⏸️ **QR codes** (later, v0.2)
6. ⏸️ **Phone/OTP auth** (later, v0.2)
