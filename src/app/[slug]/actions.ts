'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function createOrder({ tenantId, tableId, items }: {
    tenantId: string,
    tableId: string | undefined,
    items: any[]
}) {
    const supabase = createAdminClient()

    if (!tenantId) {
        throw new Error('Tenant inválido')
    }

    if (!Array.isArray(items) || items.length === 0) {
        throw new Error('El pedido no tiene productos')
    }

    const { data: tenant, error: tenantError } = await supabase
        .from('tenants')
        .select('id, slug')
        .eq('id', tenantId)
        .single()

    if (tenantError || !tenant) {
        throw new Error('No encontramos el local para este pedido')
    }

    let validatedTableId: string | null = null
    if (tableId) {
        const { data: table, error: tableError } = await supabase
            .from('tables')
            .select('id')
            .eq('tenant_id', tenantId)
            .eq('id', tableId)
            .eq('active', true)
            .single()

        if (tableError || !table) {
            throw new Error('La mesa seleccionada no está disponible')
        }

        validatedTableId = table.id
    }

    const requestedItemIds = [...new Set(items.map((item) => item.menu_item_id).filter(Boolean))]
    const { data: menuItems, error: menuItemsError } = await supabase
        .from('menu_items')
        .select('id, price, sector, available')
        .eq('tenant_id', tenantId)
        .in('id', requestedItemIds)

    if (menuItemsError) {
        throw new Error(menuItemsError.message)
    }

    const menuItemsById = new Map((menuItems || []).map((item) => [item.id, item]))
    const invalidItem = items.find((item) => {
        const menuItem = menuItemsById.get(item.menu_item_id)
        return !menuItem || !menuItem.available
    })

    if (invalidItem) {
        throw new Error('Hay productos del pedido que ya no están disponibles')
    }

    // 1. If we have a tableId, we should ideally have a table_session.
    // For the MVP and speed, we will use the tableId directly if no session exists,
    // or create a default session for that table.

    let sessionId = null

    if (validatedTableId) {
        // Check for active session on this table
        const { data: session, error: sessionLookupError } = await supabase
            .from('table_sessions')
            .select('id')
            .eq('tenant_id', tenantId)
            .eq('table_id', validatedTableId)
            .is('closed_at', null)
            .order('opened_at', { ascending: false })
            .limit(1)
            .single()

        if (sessionLookupError && sessionLookupError.code !== 'PGRST116') {
            throw new Error(sessionLookupError.message)
        }

        if (session) {
            sessionId = session.id
        } else {
            // Create a new session
            const { data: newSession, error: sessionError } = await supabase
                .from('table_sessions')
                .insert({
                    tenant_id: tenantId,
                    table_id: validatedTableId,
                })
                .select()
                .single()

            if (sessionError) {
                throw new Error(sessionError.message)
            }

            sessionId = newSession.id

            await supabase
                .from('tables')
                .update({ status: 'ocupada' })
                .eq('tenant_id', tenantId)
                .eq('id', validatedTableId)
        }
    }

    // 2. Create the Order
    const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
            tenant_id: tenantId,
            table_id: validatedTableId,
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
        quantity: Number(item.quantity || 1),
        unit_price: Number(menuItemsById.get(item.menu_item_id)?.price || item.unit_price || 0),
        sector: menuItemsById.get(item.menu_item_id)?.sector || item.sector || 'cocina',
    }))

    const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

    if (itemsError) {
        await supabase.from('orders').delete().eq('id', order.id)
        throw new Error(itemsError.message)
    }

    if (validatedTableId) {
        await supabase
            .from('tables')
            .update({ status: 'ocupada' })
            .eq('tenant_id', tenantId)
            .eq('id', validatedTableId)
    }

    if (tenant.slug) {
        revalidatePath(`/${tenant.slug}`)
    }
    revalidatePath('/admin')
    revalidatePath('/admin/tables')
    revalidatePath('/admin/kds')
    return { success: true, orderId: order.id }
}
