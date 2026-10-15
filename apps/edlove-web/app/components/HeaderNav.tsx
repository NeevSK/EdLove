'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ThemeToggle } from './ThemeToggle';

const navLinks = [
  { href: '/focus', label: 'Our Focus' },
  { href: '/cosmos', label: 'Cosmos' },
  { href: '/research', label: 'Research' },
  { href: '/innovations', label: 'Innovations (200)' },
  { href: '/pedagogy', label: 'Pedagogy' },
  { href: '/atlas', label: 'Urumaya Atlas' },
  { href: '/vision', label: 'Vision' },
];

export function HeaderNav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setMobileOpen(false);
  }

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [mobileOpen]);

  return (
    <div className="flex items-center gap-3 sm:gap-6">
      {/* Desktop Navigation */}
      <nav
        aria-label="EdLove Navigation"
        className="hidden lg:flex items-center gap-5 font-sans text-xs font-semibold tracking-wide"
      >
        {navLinks.map((link) => {
          const isActive =
            pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`transition-colors py-1 relative ${
                isActive
                  ? 'text-[#a85022] dark:text-[#f09b6e] font-bold'
                  : 'text-[#615951] dark:text-[#a39e95] hover:text-[#1a1714] dark:hover:text-[#f5f2eb]'
              }`}
            >
              {link.label}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#a85022] dark:bg-[#f09b6e] rounded-full" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Theme Switcher */}
      <ThemeToggle />

      {/* Mobile Menu Button */}
      <button
        type="button"
        aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
        aria-expanded={mobileOpen}
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden p-2 rounded-lg text-[#615951] dark:text-[#a39e95] hover:text-[#1a1714] dark:hover:text-white hover:bg-[#f0eade] dark:hover:bg-[#252830] transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[#a85022]"
      >
        <span className="sr-only">Toggle Menu</span>
        {mobileOpen ? (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        )}
      </button>

      {/* Mobile Slide-down Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 top-[65px] z-50 bg-[#faf7f2]/98 dark:bg-[#111215]/98 backdrop-blur-lg lg:hidden flex flex-col p-6 animate-fade-in border-t border-[#e5dec9] dark:border-[#292d36] overflow-y-auto">
          <div className="text-xs uppercase font-mono tracking-widest text-[#8e857b] dark:text-[#736d64] mb-4">
            Foundation Navigation
          </div>
          <nav className="flex flex-col gap-4 font-serif text-xl">
            {navLinks.map((link) => {
              const isActive =
                pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`py-2 px-3 rounded-xl transition-colors ${
                    isActive
                      ? 'bg-[#fbf0e8] dark:bg-[#2d1e16] text-[#a85022] dark:text-[#f09b6e] font-bold'
                      : 'text-[#1a1714] dark:text-[#f5f2eb] hover:bg-[#f5eee1] dark:hover:bg-[#21242b]'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-8 pt-6 border-t border-[#e5dec9] dark:border-[#292d36] flex items-center justify-between">
            <span className="text-xs font-sans text-[#615951] dark:text-[#a39e95]">Appearance</span>
            <ThemeToggle />
          </div>
        </div>
      )}
    </div>
  );
}
