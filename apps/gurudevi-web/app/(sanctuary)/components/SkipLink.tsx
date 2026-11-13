import { Link } from '@tanstack/react-router';


export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded focus:bg-ink focus:px-4 focus:py-2 focus:text-paper focus:font-sans focus:font-semibold"
    >
      Skip to main content
    </a>
  );
}
