'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function OnboardingWizard() {
    const [step, setStep] = useState(1)

    return (
        <div className="max-w-2xl mx-auto py-12 px-4">
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold mb-2">Bienvenido a ComandaApp</h1>
                <p className="text-muted-foreground">Configura tu local en pocos pasos para empezar a vender.</p>

                <div className="flex justify-center gap-2 mt-6">
                    {[1, 2, 3].map((s) => (
                        <div
                            key={s}
                            className={`h-2 w-12 rounded-full ${s <= step ? 'bg-primary' : 'bg-zinc-200'}`}
                        />
                    ))}
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>
                        {step === 1 && "Información del Local"}
                        {step === 2 && "Personalización"}
                        {step === 3 && "¡Todo listo!"}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {step === 1 && (
                        <div className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Nombre Comercial</Label>
                                <Input id="name" placeholder="Ej: Monkey Bar" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="address">Dirección (Opcional)</Label>
                                <Input id="address" placeholder="Ej: Calle Falsa 123" />
                            </div>
                            <Button className="w-full" onClick={() => setStep(2)}>Siguiente</Button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="theme">Color de Marca</Label>
                                <Input id="theme" type="color" className="h-10 p-1" defaultValue="#0ea5e9" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="logo">Logo (Opcional)</Label>
                                <Input id="logo" type="file" accept="image/*" />
                            </div>
                            <div className="flex gap-4">
                                <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>Atrás</Button>
                                <Button className="flex-1" onClick={() => setStep(3)}>Finalizar</Button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="text-center space-y-4 py-4">
                            <div className="bg-green-100 text-green-700 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <p className="font-medium text-lg">¡Configuración inicial completada!</p>
                            <p className="text-sm text-muted-foreground italic">Estamos redirigiéndote a tu panel de administración...</p>
                            <Button className="w-full" onClick={() => window.location.href = '/admin'}>Ir al Panel</Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
