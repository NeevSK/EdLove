import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '../lib/site';

export function GET() {
  const fullBody = `# ${SITE_NAME} — Complete Epistemic Corpus & Architecture

> ${SITE_DESCRIPTION}

## 1. Vision & Core Philosophy

The EdLove Foundation operates on the premise that education is not an extractive optimization pipeline, but the most fundamental form of communal care work. 

Under the **Convivial Limit** (inspired by Ivan Illich and modern sovereign technology ethics):
1. **Software must lift administrative drudgery**, giving time and energetic bandwidth back to teachers and learners.
2. **Technology must never enclose human life** or replace relational attunement with algorithmic behavior modification.
3. **Offline-First & Local Sovereignty**: Educational tools must operate gracefully during power outages, network drops, and device resource constraints.

---

## 2. The 6 Cosmos Paradigms

EdLove organizes educational transformation across six holistic, interlocking paradigms:

1. **Inner Attunement (Self)**: Somatic grounding, emotional literacy, reflective journaling, and teacher energy stewardship.
2. **Instructional Rhythm (Workspace)**: Classroom flow, peer collaboration, attendance presence, and learning-studio practices.
3. **Open Epistemic Commons (Library)**: Shared educational knowledge, decolonized local curricula, and open-access pedagogy.
4. **Relational Web (Community)**: Compassionate parent-school partnerships, alumni solidarity, and educator mutual aid.
5. **Civic & Ecological Grounding (Place)**: Context-aware learning rooted in village, bioregional, and municipal reality.
6. **Sovereign Infrastructure (Tools)**: Non-extractive digital tools that respect data privacy, local ownership, and zero commercial surveillance.

---

## 3. The Global EdTech Atlas

EdLove curates and maintains an open global atlas of 200 educational technologies, platforms, and pedagogical innovations worldwide. Spanning open-source learning management systems, local-first offline tools, community learning networks, and contemplative pedagogy, the atlas provides an empirical directory of available technologies for educators, researchers, and school leaders.

---

## 4. The Ceylon Research Atlas

An open research and empirical mapping project documenting Sri Lanka's 10,155 state schools, demographic transitions, teacher distribution challenges, student welfare programs (Aswesuma), and digital connectivity frontiers across all 9 provinces and 25 districts.

---

## 5. Gurudevi Integration

Gurudevi (https://gurudevi.app) is an EdLove initiative, built by Intuitui Labs (https://intuituilabs.studio). While EdLove holds the educational philosophy, pedagogy, and research intent, Intuitui Labs engineered the offline-first, local-first software architecture used by schools, teachers, and students.
`;

  return new Response(fullBody, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  });
}
