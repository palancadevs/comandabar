import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import MenuContent from './MenuContent'

export default async function PublicMenuPage({
    params,
    searchParams,
}: {
    params: Promise<{ slug: string }>
    searchParams: Promise<{ tableId?: string }>
}) {
    const { slug } = await params
    const { tableId } = await searchParams
    const supabase = await createClient()

    // 1. Fetch Tenant Settings
    const { data: tenant } = await supabase
        .from('tenants')
        .select('*')
        .eq('slug', slug)
        .single()

    if (!tenant) notFound()

    let table = null

    if (tableId) {
        const { data: resolvedTable } = await supabase
            .from('tables')
            .select('id, name')
            .eq('tenant_id', tenant.id)
            .eq('id', tableId)
            .single()

        table = resolvedTable
    }

    // 2. Fetch Categories & Items
    const { data: categories } = await supabase
        .from('menu_categories')
        .select('*, menu_items(*)')
        .eq('tenant_id', tenant.id)
        .eq('active', true)
        .order('sort_order', { ascending: true })

    return (
        <MenuContent
            tenant={tenant}
            categories={categories}
            tableId={tableId}
            tableName={table?.name || null}
        />
    )
}
