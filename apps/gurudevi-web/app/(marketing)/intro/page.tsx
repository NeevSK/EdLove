import type { Metadata } from 'next';
import { IntroPageContainer } from './IntroPageContainer';

export const metadata: Metadata = {
  title: 'Walkthrough with Tutti · Gurudevi Sanctuary',
  description:
    'Step-by-step interactive tour with Tutti. Explore the main sanctuary rooms and quick top-bar tools with real time-sequenced flow.',
};

export default function IntroPage() {
  return (
    <main className="min-h-screen bg-stone-950 flex flex-col justify-center items-center px-4 py-8 sm:px-6 sm:py-12">
      <IntroPageContainer />
    </main>
  );
}
