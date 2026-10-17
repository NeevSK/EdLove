'use client';

import {
  type DistrictSpatialSummary,
  GLOBAL_COMPARATIVE_SYSTEMS,
  type GlobalCountrySpatialSummary,
  SRI_LANKA_DISTRICTS,
  SRI_LANKA_PROVINCES,
} from '@repo/core/spatial';
import Link from 'next/link';
import React from 'react';

export interface AtlasSpatialTabProps {
  spatialScaleLens: 'global' | 'national' | 'zonal';
  setSpatialScaleLens: (lens: 'global' | 'national' | 'zonal') => void;
  selectedSpatialDistrict: string;
  setSelectedSpatialDistrict: (d: string) => void;
  spatialMetricView: 'delta' | 'cari' | 'meal' | 'tuition';
  setSpatialMetricView: (v: 'delta' | 'cari' | 'meal' | 'tuition') => void;
  spatialSchools: SchoolItem[];
  spatialLoading: boolean;
}

export function AtlasSpatialTab({
  spatialScaleLens,
  setSpatialScaleLens,
  selectedSpatialDistrict,
  setSelectedSpatialDistrict,
  spatialMetricView,
  setSpatialMetricView,
  spatialSchools,
  spatialLoading,
}: AtlasSpatialTabProps) {
  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-[#fffefb] border border-[#e5dec9] p-6 sm:p-8 rounded-2xl shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="max-w-4xl">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-xs uppercase tracking-widest font-semibold text-[#a85022] bg-[#fbf0e8] px-2.5 py-0.5 rounded-full border border-[#f0d6c5]">
                Multi-Scale Spatial Cartography
              </span>
              <span className="text-xs text-[#824112] font-mono bg-[#f5eee1] px-2 py-0.5 rounded border border-[#e8dbca]">
                Holonic Geography
              </span>
              <span className="text-xs text-[#246342] font-mono bg-[#ebf5ef] px-2 py-0.5 rounded border border-[#c3e3cf]">
                9,960 Coordinate Substrate
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1a1714]">
              Spatial Cartography: Global Paradigms &amp; National Ground Truth
            </h2>
            <p className="text-sm text-[#615951] mt-2 leading-relaxed">
              Navigating education across nested spatial scales: from comparative planetary systems
              (EdLove Foundation) down to Sri Lanka&apos;s 25 administrative districts, 100 zonal
              distribution hubs, and 9,960 physical classroom gates.
            </p>
          </div>

          {/* Scale Lens Switcher */}
          <div className="shrink-0 flex flex-col gap-2">
            <span className="text-[10px] uppercase font-bold text-[#73685e] tracking-wider">
              Holonic Scale Lens
            </span>
            <div className="flex flex-wrap gap-1.5 bg-[#f5eee1] p-1.5 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setSpatialScaleLens('global')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  spatialScaleLens === 'global'
                    ? 'bg-[#1a1714] text-white shadow-xs'
                    : 'text-[#615951] hover:text-[#1a1714]'
                }`}
              >
                🌍 Global (Scale 0)
              </button>
              <button
                type="button"
                onClick={() => setSpatialScaleLens('national')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  spatialScaleLens === 'national'
                    ? 'bg-[#1a1714] text-white shadow-xs'
                    : 'text-[#615951] hover:text-[#1a1714]'
                }`}
              >
                🇱🇰 National (Scale 1)
              </button>
              <button
                type="button"
                onClick={() => setSpatialScaleLens('zonal')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  spatialScaleLens === 'zonal'
                    ? 'bg-[#1a1714] text-white shadow-xs'
                    : 'text-[#615951] hover:text-[#1a1714]'
                }`}
              >
                📍 Zonal &amp; Local (Scale 2–3)
              </button>
            </div>
          </div>
        </div>

        {/* Metric Filter Bar for National & Zonal views */}
        {spatialScaleLens !== 'global' && (
          <div className="mt-6 pt-6 border-t border-[#f0e7d8] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-xs font-bold text-[#73685e]">Spatial Metric Gradient:</span>
            <div className="flex flex-wrap gap-2 text-xs font-medium">
              <button
                type="button"
                onClick={() => setSpatialMetricView('delta')}
                className={`px-3 py-1 rounded-lg border transition-all ${
                  spatialMetricView === 'delta'
                    ? 'bg-[#c93018] text-white border-[#c93018] font-bold'
                    : 'bg-[#faf8f5] text-[#615951] border-[#ebdccb] hover:text-[#1a1714]'
                }`}
              >
                ⚠️ Ratio Theater Delta (Δ)
              </button>
              <button
                type="button"
                onClick={() => setSpatialMetricView('cari')}
                className={`px-3 py-1 rounded-lg border transition-all ${
                  spatialMetricView === 'cari'
                    ? 'bg-[#246342] text-white border-[#246342] font-bold'
                    : 'bg-[#faf8f5] text-[#615951] border-[#ebdccb] hover:text-[#1a1714]'
                }`}
              >
                💡 Grounded C-ARI Score
              </button>
              <button
                type="button"
                onClick={() => setSpatialMetricView('meal')}
                className={`px-3 py-1 rounded-lg border transition-all ${
                  spatialMetricView === 'meal'
                    ? 'bg-[#824112] text-white border-[#824112] font-bold'
                    : 'bg-[#faf8f5] text-[#615951] border-[#ebdccb] hover:text-[#1a1714]'
                }`}
              >
                🍲 Free Midday Meal Floor
              </button>
              <button
                type="button"
                onClick={() => setSpatialMetricView('tuition')}
                className={`px-3 py-1 rounded-lg border transition-all ${
                  spatialMetricView === 'tuition'
                    ? 'bg-[#a85022] text-white border-[#a85022] font-bold'
                    : 'bg-[#faf8f5] text-[#615951] border-[#ebdccb] hover:text-[#1a1714]'
                }`}
              >
                💰 Shadow Tuition Burden
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ================= SCALE 0: GLOBAL COMPARATIVE ATLAS ================= */}
      {spatialScaleLens === 'global' && (
        <div className="space-y-6">
          <div className="bg-[#fffefb] border border-[#e5dec9] p-6 sm:p-8 rounded-2xl shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs uppercase tracking-widest font-semibold text-[#a85022] bg-[#fbf0e8] px-2.5 py-0.5 rounded-full border border-[#f0d6c5]">
                  Scale 0 • Planetary Atlas (EdLove Foundation)
                </span>
                <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#1a1714] mt-2">
                  Comparative Planetary Educational Systems
                </h3>
                <p className="text-xs sm:text-sm text-[#615951] mt-1">
                  Auditing public educational investment, shadow education penetration, and
                  foundational paradigms across 10 global systems:
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {GLOBAL_COMPARATIVE_SYSTEMS.map((c) => (
                <div
                  key={c.isoCode}
                  className={`p-5 rounded-xl border transition-all ${
                    c.isoCode === 'LKA'
                      ? 'bg-[#fbf7f0] border-2 border-[#a85022] shadow-xs'
                      : 'bg-[#faf8f5] border-[#ebdccb]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-[#a85022]">{c.isoCode}</span>
                    <span className="text-[10px] bg-white text-[#73685e] px-2 py-0.5 rounded border border-[#e5dec9] font-semibold">
                      {c.region}
                    </span>
                  </div>
                  <h4 className="text-base font-serif font-bold text-[#1a1714] mt-1">{c.name}</h4>

                  <div className="mt-3 pt-3 border-t border-[#e8dbca] space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-[#73685e]">Public Spend (% GDP):</span>
                      <strong
                        className={
                          c.publicEducationSpendPctGdp < 2.5 ? 'text-[#c93018]' : 'text-[#246342]'
                        }
                      >
                        {c.publicEducationSpendPctGdp}%
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#73685e]">Shadow Tuition Penetration:</span>
                      <strong
                        className={
                          c.shadowEducationPrevalencePct > 60 ? 'text-[#c93018]' : 'text-[#246342]'
                        }
                      >
                        {c.shadowEducationPrevalencePct}%
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#73685e]">Primary Nominal STR:</span>
                      <strong className="text-[#1a1714]">1:{c.primarySchoolStr}</strong>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-[#e8dbca] text-[11px] text-[#615951] leading-relaxed">
                    <strong className="text-[#1a1714] block">Epistemic Paradigm:</strong>
                    {c.epistemicParadigm}
                  </div>

                  <div className="mt-2 text-[10px] text-[#73685e]">
                    <span className="font-bold text-[#1a1714]">Key Architectures: </span>
                    {c.notablePlatforms.join(' • ')}
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-[#f0e7d8] p-4 rounded-xl text-xs sm:text-sm text-[#403933] leading-relaxed mt-4">
              <strong className="text-[#1a1714]">Planetary Diagnostic:</strong> Sri Lanka is unique
              globally. With state educational expenditure at just{' '}
              <strong className="text-[#c93018]">1.8% of GDP</strong> (comparable to Pakistan at
              1.7%), it sustains East Asian-level shadow tuition dependency (
              <strong className="text-[#c93018]">82.4%</strong>, comparable to South Korea at
              78.3%). Families privately bridge the state fiscal deficit, creating intense
              positional burnout.
            </div>
          </div>
        </div>
      )}

      {/* ================= SCALE 1: NATIONAL SOVEREIGN ATLAS (SRI LANKA 25 DISTRICTS) ================= */}
      {spatialScaleLens === 'national' && (
        <div className="space-y-6">
          <div className="bg-[#fffefb] border border-[#e5dec9] p-6 sm:p-8 rounded-2xl shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs uppercase tracking-widest font-semibold text-[#a85022] bg-[#fbf0e8] px-2.5 py-0.5 rounded-full border border-[#f0d6c5]">
                  Scale 1 • National Sovereign Atlas (Sri Lanka)
                </span>
                <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#1a1714] mt-2">
                  25-District Spatial Choropleth Matrix
                </h3>
                <p className="text-xs sm:text-sm text-[#615951] mt-1">
                  Click any district to view its grounded educational scorecard, then drill down
                  into zonal clusters and school gates:
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="text-[#73685e]">Selected:</span>
                <strong className="text-[#a85022]">
                  {SRI_LANKA_DISTRICTS.find((d) => d.code === selectedSpatialDistrict)?.name ||
                    'Colombo'}
                </strong>
              </div>
            </div>

            {/* 25-District Vector Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {SRI_LANKA_DISTRICTS.map((d) => {
                const isSelected = selectedSpatialDistrict === d.code;
                let metricValueText = '';
                let badgeColor = 'text-[#1a1714]';

                if (spatialMetricView === 'delta') {
                  metricValueText = `Δ +${d.avgRatioTheaterDelta.toFixed(1)}`;
                  badgeColor =
                    d.avgRatioTheaterDelta > 20
                      ? 'text-[#c93018] font-bold'
                      : d.avgRatioTheaterDelta < 5
                        ? 'text-[#246342]'
                        : 'text-[#824112]';
                } else if (spatialMetricView === 'cari') {
                  metricValueText = `C-ARI ${d.avgCariScore.toFixed(1)}`;
                  badgeColor = d.avgCariScore > 75 ? 'text-[#246342] font-bold' : 'text-[#a85022]';
                } else if (spatialMetricView === 'meal') {
                  metricValueText = `${d.middayMealCoveragePct}% Meal`;
                  badgeColor =
                    d.middayMealCoveragePct > 70 ? 'text-[#246342] font-bold' : 'text-[#73685e]';
                } else if (spatialMetricView === 'tuition') {
                  metricValueText = `Rs. ${(d.shadowTuitionMonthlyPerChildLkr / 1000).toFixed(0)}k/mo`;
                  badgeColor =
                    d.shadowTuitionMonthlyPerChildLkr > 20000
                      ? 'text-[#c93018] font-bold'
                      : 'text-[#246342]';
                }

                return (
                  <button
                    type="button"
                    key={d.id}
                    onClick={() => setSelectedSpatialDistrict(d.code)}
                    className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-[#1a1714] text-white border-[#1a1714] shadow-sm scale-[1.02]'
                        : 'bg-[#faf8f5] hover:bg-[#f5eee1] border-[#ebdccb] text-[#1a1714]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between text-[10px] font-mono opacity-80">
                        <span>{d.code}</span>
                        <span>{d.provinceName.substring(0, 4)}</span>
                      </div>
                      <span className="font-serif font-bold text-sm block mt-1 truncate">
                        {d.name}
                      </span>
                    </div>
                    <div className="mt-3 pt-2 border-t border-current/20 flex items-center justify-between text-[11px]">
                      <span className="opacity-70">{d.totalSchools} sch</span>
                      <span className={isSelected ? 'text-[#f5eee1] font-bold' : badgeColor}>
                        {metricValueText}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Active District Focus Dossier Card */}
            {(() => {
              const activeDistrict =
                SRI_LANKA_DISTRICTS.find((d) => d.code === selectedSpatialDistrict) ||
                SRI_LANKA_DISTRICTS[0];
              if (!activeDistrict) return null;

              return (
                <div className="bg-[#faf8f5] border-2 border-[#a85022] p-6 rounded-2xl space-y-5 shadow-xs">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-[#ebdccb] pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-[#a85022]">
                          {activeDistrict.id} ({activeDistrict.code})
                        </span>
                        <span className="text-xs bg-[#ebdccb] text-[#1a1714] px-2 py-0.5 rounded font-semibold">
                          {activeDistrict.provinceName} Province
                        </span>
                      </div>
                      <h4 className="text-2xl font-serif font-bold text-[#1a1714] mt-1">
                        {activeDistrict.name} ({activeDistrict.nameSi})
                      </h4>
                      <p className="text-xs text-[#73685e] mt-0.5">
                        Centroid: {activeDistrict.centroid.lat.toFixed(4)}° N,{' '}
                        {activeDistrict.centroid.lng.toFixed(4)}° E • Total Enrollment:{' '}
                        {activeDistrict.totalStudents.toLocaleString()} students across{' '}
                        {activeDistrict.totalSchools} schools
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSpatialScaleLens('zonal')}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#a85022] hover:bg-[#8f3e15] text-white text-xs font-bold transition-all shadow-xs shrink-0"
                    >
                      <span>Drill Down to Zonal &amp; School Pins</span>
                      <span>→</span>
                    </button>
                  </div>

                  {/* Comparative Diagnostic Metrics */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-[#ebdccb]">
                      <span className="text-[10px] uppercase font-bold text-[#73685e] tracking-wider block">
                        Ratio Theater Delta (Δ)
                      </span>
                      <div className="text-2xl font-mono font-bold text-[#c93018] mt-1">
                        +{activeDistrict.avgRatioTheaterDelta.toFixed(1)}
                      </div>
                      <span className="text-[11px] text-[#73685e] block mt-0.5">
                        Nominal 1:{activeDistrict.avgOfficialStr.toFixed(1)} vs{' '}
                        {activeDistrict.avgRoomDensity.toFixed(0)}:1 Room
                      </span>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-[#ebdccb]">
                      <span className="text-[10px] uppercase font-bold text-[#73685e] tracking-wider block">
                        Grounded C-ARI Score
                      </span>
                      <div className="text-2xl font-serif font-bold text-[#246342] mt-1">
                        {activeDistrict.avgCariScore.toFixed(1)} / 100
                      </div>
                      <span className="text-[11px] text-[#73685e] block mt-0.5">
                        Relational attunement index
                      </span>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-[#ebdccb]">
                      <span className="text-[10px] uppercase font-bold text-[#73685e] tracking-wider block">
                        Est. Shadow Tuition
                      </span>
                      <div className="text-2xl font-mono font-bold text-[#a85022] mt-1">
                        Rs. {activeDistrict.shadowTuitionMonthlyPerChildLkr.toLocaleString()}
                      </div>
                      <span className="text-[11px] text-[#73685e] block mt-0.5">
                        Per child out-of-pocket / mo
                      </span>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-[#ebdccb]">
                      <span className="text-[10px] uppercase font-bold text-[#73685e] tracking-wider block">
                        Midday Meal Coverage
                      </span>
                      <div className="text-2xl font-serif font-bold text-[#1a1714] mt-1">
                        {activeDistrict.middayMealCoveragePct.toFixed(0)}%
                      </div>
                      <span className="text-[11px] text-[#73685e] block mt-0.5">
                        Primary caloric safety net
                      </span>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* ================= SCALE 2 & 3: ZONAL & LOCAL SCHOOL PINS ================= */}
      {spatialScaleLens === 'zonal' && (
        <div className="space-y-6">
          <div className="bg-[#fffefb] border border-[#e5dec9] p-6 sm:p-8 rounded-2xl shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs uppercase tracking-widest font-semibold text-[#a85022] bg-[#fbf0e8] px-2.5 py-0.5 rounded-full border border-[#f0d6c5]">
                  Scale 2 &amp; 3 • Zonal Logistics &amp; School Gate Coordinates
                </span>
                <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#1a1714] mt-2">
                  School Gate GPS &amp; Coordinate Precision Substrate
                </h3>
                <p className="text-xs sm:text-sm text-[#615951] mt-1">
                  Viewing schools in{' '}
                  <strong className="text-[#1a1714]">
                    {SRI_LANKA_DISTRICTS.find((d) => d.code === selectedSpatialDistrict)?.name}{' '}
                    District
                  </strong>
                  . Every pin displays physical GPS coordinates and ground-truth verification
                  status:
                </p>
              </div>

              {/* District Selector Switcher */}
              <div className="flex items-center gap-2">
                <label
                  htmlFor="spatial-district-selector"
                  className="text-xs font-semibold text-[#73685e]"
                >
                  District:
                </label>
                <select
                  id="spatial-district-selector"
                  value={selectedSpatialDistrict}
                  onChange={(e) => setSelectedSpatialDistrict(e.target.value)}
                  className="bg-[#faf8f5] border border-[#ebdccb] px-3 py-1.5 rounded-xl text-xs font-semibold text-[#1a1714]"
                >
                  {SRI_LANKA_DISTRICTS.map((d) => (
                    <option key={d.code} value={d.code}>
                      {d.name} ({d.totalSchools} schools)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Citizen-Sensor Ground-Truth Gate Ping Protocol Callout */}
            <div className="bg-[#fbf7f0] border border-[#e8dbca] p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <strong className="text-[#1a1714] block">
                  Sovereign Coordinate Precision Hierarchy:
                </strong>
                <span className="text-[#615951]">
                  <span className="text-[#246342] font-bold">✅ Surveyed Gate GPS:</span> Hardware
                  sensor verified at physical school entrance. •{' '}
                  <span className="text-[#c93018] font-bold">⚠️ Tentative Village Centroid:</span>{' '}
                  Unverified census postal coordinate.
                </span>
              </div>
              <span className="text-[11px] font-mono text-[#a85022] bg-white px-2.5 py-1 rounded border border-[#ebdccb] shrink-0">
                POST /api/atlas (verify-location)
              </span>
            </div>

            {/* School Pins Directory */}
            {spatialLoading ? (
              <div className="py-12 text-center text-[#73685e]">
                <div className="inline-block animate-spin w-6 h-6 border-2 border-[#a85022] border-t-transparent rounded-full mb-2"></div>
                <p className="text-xs font-mono">
                  Querying spatial coordinates for {selectedSpatialDistrict}...
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-[#73685e] px-1">
                  <span>Showing {spatialSchools.length} schools in this district</span>
                  <span className="font-mono">Substrate: atlas_staging.db (9,960 GPS records)</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {spatialSchools.map((s) => {
                    const isVerified = s.coord_precision === 'ground_truthed';

                    return (
                      <div
                        key={s.census_no}
                        className="bg-[#faf8f5] border border-[#ebdccb] p-4 rounded-xl flex flex-col justify-between space-y-3 hover:border-[#a85022] transition-colors"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-mono font-bold text-[#a85022]">
                              #{s.census_no}
                            </span>
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                                isVerified
                                  ? 'bg-[#ebf5ef] text-[#246342]'
                                  : 'bg-[#fbeeed] text-[#c93018]'
                              }`}
                            >
                              {isVerified ? '✅ Surveyed Gate' : '⚠️ Tentative Centroid'}
                            </span>
                          </div>

                          <h5 className="font-serif font-bold text-sm text-[#1a1714] mt-1.5 leading-snug">
                            {s.name}
                          </h5>
                          {s.name_si && (
                            <span className="text-xs text-[#73685e] block mt-0.5">{s.name_si}</span>
                          )}

                          <div className="mt-2 text-[11px] text-[#615951] space-y-0.5">
                            <div>
                              Category:{' '}
                              <strong className="text-[#1a1714]">
                                {s.category} ({s.type})
                              </strong>
                            </div>
                            <div>
                              Enrollment:{' '}
                              <strong className="text-[#1a1714]">
                                {(s.total_students || 350).toLocaleString()} students
                              </strong>
                            </div>
                            <div className="font-mono text-[10px] text-[#73685e]">
                              GPS: {Number(s.latitude).toFixed(4)}° N,{' '}
                              {Number(s.longitude).toFixed(4)}° E
                            </div>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-[#ebdccb] flex items-center justify-between">
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${s.latitude},${s.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] text-[#73685e] hover:text-[#1a1714] flex items-center gap-1 font-mono"
                          >
                            <span>Pin</span>
                            <span>↗</span>
                          </a>

                          <Link
                            href={`/atlas/school/${s.census_no}`}
                            className="text-xs font-bold text-[#a85022] hover:underline flex items-center gap-1"
                          >
                            <span>View Dossier</span>
                            <span>→</span>
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
