import { mkdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';

const require = createRequire(resolve(process.cwd(), 'packages/library/package.json'));
const { strToU8, zipSync } = require('fflate');
const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');

const outDir = resolve(process.cwd(), 'apps/gurudevi-web/public/samples');
mkdirSync(outDir, { recursive: true });

// 1. Real 3-page PDF
async function buildPdf() {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const pages = [
    [
      'Gurudevi Open Library',
      'Field Guide to Sri Lankan Mangrove Ecosystems',
      'Page 1 of 3: Introduction to Wet-Zone & Coastal Estuaries.',
    ],
    [
      'Chapter 1: Mangrove Root Adaptations',
      'Rhizophora prop roots and Avicennia pneumatophores stabilize shorelines.',
      'Page 2 of 3: Grade 10 Biology field observation checklist.',
    ],
    [
      'Chapter 2: Conservation & Community Care',
      'Students measure salinity, tidal range, and species diversity.',
      'Page 3 of 3: Reflection prompts and classroom rubric.',
    ],
  ];
  for (const [h, b1, b2] of pages) {
    const p = doc.addPage([595, 842]);
    p.drawText(h, { x: 56, y: 760, size: 22, font: bold, color: rgb(0.15, 0.25, 0.2) });
    p.drawText(b1, { x: 56, y: 710, size: 13, font, color: rgb(0.2, 0.2, 0.2) });
    p.drawText(b2, { x: 56, y: 680, size: 12, font, color: rgb(0.3, 0.3, 0.3) });
  }
  const bytes = await doc.save();
  writeFileSync(resolve(outDir, 'mangroves-field-guide.pdf'), bytes);
}

// 2. Real .docx (valid OOXML WordprocessingML package)
function buildDocx() {
  const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`;
  const rels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;
  const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p><w:r><w:rPr><w:b/><w:sz w:val="36"/></w:rPr><w:t>Mangrove Soil Salinity &amp; Microclimate Lab</w:t></w:r></w:p>
    <w:p><w:r><w:t>Grade 10 Environmental Science • Practical Worksheet</w:t></w:r></w:p>
    <w:p><w:r><w:rPr><w:b/></w:rPr><w:t>Objectives</w:t></w:r></w:p>
    <w:p><w:r><w:t>1. Measure estuarine water salinity across three tidal zones.</w:t></w:r></w:p>
    <w:p><w:r><w:t>2. Record soil pH, canopy shade, and dominant mangrove species.</w:t></w:r></w:p>
    <w:p><w:r><w:t>3. Compare observations with national coastal conservation guidelines.</w:t></w:r></w:p>
  </w:body>
</w:document>`;
  const zip = zipSync({
    '[Content_Types].xml': strToU8(contentTypes),
    '_rels/.rels': strToU8(rels),
    'word/document.xml': strToU8(documentXml),
  });
  writeFileSync(resolve(outDir, 'lesson-plan-ecology.docx'), zip);
}

// 3. Real .pptx (valid OOXML PresentationML package)
function buildPptx() {
  const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>
  <Override PartName="/ppt/slides/slide1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>
  <Override PartName="/ppt/slides/slide2.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>
</Types>`;
  const rels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/>
</Relationships>`;
  const presRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide2.xml"/>
</Relationships>`;
  const presXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:presentation xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <p:sldIdLst>
    <p:sldId id="256" r:id="rId1"/>
    <p:sldId id="257" r:id="rId2"/>
  </p:sldIdLst>
  <p:sldSz cx="9144000" cy="5143500" type="screen16x9"/>
</p:presentation>`;
  const makeSlide = (title, body) => `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
  <p:cSld><p:spTree>
    <p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>
    <p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>
    <p:sp>
      <p:nvSpPr><p:cNvPr id="2" name="Title"/><p:cNvSpPr/><p:nvPr><p:ph type="ctrTitle"/></p:nvPr></p:nvSpPr>
      <p:spPr><a:xfrm><a:off x="685800" y="457200"/><a:ext cx="7772400" cy="914400"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></p:spPr>
      <p:txBody><a:bodyPr/><a:lstStyle/><a:p><a:r><a:rPr lang="en-US" sz="3200" b="1"/><a:t>${title}</a:t></a:r></a:p></p:txBody>
    </p:sp>
    <p:sp>
      <p:nvSpPr><p:cNvPr id="3" name="Body"/><p:cNvSpPr/><p:nvPr><p:ph type="body"/></p:nvPr></p:nvSpPr>
      <p:spPr><a:xfrm><a:off x="685800" y="1600200"/><a:ext cx="7772400" cy="2743200"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></p:spPr>
      <p:txBody><a:bodyPr/><a:lstStyle/><a:p><a:r><a:rPr lang="en-US" sz="2000"/><a:t>${body}</a:t></a:r></a:p></p:txBody>
    </p:sp>
  </p:spTree></p:cSld>
</p:sld>`;

  const zip = zipSync({
    '[Content_Types].xml': strToU8(contentTypes),
    '_rels/.rels': strToU8(rels),
    'ppt/_rels/presentation.xml.rels': strToU8(presRels),
    'ppt/presentation.xml': strToU8(presXml),
    'ppt/slides/slide1.xml': strToU8(
      makeSlide('Wet-Zone Flora & Sinharaja Canopy', 'Endemic rainforest layers and watershed stewardship.'),
    ),
    'ppt/slides/slide2.xml': strToU8(
      makeSlide('Canopy Tiers & Observation', 'Emergent, main canopy, understory, and forest floor habitats.'),
    ),
  });
  writeFileSync(resolve(outDir, 'wet-zone-flora.pptx'), zip);
}

// 4. Real Marp Slides (.md)
writeFileSync(
  resolve(outDir, 'contemplative-pedagogy-slides.md'),
  `---
title: "Contemplative Pedagogy in Island Schools"
lang: en
kind: slides
marp: true
---

# Contemplative Pedagogy in Island Schools

Restorative stillness, inquiry, and attention in Sri Lankan classrooms.

---

## Core Rhythms

- Opening quiet circle (3 minutes)
- Guided observation before memorization
- Relational reflection journals

---

## Classroom Practice

> "A builder works with stone, but a teacher works with becoming."
`,
);

// 5. Real Gurudevi Markdown Lesson (.md)
writeFileSync(
  resolve(outDir, 'classical-sinhala-verse.md'),
  `---
title: "Classical Sinhala Verse & Inquiry"
lang: si
kind: page
---

# Classical Sinhala Verse & Inquiry

ශ්‍රී ලංකාවේ සම්භාව්‍ය කාව්‍ය සම්ප්‍රදාය හා සිසු අවධානය.

:::note
Teachers can pair this reading with the **Mindful Bell** audio reflection or export it as slides.
:::

## Key Formula for Meter Rhythm

$$T = \\sum_{i=1}^{n} m_i$$
`,
);

// 6. Real WAV Audio (1 second 440Hz soft chime)
function buildWav() {
  const sampleRate = 8000;
  const numSamples = sampleRate;
  const buf = Buffer.alloc(44 + numSamples * 2);
  buf.write('RIFF', 0);
  buf.writeUInt32LE(36 + numSamples * 2, 4);
  buf.write('WAVE', 8);
  buf.write('fmt ', 12);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(1, 22);
  buf.writeUInt32LE(sampleRate, 24);
  buf.writeUInt32LE(sampleRate * 2, 28);
  buf.writeUInt16LE(2, 32);
  buf.writeUInt16LE(16, 34);
  buf.write('data', 36);
  buf.writeUInt32LE(numSamples * 2, 40);
  for (let i = 0; i < numSamples; i++) {
    const env = Math.exp(-3 * (i / numSamples));
    const sample = Math.round(Math.sin((2 * Math.PI * 440 * i) / sampleRate) * 12000 * env);
    buf.writeInt16LE(sample, 44 + i * 2);
  }
  writeFileSync(resolve(outDir, 'mindful-bell.wav'), buf);
}

await buildPdf();
buildDocx();
buildPptx();
buildWav();
console.log('Generated all real sample files in apps/gurudevi-web/public/samples/');
