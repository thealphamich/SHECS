'use client'

import { useState, useEffect } from 'react'
import {
    Zap,
    Activity,
    Battery,
    History,
    AlertTriangle,
    TrendingUp,
    Building2,
    Home,
    Hash,
    Plus,
    RefreshCw,
    Wallet
} from 'lucide-react'
import { MeterRegistration } from './MeterRegistration'
import { TopUpModule } from './TopUpModule'
import { useRouter } from 'next/navigation'
import { calculateRwfFromKwh } from '@/lib/tariff-calculator'

interface Meter {
    id: string
    meter_code: string
    block: string | null
    house_unit: string | null
    balance_kwh: number
    energy_kwh: number
    status: string
    low_threshold_kwh: number
    monthly_units_bought: number
    category: 'residential' | 'commercial'
}

interface DashboardClientProps {
    initialMeters: Meter[]
    displayName: string
    initialReadings: any[]
}

export function DashboardClient({ initialMeters, displayName, initialReadings }: DashboardClientProps) {
    const [meters, setMeters] = useState(initialMeters)
    const [selectedMeterIndex, setSelectedMeterIndex] = useState(0)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const router = useRouter()

    // Sync state with server props on refresh
    useEffect(() => {
        setMeters(initialMeters)
    }, [initialMeters])

    const currentMeter = meters[selectedMeterIndex]
    const isLowBalance = currentMeter ? currentMeter.balance_kwh <= currentMeter.low_threshold_kwh : false

    const handleRefresh = async () => {
        setIsRefreshing(true)
        // Force full reload to reset state as requested
        window.location.reload()
    }

    if (meters.length === 0) {
        return (
            <div className="space-y-8 animate-in fade-in duration-700">
                <header className="space-y-1">
                    <h1 className="text-4xl font-black text-foreground tracking-tight">
                        Welcome, {displayName}!
                    </h1>
                    <p className="text-muted font-medium">To get started, please register your meter at Green Hills Academy.</p>
                </header>

                <div className="max-w-2xl">
                    <MeterRegistration onSuccess={handleRefresh} />
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl md:text-4xl font-black text-foreground tracking-tight">
                        Welcome back, {displayName}!
                    </h1>
                    <p className="text-muted font-medium italic">Monitoring energy for {currentMeter.block} - {currentMeter.house_unit}</p>
                </div>

                {meters.length > 1 && (
                    <div className="flex items-center gap-2 bg-background p-1 rounded-2xl">
                        {meters.map((m, idx) => (
                            <button
                                key={m.id}
                                onClick={() => setSelectedMeterIndex(idx)}
                                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${selectedMeterIndex === idx ? 'bg-card text-blue-600 shadow-sm' : 'text-muted hover:text-foreground'}`}
                            >
                                {m.meter_code}
                            </button>
                        ))}
                    </div>
                )}
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Balance Card - kWh */}
                <div className="bg-card rounded-[2.5rem] p-8 border border-border relative overflow-hidden group hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-500">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 dark:bg-blue-900/40 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700 opacity-50"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                                <Battery className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-xs text-muted/60 uppercase tracking-[0.2em] font-black">Remaining Balance</p>
                                <p className="text-sm font-bold text-foreground">Live kWh Balance</p>
                            </div>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <p className="text-6xl font-black text-foreground tracking-tighter">{Number(currentMeter.balance_kwh).toFixed(2)}</p>
                            <p className="text-lg font-black text-muted uppercase">kWh</p>
                        </div>
                        {isLowBalance && (
                            <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse">
                                <AlertTriangle className="w-3.5 h-3.5" />
                                <span>Low Balance Alert</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Balance Card - RWF */}
                <div className="bg-card rounded-[2.5rem] p-8 border border-border relative overflow-hidden group hover:shadow-xl hover:shadow-amber-500/5 transition-all duration-500">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-100 dark:bg-amber-900/40 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700 opacity-50"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-12 h-12 bg-amber-600 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                                <Wallet className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-xs text-muted/60 uppercase tracking-[0.2em] font-black">Balance Value</p>
                                <p className="text-sm font-bold text-foreground">Estimated RWF Worth</p>
                            </div>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <p className="text-6xl font-black text-foreground tracking-tighter">
                                {calculateRwfFromKwh(
                                    Number(currentMeter.balance_kwh),
                                    Number(currentMeter.monthly_units_bought || 0),
                                    currentMeter.category
                                ).toFixed(0)}
                            </p>
                            <p className="text-lg font-black text-muted uppercase">RWF</p>
                        </div>
                        <p className="mt-6 text-[10px] font-bold text-muted uppercase tracking-widest">
                            Inc. 18% VAT
                        </p>
                    </div>
                </div>

                {/* Usage Card */}
                <div className="bg-card rounded-[2.5rem] p-8 border border-border relative overflow-hidden group hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-500">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-100 dark:bg-indigo-900/40 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700 opacity-50"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                                <TrendingUp className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-xs text-muted/60 uppercase tracking-[0.2em] font-black">Credit Used</p>
                                <p className="text-sm font-bold text-foreground">Deducted from balance</p>
                            </div>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <p className="text-6xl font-black text-foreground tracking-tighter">{Number(currentMeter.monthly_units_bought || 0).toFixed(1)}</p>
                            <p className="text-lg font-black text-muted uppercase">kWh</p>
                        </div>
                        <div className="mt-4 flex gap-1 h-1 w-full bg-background rounded-full overflow-hidden">
                            <div className="h-full bg-green-500 transition-all duration-500" style={{ width: `${Math.min(100, (Number(currentMeter.monthly_units_bought) / 20) * 100)}%` }}></div>
                            <div className="h-full bg-amber-500 transition-all duration-500" style={{ width: `${Math.min(100, (Math.max(0, Number(currentMeter.monthly_units_bought) - 20) / 30) * 100)}%` }}></div>
                            <div className="h-full bg-red-500 transition-all duration-500" style={{ width: `${Math.min(100, (Math.max(0, Number(currentMeter.monthly_units_bought) - 50) / 100) * 100)}%` }}></div>
                        </div>
                        <p className="mt-2 text-[10px] font-bold text-muted uppercase tracking-widest">
                            {Number(currentMeter.monthly_units_bought) < 20 ? 'Lifeline Tariff (89 Frw)' :
                                Number(currentMeter.monthly_units_bought) < 50 ? 'Tier 2 (310 Frw)' : 'Standard Tier (369 Frw)'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Primary Action: Purchase Units / Calculator */}
            <div className="max-w-4xl mx-auto w-full">
                <TopUpModule
                    meterId={currentMeter.id}
                    meterCode={currentMeter.meter_code}
                    currentMonthlyUsage={Number(currentMeter.monthly_units_bought || 0)}
                    category={currentMeter.category}
                    onSuccess={handleRefresh}
                />
            </div>

            {/* Meter Details & Status */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
                    <div className="absolute bottom-0 right-0 w-48 h-48 bg-blue-600/10 rounded-full -mb-24 -mr-24 blur-3xl"></div>

                    <div className="flex items-center justify-between mb-10">
                        <div className="flex items-center gap-4">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl ${currentMeter.status === 'ON' ? 'bg-green-500 shadow-green-500/30' : 'bg-red-500 shadow-red-500/30'}`}>
                                <Zap className={`w-7 h-7 text-white ${currentMeter.status === 'ON' ? 'animate-pulse' : ''}`} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Grid Connectivity</p>
                                <p className="text-2xl font-black tracking-tight">System is {currentMeter.status}</p>
                            </div>
                        </div>
                        <div className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border ${currentMeter.status === 'ON' ? 'border-green-500/30 text-green-400 bg-green-500/10' : 'border-red-500/30 text-red-400 bg-red-500/10'}`}>
                            {currentMeter.status}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-white/5">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Hash className="w-3.5 h-3.5 text-blue-400" />
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Meter ID</p>
                            </div>
                            <p className="text-lg font-black text-white">{currentMeter.meter_code}</p>
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Building2 className="w-3.5 h-3.5 text-blue-400" />
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Location</p>
                            </div>
                            <p className="text-lg font-black text-white">{currentMeter.block} • {currentMeter.house_unit}</p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col justify-center">
                    <button
                        onClick={() => router.push('/dashboard/register')}
                        className="w-full py-10 rounded-[2.5rem] border-4 border-dashed border-border text-muted font-black uppercase tracking-widest hover:border-blue-400 hover:text-blue-500 transition-all flex flex-col items-center justify-center gap-4 group"
                    >
                        <div className="p-4 bg-background rounded-2xl group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                            <Plus className="w-8 h-8" />
                        </div>
                        <span>Link Another Meter</span>
                    </button>
                </div>
            </div>

            {/* History Grid */}
            <div className="grid grid-cols-1 gap-8">
                <div className="bg-card rounded-[2.5rem] p-8 border border-border shadow-sm relative overflow-hidden">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-background rounded-2xl flex items-center justify-center text-muted">
                                <History className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-foreground leading-tight">Live Power Feed</h3>
                                <p className="text-xs text-muted font-bold uppercase tracking-wider">Real-time meter telemetry</p>
                            </div>
                        </div>
                        <button
                            onClick={handleRefresh}
                            className={`w-10 h-10 flex items-center justify-center rounded-xl bg-background text-muted hover:text-blue-600 transition-all ${isRefreshing ? 'animate-spin' : ''}`}
                        >
                            <RefreshCw className="w-5 h-5" />
                        </button>
                    </div>

                    {initialReadings && initialReadings.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {initialReadings.map((reading) => (
                                <div key={reading.id} className="p-6 bg-background rounded-[2rem] border border-border/40 hover:border-blue-500/40 transition-all group">
                                    <div className="flex items-center justify-between mb-4">
                                        <p className="text-2xl font-black text-foreground group-hover:text-blue-600 transition-colors">{reading.power?.toFixed(3)} <span className="text-xs">kW</span></p>
                                        <span className="text-[10px] font-black text-muted uppercase tracking-widest">{new Date(reading.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[11px] font-bold text-muted">
                                        <span>{reading.voltage?.toFixed(1)}V</span>
                                        <div className="w-1 h-1 bg-muted/30 rounded-full"></div>
                                        <span>{reading.current?.toFixed(2)}A</span>
                                        <div className="w-1 h-1 bg-muted/30 rounded-full"></div>
                                        <span className="text-muted/60">Bal: {parseFloat(reading.balance_kwh).toFixed(1)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-20 text-center">
                            <Activity className="w-12 h-12 text-muted/20 mx-auto mb-4" />
                            <p className="text-muted font-bold uppercase tracking-widest text-xs">Awaiting first system transmission...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
