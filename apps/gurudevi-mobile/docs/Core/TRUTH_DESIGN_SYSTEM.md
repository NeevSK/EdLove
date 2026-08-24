---
title: "GURUDEVI DESIGN SYSTEM (CORE TRUTH)"
status: "active"
created: 2026-02-28
updated: 2026-02-28
author: "Naveen"
scribe: "opencode"
tags: [apps, gurudevi-mobile]
---

# GURUDEVI DESIGN SYSTEM (CORE TRUTH)
*Sacred Visual Laws and Design Tokens*

---

## 1. THE PALETTE (Sanctuary)
*Strict adherence required. Do not invent hex codes.*

| Token | Hex | Name | Use Case |
|-------|-----|------|----------|
| Background | `#F5EDD6` | **Vellum** | Main screen backgrounds, calm surfaces. |
| Text | `#2A2318` | **Ink** | Primary text, heavy contrast elements. |
| Primary | `#D4843A` | **Saffron** | Actions, highlights, brand resonance. |
| Secondary | `#8BBF7A` | **Dalu Green** | Success states, nature, growth. |
| Border | `#DED5BC` | **Sand** | Subtle separators, input borders. |

### The Shadow Rule
**NEVER** use grey or black for shadows.
- **Shadow Violet**: `rgba(107, 100, 128, x)`.
- Shadows should feel "heavy with air," not muddy.

---

## 2. TYPOGRAPHY
- **Body Text**: 18sp minimum for accessibility.
- **Line Height**: 1.6x (English) / 1.8x (Sinhala/Tamil).
- **Fonts**: 
  - Sinhala: Noto Sans Sinhala (Regular to Bold).
  - Tamil: Noto Sans Tamil (Regular to Bold).

---

## 3. RHYTHM & MOTION
- **Entry**: `FadeInDown` (500ms).
- **Easing**: Cubic Bezier for organic movement. No linear transitions.
- **Staggering**: Children must stagger by 50-100ms.

---

## 4. THE GLASS BOUNDARY
For Blurs/Translucency:
- **Thin Glass**: ≤ 12 (Subtle frost).
- **Thick Glass**: ≥ 36 (Deep sanctuary).
- **AVOID**: the "Muddled Middle" (16-28).

---

## 5. REVENUE VISUALS (THUTHIMAL)
- Subscriptions are visualized as **Lotus Flowers**.
- Gifting indicators use Saffron highlights with Dalu Green stems.
