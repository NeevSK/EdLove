'use client';

import React from 'react';
import type { ResearchMonograph } from '../_types/atlas.types';

export interface AtlasResearchTabProps {
  researchList: ResearchMonograph[];
}

export function AtlasResearchTab({ researchList }: AtlasResearchTabProps) {
  return (
    <div className="space-y-6">
      <div className="bg-[#fffefb] border border-[#e5dec9] p-6 sm:p-8 rounded-2xl shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="max-w-3xl">
            <span className="text-xs uppercase tracking-widest font-semibold text-[#a85022] bg-[#fbf0e8] px-2.5 py-0.5 rounded-full border border-[#f0d6c5]">
              EdLove Foundation (edlove.org) • Research &amp; Field Observation Group
            </span>
            <h2 className="text-2xl font-serif font-bold text-[#1a1714] mt-2">
              EdLove Education Research Archive ({researchList.length} Monographs)
            </h2>
            <p className="text-sm text-[#615951] mt-1.5 leading-relaxed">
              Research sits fundamentally on the{' '}
              <strong className="text-[#1a1714]">EdLove Foundation</strong> (
              <a
                href="https://edlove.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#a85022] hover:underline font-semibold"
              >
                edlove.org
              </a>
              ), the apex entity holding systemic education research, the Gurudevi digital
              sanctuary, and future charitable solidarity work. The Sri Lanka Education Atlas
              (&quot;Urumaya&quot;) is one contextual empirical manifestation of this research.
            </p>
          </div>

          <div className="shrink-0">
            <a
              href="https://edlove.org/research"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#1a1714] hover:bg-[#2c241e] text-white text-xs font-bold transition-all shadow-sm"
            >
              <span>Visit EdLove Research Hub</span>
              <span>↗</span>
            </a>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {researchList.map((r) => (
          <div
            key={r.resource_id}
            className="bg-[#fffefb] border border-[#e5dec9] p-6 rounded-2xl shadow-xs flex flex-col md:flex-row md:items-start justify-between gap-6"
          >
            <div className="max-w-4xl">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-mono font-semibold text-[#a85022] bg-[#fbf0e8] px-2 py-0.5 rounded-md">
                  {r.publication_date}
                </span>
                <span className="text-xs text-[#73685e] font-mono">{r.resource_id}</span>
                <span className="text-xs uppercase px-2 py-0.5 rounded-md bg-[#faf8f5] text-[#73685e] border border-[#ebdccb]">
                  {r.content_format}
                </span>
              </div>

              <h3 className="font-serif font-bold text-xl text-[#1a1714]">{r.title}</h3>

              <p className="text-sm text-[#615951] mt-2 leading-relaxed">{r.summary}</p>
            </div>

            <div className="shrink-0 flex flex-col gap-2">
              <a
                href="https://edlove.org/research"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#faf8f5] hover:bg-[#fffefb] border border-[#d6cbba] hover:border-[#a85022] text-xs font-semibold text-[#1a1714] transition-all"
              >
                <span>EdLove Hub</span>
                <span>↗</span>
              </a>
              {r.canonical_url && (
                <a
                  href={r.canonical_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-mono text-[#73685e] hover:text-[#a85022]"
                >
                  <span>Local Vault</span>
                  <span>↗</span>
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
