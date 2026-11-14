import type { EmptyStateContract, ErrorStateContract } from '../../../theme/contracts';
import { Button } from '../Button/Button';
import { cx } from '../cx';
import { Perch } from '../Perch/Perch';

function Scene() {
  return (
    <div className="gd-state-scene" aria-hidden="true">
      <Perch />
    </div>
  );
}

export interface EmptyStateProps extends EmptyStateContract {
  className?: string;
}

/** Nothing here yet, said kindly, with the one thing that would change that. */
export function EmptyState({ title, message, action, className }: EmptyStateProps) {
  return (
    <section className={cx('gd-state', className)}>
      <Scene />
      <h2 className="gd-text" data-kind="title">
        {title}
      </h2>
      {message ? (
        <p className="gd-text" data-kind="body" data-tone="soft">
          {message}
        </p>
      ) : null}
      {action ? <Button label={action.label} onClick={action.onPress} variant="primary" /> : null}
    </section>
  );
}

export interface ErrorStateProps extends ErrorStateContract {
  className?: string;
}

/** Something went wrong: what happened in plain words, and a way to try again. Announced. */
export function ErrorState({ title, message, retry, className }: ErrorStateProps) {
  return (
    <section role="alert" className={cx('gd-state', className)}>
      <Scene />
      <h2 className="gd-text" data-kind="title">
        {title}
      </h2>
      {message ? (
        <p className="gd-text" data-kind="body" data-tone="soft">
          {message}
        </p>
      ) : null}
      {retry ? <Button label={retry.label} onClick={retry.onPress} variant="secondary" /> : null}
    </section>
  );
}
