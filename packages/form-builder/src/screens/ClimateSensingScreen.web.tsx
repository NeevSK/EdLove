import { supabase } from '@repo/core/api';
import { FormManager } from '@intuitui-labs/form-builder-engine';

import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Info,
  Link as LinkIcon,
  Loader2,
  Map as MapIcon,
  School,
  Search,
  Truck,
  Users,
  Wifi,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import {
  type ClimateSensingData,
  createClimateSensingSchema,
} from '../apps/resilience-sensing-schema';
import NativeForm from '../NativeForm';

interface ClimateSensingWebProps {
  initialSchoolId?: string;
  initialSchoolName?: string;
}

interface SchoolRegistryItem {
  id: string;
  name: string;
  census_id: string | null;
}

export const ClimateSensingScreenWeb = ({
  initialSchoolId,
  initialSchoolName,
}: ClimateSensingWebProps) => {
  // School Identity State
  const [selectedSchool, setSelectedSchool] = useState<SchoolRegistryItem | null>(
    initialSchoolId
      ? {
          id: initialSchoolId,
          name: initialSchoolName || initialSchoolId,
          census_id: null,
        }
      : null,
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SchoolRegistryItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [copied, setCopied] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // School Registry Search
  useEffect(() => {
    const searchSchools = async () => {
      if (searchQuery.length < 3) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      const { data, error } = await supabase
        .from('schools')
        .select('id, name, census_id')
        .ilike('name', `%${searchQuery}%`)
        .limit(6);

      if (!error && data) {
        setSearchResults(data);
      }
      setIsSearching(false);
    };

    const timer = setTimeout(searchSchools, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSubmit = async (values: ClimateSensingData) => {
    if (!selectedSchool) return;
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Normalize sections into separate pulse logs for granular analysis
      const logs = [
        {
          edu_school_id: selectedSchool.id,
          dimension: 'material',
          score: null,
          detailed_context: JSON.stringify({
            power_reliability: values.power_reliability,
            water_access: values.water_access,
            lab_status: values.lab_status,
          }),
          reason_category: values.shift_reason,
        },
        {
          edu_school_id: selectedSchool.id,
          dimension: 'connectivity',
          score: (values.signal_strength + values.wifi_reach) / 2,
          detailed_context: JSON.stringify({
            signal_strength: values.signal_strength,
            wifi_reach: values.wifi_reach,
          }),
          reason_category: values.shift_reason,
        },
        {
          edu_school_id: selectedSchool.id,
          dimension: 'harmony',
          score: (values.staff_synergy + values.principal_alignment) / 2,
          detailed_context: JSON.stringify({
            harmony_vibe: values.harmony_vibe,
            staff_synergy: values.staff_synergy,
            principal_alignment: values.principal_alignment,
          }),
          reason_category: values.shift_reason,
        },
        {
          edu_school_id: selectedSchool.id,
          dimension: 'logistics',
          score: (values.commute_friction + values.resource_density) / 2,
          detailed_context: JSON.stringify({
            commute_friction: values.commute_friction,
            resource_density: values.resource_density,
          }),
          reason_category: values.shift_reason,
        },
      ];

      const { error: insertError } = await supabase.from('edu_school_pulse_logs').insert(logs);

      if (insertError) throw insertError;

      // Success Transition
      setIsFinished(true);
    } catch (err: any) {
      console.error('Failed to broadcast resonance pulse:', err);
      setSubmitError(err.message || 'Transmission failed. Please check your connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const manager = useMemo(
    () => new FormManager(createClimateSensingSchema(handleSubmit)),
    [handleSubmit],
  );

  // View: Success Screen
  if (isFinished && selectedSchool) {
    const shareUrl = `https://gurudevi.edlove.org/sensing/${selectedSchool.id}`;

    return (
      <div className="min-h-screen bg-slate-50 px-6 py-12 selection:bg-teal-100">
        <div className="mx-auto flex w-full max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-700 flex-col gap-8 rounded-[40px] border border-slate-200 bg-white p-8 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] md:p-14">
          <div className="text-center">
            <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <CheckCircle2 size={56} strokeWidth={1.5} />
            </div>
            <h1 className="mb-4 text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
              Resonance Registered
            </h1>
            <p className="mx-auto max-w-2xl text-lg leading-relaxed text-slate-600">
              The material and human dimensions of{' '}
              <span className="font-semibold text-slate-900">{selectedSchool.name}</span> have been
              successfully broadcast to the national registry.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <button
              type="button"
              className="group flex items-center justify-center gap-3 rounded-2xl bg-teal-700 px-6 py-4 text-base font-bold text-white transition-all hover:bg-teal-800 hover:shadow-lg active:scale-[0.98]"
              onClick={() =>
                window.open('https://gurudevi.edlove.org/map', '_blank', 'noopener,noreferrer')
              }
            >
              <MapIcon size={20} />
              View National Map
              <ArrowRight
                size={18}
                className="opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100"
              />
            </button>
            <button
              type="button"
              className="flex items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-6 py-4 text-base font-bold text-slate-900 transition-all hover:border-slate-300 hover:bg-slate-50 active:scale-[0.98]"
              onClick={async () => {
                await navigator.clipboard.writeText(shareUrl);
                setCopied(true);
                window.setTimeout(() => setCopied(false), 2000);
              }}
            >
              <LinkIcon size={20} className="text-slate-400" />
              {copied ? 'Pulse Link Copied' : 'Copy Pulse Link'}
            </button>
          </div>

          <div className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-slate-50/50 p-8 text-center ring-1 ring-inset ring-white/50">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.3em] text-teal-800/70">
              School Pulse Identity
            </p>
            <p className="inline-block break-all rounded-xl bg-white px-6 py-3 font-mono text-sm text-slate-700 shadow-sm border border-slate-100">
              {shareUrl}
            </p>
            <p className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-slate-500">
              This sovereign link enables teachers and staff to broadcast resonance pulses
              instantly. Data helps optimize resource flows across the national ecosystem.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // View: School Selection Screen
  if (!selectedSchool) {
    return (
      <div className="min-h-screen bg-slate-50 px-6 py-12 selection:bg-teal-100">
        <div className="mx-auto w-full max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-700 rounded-[40px] border border-slate-200 bg-white p-8 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)] md:p-14">
          <div className="mb-12 text-center">
            <div className="inline-flex items-center justify-center rounded-full bg-teal-50 px-4 py-1.5 mb-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-teal-700">
                Global Sensing Node
              </p>
            </div>
            <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-slate-900 md:text-5xl">
              Identify Your School
            </h1>
            <p className="text-lg leading-relaxed text-slate-600">
              Every school is a unique safe harbor. Before broadcasting a pulse, let's locate your
              institution in the national registry.
            </p>
          </div>

          <div className="space-y-6">
            <div className="relative group">
              <div className="absolute left-5 top-5 text-slate-400 group-focus-within:text-teal-600 transition-colors">
                {isSearching ? (
                  <Loader2 size={22} className="animate-spin" />
                ) : (
                  <Search size={22} />
                )}
              </div>
              <input
                type="text"
                placeholder="Search by School Name (e.g. Royal College)..."
                className="w-full rounded-[24px] border border-slate-200 bg-slate-50/50 py-5 pl-14 pr-6 text-lg font-medium text-slate-900 outline-none transition-all focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/5 placeholder:text-slate-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {searchResults.length > 0 && (
              <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm ring-1 ring-black/5 divide-y divide-slate-100">
                {searchResults.map((school) => (
                  <button
                    key={school.id}
                    type="button"
                    onClick={() => setSelectedSchool(school)}
                    className="flex w-full items-center justify-between px-6 py-5 text-left transition-all hover:bg-slate-50 group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors group-hover:bg-teal-50 group-hover:text-teal-600">
                        <Building2 size={20} />
                      </div>
                      <div>
                        <p className="text-lg font-bold text-slate-900">{school.name}</p>
                        <p className="text-sm font-medium text-slate-500">
                          Census ID: {school.census_id || 'REGISTERING...'}
                        </p>
                      </div>
                    </div>
                    <ArrowRight
                      size={20}
                      className="text-slate-300 group-hover:translate-x-1 group-hover:text-teal-600 transition-all"
                    />
                  </button>
                ))}
              </div>
            )}

            {searchQuery.length > 0 && searchQuery.length < 3 && !isSearching && (
              <div className="flex items-center gap-3 rounded-2xl bg-amber-50 p-4 text-amber-800 border border-amber-100">
                <Info size={18} />
                <p className="text-sm font-semibold">
                  Enter at least 3 characters to search the registry.
                </p>
              </div>
            )}

            {!isSearching && searchQuery.length >= 3 && searchResults.length === 0 && (
              <div className="text-center py-10 rounded-[24px] bg-slate-50 border-2 border-dashed border-slate-200">
                <p className="text-slate-400 font-medium italic">
                  No schools found matching "{searchQuery}"
                </p>
              </div>
            )}
          </div>

          <div className="mt-12 flex items-center gap-4 rounded-3xl bg-blue-50/50 p-6 border border-blue-100/50">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <Info size={24} />
            </div>
            <p className="text-sm leading-relaxed text-blue-900/70 font-medium">
              Accurate school identity helps policy and resource distribution reflect the true
              context of the learning environment. If yours is missing, contact support.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // View: Main Sensing Form
  return (
    <div className="min-h-screen bg-slate-50 px-6 py-12 selection:bg-teal-100">
      <div className="mx-auto w-full max-w-4xl overflow-hidden rounded-[48px] border border-slate-200 bg-white shadow-[0_32px_80px_-24px_rgba(0,0,0,0.12)]">
        <div className="relative bg-teal-800 px-8 py-12 text-white md:px-16 md:py-16">
          {/* Background Decorative Element */}
          <div className="absolute right-0 top-0 -translate-y-1/2 translate-x-1/4 opacity-10">
            <School size={300} />
          </div>

          <div className="relative z-10">
            <button
              onClick={() => setSelectedSchool(null)}
              className="mb-8 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-teal-200/60 hover:text-white transition-colors"
            >
              <ArrowRight size={14} className="rotate-180" />
              Change School Node
            </button>

            <div className="flex items-center gap-4 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-teal-200 backdrop-blur-sm">
                <Building2 size={20} />
              </div>
              <span className="text-sm font-bold uppercase tracking-[0.4em] text-teal-400/80">
                Pulse Target · {selectedSchool.id.split('-').pop()}
              </span>
            </div>

            <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-6xl">
              {selectedSchool.name}
            </h1>
            <div className="flex flex-wrap gap-6 text-teal-50/70">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-sm font-bold tracking-wide">Registry Active</span>
              </div>
              {selectedSchool.census_id && (
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-4 rounded-full bg-white/20" />
                  <span className="text-sm font-medium">Census: {selectedSchool.census_id}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-0 md:grid-cols-[1fr_360px]">
          <div className="px-8 py-12 md:px-16 md:py-16">
            {submitError && (
              <div className="mb-8 flex items-center gap-4 rounded-2xl bg-rose-50 p-5 text-rose-700 border border-rose-100">
                <Info size={20} className="flex-shrink-0" />
                <p className="text-sm font-bold">{submitError}</p>
              </div>
            )}
            <NativeForm
              manager={manager}
              submitLabel={isSubmitting ? 'Broadcasting...' : 'Broadcast Resonance Pulse'}
            />
          </div>

          <div className="bg-slate-50 border-l border-slate-100 p-8 md:p-12">
            <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400 mb-8">
              Sensing Dimensions
            </h3>
            <div className="space-y-10">
              <DimensionItem
                icon={Building2}
                title="Material Reality"
                desc="Infrastructure, power, and learning labs."
              />
              <DimensionItem
                icon={Wifi}
                title="Digital Connectivity"
                desc="Sovereign connectivity & network depth."
              />
              <DimensionItem
                icon={Users}
                title="Human Harmony"
                desc="Staff synergy and institutional vibe."
              />
              <DimensionItem
                icon={Truck}
                title="Logistics"
                desc="Friction and resource accessibility."
              />
            </div>

            <div className="mt-16 rounded-3xl bg-teal-900/5 p-6 border border-teal-900/5">
              <p className="text-xs leading-relaxed text-teal-900/60 font-semibold italic">
                "The pulse enables the invisible dimensions of our schools to become visible to the
                national ecosystem."
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 bg-white px-8 py-6 text-center md:px-16">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-300">
            Resilio · Sensing Layer v3.1 · National School OS Registry
          </p>
        </div>
      </div>
    </div>
  );
};

const DimensionItem = ({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) => (
  <div className="flex gap-5">
    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-white text-teal-700 shadow-sm border border-slate-100">
      <Icon size={22} />
    </div>
    <div>
      <p className="text-sm font-bold text-slate-900 mb-1">{title}</p>
      <p className="text-xs leading-relaxed text-slate-500 font-medium">{desc}</p>
    </div>
  </div>
);

export default ClimateSensingScreenWeb;
