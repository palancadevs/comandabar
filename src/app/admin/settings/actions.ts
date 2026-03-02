'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateTenantBranding(formData: FormData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    // Get tenant_id for this user
    const { data: userData } = await supabase
        .from('users')
        .select('tenant_id')
        .eq('id', user.id)
        .single()

    if (!userData?.tenant_id) throw new Error('Tenant not found')

    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const address = formData.get('address') as string
    const primaryColor = formData.get('primaryColor') as string
    const logoFile = formData.get('logo') as File
    const coverFile = formData.get('cover') as File

    let logoUrl = formData.get('currentLogoUrl') as string
    let coverUrl = formData.get('currentCoverUrl') as string

    // Handle Logo Upload
    if (logoFile && logoFile.size > 0) {
        const fileExt = logoFile.name.split('.').pop()
        const fileName = `${userData.tenant_id}/logo-${Date.now()}.${fileExt}`

        const { error: uploadError } = await supabase.storage
            .from('tenant-assets')
            .upload(fileName, logoFile)

        if (!uploadError) {
            const { data: { publicUrl } } = supabase.storage
                .from('tenant-assets')
                .getPublicUrl(fileName)
            logoUrl = publicUrl
        }
    }

    // Handle Cover Upload
    if (coverFile && coverFile.size > 0) {
        const fileExt = coverFile.name.split('.').pop()
        const fileName = `${userData.tenant_id}/cover-${Date.now()}.${fileExt}`

        const { error: uploadError } = await supabase.storage
            .from('tenant-assets')
            .upload(fileName, coverFile)

        if (!uploadError) {
            const { data: { publicUrl } } = supabase.storage
                .from('tenant-assets')
                .getPublicUrl(fileName)
            coverUrl = publicUrl
        }
    }

    const { error } = await supabase
        .from('tenants')
        .update({
            name,
            description,
            address,
            primary_color: primaryColor,
            logo_url: logoUrl,
            cover_url: coverUrl,
        })
        .eq('id', userData.tenant_id)

    if (error) throw error

    revalidatePath('/admin/settings')
}
