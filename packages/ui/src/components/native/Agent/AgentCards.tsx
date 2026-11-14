import { type ReactNode, useEffect, useRef, useState } from 'react';
import { Pressable, Text as RNText, StyleSheet, View } from 'react-native';
import type {
  ApprovalCardContract,
  ArtifactCardContract,
  CitationContract,
  MessageActionsContract,
  PrivacyStateContract,
  RunStatusContract,
  ThinkingTraceContract,
  ToolCallContract,
} from '../../../theme/contracts';
import { useFeedback } from '../../../theme/native/feedback';
import { edgeStyle, radiusStyle, typeStyle } from '../../../theme/native/style';
import { useWorldContext } from '../../../theme/native/WorldContext';
import { gapFor } from '../../../tokens/space';
import { AGENT_ENGLISH, PRIVACY_MODES } from '../../shared/agent';
import { Button } from '../Button/Button';
import { Chip, Chips } from '../Chip/Chip';
import { Markdown } from '../Media/Markdown';
import { WaitingSign } from '../WaitingSign/WaitingSign';

/** The quiet well every agent card sits in. */
function Well({ children, label }: { children: ReactNode; label?: string }) {
  const { world } = useWorldContext();
  const c = world.recipes.message.card;
  return (
    <View
      accessibilityLabel={label}
      style={[
        styles.well,
        { backgroundColor: c.fill, gap: gapFor('inside') },
        radiusStyle(c.radius),
        edgeStyle(c.edge),
      ]}
    >
      {children}
    </View>
  );
}

/** Reasoning, collapsed by default: "Thinking" while it streams, "Thought for 12 s" after. */
export function ThinkingTrace({ content, state, seconds, labels }: ThinkingTraceContract) {
  const { world, language } = useWorldContext();
  const l = { ...AGENT_ENGLISH, ...labels };
  const [open, setOpen] = useState(false);
  const title =
    state === 'thinking' ? l.thinking : seconds !== undefined ? l.thoughtFor(seconds) : l.done;
  return (
    <Well>
      <Pressable
        role="button"
        aria-expanded={open}
        accessibilityLabel={title}
        accessibilityHint={open ? l.hideThinking : l.showThinking}
        onPress={() => setOpen((o) => !o)}
        style={styles.head}
      >
        {state === 'thinking' ? <WaitingSign size={16} /> : null}
        <RNText style={typeStyle(world.recipes.text.label, language, world)}>{title}</RNText>
      </Pressable>
      {open && content ? <Markdown source={content} /> : null}
    </Well>
  );
}

/** One tool the agent is using, in words: working, done (with a result), or did not finish. */
export function ToolCallCard({ title, state, detail, result, onRetry, labels }: ToolCallContract) {
  const { world, language } = useWorldContext();
  const l = { ...AGENT_ENGLISH, ...labels };
  const ink = world.recipes.message.state;
  const word = state === 'running' ? l.running : state === 'done' ? l.done : l.toolFailed;
  return (
    <Well label={`${title}, ${word}`}>
      <View style={styles.head}>
        {state === 'running' ? <WaitingSign size={16} /> : null}
        <RNText style={[typeStyle(world.recipes.text.body, language, world), styles.grow]}>
          {title}
        </RNText>
        <RNText
          accessibilityLiveRegion="polite"
          style={[typeStyle(world.recipes.text.label, language, world), { color: ink[state] }]}
        >
          {word}
        </RNText>
      </View>
      {detail ? (
        <RNText style={typeStyle(world.recipes.text.caption, language, world)}>{detail}</RNText>
      ) : null}
      {state === 'done' && result ? (
        <RNText style={typeStyle(world.recipes.text.body, language, world)}>{result}</RNText>
      ) : null}
      {state === 'failed' && onRetry ? (
        <Button label={l.retry} variant="quiet" size="sm" onPress={onRetry} />
      ) : null}
    </Well>
  );
}

/**
 * Human in the loop. Pending offers Accept and Discard; submitting waits;
 * accepted, discarded, failed and expired each say what happened. The outcome
 * is felt once when it lands.
 */
export function ApprovalCard({
  title,
  changes,
  target,
  state,
  onAccept,
  onDiscard,
  labels,
}: ApprovalCardContract) {
  const { world, language } = useWorldContext();
  const feedback = useFeedback();
  const l = { ...AGENT_ENGLISH, ...labels };
  const a = world.recipes.message.approval;
  const ink = world.recipes.message.state;
  const last = useRef(state);
  useEffect(() => {
    if (last.current === state) return;
    last.current = state;
    if (state === 'accepted') feedback('success');
    else if (state === 'failed' || state === 'expired') feedback('error');
  }, [state, feedback]);
  const outcome: Partial<Record<typeof state, { text: string; color: string }>> = {
    accepted: { text: l.accepted, color: ink.done },
    discarded: { text: l.discarded, color: world.tokens.inkSoft },
    failed: { text: l.approvalFailed, color: ink.failed },
    expired: { text: l.expired, color: ink.failed },
  };
  const said = outcome[state];
  return (
    <View
      style={[
        styles.well,
        { backgroundColor: a.fill, gap: gapFor('between') },
        radiusStyle(world.recipes.surface.raised.radius),
        edgeStyle(a.edge),
      ]}
    >
      <RNText
        accessibilityRole="header"
        style={typeStyle(world.recipes.text.title, language, world)}
      >
        {title}
      </RNText>
      {target ? (
        <RNText style={typeStyle(world.recipes.text.caption, language, world)}>{target}</RNText>
      ) : null}
      {changes ? <Markdown source={changes} /> : null}
      {said ? (
        <RNText
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
          style={[typeStyle(world.recipes.text.body, language, world), { color: said.color }]}
        >
          {said.text}
        </RNText>
      ) : null}
      {state === 'pending' || state === 'submitting' || state === 'failed' ? (
        <View style={styles.actions}>
          <Button
            label={state === 'submitting' ? l.submitting : l.accept}
            loading={state === 'submitting'}
            onPress={onAccept}
          />
          <Button
            label={l.discard}
            variant="quiet"
            onPress={onDiscard}
            disabled={state === 'submitting'}
          />
        </View>
      ) : null}
    </View>
  );
}

/** A run's steps, each pending, working, done or not finished, with elapsed time and cancel. */
export function RunStatus({ steps, elapsed, onCancel, labels }: RunStatusContract) {
  const { world, language } = useWorldContext();
  const l = { ...AGENT_ENGLISH, ...labels };
  const ink = world.recipes.message.state;
  const running = steps.some((s) => s.state === 'running');
  return (
    <Well>
      <View role="list" style={{ gap: gapFor('inside') }}>
        {steps.map((step, i) => {
          const word =
            step.state === 'running'
              ? l.running
              : step.state === 'done'
                ? l.done
                : step.state === 'failed'
                  ? l.toolFailed
                  : '';
          return (
            <View
              key={`${i}-${step.label}`}
              role="listitem"
              accessible
              accessibilityLabel={word ? `${step.label}, ${word}` : step.label}
              style={styles.head}
            >
              <RNText
                style={[
                  typeStyle(world.recipes.text.body, language, world),
                  styles.grow,
                  step.state === 'pending' ? { color: world.tokens.inkSoft } : null,
                ]}
              >
                {step.label}
              </RNText>
              {step.state !== 'pending' ? (
                <RNText
                  style={[
                    typeStyle(world.recipes.text.label, language, world),
                    { color: ink[step.state] },
                  ]}
                >
                  {word}
                </RNText>
              ) : null}
            </View>
          );
        })}
      </View>
      {elapsed || (running && onCancel) ? (
        <View style={styles.head}>
          {elapsed ? (
            <RNText style={[typeStyle(world.recipes.text.caption, language, world), styles.grow]}>
              {elapsed}
            </RNText>
          ) : (
            <View style={styles.grow} />
          )}
          {running && onCancel ? (
            <Button label={l.cancel} variant="quiet" size="sm" onPress={onCancel} />
          ) : null}
        </View>
      ) : null}
    </Well>
  );
}

/** Copy, answer again, edit: each named, shown only when offered. */
export function MessageActions({ onCopy, onRegenerate, onEdit, labels }: MessageActionsContract) {
  const l = { ...AGENT_ENGLISH, ...labels };
  return (
    <View style={styles.actions}>
      {onCopy ? <Button label={l.copy} variant="quiet" size="sm" onPress={onCopy} /> : null}
      {onRegenerate ? (
        <Button label={l.regenerate} variant="quiet" size="sm" onPress={onRegenerate} />
      ) : null}
      {onEdit ? <Button label={l.edit} variant="quiet" size="sm" onPress={onEdit} /> : null}
    </View>
  );
}

/** A numbered source; opens it when it can. */
export function Citation({ index, title, source, onOpen }: CitationContract) {
  const { world, language } = useWorldContext();
  const chip = world.recipes.chip;
  const name = AGENT_ENGLISH.source(index, title);
  const mark = (
    <RNText style={[typeStyle(chip.label, language, world), { color: world.tokens.lampDeep }]}>
      [{index}]
    </RNText>
  );
  return onOpen ? (
    <Pressable
      role="link"
      accessibilityLabel={name}
      accessibilityHint={source}
      onPress={onOpen}
      hitSlop={10}
    >
      {mark}
    </Pressable>
  ) : (
    <View accessible accessibilityLabel={name}>
      {mark}
    </View>
  );
}

/** Something the agent made (a document, a generated page) as a tile that opens it. */
export function ArtifactCard({ title, kind, summary, onOpen, labels }: ArtifactCardContract) {
  const { world, language } = useWorldContext();
  const l = { ...AGENT_ENGLISH, ...labels };
  const feedback = useFeedback();
  return (
    <Pressable
      role="button"
      accessibilityLabel={title}
      accessibilityHint={kind === 'html' ? l.sandboxed : summary}
      onPress={() => {
        feedback('press');
        onOpen();
      }}
    >
      <Well>
        <RNText style={typeStyle(world.recipes.text.label, language, world)}>
          {kind.toUpperCase()}
        </RNText>
        <RNText style={typeStyle(world.recipes.text.body, language, world)}>{title}</RNText>
        {summary ? (
          <RNText style={typeStyle(world.recipes.text.caption, language, world)}>{summary}</RNText>
        ) : null}
      </Well>
    </Pressable>
  );
}

/** Where this chat is kept, always visible while it is not saved; can switch when allowed. */
export function PrivacyState({ mode, onChange, labels }: PrivacyStateContract) {
  const { world, language } = useWorldContext();
  const l = { ...AGENT_ENGLISH, ...labels };
  if (!onChange) {
    return (
      <RNText
        accessibilityRole="text"
        style={typeStyle(world.recipes.text.caption, language, world)}
      >
        {l.privacy[mode]}
      </RNText>
    );
  }
  return (
    <Chips label={l.privacy[mode]} single>
      {PRIVACY_MODES.map((m) => (
        <Chip
          key={m}
          kind="radio"
          label={l.privacy[m]}
          selected={m === mode}
          onPress={() => onChange(m)}
        />
      ))}
    </Chips>
  );
}

const styles = StyleSheet.create({
  well: { padding: 12 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  grow: { flex: 1 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
