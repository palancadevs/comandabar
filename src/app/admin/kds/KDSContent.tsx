'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Clock, Check, Utensils } from 'lucide-react'
import { updateOrderStatus } from './actions'

export default function KDSContent({ initialOrders, tenantId }: { initialOrders: any[], tenantId: string }) {
    const [orders, setOrders] = useState(initialOrders)
    const supabase = createClient()

    useEffect(() => {
        // Subscribe to changes in the orders table for this tenant
        const channel = supabase
            .channel('kds-orders')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'orders',
                    filter: `tenant_id=eq.${tenantId}`,
                },
                async (payload) => {
                    console.log('Order Change Detected:', payload)
                    // For simplicity, re-fetch orders or update state based on payload
                    // For the MVP, we re-fetch to ensure relations are loaded (tables, items)
                    const { data } = await supabase
                        .from('orders')
                        .select('*, tables(name), order_items(*, menu_items(name))')
                        .eq('tenant_id', tenantId)
                        .in('status', ['pendiente', 'en_preparacion'])
                        .order('created_at', { ascending: true })

                    if (data) setOrders(data)
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [tenantId, supabase])

    const handleStatusChange = async (orderId: string, newStatus: string) => {
        try {
            await updateOrderStatus(orderId, newStatus)
            // Optimistic update
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o).filter(o => ['pendiente', 'en_preparacion'].includes(o.status)))
        } catch (error) {
            alert('Error al actualizar estado')
        }
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {orders.map((order) => (
                <Card key={order.id} className={`flex flex-col border-t-4 ${order.status === 'pendiente' ? 'border-t-orange-500' : 'border-t-blue-500'}`}>
                    <CardHeader className="p-4 bg-zinc-50/50">
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="text-xl">Mesa {order.tables?.name || '??'}</CardTitle>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                    <Clock className="h-3 w-3" />
                                    {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                            <Badge variant={order.status === 'pendiente' ? 'secondary' : 'default'} className="uppercase text-[10px]">
                                {order.status === 'pendiente' ? 'Pendiente' : 'Preparando'}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="p-4 flex-1 space-y-4">
                        <div className="space-y-2">
                            {order.order_items?.map((item: any) => (
                                <div key={item.id} className="flex justify-between text-sm">
                                    <span className="font-medium">
                                        {item.quantity}x {item.menu_items?.name}
                                    </span>
                                    {item.notes && <p className="text-[10px] text-zinc-500 italic block mt-0.5">{item.notes}</p>}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                    <CardFooter className="p-4 bg-zinc-50/50 gap-2">
                        {order.status === 'pendiente' && (
                            <Button className="w-full h-10 bg-blue-600 hover:bg-blue-700 font-bold" onClick={() => handleStatusChange(order.id, 'en_preparacion')}>
                                PREPARAR
                            </Button>
                        )}
                        {order.status === 'en_preparacion' && (
                            <Button className="w-full h-10 bg-green-600 hover:bg-green-700 font-bold flex gap-2" onClick={() => handleStatusChange(order.id, 'listo')}>
                                <Check className="h-4 w-4" /> LISTO
                            </Button>
                        )}
                    </CardFooter>
                </Card>
            ))}

            {orders.length === 0 && (
                <div className="col-span-full py-20 text-center flex flex-col items-center gap-4 opacity-40">
                    <Utensils className="h-16 w-16" />
                    <p className="text-lg font-medium">No hay pedidos activos por el momento.</p>
                </div>
            )}
        </div>
    )
}
