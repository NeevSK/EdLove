import { useRouter } from '@tanstack/react-router';
import type { AnchorHTMLAttributes, MouseEvent, Ref } from 'react';

/**
 * `next/link` for the Vite build, so screens written for Next run unchanged. Leaves with the last
 * `next/link` import. An in-app path navigates through the router; anything else is a plain link.
 */
type Href = string | { pathname?: string; query?: Record<string, string>; hash?: string };

export interface LinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  href: Href;
  replace?: boolean;
  scroll?: boolean;
  prefetch?: boolean | null;
  ref?: Ref<HTMLAnchorElement>;
}

function toHref(href: Href): string {
  if (typeof href === 'string') return href;
  const query = href.query ? `?${new URLSearchParams(href.query).toString()}` : '';
  return `${href.pathname ?? ''}${query}${href.hash ? `#${href.hash}` : ''}`;
}

export default function Link({ href, replace, scroll: _scroll, prefetch: _prefetch, onClick, ...rest }: LinkProps) {
  const router = useRouter();
  const target = toHref(href);
  const internal = target.startsWith('/') && !target.startsWith('//');

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event);
    if (event.defaultPrevented || !internal) return;
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (rest.target && rest.target !== '_self') return;
    event.preventDefault();
    void router.navigate({ href: target, replace });
  }

  return <a {...rest} href={target} onClick={handleClick} />;
}
