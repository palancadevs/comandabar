import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PlusCircle, Trash2, QrCode, ExternalLink } from 'lucide-react'
import { createTable, deleteTable } from './actions'

export default async function TablesPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/auth/login')

    const { data: userData } = await supabase
        .from('users')
        .select('tenant_id, tenants(slug)')
        .eq('id', user.id)
        .single()

    if (!userData?.tenant_id) redirect('/admin')

    const tenantSlug = (userData.tenants as any)?.slug

    const { data: tables } = await supabase
        .from('tables')
        .select('*')
        .eq('tenant_id', userData.tenant_id)
        .order('name', { ascending: true })

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Mesas</h1>
                    <p className="text-muted-foreground">Gestiona tus mesas y descarga los códigos QR para tus clientes.</p>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <Card>
                        <CardHeader>
                            <CardTitle>Nueva Mesa</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form action={createTable} className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Nombre / Número de Mesa</Label>
                                    <Input id="name" name="name" placeholder="Ej: Mesa 1, Barra, Terraza 4" required />
                                </div>
                                <Button type="submit" className="w-full">
                                    <PlusCircle className="mr-2 h-4 w-4" /> Agregar Mesa
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Lista de Mesas</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid sm:grid-cols-2 gap-4">
                                {tables?.length === 0 && (
                                    <p className="text-sm text-muted-foreground text-center py-8 col-span-2">No hay mesas creadas.</p>
                                )}
                                {tables?.map((table) => {
                                    const qrUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://comandaapp-eta.vercel.app'}/${tenantSlug}/${table.id}`
                                    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrUrl)}`

                                    return (
                                        <div key={table.id} className="p-4 border rounded-lg bg-white dark:bg-zinc-900 flex flex-col items-center gap-4 group relative">
                                            <div className="w-full flex justify-between items-start">
                                                <h3 className="font-bold text-lg">{table.name}</h3>
                                                <form action={async () => {
                                                    'use server'
                                                    await deleteTable(table.id)
                                                }}>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </form>
                                            </div>

                                            <div className="bg-white p-2 rounded-md border shadow-sm">
                                                <img src={qrImageUrl} alt={`QR Mesa ${table.name}`} className="w-32 h-32" />
                                            </div>

                                            <div className="flex w-full gap-2 mt-2">
                                                <Button asChild variant="outline" size="sm" className="flex-1">
                                                    <a href={qrUrl} target="_blank" rel="noopener noreferrer">
                                                        <ExternalLink className="mr-2 h-3 w-3" /> Ver como cliente
                                                    </a>
                                                </Button>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
