import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import KDSContent from './KDSContent'

export default async function KDSPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/auth/login')

    const { data: userData } = await supabase
        .from('users')
        .select('tenant_id')
        .eq('id', user.id)
        .single()

    if (!userData?.tenant_id) redirect('/admin')

    // Initial fetch of active orders
    const { data: orders } = await supabase
        .from('orders')
        .select('*, tables(name), order_items(*, menu_items(name))')
        .eq('tenant_id', userData.tenant_id)
        .in('status', ['pendiente', 'en_preparacion'])
        .order('created_at', { ascending: true })

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Cocina</h1>
                <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-sm text-muted-foreground font-medium">Conectado en tiempo real</span>
                </div>
            </div>

            <KDSContent initialOrders={orders || []} tenantId={userData.tenant_id} />
        </div>
    )
}
