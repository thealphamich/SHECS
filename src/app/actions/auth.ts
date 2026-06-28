'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
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
    redirect(isAdmin ? '/admin?toast_success=Welcome back! Logged in successfully.' : '/dashboard?toast_success=Welcome back! Logged in successfully.')
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
    const adminSupabase = createAdminClient()
    const supabase = await createClient()

    // Verify current user is admin
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', currentUser?.id)
        .single()

    if (profile?.role !== 'admin' && currentUser?.email !== 'dripmich@gmail.com') {
        return { error: 'Unauthorized: Only admins can create users.' }
    }

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const fullName = formData.get('fullName') as string
    const role = formData.get('role') as string

    // 1. Create the user in Auth with service role (bypass confirmation, no auto-login)
    const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: fullName }
    })

    if (authError) {
        return { error: authError.message }
    }

    if (!authData.user) {
        return { error: 'Failed to create auth user.' }
    }

    // 2. Update the profile role (the trigger handle_new_user likely already created the profile)
    // We use service role to ensure we can update any profile
    const { error: profileError } = await adminSupabase
        .from('profiles')
        .update({ role, full_name: fullName })
        .eq('id', authData.user.id)

    if (profileError) {
        // If trigger didn't handle it, try insert
        const { error: insertError } = await adminSupabase
            .from('profiles')
            .insert({
                id: authData.user.id,
                full_name: fullName,
                role: role
            })

        if (insertError) return { error: `User created but profile update failed: ${insertError.message}` }
    }

    revalidatePath('/admin/users')
    return { success: 'User created successfully.' }
}

export async function logout() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login?toast_success=Goodbye! Logged out successfully.')
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
