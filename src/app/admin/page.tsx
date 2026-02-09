import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Shield, RefreshCw, Users, Zap, Activity, Battery } from 'lucide-react'
import { calculateRwfFromKwh } from '@/lib/tariff-calculator'
import { AdminCharts } from '@/components/admin/AdminCharts'

export default async function AdminPage() {
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

    // Fetch stats
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const [
        { count: totalUsers },
        { data: meters },
        { data: topups }
    ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('meters').select('*'),
        supabase.from('topups')
            .select('*')
            .gte('created_at', thirtyDaysAgo.toISOString())
            .order('created_at', { ascending: false })
    ])

    // Calculate stats
    const activeMeters = meters?.filter(m => m.status === 'ON').length || 0
    const totalBalanceKwh = meters?.reduce((sum, m) => sum + parseFloat(m.balance_kwh || '0'), 0) || 0

    // Calculate total value of energy in the system
    const totalBalanceRwf = meters?.reduce((sum, m) => {
        const kwh = parseFloat(m.balance_kwh || '0')
        return sum + calculateRwfFromKwh(kwh, 0, m.category)
    }, 0) || 0

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                        <Shield className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold text-foreground">Admin Dashboard</h1>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Users */}
                <div className="bg-card rounded-[1.5rem] border border-border p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                            <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <p className="text-sm text-muted font-bold uppercase tracking-wider">Total Users</p>
                    </div>
                    <p className="text-3xl font-black text-foreground">{totalUsers || 0}</p>
                </div>

                {/* Active Meters */}
                <div className="bg-card rounded-[1.5rem] border border-border p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                            <Activity className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <p className="text-sm text-muted font-bold uppercase tracking-wider">Active Meters</p>
                    </div>
                    <p className="text-3xl font-black text-foreground">{activeMeters}</p>
                </div>

                {/* Total Balance kWh */}
                <div className="bg-card rounded-[1.5rem] border border-border p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center">
                            <Battery className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                        </div>
                        <p className="text-sm text-muted font-bold uppercase tracking-wider">Total Balance kWh</p>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <p className="text-3xl font-black text-foreground">{totalBalanceKwh.toFixed(1)}</p>
                        <span className="text-sm font-bold text-muted">kWh</span>
                    </div>
                </div>

                {/* Total Balance RWF (Revenue) */}
                <div className="bg-card rounded-[1.5rem] border border-border p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                            <Zap className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <p className="text-sm text-muted font-bold uppercase tracking-wider">Total Balance RWF</p>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <p className="text-3xl font-black text-foreground">{totalBalanceRwf.toLocaleString()}</p>
                        <span className="text-sm font-bold text-muted">RWF</span>
                    </div>
                </div>
            </div>

            {/* Professional Recharts Trend Implementation */}
            <AdminCharts
                meters={meters || []}
                topups={topups || []}
                currentTotalKwh={totalBalanceKwh}
                currentTotalRwf={totalBalanceRwf}
            />


        </div>
    )
}
