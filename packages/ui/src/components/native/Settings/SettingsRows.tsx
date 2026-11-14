import { useState } from 'react';
import { Linking, Text as RNText } from 'react-native';
import type {
  ChoiceRowContract,
  DangerRowContract,
  LinkRowContract,
} from '../../../theme/contracts';
import { useFeedback } from '../../../theme/native/feedback';
import { useWorldContext } from '../../../theme/native/WorldContext';
import { SETTINGS_ENGLISH, safeLinkUrl } from '../../shared/basics';
import { Button } from '../Button/Button';
import { Dialog } from '../Dialog/Dialog';
import { RadioGroup } from '../Radio/RadioGroup';
import { Row } from '../Row/Row';
import { Sheet } from '../Sheet/Sheet';

export type ChoiceRowProps<V extends string = string> = ChoiceRowContract<V>;

/**
 * A setting with one chosen value. The row says the choice; pressing opens
 * the choices in a sheet, and choosing closes it so focus comes back here.
 */
export function ChoiceRow<V extends string = string>({
  label,
  value,
  options,
  onChange,
  note,
  placeholder = SETTINGS_ENGLISH.notSet,
}: ChoiceRowProps<V>) {
  const [open, setOpen] = useState(false);
  const chosen = options.find((o) => o.value === value);
  return (
    <>
      <Row
        label={label}
        detail={chosen?.label ?? placeholder}
        note={note}
        onPress={() => setOpen(true)}
      />
      <Sheet open={open} onClose={() => setOpen(false)} title={label}>
        <RadioGroup
          label={label}
          value={value}
          options={options}
          onChange={(next) => {
            setOpen(false);
            onChange(next);
          }}
        />
      </Sheet>
    </>
  );
}

export type LinkRowProps = LinkRowContract;

/**
 * A row that goes somewhere. Going outside the app is said in words and
 * drawn with ↗; an address the kit will not open fails with error feedback
 * rather than silently.
 */
export function LinkRow({ label, detail, note, href, onPress, external, labels }: LinkRowProps) {
  const { world } = useWorldContext();
  const feedback = useFeedback();
  const l = { ...SETTINGS_ENGLISH, ...labels };
  const open = async () => {
    if (onPress) {
      onPress();
      return;
    }
    const safe = href ? safeLinkUrl(href) : null;
    if (!safe) {
      feedback('error');
      return;
    }
    try {
      await Linking.openURL(safe);
    } catch {
      // No app can open it (no mail client, say): the person feels it failed.
      feedback('error');
    }
  };
  return (
    <Row
      label={label}
      detail={detail}
      note={note}
      onPress={() => void open()}
      accessibilityHint={external ? l.opensOutside : undefined}
      chevron={!external}
      accessory={
        external ? (
          <RNText
            accessibilityElementsHidden
            importantForAccessibility="no"
            style={{ color: world.recipes.row.chevron, fontSize: 16, lineHeight: 20 }}
          >
            {detail ? `${detail}  ↗` : '↗'}
          </RNText>
        ) : undefined
      }
    />
  );
}

export type DangerRowProps = DangerRowContract;

/**
 * A row that ends or deletes something, its label in danger words. With
 * `confirm` it asks first in a dialog whose own action is the danger
 * button; while the action runs the row is off and says it is working.
 */
export function DangerRow({ label, note, onConfirm, confirm, busy, labels }: DangerRowProps) {
  const feedback = useFeedback();
  const l = { ...SETTINGS_ENGLISH, ...labels };
  const [asking, setAsking] = useState(false);
  const run = () => {
    feedback('destructive');
    onConfirm();
  };
  return (
    <>
      <Row
        label={label}
        tone="danger"
        note={busy ? l.working : note}
        chevron={false}
        onPress={busy ? undefined : () => (confirm ? setAsking(true) : run())}
      />
      {confirm ? (
        <Dialog
          open={asking}
          onClose={() => setAsking(false)}
          title={confirm.title}
          description={confirm.description}
          actions={
            <>
              <Button
                variant="quiet"
                label={confirm.cancelLabel ?? l.cancel}
                onPress={() => setAsking(false)}
              />
              <Button
                variant="danger"
                label={confirm.confirmLabel}
                onPress={() => {
                  setAsking(false);
                  run();
                }}
              />
            </>
          }
        />
      ) : null}
    </>
  );
}
