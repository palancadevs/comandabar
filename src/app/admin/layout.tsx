import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { signout } from '@/app/auth/actions'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/auth/login')
    }

    // TODO: Verify if user is admin of some tenant

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col">
            <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 justify-between">
                <div className="flex items-center gap-6">
                    <Link href="/admin" className="font-bold text-xl tracking-tight">ComandaApp</Link>
                    <nav className="hidden md:flex items-center gap-4 text-sm font-medium">
                        <Link href="/admin" className="hover:text-primary transition-colors text-muted-foreground">Dashboard</Link>
                        <div className="flex items-center gap-4 border-l pl-4 ml-2 border-zinc-200 dark:border-zinc-800">
                            <Link href="/admin/menu/categories" className="hover:text-primary transition-colors text-muted-foreground">Categorías</Link>
                            <Link href="/admin/menu/items" className="text-sm font-medium hover:text-primary transition-colors">Platos</Link>
                            <Link href="/admin/kds" className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1">
                                <div className="h-2 w-2 rounded-full bg-red-500"></div>
                                KDS Cocina
                            </Link>
                        </div>
                        <Link href="/admin/settings" className="text-sm font-medium hover:text-primary transition-colors">Ajustes</Link>
                    </nav>
                </div>
                <form action={signout}>
                    <Button variant="outline" size="sm" type="submit">
                        Cerrar Sesión
                    </Button>
                </form>
            </header>
            <main className="flex-1 p-4 md:p-6 max-w-6xl mx-auto w-full">
                {children}
            </main>
        </div>
    )
}
