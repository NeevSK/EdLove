import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { FloorRedesignClient } from '../../../app/(sanctuary)/kit/floor-redesign/FloorRedesignClient';

describe('FloorRedesignClient Component', () => {
  it('renders the floor redesign laboratory and default dynamic capsule archetype', () => {
    render(<FloorRedesignClient />);
    expect(screen.getByText(/Floor Reception & Spatial Control Redesign/i)).toBeTruthy();
    expect(screen.getAllByText(/Good afternoon, Guest Explorer/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Idea 1: Dynamic Capsule/i)).toBeTruthy();
  });

  it('switches between archetypes and updates spatial metrics', () => {
    render(<FloorRedesignClient />);
    const baselineBtn = screen.getByRole('button', { name: /Current Baseline/i });
    fireEvent.click(baselineBtn);

    // In baseline mode, multiple scattered buttons appear
    expect(screen.getAllByText(/Arrange Floor/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Floor Studio/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Violates VSR/i)).toBeTruthy();
  });

  it('opens and closes the three-dots floor studio panel drawer', () => {
    render(<FloorRedesignClient />);
    
    // Switch to capsule
    const capsuleBtn = screen.getByRole('button', { name: /Idea 1: Dynamic Capsule/i });
    fireEvent.click(capsuleBtn);

    const dotsTrigger = screen.getByLabelText(/Open comprehensive Floor Studio/i);
    fireEvent.click(dotsTrigger);

    // Drawer should open with all tabs
    expect(screen.getByText(/Floor Studio & Customization/i)).toBeTruthy();
    expect(screen.getByRole('button', { name: /Atmosphere & Scene/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Layout & Sections/i })).toBeTruthy();

    // Close the drawer
    const closeBtn = screen.getByLabelText(/Close Floor Studio/i);
    fireEvent.click(closeBtn);
    expect(screen.queryByText(/Floor Studio & Customization/i)).toBeNull();
  });

  it('renders Idea 6 Angular Horizon and dynamically adapts subtasks per domain', () => {
    render(<FloorRedesignClient />);

    // Switch to Idea 6 Angular
    const angularBtn = screen.getByRole('button', { name: /Idea 6: Angular Precision/i });
    fireEvent.click(angularBtn);

    expect(screen.getByText(/Flat Slender Bars/i)).toBeTruthy();
    expect(screen.getByText(/SELF TABS:/i)).toBeTruthy();
    expect(screen.getByRole('button', { name: /⚡ Daily Rhythm/i })).toBeTruthy();

    // Click Workspace Realm Tab
    const workspaceTab = screen.getByRole('button', { name: /🏫 Workspace/i });
    fireEvent.click(workspaceTab);

    // Subtasks should dynamically morph to Workspace domain!
    expect(screen.getByText(/WORKSPACE TABS:/i)).toBeTruthy();
    expect(screen.getByRole('button', { name: /📋 Gradebook/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /🧑‍🏫 Attendance/i })).toBeTruthy();
  });
});
