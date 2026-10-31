import { useEffect, useId, useRef, useState } from 'react';
import type {
  AudioRecordContract,
  FileFieldContract,
  FileRef,
  ImageCaptureContract,
} from '../../../theme/contracts';
import { FILE_CARD_ENGLISH } from '../../shared/files';
import {
  acceptAttribute,
  checkFiles,
  formatDuration,
  MEDIA_ENGLISH,
  rulesText,
} from '../../shared/media';
import { Button } from '../Button/Button';
import { FileCard } from './FileCard';
import { Media } from './Media';

/** A browser File as a FileRef; the blob: address lives as long as the page. */
function refOf(file: File): FileRef {
  return {
    name: file.name,
    uri: URL.createObjectURL(file),
    mime: file.type || undefined,
    size: file.size,
  };
}

function Announced({ messages }: { messages: readonly string[] }) {
  return (
    <div className="gd-capture-messages" role="alert">
      {messages.map((m) => (
        <p key={m}>{m}</p>
      ))}
    </div>
  );
}

export type FileFieldProps = FileFieldContract & { lang?: string };

/**
 * Choose or drop files. The rules are said before choosing; files that break
 * them are refused one by one with their reason; each taken file is a card
 * with progress, error, retry and remove.
 */
export function FileField({
  label,
  hint,
  files,
  onAdd,
  onRemove,
  onRetry,
  error,
  disabled,
  accept,
  maxBytes,
  maxFiles,
  labels,
  lang,
}: FileFieldProps) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const l = { ...MEDIA_ENGLISH, ...labels };
  const [said, setSaid] = useState<string[]>([]);
  const [over, setOver] = useState(false);
  const rules = { accept, maxBytes, maxFiles };
  const full = maxFiles !== undefined && files.length >= maxFiles;
  const ruleWords = rulesText(rules, l, FILE_CARD_ENGLISH.kinds, lang);

  const take = (list: FileList | null) => {
    if (!list || list.length === 0) return;
    const checked = checkFiles(Array.from(list, refOf), rules, files.length);
    setSaid(checked.rejected.map(({ file, reason }) => l.rejected[reason](file.name)));
    if (checked.accepted.length > 0) onAdd(checked.accepted);
  };

  const messages = [...said, ...(error ? [error] : [])];
  return (
    <div className="gd-field gd-file-field" data-state={messages.length > 0 ? 'error' : undefined}>
      <label htmlFor={id} className="gd-field-label">
        {label}
      </label>
      {hint ? <p className="gd-field-hint">{hint}</p> : null}
      <div
        className="gd-dropzone"
        data-over={over ? '' : undefined}
        data-disabled={disabled || full ? '' : undefined}
        onDragOver={(e) => {
          if (disabled || full) return;
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          if (!disabled && !full) take(e.dataTransfer.files);
        }}
      >
        <input
          ref={input}
          id={id}
          type="file"
          className="gd-visually-hidden"
          accept={acceptAttribute(accept)}
          multiple={maxFiles !== 1}
          disabled={disabled || full}
          aria-describedby={`${id}-rules`}
          onChange={(e) => {
            take(e.currentTarget.files);
            e.currentTarget.value = '';
          }}
        />
        <Button
          label={l.choose}
          variant="secondary"
          disabled={disabled || full}
          onClick={() => input.current?.click()}
        />
        <span className="gd-field-hint">{l.drop}</span>
        <p id={`${id}-rules`} className="gd-field-hint">
          {ruleWords}
        </p>
      </div>
      {files.length > 0 ? (
        <ul className="gd-file-list" aria-label={label}>
          {files.map((f) => (
            <li key={f.uri}>
              <FileCard
                file={f}
                lang={lang}
                progress={f.progress}
                error={f.error}
                onRetry={onRetry ? () => onRetry(f) : undefined}
                onRemove={() => onRemove(f)}
              />
            </li>
          ))}
        </ul>
      ) : null}
      {messages.length > 0 ? <Announced messages={messages} /> : null}
    </div>
  );
}

export type ImageCaptureProps = ImageCaptureContract;

/** Take (on phones, the camera opens) or choose one photo; it shows in place with retake and remove. */
export function ImageCapture({
  label,
  value,
  onCaptured,
  onClear,
  sources = ['camera', 'library'],
  disabled,
  labels,
}: ImageCaptureProps) {
  const l = { ...MEDIA_ENGLISH, ...labels };
  const camera = useRef<HTMLInputElement>(null);
  const library = useRef<HTMLInputElement>(null);
  const take = (list: FileList | null) => {
    const file = list?.[0];
    if (file) onCaptured(refOf(file));
  };
  return (
    <div className="gd-field gd-image-capture" role="group" aria-label={label}>
      <p className="gd-field-label">{label}</p>
      {value ? <Media file={value} alt={label} aspect={4 / 3} /> : null}
      <input
        ref={camera}
        type="file"
        accept="image/*"
        capture="environment"
        className="gd-visually-hidden"
        tabIndex={-1}
        aria-hidden
        onChange={(e) => {
          take(e.currentTarget.files);
          e.currentTarget.value = '';
        }}
      />
      <input
        ref={library}
        type="file"
        accept="image/*"
        className="gd-visually-hidden"
        tabIndex={-1}
        aria-hidden
        onChange={(e) => {
          take(e.currentTarget.files);
          e.currentTarget.value = '';
        }}
      />
      <div className="gd-capture-actions">
        {sources.includes('camera') ? (
          <Button
            label={value ? l.retake : l.takePhoto}
            variant={value ? 'secondary' : 'primary'}
            disabled={disabled}
            onClick={() => camera.current?.click()}
          />
        ) : null}
        {sources.includes('library') ? (
          <Button
            label={l.choosePhoto}
            variant="secondary"
            disabled={disabled}
            onClick={() => library.current?.click()}
          />
        ) : null}
        {value && onClear ? (
          <Button label={l.remove} variant="quiet" disabled={disabled} onClick={onClear} />
        ) : null}
      </div>
    </div>
  );
}

export type AudioRecordProps = AudioRecordContract;

/**
 * Record a voice answer with the browser's MediaRecorder: record, stop (or
 * the limit stops it), play back, record again. Microphone refusal is said.
 */
export function AudioRecord({
  label,
  value,
  onRecorded,
  onClear,
  maxSeconds,
  disabled,
  labels,
}: AudioRecordProps) {
  const l = { ...MEDIA_ENGLISH, ...labels };
  const recorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const started = useRef(0);
  const [elapsed, setElapsed] = useState(0);
  const [recording, setRecording] = useState(false);
  const [said, setSaid] = useState<string[]>([]);
  const supported =
    typeof window !== 'undefined' && 'MediaRecorder' in window && !!navigator.mediaDevices;

  useEffect(() => {
    if (!recording) return;
    const timer = window.setInterval(() => {
      const ms = Date.now() - started.current;
      setElapsed(ms);
      // The limit stops the recording, so it is never cut short silently.
      if (maxSeconds !== undefined && ms >= maxSeconds * 1000) recorder.current?.stop();
    }, 250);
    return () => window.clearInterval(timer);
  }, [recording, maxSeconds]);

  const start = async () => {
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setSaid([l.permission.microphone]);
      return;
    }
    setSaid([]);
    const r = new MediaRecorder(stream);
    chunks.current = [];
    r.ondataavailable = (e) => chunks.current.push(e.data);
    r.onstop = () => {
      for (const track of stream.getTracks()) track.stop();
      setRecording(false);
      const type = r.mimeType || 'audio/webm';
      const blob = new Blob(chunks.current, { type });
      const durationMs = Date.now() - started.current;
      onRecorded({
        name: `voice-${Date.now()}.webm`,
        uri: URL.createObjectURL(blob),
        mime: type,
        size: blob.size,
        durationMs,
      });
    };
    recorder.current = r;
    started.current = Date.now();
    setElapsed(0);
    r.start();
    setRecording(true);
  };

  const length = l.recordingLength(
    formatDuration(recording ? elapsed : (value?.durationMs ?? 0)),
    maxSeconds === undefined ? undefined : formatDuration(maxSeconds * 1000),
  );
  return (
    <div className="gd-field gd-audio-record" role="group" aria-label={label}>
      <p className="gd-field-label">{label}</p>
      {value && !recording ? <Media file={value} /> : null}
      {recording || value ? (
        <p className="gd-field-hint" aria-live={recording ? 'off' : 'polite'}>
          {length}
        </p>
      ) : null}
      {supported ? (
        <div className="gd-capture-actions">
          {recording ? (
            <Button label={l.stopRecording} onClick={() => recorder.current?.stop()} />
          ) : (
            <Button
              label={value ? l.recordAgain : l.record}
              variant={value ? 'secondary' : 'primary'}
              disabled={disabled}
              onClick={() => void start()}
            />
          )}
          {value && onClear && !recording ? (
            <Button label={l.remove} variant="quiet" disabled={disabled} onClick={onClear} />
          ) : null}
        </div>
      ) : (
        <p className="gd-field-hint">{l.unavailable}</p>
      )}
      {said.length > 0 ? <Announced messages={said} /> : null}
    </div>
  );
}
