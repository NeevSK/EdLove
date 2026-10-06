import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { LAUNCH, MARKETING_COPY } from '../../lib/site';
import { RoadmapSection } from './RoadmapSection';

export const metadata: Metadata = {
  title: { absolute: 'Gurudevi | Education Ecology Support System and Sanctuary for Education' },
  description:
    'Gurudevi is an education ecology support system and sanctuary for education in Sri Lanka, connecting teachers, students, schools, families, and communities.',
  alternates: {
    canonical: 'https://gurudevi.app/',
    languages: {
      en: 'https://gurudevi.app/',
      si: 'https://gurudevi.app/si',
      ta: 'https://gurudevi.app/ta',
      'x-default': 'https://gurudevi.app/',
    },
  },
  openGraph: {
    title: 'Gurudevi | Education Ecology Support System and Sanctuary for Education',
    description:
      'An education ecology support system and sanctuary for education in Sri Lanka.',
    locale: 'en_LK',
    alternateLocale: ['si_LK', 'ta_LK'],
    type: 'website',
  },
};

export default function MarketingPage() {
  const copy = MARKETING_COPY.en;

  return (
    <main id="main-content">
      {/* Editorial Photographic Hero */}
      <section className="hero-editorial">
        <img
          className="hero-editorial__image"
          src="/hero-teacher-editorial.png"
          alt="A teacher prepares learning materials in a sunlit Sri Lankan classroom."
        />
        <div className="hero-editorial__wash" />
        <div className="hero-editorial__content">
          <p className="eyebrow hero-editorial__eyebrow">{copy.hero.eyebrow}</p>
          <h1>{copy.hero.title}</h1>
          <p className="hero-editorial__lede">{copy.hero.lede}</p>
          <div className="hero-editorial__actions">
            <a className="button button--primary" href="#roadmap">
              Follow the Multi-Year Horizon <span aria-hidden="true">↘</span>
            </a>
            <a className="text-link" href="#workspaces">
              Explore the 4 Workspaces <span aria-hidden="true">↓</span>
            </a>
          </div>
        </div>
        <div className="hero-editorial__caption">
          <span>Built around the people who make learning possible in Sri Lanka.</span>
          <span aria-hidden="true">↓</span>
        </div>
      </section>

      {/* The Reality Intro */}
      <section className="section section--intro" id="ecology">
        <div className="section__label eyebrow">The Reality</div>
        <div className="intro-copy">
          <h2>Education is held together by people carrying too much alone.</h2>
          <p>
            Gurudevi exists to make the relationships around learning easier to see, easier to support,
            and worthy of care—replacing administrative exhaustion with calm, sovereign spaces.
          </p>
        </div>
      </section>

      {/* The Living Ecology / Workspaces */}
      <section className="section section--workspaces" id="workspaces" aria-labelledby="workspaces-title">
        <div className="section__heading">
          <div>
            <p className="eyebrow">The Living Ecology</p>
            <h2 id="workspaces-title">Four spaces, one connected system.</h2>
          </div>
          <p>
            Each space gives teachers, students, leaders, and families a dignified home—without surveillance or role flattening.
          </p>
        </div>
        <div className="workspace-list">
          {copy.workspaces.map((workspace) => (
            <div className="workspace-row" key={workspace.number}>
              <span>{workspace.number}</span>
              <div className="workspace-row__title-wrap">
                <p className="eyebrow">{workspace.roleLabel}</p>
                <h3>{workspace.name}</h3>
              </div>
              <p>{workspace.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* The Promise / Trust */}
      <section className="section section--trust" id="trust" aria-labelledby="trust-title">
        <div className="trust-mark">
          <Image src="/gurudevi-mark.svg" alt="" width={44} height={44} />
        </div>
        <div>
          <p className="eyebrow">The Promise</p>
          <h2 id="trust-title">Support should never become surveillance.</h2>
          <p className="trust-copy">
            Gurudevi is engineered with local-first privacy: enough shared coordination to support an
            entire school, with absolute cryptographic privacy for educators and learners.
          </p>
          <Link className="text-link" href="/about">
            Read our epistemic foundation & research grounding <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </section>

      {/* Multi-Year Roadmap */}
      <RoadmapSection />

      {/* Launch / Active Stewardship Panel */}
      <section
        className="launch-panel"
        id="launch"
        aria-labelledby="launch-title"
        data-launch-status={LAUNCH.status}
      >
        <div>
          <p className="eyebrow">The first opening · Alpha Genesis</p>
          <h2 id="launch-title">Gurudevi Alpha is in active development.</h2>
          <p>
            We are preparing a public home for a more humane education ecology, moving at a
            sustainable cadence grounded in research care. Speak with us about bringing pilot
            cohorts to your school as spaces open.
          </p>
        </div>
        <div className="launch-panel__side">
          <div className="launch-clock" aria-live="polite">
            <span>Preparing the sanctuary…</span>
            <small>In active stewardship · Alpha Genesis</small>
          </div>
          <div className="launch-panel__actions">
            <Link className="button button--dark" href="/explore/self">
              Open the platform <span aria-hidden="true">↗</span>
            </Link>
            <Link className="text-link" href="/support">
              Talk to the team
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
