'use client'

import { useEffect, useState } from 'react'
import { Clock, Check, Utensils } from 'lucide-react'
import { toast } from 'sonner'

import { createClient } from '@/lib/supabase/client'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

import { updateOrderStatus } from './actions'

type ConnectionState = 'connecting' | 'live' | 'fallback'

export default function KDSContent({ initialOrders, tenantId }: { initialOrders: any[]; tenantId: string }) {
    const [orders, setOrders] = useState(initialOrders)
    const [connectionState, setConnectionState] = useState<ConnectionState>('connecting')
    const [supabase] = useState(() => createClient())

    async function fetchActiveOrders() {
        const { data, error } = await supabase
            .from('orders')
            .select('*, tables(name), order_items(*, menu_items(name))')
            .eq('tenant_id', tenantId)
            .in('status', ['pendiente', 'en_preparacion'])
            .order('created_at', { ascending: true })

        if (error) {
            console.error('KDS fetch error:', error)
            return
        }

        setOrders(data || [])
    }

    useEffect(() => {
        const channel = supabase
            .channel(`kds-orders-${tenantId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'orders',
                    filter: `tenant_id=eq.${tenantId}`,
                },
                async () => {
                    await fetchActiveOrders()
                }
            )
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'order_items',
                },
                async () => {
                    await fetchActiveOrders()
                }
            )
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    setConnectionState('live')
                }

                if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
                    setConnectionState('fallback')
                }
            })

        const interval = window.setInterval(() => {
            fetchActiveOrders()
        }, 4000)

        return () => {
            window.clearInterval(interval)
            supabase.removeChannel(channel)
        }
    }, [supabase, tenantId])

    const handleStatusChange = async (orderId: string, newStatus: string) => {
        try {
            await updateOrderStatus(orderId, newStatus)
            setOrders((prev) =>
                prev
                    .map((order) => (order.id === orderId ? { ...order, status: newStatus } : order))
                    .filter((order) => ['pendiente', 'en_preparacion'].includes(order.status))
            )
        } catch {
            toast.error('No pudimos actualizar el estado del pedido')
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="rounded-full border-2 border-[var(--brand-black)] bg-[var(--brand-cream)] px-4 py-2 text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--brand-black)]">
                    {connectionState === 'live' && 'Actualización en vivo'}
                    {connectionState === 'connecting' && 'Conectando cocina'}
                    {connectionState === 'fallback' && 'Actualizando cada pocos segundos'}
                </div>
                <p className="text-sm font-medium text-[rgba(18,13,10,0.68)]">
                    {orders.length} pedidos activos en cocina
                </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {orders.map((order) => (
                    <Card
                        key={order.id}
                        className={`flex flex-col border-t-4 ${order.status === 'pendiente' ? 'border-t-orange-500' : 'border-t-blue-500'}`}
                    >
                        <CardHeader className="bg-zinc-50/50 p-4">
                            <div className="flex items-start justify-between">
                                <div>
                                    <CardTitle className="text-xl">Mesa {order.tables?.name || '??'}</CardTitle>
                                    <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                                        <Clock className="h-3 w-3" />
                                        {new Date(order.created_at).toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </div>
                                </div>
                                <Badge
                                    variant={order.status === 'pendiente' ? 'secondary' : 'default'}
                                    className="text-[10px] uppercase"
                                >
                                    {order.status === 'pendiente' ? 'Pendiente' : 'Preparando'}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1 space-y-4 p-4">
                            <div className="space-y-2">
                                {order.order_items?.map((item: any) => (
                                    <div key={item.id} className="flex justify-between text-sm">
                                        <span className="font-medium">
                                            {item.quantity}x {item.menu_items?.name}
                                        </span>
                                        {item.notes && (
                                            <p className="mt-0.5 block text-[10px] italic text-zinc-500">
                                                {item.notes}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                        <CardFooter className="gap-2 bg-zinc-50/50 p-4">
                            {order.status === 'pendiente' && (
                                <Button
                                    className="h-10 w-full bg-blue-600 font-bold hover:bg-blue-700"
                                    onClick={() => handleStatusChange(order.id, 'en_preparacion')}
                                >
                                    PREPARAR
                                </Button>
                            )}
                            {order.status === 'en_preparacion' && (
                                <Button
                                    className="flex h-10 w-full gap-2 bg-green-600 font-bold hover:bg-green-700"
                                    onClick={() => handleStatusChange(order.id, 'listo')}
                                >
                                    <Check className="h-4 w-4" /> LISTO
                                </Button>
                            )}
                        </CardFooter>
                    </Card>
                ))}

                {orders.length === 0 && (
                    <div className="col-span-full flex flex-col items-center gap-4 py-20 text-center opacity-40">
                        <Utensils className="h-16 w-16" />
                        <p className="text-lg font-medium">No hay pedidos activos por el momento.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
