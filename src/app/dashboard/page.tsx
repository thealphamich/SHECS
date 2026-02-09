import { createClient } from '@/lib/supabase/server'
import { DashboardClient } from '@/components/dashboard/DashboardClient'

export default async function DashboardPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    // Get profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single()

    const displayName = profile?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || ''

    // Get all meters for this user
    const { data: meters } = await supabase
        .from('meters')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    // Get latest readings for the first/active meter
    const activeMeterId = meters && meters.length > 0 ? meters[0].id : null

    let readings = []
    if (activeMeterId) {
        const { data: latestReadings } = await supabase
            .from('readings')
            .select('*')
            .eq('meter_id', activeMeterId)
            .order('created_at', { ascending: false })
            .limit(6)

        readings = latestReadings || []
    }

    return (
        <DashboardClient
            initialMeters={meters || []}
            displayName={displayName}
            initialReadings={readings}
        />
    )
}
