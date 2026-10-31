import type { ActionFabContract, FabMenuContract } from '../../../theme/contracts';
import { iconSize } from '../../../tokens/sizes';
import { cx } from '../cx';
import { Row } from '../Row/Row';
import { Sheet } from '../Sheet/Sheet';

export interface ActionFabProps extends ActionFabContract {
  className?: string;
}

/** The floating action: one lit control in the world's lamp, with a worded signal. */
export function ActionFab({
  label,
  icon: Glyph,
  onPress,
  signal,
  signalLabel,
  hidden,
  className,
}: ActionFabProps) {
  if (hidden) return null;
  const name = signal && signalLabel ? `${label}, ${signalLabel}` : label;
  return (
    <button type="button" className={cx('gd-fab', className)} aria-label={name} onClick={onPress}>
      {Glyph ? (
        <Glyph size={iconSize.lg} color="currentColor" aria-hidden />
      ) : (
        <span aria-hidden>+</span>
      )}
      {signal ? <span className="gd-fab-signal" aria-hidden /> : null}
    </button>
  );
}

export type FabMenuProps = FabMenuContract;

/** A sheet of named actions; choosing closes it first, so focus returns before the action runs. */
export function FabMenu({ open, onClose, label, actions }: FabMenuProps) {
  return (
    <Sheet open={open} onClose={onClose} title={label}>
      <div className="gd-fab-menu">
        {actions.map((a) => (
          <Row
            key={a.key}
            label={a.label}
            note={a.hint}
            className={
              a.tone === 'danger' ? 'gd-fab-danger' : a.tone === 'lamp' ? 'gd-fab-lit' : undefined
            }
            onPress={() => {
              onClose();
              a.onPress();
            }}
          />
        ))}
      </div>
    </Sheet>
  );
}
