import { useEffect, useRef, useState } from 'react';
import { Text as RNText, View } from 'react-native';
import type {
  AudioRecordContract,
  FileFieldContract,
  FileRef,
  ImageCaptureContract,
  RecorderPort,
} from '../../../theme/contracts';
import { useFeedback } from '../../../theme/native/feedback';
import { typeStyle } from '../../../theme/native/style';
import { useWorldContext } from '../../../theme/native/WorldContext';
import { gapFor } from '../../../tokens/space';
import { FILE_CARD_ENGLISH } from '../../shared/files';
import { checkFiles, formatDuration, MEDIA_ENGLISH, rulesText } from '../../shared/media';
import { Button } from '../Button/Button';
import { useMediaAdapters } from './adapters';
import { FileCard } from './FileCard';
import { Media } from './Media';

/** The field's label, hint, rules and announced messages, shared by every capture piece. */
function useFieldText() {
  const { world, language } = useWorldContext();
  return {
    label: typeStyle(world.recipes.field.label, language, world),
    hint: typeStyle(world.recipes.field.hint, language, world),
    error: typeStyle(world.recipes.field.error, language, world),
  };
}

function Announced({ messages, style }: { messages: readonly string[]; style: object }) {
  if (messages.length === 0) return null;
  return (
    <View accessibilityRole="alert" accessibilityLiveRegion="polite">
      {messages.map((m) => (
        <RNText key={m} style={style}>
          {m}
        </RNText>
      ))}
    </View>
  );
}

export type FileFieldProps = FileFieldContract;

/**
 * Choose files. The rules are said before choosing; files that break them are
 * refused one by one with their reason; each taken file is a card with
 * progress, error, retry and remove. Without a picker it says so.
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
}: FileFieldProps) {
  const { language } = useWorldContext();
  const t = useFieldText();
  const feedback = useFeedback();
  const l = { ...MEDIA_ENGLISH, ...labels };
  const pick = useMediaAdapters().capture?.pickFiles;
  const [said, setSaid] = useState<string[]>([]);
  const rules = { accept, maxBytes, maxFiles };
  const full = maxFiles !== undefined && files.length >= maxFiles;
  const ruleWords = rulesText(rules, l, FILE_CARD_ENGLISH.kinds, language);

  const choose = async () => {
    if (!pick) return;
    const result = await pick({ accept, multiple: maxFiles !== 1 });
    if (result.status === 'cancelled') return;
    if (result.status === 'denied') {
      feedback('error');
      setSaid([l.permission.library]);
      return;
    }
    const checked = checkFiles(result.value, rules, files.length);
    setSaid(checked.rejected.map(({ file, reason }) => l.rejected[reason](file.name)));
    if (checked.rejected.length > 0) feedback('warning');
    if (checked.accepted.length > 0) onAdd(checked.accepted);
  };

  return (
    <View style={{ gap: gapFor('inside') }}>
      <RNText style={t.label}>{label}</RNText>
      {hint ? <RNText style={t.hint}>{hint}</RNText> : null}
      {ruleWords ? <RNText style={t.hint}>{ruleWords}</RNText> : null}
      {files.length > 0 ? (
        <View role="list" aria-label={label} style={{ gap: gapFor('inside') }}>
          {files.map((f) => (
            <View key={f.uri} role="listitem">
              <FileCard
                file={f}
                progress={f.progress}
                error={f.error}
                onRetry={onRetry ? () => onRetry(f) : undefined}
                onRemove={() => onRemove(f)}
              />
            </View>
          ))}
        </View>
      ) : null}
      {pick ? (
        <Button
          label={l.choose}
          variant="secondary"
          accessibilityHint={ruleWords || undefined}
          onPress={() => void choose()}
          disabled={disabled || full}
        />
      ) : (
        <RNText style={t.hint}>{l.unavailable}</RNText>
      )}
      <Announced messages={[...said, ...(error ? [error] : [])]} style={t.error} />
    </View>
  );
}

export type ImageCaptureProps = ImageCaptureContract;

/** Take or choose one photo; it shows in place with retake and remove. */
export function ImageCapture({
  label,
  value,
  onCaptured,
  onClear,
  sources = ['camera', 'library'],
  disabled,
  labels,
}: ImageCaptureProps) {
  const t = useFieldText();
  const feedback = useFeedback();
  const l = { ...MEDIA_ENGLISH, ...labels };
  const pick = useMediaAdapters().capture?.pickImage;
  const [said, setSaid] = useState<string[]>([]);

  const take = async (source: 'camera' | 'library') => {
    if (!pick) return;
    const result = await pick(source);
    if (result.status === 'cancelled') return;
    if (result.status === 'denied') {
      feedback('error');
      setSaid([source === 'camera' ? l.permission.camera : l.permission.library]);
      return;
    }
    setSaid([]);
    feedback('success');
    onCaptured(result.value);
  };

  return (
    <View style={{ gap: gapFor('inside') }}>
      <RNText style={t.label}>{label}</RNText>
      {value ? <Media file={value} alt={label} aspect={4 / 3} /> : null}
      {pick ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {sources.includes('camera') ? (
            <Button
              label={value ? l.retake : l.takePhoto}
              variant={value ? 'secondary' : 'primary'}
              onPress={() => void take('camera')}
              disabled={disabled}
            />
          ) : null}
          {sources.includes('library') ? (
            <Button
              label={l.choosePhoto}
              variant="secondary"
              onPress={() => void take('library')}
              disabled={disabled}
            />
          ) : null}
          {value && onClear ? (
            <Button label={l.remove} variant="quiet" onPress={onClear} disabled={disabled} />
          ) : null}
        </View>
      ) : (
        <RNText style={t.hint}>{l.unavailable}</RNText>
      )}
      <Announced messages={said} style={t.error} />
    </View>
  );
}

export type AudioRecordProps = AudioRecordContract;

/** Record a voice answer: record, stop (or the limit stops it), play back, record again. */
export function AudioRecord(props: AudioRecordProps) {
  const useRecorder = useMediaAdapters().capture?.useRecorder;
  const t = useFieldText();
  const l = { ...MEDIA_ENGLISH, ...props.labels };
  if (!useRecorder) {
    return (
      <View style={{ gap: gapFor('inside') }}>
        <RNText style={t.label}>{props.label}</RNText>
        {props.value ? <Media file={props.value} /> : null}
        <RNText style={t.hint}>{l.unavailable}</RNText>
      </View>
    );
  }
  return <LiveAudioRecord {...props} useRecorder={useRecorder} />;
}

function LiveAudioRecord({
  label,
  value,
  onRecorded,
  onClear,
  maxSeconds,
  disabled,
  labels,
  useRecorder,
}: AudioRecordProps & { useRecorder: () => RecorderPort }) {
  const t = useFieldText();
  const feedback = useFeedback();
  const l = { ...MEDIA_ENGLISH, ...labels };
  const recorder = useRecorder();
  const [said, setSaid] = useState<string[]>([]);
  const stopping = useRef(false);

  const stop = async () => {
    if (stopping.current) return;
    stopping.current = true;
    try {
      const file: FileRef & { durationMs: number } = await recorder.stop();
      feedback('commit');
      onRecorded(file);
    } finally {
      stopping.current = false;
    }
  };

  // The limit stops the recording, so it is never cut short silently.
  useEffect(() => {
    if (recorder.recording && maxSeconds !== undefined && recorder.elapsedMs >= maxSeconds * 1000)
      void stop();
  });

  const start = async () => {
    if (!(await recorder.prepare())) {
      feedback('error');
      setSaid([l.permission.microphone]);
      return;
    }
    setSaid([]);
    feedback('press');
    await recorder.start();
  };

  const length = l.recordingLength(
    formatDuration(recorder.recording ? recorder.elapsedMs : (value?.durationMs ?? 0)),
    maxSeconds === undefined ? undefined : formatDuration(maxSeconds * 1000),
  );

  return (
    <View style={{ gap: gapFor('inside') }}>
      <RNText style={t.label}>{label}</RNText>
      {value && !recorder.recording ? <Media file={value} /> : null}
      {recorder.recording || value ? (
        <RNText accessibilityLiveRegion={recorder.recording ? 'none' : 'polite'} style={t.hint}>
          {length}
        </RNText>
      ) : null}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {recorder.recording ? (
          <Button label={l.stopRecording} onPress={() => void stop()} />
        ) : (
          <Button
            label={value ? l.recordAgain : l.record}
            variant={value ? 'secondary' : 'primary'}
            onPress={() => void start()}
            disabled={disabled}
          />
        )}
        {value && onClear && !recorder.recording ? (
          <Button label={l.remove} variant="quiet" onPress={onClear} disabled={disabled} />
        ) : null}
      </View>
      <Announced messages={said} style={t.error} />
    </View>
  );
}
