'use client'

import React, { useState, useMemo, useEffect } from 'react'
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
    id: string;
    created_at: string;
    amount_paid: number;
    kwh_bought: number;
}

interface ChartProps {
    rawTopups: TopUp[];
}

export function InsightsCharts({ rawTopups }: ChartProps) {
    const [range, setRange] = useState<'Day' | 'Week' | 'Month'>('Week')
    const { resolvedTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const chartData = useMemo(() => {
        const now = new Date()
        const data: { name: string; rwf: number; kwh: number }[] = []

        if (range === 'Day') {
            for (let i = 23; i >= 0; i--) {
                const hour = new Date(now.getTime() - i * 60 * 60 * 1000)
                const label = hour.getHours() + ':00'
                const hourTopups = rawTopups.filter(t => {
                    const tDate = new Date(t.created_at)
                    return tDate > new Date(hour.getTime() - 60 * 60 * 1000) && tDate <= hour
                })
                data.push({
                    name: label,
                    rwf: hourTopups.reduce((sum, t) => sum + Number(t.amount_paid), 0),
                    kwh: hourTopups.reduce((sum, t) => sum + Number(t.kwh_bought || 0), 0)
                })
            }
        } else if (range === 'Week') {
            for (let i = 6; i >= 0; i--) {
                const day = new Date(now)
                day.setDate(now.getDate() - i)
                const label = day.toLocaleDateString('en-US', { weekday: 'short' })
                const dayTopups = rawTopups.filter(t => {
                    const tDate = new Date(t.created_at)
                    return tDate.toDateString() === day.toDateString()
                })
                data.push({
                    name: label,
                    rwf: dayTopups.reduce((sum, t) => sum + Number(t.amount_paid), 0),
                    kwh: dayTopups.reduce((sum, t) => sum + Number(t.kwh_bought || 0), 0)
                })
            }
        } else {
            for (let i = 29; i >= 0; i--) {
                const day = new Date(now)
                day.setDate(now.getDate() - i)
                const label = day.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
                const dayTopups = rawTopups.filter(t => {
                    const tDate = new Date(t.created_at)
                    return tDate.toDateString() === day.toDateString()
                })
                data.push({
                    name: label,
                    rwf: dayTopups.reduce((sum, t) => sum + Number(t.amount_paid), 0),
                    kwh: dayTopups.reduce((sum, t) => sum + Number(t.kwh_bought || 0), 0)
                })
            }
        }
        return data
    }, [rawTopups, range])

    if (!mounted) return null

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Area Chart (Left) */}
            <div className="lg:col-span-2 bg-card rounded-[2.5rem] border border-border p-8 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
                    <div>
                        <div className="flex items-center gap-4 mb-1">
                            <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                                <span className="text-sm font-black text-foreground">Purchased Electricity (RWF)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-cyan-400"></div>
                                <span className="text-sm font-black text-muted">Energy Added (kWh)</span>
                            </div>
                        </div>
                        <p className="text-xs text-muted font-bold uppercase tracking-widest pl-1">Weekly Purchase vs Consumption Trend</p>
                    </div>
                    <div className="flex bg-slate-50 dark:bg-slate-900/50 p-1 rounded-xl border border-slate-100 dark:border-slate-800">
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
                </div>

                <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={chartData}
                            syncId="insights"
                            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                        >
                            <defs>
                                <linearGradient id="colorRwf" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorKwh" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.15} />
                                    <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.4} />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: 'var(--muted)', fontSize: 10, fontWeight: 700 }}
                                dy={15}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: 'var(--muted)', fontSize: 10, fontWeight: 700 }}
                                tickFormatter={(val) => val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val}
                            />
                            <Tooltip
                                contentStyle={{
                                    borderRadius: '1.5rem',
                                    backgroundColor: 'var(--card)',
                                    border: '1px solid var(--border)',
                                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                                    padding: '1rem'
                                }}
                                labelStyle={{ fontWeight: 900, color: 'var(--foreground)', marginBottom: '0.5rem' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="rwf"
                                stroke="#3b82f6"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorRwf)"
                                dot={{ fill: '#3b82f6', r: 4, strokeWidth: 2, stroke: 'var(--card)' }}
                                activeDot={{ r: 6, strokeWidth: 0 }}
                                name="RWF"
                            />
                            <Area
                                type="monotone"
                                dataKey="kwh"
                                stroke="#22d3ee"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorKwh)"
                                dot={{ fill: '#22d3ee', r: 4, strokeWidth: 2, stroke: 'var(--card)' }}
                                activeDot={{ r: 6, strokeWidth: 0 }}
                                name="kWh"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Side Bar Chart (Right) */}
            <div className="bg-card rounded-[2.5rem] border border-border p-8 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-10">
                    <div>
                        <h3 className="text-xl font-black text-foreground leading-tight">Daily Purchases</h3>
                        <p className="text-[10px] text-muted font-bold uppercase tracking-widest mt-1">Activity per day</p>
                    </div>
                    <select className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-[10px] font-black uppercase rounded-lg px-2 py-1 outline-none text-slate-500 dark:text-slate-400">
                        <option>This Week</option>
                    </select>
                </div>

                <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} syncId="insights">
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.4} />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: 'var(--muted)', fontSize: range === 'Month' ? 8 : 10, fontWeight: 700 }}
                                dy={10}
                                interval={range === 'Month' ? 4 : 0}
                            />
                            <Tooltip
                                cursor={{ fill: 'var(--border)', opacity: 0.1 }}
                                contentStyle={{
                                    borderRadius: '1.25rem',
                                    backgroundColor: 'var(--card)',
                                    border: '1px solid var(--border)',
                                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                    padding: '0.75rem'
                                }}
                                labelStyle={{ fontWeight: 900, color: 'var(--foreground)' }}
                            />
                            <Bar
                                dataKey="rwf"
                                radius={[6, 6, 6, 6]}
                                barSize={range === 'Month' ? 8 : 12}
                                name="RWF"
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={index === chartData.length - 1 ? '#3b82f6' : 'var(--muted)'} fillOpacity={index === chartData.length - 1 ? 1 : 0.2} />
                                ))}
                            </Bar>
                            <Bar
                                dataKey="kwh"
                                radius={[6, 6, 6, 6]}
                                barSize={range === 'Month' ? 8 : 12}
                                name="kWh"
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={index === chartData.length - 1 ? '#22d3ee' : 'var(--muted)'} fillOpacity={index === chartData.length - 1 ? 1 : 0.2} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    )
}
