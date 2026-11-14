import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const targets = [
  {
    file: 'packages/people/src/components/TeacherAdminPortalModal.tsx',
    subs: [
      ["import SanctuaryModal from '@repo/ui/components/SanctuaryModal';", "import { Dialog } from '@repo/ui/components/native';"],
      ['<SanctuaryModal\n      isOpen={visible}\n      onClose={onClose}\n      title={title}\n      subtitle="SOVEREIGN MANAGEMENT"\n    >', '<Dialog open={visible} onClose={onClose} title={title} description="SOVEREIGN MANAGEMENT">'],
      ['</SanctuaryModal>', '</Dialog>']
    ]
  },
  {
    file: 'packages/people/src/components/TeacherEchoHistoryModal.tsx',
    subs: [
      ["import SanctuaryModal from '@repo/ui/components/SanctuaryModal';", "import { Dialog } from '@repo/ui/components/native';"],
      ['<SanctuaryModal\n      isOpen={visible}\n      onClose={onClose}\n      title="Feedback Sent"\n      subtitle="TEACHER VOICE & ECHOES"\n    >', '<Dialog open={visible} onClose={onClose} title="Feedback Sent" description="TEACHER VOICE & ECHOES">'],
      ['</SanctuaryModal>', '</Dialog>']
    ]
  },
  {
    file: 'packages/people/src/components/TeacherFeedbackModal.tsx',
    subs: [
      ["import SanctuaryModal from '@repo/ui/components/SanctuaryModal';", "import { Dialog } from '@repo/ui/components/native';"],
      ['<SanctuaryModal\n      isOpen={isOpen}\n      onClose={onClose}\n      title={t(\'teacherFeedback.title\') || \'Voice to Leadership\'}\n      subtitle="ADMINISTRATIVE RECEPTOR"\n    >', '<Dialog open={isOpen} onClose={onClose} title={t(\'teacherFeedback.title\') || \'Voice to Leadership\'} description="ADMINISTRATIVE RECEPTOR">'],
      ['</SanctuaryModal>', '</Dialog>']
    ]
  }
];

for (const t of targets) {
  let content = fs.readFileSync(t.file, 'utf8');
  for (const [find, replace] of t.subs) {
    content = content.replace(find, replace);
  }
  const fullPath = path.resolve(t.file).replace(/\//g, '\\');
  const tmpPath = `${fullPath}.tmp`;
  fs.writeFileSync(tmpPath, content, 'utf8');
  execSync(`cmd.exe /c move /y "${tmpPath}" "${fullPath}"`);
  console.log(`Updated ${t.file}`);
}
