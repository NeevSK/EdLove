---
title: "Editorial & Rich Media Guidelines for EdLove & Gurudevi"
status: "active"
created: 2026-09-01
updated: 2026-09-01
author: "Naveen"
scribe: "Antigravity"
tags: [editorial, media, guidelines, aesthetics]
---

# Editorial & Rich Media Guidelines (EdLove & Gurudevi)

## 1. Visual & Editorial Tone
* **Aesthetic Standard**: Atmospheric, contemplative, dignified ("The Terrence Malick Law").
* **Imagery**: High-res, authentic, natural lighting. Avoid generic stock photos of smiling office models.
* **Prose & Quotes**: Deep Baskerville / Fraunces italic serif with generous line height and breathing room.

---

## 2. Supported Frontmatter Schema
Every article in `src/content/journal/` or `src/content/library/` supports:

```yaml
---
title: "Article Title"
subtitle: "Engaging sub-headline providing clear context."
workId: "unique-work-id"
contentKind: "original" | "curated" | "licensed" | "guest" | "translation"
authorId: "naveen"
author: "Naveen"
language: "en" | "si" | "ta"
topics: [philosophy, teaning, sanctuary]
publishDate: YYYY-MM-DD
updatedDate: YYYY-MM-DD # Optional
readingTime: 4 # in minutes
heroImage: "/images/journal/dawn-highlands.webp" # Optional
audioUrl: "/audio/journal/reflection.mp3" # Optional
license: "CC BY-SA 4.0"
draft: false
---
```

---

## 3. Rich Media Patterns

### A. Featured Figure with Poetic Caption
```html
<figure class="my-10">
  <img 
    src="/images/journal/mist.webp" 
    alt="Mist over central highlands" 
    class="w-full rounded-3xl border border-black/5 shadow-md object-cover max-h-[480px]"
  />
  <figcaption class="mt-3 text-center text-xs italic opacity-60">
    The central highlands at dawn — where conditions for growth are cultivated in stillness.
  </figcaption>
</figure>
```

### B. Pull Quote Callout
```html
<blockquote class="my-8 p-8 rounded-2xl bg-white/50 border-l-4 border-[var(--color-gold)] shadow-xs">
  <p class="text-2xl font-bold italic leading-relaxed">
    "A builder works with stone, but a teacher works with becoming."
  </p>
  <cite class="block mt-4 text-xs uppercase tracking-widest font-bold opacity-60 not-italic">
    — Naveen
  </cite>
</blockquote>
```

### C. Audio Reflection (Spoken Essay)
```html
<div class="my-8 p-6 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-4">
  <span class="text-3xl">🎧</span>
  <div class="flex-1">
    <p class="font-heading text-xs uppercase font-bold text-amber-900 tracking-wider">Listen to the spoken reflection</p>
    <audio controls class="w-full mt-2 h-8">
      <source src="/audio/journal/meaning-of-gurudevi.mp3" type="audio/mpeg" />
    </audio>
  </div>
</div>
```
