# Gurudevi Aliveness & Growth Model
## A Nature-Inspired, Non-Addictive Growth Ecosystem

**Version**: 2.0 — The Psychological Deepening  
**Created**: February 2026  
**Updated**: February 2026 (v2.0 — Motivation Science Layer Added)  
**Status**: Design Specification — Pending Implementation  
**Governed by**: NORTH_STAR.md, TAIL_FIN.md, AGENT_PROMPT_LENS.md

> **v2.0 Note**: This version deepens the philosophical foundation with a motivation science layer (Self-Determination Theory). It adds two critical mechanisms that were missing from v1.0: **Impact Ripples** (Relatedness operationalized) and the **Warm Mirror** (Competence through personal narrative). The Bhumi Model and Whispered Moments from v1.0 are preserved and deepened. The core anti-gamification stance is unchanged — but v2.0 makes a precise distinction between extractive mechanics and genuine human-sourced feedback.

---

## ⚠️ Pre-Read: Why This Document Exists

A tension existed in the codebase before this document was written:

- **The North Star says**: "NO gamification — points, leaderboards, streak shaming are extractive. Add guilt/pressure → REJECT."
- **The existing code has**: `rewards.ts` with `points`, `badges[]`, `addPoints()`, `awardBadge()` — conventional competitive mechanics.
- **The PRD lists**: "Achievement Gallery", "Stats Dashboard", "Resonant Points", "Achievement Leaderboard" for students.

These are in direct conflict. This document resolves that tension by replacing the extractive gamification model with a **nature-inspired aliveness ecosystem** — regenerative, not extractive; discoverable, not grindable; joyful, not pressured.

**The abandoned system** (points + badges as generic strings) should be seen as scaffolding — the container exists, but the contents must align with the philosophy.

---

## 0. THE PSYCHOLOGICAL FOUNDATION

*The science that grounds every design decision in this document.*

### Self-Determination Theory (Deci & Ryan, 1985–present)

The most robust body of research in human motivation identifies three universal psychological needs. When all three are genuinely met, people experience **intrinsic motivation** — the deepest, most sustainable, and most joyful form of human drive:

| Need | What It Means | When Manipulated (Harm) | When Genuinely Met (Health) |
|------|---------------|------------------------|------------------------------|
| **Autonomy** | Acting from genuine choice, not coercion | "Log in daily or lose your streak" | "Your journal is here when you need it" |
| **Competence** | Feeling effective, capable, and growing | "You're ranked #4 — work harder" | "Your students' submission rate grew this term" |
| **Relatedness** | Feeling genuinely connected, mattering to others | "You earned 50 XP for posting!" | "A colleague found your lesson valuable" |

When these needs are **manipulated via extrinsic levers** → controlled motivation → compliance, anxiety, eventual burnout.  
When these needs are **genuinely nourished** → intrinsic motivation → joy, vitality, creativity, staying power.

### The v1.0 Gap — And the Golden Mean

The original model addressed **Autonomy** well (optional everything, no coercion). It began addressing **Competence** (Lotus Life Stages). But it under-designed for **Relatedness** — out of a correct fear of gamification, it swung toward an ascetic model that denied a core human psychological need.

The problem is not "social signals vs. no social signals." The problem is the **type** of social signal:

```
EXTRACTIVE (harm):      "You ranked #4 in your school"           → Comparison, zero-sum, pressure
EXTRACTIVE (harm):      "You have 847 points"                     → Abstract score, no human meaning
EXTRACTIVE (harm):      "3 more badges to complete your set!"     → Addiction loop, collection anxiety

RELATEDNESS (healthy):  "A colleague in your school saved your resource"   → Real human impact
RELATEDNESS (healthy):  "Your question sparked a discussion among 4 teachers"  → Genuine connection
RELATEDNESS (healthy):  "A student's first journal entry happened today"    → Sacred teaching moment
```

**The golden mean is not between "gamification" and "nothing." It is between controlled extrinsic motivation (harmful) and intrinsic motivation supported by genuine social connection (healthy and necessary for human flourishing).**

The three criteria that separate healthy social feedback from extractive gamification:

1. **Human-sourced** — a real person did a real thing (vs. an algorithm computed a number)
2. **Impact-based** — your work touched someone (vs. you are ranked above/below someone)
3. **Private and warm** — offered gently, without broadcast (vs. public, competitive, pressured)

V2.0 adds two mechanisms that honor Relatedness and Competence through this lens:
- **Impact Ripples** → Relatedness: gentle signals when your work genuinely helps a real person
- **The Warm Mirror** → Competence: weekly personal narrative of real impact (story, not score)

### Flow Theory (Csikszentmihalyi)

The state of **flow** — total absorption, effortless engagement — requires:
- Clear goals (not vague aspirations)
- Immediate feedback (not delayed score updates)
- Challenge balanced with skill (not overwhelming, not boring)

For teachers: flow happens when preparing a lesson that clicks, when a classroom discussion takes off, when a student has a breakthrough. The app's role is to **protect conditions for flow**, not to interrupt it with notifications and progress bars.

For students: flow happens when learning feels like exploration, not like performance. The app should amplify curiosity, not quantify it.

### Maslow's Hierarchy — What Teachers Actually Need

A teacher who is:
- Worried about class management (safety/security needs)
- Isolated from colleagues (belonging/love needs)
- Unrecognized for their work (esteem needs)

...does not need gamification. They need the app to address the actual unmet needs:
- **Safety**: Private sanctuary, no surveillance
- **Belonging**: Community that feels warm and welcoming
- **Esteem**: Real recognition from real people (Thuthimal, Impact Ripples, Warm Mirror)

Gamification bypasses these real needs with a dopamine substitute. This model addresses the real needs directly.

---

## 1. PHILOSOPHICAL FOUNDATION

### The One Test (EROI)

Every aliveness feature must pass a single test before it belongs in this app:

```
Does this return more energy to the teacher/student than it consumes?

5 minutes using this feature → teacher feels lighter, connected, seen = ✅ HIGH EROI
5 minutes using this feature → teacher feels pressure, guilt, comparison = ❌ NEGATIVE EROI
```

### What Nature Teaches Us

A lotus does not race other lotus plants. A tree does not feel shame when it blooms later than its neighbor. A forest does not keep score.

Nature grows through:
- **Conditions**, not competition (right soil, sun, water → growth happens naturally)
- **Seasons**, not streaks (rest is part of the cycle, not failure)
- **Interdependence**, not ranking (each tree strengthens the whole forest)
- **Discovery**, not achievement (hidden mushrooms, rare birds — joy in finding, not in counting)

This is the model for Gurudevi's growth system.

### What This IS NOT

```
❌ NOT streak counters ("You've logged in 14 days in a row!")
❌ NOT shame for absence ("You haven't used the app in 5 days")
❌ NOT points for behaviors ("Great! You earned 50 XP for posting")
❌ NOT leaderboards ("You are ranked #3 among teachers in your school")
❌ NOT badges as primary motivation (dopamine loops, collection anxiety)
❌ NOT comparison between users (ever, in any form)
❌ NOT pressure to "complete" the system (there is no completion)
```

> **⚠️ The Critical Nuance (v2.0)**: The prohibition above is specifically against **extractive mechanics** — abstract scores, comparative rankings, and addictive loops. It does NOT extend to genuine human-sourced feedback. *Knowing that a colleague saved your resource* is not gamification — it is basic human dignity and relatedness. *Seeing your own growth narrative in story form* is not a leaderboard — it is self-knowledge. The design principle: impact feedback that is **human-sourced, specific, and warm** is healthy. Feedback that is **algorithmic, comparative, or addictive** is harmful. This distinction is where the golden mean lives.

### What This IS

```
✅ Gentle acknowledgment of presence (you are here, that matters)
✅ Discovery-based delight (hidden moments, not announced achievements)
✅ Seasonal rhythms that mirror natural life cycles
✅ Personal visualization of one's own journey (non-comparative)
✅ Community as garden (each person strengthens the whole)
✅ Thuthimal as the pinnacle of recognition (human gratitude, not algorithmic)
✅ The app itself feeling alive (breathing with time of day, season, user state)
✅ Impact Ripples: warm, human-scale signals when your work genuinely helps someone real
✅ Warm Mirror: opt-in weekly narrative of your actual impact (story, not score)
✅ Competence reflection: seeing your own craft grow in real, human terms (not vs. others)
✅ Genuine relatedness: knowing you matter to specific people in your community (private)
```

---

## 2. THE BHUMI MODEL (ภูมิ — Earth Growth)

*Bhumi means "ground" or "realm of growth" in Sanskrit/Pali — foundational to Buddhist philosophy.*

The growth model has five interconnected layers, like the layers of a living ecosystem:

```
🌸 KAMALA LAYER    (Sky)    — Full Bloom, Thuthimal, Community Recognition
🍃 PATRA LAYER     (Canopy)  — Sharing, Teaching Others, Wisdom Exchange  
🌿 NĀLA LAYER      (Water)  — Rising, Consistent Presence, Learning
🌱 MŪLA LAYER      (Soil)   — Rooting, First Footsteps, Establishing Safety
🌰 BIJAM LAYER     (Mud)    — The Seed, Arrival, Quiet Beginning
```

These are **not levels to "grind through."** They are natural growth stages that the app gently recognizes — like a gardener noticing a seedling has put out its first true leaf. There is no timer, no requirement, no pressure. The app simply notices and offers a quiet moment of recognition.

---

## 3. THE FIVE ALIVENESS DIMENSIONS

Instead of points accumulated across all actions, growth is recognized across **five natural dimensions** — each aligned with what teachers and students actually do in the app:

### Dimension 1: PRESENCE (Rooting)
*Being here without needing to be anywhere else.*

| Signal | What it means | How it's recognized |
|--------|---------------|---------------------|
| Opening the app during difficult periods | Teacher is prioritizing wellbeing | App warms slightly, no notification, just gentle welcome |
| Morning vs evening usage patterns | Teacher/student rhythm | Circadian-aware greeting changes naturally |
| Returning after an absence | Not failure to return — courage to return | "Welcome back" with no shame, just warmth |
| Simply opening the Self section | Private act of self-care | No tracking visible to others. Personal sanctuary. |

**Never**: "You're on a 7-day streak!" or "You broke your streak."  
**Always**: The app is simply present, like a lamp that's always on.

---

### Dimension 2: NOURISHING (Contribution)
*Creating and sharing that which feeds others.*

| Signal | What it means | How it's recognized |
|--------|---------------|---------------------|
| First library resource upload | Teacher sharing wisdom | Lotus petal bloom animation (private, personal) |
| Resource gets "pulled to desk" by others | Teaching reaching someone | Soft ripple effect on the resource card |
| First Joy Jar entry | Teacher acknowledging their own wins | Joy Jar "fills" slightly — visual warmth |
| Completing a lesson plan | Pedagogical care | Quiet checkmark with breath-like expand |
| First manifesto endorsement | School community alignment | Community garden visualization grows one seed |

**Never**: "You uploaded 10 resources! You earned 500 points!"  
**Always**: The act itself is the reward. The app witnesses it softly.

---

### Dimension 3: WITNESSING (Learning)
*Absorbing, reflecting, growing inward.*

| Signal | What it means | How it's recognized |
|--------|---------------|---------------------|
| Reading a resource in the Library | Curiosity and growth | "Smart Shelf" quietly remembers this |
| Completing a Fire Journal entry | Processing difficult emotions | Entry turns to an ember — private, warm |
| Finishing a breathing exercise | Choosing restoration | Subtle lotus petal expansion at session end |
| Daily Mood Lotus check-in | Self-awareness | Weekly "mood garden" shows personal weather |
| Reading the Wisdom Seed | Philosophical nourishment | The seed "sprouts" in the UI — soft animation |

**Never**: Points for reading. Badges for journaling. (These are private acts.)  
**Always**: The app treats private self-care with complete privacy. No tracking to others.

---

### Dimension 4: WEAVING (Connection)
*Building the web that holds the community together.*

| Signal | What it means | How it's recognized |
|--------|---------------|---------------------|
| First community post | Joining the conversation | Welcome into the community hearth visualization |
| Helping another teacher's question | Professional solidarity | A small flame lights in the community garden |
| Sharing a resource with a colleague | Generosity in action | "This resource has been shared 3 times" (count, not ranking) |
| Participating in a Pedagogy Poll | School voice | Poll visualization includes your contribution visually |
| Starting a Staff Circle discussion | Community building | Thread gets a "live" indicator — it's alive because you started it |

**Never**: "Community Champion!" badge with points. Social comparison.  
**Always**: The community feels warm because of the contributions, not competitive.

---

### Dimension 5: BLOOMING (Recognition)
*Being seen and honored — the highest form of growth.*

This dimension is **given by others, never earned by grinding.** It cannot be triggered by the user's own actions.

| Signal | What it means | How it's recognized |
|--------|---------------|---------------------|
| **Thuthimal gift received** | Alumni/student honoring a teacher | The app's highest recognition event. Lotus bloom animation. Profile glows. |
| Principal sends a "Gratitude Gift" to a teacher | Institutional recognition | Private notification: warm, sacred, no public broadcast |
| 10+ teachers endorse the school manifesto | Community alignment | School garden visualization blooms collectively |
| First student submits work to a teacher | Trust established | Teacher gets a quiet "Your classroom is alive" moment |

**Thuthimal is the pinnacle of this dimension.** It represents the sacred bond between teacher and student across time — a past student honoring their teacher years later. This is the most powerful recognition event in the app, and it must remain human-sourced, not algorithmic.

---

### THE IMPACT RIPPLE (Relatedness Made Visible)

*The mechanism that bridges private action and genuine human connection — without gamification.*

An **Impact Ripple** is a warm, private signal delivered to a contributor when their work genuinely resonates with another person in their community. It is the operationalization of **Relatedness** in the Bhumi Model — not a metric, not a score, but a soft echo of real human impact.

**Design Principles:**
- Each ripple is specific to **one interaction** — never aggregated into "you have 47 ripples!"
- Language is warm and human, never clinical or transactional
- The actor is **never identified by name** (privacy by default; name visible only if actor chooses to share)
- Optional receipt — can be turned off in Self settings
- Delivered as a gentle, batched notification (3–4× per day max), never an interrupt
- NOT a score, NOT a metric, NOT tracked in any visible counter

**Ripple Types and Language:**

| What Happened | English | Sinhala |
|---|---|---|
| Colleague saved your resource | "A teacher in your school kept your resource close" | "ඔබේ පාසලේ ගුරු හිතෙකු ඔබේ දෙය ළඟ රැකි ගත් ය" *(pending native review)* |
| Your post started a reply thread | "Your reflection opened a conversation" | "ඔබේ සිතුවිල්ල කතාවකට දොර හැරියා" |
| Student's assignment graded with written feedback | "Your teacher thought carefully about your work" | "ඔබේ ගුරුතුමා ඔබේ කාර්යයේ ගැඹුරට ගිය ය" |
| Student accessed your lesson material | "A student is learning from what you prepared" | "ඔබ සූදාන් කළ දෙය දරුවකු ඉගෙන ගනී" |
| Colleague endorsed your manifesto | "A fellow teacher endorsed your vision" | "සහ ගුරු හිතෙකු ඔබේ දෘෂ්ටිය අනුමත කළ ය" |
| Your shared resource reached 5 unique readers | "Five people in your school have learned from this" | "ඔබේ පාසලේ ජනයා 5 දෙනෙකු මෙයින් ඉගෙන ගත්හ" |

> ⚠️ **Sinhala/Tamil Translation Note**: All Sinhala (si) and Tamil (ta) strings in this document are draft proposals and **must be reviewed by a native Sri Lankan educator** before production use. Natural idiomatic expression is more important than literal accuracy — see `FUTURE_ROADMAP.md` localization notes for guidance.

**What Impact Ripples Are NOT:**
- ❌ NOT a counter badge ("5 ripples!")
- ❌ NOT visible on any public profile
- ❌ NOT a "top contributors" leaderboard
- ❌ NOT accumulated into any score
- ❌ NOT sent in real-time (batched to prevent anxiety/addiction)

**What Impact Ripples ARE:**
- ✅ A quiet echo of real human presence in your work
- ✅ The knowledge that you are not working in a vacuum
- ✅ Warm, compassionate language — never clinical, never corporate
- ✅ The SDT need for Relatedness, met with dignity

**Implementation Note**: Ripples are delivered via the same notification system as other app events, using the `impact_ripples` table (see Section 11). The UI notification uses the Sanctuary notification style — vellum background, ink text, no bright colors. Tapping the notification shows which specific resource/post generated it (so the user can see the context), but never shows who acted on it unless the actor opted into being identified.

---

### THE WARM MIRROR (Competence Through Story)

*A weekly personal narrative of your real impact — opt-in, private, story-format, never a dashboard.*

The **Warm Mirror** is the teacher's (or student's) weekly reflection on what they actually did — framed as a human story, not a performance summary. It lives in the Self tab as an optional, quietly glowing section titled *"This past week..."*

**What It Looks Like (Teacher — English sample):**

> *"This past week in your sanctuary:*
> *You were present on 4 days — including a Tuesday evening when the day must have been long.*
> *Two colleagues found something valuable in what you shared. One of them came back to it twice.*
> *You wrote careful feedback for 8 of your students. They each received more than a mark.*
> *Your classroom in Grade 9 Science has been your home for 4 months now.*
> *You showed up. That is not a small thing."*

**What It Looks Like (Teacher — Sinhala sample):**

> *"ඔබේ ශාලාවේ පසුගිය සතිය:*
> *ඔබ 4 දිනක් ළඟ සිටියා — අඟහරුවාදා සන්ධ්‍යාවකද, දිනය දිගු ව ඇති අවස්ථාවේ.*
> *ඔබ බෙදාගත් දෙයෙහි ගුරු දෙදෙනෙකු වටිනා දෙයක් දකිනු ලැබිය. ඒ කෙනෙකු දෙවරක් ආපසු ගිය.*
> *ඔබ 8 දරුවකුට සැලකිලිමත් ප්‍රතිචාර ලිව්වා. ඔවුන් ලකුණකට වඩා ලැබිය.*
> *ඔබ ගෙනය. එය කුඩා දෙයක් නොවේ."* *(pending native review)*

**What It Looks Like (Quiet week — compassionate sample):**

> *"This week was a quiet one.*
> *You opened the app twice. That is still twice.*
> *Rest is part of the rhythm. The sanctuary is here when you return."*

**Design Rules:**
1. **Generated weekly**, available Sunday evening — readable at the start of a new week
2. **Entirely opt-in** — teacher enables "Warm Mirror" in their Self section settings
3. **Never pushed as notification** — always in-app, discoverable, never demanding attention
4. **Language generated from real data** — never fabricated or hallucinated
5. **If a quiet week**: mirror is compassionate, never guilting ("This week was quiet" not "You only showed up twice")
6. **Never mentions negative actions** — only observes what DID happen with care
7. **Completely private** — not visible to Principal, not exportable by default (export requires teacher action)
8. **No numbers as headline** — "You were present 4 days" is context, not a score. The narrative wraps numbers in meaning.

**Minimum Data Required (all from existing tables):**
- Days with any app activity (from `growth_events` timestamps)
- Impact Ripples received this period (from `impact_ripples` table)
- Assignments graded with written feedback (from classroom DB)
- Resources others interacted with (from `impact_ripples` + library analytics)
- Self-care actions taken (mood check-ins, breathing, journal entries from `growth_events`)

**The Warm Mirror is the Competence dimension made human.** It does not tell a teacher they "achieved" anything. It tells them who they ARE based on what they did.

---

## 4. WHISPERED MOMENTS (Hidden Discovery System)

Inspired by the app's "Punctum" philosophy — the piercing detail that stops you unexpectedly.

**Whispered Moments** are small, surprise discoveries — not achievements you grind toward, but moments the app offers when conditions feel right. They are:

- **Never announced in advance** (no "badge collection" to fill)
- **Never comparative** (no one else sees what you've discovered)
- **Always contextually appropriate** (offered in the right emotional moment)
- **Delightful to find, fine to miss** (missing them causes no guilt)

### Sample Whispered Moments

**For Teachers:**

| Moment Name (Internal) | Trigger Condition | Experience |
|------------------------|-------------------|------------|
| *First Light* | First time opening app in the morning between 5–7am | Sunrise gradient blooms on the welcome card. No text. |
| *The Quiet Hour* | Using the app after 9pm | App breathes slower, warmer, glow deepens. Soft text: "ගුරු දෙවි, thank you for still being here." |
| *Root Day* | First week anniversary of joining | Lotus root animation beneath the profile card. No fanfare. |
| *The First Offering* | First library resource that another user reads | Resource card emits a single soft ripple. No notification. Just visible if looking. |
| *Still Water* | Completed 5 consecutive mood check-ins (any mood, no pressure) | The mood lotus shows still, clear water in its animation. Calm acknowledgment. |
| *The Caring Teacher* | Graded 10+ assignments with written feedback (not just marks) | A small golden ember appears in the classroom header. Private. |
| *Storm Holder* | Using the Fire Journal 3+ times in one week | Fire Journal icon becomes a warm amber for that day. Private sanctuary. |
| *Weaver* | First time two colleagues both mention reading the same shared resource | A gentle thread appears between their avatars in the Community view. |
| *The Thousand* | School's total resources cross 100 items in Library | Library header blooms briefly. Collective achievement. |

**For Students:**

| Moment Name (Internal) | Trigger Condition | Experience |
|------------------------|-------------------|------------|
| *First Breath* | First completed breathing exercise | Breathing animation expands and holds one extra beat |
| *The Curious One* | Reading 5 different library subjects | A small compass appears in the library header — explorer spirit |
| *Dawn Learner* | Studying before 7am | Morning gradient on the timetable card |
| *Deep Root* | Same classroom for 3+ months | A subtle lotus root grows below the classroom card |
| *The Gift* | First assignment graded with positive written feedback | Teacher's feedback glows warm amber for 24 hours |

**Implementation Note**: These are stored as `whispered_moments` in the database, not in `user_rewards`. They are never visible in bulk — only experienced in the moment. The user cannot browse "all my whispered moments" (this would create collection anxiety). They are simply experienced, then fade into memory.

---

## 5. THE LOTUS LIFE STAGE VISUALIZATION

The app's primary visual growth representation for **personal progress** (not comparative ranking).

### The Visualization

A living lotus illustration that changes state over time — not based on points, but on **natural engagement patterns**:

```
State 0: Bijam (Seed)       → User just joined. Small seed in dark mud.
State 1: Mūla (Root)        → User has engaged with core features. Root threads appear.
State 2: Nāla (Stem)        → Consistent usage over 2+ weeks. Stem rising through water.
State 3: Patra (Leaf)       → User has contributed to community. Leaf unfurling.
State 4: Kamala (Bud)       → User has supported others + personal growth visible. Bud forming.
State 5: Pūrṇa Kamala       → Full bloom. Active in all 5 aliveness dimensions.
          (Full Lotus)
```

**Rules for this visualization:**
- State only advances forward **naturally over time** (not by grinding specific actions)
- State NEVER regresses (a wilted lotus is not the Gurudevi aesthetic)
- The visualization is in the **Self tab only** — private, never on a public profile
- Animation is breath-like, organic — NOT a loading bar or progress percentage
- There is NO text telling the user what stage they're at (they simply see the lotus)

### Technical Note on Transition Triggers

Stage transitions are detected server-side via `user_growth_state` table. The criteria are **intentionally approximate and lenient** — designed to trigger on natural engagement, not metric grind:

```
Bijam → Mūla:    Completed profile + opened all 5 tabs at least once
Mūla → Nāla:     Used app on 5+ separate days + completed first core action
Nāla → Patra:    Contributed to community OR library at least once
Patra → Kamala:  Active across 3+ aliveness dimensions over 30 days
Kamala → Full:   Thuthimal received OR recognized by principal OR 90-day sustained engagement
```

---

## 6. THE MEMORY GARDEN (Personal Journey View)

A personal, private visualization replacing the conventional "achievements" gallery.

### What It Shows

Instead of a grid of badges, the Memory Garden is a **living illustration** — an abstract garden that visually reflects the teacher's/student's journey:

- **Seeds** represent the earliest Whispered Moments (small, sprouting)
- **Plants** represent sustained dimensions of engagement
- **Flowers** represent significant recognition events (Thuthimal, milestones)
- **Paths** represent exploration journeys (Library, Self, Community visits)
- **Weather** reflects the current mood pattern (calm, stormy, radiant)

### Principles

1. **It looks different for every person** — no two gardens are the same
2. **It reflects the WHOLE person**, not just their "productivity"
3. **It has seasons** — it changes with the actual time of year (Sri Lankan seasonal aesthetics)
4. **It cannot be "completed"** — the garden always has room to grow
5. **It is never empty** — even on day 1, there is a seed, and seeds are beautiful

### What It Replaces

| Old (Remove) | New (Replace With) |
|---|---|
| `AchievementGallery.tsx` showing badge strings | Memory Garden visualization |
| `UserStatsCard.tsx` showing points count | Lotus Life Stage visualization |
| `points` number in `user_rewards` | Invisible growth signals across 5 dimensions |
| Badge strings array in DB | `whispered_moments` + `growth_events` tables |
| "Achievement Leaderboard" (student) | Personal Memory Garden (non-comparative) |

---

## 7. THE COMMUNITY GARDEN (Collective Aliveness)

The community isn't a feed to scroll — it's a **living garden** where each member contributes to the whole.

### Visualization Concept

The Community tab's "hearth" visualization shows an abstract garden where:
- Each active community member is represented as a small plant
- Recent activity causes gentle growth animations
- Shared resources create "flowering" on relevant members
- A Thuthimal event causes a rare, school-wide lotus bloom animation

### Rules

- No individual scores visible in community view (only collective health)
- The garden looks "healthy" when the community is active (lush, green)
- The garden looks "resting" during quieter periods (autumn aesthetic — still beautiful)
- Teachers who received Thuthimal have a permanent lotus flower in the garden
- No competitive ranking, ever

---

## 8. CIRCADIAN & SEASONAL ALIVENESS

The app already has Temporal Phase logic (Dawn → Day → Dusk → Night). This should be **extended and deepened**:

### Daily Phases (already partially implemented)

| Phase | Time | App Feeling | Growth System Effect |
|-------|------|-------------|---------------------|
| **Dawn** | 5–7am | Gentle awakening, warm pinks | "First Light" Whispered Moment possible |
| **Morning** | 7–9am | Alert, focused, saffron | Daily Mood Lotus invitation appears |
| **Day** | 9am–3pm | Active, sage greens | Full-energy UI, all features accessible |
| **Golden Hour** | 3–5pm | Warm, winding down | "Tomorrow Snapshot" gently surfaces |
| **Dusk** | 5–7pm | Softening, amber tones | Wind-Down ritual invitation |
| **Night** | 7–10pm | Deep, vellum deepens | Fire Journal and reflection features foregrounded |
| **Late Night** | 10pm+ | Warm, protective dimming | App breathes slower. "ගුරු දෙවි, rest now" energy |

### Seasonal Layer (new)

Sri Lanka has distinct seasons aligned with the monsoon calendar. The app should reflect this:

| Season | Approx. Months | Visual Expression |
|--------|----------------|-------------------|
| **Yala (SW Monsoon)** | May–Sept | Lush, deep greens, rain sounds (ambient) |
| **Maha (NE Monsoon)** | Oct–Jan | Cool blues and sage, reflective |
| **Inter-Monsoon** | Feb–Apr, Oct | Transitional blends, energetic |
| **Vesak** | May full moon | Brief lotus bloom celebration (community-wide) |
| **Sinhala/Tamil New Year** | April 13–14 | App-wide warm sunrise gradient shift |

This layer is **purely aesthetic** — it changes how the app *feels*, not what it *requires* of the user. A teacher in December experiences the app in slightly different light tones than in June.

---

## 9. WHAT EXISTS, WHAT NEEDS REPAIR, WHAT IS ABANDONED

### Status Audit

| Feature | Location | Current State | Recommendation |
|---------|----------|---------------|----------------|
| `rewardsAPI` with `points` + `badges` | `packages/core/src/api/rewards.ts` | 🟡 Misaligned with philosophy | **Repurpose**: Transform `badges` into `whispered_moments` events. Remove visible `points` counter. Keep backend structure but rename semantically. |
| `AchievementGallery.tsx` | `src/components/profile/AchievementGallery.tsx` | 🟡 Exists but philosophically wrong | **Transform**: Replace gallery of badge strings with Memory Garden visualization. |
| `UserStatsCard.tsx` with points display | `src/components/profile/UserStatsCard.tsx` | 🟡 Shows "points" counter | **Transform**: Replace points with Lotus Life Stage visual. Remove numerical score. |
| `sacredMissions.ts` (Community manifestos) | `packages/core/src/api/sacredMissions.ts` | 🟢 Aligned — this IS the Gratitude Economy | **Keep and expand**: Manifesto endorsements are the collective growth mechanism. |
| `AchievementLeaderboard` (Student PRD) | Not yet implemented | 🔴 Designed but NOT built | **Do Not Build**: Replace with personal Memory Garden. Leaderboard violates North Star. |
| Mood Lotus check-in | `packages/self/` | 🟡 Partial — logic mock | **Wire and complete**: Central to Witnessing dimension. |
| Joy Jar | `packages/self/` | 🟡 Partial | **Complete**: Core Presence dimension feature. |
| Thuthimal | `packages/core/src/api/thuthimal.ts` | 🟢 DB + badge exists | **Expand**: Make the Thuthimal receipt the highest Blooming event in the system. |
| Living Theme (temporal phases) | Multiple packages | 🟡 Partial | **Deepen**: Add seasonal layer on top of circadian layer. |
| `feature_usage_log` table | `packages/core` | 🟢 Exists | **Repurpose for growth signals** — not "usage metrics" but "aliveness dimensions" |
| Impact Ripple system | Not yet built | 🔴 Pending | **Build in Phase 2**: `impact_ripples` table + trigger logic + batched delivery. The Relatedness layer. |
| Warm Mirror | Not yet built | 🔴 Pending | **Build in Phase 2**: Opt-in weekly narrative from `WarmMirrorDataPoints`. Lives in Self tab. |

### Fully Abandoned / To Be Removed

| Item | Why Abandoned | Recommendation |
|------|---------------|----------------|
| Points as visible number | Violates EROI — induces "score anxiety" | Remove from UI. Keep data for internal analytics only (never shown to user). |
| Badge string array | Generic strings like "Sanctuary Seeker" mean nothing in Sri Lankan context | Replace with culturally resonant Whispered Moments with Sinhala/Tamil names |
| Student "Achievement Leaderboard" | Directly contradicts North Star Section 5: "Never: Gamification-First" | Do not implement. Replace with personal Memory Garden. |
| Streak counter (any form) | North Star says streak shaming is explicitly negative EROI | Never implement. Presence ≠ streak. |

---

## 10. IMPLEMENTATION ROADMAP

### Phase 1 (Alpha — March 2026): Foundation
*These changes heal the misalignment before users see the app.*

1. **Remove points display from `UserStatsCard`** — replace with Lotus Life Stage (static seed visual initially)
2. **Rename/repurpose `rewards.ts`** → `growthSignals.ts` — same structure, new semantic meaning
3. **Add `user_growth_state` table** to Supabase with Bhumi stage enum
4. **Wire Mood Lotus check-in** to Witnessing dimension signal
5. **Complete Joy Jar** basic functionality (Presence dimension)
6. **Add temporal phase depth** — ensure Dawn/Day/Dusk/Night feel meaningfully different

### Phase 2 (Beta — May 2026): Aliveness + Relatedness
*These bring the growth model to life — including the v2.0 mechanisms.*

7. **Build Memory Garden visualization** for Profile self-view (replaces Achievement Gallery)
8. **Implement 5 core Whispered Moments** for teachers (listed in Section 4)
9. **Build Lotus Life Stage animation** with 6 visual states
10. **Implement Community Garden** abstract visualization
11. **Wire Thuthimal receipt** as the Blooming dimension's apex event
12. **Add 3 seasonal themes** to Living Theme system (Yala / Maha / Transitional)
13. **Build Impact Ripple system** — `impact_ripples` table + trigger logic + notification delivery
14. **Build Warm Mirror** — weekly narrative generation from `WarmMirrorDataPoints`; opt-in toggle in Self settings

### Phase 3 (v1.0 — Launch): Full Ecosystem
*The complete living app.*

15. **Full Whispered Moments set** (all roles, all contexts)
16. **Sri Lankan cultural calendar integration** (Vesak, New Year, monsoon seasons)
17. **Memory Garden seasonal evolution** — garden looks different in different seasons
18. **Cross-school aliveness signals** (when schools are connected, gardens can "see" each other's light)
19. **Thuthimal public Wall of Honor** (community-visible, teacher-controlled)
20. **Warm Mirror Sinhala/Tamil narrative quality** — review with Sri Lankan educators for natural idioms
21. **Actor opt-in for Impact Ripples** — allow colleague to choose to be identified in a ripple ("A teacher named Priya saved this")

---

## 11. DATABASE DESIGN

### New Tables Required

```sql
-- Replaces the spiritual poverty of badge strings
CREATE TABLE user_growth_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  bhumi_stage TEXT NOT NULL DEFAULT 'bijam' 
    CHECK (bhumi_stage IN ('bijam', 'mula', 'nala', 'patra', 'kamala', 'purna_kamala')),
  presence_signals INT DEFAULT 0,
  nourishing_signals INT DEFAULT 0,
  witnessing_signals INT DEFAULT 0,
  weaving_signals INT DEFAULT 0,
  blooming_signals INT DEFAULT 0,
  last_seen_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Whispered Moments — private discovery events
CREATE TABLE whispered_moments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  moment_key TEXT NOT NULL, -- internal identifier, e.g., 'first_light', 'still_water'
  moment_name_si TEXT, -- Sinhala name of the moment
  moment_name_ta TEXT, -- Tamil name of the moment
  moment_name_en TEXT, -- English name
  experienced_at TIMESTAMPTZ DEFAULT NOW(),
  -- Never shown in bulk. Only surfaced in the moment of discovery.
  UNIQUE(user_id, moment_key) -- Each moment experienced once (or reset intentionally)
);

-- Growth events log (for internal analytics — never shown to user)
CREATE TABLE growth_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  dimension TEXT NOT NULL 
    CHECK (dimension IN ('presence', 'nourishing', 'witnessing', 'weaving', 'blooming')),
  event_type TEXT NOT NULL, -- e.g., 'mood_checkin', 'resource_upload', 'joy_jar_entry'
  event_metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Impact Ripples — the Relatedness feedback layer (v2.0)
-- Each row = one warm signal to a contributor when their work genuinely helped someone.
-- Privacy: actor_user_id is stored but NEVER exposed in UI unless actor opts in.
CREATE TABLE impact_ripples (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  ripple_type TEXT NOT NULL CHECK (ripple_type IN (
    'resource_saved',      -- A colleague saved a resource you created
    'resource_read',       -- Anonymous threshold: your resource reached N unique readers
    'post_sparked',        -- Your community post received at least one genuine reply
    'lesson_accessed',     -- A student accessed your lesson material
    'feedback_given',      -- Someone wrote thoughtful feedback on your work
    'manifesto_endorsed',  -- Someone endorsed a manifesto you created
    'circle_joined'        -- Someone joined a community circle you started
  )),
  school_id UUID REFERENCES schools(id),
  -- Actor identity: stored privately, surfaced only if actor explicitly opts into being known
  actor_user_id UUID REFERENCES users(id),
  is_actor_visible BOOLEAN DEFAULT FALSE,
  -- The original contribution that generated this ripple
  source_entity_type TEXT CHECK (source_entity_type IN ('resource', 'community_post', 'lesson', 'manifesto', 'circle')),
  source_entity_id UUID,
  -- Pre-rendered warm message in all three languages (generated at creation time)
  warm_message_si TEXT,
  warm_message_ta TEXT,
  warm_message_en TEXT,
  -- Delivery state
  delivered BOOLEAN DEFAULT FALSE,
  delivered_at TIMESTAMPTZ,
  -- Batch window: ripples are batched and delivered max 3-4x per day
  batch_window TEXT, -- 'morning' | 'afternoon' | 'evening' | 'night'
  created_at TIMESTAMPTZ DEFAULT NOW()
);
-- Partial index on undelivered ripples for the common query pattern (fetching pending delivery)
CREATE INDEX idx_impact_ripples_pending ON impact_ripples(recipient_user_id, created_at DESC)
  WHERE delivered = FALSE;
-- Full index for historical queries (analytics, Warm Mirror aggregation)
CREATE INDEX idx_impact_ripples_recipient ON impact_ripples(recipient_user_id, created_at DESC);
```

### Existing Tables to Modify

```sql
-- user_rewards: Keep structure, change semantic meaning of badges
-- badges[] becomes internal_signals[] — never shown directly to user
-- points becomes growth_score (internal analytics, never user-facing)
-- Add migration to rename column comments
```

---

## 12. DESIGN TOKENS & VISUAL LANGUAGE

The growth system introduces new visual states, all using existing token vocabulary:

| Growth Event | Visual Treatment | Token(s) |
|---|---|---|
| Lotus Life Stage advance | Breath-expand → bloom animation | `glow`, `saffron`, `FadeInDown 500ms` |
| Whispered Moment discovery | Single pulse of warmth, fade | `glassBg`, `dalu`, stagger 150ms |
| Joy Jar entry | Jar fills, warm amber glow | `ember`, haptic pulse |
| Thuthimal receipt | Full-screen lotus bloom (rare, sacred) | `saffron`, `glow`, `BlurView ≥36` |
| Community Garden active | Lush, pulse of sage green | `dalu`, slow pulse animation |
| Late night / protective mode | Dimmer vellum, slower breathing | `ink` at 0.7 opacity, pulse rate ÷2 |
| Seasonal transition | Gradient shift over 24-hour fade | Interpolated `vellum` → seasonal tint |
| Mood Lotus state | Color shifts with check-in | `mood_calm`, `mood_storm`, `mood_radiant` (new tokens needed) |
| **Impact Ripple received** | Soft vellum notification, warm text, single haptic | `vellum`, `ink`, `ember` for ripple icon |
| **Warm Mirror opened** | Gentle fade-in of narrative text, breath-timing on lines | `FadeInDown 300ms` staggered per sentence, `dalu` |

### New Semantic Tokens Needed

```typescript
// In packages/design-tokens/src/
mood_calm: '#8BBF7A',       // Dalu green — peaceful presence
mood_storm: '#D4843A',      // Saffron — processing difficulty  
mood_radiant: '#F0C060',    // Golden — flourishing
mood_winter: '#7A9BBF',     // Quiet blue — contemplative rest
season_yala: '#5A8A4A',     // Deep monsoon green
season_maha: '#6A88AA',     // Cool monsoon blue
season_new_year: '#E8A040', // Sinhala New Year gold
growth_seed: 'rgba(139,191,122,0.3)',    // Bijam — barely there
growth_bloom: 'rgba(212,132,58,0.8)',   // Purna Kamala — radiant
```

---

## 13. THE GURUDEVI GROWTH CREED

*To be read before any implementation work on this system.*

> We do not build growth mechanics. We cultivate growth conditions.
>
> A teacher who opens this app at midnight — exhausted, still caring — does not need points. She needs to feel seen.
>
> A student who finishes his first assignment does not need a leaderboard rank. He needs a quiet moment where the app says: *you did something real today.*
>
> But here is what v1.0 missed:
>
> *The lotus does not race other lotuses. But it does exist in an ecosystem. It is nourished by the water that flows from the roots of every other plant nearby. It does not compete with them. But it is not alone.*
>
> Teachers are not ascetics. They are human beings embedded in communities of other human beings. They want to know that their work reaches real people. They want to feel the warmth of genuine appreciation — not an algorithm's substitute for it.
>
> When a past student sends a Thuthimal gift, that teacher weeps — not because of points, but because a human being, years later, remembers that they were cared for.
>
> **Our job is to design for the full human being:**
> - Their private inner life (Presence, Witnessing, the Lotus growing silently)
> - Their craft and competence (Nourishing, the Warm Mirror reflecting who they are)
> - Their deep need to belong and to matter (Relatedness, the Impact Ripple, the Community Garden)
>
> The golden mean is not between "gamification" and "silence."
> The golden mean is between **extractive mechanics** and **genuine human connection**.
>
> We build for the second kind. Always.
>
> **ජයවේවා** 🪷

---

## APPENDIX A: Whispered Moment Full Catalog (Design Stage)

*Pending cultural review with Sri Lankan educators before implementation.*

### Teacher Moments

| Key | Sinhala Name | Trigger | Experience |
|-----|-------------|---------|------------|
| `first_light` | ප්‍රථම රශ්මිය | First app open 5–7am | Sunrise gradient |
| `quiet_hour` | නිශ්ශබ්ද පැය | App use after 9pm | Slower breathing, warm message |
| `root_day` | මූල දිනය | 7-day anniversary | Lotus root animation |
| `first_offering` | ප්‍රථම දානය | First library resource read by another | Soft ripple on resource |
| `still_water` | නිශ්චල දිය | 5 consecutive mood check-ins | Still water in lotus animation |
| `caring_teacher` | සැලකිලිමත් ගුරුවරිය | 10+ graded with written feedback | Golden ember in classroom header |
| `storm_holder` | කුළු ගෙන සිටින්නා | Fire Journal 3x in one week | Warm amber journal icon |
| `the_seeker` | සොයන්නා | All 5 tabs explored in first week | Compass appears in Library header |
| `school_elder` | ගුරු ආදරණීය | 90 days in the app | Ancient tree appears in Memory Garden |
| `thuthimal_received` | තුතිමල් ලැබීය | Thuthimal gift received | Full-screen lotus bloom 🪷 |

### Student Moments

| Key | Sinhala Name | Trigger | Experience |
|-----|-------------|---------|------------|
| `first_breath` | ප්‍රථම හුස්ම | First breathing exercise complete | Breath animation holds extra beat |
| `curious_one` | කුතුහලකාරී | 5 different Library subjects explored | Small compass in Library |
| `dawn_learner` | පාන්දර ඉගෙනුම | App used before 7am | Morning gradient on timetable |
| `deep_root` | ගැඹුරු මූලය | Same classroom for 3+ months | Lotus root below classroom card |
| `gift_received` | තෑගි ලැබීය | First assignment with positive feedback | Teacher's feedback glows amber 24hr |
| `first_voice` | ප්‍රථම හඬ | First community post | Small flame lights in community |

---

## APPENDIX B: Growth Signal → Dimension Mapping

```typescript
// packages/core/src/growth/dimensionMap.ts (proposed)

export const GROWTH_SIGNAL_MAP: Record<string, GrowthDimension> = {
  // PRESENCE signals
  'app_opened': 'presence',
  'mood_checkin': 'presence',
  'breathing_exercise_complete': 'presence',
  'joy_jar_entry': 'presence',
  'fire_journal_entry': 'presence',

  // NOURISHING signals
  'resource_uploaded': 'nourishing',
  'lesson_plan_created': 'nourishing',
  'assignment_created': 'nourishing',
  'wisdom_seed_shared': 'nourishing',

  // WITNESSING signals
  'resource_read': 'witnessing',
  'wisdom_seed_read': 'witnessing',
  'reflection_written': 'witnessing',
  'goal_set': 'witnessing',

  // WEAVING signals
  'community_post_created': 'weaving',
  'manifesto_endorsed': 'weaving',
  'resource_shared': 'weaving',
  'colleague_helped': 'weaving',

  // BLOOMING signals
  'thuthimal_received': 'blooming',
  'principal_recognition': 'blooming',
  'community_milestone_reached': 'blooming',
};

// ─────────────────────────────────────────────────────────────────────────────
// IMPACT RIPPLE trigger map (v2.0)
// Each entry defines: what user action creates a ripple for the ORIGINATOR
// ─────────────────────────────────────────────────────────────────────────────
export type RippleType =
  | 'resource_saved'
  | 'resource_read'
  | 'post_sparked'
  | 'lesson_accessed'
  | 'feedback_given'
  | 'manifesto_endorsed'
  | 'circle_joined';

// Maps a user action to: (1) who gets a ripple, (2) what type
export const IMPACT_RIPPLE_TRIGGER_MAP: Record<string, {
  recipientEntity: 'resource_creator' | 'post_author' | 'manifesto_creator' | 'circle_creator';
  rippleType: RippleType;
  minThreshold?: number; // only fire ripple after N occurrences (prevents noise)
}> = {
  'resource_pull_to_desk':    { recipientEntity: 'resource_creator', rippleType: 'resource_saved' },
  'resource_opened':          { recipientEntity: 'resource_creator', rippleType: 'resource_read', minThreshold: 5 },
  'community_reply_created':  { recipientEntity: 'post_author',      rippleType: 'post_sparked' },
  'lesson_material_opened':   { recipientEntity: 'resource_creator', rippleType: 'lesson_accessed' },
  'assignment_feedback_given':{ recipientEntity: 'resource_creator', rippleType: 'feedback_given' },
  'manifesto_endorsed':       { recipientEntity: 'manifesto_creator',rippleType: 'manifesto_endorsed' },
  'circle_joined':            { recipientEntity: 'circle_creator',   rippleType: 'circle_joined' },
};

// ─────────────────────────────────────────────────────────────────────────────
// WARM MIRROR data sources (v2.0)
// Each field maps to a query that gathers data for the weekly narrative
// ─────────────────────────────────────────────────────────────────────────────
export interface WarmMirrorDataPoints {
  // Presence
  days_present: number;           // distinct calendar days where at least one growth_event of any type was recorded
  quiet_moments: number;          // count of: mood_checkin + breathing_exercise_complete + fire_journal_entry
  // Nourishing / Impact
  ripples_received: number;       // impact_ripples delivered this period
  assignments_with_feedback: number; // assignments where feedback text length > 20 chars
  resources_that_reached_others: number; // ripple_type = resource_saved | resource_read
  // Weaving
  posts_that_sparked: number;     // ripple_type = post_sparked received
  // Long-running context
  days_since_joined: number;      // for "your classroom has been your home for X months"
  primary_classroom_name?: string;
}
```

---

*This document is part of the Gurudevi Core constellation. Governed by NORTH_STAR.md. Never build growth mechanics that contradict the Three Sacred Laws.*

*From mud, through water, to full bloom. 🪷*
