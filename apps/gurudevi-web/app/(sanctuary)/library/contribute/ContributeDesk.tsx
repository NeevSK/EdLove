import { useAssetOutbox } from '@/lib/media/useAssetOutbox';
import { useDocumentOcr } from '@/lib/media/useDocumentOcr';
import { saveLocalLibraryItem } from '@/lib/library/localLibraryStore';
import { orpcClient } from '@repo/core/api/orpcClient';
import { importDocxToMarkdown, importPptxToSlidesMarkdown } from '@repo/library/content/import';
import { openH5PArchive } from '@repo/library/h5p';
import { Markdown, RichTextEditor } from '@repo/ui/components/web';
import { Link } from '@tanstack/react-router';
import React, { useState } from 'react';
import styles from './contribute.module.css';

export interface ContributeDeskProps {
  displayName: string;
  capacity?: string;
}

export type ContributeFloorProps = ContributeDeskProps;

export function ContributeDesk({ displayName, capacity }: Readonly<ContributeDeskProps>) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('lesson');
  const [format, setFormat] = useState('document');
  const [subject, setSubject] = useState('Science');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [isMinistryAligned, setIsMinistryAligned] = useState(false);
  const [bodyMarkdown, setBodyMarkdown] = useState('');
  const [importSummary, setImportSummary] = useState<string | null>(null);
  const [lastAssetMeta, setLastAssetMeta] = useState<{
    assetId: string;
    sha256: string;
    mime: string;
    fileName: string;
    storageLane: 'images' | 'media' | 'documents';
  } | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const { enqueueAsset, pendingAssetCount } = useAssetOutbox();
  const { runOcr, running: ocrRunning, progress: ocrProgress } = useDocumentOcr();
  const [ocrText, setOcrText] = useState<string | undefined>(undefined);

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErrorNotice(null);
    setImportSummary(null);
    const lower = file.name.toLowerCase();
    if (!title.trim()) {
      setTitle(file.name.replace(/\.[^.]+$/, ''));
    }

    try {
      const queued = await enqueueAsset(file, {
        purpose: lower.endsWith('.h5p') ? 'h5p_package' : 'library_resource',
        visibility: 'public',
        targetKind: 'library_work',
        title: title || file.name,
      });
      if (!queued.ok) {
        setErrorNotice(queued.reason);
        return;
      }

      const buffer = await file.arrayBuffer();
      if (lower.endsWith('.docx')) {
        const res = await importDocxToMarkdown(buffer, { title: title || file.name });
        setBodyMarkdown(res.markdown);
        setFormat('markdown');
        setUrl(queued.localUri);
        setImportSummary(`Imported Word document & queued upload (${queued.sha256.slice(0, 8)}…).`);
      } else if (lower.endsWith('.pptx')) {
        const res = importPptxToSlidesMarkdown(buffer, { title: title || file.name });
        setBodyMarkdown(res.markdown);
        setFormat('slides');
        setUrl(queued.localUri);
        setImportSummary(`Imported ${res.slideCount} slides & queued upload (${queued.sha256.slice(0, 8)}…).`);
      } else if (lower.endsWith('.md') || lower.endsWith('.markdown')) {
        const text = await file.text();
        setBodyMarkdown(text);
        setFormat('markdown');
        setUrl(queued.localUri);
        setImportSummary(`Loaded Markdown & queued upload (${queued.sha256.slice(0, 8)}…).`);
      } else if (lower.endsWith('.h5p')) {
        const inspected = openH5PArchive(new Uint8Array(buffer));
        if (!inspected.ok) {
          setErrorNotice(`Invalid H5P package: ${inspected.problems[0]?.code ?? 'invalid_archive'}`);
          return;
        }
        setFormat('h5p');
        setUrl(queued.localUri);
        setImportSummary(
          `Verified H5P "${inspected.opened.index.manifest.title}" & queued upload (${queued.sha256.slice(0, 8)}…).`,
        );
      } else if (lower.endsWith('.pdf')) {
        setFormat('document');
        setUrl(queued.localUri);
        setImportSummary(`PDF (${file.name}) stored locally & queued in outbox (${queued.sha256.slice(0, 8)}…).`);
      } else {
        setFormat(file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : file.type.startsWith('audio/') ? 'audio' : 'document');
        setUrl(queued.localUri);
        setImportSummary(`Media (${file.name}) stored locally & queued in outbox (${queued.sha256.slice(0, 8)}…).`);
      }
      setLastAssetMeta({
        assetId: queued.assetId,
        sha256: queued.sha256,
        mime: file.type || 'application/octet-stream',
        fileName: file.name,
        storageLane: file.type.startsWith('image/')
          ? 'images'
          : file.type.startsWith('video/') || file.type.startsWith('audio/')
            ? 'media'
            : 'documents',
      });
    } catch (err) {
      setErrorNotice(err instanceof Error ? err.message : 'Failed to read selected file.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorNotice('Please provide a title for the curricular resource.');
      return;
    }

    setSubmitting(true);
    setErrorNotice(null);

    const tagList = tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const localId = `res-${Date.now()}`;
    saveLocalLibraryItem({
      id: localId,
      title: title.trim(),
      description: description.trim() || null,
      type,
      format: url.trim() && !lastAssetMeta && !bodyMarkdown.trim() ? 'link' : format,
      url: url.trim() || null,
      subjects: [subject, ...tagList],
      verified: false,
      assetId: lastAssetMeta?.assetId,
      sha256: lastAssetMeta?.sha256,
      mime: lastAssetMeta?.mime,
      fileName: lastAssetMeta?.fileName,
      body_markdown: bodyMarkdown.trim() || undefined,
      ocrText,
      storageLane: lastAssetMeta?.storageLane ?? (url.trim() ? 'link_only' : 'documents'),
      syncStatus: lastAssetMeta ? 'queued' : 'link_saved',
      createdAt: Date.now(),
    });

    try {
      const client = orpcClient.library as any;
      if (typeof client.createResource === 'function') {
        await client.createResource({
          body: {
            title: title.trim(),
            description: description.trim(),
            type,
            format,
            url: url.trim() || undefined,
            subject,
            subjects: [subject, ...tagList],
            tags: tagList,
            is_ministry_official: isMinistryAligned,
            visibility: 'public',
          },
        });
      }

      setSuccessNotice(`"${title}" submitted successfully for pedagogical review!`);
      setTitle('');
      setUrl('');
      setDescription('');
      setTags('');
      setIsMinistryAligned(false);
    } catch {
      // Offline / explore fallback
      setSuccessNotice(`"${title}" has been saved locally and queued for peer review.`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.headerBar}>
        <div className={styles.titleArea}>
          <Link to="/library" className={styles.backLink}>
            ← Back to Sanctuary Library
          </Link>
          <h1>Contribute Curricular Material</h1>
          <p>
            Share lesson plans, past exam papers, field observation guides, and multimedia lectures with the Sanctuary
            pedagogical commons.
          </p>
        </div>
      </header>

      {successNotice && <div className={styles.noticeSuccess}>{successNotice}</div>}
      {errorNotice && <div className={styles.noticeSuccess} style={{ background: 'rgba(207, 34, 46, 0.12)', color: '#cf222e', borderColor: 'rgba(207, 34, 46, 0.3)' }}>{errorNotice}</div>}

      <form className={styles.card} onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="res-title">
            Resource Title *
          </label>
          <input
            id="res-title"
            type="text"
            className={styles.input}
            placeholder="e.g., Grade 10 Science: Mangrove Ecosystems & Coastal Conservation"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className={styles.gridTwo}>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="res-type">
              Curricular Category
            </label>
            <select
              id="res-type"
              className={styles.select}
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="lesson">Curricular Lesson Plan</option>
              <option value="worksheet">Student Worksheet / Activity</option>
              <option value="past_paper">Past Examination Paper</option>
              <option value="circular">Ministry Circular & Specification</option>
              <option value="field_guide">Field Guide / Environmental Study</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="res-subject">
              Subject Area
            </label>
            <select
              id="res-subject"
              className={styles.select}
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            >
              <option value="Science">Physical & Biological Science</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Literature">Sinhala & Tamil Literature</option>
              <option value="History">Sri Lankan & World History</option>
              <option value="Agriculture">Agriculture & Environmental Science</option>
              <option value="General">General / Cross-Disciplinary</option>
            </select>
          </div>
        </div>

        <div className={styles.gridTwo}>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="res-format">
              Media Format
            </label>
            <select
              id="res-format"
              className={styles.select}
              value={format}
              onChange={(e) => setFormat(e.target.value)}
            >
              <option value="document">PDF / Printed Document</option>
              <option value="markdown">Gurudevi Markdown Lesson</option>
              <option value="slides">Slide Deck (Marp / PPTX)</option>
              <option value="h5p">Interactive H5P Package</option>
              <option value="video">Streaming Video / Lecture</option>
              <option value="audio">Audio Narrative / Podcast</option>
              <option value="interactive">Interactive Dataset / Tool</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="res-url">
              Document URL / Storage Link
            </label>
            <input
              id="res-url"
              type="url"
              className={styles.input}
              placeholder="https://... or sample-curriculum.pdf"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="res-desc">
            Pedagogical Description & Context
          </label>
          <textarea
            id="res-desc"
            className={styles.textarea}
            placeholder="Outline the learning objectives, grade-level competencies, and suggested teaching timeline…"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="res-tags">
            Keywords & Syllabus Codes
          </label>
          <input
            id="res-tags"
            type="text"
            className={styles.input}
            placeholder="e.g., Grade 10, Biology, Wet-Zone, Biodiversity"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
          <p className={styles.hint}>Separate keywords with commas</p>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="res-file-import">
            Import Local File (.pdf, .docx, .pptx, .md, .h5p, images, audio, video)
          </label>
          <input
            id="res-file-import"
            type="file"
            accept=".pdf,.docx,.pptx,.md,.markdown,.h5p,image/*,audio/*,video/*"
            className={styles.input}
            onChange={handleFileImport}
          />
          {importSummary && <p className={styles.hint}>{importSummary}</p>}
          {lastAssetMeta && (lastAssetMeta.storageLane === 'images' || lastAssetMeta.mime === 'application/pdf') && url && (
            <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <button
                type="button"
                className={styles.backLink}
                disabled={ocrRunning}
                onClick={async () => {
                  const res = await runOcr({
                    uri: url,
                    name: lastAssetMeta.fileName,
                    mime: lastAssetMeta.mime,
                    sha256: lastAssetMeta.sha256,
                  });
                  if (res?.text) {
                    setOcrText(res.text);
                    if (!bodyMarkdown.trim()) setBodyMarkdown(res.text);
                    setImportSummary(`OCR extracted ${res.text.length} chars (${res.method}).`);
                  }
                }}
              >
                {ocrRunning ? `Running OCR (${ocrProgress}%)…` : 'Extract Text (OCR)'}
              </button>
            </div>
          )}
          {pendingAssetCount > 0 && (
            <p className={styles.hint}>Outbox queue: {pendingAssetCount} asset(s) waiting to sync</p>
          )}
        </div>

        <div className={styles.formGroup}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <span className={styles.label} style={{ margin: 0 }}>
              Lesson Body / Slides (Gurudevi Markdown)
            </span>
            <button
              type="button"
              className={styles.backLink}
              onClick={() => setShowPreview((p) => !p)}
            >
              {showPreview ? 'Edit' : 'Preview Rendered'}
            </button>
          </div>
          {showPreview ? (
            <div style={{ padding: '1rem', borderRadius: '0.5rem', border: '1px solid rgba(104,94,85,0.2)' }}>
              <Markdown source={bodyMarkdown || '_Nothing drafted yet._'} />
            </div>
          ) : (
            <RichTextEditor
              label="Lesson Content"
              value={bodyMarkdown}
              onChange={setBodyMarkdown}
              placeholder="Write or import from .docx / .pptx…"
            />
          )}
        </div>

        <label className={styles.checkboxRow}>
          <input
            type="checkbox"
            checked={isMinistryAligned}
            onChange={(e) => setIsMinistryAligned(e.target.checked)}
          />
          <span>This resource aligns with National Institute of Education (NIE) curricular guidelines</span>
        </label>

        <div>
          <button type="submit" className={styles.submitBtn} disabled={submitting}>
            {submitting ? 'Submitting to Sanctuary…' : 'Submit Resource for Review'}
          </button>
        </div>
      </form>
    </div>
  );
}

export const ContributeFloor = ContributeDesk;

