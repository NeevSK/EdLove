import { useId } from 'react';
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
import { AGENT_ENGLISH, PRIVACY_MODES } from '../../shared/agent';
import { Button } from '../Button/Button';
import { Chip, Chips } from '../Chip/Chip';
import { Markdown } from '../Media/Markdown';
import { WaitingSign } from '../WaitingSign/WaitingSign';

/** Reasoning in a native disclosure: collapsed until asked. */
export function ThinkingTrace({ content, state, seconds, labels }: ThinkingTraceContract) {
  const l = { ...AGENT_ENGLISH, ...labels };
  const title =
    state === 'thinking' ? l.thinking : seconds !== undefined ? l.thoughtFor(seconds) : l.done;
  return (
    <details className="gd-agent-card gd-thinking" data-state={state}>
      <summary>
        {state === 'thinking' ? <WaitingSign size={16} /> : null}
        <span>{title}</span>
      </summary>
      {content ? <Markdown source={content} /> : null}
    </details>
  );
}

/** One tool the agent is using, in words: working, done (with a result), or did not finish. */
export function ToolCallCard({ title, state, detail, result, onRetry, labels }: ToolCallContract) {
  const l = { ...AGENT_ENGLISH, ...labels };
  const word = state === 'running' ? l.running : state === 'done' ? l.done : l.toolFailed;
  return (
    <section className="gd-agent-card" data-state={state} aria-label={`${title}, ${word}`}>
      <div className="gd-agent-head">
        {state === 'running' ? <WaitingSign size={16} /> : null}
        <span className="gd-agent-title">{title}</span>
        <span className="gd-agent-state" aria-live="polite">
          {word}
        </span>
      </div>
      {detail ? <p className="gd-agent-detail">{detail}</p> : null}
      {state === 'done' && result ? <p className="gd-agent-result">{result}</p> : null}
      {state === 'failed' && onRetry ? (
        <Button label={l.retry} variant="quiet" size="sm" onClick={onRetry} />
      ) : null}
    </section>
  );
}

/** Human in the loop: Accept or Discard, then what happened, in words. */
export function ApprovalCard({
  title,
  changes,
  target,
  state,
  onAccept,
  onDiscard,
  labels,
}: ApprovalCardContract) {
  const l = { ...AGENT_ENGLISH, ...labels };
  const headingId = useId();
  const said: Partial<Record<typeof state, string>> = {
    accepted: l.accepted,
    discarded: l.discarded,
    failed: l.approvalFailed,
    expired: l.expired,
  };
  return (
    <section className="gd-approval" data-state={state} aria-labelledby={headingId}>
      <h3 id={headingId} className="gd-approval-title">
        {title}
      </h3>
      {target ? <p className="gd-agent-detail">{target}</p> : null}
      {changes ? <Markdown source={changes} /> : null}
      {said[state] ? (
        <p role="alert" className="gd-approval-outcome">
          {said[state]}
        </p>
      ) : null}
      {state === 'pending' || state === 'submitting' || state === 'failed' ? (
        <div className="gd-agent-actions">
          <Button
            label={state === 'submitting' ? l.submitting : l.accept}
            loading={state === 'submitting'}
            onClick={onAccept}
          />
          <Button
            label={l.discard}
            variant="quiet"
            onClick={onDiscard}
            disabled={state === 'submitting'}
          />
        </div>
      ) : null}
    </section>
  );
}

/** A run's steps as an ordered list, with elapsed time and cancel. */
export function RunStatus({ steps, elapsed, onCancel, labels }: RunStatusContract) {
  const l = { ...AGENT_ENGLISH, ...labels };
  const running = steps.some((s) => s.state === 'running');
  const word = (s: (typeof steps)[number]['state']) =>
    s === 'running' ? l.running : s === 'done' ? l.done : s === 'failed' ? l.toolFailed : '';
  return (
    <section className="gd-agent-card">
      <ol className="gd-run-steps">
        {steps.map((step, i) => (
          <li key={`${i}-${step.label}`} data-state={step.state}>
            <span className="gd-agent-title">{step.label}</span>
            {word(step.state) ? <span className="gd-agent-state">{word(step.state)}</span> : null}
          </li>
        ))}
      </ol>
      {elapsed || (running && onCancel) ? (
        <div className="gd-agent-head">
          <span className="gd-agent-detail">{elapsed}</span>
          {running && onCancel ? (
            <Button label={l.cancel} variant="quiet" size="sm" onClick={onCancel} />
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

export function MessageActions({ onCopy, onRegenerate, onEdit, labels }: MessageActionsContract) {
  const l = { ...AGENT_ENGLISH, ...labels };
  return (
    <div className="gd-agent-actions">
      {onCopy ? <Button label={l.copy} variant="quiet" size="sm" onClick={onCopy} /> : null}
      {onRegenerate ? (
        <Button label={l.regenerate} variant="quiet" size="sm" onClick={onRegenerate} />
      ) : null}
      {onEdit ? <Button label={l.edit} variant="quiet" size="sm" onClick={onEdit} /> : null}
    </div>
  );
}

export function Citation({ index, title, source, onOpen }: CitationContract) {
  const name = AGENT_ENGLISH.source(index, title);
  return onOpen ? (
    <button type="button" className="gd-citation" aria-label={name} title={source} onClick={onOpen}>
      [{index}]
    </button>
  ) : (
    <span className="gd-citation" role="note" aria-label={name}>
      [{index}]
    </span>
  );
}

/** Something the agent made, as a tile; a generated page opens only in a sealed frame. */
export function ArtifactCard({ title, kind, summary, onOpen, labels }: ArtifactCardContract) {
  const l = { ...AGENT_ENGLISH, ...labels };
  return (
    <button type="button" className="gd-agent-card gd-artifact" onClick={onOpen}>
      <span className="gd-agent-state">{kind.toUpperCase()}</span>
      <span className="gd-agent-title">{title}</span>
      <span className="gd-agent-detail">{kind === 'html' ? l.sandboxed : summary}</span>
    </button>
  );
}

export function PrivacyState({ mode, onChange, labels }: PrivacyStateContract) {
  const l = { ...AGENT_ENGLISH, ...labels };
  if (!onChange) return <p className="gd-privacy-state">{l.privacy[mode]}</p>;
  return (
    <Chips label={l.privacy[mode]} single>
      {PRIVACY_MODES.map((m) => (
        <Chip
          key={m}
          kind="radio"
          label={l.privacy[m]}
          selected={m === mode}
          onClick={() => onChange(m)}
        />
      ))}
    </Chips>
  );
}
