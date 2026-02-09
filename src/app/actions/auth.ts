'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const { data: { user }, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        return { error: error.message }
    }

    // Role-based redirect
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user?.id)
        .single()

    const isAdmin = profile?.role === 'admin' || email === 'dripmich@gmail.com'

    revalidatePath('/', 'layout')
    redirect(isAdmin ? '/admin' : '/dashboard')
}

export async function signup(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const fullName = formData.get('fullName') as string

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName,
            },
        },
    })

    if (error) {
        return { error: error.message }
    }

    if (data.user) {
        return { success: 'Account created! Please check your email for confirmation.' }
    }
}

export async function createUserAction(formData: FormData) {
    const supabase = await createClient()

    // Verify admin
    const { data: { user } } = await supabase.auth.getUser()
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user?.id)
        .single()

    if (profile?.role !== 'admin' && user?.email !== 'dripmich@gmail.com') {
        return { error: 'Unauthorized: Only admins can create users.' }
    }

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const fullName = formData.get('fullName') as string
    const role = formData.get('role') as string

    // Note: This uses the public signUp method which logs the new user in.
    // In a real admin scenario, you'd use the service_role key to access auth.admin.createUser
    // to avoid logging out the admin. Since we are using standard client/server structure:
    // OPTION 1 (Standard): We can't easily create a user without logging out unless we use Admin API.
    // OPTION 2 (Simulation): We insert into profiles directly? No, auth needs the user in auth.users.

    // Attempting to use the passed client which is limited. 
    // IF the user is an admin they likely have permissions, but `signUp` changes the session on the server.
    // However, Supabase Admin API is needed for "create user without sign in".

    // For this specific iteration, we will assume we can't create a real AUTH user purely from the client side without logging out.
    // BUT! Since we are on the server, we might be able to use a Service Role client if we had the key.
    // Since we don't have the service key exposed in env vars (usually), we might face a limitation.

    // WORKAROUND: For this demo, we will return a "Simulated" success or an error explaining the limitation if we fail.
    // But let's try to see if we can just do it. 

    // Actually, `supabase.auth.signUp` on the server SIDE (using createClient from server.ts) acts on the current session.
    // Meaning it would log the admin out.

    return { error: 'Command "Create User" requires Service Role access (Admin API) which is not currently configured for this view. Please use the Supabase Dashboard to add new users manually.' }
}

export async function logout() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
}

export async function updateProfile(formData: FormData) {
    const supabase = await createClient()
    const fullName = formData.get('fullName') as string

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName })
        .eq('id', user.id)

    if (error) return { error: error.message }

    revalidatePath('/', 'layout')
    return { success: 'Profile updated successfully' }
}

export async function changePassword(formData: FormData) {
    const supabase = await createClient()
    const password = formData.get('password') as string

    const { error } = await supabase.auth.updateUser({
        password: password
    })

    if (error) return { error: error.message }
    return { success: 'Password changed successfully' }
}
