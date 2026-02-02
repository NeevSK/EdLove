# Free Hosting Guide for EdLove Web

> **Update**: After testing, Cloudflare Pages has persistent pnpm lockfile issues with monorepos. **Vercel is recommended** for this project.

## The Best Free Options (Ranked by Ease)

### 🥇 Tier 1: Zero-Config (Recommended for EdLove)

#### **Vercel** (Best for Astro/Next.js)
- **Pros**: 
  - One-click deploy from GitHub
  - Automatic HTTPS
  - Perfect for Astro (they sponsor it)
  - 100GB bandwidth/month (plenty for starting)
  - Custom domain support
- **Cons**: 
  - Video files count toward bandwidth (your 250MB video might be an issue)
- **Setup**: 
  1. Push code to GitHub
  2. Go to [vercel.com](https://vercel.com)
  3. Click "Import Project" → Select your repo
  4. Done. You get `edlove.vercel.app`
- **Custom Domain**: Point `edlove.org` DNS to Vercel (free)

#### **Netlify** (Alternative to Vercel)
- **Pros**: 
  - Similar to Vercel
  - 100GB bandwidth
  - Great build system
  - Form handling (useful for contact forms)
- **Cons**: 
  - Slightly slower builds than Vercel
- **Setup**: Same as Vercel (GitHub → Import)

---

### 🥈 Tier 2: More Control, Slightly More Setup

#### **Cloudflare Pages**
- **Pros**: 
  - **Unlimited bandwidth** (this solves your video problem!)
  - Fast global CDN
  - Free custom domain
- **Cons**: 
  - Build times can be slower
  - Slightly more complex setup
- **Best for**: Sites with heavy assets (your 250MB video)

#### **GitHub Pages**
- **Pros**: 
  - 100% free
  - Simple if you know Git
- **Cons**: 
  - Only static sites (Astro works, but needs build step)
  - No server-side features
  - Custom domain requires manual DNS setup

---

### 🥉 Tier 3: For Learning (Not Recommended for Production)

#### **Render** (Free Tier)
- **Pros**: Can host full-stack apps
- **Cons**: Spins down after inactivity (slow first load)

#### **Railway** (Free Trial)
- **Pros**: Great for databases + backend
- **Cons**: Free tier is limited ($5 credit/month)

---

## Recommended Path for EdLove

### Phase 1: Deploy to Vercel (Today)
1. **Optimize the video first**:
   ```bash
   # Use an online compressor to get nature-loop.mp4 under 10MB
   # Or host it on Cloudflare R2 (free object storage)
   ```

2. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "feat: ready for deployment"
   git push
   ```

3. **Deploy**:
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import `polymath-platform` repo
   - Set "Root Directory" to `apps/edlove-web`
   - Click Deploy

4. **Result**: You get `edlove-web.vercel.app` live in 2 minutes.

### Phase 2: Custom Domain (Later)
1. Buy `edlove.org` (if you haven't) - ~$12/year from Namecheap or Cloudflare
2. Add DNS records in Vercel dashboard
3. Done.

---

## Video Hosting Strategy (Solving the 250MB Problem)

Your cinematic video is too heavy for most free tiers. Here are solutions:

### Option A: Compress It (Recommended)
- Use [Handbrake](https://handbrake.fr/) or [Cloudconvert](https://cloudconvert.com/mp4-converter)
- Target: 5-10MB, 1080p, 10-second loop
- Quality will still be excellent

### Option B: Host Video Separately
- Upload to **Cloudflare R2** (10GB free storage)
- Or use **Bunny CDN** (free tier: 1GB)
- Update `CinematicBackground.astro` to point to external URL:
  ```html
  <source src="https://your-cdn.com/nature-loop.mp4" type="video/mp4" />
  ```

### Option C: Use a GIF/WebM Instead
- Convert video to WebM format (50% smaller than MP4)
- Or use an animated WebP (even smaller)

---

## Cost Comparison

| Service | Bandwidth | Storage | Custom Domain | Best For |
|:--------|:----------|:--------|:--------------|:---------|
| **Vercel** | 100GB/mo | 100GB | Free | Astro/Next.js sites |
| **Netlify** | 100GB/mo | 100GB | Free | Static sites |
| **Cloudflare Pages** | Unlimited | 25,000 files | Free | Heavy assets |
| **GitHub Pages** | 100GB/mo | 1GB | Free (manual) | Simple static |

---

## My Recommendation

**For EdLove (Production)**:
1. Compress video to <10MB
2. Deploy to **Vercel** (easiest, perfect for Astro)
3. Use free `edlove-web.vercel.app` until you're ready to buy the domain

**For Your "Lab" (Experiments)**:
1. Create a new repo: `web-experiments`
2. Deploy to **Netlify** (so you have both platforms to compare)
3. Go wild with shaders, 3D models, etc.

---

## Next Steps

1. **Compress your video** (I can guide you through this)
2. **Push to GitHub** (if you haven't)
3. **Deploy to Vercel** (5 minutes)
4. **Share the link** and get feedback

Would you like me to help you with any of these steps right now?
