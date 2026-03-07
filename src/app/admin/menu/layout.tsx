import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Utensils, Layers } from 'lucide-react'

export default function MenuLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="space-y-6">
            <div className="relative overflow-hidden rounded-2xl bg-primary/10 p-8 border border-primary/20">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-black tracking-tight text-primary">Mi Carta</h1>
                        <p className="text-muted-foreground font-medium mt-1">
                            Personaliza la experiencia gastronómica de tus clientes.
                        </p>
                    </div>
                    <div className="flex items-center gap-2 bg-white/50 dark:bg-zinc-900/50 p-1 rounded-xl border border-white/20 backdrop-blur-sm">
                        <Link
                            href="/admin/menu/items"
                            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all hover:bg-white dark:hover:bg-zinc-800"
                        >
                            <Utensils className="h-4 w-4" /> Platos
                        </Link>
                        <Link
                            href="/admin/menu/categories"
                            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all hover:bg-white dark:hover:bg-zinc-800"
                        >
                            <Layers className="h-4 w-4" /> Categorías
                        </Link>
                    </div>
                </div>

                {/* Visual decoration */}
                <div className="absolute -top-12 -right-12 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
                <div className="absolute -bottom-12 -left-12 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                {children}
            </div>
        </div>
    )
}
