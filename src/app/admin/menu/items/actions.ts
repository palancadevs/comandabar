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
    const supabase = await createClient()
    const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', id)

    if (error) throw error
    revalidatePath('/admin/menu/items')
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
