import { cache } from 'react'
import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'

type AdminSupabaseClient = Awaited<ReturnType<typeof createClient>>

export type AdminContext = {
    supabase: AdminSupabaseClient
    userId: string
    tenantId: string
    tenantSlug: string | null
}

export const getAdminContext = cache(async (): Promise<AdminContext> => {
    const supabase = await createClient()
    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
        redirect('/auth/login')
    }

    const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('tenant_id, tenants(slug)')
        .eq('id', user.id)
        .single()

    if (profileError || !profile?.tenant_id) {
        redirect('/auth/login')
    }

    const tenantRelation = profile.tenants as { slug?: string | null } | Array<{ slug?: string | null }> | null
    const tenantSlug = Array.isArray(tenantRelation)
        ? tenantRelation[0]?.slug ?? null
        : tenantRelation?.slug ?? null

    return {
        supabase,
        userId: user.id,
        tenantId: profile.tenant_id,
        tenantSlug,
    }
})
