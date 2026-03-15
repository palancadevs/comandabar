import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

import { createClient } from '@/lib/supabase/server'

export async function redirectIfAuthenticated() {
    const cookieStore = await cookies()
    const hasSupabaseSession = cookieStore.getAll().some(({ name }) => name.startsWith('sb-'))

    if (!hasSupabaseSession) {
        return
    }

    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (user) {
        redirect('/admin')
    }
}
