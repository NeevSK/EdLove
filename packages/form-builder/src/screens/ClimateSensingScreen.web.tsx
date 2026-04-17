import React, { useMemo, useState } from 'react';
import { FormManager } from '@repo/core/forms/form-manager';
import NativeForm from '../NativeForm';
import { createClimateSensingSchema, type ClimateSensingData } from '../apps/resilience-sensing-schema';

interface ClimateSensingWebProps {
    initialSchoolId?: string;
    initialSchoolName?: string;
}

export const ClimateSensingScreenWeb = ({
    initialSchoolId,
    initialSchoolName
}: ClimateSensingWebProps) => {
    const [selectedSchool, setSelectedSchool] = useState<{ id: string; name: string } | null>(
        initialSchoolId ? { id: initialSchoolId, name: initialSchoolName || initialSchoolId } : null
    );
    const [isFinished, setIsFinished] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleSubmit = async (values: ClimateSensingData) => {
        if (!selectedSchool) return;
        console.log(`[Web] Submitting Pulse for School ${selectedSchool.id}:`, values);
        await new Promise((resolve) => setTimeout(resolve, 1500));
        setIsFinished(true);
    };

    const manager = useMemo(
        () => new FormManager(createClimateSensingSchema(handleSubmit)),
        [selectedSchool]
    );

    if (isFinished && selectedSchool) {
        const shareUrl = `https://gurudevi.edlove.org/sensing/${selectedSchool.id}`;

        return (
            <div className="min-h-screen bg-slate-100 px-6 py-12">
                <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 rounded-[32px] border border-slate-200 bg-white p-8 shadow-2xl md:p-12">
                    <div className="text-center">
                        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-4xl">
                            ✓
                        </div>
                        <h1 className="mb-4 text-4xl font-bold tracking-tight text-slate-900">
                            Resonance Registered
                        </h1>
                        <p className="mx-auto max-w-2xl text-lg leading-8 text-slate-600">
                            The material and human dimensions of {selectedSchool.name} have been broadcast to the national registry.
                        </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <button
                            type="button"
                            className="rounded-2xl bg-teal-700 px-6 py-4 text-base font-semibold text-white transition hover:bg-teal-800"
                            onClick={() => window.open('https://gurudevi.edlove.org/map', '_blank', 'noopener,noreferrer')}
                        >
                            View National Map
                        </button>
                        <button
                            type="button"
                            className="rounded-2xl border border-slate-300 px-6 py-4 text-base font-semibold text-slate-900 transition hover:border-slate-400 hover:bg-slate-50"
                            onClick={async () => {
                                await navigator.clipboard.writeText(shareUrl);
                                setCopied(true);
                                window.setTimeout(() => setCopied(false), 1800);
                            }}
                        >
                            {copied ? 'Pulse Link Copied' : 'Copy Pulse Link'}
                        </button>
                    </div>

                    <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-8 text-center">
                        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-teal-700">
                            School Pulse Link
                        </p>
                        <p className="break-all rounded-2xl bg-white px-4 py-4 font-mono text-sm text-slate-700 shadow-sm">
                            {shareUrl}
                        </p>
                        <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-slate-500">
                            Print or share this page link with teachers on-site to let them broadcast resonance pulses instantly.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (!selectedSchool) {
        return (
            <div className="min-h-screen bg-slate-100 px-6 py-12">
                <div className="mx-auto w-full max-w-2xl rounded-[32px] border border-slate-200 bg-white p-8 shadow-2xl md:p-12">
                    <div className="mb-8 text-center">
                        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-teal-700">
                            School Resonance Registry
                        </p>
                        <h1 className="mb-3 text-4xl font-bold tracking-tight text-slate-900">
                            Identify Your School
                        </h1>
                        <p className="text-lg leading-8 text-slate-600">
                            Before broadcasting a resonance pulse, select your school from the national registry.
                        </p>
                    </div>

                    <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-6">
                        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
                            Search Census Registry
                        </p>
                        <div className="mb-4 rounded-2xl border border-slate-200 bg-white px-4 py-4 text-slate-500">
                            Searching for schools in Sri Lanka...
                        </div>
                        <button
                            type="button"
                            className="w-full rounded-2xl bg-teal-700 px-6 py-4 text-base font-semibold text-white transition hover:bg-teal-800"
                            onClick={() => setSelectedSchool({ id: 'S-CENTRAL-01', name: 'Ananda College (Census Placeholder)' })}
                        >
                            Select Ananda College (Test)
                        </button>
                    </div>

                    <p className="mt-6 text-center text-sm leading-7 text-slate-500">
                        Accurate school identity helps policy and resource distribution reflect the true context of the learning environment.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-100 px-6 py-12">
            <div className="mx-auto w-full max-w-4xl overflow-hidden rounded-[40px] border border-slate-200 bg-white shadow-2xl">
                <div className="bg-teal-700 px-8 py-10 text-white md:px-12 md:py-12">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-white/70">
                        Global Sensing Node · {selectedSchool.id}
                    </p>
                    <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl">
                        {selectedSchool.name}
                    </h1>
                    <p className="max-w-2xl text-lg leading-8 text-white/85">
                        Bridge the material and human dimensions of school environments to help shape supportive safe harbors.
                    </p>
                </div>

                <div className="px-8 py-10 md:px-12 md:py-12">
                    <NativeForm
                        manager={manager}
                        submitLabel="Broadcast Resonance Pulse"
                    />
                </div>

                <div className="border-t border-slate-200 bg-slate-50 px-8 py-5 text-center text-sm text-slate-500 md:px-12">
                    Resilio · Sensing Layer v2.0 · Data Security Guaranteed
                </div>
            </div>
        </div>
    );
};
