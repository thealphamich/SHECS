import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CollapsibleSidebar } from '@/components/collapsible-sidebar'
import { TopNav } from '@/components/top-nav'
import { DashboardShell } from '@/components/dashboard-shell'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect('/login')
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'

    return (
        <DashboardShell
            isAdmin={false}
            userName={displayName}
            topNav={<TopNav userName={displayName} userEmail={user?.email} />}
        >
            {children}
        </DashboardShell>
    )
}
