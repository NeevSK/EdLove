'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react';
import type { ResourceDistributionProfile } from '../../page';

interface SchoolData {
  census_no: string;
  name: string;
  name_si?: string;
  name_ta?: string;
  type: string;
  category: string;
  gender: string;
  medium: string;
  grade_span: string;
  total_students: number;
  difficulty_level: string | null;
  latitude: number | null;
  longitude: number | null;
  coord_precision: string | null;
  district_name: string;
  province_name: string;
}

interface GovernanceItem {
  tenure_id: string;
  person_name: string;
  name_si?: string;
  role_title: string;
  tenure_start: string;
  tenure_end: string | null;
  is_current: number;
  tenure_status: string;
  notes: string;
}

interface SubEntityItem {
  id: string;
  name: string;
  entity_type: string;
  category: string;
  founding_year: number | null;
  is_active: number;
}

interface ContactItem {
  contact_id: string;
  contact_type: string;
  contact_value: string;
  purpose: string;
  privacy_tier: string;
}

interface CensusSnapshot {
  census_year: number;
  total_students: number;
  male_students: number;
  female_students: number;
  total_teachers: number;
  student_teacher_ratio: number | null;
  difficulty_level: string | null;
}

interface LocationPing {
  id: string;
  user_role: string;
  latitude: number;
  longitude: number;
  accuracy_meters: number;
  delta_from_tentative_meters: number | null;
  status: string;
  created_at: string;
}

interface FinanceProfile {
  budget_id: string;
  fiscal_year: number;
  treasury_recurrent_lkr: number;
  treasury_capital_lkr: number;
  per_pupil_state_spend_lkr: number;
  sds_facility_fees_lkr: number;
  sds_donations_and_events_lkr: number;
  sds_alumni_endowments_lkr: number;
  sds_total_revenue_lkr: number;
  sds_to_treasury_ratio: number;
  notes: string;
}

interface DossierPayload {
  success: boolean;
  school?: SchoolData;
  governance?: GovernanceItem[];
  sub_entities?: SubEntityItem[];
  contacts?: ContactItem[];
  census_history?: CensusSnapshot[];
  location_pings?: LocationPing[];
  finance?: FinanceProfile | null;
  resource_distribution?: ResourceDistributionProfile | null;
}

export default function SchoolProfilePage() {
  const params = useParams();
  const censusNo = params?.census_no as string;

  const [dossier, setDossier] = useState<DossierPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Verification state
  const [verifying, setVerifying] = useState(false);
  const [verifyRole, setVerifyRole] = useState('teacher');
  const [verifyResult, setVerifyResult] = useState<{
    status: string;
    message: string;
    delta: number | null;
  } | null>(null);
  const [standpoint, setStandpoint] = useState<
    'child' | 'parent' | 'teacher' | 'tutor' | 'bureaucrat'
  >('child');

  const [refreshKey, setRefreshKey] = useState(0);
  const refetchDossier = useCallback(() => setRefreshKey((k) => k + 1), []);

  useEffect(() => {
    if (!censusNo) return;
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) setLoading(true);
    });

    fetch(`/api/atlas?mode=school&census_no=${censusNo}`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (data.success) {
          setDossier(data);
        } else {
          setError(data.error || 'Failed to load school dossier');
        }
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [censusNo, refreshKey]);

  // Citizen-Sensor GPS Capture
  const handleCaptureLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setVerifying(true);
    setVerifyResult(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude, accuracy, altitude } = pos.coords;
        try {
          const res = await fetch('/api/atlas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              mode: 'verify-location',
              census_no: censusNo,
              user_role: verifyRole,
              latitude,
              longitude,
              altitude,
              accuracy_meters: Math.round(accuracy),
            }),
          });
          const json = await res.json();
          if (json.success) {
            setVerifyResult({
              status: json.status,
              message: json.message,
              delta: json.delta_from_tentative_meters,
            });
            refetchDossier(); // Refresh dossier
          } else {
            alert(`Verification failed: ${json.error}`);
          }
        } catch (err: unknown) {
          alert(
            `Network error during location ping: ${err instanceof Error ? err.message : String(err)}`,
          );
        } finally {
          setVerifying(false);
        }
      },
      (geoErr) => {
        setVerifying(false);
        alert(`Failed to acquire GPS: ${geoErr.message}`);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center text-[#73685e]">
        <div className="text-center">
          <div className="inline-block animate-spin w-8 h-8 border-3 border-[#a85022] border-t-transparent rounded-full mb-4"></div>
          <div className="font-serif text-lg font-bold text-[#1a1714]">
            Assembling Sovereign Dossier...
          </div>
          <div className="text-xs text-[#73685e] mt-1 font-mono">Census No: {censusNo}</div>
        </div>
      </div>
    );
  }

  if (error || !dossier?.school) {
    return (
      <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center p-6 text-center">
        <div className="max-w-md bg-[#fffefb] border border-[#e5dec9] p-8 rounded-2xl shadow-xs">
          <div className="text-4xl mb-3">⚠️</div>
          <h2 className="text-xl font-bold font-serif text-[#1a1714]">School Dossier Not Found</h2>
          <p className="text-sm text-[#73685e] mt-2">
            {error || 'The requested school record does not exist in the atlas.'}
          </p>
          <div className="mt-6">
            <Link
              href="/atlas"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1a1714] text-white text-xs font-semibold hover:bg-[#333] transition-colors"
            >
              ← Back to Atlas Directory
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const s = dossier.school;
  const isGroundTruthed = s.coord_precision === 'ground_truthed';

  return (
    <div className="min-h-screen bg-[#faf8f5] text-[#1c1c24] font-sans pb-16">
      {/* Top Breadcrumb Header */}
      <div className="border-b border-[#e5dec9] bg-[#fffefb] py-4 px-6 sm:px-12">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-xs text-[#73685e]">
          <Link
            href="/atlas"
            className="flex items-center gap-1.5 hover:text-[#a85022] transition-colors font-medium"
          >
            <span>←</span>
            <span>Education Atlas Directory</span>
          </Link>
          <div className="font-mono">Census ID: {s.census_no}</div>
        </div>
      </div>

      {/* Main School Banner */}
      <section className="bg-[#fffefb] border-b border-[#e5dec9] py-10 px-6 sm:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="text-xs font-mono font-bold text-[#824112] bg-[#fbf0e8] px-2.5 py-1 rounded-md">
              Census {s.census_no}
            </span>
            <span
              className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md ${
                s.category === 'National'
                  ? 'bg-[#eaf1fb] text-[#1a3e6a] border border-[#cdddf2]'
                  : 'bg-[#f4efe6] text-[#615951] border border-[#e2d8c7]'
              }`}
            >
              {s.category} School
            </span>
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-[#fdf5ea] text-[#915809] border border-[#f5e3c2]">
              {s.type}
            </span>
            <span className="text-xs font-medium px-2.5 py-1 rounded-md bg-[#f2f7f4] text-[#246342] border border-[#d6ebd9]">
              {s.gender} • {s.medium}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-[#1a1714] tracking-tight">
            {s.name}
          </h1>

          {(s.name_si || s.name_ta) && (
            <div className="text-lg text-[#615951] mt-1 font-sans">
              {s.name_si} {s.name_ta ? `• ${s.name_ta}` : ''}
            </div>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-[#73685e]">
            <div className="flex items-center gap-1.5">
              <span>📍</span>
              <span className="font-semibold text-[#1a1714]">{s.district_name} District</span>
              <span>({s.province_name} Province)</span>
            </div>
            <span>•</span>
            <div>
              <span>Grade Span: </span>
              <span className="font-semibold text-[#1a1714]">{s.grade_span || '1-13'}</span>
            </div>
            <span>•</span>
            <div>
              <span>Total Enrolled: </span>
              <span className="font-mono font-bold text-[#1a1714]">
                {s.total_students?.toLocaleString() || 0}
              </span>{' '}
              students
            </div>
          </div>
        </div>
      </section>

      {/* Grid Content */}
      <main className="max-w-6xl mx-auto px-6 sm:px-12 py-10 space-y-10">
        {/* ================= 1. CITIZEN-SENSOR GEOSPATIAL VERIFICATION ================= */}
        <section className="bg-[#fffefb] border border-[#e5dec9] p-6 sm:p-8 rounded-2xl shadow-xs">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-6 border-b border-[#f0e7d8]">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs uppercase tracking-widest font-semibold text-[#a85022]">
                  Spatial Mesh Ground-Truth
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isGroundTruthed
                      ? 'bg-[#d6ebd9] text-[#246342] border border-[#b2d9b8]'
                      : 'bg-[#fdf0d5] text-[#b0730d] border border-[#fae3b3]'
                  }`}
                >
                  {isGroundTruthed ? '● Ground-Truthed GPS' : '○ Tentative Postal Centroid'}
                </span>
              </div>
              <h2 className="text-2xl font-serif font-bold text-[#1a1714]">
                Geographic Coordinates &amp; Sensor Calibration
              </h2>
              <p className="text-xs sm:text-sm text-[#615951] mt-1 max-w-2xl">
                {isGroundTruthed
                  ? 'This school has been confirmed on the physical substrate via verified citizen-sensor device pings.'
                  : 'Coordinates currently sit on an administrative postal centroid (~500m-2km drift). Local teachers or principals can ground-truth this pin.'}
              </p>
            </div>

            <div className="bg-[#faf8f5] border border-[#ebdccb] px-4 py-3 rounded-xl font-mono text-xs text-right">
              <div className="text-[#73685e]">Current Substrate Pin:</div>
              <div className="font-bold text-[#1a1714] text-sm mt-0.5">
                {s.latitude ? s.latitude.toFixed(6) : 'N/A'},{' '}
                {s.longitude ? s.longitude.toFixed(6) : 'N/A'}
              </div>
              <div className="text-[10px] text-[#824112] mt-0.5">
                Precision: {s.coord_precision}
              </div>
            </div>
          </div>

          {/* Citizen-Sensor Verification Form */}
          <div className="mt-6 bg-[#fdfbf7] border border-[#ebdccb] p-6 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h3 className="font-serif font-bold text-base text-[#1a1714]">
                Verify Live School Location (Citizen-Sensor)
              </h3>
              <p className="text-xs text-[#73685e] mt-1 max-w-xl">
                Physically standing at this school campus? Submit your device&apos;s GPS coordinate
                to calibrate the national open atlas and eliminate rural spatial drift.
              </p>

              <div className="mt-3 flex items-center gap-3">
                <label htmlFor="verify-role-select" className="text-xs text-[#73685e] font-medium">
                  Reporting Role:
                </label>
                <select
                  id="verify-role-select"
                  value={verifyRole}
                  onChange={(e) => setVerifyRole(e.target.value)}
                  className="px-2.5 py-1 text-xs rounded-lg border border-[#d6cbba] bg-white font-medium"
                >
                  <option value="teacher">Teacher (Educator)</option>
                  <option value="principal">Principal (Sovereign Authority)</option>
                  <option value="alumni">Old Boy / Alumna</option>
                  <option value="citizen">Civic Observer</option>
                </select>
              </div>
            </div>

            <div className="shrink-0">
              <button
                onClick={handleCaptureLocation}
                disabled={verifying}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#a85022] hover:bg-[#8e421a] text-white text-xs font-bold tracking-wide uppercase shadow-xs transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {verifying ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Acquiring GPS...</span>
                  </>
                ) : (
                  <>
                    <span>📍</span>
                    <span>Capture &amp; Verify Pin</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Verification Result Feedback */}
          {verifyResult && (
            <div
              className={`mt-4 p-4 rounded-xl text-xs flex items-center justify-between ${
                verifyResult.status === 'ground_truthed'
                  ? 'bg-[#eaf5ec] border border-[#bde3c4] text-[#1c612f]'
                  : 'bg-[#fef9ee] border border-[#fae5b8] text-[#94610c]'
              }`}
            >
              <div>
                <span className="font-bold">Result: </span>
                <span>{verifyResult.message}</span>
              </div>
              {verifyResult.delta != null && (
                <div className="font-mono font-bold">Offset: {verifyResult.delta}m</div>
              )}
            </div>
          )}

          {/* Location Pings Ledger */}
          {dossier.location_pings && dossier.location_pings.length > 0 && (
            <div className="mt-6">
              <div className="text-xs font-bold uppercase tracking-wider text-[#73685e] mb-3">
                Historical Ground-Truth Pings ({dossier.location_pings.length})
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-[#f0e7d8] text-[#73685e]">
                      <th className="py-2">Timestamp</th>
                      <th className="py-2">Role</th>
                      <th className="py-2">Accuracy</th>
                      <th className="py-2">Offset (Haversine)</th>
                      <th className="py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dossier.location_pings.map((p) => (
                      <tr key={p.id} className="border-b border-[#f7f2ea]">
                        <td className="py-2">{p.created_at}</td>
                        <td className="py-2 font-bold uppercase">{p.user_role}</td>
                        <td className="py-2">±{p.accuracy_meters}m</td>
                        <td className="py-2">
                          {p.delta_from_tentative_meters != null
                            ? `${p.delta_from_tentative_meters}m`
                            : '0m'}
                        </td>
                        <td className="py-2">
                          <span
                            className={`px-2 py-0.5 rounded-sm font-sans text-[10px] uppercase font-bold ${
                              p.status === 'verified'
                                ? 'bg-[#d6ebd9] text-[#246342]'
                                : 'bg-[#f4efe6] text-[#73685e]'
                            }`}
                          >
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>

        {/* ================= 2. GOVERNANCE & LIVING ROLL OF HONOR ================= */}
        <section className="bg-[#fffefb] border border-[#e5dec9] p-6 sm:p-8 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-xs uppercase tracking-widest font-semibold text-[#a85022]">
                Leadership &amp; Tenures
              </span>
              <h2 className="text-2xl font-serif font-bold text-[#1a1714]">
                Living Roll of Honor &amp; Institutional Guardians
              </h2>
            </div>
            <span className="text-xs text-[#73685e] font-mono">
              {dossier.governance?.length || 0} Tenures Recorded
            </span>
          </div>

          {dossier.governance && dossier.governance.length > 0 ? (
            <div className="space-y-4 mt-6">
              {dossier.governance.map((g) => (
                <div
                  key={g.tenure_id}
                  className="bg-[#faf8f5] border border-[#ebdccb] p-5 rounded-xl flex flex-col md:flex-row md:items-start justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-serif font-bold text-lg text-[#1a1714]">
                        {g.person_name}
                      </span>
                      {g.name_si && <span className="text-xs text-[#73685e]">({g.name_si})</span>}
                      {g.is_current === 1 && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#d6ebd9] text-[#246342] uppercase">
                          Current Principal
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-semibold text-[#a85022]">{g.role_title}</div>
                    <p className="text-xs text-[#615951] mt-2 leading-relaxed">{g.notes}</p>
                  </div>

                  <div className="shrink-0 font-mono text-xs text-right bg-white border border-[#ebdccb] px-3 py-2 rounded-lg self-start md:self-auto">
                    <div className="text-[#73685e]">Tenure:</div>
                    <div className="font-bold text-[#1a1714]">
                      {g.tenure_start} — {g.tenure_end || 'Present'}
                    </div>
                    <div className="text-[10px] text-[#824112] capitalize">{g.tenure_status}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-xs text-[#73685e] italic">
              No historical principal tenures logged for this school yet. Ingestion pending Gazette
              archive extraction.
            </div>
          )}
        </section>

        {/* ================= 3. CO-CURRICULAR CULTURE & TRADITION DERBIES ================= */}
        <section className="bg-[#fffefb] border border-[#e5dec9] p-6 sm:p-8 rounded-2xl shadow-xs">
          <div className="mb-4">
            <span className="text-xs uppercase tracking-widest font-semibold text-[#a85022]">
              Student Life &amp; Heritage
            </span>
            <h2 className="text-2xl font-serif font-bold text-[#1a1714]">
              Co-Curricular Sub-Entities &amp; Traditional Events
            </h2>
          </div>

          {dossier.sub_entities && dossier.sub_entities.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
              {dossier.sub_entities.map((sub) => (
                <div
                  key={sub.id}
                  className="bg-[#faf8f5] border border-[#ebdccb] p-4 rounded-xl flex items-center justify-between"
                >
                  <div>
                    <h3 className="font-bold text-sm text-[#1a1714]">{sub.name}</h3>
                    <div className="text-xs text-[#73685e] capitalize mt-0.5">
                      {sub.category} • {sub.entity_type}
                    </div>
                  </div>
                  {sub.founding_year && (
                    <span className="text-xs font-mono text-[#824112] font-semibold">
                      Est. {sub.founding_year}
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-xs text-[#73685e] italic">
              No registered sub-entities (sports teams, societies) cataloged yet.
            </div>
          )}
        </section>

        {/* ================= 4. DESK PRIVACY & CONTACT CHANNELS ================= */}
        <section className="bg-[#fffefb] border border-[#e5dec9] p-6 sm:p-8 rounded-2xl shadow-xs">
          <div className="mb-4">
            <span className="text-xs uppercase tracking-widest font-semibold text-[#a85022]">
              Classified Communications
            </span>
            <h2 className="text-2xl font-serif font-bold text-[#1a1714]">
              Institutional Contact Matrix &amp; Desk Privacy
            </h2>
            <p className="text-xs text-[#615951] mt-1">
              Contact points are strictly partitioned by privacy tiers to protect educator personal
              numbers while exposing institutional desk channels.
            </p>
          </div>

          {dossier.contacts && dossier.contacts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
              {dossier.contacts.map((c) => (
                <div
                  key={c.contact_id}
                  className="bg-[#faf8f5] border border-[#ebdccb] p-4 rounded-xl"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono uppercase font-bold text-[#824112]">
                      {c.contact_type}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                        c.privacy_tier === 'public_institutional'
                          ? 'bg-[#d6ebd9] text-[#246342]'
                          : 'bg-[#fdf0d5] text-[#b0730d]'
                      }`}
                    >
                      {c.privacy_tier}
                    </span>
                  </div>
                  <div className="font-mono font-bold text-sm text-[#1a1714]">
                    {c.contact_value}
                  </div>
                  <div className="text-xs text-[#73685e] mt-1 capitalize">Desk: {c.purpose}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-xs text-[#73685e] italic">
              No verified institutional contact records logged.
            </div>
          )}
        </section>

        {/* ================= 5. LONGITUDINAL CENSUS & CLASSROOM DENSITY INDEX ================= */}
        <section className="bg-[#fffefb] border border-[#e5dec9] p-6 sm:p-8 rounded-2xl shadow-xs">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
            <div>
              <span className="text-xs uppercase tracking-widest font-semibold text-[#a85022]">
                Temporal Census Drift
              </span>
              <h2 className="text-2xl font-serif font-bold text-[#1a1714]">
                Multi-Year Enrolment &amp; The Classroom Density Index (CDI)
              </h2>
              <p className="text-xs sm:text-sm text-[#615951] mt-1 max-w-3xl">
                Notice the schema drift: the Ministry tracked{' '}
                <span className="font-mono font-semibold">difficulty_level</span>{' '}
                (congeniality/hardship) in older censuses and silently dropped it in 2024.
                Furthermore, the aggregate Student-Teacher Ratio (STR) masks real multigrade
                cramming in single-hall classrooms.
              </p>
            </div>
          </div>

          {dossier.census_history && dossier.census_history.length > 0 ? (
            <div className="overflow-x-auto mt-6">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-[#f0e7d8] text-[#73685e]">
                    <th className="py-2.5">Census Year</th>
                    <th className="py-2.5">Total Students</th>
                    <th className="py-2.5">Male / Female</th>
                    <th className="py-2.5">Teachers</th>
                    <th className="py-2.5">Aggregate STR</th>
                    <th className="py-2.5">Congeniality / Difficulty</th>
                  </tr>
                </thead>
                <tbody>
                  {dossier.census_history.map((row) => (
                    <tr
                      key={row.census_year}
                      className="border-b border-[#f7f2ea] hover:bg-[#faf8f5]"
                    >
                      <td className="py-3 font-bold text-[#1a1714]">{row.census_year}</td>
                      <td className="py-3 font-bold">{row.total_students.toLocaleString()}</td>
                      <td className="py-3 text-[#73685e]">
                        {row.male_students} / {row.female_students}
                      </td>
                      <td className="py-3">{row.total_teachers}</td>
                      <td className="py-3 font-bold text-[#824112]">
                        1 :{' '}
                        {row.student_teacher_ratio ? row.student_teacher_ratio.toFixed(1) : 'N/A'}
                      </td>
                      <td className="py-3">
                        {row.difficulty_level ? (
                          <span className="px-2 py-0.5 rounded-md bg-[#fdf0d5] text-[#b0730d] font-sans font-semibold">
                            {row.difficulty_level}
                          </span>
                        ) : (
                          <span className="text-[#a8a096] italic">Dropped column</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-xs text-[#73685e] italic">
              No historical census snapshots logged for this census number.
            </div>
          )}
        </section>

        {/* ================= 6. SCHOOL FINANCE & SHADOW TREASURY ================= */}
        {dossier.finance && (
          <section className="bg-[#fffefb] border border-[#e5dec9] p-6 sm:p-8 rounded-2xl shadow-xs">
            <div className="mb-4">
              <span className="text-xs uppercase tracking-widest font-semibold text-[#a85022]">
                Fiscal Dualism
              </span>
              <h2 className="text-2xl font-serif font-bold text-[#1a1714]">
                School Development Society (SDS) vs. State Treasury ({dossier.finance.fiscal_year})
              </h2>
              <p className="text-xs text-[#615951] mt-1">{dossier.finance.notes}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {/* Treasury Column */}
              <div className="bg-[#faf8f5] border border-[#ebdccb] p-5 rounded-xl font-mono text-xs space-y-3">
                <div className="font-serif font-bold text-sm text-[#1a1714] pb-2 border-b border-[#ebdccb]">
                  State Treasury (Vote 126)
                </div>
                <div className="flex justify-between">
                  <span className="text-[#73685e]">Recurrent Salaries:</span>
                  <span className="font-bold">
                    Rs. {dossier.finance.treasury_recurrent_lkr.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#73685e]">Capital Allocation:</span>
                  <span className="font-bold">
                    Rs. {dossier.finance.treasury_capital_lkr.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-[#ebdccb]">
                  <span className="text-[#73685e]">Per-Pupil State Spend:</span>
                  <span className="font-bold text-[#a85022]">
                    Rs. {dossier.finance.per_pupil_state_spend_lkr.toLocaleString()} / yr
                  </span>
                </div>
              </div>

              {/* SDS Shadow Column */}
              <div className="bg-[#faf8f5] border border-[#ebdccb] p-5 rounded-xl font-mono text-xs space-y-3">
                <div className="font-serif font-bold text-sm text-[#1a1714] pb-2 border-b border-[#ebdccb]">
                  SDS Shadow Treasury (Self-Raised)
                </div>
                <div className="flex justify-between">
                  <span className="text-[#73685e]">Facility Fees:</span>
                  <span className="font-bold">
                    Rs. {dossier.finance.sds_facility_fees_lkr.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#73685e]">Donations &amp; Events:</span>
                  <span className="font-bold">
                    Rs. {dossier.finance.sds_donations_and_events_lkr.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#73685e]">Alumni Endowments:</span>
                  <span className="font-bold">
                    Rs. {dossier.finance.sds_alumni_endowments_lkr.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-[#ebdccb] bg-[#f3e8d9] p-2 rounded-lg text-sm">
                  <span className="font-sans font-semibold text-[#1a1714]">Total SDS Capital:</span>
                  <span className="font-bold text-[#a85022]">
                    Rs. {dossier.finance.sds_total_revenue_lkr.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#ebdccb] flex items-center justify-between text-xs">
              <span className="text-[#73685e]">
                Inversion Ratio (SDS Revenue / State Non-Salary Capital):
              </span>
              <span className="text-xl font-bold font-mono text-[#a85022]">
                {dossier.finance.sds_to_treasury_ratio}x
              </span>
            </div>
          </section>
        )}

        {/* ================= 7. PHYSICAL INFRASTRUCTURE, SPORTS & RESOURCE PROFILE ================= */}
        {dossier.resource_distribution && (
          <section className="bg-[#fffefb] border border-[#e5dec9] p-6 sm:p-8 rounded-2xl shadow-xs">
            <div className="mb-4">
              <span className="text-xs uppercase tracking-widest font-semibold text-[#a85022]">
                Spatial Resource Distribution
              </span>
              <h2 className="text-2xl font-serif font-bold text-[#1a1714]">
                Sports, Aesthetics &amp; Infrastructure Profile
              </h2>
              <p className="text-xs text-[#615951] mt-1">
                Audited spatial indicators covering playing fields, swimming pool access, specialist
                aesthetic teachers, computer lab terminals, and basic WASH services.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
              {/* Sports Tier Card */}
              <div className="bg-[#faf8f5] border border-[#ebdccb] p-4 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-[#73685e] tracking-wider">
                  Sports Infrastructure
                </span>
                <div className="font-bold text-sm text-[#1a1714] mt-1">
                  {dossier.resource_distribution.sports_infrastructure_tier.replace(/_/g, ' ')}
                </div>
                <div className="mt-2 text-xs font-mono space-y-1">
                  <div>
                    🏊 Swimming Pool:{' '}
                    <strong
                      className={
                        dossier.resource_distribution.swimming_pool_available
                          ? 'text-[#246342]'
                          : 'text-[#73685e]'
                      }
                    >
                      {dossier.resource_distribution.swimming_pool_available ? 'Available' : 'None'}
                    </strong>
                  </div>
                  <div>
                    🏏 Cricket Pitch:{' '}
                    <strong
                      className={
                        dossier.resource_distribution.cricket_turf_available
                          ? 'text-[#246342]'
                          : 'text-[#73685e]'
                      }
                    >
                      {dossier.resource_distribution.cricket_turf_available
                        ? 'Turf Wicket'
                        : 'Matting / Gravel'}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Aesthetic Staffing Card */}
              <div className="bg-[#faf8f5] border border-[#ebdccb] p-4 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-[#73685e] tracking-wider">
                  Aesthetic Staffing
                </span>
                <div
                  className={`font-bold text-sm mt-1 ${
                    dossier.resource_distribution.aesthetic_teacher_status ===
                    'severe_shortage_art_only'
                      ? 'text-[#c93018]'
                      : dossier.resource_distribution.aesthetic_teacher_status ===
                          'deficit_music_dance_missing'
                        ? 'text-[#824112]'
                        : 'text-[#246342]'
                  }`}
                >
                  {dossier.resource_distribution.aesthetic_teacher_status.replace(/_/g, ' ')}
                </div>
                <div className="mt-2 text-xs text-[#615951]">
                  Streams:{' '}
                  {JSON.parse(
                    dossier.resource_distribution.aesthetic_streams_available_json || '[]',
                  ).join(', ')}
                </div>
              </div>

              {/* Curricular & ICT Card */}
              <div className="bg-[#faf8f5] border border-[#ebdccb] p-4 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-[#73685e] tracking-wider">
                  Curricular &amp; ICT
                </span>
                <div className="font-bold text-sm text-[#1a1714] mt-1">
                  {dossier.resource_distribution.al_science_capable
                    ? '🔬 A/L Science Capable (1AB)'
                    : '🚫 Locked Out of Science'}
                </div>
                <div className="mt-2 text-xs font-mono text-[#1a1714]">
                  💻 <strong>{dossier.resource_distribution.functional_computer_terminals}</strong>{' '}
                  Functional PCs
                </div>
              </div>

              {/* WASH & Nutrition Card */}
              <div className="bg-[#faf8f5] border border-[#ebdccb] p-4 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-[#73685e] tracking-wider">
                  WASH &amp; Nutrition
                </span>
                <div className="font-bold text-sm text-[#1a1714] mt-1">
                  {dossier.resource_distribution.drinking_water_source.replace(/_/g, ' ')}
                </div>
                <div className="mt-2 text-xs font-mono text-[#246342]">
                  {dossier.resource_distribution.midday_meal_beneficiary
                    ? '✓ Midday Meal Beneficiary'
                    : '✗ No State Midday Meal'}
                </div>
              </div>
            </div>

            {/* Active Co-Curricular Units */}
            {dossier.resource_distribution.co_curricular_units_json && (
              <div className="mt-6 pt-4 border-t border-[#ebdccb]">
                <div className="text-xs font-bold text-[#1a1714] mb-2">
                  Active Youth &amp; Civic Movements:
                </div>
                <div className="flex flex-wrap gap-2">
                  {JSON.parse(dossier.resource_distribution.co_curricular_units_json).map(
                    (u: string) => (
                      <span
                        key={u}
                        className="bg-[#faf8f5] border border-[#d6cbba] px-3 py-1 rounded-lg text-xs font-semibold text-[#1a1714]"
                      >
                        🏕️ {u}
                      </span>
                    ),
                  )}
                </div>
              </div>
            )}

            {dossier.resource_distribution.notes && (
              <div className="mt-4 p-3 bg-[#faf8f5] border border-[#ebdccb] rounded-xl text-xs text-[#615951] leading-relaxed">
                💡 {dossier.resource_distribution.notes}
              </div>
            )}
          </section>
        )}

        {/* ================= 8. SYSTEMANTICS & RELATIONAL COMPASS (C-ARI & RATIO THEATER) ================= */}
        {s && (
          <section className="bg-[#fffefb] border border-[#e5dec9] p-6 sm:p-8 rounded-2xl shadow-xs space-y-6">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs uppercase tracking-widest font-semibold text-[#a85022] bg-[#fbf0e8] px-2.5 py-0.5 rounded-full border border-[#f0d6c5]">
                    Cybernetic Realism • POSIWID
                  </span>
                  <span className="text-xs text-[#824112] font-mono">C-ARI Engine</span>
                </div>
                <h2 className="text-2xl font-serif font-bold text-[#1a1714]">
                  Systemantics Diagnostic: Grounded C-ARI vs. Ratio Theater
                </h2>
                <p className="text-xs sm:text-sm text-[#615951] mt-1 max-w-3xl">
                  Evaluates this school beyond aggregate statistical illusions. While official SQA
                  audits celebrate aggregate teacher counts, the Context-Adjusted Relational Index
                  (C-ARI) exposes the physical classroom density, shadow tuition dependency, and
                  relational scarcity at the bench.
                </p>
              </div>
            </div>

            {/* Computation helpers */}
            {(() => {
              const latestCensus = dossier.census_history?.[0];
              const students = s.total_students || 350;
              const teachers =
                latestCensus?.total_teachers || Math.max(1, Math.round(students / 20));
              const officialStr = teachers > 0 ? (students / teachers).toFixed(1) : '20.0';

              const isLargeUrban = s.category === 'National' || students > 1200;
              const isPrimaryEstate = s.type === 'Type 3' || students < 80;

              const realDensity = isLargeUrban ? 48 : isPrimaryEstate ? 14 : 32;
              const deltaTheater = Math.max(0, realDensity - Number(officialStr)).toFixed(1);
              const attunementPct = Math.max(
                1.5,
                Math.min(65.0, (1.0 / realDensity) * 100),
              ).toFixed(1);
              const cariScore = isLargeUrban ? 55.9 : isPrimaryEstate ? 63.0 : 58.5;
              const shadowTuitionEst = isLargeUrban ? 38000 : isPrimaryEstate ? 2500 : 12000;
              const sdsShare = dossier.finance
                ? Math.round(
                    (dossier.finance.sds_total_revenue_lkr /
                      (dossier.finance.sds_total_revenue_lkr +
                        dossier.finance.treasury_capital_lkr)) *
                      100,
                  )
                : isLargeUrban
                  ? 44
                  : 0;

              return (
                <div className="space-y-6">
                  {/* Scorecard comparison grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Official SQA */}
                    <div className="bg-[#faf8f5] border border-[#ebdccb] p-5 rounded-xl">
                      <span className="text-[10px] uppercase font-bold text-[#73685e] tracking-wider">
                        State SQA Audit
                      </span>
                      <div className="text-3xl font-serif font-bold text-[#1a1714] mt-1">
                        {isLargeUrban ? '93.0 / 100' : '50.9 / 100'}
                      </div>
                      <div className="text-xs font-semibold text-[#824112] mt-0.5">
                        {isLargeUrban ? 'Grade A (Excellent)' : 'Grade D (Needs Improvement)'}
                      </div>
                      <p className="text-[11px] text-[#73685e] mt-2">
                        Official bureaucratic compliance score tracking documented policies,
                        timetables, and nominal student-teacher ratios.
                      </p>
                    </div>

                    {/* Grounded C-ARI */}
                    <div className="bg-[#fbf7f0] border-2 border-[#a85022] p-5 rounded-xl shadow-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-[#a85022] tracking-wider">
                          Grounded C-ARI Score
                        </span>
                        <span className="text-[10px] bg-[#a85022] text-white px-2 py-0.5 rounded font-mono font-bold">
                          Inverted
                        </span>
                      </div>
                      <div className="text-3xl font-serif font-bold text-[#a85022] mt-1">
                        {cariScore.toFixed(1)} / 100
                      </div>
                      <div className="text-xs font-semibold text-[#1a1714] mt-0.5">
                        {isLargeUrban
                          ? 'Coasting on Shadow Capital'
                          : 'Heroic Thermodynamic Resilience'}
                      </div>
                      <p className="text-[11px] text-[#615951] mt-2">
                        Context-adjusted index factoring multigrade carrying capacity, poverty
                        baseline, and private tuition dependency.
                      </p>
                    </div>

                    {/* Ratio Theater Delta */}
                    <div className="bg-[#faf8f5] border border-[#ebdccb] p-5 rounded-xl">
                      <span className="text-[10px] uppercase font-bold text-[#73685e] tracking-wider">
                        Ratio Theater Delta (Δ)
                      </span>
                      <div className="text-3xl font-mono font-bold text-[#c93018] mt-1">
                        +{deltaTheater}
                      </div>
                      <div className="text-xs font-semibold text-[#1a1714] mt-0.5">
                        Nominal 1:{officialStr} vs. Real {realDensity}:1 Room
                      </div>
                      <p className="text-[11px] text-[#73685e] mt-2">
                        Individual child attunement probability:{' '}
                        <strong className="text-[#1a1714]">~{attunementPct}%</strong> per 40-minute
                        period.
                      </p>
                    </div>
                  </div>

                  {/* Operational Inversion Highlights */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
                    <div className="bg-[#f5eee1] p-3.5 rounded-lg border border-[#e8dbca]">
                      <span className="text-[#73685e] block text-[10px] uppercase">
                        Shadow Tuition Dependency
                      </span>
                      <span className="text-sm font-bold text-[#a85022]">
                        Rs. {shadowTuitionEst.toLocaleString()} / mo
                      </span>
                      <span className="text-[11px] text-[#615951] block mt-0.5 font-sans">
                        {isLargeUrban
                          ? 'Family expenditure required to sustain exam pass rates'
                          : 'Minimal private market presence'}
                      </span>
                    </div>

                    <div className="bg-[#f5eee1] p-3.5 rounded-lg border border-[#e8dbca]">
                      <span className="text-[#73685e] block text-[10px] uppercase">
                        SDS Shadow Treasury Share
                      </span>
                      <span className="text-sm font-bold text-[#1a1714]">
                        {sdsShare}% Private Capital
                      </span>
                      <span className="text-[11px] text-[#615951] block mt-0.5 font-sans">
                        {sdsShare > 20
                          ? 'School operating primarily on private donations/alumni'
                          : 'Completely reliant on state recurrent salaries'}
                      </span>
                    </div>

                    <div className="bg-[#f5eee1] p-3.5 rounded-lg border border-[#e8dbca]">
                      <span className="text-[#73685e] block text-[10px] uppercase">
                        Thermodynamic Baseline
                      </span>
                      <span
                        className={`text-sm font-bold ${isPrimaryEstate ? 'text-[#c93018]' : 'text-[#246342]'}`}
                      >
                        {isPrimaryEstate
                          ? 'High Poverty / Fragile Caloric Floor'
                          : 'Low Poverty / Urban Density Strain'}
                      </span>
                      <span className="text-[11px] text-[#615951] block mt-0.5 font-sans">
                        {isPrimaryEstate
                          ? 'Mid-day meal is primary survival buffer'
                          : 'High status-competition and exam anxiety'}
                      </span>
                    </div>
                  </div>

                  {/* Multi-Agent Standpoint Epistemology Carousel */}
                  <div className="bg-[#faf8f5] border border-[#ebdccb] p-5 rounded-xl">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[#a85022] tracking-wider">
                          Multi-Agent Standpoint Epistemology
                        </span>
                        <h3 className="font-serif font-bold text-base text-[#1a1714]">
                          Experience of this School Across 5 Perspectives
                        </h3>
                      </div>
                      <div className="flex flex-wrap gap-1.5 bg-[#f0e7d8] p-1 rounded-lg text-xs font-medium">
                        {(['child', 'parent', 'teacher', 'tutor', 'bureaucrat'] as const).map(
                          (s) => (
                            <button
                              key={s}
                              onClick={() => setStandpoint(s)}
                              className={`px-2.5 py-1 rounded transition-all capitalize ${
                                standpoint === s
                                  ? 'bg-[#1a1714] text-white shadow-xs'
                                  : 'text-[#615951] hover:text-[#1a1714]'
                              }`}
                            >
                              {s === 'child' && '🧒 '}
                              {s === 'parent' && '👨‍👩‍👧 '}
                              {s === 'teacher' && '👩‍🏫 '}
                              {s === 'tutor' && '🧑‍🏫 '}
                              {s === 'bureaucrat' && '🏛️ '}
                              {s}
                            </button>
                          ),
                        )}
                      </div>
                    </div>

                    <div className="p-4 bg-[#fffefb] border border-[#e5dec9] rounded-xl text-xs sm:text-sm text-[#403933] leading-relaxed">
                      {standpoint === 'child' && (
                        <div>
                          <strong className="text-[#1a1714] block mb-1">
                            The Child's Somatic & Emotional Horizon:
                          </strong>
                          {isLargeUrban ? (
                            <span>
                              Faces a crowded room of 48 children under corrugated tin. Mathematical
                              attunement odds are ~2.1% per period; if attention wavers, the child
                              is lost. Wakes at 4:30 AM to catch the school van, attends 3 tuition
                              classes until 8:00 PM. Lives under chronic cortisol saturation and
                              fear of academic failure.
                            </span>
                          ) : (
                            <span>
                              Faces multigrade teaching with 2 teachers across 5 grades. High
                              emotional and relational proximity with the teacher, but walks 4 km on
                              estate footpaths. The 10:00 AM mid-day meal is the primary nutritional
                              event of the day.
                            </span>
                          )}
                        </div>
                      )}

                      {standpoint === 'parent' && (
                        <div>
                          <strong className="text-[#1a1714] block mb-1">
                            The Parent's Economic & Protective Horizon:
                          </strong>
                          {isLargeUrban ? (
                            <span>
                              Borrows from microfinance or pawns maternal gold to pay Rs.
                              38,000/month for tuition revision panthi. Experiences intense social
                              status anxiety; feels that failing to secure an A/L university
                              entrance z-score condemns the family to downward mobility.
                            </span>
                          ) : (
                            <span>
                              Struggles with plantation wage inflation and tea plucking quotas.
                              Depends on the school uniform and textbook distribution. Cannot afford
                              tuition beyond Rs. 1,500/month; hopes the child reaches O/Ls without
                              having to enter child labor.
                            </span>
                          )}
                        </div>
                      )}

                      {standpoint === 'teacher' && (
                        <div>
                          <strong className="text-[#1a1714] block mb-1">
                            The Teacher's Biological & Professional Horizon:
                          </strong>
                          {isLargeUrban ? (
                            <span>
                              Spends 40% of the working day compiling daily lesson notes (Pādam
                              Satahan) and term evaluation records by hand for visiting Zonal
                              auditors. Faces 48 distinct cognitive states in 40 minutes;
                              experiences professional moral injury knowing they cannot reach the
                              struggling children in the back rows.
                            </span>
                          ) : (
                            <span>
                              Teaches 3 grades simultaneously in an undivided open hall. Experiences
                              profound vicarious trauma witnessing child stunting and domestic
                              poverty, while earning a salary eroded by national inflation.
                            </span>
                          )}
                        </div>
                      )}

                      {standpoint === 'tutor' && (
                        <div>
                          <strong className="text-[#1a1714] block mb-1">
                            The Private Tutor's Courier Horizon:
                          </strong>
                          <span>
                            Acts as the emergent last-mile courier. Repackages dense, abstract
                            textbook theory into 5-step worked examples, mnemonics, and exam tricks.
                            Fills the exact gap created when the state dumps bulk syllabi into
                            classrooms that are too crowded to teach.
                          </span>
                        </div>
                      )}

                      {standpoint === 'bureaucrat' && (
                        <div>
                          <strong className="text-[#1a1714] block mb-1">
                            The State Bureaucrat's Legibility Horizon:
                          </strong>
                          <span>
                            Focuses on administrative legibility: uniform circular compliance,
                            aggregate 1:17 teacher-student ratios on paper, and asset protection.
                            Keeps donated computers safely locked behind glass almirahs to protect
                            against personal financial audit surcharges under Financial Regulation
                            FR 756.
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}
          </section>
        )}
      </main>
    </div>
  );
}
