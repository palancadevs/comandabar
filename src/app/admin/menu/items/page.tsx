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
import { PlusCircle, ImageIcon, Utensils } from 'lucide-react'
import { createMenuItem } from './actions'
import { getAdminContext } from '@/lib/auth/admin'

import { EditMenuItemDialog } from './EditMenuItemDialog'
import { DeleteMenuItemButton } from './DeleteMenuItemButton'
import { ToggleMenuItemAvailabilityButton } from './ToggleMenuItemAvailabilityButton'

export default async function MenuItemsPage() {
    const { supabase, tenantId } = await getAdminContext()

    const { data: categories } = await supabase
        .from('menu_categories')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('sort_order', { ascending: true })

    const { data: items } = await supabase
        .from('menu_items')
        .select('*, menu_categories(name)')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false })

    // Group items by category for better visualization
    const groupedItems = categories?.map(cat => ({
        ...cat,
        items: items?.filter(item => item.category_id === cat.id) || []
    })) || []

    return (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
            <div className="xl:self-start">
                <Card className="overflow-hidden border-primary/20 shadow-sm xl:sticky xl:top-24">
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

            <div className="space-y-8">
                {groupedItems.map((group) => (
                    <div key={group.id} className="space-y-4">
                        <h2 className="flex items-center gap-2 px-1 text-xl font-black uppercase tracking-widest text-zinc-800 dark:text-zinc-200">
                            {group.name}
                            {group.items.length > 0 && (
                                <span className="text-xs font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-500 px-2 py-1 rounded-md">
                                    {group.items.length} platos
                                </span>
                            )}
                        </h2>

                        <div className="grid gap-3">
                            {group.items.length === 0 && (
                                <p className="text-sm text-muted-foreground italic px-4 py-8 border-2 border-dashed rounded-2xl text-center">
                                    No hay platos en esta categoría.
                                </p>
                            )}
                            {group.items.map((item: any) => (
                                <div
                                    key={item.id}
                                    className="group rounded-2xl border bg-white p-4 transition-all hover:border-primary/50 hover:shadow-lg dark:bg-zinc-900"
                                >
                                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                                        <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl bg-zinc-100 shadow-inner dark:bg-zinc-800">
                                            {item.image_url ? (
                                                <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" />
                                            ) : (
                                                <ImageIcon className="h-6 w-6 text-zinc-300" />
                                            )}
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                                <div className="min-w-0">
                                                    <h3 className="break-words text-lg font-black leading-tight">{item.name}</h3>
                                                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                                                        {item.description || 'Sin descripción'}
                                                    </p>
                                                    <p className="mt-2 font-black text-primary">${item.price}</p>
                                                </div>

                                                <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                                                    <span
                                                        className={[
                                                            'rounded-full border-2 px-3 py-1 text-[0.68rem] font-extrabold uppercase tracking-[0.16em]',
                                                            item.available
                                                                ? 'border-emerald-700 bg-emerald-50 text-emerald-800'
                                                                : 'border-amber-700 bg-amber-50 text-amber-800',
                                                        ].join(' ')}
                                                    >
                                                        {item.available ? 'Visible hoy' : 'No hay hoy'}
                                                    </span>
                                                    <ToggleMenuItemAvailabilityButton
                                                        itemId={item.id}
                                                        itemName={item.name}
                                                        available={Boolean(item.available)}
                                                    />
                                                    <EditMenuItemDialog item={item} categories={categories || []} />
                                                    <DeleteMenuItemButton
                                                        itemId={item.id}
                                                        itemName={item.name}
                                                    />
                                                </div>
                                            </div>
                                        </div>
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
