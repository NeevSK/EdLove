import { type ReactNode, useEffect, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  type KeyboardEvent,
  Platform,
  ScrollView,
  type StyleProp,
  View,
  type ViewStyle,
} from 'react-native';

interface KeyboardAwareFormProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  keyboardShouldPersistTaps?: 'always' | 'never' | 'handled';
  extraScrollHeight?: number;
  enabled?: boolean;
}

export function KeyboardAwareForm({
  children,
  style,
  keyboardShouldPersistTaps = 'handled',
  extraScrollHeight = 20,
  enabled = true,
}: KeyboardAwareFormProps) {
  if (!enabled) {
    return <View style={style}>{children}</View>;
  }

  if (Platform.OS === 'ios') {
    return (
      <KeyboardAvoidingView behavior="padding" style={style}>
        <ScrollView
          keyboardShouldPersistTaps={keyboardShouldPersistTaps}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: extraScrollHeight }}
        >
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <ScrollView
      keyboardShouldPersistTaps={keyboardShouldPersistTaps}
      contentContainerStyle={{ flexGrow: 1, paddingBottom: extraScrollHeight }}
      style={style}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  );
}

interface KeyboardDismissibleViewProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function KeyboardDismissibleView({ children, style }: KeyboardDismissibleViewProps) {
  return (
    <View
      style={[style, { flex: 1 }]}
      onStartShouldSetResponder={() => {
        Keyboard.dismiss();
        return false;
      }}
    >
      {children}
    </View>
  );
}

export function useKeyboardVisibility() {
  const [isVisible, setIsVisible] = useState(false);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const showListener = (e: KeyboardEvent) => {
      setIsVisible(true);
      setHeight(e.endCoordinates.height);
    };

    const hideListener = () => {
      setIsVisible(false);
      setHeight(0);
    };

    const showSub = Keyboard.addListener('keyboardWillShow', showListener);
    const hideSub = Keyboard.addListener('keyboardWillHide', hideListener);

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  return { isVisible, height };
}

interface KeyboardDismissibleScreenProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  keyboardShouldPersistTaps?: 'always' | 'never' | 'handled';
}

export function KeyboardDismissibleScreen({
  children,
  style,
  keyboardShouldPersistTaps = 'handled',
}: KeyboardDismissibleScreenProps) {
  return (
    <View style={[{ flex: 1 }, style]}>
      <KeyboardAwareForm keyboardShouldPersistTaps={keyboardShouldPersistTaps}>
        <View
          style={{ flex: 1 }}
          onStartShouldSetResponder={() => {
            Keyboard.dismiss();
            return false;
          }}
        >
          {children}
        </View>
      </KeyboardAwareForm>
    </View>
  );
}
