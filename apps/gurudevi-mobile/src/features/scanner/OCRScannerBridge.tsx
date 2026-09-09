import { defaultOCRPipeline as libraryOCRPipeline } from '@repo/library/api/ocr';
import { OCRScanner as ScannerKitOCRScanner } from '@repo/scanner-kit';
import { Platform } from 'react-native';

export function OCRScannerBridge({
  onStudentsScanned,
  onCancel,
  colors,
  providerName = 'mlkit',
}: {
  onStudentsScanned: (
    students: { name: string; index_number: string; uncertain: boolean; notes?: string }[],
  ) => void;
  onCancel: () => void;
  colors?: {
    primary?: string;
    secondary?: string;
    border?: string;
    text?: string;
    textSecondary?: string;
    tertiary?: string;
    accent?: string;
    success?: string;
    warning?: string;
  };
  providerName?: 'mlkit' | 'google_vision' | 'openai_vision';
}) {
  const handleStudentsScanned = (students: any[]) => {
    // Map scanner-kit format to library format
    const mapped = students.map((s: any) => ({
      name: s.name,
      index_number: s.index_number,
      uncertain: s.uncertain,
      notes: s.notes,
    }));
    onStudentsScanned(mapped);
  };

  // Use library's OCRPipeline for actual OCR (which uses tesseract.js + MLKit fallback)
  // but render using scanner-kit's UI
  return (
    <ScannerKitOCRScanner
      onStudentsScanned={handleStudentsScanned}
      onCancel={onCancel}
      colors={{
        primary: '#1A161E',
        secondary: '#2A2318',
        border: '#3A3320',
        text: '#F5EDD6',
        textSecondary: '#B7C0D1',
        tertiary: '#2A1B12',
        accent: '#D4843A',
        success: '#4CAF50',
        warning: '#F59E0B',
        ...colors,
      }}
      providerName={Platform.OS === 'web' ? 'mlkit' : 'mlkit'}
      // Use library's OCRPipeline internally but scanner-kit UI
      pipeline={{ recognize: libraryOCRPipeline.recognize } as any}
    />
  );
}

export default function OCRScannerBridgeWrapper(props: any) {
  return <OCRScannerBridge {...props} />;
}
