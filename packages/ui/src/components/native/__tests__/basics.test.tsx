import { fireEvent, render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { haptic } from '../../../utils/haptics';
import { clampStep } from '../../shared/basics';
import { Disclosure } from '../Basics/Disclosure';
import { Notice } from '../Basics/Notice';
import { NumberStepper } from '../Basics/NumberStepper';
import { SearchField } from '../Basics/SearchField';
import { Steps } from '../Basics/Steps';

vi.mock('../../../utils/haptics', () => ({ hapticImpact: vi.fn(), haptic: vi.fn() }));
beforeEach(() => vi.mocked(haptic).mockClear());

describe('basic rules', { tags: ['unit'] }, () => {
  it('numbers stay in bounds and on their step from the minimum', () => {
    expect(clampStep(7, 0, 10, 5)).toBe(5);
    expect(clampStep(8, 0, 10, 5)).toBe(10);
    expect(clampStep(12, 0, 10)).toBe(10);
    expect(clampStep(4, 1, 20, 3)).toBe(4);
  });
});

describe('Disclosure', { tags: ['a11y', 'interaction', 'unit'] }, () => {
  it('says whether it is open and shows its content only when open', async () => {
    const onOpenChange = vi.fn();
    await render(
      <Disclosure title="Rubric" summary="4 criteria" onOpenChange={onOpenChange}>
        <Text>Criterion one</Text>
      </Disclosure>,
    );
    const head = screen.getByRole('button', { name: 'Rubric, 4 criteria' });
    expect(head.props.accessibilityState.expanded).toBe(false);
    expect(screen.queryByText('Criterion one')).toBeNull();
    await fireEvent.press(head);
    expect(screen.getByText('Criterion one')).toBeTruthy();
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(haptic).toHaveBeenCalledWith('selection');
  });
});

describe('Notice', { tags: ['a11y', 'unit'] }, () => {
  it('danger is an alert announced at once; others are polite; dismiss is named', async () => {
    const onDismiss = vi.fn();
    const { rerender } = await render(
      <Notice
        tone="danger"
        title="Not saved"
        message="Check your connection."
        onDismiss={onDismiss}
      />,
    );
    const alert = screen.getByRole('alert');
    expect(alert.props.accessibilityLiveRegion).toBe('assertive');
    await fireEvent.press(screen.getByRole('button', { name: 'Dismiss' }));
    expect(onDismiss).toHaveBeenCalled();
    await rerender(<Notice message="Drafts are kept on this device." />);
    expect(screen.queryByRole('alert')).toBeNull();
    expect(screen.getByRole('summary').props.accessibilityLiveRegion).toBe('polite');
  });
});

describe('SearchField', { tags: ['a11y', 'interaction', 'unit'] }, () => {
  it('is a named search box that clears and says its result count', async () => {
    const onChange = vi.fn();
    await render(
      <SearchField label="Search students" value="Nim" onChange={onChange} resultCount={3} />,
    );
    expect(screen.getByLabelText('Search students')).toBeTruthy();
    expect(screen.getByText('3 results')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Clear search' }));
    expect(onChange).toHaveBeenCalledWith('');
  });
});

describe('NumberStepper', { tags: ['a11y', 'interaction', 'unit'] }, () => {
  it('is one adjustable value for readers and stops at its bounds', async () => {
    const onChange = vi.fn();
    await render(
      <NumberStepper
        label="Duration"
        value={40}
        onChange={onChange}
        min={10}
        max={40}
        step={5}
        unit="minutes"
      />,
    );
    const value = screen.getByLabelText('Duration');
    expect(value.props.accessibilityValue).toEqual({
      min: 10,
      max: 40,
      now: 40,
      text: '40 minutes',
    });
    expect(
      screen.getByRole('button', { name: 'Increase, Duration' }).props.accessibilityState?.disabled,
    ).toBe(true);
    await fireEvent(value, 'accessibilityAction', { nativeEvent: { actionName: 'decrement' } });
    expect(onChange).toHaveBeenCalledWith(35);
    await fireEvent(value, 'accessibilityAction', { nativeEvent: { actionName: 'increment' } });
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});

describe('Steps', { tags: ['a11y', 'interaction', 'unit'] }, () => {
  it('says where you are in words and offers only steps already reached', async () => {
    const onSelect = vi.fn();
    await render(
      <Steps
        label="New quiz"
        current={1}
        onSelect={onSelect}
        steps={[
          { key: 'a', label: 'Details', state: 'done' },
          { key: 'b', label: 'Questions' },
          { key: 'c', label: 'Review' },
        ]}
      />,
    );
    expect(screen.getByText('Step 2 of 3 · Questions')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Step 1 of 3, Details, Done' }));
    expect(onSelect).toHaveBeenCalledWith(0);
    expect(
      screen.getByRole('button', { name: 'Step 3 of 3, Review' }).props.accessibilityState.disabled,
    ).toBe(true);
  });
});
