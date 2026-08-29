import { spreadsheetUtils, type GridData } from '@repo/library/api';
import ScreenWrapper from '@repo/ui/components/ScreenWrapper';
import { BrandPulse } from '@repo/ui/components/BrandPulse';
import { ArrowLeft, Download, FileSpreadsheet, Search } from '@repo/ui/icons';
import {
  Box,
  Button,
  ButtonText,
  HStack,
  Icon,
  InputField,
  Pressable,
  ScrollView,
  Text,
  VStack,
} from '@repo/ui/primitives';
import { saveBytes } from '@repo/library/utils/bytes';
import { SpreadsheetGrid } from '@repo/library/components/SpreadsheetGrid';
import { useLoadedBytes } from '@repo/library/hooks/useLoadedBytes';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function SpreadsheetViewer() {
  const params = useLocalSearchParams<Record<string, string>>();
  const { t } = useTranslation();
  const router = useRouter();
  const { bytes, loading, error, detected } = useLoadedBytes(params);

  const [grids, setGrids] = useState<GridData[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [parseError, setParseError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [exporting, setExporting] = useState<'csv' | 'xlsx' | null>(null);

  useEffect(() => {
    if (!bytes) return;
    setParseError(null);
    spreadsheetUtils
      .parseToGrids(bytes)
      .then((parsed) => {
        setGrids(parsed);
        setActiveIndex(0);
      })
      .catch((e: unknown) => {
        setParseError(e instanceof Error ? e.message : 'Could not parse spreadsheet');
      });
  }, [bytes]);

  const activeGrid = grids[activeIndex];

  const filteredGrid = useMemo(() => {
    if (!activeGrid || !search.trim()) return activeGrid;
    const query = search.trim().toLowerCase();
    const rows = activeGrid.rows.filter((row) =>
      row.some((cell) => (cell == null ? '' : String(cell)).toLowerCase().includes(query)),
    );
    return { ...activeGrid, rows };
  }, [activeGrid, search]);

  const exportAsCsv = async () => {
    if (!activeGrid || !detected) return;
    setExporting('csv');
    try {
      const csv = spreadsheetUtils.generateCSV(activeGrid);
      const name = (params.name ?? `sheet_${activeIndex + 1}`) as string;
      await saveBytes(new TextEncoder().encode(csv), `${name.replace(/\.[^.]+$/, '')}.csv`, 'text/csv');
    } catch (e: unknown) {
      setParseError(e instanceof Error ? e.message : 'CSV export failed');
    } finally {
      setExporting(null);
    }
  };

  const exportAsXlsx = async () => {
    if (!grids.length) return;
    setExporting('xlsx');
    try {
      const xlsx = spreadsheetUtils.generateXLSX(grids);
      const name = (params.name ?? 'spreadsheet') as string;
      await saveBytes(xlsx, `${name.replace(/\.[^.]+$/, '')}.xlsx`, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'share');
    } catch (e: unknown) {
      setParseError(e instanceof Error ? e.message : 'XLSX export failed');
    } finally {
      setExporting(null);
    }
  };

  if (loading) {
    return (
      <ScreenWrapper>
        <Box className="flex-1 items-center justify-center p-8">
          <BrandPulse size={28} />
        </Box>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <VStack className="gap-3 p-4">
        <HStack className="items-center gap-2">
          <Pressable onPress={() => router.back()} className="active:opacity-60">
            <Icon as={ArrowLeft} size={22} color="#544A3D" />
          </Pressable>
          <Box className="flex-1">
            <Text className="text-xl font-bold text-phase-text-primary">{t('spreadsheet.title')}</Text>
            <Text className="text-xs text-phase-text-secondary">
              {(params.name ?? '') as string}
            </Text>
          </Box>
          <Icon as={FileSpreadsheet} size={22} color="#7DD4C0" />
        </HStack>

        {error || parseError ? (
          <Box className="rounded-2xl border border-phase-danger/20 bg-phase-danger/5 p-4">
            <Text className="text-sm font-semibold text-phase-danger">{t('common.error')}</Text>
            <Text className="mt-1 text-sm text-phase-text-secondary">
              {error || parseError}
            </Text>
          </Box>
        ) : null}

        {!bytes && !loading && !error ? (
          <Box className="rounded-2xl border border-phase-border bg-phase-surface p-6">
            <Text className="text-center text-sm text-phase-text-secondary">
              {t('spreadsheet.emptyHint')}
            </Text>
          </Box>
        ) : null}

        {grids.length > 1 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <HStack className="gap-2">
              {grids.map((grid, index) => (
                <Pressable key={grid.meta.sheetName} onPress={() => setActiveIndex(index)}>
                  <Box
                    className={
                      index === activeIndex
                        ? 'rounded-full bg-phase-accent px-3 py-1.5'
                        : 'rounded-full border border-phase-border bg-phase-surface px-3 py-1.5'
                    }
                  >
                    <Text
                      className={
                        index === activeIndex
                          ? 'text-xs font-bold text-phase-text-onAccent'
                          : 'text-xs text-phase-text-secondary'
                      }
                    >
                      {grid.meta.sheetName}
                    </Text>
                  </Box>
                </Pressable>
              ))}
            </HStack>
          </ScrollView>
        ) : null}

        {activeGrid ? (
          <>
            <Box className="flex-row items-center gap-2 rounded-xl border border-phase-border bg-phase-surface px-3 py-2">
              <Icon as={Search} size={16} color="#72695E" />
              <InputField
                className="flex-1 text-sm"
                placeholder={t('spreadsheet.searchPlaceholder')}
                value={search}
                onChangeText={setSearch}
              />
            </Box>
            <Text className="text-xs text-phase-text-secondary">
              {t('spreadsheet.dimensions', {
                rows: filteredGrid?.rows.length ?? 0,
                cols: filteredGrid?.headers.length ?? 0,
              })}
            </Text>

            {filteredGrid ? <SpreadsheetGrid grid={filteredGrid} /> : null}

            <HStack className="gap-2">
              <Button
                className="flex-1"
                variant="outline"
                onPress={exportAsCsv}
                isDisabled={!!exporting || !activeGrid}
              >
                <ButtonText>{exporting === 'csv' ? t('common.working') : t('spreadsheet.exportCsv')}</ButtonText>
              </Button>
              <Button
                className="flex-1"
                onPress={exportAsXlsx}
                isDisabled={!!exporting || !grids.length}
              >
                <ButtonText>
                  {exporting === 'xlsx'
                    ? t('common.working')
                    : t('spreadsheet.exportXlsx')}
                </ButtonText>
              </Button>
            </HStack>
          </>
        ) : null}
      </VStack>
    </ScreenWrapper>
  );
}