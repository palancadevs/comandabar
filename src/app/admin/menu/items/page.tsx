import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select'
import { PlusCircle, Trash2, ImageIcon } from 'lucide-react'
import { createMenuItem, deleteMenuItem } from './actions'

export default async function MenuItemsPage() {
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

    const { data: items } = await supabase
        .from('menu_items')
        .select('*, menu_categories(name)')
        .eq('tenant_id', userData?.tenant_id)
        .order('created_at', { ascending: false })

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Platos</h1>
                    <p className="text-muted-foreground">Gestiona los productos de tu carta.</p>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <Card>
                        <CardHeader>
                            <CardTitle>Nuevo Plato</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form action={createMenuItem} className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="categoryId">Categoría</Label>
                                    <Select name="categoryId" required>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccionar categoría" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories?.map((cat) => (
                                                <SelectItem key={cat.id} value={cat.id}>
                                                    {cat.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="name">Nombre</Label>
                                    <Input id="name" name="name" placeholder="Ej: Hamburguesa Especial" required />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="description">Descripción</Label>
                                    <Textarea id="description" name="description" placeholder="Ingredientes, tamaño..." />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="price">Precio</Label>
                                    <Input id="price" name="price" type="number" step="0.01" placeholder="0.00" required />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="image">Imagen</Label>
                                    <Input id="image" name="image" type="file" accept="image/*" />
                                </div>

                                <Button type="submit" className="w-full">
                                    <PlusCircle className="mr-2 h-4 w-4" /> Agregar Plato
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Mi Carta</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4">
                                {items?.length === 0 && (
                                    <p className="text-sm text-muted-foreground text-center py-8">No hay platos creados.</p>
                                )}
                                {items?.map((item) => (
                                    <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg bg-white dark:bg-zinc-900 group">
                                        <div className="h-16 w-16 rounded-md bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden flex-shrink-0">
                                            {item.image_url ? (
                                                <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" />
                                            ) : (
                                                <ImageIcon className="h-6 w-6 text-muted-foreground" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary uppercase">
                                                    {item.menu_categories?.name}
                                                </span>
                                                <h3 className="font-bold truncate">{item.name}</h3>
                                            </div>
                                            <p className="text-sm text-muted-foreground truncate">{item.description}</p>
                                            <p className="font-bold mt-1">${item.price}</p>
                                        </div>
                                        <form action={async () => {
                                            'use server'
                                            await deleteMenuItem(item.id)
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
        </div>
    )
}
