'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { ShoppingBag, ChevronRight, Utensils, Plus, Minus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from '@/components/ui/sheet'
import { createOrder } from './actions'
import { useTransition } from 'react'

export default function MenuContent({ tenant, categories, tableId }: any) {
    const [cart, setCart] = useState<any[]>([])
    const [isPending, startTransition] = useTransition()
    const [isCartOpen, setIsCartOpen] = useState(false)

    const addToCart = (item: any) => {
        setCart(prev => {
            const existing = prev.find(i => i.id === item.id)
            if (existing) {
                return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i)
            }
            return [...prev, { ...item, quantity: 1 }]
        })
    }

    const removeFromCart = (itemId: string) => {
        setCart(prev => prev.map(i => i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i).filter(i => i.quantity > 0))
    }

    const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0)
    const itemCount = cart.reduce((acc, item) => acc + item.quantity, 0)

    const handleSendOrder = async () => {
        startTransition(async () => {
            try {
                await createOrder({
                    tenantId: tenant.id,
                    tableId,
                    items: cart.map(i => ({
                        menu_item_id: i.id,
                        quantity: i.quantity,
                        unit_price: i.price,
                        sector: i.sector || 'cocina'
                    }))
                })
                setCart([])
                setIsCartOpen(false)
                alert('¡Pedido enviado con éxito! Lo estamos preparando.')
            } catch (error: any) {
                alert('Error al enviar pedido: ' + error.message)
            }
        })
    }

    return (
        <div className="min-h-screen bg-zinc-50 pb-24" style={{ '--primary-color': tenant.primary_color } as any}>
            {/* Header / Hero */}
            <div className="relative h-48 md:h-64 bg-zinc-900 overflow-hidden">
                {tenant.cover_url ? (
                    <img src={tenant.cover_url} alt={tenant.name} className="w-full h-full object-cover opacity-60" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center opacity-20">
                        <Utensils className="h-16 w-16 text-white" />
                    </div>
                )}
                <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/80 to-transparent text-white">
                    <div className="flex items-end gap-4">
                        {tenant.logo_url && (
                            <div className="h-16 w-16 rounded-xl bg-white p-1 shadow-lg flex-shrink-0">
                                <img src={tenant.logo_url} alt="Logo" className="w-full h-full object-contain" />
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <h1 className="text-2xl font-bold leading-tight">{tenant.name}</h1>
                            <p className="text-xs text-zinc-300 opacity-90 line-clamp-1">{tenant.description}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-2xl mx-auto p-4 space-y-8 mt-4">
                {categories?.map((category: any) => (
                    <section key={category.id} className="space-y-4">
                        <h2 className="text-xl font-bold flex items-center gap-2 px-2">
                            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: tenant.primary_color || '#000' }}></span>
                            {category.name}
                        </h2>
                        <div className="grid gap-3">
                            {category.menu_items?.filter((item: any) => item.available).map((item: any) => (
                                <Card key={item.id} className="overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow active:scale-[0.98] cursor-pointer group" onClick={() => addToCart(item)}>
                                    <CardContent className="p-3 flex gap-4">
                                        <div className="flex-1 space-y-1">
                                            <div className="flex justify-between items-start">
                                                <h3 className="font-bold">{item.name}</h3>
                                                {cart.find(i => i.id === item.id) && (
                                                    <div className="h-5 w-5 rounded-full bg-primary text-white text-[10px] flex items-center justify-center font-bold">
                                                        {cart.find(i => i.id === item.id).quantity}
                                                    </div>
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>
                                            <p className="font-bold text-sm mt-2 font-mono" style={{ color: tenant.primary_color || '#000' }}>
                                                ${item.price}
                                            </p>
                                        </div>
                                        {item.image_url && (
                                            <div className="h-20 w-20 rounded-lg overflow-hidden flex-shrink-0 bg-zinc-100">
                                                <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </section>
                ))}
            </div>

            {/* Floating Cart Button */}
            {itemCount > 0 && (
                <div className="fixed bottom-6 inset-x-0 flex justify-center px-4 z-50">
                    <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
                        <SheetTrigger asChild>
                            <Button
                                className="w-full max-w-sm h-14 rounded-2xl shadow-xl flex justify-between items-center px-6 gap-2"
                                style={{ backgroundColor: tenant.primary_color || '#000' }}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="h-7 w-7 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">{itemCount}</div>
                                    <span>Ver mi pedido</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="font-bold">${total.toFixed(2)}</span>
                                    <ChevronRight className="h-5 w-5 opacity-70" />
                                </div>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="bottom" className="h-[80vh] rounded-t-3xl p-0 overflow-hidden flex flex-col">
                            <SheetHeader className="p-6 border-b">
                                <SheetTitle className="text-xl flex items-center gap-2">
                                    <ShoppingBag className="h-5 w-5" />
                                    Tu Pedido
                                </SheetTitle>
                            </SheetHeader>

                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                {cart.map((item) => (
                                    <div key={item.id} className="flex gap-4 items-center">
                                        <div className="flex-1">
                                            <h4 className="font-bold">{item.name}</h4>
                                            <p className="text-xs text-muted-foreground">${item.price}</p>
                                        </div>
                                        <div className="flex items-center gap-3 bg-zinc-100 rounded-full px-2 py-1">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => removeFromCart(item.id)}>
                                                <Minus className="h-3 w-3" />
                                            </Button>
                                            <span className="font-bold text-sm w-4 text-center">{item.quantity}</span>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => addToCart(item)}>
                                                <Plus className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <SheetFooter className="p-6 bg-zinc-50 border-t space-y-4 sm:flex-col">
                                <div className="flex justify-between items-center w-full">
                                    <span className="text-zinc-500">Total</span>
                                    <span className="text-2xl font-bold">${total.toFixed(2)}</span>
                                </div>
                                <Button
                                    className="w-full h-12 rounded-xl text-lg font-bold"
                                    disabled={isPending || cart.length === 0}
                                    onClick={handleSendOrder}
                                    style={{ backgroundColor: tenant.primary_color || '#000' }}
                                >
                                    {isPending ? 'Enviando...' : 'Pedir ahora'}
                                </Button>
                            </SheetFooter>
                        </SheetContent>
                    </Sheet>
                </div>
            )}

            {/* Table Context Indicator */}
            {tableId && (
                <div className="fixed top-4 right-4 z-50">
                    <div className="bg-black/80 backdrop-blur-md text-white text-[10px] px-3 py-1.5 rounded-full font-bold shadow-lg border border-white/20 animate-pulse">
                        MESA DETECTADA
                    </div>
                </div>
            )}
        </div>
    )
}
