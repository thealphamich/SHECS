'use client'

import { useState, useEffect } from 'react'
import { Plus, Building2, Home, Hash, Loader2, CheckCircle2, Zap, Wallet, Battery } from 'lucide-react'
import { registerMeter } from '@/app/actions/meters'
import { toast } from 'sonner'
import { calculateKwhFromRwf, calculateRwfFromKwh } from '@/lib/tariff-calculator'

interface MeterRegistrationProps {
    onSuccess: () => void
}

export function MeterRegistration({ onSuccess }: MeterRegistrationProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        block: '',
        house_unit: '',
        meter_code: '',
        category: 'residential',
        balance_kwh: '',
        balance_rwf: ''
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        try {
            await registerMeter({
                ...formData,
                balance_kwh: Number(formData.balance_kwh) || 0,
                balance_rwf: Number(formData.balance_rwf) || 0
            })
            toast.success('Meter registered successfully!')
            setFormData({ block: '', house_unit: '', meter_code: '', category: 'residential', balance_kwh: '', balance_rwf: '' })
            onSuccess()
        } catch (error: any) {
            toast.error(error.message || 'Failed to register meter')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="bg-card rounded-[2.5rem] border border-border p-8 shadow-sm">
            <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <Plus className="w-6 h-6" />
                </div>
                <div>
                    <h2 className="text-xl font-black text-foreground leading-tight">Register Meter</h2>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-muted font-bold uppercase tracking-wider">Green Hills Academy</span>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Category Selection Removed - Defaulting to Residential */}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Block */}
                    <div className="space-y-2">
                        <label className="text-xs font-black text-muted uppercase tracking-widest pl-1">Block</label>
                        <div className="relative group">
                            <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted group-focus-within:text-blue-500 transition-colors" />
                            <input
                                type="text"
                                value={formData.block}
                                onChange={(e) => setFormData({ ...formData, block: e.target.value })}
                                placeholder="e.g. Block A"
                                className="w-full pl-12 pr-5 py-4 bg-background border border-border rounded-2xl text-sm font-bold text-foreground focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:text-muted"
                                required
                            />
                        </div>
                    </div>

                    {/* House/Unit */}
                    <div className="space-y-2">
                        <label className="text-xs font-black text-muted uppercase tracking-widest pl-1">House / Unit</label>
                        <div className="relative group">
                            <Home className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted group-focus-within:text-blue-600 transition-colors" />
                            <input
                                type="text"
                                value={formData.house_unit}
                                onChange={(e) => setFormData({ ...formData, house_unit: e.target.value })}
                                placeholder="e.g. Unit 102"
                                className="w-full pl-12 pr-5 py-4 bg-background border border-border rounded-2xl text-sm font-bold text-foreground focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:text-muted"
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* Meter Number */}
                <div className="space-y-2">
                    <label className="text-xs font-black text-muted uppercase tracking-widest pl-1">Meter Number (Unique)</label>
                    <div className="relative group">
                        <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted group-focus-within:text-blue-500 transition-colors" />
                        <input
                            type="text"
                            value={formData.meter_code}
                            onChange={(e) => setFormData({ ...formData, meter_code: e.target.value })}
                            placeholder="e.g. GH-9921-X"
                            className="w-full pl-12 pr-5 py-4 bg-background border border-border rounded-2xl text-sm font-bold text-foreground focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:text-muted"
                            required
                        />
                    </div>
                </div>

                {/* Initial Balance Section */}
                <div className="pt-6 border-t border-border/60 space-y-6">
                    <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-amber-500" />
                        <h3 className="text-xs font-black text-muted uppercase tracking-widest">Initial Balance</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Balance in RWF - LEFT SIDE */}
                        <div className="space-y-2">
                            <label className="text-xs font-black text-muted uppercase tracking-widest pl-1">Balance in RWF</label>
                            <div className="relative group">
                                <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted group-focus-within:text-amber-500 transition-colors" />
                                <input
                                    type="number"
                                    step="1"
                                    min="0"
                                    value={formData.balance_rwf}
                                    onChange={(e) => {
                                        const rwf = e.target.value
                                        setFormData({ ...formData, balance_rwf: rwf })
                                        // Auto-calculate kWh from RWF
                                        if (rwf && Number(rwf) > 0) {
                                            const { kwh } = calculateKwhFromRwf(Number(rwf), 0, formData.category as 'residential' | 'commercial')
                                            setFormData(prev => ({ ...prev, balance_kwh: kwh.toFixed(2), balance_rwf: rwf }))
                                        }
                                    }}
                                    placeholder="e.g. 5000"
                                    className="w-full pl-12 pr-5 py-4 bg-background border border-border rounded-2xl text-sm font-bold text-foreground focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all placeholder:text-muted"
                                    required
                                />
                            </div>
                            <p className="text-[10px] text-muted font-medium pl-1">Auto-converts to kWh using RURA tariffs</p>
                        </div>

                        {/* Balance in kWh - RIGHT SIDE */}
                        <div className="space-y-2">
                            <label className="text-xs font-black text-muted uppercase tracking-widest pl-1">Balance in kWh</label>
                            <div className="relative group">
                                <Battery className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted group-focus-within:text-blue-500 transition-colors" />
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={formData.balance_kwh}
                                    onChange={(e) => {
                                        const kwh = e.target.value
                                        setFormData({ ...formData, balance_kwh: kwh })
                                        // Auto-calculate RWF from kWh if valid
                                        if (kwh && Number(kwh) > 0) {
                                            const rwf = calculateRwfFromKwh(Number(kwh), 0, formData.category as 'residential' | 'commercial')
                                            setFormData(prev => ({ ...prev, balance_kwh: kwh, balance_rwf: rwf.toFixed(0) }))
                                        }
                                    }}
                                    placeholder="e.g. 20.7"
                                    className="w-full pl-12 pr-5 py-4 bg-background border border-border rounded-2xl text-sm font-bold text-foreground focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:text-muted"
                                    required
                                />
                            </div>
                            <p className="text-[10px] text-muted font-medium pl-1">Electricity units remaining</p>
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 px-6 py-5 rounded-2xl text-sm font-black text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/25 transition-all active:scale-[0.97] disabled:opacity-50"
                >
                    {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <>
                            <CheckCircle2 className="w-5 h-5" />
                            <span>Link Meter to Profile</span>
                        </>
                    )}
                </button>
            </form>
        </div>
    )
}
