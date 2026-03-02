import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { signup } from '../actions'
import Link from 'next/link'

export default async function RegisterPage({
    searchParams,
}: {
    searchParams: Promise<{ message: string }>
}) {
    const { message } = await searchParams

    return (
        <div className="flex h-screen w-full items-center justify-center px-4 bg-zinc-50 dark:bg-zinc-950">
            <Card className="mx-auto max-w-md w-full">
                <CardHeader>
                    <CardTitle className="text-2xl text-center">Registra tu Local</CardTitle>
                    <CardDescription className="text-center">
                        Prueba ComandaApp gratis por 14 días. Sin tarjeta de crédito.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={signup} className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="localName">Nombre del Local</Label>
                            <Input
                                id="localName"
                                name="localName"
                                type="text"
                                placeholder="Ej. Bar El Patio"
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="slug">Enlace único (Slug)</Label>
                            <div className="flex items-center space-x-2">
                                <Input
                                    id="slug"
                                    name="slug"
                                    type="text"
                                    placeholder="bar-el-patio"
                                    required
                                />
                                <span className="text-sm text-muted-foreground whitespace-nowrap">.comandaapp.com.ar</span>
                            </div>
                        </div>
                        <div className="grid gap-2 relative">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="tu@email.com"
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">Contraseña</Label>
                            <Input id="password" name="password" type="password" required minLength={6} autoComplete="new-password" />
                        </div>
                        {message && (
                            <p className="text-sm text-red-500 text-center">
                                {message}
                            </p>
                        )}
                        <Button type="submit" className="w-full">
                            Crear Cuenta
                        </Button>
                    </form>
                    <div className="mt-4 text-center text-sm">
                        ¿Ya tienes una cuenta?{' '}
                        <Link href="/auth/login" className="underline">
                            Inicia sesión
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
