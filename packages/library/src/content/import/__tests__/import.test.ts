import { strToU8, zipSync } from 'fflate';
import { describe, expect, it } from 'vitest';
import { parseBody, splitSlides } from '../../body';
import { importPptxToSlidesMarkdown } from '../importPptx';

describe('importPptxToSlidesMarkdown', () => {
  it('extracts ordered slides, titles, bullets, notes, and preserves Sinhala/Tamil ZWJ', () => {
    const slide1Xml = `<?xml version="1.0" encoding="UTF-8"?>
      <p:sld xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
        <p:cSld><p:spTree>
          <p:sp><p:nvSpPr><p:nvPr><p:ph type="ctrTitle"/></p:nvPr></p:nvSpPr>
            <p:txBody><a:p><a:r><a:t>ශ්‍රී ලංකාව &amp; தமிழ்</a:t></a:r></a:p></p:txBody>
          </p:sp>
          <p:sp><p:nvSpPr><p:nvPr><p:ph type="body"/></p:nvPr></p:nvSpPr>
            <p:txBody><a:p><a:r><a:t>Mangrove ecosystems</a:t></a:r></a:p></p:txBody>
          </p:sp>
        </p:spTree></p:cSld>
      </p:sld>`;

    const slide2Xml = `<?xml version="1.0" encoding="UTF-8"?>
      <p:sld xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
        <p:cSld><p:spTree>
          <p:sp><p:nvSpPr><p:nvPr><p:ph type="title"/></p:nvPr></p:nvSpPr>
            <p:txBody><a:p><a:r><a:t>Second Slide</a:t></a:r></a:p></p:txBody>
          </p:sp>
          <p:sp><p:nvSpPr><p:nvPr><p:ph type="body"/></p:nvPr></p:nvSpPr>
            <p:txBody><a:p><a:r><a:t>Key takeaway</a:t></a:r></a:p></p:txBody>
          </p:sp>
        </p:spTree></p:cSld>
      </p:sld>`;

    const notes1Xml = `<?xml version="1.0" encoding="UTF-8"?>
      <p:notes xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
        <p:cSld><p:spTree>
          <p:sp><p:txBody><a:p><a:r><a:t>Teacher speaker note</a:t></a:r></a:p></p:txBody></p:sp>
        </p:spTree></p:cSld>
      </p:notes>`;

    const zipBytes = zipSync({
      'ppt/slides/slide1.xml': strToU8(slide1Xml),
      'ppt/slides/slide2.xml': strToU8(slide2Xml),
      'ppt/notesSlides/notesSlide1.xml': strToU8(notes1Xml),
    });

    const result = importPptxToSlidesMarkdown(zipBytes, { title: 'Ecology Deck', lang: 'si' });
    expect(result.slideCount).toBe(2);
    // Preserves Sinhala ZWJ (\u200d)
    expect(result.markdown).toContain('ශ්‍රී');
    expect(result.markdown).toContain('\u200d');
    expect(result.markdown).toContain(':::note\nTeacher speaker note\n:::');

    const parsed = parseBody(result.markdown);
    expect(parsed.frontMatter.kind).toBe('slides');
    expect(parsed.frontMatter.marp).toBe(true);
    expect(parsed.problems).toEqual([]);
    expect(splitSlides(parsed)).toHaveLength(2);
  });
});
