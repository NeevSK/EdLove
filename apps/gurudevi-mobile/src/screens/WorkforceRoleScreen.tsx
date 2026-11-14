import { Button, Select, Surface, TextField } from '@repo/ui/components/native';
import { useSanctuaryToast } from '@repo/ui/providers/ToastProvider';
import type { WorkforceJobFamily } from '@repo/workforce';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RoomPage } from '@/components/shell/RoomPage';

const FAMILIES: readonly { value: WorkforceJobFamily; label: string }[] = [
  { value: 'academic', label: 'Academic' },
  { value: 'operations', label: 'Operations' },
  { value: 'finance', label: 'Finance' },
  { value: 'wellbeing', label: 'Wellbeing' },
  { value: 'facilities', label: 'Facilities' },
  { value: 'transport', label: 'Transport' },
  { value: 'food_service', label: 'Food service' },
  { value: 'external_service', label: 'External service' },
];

export function WorkforceRoleScreen() {
  const { t } = useTranslation();
  const { showToast } = useSanctuaryToast();
  const [selectedFamily, setSelectedFamily] = useState<WorkforceJobFamily>('academic');
  const [employeeName, setEmployeeName] = useState('');
  const [loading] = useState(false);

  const handleAssign = useCallback(async () => {
    if (!employeeName.trim()) return;
    // In real implementation, this would call workforce API
    // For now, just show success
    showToast({ message: `${employeeName} assigned to ${selectedFamily} family`, type: 'success' });
  }, [employeeName, selectedFamily, showToast]);

  return (
    <RoomPage
      title={t('workforce.assignTitle') || 'Assign Workforce Role'}
      intro={t('workforce.assignDescription') || 'Assign a workforce role to an employee'}
    >
      <Surface tone="raised" style={{ padding: 18, gap: 16 }}>
        <TextField
          label={t('workforce.employeeName') || 'Employee Name'}
          value={employeeName}
          onChangeText={setEmployeeName}
          placeholder="e.g., Jane Doe"
        />
        <Select
          label={t('workforce.jobFamily') || 'Job Family'}
          value={selectedFamily}
          options={FAMILIES}
          onChange={setSelectedFamily}
        />
        <Button
          label={t('workforce.assign') || 'Assign Role'}
          variant="primary"
          fullWidth
          loading={loading}
          disabled={loading || !employeeName.trim()}
          onPress={handleAssign}
        />
      </Surface>
    </RoomPage>
  );
}

export default WorkforceRoleScreen;
