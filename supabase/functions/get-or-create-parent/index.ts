import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Handle CORS
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
        )

        // Get the user from the JWT to ensure security
        const { data: { user }, error: authError } = await supabaseClient.auth.getUser()

        if (authError || !user) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                status: 401,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        }

        // Use Service Role to bypass RLS for DB operations
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // Check if parent exists
        const { data: existingParent, error: fetchError } = await supabaseAdmin
            .from('parents')
            .select('*')
            .eq('profile_id', user.id)
            .maybeSingle()

        if (fetchError) {
            throw fetchError
        }

        if (existingParent) {
            return new Response(JSON.stringify(existingParent), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        }

        // Create new parent if not exists
        const { data: newParent, error: insertError } = await supabaseAdmin
            .from('parents')
            .insert({ profile_id: user.id })
            .select()
            .single()

        if (insertError) {
            throw insertError
        }

        return new Response(JSON.stringify(newParent), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 201, // Created
        })

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }
})
