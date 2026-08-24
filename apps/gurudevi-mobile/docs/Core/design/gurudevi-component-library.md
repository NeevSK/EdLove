---
title: "Gurudevi â€” Component Library"
status: "active"
created: 2026-02-27
updated: 2026-02-27
author: "Naveen"
scribe: "opencode"
tags: [apps, gurudevi-mobile]
---

# Gurudevi — Component Library
### Living Design Patterns for a Sanctuary
*For AI agents and human architects alike*

---

## 0. Philosophy Before Patterns

Every component in Gurudevi is not a UI element. It is a **moment in an ecology**.

A button is not just an interaction target. It is an invitation — warm, clear, never aggressive. A card is not a container. It is a clearing in the forest where something can be held safely. An input field is not a form element. It is a listening space.

This philosophy governs every decision in this library.

**Three questions every component must answer:**
1. Does it feel safe to touch?
2. Does it hold its content with dignity?
3. Does it breathe with the space around it?

If yes to all three — it belongs in Gurudevi.

---

## 1. Design Token Reference

All components consume from the central token system. Never hardcode color values inside components.

```typescript
import { useTheme } from '@gurudevi/ui';

const { colors, spacing, corners, shadows, phase } = useTheme();

// colors.saffron.full        — primary action
// colors.saffron.muted       — secondary warmth
// colors.vellum.warm         — standard background
// colors.dalu.luminous       — life, growth, success
// colors.aurora.blue         — atmospheric, cool
// colors.aurora.violet       — depth, knowledge
// colors.ink.primary         — all text
// colors.shadow.sm           — standard card shadow (Shadow Violet)
// phase.glass.surface        — current temporal glass surface
// phase.glass.border         — current temporal glass border
// phase.glass.blur           — current temporal blur intensity
// phase.accent               — current phase leading color
```

---

## 2. Primitive Components — The Foundation Layer

These are the atoms. Everything else builds from these.

### 2.1 SanctuaryText

Text in Gurudevi is always warm ink, never cold black. Hierarchy through value and weight, not through cold greys.

```typescript
// Variants
type TextVariant = 
  | 'display'      // Large titles — Gurudevi moments
  | 'heading'      // Screen and section headings
  | 'subheading'   // Card titles, secondary headings
  | 'body'         // Primary reading text
  | 'bodySmall'    // Supporting text, descriptions
  | 'caption'      // Timestamps, metadata
  | 'label'        // Form labels, tags
  | 'overline'     // Category markers, small caps
  | 'quote'        // Student thoughts, teacher wisdom

// Usage
<SanctuaryText variant="heading">Your Daily Pulse</SanctuaryText>
<SanctuaryText variant="body" muted>
  How are you holding yourself today?
</SanctuaryText>

// Color behavior
// primary — ink.primary #2A2318
// muted — ink.secondary rgba(42,35,24,0.60)
// inverse — ink.inverse #F5EDD6 (on dark backgrounds)
// accent — phase.accent (shifts with time of day)

// Font scale
display:    { fontSize: 36, fontWeight: '300', letterSpacing: -0.5 }
heading:    { fontSize: 24, fontWeight: '600', letterSpacing: -0.3 }
subheading: { fontSize: 18, fontWeight: '500', letterSpacing: -0.2 }
body:       { fontSize: 16, fontWeight: '400', letterSpacing: 0 }
bodySmall:  { fontSize: 14, fontWeight: '400', letterSpacing: 0.1 }
caption:    { fontSize: 12, fontWeight: '400', letterSpacing: 0.3 }
label:      { fontSize: 13, fontWeight: '500', letterSpacing: 0.4 }
overline:   { fontSize: 11, fontWeight: '600', letterSpacing: 1.2, textTransform: 'uppercase' }
```

### 2.2 SanctuaryIcon

Icons carry meaning. They should feel like they belong to the same world as the content around them.

```typescript
// Icon behavior in Gurudevi
// Default size: 24px
// Default color: ink.secondary (not primary — icons support, don't lead)
// Active/selected: phase.accent
// Destructive: warm red #C44B3A

// Icon weight should match text weight in context
// In headings — slightly heavier stroke
// In captions — lighter stroke

// Never use icons as decoration without meaning
// Every icon should answer: "what does this help the user understand?"
```

### 2.3 SanctuaryDivider

Dividers breathe. They separate without cutting.

```typescript
// Types
type DividerType = 
  | 'full'       // Edge to edge
  | 'inset'      // Indented — continues a list
  | 'middle'     // Both sides inset — between items
  | 'decorative' // Lotus-inspired ornamental

// Color: always Shadow Violet rgba(107,100,128,0.12)
// Never a hard line — always soft and thin
// Thickness: 0.5px — hair-thin

// Decorative divider — for section breaks in Library, special moments in Self
// A small lotus motif or simple three-dot pattern in phase.accent color
```

---

## 3. Surface Components — The Holding Layer

These components hold content. They are the clearings in the forest.

### 3.1 SanctuaryCard

The most important surface component. Already implemented with BlurView and Reanimated — evolve, don't replace.

```typescript
type CardVariant = 
  | 'glass'      // Temporal glass — primary card type
  | 'solid'      // Solid vellum surface — content-heavy cards
  | 'ghost'      // Minimal — nearly invisible, just border
  | 'elevated'   // Solid with stronger shadow — featured content
  | 'lotus'      // Special — lotus pink tint — achievements, celebrations

type CardSize =
  | 'sm'         // Compact — tags, quick stats
  | 'md'         // Standard — most cards
  | 'lg'         // Feature — hero content
  | 'full'       // Full width — screen-level surfaces

// Behavior rules
// glass variant — uses phase.glass tokens, blur commits to transparent or frosted
// solid variant — uses vellum.warm surface, Shadow Violet shadows
// ghost variant — border only: rgba(107,100,128,0.12), no background fill
// elevated variant — solid + shadow.md, slight upward translate on press
// lotus variant — uses lotus.whisper background, lotus.pink border — rare

// Press interaction (existing Reanimated animation — keep as is)
// Scale: 0.97 on press
// Shadow reduces on press (going down, not up)
// Spring animation — feels organic not mechanical

// Skia enhancement (when LivingCard wraps this)
// LivingCard lives in packages/ui/src/components-native/
// Import: import { LivingCard } from '@gurudevi/ui/native'
```

### 3.2 GlassCard

Simpler than SanctuaryCard. For contexts where BlurView animation overhead is unnecessary.

```typescript
// Already implemented — only needs token update
// See Implementation Guide Section 2 for correct token values

// Use GlassCard for:
// — Navigation overlays
// — Tooltip surfaces
// — Quick info panels
// — Contexts where press interaction not needed

// Use SanctuaryCard for:
// — Primary content cards
// — Anything pressable
// — Featured or important content
```

### 3.3 SanctuarySheet

Bottom sheet — a surface that rises from below like the lotus from water.

```typescript
// Animation: rises from bottom with spring — not linear
// Background: temporal glass with higher blur (always frosted for sheets)
// Handle: short rounded bar in phase.glass.border color
// Backdrop: rgba(26,20,35,0.40) — warm dark, not cold black

// Variants
type SheetVariant =
  | 'peek'       // 30% screen height — quick info
  | 'half'       // 50% — standard interactions
  | 'tall'       // 75% — complex content
  | 'full'       // 95% — immersive (feels like new screen)

// Drag behavior
// Snap points at each variant height
// Dismiss by dragging below peek threshold
// Slight resistance at top — feels like physical material
```

### 3.4 SanctuaryModal

For decisions, confirmations, important moments.

```typescript
// Centered overlay, not full-screen
// Background: glass.modal tokens (higher opacity than surface)
// Entry: fade + slight scale from 0.95 to 1.0
// Backdrop: semi-dark warm overlay

// Modal should be used sparingly
// Most interactions should be sheets, not modals
// Modals are for: destructive actions, important confirmations, focused inputs

// Never use modal for information that doesn't require a decision
// Information → Sheet or Card
// Decision → Modal
```

### 3.5 DailyResonanceCard

Specific to Self space. The card that greets the user each day.

```typescript
// This card is the emotional center of the Self space
// It should feel like opening a letter written for you

// Structure
// — Temporal greeting (Good morning / Good afternoon / etc)
// — Today's resonance — a quote, thought, or prompt
// — Mood check-in entry point
// — Quick pulse indicators (sleep, energy, focus)

// Visual treatment
// Large — takes significant screen space
// Uses LivingCard wrapping for subsurface quality
// Phase accent color for greeting text
// Generous padding — content breathes

// The resonance content itself
// Typography: quote variant, slightly larger, generous line height
// Source attribution: caption variant, muted
// Never crowded — white space is part of the content
```

---

## 4. Interactive Components — The Invitation Layer

These components invite action. They should feel safe, clear, never pressuring.

### 4.1 SanctuaryButton

A button in Gurudevi is an invitation, not a command.

```typescript
type ButtonVariant =
  | 'primary'      // Saffron — main action
  | 'secondary'    // Outlined — alternative action  
  | 'ghost'        // Text only — subtle action
  | 'glass'        // Glass surface — for use on glass backgrounds
  | 'destructive'  // Warm red — irreversible actions only
  | 'lotus'        // Lotus pink — celebratory actions (submit achievement, etc)

type ButtonSize =
  | 'sm'           // 36px height — inline actions
  | 'md'           // 48px height — standard
  | 'lg'           // 56px height — primary CTA
  | 'full'         // Full width — form submissions

// Primary button
background:   saffron.full #D4843A
text:         ink.inverse #F5EDD6
borderRadius: corners.comfortable (typically 14px)
shadow:       shadow.sm (Shadow Violet — always)

// Press state
// Scale: 0.96
// Background darkens to saffron.deep #A8622A
// Shadow reduces

// Loading state
// Subtle pulse animation in saffron.muted
// Spinner in ink.inverse color
// Text fades slightly

// Disabled state
// Background: saffron.whisper #F0D4B0
// Text: ink.tertiary
// No shadow
// Not grayed out — Gurudevi never goes cold grey

// Secondary button
background:   transparent
border:       1.5px saffron.muted
text:         saffron.full
// On press: saffron.whisper fill appears

// Ghost button
background:   transparent
border:       none
text:         phase.accent or ink.secondary
// On press: phase.accent at 8% opacity fill appears
// Use for: navigation actions, "learn more", secondary flows

// Never use more than one primary button per screen
// The primary action should be obvious and singular
```

### 4.2 SanctuaryInput

A listening space. The field waits with patience, not urgency.

```typescript
type InputVariant =
  | 'standard'     // Default — outlined with vellum fill
  | 'glass'        // For use on glass surfaces
  | 'ghost'        // Minimal — just a bottom border
  | 'area'         // Multi-line — for notes, venting, longer thought

// Standard input
background:     vellum.warm #F5EDD6
border:         rgba(107,100,128,0.20) — Shadow Violet subtle
borderRadius:   corners.soft (10px)
text:           ink.primary
placeholder:    ink.tertiary
padding:        { vertical: 14, horizontal: 16 }

// Focus state
border:         phase.accent at 0.6 opacity
shadow:         0px 0px 0px 3px phase.accent at 0.12 opacity — soft glow ring
// The focus ring is warm, not the harsh blue of default browsers

// Error state
border:         #C44B3A warm red
shadow:         0px 0px 0px 3px rgba(196,75,58,0.12)
// Error message below in warm red — bodySmall variant

// Label behavior
// Label floats above on focus and when has value
// Animation: spring — not linear
// Label color: ink.secondary → phase.accent on focus

// Area variant (venting space, notes)
// Min height: 120px
// Grows with content up to max height
// Subtle resize handle in Shadow Violet
// Word count shown subtly in caption/muted when content present
// The venting space specifically — extra generous padding, no character limit shown

// Character limits
// Show only when approaching limit (80%+)
// Color shifts warm → saffron.muted → saffron.full as limit approaches
// Never harsh red until actually at limit
```

### 4.3 SanctuaryToggle

For binary choices. Should feel satisfying to interact with.

```typescript
// On state: saffron.full track, white thumb
// Off state: Shadow Violet rgba(107,100,128,0.25) track, white thumb
// Transition: spring animation — thumb slides with slight overshoot
// Size: standard 51×31px (iOS feel)

// Never use flat gray for off state — it reads as disabled
// The Shadow Violet off state reads as "not currently active" not "broken"
```

### 4.4 SanctuaryCheckbox and Radio

```typescript
// Checkbox
// Unchecked: border Shadow Violet rgba(107,100,128,0.30)
// Checked: saffron.full background, white checkmark
// Indeterminate: saffron.muted background, white dash
// Animation: checkmark draws in with a small spring

// Radio
// Unselected: border Shadow Violet rgba(107,100,128,0.30)
// Selected: saffron.full outer ring, saffron.full inner dot
// Transition: inner dot scales in with spring

// Both: corner radius should feel soft — not perfectly round, not square
// Checkbox: 6px radius
```

### 4.5 SanctuarySlider

For mood trackers, energy levels, sleep quality in Self space.

```typescript
// Track: vellum.deep #E8DFC8 — warm neutral
// Fill: gradient from saffron.whisper to phase.accent
// Thumb: white circle, shadow.sm
// On drag: thumb scales to 1.3x, shows value tooltip above

// For mood/wellbeing sliders specifically
// Consider emoji or symbol markers at key points
// Not just a line — the visual language of the range matters
// Low end: cooler, slightly muted
// High end: warmer, more saturated
// The gradient itself communicates the meaning
```

---

## 5. Navigation Components

### 5.1 SanctuaryTabBar

The bottom navigation — most globally visible component in the app.

```typescript
// Structure
// Glass surface: TemporalGlass wrapping BlurView
// Blur: phase-aware (transparent in morning, frosted at night)
// Height: 84px (includes safe area)
// Border top: phase.glass.border — luminous edge

// Tab items
// Icon + label layout
// Inactive: ink.tertiary color
// Active: phase.accent color with subtle background pill
// Active pill: phase.accent at 8% opacity, cornerRadius pill

// The five tabs
// Self — personal space icon (perhaps a gentle leaf or inner circle)
// Classroom — structured learning icon
// Community — connected nodes or people
// Library — book or archive
// Profile — gentle portrait or settings gear

// Tab transition
// Active icon: slight scale pulse on select (1.0 → 1.1 → 1.0)
// Label: fades in on active, fades out on inactive
// Never use hard jump — spring transitions between states

// Haptic feedback
// Light impact on tab press
// Never on repeated press of already-active tab
```

### 5.2 SanctuaryHeader

Top navigation header — globally visible, sets the phase tone.

```typescript
// Standard header
// Background: TemporalGlass with phase-appropriate blur
// Height: 56px + status bar
// Title: subheading variant, centered or left-aligned
// Border bottom: phase.glass.border — very subtle

// Large header (for main space screens)
// Collapses on scroll to standard header
// Large title: heading variant
// Shows space-specific greeting or context

// Transparent header variant
// For screens with hero imagery or full-bleed content
// Title fades in as user scrolls down
// Back button always visible on colored background

// Back button
// Chevron left icon in phase.accent
// Label: previous screen name or "Back" — caption variant
// Never just an X unless it's a modal dismiss
```

### 5.3 SanctuaryBreadcrumb

For deep navigation within Library and Community.

```typescript
// Horizontal scrolling breadcrumb trail
// Items: caption variant, ink.tertiary
// Current item: caption variant, phase.accent
// Separator: › in ink.tertiary
// Fades at edges when overflowing
```

---

## 6. Feedback Components — The Response Layer

How the app communicates back to the user.

### 6.1 SanctuaryToast

Non-intrusive feedback. Never alarming.

```typescript
type ToastVariant =
  | 'success'    // Dalu green — something bloomed
  | 'info'       // Aurora blue — something to know
  | 'warning'    // Saffron — attention without alarm
  | 'error'      // Warm red — something needs care

// Position: top of screen, below header
// Entry: slides down from above with spring
// Duration: 3000ms default, persists for errors until dismissed
// Glass surface with phase-appropriate treatment

// success — dalu.luminous border, dalu.whisper background
// info — aurora.blue border, aurora.whisper background  
// warning — saffron.muted border, saffron.whisper background
// error — #C44B3A border, rgba(196,75,58,0.08) background

// Never use harsh alert colors
// The toast should inform, not startle
// Icon + message layout, optional action button
```

### 6.2 SanctuaryBadge

For notifications, counts, status indicators.

```typescript
type BadgeVariant =
  | 'count'      // Numerical — notification counts
  | 'status'     // Dot — presence, activity status
  | 'label'      // Text — category tags

// count: saffron.full background, ink.inverse text
// status active: dalu.luminous — alive and present
// status away: saffron.muted — warm but distant
// status offline: Shadow Violet rgba(107,100,128,0.40)

// Never use harsh red for notification counts
// Saffron communicates "attention needed" without alarm
```

### 6.3 SanctuaryProgress

For loading states, course progress, skill development.

```typescript
type ProgressVariant =
  | 'linear'     // Horizontal bar — course/module progress
  | 'circular'   // Ring — skill mastery, daily goals
  | 'lotus'      // Lotus bloom animation — major milestone

// linear
// Track: vellum.deep #E8DFC8
// Fill: gradient from saffron.whisper to phase.accent
// Animated: fill grows with spring from left
// Label: percentage in caption/muted above right

// circular  
// Track: Shadow Violet rgba(107,100,128,0.15)
// Fill: saffron.full stroke, cap rounded
// Center: percentage in subheading or icon
// Animated: draws clockwise with spring

// lotus — special milestone progress
// Used for: completing a unit, achieving a goal, teacher recognition
// Animation: lotus petals unfurl one by one
// Color: lotus.pink with gold center
// Sound: optional gentle chime
// This animation is sacred — use sparingly
```

### 6.4 SanctuaryEmptyState

When there is nothing yet. The space before content arrives.

```typescript
// Empty states in Gurudevi are not failures — they are invitations

// Structure
// Illustration: gentle, topological — abstract lotus or leaf form
//   in phase.accent color at low opacity
// Heading: subheading variant — warm, inviting language
// Body: body variant, muted — explain the possibility
// Action: primary or secondary button — optional

// Language examples
// Self/mood: "Your first reflection is waiting to be written"
// Classroom: "Your classroom is ready for its first lesson"
// Community: "The community grows with your first contribution"
// Library: "Your library begins with a single resource"

// Never: "No data found" "Nothing here" "Empty"
// Always: language that points toward possibility
```

---

## 7. Content Components — The Knowledge Layer

Specific to Gurudevi's educational mission.

### 7.1 LessonCard

The unit of learning in Classroom space.

```typescript
// Structure
// — Subject color indicator (left border or top banner)
// — Lesson title: subheading variant
// — Teacher name: caption variant, muted
// — Duration and difficulty: label variant with icons
// — Progress indicator if started
// — Completion state if done

// Subject color system (within Gurudevi palette)
// Mathematics: Aurora blue #7DD4C0 — precise, clear
// Languages: Saffron #D4843A — expressive, warm
// Science: Dalu green #8BBF7A — natural, discovering
// Arts: Lotus pink #E8A0B0 — creative, sensitive
// History: Aurora violet #B8A9E0 — deep, temporal
// Physical: warm amber — energetic, embodied

// Completion treatment
// Completed: subtle dalu.whisper background tint
// Dalu green checkmark in corner
// Title slightly muted — content has been held, not forgotten
```

### 7.2 ResourceCard

For Library space — books, videos, maps for life, lesson plans.

```typescript
type ResourceType =
  | 'book'
  | 'video'
  | 'article'
  | 'lessonPlan'
  | 'lifeMap'      // Gurudevi-specific — maps for navigating life
  | 'documentary'
  | 'podcast'
  | 'practice'     // Exercise, worksheet, activity

// Each type has a distinct icon treatment
// lifeMap specifically — a subtle cartographic aesthetic
// compass rose or topographic lines motif
// This is Gurudevi's most unique resource type

// Library cards use night phase glass tokens even in daytime
// Library is always a timeless space — not bound to current time
// Deep, jewel-like surface regardless of when user visits
```

### 7.3 MoodEntry

For Self space — the daily emotional check-in.

```typescript
// This is one of the most intimate components in the app
// Treat with maximum care

// Mood wheel or emoji spectrum
// Not clinical scales (1-10) — too cold
// Qualitative with visual: images or abstract color-form
// Options like: blooming / steady / cloudy / heavy / stormy
//   each with a color-temperature that matches

// Blooming: dalu.luminous — alive, clear
// Steady: aurora.blue — calm, even
// Cloudy: aurora.violet muted — uncertain, drifting
// Heavy: deeper vellum with saffron.whisper — weighted, present
// Stormy: warm dark with violet — intense, moving through

// After selection: brief moment of acknowledgment
// "You chose to show up today" — gentle, witnessing language
// Not: "Mood logged successfully" — clinical, cold

// The entry should feel like being heard, not being measured
```

### 7.4 TeacherStudentBridge

The impedance-matching moment — the core Gurudevi value.

```typescript
// This component represents the moment between teacher and student
// Where understanding flows — Gurudevi's central purpose

// Visual metaphor: two surfaces coming into alignment
// Perhaps a gentle gradient bridge between two cards
// Teacher context on one side, student reception on other

// This component doesn't exist yet — design it carefully
// It will be the most distinctively Gurudevi component in the system
// Consider: how does design represent the meeting of two minds?
// The lotus blooms in the space between them
```

---

## 8. Space-Specific Patterns

### Self Space Patterns
Cards breathe with maximum grain and warm luminosity. Interactions feel private and safe. No sharp edges. Generous spacing. The space holds you.

Entry animations: fade in softly — content arrives, not jumps.
Transition out: content dissolves rather than slides — like a page turning.

### Classroom Space Patterns
Cleaner, more structured. Grid-aligned content. Stronger hierarchy. Academic but never clinical. The louvre-window light quality — structured light on warm surfaces.

Entry animations: slide in from right — progressive reveal, systematic.
List items: consistent rhythm — equally spaced, methodical.

### Community Space Patterns
Most dynamic. Content varies in size and importance. Cards can be different heights. Warmest temperature. Most saturated accent moments.

Entry animations: items stagger in from below — emerging, organic.
Interactions: most expressive haptic feedback.

### Library Space Patterns
Most typographically rich. Long-form reading comfort. Generous line height. Soft ambient light quality regardless of time of day — the timeless room.

Entry animations: crossfade — content was always there, now revealed.
Reading mode: maximum vellum ground, ink primary text, minimal chrome.

### Profile Space Patterns
Most minimal. Settings feel clean and considered. Rewards feel genuinely celebratory (lotus animation appropriate here). Personal information held with dignity.

---

## 9. Accessibility — Care in Practice

Gurudevi serves students, teachers, principals — people of all ages, abilities, and devices.

**Color contrast** — all text meets WCAG AA minimum 4.5:1 ratio. The warm ink on vellum palette achieves this while remaining warm. Never sacrifice accessibility for aesthetics.

**Touch targets** — minimum 44×44px for all interactive elements. In Self space (intimate, often used tired or emotionally) — prefer 48×48px.

**Reduced motion** — respect `reduceMotion` system setting. Replace spring animations with simple fade. Skia grain overlay should be static or removed entirely when motion reduced.

**Text sizing** — respect system font size preferences. Components must flex gracefully at larger text sizes without breaking.

**Screen readers** — all interactive components have meaningful accessibilityLabel. Icons with meaning have accessibilityLabel. Decorative elements are hidden from screen readers.

**Low-end device fallback** — `blurEnabled` check already in SanctuaryCard. Pattern should be consistent: glass variant falls back to solid variant on low-end devices. Never broken — always dignified.

---

## 10. Component Anti-Patterns — What Never Belongs

**The alarm button** — no component should feel urgent or alarming unless genuinely needed. Notification badges in saffron, not red. Error states in warm red, not harsh crimson.

**The cold card** — pure white background, pure black text, grey shadow. This combination is forbidden. Always warm ground, warm ink, violet shadow.

**The empty icon button** — icon with no label in non-obvious contexts. Every icon the user might not recognize needs a label or tooltip.

**The full-screen modal for simple info** — information that doesn't require a decision should never be in a modal. Use sheet, card expansion, or inline display.

**The punishment empty state** — "No results found" with a sad illustration. Gurudevi never punishes the empty moment. Every empty state is a beginning.

**The progress bar that never moves** — loading states must communicate genuine progress where possible. Indeterminate spinners only when truly unknown duration. When known — show it.

**The generic placeholder** — "Enter text here" or "Type something". Every placeholder in Gurudevi should be warm, contextual, inviting. The placeholder is the voice of the sanctuary speaking gently.

---

*Document version 1.0 — February 2026*
*Gurudevi Component Library*
*Born from a single day's exploration — enriched with everything the topology implied*
