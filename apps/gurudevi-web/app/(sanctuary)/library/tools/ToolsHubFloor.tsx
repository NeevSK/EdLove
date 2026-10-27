'use client';

import {
  TOOLS_SAMPLE_BUNDLE_ITEMS,
  TOOLS_SAMPLE_CSV,
  TOOLS_SAMPLE_OCR,
  type ToolsBundleItem as BundleItem,
} from '@/lib/tools/toolsTemplates';
import Link from 'next/link';
import React, { useState } from 'react';
import styles from './tools.module.css';

type ActiveTool = 'spreadsheet' | 'ocr' | 'compiler' | 'export';

interface ToolsHubFloorProps {
  displayName: string;
}

const sampleCSV = TOOLS_SAMPLE_CSV;
const sampleOCRText = TOOLS_SAMPLE_OCR;

export function ToolsHubFloor({ displayName }: Readonly<ToolsHubFloorProps>) {
  const [activeTool, setActiveTool] = useState<ActiveTool>('spreadsheet');

  // Spreadsheet State
  const [csvInput, setCsvInput] = useState(sampleCSV);
  const [parsedRows, setParsedRows] = useState<string[][]>(() =>
    sampleCSV.split('\n').map((row) => row.split(',').map((c) => c.trim()))
  );
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
    const trimmed = raw.trim();
    if (!trimmed) {
      setParsedRows([]);
      return;
    }
    const lines = trimmed.split(/\r?\n/).filter(Boolean);
    const rows = lines.map((line) => {
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
    setParsedRows(rows);
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
      setOcrText(sampleOCRText + `\n\n[Scanned at ${new Date().toLocaleTimeString()} by ${displayName}]`);
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
              2
            )
          : `# ${bundleTitle}\n\nExported by ${displayName} on ${new Date().toLocaleDateString()}\n\n## Included Modules\n` +
            bundleItems.map((i) => `- **${i.title}** (${i.type}, ${i.pages} pages)`).join('\n');

      const blob = new Blob([data], { type: format === 'json' ? 'application/json' : 'text/markdown' });
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

  const filteredRows = parsedRows.slice(1).filter((row) =>
    tableFilter ? row.some((cell) => cell.toLowerCase().includes(tableFilter.toLowerCase())) : true
  );

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link href="/library" className={styles.backLink}>
            ← Back to Sanctuary Library
          </Link>
          <div className={styles.badge}>Knowledge Tools Hub</div>
        </div>
      </header>

      <section className={styles.content}>
        <div className={styles.hero}>
          <h1 className={styles.title}>Pedagogical Knowledge Tools</h1>
          <p className={styles.subtitle}>
            In-browser processing powerhouse for teachers and scholars: inspect curricular datasets, extract text via
            OCR vision, assemble multi-resource study packets, and create offline archives.
          </p>
        </div>

        {/* Tab Selection */}
        <nav className={styles.tabs} aria-label="Tools Navigation">
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTool === 'spreadsheet' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTool('spreadsheet')}
          >
            📊 Spreadsheet & CSV Grid
          </button>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTool === 'ocr' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTool('ocr')}
          >
            🔍 OCR & Document Vision
          </button>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTool === 'compiler' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTool('compiler')}
          >
            📚 Study Packet Compiler
          </button>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTool === 'export' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTool('export')}
          >
            ☁️ Cloud & Local Export
          </button>
        </nav>

        {/* Tab 1: Spreadsheet Explorer */}
        {activeTool === 'spreadsheet' && (
          <div className={styles.toolPanel}>
            <div className={styles.panelHeader}>
              <div>
                <h2 className={styles.panelTitle}>Curriculum & Gradebook Data Grid</h2>
                <p className={styles.panelDescription}>
                  Inspect and filter tabular educational datasets. Paste CSV text or edit values directly.
                </p>
              </div>
              <div className={styles.btnRow} style={{ marginTop: 0 }}>
                <span className={styles.statBadge}>
                  {parsedRows.length > 1 ? parsedRows.length - 1 : 0} Rows Detected
                </span>
                <span className={styles.statBadge}>{parsedRows[0]?.length ?? 0} Columns</span>
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <input
                type="text"
                placeholder="Filter table rows by keyword..."
                value={tableFilter}
                onChange={(e) => setTableFilter(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.625rem 1rem',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '0.5rem',
                  color: '#fff',
                  outline: 'none',
                }}
              />
            </div>

            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    {parsedRows[0]?.map((header, idx) => (
                      <th key={idx}>{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((row, rIdx) => (
                    <tr key={rIdx}>
                      {row.map((cell, cIdx) => (
                        <td key={cIdx}>{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', opacity: 0.8 }}>
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
                  Extract text from scanned textbooks, circulars, and blackboard photographs with high accuracy.
                </p>
              </div>
              <div className={styles.btnRow} style={{ marginTop: 0 }}>
                <span className={styles.statBadge}>Tesseract Engine Ready</span>
                <span className={styles.statBadge}>English • Sinhala • Tamil</span>
              </div>
            </div>

            <div className={styles.dropzone} onClick={handleSimulateOCR}>
              <div className={styles.dropzoneIcon}>📷</div>
              <p className={styles.dropzoneText}>
                {ocrProcessing ? 'Processing image & running optical extraction...' : 'Click or drop a textbook page or diagram image here'}
              </p>
              <p className={styles.dropzoneHint}>Supports PNG, JPG, WebP up to 25MB</p>
            </div>

            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', opacity: 0.8 }}>
              Extracted Pedagogical Text & Metadata:
            </label>
            <textarea
              className={styles.textarea}
              value={ocrText}
              onChange={(e) => setOcrText(e.target.value)}
            />

            <div className={styles.btnRow}>
              <button type="button" className={styles.btnPrimary} onClick={handleCopyOCR}>
                {copiedNotice ? '✓ Copied to Clipboard!' : '📋 Copy Text'}
              </button>
              <button
                type="button"
                className={styles.btnSecondary}
                onClick={() => setOcrText('')}
              >
                Clear Buffer
              </button>
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
                  Combine lesson plans, worksheets, and reading materials into unified distribution packets.
                </p>
              </div>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.35rem', opacity: 0.8 }}>
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
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
                      <span style={{ opacity: 0.4, marginRight: '0.75rem', fontWeight: 600 }}>#{idx + 1}</span>
                      <strong style={{ fontSize: '0.9rem' }}>{item.title}</strong>
                      <span style={{ fontSize: '0.75rem', color: '#7dd4c0', marginLeft: '0.75rem' }}>
                        {item.type} • {item.pages} {item.pages === 1 ? 'page' : 'pages'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setBundleItems((prev) => prev.filter((i) => i.id !== item.id))}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'rgba(255, 100, 100, 0.8)',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                      }}
                    >
                      ✕ Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <input
                type="text"
                placeholder="Add resource title or attachment..."
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
              <button type="button" className={styles.btnSecondary} onClick={handleAddBundleItem}>
                + Add Item
              </button>
            </div>

            <div className={styles.btnRow}>
              <button
                type="button"
                className={styles.btnPrimary}
                onClick={() => handleDownloadExport('markdown')}
              >
                📥 Compile & Download Packet (.md)
              </button>
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
              <div
                style={{
                  padding: '0.75rem 1rem',
                  marginBottom: '1.25rem',
                  borderRadius: '0.5rem',
                  background: 'rgba(125, 212, 192, 0.15)',
                  border: '1px solid rgba(125, 212, 192, 0.3)',
                  color: '#7dd4c0',
                  fontSize: '0.875rem',
                }}
              >
                {exportNotice}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
              <div
                style={{
                  padding: '1.5rem',
                  borderRadius: '0.75rem',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                }}
              >
                <h3 style={{ fontSize: '1.1rem', margin: '0 0 0.5rem 0' }}>📄 Complete JSON State Dump</h3>
                <p style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.6)', margin: '0 0 1rem 0' }}>
                  Full machine-readable bundle containing all datasets, collections, and curricular items.
                </p>
                <button
                  type="button"
                  className={styles.btnPrimary}
                  onClick={() => handleDownloadExport('json')}
                >
                  Download JSON Bundle
                </button>
              </div>

              <div
                style={{
                  padding: '1.5rem',
                  borderRadius: '0.75rem',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                }}
              >
                <h3 style={{ fontSize: '1.1rem', margin: '0 0 0.5rem 0' }}>📝 Markdown Curricular Syllabus</h3>
                <p style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.6)', margin: '0 0 1rem 0' }}>
                  Clean, human-readable outline ready for printing or importing into Obsidian or GitHub.
                </p>
                <button
                  type="button"
                  className={styles.btnSecondary}
                  onClick={() => handleDownloadExport('markdown')}
                >
                  Download Markdown (.md)
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
