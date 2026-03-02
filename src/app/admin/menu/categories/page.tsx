import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PlusCircle, Trash2 } from 'lucide-react'
import { createCategory, deleteCategory } from './actions'

export default async function CategoriesPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/auth/login')

    const { data: userData } = await supabase
        .from('users')
        .select('tenant_id')
        .eq('id', user.id)
        .single()

    const { data: categories } = await supabase
        .from('menu_categories')
        .select('*')
        .eq('tenant_id', userData?.tenant_id)
        .order('sort_order', { ascending: true })

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Categorías</h1>
                    <p className="text-muted-foreground">Organiza tus platos en categorías.</p>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Nueva Categoría</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form action={createCategory} className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Nombre</Label>
                                <Input id="name" name="name" placeholder="Ej: Entradas, Platos Principales..." required />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="sortOrder">Orden (0-99)</Label>
                                <Input id="sortOrder" name="sortOrder" type="number" defaultValue="0" />
                            </div>
                            <Button type="submit" className="w-full">
                                <PlusCircle className="mr-2 h-4 w-4" /> Agregar Categoría
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Mis Categorías</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {categories?.length === 0 && (
                                <p className="text-sm text-muted-foreground text-center py-4">No hay categorías creadas.</p>
                            )}
                            {categories?.map((category) => (
                                <div key={category.id} className="flex items-center justify-between p-3 border rounded-md bg-white dark:bg-zinc-900 group">
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs font-mono text-muted-foreground w-4">{category.sort_order}</span>
                                        <span className="font-medium">{category.name}</span>
                                    </div>
                                    <form action={async () => {
                                        'use server'
                                        await deleteCategory(category.id)
                                    }}>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </form>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
