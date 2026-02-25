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
import { Box as BaseBox } from '@gluestack-ui/themed/build/components/Box';
import { Center as BaseCenter } from '@gluestack-ui/themed/build/components/Center';
import { HStack as BaseHStack } from '@gluestack-ui/themed/build/components/HStack';
import { VStack as BaseVStack } from '@gluestack-ui/themed/build/components/VStack';
import { View as BaseView } from '@gluestack-ui/themed/build/components/View';

export const Box = BaseBox as any;
export const Center = BaseCenter as any;
export const HStack = BaseHStack as any;
export const VStack = BaseVStack as any;
export const View = BaseView as any;
export { ScrollView } from '@gluestack-ui/themed/build/components/ScrollView';
export { Pressable } from '@gluestack-ui/themed/build/components/Pressable';

// ============================================================================
// Loading States
// ============================================================================
export { Spinner } from '@gluestack-ui/themed/build/components/Spinner';

// ============================================================================
// Toast & Notifications
// ============================================================================
import {
    Toast as BaseToast,
    ToastTitle as BaseToastTitle,
    ToastDescription as BaseToastDescription,
    useToast as BaseUseToast
} from '@gluestack-ui/themed/build/components/Toast';

export const Toast = BaseToast as any;
export const ToastTitle = BaseToastTitle as any;
export const ToastDescription = BaseToastDescription as any;
export const useToast = BaseUseToast as any;

// ============================================================================
// Typography & Presentation
// ============================================================================
import { Text as BaseText } from '@gluestack-ui/themed/build/components/Text';
export const Text = BaseText as any;
import { Heading as BaseHeading } from '@gluestack-ui/themed/build/components/Heading';
export const Heading = BaseHeading as any;
export { Divider } from '@gluestack-ui/themed/build/components/Divider';

// ============================================================================
// Form Components
// ============================================================================
export {
    Input,
    InputField,
    InputSlot,
    InputIcon
} from '@gluestack-ui/themed/build/components/Input';

import {
    Button as BaseButton,
    ButtonText as BaseButtonText,
    ButtonSpinner as BaseButtonSpinner,
    ButtonIcon as BaseButtonIcon
} from '@gluestack-ui/themed/build/components/Button';

export const Button = BaseButton as any;
export const ButtonText = BaseButtonText as any;
export const ButtonSpinner = BaseButtonSpinner as any;
export const ButtonIcon = BaseButtonIcon as any;

import {
    Select as BaseSelect,
    SelectTrigger as BaseSelectTrigger,
    SelectInput as BaseSelectInput,
    SelectIcon as BaseSelectIcon,
    SelectPortal as BaseSelectPortal,
    SelectBackdrop as BaseSelectBackdrop,
    SelectContent as BaseSelectContent,
    SelectDragIndicatorWrapper as BaseSelectDragIndicatorWrapper,
    SelectDragIndicator as BaseSelectDragIndicator,
    SelectItem as BaseSelectItem
} from '@gluestack-ui/themed/build/components/Select';

export const Select = BaseSelect as any;
export const SelectTrigger = BaseSelectTrigger as any;
export const SelectInput = BaseSelectInput as any;
export const SelectIcon = BaseSelectIcon as any;
export const SelectPortal = BaseSelectPortal as any;
export const SelectBackdrop = BaseSelectBackdrop as any;
export const SelectContent = BaseSelectContent as any;
export const SelectDragIndicatorWrapper = BaseSelectDragIndicatorWrapper as any;
export const SelectDragIndicator = BaseSelectDragIndicator as any;
export const SelectItem = BaseSelectItem as any;

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
import {
    Avatar as BaseAvatar,
    AvatarFallbackText as BaseAvatarFallbackText,
    AvatarImage as BaseAvatarImage
} from '@gluestack-ui/themed/build/components/Avatar';

export const Avatar = BaseAvatar as any;
export const AvatarFallbackText = BaseAvatarFallbackText as any;
export const AvatarImage = BaseAvatarImage as any;

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
} from '@gluestack-ui/themed/build/components/Modal';

import { Icon as BaseIcon, CloseIcon as BaseCloseIcon } from '@gluestack-ui/themed/build/components/Icons';
export const Icon = BaseIcon as any;
export const CloseIcon = BaseCloseIcon as any;

// Link with relaxed types
import { Link as BaseLink, LinkText as BaseLinkText } from '@gluestack-ui/themed/build/components/Link';
export const Link = BaseLink as any;
export const LinkText = BaseLinkText as any;

import { Check } from 'lucide-react-native';
export const CheckIcon = Check;

import { Image as BaseImage } from '@gluestack-ui/themed/build/components/Image';
export const Image = BaseImage as any;
export { FlatList } from '@gluestack-ui/themed/build/components/FlatList';
export { SectionList } from '@gluestack-ui/themed/build/components/SectionList';

// Animations
export { FadeInDown, FadeInUp, FadeInRight, FadeInLeft } from 'react-native-reanimated';

export {
    Checkbox,
    CheckboxIndicator,
    CheckboxIcon,
    CheckboxLabel,
    CheckboxGroup,
} from '@gluestack-ui/themed/build/components/Checkbox';

// Radio with relaxed types
// Radio with relaxed types
import {
    Radio as BaseRadio,
    RadioGroup as BaseRadioGroup,
    RadioIndicator as BaseRadioIndicator,
    RadioIcon as BaseRadioIcon,
    RadioLabel as BaseRadioLabel
} from '@gluestack-ui/themed/build/components/Radio';

export const Radio = BaseRadio as any;
export const RadioGroup = BaseRadioGroup as any;
export const RadioIndicator = BaseRadioIndicator as any;
export const RadioIcon = BaseRadioIcon as any;
export const RadioLabel = BaseRadioLabel as any;

export {
    Actionsheet,
    ActionsheetBackdrop,
    ActionsheetContent,
    ActionsheetItem,
    ActionsheetItemText,
    ActionsheetDragIndicator,
    ActionsheetDragIndicatorWrapper,
} from '@gluestack-ui/themed/build/components/Actionsheet';

import {
    Fab as BaseFab,
    FabLabel as BaseFabLabel,
    FabIcon as BaseFabIcon,
} from '@gluestack-ui/themed/build/components/Fab';

export const Fab = BaseFab as any;
export const FabLabel = BaseFabLabel as any;
export const FabIcon = BaseFabIcon as any;

export {
    Progress,
    ProgressFilledTrack,
} from '@gluestack-ui/themed/build/components/Progress';

// Slider with relaxed types
import {
    Slider as BaseSlider,
    SliderTrack as BaseSliderTrack,
    SliderFilledTrack as BaseSliderFilledTrack,
    SliderThumb as BaseSliderThumb,
} from '@gluestack-ui/themed/build/components/Slider';
export const Slider = BaseSlider as any;
export const SliderTrack = BaseSliderTrack as any;
export const SliderFilledTrack = BaseSliderFilledTrack as any;
export const SliderThumb = BaseSliderThumb as any;

// ============================================================================
// Provider (special case - keep from main export)
// ============================================================================
export { GluestackUIProvider } from '@gluestack-ui/themed/build/components/Provider';

// ============================================================================
// ADD COMPONENTS AS NEEDED
// DO NOT PREEMPTIVELY IMPORT UNUSED COMPONENTS
// ============================================================================
