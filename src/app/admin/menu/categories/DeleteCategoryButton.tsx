'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'

import { deleteCategory } from './actions'

export function DeleteCategoryButton({
    categoryId,
    categoryName
}: {
    categoryId: string
    categoryName: string
}) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    async function handleDelete() {
        const confirmed = window.confirm(
            `Vas a eliminar la categoría "${categoryName}". Esta acción no se puede deshacer.`
        )

        if (!confirmed) return

        setLoading(true)

        try {
            await deleteCategory(categoryId)
            toast.success('Categoría eliminada con éxito')
            router.refresh()
        } catch (error: any) {
            const message = error?.message || 'No se pudo eliminar la categoría'
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
            className="h-8 w-8 text-destructive/60 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
            disabled={loading}
            onClick={handleDelete}
        >
            <Trash2 className="h-4 w-4" />
        </Button>
    )
}
