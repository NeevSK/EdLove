/**
 * Tools Workbench Templates
 *
 * Local canonical templates for interactive classroom utility tools
 * (Spreadsheet inspector, OCR parser, and Resource compiler).
 */

export interface ToolsBundleItem {
  id: string;
  title: string;
  type: string;
  pages: number;
}

export const TOOLS_SAMPLE_CSV = `Subject,Grade,Curriculum Code,Students Enrolled,Status
Mathematics,Grade 10,MATH-LK-10,48,Active
Physical Science,Grade 11,SCI-LK-11,52,Active
Sinhala Literature,Grade 10,SIN-LIT-10,36,Active
Tamil Heritage & Arts,Grade 11,TAM-ART-11,41,Active
English Second Language,Grade 9,ENG-ESL-09,60,Review
Agriculture & Ecology,Grade 10,AGRI-ECO-10,29,Active`;

export const TOOLS_SAMPLE_OCR = `DEPARTMENT OF EDUCATIONAL PUBLICATIONS • SRI LANKA
NATIONAL CURRICULAR FRAMEWORK — GRADE 10 BIOLOGICAL SCIENCES

SECTION 3.2: COASTAL & WETLAND MANGROVE ECOSYSTEMS
Confidence Score: 98.4%
Detected Language: English (Official Translation)
Recognized Blocks: 3 paragraphs, 142 words

Key Botanical Identifiers:
- Rhizophora mucronata (True Mangrove) with arching stilt roots.
- Bruguiera gymnorhiza (Kanda Mangrove) characterized by knee roots.
- Sonneratia caseolaris (Kirala) exhibiting vertical pneumatophores.

Pedagogical Core Concept:
Mangrove ecosystems form the frontline buffer against coastal erosion and serve as nutrient-rich nurseries for marine biodiversity.`;

export const TOOLS_SAMPLE_BUNDLE_ITEMS: readonly ToolsBundleItem[] = [
  { id: '1', title: 'Curricular Unit 3: Mangrove Ecology', type: 'PDF Circular', pages: 12 },
  { id: '2', title: 'Worksheet 3B: Wetland Identification Matrix', type: 'Worksheet', pages: 2 },
  { id: '3', title: 'Laboratory Safety Protocol — Salinity Analysis', type: 'Protocol', pages: 4 },
];
