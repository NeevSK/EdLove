# UI Component Library

## Usage Rules

### ✅ DO
```typescript
// Import from the abstraction layer
import { Button, ButtonText, Spinner } from '@/ui';
```

### ❌ DON'T
```typescript
// NEVER import directly from Gluestack UI
import { Button } from '@gluestack-ui/themed';
```

## Adding New Components

1. Check if component exists in `src/ui/index.ts`
2. If not, add it using the direct import pattern:
   ```typescript
   export { ComponentName } from '@gluestack-ui/themed/build/components/ComponentName';
   ```
3. Update this README with usage examples if needed

## Currently Available Components

### Layout
- `Box`, `Center`, `HStack`, `VStack`, `View`

### Loading
- `Spinner`

### Typography
- `Text`, `Heading`

### Forms
- `Input`, `InputField`, `InputSlot`, `InputIcon`
- `Button`, `ButtonText`, `ButtonSpinner`, `ButtonIcon`
- `Select`, `SelectTrigger`, `SelectInput`, `SelectIcon`, `SelectPortal`, `SelectBackdrop`, `SelectContent`, `SelectDragIndicatorWrapper`, `SelectDragIndicator`, `SelectItem`
- `FormControl`, `FormControlError`, `FormControlErrorIcon`, `FormControlErrorText`, `FormControlHelper`, `FormControlHelperText`, `FormControlLabel`, `FormControlLabelText`

### Provider
- `GluestackUIProvider`

## Why This Pattern?

- **TypeScript Performance**: Avoids stack overflow from aggregate index resolution
- **Bundle Optimization**: Only ships components we actually use (~80% smaller than full library)
- **Future-Proofing**: Easy to swap UI libraries later (just modify this one file)
- **Documentation**: This file is our component inventory

## Troubleshooting

### "Module not found" error
Make sure `tsconfig.json` has the path alias configured:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Component not in index.ts
Add it following the direct import pattern. Check the component name in `node_modules/@gluestack-ui/themed/build/components/`.
