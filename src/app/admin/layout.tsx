import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { signout } from '@/app/auth/actions'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { AdminNav } from './AdminNav'

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
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col overflow-x-hidden">
            <header className="sticky top-0 z-20 border-b bg-background/95 px-4 py-3 backdrop-blur md:px-6">
                <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                        <Link href="/admin" className="font-bold text-xl tracking-tight">ComandaApp</Link>
                    </div>
                    <div className="shrink-0">
                        <form action={signout}>
                            <Button variant="outline" size="sm" type="submit">
                                Cerrar Sesión
                            </Button>
                        </form>
                    </div>
                </div>
                <div className="mt-3">
                    <AdminNav />
                </div>
            </header>
            <main className="flex-1 p-4 md:p-6 max-w-6xl mx-auto w-full overflow-x-hidden">
                {children}
            </main>
        </div>
    )
}
