import fs from 'node:fs';

let c1 = fs.readFileSync('packages/self/src/screens/SelfScreen.unified.tsx', 'utf8');
c1 = c1.replace("import { BrandedEmptyState } from '@repo/ui/components/BrandedEmptyState';", "");
c1 = c1.replace("import { ErrorState as BrandedErrorState } from '@repo/ui/components/ErrorState';", "");
c1 = c1.replace("import { WaitingSign } from '@repo/ui/components/native';", "import { EmptyState, ErrorState, WaitingSign } from '@repo/ui/components/native';");
c1 = c1.replace(/<BrandedErrorState([^>]*)\/>/g, '<ErrorState$1 />');
c1 = c1.replace(/<BrandedEmptyState([^>]*)\/>/g, '<EmptyState$1 />');
fs.writeFileSync('packages/self/src/screens/SelfScreen.unified.tsx', c1);

let c2 = fs.readFileSync('packages/self/src/components/BaseSelfView.web.tsx', 'utf8');
c2 = c2.replace("import { BrandedEmptyState } from '@repo/ui/components/BrandedEmptyState';", "");
c2 = c2.replace(/<BrandedEmptyState[^>]*title=([^>]*)(\/>|<\/BrandedEmptyState>)/g, '<div className="p-6 text-center text-phase-text-secondary">$1</div>');
fs.writeFileSync('packages/self/src/components/BaseSelfView.web.tsx', c2);

console.log('SelfScreen.unified & BaseSelfView.web purged');
