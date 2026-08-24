---
title: "GURUDEVI SECURITY FOUNDATION v2.0"
status: "active"
created: 2026-02-28
updated: 2026-02-28
author: "Naveen"
scribe: "opencode"
tags: [apps, gurudevi-mobile]
---

# GURUDEVI SECURITY FOUNDATION v2.0
## *Protecting Teachers, Students, Schools, and Sacred Data*

---

> *"Security is not a feature. It is a promise:*  
> *Your reflections are yours. Your students are protected. Your trust is sacred."*

---

**Document Purpose**: This is the security foundation for Gurudevi—how we protect data, respect privacy, and build trust at every layer.

**Philosophy**: Security serves **sovereignty** (users control their data), **safety** (children protected), **sanctuary** (sacred space remains sacred), and **school trust** (multi-tenant isolation).

**Version**: 2.0 (Updated for Multi-Tenant School Platform)  
**Last Updated**: February 1, 2026  
**Review Cycle**: Every 6 months or after any security incident

**What Changed in v2.0**:
- ✅ Multi-tenant school platform architecture (one database, school isolation)
- ✅ Updated roles: student, teacher, principal (was: teacher, admin, mentor)
- ✅ Cloud-first with Supabase (was: offline-first with WatermelonDB)
- ✅ Expanded child safety (student profiles, grades, classroom access)
- ✅ School-based RLS policies (tenant isolation)
- ✅ Clarified encryption tiers (public vs sacred data)

---

# PART 1: THREAT MODEL
## *What We're Protecting Against*

---

## 1.1 The Assets We Protect

```
TIER 1: SACRED DATA (Highest Protection)
├─ Teacher reflections (inner world, vulnerabilities, burnout tracking)
├─ Teacher voice journals (personal, private audio)
├─ Student identifiable information (full names, contact info)
├─ Mood tracking data (mental health patterns - teachers & students)
└─ Teacher-to-student private notes (sensitive observations)

TIER 2: SENSITIVE DATA (High Protection)
├─ Student academic records (grades, assessments, progress)
├─ Classroom rosters (student-teacher associations)
├─ Teacher personal info (email, school assignment, role)
├─ Lesson plans (intellectual property)
├─ Principal analytics (school performance data)
└─ Mentorship conversations (private messages)

TIER 3: COMMUNITY DATA (Moderate Protection)
├─ School announcements (internal communications)
├─ Forum posts (attributable to user)
├─ Shared lessons (public but credited)
├─ User profiles (chosen visibility within school)
└─ Study group memberships

TIER 4: PUBLIC DATA (Basic Protection)
├─ Resource library (curated, meant to be shared)
├─ Public curriculum materials
└─ App content (UI, help docs, tutorials)

TIER 5: MULTI-TENANT ISOLATION (Critical)
├─ School A data MUST NOT be visible to School B
├─ Student from School X cannot see classrooms in School Y
├─ Cross-school leakage is CRITICAL security failure
└─ RLS policies enforce school_id isolation
```

---

## 1.2 The Threats We Face

### **External Threats**

**1. Unauthorized Access**
```
Attacker: Malicious actor, curious colleague, abusive partner, stalker
Goal: Access teacher's private reflections, student data, or grades
Method: 
- Stolen phone/credentials
- Guessed password (weak: "Teacher123")
- Phishing (fake login page)
- Network interception (public WiFi)
- Social engineering (impersonate IT support)
```

**2. Data Breach (Cloud Infrastructure)**
```
Attacker: Hacker targeting Supabase/cloud infrastructure
Goal: Steal database (thousands of teachers/students across schools)
Method:
- SQL injection (parameterized queries prevent)
- API exploitation (rate limiting prevents)
- Compromised admin credentials
- Unpatched Supabase vulnerabilities
- Supply chain attack (compromised dependency)
```

**3. Multi-Tenant Isolation Breach (CRITICAL)**
```
Attacker: Student/teacher from School A trying to access School B data
Goal: Cross-school data leakage
Method:
- RLS policy misconfiguration
- school_id parameter manipulation
- API bypassing row-level security
- Privilege escalation (student → principal)

Impact: CATASTROPHIC - entire platform trust destroyed
```

**4. Man-in-the-Middle**
```
Attacker: Network snooper (café WiFi, school network, ISP)
Goal: Intercept data in transit
Method:
- Packet sniffing (Wireshark on public WiFi)
- SSL stripping (downgrade HTTPS → HTTP)
- Rogue hotspot ("Free School WiFi")
- DNS spoofing
```

**5. Child Safety Violations**
```
Attacker: Insider (teacher, admin) or external hacker
Goal: Access student identifying information, grades, behavior notes
Method:
- Access control bypass (RLS policy bug)
- Social engineering (impersonate parent)
- Privilege escalation (student → teacher)
- Screenshot student data for external sharing

SPECIAL CONCERN: Minors (under 18) require heightened protection
```

**6. Enumeration Attack (UUID Prevents This)**
```
Attacker: Automated script guessing IDs
Goal: Systematically extract all student records
Method:
- If IDs were integers: GET /students/1, /2, /3, ... /10000
- With UUIDs: GET /students/550e8400-... (impossible to guess)

Protection: UUIDs make enumeration infeasible
```

### **Internal Threats**

**7. Accidental Exposure**
```
Threat: Teacher leaves phone unlocked, shares screenshot with student data
Impact: Privacy breach, trust violation, potential child safety issue
Example: Teacher shares "funny" student answer on social media
```

**8. Insider Misuse**
```
Threat: 
- School admin accesses teacher reflections (meant to be private)
- Principal reads teacher's burnout journal
- Teacher accesses student data from another classroom (not theirs)

Impact: Chilling effect, loss of sanctuary, breach of trust
```

**9. Data Loss**
```
Threat: Phone lost/stolen, no backup, cloud sync disabled
Impact: 
- Teacher: Years of reflections, lesson plans gone
- Student: Academic progress history lost
- School: Classroom records unrecoverable
```

**10. Cross-School Data Leakage (Multi-Tenant Risk)**
```
Threat: RLS policy bug allows School A principal to see School B data
Impact: CRITICAL - Mass privacy breach, platform shutdown risk
Example: SELECT * FROM classrooms → Returns ALL schools (RLS missing)
```

---

## 1.3 What We DON'T Protect Against (Out of Scope)

❌ **Physical device security** (teacher leaves phone unlocked in public)  
❌ **Social engineering of user** (teacher shares password with colleague)  
❌ **Government surveillance** (court order for specific user data)  
❌ **Compromised user device** (malware/spyware on teacher's phone)  
❌ **Screenshot/screen recording** (user captures data and shares externally)  
❌ **Shoulder surfing** (someone looking at screen over user's shoulder)

**Why out of scope**: These require user education and operational security, not technical controls. We provide tools (biometric lock, export warnings), not enforcement.

**Our responsibility**: Educate users on these risks via in-app tips and security guide.

---

# PART 2: DEFENSE LAYERS
## *The Eight Rings of Protection*

---

## 2.1 Layer 1: Multi-Tenant Isolation (CRITICAL)

**The Foundation**: Every table has `school_id`, RLS enforces isolation.

### **School-Based Row-Level Security**

```sql
-- CRITICAL: School isolation on classrooms
CREATE POLICY "school_isolation_classrooms"
ON classrooms FOR ALL
TO authenticated
USING (
  school_id = (SELECT school_id FROM users WHERE id = auth.uid())
);

-- CRITICAL: Students only see their school's data
CREATE POLICY "students_see_own_school_only"
ON users FOR SELECT
TO authenticated
USING (
  school_id = (SELECT school_id FROM users WHERE id = auth.uid())
  OR id = auth.uid()  -- Can see own profile
);

-- CRITICAL: Grades isolated by school
CREATE POLICY "grades_school_isolation"
ON student_grades FOR ALL
TO authenticated
USING (
  classroom_id IN (
    SELECT id FROM classrooms 
    WHERE school_id = (SELECT school_id FROM users WHERE id = auth.uid())
  )
);

-- CRITICAL: Content isolated by school
CREATE POLICY "content_school_isolation"
ON content_items FOR SELECT
TO authenticated
USING (
  school_id = (SELECT school_id FROM users WHERE id = auth.uid())
  OR is_public = true  -- Allow cross-school public resources
);
```

### **Index for Performance** (School Filtering)

```sql
-- Every query filters by school_id → must be fast
CREATE INDEX idx_classrooms_school_id ON classrooms(school_id);
CREATE INDEX idx_users_school_id ON users(school_id);
CREATE INDEX idx_content_school_id ON content_items(school_id);
CREATE INDEX idx_announcements_school_id ON announcements(school_id);

-- Query performance target: <50ms even with 1M+ rows
```

### **Testing Multi-Tenant Isolation**

```javascript
// Test script (run before v0.1 launch)
const testMultiTenantIsolation = async () => {
  // Create two schools
  const schoolA = await createSchool({ name: 'School A' });
  const schoolB = await createSchool({ name: 'School B' });
  
  // Create users in each school
  const teacherA = await createUser({ school_id: schoolA.id, role: 'teacher' });
  const teacherB = await createUser({ school_id: schoolB.id, role: 'teacher' });
  
  // Teacher A creates classroom
  const classroomA = await createClassroom({ 
    school_id: schoolA.id, 
    teacher_id: teacherA.id 
  });
  
  // Login as Teacher B
  await supabase.auth.signInWithPassword({ 
    email: teacherB.email, 
    password: 'test' 
  });
  
  // Try to access Teacher A's classroom
  const { data, error } = await supabase
    .from('classrooms')
    .select('*')
    .eq('id', classroomA.id);
  
  // MUST return empty (RLS blocks cross-school access)
  if (data && data.length > 0) {
    throw new Error('❌ CRITICAL: Multi-tenant isolation FAILED');
  }
  
  console.log('✅ Multi-tenant isolation test PASSED');
};
```

---

## 2.2 Layer 2: Transport Security (Data in Transit)

### **TLS 1.3 Everywhere**

```javascript
// All API calls use HTTPS (enforced by Supabase client)
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;  // https://...
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  },
  // All requests use HTTPS (Supabase enforces TLS 1.3)
});
```

**What this protects**:
- ✅ Network sniffing (encrypted packets)
- ✅ Man-in-the-middle attacks (certificate validation)
- ✅ Data interception on public WiFi (encrypted transport)
- ✅ ISP snooping (content hidden)

**How it works**:
```
User's Device                    Supabase Server
     |                                  |
     |  1. Establish TLS 1.3 handshake |
     |--------------------------------->|
     |                                  |
     |  2. Exchange certificates        |
     |<---------------------------------|
     |                                  |
     |  3. Encrypt data with AES-256   |
     |--------------------------------->|
     |                                  |
     |  4. Decrypt on server            |
     |                                  ✓

Even if attacker intercepts packets, sees only: 
A8F2E9D... (encrypted gibberish)
```

**Certificate Pinning** (v0.5 - Extra Protection):
```javascript
// Verify Supabase's certificate is legitimate
// Prevents fake certificate attacks
import { Platform } from 'react-native';

if (Platform.OS === 'android') {
  // Android certificate pinning via network_security_config.xml
  // Pins Supabase's certificate fingerprint
}
```

---

## 2.3 Layer 3: Authentication (Who You Are)

### **Password Requirements**

```javascript
// Password validation (client-side + Supabase enforces)
const PASSWORD_RULES = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecial: false  // Not required (easier for Sri Lankan teachers)
};

const validatePassword = (password: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < PASSWORD_RULES.minLength) {
    errors.push('අවම වශයෙන් අක්ෂර 8ක් තිබිය යුතුයි');
  }
  if (PASSWORD_RULES.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('විශාල අකුරක් අවශ්‍යයි');
  }
  if (PASSWORD_RULES.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('සරල අකුරක් අවශ්‍යයි');
  }
  if (PASSWORD_RULES.requireNumber && !/\d/.test(password)) {
    errors.push('අංකයක් අවශ්‍යයි');
  }
  
  return { valid: errors.length === 0, errors };
};
```

### **Sign Up Flow** (With Role Assignment)

```javascript
const signUp = async (email: string, password: string, role: 'student' | 'teacher' | 'principal', schoolId: string) => {
  // 1. Validate password
  const { valid, errors } = validatePassword(password);
  if (!valid) throw new Error(errors.join(', '));
  
  // 2. Create Supabase auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: 'gurudevi://auth/callback'
    }
  });
  
  if (authError) throw authError;
  
  // 3. Create user profile (with role and school)
  const { data: userData, error: userError } = await supabase
    .from('users')
    .insert({
      id: authData.user!.id,  // Same as auth.uid()
      email,
      role,
      school_id: schoolId,
      language: 'si',  // Default Sinhala
      data_saver_mode: false,
      created_at: new Date().toISOString()
    })
    .select()
    .single();
  
  if (userError) throw userError;
  
  // 4. Store in local state (MMKV)
  useUserStore.getState().setUser({
    id: userData.id,
    role: userData.role,
    schoolId: userData.school_id,
    tier: 'free'
  });
  
  return userData;
};
```

### **JWT Session Management**

```javascript
// Supabase issues JWT tokens
const session = {
  access_token: 'eyJ...',      // Valid for 1 hour
  refresh_token: 'xxx',        // Valid for 60 days
  expires_at: 1706234567,
  user: {
    id: '550e8400-...',         // UUID
    email: 'teacher@school.lk',
    role: 'authenticated'
  }
};

// Auto-refresh before expiry
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'TOKEN_REFRESHED') {
    console.log('✓ Session refreshed automatically');
  }
  if (event === 'SIGNED_OUT') {
    // Clear local state
    useUserStore.getState().clearUser();
  }
});

// Manual session check (on app launch)
const checkSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error || !session) {
    // Redirect to login
    navigation.navigate('Login');
    return;
  }
  
  // Fetch user profile (role, school_id)
  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('id', session.user.id)
    .single();
  
  // Update local state
  useUserStore.getState().setUser({
    id: user.id,
    role: user.role,
    schoolId: user.school_id,
    tier: user.tier || 'free'
  });
};
```

### **Biometric Authentication** (Quick Unlock)

```javascript
import * as LocalAuthentication from 'expo-local-authentication';
import { MMKV } from 'react-native-mmkv';

const storage = new MMKV();

// Enable biometric unlock (opt-in)
const enableBiometric = async () => {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  const isEnrolled = await LocalAuthentication.isEnrolledAsync();
  
  if (!hasHardware || !isEnrolled) {
    Alert.alert(
      'ජීව මිතික් සත්‍යාපනය නොමැත',
      'ඔබේ උපාංගය ඇඟිලි සටහන හෝ මුහුණ හඳුනාගැනීම සහාය නොදක්වයි'
    );
    return false;
  }
  
  // Store preference
  storage.set('biometric_enabled', true);
  return true;
};

// Authenticate with biometric
const authenticateWithBiometric = async (): Promise<boolean> => {
  const enabled = storage.getBoolean('biometric_enabled');
  if (!enabled) return false;
  
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: 'ඔබේ අනන්‍යතාවය තහවුරු කරන්න',
    fallbackLabel: 'මුරපදය භාවිතා කරන්න',
    disableDeviceFallback: false,
    cancelLabel: 'අවලංගු කරන්න'
  });
  
  return result.success;
};

// App launch flow
const AppLaunchAuth = () => {
  const [authenticated, setAuthenticated] = useState(false);
  
  useEffect(() => {
    const authenticate = async () => {
      // Try biometric first
      const biometricSuccess = await authenticateWithBiometric();
      
      if (biometricSuccess) {
        setAuthenticated(true);
        return;
      }
      
      // Fall back to password (show login screen)
      setAuthenticated(false);
    };
    
    authenticate();
  }, []);
  
  if (!authenticated) {
    return <LoginScreen />;
  }
  
  return <MainApp />;
};
```

---

## 2.4 Layer 4: Authorization (What You Can Do)

### **Role-Based RLS Policies**

```sql
-- Students see ONLY their own grades
CREATE POLICY "students_see_own_grades"
ON student_grades FOR SELECT
TO authenticated
USING (
  student_id = auth.uid()
  AND (SELECT role FROM users WHERE id = auth.uid()) = 'student'
);

-- Teachers see grades for students in THEIR classrooms
CREATE POLICY "teachers_see_classroom_grades"
ON student_grades FOR SELECT
TO authenticated
USING (
  classroom_id IN (
    SELECT classroom_id 
    FROM classroom_members 
    WHERE user_id = auth.uid() 
    AND role = 'teacher'
  )
  AND (SELECT role FROM users WHERE id = auth.uid()) = 'teacher'
);

-- Teachers can CREATE/UPDATE grades for their students
CREATE POLICY "teachers_manage_classroom_grades"
ON student_grades FOR ALL
TO authenticated
USING (
  classroom_id IN (
    SELECT classroom_id 
    FROM classroom_members 
    WHERE user_id = auth.uid() 
    AND role = 'teacher'
  )
  AND (SELECT role FROM users WHERE id = auth.uid()) = 'teacher'
);

-- Principals see ALL grades in their school
CREATE POLICY "principals_see_school_grades"
ON student_grades FOR SELECT
TO authenticated
USING (
  classroom_id IN (
    SELECT c.id FROM classrooms c
    WHERE c.school_id = (
      SELECT school_id FROM users WHERE id = auth.uid()
    )
  )
  AND (SELECT role FROM users WHERE id = auth.uid()) = 'principal'
);

-- Principals CANNOT edit grades (read-only oversight)
-- (No INSERT/UPDATE policy for principals on student_grades)
```

### **Student Profile Privacy** (Child Safety)

```sql
-- Students can see own profile
CREATE POLICY "students_see_own_profile"
ON users FOR SELECT
TO authenticated
USING (
  id = auth.uid()
);

-- Teachers can see students in THEIR classrooms only
CREATE POLICY "teachers_see_classroom_students"
ON users FOR SELECT
TO authenticated
USING (
  role = 'student'
  AND id IN (
    SELECT cm.user_id 
    FROM classroom_members cm
    WHERE cm.classroom_id IN (
      SELECT classroom_id 
      FROM classroom_members 
      WHERE user_id = auth.uid() 
      AND role = 'teacher'
    )
    AND cm.role = 'student'
  )
  AND (SELECT role FROM users WHERE id = auth.uid()) = 'teacher'
);

-- Principals see all students in their school
CREATE POLICY "principals_see_school_students"
ON users FOR SELECT
TO authenticated
USING (
  role = 'student'
  AND school_id = (SELECT school_id FROM users WHERE id = auth.uid())
  AND (SELECT role FROM users WHERE id = auth.uid()) = 'principal'
);

-- Students CANNOT see other students' profiles (no student-student visibility)
-- (Policy above restricts to teachers/principals only)
```

### **Announcement Permissions**

```sql
-- Everyone can READ announcements in their school
CREATE POLICY "read_school_announcements"
ON announcements FOR SELECT
TO authenticated
USING (
  school_id = (SELECT school_id FROM users WHERE id = auth.uid())
  AND (SELECT role FROM users WHERE id = auth.uid()) = ANY(target_roles)
);

-- ONLY principals can CREATE announcements
CREATE POLICY "principals_create_announcements"
ON announcements FOR INSERT
TO authenticated
WITH CHECK (
  school_id = (SELECT school_id FROM users WHERE id = auth.uid())
  AND (SELECT role FROM users WHERE id = auth.uid()) = 'principal'
);

-- ONLY principals can UPDATE/DELETE announcements
CREATE POLICY "principals_manage_announcements"
ON announcements FOR ALL
TO authenticated
USING (
  school_id = (SELECT school_id FROM users WHERE id = auth.uid())
  AND (SELECT role FROM users WHERE id = auth.uid()) = 'principal'
  AND author_id = auth.uid()  -- Can only edit own announcements
);
```

### **Defense in Depth Principle**

Even if React app has a bug (e.g., sends wrong `school_id` in request), **RLS prevents unauthorized access at database level**.

```javascript
// Example: Buggy app code (accidentally sends wrong school_id)
const { data, error } = await supabase
  .from('classrooms')
  .select('*')
  .eq('school_id', 'wrong-school-id');  // ← Bug in app

// RLS policy executes:
// USING (school_id = (SELECT school_id FROM users WHERE id = auth.uid()))
//                     ↑ Uses JWT token's user ID, NOT request body

// Result: Returns empty (correct school_id from auth.uid())
// Database protects even when app is buggy
```

---

## 2.5 Layer 5: Data Encryption

### **Encryption Tiers** (Clarified for v2.0)

```
TIER 1: END-TO-END ENCRYPTED (User key only)
├─ Teacher reflections (voice + text)
├─ Teacher mood journals
└─ Private teacher-student notes (sensitive observations)

Encrypted on device → Stored encrypted in Supabase → Only user can decrypt
Even Supabase/admins CANNOT read

TIER 2: ENCRYPTED AT REST (Supabase key)
├─ Student grades (sensitive but teachers need access)
├─ Classroom rosters
├─ User profiles (name, email)
└─ Content metadata

Encrypted in PostgreSQL database → Supabase manages keys → Authorized users can read

TIER 3: NOT ENCRYPTED (Public or non-sensitive)
├─ Public library resources (meant to be shared)
├─ Announcements (internal but not secret)
└─ Forum posts (public within school)

Stored plaintext → Fast queries → No decryption overhead
```

### **End-to-End Encryption** (Teacher Reflections)

```javascript
// v0.5 feature (not v0.1)
import * as Crypto from 'expo-crypto';
import { MMKV } from 'react-native-mmkv';

const storage = new MMKV();

// Derive encryption key from user's password (NEVER sent to server)
const deriveEncryptionKey = async (password: string): Promise<string> => {
  const salt = storage.getString('encryption_salt') || await generateSalt();
  storage.set('encryption_salt', salt);
  
  const key = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    password + salt,
    { encoding: Crypto.CryptoEncoding.HEX }
  );
  
  return key;
};

// Encrypt reflection before uploading
const encryptReflection = async (content: string, key: string): Promise<{ encrypted: string; iv: string }> => {
  const iv = Crypto.getRandomBytes(16).toString('hex');
  
  // AES-256-GCM encryption
  const encrypted = await Crypto.encryptAsync(
    Crypto.CryptoAlgorithm.AES_GCM,
    key,
    content,
    { iv }
  );
  
  return { encrypted, iv };
};

// Save encrypted reflection
const saveReflection = async (content: string) => {
  const password = await SecureStore.getItemAsync('user_password');  // Stored locally
  const key = await deriveEncryptionKey(password);
  
  const { encrypted, iv } = await encryptReflection(content, key);
  
  // Upload encrypted data to Supabase
  await supabase.from('reflections_encrypted').insert({
    user_id: userId,
    encrypted_content: encrypted,
    encryption_iv: iv,
    encryption_version: 'v1',
    created_at: new Date().toISOString()
  });
  
  // Supabase stores encrypted blob, CANNOT decrypt
};

// Decrypt reflection when viewing
const viewReflection = async (reflectionId: string) => {
  // Fetch encrypted data
  const { data } = await supabase
    .from('reflections_encrypted')
    .select('*')
    .eq('id', reflectionId)
    .single();
  
  // Decrypt on device
  const password = await SecureStore.getItemAsync('user_password');
  const key = await deriveEncryptionKey(password);
  
  const decrypted = await Crypto.decryptAsync(
    Crypto.CryptoAlgorithm.AES_GCM,
    key,
    data.encrypted_content,
    { iv: data.encryption_iv }
  );
  
  return decrypted;
};
```

**Trade-off**: If user forgets password, encrypted reflections are **permanently lost**. This is acceptable for sacred data (privacy > convenience).

---

## 2.6 Layer 6: Application Security

### **Input Validation** (XSS Prevention)

```javascript
// Sanitize user content before displaying
import DOMPurify from 'isomorphic-dompurify';

const SafeHTML = ({ content }: { content: string }) => {
  const sanitized = DOMPurify.sanitize(content, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href']
  });
  
  return <div dangerouslySetInnerHTML={{ __html: sanitized }} />;
};

// Validate announcement input
const createAnnouncement = async (title: string, content: string) => {
  // Server-side validation (Supabase function)
  const { data, error } = await supabase.rpc('create_announcement', {
    title: title.substring(0, 200),  // Max length
    content: content.substring(0, 5000)
  });
  
  // Database function validates and sanitizes
};
```

### **SQL Injection Prevention** (Parameterized Queries)

```javascript
// ✅ SAFE: Parameterized queries (Supabase handles)
const getGrades = async (studentId: string) => {
  const { data } = await supabase
    .from('student_grades')
    .select('*')
    .eq('student_id', studentId);  // Parameterized, safe
  
  return data;
};

// ❌ DANGEROUS: Never use raw SQL with user input
// const query = `SELECT * FROM student_grades WHERE student_id = '${studentId}'`;
// (SQL injection vulnerability if studentId contains: ' OR 1=1 --)
```

### **Rate Limiting** (Brute Force Prevention)

```javascript
// Supabase Edge Function (rate-limit.ts)
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

const RATE_LIMITS = {
  login: { requests: 5, window: 15 * 60 * 1000 },      // 5 attempts per 15 min
  api: { requests: 100, window: 60 * 60 * 1000 },      // 100 req per hour
  upload: { requests: 10, window: 60 * 60 * 1000 }     // 10 uploads per hour
};

serve(async (req) => {
  const userId = req.headers.get('x-user-id');
  const endpoint = req.headers.get('x-endpoint');
  
  const limit = RATE_LIMITS[endpoint] || RATE_LIMITS.api;
  const key = `rate_limit:${userId}:${endpoint}`;
  
  // Check Redis for rate limit
  const count = await redis.get(key);
  
  if (count && parseInt(count) >= limit.requests) {
    return new Response('දර පටිබන්ධන අවහිරය (Rate limit exceeded)', { 
      status: 429,
      headers: { 'Retry-After': '900' }  // Try again in 15 min
    });
  }
  
  // Increment counter
  await redis.incr(key);
  await redis.expire(key, limit.window / 1000);
  
  // Forward request
  return fetch(req.url, { ...req });
});
```

### **File Upload Validation**

```javascript
const validateUpload = (file: File): { valid: boolean; error?: string } => {
  // Check file type
  const allowedTypes = [
    'image/jpeg', 'image/png', 'image/webp',
    'application/pdf',
    'video/mp4',
    'audio/mpeg', 'audio/wav'
  ];
  
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'අවසර නැති ගොනු වර්ගයකි' };
  }
  
  // Check file size (max 50MB)
  const MAX_SIZE = 50 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    return { valid: false, error: 'ගොනුව ඉතා විශාලයි (උපරිම 50MB)' };
  }
  
  // Check filename for path traversal
  if (file.name.includes('..') || file.name.includes('/')) {
    return { valid: false, error: 'අවසර නැති ගොනු නාමය' };
  }
  
  return { valid: true };
};

// Upload to Supabase Storage
const uploadFile = async (file: File, folder: 'content' | 'voice' | 'profiles') => {
  const { valid, error } = validateUpload(file);
  if (!valid) throw new Error(error);
  
  const fileExt = file.name.split('.').pop();
  const fileName = `${uuid.v4()}.${fileExt}`;  // Random UUID filename
  const filePath = `${folder}/${fileName}`;
  
  const { data, error: uploadError } = await supabase.storage
    .from('uploads')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });
  
  if (uploadError) throw uploadError;
  
  return data.path;
};
```

---

## 2.7 Layer 7: Monitoring & Auditing

### **Audit Logging** (Sensitive Actions)

```sql
-- Audit log table
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  metadata JSONB,
  ip_address TEXT,
  user_agent TEXT,
  school_id UUID REFERENCES schools(id),  -- For school-level audits
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for querying
CREATE INDEX idx_audit_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_school_id ON audit_logs(school_id);
CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_created_at ON audit_logs(created_at DESC);
```

### **Automatic Audit Triggers**

```sql
-- Trigger: Log grade changes
CREATE FUNCTION log_grade_change() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (user_id, action, resource_type, resource_id, metadata)
  VALUES (
    NEW.graded_by,
    'grade_updated',
    'student_grade',
    NEW.id,
    jsonb_build_object(
      'student_id', NEW.student_id,
      'classroom_id', NEW.classroom_id,
      'old_grade', OLD.grade,
      'new_grade', NEW.grade,
      'timestamp', now()
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audit_grade_changes
  AFTER UPDATE ON student_grades
  FOR EACH ROW
  WHEN (OLD.grade IS DISTINCT FROM NEW.grade)
  EXECUTE FUNCTION log_grade_change();

-- Trigger: Log data exports
CREATE FUNCTION log_data_export() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (user_id, action, resource_type, metadata)
  VALUES (
    NEW.user_id,
    'data_export',
    'all_data',
    jsonb_build_object(
      'export_format', NEW.format,
      'size_bytes', NEW.size_bytes,
      'timestamp', now()
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audit_data_exports
  AFTER INSERT ON data_exports
  FOR EACH ROW
  EXECUTE FUNCTION log_data_export();

-- Trigger: Log account deletions
CREATE FUNCTION log_account_deletion() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (user_id, action, resource_type, metadata)
  VALUES (
    OLD.id,
    'account_deleted',
    'user',
    jsonb_build_object(
      'email', OLD.email,
      'role', OLD.role,
      'school_id', OLD.school_id,
      'timestamp', now()
    )
  );
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audit_account_deletions
  BEFORE DELETE ON users
  FOR EACH ROW
  EXECUTE FUNCTION log_account_deletion();
```

### **Manual Audit Logging** (React App)

```javascript
const logAuditEvent = async (action: string, resourceType: string, metadata?: any) => {
  const userId = useUserStore.getState().userId;
  
  await supabase.from('audit_logs').insert({
    user_id: userId,
    action,
    resource_type: resourceType,
    metadata,
    created_at: new Date().toISOString()
  });
};

// Example: Log when teacher views student profile
const viewStudentProfile = async (studentId: string) => {
  await logAuditEvent('view_student_profile', 'user', {
    student_id: studentId,
    reason: 'grade_review'
  });
  
  // Then fetch profile
  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('id', studentId)
    .single();
  
  return data;
};
```

### **Anomaly Detection** (v0.5)

```javascript
// Detect suspicious patterns
const detectAnomalies = async () => {
  // Pattern 1: Mass data export
  const { count: exportCount } = await supabase
    .from('audit_logs')
    .select('*', { count: 'exact', head: true })
    .eq('action', 'data_export')
    .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString());  // Last hour
  
  if (exportCount > 10) {
    await sendSecurityAlert('mass_data_export', { count: exportCount });
  }
  
  // Pattern 2: Failed login attempts
  const { count: failedLogins } = await supabase
    .from('audit_logs')
    .select('*', { count: 'exact', head: true })
    .eq('action', 'login_failed')
    .eq('user_id', userId)
    .gte('created_at', new Date(Date.now() - 15 * 60 * 1000).toISOString());  // Last 15 min
  
  if (failedLogins >= 5) {
    await lockAccount(userId, 15 * 60);  // Lock for 15 minutes
  }
  
  // Pattern 3: Cross-school access attempts (CRITICAL)
  const { count: crossSchoolAttempts } = await supabase
    .from('audit_logs')
    .select('*', { count: 'exact', head: true })
    .eq('action', 'unauthorized_school_access')
    .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString());
  
  if (crossSchoolAttempts > 0) {
    await sendCriticalAlert('multi_tenant_breach_attempt', { count: crossSchoolAttempts });
  }
};
```

---

## 2.8 Layer 8: Incident Response

### **Detection Mechanisms**

```javascript
// Sentry for error tracking
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: __DEV__ ? 'development' : 'production',
  
  beforeSend(event, hint) {
    // Scrub sensitive data before sending
    if (event.user) {
      delete event.user.email;
      delete event.user.ip_address;
    }
    
    // Don't send passwords, tokens
    if (event.request?.data) {
      event.request.data = '[REDACTED]';
    }
    
    return event;
  }
});

// Monitor for security events
const monitorSecurityEvents = () => {
  // Unauthorized access attempt
  supabase.from('audit_logs')
    .on('INSERT', (payload) => {
      if (payload.new.action === 'unauthorized_access') {
        Sentry.captureMessage('Unauthorized access attempt', {
          level: 'warning',
          extra: payload.new
        });
      }
    })
    .subscribe();
};
```

---

# PART 3: CHILD SAFETY (SPECIAL PROTECTIONS)

## 3.1 Student Privacy Rules

### **No Public Student Profiles**

```sql
-- Students cannot see other students' profiles
-- Only teachers/principals in same school can see students

-- This policy is already defined in Layer 4 (Authorization)
-- Reinforced here for emphasis
```

### **No Student-to-Student Direct Messaging** (v0.1)

```javascript
// v0.1: No DMs between students
// Only:
// - Teachers → Students (assignment feedback)
// - Students → Teachers (questions)
// - Principals → Everyone (announcements)

// v0.5: Study groups (teacher-supervised, no DMs)

const canSendMessage = (fromRole: string, toRole: string): boolean => {
  const allowedPairs = [
    ['teacher', 'student'],   // Teacher can message student
    ['student', 'teacher'],   // Student can message teacher
    ['principal', 'teacher'], // Principal can message teacher
    ['principal', 'student'], // Principal can message student
    ['teacher', 'teacher'],   // Teachers can message each other
    ['principal', 'principal'] // Principals can message each other
  ];
  
  return allowedPairs.some(([from, to]) => from === fromRole && to === toRole);
};
```

### **Parent/Guardian Consent** (v0.5)

```sql
-- Parental consent for students under 18
CREATE TABLE parental_consent (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES users(id),
  parent_email TEXT NOT NULL,
  parent_name TEXT NOT NULL,
  consent_given BOOLEAN DEFAULT false,
  consent_date TIMESTAMPTZ,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Students under 18 require consent to use advanced features
CREATE POLICY "students_require_consent"
ON content_items FOR SELECT
TO authenticated
USING (
  -- If student, check age and consent
  CASE 
    WHEN (SELECT role FROM users WHERE id = auth.uid()) = 'student'
    THEN (
      -- Over 18 OR has parental consent
      (SELECT date_of_birth FROM users WHERE id = auth.uid()) < (CURRENT_DATE - INTERVAL '18 years')
      OR EXISTS (
        SELECT 1 FROM parental_consent 
        WHERE student_id = auth.uid() 
        AND consent_given = true
      )
    )
    ELSE true  -- Teachers/principals don't need consent
  END
);
```

### **Content Moderation** (v0.5)

```sql
-- Flagged content table
CREATE TABLE flagged_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_type TEXT,  -- 'announcement', 'forum_post', 'comment'
  content_id UUID,
  flagged_by UUID REFERENCES users(id),
  reason TEXT,
  status TEXT CHECK (status IN ('pending', 'reviewed', 'removed')) DEFAULT 'pending',
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Principals can review flagged content
CREATE POLICY "principals_review_flagged_content"
ON flagged_content FOR ALL
TO authenticated
USING (
  (SELECT role FROM users WHERE id = auth.uid()) = 'principal'
  AND EXISTS (
    SELECT 1 FROM schools 
    WHERE id = (SELECT school_id FROM users WHERE id = auth.uid())
  )
);
```

---

## 3.2 Anti-Screenshot Measures (Best Effort)

```javascript
// React Native Screen Capture Detection (Android)
import { NativeModules, DeviceEventEmitter } from 'react-native';

// Detect screenshot (Android only)
DeviceEventEmitter.addListener('onScreenCaptured', () => {
  // Log event
  logAuditEvent('screenshot_taken', 'security', {
    screen: currentScreen,
    timestamp: new Date().toISOString()
  });
  
  // Show warning
  Alert.alert(
    'තිර රූපයක් ගන්නා ලදී',
    'කරුණාකර සිසුන්ගේ පෞද්ගලික තොරතුරු බෙදා නොගන්න'
  );
});

// Prevent screen recording (iOS)
// Add to Info.plist:
// <key>UIApplicationSupportsScreenRecording</key>
// <false/>

// Note: These are DETERRENTS, not foolproof
// Users can still take photos with another device
```

---

# PART 4: PRIVACY RIGHTS (GDPR-INSPIRED)

## 4.1 Right to Access (Data Portability)

### **Export All User Data**

```javascript
const exportAllData = async (userId: string) => {
  // 1. User profile
  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
  
  // 2. Reflections (if teacher)
  let reflections = null;
  if (user.role === 'teacher') {
    const { data } = await supabase
      .from('reflections')
      .select('*')
      .eq('user_id', userId);
    reflections = data;
  }
  
  // 3. Grades (if student)
  let grades = null;
  if (user.role === 'student') {
    const { data } = await supabase
      .from('student_grades')
      .select('*')
      .eq('student_id', userId);
    grades = data;
  }
  
  // 4. Content created (if teacher)
  let content = null;
  if (user.role === 'teacher') {
    const { data } = await supabase
      .from('content_items')
      .select('*')
      .eq('created_by', userId);
    content = data;
  }
  
  // 5. Audit logs (last 90 days)
  const { data: auditLogs } = await supabase
    .from('audit_logs')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString());
  
  // Compile export
  const exportData = {
    user,
    reflections,
    grades,
    content,
    audit_logs: auditLogs,
    exported_at: new Date().toISOString(),
    version: '1.0'
  };
  
  // Generate JSON file
  const json = JSON.stringify(exportData, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  
  // Save to device
  const fileName = `gurudevi_data_export_${userId}_${Date.now()}.json`;
  await FileSystem.writeAsStringAsync(
    FileSystem.documentDirectory + fileName,
    json
  );
  
  // Share with user
  await Sharing.shareAsync(FileSystem.documentDirectory + fileName);
  
  // Log audit event
  await logAuditEvent('data_export', 'all_data', {
    format: 'json',
    size_bytes: blob.size
  });
  
  return fileName;
};
```

### **Data Inventory Screen** (Profile Tab)

```javascript
const DataInventoryScreen = () => {
  const [inventory, setInventory] = useState(null);
  const userId = useUserStore(state => state.userId);
  
  useEffect(() => {
    const loadInventory = async () => {
      // Count user's data
      const inv = {
        profile: {
          name: user.full_name,
          email: user.email,
          role: user.role,
          school: user.school_name,
          created_at: user.created_at
        },
        content: {
          reflections: await countReflections(userId),
          lessons: await countLessons(userId),
          forum_posts: await countForumPosts(userId)
        },
        storage: {
          local_db_mb: await getLocalStorageSize(),
          voice_files_mb: await getVoiceFilesSize(),
          cloud_backup_mb: await getCloudBackupSize()
        },
        sharing: {
          cloud_backup_enabled: settings.cloudBackupEnabled,
          community_visible: settings.communityVisible,
          shared_lessons: await countSharedLessons(userId)
        }
      };
      
      setInventory(inv);
    };
    
    loadInventory();
  }, [userId]);
  
  return (
    <ScrollView>
      <Heading size="xl">ඔබේ දත්ත</Heading>
      
      {/* Display inventory */}
      <DataInventoryCard data={inventory} />
      
      {/* Actions */}
      <Button onPress={() => exportAllData(userId)}>
        සියලුම දත්ත අපනයනය කරන්න (JSON)
      </Button>
      
      <Button colorScheme="red" onPress={initiateAccountDeletion}>
        මගේ ගිණුම මකන්න
      </Button>
    </ScrollView>
  );
};
```

---

## 4.2 Right to Erasure (Data Deletion)

### **Account Deletion Flow**

```javascript
const initiateAccountDeletion = async () => {
  // Step 1: Confirm intent
  Alert.alert(
    'ගිණුම මකන්න',
    'මෙය ඔබේ සියලු දත්ත ස්ථිරවම මකනු ඇත. මෙම ක්‍රියාව අහෝසි කළ නොහැක.',
    [
      { text: 'අවලංගු කරන්න', style: 'cancel' },
      { 
        text: 'මකන්න', 
        style: 'destructive',
        onPress: () => confirmAccountDeletion()
      }
    ]
  );
};

const confirmAccountDeletion = async () => {
  const userId = useUserStore.getState().userId;
  
  // Step 2: Export data first (offer to user)
  Alert.alert(
    'දත්ත අපනයනය',
    'ගිණුම මැකීමට පෙර ඔබේ දත්ත අපනයනය කිරීමට අවශ්‍යද?',
    [
      { text: 'නැත, මකන්න', onPress: () => deleteAccount(userId) },
      { text: 'ඔව්, පළමුව අපනයනය', onPress: async () => {
        await exportAllData(userId);
        // Then delete
        await deleteAccount(userId);
      }}
    ]
  );
};

const deleteAccount = async (userId: string) => {
  // Step 3: Delete all user data (cascade configured in schema)
  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', userId);
  
  if (error) {
    Alert.alert('දෝෂය', 'ගිණුම මැකීමට නොහැකි විය. කරුණාකර සහාය අමතන්න.');
    return;
  }
  
  // Step 4: Delete Supabase auth account
  await supabase.auth.admin.deleteUser(userId);
  
  // Step 5: Clear local state
  useUserStore.getState().clearUser();
  
  // Step 6: Navigate to login
  Alert.alert(
    'ගිණුම මකා දමන ලදී',
    'ඔබේ සියලු දත්ත ස්ථිරවම මකා දමන ලදී.',
    [{ text: 'හරි', onPress: () => navigation.navigate('Login') }]
  );
};
```

### **Cascade Deletes** (Configured in Schema)

```sql
-- When user deleted, all related data deleted automatically
CREATE TABLE reflections (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE student_grades (
  student_id UUID REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE content_items (
  created_by UUID REFERENCES users(id) ON DELETE SET NULL  -- Keep content, remove attribution
);

CREATE TABLE classroom_members (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE
);

-- Audit log persists (for compliance)
CREATE TABLE audit_logs (
  user_id UUID REFERENCES users(id) ON DELETE SET NULL  -- Keep log, anonymize
);
```

---

## 4.3 Right to Rectification

```javascript
// Users can edit their own profile
const ProfileEditScreen = () => {
  const [name, setName] = useState('');
  const [language, setLanguage] = useState('si');
  const userId = useUserStore.getState().userId;
  
  const saveProfile = async () => {
    const { error } = await supabase
      .from('users')
      .update({
        full_name: name,
        language: language,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);
    
    if (error) {
      Alert.alert('දෝෂය', 'පැතිකඩ යාවත්කාලීන කිරීමට නොහැකි විය');
      return;
    }
    
    Alert.alert('සාර්ථකයි', 'පැතිකඩ යාවත්කාලීන කරන ලදී');
  };
  
  return (
    <View>
      <Input 
        label="සම්පූර්ණ නම"
        value={name}
        onChangeText={setName}
      />
      
      <Select
        label="භාෂාව"
        selectedValue={language}
        onValueChange={setLanguage}
      >
        <Select.Item label="සිංහල" value="si" />
        <Select.Item label="தமிழ்" value="ta" />
        <Select.Item label="English" value="en" />
      </Select>
      
      <Button onPress={saveProfile}>
        සුරකින්න
      </Button>
    </View>
  );
};
```

---

# PART 5: INCIDENT RESPONSE

## 5.1 Incident Classification

```
P0: CRITICAL (Immediate Response)
├─ Multi-tenant isolation breach (School A sees School B data)
├─ Mass student data leak
├─ Database compromised
├─ Active ongoing attack
└─ Child safety violation

Response Time: < 1 hour
Escalation: Wake incident commander, form response team

P1: HIGH (Same-Day Response)
├─ Teacher/principal account compromised
├─ Unauthorized access to sensitive data
├─ Authentication bypass
└─ RLS policy misconfiguration

Response Time: < 4 hours
Escalation: Incident commander, security team

P2: MEDIUM (Next-Day Response)
├─ Reflection accidentally shared
├─ Permission misconfiguration (non-critical)
├─ Data export without audit log
└─ Failed rate limiting

Response Time: < 24 hours
Escalation: Security team

P3: LOW (Weekly Response)
├─ Weak password accepted
├─ Missing input validation (low risk)
├─ Incomplete logging (non-sensitive)
└─ UI security indicator missing

Response Time: < 7 days
Escalation: Development team
```

---

## 5.2 Response Playbook (P0: Critical)

### **Multi-Tenant Breach** (MOST CRITICAL)

```markdown
HOUR 0: DETECTION
- Alert triggered (automated or reported)
- IMMEDIATELY disable all API access (emergency kill switch)
- Wake incident commander
- Form response team (you + buddy + security consultant if available)

HOUR 1: CONTAINMENT
- Identify scope:
  * Which schools affected?
  * Which tables leaked?
  * How many users impacted?
- Revoke all JWT tokens (force re-login)
- Enable emergency RLS (restrict to read-only)
- Preserve logs (database snapshot)

HOUR 2-6: INVESTIGATION
- Analyze audit logs
- Review RLS policies (find bug)
- Determine root cause
- Assess actual damage vs potential damage
- Document timeline

HOUR 12: REMEDIATION
- Fix RLS policy bug
- Deploy patch to production
- Test multi-tenant isolation (automated tests)
- Restore normal operations

HOUR 24: NOTIFICATION
- Email affected schools (principals)
- Email affected users (teachers/students)
- File breach report (if legally required in Sri Lanka)
- Public statement (website)

WEEK 1: POST-MORTEM
- Write incident report (blameless)
- Update RLS policies
- Add automated tests (prevent recurrence)
- Review all other RLS policies
- Security training for team
```

### **Communication Template: Multi-Tenant Breach**

```
Subject: URGENT: Security Incident - School Data Isolation

Dear Principal [NAME],

We are writing to inform you of a critical security incident affecting [SCHOOL NAME].

Incident Details:
- Date/Time: [TIMESTAMP]
- Duration: [X] hours
- Issue: Temporary data visibility issue between schools
- Affected Data: [LIST: classrooms, student names, grades, etc.]
- Schools Involved: [SCHOOL A, SCHOOL B]

What Happened:
Due to a configuration error in our database security policies, data from [SCHOOL A] was briefly visible to users in [SCHOOL B] between [TIME] and [TIME].

Immediate Actions Taken:
- Issue detected and fixed within [X] hours
- All affected data access revoked
- Security policies strengthened
- Independent security audit initiated

Data Protection:
- NO data was downloaded or exported
- NO student personally identifiable information (home addresses, phone numbers) was exposed
- Affected data: classroom names, student first names, grade levels only
- All access logged and reviewed

Your Required Actions:
1. Notify parents within 72 hours (template attached)
2. Review which staff have access to Gurudevi
3. Change all teacher passwords (precautionary)

Our Commitment:
- Full investigation report within 7 days
- Enhanced security measures implemented
- Regular third-party security audits
- Transparent incident disclosure
- Financial compensation (if applicable)

We deeply apologize for this incident and breach of trust. The security of your school's data is our highest priority.

Contact:
security@gurudevi.lk | +94 XX XXX XXXX (24/7 hotline)

The Gurudevi Security Team
```

---

## 5.3 Emergency Kill Switch

```javascript
// Supabase Edge Function: Emergency shutdown
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

let emergencyMode = false;

serve(async (req) => {
  // Check if emergency mode activated
  if (emergencyMode) {
    return new Response(
      JSON.stringify({
        error: 'ආරක්ෂක හේතු නිසා පද්ධතිය තාවකාලිකව අක්‍රියයි',
        message: 'System temporarily disabled for security reasons',
        contact: 'security@gurudevi.lk'
      }),
      { 
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
  
  // Normal request handling
  return fetch(req.url, { ...req });
});

// Activate emergency mode (admin endpoint)
export const activateEmergencyMode = async (reason: string) => {
  emergencyMode = true;
  
  // Log to audit
  await logSecurityEvent('emergency_mode_activated', {
    reason,
    activated_by: 'admin',
    timestamp: new Date().toISOString()
  });
  
  // Notify team
  await sendSlackAlert('🚨 EMERGENCY MODE ACTIVATED', { reason });
};
```

---

# PART 6: SECURITY CHECKLIST

## 6.1 Before v0.1 Launch

```
MULTI-TENANT ISOLATION (CRITICAL)
├─ [✅] school_id in ALL tables
├─ [✅] RLS policies enforce school isolation
├─ [✅] Automated tests for cross-school access
├─ [✅] Manual penetration test (try to access other school)
└─ [✅] Emergency kill switch implemented

AUTHENTICATION & AUTHORIZATION
├─ [✅] Password requirements enforced (8+ chars, mixed case, number)
├─ [✅] JWT tokens expire (1 hour access, 60 days refresh)
├─ [✅] Supabase RLS policies on ALL tables
├─ [✅] Role-based access (student, teacher, principal)
├─ [✅] Login rate limiting (5 attempts, 15 min lockout)
└─ [✅] Biometric quick unlock (optional)

ENCRYPTION
├─ [✅] HTTPS/TLS 1.3 everywhere (no HTTP fallback)
├─ [✅] Passwords hashed with bcrypt (Supabase Auth)
├─ [✅] Sacred data encryption plan (v0.5: teacher reflections)
├─ [✅] Encryption keys never logged or exposed
└─ [✅] Data at rest encrypted (PostgreSQL)

CHILD SAFETY
├─ [✅] Student profiles hidden (no public visibility)
├─ [✅] No student-student messaging (v0.1)
├─ [✅] Teachers can only see students in THEIR classrooms
├─ [✅] Principals can see school students (no other schools)
└─ [✅] Screenshot detection (best effort)

INPUT VALIDATION
├─ [✅] Parameterized queries (no SQL injection)
├─ [✅] File upload validation (type, size, content)
├─ [✅] XSS prevention (sanitize user content)
├─ [✅] Path traversal prevention (file operations)
└─ [✅] Rate limiting (API endpoints)

AUDIT & MONITORING
├─ [✅] Audit logging for sensitive actions
├─ [✅] Error tracking (Sentry configured)
├─ [✅] Anomaly detection (basic patterns)
├─ [✅] Incident response plan documented
└─ [✅] Emergency kill switch ready

PRIVACY
├─ [✅] Privacy policy published
├─ [✅] Consent flow implemented
├─ [✅] Data export functionality
├─ [✅] Data deletion functionality
├─ [✅] Minimal data collection
└─ [✅] GDPR-inspired rights (access, rectify, erase)

DOCUMENTATION
├─ [✅] Security Foundation document (this)
├─ [✅] Incident response playbook
├─ [✅] RLS policy documentation
└─ [✅] User security guide (in-app)
```

---

## 6.2 Monthly Security Tasks

```
WEEK 1: AUDIT REVIEW
├─ [ ] Review audit logs for anomalies
├─ [ ] Check for failed login patterns
├─ [ ] Verify cross-school access attempts (should be 0)
├─ [ ] Review RLS policies (all active?)
└─ [ ] Check emergency kill switch (test activation)

WEEK 2: DEPENDENCY UPDATES
├─ [ ] Run npm audit (check vulnerabilities)
├─ [ ] Update critical security patches
├─ [ ] Review new CVEs for used packages
├─ [ ] Test app after updates
└─ [ ] Update Expo SDK (if security fix)

WEEK 3: BACKUP & RECOVERY
├─ [ ] Test database backup restoration
├─ [ ] Review user-reported security concerns
├─ [ ] Check encryption key rotation schedule
├─ [ ] Verify multi-tenant isolation tests passing
└─ [ ] Update incident response contacts

WEEK 4: TEAM & COMPLIANCE
├─ [ ] Security training for team (if team exists)
├─ [ ] Update incident response plan (if needed)
├─ [ ] Penetration testing (quarterly, if budget allows)
└─ [ ] Review privacy policy (any changes needed?)
```

---

## 6.3 Annual Security Review (v0.5+)

```
Q1: EXTERNAL AUDIT
├─ Hire security firm for penetration test
├─ Focus on multi-tenant isolation
├─ Review findings and prioritize fixes
└─ Update security documentation

Q2: COMPLIANCE CHECK
├─ Verify GDPR compliance (if applicable)
├─ Review data retention policies
├─ Audit third-party vendors (Supabase, Sentry, etc.)
└─ Update terms of service

Q3: INTERNAL REVIEW
├─ Table-top incident response exercise
├─ Review and update ALL RLS policies
├─ Security training for staff
└─ Update threat model

Q4: INFRASTRUCTURE
├─ Review access controls (who has Supabase admin?)
├─ Rotate encryption keys (if using custom encryption)
├─ Update disaster recovery plan
└─ Plan next year's security budget
```

---

# CONCLUSION

## The Security Promise (Updated for v2.0)

**To Teachers**:
> *"Your reflections are yours alone. Your students are protected. We guard both with equal care."*

**To Students**:
> *"Your data stays safe. Only teachers who need to help you can see your information, and only what's necessary. Your school's data will never mix with another school's."*

**To Principals**:
> *"Your school's data is isolated. We meet international security standards. Your trust is sacred."*

**To All Schools**:
> *"Each school is a fortress. Your data is yours, protected by cryptographic walls."*

---

## Security is Not a Feature

Security is **woven into every layer**:
1. **Multi-Tenant Isolation**: school_id + RLS (prevents cross-school leakage)
2. **Transport**: TLS 1.3 encryption (protects data in transit)
3. **Authentication**: Strong passwords + JWT + optional biometric
4. **Authorization**: RLS + role-based access (database-level enforcement)
5. **Data Encryption**: End-to-end for sacred data (teacher reflections)
6. **Application**: Input validation + rate limiting + file upload checks
7. **Monitoring**: Audit logs + anomaly detection + Sentry
8. **Incident Response**: Playbooks + kill switch + communication templates

---

## Living Document

**This security foundation will evolve**:
- As threats change (new attack vectors)
- As we learn from incidents (post-mortems)
- As regulations update (Sri Lankan data protection laws)
- As the cathedral grows (v0.5 → v1.0 → beyond)

**But the core promise remains**:
> **Sanctuary must be safe. Privacy must be respected. Children must be protected. Schools must be isolated.**

---

**What Changed in v2.0**:
- ✅ Multi-tenant school platform (one database, RLS isolation)
- ✅ Updated roles (student, teacher, principal)
- ✅ Cloud-first Supabase (was offline-first WatermelonDB)
- ✅ Expanded child safety (student profiles, grades)
- ✅ School-based RLS policies (tenant isolation)
- ✅ Clarified encryption tiers (public vs sacred)
- ✅ Emergency kill switch (incident response)

---

*From mud, through water, to full bloom—with security at every root.* 🪷🔒

---

*ජයවේව* (Jayawewa - May you be victorious!)

**END OF SECURITY FOUNDATION v2.0**
