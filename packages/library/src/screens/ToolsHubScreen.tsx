import { View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native';
import { Cloud, FileSpreadsheet, FileText, Layers, Plus, ScanLine } from '@repo/ui/icons';
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
    <SafeAreaView className="flex-1 bg-phase-canvas"><ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1 }}>
      <View className="gap-4 p-4">
        <View className="gap-1">
          <Text className="text-2xl font-bold text-phase-text-primary">{t('tools.title')}</Text>
          <Text className="text-sm text-phase-text-secondary">{t('tools.subtitle')}</Text>
        </View>
        <View className="gap-3">
          {tools.map((tool) => (
            <Pressable key={tool.key} onPress={() => router.push(tool.href)} className="w-full">
              <View className="flex-row items-center gap-3 rounded-generous border border-phase-border bg-phase-surface p-4 active:opacity-80">
                <View
                  style={{ backgroundColor: `${tool.accent}22` }}
                  className="h-11 w-11 items-center justify-center rounded-lg"
                >
                  <tool.icon size={22} color={tool.accent} />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-bold text-phase-text-primary">
                    {t(`tools.${tool.key}.name`)}
                  </Text>
                  <Text className="text-sm text-phase-text-secondary">
                    {t(`tools.${tool.key}.description`)}
                  </Text>
                </View>
                {importByKind && (
                  <Pressable
                    onPress={() => importByKind(tool.kind)}
                    accessibilityRole="button"
                    accessibilityLabel={t('tools.importAction')}
                    className="h-9 w-9 items-center justify-center rounded-lg border border-phase-border bg-phase-surface-light active:opacity-80"
                  >
                    <Plus size={18} color={tool.accent} />
                  </Pressable>
                )}
              </View>
            </Pressable>
          ))}
        </View>
      </View>
    </ScrollView></SafeAreaView>
  );
}

export default ToolsHubScreen;
export { ToolsHubScreen };