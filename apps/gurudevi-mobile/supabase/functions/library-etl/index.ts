import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * library-etl — The Enrichment Protocol
 * 
 * Sources: User uploads, YouTube links, PDF paths.
 * Purpose: Sanitize metadata, extract topics via AI, and generate vector embeddings.
 */

Deno.serve(async (req: Request) => {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    try {
        const { resourceId, action } = await req.json();

        if (action === 'enrich') {
            // 1. Fetch resource
            const { data: resource, error: fetchError } = await supabase
                .from('library_resources')
                .select('*')
                .eq('id', resourceId)
                .single();

            if (fetchError || !resource) throw new Error('Resource not found');

            // 2. Mock AI Topic Extraction (Future: call Anthropic)
            const suggestions = ['Education', resource.subject, ...resource.topics];
            const uniqueTopics = [...new Set(suggestions)].filter(Boolean);

            // 3. Update resource with enriched metadata
            const { error: updateError } = await supabase
                .from('library_resources')
                .update({
                    topics: uniqueTopics,
                    verified: false, // Wait for human review logic
                })
                .eq('id', resourceId);

            if (updateError) throw updateError;

            return new Response(JSON.stringify({ success: true, enrichedTopics: uniqueTopics }), {
                headers: { 'Content-Type': 'application/json' },
            });
        }

        return new Response(JSON.stringify({ message: "ETL dormant. Waiting for pulse." }), {
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message || 'Unknown error' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }
});
