import { type ToolKind, ToolsHubScreen } from '@repo/library/tools';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useCallback } from 'react';

const SPREADSHEET_TYPES = [
  'text/csv',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

export default function ToolsHubRoute() {
  const router = useRouter();

  const openDocument = useCallback(
    async (accept: string[], pathname: string) => {
      const result = await DocumentPicker.getDocumentAsync({ type: accept, multiple: false });
      if (result.canceled) return;
      const asset = result.assets[0];
      if (!asset) return;
      router.push(
        `${pathname}?uri=${encodeURIComponent(asset.uri)}&name=${encodeURIComponent(asset.name)}`,
      );
    },
    [router],
  );

  const openImageForOCR = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 1,
    });
    if (result.canceled) return;
    const asset = result.assets[0];
    if (!asset) return;
    const name = asset.fileName ?? 'ocr-image.jpg';
    router.push(
      `/library/tools/ocr?uri=${encodeURIComponent(asset.uri)}&name=${encodeURIComponent(name)}`,
    );
  }, [router]);

  const openImagesForPDF = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: 10,
      quality: 1,
    });
    if (result.canceled) return;
    const assets = result.assets;
    const first = assets[0];
    if (!first) return;
    const uris = assets.map((asset) => asset.uri).join(',');
    const name = first.fileName ?? 'images';
    router.push(
      `/library/tools/image-to-pdf?uris=${encodeURIComponent(uris)}&name=${encodeURIComponent(name)}`,
    );
  }, [router]);

  const importByKind = useCallback(
    (kind: ToolKind) => {
      switch (kind) {
        case 'spreadsheet':
          return openDocument(SPREADSHEET_TYPES, '/library/tools/spreadsheet');
        case 'pdf':
          return openDocument(['application/pdf'], '/library/tools/pdf-editor');
        case 'cloudExport':
          return openDocument(['*/*'], '/library/tools/cloud-export');
        case 'ocr':
          return openImageForOCR();
        case 'imageToPdf':
          return openImagesForPDF();
      }
    },
    [openDocument, openImageForOCR, openImagesForPDF],
  );

  return <ToolsHubScreen importByKind={importByKind} />;
}
