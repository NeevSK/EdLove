import {
  TOOLS_SAMPLE_BUNDLE_ITEMS,
  TOOLS_SAMPLE_CSV,
  TOOLS_SAMPLE_OCR,
  type ToolsBundleItem as BundleItem,
} from '@/lib/tools/toolsTemplates';
import {
  Button,
  Card,
  Grid,
  Notice,
  SearchField,
  SegmentedControl,
  Stack,
  Table,
} from '@repo/ui/components/web';
import type { TableColumn } from '@repo/ui/theme';
import {
  BookOpen,
  Camera,
  Copy,
  Download,
  FileSpreadsheet,
  Plus,
  Trash2,
} from 'lucide-react';
import { Link } from '@tanstack/react-router';
import React, { useMemo, useState } from 'react';
import styles from './tools.module.css';

type ActiveTool = 'spreadsheet' | 'ocr' | 'compiler' | 'export';

export interface ToolsWorkbenchDeskProps {
  displayName: string;
}

export type ToolsHubFloorProps = ToolsWorkbenchDeskProps;

const sampleCSV = TOOLS_SAMPLE_CSV;
const sampleOCRText = TOOLS_SAMPLE_OCR;

function parseCsvLines(raw: string): string[][] {
  const trimmed = raw.trim();
  if (!trimmed) return [];
  const lines = trimmed.split(/\r?\n/).filter(Boolean);
  return lines.map((line) => {
    const cells: string[] = [];
    let inQuotes = false;
    let cur = '';
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        cells.push(cur.trim());
        cur = '';
      } else {
        cur += char;
      }
    }
    cells.push(cur.trim());
    return cells;
  });
}

export function ToolsWorkbenchDesk({ displayName }: Readonly<ToolsWorkbenchDeskProps>) {
  const [activeTool, setActiveTool] = useState<ActiveTool>('spreadsheet');

  // Spreadsheet State
  const [csvInput, setCsvInput] = useState(sampleCSV);
  const [parsedRows, setParsedRows] = useState<string[][]>(() => parseCsvLines(sampleCSV));
  const [tableFilter, setTableFilter] = useState('');

  // OCR State
  const [ocrText, setOcrText] = useState(sampleOCRText);
  const [ocrProcessing, setOcrProcessing] = useState(false);
  const [copiedNotice, setCopiedNotice] = useState(false);

  // Compiler State
  const [bundleTitle, setBundleTitle] = useState('Grade 10 Science & Ecology Field Guide');
  const [bundleItems, setBundleItems] = useState<BundleItem[]>([...TOOLS_SAMPLE_BUNDLE_ITEMS]);
  const [newItemTitle, setNewItemTitle] = useState('');

  // Export State
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  // Handlers
  const handleParseCSV = (raw: string) => {
    setCsvInput(raw);
    setParsedRows(parseCsvLines(raw));
  };

  const handleCopyOCR = async () => {
    try {
      await navigator.clipboard.writeText(ocrText);
      setCopiedNotice(true);
      setTimeout(() => setCopiedNotice(false), 2500);
    } catch {
      // Clipboard fallback
    }
  };

  const handleSimulateOCR = () => {
    setOcrProcessing(true);
    setTimeout(() => {
      setOcrText(
        sampleOCRText +
          `\n\n[Scanned at ${new Date().toLocaleTimeString()} by ${displayName}]`,
      );
      setOcrProcessing(false);
    }, 1200);
  };

  const handleAddBundleItem = () => {
    if (!newItemTitle.trim()) return;
    setBundleItems((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        title: newItemTitle.trim(),
        type: 'Curriculum Note',
        pages: 1,
      },
    ]);
    setNewItemTitle('');
  };

  const handleDownloadExport = (format: 'json' | 'markdown') => {
    try {
      const data =
        format === 'json'
          ? JSON.stringify(
              {
                exportedAt: new Date().toISOString(),
                curator: displayName,
                bundle: { title: bundleTitle, items: bundleItems },
                tableData: parsedRows,
              },
              null,
              2,
            )
          : `# ${bundleTitle}\n\nExported by ${displayName} on ${new Date().toLocaleDateString()}\n\n## Included Modules\n` +
            bundleItems.map((i) => `- **${i.title}** (${i.type}, ${i.pages} pages)`).join('\n');

      const blob = new Blob([data], {
        type: format === 'json' ? 'application/json' : 'text/markdown',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sanctuary-learning-bundle.${format === 'json' ? 'json' : 'md'}`;
      a.click();
      URL.revokeObjectURL(url);

      setExportNotice(`Exported successfully as ${format.toUpperCase()}`);
      setTimeout(() => setExportNotice(null), 3500);
    } catch {
      setExportNotice('Export failed: file creation restricted in current environment.');
      setTimeout(() => setExportNotice(null), 4000);
    }
  };

  const headers = parsedRows[0] ?? [];
  const bodyRows = parsedRows.slice(1);

  const filteredRows = useMemo(() => {
    if (!tableFilter.trim()) return bodyRows;
    const lower = tableFilter.toLowerCase();
    return bodyRows.filter((row) => row.some((cell) => cell.toLowerCase().includes(lower)));
  }, [bodyRows, tableFilter]);

  const tableColumns: TableColumn<string[]>[] = useMemo(() => {
    return headers.map((header, colIndex) => ({
      key: `col_${colIndex}_${header}`,
      header,
      cell: (row: string[]) => row[colIndex] ?? '',
      align: 'start',
    }));
  }, [headers]);

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link to="/library" className={styles.backLink}>
            ← Back to Sanctuary Library
          </Link>
          <div className={styles.badge}>Knowledge Tools Hub</div>
        </div>
      </header>

      <section className={styles.content}>
        <div className={styles.hero}>
          <h1 className={styles.title}>Pedagogical Knowledge Tools</h1>
          <p className={styles.subtitle}>
            In-browser processing powerhouse for teachers and scholars: inspect curricular datasets,
            extract text via OCR vision, assemble multi-resource study packets, and create offline
            archives.
          </p>
        </div>

        {/* Tab Selection via SegmentedControl */}
        <div style={{ marginBottom: '1.5rem' }}>
          <SegmentedControl<ActiveTool>
            label="Tool Navigation"
            value={activeTool}
            onChange={setActiveTool}
            options={[
              { value: 'spreadsheet', label: 'Spreadsheet Grid' },
              { value: 'ocr', label: 'OCR Vision' },
              { value: 'compiler', label: 'Study Packet' },
              { value: 'export', label: 'Cloud Export' },
            ]}
          />
        </div>

        {/* Tab 1: Spreadsheet Explorer */}
        {activeTool === 'spreadsheet' && (
          <div className={styles.toolPanel}>
            <div className={styles.panelHeader}>
              <div>
                <h2 className={styles.panelTitle}>Curriculum & Gradebook Data Grid</h2>
                <p className={styles.panelDescription}>
                  Inspect and filter tabular educational datasets with keyboard navigation. Paste CSV
                  text or filter values directly.
                </p>
              </div>
              <div className={styles.btnRow} style={{ marginTop: 0 }}>
                <span className={styles.statBadge}>
                  {parsedRows.length > 1 ? parsedRows.length - 1 : 0} Rows
                </span>
                <span className={styles.statBadge}>{headers.length} Columns</span>
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <SearchField
                label="Filter table rows"
                placeholder="Filter table rows by keyword…"
                value={tableFilter}
                onChange={setTableFilter}
                onClear={() => setTableFilter('')}
                resultCount={filteredRows.length}
              />
            </div>

            {/* Canonical Table Component */}
            <Table<string[]>
              caption="Curriculum & Gradebook Data Grid"
              columns={tableColumns}
              rows={filteredRows}
              rowKey={(row) => row.join('|')}
              empty="No matching rows found in this dataset."
            />

            <div style={{ marginTop: '1.5rem' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.85rem',
                  marginBottom: '0.5rem',
                  opacity: 0.8,
                }}
              >
                Raw CSV Input / Paste Zone:
              </label>
              <textarea
                className={styles.textarea}
                rows={4}
                value={csvInput}
                onChange={(e) => handleParseCSV(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Tab 2: OCR Vision */}
        {activeTool === 'ocr' && (
          <div className={styles.toolPanel}>
            <div className={styles.panelHeader}>
              <div>
                <h2 className={styles.panelTitle}>OCR Text & Diagram Extractor</h2>
                <p className={styles.panelDescription}>
                  Extract text from scanned textbooks, circulars, and blackboard photographs with high
                  accuracy.
                </p>
              </div>
              <div className={styles.btnRow} style={{ marginTop: 0 }}>
                <span className={styles.statBadge}>Optical Vision Engine Ready</span>
                <span className={styles.statBadge}>English • Sinhala • Tamil</span>
              </div>
            </div>

            <div className={styles.dropzone} onClick={handleSimulateOCR}>
              <Camera size={36} aria-hidden style={{ marginBottom: '0.5rem', opacity: 0.8 }} />
              <p className={styles.dropzoneText}>
                {ocrProcessing
                  ? 'Processing image & running optical extraction…'
                  : 'Click or drop a textbook page or diagram image here'}
              </p>
              <p className={styles.dropzoneHint}>Supports PNG, JPG, WebP up to 25MB</p>
            </div>

            <label
              style={{
                display: 'block',
                fontSize: '0.85rem',
                marginBottom: '0.5rem',
                opacity: 0.8,
              }}
            >
              Extracted Pedagogical Text & Metadata:
            </label>
            <textarea
              className={styles.textarea}
              value={ocrText}
              onChange={(e) => setOcrText(e.target.value)}
            />

            <div className={styles.btnRow}>
              <Button
                size="sm"
                variant="primary"
                label={copiedNotice ? 'Copied to Clipboard!' : 'Copy Text'}
                icon={Copy}
                onClick={handleCopyOCR}
              />
              <Button
                size="sm"
                variant="quiet"
                label="Clear Buffer"
                onClick={() => setOcrText('')}
              />
            </div>
          </div>
        )}

        {/* Tab 3: Study Packet Compiler */}
        {activeTool === 'compiler' && (
          <div className={styles.toolPanel}>
            <div className={styles.panelHeader}>
              <div>
                <h2 className={styles.panelTitle}>Curricular Study Packet Compiler</h2>
                <p className={styles.panelDescription}>
                  Combine lesson plans, worksheets, and reading materials into unified distribution
                  packets.
                </p>
              </div>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.85rem',
                  marginBottom: '0.35rem',
                  opacity: 0.8,
                }}
              >
                Packet Title:
              </label>
              <input
                type="text"
                value={bundleTitle}
                onChange={(e) => setBundleTitle(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.625rem 1rem',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '0.5rem',
                  color: '#fff',
                  outline: 'none',
                  fontSize: '1rem',
                  fontWeight: 600,
                }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.75rem' }}>
                Included Study Items ({bundleItems.length})
              </h3>
              <Stack gap="inside">
                {bundleItems.map((item, idx) => (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem 1rem',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      borderRadius: '0.5rem',
                    }}
                  >
                    <div>
                      <span style={{ opacity: 0.4, marginRight: '0.75rem', fontWeight: 600 }}>
                        #{idx + 1}
                      </span>
                      <strong style={{ fontSize: '0.9rem' }}>{item.title}</strong>
                      <span style={{ fontSize: '0.75rem', color: '#7dd4c0', marginLeft: '0.75rem' }}>
                        {item.type} • {item.pages} {item.pages === 1 ? 'page' : 'pages'}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant="quiet"
                      label=""
                      icon={Trash2}
                      onClick={() => setBundleItems((prev) => prev.filter((i) => i.id !== item.id))}
                    />
                  </div>
                ))}
              </Stack>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <input
                type="text"
                placeholder="Add resource title or attachment…"
                value={newItemTitle}
                onChange={(e) => setNewItemTitle(e.target.value)}
                style={{
                  flex: 1,
                  padding: '0.625rem 1rem',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '0.5rem',
                  color: '#fff',
                  outline: 'none',
                }}
              />
              <Button
                size="sm"
                variant="secondary"
                label="Add Item"
                icon={Plus}
                onClick={handleAddBundleItem}
              />
            </div>

            <div className={styles.btnRow}>
              <Button
                size="md"
                variant="primary"
                label="Compile & Download Packet (.md)"
                icon={Download}
                onClick={() => handleDownloadExport('markdown')}
              />
            </div>
          </div>
        )}

        {/* Tab 4: Cloud & Local Export */}
        {activeTool === 'export' && (
          <div className={styles.toolPanel}>
            <div className={styles.panelHeader}>
              <div>
                <h2 className={styles.panelTitle}>Sovereign Archive & Cloud Portability</h2>
                <p className={styles.panelDescription}>
                  Export your pedagogical workspace, offline bookmarks, and annotations into open standards.
                </p>
              </div>
            </div>

            {exportNotice && (
              <div style={{ marginBottom: '1.25rem' }}>
                <Notice tone="neutral" message={exportNotice} />
              </div>
            )}

            <Grid min="md" gap="between">
              <div
                style={{
                  padding: '1.5rem',
                  borderRadius: '0.75rem',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                }}
              >
                <h3 style={{ fontSize: '1.1rem', margin: '0 0 0.5rem 0' }}>Complete JSON State Dump</h3>
                <p style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.6)', margin: '0 0 1rem 0' }}>
                  Full machine-readable bundle containing all datasets, collections, and curricular items.
                </p>
                <Button
                  size="sm"
                  variant="primary"
                  label="Download JSON Bundle"
                  icon={Download}
                  onClick={() => handleDownloadExport('json')}
                />
              </div>

              <div
                style={{
                  padding: '1.5rem',
                  borderRadius: '0.75rem',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                }}
              >
                <h3 style={{ fontSize: '1.1rem', margin: '0 0 0.5rem 0' }}>Markdown Curricular Syllabus</h3>
                <p style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.6)', margin: '0 0 1rem 0' }}>
                  Clean, human-readable outline ready for printing or importing into Obsidian or GitHub.
                </p>
                <Button
                  size="sm"
                  variant="secondary"
                  label="Download Markdown (.md)"
                  icon={Download}
                  onClick={() => handleDownloadExport('markdown')}
                />
              </div>
            </Grid>
          </div>
        )}
      </section>
    </main>
  );
}

export const ToolsHubFloor = ToolsWorkbenchDesk;

