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
import { Pencil } from 'lucide-react'
import { updateCategory } from './actions'
import { toast } from 'sonner'

interface Category {
    id: string
    name: string
    sort_order: number
}

export function EditCategoryDialog({ category }: { category: Category }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        try {
            await updateCategory(category.id, formData)
            setOpen(false)
            toast.success('Categoría actualizada con éxito')
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
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Editar Categoría</DialogTitle>
                </DialogHeader>
                <form action={handleSubmit} className="space-y-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Nombre</Label>
                        <Input
                            id="name"
                            name="name"
                            defaultValue={category.name}
                            placeholder="Ej: Entradas"
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="sortOrder">Orden</Label>
                        <Input
                            id="sortOrder"
                            name="sortOrder"
                            type="number"
                            defaultValue={category.sort_order}
                        />
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
