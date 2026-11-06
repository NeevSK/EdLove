import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PreferredNameEntry } from '../PreferredNameEntry';

describe('PreferredNameEntry component', () => {
  const dummyStyles = {
    detectedNameCard: 'card',
    detectedNamePrompt: 'prompt',
    detectedNameChoiceRow: 'choice-row',
    primaryAction: 'btn-primary',
    secondaryActionBtn: 'btn-secondary',
    fieldLabel: 'label',
    nameInput: 'input',
    detectedNameHelper: 'helper',
    detectedNameSuggestion: 'suggestion',
    useDetectedNameBtn: 'btn-back',
  };

  it('renders detected candidate name card with 1-tap call-me action', () => {
    const onSelectDetectedName = vi.fn();
    const onStartCustomName = vi.fn();

    render(
      <PreferredNameEntry
        detectedName="Dr. Devika"
        displayName=""
        isEditingCustomName={false}
        onDisplayNameChange={vi.fn()}
        onSelectDetectedName={onSelectDetectedName}
        onStartCustomName={onStartCustomName}
        onBackToDetectedName={vi.fn()}
        styles={dummyStyles}
      />,
    );

    expect(screen.getByText(/Should we call you/i)).toBeDefined();
    expect(screen.getByText('Dr. Devika')).toBeDefined();

    const callMeBtn = screen.getByRole('button', { name: /Call me Dr. Devika/i });
    fireEvent.click(callMeBtn);
    expect(onSelectDetectedName).toHaveBeenCalledWith('Dr. Devika');

    const differentBtn = screen.getByRole('button', { name: /Use a different name/i });
    fireEvent.click(differentBtn);
    expect(onStartCustomName).toHaveBeenCalled();
  });

  it('renders standard text input when entering custom preferred name', () => {
    const onDisplayNameChange = vi.fn();
    const onBackToDetectedName = vi.fn();

    render(
      <PreferredNameEntry
        detectedName="Dr. Devika"
        displayName="Ananda"
        isEditingCustomName={true}
        onDisplayNameChange={onDisplayNameChange}
        onSelectDetectedName={vi.fn()}
        onStartCustomName={vi.fn()}
        onBackToDetectedName={onBackToDetectedName}
        styles={dummyStyles}
      />,
    );

    const input = screen.getByLabelText('Preferred name') as HTMLInputElement;
    expect(input.value).toBe('Ananda');

    fireEvent.change(input, { target: { value: 'Sam' } });
    expect(onDisplayNameChange).toHaveBeenCalledWith('Sam');

    const backBtn = screen.getByRole('button', { name: /Back to “Dr. Devika”/i });
    fireEvent.click(backBtn);
    expect(onBackToDetectedName).toHaveBeenCalled();
  });
});
