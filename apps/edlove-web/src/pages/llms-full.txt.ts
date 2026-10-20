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

## 3. The 200 Educational Innovations Archive

EdLove curates and maintains an open catalog of 200 transformative global educational innovations. Spanning community learning centers, multi-age classrooms, contemplative pedagogy, democratic schools, and open-source learning hardware, the archive provides empirical case studies for school leaders and educational researchers.

---

## 4. The Ceylon Research Atlas

An open research and empirical mapping project documenting Sri Lanka's 10,155 state schools, demographic transitions, teacher distribution challenges, student welfare programs (Aswesuma), and digital connectivity frontiers across all 9 provinces and 25 districts.

---

## 5. Gurudevi Integration

Gurudevi (https://gurudevi.app) is the operational realization of the EdLove philosophy for Sri Lanka. While EdLove.org serves as the public epistemic and research foundation, Gurudevi provides the live software sanctuary used daily by schools, teachers, and students.
`;

  return new Response(fullBody, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  });
}
