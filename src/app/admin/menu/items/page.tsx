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
import { PlusCircle, Trash2, ImageIcon, Utensils } from 'lucide-react'
import { createMenuItem, deleteMenuItem } from './actions'

import { EditMenuItemDialog } from './EditMenuItemDialog'

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

    // Group items by category for better visualization
    const groupedItems = categories?.map(cat => ({
        ...cat,
        items: items?.filter(item => item.category_id === cat.id) || []
    })) || []

    return (
        <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
                <Card className="border-primary/20 shadow-sm overflow-hidden sticky top-24">
                    <CardHeader className="bg-primary/5 border-b border-primary/10">
                        <CardTitle className="text-lg">Nuevo Plato</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <form action={createMenuItem} className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="categoryId">Categoría</Label>
                                <Select name="categoryId" required>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccionar" />
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
                                <Input id="name" name="name" placeholder="Ej: Hamburguesa" required />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="description">Descripción</Label>
                                <Textarea id="description" name="description" placeholder="Ingredientes..." className="h-20" />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="price">Precio</Label>
                                <Input id="price" name="price" type="number" step="0.01" placeholder="0.00" required />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="image" className="flex items-center gap-2">
                                    <ImageIcon className="h-4 w-4 text-muted-foreground" />
                                    Imagen (opcional)
                                </Label>
                                <Input id="image" name="image" type="file" accept="image/*" className="cursor-pointer" />
                            </div>

                            <Button type="submit" className="w-full font-bold shadow-md">
                                <PlusCircle className="mr-2 h-4 w-4" /> Agregar Plato
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>

            <div className="lg:col-span-2 space-y-8">
                {groupedItems.map((group) => (
                    <div key={group.id} className="space-y-4">
                        <h2 className="text-xl font-black flex items-center gap-2 text-zinc-800 dark:text-zinc-200 uppercase tracking-widest px-1">
                            {group.name}
                            {group.items.length > 0 && (
                                <span className="text-xs font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-500 px-2 py-1 rounded-md">
                                    {group.items.length}
                                    e</span>
                            )}
                        </h2>

                        <div className="grid gap-3">
                            {group.items.length === 0 && (
                                <p className="text-sm text-muted-foreground italic px-4 py-8 border-2 border-dashed rounded-2xl text-center">
                                    No hay platos en esta categoría.
                                </p>
                            )}
                            {group.items.map((item: any) => (
                                <div key={item.id} className="flex items-center gap-4 p-3 border rounded-2xl bg-white dark:bg-zinc-900 group hover:border-primary/50 transition-all hover:shadow-lg">
                                    <div className="h-20 w-20 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-inner">
                                        {item.image_url ? (
                                            <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" />
                                        ) : (
                                            <ImageIcon className="h-6 w-6 text-zinc-300" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-black text-lg truncate">{item.name}</h3>
                                        <p className="text-sm text-muted-foreground line-clamp-1">{item.description}</p>
                                        <p className="font-black text-primary mt-1">${item.price}</p>
                                    </div>
                                    <div className="flex items-center gap-1 pr-2">
                                        <EditMenuItemDialog item={item} categories={categories || []} />
                                        <form action={async () => {
                                            'use server'
                                            await deleteMenuItem(item.id)
                                        }}>
                                            <Button variant="ghost" size="icon" className="h-9 w-9 text-destructive/50 hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all rounded-full">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </form>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                {items?.length === 0 && (
                    <div className="text-center py-20 bg-zinc-50 dark:bg-zinc-900/50 rounded-3xl border-2 border-dashed border-zinc-200 dark:border-zinc-800">
                        <Utensils className="mx-auto h-12 w-12 text-zinc-300 mb-4" />
                        <h3 className="text-xl font-bold text-zinc-500">Tu carta está vacía</h3>
                        <p className="text-zinc-400 mt-2">Crea tu primer plato para empezar a vender.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
