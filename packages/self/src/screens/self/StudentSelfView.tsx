import { useBanyanGrowth } from '@repo/core/hooks';
import { usePermissions, useStore } from '@repo/core/logic';
import { BaseSelfView } from '@repo/self/components/BaseSelfView';
import { resolveFeatureContent } from '@repo/self/components/FeatureRegistry';
import WelcomeModal from '@repo/self/components/WelcomeModal';
import { useJournalEntries } from '@repo/self/hooks/useJournalEntries';
import { useMoodLogs } from '@repo/self/hooks/useMoodLogs';
import { useSanctuaryRegistry } from '@repo/self/hooks/useSanctuaryRegistry';
import { JournalSection, MoodSection, StudentPulse } from '@repo/self/views/sections';
import ScreenWrapper from '@repo/ui/components/ScreenWrapper';
import { VStack } from '@repo/ui/primitives';
import { useTranslation } from 'react-i18next';

/**
 * StudentSelfView - Refactored for 2026: Clean Injection Pattern.
 */
export default function StudentSelfView() {
  const { t } = useTranslation();
  const { context } = usePermissions();
  const userId = context.userId;

  const { domains: registeredDomains } = useSanctuaryRegistry();

  // Shared State/Data
  const { logs: moodHistory, isLoading: loadingMoods } = useMoodLogs(userId ?? undefined);
  const { entries: journalEntries, loading: loadingJournals } = useJournalEntries();
  const { banyan, isLoading: banyanLoading } = useBanyanGrowth();

  const justFinishedOnboarding = useStore((state) => state.justFinishedOnboarding);
  const setJustFinishedOnboarding = useStore((state) => state.setJustFinishedOnboarding);

  const domainContent = registeredDomains.map((domain) => {
    // Custom handling for the Journey domain (Holistic)
    if (domain.id === 'journey') {
      return {
        ...domain,
        content: (
          <VStack space="lg" style={{ padding: 20 }}>
            <JournalSection entries={journalEntries} loading={loadingJournals} />
            <MoodSection logs={moodHistory} loading={loadingMoods} />
            <StudentPulse banyan={banyan} loading={banyanLoading} />
          </VStack>
        ),
      };
    }

    // Use the Registry for other standard features
    const features = domain.features.map((fId) => ({
      id: fId,
      label: fId.replace('_', ' '), // Default label, registry might override
      content: resolveFeatureContent(fId, userId ?? undefined),
      // Specific history overrides if needed
      historyContent:
        fId === 'fire_journal' ? <JournalSection entries={journalEntries} /> : undefined,
    }));

    return { ...domain, features };
  });

  return (
    <ScreenWrapper scroll={false} noTopInset={true}>
      <BaseSelfView
        perspective="student"
        description={t('self.studentDescription')}
        domains={domainContent as any}
      />
      <WelcomeModal
        isOpen={justFinishedOnboarding}
        onClose={() => setJustFinishedOnboarding(false)}
      />
    </ScreenWrapper>
  );
}
