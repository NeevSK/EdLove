import type React from 'react';
import {
  FlatList as RNFlatList,
  SectionList as RNSectionList,
  Switch as RNSwitch,
  Text as RNText,
  View as RNView,
} from 'react-native';

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

import { Box } from '@repo/ui/components-legacy/box';
import { Button, ButtonText } from '@repo/ui/components-legacy/button';
import { Center } from '@repo/ui/components-legacy/center';
import { Divider, Heading, Spinner } from '@repo/ui/components-legacy/divider';
import { HStack } from '@repo/ui/components-legacy/hstack';
import { Image } from '@repo/ui/components-legacy/image';
import { Text } from '@repo/ui/components-legacy/text';
import { Pressable, ScrollView, View } from '@repo/ui/components-legacy/view';
import { VStack } from '@repo/ui/components-legacy/vstack';

export {
  Box,
  Button,
  ButtonText,
  Center,
  Divider,
  Heading,
  HStack,
  Image,
  Pressable,
  ScrollView,
  Spinner,
  Text,
  View,
  VStack,
};

import {
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
  FormControlHelper,
  FormControlHelperText,
  FormControlLabel,
  FormControlLabelText,
  type IFormControlProps,
  FormControl as LocalFormControl,
} from '@repo/ui/components-legacy/form-control';

export const FormControl = LocalFormControl as React.ComponentType<IFormControlProps>;
export {
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
  FormControlHelper,
  FormControlHelperText,
  FormControlLabel,
  FormControlLabelText,
};

import { Input, InputField, InputIcon, InputSlot } from '@repo/ui/components-legacy/input';

export { Input, InputField, InputIcon, InputSlot };

export const Toast = RNView as any;
export const ToastTitle = RNText as any;
export const ToastDescription = RNText as any;
export const useToast = () => ({ show: () => {} }) as any;

export const ButtonSpinner = View as any;
export const ButtonIcon = (_props: any) => null;

export const Select = RNView as any;
export const SelectTrigger = RNView as any;
export const SelectInput = RNView as any;
export const SelectIcon = RNView as any;
export const SelectPortal = RNView as any;
export const SelectBackdrop = RNView as any;
export const SelectContent = RNView as any;
export const SelectDragIndicatorWrapper = RNView as any;
export const SelectDragIndicator = RNView as any;
export const SelectItem = RNView as any;

export const Avatar = RNView as any;
export const AvatarFallbackText = RNText as any;
export const AvatarImage = RNView as any;

export const Actionsheet = RNView as any;
export const ActionsheetBackdrop = RNView as any;
export const ActionsheetContent = RNView as any;
export const ActionsheetItem = RNView as any;
export const ActionsheetItemText = RNText as any;
export const ActionsheetDragIndicator = RNView as any;
export const ActionsheetDragIndicatorWrapper = RNView as any;

export const Modal = RNView as any;
export const ModalBackdrop = RNView as any;
export const ModalContent = RNView as any;
export const ModalHeader = RNView as any;
export const ModalBody = RNView as any;
export const ModalFooter = RNView as any;
export const ModalCloseButton = RNView as any;

export const Card = RNView as any;
export const FlatList = RNFlatList as any;
export const SectionList = RNSectionList as any;
export const Switch = RNSwitch as any;

export const Checkbox = RNView as any;
export const CheckboxIndicator = RNView as any;
export const CheckboxIcon = (_props: any) => null;
export const CheckboxLabel = RNText as any;
export const CheckboxGroup = RNView as any;

export const Link = RNView as any;
export const LinkText = RNText as any;

export const Radio = RNView as any;
export const RadioGroup = RNView as any;
export const RadioIndicator = RNView as any;
export const RadioIcon = (_props: any) => null;
export const RadioLabel = RNText as any;

export const Fab = RNView as any;
export const FabLabel = RNText as any;
export const FabIcon = (_props: any) => null;

export const Progress = RNView as any;
export const ProgressFilledTrack = RNView as any;

export const Slider = RNView as any;
export const SliderTrack = RNView as any;
export const SliderFilledTrack = RNView as any;
export const SliderThumb = RNView as any;

export const Textarea = RNView as any;
export const TextareaInput = RNView as any;

export const GluestackUIProvider = ({ children }: any) => children;

// Gluestack v3 (NativeWind) doesn't use the legacy createConfig system.
// We provide a stub to maintain compatibility with existing config files
// while we transition to full Tailwind/NativeWind token management.
export const createConfig = (config: any) => config;
export const gluestackConfig = {
  tokens: {
    colors: {},
    space: {},
    fontSizes: {},
    lineHeights: {},
    letterSpacings: {},
    fonts: {},
    fontWeights: {},
    radii: {},
    borderWidths: {},
    breakpoints: {},
    mediaQueries: {},
    opacity: {},
    shadows: {},
    zIndex: {},
  },
  aliases: {},
};
