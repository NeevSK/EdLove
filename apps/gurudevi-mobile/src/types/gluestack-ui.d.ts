/* biome-ignore-all lint/suspicious/noExplicitAny: library shim */
declare module '@gluestack-ui/themed' {
  export const GluestackUIProvider: any;
  export const VStack: any;
  export const HStack: any;
  export const Box: any;
  export const Text: any;
  export const Heading: any;
  export const Button: any;
  export const ButtonText: any;
  export const config: any;
  export const useToast: any;
  export const Toast: any;
  export const ToastTitle: any;
  export const Spinner: any;
}

// Support for direct sub-module imports used in UI Abstraction Layer
declare module '@gluestack-ui/themed/build/components/*' {
  const component: any;
  export = component;
}

declare module '@gluestack-ui/themed/build/components/VStack' {
  export const VStack: any;
}
declare module '@gluestack-ui/themed/build/components/HStack' {
  export const HStack: any;
}
declare module '@gluestack-ui/themed/build/components/Box' {
  export const Box: any;
}
declare module '@gluestack-ui/themed/build/components/Text' {
  export const Text: any;
}
declare module '@gluestack-ui/themed/build/components/Heading' {
  export const Heading: any;
}
declare module '@gluestack-ui/themed/build/components/Button' {
  export const Button: any;
  export const ButtonText: any;
  export const ButtonIcon: any;
  export const ButtonSpinner: any;
}
declare module '@gluestack-ui/themed/build/components/Input' {
  export const Input: any;
  export const InputField: any;
  export const InputSlot: any;
  export const InputIcon: any;
}
declare module '@gluestack-ui/themed/build/components/Toast' {
  export const Toast: any;
  export const ToastTitle: any;
  export const ToastDescription: any;
  export const useToast: any;
}
declare module '@gluestack-ui/themed/build/components/Spinner' {
  export const Spinner: any;
}
declare module '@gluestack-ui/themed/build/components/Center' {
  export const Center: any;
}
declare module '@gluestack-ui/themed/build/components/ScrollView' {
  export const ScrollView: any;
}
declare module '@gluestack-ui/themed/build/components/Pressable' {
  export const Pressable: any;
}
declare module '@gluestack-ui/themed/build/components/Select' {
  export const Select: any;
  export const SelectTrigger: any;
  export const SelectInput: any;
  export const SelectIcon: any;
  export const SelectPortal: any;
  export const SelectBackdrop: any;
  export const SelectContent: any;
  export const SelectDragIndicatorWrapper: any;
  export const SelectDragIndicator: any;
  export const SelectItem: any;
}
declare module '@gluestack-ui/themed/build/components/FormControl' {
  export const FormControl: any;
  export const FormControlError: any;
  export const FormControlErrorIcon: any;
  export const FormControlErrorText: any;
  export const FormControlHelper: any;
  export const FormControlHelperText: any;
  export const FormControlLabel: any;
  export const FormControlLabelText: any;
}
declare module '@gluestack-ui/themed/build/components/Divider' {
  export const Divider: any;
}
declare module '@gluestack-ui/themed/build/components/Icons' {
  export const Icon: any;
  export const CloseIcon: any;
}
declare module '@gluestack-ui/themed/build/components/Modal' {
  export const Modal: any;
  export const ModalBackdrop: any;
  export const ModalContent: any;
  export const ModalHeader: any;
  export const ModalBody: any;
  export const ModalFooter: any;
  export const ModalCloseButton: any;
}
declare module '@gluestack-ui/themed/build/components/Avatar' {
  export const Avatar: any;
  export const AvatarFallbackText: any;
  export const AvatarImage: any;
}
declare module '@gluestack-ui/themed/build/components/Switch' {
  export const Switch: any;
}
declare module '@gluestack-ui/themed/build/components/Textarea' {
  export const Textarea: any;
  export const TextareaInput: any;
}
declare module '@gluestack-ui/themed/build/components/Checkbox' {
  export const Checkbox: any;
  export const CheckboxIndicator: any;
  export const CheckboxIcon: any;
  export const CheckboxLabel: any;
  export const CheckboxGroup: any;
}
declare module '@gluestack-ui/themed/build/components/View' {
  export const View: any;
}
declare module '@gluestack-ui/themed/build/components/Actionsheet' {
  export const Actionsheet: any;
  export const ActionsheetBackdrop: any;
  export const ActionsheetContent: any;
  export const ActionsheetItem: any;
  export const ActionsheetItemText: any;
  export const ActionsheetDragIndicator: any;
  export const ActionsheetDragIndicatorWrapper: any;
}
declare module '@gluestack-ui/themed/build/components/FlatList' {
  export const FlatList: any;
}
declare module '@gluestack-ui/themed/build/components/SectionList' {
  export const SectionList: any;
}
declare module '@gluestack-ui/themed/build/components/Fab' {
  export const Fab: any;
  export const FabLabel: any;
  export const FabIcon: any;
}
declare module '@gluestack-ui/themed/build/components/Progress' {
  export const Progress: any;
  export const ProgressFilledTrack: any;
}
