'use client'

import { useState } from 'react'
import { login, signup } from '@/app/actions/auth'
import { Zap, Mail, Lock, User, Loader2, ArrowRight, Sparkles } from 'lucide-react'

export default function LoginPage() {
    const [isLogin, setIsLogin] = useState(true)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [message, setMessage] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)
        setMessage(null)

        const formData = new FormData(e.currentTarget)
        const result = (isLogin ? await login(formData) : await signup(formData)) as { error?: string; success?: string } | undefined

        if (result?.error) {
            setError(result.error)
            setIsLoading(false)
        } else if (result?.success) {
            setMessage(result.success)
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-[#F8FAFC] relative overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-500/5 blur-[120px] rounded-full"></div>
            <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-600/5 blur-[120px] rounded-full"></div>

            <div className="max-w-[480px] w-full relative z-10">
                {/* Brand Header */}
                <div className="flex flex-col items-center mb-10 text-center animate-in fade-in slide-in-from-top-4 duration-700">
                    <div className="w-16 h-16 bg-blue-600 rounded-[2rem] flex items-center justify-center mb-6 shadow-2xl shadow-blue-500/20 ring-8 ring-blue-50">
                        <Zap className="text-white w-8 h-8 fill-white/20" />
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Welcome to <span className="text-blue-600">SHECS</span></h1>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Smart Home Electricity Control System</p>
                </div>

                {/* Login/Signup Card */}
                <div className="bg-white p-10 rounded-[3.5rem] shadow-[0_32px_80px_-20px_rgba(0,0,0,0.08)] border border-slate-100 animate-in fade-in zoom-in-95 duration-700 delay-100">
                    <div className="flex bg-slate-50 p-1.5 rounded-2xl mb-10">
                        <button
                            onClick={() => { setIsLogin(true); setError(null); setMessage(null); }}
                            className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${isLogin ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            Sign In
                        </button>
                        <button
                            onClick={() => { setIsLogin(false); setError(null); setMessage(null); }}
                            className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${!isLogin ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            Create Account
                        </button>
                    </div>

                    <div className="mb-8 overflow-hidden">
                        <h2 className="text-2xl font-black text-slate-900 mb-2">
                            {isLogin ? 'Access your portal' : 'Start your journey'}
                        </h2>
                        <p className="text-slate-500 text-sm font-medium">
                            {isLogin ? 'Manage your smart devices with ease.' : 'Join the most advanced electricity control platform.'}
                        </p>
                    </div>

                    {error && (
                        <div className="mb-8 p-4 bg-red-50 border border-red-100 text-red-600 text-xs font-bold rounded-2xl flex items-center gap-3 animate-in shake duration-500">
                            <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                            {error}
                        </div>
                    )}

                    {message && (
                        <div className="mb-8 p-4 bg-green-50 border border-green-100 text-green-600 text-xs font-bold rounded-2xl flex items-center gap-3 animate-in fade-in duration-300">
                            <Sparkles className="w-4 h-4 text-green-500" />
                            {message}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6" suppressHydrationWarning>
                        {!isLogin && (
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Full Name</label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                                    <input
                                        name="fullName"
                                        type="text"
                                        required
                                        className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:text-slate-400"
                                        placeholder="John Doe"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    suppressHydrationWarning
                                    className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:text-slate-400"
                                    placeholder="you@shecs.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                                <input
                                    name="password"
                                    type="password"
                                    required
                                    suppressHydrationWarning
                                    className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:text-slate-400"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full flex items-center justify-center gap-3 py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all active:scale-[0.98] shadow-2xl shadow-blue-600/20 disabled:opacity-50 group ${isLogin ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/40' : 'bg-slate-900 hover:bg-slate-800 text-white shadow-slate-900/40'}`}
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <span>{isLogin ? 'Sign In' : 'Sign Up'}</span>
                                    <ArrowRight className="w-4.5 h-4.5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <p className="mt-10 text-center text-slate-400 font-bold uppercase tracking-widest text-[9px]">
                    &copy; 2026 Smart Home Electricity Control System — Privacy Secured
                </p>
            </div>
        </div>
    )
}
