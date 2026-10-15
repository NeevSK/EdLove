import * as fs from 'node:fs';
import * as path from 'node:path';
import { type ParsedMarkdown, parseDocument } from './markdown';

export interface InnovationMeta {
  title: string;
  status?: string;
  created?: string;
  updated?: string;
  author?: string;
  scribe?: string;
  tags?: string[];
  slug: string;
}

export interface ResearchMonographMeta {
  id: string;
  title: string;
  cluster: string;
  author: string;
  year: string;
  summary: string;
  tags: string[];
  localUri: string;
  exists: boolean;
}

export interface LibraryMeta {
  title: string;
  subtitle?: string;
  category: string;
  author?: string;
  order?: number;
  slug: string;
  tags?: string[];
}

export interface CosmosMeta {
  title: string;
  subtitle?: string;
  icon?: string;
  order?: number;
  accentColor?: string;
  origin?: string;
  coreLogic?: string;
  draft?: boolean;
  slug: string;
}

const CONTENT_ROOT = fs.existsSync(path.join(process.cwd(), 'content'))
  ? path.join(process.cwd(), 'content')
  : path.join(process.cwd(), 'apps', 'edlove-web', 'content');

const INNOVATIONS_DIR = path.join(CONTENT_ROOT, 'innovations');
const LIBRARY_DIR = path.join(CONTENT_ROOT, 'library');
const JOURNAL_DIR = path.join(CONTENT_ROOT, 'journal');
const COSMOS_DIR = path.join(CONTENT_ROOT, 'cosmos');

/**
 * Returns all 200 Innovation Dossiers metadata.
 */
export function getAllInnovations(): Array<InnovationMeta & { readingTimeMinutes: number }> {
  if (!fs.existsSync(INNOVATIONS_DIR)) return [];

  const files = fs.readdirSync(INNOVATIONS_DIR).filter((f: string) => f.endsWith('.md'));
  const results: Array<InnovationMeta & { readingTimeMinutes: number }> = [];

  for (const file of files) {
    const slug = file.replace(/\.md$/, '');
    const fullPath = path.join(INNOVATIONS_DIR, file);
    try {
      const content = fs.readFileSync(fullPath, 'utf8');
      const parsed = parseDocument<InnovationMeta>(content);
      results.push({
        ...parsed.frontmatter,
        slug,
        title: parsed.frontmatter.title || slug.replace(/^\d+-/, '').replace(/-/g, ' '),
        readingTimeMinutes: parsed.readingTimeMinutes,
      });
    } catch {
      // Graceful fallback
    }
  }

  return results.sort((a, b) => a.slug.localeCompare(b.slug));
}

/**
 * Retrieves a single Innovation Dossier with parsed HTML.
 */
export function getInnovationBySlug(
  slug: string,
): (ParsedMarkdown<InnovationMeta> & { slug: string }) | null {
  const filePath = path.join(INNOVATIONS_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, 'utf8');
  const parsed = parseDocument<InnovationMeta>(raw);
  return {
    ...parsed,
    slug,
  };
}

/**
 * Returns all Library entries.
 */
export function getAllLibraryEntries(): Array<LibraryMeta & { readingTimeMinutes: number }> {
  if (!fs.existsSync(LIBRARY_DIR)) return [];

  const files = fs
    .readdirSync(LIBRARY_DIR)
    .filter((f: string) => f.endsWith('.md') || f.endsWith('.mdx'));
  const results: Array<LibraryMeta & { readingTimeMinutes: number }> = [];

  for (const file of files) {
    const slug = file.replace(/\.(md|mdx)$/, '');
    const fullPath = path.join(LIBRARY_DIR, file);
    try {
      const content = fs.readFileSync(fullPath, 'utf8');
      const parsed = parseDocument<LibraryMeta>(content);
      results.push({
        ...parsed.frontmatter,
        slug,
        title: parsed.frontmatter.title || slug,
        category: parsed.frontmatter.category || 'framework',
        readingTimeMinutes: parsed.readingTimeMinutes,
      });
    } catch {}
  }

  return results.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

/**
 * Retrieves a single Library Entry.
 */
export function getLibraryEntryBySlug(
  slug: string,
): (ParsedMarkdown<LibraryMeta> & { slug: string }) | null {
  let filePath = path.join(LIBRARY_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) {
    filePath = path.join(LIBRARY_DIR, `${slug}.mdx`);
  }
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, 'utf8');
  const parsed = parseDocument<LibraryMeta>(raw);
  return {
    ...parsed,
    slug,
  };
}

/**
 * Returns all Paradigm Cosmos entries.
 */
export function getAllCosmosEntries(): Array<CosmosMeta & { readingTimeMinutes: number }> {
  if (!fs.existsSync(COSMOS_DIR)) return [];

  const files = fs.readdirSync(COSMOS_DIR).filter((f: string) => f.endsWith('.md'));
  const results: Array<CosmosMeta & { readingTimeMinutes: number }> = [];

  for (const file of files) {
    const slug = file.replace(/\.md$/, '');
    const fullPath = path.join(COSMOS_DIR, file);
    try {
      const content = fs.readFileSync(fullPath, 'utf8');
      const parsed = parseDocument<CosmosMeta>(content);
      if (parsed.frontmatter.draft) continue;
      results.push({
        ...parsed.frontmatter,
        slug,
        title: parsed.frontmatter.title || slug,
        readingTimeMinutes: parsed.readingTimeMinutes,
      });
    } catch {}
  }

  return results.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

/**
 * Retrieves a single Cosmos Entry with rendered HTML.
 */
export function getCosmosEntryBySlug(
  slug: string,
): (ParsedMarkdown<CosmosMeta> & { slug: string }) | null {
  const filePath = path.join(COSMOS_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, 'utf8');
  const parsed = parseDocument<CosmosMeta>(raw);
  return {
    ...parsed,
    slug,
  };
}

/**
 * Canonical Research Monographs from local E:\edresearch substrate.
 */
export const CANONICAL_RESEARCH_MONOGRAPHS: ResearchMonographMeta[] = [
  {
    id: 'LK-RES-EDR-NOBLE-LIE',
    title:
      "The Noble Lie of Universal Quality Education in Sri Lanka: Why Student-Teacher Ratios Don't Predict Outcomes",
    cluster: 'Institutional School Systems & Macroeconomic Audits',
    author: 'Neev Edirisuriya',
    year: '2026',
    summary:
      'Demonstrates why aggregate student-teacher ratios (1:17.5) are a statistical illusion that fails to predict student outcomes. Evaluates the Coleman Paradox and the 373 National vs 9,782 Provincial school gap.',
    tags: ['Coleman Paradox', 'Statistical Illusion', 'Dual System', 'School Funding'],
    localUri:
      'E:/edresearch/sri_lanka_system/The_Noble_Lie_Universal_Quality_Education_Coleman_Paradox.md',
    exists: true,
  },
  {
    id: 'LK-RES-EDR-STRATEGIC-REPORT',
    title:
      'Strategic Analysis: Sri Lanka Education Ecosystem — Market Mapping, Gap Analysis & Opportunity Assessment',
    cluster: 'Institutional School Systems & Macroeconomic Audits',
    author: 'EdLove Research Group',
    year: '2026',
    summary:
      "Comprehensive market and policy mapping of Sri Lanka's 10,155 schools, 4.2M students, and 236K teachers. Unpacks the Rs. 122 Billion shadow private tutoring economy.",
    tags: ['Market Mapping', 'Shadow Education', 'Tuition Economy', 'System Gap Analysis'],
    localUri:
      'E:/edresearch/sri_lanka_system/Sri_Lanka_Education_Ecosystem_Strategic_Report_Builder.js',
    exists: true,
  },
  {
    id: 'LK-RES-EDR-SCHOOLING-CHRONICLE',
    title:
      'Chronicle: Sri Lankan Schooling — Theory, Practice, and the Limits of Reform (1931–2026)',
    cluster: 'Institutional School Systems & Macroeconomic Audits',
    author: 'Neev Edirisuriya',
    year: '2026',
    summary:
      "Longitudinal political economy chronicle: from the 1934-35 malaria epidemic and 1943 Kannangara Free Education report to the 8-year curriculum churn cycles and Stafford Beer's POSIWID systemic dualism.",
    tags: [
      'Kannangara Welfare Compact',
      'POSIWID',
      'Curriculum Churn',
      'Historical Political Economy',
    ],
    localUri: 'E:/edresearch/sri_lanka_system/sri-lanka-schooling-chronicle.md',
    exists: true,
  },
  {
    id: 'PED-SAITOU-SHINTAI',
    title:
      "Takashi Saitou's Bodily Pedagogy: Shintai, Vocal Resonance, and Somatic Attunement in the Classroom",
    cluster: 'Bodily Pedagogy & Triadic Processual Learning Theory',
    author: 'EdLove Research Group',
    year: '2026',
    summary:
      'Deep investigation into bodily pedagogy (Shintai). Explores how posture, vocal resonance, rhythmic breathing, and spatial proximity govern cognitive absorption and emotional safety.',
    tags: ['Takashi Saitou', 'Bodily Pedagogy', 'Vocal Resonance', 'Somatic Learning'],
    localUri: 'E:/edresearch/pedagogy_and_learning_models/saitou_pedagogy_deep_dive.md',
    exists: true,
  },
  {
    id: 'PED-TRIADIC-PROCESS',
    title: 'The Triadic Processual Model of Learning: Beyond Cartesian Cognitive Extraction',
    cluster: 'Bodily Pedagogy & Triadic Processual Learning Theory',
    author: 'Neev Edirisuriya',
    year: '2026',
    summary:
      'Theoretical formulation of learning as a three-way dynamic between Teacher, Learner, and Living Knowledge. Resolves the teacher-learner dichotomy through "Teaning" and reciprocal attunement.',
    tags: ['Triadic Model', 'Process Philosophy', 'Teaning', 'Relational Core'],
    localUri: 'E:/edresearch/pedagogy_and_learning_models/triadic_processual_model_theory.md',
    exists: true,
  },
  {
    id: 'PED-WIRE-PROBLEM',
    title:
      'The Wire Problem: Why Curricula Fail in Transmission and the Geometry of Educational Space',
    cluster: 'Bodily Pedagogy & Triadic Processual Learning Theory',
    author: 'EdLove Research Group',
    year: '2026',
    summary:
      'Examines transmission breakdown when state curricula are treated as inert cables delivering data to passive receivers. Formulates topological archetypes for living learning environments.',
    tags: ['Curriculum Failure', 'Topological Spaces', 'Non-Extractive Learning'],
    localUri: 'E:/edresearch/pedagogy_and_learning_models/the_wire_problem_essay.md',
    exists: true,
  },
  {
    id: 'RES-TEACHER-STRESS',
    title:
      'Teacher Stress, Occupational Friction & Systemic Burnout: Structural Realities of the Sri Lankan Educator',
    cluster: 'Teacher Wellbeing & Relational Dyads',
    author: 'EdLove Research Group',
    year: '2026',
    summary:
      'Surveys psychological and physiological toll on teachers operating under non-academic compliance burdens, centralized surveillance, and curriculum churn.',
    tags: ['Teacher Wellbeing', 'Burnout', 'Occupational Friction', 'Relational Core'],
    localUri: 'E:/edresearch/teacher_wellbeing_and_agency/teacher_stress_and_agency_paper.md',
    exists: true,
  },
  {
    id: 'MET-METHOD-AUDIT',
    title: 'Sri Lankan Education Research: Methodological Audit & Mechanism Deficit Analysis',
    cluster: 'Metaresearch & Epistemic Diagnostics',
    author: 'Neev Edirisuriya',
    year: '2026',
    summary:
      'Examines why educational research in Sri Lanka routinely diagnoses symptoms without addressing generative mechanisms. Formulates a cybernetic audit model.',
    tags: ['Mechanism Deficits', 'Cybernetics', 'Policy Failure', 'Epistemic Audit'],
    localUri: 'E:/edresearch/epistemology_and_philosophy/research_mechanism_deficit_analysis.md',
    exists: true,
  },
];
