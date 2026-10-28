'use client';

import Image from 'next/image';
import Link from 'next/link';
import { resolveSurfaceUrl } from '../../lib/surface-urls';
import { LAUNCH } from '../../lib/site';
import { RoadmapSection } from './RoadmapSection';
import { useTranslation } from '../../lib/i18n';

export function MarketingClient() {
  const { t } = useTranslation();

  const workspaces = [
    {
      number: t('workspaces.w1.number') || '01',
      roleLabel: t('workspaces.w1.roleLabel') || 'Teachers & Students',
      name: t('workspaces.w1.name') || 'Classroom Sanctuary',
      body:
        t('workspaces.w1.body') ||
        'Lesson preparation, reflection, and teaching—grounded in pedagogical care.',
    },
    {
      number: t('workspaces.w2.number') || '02',
      roleLabel: t('workspaces.w2.roleLabel') || 'School Leaders',
      name: t('workspaces.w2.name') || 'School Coordination',
      body:
        t('workspaces.w2.body') ||
        'Institutional patterns and resource stewardship without surveillance.',
    },
    {
      number: t('workspaces.w3.number') || '03',
      roleLabel: t('workspaces.w3.roleLabel') || 'Families & Guardians',
      name: t('workspaces.w3.name') || 'Family Space',
      body:
        t('workspaces.w3.body') ||
        'A transparent bridge between school and home with mutual respect.',
    },
    {
      number: t('workspaces.w4.number') || '04',
      roleLabel: t('workspaces.w4.roleLabel') || 'Young Learners',
      name: t('workspaces.w4.name') || 'Learning Studio',
      body:
        t('workspaces.w4.body') ||
        'A quiet space for self-directed practice, learning commons, and agency.',
    },
  ];

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
          <p className="eyebrow hero-editorial__eyebrow">{t('hero.eyebrow')}</p>
          <h1>{t('hero.title')}</h1>
          <p className="hero-editorial__lede">{t('hero.lede')}</p>
          <div className="hero-editorial__actions">
            <a className="button button--primary" href="#roadmap">
              {t('hero.primaryCta')} <span aria-hidden="true">↘</span>
            </a>
            <a className="text-link" href="#workspaces">
              {t('hero.secondaryCta')} <span aria-hidden="true">↓</span>
            </a>
          </div>
        </div>
        <div className="hero-editorial__caption">
          <span>{t('hero.caption')}</span>
          <span aria-hidden="true">↓</span>
        </div>
      </section>

      {/* The Reality Intro */}
      <section className="section section--intro" id="ecology">
        <div className="section__label eyebrow">The Reality</div>
        <div className="intro-copy">
          <h2>Education is held together by people carrying too much alone.</h2>
          <p>
            {t('brand.name')} exists to make the relationships around learning easier to see,
            easier to support, and worthy of care—replacing administrative exhaustion with calm,
            sovereign spaces.
          </p>
        </div>
      </section>

      {/* The Living Ecology / Workspaces */}
      <section
        className="section section--workspaces"
        id="workspaces"
        aria-labelledby="workspaces-title"
      >
        <div className="section__heading">
          <div>
            <p className="eyebrow">The Living Ecology</p>
            <h2 id="workspaces-title">{t('workspaces.title')}</h2>
          </div>
          <p>{t('workspaces.subtitle')}</p>
        </div>
        <div className="workspace-list">
          {workspaces.map((workspace) => (
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
            {t('brand.name')} is engineered with local-first privacy: enough shared coordination
            to support an entire school, with absolute cryptographic privacy for educators and
            learners.
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
          <h2 id="launch-title">{t('brand.name')} Alpha is in active development.</h2>
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
            <a className="button button--dark" href={resolveSurfaceUrl('explore', '/self')}>
              {t('nav.openPlatform')} <span aria-hidden="true">↗</span>
            </a>
            <Link className="text-link" href="/support">
              {t('nav.support')}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
