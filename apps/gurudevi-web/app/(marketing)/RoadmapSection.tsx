import { ROADMAP_MILESTONES } from '../../lib/site';

export function RoadmapSection() {
  return (
    <section className="section section--roadmap" id="roadmap" aria-labelledby="roadmap-title">
      <div className="section__heading">
        <div>
          <p className="eyebrow">The Multi-Year Horizon</p>
          <h2 id="roadmap-title">From conceptual genesis to living sanctuary.</h2>
        </div>
        <p>
          Built for enduring transformation in Sri Lanka—progressing with care, dignity, and
          relationship across three distinct phases.
        </p>
      </div>

      <div className="roadmap-grid">
        {ROADMAP_MILESTONES.map((milestone) => (
          <article
            className={`roadmap-card ${milestone.status === 'active' ? 'roadmap-card--active' : ''}`}
            key={milestone.year}
          >
            <div className="roadmap-card__header">
              <span className="roadmap-card__year">{milestone.year}</span>
              <span className="roadmap-card__badge">{milestone.badge}</span>
            </div>

            <div className="roadmap-card__titles">
              <p className="roadmap-card__date">{milestone.date}</p>
              <h3 className="roadmap-card__phase">{milestone.phase}</h3>
            </div>

            <p className="roadmap-card__summary">{milestone.summary}</p>

            <div className="roadmap-card__deliverables">
              <ul>
                {milestone.deliverables.map((item) => (
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
        ))}
      </div>
    </section>
  );
}
