import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { login } from '../actions'
import Link from 'next/link'

export default async function LoginPage({
    searchParams,
}: {
    searchParams: Promise<{ message: string }>
}) {
    const { message } = await searchParams

    return (
        <div className="flex h-screen w-full items-center justify-center px-4 bg-zinc-50 dark:bg-zinc-950">
            <Card className="mx-auto max-w-sm w-full">
                <CardHeader>
                    <CardTitle className="text-2xl text-center">ComandaApp</CardTitle>
                    <CardDescription className="text-center">
                        Ingresa a tu panel de administración
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={login} className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="m@example.com"
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <div className="flex items-center">
                                <Label htmlFor="password">Contraseña</Label>
                            </div>
                            <Input id="password" name="password" type="password" required autoComplete="current-password" />
                        </div>
                        {message && (
                            <p className="text-sm text-red-500 text-center">
                                {message}
                            </p>
                        )}
                        <Button type="submit" className="w-full">
                            Iniciar Sesión
                        </Button>
                    </form>
                    <div className="mt-4 text-center text-sm">
                        ¿No tienes una cuenta?{' '}
                        <Link href="/auth/register" className="underline">
                            Regístrate y prueba gratis
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
