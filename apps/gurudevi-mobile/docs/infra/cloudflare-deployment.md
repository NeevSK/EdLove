---
title: "Cloudflare Pages Deployment Guide"
status: "active"
created: 2026-02-02
updated: 2026-02-11
author: "Naween"
tags: [reorganized]
---

# Cloudflare Pages Deployment Guide

## Step-by-Step Instructions

### 1. Push Code to GitHub
```bash
# Already done! Your code is committed and ready.
git push origin main
```

### 2. Create Cloudflare Account
1. Go to [dash.cloudflare.com/sign-up](https://dash.cloudflare.com/sign-up)
2. Sign up with your email (free account)
3. Verify your email

### 3. Deploy to Cloudflare Pages

#### A. Connect GitHub
1. In Cloudflare Dashboard, click **"Workers & Pages"** in left sidebar
2. Click **"Create Application"** → **"Pages"** → **"Connect to Git"**
3. Click **"Connect GitHub"**
4. Authorize Cloudflare to access your repos
5. Select the **`polymath-platform`** repository

#### B. Configure Build Settings
When prompted, enter these settings:

| Setting | Value |
|:--------|:------|
| **Project name** | `edlove-web` |
| **Production branch** | `main` |
| **Framework preset** | `Astro` |
| **Build command** | `cd apps/edlove-web && pnpm install && pnpm build` |
| **Build output directory** | `apps/edlove-web/dist` |
| **Root directory** | `/` (leave as default) |

#### C. Environment Variables (if needed)
- Click **"Add variable"** if you have any secrets
- For now, leave empty (we don't have any)

#### D. Deploy!
1. Click **"Save and Deploy"**
2. Watch the build logs (takes 2-3 minutes)
3. When done, you'll get a URL: `edlove-web.pages.dev`

### 4. Test Your Site
1. Click the deployment URL
2. Navigate to `/cosmos` to see the Liquid Shader
3. Check that the video plays on the home page

---

## Troubleshooting

### Build fails with "pnpm: command not found"
**Fix**: Update build command to:
```bash
npm install -g pnpm && cd apps/edlove-web && pnpm install && pnpm build
```

### Video doesn't load
**Check**: Make sure `nature-loop.mp4` is in `apps/edlove-web/public/assets/`

### Shader doesn't render
**Check browser console** for errors. Cloudflare Pages supports all modern browsers.

---

## Next Steps After Deployment

### Custom Domain (Optional)
1. In Cloudflare Pages dashboard, click **"Custom domains"**
2. Click **"Set up a custom domain"**
3. Enter `edlove.org`
4. Follow DNS instructions

### Video Optimization (Later)
If you want to move the video to R2:
1. Go to **"R2"** in Cloudflare dashboard
2. Create bucket: `edlove-assets`
3. Upload `nature-loop.mp4`
4. Get public URL
5. Update `CinematicBackground.astro` with new URL

---

## Comparison: Cloudflare vs Vercel

| Feature | Cloudflare Pages | Vercel |
|:--------|:-----------------|:-------|
| **Bandwidth** | ✅ Unlimited | 100GB/month |
| **Build time** | ~3 min | ~2 min |
| **Ease of setup** | Medium | Easiest |
| **Best for** | Heavy assets (your video!) | Quick prototypes |

You chose wisely for EdLove's video-heavy design!
