'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createOrder({ tenantId, tableId, items }: {
    tenantId: string,
    tableId: string | undefined,
    items: any[]
}) {
    const supabase = await createClient()

    // 1. If we have a tableId, we should ideally have a table_session.
    // For the MVP and speed, we will use the tableId directly if no session exists,
    // or create a default session for that table.

    let sessionId = null

    if (tableId) {
        // Check for active session on this table
        const { data: session } = await supabase
            .from('table_sessions')
            .select('id')
            .eq('table_id', tableId)
            .eq('status', 'abierta')
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

        if (session) {
            sessionId = session.id
        } else {
            // Create a new session
            const { data: newSession, error: sessionError } = await supabase
                .from('table_sessions')
                .insert({
                    tenant_id: tenantId,
                    table_id: tableId,
                    status: 'abierta'
                })
                .select()
                .single()

            if (sessionError) {
                console.error('Error creating session:', sessionError)
            } else {
                sessionId = newSession.id
            }
        }
    }

    // 2. Create the Order
    const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
            tenant_id: tenantId,
            table_id: tableId,
            table_session_id: sessionId,
            status: 'pendiente'
        })
        .select()
        .single()

    if (orderError) throw new Error(orderError.message)

    // 3. Create Order Items
    const orderItems = items.map(item => ({
        order_id: order.id,
        menu_item_id: item.menu_item_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        sector: item.sector
    }))

    const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

    if (itemsError) throw new Error(itemsError.message)

    revalidatePath('/admin/orders') // For the KDS
    return { success: true, orderId: order.id }
}
