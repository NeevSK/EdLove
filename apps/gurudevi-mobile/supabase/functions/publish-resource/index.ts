import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(async (req) => {
    try {
        const { staging_id } = await req.json();

        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // 1. Fetch the approved staging item
        const { data: staging, error: fetchError } = await supabase
            .from('staging')
            .select('*')
            .eq('id', staging_id)
            .single();

        if (fetchError || !staging) throw new Error("Staging item not found");
        if (staging.status !== 'approved') throw new Error("Item not approved for publishing");

        console.log(`Publishing item: ${staging.title}`);

        // 2. Insert into live resources
        const { data: resource, error: resourceError } = await supabase
            .from('library_resources')
            .insert({
                title: staging.title,
                description: staging.description,
                url: staging.url,
                type: staging.content_type,
                school_id: staging.school_id, // Default to a demo school if null in production logic
                subject: 'Discovery', // Or derived from suggested_tags
            })
            .select()
            .single();

        if (resourceError) throw resourceError;

        // 3. Mark as published or delete from staging
        await supabase
            .from('staging')
            .delete()
            .eq('id', staging_id);

        return new Response(JSON.stringify({ message: "Published successfully", resource_id: resource.id }), {
            headers: { "Content-Type": "application/json" },
            status: 200});

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { "Content-Type": "application/json" },
            status: 400});
    }
});
