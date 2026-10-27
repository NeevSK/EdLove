import type { FormResponse, FormSchema } from '@intuitui-labs/form-builder-engine/schema';
import { createClient } from '@supabase/supabase-js';
import { describe, expect, it, vi } from 'vitest';
import { SupabaseFormsAdapter } from '../forms.adapter';

const account = '123e4567-e89b-8101-8100-426614174000';
const other = '123e4567-e89b-8101-8100-426614174001';
const form: FormSchema = { v: '1.0', id: 'form-fixture', title: 'Fixture', pages: [] };
const response: FormResponse = {
  id: 'response-fixture',
  formId: form.id,
  tenantId: account,
  data: {},
  submittedAt: '2026-10-25T00:00:00Z',
};

function fixture(identity: unknown, identityStatus = 200) {
  const fetch = vi.fn<typeof globalThis.fetch>().mockImplementation(async (input) => {
    if (String(input).endsWith('/rpc/get_my_id')) {
      return new Response(JSON.stringify(identity), {
        status: identityStatus,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return new Response(null, { status: 201 });
  });
  const client = createClient('https://forms.example.invalid', 'synthetic-key', {
    global: { fetch },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return { adapter: new SupabaseFormsAdapter(client), fetch };
}

describe('G1 form ownership uses canonical binding, not credential subjects', () => {
  it('resolves the owner before inserting and never requests the provider user', async () => {
    const { adapter, fetch } = fixture(account);
    await adapter.save(form);
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(String(fetch.mock.calls[0]?.[0])).toContain('/rpc/get_my_id');
    expect(JSON.parse(String(fetch.mock.calls[1]?.[1]?.body))).toMatchObject({ owner_id: account });
  });

  it.each([null, '00000000-0000-0000-0000-000000000000', 'f0310000-0000-4000-8000-000000000001'])(
    'refuses saving with an absent or noncanonical account %s',
    async (identity) => {
      const { adapter, fetch } = fixture(identity);
      await expect(adapter.save(form)).rejects.toBeInstanceOf(Error);
      expect(fetch).toHaveBeenCalledTimes(1);
    },
  );

  it('does not let an explicit owner bypass account resolution', async () => {
    const { adapter, fetch } = fixture(account);
    await expect(adapter.save({ ...form, tenantId: other })).rejects.toMatchObject({
      code: 'FORBIDDEN',
    });
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('surfaces resolution outage before writing', async () => {
    const { adapter, fetch } = fixture({ message: 'synthetic provider failure' }, 503);
    await expect(adapter.save(form)).rejects.toMatchObject({
      code: 'IDENTITY_RESOLUTION_UNAVAILABLE',
    });
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('derives a signed-in responder even when no responder is supplied', async () => {
    const { adapter, fetch } = fixture(account);
    await adapter.record(form.id, response);
    expect(JSON.parse(String(fetch.mock.calls[1]?.[1]?.body))).toMatchObject([
      { responder_id: account },
    ]);
  });

  it('rejects responder impersonation before submitting', async () => {
    const { adapter, fetch } = fixture(account);
    await expect(
      adapter.record(form.id, { ...response, responderId: other }),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('keeps anonymous submissions unattributed', async () => {
    const { adapter, fetch } = fixture(null);
    await adapter.record(form.id, response);
    expect(JSON.parse(String(fetch.mock.calls[1]?.[1]?.body))).toMatchObject([
      { responder_id: null },
    ]);
  });
});
