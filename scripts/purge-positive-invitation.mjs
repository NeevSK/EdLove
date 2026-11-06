import fs from 'node:fs';

const targets = [
  {
    file: 'packages/self/src/components/DailyRhythm.tsx',
    subs: [
      ["import PositiveInvitation from '@repo/ui/components/PositiveInvitation';", "import { EmptyState } from '@repo/ui/components/native';"],
      ['<PositiveInvitation\n              icon={Clock}\n              title={t(\'self.noClasses\') || \'Undetermined Flow\'}\n              description={\n                t(\'self.addLesson\') || \'Map your daily rhythm to surface moments of focus.\'\n              }\n            />', '<EmptyState\n              title={t(\'self.noClasses\') || \'Undetermined Flow\'}\n              message={t(\'self.addLesson\') || \'Map your daily rhythm to surface moments of focus.\'}\n            />']
    ]
  },
  {
    file: 'packages/self/src/components/DecisionJournalSection.tsx',
    subs: [
      ["import PositiveInvitation from '@repo/ui/components/PositiveInvitation';", "import { EmptyState } from '@repo/ui/components/native';"],
      ['return <PositiveInvitation type="anonymous" />;', 'return <EmptyState title="Sign in to record decisions" message="Guest accounts cannot persist journal decisions." />;']
    ]
  },
  {
    file: 'packages/self/src/components/EnergyForecast.tsx',
    subs: [
      ["import PositiveInvitation from '@repo/ui/components/PositiveInvitation';", "import { EmptyState } from '@repo/ui/components/native';"],
      [/<PositiveInvitation[^>]*\/>/g, '<EmptyState title="Sign in to view energy rhythm" message="Guest accounts do not retain forecast telemetry." />']
    ]
  },
  {
    file: 'packages/self/src/components/TomorrowPrep.tsx',
    subs: [
      ["import PositiveInvitation from '@repo/ui/components/PositiveInvitation';", "import { EmptyState } from '@repo/ui/components/native';"],
      [/<PositiveInvitation[^>]*\/>/g, '<EmptyState title="Sign in to prepare tomorrow" message="Guest accounts do not retain prep checklists." />']
    ]
  },
  {
    file: 'packages/self/src/components/WindDownRitual.tsx',
    subs: [
      ["import PositiveInvitation from '@repo/ui/components/PositiveInvitation';", "import { EmptyState } from '@repo/ui/components/native';"],
      [/<PositiveInvitation[^>]*\/>/g, '<EmptyState title="Sign in to complete wind-down" message="Guest accounts do not retain ritual telemetry." />']
    ]
  },
  {
    file: 'packages/self/src/screens/self/FounderSelfView.tsx',
    subs: [
      ["import PositiveInvitation from '@repo/ui/components/PositiveInvitation';", "import { EmptyState } from '@repo/ui/components/native';"],
      ['<PositiveInvitation\n                    context="self"\n                    title={t(\'founder.visionComingSoon\')}\n                    description={t(\'founder.visionComingSoonDesc\')}\n                  />', '<EmptyState\n                    title={t(\'founder.visionComingSoon\')}\n                    message={t(\'founder.visionComingSoonDesc\')}\n                  />']
    ]
  },
  {
    file: 'packages/self/src/screens/self/PrincipalSelfView.tsx',
    subs: [
      ["import PositiveInvitation from '@repo/ui/components/PositiveInvitation';", "import { EmptyState } from '@repo/ui/components/native';"],
      ['<PositiveInvitation\n                    context="self"\n                    title={t(\'principal.monthlyComingSoon\')}\n                    description={t(\'principal.monthlyComingSoonDesc\')}\n                  />', '<EmptyState\n                    title={t(\'principal.monthlyComingSoon\')}\n                    message={t(\'principal.monthlyComingSoonDesc\')}\n                  />']
    ]
  },
  {
    file: 'packages/self/src/components/BaseSelfView.tsx',
    subs: [
      ["import PositiveInvitation from '@repo/ui/components/PositiveInvitation';", ""],
      [/<PositiveInvitation[^>]*\/>/g, '<EmptyState title="Sign in to explore spaces" message="Create an account to retain your personal spaces and rhythm." />']
    ]
  },
  {
    file: 'packages/self/src/components/BaseSelfView.web.tsx',
    subs: [
      ["import PositiveInvitation from '@repo/ui/components/PositiveInvitation';", ""],
      [/<PositiveInvitation[^>]*\/>/g, '<div className="p-8 text-center text-phase-text-secondary font-bold">Sign in to explore spaces</div>']
    ]
  }
];

for (const t of targets) {
  let content = fs.readFileSync(t.file, 'utf8');
  for (const [find, replace] of t.subs) {
    content = content.replace(find, replace);
  }
  fs.writeFileSync(t.file, content, 'utf8');
  console.log(`Updated ${t.file}`);
}
