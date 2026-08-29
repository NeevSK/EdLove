import ScreenWrapper from '@repo/ui/components/ScreenWrapper';
import { Cloud, FileSpreadsheet, FileText, Layers, Plus, ScanLine } from '@repo/ui/icons';
import { Box, Icon, Pressable, Text, VStack } from '@repo/ui/primitives';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

export type ToolKind = 'spreadsheet' | 'pdf' | 'ocr' | 'imageToPdf' | 'cloudExport';

export interface ToolsHubScreenProps {
  importByKind?: (kind: ToolKind) => void;
}

interface ToolsHubItem {
  key: 'spreadsheet' | 'pdfEditor' | 'ocr' | 'imageToPdf' | 'cloudExport';
  kind: ToolKind;
  icon: typeof FileSpreadsheet;
  href:
    | '/library/tools/spreadsheet'
    | '/library/tools/pdf-editor'
    | '/library/tools/ocr'
    | '/library/tools/image-to-pdf'
    | '/library/tools/cloud-export';
  accent: string;
}

function ToolsHubScreen({ importByKind }: ToolsHubScreenProps) {
  const { t } = useTranslation();
  const router = useRouter();

  const tools: ToolsHubItem[] = [
    {
      key: 'spreadsheet',
      kind: 'spreadsheet',
      icon: FileSpreadsheet,
      href: '/library/tools/spreadsheet',
      accent: '#7DD4C0',
    },
    { key: 'pdfEditor', kind: 'pdf', icon: FileText, href: '/library/tools/pdf-editor', accent: '#B8A9E0' },
    { key: 'ocr', kind: 'ocr', icon: ScanLine, href: '/library/tools/ocr', accent: '#FDD925' },
    { key: 'imageToPdf', kind: 'imageToPdf', icon: Layers, href: '/library/tools/image-to-pdf', accent: '#FFB84D' },
    { key: 'cloudExport', kind: 'cloudExport', icon: Cloud, href: '/library/tools/cloud-export', accent: '#87CEEB' },
  ];

  return (
    <ScreenWrapper>
      <VStack className="gap-4 p-4">
        <VStack space="xs">
          <Text className="text-2xl font-bold text-phase-text-primary">{t('tools.title')}</Text>
          <Text className="text-sm text-phase-text-secondary">{t('tools.subtitle')}</Text>
        </VStack>
        <VStack className="gap-3">
          {tools.map((tool) => (
            <Pressable key={tool.key} onPress={() => router.push(tool.href)} className="w-full">
              <Box className="flex-row items-center gap-3 rounded-generous border border-phase-border bg-phase-surface p-4 active:opacity-80">
                <Box
                  style={{ backgroundColor: `${tool.accent}22` }}
                  className="h-11 w-11 items-center justify-center rounded-lg"
                >
                  <Icon as={tool.icon} size={22} color={tool.accent} />
                </Box>
                <Box className="flex-1">
                  <Text className="text-base font-bold text-phase-text-primary">
                    {t(`tools.${tool.key}.name`)}
                  </Text>
                  <Text className="text-sm text-phase-text-secondary">
                    {t(`tools.${tool.key}.description`)}
                  </Text>
                </Box>
                {importByKind && (
                  <Pressable
                    onPress={() => importByKind(tool.kind)}
                    accessibilityRole="button"
                    accessibilityLabel={t('tools.importAction')}
                    className="h-9 w-9 items-center justify-center rounded-lg border border-phase-border bg-phase-surface-light active:opacity-80"
                  >
                    <Icon as={Plus} size={18} color={tool.accent} />
                  </Pressable>
                )}
              </Box>
            </Pressable>
          ))}
        </VStack>
      </VStack>
    </ScreenWrapper>
  );
}

export default ToolsHubScreen;
export { ToolsHubScreen };