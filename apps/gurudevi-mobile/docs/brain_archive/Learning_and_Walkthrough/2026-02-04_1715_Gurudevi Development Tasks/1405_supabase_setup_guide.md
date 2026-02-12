# 🔐 Supabase Credentials Setup Guide

## What You Need to Get

You need **2 keys** from your Supabase project:

1. **Project URL** - The web address of your Supabase project
2. **Anon/Public Key** - A public key for client-side access (safe to use in apps)

---

## 📍 How to Find Your Credentials

### Step 1: Go to Your Supabase Dashboard
1. Open your browser and go to: https://supabase.com/dashboard
2. Log in with your account
3. You should see your project(s) listed

### Step 2: Select Your Project
Click on the project you created (it will have a name you chose)

### Step 3: Find Your API Credentials
1. In the left sidebar, click on ⚙️ **Settings** (gear icon at the bottom)
2. Under Settings, click on **API**
3. You'll see a page with your credentials

### Step 4: Copy These Two Values

You'll see several sections on this page:

#### **Project URL**
- Look for "Project URL" section at the top
- It will look like: `https://xxxxxxxxxxxxx.supabase.co`
- Copy this entire URL

#### **API Keys**
Scroll down to the "Project API keys" section. You'll see two keys:

- **`anon` `public`** ← Copy this one (it's safe for client apps)
- **`service_role` `secret`** ← DON'T use this in your app! (Only for backend)

Copy the **anon public** key - it's a long string like:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ey...
```

---

## 🎯 What Each Key Does

### Project URL
- This is the address where your Supabase database lives
- Every request from your app goes to this URL
- **Example**: `https://abc123xyz.supabase.co`

### Anon Key (Public Key)
- Used by your app to connect to Supabase
- Safe to include in your mobile/web app
- Has limited permissions (users can only access their own data)
- Works with Row Level Security (RLS) policies

### Service Role Key (Don't Use!)
- ⚠️ **DANGER**: Has full admin access to your database
- Bypasses all security rules
- Only use in backend/server code, NEVER in mobile/web apps
- We won't use this for gurudevi-mobile or edlove-web

---

## ✅ Once You Have Your Keys

**Tell me when you have:**
1. ✓ Your Project URL
2. ✓ Your Anon/Public Key

Then I'll help you:
1. Update the `.env` files for both projects
2. Test the connection
3. Make sure everything works

---

## 🤔 Common Questions

**Q: Is it safe to share the anon key?**
A: The anon key is designed to be used in public apps. However, you should still not share it publicly (like posting on GitHub). That's why we put it in `.env` and add `.env` to `.gitignore`.

**Q: What if I accidentally exposed my keys?**
A: You can regenerate them in the Supabase dashboard. Go to Settings → API → scroll down to "Reset API keys"

**Q: Do I need different projects for gurudevi-mobile and edlove-web?**
A: Yes! Each app should have its own Supabase project because:
- Different data models
- Different security rules
- Separate billing/usage

---

## 📝 Next Steps

1. Follow steps above to get your credentials
2. Share them with me (just paste them in chat)
3. I'll update your `.env` files
4. We'll test the connection
5. Ready to build! 🚀
