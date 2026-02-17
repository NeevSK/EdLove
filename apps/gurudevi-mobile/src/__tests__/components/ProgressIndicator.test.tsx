// TDD Unit Tests for ProgressIndicator Component
import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { ProgressIndicator } from '../../components/ProgressIndicator';

describe('ProgressIndicator Component', () => {
    it('renders correct number of dots', () => {
        render(<ProgressIndicator currentStep={0} totalSteps={8} />);
        const dots = screen.getAllByTestId(/progress-dot-/);
        expect(dots).toHaveLength(8);
    });

    it('displays step count text', () => {
        render(<ProgressIndicator currentStep={2} totalSteps={8} />);
        expect(screen.getByText('Step 3 of 8')).toBeTruthy();
    });

    it('hides step count text when showStepCount is false', () => {
        render(<ProgressIndicator currentStep={2} totalSteps={8} showStepCount={false} />);
        expect(screen.queryByText('Step 3 of 8')).toBeNull();
    });
});
