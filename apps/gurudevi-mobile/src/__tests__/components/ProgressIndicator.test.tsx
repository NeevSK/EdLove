// TDD Unit Tests for ProgressIndicator Component
import React from 'react';
import { render } from '@testing-library/react-native';
import { ProgressIndicator } from '@repo/ui';

describe('ProgressIndicator Component', () => {
    it('renders correct number of dots', async () => {
        const { getAllByTestId } = await render(<ProgressIndicator currentStep={0} totalSteps={8} />);
        const dots = getAllByTestId(/progress-dot-/);
        expect(dots).toHaveLength(8);
    });

    it('displays step count text', async () => {
        const { getByText } = await render(<ProgressIndicator currentStep={2} totalSteps={8} />);
        expect(getByText('Step 3 of 8')).toBeTruthy();
    });

    it('hides step count text when showStepCount is false', async () => {
        const { queryByText } = await render(<ProgressIndicator currentStep={2} totalSteps={8} showStepCount={false} />);
        expect(queryByText('Step 3 of 8')).toBeNull();
    });
});
