import type { SwipeRowContract } from '../../../theme/contracts';
import { Button } from '../Button/Button';

export type SwipeRowProps = SwipeRowContract;

/**
 * The web form of a swipe row: pointers and keyboards do not swipe, so the
 * actions are buttons at the row's end, visible on hover and focus and always
 * reachable by Tab.
 */
export function SwipeRow({ children, start, end, label }: SwipeRowProps) {
  return (
    <div className="gd-swiperow" role="group" aria-label={label}>
      <div className="gd-swiperow-body">{children}</div>
      <div className="gd-swiperow-actions">
        {[start, end].map((action) =>
          action ? (
            <Button
              key={action.label}
              label={action.label}
              size="sm"
              variant={action.tone === 'danger' ? 'danger' : 'quiet'}
              onClick={action.onAction}
            />
          ) : null,
        )}
      </div>
    </div>
  );
}
