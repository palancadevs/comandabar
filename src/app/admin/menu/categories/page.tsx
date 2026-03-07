import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PlusCircle, Trash2 } from 'lucide-react'
import { createCategory, deleteCategory } from './actions'

import { EditCategoryDialog } from './EditCategoryDialog'

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
        <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
                <Card className="border-primary/20 shadow-sm overflow-hidden">
                    <CardHeader className="bg-primary/5 border-b border-primary/10">
                        <CardTitle className="text-lg">Nueva Categoría</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <form action={createCategory} className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Nombre</Label>
                                <Input id="name" name="name" placeholder="Ej: Entradas, Platos Principales..." required />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="sortOrder" className="flex justify-between">
                                    Orden
                                    <span className="text-muted-foreground font-normal">(prioridad)</span>
                                </Label>
                                <Input id="sortOrder" name="sortOrder" type="number" defaultValue="0" />
                            </div>
                            <Button type="submit" className="w-full font-bold shadow-md">
                                <PlusCircle className="mr-2 h-4 w-4" /> Crear Categoría
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>

            <div className="md:col-span-2 space-y-4">
                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-xl flex items-center gap-2">
                            Mis Categorías
                            <span className="text-sm font-normal text-muted-foreground bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
                                {categories?.length || 0}
                            </span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-2">
                            {categories?.length === 0 && (
                                <p className="text-sm text-muted-foreground text-center py-12 border-2 border-dashed rounded-xl">
                                    Todavía no has creado categorías. Comienza por la izquierda.
                                </p>
                            )}
                            {categories?.map((category) => (
                                <div key={category.id} className="flex items-center justify-between p-4 border rounded-xl bg-white dark:bg-zinc-900 group hover:border-primary/50 transition-all hover:shadow-md">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-mono text-zinc-400 font-bold">
                                            {category.sort_order}
                                        </div>
                                        <span className="font-bold text-lg">{category.name}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <EditCategoryDialog category={category} />
                                        <form action={async () => {
                                            'use server'
                                            await deleteCategory(category.id)
                                        }}>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive/60 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </form>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
