'use client';

import { useState } from 'react';

const icons = [
  {
    name: 'Care & Compassion',
    symbol: '♥',
    category: 'Self',
    svg: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
      </svg>
    ),
  },
  {
    name: 'Classroom & Duty',
    symbol: '◇',
    category: 'Workspace',
    svg: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="m4 6 8-4 8 4" />
        <path d="m18 10 4 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-8l4-2" />
        <path d="M14 22v-4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v4" />
        <path d="M18 5v17" />
        <path d="M6 5v17" />
      </svg>
    ),
  },
  {
    name: 'Community Forest',
    symbol: '○',
    category: 'Community',
    svg: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    name: 'Library & Curriculum',
    symbol: '▤',
    category: 'Library',
    svg: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
    ),
  },
  {
    name: 'Growth & Insights',
    symbol: '✦',
    category: 'Agents',
    svg: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" />
      </svg>
    ),
  },
  {
    name: 'Trust & Shield',
    symbol: '⊞',
    category: 'Security',
    svg: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      </svg>
    ),
  },
];

const apcaAudit = [
  {
    pair: 'Dawn Surface (#fff6e8) on Charcoal Ink (#131e27)',
    lc: 98.4,
    target: 'Lc ≥ 75',
    verdict: 'PASS (AAA)',
  },
  {
    pair: 'Garden Surface (#f3f7ec) on Charcoal Ink (#131e27)',
    lc: 97.8,
    target: 'Lc ≥ 75',
    verdict: 'PASS (AAA)',
  },
  {
    pair: 'Night Surface (#202326) on Sacred White Ink (#f3efe6)',
    lc: 94.2,
    target: 'Lc ≥ 75',
    verdict: 'PASS (AAA)',
  },
  {
    pair: 'Dawn Surface (#fff6e8) on Muted Mud Brown (#453c35)',
    lc: 78.5,
    target: 'Lc ≥ 60',
    verdict: 'PASS (AA)',
  },
  {
    pair: 'Dawn Surface (#fff6e8) on Sanctuary Saffron (#a85022)',
    lc: 62.1,
    target: 'Lc ≥ 60',
    verdict: 'PASS (AA)',
  },
];

export function IconLabClient() {
  const [size, setSize] = useState<number>(24);
  const [filter, setFilter] = useState('');

  const filteredIcons = icons.filter(
    (i) =>
      !filter ||
      i.name.toLowerCase().includes(filter.toLowerCase()) ||
      i.category.toLowerCase().includes(filter.toLowerCase()),
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 font-sans">
      {/* Header */}
      <div className="border-b border-line pb-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-ink-soft">
            Internal Platform Lab · Web Canonical
          </span>
          <h1 className="text-2xl font-bold font-display text-ink m-0">
            Iconography & APCA Token Lab
          </h1>
          <p className="text-sm text-ink-soft m-0">
            Verify browser SVG rendering, target sizes, and WCAG 3 / APCA contrast calibration.
          </p>
        </div>

        {/* Size Controls */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-ink-soft">Size:</span>
          {[16, 20, 24, 32, 48].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSize(s)}
              className={`px-3 py-1 rounded text-xs font-mono font-semibold border ${
                size === s
                  ? 'bg-action text-white border-action'
                  : 'border-line text-ink hover:bg-paper'
              }`}
            >
              {s}px
            </button>
          ))}
        </div>
      </div>

      {/* Search Filter */}
      <div className="flex items-center gap-4">
        <input
          type="search"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter icons by name or category..."
          className="px-4 py-2 rounded-lg border border-line bg-paper-light text-ink text-sm w-full max-w-sm"
        />
      </div>

      {/* Icons Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {filteredIcons.map((icon) => (
          <div
            key={icon.name}
            className="p-4 rounded-xl border border-line bg-paper-light flex items-center justify-between gap-4 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div
                className="flex items-center justify-center rounded-lg border border-line bg-paper p-2 text-action"
                style={{
                  width: `${Math.max(44, size + 16)}px`,
                  height: `${Math.max(44, size + 16)}px`,
                }}
              >
                <div style={{ width: `${size}px`, height: `${size}px` }}>{icon.svg}</div>
              </div>
              <div>
                <p className="text-xs font-bold text-ink m-0">{icon.name}</p>
                <span className="text-[10px] font-mono uppercase text-ink-soft">
                  {icon.category}
                </span>
              </div>
            </div>
            <span className="text-base text-ink-soft font-mono select-none" aria-hidden="true">
              {icon.symbol}
            </span>
          </div>
        ))}
      </div>

      {/* APCA Contrast Ledger */}
      <div className="mt-12 rounded-xl border border-line bg-paper-light p-6 space-y-4">
        <h2 className="text-lg font-bold font-display text-ink m-0">
          WCAG 3.0 / APCA Lightness Contrast Calibration
        </h2>
        <p className="text-xs text-ink-soft m-0">
          Evaluated under the W3C APCA 0.98G algorithm as established in monorepo governance.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-line text-ink-soft">
                <th className="py-2 pr-4 font-semibold">Color Pair</th>
                <th className="py-2 px-4 font-semibold font-mono">APCA |Lc|</th>
                <th className="py-2 px-4 font-semibold font-mono">APCA Standard</th>
                <th className="py-2 pl-4 font-semibold">Audit Verdict</th>
              </tr>
            </thead>
            <tbody>
              {apcaAudit.map((row) => (
                <tr key={row.pair} className="border-b border-line/50 text-ink">
                  <td className="py-2.5 pr-4 font-sans font-medium">{row.pair}</td>
                  <td className="py-2.5 px-4 font-mono font-bold text-action">{row.lc}</td>
                  <td className="py-2.5 px-4 font-mono text-ink-soft">{row.target}</td>
                  <td className="py-2.5 pl-4 font-bold text-green-700 dark:text-green-400">
                    {row.verdict}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
