---
title: "Deploying EdLove Web to Vercel - Step by Step"
status: "active"
created: 2026-02-02
updated: 2026-02-11
author: "Naween"
tags: [reorganized]
---

# Deploying EdLove Web to Vercel - Step by Step

## Prerequisites
✅ Your code is pushed to GitHub
✅ You have a GitHub account

## Step 1: Go to Vercel
Open your browser and go to: **[vercel.com/new](https://vercel.com/new)**

## Step 2: Sign In
Click **"Continue with GitHub"**

## Step 3: Import Repository
1. You'll see a list of your GitHub repos
2. Find **`polymath-platform`** (or search for it)
3. Click **"Import"**

## Step 4: Configure Project
You'll see a configuration screen. Fill in:

| Setting | Value |
|:--------|:------|
| **Project Name** | `edlove-web` (or whatever you prefer) |
| **Framework Preset** | Astro (should auto-detect) |
| **Root Directory** | Click "Edit" → Enter `apps/edlove-web` |
| **Build Command** | `pnpm build` (auto-filled) |
| **Output Directory** | `dist` (auto-filled) |
| **Install Command** | `pnpm install` (auto-filled) |

## Step 5: Deploy
Click the big **"Deploy"** button at the bottom.

## Step 6: Wait (2-3 minutes)
Vercel will:
1. Clone your repo
2. Install dependencies
3. Build your site
4. Deploy it

You'll see a progress screen with logs.

## Step 7: Success! 🎉
When done, you'll see:
- **Your live URL**: `edlove-web.vercel.app` (or similar)
- A screenshot preview
- Confetti animation 🎊

Click **"Visit"** to see your live site!

---

## What You'll See

### Homepage (`/`)
- Cinematic video background (or gradient fallback if no video)
- "The Educational Paradigm Cosmos" headline
- Navigation to all 6 domains

### Cosmos Page (`/cosmos`)
- Liquid shader (vivid, pulsating energy)
- "The Paradigm Cosmos" title

### Other Pages
- Sri Lanka, Gurudevi, Resources, Community, Library (placeholder text)

---

## Troubleshooting

### If Build Fails
**Most likely issue**: pnpm lockfile (again)

**Solution**: In Vercel dashboard:
1. Go to **Settings** → **General**
2. Scroll to **Build & Development Settings**
3. Change **Install Command** to: `pnpm install --no-frozen-lockfile`
4. Click **Save**
5. Go to **Deployments** tab
6. Click **"Redeploy"** on the failed build

### If Video Doesn't Show
- Normal! You haven't added `nature-loop.mp4` yet
- The gradient fallback will show instead
- To add video later: Upload to `apps/edlove-web/public/assets/nature-loop.mp4` and push

---

## After Deployment

### Automatic Deployments
Every time you push to GitHub, Vercel will:
1. Detect the push
2. Rebuild automatically
3. Deploy the new version
4. Send you an email with the preview

### Custom Domain (Optional)
1. Buy `edlove.org` from Namecheap or Cloudflare (~$12/year)
2. In Vercel dashboard: **Settings** → **Domains**
3. Add your domain
4. Follow DNS instructions
5. Done! Your site will be at `edlove.org`

---

## Next Steps

1. **Deploy now** (follow steps above)
2. **Share the URL** with friends for feedback
3. **Add your nature video** when ready
4. **Continue developing** - changes auto-deploy on push

**Ready to deploy? Open [vercel.com/new](https://vercel.com/new) and follow the steps!**
