import { createClient as createServerClient } from '@supabase/supabase-js'

/**
 * Creates a Supabase Admin client using the Service Role key.
 * This client bypasses RLS and can access the Auth Admin API.
 * Only use this in server actions / route handlers, NEVER expose to the client.
 */
export function createAdminClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
        throw new Error(
            'Missing SUPABASE_SERVICE_ROLE_KEY environment variable. ' +
            'Add it to .env.local to enable admin user management.'
        )
    }

    return createServerClient(supabaseUrl, serviceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    })
}
