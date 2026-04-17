import React from 'react';
import { useForm } from '@repo/core/hooks/useForm';
import type { FormManager } from '@repo/core/forms/form-manager';


interface NativeFormProps<T extends Record<string, any>> {
  manager: FormManager<T>;
  submitLabel?: string;
}

/**
 * A reusable React Native form component that uses the shared FormManager.
 */
export default function NativeForm<T extends Record<string, any>>({
  manager,
  submitLabel = 'Submit'
}: NativeFormProps<T>) {
  const state = useForm(manager);
  const config = manager.getConfig();

  const getInputType = (fieldType?: string) => {
    switch (fieldType) {
      case 'email':
        return 'email';
      case 'number':
        return 'number';
      case 'password':
        return 'password';
      default:
        return 'text';
    }
  };

  return (
    <div className="flex w-full flex-col gap-6">
      {(Object.keys(config.fields) as (keyof T)[]).map((fieldName) => {
        const field = config.fields[fieldName];
        const value = state.values[fieldName];
        const error = state.errors[fieldName];
        const isTextarea = field.type === 'textarea';

        return (
          <label key={fieldName as string} className="flex w-full flex-col gap-2">
            {field.label && (
              <span className="text-sm font-medium tracking-wide text-slate-800">
                {field.label}
              </span>
            )}

            {isTextarea ? (
              <textarea
                className={`min-h-32 rounded-2xl border bg-white px-4 py-3 text-base text-slate-900 outline-none transition ${
                  error ? 'border-rose-500' : 'border-slate-200 focus:border-teal-600'
                }`}
                placeholder={field.placeholder}
                value={typeof value === 'string' ? value : ''}
                onChange={(event) => manager.setFieldValue(fieldName, event.target.value as any)}
                rows={4}
              />
            ) : (
              <input
                className={`min-h-12 rounded-2xl border bg-white px-4 py-3 text-base text-slate-900 outline-none transition ${
                  error ? 'border-rose-500' : 'border-slate-200 focus:border-teal-600'
                }`}
                type={getInputType(field.type)}
                placeholder={field.placeholder}
                value={typeof value === 'string' || typeof value === 'number' ? String(value) : ''}
                onChange={(event) => manager.setFieldValue(fieldName, event.target.value as any)}
              />
            )}

            {error && (
              <span className="text-sm text-rose-600">
                {String(error)}
              </span>
            )}
          </label>
        );
      })}

      <button
        type="button"
        onClick={() => manager.submit()}
        disabled={state.isSubmitting}
        className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-teal-700 px-6 py-3 text-base font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {state.isSubmitting ? 'Submitting…' : submitLabel}
      </button>

      {state.submitError && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {String(state.submitError)}
        </div>
      )}
    </div>
  );
}
