---
title: "Vercel Free Tier Limits & Cloudflare R2 Integration"
status: "active"
created: 2026-02-02
updated: 2026-02-11
author: "Naween"
tags: [reorganized]
---

# Vercel Free Tier Limits & Cloudflare R2 Integration

## Vercel Free Tier (Hobby Plan)

### What You Get FREE Forever:
- ✅ **Unlimited projects** (deploy as many sites as you want!)
- ✅ **100GB bandwidth/month** (plenty for most sites)
- ✅ **100 deployments/day** (every git push = 1 deployment)
- ✅ **Unlimited custom domains** (edlove.org, gurudevi.org, etc.)
- ✅ **Automatic HTTPS** (SSL certificates)
- ✅ **Preview deployments** (every branch gets a URL)
- ✅ **Serverless functions** (100GB-hours/month)

### Limits:
- ⚠️ **Bandwidth**: 100GB/month
- ⚠️ **Build time**: 6,000 minutes/month
- ⚠️ **Team members**: 1 (just you)
- ⚠️ **Commercial use**: Not allowed (but personal projects are fine)

---

## What Happens If You Exceed Limits?

### Bandwidth (100GB/month)
**If you exceed:**
1. Vercel sends you an email warning
2. Your site **keeps working** (they don't shut it down)
3. They ask you to upgrade to Pro ($20/month for 1TB)

**Reality**: 100GB is a LOT
- 100GB = ~100,000 page views/month (if each page is 1MB)
- Your site is probably <500KB per page
- So you can handle ~200,000 visits/month

**Your video issue**: If you add a 250MB video, that's a problem. Solution: Use Cloudflare R2 (see below).

### Deployments (100/day)
**If you exceed:**
- You'd have to push to GitHub 100+ times in one day
- Unlikely unless you're doing something wrong
- If you hit it, just wait until tomorrow

### Build Minutes (6,000/month)
**If you exceed:**
- Each build takes ~2 minutes
- 6,000 minutes = 3,000 builds/month
- You'd have to deploy 100 times/day
- Not a real concern

---

## Using Cloudflare R2 for Video Storage

**The Strategy**: Host your site on Vercel, but store heavy assets (videos, images) on Cloudflare R2.

### Why R2?
- ✅ **Free**: 10GB storage, unlimited bandwidth (no egress fees!)
- ✅ **Fast**: Global CDN
- ✅ **Cheap**: After 10GB, only $0.015/GB/month

### How to Set It Up

#### Step 1: Create R2 Bucket
1. Go to [dash.cloudflare.com](https://dash.cloudflare.com)
2. Click **"R2"** in sidebar
3. Click **"Create bucket"**
4. Name it: `edlove-assets`
5. Click **"Create bucket"**

#### Step 2: Upload Your Video
1. Click on your bucket
2. Click **"Upload"**
3. Upload `nature-loop.mp4`
4. Click on the file → **"Get Public URL"**
5. Copy the URL (e.g., `https://pub-xxxxx.r2.dev/nature-loop.mp4`)

#### Step 3: Update Your Code
Edit `apps/edlove-web/src/components/CinematicBackground.astro`:

```astro
<video autoplay loop muted playsinline>
    <!-- Change from local file to R2 URL -->
    <source src="https://pub-xxxxx.r2.dev/nature-loop.mp4" type="video/mp4" />
</video>
```

#### Step 4: Push to GitHub
```bash
git add .
git commit -m "feat: use R2 for video hosting"
git push
```

Vercel auto-deploys, and now your video loads from R2 (not Vercel's bandwidth).

---

## Subdomains (e.g., gurudevi.edlove.org)

### How to Create Subdomains

**Option 1: Deploy Separate Vercel Projects**

1. **Deploy Gurudevi Mobile Web Version**:
   - Create a new Vercel project
   - Point it to `apps/gurudevi-mobile` (if you build a web version)
   - Or create `apps/gurudevi-web` separately

2. **Add Subdomain in Vercel**:
   - Go to that project → Settings → Domains
   - Add: `gurudevi.edlove.org`

3. **Add DNS in Porkbun**:
   - Type: `CNAME`
   - Host: `gurudevi`
   - Answer: `cname.vercel-dns.com`
   - TTL: `600`

**Result**: `gurudevi.edlove.org` points to a different Vercel project.

---

**Option 2: Use Vercel Rewrites (Same Project)**

If you want `gurudevi.edlove.org` to show a different page from the SAME project:

1. **Add subdomain in Vercel**:
   - Settings → Domains → Add `gurudevi.edlove.org`

2. **Create `vercel.json` in `apps/edlove-web/`**:
```json
{
  "rewrites": [
    {
      "source": "/:path*",
      "destination": "/gurudevi/:path*",
      "has": [
        {
          "type": "host",
          "value": "gurudevi.edlove.org"
        }
      ]
    }
  ]
}
```

3. **Create `/gurudevi` folder** in your Astro pages.

**Result**: `gurudevi.edlove.org` shows content from `/gurudevi` route.

---

## Recommended Structure for Your Ecosystem

```
edlove.org              → Main site (Paradigm Cosmos)
gurudevi.edlove.org     → Gurudevi portal (separate Vercel project)
community.edlove.org    → Community forum (future)
library.edlove.org      → Resource library (future)
```

Each subdomain = separate Vercel project (all free!).

---

## Summary

**Vercel Free Tier:**
- Unlimited projects ✅
- 100GB bandwidth/month (plenty)
- Unlimited domains & subdomains ✅

**If You Exceed Bandwidth:**
- Site keeps working
- Vercel asks you to upgrade
- Use R2 for heavy assets to avoid this

**Cloudflare R2:**
- Free 10GB storage
- Unlimited bandwidth (no egress fees!)
- Perfect for videos/images

**Subdomains:**
- Add in Vercel → Settings → Domains
- Add CNAME in Porkbun
- Each subdomain can be a different project (all free!)

**Next Steps:**
1. Upload your video to R2 (when you have one)
2. Create subdomains as needed
3. Deploy more projects (all free!)

Want me to help you set up R2 for your video now, or wait until you have the video file?
