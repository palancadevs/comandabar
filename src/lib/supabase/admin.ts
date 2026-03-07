import { createClient } from '@supabase/supabase-js'

// A dedicated admin client using the service role key to bypass RLS.
// WARNING: NEVER expose this key to the client side. Only use in secure server contexts.
export function createAdminClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error('Supabase URL and Service Role Key are required to create an admin client.')
    }

    return createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    })
}
