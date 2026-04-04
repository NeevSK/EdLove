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
import { ScrollView as BaseScrollView } from '@gluestack-ui/themed/build/components/ScrollView';
import { Pressable as BasePressable } from '@gluestack-ui/themed/build/components/Pressable';

export const Box = BaseBox as any;
export const Center = BaseCenter as any;
export const HStack = BaseHStack as any;
export const VStack = BaseVStack as any;
export const View = BaseView as any;
export const ScrollView = BaseScrollView as any;
export const Pressable = BasePressable as any;

// ============================================================================
// Loading States
// ============================================================================
import { Spinner as BaseSpinner } from '@gluestack-ui/themed/build/components/Spinner';
export const Spinner = BaseSpinner as any;

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
import { Divider as BaseDivider } from '@gluestack-ui/themed/build/components/Divider';
export const Divider = BaseDivider as any;

// ============================================================================
// Form Components
// ============================================================================
import {
    Input as BaseInput,
    InputField as BaseInputField,
    InputSlot as BaseInputSlot,
    InputIcon as BaseInputIcon
} from '@gluestack-ui/themed/build/components/Input';

export const Input = BaseInput as any;
export const InputField = BaseInputField as any;
export const InputSlot = BaseInputSlot as any;
export const InputIcon = BaseInputIcon as any;

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

import {
    FormControl as BaseFormControl,
    FormControlError as BaseFormControlError,
    FormControlErrorIcon as BaseFormControlErrorIcon,
    FormControlErrorText as BaseFormControlErrorText,
    FormControlHelper as BaseFormControlHelper,
    FormControlHelperText as BaseFormControlHelperText,
    FormControlLabel as BaseFormControlLabel,
    FormControlLabelText as BaseFormControlLabelText
} from '@gluestack-ui/themed/build/components/FormControl';

export const FormControl = BaseFormControl as any;
export const FormControlError = BaseFormControlError as any;
export const FormControlErrorIcon = BaseFormControlErrorIcon as any;
export const FormControlErrorText = BaseFormControlErrorText as any;
export const FormControlHelper = BaseFormControlHelper as any;
export const FormControlHelperText = BaseFormControlHelperText as any;
export const FormControlLabel = BaseFormControlLabel as any;
export const FormControlLabelText = BaseFormControlLabelText as any;

import {
    Textarea as BaseTextarea,
    TextareaInput as BaseTextareaInput
} from '@gluestack-ui/themed/build/components/Textarea';
export const Textarea = BaseTextarea as any;
export const TextareaInput = BaseTextareaInput as any;

import { Switch as BaseSwitch } from '@gluestack-ui/themed/build/components/Switch';
export const Switch = BaseSwitch as any;

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
// Navigation & Organization
// ============================================================================
import {
    Tabs as BaseTabs,
    TabsTabList as BaseTabsTabList,
    TabsTab as BaseTabsTab,
    TabsTabTitle as BaseTabsTabTitle,
    TabsTabPanel as BaseTabsTabPanel,
} from '@gluestack-ui/themed/build/components/Tabs';

export const Tabs = BaseTabs as any;
export const TabList = BaseTabsTabList as any;
export const TabTrigger = BaseTabsTab as any;
export const TabTitle = BaseTabsTabTitle as any;
export const TabContent = BaseTabsTabPanel as any;

export const ChevronLeftIcon = ChevronLeft;
export const ChevronRightIcon = ChevronRight;

import { Card as BaseCard } from '@gluestack-ui/themed/build/components/Card';
export const Card = BaseCard as any;

// ============================================================================
// Modal Components
// ============================================================================
import {
    Modal as BaseModal,
    ModalBackdrop as BaseModalBackdrop,
    ModalContent as BaseModalContent,
    ModalHeader as BaseModalHeader,
    ModalBody as BaseModalBody,
    ModalFooter as BaseModalFooter,
    ModalCloseButton as BaseModalCloseButton
} from '@gluestack-ui/themed/build/components/Modal';

export const Modal = BaseModal as any;
export const ModalBackdrop = BaseModalBackdrop as any;
export const ModalContent = BaseModalContent as any;
export const ModalHeader = BaseModalHeader as any;
export const ModalBody = BaseModalBody as any;
export const ModalFooter = BaseModalFooter as any;
export const ModalCloseButton = BaseModalCloseButton as any;

import { Icon as BaseIcon, CloseIcon as BaseCloseIcon } from '@gluestack-ui/themed/build/components/Icons';
export const Icon = BaseIcon as any;
export const CloseIcon = BaseCloseIcon as any;
import { ChevronLeft, ChevronRight, Check, ArrowLeft, Info } from 'lucide-react-native';
export { ChevronLeft, ChevronRight };
export const CheckIcon = Check;
export const ArrowLeftIcon = ArrowLeft;
export const InfoIcon = Info;

import { Image as BaseImage } from '@gluestack-ui/themed/build/components/Image';
export const Image = BaseImage as any;
import { FlatList as BaseFlatList } from '@gluestack-ui/themed/build/components/FlatList';
export const FlatList = BaseFlatList as any;
import { SectionList as BaseSectionList } from '@gluestack-ui/themed/build/components/SectionList';
export const SectionList = BaseSectionList as any;

// Animations
export { FadeInDown, FadeInUp, FadeInRight, FadeInLeft } from 'react-native-reanimated';

import {
    Checkbox as BaseCheckbox,
    CheckboxIndicator as BaseCheckboxIndicator,
    CheckboxIcon as BaseCheckboxIcon,
    CheckboxLabel as BaseCheckboxLabel,
    CheckboxGroup as BaseCheckboxGroup,
} from '@gluestack-ui/themed/build/components/Checkbox';

export const Checkbox = BaseCheckbox as any;
export const CheckboxIndicator = BaseCheckboxIndicator as any;
export const CheckboxIcon = BaseCheckboxIcon as any;
export const CheckboxLabel = BaseCheckboxLabel as any;
export const CheckboxGroup = BaseCheckboxGroup as any;

import {
    Link as BaseLink,
    LinkText as BaseLinkText,
} from '@gluestack-ui/themed/build/components/Link';

export const Link = BaseLink as any;
export const LinkText = BaseLinkText as any;

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

import {
    Actionsheet as BaseActionsheet,
    ActionsheetBackdrop as BaseActionsheetBackdrop,
    ActionsheetContent as BaseActionsheetContent,
    ActionsheetItem as BaseActionsheetItem,
    ActionsheetItemText as BaseActionsheetItemText,
    ActionsheetDragIndicator as BaseActionsheetDragIndicator,
    ActionsheetDragIndicatorWrapper as BaseActionsheetDragIndicatorWrapper,
} from '@gluestack-ui/themed/build/components/Actionsheet';

export const Actionsheet = BaseActionsheet as any;
export const ActionsheetBackdrop = BaseActionsheetBackdrop as any;
export const ActionsheetContent = BaseActionsheetContent as any;
export const ActionsheetItem = BaseActionsheetItem as any;
export const ActionsheetItemText = BaseActionsheetItemText as any;
export const ActionsheetDragIndicator = BaseActionsheetDragIndicator as any;
export const ActionsheetDragIndicatorWrapper = BaseActionsheetDragIndicatorWrapper as any;

import {
    Fab as BaseFab,
    FabLabel as BaseFabLabel,
    FabIcon as BaseFabIcon,
} from '@gluestack-ui/themed/build/components/Fab';

export const Fab = BaseFab as any;
export const FabLabel = BaseFabLabel as any;
export const FabIcon = BaseFabIcon as any;

import {
    Progress as BaseProgress,
    ProgressFilledTrack as BaseProgressFilledTrack,
} from '@gluestack-ui/themed/build/components/Progress';

export const Progress = BaseProgress as any;
export const ProgressFilledTrack = BaseProgressFilledTrack as any;

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
// Provider & Configuration
// ============================================================================
export { GluestackUIProvider } from '@gluestack-ui/themed/build/components/Provider';
import { createConfig as BaseCreateConfig } from '@gluestack-style/react';
export const createConfig = BaseCreateConfig as any;
export { config as gluestackConfig } from '@gluestack-ui/config';

// ============================================================================
// ADD COMPONENTS AS NEEDED
// DO NOT PREEMPTIVELY IMPORT UNUSED COMPONENTS
// ============================================================================
