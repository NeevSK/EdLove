# Environment Engine UI - Visual Guide

**Implementation:** Phases 5-7 Complete  
**Date:** February 13, 2026

---

## Screen Flow

### 1. Profile Screen → Settings
```
┌─────────────────────────────────────┐
│ Profile Screen                      │
│ ┌─────────────────────────────┐    │
│ │  Identity    [⚙️ Settings]  │◄───── Settings button (top right)
│ │  Sanctuary Profile          │    │
│ └─────────────────────────────┘    │
│                                     │
│  [Identity Card]                    │
│  [Stats Card]                       │
│  [Controls]                         │
│  [Logout Button]                    │
└─────────────────────────────────────┘
```

**User Action:** Tap Settings icon (⚙️) in top right corner

---

### 2. App Settings Screen (Modal)

```
┌─────────────────────────────────────┐
│  App Settings                   [✕] │ ◄─── Close button
├─────────────────────────────────────┤
│                                     │
│  📱 APPEARANCE                      │
│  Personalize how Gurudevi looks     │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ 🌙 Theme                      │ │
│  │ Active work • 11:30 AM    [>] │ │
│  │ Auto (Time-based)             │ │
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ ✨ Visual Quality             │ │
│  │ Adapts automatically      [>] │ │
│  │ Auto (Smart)                  │ │
│  └───────────────────────────────┘ │
│                                     │
│  🌍 LANGUAGE                        │
│  Choose your preferred language     │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ 🌐 App Language               │ │
│  │ Switch between languages  [>] │ │
│  │ English                       │ │
│  └───────────────────────────────┘ │
│                                     │
│  🔒 PRIVACY                         │
│  Control information display        │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ 👁️ Privacy Veil      [Toggle] │ │
│  │ Quick-hide personal details   │ │
│  └───────────────────────────────┘ │
│                                     │
│  📊 DEVICE INFORMATION              │
│  How Gurudevi adapts to device     │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ Device Tier:        Medium    │ │
│  │ Available Memory:   4.2 GB    │ │
│  │ Network Quality:    Good      │ │
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ 💡 Tip                        │ │
│  │ These settings help Gurudevi  │ │
│  │ work best for you. Auto mode  │ │
│  │ is recommended for most users │ │
│  └───────────────────────────────┘ │
│                                     │
└─────────────────────────────────────┘
```

**Key Features:**
- Clear section headers with descriptions
- Icons for visual communication
- Current values displayed prominently
- Chevron (>) indicates tappable
- Min 72px touch targets
- Gentle tip at bottom

---

### 3. Theme Selection Modal

```
┌─────────────────────────────────────┐
│  Choose Theme                       │
├─────────────────────────────────────┤
│                                     │
│  ┌───────────────────────────────┐ │
│  │ 📱 Auto (Time-based)      [✓] │ │ ◄─── Selected (checkmark)
│  │ Automatically adjusts between │ │
│  │ light and dark based on time  │ │
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ ☀️ Light                       │ │
│  │ Bright and clear for daytime  │ │
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ 🌙 Dark                        │ │
│  │ Easy on the eyes in low light │ │
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │         Close                 │ │
│  └───────────────────────────────┘ │
└─────────────────────────────────────┘
```

**Interaction:**
- Tap any option to select
- Checkmark shows current selection
- Haptic feedback on tap
- Auto-closes on selection
- Close button at bottom

---

### 4. Language Selection Modal

```
┌─────────────────────────────────────┐
│  Choose Language                    │
├─────────────────────────────────────┤
│                                     │
│  ┌───────────────────────────────┐ │
│  │ 🌐 English                [✓] │ │ ◄─── Selected
│  │ Change the app language to    │ │
│  │ English                       │ │
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ 🌐 සිංහල                      │ │ ◄─── Native script
│  │ යෙදුමේ භාෂාව සිංහලට         │ │
│  │ වෙනස් කරන්න                  │ │
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ 🌐 தமிழ்                       │ │ ◄─── Native script
│  │ பயன்பாட்டின் மொழியை தமிழுக்கு │ │
│  │ மாற்றவும்                     │ │
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │         Close                 │ │
│  └───────────────────────────────┘ │
└─────────────────────────────────────┘
```

**Special Features:**
- Native script display (සිංහල, தமிழ்)
- Descriptions in selected language
- Changes apply immediately
- Entire app updates in real-time

---

### 5. Visual Quality Selection Modal

```
┌─────────────────────────────────────┐
│  Visual Quality                     │
├─────────────────────────────────────┤
│                                     │
│  ┌───────────────────────────────┐ │
│  │ ✨ Auto (Smart)           [✓] │ │ ◄─── Recommended
│  │ Automatically adjusts based on│ │
│  │ your device capabilities      │ │
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ 📱 Battery Saver              │ │
│  │ Simplified visuals, works     │ │
│  │ smoothly on all devices       │ │
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ ✨ Best Quality                │ │
│  │ Beautiful effects and         │ │
│  │ animations (requires capable  │ │
│  │ device)                       │ │
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │         Close                 │ │
│  └───────────────────────────────┘ │
└─────────────────────────────────────┘
```

**Guidance:**
- Clear explanation of each level
- "Auto" recommended for most users
- Mentions device requirements
- Effects apply immediately

---

## Color Coding

### Active/Selected States
```
Background: Light lavender (#E6E6FA)
Border: Saffron (#E67E22)
Icon: White on saffron background
```

### Inactive States
```
Background: Lotus white (#F1F5F9)
Border: Sandstone (#E2E8F0)
Icon: White on sandstone background
```

### Text Hierarchy
```
Title: Charcoal (#0F172A) - Semibold
Description: Slate gray (#64748B) - Regular
Value: Charcoal (#0F172A) - Regular
```

---

## Accessibility Features

### Touch Targets
```
┌──────────────────────────────────────┐
│                                      │
│   Icon   Title & Description    [>] │ ◄─── 72px height
│                                      │
└──────────────────────────────────────┘
```
- **Height:** 72px (exceeds 44px WCAG minimum)
- **Width:** Full screen width minus padding
- **Spacing:** 8px between elements

### Screen Reader Labels
```javascript
accessibilityLabel="Theme"
accessibilityHint="Choose between light, dark, or 
                   automatic theme based on time of day"
accessibilityRole="button"
```

### Switch Accessibility
```javascript
accessibilityLabel="Privacy Veil"
accessibilityRole="switch"
accessibilityState={{ checked: isVeilActive }}
```

---

## Interaction Flow

### 1. Opening Settings
```
User Action    → Visual Feedback           → Result
───────────────────────────────────────────────────
Tap Settings   → Haptic feedback          → Modal opens
Icon           → Icon briefly highlights  → Settings screen
```

### 2. Changing Theme
```
User Action       → Visual Feedback              → Result
──────────────────────────────────────────────────────────
Tap "Theme"      → Haptic light                 → Modal opens
Tap "Dark"       → Haptic success               → Theme changes
                 → Modal closes                 → UI updates
                 → Checkmark moves              → Immediately
```

### 3. Changing Language
```
User Action       → Visual Feedback              → Result
──────────────────────────────────────────────────────────
Tap "Language"   → Haptic light                 → Modal opens
Tap "සිංහල"      → Haptic success               → Language changes
                 → Modal closes                 → Entire app updates
                 → Checkmark moves              → In Sinhala
```

### 4. Privacy Veil Toggle
```
User Action       → Visual Feedback              → Result
──────────────────────────────────────────────────────────
Tap Switch       → Switch animates              → State changes
                 → Icon changes (eye/eye-off)   → Immediately
                 → Description updates          → Context saved
```

---

## Responsive Behavior

### On Small Screens (< 360px width)
- Font sizes adjust proportionally
- Padding reduces slightly
- Icons remain same size
- Touch targets remain 72px

### On Large Screens (> 600px width)
- Max width: 600px centered
- Padding increases
- Font sizes scale up slightly
- Touch targets remain 72px

### On Tablets
- Modal width: 500px centered
- Larger padding
- Same interaction patterns
- Optimized for landscape/portrait

---

## Temporal Phase Indicators

### Theme Setting Shows Current Phase
```
Dawn (5-8 AM):     "Gentle awakening • 6:30 AM"
Day (8 AM-5 PM):   "Active work • 11:30 AM"
Evening (5-8 PM):  "Winding down • 6:45 PM"
Night (8 PM-5 AM): "Restful • 10:15 PM"
```

### Visual Indicators by Phase
```
Dawn:    🌅 Warm gold icon tint
Day:     ☀️ Bright blue icon tint
Evening: 🌆 Saffron icon tint
Night:   🌙 Purple icon tint
```

---

## Device Information Display

### Example 1: Good Device, Good Network
```
┌─────────────────────────────────┐
│ Device Tier:      High          │
│ Available Memory: 6.8 GB        │
│ Network Quality:  Excellent     │
└─────────────────────────────────┘
```

### Example 2: Low-end Device, Poor Network
```
┌─────────────────────────────────┐
│ Device Tier:      Low           │
│ Available Memory: 2.1 GB        │
│ Network Quality:  Poor          │
│                                 │
│ ⚠️ Data Saver mode is active   │
│ due to poor connection          │
└─────────────────────────────────┘
```
**Note:** Info box appears when data saver is active

---

## Empty States & Error Handling

### Network Error
```
┌─────────────────────────────────┐
│ ℹ️ Network Check Failed         │
│                                 │
│ Could not determine network     │
│ quality. The app will use       │
│ standard settings.              │
│                                 │
│ [Try Again]                     │
└─────────────────────────────────┘
```

### Settings Load Error
```
┌─────────────────────────────────┐
│ ℹ️ Settings Not Available       │
│                                 │
│ Your settings couldn't be       │
│ loaded. Using default values.   │
│                                 │
│ Your preferences will be saved  │
│ when you make changes.          │
│                                 │
│ [OK]                            │
└─────────────────────────────────┘
```

**Philosophy:** Every error shows:
1. What happened (simple language)
2. What it means for the user
3. How to proceed (action or reassurance)

---

## Animation & Transitions

### Modal Entrance
```
From:   Bottom of screen (translateY: 100%)
To:     Center position (translateY: 0)
Timing: 300ms ease-out
```

### Selection Feedback
```
Tap:    Scale 0.98 (150ms)
        Haptic light
Release: Scale 1.0 (150ms)
        Haptic success (if selection changes)
```

### Toggle Animation
```
Off → On:  Thumb slides right (200ms)
           Background color fades to saffron (200ms)
           Icon changes immediately
           Haptic success
```

---

## Multilingual Examples

### English
```
Settings > Appearance > Theme
"Choose between light, dark, or automatic 
theme based on time of day"
```

### Sinhala (සිංහල)
```
සැකසුම් > පෙනුම > තේමාව
"දවසේ කාලය අනුව ආලෝකමත් සහ අඳුරු අතර 
ස්වයංක්‍රීයව වෙනස් වේ"
```

### Tamil (தமிழ்)
```
அமைப்புகள் > தோற்றம் > தீம்
"நாளின் நேரத்தின் அடிப்படையில் ஒளி மற்றும் 
இருள் இடையே தானாக சரிசெய்கிறது"
```

---

## Summary

The Environment Engine UI provides:

✅ **Clear Visual Hierarchy** - Icons, colors, spacing guide the eye  
✅ **Immediate Feedback** - Visual + haptic on every interaction  
✅ **Accessible Design** - 72px targets, screen reader support  
✅ **Gentle Language** - No jargon, clear explanations  
✅ **Smart Defaults** - Auto mode recommended  
✅ **Contextual Help** - Device info shown clearly  
✅ **Multilingual** - 3 languages with native scripts  
✅ **Error Recovery** - Clear guidance when issues occur  

The interface follows the Sanctuary design principles: calm, clear, and respectful of the user's time and understanding.
