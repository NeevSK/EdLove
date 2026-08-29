import { Button, ButtonText, Heading, Input, InputField, Text, VStack } from '@repo/ui/primitives';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { workforceRegistry, WorkforceJobFamily } from '@repo/workforce';

export function WorkforceRoleScreen() {
  const { t } = useTranslation();
  const [selectedFamily, setSelectedFamily] = useState<WorkforceJobFamily>('academic');
  const [employeeName, setEmployeeName] = useState('');
  const [loading, setLoading] = useState(false);

  const families = Object.values(WorkforceJobFamily);

  const handleAssign = useCallback(async () => {
    if (!employeeName.trim()) return;
    // In real implementation, this would call workforce API
    // For now, just show success
    alert(`${employeeName} assigned to ${selectedFamily} family`);
  }, [employeeName, selectedFamily]);

  return (
    <VStack className="p-lg gap-lg items-center bg-phase-surface">
      <Heading size="lg" className="text-ink">{t('workforce.assignTitle') || 'Assign Workforce Role'}</Heading>
      <Text className="text-mistGray text-center">
        {t('workforce.assignDescription') || 'Assign a workforce role to an employee'}
      </Text>
      
      <VStack className="gap-md w-full max-w-md">
        <VStack className="gap-1">
          <Text className="text-starlightGray text-sm">{t('workforce.employeeName') || 'Employee Name'}</Text>
          <Input className="bg-ink border-obsidian">
            <InputField
              value={employeeName}
              onChangeText={setEmployeeName}
              placeholder="e.g., Jane Doe"
              className="text-ink"
            />
          </Input>
        </VStack>

        <VStack className="gap-1">
          <Text className="text-starlightGray text-sm">{t('workforce.jobFamily') || 'Job Family'}</Text>
          <Input className="bg-ink border-obsidian">
            <InputField
              value={selectedFamily}
              onChangeText={setSelectedFamily}
              placeholder="Select job family"
              className="text-ink"
            />
          </Input>
        </VStack>
      </VStack>

      <Button
        className="bg-sanctuarySaffron rounded-full px-xl h-[56px]"
        onPress={handleAssign}
        isDisabled={loading}
      >
        <ButtonText className="text-white font-bold">
          {t('workforce.assign') || 'Assign Role'}
        </ButtonText>
      </Button>
    </VStack>
  );
}

export default WorkforceRoleScreen;