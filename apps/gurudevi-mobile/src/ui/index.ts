/**
 * UI Abstraction Layer
 * 
 * RULE: This is the ONLY file that imports from @gluestack-ui
 * All application code MUST import UI components from this file.
 * 
 * WHY: 
 * 1. Fixes TypeScript stack overflow (direct imports)
 * 2. Improves tree-shaking (only bundle what we use)
 * 3. Enables easy refactoring (change one file to swap libraries)
 * 4. Documents our actual UI component inventory
 */

// ============================================================================
// Layout Components
// ============================================================================
export { Box } from '@gluestack-ui/themed/build/components/Box';
export { Center } from '@gluestack-ui/themed/build/components/Center';
export { HStack } from '@gluestack-ui/themed/build/components/HStack';
export { VStack } from '@gluestack-ui/themed/build/components/VStack';
export { View } from '@gluestack-ui/themed/build/components/View';
export { ScrollView } from '@gluestack-ui/themed/build/components/ScrollView';
export { Pressable } from '@gluestack-ui/themed/build/components/Pressable';

// ============================================================================
// Loading States
// ============================================================================
export { Spinner } from '@gluestack-ui/themed/build/components/Spinner';

// ============================================================================
// Toast & Notifications
// ============================================================================
export {
    Toast,
    ToastTitle,
    ToastDescription,
    useToast
} from '@gluestack-ui/themed/build/components/Toast';

// ============================================================================
// Typography
// ============================================================================
export { Text } from '@gluestack-ui/themed/build/components/Text';
export { Heading } from '@gluestack-ui/themed/build/components/Heading';

// ============================================================================
// Form Components
// ============================================================================
export {
    Input,
    InputField,
    InputSlot,
    InputIcon
} from '@gluestack-ui/themed/build/components/Input';

export {
    Button,
    ButtonText,
    ButtonSpinner,
    ButtonIcon
} from '@gluestack-ui/themed/build/components/Button';

export {
    Select,
    SelectTrigger,
    SelectInput,
    SelectIcon,
    SelectPortal,
    SelectBackdrop,
    SelectContent,
    SelectDragIndicatorWrapper,
    SelectDragIndicator,
    SelectItem
} from '@gluestack-ui/themed/build/components/Select';

export {
    FormControl,
    FormControlError,
    FormControlErrorIcon,
    FormControlErrorText,
    FormControlHelper,
    FormControlHelperText,
    FormControlLabel,
    FormControlLabelText
} from '@gluestack-ui/themed/build/components/FormControl';

export {
    Textarea,
    TextareaInput
} from '@gluestack-ui/themed/build/components/Textarea';

export { Switch } from '@gluestack-ui/themed/build/components/Switch';

// ============================================================================
// Avatar Components
// ============================================================================
export {
    Avatar,
    AvatarFallbackText,
    AvatarImage
} from '@gluestack-ui/themed/build/components/Avatar';

// ============================================================================
// Modal Components
// ============================================================================
export {
    Modal,
    ModalBackdrop,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter
} from '@gluestack-ui/themed/build/components/Modal';

// ============================================================================
// Provider (special case - keep from main export)
// ============================================================================
export { GluestackUIProvider } from '@gluestack-ui/themed';

// ============================================================================
// ADD COMPONENTS AS NEEDED
// DO NOT PREEMPTIVELY IMPORT UNUSED COMPONENTS
// ============================================================================
