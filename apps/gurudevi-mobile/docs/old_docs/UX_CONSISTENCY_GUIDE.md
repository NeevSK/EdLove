# Gurudevi UX Consistency Guide

## Design Philosophy
The Gurudevi app follows a **Sanctuary Design System** - organic, breathing, and mindful interactions that respect the user's cognitive load while maintaining visual beauty.

## Core Principles

### 1. **Consistent Spacing**
- Always use `Theme.spacing` constants (xs, sm, md, lg, xl, 2xl, 3xl)
- Never use magic numbers for padding/margins
- Standard card padding: `Theme.spacing.lg` (24px)
- Standard section spacing: `Theme.spacing.xl` (32px)

### 2. **Consistent Colors**
- **Primary Actions**: `Theme.colors.sanctuarySaffron` (#E67E22)
- **Success States**: `Theme.colors.sageGreen` (#8FBC8F)
- **Errors**: `Theme.colors.emberRed` (soft, not harsh)
- **Backgrounds**: `Theme.colors.voidIndigo` (primary), `Theme.colors.deepIndigo` (secondary)
- **Text**: `Theme.colors.sacredWhite` (primary), `Theme.colors.mistGray` (secondary)

### 3. **Consistent Typography**
- **Minimum font size**: 14px (accessibility)
- **Line height**: 1.6x for Sinhala/Tamil readability
- **Hierarchy**: Use size="xs", "sm", "md", "lg", "xl" from gluestack-ui
- **Bold for emphasis**: Use `bold` prop, not manual font weights

### 4. **Consistent Corners**
- Cards: `Theme.corners.generous` (24px)
- Buttons: `Theme.corners.comfortable` (16px)
- Small elements: `Theme.corners.tight` (8px)
- Pills/Badges: `Theme.corners.full` (9999px)

### 5. **Consistent Animations**
- **Standard duration**: `Theme.motion.standard` (300ms)
- **Quick interactions**: `Theme.motion.quick` (200ms)
- **Breathing animations**: `Theme.motion.breathing` (4000ms)
- Always use `withSpring()` for organic feel
- Standard spring config: `{ damping: 15, stiffness: 90 }`

### 6. **Haptic Feedback**
- **Light tap**: `hapticLight()` - for navigation, selections
- **Success**: `hapticSuccess()` - for completions, saves
- **Error**: `hapticError()` - for failures, warnings
- **Medium**: `hapticMedium()` - for important actions

### 7. **Component Structure**
All screens should follow this structure:
```tsx
<Box sx={{ flex: 1, backgroundColor: Theme.colors.voidIndigo }}>
  <GlobalHeader title="..." subtitle="..." />
  <ScrollView contentContainerStyle={{ 
    padding: Theme.spacing.lg,
    paddingBottom: 100 // Account for FAB 
  }}>
    <VStack space="2xl">
      {/* Content sections */}
    </VStack>
  </ScrollView>
</Box>
```

### 8. **Loading States**
```tsx
<Center sx={{ flex: 1 }}>
  <Spinner size="large" color={Theme.colors.sanctuarySaffron} />
</Center>
```

### 9. **Empty States**
Always use the `EmptyState` component with:
- Relevant icon
- Clear title
- Actionable description

### 10. **Modal Presentation**
- Use bottom sheet style (slide from bottom)
- Dark overlay: `rgba(0,0,0,0.6)`
- Close button: Top-right X icon
- Standard padding: `Theme.spacing.xl`

## Component Patterns

### Button Styles
```tsx
// Primary Action
<Button 
  sx={{ 
    backgroundColor: Theme.colors.sanctuarySaffron,
    borderRadius: Theme.corners.comfortable 
  }}
>
  <ButtonText>Action</ButtonText>
</Button>

// Secondary Action
<Button variant="outline">
  <ButtonText>Cancel</ButtonText>
</Button>

// Destructive Action
<Button 
  variant="outline"
  sx={{ borderColor: Theme.colors.emberRed }}
>
  <ButtonText color={Theme.colors.emberRed}>Delete</ButtonText>
</Button>
```

### Card Styles
```tsx
<Box sx={{
  backgroundColor: Theme.colors.midnightBlue,
  borderRadius: Theme.corners.generous,
  padding: Theme.spacing.lg,
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.05)',
  ...Theme.shadows.md
}}>
  {/* Card content */}
</Box>
```

### Input Styles
```tsx
<Input
  size="xl"
  variant="outline"
  sx={{
    borderColor: Theme.colors.deepIndigo,
    backgroundColor: Theme.colors.midnightBlue,
    borderRadius: Theme.corners.comfortable,
    height: 56,
  }}
>
  <InputField
    color={Theme.colors.sacredWhite}
    placeholderTextColor={Theme.colors.stoneGray}
  />
</Input>
```

## Screen-Specific Guidelines

### Self Screen
- Horizontal scrollable feature carousel (100px height)
- Core features: 3 items
- More tools: Progressive disclosure with + button
- Active state: Saffron background with white icon/text
- Inactive state: Deep indigo background with gray icon/text

### Library Screen
- Horizontal category carousel at top
- Icon-based search (toggle on click)
- Resource cards with type-based color coding
- Empty state when no resources

### Profile Screen
- Identity card at top (flippable)
- Stats card (role-based content)
- Control sections (language, theme, settings)
- Account actions at bottom (logout, delete)

### Classroom Screen
- List view with cards
- Filter/sort controls at top
- Role-based permissions for actions

### Community Screen
- Feed layout with cards
- Post types clearly differentiated
- Interaction buttons consistent across posts

## Accessibility

1. **Minimum Touch Targets**: 44x44px
2. **Color Contrast**: WCAG AA compliant
3. **Text Scaling**: Support dynamic type
4. **Screen Reader**: Proper labels and hints
5. **Keyboard Navigation**: Logical tab order

## Performance

1. **Lazy Loading**: Use for long lists
2. **Image Optimization**: Compress and resize
3. **Animation Performance**: Use native driver when possible
4. **Memoization**: Use React.memo for expensive components

## Testing Checklist

- [ ] Follows spacing guidelines
- [ ] Uses theme colors (no hardcoded colors)
- [ ] Consistent corner radius
- [ ] Haptic feedback on interactions
- [ ] Loading states implemented
- [ ] Empty states implemented
- [ ] Error states handled gracefully
- [ ] Responsive to different screen sizes
- [ ] Accessible (screen reader, touch targets)
- [ ] Smooth animations (60fps)

## Common Mistakes to Avoid

❌ Hardcoded colors: `color="#FF0000"`
✅ Use theme: `color={Theme.colors.emberRed}`

❌ Magic numbers: `padding: 24`
✅ Use constants: `padding: Theme.spacing.lg`

❌ Inconsistent borders: `borderRadius: 12`
✅ Use system: `borderRadius: Theme.corners.tight`

❌ No haptics: `onPress={() => doAction()}`
✅ With haptics: `onPress={() => { hapticLight(); doAction(); }}`

❌ No loading state: Direct render
✅ Show spinner while loading

❌ Pure black/white: `#000000`, `#FFFFFF`
✅ Use theme: `voidIndigo`, `sacredWhite` (easier on eyes)
