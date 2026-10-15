import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Our Focus | EdLove Foundation',
  description:
    'Explore EdLove Foundation’s five core focus pillars: Philosophy of Education, EdTech & Digital Sanctuaries, Education Research, Educational Interventions, and Civic Solidarity.',
};

export default function FocusPage() {
  const focusPillars = [
    {
      id: 'philosophy',
      number: '01',
      badge: 'Epistemic Foundation',
      title: 'Philosophy of Education',
      subtitle: 'Education as Care, Sovereignty, and Relational Resonance',
      icon: '🌱',
      summary:
        'We challenge the industrialized paradigm of education as a market commodity. Learning is fundamentally relational care work that honors the dignity of teachers and sovereignty of learners.',
      keyPoints: [
        'Moving from the factory model of standardization to the organic model of the sanctuary.',
        'Integrating contemplative traditions, decolonial pedagogy, and ecological consciousness.',
        'The concept of "Teaning": dissolving the binary of teaching and learning into shared flow.',
      ],
      actionLink: { text: 'Explore the Pedagogical Library', href: '/pedagogy' },
    },
    {
      id: 'edtech',
      number: '02',
      badge: 'Soulful Technology',
      title: 'EdTech & Digital Sanctuaries',
      subtitle: 'Calm, Non-Extractive Tools Built for Human Dignity',
      icon: '✨',
      summary:
        'Most educational technology is designed for surveillance, gamification, and compliance. We build digital sanctuaries designed for stillness, craft, and empowerment.',
      keyPoints: [
        'Gurudevi: A dedicated digital sanctuary built specifically for educators and learners.',
        'Zero-surveillance, offline-first architectures prioritizing learner privacy and peace of mind.',
        'Tactile user experiences treating technology as a sacred instrument rather than an addictive feed.',
      ],
      actionLink: { text: 'Explore Educational Vision', href: '/vision' },
    },
    {
      id: 'research',
      number: '03',
      badge: 'Ground Diagnostics',
      title: 'Education Research',
      subtitle: 'Rigorous Field Studies & Unveiling Structural Realities',
      icon: '📊',
      summary:
        'Sentimental reform fails because it ignores political economy. We produce rigorous empirical research on shadow tuition economies, funding disparities, and teacher burnout.',
      keyPoints: [
        'The Noble Lie monograph: Exploding the myth of aggregate student-teacher ratios.',
        "Macroeconomic audits tracking Sri Lanka's Rs. 122 Billion shadow tutoring apparatus.",
        'The Sri Lanka Education Atlas ("Urumaya"): 9,962 geocoded schools with multi-year census tracking.',
      ],
      actionLink: { text: 'Explore Education Research Hub', href: '/research' },
    },
    {
      id: 'interventions',
      number: '04',
      badge: 'Direct Praxis',
      title: 'Educational Interventions',
      subtitle: 'Classroom Pilots, Teacher Circles & Systemic Prototypes',
      icon: '🤝',
      summary:
        'We bridge theoretical research with living classroom reality through localized pilots, somatic movement interventions, and teacher support circles.',
      keyPoints: [
        'Anavaratha Framework: Somatic, vocal, and emotional restorative circles for stressed educators.',
        'Living Learning Environments: Designing spatial topologies that eliminate curriculum transmission failure.',
        'Local community sanghas connecting parents, alumni, and village temples in educational stewardship.',
      ],
      actionLink: { text: 'Explore Urumaya Atlas Manifestation', href: '/atlas' },
    },
    {
      id: 'solidarity',
      number: '05',
      badge: 'Care Flow & Solidarity',
      title: 'Civic Solidarity & Educational Support',
      subtitle: 'Direct-to-Need Sponsorships, Material Relief & Endowments',
      icon: '🕊️',
      summary:
        'No child should abandon education due to poverty. We channel transparent, decentralized philanthropic care to vulnerable students, rural schools, and struggling educators.',
      keyPoints: [
        'Direct-to-student meal stipends and learning material kits for estate and rural primary schools.',
        'Emergency teacher relief endowments supporting educators facing acute hardship.',
        'Transparent mutual-aid care flows with 100% open-ledger accountability.',
      ],
      actionLink: { text: 'Learn About Foundation Solidarity', href: '/research' },
    },
  ];

  return (
    <div className="min-h-screen bg-[#faf8f5] text-[#1a1714] font-serif selection:bg-[#a85022]/20">
      <main className="max-w-5xl mx-auto px-6 py-12 sm:py-16 space-y-16">
        <header className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-block px-3 py-1 bg-[#fbf0e8] border border-[#f0d6c5] rounded-full text-xs uppercase font-mono font-bold tracking-widest text-[#a85022]">
            EdLove Strategic Architecture
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-[#1a1714]">
            Our Five Focus Pillars
          </h1>
          <p className="text-base sm:text-lg text-[#615951] leading-relaxed font-sans">
            A comprehensive, non-extractive blueprint uniting educational philosophy, sovereign
            software tooling, ground-truthed research, living classroom interventions, and
            transparent civic solidarity.
          </p>
        </header>

        <div className="space-y-10">
          {focusPillars.map((pillar) => (
            <article
              key={pillar.id}
              id={pillar.id}
              className="p-8 rounded-3xl bg-[#fffefb] border border-[#ebdccb] shadow-xs space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#ebdccb]/60 pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-[#a85022]">
                      {pillar.number}
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-[#fbf0e8] text-[#a85022] border border-[#f0d6c5]">
                      {pillar.badge}
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-[#1a1714] flex items-center gap-2">
                    <span>{pillar.icon}</span>
                    <span>{pillar.title}</span>
                  </h2>
                  <p className="text-sm text-[#8e857b] italic mt-0.5 font-serif">
                    {pillar.subtitle}
                  </p>
                </div>

                <Link
                  href={pillar.actionLink.href}
                  className="self-start sm:self-auto px-4 py-2 rounded-xl bg-[#faf8f5] hover:bg-[#f5eee1] border border-[#ebdccb] text-xs font-sans font-bold text-[#a85022] transition-colors whitespace-nowrap"
                >
                  {pillar.actionLink.text} ➔
                </Link>
              </div>

              <p className="text-base text-[#423c35] leading-relaxed font-sans">{pillar.summary}</p>

              <ul className="space-y-2 text-sm text-[#615951] font-sans">
                {pillar.keyPoints.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="text-[#a85022] font-bold">✓</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}
