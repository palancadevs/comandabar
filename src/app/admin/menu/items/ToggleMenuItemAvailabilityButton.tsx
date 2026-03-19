'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'

import { setMenuItemAvailability } from './actions'

export function ToggleMenuItemAvailabilityButton({
    itemId,
    itemName,
    available,
}: {
    itemId: string
    itemName: string
    available: boolean
}) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    async function handleToggle() {
        setLoading(true)

        try {
            const nextAvailable = !available
            const result = await setMenuItemAvailability(itemId, nextAvailable)

            if (!result?.ok) {
                toast.error(result?.error || 'No se pudo actualizar la disponibilidad')
                return
            }

            toast.success(
                nextAvailable
                    ? `"${itemName}" volvió a la carta`
                    : `"${itemName}" quedó oculto por hoy`
            )
            router.refresh()
        } catch {
            toast.error('Ocurrió un error inesperado al actualizar el plato')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Button
            type="button"
            variant="outline"
            size="sm"
            className={[
                'h-9 rounded-full border-2 px-3 text-xs font-extrabold uppercase tracking-[0.14em]',
                available
                    ? 'border-emerald-700 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                    : 'border-amber-700 bg-amber-50 text-amber-800 hover:bg-amber-100',
            ].join(' ')}
            disabled={loading}
            onClick={handleToggle}
        >
            {available ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
            {available ? 'Disponible' : 'Oculto'}
        </Button>
    )
}
