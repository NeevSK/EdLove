import { AuthFrame } from '../auth/AuthFrame';
import { OnboardingForm } from './OnboardingForm';

export const metadata = { title: 'Complete enrollment' };

export default function OnboardingPage() {
  return (
    <AuthFrame
      description="Choose the capacity through which you first enter Gurudevi. This establishes your private Personal Sanctuary scope."
      title="Begin your sanctuary"
    >
      <OnboardingForm />
    </AuthFrame>
  );
}
