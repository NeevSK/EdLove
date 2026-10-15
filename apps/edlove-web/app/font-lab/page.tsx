import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Typography Comparison Lab | Gurudevi Platform',
  description:
    'Live typography comparison laboratory for small text, badges, and deep reading prose.',
};

const fontCategories = [
  {
    categoryTitle: 'Archetype I · Immersive Editorial & Literary Serifs',
    categoryDescription:
      'Warm bracketed serifs with horizontal feet that ground every word on the baseline. Designed for deep reading, contemplative scholarship, and epistemic permanence.',
    fonts: [
      {
        id: 'newsreader',
        name: 'Newsreader',
        tag: 'Editorial Benchmark · Continuous Reading Masterpiece',
        fontFamily: '"Newsreader", Georgia, serif',
        idealRole: 'Body Narratives, Philosophy, Essays, Educational Prose',
      },
      {
        id: 'lora',
        name: 'Lora',
        tag: 'Contemporary Calligraphic Serif · Sturdy Anchors',
        fontFamily: '"Lora", Georgia, serif',
        idealRole: 'Universal Body Copy, Grounded Paragraphs',
      },
      {
        id: 'spectral',
        name: 'Spectral',
        tag: 'Clean Screen Serif · High Information Density',
        fontFamily: '"Spectral", Georgia, serif',
        idealRole: 'UI Lists, Metadata Descriptions, Multi-Column Text',
      },
    ],
  },
  {
    categoryTitle: 'Archetype II · Classical & Venetian Heritage Serifs',
    categoryDescription:
      'Centuries of humanistic printing tradition, graceful stroke modulation, and timeless institutional weight.',
    fonts: [
      {
        id: 'fraunces',
        name: 'Fraunces (Optical Size 144)',
        tag: 'Heritage Soft-Serif · Warm Monumental Authority',
        fontFamily: '"Fraunces", Georgia, serif',
        idealRole: 'Hero Headlines, Milestone Phases, Sanctuary Titles',
      },
      {
        id: 'ebgaramond',
        name: 'EB Garamond',
        tag: 'Pure Renaissance Heritage · Dignified Scholarship',
        fontFamily: '"EB Garamond", Georgia, serif',
        idealRole: 'Sacred Inscriptions, Academic Grounding, Mantras',
      },
      {
        id: 'cormorant',
        name: 'Cormorant Garamond',
        tag: 'Noble & Regal · High Contrast Literary Presence',
        fontFamily: '"Cormorant Garamond", Georgia, serif',
        idealRole: 'Major Landmark Headings, Display Statements',
      },
      {
        id: 'cinzel',
        name: 'Cinzel',
        tag: 'Inscriptional Classical · Roman Capital Gravitas',
        fontFamily: '"Cinzel", Georgia, serif',
        idealRole: 'Milestone Years, Historical Badges, Epoch Pillars',
      },
    ],
  },
  {
    categoryTitle: 'Archetype III · Slab Serifs & Structural Blocks (Unflinching Physical Weight)',
    categoryDescription:
      'Heavy, blocky rectangular serifs. Absolute zero floating or wispy lines—maximum structural anchor and tactile heft.',
    fonts: [
      {
        id: 'bitter',
        name: 'Bitter',
        tag: 'Contemporary Slab Serif · Purpose-Built for Screens',
        fontFamily: '"Bitter", Georgia, serif',
        idealRole: 'Punchy Micro-Badges, Robust Body Text, Dense Deliverables',
      },
      {
        id: 'zillaslab',
        name: 'Zilla Slab',
        tag: 'Industrial & Academic Slab · Solid Square Feet',
        fontFamily: '"Zilla Slab", Georgia, serif',
        idealRole: 'Section Subheadings, Technical Summaries, Card Phase Titles',
      },
    ],
  },
  {
    categoryTitle: 'Archetype IV · Architectural Grotesque & Engineered Monospace',
    categoryDescription:
      'Square shoulders, flat stroke terminals, and structured geometry. Solid, intentional stroke weight without the hollow circular curves of generic floating sans.',
    fonts: [
      {
        id: 'outfit',
        name: 'Outfit',
        tag: 'Structured Display Grotesque · Solid Stroke Weight',
        fontFamily: '"Outfit", ui-sans-serif, system-ui, sans-serif',
        idealRole: 'Punchy Card Titles, Eyebrows, Clean Structural Badges',
      },
      {
        id: 'spacegrotesk',
        name: 'Space Grotesk',
        tag: 'Architectural Heavy Grotesque · Flat Terminals',
        fontFamily: '"Space Grotesk", monospace, sans-serif',
        idealRole: 'Roadmap Milestone Codes, Sovereign Tech Labels, Eyebrows',
      },
      {
        id: 'spacemono',
        name: 'Space Mono',
        tag: 'Editorial Monospace · Deliberate Structural Grid',
        fontFamily: '"Space Mono", monospace',
        idealRole: 'Countdown Timers, Version Telemetry, Cryptographic Status',
      },
      {
        id: 'jetbrains',
        name: 'JetBrains Mono',
        tag: 'Engineered Precision · High-Legibility Code & Badges',
        fontFamily: '"JetBrains Mono", monospace',
        idealRole: 'Status Dots, Metadata Tags, Specimen Markers',
      },
    ],
  },
];

export default function FontLabPage() {
  return (
    <div className="min-h-screen bg-[#faf8f5] text-[#1a1714]">
      <main className="max-w-6xl mx-auto px-6 py-12 space-y-16">
        <header className="space-y-4 max-w-3xl">
          <div className="inline-block px-3 py-1 bg-[#fbf0e8] border border-[#f0d6c5] rounded-full text-xs uppercase font-mono font-bold tracking-widest text-[#a85022]">
            Visual Substrate • Typography Specimen
          </div>
          <h1 className="text-4xl sm:text-5xl font-serif font-bold tracking-tight text-[#1a1714]">
            Compare Small Text &amp; UI Typography
          </h1>
          <p className="text-base sm:text-lg text-[#615951] leading-relaxed font-sans">
            Test how different font families, weights, eyebrows, badges, and body copy render live
            across varied screen resolutions and reading modes.
          </p>
        </header>

        <div className="space-y-16">
          {fontCategories.map((cat) => (
            <section key={cat.categoryTitle} className="space-y-6">
              <header className="border-b-2 border-[#1a1714]/15 pb-4">
                <h2 className="font-serif text-2xl font-bold text-[#1a1714]">
                  {cat.categoryTitle}
                </h2>
                <p className="text-sm text-[#615951] mt-1 font-sans">{cat.categoryDescription}</p>
              </header>

              <div className="grid grid-cols-1 gap-8">
                {cat.fonts.map((font) => (
                  <article
                    key={font.id}
                    className="p-8 rounded-2xl bg-[#fffefb] border border-[#ebdccb] shadow-sm space-y-6"
                    style={{ fontFamily: font.fontFamily }}
                  >
                    <header className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 border-b border-[#ebdccb]/60 pb-6">
                      <div>
                        <span className="text-xs uppercase font-mono font-bold tracking-wider text-[#a85022] bg-[#fbf0e8] px-3 py-1 rounded-full">
                          {font.tag}
                        </span>
                        <h3 className="text-3xl font-bold text-[#1a1714] mt-2">{font.name}</h3>
                        <span className="text-xs text-[#615951] block mt-1">
                          Recommended Role: <strong>{font.idealRole}</strong>
                        </span>
                      </div>
                      <code className="text-xs bg-[#f4ece1] px-3 py-1.5 rounded-md text-[#453c35] font-mono self-start">
                        font-family: {font.name}
                      </code>
                    </header>

                    {/* Eyebrow & Badges */}
                    <div className="space-y-3">
                      <h4 className="text-xs uppercase tracking-widest font-mono text-[#8e857b] font-bold">
                        01 · Eyebrows, Badges &amp; Small Metadata
                      </h4>
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="text-xs uppercase font-bold tracking-widest text-[#a85022]">
                          THE MULTI-YEAR HORIZON
                        </span>
                        <span className="text-xs font-semibold px-3 py-1 bg-[#ebe3d4] rounded-full text-[#131e27]">
                          Alpha Release · Oct 6, 2026
                        </span>
                        <span className="text-xs font-semibold px-3 py-1 bg-[#fbe6cb] text-[#824112] border border-[#a85022]/20 rounded-full">
                          Design Cycle Genesis
                        </span>
                        <span className="text-xs font-mono font-bold px-2.5 py-1 bg-[#1a1714] text-white rounded">
                          #ROADMAP · v1.0.0
                        </span>
                      </div>
                    </div>

                    {/* Body Copy */}
                    <div className="space-y-3">
                      <h4 className="text-xs uppercase tracking-widest font-mono text-[#8e857b] font-bold">
                        02 · Body Copy &amp; Contemplative Paragraph
                      </h4>
                      <p className="text-base text-[#2c2723] leading-relaxed max-w-3xl">
                        Grounded in rigorous field inquiry and foundational conceptual architecture,
                        the Alpha release brings primary design artifacts to life for initial
                        invited teacher cohorts and sanctuary classrooms across Sri Lanka.
                      </p>
                    </div>

                    {/* UI Checklist */}
                    <div className="space-y-3">
                      <h4 className="text-xs uppercase tracking-widest font-mono text-[#8e857b] font-bold">
                        03 · UI Checklist &amp; Interactive Controls
                      </h4>
                      <ul className="space-y-2 text-sm text-[#2b241e]">
                        <li className="flex items-baseline gap-2">
                          <span className="text-[#a85022]">✦</span>
                          <span>
                            <strong>Core Teacher Sanctuary:</strong> Local-first offline resilience
                            &amp; private cryptographic storage.
                          </span>
                        </li>
                        <li className="flex items-baseline gap-2">
                          <span className="text-[#a85022]">✦</span>
                          <span>
                            <strong>Visibility Without Surveillance:</strong> School leadership view
                            with strict privacy boundaries.
                          </span>
                        </li>
                      </ul>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
