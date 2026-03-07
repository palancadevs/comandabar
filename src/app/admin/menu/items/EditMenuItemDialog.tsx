'use client'

import { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from '@/components/ui/dialog'
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
import { Pencil } from 'lucide-react'
import { updateMenuItem } from './actions'
import { toast } from 'sonner'

interface MenuItem {
    id: string
    name: string
    description: string | null
    price: number
    category_id: string
    image_url: string | null
}

interface Category {
    id: string
    name: string
}

export function EditMenuItemDialog({
    item,
    categories
}: {
    item: MenuItem,
    categories: Category[]
}) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        try {
            await updateMenuItem(item.id, formData)
            setOpen(false)
            toast.success('Plato actualizado con éxito')
        } catch (error: any) {
            toast.error('Error al actualizar: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Pencil className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Editar Plato</DialogTitle>
                </DialogHeader>
                <form action={handleSubmit} className="space-y-4 py-4">
                    <input type="hidden" name="currentImageUrl" value={item.image_url || ''} />

                    <div className="grid gap-2">
                        <Label htmlFor="edit-category">Categoría</Label>
                        <Select name="categoryId" defaultValue={item.category_id}>
                            <SelectTrigger id="edit-category">
                                <SelectValue placeholder="Seleccionar categoría" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map((cat) => (
                                    <SelectItem key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="edit-name">Nombre</Label>
                        <Input
                            id="edit-name"
                            name="name"
                            defaultValue={item.name}
                            placeholder="Ej: Hamburguesa"
                            required
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="edit-description">Descripción</Label>
                        <Textarea
                            id="edit-description"
                            name="description"
                            defaultValue={item.description || ''}
                            placeholder="Ingredientes..."
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="edit-price">Precio</Label>
                        <Input
                            id="edit-price"
                            name="price"
                            type="number"
                            step="0.01"
                            defaultValue={item.price}
                            required
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="edit-image">Nueva Imagen (opcional)</Label>
                        <Input id="edit-image" name="image" type="file" accept="image/*" />
                    </div>

                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Guardando...' : 'Guardar Cambios'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
