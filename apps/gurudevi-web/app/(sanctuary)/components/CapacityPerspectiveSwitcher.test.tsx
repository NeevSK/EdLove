import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getExploreCapacity } from '../../../lib/explore/exploreCapacity';
import { CapacityPerspectiveSwitcher } from './CapacityPerspectiveSwitcher';

describe('CapacityPerspectiveSwitcher (G1 boundary)', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it('renders default perspective and opens role selection menu on click', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<CapacityPerspectiveSwitcher mode="explore" onChange={onChange} />);

    const trigger = screen.getByRole('button', { name: /current perspective: teacher/i });
    expect(trigger).toBeTruthy();

    await user.click(trigger);

    expect(screen.getByRole('listbox', { name: /role perspectives/i })).toBeTruthy();
    expect(screen.getByText('School Leader & Principal')).toBeTruthy();
    expect(screen.getByText('Young Learner & Student')).toBeTruthy();
    expect(screen.getByText('Family & Guardian')).toBeTruthy();

    const studentOption = screen.getByRole('option', { name: /young learner & student/i });
    await user.click(studentOption);

    expect(getExploreCapacity()).toBe('student');
    expect(onChange).toHaveBeenCalledWith('student');
  });

  it('renders static badge in account mode with verified active capacity', () => {
    render(<CapacityPerspectiveSwitcher activeCapacity="principal" mode="account" />);
    expect(screen.getByText(/school leader & principal/i)).toBeTruthy();
    expect(screen.queryByRole('button', { name: /current perspective/i })).toBeNull();
  });
});
