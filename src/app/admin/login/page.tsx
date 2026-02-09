'use client'

import { useState } from 'react'
import { login } from '@/app/actions/auth'
import { Shield, Zap, Lock, Mail, Loader2, ArrowRight } from 'lucide-react'

export default function AdminLoginPage() {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        const formData = new FormData(e.currentTarget)
        const result = await login(formData) as { error?: string } | undefined

        if (result?.error) {
            setError(result.error)
            setIsLoading(false)
        }
        // Success handled by server action redirect
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-slate-900 overflow-hidden relative">
            {/* Abstract Background Decoration */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-800 blur-[120px] rounded-full"></div>
            </div>

            <div className="max-w-md w-full relative z-10 animate-in fade-in zoom-in-95 duration-700">
                {/* Logo Section */}
                <div className="flex flex-col items-center mb-10 text-center">
                    <div className="w-16 h-16 bg-blue-600 rounded-[2rem] flex items-center justify-center mb-6 shadow-2xl shadow-blue-500/40 border border-blue-400/30">
                        <Shield className="text-white w-8 h-8" />
                    </div>
                    <h1 className="text-4xl font-black text-white tracking-tighter mb-2">SHECS <span className="text-blue-500">ADMIN</span></h1>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Infrastructure Control Panel</p>
                </div>

                {/* Login Card */}
                <div className="bg-white/5 backdrop-blur-2xl p-10 rounded-[3rem] border border-white/10 shadow-3xl">
                    <div className="mb-8">
                        <h2 className="text-xl font-bold text-white mb-2">Administrator Access</h2>
                        <p className="text-slate-400 text-sm font-medium">Please enter your secure credentials to proceed.</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold rounded-2xl flex items-center gap-3">
                            <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Admin Email</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    className="w-full pl-12 pr-5 py-4 bg-white/[0.03] border border-white/10 rounded-2xl text-sm font-bold text-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all placeholder:text-slate-600"
                                    placeholder="admin@shecs.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Security Key</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                                <input
                                    name="password"
                                    type="password"
                                    required
                                    className="w-full pl-12 pr-5 py-4 bg-white/[0.03] border border-white/10 rounded-2xl text-sm font-bold text-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all placeholder:text-slate-600"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-500 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all active:scale-[0.98] shadow-2xl shadow-blue-600/20 disabled:opacity-50 group"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <span>Initialize Access</span>
                                    <ArrowRight className="w-4.5 h-4.5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <div className="mt-8 text-center text-slate-600 uppercase tracking-[0.2em] font-black text-[9px]">
                    Authorized Personnel Only — Session Monitored
                </div>
            </div>
        </div>
    )
}
