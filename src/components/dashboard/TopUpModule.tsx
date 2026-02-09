'use client'

import { useState } from 'react'
import { Wallet, Landmark, Zap, Loader2, CheckCircle2 } from 'lucide-react'
import { performTopUp } from '@/app/actions/meters'
import { toast } from 'sonner'

interface TopUpModuleProps {
    meterId: string
    meterCode: string
    currentMonthlyUsage?: number
    category?: 'residential' | 'commercial'
    onSuccess: () => void
}

export function TopUpModule({ meterId, meterCode, currentMonthlyUsage = 0, category = 'residential', onSuccess }: TopUpModuleProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [result, setResult] = useState<{ token: string; kwh: string; taxes: string } | null>(null)
    const [amount, setAmount] = useState('')

    const calculateEstimatedKwh = (val: string) => {
        const money = Number(val)
        if (!money || money <= 0) return 0

        const VAT_RATE = 0.18
        let moneyRemaining = money / (1 + VAT_RATE)
        let estimatedKwh = 0
        let tempUsage = currentMonthlyUsage

        const tiers = category === 'residential'
            ? [{ min: 0, max: 20, price: 89 }, { min: 20, max: 50, price: 310 }, { min: 50, max: 999999, price: 369 }]
            : [{ min: 0, max: 100, price: 355 }, { min: 100, max: 999999, price: 376 }]

        for (const tier of tiers) {
            if (moneyRemaining <= 0) break
            if (tempUsage < tier.max) {
                const availableInTier = tier.max - tempUsage
                const costForFullTier = availableInTier * tier.price
                if (moneyRemaining >= costForFullTier) {
                    estimatedKwh += availableInTier
                    moneyRemaining -= costForFullTier
                    tempUsage += availableInTier
                } else {
                    estimatedKwh += moneyRemaining / tier.price
                    moneyRemaining = 0
                }
            }
        }
        return estimatedKwh
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!meterId) {
            toast.error('Please select a meter first')
            return
        }

        setIsLoading(true)
        try {
            const res = await performTopUp({
                meter_id: meterId,
                amount_paid: Number(amount)
            })
            setResult(res)
            toast.success('Credit generated successfully!')

            // Delay reload to allow user to see success message
            setTimeout(() => {
                onSuccess()
            }, 2000)
        } catch (error: any) {
            toast.error(error.message || 'Failed to generate credit')
        } finally {
            setIsLoading(false)
        }
    }

    if (result) {
        return (
            <div className="bg-card rounded-[2.5rem] border border-border p-8 shadow-sm animate-in zoom-in-95 duration-500">
                <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-[2rem] flex items-center justify-center text-green-600 dark:text-green-400 mb-6 border border-green-200/50">
                        <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-black text-foreground mb-2">Purchase Confirmed</h2>
                    <p className="text-sm font-medium text-muted mb-8">Generated {result.kwh} kWh for your meter</p>

                    <div className="w-full bg-background rounded-2xl border border-border p-6 mb-8 text-center">
                        <p className="text-[10px] font-black text-muted uppercase tracking-widest mb-1">Units Added</p>
                        <p className="text-3xl font-black text-foreground">{result.kwh} kWh</p>
                    </div>

                    <button
                        onClick={() => { setResult(null); setAmount(''); }}
                        className="text-muted font-black text-[10px] uppercase tracking-[0.2em] hover:text-blue-600 transition-colors"
                    >
                        Buy More Units
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-card rounded-[2.5rem] border border-border p-8 shadow-sm text-foreground">
            <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/40 rounded-2xl flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-sm border border-amber-200/50">
                    <Wallet className="w-6 h-6" />
                </div>
                <div>
                    <h2 className="text-xl font-black text-foreground leading-tight">Purchased Electricity</h2>
                    <p className="text-[10px] text-muted font-bold uppercase tracking-wider mt-1">STS Certified Token Generation</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-black text-muted uppercase tracking-widest pl-1">Amount to Pay (RWF)</label>
                        <div className="relative group">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-black text-muted group-focus-within:text-amber-500 transition-colors">RWF</span>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="Enter amount (e.g. 5000)"
                                className="w-full pl-16 pr-5 py-5 bg-background border border-border rounded-2xl text-lg font-black text-foreground focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all placeholder:text-muted/40"
                                required
                            />
                        </div>
                    </div>

                    {amount && Number(amount) > 0 && (
                        <div className="p-6 bg-blue-600 rounded-[2rem] text-white shadow-xl shadow-blue-500/20 animate-in slide-in-from-top-4 duration-500 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>

                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-4 opacity-80">
                                    <Zap className="w-4 h-4" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Calculated Units (kWh)</span>
                                </div>
                                <div className="flex items-baseline gap-2 mb-4">
                                    <p className="text-4xl font-black tracking-tighter">
                                        {calculateEstimatedKwh(amount).toFixed(2)}
                                    </p>
                                    <p className="text-sm font-black uppercase opacity-60">kWh</p>
                                </div>

                                <div className="pt-4 border-t border-white/10 space-y-2">
                                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                                        <span className="opacity-60">Tariff Category</span>
                                        <span>{category}</span>
                                    </div>
                                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                                        <span className="opacity-60">Consumption Band</span>
                                        <span>{currentMonthlyUsage > 50 ? 'Tier 3' : currentMonthlyUsage > 20 ? 'Tier 2' : 'Lifeline'}</span>
                                    </div>
                                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                                        <span className="opacity-60">VAT (18%)</span>
                                        <span>Included</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 px-6 py-5 rounded-2xl text-sm font-black text-white bg-amber-500 hover:bg-amber-600 shadow-lg shadow-amber-500/25 transition-all active:scale-[0.97] disabled:opacity-50"
                >
                    {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <>
                            <CheckCircle2 className="w-5 h-5" />
                            <span>Add Credit</span>
                        </>
                    )}
                </button>
            </form>
        </div>
    )
}
