'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
    const router = useRouter()

    async function handleDelete() {
        const confirmed = window.confirm(
            `Vas a eliminar el plato "${itemName}". Esta acción no se puede deshacer.`
        )

        if (!confirmed) return

        setLoading(true)

        try {
            const result = await deleteMenuItem(itemId)

            if (!result?.ok) {
                const message = result?.error || 'No se pudo eliminar el plato'
                toast.error(message)
                window.alert(message)
                return
            }

            toast.success('Plato eliminado con éxito')
            router.refresh()
        } catch {
            const message = 'Ocurrió un error inesperado al eliminar el plato'
            toast.error(message)
            window.alert(message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full text-destructive/60 transition-all hover:bg-destructive/10 hover:text-destructive sm:opacity-0 sm:group-hover:opacity-100"
            disabled={loading}
            onClick={handleDelete}
        >
            <Trash2 className="h-4 w-4" />
        </Button>
    )
}
