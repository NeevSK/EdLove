import fs from 'node:fs';

let c = fs.readFileSync('packages/self/src/components/FireJournal.tsx', 'utf8');
c = c.replace("import PositiveInvitation from '@repo/ui/components/PositiveInvitation';\n", "");
c = c.replace("import PositiveInvitation from '@repo/ui/components/PositiveInvitation';", "");
fs.writeFileSync('packages/self/src/components/FireJournal.tsx', c);
console.log('Done FireJournal');
