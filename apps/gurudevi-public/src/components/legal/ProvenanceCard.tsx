import type { ReactNode } from 'react';
import { translator } from '../../site';

export interface ProvenanceProps {
  documentId: string;
  version: string;
  lastUpdated: string;
  governingFramework: string;
  custodian: string;
  status: string;
  children?: ReactNode;
}

export function ProvenanceCard({
  documentId,
  version,
  lastUpdated,
  governingFramework,
  custodian,
  status,
  children,
}: Readonly<ProvenanceProps>) {
  // Legal documents are published in English; the folio labels follow them.
  const t = translator('en');

  return (
    <aside className="provenance-folio" aria-label="Editorial provenance and canonical authority">
      <div className="provenance-folio__top">
        <div className="provenance-folio__status-group">
          <span className="provenance-folio__dot" aria-hidden="true" />
          <span className="provenance-folio__status">{status}</span>
        </div>
        <span className="provenance-folio__id">{documentId}</span>
      </div>

      <div className="provenance-folio__body">
        <dl className="provenance-folio__meta">
          <div className="provenance-folio__row">
            <dt>{t('legal.provenance.version') || 'Version'}</dt>
            <dd>{version}</dd>
          </div>
          <div className="provenance-folio__row">
            <dt>{t('legal.provenance.effectiveDate') || 'Effective Date'}</dt>
            <dd>{lastUpdated}</dd>
          </div>
          <div className="provenance-folio__row">
            <dt>{t('legal.provenance.regulatoryBasis') || 'Regulatory Basis'}</dt>
            <dd>{governingFramework}</dd>
          </div>
          <div className="provenance-folio__row">
            <dt>{t('legal.provenance.stewardship') || 'Stewardship'}</dt>
            <dd>{custodian}</dd>
          </div>
        </dl>
      </div>

      {children ? (
        <div className="provenance-folio__preamble">
          <p>{children}</p>
        </div>
      ) : null}
    </aside>
  );
}
