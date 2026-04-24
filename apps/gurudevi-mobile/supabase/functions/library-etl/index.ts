import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'};

/**
 * library-etl  The Enrichment Protocol
 *
 * Actions:
 *   enrich  Extract topics via AI + generate vector embedding + store in library_resources.
 *
 * Secrets required:
 *   OPENAI_API_KEY                      (for embeddings + topic extraction)
 *   SUPABASE_URL                        (auto-provided)
 *   SUPABASE_SERVICE_ROLE_KEY           (auto-provided)
 */
Deno.serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const openAiKey = Deno.env.get('OPENAI_API_KEY');
    const supabase = createClient(supabaseUrl, supabaseKey);

    try {
        const { resourceId, action } = await req.json();

        if (action === 'enrich') {
            // 1. Fetch resource
            const { data: resource, error: fetchError } = await supabase
                .from('nodes')
                .select('*')
                .eq('id', resourceId)
                .single();

            if (fetchError || !resource) throw new Error('Resource not found');

            // 2. Build text for embedding  title + description + subjects + existing topics
            // Include localized strings for better semantic density
            const textForEmbedding = [
                resource.title,
                resource.title_si,
                resource.title_ta,
                resource.description ?? '',
                resource.description_si ?? '',
                resource.description_ta ?? '',
                ...(resource.subjects ?? []),
                ...(resource.topics ?? []),
            ].filter(Boolean).join(' | ');

            let embedding: number[] | null = null;
            let enrichedTopics: string[] = [...(resource.topics ?? []), ...(resource.subjects ?? [])].filter(Boolean);

            if (openAiKey) {
                // 3a. Extract topics using GPT-4o-mini (fast, cheap)
                try {
                    const topicRes = await fetch('https://api.openai.com/v1/chat/completions', {
                        method: 'POST',
                        headers: { 'Authorization': `Bearer ${openAiKey}`, 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            model: 'gpt-4o-mini',
                            messages: [
                                {
                                    role: 'system',
                                    content: 'You extract educational topic tags for a Sri Lankan school library resource. Return ONLY a JSON array of 3-6 concise topic strings (e.g. ["mathematics", "fractions", "grade 7"]). No explanation.'},
                                {
                                    role: 'user',
                                    content: `Title: ${resource.title}\nDescription: ${resource.description ?? 'N/A'}\nSubjects: ${resource.subjects?.join(', ') ?? 'N/A'}`},
                            ],
                            max_tokens: 120,
                            temperature: 0.2})});
                    if (topicRes.ok) {
                        const topicData = await topicRes.json();
                        const raw = topicData.choices?.[0]?.message?.content?.trim() ?? '';
                        let parsed: unknown;
                        try {
                            parsed = JSON.parse(raw);
                        } catch (parseErr) {
                            console.warn('[library-etl] topic JSON parse failed, raw response:', raw, parseErr);
                        }
                        if (Array.isArray(parsed)) {
                            enrichedTopics = parsed;
                        }
                    }
                } catch { /* topic extraction is best-effort */ }

                // 3b. Generate embedding with text-embedding-3-small (1536 dims)
                try {
                    const embRes = await fetch('https://api.openai.com/v1/embeddings', {
                        method: 'POST',
                        headers: { 'Authorization': `Bearer ${openAiKey}`, 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            model: 'text-embedding-3-small',
                            input: textForEmbedding})});
                    if (embRes.ok) {
                        const embData = await embRes.json();
                        embedding = embData.data?.[0]?.embedding ?? null;
                    }
                } catch { /* embedding is best-effort */ }
            }

            // 4. Update resource with enriched topics + embedding
            const updatePayload: Record<string, any> = {
                topics: [...new Set(enrichedTopics)], // dedupe
                verified: resource.is_community ? false : true, // Auto-verify core nodes, wait for review on community
            };
            if (embedding) {
                updatePayload.embedding = embedding;
            }

            const { error: updateError } = await supabase
                .from('nodes')
                .update(updatePayload)
                .eq('id', resourceId);

            if (updateError) throw updateError;

            return new Response(
                JSON.stringify({
                    success: true,
                    enrichedTopics,
                    embeddingGenerated: !!embedding,
                    aiEnriched: !!openAiKey}),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        return new Response(
            JSON.stringify({ message: 'ETL dormant. Send { action: "enrich", resourceId: "..." } to activate.' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

    } catch (error: any) {
        return new Response(
            JSON.stringify({ error: error.message || 'Unknown error' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});

