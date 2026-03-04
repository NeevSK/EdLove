/**
 * ocr-proxy — Supabase Edge Function (Deno)
 *
 * Routes cloud OCR requests to Google Vision or OpenAI GPT-4o Vision.
 * API keys are stored as Supabase Edge Function secrets — never in the app bundle.
 *
 * Pro-gate: verifies the requesting user has is_pro = true.
 * If not Pro, returns 403. This is a server-enforced gate (client-side
 * Pro checks are UX-only; this is the authoritative enforcement layer).
 *
 * Request body:
 *   { provider: 'google_vision' | 'openai_vision', imageBase64: string }
 *
 * Response body:
 *   OCRRawResult (normalized, matches packages/scanner-kit/src/ocr/types.ts)
 *
 * Secrets required (set via `supabase secrets set`):
 *   GOOGLE_VISION_API_KEY
 *   OPENAI_API_KEY
 *   SUPABASE_URL           (auto-provided)
 *   SUPABASE_SERVICE_ROLE_KEY (auto-provided)
 */

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// ── Types (mirrors packages/scanner-kit/src/ocr/types.ts) ─────────────────

interface OCRBoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface OCRBlock {
  text: string;
  confidence?: number;
  boundingBox?: OCRBoundingBox;
  language?: string;
}

interface OCRRawResult {
  text: string;
  blocks: OCRBlock[];
  confidence?: number;
}

// ── Server ─────────────────────────────────────────────────────────────────

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }

  try {
    // ── Auth: verify JWT ────────────────────────────────────────────────
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return json({ error: 'Unauthorized' }, 401);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', ''),
    );

    if (authError || !user) {
      return json({ error: 'Unauthorized' }, 401);
    }

    // ── Pro gate ────────────────────────────────────────────────────────
    const { data: profile } = await supabase
      .from('users')
      .select('is_pro')
      .eq('id', user.id)
      .single();

    if (!profile?.is_pro) {
      return json({ error: 'Pro subscription required for cloud OCR' }, 403);
    }

    // ── Request parsing ─────────────────────────────────────────────────
    const body = await req.json();
    const { provider, imageBase64 } = body as {
      provider: 'google_vision' | 'openai_vision';
      imageBase64: string;
    };

    if (!provider || !imageBase64) {
      return json({ error: 'provider and imageBase64 are required' }, 400);
    }

    // Guard against oversized payloads — base64 of a 5 MB image ≈ 6.7 MB of characters.
    // Anything larger risks extremely high API costs and Deno memory pressure.
    const MAX_BASE64_CHARS = 7_000_000; // ~5 MB raw image
    if (typeof imageBase64 !== 'string' || imageBase64.length > MAX_BASE64_CHARS) {
      return json({ error: 'imageBase64 exceeds maximum allowed size (5 MB)' }, 413);
    }

    // Validate provider is one of the two known values (type-cast alone is not runtime-safe)
    if (provider !== 'google_vision' && provider !== 'openai_vision') {
      return json({ error: `Unknown provider: ${provider}` }, 400);
    }

    // ── Route to provider ───────────────────────────────────────────────
    let result: OCRRawResult;

    if (provider === 'google_vision') {
      result = await callGoogleVision(imageBase64);
    } else {
      result = await callOpenAIVision(imageBase64);
    }

    return json(result, 200);
  } catch (err) {
    console.error('ocr-proxy error:', err);
    return json({ error: 'Internal server error' }, 500);
  }
});

// ── Google Cloud Vision ────────────────────────────────────────────────────

async function callGoogleVision(imageBase64: string): Promise<OCRRawResult> {
  const apiKey = Deno.env.get('GOOGLE_VISION_API_KEY');
  if (!apiKey) throw new Error('GOOGLE_VISION_API_KEY not configured');

  const response = await fetch(
    `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requests: [
          {
            image: { content: imageBase64 },
            features: [{ type: 'DOCUMENT_TEXT_DETECTION' }],
          },
        ],
      }),
    },
  );

  const data = await response.json();
  const annotation = data?.responses?.[0]?.fullTextAnnotation;

  if (!annotation) {
    return { text: '', blocks: [] };
  }

  const blocks: OCRBlock[] = [];
  for (const page of annotation.pages ?? []) {
    for (const block of page.blocks ?? []) {
      for (const paragraph of block.paragraphs ?? []) {
        const text = paragraph.words
          ?.map((w: any) => w.symbols?.map((s: any) => s.text).join(''))
          .join(' ') ?? '';

        const verts = paragraph.boundingBox?.vertices ?? [];
        const x = verts[0]?.x ?? 0;
        const y = verts[0]?.y ?? 0;
        const width = (verts[1]?.x ?? x) - x;
        const height = (verts[2]?.y ?? y) - y;

        blocks.push({
          text,
          confidence: paragraph.confidence,
          boundingBox: { x, y, width: Math.abs(width), height: Math.abs(height) },
          language: paragraph.property?.detectedLanguages?.[0]?.languageCode,
        });
      }
    }
  }

  return {
    text: annotation.text ?? '',
    blocks,
    confidence: annotation.pages?.[0]?.confidence,
  };
}

// ── OpenAI GPT-4o Vision ───────────────────────────────────────────────────

async function callOpenAIVision(imageBase64: string): Promise<OCRRawResult> {
  const apiKey = Deno.env.get('OPENAI_API_KEY');
  if (!apiKey) throw new Error('OPENAI_API_KEY not configured');

  const systemPrompt = `You are an OCR engine. Extract all text from the image.
Return a JSON object with this exact shape:
{
  "text": "<full document text>",
  "blocks": [
    { "text": "<line text>", "confidence": 0.95 }
  ]
}
Each block should be one logical line or table cell.
Preserve Sinhala, Tamil, and English text exactly as written.
For tables, each cell should be a separate block.
Return ONLY the JSON object, no markdown, no explanation.`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: systemPrompt },
            {
              type: 'image_url',
              image_url: { url: `data:image/jpeg;base64,${imageBase64}` },
            },
          ],
        },
      ],
    }),
  });

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content ?? '';

  try {
    const parsed = JSON.parse(content) as OCRRawResult;
    return {
      text: parsed.text ?? '',
      blocks: parsed.blocks ?? [],
    };
  } catch {
    // If model didn't return valid JSON, return raw text as single block
    return {
      text: content,
      blocks: [{ text: content, confidence: 0.8 }],
    };
  }
}

// ── Helpers ────────────────────────────────────────────────────────────────

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}
