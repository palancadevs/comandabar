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
