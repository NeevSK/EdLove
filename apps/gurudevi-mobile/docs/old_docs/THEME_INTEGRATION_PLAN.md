---
title: "Theme Integration Implementation Plan"
status: "active"
created: 2026-02-19
updated: 2026-07-24
author: "Naveen"
scribe: "opencode"
tags: [apps, gurudevi-mobile, historical]
---

> **Superseded** � kept for historical reference.
> See active docs at docs/INDEX.md.
# Theme Integration Implementation Plan

## Current Status
The theme system has been partially implemented:
- ✅ Theme mode selection UI (light/dark/auto)
- ✅ State management in Zustand store
- ✅ useTheme hook that determines isDark
- ❌ **Theme colors are not actually applied** to components

## Problem
Components still use hardcoded `Theme.colors.voidIndigo` (dark colors) instead of dynamically switching between light and dark colors based on theme mode.

## Solution

### Option 1: Utility Function (Recommended for Quick Fix)
**File Created:** `src/utils/themeColors.ts`

**Usage:**
```typescript
import { useTheme } from '../hooks/useTheme';
import { getThemeColors } from '../utils/themeColors';

function MyScreen() {
    const { isDark } = useTheme();
    const colors = getThemeColors(isDark);
    
    return (
        <Box sx={{ backgroundColor: colors.primary }}>
            <Text color={colors.text}>Content</Text>
        </Box>
    );
}
```

**Pros:**
- Easy to implement gradually
- No breaking changes
- Components opt-in to theme support

**Cons:**
- Requires updating every component
- Increases boilerplate

### Option 2: Theme Context Provider (Better Architecture)
**Not yet implemented** - Would require more extensive refactoring

```typescript
// ThemeProvider.tsx
export function ThemeProvider({ children }) {
    const { isDark } = useTheme();
    const colors = getThemeColors(isDark);
    
    return (
        <ThemeContext.Provider value={{ colors, isDark }}>
            {children}
        </ThemeContext.Provider>
    );
}

// Usage
function MyScreen() {
    const { colors } = useThemeContext();
    return <Box sx={{ backgroundColor: colors.primary }} />;
}
```

**Pros:**
- Cleaner API
- Less boilerplate in components
- Centralized theme logic

**Cons:**
- Requires wrapping app in provider
- More upfront work
- Potential re-render concerns

### Option 3: CSS Variables (Best for Web)
Not suitable for React Native (no CSS)

## Implementation Steps

### Phase 1: Core Screens (High Priority)
Update these screens to use dynamic colors:

1. **App.tsx** - Root background
2. **AuthScreen.tsx** - Login/signup background
3. **ProfileScreen.tsx** - Profile background
4. **SelfScreen.tsx** - Self screen background
5. **LibraryScreen.tsx** - Library background

**Example for AuthScreen.tsx:**
```typescript
// Before
<Box sx={{ flex: 1, backgroundColor: Theme.colors.voidIndigo }}>

// After
import { useTheme } from '../hooks/useTheme';
import { getThemeColors } from '../utils/themeColors';

function AuthScreen() {
    const { isDark } = useTheme();
    const colors = getThemeColors(isDark);
    
    return (
        <Box sx={{ flex: 1, backgroundColor: colors.primary }}>
```

### Phase 2: Common Components (Medium Priority)
Update shared components:

1. **GlobalHeader.tsx**
2. **IdentityCard.tsx**
3. **UserStatsCard.tsx**
4. **LibraryResourceCard.tsx**
5. **SanctuaryCard.tsx**

### Phase 3: All Remaining Components (Low Priority)
Update all other components to respect theme

## Migration Guide

### Step-by-Step Migration for Each Component

1. **Import the hooks:**
```typescript
import { useTheme } from '../hooks/useTheme';
import { getThemeColors } from '../utils/themeColors';
```

2. **Get theme colors:**
```typescript
function MyComponent() {
    const { isDark } = useTheme();
    const colors = getThemeColors(isDark);
```

3. **Replace hardcoded colors:**
```typescript
// Background colors
Theme.colors.voidIndigo → colors.primary
Theme.colors.deepIndigo → colors.secondary
Theme.colors.midnightBlue → colors.tertiary
Theme.colors.creamSilence → colors.primary (light mode)

// Text colors
Theme.colors.sacredWhite → colors.text
Theme.colors.mistGray → colors.textSecondary
Theme.colors.dimGray → colors.textTertiary
Theme.colors.charcoalTruth → colors.text (light mode)

// Action colors (stay the same)
Theme.colors.sanctuarySaffron → colors.action
Theme.colors.sageGreen → colors.success
Theme.colors.emberRed → colors.error
```

4. **Test both modes:**
- Switch theme to light mode in profile settings
- Verify all screens look good
- Switch to dark mode
- Verify all screens look good
- Test auto mode at different times

## Color Mapping Reference

| Theme Constant | Light Mode | Dark Mode | New Variable |
|----------------|------------|-----------|--------------|
| Background Primary | creamSilence | voidIndigo | colors.primary |
| Background Secondary | lotusWhite | deepIndigo | colors.secondary |
| Background Tertiary | sandStone | midnightBlue | colors.tertiary |
| Text Primary | charcoalTruth | sacredWhite | colors.text |
| Text Secondary | slateGray | pearlGray | colors.textSecondary |
| Text Tertiary | stoneGray | mistGray | colors.textTertiary |
| Action | sanctuarySaffron | sanctuarySaffron | colors.action |
| Success | sageGreen | sageGreen | colors.success |
| Error | emberRed | emberRed | colors.error |
| Border | rgba(0,0,0,0.1) | rgba(255,255,255,0.1) | colors.border |

## Testing Checklist

After implementing theme switching:

- [ ] Switch between light/dark/auto modes in profile settings
- [ ] Verify all backgrounds change appropriately
- [ ] Verify all text remains readable
- [ ] Check all buttons and interactive elements
- [ ] Test auto mode at 7 AM (should be light)
- [ ] Test auto mode at 9 PM (should be dark)
- [ ] Check theme persists after app restart
- [ ] Verify no flash of wrong theme on startup

## Performance Considerations

1. **Re-render optimization:**
   - `useTheme` hook will cause re-renders when theme changes
   - This is expected and necessary
   - Use React.memo for expensive components if needed

2. **Startup performance:**
   - Theme is loaded from AsyncStorage on app start
   - Default to 'light' immediately (no flash)
   - Load persisted preference asynchronously

3. **Auto mode timer:**
   - Checks time every minute (60000ms)
   - Minimal performance impact
   - Only active when auto mode is selected

## Future Enhancements

1. **Smooth transitions:**
   - Add animated transition between themes
   - Use Reanimated for smooth color interpolation

2. **More granular control:**
   - Custom accent colors
   - Font size preferences
   - High contrast mode

3. **System theme sync:**
   - Respect device dark mode setting
   - Add "follow system" option

4. **Per-screen themes:**
   - Allow certain screens to override theme
   - Example: Always dark for meditation features

## Current Implementation Status

- ✅ Theme selection UI complete
- ✅ State management complete
- ✅ useTheme hook complete
- ✅ getThemeColors utility created
- ❌ **No components actually use dynamic colors yet**
- ❌ Theme provider not implemented

## Recommended Next Steps

**Option A: Quick Win (2-3 hours)**
1. Update 5 main screens to use `getThemeColors`
2. Test theme switching works
3. Document for team to migrate other components

**Option B: Proper Implementation (1-2 days)**
1. Create ThemeProvider component
2. Wrap app in provider
3. Create useThemeContext hook
4. Update all components to use context
5. Test thoroughly

**Recommended:** Start with Option A for quick progress, then migrate to Option B over time.

## Documentation for Developers

Add to `UX_CONSISTENCY_GUIDE.md`:

### Using Theme Colors

```typescript
// ❌ DON'T: Use hardcoded colors
<Box sx={{ backgroundColor: Theme.colors.voidIndigo }}>

// ✅ DO: Use dynamic theme colors
import { useTheme } from '../hooks/useTheme';
import { getThemeColors } from '../utils/themeColors';

const { isDark } = useTheme();
const colors = getThemeColors(isDark);

<Box sx={{ backgroundColor: colors.primary }}>
```

### Available Theme Colors

- `colors.primary` - Main background
- `colors.secondary` - Secondary background (cards)
- `colors.tertiary` - Tertiary background (inputs)
- `colors.text` - Primary text
- `colors.textSecondary` - Secondary text
- `colors.textTertiary` - Disabled/tertiary text
- `colors.action` - Action buttons (saffron)
- `colors.success` - Success states
- `colors.error` - Error states
- `colors.border` - Border colors
- `colors.overlay` - Modal overlays
- `colors.shadow` - Shadow colors

## Conclusion

The theme system architecture is solid, but needs component-level integration to actually switch colors. The `getThemeColors` utility provides a clean migration path. Each component can be updated independently without breaking existing functionality.

**Status:** Theme framework complete, waiting for component integration
**Effort to complete:** 2-3 hours for core screens, 8-10 hours for full app
**Priority:** Medium (nice-to-have, not a beta blocker)
