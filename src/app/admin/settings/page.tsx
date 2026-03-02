import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { updateTenantBranding } from './actions'

export default async function SettingsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/auth/login')

    const { data: userData } = await supabase
        .from('users')
        .select('tenant_id')
        .eq('id', user.id)
        .single()

    const { data: tenant } = await supabase
        .from('tenants')
        .select('*')
        .eq('id', userData?.tenant_id)
        .single()

    if (!tenant) return <div>Tenant not found</div>

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Configuración</h1>
                <p className="text-muted-foreground">Personaliza la identidad de tu local.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Identidad de Marca</CardTitle>
                    <CardDescription>Estos datos se mostrarán en el menú QR de tus clientes.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={updateTenantBranding} className="space-y-4">
                        <input type="hidden" name="currentLogoUrl" value={tenant.logo_url || ''} />
                        <input type="hidden" name="currentCoverUrl" value={tenant.cover_url || ''} />

                        <div className="grid gap-2">
                            <Label htmlFor="name">Nombre del Local</Label>
                            <Input id="name" name="name" defaultValue={tenant.name} required />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="description">Descripción / Eslogan</Label>
                            <Input id="description" name="description" defaultValue={tenant.description || ''} placeholder="Ej: Pizza a la leña y Cerveza Artesanal" />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="address">Dirección</Label>
                            <Input id="address" name="address" defaultValue={tenant.address || ''} />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="primaryColor">Color Primario</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="primaryColor"
                                        name="primaryColor"
                                        type="color"
                                        defaultValue={tenant.primary_color || '#000000'}
                                        className="w-12 h-10 p-1"
                                    />
                                    <Input
                                        type="text"
                                        value={tenant.primary_color || '#000000'}
                                        readOnly
                                        className="font-mono"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6 pt-4">
                            <div className="grid gap-2">
                                <Label>Logo del Local</Label>
                                {tenant.logo_url && (
                                    <div className="relative w-24 h-24 border rounded-md overflow-hidden bg-white mb-2">
                                        <img src={tenant.logo_url} alt="Logo" className="w-full h-full object-contain" />
                                    </div>
                                )}
                                <Input name="logo" type="file" accept="image/*" />
                                <p className="text-xs text-muted-foreground">Recomendado: PNG cuadrado, fondo transparente.</p>
                            </div>

                            <div className="grid gap-2">
                                <Label>Imagen de Portada (Menú)</Label>
                                {tenant.cover_url && (
                                    <div className="relative w-full h-24 border rounded-md overflow-hidden bg-gray-100 mb-2">
                                        <img src={tenant.cover_url} alt="Cover" className="w-full h-full object-cover" />
                                    </div>
                                )}
                                <Input name="cover" type="file" accept="image/*" />
                                <p className="text-xs text-muted-foreground">Se muestra en la parte superior del menú web.</p>
                            </div>
                        </div>

                        <div className="pt-6">
                            <Button type="submit">Guardar Cambios</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
