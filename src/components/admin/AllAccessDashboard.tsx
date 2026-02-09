'use client'

import { useState, useEffect } from 'react'
import {
    Search,
    Zap,
    Activity,
    AlertTriangle,
    Clock,
    Building2,
    User,
    Filter,
    ChevronRight,
    ArrowUpRight,
    Edit2,
    Check,
    X,
    Loader2
} from 'lucide-react'
import { updateMeterBalance } from '@/app/actions/meters'
import { toast } from 'sonner'


interface AdminData {
    meters: any[]
    topups: any[]
    alerts: any[]
}

interface AllAccessDashboardProps {
    data: AdminData
    initialSearch?: string
}

export function AllAccessDashboard({ data, initialSearch = '' }: AllAccessDashboardProps) {
    const [search, setSearch] = useState(initialSearch)
    const [activeTab, setActiveTab] = useState<'meters' | 'topups' | 'alerts'>('meters')
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editValue, setEditValue] = useState('')
    const [isSaving, setIsSaving] = useState(false)

    const handleEditClick = (meter: any) => {
        setEditingId(meter.id)
        setEditValue(meter.balance_kwh.toString())
    }

    const handleSave = async (meterId: string) => {
        setIsSaving(true)
        try {
            await updateMeterBalance(meterId, parseFloat(editValue))
            toast.success('Balance updated successfully')
            setEditingId(null)
        } catch (error) {
            toast.error('Failed to update balance')
        } finally {
            setIsSaving(false)
        }
    }

    // Sync search with URL parameter changes
    useEffect(() => {
        setSearch(initialSearch)
    }, [initialSearch])

    const filteredMeters = data.meters.filter(m =>
        m.meter_code.toLowerCase().includes(search.toLowerCase()) ||
        m.profiles?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        m.block?.toLowerCase().includes(search.toLowerCase())
    )

    const filteredTopups = data.topups.filter(t =>
        t.meters?.meter_code.toLowerCase().includes(search.toLowerCase()) ||
        t.meters?.profiles?.full_name?.toLowerCase().includes(search.toLowerCase())
    )

    const filteredAlerts = data.alerts.filter(a =>
        a.meters?.meter_code.toLowerCase().includes(search.toLowerCase()) ||
        a.message.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="space-y-6">
            {/* Search and Tabs */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card p-4 rounded-3xl border border-border shadow-sm">
                <div className="flex items-center gap-2 bg-background p-1 rounded-2xl w-full md:w-auto">
                    <button
                        onClick={() => setActiveTab('meters')}
                        className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'meters' ? 'bg-card text-blue-600 shadow-sm' : 'text-muted hover:text-foreground'}`}
                    >
                        Meters ({filteredMeters.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('topups')}
                        className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'topups' ? 'bg-card text-blue-600 shadow-sm' : 'text-muted hover:text-foreground'}`}
                    >
                        Transactions ({filteredTopups.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('alerts')}
                        className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'alerts' ? 'bg-card text-blue-600 shadow-sm' : 'text-muted hover:text-foreground'}`}
                    >
                        Alerts ({filteredAlerts.length})
                    </button>
                </div>

                <div className="relative w-full md:w-auto group flex gap-2">
                    <button
                        onClick={() => {
                            const dataToExport = activeTab === 'meters' ? filteredMeters : activeTab === 'topups' ? filteredTopups : filteredAlerts
                            if (!dataToExport.length) return toast.error('No data to export')

                            const headers = activeTab === 'meters'
                                ? ['Meter Code', 'Balance (kWh)', 'Status', 'Block', 'House']
                                : activeTab === 'topups'
                                    ? ['Date', 'Meter Code', 'Amount (RWF)', 'Units (kWh)', 'Token']
                                    : ['Date', 'Meter Code', 'Type', 'Message']

                            const rows = dataToExport.map(item => {
                                if (activeTab === 'meters') return [item.meter_code, item.balance_kwh, item.status, item.block, item.house_unit]
                                if (activeTab === 'topups') return [new Date(item.created_at).toLocaleString(), item.meters?.meter_code, item.amount_paid, item.units_bought, item.token_code]
                                return [new Date(item.created_at).toLocaleString(), item.meters?.meter_code, item.type, item.message]
                            })

                            const csvContent = [
                                headers.join(','),
                                ...rows.map(r => r.map(c => `"${c}"`).join(','))
                            ].join('\n')

                            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
                            const link = document.createElement('a')
                            link.href = URL.createObjectURL(blob)
                            link.download = `shecs_${activeTab}_${new Date().toISOString().split('T')[0]}.csv`
                            link.click()
                            toast.success(`Exported ${dataToExport.length} records`)
                        }}
                        className="px-4 py-3 bg-card border border-border text-muted rounded-2xl hover:bg-background hover:text-foreground transition-all font-bold text-xs uppercase tracking-widest flex items-center gap-2"
                    >
                        <ArrowUpRight className="w-4 h-4 rotate-45" />
                        <span className="hidden md:inline">Export CSV</span>
                    </button>

                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted group-focus-within:text-blue-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search records..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-background border border-border rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="bg-card rounded-[2.5rem] border border-border overflow-hidden shadow-sm">
                {activeTab === 'meters' && (
                    <div className="divide-y divide-border/40">
                        {filteredMeters.map((meter) => (
                            <div key={meter.id} className="p-6 hover:bg-background/50 transition-colors group">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${meter.status === 'ON' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'}`}>
                                            <Zap className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-black text-foreground">{meter.meter_code}</h4>
                                            </div>
                                            <p className="text-xs text-muted font-bold">{meter.profiles?.full_name || 'Unassigned'} • Block {meter.block}-{meter.house_unit}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        {editingId === meter.id ? (
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="number"
                                                    value={editValue}
                                                    onChange={(e) => setEditValue(e.target.value)}
                                                    className="w-24 px-2 py-1 text-sm bg-background border border-border rounded-lg focus:outline-none focus:border-blue-500 text-foreground"
                                                    autoFocus
                                                />
                                                <button
                                                    onClick={() => handleSave(meter.id)}
                                                    disabled={isSaving}
                                                    className="p-1 bg-green-100 text-green-600 rounded-lg hover:bg-green-200"
                                                >
                                                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                                </button>
                                                <button
                                                    onClick={() => setEditingId(null)}
                                                    disabled={isSaving}
                                                    className="p-1 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="group/edit relative">
                                                <div className="flex items-center justify-end gap-2">
                                                    <p className="text-lg font-black text-foreground">{Number(meter.balance_kwh).toFixed(1)} kWh</p>
                                                    <button
                                                        onClick={() => handleEditClick(meter)}
                                                        className="p-1 hover:bg-background rounded-md transition-all text-muted hover:text-blue-500"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                                <p className="text-[10px] text-muted font-bold uppercase tracking-widest">Available Credit</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'topups' && (
                    <div className="divide-y divide-border/40">
                        {filteredTopups.map((topup) => (
                            <div key={topup.id} className="p-6 hover:bg-background/50 transition-colors flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400">
                                        <ArrowUpRight className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-foreground">{topup.amount_paid.toLocaleString()} RWF</h4>
                                        <p className="text-xs text-muted font-bold">{topup.meters?.meter_code} • {topup.meters?.profiles?.full_name}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-black text-foreground">+{Number(topup.units_bought).toFixed(1)} kWh</p>
                                    <p className="text-[10px] text-muted font-bold uppercase tracking-widest">{new Date(topup.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'alerts' && (
                    <div className="divide-y divide-border/40">
                        {filteredAlerts.map((alert) => (
                            <div key={alert.id} className="p-6 hover:bg-background/50 transition-colors flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${alert.type === 'LOW_BALANCE' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'}`}>
                                    <AlertTriangle className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-black text-foreground">{alert.meters?.meter_code}</h4>
                                    <p className="text-sm text-foreground/80 font-medium">{alert.message}</p>
                                    <p className="text-[10px] text-muted font-bold uppercase tracking-widest mt-1">{new Date(alert.created_at).toLocaleString()}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {(activeTab === 'meters' ? filteredMeters : activeTab === 'topups' ? filteredTopups : filteredAlerts).length === 0 && (
                    <div className="py-20 text-center">
                        <Activity className="w-12 h-12 text-muted/30 mx-auto mb-4" />
                        <p className="text-muted font-bold uppercase tracking-widest text-xs">No records found matching your search</p>
                    </div>
                )}
            </div>
        </div>
    )
}
