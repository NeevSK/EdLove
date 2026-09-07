import './style-engine.css';

import { Box } from '@repo/ui/components/ui/box';
import { Button, ButtonText } from '@repo/ui/components/ui/button';
import { FormField } from '@repo/ui/components/ui/form-field';
import { Icon } from '@repo/ui/components/ui/icon';
import { Input, InputField } from '@repo/ui/components/ui/input';
import { FlatList } from '@repo/ui/components/ui/list';
import { Pressable } from '@repo/ui/components/ui/pressable';
import { Text } from '@repo/ui/components/ui/text';
import { Search } from '@repo/ui/icons';
import { registerRootComponent } from 'expo';
import React, { useEffect, useRef, useState } from 'react';
import { Text as RNText, View } from 'react-native';

export default function StyleEngineRuntimeFixture() {
  const [displayName, setDisplayName] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'error' | 'success'>('idle');
  const attemptsRef = useRef(0);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nameError = submitted && displayName.trim().length === 0 ? 'Name is required.' : undefined;
  const buttonLabel =
    saveState === 'saving'
      ? 'Saving profile'
      : saveState === 'error'
        ? 'Try again'
        : saveState === 'success'
          ? 'Saved'
          : 'Save profile';

  useEffect(() => () => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
  }, []);

  const saveProfile = () => {
    setSubmitted(true);
    if (displayName.trim().length === 0 || saveState === 'saving') return;

    setSaveState('saving');
    saveTimerRef.current = setTimeout(() => {
      attemptsRef.current += 1;
      setSaveState(attemptsRef.current === 1 ? 'error' : 'success');
    }, 60);
  };

  return (
    <View id="runtime-fixture" className="flex-1 bg-phase-canvas p-4">
      <Box id="box-fixture" className="bg-phase-surface p-4">
        <Text id="text-fixture" className="text-phaseText-primary text-xl">
          Styled text
        </Text>
      </Box>
      <Pressable id="pressable-fixture" className="mt-4 bg-phase-interactive p-3">
        <RNText>Styled pressable</RNText>
      </Pressable>
      <Icon id="icon-fixture" as={Search} className="mt-4 text-phaseText-primary" size={24} />
      <FlatList
        id="list-fixture"
        className="mt-4 bg-phase-surface p-2"
        contentContainerClassName="p-2"
        data={['one']}
        renderItem={({ item }) => <RNText>{item}</RNText>}
      />
      <View id="form-scenario" className="mt-4 bg-phase-surface p-4 rounded-xl">
        <FormField
          id="display-name"
          label="Display name"
          helperText="Shown on your profile."
          errorText={nameError}
        >
          <Input testID="display-name-input" isInvalid={Boolean(nameError)}>
            <InputField
              placeholder="Your name"
              value={displayName}
              onChangeText={setDisplayName}
              accessibilityLabel="Display name"
            />
          </Input>
        </FormField>
        <Button
          testID="save-button"
          className="mt-4"
          isLoading={saveState === 'saving'}
          accessibilityLabel={buttonLabel}
          onPress={saveProfile}
        >
          <ButtonText>{buttonLabel}</ButtonText>
        </Button>
        <Text id="save-status" accessibilityLiveRegion="polite" className="mt-3">
          {saveState === 'error'
            ? 'Could not save your profile. Try again.'
            : saveState === 'success'
              ? 'Profile saved.'
              : saveState === 'saving'
                ? 'Saving profile…'
                : 'Ready to save.'}
        </Text>
      </View>
    </View>
  );
}

registerRootComponent(StyleEngineRuntimeFixture);
