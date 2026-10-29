import { useSyncExternalStore } from 'react';
import { getToasts, subscribeToasts, toast } from '../../shared/toasts';
import { Button } from '../Button/Button';

const none = () => [] as const;

/**
 * Where toasts appear, above the bottom edge. Place it once in the layout. The
 * two live regions are always in the page (so screen readers announce what is
 * added to them); polite for news, assertive for failures.
 */
export function ToastHost() {
  const items = useSyncExternalStore(subscribeToasts, getToasts, none);
  const polite = items.filter((i) => i.tone !== 'danger');
  const urgent = items.filter((i) => i.tone === 'danger');
  return (
    <div className="gd-toasts">
      {[
        { list: polite, role: 'status', live: 'polite' },
        { list: urgent, role: 'alert', live: 'assertive' },
      ].map(({ list, role, live }) => (
        <div key={role} role={role} aria-live={live as 'polite' | 'assertive'} className="gd-toast-region">
          {list.map((item) => (
            <div key={item.id} className="gd-toast" data-tone={item.tone}>
              <p className="gd-text" data-kind="body">
                {item.message}
              </p>
              {item.action ? (
                <Button
                  label={item.action.label}
                  variant="quiet"
                  size="sm"
                  onClick={() => toast.act(item.id)}
                />
              ) : null}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
