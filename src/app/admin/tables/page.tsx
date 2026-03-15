import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Download, ExternalLink, PlusCircle, ReceiptText, Trash2 } from 'lucide-react'
import { getAdminContext } from '@/lib/auth/admin'

import { closeTableSession, createTable, deleteTable, openTableSession } from './actions'

const currency = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
})

function formatPrice(value: number) {
    return currency.format(value || 0)
}

export default async function TablesPage() {
    const { supabase, tenantId, tenantSlug } = await getAdminContext()

    const [{ data: tables }, { data: activeSessions }] = await Promise.all([
        supabase
            .from('tables')
            .select('*')
            .eq('tenant_id', tenantId)
            .order('name', { ascending: true }),
        supabase
            .from('table_sessions')
            .select('id, table_id, opened_at')
            .eq('tenant_id', tenantId)
            .is('closed_at', null),
    ])

    const activeSessionIds = activeSessions?.map((session) => session.id) || []

    const { data: sessionOrders } = activeSessionIds.length > 0
        ? await supabase
            .from('orders')
            .select('id, table_session_id, status, order_items(quantity, unit_price)')
            .eq('tenant_id', tenantId)
            .in('table_session_id', activeSessionIds)
        : { data: [] as any[] }

    const sessionsByTable = new Map(
        (activeSessions || []).map((session) => [session.table_id, session])
    )

    const sessionMetrics = new Map<string, { total: number; orders: number; activeOrders: number }>()

    for (const order of sessionOrders || []) {
        const current = sessionMetrics.get(order.table_session_id) || { total: 0, orders: 0, activeOrders: 0 }
        const orderTotal = order.order_items?.reduce((sum: number, item: any) => {
            return sum + Number(item.quantity || 0) * Number(item.unit_price || 0)
        }, 0) || 0

        sessionMetrics.set(order.table_session_id, {
            total: current.total + orderTotal,
            orders: current.orders + 1,
            activeOrders: current.activeOrders + (['pendiente', 'en_preparacion', 'listo'].includes(order.status) ? 1 : 0),
        })
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Mesas</h1>
                    <p className="text-muted-foreground">Abre, controla y cierra mesas con total y medio de pago.</p>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <Card className="brand-panel bg-[var(--brand-cream)] py-0">
                        <CardHeader className="border-b-[3px] border-[var(--brand-black)] px-6 py-5">
                            <CardTitle className="font-display text-4xl leading-none">Nueva mesa</CardTitle>
                        </CardHeader>
                        <CardContent className="px-6 py-6">
                            <form action={createTable} className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Nombre / Número de Mesa</Label>
                                    <Input id="name" name="name" placeholder="Ej: Mesa 1, Barra, Terraza 4" required />
                                </div>
                                <Button type="submit" className="w-full rounded-full border-2 border-[var(--brand-black)] bg-[var(--brand-orange)] text-[var(--brand-cream)] shadow-[4px_4px_0_var(--brand-black)] hover:bg-[var(--brand-orange)]">
                                    <PlusCircle className="mr-2 h-4 w-4" /> Agregar Mesa
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-2">
                    <Card className="brand-panel bg-[var(--brand-cream)] py-0">
                        <CardHeader className="border-b-[3px] border-[var(--brand-black)] px-6 py-5">
                            <CardTitle className="font-display text-4xl leading-none">Operación por mesa</CardTitle>
                        </CardHeader>
                        <CardContent className="px-6 py-6">
                            <div className="grid sm:grid-cols-2 gap-4">
                                {tables?.length === 0 && (
                                    <p className="text-sm text-muted-foreground text-center py-8 col-span-2">No hay mesas creadas.</p>
                                )}

                                {tables?.map((table) => {
                                    const qrUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://comandaapp-eta.vercel.app'}/${tenantSlug}/${table.id}`
                                    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrUrl)}`
                                    const activeSession = sessionsByTable.get(table.id)
                                    const metrics = activeSession ? sessionMetrics.get(activeSession.id) : null
                                    const statusLabel = activeSession ? 'Abierta' : 'Libre'
                                    const statusClasses = activeSession
                                        ? 'bg-[var(--brand-black)] text-[var(--brand-cream)]'
                                        : 'bg-[var(--brand-yellow)] text-[var(--brand-black)]'

                                    return (
                                        <div key={table.id} className="brand-panel-soft bg-[var(--brand-cream-strong)] p-4 flex flex-col gap-4 relative">
                                            <div className="flex justify-between items-start gap-3">
                                                <div>
                                                    <h3 className="font-display text-3xl leading-none">{table.name}</h3>
                                                    <div className={`mt-3 inline-flex rounded-full border-2 border-[var(--brand-black)] px-3 py-1 text-[0.68rem] font-extrabold uppercase tracking-[0.16em] ${statusClasses}`}>
                                                        {statusLabel}
                                                    </div>
                                                </div>
                                                <form action={async () => {
                                                    'use server'
                                                    await deleteTable(table.id)
                                                }}>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </form>
                                            </div>

                                            <div className="grid grid-cols-[96px_1fr] gap-4 items-start">
                                                <div className="bg-white p-2 rounded-md border shadow-sm">
                                                    <img src={qrImageUrl} alt={`QR Mesa ${table.name}`} className="w-20 h-20" />
                                                </div>

                                                <div className="space-y-3">
                                                    {activeSession ? (
                                                        <>
                                                            <div className="rounded-2xl border-2 border-[var(--brand-black)] bg-[var(--brand-cream)] p-3">
                                                                <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.16em] text-[var(--brand-orange-deep)]">
                                                                    Acumulado actual
                                                                </p>
                                                                <p className="mt-2 text-2xl font-extrabold">{formatPrice(metrics?.total || 0)}</p>
                                                                <p className="mt-1 text-sm text-[rgba(18,13,10,0.7)]">
                                                                    {metrics?.orders || 0} pedidos, {metrics?.activeOrders || 0} activos
                                                                </p>
                                                                <p className="mt-1 text-xs font-medium text-[rgba(18,13,10,0.7)]">
                                                                    Abierta desde {new Date(activeSession.opened_at).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                                                                </p>
                                                            </div>

                                                            <form action={closeTableSession} className="space-y-3">
                                                                <input type="hidden" name="tableId" value={table.id} />
                                                                <input type="hidden" name="sessionId" value={activeSession.id} />
                                                                <div className="grid gap-2">
                                                                    <Label htmlFor={`paymentMethod-${table.id}`}>Medio de pago</Label>
                                                                    <select
                                                                        id={`paymentMethod-${table.id}`}
                                                                        name="paymentMethod"
                                                                        defaultValue="efectivo"
                                                                        className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                                                                    >
                                                                        <option value="efectivo">Efectivo</option>
                                                                        <option value="tarjeta">Tarjeta</option>
                                                                        <option value="transferencia">Transferencia / QR</option>
                                                                    </select>
                                                                </div>
                                                                <Button type="submit" className="w-full rounded-full border-2 border-[var(--brand-black)] bg-[var(--brand-black)] text-[var(--brand-cream)] shadow-[4px_4px_0_var(--brand-black)] hover:bg-[var(--brand-black)]">
                                                                    <ReceiptText className="mr-2 h-4 w-4" /> Cobrar y cerrar mesa
                                                                </Button>
                                                            </form>
                                                        </>
                                                    ) : (
                                                        <form action={openTableSession} className="space-y-3">
                                                            <input type="hidden" name="tableId" value={table.id} />
                                                            <p className="text-sm text-[rgba(18,13,10,0.72)]">
                                                                La mesa está libre. Puedes abrirla manualmente o dejar que se abra cuando entre el primer pedido QR.
                                                            </p>
                                                            <Button type="submit" className="w-full rounded-full border-2 border-[var(--brand-black)] bg-[var(--brand-yellow)] text-[var(--brand-black)] shadow-[4px_4px_0_var(--brand-black)] hover:bg-[var(--brand-yellow)]">
                                                                Abrir mesa
                                                            </Button>
                                                        </form>
                                                    )}

                                                    <Button asChild variant="outline" size="sm" className="w-full rounded-full border-2 border-[var(--brand-black)] bg-transparent">
                                                        <a href={qrUrl} target="_blank" rel="noopener noreferrer">
                                                            <ExternalLink className="mr-2 h-3 w-3" /> Ver como cliente
                                                        </a>
                                                    </Button>
                                                    <Button asChild variant="outline" size="sm" className="w-full rounded-full border-2 border-[var(--brand-black)] bg-[var(--brand-cream)]">
                                                        <a href={`/admin/tables/${table.id}/qr-pdf`}>
                                                            <Download className="mr-2 h-3 w-3" /> Descargar QR en PDF
                                                        </a>
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
