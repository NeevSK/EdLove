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
export { Box } from '@gluestack-ui/themed';
export { Center } from '@gluestack-ui/themed';
export { HStack } from '@gluestack-ui/themed';
export { VStack } from '@gluestack-ui/themed';
export { View } from '@gluestack-ui/themed';
export { ScrollView } from '@gluestack-ui/themed';
export { Pressable } from '@gluestack-ui/themed';

// ============================================================================
// Loading States
// ============================================================================
export { Spinner } from '@gluestack-ui/themed';

// ============================================================================
// Toast & Notifications
// ============================================================================
export {
    Toast,
    ToastTitle,
    ToastDescription,
    useToast
} from '@gluestack-ui/themed';

// ============================================================================
// Typography & Presentation
// ============================================================================
export { Text } from '@gluestack-ui/themed';
export { Heading } from '@gluestack-ui/themed';
export { Divider } from '@gluestack-ui/themed';

// ============================================================================
// Form Components
// ============================================================================
export {
    Input,
    InputField,
    InputSlot,
    InputIcon
} from '@gluestack-ui/themed';

export {
    Button,
    ButtonText,
    ButtonSpinner,
    ButtonIcon
} from '@gluestack-ui/themed';

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
} from '@gluestack-ui/themed';

export {
    FormControl,
    FormControlError,
    FormControlErrorIcon,
    FormControlErrorText,
    FormControlHelper,
    FormControlHelperText,
    FormControlLabel,
    FormControlLabelText
} from '@gluestack-ui/themed';

export {
    Textarea,
    TextareaInput
} from '@gluestack-ui/themed';

export { Switch } from '@gluestack-ui/themed';

// ============================================================================
// Avatar Components
// ============================================================================
export {
    Avatar,
    AvatarFallbackText,
    AvatarImage
} from '@gluestack-ui/themed';

// ============================================================================
// Modal Components
// ============================================================================
export {
    Modal,
    ModalBackdrop,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    ModalCloseButton
} from '@gluestack-ui/themed';

export { Icon } from '@gluestack-ui/themed';
export { CloseIcon } from '@gluestack-ui/themed';
export { Image } from '@gluestack-ui/themed';
export { FlatList } from '@gluestack-ui/themed';
export { SectionList } from '@gluestack-ui/themed';

export {
    Checkbox,
    CheckboxIndicator,
    CheckboxIcon,
    CheckboxLabel,
    CheckboxGroup,
} from '@gluestack-ui/themed';

export {
    Actionsheet,
    ActionsheetBackdrop,
    ActionsheetContent,
    ActionsheetItem,
    ActionsheetItemText,
    ActionsheetDragIndicator,
    ActionsheetDragIndicatorWrapper,
} from '@gluestack-ui/themed';

export {
    Fab,
    FabLabel,
    FabIcon,
} from '@gluestack-ui/themed';

// ============================================================================
// Provider (special case - keep from main export)
// ============================================================================
export { GluestackUIProvider } from '@gluestack-ui/themed';

// ============================================================================
// ADD COMPONENTS AS NEEDED
// DO NOT PREEMPTIVELY IMPORT UNUSED COMPONENTS
// ============================================================================
