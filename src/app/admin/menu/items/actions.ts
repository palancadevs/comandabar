'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createMenuItem(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const { data: userData } = await supabase
        .from('users')
        .select('tenant_id')
        .eq('id', user.id)
        .single()

    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const priceInput = formData.get('price') as string
    const price = parseFloat(priceInput) || 0
    const categoryId = formData.get('categoryId') as string
    const imageFile = formData.get('image') as File

    console.log('Action createMenuItem:', { name, price, categoryId, hasImage: !!imageFile?.size })

    if (!categoryId || categoryId === 'undefined') {
        console.error('Missing categoryId in createMenuItem')
        throw new Error('Debes seleccionar una categoría válida.')
    }

    let imageUrl = null

    if (imageFile && imageFile.size > 0) {
        const fileExt = imageFile.name.split('.').pop()
        const fileName = `${userData?.tenant_id}/${Date.now()}.${fileExt}`

        const { error: uploadError, data: uploadData } = await supabase.storage
            .from('menu-items')
            .upload(fileName, imageFile)

        if (!uploadError) {
            const { data: { publicUrl } } = supabase.storage
                .from('menu-items')
                .getPublicUrl(fileName)
            imageUrl = publicUrl
        }
    }

    const { error } = await supabase
        .from('menu_items')
        .insert({
            tenant_id: userData?.tenant_id,
            category_id: categoryId,
            name,
            description,
            price,
            image_url: imageUrl,
            available: true
        })

    if (error) {
        console.error('Create Menu Item Error:', error)
        throw error
    }

    revalidatePath('/admin/menu/items')
}

export async function deleteMenuItem(id: string) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return { ok: false, error: 'Tu sesión expiró. Vuelve a iniciar sesión.' }
        }

        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('tenant_id')
            .eq('id', user.id)
            .single()

        if (userError || !userData?.tenant_id) {
            return { ok: false, error: 'No se pudo identificar el local de esta cuenta.' }
        }

        const { count, error: countError } = await supabase
            .from('order_items')
            .select('id', { count: 'exact', head: true })
            .eq('menu_item_id', id)

        if (countError) {
            return { ok: false, error: 'No se pudo validar si el plato tiene pedidos históricos.' }
        }

        if ((count ?? 0) > 0) {
            return { ok: false, error: 'No puedes eliminar un plato que ya fue usado en pedidos. Si quieres, lo siguiente correcto es ocultarlo de la carta.' }
        }

        const { error } = await supabase
            .from('menu_items')
            .delete()
            .eq('id', id)
            .eq('tenant_id', userData.tenant_id)

        if (error) {
            return { ok: false, error: 'No se pudo eliminar el plato.' }
        }

        revalidatePath('/admin/menu/items')
        revalidatePath('/admin')
        revalidatePath('/admin/kds')

        return { ok: true }
    } catch {
        return { ok: false, error: 'Ocurrió un error inesperado al eliminar el plato.' }
    }
}

export async function setMenuItemAvailability(id: string, available: boolean) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return { ok: false, error: 'Tu sesión expiró. Vuelve a iniciar sesión.' }
        }

        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('tenant_id, tenants(slug)')
            .eq('id', user.id)
            .single()

        if (userError || !userData?.tenant_id) {
            return { ok: false, error: 'No se pudo identificar el local de esta cuenta.' }
        }

        const { error } = await supabase
            .from('menu_items')
            .update({ available })
            .eq('id', id)
            .eq('tenant_id', userData.tenant_id)

        if (error) {
            return { ok: false, error: 'No se pudo actualizar la disponibilidad del plato.' }
        }

        const tenantRelation = userData.tenants as { slug?: string | null } | Array<{ slug?: string | null }> | null
        const tenantSlug = Array.isArray(tenantRelation)
            ? tenantRelation[0]?.slug ?? null
            : tenantRelation?.slug ?? null

        revalidatePath('/admin/menu/items')
        revalidatePath('/admin')
        revalidatePath('/admin/kds')

        if (tenantSlug) {
            revalidatePath(`/${tenantSlug}`)
        }

        return { ok: true, available }
    } catch {
        return { ok: false, error: 'Ocurrió un error inesperado al actualizar el plato.' }
    }
}

export async function updateMenuItem(id: string, formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const price = parseFloat(formData.get('price') as string) || 0
    const categoryId = formData.get('categoryId') as string
    const imageFile = formData.get('image') as File
    const currentImageUrl = formData.get('currentImageUrl') as string

    const { data: userData } = await supabase
        .from('users')
        .select('tenant_id')
        .eq('id', user?.id)
        .single()

    let imageUrl = currentImageUrl

    if (imageFile && imageFile.size > 0) {
        const fileExt = imageFile.name.split('.').pop()
        const fileName = `${userData?.tenant_id}/${Date.now()}.${fileExt}`

        const { error: uploadError } = await supabase.storage
            .from('menu-items')
            .upload(fileName, imageFile)

        if (!uploadError) {
            const { data: { publicUrl } } = supabase.storage
                .from('menu-items')
                .getPublicUrl(fileName)
            imageUrl = publicUrl
        }
    }

    const { error } = await supabase
        .from('menu_items')
        .update({
            category_id: categoryId,
            name,
            description,
            price,
            image_url: imageUrl
        })
        .eq('id', id)

    if (error) throw error
    revalidatePath('/admin/menu/items')
}
