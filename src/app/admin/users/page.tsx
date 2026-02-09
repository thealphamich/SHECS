import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { UserList } from '@/components/admin/UserList'
import { Users, Info } from 'lucide-react'

export default async function UsersManagementPage() {
    const supabase = await createClient()

    // Verify admin role
    const { data: { user } } = await supabase.auth.getUser()
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user?.id)
        .single()

    const isAdmin = profile?.role === 'admin' || user?.email === 'dripmich@gmail.com' || user?.email === 'thealphamich@gmail.com'

    if (!isAdmin) {
        redirect('/dashboard')
    }

    // Fetch users
    const { data: users, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center shrink-0">
                        <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">User Management</h1>
                        <p className="text-sm text-muted font-medium">Manage platform access and user roles</p>
                    </div>
                </div>
            </div>


            {/* Content */}
            <UserList initialUsers={users || []} />
        </div>
    )
}
