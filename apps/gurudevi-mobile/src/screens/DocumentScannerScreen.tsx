import { OCRScannerBridge } from '@/features/scanner/OCRScannerBridge';
import { BrandPulse } from '@repo/ui';
import { Box, Button, ButtonText, Text, VStack } from '@repo/ui/primitives';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

export function DocumentScannerScreen() {
  const { t } = useTranslation();
  const [scannedStudents, setScannedStudents] = useState<{
    name: string;
    index_number: string;
    uncertain: boolean;
    notes?: string;
  }[]>([]);
  const [showScanner, setShowScanner] = useState(false);

  const handleStudentsScanned = useCallback((students: any[]) => {
    setScannedStudents(students);
    setShowScanner(false);
  }, []);

  const handleConfirm = useCallback(async () => {
    if (scannedStudents.length === 0) return;
    // TODO: Save to library / sync
    alert(`Saved ${scannedStudents.length} students from register`);
    setScannedStudents([]);
  }, [scannedStudents]);

  return (
    <VStack className="p-lg gap-lg items-center bg-phase-surface">
      <Text className="text-ink text-xl font-bold mb-4">
        {t('library.documentScanner') || 'Document Scanner'}
      </Text>
      <Text className="text-mistGray text-center">
        {t('library.documentScannerDescription') || 'Scan attendance registers and documents with OCR'}
      </Text>

      <VStack className="gap-md w-full max-w-md">
        <Button
          className="bg-sanctuarySaffron rounded-full px-xl h-[56px]"
          onPress={() => setShowScanner(true)}
        >
          <ButtonText className="text-white font-bold">
            📷 {t('library.scanDocument') || 'Scan Document'}
          </ButtonText>
        </Button>

        {scannedStudents.length > 0 && (
          <VStack className="gap-2">
            <Text className="text-ink font-semibold">
              {t('library.scannedStudents') || 'Scanned Students'} ({scannedStudents.length})
            </Text>
            <VStack className="gap-2 max-h-64 overflow-y-auto">
              {scannedStudents.map((s, i) => (
                <VStack key={i} className="p-md bg-ink rounded-comfortable border border-border">
                  <Text className="text-ink font-semibold">{s.name}</Text>
                  <Text className="text-mistGray text-sm">Index: {s.index_number}</Text>
                  {s.uncertain && <Text className="text-emberRed text-xs">⚠ Low confidence</Text>}
                </VStack>
              ))}
            </VStack>
            <Button
              className="bg-emeraldGreen rounded-full px-xl h-[56px]"
              onPress={handleConfirm}
            >
              <ButtonText className="text-white font-bold">
                {t('common.save') || 'Save All'}
              </ButtonText>
            </Button>
          </VStack>
        )}
      </VStack>

      <Button
        variant="outline"
        className="border-mistGray"
        onPress={() => console.log('Navigate to manual entry')}
      >
        <ButtonText className="text-mistGray">
          {t('common.manualEntry') || 'Manual Entry Instead'}
        </ButtonText>
      </Button>
    </VStack>
  );
}

export default DocumentScannerScreen;