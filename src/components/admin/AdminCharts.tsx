'use client'

import React, { useMemo, useState, useEffect } from 'react'
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell
} from 'recharts'
import { useTheme } from 'next-themes'

interface TopUp {
    created_at: string;
    amount_paid: number;
    kwh_bought: number;
}

interface Meter {
    id: string;
    created_at: string;
    status: string;
}

interface AdminChartsProps {
    meters: Meter[];
    topups: TopUp[];
    currentTotalKwh: number;
    currentTotalRwf: number;
}

export function AdminCharts({ meters, topups, currentTotalKwh, currentTotalRwf }: AdminChartsProps) {
    const [range, setRange] = useState<'Day' | 'Week' | 'Month'>('Week')
    const { resolvedTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const trendData = useMemo(() => {
        const data: { name: string; kwh: number; rwf: number; activeMeters: number }[] = []
        const now = new Date()

        let steps = 0
        let stepMs = 0

        if (range === 'Day') {
            steps = 24
            stepMs = 60 * 60 * 1000 // Hourly
        } else if (range === 'Week') {
            steps = 7
            stepMs = 24 * 60 * 60 * 1000 // Daily
        } else {
            steps = 30
            stepMs = 24 * 60 * 60 * 1000 // Daily
        }

        for (let i = steps - 1; i >= 0; i--) {
            const pointTime = new Date(now.getTime() - i * stepMs)
            let label = ''

            if (range === 'Day') {
                label = pointTime.getHours() + ':00'
            } else if (range === 'Week') {
                label = pointTime.toLocaleDateString('en-US', { weekday: 'short' })
            } else {
                label = pointTime.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
            }

            const activeAtPoint = meters.filter(m => {
                const mDate = new Date(m.created_at)
                return mDate <= pointTime && m.status === 'ON'
            }).length

            const topupsAfter = topups.filter(t => new Date(t.created_at) > pointTime)
            const kwhAtPoint = Math.max(0, currentTotalKwh - topupsAfter.reduce((s, t) => s + (t.kwh_bought || 0), 0))
            const rwfAtPoint = Math.max(0, currentTotalRwf - topupsAfter.reduce((s, t) => s + (t.amount_paid || 0), 0))

            data.push({
                name: label,
                kwh: Number(kwhAtPoint.toFixed(1)),
                rwf: Number(rwfAtPoint.toFixed(0)),
                activeMeters: activeAtPoint
            })
        }
        return data
    }, [meters, topups, currentTotalKwh, currentTotalRwf, range])

    if (!mounted) return null

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Range Selector */}
            <div className="flex bg-slate-50 dark:bg-slate-900/50 p-1 rounded-xl border border-slate-100 dark:border-slate-800 w-fit">
                {(['Day', 'Week', 'Month'] as const).map((t) => (
                    <button
                        key={t}
                        onClick={() => setRange(t)}
                        className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${range === t ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200 dark:border-slate-700' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                    >
                        {t}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* System Balance Trend */}
                <div className="bg-card rounded-[2.5rem] border border-border p-8 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-blue-900/10 transition-all duration-500 group">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)] animate-pulse"></div>
                                <h3 className="text-xl font-black text-foreground leading-tight">System Liquidity</h3>
                            </div>
                            <p className="text-[10px] text-muted font-bold uppercase tracking-widest pl-4">kWh & RWF Circulation Trend</p>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] font-black text-amber-600 uppercase">Interactive</span>
                            <div className="w-8 h-1 bg-amber-100 dark:bg-amber-900/30 rounded-full mt-1"></div>
                        </div>
                    </div>

                    <div className="h-[320px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trendData} syncId="adminDashboard">
                                <defs>
                                    <linearGradient id="adminKwh" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.15} />
                                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="adminRwf" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.15} />
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.4} />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'var(--muted)', fontSize: range === 'Month' ? 8 : 10, fontWeight: 700 }}
                                    dy={10}
                                    interval={range === 'Month' ? 3 : range === 'Day' ? 2 : 0}
                                />
                                <YAxis hide />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: '1.5rem',
                                        backgroundColor: 'var(--card)',
                                        border: '1px solid var(--border)',
                                        boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                                        padding: '1.5rem'
                                    }}
                                    labelStyle={{ fontWeight: 900, color: 'var(--foreground)', marginBottom: '0.8rem' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="kwh"
                                    stroke="#f59e0b"
                                    strokeWidth={3}
                                    fill="url(#adminKwh)"
                                    name="Total kWh"
                                    dot={{ fill: '#f59e0b', r: 4, strokeWidth: 2, stroke: 'var(--card)' }}
                                    activeDot={{ r: 6, strokeWidth: 0 }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="rwf"
                                    stroke="#8b5cf6"
                                    strokeWidth={3}
                                    fill="url(#adminRwf)"
                                    name="Total RWF"
                                    dot={{ fill: '#8b5cf6', r: 4, strokeWidth: 2, stroke: 'var(--card)' }}
                                    activeDot={{ r: 6, strokeWidth: 0 }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Active Meters Growth */}
                <div className="bg-card rounded-[2.5rem] border border-border p-8 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-green-900/10 transition-all duration-500 group">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.3)]"></div>
                                <h3 className="text-xl font-black text-foreground leading-tight">Network Growth</h3>
                            </div>
                            <p className="text-[10px] text-muted font-bold uppercase tracking-widest pl-4">Active Meters Expansion Trend</p>
                        </div>
                        <div className="flex bg-slate-50 dark:bg-slate-800/50 px-3 py-1.5 rounded-xl border border-slate-100 dark:border-slate-800">
                            <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase">Live Metrics</span>
                        </div>
                    </div>

                    <div className="h-[320px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={trendData} syncId="adminDashboard">
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.4} />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'var(--muted)', fontSize: range === 'Month' ? 8 : 10, fontWeight: 700 }}
                                    dy={10}
                                    interval={range === 'Month' ? 3 : range === 'Day' ? 2 : 0}
                                />
                                <Tooltip
                                    cursor={{ fill: 'var(--border)', opacity: 0.1, radius: 8 }}
                                    contentStyle={{
                                        borderRadius: '1.25rem',
                                        backgroundColor: 'var(--card)',
                                        border: '1px solid var(--border)',
                                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                                        padding: '1rem'
                                    }}
                                    labelStyle={{ fontWeight: 900, color: 'var(--foreground)' }}
                                />
                                <Bar
                                    dataKey="activeMeters"
                                    fill="#22c55e"
                                    radius={[8, 8, 8, 8]}
                                    barSize={range === 'Month' ? 6 : 20}
                                    name="Active Meters"
                                >
                                    {trendData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={index === trendData.length - 1 ? '#22c55e' : 'var(--muted)'}
                                            fillOpacity={index === trendData.length - 1 ? 1 : 0.2}
                                            className="transition-all duration-500 hover:opacity-80"
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    )
}
