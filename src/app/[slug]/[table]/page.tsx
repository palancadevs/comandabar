import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'

export default async function QRPage({
    params,
}: {
    params: Promise<{ slug: string; table: string }>
}) {
    const { slug, table: tableName } = await params
    const supabase = await createClient()

    // 1. Resolve Tenant
    const { data: tenant } = await supabase
        .from('tenants')
        .select('id, name, slug')
        .eq('slug', slug)
        .single()

    if (!tenant) notFound()

    // 2. Resolve Table
    const { data: table } = await supabase
        .from('tables')
        .select('id, name')
        .eq('tenant_id', tenant.id)
        .eq('name', tableName) // table name or number from URL
        .single()

    if (!table) {
        // If table doesn't exist but tenant does, we might want to handle it (e.g., redirect to menu without table)
        // For MVP, we assume the QR code is correct.
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="text-center space-y-4">
                    <h1 className="text-2xl font-bold">Mesa no encontrada</h1>
                    <p className="text-muted-foreground text-sm">Por favor, escanea el código QR nuevamente o consulta con el mozo.</p>
                </div>
            </div>
        )
    }

    // 3. Logic: Redirect to the public menu with the session context
    // We'll use a cookie or search params to store the table_id for the order
    // For now, let's redirect to the main menu page of the tenant
    redirect(`/${slug}?tableId=${table.id}`)
}
