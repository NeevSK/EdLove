'use client';

import { useTranslation } from '../../lib/i18n';
import { ROADMAP_MILESTONES } from '@repo/core/site';

export function RoadmapSection() {
  const { t } = useTranslation();

  return (
    <section className="section section--roadmap" id="roadmap" aria-labelledby="roadmap-title">
      <div className="section__heading">
        <div>
          <p className="eyebrow">{t('roadmap.eyebrow')}</p>
          <h2 id="roadmap-title">{t('roadmap.title')}</h2>
        </div>
        <p>{t('roadmap.subtitle')}</p>
      </div>

      <div className="roadmap-grid">
        {ROADMAP_MILESTONES.map((milestone) => {
          const yKey = `roadmap.y${milestone.year}`;
          const date = t(`${yKey}.date`) || milestone.date;
          const phase = t(`${yKey}.phase`) || milestone.phase;
          const badge = t(`${yKey}.badge`) || milestone.badge;
          const summary = t(`${yKey}.summary`) || milestone.summary;
          const deliverables = [
            t(`${yKey}.d1`) || milestone.deliverables[0],
            t(`${yKey}.d2`) || milestone.deliverables[1],
            t(`${yKey}.d3`) || milestone.deliverables[2],
          ].filter(Boolean);

          return (
            <article
              className={`roadmap-card ${milestone.status === 'active' ? 'roadmap-card--active' : ''}`}
              key={milestone.year}
            >
              <div className="roadmap-card__header">
                <span className="roadmap-card__year">{milestone.year}</span>
                <span className="roadmap-card__badge">{badge}</span>
              </div>

              <div className="roadmap-card__titles">
                <p className="roadmap-card__date">{date}</p>
                <h3 className="roadmap-card__phase">{phase}</h3>
              </div>

              <p className="roadmap-card__summary">{summary}</p>

              <div className="roadmap-card__deliverables">
                <ul>
                  {deliverables.map((item) => (
                    <li key={item}>
                      <span className="roadmap-card__check" aria-hidden="true">
                        ✦
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
