import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  search: vi.fn(),
  parse: vi.fn(),
  repository: vi.fn(),
  client: { kind: 'shared-supabase-client' },
}));

vi.mock('@repo/core/adapters/supabase/educational/schoolRepository', () => ({
  createSchoolRepository: mocks.repository,
}));
vi.mock('@repo/core/adapters/supabaseClient', () => ({ supabaseClient: mocks.client }));
vi.mock('@repo/core/logic/schemas/school.schema', () => ({ SchoolSchema: { parse: mocks.parse } }));
vi.mock('@repo/core/api/sandboxDataset', () => ({
  getSandboxSamples: () => [
    {
      id: 'sample-school',
      name: 'Fallback school',
      censusId: 'sample',
      students: 100,
      teachers: 10,
      status: 'active',
    },
  ],
}));

import { FounderFloor } from '../../app/(sanctuary)/admin/founder/FounderFloor';

beforeEach(() => {
  vi.resetAllMocks();
  mocks.repository.mockReturnValue({ searchSchools: mocks.search });
  mocks.parse.mockImplementation((value) => value);
});
afterEach(cleanup);

describe('browser founder school reads', () => {
  it('uses the same repository client, query and validation before displaying live schools', async () => {
    const school = {
      id: 'school-1',
      name: 'Live school',
      handle: 'live',
      student_count: 1200,
      status: 'active',
    };
    mocks.search.mockResolvedValue([school]);
    render(<FounderFloor displayName="Founder" />);
    fireEvent.click(screen.getByRole('button', { name: /Schools Directory/ }));
    expect(await screen.findByText('Live school')).toBeTruthy();
    expect(mocks.repository).toHaveBeenCalledWith(mocks.client);
    expect(mocks.search).toHaveBeenCalledWith('');
    expect(mocks.parse).toHaveBeenCalledWith(school);
    expect(screen.queryByText('Fallback school')).toBeNull();
  });

  it.each(['network', 'validation', 'empty'])(
    'retains the directory fallback after %s failure or no rows',
    async (kind) => {
      if (kind === 'network') mocks.search.mockRejectedValue(new Error('Network unavailable'));
      else mocks.search.mockResolvedValue(kind === 'empty' ? [] : [{ id: 'invalid' }]);
      if (kind === 'validation')
        mocks.parse.mockImplementation(() => {
          throw new Error('Invalid school');
        });
      render(<FounderFloor displayName="Founder" />);
      fireEvent.click(screen.getByRole('button', { name: /Schools Directory/ }));
      await waitFor(() => expect(mocks.search).toHaveBeenCalledOnce());
      expect(screen.getByText('Fallback school')).toBeTruthy();
    },
  );
});
