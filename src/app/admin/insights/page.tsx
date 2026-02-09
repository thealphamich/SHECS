import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { calculateRwfFromKwh } from '@/lib/tariff-calculator'
import {
    TrendingUp,
    Users,
    Zap,
    Activity,
    Bell,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react'
import { InsightsCharts } from '@/components/admin/InsightsCharts'

export default async function InsightsPage() {
    const supabase = await createClient()

    // Verify admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    const isAdmin = profile?.role === 'admin' || user.email === 'dripmich@gmail.com' || user.email === 'thealphamich@gmail.com'

    if (!isAdmin) redirect('/dashboard')

    const { data: meters } = await supabase.from('meters').select('*')
    // Fetch last 30 days of topups for the chart
    const thrityDaysAgo = new Date()
    thrityDaysAgo.setDate(thrityDaysAgo.getDate() - 30)

    const { data: topups } = await supabase
        .from('topups')
        .select('*')
        .gte('created_at', thrityDaysAgo.toISOString())
        .order('created_at', { ascending: false })

    const { data: notifications } = await supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(20)

    const totalMeters = meters?.length || 0
    const activeMeters = meters?.filter(m => m.status === 'ON').length || 0
    const totalPurchasedElectricity = topups?.reduce((sum, t) => sum + Number(t.amount_paid), 0) || 0
    const activeLiability = meters?.reduce((sum, m) => {
        const kwh = parseFloat(m.balance_kwh || '0')
        return sum + calculateRwfFromKwh(kwh, 0, m.category)
    }, 0) || 0

    const totalEnergy = topups?.reduce((sum, t) => sum + Number(t.kwh_bought || 0), 0) || 0

    // Cast raw topups for the client component
    const rawTopups = (topups || []).map(t => ({
        id: t.id,
        created_at: t.created_at,
        amount_paid: Number(t.amount_paid),
        kwh_bought: Number(t.kwh_bought || 0)
    }))

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-12">
            <header className="space-y-1">
                <h1 className="text-3xl md:text-4xl font-black text-foreground tracking-tight">
                    Platform Insights
                </h1>
                <p className="text-muted font-medium italic">
                    Real-time analytics and system notifications
                </p>
            </header>

            {/* Key Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-6 bg-slate-900 rounded-[2rem] text-white relative overflow-hidden shadow-xl shadow-slate-900/10">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4 opacity-80">
                            <div className="p-2 bg-white/10 rounded-xl">
                                <TrendingUp className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-black uppercase tracking-widest">Lifetime Earnings</span>
                        </div>
                        <p className="text-3xl font-black mb-2">{totalPurchasedElectricity.toLocaleString()} <span className="text-sm text-slate-400 font-bold">RWF</span></p>
                        <div className="flex items-center gap-1 text-[10px] font-bold text-green-400 uppercase tracking-wider bg-green-400/10 w-fit px-2 py-0.5 rounded-full">
                            <ArrowUpRight className="w-3 h-3" />
                            <span>System Revenue</span>
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-card border border-border rounded-[2rem] relative shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl font-black">
                            <Zap className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-black text-muted uppercase tracking-widest">Total Energy Added</span>
                    </div>
                    <p className="text-3xl font-black text-foreground mb-2">{totalEnergy.toFixed(1)} <span className="text-sm text-muted font-bold">kWh</span></p>
                    <div className="h-1.5 w-full bg-background rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 w-3/4"></div>
                    </div>
                </div>

                <div className="p-6 bg-card border border-border rounded-[2rem] relative shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-xl font-black">
                            <Activity className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-black text-muted uppercase tracking-widest">Active Status</span>
                    </div>
                    <div className="flex items-end justify-between">
                        <div>
                            <p className="text-3xl font-black text-foreground mb-1">{activeMeters}/{totalMeters}</p>
                            <p className="text-[10px] text-muted font-bold uppercase tracking-wider">Connected Meters</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xl font-bold text-foreground">{activeLiability.toLocaleString()}</p>
                            <p className="text-[10px] text-muted font-bold uppercase tracking-wider">Active Credit (RWF)</p>
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-card border border-border rounded-[2rem] relative shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl font-black">
                            <Bell className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-black text-muted uppercase tracking-widest">System Alerts</span>
                    </div>
                    <p className="text-3xl font-black text-foreground mb-2">{notifications?.length || 0}</p>
                    <p className="text-[10px] text-muted font-bold uppercase tracking-wider">Total Recorded Events</p>
                </div>
            </div>

            {/* Professional Recharts Implementation */}
            <InsightsCharts rawTopups={rawTopups} />

            {/* Notifications Feed */}
            <div className="bg-card rounded-[2.5rem] border border-border p-10 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-background rounded-full -mr-32 -mt-32 opacity-50"></div>
                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-2xl font-black text-foreground leading-tight">System Event Log</h3>
                            <p className="text-xs text-muted font-bold uppercase tracking-[0.2em] mt-2">Historical Operational Data</p>
                        </div>
                        <button className="px-4 py-2 border border-border rounded-xl text-[10px] font-black uppercase tracking-widest text-muted hover:bg-background transition-colors">
                            View All Events
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {notifications && notifications.slice(0, 4).map((note) => (
                            <div key={note.id} className="p-5 bg-background rounded-[2rem] hover:bg-card hover:shadow-xl hover:shadow-slate-200/10 transition-all border border-transparent hover:border-border group">
                                <div className="flex items-center justify-between mb-4">
                                    <span className={`px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-[0.2em] ${note.type === 'new_user' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400' :
                                        note.type === 'new_meter' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' :
                                            'bg-muted/10 text-muted'
                                        }`}>
                                        {note.type?.replace('_', ' ')}
                                    </span>
                                    <span className="text-[9px] font-bold text-muted transition-colors">
                                        {new Date(note.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <h4 className="font-black text-foreground text-xs mb-2 group-hover:text-blue-600 transition-colors">{note.title}</h4>
                                <p className="text-[11px] text-muted font-medium leading-relaxed line-clamp-2">{note.message}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
