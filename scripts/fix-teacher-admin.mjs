import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const p = path.resolve('packages/people/src/components/TeacherAdminWidget.tsx');
let c = fs.readFileSync(p, 'utf8');
c = c.replace(
  '<View className="flex-row items-center" key={row.map((action) => action.label).join(\'|\')} className="gap-2">',
  '<View key={row.map((action) => action.label).join(\'|\')} className="flex-row items-center gap-2">'
);
const tmp = p + '.tmp';
fs.writeFileSync(tmp, c, 'utf8');
execSync(`cmd /c "move /y "${tmp}" "${p}""`);
console.log('Fixed TeacherAdminWidget');
