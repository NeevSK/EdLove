# 🔐 Supabase Authentication Explained
## How Auth Works in Gurudevi (And Why No Password Column)

---

## 🤔 Your Questions Answered

### Q1: "Why is there no password column in the users table?"
**Answer**: Passwords are stored separately in `auth.users` (Supabase's secure auth table), NOT in `public.users`!

### Q2: "Why do I need to verify email?"
**Answer**: Supabase has email confirmation enabled by default. We need to disable it for development.

### Q3: "How does authentication actually work?"
**Answer**: Two-table system explained below.

---

## 📊 Supabase Auth Architecture

Supabase uses **TWO separate tables** for security:

### 1. `auth.users` (Supabase Internal - Secure)
**Purpose**: Stores authentication credentials  
**Location**: Hidden schema (not visible in Table Editor)  
**Contains**:
- `id` (UUID) - User's unique ID
- `email` - User's email
- `encrypted_password` - Hashed password (bcrypt)
- `email_confirmed_at` - When email was verified
- `last_sign_in_at` - Last login time
- `raw_user_meta_data` - Custom data (full_name, role we pass in signup)

**Security**: 
- ✅ You CANNOT directly query this table from your app
- ✅ Only Supabase Auth API can access it
- ✅ Passwords are hashed (irreversible encryption)
- ✅ Protected from SQL injection

### 2. `public.users` (Your App's User Profiles)
**Purpose**: Stores app-specific user data  
**Location**: Public schema (visible in Table Editor)  
**Contains**:
- `id` (UUID) - **Same ID as auth.users.id**
- `school_id` - Which school they belong to
- `full_name` - Display name
- `role` - teacher/student/principal
- `language` - Preference (si/ta/en)
- `avatar_url` - Profile picture
- **NO PASSWORD** - Not needed here!

**Security**:
- ⚠️ Protected by RLS policies
- ⚠️ Your app queries this table directly

---

## 🔄 How Sign Up Works (Step-by-Step)

### When User Clicks "Sign Up":

```
1. User fills form:
   ├─ Email: teacher@school.lk
   ├─ Password: SecurePass123!
   ├─ Full Name: පුන්චි මහත්තයා
   └─ Role: teacher

2. App calls Supabase:
   supabase.auth.signUp({
     email,
     password,
     options: {
       data: { full_name, role }  ← Metadata
     }
   })

3. Supabase creates auth.users row:
   ├─ id: abc-123-def-456 (generated UUID)
   ├─ email: teacher@school.lk
   ├─ encrypted_password: $2a$10$... (bcrypt hash)
   ├─ raw_user_meta_data: { full_name: "පුන්චි මහත්තයා", role: "teacher" }
   └─ email_confirmed_at: NULL ← ⚠️ Needs verification!

4. ❌ PROBLEM: Email not confirmed yet
   └─ Supabase sends verification email
   └─ User must click link to activate account

5. IF email confirmed (or disabled):
   ✅ Trigger creates public.users row:
      ├─ id: abc-123-def-456 (SAME as auth.users.id)
      ├─ email: teacher@school.lk
      ├─ full_name: පුන්චි මහත්තයා
      ├─ role: teacher
      └─   school_id: [created or selected]

6. Auto-create subscription:
   └─ user_id: abc-123-def-456
   └─ tier: free
   └─ status: active
```

---

## 🔄 How Login Works

### When User Clicks "Login":

```
1. User enters:
   ├─ Email: teacher@school.lk
   └─ Password: SecurePass123!

2. App calls Supabase:
   supabase.auth.signInWithPassword({ email, password })

3. Supabase checks auth.users:
   ├─ Find user with email
   ├─ Compare bcrypt(password) with stored hash
   └─ Check if email_confirmed_at is set

4. IF password correct AND email confirmed:
   ✅ Create session token (JWT)
   ✅ Return session to app
   ✅ App stores session in AsyncStorage
   ✅ App navigates to main tabs

5. IF email NOT confirmed:
   ❌ Return error: "Email not confirmed"
   └─ User stuck on login screen
```

---

## ⚠️ Your Current Problem: Email Verification

### Why You're Seeing "Need to Verify Email"

**Default Supabase Behavior**:
1. Sign up → Account created but **disabled**
2. Supabase sends verification email
3. User clicks link in email → Account **activated**
4. User can now log in

**Problem for Development**:
- ❌ Slows down testing
- ❌ Email might go to spam
- ❌ Need real email address
- ❌ Annoying for every test user

---

## ✅ SOLUTION: Disable Email Confirmation

### Step 1: Open Supabase Dashboard

1. Go to https://supabase.com/dashboard
2. Select your project
3. Click **Authentication** in left sidebar
4. Click **Providers** (under Authentication)

### Step 2: Find Email Provider Settings

1. You'll see a list of auth providers (Email, Google, Apple, etc.)
2. Click on **Email** provider
3. Scroll down to **"Email Confirmations"** section

### Step 3: Disable Confirmation

1. Find the toggle: **"Enable email confirmations"**
2. **Turn it OFF** (switch to disabled/gray)
3. Click **Save** at the bottom

**What this does:**
- ✅ New users are immediately **confirmed**
- ✅ `email_confirmed_at` is set automatically
- ✅ Users can log in right away (no email click needed)
- ✅ Perfect for development/testing

### Step 4: (Optional) Reset Existing Unconfirmed Users

If you already created a user and it's stuck unconfirmed:

1. Go to **Authentication** → **Users** (in dashboard)
2. Find your test user
3. Click on the user
4. Look for **"Confirm email"** button
5. Click it to manually confirm

OR delete the user and sign up again (now that confirmation is disabled).

---

## 🔒 Security Notes

### "Is it safe to disable email confirmation?"

**For Development**: ✅ Yes, completely fine  
**For Production**: ⚠️ **Re-enable it!**

**Why enable in production:**
- Prevents fake/spam accounts
- Ensures user owns the email
- Reduces bot registrations

**How to handle in production:**
1. Keep confirmation enabled
2. Build a better UX for "check your email" flow
3. Add "resend verification email" button
4. Show clear instructions

---

## 🧪 Testing After Fix

### After Disabling Email Confirmation:

1. **Delete** your existing test account (if it exists):
   - Dashboard → Authentication → Users
   - Find user by email
   - Click trash icon

2. **Sign up again** in the app:
   - Email: test@example.com
   - Password: SecurePass123!
   - Full Name: Test User
   - Role: Teacher

3. **Expected**: Immediate success!
   - ✅ Account created
   - ✅ Automatically confirmed
   - ✅ public.users row created (via trigger)
   - ✅ subscription row created (via trigger)
   - ✅ Can navigate to app tabs

4. **Test login**:
   - Log out
   - Log back in with same credentials
   - ✅ Should work immediately

---

## 🛠️ Troubleshooting

### Issue: "Email not confirmed" (still happening after disabling)

**Cause**: Existing user was created BEFORE you disabled confirmation  
**Fix**: Delete user and sign up again, OR manually confirm in dashboard

---

### Issue: " User already exists"

**Cause**: Email already in auth.users table  
**Fix**: 
1. Delete from Dashboard → Authentication → Users
2. OR use different email

---

### Issue: "new row violates row-level security policy for table users"

**Cause**: RLS policy preventing user creation  
**Fix**: Check you have this policy:

```sql
CREATE POLICY "Anyone can insert during signup"
  ON public.users FOR INSERT
  WITH CHECK (id = auth.uid());
```

Run in SQL Editor if missing.

---

### Issue: "Cannot read property 'school_id' of null"

**Cause**: public.users row not created (trigger might have failed)  
**Fix**: 

1. Check if trigger exists:
```sql
SELECT tgname FROM pg_trigger WHERE tgrelid = 'public.users'::regclass;
```

2. If missing, the minimal_schema.sql didn't run completely  
3. Re-run the SQL script

---

## 📝 Current Implementation Details

From the code I analyzed:

### AuthScreen.tsx (Lines 72-81)
```typescript
const { error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    data: {
      full_name: fullName,
      role: role,
    }
  }
});
```

**What happens:**
1. Creates `auth.users` row
2. Stores `full_name` and `role` in `raw_user_meta_data`
3. If email confirmation enabled → Sends email
4. If email confirmation disabled → User immediately confirmed

### Missing: public.users Creation

**Problem**: I don't see a trigger or manual INSERT for `public.users`!

This means after successful auth, the app will crash when trying to fetch user profile.

**We need to add either:**

**Option A**: Database trigger (automatic - recommended)
```sql
-- Already in minimal_schema.sql, but needs school_id!
CREATE OR REPLACE FUNCTION create_public_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role, school_id)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'role',
    NEW.raw_user_meta_data->>'school_id'  -- Must be provided!
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_public_user_profile();
```

**Option B**: Manual creation in AuthScreen (after signup)

---

## 🚀 Next Steps

1. ✅ **Disable email confirmation** in Supabase dashboard
2. ✅ **Add school selection/creation** to signup flow (missing!)
3. ✅ **Create trigger** to auto-create public.users row
4. ✅ **Test signup** → should work end-to-end
5. ✅ **Test login** → should see user profile

---

## 📋 Summary

| Component | Where Password Stored | Visible to App? |
|-----------|---------------------|-----------------|
| `auth.users` | ✅ Encrypted password | ❌ No (Supabase internal) |
| `public.users` | ❌ NO password | ✅ Yes (via RLS) |

**Key Takeaways:**
- Passwords in `auth.users` (secure, hashed)
- Profile data in `public.users` (app-accessible)
- Same `id` links both tables
- Email confirmation blocking you → Disable it
- Need to add school_id to signup flow
- Need trigger to create public.users row

**Your next action:** Go to Supabase dashboard and disable email confirmation!
