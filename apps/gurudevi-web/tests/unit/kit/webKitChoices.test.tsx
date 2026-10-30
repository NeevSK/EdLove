import { Checkbox, Menu, RadioGroup, Select, Slider } from '@repo/ui/components/web';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRef } from 'react';
import { describe, expect, it, vi } from 'vitest';

const CLASSES = [
  { value: 'a', label: 'Grade 6A' },
  { value: 'b', label: 'Grade 6B', hint: 'Mornings' },
  { value: 'c', label: 'Grade 6C', disabled: true },
] as const;

describe('web kit: Checkbox', () => {
  it('is a labelled native checkbox that flips, with its hint as the description', async () => {
    const onChange = vi.fn();
    render(<Checkbox label="Notify parents" hint="By SMS" checked={false} onChange={onChange} />);
    const box = screen.getByRole('checkbox', { name: 'Notify parents' });
    expect(box.getAttribute('aria-describedby')).toBe(screen.getByText('By SMS').id);
    await userEvent.click(screen.getByText('Notify parents'));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('shows the mixed state as indeterminate', () => {
    render(<Checkbox label="All students" checked="mixed" onChange={() => {}} />);
    expect((screen.getByRole('checkbox') as HTMLInputElement).indeterminate).toBe(true);
  });
});

describe('web kit: RadioGroup', () => {
  it('is a fieldset named by its legend; choosing calls onChange', async () => {
    const onChange = vi.fn();
    render(<RadioGroup label="Class" value="a" options={CLASSES} onChange={onChange} />);
    expect(screen.getByRole('group', { name: 'Class' }).tagName).toBe('FIELDSET');
    const radios = screen.getAllByRole('radio') as HTMLInputElement[];
    expect(radios.map((r) => r.checked)).toEqual([true, false, false]);
    expect(radios[2]?.disabled).toBe(true);
    await userEvent.click(screen.getByRole('radio', { name: 'Grade 6B' }));
    expect(onChange).toHaveBeenCalledWith('b');
  });
});

describe('web kit: Select', () => {
  it('is a labelled native select with a placeholder until chosen', async () => {
    const onChange = vi.fn();
    render(
      <Select label="Class" value={null} placeholder="Choose a class" options={CLASSES} onChange={onChange} />,
    );
    const select = screen.getByRole('combobox', { name: 'Class' }) as HTMLSelectElement;
    expect(select.value).toBe('');
    expect(select.hasAttribute('data-empty')).toBe(true);
    await userEvent.selectOptions(select, 'b');
    expect(onChange).toHaveBeenCalledWith('b');
  });

  it('marks an error, describes the field with it and announces it', () => {
    render(<Select label="Class" value="a" options={CLASSES} onChange={() => {}} error="Pick a class" />);
    const select = screen.getByRole('combobox', { name: 'Class' });
    expect(select.getAttribute('aria-invalid')).toBe('true');
    expect(select.getAttribute('aria-describedby')).toBe(screen.getByRole('alert').id);
  });
});

function MenuDemo({ onClose, onDelete }: { onClose: () => void; onDelete: () => void }) {
  const anchor = useRef<HTMLButtonElement>(null);
  return (
    <>
      <button ref={anchor} type="button">
        More
      </button>
      <Menu
        open
        onClose={onClose}
        label="Note options"
        anchorRef={anchor}
        items={[
          { key: 'edit', label: 'Edit', onSelect: () => {} },
          { key: 'pin', label: 'Pin', onSelect: () => {}, disabled: true },
          { key: 'delete', label: 'Delete', onSelect: onDelete, destructive: true },
        ]}
      />
    </>
  );
}

describe('web kit: Menu', () => {
  it('is a named menu; focus starts on the first item and arrows skip disabled ones', async () => {
    render(<MenuDemo onClose={() => {}} onDelete={() => {}} />);
    expect(screen.getByRole('menu', { name: 'Note options' })).toBeTruthy();
    expect(document.activeElement).toBe(screen.getByRole('menuitem', { name: 'Edit' }));
    await userEvent.keyboard('{ArrowDown}');
    expect(document.activeElement).toBe(screen.getByRole('menuitem', { name: 'Delete' }));
    await userEvent.keyboard('{ArrowDown}');
    expect(document.activeElement).toBe(screen.getByRole('menuitem', { name: 'Edit' }));
    await userEvent.keyboard('{End}');
    expect(document.activeElement).toBe(screen.getByRole('menuitem', { name: 'Delete' }));
  });

  it('choosing closes it, returns focus to the control and acts', async () => {
    const onClose = vi.fn();
    const onDelete = vi.fn();
    render(<MenuDemo onClose={onClose} onDelete={onDelete} />);
    await userEvent.click(screen.getByRole('menuitem', { name: 'Delete' }));
    expect(onClose).toHaveBeenCalled();
    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'More' }));
  });
});

describe('web kit: Slider', () => {
  it('is a labelled native range that reads its value aloud and snaps', () => {
    const onChange = vi.fn();
    render(<Slider label="Energy" value={3} min={1} max={5} onChange={onChange} valueText={(v) => `${v} of 5`} />);
    const slider = screen.getByRole('slider', { name: 'Energy' }) as HTMLInputElement;
    expect(slider.getAttribute('aria-valuetext')).toBe('3 of 5');
    expect(slider.style.getPropertyValue('--gd-fill')).toBe('50%');
    fireEvent.change(slider, { target: { value: '4' } });
    expect(onChange).toHaveBeenCalledWith(4);
  });
});
