'use client'

import { useState } from 'react'
import { loadToken } from '@/app/actions/tokens'
import { CreditCard, Loader2 } from 'lucide-react'

export function TokenLoader() {
    const [token, setToken] = useState('')
    const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null)
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!token) return

        setLoading(true)
        setStatus(null)

        const res = await loadToken(token)

        setLoading(false)
        if (res?.error) {
            setStatus({ type: 'error', msg: res.error })
        } else {
            setStatus({ type: 'success', msg: `Successfully loaded ${res?.amount} kWh!` })
            setToken('')
        }
    }

    return (
        <div className="card p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Load Electricity Token</h3>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <input
                        type="text"
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                        placeholder="Enter 16-digit code"
                        className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-slate-900 placeholder:text-slate-400 font-mono"
                        maxLength={16}
                    />
                </div>
                <button
                    disabled={loading}
                    type="submit"
                    className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Processing...
                        </>
                    ) : (
                        'Load Token'
                    )}
                </button>
            </form>
            {status && (
                <div className={`mt-4 p-4 rounded-xl text-sm font-semibold border ${status.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
                    }`}>
                    {status.msg}
                </div>
            )}
        </div>
    )
}
