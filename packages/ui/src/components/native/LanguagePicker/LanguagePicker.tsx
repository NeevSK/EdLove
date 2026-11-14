import { useState, useTransition } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { alpha } from '../../../theme';
import { useFeedback } from '../../../theme/native/feedback';
import { useWorld } from '../../../theme/native/WorldContext';
import type {
  LanguageItemMeta,
  LanguagePickerContract,
  WorldLanguage,
} from '../../../theme/contracts';
import { CANONICAL_LANGUAGES } from '../../../theme/contracts';
import { useContainerWidth } from '../Layout/useContainerWidth';

export interface LanguagePickerProps extends LanguagePickerContract {
  style?: object;
}

export function LanguagePicker({
  value,
  onChange,
  variant = 'auto',
  label = 'Language selector',
  languages = CANONICAL_LANGUAGES,
  threshold = 360,
  style,
}: LanguagePickerProps) {
  const world = useWorld();
  const t = world.tokens;
  const feedback = useFeedback();
  const [modalVisible, setModalVisible] = useState(false);
  const [, startTransition] = useTransition();
  const { width, onLayout } = useContainerWidth();

  const isNarrow = width < threshold;
  const effectiveVariant = variant === 'auto' ? (isNarrow ? 'dropdown' : 'capsule') : variant;

  const activeMeta = languages.find((l) => l.code === value) ?? languages[0] ?? {
    code: 'en' as const,
    label: 'English',
    nativeLabel: 'English',
    shortLabel: 'EN',
  };

  const handleSelect = (code: WorldLanguage) => {
    feedback('select');
    startTransition(() => {
      onChange(code);
    });
  };

  if (effectiveVariant === 'dropdown') {
    return (
      <View onLayout={onLayout} style={[styles.container, style]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={label}
          style={[
            styles.trigger,
            {
              backgroundColor: t.raised,
              borderColor: t.line,
            },
          ]}
          onPress={() => {
            feedback('press');
            setModalVisible(true);
          }}
        >
          <Text style={[styles.triggerText, { color: t.ink }]}>
            {activeMeta.shortLabel} ▾
          </Text>
        </Pressable>

        <Modal
          visible={modalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setModalVisible(false)}
        >
          <Pressable
            style={[styles.modalBackdrop, { backgroundColor: alpha(t.ink, 0.5) }]}
            onPress={() => setModalVisible(false)}
          >
            <View
              style={[
                styles.modalContent,
                {
                  backgroundColor: t.raised,
                  borderColor: t.line,
                },
              ]}
            >
              {languages.map((item) => {
                const isSelected = item.code === value;
                return (
                  <Pressable
                    key={item.code}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                    style={[
                      styles.modalItem,
                      isSelected && {
                        backgroundColor: t.lamp,
                      },
                    ]}
                    onPress={() => {
                      handleSelect(item.code);
                      setModalVisible(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.modalNativeLabel,
                        {
                          color: isSelected ? t.onLamp : t.ink,
                        },
                      ]}
                    >
                      {item.nativeLabel}
                    </Text>
                    {item.code !== 'en' && (
                      <Text
                        style={[
                          styles.modalSecondaryLabel,
                          {
                            color: isSelected ? t.onLamp : t.inkSoft,
                          },
                        ]}
                      >
                        {item.label}
                      </Text>
                    )}
                  </Pressable>
                );
              })}
            </View>
          </Pressable>
        </Modal>
      </View>
    );
  }

  // Capsule variant (segmented buttons)
  return (
    <View
      onLayout={onLayout}
      accessibilityRole="radiogroup"
      accessibilityLabel={label}
      style={[
        styles.capsuleContainer,
        {
          backgroundColor: t.sunken,
          borderColor: t.line,
        },
        style,
      ]}
    >
      {languages.map((item) => {
        const isSelected = item.code === value;
        return (
          <Pressable
            key={item.code}
            accessibilityRole="radio"
            accessibilityState={{ selected: isSelected }}
            accessibilityLabel={`${item.label} (${item.nativeLabel})`}
            style={[
              styles.capsuleBtn,
              isSelected && {
                backgroundColor: t.lamp,
              },
            ]}
            onPress={() => handleSelect(item.code)}
          >
            <Text
              style={[
                styles.capsuleBtnText,
                {
                  color: isSelected ? t.onLamp : t.inkSoft,
                },
              ]}
            >
              {item.shortLabel}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'row',
  },
  trigger: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  triggerText: {
    fontSize: 13,
    fontWeight: '700',
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    maxWidth: 280,
    borderRadius: 16,
    borderWidth: 1,
    padding: 8,
    gap: 4,
  },
  modalItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
  },
  modalNativeLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  modalSecondaryLabel: {
    fontSize: 12,
  },
  capsuleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 3,
    borderRadius: 999,
    borderWidth: 1,
    gap: 2,
  },
  capsuleBtn: {
    minWidth: 38,
    height: 32,
    paddingHorizontal: 10,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  capsuleBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
