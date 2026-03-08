'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createCategory(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const { data: userData } = await supabase
        .from('users')
        .select('tenant_id')
        .eq('id', user.id)
        .single()

    const name = formData.get('name') as string
    const sortOrder = parseInt(formData.get('sortOrder') as string) || 0

    const { error } = await supabase
        .from('menu_categories')
        .insert({
            tenant_id: userData?.tenant_id,
            name,
            sort_order: sortOrder,
            active: true
        })

    if (error) throw error

    revalidatePath('/admin/menu/categories')
}

export async function deleteCategory(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const { data: userData } = await supabase
        .from('users')
        .select('tenant_id')
        .eq('id', user.id)
        .single()

    const { count, error: countError } = await supabase
        .from('menu_items')
        .select('id', { count: 'exact', head: true })
        .eq('tenant_id', userData?.tenant_id)
        .eq('category_id', id)

    if (countError) throw countError

    if ((count ?? 0) > 0) {
        throw new Error('No puedes eliminar una categoría que todavía tiene platos. Muévelos o bórralos primero.')
    }

    const { error } = await supabase
        .from('menu_categories')
        .delete()
        .eq('id', id)
        .eq('tenant_id', userData?.tenant_id)

    if (error) throw error
    revalidatePath('/admin/menu/categories')
    revalidatePath('/admin/menu/items')
}

export async function updateCategory(id: string, formData: FormData) {
    const supabase = await createClient()
    const name = formData.get('name') as string
    const sortOrder = parseInt(formData.get('sortOrder') as string) || 0

    const { error } = await supabase
        .from('menu_categories')
        .update({
            name,
            sort_order: sortOrder
        })
        .eq('id', id)

    if (error) throw error
    revalidatePath('/admin/menu/categories')
    revalidatePath('/admin/menu/items')
}
