# EDLOVE.ORG — 06 DOMAIN III
## Gurudevi Engine | "How does vision become practice?"

**Phase 1 Target**: v1.0 (Fully realized at launch)  
**URL**: `edlove.org/gurudevi`  
**Accent Color**: Ember Orange `#E07A5F`  
**Last Updated**: February 3, 2026

---

## PURPOSE

Gurudevi is the bridge. The place where philosophy meets the classroom. Where the paradigm shift (Domain I) and the ground truth (Domain II) converge into an actual tool that teachers can USE — TODAY, in the PRESENT government schooling system.

This domain on edlove.org is the **portal** to Gurudevi. It explains what Gurudevi is, why it exists, how it works, and how to access it.

When someone arrives here, they should feel: *"This isn't just another app. This is something that understands the pressures I face. And it's here to help."*

---

## WHAT GURUDEVI IS

Gurudevi is a **mobile application** (currently in development) designed as an **Educational Ecology Support System** operating at the teacher and school level.

The name means "Divine Teacher" — not because the app is divine, but because it honors the sacred nature of teaching as care work (see 01_PHILOSOPHY).

### Core Identity
- **For**: Teachers and schools within the present Sri Lankan government schooling system
- **Platform**: Mobile app (iOS + Android)
- **Status**: In development
- **Philosophy**: Operationalizes the edlove vision. Makes educational ecology thinking practical and usable for working teachers.

### What It Does (Educational Ecology Support)
Gurudevi supports teachers in seeing and working with education as an **ecology** — a living system with interconnected parts — rather than as a set of isolated tasks.

Key functions (to be expanded as app develops):
- **Ecological awareness**: Helps teachers see the system they're working within — the pressures, the enabling conditions, the connections
- **Support system**: Provides teachers with tools, resources, and frameworks to navigate their reality with more clarity
- **School-level tools**: Not just individual teacher support — tools that work at the school level, for collective change
- **Pressure mapping**: Connected to Devneevma Pressure Theory (see Domain VI) — helps teachers understand and respond to the systemic pressures they face

### What Makes It Different From Other EdTech
Most education apps tell teachers what to do. Gurudevi helps teachers **see more clearly** — the system they're in, the forces acting on them, and the space they actually have to make meaningful change.

It is not a lesson planner. It is not a grading tool. It is an **ecology lens** for education.

---

## THE EDLOVE.ORG PORTAL PAGE

This is what lives at `edlove.org/gurudevi`. It is the entry point — the landing page that introduces Gurudevi to visitors coming from the rest of edlove.

### Page Structure

**Hero Section:**
```
[Ember orange warmth. Grounded, practical, but alive.]

"Gurudevi"
"The Divine Teacher"

"A tool for educators who want to
 see their work more clearly —
 and act from that seeing."

[CTA: "Learn More" — scrolls down]
[CTA: "Get Early Access" — email signup / app store link when ready]
```

**Philosophy Section:**
- Why Gurudevi exists (connection to edlove vision)
- Education as ecology — what that means in practice
- How Gurudevi operationalizes this thinking
- Short, warm, clear. Not corporate.

**What It Does Section:**
- Feature overview (visual, card-based)
- Each feature: name + one-line description + simple illustration
- Honest about what it does AND what it doesn't do

**Who It's For Section:**
- Teacher stories (or archetypes): "Are you a teacher who..."
- Shows the REAL pressures teachers face
- "Gurudevi is for you"

**The App Section:**
- Screenshots / mockups of the mobile app (when available)
- Demo video walkthrough (when available)
- App store links (when app is ready)
- If not ready: "Beta signup — be among the first teachers to try it"

**The Vision Section:**
- How Gurudevi fits into the larger edlove ecosystem
- "This is one piece of a bigger picture"
- Links to Domain I (paradigms), Domain II (Sri Lanka), Domain VI (research)

---

## INTEGRATION WITH EDLOVE.ORG

### Current Phase (Phase 1)
- Gurudevi has its own portal page within edlove.org
- App is separate (mobile app, own tech stack)
- Portal explains and links to the app
- Users can sign up for beta / early access

### Future Phase (Phase 2-3)
- Single sign-on (SSO): One edlove account works across website and app
- User dashboard on edlove.org showing their Gurudevi journey
- Data from Gurudevi (with consent) informs Domain II research
- Community (Domain V) has a dedicated Gurudevi users channel

### The Subdomain Question
**For now**: Gurudevi lives at `edlove.org/gurudevi` (within the main site)  
**If the app needs its own web presence later**: Could become `app.edlove.org`  
**Decision**: Keep it simple. One domain. One experience. Expand only if needed.

---

## TONE AND MESSAGING

Gurudevi's voice on the portal is slightly different from the rest of edlove:
- **More practical**: Teachers need to know if this is worth their time quickly
- **Warmer**: Acknowledging how hard teaching is. Not patronizing — genuinely seen.
- **Honest**: Not overpromising. "This won't fix everything. But it will help you see more clearly."
- **Teacher-centric**: Written BY teachers FOR teachers (in spirit). Not by technologists.

### Example Copy:

**❌ Wrong:**
"Gurudevi leverages AI-powered ecological assessment frameworks to optimize teacher decision-making workflows."

**✅ Right:**
"You already know your students better than any algorithm. Gurudevi helps you trust that knowing — and gives you a clearer map of the system around you."

---

## CONNECTIONS TO OTHER DOMAINS

| Connection | How |
|------------|-----|
| ← Domain II (Sri Lanka) | "You've seen the system. Here's a tool designed for teachers inside it." |
| ← Domain I (Cosmos) | "You've seen what education COULD be. Gurudevi helps you move toward that." |
| ↔ Domain VI (Epistemic Core) | Gurudevi is grounded in Devneevma Pressure Theory and Education Ecology frameworks |
| → Domain V (Sangha) | "Connect with other Gurudevi users. Share what you're learning." |
| → Domain IV (Resources) | "Need specific resources for your school? Here's where to find them." |

---

## CONTENT FILES NEEDED

| File | Location | Status |
|------|----------|--------|
| Gurudevi page content | `src/pages/gurudevi/index.astro` | To build |

*Note: Gurudevi portal is primarily a single-page experience, not markdown content. The page is built directly in Astro with Svelte components.*

---

## COMPONENTS NEEDED

| Component | File | Purpose |
|-----------|------|---------|
| FeatureCard | `components/gurudevi/FeatureCard.svelte` | App feature showcase |
| BetaSignup | `components/gurudevi/BetaSignup.svelte` | Early access email form |
| AppMockup | `components/gurudevi/AppMockup.svelte` | Mobile app screenshot display |
| TeacherArcetype | `components/gurudevi/TeacherArchetype.svelte` | "Are you this kind of teacher?" cards |

---

## WHAT WE NEED FROM NEEV

To build this portal well, we need from you:

1. **Gurudevi feature list**: What does the app actually do? What are the main features? (Even if still in development — what's the plan?)
2. **Screenshots or mockups**: Even rough wireframes help the portal feel real
3. **Teacher stories**: Real or composite stories of teachers who would benefit from this tool
4. **The Devneevma connection**: How exactly does the app use Devneevma Pressure Theory in practice?

These will make the portal feel authentic rather than generic. *(Fill these in when ready — the portal can launch with what we have and be updated as the app develops.)*

---

*"This isn't just another app. This is something that understands the pressures you face."*

**Status**: v1.0 target for Phase 1 launch  
**Last Updated**: February 3, 2026
