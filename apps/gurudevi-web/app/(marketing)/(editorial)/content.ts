export type JournalEntry = {
  slug: string;
  title: string;
  subtitle: string;
  authorId: string;
  author: string;
  language: string;
  topics: string[];
  publishDate: string;
  readingTime?: number;
  contentKind: 'original' | 'curated';
  source?: string;
  license: string;
  sections: ReadonlyArray<{ heading?: string; paragraphs: ReadonlyArray<string>; bullets?: ReadonlyArray<string> }>;
};

export type Author = {
  id: string;
  displayName: string;
  biography: string;
  attributionName: string;
  note: string;
};

export const authors: ReadonlyArray<Author> = [
  { id: 'gurudevi', displayName: 'Gurudevi', biography: 'Gurudevi is a contemplative learning space for inner development, meaningful work, and compassionate community.', attributionName: 'Gurudevi', note: 'Gurudevi publishes writing rooted in practice, reflection, and care.' },
  { id: 'naveen', displayName: 'Naveen', biography: 'Founder and builder at EdLove & Gurudevi, focused on educational philosophy, contemplative technology, and teacher sovereignty.', attributionName: 'Naveen', note: 'Naveen writes on educational philosophy, non-extractive technology, and the cultivation of sovereign learning ecosystems.' },
];

export const journalEntries: ReadonlyArray<JournalEntry> = [
  {
    slug: 'why-gurudevi-begins-with-care', title: 'Why Gurudevi Begins with Care', subtitle: 'The people around learning deserve support that gives energy back rather than asking them to carry more.', authorId: 'gurudevi', author: 'Gurudevi', language: 'en', topics: ['care', 'education-ecology', 'teacher-support'], publishDate: '2026-08-31', readingTime: 3, contentKind: 'original', license: 'All rights reserved',
    sections: [
      { paragraphs: ['Schools are held together by people doing more than their job descriptions can name. Teachers prepare late, families carry worry, students navigate pressure, and principals make decisions with incomplete pictures.', 'Gurudevi begins with a simple belief: support should give energy back to the people who make learning possible.', 'That means building useful shared understanding without turning people into surveillance subjects. It means making room for reflection alongside coordination. It means treating learners, teachers, families, and school leaders as participants in one ecology rather than isolated accounts in a system.', 'The platform is still becoming. The promise is already clear: technology should help education become more human, more connected, and more worthy of care.'] },
    ],
  },
  {
    slug: 'meaning-of-gurudevi', title: 'The Meaning of Gurudevi', subtitle: 'The divine teacher: the one who cultivates the sacred conditions for life to bloom.', authorId: 'naveen', author: 'Naveen', language: 'en', topics: ['meaning', 'divine-teacher', 'teaning', 'care-work', 'philosophy'], publishDate: '2026-09-01', readingTime: 3, contentKind: 'original', license: 'CC BY-SA 4.0',
    sections: [
      { paragraphs: ['The name Gurudevi (ගුරු දෙවි) draws from a deep and ancient cultural memory: the understanding that teaching is not a mechanical transaction, but a sacred covenant of human care.', 'In its truest essence, Gurudevi means The Divine Teacher — the one who cultivates the fertile ground for life to bloom.'] },
      { heading: 'Guru (ගුරු): The Illuminating Presence', paragraphs: ['In classical Sanskrit and Sinhala traditions, Gu represents the veil of darkness, unseeing, or hesitation, while Ru signifies the living light that dispels and clarifies.', 'A Guru is an anchor of orientation. They do not merely deliver syllabus points; they hold steady, compassionate space so that learners can discover their own footing.'] },
      { heading: 'Devi (දෙවි): The Living Spark of the Sacred', paragraphs: ['Devi speaks to the sacred, celestial quality inherent in acts of selfless stewardship. It echoes the venerable cultural reverence Guru Devo Bhava (ගුරු දේවෝ භව) that honors the teacher as a generative presence in human civilization.', 'When an educator meets a learner with wholehearted presence, deep listening, and patient encouragement, something luminous takes root.'] },
      { heading: 'Teaning: Where the Circuit Completes', paragraphs: ['In Gurudevi, this sacred quality dissolves the artificial barrier between teacher and student. In every transformative moment of learning, the educator learns, and the learner teaches.'] },
      { paragraphs: ['Gurudevi is the honoring of this sacred resonance: whenever two human beings meet in the spirit of true learning, the divine is already present in the room.'] },
    ],
  },
  {
    slug: 'what-is-gurudevi-app', title: 'What is the Gurudevi App?', subtitle: 'A digital sanctuary and education ecology support system built for teachers, students, schools, and families.', authorId: 'naveen', author: 'Naveen', language: 'en', topics: ['education-ecology', 'sanctuary', 'teaning', 'teacher-dignity', 'app-architecture'], publishDate: '2026-09-01', readingTime: 4, contentKind: 'original', license: 'CC BY-SA 4.0',
    sections: [
      { paragraphs: ['When educators and school leaders first encounter the Gurudevi app, they often look for a familiar category. The simplest answer is that Gurudevi is an education ecology support system.', 'It is designed to protect the dignity of teachers, nurture the agency of students, support families, and give energy back to everyone participating in the learning journey.'] },
      { heading: 'Digital Sanctuary: Calm, Sovereign, Non-Extractive', paragraphs: ['Most educational software is modeled after the industrial assembly line: surveillance dashboards, high-friction compliance forms, and intrusive notifications. The Gurudevi app begins from a different posture: Sanctuary.'], bullets: ['Calm, uncluttered spaces where educators can prepare, reflect, and coordinate without cognitive overwhelm.', 'Privacy by architecture: inner reflections and personal notes are never harvested as institutional surveillance.', 'Support before extraction: every feature is built to return more energy to the user than it takes to maintain.'] },
      { heading: 'Built for Sri Lankan Realities, Ready for the World', paragraphs: [], bullets: ['Offline-first architecture for unstable or intermittent internet connectivity.', 'Trilingual native fluency in Sinhala (සිංහල), Tamil (தமிழ்), and English.', 'The Thuthimal (තුතිමල්) economy: reciprocal support for teachers out of gratitude and honor.'] },
      { heading: 'One Ecology, Many Centers of Practice', paragraphs: ['Teachers find dignity and craft tools. Students find sovereignty and curiosity. School leaders find clear systemic patterns for supportive leadership. Families find genuine partnership in their children’s growth.'] },
    ],
  },
  {
    slug: 'architecture-of-gratitude', title: 'The Architecture of Gratitude: Why Education Needs a Gift Economy', subtitle: 'Moving beyond transactional subscriptions toward reciprocal care for sovereign teachers.', authorId: 'naveen', author: 'Naveen', language: 'en', topics: ['gift-economy', 'thuthimal', 'teacher-patronage', 'reciprocal-care', 'economics'], publishDate: '2026-09-02', readingTime: 4, contentKind: 'original', license: 'CC BY-SA 4.0',
    sections: [
      { paragraphs: ['In modern economic theory, software is almost exclusively delivered through transactional subscriptions or ad-supported data harvesting. When applied to education, both models fail our teachers.', 'Teaching has never been an ordinary commercial service. In classical traditions, education was understood as a sacred social covenant where society took collective responsibility for educators.'] },
      { heading: 'Reclaiming the Gift Economy (Thuthimal)', paragraphs: ['In a gift economy, value is measured by its capacity to sustain life, community, and reciprocal care across generations.'], bullets: ['The Gift of Tools: communities sponsor sovereign, pro-grade tools for teachers as an act of gratitude.', 'Cross-Generational Care: a former student can sponsor a teacher’s digital sanctuary years later.', 'Dignity Over Charity: reciprocal honor acknowledges what a teacher gives to civilization.'] },
      { heading: 'The Future of Sustainable Education', paragraphs: ['When we ground software in gratitude rather than extraction, the architecture transforms: no incentive for ads or behavioral harvesting, no manipulative retention loops, and a self-reinforcing circle of mutual respect.'] },
    ],
  },
  {
    slug: 'beyond-extractive-classroom', title: 'Beyond the Extractive Classroom: The Rise of Contemplative & Local-First EdTech', subtitle: 'An empirical look at the global landscape of offline software, slow education, and the search for digital stillness.', authorId: 'naveen', author: 'Naveen', language: 'en', topics: ['local-first', 'contemplative-edtech', 'slow-education', 'teacher-dignity', 'global-landscape'], publishDate: '2026-09-02', readingTime: 4, contentKind: 'curated', source: 'https://edlove.org/journal/beyond-extractive-classroom', license: 'CC BY-SA 4.0',
    sections: [
      { paragraphs: ['For over two decades, educational software has been designed around compliance, surveillance, and engagement metrics. Yet across the world, a quiet counter-movement asks whether technology can serve genuine pedagogical dignity.'] },
      { heading: 'The Slowness Movement in a Fast World', paragraphs: ['The Slow Education movement argues for understanding over coverage. Researchers in contemplative technopedagogy ask whether digital surfaces can introduce reflective pauses rather than dopamine loops.'] },
      { heading: 'Local-First vs. Cloud Surveillance', paragraphs: [], bullets: ['Local state as primary: the device is the single source of truth.', 'Optional and encrypted sync when connectivity is available.', 'Sovereign privacy: reflections and observations belong to the school community.'] },
      { heading: 'Grounding in the Gurudevi Ecosystem', paragraphs: ['By combining offline-first local state with calm, intentional micro-interactions, teachers never need to fight the tool or worry about network drops during moments of deep student connection.'] },
    ],
  },
];

export function getJournalEntry(slug: string) { return journalEntries.find((entry) => entry.slug === slug); }
export function getAuthor(id: string) { return authors.find((author) => author.id === id); }
