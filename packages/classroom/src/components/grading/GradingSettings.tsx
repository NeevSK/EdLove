/**
 * GRADING SETTINGS COMPONENT
 *
 * Modal/Bottom Sheet for configuring classroom grading preferences.
 */

import {
  Box,
  Button,
  ButtonText,
  Heading,
  HStack,
  Radio,
  RadioGroup,
  RadioIndicator,
  RadioLabel,
  Switch,
  Text,
  VStack,
} from '@repo/ui/primitives';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface GradingSettingsProps {
  currentSettings: any;
  onSave: (settings: any) => void;
  onCancel: () => void;
}

export default function GradingSettings({
  currentSettings,
  onSave,
  onCancel,
}: GradingSettingsProps) {
  const { t } = useTranslation();
  const [gradingMode, setGradingMode] = useState<'marks' | 'gpa' | 'both' | 'grade'>(
    currentSettings.grading_mode as any,
  );
  const [showRanks, setShowRanks] = useState(currentSettings.show_ranks);

  const handleSave = () => {
    onSave({
      grading_mode: gradingMode as any,
      show_ranks: showRanks,
    });
  };

  return (
    <Box className="flex-1 bg-phase-world p-6 rounded-t-generous">
      <VStack className="gap-8">
        {/* Header */}
        <VStack className="gap-2">
          <Text className="text-[10px] font-black text-templeGold uppercase tracking-[0.25em]">
            {t('grading.settings.admin') || 'Administration'}
          </Text>
          <Heading className="text-3xl font-black text-phaseText-primary">
            {t('grading.settings.title') || 'Grading Preferences'}
          </Heading>
        </VStack>

        {/* Grading Mode Selection */}
        <VStack className="gap-4">
          <Text className="text-[10px] font-black text-phaseText-secondary uppercase tracking-[0.2em] ml-1">
            {t('grading.settings.modeLabel') || 'Grading Mode'}
          </Text>

          <RadioGroup
            value={gradingMode}
            onChange={(value: string) => setGradingMode(value as any)}
          >
            <VStack className="gap-3">
              {[
                {
                  value: 'grade',
                  label: t('grading.settings.gradeOnly') || 'Grade Only',
                  desc: t('grading.settings.gradeOnlyDesc') || 'Display letter grades (A-F)',
                },
                {
                  value: 'marks',
                  label: t('grading.settings.marksOnly') || 'Marks Only',
                  desc: t('grading.settings.marksOnlyDesc') || 'Display marks out of 100',
                },
                {
                  value: 'gpa',
                  label: t('grading.settings.gpaOnly') || 'GPA Only',
                  desc: t('grading.settings.gpaOnlyDesc') || 'Display letter grades (A-F) and GPA',
                },
                {
                  value: 'both',
                  label: t('grading.settings.both') || 'Detailed',
                  desc: t('grading.settings.bothDesc') || 'Display marks and GPA together',
                },
              ].map((item) => (
                <HStack
                  key={item.value}
                  className={`p-4 rounded-generous border ${gradingMode === item.value ? 'bg-templeGold/10 border-templeGold/40' : 'bg-phase-surface/50 border-phase-canvas'}`}
                >
                  <Radio value={item.value}>
                    <RadioIndicator className="mr-4 border-phase-canvas" />
                    <RadioLabel className="flex-1">
                      <VStack className="gap-0.5">
                        <Text
                          className={`text-lg font-black ${gradingMode === item.value ? 'text-templeGold' : 'text-phaseText-primary'}`}
                        >
                          {item.label}
                        </Text>
                        <Text className="text-[12px] font-medium text-phaseText-secondary leading-snug">
                          {item.desc}
                        </Text>
                      </VStack>
                    </RadioLabel>
                  </Radio>
                </HStack>
              ))}
            </VStack>
          </RadioGroup>
        </VStack>

        {/* Show Ranks Toggle */}
        <HStack className="justify-between items-center bg-phase-surface/50 p-5 rounded-generous border border-phase-canvas">
          <VStack className="flex-1 gap-1">
            <Text className="text-lg font-black text-phaseText-primary">
              {t('grading.settings.showRanks') || 'Show Rankings'}
            </Text>
            <Text className="text-[12px] font-medium text-phaseText-secondary">
              {t('grading.settings.showRanksDesc') ||
                'Display class rankings based on overall performance'}
            </Text>
          </VStack>
          <Switch
            value={showRanks}
            onValueChange={setShowRanks}
            trackColor={{ false: '#262626', true: '#E7C67F' }}
            thumbColor={showRanks ? '#000000' : '#A3A3A3'}
          />
        </HStack>

        {/* Action Buttons */}
        <HStack className="gap-4 mt-6">
          <Button
            variant="outline"
            className="flex-1 h-16 rounded-full border-phase-canvas bg-phase-surface"
            onPress={onCancel}
          >
            <ButtonText className="text-phaseText-primary font-black uppercase text-[11px] tracking-[0.2em]">
              {t('common.cancel') || 'Cancel'}
            </ButtonText>
          </Button>

          <Button
            className="flex-1 h-16 bg-templeGold rounded-full shadow-lg shadow-templeGold/20 active:opacity-85"
            onPress={handleSave}
          >
            <ButtonText className="text-black font-black uppercase text-[11px] tracking-[0.2em]">
              {t('common.save') || 'Apply'}
            </ButtonText>
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
}
