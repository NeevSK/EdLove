import { ChoiceQuestion, PrivacyNote, Scale } from '@repo/ui/components/web';
import { resolveWorld, worldCssVariables } from '@repo/ui/theme';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

const OPTIONS = [
  { value: 'sun', label: 'The sun' },
  { value: 'moon', label: 'The moon' },
  { value: 'wind', label: 'The wind' },
];

describe('web kit: Scale', () => {
  it('is a named group of radios with named ends; choosing calls onChange', async () => {
    const onChange = vi.fn();
    render(
      <Scale
        label="How sure are you?"
        value={null}
        onChange={onChange}
        ends={{ low: 'Not at all', high: 'Completely' }}
      />,
    );
    expect(screen.getByRole('group', { name: 'How sure are you?' })).toBeTruthy();
    expect(screen.getAllByRole('radio')).toHaveLength(5);
    await userEvent.click(screen.getByRole('radio', { name: '5, Completely' }));
    expect(onChange).toHaveBeenCalledWith(5);
  });
});

describe('web kit: ChoiceQuestion', () => {
  it('chooses with radios, or toggles with checkboxes when several are allowed', async () => {
    const one = vi.fn();
    const { unmount } = render(
      <ChoiceQuestion prompt="What warms the earth?" options={OPTIONS} value={[]} onChange={one} />,
    );
    await userEvent.click(screen.getByRole('radio', { name: 'The sun' }));
    expect(one).toHaveBeenCalledWith(['sun']);
    unmount();
    const many = vi.fn();
    render(
      <ChoiceQuestion
        prompt="Pick two"
        options={OPTIONS}
        multiple
        value={['sun']}
        onChange={many}
      />,
    );
    await userEvent.click(screen.getByRole('checkbox', { name: 'The wind' }));
    expect(many).toHaveBeenCalledWith(['sun', 'wind']);
  });

  it('a reveal disables the question, marks options in words, announces and explains', async () => {
    const onChange = vi.fn();
    render(
      <ChoiceQuestion
        prompt="What warms the earth?"
        options={OPTIONS}
        value={['moon']}
        onChange={onChange}
        reveal={{ correct: ['sun'], explanation: 'Sunlight carries the heat.' }}
      />,
    );
    const group = screen.getByRole('group', {
      name: 'What warms the earth?',
    }) as HTMLFieldSetElement;
    expect(group.disabled).toBe(true);
    expect(screen.getByRole('radio', { name: /The moon.*Not this one/ })).toBeTruthy();
    expect(screen.getByRole('radio', { name: /The sun.*This was right/ })).toBeTruthy();
    expect(screen.getByRole('alert').textContent).toBe('Not quite.');
    expect(screen.getByText('Sunlight carries the heat.')).toBeTruthy();
    await userEvent.click(screen.getByText('The sun'));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('question colours come from the world recipe', () => {
    const w = resolveWorld('tea', 'dusk', 'dark');
    const vars = worldCssVariables(w);
    expect(vars['--w-q-correct']).toBe(w.recipes.question.mark.correct);
    expect(vars['--w-q-right']).toBe(w.recipes.question.result.right);
  });
});

describe('web kit: PrivacyNote', () => {
  it('says plainly that answers are anonymous, in the reader language when given', () => {
    render(<PrivacyNote identity="anonymous" labels={{ anonymous: 'ඔබේ නම ගබඩා නොකෙරේ.' }} />);
    expect(screen.getByText('ඔබේ නම ගබඩා නොකෙරේ.')).toBeTruthy();
  });
});
