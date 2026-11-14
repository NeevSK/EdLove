import fs from 'node:fs';

let c1 = fs.readFileSync('packages/admin/src/screens/EnhancedAnalyticsDashboard.web.tsx', 'utf8');
c1 = c1.replace("import { Card } from '@repo/ui/components/SanctuaryCard';", "");
c1 = c1.replace(/<Card[^>]*>/g, '<div className="p-4 rounded-2xl border border-phase-border bg-phase-surface">');
c1 = c1.replace(/<\/Card>/g, '</div>');
fs.writeFileSync('packages/admin/src/screens/EnhancedAnalyticsDashboard.web.tsx', c1);

let c2 = fs.readFileSync('packages/self/src/components/BaseSelfView.web.tsx', 'utf8');
c2 = c2.replace("import { SanctuaryCard } from '@repo/ui/components/SanctuaryCard';", "");
c2 = c2.replace(/<SanctuaryCard[^>]*>/g, '<div className="p-4 rounded-2xl border border-phase-border bg-phase-surface">');
c2 = c2.replace(/<\/SanctuaryCard>/g, '</div>');
fs.writeFileSync('packages/self/src/components/BaseSelfView.web.tsx', c2);

console.log('SanctuaryCard web screens purged');
