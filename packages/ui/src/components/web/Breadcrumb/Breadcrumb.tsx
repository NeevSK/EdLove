import type { BreadcrumbContract } from '../../../theme/contracts';
import { cx } from '../cx';

export interface BreadcrumbProps extends BreadcrumbContract {
  className?: string;
}

/**
 * Where this page sits ("Workspace / Grade 6A / Attendance"). A labelled nav
 * with an ordered list; the last item is the current page and is not a link.
 * Separators are drawn by the stylesheet and not read aloud.
 */
export function Breadcrumb({ items, label = 'Breadcrumb', className }: BreadcrumbProps) {
  return (
    <nav aria-label={label} className={cx('gd-breadcrumb', className)}>
      <ol>
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={`${i}-${item.label}`}>
              {item.href && !last ? (
                <a href={item.href}>{item.label}</a>
              ) : (
                <span aria-current={last ? 'page' : undefined}>{item.label}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
