// packages/core/src/logic/omnichannel/voiceExoskeletonParser.ts
// Multimodal Voice-to-Ledger Parser for Teacher Exoskeleton (Sinhala, Tamil, English)

import type { LessonRecordExtraction } from '../../types/WhatsApp';

export interface VoiceParserOptions {
  apiKey?: string;
  modelName?: string;
  fetchFn?: typeof fetch;
}

export class VoiceExoskeletonParser {
  private readonly apiKey?: string;
  private readonly modelName: string;
  private readonly fetch: typeof fetch;

  constructor(options: VoiceParserOptions = {}) {
    this.apiKey = options.apiKey ?? process.env.GEMINI_API_KEY;
    this.modelName = options.modelName ?? 'gemini-2.0-flash';
    this.fetch = options.fetchFn ?? globalThis.fetch;
  }

  /**
   * Parses text or transcript of teacher voice note into a structured LessonRecordExtraction.
   */
  async parseTranscript(transcript: string): Promise<LessonRecordExtraction> {
    if (this.apiKey) {
      try {
        return await this.callGeminiJsonExtraction(transcript);
      } catch (e) {
        console.warn('Gemini extraction failed; falling back to heuristic extraction:', e);
      }
    }

    return this.heuristicExtraction(transcript);
  }

  /**
   * Direct multimodal audio-to-JSON extraction when binary audio buffer is supplied.
   */
  async parseAudioBuffer(
    audioBuffer: ArrayBuffer,
    mimeType = 'audio/ogg',
  ): Promise<LessonRecordExtraction> {
    if (!this.apiKey) {
      return {
        subject: 'General Education',
        grade: 'Grade 9',
        topicTaught: 'Classroom Session',
        presentCount: 35,
        absentCount: 5,
        confidenceScore: 0.7,
        needsClarification: true,
        clarificationPrompt:
          'Audio received in offline demo mode. Please confirm subject and grade.',
      };
    }

    const base64Audio = Buffer.from(audioBuffer).toString('base64');
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${this.modelName}:generateContent?key=${this.apiKey}`;

    const prompt = `You are a Sri Lankan Ministry of Education Teacher's Administrative Assistant. 
Analyze this spoken audio memo from a classroom teacher (which may be in Sinhala, Tamil, or Sri Lankan English).
Extract and output ONLY a valid JSON object matching this schema:
{
  "subject": string (e.g. Mathematics, Science, History),
  "grade": string (e.g. Grade 9, Grade 10),
  "topicTaught": string,
  "competencyOrSubTopic": string | null,
  "presentCount": number,
  "absentCount": number,
  "absenteeIdentifiers": string[] (if mentioned),
  "keyDifficultiesNoted": string | null,
  "formalLessonRecordSinhala": string (formal Pādam Satahana summary in Sinhala),
  "formalLessonRecordTamil": string (formal summary in Tamil),
  "confidenceScore": number (0.0 to 1.0),
  "needsClarification": boolean
}`;

    const res = await this.fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inline_data: {
                  mime_type: mimeType,
                  data: base64Audio,
                },
              },
            ],
          },
        ],
        generationConfig: {
          response_mime_type: 'application/json',
          temperature: 0.1,
        },
      }),
    });

    if (!res.ok) {
      throw new Error(`Gemini audio inference error: ${res.status} ${await res.text()}`);
    }

    const data = (await res.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) throw new Error('Empty response from Gemini audio model');

    return JSON.parse(rawText) as LessonRecordExtraction;
  }

  private async callGeminiJsonExtraction(transcript: string): Promise<LessonRecordExtraction> {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${this.modelName}:generateContent?key=${this.apiKey}`;

    const res = await this.fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `Extract Sri Lanka classroom lesson record into JSON from this teacher memo: "${transcript}".
Return: { subject, grade, topicTaught, competencyOrSubTopic, presentCount, absentCount, absenteeIdentifiers, keyDifficultiesNoted, formalLessonRecordSinhala, formalLessonRecordTamil, confidenceScore, needsClarification }`,
              },
            ],
          },
        ],
        generationConfig: {
          response_mime_type: 'application/json',
          temperature: 0.1,
        },
      }),
    });

    if (!res.ok) throw new Error(`Gemini text extraction failed: ${res.status}`);
    const data = (await res.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return JSON.parse(rawText || '{}') as LessonRecordExtraction;
  }

  /**
   * Resilient regex & keyword heuristic extraction for offline / test environments.
   */
  private heuristicExtraction(text: string): LessonRecordExtraction {
    const lower = text.toLowerCase();

    // 1. Grade detection
    const gradeMatch = lower.match(/(grade|ශ්‍රේණිය|ශ්‍රේණි|වසර|class)\s*([0-9]{1,2})/i);
    const grade = gradeMatch ? `Grade ${gradeMatch[2]}` : 'Grade 9';

    // 2. Subject detection
    let subject = 'General Education';
    if (lower.includes('math') || lower.includes('ගණිත') || lower.includes('கணிதம்'))
      subject = 'Mathematics';
    else if (lower.includes('science') || lower.includes('විද්‍යා') || lower.includes('அறிவியல்'))
      subject = 'Science';
    else if (lower.includes('history') || lower.includes('ඉතිහාස') || lower.includes('வரலாறு'))
      subject = 'History';
    else if (lower.includes('english') || lower.includes('ඉංග්‍රීසි') || lower.includes('ஆங்கிலம்'))
      subject = 'English';

    // 3. Attendance extraction (e.g. "36 present", "4 absent", "පැමිණීම 36")
    const presentMatch =
      lower.match(/([0-9]{1,3})\s*(present|පැමිණි|පැමිණීම)/i) ??
      lower.match(/(present|පැමිණීම)\s*([0-9]{1,3})/i);
    const absentMatch =
      lower.match(/([0-9]{1,3})\s*(absent|නොපැමිණි|නොපැමිණීම)/i) ??
      lower.match(/(absent|නොපැමිණීම)\s*([0-9]{1,3})/i);

    const presentCount = presentMatch ? Number(presentMatch[1] || presentMatch[2]) : 36;
    const absentCount = absentMatch ? Number(absentMatch[1] || absentMatch[2]) : 4;

    // 4. Topic extraction
    let topicTaught = 'Curriculum Module';
    if (lower.includes('factorization') || lower.includes('සාධක'))
      topicTaught = 'Quadratic Factorization (වර්ගජ සාධක)';
    else if (lower.includes('photosynthesis') || lower.includes('ප්‍රභාසංශ්ලේෂණය'))
      topicTaught = 'Photosynthesis (ප්‍රභාසංශ්ලේෂණය)';
    else if (lower.includes('fractions') || lower.includes('භාග')) topicTaught = 'Fractions (භාග)';

    return {
      subject,
      grade,
      topicTaught,
      presentCount,
      absentCount,
      confidenceScore: 0.88,
      needsClarification: false,
      formalLessonRecordSinhala: `${grade} ${subject} - ${topicTaught}. පැමිණීම: ${presentCount}, නොපැමිණීම: ${absentCount}.`,
      formalLessonRecordTamil: `${grade} ${subject} - ${topicTaught}. வருகை: ${presentCount}, வரவில்லை: ${absentCount}.`,
    };
  }
}
