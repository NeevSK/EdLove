import { fireEvent, render, screen } from '@testing-library/react-native';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { haptic } from '../../../utils/haptics';
import { isAllRight, markOf, scalePoints, toggleChoice } from '../../shared/questions';
import { ChoiceQuestion, PrivacyNote, Scale } from '../Question/Question';

vi.mock('../../../utils/haptics', () => ({ hapticImpact: vi.fn(), haptic: vi.fn() }));
beforeEach(() => vi.mocked(haptic).mockClear());

const OPTIONS = [
  { value: 'sun', label: 'The sun' },
  { value: 'moon', label: 'The moon' },
  { value: 'wind', label: 'The wind' },
] as const;
type V = (typeof OPTIONS)[number]['value'];

describe('question rules', { tags: ['unit'] }, () => {
  it('marks chosen-right as correct, chosen-wrong as incorrect, unchosen-right as missed', () => {
    const correct: V[] = ['sun', 'wind'];
    expect(markOf<V>('sun', ['sun', 'moon'], correct)).toBe('correct');
    expect(markOf<V>('moon', ['sun', 'moon'], correct)).toBe('incorrect');
    expect(markOf<V>('wind', ['sun', 'moon'], correct)).toBe('missed');
    expect(markOf<V>('wind', ['sun'], undefined)).toBe('none');
    expect(isAllRight<V>(['wind', 'sun'], correct)).toBe(true);
    expect(isAllRight<V>(['sun'], correct)).toBe(false);
  });

  it('a scale has 3 to 11 points; single choice replaces, multiple toggles', () => {
    expect(scalePoints()).toEqual([1, 2, 3, 4, 5]);
    expect(scalePoints(0, 10)).toHaveLength(11);
    expect(scalePoints(1, 2)).toEqual([1, 2, 3]);
    expect(scalePoints(0, 40)).toHaveLength(11);
    expect(toggleChoice<V>(['sun'], 'moon', false)).toEqual(['moon']);
    expect(toggleChoice<V>(['sun'], 'moon', true)).toEqual(['sun', 'moon']);
    expect(toggleChoice<V>(['sun', 'moon'], 'sun', true)).toEqual(['moon']);
  });
});

describe('Scale', { tags: ['a11y', 'interaction', 'unit'] }, () => {
  it('is a named radio group; its ends say what they mean; choosing ticks', async () => {
    const onChange = vi.fn();
    await render(
      <Scale
        label="How sure are you?"
        value={2}
        onChange={onChange}
        ends={{ low: 'Not at all', high: 'Completely' }}
      />,
    );
    expect(screen.getByLabelText('How sure are you?').props.role).toBe('radiogroup');
    expect(screen.getByRole('radio', { name: '1, Not at all' })).toBeTruthy();
    expect(screen.getByRole('radio', { name: '5, Completely' })).toBeTruthy();
    expect(screen.getByRole('radio', { name: '2' }).props['aria-checked']).toBe(true);
    await fireEvent.press(screen.getByRole('radio', { name: '4' }));
    expect(onChange).toHaveBeenCalledWith(4);
    expect(haptic).toHaveBeenCalledWith('selection');
  });
});

describe('ChoiceQuestion', { tags: ['a11y', 'interaction', 'unit'] }, () => {
  it('before a reveal: radios that choose', async () => {
    const onChange = vi.fn();
    await render(
      <ChoiceQuestion<V>
        prompt="What warms the earth?"
        options={OPTIONS}
        value={[]}
        onChange={onChange}
      />,
    );
    expect(screen.getAllByRole('header')).toHaveLength(1);
    await fireEvent.press(screen.getByRole('radio', { name: 'The sun' }));
    expect(onChange).toHaveBeenCalledWith(['sun']);
  });

  it('several answers: checkboxes that toggle', async () => {
    const onChange = vi.fn();
    await render(
      <ChoiceQuestion<V>
        prompt="Pick two"
        options={OPTIONS}
        multiple
        value={['sun']}
        onChange={onChange}
      />,
    );
    await fireEvent.press(screen.getByRole('checkbox', { name: 'The wind' }));
    expect(onChange).toHaveBeenCalledWith(['sun', 'wind']);
  });

  it('a reveal locks, marks in words, announces, explains, and is felt once', async () => {
    const onChange = vi.fn();
    const tree = () => (
      <ChoiceQuestion<V>
        prompt="What warms the earth?"
        options={OPTIONS}
        value={['moon']}
        onChange={onChange}
        reveal={{ correct: ['sun'], explanation: 'Sunlight carries the heat.' }}
      />
    );
    const { rerender } = await render(tree());
    expect(screen.getByRole('radio', { name: 'The moon, Not this one' })).toBeTruthy();
    expect(screen.getByRole('radio', { name: 'The sun, This was right' })).toBeTruthy();
    expect(screen.getByRole('alert').props.children).toBe('Not quite.');
    expect(screen.getByText('Sunlight carries the heat.')).toBeTruthy();
    await fireEvent.press(screen.getByRole('radio', { name: 'The sun, This was right' }));
    expect(onChange).not.toHaveBeenCalled();
    // A re-render with the same reveal is not felt again.
    await rerender(tree());
    expect(vi.mocked(haptic).mock.calls.filter(([k]) => k === 'error')).toHaveLength(1);
  });

  it('speaks the reader language', async () => {
    await render(
      <ChoiceQuestion<V>
        prompt="?"
        options={OPTIONS}
        value={['sun']}
        onChange={() => {}}
        reveal={{ correct: ['sun'] }}
        labels={{ correct: 'නිවැරදියි', resultRight: 'හරි!' }}
      />,
    );
    expect(screen.getByRole('radio', { name: 'The sun, නිවැරදියි' })).toBeTruthy();
    expect(screen.getByRole('alert').props.children).toBe('හරි!');
    expect(haptic).toHaveBeenCalledWith('success');
  });
});

describe('PrivacyNote', { tags: ['a11y', 'unit'] }, () => {
  it('says plainly who sees the answers', async () => {
    await render(<PrivacyNote identity="anonymous" audience="Read by your class teacher" />);
    expect(screen.getByText(/your name is not stored/)).toBeTruthy();
    expect(screen.getByText('Read by your class teacher')).toBeTruthy();
  });
});
