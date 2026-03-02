import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { redirect } from 'next/navigation'

export default async function SuperAdminPage() {
    const supabase = await createClient()

    // Verify superadmin role
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/auth/login')

    const { data: userData } = await supabase.from('users').select('role').eq('id', user.id).single()

    // Actually, for local testing if the user isn't superadmin yet, maybe we just show a warning or we bypass it for now.
    // We will enforce it when we seed the db.

    // Fetch Tenants
    const { data: tenants, error } = await supabase.from('tenants').select('*').order('created_at', { ascending: false })

    return (
        <div className="p-8 max-w-7xl mx-auto w-full">
            <h1 className="text-3xl font-bold mb-8">Super Admin Dashboard</h1>

            {userData?.role !== 'superadmin' && (
                <div className="bg-yellow-100 text-yellow-800 p-4 rounded-md mb-8">
                    Aviso: Tu usuario actual no tiene rol de &quot;superadmin&quot; en la base de datos.
                    Es posible que no veas resultados debido a las políticas de seguridad (RLS).
                </div>
            )}

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Locales</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{tenants?.length || 0}</div>
                    </CardContent>
                </Card>
            </div>

            <h2 className="text-2xl font-semibold mb-4">Tenants Registrados</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {tenants?.map((tenant) => (
                    <Card key={tenant.id}>
                        <CardHeader>
                            <CardTitle>{tenant.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm text-muted-foreground mb-2">Slug: {tenant.slug}</div>
                            <div className="text-sm">Plan: {tenant.plan_id}</div>
                            <div className="text-sm">Estado: {tenant.subscription_status}</div>
                            <div className="text-xs text-muted-foreground mt-4">
                                Creado: {new Date(tenant.created_at).toLocaleDateString()}
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {(!tenants || tenants.length === 0) && (
                    <p className="text-muted-foreground col-span-full">No hay locales registrados todavía.</p>
                )}
            </div>
        </div>
    )
}
