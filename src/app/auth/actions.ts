'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function login(formData: FormData) {
    const supabase = await createClient()

    // type-casting here for convenience
    // in practice, you should validate your inputs
    const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
    }

    const { error } = await supabase.auth.signInWithPassword(data)

    if (error) {
        console.error('Login error:', error.message)
        redirect(`/auth/login?message=${encodeURIComponent(error.message)}`)
    }

    revalidatePath('/', 'layout')
    redirect('/admin')
}

export async function signup(formData: FormData) {
    const supabase = await createClient()

    // You should validate these inputs (zod, etc.)
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const localName = formData.get('localName') as string
    const slug = formData.get('slug') as string

    // 1. Create the Auth User
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
    })

    if (error) {
        redirect('/auth/register?message=Could not register user')
    }

    // 2. We should ideally call an RPC to create the tenant safely
    // For the MVP, we can insert the tenant directly if allowed, or use service_role key
    // Since we don't have a service_role set up locally without passing it,
    // let's do a direct insert if RLS allows or we use the RPC defined in schema.

    const { data: tenantId, error: rpcError } = await supabase.rpc('register_new_tenant', {
        new_slug: slug,
        new_name: localName,
        new_email: email,
        new_password: password
    })

    if (rpcError) {
        console.error('RPC Error creating tenant:', rpcError)
        return redirect('/auth/register?message=Could not create tenant. ' + rpcError.message)
    }

    if (!tenantId) {
        console.error('RPC Error: No tenant ID returned')
        return redirect('/auth/register?message=Could not retrieve tenant ID')
    }

    // 3. Insert the User into public.users with role 'admin'
    if (data.user?.id && tenantId) {
        const { error: insertError } = await supabase.from('users').insert({
            id: data.user.id,
            tenant_id: tenantId,
            email: email,
            role: 'admin',
            name: email.split('@')[0],
            active: true
        })

        if (insertError) {
            console.error('Error inserting into public.users:', insertError)
            return redirect('/auth/register?message=Failed to assign admin role. ' + insertError.message)
        }
    }

    revalidatePath('/', 'layout')
    // We should start the onboarding wizard
    redirect('/auth/onboarding')
}

export async function signout() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/auth/login')
}
