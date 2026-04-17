import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(async (req) => {
    try {
        const { record } = await req.json(); // Triggered by Webhook/Webnet on INSERT to staging

        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        console.log(`Enriching staging item: ${record.title}`);

        // 1. Find similar existing nodes to suggest map position
        // Note: In a real environment, you'd generate embeddings for 'record.title + record.description'
        // For now, we simulate map positioning based on content type/target roles

        let map_x = 0;
        let map_y = 0;

        if (record.target_roles.includes('teacher')) {
            map_x = 50 + (Math.random() * 20); // Cluster in teacher quadrant
            map_y = 50 + (Math.random() * 20);
        } else {
            map_x = 20 + (Math.random() * 20); // Cluster in student quadrant
            map_y = 20 + (Math.random() * 20);
        }

        // 2. Suggest Tags
        const suggested_tags = ['education', 'discovery', record.content_type];

        // 3. Update Staging Row
        const { error } = await supabase
            .from('staging')
            .update({
                map_x,
                map_y,
                suggested_tags,
                enrichment_complete: true,
                updated_at: new Date().toISOString()
            })
            .eq('id', record.id);

        if (error) throw error;

        return new Response(JSON.stringify({ message: "Enrichment complete" }), {
            headers: { "Content-Type": "application/json" },
            status: 200});

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { "Content-Type": "application/json" },
            status: 400});
    }
});
