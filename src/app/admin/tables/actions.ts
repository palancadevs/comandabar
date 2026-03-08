'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createTable(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const { data: userData } = await supabase
        .from('users')
        .select('tenant_id')
        .eq('id', user.id)
        .single()

    if (!userData?.tenant_id) throw new Error('Tenant not found')

    const name = formData.get('name') as string

    const { error } = await supabase.from('tables').insert({
        tenant_id: userData.tenant_id,
        name,
        status: 'libre',
        active: true
    })

    if (error) {
        console.error('Error creating table:', error)
        throw new Error(error.message)
    }

    revalidatePath('/admin/tables')
}

export async function deleteTable(id: string) {
    const supabase = await createClient()
    const { error } = await supabase.from('tables').delete().eq('id', id)
    if (error) {
        console.error('Error deleting table:', error)
        throw new Error(error.message)
    }
    revalidatePath('/admin/tables')
}

export async function openTableSession(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const { data: userData } = await supabase
        .from('users')
        .select('tenant_id')
        .eq('id', user.id)
        .single()

    if (!userData?.tenant_id) throw new Error('Tenant not found')

    const tableId = formData.get('tableId') as string

    const { data: existingSession } = await supabase
        .from('table_sessions')
        .select('id')
        .eq('tenant_id', userData.tenant_id)
        .eq('table_id', tableId)
        .is('closed_at', null)
        .order('opened_at', { ascending: false })
        .limit(1)
        .single()

    if (!existingSession) {
        const { error: sessionError } = await supabase
            .from('table_sessions')
            .insert({
                tenant_id: userData.tenant_id,
                table_id: tableId,
            })

        if (sessionError) {
            console.error('Error opening table session:', sessionError)
            throw new Error(sessionError.message)
        }
    }

    const { error: tableError } = await supabase
        .from('tables')
        .update({ status: 'ocupada' })
        .eq('tenant_id', userData.tenant_id)
        .eq('id', tableId)

    if (tableError) {
        console.error('Error updating table status:', tableError)
        throw new Error(tableError.message)
    }

    revalidatePath('/admin')
    revalidatePath('/admin/tables')
}

export async function closeTableSession(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const { data: userData } = await supabase
        .from('users')
        .select('tenant_id')
        .eq('id', user.id)
        .single()

    if (!userData?.tenant_id) throw new Error('Tenant not found')

    const tableId = formData.get('tableId') as string
    const sessionId = formData.get('sessionId') as string
    const paymentMethod = formData.get('paymentMethod') as string

    const { data: session, error: sessionError } = await supabase
        .from('table_sessions')
        .select('id, tenant_id, table_id, closed_at')
        .eq('tenant_id', userData.tenant_id)
        .eq('id', sessionId)
        .eq('table_id', tableId)
        .single()

    if (sessionError || !session) {
        console.error('Error loading session:', sessionError)
        throw new Error('Session not found')
    }

    if (!session.closed_at) {
        const { data: orders, error: ordersError } = await supabase
            .from('orders')
            .select('id, status, order_items(quantity, unit_price)')
            .eq('tenant_id', userData.tenant_id)
            .eq('table_session_id', sessionId)

        if (ordersError) {
            console.error('Error loading orders for session close:', ordersError)
            throw new Error(ordersError.message)
        }

        const totalAmount = orders?.reduce((sum, order) => {
            const orderTotal = order.order_items?.reduce((itemsSum: number, item: any) => {
                return itemsSum + Number(item.quantity || 0) * Number(item.unit_price || 0)
            }, 0) || 0

            return sum + orderTotal
        }, 0) || 0

        const { error: closeError } = await supabase
            .from('table_sessions')
            .update({
                closed_at: new Date().toISOString(),
                total_amount: totalAmount,
                payment_method: paymentMethod,
            })
            .eq('tenant_id', userData.tenant_id)
            .eq('id', sessionId)

        if (closeError) {
            console.error('Error closing table session:', closeError)
            throw new Error(closeError.message)
        }

        const pendingOrderIds = orders
            ?.filter((order) => order.status !== 'entregado')
            .map((order) => order.id) || []

        if (pendingOrderIds.length > 0) {
            const { error: ordersUpdateError } = await supabase
                .from('orders')
                .update({ status: 'entregado' })
                .eq('tenant_id', userData.tenant_id)
                .in('id', pendingOrderIds)

            if (ordersUpdateError) {
                console.error('Error finalizing orders on session close:', ordersUpdateError)
                throw new Error(ordersUpdateError.message)
            }
        }
    }

    const { error: tableError } = await supabase
        .from('tables')
        .update({ status: 'libre' })
        .eq('tenant_id', userData.tenant_id)
        .eq('id', tableId)

    if (tableError) {
        console.error('Error releasing table:', tableError)
        throw new Error(tableError.message)
    }

    revalidatePath('/admin')
    revalidatePath('/admin/tables')
    revalidatePath('/admin/kds')
}
