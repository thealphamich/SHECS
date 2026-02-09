import { createClient } from '@/lib/supabase/server'
import { Bell, AlertCircle, Zap, ShieldCheck } from 'lucide-react'

export default async function AlertsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data: meter } = await supabase
        .from('meters')
        .select('id')
        .eq('user_id', user?.id)
        .single()

    const { data: alerts } = await supabase
        .from('alerts')
        .select('*')
        .eq('meter_id', meter?.id)
        .order('created_at', { ascending: false })

    const getAlertIcon = (type: string) => {
        switch (type) {
            case 'LOW_BALANCE': return <AlertCircle className="w-5 h-5 text-amber-600" />
            case 'POWER_OFF': return <Zap className="w-5 h-5 text-red-600" />
            case 'TOKEN_LOADED': return <ShieldCheck className="w-5 h-5 text-green-600" />
            default: return <Bell className="w-5 h-5 text-blue-600" />
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <header className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                    <Bell className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-slate-900">Notifications</h1>
            </header>

            <div className="card overflow-hidden">
                <div className="divide-y divide-slate-200">
                    {alerts && alerts.length > 0 ? (
                        alerts.map((alert) => (
                            <div key={alert.id} className={`p-6 flex items-start gap-4 hover:bg-slate-50 transition ${!alert.is_read ? 'bg-blue-50' : ''}`}>
                                <div className="mt-1">{getAlertIcon(alert.type)}</div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-bold text-slate-900">{alert.type.replace('_', ' ')}</h3>
                                        <span className="text-xs text-slate-500 font-medium">
                                            {new Date(alert.created_at).toLocaleDateString()} {new Date(alert.created_at).toLocaleTimeString()}
                                        </span>
                                    </div>
                                    <p className="text-slate-600 mt-1">{alert.message}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-12 text-center text-slate-500">
                            No notifications to show.
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
