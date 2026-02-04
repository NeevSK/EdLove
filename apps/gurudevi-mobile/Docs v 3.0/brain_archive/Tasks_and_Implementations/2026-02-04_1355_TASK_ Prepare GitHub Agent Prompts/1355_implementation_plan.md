# IMPL PLAN: Supabase Setup & Secure Config

## Goal
Securely configure Supabase for the Gurudevi mobile app by removing hardcoded credentials and implementing environment variables. Provide the user with a setup guide and SQL schema to initialize their own Supabase project.

## User Review Required
> [!IMPORTANT]
> This plan requires you to create a Supabase project manually. I cannot do this for you. I will provide a guide.

## Proposed Changes

### Configuration
#### [MODIFY] [supabase.ts](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/src/lib/supabase.ts)
- Replace hardcoded URL/Key with `process.env.EXPO_PUBLIC_SUPABASE_URL` and `process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY`.

#### [NEW] [.env](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/.env)
- Create a template `.env` file with placeholders for the keys.

### Artifacts (For User)
#### [NEW] [gurudevi_schema.sql](file:///c:/Users/Naween/.gemini/antigravity/brain/7e6bea3e-55b4-4c7d-8657-d2434a5a23a7/gurudevi_schema.sql)
- SQL script to create `profiles` and `mood_logs` tables with RLS policies.

#### [NEW] [SUPABASE_SETUP_GUIDE.md](file:///c:/Users/Naween/.gemini/antigravity/brain/7e6bea3e-55b4-4c7d-8657-d2434a5a23a7/SUPABASE_SETUP_GUIDE.md)
- Step-by-step instructions for the user.

## Verification Plan

### Manual Verification
1.  **User Action**: Follow `SUPABASE_SETUP_GUIDE.md` to create project and get keys.
2.  **User Action**: Paste keys into `apps/gurudevi-mobile/.env`.
3.  **User Action**: Run the SQL script in Supabase SQL Editor.
4.  **Verification**: I will ask you to try logging in (or I can write a small script to test the connection if you give me the keys, but better you keep them private and we trust the app build).
5.  **Build Check**: Run `npx expo start` to ensure no errors with the new config.
