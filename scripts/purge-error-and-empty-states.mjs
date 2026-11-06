import fs from 'node:fs';

const targets = [
  {
    file: 'packages/community/src/screens/BaseChatScreen.tsx',
    subs: [
      ["import { ErrorState as BrandedErrorState } from '@repo/ui/components/ErrorState';", "import { ErrorState } from '@repo/ui/components/native';"],
      ['if (!principalId) return <BrandedErrorState title="Sign in to open this conversation" />;', 'if (!principalId) return <ErrorState title="Sign in to open this conversation" message="An active session is required to participate." />;']
    ]
  },
  {
    file: 'packages/community/src/screens/chatPresentation.tsx',
    subs: [
      ["import { ErrorState as BrandedErrorState } from '@repo/ui/components/ErrorState';", "import { ErrorState } from '@repo/ui/components/native';"],
      ['<BrandedErrorState\n        title="Messages could not settle"\n        message={\n          error?.message ?? \'No saved history is available. Enable live access to load messages.\'\n        }\n      >\n        <Pressable\n          onPress={() => void retry()}\n          accessibilityRole="button"\n          accessibilityLabel="Try loading messages again"\n        >\n          <Text className="text-phase-interactive font-bold">Try again</Text>\n        </Pressable>\n      </BrandedErrorState>', '<ErrorState\n        title="Messages could not settle"\n        message={error?.message ?? \'No saved history is available. Enable live access to load messages.\'}\n        retry={{ label: \'Try again\', onPress: () => void retry() }}\n      />']
    ]
  },
  {
    file: 'packages/self/src/components/SelfNavigator.tsx',
    subs: [
      ["import { BrandedEmptyState } from '@repo/ui/components/BrandedEmptyState';", "import { EmptyState, ErrorState } from '@repo/ui/components/native';"],
      ["import { ErrorState as BrandedErrorState } from '@repo/ui/components/ErrorState';", ""],
      ['<BrandedErrorState title="Spaces are resting" message={error.message}>\n        {onRetry ? (\n          <Pressable\n            onPress={onRetry}\n            accessibilityRole="button"\n            className="px-4 py-2 rounded-full"\n            style={{\n              backgroundColor: tokens.colors.surfaceElevated,\n              borderWidth: 1,\n              borderColor: tokens.colors.border,\n            }}\n          >\n            <Text className="text-xs font-bold" style={{ color: tokens.colors.ink }}>\n              Try again\n            </Text>\n          </Pressable>\n        ) : null}\n      </BrandedErrorState>', '<ErrorState title="Spaces are resting" message={error.message} retry={onRetry ? { label: "Try again", onPress: onRetry } : undefined} />'],
      ['<BrandedEmptyState\n        title="A quiet space is ready"\n        message="Your Self spaces will appear here when they have something to share."\n        subtle\n      />', '<EmptyState\n        title="A quiet space is ready"\n        message="Your Self spaces will appear here when they have something to share."\n      />']
    ]
  },
  {
    file: 'packages/self/src/components/BaseSelfView.tsx',
    subs: [
      ["import { BrandedEmptyState } from '@repo/ui/components/BrandedEmptyState';", "import { EmptyState } from '@repo/ui/components/native';"],
      ['<BrandedEmptyState', '<EmptyState'],
      ['</BrandedEmptyState>', '</EmptyState>']
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
