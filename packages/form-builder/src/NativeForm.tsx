import React from 'react';
import { useForm } from '@repo/core';
import type { FormManager } from '@repo/core';
import { Star, Info } from 'lucide-react';

interface NativeFormProps<T extends Record<string, any>> {
  manager: FormManager<T>;
  submitLabel?: string;
}

export default function NativeForm<T extends Record<string, any>>({
  manager,
  submitLabel = 'Submit'
}: NativeFormProps<T>) {
  const state = useForm(manager);
  const config = manager.getConfig();

  return (
    <div className="flex w-full flex-col gap-10">
      {(Object.keys(config.fields) as (keyof T)[]).map((fieldName) => {
        const field = config.fields[fieldName];
        const value = state.values[fieldName];
        const error = state.errors[fieldName];

        // 1. Layout: Headings
        if (field.type === 'heading') {
            return (
                <div key={fieldName as string} className="pt-4 first:pt-0">
                    <h2 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
                        {field.label}
                    </h2>
                </div>
            );
        }

        // 2. Layout: Dividers
        if (field.type === 'divider') {
            return <div key={fieldName as string} className="h-px w-full bg-slate-100" />;
        }

        return (
          <div key={fieldName as string} className="flex w-full flex-col gap-3 group">
            {field.label && (
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-bold uppercase tracking-wider text-slate-500 group-focus-within:text-teal-700 transition-colors">
                  {field.label}
                </span>
                {field.required && (
                    <span className="text-[10px] font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full">REQUIRED</span>
                )}
              </div>
            )}

            {renderField(fieldName, field, value, manager, error)}

            {error && (
              <div className="flex items-center gap-2 text-rose-600 animate-in fade-in slide-in-from-top-1">
                <Info size={14} />
                <span className="text-xs font-bold">
                    {String(error)}
                </span>
              </div>
            )}
          </div>
        );
      })}

      <div className="pt-6">
        <button
            type="button"
            onClick={() => manager.submit()}
            disabled={state.isSubmitting}
            className="relative inline-flex min-h-[64px] w-full items-center justify-center overflow-hidden rounded-2xl bg-teal-700 px-8 py-4 text-lg font-bold text-white shadow-lg shadow-teal-700/20 transition-all hover:bg-teal-800 hover:shadow-xl active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        >
            {state.isSubmitting ? (
                <div className="flex items-center gap-3">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    <span>Broadcasting...</span>
                </div>
            ) : (
                <span>{submitLabel}</span>
            )}
        </button>
      </div>

      {state.submitError && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-6 py-4 text-sm font-medium text-rose-700 flex items-center gap-3">
          <Info size={20} />
          {String(state.submitError)}
        </div>
      )}
    </div>
  );
}

function renderField<T extends Record<string, any>>(
    name: keyof T, 
    field: any, 
    value: any, 
    manager: FormManager<T>,
    error: any
) {
    const commonClass = `w-full rounded-2xl border bg-white px-5 py-4 text-base font-medium text-slate-900 outline-none transition-all placeholder:text-slate-300 ${
        error 
        ? 'border-rose-300 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/5' 
        : 'border-slate-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/5'
    }`;

    switch (field.type) {
        case 'textarea':
            return (
                <textarea
                    className={`${commonClass} min-h-[120px] resize-none`}
                    placeholder={field.placeholder}
                    value={value || ''}
                    onChange={(e) => manager.setFieldValue(name, e.target.value as any)}
                />
            );
        case 'select':
            return (
                <select
                    className={`${commonClass} appearance-none cursor-pointer`}
                    value={value || ''}
                    onChange={(e) => manager.setFieldValue(name, e.target.value as any)}
                >
                    <option value="" disabled>{field.placeholder || "Please select..."}</option>
                    {field.options?.map((opt: any) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
            );
        case 'slider':
            return (
                <div className="space-y-4 py-2 px-1">
                    <input
                        type="range"
                        min={field.min || 1}
                        max={field.max || 5}
                        step={1}
                        className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-teal-600"
                        value={value || field.defaultValue || 3}
                        onChange={(e) => manager.setFieldValue(name, parseInt(e.target.value) as any)}
                    />
                    <div className="flex justify-between text-[11px] font-bold text-slate-400 px-1">
                        <span>MIN</span>
                        <span className="text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md">LEVEL {value || field.defaultValue || 3}</span>
                        <span>MAX</span>
                    </div>
                </div>
            );
        case 'likert':
            const max = 5;
            const isEmoji = field.scaleType === 'emoji';
            const emojis = ['😫', '🙁', '😐', '🙂', '😊'];
            
            return (
                <div className="flex items-center justify-between gap-2 py-2">
                    {Array.from({ length: max }).map((_, i) => {
                        const val = i + 1;
                        const isSelected = (value || field.defaultValue) === val;
                        return (
                            <button
                                key={val}
                                type="button"
                                onClick={() => manager.setFieldValue(name, val as any)}
                                className={`flex-1 flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${
                                    isSelected 
                                    ? 'border-teal-600 bg-teal-50 text-teal-700 shadow-sm' 
                                    : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200'
                                }`}
                            >
                                {isEmoji ? (
                                    <span className={`text-2xl mb-1 ${isSelected ? 'grayscale-0' : 'grayscale opacity-50'}`}>
                                        {emojis[i]}
                                    </span>
                                ) : (
                                    <span className="text-lg font-bold">{val}</span>
                                )}
                            </button>
                        );
                    })}
                </div>
            );
        default:
            return (
                <input
                    className={commonClass}
                    type={field.type === 'number' ? 'number' : 'text'}
                    placeholder={field.placeholder}
                    value={value || ''}
                    onChange={(e) => manager.setFieldValue(name, (field.type === 'number' ? parseFloat(e.target.value) : e.target.value) as any)}
                />
            );
    }
}
