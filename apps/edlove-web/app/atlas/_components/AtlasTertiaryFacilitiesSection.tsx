'use client';

import React from 'react';
import type { CampusFacility, UniversityLeader } from '../_types/atlas.types';

export interface AtlasTertiaryFacilitiesSectionProps {
  facilities: CampusFacility[];
  leadership: UniversityLeader[];
}

export function AtlasTertiaryFacilitiesSection({
  facilities,
  leadership,
}: AtlasTertiaryFacilitiesSectionProps) {
  return (
    <div className="space-y-6">
      {/* Leadership & Tenures (Vice Chancellors & Rectors) */}
      <div className="bg-[#fffefb] border border-[#e5dec9] p-6 rounded-2xl shadow-xs">
        <div className="border-b border-[#ebdccb] pb-4">
          <h3 className="text-lg font-serif font-bold text-[#1a1714]">
            Higher Education Governance: Living Roll of Honor
          </h3>
          <p className="text-xs text-[#615951] mt-0.5">
            Vice Chancellors, Rectors, and academic executive leadership across state universities
            and private institutions
          </p>
        </div>

        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          {leadership.map((l) => (
            <div
              key={l.occupancy_id}
              className="bg-[#faf8f5] border border-[#e5dec9] p-4 rounded-xl flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#d6ebd9] text-[#246342]">
                    {l.role_title_en}
                  </span>
                  <span className="text-[10px] font-mono text-[#a8a096]">Since {l.valid_from}</span>
                </div>

                <h4 className="font-bold text-sm text-[#1a1714] mt-2">
                  {l.honors_prefix} {l.canonical_name}
                </h4>
                {l.canonical_name_si && (
                  <div className="text-xs text-[#73685e] font-serif">{l.canonical_name_si}</div>
                )}

                <div className="text-xs font-semibold text-[#a85022] mt-1.5">🏛️ {l.entity_name}</div>

                {l.qualifications_json && (
                  <div className="mt-2 text-[11px] text-[#615951] font-mono">
                    {JSON.parse(l.qualifications_json).join(' • ')}
                  </div>
                )}

                {l.biographical_notes && (
                  <p className="mt-2 text-[11px] text-[#73685e] line-clamp-3 leading-relaxed">
                    {l.biographical_notes}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Campus Facilities & Advanced Infrastructure */}
      <div className="bg-[#fffefb] border border-[#e5dec9] p-6 rounded-2xl shadow-xs">
        <div className="border-b border-[#ebdccb] pb-4">
          <h3 className="text-lg font-serif font-bold text-[#1a1714]">
            Physical Campus Facilities & Advanced Infrastructure
          </h3>
          <p className="text-xs text-[#615951] mt-0.5">
            Research supercomputing laboratories, clinical teaching hospitals, university library
            systems, and sports complexes
          </p>
        </div>

        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          {facilities.map((fac) => {
            const features: string[] = fac.features_json ? JSON.parse(fac.features_json) : [];
            return (
              <div
                key={fac.facility_id}
                className="bg-[#faf8f5] border border-[#e5dec9] p-4 rounded-xl flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#e2eaf4] text-[#1a3e6a] uppercase">
                      {fac.facility_type.replace(/_/g, ' ')}
                    </span>
                    {fac.capacity_units && (
                      <span className="text-[10px] font-mono text-[#a85022] font-bold">
                        {fac.capacity_units.toLocaleString()} Units
                      </span>
                    )}
                  </div>

                  <h4 className="font-bold text-sm text-[#1a1714] mt-2 leading-snug">
                    {fac.name_en}
                  </h4>
                  {fac.name_si && (
                    <div className="text-xs text-[#73685e] font-serif">{fac.name_si}</div>
                  )}

                  <div className="text-xs font-semibold text-[#a85022] mt-1">
                    🏛️ {fac.institution_name_en}
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1">
                    {features.map((feat) => (
                      <span
                        key={feat}
                        className="text-[10px] bg-white border border-[#ebdccb] px-2 py-0.5 rounded-md text-[#423c35]"
                      >
                        ✓ {feat}
                      </span>
                    ))}
                  </div>

                  {fac.notes && (
                    <p className="mt-2.5 text-[11px] text-[#73685e] leading-relaxed">{fac.notes}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
