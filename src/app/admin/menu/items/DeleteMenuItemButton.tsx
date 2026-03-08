'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'

import { deleteMenuItem } from './actions'

export function DeleteMenuItemButton({
    itemId,
    itemName
}: {
    itemId: string
    itemName: string
}) {
    const [loading, setLoading] = useState(false)

    async function handleDelete() {
        const confirmed = window.confirm(
            `Vas a eliminar el plato "${itemName}". Esta acción no se puede deshacer.`
        )

        if (!confirmed) return

        setLoading(true)

        try {
            await deleteMenuItem(itemId)
            toast.success('Plato eliminado con éxito')
        } catch (error: any) {
            toast.error(error?.message || 'No se pudo eliminar el plato')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-destructive/50 hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all rounded-full"
            disabled={loading}
            onClick={handleDelete}
        >
            <Trash2 className="h-4 w-4" />
        </Button>
    )
}
